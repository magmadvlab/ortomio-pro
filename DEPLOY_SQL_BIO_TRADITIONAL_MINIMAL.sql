-- =====================================================
-- MIGRAZIONE MINIMA: Distinzione Bio/Tradizionale
-- Da eseguire manualmente sul database online
-- =====================================================

-- 1. Aggiungi campi alla tabella treatment_register
ALTER TABLE treatment_register 
ADD COLUMN IF NOT EXISTS treatment_type TEXT 
CHECK (treatment_type IN ('organic', 'conventional', 'integrated')) 
DEFAULT 'conventional';

ALTER TABLE treatment_register 
ADD COLUMN IF NOT EXISTS organic_approved BOOLEAN DEFAULT false;

ALTER TABLE treatment_register 
ADD COLUMN IF NOT EXISTS registration_number TEXT;

ALTER TABLE treatment_register 
ADD COLUMN IF NOT EXISTS pre_harvest_interval_days INTEGER;

-- 2. Aggiungi indici per performance
CREATE INDEX IF NOT EXISTS idx_treatment_register_type ON treatment_register(treatment_type);
CREATE INDEX IF NOT EXISTS idx_treatment_register_organic_approved ON treatment_register(organic_approved);

-- 3. Aggiungi indici per fertilizer_application_logs (se non esistono già)
CREATE INDEX IF NOT EXISTS idx_fertilizer_logs_type ON fertilizer_application_logs(fertilizer_type);

-- 4. Commenti per documentazione
COMMENT ON COLUMN treatment_register.treatment_type IS 'Tipo di trattamento: organic (biologico), conventional (tradizionale), integrated (integrato)';
COMMENT ON COLUMN treatment_register.organic_approved IS 'Indica se il prodotto è ammesso in agricoltura biologica';
COMMENT ON COLUMN treatment_register.registration_number IS 'Numero di registrazione del prodotto fitosanitario';
COMMENT ON COLUMN treatment_register.pre_harvest_interval_days IS 'Tempo di carenza in giorni prima del raccolto';

-- Fine migrazione minima