-- Migration: Add fertilizer application logs
-- Created: 2025

-- FERTILIZER APPLICATION LOGS
CREATE TABLE IF NOT EXISTS fertilizer_application_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES garden_tasks(id) ON DELETE SET NULL,
  bed_id UUID REFERENCES garden_beds(id) ON DELETE SET NULL,
  product_id TEXT NOT NULL,
  product_name TEXT,
  application_date DATE NOT NULL,
  area_sqm DECIMAL(8, 2),
  dosage_amount DECIMAL(10, 2) NOT NULL,
  dosage_unit TEXT NOT NULL,
  method TEXT CHECK (method IN ('incorporated', 'surface', 'fertigation', 'foliar')),
  weather_conditions JSONB,
  notes TEXT,
  next_application_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fertilizer_application_logs_garden_id ON fertilizer_application_logs(garden_id);
CREATE INDEX IF NOT EXISTS idx_fertilizer_application_logs_task_id ON fertilizer_application_logs(task_id) WHERE task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fertilizer_application_logs_bed_id ON fertilizer_application_logs(bed_id) WHERE bed_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fertilizer_application_logs_application_date ON fertilizer_application_logs(application_date);
CREATE INDEX IF NOT EXISTS idx_fertilizer_application_logs_next_application_date ON fertilizer_application_logs(next_application_date) WHERE next_application_date IS NOT NULL;

-- RLS Policies
ALTER TABLE fertilizer_application_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own fertilizer application logs" ON fertilizer_application_logs
  FOR ALL USING (EXISTS (SELECT 1 FROM gardens WHERE gardens.id = fertilizer_application_logs.garden_id AND gardens.user_id = auth.uid()));
