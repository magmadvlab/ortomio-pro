# Setup Completo - Free (Vercel) e Pro (Locale)

## ✅ Stato Attuale

### Versione Free (Vercel) - PRONTA

- ✅ Build funzionante senza Supabase

- ✅ Auto-detection storage: usa localStorage se Supabase non disponibile

- ✅ Documentazione aggiornata

- ✅ Variabili ambiente: solo `VITE_GEMINI_API_KEY` necessaria

### Versione Pro (Locale) - DA CONFIGURARE

- ✅ Docker Desktop installato

- ✅ File di configurazione Docker pronti

- ⏳ Supabase Docker da avviare

- ⏳ Schema database da eseguire

- ⏳ App locale da configurare

---

## 🚀 Deploy Versione Free su Vercel

### Step 1: Verifica Build Locale

```bash

# Assicurati che .env NON contenga variabili Supabase
# Solo VITE_GEMINI_API_KEY (opzionale per test locale)

npm run build

```text

### Step 2: Push su GitHub

```bash
git add .
git commit -m "Ready for Free version deploy on Vercel"
git push origin main

```text

### Step 3: Configura Vercel

1. Vai su [vercel.com](<https://vercel.com>

1. Importa repository `ortomio-main`

1. **Environment Variables**:
   - Aggiungi: `VITE_GEMINI_API_KEY` = `your_key`
   - **NON aggiungere** `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY`

1. Deploy automatico

### Step 4: Verifica

- App disponibile su `ortomio-ai.vercel.app`

- Badge "FREE" visibile

- Limit indicators funzionanti

- Funzionalità base disponibili

---

## 🐳 Setup Versione Pro Locale

### Prerequisiti

- Docker Desktop **avviato** (icona Docker nella barra menu macOS)

- ~2GB RAM disponibili

### Step 1: Avvia Docker Desktop

```bash

# macOS: Apri Docker Desktop da Applications
# Oppure:

open -a Docker

```text

Attendi che Docker Desktop sia completamente avviato (icona Docker verde nella barra menu).

### Step 2: Configura Docker Supabase

```bash
cd docker

# Il file .env è già stato creato da .env.example
# Opzionale: modifica POSTGRES_PASSWORD e JWT_SECRET se vuoi

```text

### Step 3: Avvia Supabase

```bash

# Da dentro la cartella docker/
# Docker Compose V2 (raccomandato):

docker compose up -d

# Oppure se hai docker-compose come comando separato:

docker-compose up -d

```text

### Verifica container:

```bash
docker ps

# Dovresti vedere: ortomio-postgres, ortomio-studio, ortomio-kong, etc.

```text

### Step 4: Accedi a Supabase Studio

- Apri browser: <http://localhost:3000>

- Dovresti vedere la dashboard Supabase Studio

### Step 5: Esegui Schema Database

1. In Supabase Studio, vai su **SQL Editor** (icona SQL nella sidebar)

1. Apri file `database/schema.sql` dalla root del progetto

1. Copia tutto il contenuto

1. Incolla in SQL Editor

1. Clicca **Run** (o premi Cmd+Enter)

1. Verifica che non ci siano errori

1. Vai su **Table Editor** per verificare che le tabelle siano create

### Step 6: Ottieni Credenziali Supabase Locale

**URL**: `<http://localhost:8000`>

**ANON_KEY**: Chiave di default per Supabase locale:

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

```text

Oppure verifica in Supabase Studio → **Settings → API** → **Project API keys** → **anon public**

### Step 7: Configura App Locale

```bash
cd .. # torna alla root del progetto

```text

Modifica `.env` (o crea se non esiste):

```env

# API Key Gemini (opzionale, per funzionalità AI)

VITE_GEMINI_API_KEY=your_actual_api_key_here

# Supabase Locale (per versione Pro)

VITE_SUPABASE_URL=<http://localhost:8000>
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

```text

### Step 8: Avvia App Locale

```bash
npm run dev

```text

App disponibile su: <http://localhost:5173>

### Step 9: Imposta Tier Pro

1. Apri app nel browser: <http://localhost:5173>

1. Apri Console Developer (F12 o Cmd+Option+I)

1. Esegui:

   ```javascript
   localStorage.setItem('ortomio_tier', 'PRO')
   location.reload()
   ```text

1. Verifica che badge mostri "PRO" nell'header

### Step 10: Test Funzionalità Pro

- ✅ Visual Garden Planner

- ✅ Disease Diagnosis

- ✅ Seedling Manager

- ✅ Annual Planner

- ✅ Specialized Crops

- ✅ Verifica che dati si salvino in Supabase (controlla in Supabase Studio → Table Editor)

---

## 🔍 Verifica Setup

### Versione Free (Vercel)

- [ ] Build locale funziona senza errori

- [ ] Variabili ambiente configurate su Vercel (solo `VITE_GEMINI_API_KEY`)

- [ ] Deploy completato

- [ ] App accessibile

- [ ] Badge "FREE" visibile

- [ ] Limit indicators funzionanti

- [ ] Funzionalità base testate

### Versione Pro (Locale)

- [ ] Docker Desktop running

- [ ] Container Supabase running (`docker ps`)

- [ ] Supabase Studio accessibile (localhost:3000)

- [ ] Schema database eseguito (verifica tabelle)

- [ ] `.env` configurato con credenziali Supabase

- [ ] App locale avviata (`npm run dev`)

- [ ] Tier impostato a "PRO" (localStorage)

- [ ] App si connette a Supabase (console browser, no errori)

- [ ] Dati salvati in database (verifica in Supabase Studio)

- [ ] Funzionalità Pro testate

---

## 🛠️ Troubleshooting

### Docker

- **"docker: command not found"**: Assicurati che Docker Desktop sia avviato

- **"Port already in use"**: Cambia porte in `docker-compose.yml` o ferma servizi esistenti

- **Container non si avvia**: Verifica log con `docker compose logs`

### Supabase

- **Studio non accessibile**: Verifica che container `ortomio-studio` sia running

- **Schema non esegue**: Controlla errori in SQL Editor, verifica sintassi

- **Connessione fallita**: Verifica URL e ANON_KEY in `.env`

### App

- **Non si connette a Supabase**: Verifica variabili ambiente, riavvia server dev

- **Tier non cambia**: Verifica localStorage, ricarica pagina

- **Build fallisce**: Verifica che non ci siano variabili Supabase in `.env` per build Free

---

## 📚 Documentazione Correlata

- [DEPLOY_STRATEGY.md](DEPLOY_STRATEGY.md) - Strategia Free/Pro

- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - Deploy Vercel dettagliato

- [DOCKER_SUPABASE_SETUP.md](DOCKER_SUPABASE_SETUP.md) - Setup Supabase Docker

- [QUICK_START_FREE_PRO.md](QUICK_START_FREE_PRO.md) - Quick start guide

---

## ✅ Checklist Finale

### Prima di Deploy Free su Vercel

- [x] Build locale funziona

- [x] Documentazione aggiornata

- [ ] Push su GitHub

- [ ] Configura Vercel (solo `VITE_GEMINI_API_KEY`)

- [ ] Deploy e test

### Prima di Test Pro Locale

- [x] Docker Desktop installato

- [x] File configurazione Docker pronti

- [ ] Docker Desktop avviato

- [ ] Supabase Docker avviato

- [ ] Schema database eseguito

- [ ] App locale configurata

- [ ] Tier Pro impostato

- [ ] Funzionalità Pro testate

---

## 🎯 Prossimi Passi

1. ✅ **Deploy Free su Vercel** - App pubblica, versione base

1. ✅ **Test Pro Locale** - Verifica tutte le funzionalità avanzate

1. ⏳ **Valutare Pubblicazione Pro** - Decidere dove pubblicare (Supabase Cloud, Vercel + Supabase, etc.)

1. ⏳ **Implementare Upgrade Flow** - Se necessario, permettere upgrade da Free a Pro

