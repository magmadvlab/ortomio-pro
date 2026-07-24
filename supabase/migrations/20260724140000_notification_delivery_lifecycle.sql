BEGIN;

CREATE TABLE IF NOT EXISTS public.notification_delivery_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id uuid REFERENCES public.gardens(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('email', 'push')),
  notification_type text NOT NULL,
  recipient text NOT NULL,
  subject text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'processing', 'sent', 'delivered', 'failed', 'dead_letter', 'suppressed')),
  scheduled_for timestamptz NOT NULL DEFAULT now(),
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  max_attempts integer NOT NULL DEFAULT 5 CHECK (max_attempts BETWEEN 1 AND 20),
  provider_message_id text,
  last_error text,
  locked_at timestamptz,
  sent_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  dead_letter_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_delivery_due
  ON public.notification_delivery_queue(next_attempt_at, scheduled_for)
  WHERE status IN ('scheduled', 'failed');
CREATE INDEX IF NOT EXISTS idx_notification_delivery_user_rate
  ON public.notification_delivery_queue(user_id, sent_at DESC)
  WHERE status IN ('sent', 'delivered');
CREATE UNIQUE INDEX IF NOT EXISTS uq_notification_delivery_provider_message
  ON public.notification_delivery_queue(provider_message_id)
  WHERE provider_message_id IS NOT NULL;

ALTER TABLE public.notification_delivery_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS notification_delivery_owner_read ON public.notification_delivery_queue;
CREATE POLICY notification_delivery_owner_read
  ON public.notification_delivery_queue FOR SELECT TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS notification_delivery_owner_enqueue ON public.notification_delivery_queue;
CREATE POLICY notification_delivery_owner_enqueue
  ON public.notification_delivery_queue FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      garden_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.gardens g
        WHERE g.id = garden_id AND g.user_id = auth.uid()
      )
    )
  );

CREATE OR REPLACE FUNCTION public.claim_notification_deliveries(p_limit integer DEFAULT 25)
RETURNS SETOF public.notification_delivery_queue
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH due AS (
    SELECT id
    FROM public.notification_delivery_queue
    WHERE status IN ('scheduled', 'failed')
      AND scheduled_for <= now()
      AND next_attempt_at <= now()
    ORDER BY next_attempt_at, created_at
    FOR UPDATE SKIP LOCKED
    LIMIT LEAST(GREATEST(p_limit, 1), 100)
  )
  UPDATE public.notification_delivery_queue q
  SET status = 'processing', locked_at = now(), attempts = q.attempts + 1, updated_at = now()
  FROM due
  WHERE q.id = due.id
  RETURNING q.*;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_notification_deliveries(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_notification_deliveries(integer) TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.notification_delivery_queue TO service_role;
GRANT SELECT, INSERT ON public.notification_delivery_queue TO authenticated;

COMMIT;
