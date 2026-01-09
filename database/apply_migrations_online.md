# Guida Applicazione Migrazioni Online

Questa è una guida passo-passo per applicare le migrazioni database su Supabase online.

## Preparazione

### 1. Backup Database

**IMPORTANTE**: Prima di procedere, fai un backup completo del database.

1. Vai su Supabase Dashboard → Database → Backups
2. Crea un backup manuale o verifica che i backup automatici siano attivi
3. Annota la data/ora del backup

### 2. Verifica Accesso

1. Accedi a Supabase Dashboard
2. Vai su SQL Editor
3. Verifica di avere i permessi necessari (superadmin o admin)

### 3. Verifica Estensioni

Esegui questo comando per verificare che le estensioni necessarie siano abilitate:

```sql
-- Verifica estensioni
SELECT extname, extversion 
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pg_trgm');
```

Se mancano, abilitalle:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

## Applicazione Migrazioni

### Metodo Consigliato: Esecuzione Sequenziale

Esegui ogni file **uno alla volta** nell'ordine indicato:

#### Step 1: Core Schema

1. Apri `01_core_schema.sql`
2. Copia tutto il contenuto
3. Incolla nel SQL Editor di Supabase
4. Clicca "Run" o premi `Ctrl+Enter` / `Cmd+Enter`
5. ⚠️ **Attendi il completamento** prima di procedere
6. Verifica che non ci siano errori

**Verifica**:
```sql
-- Verifica che le tabelle base siano state create
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('gardens', 'garden_beds', 'garden_tasks', 'harvest_logs')
ORDER BY table_name;
```

#### Step 2: User Profiles

1. Apri `02_user_profiles.sql`
2. Copia e incolla nel SQL Editor
3. Esegui
4. Verifica

**Verifica**:
```sql
-- Verifica tabella profiles
SELECT * FROM profiles LIMIT 1;
```

#### Step 3: Plant Taxonomy (Parte 1 - Tabelle)

1. Apri `03_plant_taxonomy.sql`
2. Copia e incolla nel SQL Editor
3. Esegui
4. Verifica

**Verifica**:
```sql
-- Verifica tabelle tassonomia
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('crop_archetypes', 'plant_taxonomy', 'plant_synonyms')
ORDER BY table_name;
```

#### Step 4: Plant Taxonomy (Parte 2 - Seed Data)

1. Apri `03b_plant_taxonomy_seed.sql`
2. Copia e incolla nel SQL Editor
3. Esegui
4. Verifica

**Verifica**:
```sql
-- Verifica dati seed
SELECT COUNT(*) as families_count FROM plant_families;
SELECT COUNT(*) as taxonomy_count FROM plant_taxonomy;
SELECT COUNT(*) as synonyms_count FROM plant_synonyms;
```

#### Step 5: Garden Features

1. Apri `04_garden_features.sql`
2. Copia e incolla nel SQL Editor
3. Esegui
4. Verifica

**Verifica**:
```sql
-- Verifica tabelle garden features
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE 'garden_%' 
ORDER BY table_name;
```

#### Step 6: Irrigation System

1. Apri `05_irrigation_system.sql`
2. Copia e incolla nel SQL Editor
3. Esegui
4. Verifica

**Verifica**:
```sql
-- Verifica tabelle irrigazione
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE 'irrigation_%' 
ORDER BY table_name;
```

#### Step 7: Sapling & Seedling

1. Apri `06_sapling_seedling.sql`
2. Copia e incolla nel SQL Editor
3. Esegui
4. Verifica

#### Step 8: Advanced Features

1. Apri `07_advanced_features.sql`
2. Copia e incolla nel SQL Editor
3. Esegui
4. Verifica

**Verifica**:
```sql
-- Verifica tabelle advanced features
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('fertilizer_inventory', 'phyto_inventory', 'treatment_registry', 'mechanical_work_register')
ORDER BY table_name;
```

#### Step 9: Performance Fixes

1. Apri `08_performance_fixes.sql`
2. Copia e incolla nel SQL Editor
3. Esegui
4. Verifica

**Verifica**:
```sql
-- Verifica colonne normalized
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'official_crops' 
AND column_name = 'normalized_name';
```

#### Step 10: Tier System

1. Apri `09_tier_system.sql`
2. Copia e incolla nel SQL Editor
3. Esegui
4. Verifica

**Verifica**:
```sql
-- Verifica migrazione tier
SELECT tier, COUNT(*) as count 
FROM profiles 
GROUP BY tier 
ORDER BY tier;
```

## Verifica Finale

Dopo aver applicato tutte le migrazioni, esegui questa query per verificare lo stato completo:

```sql
-- Verifica tutte le tabelle create
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

## Troubleshooting

### Se una migrazione fallisce:

1. **Ferma immediatamente**: Non procedere con le migrazioni successive
2. **Leggi l'errore**: Identifica quale comando ha fallito
3. **Verifica stato**: Controlla quali tabelle/colonne/funzioni sono state create
4. **Correggi**: 
   - Se è un errore di sintassi, correggi e riprova
   - Se è un errore di permessi, verifica i permessi
   - Se è un errore di dipendenze, verifica l'ordine di esecuzione
5. **Ripristina se necessario**: Se il database è in uno stato inconsistente, ripristina dal backup

### Errori Comuni

#### "relation already exists"
- **Causa**: Tabella/funzione già esiste
- **Soluzione**: I file usano `IF NOT EXISTS`, quindi questo non dovrebbe verificarsi. Se si verifica, verifica manualmente lo stato del database

#### "column already exists"
- **Causa**: Colonna già esiste
- **Soluzione**: I file usano `ADD COLUMN IF NOT EXISTS`, quindi questo non dovrebbe verificarsi

#### "permission denied"
- **Causa**: Permessi insufficienti
- **Soluzione**: Verifica di essere loggato come admin/superadmin

#### "extension does not exist"
- **Causa**: Estensione non abilitata
- **Soluzione**: Esegui `CREATE EXTENSION IF NOT EXISTS "nome_estensione";`

## Checklist Post-Migrazione

Dopo aver applicato tutte le migrazioni:

- [ ] Tutte le tabelle sono state create
- [ ] Tutte le RLS policies sono attive
- [ ] Tutti gli indici sono stati creati
- [ ] Tutte le funzioni sono state create
- [ ] I dati seed sono stati inseriti
- [ ] Il database risponde correttamente alle query
- [ ] L'applicazione si connette correttamente al database

## Supporto

Per problemi:
1. Controlla i log Supabase: Dashboard → Logs → Postgres Logs
2. Verifica la documentazione: `MIGRATIONS_ONLINE_GUIDE.md`
3. Contatta il team di sviluppo

