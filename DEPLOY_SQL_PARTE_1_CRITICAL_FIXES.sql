-- ============================================
-- ORTOMIO DATABASE - PARTE 1: FIX CRITICI
-- Esegui questo SQL su Supabase.com SQL Editor
-- ============================================

-- IMPORTANTE: Questo script è IDEMPOTENT (puoi eseguirlo più volte senza problemi)

-- ============================================
-- 1. COLONNA PREFERENCES
-- ============================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.profiles.preferences IS 'User preferences stored as JSON';

-- ============================================
-- 2. FUNZIONE GRANT_CREDITS (con SECURITY DEFINER)
-- ============================================

CREATE OR REPLACE FUNCTION public.grant_credits(p_user_id uuid, p_amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.profiles
  SET ai_credits_total = ai_credits_total + p_amount
  WHERE id = p_user_id;
END;
$function$;

COMMENT ON FUNCTION public.grant_credits IS 'Grants AI credits to a user - SECURITY DEFINER allows auth triggers to update profiles';

-- ============================================
-- 3. FUNZIONE HANDLE_NEW_USER_CREDITS (con SECURITY DEFINER)
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $function$
BEGIN
  -- Ensure profile exists
  INSERT INTO public.profiles (id, tier, ai_credits_total, ai_credits_used)
  VALUES (NEW.id, 'PRO', 3, 0)
  ON CONFLICT (id) DO NOTHING;

  -- Grant 3 free credits if profile was just created
  IF NOT EXISTS (
    SELECT 1 FROM public.ai_credit_transactions
    WHERE user_id = NEW.id AND type = 'bonus' AND description LIKE '%Welcome%'
  ) THEN
    PERFORM public.grant_credits(NEW.id, 3);

    INSERT INTO public.ai_credit_transactions (user_id, amount, type, description)
    VALUES (NEW.id, 3, 'bonus', 'Welcome bonus - 3 free AI credits');
  END IF;

  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.handle_new_user_credits IS 'Trigger function to grant initial and welcome credits - SECURITY DEFINER for auth context';

-- ============================================
-- 4. FUNZIONE HANDLE_NEW_USER (con SECURITY DEFINER)
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (id, tier, ai_credits_total, ai_credits_used)
  VALUES (
    NEW.id,
    'PRO'::text,
    3,
    0
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates profile when user registers - SECURITY DEFINER for auth context';

-- ============================================
-- 5. TRIGGER CREAZIONE AUTOMATICA PROFILI
-- ============================================

-- Drop existing trigger if present
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Automatically creates user profile on registration';

-- ============================================
-- 6. PERMESSI SUPABASE_AUTH_ADMIN
-- ============================================

-- Grant permissions to supabase_auth_admin role
GRANT ALL ON public.profiles TO supabase_auth_admin;
GRANT ALL ON public.ai_credit_transactions TO supabase_auth_admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;

-- ============================================
-- 7. VERIFICA CONFIGURAZIONE
-- ============================================

-- Uncomment to verify setup:
/*
SELECT
  'Trigger exists' as check_type,
  COUNT(*) as count
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

SELECT
  'Functions with SECURITY DEFINER' as check_type,
  COUNT(*) as count
FROM pg_proc
WHERE proname IN ('grant_credits', 'handle_new_user', 'handle_new_user_credits')
  AND prosecdef = true;

SELECT
  'Preferences column exists' as check_type,
  COUNT(*) as count
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'preferences';
*/

-- ============================================
-- FINE PARTE 1
-- ============================================

-- Vai avanti con PARTE 2 dopo aver eseguito questo script
