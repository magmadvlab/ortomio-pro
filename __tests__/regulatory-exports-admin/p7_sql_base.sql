CREATE SCHEMA auth;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE anon NOLOGIN;
CREATE TABLE auth.users (id uuid PRIMARY KEY);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
CREATE TABLE profiles (id uuid PRIMARY KEY REFERENCES auth.users(id), role text, is_superadmin boolean DEFAULT false);
CREATE TABLE gardens (id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES auth.users(id), name text);
CREATE TABLE certification_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), garden_id uuid NOT NULL REFERENCES gardens(id), certification_type text NOT NULL,
  title text NOT NULL, description text, type text NOT NULL, version text, approved_by text, approval_date timestamptz,
  effective_date timestamptz, review_date timestamptz, status text, file_path text, tags text[], created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE bio_certifications (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), garden_id uuid NOT NULL REFERENCES gardens(id));
CREATE TABLE bio_certification_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bio_certification_id uuid NOT NULL REFERENCES bio_certifications(id),
  document_type text NOT NULL, document_name text NOT NULL, uploaded_by uuid REFERENCES auth.users(id)
);
INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000001'), ('00000000-0000-0000-0000-000000000002');
INSERT INTO profiles VALUES ('00000000-0000-0000-0000-000000000001', 'admin', true), ('00000000-0000-0000-0000-000000000002', 'user', false);
INSERT INTO gardens VALUES ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'A'), ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'B');
INSERT INTO bio_certifications(garden_id) VALUES ('10000000-0000-0000-0000-000000000001');
ALTER TABLE certification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_certification_documents ENABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA public, auth TO authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;
GRANT SELECT ON gardens, profiles, bio_certifications TO authenticated;
