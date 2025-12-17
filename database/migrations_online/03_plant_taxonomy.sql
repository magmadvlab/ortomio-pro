-- ============================================
-- GRUPPO 3: PLANT TAXONOMY SYSTEM
-- ============================================
-- Sistema completo di tassonomia piante con fuzzy search
-- 
-- Include:
-- - crop_archetypes (12 archetipi)
-- - plant_families
-- - plant_taxonomy
-- - plant_synonyms
-- - plant_rules
-- - seed data
-- 
-- ORDINE: Dopo core schema (01)
-- 
-- NOTA: Questo file include sia la creazione delle tabelle che il seed iniziale
-- Per separare creazione e seed, vedere 03a_plant_taxonomy_tables.sql e 03b_plant_taxonomy_seed.sql

-- Enable pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- CROP ARCHETYPES (Archetipi principali)
-- ============================================
CREATE TABLE IF NOT EXISTS crop_archetypes (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon TEXT NOT NULL,
  botanical_family TEXT NOT NULL,
  default_profile_id UUID,
  parent_archetype_id TEXT REFERENCES crop_archetypes(id),
  examples TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_archetypes_parent ON crop_archetypes(parent_archetype_id);

-- ============================================
-- CROP PROFILES (Profili tecnici default)
-- ============================================
CREATE TABLE IF NOT EXISTS crop_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  archetype_id TEXT REFERENCES crop_archetypes(id),
  root_zone_depth_cm_default INTEGER NOT NULL,
  root_zone_depth_cm_min INTEGER,
  root_zone_depth_cm_max INTEGER,
  kc_json JSONB NOT NULL,
  stress_depletion_p_default DECIMAL(3, 2) DEFAULT 0.5,
  nutrient_plan_json JSONB,
  irrigation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_archetype ON crop_profiles(archetype_id);

-- ============================================
-- PLANT_FAMILIES (Famiglie botaniche)
-- ============================================
CREATE TABLE IF NOT EXISTS plant_families (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  common_names TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plant_families_name ON plant_families(name);

-- ============================================
-- PLANT_TAXONOMY (Piante canoniche)
-- ============================================
CREATE TABLE IF NOT EXISTS plant_taxonomy (
  plant_id TEXT PRIMARY KEY,
  names JSONB NOT NULL,
  family_id TEXT NOT NULL REFERENCES plant_families(id),
  archetype_id TEXT NOT NULL REFERENCES crop_archetypes(id),
  functional_category TEXT NOT NULL CHECK (functional_category IN ('LEAF', 'FRUIT', 'ROOT', 'AROMATIC', 'LEGUME', 'SPECIALIZED')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_taxonomy_family ON plant_taxonomy(family_id);
CREATE INDEX IF NOT EXISTS idx_taxonomy_archetype ON plant_taxonomy(archetype_id);
CREATE INDEX IF NOT EXISTS idx_taxonomy_category ON plant_taxonomy(functional_category);
CREATE INDEX IF NOT EXISTS idx_taxonomy_names ON plant_taxonomy USING GIN(names);
CREATE INDEX IF NOT EXISTS idx_taxonomy_names_trgm ON plant_taxonomy USING GIN((names->>'it') gin_trgm_ops);

-- ============================================
-- PLANT_SYNONYMS (Dizionario sinonimi)
-- ============================================
CREATE TABLE IF NOT EXISTS plant_synonyms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  synonym TEXT NOT NULL,
  normalized_synonym TEXT NOT NULL,
  plant_id TEXT NOT NULL REFERENCES plant_taxonomy(plant_id) ON DELETE CASCADE,
  locale TEXT NOT NULL DEFAULT 'it',
  confidence DECIMAL(3, 2) DEFAULT 1.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
  source TEXT NOT NULL CHECK (source IN ('user', 'admin', 'system')),
  created_by UUID REFERENCES auth.users(id),
  usage_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(synonym, locale)
);

CREATE INDEX IF NOT EXISTS idx_synonyms_text ON plant_synonyms(synonym);
CREATE INDEX IF NOT EXISTS idx_synonyms_normalized ON plant_synonyms(normalized_synonym);
CREATE INDEX IF NOT EXISTS idx_synonyms_plant ON plant_synonyms(plant_id);
CREATE INDEX IF NOT EXISTS idx_synonyms_locale ON plant_synonyms(locale);
CREATE INDEX IF NOT EXISTS idx_synonyms_trgm ON plant_synonyms USING GIN(normalized_synonym gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_synonyms_locale_plant ON plant_synonyms(locale, plant_id);

-- ============================================
-- PLANT_RULES (Regole agronomiche)
-- ============================================
CREATE TABLE IF NOT EXISTS plant_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id TEXT REFERENCES plant_families(id),
  archetype_id TEXT REFERENCES crop_archetypes(id),
  rule_type TEXT NOT NULL CHECK (rule_type IN ('rotation', 'companion', 'disease_risk', 'npk_profile', 'water_needs')),
  rule_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rules_family ON plant_rules(family_id);
CREATE INDEX IF NOT EXISTS idx_rules_archetype ON plant_rules(archetype_id);
CREATE INDEX IF NOT EXISTS idx_rules_type ON plant_rules(rule_type);

-- ============================================
-- CROP ALIASES (Dizionario nomi locali)
-- ============================================
CREATE TABLE IF NOT EXISTS crop_aliases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alias_text TEXT NOT NULL,
  archetype_id TEXT REFERENCES crop_archetypes(id) NOT NULL,
  region TEXT,
  province TEXT,
  confidence DECIMAL(3, 2) DEFAULT 1.0,
  created_by UUID REFERENCES auth.users(id),
  usage_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(alias_text, region, province)
);

CREATE INDEX IF NOT EXISTS idx_aliases_text ON crop_aliases(alias_text);
CREATE INDEX IF NOT EXISTS idx_aliases_archetype ON crop_aliases(archetype_id);
CREATE INDEX IF NOT EXISTS idx_aliases_region ON crop_aliases(region, province);

-- ============================================
-- OFFICIAL CROPS (Colture ufficiali)
-- ============================================
CREATE TABLE IF NOT EXISTS official_crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  archetype_id TEXT REFERENCES crop_archetypes(id) NOT NULL,
  profile_override_id UUID REFERENCES crop_profiles(id),
  scientific_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_official_crops_archetype ON official_crops(archetype_id);
CREATE INDEX IF NOT EXISTS idx_official_crops_name ON official_crops(name);

-- ============================================
-- MODIFICHE A GARDEN_TASKS
-- ============================================
ALTER TABLE garden_tasks 
ADD COLUMN IF NOT EXISTS archetype_id TEXT REFERENCES crop_archetypes(id),
ADD COLUMN IF NOT EXISTS root_zone_depth_cm INTEGER,
ADD COLUMN IF NOT EXISTS irrigation_setup JSONB;

CREATE INDEX IF NOT EXISTS idx_tasks_archetype ON garden_tasks(archetype_id);

-- ============================================
-- FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION update_plant_taxonomy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_plant_taxonomy_updated_at ON plant_taxonomy;
CREATE TRIGGER trigger_update_plant_taxonomy_updated_at
  BEFORE UPDATE ON plant_taxonomy
  FOR EACH ROW
  EXECUTE FUNCTION update_plant_taxonomy_updated_at();

DROP TRIGGER IF EXISTS trigger_update_plant_synonyms_updated_at ON plant_synonyms;
CREATE TRIGGER trigger_update_plant_synonyms_updated_at
  BEFORE UPDATE ON plant_synonyms
  FOR EACH ROW
  EXECUTE FUNCTION update_plant_taxonomy_updated_at();

-- Funzione helper per ricerca fuzzy sinonimi
CREATE OR REPLACE FUNCTION search_plant_synonyms(
  search_query TEXT,
  search_locale TEXT DEFAULT 'it',
  filter_archetype_id TEXT DEFAULT NULL,
  similarity_threshold DECIMAL DEFAULT 0.3,
  result_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  synonym_id UUID,
  synonym TEXT,
  plant_id TEXT,
  plant_name TEXT,
  archetype_id TEXT,
  family_id TEXT,
  functional_category TEXT,
  similarity_score DECIMAL,
  confidence DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id as synonym_id,
    ps.synonym,
    pt.plant_id,
    pt.names->>'it' as plant_name,
    pt.archetype_id,
    pt.family_id,
    pt.functional_category,
    similarity(ps.normalized_synonym, search_query) as similarity_score,
    ps.confidence
  FROM plant_synonyms ps
  JOIN plant_taxonomy pt ON ps.plant_id = pt.plant_id
  WHERE ps.locale = search_locale
    AND (ps.normalized_synonym % search_query OR similarity(ps.normalized_synonym, search_query) > similarity_threshold)
    AND (filter_archetype_id IS NULL OR pt.archetype_id = filter_archetype_id)
  ORDER BY similarity_score DESC, ps.confidence DESC, ps.usage_count DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Funzione helper per ricerca su nomi canonici
CREATE OR REPLACE FUNCTION search_plant_canonical(
  search_query TEXT,
  filter_archetype_id TEXT DEFAULT NULL,
  similarity_threshold DECIMAL DEFAULT 0.3,
  result_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  plant_id TEXT,
  plant_name TEXT,
  archetype_id TEXT,
  family_id TEXT,
  functional_category TEXT,
  similarity_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pt.plant_id,
    pt.names->>'it' as plant_name,
    pt.archetype_id,
    pt.family_id,
    pt.functional_category,
    similarity(pt.names->>'it', search_query) as similarity_score
  FROM plant_taxonomy pt
  WHERE (pt.names->>'it' % search_query OR similarity(pt.names->>'it', search_query) > similarity_threshold)
    AND (filter_archetype_id IS NULL OR pt.archetype_id = filter_archetype_id)
  ORDER BY similarity_score DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA (Dati iniziali)
-- ============================================
-- NOTA: I dati seed sono in un file separato (03b_plant_taxonomy_seed.sql)
-- Questo file contiene solo la struttura delle tabelle

