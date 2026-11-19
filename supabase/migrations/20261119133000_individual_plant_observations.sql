alter table public.plant_photos add column field_row_id uuid, add column garden_row_id uuid,
  add column plant_code text, add column position_in_row integer;
create function public.locate_plant_photo() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
  select p.field_row_id,p.garden_row_id,p.plant_code,p.position_in_row
    into strict new.field_row_id,new.garden_row_id,new.plant_code,new.position_in_row
    from public.garden_plants p where p.id=new.plant_id and p.garden_id=new.garden_id;
  return new;
end;
$$;
create trigger locate_plant_photo before insert or update of plant_id,garden_id on public.plant_photos
for each row execute function public.locate_plant_photo();
create index on public.plant_photos (garden_id,plant_id,captured_at desc);

create function public.record_plant_health_observation(p_plant uuid, p_score integer, p_notes text)
returns void language plpgsql security invoker set search_path='' as $$
declare target public.garden_plants%rowtype;
begin
  if p_score is null or p_score not between 0 and 100 then raise exception 'invalid_health_score'; end if;
  select p.* into strict target from public.garden_plants p join public.gardens g on p.garden_id=g.id
    where p.id=p_plant and g.user_id=auth.uid() for update of p;
  insert into public.individual_plant_operations(garden_id,plant_id,operation_type,operation_date,operation_time,
    notes,source_type,actor_type,operation_context)
    values(target.garden_id,p_plant::text,'health',current_date,localtime,p_notes,'manual','manual',
      jsonb_build_object('fieldRowId',target.field_row_id,'gardenRowId',target.garden_row_id,
        'healthScoreBefore',target.health_score,'healthScoreAfter',p_score));
  update public.garden_plants set health_score=p_score where id=p_plant;
end;
$$;
revoke all on function public.record_plant_health_observation(uuid,integer,text) from public,anon;
grant execute on function public.record_plant_health_observation(uuid,integer,text) to authenticated;
