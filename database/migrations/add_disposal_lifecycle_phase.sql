-- Migration: Add Disposal phase to lifecycle_state
-- Aggiunge la fase 'Disposal' al CHECK constraint di lifecycle_state
-- Data: 2025-01-XX
-- Descrizione: Aggiunge supporto per la fase 'Disposal' nel ciclo vitale delle piante
--              che viene utilizzata quando una pianta viene rimossa dopo il raccolto finale

-- Rimuovi il constraint esistente
ALTER TABLE garden_tasks 
DROP CONSTRAINT IF EXISTS garden_tasks_lifecycle_state_check;

-- Aggiungi il nuovo constraint con Disposal incluso
ALTER TABLE garden_tasks 
ADD CONSTRAINT garden_tasks_lifecycle_state_check 
CHECK (lifecycle_state IN ('Sowing', 'Germination', 'Nursing', 'IntermediateRepotting', 'Hardening', 'Transplanting', 'Production', 'Disposal'));

-- Verifica che il constraint sia stato applicato correttamente
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'garden_tasks_lifecycle_state_check'
    AND pg_get_constraintdef(oid) LIKE '%Disposal%'
  ) THEN
    RAISE NOTICE '✅ Constraint aggiornato con successo: Disposal aggiunto';
  ELSE
    RAISE WARNING '⚠️ Verifica manuale richiesta: il constraint potrebbe non essere stato aggiornato correttamente';
  END IF;
END $$;

