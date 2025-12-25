-- Migration: Add Health Alerts System
-- Descrizione: Tabella per alert automatici di salute delle piante
-- Data: 2024-12-24
-- Fase: FASE 1 - Sprint 4

-- Crea tabella health_alerts
CREATE TABLE IF NOT EXISTS health_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  plant_id UUID REFERENCES plants(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('weather', 'water', 'disease', 'pest', 'nutrient')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  source TEXT NOT NULL, -- 'weather_api', 'task_overdue', 'sensor', 'ai', 'seasonal'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  recommendation TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- 🔴 CRITICO: Abilitare RLS (Row Level Security)
ALTER TABLE health_alerts ENABLE ROW LEVEL SECURITY;

-- Policy: utente vede solo alert dei suoi giardini
CREATE POLICY health_alerts_user ON health_alerts
  FOR ALL
  USING (
    auth.uid() = (
      SELECT user_id
      FROM gardens
      WHERE id = health_alerts.garden_id
    )
  );

-- Trigger updated_at (pattern standard progetto)
CREATE OR REPLACE FUNCTION update_health_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER health_alerts_updated_at
  BEFORE UPDATE ON health_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_health_alerts_updated_at();

-- Indici per performance
CREATE INDEX idx_health_alerts_garden ON health_alerts(garden_id);
CREATE INDEX idx_health_alerts_unresolved ON health_alerts(garden_id, resolved) WHERE resolved = FALSE;
CREATE INDEX idx_health_alerts_created ON health_alerts(created_at DESC);
CREATE INDEX idx_health_alerts_severity ON health_alerts(severity) WHERE resolved = FALSE;

-- Commenti per documentazione
COMMENT ON TABLE health_alerts IS 'Alert automatici di salute delle piante basati su meteo, task, sensori';
COMMENT ON COLUMN health_alerts.alert_type IS 'Tipo di alert: weather, water, disease, pest, nutrient';
COMMENT ON COLUMN health_alerts.severity IS 'Gravità: info, warning, critical';
COMMENT ON COLUMN health_alerts.source IS 'Fonte: weather_api, task_overdue, sensor, ai, seasonal';
COMMENT ON COLUMN health_alerts.metadata IS 'Dati extra JSON (temperatura, umidità, ecc.)';
