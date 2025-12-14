# Setup Alternativo - Repository Ufficiale Supabase

## Problema

Le immagini Docker nel `docker-compose.yml` hanno tag obsoleti che non sono più disponibili su Docker Hub.

## Soluzione: Usa Repository Ufficiale Supabase

Il modo più semplice e affidabile è usare il repository ufficiale Supabase che ha sempre le immagini aggiornate.

### Opzione 1: Supabase CLI (Raccomandato)

1. **Installa Supabase CLI**
   ```bash
   # macOS
   brew install supabase/tap/supabase
   
   # Oppure con npm
   npm install -g supabase
   ```

2. **Inizializza Supabase nel progetto**
   ```bash
   cd /Users/magma/Downloads/ortomio-main
   supabase init
   ```

3. **Avvia Supabase**
   ```bash
   supabase start
   ```

4. **Ottieni credenziali**
   ```bash
   supabase status
   ```
   
   Questo mostrerà:
   - API URL: `http://localhost:54321`
   - Studio URL: `http://localhost:54323`
   - Anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

5. **Configura `.env`**
   ```env
   VITE_GEMINI_API_KEY=your_key
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_ANON_KEY=<anon_key_da_supabase_status>
   ```

6. **Esegui schema database**
   ```bash
   # Copia contenuto di database/schema.sql
   # Poi esegui:
   supabase db reset
   # Oppure usa Supabase Studio: http://localhost:54323
   ```

### Opzione 2: Clona Repository Ufficiale

1. **Clona repository Supabase**
   ```bash
   cd /tmp
   git clone --depth 1 https://github.com/supabase/supabase
   cd supabase/docker
   ```

2. **Copia file necessari**
   ```bash
   # Copia docker-compose.yml aggiornato
   cp docker-compose.yml /Users/magma/Downloads/ortomio-main/docker/docker-compose.yml.backup
   
   # Oppure usa direttamente il repository clonato
   cd /tmp/supabase/docker
   cp .env.example .env
   # Modifica .env se necessario
   docker compose up -d
   ```

3. **Usa Supabase da `/tmp/supabase/docker`**
   - Studio: http://localhost:3000
   - API: http://localhost:8000

### Opzione 3: Aggiorna Tag Immagini

Se preferisci usare il nostro `docker-compose.yml`, aggiorna i tag:

```yaml
# Studio - usa latest o tag più recente
studio:
  image: supabase/studio:latest

# Storage - usa latest
storage:
  image: supabase/storage-api:latest

# Altri servizi - verifica tag su Docker Hub
```

Poi:
```bash
cd docker
docker compose pull  # Scarica immagini aggiornate
docker compose up -d
```

## Raccomandazione

**Usa Supabase CLI (Opzione 1)** - È il metodo ufficiale e più semplice:
- ✅ Immagini sempre aggiornate
- ✅ Configurazione automatica
- ✅ Comandi semplici (`supabase start`, `supabase stop`)
- ✅ Gestione schema database integrata

## Dopo Setup

1. **Configura app locale** (`.env` nella root)
2. **Esegui schema database** (via Studio o CLI)
3. **Avvia app**: `npm run dev`
4. **Imposta tier Pro**: `localStorage.setItem('ortomio_tier', 'PRO')`

