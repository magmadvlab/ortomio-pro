-- ============================================
-- SEEDLING BATCHES (Batch Semenzai)
-- Migration: Add seedling_batches table
-- ============================================

-- Create seedling_batches table
CREATE TABLE IF NOT EXISTS seedling_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  plant_name TEXT NOT NULL,
  variety TEXT,
  sowing_date DATE NOT NULL,
  quantity INTEGER NOT NULL,
  location TEXT CHECK (location IN ('Indoor', 'Greenhouse', 'ColdFrame')) NOT NULL,
  phase TEXT CHECK (phase IN ('Sowing', 'Germination', 'Nursing', 'Hardening', 'ReadyToTransplant')) DEFAULT 'Sowing',
  current_quantity INTEGER,
  expected_transplant_date DATE,
  notes TEXT,
  photo_log JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_seedling_batches_garden_id ON seedling_batches(garden_id);
CREATE INDEX IF NOT EXISTS idx_seedling_batches_sowing_date ON seedling_batches(sowing_date);
CREATE INDEX IF NOT EXISTS idx_seedling_batches_phase ON seedling_batches(phase);

-- Enable RLS
ALTER TABLE seedling_batches ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can access seedling batches in their gardens
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'seedling_batches' 
    AND policyname = 'Users can access seedling batches in their gardens'
  ) THEN
    CREATE POLICY "Users can access seedling batches in their gardens"
      ON seedling_batches FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM gardens
          WHERE gardens.id = seedling_batches.garden_id
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Create trigger for updated_at (if function exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    DROP TRIGGER IF EXISTS update_seedling_batches_updated_at ON seedling_batches;
    CREATE TRIGGER update_seedling_batches_updated_at 
      BEFORE UPDATE ON seedling_batches
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;















