# 🚀 Soluzione Rapida - Test Versione PRO

## Problema Attuale
L'API Supabase (localhost:8000) non risponde perché il container `rest` non riesce a connettersi al database (errore password `authenticator`).

## ✅ Soluzione: Usa Supabase CLI

Il modo più semplice e affidabile è usare la CLI ufficiale Supabase:

### Step 1: Installa Supabase CLI

```bash
brew install supabase/tap/supabase
```

### Step 2: Avvia Supabase

```bash
cd /Users/magma/Downloads/ortomio-main
supabase start
```

**Prima volta**: Scaricherà immagini (~2GB, 5-10 minuti)
**Volte successive**: Avvio rapido (30-60 secondi)

### Step 3: Ottieni Credenziali

```bash
supabase status
```

Copia:
- **API URL**: `http://localhost:54321`
- **anon key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 4: Configura .env

Modifica `.env` nella root:

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<anon_key_da_supabase_status>
```

### Step 5: Esegui Schema Database

```bash
# Opzione A: Via Supabase Studio
# Apri: http://localhost:54323
# Vai su SQL Editor → Incolla contenuto di database/schema.sql → Run

# Opzione B: Via CLI
supabase db reset
# Poi esegui manualmente database/schema.sql in Studio
```

### Step 6: Avvia App

```bash
npm run dev
```

Apri: **http://localhost:3003** (o la porta mostrata)

### Step 7: Imposta Tier PRO

Console Browser (F12):
```javascript
localStorage.setItem('ortomio_tier', 'PRO');
location.reload();
```

### Step 8: Test

1. ✅ Badge "PRO" visibile
2. ✅ Crea orto → Verifica in Supabase Studio
3. ✅ Fragole Basilicata (Candonga, Matera) disponibili
4. ✅ Frutta esotica (Papaya, Mango) disponibili

---

## Alternativa: Fix Docker Compose

Se preferisci continuare con Docker Compose, vedi `docker/FIX_AUTHENTICATOR.md`

---

**Raccomandazione**: Usa Supabase CLI per evitare problemi di configurazione! 🎯















