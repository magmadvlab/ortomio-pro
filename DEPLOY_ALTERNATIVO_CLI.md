# Deploy Alternativo tramite Supabase CLI

**Problema**: Il SQL Editor di Supabase.com non ha permessi sufficienti per creare trigger su `auth.users`

**Soluzione**: Usa Supabase CLI per fare push delle migrations ufficiali

---

## 🚀 PROCEDURA (5 minuti)

### Step 1: Login Supabase CLI

Apri un **nuovo terminale** (non quello di Claude):

```bash
cd /Users/magma/Downloads/ortomio-main

# Login (si apre browser)
supabase login
```

Fai login con il tuo account Supabase e torna al terminale.

---

### Step 2: Link Progetto

Vai su https://supabase.com/dashboard e ottieni il **Project Reference ID**:
- Apri il tuo progetto
- Settings > General
- Copia **Reference ID** (es: `abcdefghijklmnopqrst`)

Poi esegui:

```bash
# Sostituisci YOUR_PROJECT_REF con il tuo ID
supabase link --project-ref YOUR_PROJECT_REF
```

Ti chiederà la password del database (la trovi su Settings > Database).

---

### Step 3: Push Migrations

Questo comando applica tutte le migrations al database online:

```bash
supabase db push
```

**Cosa succede**:
- ✅ Applica tutte le migrations in `supabase/migrations/`
- ✅ Include la migration `20260102000000_fix_database_schema_pro_mode.sql`
- ✅ Crea trigger, funzioni, permessi
- ✅ Usa credenziali con permessi sufficienti

**Output atteso**:
```
Applying migration 20251230121000_add_notification_preferences.sql...
Applying migration 20251230122000_fix_scalar_production_timeline_security.sql...
Applying migration 20260102000000_fix_database_schema_pro_mode.sql...
✓ All migrations applied successfully!
```

---

### Step 4: Verifica

```bash
# Lista migrations applicate
supabase migration list
```

Dovresti vedere tutte con ✓:
```
✓ 20251230121000_add_notification_preferences.sql
✓ 20251230122000_fix_scalar_production_timeline_security.sql
✓ 20260102000000_fix_database_schema_pro_mode.sql
```

---

## ✅ VERIFICA SU SUPABASE DASHBOARD

Vai su https://supabase.com/dashboard/project/YOUR_PROJECT_REF:

### 1. Table Editor > profiles
- Controlla che esista colonna **`preferences`** (jsonb)

### 2. Database > Triggers
- Controlla trigger: **`on_auth_user_created`** su tabella `auth.users`

### 3. Database > Functions
- **`grant_credits`**
- **`handle_new_user`**
- **`handle_new_user_credits`**

---

## 🔑 AGGIORNA .ENV.LOCAL

Dopo il push, ottieni le credenziali:

### Opzione A: Da Dashboard

1. Settings > API
2. Copia:
   - URL: `https://YOUR_PROJECT_REF.supabase.co`
   - anon public
   - service_role

### Opzione B: Da CLI

```bash
# Ottieni URL
supabase status | grep "API URL"

# Ottieni keys
supabase projects api-keys --project-ref YOUR_PROJECT_REF
```

### Aggiorna .env.local

```bash
# Backup
cp .env.local .env.local.backup

# Modifica
nano .env.local
```

Inserisci:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🧪 TEST

```bash
# Riavvia app
npm run dev
```

Vai su http://localhost:3002:
1. Registra nuovo utente
2. Verifica che funzioni senza errori
3. Controlla su Supabase Dashboard che:
   - ✅ Profilo creato in `profiles`
   - ✅ Tier = PRO
   - ✅ AI credits = 6 (3+3)

---

## ❌ SE NON HAI SUPABASE CLI

Installa con:

```bash
# macOS
brew install supabase/tap/supabase

# Verifica
supabase --version
```

---

## 🎉 VANTAGGI DI QUESTO METODO

✅ Usa migrations ufficiali (già committate in repo)
✅ Permessi sufficienti per creare trigger su auth.users
✅ Tracciabile (supabase migration list)
✅ Ripetibile (puoi fare push su altri progetti)
✅ Sincronizza schema locale → online perfettamente

---

**Tempo stimato**: 5 minuti
**Difficoltà**: Facile
**Raccomandato**: ✅ SÌ
