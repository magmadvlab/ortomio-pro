-- =====================================================
-- PLANT LIFECYCLE TRACKING SYSTEM
-- Tracciamento automatico ciclo vita piante
-- Data: 27 Gennaio 2026
-- =====================================================

-- Tabella eventi lifecycle
CREATE TABLE IF NOT EXISTS plant_lifecycle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  
  -- Location tracking
  zone_id UUID REFERENCES garden_zones(id) ON DELETE SET NULL,
  field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL,
  field_row_section_id UUID REFERENCES field_row_sections(id) ON DELETE SET NULL,
  
  -- Dati coltura
  crop_name TEXT NOT NULL,
  crop_variety TEXT,
  plant_count INTEGER NOT NULL DEFAULT 1,
  
  -- Date ciclo vita
  seeding_date DATE NOT NULL,
  germination_date DATE,
  transplant_date DATE,
  first_flower_date DATE,
  first_fruit_date DATE,
  first_harvest_date DATE,
  last_harvest_date DATE,
  end_of_cycle_date DATE,
  
  -- Stati calcolati
  current_status TEXT NOT NULL DEFAULT 'seed',
  -- Possibili valori: seed, germinating, seedling, transplanted, growing, flowering, fruiting, harvesting, finished
  
  days_since_seeding INTEGER GENERATED ALWAYS AS (
    EXTRACT(DAY FROM (CURRENT_DATE - seeding_date))
  ) STORED,
  
  -- Dati varietà (da crop database)
  expected_germination_days INTEGER,
  expected_transplant_days INTEGER,
  expected_maturity_days INTEGER,
  expected_harvest_duration_days INTEGER,
  
  -- Notifiche
  notification_sent_germination BOOLEAN DEFAULT FALSE,
  notification_sent_transplant BOOLEAN DEFAULT FALSE,
  notification_sent_harvest BOOLEAN DEFAULT FALSE,
  notification_sent_end_cycle BOOLEAN DEFAULT FALSE,
  
  -- Metriche
  germination_rate NUMERIC(5,2), -- Percentuale germinazione
  actual_yield_kg NUMERIC(10,2), -- Resa effettiva
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX idx_plant_lifecycle_user ON plant_lifecycle_events(user_id);
CREATE INDEX idx_plant_lifecycle_garden ON plant_lifecycle_events(garden_id);
CREATE INDEX idx_plant_lifecycle_status ON plant_lifecycle_events(current_status);
CREATE INDEX idx_plant_lifecycle_seeding_date ON plant_lifecycle_events(seeding_date);
CREATE INDEX idx_plant_lifecycle_field_row ON plant_lifecycle_events(field_row_id);

-- RLS Policies
ALTER TABLE plant_lifecycle_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lifecycle events"
  ON plant_lifecycle_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lifecycle events"
  ON plant_lifecycle_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lifecycle events"
  ON plant_lifecycle_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lifecycle events"
  ON plant_lifecycle_events FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- CROP DATABASE - Dati varietà colture
-- =====================================================

CREATE TABLE IF NOT EXISTS crop_varieties_database (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificazione
  crop_name TEXT NOT NULL,
  variety_name TEXT,
  scientific_name TEXT,
  crop_family TEXT, -- Solanaceae, Brassicaceae, etc.
  
  -- Tempi ciclo vita (giorni)
  germination_days_min INTEGER NOT NULL,
  germination_days_max INTEGER NOT NULL,
  germination_days_avg INTEGER GENERATED ALWAYS AS (
    (germination_days_min + germination_days_max) / 2
  ) STORED,
  
  transplant_days_min INTEGER,
  transplant_days_max INTEGER,
  transplant_days_avg INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN transplant_days_min IS NOT NULL AND transplant_days_max IS NOT NULL
      THEN (transplant_days_min + transplant_days_max) / 2
      ELSE NULL
    END
  ) STORED,
  
  maturity_days_min INTEGER NOT NULL,
  maturity_days_max INTEGER NOT NULL,
  maturity_days_avg INTEGER GENERATED ALWAYS AS (
    (maturity_days_min + maturity_days_max) / 2
  ) STORED,
  
  harvest_duration_days INTEGER, -- Durata periodo raccolta
  
  -- Condizioni ottimali
  optimal_temp_min NUMERIC(4,1),
  optimal_temp_max NUMERIC(4,1),
  frost_tolerant BOOLEAN DEFAULT FALSE,
  
  -- Caratteristiche
  is_direct_seeding BOOLEAN DEFAULT TRUE,
  requires_transplant BOOLEAN DEFAULT FALSE,
  
  -- Resa attesa
  expected_yield_kg_per_plant NUMERIC(6,2),
  expected_yield_kg_per_sqm NUMERIC(6,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici
CREATE INDEX idx_crop_varieties_name ON crop_varieties_database(crop_name);
CREATE INDEX idx_crop_varieties_family ON crop_varieties_database(crop_family);

-- Dati iniziali comuni
INSERT INTO crop_varieties_database (
  crop_name, variety_name, crop_family,
  germination_days_min, germination_days_max,
  transplant_days_min, transplant_days_max,
  maturity_days_min, maturity_days_max,
  harvest_duration_days,
  is_direct_seeding, requires_transplant,
  expected_yield_kg_per_plant
) VALUES
  -- Pomodori
  ('Pomodoro', 'Datterino', 'Solanaceae', 7, 14, 30, 45, 70, 90, 60, FALSE, TRUE, 3.0),
  ('Pomodoro', 'San Marzano', 'Solanaceae', 7, 14, 30, 45, 75, 95, 60, FALSE, TRUE, 4.0),
  ('Pomodoro', 'Ciliegino', 'Solanaceae', 7, 14, 30, 45, 65, 85, 60, FALSE, TRUE, 2.5),
  
  -- Insalate
  ('Lattuga', 'Romana', 'Asteraceae', 5, 10, NULL, NULL, 45, 60, 14, TRUE, FALSE, 0.3),
  ('Lattuga', 'Iceberg', 'Asteraceae', 5, 10, NULL, NULL, 50, 70, 14, TRUE, FALSE, 0.5),
  ('Rucola', NULL, 'Brassicaceae', 3, 7, NULL, NULL, 30, 40, 21, TRUE, FALSE, 0.2),
  
  -- Zucchine
  ('Zucchina', 'Romanesco', 'Cucurbitaceae', 5, 10, NULL, NULL, 50, 65, 45, TRUE, FALSE, 5.0),
  ('Zucchina', 'Tonda', 'Cucurbitaceae', 5, 10, NULL, NULL, 50, 65, 45, TRUE, FALSE, 4.5),
  
  -- Peperoni
  ('Peperone', 'Quadrato', 'Solanaceae', 10, 15, 40, 55, 80, 100, 60, FALSE, TRUE, 2.0),
  ('Peperone', 'Friggitello', 'Solanaceae', 10, 15, 40, 55, 75, 90, 60, FALSE, TRUE, 1.5),
  
  -- Melanzane
  ('Melanzana', 'Lunga', 'Solanaceae', 10, 15, 40, 55, 80, 100, 60, FALSE, TRUE, 3.0),
  ('Melanzana', 'Tonda', 'Solanaceae', 10, 15, 40, 55, 80, 100, 60, FALSE, TRUE, 2.5),
  
  -- Basilico
  ('Basilico', 'Genovese', 'Lamiaceae', 7, 14, NULL, NULL, 40, 60, 90, TRUE, FALSE, 0.5),
  
  -- Carote
  ('Carota', 'Nantese', 'Apiaceae', 10, 20, NULL, NULL, 70, 90, 14, TRUE, FALSE, 0.15),
  
  -- Fagiolini
  ('Fagiolino', 'Nano', 'Fabaceae', 7, 14, NULL, NULL, 50, 65, 30, TRUE, FALSE, 1.0),
  ('Fagiolino', 'Rampicante', 'Fabaceae', 7, 14, NULL, NULL, 60, 75, 45, TRUE, FALSE, 1.5)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FUNZIONE: Calcolo automatico stato lifecycle
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_plant_lifecycle_status(
  p_seeding_date DATE,
  p_germination_date DATE,
  p_transplant_date DATE,
  p_first_harvest_date DATE,
  p_end_of_cycle_date DATE,
  p_expected_germination_days INTEGER,
  p_expected_transplant_days INTEGER,
  p_expected_maturity_days INTEGER
) RETURNS TEXT AS $$
DECLARE
  days_since_seeding INTEGER;
  current_status TEXT;
BEGIN
  days_since_seeding := EXTRACT(DAY FROM (CURRENT_DATE - p_seeding_date));
  
  -- Se ciclo finito
  IF p_end_of_cycle_date IS NOT NULL THEN
    RETURN 'finished';
  END IF;
  
  -- Se in raccolta
  IF p_first_harvest_date IS NOT NULL THEN
    RETURN 'harvesting';
  END IF;
  
  -- Se trapiantato
  IF p_transplant_date IS NOT NULL THEN
    IF days_since_seeding >= p_expected_maturity_days THEN
      RETURN 'fruiting';
    ELSIF days_since_seeding >= (p_expected_maturity_days * 0.7) THEN
      RETURN 'flowering';
    ELSE
      RETURN 'growing';
    END IF;
  END IF;
  
  -- Se germinato
  IF p_germination_date IS NOT NULL THEN
    IF p_expected_transplant_days IS NOT NULL AND 
       days_since_seeding >= p_expected_transplant_days THEN
      RETURN 'transplanted';
    ELSE
      RETURN 'seedling';
    END IF;
  END IF;
  
  -- Se in germinazione
  IF days_since_seeding >= p_expected_germination_days THEN
    RETURN 'germinating';
  END IF;
  
  -- Default: seme
  RETURN 'seed';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- TRIGGER: Aggiornamento automatico stato
-- =====================================================

CREATE OR REPLACE FUNCTION update_plant_lifecycle_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.current_status := calculate_plant_lifecycle_status(
    NEW.seeding_date,
    NEW.germination_date,
    NEW.transplant_date,
    NEW.first_harvest_date,
    NEW.end_of_cycle_date,
    NEW.expected_germination_days,
    NEW.expected_transplant_days,
    NEW.expected_maturity_days
  );
  
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_plant_lifecycle_status
  BEFORE INSERT OR UPDATE ON plant_lifecycle_events
  FOR EACH ROW
  EXECUTE FUNCTION update_plant_lifecycle_status();

-- =====================================================
-- VIEW: Notifiche pending
-- =====================================================

CREATE OR REPLACE VIEW plant_lifecycle_pending_notifications AS
SELECT 
  ple.*,
  cvd.crop_name as crop_display_name,
  
  -- Calcolo giorni rimanenti
  CASE 
    WHEN ple.germination_date IS NULL AND ple.expected_germination_days IS NOT NULL
    THEN ple.expected_germination_days - ple.days_since_seeding
    ELSE NULL
  END as days_until_germination,
  
  CASE 
    WHEN ple.transplant_date IS NULL AND ple.expected_transplant_days IS NOT NULL
    THEN ple.expected_transplant_days - ple.days_since_seeding
    ELSE NULL
  END as days_until_transplant,
  
  CASE 
    WHEN ple.first_harvest_date IS NULL AND ple.expected_maturity_days IS NOT NULL
    THEN ple.expected_maturity_days - ple.days_since_seeding
    ELSE NULL
  END as days_until_harvest,
  
  -- Tipo notifica da inviare
  CASE
    WHEN ple.germination_date IS NULL 
         AND ple.days_since_seeding >= ple.expected_germination_days 
         AND NOT ple.notification_sent_germination
    THEN 'germination'
    
    WHEN ple.transplant_date IS NULL 
         AND ple.germination_date IS NOT NULL
         AND ple.expected_transplant_days IS NOT NULL
         AND ple.days_since_seeding >= ple.expected_transplant_days 
         AND NOT ple.notification_sent_transplant
    THEN 'transplant'
    
    WHEN ple.first_harvest_date IS NULL 
         AND ple.days_since_seeding >= ple.expected_maturity_days 
         AND NOT ple.notification_sent_harvest
    THEN 'harvest'
    
    ELSE NULL
  END as notification_type

FROM plant_lifecycle_events ple
LEFT JOIN crop_varieties_database cvd 
  ON ple.crop_name = cvd.crop_name 
  AND (ple.crop_variety = cvd.variety_name OR ple.crop_variety IS NULL)
WHERE ple.end_of_cycle_date IS NULL;

-- Commenti
COMMENT ON TABLE plant_lifecycle_events IS 'Tracciamento automatico ciclo vita piante con notifiche';
COMMENT ON TABLE crop_varieties_database IS 'Database varietà colture con tempi ciclo vita';
COMMENT ON VIEW plant_lifecycle_pending_notifications IS 'Vista notifiche pending da inviare';
