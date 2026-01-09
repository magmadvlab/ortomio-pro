# Guida Migrazioni Database

## Panoramica

Questa guida spiega come applicare le migrazioni del database per le funzionalità di Precision Agriculture.

## Ordine di Applicazione Migrazioni

Le migrazioni devono essere applicate nell'ordine seguente:

### 1. Schema Base

```bash
# Applica schema base (se non già applicato)
psql -h your-db-host -U postgres -d your-database -f database/schema.sql
```

Oppure tramite Supabase SQL Editor:
1. Vai a SQL Editor in Supabase Dashboard
2. Copia contenuto di `database/schema.sql`
3. Esegui script

### 2. Migrazioni Precision Agriculture

```bash
# Applica migrazione precision agriculture
psql -h your-db-host -U postgres -d your-database -f database/migrations/add_precision_agriculture_schema.sql
```

Oppure tramite Supabase SQL Editor:
1. Vai a SQL Editor
2. Copia contenuto di `database/migrations/add_precision_agriculture_schema.sql`
3. Esegui script

### 3. Verifica Consistenza

```bash
# Verifica che tutte le tabelle siano state create
psql -h your-db-host -U postgres -d your-database -f database/export_schema.sql
```

## Checklist Pre-Migrazione

Prima di applicare le migrazioni:

- [ ] **Backup Database**: Crea backup completo del database
- [ ] **Verifica Versione PostgreSQL**: Richiesto PostgreSQL 12+
- [ ] **Verifica Permessi**: Utente deve avere privilegi CREATE TABLE, CREATE INDEX, CREATE FUNCTION
- [ ] **Verifica Spazio**: Assicurati di avere spazio sufficiente per nuove tabelle
- [ ] **Test Ambiente**: Testa prima su ambiente di sviluppo/staging

## Backup Recommendations

### Backup Completo

```bash
# Backup completo database
pg_dump -h your-db-host -U postgres -d your-database -F c -f backup_$(date +%Y%m%d).dump

# Backup solo schema
pg_dump -h your-db-host -U postgres -d your-database --schema-only -f schema_backup_$(date +%Y%m%d).sql

# Backup solo dati
pg_dump -h your-db-host -U postgres -d your-database --data-only -f data_backup_$(date +%Y%m%d).sql
```

### Backup Supabase

1. Vai a Supabase Dashboard → Settings → Database
2. Clicca "Backup" o usa Supabase CLI:
   ```bash
   supabase db dump -f backup.sql
   ```

## Applicazione Migrazioni

### Metodo 1: Supabase SQL Editor (Raccomandato)

1. Accedi a Supabase Dashboard
2. Vai a SQL Editor
3. Crea nuova query
4. Copia contenuto migrazione
5. Esegui query
6. Verifica risultati

### Metodo 2: Supabase CLI

```bash
# Installa Supabase CLI
npm install -g supabase

# Login
supabase login

# Link progetto
supabase link --project-ref your-project-ref

# Applica migrazione
supabase db push
```

### Metodo 3: psql Command Line

```bash
# Connetti al database
psql -h your-db-host -U postgres -d your-database

# Applica migrazione
\i database/migrations/add_precision_agriculture_schema.sql
```

## Verifica Post-Migrazione

Dopo aver applicato le migrazioni, verifica:

### 1. Tabelle Create

```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'garden_zones',
  'soil_analysis',
  'vegetation_indices',
  'yield_predictions',
  'irrigation_zones',
  'sensor_readings'
);
```

Dovresti vedere 6 tabelle.

### 2. Indici Creati

```sql
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
  'garden_zones',
  'soil_analysis',
  'vegetation_indices',
  'yield_predictions',
  'sensor_readings'
)
ORDER BY tablename, indexname;
```

### 3. RLS Abilitato

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'garden_zones',
  'soil_analysis',
  'vegetation_indices',
  'yield_predictions',
  'sensor_readings'
);
```

Tutte le tabelle dovrebbero avere `rowsecurity = true`.

### 4. Policies Create

```sql
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN (
  'garden_zones',
  'soil_analysis',
  'vegetation_indices',
  'yield_predictions',
  'sensor_readings'
)
ORDER BY tablename, policyname;
```

### 5. Trigger Creati

```sql
SELECT tgname, tgrelid::regclass
FROM pg_trigger
WHERE tgname LIKE '%precision%' 
   OR tgname LIKE '%zone%'
   OR tgname LIKE '%soil%'
   OR tgname LIKE '%yield%';
```

## Rollback Procedures

### Rollback Completo

Se necessario rollback completo:

```sql
-- ATTENZIONE: Questo elimina tutte le tabelle precision agriculture
-- Assicurati di avere un backup!

DROP TABLE IF EXISTS sensor_readings CASCADE;
DROP TABLE IF EXISTS irrigation_zones CASCADE;
DROP TABLE IF EXISTS yield_predictions CASCADE;
DROP TABLE IF EXISTS vegetation_indices CASCADE;
DROP TABLE IF EXISTS soil_analysis CASCADE;
DROP TABLE IF EXISTS garden_zones CASCADE;

-- Rimuovi colonne aggiunte
ALTER TABLE gardens DROP COLUMN IF EXISTS has_zones;
ALTER TABLE gardens DROP COLUMN IF EXISTS precision_mode_enabled;
ALTER TABLE garden_tasks DROP COLUMN IF EXISTS zone_id;
ALTER TABLE photo_logs DROP COLUMN IF EXISTS vegetation_indices_id;
```

### Rollback Parziale

Se vuoi mantenere i dati ma disabilitare funzionalità:

```sql
-- Disabilita precision mode per tutti gli orti
UPDATE gardens SET precision_mode_enabled = false;
```

## Troubleshooting

### Errore: "relation already exists"

Se una tabella esiste già:

```sql
-- Verifica se tabella esiste
SELECT EXISTS (
  SELECT FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename = 'garden_zones'
);

-- Se esiste, puoi:
-- 1. Saltare creazione (script usa IF NOT EXISTS)
-- 2. Eliminare e ricreare (ATTENZIONE: perdi dati!)
DROP TABLE IF EXISTS garden_zones CASCADE;
```

### Errore: "permission denied"

Verifica permessi utente:

```sql
-- Verifica permessi
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND table_name = 'gardens';
```

Se necessario, concedi permessi:

```sql
GRANT ALL ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO your_user;
```

### Errore: "foreign key constraint"

Se ci sono riferimenti esterni:

```sql
-- Verifica foreign keys
SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('garden_zones', 'soil_analysis', 'vegetation_indices', 'yield_predictions');
```

## Best Practices

1. **Sempre Backup Prima**: Crea backup prima di ogni migrazione
2. **Test su Staging**: Testa migrazioni su ambiente staging prima di produzione
3. **Migrazioni Atomiche**: Ogni migrazione dovrebbe essere atomica (tutto o niente)
4. **Versioning**: Mantieni storico migrazioni applicate
5. **Documentazione**: Documenta ogni migrazione applicata

## Versioning Migrazioni

Crea una tabella per tracciare migrazioni applicate:

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  description TEXT
);

-- Registra migrazione applicata
INSERT INTO schema_migrations (version, description)
VALUES ('add_precision_agriculture_schema', 'Precision Agriculture Schema Migration')
ON CONFLICT (version) DO NOTHING;
```

## Supporto

Per problemi o domande:
- Vedi [Database Schema Documentation](../docs/DATABASE_SCHEMA.md)
- Vedi [Precision Agriculture Guide](../docs/PRECISION_AGRICULTURE.md)
- Controlla log Supabase per errori dettagliati







