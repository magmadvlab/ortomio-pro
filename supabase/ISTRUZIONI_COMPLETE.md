# 📋 Istruzioni Complete Setup Supabase Locale

## ✅ Stato Attuale

- ✅ Supabase CLI installato (`supabase --version` funziona)
- ✅ Supabase inizializzato (`supabase init` completato)
- ⏳ Docker Desktop da avviare completamente

## 🚀 Prossimi Passi

### Step 1: Avvia Docker Desktop

1. **Apri Docker Desktop** da Applications
2. **Attendi** che l'icona Docker nella barra menu diventi **verde** (30-60 secondi)
3. **Verifica** che Docker funzioni:
   ```bash
   docker ps
   ```
   Se vedi una lista (anche vuota), Docker è pronto ✅

### Step 2: Avvia Supabase

```bash
cd /Users/magma/Downloads/ortomio-main
export PATH="/opt/homebrew/bin:$PATH"
supabase start
```

**Prima volta**: Scaricherà immagini Docker (~2GB, 5-10 minuti)
**Volte successive**: Avvio rapido (30-60 secondi)

### Step 3: Ottieni Credenziali

```bash
supabase status
```

Copia:
- **API URL**: `http://localhost:54321`
- **anon key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 4: Configura App

Modifica `.env` nella root:

```env
VITE_GEMINI_API_KEY=your_key
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<anon_key_da_supabase_status>
```

### Step 5: Esegui Schema Database

**Opzione A: Via Supabase Studio (Raccomandato)**

1. Apri browser: **http://localhost:54323**
2. Vai su **SQL Editor**
3. Clicca **"New query"**
4. Apri file `database/schema.sql` dalla root
5. Copia tutto il contenuto
6. Incolla in SQL Editor
7. Clicca **"Run"**
8. Verifica tabelle in **Table Editor**

**Opzione B: Via CLI**

```bash
# Esegui schema direttamente
psql postgresql://postgres:postgres@localhost:54322/postgres < database/schema.sql
```

### Step 6: Avvia App

```bash
npm run dev
```

### Step 7: Imposta Tier Pro

1. Apri app: http://localhost:5173
2. Console Developer (F12)
3. Esegui:
   ```javascript
   localStorage.setItem('ortomio_tier', 'PRO')
   location.reload()
   ```

### Step 8: Test Funzionalità Pro

- ✅ Visual Garden Planner
- ✅ Disease Diagnosis
- ✅ Seedling Manager
- ✅ Annual Planner
- ✅ Specialized Crops
- ✅ Verifica salvataggio dati in Supabase Studio

## 🔧 Comandi Utili

```bash
# Avvia Supabase
supabase start

# Ferma Supabase
supabase stop

# Stato Supabase
supabase status

# Reset database (ATTENZIONE: cancella dati)
supabase db reset

# Logs
supabase logs
```

## 📊 Verifica Setup

- [ ] Docker Desktop avviato (icona verde)
- [ ] `docker ps` funziona
- [ ] `supabase start` completato
- [ ] `supabase status` mostra credenziali
- [ ] `.env` configurato
- [ ] Schema database eseguito
- [ ] App avviata (`npm run dev`)
- [ ] Tier Pro impostato
- [ ] Funzionalità Pro testate

## 🆘 Troubleshooting

### Docker non risponde
- Verifica che Docker Desktop sia completamente avviato (icona verde)
- Riavvia Docker Desktop
- Riavvia Mac se necessario

### `supabase start` fallisce
- Verifica spazio disco (serve ~5GB)
- Verifica che `docker ps` funzioni
- Controlla log: `supabase logs`

### Schema non esegue
- Verifica sintassi SQL
- Controlla errori in Supabase Studio → SQL Editor
- Verifica permessi database

## 🎯 Script Rapido

Usa lo script `start-supabase.sh`:

```bash
cd /Users/magma/Downloads/ortomio-main
./supabase/start-supabase.sh
```

Questo script:
- Verifica Docker Desktop
- Avvia Supabase
- Mostra credenziali

