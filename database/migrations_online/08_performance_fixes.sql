-- ============================================
-- GRUPPO 8: PERFORMANCE & FIXES
-- ============================================
-- Fix per performance e ottimizzazioni
-- 
-- Include:
-- - normalized_fields (ricerca fuzzy veloce)
-- - fix_rls_performance (ottimizzazione RLS policies)
-- - fix_function_search_path
-- - fix_rls_custom_crops_and_garden_memory
-- 
-- ORDINE: Dopo tutte le altre migrazioni (ultimo gruppo)

-- ============================================
-- NORMALIZED FIELDS (Ricerca fuzzy veloce)
-- ============================================
CREATE OR REPLACE FUNCTION normalize_text(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    trim(
      regexp_replace(
        regexp_replace(
          translate(
            input_text,
            'àáâãäåèéêëìíîïòóôõöùúûüýñç',
            'aaaaaaeeeeiiiiooooouuuuync'
          ),
          '[^\w\s]', '', 'g'
        ),
        '\s+', ' ', 'g'
      )
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Colonne normalized per official_crops
ALTER TABLE official_crops 
ADD COLUMN IF NOT EXISTS normalized_name TEXT;

CREATE INDEX IF NOT EXISTS idx_official_crops_normalized 
ON official_crops(normalized_name);

-- Colonne normalized per crop_aliases
ALTER TABLE crop_aliases 
ADD COLUMN IF NOT EXISTS normalized_alias TEXT;

CREATE INDEX IF NOT EXISTS idx_aliases_normalized 
ON crop_aliases(normalized_alias);

-- Trigger per auto-popolazione
CREATE OR REPLACE FUNCTION set_normalized_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'official_crops' THEN
    NEW.normalized_name := normalize_text(COALESCE(NEW.name, ''));
  ELSIF TG_TABLE_NAME = 'crop_aliases' THEN
    NEW.normalized_alias := normalize_text(COALESCE(NEW.alias_text, ''));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_normalize_crops ON official_crops;
CREATE TRIGGER trigger_normalize_crops
BEFORE INSERT OR UPDATE OF name ON official_crops
FOR EACH ROW EXECUTE FUNCTION set_normalized_fields();

DROP TRIGGER IF EXISTS trigger_normalize_aliases ON crop_aliases;
CREATE TRIGGER trigger_normalize_aliases
BEFORE INSERT OR UPDATE OF alias_text ON crop_aliases
FOR EACH ROW EXECUTE FUNCTION set_normalized_fields();

-- ============================================
-- FIX RLS PERFORMANCE (Ottimizzazione RLS policies)
-- ============================================
-- Aggiorna tutte le RLS policies per usare (select auth.uid()) invece di auth.uid()
-- Questo migliora le performance delle query

-- Gardens
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gardens' AND policyname = 'Users can only access their gardens') THEN
    DROP POLICY "Users can only access their gardens" ON gardens;
  END IF;
  CREATE POLICY "Users can only access their gardens"
    ON gardens FOR ALL
    USING ((select auth.uid()) = user_id);
END $$;

-- Garden Beds
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'garden_beds' AND policyname = 'Users can only access beds in their gardens') THEN
    DROP POLICY "Users can only access beds in their gardens" ON garden_beds;
  END IF;
  CREATE POLICY "Users can only access beds in their gardens"
    ON garden_beds FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM gardens
        WHERE gardens.id = garden_beds.garden_id
        AND gardens.user_id = (select auth.uid())
      )
    );
END $$;

-- Bed Planting History
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bed_planting_history' AND policyname = 'Users can only access history in their beds') THEN
    DROP POLICY "Users can only access history in their beds" ON bed_planting_history;
  END IF;
  CREATE POLICY "Users can only access history in their beds"
    ON bed_planting_history FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM garden_beds
        JOIN gardens ON gardens.id = garden_beds.garden_id
        WHERE garden_beds.id = bed_planting_history.bed_id
        AND gardens.user_id = (select auth.uid())
      )
    );
END $$;

-- Garden Tasks
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'garden_tasks' AND policyname = 'Users can only access tasks in their gardens') THEN
    DROP POLICY "Users can only access tasks in their gardens" ON garden_tasks;
  END IF;
  CREATE POLICY "Users can only access tasks in their gardens"
    ON garden_tasks FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM gardens
        WHERE gardens.id = garden_tasks.garden_id
        AND gardens.user_id = (select auth.uid())
      )
    );
END $$;

-- Harvest Logs
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'harvest_logs' AND policyname = 'Users can only access harvests in their gardens') THEN
    DROP POLICY "Users can only access harvests in their gardens" ON harvest_logs;
  END IF;
  CREATE POLICY "Users can only access harvests in their gardens"
    ON harvest_logs FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM gardens
        WHERE gardens.id = harvest_logs.garden_id
        AND gardens.user_id = (select auth.uid())
      )
    );
END $$;

-- Photo Logs
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'photo_logs' AND policyname = 'Users can only access photos in their gardens') THEN
    DROP POLICY "Users can only access photos in their gardens" ON photo_logs;
  END IF;
  CREATE POLICY "Users can only access photos in their gardens"
    ON photo_logs FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM gardens
        WHERE gardens.id = photo_logs.garden_id
        AND gardens.user_id = (select auth.uid())
      )
    );
END $$;

-- Seed Inventory
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seed_inventory' AND policyname = 'Users can only access their own seeds') THEN
    DROP POLICY "Users can only access their own seeds" ON seed_inventory;
  END IF;
  CREATE POLICY "Users can only access their own seeds"
    ON seed_inventory FOR ALL
    USING ((select auth.uid()) = user_id);
END $$;

-- Profiles
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can only access their own profile') THEN
    DROP POLICY "Users can only access their own profile" ON profiles;
  END IF;
  CREATE POLICY "Users can only access their own profile"
    ON profiles FOR ALL
    USING ((select auth.uid()) = id);
END $$;

-- Custom Plans (combina le due policies SELECT in una)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_plans' AND policyname = 'Users can view their own custom plans') THEN
    DROP POLICY "Users can view their own custom plans" ON custom_plans;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_plans' AND policyname = 'Users can view public custom plans') THEN
    DROP POLICY "Users can view public custom plans" ON custom_plans;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_plans' AND policyname = 'Users can view their own or public custom plans') THEN
    CREATE POLICY "Users can view their own or public custom plans"
      ON custom_plans FOR SELECT
      USING ((select auth.uid()) = user_id OR is_public = true);
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_plans' AND policyname = 'Users can create their own custom plans') THEN
    DROP POLICY "Users can create their own custom plans" ON custom_plans;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_plans' AND policyname = 'Users can create their own custom plans') THEN
    CREATE POLICY "Users can create their own custom plans"
      ON custom_plans FOR INSERT
      WITH CHECK ((select auth.uid()) = user_id);
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_plans' AND policyname = 'Users can update their own custom plans') THEN
    DROP POLICY "Users can update their own custom plans" ON custom_plans;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_plans' AND policyname = 'Users can update their own custom plans') THEN
    CREATE POLICY "Users can update their own custom plans"
      ON custom_plans FOR UPDATE
      USING ((select auth.uid()) = user_id);
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_plans' AND policyname = 'Users can delete their own custom plans') THEN
    DROP POLICY "Users can delete their own custom plans" ON custom_plans;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_plans' AND policyname = 'Users can delete their own custom plans') THEN
    CREATE POLICY "Users can delete their own custom plans"
      ON custom_plans FOR DELETE
      USING ((select auth.uid()) = user_id);
  END IF;
END $$;

-- ============================================
-- FIX FUNCTION SEARCH PATH
-- ============================================
-- Assicura che tutte le funzioni abbiano SET search_path = '' per sicurezza

-- grant_credits
CREATE OR REPLACE FUNCTION grant_credits(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET ai_credits_total = ai_credits_total + p_amount
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO profiles (id, tier, ai_credits_total, ai_credits_used)
    VALUES (p_user_id, 'FREE', p_amount, 0)
    ON CONFLICT (id) DO UPDATE
    SET ai_credits_total = profiles.ai_credits_total + p_amount;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- deduct_credits
CREATE OR REPLACE FUNCTION deduct_credits(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET ai_credits_used = ai_credits_used + p_amount
  WHERE id = p_user_id
    AND (ai_credits_total - ai_credits_used) >= p_amount;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- handle_new_user_credits
CREATE OR REPLACE FUNCTION handle_new_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO profiles (id, tier, ai_credits_total, ai_credits_used)
    VALUES (NEW.id, 'FREE', 3, 0)
    ON CONFLICT (id) DO NOTHING;
    
    IF NOT EXISTS (
      SELECT 1 FROM ai_credit_transactions 
      WHERE user_id = NEW.id 
        AND type = 'bonus' 
        AND description LIKE '%Welcome%'
    ) THEN
      PERFORM grant_credits(NEW.id, 3);
      
      INSERT INTO ai_credit_transactions (user_id, amount, type, description)
      VALUES (NEW.id, 3, 'bonus', 'Welcome bonus - 3 free AI credits')
      ON CONFLICT DO NOTHING;
    END IF;
    
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Error in handle_new_user_credits for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Trigger per handle_new_user_credits
DROP TRIGGER IF EXISTS on_user_created_credits ON auth.users CASCADE;
CREATE TRIGGER on_user_created_credits
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user_credits();

