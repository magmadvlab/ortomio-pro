-- Migration: Add garden_rows table (filari)
-- Created: 2025-12-25

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS garden_rows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  bed_id UUID REFERENCES garden_beds(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  row_number INTEGER,
  length_meters DECIMAL(10, 2) NOT NULL,
  irrigation_line JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garden_rows_garden_id ON garden_rows(garden_id);
CREATE INDEX IF NOT EXISTS idx_garden_rows_bed_id ON garden_rows(bed_id);
CREATE INDEX IF NOT EXISTS idx_garden_rows_row_number ON garden_rows(bed_id, row_number);

ALTER TABLE garden_rows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their garden rows"
  ON garden_rows FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_rows.garden_id
      AND gardens.user_id = auth.uid()
    )
  );
