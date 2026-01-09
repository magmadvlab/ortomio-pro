# Istruzioni Deploy Database Online - IMMEDIATO

**Data**: 2026-01-02
**Obiettivo**: Sincronizzare database locale perfetto → Supabase.com

---

## 🎯 PASSI DA ESEGUIRE (5 minuti)

### Step 1: Ottieni Project Reference

1. Vai su **https://supabase.com/dashboard**
2. Apri il tuo progetto OrtoMio
3. Vai su **Settings** (icona ingranaggio in basso a sinistra)
4. Clicca su **General**
5. Copia il **Reference ID** (es: `abcdefghijklmnopqrst`)

**Esempio**: Se l'URL del progetto è `https://abcdefghijklmnopqrst.supabase.co`
Il Reference ID è: `abcdefghijklmnopqrst`

---

### Step 2: Login Supabase CLI

Apri un nuovo terminale (NON questo dove gira Claude) e esegui:

```bash
cd /Users/magma/Downloads/ortomio-main

# Login interattivo
supabase login
```

- Si aprirà il browser
- Fai login con il tuo account Supabase
- Autorizza la CLI
- Torna al terminale (vedrai "Logged in")

---

### Step 3: Link Progetto

Nel terminale, esegui (sostituisci `YOUR_PROJECT_REF` con il tuo Reference ID):

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

**Esempio**:
```bash
supabase link --project-ref abcdefghijklmnopqrst
```

Ti chiederà la password del database:
- **Password database**: (la trovi su Supabase Dashboard > Settings > Database)
- Oppure premi INVIO se hai configurato una password locale

---

### Step 4: Push Migrations (CRITICO)

Questo comando applica tutte le migrations al database online:

```bash
supabase db push
```

**Output atteso**:
```
Applying migration 20251230121000_add_notification_preferences.sql...
Applying migration 20251230122000_fix_scalar_production_timeline_security.sql...
Applying migration 20260102000000_fix_database_schema_pro_mode.sql...
✓ All migrations applied successfully!
```

Se chiede conferma, digita: `yes`

---

### Step 5: Verifica Migration Applicate

```bash
supabase migration list
```

**Output atteso** (tutte con ✓):
```
✓ 20251230121000_add_notification_preferences.sql
✓ 20251230122000_fix_scalar_production_timeline_security.sql
✓ 20260102000000_fix_database_schema_pro_mode.sql
```

---

## 🔍 VERIFICA DATABASE ONLINE

### Opzione A: Da Supabase Dashboard

1. Vai su **https://supabase.com/dashboard/project/YOUR_PROJECT_REF**
2. Apri **Table Editor**
3. Verifica che esistano:
   - ✅ `profiles` (con colonna `preferences`)
   - ✅ `gardens`
   - ✅ `calendar_tasks`
   - ✅ `seed_inventory`
   - ✅ `ai_credit_transactions`

4. Apri **Database** > **Triggers**
5. Verifica trigger: `on_auth_user_created` su tabella `auth.users`

### Opzione B: Da SQL Editor

Vai su **SQL Editor** e esegui:

```sql
-- 1. Verifica colonna preferences
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'preferences';
-- Atteso: 1 riga con data_type = jsonb

-- 2. Verifica trigger
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
-- Atteso: 1 riga

-- 3. Verifica funzioni
SELECT proname, prosecdef
FROM pg_proc
WHERE proname IN ('grant_credits', 'handle_new_user', 'handle_new_user_credits');
-- Atteso: 3 righe con prosecdef = true (SECURITY DEFINER)

-- 4. Conta tabelle
SELECT COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public';
-- Atteso: ~33 tabelle
```

---

## 🔑 AGGIORNA CREDENZIALI APP

Dopo il deploy, devi aggiornare `.env.local` per puntare al database online.

### Ottieni Credenziali

1. Vai su **https://supabase.com/dashboard/project/YOUR_PROJECT_REF**
2. Clicca su **Settings** > **API**
3. Copia:
   - **URL**: `https://YOUR_PROJECT_REF.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role** (clicca "Reveal"): `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Aggiorna .env.local

Crea **backup** del file attuale:
```bash
cp .env.local .env.local.backup
```

Poi modifica `.env.local`:

```env
# PRODUZIONE - Database Online Supabase.com
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# DATABASE_URL non serve (Supabase gestisce internamente)
# DATABASE_URL rimosso

# NEXT_PUBLIC_BYPASS_AUTH=true  # Rimane commentato per PRO mode
```

---

## 🧪 TEST APPLICAZIONE

### 1. Riavvia Next.js

```bash
# Ferma il dev server (Ctrl+C)
# Riavvia
npm run dev
```

### 2. Test Registrazione Nuovo Utente

1. Vai su **http://localhost:3002**
2. Clicca **Register**
3. Crea nuovo account (usa email diversa da roberto.lalinga@gmail.com)
4. Password a tua scelta

**Verifica**:
- ✅ Registrazione completa senza errori
- ✅ Redirect a dashboard o wizard
- ✅ Nessun errore console

### 3. Verifica Profilo Creato

Su Supabase Dashboard:
1. **Table Editor** > `profiles`
2. Dovresti vedere il nuovo utente con:
   - `tier`: `PRO`
   - `ai_credits_total`: `6` (3 iniziali + 3 bonus)
   - `ai_credits_used`: `0`
   - `preferences`: `{}`

3. **Table Editor** > `ai_credit_transactions`
4. Dovresti vedere 2 transazioni:
   - 3 crediti "Initial credits"
   - 3 crediti "Welcome bonus"

### 4. Test Creazione Orto

1. Completa wizard se appare
2. Crea un orto
3. Verifica che appaia in dashboard

Su Supabase Dashboard:
- **Table Editor** > `gardens`
- Dovresti vedere l'orto creato

---

## 🔄 SWITCH TRA LOCALE E ONLINE

### Per tornare al database LOCALE:

```bash
cp .env.local.backup .env.local
npm run dev
```

### Per usare database ONLINE:

Usa le credenziali di produzione (vedi sopra)

### OPZIONE MIGLIORE: Due file separati

```bash
# .env.local (locale)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54324/postgres

# .env.production (online)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_online_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_online_service_role_key
```

Poi:
```bash
# Locale
npm run dev

# Online
cp .env.production .env.local && npm run dev
```

---

## ⚠️ PROBLEMI COMUNI

### "Error: relation does not exist"

**Causa**: Migrations non applicate
**Fix**: `supabase db push`

### "Error: permission denied"

**Causa**: Funzioni senza SECURITY DEFINER
**Fix**: Migration 20260102000000 corregge questo
**Verifica**: `supabase migration list` deve mostrare ✓

### "Error: Database error saving new user"

**Causa**: Trigger non creato o funzione fallisce
**Fix**:
1. Vai su Supabase Dashboard > Database > Triggers
2. Verifica `on_auth_user_created` esiste
3. Se manca: riapplica migration con `supabase db push`

### "JWT expired" o "Invalid JWT"

**Causa**: Stai usando anon key del database locale con URL online
**Fix**: Controlla che `.env.local` abbia credenziali corrette (URL e KEY devono corrispondere)

---

## ✅ CHECKLIST DEPLOY COMPLETATO

- [ ] Login Supabase CLI fatto
- [ ] Progetto linkato (`supabase link`)
- [ ] Migrations pushate (`supabase db push`)
- [ ] Tutte le migrations con ✓ (`supabase migration list`)
- [ ] Tabelle verificate su Dashboard
- [ ] Trigger `on_auth_user_created` presente
- [ ] Colonna `preferences` in `profiles`
- [ ] `.env.local` aggiornato con credenziali online
- [ ] App riavviata (`npm run dev`)
- [ ] Test registrazione utente → ✅ Successo
- [ ] Test creazione orto → ✅ Successo
- [ ] Profilo con tier PRO e 6 crediti AI verificato
- [ ] Orto salvato in database online verificato

---

## 📞 PROSSIMI PASSI

Dopo che il deploy è completato:

1. **Test completo app** con database online
2. **Backup database online** (Supabase lo fa automaticamente)
3. **Deploy frontend** su Vercel/Netlify (opzionale)
4. **Configurazione dominio** (opzionale)

---

## 🆘 SUPPORTO

Se hai problemi durante il deploy:

1. Controlla log deployment:
   ```bash
   supabase db push --debug
   ```

2. Verifica connessione database:
   ```bash
   psql "$(supabase db url)"
   ```

3. Log database su Dashboard:
   - Supabase Dashboard > Logs > Database

4. Contatta il supporto Supabase:
   - https://supabase.com/dashboard/support

---

**IMPORTANTE**: I database locale e online sono SEPARATI.
- Dati locali NON vengono migrati automaticamente
- Solo lo SCHEMA viene sincronizzato tramite migrations
- Se vuoi migrare DATI, devi fare export/import separato

---

**Ultimo aggiornamento**: 2026-01-02
**Status**: ✅ PRONTO PER DEPLOY
**Tempo stimato**: 5-10 minuti
