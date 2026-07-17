CREATE SCHEMA IF NOT EXISTS auth;
CREATE ROLE authenticated NOLOGIN;
CREATE TABLE auth.users (id uuid PRIMARY KEY);
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

CREATE TABLE public.gardens (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id)
);
CREATE TABLE public.garden_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id uuid NOT NULL REFERENCES public.gardens(id),
  completed boolean NOT NULL DEFAULT false
);

INSERT INTO auth.users VALUES
  ('00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002');
INSERT INTO public.gardens VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002');

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.gardens TO authenticated;
