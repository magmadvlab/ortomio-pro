-- Migration: Add numeric quantity fields to seedling_batches
-- Data: 2025-12-23
-- Descrizione: Aggiunge campo initial_quantity per tracciare quantità iniziale precisa di piantine
--              Mantiene quantity e current_quantity per retrocompatibilità

-- Aggiungi colonna per quantità iniziale
ALTER TABLE seedling_batches 
ADD COLUMN IF NOT EXISTS initial_quantity INTEGER;

-- Aggiungi commento
COMMENT ON COLUMN seedling_batches.initial_quantity IS 'Quantità iniziale di piantine nel batch (es. 20)';

-- Se current_quantity è NULL ma quantity esiste, imposta current_quantity = quantity
UPDATE seedling_batches 
SET current_quantity = quantity 
WHERE current_quantity IS NULL AND quantity IS NOT NULL;

-- Se initial_quantity è NULL ma quantity esiste, imposta initial_quantity = quantity per retrocompatibilità
UPDATE seedling_batches 
SET initial_quantity = quantity 
WHERE initial_quantity IS NULL AND quantity IS NOT NULL;

