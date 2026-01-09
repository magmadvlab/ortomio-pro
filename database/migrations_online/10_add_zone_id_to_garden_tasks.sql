-- ============================================
-- GRUPPO 10: AGGIUNTA ZONE_ID A GARDEN_TASKS
-- ============================================
-- Aggiunge supporto per precision agriculture zones ai garden_tasks
-- 
-- ORDINE: Dopo core schema (01) e garden features (04)
-- 
-- NOTA: Se garden_zones non esiste ancora, la colonna viene aggiunta senza FK.
-- La FK verrà aggiunta quando garden_zones sarà disponibile.
-- 
-- Riferimento: database/migrations/add_precision_agriculture_schema.sql (linea 340-344)
--              database/export_schema.sql (linea 79-87)
--              database/schema.sql (linea 182, 201)

-- Verifica se la colonna zone_id esiste già
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'garden_tasks' 
    AND column_name = 'zone_id'
  ) THEN
    -- Aggiungi colonna zone_id
    -- Se garden_zones esiste, aggiungi FK, altrimenti solo colonna
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'garden_zones'
    ) THEN
      -- garden_zones esiste, aggiungi con FK (come in add_precision_agriculture_schema.sql)
      ALTER TABLE garden_tasks
      ADD COLUMN zone_id UUID REFERENCES garden_zones(id) ON DELETE SET NULL;
      
      RAISE NOTICE 'Aggiunta colonna zone_id a garden_tasks con FK a garden_zones';
    ELSE
      -- garden_zones non esiste, aggiungi solo colonna (come in schema.sql linea 182)
      ALTER TABLE garden_tasks
      ADD COLUMN zone_id UUID;
      
      RAISE NOTICE 'Aggiunta colonna zone_id a garden_tasks (senza FK, garden_zones non esiste ancora)';
    END IF;
    
    -- Crea indice con WHERE per efficienza (come in schema.sql linea 201)
    CREATE INDEX IF NOT EXISTS idx_garden_tasks_zone_id ON garden_tasks(zone_id) WHERE zone_id IS NOT NULL;
    
    RAISE NOTICE 'Creato indice idx_garden_tasks_zone_id';
  ELSE
    RAISE NOTICE 'Colonna zone_id già esistente in garden_tasks';
  END IF;
END $$;

-- Se garden_zones viene aggiunta successivamente e la colonna esiste senza FK,
-- eseguire questo per aggiungere la FK:
-- ALTER TABLE garden_tasks
-- ADD CONSTRAINT fk_garden_tasks_zone_id 
-- FOREIGN KEY (zone_id) REFERENCES garden_zones(id) ON DELETE SET NULL;

