-- Add specialized garden types (Orchard, OliveGrove, Vineyard)
-- Migration created: 2026-01-02

-- Drop existing constraint
ALTER TABLE gardens DROP CONSTRAINT IF EXISTS gardens_garden_type_check;

-- Add new constraint with specialized garden types
ALTER TABLE gardens ADD CONSTRAINT gardens_garden_type_check
CHECK (garden_type = ANY (ARRAY[
  'OpenField'::text,
  'Greenhouse'::text,
  'Tunnel'::text,
  'RaisedBed'::text,
  'Indoor'::text,
  'Hydroponic'::text,
  'Aquaponic'::text,
  'Aeroponic'::text,
  'NFT'::text,
  'DWC'::text,
  'EbbFlow'::text,
  'Drip'::text,
  'Wick'::text,
  'Kratky'::text,
  'Orchard'::text,
  'OliveGrove'::text,
  'Vineyard'::text
]));
