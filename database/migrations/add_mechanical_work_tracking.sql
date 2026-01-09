-- Migration: Sistema Completo Tracciamento Lavorazioni Meccaniche
-- Allinea lavorazioni meccaniche a irrigazione/fertilizzazione/trattamenti
-- Traccia: DOVE (zone/file), COSA (tipo lavorazione), QUANDO (date), COME (attrezzatura)
-- Created: 2025-12-25

-- ============================================
-- 1. ESTENSIONE TABELLA mechanical_work_register
-- ============================================
-- Aggiungiamo campi per tracking completo come fertilization/irrigation

-- Add zone_id (DOVE - quale zona del giardino)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mechanical_work_register'
    AND column_name = 'zone_id'
  ) THEN
    ALTER TABLE mechanical_work_register
    ADD COLUMN zone_id UUID REFERENCES garden_zones(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add row_ids (DOVE - quali file specifici)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mechanical_work_register'
    AND column_name = 'row_ids'
  ) THEN
    ALTER TABLE mechanical_work_register
    ADD COLUMN row_ids UUID[];
  END IF;
END $$;

-- Add bed_ids (DOVE - quali aiuole)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mechanical_work_register'
    AND column_name = 'bed_ids'
  ) THEN
    ALTER TABLE mechanical_work_register
    ADD COLUMN bed_ids UUID[];
  END IF;
END $$;

-- Add area_covered_sqm (quantità area lavorata)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mechanical_work_register'
    AND column_name = 'area_covered_sqm'
  ) THEN
    ALTER TABLE mechanical_work_register
    ADD COLUMN area_covered_sqm NUMERIC(10, 2);
  END IF;
END $$;

-- Add depth_cm (profondità lavorazione)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mechanical_work_register'
    AND column_name = 'depth_cm'
  ) THEN
    ALTER TABLE mechanical_work_register
    ADD COLUMN depth_cm INTEGER;
  END IF;
END $$;

-- Add duration_minutes (durata lavorazione)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mechanical_work_register'
    AND column_name = 'duration_minutes'
  ) THEN
    ALTER TABLE mechanical_work_register
    ADD COLUMN duration_minutes INTEGER;
  END IF;
END $$;

-- Add operator_name (chi ha eseguito)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mechanical_work_register'
    AND column_name = 'operator_name'
  ) THEN
    ALTER TABLE mechanical_work_register
    ADD COLUMN operator_name TEXT;
  END IF;
END $$;

-- Add cost (costo lavorazione)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mechanical_work_register'
    AND column_name = 'cost'
  ) THEN
    ALTER TABLE mechanical_work_register
    ADD COLUMN cost NUMERIC(10, 2);
  END IF;
END $$;

-- Add weather_conditions (condizioni meteo durante lavorazione)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mechanical_work_register'
    AND column_name = 'weather_conditions'
  ) THEN
    ALTER TABLE mechanical_work_register
    ADD COLUMN weather_conditions JSONB;
  END IF;
END $$;

-- Add photos (foto prima/dopo)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mechanical_work_register'
    AND column_name = 'photos'
  ) THEN
    ALTER TABLE mechanical_work_register
    ADD COLUMN photos TEXT[];
  END IF;
END $$;

-- Add completed (flag completamento)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mechanical_work_register'
    AND column_name = 'completed'
  ) THEN
    ALTER TABLE mechanical_work_register
    ADD COLUMN completed BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add scheduled_date (data pianificata) vs work_date (data effettiva)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mechanical_work_register'
    AND column_name = 'scheduled_date'
  ) THEN
    ALTER TABLE mechanical_work_register
    ADD COLUMN scheduled_date DATE;
  END IF;
END $$;

-- ============================================
-- 2. SEQUENCE LAVORAZIONI (Pipeline Standard)
-- ============================================
-- Tabella per definire sequenze standard di lavorazioni
-- Esempio: Orto Estivo -> 1. Concimazione fondo, 2. Vangatura, 3. Frangizollatura, 4. Aratura, 5. Fresatura

CREATE TABLE IF NOT EXISTS mechanical_work_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificazione sequenza
  name TEXT NOT NULL, -- es. "Preparazione Orto Estivo"
  description TEXT,
  garden_type TEXT, -- 'OpenField', 'Greenhouse', 'RaisedBed', etc.
  season TEXT, -- 'Spring', 'Summer', 'Autumn', 'Winter'

  -- Sequenza steps
  steps JSONB NOT NULL, -- Array di step [{order: 1, work_type: 'Fertilize', ...}, {order: 2, work_type: 'Plowing', ...}]

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Esempi sequenze standard
INSERT INTO mechanical_work_sequences (name, description, garden_type, season, steps)
VALUES
  (
    'Preparazione Orto Estivo Completa',
    'Sequenza completa per preparare orto per colture estive (pomodori, zucchine, peperoni)',
    'OpenField',
    'Winter',
    '[
      {
        "order": 1,
        "work_type": "Fertilize",
        "name": "Concimazione di fondo",
        "timing": "Febbraio (dopo ultime gelate)",
        "instructions": ["Distribuire letame maturo o compost (3-5 kg/m²)", "Usare stallatico pellettato per orti piccoli"],
        "depth_cm": 0
      },
      {
        "order": 2,
        "work_type": "Digging",
        "name": "Vangatura profonda",
        "timing": "Dopo concimazione (stesso giorno o giorno dopo)",
        "instructions": ["Vangare a 30-40 cm di profondità", "Interrare il concime distribuito", "Rompere zolle grandi"],
        "depth_cm": 35,
        "equipment": "Manual"
      },
      {
        "order": 3,
        "work_type": "Crumbling",
        "name": "Frangizollatura",
        "timing": "1-2 giorni dopo vangatura",
        "instructions": ["Sbriciolare zolle con zappa o rastrello", "Portare terreno a grana fine", "Rimuovere sassi e radici"],
        "depth_cm": 15,
        "equipment": "Manual"
      },
      {
        "order": 4,
        "work_type": "Plowing",
        "name": "Aratura superficiale",
        "timing": "Dopo frangizollatura (terreni grandi >500m²)",
        "instructions": ["Solo per terreni grandi", "Arare a 20-25 cm", "Livellare superficie"],
        "depth_cm": 22,
        "equipment": "Rototiller"
      },
      {
        "order": 5,
        "work_type": "Tilling",
        "name": "Fresatura finale",
        "timing": "1-2 settimane prima del trapianto",
        "instructions": ["Fresare a 15-20 cm per letto di semina", "Rimuovere ultime infestanti", "Livellare perfettamente"],
        "depth_cm": 18,
        "equipment": "Rototiller"
      }
    ]'::jsonb
  ),
  (
    'Manutenzione Orto in Produzione',
    'Lavorazioni durante ciclo produttivo',
    'OpenField',
    'Summer',
    '[
      {
        "order": 1,
        "work_type": "Hoeing",
        "name": "Sarchiatura per erbe spontanee",
        "timing": "Ogni 2-3 settimane durante crescita",
        "instructions": ["Zappare superficialmente tra le file", "Rimuovere erbe infestanti", "Arieggiare terreno"],
        "depth_cm": 5,
        "equipment": "Manual"
      },
      {
        "order": 2,
        "work_type": "EarthingUp",
        "name": "Rincalzatura piante",
        "timing": "Quando piante raggiungono 20-30 cm",
        "instructions": ["Accumulare terra alla base delle piante", "Favorisce radicazione aggiuntiva", "Protegge da vento"],
        "depth_cm": 10,
        "equipment": "Manual"
      },
      {
        "order": 3,
        "work_type": "Mulching",
        "name": "Pacciamatura",
        "timing": "Dopo trapianto o quando piante sono stabilite",
        "instructions": ["Distribuire paglia o film plastico", "Riduce evaporazione e infestanti", "Mantiene umidità costante"],
        "depth_cm": 0,
        "equipment": "Manual"
      }
    ]'::jsonb
  );

-- ============================================
-- 3. INDICI PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_mechanical_work_garden ON mechanical_work_register(garden_id);
CREATE INDEX IF NOT EXISTS idx_mechanical_work_date ON mechanical_work_register(work_date DESC);
CREATE INDEX IF NOT EXISTS idx_mechanical_work_scheduled ON mechanical_work_register(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_mechanical_work_type ON mechanical_work_register(work_type);
CREATE INDEX IF NOT EXISTS idx_mechanical_work_completed ON mechanical_work_register(completed);
CREATE INDEX IF NOT EXISTS idx_mechanical_work_zone ON mechanical_work_register(zone_id) WHERE zone_id IS NOT NULL;

-- Indice per row_ids (array GIN index)
CREATE INDEX IF NOT EXISTS idx_mechanical_work_rows ON mechanical_work_register USING GIN(row_ids) WHERE row_ids IS NOT NULL;

-- ============================================
-- 4. RLS POLICIES
-- ============================================
-- Assicuriamoci che RLS sia abilitata
ALTER TABLE mechanical_work_register ENABLE ROW LEVEL SECURITY;

-- Policy per SELECT
DROP POLICY IF EXISTS "Users can view their mechanical work logs" ON mechanical_work_register;
CREATE POLICY "Users can view their mechanical work logs"
  ON mechanical_work_register FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = mechanical_work_register.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

-- Policy per INSERT
DROP POLICY IF EXISTS "Users can insert their mechanical work logs" ON mechanical_work_register;
CREATE POLICY "Users can insert their mechanical work logs"
  ON mechanical_work_register FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = mechanical_work_register.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

-- Policy per UPDATE
DROP POLICY IF EXISTS "Users can update their mechanical work logs" ON mechanical_work_register;
CREATE POLICY "Users can update their mechanical work logs"
  ON mechanical_work_register FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = mechanical_work_register.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

-- Policy per DELETE
DROP POLICY IF EXISTS "Users can delete their mechanical work logs" ON mechanical_work_register;
CREATE POLICY "Users can delete their mechanical work logs"
  ON mechanical_work_register FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = mechanical_work_register.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

-- RLS per sequences (public read, admin write)
ALTER TABLE mechanical_work_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view work sequences"
  ON mechanical_work_sequences FOR SELECT
  USING (true);

-- ============================================
-- 5. FUNZIONI HELPER
-- ============================================

-- Funzione per ottenere prossima lavorazione suggerita in sequenza
CREATE OR REPLACE FUNCTION get_next_work_in_sequence(
  p_garden_id UUID,
  p_sequence_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_sequence RECORD;
  v_completed_steps INTEGER[];
  v_next_step JSONB;
BEGIN
  -- Get sequence
  SELECT * INTO v_sequence FROM mechanical_work_sequences WHERE id = p_sequence_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Get completed steps for this garden
  SELECT ARRAY_AGG(
    (work_metadata->>'sequence_order')::INTEGER
  ) INTO v_completed_steps
  FROM mechanical_work_register
  WHERE garden_id = p_garden_id
    AND work_metadata->>'sequence_id' = p_sequence_id::TEXT
    AND completed = true;

  -- Find next uncompleted step
  SELECT step INTO v_next_step
  FROM jsonb_array_elements(v_sequence.steps) step
  WHERE (step->>'order')::INTEGER NOT IN (SELECT UNNEST(COALESCE(v_completed_steps, ARRAY[]::INTEGER[])))
  ORDER BY (step->>'order')::INTEGER
  LIMIT 1;

  RETURN v_next_step;
END;
$$ LANGUAGE plpgsql;

-- Funzione per calcolare statistiche lavorazioni per giardino
CREATE OR REPLACE FUNCTION get_mechanical_work_stats(
  p_garden_id UUID,
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER
)
RETURNS TABLE (
  total_works BIGINT,
  total_area_worked NUMERIC,
  total_cost NUMERIC,
  total_hours NUMERIC,
  work_type_breakdown JSONB,
  most_common_work TEXT,
  busiest_month INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_works,
    SUM(area_covered_sqm) as total_area_worked,
    SUM(cost) as total_cost,
    SUM(duration_minutes) / 60.0 as total_hours,

    -- Breakdown per work_type
    jsonb_object_agg(
      work_type,
      COUNT(*)
    ) as work_type_breakdown,

    -- Lavorazione più comune
    (
      SELECT work_type
      FROM mechanical_work_register
      WHERE garden_id = p_garden_id
        AND EXTRACT(YEAR FROM work_date) = p_year
      GROUP BY work_type
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as most_common_work,

    -- Mese più attivo
    (
      SELECT EXTRACT(MONTH FROM work_date)::INTEGER
      FROM mechanical_work_register
      WHERE garden_id = p_garden_id
        AND EXTRACT(YEAR FROM work_date) = p_year
      GROUP BY EXTRACT(MONTH FROM work_date)
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as busiest_month

  FROM mechanical_work_register
  WHERE garden_id = p_garden_id
    AND EXTRACT(YEAR FROM work_date) = p_year
    AND completed = true;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. TRIGGER AUTO-UPDATE
-- ============================================

CREATE OR REPLACE FUNCTION update_mechanical_work_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_mechanical_work_updated_at ON mechanical_work_register;
CREATE TRIGGER set_mechanical_work_updated_at
  BEFORE UPDATE ON mechanical_work_register
  FOR EACH ROW
  EXECUTE FUNCTION update_mechanical_work_timestamp();

-- ============================================
-- 7. COMMENTI DOCUMENTAZIONE
-- ============================================

COMMENT ON TABLE mechanical_work_register IS
'Registro completo lavorazioni meccaniche con tracciamento WHERE/WHAT/WHEN/HOW.
Allineato a sistema irrigazione/fertilizzazione/trattamenti.';

COMMENT ON COLUMN mechanical_work_register.zone_id IS
'DOVE: Zona specifica del giardino (precision agriculture)';

COMMENT ON COLUMN mechanical_work_register.row_ids IS
'DOVE: Array UUID dei file specifici lavorati';

COMMENT ON COLUMN mechanical_work_register.bed_ids IS
'DOVE: Array UUID delle aiuole lavorate';

COMMENT ON COLUMN mechanical_work_register.area_covered_sqm IS
'Superficie effettivamente lavorata in m²';

COMMENT ON COLUMN mechanical_work_register.depth_cm IS
'Profondità lavorazione in cm (es. 35cm per aratura, 15cm per sarchiatura)';

COMMENT ON COLUMN mechanical_work_register.duration_minutes IS
'Durata effettiva lavorazione in minuti';

COMMENT ON COLUMN mechanical_work_register.cost IS
'Costo lavorazione (carburante + operatore + noleggio attrezzatura)';

COMMENT ON COLUMN mechanical_work_register.weather_conditions IS
'Condizioni meteo durante lavorazione (temp, pioggia, umidità terreno).
Formato: {"temperature": 18, "rain_mm": 0, "soil_moisture": "optimal"}';

COMMENT ON COLUMN mechanical_work_register.scheduled_date IS
'Data pianificata (può differire da work_date se riprogrammato per meteo)';

COMMENT ON TABLE mechanical_work_sequences IS
'Sequenze standard di lavorazioni (es. "Preparazione Orto Estivo": concimazione -> vangatura -> frangizollatura -> aratura -> fresatura)';

COMMENT ON FUNCTION get_next_work_in_sequence IS
'Ritorna prossima lavorazione suggerita in una sequenza per un giardino.
Utile per guidare utente step-by-step nella preparazione terreno.';

COMMENT ON FUNCTION get_mechanical_work_stats IS
'Statistiche aggregate lavorazioni per anno: totale lavori, area, costo, ore, breakdown per tipo.
Utile per analytics e ROI calculation.';
