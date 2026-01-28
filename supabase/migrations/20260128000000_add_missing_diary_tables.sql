-- Add missing tables for diary and tracking features
-- These tables are referenced in the app but don't exist yet

-- Daily weather log table
CREATE TABLE IF NOT EXISTS daily_weather_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  temperature_min DECIMAL(5,2),
  temperature_max DECIMAL(5,2),
  precipitation_mm DECIMAL(6,2),
  weather_code INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(garden_id, log_date)
);

-- Cultivation daily tracking table
CREATE TABLE IF NOT EXISTS cultivation_daily_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  tracking_date DATE NOT NULL,
  activities JSONB DEFAULT '[]'::jsonb,
  observations TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(garden_id, tracking_date)
);

-- Diary events table (for automated diary)
CREATE TABLE IF NOT EXISTS diary_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_weather_log_garden_date ON daily_weather_log(garden_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_cultivation_tracking_garden_date ON cultivation_daily_tracking(garden_id, tracking_date DESC);
CREATE INDEX IF NOT EXISTS idx_diary_events_garden_date ON diary_events(garden_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_diary_events_type ON diary_events(event_type);

-- RLS Policies
ALTER TABLE daily_weather_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultivation_daily_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_events ENABLE ROW LEVEL SECURITY;

-- Policies for daily_weather_log
CREATE POLICY "Users can view their own weather logs"
  ON daily_weather_log FOR SELECT
  USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own weather logs"
  ON daily_weather_log FOR INSERT
  WITH CHECK (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own weather logs"
  ON daily_weather_log FOR UPDATE
  USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

-- Policies for cultivation_daily_tracking
CREATE POLICY "Users can view their own cultivation tracking"
  ON cultivation_daily_tracking FOR SELECT
  USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own cultivation tracking"
  ON cultivation_daily_tracking FOR INSERT
  WITH CHECK (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own cultivation tracking"
  ON cultivation_daily_tracking FOR UPDATE
  USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

-- Policies for diary_events
CREATE POLICY "Users can view their own diary events"
  ON diary_events FOR SELECT
  USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own diary events"
  ON diary_events FOR INSERT
  WITH CHECK (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own diary events"
  ON diary_events FOR UPDATE
  USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own diary events"
  ON diary_events FOR DELETE
  USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));
