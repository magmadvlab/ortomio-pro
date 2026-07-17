-- Minimal disposable schema used to validate the P1 migration without a
-- Supabase remote project. Never apply this fixture outside a throwaway DB.

CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;

CREATE SCHEMA auth;
CREATE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

CREATE TABLE auth.users (
  id uuid PRIMARY KEY,
  aud text,
  role text,
  email text,
  encrypted_password text,
  email_confirmed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
);

CREATE TABLE public.gardens (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  name text NOT NULL
);

CREATE TABLE public.organizations (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id)
);

CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  name text NOT NULL,
  UNIQUE (organization_id, name)
);

CREATE TABLE public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  role_id uuid NOT NULL REFERENCES public.roles(id),
  status text NOT NULL DEFAULT 'Active',
  UNIQUE (organization_id, user_id)
);

CREATE TABLE public.organization_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id)
);

CREATE TABLE public.garden_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  garden_id uuid NOT NULL REFERENCES public.gardens(id),
  member_id uuid NOT NULL REFERENCES public.organization_members(id)
);

CREATE TABLE public.agronomic_decision_ledger_entries (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  garden_id uuid NOT NULL REFERENCES public.gardens(id),
  queue_item_id text NOT NULL,
  source text NOT NULL,
  focus text NOT NULL,
  status text NOT NULL
);

CREATE TABLE public.agronomic_queue_outcomes (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  garden_id uuid NOT NULL REFERENCES public.gardens(id),
  queue_item_id text NOT NULL,
  completed_at timestamptz NOT NULL,
  task_type text NOT NULL,
  plant_name text NOT NULL
);

ALTER TABLE public.gardens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garden_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY gardens_owner_all ON public.gardens
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

GRANT USAGE ON SCHEMA public, auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

CREATE VIEW public.ai_suggestions_prioritized AS SELECT 1 AS fixture;
CREATE VIEW public.field_row_rotation_analysis AS SELECT 1 AS fixture;
CREATE VIEW public.crop_performance_by_family AS SELECT 1 AS fixture;
CREATE VIEW public.agronomic_operation_outcome_projection AS SELECT 1 AS fixture;
CREATE VIEW public.agronomic_operation_signal_projection AS SELECT 1 AS fixture;
CREATE VIEW public.agronomic_precision_execution_projection AS SELECT 1 AS fixture;

CREATE FUNCTION public.calculate_rotation_score(uuid, text)
RETURNS integer LANGUAGE sql SECURITY DEFINER AS $$ SELECT 100 $$;
CREATE FUNCTION public.get_rotation_suggestions(uuid)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER AS $$ SELECT '[]'::jsonb $$;
CREATE FUNCTION public.get_zone_history(uuid, integer)
RETURNS SETOF jsonb LANGUAGE sql SECURITY DEFINER AS $$ SELECT '{}'::jsonb WHERE false $$;
CREATE FUNCTION public.calculate_zone_soil_health(uuid)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER AS $$ SELECT '{}'::jsonb $$;
CREATE FUNCTION public.get_zone_rotation_suggestions(uuid, integer)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER AS $$ SELECT '[]'::jsonb $$;
CREATE FUNCTION public.trigger_create_system_roles()
RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RETURN NEW; END $$;
