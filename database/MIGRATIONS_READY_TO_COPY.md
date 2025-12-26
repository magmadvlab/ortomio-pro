# 📋 Migration SQL Pronte da Copiare

## 🔴 MIGRATION 1: User Preferences (CRITICA - Risolve 400 errors)

**Applica questa PRIMA**

```sql
-- ============================================
-- ADD USER PREFERENCES TO PROFILES
-- Data: 2025-12-26
-- Descrizione: Aggiunge colonna preferences (JSONB) alla tabella profiles
-- ============================================

-- Add preferences column if it doesn't exist
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Create index for better query performance on preferences keys
CREATE INDEX IF NOT EXISTS idx_profiles_preferences
  ON profiles USING gin(preferences);

COMMENT ON COLUMN profiles.preferences IS 'User preferences stored as JSON (theme, notifications, etc.)';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ User preferences column added to profiles table successfully!';
END $$;
```

**Come applicare:**
1. Vai su Supabase Dashboard
2. Apri **SQL Editor**
3. Copia TUTTO il codice SQL sopra (inclusi i commenti)
4. Incolla nell'editor
5. Clicca **Run** (o premi Cmd/Ctrl + Enter)

**Verifica successo:**
```sql
-- Dovresti vedere 1 riga con preferences = jsonb
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'preferences';
```

---

## 🟢 MIGRATION 2: Micro-Zone Tracking (Funzionalità nuove)

**Applica questa DOPO la migration 1**

**IMPORTANTE:** Questa migration è lunga (214 righe). Copia TUTTO il codice qui sotto:

```sql
-- ============================================
-- CONSOLIDATED MICRO-ZONE TRACKING MIGRATION
-- Data: 2025-12-26
-- Descrizione: Aggiunge supporto completo per tracking micro-zone su tutte le operazioni agronomiche
-- ============================================

-- Questo file consolida:
-- - add_garden_rows.sql
-- - add_rows_to_fertilization_and_treatments.sql
-- - Parti di add_microzone_tracking.sql
-- Per fornire una singola migrazione applicabile

-- ============================================
-- 1. GARDEN_ROWS TABLE (se non esiste)
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS garden_rows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  bed_id UUID REFERENCES garden_beds(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  row_number INTEGER,
  length_meters DECIMAL(10, 2) NOT NULL,
  irrigation_line JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garden_rows_garden_id ON garden_rows(garden_id);
CREATE INDEX IF NOT EXISTS idx_garden_rows_bed_id ON garden_rows(bed_id);
CREATE INDEX IF NOT EXISTS idx_garden_rows_row_number ON garden_rows(bed_id, row_number);

ALTER TABLE garden_rows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their garden rows"
  ON garden_rows FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_rows.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

-- ============================================
-- 2. FERTILIZER_APPLICATION_LOGS: Aggiungi row_id
-- ============================================
ALTER TABLE fertilizer_application_logs
  ADD COLUMN IF NOT EXISTS row_id UUID REFERENCES garden_rows(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_fertilizer_application_logs_row_id
  ON fertilizer_application_logs(row_id)
  WHERE row_id IS NOT NULL;

COMMENT ON COLUMN fertilizer_application_logs.row_id IS 'Riferimento al filare specifico fertilizzato';

-- ============================================
-- 3. TREATMENT_REGISTER: Aggiungi bed_id e row_id
-- ============================================
ALTER TABLE treatment_register
  ADD COLUMN IF NOT EXISTS bed_id UUID REFERENCES garden_beds(id) ON DELETE SET NULL;

ALTER TABLE treatment_register
  ADD COLUMN IF NOT EXISTS row_id UUID REFERENCES garden_rows(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_treatment_register_bed_id
  ON treatment_register(bed_id)
  WHERE bed_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_treatment_register_row_id
  ON treatment_register(row_id)
  WHERE row_id IS NOT NULL;

COMMENT ON COLUMN treatment_register.bed_id IS 'Riferimento al letto/cassone specifico trattato';
COMMENT ON COLUMN treatment_register.row_id IS 'Riferimento al filare specifico trattato';

-- ============================================
-- 4. WATERING_LOGS: Aggiungi bed_id e row_id
-- ============================================
ALTER TABLE watering_logs
  ADD COLUMN IF NOT EXISTS bed_id UUID REFERENCES garden_beds(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS row_id UUID REFERENCES garden_rows(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_watering_logs_bed ON watering_logs(bed_id) WHERE bed_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_watering_logs_row ON watering_logs(row_id) WHERE row_id IS NOT NULL;

COMMENT ON COLUMN watering_logs.bed_id IS 'Letto/cassone specifico irrigato (opzionale se non parte di zona)';
COMMENT ON COLUMN watering_logs.row_id IS 'Filare specifico irrigato';

-- ============================================
-- 5. MECHANICAL_WORK_REGISTER: Aggiungi bed_id e row_id (se non esistono)
-- ============================================
ALTER TABLE mechanical_work_register
  ADD COLUMN IF NOT EXISTS bed_id UUID REFERENCES garden_beds(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS row_id UUID REFERENCES garden_rows(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_mechanical_work_register_bed ON mechanical_work_register(bed_id) WHERE bed_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mechanical_work_register_row ON mechanical_work_register(row_id) WHERE row_id IS NOT NULL;

COMMENT ON COLUMN mechanical_work_register.bed_id IS 'Letto/cassone specifico lavorato';
COMMENT ON COLUMN mechanical_work_register.row_id IS 'Filare specifico lavorato';

-- ============================================
-- 6. HELPER VIEWS (opzionali - per analytics)
-- ============================================

-- Vista unificata trattamenti per micro-zona
CREATE OR REPLACE VIEW treatment_by_microzone AS
SELECT
  tr.id,
  tr.garden_id,
  tr.treatment_date,
  tr.plant_name,
  tr.target_pest_disease,
  tr.dosage,
  'treatment' as operation_type,
  tr.bed_id,
  tr.row_id,
  gb.name as bed_name,
  gr.name as row_name
FROM treatment_register tr
LEFT JOIN garden_beds gb ON gb.id = tr.bed_id
LEFT JOIN garden_rows gr ON gr.id = tr.row_id;

-- Vista unificata fertilizzazioni per micro-zona
CREATE OR REPLACE VIEW fertilization_by_microzone AS
SELECT
  fl.id,
  fl.garden_id,
  fl.application_date,
  fl.product_name,
  fl.dosage_amount,
  fl.dosage_unit,
  fl.method,
  'fertilization' as operation_type,
  fl.bed_id,
  fl.row_id,
  gb.name as bed_name,
  gr.name as row_name
FROM fertilizer_application_logs fl
LEFT JOIN garden_beds gb ON gb.id = fl.bed_id
LEFT JOIN garden_rows gr ON gr.id = fl.row_id;

-- Vista unificata irrigazioni per micro-zona
CREATE OR REPLACE VIEW irrigation_by_microzone AS
SELECT
  wl.id,
  wl.garden_id,
  wl.date,
  wl.duration_minutes,
  wl.liters_applied,
  wl.method,
  'irrigation' as operation_type,
  wl.bed_id,
  wl.zone_id,
  wl.row_id,
  gb.name as bed_name,
  gz.name as zone_name,
  gr.name as row_name
FROM watering_logs wl
LEFT JOIN garden_beds gb ON gb.id = wl.bed_id
LEFT JOIN irrigation_zones gz ON gz.id = wl.zone_id
LEFT JOIN garden_rows gr ON gr.id = wl.row_id;

-- Vista unificata lavorazioni per micro-zona
CREATE OR REPLACE VIEW mechanical_work_by_microzone AS
SELECT
  mw.id,
  mw.garden_id,
  mw.work_date,
  mw.work_type,
  mw.depth_cm,
  'mechanical_work' as operation_type,
  mw.bed_id,
  mw.row_id,
  gb.name as bed_name,
  gr.name as row_name
FROM mechanical_work_register mw
LEFT JOIN garden_beds gb ON gb.id = mw.bed_id
LEFT JOIN garden_rows gr ON gr.id = mw.row_id;

-- ============================================
-- COMMENTI FINALI
-- ============================================
COMMENT ON VIEW treatment_by_microzone IS 'Vista trattamenti con dettagli micro-zone (bed/row)';
COMMENT ON VIEW fertilization_by_microzone IS 'Vista fertilizzazioni con dettagli micro-zone (bed/row)';
COMMENT ON VIEW irrigation_by_microzone IS 'Vista irrigazioni con dettagli micro-zone (bed/zone/row)';
COMMENT ON VIEW mechanical_work_by_microzone IS 'Vista lavorazioni con dettagli micro-zone (bed/row)';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Micro-zone tracking migration completed successfully!';
  RAISE NOTICE 'Tables updated: garden_rows, fertilizer_application_logs, treatment_register, watering_logs, mechanical_work_register';
  RAISE NOTICE 'Views created: treatment_by_microzone, fertilization_by_microzone, irrigation_by_microzone, mechanical_work_by_microzone';
END $$;
```

**Come applicare:**
1. Vai su Supabase Dashboard
2. Apri **SQL Editor**
3. Copia TUTTO il codice SQL sopra (dal primo `--` fino alla fine)
4. Incolla nell'editor
5. Clicca **Run**

**Verifica successo:**
```sql
-- Verifica colonne aggiunte
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name IN ('bed_id', 'row_id')
ORDER BY table_name, column_name;

-- Verifica garden_rows table
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'garden_rows'
) as garden_rows_exists;
```

**Output atteso:**
```
 table_name                    | column_name | data_type
-------------------------------+-------------+-----------
 fertilizer_application_logs   | bed_id      | uuid
 fertilizer_application_logs   | row_id      | uuid
 mechanical_work_register      | bed_id      | uuid
 mechanical_work_register      | row_id      | uuid
 treatment_register            | bed_id      | uuid
 treatment_register            | row_id      | uuid
 watering_logs                 | bed_id      | uuid
 watering_logs                 | row_id      | uuid

 garden_rows_exists
--------------------
 t
```

---

## 🔄 Dopo Aver Applicato Entrambe le Migration

### Riabilita User Preferences nel Codice

Quando entrambe le migration sono applicate con successo:

1. Apri il file `packages/storage-cloud/SupabaseStorageProvider.ts`
2. Cerca le funzioni `getUserPreference` e `setUserPreference`
3. Rimuovi i commenti `/* DISABLED UNTIL MIGRATION ... */`
4. Rimuovi i `return null;` e `return;` iniziali
5. Commit e push:

```bash
git add packages/storage-cloud/SupabaseStorageProvider.ts
git commit -m "feat: Riabilita user preferences dopo migration"
git push origin main
```

---

## ❌ Se Qualcosa Va Storto

### Rollback Migration 1 (Preferences)
```sql
ALTER TABLE profiles DROP COLUMN IF EXISTS preferences;
DROP INDEX IF EXISTS idx_profiles_preferences;
```

### Rollback Migration 2 (Micro-Zone)
```sql
-- Rimuovi colonne aggiunte
ALTER TABLE fertilizer_application_logs DROP COLUMN IF EXISTS row_id;
ALTER TABLE treatment_register DROP COLUMN IF EXISTS bed_id, DROP COLUMN IF EXISTS row_id;
ALTER TABLE watering_logs DROP COLUMN IF EXISTS bed_id, DROP COLUMN IF EXISTS row_id;
ALTER TABLE mechanical_work_register DROP COLUMN IF EXISTS bed_id, DROP COLUMN IF EXISTS row_id;

-- Rimuovi viste
DROP VIEW IF EXISTS treatment_by_microzone;
DROP VIEW IF EXISTS fertilization_by_microzone;
DROP VIEW IF EXISTS irrigation_by_microzone;
DROP VIEW IF EXISTS mechanical_work_by_microzone;

-- Rimuovi tabella garden_rows (ATTENZIONE: elimina tutti i filari!)
DROP TABLE IF EXISTS garden_rows CASCADE;
```

---

## 📞 Note

- Le migration sono **idempotenti** (puoi eseguirle più volte senza problemi)
- Usano `IF NOT EXISTS` per sicurezza
- Tutti gli indici sono parziali (solo per valori NOT NULL) per performance
- Le viste sono `CREATE OR REPLACE` quindi aggiornabili

**Tempo stimato:** ~30 secondi ciascuna

Buon deploy! 🚀
