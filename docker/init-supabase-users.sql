-- Inizializzazione utenti Supabase per PostgREST
-- Esegui questo script come superuser (postgres)

-- Password di default (deve corrispondere a POSTGRES_PASSWORD in docker-compose.yml)
-- Per sicurezza, usa la stessa password del database
DO $$
DECLARE
    db_password TEXT := 'your-super-secret-password-change-this';
BEGIN
    -- Crea ruolo anon se non esiste
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN NOINHERIT;
    END IF;

    -- Crea ruolo service_role se non esiste
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
    END IF;

    -- Imposta password per authenticator (se non è già un ruolo riservato)
    -- Nota: authenticator potrebbe essere già creato dall'immagine Docker
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN
        -- Non possiamo modificare authenticator direttamente, ma possiamo verificare i permessi
        -- I permessi vengono gestiti tramite GRANT
    ELSE
        CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD db_password;
    END IF;

    -- Concedi permessi
    GRANT anon TO authenticator;
    GRANT service_role TO authenticator;

    -- Concedi permessi su schema public
    GRANT USAGE ON SCHEMA public TO anon, service_role;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, service_role;
    GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, service_role;

    -- Permessi futuri
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, service_role;

    RAISE NOTICE 'Utenti Supabase configurati correttamente';
END $$;















