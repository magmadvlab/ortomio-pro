-- Migration: Fix RLS for Custom Crops and Garden Memory Tables
-- Abilita Row Level Security per tutte le nuove tabelle

-- ============================================
-- Abilita RLS per Custom Crops
-- ============================================
ALTER TABLE custom_crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_learning_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Abilita RLS per Garden Memory Tables
-- ============================================
-- Verifica esistenza tabelle prima di abilitare RLS
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'garden_zone_memories') THEN
    ALTER TABLE garden_zone_memories ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'garden_tree_memories') THEN
    ALTER TABLE garden_tree_memories ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'garden_patterns') THEN
    ALTER TABLE garden_patterns ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'garden_correlations') THEN
    ALTER TABLE garden_correlations ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'garden_season_analyses') THEN
    ALTER TABLE garden_season_analyses ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ============================================
-- Crea Policies per Garden Memory (se non esistono)
-- ============================================
DO $$
BEGIN
  -- Zone Memories policies
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'garden_zone_memories') THEN
    DROP POLICY IF EXISTS "Users can manage their own zone memories" ON garden_zone_memories;
    CREATE POLICY "Users can manage their own zone memories" ON garden_zone_memories
      FOR ALL USING ((select auth.uid()) IN (SELECT user_id FROM gardens WHERE id = garden_zone_memories.garden_id));
  END IF;
  
  -- Tree Memories policies
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'garden_tree_memories') THEN
    DROP POLICY IF EXISTS "Users can manage their own tree memories" ON garden_tree_memories;
    CREATE POLICY "Users can manage their own tree memories" ON garden_tree_memories
      FOR ALL USING ((select auth.uid()) IN (SELECT user_id FROM gardens WHERE id = garden_tree_memories.garden_id));
  END IF;
  
  -- Patterns policies
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'garden_patterns') THEN
    DROP POLICY IF EXISTS "Users can manage their own patterns" ON garden_patterns;
    CREATE POLICY "Users can manage their own patterns" ON garden_patterns
      FOR ALL USING ((select auth.uid()) IN (SELECT user_id FROM gardens WHERE id = garden_patterns.garden_id));
  END IF;
  
  -- Correlations policies
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'garden_correlations') THEN
    DROP POLICY IF EXISTS "Users can manage their own correlations" ON garden_correlations;
    CREATE POLICY "Users can manage their own correlations" ON garden_correlations
      FOR ALL USING ((select auth.uid()) IN (SELECT user_id FROM gardens WHERE id = garden_correlations.garden_id));
  END IF;
  
  -- Season Analyses policies
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'garden_season_analyses') THEN
    DROP POLICY IF EXISTS "Users can manage their own season analyses" ON garden_season_analyses;
    CREATE POLICY "Users can manage their own season analyses" ON garden_season_analyses
      FOR ALL USING ((select auth.uid()) IN (SELECT user_id FROM gardens WHERE id = garden_season_analyses.garden_id));
  END IF;
END $$;

