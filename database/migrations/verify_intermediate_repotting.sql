-- Query di verifica: Controlla che il constraint includa IntermediateRepotting
-- Esegui questa query per verificare che la migrazione sia stata applicata correttamente

SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conname = 'garden_tasks_lifecycle_state_check';

