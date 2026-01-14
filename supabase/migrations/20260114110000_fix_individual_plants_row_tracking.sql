-- ============================================
-- Migration: Fix Individual Plants Row Tracking
-- Data: 2026-01-14
-- Descrizione: Aggiunge tracking filari a garden_plants (non alla view)
-- ============================================

-- IMPORTANTE: individual_plants è una VIEW che punta a garden_plants
-- Dobbiamo modificare garden_plants, non individual_plants

-- 1. EXTEND GARDEN_PLANTS SCHEMA (tabella reale)
-- Connect plants to rows (garden_rows or field_rows)

-- Verifica se garden_plants esiste
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'garden_plants' AND table_schema = 'public') THEN
    
    -- Aggiungi colonne se non esistono
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garden_plants' AND column_name = 'garden_row_id') THEN
      ALTER TABLE public.garden_plants 
      ADD COLUMN garden_row_id UUID REFERENCES public.garden_rows(id) ON DELETE SET NULL;
      RAISE NOTICE 'Added garden_row_id to garden_plants';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garden_plants' AND column_name = 'field_row_id') THEN
      ALTER TABLE public.garden_plants 
      ADD COLUMN field_row_id UUID REFERENCES public.field_rows(id) ON DELETE SET NULL;
      RAISE NOTICE 'Added field_row_id to garden_plants';
    END IF;
    
    -- Constraint: plant can only be in one type of row
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'check_single_row_type' AND table_name = 'garden_plants') THEN
      ALTER TABLE public.garden_plants 
      ADD CONSTRAINT check_single_row_type 
      CHECK (
        (garden_row_id IS NULL AND field_row_id IS NULL) OR
        (garden_row_id IS NOT NULL AND field_row_id IS NULL) OR
        (garden_row_id IS NULL AND field_row_id IS NOT NULL)
      );
      RAISE NOTICE 'Added check_single_row_type constraint to garden_plants';
    END IF;
    
    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_garden_plants_garden_row_id ON public.garden_plants(garden_row_id);
    CREATE INDEX IF NOT EXISTS idx_garden_plants_field_row_id ON public.garden_plants(field_row_id);
    
    RAISE NOTICE 'Successfully added row tracking to garden_plants table';
    
  ELSE
    RAISE NOTICE 'garden_plants table does not exist - skipping row tracking';
  END IF;
END $$;

-- 2. EXTEND PLANT_OPERATIONS SCHEMA (se esiste)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plant_operations' AND table_schema = 'public') THEN
    
    -- Aggiungi colonne se non esistono
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plant_operations' AND column_name = 'garden_row_id') THEN
      ALTER TABLE public.plant_operations 
      ADD COLUMN garden_row_id UUID REFERENCES public.garden_rows(id) ON DELETE SET NULL;
      RAISE NOTICE 'Added garden_row_id to plant_operations';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plant_operations' AND column_name = 'field_row_id') THEN
      ALTER TABLE public.plant_operations 
      ADD COLUMN field_row_id UUID REFERENCES public.field_rows(id) ON DELETE SET NULL;
      RAISE NOTICE 'Added field_row_id to plant_operations';
    END IF;
    
    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_plant_operations_garden_row_id ON public.plant_operations(garden_row_id);
    CREATE INDEX IF NOT EXISTS idx_plant_operations_field_row_id ON public.plant_operations(field_row_id);
    
    RAISE NOTICE 'Successfully added row tracking to plant_operations table';
    
  ELSE
    RAISE NOTICE 'plant_operations table does not exist - skipping';
  END IF;
END $$;

-- 3. RICREA LA VIEW individual_plants (se necessario)
-- Assicurati che la view punti a garden_plants con le nuove colonne
DROP VIEW IF EXISTS public.individual_plants CASCADE;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'garden_plants' AND table_schema = 'public') THEN
    CREATE VIEW public.individual_plants AS 
    SELECT * FROM public.garden_plants;
    
    GRANT SELECT ON public.individual_plants TO authenticated;
    
    RAISE NOTICE 'Recreated individual_plants view with row tracking columns';
  END IF;
END $$;

-- 4. COMMENTI PER DOCUMENTAZIONE
COMMENT ON COLUMN public.garden_plants.garden_row_id IS 'Reference to garden_rows for traditional bed-based gardens';
COMMENT ON COLUMN public.garden_plants.field_row_id IS 'Reference to field_rows for professional field-based gardens';

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ Individual plants row tracking migration completed successfully';
  RAISE NOTICE '   - Modified garden_plants table (not the view)';
  RAISE NOTICE '   - Added garden_row_id and field_row_id columns';
  RAISE NOTICE '   - Added constraints and indexes';
  RAISE NOTICE '   - Recreated individual_plants view';
END $$;
