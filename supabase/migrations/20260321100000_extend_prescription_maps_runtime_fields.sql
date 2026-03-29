ALTER TABLE public.prescription_maps
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  ADD COLUMN IF NOT EXISTS data_completeness INTEGER NOT NULL DEFAULT 0
    CHECK (data_completeness >= 0 AND data_completeness <= 100),
  ADD COLUMN IF NOT EXISTS spatial_accuracy INTEGER NOT NULL DEFAULT 0
    CHECK (spatial_accuracy >= 0 AND spatial_accuracy <= 100),
  ADD COLUMN IF NOT EXISTS temporal_relevance INTEGER NOT NULL DEFAULT 0
    CHECK (temporal_relevance >= 0 AND temporal_relevance <= 100);
