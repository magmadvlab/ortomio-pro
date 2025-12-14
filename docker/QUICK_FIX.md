# Quick Fix - Aggiorna Tag Immagini

## Problema
Tag immagini Docker obsoleti.

## Soluzione Rapida

Aggiorna queste immagini nel `docker-compose.yml`:

```yaml
studio:
  image: supabase/studio:latest  # invece di :20240118-7c8a0b3

storage:
  image: supabase/storage-api:latest  # invece di :v1.7.4
```

Poi:
```bash
cd docker
docker compose pull
docker compose up -d
```

## Alternativa: Usa Supabase CLI

```bash
# Installa
brew install supabase/tap/supabase

# Inizializza
cd /Users/magma/Downloads/ortomio-main
supabase init

# Avvia
supabase start

# Vedi credenziali
supabase status
```

Vedi [SETUP_ALTERNATIVO.md](SETUP_ALTERNATIVO.md) per dettagli.

