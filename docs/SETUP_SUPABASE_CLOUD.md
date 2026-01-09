# 🚀 Setup Supabase Cloud (Alternativa a Locale)

## Perché Supabase Cloud?

- ✅ **Nessun problema spazio disco**

- ✅ **Setup in 5 minuti**

- ✅ **Gratuito fino a 500MB** (più che sufficiente per test)

- ✅ **Backup automatico**

- ✅ **Accessibile da qualsiasi dispositivo**

## Step 1: Crea Account Supabase

1. Vai su <https://supabase.com>

1. Clicca **"Start your project"**

1. Accedi con GitHub, Google, o email

1. Clicca **"New Project"**

## Step 2: Crea Progetto

1. **Nome progetto**: `ortomio-ai-dev` (o qualsiasi nome)

1. **Database Password**: Scegli una password forte (salvala!)

1. **Region**: Scegli la più vicina (es. `West Europe`)

1. **Pricing Plan**: **Free** (sufficiente per test)

1. Clicca **"Create new project"**

Attendi 2-3 minuti che il progetto sia creato.

## Step 3: Ottieni Credenziali

1. Nel dashboard Supabase, vai su **Settings** (icona ingranaggio)

1. Clicca su **API**

1. Trova:
   - **Project URL**: `<https://xxxxx.supabase.co`>
   - **anon public** key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Copia entrambi** - ti serviranno per `.env`

## Step 4: Esegui Schema Database

1. Nel dashboard, vai su **SQL Editor** (icona SQL nella sidebar)

1. Clicca **"New query"**

1. Apri file `database/schema.sql` dalla root del progetto

1. **Copia tutto il contenuto** dello schema

1. **Incolla** in SQL Editor

1. Clicca **"Run"** (o premi Cmd+Enter)

1. Verifica che non ci siano errori

1. Vai su **Table Editor** per verificare che le tabelle siano create

## Step 5: Configura App Locale

Modifica `.env` nella root del progetto:

```env

# API Key Gemini (opzionale, per funzionalità AI)

VITE_GEMINI_API_KEY=your_actual_api_key_here

# Supabase Cloud

VITE_SUPABASE_URL=<https://xxxxx.supabase.co>
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

```text

**Sostituisci** `xxxxx` con il tuo Project URL e la chiave anon con quella copiata.

## Step 6: Avvia App

```bash
cd /Users/magma/Downloads/ortomio-main
npm run dev

```text

## Step 7: Imposta Tier Pro

1. Apri app: <http://localhost:5173>

1. Apri Console Developer (F12 o Cmd+Option+I)

1. Esegui:

   ```javascript
   localStorage.setItem('ortomio_tier', 'PRO')
   location.reload()
   ```text

1. Verifica che badge mostri "PRO"

## Step 8: Test Funzionalità Pro

- ✅ Visual Garden Planner

- ✅ Disease Diagnosis

- ✅ Seedling Manager

- ✅ Annual Planner

- ✅ Specialized Crops

- ✅ Verifica che dati si salvino in Supabase (controlla in Table Editor)

## 🔒 Sicurezza

- **anon key**: Sicura per uso client-side (ha limiti RLS)

- **service_role key**: **NON usarla nel client** - solo server-side

- **RLS (Row Level Security)**: Attiva per proteggere dati utente

## 📊 Monitoraggio

Nel dashboard Supabase puoi vedere:

- **Database**: Uso spazio, query, performance

- **API**: Request, bandwidth

- **Storage**: File caricati

- **Logs**: Errori e attività

## 💰 Limiti Free Tier

- **Database**: 500MB

- **Bandwidth**: 5GB/mese

- **Storage**: 1GB

- **API Requests**: 50,000/mese

### Sufficiente per test e sviluppo!

## 🎯 Vantaggi vs Locale

| Feature | Cloud | Locale |
|---------|-------|--------|
| Setup | 5 min | 30+ min |
| Spazio disco | 0 MB | ~2GB |
| Backup | Automatico | Manuale |
| Accesso | Ovunque | Solo locale |
| Aggiornamenti | Automatici | Manuali |

## 🔄 Migrazione a Locale (Futuro)

Quando avrai più spazio disco, puoi sempre:

1. Esporta dati da Cloud

1. Setup locale

1. Importa dati

Ma per ora, **Cloud è la soluzione migliore!**

