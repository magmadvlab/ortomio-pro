-- Migration: Add purchased seedling fields to seedling_batches
-- Aggiunge supporto per piantine acquistate al vivaio
-- Data: 2025-01-XX
-- Descrizione: Aggiunge campi per distinguere tra piantine seminate in casa e acquistate

-- Aggiungi colonna source
ALTER TABLE seedling_batches 
ADD COLUMN IF NOT EXISTS source TEXT CHECK (source IN ('home', 'nursery')) DEFAULT 'home';

-- Aggiungi colonna purchase_date (solo per source='nursery')
ALTER TABLE seedling_batches 
ADD COLUMN IF NOT EXISTS purchase_date DATE;

-- Aggiungi colonna nursery_name (opzionale)
ALTER TABLE seedling_batches 
ADD COLUMN IF NOT EXISTS nursery_name TEXT;

-- Aggiungi commenti alle colonne
COMMENT ON COLUMN seedling_batches.source IS 'Origine piantine: home (seminate in casa) o nursery (acquistate)';
COMMENT ON COLUMN seedling_batches.purchase_date IS 'Data acquisto (solo per source=nursery)';
COMMENT ON COLUMN seedling_batches.nursery_name IS 'Nome vivaio (opzionale)';

-- Verifica che il constraint phase includa tutte le fasi necessarie
DO $$
BEGIN
  -- Verifica se il constraint esiste e include tutte le fasi
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'seedling_batches_phase_check'
    AND pg_get_constraintdef(oid) LIKE '%ReadyToTransplant%'
  ) THEN
    RAISE NOTICE '✅ Constraint phase già aggiornato';
  ELSE
    -- Rimuovi constraint esistente se presente
    ALTER TABLE seedling_batches DROP CONSTRAINT IF EXISTS seedling_batches_phase_check;
    
    -- Aggiungi nuovo constraint con tutte le fasi
    ALTER TABLE seedling_batches 
    ADD CONSTRAINT seedling_batches_phase_check 
    CHECK (phase IN ('Sowing', 'Germination', 'Nursing', 'Hardening', 'ReadyToTransplant'));
    
    RAISE NOTICE '✅ Constraint phase aggiornato con successo';
  END IF;
END $$;

