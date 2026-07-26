begin;

alter table public.seedling_batches
  add column if not exists source text not null default 'home',
  add column if not exists purchase_date date,
  add column if not exists nursery_name text;

alter table public.seedling_batches
  drop constraint if exists seedling_batches_source_check;

alter table public.seedling_batches
  add constraint seedling_batches_source_check
  check (source in ('home', 'nursery'));

comment on column public.seedling_batches.source is
  'Origine del batch: home per semina interna, nursery per piantine acquistate.';
comment on column public.seedling_batches.purchase_date is
  'Data di acquisto per i batch provenienti da vivaio.';
comment on column public.seedling_batches.nursery_name is
  'Nome facoltativo del vivaio fornitore.';

commit;
