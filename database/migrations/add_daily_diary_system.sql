-- Migration: Add Daily Diary System
-- Sistema di registrazione automatica per diario vegetativo
-- Base per analisi predittiva e confronti anno su anno

-- ============================================
-- DAILY WEATHER LOG
-- Registrazione giornaliera meteo automatica
-- ============================================
CREATE TABLE IF NOT EXISTS daily_weather_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,

  -- Data riferimento
  log_date DATE NOT NULL,

  -- Temperature
  temp_min DECIMAL(4,1),
  temp_max DECIMAL(4,1),
  temp_avg DECIMAL(4,1),

  -- Precipitazioni
  precipitation_mm DECIMAL(5,1) DEFAULT 0,
  precipitation_type TEXT, -- rain, snow, hail, none

  -- Umidità
  humidity_min INTEGER,
  humidity_max INTEGER,
  humidity_avg INTEGER,

  -- Vento
  wind_speed_max DECIMAL(4,1),
  wind_speed_avg DECIMAL(4,1),
  wind_direction TEXT,

  -- Radiazione solare
  solar_radiation_mj DECIMAL(5,2), -- MJ/m²
  uv_index_max DECIMAL(3,1),
  daylight_hours DECIMAL(4,2),

  -- Pressione atmosferica
  pressure_hpa INTEGER,

  -- Evapotraspirazione
  eto_mm DECIMAL(4,2), -- Evapotraspirazione di riferimento

  -- Condizioni speciali
  frost_occurred BOOLEAN DEFAULT false,
  frost_hours INTEGER DEFAULT 0,
  heat_stress_hours INTEGER DEFAULT 0, -- ore > 35°C

  -- Fonte dati
  data_source TEXT DEFAULT 'open-meteo', -- open-meteo, manual, weather-station

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(garden_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_weather_log_garden_date ON daily_weather_log(garden_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_weather_log_frost ON daily_weather_log(garden_id, frost_occurred) WHERE frost_occurred = true;

-- ============================================
-- CULTIVATION DAILY TRACKING
-- Tracking giornaliero per ogni coltura attiva
-- ============================================
CREATE TABLE IF NOT EXISTS cultivation_daily_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  cultivation_id UUID NOT NULL, -- Riferimento a garden_tasks o cultivation_plans

  -- Data riferimento
  tracking_date DATE NOT NULL,

  -- Gradi Giorno (GDD)
  gdd_daily DECIMAL(5,2), -- GDD accumulati oggi
  gdd_cumulative DECIMAL(7,2), -- GDD totali dalla semina/trapianto
  gdd_base_temp DECIMAL(4,1), -- Temperatura base usata per calcolo

  -- Ore freddo (per colture perenni)
  chill_hours_daily INTEGER DEFAULT 0,
  chill_hours_cumulative INTEGER DEFAULT 0,
  chill_model TEXT, -- utah, hours_below_7, dynamic

  -- Fase fenologica
  phenological_stage TEXT, -- germination, vegetative, flowering, fruiting, etc.
  phenological_stage_day INTEGER, -- giorni in questa fase
  estimated_days_to_next_stage INTEGER,

  -- Stress indicators
  water_stress_index DECIMAL(3,2), -- 0-1 (0=no stress, 1=severe)
  heat_stress_index DECIMAL(3,2),
  cold_stress_index DECIMAL(3,2),

  -- Bilancio idrico
  water_balance_mm DECIMAL(5,1), -- precipitazioni + irrigazione - ETo
  irrigation_mm DECIMAL(4,1) DEFAULT 0,

  -- Note automatiche
  auto_notes JSONB DEFAULT '[]'::jsonb, -- Array di note generate automaticamente

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(cultivation_id, tracking_date)
);

CREATE INDEX IF NOT EXISTS idx_cultivation_tracking_date ON cultivation_daily_tracking(cultivation_id, tracking_date DESC);
CREATE INDEX IF NOT EXISTS idx_cultivation_tracking_garden ON cultivation_daily_tracking(garden_id, tracking_date DESC);
CREATE INDEX IF NOT EXISTS idx_cultivation_tracking_stage ON cultivation_daily_tracking(phenological_stage);

-- ============================================
-- DIARY EVENTS
-- Eventi significativi (automatici e manuali)
-- ============================================
CREATE TABLE IF NOT EXISTS diary_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  cultivation_id UUID, -- NULL se evento a livello giardino

  -- Data e ora evento
  event_date DATE NOT NULL,
  event_time TIME,

  -- Tipo evento
  event_category TEXT NOT NULL CHECK (event_category IN (
    'weather',        -- Eventi meteo significativi
    'phenological',   -- Cambio fase fenologica
    'treatment',      -- Trattamenti fitosanitari
    'fertilization',  -- Concimazioni
    'irrigation',     -- Irrigazioni
    'pruning',        -- Potature
    'harvest',        -- Raccolte
    'problem',        -- Problemi rilevati
    'observation',    -- Osservazioni generali
    'alert',          -- Alert automatici
    'milestone'       -- Milestone raggiunti
  )),

  event_type TEXT NOT NULL, -- Sottotipo specifico
  event_severity TEXT DEFAULT 'info' CHECK (event_severity IN ('info', 'warning', 'critical', 'success')),

  -- Descrizione
  title TEXT NOT NULL,
  description TEXT,

  -- Dati strutturati evento
  event_data JSONB DEFAULT '{}'::jsonb,

  -- Condizioni al momento dell'evento
  conditions_snapshot JSONB, -- { temp, humidity, weather, soil_moisture, etc. }

  -- Correlazioni
  related_events JSONB DEFAULT '[]'::jsonb, -- Array di event_id correlati
  caused_by_event_id UUID REFERENCES diary_events(id),

  -- Fonte
  source TEXT DEFAULT 'auto' CHECK (source IN ('auto', 'manual', 'sensor', 'ai')),

  -- Media allegati
  photos JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diary_events_garden_date ON diary_events(garden_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_diary_events_cultivation ON diary_events(cultivation_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_diary_events_category ON diary_events(event_category);
CREATE INDEX IF NOT EXISTS idx_diary_events_severity ON diary_events(event_severity) WHERE event_severity IN ('warning', 'critical');

-- ============================================
-- PREDICTIVE INSIGHTS
-- Insight e previsioni generate dall'analisi
-- ============================================
CREATE TABLE IF NOT EXISTS predictive_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  cultivation_id UUID,

  -- Data generazione
  generated_date DATE NOT NULL,
  valid_until DATE, -- Fino a quando è valido l'insight

  -- Tipo insight
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'harvest_timing',     -- Previsione data raccolta
    'disease_risk',       -- Rischio malattie
    'pest_risk',          -- Rischio parassiti
    'frost_risk',         -- Rischio gelate
    'irrigation_need',    -- Necessità irrigazione
    'fertilization_need', -- Necessità concimazione
    'phenological_pred',  -- Previsione fase fenologica
    'yield_estimate',     -- Stima resa
    'quality_estimate',   -- Stima qualità
    'action_recommend',   -- Raccomandazione azione
    'trend_analysis',     -- Analisi trend
    'anomaly_detection'   -- Anomalia rilevata
  )),

  -- Contenuto insight
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Previsione quantitativa
  prediction_value DECIMAL(10,2),
  prediction_unit TEXT,
  prediction_range_min DECIMAL(10,2),
  prediction_range_max DECIMAL(10,2),

  -- Confidenza
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),

  -- Dati analisi
  analysis_data JSONB NOT NULL, -- Dati usati per generare insight
  model_used TEXT, -- Modello/algoritmo usato

  -- Azione raccomandata
  recommended_action TEXT,
  action_urgency TEXT CHECK (action_urgency IN ('immediate', 'soon', 'planned', 'optional')),
  action_deadline DATE,

  -- Tracking
  user_acknowledged BOOLEAN DEFAULT false,
  action_taken BOOLEAN DEFAULT false,
  action_taken_date DATE,
  outcome_recorded BOOLEAN DEFAULT false,
  outcome_data JSONB,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insights_garden_date ON predictive_insights(garden_id, generated_date DESC);
CREATE INDEX IF NOT EXISTS idx_insights_cultivation ON predictive_insights(cultivation_id, generated_date DESC);
CREATE INDEX IF NOT EXISTS idx_insights_type ON predictive_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_insights_pending ON predictive_insights(garden_id, user_acknowledged) WHERE user_acknowledged = false;

-- ============================================
-- YEARLY COMPARISON DATA
-- Dati aggregati per confronti anno su anno
-- ============================================
CREATE TABLE IF NOT EXISTS yearly_comparison_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  cultivation_id UUID,
  plant_name TEXT NOT NULL,
  variety_name TEXT,

  -- Anno di riferimento
  year INTEGER NOT NULL,
  season TEXT CHECK (season IN ('spring', 'summer', 'autumn', 'winter', 'full_year')),

  -- Date chiave
  sowing_date DATE,
  transplant_date DATE,
  first_harvest_date DATE,
  last_harvest_date DATE,
  cycle_end_date DATE,

  -- Durata fasi (giorni)
  germination_days INTEGER,
  vegetative_days INTEGER,
  flowering_days INTEGER,
  fruiting_days INTEGER,
  total_cycle_days INTEGER,

  -- GDD accumulati per fase
  gdd_to_germination DECIMAL(6,1),
  gdd_to_flowering DECIMAL(6,1),
  gdd_to_first_harvest DECIMAL(6,1),
  gdd_total DECIMAL(7,1),

  -- Resa
  total_yield_kg DECIMAL(8,2),
  yield_per_plant_kg DECIMAL(6,3),
  yield_per_sqm_kg DECIMAL(6,3),
  harvest_count INTEGER,

  -- Qualità
  avg_quality_score DECIMAL(3,2), -- 0-5
  avg_brix DECIMAL(4,1),

  -- Problemi
  problems_count INTEGER DEFAULT 0,
  treatments_count INTEGER DEFAULT 0,
  disease_incidents JSONB DEFAULT '[]'::jsonb,
  pest_incidents JSONB DEFAULT '[]'::jsonb,

  -- Meteo stagionale
  avg_temp DECIMAL(4,1),
  total_precipitation_mm DECIMAL(6,1),
  frost_events INTEGER DEFAULT 0,
  heat_stress_days INTEGER DEFAULT 0,
  gdd_total_season DECIMAL(7,1),
  chill_hours_total INTEGER,

  -- Irrigazione totale
  total_irrigation_mm DECIMAL(7,1),
  irrigation_events INTEGER,

  -- Costi e ricavi (opzionale)
  total_costs DECIMAL(10,2),
  total_revenue DECIMAL(10,2),
  profit_margin DECIMAL(5,2),

  -- Note stagione
  season_notes TEXT,
  lessons_learned JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(garden_id, plant_name, variety_name, year, season)
);

CREATE INDEX IF NOT EXISTS idx_yearly_garden_year ON yearly_comparison_data(garden_id, year DESC);
CREATE INDEX IF NOT EXISTS idx_yearly_plant ON yearly_comparison_data(plant_name, year DESC);
CREATE INDEX IF NOT EXISTS idx_yearly_cultivation ON yearly_comparison_data(cultivation_id);

-- ============================================
-- GDD CROP PARAMETERS
-- Parametri GDD specifici per coltura
-- ============================================
CREATE TABLE IF NOT EXISTS gdd_crop_parameters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identificazione coltura
  plant_name TEXT NOT NULL,
  variety_name TEXT,
  archetype_id TEXT,

  -- Temperatura base per calcolo GDD
  base_temp_celsius DECIMAL(4,1) NOT NULL,
  max_temp_ceiling DECIMAL(4,1) DEFAULT 30, -- Temperatura sopra cui GDD non aumenta

  -- GDD richiesti per fase (valori medi)
  gdd_to_emergence DECIMAL(6,1),
  gdd_to_transplant_ready DECIMAL(6,1),
  gdd_to_flowering DECIMAL(6,1),
  gdd_to_first_fruit DECIMAL(6,1),
  gdd_to_maturity DECIMAL(6,1),

  -- Ore freddo (per colture perenni)
  chill_hours_required INTEGER,
  chill_model_recommended TEXT DEFAULT 'utah',

  -- Soglie stress
  cold_stress_threshold DECIMAL(4,1),
  heat_stress_threshold DECIMAL(4,1),
  optimal_temp_min DECIMAL(4,1),
  optimal_temp_max DECIMAL(4,1),

  -- Fonte dati
  data_source TEXT, -- literature, local_calibration, user_data
  confidence_level TEXT DEFAULT 'medium' CHECK (confidence_level IN ('low', 'medium', 'high')),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(plant_name, variety_name)
);

CREATE INDEX IF NOT EXISTS idx_gdd_params_plant ON gdd_crop_parameters(plant_name);
CREATE INDEX IF NOT EXISTS idx_gdd_params_archetype ON gdd_crop_parameters(archetype_id);

-- Inserisci parametri GDD per colture comuni
INSERT INTO gdd_crop_parameters (plant_name, archetype_id, base_temp_celsius, gdd_to_emergence, gdd_to_flowering, gdd_to_maturity, optimal_temp_min, optimal_temp_max, cold_stress_threshold, heat_stress_threshold)
VALUES
  -- Solanacee (A1)
  ('Pomodoro', 'A1', 10.0, 100, 600, 1200, 18, 27, 5, 35),
  ('Peperone', 'A1', 12.0, 120, 700, 1400, 20, 30, 8, 35),
  ('Melanzana', 'A1', 12.0, 110, 650, 1300, 20, 30, 10, 35),

  -- Cucurbitacee (A2, A3)
  ('Zucchino', 'A2', 10.0, 80, 400, 800, 18, 28, 5, 35),
  ('Cetriolo', 'A2', 12.0, 70, 450, 900, 20, 30, 8, 35),
  ('Melone', 'A3', 12.0, 100, 600, 1200, 22, 32, 10, 38),
  ('Anguria', 'A3', 15.0, 120, 700, 1400, 24, 34, 12, 40),
  ('Zucca', 'A3', 10.0, 90, 500, 1100, 18, 28, 5, 35),

  -- Insalate (A4)
  ('Lattuga', 'A4', 4.0, 50, 200, 400, 10, 20, -2, 28),
  ('Cicoria', 'A4', 5.0, 60, 250, 500, 12, 22, 0, 30),

  -- Brassiche (A6)
  ('Cavolo', 'A6', 5.0, 80, 400, 800, 12, 22, -5, 28),
  ('Broccolo', 'A6', 5.0, 70, 350, 700, 10, 20, -5, 25),
  ('Cavolfiore', 'A6', 5.0, 75, 380, 750, 12, 20, -3, 26),

  -- Bulbi (A7)
  ('Cipolla', 'A7', 4.0, 100, 600, 1200, 12, 24, -5, 30),
  ('Aglio', 'A7', 0.0, 80, 500, 1000, 10, 22, -10, 28),

  -- Radici (A8)
  ('Carota', 'A8', 4.0, 80, 400, 900, 12, 22, -3, 28),
  ('Patata', 'A8', 7.0, 100, 500, 1100, 15, 22, 0, 30),

  -- Legumi (A9)
  ('Fagiolo', 'A9', 10.0, 80, 350, 700, 18, 28, 5, 32),
  ('Pisello', 'A9', 4.0, 60, 300, 600, 10, 20, -5, 25),
  ('Fava', 'A9', 5.0, 70, 350, 700, 12, 22, -8, 28),

  -- Aromatiche (A10)
  ('Basilico', 'A10', 10.0, 50, 200, 400, 18, 28, 5, 35),

  -- Vite (L1)
  ('Vite', 'L1', 10.0, NULL, 800, 1800, 15, 30, -15, 38),

  -- Olivo (L2)
  ('Olivo', 'L2', 10.0, NULL, 600, 1400, 15, 32, -8, 40),

  -- Fruttiferi (L3)
  ('Melo', 'L3', 7.0, NULL, 500, 1200, 12, 25, -25, 35),
  ('Pero', 'L3', 7.0, NULL, 450, 1100, 12, 25, -20, 35),
  ('Pesco', 'L3', 7.0, NULL, 550, 1300, 15, 28, -15, 38),
  ('Ciliegio', 'L3', 5.0, NULL, 400, 900, 12, 25, -25, 32),
  ('Albicocco', 'L3', 5.0, NULL, 450, 1000, 12, 28, -20, 35),
  ('Agrumi', 'L3_CITRUS', 12.0, NULL, 600, 1400, 18, 32, 0, 40)
ON CONFLICT (plant_name, variety_name) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE daily_weather_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultivation_daily_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictive_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE yearly_comparison_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their weather logs" ON daily_weather_log
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gardens WHERE gardens.id = daily_weather_log.garden_id AND gardens.user_id = auth.uid())
  );

CREATE POLICY "Users can manage their cultivation tracking" ON cultivation_daily_tracking
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gardens WHERE gardens.id = cultivation_daily_tracking.garden_id AND gardens.user_id = auth.uid())
  );

CREATE POLICY "Users can manage their diary events" ON diary_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gardens WHERE gardens.id = diary_events.garden_id AND gardens.user_id = auth.uid())
  );

CREATE POLICY "Users can manage their insights" ON predictive_insights
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gardens WHERE gardens.id = predictive_insights.garden_id AND gardens.user_id = auth.uid())
  );

CREATE POLICY "Users can manage their yearly data" ON yearly_comparison_data
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gardens WHERE gardens.id = yearly_comparison_data.garden_id AND gardens.user_id = auth.uid())
  );

-- GDD parameters sono pubblici (lettura)
ALTER TABLE gdd_crop_parameters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read GDD parameters" ON gdd_crop_parameters FOR SELECT USING (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Funzione per calcolare GDD giornalieri
CREATE OR REPLACE FUNCTION calculate_daily_gdd(
  temp_min DECIMAL,
  temp_max DECIMAL,
  base_temp DECIMAL,
  ceiling_temp DECIMAL DEFAULT 30
) RETURNS DECIMAL AS $$
DECLARE
  avg_temp DECIMAL;
  effective_min DECIMAL;
  effective_max DECIMAL;
BEGIN
  -- Applica ceiling
  effective_min := LEAST(GREATEST(temp_min, base_temp), ceiling_temp);
  effective_max := LEAST(GREATEST(temp_max, base_temp), ceiling_temp);

  -- Calcola media
  avg_temp := (effective_min + effective_max) / 2;

  -- GDD = avg - base (non può essere negativo)
  RETURN GREATEST(0, avg_temp - base_temp);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Funzione per calcolare ore freddo (modello semplificato)
CREATE OR REPLACE FUNCTION calculate_chill_hours(
  temp_min DECIMAL,
  temp_max DECIMAL,
  hours_below_7 INTEGER DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  avg_temp DECIMAL;
  estimated_hours INTEGER;
BEGIN
  -- Se abbiamo dati orari, usiamo quelli
  IF hours_below_7 IS NOT NULL THEN
    RETURN hours_below_7;
  END IF;

  -- Altrimenti stimiamo dalle temperature min/max
  avg_temp := (temp_min + temp_max) / 2;

  -- Stima ore freddo basata su range termico
  IF temp_max < 7 THEN
    RETURN 24; -- Tutto il giorno sotto 7°C
  ELSIF temp_min > 7 THEN
    RETURN 0; -- Mai sotto 7°C
  ELSE
    -- Stima proporzionale
    estimated_hours := ROUND(24 * (7 - temp_min) / (temp_max - temp_min));
    RETURN GREATEST(0, LEAST(24, estimated_hours));
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON TABLE daily_weather_log IS 'Registrazione automatica giornaliera dei dati meteo per ogni giardino';
COMMENT ON TABLE cultivation_daily_tracking IS 'Tracking giornaliero GDD, stress e stato per ogni coltura attiva';
COMMENT ON TABLE diary_events IS 'Eventi significativi automatici e manuali del diario vegetativo';
COMMENT ON TABLE predictive_insights IS 'Insight e previsioni generate dall analisi dei dati storici';
COMMENT ON TABLE yearly_comparison_data IS 'Dati aggregati annuali per confronti pluriennali';
COMMENT ON TABLE gdd_crop_parameters IS 'Parametri GDD e soglie termiche per coltura';
