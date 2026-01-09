# Deploy Tutte le Migration a Supabase Production

## 📋 Overview

Questa guida consolida tutte le migration necessarie per portare il database di produzione allo stato attuale del codice.

## 🔴 Migration Critiche (Da Applicare Subito)

Queste migration risolvono errori attivi in produzione:

### 1. User Preferences (CRITICA - Fix 400 errors)

**File:** `database/migrations/add_user_preferences.sql`

**Problema risolto:**
- Errori 400 su `/rest/v1/profiles?select=preferences`
- SupabaseStorageProvider tenta di accedere colonna inesistente

**Cosa fa:**
```sql
ALTER TABLE profiles ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;
CREATE INDEX idx_profiles_preferences ON profiles USING gin(preferences);
```

**Deploy:**
```bash
# Via Supabase Dashboard - SQL Editor
# Copia e incolla il contenuto di add_user_preferences.sql
```

**Verifica:**
```sql
-- Deve restituire 1 riga con preferences = JSONB
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'preferences';
```

---

## 📦 Migration Funzionalità (Importanti ma non bloccanti)

### 2. Micro-Zone Tracking System

**File:** `database/migrations/CONSOLIDATED_microzone_tracking_FINAL.sql`

**Cosa fa:**
- Crea tabella `garden_rows` (filari)
- Aggiunge `bed_id` e `row_id` a:
  - `fertilizer_application_logs`
  - `treatment_register`
  - `watering_logs`
  - `mechanical_work_register`
- Crea viste analytics per micro-zone

**Prerequisiti:**
Verifica che esistano le tabelle base:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'gardens',
  'garden_beds',
  'fertilizer_application_logs',
  'treatment_register',
  'watering_logs',
  'mechanical_work_register'
);
```

**Deploy:** Vedi [DEPLOY_MICROZONE_TRACKING.md](./DEPLOY_MICROZONE_TRACKING.md)

---

## 🔧 Ordine di Applicazione Consigliato

```bash
# 1. CRITICA - User Preferences (risolve 400 errors)
# Via Supabase Dashboard → SQL Editor
# Copia/incolla: database/migrations/add_user_preferences.sql

# 2. Micro-Zone Tracking (abilita nuove funzionalità)
# Via Supabase Dashboard → SQL Editor
# Copia/incolla: database/migrations/CONSOLIDATED_microzone_tracking_FINAL.sql
```

---

## ✅ Verifica Post-Deploy Completa

Esegui questo script per verificare che tutto sia OK:

```sql
-- 1. Verifica preferences column
SELECT
  EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'preferences'
  ) as preferences_exists;

-- 2. Verifica garden_rows table
SELECT
  EXISTS(
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'garden_rows'
  ) as garden_rows_exists;

-- 3. Verifica colonne micro-zone
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name IN ('bed_id', 'row_id')
ORDER BY table_name, column_name;

-- 4. Verifica viste create
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE '%microzone%';
```

**Output atteso:**

```
preferences_exists | garden_rows_exists
-------------------+-------------------
 t                 | t

 table_name                    | column_name
-------------------------------+-------------
 fertilizer_application_logs   | bed_id
 fertilizer_application_logs   | row_id
 mechanical_work_register      | bed_id
 mechanical_work_register      | row_id
 treatment_register            | bed_id
 treatment_register            | row_id
 watering_logs                 | bed_id
 watering_logs                 | row_id

 table_name
-------------------------------
 fertilization_by_microzone
 irrigation_by_microzone
 mechanical_work_by_microzone
 treatment_by_microzone
```

---

## 🚨 Rollback (Solo se necessario)

### Rollback User Preferences
```sql
ALTER TABLE profiles DROP COLUMN IF EXISTS preferences;
DROP INDEX IF EXISTS idx_profiles_preferences;
```

### Rollback Micro-Zone Tracking
Vedi sezione "Rollback" in [DEPLOY_MICROZONE_TRACKING.md](./DEPLOY_MICROZONE_TRACKING.md)

---

## 📝 Dopo il Deploy

### 1. Riabilita User Preferences nel codice

In `packages/storage-cloud/SupabaseStorageProvider.ts`:

Rimuovi i commenti `/* DISABLED UNTIL MIGRATION ... */` dalle funzioni:
- `getUserPreference()`
- `setUserPreference()`

### 2. Commit e deploy

```bash
git add packages/storage-cloud/SupabaseStorageProvider.ts
git commit -m "feat: Riabilita user preferences dopo migration"
git push origin main
```

Vercel farà auto-deploy della nuova versione.

---

## 🎯 Impatto Previsto

### Prima del Deploy
- ❌ 400 errors su preferences query
- ❌ Console piena di errori
- ⚠️ Micro-zone tracking non disponibile

### Dopo il Deploy
- ✅ Nessun errore preferences
- ✅ User preferences funzionanti
- ✅ Tracking micro-zone completo su tutti i form
- ✅ Aiuole e filari tracciabili per ogni operazione

---

## 📞 Support

In caso di problemi:
1. Verifica che le tabelle prerequisite esistano
2. Controlla i log SQL Editor per errori specifici
3. Verifica che le migration siano state copiate correttamente (no truncate)
4. Se un errore persiste, applica il rollback e riprova

---

## 🔗 File Correlati

- [DEPLOY_MICROZONE_TRACKING.md](./DEPLOY_MICROZONE_TRACKING.md) - Guida dettagliata micro-zone
- [add_user_preferences.sql](./migrations/add_user_preferences.sql) - Migration preferences
- [CONSOLIDATED_microzone_tracking_FINAL.sql](./migrations/CONSOLIDATED_microzone_tracking_FINAL.sql) - Migration micro-zone
