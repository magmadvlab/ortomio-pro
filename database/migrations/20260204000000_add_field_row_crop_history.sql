-- Migration: Add Field Row Crop History System
-- Created: 2026-02-04
-- Purpose: Track complete crop rotation history for each field row with context

-- ============================================
-- FIELD_ROW_CROP_HISTORY
-- Storico completo delle colture per ogni filare
-- ============================================
CREATE TABLE IF NOT EXISTS field_row_crop_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Riferimenti
  garden_row_id UUID NOT NULL REFERENCES garden_rows(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dati Coltura
  crop_name TEXT NOT NULL,
  crop_variety TEXT,
  crop_family TEXT, -- Solanacee, Leguminose, Crucifere, etc.
  crop_type TEXT, -- vegetale, frutto, radice, foglia
  
  -- Date
  planting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  harvest_date TIMESTAMP WITH TIME ZONE,
  days_to_harvest INTEGER,
  
  -- Contesto di Impianto (come per le piante)
  planting_context JSONB DEFAULT '{}'::jsonb,
  -- {
  --   "weather": {"temp": 22, "humidity": 65, "condition": "sunny"},
  --   "moon": {"phase": "Crescente", "emoji": "🌒", "illumination": 45},
  --   "season": "spring",
  --   "daylight": {"sunrise": "06:30", "sunset": "20:15", "hours": 13.75},
  --   "gps": {"lat": 45.123, "lng": 11.456}
  -- }
  
  -- Performance
  yield_kg DECIMAL(10, 2),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  health_issues JSONB DEFAULT '[]'::jsonb, -- malattie, parassiti
  
  -- Gestione
  irrigation_method TEXT, -- manuale, goccia, aspersione
  fertilization_type TEXT, -- bio, tradizionale, misto
  treatments_count INTEGER DEFAULT 0,
  
  -- Note e Osservazioni
  notes TEXT,
  success_factors JSONB DEFAULT '[]'::jsonb, -- cosa ha funzionato bene
  problems JSONB DEFAULT '[]'::jsonb, -- cosa è andato male
  
  -- AI Learning
  ai_recommendations JSONB DEFAULT '{}'::jsonb,
  rotation_score INTEGER, -- punteggio rotazione (1-100)
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_field_row_crop_history_row_id 
  ON field_row_crop_history(garden_row_id);
CREATE INDEX IF NOT EXISTS idx_field_row_crop_history_garden_id 
  ON field_row_crop_history(garden_id);
CREATE INDEX IF NOT EXISTS idx_field_row_crop_history_user_id 
  ON field_row_crop_history(user_id);
CREATE INDEX IF NOT EXISTS idx_field_row_crop_history_dates 
  ON field_row_crop_history(planting_date, harvest_date);
CREATE INDEX IF NOT EXISTS idx_field_row_crop_history_crop_family 
  ON field_row_crop_history(crop_family);

-- RLS Policies
ALTER TABLE field_row_crop_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their crop history"
  ON field_row_crop_history FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their crop history"
  ON field_row_crop_history FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their crop history"
  ON field_row_crop_history FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their crop history"
  ON field_row_crop_history FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- FUNZIONI HELPER
-- ============================================

-- Funzione per ottenere lo storico di un filare
CREATE OR REPLACE FUNCTION get_field_row_history(row_id UUID)
RETURNS TABLE (
  crop_name TEXT,
  crop_family TEXT,
  planting_date TIMESTAMP WITH TIME ZONE,
  harvest_date TIMESTAMP WITH TIME ZONE,
  days_to_harvest INTEGER,
  yield_kg DECIMAL,
  quality_rating INTEGER,
  rotation_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.crop_name,
    h.crop_family,
    h.planting_date,
    h.harvest_date,
    h.days_to_harvest,
    h.yield_kg,
    h.quality_rating,
    h.rotation_score
  FROM field_row_crop_history h
  WHERE h.garden_row_id = row_id
  ORDER BY h.planting_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per calcolare il punteggio di rotazione
CREATE OR REPLACE FUNCTION calculate_rotation_score(
  row_id UUID,
  new_crop_family TEXT
)
RETURNS INTEGER AS $$
DECLARE
  last_crop_family TEXT;
  last_planting_date TIMESTAMP WITH TIME ZONE;
  months_since_last INTEGER;
  score INTEGER := 100;
BEGIN
  -- Ottieni l'ultima coltura dello stesso tipo
  SELECT crop_family, planting_date
  INTO last_crop_family, last_planting_date
  FROM field_row_crop_history
  WHERE garden_row_id = row_id
    AND crop_family = new_crop_family
  ORDER BY planting_date DESC
  LIMIT 1;
  
  -- Se non c'è storico, punteggio massimo
  IF last_crop_family IS NULL THEN
    RETURN 100;
  END IF;
  
  -- Calcola mesi trascorsi
  months_since_last := EXTRACT(MONTH FROM AGE(NOW(), last_planting_date));
  
  -- Penalizza se troppo recente
  IF months_since_last < 6 THEN
    score := 20; -- Molto sconsigliato
  ELSIF months_since_last < 12 THEN
    score := 50; -- Sconsigliato
  ELSIF months_since_last < 24 THEN
    score := 80; -- Accettabile
  ELSE
    score := 100; -- Ottimo
  END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per ottenere suggerimenti di rotazione
CREATE OR REPLACE FUNCTION get_rotation_suggestions(row_id UUID)
RETURNS JSONB AS $$
DECLARE
  last_families TEXT[];
  suggestions JSONB := '[]'::jsonb;
BEGIN
  -- Ottieni le ultime 3 famiglie coltivate
  SELECT ARRAY_AGG(crop_family ORDER BY planting_date DESC)
  INTO last_families
  FROM (
    SELECT DISTINCT crop_family, planting_date
    FROM field_row_crop_history
    WHERE garden_row_id = row_id
    ORDER BY planting_date DESC
    LIMIT 3
  ) sub;
  
  -- Genera suggerimenti basati sulla rotazione classica
  -- Solanacee -> Leguminose -> Crucifere -> Cucurbitacee
  IF last_families IS NULL OR array_length(last_families, 1) = 0 THEN
    suggestions := jsonb_build_array(
      jsonb_build_object(
        'family', 'Leguminose',
        'reason', 'Arricchiscono il terreno di azoto',
        'score', 100
      )
    );
  ELSIF last_families[1] = 'Solanacee' THEN
    suggestions := jsonb_build_array(
      jsonb_build_object(
        'family', 'Leguminose',
        'reason', 'Ripristinano l''azoto consumato dalle solanacee',
        'score', 95
      ),
      jsonb_build_object(
        'family', 'Crucifere',
        'reason', 'Buona alternativa, radici diverse',
        'score', 85
      )
    );
  ELSIF last_families[1] = 'Leguminose' THEN
    suggestions := jsonb_build_array(
      jsonb_build_object(
        'family', 'Crucifere',
        'reason', 'Sfruttano l''azoto lasciato dalle leguminose',
        'score', 95
      ),
      jsonb_build_object(
        'family', 'Cucurbitacee',
        'reason', 'Beneficiano del terreno arricchito',
        'score', 90
      )
    );
  ELSIF last_families[1] = 'Crucifere' THEN
    suggestions := jsonb_build_array(
      jsonb_build_object(
        'family', 'Cucurbitacee',
        'reason', 'Completano il ciclo di rotazione',
        'score', 95
      ),
      jsonb_build_object(
        'family', 'Solanacee',
        'reason', 'Iniziano un nuovo ciclo',
        'score', 85
      )
    );
  ELSE
    suggestions := jsonb_build_array(
      jsonb_build_object(
        'family', 'Solanacee',
        'reason', 'Iniziano un nuovo ciclo di rotazione',
        'score', 90
      ),
      jsonb_build_object(
        'family', 'Leguminose',
        'reason', 'Sempre una buona scelta per arricchire',
        'score', 95
      )
    );
  END IF;
  
  RETURN suggestions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_field_row_crop_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_field_row_crop_history_updated_at
  BEFORE UPDATE ON field_row_crop_history
  FOR EACH ROW
  EXECUTE FUNCTION update_field_row_crop_history_updated_at();

-- ============================================
-- VISTE UTILI
-- ============================================

-- Vista per analisi rotazione
CREATE OR REPLACE VIEW field_row_rotation_analysis AS
SELECT 
  gr.id as row_id,
  gr.name as row_name,
  gr.garden_id,
  COUNT(h.id) as total_crops,
  COUNT(DISTINCT h.crop_family) as families_used,
  MAX(h.planting_date) as last_planting,
  AVG(h.rotation_score) as avg_rotation_score,
  AVG(h.quality_rating) as avg_quality,
  SUM(h.yield_kg) as total_yield_kg
FROM garden_rows gr
LEFT JOIN field_row_crop_history h ON h.garden_row_id = gr.id
GROUP BY gr.id, gr.name, gr.garden_id;

-- Vista per performance colture
CREATE OR REPLACE VIEW crop_performance_by_family AS
SELECT 
  crop_family,
  COUNT(*) as plantings_count,
  AVG(days_to_harvest) as avg_days_to_harvest,
  AVG(yield_kg) as avg_yield_kg,
  AVG(quality_rating) as avg_quality,
  AVG(rotation_score) as avg_rotation_score
FROM field_row_crop_history
WHERE harvest_date IS NOT NULL
GROUP BY crop_family
ORDER BY avg_quality DESC, avg_yield_kg DESC;

COMMENT ON TABLE field_row_crop_history IS 'Storico completo delle colture per ogni filare con contesto e performance';
COMMENT ON FUNCTION get_field_row_history IS 'Ottiene lo storico cronologico di un filare';
COMMENT ON FUNCTION calculate_rotation_score IS 'Calcola il punteggio di rotazione per una nuova coltura';
COMMENT ON FUNCTION get_rotation_suggestions IS 'Suggerisce le migliori colture per la rotazione';
