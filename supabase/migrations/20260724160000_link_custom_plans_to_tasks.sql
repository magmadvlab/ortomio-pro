BEGIN;

ALTER TABLE public.garden_tasks
  ADD COLUMN IF NOT EXISTS custom_plan_id uuid
  REFERENCES public.custom_plans(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_garden_tasks_custom_plan
  ON public.garden_tasks(custom_plan_id)
  WHERE custom_plan_id IS NOT NULL;

COMMIT;
