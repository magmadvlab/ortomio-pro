# Avvio Manuale Supabase Docker

## Problema Credenziali Docker

Se vedi l'errore `docker-credential-desktop: executable file not found`, significa che Docker Desktop non è completamente avviato o configurato.

## Soluzione

### Step 1: Avvia Docker Desktop Manualmente

1. **Apri Docker Desktop**
   - Vai su **Applications** → **Docker**
   - Oppure usa Spotlight (Cmd+Space) e cerca "Docker"
   - Clicca per aprire

2. **Attendi Avvio Completo**
   - Docker Desktop mostrerà una barra di progresso
   - Attendi che l'icona Docker nella barra menu diventi verde
   - Questo può richiedere 30-60 secondi

3. **Verifica Stato**
   - Icona Docker nella barra menu (in alto a destra)
   - Se è verde → Docker è pronto
   - Se è gialla/rossa → ancora in avvio

### Step 2: Avvia Supabase

Una volta che Docker Desktop è completamente avviato (icona verde), apri un terminale e:

```bash
cd /Users/magma/Downloads/ortomio-main/docker
docker compose up -d
```

**Oppure** se `docker` non è nel PATH:

```bash
cd /Users/magma/Downloads/ortomio-main/docker
/Applications/Docker.app/Contents/Resources/bin/docker compose up -d
```

### Step 3: Verifica Container

```bash
docker ps
# Oppure:
/Applications/Docker.app/Contents/Resources/bin/docker ps
```

Dovresti vedere container con nomi:
- `ortomio-postgres`
- `ortomio-studio`
- `ortomio-kong`
- `ortomio-meta`
- `ortomio-storage`
- `ortomio-realtime`
- `ortomio-rest`
- `ortomio-auth`

### Step 4: Accedi a Supabase Studio

Apri browser: **http://localhost:3000**

Dovresti vedere la dashboard Supabase Studio.

### Step 5: Esegui Schema Database

1. In Supabase Studio, vai su **SQL Editor** (icona SQL nella sidebar sinistra)
2. Apri il file `database/schema.sql` dalla root del progetto
3. Copia tutto il contenuto
4. Incolla in SQL Editor
5. Clicca **Run** (o premi Cmd+Enter)
6. Verifica che non ci siano errori
7. Vai su **Table Editor** per verificare che le tabelle siano create

### Step 6: Configura App Locale

Modifica `.env` nella root del progetto:

```env
# API Key Gemini (opzionale, per funzionalità AI)
VITE_GEMINI_API_KEY=your_actual_api_key_here

# Supabase Locale (per versione Pro)
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

### Step 7: Avvia App

```bash
cd /Users/magma/Downloads/ortomio-main
npm run dev
```

### Step 8: Imposta Tier Pro

1. Apri app: http://localhost:5173
2. Apri Console Developer (F12 o Cmd+Option+I)
3. Esegui:
   ```javascript
   localStorage.setItem('ortomio_tier', 'PRO')
   location.reload()
   ```

## Troubleshooting

### Docker Desktop non si avvia
- Verifica che Docker Desktop sia installato correttamente
- Riavvia Docker Desktop: **Docker** → **Quit Docker Desktop**, poi riavvia
- Verifica risorse sistema (RAM, spazio disco)

### Porte occupate
Se le porte 3000, 8000, 54322 sono occupate:
- Cambia porte in `docker-compose.yml`
- Oppure ferma servizi che usano quelle porte

### Container non si avvia
```bash
# Verifica log
docker compose logs

# Riavvia tutto
docker compose down
docker compose up -d
```

### Supabase Studio non accessibile
- Attendi 30-60 secondi dopo `docker compose up -d`
- Verifica che container `ortomio-studio` sia running: `docker ps`
- Controlla log: `docker compose logs studio`

## Comandi Utili

```bash
# Ferma tutti i container
docker compose down

# Ferma e rimuovi volumi (ATTENZIONE: cancella dati)
docker compose down -v

# Vedi log di un servizio
docker compose logs studio
docker compose logs postgres

# Riavvia un servizio
docker compose restart studio

# Stato container
docker compose ps
```

