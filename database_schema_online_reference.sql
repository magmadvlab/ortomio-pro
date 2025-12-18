--
-- PostgreSQL database dump - FIXED FOR SUPABASE
-- Corrected: gen_random_uuid() -> gen_random_uuid()
-- Added: Missing trigger for new user credits
-- Fixed: Unnecessary casts and optimized policies
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.0

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

-- ============================================================================
-- DROP STATEMENTS
-- ============================================================================

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
ALTER TABLE IF EXISTS ONLY public.garden_correlations DROP CONSTRAINT IF EXISTS garden_correlations_custom_crop_id_fkey;
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

DROP TABLE IF EXISTS public.weather_cache CASCADE;
DROP TABLE IF EXISTS public.user_badges CASCADE;
DROP TABLE IF EXISTS public.treatment_register CASCADE;
DROP TABLE IF EXISTS public.seedling_batches CASCADE;
DROP TABLE IF EXISTS public.seed_inventory CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.professional_analytics CASCADE;
DROP TABLE IF EXISTS public.photo_logs CASCADE;
DROP TABLE IF EXISTS public.mechanical_work_register CASCADE;
DROP TABLE IF EXISTS public.hydroponic_readings CASCADE;
DROP TABLE IF EXISTS public.harvest_logs CASCADE;
DROP TABLE IF EXISTS public.gardens CASCADE;
DROP TABLE IF EXISTS public.garden_zone_memories CASCADE;
DROP TABLE IF EXISTS public.garden_tree_memories CASCADE;
DROP TABLE IF EXISTS public.garden_tasks CASCADE;
DROP TABLE IF EXISTS public.garden_season_analyses CASCADE;
DROP TABLE IF EXISTS public.garden_patterns CASCADE;
DROP TABLE IF EXISTS public.garden_obstacles CASCADE;
DROP TABLE IF EXISTS public.garden_correlations CASCADE;
DROP TABLE IF EXISTS public.garden_beds CASCADE;
DROP TABLE IF EXISTS public.garden_accessories CASCADE;
DROP TABLE IF EXISTS public.custom_plans CASCADE;
DROP TABLE IF EXISTS public.custom_crops CASCADE;
DROP TABLE IF EXISTS public.crop_mechanical_works CASCADE;
DROP TABLE IF EXISTS public.crop_learning_events CASCADE;
DROP TABLE IF EXISTS public.challenge_completions CASCADE;
DROP TABLE IF EXISTS public.calendar_tasks CASCADE;
DROP TABLE IF EXISTS public.bed_planting_history CASCADE;
DROP TABLE IF EXISTS public.aquaponic_readings CASCADE;
DROP TABLE IF EXISTS public.ai_credit_transactions CASCADE;
DROP TABLE IF EXISTS public.agronomists CASCADE;
DROP TABLE IF EXISTS public.agronomist_consultations CASCADE;
DROP TABLE IF EXISTS public.agronomist_advice CASCADE;

DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.update_custom_crops_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.set_user_tier(p_user_id uuid, p_tier text) CASCADE;
DROP FUNCTION IF EXISTS public.list_all_users() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_credits() CASCADE;
DROP FUNCTION IF EXISTS public.grant_credits(p_user_id uuid, p_amount integer) CASCADE;
DROP FUNCTION IF EXISTS public.deduct_credits(p_user_id uuid, p_amount integer) CASCADE;
DROP FUNCTION IF EXISTS public.create_superadmin(p_email text, p_password text) CASCADE;
DROP FUNCTION IF EXISTS public.check_rotation_compliance(p_bed_id uuid, p_plant_family text) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_harvest_stats(p_garden_id uuid, p_start_date date, p_end_date date) CASCADE;
DROP FUNCTION IF EXISTS public.admin_grant_credits(p_user_id uuid, p_amount integer) CASCADE;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

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
    AND (p_end_date IS NULL OR harvest_date <= p_end_date);
  
  RETURN jsonb_build_object(
    'totalKgProduced', v_total_kg,
    'harvestCount', v_harvest_count,
    'avgRating', v_avg_rating
  );
END;
$$;

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

CREATE FUNCTION public.handle_new_user_credits() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  INSERT INTO profiles (id, tier, ai_credits_total, ai_credits_used)
  VALUES (NEW.id, 'FREE', 3, 0)
  ON CONFLICT (id) DO NOTHING;
  
  IF NOT EXISTS (SELECT 1 FROM ai_credit_transactions 
                 WHERE user_id = NEW.id AND type = 'bonus' AND description LIKE '%Welcome%') THEN
    PERFORM grant_credits(NEW.id, 3);
    
    INSERT INTO ai_credit_transactions (user_id, amount, type, description)
    VALUES (NEW.id, 3, 'bonus', 'Welcome bonus - 3 free AI credits');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE FUNCTION public.list_all_users() RETURNS TABLE(user_id uuid, email text, tier text, credits_total integer, credits_used integer, created_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    COALESCE(p.tier, 'FREE') as tier,
    COALESCE(p.ai_credits_total, 0) as credits_total,
    COALESCE(p.ai_credits_used, 0) as credits_used,
    u.created_at
  FROM auth.users u
  LEFT JOIN profiles p ON p.id = u.id
  ORDER BY u.created_at DESC;
END;
$$;

-- FIXED: Removed unnecessary ::TEXT cast
CREATE FUNCTION public.set_user_tier(p_user_id uuid, p_tier text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  IF p_tier NOT IN ('FREE', 'PLUS', 'PRO', 'PRO_CONSUMER', 'PRO_PROFESSIONAL') THEN
    RAISE EXCEPTION 'Invalid tier: %. Must be FREE, PLUS, PRO (or legacy PRO_CONSUMER, PRO_PROFESSIONAL)', p_tier;
  END IF;
  
  INSERT INTO profiles (id, tier)
  VALUES (p_user_id, p_tier)
  ON CONFLICT (id) DO UPDATE
  SET tier = p_tier,
      updated_at = NOW();
END;
$$;

CREATE FUNCTION public.update_custom_crops_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

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

-- ============================================================================
-- TABLES (FIXED: All DEFAULT gen_random_uuid())
-- ============================================================================

CREATE TABLE public.agronomist_advice (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
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

CREATE TABLE public.agronomist_consultations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
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

CREATE TABLE public.agronomists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
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

CREATE TABLE public.aquaponic_readings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
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

CREATE TABLE public.bed_planting_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
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

CREATE TABLE public.crop_learning_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    custom_crop_id uuid,
    user_id uuid NOT NULL,
    garden_id uuid,
    event_type text NOT NULL,
    event_data jsonb NOT NULL,
    outcome jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crop_learning_events_event_type_check CHECK ((event_type = ANY (ARRAY['planting'::text, 'harvest'::text, 'work'::text, 'treatment'::text, 'problem'::text, 'fertilize'::text])))
);

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

CREATE TABLE public.custom_crops (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
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

CREATE TABLE public.custom_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
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

CREATE TABLE public.garden_accessories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
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

CREATE TABLE public.garden_beds (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    garden_id uuid NOT NULL,
    name text NOT NULL,
    bed_type text,
    shape text,
    length_cm numeric(8,2),
    width_cm numeric(8,2),
    diameter_cm numeric(8,2),
    size_sq_meters numeric(5,2),
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

CREATE TABLE public.garden_correlations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
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

COMMENT ON COLUMN public.garden_correlations.custom_crop_id IS 'Riferimento a coltura personalizzata per cui è stata identificata la correlazione';

CREATE TABLE public.garden_obstacles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
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

CREATE TABLE public.garden_patterns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    garden_id uuid NOT NULL,
    pattern_type text NOT NULL,
    custom_crop_id uuid,
    pattern_data jsonb NOT NULL,
    confidence numeric(3,2) DEFAULT 0.5,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT garden_patterns_confidence_check CHECK (((confidence >= (0)::numeric) AND (confidence <= (1)::numeric)))
);

COMMENT ON COLUMN public.garden_patterns.custom_crop_id IS 'Riferimento a coltura personalizzata per cui è stato identificato il pattern';

CREATE TABLE public.garden_season_analyses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    garden_id uuid NOT NULL,
    season text NOT NULL,
    year integer NOT NULL,
    analysis_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT garden_season_analyses_season_check CHECK ((season = ANY (ARRAY['Spring'::text, 'Summer'::text, 'Fall'::text, 'Winter'::text])))
);

CREATE TABLE public.garden_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
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

CREATE TABLE public.garden_tree_memories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    garden_id uuid NOT NULL,
    tree_id uuid,
    tree_name text NOT NULL,
    custom_crop_id uuid,
    production_history jsonb DEFAULT '[]'::jsonb,
    alternance_pattern jsonb DEFAULT '{}'::jsonb,
    pruning_history jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.garden_zone_memories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
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

COMMENT ON COLUMN public.garden_zone_memories.custom_crop_id IS 'Riferimento a coltura personalizzata (se applicabile)';

CREATE TABLE public.gardens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
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
    CONSTRAINT gardens_soil_ph_check CHECK (((soil_ph >= (0)::numeric) AND (soil_ph <= (14)::numeric)))),
    CONSTRAINT gardens_soil_type_check CHECK ((soil_type = ANY (ARRAY['Clay'::text, 'Sandy'::text, 'Loamy'::text, 'Peaty'::text, 'Chalky'::text, 'Silty'::text]))),
    CONSTRAINT gardens_sun_exposure_check CHECK ((sun_exposure = ANY (ARRAY['FullSun'::text, 'PartSun'::text, 'Shade'::text]))),
    CONSTRAINT gardens_wind_protection_check CHECK ((wind_protection = ANY (ARRAY['High'::text, 'Medium'::text, 'Low'::text])))
);

CREATE TABLE public.harvest_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
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

CREATE TABLE public.hydroponic_readings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
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

CREATE TABLE public.photo_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid NOT NULL,
    garden_id uuid NOT NULL,
    photo_url text NOT NULL,
    photo_date date NOT NULL,
    days_from_planting integer NOT NULL,
    analysis_result jsonb,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

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

CREATE TABLE public.seed_inventory (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
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

CREATE TABLE public.seedling_batches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
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

CREATE TABLE public.user_badges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    badge_id text NOT NULL,
    badge_name text NOT NULL,
    badge_emoji text NOT NULL,
    badge_description text,
    earned_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.weather_cache (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lat_lng text NOT NULL,
    date date NOT NULL,
    forecast jsonb NOT NULL,
    cached_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- PRIMARY KEYS & UNIQUE CONSTRAINTS
-- ============================================================================

ALTER TABLE ONLY public.agronomist_advice ADD CONSTRAINT agronomist_advice_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.agronomist_consultations ADD CONSTRAINT agronomist_consultations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.agronomists ADD CONSTRAINT agronomists_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.ai_credit_transactions ADD CONSTRAINT ai_credit_transactions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.aquaponic_readings ADD CONSTRAINT aquaponic_readings_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.bed_planting_history ADD CONSTRAINT bed_planting_history_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.calendar_tasks ADD CONSTRAINT calendar_tasks_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.challenge_completions ADD CONSTRAINT challenge_completions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.challenge_completions ADD CONSTRAINT challenge_completions_user_id_challenge_id_key UNIQUE (user_id, challenge_id);
ALTER TABLE ONLY public.crop_learning_events ADD CONSTRAINT crop_learning_events_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.crop_mechanical_works ADD CONSTRAINT crop_mechanical_works_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.custom_crops ADD CONSTRAINT custom_crops_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.custom_plans ADD CONSTRAINT custom_plans_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.garden_accessories ADD CONSTRAINT garden_accessories_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.garden_beds ADD CONSTRAINT garden_beds_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.garden_correlations ADD CONSTRAINT garden_correlations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.garden_obstacles ADD CONSTRAINT garden_obstacles_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.garden_patterns ADD CONSTRAINT garden_patterns_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.garden_season_analyses ADD CONSTRAINT garden_season_analyses_garden_id_season_year_key UNIQUE (garden_id, season, year);
ALTER TABLE ONLY public.garden_season_analyses ADD CONSTRAINT garden_season_analyses_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.garden_tasks ADD CONSTRAINT garden_tasks_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.garden_tree_memories ADD CONSTRAINT garden_tree_memories_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.garden_zone_memories ADD CONSTRAINT garden_zone_memories_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.gardens ADD CONSTRAINT gardens_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.harvest_logs ADD CONSTRAINT harvest_logs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.hydroponic_readings ADD CONSTRAINT hydroponic_readings_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.mechanical_work_register ADD CONSTRAINT mechanical_work_register_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.photo_logs ADD CONSTRAINT photo_logs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.professional_analytics ADD CONSTRAINT professional_analytics_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.seed_inventory ADD CONSTRAINT seed_inventory_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.seedling_batches ADD CONSTRAINT seedling_batches_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.treatment_register ADD CONSTRAINT treatment_register_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.user_badges ADD CONSTRAINT user_badges_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.user_badges ADD CONSTRAINT user_badges_user_id_badge_id_key UNIQUE (user_id, badge_id);
ALTER TABLE ONLY public.weather_cache ADD CONSTRAINT weather_cache_lat_lng_date_key UNIQUE (lat_lng, date);
ALTER TABLE ONLY public.weather_cache ADD CONSTRAINT weather_cache_pkey PRIMARY KEY (id);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_accessories_category ON public.garden_accessories USING btree (category);
CREATE INDEX idx_accessories_garden_id ON public.garden_accessories USING btree (garden_id);
CREATE INDEX idx_advice_consultation_id ON public.agronomist_advice USING btree (consultation_id);
CREATE INDEX idx_advice_task_id ON public.agronomist_advice USING btree (task_id);
CREATE INDEX idx_agronomists_user_id ON public.agronomists USING btree (user_id);
CREATE INDEX idx_aquaponic_readings_garden_date ON public.aquaponic_readings USING btree (garden_id, reading_date DESC);
CREATE INDEX idx_bed_history_bed_id ON public.bed_planting_history USING btree (bed_id);
CREATE INDEX idx_bed_history_plant_family ON public.bed_planting_history USING btree (plant_family);
CREATE INDEX idx_bed_history_year_season ON public.bed_planting_history USING btree (year, season);
CREATE INDEX idx_calendar_tasks_garden ON public.calendar_tasks USING btree (garden_id);
CREATE INDEX idx_calendar_tasks_recurring ON public.calendar_tasks USING btree (recurring) WHERE (recurring = true);
CREATE INDEX idx_calendar_tasks_user_date ON public.calendar_tasks USING btree (user_id, start_date);
CREATE INDEX idx_challenge_completions_challenge ON public.challenge_completions USING btree (challenge_id);
CREATE INDEX idx_challenge_completions_date ON public.challenge_completions USING btree (completed_at);
CREATE INDEX idx_challenge_completions_user ON public.challenge_completions USING btree (user_id);
CREATE INDEX idx_consultations_agronomist_id ON public.agronomist_consultations USING btree (agronomist_id);
CREATE INDEX idx_consultations_task_id ON public.agronomist_consultations USING btree (task_id);
CREATE INDEX idx_consultations_user_id ON public.agronomist_consultations USING btree (user_id);
CREATE INDEX idx_correlations_custom_crop_id ON public.garden_correlations USING btree (custom_crop_id);
CREATE INDEX idx_correlations_garden_id ON public.garden_correlations USING btree (garden_id);
CREATE INDEX idx_credit_transactions_created ON public.ai_credit_transactions USING btree (created_at DESC);
CREATE INDEX idx_credit_transactions_user ON public.ai_credit_transactions USING btree (user_id);
CREATE INDEX idx_crop_mechanical_works_crop_id ON public.crop_mechanical_works USING btree (crop_id);
CREATE INDEX idx_crop_mechanical_works_priority ON public.crop_mechanical_works USING btree (priority DESC);
CREATE INDEX idx_crop_mechanical_works_work_type ON public.crop_mechanical_works USING btree (work_type);
CREATE INDEX idx_custom_crops_common_name ON public.custom_crops USING btree (common_name);
CREATE INDEX idx_custom_crops_garden_id ON public.custom_crops USING btree (garden_id);
CREATE INDEX idx_custom_crops_user_id ON public.custom_crops USING btree (user_id);
CREATE INDEX idx_custom_plans_base_master_sheet ON public.custom_plans USING btree (base_master_sheet_id);
CREATE INDEX idx_custom_plans_garden_id ON public.custom_plans USING btree (garden_id);
CREATE INDEX idx_custom_plans_user_id ON public.custom_plans USING btree (user_id);
CREATE INDEX idx_garden_beds_garden_id ON public.garden_beds USING btree (garden_id);
CREATE INDEX idx_garden_obstacles_azimuth ON public.garden_obstacles USING btree (azimuth);
CREATE INDEX idx_garden_obstacles_garden_id ON public.garden_obstacles USING btree (garden_id);
CREATE INDEX idx_garden_tasks_bed_id ON public.garden_tasks USING btree (bed_id);
CREATE INDEX idx_garden_tasks_completed ON public.garden_tasks USING btree (completed);
CREATE INDEX idx_garden_tasks_date ON public.garden_tasks USING btree (date);
CREATE INDEX idx_garden_tasks_garden_id ON public.garden_tasks USING btree (garden_id);
CREATE INDEX idx_garden_tasks_plant_name ON public.garden_tasks USING btree (plant_name);
CREATE INDEX idx_garden_tasks_suggested ON public.garden_tasks USING btree (is_suggested) WHERE (is_suggested = true);
CREATE INDEX idx_garden_tasks_suggested_date ON public.garden_tasks USING btree (suggested_date) WHERE (suggested_date IS NOT NULL);
CREATE INDEX idx_gardens_created_at ON public.gardens USING btree (created_at);
CREATE INDEX idx_gardens_user_id ON public.gardens USING btree (user_id);
CREATE INDEX idx_harvest_logs_garden_id ON public.harvest_logs USING btree (garden_id);
CREATE INDEX idx_harvest_logs_harvest_date ON public.harvest_logs USING btree (harvest_date);
CREATE INDEX idx_harvest_logs_plant_name ON public.harvest_logs USING btree (plant_name);
CREATE INDEX idx_harvest_logs_task_id ON public.harvest_logs USING btree (task_id);
CREATE INDEX idx_hydroponic_readings_garden_date ON public.hydroponic_readings USING btree (garden_id, reading_date DESC);
CREATE INDEX idx_learning_events_created_at ON public.crop_learning_events USING btree (created_at DESC);
CREATE INDEX idx_learning_events_crop_id ON public.crop_learning_events USING btree (custom_crop_id);
CREATE INDEX idx_learning_events_type ON public.crop_learning_events USING btree (event_type);
CREATE INDEX idx_learning_events_user_id ON public.crop_learning_events USING btree (user_id);
CREATE INDEX idx_mechanical_work_date ON public.mechanical_work_register USING btree (work_date DESC);
CREATE INDEX idx_mechanical_work_garden ON public.mechanical_work_register USING btree (garden_id);
CREATE INDEX idx_mechanical_work_type ON public.mechanical_work_register USING btree (work_type);
CREATE INDEX idx_mechanical_work_user ON public.mechanical_work_register USING btree (user_id);
CREATE INDEX idx_patterns_custom_crop_id ON public.garden_patterns USING btree (custom_crop_id);
CREATE INDEX idx_patterns_garden_id ON public.garden_patterns USING btree (garden_id);
CREATE INDEX idx_photo_logs_garden_id ON public.photo_logs USING btree (garden_id);
CREATE INDEX idx_photo_logs_photo_date ON public.photo_logs USING btree (photo_date);
CREATE INDEX idx_photo_logs_task_id ON public.photo_logs USING btree (task_id);
CREATE INDEX idx_professional_analytics_crop ON public.professional_analytics USING btree (crop_name);
CREATE INDEX idx_professional_analytics_garden ON public.professional_analytics USING btree (garden_id);
CREATE INDEX idx_professional_analytics_user ON public.professional_analytics USING btree (user_id);
CREATE INDEX idx_professional_analytics_year ON public.professional_analytics USING btree (year);
CREATE INDEX idx_season_analyses_garden_id ON public.garden_season_analyses USING btree (garden_id);
CREATE INDEX idx_seed_inventory_expiry_year ON public.seed_inventory USING btree (expiry_year);
CREATE INDEX idx_seed_inventory_garden_id ON public.seed_inventory USING btree (garden_id);
CREATE INDEX idx_seed_inventory_user_id ON public.seed_inventory USING btree (user_id);
CREATE INDEX idx_seedling_batches_garden_id ON public.seedling_batches USING btree (garden_id);
CREATE INDEX idx_seedling_batches_phase ON public.seedling_batches USING btree (phase);
CREATE INDEX idx_seedling_batches_sowing_date ON public.seedling_batches USING btree (sowing_date);
CREATE INDEX idx_treatment_register_crop ON public.treatment_register USING btree (crop_name);
CREATE INDEX idx_treatment_register_date ON public.treatment_register USING btree (treatment_date DESC);
CREATE INDEX idx_treatment_register_garden ON public.treatment_register USING btree (garden_id);
CREATE INDEX idx_treatment_register_user ON public.treatment_register USING btree (user_id);
CREATE INDEX idx_tree_memories_custom_crop_id ON public.garden_tree_memories USING btree (custom_crop_id);
CREATE INDEX idx_tree_memories_garden_id ON public.garden_tree_memories USING btree (garden_id);
CREATE INDEX idx_user_badges_earned ON public.user_badges USING btree (earned_at);
CREATE INDEX idx_user_badges_user ON public.user_badges USING btree (user_id);
CREATE INDEX idx_weather_cache_cached_at ON public.weather_cache USING btree (cached_at);
CREATE INDEX idx_weather_cache_lat_lng_date ON public.weather_cache USING btree (lat_lng, date);
CREATE INDEX idx_zone_memories_custom_crop_id ON public.garden_zone_memories USING btree (custom_crop_id);
CREATE INDEX idx_zone_memories_garden_id ON public.garden_zone_memories USING btree (garden_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_agronomists_updated_at BEFORE UPDATE ON public.agronomists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_calendar_tasks_updated_at BEFORE UPDATE ON public.calendar_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_custom_crops_timestamp BEFORE UPDATE ON public.custom_crops FOR EACH ROW EXECUTE FUNCTION public.update_custom_crops_updated_at();
CREATE TRIGGER update_custom_crops_updated_at BEFORE UPDATE ON public.custom_crops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_custom_plans_updated_at BEFORE UPDATE ON public.custom_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_garden_beds_updated_at BEFORE UPDATE ON public.garden_beds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_garden_obstacles_updated_at BEFORE UPDATE ON public.garden_obstacles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_garden_tasks_updated_at BEFORE UPDATE ON public.garden_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gardens_updated_at BEFORE UPDATE ON public.gardens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_seed_inventory_updated_at BEFORE UPDATE ON public.seed_inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_seedling_batches_updated_at BEFORE UPDATE ON public.seedling_batches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- CRITICAL FIX: Add missing trigger for new user credits
-- ============================================================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_credits();

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================================================

ALTER TABLE ONLY public.agronomist_advice ADD CONSTRAINT agronomist_advice_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.agronomist_consultations(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.agronomist_advice ADD CONSTRAINT agronomist_advice_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.garden_tasks(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.agronomist_consultations ADD CONSTRAINT agronomist_consultations_agronomist_id_fkey FOREIGN KEY (agronomist_id) REFERENCES public.agronomists(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.agronomist_consultations ADD CONSTRAINT agronomist_consultations_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.agronomist_consultations ADD CONSTRAINT agronomist_consultations_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.garden_tasks(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.agronomist_consultations ADD CONSTRAINT agronomist_consultations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.agronomists ADD CONSTRAINT agronomists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.ai_credit_transactions ADD CONSTRAINT ai_credit_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.aquaponic_readings ADD CONSTRAINT aquaponic_readings_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.bed_planting_history ADD CONSTRAINT bed_planting_history_bed_id_fkey FOREIGN KEY (bed_id) REFERENCES public.garden_beds(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.calendar_tasks ADD CONSTRAINT calendar_tasks_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.calendar_tasks ADD CONSTRAINT calendar_tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.challenge_completions ADD CONSTRAINT challenge_completions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.crop_learning_events ADD CONSTRAINT crop_learning_events_custom_crop_id_fkey FOREIGN KEY (custom_crop_id) REFERENCES public.custom_crops(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.crop_learning_events ADD CONSTRAINT crop_learning_events_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.crop_learning_events ADD CONSTRAINT crop_learning_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.custom_crops ADD CONSTRAINT custom_crops_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.custom_crops ADD CONSTRAINT custom_crops_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.custom_plans ADD CONSTRAINT custom_plans_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.custom_plans ADD CONSTRAINT custom_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.garden_accessories ADD CONSTRAINT garden_accessories_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.garden_beds ADD CONSTRAINT garden_beds_covering_structure_id_fkey FOREIGN KEY (covering_structure_id) REFERENCES public.gardens(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.garden_beds ADD CONSTRAINT garden_beds_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.garden_beds ADD CONSTRAINT garden_beds_structure_id_fkey FOREIGN KEY (structure_id) REFERENCES public.gardens(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.garden_correlations ADD CONSTRAINT garden_correlations_custom_crop_id_fkey FOREIGN KEY (custom_crop_id) REFERENCES public.custom_crops(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.garden_correlations ADD CONSTRAINT garden_correlations_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.garden_obstacles ADD CONSTRAINT garden_obstacles_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.garden_patterns ADD CONSTRAINT garden_patterns_custom_crop_id_fkey FOREIGN KEY (custom_crop_id) REFERENCES public.custom_crops(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.garden_patterns ADD CONSTRAINT garden_patterns_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.garden_season_analyses ADD CONSTRAINT garden_season_analyses_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.garden_tasks ADD CONSTRAINT garden_tasks_bed_id_fkey FOREIGN KEY (bed_id) REFERENCES public.garden_beds(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.garden_tasks ADD CONSTRAINT garden_tasks_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.garden_tree_memories ADD CONSTRAINT garden_tree_memories_custom_crop_id_fkey FOREIGN KEY (custom_crop_id) REFERENCES public.custom_crops(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.garden_tree_memories ADD CONSTRAINT garden_tree_memories_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.garden_zone_memories ADD CONSTRAINT garden_zone_memories_custom_crop_id_fkey FOREIGN KEY (custom_crop_id) REFERENCES public.custom_crops(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.garden_zone_memories ADD CONSTRAINT garden_zone_memories_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.gardens ADD CONSTRAINT gardens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.harvest_logs ADD CONSTRAINT harvest_logs_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.harvest_logs ADD CONSTRAINT harvest_logs_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.garden_tasks(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.hydroponic_readings ADD CONSTRAINT hydroponic_readings_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.mechanical_work_register ADD CONSTRAINT mechanical_work_register_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.mechanical_work_register ADD CONSTRAINT mechanical_work_register_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.photo_logs ADD CONSTRAINT photo_logs_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.photo_logs ADD CONSTRAINT photo_logs_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.garden_tasks(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.professional_analytics ADD CONSTRAINT professional_analytics_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.professional_analytics ADD CONSTRAINT professional_analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.seed_inventory ADD CONSTRAINT seed_inventory_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.seed_inventory ADD CONSTRAINT seed_inventory_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.seedling_batches ADD CONSTRAINT seedling_batches_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.treatment_register ADD CONSTRAINT treatment_register_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.treatment_register ADD CONSTRAINT treatment_register_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.user_badges ADD CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES (OPTIMIZED)
-- ============================================================================

ALTER TABLE public.agronomist_advice ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agronomist_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agronomists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aquaponic_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bed_planting_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_learning_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_mechanical_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garden_accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garden_beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garden_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garden_obstacles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garden_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garden_season_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garden_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garden_tree_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garden_zone_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gardens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.harvest_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hydroponic_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanical_work_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seed_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seedling_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;

-- FIXED: Optimized policies (removed unnecessary SELECT subqueries)
-- FIXED: Added explicit INSERT policies with WITH CHECK for profiles and gardens

-- Profiles: Separate policies for each operation to explicitly allow INSERT
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Gardens: Separate policies for each operation to explicitly allow INSERT
CREATE POLICY "Users can view their gardens" ON public.gardens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their gardens" ON public.gardens FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their gardens" ON public.gardens FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their gardens" ON public.gardens FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own seeds" ON public.seed_inventory USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own transactions" ON public.ai_credit_transactions USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own treatments" ON public.treatment_register USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own mechanical work" ON public.mechanical_work_register USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own analytics" ON public.professional_analytics USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own calendar tasks" ON public.calendar_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own calendar tasks" ON public.calendar_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own calendar tasks" ON public.calendar_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own calendar tasks" ON public.calendar_tasks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own challenge completions" ON public.challenge_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own challenge completions" ON public.challenge_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own challenge completions" ON public.challenge_completions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own agronomists" ON public.agronomists USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own consultations" ON public.agronomist_consultations USING (auth.uid() = user_id);
CREATE POLICY "Users can view advice from their consultations" ON public.agronomist_advice FOR SELECT USING ((EXISTS ( SELECT 1 FROM public.agronomist_consultations WHERE ((agronomist_consultations.id = agronomist_advice.consultation_id) AND (agronomist_consultations.user_id = auth.uid())))));
CREATE POLICY "Users can update advice from their consultations" ON public.agronomist_advice FOR UPDATE USING ((EXISTS ( SELECT 1 FROM public.agronomist_consultations WHERE ((agronomist_consultations.id = agronomist_advice.consultation_id) AND (agronomist_consultations.user_id = auth.uid())))));

CREATE POLICY "Users can manage their own custom crops" ON public.custom_crops USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own learning events" ON public.crop_learning_events USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own or public custom plans" ON public.custom_plans FOR SELECT USING ((auth.uid() = user_id) OR (is_public = true));
CREATE POLICY "Users can create their own custom plans" ON public.custom_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own custom plans" ON public.custom_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own custom plans" ON public.custom_plans FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can only access tasks in their gardens" ON public.garden_tasks USING ((EXISTS ( SELECT 1 FROM public.gardens WHERE ((gardens.id = garden_tasks.garden_id) AND (gardens.user_id = auth.uid())))));
CREATE POLICY "Users can only access beds in their gardens" ON public.garden_beds USING ((EXISTS ( SELECT 1 FROM public.gardens WHERE ((gardens.id = garden_beds.garden_id) AND (gardens.user_id = auth.uid())))));
CREATE POLICY "Users can only access history in their beds" ON public.bed_planting_history USING ((EXISTS ( SELECT 1 FROM (public.garden_beds JOIN public.gardens ON ((gardens.id = garden_beds.garden_id))) WHERE ((garden_beds.id = bed_planting_history.bed_id) AND (gardens.user_id = auth.uid())))));
CREATE POLICY "Users can only access harvests in their gardens" ON public.harvest_logs USING ((EXISTS ( SELECT 1 FROM public.gardens WHERE ((gardens.id = harvest_logs.garden_id) AND (gardens.user_id = auth.uid())))));
CREATE POLICY "Users can only access photos in their gardens" ON public.photo_logs USING ((EXISTS ( SELECT 1 FROM public.gardens WHERE ((gardens.id = photo_logs.garden_id) AND (gardens.user_id = auth.uid())))));
CREATE POLICY "Users can access accessories in their gardens" ON public.garden_accessories USING ((EXISTS ( SELECT 1 FROM public.gardens WHERE ((gardens.id = garden_accessories.garden_id) AND (gardens.user_id = auth.uid())))));
CREATE POLICY "Users can access seedling batches in their gardens" ON public.seedling_batches USING ((EXISTS ( SELECT 1 FROM public.gardens WHERE ((gardens.id = seedling_batches.garden_id) AND (gardens.user_id = auth.uid())))));
CREATE POLICY "Users can access hydroponic readings in their gardens" ON public.hydroponic_readings USING ((EXISTS ( SELECT 1 FROM public.gardens WHERE ((gardens.id = hydroponic_readings.garden_id) AND (gardens.user_id = auth.uid())))));
CREATE POLICY "Users can access aquaponic readings in their gardens" ON public.aquaponic_readings USING ((EXISTS ( SELECT 1 FROM public.gardens WHERE ((gardens.id = aquaponic_readings.garden_id) AND (gardens.user_id = auth.uid())))));

CREATE POLICY "Users can view obstacles in their gardens" ON public.garden_obstacles FOR SELECT USING ((EXISTS ( SELECT 1 FROM public.gardens WHERE ((gardens.id = garden_obstacles.garden_id) AND (gardens.user_id = auth.uid())))));
CREATE POLICY "Users can create obstacles in their gardens" ON public.garden_obstacles FOR INSERT WITH CHECK ((EXISTS ( SELECT 1 FROM public.gardens WHERE ((gardens.id = garden_obstacles.garden_id) AND (gardens.user_id = auth.uid())))));
CREATE POLICY "Users can update obstacles in their gardens" ON public.garden_obstacles FOR UPDATE USING ((EXISTS ( SELECT 1 FROM public.gardens WHERE ((gardens.id = garden_obstacles.garden_id) AND (gardens.user_id = auth.uid())))));
CREATE POLICY "Users can delete obstacles in their gardens" ON public.garden_obstacles FOR DELETE USING ((EXISTS ( SELECT 1 FROM public.gardens WHERE ((gardens.id = garden_obstacles.garden_id) AND (gardens.user_id = auth.uid())))));

CREATE POLICY "Users can manage their own patterns" ON public.garden_patterns USING ((auth.uid() IN ( SELECT gardens.user_id FROM public.gardens WHERE (gardens.id = garden_patterns.garden_id))));
CREATE POLICY "Users can manage their own correlations" ON public.garden_correlations USING ((auth.uid() IN ( SELECT gardens.user_id FROM public.gardens WHERE (gardens.id = garden_correlations.garden_id))));
CREATE POLICY "Users can manage their own season analyses" ON public.garden_season_analyses USING ((auth.uid() IN ( SELECT gardens.user_id FROM public.gardens WHERE (gardens.id = garden_season_analyses.garden_id))));
CREATE POLICY "Users can manage their own zone memories" ON public.garden_zone_memories USING ((auth.uid() IN ( SELECT gardens.user_id FROM public.gardens WHERE (gardens.id = garden_zone_memories.garden_id))));
CREATE POLICY "Users can manage their own tree memories" ON public.garden_tree_memories USING ((auth.uid() IN ( SELECT gardens.user_id FROM public.gardens WHERE (gardens.id = garden_tree_memories.garden_id))));

CREATE POLICY "Crop mechanical works are publicly readable" ON public.crop_mechanical_works FOR SELECT USING (true);
CREATE POLICY "Weather cache is publicly readable" ON public.weather_cache FOR SELECT USING (true);
CREATE POLICY "Users can insert weather cache" ON public.weather_cache FOR INSERT WITH CHECK (true);

-- ============================================================================
-- END OF DATABASE DUMP
-- ============================================================================

