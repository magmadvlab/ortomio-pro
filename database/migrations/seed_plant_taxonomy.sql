-- Seed dati iniziali per sistema tassonomia piante
-- Popola plant_families, plant_taxonomy, plant_synonyms con dati iniziali

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
-- PLANT_TAXONOMY (Piante canoniche)
-- ============================================

-- A1: Solanacee (frutti estivi)
INSERT INTO plant_taxonomy (plant_id, names, family_id, archetype_id, functional_category, tags) VALUES
  ('pomodoro', '{"it": "Pomodoro", "en": "Tomato"}'::jsonb, 'Solanaceae', 'A1', 'FRUIT', ARRAY['orto', 'estivo']),
  ('peperone', '{"it": "Peperone", "en": "Bell Pepper"}'::jsonb, 'Solanaceae', 'A1', 'FRUIT', ARRAY['orto', 'estivo']),
  ('peperoncino', '{"it": "Peperoncino", "en": "Chili Pepper"}'::jsonb, 'Solanaceae', 'A1', 'FRUIT', ARRAY['orto', 'estivo']),
  ('melanzana', '{"it": "Melanzana", "en": "Eggplant"}'::jsonb, 'Solanaceae', 'A1', 'FRUIT', ARRAY['orto', 'estivo']),
  ('patata', '{"it": "Patata", "en": "Potato"}'::jsonb, 'Solanaceae', 'A1', 'ROOT', ARRAY['orto', 'estivo'])
ON CONFLICT (plant_id) DO NOTHING;

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
  ('cavolo nero', '{"it": "Cavolo Nero", "en": "Black Cabbage"}'::jsonb, 'Brassicaceae', 'A3', 'LEAF', ARRAY['orto', 'invernale']),
  ('rucola', '{"it": "Rucola", "en": "Arugula"}'::jsonb, 'Brassicaceae', 'A3', 'LEAF', ARRAY['orto', 'primaverile']),
  ('ravanello', '{"it": "Ravanello", "en": "Radish"}'::jsonb, 'Brassicaceae', 'A3', 'ROOT', ARRAY['orto', 'primaverile'])
ON CONFLICT (plant_id) DO NOTHING;

-- A4: Legumi
INSERT INTO plant_taxonomy (plant_id, names, family_id, archetype_id, functional_category, tags) VALUES
  ('fagiolo', '{"it": "Fagiolo", "en": "Bean"}'::jsonb, 'Fabaceae', 'A4', 'LEGUME', ARRAY['orto', 'estivo']),
  ('fagiolino', '{"it": "Fagiolino", "en": "Green Bean"}'::jsonb, 'Fabaceae', 'A4', 'LEGUME', ARRAY['orto', 'estivo']),
  ('pisello', '{"it": "Pisello", "en": "Pea"}'::jsonb, 'Fabaceae', 'A4', 'LEGUME', ARRAY['orto', 'primaverile']),
  ('fava', '{"it": "Fava", "en": "Fava Bean"}'::jsonb, 'Fabaceae', 'A4', 'LEGUME', ARRAY['orto', 'invernale']),
  ('cece', '{"it": "Cece", "en": "Chickpea"}'::jsonb, 'Fabaceae', 'A4', 'LEGUME', ARRAY['orto', 'estivo'])
ON CONFLICT (plant_id) DO NOTHING;

-- A5: Allium
INSERT INTO plant_taxonomy (plant_id, names, family_id, archetype_id, functional_category, tags) VALUES
  ('cipolla', '{"it": "Cipolla", "en": "Onion"}'::jsonb, 'Amaryllidaceae', 'A5', 'ROOT', ARRAY['orto', 'primaverile']),
  ('aglio', '{"it": "Aglio", "en": "Garlic"}'::jsonb, 'Amaryllidaceae', 'A5', 'ROOT', ARRAY['orto', 'invernale']),
  ('porro', '{"it": "Porro", "en": "Leek"}'::jsonb, 'Amaryllidaceae', 'A5', 'ROOT', ARRAY['orto', 'invernale']),
  ('scalogno', '{"it": "Scalogno", "en": "Shallot"}'::jsonb, 'Amaryllidaceae', 'A5', 'ROOT', ARRAY['orto', 'primaverile'])
ON CONFLICT (plant_id) DO NOTHING;

-- A6: Ombrellifere
INSERT INTO plant_taxonomy (plant_id, names, family_id, archetype_id, functional_category, tags) VALUES
  ('carota', '{"it": "Carota", "en": "Carrot"}'::jsonb, 'Apiaceae', 'A6', 'ROOT', ARRAY['orto', 'primaverile']),
  ('finocchio', '{"it": "Finocchio", "en": "Fennel"}'::jsonb, 'Apiaceae', 'A6', 'ROOT', ARRAY['orto', 'estivo']),
  ('sedano', '{"it": "Sedano", "en": "Celery"}'::jsonb, 'Apiaceae', 'A6', 'LEAF', ARRAY['orto', 'estivo']),
  ('prezzemolo', '{"it": "Prezzemolo", "en": "Parsley"}'::jsonb, 'Apiaceae', 'A6', 'AROMATIC', ARRAY['orto', 'primaverile'])
ON CONFLICT (plant_id) DO NOTHING;

-- A7: Insalate & cicorie
INSERT INTO plant_taxonomy (plant_id, names, family_id, archetype_id, functional_category, tags) VALUES
  ('lattuga', '{"it": "Lattuga", "en": "Lettuce"}'::jsonb, 'Asteraceae', 'A7', 'LEAF', ARRAY['orto', 'primaverile']),
  ('cicoria', '{"it": "Cicoria", "en": "Chicory"}'::jsonb, 'Asteraceae', 'A7', 'LEAF', ARRAY['orto', 'invernale']),
  ('radicchio', '{"it": "Radicchio", "en": "Radicchio"}'::jsonb, 'Asteraceae', 'A7', 'LEAF', ARRAY['orto', 'invernale']),
  ('carciofo', '{"it": "Carciofo", "en": "Artichoke"}'::jsonb, 'Asteraceae', 'A7', 'LEAF', ARRAY['orto', 'invernale']),
  ('indivia', '{"it": "Indivia", "en": "Endive"}'::jsonb, 'Asteraceae', 'A7', 'LEAF', ARRAY['orto', 'invernale'])
ON CONFLICT (plant_id) DO NOTHING;

-- A8: Bietole & spinaci
INSERT INTO plant_taxonomy (plant_id, names, family_id, archetype_id, functional_category, tags) VALUES
  ('bietola', '{"it": "Bietola", "en": "Chard"}'::jsonb, 'Amaranthaceae', 'A8', 'LEAF', ARRAY['orto', 'estivo']),
  ('spinacio', '{"it": "Spinacio", "en": "Spinach"}'::jsonb, 'Amaranthaceae', 'A8', 'LEAF', ARRAY['orto', 'invernale']),
  ('barbabietola', '{"it": "Barbabietola", "en": "Beetroot"}'::jsonb, 'Amaranthaceae', 'A8', 'ROOT', ARRAY['orto', 'estivo'])
ON CONFLICT (plant_id) DO NOTHING;

-- A9: Aromatiche mediterranee
INSERT INTO plant_taxonomy (plant_id, names, family_id, archetype_id, functional_category, tags) VALUES
  ('basilico', '{"it": "Basilico", "en": "Basil"}'::jsonb, 'Lamiaceae', 'A9', 'AROMATIC', ARRAY['orto', 'estivo']),
  ('rosmarino', '{"it": "Rosmarino", "en": "Rosemary"}'::jsonb, 'Lamiaceae', 'A9', 'AROMATIC', ARRAY['orto', 'perenne']),
  ('salvia', '{"it": "Salvia", "en": "Sage"}'::jsonb, 'Lamiaceae', 'A9', 'AROMATIC', ARRAY['orto', 'perenne']),
  ('menta', '{"it": "Menta", "en": "Mint"}'::jsonb, 'Lamiaceae', 'A9', 'AROMATIC', ARRAY['orto', 'perenne']),
  ('timo', '{"it": "Timo", "en": "Thyme"}'::jsonb, 'Lamiaceae', 'A9', 'AROMATIC', ARRAY['orto', 'perenne']),
  ('origano', '{"it": "Origano", "en": "Oregano"}'::jsonb, 'Lamiaceae', 'A9', 'AROMATIC', ARRAY['orto', 'perenne']),
  ('maggiorena', '{"it": "Maggiorena", "en": "Marjoram"}'::jsonb, 'Lamiaceae', 'A9', 'AROMATIC', ARRAY['orto', 'estivo'])
ON CONFLICT (plant_id) DO NOTHING;

-- A10: Fruttiferi a nocciolo (drupacee)
INSERT INTO plant_taxonomy (plant_id, names, family_id, archetype_id, functional_category, tags) VALUES
  ('pesca', '{"it": "Pesca", "en": "Peach"}'::jsonb, 'Rosaceae', 'A10', 'SPECIALIZED', ARRAY['frutteto']),
  ('albicocca', '{"it": "Albicocca", "en": "Apricot"}'::jsonb, 'Rosaceae', 'A10', 'SPECIALIZED', ARRAY['frutteto']),
  ('ciliegia', '{"it": "Ciliegia", "en": "Cherry"}'::jsonb, 'Rosaceae', 'A10', 'SPECIALIZED', ARRAY['frutteto']),
  ('susina', '{"it": "Susina", "en": "Plum"}'::jsonb, 'Rosaceae', 'A10', 'SPECIALIZED', ARRAY['frutteto'])
ON CONFLICT (plant_id) DO NOTHING;

-- A11: Fruttiferi a pomo (pomacee)
INSERT INTO plant_taxonomy (plant_id, names, family_id, archetype_id, functional_category, tags) VALUES
  ('mela', '{"it": "Mela", "en": "Apple"}'::jsonb, 'Rosaceae', 'A11', 'SPECIALIZED', ARRAY['frutteto']),
  ('pera', '{"it": "Pera", "en": "Pear"}'::jsonb, 'Rosaceae', 'A11', 'SPECIALIZED', ARRAY['frutteto']),
  ('cotogna', '{"it": "Cotogna", "en": "Quince"}'::jsonb, 'Rosaceae', 'A11', 'SPECIALIZED', ARRAY['frutteto'])
ON CONFLICT (plant_id) DO NOTHING;

-- A12: Agrumi
INSERT INTO plant_taxonomy (plant_id, names, family_id, archetype_id, functional_category, tags) VALUES
  ('limone', '{"it": "Limone", "en": "Lemon"}'::jsonb, 'Rutaceae', 'A12', 'SPECIALIZED', ARRAY['frutteto']),
  ('arancio', '{"it": "Arancio", "en": "Orange"}'::jsonb, 'Rutaceae', 'A12', 'SPECIALIZED', ARRAY['frutteto']),
  ('mandarino', '{"it": "Mandarino", "en": "Mandarin"}'::jsonb, 'Rutaceae', 'A12', 'SPECIALIZED', ARRAY['frutteto'])
ON CONFLICT (plant_id) DO NOTHING;

-- ============================================
-- PLANT_SYNONYMS (Sinonimi dialettali)
-- IMPORTANTE: "barattiere" mappa a "carosello" (NON a pomodoro!)
-- ============================================

-- Pomodoro - varianti dialettali
INSERT INTO plant_synonyms (synonym, normalized_synonym, plant_id, locale, confidence, source) VALUES
  ('pummador', 'pummador', 'pomodoro', 'it-campania', 0.9, 'system'),
  ('p''mdòr', 'p m d o r', 'pomodoro', 'it', 0.8, 'system'),
  ('pomodori', 'pomodori', 'pomodoro', 'it', 1.0, 'system'),
  ('pomidoro', 'pomidoro', 'pomodoro', 'it', 0.9, 'system')
ON CONFLICT (synonym, locale) DO NOTHING;

-- Zucchina - varianti
INSERT INTO plant_synonyms (synonym, normalized_synonym, plant_id, locale, confidence, source) VALUES
  ('zucchino', 'zucchino', 'zucchina', 'it', 1.0, 'system'),
  ('cucuzza', 'cucuzza', 'zucchina', 'it-sicilia', 0.9, 'system'),
  ('cocozza', 'cocozza', 'zucchina', 'it-campania', 0.9, 'system'),
  ('zucchine', 'zucchine', 'zucchina', 'it', 1.0, 'system')
ON CONFLICT (synonym, locale) DO NOTHING;

-- Carosello/Barattiere - IMPORTANTE: barattiere mappa a carosello!
INSERT INTO plant_synonyms (synonym, normalized_synonym, plant_id, locale, confidence, source) VALUES
  ('barattiere', 'barattiere', 'carosello', 'it-puglia', 1.0, 'system'),
  ('carosello', 'carosello', 'carosello', 'it', 1.0, 'system'),
  ('tondo di fasano', 'tondo di fasano', 'carosello', 'it-puglia', 0.9, 'system'),
  ('cianciuffo', 'cianciuffo', 'carosello', 'it-puglia', 0.9, 'system'),
  ('carosello barattiere', 'carosello barattiere', 'carosello', 'it', 1.0, 'system')
ON CONFLICT (synonym, locale) DO NOTHING;

-- Altri sinonimi comuni (plurale)
INSERT INTO plant_synonyms (synonym, normalized_synonym, plant_id, locale, confidence, source) VALUES
  ('peperoni', 'peperoni', 'peperone', 'it', 1.0, 'system'),
  ('melanzane', 'melanzane', 'melanzana', 'it', 1.0, 'system'),
  ('patate', 'patate', 'patata', 'it', 1.0, 'system'),
  ('cetrioli', 'cetrioli', 'cetriolo', 'it', 1.0, 'system'),
  ('zucche', 'zucche', 'zucca', 'it', 1.0, 'system'),
  ('cavoli', 'cavoli', 'cavolfiore', 'it', 0.8, 'system'),
  ('fagioli', 'fagioli', 'fagiolo', 'it', 1.0, 'system'),
  ('piselli', 'piselli', 'pisello', 'it', 1.0, 'system'),
  ('fave', 'fave', 'fava', 'it', 1.0, 'system'),
  ('ceci', 'ceci', 'cece', 'it', 1.0, 'system'),
  ('cipolle', 'cipolle', 'cipolla', 'it', 1.0, 'system'),
  ('agli', 'agli', 'aglio', 'it', 1.0, 'system'),
  ('porri', 'porri', 'porro', 'it', 1.0, 'system'),
  ('carote', 'carote', 'carota', 'it', 1.0, 'system'),
  ('finocchi', 'finocchi', 'finocchio', 'it', 1.0, 'system'),
  ('lattughe', 'lattughe', 'lattuga', 'it', 1.0, 'system'),
  ('bietole', 'bietole', 'bietola', 'it', 1.0, 'system'),
  ('spinaci', 'spinaci', 'spinacio', 'it', 1.0, 'system')
ON CONFLICT (synonym, locale) DO NOTHING;

