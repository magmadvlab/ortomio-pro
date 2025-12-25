# FASE 1: Quick Start Guide 🚀

Guida rapida per testare e deployare la FASE 1 di OrtoMio.

---

## ✅ Stato Implementazione

**FASE 1 COMPLETATA AL 100%**

- ✅ Tutti i 5 Sprint implementati
- ✅ Database schema pronto
- ✅ Storage providers funzionanti
- ✅ Cron job configurata
- ✅ Documentazione completa

**Pronto per**: Testing → Staging → Production

---

## 🧪 Testing Locale

### 1. Setup Ambiente

Assicurati di avere le variabili d'ambiente configurate:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CRON_SECRET=your_cron_secret
```

### 2. Crea Database Locale

```bash
# Opzione A: Supabase locale (se usi Docker)
npx supabase start
npx supabase db reset

# Opzione B: Supabase cloud (staging)
psql $SUPABASE_STAGING_URL < database/migrations/add_health_alerts.sql
```

### 3. Verifica Tabella Creata

```sql
-- Connettiti al DB e verifica
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'health_alerts';

-- Verifica RLS attivo
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'health_alerts';
-- Dovrebbe mostrare: rowsecurity = true
```

### 4. Avvia App

```bash
npm install
npm run dev
```

Apri [http://localhost:3002](http://localhost:3002)

### 5. Test Manuale UX

Segui il piano dettagliato: [FASE1_TEST_PLAN.md](./FASE1_TEST_PLAN.md)

**Test prioritari**:

1. **Navigazione** (Sprint 1)
   - Verifica menu sidebar ha 5 voci principali
   - Verifica menu PRO ha sezioni collapsabili

2. **Raccolto** (Sprint 2)
   - Crea task "Semina Pomodoro" con 60 giorni maturità
   - Aspetta maturità (o manipola `created_at` task)
   - Completa task generico → Verifica modal harvest appare

3. **Salute** (Sprint 4)
   - Vai su `/app/advice`
   - Se nessun alert, testa cron job (vedi sotto)

4. **Onboarding** (Sprint 5)
   - Logout e crea nuovo account
   - Verifica banner benvenuto appare
   - Testa "Salta per ora" e "Configura orto"

### 6. Test Cron Job (Health Alerts)

**Metodo 1: Script di test**

```bash
npm run test:health-check
```

Questo script:
- Carica tutti i giardini
- Genera alert per ogni giardino
- Inserisce nel database
- Mostra log dettagliati

**Metodo 2: API diretta (dev mode)**

```bash
# POST è permesso solo in development
curl -X POST http://localhost:3002/api/cron/health-check
```

**Metodo 3: Simula condizioni**

Per forzare generazione alert:

```sql
-- Crea task irrigazione in ritardo
INSERT INTO garden_tasks (
  garden_id,
  plant_name,
  task_type,
  date,
  completed
) VALUES (
  'your_garden_id',
  'Pomodoro',
  'Watering',
  NOW() - INTERVAL '5 days',  -- 5 giorni fa
  false
);
```

Poi esegui `npm run test:health-check` e verifica alert "Irrigazione in ritardo".

### 7. Verifica Alert Generati

```sql
-- Vedi tutti gli alert
SELECT * FROM health_alerts ORDER BY created_at DESC;

-- Alert per garden specifico
SELECT
  title,
  severity,
  alert_type,
  message,
  created_at
FROM health_alerts
WHERE garden_id = 'your_garden_id'
  AND resolved = false
ORDER BY
  CASE severity
    WHEN 'critical' THEN 1
    WHEN 'warning' THEN 2
    WHEN 'info' THEN 3
  END,
  created_at DESC;
```

---

## 🚀 Deploy Staging

### 1. Push Codice

```bash
git checkout -b staging
git add .
git commit -m "feat: FASE 1 complete - Health alerts system"
git push origin staging
```

### 2. Deploy Database Migration

```bash
# Connettiti a Supabase staging
psql $SUPABASE_STAGING_URL < database/migrations/add_health_alerts.sql

# Verifica
psql $SUPABASE_STAGING_URL -c "SELECT COUNT(*) FROM health_alerts;"
```

### 3. Deploy Vercel Staging

Se hai Vercel configurato per auto-deploy da branch `staging`:

```bash
# Push attiva auto-deploy
git push origin staging
```

Oppure manualmente:

```bash
vercel --prod --scope your-team
```

### 4. Configura Environment Variables

In Vercel dashboard (staging):

- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **Aggiungi questo**
- `CRON_SECRET` ⚠️ **Aggiungi questo** (genera random: `openssl rand -base64 32`)

### 5. Verifica Cron Job Attiva

Vercel Dashboard → Project → Settings → Cron Jobs

Dovresti vedere:
```
/api/cron/health-check
Schedule: 0 8,20 * * *  (8:00 e 20:00 ogni giorno)
Status: Active ✅
```

### 6. Test Staging

```bash
# Test cron manualmente (usa CRON_SECRET)
curl -X GET https://your-staging-url.vercel.app/api/cron/health-check \
  -H "Authorization: Bearer your_cron_secret"
```

Verifica risposta:
```json
{
  "success": true,
  "gardensChecked": 5,
  "alertsCreated": 3,
  "alertsSkipped": 2,
  "errors": [],
  "duration": 1234
}
```

---

## 🌐 Deploy Production

**⚠️ IMPORTANTE**: Esegui SOLO dopo verifica staging completa!

### Pre-Flight Checklist

- [ ] ✅ Tutti i test staging passati
- [ ] ✅ Cron job staging funziona (almeno 2 esecuzioni)
- [ ] ✅ Alert visualizzati correttamente in UI
- [ ] ✅ Nessun errore in Vercel logs
- [ ] ✅ Backup database produzione creato

### 1. Backup Database Production

```bash
# Crea backup completo
pg_dump $SUPABASE_PROD_URL > backup_pre_fase1_$(date +%Y%m%d_%H%M%S).sql

# Verifica backup
ls -lh backup_pre_fase1_*.sql
```

### 2. Merge a Main

```bash
git checkout main
git merge staging
git push origin main
```

### 3. Apply Migration Production

```bash
# ⚠️ ATTENZIONE: Esegui in orari di basso traffico
psql $SUPABASE_PROD_URL < database/migrations/add_health_alerts.sql

# Verifica
psql $SUPABASE_PROD_URL -c "\d health_alerts"
```

### 4. Deploy Vercel Production

```bash
# Auto-deploy da main (se configurato)
git push origin main

# Oppure manualmente
vercel --prod
```

### 5. Verifica Cron Job Production

Attendi prima esecuzione (8:00 o 20:00) e monitora logs:

```bash
# Vercel CLI
vercel logs --follow

# Oppure Vercel Dashboard → Logs
```

Cerca:
```
[Health Check] Checking X gardens...
[Health Check] Completed in XXXms
```

### 6. Smoke Test Production

1. Apri `/app/advice` → Verifica sezione "Alert Automatici"
2. Completa task su pianta matura → Verifica harvest modal
3. Crea nuovo account → Verifica onboarding banner
4. Naviga menu sidebar → Verifica struttura gerarchica

---

## 🐛 Troubleshooting

### Problema: "Table health_alerts does not exist"

**Causa**: Migration non applicata

**Fix**:
```bash
psql $DATABASE_URL < database/migrations/add_health_alerts.sql
```

### Problema: "permission denied for table health_alerts"

**Causa**: RLS policy non attiva o user non autenticato

**Fix**:
```sql
-- Verifica RLS
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'health_alerts';

-- Se rowsecurity = false
ALTER TABLE health_alerts ENABLE ROW LEVEL SECURITY;

-- Ricrea policies
\i database/migrations/add_health_alerts.sql
```

### Problema: Cron job non esegue

**Causa**: CRON_SECRET mancante o errato

**Fix**:
1. Vercel Dashboard → Settings → Environment Variables
2. Aggiungi `CRON_SECRET`
3. Redeploy

### Problema: Weather API fallisce

**Causa**: Rate limit o coordinate invalide

**Fix**:
- Alert engine continua senza weather (graceful degradation)
- Check logs per errore specifico
- Verifica `garden.coordinates` formato corretto: `{ latitude: X, longitude: Y }`

### Problema: Alert duplicati

**Causa**: Deduplication logic fallita

**Fix temporaneo**:
```sql
-- Rimuovi duplicati manualmente
DELETE FROM health_alerts a
USING health_alerts b
WHERE a.id > b.id
  AND a.garden_id = b.garden_id
  AND a.title = b.title
  AND a.alert_type = b.alert_type
  AND a.resolved = false
  AND b.resolved = false;
```

**Fix permanente**: Vedi issue tracker

---

## 📊 Monitoraggio Post-Deploy

### Metriche da Tracciare (Prima Settimana)

```sql
-- Alert generati per giorno
SELECT
  DATE(created_at) as date,
  COUNT(*) as alerts_created,
  COUNT(DISTINCT garden_id) as gardens_affected
FROM health_alerts
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Alert per severity
SELECT
  severity,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM health_alerts
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY severity;

-- Alert resolution rate
SELECT
  COUNT(*) FILTER (WHERE resolved = true) as resolved,
  COUNT(*) FILTER (WHERE resolved = false) as pending,
  ROUND(
    COUNT(*) FILTER (WHERE resolved = true) * 100.0 / COUNT(*),
    2
  ) as resolution_rate_percent
FROM health_alerts
WHERE created_at > NOW() - INTERVAL '7 days';

-- Tempo medio risoluzione
SELECT
  AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) as avg_hours_to_resolve
FROM health_alerts
WHERE resolved = true
  AND created_at > NOW() - INTERVAL '7 days';
```

### Vercel Logs Monitoring

Cerca questi pattern:

✅ **Success**:
```
[Health Check] Completed in 1234ms: { gardensChecked: 5, alertsCreated: 3 }
```

⚠️ **Warning**:
```
Weather fetch failed for garden X
Skipping duplicate alert: ...
```

❌ **Error**:
```
Garden X failed: ...
Alert insert failed: ...
Fatal error: ...
```

### Alert Notifications (Opzionale)

Setup Vercel → Integrations → Monitoring (Sentry/Datadog):

- Alert su error rate > 5%
- Alert su duration > 10s
- Alert su cron failure

---

## 📚 Documentazione Completa

- **Implementazione**: [FASE1_IMPLEMENTAZIONE_COMPLETA.md](./FASE1_IMPLEMENTAZIONE_COMPLETA.md)
- **Test Plan**: [FASE1_TEST_PLAN.md](./FASE1_TEST_PLAN.md)
- **Database**: [../database/MODIFICHE_DATABASE_FASE1.md](../database/MODIFICHE_DATABASE_FASE1.md)
- **Riepilogo**: [FASE1_RIEPILOGO_COMPLETO.md](./FASE1_RIEPILOGO_COMPLETO.md)

---

## 🆘 Support

In caso di problemi:

1. Check logs: `vercel logs --follow`
2. Verifica database: `psql $DATABASE_URL`
3. Test locale: `npm run test:health-check`
4. Review documentazione completa
5. Rollback se necessario (vedi FASE1_IMPLEMENTAZIONE_COMPLETA.md)

---

## ✅ Success Criteria

Deploy considerato **successful** se:

- [ ] Cron job esegue 2x al giorno senza errori
- [ ] Alert generati correttamente (3-5 per giardino/settimana)
- [ ] UI mostra alert in `/app/advice`
- [ ] Harvest modal trigger funziona
- [ ] Onboarding banner appare per nuovi utenti
- [ ] Nessun breaking change per utenti esistenti
- [ ] Performance < 3s time-to-interactive

---

**Buon testing e deploy! 🚀**

**Ultima revisione**: 25 Dicembre 2024
**Versione**: 1.0.0
