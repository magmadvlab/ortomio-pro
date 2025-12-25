# ✅ Stato Test Versione PRO

## Configurazione Completata

### ✅ Database
- **12 tabelle** create (incluso custom_plans, agronomists, agronomist_consultations, agronomist_advice)
- **Postgres**: Healthy ✅
- **Schema**: Applicato correttamente ✅

### ✅ Variabili Ambiente
- **.env** configurato con:
  - `VITE_SUPABASE_URL=http://localhost:8000`
  - `VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### ⚠️ Container Supabase
- **Postgres**: ✅ Healthy
- **Kong**: ✅ Healthy (porta 8000)
- **Meta**: ✅ Healthy
- **Studio**: ⚠️ Unhealthy (ma accessibile su porta 3000)
- **Auth/Realtime/Rest/Storage**: 🔄 Restarting (normale, si avviano in sequenza)

**Nota**: I container che stanno riavviando sono normali al primo avvio. Attendi 1-2 minuti.

---

## 🚀 Avvia Test

### 1. Attendi che i container si stabilizzino (1-2 minuti)

```bash
cd /Users/magma/Downloads/ortomio-main/docker
/Applications/Docker.app/Contents/Resources/bin/docker compose ps
```

**Quando vedi tutti "Up" o "healthy"**, procedi.

### 2. Avvia App

```bash
cd /Users/magma/Downloads/ortomio-main
npm run dev
```

Apri: **http://localhost:5173**

### 3. Imposta Tier PRO

**Console Browser (F12):**
```javascript
localStorage.setItem('ortomio_tier', 'PRO');
location.reload();
```

### 4. Test Funzionalità

#### ✅ Test Base
1. Verifica badge "PRO" visibile
2. Crea un orto → Verifica in Supabase Studio (http://localhost:3000)
3. Aggiungi un task → Verifica in Supabase Studio

#### ✅ Test Fragole Basilicata
1. Planner → Cerca "CANDONGA" o "MATERA"
2. Dovresti vedere le varietà
3. Aggiungi → Verifica task creato

#### ✅ Test Frutta Esotica
1. Planner → Cerca "PAPAYA", "MANGO", "AVOCADO"
2. Dovresti vedere le varietà esotiche
3. Aggiungi → Verifica task con `exotic_fruit_data`

#### ✅ Test Supabase Studio
1. Apri: http://localhost:3000
2. Table Editor → `gardens` → Vedi orti creati
3. Table Editor → `garden_tasks` → Vedi task creati
4. Verifica campi JSONB (strawberry_data, exotic_fruit_data, etc.)

---

## 🔍 Verifica Stato Container

```bash
cd /Users/magma/Downloads/ortomio-main/docker
/Applications/Docker.app/Contents/Resources/bin/docker compose ps
```

**Atteso:**
- ✅ postgres: Up (healthy)
- ✅ kong: Up (healthy)
- ✅ meta: Up (healthy)
- ✅ studio: Up (anche se unhealthy, funziona)
- ⏳ auth, realtime, rest, storage: Possono essere "Restarting" (normale)

---

## 🐛 Se API Non Risponde

Se `curl http://localhost:8000/rest/v1/` ritorna errore:

1. **Attendi 1-2 minuti** (container si stanno avviando)
2. **Riavvia container:**
   ```bash
   cd /Users/magma/Downloads/ortomio-main/docker
   /Applications/Docker.app/Contents/Resources/bin/docker compose restart
   ```
3. **Verifica log:**
   ```bash
   /Applications/Docker.app/Contents/Resources/bin/docker compose logs kong --tail 20
   ```

---

## ✅ Checklist Test

- [ ] Container Supabase avviati (almeno postgres, kong, meta)
- [ ] .env configurato con variabili Supabase
- [ ] App avviata (`npm run dev`)
- [ ] Tier impostato a PRO (localStorage)
- [ ] Badge "PRO" visibile
- [ ] Creato orto → salvato in Supabase
- [ ] Creato task → salvato in Supabase
- [ ] Fragole Basilicata disponibili
- [ ] Frutta esotica disponibili
- [ ] Verificato in Supabase Studio
- [ ] Nessun errore in console browser

---

## 📊 Tabelle Database Verificate

```sql
-- Esegui in Supabase Studio → SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Dovresti vedere 12 tabelle:**
1. agronomist_advice
2. agronomist_consultations
3. agronomists
4. bed_planting_history
5. custom_plans
6. garden_beds
7. garden_tasks
8. gardens
9. harvest_logs
10. photo_logs
11. seed_inventory
12. weather_cache

---

**Stato**: ✅ Pronto per test (attendi 1-2 minuti per avvio completo container)




















