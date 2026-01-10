-- ============================================
-- Migration: Add Row Tracking to All Operations
-- Data: 2026-01-10
-- Descrizione: Aggiunge tracciabilità per filari a tutte le operazioni
-- ============================================

-- ============================================
-- 1. MECHANICAL_WORK_REGISTER - Add row tracking
-- ============================================

-- Add bed and row tracking columns
ALTER TABLE public.mechanical_work_register 
ADD COLUMN IF NOT EXISTS bed_id UUID REFERENCES public.garden_beds(id) ON DELETE SET NULL;

ALTER TABLE public.mechanical_work_register 
ADD COLUMN IF NOT EXISTS bed_row_id UUID REFERENCES public.garden_rows(id) ON DELETE SET NULL;

ALTER TABLE public.mechanical_work_register 
ADD COLUMN IF NOT EXISTS field_row_id UUID REFERENCES public.field_rows(id) ON DELETE SET NULL;

-- Add zone tracking for compatibility
ALTER TABLE public.mechanical_work_register 
ADD COLUMN IF NOT EXISTS zone_id UUID REFERENCES public.garden_zones(id) ON DELETE SET NULL;

-- Add arrays for multiple selection (compatibility with existing forms)
ALTER TABLE public.mechanical_work_register 
ADD COLUMN IF NOT EXISTS bed_ids UUID[];

ALTER TABLE public.mechanical_work_register 
ADD COLUMN IF NOT EXISTS row_ids UUID[];

-- Add constraint: only one type of row reference
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_mechanical_work_row_reference' 
    AND table_name = 'mechanical_work_register'
  ) THEN
    ALTER TABLE public.mechanical_work_register
    ADD CONSTRAINT check_mechanical_work_row_reference
    CHECK (
      (bed_row_id IS NULL AND field_row_id IS NULL) OR
      (bed_row_id IS NOT NULL AND field_row_id IS NULL) OR
      (bed_row_id IS NULL AND field_row_id IS NOT NULL)
    );
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_mechanical_work_bed ON public.mechanical_work_register(bed_id);
CREATE INDEX IF NOT EXISTS idx_mechanical_work_bed_row ON public.mechanical_work_register(bed_row_id);
CREATE INDEX IF NOT EXISTS idx_mechanical_work_field_row ON public.mechanical_work_register(field_row_id);
CREATE INDEX IF NOT EXISTS idx_mechanical_work_zone ON public.mechanical_work_register(zone_id);

-- ============================================
-- 2. WATERING_LOGS - Add row tracking
-- ============================================

-- Add bed and row tracking columns
ALTER TABLE public.watering_logs 
ADD COLUMN IF NOT EXISTS bed_id UUID REFERENCES public.garden_beds(id) ON DELETE SET NULL;

ALTER TABLE public.watering_logs 
ADD COLUMN IF NOT EXISTS bed_row_id UUID REFERENCES public.garden_rows(id) ON DELETE SET NULL;

ALTER TABLE public.watering_logs 
ADD COLUMN IF NOT EXISTS field_row_id UUID REFERENCES public.field_rows(id) ON DELETE SET NULL;

-- Add constraint: only one type of row reference
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_watering_logs_row_reference' 
    AND table_name = 'watering_logs'
  ) THEN
    ALTER TABLE public.watering_logs
    ADD CONSTRAINT check_watering_logs_row_reference
    CHECK (
      (bed_row_id IS NULL AND field_row_id IS NULL) OR
      (bed_row_id IS NOT NULL AND field_row_id IS NULL) OR
      (bed_row_id IS NULL AND field_row_id IS NOT NULL)
    );
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_watering_logs_bed ON public.watering_logs(bed_id);
CREATE INDEX IF NOT EXISTS idx_watering_logs_bed_row ON public.watering_logs(bed_row_id);
CREATE INDEX IF NOT EXISTS idx_watering_logs_field_row ON public.watering_logs(field_row_id);

-- ============================================
-- 3. TREATMENT_REGISTER - Ensure compatibility with single row selection
-- ============================================

-- Add single row columns for compatibility with forms
ALTER TABLE public.treatment_register 
ADD COLUMN IF NOT EXISTS bed_id UUID REFERENCES public.garden_beds(id) ON DELETE SET NULL;

ALTER TABLE public.treatment_register 
ADD COLUMN IF NOT EXISTS bed_row_id UUID REFERENCES public.garden_rows(id) ON DELETE SET NULL;

ALTER TABLE public.treatment_register 
ADD COLUMN IF NOT EXISTS field_row_id UUID REFERENCES public.field_rows(id) ON DELETE SET NULL;

-- Add constraint: only one type of row reference
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_treatment_row_reference' 
    AND table_name = 'treatment_register'
  ) THEN
    ALTER TABLE public.treatment_register
    ADD CONSTRAINT check_treatment_row_reference
    CHECK (
      (bed_row_id IS NULL AND field_row_id IS NULL) OR
      (bed_row_id IS NOT NULL AND field_row_id IS NULL) OR
      (bed_row_id IS NULL AND field_row_id IS NOT NULL)
    );
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_treatment_bed ON public.treatment_register(bed_id);
CREATE INDEX IF NOT EXISTS idx_treatment_bed_row ON public.treatment_register(bed_row_id);
CREATE INDEX IF NOT EXISTS idx_treatment_field_row ON public.treatment_register(field_row_id);

-- ============================================
-- 4. FERTILIZER_APPLICATION_LOGS - Ensure compatibility with single row selection
-- ============================================

-- Add single row columns for compatibility with forms
ALTER TABLE public.fertilizer_application_logs 
ADD COLUMN IF NOT EXISTS bed_id UUID REFERENCES public.garden_beds(id) ON DELETE SET NULL;

ALTER TABLE public.fertilizer_application_logs 
ADD COLUMN IF NOT EXISTS bed_row_id UUID REFERENCES public.garden_rows(id) ON DELETE SET NULL;

ALTER TABLE public.fertilizer_application_logs 
ADD COLUMN IF NOT EXISTS field_row_id UUID REFERENCES public.field_rows(id) ON DELETE SET NULL;

-- Add constraint: only one type of row reference
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_fertilizer_row_reference' 
    AND table_name = 'fertilizer_application_logs'
  ) THEN
    ALTER TABLE public.fertilizer_application_logs
    ADD CONSTRAINT check_fertilizer_row_reference
    CHECK (
      (bed_row_id IS NULL AND field_row_id IS NULL) OR
      (bed_row_id IS NOT NULL AND field_row_id IS NULL) OR
      (bed_row_id IS NULL AND field_row_id IS NOT NULL)
    );
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_fertilizer_bed ON public.fertilizer_application_logs(bed_id);
CREATE INDEX IF NOT EXISTS idx_fertilizer_bed_row ON public.fertilizer_application_logs(bed_row_id);
CREATE INDEX IF NOT EXISTS idx_fertilizer_field_row ON public.fertilizer_application_logs(field_row_id);

-- ============================================
-- 5. GARDEN_TASKS - Add row tracking (for task completion)
-- ============================================

-- Add row tracking to garden_tasks for task completion tracking
ALTER TABLE public.garden_tasks 
ADD COLUMN IF NOT EXISTS bed_row_id UUID REFERENCES public.garden_rows(id) ON DELETE SET NULL;

ALTER TABLE public.garden_tasks 
ADD COLUMN IF NOT EXISTS field_row_id UUID REFERENCES public.field_rows(id) ON DELETE SET NULL;

-- Add constraint: only one type of row reference
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_garden_tasks_row_reference' 
    AND table_name = 'garden_tasks'
  ) THEN
    ALTER TABLE public.garden_tasks
    ADD CONSTRAINT check_garden_tasks_row_reference
    CHECK (
      (bed_row_id IS NULL AND field_row_id IS NULL) OR
      (bed_row_id IS NOT NULL AND field_row_id IS NULL) OR
      (bed_row_id IS NULL AND field_row_id IS NOT NULL)
    );
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_garden_tasks_bed_row ON public.garden_tasks(bed_row_id);
CREATE INDEX IF NOT EXISTS idx_garden_tasks_field_row ON public.garden_tasks(field_row_id);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Ensure all users can access the new columns
GRANT SELECT, INSERT, UPDATE ON public.mechanical_work_register TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.watering_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.treatment_register TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.fertilizer_application_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.garden_tasks TO authenticated;

-- Notifica PostgREST di ricaricare lo schema
NOTIFY pgrst, 'reload schema';

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN public.mechanical_work_register.bed_id IS 'Reference to garden bed (aiuola)';
COMMENT ON COLUMN public.mechanical_work_register.bed_row_id IS 'Reference to garden row within bed (filare di aiuola)';
COMMENT ON COLUMN public.mechanical_work_register.field_row_id IS 'Reference to field row (filare di campo aperto)';
COMMENT ON COLUMN public.mechanical_work_register.bed_ids IS 'Array of bed IDs for multiple selection';
COMMENT ON COLUMN public.mechanical_work_register.row_ids IS 'Array of row IDs for multiple selection';

COMMENT ON COLUMN public.watering_logs.bed_id IS 'Reference to garden bed (aiuola)';
COMMENT ON COLUMN public.watering_logs.bed_row_id IS 'Reference to garden row within bed (filare di aiuola)';
COMMENT ON COLUMN public.watering_logs.field_row_id IS 'Reference to field row (filare di campo aperto)';

COMMENT ON COLUMN public.treatment_register.bed_id IS 'Reference to garden bed (aiuola)';
COMMENT ON COLUMN public.treatment_register.bed_row_id IS 'Reference to garden row within bed (filare di aiuola)';
COMMENT ON COLUMN public.treatment_register.field_row_id IS 'Reference to field row (filare di campo aperto)';

COMMENT ON COLUMN public.fertilizer_application_logs.bed_id IS 'Reference to garden bed (aiuola)';
COMMENT ON COLUMN public.fertilizer_application_logs.bed_row_id IS 'Reference to garden row within bed (filare di aiuola)';
COMMENT ON COLUMN public.fertilizer_application_logs.field_row_id IS 'Reference to field row (filare di campo aperto)';

COMMENT ON COLUMN public.garden_tasks.bed_row_id IS 'Reference to garden row within bed (filare di aiuola)';
COMMENT ON COLUMN public.garden_tasks.field_row_id IS 'Reference to field row (filare di campo aperto)';

-- ============================================
-- Note:
-- - Aggiunge tracciabilità completa per filari a tutte le operazioni
-- - Supporta sia garden_rows (filari di aiuole) che field_rows (filari di campo)
-- - Mantiene compatibilità con form esistenti
-- - Constraint per evitare riferimenti multipli inconsistenti
-- - Indici per performance delle query
-- ============================================