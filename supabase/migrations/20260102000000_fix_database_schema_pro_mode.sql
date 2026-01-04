-- ============================================
-- Fix Database Schema for PRO Mode
-- Data: 2026-01-02
-- ============================================

-- 1. Aggiungi colonna preferences a profiles (se non esiste)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- 2. Crea tabella ai_credit_transactions se non esiste
CREATE TABLE IF NOT EXISTS public.ai_credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT CHECK (type IN ('purchase', 'usage', 'bonus', 'refund')) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_credit_transactions_user_id ON public.ai_credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_credit_transactions_type ON public.ai_credit_transactions(type);

-- RLS per ai_credit_transactions
ALTER TABLE public.ai_credit_transactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ai_credit_transactions'
    AND policyname = 'Users can view their own transactions'
  ) THEN
    CREATE POLICY "Users can view their own transactions"
      ON public.ai_credit_transactions FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 3. Fix funzioni crediti con SECURITY DEFINER e search_path
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

-- 4. Fix handle_new_user_credits con SECURITY DEFINER
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
  IF NOT EXISTS (SELECT 1 FROM public.ai_credit_transactions
                 WHERE user_id = NEW.id AND type = 'bonus' AND description LIKE '%Welcome%') THEN
    PERFORM public.grant_credits(NEW.id, 3);

    INSERT INTO public.ai_credit_transactions (user_id, amount, type, description)
    VALUES (NEW.id, 3, 'bonus', 'Welcome bonus - 3 free AI credits');
  END IF;

  RETURN NEW;
END;
$function$;

-- 5. Fix handle_new_user per creazione automatica profilo
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, tier, ai_credits_total, ai_credits_used)
  VALUES (
    NEW.id,
    'PRO_PROFESSIONAL'::text,
    999999,  -- Crediti illimitati per PRO
    0
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 6. Crea trigger se non esiste
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;

-- 7. Garantisci permessi necessari
GRANT ALL ON public.profiles TO supabase_auth_admin;
GRANT ALL ON public.ai_credit_transactions TO supabase_auth_admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;

-- 8. Notifica PostgREST di ricaricare lo schema
NOTIFY pgrst, 'reload schema';

-- ============================================
-- Note:
-- - Fix primary_crop: campo rimosso dal codice (non esiste in schema)
-- - Fix garden_tasks → calendar_tasks: applicato nel codice TypeScript
-- - Fix date → start_date: applicato nel codice TypeScript
-- - Sistema crediti AI: 3 iniziali + 3 bonus = 6 totali
-- ============================================
