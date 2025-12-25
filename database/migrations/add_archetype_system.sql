-- Sistema Archetipi 3 Livelli
-- Aggiunge tabelle per gestire archetipi, profili, aliases e colture ufficiali
-- Permette gestione nomi locali senza dataset infinito

-- ============================================
-- CROP ARCHETYPES (Archetipi principali)
-- ============================================
CREATE TABLE IF NOT EXISTS crop_archetypes (
  id TEXT PRIMARY KEY, -- 'A1', 'A2', ..., 'L1', 'L2', 'L3', 'L3_CITRUS', ecc.
  label TEXT NOT NULL, -- 'Solanacee da frutto'
  icon TEXT NOT NULL, -- '🍅'
  botanical_family TEXT NOT NULL, -- 'Solanaceae'
  default_profile_id UUID REFERENCES crop_profiles(id),
  parent_archetype_id TEXT REFERENCES crop_archetypes(id), -- Per sub-griglie (L1/L2/L3 sotto A12)
  examples TEXT[], -- Array di esempi per UX ['pomodoro', 'peperone', 'melanzana']
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_archetypes_parent ON crop_archetypes(parent_archetype_id);

-- ============================================
-- CROP PROFILES (Profili tecnici default)
-- ============================================
CREATE TABLE IF NOT EXISTS crop_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  archetype_id TEXT REFERENCES crop_archetypes(id),
  
  -- Profilo tecnico minimo
  root_zone_depth_cm_default INTEGER NOT NULL, -- Valore medio (es. 45 per range 30-60)
  root_zone_depth_cm_min INTEGER, -- Min del range
  root_zone_depth_cm_max INTEGER, -- Max del range
  
  -- Coefficienti colturali (KC) per fasi irrigazione
  kc_json JSONB NOT NULL, -- { "initial": 0.4, "development": 0.7, "mid": 1.0, "late": 0.8 }
  
  -- Stress depletion (p) - quanto stress accetti prima di irrigare
  stress_depletion_p_default DECIMAL(3, 2) DEFAULT 0.5, -- 0.0-1.0
  
  -- Piano nutrizionale base (NPK per 3 fasi)
  nutrient_plan_json JSONB, -- { "germination": {"N": 20, "P": 10, "K": 15}, "vegetative": {...}, "production": {...} }
  
  -- Note pratiche per irrigazione
  irrigation_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_archetype ON crop_profiles(archetype_id);

-- ============================================
-- CROP ALIASES (Dizionario nomi locali)
-- ============================================
CREATE TABLE IF NOT EXISTS crop_aliases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alias_text TEXT NOT NULL, -- 'burattino', 'carosello', ecc.
  archetype_id TEXT REFERENCES crop_archetypes(id) NOT NULL,
  
  -- Opzionale: geolocalizzazione per disambiguare
  region TEXT, -- 'Puglia', 'Sicilia', ecc.
  province TEXT, -- 'Bari', 'Palermo', ecc.
  
  -- Confidence e tracciamento
  confidence DECIMAL(3, 2) DEFAULT 1.0, -- 0.0-1.0 (1.0 = confermato dall'utente)
  created_by UUID REFERENCES auth.users(id), -- Utente che ha creato l'alias
  usage_count INTEGER DEFAULT 1, -- Quante volte è stato usato
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(alias_text, region, province) -- Evita duplicati per zona
);

CREATE INDEX idx_aliases_text ON crop_aliases(alias_text);
CREATE INDEX idx_aliases_archetype ON crop_aliases(archetype_id);
CREATE INDEX idx_aliases_region ON crop_aliases(region, province);

-- ============================================
-- OFFICIAL CROPS (Colture ufficiali - opzionale per UX)
-- ============================================
CREATE TABLE IF NOT EXISTS official_crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE, -- 'Pomodoro', 'Lattuga', ecc.
  archetype_id TEXT REFERENCES crop_archetypes(id) NOT NULL,
  profile_override_id UUID REFERENCES crop_profiles(id), -- Se vuoi profili migliori per colture specifiche
  scientific_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_official_crops_archetype ON official_crops(archetype_id);
CREATE INDEX idx_official_crops_name ON official_crops(name);

-- ============================================
-- MODIFICHE A GARDEN_TASKS
-- ============================================
ALTER TABLE garden_tasks 
ADD COLUMN IF NOT EXISTS archetype_id TEXT REFERENCES crop_archetypes(id),
ADD COLUMN IF NOT EXISTS root_zone_depth_cm INTEGER, -- Override root depth per questa istanza
ADD COLUMN IF NOT EXISTS irrigation_setup JSONB; -- { "method": "Drip", "flowRateLpm": 2.0, "areaSqm": 10, "sensorData": {...} }

CREATE INDEX idx_tasks_archetype ON garden_tasks(archetype_id);

COMMENT ON COLUMN garden_tasks.archetype_id IS 'Riferimento all archetipo della coltura (A1-A12, L1-L3, ecc.)';
COMMENT ON COLUMN garden_tasks.root_zone_depth_cm IS 'Override profondità radici in cm (se diversa dal default archetipo)';
COMMENT ON COLUMN garden_tasks.irrigation_setup IS 'Configurazione impianto irrigazione: metodo, portate, sensori';

-- ============================================
-- MODIFICHE A GARDENS (crop grouping)
-- ============================================
ALTER TABLE gardens
ADD COLUMN IF NOT EXISTS primary_crop JSONB;

COMMENT ON COLUMN gardens.primary_crop IS 'Coltura principale del garden (garden = gruppo colturale). Formato: { archetypeId: string, label: string, canonicalPlantName?: string, cropType?: string, createdFrom?: "user"|"suggested" }';

