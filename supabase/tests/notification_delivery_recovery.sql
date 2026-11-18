-- Disposable Docker clone only. All fixtures and queue changes are rolled back.
BEGIN;
INSERT INTO auth.users(id,email,raw_user_meta_data)
VALUES ('d0000000-0000-4000-8000-000000000001','delivery-audit@example.test','{}');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
INSERT INTO public.notification_delivery_queue(user_id,channel,notification_type,recipient,subject,idempotency_key)
VALUES ('d0000000-0000-4000-8000-000000000001','email','weather_alert','delivery-audit@example.test','Fixture','audit-delivery-normal');
DO $$ BEGIN
  BEGIN
    INSERT INTO public.notification_delivery_queue(user_id,channel,notification_type,recipient,subject,idempotency_key,status,provider_message_id)
    VALUES ('d0000000-0000-4000-8000-000000000001','email','weather_alert','delivery-audit@example.test','Fixture','audit-delivery-forged','sent','fake-provider-id');
    RAISE EXCEPTION 'forged delivery accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    PERFORM public.claim_notification_deliveries(1);
    RAISE EXCEPTION 'owner could claim';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
INSERT INTO public.notification_delivery_queue(user_id,channel,notification_type,recipient,subject,idempotency_key,status,attempts,locked_at,scheduled_for,next_attempt_at)
SELECT 'd0000000-0000-4000-8000-000000000001','email','weather_alert','delivery-audit@example.test','Fixture',
  'audit-delivery-' || n, 'processing', 1, now() - interval '1 hour',
  CASE WHEN n='expired' THEN now()-interval '25 hours' ELSE now()-interval '2 hours' END, now()-interval '2 hours'
FROM unnest(ARRAY['recover','expired']) n;
SET LOCAL ROLE service_role;
DO $$ DECLARE first_count integer; second_count integer; BEGIN
  SELECT count(*) INTO first_count FROM public.claim_notification_deliveries(100) WHERE idempotency_key LIKE 'audit-delivery-%';
  IF first_count <> 2 THEN RAISE EXCEPTION 'expected new and recovered jobs, got %', first_count; END IF;
  SELECT count(*) INTO second_count FROM public.claim_notification_deliveries(100) WHERE idempotency_key LIKE 'audit-delivery-%';
  IF second_count <> 0 THEN RAISE EXCEPTION 'claimed locked jobs twice'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.notification_delivery_queue WHERE idempotency_key='audit-delivery-recover' AND attempts=2 AND status='processing') THEN RAISE EXCEPTION 'stale lock not recovered'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.notification_delivery_queue WHERE idempotency_key='audit-delivery-expired' AND status='dead_letter') THEN RAISE EXCEPTION 'expired job retried'; END IF;
END $$;
ROLLBACK;
