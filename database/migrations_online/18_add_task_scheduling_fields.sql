-- ============================================
-- GRUPPO 18: SCHEDULIZZAZIONE TASK
-- ============================================
-- Aggiunge campi per pianificazione task futuri e ricorrenti
-- Permette di distinguere tra task immediati, pianificati e ricorrenti
--
-- ORDINE: Dopo core schema (01) e garden tasks (04)
--
-- Riferimento: database/schema.sql (linea 114-158)

-- ============================================
-- AGGIUNTA CAMPI SCHEDULING
-- ============================================

DO $$
BEGIN
  -- Aggiungi colonna scheduled_date (data pianificata, diversa da date che è quando fatto)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'garden_tasks'
    AND column_name = 'scheduled_date'
  ) THEN
    ALTER TABLE public.garden_tasks
    ADD COLUMN scheduled_date DATE;

    RAISE NOTICE 'Aggiunta colonna scheduled_date a garden_tasks';
  ELSE
    RAISE NOTICE 'Colonna scheduled_date già esistente in garden_tasks';
  END IF;

  -- Aggiungi colonna scheduling_type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'garden_tasks'
    AND column_name = 'scheduling_type'
  ) THEN
    ALTER TABLE public.garden_tasks
    ADD COLUMN scheduling_type TEXT CHECK (scheduling_type IN ('Immediate', 'Scheduled', 'Recurring'));

    RAISE NOTICE 'Aggiunta colonna scheduling_type a garden_tasks';
  ELSE
    RAISE NOTICE 'Colonna scheduling_type già esistente in garden_tasks';
  END IF;

  -- Aggiungi colonna recurrence_pattern (JSONB per pattern ricorrenze)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'garden_tasks'
    AND column_name = 'recurrence_pattern'
  ) THEN
    ALTER TABLE public.garden_tasks
    ADD COLUMN recurrence_pattern JSONB;

    RAISE NOTICE 'Aggiunta colonna recurrence_pattern a garden_tasks';
  ELSE
    RAISE NOTICE 'Colonna recurrence_pattern già esistente in garden_tasks';
  END IF;
END $$;

-- ============================================
-- COMMENTI E DOCUMENTAZIONE
-- ============================================

COMMENT ON COLUMN public.garden_tasks.scheduled_date IS 
'Data pianificata per il task (diversa da date che è quando il task è stato effettivamente fatto).
Usata per task futuri che devono essere eseguiti in una data specifica.';

COMMENT ON COLUMN public.garden_tasks.scheduling_type IS 
'Tipo di schedulizzazione:
- Immediate: Task da fare subito (default, scheduled_date = NULL)
- Scheduled: Task pianificato per una data futura (scheduled_date != NULL)
- Recurring: Task ricorrente (recurrence_pattern != NULL)';

COMMENT ON COLUMN public.garden_tasks.recurrence_pattern IS 
'Pattern di ricorrenza in formato JSONB. Struttura:
{
  "frequency": "Daily" | "Weekly" | "Monthly" | "Yearly",
  "interval": 1, // Ogni N giorni/settimane/mesi/anni
  "endDate": "2024-12-31", // Data fine ricorrenza (opzionale)
  "daysOfWeek": [1, 3, 5], // Per Weekly: lunedì, mercoledì, venerdì (opzionale)
  "dayOfMonth": 15, // Per Monthly: giorno del mese (opzionale)
  "monthOfYear": 3 // Per Yearly: mese dell''anno (opzionale)
}';

-- ============================================
-- INDICI PER QUERY SU SCHEDULING
-- ============================================

DO $$
BEGIN
  -- Indice per query su scheduled_date
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'garden_tasks'
    AND indexname = 'idx_garden_tasks_scheduled_date'
  ) THEN
    CREATE INDEX idx_garden_tasks_scheduled_date 
    ON public.garden_tasks(scheduled_date) 
    WHERE scheduled_date IS NOT NULL;
    
    RAISE NOTICE 'Creato indice idx_garden_tasks_scheduled_date';
  ELSE
    RAISE NOTICE 'Indice idx_garden_tasks_scheduled_date già esistente';
  END IF;

  -- Indice per query su scheduling_type
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'garden_tasks'
    AND indexname = 'idx_garden_tasks_scheduling_type'
  ) THEN
    CREATE INDEX idx_garden_tasks_scheduling_type 
    ON public.garden_tasks(scheduling_type) 
    WHERE scheduling_type IS NOT NULL;
    
    RAISE NOTICE 'Creato indice idx_garden_tasks_scheduling_type';
  ELSE
    RAISE NOTICE 'Indice idx_garden_tasks_scheduling_type già esistente';
  END IF;
END $$;

