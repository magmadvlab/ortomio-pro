-- ============================================
-- GRUPPO 19: ENABLE RLS ON CROP TABLES
-- ============================================
-- Abilita Row Level Security (RLS) su tabelle crop pubbliche
-- Queste sono tabelle di riferimento: lettura pubblica, scrittura solo per service role
--
-- ORDINE: Dopo plant taxonomy (03)
--
-- Tabelle interessate:
-- - crop_archetypes
-- - crop_profiles
-- - plant_rules
-- - crop_aliases (permetti INSERT per utenti autenticati)
-- - official_crops

-- ============================================
-- CROP_ARCHETYPES
-- ============================================

DO $$
BEGIN
  -- Abilita RLS
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'crop_archetypes'
    AND rowsecurity = false
  ) THEN
    ALTER TABLE public.crop_archetypes ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS abilitato su crop_archetypes';
  ELSE
    RAISE NOTICE 'RLS già abilitato su crop_archetypes';
  END IF;

  -- Policy: SELECT pubblico (tutti possono leggere)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'crop_archetypes'
    AND policyname = 'crop_archetypes_select_public'
  ) THEN
    CREATE POLICY "crop_archetypes_select_public" ON public.crop_archetypes
      FOR SELECT
      USING (true);
    RAISE NOTICE 'Policy SELECT creata per crop_archetypes';
  END IF;

  -- Policy: INSERT/UPDATE/DELETE solo per service role
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'crop_archetypes'
    AND policyname = 'crop_archetypes_modify_service_role'
  ) THEN
    CREATE POLICY "crop_archetypes_modify_service_role" ON public.crop_archetypes
      FOR ALL
      USING (auth.role() = 'service_role');
    RAISE NOTICE 'Policy MODIFY creata per crop_archetypes';
  END IF;
END $$;

-- ============================================
-- CROP_PROFILES
-- ============================================

DO $$
BEGIN
  -- Abilita RLS
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'crop_profiles'
    AND rowsecurity = false
  ) THEN
    ALTER TABLE public.crop_profiles ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS abilitato su crop_profiles';
  ELSE
    RAISE NOTICE 'RLS già abilitato su crop_profiles';
  END IF;

  -- Policy: SELECT pubblico (tutti possono leggere)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'crop_profiles'
    AND policyname = 'crop_profiles_select_public'
  ) THEN
    CREATE POLICY "crop_profiles_select_public" ON public.crop_profiles
      FOR SELECT
      USING (true);
    RAISE NOTICE 'Policy SELECT creata per crop_profiles';
  END IF;

  -- Policy: INSERT/UPDATE/DELETE solo per service role
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'crop_profiles'
    AND policyname = 'crop_profiles_modify_service_role'
  ) THEN
    CREATE POLICY "crop_profiles_modify_service_role" ON public.crop_profiles
      FOR ALL
      USING (auth.role() = 'service_role');
    RAISE NOTICE 'Policy MODIFY creata per crop_profiles';
  END IF;
END $$;

-- ============================================
-- PLANT_RULES
-- ============================================

DO $$
BEGIN
  -- Abilita RLS
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'plant_rules'
    AND rowsecurity = false
  ) THEN
    ALTER TABLE public.plant_rules ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS abilitato su plant_rules';
  ELSE
    RAISE NOTICE 'RLS già abilitato su plant_rules';
  END IF;

  -- Policy: SELECT pubblico (tutti possono leggere)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'plant_rules'
    AND policyname = 'plant_rules_select_public'
  ) THEN
    CREATE POLICY "plant_rules_select_public" ON public.plant_rules
      FOR SELECT
      USING (true);
    RAISE NOTICE 'Policy SELECT creata per plant_rules';
  END IF;

  -- Policy: INSERT/UPDATE/DELETE solo per service role
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'plant_rules'
    AND policyname = 'plant_rules_modify_service_role'
  ) THEN
    CREATE POLICY "plant_rules_modify_service_role" ON public.plant_rules
      FOR ALL
      USING (auth.role() = 'service_role');
    RAISE NOTICE 'Policy MODIFY creata per plant_rules';
  END IF;
END $$;

-- ============================================
-- CROP_ALIASES
-- ============================================

DO $$
BEGIN
  -- Abilita RLS
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'crop_aliases'
    AND rowsecurity = false
  ) THEN
    ALTER TABLE public.crop_aliases ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS abilitato su crop_aliases';
  ELSE
    RAISE NOTICE 'RLS già abilitato su crop_aliases';
  END IF;

  -- Policy: SELECT pubblico (tutti possono leggere)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'crop_aliases'
    AND policyname = 'crop_aliases_select_public'
  ) THEN
    CREATE POLICY "crop_aliases_select_public" ON public.crop_aliases
      FOR SELECT
      USING (true);
    RAISE NOTICE 'Policy SELECT creata per crop_aliases';
  END IF;

  -- Policy: INSERT per utenti autenticati (permette agli utenti di aggiungere alias)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'crop_aliases'
    AND policyname = 'crop_aliases_insert_authenticated'
  ) THEN
    CREATE POLICY "crop_aliases_insert_authenticated" ON public.crop_aliases
      FOR INSERT
      WITH CHECK ((select auth.uid()) IS NOT NULL);
    RAISE NOTICE 'Policy INSERT creata per crop_aliases';
  END IF;

  -- Policy: UPDATE/DELETE solo per service role o creatore
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'crop_aliases'
    AND policyname = 'crop_aliases_update_own_or_service'
  ) THEN
    CREATE POLICY "crop_aliases_update_own_or_service" ON public.crop_aliases
      FOR UPDATE
      USING (
        auth.role() = 'service_role' 
        OR (select auth.uid()) = created_by
      );
    RAISE NOTICE 'Policy UPDATE creata per crop_aliases';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'crop_aliases'
    AND policyname = 'crop_aliases_delete_own_or_service'
  ) THEN
    CREATE POLICY "crop_aliases_delete_own_or_service" ON public.crop_aliases
      FOR DELETE
      USING (
        auth.role() = 'service_role' 
        OR (select auth.uid()) = created_by
      );
    RAISE NOTICE 'Policy DELETE creata per crop_aliases';
  END IF;
END $$;

-- ============================================
-- OFFICIAL_CROPS
-- ============================================

DO $$
BEGIN
  -- Abilita RLS
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'official_crops'
    AND rowsecurity = false
  ) THEN
    ALTER TABLE public.official_crops ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS abilitato su official_crops';
  ELSE
    RAISE NOTICE 'RLS già abilitato su official_crops';
  END IF;

  -- Policy: SELECT pubblico (tutti possono leggere)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'official_crops'
    AND policyname = 'official_crops_select_public'
  ) THEN
    CREATE POLICY "official_crops_select_public" ON public.official_crops
      FOR SELECT
      USING (true);
    RAISE NOTICE 'Policy SELECT creata per official_crops';
  END IF;

  -- Policy: INSERT/UPDATE/DELETE solo per service role
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'official_crops'
    AND policyname = 'official_crops_modify_service_role'
  ) THEN
    CREATE POLICY "official_crops_modify_service_role" ON public.official_crops
      FOR ALL
      USING (auth.role() = 'service_role');
    RAISE NOTICE 'Policy MODIFY creata per official_crops';
  END IF;
END $$;

-- ============================================
-- VERIFICA FINALE
-- ============================================

DO $$
DECLARE
  tables_without_rls TEXT[];
BEGIN
  SELECT array_agg(tablename)
  INTO tables_without_rls
  FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename IN ('crop_archetypes', 'crop_profiles', 'plant_rules', 'crop_aliases', 'official_crops')
  AND rowsecurity = false;

  IF array_length(tables_without_rls, 1) > 0 THEN
    RAISE WARNING '⚠️ Tabelle senza RLS: %', array_to_string(tables_without_rls, ', ');
  ELSE
    RAISE NOTICE '✅ RLS abilitato con successo su tutte le tabelle crop';
  END IF;
END $$;

