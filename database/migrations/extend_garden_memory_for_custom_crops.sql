-- Migration: Extend Garden Memory for Custom Crops
-- Aggiunge supporto per colture personalizzate nel sistema di memoria del giardino
-- 
-- PREREQUISITI:
-- - Le tabelle custom_crops devono esistere (applica prima add_custom_crops.sql)
-- - Le tabelle garden_zone_memories, garden_patterns, garden_correlations devono esistere
--   (se non esistono, vengono create automaticamente nello schema_complete.sql)

-- ============================================
-- Estendi GARDEN ZONE MEMORIES
-- ============================================
-- Verifica che la tabella esista prima di aggiungere colonna
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'garden_zone_memories') THEN
    ALTER TABLE garden_zone_memories
      ADD COLUMN IF NOT EXISTS custom_crop_id UUID REFERENCES custom_crops(id) ON DELETE SET NULL;
    
    CREATE INDEX IF NOT EXISTS idx_zone_memories_custom_crop_id ON garden_zone_memories(custom_crop_id);
    
    COMMENT ON COLUMN garden_zone_memories.custom_crop_id IS 'Riferimento a coltura personalizzata (se applicabile)';
  END IF;
END $$;

-- ============================================
-- Estendi GARDEN PATTERNS
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'garden_patterns') THEN
    ALTER TABLE garden_patterns
      ADD COLUMN IF NOT EXISTS custom_crop_id UUID REFERENCES custom_crops(id) ON DELETE SET NULL;
    
    CREATE INDEX IF NOT EXISTS idx_patterns_custom_crop_id ON garden_patterns(custom_crop_id);
    
    COMMENT ON COLUMN garden_patterns.custom_crop_id IS 'Riferimento a coltura personalizzata per cui è stato identificato il pattern';
  END IF;
END $$;

-- ============================================
-- Estendi GARDEN CORRELATIONS
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'garden_correlations') THEN
    ALTER TABLE garden_correlations
      ADD COLUMN IF NOT EXISTS custom_crop_id UUID REFERENCES custom_crops(id) ON DELETE SET NULL;
    
    CREATE INDEX IF NOT EXISTS idx_correlations_custom_crop_id ON garden_correlations(custom_crop_id);
    
    COMMENT ON COLUMN garden_correlations.custom_crop_id IS 'Riferimento a coltura personalizzata per cui è stata identificata la correlazione';
  END IF;
END $$;

