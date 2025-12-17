-- Migration: Aggiungi colonne per configurazioni frutteto/oliveto/vigneto
-- Data: 2024

-- Aggiungi colonne JSONB per configurazioni
ALTER TABLE gardens 
ADD COLUMN IF NOT EXISTS orchard_config JSONB,
ADD COLUMN IF NOT EXISTS olive_grove_config JSONB,
ADD COLUMN IF NOT EXISTS vineyard_config JSONB;

-- Crea indici GIN per ricerca efficiente su JSONB
CREATE INDEX IF NOT EXISTS idx_gardens_orchard_config ON gardens USING GIN (orchard_config);
CREATE INDEX IF NOT EXISTS idx_gardens_olive_grove_config ON gardens USING GIN (olive_grove_config);
CREATE INDEX IF NOT EXISTS idx_gardens_vineyard_config ON gardens USING GIN (vineyard_config);

-- Commenti per documentazione
COMMENT ON COLUMN gardens.orchard_config IS 'Configurazione frutteto: categoria, data impianto, numero alberi, varietà';
COMMENT ON COLUMN gardens.olive_grove_config IS 'Configurazione oliveto: tipo (OIL/TABLE/DUAL), data impianto, numero alberi, varietà';
COMMENT ON COLUMN gardens.vineyard_config IS 'Configurazione vigneto: tipo (WINE/TABLE), sistema allevamento, data impianto, numero viti, varietà';

