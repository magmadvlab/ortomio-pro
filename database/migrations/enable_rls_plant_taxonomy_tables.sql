-- Migration: Enable Row Level Security (RLS) on Plant Taxonomy Tables
-- Abilita RLS su plant_families, plant_taxonomy, e plant_synonyms
-- Queste sono tabelle di riferimento pubbliche: lettura pubblica, scrittura solo per service role
--
-- Data: 2025-01-XX
-- Descrizione: Abilita RLS per sicurezza su tabelle tassonomia piante esposte a PostgREST

-- ============================================
-- PLANT_FAMILIES
-- ============================================
ALTER TABLE plant_families ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT pubblico (tutti possono leggere)
CREATE POLICY "plant_families_select_public" ON plant_families
  FOR SELECT
  USING (true);

-- Policy: INSERT/UPDATE/DELETE solo per service role
CREATE POLICY "plant_families_modify_service_role" ON plant_families
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- PLANT_TAXONOMY
-- ============================================
ALTER TABLE plant_taxonomy ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT pubblico (tutti possono leggere)
CREATE POLICY "plant_taxonomy_select_public" ON plant_taxonomy
  FOR SELECT
  USING (true);

-- Policy: INSERT/UPDATE/DELETE solo per service role
CREATE POLICY "plant_taxonomy_modify_service_role" ON plant_taxonomy
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- PLANT_SYNONYMS
-- ============================================
ALTER TABLE plant_synonyms ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT pubblico (tutti possono leggere)
CREATE POLICY "plant_synonyms_select_public" ON plant_synonyms
  FOR SELECT
  USING (true);

-- Policy: INSERT/UPDATE/DELETE solo per service role o utente autenticato (per user-generated synonyms)
CREATE POLICY "plant_synonyms_insert_authenticated" ON plant_synonyms
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

CREATE POLICY "plant_synonyms_update_service_role" ON plant_synonyms
  FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "plant_synonyms_delete_service_role" ON plant_synonyms
  FOR DELETE
  USING (auth.role() = 'service_role');

-- ============================================
-- Verifica che RLS sia stato abilitato
-- ============================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('plant_families', 'plant_taxonomy', 'plant_synonyms')
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE '✅ RLS abilitato con successo su tabelle tassonomia piante';
  ELSE
    RAISE WARNING '⚠️ Verifica manuale richiesta: RLS potrebbe non essere stato abilitato su tutte le tabelle';
  END IF;
END $$;

