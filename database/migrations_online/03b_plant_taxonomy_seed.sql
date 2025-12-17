-- ============================================
-- GRUPPO 3b: PLANT TAXONOMY SEED DATA
-- ============================================
-- Dati iniziali per sistema tassonomia
-- 
-- ORDINE: Dopo 03_plant_taxonomy.sql (creazione tabelle)
-- 
-- NOTA: Questo file può essere eseguito separatamente per popolare i dati
-- Usa ON CONFLICT per evitare duplicati

-- ============================================
-- PLANT_FAMILIES (Famiglie botaniche)
-- ============================================
INSERT INTO plant_families (id, name, common_names) VALUES
  ('Solanaceae', 'Solanaceae', ARRAY['Solanacee']),
  ('Cucurbitaceae', 'Cucurbitaceae', ARRAY['Cucurbitacee']),
  ('Brassicaceae', 'Brassicaceae', ARRAY['Brassicacee', 'Crocifere']),
  ('Fabaceae', 'Fabaceae', ARRAY['Leguminose', 'Fabacee']),
  ('Amaryllidaceae', 'Amaryllidaceae', ARRAY['Amaryllidacee']),
  ('Apiaceae', 'Apiaceae', ARRAY['Ombrellifere']),
  ('Asteraceae', 'Asteraceae', ARRAY['Composite', 'Asteracee']),
  ('Amaranthaceae', 'Amaranthaceae', ARRAY['Amarantacee']),
  ('Lamiaceae', 'Lamiaceae', ARRAY['Labiate']),
  ('Rosaceae', 'Rosaceae', ARRAY['Rosacee']),
  ('Rutaceae', 'Rutaceae', ARRAY['Rutacee'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CROP ARCHETYPES (12 Archetipi)
-- ============================================
-- NOTA: I dati seed per archetypes sono in seed_archetypes.sql
-- Questo file contiene solo le famiglie e taxonomy base

-- ============================================
-- PLANT_TAXONOMY (Piante canoniche)
-- ============================================
-- A1: Solanacee (frutti estivi)
INSERT INTO plant_taxonomy (plant_id, names, family_id, archetype_id, functional_category, tags) VALUES
  ('pomodoro', '{"it": "Pomodoro", "en": "Tomato"}'::jsonb, 'Solanaceae', 'A1', 'FRUIT', ARRAY['orto', 'estivo']),
  ('peperone', '{"it": "Peperone", "en": "Bell Pepper"}'::jsonb, 'Solanaceae', 'A1', 'FRUIT', ARRAY['orto', 'estivo']),
  ('peperoncino', '{"it": "Peperoncino", "en": "Chili Pepper"}'::jsonb, 'Solanaceae', 'A1', 'FRUIT', ARRAY['orto', 'estivo']),
  ('melanzana', '{"it": "Melanzana", "en": "Eggplant"}'::jsonb, 'Solanaceae', 'A1', 'FRUIT', ARRAY['orto', 'estivo']),
  ('patata', '{"it": "Patata", "en": "Potato"}'::jsonb, 'Solanaceae', 'A1', 'ROOT', ARRAY['orto', 'estivo'])
ON CONFLICT (plant_id) DO UPDATE SET
  names = EXCLUDED.names,
  tags = EXCLUDED.tags;

-- A2: Cucurbitacee (striscianti/rampicanti)
INSERT INTO plant_taxonomy (plant_id, names, family_id, archetype_id, functional_category, tags) VALUES
  ('zucchina', '{"it": "Zucchina", "en": "Zucchini"}'::jsonb, 'Cucurbitaceae', 'A2', 'FRUIT', ARRAY['orto', 'estivo']),
  ('cetriolo', '{"it": "Cetriolo", "en": "Cucumber"}'::jsonb, 'Cucurbitaceae', 'A2', 'FRUIT', ARRAY['orto', 'estivo']),
  ('carosello', '{"it": "Carosello", "it-puglia": "Barattiere", "en": "Carosello Melon"}'::jsonb, 'Cucurbitaceae', 'A2', 'FRUIT', ARRAY['orto', 'estivo', 'puglia']),
  ('zucca', '{"it": "Zucca", "en": "Pumpkin"}'::jsonb, 'Cucurbitaceae', 'A2', 'FRUIT', ARRAY['orto', 'estivo']),
  ('melone', '{"it": "Melone", "en": "Melon"}'::jsonb, 'Cucurbitaceae', 'A2', 'FRUIT', ARRAY['orto', 'estivo']),
  ('anguria', '{"it": "Anguria", "en": "Watermelon"}'::jsonb, 'Cucurbitaceae', 'A2', 'FRUIT', ARRAY['orto', 'estivo'])
ON CONFLICT (plant_id) DO UPDATE SET
  names = EXCLUDED.names,
  tags = EXCLUDED.tags;

-- A3: Cavoli & brassiche
INSERT INTO plant_taxonomy (plant_id, names, family_id, archetype_id, functional_category, tags) VALUES
  ('cavolfiore', '{"it": "Cavolfiore", "en": "Cauliflower"}'::jsonb, 'Brassicaceae', 'A3', 'LEAF', ARRAY['orto', 'invernale']),
  ('broccoli', '{"it": "Broccoli", "en": "Broccoli"}'::jsonb, 'Brassicaceae', 'A3', 'LEAF', ARRAY['orto', 'invernale']),
  ('cavolo cappuccio', '{"it": "Cavolo Cappuccio", "en": "Cabbage"}'::jsonb, 'Brassicaceae', 'A3', 'LEAF', ARRAY['orto', 'invernale']),
  ('rucola', '{"it": "Rucola", "en": "Arugula"}'::jsonb, 'Brassicaceae', 'A3', 'LEAF', ARRAY['orto', 'estivo'])
ON CONFLICT (plant_id) DO UPDATE SET
  names = EXCLUDED.names,
  tags = EXCLUDED.tags;

-- A4: Legumi
INSERT INTO plant_taxonomy (plant_id, names, family_id, archetype_id, functional_category, tags) VALUES
  ('fagiolo', '{"it": "Fagiolo", "en": "Bean"}'::jsonb, 'Fabaceae', 'A4', 'LEGUME', ARRAY['orto', 'estivo']),
  ('pisello', '{"it": "Pisello", "en": "Pea"}'::jsonb, 'Fabaceae', 'A4', 'LEGUME', ARRAY['orto', 'invernale']),
  ('fava', '{"it": "Fava", "en": "Broad Bean"}'::jsonb, 'Fabaceae', 'A4', 'LEGUME', ARRAY['orto', 'invernale']),
  ('cece', '{"it": "Cece", "en": "Chickpea"}'::jsonb, 'Fabaceae', 'A4', 'LEGUME', ARRAY['orto', 'estivo'])
ON CONFLICT (plant_id) DO UPDATE SET
  names = EXCLUDED.names,
  tags = EXCLUDED.tags;

-- A5: Allium
INSERT INTO plant_taxonomy (plant_id, names, family_id, archetype_id, functional_category, tags) VALUES
  ('cipolla', '{"it": "Cipolla", "en": "Onion"}'::jsonb, 'Amaryllidaceae', 'A5', 'ROOT', ARRAY['orto', 'estivo']),
  ('aglio', '{"it": "Aglio", "en": "Garlic"}'::jsonb, 'Amaryllidaceae', 'A5', 'ROOT', ARRAY['orto', 'invernale']),
  ('porro', '{"it": "Porro", "en": "Leek"}'::jsonb, 'Amaryllidaceae', 'A5', 'LEAF', ARRAY['orto', 'invernale'])
ON CONFLICT (plant_id) DO UPDATE SET
  names = EXCLUDED.names,
  tags = EXCLUDED.tags;

-- A6: Ombrellifere
INSERT INTO plant_taxonomy (plant_id, names, family_id, archetype_id, functional_category, tags) VALUES
  ('carota', '{"it": "Carota", "en": "Carrot"}'::jsonb, 'Apiaceae', 'A6', 'ROOT', ARRAY['orto', 'estivo']),
  ('finocchio', '{"it": "Finocchio", "en": "Fennel"}'::jsonb, 'Apiaceae', 'A6', 'LEAF', ARRAY['orto', 'estivo']),
  ('sedano', '{"it": "Sedano", "en": "Celery"}'::jsonb, 'Apiaceae', 'A6', 'LEAF', ARRAY['orto', 'estivo'])
ON CONFLICT (plant_id) DO UPDATE SET
  names = EXCLUDED.names,
  tags = EXCLUDED.tags;

-- A7: Insalate & cicorie
INSERT INTO plant_taxonomy (plant_id, names, family_id, archetype_id, functional_category, tags) VALUES
  ('lattuga', '{"it": "Lattuga", "en": "Lettuce"}'::jsonb, 'Asteraceae', 'A7', 'LEAF', ARRAY['orto', 'estivo']),
  ('cicoria', '{"it": "Cicoria", "en": "Chicory"}'::jsonb, 'Asteraceae', 'A7', 'LEAF', ARRAY['orto', 'estivo']),
  ('radicchio', '{"it": "Radicchio", "en": "Radicchio"}'::jsonb, 'Asteraceae', 'A7', 'LEAF', ARRAY['orto', 'invernale'])
ON CONFLICT (plant_id) DO UPDATE SET
  names = EXCLUDED.names,
  tags = EXCLUDED.tags;

-- A8: Bietole & spinaci
INSERT INTO plant_taxonomy (plant_id, names, family_id, archetype_id, functional_category, tags) VALUES
  ('bietola', '{"it": "Bietola", "en": "Chard"}'::jsonb, 'Amaranthaceae', 'A8', 'LEAF', ARRAY['orto', 'estivo']),
  ('spinacio', '{"it": "Spinacio", "en": "Spinach"}'::jsonb, 'Amaranthaceae', 'A8', 'LEAF', ARRAY['orto', 'invernale']),
  ('barbabietola', '{"it": "Barbabietola", "en": "Beetroot"}'::jsonb, 'Amaranthaceae', 'A8', 'ROOT', ARRAY['orto', 'estivo'])
ON CONFLICT (plant_id) DO UPDATE SET
  names = EXCLUDED.names,
  tags = EXCLUDED.tags;

-- A9: Aromatiche mediterranee
INSERT INTO plant_taxonomy (plant_id, names, family_id, archetype_id, functional_category, tags) VALUES
  ('basilico', '{"it": "Basilico", "en": "Basil"}'::jsonb, 'Lamiaceae', 'A9', 'AROMATIC', ARRAY['orto', 'estivo']),
  ('rosmarino', '{"it": "Rosmarino", "en": "Rosemary"}'::jsonb, 'Lamiaceae', 'A9', 'AROMATIC', ARRAY['orto', 'perenne']),
  ('salvia', '{"it": "Salvia", "en": "Sage"}'::jsonb, 'Lamiaceae', 'A9', 'AROMATIC', ARRAY['orto', 'perenne']),
  ('menta', '{"it": "Menta", "en": "Mint"}'::jsonb, 'Lamiaceae', 'A9', 'AROMATIC', ARRAY['orto', 'perenne']),
  ('timo', '{"it": "Timo", "en": "Thyme"}'::jsonb, 'Lamiaceae', 'A9', 'AROMATIC', ARRAY['orto', 'perenne'])
ON CONFLICT (plant_id) DO UPDATE SET
  names = EXCLUDED.names,
  tags = EXCLUDED.tags;

-- A10: Fruttiferi a nocciolo (drupacee)
INSERT INTO plant_taxonomy (plant_id, names, family_id, archetype_id, functional_category, tags) VALUES
  ('pesca', '{"it": "Pesca", "en": "Peach"}'::jsonb, 'Rosaceae', 'A10', 'FRUIT', ARRAY['frutteto']),
  ('albicocca', '{"it": "Albicocca", "en": "Apricot"}'::jsonb, 'Rosaceae', 'A10', 'FRUIT', ARRAY['frutteto']),
  ('ciliegia', '{"it": "Ciliegia", "en": "Cherry"}'::jsonb, 'Rosaceae', 'A10', 'FRUIT', ARRAY['frutteto']),
  ('susina', '{"it": "Susina", "en": "Plum"}'::jsonb, 'Rosaceae', 'A10', 'FRUIT', ARRAY['frutteto'])
ON CONFLICT (plant_id) DO UPDATE SET
  names = EXCLUDED.names,
  tags = EXCLUDED.tags;

-- A11: Fruttiferi a pomo (pomacee)
INSERT INTO plant_taxonomy (plant_id, names, family_id, archetype_id, functional_category, tags) VALUES
  ('mela', '{"it": "Mela", "en": "Apple"}'::jsonb, 'Rosaceae', 'A11', 'FRUIT', ARRAY['frutteto']),
  ('pera', '{"it": "Pera", "en": "Pear"}'::jsonb, 'Rosaceae', 'A11', 'FRUIT', ARRAY['frutteto']),
  ('cotogna', '{"it": "Cotogna", "en": "Quince"}'::jsonb, 'Rosaceae', 'A11', 'FRUIT', ARRAY['frutteto'])
ON CONFLICT (plant_id) DO UPDATE SET
  names = EXCLUDED.names,
  tags = EXCLUDED.tags;

-- A12: Agrumi
INSERT INTO plant_taxonomy (plant_id, names, family_id, archetype_id, functional_category, tags) VALUES
  ('limone', '{"it": "Limone", "en": "Lemon"}'::jsonb, 'Rutaceae', 'A12', 'FRUIT', ARRAY['frutteto']),
  ('arancia', '{"it": "Arancia", "en": "Orange"}'::jsonb, 'Rutaceae', 'A12', 'FRUIT', ARRAY['frutteto']),
  ('mandarino', '{"it": "Mandarino", "en": "Mandarin"}'::jsonb, 'Rutaceae', 'A12', 'FRUIT', ARRAY['frutteto'])
ON CONFLICT (plant_id) DO UPDATE SET
  names = EXCLUDED.names,
  tags = EXCLUDED.tags;

-- ============================================
-- PLANT_SYNONYMS (Sinonimi dialettali)
-- ============================================
-- NOTA: I sinonimi sono gestiti dinamicamente dall'app
-- Qui inseriamo solo alcuni esempi comuni

-- Sinonimi per pomodoro
INSERT INTO plant_synonyms (synonym, normalized_synonym, plant_id, locale, confidence, source) VALUES
  ('pummador', 'pummador', 'pomodoro', 'it', 0.9, 'system'),
  ('pomodoro', 'pomodoro', 'pomodoro', 'it', 1.0, 'system')
ON CONFLICT (synonym, locale) DO NOTHING;

-- Sinonimi per carosello/barattiere
INSERT INTO plant_synonyms (synonym, normalized_synonym, plant_id, locale, confidence, source) VALUES
  ('barattiere', 'barattiere', 'carosello', 'it-puglia', 1.0, 'system'),
  ('carosello', 'carosello', 'carosello', 'it', 1.0, 'system'),
  ('cianciuffo', 'cianciuffo', 'carosello', 'it-puglia', 0.9, 'system'),
  ('tondo di fasano', 'tondo di fasano', 'carosello', 'it-puglia', 0.9, 'system')
ON CONFLICT (synonym, locale) DO NOTHING;

