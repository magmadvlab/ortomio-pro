-- ============================================
-- GRUPPO 11: INDICE PER DATA COMPLETAMENTO
-- ============================================
-- Aggiunge indice su actual_completed_date per ottimizzare query
-- su task completati filtrati per data di completamento
-- 
-- ORDINE: Dopo core schema (01)
-- 
-- Riferimento: Miglioramenti Journal per tracking date completamento

-- Verifica se l'indice esiste già
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'garden_tasks' 
    AND indexname = 'idx_garden_tasks_actual_completed_date'
  ) THEN
    -- Crea indice parziale (solo per task completati con data)
    CREATE INDEX idx_garden_tasks_actual_completed_date 
    ON garden_tasks(actual_completed_date) 
    WHERE actual_completed_date IS NOT NULL;
    
    RAISE NOTICE 'Creato indice idx_garden_tasks_actual_completed_date';
  ELSE
    RAISE NOTICE 'Indice idx_garden_tasks_actual_completed_date già esistente';
  END IF;
END $$;

