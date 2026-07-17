\set ON_ERROR_STOP on
INSERT INTO auth.users(id) VALUES ('11111111-1111-1111-1111-111111111111'), ('22222222-2222-2222-2222-222222222222');
INSERT INTO public.gardens(id, user_id, name) VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'A'), ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'B');

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);
INSERT INTO public.diary_events(garden_id,event_date,event_time,event_type,category,title,description,source,payload,idempotency_key)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','2026-07-17','10:00','observation','care','First','Observed','manual','{"verified":true}','event-1');
UPDATE public.diary_events SET title = 'Edited' WHERE idempotency_key = 'event-1';

DO $$ BEGIN
  IF (SELECT revision FROM public.diary_events WHERE idempotency_key='event-1') <> 2 THEN RAISE EXCEPTION 'revision audit failed'; END IF;
  IF (SELECT count(*) FROM public.diary_event_revisions) <> 1 THEN RAISE EXCEPTION 'revision history missing'; END IF;
END $$;

INSERT INTO public.agronomic_memory_events(id,garden_id,event_type,source_service,summary,occurred_at)
VALUES ('memory-1','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','outcome','test','Measured',now());

DO $$ BEGIN
  BEGIN
    INSERT INTO public.agronomic_memory_events(id,garden_id,event_type,source_service,summary,occurred_at)
    VALUES ('memory-cross','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','outcome','test','Denied',now());
    RAISE EXCEPTION 'cross-garden write unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;

INSERT INTO public.treatment_register(user_id,garden_id,product_name,treatment_date,dosage,dosage_unit,pre_harvest_interval_days)
VALUES ('11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Rame','2026-07-17',20,'g',7);
DO $$ BEGIN
  BEGIN
    UPDATE public.treatment_register SET dosage=25;
    RAISE EXCEPTION 'regulatory update unexpectedly succeeded';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM = 'regulatory update unexpectedly succeeded' THEN RAISE; END IF;
  END;
END $$;

RESET ROLE;
