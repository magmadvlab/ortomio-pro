-- Migration: Add numeric quantity fields to sapling_batches
-- Data: 2025-12-23
-- Descrizione: Aggiunge campo initial_quantity per tracciare quantità iniziale precisa di alberelli
--              Mantiene quantity e current_quantity per retrocompatibilità

-- Aggiungi colonna per quantità iniziale
ALTER TABLE sapling_batches 
ADD COLUMN IF NOT EXISTS initial_quantity INTEGER;

-- Aggiungi commento
COMMENT ON COLUMN sapling_batches.initial_quantity IS 'Quantità iniziale di alberelli nel batch (es. 10)';

-- Se current_quantity è NULL ma quantity esiste, imposta current_quantity = quantity
UPDATE sapling_batches 
SET current_quantity = quantity 
WHERE current_quantity IS NULL AND quantity IS NOT NULL;

-- Se initial_quantity è NULL ma quantity esiste, imposta initial_quantity = quantity per retrocompatibilità
UPDATE sapling_batches 
SET initial_quantity = quantity 
WHERE initial_quantity IS NULL AND quantity IS NOT NULL;

