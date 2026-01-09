-- ============================================
-- Allineamento Schema: calendar_tasks → garden_tasks
-- Data: 2026-01-02
-- ============================================

-- IMPORTANTE: Questo garantisce che LOCALE e ONLINE usino lo stesso schema

-- Rinomina tabella (se esiste calendar_tasks)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'calendar_tasks'
  ) THEN
    ALTER TABLE public.calendar_tasks RENAME TO garden_tasks;
    RAISE NOTICE 'Tabella rinominata: calendar_tasks → garden_tasks';
  ELSE
    RAISE NOTICE 'Tabella garden_tasks già presente';
  END IF;
END $$;

-- Rinomina colonna start_date → date (se esiste)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'garden_tasks'
    AND column_name = 'start_date'
  ) THEN
    ALTER TABLE public.garden_tasks RENAME COLUMN start_date TO date;
    RAISE NOTICE 'Colonna rinominata: start_date → date';
  ELSE
    RAISE NOTICE 'Colonna date già presente';
  END IF;
END $$;

-- Rinomina indici (se esistono con nomi vecchi)
DO $$
BEGIN
  -- Primary key
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'calendar_tasks_pkey') THEN
    ALTER INDEX calendar_tasks_pkey RENAME TO garden_tasks_pkey;
  END IF;

  -- Altri indici
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_calendar_tasks_garden') THEN
    ALTER INDEX idx_calendar_tasks_garden RENAME TO idx_garden_tasks_garden;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_calendar_tasks_recurring') THEN
    ALTER INDEX idx_calendar_tasks_recurring RENAME TO idx_garden_tasks_recurring;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_calendar_tasks_user_date') THEN
    ALTER INDEX idx_calendar_tasks_user_date RENAME TO idx_garden_tasks_user_date;
  END IF;

  RAISE NOTICE 'Indici rinominati';
END $$;

-- Rinomina constraints (se esistono con nomi vecchi)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'garden_tasks' AND constraint_name = 'calendar_tasks_type_check'
  ) THEN
    ALTER TABLE garden_tasks RENAME CONSTRAINT calendar_tasks_type_check TO garden_tasks_type_check;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'garden_tasks' AND constraint_name = 'calendar_tasks_garden_id_fkey'
  ) THEN
    ALTER TABLE garden_tasks RENAME CONSTRAINT calendar_tasks_garden_id_fkey TO garden_tasks_garden_id_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'garden_tasks' AND constraint_name = 'calendar_tasks_user_id_fkey'
  ) THEN
    ALTER TABLE garden_tasks RENAME CONSTRAINT calendar_tasks_user_id_fkey TO garden_tasks_user_id_fkey;
  END IF;

  RAISE NOTICE 'Constraints rinominati';
END $$;

-- ============================================
-- VERIFICA FINALE
-- ============================================

-- Verifica che garden_tasks esista
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'garden_tasks'
  ) THEN
    RAISE EXCEPTION 'garden_tasks table not found!';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'garden_tasks'
    AND column_name = 'date'
  ) THEN
    RAISE EXCEPTION 'date column not found in garden_tasks!';
  END IF;

  RAISE NOTICE '✅ Schema allineato: garden_tasks.date OK';
END $$;

-- ============================================
-- NOTE
-- ============================================

-- LOCALE e ONLINE ora usano:
-- - Tabella: garden_tasks
-- - Colonna date: date (non start_date)
-- - Codice: SupabaseStorageProvider usa from('garden_tasks')
-- - Ordinamento: order('date')
