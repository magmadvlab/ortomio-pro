-- Preserve manual row watering even when no irrigation system serves the row.
alter table public.watering_logs alter column zone_id drop not null;
alter table public.watering_logs add constraint watering_logs_target_required
  check (zone_id is not null or field_row_id is not null or bed_row_id is not null);
create policy "Owners can record watering on their manual rows" on public.watering_logs
  for all to authenticated using (
    zone_id is null and exists (select 1 from public.gardens g where g.id = watering_logs.garden_id and g.user_id = auth.uid())
    and (exists (select 1 from public.field_rows r where r.id = watering_logs.field_row_id and r.garden_id = watering_logs.garden_id)
      or exists (select 1 from public.garden_rows r join public.garden_zones z on z.id = r.garden_zone_id
        where r.id = watering_logs.bed_row_id and z.garden_id = watering_logs.garden_id))
  );

alter table public.treatment_register add column if not exists certification_compliance text[];
alter table public.fertilizer_application_logs
  alter column user_id set default auth.uid(),
  add column if not exists fertilizer_product_id text,
  add column if not exists growth_phase text,
  add column if not exists next_application_date date,
  add column if not exists frequency_days integer,
  drop constraint fertilizer_application_logs_application_method_check,
  add check (application_method in ('broadcast','band','foliar','fertigation','manual','incorporated','surface')),
  drop constraint fertilizer_application_logs_fertilizer_type_check,
  add check (fertilizer_type in ('organic','chemical','mineral','mixed','corrective','microelement'));

-- Aggregate only visible executions. Grouping retains product, unit and row.
create or replace function public.field_operation_totals(p_garden uuid, p_start date, p_end date)
returns table (kind text, field_row_id uuid, bed_row_id uuid, product text, unit text,
               executions bigint, total numeric)
language sql stable security invoker set search_path = '' as $$
  select kind, field_row_id, bed_row_id, product, unit, count(*), case when unit in ('L','g','kg','ml','m²') then sum(amount) end from (
    select 'watering' as kind, field_row_id, bed_row_id, null::text as product, 'L' as unit, liters_applied as amount
    from public.watering_logs where garden_id=p_garden and completed and date between p_start and p_end
    union all
    select 'work', field_row_id, bed_row_id, work_type, 'm²', area_m2
    from public.mechanical_work_register where garden_id=p_garden and work_date between p_start and p_end
    union all
    select 'fertilizing', field_row_id, bed_row_id, fertilizer_name, dosage_unit, dosage
    from public.fertilizer_application_logs where garden_id=p_garden and application_date between p_start and p_end
    union all
    select 'treatment', field_row_id, bed_row_id, product_name, dosage_unit, dosage
    from public.treatment_register where garden_id=p_garden and treatment_date between p_start and p_end
    union all
    select op.operation_type, plant.field_row_id, null::uuid, op.product_name, op.unit, op.quantity
    from public.individual_plant_operations op
    left join public.garden_plants plant on plant.id::text=op.plant_id::text and plant.garden_id=op.garden_id
    where op.garden_id=p_garden and op.operation_date between p_start and p_end
      and op.parent_operation_id is null and op.operation_type in ('watering','fertilizing','treatment','work')
  ) records group by 1,2,3,4,5 order by 1,2,3,4,5
$$;
revoke all on function public.field_operation_totals(uuid,date,date) from public, anon;
grant execute on function public.field_operation_totals(uuid,date,date) to authenticated, service_role;

-- Keep the existing list of supported work types when extending it.
do $$
declare existing_rule text;
begin
  select pg_get_expr(conbin,conrelid) into strict existing_rule from pg_constraint
    where conrelid='public.mechanical_work_register'::regclass and conname='mechanical_work_register_work_type_check';
  alter table public.mechanical_work_register drop constraint mechanical_work_register_work_type_check;
  execute format('alter table public.mechanical_work_register add constraint mechanical_work_register_work_type_check check ((%s) or work_type=%L)',existing_rule,'Weeding');
end $$;

create or replace function public.field_feedback_summary(p_garden uuid, p_start date, p_end date)
returns table (measured_records bigint, recorded_work_cost numeric)
language sql stable security invoker set search_path = '' as $$
  select count(*), sum(case when item->>'operation'='mechanical_work'
    and jsonb_typeof(item->'metrics'->'actualCost')='number' then (item->'metrics'->>'actualCost')::numeric end)
  from public.profiles p cross join lateral jsonb_array_elements(
    case when jsonb_typeof(p.preferences->('agronomic_measured_feedback:'||p_garden))='array'
      then p.preferences->('agronomic_measured_feedback:'||p_garden) else '[]'::jsonb end
  ) item
  where p.id=(select g.user_id from public.gardens g where g.id=p_garden) and item->>'gardenId'=p_garden::text and
    left(item->>'recordedAt',10) between p_start::text and p_end::text
$$;
revoke all on function public.field_feedback_summary(uuid,date,date) from public, anon;
grant execute on function public.field_feedback_summary(uuid,date,date) to authenticated, service_role;

-- The planner can retry after recording a dose but before marking its plan complete.
alter table public.treatment_register add column planner_execution_id text,
  add unique (garden_id, planner_execution_id);
alter table public.fertilizer_application_logs add column planner_execution_id text,
  add unique (garden_id, planner_execution_id);
