-- ============================================
-- GRUPPO 13: FIX FUNCTION SEARCH_PATH SECURITY
-- ============================================
-- Corregge tutte le funzioni che hanno search_path mutabile
-- Risolve i warning del Security Advisor
-- 
-- ORDINE: Dopo tutte le altre migrazioni che creano funzioni
-- 
-- Riferimento: Supabase Security Advisor warnings

-- ============================================
-- Fix get_or_create_notification_preferences
-- ============================================
CREATE OR REPLACE FUNCTION get_or_create_notification_preferences(p_user_id UUID)
RETURNS notification_preferences 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
  v_prefs notification_preferences;
BEGIN
  SELECT * INTO v_prefs
  FROM public.notification_preferences
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.notification_preferences (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_prefs;
  END IF;

  RETURN v_prefs;
END;
$$;

-- ============================================
-- Fix create_default_notification_preferences
-- ============================================
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- ============================================
-- Fix get_active_api_key
-- ============================================
DO $do$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'get_active_api_key'
    AND pronamespace = 'public'::regnamespace
  ) THEN
    ALTER FUNCTION get_active_api_key(UUID, TEXT) SET search_path = '';
  END IF;
END $do$;

-- ============================================
-- Fix update_api_configurations_updated_at
-- ============================================
DO $do$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'update_api_configurations_updated_at'
    AND pronamespace = 'public'::regnamespace
  ) THEN
    ALTER FUNCTION update_api_configurations_updated_at() SET search_path = '';
  END IF;
END $do$;

-- ============================================
-- Fix encrypt_api_key
-- ============================================
DO $do$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'encrypt_api_key'
    AND pronamespace = 'public'::regnamespace
  ) THEN
    ALTER FUNCTION encrypt_api_key(TEXT) SET search_path = '';
  END IF;
END $do$;

-- ============================================
-- Fix decrypt_api_key
-- ============================================
DO $do$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'decrypt_api_key'
    AND pronamespace = 'public'::regnamespace
  ) THEN
    ALTER FUNCTION decrypt_api_key(TEXT) SET search_path = '';
  END IF;
END $do$;

-- ============================================
-- Fix update_updated_at_column
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- Fix check_rotation_compliance
-- ============================================
DO $do$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'check_rotation_compliance'
    AND pronamespace = 'public'::regnamespace
  ) THEN
    ALTER FUNCTION check_rotation_compliance(UUID, TEXT) SET search_path = '';
  END IF;
END $do$;

-- ============================================
-- Fix calculate_harvest_stats
-- ============================================
DO $do$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'calculate_harvest_stats'
    AND pronamespace = 'public'::regnamespace
  ) THEN
    ALTER FUNCTION calculate_harvest_stats(UUID, DATE, DATE) SET search_path = '';
  END IF;
END $do$;

-- ============================================
-- Fix calculate_quantity_remaining
-- ============================================
DO $do$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'calculate_quantity_remaining'
    AND pronamespace = 'public'::regnamespace
  ) THEN
    ALTER FUNCTION calculate_quantity_remaining(UUID) SET search_path = '';
  END IF;
END $do$;

-- ============================================
-- Fix update_seed_quantity_remaining
-- ============================================
DO $do$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'update_seed_quantity_remaining'
    AND pronamespace = 'public'::regnamespace
  ) THEN
    ALTER FUNCTION update_seed_quantity_remaining() SET search_path = '';
  END IF;
END $do$;

-- ============================================
-- Verifica che tutte le funzioni siano corrette
-- ============================================
DO $do$
DECLARE
  func_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO func_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.prosecdef = true  -- Solo funzioni SECURITY DEFINER
    AND (p.proconfig IS NULL OR NOT ('search_path=' = ANY(p.proconfig)));
  
  IF func_count > 0 THEN
    RAISE WARNING 'Ci sono ancora % funzioni SECURITY DEFINER senza search_path impostato', func_count;
  ELSE
    RAISE NOTICE '✅ Tutte le funzioni SECURITY DEFINER hanno search_path impostato';
  END IF;
END $do$;

