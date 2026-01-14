-- Aggiunge collegamento tra task e schede prodotto
-- Permette di tracciare quale prodotto è stato usato per ogni task

-- Aggiungi colonna per collegare task a product_cards
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS product_card_id UUID REFERENCES product_cards(id) ON DELETE SET NULL;

-- Indice per performance
CREATE INDEX IF NOT EXISTS idx_tasks_product_card_id ON tasks(product_card_id);

-- Commento per documentazione
COMMENT ON COLUMN tasks.product_card_id IS 'Collegamento alla scheda prodotto utilizzata per questo task (fertilizzante o trattamento)';

-- Funzione per aggiornare automaticamente usage delle schede prodotto
CREATE OR REPLACE FUNCTION update_product_card_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Se il task è completato e ha un product_card_id, aggiorna la scheda
  IF NEW.completed = true AND NEW.product_card_id IS NOT NULL AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    UPDATE product_cards 
    SET 
      last_used = NOW(),
      times_used = times_used + 1,
      application_history = application_history || jsonb_build_object(
        'date', NEW.actual_completed_date::text,
        'taskId', NEW.id::text,
        'plantName', NEW.plant_name,
        'notes', NEW.notes,
        'completedAt', NOW()::text
      )
    WHERE id = NEW.product_card_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per aggiornare usage quando un task viene completato
DROP TRIGGER IF EXISTS trigger_update_product_card_usage ON tasks;
CREATE TRIGGER trigger_update_product_card_usage
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_product_card_usage();