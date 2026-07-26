-- O43 / M15: data export, cancellation, configurable retention and audited support access.

ALTER TABLE public.organization_commercial_accounts
  ADD COLUMN cancellation_reason text,
  ADD COLUMN cancellation_policy_reference text,
  ADD COLUMN cancellation_requested_at timestamptz,
  ADD COLUMN cancelled_at timestamptz,
  ADD COLUMN cancelled_by uuid REFERENCES auth.users(id),
  ADD COLUMN retention_until date,
  ADD COLUMN legal_hold boolean NOT NULL DEFAULT false,
  ADD COLUMN legal_hold_reason text,
  ADD COLUMN legal_hold_updated_at timestamptz,
  ADD COLUMN legal_hold_updated_by uuid REFERENCES auth.users(id),
  ADD COLUMN operational_data_purged_at timestamptz,
  ADD COLUMN operational_data_purged_by uuid REFERENCES auth.users(id);

ALTER TABLE public.organization_commercial_audit_log
  DROP CONSTRAINT IF EXISTS organization_commercial_audit_log_event_type_check;
ALTER TABLE public.organization_commercial_audit_log
  ADD CONSTRAINT organization_commercial_audit_log_event_type_check CHECK (
    event_type IN (
      'BillingProfileSubmitted',
      'InvoiceIssued',
      'PaymentRecorded',
      'ContractRenewed',
      'OrganizationSuspended',
      'OrganizationReactivated',
      'DataExported',
      'CancellationScheduled',
      'LegalHoldEnabled',
      'LegalHoldReleased',
      'OperationalDataPurged',
      'SupportAccessGranted',
      'SupportAccessRevoked',
      'SupportAccessUsed'
    )
  );

CREATE TABLE public.organization_support_access_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  support_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  purpose text NOT NULL,
  approved_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  approved_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_by uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  revoked_at timestamptz,
  revoke_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_at > approved_at)
);

CREATE INDEX idx_active_organization_support_grants
  ON public.organization_support_access_grants(organization_id, support_user_id, expires_at)
  WHERE revoked_at IS NULL;

ALTER TABLE public.organization_support_access_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization managers can view support grants"
  ON public.organization_support_access_grants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.organizations o
      LEFT JOIN public.organization_members om
        ON om.organization_id = o.id
       AND om.user_id = auth.uid()
       AND om.status = 'Active'
      LEFT JOIN public.roles r ON r.id = om.role_id
      WHERE o.id = organization_support_access_grants.organization_id
        AND (o.owner_id = auth.uid() OR r.name IN ('Owner', 'Administrator'))
    )
  );

REVOKE INSERT, UPDATE, DELETE ON public.organization_support_access_grants
  FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.record_organization_data_export(
  p_organization_id uuid,
  p_actor_id uuid,
  p_checksum text,
  p_record_count integer
)
RETURNS public.organization_commercial_audit_log
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_can_manage boolean;
  audit_record public.organization_commercial_audit_log;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.organizations o
    LEFT JOIN public.organization_members om
      ON om.organization_id = o.id
     AND om.user_id = p_actor_id
     AND om.status = 'Active'
    LEFT JOIN public.roles r ON r.id = om.role_id
    WHERE o.id = p_organization_id
      AND (o.owner_id = p_actor_id OR r.name IN ('Owner', 'Administrator'))
  ) INTO actor_can_manage;

  IF NOT actor_can_manage THEN
    RAISE EXCEPTION 'organization_manager_required';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.organization_commercial_accounts
    WHERE organization_id = p_organization_id
      AND operational_data_purged_at IS NULL
  ) THEN
    RAISE EXCEPTION 'export_unavailable';
  END IF;

  INSERT INTO public.organization_commercial_audit_log (
    organization_id, actor_id, event_type, details
  )
  VALUES (
    p_organization_id,
    p_actor_id,
    'DataExported',
    jsonb_build_object('sha256', p_checksum, 'recordCount', p_record_count)
  )
  RETURNING * INTO audit_record;

  RETURN audit_record;
END;
$$;

CREATE OR REPLACE FUNCTION public.schedule_pro_organization_cancellation(
  p_organization_id uuid,
  p_actor_id uuid,
  p_reason text,
  p_retention_until date,
  p_policy_reference text
)
RETURNS public.organization_commercial_accounts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  account public.organization_commercial_accounts;
BEGIN
  IF NULLIF(btrim(p_reason), '') IS NULL
    OR NULLIF(btrim(p_policy_reference), '') IS NULL THEN
    RAISE EXCEPTION 'cancellation_reason_and_policy_required';
  END IF;
  IF p_retention_until <= current_date THEN
    RAISE EXCEPTION 'retention_deadline_must_be_future';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM public.organization_commercial_audit_log
    WHERE organization_id = p_organization_id
      AND event_type = 'DataExported'
  ) THEN
    RAISE EXCEPTION 'data_export_required_before_cancellation';
  END IF;

  SELECT * INTO account
  FROM public.organization_commercial_accounts
  WHERE organization_id = p_organization_id
  FOR UPDATE;

  IF account.id IS NULL THEN
    RAISE EXCEPTION 'commercial_account_not_found';
  END IF;
  IF account.status = 'Cancelled' THEN
    RAISE EXCEPTION 'organization_already_cancelled';
  END IF;

  UPDATE public.organization_members
  SET status = 'Suspended', updated_at = now()
  WHERE organization_id = p_organization_id
    AND status = 'Active';

  UPDATE public.api_keys
  SET is_active = false, updated_at = now()
  WHERE organization_id = p_organization_id
    AND is_active = true;

  UPDATE public.organization_commercial_accounts
  SET
    status = 'Cancelled',
    cancellation_reason = btrim(p_reason),
    cancellation_policy_reference = btrim(p_policy_reference),
    cancellation_requested_at = now(),
    cancelled_at = now(),
    cancelled_by = p_actor_id,
    retention_until = p_retention_until,
    updated_at = now()
  WHERE id = account.id
  RETURNING * INTO account;

  INSERT INTO public.organization_commercial_audit_log (
    organization_id, actor_id, event_type, details
  )
  VALUES (
    p_organization_id,
    p_actor_id,
    'CancellationScheduled',
    jsonb_build_object(
      'reason', account.cancellation_reason,
      'retentionUntil', account.retention_until,
      'policyReference', account.cancellation_policy_reference
    )
  );

  RETURN account;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_organization_legal_hold(
  p_organization_id uuid,
  p_actor_id uuid,
  p_enabled boolean,
  p_reason text
)
RETURNS public.organization_commercial_accounts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  account public.organization_commercial_accounts;
BEGIN
  IF p_enabled AND NULLIF(btrim(p_reason), '') IS NULL THEN
    RAISE EXCEPTION 'legal_hold_reason_required';
  END IF;

  UPDATE public.organization_commercial_accounts
  SET
    legal_hold = p_enabled,
    legal_hold_reason = CASE WHEN p_enabled THEN btrim(p_reason) ELSE NULL END,
    legal_hold_updated_at = now(),
    legal_hold_updated_by = p_actor_id,
    updated_at = now()
  WHERE organization_id = p_organization_id
    AND status = 'Cancelled'
  RETURNING * INTO account;

  IF account.id IS NULL THEN
    RAISE EXCEPTION 'cancelled_commercial_account_required';
  END IF;

  INSERT INTO public.organization_commercial_audit_log (
    organization_id, actor_id, event_type, details
  )
  VALUES (
    p_organization_id,
    p_actor_id,
    CASE WHEN p_enabled THEN 'LegalHoldEnabled' ELSE 'LegalHoldReleased' END,
    jsonb_build_object('reason', NULLIF(btrim(p_reason), ''))
  );

  RETURN account;
END;
$$;

CREATE OR REPLACE FUNCTION public.purge_cancelled_organization_data(
  p_organization_id uuid,
  p_actor_id uuid
)
RETURNS public.organization_commercial_accounts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  account public.organization_commercial_accounts;
  deleted_assignments integer;
  deleted_invitations integer;
  deleted_members integer;
  deleted_roles integer;
  deleted_api_keys integer;
BEGIN
  SELECT * INTO account
  FROM public.organization_commercial_accounts
  WHERE organization_id = p_organization_id
  FOR UPDATE;

  IF account.id IS NULL OR account.status <> 'Cancelled' THEN
    RAISE EXCEPTION 'cancelled_commercial_account_required';
  END IF;
  IF account.operational_data_purged_at IS NOT NULL THEN
    RAISE EXCEPTION 'operational_data_already_purged';
  END IF;
  IF account.legal_hold THEN
    RAISE EXCEPTION 'organization_under_legal_hold';
  END IF;
  IF account.retention_until IS NULL OR account.retention_until > current_date THEN
    RAISE EXCEPTION 'retention_period_not_expired';
  END IF;

  DELETE FROM public.garden_assignments WHERE organization_id = p_organization_id;
  GET DIAGNOSTICS deleted_assignments = ROW_COUNT;
  DELETE FROM public.organization_invitations WHERE organization_id = p_organization_id;
  GET DIAGNOSTICS deleted_invitations = ROW_COUNT;
  DELETE FROM public.api_keys WHERE organization_id = p_organization_id;
  GET DIAGNOSTICS deleted_api_keys = ROW_COUNT;
  DELETE FROM public.organization_members WHERE organization_id = p_organization_id;
  GET DIAGNOSTICS deleted_members = ROW_COUNT;
  DELETE FROM public.roles WHERE organization_id = p_organization_id;
  GET DIAGNOSTICS deleted_roles = ROW_COUNT;

  UPDATE public.organization_commercial_accounts
  SET
    operational_data_purged_at = now(),
    operational_data_purged_by = p_actor_id,
    updated_at = now()
  WHERE id = account.id
  RETURNING * INTO account;

  INSERT INTO public.organization_commercial_audit_log (
    organization_id, actor_id, event_type, details
  )
  VALUES (
    p_organization_id,
    p_actor_id,
    'OperationalDataPurged',
    jsonb_build_object(
      'assignments', deleted_assignments,
      'invitations', deleted_invitations,
      'apiKeys', deleted_api_keys,
      'members', deleted_members,
      'roles', deleted_roles,
      'billingAndAuditRetained', true
    )
  );

  RETURN account;
END;
$$;

CREATE OR REPLACE FUNCTION public.grant_organization_support_access(
  p_organization_id uuid,
  p_actor_id uuid,
  p_support_user_id uuid,
  p_purpose text,
  p_expires_at timestamptz
)
RETURNS public.organization_support_access_grants
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_can_manage boolean;
  support_grant public.organization_support_access_grants;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.organizations o
    LEFT JOIN public.organization_members om
      ON om.organization_id = o.id
     AND om.user_id = p_actor_id
     AND om.status = 'Active'
    LEFT JOIN public.roles r ON r.id = om.role_id
    WHERE o.id = p_organization_id
      AND (o.owner_id = p_actor_id OR r.name IN ('Owner', 'Administrator'))
  ) INTO actor_can_manage;

  IF NOT actor_can_manage THEN
    RAISE EXCEPTION 'organization_manager_required';
  END IF;
  IF NULLIF(btrim(p_purpose), '') IS NULL OR p_expires_at <= now() THEN
    RAISE EXCEPTION 'valid_support_purpose_and_expiry_required';
  END IF;

  INSERT INTO public.organization_support_access_grants (
    organization_id,
    support_user_id,
    purpose,
    approved_by,
    expires_at
  )
  VALUES (
    p_organization_id,
    p_support_user_id,
    btrim(p_purpose),
    p_actor_id,
    p_expires_at
  )
  RETURNING * INTO support_grant;

  INSERT INTO public.organization_commercial_audit_log (
    organization_id, actor_id, event_type, details
  )
  VALUES (
    p_organization_id,
    p_actor_id,
    'SupportAccessGranted',
    jsonb_build_object(
      'grantId', support_grant.id,
      'supportUserId', support_grant.support_user_id,
      'purpose', support_grant.purpose,
      'expiresAt', support_grant.expires_at
    )
  );

  RETURN support_grant;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_organization_support_access(
  p_grant_id uuid,
  p_actor_id uuid,
  p_reason text
)
RETURNS public.organization_support_access_grants
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  support_grant public.organization_support_access_grants;
  actor_can_manage boolean;
BEGIN
  SELECT * INTO support_grant
  FROM public.organization_support_access_grants
  WHERE id = p_grant_id
  FOR UPDATE;
  IF support_grant.id IS NULL OR support_grant.revoked_at IS NOT NULL THEN
    RAISE EXCEPTION 'active_support_grant_not_found';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.organizations o
    LEFT JOIN public.organization_members om
      ON om.organization_id = o.id
     AND om.user_id = p_actor_id
     AND om.status = 'Active'
    LEFT JOIN public.roles r ON r.id = om.role_id
    WHERE o.id = support_grant.organization_id
      AND (o.owner_id = p_actor_id OR r.name IN ('Owner', 'Administrator'))
  ) INTO actor_can_manage;
  IF NOT actor_can_manage THEN
    RAISE EXCEPTION 'organization_manager_required';
  END IF;

  UPDATE public.organization_support_access_grants
  SET
    revoked_by = p_actor_id,
    revoked_at = now(),
    revoke_reason = NULLIF(btrim(p_reason), '')
  WHERE id = p_grant_id
  RETURNING * INTO support_grant;

  INSERT INTO public.organization_commercial_audit_log (
    organization_id, actor_id, event_type, details
  )
  VALUES (
    support_grant.organization_id,
    p_actor_id,
    'SupportAccessRevoked',
    jsonb_build_object('grantId', support_grant.id, 'reason', support_grant.revoke_reason)
  );

  RETURN support_grant;
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_organization_support_access(
  p_grant_id uuid,
  p_support_user_id uuid,
  p_action text
)
RETURNS public.organization_support_access_grants
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  support_grant public.organization_support_access_grants;
BEGIN
  SELECT * INTO support_grant
  FROM public.organization_support_access_grants
  WHERE id = p_grant_id
    AND support_user_id = p_support_user_id
    AND revoked_at IS NULL
    AND expires_at > now();
  IF support_grant.id IS NULL THEN
    RAISE EXCEPTION 'valid_support_grant_required';
  END IF;

  INSERT INTO public.organization_commercial_audit_log (
    organization_id, actor_id, event_type, details
  )
  VALUES (
    support_grant.organization_id,
    p_support_user_id,
    'SupportAccessUsed',
    jsonb_build_object(
      'grantId', support_grant.id,
      'purpose', support_grant.purpose,
      'action', NULLIF(btrim(p_action), '')
    )
  );

  RETURN support_grant;
END;
$$;

REVOKE ALL ON FUNCTION public.record_organization_data_export(uuid, uuid, text, integer)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.schedule_pro_organization_cancellation(uuid, uuid, text, date, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_organization_legal_hold(uuid, uuid, boolean, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.purge_cancelled_organization_data(uuid, uuid)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.grant_organization_support_access(uuid, uuid, uuid, text, timestamptz)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.revoke_organization_support_access(uuid, uuid, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.audit_organization_support_access(uuid, uuid, text)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.record_organization_data_export(uuid, uuid, text, integer)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.schedule_pro_organization_cancellation(uuid, uuid, text, date, text)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.set_organization_legal_hold(uuid, uuid, boolean, text)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.purge_cancelled_organization_data(uuid, uuid)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.grant_organization_support_access(uuid, uuid, uuid, text, timestamptz)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.revoke_organization_support_access(uuid, uuid, text)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.audit_organization_support_access(uuid, uuid, text)
  TO service_role;
