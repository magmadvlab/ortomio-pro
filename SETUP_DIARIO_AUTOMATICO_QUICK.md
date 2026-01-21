# 🚀 SETUP RAPIDO - DIARIO AUTOMATICO

## ⚡ 3 STEP PER ATTIVARE IL SISTEMA

### STEP 1: Applicare Migration Database (2 minuti)

**Opzione A - Supabase CLI (Raccomandato):**
```bash
supabase db push
```

**Opzione B - SQL Editor su Supabase Dashboard:**
1. Vai su https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. SQL Editor → New Query
4. Copia e incolla il contenuto di:
   `supabase/migrations/20260119030000_create_daily_diary_system.sql`
5. Run

**Verifica:**
```sql
-- Controlla che le tabelle siano state create
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('daily_diary_entries', 'crop_gdd_accumulations', 'event_correlations');
```

---

### STEP 2: Configurare CRON_SECRET (1 minuto)

**Genera secret sicuro:**
```bash
openssl rand -base64 32
```

**Aggiungi a `.env.local`:**
```bash
# Copia l'output del comando sopra
CRON_SECRET=tuo_secret_generato_qui
```

**Aggiungi su Vercel Dashboard:**
1. Vai su https://vercel.com/dashboard
2. Seleziona il progetto
3. Settings → Environment Variables
4. Add New:
   - **Name:** `CRON_SECRET`
   - **Value:** (stesso valore di `.env.local`)
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development
5. Save

---

### STEP 3: Deploy (1 minuto)

```bash
# Commit e push
git add .
git commit -m "feat: Add automated daily diary system with cron job"
git push origin main
```

**Vercel farà automaticamente:**
- ✅ Build e deploy
- ✅ Attivazione cron job
- ✅ Configurazione schedule (23:00 UTC ogni giorno)

---

## ✅ VERIFICA FUNZIONAMENTO

### Test Locale (Development)

```bash
# Avvia server locale
npm run dev

# In un altro terminale, trigger manuale
curl -X POST http://localhost:3000/api/cron/daily-diary

# Controlla logs nel terminale del server
# Dovresti vedere:
# 🌱 Starting daily diary recording...
# 📊 Processing X gardens...
# ✅ Daily diary recording completed
```

### Verifica su Vercel

**Dashboard Vercel:**
1. Deployments → Cron Jobs
2. Verifica che `/api/cron/daily-diary` sia presente
3. Schedule: `0 23 * * *` (23:00 UTC = 00:00 CET)
4. Status: Active ✅

**Logs:**
1. Deployments → Latest Deployment → Functions
2. Cerca `/api/cron/daily-diary`
3. Controlla logs dopo le 23:00 UTC

### Verifica Database

```sql
-- Controlla entries registrate
SELECT 
  date,
  (weather_data->>'temp_avg')::decimal as temp_avg,
  (weather_data->>'precipitation_mm')::decimal as precip,
  (agronomic_data->>'gdd_base_10')::decimal as gdd
FROM daily_diary_entries
ORDER BY date DESC
LIMIT 10;
```

---

## 🎯 UTILIZZO

### Visualizzazione nell'App

1. Apri l'app
2. Vai su **Diario** (menu laterale)
3. Seleziona tab **"Diario Automatico"** ⚡
4. Scegli periodo: 7 giorni / 30 giorni / 1 anno
5. Esplora entries giornaliere
6. Click su entry per dettagli completi

### Dati Disponibili

**Per ogni giorno:**
- 🌡️ Temperature (min/max/media)
- 🌧️ Precipitazioni
- 💨 Vento
- ☀️ UV Index
- 📊 GDD (Growing Degree Days)
- ❄️ Ore freddo
- 💧 Indice stress idrico
- 🌙 Fase lunare
- ⚡ Eventi automatici (irrigazioni, trattamenti, alert)

---

## 🔧 TROUBLESHOOTING

### Problema: Cron job non si attiva

**Soluzione:**
1. Verifica che `vercel.json` contenga la configurazione cron
2. Redeploy: `vercel --prod`
3. Controlla Vercel Dashboard → Cron Jobs

### Problema: Errore 401 Unauthorized

**Soluzione:**
1. Verifica che `CRON_SECRET` sia configurato su Vercel
2. Controlla che il valore sia identico a `.env.local`
3. Redeploy dopo aver aggiunto la variabile

### Problema: Nessun dato nel database

**Soluzione:**
1. Verifica che la migration sia stata applicata
2. Controlla logs del cron job per errori
3. Trigger manuale per test: `POST /api/cron/daily-diary`

### Problema: Errore "gardens not found"

**Soluzione:**
1. Verifica che ci siano giardini attivi nel database
2. Controlla RLS policies su tabella `gardens`
3. Verifica che i giardini abbiano `active = true`

---

## 📞 SUPPORTO

**Documentazione completa:**
- `DIARIO_AUTOMATICO_INTELLIGENTE_COMPLETE.md`

**File chiave:**
- Service: `services/dailyDiaryService.ts`
- Migration: `supabase/migrations/20260119030000_create_daily_diary_system.sql`
- API: `app/api/cron/daily-diary/route.ts`
- UI: `components/diary/AutomatedDiaryViewer.tsx`

**Test:**
- Locale: `curl -X POST http://localhost:3000/api/cron/daily-diary`
- Vercel: Controlla Deployments → Functions → Logs

---

## ⏱️ TEMPO TOTALE: ~5 MINUTI

1. ✅ Migration database: 2 min
2. ✅ Configurare CRON_SECRET: 1 min
3. ✅ Deploy: 1 min
4. ✅ Verifica: 1 min

**Sistema pronto per registrare automaticamente ogni giorno alle 23:00!** 🎉
