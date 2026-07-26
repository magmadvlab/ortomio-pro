-- O39 / M15: observable delivery and atomic invitation acceptance.

ALTER TABLE public.organization_invitations
  ADD COLUMN IF NOT EXISTS delivery_status text NOT NULL DEFAULT 'Pending'
    CHECK (delivery_status IN ('Pending', 'Delivered', 'Failed')),
  ADD COLUMN IF NOT EXISTS delivery_provider text,
  ADD COLUMN IF NOT EXISTS provider_message_id text,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivery_error text;

CREATE OR REPLACE FUNCTION public.accept_organization_invitation(
  p_token uuid,
  p_user_id uuid,
  p_user_email text
)
RETURNS public.organization_members
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation public.organization_invitations;
  accepted_member public.organization_members;
BEGIN
  SELECT *
  INTO invitation
  FROM public.organization_invitations
  WHERE token = p_token
    AND status = 'Pending'
  FOR UPDATE;

  IF invitation.id IS NULL OR invitation.expires_at <= now() THEN
    RAISE EXCEPTION 'invalid_or_expired_invitation';
  END IF;

  IF lower(invitation.email) <> lower(btrim(p_user_email)) THEN
    RAISE EXCEPTION 'invitation_email_mismatch';
  END IF;

  INSERT INTO public.organization_members (
    organization_id,
    user_id,
    role_id,
    status,
    invited_by,
    invited_at,
    joined_at
  )
  VALUES (
    invitation.organization_id,
    p_user_id,
    invitation.role_id,
    'Active',
    invitation.invited_by,
    invitation.invited_at,
    now()
  )
  ON CONFLICT (organization_id, user_id)
  DO UPDATE SET
    role_id = EXCLUDED.role_id,
    status = 'Active',
    joined_at = COALESCE(organization_members.joined_at, now()),
    updated_at = now()
  RETURNING * INTO accepted_member;

  UPDATE public.organization_invitations
  SET status = 'Accepted', responded_at = now()
  WHERE id = invitation.id;

  RETURN accepted_member;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_organization_invitation(uuid, uuid, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.accept_organization_invitation(uuid, uuid, text)
  TO service_role;

REVOKE INSERT, UPDATE, DELETE ON public.organization_invitations
  FROM anon, authenticated;
