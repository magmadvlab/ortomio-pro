-- Migration: Add Weather Reschedule Tracking System
-- Traccia tutte le riprogrammazioni automatiche di task per meteo
-- Pattern: Memoria permanente delle decisioni del sistema meteo-intelligente
-- Created: 2025-12-25

-- Enable UUID extension (se non già abilitato)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TABELLA WEATHER RESCHEDULE LOGS
-- ============================================
-- Traccia ogni riprogrammazione automatica causata dal meteo
-- Permette analisi storica: "Quante volte ho dovuto spostare trattamenti per pioggia?"

CREATE TABLE IF NOT EXISTS weather_reschedule_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Collegamenti
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES garden_tasks(id) ON DELETE SET NULL,

  -- Date
  original_date DATE NOT NULL,
  new_date DATE NOT NULL,

  -- Ragione riprogrammazione
  reason TEXT NOT NULL, -- "Pioggia 18mm prevista (trattamento richiede 0mm)"

  -- Task info (snapshot al momento riprogrammazione)
  task_type TEXT NOT NULL, -- 'Treatment', 'Fertilize', etc.
  plant_name TEXT, -- 'Pomodoro', 'Lattuga', etc.

  -- Meteo (snapshot forecast al momento decisione)
  weather_data JSONB, -- { originalForecast: {...}, newForecast: {...} }

  -- Azione utente
  user_action TEXT CHECK (user_action IN ('accepted', 'rejected', 'auto', 'pending')) DEFAULT 'pending',
  user_action_at TIMESTAMP WITH TIME ZONE, -- Quando user ha confermato/rifiutato

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. INDICI
-- ============================================
CREATE INDEX IF NOT EXISTS idx_weather_reschedule_garden ON weather_reschedule_logs(garden_id);
CREATE INDEX IF NOT EXISTS idx_weather_reschedule_task ON weather_reschedule_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_weather_reschedule_date ON weather_reschedule_logs(original_date DESC);
CREATE INDEX IF NOT EXISTS idx_weather_reschedule_created ON weather_reschedule_logs(created_at DESC);

-- Indice per query analytics: "Quante riprogrammazioni per pianta?"
CREATE INDEX IF NOT EXISTS idx_weather_reschedule_plant ON weather_reschedule_logs(plant_name)
  WHERE plant_name IS NOT NULL;

-- Indice per query analytics: "Quante riprogrammazioni per task type?"
CREATE INDEX IF NOT EXISTS idx_weather_reschedule_tasktype ON weather_reschedule_logs(task_type);

-- ============================================
-- 3. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE weather_reschedule_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their weather reschedule logs"
  ON weather_reschedule_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = weather_reschedule_logs.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their weather reschedule logs"
  ON weather_reschedule_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = weather_reschedule_logs.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their weather reschedule logs"
  ON weather_reschedule_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = weather_reschedule_logs.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

-- ============================================
-- 4. COMMENTI ESPLICATIVI
-- ============================================
COMMENT ON TABLE weather_reschedule_logs IS
'Log riprogrammazioni automatiche task causate da meteo sfavorevole.
Permette tracciabilità completa delle decisioni del sistema meteo-intelligente
e analisi storica per migliorare algoritmi.';

COMMENT ON COLUMN weather_reschedule_logs.reason IS
'Motivazione tecnica riprogrammazione (es. "Pioggia 18mm prevista, trattamento richiede 0mm").
Mostrata all''utente nella notifica.';

COMMENT ON COLUMN weather_reschedule_logs.weather_data IS
'Snapshot forecast al momento della decisione.
Formato: {
  "originalForecast": { "date": "2025-05-20", "rain": 18, "temp": 22, ... },
  "newForecast": { "date": "2025-05-22", "rain": 0, "temp": 20, ... },
  "allForecast": [...] // Forecast 7 giorni completo
}';

COMMENT ON COLUMN weather_reschedule_logs.user_action IS
'Azione utente dopo notifica:
- pending: utente non ha ancora risposto
- accepted: utente ha confermato riprogrammazione
- rejected: utente ha mantenuto data originale (override)
- auto: riprogrammato automaticamente senza conferma utente (se abilitato)';

-- ============================================
-- 5. FUNZIONE HELPER: Get Reschedule Statistics
-- ============================================
-- Funzione per ottenere statistiche riprogrammazioni per giardino

CREATE OR REPLACE FUNCTION get_weather_reschedule_stats(
  p_garden_id UUID,
  p_days_back INTEGER DEFAULT 90
)
RETURNS TABLE (
  total_reschedules BIGINT,
  accepted_count BIGINT,
  rejected_count BIGINT,
  pending_count BIGINT,
  most_common_reason TEXT,
  most_affected_plant TEXT,
  most_affected_task_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_reschedules,
    COUNT(*) FILTER (WHERE user_action = 'accepted') as accepted_count,
    COUNT(*) FILTER (WHERE user_action = 'rejected') as rejected_count,
    COUNT(*) FILTER (WHERE user_action = 'pending') as pending_count,

    -- Ragione più comune (top 1)
    (
      SELECT reason
      FROM weather_reschedule_logs
      WHERE garden_id = p_garden_id
        AND created_at > NOW() - (p_days_back || ' days')::INTERVAL
      GROUP BY reason
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as most_common_reason,

    -- Pianta più colpita
    (
      SELECT plant_name
      FROM weather_reschedule_logs
      WHERE garden_id = p_garden_id
        AND plant_name IS NOT NULL
        AND created_at > NOW() - (p_days_back || ' days')::INTERVAL
      GROUP BY plant_name
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as most_affected_plant,

    -- Task type più colpito
    (
      SELECT task_type
      FROM weather_reschedule_logs
      WHERE garden_id = p_garden_id
        AND created_at > NOW() - (p_days_back || ' days')::INTERVAL
      GROUP BY task_type
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as most_affected_task_type

  FROM weather_reschedule_logs
  WHERE garden_id = p_garden_id
    AND created_at > NOW() - (p_days_back || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_weather_reschedule_stats IS
'Restituisce statistiche riprogrammazioni meteo per un giardino negli ultimi N giorni.
Utile per dashboard analytics e report mensili.';

-- ============================================
-- 6. ESEMPI DI QUERY UTILI
-- ============================================

-- Query 1: Tutte le riprogrammazioni non confermate (pending)
-- SELECT * FROM weather_reschedule_logs
-- WHERE garden_id = 'xxx' AND user_action = 'pending'
-- ORDER BY created_at DESC;

-- Query 2: Statistiche ultimo mese
-- SELECT * FROM get_weather_reschedule_stats('garden-uuid', 30);

-- Query 3: Riprogrammazioni per pianta (es. Pomodoro)
-- SELECT
--   original_date,
--   new_date,
--   reason,
--   user_action
-- FROM weather_reschedule_logs
-- WHERE garden_id = 'xxx'
--   AND plant_name = 'Pomodoro'
-- ORDER BY created_at DESC;

-- Query 4: Efficacia riprogrammazioni (% accepted vs rejected)
-- SELECT
--   task_type,
--   COUNT(*) as total,
--   COUNT(*) FILTER (WHERE user_action = 'accepted') as accepted,
--   COUNT(*) FILTER (WHERE user_action = 'rejected') as rejected,
--   ROUND(
--     100.0 * COUNT(*) FILTER (WHERE user_action = 'accepted') / COUNT(*),
--     2
--   ) as acceptance_rate
-- FROM weather_reschedule_logs
-- WHERE garden_id = 'xxx'
--   AND user_action IN ('accepted', 'rejected')
-- GROUP BY task_type
-- ORDER BY total DESC;

-- Query 5: Timeline riprogrammazioni (per grafici)
-- SELECT
--   DATE_TRUNC('week', created_at) as week,
--   COUNT(*) as reschedules,
--   COUNT(*) FILTER (WHERE user_action = 'accepted') as accepted
-- FROM weather_reschedule_logs
-- WHERE garden_id = 'xxx'
--   AND created_at > NOW() - INTERVAL '6 months'
-- GROUP BY week
-- ORDER BY week DESC;

-- ============================================
-- 7. TRIGGER: Auto-update user_action_at
-- ============================================
-- Aggiorna automaticamente user_action_at quando user_action cambia

CREATE OR REPLACE FUNCTION update_user_action_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_action IS DISTINCT FROM OLD.user_action
     AND NEW.user_action IN ('accepted', 'rejected') THEN
    NEW.user_action_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_action_timestamp
  BEFORE UPDATE ON weather_reschedule_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_user_action_timestamp();

COMMENT ON TRIGGER set_user_action_timestamp ON weather_reschedule_logs IS
'Aggiorna automaticamente user_action_at quando utente conferma/rifiuta riprogrammazione';
