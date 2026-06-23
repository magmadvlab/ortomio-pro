-- Create field_alerts table with RLS for Farm Command Center
-- Alerts track garden health metrics: water status, treatment scheduling, heat stress, disease detection, harvest readiness

CREATE TABLE IF NOT EXISTS field_alerts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id    uuid NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  category     text NOT NULL CHECK (category IN ('water','treatment','heat','disease','harvest')),
  severity     text NOT NULL CHECK (severity IN ('ok','warning','critical')),
  message      text NOT NULL,
  computed_at  timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL,
  meta         jsonb
);

CREATE INDEX IF NOT EXISTS idx_field_alerts_garden_expires
  ON field_alerts (garden_id, expires_at DESC);

-- RLS: solo l'owner del garden può leggere/scrivere i suoi alert
ALTER TABLE field_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner can manage field_alerts"
  ON field_alerts
  FOR ALL
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );
