# Stato Database Supabase - OrtoMio AI

**Data verifica**: $(date)

## Stato Attuale

### Docker
- ✅ Docker Desktop installato e in esecuzione
- ✅ Docker CLI disponibile: `/Applications/Docker.app/Contents/Resources/bin/docker`

### Container Supabase
- ❌ **Container Supabase NON attivi**
- ❌ Supabase Studio non accessibile (porta 3000)
- ❌ Supabase API non accessibile (porta 8000)

### Configurazione
- ✅ `docker-compose.yml` presente e configurato
- ✅ File `.env` presente in `docker/`
- ✅ Schema SQL presente: `database/schema.sql` (440 righe)

## Container Previsti

Secondo `docker-compose.yml`, dovrebbero essere attivi:

1. `ortomio-postgres` - Database PostgreSQL (porta 54322)
2. `ortomio-studio` - Supabase Studio (porta 3000)
3. `ortomio-kong` - API Gateway (porta 8000)
4. `ortomio-rest` - REST API
5. `ortomio-auth` - Autenticazione
6. `ortomio-storage` - File Storage
7. `ortomio-realtime` - WebSocket
8. `ortomio-meta` - Schema Management

## Prossimi Passi

### 1. Avviare Container Supabase

```bash
cd /Users/magma/Downloads/ortomio-main/docker
/Applications/Docker.app/Contents/Resources/bin/docker compose up -d
```

### 2. Verificare Stato Container

```bash
/Applications/Docker.app/Contents/Resources/bin/docker compose ps
```

Dovresti vedere tutti i servizi con status "running" o "healthy".

### 3. Accedere a Supabase Studio

Apri browser: **http://localhost:3000**

### 4. Eseguire Schema Database

1. In Supabase Studio, vai su **SQL Editor**
2. Apri il file `database/schema.sql` dalla root del progetto
3. Copia tutto il contenuto (440 righe)
4. Incolla in SQL Editor
5. Clicca **Run** (o Cmd+Enter)
6. Verifica che non ci siano errori
7. Vai su **Table Editor** per verificare che le tabelle siano create

### 5. Verificare Tabelle Create

Dovresti vedere queste tabelle:
- ✅ `gardens`
- ✅ `garden_tasks`
- ✅ `garden_beds`
- ✅ `bed_planting_history`
- ✅ `harvest_logs`
- ✅ `photo_logs`
- ✅ `seed_inventory`
- ✅ `weather_cache`

## Comandi Utili

### Avvia Container
```bash
cd /Users/magma/Downloads/ortomio-main/docker
/Applications/Docker.app/Contents/Resources/bin/docker compose up -d
```

### Verifica Stato
```bash
/Applications/Docker.app/Contents/Resources/bin/docker compose ps
```

### Vedi Log
```bash
/Applications/Docker.app/Contents/Resources/bin/docker compose logs -f
```

### Ferma Container
```bash
/Applications/Docker.app/Contents/Resources/bin/docker compose down
```

### Ferma e Cancella Dati (ATTENZIONE!)
```bash
/Applications/Docker.app/Contents/Resources/bin/docker compose down -v
```

## Note

- **Prima volta**: Docker scaricherà le immagini (~2GB, 5-10 minuti)
- **Successive volte**: Avvio rapido (~30 secondi)
- **Porte**: Verifica che 3000, 8000, 54322 non siano occupate da altri servizi

## Troubleshooting

### Porte Occupate
Se le porte sono occupate, modifica `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Usa porta 3001 invece di 3000
```

### Container Non Si Avvia
```bash
# Vedi log
/Applications/Docker.app/Contents/Resources/bin/docker compose logs postgres

# Riavvia
/Applications/Docker.app/Contents/Resources/bin/docker compose restart
```

### Database Non Accessibile
```bash
# Verifica connessione
/Applications/Docker.app/Contents/Resources/bin/docker compose exec postgres psql -U postgres -c "SELECT version();"
```








