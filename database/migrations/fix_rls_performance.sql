-- ============================================
-- Fix RLS Performance Issues
-- Corregge tutte le RLS policies per usare (select auth.uid()) invece di auth.uid()
-- Risolve anche le multiple permissive policies per custom_plans
-- ============================================

-- Gardens
DROP POLICY IF EXISTS "Users can only access their gardens" ON gardens;
CREATE POLICY "Users can only access their gardens"
  ON gardens FOR ALL
  USING ((select auth.uid()) = user_id);

-- Garden Beds
DROP POLICY IF EXISTS "Users can only access beds in their gardens" ON garden_beds;
CREATE POLICY "Users can only access beds in their gardens"
  ON garden_beds FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_beds.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

-- Bed Planting History
DROP POLICY IF EXISTS "Users can only access history in their beds" ON bed_planting_history;
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

-- Garden Tasks
DROP POLICY IF EXISTS "Users can only access tasks in their gardens" ON garden_tasks;
CREATE POLICY "Users can only access tasks in their gardens"
  ON garden_tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_tasks.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

-- Harvest Logs
DROP POLICY IF EXISTS "Users can only access harvests in their gardens" ON harvest_logs;
CREATE POLICY "Users can only access harvests in their gardens"
  ON harvest_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = harvest_logs.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

-- Photo Logs
DROP POLICY IF EXISTS "Users can only access photos in their gardens" ON photo_logs;
CREATE POLICY "Users can only access photos in their gardens"
  ON photo_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = photo_logs.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

-- Seed Inventory
DROP POLICY IF EXISTS "Users can only access their own seeds" ON seed_inventory;
CREATE POLICY "Users can only access their own seeds"
  ON seed_inventory FOR ALL
  USING ((select auth.uid()) = user_id);

-- Seedling Batches
DROP POLICY IF EXISTS "Users can access seedling batches in their gardens" ON seedling_batches;
CREATE POLICY "Users can access seedling batches in their gardens"
  ON seedling_batches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = seedling_batches.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

-- Custom Plans (combina le due policies SELECT in una)
DROP POLICY IF EXISTS "Users can view their own custom plans" ON custom_plans;
DROP POLICY IF EXISTS "Users can view public custom plans" ON custom_plans;
CREATE POLICY "Users can view their own or public custom plans"
  ON custom_plans FOR SELECT
  USING ((select auth.uid()) = user_id OR is_public = true);

DROP POLICY IF EXISTS "Users can create their own custom plans" ON custom_plans;
CREATE POLICY "Users can create their own custom plans"
  ON custom_plans FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own custom plans" ON custom_plans;
CREATE POLICY "Users can update their own custom plans"
  ON custom_plans FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own custom plans" ON custom_plans;
CREATE POLICY "Users can delete their own custom plans"
  ON custom_plans FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Agronomists
DROP POLICY IF EXISTS "Users can manage their own agronomists" ON agronomists;
CREATE POLICY "Users can manage their own agronomists"
  ON agronomists FOR ALL
  USING ((select auth.uid()) = user_id);

-- Agronomist Consultations
DROP POLICY IF EXISTS "Users can manage their own consultations" ON agronomist_consultations;
CREATE POLICY "Users can manage their own consultations"
  ON agronomist_consultations FOR ALL
  USING ((select auth.uid()) = user_id);

-- Agronomist Advice
DROP POLICY IF EXISTS "Users can view advice from their consultations" ON agronomist_advice;
CREATE POLICY "Users can view advice from their consultations"
  ON agronomist_advice FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agronomist_consultations
      WHERE agronomist_consultations.id = agronomist_advice.consultation_id
      AND agronomist_consultations.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update advice from their consultations" ON agronomist_advice;
CREATE POLICY "Users can update advice from their consultations"
  ON agronomist_advice FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM agronomist_consultations
      WHERE agronomist_consultations.id = agronomist_advice.consultation_id
      AND agronomist_consultations.user_id = (select auth.uid())
    )
  );

-- Garden Obstacles
DROP POLICY IF EXISTS "Users can view obstacles in their gardens" ON garden_obstacles;
CREATE POLICY "Users can view obstacles in their gardens"
  ON garden_obstacles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_obstacles.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create obstacles in their gardens" ON garden_obstacles;
CREATE POLICY "Users can create obstacles in their gardens"
  ON garden_obstacles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_obstacles.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update obstacles in their gardens" ON garden_obstacles;
CREATE POLICY "Users can update obstacles in their gardens"
  ON garden_obstacles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_obstacles.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete obstacles in their gardens" ON garden_obstacles;
CREATE POLICY "Users can delete obstacles in their gardens"
  ON garden_obstacles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_obstacles.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

-- Garden Accessories
DROP POLICY IF EXISTS "Users can access accessories in their gardens" ON garden_accessories;
CREATE POLICY "Users can access accessories in their gardens"
  ON garden_accessories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_accessories.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

-- Hydroponic Readings
DROP POLICY IF EXISTS "Users can access hydroponic readings in their gardens" ON hydroponic_readings;
CREATE POLICY "Users can access hydroponic readings in their gardens"
  ON hydroponic_readings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = hydroponic_readings.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

-- Aquaponic Readings
DROP POLICY IF EXISTS "Users can access aquaponic readings in their gardens" ON aquaponic_readings;
CREATE POLICY "Users can access aquaponic readings in their gardens"
  ON aquaponic_readings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = aquaponic_readings.garden_id
      AND gardens.user_id = (select auth.uid())
    )
  );

-- Profiles
DROP POLICY IF EXISTS "Users can only access their own profile" ON profiles;
CREATE POLICY "Users can only access their own profile"
  ON profiles FOR ALL
  USING ((select auth.uid()) = id);

-- AI Credit Transactions
DROP POLICY IF EXISTS "Users can only access their own transactions" ON ai_credit_transactions;
CREATE POLICY "Users can only access their own transactions"
  ON ai_credit_transactions FOR ALL
  USING ((select auth.uid()) = user_id);

-- Professional Analytics
DROP POLICY IF EXISTS "Users can only access their own analytics" ON professional_analytics;
CREATE POLICY "Users can only access their own analytics"
  ON professional_analytics FOR ALL
  USING ((select auth.uid()) = user_id);

-- Treatment Register
DROP POLICY IF EXISTS "Users can only access their own treatments" ON treatment_register;
CREATE POLICY "Users can only access their own treatments"
  ON treatment_register FOR ALL
  USING ((select auth.uid()) = user_id);

-- Mechanical Work Register
DROP POLICY IF EXISTS "Users can only access their own mechanical work" ON mechanical_work_register;
CREATE POLICY "Users can only access their own mechanical work"
  ON mechanical_work_register FOR ALL
  USING ((select auth.uid()) = user_id);

-- Calendar Tasks
DROP POLICY IF EXISTS "Users can view their own calendar tasks" ON calendar_tasks;
CREATE POLICY "Users can view their own calendar tasks"
  ON calendar_tasks FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own calendar tasks" ON calendar_tasks;
CREATE POLICY "Users can insert their own calendar tasks"
  ON calendar_tasks FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own calendar tasks" ON calendar_tasks;
CREATE POLICY "Users can update their own calendar tasks"
  ON calendar_tasks FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own calendar tasks" ON calendar_tasks;
CREATE POLICY "Users can delete their own calendar tasks"
  ON calendar_tasks FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Challenge Completions
DROP POLICY IF EXISTS "Users can view their own challenge completions" ON challenge_completions;
CREATE POLICY "Users can view their own challenge completions"
  ON challenge_completions FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own challenge completions" ON challenge_completions;
CREATE POLICY "Users can insert their own challenge completions"
  ON challenge_completions FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own challenge completions" ON challenge_completions;
CREATE POLICY "Users can update their own challenge completions"
  ON challenge_completions FOR UPDATE
  USING ((select auth.uid()) = user_id);

-- User Badges
DROP POLICY IF EXISTS "Users can view their own badges" ON user_badges;
CREATE POLICY "Users can view their own badges"
  ON user_badges FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own badges" ON user_badges;
CREATE POLICY "Users can insert their own badges"
  ON user_badges FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================
-- COMPLETATO!
-- ============================================
-- Tutte le RLS policies sono state aggiornate per migliorare le performance.
-- Le multiple permissive policies per custom_plans sono state risolte.
-- ============================================

