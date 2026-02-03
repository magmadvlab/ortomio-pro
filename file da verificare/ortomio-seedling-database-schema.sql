-- Schema Database per Sistema Semenzaio OrtoMio Pro
-- Da eseguire nel database Supabase OrtoMio

-- Tabella per i batch di semenzaio
CREATE TABLE IF NOT EXISTS seedling_batches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plant_name VARCHAR(255) NOT NULL,
    variety VARCHAR(255),
    source VARCHAR(50) CHECK (source IN ('home', 'nursery')) DEFAULT 'home',
    current_phase VARCHAR(50) CHECK (current_phase IN ('germination', 'nursing', 'hardening', 'ready', 'transplanted')) DEFAULT 'germination',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    initial_quantity INTEGER NOT NULL CHECK (initial_quantity > 0),
    current_quantity INTEGER NOT NULL CHECK (current_quantity >= 0),
    expected_transplant_date TIMESTAMP WITH TIME ZONE,
    actual_transplant_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella per le foto delle piantine
CREATE TABLE IF NOT EXISTS seedling_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_id UUID REFERENCES seedling_batches(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    growth_phase VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella per i task di giardinaggio (se non esiste già)
CREATE TABLE IF NOT EXISTS garden_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plant_name VARCHAR(255) NOT NULL,
    task_type VARCHAR(100) NOT NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_date TIMESTAMP WITH TIME ZONE,
    method VARCHAR(50),
    notes TEXT,
    status VARCHAR(50) CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')) DEFAULT 'planned',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella per le istanze di piante (se non esiste già)
CREATE TABLE IF NOT EXISTS plant_instances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plant_name VARCHAR(255) NOT NULL,
    variety VARCHAR(255),
    source VARCHAR(50) CHECK (source IN ('seed', 'transplant', 'seedling_batch')) DEFAULT 'seed',
    source_batch_id UUID REFERENCES seedling_batches(id) ON DELETE SET NULL,
    planting_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    harvest_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) CHECK (status IN ('growing', 'harvested', 'failed', 'removed')) DEFAULT 'growing',
    location_info JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_seedling_batches_phase ON seedling_batches(current_phase);
CREATE INDEX IF NOT EXISTS idx_seedling_batches_plant ON seedling_batches(plant_name);
CREATE INDEX IF NOT EXISTS idx_seedling_photos_batch ON seedling_photos(batch_id);
CREATE INDEX IF NOT EXISTS idx_garden_tasks_date ON garden_tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_plant_instances_source_batch ON plant_instances(source_batch_id);

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_seedling_batches_updated_at 
    BEFORE UPDATE ON seedling_batches 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_garden_tasks_updated_at 
    BEFORE UPDATE ON garden_tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plant_instances_updated_at 
    BEFORE UPDATE ON plant_instances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Dati di esempio per test
INSERT INTO seedling_batches (plant_name, variety, source, current_phase, initial_quantity, current_quantity, expected_transplant_date, notes) VALUES
('Pomodoro', 'San Marzano', 'home', 'nursing', 20, 18, NOW() + INTERVAL '15 days', 'Batch di test - crescita buona'),
('Basilico', 'Genovese', 'home', 'ready', 15, 14, NOW() + INTERVAL '3 days', 'Pronto per trapianto'),
('Peperoncino', 'Cayenne', 'home', 'germination', 10, 8, NOW() + INTERVAL '25 days', 'Germinazione in corso');

-- Conferma creazione
SELECT 'Schema semenzaio OrtoMio creato con successo!' as status;