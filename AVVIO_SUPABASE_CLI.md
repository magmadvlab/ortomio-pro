# 🚀 Avvio Supabase CLI - Guida Completa

## Stato Attuale

Supabase CLI sta scaricando le immagini Docker (~500MB). Questo richiede **5-10 minuti** alla prima esecuzione.

---

## Verifica Stato

Apri un **nuovo terminale** e esegui:

```bash
cd /Users/magma/Downloads/ortomio-main
supabase status
```

**Quando vedi:**
```
API URL: http://localhost:54321
Studio URL: http://localhost:54323
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ **Supabase è pronto!**

---

## Step 1: Configura .env

Modifica `.env` nella root del progetto:

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<anon_key_da_supabase_status>
```

**Sostituisci** `<anon_key_da_supabase_status>` con la chiave mostrata da `supabase status`.

---

## Step 2: Esegui Schema Database

### Opzione A: Via Supabase Studio (Raccomandato)

1. Apri: **http://localhost:54323**
2. Vai su **SQL Editor** (icona SQL nella sidebar)
3. Clicca **"New query"**
4. Apri file `database/schema.sql` dalla root
5. **Copia tutto il contenuto**
6. **Incolla** in SQL Editor
7. Clicca **"Run"** (o Cmd+Enter)
8. Verifica: Dovresti vedere "Success. No rows returned"

### Opzione B: Via CLI

```bash
cd /Users/magma/Downloads/ortomio-main
cat database/schema.sql | psql postgresql://postgres:postgres@localhost:54322/postgres
```

---

## Step 3: Avvia App

```bash
cd /Users/magma/Downloads/ortomio-main
npm run dev
```

Apri: **http://localhost:3003** (o la porta mostrata)

---

## Step 4: Imposta Tier PRO

1. Apri app nel browser
2. Console Developer (F12)
3. Esegui:
```javascript
localStorage.setItem('ortomio_tier', 'PRO');
location.reload();
```

---

## Step 5: Test Funzionalità

### ✅ Test Base
- Badge "PRO" visibile
- Crea orto → Verifica in Supabase Studio (http://localhost:54323)

### ✅ Test Fragole Basilicata
- Planner → Cerca "CANDONGA" o "MATERA"
- Dovresti vedere le varietà
- Aggiungi → Verifica task creato

### ✅ Test Frutta Esotica
- Planner → Cerca "PAPAYA", "MANGO", "AVOCADO"
- Dovresti vedere le varietà esotiche
- Aggiungi → Verifica task creato

---

## Comandi Utili

```bash
# Verifica stato
supabase status

# Ferma Supabase
supabase stop

# Riavvia Supabase
supabase restart

# Vedi log
supabase logs
```

---

## Troubleshooting

### "API URL not accessible"
- Attendi che `supabase status` mostri tutti i servizi "healthy"
- Verifica: `curl http://localhost:54321/rest/v1/`

### "Schema not found"
- Esegui `database/schema.sql` in Supabase Studio
- Verifica tabelle in Table Editor

### "Container not found"
- Riavvia: `supabase stop && supabase start`

---

**Quando Supabase è pronto, segui gli step sopra!** 🎯








