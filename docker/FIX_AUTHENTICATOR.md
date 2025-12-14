# 🔧 Fix Problema Authenticator Password

## Problema
Il container `rest` (PostgREST) non riesce a connettersi al database perché la password di `authenticator` non corrisponde.

## Soluzione Rapida

### Opzione 1: Usa Supabase CLI (Raccomandato)

Il modo più semplice è usare la CLI ufficiale Supabase che gestisce tutto automaticamente:

```bash
# Installa Supabase CLI (se non già installato)
brew install supabase/tap/supabase

# Vai nella root del progetto
cd /Users/magma/Downloads/ortomio-main

# Inizializza Supabase (se non già fatto)
supabase init

# Avvia Supabase (gestisce tutto automaticamente)
supabase start

# Ottieni credenziali
supabase status
```

Poi aggiorna `.env` con:
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<anon_key_da_supabase_status>
```

### Opzione 2: Reset Completo Database

Se vuoi continuare con Docker Compose:

```bash
cd /Users/magma/Downloads/ortomio-main/docker

# Ferma tutto
/Applications/Docker.app/Contents/Resources/bin/docker compose down -v

# Rimuovi volume database (⚠️ cancella tutti i dati!)
/Applications/Docker.app/Contents/Resources/bin/docker volume rm docker_postgres-data 2>/dev/null || true

# Riavvia
/Applications/Docker.app/Contents/Resources/bin/docker compose up -d postgres

# Attendi 10 secondi
sleep 10

# Esegui script di inizializzazione Supabase
# (L'immagine Docker Supabase dovrebbe creare automaticamente gli utenti)
/Applications/Docker.app/Contents/Resources/bin/docker compose up -d

# Attendi 30 secondi
sleep 30

# Verifica
curl http://localhost:8000/rest/v1/
```

### Opzione 3: Modifica Password nel Docker Compose

Se l'immagine Docker Supabase usa una password specifica, prova a modificare il docker-compose.yml:

```yaml
rest:
  environment:
    PGRST_DB_URI: postgres://authenticator:postgres@postgres:5432/postgres
    # Prova anche: postgres://authenticator:${POSTGRES_PASSWORD}@postgres:5432/postgres
```

Poi riavvia:
```bash
/Applications/Docker.app/Contents/Resources/bin/docker compose restart rest
```

---

## Verifica Funzionamento

```bash
# Test API
curl http://localhost:8000/rest/v1/

# Dovresti vedere una risposta JSON, non "name resolution failed"
```

---

## Nota Importante

L'immagine Docker `supabase/postgres:15.1.0.147` crea automaticamente gli utenti `authenticator`, `anon`, `service_role` con password specifiche durante l'inizializzazione. Se il database è stato creato in precedenza con configurazioni diverse, potrebbe essere necessario un reset completo.

**Raccomandazione**: Usa Supabase CLI (`supabase start`) per evitare questi problemi.









