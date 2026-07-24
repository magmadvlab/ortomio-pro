BEGIN;

CREATE TABLE IF NOT EXISTS public.garden_task_archive (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL UNIQUE,
  garden_id uuid NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_payload jsonb NOT NULL,
  archived_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.garden_task_archive ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS garden_task_archive_owner_read ON public.garden_task_archive;
CREATE POLICY garden_task_archive_owner_read
  ON public.garden_task_archive
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

GRANT SELECT ON public.garden_task_archive TO authenticated;

CREATE OR REPLACE FUNCTION public.archive_completed_garden_task(target_task_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  source_task public.garden_tasks%ROWTYPE;
  owner_id uuid;
BEGIN
  SELECT * INTO source_task
  FROM public.garden_tasks
  WHERE id = target_task_id
  FOR UPDATE;

  IF NOT FOUND OR source_task.completed IS NOT TRUE THEN
    RAISE EXCEPTION 'Completed task not found';
  END IF;

  SELECT user_id INTO owner_id
  FROM public.gardens
  WHERE id = source_task.garden_id AND user_id = auth.uid();

  IF owner_id IS NULL THEN
    RAISE EXCEPTION 'Task archive access denied';
  END IF;

  INSERT INTO public.garden_task_archive(task_id, garden_id, user_id, task_payload)
  VALUES (source_task.id, source_task.garden_id, owner_id, to_jsonb(source_task));

  DELETE FROM public.garden_tasks WHERE id = source_task.id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.archive_completed_garden_task(uuid) TO authenticated;

COMMIT;
