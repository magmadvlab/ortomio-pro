-- Migration: Add numeric quantity fields to seed_inventory
-- Data: 2025-12-23
-- Descrizione: Aggiunge campi per tracciare quantità numerica precisa di semi (iniziale e corrente)
--              Mantiene quantity_remaining per retrocompatibilità

-- Aggiungi colonne per quantità numerica
ALTER TABLE seed_inventory 
ADD COLUMN IF NOT EXISTS initial_quantity INTEGER,
ADD COLUMN IF NOT EXISTS current_quantity INTEGER;

-- Aggiungi commenti
COMMENT ON COLUMN seed_inventory.initial_quantity IS 'Quantità iniziale di semi nel pacchetto (es. 100)';
COMMENT ON COLUMN seed_inventory.current_quantity IS 'Quantità corrente rimanente (es. 90 dopo aver usato 10)';

-- Crea funzione per calcolare quantity_remaining basato su current_quantity
CREATE OR REPLACE FUNCTION calculate_quantity_remaining(
  current_qty INTEGER,
  initial_qty INTEGER DEFAULT NULL
) RETURNS TEXT AS $$
BEGIN
  -- Se current_quantity è NULL o 0, restituisci Empty
  IF current_qty IS NULL OR current_qty = 0 THEN
    RETURN 'Empty';
  END IF;
  
  -- Se abbiamo initial_quantity, calcola percentuale
  IF initial_qty IS NOT NULL AND initial_qty > 0 THEN
    IF (current_qty::DECIMAL / initial_qty::DECIMAL * 100) >= 75 THEN
      RETURN 'High';
    ELSIF (current_qty::DECIMAL / initial_qty::DECIMAL * 100) >= 50 THEN
      RETURN 'Medium';
    ELSIF (current_qty::DECIMAL / initial_qty::DECIMAL * 100) >= 25 THEN
      RETURN 'Low';
    ELSE
      RETURN 'Empty';
    END IF;
  END IF;
  
  -- Fallback su valori assoluti se non abbiamo initial_quantity
  IF current_qty >= 50 THEN
    RETURN 'High';
  ELSIF current_qty >= 20 THEN
    RETURN 'Medium';
  ELSIF current_qty >= 1 THEN
    RETURN 'Low';
  ELSE
    RETURN 'Empty';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Crea trigger per aggiornare automaticamente quantity_remaining quando cambia current_quantity
CREATE OR REPLACE FUNCTION update_seed_quantity_remaining()
RETURNS TRIGGER AS $$
BEGIN
  -- Aggiorna quantity_remaining basato su current_quantity
  NEW.quantity_remaining := calculate_quantity_remaining(
    NEW.current_quantity,
    NEW.initial_quantity
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crea trigger se non esiste già
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_update_seed_quantity_remaining'
  ) THEN
    CREATE TRIGGER trigger_update_seed_quantity_remaining
      BEFORE INSERT OR UPDATE OF current_quantity, initial_quantity ON seed_inventory
      FOR EACH ROW
      EXECUTE FUNCTION update_seed_quantity_remaining();
  END IF;
END $$;

