-- Forza disabilitazione RLS
ALTER TABLE public.official_crops DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_aliases DISABLE ROW LEVEL SECURITY;

-- Rimuovi eventuali policy esistenti
DROP POLICY IF EXISTS "Enable read access for all users" ON public.official_crops;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.crop_aliases;

-- Grant espliciti
GRANT ALL ON public.official_crops TO anon, authenticated, service_role;
GRANT ALL ON public.crop_aliases TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
