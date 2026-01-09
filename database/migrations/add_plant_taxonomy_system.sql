-- Sistema Tassonomia Piante Completo
-- Aggiunge tabelle per gestire tassonomia, sinonimi dialettali e fuzzy search
-- Permette normalizzazione input utente e mapping a piante canoniche

-- ============================================
-- Estensione pg_trgm per fuzzy search
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- PLANT_FAMILIES (Famiglie botaniche)
-- ============================================
CREATE TABLE IF NOT EXISTS plant_families (
  id TEXT PRIMARY KEY, -- 'Solanaceae', 'Cucurbitaceae', ecc.
  name TEXT NOT NULL,
  common_names TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_plant_families_name ON plant_families(name);

-- ============================================
-- PLANT_TAXONOMY (Piante canoniche)
-- ============================================
CREATE TABLE IF NOT EXISTS plant_taxonomy (
  plant_id TEXT PRIMARY KEY, -- 'pomodoro', 'zucchina', 'carosello', ecc.
  names JSONB NOT NULL, -- {"it": "Pomodoro", "en": "Tomato", "it-puglia": "Barattiere"}
  family_id TEXT NOT NULL REFERENCES plant_families(id),
  archetype_id TEXT NOT NULL REFERENCES crop_archetypes(id), -- 'A1', 'A2', ecc.
  functional_category TEXT NOT NULL CHECK (functional_category IN ('LEAF', 'FRUIT', 'ROOT', 'AROMATIC', 'LEGUME', 'SPECIALIZED')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_taxonomy_family ON plant_taxonomy(family_id);
CREATE INDEX idx_taxonomy_archetype ON plant_taxonomy(archetype_id);
CREATE INDEX idx_taxonomy_category ON plant_taxonomy(functional_category);
CREATE INDEX idx_taxonomy_names ON plant_taxonomy USING GIN(names);

-- Indice trigram per fuzzy search su nomi canonici
CREATE INDEX idx_taxonomy_names_trgm ON plant_taxonomy USING GIN((names->>'it') gin_trgm_ops);

-- ============================================
-- PLANT_SYNONYMS (Dizionario sinonimi)
-- ============================================
CREATE TABLE IF NOT EXISTS plant_synonyms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  synonym TEXT NOT NULL, -- 'burattino', 'pummador', 'barattiere'
  normalized_synonym TEXT NOT NULL, -- versione normalizzata per matching
  plant_id TEXT NOT NULL REFERENCES plant_taxonomy(plant_id) ON DELETE CASCADE,
  locale TEXT NOT NULL DEFAULT 'it', -- 'it', 'it-puglia', 'it-campania', ecc.
  confidence DECIMAL(3, 2) DEFAULT 1.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
  source TEXT NOT NULL CHECK (source IN ('user', 'admin', 'system')),
  created_by UUID REFERENCES auth.users(id),
  usage_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(synonym, locale) -- Evita duplicati per locale
);

-- Indici per ricerca
CREATE INDEX idx_synonyms_text ON plant_synonyms(synonym);
CREATE INDEX idx_synonyms_normalized ON plant_synonyms(normalized_synonym);
CREATE INDEX idx_synonyms_plant ON plant_synonyms(plant_id);
CREATE INDEX idx_synonyms_locale ON plant_synonyms(locale);

-- Indice trigram per fuzzy search su sinonimi normalizzati
CREATE INDEX idx_synonyms_trgm ON plant_synonyms USING GIN(normalized_synonym gin_trgm_ops);

-- Indice composito per query ottimizzate
CREATE INDEX idx_synonyms_locale_plant ON plant_synonyms(locale, plant_id);

-- ============================================
-- PLANT_RULES (Regole agronomiche per famiglia/archetipo)
-- ============================================
CREATE TABLE IF NOT EXISTS plant_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id TEXT REFERENCES plant_families(id),
  archetype_id TEXT REFERENCES crop_archetypes(id),
  rule_type TEXT NOT NULL CHECK (rule_type IN ('rotation', 'companion', 'disease_risk', 'npk_profile', 'water_needs')),
  rule_data JSONB NOT NULL, -- Dati specifici per tipo regola
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rules_family ON plant_rules(family_id);
CREATE INDEX idx_rules_archetype ON plant_rules(archetype_id);
CREATE INDEX idx_rules_type ON plant_rules(rule_type);

-- ============================================
-- Funzione per aggiornare updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_plant_taxonomy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_plant_taxonomy_updated_at
  BEFORE UPDATE ON plant_taxonomy
  FOR EACH ROW
  EXECUTE FUNCTION update_plant_taxonomy_updated_at();

CREATE TRIGGER trigger_update_plant_synonyms_updated_at
  BEFORE UPDATE ON plant_synonyms
  FOR EACH ROW
  EXECUTE FUNCTION update_plant_taxonomy_updated_at();

-- ============================================
-- Funzione per incrementare usage_count
-- ============================================
CREATE OR REPLACE FUNCTION increment_synonym_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE plant_synonyms
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per incrementare usage_count quando un sinonimo viene usato
-- (può essere chiamato manualmente o tramite API)

-- ============================================
-- Funzione helper per ricerca fuzzy
-- ============================================
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

-- ============================================
-- Funzione helper per ricerca su nomi canonici
-- ============================================
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
-- Commenti
-- ============================================
COMMENT ON TABLE plant_taxonomy IS 'Piante canoniche con tassonomia completa (family, archetype, functional_category)';
COMMENT ON TABLE plant_synonyms IS 'Dizionario sinonimi dialettali/locale per fuzzy search';
COMMENT ON TABLE plant_families IS 'Famiglie botaniche (Solanaceae, Cucurbitaceae, ecc.)';
COMMENT ON TABLE plant_rules IS 'Regole agronomiche per famiglia/archetipo (rotazione, consociazioni, NPK, ecc.)';

COMMENT ON COLUMN plant_taxonomy.plant_id IS 'ID canonico della pianta (es. pomodoro, carosello)';
COMMENT ON COLUMN plant_taxonomy.names IS 'Nomi localizzati in JSONB: {"it": "Pomodoro", "en": "Tomato", "it-puglia": "Barattiere"}';
COMMENT ON COLUMN plant_taxonomy.functional_category IS 'Categoria funzionale: LEAF, FRUIT, ROOT, AROMATIC, LEGUME, SPECIALIZED';
COMMENT ON COLUMN plant_synonyms.synonym IS 'Sinonimo dialettale/locale (es. barattiere, pummador)';
COMMENT ON COLUMN plant_synonyms.normalized_synonym IS 'Versione normalizzata per matching fuzzy (lowercase, no accenti, no punteggiatura)';
COMMENT ON COLUMN plant_synonyms.confidence IS 'Confidenza del sinonimo: 1.0 = confermato, <1.0 = probabile';

