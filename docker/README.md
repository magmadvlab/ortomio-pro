# Supabase Local con Docker - OrtoMio AI

Questa configurazione Docker ti permette di eseguire Supabase localmente per sviluppo e test.

## Prerequisiti

- **Docker** installato e funzionante
- **Docker Compose** installato
- Almeno **4GB RAM** disponibili

### Verifica Installazione Docker

```bash
docker --version
docker-compose --version
```

Se non sono installati:
- **macOS**: Installa [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux**: `sudo apt-get install docker.io docker-compose`

## Setup Rapido

### Step 1: Configura Variabili Ambiente

1. Vai nella cartella `docker`:
   ```bash
   cd docker
   ```

2. Copia il file `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Modifica `.env` e genera chiavi sicure:
   ```bash
   # Genera JWT Secret (almeno 32 caratteri)
   openssl rand -base64 32
   
   # Genera password database
   openssl rand -base64 24
   ```

4. Aggiungi le chiavi generate al file `.env`

### Step 2: Genera API Keys

Le API keys vengono generate automaticamente da `JWT_SECRET`, ma puoi generarle manualmente:

```bash
# Installa supabase CLI (opzionale ma raccomandato)
npm install -g supabase

# Oppure genera manualmente usando il JWT_SECRET
# Le chiavi anon e service_role vengono generate da JWT_SECRET
```

### Step 3: Avvia Supabase

```bash
docker-compose up -d
```

Questo comando:
- Scarica le immagini Docker necessarie (prima volta: ~2GB)
- Avvia tutti i servizi Supabase
- Crea i volumi per persistenza dati

### Step 4: Attendi che i Servizi siano Pronti

```bash
# Verifica status
docker-compose ps

# Vedi i log
docker-compose logs -f
```

Attendi che tutti i servizi mostrino "healthy" o "running".

### Step 5: Accedi a Supabase Studio

Apri il browser su: **http://localhost:3000**

Dovresti vedere il dashboard Supabase Studio.

## Configurazione Credenziali

### Ottieni Credenziali Locali

1. **URL Supabase**: `http://localhost:8000`
2. **Anon Key**: Controlla nel file `.env` o genera da JWT_SECRET
3. **Service Role Key**: Controlla nel file `.env` o genera da JWT_SECRET

### Genera Keys Manualmente

Se non hai le keys nel `.env`, puoi generarle:

```bash
# Installa supabase CLI
npm install -g supabase

# Oppure usa questo script Node.js
node -e "
const crypto = require('crypto');
const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret';
const anonKey = crypto.createHash('sha256').update('anon-' + jwtSecret).digest('hex');
const serviceKey = crypto.createHash('sha256').update('service-' + jwtSecret).digest('hex');
console.log('ANON_KEY:', anonKey);
console.log('SERVICE_ROLE_KEY:', serviceKey);
"
```

## Esegui Schema Database

1. **Apri Supabase Studio**: http://localhost:3000
2. Vai su **SQL Editor**
3. Apri il file `../database/schema.sql` dal progetto
4. Copia tutto il contenuto
5. Incolla nel SQL Editor
6. Clicca **Run**

## Configura App Locale

Aggiungi al file `.env` nella root del progetto:

```env
# Supabase Local
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=your-anon-key-from-docker-env
```

## Comandi Utili

### Avvia Servizi
```bash
docker-compose up -d
```

### Ferma Servizi
```bash
docker-compose down
```

### Ferma e Rimuovi Dati (⚠️ Cancella tutto!)
```bash
docker-compose down -v
```

### Vedi Log
```bash
docker-compose logs -f
```

### Vedi Log di un Servizio Specifico
```bash
docker-compose logs -f postgres
docker-compose logs -f studio
```

### Riavvia un Servizio
```bash
docker-compose restart postgres
```

### Verifica Status
```bash
docker-compose ps
```

### Accedi a PostgreSQL
```bash
docker-compose exec postgres psql -U postgres
```

## Porte Utilizzate

- **3000**: Supabase Studio (Dashboard)
- **8000**: Kong API Gateway (Supabase API)
- **54322**: PostgreSQL (Database)
- **4000**: Realtime (WebSocket)

## Risoluzione Problemi

### Errore: "Port already in use"

**Soluzione**: Cambia le porte in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Studio su porta diversa
  - "8001:8000"  # API su porta diversa
```

### Errore: "Cannot connect to database"

**Soluzione**:
1. Verifica che PostgreSQL sia avviato: `docker-compose ps`
2. Attendi che sia "healthy": `docker-compose logs postgres`
3. Verifica password in `.env`

### Errore: "JWT_SECRET too short"

**Soluzione**: Assicurati che `JWT_SECRET` in `.env` sia almeno 32 caratteri

### Dati Persistono?

**Sì!** I dati sono salvati nei volumi Docker:
- `postgres-data`: Database
- `storage-data`: File storage

Anche se fermi i container, i dati rimangono. Per cancellare tutto:
```bash
docker-compose down -v
```

## Backup Database

### Esporta Database
```bash
docker-compose exec postgres pg_dump -U postgres postgres > backup.sql
```

### Importa Database
```bash
docker-compose exec -T postgres psql -U postgres postgres < backup.sql
```

## Performance

- **RAM Consumata**: ~2-3GB
- **Disco**: ~5GB (immagini + dati)
- **CPU**: Minimo, solo quando usato

## Prossimi Passi

1. ✅ Supabase locale funzionante
2. ✅ Schema database eseguito
3. ✅ App configurata con credenziali locali
4. ✅ Test funzionalità Pro

Vedi [docs/LOCAL_SETUP.md](../docs/LOCAL_SETUP.md) per configurare l'app.

