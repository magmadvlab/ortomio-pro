-- ============================================
-- GRUPPO 17: TRACKING DETTAGLIATO SEMINA/GERMINAZIONE
-- ============================================
-- Aggiunge colonna sowing_details JSONB a garden_tasks per tracciare:
-- - Tipo contenitore (vassoio, vaso, diretto)
-- - Dimensione vassoio
-- - Semi per cella
-- - Tasso germinazione atteso
-- - Piantine attese
-- - Area occupata durante germinazione e dopo trapianto
--
-- ORDINE: Dopo core schema (01) e garden tasks (04)
--
-- Riferimento: database/schema.sql (linea 114-158)

-- ============================================
-- AGGIUNTA COLONNA SOWING_DETAILS
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'garden_tasks'
    AND column_name = 'sowing_details'
  ) THEN
    ALTER TABLE public.garden_tasks
    ADD COLUMN sowing_details JSONB;

    RAISE NOTICE 'Aggiunta colonna sowing_details a garden_tasks';
  ELSE
    RAISE NOTICE 'Colonna sowing_details già esistente in garden_tasks';
  END IF;
END $$;

-- ============================================
-- COMMENTI E DOCUMENTAZIONE
-- ============================================

COMMENT ON COLUMN public.garden_tasks.sowing_details IS 
'Dettagli semina/germinazione in formato JSONB. Struttura:
{
  "containerType": "GerminationTray" | "Pot" | "Direct" | "Hydroponic",
  "traySize": "50 celle" | "128 celle",
  "seedsPerCell": 2,
  "expectedGerminationRate": 0.8,
  "expectedSeedlings": 40,
  "germinationAreaSqm": 0.5,
  "finalPlantingAreaSqm": 2.0,
  "germinationLocation": "Indoor" | "Greenhouse" | "ColdFrame" | "Outdoor",
  "temperature": 22
}';

-- ============================================
-- INDICE PER QUERY SU SOWING_DETAILS
-- ============================================
-- Indice GIN per query efficienti su JSONB

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'garden_tasks'
    AND indexname = 'idx_garden_tasks_sowing_details'
  ) THEN
    CREATE INDEX idx_garden_tasks_sowing_details ON public.garden_tasks USING GIN (sowing_details);
    
    RAISE NOTICE 'Creato indice GIN idx_garden_tasks_sowing_details';
  ELSE
    RAISE NOTICE 'Indice idx_garden_tasks_sowing_details già esistente';
  END IF;
END $$;

