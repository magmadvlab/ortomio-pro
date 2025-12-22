-- Migration: Add sapling batch tracking to garden_tasks
-- Aggiunge tracciamento origine alberelli
-- Data: 2025-01-XX
-- Descrizione: Aggiunge campo per collegare i task ai batch di alberelli utilizzati

-- IMPORTANTE: Assicurati che la tabella sapling_batches esista prima!
-- Se non esiste, esegui prima la migrazione add_sapling_batches_table.sql

-- Aggiungi colonna sapling_batch_id (FK a sapling_batches)
ALTER TABLE garden_tasks 
ADD COLUMN IF NOT EXISTS sapling_batch_id UUID REFERENCES sapling_batches(id) ON DELETE SET NULL;

-- Crea indice per performance
CREATE INDEX IF NOT EXISTS idx_garden_tasks_sapling_batch_id 
ON garden_tasks(sapling_batch_id) WHERE sapling_batch_id IS NOT NULL;

-- Aggiungi commento
COMMENT ON COLUMN garden_tasks.sapling_batch_id IS 'ID batch alberelli usato (se planting_method=Sapling)';

