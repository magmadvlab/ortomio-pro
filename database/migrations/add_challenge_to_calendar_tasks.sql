-- Migration: Aggiungi supporto challenge a calendar_tasks
-- Permette di tracciare quali calendar tasks provengono da challenge

-- Aggiungi colonne per tracciare origine challenge
ALTER TABLE calendar_tasks 
ADD COLUMN IF NOT EXISTS challenge_id TEXT,
ADD COLUMN IF NOT EXISTS challenge_action_index INTEGER,
ADD COLUMN IF NOT EXISTS source_type TEXT CHECK (source_type IN ('manual', 'challenge', 'suggested', 'recurring')) DEFAULT 'manual';

-- Indice per query challenge tasks
CREATE INDEX IF NOT EXISTS idx_calendar_tasks_challenge 
ON calendar_tasks(challenge_id, challenge_action_index) 
WHERE challenge_id IS NOT NULL;

-- Indice per source_type
CREATE INDEX IF NOT EXISTS idx_calendar_tasks_source_type 
ON calendar_tasks(source_type) 
WHERE source_type != 'manual';

-- Commenti
COMMENT ON COLUMN calendar_tasks.challenge_id IS 'ID challenge formato "giorno-mese" (es. "22-4") se il task proviene da una challenge';
COMMENT ON COLUMN calendar_tasks.challenge_action_index IS 'Indice dell''azione nella challenge (0-based)';
COMMENT ON COLUMN calendar_tasks.source_type IS 'Origine del task: manual (utente), challenge (da challenge), suggested (suggerito), recurring (ricorrente)';




