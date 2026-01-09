-- Migration: Add seed packet and seedling batch tracking to garden_tasks
-- Aggiunge tracciamento origine pianta (semi o piantine)
-- Data: 2025-01-XX
-- Descrizione: Aggiunge campi per collegare i task ai pacchetti di semi o batch di piantine utilizzati

-- Aggiungi colonna seed_packet_id (FK a seed_inventory)
ALTER TABLE garden_tasks 
ADD COLUMN IF NOT EXISTS seed_packet_id UUID REFERENCES seed_inventory(id) ON DELETE SET NULL;

-- Aggiungi colonna seedling_batch_id (FK a seedling_batches)
ALTER TABLE garden_tasks 
ADD COLUMN IF NOT EXISTS seedling_batch_id UUID REFERENCES seedling_batches(id) ON DELETE SET NULL;

-- Crea indici per performance
CREATE INDEX IF NOT EXISTS idx_garden_tasks_seed_packet_id 
ON garden_tasks(seed_packet_id) WHERE seed_packet_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_garden_tasks_seedling_batch_id 
ON garden_tasks(seedling_batch_id) WHERE seedling_batch_id IS NOT NULL;

-- Aggiungi commenti
COMMENT ON COLUMN garden_tasks.seed_packet_id IS 'ID pacchetto semi usato (se planting_method=Seed)';
COMMENT ON COLUMN garden_tasks.seedling_batch_id IS 'ID batch piantine usato (se planting_method=Seedling)';

