# Guida Deployment OrtoMio AI

## Setup Supabase

1. Crea progetto su [supabase.com](<https://supabase.com>

1. Vai a Settings → API

1. Copia `URL` e `anon key`

1. Aggiungi a `.env`:

   ```text
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```text

## Eseguire Schema Database

1. Vai a SQL Editor in Supabase Dashboard

1. Copia contenuto di `database/schema.sql`

1. Esegui lo script

1. Verifica che tutte le tabelle siano create

## Setup Storage Bucket (Pro Features)

Per foto time-lapse:

1. Vai a Storage in Supabase Dashboard

1. Crea bucket `plant-photos`

1. Imposta policy:
   - Public: No
   - RLS: Yes
   - Policy: Users can upload/read own files

## Build e Deploy

### Development

```bash
npm install
npm run dev

```text

### Production Build

```bash
npm run build

```text

Output in `dist/` directory.

### Deploy su Vercel

> 📖 **Guida Completa**: Vedi [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) per istruzioni dettagliate passo-passo.

### Setup Rapido:

1. Connetti repository GitHub a Vercel

1. Configura variabili ambiente in Vercel Dashboard:
   - `VITE_GEMINI_API_KEY` (obbligatorio)
   - `VITE_SUPABASE_URL` (opzionale, solo Pro)
   - `VITE_SUPABASE_ANON_KEY` (opzionale, solo Pro)

1. Vercel rileva automaticamente:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Framework: Vite

**Nota**: Vercel rileva automaticamente la configurazione Vite. Per setup avanzato, vedi [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md).

## Variabili Ambiente

Tutte le variabili devono iniziare con `VITE_` per essere accessibili in Vite:

- `VITE_GEMINI_API_KEY` - API key Gemini AI

- `VITE_SUPABASE_URL` - URL progetto Supabase

- `VITE_SUPABASE_ANON_KEY` - Anon key Supabase

## Monitoring

### Supabase Dashboard

- Monitora query performance

- Controlla errori RLS

- Verifica storage usage

### Application Logs

- Browser console per errori client

- Supabase logs per errori database

## Backup

### Automatico (Supabase Pro)

Supabase Pro include backup automatici giornalieri.

### Manuale

Usa `scripts/migrateLocalToCloud.ts` per creare backup JSON.

## Troubleshooting

### Build Errors

- Verifica che tutte le dipendenze siano installate

- Controlla che i path degli import siano corretti

- Verifica TypeScript errors

### Runtime Errors

- Controlla console browser

- Verifica configurazione Supabase

- Controlla RLS policies

### Performance Issues

- Abilita caching meteo

- Usa code splitting per componenti Pro

- Ottimizza immagini prima di upload

