-- Migration: Weekly Photo Reminders
-- Tabella per gestire reminder settimanali per foto di tracking crescita

CREATE TABLE IF NOT EXISTS weekly_photo_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES garden_tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  last_photo_date DATE,
  next_reminder_date DATE NOT NULL,
  reminder_sent BOOLEAN DEFAULT false,
  reminder_count INTEGER DEFAULT 0,
  frequency_days INTEGER DEFAULT 7, -- Giorni tra un reminder e l'altro (default 7 = settimanale)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id) -- Un solo reminder attivo per task
);

-- Indici per query ottimizzate
CREATE INDEX IF NOT EXISTS idx_photo_reminders_task ON weekly_photo_reminders(task_id);
CREATE INDEX IF NOT EXISTS idx_photo_reminders_user ON weekly_photo_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_photo_reminders_garden ON weekly_photo_reminders(garden_id);
CREATE INDEX IF NOT EXISTS idx_photo_reminders_next_date ON weekly_photo_reminders(next_reminder_date) WHERE reminder_sent = false;
CREATE INDEX IF NOT EXISTS idx_photo_reminders_user_date ON weekly_photo_reminders(user_id, next_reminder_date) WHERE reminder_sent = false;

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_weekly_photo_reminders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_weekly_photo_reminders_updated_at ON weekly_photo_reminders;
CREATE TRIGGER update_weekly_photo_reminders_updated_at
  BEFORE UPDATE ON weekly_photo_reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_weekly_photo_reminders_updated_at();

-- RLS Policies
ALTER TABLE weekly_photo_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own photo reminders"
  ON weekly_photo_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own photo reminders"
  ON weekly_photo_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photo reminders"
  ON weekly_photo_reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photo reminders"
  ON weekly_photo_reminders FOR DELETE
  USING (auth.uid() = user_id);

-- Commenti
COMMENT ON TABLE weekly_photo_reminders IS 'Reminder settimanali per foto di tracking crescita piante';
COMMENT ON COLUMN weekly_photo_reminders.frequency_days IS 'Giorni tra un reminder e l''altro (default 7 = settimanale, può essere 14 per fase Production)';
COMMENT ON COLUMN weekly_photo_reminders.reminder_count IS 'Numero di reminder inviati finora per questo task';

