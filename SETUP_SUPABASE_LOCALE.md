# 🚀 Setup Supabase Locale - Guida Rapida

## Problema Attuale
Ci sono container Docker esistenti che bloccano l'avvio di Supabase.

## Soluzione Rapida

### Step 1: Rimuovi Container Esistenti

**Opzione A: Via Docker Desktop (Consigliato)**
1. Apri **Docker Desktop**
2. Vai su **Containers**
3. Seleziona tutti i container che iniziano con `supabase_`
4. Clicca **Stop** poi **Delete**

**Opzione B: Via Terminale**
```bash
docker ps -a | grep supabase | awk '{print $1}' | xargs docker rm -f
```

### Step 2: Avvia Supabase

```bash
cd /Users/magma/Downloads/ortomio-main
supabase start
```

**Attendi** che tutti i servizi siano "healthy" (può richiedere 1-2 minuti).

### Step 3: Ottieni Credenziali

```bash
supabase status
```

Copia:
- **API URL**: `http://localhost:54321`
- **anon key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Studio URL**: `http://localhost:54326` (porta modificata)

### Step 4: Crea File .env

Crea file `.env` nella root del progetto:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<incolla_qui_l_anon_key_da_supabase_status>
```

### Step 5: Esegui Schema Database

1. Apri Supabase Studio: **http://localhost:54326**
2. Vai su **SQL Editor**
3. Apri file `database/schema.sql`
4. Copia tutto il contenuto
5. Incolla in SQL Editor
6. Clicca **Run** (o Cmd+Enter)

### Step 6: Riavvia App

```bash
npm run dev
```

L'app sarà disponibile su: **http://localhost:3002**

## Porte Configurate

- **API**: 54321
- **Database**: 54324 (modificata da 54322)
- **Studio**: 54326 (modificata da 54323)
- **Inbucket (Email)**: 54325 (modificata da 54324)

## Verifica Setup

1. ✅ Badge "Online" visibile nell'header (invece di "Offline")
2. ✅ Login/Registrazione funzionanti
3. ✅ Crea orto → Verifica in Supabase Studio
4. ✅ Dati sincronizzati nel cloud

## Troubleshooting

### "Port already allocated"
- Rimuovi container esistenti (Step 1)
- Verifica porte: `lsof -i :54321 -i :54324 -i :54326`

### "Cannot connect to Docker daemon"
- Apri Docker Desktop
- Attendi che sia completamente avviato

### "Schema not found"
- Esegui `database/schema.sql` in Supabase Studio (Step 5)








