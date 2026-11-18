BEGIN;

-- Owners can request delivery, never forge a provider acknowledgement or worker lock.
DROP POLICY IF EXISTS notification_delivery_owner_enqueue ON public.notification_delivery_queue;
CREATE POLICY notification_delivery_owner_enqueue
ON public.notification_delivery_queue FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() AND status = 'scheduled' AND attempts = 0
  AND max_attempts BETWEEN 1 AND 5 AND channel = 'email'
  AND provider_message_id IS NULL AND locked_at IS NULL AND sent_at IS NULL
  AND delivered_at IS NULL AND failed_at IS NULL AND dead_letter_at IS NULL
  AND (garden_id IS NULL OR EXISTS (
    SELECT 1 FROM public.gardens g WHERE g.id = garden_id AND g.user_id = auth.uid()
  ))
);

CREATE OR REPLACE FUNCTION public.claim_notification_deliveries(p_limit integer DEFAULT 25)
RETURNS SETOF public.notification_delivery_queue
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Recover interrupted workers only while retrying cannot bypass provider deduplication.
  UPDATE public.notification_delivery_queue
  SET status = CASE WHEN attempts >= max_attempts OR scheduled_for < now() - interval '23 hours'
                    THEN 'dead_letter' ELSE 'failed' END,
      dead_letter_at = CASE WHEN attempts >= max_attempts OR scheduled_for < now() - interval '23 hours'
                            THEN now() ELSE NULL END,
      next_attempt_at = now(), locked_at = NULL, failed_at = now(),
      last_error = 'interrupted_delivery_worker', updated_at = now()
  WHERE status = 'processing' AND locked_at < now() - interval '30 minutes';

  UPDATE public.notification_delivery_queue
  SET status = 'dead_letter', dead_letter_at = now(), updated_at = now(),
      last_error = 'notification_retry_exhausted'
  WHERE status = 'failed' AND (attempts >= max_attempts OR scheduled_for < now() - interval '23 hours');

  RETURN QUERY
  WITH due AS (
    SELECT id FROM public.notification_delivery_queue
    WHERE status IN ('scheduled', 'failed') AND scheduled_for <= now()
      AND next_attempt_at <= now() AND attempts < max_attempts
    ORDER BY next_attempt_at, created_at FOR UPDATE SKIP LOCKED
    LIMIT LEAST(GREATEST(p_limit, 1), 100)
  )
  UPDATE public.notification_delivery_queue q
  SET status = 'processing', locked_at = now(), attempts = q.attempts + 1, updated_at = now()
  FROM due WHERE q.id = due.id RETURNING q.*;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_notification_deliveries(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_notification_deliveries(integer) TO service_role;
COMMIT;
