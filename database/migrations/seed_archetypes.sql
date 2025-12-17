-- Seed dati iniziali per sistema archetipi
-- Popola 12 archetipi principali + sub-griglie + profili default

-- Prima creiamo i profili (necessari per foreign key in archetypes)
-- Poi creiamo gli archetipi
-- Poi aggiorniamo i profili con archetype_id

-- ============================================
-- PROFILI DEFAULT (creati prima degli archetipi)
-- ============================================

-- A1: Solanacee da frutto
INSERT INTO crop_profiles (id, root_zone_depth_cm_default, root_zone_depth_cm_min, root_zone_depth_cm_max, kc_json, stress_depletion_p_default, nutrient_plan_json, irrigation_notes)
VALUES (
  'a1-profile',
  45, 30, 60,
  '{"initial": 0.4, "development": 0.7, "mid": 1.0, "late": 0.8}'::jsonb,
  0.5,
  '{"germination": {"N": 20, "P": 10, "K": 15}, "vegetative": {"N": 30, "P": 15, "K": 25}, "production": {"N": 25, "P": 20, "K": 30}}'::jsonb,
  'Sensibili a stress in fioritura/allegagione. Irrigazione regolare durante produzione.'
) ON CONFLICT DO NOTHING;

-- A2: Cucurbitacee fresche
INSERT INTO crop_profiles (id, root_zone_depth_cm_default, root_zone_depth_cm_min, root_zone_depth_cm_max, kc_json, stress_depletion_p_default, nutrient_plan_json, irrigation_notes)
VALUES (
  'a2-profile',
  35, 20, 50,
  '{"initial": 0.5, "development": 0.7, "mid": 1.0, "late": 0.9}'::jsonb,
  0.5,
  '{"germination": {"N": 15, "P": 10, "K": 15}, "vegetative": {"N": 25, "P": 15, "K": 20}, "production": {"N": 20, "P": 15, "K": 25}}'::jsonb,
  'Richiedono regolarità irrigazione (no sbalzi). Frequenza > dose.'
) ON CONFLICT DO NOTHING;

-- A3: Cucurbitacee grosse
INSERT INTO crop_profiles (id, root_zone_depth_cm_default, root_zone_depth_cm_min, root_zone_depth_cm_max, kc_json, stress_depletion_p_default, nutrient_plan_json, irrigation_notes)
VALUES (
  'a3-profile',
  55, 30, 80,
  '{"initial": 0.5, "development": 0.7, "mid": 1.1, "late": 0.9}'::jsonb,
  0.5,
  '{"germination": {"N": 15, "P": 10, "K": 15}, "vegetative": {"N": 30, "P": 15, "K": 25}, "production": {"N": 25, "P": 20, "K": 35}}'::jsonb,
  'Volumi alti, attenzione stress in accrescimento. Irrigazione abbondante ma controllata.'
) ON CONFLICT DO NOTHING;

-- A4: Insalate (foglia tenera)
INSERT INTO crop_profiles (id, root_zone_depth_cm_default, root_zone_depth_cm_min, root_zone_depth_cm_max, kc_json, stress_depletion_p_default, nutrient_plan_json, irrigation_notes)
VALUES (
  'a4-profile',
  18, 10, 25,
  '{"initial": 0.6, "development": 0.8, "mid": 1.0, "late": 0.9}'::jsonb,
  0.4,
  '{"germination": {"N": 20, "P": 10, "K": 10}, "vegetative": {"N": 30, "P": 15, "K": 20}, "production": {"N": 25, "P": 15, "K": 20}}'::jsonb,
  'Radici superficiali: frequenza > dose. Irrigazione leggera e frequente.'
) ON CONFLICT DO NOTHING;

-- A5: Foglie robuste
INSERT INTO crop_profiles (id, root_zone_depth_cm_default, root_zone_depth_cm_min, root_zone_depth_cm_max, kc_json, stress_depletion_p_default, nutrient_plan_json, irrigation_notes)
VALUES (
  'a5-profile',
  30, 20, 40,
  '{"initial": 0.5, "development": 0.7, "mid": 0.9, "late": 0.8}'::jsonb,
  0.5,
  '{"germination": {"N": 20, "P": 10, "K": 15}, "vegetative": {"N": 30, "P": 15, "K": 25}, "production": {"N": 25, "P": 15, "K": 25}}'::jsonb,
  'Più tolleranti di insalate. Irrigazione moderata.'
) ON CONFLICT DO NOTHING;

-- A6: Brassiche (cavoli)
INSERT INTO crop_profiles (id, root_zone_depth_cm_default, root_zone_depth_cm_min, root_zone_depth_cm_max, kc_json, stress_depletion_p_default, nutrient_plan_json, irrigation_notes)
VALUES (
  'a6-profile',
  45, 30, 60,
  '{"initial": 0.5, "development": 0.7, "mid": 1.0, "late": 0.9}'::jsonb,
  0.5,
  '{"germination": {"N": 25, "P": 15, "K": 20}, "vegetative": {"N": 35, "P": 20, "K": 30}, "production": {"N": 30, "P": 20, "K": 30}}'::jsonb,
  'Soffrono stress idrico in fase di "testa". Irrigazione costante durante sviluppo.'
) ON CONFLICT DO NOTHING;

-- A7: Bulbi
INSERT INTO crop_profiles (id, root_zone_depth_cm_default, root_zone_depth_cm_min, root_zone_depth_cm_max, kc_json, stress_depletion_p_default, nutrient_plan_json, irrigation_notes)
VALUES (
  'a7-profile',
  30, 20, 40,
  '{"initial": 0.5, "development": 0.7, "mid": 0.9, "late": 0.7}'::jsonb,
  0.5,
  '{"germination": {"N": 20, "P": 15, "K": 15}, "vegetative": {"N": 25, "P": 20, "K": 20}, "production": {"N": 20, "P": 20, "K": 25}}'::jsonb,
  'Attenzione eccesso acqua (marciumi). Terreno ben drenato essenziale.'
) ON CONFLICT DO NOTHING;

-- A8: Radici & tuberi
INSERT INTO crop_profiles (id, root_zone_depth_cm_default, root_zone_depth_cm_min, root_zone_depth_cm_max, kc_json, stress_depletion_p_default, nutrient_plan_json, irrigation_notes)
VALUES (
  'a8-profile',
  40, 20, 60,
  '{"initial": 0.5, "development": 0.7, "mid": 1.0, "late": 0.8}'::jsonb,
  0.5,
  '{"germination": {"N": 15, "P": 15, "K": 20}, "vegetative": {"N": 25, "P": 20, "K": 30}, "production": {"N": 20, "P": 25, "K": 35}}'::jsonb,
  'Stress = deformazioni/calibro. Patata più sensibile. Irrigazione regolare durante sviluppo radici.'
) ON CONFLICT DO NOTHING;

-- A9: Legumi
INSERT INTO crop_profiles (id, root_zone_depth_cm_default, root_zone_depth_cm_min, root_zone_depth_cm_max, kc_json, stress_depletion_p_default, nutrient_plan_json, irrigation_notes)
VALUES (
  'a9-profile',
  40, 20, 60,
  '{"initial": 0.5, "development": 0.7, "mid": 1.0, "late": 0.8}'::jsonb,
  0.5,
  '{"germination": {"N": 5, "P": 15, "K": 15}, "vegetative": {"N": 10, "P": 20, "K": 25}, "production": {"N": 5, "P": 25, "K": 30}}'::jsonb,
  'Picchi acqua in fioritura/allegagione. Azoto limitato (fissano N).'
) ON CONFLICT DO NOTHING;

-- A10: Aromatiche
INSERT INTO crop_profiles (id, root_zone_depth_cm_default, root_zone_depth_cm_min, root_zone_depth_cm_max, kc_json, stress_depletion_p_default, nutrient_plan_json, irrigation_notes)
VALUES (
  'a10-profile',
  25, 10, 40,
  '{"initial": 0.5, "development": 0.6, "mid": 0.7, "late": 0.6}'::jsonb,
  0.6,
  '{"germination": {"N": 15, "P": 10, "K": 10}, "vegetative": {"N": 20, "P": 15, "K": 15}, "production": {"N": 15, "P": 15, "K": 15}}'::jsonb,
  'Spesso meglio "poco ma giusto". Molte tollerano secco. Evitare eccessi.'
) ON CONFLICT DO NOTHING;

-- A11: Piccoli frutti
INSERT INTO crop_profiles (id, root_zone_depth_cm_default, root_zone_depth_cm_min, root_zone_depth_cm_max, kc_json, stress_depletion_p_default, nutrient_plan_json, irrigation_notes)
VALUES (
  'a11-profile',
  40, 20, 60,
  '{"initial": 0.5, "development": 0.7, "mid": 0.9, "late": 0.8}'::jsonb,
  0.5,
  '{"germination": {"N": 20, "P": 15, "K": 20}, "vegetative": {"N": 30, "P": 20, "K": 30}, "production": {"N": 25, "P": 25, "K": 35}}'::jsonb,
  'Fragola molto sensibile. Mirtillo richiede gestione specifica suolo (acidofila).'
) ON CONFLICT DO NOTHING;

-- A12: Colture legnose (default, poi override con L1/L2/L3)
INSERT INTO crop_profiles (id, root_zone_depth_cm_default, root_zone_depth_cm_min, root_zone_depth_cm_max, kc_json, stress_depletion_p_default, nutrient_plan_json, irrigation_notes)
VALUES (
  'a12-profile',
  80, 50, 150,
  '{"initial": 0.4, "development": 0.6, "mid": 0.8, "late": 0.7}'::jsonb,
  0.6,
  '{"germination": {"N": 20, "P": 15, "K": 20}, "vegetative": {"N": 30, "P": 20, "K": 30}, "production": {"N": 25, "P": 25, "K": 35}}'::jsonb,
  'Profondità radici varia con età/portinnesto. Irrigazione strategica.'
) ON CONFLICT DO NOTHING;

-- L1: Vite
INSERT INTO crop_profiles (id, root_zone_depth_cm_default, root_zone_depth_cm_min, root_zone_depth_cm_max, kc_json, stress_depletion_p_default, nutrient_plan_json, irrigation_notes)
VALUES (
  'l1-profile',
  80, 40, 120,
  '{"initial": 0.3, "development": 0.5, "mid": 0.7, "late": 0.6}'::jsonb,
  0.6,
  '{"germination": {"N": 20, "P": 15, "K": 25}, "vegetative": {"N": 30, "P": 20, "K": 35}, "production": {"N": 25, "P": 25, "K": 40}}'::jsonb,
  'Logica qualità vs quantità. Stress controllato possibile per qualità. Irrigazione strategica.'
) ON CONFLICT DO NOTHING;

-- L2: Olivo
INSERT INTO crop_profiles (id, root_zone_depth_cm_default, root_zone_depth_cm_min, root_zone_depth_cm_max, kc_json, stress_depletion_p_default, nutrient_plan_json, irrigation_notes)
VALUES (
  'l2-profile',
  105, 60, 150,
  '{"initial": 0.3, "development": 0.4, "mid": 0.6, "late": 0.5}'::jsonb,
  0.7,
  '{"germination": {"N": 15, "P": 10, "K": 15}, "vegetative": {"N": 25, "P": 15, "K": 25}, "production": {"N": 20, "P": 20, "K": 30}}'::jsonb,
  'Irrigazione di supporto strategica (spesso). Tollerante alla siccità ma beneficia irrigazione controllata.'
) ON CONFLICT DO NOTHING;

-- L3: Albero da frutto (default)
INSERT INTO crop_profiles (id, root_zone_depth_cm_default, root_zone_depth_cm_min, root_zone_depth_cm_max, kc_json, stress_depletion_p_default, nutrient_plan_json, irrigation_notes)
VALUES (
  'l3-profile',
  100, 50, 150,
  '{"initial": 0.4, "development": 0.6, "mid": 0.8, "late": 0.7}'::jsonb,
  0.6,
  '{"germination": {"N": 20, "P": 15, "K": 20}, "vegetative": {"N": 30, "P": 20, "K": 30}, "production": {"N": 25, "P": 25, "K": 35}}'::jsonb,
  'Cambia con età/portinnesto: serve override facile. Irrigazione regolare durante produzione.'
) ON CONFLICT DO NOTHING;

-- ============================================
-- ARCHETIPI PRINCIPALI (A1-A12)
-- ============================================

INSERT INTO crop_archetypes (id, label, icon, botanical_family, default_profile_id, examples)
VALUES
  ('A1', 'Solanacee da frutto', '🍅', 'Solanaceae', 'a1-profile', ARRAY['pomodoro', 'peperone', 'melanzana']),
  ('A2', 'Cucurbitacee fresche', '🥒', 'Cucurbitaceae', 'a2-profile', ARRAY['cetriolo', 'carosello', 'barattiere', 'zucchina']),
  ('A3', 'Cucurbitacee grosse', '🍈', 'Cucurbitaceae', 'a3-profile', ARRAY['melone', 'anguria', 'zucca']),
  ('A4', 'Insalate', '🥬', 'Asteraceae', 'a4-profile', ARRAY['lattuga', 'romana', 'gentilina', 'iceberg']),
  ('A5', 'Foglie robuste', '🥬', 'Amaranthaceae', 'a5-profile', ARRAY['bietola', 'spinacio']),
  ('A6', 'Brassiche', '🥦', 'Brassicaceae', 'a6-profile', ARRAY['cavolfiore', 'broccoli', 'cavolo nero']),
  ('A7', 'Bulbi', '🧅', 'Amaryllidaceae', 'a7-profile', ARRAY['cipolla', 'aglio', 'porro']),
  ('A8', 'Radici & tuberi', '🥕', 'Apiaceae/Solanaceae', 'a8-profile', ARRAY['carota', 'patata', 'barbabietola']),
  ('A9', 'Legumi', '🫘', 'Fabaceae', 'a9-profile', ARRAY['fagiolo', 'pisello', 'fava', 'ceci']),
  ('A10', 'Aromatiche', '🌿', 'Lamiaceae/Apiaceae', 'a10-profile', ARRAY['basilico', 'rosmarino', 'salvia', 'prezzemolo']),
  ('A11', 'Piccoli frutti', '🫐', 'Rosaceae/Ericaceae', 'a11-profile', ARRAY['fragola', 'lampone', 'mirtillo', 'mora']),
  ('A12', 'Colture legnose', '🌳', 'Varie', 'a12-profile', ARRAY['frutteto', 'olivo', 'vite'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SUB-GRIGLIA A12 → L1/L2/L3
-- ============================================

INSERT INTO crop_archetypes (id, label, icon, botanical_family, default_profile_id, parent_archetype_id, examples)
VALUES
  ('L1', 'Vite', '🍇', 'Vitaceae', 'l1-profile', 'A12', ARRAY['uva da vino', 'uva da tavola']),
  ('L2', 'Olivo', '🫒', 'Oleaceae', 'l2-profile', 'A12', ARRAY['olio', 'mensa']),
  ('L3', 'Albero da frutto', '🌳', 'Varie', 'l3-profile', 'A12', ARRAY['melo', 'pesco', 'agrumi', 'avocado'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SUB-GRIGLIA L3 → Agrumi/Drupacee/Pomacee/Esotiche
-- ============================================

INSERT INTO crop_archetypes (id, label, icon, botanical_family, default_profile_id, parent_archetype_id, examples)
VALUES
  ('L3_CITRUS', 'Agrumi', '🍊', 'Rutaceae', 'l3-profile', 'L3', ARRAY['limone', 'arancia', 'mandarino', 'pomelo']),
  ('L3_STONE', 'Drupacee', '🍑', 'Rosaceae', 'l3-profile', 'L3', ARRAY['pesco', 'albicocco', 'ciliegio', 'susino']),
  ('L3_POME', 'Pomacee', '🍎', 'Rosaceae', 'l3-profile', 'L3', ARRAY['melo', 'pero', 'cotogno']),
  ('L3_EXOTIC', 'Esotiche', '🥑', 'Varie', 'l3-profile', 'L3', ARRAY['avocado', 'mango', 'litchi', 'papaya'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- AGGIORNA PROFILI CON ARCHETYPE_ID
-- ============================================

UPDATE crop_profiles SET archetype_id = 'A1' WHERE id = 'a1-profile';
UPDATE crop_profiles SET archetype_id = 'A2' WHERE id = 'a2-profile';
UPDATE crop_profiles SET archetype_id = 'A3' WHERE id = 'a3-profile';
UPDATE crop_profiles SET archetype_id = 'A4' WHERE id = 'a4-profile';
UPDATE crop_profiles SET archetype_id = 'A5' WHERE id = 'a5-profile';
UPDATE crop_profiles SET archetype_id = 'A6' WHERE id = 'a6-profile';
UPDATE crop_profiles SET archetype_id = 'A7' WHERE id = 'a7-profile';
UPDATE crop_profiles SET archetype_id = 'A8' WHERE id = 'a8-profile';
UPDATE crop_profiles SET archetype_id = 'A9' WHERE id = 'a9-profile';
UPDATE crop_profiles SET archetype_id = 'A10' WHERE id = 'a10-profile';
UPDATE crop_profiles SET archetype_id = 'A11' WHERE id = 'a11-profile';
UPDATE crop_profiles SET archetype_id = 'A12' WHERE id = 'a12-profile';
UPDATE crop_profiles SET archetype_id = 'L1' WHERE id = 'l1-profile';
UPDATE crop_profiles SET archetype_id = 'L2' WHERE id = 'l2-profile';
UPDATE crop_profiles SET archetype_id = 'L3' WHERE id = 'l3-profile';

