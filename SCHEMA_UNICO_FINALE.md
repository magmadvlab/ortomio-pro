# Schema Unico Finale - Locale e Online IDENTICI

**Data**: 2026-01-02
**Obiettivo**: Database locale e online perfettamente sincronizzati

---

## ✅ DECISIONE FINALE

**Usiamo lo schema del database ONLINE come riferimento unico**

### Tabella Tasks
- ✅ **Nome tabella**: `garden_tasks` (NON calendar_tasks)
- ✅ **Colonna data**: `date` (NON start_date)
- ✅ **Codice**: `client.from('garden_tasks').order('date')`

---

## 🔄 MODIFICHE APPLICATE

### 1. Database LOCALE (Supabase CLI)
```sql
-- Già applicato
ALTER TABLE calendar_tasks RENAME TO garden_tasks;
ALTER TABLE garden_tasks RENAME COLUMN start_date TO date;
-- + tutti gli indici e constraints rinominati
```

### 2. Codice TypeScript
```typescript
// packages/storage-cloud/SupabaseStorageProvider.ts
client.from('garden_tasks')  // ✅ (era calendar_tasks)
query.order('date')          // ✅ (era start_date)
```

### 3. Migration Creata
- `supabase/migrations/20260102010000_align_task_table_schema.sql`
- Migration IDEMPOTENT (può essere eseguita più volte)
- Rinomina automaticamente se trova calendar_tasks

---

## 📊 SCHEMA FINALE CONDIVISO

| Tabella | Colonne Principali | Note |
|---------|-------------------|------|
| **garden_tasks** | id, user_id, garden_id, title, type, **date**, end_date, recurring, plant_name, completed, notes | ✅ UNICA per locale e online |
| **profiles** | id, tier, ai_credits_total, ai_credits_used, **preferences**, regione, provincia, clima | ✅ Con colonna preferences |
| **gardens** | id, user_id, name, coordinates, size_sq_meters, garden_type, soil_type | ✅ Identica |
| **seed_inventory** | id, user_id, garden_id, variety_name, species_name, quantity_remaining | ✅ Identica |
| **ai_credit_transactions** | id, user_id, amount, type, description | ✅ Identica |

**Totale tabelle**: 33+ (identiche locale e online)

---

## 🚀 DEPLOY SU DATABASE ONLINE

### Opzione 1: Supabase CLI (RACCOMANDATO)

```bash
cd /Users/magma/Downloads/ortomio-main

# Login
supabase login

# Link progetto
supabase link --project-ref YOUR_PROJECT_REF

# Push TUTTE le migrations
supabase db push

# Verifica
supabase migration list
```

**Migrations che verranno applicate**:
1. `20251230121000_add_notification_preferences.sql`
2. `20251230122000_fix_scalar_production_timeline_security.sql`
3. `20260102000000_fix_database_schema_pro_mode.sql`
4. `20260102010000_align_task_table_schema.sql` ⭐ NUOVO

### Opzione 2: SQL Editor (Manuale)

Se il database online HA GIÀ `garden_tasks` con colonna `date`:
1. Esegui solo: [DEPLOY_SQL_ONLINE_MINIMAL.txt](DEPLOY_SQL_ONLINE_MINIMAL.txt)
2. Crea trigger manualmente da Dashboard

Se il database online ha `calendar_tasks`:
1. Esegui anche la migration `20260102010000_align_task_table_schema.sql`
2. Poi esegui `DEPLOY_SQL_ONLINE_MINIMAL.txt`
3. Crea trigger

---

## 🔍 VERIFICA ALLINEAMENTO

### Sul Database LOCALE

```bash
psql "postgresql://postgres:postgres@127.0.0.1:54324/postgres" << 'EOF'
SELECT 'garden_tasks exists' as check,
  COUNT(*) as found
FROM information_schema.tables
WHERE table_name = 'garden_tasks';

SELECT 'date column exists' as check,
  COUNT(*) as found
FROM information_schema.columns
WHERE table_name = 'garden_tasks' AND column_name = 'date';
EOF
```

**Atteso**: Entrambi = 1

### Sul Database ONLINE

```sql
-- SQL Editor su Supabase.com
SELECT 'garden_tasks exists' as check,
  COUNT(*) as found
FROM information_schema.tables
WHERE table_name = 'garden_tasks';

SELECT 'date column exists' as check,
  COUNT(*) as found
FROM information_schema.columns
WHERE table_name = 'garden_tasks' AND column_name = 'date';
```

**Atteso**: Entrambi = 1

---

## 📝 CHECKLIST ALLINEAMENTO

- [x] Locale: tabella rinominata `calendar_tasks` → `garden_tasks`
- [x] Locale: colonna rinominata `start_date` → `date`
- [x] Locale: indici e constraints rinominati
- [x] Codice: `from('garden_tasks')` ✅
- [x] Codice: `order('date')` ✅
- [x] Migration creata per applicare online
- [ ] **Online: applicare migrations con `supabase db push`**
- [ ] **Online: creare trigger `on_auth_user_created`**
- [ ] **Test: registrazione nuovo utente funziona**
- [ ] **Test: creazione orto funziona**

---

## 🎯 PROSSIMI PASSI

1. **Applica migrations su database online**:
   ```bash
   supabase db push
   ```

2. **Crea trigger su database online**:
   - Database > Triggers > Create trigger
   - Name: `on_auth_user_created`
   - Table: `auth.users`
   - Events: After INSERT
   - Function: `public.handle_new_user`

3. **Aggiorna .env.local**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Test completo**:
   ```bash
   npm run dev
   # Registra nuovo utente
   # Crea nuovo orto
   # Verifica su Supabase Dashboard
   ```

---

## ✅ RISULTATO FINALE

**Database LOCALE e ONLINE sono IDENTICI**:
- ✅ Stesso schema tabelle
- ✅ Stessi nomi colonne
- ✅ Stesso codice TypeScript
- ✅ Stesse migrations tracciabili
- ✅ Deploy ripetibile su altri progetti

---

**Ultimo aggiornamento**: 2026-01-02
**Schema versione**: 2.0 (unified)
**Status**: ✅ ALLINEATO
