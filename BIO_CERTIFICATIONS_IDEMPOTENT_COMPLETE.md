# Migration BIO Certifications - Versione Completamente Idempotente

## ✅ Tutti i Fix Applicati

La migration è ora **completamente idempotente** e può essere eseguita multiple volte senza errori.

---

## 🔧 Fix Applicati

### 1. ✅ Trigger
```sql
-- Prima (causava errore)
CREATE TRIGGER auto_update_bio_compliance_score ...

-- Dopo (idempotente)
DROP TRIGGER IF EXISTS auto_update_bio_compliance_score ON bio_certifications;
CREATE TRIGGER auto_update_bio_compliance_score ...
```

### 2. ✅ Indici
```sql
-- Prima (causava errore)
CREATE INDEX idx_bio_certifications_garden ON bio_certifications(garden_id);

-- Dopo (idempotente)
CREATE INDEX IF NOT EXISTS idx_bio_certifications_garden ON bio_certifications(garden_id);
```

### 3. ✅ Policies
```sql
-- Prima (causava errore)
CREATE POLICY "Users can view own bio certifications" ...

-- Dopo (idempotente)
DROP POLICY IF EXISTS "Users can view own bio certifications" ON bio_certifications;
CREATE POLICY "Users can view own bio certifications" ...
```

---

## 📋 Checklist Idempotenza Completa

### Tabelle
- [x] `CREATE TABLE IF NOT EXISTS`

### Funzioni
- [x] `CREATE OR REPLACE FUNCTION`

### Trigger
- [x] `DROP TRIGGER IF EXISTS` + `CREATE TRIGGER`

### Indici (8 totali)
- [x] `CREATE INDEX IF NOT EXISTS idx_bio_certifications_garden`
- [x] `CREATE INDEX IF NOT EXISTS idx_bio_certifications_status`
- [x] `CREATE INDEX IF NOT EXISTS idx_bio_certifications_expiry`
- [x] `CREATE INDEX IF NOT EXISTS idx_bio_certifications_score`
- [x] `CREATE INDEX IF NOT EXISTS idx_bio_cert_docs_certification`
- [x] `CREATE INDEX IF NOT EXISTS idx_bio_cert_docs_type`
- [x] `CREATE INDEX IF NOT EXISTS idx_bio_cert_inspections_certification`
- [x] `CREATE INDEX IF NOT EXISTS idx_bio_cert_inspections_date`

### Policies (12 totali)
- [x] `DROP POLICY IF EXISTS` + `CREATE POLICY` per bio_certifications (4)
- [x] `DROP POLICY IF EXISTS` + `CREATE POLICY` per bio_certification_documents (4)
- [x] `DROP POLICY IF EXISTS` + `CREATE POLICY` per bio_certification_inspections (4)

### Views
- [x] `CREATE OR REPLACE VIEW`

---

## 🧪 Test Idempotenza

### Test 1: Prima Esecuzione
```sql
-- Esegui migration completa
-- Risultato atteso: ✅ Tutto creato senza errori
```

### Test 2: Seconda Esecuzione (Idempotenza)
```sql
-- Riesegui la stessa migration
-- Risultato atteso: ✅ Nessun errore "already exists"
```

### Test 3: Terza Esecuzione (Conferma)
```sql
-- Riesegui ancora
-- Risultato atteso: ✅ Sempre nessun errore
```

---

## 📝 Come Applicare

### Opzione 1: Supabase SQL Editor (CONSIGLIATO)

1. Apri Supabase Dashboard
2. Vai a SQL Editor
3. Copia il contenuto di `supabase/migrations/20260116000000_create_bio_certifications.sql`
4. Incolla e clicca "Run"
5. Verifica: ✅ Success

### Opzione 2: File All-in-One

```sql
-- Usa APPLY_ALL_MIGRATIONS_JAN16.sql
-- Include tutte e 3 le migrations in ordine
```

---

## ✅ Verifica Post-Applicazione

### 1. Verifica Tabelle Create
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE 'bio_%' 
  AND table_schema = 'public';
```

**Risultato Atteso:**
```
bio_certifications
bio_certification_documents
bio_certification_inspections
```

### 2. Verifica Trigger
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'auto_update_bio_compliance_score';
```

**Risultato Atteso:**
```
auto_update_bio_compliance_score | INSERT | bio_certifications
auto_update_bio_compliance_score | UPDATE | bio_certifications
```

### 3. Verifica Indici
```sql
SELECT indexname 
FROM pg_indexes 
WHERE tablename LIKE 'bio_%'
ORDER BY indexname;
```

**Risultato Atteso:** 8 indici

### 4. Verifica Policies
```sql
SELECT policyname, tablename
FROM pg_policies
WHERE tablename LIKE 'bio_%'
ORDER BY tablename, policyname;
```

**Risultato Atteso:** 12 policies

### 5. Verifica Funzioni
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_name LIKE '%bio%'
  AND routine_schema = 'public';
```

**Risultato Atteso:**
```
calculate_bio_compliance_score
update_bio_compliance_score
get_bio_certification_readiness
create_bio_certification_from_garden
```

---

## 🎯 Test Funzionale

### Test Inserimento Certificazione
```sql
-- Inserisci certificazione test
INSERT INTO bio_certifications (
  garden_id,
  company_name,
  certification_body,
  total_area,
  organic_area,
  uses_chemical_fertilizers,
  uses_synthetic_pesticides,
  uses_gmo,
  has_traceability_system,
  separates_organic_conventional,
  keeps_production_records
) VALUES (
  (SELECT id FROM gardens LIMIT 1), -- Usa un garden esistente
  'Azienda Test BIO',
  'ICEA',
  10.5,
  8.0,
  false,
  false,
  false,
  true,
  true,
  true
) RETURNING id, compliance_score;
```

**Risultato Atteso:**
- ✅ Inserimento riuscito
- ✅ `compliance_score` calcolato automaticamente (> 0)
- ✅ `updated_at` = NOW()

### Test Calcolo Score
```sql
-- Verifica score calcolato
SELECT 
  id,
  company_name,
  compliance_score,
  get_bio_certification_readiness(id) as readiness
FROM bio_certifications
WHERE company_name = 'Azienda Test BIO';
```

**Risultato Atteso:**
- `compliance_score` tra 60-80 (dipende dai dati)
- `readiness` = 'partially_ready' o 'ready'

---

## 🔄 Rollback (Se Necessario)

Se vuoi rimuovere tutto:

```sql
-- Drop policies
DROP POLICY IF EXISTS "Users can view own bio certifications" ON bio_certifications;
DROP POLICY IF EXISTS "Users can insert own bio certifications" ON bio_certifications;
DROP POLICY IF EXISTS "Users can update own bio certifications" ON bio_certifications;
DROP POLICY IF EXISTS "Users can delete own bio certifications" ON bio_certifications;

DROP POLICY IF EXISTS "Users can view own bio certification documents" ON bio_certification_documents;
DROP POLICY IF EXISTS "Users can insert own bio certification documents" ON bio_certification_documents;
DROP POLICY IF EXISTS "Users can update own bio certification documents" ON bio_certification_documents;
DROP POLICY IF EXISTS "Users can delete own bio certification documents" ON bio_certification_documents;

DROP POLICY IF EXISTS "Users can view own bio certification inspections" ON bio_certification_inspections;
DROP POLICY IF EXISTS "Users can insert own bio certification inspections" ON bio_certification_inspections;
DROP POLICY IF EXISTS "Users can update own bio certification inspections" ON bio_certification_inspections;
DROP POLICY IF EXISTS "Users can delete own bio certification inspections" ON bio_certification_inspections;

-- Drop view
DROP VIEW IF EXISTS bio_certifications_with_readiness;

-- Drop trigger
DROP TRIGGER IF EXISTS auto_update_bio_compliance_score ON bio_certifications;

-- Drop functions
DROP FUNCTION IF EXISTS update_bio_compliance_score();
DROP FUNCTION IF EXISTS calculate_bio_compliance_score(UUID);
DROP FUNCTION IF EXISTS get_bio_certification_readiness(UUID);
DROP FUNCTION IF EXISTS create_bio_certification_from_garden(UUID);

-- Drop tables (CASCADE rimuove anche indici)
DROP TABLE IF EXISTS bio_certification_inspections CASCADE;
DROP TABLE IF EXISTS bio_certification_documents CASCADE;
DROP TABLE IF EXISTS bio_certifications CASCADE;
```

---

## 📚 Pattern Idempotenti SQL - Riferimento Rapido

### Tabelle
```sql
CREATE TABLE IF NOT EXISTS table_name (...);
```

### Colonne (ALTER TABLE)
```sql
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'my_table' AND column_name = 'my_column'
  ) THEN
    ALTER TABLE my_table ADD COLUMN my_column TEXT;
  END IF;
END $$;
```

### Funzioni
```sql
CREATE OR REPLACE FUNCTION function_name() ...
```

### Trigger
```sql
DROP TRIGGER IF EXISTS trigger_name ON table_name;
CREATE TRIGGER trigger_name ...
```

### Indici
```sql
CREATE INDEX IF NOT EXISTS index_name ON table_name(column);
```

### Unique Constraints
```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'constraint_name'
  ) THEN
    ALTER TABLE table_name ADD CONSTRAINT constraint_name UNIQUE (column);
  END IF;
END $$;
```

### Policies
```sql
DROP POLICY IF EXISTS policy_name ON table_name;
CREATE POLICY policy_name ...
```

### Views
```sql
CREATE OR REPLACE VIEW view_name AS ...
```

### Extensions
```sql
CREATE EXTENSION IF NOT EXISTS extension_name;
```

---

## 🎓 Lezioni Apprese

### 1. Sempre Testare Riapplicazione
Prima di committare una migration:
1. Applicala
2. Riapplicala immediatamente
3. Verifica nessun errore

### 2. Usare Pattern Idempotenti
Ogni oggetto SQL ha il suo pattern:
- Tabelle: `IF NOT EXISTS`
- Funzioni: `OR REPLACE`
- Trigger: `DROP IF EXISTS` + `CREATE`
- Indici: `IF NOT EXISTS`
- Policies: `DROP IF EXISTS` + `CREATE`

### 3. Documentare Dipendenze
Se una migration dipende da altre:
- Documentarlo nel file
- Usare timestamp ordinati
- Testare ordine esecuzione

---

**Data:** 16 Gennaio 2026, 10:15  
**Autore:** Kiro AI Assistant  
**Status:** ✅ MIGRATION COMPLETAMENTE IDEMPOTENTE
