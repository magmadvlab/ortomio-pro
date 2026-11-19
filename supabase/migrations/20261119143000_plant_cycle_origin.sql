-- Preserve the recorded starting material and observations used by the Director.
alter table public.garden_plants
  add column if not exists source text check (source in ('seed','nursery','transplant')),
  add column if not exists transplant_date date,
  add column if not exists source_vivaio text,
  add column if not exists stage text,
  add column if not exists planting_context jsonb,
  add column if not exists greenhouse_conditions jsonb,
  add column if not exists greenhouse_bench_id uuid,
  add column if not exists bench_row_number integer,
  add column if not exists position_in_bench_row integer,
  add column if not exists field_row_name text,
  add column if not exists bench_name text,
  add column if not exists operations jsonb,
  add column if not exists orchestrator_enabled boolean;
