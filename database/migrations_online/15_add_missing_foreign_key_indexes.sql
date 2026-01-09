-- ============================================
-- GRUPPO 15: ADD MISSING FOREIGN KEY INDEXES
-- ============================================
-- Aggiunge indici mancanti su foreign key per migliorare le performance
-- 
-- ORDINE: Dopo tutte le altre migrazioni che creano tabelle e foreign key
-- 
-- Riferimento: Supabase Security Advisor warnings per unindexed_foreign_keys

-- ============================================
-- agronomist_consultations.garden_id
-- ============================================
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'agronomist_consultations' 
    AND indexname = 'idx_agronomist_consultations_garden_id'
  ) THEN
    CREATE INDEX idx_agronomist_consultations_garden_id 
    ON agronomist_consultations(garden_id) 
    WHERE garden_id IS NOT NULL;
    
    RAISE NOTICE 'Creato indice idx_agronomist_consultations_garden_id';
  ELSE
    RAISE NOTICE 'Indice idx_agronomist_consultations_garden_id già esistente';
  END IF;
END $do$;

-- ============================================
-- crop_learning_events.garden_id
-- ============================================
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'crop_learning_events' 
    AND indexname = 'idx_crop_learning_events_garden_id'
  ) THEN
    CREATE INDEX idx_crop_learning_events_garden_id 
    ON crop_learning_events(garden_id) 
    WHERE garden_id IS NOT NULL;
    
    RAISE NOTICE 'Creato indice idx_crop_learning_events_garden_id';
  ELSE
    RAISE NOTICE 'Indice idx_crop_learning_events_garden_id già esistente';
  END IF;
END $do$;

-- ============================================
-- garden_beds.covering_structure_id
-- ============================================
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'garden_beds' 
    AND indexname = 'idx_garden_beds_covering_structure_id'
  ) THEN
    CREATE INDEX idx_garden_beds_covering_structure_id 
    ON garden_beds(covering_structure_id) 
    WHERE covering_structure_id IS NOT NULL;
    
    RAISE NOTICE 'Creato indice idx_garden_beds_covering_structure_id';
  ELSE
    RAISE NOTICE 'Indice idx_garden_beds_covering_structure_id già esistente';
  END IF;
END $do$;

-- ============================================
-- garden_beds.structure_id
-- ============================================
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'garden_beds' 
    AND indexname = 'idx_garden_beds_structure_id'
  ) THEN
    CREATE INDEX idx_garden_beds_structure_id 
    ON garden_beds(structure_id) 
    WHERE structure_id IS NOT NULL;
    
    RAISE NOTICE 'Creato indice idx_garden_beds_structure_id';
  ELSE
    RAISE NOTICE 'Indice idx_garden_beds_structure_id già esistente';
  END IF;
END $do$;

-- ============================================
-- VERIFICA FINALE
-- ============================================
DO $do$
DECLARE
  fkey_count INTEGER;
BEGIN
  -- Conta foreign key senza indice (approssimativo)
  -- Nota: Questo è un controllo semplificato
  SELECT COUNT(*) INTO fkey_count
  FROM (
    SELECT 
      tc.table_name,
      kcu.column_name,
      tc.constraint_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND NOT EXISTS (
        SELECT 1 FROM pg_indexes pi
        WHERE pi.schemaname = 'public'
          AND pi.tablename = tc.table_name
          AND pi.indexdef LIKE '%' || kcu.column_name || '%'
      )
  ) AS fkeys_without_index;
  
  IF fkey_count > 0 THEN
    RAISE NOTICE 'Ci sono ancora % foreign key senza indice (verifica manuale consigliata)', fkey_count;
  ELSE
    RAISE NOTICE '✅ Tutte le foreign key principali hanno indici!';
  END IF;
END $do$;

