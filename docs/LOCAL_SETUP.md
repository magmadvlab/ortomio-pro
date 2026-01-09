# Guida Setup Locale e Database Supabase - OrtoMio AI

## Panoramica

Questa guida ti aiuta a:

1. Configurare l'app in locale

1. Collegare un database Supabase (cloud o Docker locale)

1. Testare tutte le funzionalità

## Opzioni Database

**Opzione A: Supabase Cloud** (consigliato per produzione)

- Vai su <https://supabase.com>

- Crea progetto gratuito

- Vedi sezione "Setup Supabase Cloud" sotto

**Opzione B: Supabase Docker Locale** (consigliato per sviluppo)

- Esegui Supabase completamente in locale

- Nessun account necessario

- Vedi [DOCKER_SUPABASE_SETUP.md](DOCKER_SUPABASE_SETUP.md) per guida completa

- Quick Start: `docker/QUICK_START.md`

## PARTE 1: Setup Locale Base

### Step 1: Crea file .env

1. Nella root del progetto, crea un file `.env`:

   ```bash
   cp .env.example .env
   ```text

1. Apri `.env` e aggiungi la tua API key Gemini:

   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```text

1. **Ottieni API Key Gemini:**
   - Vai su <https://aistudio.google.com/apikey>
   - Clicca "Create API Key"
   - Copia la chiave e incollala in `.env`

### Step 2: Test Locale (Senza Database)

1. **Installa dipendenze:**

   ```bash
   npm install
   ```text

1. **Avvia server sviluppo:**

   ```bash
   npm run dev
   ```text

1. **Apri browser:**
   - Vai su <http://localhost:3000>
   - L'app funzionerà in modalità **Free** (localStorage)
   - Le funzionalità AI funzioneranno se hai configurato `VITE_GEMINI_API_KEY`

1. **Verifica funzionalità:**
   - ✅ Dashboard carica
   - ✅ Planner funziona
   - ✅ Suggerimenti AI funzionano (se API key configurata)
   - ✅ Geolocalizzazione funziona

---

## PARTE 2: Setup Database Supabase

### Step 1: Crea Progetto Supabase

1. **Vai su <https://supabase.com**>

1. **Clicca "Start your project"** o "New Project"

1. **Crea account** (se non ce l'hai) - è gratuito

1. **Crea nuovo progetto:**
   - **Name**: `ortomio-ai` (o nome a tua scelta)
   - **Database Password**: Scegli una password forte (salvala!)
   - **Region**: Scegli la più vicina (es. `West EU` per Italia)
   - **Pricing Plan**: Free (sufficiente per iniziare)

1. **Clicca "Create new project"**

1. **Attendi** che il progetto sia pronto (2-3 minuti)

### Step 2: Ottieni Credenziali

1. Nel dashboard Supabase, vai su **Settings** (icona ingranaggio in basso a sinistra)

1. Clicca su **API**

1. Trova la sezione **Project API keys**

1. Copia:
   - **Project URL**: `<https://xxxxx.supabase.co`>
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 3: Configura .env con Supabase

Aggiungi al file `.env`:

```env

# API Key Gemini (già configurata)

VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Supabase (aggiungi queste)

VITE_SUPABASE_URL=<https://xxxxx.supabase.co>
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

```text

**Sostituisci** `xxxxx` e la chiave con i valori reali dal tuo progetto Supabase.

### Step 4: Esegui Schema Database

1. Nel dashboard Supabase, vai su **SQL Editor** (icona database nella sidebar)

1. Clicca **New Query**

1. Apri il file `database/schema.sql` dal progetto locale

1. **Copia tutto il contenuto** del file

1. **Incolla** nel SQL Editor di Supabase

1. Clicca **Run** (o premi Cmd/Ctrl + Enter)

1. Attendi che lo script finisca (dovrebbe dire "Success. No rows returned")

### Step 5: Verifica Tabelle Create

1. Nel dashboard Supabase, vai su **Table Editor** (icona tabella)

1. Dovresti vedere queste tabelle:
   - ✅ `gardens`
   - ✅ `garden_tasks`
   - ✅ `garden_beds`
   - ✅ `harvest_logs`
   - ✅ `seed_inventory`
   - ✅ E altre...

### Step 6: Configura Row Level Security (RLS)

Le tabelle hanno già RLS configurato nello schema, ma verifica:

1. Vai su **Authentication** → **Policies**

1. Per ogni tabella, dovresti vedere policy che permettono:
   - `SELECT` per utente autenticato
   - `INSERT` per utente autenticato
   - `UPDATE` solo per i propri record
   - `DELETE` solo per i propri record

### Step 7: Setup Storage (Opzionale - per foto time-lapse Pro)

1. Vai su **Storage** nel dashboard Supabase

1. Clicca **Create bucket**

1. **Name**: `plant-photos`

1. **Public bucket**: ❌ No (privato)

1. Clicca **Create bucket**

1. Vai su **Policies** del bucket

1. Aggiungi policy per permettere upload/read ai propri file

---

## PARTE 3: Test Connessione Database

### Step 1: Riavvia Server Sviluppo

1. **Ferma** il server (Ctrl+C nel terminale)

1. **Riavvia:**

   ```bash
   npm run dev
   ```text

### Step 2: Verifica Console Browser

1. Apri <http://localhost:3000>

1. Apri **Console Browser** (F12 → Console)

1. Dovresti vedere:
   - ✅ Nessun errore Supabase
   - ✅ Se vedi "Supabase credentials not configured" → verifica `.env`

### Step 3: Test Funzionalità Pro

1. **Crea un orto** nel Dashboard

1. **Aggiungi una pianta** nel Planner

1. **Verifica** che i dati vengano salvati:
   - Apri Supabase Dashboard → Table Editor → `gardens`
   - Dovresti vedere il tuo orto creato
   - Apri `garden_tasks` → dovresti vedere le piante aggiunte

### Step 4: Test Migrazione da localStorage

1. Se hai già dati in localStorage (versione Free):
   - Vai su **Settings** nell'app
   - Cerca opzione **"Migra a Pro"** o **"Upgrade to Pro"**
   - Segui il wizard di migrazione
   - Verifica che i dati appaiano in Supabase

---

## PARTE 4: Verifica Funzionalità Complete

### Checklist Test

- [ ] **Dashboard**: Carica correttamente

- [ ] **Planner**: Aggiungi pianta → salvata in database

- [ ] **Journal**: Task salvati in `garden_tasks`

- [ ] **Harvest Log**: Raccolti salvati in `harvest_logs`

- [ ] **Seed Inventory**: Semi salvati in `seed_inventory`

- [ ] **AI Features**: Suggerimenti funzionano (richiede API key)

- [ ] **Geolocalizzazione**: Funziona (richiede permessi browser)

- [ ] **Database**: Dati visibili in Supabase Dashboard

### Test Database Diretto

1. **Aggiungi un orto** nell'app

1. **Vai su Supabase** → Table Editor → `gardens`

1. **Dovresti vedere** il nuovo orto con:
   - `id` (UUID)
   - `name` (nome che hai dato)
   - `size_sq_meters`
   - `created_at`

---

## Troubleshooting

### Errore: "Supabase credentials not configured"

**Causa**: Le variabili ambiente non sono caricate

**Soluzione**:

1. Verifica che `.env` esista nella root

1. Verifica che le variabili inizino con `VITE_`

1. Riavvia il server: `npm run dev`

1. Verifica che non ci siano spazi extra: `VITE_SUPABASE_URL=<https://...`> (non `VITE_SUPABASE_URL = <https://...`>

### Errore: "Invalid API key" o "Unauthorized"

**Causa**: Credenziali Supabase errate

**Soluzione**:

1. Verifica che `VITE_SUPABASE_URL` sia l'URL completo (con `<https://`>

1. Verifica che `VITE_SUPABASE_ANON_KEY` sia la chiave `anon public` (non `service_role`)

1. Copia di nuovo le credenziali da Supabase Dashboard → Settings → API

### Errore: "relation does not exist"

**Causa**: Schema database non eseguito

**Soluzione**:

1. Vai su Supabase → SQL Editor

1. Esegui di nuovo `database/schema.sql`

1. Verifica che tutte le tabelle siano create (Table Editor)

### Errore: "permission denied" o RLS error

**Causa**: Row Level Security blocca l'accesso

**Soluzione**:

1. Verifica che l'utente sia autenticato (se usi auth)

1. Per test locale, puoi temporaneamente disabilitare RLS:

   ```sql
   ALTER TABLE gardens DISABLE ROW LEVEL SECURITY;
   ```text
   ⚠️ **ATTENZIONE**: Riabilita RLS in produzione!

### Dati non salvati

**Causa**: Storage provider non configurato correttamente

**Soluzione**:

1. Verifica console browser per errori

1. Verifica che `isSupabaseAvailable()` ritorni `true`

1. Controlla che `SupabaseStorageProvider` sia usato (non `LocalStorageProvider`)

---

## Prossimi Passi

Una volta che tutto funziona in locale:

1. **Testa tutte le funzionalità**

1. **Verifica dati in Supabase Dashboard**

1. **Prepara per deploy su Vercel** (vedi [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md))

1. **Configura variabili ambiente su Vercel** (stesse credenziali)

---

## Note Importanti

- **Non committare `.env`**: È già in `.gitignore`

- **Free Tier Supabase**: Include 500MB database, 1GB storage, 2GB bandwidth

- **Limiti Free**: Sufficienti per test e sviluppo

- **Upgrade Pro**: Se hai bisogno di più spazio/bandwidth

---

**Hai bisogno di aiuto?** Controlla i log in:

- Browser Console (F12)

- Supabase Dashboard → Logs

- Terminale dove gira `npm run dev`

