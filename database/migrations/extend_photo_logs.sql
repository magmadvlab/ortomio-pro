-- Migration: Estendi photo_logs con colonne per fertilizzazione e confronto crescita

ALTER TABLE photo_logs 
ADD COLUMN IF NOT EXISTS fertilization_suggestion JSONB,
ADD COLUMN IF NOT EXISTS growth_comparison JSONB,
ADD COLUMN IF NOT EXISTS previous_photo_id UUID REFERENCES photo_logs(id) ON DELETE SET NULL;

-- Indice per query ottimizzate (foto per task ordinate per data)
CREATE INDEX IF NOT EXISTS idx_photo_logs_task_date ON photo_logs(task_id, photo_date DESC);

-- Indice per previous_photo_id (per navigazione tra foto)
CREATE INDEX IF NOT EXISTS idx_photo_logs_previous ON photo_logs(previous_photo_id) WHERE previous_photo_id IS NOT NULL;

-- Commenti
COMMENT ON COLUMN photo_logs.fertilization_suggestion IS 'Suggerimenti fertilizzazione basati su analisi foto (JSONB)';
COMMENT ON COLUMN photo_logs.growth_comparison IS 'Confronto con foto precedente (JSONB)';
COMMENT ON COLUMN photo_logs.previous_photo_id IS 'Riferimento alla foto precedente dello stesso task per confronto';

