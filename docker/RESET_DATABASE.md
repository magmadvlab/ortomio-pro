# 🔄 Reset Database - Fix Authenticator Password

## Problema
L'utente `authenticator` ha una password che non corrisponde a quella configurata in `docker-compose.yml`.

## Soluzione: Reset Completo

### ⚠️ ATTENZIONE: Questo cancellerà tutti i dati del database!

```bash
cd /Users/magma/Downloads/ortomio-main/docker

# 1. Ferma tutti i container
/Applications/Docker.app/Contents/Resources/bin/docker compose down

# 2. Rimuovi il volume del database (cancella tutti i dati!)
/Applications/Docker.app/Contents/Resources/bin/docker volume rm docker_postgres-data

# 3. Riavvia tutto (l'immagine Docker creerà gli utenti con password corrette)
/Applications/Docker.app/Contents/Resources/bin/docker compose up -d

# 4. Attendi 30 secondi per l'inizializzazione
sleep 30

# 5. Verifica che rest sia connesso
/Applications/Docker.app/Contents/Resources/bin/docker compose logs rest --tail 10

# 6. Test API
curl http://localhost:8000/rest/v1/

# 7. Esegui schema database
cat ../database/schema.sql | /Applications/Docker.app/Contents/Resources/bin/docker compose exec -T postgres psql -U postgres
```

---

## Alternativa: Usa Supabase CLI (Raccomandato)

```bash
cd /Users/magma/Downloads/ortomio-main

# Ferma Docker Compose
cd docker && /Applications/Docker.app/Contents/Resources/bin/docker compose down

# Usa Supabase CLI
cd ..
supabase start

# Ottieni credenziali
supabase status
```

Poi aggiorna `.env` con le credenziali da `supabase status`.




















