-- P7: evidenze regolatorie append-only, export auditati e audit amministrativo.

ALTER TABLE public.certification_documents
  ADD COLUMN IF NOT EXISTS uploaded_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS source_kind text NOT NULL DEFAULT 'observed' CHECK (source_kind IN ('observed', 'imported', 'simulated', 'demo')),
  ADD COLUMN IF NOT EXISTS source_reference text,
  ADD COLUMN IF NOT EXISTS content_sha256 text CHECK (content_sha256 IS NULL OR char_length(content_sha256) = 64),
  ADD COLUMN IF NOT EXISTS mime_type text,
  ADD COLUMN IF NOT EXISTS file_size_bytes bigint CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0);

ALTER TABLE public.certification_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage certification documents for their gardens" ON public.certification_documents;
DROP POLICY IF EXISTS certification_documents_owner_p7 ON public.certification_documents;
CREATE POLICY certification_documents_owner_p7 ON public.certification_documents FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.gardens g WHERE g.id = garden_id AND g.user_id = auth.uid()))
WITH CHECK (uploaded_by = auth.uid() AND EXISTS (SELECT 1 FROM public.gardens g WHERE g.id = garden_id AND g.user_id = auth.uid()));

ALTER TABLE public.bio_certification_documents
  ADD COLUMN IF NOT EXISTS source_kind text NOT NULL DEFAULT 'observed' CHECK (source_kind IN ('observed', 'imported', 'simulated', 'demo')),
  ADD COLUMN IF NOT EXISTS source_reference text,
  ADD COLUMN IF NOT EXISTS content_sha256 text CHECK (content_sha256 IS NULL OR char_length(content_sha256) = 64);
DROP POLICY IF EXISTS "Users can insert own bio certification documents" ON public.bio_certification_documents;
CREATE POLICY "Users can insert own bio certification documents" ON public.bio_certification_documents FOR INSERT TO authenticated
WITH CHECK (uploaded_by = auth.uid() AND bio_certification_id IN (
  SELECT bc.id FROM public.bio_certifications bc JOIN public.gardens g ON g.id = bc.garden_id
  WHERE g.user_id = auth.uid()
));

CREATE TABLE IF NOT EXISTS public.certification_evidence_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id uuid NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  certification_type text NOT NULL,
  event_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  operator_id uuid NOT NULL REFERENCES auth.users(id),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  source_kind text NOT NULL CHECK (source_kind IN ('observed', 'imported', 'simulated', 'demo')),
  certification_eligible boolean NOT NULL DEFAULT false,
  source_reference text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (source_kind IN ('observed', 'imported') OR certification_eligible = false)
);
CREATE INDEX IF NOT EXISTS idx_cert_evidence_garden_time ON public.certification_evidence_events(garden_id, occurred_at DESC);
ALTER TABLE public.certification_evidence_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS certification_evidence_owner ON public.certification_evidence_events;
CREATE POLICY certification_evidence_owner ON public.certification_evidence_events FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.gardens g WHERE g.id = garden_id AND g.user_id = auth.uid()));
DROP POLICY IF EXISTS certification_evidence_insert_owner ON public.certification_evidence_events;
CREATE POLICY certification_evidence_insert_owner ON public.certification_evidence_events FOR INSERT TO authenticated
WITH CHECK (operator_id = auth.uid() AND EXISTS (SELECT 1 FROM public.gardens g WHERE g.id = garden_id AND g.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.prevent_regulatory_event_mutation()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'regulatory_events_are_append_only';
END;
$$;
DROP TRIGGER IF EXISTS certification_evidence_append_only ON public.certification_evidence_events;
CREATE TRIGGER certification_evidence_append_only BEFORE UPDATE OR DELETE ON public.certification_evidence_events
FOR EACH ROW EXECUTE FUNCTION public.prevent_regulatory_event_mutation();

CREATE TABLE IF NOT EXISTS public.export_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id uuid NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  dataset text NOT NULL CHECK (dataset IN ('garden', 'tasks', 'diary', 'treatments', 'certification_dossier')),
  format text NOT NULL CHECK (format IN ('csv', 'pdf')),
  schema_version text NOT NULL,
  period_from date,
  period_to date,
  row_count integer NOT NULL CHECK (row_count >= 0),
  content_sha256 text NOT NULL CHECK (char_length(content_sha256) = 64),
  timezone text NOT NULL,
  source_tables text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_export_audit_owner_time ON public.export_audit_log(user_id, created_at DESC);
ALTER TABLE public.export_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS export_audit_owner ON public.export_audit_log;
CREATE POLICY export_audit_owner ON public.export_audit_log FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS export_audit_insert_owner ON public.export_audit_log;
CREATE POLICY export_audit_insert_owner ON public.export_audit_log FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.gardens g WHERE g.id = garden_id AND g.user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  outcome text NOT NULL CHECK (outcome IN ('success', 'failure')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_time ON public.admin_audit_log(created_at DESC);
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS admin_audit_admin_only ON public.admin_audit_log;
CREATE POLICY admin_audit_admin_only ON public.admin_audit_log FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.is_superadmin = true)));

REVOKE UPDATE, DELETE ON public.certification_evidence_events, public.export_audit_log, public.admin_audit_log FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON public.certification_documents, public.bio_certification_documents TO authenticated;
GRANT SELECT, INSERT ON public.certification_evidence_events, public.export_audit_log TO authenticated;
GRANT SELECT ON public.admin_audit_log TO authenticated;
