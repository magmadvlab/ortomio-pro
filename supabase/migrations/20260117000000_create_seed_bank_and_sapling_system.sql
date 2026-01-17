-- Create seed_packets table
CREATE TABLE IF NOT EXISTS seed_packets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  variety_id TEXT NOT NULL,
  variety_name TEXT NOT NULL,
  species_name TEXT NOT NULL,
  purchase_date DATE NOT NULL,
  expiry_year INTEGER NOT NULL,
  is_open BOOLEAN DEFAULT FALSE,
  quantity_remaining TEXT CHECK (quantity_remaining IN ('High', 'Medium', 'Low', 'Empty')) DEFAULT 'High',
  source TEXT CHECK (source IN ('purchased', 'harvested')) DEFAULT 'purchased',
  supplier TEXT,
  notes TEXT,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  
  -- Optional detailed quantity tracking
  initial_quantity INTEGER,
  current_quantity INTEGER,
  quantity_display TEXT,
  quantity_min INTEGER,
  quantity_max INTEGER,
  quantity_exact INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seed_consumptions table
CREATE TABLE IF NOT EXISTS seed_consumptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seed_packet_id UUID NOT NULL REFERENCES seed_packets(id) ON DELETE CASCADE,
  plant_name TEXT NOT NULL,
  variety TEXT,
  quantity_used INTEGER NOT NULL,
  date DATE NOT NULL,
  purpose TEXT CHECK (purpose IN ('sowing', 'testing', 'sharing')) DEFAULT 'sowing',
  notes TEXT,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saplings table
CREATE TABLE IF NOT EXISTS saplings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_name TEXT NOT NULL,
  variety TEXT,
  source TEXT CHECK (source IN ('nursery', 'own')) DEFAULT 'nursery',
  status TEXT CHECK (status IN ('nursery', 'ready_to_plant', 'planted')) DEFAULT 'nursery',
  purchase_date DATE NOT NULL,
  quantity INTEGER DEFAULT 1,
  supplier TEXT,
  rootstock_type TEXT,
  planting_date DATE,
  location TEXT,
  notes TEXT,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sapling_batches table
CREATE TABLE IF NOT EXISTS sapling_batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_name TEXT NOT NULL,
  variety TEXT,
  source TEXT CHECK (source IN ('nursery', 'own')) DEFAULT 'nursery',
  total_quantity INTEGER NOT NULL,
  remaining_quantity INTEGER NOT NULL,
  purchase_date DATE NOT NULL,
  supplier TEXT,
  rootstock_type TEXT,
  price_per_unit DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  notes TEXT,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sapling_items table
CREATE TABLE IF NOT EXISTS sapling_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES sapling_batches(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('nursery', 'ready_to_plant', 'planted', 'dead')) DEFAULT 'nursery',
  planting_date DATE,
  location TEXT,
  health TEXT CHECK (health IN ('excellent', 'good', 'fair', 'poor')) DEFAULT 'good',
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sapling_plantings table
CREATE TABLE IF NOT EXISTS sapling_plantings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sapling_id UUID NOT NULL REFERENCES saplings(id) ON DELETE CASCADE,
  planting_date DATE NOT NULL,
  location TEXT NOT NULL,
  soil_type TEXT,
  spacing INTEGER, -- spacing in cm
  irrigation TEXT,
  fertilizer TEXT,
  notes TEXT,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seed_packets_garden_id ON seed_packets(garden_id);
CREATE INDEX IF NOT EXISTS idx_seed_packets_variety_name ON seed_packets(variety_name);
CREATE INDEX IF NOT EXISTS idx_seed_packets_expiry_year ON seed_packets(expiry_year);
CREATE INDEX IF NOT EXISTS idx_seed_packets_quantity_remaining ON seed_packets(quantity_remaining);

CREATE INDEX IF NOT EXISTS idx_seed_consumptions_garden_id ON seed_consumptions(garden_id);
CREATE INDEX IF NOT EXISTS idx_seed_consumptions_seed_packet_id ON seed_consumptions(seed_packet_id);
CREATE INDEX IF NOT EXISTS idx_seed_consumptions_date ON seed_consumptions(date);

CREATE INDEX IF NOT EXISTS idx_saplings_garden_id ON saplings(garden_id);
CREATE INDEX IF NOT EXISTS idx_saplings_status ON saplings(status);
CREATE INDEX IF NOT EXISTS idx_saplings_plant_name ON saplings(plant_name);

CREATE INDEX IF NOT EXISTS idx_sapling_batches_garden_id ON sapling_batches(garden_id);
CREATE INDEX IF NOT EXISTS idx_sapling_items_batch_id ON sapling_items(batch_id);
CREATE INDEX IF NOT EXISTS idx_sapling_plantings_garden_id ON sapling_plantings(garden_id);

-- Enable RLS
ALTER TABLE seed_packets ENABLE ROW LEVEL SECURITY;
ALTER TABLE seed_consumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saplings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sapling_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sapling_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sapling_plantings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own seed packets" ON seed_packets
  FOR SELECT USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own seed packets" ON seed_packets
  FOR INSERT WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own seed packets" ON seed_packets
  FOR UPDATE USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own seed packets" ON seed_packets
  FOR DELETE USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- Seed consumptions policies
CREATE POLICY "Users can view their own seed consumptions" ON seed_consumptions
  FOR SELECT USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own seed consumptions" ON seed_consumptions
  FOR INSERT WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- Saplings policies
CREATE POLICY "Users can view their own saplings" ON saplings
  FOR SELECT USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own saplings" ON saplings
  FOR INSERT WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own saplings" ON saplings
  FOR UPDATE USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own saplings" ON saplings
  FOR DELETE USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- Sapling batches policies
CREATE POLICY "Users can view their own sapling batches" ON sapling_batches
  FOR SELECT USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own sapling batches" ON sapling_batches
  FOR INSERT WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own sapling batches" ON sapling_batches
  FOR UPDATE USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own sapling batches" ON sapling_batches
  FOR DELETE USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- Sapling items policies (inherit from batch)
CREATE POLICY "Users can view sapling items from their batches" ON sapling_items
  FOR SELECT USING (
    batch_id IN (
      SELECT id FROM sapling_batches WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert sapling items to their batches" ON sapling_items
  FOR INSERT WITH CHECK (
    batch_id IN (
      SELECT id FROM sapling_batches WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update sapling items from their batches" ON sapling_items
  FOR UPDATE USING (
    batch_id IN (
      SELECT id FROM sapling_batches WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete sapling items from their batches" ON sapling_items
  FOR DELETE USING (
    batch_id IN (
      SELECT id FROM sapling_batches WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

-- Sapling plantings policies
CREATE POLICY "Users can view their own sapling plantings" ON sapling_plantings
  FOR SELECT USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own sapling plantings" ON sapling_plantings
  FOR INSERT WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_seed_packets_updated_at BEFORE UPDATE ON seed_packets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saplings_updated_at BEFORE UPDATE ON saplings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sapling_batches_updated_at BEFORE UPDATE ON sapling_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sapling_items_updated_at BEFORE UPDATE ON sapling_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();