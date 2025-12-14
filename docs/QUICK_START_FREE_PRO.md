# Quick Start - Free vs Pro Setup

## Versione Free (Vercel)

### Prerequisiti

- Account Vercel

- API Key Gemini (opzionale, per funzionalità AI)

### Setup Vercel

1. **Collega Repository GitHub a Vercel**
   - Vai su [vercel.com](<https://vercel.com>
   - Importa il repository `ortomio-main`

1. **Configura Variabili Ambiente**
   - Vai su **Settings → Environment Variables**
   - Aggiungi **SOLO**:

     ```text
     VITE_GEMINI_API_KEY = your_actual_api_key_here
     ```text

   - **⚠️ NON configurare** `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY`
   - L'app userà automaticamente localStorage (versione Free)

1. **Deploy**
   - Vercel farà deploy automatico
   - L'app sarà disponibile su `ortomio-ai.vercel.app`

### Funzionalità Free Disponibili

- ✅ 1 orto

- ✅ 50 task per orto

- ✅ 20 semi

- ✅ 100 log raccolti

- ✅ Planner base

- ✅ Journal base

- ✅ Harvest Log

- ✅ Seed Inventory

- ✅ Lunar Calendar

- ✅ Lifecycle Engine

- ✅ Nutrient Engine

- ✅ Health Engine

- ✅ Funzionalità AI (se API key configurata)

### Limitazioni Free

- ❌ Visual Garden Planner

- ❌ Disease Diagnosis

- ❌ Seedling Manager

- ❌ Annual Planner

- ❌ Specialized Crops

- ❌ Cloud Sync

- ❌ Export Data

---

## Versione Pro (Locale con Docker)

### Prerequisiti

- Docker Desktop installato e avviato

- API Key Gemini

- ~2GB RAM disponibili

### Setup Locale

1. **Avvia Docker Desktop**

   ```bash
   # macOS: Apri Docker Desktop dall'Applications
   # Verifica che sia running: icona Docker nella barra menu
   ```text

1. **Configura Docker Supabase**

   ```bash
   cd docker
   cp .env.example .env
   # Opzionale: modifica POSTGRES_PASSWORD e JWT_SECRET in .env
   ```text

1. **Avvia Supabase**

   ```bash
   # Se hai docker-compose come comando separato:
   docker-compose up -d

   # Oppure con Docker Compose V2:
   docker compose up -d
   ```text

1. **Verifica Servizi**
   - Supabase Studio: <http://localhost:3000>
   - API: <http://localhost:8000>
   - Verifica container: `docker ps`

1. **Esegui Schema Database**
   - Apri <http://localhost:3000>
   - Vai su **SQL Editor**
   - Copia contenuto di `database/schema.sql`
   - Esegui lo script
   - Verifica tabelle in **Table Editor**

1. **Configura App Locale**

   ```bash
   cd .. # torna alla root del progetto
   # Modifica .env (o crea se non esiste)
   ```text

   Aggiungi in `.env`:

   ```env
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   VITE_SUPABASE_URL=<http://localhost:8000>
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
   ```text

   **Nota**: La chiave `ANON_KEY` sopra è quella di default per Supabase locale.

1. **Avvia App**

   ```bash
   npm run dev
   ```text

   L'app sarà disponibile su <http://localhost:5173>

1. **Imposta Tier Pro**
   - Apri l'app nel browser
   - Apri Console Developer (F12)
   - Esegui:

     ```javascript
     localStorage.setItem('ortomio_tier', 'PRO')
     location.reload()
     ```text

### Funzionalità Pro Disponibili

- ✅ Orti illimitati

- ✅ Task illimitati

- ✅ Semi illimitati

- ✅ Log raccolti illimitati

- ✅ **Visual Garden Planner**

- ✅ **Disease Diagnosis** (AI)

- ✅ **Seedling Manager**

- ✅ **Annual Planner**

- ✅ **Specialized Crops** (Strawberries, Fruit Trees, Olives, Vines)

- ✅ **Rotation Engine**

- ✅ **Companion Planting**

- ✅ **Cloud Sync** (Supabase)

- ✅ **Export Data**

---

## Verifica Setup

### Versione Free (Vercel)

- [ ] App carica senza errori

- [ ] Dashboard mostra badge "FREE"

- [ ] Limit indicators visibili (1/1 orti, etc.)

- [ ] Funzionalità base funzionano

- [ ] Upgrade prompts appaiono per feature Pro

### Versione Pro (Locale)

- [ ] Docker Desktop running

- [ ] Container Supabase running (`docker ps`)

- [ ] Supabase Studio accessibile (localhost:3000)

- [ ] Schema database eseguito

- [ ] App si connette a Supabase (console browser)

- [ ] Tier impostato a "PRO"

- [ ] Tutte le funzionalità Pro disponibili

- [ ] Dati salvati in database (verifica in Supabase Studio)

---

## Troubleshooting

### Versione Free

- **Errore build**: Verifica che non ci siano variabili Supabase in `.env`

- **Funzionalità AI non funzionano**: Verifica `VITE_GEMINI_API_KEY` su Vercel

### Versione Pro

- **Docker non si avvia**: Verifica che Docker Desktop sia running

- **Porte occupate**: Cambia porte in `docker-compose.yml`

- **App non si connette**: Verifica URL e ANON_KEY in `.env`

- **Schema non esegue**: Verifica sintassi SQL, controlla errori in Supabase Studio

---

## Prossimi Passi

1. ✅ Test versione Free su Vercel

1. ✅ Test versione Pro in locale

1. ⏳ Valutare opzioni pubblicazione Pro (Supabase Cloud, Vercel + Supabase, etc.)

1. ⏳ Implementare upgrade flow (se necessario)

