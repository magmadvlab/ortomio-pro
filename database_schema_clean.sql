--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.0

-- Started on 2025-12-18 08:32:58 CET

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP POLICY IF EXISTS "Weather cache is publicly readable" ON public.weather_cache;
DROP POLICY IF EXISTS "Users can view their own or public custom plans" ON public.custom_plans;
DROP POLICY IF EXISTS "Users can view their own challenge completions" ON public.challenge_completions;
DROP POLICY IF EXISTS "Users can view their own calendar tasks" ON public.calendar_tasks;
DROP POLICY IF EXISTS "Users can view their own badges" ON public.user_badges;
DROP POLICY IF EXISTS "Users can view obstacles in their gardens" ON public.garden_obstacles;
DROP POLICY IF EXISTS "Users can view advice from their consultations" ON public.agronomist_advice;
DROP POLICY IF EXISTS "Users can update their own custom plans" ON public.custom_plans;
DROP POLICY IF EXISTS "Users can update their own challenge completions" ON public.challenge_completions;
DROP POLICY IF EXISTS "Users can update their own calendar tasks" ON public.calendar_tasks;
DROP POLICY IF EXISTS "Users can update obstacles in their gardens" ON public.garden_obstacles;
DROP POLICY IF EXISTS "Users can update advice from their consultations" ON public.agronomist_advice;
DROP POLICY IF EXISTS "Users can only access their own treatments" ON public.treatment_register;
DROP POLICY IF EXISTS "Users can only access their own transactions" ON public.ai_credit_transactions;
DROP POLICY IF EXISTS "Users can only access their own seeds" ON public.seed_inventory;
DROP POLICY IF EXISTS "Users can only access their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can only access their own mechanical work" ON public.mechanical_work_register;
DROP POLICY IF EXISTS "Users can only access their own analytics" ON public.professional_analytics;
DROP POLICY IF EXISTS "Users can only access their gardens" ON public.gardens;
DROP POLICY IF EXISTS "Users can only access tasks in their gardens" ON public.garden_tasks;
DROP POLICY IF EXISTS "Users can only access photos in their gardens" ON public.photo_logs;
DROP POLICY IF EXISTS "Users can only access history in their beds" ON public.bed_planting_history;
DROP POLICY IF EXISTS "Users can only access harvests in their gardens" ON public.harvest_logs;
DROP POLICY IF EXISTS "Users can only access beds in their gardens" ON public.garden_beds;
DROP POLICY IF EXISTS "Users can manage their own zone memories" ON public.garden_zone_memories;
DROP POLICY IF EXISTS "Users can manage their own tree memories" ON public.garden_tree_memories;
DROP POLICY IF EXISTS "Users can manage their own season analyses" ON public.garden_season_analyses;
DROP POLICY IF EXISTS "Users can manage their own patterns" ON public.garden_patterns;
DROP POLICY IF EXISTS "Users can manage their own learning events" ON public.crop_learning_events;
DROP POLICY IF EXISTS "Users can manage their own custom crops" ON public.custom_crops;
DROP POLICY IF EXISTS "Users can manage their own correlations" ON public.garden_correlations;
DROP POLICY IF EXISTS "Users can manage their own consultations" ON public.agronomist_consultations;
DROP POLICY IF EXISTS "Users can manage their own agronomists" ON public.agronomists;
DROP POLICY IF EXISTS "Users can insert weather cache" ON public.weather_cache;
DROP POLICY IF EXISTS "Users can insert their own challenge completions" ON public.challenge_completions;
DROP POLICY IF EXISTS "Users can insert their own calendar tasks" ON public.calendar_tasks;
DROP POLICY IF EXISTS "Users can insert their own badges" ON public.user_badges;
DROP POLICY IF EXISTS "Users can del
ete their own custom plans" ON public.custom_plans;
DROP POLICY IF EXISTS "Users can delete their own calendar tasks" ON public.calendar_tasks;
DROP POLICY IF EXISTS "Users can delete obstacles in their gardens" ON public.garden_obstacles;
DROP POLICY IF EXISTS "Users can create their own custom plans" ON public.custom_plans;
DROP POLICY IF EXISTS "Users can create obstacles in their gardens" ON public.garden_obstacles;
DROP POLICY IF EXISTS "Users can access seedling batches in their gardens" ON public.seedling_batches;
DROP POLICY IF EXISTS "Users can access hydroponic readings in their gardens" ON public.hydroponic_readings;
DROP POLICY IF EXISTS "Users can access aquaponic readings in their gardens" ON public.aquaponic_readings;
DROP POLICY IF EXISTS "Users can access accessories in their gardens" ON public.garden_accessories;
DROP POLICY IF EXISTS "Crop mechanical works are publicly readable" ON public.crop_mechanical_works;
ALTER TABLE IF EXISTS ONLY public.user_badges DROP CONSTRAINT IF EXISTS user_badges_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.treatment_register DROP CONSTRAINT IF EXISTS treatment_register_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.treatment_register DROP CONSTRAINT IF EXISTS treatment_register_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.seedling_batches DROP CONSTRAINT IF EXISTS seedling_batches_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.seed_inventory DROP CONSTRAINT IF EXISTS seed_inventory_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.seed_inventory DROP CONSTRAINT IF EXISTS seed_inventory_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE IF EXISTS ONLY public.professional_analytics DROP CONSTRAINT IF EXISTS professional_analytics_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.professional_analytics DROP CONSTRAINT IF EXISTS professional_analytics_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.photo_logs DROP CONSTRAINT IF EXISTS photo_logs_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.photo_logs DROP CONSTRAINT IF EXISTS photo_logs_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.mechanical_work_register DROP CONSTRAINT IF EXISTS mechanical_work_register_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.mechanical_work_register DROP CONSTRAINT IF EXISTS mechanical_work_register_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.hydroponic_readings DROP CONSTRAINT IF EXISTS hydroponic_readings_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.harvest_logs DROP CONSTRAINT IF EXISTS harvest_logs_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.harvest_logs DROP CONSTRAINT IF EXISTS harvest_logs_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.gardens DROP CONSTRAINT IF EXISTS gardens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_zone_memories DROP CONSTRAINT IF EXISTS garden_zone_memories_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_zone_memories DROP CONSTRAINT IF EXISTS garden_zone_memories_custom_crop_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_tree_memories DROP CONSTRAINT IF EXISTS garden_tree_memories_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_tree_memories DROP CONSTRAINT IF EXISTS garden_tree_memories_custom_crop_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_tasks DROP CONSTRAINT IF EXISTS garden_tasks_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_tasks DROP CONSTRAINT IF EXISTS garden_tasks_bed_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_season_analyses DROP CONSTRAINT IF EXISTS garden_season_analyses_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_patterns DROP CONSTRAINT IF EXISTS garden_patterns_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_patterns DROP CONSTRAINT IF EXISTS garden_patterns_custom_crop_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_obstacles DROP CONSTRAINT IF EXISTS garden_obstacles_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_correlations DROP CONSTRAINT IF EXISTS garden_correlations_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_correlations DROP CONSTRAINT IF EX
ISTS garden_correlations_custom_crop_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_beds DROP CONSTRAINT IF EXISTS garden_beds_structure_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_beds DROP CONSTRAINT IF EXISTS garden_beds_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_beds DROP CONSTRAINT IF EXISTS garden_beds_covering_structure_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_accessories DROP CONSTRAINT IF EXISTS garden_accessories_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.custom_plans DROP CONSTRAINT IF EXISTS custom_plans_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.custom_plans DROP CONSTRAINT IF EXISTS custom_plans_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.custom_crops DROP CONSTRAINT IF EXISTS custom_crops_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.custom_crops DROP CONSTRAINT IF EXISTS custom_crops_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.crop_learning_events DROP CONSTRAINT IF EXISTS crop_learning_events_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.crop_learning_events DROP CONSTRAINT IF EXISTS crop_learning_events_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.crop_learning_events DROP CONSTRAINT IF EXISTS crop_learning_events_custom_crop_id_fkey;
ALTER TABLE IF EXISTS ONLY public.challenge_completions DROP CONSTRAINT IF EXISTS challenge_completions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.calendar_tasks DROP CONSTRAINT IF EXISTS calendar_tasks_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.calendar_tasks DROP CONSTRAINT IF EXISTS calendar_tasks_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bed_planting_history DROP CONSTRAINT IF EXISTS bed_planting_history_bed_id_fkey;
ALTER TABLE IF EXISTS ONLY public.aquaponic_readings DROP CONSTRAINT IF EXISTS aquaponic_readings_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ai_credit_transactions DROP CONSTRAINT IF EXISTS ai_credit_transactions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.agronomists DROP CONSTRAINT IF EXISTS agronomists_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.agronomist_consultations DROP CONSTRAINT IF EXISTS agronomist_consultations_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.agronomist_consultations DROP CONSTRAINT IF EXISTS agronomist_consultations_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.agronomist_consultations DROP CONSTRAINT IF EXISTS agronomist_consultations_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.agronomist_consultations DROP CONSTRAINT IF EXISTS agronomist_consultations_agronomist_id_fkey;
ALTER TABLE IF EXISTS ONLY public.agronomist_advice DROP CONSTRAINT IF EXISTS agronomist_advice_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.agronomist_advice DROP CONSTRAINT IF EXISTS agronomist_advice_consultation_id_fkey;
DROP TRIGGER IF EXISTS update_seedling_batches_updated_at ON public.seedling_batches;
DROP TRIGGER IF EXISTS update_seed_inventory_updated_at ON public.seed_inventory;
DROP TRIGGER IF EXISTS update_gardens_updated_at ON public.gardens;
DROP TRIGGER IF EXISTS update_garden_tasks_updated_at ON public.garden_tasks;
DROP TRIGGER IF EXISTS update_garden_obstacles_updated_at ON public.garden_obstacles;
DROP TRIGGER IF EXISTS update_garden_beds_updated_at ON public.garden_beds;
DROP TRIGGER IF EXISTS update_custom_plans_updated_at ON public.custom_plans;
DROP TRIGGER IF EXISTS update_custom_crops_updated_at ON public.custom_crops;
DROP TRIGGER IF EXISTS update_custom_crops_timestamp ON public.custom_crops;
DROP TRIGGER IF EXISTS update_calendar_tasks_updated_at ON public.calendar_tasks;
DROP TRIGGER IF EXISTS update_agronomists_updated_at ON public.agronomists;
DROP INDEX IF EXISTS public.idx_zone_memories_garden_id;
DROP INDEX IF EXISTS public.idx_zone_memories_custom_crop_id;
DROP INDEX IF EXISTS public.idx_weather_cache_lat_lng_date;
DROP INDEX IF EXISTS public.idx_weather_cache_cached_at;
DROP INDEX IF EXISTS public.idx_user_badges_user;
DROP INDEX IF EXISTS public.idx_user_badges_earned;
DROP INDEX IF EXISTS public.idx_tree_memories_garden_id;
DROP INDEX IF EXISTS public.idx_tree_memories_custom_crop_id;
DROP INDEX IF EXISTS public.i
dx_treatment_register_user;
DROP INDEX IF EXISTS public.idx_treatment_register_garden;
DROP INDEX IF EXISTS public.idx_treatment_register_date;
DROP INDEX IF EXISTS public.idx_treatment_register_crop;
DROP INDEX IF EXISTS public.idx_seedling_batches_sowing_date;
DROP INDEX IF EXISTS public.idx_seedling_batches_phase;
DROP INDEX IF EXISTS public.idx_seedling_batches_garden_id;
DROP INDEX IF EXISTS public.idx_seed_inventory_user_id;
DROP INDEX IF EXISTS public.idx_seed_inventory_garden_id;
DROP INDEX IF EXISTS public.idx_seed_inventory_expiry_year;
DROP INDEX IF EXISTS public.idx_season_analyses_garden_id;
DROP INDEX IF EXISTS public.idx_professional_analytics_year;
DROP INDEX IF EXISTS public.idx_professional_analytics_user;
DROP INDEX IF EXISTS public.idx_professional_analytics_garden;
DROP INDEX IF EXISTS public.idx_professional_analytics_crop;
DROP INDEX IF EXISTS public.idx_photo_logs_task_id;
DROP INDEX IF EXISTS public.idx_photo_logs_photo_date;
DROP INDEX IF EXISTS public.idx_photo_logs_garden_id;
DROP INDEX IF EXISTS public.idx_patterns_garden_id;
DROP INDEX IF EXISTS public.idx_patterns_custom_crop_id;
DROP INDEX IF EXISTS public.idx_mechanical_work_user;
DROP INDEX IF EXISTS public.idx_mechanical_work_type;
DROP INDEX IF EXISTS public.idx_mechanical_work_garden;
DROP INDEX IF EXISTS public.idx_mechanical_work_date;
DROP INDEX IF EXISTS public.idx_learning_events_user_id;
DROP INDEX IF EXISTS public.idx_learning_events_type;
DROP INDEX IF EXISTS public.idx_learning_events_crop_id;
DROP INDEX IF EXISTS public.idx_learning_events_created_at;
DROP INDEX IF EXISTS public.idx_hydroponic_readings_garden_date;
DROP INDEX IF EXISTS public.idx_harvest_logs_task_id;
DROP INDEX IF EXISTS public.idx_harvest_logs_plant_name;
DROP INDEX IF EXISTS public.idx_harvest_logs_harvest_date;
DROP INDEX IF EXISTS public.idx_harvest_logs_garden_id;
DROP INDEX IF EXISTS public.idx_gardens_user_id;
DROP INDEX IF EXISTS public.idx_gardens_created_at;
DROP INDEX IF EXISTS public.idx_garden_tasks_suggested_date;
DROP INDEX IF EXISTS public.idx_garden_tasks_suggested;
DROP INDEX IF EXISTS public.idx_garden_tasks_plant_name;
DROP INDEX IF EXISTS public.idx_garden_tasks_garden_id;
DROP INDEX IF EXISTS public.idx_garden_tasks_date;
DROP INDEX IF EXISTS public.idx_garden_tasks_completed;
DROP INDEX IF EXISTS public.idx_garden_tasks_bed_id;
DROP INDEX IF EXISTS public.idx_garden_obstacles_garden_id;
DROP INDEX IF EXISTS public.idx_garden_obstacles_azimuth;
DROP INDEX IF EXISTS public.idx_garden_beds_garden_id;
DROP INDEX IF EXISTS public.idx_custom_plans_user_id;
DROP INDEX IF EXISTS public.idx_custom_plans_garden_id;
DROP INDEX IF EXISTS public.idx_custom_plans_base_master_sheet;
DROP INDEX IF EXISTS public.idx_custom_crops_user_id;
DROP INDEX IF EXISTS public.idx_custom_crops_garden_id;
DROP INDEX IF EXISTS public.idx_custom_crops_common_name;
DROP INDEX IF EXISTS public.idx_crop_mechanical_works_work_type;
DROP INDEX IF EXISTS public.idx_crop_mechanical_works_priority;
DROP INDEX IF EXISTS public.idx_crop_mechanical_works_crop_id;
DROP INDEX IF EXISTS public.idx_credit_transactions_user;
DROP INDEX IF EXISTS public.idx_credit_transactions_created;
DROP INDEX IF EXISTS public.idx_correlations_garden_id;
DROP INDEX IF EXISTS public.idx_correlations_custom_crop_id;
DROP INDEX IF EXISTS public.idx_consultations_user_id;
DROP INDEX IF EXISTS public.idx_consultations_task_id;
DROP INDEX IF EXISTS public.idx_consultations_agronomist_id;
DROP INDEX IF EXISTS public.idx_challenge_completions_user;
DROP INDEX IF EXISTS public.idx_challenge_completions_date;
DROP INDEX IF EXISTS public.idx_challenge_completions_challenge;
DROP INDEX IF EXISTS public.idx_calendar_tasks_user_date;
DROP INDEX IF EXISTS public.idx_calendar_tasks_recurring;
DROP INDEX IF EXISTS public.idx_calendar_tasks_garden;
DROP INDEX IF EXISTS public.idx_bed_history_year_season;
DROP INDEX IF EXISTS public.idx_bed_history_plant_family;
DROP INDEX IF EXISTS public.idx_bed_history_bed_id;
DROP INDEX IF EXISTS public.idx_aquaponic_readings_garden_date;
DROP INDEX IF EXISTS public.idx_agronom
ists_user_id;
DROP INDEX IF EXISTS public.idx_advice_task_id;
DROP INDEX IF EXISTS public.idx_advice_consultation_id;
DROP INDEX IF EXISTS public.idx_accessories_garden_id;
DROP INDEX IF EXISTS public.idx_accessories_category;
ALTER TABLE IF EXISTS ONLY public.weather_cache DROP CONSTRAINT IF EXISTS weather_cache_pkey;
ALTER TABLE IF EXISTS ONLY public.weather_cache DROP CONSTRAINT IF EXISTS weather_cache_lat_lng_date_key;
ALTER TABLE IF EXISTS ONLY public.user_badges DROP CONSTRAINT IF EXISTS user_badges_user_id_badge_id_key;
ALTER TABLE IF EXISTS ONLY public.user_badges DROP CONSTRAINT IF EXISTS user_badges_pkey;
ALTER TABLE IF EXISTS ONLY public.treatment_register DROP CONSTRAINT IF EXISTS treatment_register_pkey;
ALTER TABLE IF EXISTS ONLY public.seedling_batches DROP CONSTRAINT IF EXISTS seedling_batches_pkey;
ALTER TABLE IF EXISTS ONLY public.seed_inventory DROP CONSTRAINT IF EXISTS seed_inventory_pkey;
ALTER TABLE IF EXISTS ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.professional_analytics DROP CONSTRAINT IF EXISTS professional_analytics_pkey;
ALTER TABLE IF EXISTS ONLY public.photo_logs DROP CONSTRAINT IF EXISTS photo_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.mechanical_work_register DROP CONSTRAINT IF EXISTS mechanical_work_register_pkey;
ALTER TABLE IF EXISTS ONLY public.hydroponic_readings DROP CONSTRAINT IF EXISTS hydroponic_readings_pkey;
ALTER TABLE IF EXISTS ONLY public.harvest_logs DROP CONSTRAINT IF EXISTS harvest_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.gardens DROP CONSTRAINT IF EXISTS gardens_pkey;
ALTER TABLE IF EXISTS ONLY public.garden_zone_memories DROP CONSTRAINT IF EXISTS garden_zone_memories_pkey;
ALTER TABLE IF EXISTS ONLY public.garden_tree_memories DROP CONSTRAINT IF EXISTS garden_tree_memories_pkey;
ALTER TABLE IF EXISTS ONLY public.garden_tasks DROP CONSTRAINT IF EXISTS garden_tasks_pkey;
ALTER TABLE IF EXISTS ONLY public.garden_season_analyses DROP CONSTRAINT IF EXISTS garden_season_analyses_pkey;
ALTER TABLE IF EXISTS ONLY public.garden_season_analyses DROP CONSTRAINT IF EXISTS garden_season_analyses_garden_id_season_year_key;
ALTER TABLE IF EXISTS ONLY public.garden_patterns DROP CONSTRAINT IF EXISTS garden_patterns_pkey;
ALTER TABLE IF EXISTS ONLY public.garden_obstacles DROP CONSTRAINT IF EXISTS garden_obstacles_pkey;
ALTER TABLE IF EXISTS ONLY public.garden_correlations DROP CONSTRAINT IF EXISTS garden_correlations_pkey;
ALTER TABLE IF EXISTS ONLY public.garden_beds DROP CONSTRAINT IF EXISTS garden_beds_pkey;
ALTER TABLE IF EXISTS ONLY public.garden_accessories DROP CONSTRAINT IF EXISTS garden_accessories_pkey;
ALTER TABLE IF EXISTS ONLY public.custom_plans DROP CONSTRAINT IF EXISTS custom_plans_pkey;
ALTER TABLE IF EXISTS ONLY public.custom_crops DROP CONSTRAINT IF EXISTS custom_crops_pkey;
ALTER TABLE IF EXISTS ONLY public.crop_mechanical_works DROP CONSTRAINT IF EXISTS crop_mechanical_works_pkey;
ALTER TABLE IF EXISTS ONLY public.crop_learning_events DROP CONSTRAINT IF EXISTS crop_learning_events_pkey;
ALTER TABLE IF EXISTS ONLY public.challenge_completions DROP CONSTRAINT IF EXISTS challenge_completions_user_id_challenge_id_key;
ALTER TABLE IF EXISTS ONLY public.challenge_completions DROP CONSTRAINT IF EXISTS challenge_completions_pkey;
ALTER TABLE IF EXISTS ONLY public.calendar_tasks DROP CONSTRAINT IF EXISTS calendar_tasks_pkey;
ALTER TABLE IF EXISTS ONLY public.bed_planting_history DROP CONSTRAINT IF EXISTS bed_planting_history_pkey;
ALTER TABLE IF EXISTS ONLY public.aquaponic_readings DROP CONSTRAINT IF EXISTS aquaponic_readings_pkey;
ALTER TABLE IF EXISTS ONLY public.ai_credit_transactions DROP CONSTRAINT IF EXISTS ai_credit_transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.agronomists DROP CONSTRAINT IF EXISTS agronomists_pkey;
ALTER TABLE IF EXISTS ONLY public.agronomist_consultations DROP CONSTRAINT IF EXISTS agronomist_consultations_pkey;
ALTER TABLE IF EXISTS ONLY public.agronomist_advice DROP CONSTRAINT IF EXISTS agronomist_advice_pkey;
DROP TABLE IF EXISTS public.weather_cache;
DROP TABLE IF EXISTS public.u
ser_badges;
DROP TABLE IF EXISTS public.treatment_register;
DROP TABLE IF EXISTS public.seedling_batches;
DROP TABLE IF EXISTS public.seed_inventory;
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.professional_analytics;
DROP TABLE IF EXISTS public.photo_logs;
DROP TABLE IF EXISTS public.mechanical_work_register;
DROP TABLE IF EXISTS public.hydroponic_readings;
DROP TABLE IF EXISTS public.harvest_logs;
DROP TABLE IF EXISTS public.gardens;
DROP TABLE IF EXISTS public.garden_zone_memories;
DROP TABLE IF EXISTS public.garden_tree_memories;
DROP TABLE IF EXISTS public.garden_tasks;
DROP TABLE IF EXISTS public.garden_season_analyses;
DROP TABLE IF EXISTS public.garden_patterns;
DROP TABLE IF EXISTS public.garden_obstacles;
DROP TABLE IF EXISTS public.garden_correlations;
DROP TABLE IF EXISTS public.garden_beds;
DROP TABLE IF EXISTS public.garden_accessories;
DROP TABLE IF EXISTS public.custom_plans;
DROP TABLE IF EXISTS public.custom_crops;
DROP TABLE IF EXISTS public.crop_mechanical_works;
DROP TABLE IF EXISTS public.crop_learning_events;
DROP TABLE IF EXISTS public.challenge_completions;
DROP TABLE IF EXISTS public.calendar_tasks;
DROP TABLE IF EXISTS public.bed_planting_history;
DROP TABLE IF EXISTS public.aquaponic_readings;
DROP TABLE IF EXISTS public.ai_credit_transactions;
DROP TABLE IF EXISTS public.agronomists;
DROP TABLE IF EXISTS public.agronomist_consultations;
DROP TABLE IF EXISTS public.agronomist_advice;
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.update_custom_crops_updated_at();
DROP FUNCTION IF EXISTS public.set_user_tier(p_user_id uuid, p_tier text);
DROP FUNCTION IF EXISTS public.list_all_users();
DROP FUNCTION IF EXISTS public.handle_new_user_credits();
DROP FUNCTION IF EXISTS public.grant_credits(p_user_id uuid, p_amount integer);
DROP FUNCTION IF EXISTS public.deduct_credits(p_user_id uuid, p_amount integer);
DROP FUNCTION IF EXISTS public.create_superadmin(p_email text, p_password text);
DROP FUNCTION IF EXISTS public.check_rotation_compliance(p_bed_id uuid, p_plant_family text);
DROP FUNCTION IF EXISTS public.calculate_harvest_stats(p_garden_id uuid, p_start_date date, p_end_date date);
DROP FUNCTION IF EXISTS public.admin_grant_credits(p_user_id uuid, p_amount integer);
DROP SCHEMA IF EXISTS public;
--
-- TOC entry 13 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- TOC entry 4369 (class 0 OID 0)
-- Dependencies: 13
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 450 (class 1255 OID 18088)
-- Name: admin_grant_credits(uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_grant_credits(p_user_id uuid, p_amount integer) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  UPDATE profiles
  SET ai_credits_total = ai_credits_total + p_amount
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User % not found', p_user_id;
  END IF;
  
  INSERT INTO ai_credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, p_amount, 'bonus', 'Admin granted credits');
END;
$$;


--
-- TOC entry 424 (class 1255 OID 34191)
-- Name: calculate_harvest_stats(uuid, date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_harvest_stats(p_garden_id uuid, p_start_date date DEFAULT NULL::date, p_end_date date DEFAULT NULL::date) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
  v_total_kg DECIMAL(10, 2);
  v_harvest_count INTEGER;
  v_avg_rating DECIMAL(3, 2);
BEGIN
  SELECT 
    COALESCE(SUM(CASE WHEN unit = 'kg' THEN quantity WHEN unit = 'g' THEN quantity / 1000 ELSE 0 END), 0),
    COUNT(*),
    COALESCE(AVG(rating), 0)
  INTO v_total_kg, v_harvest_count, v_avg_rating
  FROM harvest_logs
  WHERE garden_id = p_garden_id
    AND (p_start_date IS NULL OR harvest_date >= p_start_date)
    AND (p_end_date IS NULL OR harvest_date <= p
_end_date);
  
  RETURN jsonb_build_object(
    'totalKgProduced', v_total_kg,
    'harvestCount', v_harvest_count,
    'avgRating', v_avg_rating
  );
END;
$$;


--
-- TOC entry 434 (class 1255 OID 34190)
-- Name: check_rotation_compliance(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_rotation_compliance(p_bed_id uuid, p_plant_family text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
  v_last_planting RECORD;
  v_result JSONB;
BEGIN
  SELECT plant_family, plant_name, year, season
  INTO v_last_planting
  FROM bed_planting_history
  WHERE bed_id = p_bed_id
  ORDER BY year DESC, season DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'severity', 'SUCCESS',
      'message', 'Aiuola nuova - nessuna rotazione da rispettare'
    );
  END IF;
  
  IF v_last_planting.plant_family = p_plant_family THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'severity', 'ERROR',
      'message', format('Stessa famiglia botanica dell''anno scorso (%s). Rischio malattie!', v_last_planting.plant_name),
      'lastPlanting', jsonb_build_object(
        'plantName', v_last_planting.plant_name,
        'plantFamily', v_last_planting.plant_family,
        'year', v_last_planting.year,
        'season', v_last_planting.season
      )
    );
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'severity', 'SUCCESS',
    'message', format('Rotazione OK - ultima pianta: %s (%s)', v_last_planting.plant_name, v_last_planting.plant_family),
    'lastPlanting', jsonb_build_object(
      'plantName', v_last_planting.plant_name,
      'plantFamily', v_last_planting.plant_family,
      'year', v_last_planting.year,
      'season', v_last_planting.season
    )
  );
END;
$$;


--
-- TOC entry 456 (class 1255 OID 18086)
-- Name: create_superadmin(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_superadmin(p_email text, p_password text DEFAULT 'SuperAdmin123!'::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User % does not exist in auth.users. Please create the user via Supabase Auth API first.', p_email;
  END IF;
  
  INSERT INTO profiles (id, tier, ai_credits_total, ai_credits_used)
  VALUES (v_user_id, 'PRO', 999999, 0)
  ON CONFLICT (id) DO UPDATE
  SET tier = 'PRO',
      ai_credits_total = 999999,
      ai_credits_used = 0;
  
  RETURN v_user_id;
END;
$$;


--
-- TOC entry 482 (class 1255 OID 34192)
-- Name: deduct_credits(uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.deduct_credits(p_user_id uuid, p_amount integer) RETURNS void
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE profiles
  SET ai_credits_used = ai_credits_used + p_amount
  WHERE id = p_user_id
    AND (ai_credits_total - ai_credits_used) >= p_amount;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;
END;
$$;


--
-- TOC entry 420 (class 1255 OID 34193)
-- Name: grant_credits(uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.grant_credits(p_user_id uuid, p_amount integer) RETURNS void
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE profiles
  SET ai_credits_total = ai_credits_total + p_amount
  WHERE id = p_user_id;
END;
$$;


--
-- TOC entry 474 (class 1255 OID 34194)
-- Name: handle_new_user_credits(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user_credits() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  INSERT INTO profiles (id, tier, ai_credits_total, ai_credits_used)
  VALUES (NEW.id, 'FREE', 3, 0)
  ON CONFLICT (id) DO NOTHING;
  
  IF NOT EXISTS (SELECT 1 FROM ai_credit_transactions 
                 WHERE user_id = NEW.id AND type = 'bonus'
 AND description LIKE '%Welcome%') THEN
    PERFORM grant_credits(NEW.id, 3);
    
    INSERT INTO ai_credit_transactions (user_id, amount, type, description)
    VALUES (NEW.id, 3, 'bonus', 'Welcome bonus - 3 free AI credits');
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- TOC entry 497 (class 1255 OID 18089)
-- Name: list_all_users(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.list_all_users() RETURNS TABLE(user_id uuid, email text, tier text, credits_total integer, credits_used integer, created_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    COALESCE(p.tier, 'FREE')::TEXT as tier,
    COALESCE(p.ai_credits_total, 0) as credits_total,
    COALESCE(p.ai_credits_used, 0) as credits_used,
    u.created_at
  FROM auth.users u
  LEFT JOIN profiles p ON p.id = u.id
  ORDER BY u.created_at DESC;
END;
$$;


--
-- TOC entry 403 (class 1255 OID 18087)
-- Name: set_user_tier(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_user_tier(p_user_id uuid, p_tier text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  IF p_tier NOT IN ('FREE', 'PLUS', 'PRO', 'PRO_CONSUMER', 'PRO_PROFESSIONAL') THEN
    RAISE EXCEPTION 'Invalid tier: %. Must be FREE, PLUS, PRO (or legacy PRO_CONSUMER, PRO_PROFESSIONAL)', p_tier;
  END IF;
  
  INSERT INTO profiles (id, tier)
  VALUES (p_user_id, p_tier::TEXT)
  ON CONFLICT (id) DO UPDATE
  SET tier = p_tier::TEXT,
      updated_at = NOW();
END;
$$;


--
-- TOC entry 386 (class 1255 OID 34436)
-- Name: update_custom_crops_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_custom_crops_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- TOC entry 479 (class 1255 OID 34189)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 359 (class 1259 OID 33715)
-- Name: agronomist_advice; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agronomist_advice (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    consultation_id uuid NOT NULL,
    task_id uuid,
    advice_text text NOT NULL,
    category text,
    priority text,
    apply_date date,
    apply_season jsonb,
    applied boolean DEFAULT false,
    applied_date date,
    result text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT agronomist_advice_category_check CHECK ((category = ANY (ARRAY['Fertilization'::text, 'Pruning'::text, 'Irrigation'::text, 'Disease'::text, 'Harvest'::text, 'Other'::text]))),
    CONSTRAINT agronomist_advice_priority_check CHECK ((priority = ANY (ARRAY['High'::text, 'Medium'::text, 'Low'::text])))
);


--
-- TOC entry 358 (class 1259 OID 33682)
-- Name: agronomist_consultations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agronomist_consultations (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    agronomist_id uuid NOT NULL,
    user_id uuid NOT NULL,
    garden_id uuid,
    task_id uuid,
    date date NOT NULL,
    consultation_type text,
    topic text NOT NULL,
    advice jsonb,
    notes text,
    attachments jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT agronomist_consultations_consultation_type_check CHECK ((consultation_type = ANY (ARRAY['InPerson'::text, 'Phone'::text, 'Email'::text, 'Video'::text])))
);


--
-- TOC entry 357 (class 1259 OID 33664)
-- Name: agronomists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agronomists (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    email text,

    phone text,
    specialization jsonb,
    notes text,
    preferred_contact_method text,
    consultation_frequency text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT agronomists_consultation_frequency_check CHECK ((consultation_frequency = ANY (ARRAY['Weekly'::text, 'Monthly'::text, 'Seasonal'::text, 'OnDemand'::text]))),
    CONSTRAINT agronomists_preferred_contact_method_check CHECK ((preferred_contact_method = ANY (ARRAY['Email'::text, 'Phone'::text, 'InPerson'::text])))
);


--
-- TOC entry 368 (class 1259 OID 33911)
-- Name: ai_credit_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_credit_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    amount integer NOT NULL,
    type text NOT NULL,
    feature text,
    description text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT ai_credit_transactions_type_check CHECK ((type = ANY (ARRAY['monthly_grant'::text, 'purchase'::text, 'usage'::text, 'bonus'::text, 'refund'::text])))
);


--
-- TOC entry 363 (class 1259 OID 33805)
-- Name: aquaponic_readings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.aquaponic_readings (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    reading_date timestamp with time zone DEFAULT now(),
    ph numeric(3,2),
    ammonia numeric(5,2),
    nitrite numeric(5,2),
    nitrate numeric(5,2),
    water_temperature numeric(4,1),
    dissolved_oxygen numeric(4,2),
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT aquaponic_readings_ph_check CHECK (((ph >= (0)::numeric) AND (ph <= (14)::numeric)))
);


--
-- TOC entry 349 (class 1259 OID 33476)
-- Name: bed_planting_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bed_planting_history (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    bed_id uuid NOT NULL,
    plant_id text NOT NULL,
    plant_name text NOT NULL,
    plant_family text NOT NULL,
    season text NOT NULL,
    year integer NOT NULL,
    planted_at timestamp with time zone,
    harvested_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT bed_planting_history_season_check CHECK ((season = ANY (ARRAY['Summer'::text, 'Winter'::text])))
);


--
-- TOC entry 364 (class 1259 OID 33822)
-- Name: calendar_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendar_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    garden_id uuid,
    title text NOT NULL,
    type text NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    recurring boolean DEFAULT false,
    recurring_pattern jsonb,
    plant_id uuid,
    plant_name text,
    completed boolean DEFAULT false,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT calendar_tasks_type_check CHECK ((type = ANY (ARRAY['semina'::text, 'irrigazione'::text, 'raccolta'::text, 'potatura'::text, 'concimazione'::text, 'trattamento'::text, 'altro'::text])))
);


--
-- TOC entry 365 (class 1259 OID 33848)
-- Name: challenge_completions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.challenge_completions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    challenge_id text NOT NULL,
    completed_at timestamp with time zone DEFAULT now(),
    actions_completed integer[],
    photo_url text,
    points_awarded integer NOT NULL,
    badge_earned text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 374 (class 1259 OID 34045)
-- Name: crop_learning_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crop_learning_events (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    custom_crop_id uuid,
    user_id uuid NOT NULL,
    garden_id uuid,
    event_type t
ext NOT NULL,
    event_data jsonb NOT NULL,
    outcome jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crop_learning_events_event_type_check CHECK ((event_type = ANY (ARRAY['planting'::text, 'harvest'::text, 'work'::text, 'treatment'::text, 'problem'::text, 'fertilize'::text])))
);


--
-- TOC entry 372 (class 1259 OID 34004)
-- Name: crop_mechanical_works; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crop_mechanical_works (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    crop_id text NOT NULL,
    crop_name text NOT NULL,
    work_type text NOT NULL,
    priority integer DEFAULT 0,
    timing jsonb,
    equipment_suggested text[],
    critical boolean DEFAULT false,
    frequency text,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crop_mechanical_works_priority_check CHECK (((priority >= 0) AND (priority <= 10)))
);


--
-- TOC entry 373 (class 1259 OID 34019)
-- Name: custom_crops; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.custom_crops (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    garden_id uuid,
    common_name text NOT NULL,
    scientific_name text,
    family text,
    initial_data jsonb DEFAULT '{}'::jsonb,
    learned_patterns jsonb DEFAULT '{}'::jsonb,
    stats jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 356 (class 1259 OID 33640)
-- Name: custom_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.custom_plans (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    garden_id uuid,
    name text NOT NULL,
    description text,
    base_master_sheet_id text NOT NULL,
    overrides jsonb,
    custom_notes jsonb,
    custom_methods jsonb,
    additional_parameters jsonb,
    is_public boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 361 (class 1259 OID 33765)
-- Name: garden_accessories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.garden_accessories (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    support_type text,
    netting_type text,
    wire_type text,
    material text NOT NULL,
    quantity integer,
    length_cm integer,
    height_cm integer,
    width_cm integer,
    diameter_cm integer,
    mesh_size_mm integer,
    used_for jsonb,
    installation_date date,
    expected_lifespan_years integer,
    last_maintenance date,
    needs_replacement boolean DEFAULT false,
    "position" jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT garden_accessories_category_check CHECK ((category = ANY (ARRAY['Support'::text, 'Netting'::text, 'Wire'::text, 'Structure'::text]))),
    CONSTRAINT garden_accessories_material_check CHECK ((material = ANY (ARRAY['Wood'::text, 'Steel'::text, 'Plastic'::text, 'Bamboo'::text, 'Cane'::text, 'Aluminum'::text, 'Polyethylene'::text, 'Polypropylene'::text]))),
    CONSTRAINT garden_accessories_netting_type_check CHECK ((netting_type = ANY (ARRAY['Shade'::text, 'Hail'::text, 'Insect'::text, 'Harvest'::text]))),
    CONSTRAINT garden_accessories_support_type_check CHECK ((support_type = ANY (ARRAY['Stake'::text, 'Tutor'::text, 'Trellis'::text, 'Cage'::text]))),
    CONSTRAINT garden_accessories_wire_type_check CHECK ((wire_type = ANY (ARRAY['Steel'::text, 'Plastic'::text])))
);


--
-- TOC entry 348 (class 1259 OID 33445)
-- Name: garden_beds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.garden_beds (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    name text NOT NULL,
    bed_type text,
    shape text,
    length_cm numeric(8,2),
    width_cm numeric(8,2),
    diameter_cm numeric(8,2),
    size_sq_meter
s numeric(5,2),
    sun_exposure text,
    daily_sun_hours integer,
    aspect_direction text,
    soil_type text,
    structure_id uuid,
    structure_type text,
    is_covered boolean DEFAULT false,
    covering_structure_id uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT garden_beds_bed_type_check CHECK ((bed_type = ANY (ARRAY['RaisedBed'::text, 'Container'::text, 'Pot'::text, 'Ground'::text, 'Greenhouse'::text, 'Hydroponic'::text, 'Aquaponic'::text, 'Aeroponic'::text, 'Indoor'::text]))),
    CONSTRAINT garden_beds_shape_check CHECK ((shape = ANY (ARRAY['Rectangle'::text, 'Circle'::text, 'Custom'::text]))),
    CONSTRAINT garden_beds_structure_type_check CHECK ((structure_type = ANY (ARRAY['Greenhouse'::text, 'Hydroponic'::text, 'Aquaponic'::text, 'Aeroponic'::text, 'Indoor'::text]))),
    CONSTRAINT garden_beds_sun_exposure_check CHECK ((sun_exposure = ANY (ARRAY['FullSun'::text, 'PartSun'::text, 'Shade'::text])))
);


--
-- TOC entry 378 (class 1259 OID 34142)
-- Name: garden_correlations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.garden_correlations (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    correlation_type text NOT NULL,
    custom_crop_id uuid,
    factor_a text NOT NULL,
    factor_b text NOT NULL,
    strength numeric(3,2) DEFAULT 0.5,
    correlation_data jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT garden_correlations_strength_check CHECK (((strength >= (0)::numeric) AND (strength <= (1)::numeric)))
);


--
-- TOC entry 4370 (class 0 OID 0)
-- Dependencies: 378
-- Name: COLUMN garden_correlations.custom_crop_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.garden_correlations.custom_crop_id IS 'Riferimento a coltura personalizzata per cui è stata identificata la correlazione';


--
-- TOC entry 360 (class 1259 OID 33739)
-- Name: garden_obstacles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.garden_obstacles (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    azimuth numeric(5,2) NOT NULL,
    height_meters numeric(6,2) NOT NULL,
    distance_meters numeric(6,2) NOT NULL,
    width_degrees numeric(5,2) DEFAULT 30,
    type text DEFAULT 'Other'::text,
    source text DEFAULT 'manual'::text,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT garden_obstacles_azimuth_check CHECK (((azimuth >= (0)::numeric) AND (azimuth <= (360)::numeric))),
    CONSTRAINT garden_obstacles_distance_meters_check CHECK ((distance_meters > (0)::numeric)),
    CONSTRAINT garden_obstacles_height_meters_check CHECK ((height_meters > (0)::numeric)),
    CONSTRAINT garden_obstacles_source_check CHECK ((source = ANY (ARRAY['photo_360'::text, 'manual'::text, 'ai_analysis'::text]))),
    CONSTRAINT garden_obstacles_type_check CHECK ((type = ANY (ARRAY['Building'::text, 'Tree'::text, 'Mountain'::text, 'Other'::text]))),
    CONSTRAINT garden_obstacles_width_degrees_check CHECK (((width_degrees > (0)::numeric) AND (width_degrees <= (180)::numeric)))
);


--
-- TOC entry 377 (class 1259 OID 34120)
-- Name: garden_patterns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.garden_patterns (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    pattern_type text NOT NULL,
    custom_crop_id uuid,
    pattern_data jsonb NOT NULL,
    confidence numeric(3,2) DEFAULT 0.5,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT garden_patterns_confidence_check CHECK (((confidence >= (0)::numeric) AND (confidence <= (1)::numeric)))
);


--
-- TOC entry 4371 (class 0 OID 0)
-- Dependencies: 377
-- Name: COLUMN garden_patterns.custom_crop_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.garden_patterns.custom_crop_id IS 'Riferimento 
a coltura personalizzata per cui è stato identificato il pattern';


--
-- TOC entry 379 (class 1259 OID 34163)
-- Name: garden_season_analyses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.garden_season_analyses (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    season text NOT NULL,
    year integer NOT NULL,
    analysis_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT garden_season_analyses_season_check CHECK ((season = ANY (ARRAY['Spring'::text, 'Summer'::text, 'Fall'::text, 'Winter'::text])))
);


--
-- TOC entry 350 (class 1259 OID 33494)
-- Name: garden_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.garden_tasks (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    bed_id uuid,
    plant_name text NOT NULL,
    variety text,
    planting_method text,
    location_type text,
    initial_quantity integer,
    current_quantity integer,
    task_type text NOT NULL,
    stage text,
    lifecycle_state text,
    season text,
    date date NOT NULL,
    expected_transplant_date date,
    moon_phase text,
    completed boolean DEFAULT false,
    notes text,
    next_due_date date,
    treatment_product_id text,
    grid_position jsonb,
    grid_rotation integer,
    user_responses jsonb,
    recorded_brix numeric(4,2),
    harvest_ready_analysis text,
    harvest_history jsonb,
    final_harvest jsonb,
    strawberry_data jsonb,
    fruit_tree_data jsonb,
    aromatic_data jsonb,
    olive_data jsonb,
    vine_data jsonb,
    exotic_fruit_data jsonb,
    mechanical_work_data jsonb,
    tree_pruning_data jsonb,
    hydroponic_data jsonb,
    aquaponic_data jsonb,
    aeroponic_data jsonb,
    suggested_date date,
    actual_completed_date timestamp with time zone,
    is_suggested boolean DEFAULT false,
    suggested_by text,
    images jsonb,
    last_photo_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    CONSTRAINT garden_tasks_grid_rotation_check CHECK (((grid_rotation >= 0) AND (grid_rotation <= 360))),
    CONSTRAINT garden_tasks_lifecycle_state_check CHECK ((lifecycle_state = ANY (ARRAY['Sowing'::text, 'Germination'::text, 'Nursing'::text, 'Hardening'::text, 'Transplanting'::text, 'Production'::text]))),
    CONSTRAINT garden_tasks_location_type_check CHECK ((location_type = ANY (ARRAY['Pot'::text, 'Ground'::text, 'RaisedBed'::text, 'HydroponicNFT'::text, 'HydroponicDWC'::text, 'HydroponicEbbFlow'::text, 'HydroponicDrip'::text, 'HydroponicWick'::text, 'HydroponicKratky'::text, 'Aquaponic'::text, 'Aeroponic'::text, 'Indoor'::text]))),
    CONSTRAINT garden_tasks_moon_phase_check CHECK ((moon_phase = ANY (ARRAY['New'::text, 'WaxingCrescent'::text, 'FirstQuarter'::text, 'WaxingGibbous'::text, 'Full'::text, 'WaningGibbous'::text, 'LastQuarter'::text, 'WaningCrescent'::text]))),
    CONSTRAINT garden_tasks_planting_method_check CHECK ((planting_method = ANY (ARRAY['Seed'::text, 'Seedling'::text]))),
    CONSTRAINT garden_tasks_season_check CHECK ((season = ANY (ARRAY['Summer'::text, 'Winter'::text]))),
    CONSTRAINT garden_tasks_stage_check CHECK ((stage = ANY (ARRAY['Germination'::text, 'Vegetative'::text, 'ReadyToTransplant'::text, 'Flowering'::text, 'Fruiting'::text, 'Harvested'::text]))),
    CONSTRAINT garden_tasks_task_type_check CHECK ((task_type = ANY (ARRAY['Sowing'::text, 'Transplant'::text, 'Fertilize'::text, 'Prune'::text, 'Harvest'::text, 'Treatment'::text, 'Plowing'::text, 'Tilling'::text, 'TreePruning'::text])))
);


--
-- TOC entry 376 (class 1259 OID 34097)
-- Name: garden_tree_memories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.garden_tree_memories (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    tree_id uuid,
    tree_name text NOT NULL,
    custom_crop_id uuid,
    production_history jsonb DEFAULT '[]'::jsonb,
    alternance_pattern jsonb DEFAULT '{}'::js
onb,
    pruning_history jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 375 (class 1259 OID 34074)
-- Name: garden_zone_memories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.garden_zone_memories (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    zone_id uuid,
    zone_name text,
    custom_crop_id uuid,
    planting_history jsonb DEFAULT '[]'::jsonb,
    patterns jsonb DEFAULT '{}'::jsonb,
    correlations jsonb DEFAULT '[]'::jsonb,
    last_updated timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 4372 (class 0 OID 0)
-- Dependencies: 375
-- Name: COLUMN garden_zone_memories.custom_crop_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.garden_zone_memories.custom_crop_id IS 'Riferimento a coltura personalizzata (se applicabile)';


--
-- TOC entry 347 (class 1259 OID 33416)
-- Name: gardens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gardens (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    coordinates jsonb,
    size_sq_meters numeric(10,2) DEFAULT 0 NOT NULL,
    size_unit text DEFAULT 'sqm'::text,
    soil_type text,
    soil_ph numeric(3,1),
    altitude_meters integer,
    delay_factor_days integer,
    sun_exposure text,
    daily_sun_hours integer,
    aspect_direction text,
    wind_protection text,
    has_compost_bin boolean DEFAULT false,
    is_raised_bed boolean DEFAULT false,
    garden_type text,
    greenhouse_config jsonb,
    indoor_config jsonb,
    hydroponic_config jsonb,
    aquaponic_config jsonb,
    aeroponic_config jsonb,
    vacation_mode jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT gardens_aspect_direction_check CHECK ((aspect_direction = ANY (ARRAY['North'::text, 'South'::text, 'East'::text, 'West'::text, 'Flat'::text]))),
    CONSTRAINT gardens_daily_sun_hours_check CHECK (((daily_sun_hours >= 0) AND (daily_sun_hours <= 24))),
    CONSTRAINT gardens_garden_type_check CHECK ((garden_type = ANY (ARRAY['OpenField'::text, 'Greenhouse'::text, 'Tunnel'::text, 'RaisedBed'::text, 'Indoor'::text, 'Hydroponic'::text, 'Aquaponic'::text, 'Aeroponic'::text, 'NFT'::text, 'DWC'::text, 'EbbFlow'::text, 'Drip'::text, 'Wick'::text, 'Kratky'::text]))),
    CONSTRAINT gardens_size_unit_check CHECK ((size_unit = ANY (ARRAY['sqm'::text, 'are'::text, 'hectare'::text]))),
    CONSTRAINT gardens_soil_ph_check CHECK (((soil_ph >= (0)::numeric) AND (soil_ph <= (14)::numeric))),
    CONSTRAINT gardens_soil_type_check CHECK ((soil_type = ANY (ARRAY['Clay'::text, 'Sandy'::text, 'Loamy'::text, 'Peaty'::text, 'Chalky'::text, 'Silty'::text]))),
    CONSTRAINT gardens_sun_exposure_check CHECK ((sun_exposure = ANY (ARRAY['FullSun'::text, 'PartSun'::text, 'Shade'::text]))),
    CONSTRAINT gardens_wind_protection_check CHECK ((wind_protection = ANY (ARRAY['High'::text, 'Medium'::text, 'Low'::text])))
);


--
-- TOC entry 351 (class 1259 OID 33531)
-- Name: harvest_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.harvest_logs (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    task_id uuid,
    plant_name text NOT NULL,
    quantity numeric(8,2) NOT NULL,
    unit text DEFAULT 'kg'::text NOT NULL,
    rating integer,
    harvest_date date NOT NULL,
    photo text,
    brix numeric(4,2),
    notes text,
    suggested_recipes jsonb,
    strawberry_harvest jsonb,
    fruit_tree_harvest jsonb,
    aromatic_harvest jsonb,
    olive_harvest jsonb,
    vine_harvest jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT harvest_logs_rating_check CHECK (((rating >= 1) AND (rating <= 5))),
    CONSTRAINT harvest_logs_unit_check CHECK ((unit = ANY (ARRAY['kg'::text, 'g'::text, 'units'::text])))
);


--
-- TOC entry 362 (class 1259 
OID 33788)
-- Name: hydroponic_readings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hydroponic_readings (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    reading_date timestamp with time zone DEFAULT now(),
    ph numeric(3,2),
    ec numeric(5,2),
    water_temperature numeric(4,1),
    reservoir_volume numeric(6,2),
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT hydroponic_readings_ph_check CHECK (((ph >= (0)::numeric) AND (ph <= (14)::numeric)))
);


--
-- TOC entry 371 (class 1259 OID 33979)
-- Name: mechanical_work_register; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mechanical_work_register (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    garden_id uuid,
    work_type text NOT NULL,
    work_date date NOT NULL,
    area_m2 numeric(10,2) NOT NULL,
    depth_cm numeric(5,2),
    equipment_type text,
    equipment_attachment text,
    work_metadata jsonb,
    weather_conditions jsonb,
    operator_name text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT mechanical_work_register_equipment_type_check CHECK ((equipment_type = ANY (ARRAY['Tractor'::text, 'RotaryHarrow'::text, 'Shredder'::text, 'FertilizerSpreader'::text, 'Seeder'::text, 'Topper'::text, 'Defoliator'::text, 'PrePruner'::text, 'Thinner'::text, 'Rototiller'::text, 'Cultivator'::text, 'Mower'::text, 'BrushCutter'::text, 'TrackedCart'::text, 'BackpackSprayer'::text, 'ElectricTier'::text, 'ElectricPruner'::text, 'TelescopicPruner'::text, 'Manual'::text]))),
    CONSTRAINT mechanical_work_register_work_type_check CHECK ((work_type = ANY (ARRAY['Plowing'::text, 'Subsoiling'::text, 'Harrowing'::text, 'Tilling'::text, 'Rolling'::text, 'Hoeing'::text, 'EarthingUp'::text, 'Mulching'::text, 'PostSowingRolling'::text, 'Clearing'::text, 'Stumping'::text, 'StoneRemoval'::text, 'Leveling'::text, 'DeepSubsoiling'::text, 'Digging'::text, 'DeepHarrowing'::text, 'Crumbling'::text, 'Scraping'::text, 'SurfaceLeveling'::text, 'MinimumTillage'::text, 'StripTillage'::text, 'NoTill'::text, 'FormativePruning'::text, 'MaintenancePruning'::text, 'RejuvenationPruning'::text, 'SummerPruning'::text, 'WinterPruning'::text, 'Thinning'::text, 'Suckering'::text, 'Defoliation'::text, 'Tying'::text, 'OliveShredding'::text, 'RunnerManagement'::text, 'StrawberryMulching'::text, 'StrawberryCleaning'::text, 'CaneRemoval'::text, 'TipPruning'::text, 'RaspberryTying'::text, 'SuckerThinning'::text, 'FruitBagging'::text, 'ExoticThinning'::text, 'Shredding'::text, 'Topping'::text, 'Pruning'::text])))
);


--
-- TOC entry 352 (class 1259 OID 33557)
-- Name: photo_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.photo_logs (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    task_id uuid NOT NULL,
    garden_id uuid NOT NULL,
    photo_url text NOT NULL,
    photo_date date NOT NULL,
    days_from_planting integer NOT NULL,
    analysis_result jsonb,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 369 (class 1259 OID 33928)
-- Name: professional_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professional_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    garden_id uuid,
    crop_name text NOT NULL,
    season text NOT NULL,
    year integer NOT NULL,
    total_kg numeric(10,2),
    total_revenue numeric(10,2),
    total_costs numeric(10,2),
    roi_percentage numeric(5,2),
    yield_per_sqm numeric(8,2),
    costs_breakdown jsonb,
    production_breakdown jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT professional_analytics_season_check CHECK ((season = ANY (ARRAY['Summer'::text, 'Winter'::text])))
);


--
-- TOC entry 367 (class 1259 OID 33886)
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    tier text DEFAULT 'FREE'::text,
 
   ai_credits_total integer DEFAULT 0,
    ai_credits_used integer DEFAULT 0,
    ai_credits_reset_date date DEFAULT ((date_trunc('month'::text, now()) + '1 mon'::interval))::date,
    regione text,
    provincia text,
    comune text,
    zona text,
    clima text,
    location_lat double precision,
    location_lng double precision,
    location_manual boolean DEFAULT false,
    streak_current integer DEFAULT 0,
    streak_longest integer DEFAULT 0,
    streak_last_date date,
    total_points integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT profiles_clima_check CHECK ((clima = ANY (ARRAY['alpino'::text, 'continentale'::text, 'mediterraneo'::text, 'subtropicale'::text]))),
    CONSTRAINT profiles_tier_check CHECK ((tier = ANY (ARRAY['FREE'::text, 'PLUS'::text, 'PRO'::text]))),
    CONSTRAINT profiles_zona_check CHECK ((zona = ANY (ARRAY['nord'::text, 'centro'::text, 'sud'::text, 'isole'::text])))
);


--
-- TOC entry 353 (class 1259 OID 33579)
-- Name: seed_inventory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seed_inventory (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    garden_id uuid NOT NULL,
    variety_id text NOT NULL,
    variety_name text NOT NULL,
    species_name text NOT NULL,
    purchase_date date,
    expiry_year integer NOT NULL,
    is_open boolean DEFAULT false,
    quantity_remaining text DEFAULT 'High'::text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT seed_inventory_quantity_remaining_check CHECK ((quantity_remaining = ANY (ARRAY['High'::text, 'Medium'::text, 'Low'::text, 'Empty'::text])))
);


--
-- TOC entry 354 (class 1259 OID 33605)
-- Name: seedling_batches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seedling_batches (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    plant_name text NOT NULL,
    variety text,
    sowing_date date NOT NULL,
    quantity integer NOT NULL,
    location text NOT NULL,
    phase text DEFAULT 'Sowing'::text,
    current_quantity integer,
    expected_transplant_date date,
    notes text,
    photo_log jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT seedling_batches_location_check CHECK ((location = ANY (ARRAY['Indoor'::text, 'Greenhouse'::text, 'ColdFrame'::text]))),
    CONSTRAINT seedling_batches_phase_check CHECK ((phase = ANY (ARRAY['Sowing'::text, 'Germination'::text, 'Nursing'::text, 'Hardening'::text, 'ReadyToTransplant'::text])))
);


--
-- TOC entry 370 (class 1259 OID 33953)
-- Name: treatment_register; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.treatment_register (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    garden_id uuid,
    crop_name text NOT NULL,
    treatment_date date NOT NULL,
    product_name text NOT NULL,
    active_ingredient text,
    dosage numeric(8,2),
    dosage_unit text,
    area_treated numeric(8,2),
    method text,
    reason text,
    weather_conditions jsonb,
    operator_name text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT treatment_register_dosage_unit_check CHECK ((dosage_unit = ANY (ARRAY['ml'::text, 'g'::text, 'kg'::text, 'L'::text]))),
    CONSTRAINT treatment_register_method_check CHECK ((method = ANY (ARRAY['spray'::text, 'soil'::text, 'seed'::text, 'foliar'::text]))),
    CONSTRAINT treatment_register_reason_check CHECK ((reason = ANY (ARRAY['preventive'::text, 'curative'::text, 'pest_control'::text, 'disease_control'::text, 'nutrient'::text])))
);


--
-- TOC entry 366 (class 1259 OID 33868)
-- Name: user_badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_badges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    badge_id text NOT NULL,
    badge_name text N
OT NULL,
    badge_emoji text NOT NULL,
    badge_description text,
    earned_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 355 (class 1259 OID 33627)
-- Name: weather_cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weather_cache (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    lat_lng text NOT NULL,
    date date NOT NULL,
    forecast jsonb NOT NULL,
    cached_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 3975 (class 2606 OID 33726)
-- Name: agronomist_advice agronomist_advice_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agronomist_advice
    ADD CONSTRAINT agronomist_advice_pkey PRIMARY KEY (id);


--
-- TOC entry 3970 (class 2606 OID 33691)
-- Name: agronomist_consultations agronomist_consultations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agronomist_consultations
    ADD CONSTRAINT agronomist_consultations_pkey PRIMARY KEY (id);


--
-- TOC entry 3967 (class 2606 OID 33675)
-- Name: agronomists agronomists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agronomists
    ADD CONSTRAINT agronomists_pkey PRIMARY KEY (id);


--
-- TOC entry 4013 (class 2606 OID 33920)
-- Name: ai_credit_transactions ai_credit_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_credit_transactions
    ADD CONSTRAINT ai_credit_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 3990 (class 2606 OID 33815)
-- Name: aquaponic_readings aquaponic_readings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aquaponic_readings
    ADD CONSTRAINT aquaponic_readings_pkey PRIMARY KEY (id);


--
-- TOC entry 3921 (class 2606 OID 33485)
-- Name: bed_planting_history bed_planting_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bed_planting_history
    ADD CONSTRAINT bed_planting_history_pkey PRIMARY KEY (id);


--
-- TOC entry 3993 (class 2606 OID 33834)
-- Name: calendar_tasks calendar_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_tasks
    ADD CONSTRAINT calendar_tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 3998 (class 2606 OID 33857)
-- Name: challenge_completions challenge_completions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_completions
    ADD CONSTRAINT challenge_completions_pkey PRIMARY KEY (id);


--
-- TOC entry 4000 (class 2606 OID 33859)
-- Name: challenge_completions challenge_completions_user_id_challenge_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_completions
    ADD CONSTRAINT challenge_completions_user_id_challenge_id_key UNIQUE (user_id, challenge_id);


--
-- TOC entry 4045 (class 2606 OID 34054)
-- Name: crop_learning_events crop_learning_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crop_learning_events
    ADD CONSTRAINT crop_learning_events_pkey PRIMARY KEY (id);


--
-- TOC entry 4035 (class 2606 OID 34015)
-- Name: crop_mechanical_works crop_mechanical_works_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crop_mechanical_works
    ADD CONSTRAINT crop_mechanical_works_pkey PRIMARY KEY (id);


--
-- TOC entry 4040 (class 2606 OID 34031)
-- Name: custom_crops custom_crops_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_crops
    ADD CONSTRAINT custom_crops_pkey PRIMARY KEY (id);


--
-- TOC entry 3962 (class 2606 OID 33650)
-- Name: custom_plans custom_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_plans
    ADD CONSTRAINT custom_plans_pkey PRIMARY KEY (id);


--
-- TOC entry 3983 (class 2606 OID 33780)
-- Name: garden_accessories garden_accessories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_accessories
    ADD CONSTRAINT garden_accessories_pkey PRIMARY KEY (id);


--
-- TOC entry 3918 (class 2606 OID 33459)
-- Name: garden_beds garden_beds_
pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_beds
    ADD CONSTRAINT garden_beds_pkey PRIMARY KEY (id);


--
-- TOC entry 4063 (class 2606 OID 34152)
-- Name: garden_correlations garden_correlations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_correlations
    ADD CONSTRAINT garden_correlations_pkey PRIMARY KEY (id);


--
-- TOC entry 3979 (class 2606 OID 33757)
-- Name: garden_obstacles garden_obstacles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_obstacles
    ADD CONSTRAINT garden_obstacles_pkey PRIMARY KEY (id);


--
-- TOC entry 4059 (class 2606 OID 34131)
-- Name: garden_patterns garden_patterns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_patterns
    ADD CONSTRAINT garden_patterns_pkey PRIMARY KEY (id);


--
-- TOC entry 4067 (class 2606 OID 34174)
-- Name: garden_season_analyses garden_season_analyses_garden_id_season_year_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_season_analyses
    ADD CONSTRAINT garden_season_analyses_garden_id_season_year_key UNIQUE (garden_id, season, year);


--
-- TOC entry 4069 (class 2606 OID 34172)
-- Name: garden_season_analyses garden_season_analyses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_season_analyses
    ADD CONSTRAINT garden_season_analyses_pkey PRIMARY KEY (id);


--
-- TOC entry 3926 (class 2606 OID 33513)
-- Name: garden_tasks garden_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_tasks
    ADD CONSTRAINT garden_tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 4055 (class 2606 OID 34109)
-- Name: garden_tree_memories garden_tree_memories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_tree_memories
    ADD CONSTRAINT garden_tree_memories_pkey PRIMARY KEY (id);


--
-- TOC entry 4051 (class 2606 OID 34086)
-- Name: garden_zone_memories garden_zone_memories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_zone_memories
    ADD CONSTRAINT garden_zone_memories_pkey PRIMARY KEY (id);


--
-- TOC entry 3914 (class 2606 OID 33437)
-- Name: gardens gardens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gardens
    ADD CONSTRAINT gardens_pkey PRIMARY KEY (id);


--
-- TOC entry 3935 (class 2606 OID 33542)
-- Name: harvest_logs harvest_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.harvest_logs
    ADD CONSTRAINT harvest_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3987 (class 2606 OID 33798)
-- Name: hydroponic_readings hydroponic_readings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hydroponic_readings
    ADD CONSTRAINT hydroponic_readings_pkey PRIMARY KEY (id);


--
-- TOC entry 4033 (class 2606 OID 33989)
-- Name: mechanical_work_register mechanical_work_register_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mechanical_work_register
    ADD CONSTRAINT mechanical_work_register_pkey PRIMARY KEY (id);


--
-- TOC entry 3944 (class 2606 OID 33565)
-- Name: photo_logs photo_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photo_logs
    ADD CONSTRAINT photo_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4021 (class 2606 OID 33938)
-- Name: professional_analytics professional_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_analytics
    ADD CONSTRAINT professional_analytics_pkey PRIMARY KEY (id);


--
-- TOC entry 4011 (class 2606 OID 33905)
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 3949 (class 2606 OID 33591)
-- Name: seed_inventory seed_inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seed_inventory
    ADD CONSTRAINT seed_inventory_pkey PRIMARY KEY (id);



--
-- TOC entry 3954 (class 2606 OID 33618)
-- Name: seedling_batches seedling_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seedling_batches
    ADD CONSTRAINT seedling_batches_pkey PRIMARY KEY (id);


--
-- TOC entry 4027 (class 2606 OID 33964)
-- Name: treatment_register treatment_register_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treatment_register
    ADD CONSTRAINT treatment_register_pkey PRIMARY KEY (id);


--
-- TOC entry 4007 (class 2606 OID 33876)
-- Name: user_badges user_badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_pkey PRIMARY KEY (id);


--
-- TOC entry 4009 (class 2606 OID 33878)
-- Name: user_badges user_badges_user_id_badge_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_badge_id_key UNIQUE (user_id, badge_id);


--
-- TOC entry 3958 (class 2606 OID 33637)
-- Name: weather_cache weather_cache_lat_lng_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weather_cache
    ADD CONSTRAINT weather_cache_lat_lng_date_key UNIQUE (lat_lng, date);


--
-- TOC entry 3960 (class 2606 OID 33635)
-- Name: weather_cache weather_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weather_cache
    ADD CONSTRAINT weather_cache_pkey PRIMARY KEY (id);


--
-- TOC entry 3984 (class 1259 OID 33787)
-- Name: idx_accessories_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_accessories_category ON public.garden_accessories USING btree (category);


--
-- TOC entry 3985 (class 1259 OID 33786)
-- Name: idx_accessories_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_accessories_garden_id ON public.garden_accessories USING btree (garden_id);


--
-- TOC entry 3976 (class 1259 OID 33737)
-- Name: idx_advice_consultation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_advice_consultation_id ON public.agronomist_advice USING btree (consultation_id);


--
-- TOC entry 3977 (class 1259 OID 33738)
-- Name: idx_advice_task_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_advice_task_id ON public.agronomist_advice USING btree (task_id);


--
-- TOC entry 3968 (class 1259 OID 33681)
-- Name: idx_agronomists_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agronomists_user_id ON public.agronomists USING btree (user_id);


--
-- TOC entry 3991 (class 1259 OID 33821)
-- Name: idx_aquaponic_readings_garden_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_aquaponic_readings_garden_date ON public.aquaponic_readings USING btree (garden_id, reading_date DESC);


--
-- TOC entry 3922 (class 1259 OID 33491)
-- Name: idx_bed_history_bed_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bed_history_bed_id ON public.bed_planting_history USING btree (bed_id);


--
-- TOC entry 3923 (class 1259 OID 33493)
-- Name: idx_bed_history_plant_family; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bed_history_plant_family ON public.bed_planting_history USING btree (plant_family);


--
-- TOC entry 3924 (class 1259 OID 33492)
-- Name: idx_bed_history_year_season; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bed_history_year_season ON public.bed_planting_history USING btree (year, season);


--
-- TOC entry 3994 (class 1259 OID 33846)
-- Name: idx_calendar_tasks_garden; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_calendar_tasks_garden ON public.calendar_tasks USING btree (garden_id);


--
-- TOC entry 3995 (class 1259 OID 33847)
-- Name: idx_calendar_tasks_recurring; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_calendar_tasks_recurring ON public.calendar_tasks USING btree (recurring) WHERE (recurring = true);


--
-- TOC entry 3996 (class 1259 OID 33845)
-- Name: idx_calendar_tasks_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_calendar_tasks_user_date ON public.calendar_tasks
 USING btree (user_id, start_date);


--
-- TOC entry 4001 (class 1259 OID 33867)
-- Name: idx_challenge_completions_challenge; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_challenge_completions_challenge ON public.challenge_completions USING btree (challenge_id);


--
-- TOC entry 4002 (class 1259 OID 33866)
-- Name: idx_challenge_completions_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_challenge_completions_date ON public.challenge_completions USING btree (completed_at);


--
-- TOC entry 4003 (class 1259 OID 33865)
-- Name: idx_challenge_completions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_challenge_completions_user ON public.challenge_completions USING btree (user_id);


--
-- TOC entry 3971 (class 1259 OID 33712)
-- Name: idx_consultations_agronomist_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_consultations_agronomist_id ON public.agronomist_consultations USING btree (agronomist_id);


--
-- TOC entry 3972 (class 1259 OID 33714)
-- Name: idx_consultations_task_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_consultations_task_id ON public.agronomist_consultations USING btree (task_id);


--
-- TOC entry 3973 (class 1259 OID 33713)
-- Name: idx_consultations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_consultations_user_id ON public.agronomist_consultations USING btree (user_id);


--
-- TOC entry 4064 (class 1259 OID 34187)
-- Name: idx_correlations_custom_crop_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_correlations_custom_crop_id ON public.garden_correlations USING btree (custom_crop_id);


--
-- TOC entry 4065 (class 1259 OID 34186)
-- Name: idx_correlations_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_correlations_garden_id ON public.garden_correlations USING btree (garden_id);


--
-- TOC entry 4014 (class 1259 OID 33927)
-- Name: idx_credit_transactions_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_credit_transactions_created ON public.ai_credit_transactions USING btree (created_at DESC);


--
-- TOC entry 4015 (class 1259 OID 33926)
-- Name: idx_credit_transactions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_credit_transactions_user ON public.ai_credit_transactions USING btree (user_id);


--
-- TOC entry 4036 (class 1259 OID 34016)
-- Name: idx_crop_mechanical_works_crop_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crop_mechanical_works_crop_id ON public.crop_mechanical_works USING btree (crop_id);


--
-- TOC entry 4037 (class 1259 OID 34018)
-- Name: idx_crop_mechanical_works_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crop_mechanical_works_priority ON public.crop_mechanical_works USING btree (priority DESC);


--
-- TOC entry 4038 (class 1259 OID 34017)
-- Name: idx_crop_mechanical_works_work_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crop_mechanical_works_work_type ON public.crop_mechanical_works USING btree (work_type);


--
-- TOC entry 4041 (class 1259 OID 34044)
-- Name: idx_custom_crops_common_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_custom_crops_common_name ON public.custom_crops USING btree (common_name);


--
-- TOC entry 4042 (class 1259 OID 34043)
-- Name: idx_custom_crops_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_custom_crops_garden_id ON public.custom_crops USING btree (garden_id);


--
-- TOC entry 4043 (class 1259 OID 34042)
-- Name: idx_custom_crops_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_custom_crops_user_id ON public.custom_crops USING btree (user_id);


--
-- TOC entry 3963 (class 1259 OID 33663)
-- Name: idx_custom_plans_base_master_sheet; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_custom_plans_base_master_sheet ON public.custom_plans USING btree (base_master_sheet_id);


--
-- TOC entry 3964 (class 1259 OID 33662)
-- Name: idx_custom_plans_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_custom_plans_garden
_id ON public.custom_plans USING btree (garden_id);


--
-- TOC entry 3965 (class 1259 OID 33661)
-- Name: idx_custom_plans_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_custom_plans_user_id ON public.custom_plans USING btree (user_id);


--
-- TOC entry 3919 (class 1259 OID 33475)
-- Name: idx_garden_beds_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garden_beds_garden_id ON public.garden_beds USING btree (garden_id);


--
-- TOC entry 3980 (class 1259 OID 33764)
-- Name: idx_garden_obstacles_azimuth; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garden_obstacles_azimuth ON public.garden_obstacles USING btree (azimuth);


--
-- TOC entry 3981 (class 1259 OID 33763)
-- Name: idx_garden_obstacles_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garden_obstacles_garden_id ON public.garden_obstacles USING btree (garden_id);


--
-- TOC entry 3927 (class 1259 OID 33525)
-- Name: idx_garden_tasks_bed_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garden_tasks_bed_id ON public.garden_tasks USING btree (bed_id);


--
-- TOC entry 3928 (class 1259 OID 33527)
-- Name: idx_garden_tasks_completed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garden_tasks_completed ON public.garden_tasks USING btree (completed);


--
-- TOC entry 3929 (class 1259 OID 33526)
-- Name: idx_garden_tasks_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garden_tasks_date ON public.garden_tasks USING btree (date);


--
-- TOC entry 3930 (class 1259 OID 33524)
-- Name: idx_garden_tasks_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garden_tasks_garden_id ON public.garden_tasks USING btree (garden_id);


--
-- TOC entry 3931 (class 1259 OID 33528)
-- Name: idx_garden_tasks_plant_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garden_tasks_plant_name ON public.garden_tasks USING btree (plant_name);


--
-- TOC entry 3932 (class 1259 OID 33529)
-- Name: idx_garden_tasks_suggested; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garden_tasks_suggested ON public.garden_tasks USING btree (is_suggested) WHERE (is_suggested = true);


--
-- TOC entry 3933 (class 1259 OID 33530)
-- Name: idx_garden_tasks_suggested_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garden_tasks_suggested_date ON public.garden_tasks USING btree (suggested_date) WHERE (suggested_date IS NOT NULL);


--
-- TOC entry 3915 (class 1259 OID 33444)
-- Name: idx_gardens_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gardens_created_at ON public.gardens USING btree (created_at);


--
-- TOC entry 3916 (class 1259 OID 33443)
-- Name: idx_gardens_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gardens_user_id ON public.gardens USING btree (user_id);


--
-- TOC entry 3936 (class 1259 OID 33553)
-- Name: idx_harvest_logs_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_harvest_logs_garden_id ON public.harvest_logs USING btree (garden_id);


--
-- TOC entry 3937 (class 1259 OID 33555)
-- Name: idx_harvest_logs_harvest_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_harvest_logs_harvest_date ON public.harvest_logs USING btree (harvest_date);


--
-- TOC entry 3938 (class 1259 OID 33556)
-- Name: idx_harvest_logs_plant_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_harvest_logs_plant_name ON public.harvest_logs USING btree (plant_name);


--
-- TOC entry 3939 (class 1259 OID 33554)
-- Name: idx_harvest_logs_task_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_harvest_logs_task_id ON public.harvest_logs USING btree (task_id);


--
-- TOC entry 3988 (class 1259 OID 33804)
-- Name: idx_hydroponic_readings_garden_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hydroponic_readings_garden_date ON public.hydroponic_readings USING btree (garden_id, reading_date DESC);


--
-- TOC entry 4046 (class 1259 OID 34073)
-- Name: idx_learning_events_created_at; Type: INDEX; Schema: public; Owner: -

--

CREATE INDEX idx_learning_events_created_at ON public.crop_learning_events USING btree (created_at DESC);


--
-- TOC entry 4047 (class 1259 OID 34070)
-- Name: idx_learning_events_crop_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_learning_events_crop_id ON public.crop_learning_events USING btree (custom_crop_id);


--
-- TOC entry 4048 (class 1259 OID 34072)
-- Name: idx_learning_events_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_learning_events_type ON public.crop_learning_events USING btree (event_type);


--
-- TOC entry 4049 (class 1259 OID 34071)
-- Name: idx_learning_events_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_learning_events_user_id ON public.crop_learning_events USING btree (user_id);


--
-- TOC entry 4028 (class 1259 OID 34001)
-- Name: idx_mechanical_work_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mechanical_work_date ON public.mechanical_work_register USING btree (work_date DESC);


--
-- TOC entry 4029 (class 1259 OID 34002)
-- Name: idx_mechanical_work_garden; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mechanical_work_garden ON public.mechanical_work_register USING btree (garden_id);


--
-- TOC entry 4030 (class 1259 OID 34003)
-- Name: idx_mechanical_work_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mechanical_work_type ON public.mechanical_work_register USING btree (work_type);


--
-- TOC entry 4031 (class 1259 OID 34000)
-- Name: idx_mechanical_work_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mechanical_work_user ON public.mechanical_work_register USING btree (user_id);


--
-- TOC entry 4060 (class 1259 OID 34185)
-- Name: idx_patterns_custom_crop_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patterns_custom_crop_id ON public.garden_patterns USING btree (custom_crop_id);


--
-- TOC entry 4061 (class 1259 OID 34184)
-- Name: idx_patterns_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patterns_garden_id ON public.garden_patterns USING btree (garden_id);


--
-- TOC entry 3940 (class 1259 OID 33577)
-- Name: idx_photo_logs_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_photo_logs_garden_id ON public.photo_logs USING btree (garden_id);


--
-- TOC entry 3941 (class 1259 OID 33578)
-- Name: idx_photo_logs_photo_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_photo_logs_photo_date ON public.photo_logs USING btree (photo_date);


--
-- TOC entry 3942 (class 1259 OID 33576)
-- Name: idx_photo_logs_task_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_photo_logs_task_id ON public.photo_logs USING btree (task_id);


--
-- TOC entry 4016 (class 1259 OID 33952)
-- Name: idx_professional_analytics_crop; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_analytics_crop ON public.professional_analytics USING btree (crop_name);


--
-- TOC entry 4017 (class 1259 OID 33950)
-- Name: idx_professional_analytics_garden; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_analytics_garden ON public.professional_analytics USING btree (garden_id);


--
-- TOC entry 4018 (class 1259 OID 33949)
-- Name: idx_professional_analytics_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_analytics_user ON public.professional_analytics USING btree (user_id);


--
-- TOC entry 4019 (class 1259 OID 33951)
-- Name: idx_professional_analytics_year; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_analytics_year ON public.professional_analytics USING btree (year);


--
-- TOC entry 4070 (class 1259 OID 34188)
-- Name: idx_season_analyses_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_season_analyses_garden_id ON public.garden_season_analyses USING btree (garden_id);


--
-- TOC entry 3945 (class 1259 OID 33604)
-- Name: idx_seed_inventory_expiry_year; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_seed_inventory_expiry_year ON public.seed_inventory USING btree (expiry_ye
ar);


--
-- TOC entry 3946 (class 1259 OID 33603)
-- Name: idx_seed_inventory_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_seed_inventory_garden_id ON public.seed_inventory USING btree (garden_id);


--
-- TOC entry 3947 (class 1259 OID 33602)
-- Name: idx_seed_inventory_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_seed_inventory_user_id ON public.seed_inventory USING btree (user_id);


--
-- TOC entry 3950 (class 1259 OID 33624)
-- Name: idx_seedling_batches_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_seedling_batches_garden_id ON public.seedling_batches USING btree (garden_id);


--
-- TOC entry 3951 (class 1259 OID 33626)
-- Name: idx_seedling_batches_phase; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_seedling_batches_phase ON public.seedling_batches USING btree (phase);


--
-- TOC entry 3952 (class 1259 OID 33625)
-- Name: idx_seedling_batches_sowing_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_seedling_batches_sowing_date ON public.seedling_batches USING btree (sowing_date);


--
-- TOC entry 4022 (class 1259 OID 33978)
-- Name: idx_treatment_register_crop; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_treatment_register_crop ON public.treatment_register USING btree (crop_name);


--
-- TOC entry 4023 (class 1259 OID 33976)
-- Name: idx_treatment_register_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_treatment_register_date ON public.treatment_register USING btree (treatment_date DESC);


--
-- TOC entry 4024 (class 1259 OID 33977)
-- Name: idx_treatment_register_garden; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_treatment_register_garden ON public.treatment_register USING btree (garden_id);


--
-- TOC entry 4025 (class 1259 OID 33975)
-- Name: idx_treatment_register_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_treatment_register_user ON public.treatment_register USING btree (user_id);


--
-- TOC entry 4056 (class 1259 OID 34183)
-- Name: idx_tree_memories_custom_crop_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tree_memories_custom_crop_id ON public.garden_tree_memories USING btree (custom_crop_id);


--
-- TOC entry 4057 (class 1259 OID 34182)
-- Name: idx_tree_memories_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tree_memories_garden_id ON public.garden_tree_memories USING btree (garden_id);


--
-- TOC entry 4004 (class 1259 OID 33885)
-- Name: idx_user_badges_earned; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_badges_earned ON public.user_badges USING btree (earned_at);


--
-- TOC entry 4005 (class 1259 OID 33884)
-- Name: idx_user_badges_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_badges_user ON public.user_badges USING btree (user_id);


--
-- TOC entry 3955 (class 1259 OID 33639)
-- Name: idx_weather_cache_cached_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weather_cache_cached_at ON public.weather_cache USING btree (cached_at);


--
-- TOC entry 3956 (class 1259 OID 33638)
-- Name: idx_weather_cache_lat_lng_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weather_cache_lat_lng_date ON public.weather_cache USING btree (lat_lng, date);


--
-- TOC entry 4052 (class 1259 OID 34181)
-- Name: idx_zone_memories_custom_crop_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_zone_memories_custom_crop_id ON public.garden_zone_memories USING btree (custom_crop_id);


--
-- TOC entry 4053 (class 1259 OID 34180)
-- Name: idx_zone_memories_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_zone_memories_garden_id ON public.garden_zone_memories USING btree (garden_id);


--
-- TOC entry 4130 (class 2620 OID 34201)
-- Name: agronomists update_agronomists_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_agronomists_updated_at BEFORE UPDATE ON public.agronomists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4132 (class 2620 OID 3
4203)
-- Name: calendar_tasks update_calendar_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_calendar_tasks_updated_at BEFORE UPDATE ON public.calendar_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4133 (class 2620 OID 34437)
-- Name: custom_crops update_custom_crops_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_custom_crops_timestamp BEFORE UPDATE ON public.custom_crops FOR EACH ROW EXECUTE FUNCTION public.update_custom_crops_updated_at();


--
-- TOC entry 4134 (class 2620 OID 34204)
-- Name: custom_crops update_custom_crops_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_custom_crops_updated_at BEFORE UPDATE ON public.custom_crops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4129 (class 2620 OID 34200)
-- Name: custom_plans update_custom_plans_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_custom_plans_updated_at BEFORE UPDATE ON public.custom_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4125 (class 2620 OID 34196)
-- Name: garden_beds update_garden_beds_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_garden_beds_updated_at BEFORE UPDATE ON public.garden_beds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4131 (class 2620 OID 34202)
-- Name: garden_obstacles update_garden_obstacles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_garden_obstacles_updated_at BEFORE UPDATE ON public.garden_obstacles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4126 (class 2620 OID 34197)
-- Name: garden_tasks update_garden_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_garden_tasks_updated_at BEFORE UPDATE ON public.garden_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4124 (class 2620 OID 34195)
-- Name: gardens update_gardens_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_gardens_updated_at BEFORE UPDATE ON public.gardens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4127 (class 2620 OID 34198)
-- Name: seed_inventory update_seed_inventory_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_seed_inventory_updated_at BEFORE UPDATE ON public.seed_inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4128 (class 2620 OID 34199)
-- Name: seedling_batches update_seedling_batches_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_seedling_batches_updated_at BEFORE UPDATE ON public.seedling_batches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4092 (class 2606 OID 33727)
-- Name: agronomist_advice agronomist_advice_consultation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agronomist_advice
    ADD CONSTRAINT agronomist_advice_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.agronomist_consultations(id) ON DELETE CASCADE;


--
-- TOC entry 4093 (class 2606 OID 33732)
-- Name: agronomist_advice agronomist_advice_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agronomist_advice
    ADD CONSTRAINT agronomist_advice_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.garden_tasks(id) ON DELETE SET NULL;


--
-- TOC entry 4088 (class 2606 OID 33692)
-- Name: agronomist_consultations agronomist_consultations_agronomist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agronomist_consultations
    ADD CONSTRAINT agronomist_consultations_agronomist_id_fkey FOREIGN KEY (agronomist_id) REFERENCES public.agronomists(id) ON DELETE CASCADE;


--
-- TOC entry 4089 (class 2606 OID 33702)
-- Name: agronomist_consultations agronomist_consultations_garden_id_fkey; Type: FK CONSTRA
INT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agronomist_consultations
    ADD CONSTRAINT agronomist_consultations_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE SET NULL;


--
-- TOC entry 4090 (class 2606 OID 33707)
-- Name: agronomist_consultations agronomist_consultations_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agronomist_consultations
    ADD CONSTRAINT agronomist_consultations_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.garden_tasks(id) ON DELETE SET NULL;


--
-- TOC entry 4091 (class 2606 OID 33697)
-- Name: agronomist_consultations agronomist_consultations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agronomist_consultations
    ADD CONSTRAINT agronomist_consultations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4087 (class 2606 OID 33676)
-- Name: agronomists agronomists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agronomists
    ADD CONSTRAINT agronomists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4103 (class 2606 OID 33921)
-- Name: ai_credit_transactions ai_credit_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_credit_transactions
    ADD CONSTRAINT ai_credit_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4097 (class 2606 OID 33816)
-- Name: aquaponic_readings aquaponic_readings_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aquaponic_readings
    ADD CONSTRAINT aquaponic_readings_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4075 (class 2606 OID 33486)
-- Name: bed_planting_history bed_planting_history_bed_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bed_planting_history
    ADD CONSTRAINT bed_planting_history_bed_id_fkey FOREIGN KEY (bed_id) REFERENCES public.garden_beds(id) ON DELETE CASCADE;


--
-- TOC entry 4098 (class 2606 OID 33840)
-- Name: calendar_tasks calendar_tasks_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_tasks
    ADD CONSTRAINT calendar_tasks_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4099 (class 2606 OID 33835)
-- Name: calendar_tasks calendar_tasks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_tasks
    ADD CONSTRAINT calendar_tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4100 (class 2606 OID 33860)
-- Name: challenge_completions challenge_completions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_completions
    ADD CONSTRAINT challenge_completions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4112 (class 2606 OID 34055)
-- Name: crop_learning_events crop_learning_events_custom_crop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crop_learning_events
    ADD CONSTRAINT crop_learning_events_custom_crop_id_fkey FOREIGN KEY (custom_crop_id) REFERENCES public.custom_crops(id) ON DELETE CASCADE;


--
-- TOC entry 4113 (class 2606 OID 34065)
-- Name: crop_learning_events crop_learning_events_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crop_learning_events
    ADD CONSTRAINT crop_learning_events_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE SET NULL;


--
-- TOC entry 4114 (class 2606 OID 34060)
-- Name: crop_learning_events crop_learning_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crop_learning_events
    ADD CONSTRAINT crop_learning_events_user_id_fkey FOREIGN
 KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4110 (class 2606 OID 34037)
-- Name: custom_crops custom_crops_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_crops
    ADD CONSTRAINT custom_crops_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE SET NULL;


--
-- TOC entry 4111 (class 2606 OID 34032)
-- Name: custom_crops custom_crops_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_crops
    ADD CONSTRAINT custom_crops_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4085 (class 2606 OID 33656)
-- Name: custom_plans custom_plans_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_plans
    ADD CONSTRAINT custom_plans_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE SET NULL;


--
-- TOC entry 4086 (class 2606 OID 33651)
-- Name: custom_plans custom_plans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_plans
    ADD CONSTRAINT custom_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4095 (class 2606 OID 33781)
-- Name: garden_accessories garden_accessories_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_accessories
    ADD CONSTRAINT garden_accessories_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4072 (class 2606 OID 33470)
-- Name: garden_beds garden_beds_covering_structure_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_beds
    ADD CONSTRAINT garden_beds_covering_structure_id_fkey FOREIGN KEY (covering_structure_id) REFERENCES public.gardens(id) ON DELETE SET NULL;


--
-- TOC entry 4073 (class 2606 OID 33460)
-- Name: garden_beds garden_beds_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_beds
    ADD CONSTRAINT garden_beds_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4074 (class 2606 OID 33465)
-- Name: garden_beds garden_beds_structure_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_beds
    ADD CONSTRAINT garden_beds_structure_id_fkey FOREIGN KEY (structure_id) REFERENCES public.gardens(id) ON DELETE SET NULL;


--
-- TOC entry 4121 (class 2606 OID 34158)
-- Name: garden_correlations garden_correlations_custom_crop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_correlations
    ADD CONSTRAINT garden_correlations_custom_crop_id_fkey FOREIGN KEY (custom_crop_id) REFERENCES public.custom_crops(id) ON DELETE SET NULL;


--
-- TOC entry 4122 (class 2606 OID 34153)
-- Name: garden_correlations garden_correlations_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_correlations
    ADD CONSTRAINT garden_correlations_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4094 (class 2606 OID 33758)
-- Name: garden_obstacles garden_obstacles_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_obstacles
    ADD CONSTRAINT garden_obstacles_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4119 (class 2606 OID 34137)
-- Name: garden_patterns garden_patterns_custom_crop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_patterns
    ADD CONSTRAINT garden_patterns_custom_crop_id_fkey FOREIGN KEY (custom_crop_id) REFERENCES public.custom_crops(id) ON DELETE SET NULL;


--
-- TOC entry 4120 (class 2606 OID 34132)
-- Name: garden_patterns garden_patterns_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_patterns
    ADD CONSTRAINT garden_pa
tterns_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4123 (class 2606 OID 34175)
-- Name: garden_season_analyses garden_season_analyses_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_season_analyses
    ADD CONSTRAINT garden_season_analyses_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4076 (class 2606 OID 33519)
-- Name: garden_tasks garden_tasks_bed_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_tasks
    ADD CONSTRAINT garden_tasks_bed_id_fkey FOREIGN KEY (bed_id) REFERENCES public.garden_beds(id) ON DELETE SET NULL;


--
-- TOC entry 4077 (class 2606 OID 33514)
-- Name: garden_tasks garden_tasks_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_tasks
    ADD CONSTRAINT garden_tasks_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4117 (class 2606 OID 34115)
-- Name: garden_tree_memories garden_tree_memories_custom_crop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_tree_memories
    ADD CONSTRAINT garden_tree_memories_custom_crop_id_fkey FOREIGN KEY (custom_crop_id) REFERENCES public.custom_crops(id) ON DELETE SET NULL;


--
-- TOC entry 4118 (class 2606 OID 34110)
-- Name: garden_tree_memories garden_tree_memories_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_tree_memories
    ADD CONSTRAINT garden_tree_memories_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4115 (class 2606 OID 34092)
-- Name: garden_zone_memories garden_zone_memories_custom_crop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_zone_memories
    ADD CONSTRAINT garden_zone_memories_custom_crop_id_fkey FOREIGN KEY (custom_crop_id) REFERENCES public.custom_crops(id) ON DELETE SET NULL;


--
-- TOC entry 4116 (class 2606 OID 34087)
-- Name: garden_zone_memories garden_zone_memories_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_zone_memories
    ADD CONSTRAINT garden_zone_memories_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4071 (class 2606 OID 33438)
-- Name: gardens gardens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gardens
    ADD CONSTRAINT gardens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4078 (class 2606 OID 33543)
-- Name: harvest_logs harvest_logs_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.harvest_logs
    ADD CONSTRAINT harvest_logs_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4079 (class 2606 OID 33548)
-- Name: harvest_logs harvest_logs_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.harvest_logs
    ADD CONSTRAINT harvest_logs_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.garden_tasks(id) ON DELETE SET NULL;


--
-- TOC entry 4096 (class 2606 OID 33799)
-- Name: hydroponic_readings hydroponic_readings_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hydroponic_readings
    ADD CONSTRAINT hydroponic_readings_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4108 (class 2606 OID 33995)
-- Name: mechanical_work_register mechanical_work_register_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mechanical_work_register
    ADD CONSTRAINT mechanical_work_register_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4109 (class 2606 OID 33990)
-- Name: mechanical_work_register mechanical_work_regis
ter_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mechanical_work_register
    ADD CONSTRAINT mechanical_work_register_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4080 (class 2606 OID 33571)
-- Name: photo_logs photo_logs_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photo_logs
    ADD CONSTRAINT photo_logs_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4081 (class 2606 OID 33566)
-- Name: photo_logs photo_logs_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photo_logs
    ADD CONSTRAINT photo_logs_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.garden_tasks(id) ON DELETE CASCADE;


--
-- TOC entry 4104 (class 2606 OID 33944)
-- Name: professional_analytics professional_analytics_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_analytics
    ADD CONSTRAINT professional_analytics_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4105 (class 2606 OID 33939)
-- Name: professional_analytics professional_analytics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_analytics
    ADD CONSTRAINT professional_analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4102 (class 2606 OID 33906)
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4082 (class 2606 OID 33597)
-- Name: seed_inventory seed_inventory_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seed_inventory
    ADD CONSTRAINT seed_inventory_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4083 (class 2606 OID 33592)
-- Name: seed_inventory seed_inventory_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seed_inventory
    ADD CONSTRAINT seed_inventory_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4084 (class 2606 OID 33619)
-- Name: seedling_batches seedling_batches_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seedling_batches
    ADD CONSTRAINT seedling_batches_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4106 (class 2606 OID 33970)
-- Name: treatment_register treatment_register_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treatment_register
    ADD CONSTRAINT treatment_register_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4107 (class 2606 OID 33965)
-- Name: treatment_register treatment_register_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treatment_register
    ADD CONSTRAINT treatment_register_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4101 (class 2606 OID 33879)
-- Name: user_badges user_badges_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4346 (class 3256 OID 34237)
-- Name: crop_mechanical_works Crop mechanical works are publicly readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Crop mechanical works are publicly readable" ON public.crop_mechanical_works FOR SELECT USING (true);


--
-- TOC entry 4338 (class 3256 OID 34229)
-- Name: garden_accessories Users can access accessories in their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE 
POLICY "Users can access accessories in their gardens" ON public.garden_accessories USING ((EXISTS ( SELECT 1
   FROM public.gardens
  WHERE ((gardens.id = garden_accessories.garden_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4340 (class 3256 OID 34231)
-- Name: aquaponic_readings Users can access aquaponic readings in their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can access aquaponic readings in their gardens" ON public.aquaponic_readings USING ((EXISTS ( SELECT 1
   FROM public.gardens
  WHERE ((gardens.id = aquaponic_readings.garden_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4339 (class 3256 OID 34230)
-- Name: hydroponic_readings Users can access hydroponic readings in their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can access hydroponic readings in their gardens" ON public.hydroponic_readings USING ((EXISTS ( SELECT 1
   FROM public.gardens
  WHERE ((gardens.id = hydroponic_readings.garden_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4323 (class 3256 OID 34214)
-- Name: seedling_batches Users can access seedling batches in their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can access seedling batches in their gardens" ON public.seedling_batches USING ((EXISTS ( SELECT 1
   FROM public.gardens
  WHERE ((gardens.id = seedling_batches.garden_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4335 (class 3256 OID 34226)
-- Name: garden_obstacles Users can create obstacles in their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create obstacles in their gardens" ON public.garden_obstacles FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.gardens
  WHERE ((gardens.id = garden_obstacles.garden_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4327 (class 3256 OID 34218)
-- Name: custom_plans Users can create their own custom plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own custom plans" ON public.custom_plans FOR INSERT WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4337 (class 3256 OID 34228)
-- Name: garden_obstacles Users can delete obstacles in their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete obstacles in their gardens" ON public.garden_obstacles FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.gardens
  WHERE ((gardens.id = garden_obstacles.garden_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4350 (class 3256 OID 34243)
-- Name: calendar_tasks Users can delete their own calendar tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own calendar tasks" ON public.calendar_tasks FOR DELETE USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4329 (class 3256 OID 34220)
-- Name: custom_plans Users can delete their own custom plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own custom plans" ON public.custom_plans FOR DELETE USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4355 (class 3256 OID 34248)
-- Name: user_badges Users can insert their own badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own badges" ON public.user_badges FOR INSERT WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4348 (class 3256 OID 34241)
-- Name: calendar_tasks Users can insert their own calendar tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own calendar tasks" ON public.calendar_tasks FOR INSERT WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4352 (class 3256 OID 34245)
-- Name: challenge_completions Users can insert their own challenge completions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own challenge completions" ON public.challenge_completions 
FOR INSERT WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4325 (class 3256 OID 34216)
-- Name: weather_cache Users can insert weather cache; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert weather cache" ON public.weather_cache FOR INSERT WITH CHECK (true);


--
-- TOC entry 4330 (class 3256 OID 34221)
-- Name: agronomists Users can manage their own agronomists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own agronomists" ON public.agronomists USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4331 (class 3256 OID 34222)
-- Name: agronomist_consultations Users can manage their own consultations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own consultations" ON public.agronomist_consultations USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4361 (class 3256 OID 34527)
-- Name: garden_correlations Users can manage their own correlations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own correlations" ON public.garden_correlations USING ((( SELECT auth.uid() AS uid) IN ( SELECT gardens.user_id
   FROM public.gardens
  WHERE (gardens.id = garden_correlations.garden_id))));


--
-- TOC entry 4356 (class 3256 OID 34438)
-- Name: custom_crops Users can manage their own custom crops; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own custom crops" ON public.custom_crops USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4357 (class 3256 OID 34439)
-- Name: crop_learning_events Users can manage their own learning events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own learning events" ON public.crop_learning_events USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4360 (class 3256 OID 34526)
-- Name: garden_patterns Users can manage their own patterns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own patterns" ON public.garden_patterns USING ((( SELECT auth.uid() AS uid) IN ( SELECT gardens.user_id
   FROM public.gardens
  WHERE (gardens.id = garden_patterns.garden_id))));


--
-- TOC entry 4362 (class 3256 OID 34528)
-- Name: garden_season_analyses Users can manage their own season analyses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own season analyses" ON public.garden_season_analyses USING ((( SELECT auth.uid() AS uid) IN ( SELECT gardens.user_id
   FROM public.gardens
  WHERE (gardens.id = garden_season_analyses.garden_id))));


--
-- TOC entry 4359 (class 3256 OID 34525)
-- Name: garden_tree_memories Users can manage their own tree memories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own tree memories" ON public.garden_tree_memories USING ((( SELECT auth.uid() AS uid) IN ( SELECT gardens.user_id
   FROM public.gardens
  WHERE (gardens.id = garden_tree_memories.garden_id))));


--
-- TOC entry 4358 (class 3256 OID 34524)
-- Name: garden_zone_memories Users can manage their own zone memories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own zone memories" ON public.garden_zone_memories USING ((( SELECT auth.uid() AS uid) IN ( SELECT gardens.user_id
   FROM public.gardens
  WHERE (gardens.id = garden_zone_memories.garden_id))));


--
-- TOC entry 4317 (class 3256 OID 34207)
-- Name: garden_beds Users can only access beds in their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only access beds in their gardens" ON public.garden_beds USING ((EXISTS ( SELECT 1
   FROM public.gardens
  WHERE ((gardens.id = garden_beds.garden_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4320 (class 3256 OID 34211)
-- Name: harvest_logs Users can only access harvests in their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only access harvests in their gardens" ON public.harvest_logs USING ((EXISTS ( SELECT 1
   FROM pu
blic.gardens
  WHERE ((gardens.id = harvest_logs.garden_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4318 (class 3256 OID 34208)
-- Name: bed_planting_history Users can only access history in their beds; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only access history in their beds" ON public.bed_planting_history USING ((EXISTS ( SELECT 1
   FROM (public.garden_beds
     JOIN public.gardens ON ((gardens.id = garden_beds.garden_id)))
  WHERE ((garden_beds.id = bed_planting_history.bed_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4321 (class 3256 OID 34212)
-- Name: photo_logs Users can only access photos in their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only access photos in their gardens" ON public.photo_logs USING ((EXISTS ( SELECT 1
   FROM public.gardens
  WHERE ((gardens.id = photo_logs.garden_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4319 (class 3256 OID 34210)
-- Name: garden_tasks Users can only access tasks in their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only access tasks in their gardens" ON public.garden_tasks USING ((EXISTS ( SELECT 1
   FROM public.gardens
  WHERE ((gardens.id = garden_tasks.garden_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4316 (class 3256 OID 34206)
-- Name: gardens Users can only access their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only access their gardens" ON public.gardens USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4343 (class 3256 OID 34234)
-- Name: professional_analytics Users can only access their own analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only access their own analytics" ON public.professional_analytics USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4345 (class 3256 OID 34236)
-- Name: mechanical_work_register Users can only access their own mechanical work; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only access their own mechanical work" ON public.mechanical_work_register USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4341 (class 3256 OID 34232)
-- Name: profiles Users can only access their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only access their own profile" ON public.profiles USING ((( SELECT auth.uid() AS uid) = id));


--
-- TOC entry 4322 (class 3256 OID 34213)
-- Name: seed_inventory Users can only access their own seeds; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only access their own seeds" ON public.seed_inventory USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4342 (class 3256 OID 34233)
-- Name: ai_credit_transactions Users can only access their own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only access their own transactions" ON public.ai_credit_transactions USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4344 (class 3256 OID 34235)
-- Name: treatment_register Users can only access their own treatments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only access their own treatments" ON public.treatment_register USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4333 (class 3256 OID 34224)
-- Name: agronomist_advice Users can update advice from their consultations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update advice from their consultations" ON public.agronomist_advice FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.agronomist_consultations
  WHERE ((agronomist_consultations.id = agronomist_advice.consultation_id) AND (agronomist_consultations.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4336 (class 3256 OID 34227)
-- Name: garden_obstacles Users can update obstacles in their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "User
s can update obstacles in their gardens" ON public.garden_obstacles FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.gardens
  WHERE ((gardens.id = garden_obstacles.garden_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4349 (class 3256 OID 34242)
-- Name: calendar_tasks Users can update their own calendar tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own calendar tasks" ON public.calendar_tasks FOR UPDATE USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4353 (class 3256 OID 34246)
-- Name: challenge_completions Users can update their own challenge completions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own challenge completions" ON public.challenge_completions FOR UPDATE USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4328 (class 3256 OID 34219)
-- Name: custom_plans Users can update their own custom plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own custom plans" ON public.custom_plans FOR UPDATE USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4332 (class 3256 OID 34223)
-- Name: agronomist_advice Users can view advice from their consultations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view advice from their consultations" ON public.agronomist_advice FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.agronomist_consultations
  WHERE ((agronomist_consultations.id = agronomist_advice.consultation_id) AND (agronomist_consultations.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4334 (class 3256 OID 34225)
-- Name: garden_obstacles Users can view obstacles in their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view obstacles in their gardens" ON public.garden_obstacles FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.gardens
  WHERE ((gardens.id = garden_obstacles.garden_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4354 (class 3256 OID 34247)
-- Name: user_badges Users can view their own badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own badges" ON public.user_badges FOR SELECT USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4347 (class 3256 OID 34240)
-- Name: calendar_tasks Users can view their own calendar tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own calendar tasks" ON public.calendar_tasks FOR SELECT USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4351 (class 3256 OID 34244)
-- Name: challenge_completions Users can view their own challenge completions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own challenge completions" ON public.challenge_completions FOR SELECT USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4326 (class 3256 OID 34217)
-- Name: custom_plans Users can view their own or public custom plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own or public custom plans" ON public.custom_plans FOR SELECT USING (((( SELECT auth.uid() AS uid) = user_id) OR (is_public = true)));


--
-- TOC entry 4324 (class 3256 OID 34215)
-- Name: weather_cache Weather cache is publicly readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Weather cache is publicly readable" ON public.weather_cache FOR SELECT USING (true);


--
-- TOC entry 4295 (class 0 OID 33715)
-- Dependencies: 359
-- Name: agronomist_advice; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agronomist_advice ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4294 (class 0 OID 33682)
-- Dependencies: 358
-- Name: agronomist_consultations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agronomist_consultations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4293 (class 0 OID 33664)
-- Dependencies: 357
-- Name: agronomists; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agron
omists ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4304 (class 0 OID 33911)
-- Dependencies: 368
-- Name: ai_credit_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_credit_transactions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4299 (class 0 OID 33805)
-- Dependencies: 363
-- Name: aquaponic_readings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.aquaponic_readings ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4285 (class 0 OID 33476)
-- Dependencies: 349
-- Name: bed_planting_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bed_planting_history ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4300 (class 0 OID 33822)
-- Dependencies: 364
-- Name: calendar_tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.calendar_tasks ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4301 (class 0 OID 33848)
-- Dependencies: 365
-- Name: challenge_completions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4310 (class 0 OID 34045)
-- Dependencies: 374
-- Name: crop_learning_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crop_learning_events ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4308 (class 0 OID 34004)
-- Dependencies: 372
-- Name: crop_mechanical_works; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crop_mechanical_works ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4309 (class 0 OID 34019)
-- Dependencies: 373
-- Name: custom_crops; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.custom_crops ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4292 (class 0 OID 33640)
-- Dependencies: 356
-- Name: custom_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.custom_plans ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4297 (class 0 OID 33765)
-- Dependencies: 361
-- Name: garden_accessories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.garden_accessories ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4284 (class 0 OID 33445)
-- Dependencies: 348
-- Name: garden_beds; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.garden_beds ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4314 (class 0 OID 34142)
-- Dependencies: 378
-- Name: garden_correlations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.garden_correlations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4296 (class 0 OID 33739)
-- Dependencies: 360
-- Name: garden_obstacles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.garden_obstacles ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4313 (class 0 OID 34120)
-- Dependencies: 377
-- Name: garden_patterns; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.garden_patterns ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4315 (class 0 OID 34163)
-- Dependencies: 379
-- Name: garden_season_analyses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.garden_season_analyses ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4286 (class 0 OID 33494)
-- Dependencies: 350
-- Name: garden_tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.garden_tasks ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4312 (class 0 OID 34097)
-- Dependencies: 376
-- Name: garden_tree_memories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.garden_tree_memories ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4311 (class 0 OID 34074)
-- Dependencies: 375
-- Name: garden_zone_memories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.garden_zone_memories ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4283 (class 0 OID 33416)
-- Dependencies: 347
-- Name: gardens; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.gardens ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4287 (class 0 OID 33531)
-- Dependencies: 351
-- Name: harvest_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.harvest_logs ENABLE ROW LEVEL SECURITY
;

--
-- TOC entry 4298 (class 0 OID 33788)
-- Dependencies: 362
-- Name: hydroponic_readings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.hydroponic_readings ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4307 (class 0 OID 33979)
-- Dependencies: 371
-- Name: mechanical_work_register; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mechanical_work_register ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4288 (class 0 OID 33557)
-- Dependencies: 352
-- Name: photo_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.photo_logs ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4305 (class 0 OID 33928)
-- Dependencies: 369
-- Name: professional_analytics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.professional_analytics ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4303 (class 0 OID 33886)
-- Dependencies: 367
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4289 (class 0 OID 33579)
-- Dependencies: 353
-- Name: seed_inventory; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.seed_inventory ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4290 (class 0 OID 33605)
-- Dependencies: 354
-- Name: seedling_batches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.seedling_batches ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4306 (class 0 OID 33953)
-- Dependencies: 370
-- Name: treatment_register; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.treatment_register ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4302 (class 0 OID 33868)
-- Dependencies: 366
-- Name: user_badges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4291 (class 0 OID 33627)
-- Dependencies: 355
-- Name: weather_cache; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;

-- Completed on 2025-12-18 08:32:58 CET

--
-- PostgreSQL database dump complete
--

\unrestrict lZUddMIp2xZwmvhTAS1glY9trAZCgstpL3T0DoVqt2mN9kaBMafHbtcFbcAddVq

