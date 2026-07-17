CREATE SCHEMA IF NOT EXISTS auth;
CREATE ROLE authenticated NOLOGIN;
CREATE TABLE auth.users (id uuid PRIMARY KEY);
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

CREATE TABLE public.gardens (id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES auth.users(id));
CREATE TABLE public.organizations (id uuid PRIMARY KEY);
CREATE TABLE public.garden_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  garden_id uuid NOT NULL REFERENCES public.gardens(id)
);
CREATE TABLE public.irrigation_zones (id uuid PRIMARY KEY, garden_id uuid NOT NULL REFERENCES public.gardens(id));
CREATE TABLE public.smart_devices (
  id uuid PRIMARY KEY,
  garden_id uuid NOT NULL REFERENCES public.gardens(id),
  external_device_id text
);
CREATE TABLE public.irrigation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid NOT NULL REFERENCES public.irrigation_zones(id),
  planned_volume_liters numeric NOT NULL,
  actual_volume_liters numeric
);
CREATE TABLE public.nutrition_treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id uuid NOT NULL REFERENCES public.gardens(id),
  product_id uuid NOT NULL,
  dosage numeric NOT NULL,
  dosage_unit text NOT NULL,
  status text NOT NULL DEFAULT 'planned',
  updated_at timestamptz DEFAULT now()
);
CREATE TABLE public.product_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  product_name text NOT NULL,
  product_type text NOT NULL,
  garden_id uuid NOT NULL REFERENCES public.gardens(id),
  current_stock numeric NOT NULL,
  stock_unit text NOT NULL,
  minimum_stock numeric NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);
CREATE TABLE public.fertilizer_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  garden_id uuid REFERENCES public.gardens(id),
  fertilizer_name text NOT NULL,
  fertilizer_type text NOT NULL,
  nitrogen_n numeric,
  phosphorus_p numeric,
  potassium_k numeric,
  quantity numeric NOT NULL,
  quantity_unit text NOT NULL,
  expiry_date date,
  manufacturer text,
  unit_cost numeric,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.gardens, public.smart_devices, public.garden_assignments TO authenticated;
