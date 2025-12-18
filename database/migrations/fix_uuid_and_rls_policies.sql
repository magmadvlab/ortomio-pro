-- ============================================================================
-- FIX CRITICO: Correzione UUID e RLS Policies per Supabase
-- ============================================================================
-- Questo script corregge i problemi identificati nel dump del database online:
-- 1. Sostituisce extensions.uuid_generate_v4() con gen_random_uuid()
-- 2. Aggiunge RLS policies esplicite per INSERT su profiles e gardens
-- 3. Verifica che il trigger on_auth_user_created esista
-- 
-- IMPORTANTE: Eseguire questo script sul database online Supabase
-- Lo script è idempotente: può essere eseguito più volte senza problemi
-- ============================================================================

-- ============================================================================
-- PARTE 1: Correzione DEFAULT UUID nelle tabelle
-- ============================================================================

-- Nota: Non possiamo modificare direttamente i DEFAULT delle colonne esistenti
-- Dobbiamo ricreare le colonne o usare ALTER TABLE ... ALTER COLUMN ... SET DEFAULT
-- Per sicurezza, verifichiamo prima quali tabelle usano extensions.uuid_generate_v4()

DO $$
DECLARE
    r RECORD;
    sql_cmd TEXT;
    fixed_count INTEGER := 0;
BEGIN
    -- Trova tutte le colonne che usano extensions.uuid_generate_v4() come DEFAULT
    FOR r IN 
        SELECT 
            table_name,
            column_name,
            column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_default LIKE '%extensions.uuid_generate_v4()%'
    LOOP
        sql_cmd := format('ALTER TABLE public.%I ALTER COLUMN %I SET DEFAULT gen_random_uuid()',
                         r.table_name, r.column_name);
        EXECUTE sql_cmd;
        fixed_count := fixed_count + 1;
        RAISE NOTICE '✓ Corretto DEFAULT per %.%', r.table_name, r.column_name;
    END LOOP;
    
    IF fixed_count = 0 THEN
        RAISE NOTICE '✓ Nessuna colonna da correggere: tutte usano già gen_random_uuid()';
    ELSE
        RAISE NOTICE '✓ Corrette % colonne', fixed_count;
    END IF;
END $$;

-- ============================================================================
-- PARTE 2: Fix RLS Policies per INSERT
-- ============================================================================

-- Rimuovi policy esistenti che usano solo USING (non coprono INSERT)
-- Usa IF EXISTS per evitare errori se le policy non esistono
DROP POLICY IF EXISTS "Users can only access their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can only access their gardens" ON public.gardens;

-- PROFILES: Crea policy separate per ogni operazione (idempotente con IF NOT EXISTS)
DO $$
BEGIN
    -- Verifica se le policy esistono già
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can view their own profile'
    ) THEN
        CREATE POLICY "Users can view their own profile" 
          ON public.profiles 
          FOR SELECT 
          USING (auth.uid() = id);
        RAISE NOTICE '✓ Creata policy SELECT per profiles';
    ELSE
        RAISE NOTICE '✓ Policy SELECT per profiles già esistente';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can insert their own profile'
    ) THEN
        CREATE POLICY "Users can insert their own profile" 
          ON public.profiles 
          FOR INSERT 
          WITH CHECK (auth.uid() = id);
        RAISE NOTICE '✓ Creata policy INSERT per profiles';
    ELSE
        RAISE NOTICE '✓ Policy INSERT per profiles già esistente';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile" 
          ON public.profiles 
          FOR UPDATE 
          USING (auth.uid() = id)
          WITH CHECK (auth.uid() = id);
        RAISE NOTICE '✓ Creata policy UPDATE per profiles';
    ELSE
        RAISE NOTICE '✓ Policy UPDATE per profiles già esistente';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can delete their own profile'
    ) THEN
        CREATE POLICY "Users can delete their own profile" 
          ON public.profiles 
          FOR DELETE 
          USING (auth.uid() = id);
        RAISE NOTICE '✓ Creata policy DELETE per profiles';
    ELSE
        RAISE NOTICE '✓ Policy DELETE per profiles già esistente';
    END IF;
END $$;

-- GARDENS: Crea policy separate per ogni operazione (idempotente)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'gardens' 
        AND policyname = 'Users can view their gardens'
    ) THEN
        CREATE POLICY "Users can view their gardens" 
          ON public.gardens 
          FOR SELECT 
          USING (auth.uid() = user_id);
        RAISE NOTICE '✓ Creata policy SELECT per gardens';
    ELSE
        RAISE NOTICE '✓ Policy SELECT per gardens già esistente';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'gardens' 
        AND policyname = 'Users can insert their gardens'
    ) THEN
        CREATE POLICY "Users can insert their gardens" 
          ON public.gardens 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE '✓ Creata policy INSERT per gardens';
    ELSE
        RAISE NOTICE '✓ Policy INSERT per gardens già esistente';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'gardens' 
        AND policyname = 'Users can update their gardens'
    ) THEN
        CREATE POLICY "Users can update their gardens" 
          ON public.gardens 
          FOR UPDATE 
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE '✓ Creata policy UPDATE per gardens';
    ELSE
        RAISE NOTICE '✓ Policy UPDATE per gardens già esistente';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'gardens' 
        AND policyname = 'Users can delete their gardens'
    ) THEN
        CREATE POLICY "Users can delete their gardens" 
          ON public.gardens 
          FOR DELETE 
          USING (auth.uid() = user_id);
        RAISE NOTICE '✓ Creata policy DELETE per gardens';
    ELSE
        RAISE NOTICE '✓ Policy DELETE per gardens già esistente';
    END IF;
END $$;

-- ============================================================================
-- PARTE 3: Verifica e crea trigger per nuovi utenti
-- ============================================================================

-- Verifica se il trigger esiste già
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers
        WHERE trigger_name = 'on_auth_user_created'
        AND event_object_table = 'users'
        AND event_object_schema = 'auth'
    ) THEN
        RAISE NOTICE '✓ Trigger on_auth_user_created già esistente';
    ELSE
        -- Crea trigger per creare profilo e crediti di benvenuto
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW
          EXECUTE FUNCTION public.handle_new_user_credits();
        RAISE NOTICE '✓ Creato trigger on_auth_user_created';
    END IF;
END $$;

-- ============================================================================
-- VERIFICA: Controlla che le correzioni siano state applicate
-- ============================================================================

-- Verifica colonne con DEFAULT gen_random_uuid()
SELECT 
    table_name,
    column_name,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_default LIKE '%gen_random_uuid()%'
ORDER BY table_name, column_name;

-- Verifica policies per profiles
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Verifica policies per gardens
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'gardens'
ORDER BY policyname;

-- Verifica trigger
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

