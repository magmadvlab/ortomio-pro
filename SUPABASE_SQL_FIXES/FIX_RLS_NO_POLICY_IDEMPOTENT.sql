-- =====================================================
-- FIX: RLS Enabled No Policy (0008_rls_enabled_no_policy)
-- 16 tabelle con RLS attivo ma senza policy
-- IDEMPOTENT: Elimina policy vecchie prima di ricrearle
-- =====================================================

-- ============================================================
-- ORCHARD TABLES (via orchard_configurations → gardens.user_id)
-- ============================================================

-- 1. phenological_observations (ha orchard_id)
DROP POLICY IF EXISTS "Users can select phenological_observations" ON public.phenological_observations;
DROP POLICY IF EXISTS "Users can insert phenological_observations" ON public.phenological_observations;
DROP POLICY IF EXISTS "Users can update phenological_observations" ON public.phenological_observations;
DROP POLICY IF EXISTS "Users can delete phenological_observations" ON public.phenological_observations;

CREATE POLICY "Users can select phenological_observations" ON public.phenological_observations
  FOR SELECT USING (orchard_id IN (
    SELECT oc.id FROM orchard_configurations oc
    JOIN gardens g ON oc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert phenological_observations" ON public.phenological_observations
  FOR INSERT WITH CHECK (orchard_id IN (
    SELECT oc.id FROM orchard_configurations oc
    JOIN gardens g ON oc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));
CREATE POLICY "Users can update phenological_observations" ON public.phenological_observations
  FOR UPDATE USING (orchard_id IN (
    SELECT oc.id FROM orchard_configurations oc
    JOIN gardens g ON oc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete phenological_observations" ON public.phenological_observations
  FOR DELETE USING (orchard_id IN (
    SELECT oc.id FROM orchard_configurations oc
    JOIN gardens g ON oc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));

-- 2. pruning_schedules (ha orchard_id)
DROP POLICY IF EXISTS "Users can select pruning_schedules" ON public.pruning_schedules;
DROP POLICY IF EXISTS "Users can insert pruning_schedules" ON public.pruning_schedules;
DROP POLICY IF EXISTS "Users can update pruning_schedules" ON public.pruning_schedules;
DROP POLICY IF EXISTS "Users can delete pruning_schedules" ON public.pruning_schedules;

CREATE POLICY "Users can select pruning_schedules" ON public.pruning_schedules
  FOR SELECT USING (orchard_id IN (
    SELECT oc.id FROM orchard_configurations oc
    JOIN gardens g ON oc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert pruning_schedules" ON public.pruning_schedules
  FOR INSERT WITH CHECK (orchard_id IN (
    SELECT oc.id FROM orchard_configurations oc
    JOIN gardens g ON oc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));
CREATE POLICY "Users can update pruning_schedules" ON public.pruning_schedules
  FOR UPDATE USING (orchard_id IN (
    SELECT oc.id FROM orchard_configurations oc
    JOIN gardens g ON oc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete pruning_schedules" ON public.pruning_schedules
  FOR DELETE USING (orchard_id IN (
    SELECT oc.id FROM orchard_configurations oc
    JOIN gardens g ON oc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));

-- 3. tree_pruning_records (ha tree_id → orchard_trees.garden_id)
DROP POLICY IF EXISTS "Users can select tree_pruning_records" ON public.tree_pruning_records;
DROP POLICY IF EXISTS "Users can insert tree_pruning_records" ON public.tree_pruning_records;
DROP POLICY IF EXISTS "Users can update tree_pruning_records" ON public.tree_pruning_records;
DROP POLICY IF EXISTS "Users can delete tree_pruning_records" ON public.tree_pruning_records;

CREATE POLICY "Users can select tree_pruning_records" ON public.tree_pruning_records
  FOR SELECT USING (tree_id IN (
    SELECT ot.id FROM orchard_trees ot
    WHERE ot.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));
CREATE POLICY "Users can insert tree_pruning_records" ON public.tree_pruning_records
  FOR INSERT WITH CHECK (tree_id IN (
    SELECT ot.id FROM orchard_trees ot
    WHERE ot.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));
CREATE POLICY "Users can update tree_pruning_records" ON public.tree_pruning_records
  FOR UPDATE USING (tree_id IN (
    SELECT ot.id FROM orchard_trees ot
    WHERE ot.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));
CREATE POLICY "Users can delete tree_pruning_records" ON public.tree_pruning_records
  FOR DELETE USING (tree_id IN (
    SELECT ot.id FROM orchard_trees ot
    WHERE ot.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));

-- 4. harvest_schedules (ha orchard_id)
DROP POLICY IF EXISTS "Users can select harvest_schedules" ON public.harvest_schedules;
DROP POLICY IF EXISTS "Users can insert harvest_schedules" ON public.harvest_schedules;
DROP POLICY IF EXISTS "Users can update harvest_schedules" ON public.harvest_schedules;
DROP POLICY IF EXISTS "Users can delete harvest_schedules" ON public.harvest_schedules;

CREATE POLICY "Users can select harvest_schedules" ON public.harvest_schedules
  FOR SELECT USING (orchard_id IN (
    SELECT oc.id FROM orchard_configurations oc
    JOIN gardens g ON oc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert harvest_schedules" ON public.harvest_schedules
  FOR INSERT WITH CHECK (orchard_id IN (
    SELECT oc.id FROM orchard_configurations oc
    JOIN gardens g ON oc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));
CREATE POLICY "Users can update harvest_schedules" ON public.harvest_schedules
  FOR UPDATE USING (orchard_id IN (
    SELECT oc.id FROM orchard_configurations oc
    JOIN gardens g ON oc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete harvest_schedules" ON public.harvest_schedules
  FOR DELETE USING (orchard_id IN (
    SELECT oc.id FROM orchard_configurations oc
    JOIN gardens g ON oc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));

-- 5. tree_harvest_records (ha tree_id → orchard_trees.garden_id)
DROP POLICY IF EXISTS "Users can select tree_harvest_records" ON public.tree_harvest_records;
DROP POLICY IF EXISTS "Users can insert tree_harvest_records" ON public.tree_harvest_records;
DROP POLICY IF EXISTS "Users can update tree_harvest_records" ON public.tree_harvest_records;
DROP POLICY IF EXISTS "Users can delete tree_harvest_records" ON public.tree_harvest_records;

CREATE POLICY "Users can select tree_harvest_records" ON public.tree_harvest_records
  FOR SELECT USING (tree_id IN (
    SELECT ot.id FROM orchard_trees ot
    WHERE ot.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));
CREATE POLICY "Users can insert tree_harvest_records" ON public.tree_harvest_records
  FOR INSERT WITH CHECK (tree_id IN (
    SELECT ot.id FROM orchard_trees ot
    WHERE ot.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));
CREATE POLICY "Users can update tree_harvest_records" ON public.tree_harvest_records
  FOR UPDATE USING (tree_id IN (
    SELECT ot.id FROM orchard_trees ot
    WHERE ot.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));
CREATE POLICY "Users can delete tree_harvest_records" ON public.tree_harvest_records
  FOR DELETE USING (tree_id IN (
    SELECT ot.id FROM orchard_trees ot
    WHERE ot.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));

-- 6. tree_treatments (ha tree_id → orchard_trees.garden_id)
DROP POLICY IF EXISTS "Users can select tree_treatments" ON public.tree_treatments;
DROP POLICY IF EXISTS "Users can insert tree_treatments" ON public.tree_treatments;
DROP POLICY IF EXISTS "Users can update tree_treatments" ON public.tree_treatments;
DROP POLICY IF EXISTS "Users can delete tree_treatments" ON public.tree_treatments;

CREATE POLICY "Users can select tree_treatments" ON public.tree_treatments
  FOR SELECT USING (tree_id IN (
    SELECT ot.id FROM orchard_trees ot
    WHERE ot.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));
CREATE POLICY "Users can insert tree_treatments" ON public.tree_treatments
  FOR INSERT WITH CHECK (tree_id IN (
    SELECT ot.id FROM orchard_trees ot
    WHERE ot.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));
CREATE POLICY "Users can update tree_treatments" ON public.tree_treatments
  FOR UPDATE USING (tree_id IN (
    SELECT ot.id FROM orchard_trees ot
    WHERE ot.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));
CREATE POLICY "Users can delete tree_treatments" ON public.tree_treatments
  FOR DELETE USING (tree_id IN (
    SELECT ot.id FROM orchard_trees ot
    WHERE ot.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));

-- 7. orchard_analytics (ha orchard_id)
DROP POLICY IF EXISTS "Users can select orchard_analytics" ON public.orchard_analytics;
DROP POLICY IF EXISTS "Users can insert orchard_analytics" ON public.orchard_analytics;
DROP POLICY IF EXISTS "Users can update orchard_analytics" ON public.orchard_analytics;
DROP POLICY IF EXISTS "Users can delete orchard_analytics" ON public.orchard_analytics;

CREATE POLICY "Users can select orchard_analytics" ON public.orchard_analytics
  FOR SELECT USING (orchard_id IN (
    SELECT oc.id FROM orchard_configurations oc
    JOIN gardens g ON oc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert orchard_analytics" ON public.orchard_analytics
  FOR INSERT WITH CHECK (orchard_id IN (
    SELECT oc.id FROM orchard_configurations oc
    JOIN gardens g ON oc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));
CREATE POLICY "Users can update orchard_analytics" ON public.orchard_analytics
  FOR UPDATE USING (orchard_id IN (
    SELECT oc.id FROM orchard_configurations oc
    JOIN gardens g ON oc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete orchard_analytics" ON public.orchard_analytics
  FOR DELETE USING (orchard_id IN (
    SELECT oc.id FROM orchard_configurations oc
    JOIN gardens g ON oc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));

-- ============================================================
-- VINEYARD TABLES (via vineyard_configurations → gardens.user_id)
-- ============================================================

-- 8. vine_photos (ha vine_id → vineyard_vines.garden_id)
DROP POLICY IF EXISTS "Users can select vine_photos" ON public.vine_photos;
DROP POLICY IF EXISTS "Users can insert vine_photos" ON public.vine_photos;
DROP POLICY IF EXISTS "Users can update vine_photos" ON public.vine_photos;
DROP POLICY IF EXISTS "Users can delete vine_photos" ON public.vine_photos;

CREATE POLICY "Users can select vine_photos" ON public.vine_photos
  FOR SELECT USING (vine_id IN (
    SELECT vv.id FROM vineyard_vines vv
    WHERE vv.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));
CREATE POLICY "Users can insert vine_photos" ON public.vine_photos
  FOR INSERT WITH CHECK (vine_id IN (
    SELECT vv.id FROM vineyard_vines vv
    WHERE vv.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));
CREATE POLICY "Users can update vine_photos" ON public.vine_photos
  FOR UPDATE USING (vine_id IN (
    SELECT vv.id FROM vineyard_vines vv
    WHERE vv.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));
CREATE POLICY "Users can delete vine_photos" ON public.vine_photos
  FOR DELETE USING (vine_id IN (
    SELECT vv.id FROM vineyard_vines vv
    WHERE vv.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));

-- 9. vineyard_phenological_observations (ha vineyard_id)
DROP POLICY IF EXISTS "Users can select vineyard_phenological_observations" ON public.vineyard_phenological_observations;
DROP POLICY IF EXISTS "Users can insert vineyard_phenological_observations" ON public.vineyard_phenological_observations;
DROP POLICY IF EXISTS "Users can update vineyard_phenological_observations" ON public.vineyard_phenological_observations;
DROP POLICY IF EXISTS "Users can delete vineyard_phenological_observations" ON public.vineyard_phenological_observations;

CREATE POLICY "Users can select vineyard_phenological_observations" ON public.vineyard_phenological_observations
  FOR SELECT USING (vineyard_id IN (
    SELECT vc.id FROM vineyard_configurations vc
    JOIN gardens g ON vc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert vineyard_phenological_observations" ON public.vineyard_phenological_observations
  FOR INSERT WITH CHECK (vineyard_id IN (
    SELECT vc.id FROM vineyard_configurations vc
    JOIN gardens g ON vc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));
CREATE POLICY "Users can update vineyard_phenological_observations" ON public.vineyard_phenological_observations
  FOR UPDATE USING (vineyard_id IN (
    SELECT vc.id FROM vineyard_configurations vc
    JOIN gardens g ON vc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete vineyard_phenological_observations" ON public.vineyard_phenological_observations
  FOR DELETE USING (vineyard_id IN (
    SELECT vc.id FROM vineyard_configurations vc
    JOIN gardens g ON vc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));

-- 10. vineyard_pruning_schedules (ha vineyard_id)
DROP POLICY IF EXISTS "Users can select vineyard_pruning_schedules" ON public.vineyard_pruning_schedules;
DROP POLICY IF EXISTS "Users can insert vineyard_pruning_schedules" ON public.vineyard_pruning_schedules;
DROP POLICY IF EXISTS "Users can update vineyard_pruning_schedules" ON public.vineyard_pruning_schedules;
DROP POLICY IF EXISTS "Users can delete vineyard_pruning_schedules" ON public.vineyard_pruning_schedules;

CREATE POLICY "Users can select vineyard_pruning_schedules" ON public.vineyard_pruning_schedules
  FOR SELECT USING (vineyard_id IN (
    SELECT vc.id FROM vineyard_configurations vc
    JOIN gardens g ON vc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert vineyard_pruning_schedules" ON public.vineyard_pruning_schedules
  FOR INSERT WITH CHECK (vineyard_id IN (
    SELECT vc.id FROM vineyard_configurations vc
    JOIN gardens g ON vc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));
CREATE POLICY "Users can update vineyard_pruning_schedules" ON public.vineyard_pruning_schedules
  FOR UPDATE USING (vineyard_id IN (
    SELECT vc.id FROM vineyard_configurations vc
    JOIN gardens g ON vc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete vineyard_pruning_schedules" ON public.vineyard_pruning_schedules
  FOR DELETE USING (vineyard_id IN (
    SELECT vc.id FROM vineyard_configurations vc
    JOIN gardens g ON vc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));

-- 11. vine_pruning_records (ha vine_id → vineyard_vines.garden_id)
DROP POLICY IF EXISTS "Users can select vine_pruning_records" ON public.vine_pruning_records;
DROP POLICY IF EXISTS "Users can insert vine_pruning_records" ON public.vine_pruning_records;
DROP POLICY IF EXISTS "Users can update vine_pruning_records" ON public.vine_pruning_records;
DROP POLICY IF EXISTS "Users can delete vine_pruning_records" ON public.vine_pruning_records;

CREATE POLICY "Users can select vine_pruning_records" ON public.vine_pruning_records
  FOR SELECT USING (vine_id IN (
    SELECT vv.id FROM vineyard_vines vv
    WHERE vv.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));
CREATE POLICY "Users can insert vine_pruning_records" ON public.vine_pruning_records
  FOR INSERT WITH CHECK (vine_id IN (
    SELECT vv.id FROM vineyard_vines vv
    WHERE vv.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));
CREATE POLICY "Users can update vine_pruning_records" ON public.vine_pruning_records
  FOR UPDATE USING (vine_id IN (
    SELECT vv.id FROM vineyard_vines vv
    WHERE vv.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));
CREATE POLICY "Users can delete vine_pruning_records" ON public.vine_pruning_records
  FOR DELETE USING (vine_id IN (
    SELECT vv.id FROM vineyard_vines vv
    WHERE vv.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));

-- 12. vineyard_harvest_schedules (ha vineyard_id)
DROP POLICY IF EXISTS "Users can select vineyard_harvest_schedules" ON public.vineyard_harvest_schedules;
DROP POLICY IF EXISTS "Users can insert vineyard_harvest_schedules" ON public.vineyard_harvest_schedules;
DROP POLICY IF EXISTS "Users can update vineyard_harvest_schedules" ON public.vineyard_harvest_schedules;
DROP POLICY IF EXISTS "Users can delete vineyard_harvest_schedules" ON public.vineyard_harvest_schedules;

CREATE POLICY "Users can select vineyard_harvest_schedules" ON public.vineyard_harvest_schedules
  FOR SELECT USING (vineyard_id IN (
    SELECT vc.id FROM vineyard_configurations vc
    JOIN gardens g ON vc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert vineyard_harvest_schedules" ON public.vineyard_harvest_schedules
  FOR INSERT WITH CHECK (vineyard_id IN (
    SELECT vc.id FROM vineyard_configurations vc
    JOIN gardens g ON vc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));
CREATE POLICY "Users can update vineyard_harvest_schedules" ON public.vineyard_harvest_schedules
  FOR UPDATE USING (vineyard_id IN (
    SELECT vc.id FROM vineyard_configurations vc
    JOIN gardens g ON vc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete vineyard_harvest_schedules" ON public.vineyard_harvest_schedules
  FOR DELETE USING (vineyard_id IN (
    SELECT vc.id FROM vineyard_configurations vc
    JOIN gardens g ON vc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));

-- 13. vine_harvest_records (ha vine_id → vineyard_vines.garden_id)
DROP POLICY IF EXISTS "Users can select vine_harvest_records" ON public.vine_harvest_records;
DROP POLICY IF EXISTS "Users can insert vine_harvest_records" ON public.vine_harvest_records;
DROP POLICY IF EXISTS "Users can update vine_harvest_records" ON public.vine_harvest_records;
DROP POLICY IF EXISTS "Users can delete vine_harvest_records" ON public.vine_harvest_records;

CREATE POLICY "Users can select vine_harvest_records" ON public.vine_harvest_records
  FOR SELECT USING (vine_id IN (
    SELECT vv.id FROM vineyard_vines vv
    WHERE vv.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));
CREATE POLICY "Users can insert vine_harvest_records" ON public.vine_harvest_records
  FOR INSERT WITH CHECK (vine_id IN (
    SELECT vv.id FROM vineyard_vines vv
    WHERE vv.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));
CREATE POLICY "Users can update vine_harvest_records" ON public.vine_harvest_records
  FOR UPDATE USING (vine_id IN (
    SELECT vv.id FROM vineyard_vines vv
    WHERE vv.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));
CREATE POLICY "Users can delete vine_harvest_records" ON public.vine_harvest_records
  FOR DELETE USING (vine_id IN (
    SELECT vv.id FROM vineyard_vines vv
    WHERE vv.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));

-- 14. vine_treatments (ha vine_id → vineyard_vines.garden_id)
DROP POLICY IF EXISTS "Users can select vine_treatments" ON public.vine_treatments;
DROP POLICY IF EXISTS "Users can insert vine_treatments" ON public.vine_treatments;
DROP POLICY IF EXISTS "Users can update vine_treatments" ON public.vine_treatments;
DROP POLICY IF EXISTS "Users can delete vine_treatments" ON public.vine_treatments;

CREATE POLICY "Users can select vine_treatments" ON public.vine_treatments
  FOR SELECT USING (vine_id IN (
    SELECT vv.id FROM vineyard_vines vv
    WHERE vv.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));
CREATE POLICY "Users can insert vine_treatments" ON public.vine_treatments
  FOR INSERT WITH CHECK (vine_id IN (
    SELECT vv.id FROM vineyard_vines vv
    WHERE vv.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));
CREATE POLICY "Users can update vine_treatments" ON public.vine_treatments
  FOR UPDATE USING (vine_id IN (
    SELECT vv.id FROM vineyard_vines vv
    WHERE vv.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));
CREATE POLICY "Users can delete vine_treatments" ON public.vine_treatments
  FOR DELETE USING (vine_id IN (
    SELECT vv.id FROM vineyard_vines vv
    WHERE vv.garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  ));

-- 15. vineyard_analytics (ha vineyard_id)
DROP POLICY IF EXISTS "Users can select vineyard_analytics" ON public.vineyard_analytics;
DROP POLICY IF EXISTS "Users can insert vineyard_analytics" ON public.vineyard_analytics;
DROP POLICY IF EXISTS "Users can update vineyard_analytics" ON public.vineyard_analytics;
DROP POLICY IF EXISTS "Users can delete vineyard_analytics" ON public.vineyard_analytics;

CREATE POLICY "Users can select vineyard_analytics" ON public.vineyard_analytics
  FOR SELECT USING (vineyard_id IN (
    SELECT vc.id FROM vineyard_configurations vc
    JOIN gardens g ON vc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert vineyard_analytics" ON public.vineyard_analytics
  FOR INSERT WITH CHECK (vineyard_id IN (
    SELECT vc.id FROM vineyard_configurations vc
    JOIN gardens g ON vc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));
CREATE POLICY "Users can update vineyard_analytics" ON public.vineyard_analytics
  FOR UPDATE USING (vineyard_id IN (
    SELECT vc.id FROM vineyard_configurations vc
    JOIN gardens g ON vc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete vineyard_analytics" ON public.vineyard_analytics
  FOR DELETE USING (vineyard_id IN (
    SELECT vc.id FROM vineyard_configurations vc
    JOIN gardens g ON vc.garden_id = g.id
    WHERE g.user_id = auth.uid()
  ));

-- ============================================================
-- REFERENCE TABLE (nessuna ownership utente)
-- ============================================================

-- 16. product_compatibility (tabella di riferimento condivisa, sola lettura per utenti auth)
DROP POLICY IF EXISTS "Authenticated users can read product_compatibility" ON public.product_compatibility;

CREATE POLICY "Authenticated users can read product_compatibility" ON public.product_compatibility
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- VERIFICA
-- ============================================================
SELECT
  tablename,
  COUNT(*) AS num_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'harvest_schedules','orchard_analytics','phenological_observations',
    'product_compatibility','pruning_schedules','tree_harvest_records',
    'tree_pruning_records','tree_treatments','vine_harvest_records',
    'vine_photos','vine_pruning_records','vine_treatments',
    'vineyard_analytics','vineyard_harvest_schedules',
    'vineyard_phenological_observations','vineyard_pruning_schedules'
  )
GROUP BY tablename
ORDER BY tablename;
