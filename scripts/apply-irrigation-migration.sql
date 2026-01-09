-- Script per applicare la migrazione dei sistemi di irrigazione
-- Esegui questo script nel database Supabase locale

\i database/migrations/add_irrigation_system_fields.sql

-- Verifica che i campi siano stati aggiunti
\d irrigation_systems

-- Test query per verificare il funzionamento
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'irrigation_systems' 
AND column_name IN ('bed_ids', 'row_ids', 'cultivation_type');