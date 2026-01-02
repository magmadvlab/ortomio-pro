# Deploy Database Online - OrtoMio

**Data**: 2026-01-02
**Obiettivo**: Aggiornare database Supabase online con le ultime migrations

---

## 📋 Prerequisiti

Prima di procedere, assicurati di avere:

1. ✅ Account Supabase su https://supabase.com
2. ✅ Progetto Supabase creato online
3. ✅ Supabase CLI installato (`supabase --version`)
4. ✅ Autenticato con Supabase (`supabase login`)

---

## 🔗 Step 1: Link Progetto Online

### Opzione A: Se hai già un progetto

```bash
# Lista progetti disponibili
supabase projects list

# Link al progetto (sostituisci YOUR_PROJECT_REF)
supabase link --project-ref YOUR_PROJECT_REF

# Esempio:
# supabase link --project-ref abcdefghijklmnopqrst
```

### Opzione B: Crea nuovo progetto

```bash
# Crea progetto (vai su https://supabase.com/dashboard)
# Oppure usa CLI:
supabase projects create ortomio-pro --org-id YOUR_ORG_ID --region eu-west-1
```

---

## 📤 Step 2: Push Migrations al Database Online

Dopo aver linkato il progetto:

```bash
cd /Users/magma/Downloads/ortomio-main

# Verifica migrations locali
supabase db diff

# Push tutte le migrations al database online
supabase db push

# Se chiede conferma, digita: yes
```

**Cosa farà**:
- Applica tutte le migrations in `supabase/migrations/` al database online
- Include la nuova migration `20260102000000_fix_database_schema_pro_mode.sql`
- Crea tabelle, trigger, funzioni, RLS policies

---

## 🔍 Step 3: Verifica Apply

```bash
# Verifica che le migrations siano state applicate
supabase migration list

# Output atteso:
# ✓ 20251230121000_add_notification_preferences.sql
# ✓ 20251230122000_fix_scalar_production_timeline_security.sql
# ✓ 20260102000000_fix_database_schema_pro_mode.sql
```

---

## 🔑 Step 4: Aggiorna .env.local per Produzione

Dopo il deploy, aggiorna `.env.local` con le credenziali del progetto online:

```bash
# Ottieni le credenziali del progetto
supabase projects api-keys --project-ref YOUR_PROJECT_REF
```

Aggiorna `.env.local`:

```env
# PRODUZIONE - Database Online
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# DATABASE_URL non serve per produzione (Supabase gestisce internamente)
```

**Oppure crea `.env.production`**:

```env
# .env.production
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

---

## 🧪 Step 5: Test Database Online

### Verifica da Supabase Dashboard

1. Vai su https://supabase.com/dashboard/project/YOUR_PROJECT_REF
2. Apri **Table Editor**
3. Verifica che esistano le tabelle:
   - `profiles`
   - `gardens`
   - `calendar_tasks`
   - `seed_inventory`
   - `ai_credit_transactions`
   - ... (33+ tabelle totali)

### Verifica da SQL Editor

```sql
-- Verifica trigger
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Verifica funzioni
SELECT proname, prosecdef
FROM pg_proc
WHERE proname IN ('grant_credits', 'handle_new_user', 'handle_new_user_credits');

-- Verifica colonna preferences
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'preferences';
```

### Test Registrazione Utente

```bash
# Test da locale puntando al database online
npm run dev

# Vai su http://localhost:3002
# Registra nuovo utente
# Verifica che:
# 1. Profilo creato automaticamente
# 2. Tier PRO assegnato
# 3. 6 crediti AI (3 iniziali + 3 bonus)
```

---

## 📊 Migrations Incluse

Le seguenti migrations verranno applicate al database online:

### 1. Notification Preferences (20251230121000)
- Aggiunge colonna `notification_preferences` a profiles
- Configura preferenze notifiche utente

### 2. Scalar Production Timeline (20251230122000)
- Fix security della view `scalar_production_timeline`
- Cambia da SECURITY DEFINER a SECURITY INVOKER

### 3. **Fix Database Schema PRO Mode (20260102000000)** ⭐
**Questa è la migration critica** che include:
- ✅ Colonna `preferences` JSONB a profiles
- ✅ Fix funzione `grant_credits` con SECURITY DEFINER
- ✅ Fix funzione `handle_new_user_credits` con SECURITY DEFINER
- ✅ Fix funzione `handle_new_user` con SECURITY DEFINER
- ✅ Trigger automatico `on_auth_user_created`
- ✅ Permessi `supabase_auth_admin` su profiles e ai_credit_transactions
- ✅ Reload schema PostgREST

---

## ⚠️ Modifiche Schema vs Codice

Alcune modifiche sono state applicate **solo nel codice TypeScript**, non nel database:

### Fix Applicati nel Codice
1. **garden_tasks → calendar_tasks**
   - File: `packages/storage-cloud/SupabaseStorageProvider.ts`
   - Motivo: Tabella si chiama `calendar_tasks` non `garden_tasks`

2. **date → start_date**
   - File: `packages/storage-cloud/SupabaseStorageProvider.ts`
   - Motivo: Campo ordinamento tasks usa `start_date`

3. **primary_crop rimosso**
   - File: `packages/storage-cloud/SupabaseStorageProvider.ts`
   - Motivo: Campo non esiste nello schema database

**Nota**: Questi fix NON richiedono migrations perché lo schema database è già corretto. Era il codice che aveva riferimenti errati.

---

## 🔄 Workflow Completo

```bash
# 1. Login Supabase
supabase login

# 2. Link progetto
supabase link --project-ref YOUR_PROJECT_REF

# 3. Verifica migrations da applicare
supabase db diff

# 4. Push migrations
supabase db push

# 5. Verifica apply
supabase migration list

# 6. Ottieni credenziali
supabase projects api-keys --project-ref YOUR_PROJECT_REF

# 7. Aggiorna .env.local o .env.production

# 8. Test app
npm run dev
```

---

## 🆘 Troubleshooting

### "Error: Project not linked"

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### "Error: Not logged in"

```bash
supabase login
```

### "Error: Migration already applied"

```bash
# Verifica stato migrations
supabase migration list

# Se serve riapplicare (ATTENZIONE: potrebbe causare errori)
supabase db push --ignore-version-mismatch
```

### "Error: Permission denied"

Verifica di avere accesso al progetto Supabase come owner o admin.

### Migrations falliscono

```bash
# Verifica errori specifici
supabase db push --debug

# Controlla log database
# Vai su Supabase Dashboard > Logs > Database
```

---

## 📝 Checklist Deploy

Prima di considerare il deploy completato:

- [ ] Progetto Supabase linkato
- [ ] Tutte le migrations pushate
- [ ] Migration list mostra tutte le migrations applicate
- [ ] Tabelle verificate su Supabase Dashboard
- [ ] Trigger `on_auth_user_created` presente
- [ ] Funzioni crediti con SECURITY DEFINER
- [ ] Colonna `preferences` in profiles
- [ ] `.env.local` o `.env.production` aggiornato
- [ ] Test registrazione utente funzionante
- [ ] Test creazione orto funzionante
- [ ] Sistema crediti AI (6 totali) funzionante

---

## 🔐 Sicurezza

**IMPORTANTE**: NON committare mai le credenziali in Git!

```bash
# Verifica che .env.local sia in .gitignore
cat .gitignore | grep .env.local

# Se non c'è, aggiungilo:
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

---

## 📞 Supporto

Per problemi con il deploy:

1. **Supabase CLI**: https://supabase.com/docs/guides/cli
2. **Migrations**: https://supabase.com/docs/guides/cli/local-development#database-migrations
3. **Link Project**: https://supabase.com/docs/reference/cli/supabase-link

---

**Ultimo aggiornamento**: 2026-01-02
**Versione**: Next.js 16.0.8 + Supabase
**Migration Critica**: 20260102000000_fix_database_schema_pro_mode.sql
