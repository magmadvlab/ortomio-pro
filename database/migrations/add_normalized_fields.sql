-- Aggiunge colonne normalized per ricerca fuzzy veloce
-- Permette ricerca case-insensitive, senza accenti, senza punteggiatura

-- ============================================
-- FUNZIONE HELPER PER NORMALIZZAZIONE
-- ============================================
CREATE OR REPLACE FUNCTION normalize_text(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    trim(
      regexp_replace(
        regexp_replace(
          -- Rimuove accenti usando unaccent (richiede extension)
          -- Se unaccent non disponibile, usa replace manuale per caratteri comuni italiani
          translate(
            input_text,
            'àáâãäåèéêëìíîïòóôõöùúûüýñç',
            'aaaaaaeeeeiiiiooooouuuuync'
          ),
          '[^\w\s]', '', 'g' -- Rimuove punteggiatura
        ),
        '\s+', ' ', 'g' -- Normalizza spazi multipli
      )
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- COLONNE NORMALIZED PER OFFICIAL_CROPS
-- ============================================
ALTER TABLE official_crops 
ADD COLUMN IF NOT EXISTS normalized_name TEXT;

-- Indice per ricerca veloce
CREATE INDEX IF NOT EXISTS idx_official_crops_normalized 
ON official_crops(normalized_name);

-- ============================================
-- COLONNE NORMALIZED PER CROP_ALIASES
-- ============================================
ALTER TABLE crop_aliases 
ADD COLUMN IF NOT EXISTS normalized_alias TEXT;

-- Indice per ricerca veloce
CREATE INDEX IF NOT EXISTS idx_aliases_normalized 
ON crop_aliases(normalized_alias);

-- ============================================
-- TRIGGER PER AUTO-POPOLAZIONE
-- ============================================
CREATE OR REPLACE FUNCTION set_normalized_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'official_crops' THEN
    NEW.normalized_name := normalize_text(COALESCE(NEW.name, ''));
  ELSIF TG_TABLE_NAME = 'crop_aliases' THEN
    NEW.normalized_alias := normalize_text(COALESCE(NEW.alias_text, ''));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per official_crops
DROP TRIGGER IF EXISTS trigger_normalize_crops ON official_crops;
CREATE TRIGGER trigger_normalize_crops
BEFORE INSERT OR UPDATE OF name ON official_crops
FOR EACH ROW EXECUTE FUNCTION set_normalized_fields();

-- Trigger per crop_aliases
DROP TRIGGER IF EXISTS trigger_normalize_aliases ON crop_aliases;
CREATE TRIGGER trigger_normalize_aliases
BEFORE INSERT OR UPDATE OF alias_text ON crop_aliases
FOR EACH ROW EXECUTE FUNCTION set_normalized_fields();

COMMENT ON COLUMN official_crops.normalized_name IS 'Versione normalizzata di name per ricerca fuzzy (lowercase, senza accenti, senza punteggiatura)';
COMMENT ON COLUMN crop_aliases.normalized_alias IS 'Versione normalizzata di alias_text per ricerca fuzzy (lowercase, senza accenti, senza punteggiatura)';

