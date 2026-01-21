-- =====================================================
-- DAILY DIARY SYSTEM
-- Sistema di diario giornaliero automatico
-- =====================================================
-- 
-- Registra automaticamente ogni giorno:
-- - Dati meteo e calcoli agronomici (GDD, ore freddo)
-- - Fasi lunari
-- - Eventi automatici
-- - Correlazioni meteo-problemi-successi
--
-- Created: 2026-01-19
-- =====================================================

-- Tabella principale: daily_diary_entries
CREATE TABLE IF NOT EXISTS daily_diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Dati meteo del giorno
  weather_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Struttura:
  -- {
  --   "temp_min": number,
  --   "temp_max": number,
  --   "temp_avg": number,
  --   "precipitation_mm": number,
  --   "humidity_avg": number,
  --   "wind_speed_avg": number,
  --   "uv_index_max": number,
  --   "conditions": string
  -- }
  
  -- Calcoli agronomici
  agronomic_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Struttura:
  -- {
  --   "gdd_base_10": number,
  --   "gdd_base_5": number,
  --   "chill_hours": number,
  --   "heat_stress_hours": number,
  --   "water_stress_index": number,
  --   "photoperiod_hours": number
  -- }
  
  -- Fase lunare
  lunar_phase JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Struttura:
  -- {
  --   "phase": string,
  --   "illumination": number,
  --   "is_favorable_planting": boolean,
  --   "is_favorable_pruning": boolean
  -- }
  
  -- Eventi automatici registrati
  automated_events JSONB DEFAULT '{}'::jsonb,
  -- Struttura:
  -- {
  --   "irrigations": number,
  --   "treatments": number,
  --   "alerts": string[]
  -- }
  
  -- Note e osservazioni manuali
  notes TEXT,
  photos TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: un solo entry per giardino per giorno
  UNIQUE(garden_id, date)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_daily_diary_garden_date 
  ON daily_diary_entries(garden_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_diary_date 
  ON daily_diary_entries(date DESC);

-- Indice GIN per ricerche su JSONB
CREATE INDEX IF NOT EXISTS idx_daily_diary_weather_data 
  ON daily_diary_entries USING GIN (weather_data);

CREATE INDEX IF NOT EXISTS idx_daily_diary_agronomic_data 
  ON daily_diary_entries USING GIN (agronomic_data);

COMMENT ON TABLE daily_diary_entries IS 'Diario giornaliero automatico con dati meteo, calcoli agronomici e fase lunare';
COMMENT ON COLUMN daily_diary_entries.weather_data IS 'Dati meteo del giorno (temp, precipitazioni, umidità, vento, UV)';
COMMENT ON COLUMN daily_diary_entries.agronomic_data IS 'Calcoli agronomici (GDD, ore freddo, stress idrico, fotoperiodo)';
COMMENT ON COLUMN daily_diary_entries.lunar_phase IS 'Fase lunare e favorabilità per operazioni agricole';
COMMENT ON COLUMN daily_diary_entries.automated_events IS 'Eventi automatici registrati (irrigazioni, trattamenti, alert)';

-- =====================================================
-- Tabella: crop_gdd_accumulations
-- Accumulo GDD (Growing Degree Days) per coltura
-- =====================================================

CREATE TABLE IF NOT EXISTS crop_gdd_accumulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  plant_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  
  -- Accumuli
  total_gdd_base_10 DECIMAL(10,2) DEFAULT 0,
  total_gdd_base_5 DECIMAL(10,2) DEFAULT 0,
  total_chill_hours INTEGER DEFAULT 0,
  days_since_planting INTEGER DEFAULT 0,
  
  -- Fasi fenologiche raggiunte
  phenological_stages JSONB DEFAULT '[]'::jsonb,
  -- Struttura array:
  -- [
  --   {
  --     "stage": string,
  --     "date": string,
  --     "gdd_at_stage": number
  --   }
  -- ]
  
  -- Previsioni
  estimated_harvest_date DATE,
  estimated_days_to_harvest INTEGER,
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: un solo accumulo per task
  UNIQUE(task_id)
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_crop_gdd_garden 
  ON crop_gdd_accumulations(garden_id);

CREATE INDEX IF NOT EXISTS idx_crop_gdd_task 
  ON crop_gdd_accumulations(task_id);

CREATE INDEX IF NOT EXISTS idx_crop_gdd_plant_name 
  ON crop_gdd_accumulations(plant_name);

COMMENT ON TABLE crop_gdd_accumulations IS 'Accumulo GDD (Growing Degree Days) e ore freddo per ogni coltura';
COMMENT ON COLUMN crop_gdd_accumulations.total_gdd_base_10 IS 'GDD accumulati con base 10°C';
COMMENT ON COLUMN crop_gdd_accumulations.total_gdd_base_5 IS 'GDD accumulati con base 5°C';
COMMENT ON COLUMN crop_gdd_accumulations.total_chill_hours IS 'Ore freddo accumulate (< 7°C)';
COMMENT ON COLUMN crop_gdd_accumulations.phenological_stages IS 'Fasi fenologiche raggiunte con data e GDD';

-- =====================================================
-- Tabella: event_correlations
-- Correlazioni eventi meteo → problemi → azioni
-- =====================================================

CREATE TABLE IF NOT EXISTS event_correlations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Evento meteo
  weather_event JSONB NOT NULL,
  -- Struttura:
  -- {
  --   "type": "frost" | "heat_wave" | "heavy_rain" | "drought" | "wind_storm",
  --   "severity": "low" | "medium" | "high",
  --   "duration_days": number
  -- }
  
  -- Impatto osservato
  observed_impact JSONB NOT NULL,
  -- Struttura:
  -- {
  --   "affected_plants": string[],
  --   "problem_type": "disease" | "pest" | "stress" | "damage",
  --   "severity": "low" | "medium" | "high",
  --   "recovery_days": number
  -- }
  
  -- Azioni intraprese
  actions_taken JSONB DEFAULT '[]'::jsonb,
  -- Struttura array:
  -- [
  --   {
  --     "type": string,
  --     "date": string,
  --     "effectiveness": "low" | "medium" | "high"
  --   }
  -- ]
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_event_correlations_garden 
  ON event_correlations(garden_id);

CREATE INDEX IF NOT EXISTS idx_event_correlations_date 
  ON event_correlations(date DESC);

CREATE INDEX IF NOT EXISTS idx_event_correlations_weather_event 
  ON event_correlations USING GIN (weather_event);

COMMENT ON TABLE event_correlations IS 'Correlazioni tra eventi meteo, problemi osservati e azioni intraprese';
COMMENT ON COLUMN event_correlations.weather_event IS 'Evento meteo significativo (gelo, caldo, pioggia, siccità, vento)';
COMMENT ON COLUMN event_correlations.observed_impact IS 'Impatto osservato sulle piante';
COMMENT ON COLUMN event_correlations.actions_taken IS 'Azioni intraprese e loro efficacia';

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

ALTER TABLE daily_diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_gdd_accumulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_correlations ENABLE ROW LEVEL SECURITY;

-- Policy per daily_diary_entries
CREATE POLICY "Users can view their own diary entries"
  ON daily_diary_entries FOR SELECT
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own diary entries"
  ON daily_diary_entries FOR INSERT
  WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own diary entries"
  ON daily_diary_entries FOR UPDATE
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- Policy per crop_gdd_accumulations
CREATE POLICY "Users can view their own crop GDD"
  ON crop_gdd_accumulations FOR SELECT
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own crop GDD"
  ON crop_gdd_accumulations FOR INSERT
  WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own crop GDD"
  ON crop_gdd_accumulations FOR UPDATE
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- Policy per event_correlations
CREATE POLICY "Users can view their own event correlations"
  ON event_correlations FOR SELECT
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own event correlations"
  ON event_correlations FOR INSERT
  WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- Funzioni helper
-- =====================================================

-- Funzione per ottenere statistiche mensili
CREATE OR REPLACE FUNCTION get_monthly_diary_stats(
  p_garden_id UUID,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS TABLE (
  avg_temp_min DECIMAL,
  avg_temp_max DECIMAL,
  total_precipitation DECIMAL,
  total_gdd_base_10 DECIMAL,
  total_chill_hours INTEGER,
  frost_days INTEGER,
  heat_stress_days INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    AVG((weather_data->>'temp_min')::DECIMAL) as avg_temp_min,
    AVG((weather_data->>'temp_max')::DECIMAL) as avg_temp_max,
    SUM((weather_data->>'precipitation_mm')::DECIMAL) as total_precipitation,
    SUM((agronomic_data->>'gdd_base_10')::DECIMAL) as total_gdd_base_10,
    SUM((agronomic_data->>'chill_hours')::INTEGER) as total_chill_hours,
    COUNT(*) FILTER (WHERE (weather_data->>'temp_min')::DECIMAL < 0) as frost_days,
    COUNT(*) FILTER (WHERE (agronomic_data->>'heat_stress_hours')::INTEGER > 0) as heat_stress_days
  FROM daily_diary_entries
  WHERE garden_id = p_garden_id
    AND EXTRACT(YEAR FROM date) = p_year
    AND EXTRACT(MONTH FROM date) = p_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per confrontare anni
CREATE OR REPLACE FUNCTION compare_years_same_period(
  p_garden_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_years_back INTEGER DEFAULT 3
)
RETURNS TABLE (
  year INTEGER,
  avg_temp DECIMAL,
  total_precip DECIMAL,
  total_gdd DECIMAL
) AS $$
DECLARE
  v_year INTEGER;
  v_day_of_year_start INTEGER;
  v_day_of_year_end INTEGER;
BEGIN
  v_day_of_year_start := EXTRACT(DOY FROM p_start_date);
  v_day_of_year_end := EXTRACT(DOY FROM p_end_date);
  
  FOR v_year IN (EXTRACT(YEAR FROM p_start_date) - p_years_back)..(EXTRACT(YEAR FROM p_start_date)) LOOP
    RETURN QUERY
    SELECT
      v_year as year,
      AVG((weather_data->>'temp_avg')::DECIMAL) as avg_temp,
      SUM((weather_data->>'precipitation_mm')::DECIMAL) as total_precip,
      SUM((agronomic_data->>'gdd_base_10')::DECIMAL) as total_gdd
    FROM daily_diary_entries
    WHERE garden_id = p_garden_id
      AND EXTRACT(YEAR FROM date) = v_year
      AND EXTRACT(DOY FROM date) BETWEEN v_day_of_year_start AND v_day_of_year_end;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Trigger per updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_daily_diary_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_daily_diary_updated_at
  BEFORE UPDATE ON daily_diary_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_diary_updated_at();

CREATE TRIGGER trigger_crop_gdd_updated_at
  BEFORE UPDATE ON crop_gdd_accumulations
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_diary_updated_at();

-- =====================================================
-- Grant permissions
-- =====================================================

GRANT SELECT, INSERT, UPDATE ON daily_diary_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE ON crop_gdd_accumulations TO authenticated;
GRANT SELECT, INSERT ON event_correlations TO authenticated;

-- =====================================================
-- Success message
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Daily Diary System created successfully';
  RAISE NOTICE '📊 Tables: daily_diary_entries, crop_gdd_accumulations, event_correlations';
  RAISE NOTICE '🔧 Functions: get_monthly_diary_stats, compare_years_same_period';
END $$;
