-- ============================================
-- GRUPPO 14: FIX RLS PERFORMANCE
-- ============================================
-- Corregge le policy RLS per ottimizzare le performance
-- Sostituisce auth.uid() con (select auth.uid()) per evitare ri-valutazione per ogni riga
-- 
-- ORDINE: Dopo tutte le altre migrazioni che creano policy RLS (dopo 08_performance_fixes.sql)
-- 
-- Riferimento: Supabase Security Advisor warnings per auth_rls_initplan
-- 
-- Questo script corregge automaticamente tutte le policy che usano auth.uid() direttamente
-- e le sostituisce con (select auth.uid()) per migliorare le performance

-- ============================================
-- CORREZIONE AUTOMATICA: Tutte le policy RLS
-- ============================================
-- Questo script trova e corregge tutte le policy che usano auth.uid() direttamente
-- ATTENZIONE: Modifica TUTTE le policy trovate - eseguire con cautela

DO $do$
DECLARE
  policy_rec RECORD;
  policy_def TEXT;
  new_qual TEXT;
  new_with_check TEXT;
  cmd TEXT;
BEGIN
  -- Trova tutte le policy che usano auth.uid() direttamente (non già corrette)
  FOR policy_rec IN
    SELECT 
      schemaname,
      tablename,
      policyname,
      cmd AS command_type,
      qual,
      with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        (qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%')
        OR (with_check LIKE '%auth.uid()%' AND (with_check IS NULL OR with_check NOT LIKE '%(select auth.uid())%'))
      )
    ORDER BY tablename, policyname
  LOOP
    -- Sostituisci auth.uid() con (select auth.uid()) nelle espressioni
    new_qual := policy_rec.qual;
    IF new_qual IS NOT NULL THEN
      -- Sostituisci tutte le occorrenze di auth.uid() con (select auth.uid())
      -- Gestisce anche casi come auth.uid() = user_id o user_id = auth.uid()
      new_qual := REPLACE(new_qual, 'auth.uid()', '(select auth.uid())');
    END IF;
    
    new_with_check := policy_rec.with_check;
    IF new_with_check IS NOT NULL THEN
      new_with_check := REPLACE(new_with_check, 'auth.uid()', '(select auth.uid())');
    END IF;
    
    -- Ricrea la policy con la nuova definizione
    BEGIN
      -- Determina il tipo di comando dalla policy esistente
      -- Per semplicità, ricreiamo la policy per tutti i comandi supportati
      cmd := 'DROP POLICY IF EXISTS ' || quote_ident(policy_rec.policyname) || 
             ' ON ' || quote_ident(policy_rec.schemaname) || '.' || quote_ident(policy_rec.tablename) || ';';
      EXECUTE cmd;
      
      -- Ricrea la policy con la nuova definizione
      -- Usiamo FOR ALL per coprire tutti i tipi di comando
      cmd := 'CREATE POLICY ' || quote_ident(policy_rec.policyname) || 
             ' ON ' || quote_ident(policy_rec.schemaname) || '.' || quote_ident(policy_rec.tablename);
      
      -- Aggiungi USING se presente
      IF new_qual IS NOT NULL THEN
        cmd := cmd || ' USING (' || new_qual || ')';
      END IF;
      
      -- Aggiungi WITH CHECK se presente
      IF new_with_check IS NOT NULL THEN
        IF new_qual IS NOT NULL THEN
          cmd := cmd || ' WITH CHECK (' || new_with_check || ')';
        ELSE
          cmd := cmd || ' WITH CHECK (' || new_with_check || ')';
        END IF;
      END IF;
      
      cmd := cmd || ';';
      
      EXECUTE cmd;
      
      RAISE NOTICE 'Policy % su %.% corretta', 
        policy_rec.policyname, 
        policy_rec.schemaname, 
        policy_rec.tablename;
        
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Errore correggendo policy % su %.%: %', 
          policy_rec.policyname, 
          policy_rec.schemaname, 
          policy_rec.tablename,
          SQLERRM;
        RAISE WARNING 'Comando fallito: %', cmd;
    END;
  END LOOP;
  
  RAISE NOTICE 'Correzione policy RLS completata.';
END $do$;

-- ============================================
-- VERIFICA FINALE
-- ============================================
-- Conta quante policy usano ancora auth.uid() direttamente
DO $do$
DECLARE
  count_old INTEGER;
  count_new INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_old
  FROM pg_policies
  WHERE schemaname = 'public'
    AND (
      (qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%')
      OR (with_check LIKE '%auth.uid()%' AND (with_check IS NULL OR with_check NOT LIKE '%(select auth.uid())%'))
    );
  
  SELECT COUNT(*) INTO count_new
  FROM pg_policies
  WHERE schemaname = 'public'
    AND (
      qual LIKE '%(select auth.uid())%' 
      OR with_check LIKE '%(select auth.uid())%'
    );
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RISULTATO CORREZIONE RLS POLICIES:';
  RAISE NOTICE 'Policy con auth.uid() diretto (da correggere): %', count_old;
  RAISE NOTICE 'Policy con (select auth.uid()) (corrette): %', count_new;
  RAISE NOTICE '========================================';
  
  IF count_old > 0 THEN
    RAISE WARNING 'Ci sono ancora % policy da correggere manualmente', count_old;
  ELSE
    RAISE NOTICE '✅ Tutte le policy RLS sono state corrette!';
  END IF;
END $do$;
