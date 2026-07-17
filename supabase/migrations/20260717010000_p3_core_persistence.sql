-- P3 canonical persistence for operational diary and agronomic memory.
BEGIN;

ALTER TABLE public.diary_events
  ADD COLUMN IF NOT EXISTS author_id uuid DEFAULT auth.uid(),
  ADD COLUMN IF NOT EXISTS zone_id uuid,
  ADD COLUMN IF NOT EXISTS field_row_id uuid,
  ADD COLUMN IF NOT EXISTS plant_id uuid,
  ADD COLUMN IF NOT EXISTS task_id uuid,
  ADD COLUMN IF NOT EXISTS event_time time,
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'care',
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS idempotency_key text,
  ADD COLUMN IF NOT EXISTS revision integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS voided_at timestamptz,
  ADD COLUMN IF NOT EXISTS voided_by uuid,
  ADD COLUMN IF NOT EXISTS void_reason text;

UPDATE public.diary_events
SET payload = COALESCE(metadata, '{}'::jsonb)
WHERE payload = '{}'::jsonb AND metadata IS NOT NULL;

ALTER TABLE public.diary_events DROP CONSTRAINT IF EXISTS diary_events_source_check;
ALTER TABLE public.diary_events ADD CONSTRAINT diary_events_source_check CHECK (source IN ('manual','task','device','automation','ai','import'));
ALTER TABLE public.diary_events DROP CONSTRAINT IF EXISTS diary_events_status_check;
ALTER TABLE public.diary_events ADD CONSTRAINT diary_events_status_check CHECK (status IN ('active','voided'));
CREATE UNIQUE INDEX IF NOT EXISTS idx_diary_events_idempotency ON public.diary_events(garden_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_diary_events_scope ON public.diary_events(garden_id, zone_id, field_row_id, plant_id, event_date DESC);

CREATE TABLE IF NOT EXISTS public.diary_event_revisions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id uuid NOT NULL,
  garden_id uuid NOT NULL,
  revision integer NOT NULL,
  change_type text NOT NULL,
  snapshot jsonb NOT NULL,
  changed_by uuid,
  changed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_diary_event_revisions_event ON public.diary_event_revisions(event_id, revision DESC);
ALTER TABLE public.diary_event_revisions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read diary revisions" ON public.diary_event_revisions;
CREATE POLICY "Users can read diary revisions" ON public.diary_event_revisions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.gardens g WHERE g.id = garden_id AND g.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.audit_diary_event_revision()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  INSERT INTO public.diary_event_revisions(event_id, garden_id, revision, change_type, snapshot, changed_by)
  VALUES (OLD.id, OLD.garden_id, OLD.revision, CASE WHEN NEW.status = 'voided' AND OLD.status <> 'voided' THEN 'void' ELSE 'edit' END, to_jsonb(OLD), auth.uid());
  NEW.revision := OLD.revision + 1;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.audit_diary_event_revision() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS audit_diary_event_revision ON public.diary_events;
CREATE TRIGGER audit_diary_event_revision BEFORE UPDATE ON public.diary_events FOR EACH ROW EXECUTE FUNCTION public.audit_diary_event_revision();

ALTER TABLE public.individual_plant_operations ADD COLUMN IF NOT EXISTS idempotency_key text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_plant_operations_idempotency ON public.individual_plant_operations(garden_id, plant_id, idempotency_key);

ALTER TABLE public.treatment_register
  ADD COLUMN IF NOT EXISTS product_lot_code text,
  ADD COLUMN IF NOT EXISTS effectiveness_score numeric(5,2),
  ADD COLUMN IF NOT EXISTS outcome_recorded_at timestamptz,
  ADD COLUMN IF NOT EXISTS outcome_notes text;
ALTER TABLE public.phyto_inventory ADD COLUMN IF NOT EXISTS lot_code text;

CREATE OR REPLACE FUNCTION public.protect_treatment_regulatory_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  IF OLD.product_name IS DISTINCT FROM NEW.product_name
    OR OLD.treatment_date IS DISTINCT FROM NEW.treatment_date
    OR OLD.dosage IS DISTINCT FROM NEW.dosage
    OR OLD.dosage_unit IS DISTINCT FROM NEW.dosage_unit
    OR OLD.pre_harvest_interval_days IS DISTINCT FROM NEW.pre_harvest_interval_days THEN
    RAISE EXCEPTION 'regulatory treatment fields are append-only; void and recreate the record';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS protect_treatment_regulatory_fields ON public.treatment_register;
CREATE TRIGGER protect_treatment_regulatory_fields BEFORE UPDATE ON public.treatment_register FOR EACH ROW EXECUTE FUNCTION public.protect_treatment_regulatory_fields();

CREATE TABLE IF NOT EXISTS public.agronomic_memory_events (
  id text PRIMARY KEY,
  garden_id uuid NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  source_service text NOT NULL,
  zone_id uuid,
  field_row_id uuid,
  plant_id uuid,
  task_id uuid,
  summary text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  confidence numeric(5,4),
  freshness_at timestamptz,
  occurred_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_agronomic_memory_scope ON public.agronomic_memory_events(garden_id, occurred_at DESC, zone_id, field_row_id, plant_id);
ALTER TABLE public.agronomic_memory_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read agronomic memory" ON public.agronomic_memory_events;
CREATE POLICY "Users can read agronomic memory" ON public.agronomic_memory_events FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.gardens g WHERE g.id = garden_id AND g.user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can create agronomic memory" ON public.agronomic_memory_events;
CREATE POLICY "Users can create agronomic memory" ON public.agronomic_memory_events FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.gardens g WHERE g.id = garden_id AND g.user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can update agronomic memory" ON public.agronomic_memory_events;
CREATE POLICY "Users can update agronomic memory" ON public.agronomic_memory_events FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.gardens g WHERE g.id = garden_id AND g.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.gardens g WHERE g.id = garden_id AND g.user_id = auth.uid()));

-- Idempotent backfill from the former profile-preference snapshot writer.
DO $backfill$
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL
    AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='preferences') THEN
    INSERT INTO public.agronomic_memory_events(id,garden_id,event_type,source_service,zone_id,field_row_id,plant_id,task_id,summary,payload,occurred_at)
    SELECT event->>'id', (event->>'gardenId')::uuid, event->>'type', event->>'sourceService', nullif(event->>'zoneId','')::uuid,
      nullif(event->>'fieldRowId','')::uuid, nullif(event->>'plantId','')::uuid, nullif(event->>'taskId','')::uuid,
      event->>'summary', COALESCE(event->'payload','{}'::jsonb), (event->>'occurredAt')::timestamptz
    FROM public.profiles p
    CROSS JOIN LATERAL (SELECT key, value FROM jsonb_each(COALESCE(p.preferences,'{}'::jsonb)) WHERE jsonb_typeof(value) = 'array') pref
    CROSS JOIN LATERAL jsonb_array_elements(pref.value) event
    WHERE pref.key LIKE 'unified_agronomic_memory_events:%'
    ON CONFLICT (id) DO NOTHING;
  END IF;
END
$backfill$;

GRANT SELECT, INSERT, UPDATE ON public.diary_events TO authenticated;
GRANT SELECT ON public.diary_event_revisions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.agronomic_memory_events TO authenticated;

COMMIT;
