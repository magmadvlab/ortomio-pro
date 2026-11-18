-- Run only on the disposable local schema clone; every fixture is rolled back.
BEGIN;
INSERT INTO auth.users(id, email, raw_user_meta_data) VALUES
('a0000000-0000-4000-8000-000000000001', 'audit-a@example.test', '{}'),
('b0000000-0000-4000-8000-000000000001', 'audit-b@example.test', '{}');
INSERT INTO public.gardens(id,user_id,name) VALUES
('a1000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','Audit A'),
('b1000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','Audit B');
INSERT INTO public.field_rows(id,garden_id,name,row_number,length_meters) VALUES
('a2000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001','Filare A',1,10),
('a2000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000001','Filare A2',2,10),
('b2000000-0000-4000-8000-000000000001','b1000000-0000-4000-8000-000000000001','Filare B',1,10);
INSERT INTO public.irrigation_systems(id,user_id,garden_id,name) VALUES
('a3000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001','Sistema A'),
('b3000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','b1000000-0000-4000-8000-000000000001','Sistema B');
INSERT INTO public.irrigation_zones(id,system_id,garden_id,name,area_sqm,method,flow_rate_lph) VALUES
('a4000000-0000-4000-8000-000000000001','a3000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001','Zona A',100,'Manual',100),
('b4000000-0000-4000-8000-000000000001','b3000000-0000-4000-8000-000000000001','b1000000-0000-4000-8000-000000000001','Zona B',100,'Manual',100);
INSERT INTO public.garden_tasks(id,garden_id,field_row_id,plant_name,task_type,date) VALUES
('a5000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001','a2000000-0000-4000-8000-000000000001','Pomodoro','Harvest','2026-11-18');
INSERT INTO public.harvest_logs(id,garden_id,task_id,plant_name,quantity,unit,harvest_date) VALUES
('a6000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001','a5000000-0000-4000-8000-000000000001','Pomodoro',0,'kg','2026-11-18');
DO $$ BEGIN
  IF (SELECT field_row_id FROM public.harvest_logs WHERE id='a6000000-0000-4000-8000-000000000001') IS DISTINCT FROM 'a2000000-0000-4000-8000-000000000001'::uuid THEN RAISE EXCEPTION 'harvest row not captured'; END IF;
  BEGIN
    INSERT INTO public.harvest_logs(garden_id,field_row_id,plant_name,quantity,unit,harvest_date) VALUES
    ('a1000000-0000-4000-8000-000000000001','b2000000-0000-4000-8000-000000000001','Pomodoro',1,'kg','2026-11-18');
    RAISE EXCEPTION 'cross-garden row accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;
UPDATE public.garden_tasks SET field_row_id='a2000000-0000-4000-8000-000000000002' WHERE id='a5000000-0000-4000-8000-000000000001';
UPDATE public.harvest_logs SET quantity=2 WHERE id='a6000000-0000-4000-8000-000000000001';
DO $$ BEGIN
  IF (SELECT field_row_id FROM public.harvest_logs WHERE id='a6000000-0000-4000-8000-000000000001') IS DISTINCT FROM 'a2000000-0000-4000-8000-000000000001'::uuid THEN RAISE EXCEPTION 'history reassigned'; END IF;
END $$;
INSERT INTO public.water_requirements(zone_id,calculation_date,et0_mm,kc_coefficient,etc_mm,irrigation_need_mm,recommended_volume_liters,calculation_method) VALUES
('a4000000-0000-4000-8000-000000000001','2026-11-17',2,1,2,2,200,'fixture'),
('b4000000-0000-4000-8000-000000000001','2026-11-17',2,1,2,2,200,'fixture');
UPDATE public.water_requirements SET weather_data='{"soilMoisture10cm":0,"sensorProvenance":{"soilMoisture10cm":{"observedAt":"2026-11-17T10:00:00Z"}}}'::jsonb
WHERE zone_id='a4000000-0000-4000-8000-000000000001';
INSERT INTO public.api_keys(id,user_id,service,name,key_value,config) VALUES
('a9000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','GoogleAI','Fixture','c3ludGhldGljLWtleQ==','{"apiKey":"synthetic-key"}');
DO $$ DECLARE moved jsonb; BEGIN
  moved := public.migrate_legacy_api_key('a9000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','c3ludGhldGljLWtleQ==','{"apiKey":"synthetic-key"}','v1.archive-fixture','ai_gemini','v1.secret-fixture','{"model":"fixture"}');
  IF moved->>'transferred'<>'true' THEN RAISE EXCEPTION 'legacy key not transferred'; END IF;
  IF (SELECT config FROM public.api_keys WHERE id='a9000000-0000-4000-8000-000000000001') <> '{}'::jsonb THEN RAISE EXCEPTION 'legacy config secret retained outside archive'; END IF;
  IF (SELECT api_key_encrypted FROM public.api_configurations WHERE id='a9000000-0000-4000-8000-000000000001') <> 'v1.secret-fixture' THEN RAISE EXCEPTION 'legacy encrypted key missing'; END IF;
  moved := public.migrate_legacy_api_key('a9000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','v1.archive-fixture','{}','v1.archive-fixture','ai_gemini','v1.secret-fixture','{"model":"fixture"}');
  IF moved->>'transferred'<>'true' OR (SELECT count(*) FROM public.api_configurations WHERE user_id='a0000000-0000-4000-8000-000000000001')<>1 THEN RAISE EXCEPTION 'legacy migration retry not idempotent'; END IF;
END $$;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000001',true);
INSERT INTO public.ai_suggestions(id,user_id,garden_id,suggestion_type,title,description,reasoning,suggested_action) VALUES
('a7000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001','PLANTING_PLAN','Piano prova','Fixture','Fixture','Semina'),
('a7000000-0000-4000-8000-000000000002','a0000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001','HARVEST_TIMING','Raccolta prova','Fixture','Fixture','Raccolta');
DO $$ DECLARE first_result jsonb; second_result jsonb; BEGIN
  first_result := public.accept_planner_suggestion('a7000000-0000-4000-8000-000000000001','[{"plantName":"Lattuga","taskType":"Sowing","date":"2026-11-20","quantity":4}]');
  second_result := public.accept_planner_suggestion('a7000000-0000-4000-8000-000000000001','[{"plantName":"Lattuga","taskType":"Sowing","date":"2026-11-20","quantity":4}]');
  IF first_result->'taskIds' IS DISTINCT FROM second_result->'taskIds' OR second_result->>'alreadyAccepted'<>'true' THEN RAISE EXCEPTION 'planning not idempotent'; END IF;
  IF (SELECT count(*) FROM public.user_decisions WHERE suggestion_id='a7000000-0000-4000-8000-000000000001')<>1 THEN RAISE EXCEPTION 'duplicate decisions'; END IF;
  IF EXISTS (SELECT 1 FROM public.user_decisions WHERE suggestion_id='a7000000-0000-4000-8000-000000000001' AND implemented) THEN RAISE EXCEPTION 'planning mislabeled as execution'; END IF;
  BEGIN
    PERFORM public.accept_planner_suggestion('a7000000-0000-4000-8000-000000000002','[{"plantName":"Lattuga","taskType":"Harvest","date":"2026-11-20"},{"plantName":"Lattuga","taskType":"Sowing","date":"2026-11-20"}]');
    RAISE EXCEPTION 'invalid task accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'task_type_mismatch' THEN RAISE; END IF;
  END;
  IF EXISTS (SELECT 1 FROM public.garden_tasks WHERE suggested_by='ai_suggestion:a7000000-0000-4000-8000-000000000002') THEN RAISE EXCEPTION 'partial task creation'; END IF;
  IF (SELECT status FROM public.ai_suggestions WHERE id='a7000000-0000-4000-8000-000000000002')<>'PENDING' THEN RAISE EXCEPTION 'failed suggestion accepted'; END IF;
END $$;
DO $$ BEGIN
  IF (SELECT weather_data->>'soilMoisture10cm' FROM public.water_requirements) <> '0' THEN RAISE EXCEPTION 'sensor zero or provenance not persisted'; END IF;
  IF (SELECT count(*) FROM public.water_requirements) <> 1 THEN RAISE EXCEPTION 'water requirement isolation failed'; END IF;
  IF EXISTS (SELECT 1 FROM public.gardens WHERE id='b1000000-0000-4000-8000-000000000001') THEN RAISE EXCEPTION 'garden isolation failed'; END IF;
  BEGIN
    INSERT INTO public.water_requirements(zone_id,calculation_date,et0_mm,kc_coefficient,etc_mm,irrigation_need_mm,recommended_volume_liters,calculation_method) VALUES
    ('b4000000-0000-4000-8000-000000000001','2026-11-17',2,1,2,2,200,'fixture');
    RAISE EXCEPTION 'cross-user requirement inserted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT set_config('request.jwt.claim.sub','b0000000-0000-4000-8000-000000000001',true);
DO $$ BEGIN
  BEGIN
    PERFORM public.accept_planner_suggestion('a7000000-0000-4000-8000-000000000002','[{"plantName":"Lattuga","taskType":"Harvest","date":"2026-11-20"}]');
    RAISE EXCEPTION 'cross-user planning accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
DO $$ BEGIN
  IF has_function_privilege('authenticated','public.migrate_legacy_api_key(uuid,uuid,text,jsonb,text,text,text,jsonb)','EXECUTE') OR
     has_table_privilege('authenticated','public.api_keys','SELECT') OR
     has_table_privilege('authenticated','public.api_configurations','SELECT') OR
     has_table_privilege('authenticated','public.api_configurations','INSERT') OR
     has_function_privilege('authenticated','public.save_api_configuration(uuid,uuid,text,text,text,jsonb,boolean,boolean)','EXECUTE') THEN
    RAISE EXCEPTION 'API credentials exposed outside server';
  END IF;
END $$;
RESET ROLE;
ROLLBACK;
