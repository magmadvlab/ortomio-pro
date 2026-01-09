-- Migration: Add IntermediateRepotting lifecycle phase
-- Aggiunge la fase 'IntermediateRepotting' al CHECK constraint di lifecycle_state
-- Questa fase è stata aggiunta nel codice TypeScript ma mancava nel database
--
-- Data: 2025-01-XX
-- Descrizione: Aggiunge supporto per la fase 'IntermediateRepotting' nel ciclo vitale delle piante
--              che viene utilizzata quando è necessario un rinvaso intermedio prima del trapianto finale

-- Rimuovi il constraint esistente
ALTER TABLE garden_tasks 
DROP CONSTRAINT IF EXISTS garden_tasks_lifecycle_state_check;

-- Aggiungi il nuovo constraint con IntermediateRepotting incluso
ALTER TABLE garden_tasks 
ADD CONSTRAINT garden_tasks_lifecycle_state_check 
CHECK (lifecycle_state IN ('Sowing', 'Germination', 'Nursing', 'IntermediateRepotting', 'Hardening', 'Transplanting', 'Production'));

-- Verifica che il constraint sia stato applicato correttamente
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'garden_tasks_lifecycle_state_check'
    AND pg_get_constraintdef(oid) LIKE '%IntermediateRepotting%'
  ) THEN
    RAISE NOTICE '✅ Constraint aggiornato con successo: IntermediateRepotting aggiunto';
  ELSE
    RAISE WARNING '⚠️ Verifica manuale richiesta: il constraint potrebbe non essere stato aggiornato correttamente';
  END IF;
END $$;

