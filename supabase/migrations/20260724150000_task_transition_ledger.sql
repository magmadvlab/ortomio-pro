BEGIN;

ALTER TABLE public.garden_tasks
  ADD COLUMN IF NOT EXISTS operational_status text,
  ADD COLUMN IF NOT EXISTS status_reason text,
  ADD COLUMN IF NOT EXISTS status_changed_at timestamptz;

UPDATE public.garden_tasks
SET operational_status = CASE WHEN completed THEN 'completed' ELSE 'open' END,
    status_changed_at = COALESCE(actual_completed_date::timestamptz, created_at, now())
WHERE operational_status IS NULL;

ALTER TABLE public.garden_tasks
  ALTER COLUMN operational_status SET DEFAULT 'open',
  ALTER COLUMN operational_status SET NOT NULL;

ALTER TABLE public.garden_tasks DROP CONSTRAINT IF EXISTS garden_tasks_operational_status_check;
ALTER TABLE public.garden_tasks ADD CONSTRAINT garden_tasks_operational_status_check
  CHECK (operational_status IN ('open', 'in_progress', 'completed', 'cancelled'));

CREATE TABLE IF NOT EXISTS public.garden_task_transition_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.garden_tasks(id) ON DELETE CASCADE,
  garden_id uuid NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  previous_status text NOT NULL,
  next_status text NOT NULL,
  reason text,
  idempotency_key text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  CHECK (previous_status IN ('open', 'in_progress', 'completed', 'cancelled')),
  CHECK (next_status IN ('open', 'in_progress', 'completed', 'cancelled')),
  CHECK (next_status NOT IN ('open', 'cancelled') OR length(trim(COALESCE(reason, ''))) >= 3)
);

ALTER TABLE public.garden_task_transition_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_task_transition_task_time
  ON public.garden_task_transition_events(task_id, occurred_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_task_transition_actor_idempotency
  ON public.garden_task_transition_events(actor_id, idempotency_key);

DROP POLICY IF EXISTS task_transition_owner_read ON public.garden_task_transition_events;
CREATE POLICY task_transition_owner_read
  ON public.garden_task_transition_events FOR SELECT TO authenticated
  USING (
    actor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.gardens g
      WHERE g.id = garden_id AND g.user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.transition_garden_task(
  p_task_id uuid,
  p_next_status text,
  p_reason text,
  p_idempotency_key text
)
RETURNS public.garden_tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_task public.garden_tasks;
  current_actor uuid := auth.uid();
  existing_event public.garden_task_transition_events;
  allowed boolean := false;
BEGIN
  IF current_actor IS NULL THEN
    RAISE EXCEPTION 'authentication_required' USING ERRCODE = '28000';
  END IF;

  SELECT * INTO current_task
  FROM public.garden_tasks
  WHERE id = p_task_id
  FOR UPDATE;

  IF current_task.id IS NULL THEN
    RAISE EXCEPTION 'task_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM public.gardens g
    WHERE g.id = current_task.garden_id
      AND g.user_id = current_actor
  ) THEN
    RAISE EXCEPTION 'task_access_denied' USING ERRCODE = '42501';
  END IF;
  IF p_next_status NOT IN ('open', 'in_progress', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'invalid_task_status' USING ERRCODE = '22023';
  END IF;
  IF p_next_status IN ('open', 'cancelled') AND length(trim(COALESCE(p_reason, ''))) < 3 THEN
    RAISE EXCEPTION 'task_transition_reason_required' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO existing_event
  FROM public.garden_task_transition_events
  WHERE actor_id = current_actor
    AND idempotency_key = p_idempotency_key;

  IF existing_event.id IS NOT NULL THEN
    IF existing_event.task_id <> p_task_id OR existing_event.next_status <> p_next_status THEN
      RAISE EXCEPTION 'task_transition_idempotency_conflict' USING ERRCODE = '23505';
    END IF;
    RETURN current_task;
  END IF;

  allowed := CASE current_task.operational_status
    WHEN 'open' THEN p_next_status IN ('in_progress', 'completed', 'cancelled')
    WHEN 'in_progress' THEN p_next_status IN ('open', 'completed', 'cancelled')
    WHEN 'completed' THEN p_next_status = 'open'
    WHEN 'cancelled' THEN p_next_status = 'open'
    ELSE false
  END;
  IF NOT allowed THEN
    RAISE EXCEPTION 'invalid_task_transition' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.garden_task_transition_events(
    task_id, garden_id, actor_id, previous_status, next_status, reason, idempotency_key
  ) VALUES (
    current_task.id, current_task.garden_id, current_actor,
    current_task.operational_status, p_next_status, NULLIF(trim(p_reason), ''), p_idempotency_key
  );

  UPDATE public.garden_tasks
  SET operational_status = p_next_status,
      completed = p_next_status = 'completed',
      status_reason = NULLIF(trim(p_reason), ''),
      status_changed_at = now(),
      actual_completed_date = CASE
        WHEN p_next_status = 'completed' THEN COALESCE(actual_completed_date, now()::date)
        WHEN p_next_status = 'open' THEN NULL
        ELSE actual_completed_date
      END
  WHERE id = p_task_id
  RETURNING * INTO current_task;

  RETURN current_task;
END;
$$;

GRANT SELECT ON public.garden_task_transition_events TO authenticated;
REVOKE ALL ON FUNCTION public.transition_garden_task(uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transition_garden_task(uuid, text, text, text) TO authenticated;

COMMIT;
