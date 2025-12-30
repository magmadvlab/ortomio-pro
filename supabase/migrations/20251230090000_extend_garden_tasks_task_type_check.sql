ALTER TABLE public.garden_tasks
  DROP CONSTRAINT IF EXISTS garden_tasks_task_type_check;

ALTER TABLE public.garden_tasks
  ADD CONSTRAINT garden_tasks_task_type_check
  CHECK (task_type IN (
    'Sowing',
    'Transplant',
    'Fertilize',
    'Prune',
    'Harvest',
    'Treatment',
    'Plowing',
    'Tilling',
    'TreePruning',
    'Clearing',
    'Mulching'
  ));
