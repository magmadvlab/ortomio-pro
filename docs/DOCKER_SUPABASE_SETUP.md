# Setup Supabase Locale con Docker - Guida Completa

## Panoramica

Questa guida ti permette di eseguire Supabase completamente in locale usando Docker, senza bisogno di account cloud.

## Vantaggi

- ✅ **Gratuito**: Nessun limite cloud

- ✅ **Veloce**: Nessuna latenza di rete

- ✅ **Privato**: Dati completamente locali

- ✅ **Sviluppo Offline**: Funziona senza internet

- ✅ **Test Sicuri**: Puoi testare senza paura di rompere dati

## Prerequisiti

### 1. Installa Docker

### macOS:

```bash

# Scarica Docker Desktop da:
# <https://www.docker.com/products/docker-desktop>
# Oppure con Homebrew:

brew install --cask docker

```text

### Linux (Ubuntu/Debian):

```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker

```text

### Verifica Installazione:

```bash
docker --version
docker-compose --version

```text

### 2. Verifica Risorse Sistema

- **RAM**: Almeno 4GB disponibili

- **Disco**: Almeno 10GB liberi

- **CPU**: Qualsiasi (non critico)

## Setup Passo-Passo

### Step 1: Prepara Configurazione Docker

1. **Vai nella cartella docker:**

   ```bash
   cd docker
   ```text

1. **Crea file .env:**

   ```bash
   cp .env.example .env
   ```text

1. **Genera chiavi sicure:**

   ```bash
   # Genera JWT Secret (almeno 32 caratteri)
   openssl rand -base64 32

   # Genera password database
   openssl rand -base64 24
   ```text

1. **Modifica .env** con le chiavi generate:

   ```env
   POSTGRES_PASSWORD=la-password-generata
   JWT_SECRET=il-jwt-secret-generato
   JWT_EXP=3600
   ```text

### Step 2: Genera API Keys

Le API keys vengono generate da JWT_SECRET. Puoi usarle direttamente o generarle:

### Opzione A: Usa Supabase CLI (Raccomandato)

```bash
npm install -g supabase
supabase init

```text

### Opzione B: Genera Manualmente
Le keys sono derivate da JWT_SECRET. Per semplicità, usa queste per sviluppo locale:

- `ANON_KEY`: Puoi lasciare vuoto, verrà generata automaticamente

- `SERVICE_ROLE_KEY`: Puoi lasciare vuoto, verrà generata automaticamente

### Step 3: Avvia Supabase

```bash

# Dalla cartella docker/

docker-compose up -d

```text

**Prima volta**: Docker scaricherà le immagini (~2GB, 5-10 minuti)

**Successive volte**: Avvio rapido (~30 secondi)

### Step 4: Verifica che Tutto Funzioni

```bash

# Verifica status

docker-compose ps

# Dovresti vedere tutti i servizi "running" o "healthy"

```text

### Servizi:

- ✅ `postgres` - Database

- ✅ `studio` - Dashboard (porta 3000)

- ✅ `kong` - API Gateway (porta 8000)

- ✅ `rest` - REST API

- ✅ `auth` - Autenticazione

- ✅ `storage` - File Storage

- ✅ `realtime` - WebSocket

- ✅ `meta` - Schema Management

### Step 5: Accedi a Supabase Studio

Apri browser: **<http://localhost:3000**>

Dovresti vedere il dashboard Supabase Studio.

### Step 6: Ottieni Credenziali

1. **Nel dashboard Studio**, vai su **Settings** → **API**

1. Oppure controlla i log:

   ```bash
   docker-compose logs studio | grep -i "anon\|service"
   ```text

1. **Credenziali Locali:**
   - **URL**: `<http://localhost:8000`>
   - **Anon Key**: Controlla in Studio → Settings → API
   - **Service Role Key**: Controlla in Studio → Settings → API

### Step 7: Esegui Schema Database

1. **Apri Supabase Studio**: <http://localhost:3000>

1. Vai su **SQL Editor** (icona database nella sidebar)

1. Clicca **New Query**

1. Apri il file `database/schema.sql` dal progetto

1. **Copia tutto il contenuto**

1. **Incolla** nel SQL Editor

1. Clicca **Run** (o Cmd/Ctrl + Enter)

1. Attendi "Success"

### Step 8: Configura App Locale

1. **Torna alla root del progetto:**

   ```bash
   cd ..
   ```text

1. **Crea/modifica `.env`:**

   ```env
   # API Key Gemini (obbligatorio per AI)
   VITE_GEMINI_API_KEY=your_gemini_api_key_here

   # Supabase Local
   VITE_SUPABASE_URL=<http://localhost:8000>
   VITE_SUPABASE_ANON_KEY=your-anon-key-from-studio
   ```text

1. **Ottieni Anon Key:**
   - Vai su <http://localhost:3000>
   - Settings → API
   - Copia "anon public" key

### Step 9: Testa App

1. **Riavvia server sviluppo:**

   ```bash
   npm run dev
   ```text

1. **Apri browser**: <http://localhost:5173> (o porta mostrata)

1. **Verifica console** (F12):
   - ✅ Nessun errore Supabase
   - ✅ Connessione riuscita

1. **Testa funzionalità:**
   - Crea un orto
   - Aggiungi una pianta
   - Verifica in Supabase Studio → Table Editor che i dati siano salvati

## Comandi Utili

### Gestione Container

```bash

# Avvia

docker-compose up -d

# Ferma

docker-compose down

# Ferma e cancella dati (⚠️ ATTENZIONE!)

docker-compose down -v

# Riavvia

docker-compose restart

# Vedi status

docker-compose ps

# Vedi log

docker-compose logs -f

# Log di un servizio specifico

docker-compose logs -f postgres

```text

### Database

```bash

# Accedi a PostgreSQL

docker-compose exec postgres psql -U postgres

# Backup database

docker-compose exec postgres pg_dump -U postgres postgres > backup.sql

# Restore database

docker-compose exec -T postgres psql -U postgres postgres < backup.sql

```text

### Pulizia

```bash

# Rimuovi container e volumi (cancella tutto!)

docker-compose down -v

# Rimuovi immagini non usate

docker system prune -a

```text

## Risoluzione Problemi

### Porta Già in Uso

**Errore**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Soluzione**: Cambia porte in `docker-compose.yml`:

```yaml
studio:
  ports:
    - "3001:3000"  # Usa porta 3001 invece di 3000

```text

### Container Non Si Avvia

### Verifica:

```bash
docker-compose logs postgres
docker-compose ps

```text

### Possibili cause:

- Porta già in uso

- Password database errata

- JWT_SECRET troppo corto (deve essere almeno 32 caratteri)

### Database Non Accessibile

### Verifica connessione:

```bash
docker-compose exec postgres psql -U postgres -c "SELECT version();"

```text

### Se fallisce:

1. Verifica che container sia running: `docker-compose ps`

1. Controlla log: `docker-compose logs postgres`

1. Riavvia: `docker-compose restart postgres`

### Studio Non Carica

### Verifica:

1. Container running: `docker-compose ps studio`

1. Log: `docker-compose logs studio`

1. Porta corretta: <http://localhost:3000> (o porta configurata)

### App Non Si Connette

### Verifica:

1. Supabase URL corretto: `<http://localhost:8000`> (non 3000!)

1. Anon key corretta (da Studio → Settings → API)

1. Container Kong running: `docker-compose ps kong`

## Performance e Risorse

### Consumo Risorse

- **RAM**: ~2-3GB quando attivo

- **Disco**: ~5GB (immagini + dati)

- **CPU**: Minimo, solo quando usato

### Ottimizzazione

Per ridurre consumo RAM:

```yaml

# In docker-compose.yml, aggiungi limiti

services:
  postgres:
    deploy:
      resources:
        limits:
          memory: 1G

```text

## Backup e Restore

### Backup Completo

```bash

# Backup database

docker-compose exec postgres pg_dump -U postgres postgres > backup-$(date +%Y%m%d).sql

# Backup volumi (dati persistenti)

docker run --rm -v ortomio_postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data

```text

### Restore

```bash

# Restore database

docker-compose exec -T postgres psql -U postgres postgres < backup.sql

# Restore volumi

docker run --rm -v ortomio_postgres-data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /

```text

## Prossimi Passi

1. ✅ Supabase locale funzionante

1. ✅ Schema database eseguito

1. ✅ App configurata

1. ✅ Test funzionalità Pro

1. 🚀 Pronto per sviluppo!

## Note Importanti

- **Dati Persistenti**: I dati sono salvati in volumi Docker, persistono anche dopo `docker-compose down`

- **Cancellare Tutto**: `docker-compose down -v` cancella tutti i dati

- **Produzione**: Questa configurazione è solo per sviluppo. Per produzione usa Supabase Cloud o configurazione dedicata

- **Sicurezza**: Le credenziali in `.env` sono solo per sviluppo locale, non usarle in produzione

---

**Hai bisogno di aiuto?** Controlla:

- Log: `docker-compose logs -f`

- Status: `docker-compose ps`

- Documentazione Supabase: <https://supabase.com/docs/guides/hosting/docker>

