-- Migration: Add RLS Policies for Irrigation Components and Watering Logs
-- Aggiunge policy RLS mancanti per irrigation_components e watering_logs
-- Queste tabelle hanno RLS abilitato ma non hanno policy create
--
-- Data: 2025-01-XX
-- Descrizione: Aggiunge policy RLS per sicurezza su tabelle sistema irrigazione

-- ============================================
-- IRRIGATION COMPONENTS
-- ============================================
-- Rimuovi policy esistenti se presenti (per evitare conflitti)
DROP POLICY IF EXISTS "Users can only access irrigation components in their gardens" ON irrigation_components;
DROP POLICY IF EXISTS "Users can only access irrigation components in their zones" ON irrigation_components;

-- Policy: SELECT/INSERT/UPDATE/DELETE solo per utenti che possiedono il giardino
-- Controlla attraverso: irrigation_components → irrigation_zones → gardens → user_id
CREATE POLICY "Users can only access irrigation components in their gardens"
  ON irrigation_components FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM irrigation_zones iz
      JOIN gardens g ON iz.garden_id = g.id
      WHERE iz.id = irrigation_components.zone_id
      AND g.user_id = auth.uid()
    )
  );

-- ============================================
-- WATERING LOGS
-- ============================================
-- Rimuovi policy esistenti se presenti (per evitare conflitti)
DROP POLICY IF EXISTS "Users can only access watering logs in their gardens" ON watering_logs;
DROP POLICY IF EXISTS "Users can only access watering logs in their zones" ON watering_logs;

-- Policy: SELECT/INSERT/UPDATE/DELETE solo per utenti che possiedono il giardino
-- Controlla attraverso: watering_logs → irrigation_zones → gardens → user_id
CREATE POLICY "Users can only access watering logs in their gardens"
  ON watering_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM irrigation_zones iz
      JOIN gardens g ON iz.garden_id = g.id
      WHERE iz.id = watering_logs.zone_id
      AND g.user_id = auth.uid()
    )
  );

-- ============================================
-- Verifica che le policy siano state create
-- ============================================
DO $$
DECLARE
  components_policy_count INTEGER;
  watering_logs_policy_count INTEGER;
BEGIN
  -- Conta policy per irrigation_components
  SELECT COUNT(*) INTO components_policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename = 'irrigation_components';

  -- Conta policy per watering_logs
  SELECT COUNT(*) INTO watering_logs_policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename = 'watering_logs';

  IF components_policy_count > 0 THEN
    RAISE NOTICE '✅ Policy create per irrigation_components: %', components_policy_count;
  ELSE
    RAISE WARNING '⚠️ Nessuna policy trovata per irrigation_components';
  END IF;

  IF watering_logs_policy_count > 0 THEN
    RAISE NOTICE '✅ Policy create per watering_logs: %', watering_logs_policy_count;
  ELSE
    RAISE WARNING '⚠️ Nessuna policy trovata per watering_logs';
  END IF;
END $$;

