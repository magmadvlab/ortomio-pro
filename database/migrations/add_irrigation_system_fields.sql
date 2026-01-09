-- Migrazione: Aggiunta campi per collegamento filari e tipo coltivazione ai sistemi di irrigazione
-- Data: 2026-01-09

-- Aggiungi nuovi campi alla tabella irrigation_systems
ALTER TABLE irrigation_systems 
ADD COLUMN IF NOT EXISTS bed_ids TEXT[], -- Array di ID aiuole collegate
ADD COLUMN IF NOT EXISTS row_ids TEXT[], -- Array di ID filari collegati  
ADD COLUMN IF NOT EXISTS cultivation_type TEXT CHECK (cultivation_type IN ('orto', 'frutteto', 'uliveto', 'vigneto', 'serra', 'giardino'));

-- Aggiungi commenti per documentazione
COMMENT ON COLUMN irrigation_systems.bed_ids IS 'Array di ID delle aiuole collegate a questo sistema di irrigazione';
COMMENT ON COLUMN irrigation_systems.row_ids IS 'Array di ID dei filari collegati a questo sistema di irrigazione';
COMMENT ON COLUMN irrigation_systems.cultivation_type IS 'Tipo di coltivazione: orto, frutteto, uliveto, vigneto, serra, giardino';

-- Crea indici per migliorare le performance delle query
CREATE INDEX IF NOT EXISTS idx_irrigation_systems_bed_ids ON irrigation_systems USING GIN (bed_ids);
CREATE INDEX IF NOT EXISTS idx_irrigation_systems_row_ids ON irrigation_systems USING GIN (row_ids);
CREATE INDEX IF NOT EXISTS idx_irrigation_systems_cultivation_type ON irrigation_systems (cultivation_type);

-- Aggiorna la policy RLS se necessario (mantiene le policy esistenti)
-- Le policy esistenti dovrebbero già coprire questi campi