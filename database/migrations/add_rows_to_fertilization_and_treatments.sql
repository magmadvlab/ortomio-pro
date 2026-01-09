-- Migration: Add bed/row references to fertilization and treatments
-- Created: 2025-12-25

-- Fertilizer application logs: add row_id
ALTER TABLE fertilizer_application_logs
  ADD COLUMN IF NOT EXISTS row_id UUID REFERENCES garden_rows(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_fertilizer_application_logs_row_id
  ON fertilizer_application_logs(row_id)
  WHERE row_id IS NOT NULL;

-- Treatment register: add bed_id and row_id
ALTER TABLE treatment_register
  ADD COLUMN IF NOT EXISTS bed_id UUID REFERENCES garden_beds(id) ON DELETE SET NULL;

ALTER TABLE treatment_register
  ADD COLUMN IF NOT EXISTS row_id UUID REFERENCES garden_rows(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_treatment_register_bed_id
  ON treatment_register(bed_id)
  WHERE bed_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_treatment_register_row_id
  ON treatment_register(row_id)
  WHERE row_id IS NOT NULL;
