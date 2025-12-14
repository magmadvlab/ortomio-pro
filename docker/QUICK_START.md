# Quick Start - Supabase Docker Locale

## Setup in 3 Minuti

### 1. Prepara Configurazione

```bash
cd docker
cp .env.example .env
```

### 2. Genera Chiavi (Opzionale)

```bash
# Genera JWT_SECRET
openssl rand -base64 32

# Aggiungi al file .env:
# JWT_SECRET=il-valore-generato
# POSTGRES_PASSWORD=password-sicura
```

**Oppure** usa i valori di default per sviluppo locale (già configurati).

### 3. Avvia Supabase

```bash
docker-compose up -d
```

**Prima volta**: Attendi download immagini (~5-10 minuti)

### 4. Accedi a Studio

Apri: **http://localhost:3000**

### 5. Ottieni Credenziali

Nel dashboard Studio:
- Vai su **Settings** → **API**
- Copia:
  - **URL**: `http://localhost:8000`
  - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0`

### 6. Configura App

Aggiungi al file `.env` nella root del progetto:

```env
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

### 7. Esegui Schema

1. Studio → SQL Editor
2. Copia contenuto di `database/schema.sql`
3. Incolla e clicca Run

### 8. Testa App

```bash
npm run dev
```

Apri http://localhost:5173 e verifica che funzioni!

---

## Comandi Utili

```bash
# Avvia
docker-compose up -d

# Ferma
docker-compose down

# Log
docker-compose logs -f

# Status
docker-compose ps
```

---

**Problemi?** Vedi [DOCKER_SUPABASE_SETUP.md](../docs/DOCKER_SUPABASE_SETUP.md) per guida completa.

