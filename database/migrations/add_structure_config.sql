-- Aggiunge campo structure_config per memorizzare dettagli strutture
-- Permette di salvare configurazione completa di vasi, cassoni, vasche, letti, campo aperto
-- per permettere modifiche successive e tracciabilità completa

ALTER TABLE gardens 
ADD COLUMN IF NOT EXISTS structure_config JSONB;

COMMENT ON COLUMN gardens.structure_config IS 'Configurazione dettagliata strutture: vasi, cassoni, vasche, letti rialzati, campo aperto. Formato: { openField?: { size, unit }, pots?: [{ count, diameter }], beds?: [{ count, length, width, height, holes }], containers?: [{ count, length, width, height, holes }], tanks?: [{ count, length, width, height, holes }] }';


