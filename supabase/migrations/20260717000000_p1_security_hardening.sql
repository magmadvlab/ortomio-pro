-- P1 security hardening.
-- Additive remediation for the Supabase Security Advisor export dated 2026-07-16.

BEGIN;

-- Views must evaluate RLS and grants as the caller.
ALTER VIEW public.ai_suggestions_prioritized SET (security_invoker = true);
ALTER VIEW public.field_row_rotation_analysis SET (security_invoker = true);
ALTER VIEW public.crop_performance_by_family SET (security_invoker = true);
ALTER VIEW public.agronomic_operation_outcome_projection SET (security_invoker = true);
ALTER VIEW public.agronomic_operation_signal_projection SET (security_invoker = true);
ALTER VIEW public.agronomic_precision_execution_projection SET (security_invoker = true);

-- Apply function changes conditionally because the remote project contains a
-- few historical overloads that are absent from a clean local replay.
DO $p1$
DECLARE
  ddl text;
BEGIN
  FOREACH ddl IN ARRAY ARRAY[
    -- Mutable search paths reported by Security Advisor.
    'ALTER FUNCTION public.update_orchard_updated_at() SET search_path = public, pg_temp',
    'ALTER FUNCTION public.set_updated_at_timestamp() SET search_path = public, pg_temp',
    'ALTER FUNCTION public.get_field_row_history(uuid) SET search_path = public, pg_temp',
    'ALTER FUNCTION public.calculate_rotation_score(uuid, text) SET search_path = public, pg_temp',
    'ALTER FUNCTION public.get_rotation_suggestions(uuid) SET search_path = public, pg_temp',
    'ALTER FUNCTION public.sync_sensor_readings_timestamp_columns() SET search_path = public, pg_temp',
    'ALTER FUNCTION public.update_agronomic_ledger_updated_at() SET search_path = public, pg_temp',
    'ALTER FUNCTION public.generate_ggn_code() SET search_path = public, pg_temp',
    'ALTER FUNCTION public.generate_lot_code() SET search_path = public, pg_temp',

    -- Browser RPCs use invoker semantics so table RLS is authoritative.
    'ALTER FUNCTION public.calculate_rotation_score(uuid, text) SECURITY INVOKER',
    'ALTER FUNCTION public.get_rotation_suggestions(uuid) SECURITY INVOKER',
    'ALTER FUNCTION public.get_zone_history(uuid, integer) SECURITY INVOKER',
    'ALTER FUNCTION public.calculate_zone_soil_health(uuid) SECURITY INVOKER',
    'ALTER FUNCTION public.get_zone_rotation_suggestions(uuid, integer) SECURITY INVOKER',
    'REVOKE ALL ON FUNCTION public.calculate_rotation_score(uuid, text) FROM PUBLIC, anon',
    'REVOKE ALL ON FUNCTION public.get_rotation_suggestions(uuid) FROM PUBLIC, anon',
    'REVOKE ALL ON FUNCTION public.get_zone_history(uuid, integer) FROM PUBLIC, anon',
    'REVOKE ALL ON FUNCTION public.calculate_zone_soil_health(uuid) FROM PUBLIC, anon',
    'REVOKE ALL ON FUNCTION public.get_zone_rotation_suggestions(uuid, integer) FROM PUBLIC, anon',
    'GRANT EXECUTE ON FUNCTION public.calculate_rotation_score(uuid, text) TO authenticated',
    'GRANT EXECUTE ON FUNCTION public.get_rotation_suggestions(uuid) TO authenticated',
    'GRANT EXECUTE ON FUNCTION public.get_zone_history(uuid, integer) TO authenticated',
    'GRANT EXECUTE ON FUNCTION public.calculate_zone_soil_health(uuid) TO authenticated',
    'GRANT EXECUTE ON FUNCTION public.get_zone_rotation_suggestions(uuid, integer) TO authenticated',

    -- Internal triggers and server-side operations are not public RPCs.
    'REVOKE EXECUTE ON FUNCTION public.advance_cultivation_phase(uuid, text, text, integer, text, jsonb) FROM PUBLIC, anon, authenticated',
    'REVOKE EXECUTE ON FUNCTION public.advance_cultivation_phase_validated(uuid, text, text, integer, text, jsonb, jsonb) FROM PUBLIC, anon, authenticated',
    'REVOKE EXECUTE ON FUNCTION public.auto_calculate_statistics() FROM PUBLIC, anon, authenticated',
    'REVOKE EXECUTE ON FUNCTION public.calculate_cultivation_statistics(uuid, uuid, date, date) FROM PUBLIC, anon, authenticated',
    'REVOKE EXECUTE ON FUNCTION public.check_rotation_compliance(uuid, text) FROM PUBLIC, anon, authenticated',
    'REVOKE EXECUTE ON FUNCTION public.consume_seed_inventory() FROM PUBLIC, anon, authenticated',
    'REVOKE EXECUTE ON FUNCTION public.create_default_notification_preferences() FROM PUBLIC, anon, authenticated',
    'REVOKE EXECUTE ON FUNCTION public.create_system_roles_for_organization(uuid) FROM PUBLIC, anon, authenticated',
    'REVOKE EXECUTE ON FUNCTION public.get_available_materials(uuid, text) FROM PUBLIC, anon, authenticated',
    'REVOKE EXECUTE ON FUNCTION public.get_field_row_history(uuid) FROM PUBLIC, anon, authenticated',
    'REVOKE EXECUTE ON FUNCTION public.get_or_create_notification_preferences(uuid) FROM PUBLIC, anon, authenticated',
    'REVOKE EXECUTE ON FUNCTION public.get_recurring_issues(uuid, text, integer) FROM PUBLIC, anon, authenticated',
    'REVOKE EXECUTE ON FUNCTION public.grant_credits(uuid, integer) FROM PUBLIC, anon, authenticated',
    'REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated',
    'REVOKE EXECUTE ON FUNCTION public.handle_new_user_credits() FROM PUBLIC, anon, authenticated',
    'REVOKE EXECUTE ON FUNCTION public.handle_phase_specific_actions(uuid, text, integer) FROM PUBLIC, anon, authenticated',
    'REVOKE EXECUTE ON FUNCTION public.initialize_default_certifications() FROM PUBLIC, anon, authenticated',
    'REVOKE EXECUTE ON FUNCTION public.initialize_default_certifications(uuid) FROM PUBLIC, anon, authenticated',
    'REVOKE EXECUTE ON FUNCTION public.manage_sapling_inventory() FROM PUBLIC, anon, authenticated',
    'REVOKE EXECUTE ON FUNCTION public.update_haccp_certification_status() FROM PUBLIC, anon, authenticated',
    'REVOKE EXECUTE ON FUNCTION public.update_orchard_statistics(uuid) FROM PUBLIC, anon, authenticated',
    'REVOKE EXECUTE ON FUNCTION public.update_organic_certification_status() FROM PUBLIC, anon, authenticated',
    'REVOKE EXECUTE ON FUNCTION public.update_plan_quantity_from_transition() FROM PUBLIC, anon, authenticated',
    'REVOKE EXECUTE ON FUNCTION public.update_vine_cumulative_yield() FROM PUBLIC, anon, authenticated',
    'REVOKE EXECUTE ON FUNCTION public.update_vineyard_total_vines() FROM PUBLIC, anon, authenticated',

    -- Organization inserts call the role initializer from this trigger wrapper.
    'ALTER FUNCTION public.trigger_create_system_roles() SECURITY DEFINER',
    'ALTER FUNCTION public.trigger_create_system_roles() SET search_path = public, pg_temp',
    'REVOKE EXECUTE ON FUNCTION public.trigger_create_system_roles() FROM PUBLIC, anon, authenticated'
  ]
  LOOP
    BEGIN
      EXECUTE ddl;
    EXCEPTION
      WHEN undefined_function THEN
        RAISE NOTICE 'P1 skipped absent historical function: %', ddl;
    END;
  END LOOP;
END
$p1$;

-- Multi-tenant policies originally referenced one another recursively. Private,
-- non-exposed predicates provide a single ownership boundary without exposing
-- SECURITY DEFINER RPCs through the public API schema.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.is_organization_owner(p_organization_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.organizations o
    WHERE o.id = p_organization_id
      AND o.owner_id = p_user_id
  );
$function$;

CREATE OR REPLACE FUNCTION private.is_active_organization_member(p_organization_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = p_organization_id
      AND om.user_id = p_user_id
      AND om.status = 'Active'
  );
$function$;

CREATE OR REPLACE FUNCTION private.is_organization_member_record_owner(p_member_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.id = p_member_id
      AND om.user_id = p_user_id
      AND om.status = 'Active'
  );
$function$;

REVOKE ALL ON FUNCTION private.is_organization_owner(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_active_organization_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_organization_member_record_owner(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_organization_owner(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_active_organization_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_organization_member_record_owner(uuid, uuid) TO authenticated;

DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;
CREATE POLICY "Users can view their organizations" ON public.organizations
  FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid()
    OR private.is_active_organization_member(id)
  );

DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
CREATE POLICY "Users can create organizations" ON public.organizations
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners can update their organizations" ON public.organizations;
CREATE POLICY "Owners can update their organizations" ON public.organizations
  FOR UPDATE TO authenticated
  USING (private.is_organization_owner(id))
  WITH CHECK (private.is_organization_owner(id));

DROP POLICY IF EXISTS "Owners can delete their organizations" ON public.organizations;
CREATE POLICY "Owners can delete their organizations" ON public.organizations
  FOR DELETE TO authenticated USING (private.is_organization_owner(id));

DROP POLICY IF EXISTS "Members can view organization roles" ON public.roles;
CREATE POLICY "Members can view organization roles" ON public.roles
  FOR SELECT TO authenticated
  USING (
    private.is_organization_owner(organization_id)
    OR private.is_active_organization_member(organization_id)
  );

DROP POLICY IF EXISTS "Owners can manage roles" ON public.roles;
CREATE POLICY "Owners can manage roles" ON public.roles
  FOR ALL TO authenticated
  USING (private.is_organization_owner(organization_id))
  WITH CHECK (private.is_organization_owner(organization_id));

DROP POLICY IF EXISTS "Members can view organization members" ON public.organization_members;
CREATE POLICY "Members can view organization members" ON public.organization_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR private.is_organization_owner(organization_id)
  );

DROP POLICY IF EXISTS "Owners can manage members" ON public.organization_members;
CREATE POLICY "Owners can manage members" ON public.organization_members
  FOR ALL TO authenticated
  USING (private.is_organization_owner(organization_id))
  WITH CHECK (private.is_organization_owner(organization_id));

DROP POLICY IF EXISTS "Members can view organization invitations" ON public.organization_invitations;
CREATE POLICY "Members can view organization invitations" ON public.organization_invitations
  FOR SELECT TO authenticated
  USING (
    private.is_organization_owner(organization_id)
    OR private.is_active_organization_member(organization_id)
  );

DROP POLICY IF EXISTS "Owners can manage invitations" ON public.organization_invitations;
CREATE POLICY "Owners can manage invitations" ON public.organization_invitations
  FOR ALL TO authenticated
  USING (private.is_organization_owner(organization_id))
  WITH CHECK (private.is_organization_owner(organization_id));

DROP POLICY IF EXISTS "Members can view their assignments" ON public.garden_assignments;
CREATE POLICY "Members can view their assignments" ON public.garden_assignments
  FOR SELECT TO authenticated
  USING (
    private.is_organization_owner(organization_id)
    OR private.is_organization_member_record_owner(member_id)
  );

DROP POLICY IF EXISTS "Owners can manage assignments" ON public.garden_assignments;
CREATE POLICY "Owners can manage assignments" ON public.garden_assignments
  FOR ALL TO authenticated
  USING (private.is_organization_owner(organization_id))
  WITH CHECK (private.is_organization_owner(organization_id));

-- Reassert tenant ownership policies. This also repairs the remote drift where
-- RLS was enabled but the two ledger tables had no policies.
ALTER TABLE public.agronomic_decision_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agronomic_queue_outcomes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own agronomic decision ledger entries" ON public.agronomic_decision_ledger_entries;
DROP POLICY IF EXISTS "Users can insert their own agronomic decision ledger entries" ON public.agronomic_decision_ledger_entries;
DROP POLICY IF EXISTS "Users can update their own agronomic decision ledger entries" ON public.agronomic_decision_ledger_entries;
DROP POLICY IF EXISTS "Users can delete their own agronomic decision ledger entries" ON public.agronomic_decision_ledger_entries;
DROP POLICY IF EXISTS agronomic_decision_ledger_owner_all ON public.agronomic_decision_ledger_entries;
CREATE POLICY agronomic_decision_ledger_owner_all
  ON public.agronomic_decision_ledger_entries
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.gardens g
      WHERE g.id = agronomic_decision_ledger_entries.garden_id
        AND g.user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.gardens g
      WHERE g.id = agronomic_decision_ledger_entries.garden_id
        AND g.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view their own agronomic queue outcomes" ON public.agronomic_queue_outcomes;
DROP POLICY IF EXISTS "Users can insert their own agronomic queue outcomes" ON public.agronomic_queue_outcomes;
DROP POLICY IF EXISTS "Users can update their own agronomic queue outcomes" ON public.agronomic_queue_outcomes;
DROP POLICY IF EXISTS "Users can delete their own agronomic queue outcomes" ON public.agronomic_queue_outcomes;
DROP POLICY IF EXISTS agronomic_queue_outcomes_owner_all ON public.agronomic_queue_outcomes;
CREATE POLICY agronomic_queue_outcomes_owner_all
  ON public.agronomic_queue_outcomes
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.gardens g
      WHERE g.id = agronomic_queue_outcomes.garden_id
        AND g.user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.gardens g
      WHERE g.id = agronomic_queue_outcomes.garden_id
        AND g.user_id = auth.uid()
    )
  );

COMMIT;
