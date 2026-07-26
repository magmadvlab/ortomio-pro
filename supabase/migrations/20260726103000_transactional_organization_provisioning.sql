-- O38 / M15: create the organization, system roles and owner membership atomically.

CREATE OR REPLACE FUNCTION public.provision_organization(
  p_owner_id uuid,
  p_name text,
  p_type text,
  p_description text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_address text DEFAULT NULL,
  p_vat_number text DEFAULT NULL,
  p_logo text DEFAULT NULL,
  p_website text DEFAULT NULL
)
RETURNS public.organizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  provisioned public.organizations;
  owner_role_id uuid;
BEGIN
  IF p_owner_id IS NULL THEN
    RAISE EXCEPTION 'owner_required';
  END IF;

  IF NULLIF(btrim(p_name), '') IS NULL THEN
    RAISE EXCEPTION 'organization_name_required';
  END IF;

  IF p_type NOT IN ('Farm', 'Cooperative', 'Enterprise', 'Research') THEN
    RAISE EXCEPTION 'invalid_organization_type';
  END IF;

  INSERT INTO public.organizations (
    name,
    type,
    description,
    email,
    phone,
    address,
    vat_number,
    logo,
    website,
    owner_id
  )
  VALUES (
    btrim(p_name),
    p_type,
    NULLIF(btrim(p_description), ''),
    NULLIF(btrim(p_email), ''),
    NULLIF(btrim(p_phone), ''),
    NULLIF(btrim(p_address), ''),
    NULLIF(btrim(p_vat_number), ''),
    NULLIF(btrim(p_logo), ''),
    NULLIF(btrim(p_website), ''),
    p_owner_id
  )
  RETURNING * INTO provisioned;

  -- The existing AFTER INSERT trigger creates all system roles in this transaction.
  SELECT id
  INTO owner_role_id
  FROM public.roles
  WHERE organization_id = provisioned.id
    AND name = 'Owner'
    AND is_system = true;

  IF owner_role_id IS NULL THEN
    RAISE EXCEPTION 'owner_role_provisioning_failed';
  END IF;

  INSERT INTO public.organization_members (
    organization_id,
    user_id,
    role_id,
    status,
    joined_at
  )
  VALUES (
    provisioned.id,
    p_owner_id,
    owner_role_id,
    'Active',
    now()
  );

  RETURN provisioned;
END;
$$;

REVOKE ALL ON FUNCTION public.provision_organization(
  uuid, text, text, text, text, text, text, text, text, text
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.provision_organization(
  uuid, text, text, text, text, text, text, text, text, text
) TO service_role;
