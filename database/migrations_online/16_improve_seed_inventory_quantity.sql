-- ============================================
-- GRUPPO 16: MIGLIORAMENTO QUANTITÀ BANCA SEMI
-- ============================================
-- Aggiunge supporto per quantità flessibili nella banca dei semi
-- Permette range (es. "10-1000"), numeri grandi (es. "1000000"), 
-- approssimazioni (es. "~50") e valori testuali (es. "Molti")
--
-- ORDINE: Dopo core schema (01) e seed inventory (02)
--
-- Riferimento: database/schema.sql (linea 265-281)

-- ============================================
-- AGGIUNTA COLONNE PER QUANTITÀ FLESSIBILI
-- ============================================

DO $$
BEGIN
  -- Aggiungi colonna per display quantità (testo originale inserito dall'utente)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'seed_inventory'
    AND column_name = 'quantity_display'
  ) THEN
    ALTER TABLE public.seed_inventory
    ADD COLUMN quantity_display TEXT;
    
    RAISE NOTICE 'Aggiunta colonna quantity_display a seed_inventory';
  ELSE
    RAISE NOTICE 'Colonna quantity_display già esistente in seed_inventory';
  END IF;

  -- Aggiungi colonna per quantità minima (per range)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'seed_inventory'
    AND column_name = 'quantity_min'
  ) THEN
    ALTER TABLE public.seed_inventory
    ADD COLUMN quantity_min INTEGER;
    
    RAISE NOTICE 'Aggiunta colonna quantity_min a seed_inventory';
  ELSE
    RAISE NOTICE 'Colonna quantity_min già esistente in seed_inventory';
  END IF;

  -- Aggiungi colonna per quantità massima (per range)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'seed_inventory'
    AND column_name = 'quantity_max'
  ) THEN
    ALTER TABLE public.seed_inventory
    ADD COLUMN quantity_max INTEGER;
    
    RAISE NOTICE 'Aggiunta colonna quantity_max a seed_inventory';
  ELSE
    RAISE NOTICE 'Colonna quantity_max già esistente in seed_inventory';
  END IF;

  -- Aggiungi colonna per quantità esatta (per valori singoli)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'seed_inventory'
    AND column_name = 'quantity_exact'
  ) THEN
    ALTER TABLE public.seed_inventory
    ADD COLUMN quantity_exact INTEGER;
    
    RAISE NOTICE 'Aggiunta colonna quantity_exact a seed_inventory';
  ELSE
    RAISE NOTICE 'Colonna quantity_exact già esistente in seed_inventory';
  END IF;
END $$;

-- ============================================
-- FUNZIONE HELPER: Parse quantità da testo
-- ============================================
-- Converte stringhe come "10-1000", "1000000", "~50", "Molti" in valori strutturati
-- Questa funzione può essere chiamata dall'applicazione TypeScript

COMMENT ON COLUMN public.seed_inventory.quantity_display IS 
'Display originale della quantità inserita dall''utente (es. "10", "10-1000", "1000000", "~50", "Molti")';

COMMENT ON COLUMN public.seed_inventory.quantity_min IS 
'Quantità minima per range (NULL se valore esatto o solo display)';

COMMENT ON COLUMN public.seed_inventory.quantity_max IS 
'Quantità massima per range (NULL se valore esatto o solo display)';

COMMENT ON COLUMN public.seed_inventory.quantity_exact IS 
'Quantità esatta per valori singoli o approssimati (NULL se range o solo display)';

-- ============================================
-- MIGRAZIONE DATI ESISTENTI
-- ============================================
-- Se ci sono già dati con initial_quantity, migrarli a quantity_exact e quantity_display

DO $$
DECLARE
  rcount INTEGER;
BEGIN
  UPDATE public.seed_inventory
  SET 
    quantity_exact = initial_quantity,
    quantity_display = initial_quantity::TEXT
  WHERE initial_quantity IS NOT NULL
    AND quantity_display IS NULL;
  
  GET DIAGNOSTICS rcount = ROW_COUNT;
  RAISE NOTICE 'Migrati % record esistenti con initial_quantity', rcount;
END $$;

