# ✅ CHECKLIST TEST - DIARIO AUTOMATICO

## 🧪 TESTING COMPLETO DEL SISTEMA

---

## 📋 PRE-DEPLOYMENT TESTS

### 1. Database Migration ✅
```bash
# Test locale
supabase db push

# Verifica tabelle create
supabase db diff
```

**Verifica:**
- [ ] Tabella `daily_diary_entries` creata
- [ ] Tabella `crop_gdd_accumulations` creata
- [ ] Tabella `event_correlations` creata
- [ ] Funzione `get_monthly_diary_stats` creata
- [ ] Funzione `compare_years_same_period` creata
- [ ] RLS policies attive su tutte le tabelle
- [ ] Indici creati correttamente

**Query test:**
```sql
-- Verifica struttura tabelle
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('daily_diary_entries', 'crop_gdd_accumulations', 'event_correlations')
ORDER BY table_name, ordinal_position;

-- Verifica RLS policies
SELECT tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('daily_diary_entries', 'crop_gdd_accumulations', 'event_correlations');
```

---

### 2. Environment Variables ✅

**Locale (.env.local):**
- [ ] `CRON_SECRET` configurato
- [ ] Valore generato con `openssl rand -base64 32`
- [ ] Lunghezza minima 32 caratteri

**Verifica:**
```bash
# Controlla che sia presente
grep CRON_SECRET .env.local

# Verifica lunghezza (dovrebbe essere ~44 caratteri base64)
grep CRON_SECRET .env.local | wc -c
```

**Vercel Dashboard:**
- [ ] `CRON_SECRET` aggiunto
- [ ] Valore identico a `.env.local`
- [ ] Applicato a: Production ✅
- [ ] Applicato a: Preview ✅
- [ ] Applicato a: Development ✅

---

### 3. Vercel Cron Configuration ✅

**File vercel.json:**
- [ ] Sezione `crons` presente
- [ ] Path: `/api/cron/daily-diary`
- [ ] Schedule: `0 23 * * *`

**Verifica:**
```bash
# Controlla configurazione
cat vercel.json | grep -A 5 "crons"
```

**Output atteso:**
```json
"crons": [
  {
    "path": "/api/cron/daily-diary",
    "schedule": "0 23 * * *"
  }
]
```

---

## 🧪 LOCAL TESTING

### 1. Service Layer Test

**Test dailyDiaryService:**
```typescript
// In browser console o test file
import { dailyDiaryService } from '@/services/dailyDiaryService'

// Test calcolo fase lunare
const lunarPhase = dailyDiaryService['calculateLunarPhase'](new Date())
console.log('Lunar Phase:', lunarPhase)

// Test calcolo metriche agronomiche
const weatherData = {
  temp_min: 5,
  temp_max: 15,
  temp_avg: 10,
  precipitation_mm: 2,
  humidity_avg: 70,
  wind_speed_avg: 10,
  uv_index_max: 3,
  conditions: 'clear'
}
const agronomicData = dailyDiaryService['calculateAgronomicMetrics'](weatherData)
console.log('Agronomic Data:', agronomicData)
```

**Verifica output:**
- [ ] Fase lunare calcolata correttamente
- [ ] GDD base 10 = 0 (temp_avg = 10)
- [ ] GDD base 5 = 5 (temp_avg - 5)
- [ ] Ore freddo = 0 (temp_avg > 7)
- [ ] Stress idrico calcolato (0-100)
- [ ] Fotoperiodo calcolato (8-16 ore)

---

### 2. API Endpoint Test

**Test manuale (development only):**
```bash
# Avvia server locale
npm run dev

# In altro terminale, trigger manuale
curl -X POST http://localhost:3000/api/cron/daily-diary

# Oppure con verbose output
curl -X POST http://localhost:3000/api/cron/daily-diary -v
```

**Verifica logs server:**
```
🌱 Starting daily diary recording...
📊 Processing X gardens...
📝 Recording entry for garden: [nome]
✅ Entry recorded for garden: [nome]
✅ Daily diary recording completed
```

**Verifica response:**
```json
{
  "success": true,
  "message": "Daily diary manually triggered",
  "timestamp": "2026-01-20T..."
}
```

**Checklist:**
- [ ] Status 200 OK
- [ ] Response JSON valido
- [ ] Logs mostrano processing
- [ ] Nessun errore nel terminale

---

### 3. Database Data Test

**Verifica entries create:**
```sql
-- Controlla entries registrate
SELECT 
  id,
  garden_id,
  date,
  weather_data->>'temp_avg' as temp,
  weather_data->>'precipitation_mm' as precip,
  agronomic_data->>'gdd_base_10' as gdd,
  lunar_phase->>'phase' as moon_phase
FROM daily_diary_entries
ORDER BY date DESC
LIMIT 5;
```

**Checklist:**
- [ ] Entry creata per ogni giardino attivo
- [ ] Data corretta (oggi)
- [ ] weather_data popolato
- [ ] agronomic_data popolato
- [ ] lunar_phase popolato
- [ ] automated_events popolato

**Verifica accumuli GDD:**
```sql
-- Controlla accumuli per colture attive
SELECT 
  plant_name,
  total_gdd_base_10,
  total_gdd_base_5,
  days_since_planting,
  start_date
FROM crop_gdd_accumulations
ORDER BY start_date DESC;
```

**Checklist:**
- [ ] Record creato per ogni task attivo
- [ ] GDD incrementati correttamente
- [ ] Giorni dalla semina corretti

---

### 4. UI Component Test

**Test AutomatedDiaryViewer:**

**Navigazione:**
1. [ ] Apri app locale
2. [ ] Click su "Diario" nel menu
3. [ ] Verifica presenza tab "⚡ Diario Automatico"
4. [ ] Click sulla tab

**Visualizzazione:**
- [ ] Statistiche aggregate visibili
- [ ] Selettore periodo funzionante (7/30/365 giorni)
- [ ] Card entries visualizzate
- [ ] Icone meteo corrette
- [ ] Icone fasi lunari corrette
- [ ] Colori stress idrico corretti

**Interazioni:**
- [ ] Click su card apre modal
- [ ] Modal mostra dati completi
- [ ] Button "Chiudi" funziona
- [ ] Cambio periodo ricarica dati
- [ ] Selector giardino funziona (se multipli)

**Empty state:**
- [ ] Messaggio chiaro se nessun dato
- [ ] Icona e testo centrati

---

## 🚀 POST-DEPLOYMENT TESTS

### 1. Vercel Deployment ✅

**Dashboard Vercel:**
1. [ ] Deploy completato con successo
2. [ ] Build log senza errori
3. [ ] Cron Jobs → `/api/cron/daily-diary` presente
4. [ ] Schedule: `0 23 * * *`
5. [ ] Status: Active ✅

**Verifica URL:**
```bash
# Test endpoint (dovrebbe dare 401 senza auth)
curl https://your-app.vercel.app/api/cron/daily-diary

# Con auth (usa CRON_SECRET da .env.local)
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://your-app.vercel.app/api/cron/daily-diary
```

**Response attesa (senza auth):**
```json
{
  "error": "Unauthorized"
}
```

**Response attesa (con auth):**
```json
{
  "success": true,
  "message": "Daily diary entries recorded successfully",
  "duration_ms": 1234,
  "timestamp": "2026-01-20T..."
}
```

---

### 2. Cron Job Execution Test

**Attendi prima esecuzione (23:00 UTC):**

**Verifica logs Vercel:**
1. [ ] Vai su Deployments → Latest
2. [ ] Functions → `/api/cron/daily-diary`
3. [ ] Controlla logs dopo le 23:00 UTC

**Logs attesi:**
```
🌱 Starting daily diary recording...
📊 Processing X gardens...
📝 Recording entry for garden: [nome]
✅ Entry recorded for garden: [nome]
✅ Daily diary recording completed
```

**Verifica database production:**
```sql
-- Controlla entries di oggi
SELECT COUNT(*) as entries_today
FROM daily_diary_entries
WHERE date = CURRENT_DATE;

-- Dovrebbe essere >= numero giardini attivi
```

---

### 3. Production UI Test

**Test su app production:**

1. [ ] Login con account test
2. [ ] Naviga a Diario → Diario Automatico
3. [ ] Verifica dati visualizzati
4. [ ] Test selettore periodo
5. [ ] Test modal dettaglio
6. [ ] Test su mobile (responsive)

**Mobile test:**
- [ ] Layout responsive corretto
- [ ] Statistiche 2 colonne
- [ ] Card leggibili
- [ ] Modal full screen
- [ ] Touch interactions funzionanti

---

## 🔍 INTEGRATION TESTS

### 1. Weather Service Integration

**Test recupero meteo:**
```typescript
// Test weatherService
import { weatherService } from '@/services/weatherService'

const weather = await weatherService.getWeatherData(45.4642, 9.1900) // Milano
console.log('Weather:', weather)
```

**Verifica:**
- [ ] Dati meteo recuperati
- [ ] Temperature presenti
- [ ] Precipitazioni presenti
- [ ] Nessun errore API

---

### 2. Database Integration

**Test RLS policies:**
```sql
-- Come utente autenticato
SET ROLE authenticated;
SET request.jwt.claims.sub = 'user-uuid-here';

-- Dovrebbe vedere solo i propri giardini
SELECT * FROM daily_diary_entries;

-- Dovrebbe poter inserire
INSERT INTO daily_diary_entries (garden_id, date, weather_data, agronomic_data, lunar_phase)
VALUES ('garden-uuid', CURRENT_DATE, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb);
```

**Verifica:**
- [ ] RLS policies funzionanti
- [ ] Utente vede solo propri dati
- [ ] Utente può inserire/aggiornare
- [ ] Utente non può vedere dati altri

---

### 3. Cron → Service → Database Flow

**Test completo end-to-end:**

1. **Trigger cron** (manuale o automatico)
2. **Verifica service execution:**
   - [ ] Recupero giardini attivi
   - [ ] Recupero dati meteo per ogni giardino
   - [ ] Calcolo metriche agronomiche
   - [ ] Calcolo fase lunare
   - [ ] Recupero eventi automatici
3. **Verifica database writes:**
   - [ ] Entry creata in `daily_diary_entries`
   - [ ] Accumuli aggiornati in `crop_gdd_accumulations`
   - [ ] Correlazioni create in `event_correlations` (se eventi)
4. **Verifica UI update:**
   - [ ] Nuovi dati visibili in AutomatedDiaryViewer
   - [ ] Statistiche aggiornate
   - [ ] Card nuova entry presente

---

## 🐛 ERROR HANDLING TESTS

### 1. Missing Environment Variable

**Test:**
```bash
# Rimuovi temporaneamente CRON_SECRET
unset CRON_SECRET

# Trigger endpoint
curl -X POST http://localhost:3000/api/cron/daily-diary
```

**Verifica:**
- [ ] Status 401 Unauthorized
- [ ] Messaggio errore chiaro
- [ ] Nessun crash server

---

### 2. Database Connection Error

**Test:**
```bash
# Usa URL Supabase invalido
NEXT_PUBLIC_SUPABASE_URL=https://invalid.supabase.co

# Trigger endpoint
curl -X POST http://localhost:3000/api/cron/daily-diary
```

**Verifica:**
- [ ] Status 500 Internal Server Error
- [ ] Errore loggato
- [ ] Nessun crash server
- [ ] Response JSON valido

---

### 3. Weather API Error

**Test:** Simula errore weatherService

**Verifica:**
- [ ] Fallback a dati default
- [ ] Entry creata comunque (con dati 0)
- [ ] Errore loggato ma non bloccante
- [ ] Processo continua per altri giardini

---

### 4. No Active Gardens

**Test:**
```sql
-- Disattiva tutti i giardini
UPDATE gardens SET active = false;
```

**Trigger cron:**
```bash
curl -X POST http://localhost:3000/api/cron/daily-diary
```

**Verifica:**
- [ ] Status 200 OK
- [ ] Messaggio "No active gardens found"
- [ ] Nessun errore
- [ ] Nessuna entry creata

---

## 📊 PERFORMANCE TESTS

### 1. Multiple Gardens

**Test con 10+ giardini:**
```bash
# Crea 10 giardini test
# Trigger cron
time curl -X POST http://localhost:3000/api/cron/daily-diary
```

**Verifica:**
- [ ] Completato entro 5 minuti (maxDuration)
- [ ] Tutti i giardini processati
- [ ] Nessun timeout
- [ ] Memory usage accettabile

---

### 2. Large Date Range Query

**Test query pesante:**
```typescript
// Query 1 anno di dati
const entries = await dailyDiaryService.getDiaryEntries(
  gardenId,
  '2025-01-01',
  '2025-12-31'
)
```

**Verifica:**
- [ ] Query completata < 2 secondi
- [ ] Dati corretti
- [ ] Nessun timeout
- [ ] UI responsive

---

## ✅ FINAL CHECKLIST

### Pre-Deployment
- [ ] Migration database applicata
- [ ] CRON_SECRET configurato (locale)
- [ ] CRON_SECRET configurato (Vercel)
- [ ] vercel.json con cron config
- [ ] Tutti i test locali passati

### Post-Deployment
- [ ] Deploy Vercel completato
- [ ] Cron job attivo
- [ ] Prima esecuzione automatica completata
- [ ] Dati visibili in UI production
- [ ] Test mobile completati
- [ ] Performance accettabile

### Documentation
- [ ] README aggiornato
- [ ] Documentazione completa creata
- [ ] Guida setup rapido creata
- [ ] Guida visuale creata
- [ ] Test checklist completata

---

## 🎉 SUCCESS CRITERIA

**Sistema considerato funzionante se:**

✅ Cron job esegue automaticamente ogni giorno alle 23:00 UTC  
✅ Entries create per tutti i giardini attivi  
✅ Dati meteo recuperati correttamente  
✅ Calcoli agronomici accurati  
✅ Accumuli GDD aggiornati per colture attive  
✅ UI visualizza dati correttamente  
✅ Nessun errore in production logs  
✅ Performance accettabile (< 5 min execution)  
✅ RLS policies funzionanti  
✅ Mobile responsive  

---

## 📞 TROUBLESHOOTING

### Problema: Cron non esegue
**Soluzione:**
1. Verifica Vercel Dashboard → Cron Jobs
2. Controlla CRON_SECRET configurato
3. Redeploy: `vercel --prod`

### Problema: Nessun dato in database
**Soluzione:**
1. Controlla logs cron per errori
2. Verifica giardini attivi: `SELECT * FROM gardens WHERE active = true`
3. Test manuale: `POST /api/cron/daily-diary`

### Problema: UI non mostra dati
**Soluzione:**
1. Verifica entries in database
2. Controlla RLS policies
3. Verifica garden_id corretto
4. Clear cache browser

---

**Checklist creata da:** Kiro AI Assistant  
**Data:** 20 Gennaio 2026  
**Versione:** 1.0.0
