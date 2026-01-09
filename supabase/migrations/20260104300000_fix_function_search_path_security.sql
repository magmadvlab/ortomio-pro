-- Migration: Fix function search_path security warnings
-- Date: 2026-01-04
-- Description: Sets explicit search_path on all functions to prevent search_path injection attacks

-- Fix handle_new_user function (trigger function - can be replaced directly)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix update_updated_at_column function (trigger function - can be replaced directly)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix check_rotation_compliance - DROP and recreate
DROP FUNCTION IF EXISTS public.check_rotation_compliance(UUID, UUID);
CREATE FUNCTION public.check_rotation_compliance(
  p_garden_id UUID,
  p_zone_id UUID DEFAULT NULL
)
RETURNS TABLE (
  zone_id UUID,
  zone_name TEXT,
  current_family TEXT,
  previous_families TEXT[],
  is_compliant BOOLEAN,
  recommendation TEXT
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gz.id as zone_id,
    gz.name as zone_name,
    gz.current_plant_family as current_family,
    gz.rotation_history as previous_families,
    (gz.current_plant_family IS NULL OR 
     NOT (gz.current_plant_family = ANY(gz.rotation_history))) as is_compliant,
    CASE 
      WHEN gz.current_plant_family = ANY(gz.rotation_history) 
      THEN 'Famiglia già coltivata di recente. Considera una rotazione.'
      ELSE 'Rotazione conforme'
    END as recommendation
  FROM garden_zones gz
  WHERE gz.garden_id = p_garden_id
    AND (p_zone_id IS NULL OR gz.id = p_zone_id);
END;
$$;

-- Fix calculate_harvest_stats - DROP and recreate
DROP FUNCTION IF EXISTS public.calculate_harvest_stats(UUID, DATE, DATE);
CREATE FUNCTION public.calculate_harvest_stats(
  p_garden_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  plant_name TEXT,
  total_quantity NUMERIC,
  total_weight_kg NUMERIC,
  harvest_count BIGINT,
  avg_quality NUMERIC
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.plant_name,
    SUM(h.quantity) as total_quantity,
    SUM(h.weight_kg) as total_weight_kg,
    COUNT(*) as harvest_count,
    AVG(h.quality_rating) as avg_quality
  FROM harvests h
  WHERE h.garden_id = p_garden_id
    AND (p_start_date IS NULL OR h.harvest_date >= p_start_date)
    AND (p_end_date IS NULL OR h.harvest_date <= p_end_date)
  GROUP BY h.plant_name
  ORDER BY total_weight_kg DESC NULLS LAST;
END;
$$;

-- Fix cleanup_expired_weather_cache - DROP and recreate
DROP FUNCTION IF EXISTS public.cleanup_expired_weather_cache();
CREATE FUNCTION public.cleanup_expired_weather_cache()
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM weather_cache
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Fix update_field_row_plant_count (trigger function - can be replaced directly)
CREATE OR REPLACE FUNCTION public.update_field_row_plant_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE field_rows 
    SET current_plant_count = current_plant_count + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.field_row_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE field_rows 
    SET current_plant_count = current_plant_count - OLD.quantity,
        updated_at = NOW()
    WHERE id = OLD.field_row_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE field_rows 
    SET current_plant_count = current_plant_count - OLD.quantity + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.field_row_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Fix get_field_row_occupancy - DROP and recreate
DROP FUNCTION IF EXISTS public.get_field_row_occupancy(UUID);
CREATE FUNCTION public.get_field_row_occupancy(p_field_row_id UUID)
RETURNS TABLE (
  field_row_id UUID,
  row_number INTEGER,
  max_plants INTEGER,
  current_plants INTEGER,
  occupancy_percent NUMERIC,
  available_slots INTEGER
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fr.id as field_row_id,
    fr.row_number,
    fr.max_plant_count as max_plants,
    fr.current_plant_count as current_plants,
    CASE 
      WHEN fr.max_plant_count > 0 
      THEN ROUND((fr.current_plant_count::NUMERIC / fr.max_plant_count) * 100, 2)
      ELSE 0
    END as occupancy_percent,
    GREATEST(0, fr.max_plant_count - fr.current_plant_count) as available_slots
  FROM field_rows fr
  WHERE fr.id = p_field_row_id;
END;
$$;

-- Add comments
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates profile for new auth users. Security: search_path fixed.';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Auto-updates updated_at timestamp. Security: search_path fixed.';
