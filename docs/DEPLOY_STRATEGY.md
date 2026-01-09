# Strategia Deploy Free/Pro - OrtoMio AI

## Obiettivo

- **Versione Free**: Deploy su Vercel (senza database, solo localStorage)

- **Versione Pro**: Test locale con Supabase Docker, valutazione successiva per pubblicazione

## Strategia

### Versione Free su Vercel

**Caratteristiche:**

- ✅ Funziona senza Supabase
- ✅ Usa localStorage per persistenza dati
- ✅ Limiti: 1 orto, 50 task, 20 semi
- ✅ Funzionalità base disponibili
- ✅ Funzionalità AI (se API key configurata)

**Configurazione Vercel:**

- Variabile ambiente: Solo `VITE_GEMINI_API_KEY`
- **NON** configurare `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY`
- L'app userà automaticamente `LocalStorageProvider`

### Versione Pro Locale

**Caratteristiche:**

- ✅ Supabase Docker locale
- ✅ Tutte le funzionalità Pro disponibili
- ✅ Nessun limite
- ✅ Test completo prima di pubblicazione

### Configurazione Locale:

- Variabili ambiente: `VITE_GEMINI_API_KEY` + `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`

- L'app userà automaticamente `SupabaseStorageProvider`

## Implementazione

### FASE 1: Verifica Sistema Free (Vercel Ready)

1. **Test Build senza Supabase:**

   ```bash
   # Rimuovi temporaneamente variabili Supabase da .env
   # Lascia solo VITE_GEMINI_API_KEY
   npm run build

   ```text

1. **Verifica che funzioni:**
   - Build completa senza errori
   - App usa `LocalStorageProvider`
   - Nessun errore in console

1. **Test Funzionalità Free:**
   - Dashboard carica
   - Planner funziona
   - Journal funziona
   - Harvest Log funziona
   - Seed Inventory funziona (con limiti)
   - Funzionalità AI funzionano

### FASE 2: Setup Pro Locale con Docker

1. **Avvia Supabase Docker:**

   ```bash
   cd docker
   cp .env.example .env
   docker-compose up -d

   ```text

1. **Configura .env locale:**

   ```env
   VITE_GEMINI_API_KEY=your_key
   VITE_SUPABASE_URL=<http://localhost:8000>
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   ```text

1. **Esegui schema database**

1. **Test Funzionalità Pro:**
   - Visual Garden Planner
   - Disease Diagnosis
   - Seedling Manager
   - Annual Planner
   - Specialized Crops
   - Tutte le funzionalità avanzate

### FASE 3: Deploy Free su Vercel

1. **Configura Vercel:**
   - Solo `VITE_GEMINI_API_KEY` in Environment Variables
   - **NON** aggiungere variabili Supabase

1. **Deploy:**
   - Push su GitHub
   - Vercel deploy automatico
   - Verifica che funzioni

1. **Test Produzione:**
   - Verifica versione Free
   - Test limiti
   - Test funzionalità base

## Verifica Comportamento

### Come Funziona Auto-Detection

L'app usa `getDefaultStorageProvider()` che:

1. Controlla se `isSupabaseAvailable()` ritorna `true`

1. Se sì → usa `SupabaseStorageProvider` (Pro)

1. Se no → usa `LocalStorageProvider` (Free)

### Per Vercel (Free):

- `VITE_SUPABASE_URL` non configurata

- `isSupabaseAvailable()` → `false`

- Usa `LocalStorageProvider` ✅

### Per Locale (Pro):

- `VITE_SUPABASE_URL=<http://localhost:8000`> configurata

- `isSupabaseAvailable()` → `true`

- Usa `SupabaseStorageProvider` ✅

## Checklist Pre-Deploy Vercel

- [ ] Build locale funziona senza variabili Supabase

- [ ] App usa localStorage correttamente

- [ ] Nessun errore in console

- [ ] Funzionalità Free testate e funzionanti

- [ ] Variabile `VITE_GEMINI_API_KEY` configurata su Vercel

- [ ] **NON** configurare variabili Supabase su Vercel

## Checklist Test Pro Locale

- [ ] Docker installato e funzionante

- [ ] Supabase Docker avviato e accessibile

- [ ] Schema database eseguito

- [ ] Variabili ambiente configurate in `.env`

- [ ] App si connette a Supabase locale

- [ ] Tutte le funzionalità Pro testate

- [ ] Dati salvati correttamente in database

## Note Importanti

1. **Separazione Netta:**
   - Vercel = Free (localStorage)
   - Locale = Pro (Supabase Docker)

1. **Nessuna Modifica Codice Necessaria:**
   - Il sistema auto-detect funziona automaticamente
   - Basta configurare/non configurare variabili ambiente

1. **Test Pro Prima di Pubblicare:**
   - Testa tutto in locale
   - Valuta opzioni pubblicazione Pro (Supabase Cloud, Vercel + Supabase, etc.)

1. **Upgrade Path:**
   - Utenti Free possono vedere upgrade prompts
   - Quando Pro sarà pronta, si può aggiungere upgrade flow

## Prossimi Passi

1. ✅ Test locale Pro con Docker

1. ✅ Deploy Free su Vercel

1. ⏳ Valutare opzioni pubblicazione Pro

1. ⏳ Implementare upgrade flow (se necessario)

