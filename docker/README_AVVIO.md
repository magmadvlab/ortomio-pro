# 🚀 Avvio Rapido Supabase Docker

## ⚠️ IMPORTANTE: Avvia Docker Desktop Prima!

1. **Apri Docker Desktop** da Applications
2. **Attendi** che l'icona Docker nella barra menu diventi **verde** (30-60 secondi)
3. Poi esegui i comandi qui sotto

## Comandi

```bash
# Vai nella cartella docker
cd docker

# Avvia Supabase
docker compose up -d

# Verifica che i container siano running
docker ps

# Accedi a Supabase Studio
# Apri browser: http://localhost:3000
```

## Se docker non è nel PATH

```bash
cd docker
/Applications/Docker.app/Contents/Resources/bin/docker compose up -d
```

## Prossimi Passi

1. Apri http://localhost:3000 (Supabase Studio)
2. Vai su SQL Editor
3. Esegui lo schema da `../../database/schema.sql`
4. Configura `.env` nella root con credenziali Supabase locali
5. Avvia app: `npm run dev`
6. Imposta tier Pro: `localStorage.setItem('ortomio_tier', 'PRO')`

Vedi [AVVIO_MANUALE.md](AVVIO_MANUALE.md) per dettagli completi.
