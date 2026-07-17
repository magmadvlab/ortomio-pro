CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE SCHEMA auth;
CREATE TABLE auth.users (id uuid PRIMARY KEY);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;

CREATE TABLE public.gardens (id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES auth.users(id), name text NOT NULL);
CREATE TABLE public.diary_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), garden_id uuid REFERENCES public.gardens(id) ON DELETE CASCADE,
  event_date date NOT NULL, event_type varchar(50) NOT NULL, title varchar(255) NOT NULL,
  description text, metadata jsonb DEFAULT '{}'::jsonb, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE public.individual_plant_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), garden_id uuid NOT NULL REFERENCES public.gardens(id), plant_id uuid NOT NULL,
  operation_type text NOT NULL, operation_date date NOT NULL
);
CREATE TABLE public.treatment_register (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, garden_id uuid REFERENCES public.gardens(id),
  product_name text NOT NULL, treatment_date date NOT NULL, dosage numeric, dosage_unit text,
  pre_harvest_interval_days integer, created_at timestamptz DEFAULT now()
);
CREATE TABLE public.phyto_inventory (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), garden_id uuid REFERENCES public.gardens(id), quantity numeric NOT NULL DEFAULT 0);

ALTER TABLE public.diary_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY diary_owner ON public.diary_events FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.gardens g WHERE g.id = garden_id AND g.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.gardens g WHERE g.id = garden_id AND g.user_id = auth.uid()));
GRANT USAGE ON SCHEMA public, auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
