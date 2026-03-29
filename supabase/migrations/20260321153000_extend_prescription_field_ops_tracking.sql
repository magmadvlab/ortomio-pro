ALTER TABLE public.prescription_maps
  ADD COLUMN IF NOT EXISTS version_number INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS version_label TEXT,
  ADD COLUMN IF NOT EXISTS root_version_id UUID,
  ADD COLUMN IF NOT EXISTS parent_version_id UUID REFERENCES public.prescription_maps(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_exported_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS export_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_executed_at TIMESTAMPTZ;

UPDATE public.prescription_maps
SET
  version_label = COALESCE(version_label, 'v' || version_number::text),
  root_version_id = COALESCE(root_version_id, id)
WHERE version_label IS NULL
   OR root_version_id IS NULL;

ALTER TABLE public.variable_rate_applications
  ADD COLUMN IF NOT EXISTS prescription_export_id UUID REFERENCES public.prescription_map_exports(id) ON DELETE SET NULL;

ALTER TABLE public.prescription_map_exports
  ADD COLUMN IF NOT EXISTS garden_id UUID REFERENCES public.gardens(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS version_number INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS field_status TEXT NOT NULL DEFAULT 'generated' CHECK (field_status IN ('generated', 'downloaded', 'field_imported', 'field_applied')),
  ADD COLUMN IF NOT EXISTS machinery_brand TEXT,
  ADD COLUMN IF NOT EXISTS machinery_model TEXT,
  ADD COLUMN IF NOT EXISTS machinery_profile_id TEXT,
  ADD COLUMN IF NOT EXISTS compatibility_score INTEGER,
  ADD COLUMN IF NOT EXISTS warnings JSONB,
  ADD COLUMN IF NOT EXISTS metadata JSONB,
  ADD COLUMN IF NOT EXISTS field_imported_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS applied_at TIMESTAMPTZ;

UPDATE public.prescription_map_exports AS exports
SET
  garden_id = maps.garden_id,
  version_number = COALESCE(exports.version_number, maps.version_number, 1)
FROM public.prescription_maps AS maps
WHERE exports.prescription_map_id = maps.id
  AND (
    exports.garden_id IS NULL
    OR exports.version_number IS NULL
  );

CREATE INDEX IF NOT EXISTS idx_prescription_map_exports_garden_id
  ON public.prescription_map_exports(garden_id);

CREATE INDEX IF NOT EXISTS idx_prescription_map_exports_field_status
  ON public.prescription_map_exports(field_status);

CREATE INDEX IF NOT EXISTS idx_variable_rate_applications_prescription_export_id
  ON public.variable_rate_applications(prescription_export_id);
