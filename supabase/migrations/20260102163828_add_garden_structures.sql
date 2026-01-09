-- ============================================
-- ADD GARDEN STRUCTURES COLUMNS
-- ============================================
-- Aggiunge colonne per strutture aggiuntive (vasi, letti, cassoni, sistemi avanzati)
-- alla tabella gardens per supportare orti multi-struttura

-- Vasi
ALTER TABLE gardens ADD COLUMN IF NOT EXISTS pot_count INTEGER;
ALTER TABLE gardens ADD COLUMN IF NOT EXISTS pot_diameter DECIMAL(5,2);

COMMENT ON COLUMN gardens.pot_count IS 'Numero totale di vasi nell''orto';
COMMENT ON COLUMN gardens.pot_diameter IS 'Diametro medio dei vasi in cm';

-- Letti Rialzati (Raised Beds)
ALTER TABLE gardens ADD COLUMN IF NOT EXISTS bed_count INTEGER;
ALTER TABLE gardens ADD COLUMN IF NOT EXISTS bed_length DECIMAL(5,2);
ALTER TABLE gardens ADD COLUMN IF NOT EXISTS bed_width DECIMAL(5,2);

COMMENT ON COLUMN gardens.bed_count IS 'Numero di letti rialzati';
COMMENT ON COLUMN gardens.bed_length IS 'Lunghezza media dei letti in metri';
COMMENT ON COLUMN gardens.bed_width IS 'Larghezza media dei letti in metri';

-- Cassoni/Contenitori
ALTER TABLE gardens ADD COLUMN IF NOT EXISTS container_count INTEGER;
ALTER TABLE gardens ADD COLUMN IF NOT EXISTS container_length DECIMAL(5,2);
ALTER TABLE gardens ADD COLUMN IF NOT EXISTS container_width DECIMAL(5,2);
ALTER TABLE gardens ADD COLUMN IF NOT EXISTS container_height DECIMAL(5,2);

COMMENT ON COLUMN gardens.container_count IS 'Numero di cassoni/vasche';
COMMENT ON COLUMN gardens.container_length IS 'Lunghezza media cassoni in metri';
COMMENT ON COLUMN gardens.container_width IS 'Larghezza media cassoni in metri';
COMMENT ON COLUMN gardens.container_height IS 'Altezza media cassoni in metri';

-- Sistemi Idroponici (già esistente come JSONB, ma verifichiamo)
ALTER TABLE gardens ADD COLUMN IF NOT EXISTS hydroponic_config JSONB;

COMMENT ON COLUMN gardens.hydroponic_config IS 'Configurazione sistema idroponico: { systemType, nftChannelCount, dwcBucketCount, ... }';

-- Sistemi Acquaponici
ALTER TABLE gardens ADD COLUMN IF NOT EXISTS aquaponic_config JSONB;

COMMENT ON COLUMN gardens.aquaponic_config IS 'Configurazione sistema acquaponico: { systemType, fishTankVolume, bedCount, ... }';

-- Sistemi Aeroponici
ALTER TABLE gardens ADD COLUMN IF NOT EXISTS aeroponic_config JSONB;

COMMENT ON COLUMN gardens.aeroponic_config IS 'Configurazione sistema aeroponico: { systemType, chamberCount, nozzleCount, ... }';

-- Configurazione filari (per Campo Aperto/Serra)
ALTER TABLE gardens ADD COLUMN IF NOT EXISTS row_config JSONB;

COMMENT ON COLUMN gardens.row_config IS 'Configurazione filari: { numberOfRows, lengthMeters, widthMeters, defaultRowSpacingCm }';

-- Configurazione stagionale (per Serra)
ALTER TABLE gardens ADD COLUMN IF NOT EXISTS seasonal_config JSONB;

COMMENT ON COLUMN gardens.seasonal_config IS 'Configurazione stagionale serra: { isSeasonal, activeMonths: [1,2,3,...] }';
