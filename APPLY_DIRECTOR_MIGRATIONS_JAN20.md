# 🚀 APPLICARE MIGRATIONS DIRECTOR SERVICE
**Data**: 20 Gennaio 2026

---

## 📋 MIGRATIONS DA APPLICARE

### 1. Daily Diary System (se non già applicata)
**File**: `supabase/migrations/20260119030000_create_daily_diary_system.sql`

**Cosa fa**:
- Crea tabella `daily_diary_entries`
- Crea tabelle correlate (`crop_gdd_accumulations`, `event_correlations`)
- Aggiunge funzioni per statistiche mensili e confronto anni

### 2. Director Service Extensions (NUOVA)
**File**: `supabase/migrations/20260120000000_extend_ai_suggestions_for_director.sql`

**Cosa fa**:
- Estende `ai_suggestions` con campi Director
- Aggiunge `priority_score`, `urgency_breakdown`, `conflicts_with`, `sequencing_order`
- Crea trigger auto-calcolo priorità
- Crea view `ai_suggestions_prioritized`

---

## 🔧 METODO 1: Supabase CLI (RACCOMANDATO)

### Step 1: Verifica Supabase CLI installato
```bash
supabase --version
```

Se non installato:
```bash
# macOS
brew install supabase/tap/supabase

# Altri OS
npm install -g supabase
```

### Step 2: Login
```bash
supabase login
```

### Step 3: Link al progetto
```bash
supabase link --project-ref qhmujoivfxftlrcrluaj
```

### Step 4: Applica migrations
```bash
# Applica tutte le migrations pending
supabase db push

# Oppure applica singolarmente
supabase db push --file supabase/migrations/20260119030000_create_daily_diary_system.sql
supabase db push --file supabase/migrations/20260120000000_extend_ai_suggestions_for_director.sql
```

### Step 5: Verifica
```bash
# Verifica tabelle
supabase db diff

# Test connessione
node test-director-orchestrator-jan20.cjs
```

---

## 🌐 METODO 2: Supabase Dashboard (ALTERNATIVO)

### Step 1: Apri SQL Editor
1. Vai a https://supabase.com/dashboard
2. Seleziona progetto "ortomio"
3. Vai a "SQL Editor"

### Step 2: Applica Migration Daily Diary
1. Copia contenuto di `supabase/migrations/20260119030000_create_daily_diary_system.sql`
2. Incolla nel SQL Editor
3. Clicca "Run"
4. Verifica messaggio success

### Step 3: Applica Migration Director
1. Copia contenuto di `supabase/migrations/20260120000000_extend_ai_suggestions_for_director.sql`
2. Incolla nel SQL Editor
3. Clicca "Run"
4. Verifica messaggio success

### Step 4: Verifica Tabelle
```sql
-- Verifica daily_diary_entries
SELECT * FROM daily_diary_entries LIMIT 1;

-- Verifica campi Director in ai_suggestions
SELECT 
  id, 
  priority_score, 
  urgency_breakdown, 
  conflicts_with, 
  sequencing_order 
FROM ai_suggestions 
LIMIT 1;

-- Verifica view
SELECT * FROM ai_suggestions_prioritized LIMIT 5;
```

---

## 🧪 VERIFICA APPLICAZIONE

### Test Automatico
```bash
# Esporta variabili ambiente
export $(grep -E "NEXT_PUBLIC_SUPABASE" .env.local | xargs)

# Esegui test
node test-director-orchestrator-jan20.cjs
```

### Output Atteso
```
✅ ai_suggestions: OK
✅ daily_diary_entries: OK
✅ yield_predictions: OK
✅ harvest_recommendations: OK

✅ Campi Director presenti:
   - priority_score: ✅
   - urgency_breakdown: ✅
   - conflicts_with: ✅
   - sequencing_order: ✅
```

---

## 🐛 TROUBLESHOOTING

### Errore: "table already exists"
**Soluzione**: Migration già applicata, skip

### Errore: "column already exists"
**Soluzione**: Campi già presenti, skip

### Errore: "permission denied"
**Soluzione**: 
1. Verifica di essere loggato: `supabase login`
2. Verifica link progetto: `supabase link --project-ref qhmujoivfxftlrcrluaj`

### Errore: "Could not find table"
**Soluzione**: Migration non applicata, applica con metodo 1 o 2

---

## ✅ CHECKLIST POST-APPLICAZIONE

- [ ] Migration daily_diary applicata
- [ ] Migration director applicata
- [ ] Test automatico passa
- [ ] Tabelle verificate in dashboard
- [ ] App avviata: `npm run dev`
- [ ] DirectorBriefingWidget visibile
- [ ] Dati visualizzati correttamente

---

## 🚀 DOPO L'APPLICAZIONE

### 1. Avvia App
```bash
npm run dev
```

### 2. Testa Widget
1. Vai a http://localhost:3000
2. Login
3. Seleziona orto
4. Verifica DirectorBriefingWidget visibile in dashboard

### 3. Genera Dati Test (Opzionale)
```sql
-- Inserisci suggerimento test
INSERT INTO ai_suggestions (
  user_id,
  garden_id,
  suggestion_type,
  title,
  description,
  reasoning,
  action_priority,
  confidence_score,
  status
) VALUES (
  'YOUR_USER_ID',
  'YOUR_GARDEN_ID',
  'WATERING',
  'Irrigazione urgente necessaria',
  'Le piante mostrano segni di stress idrico',
  'Analisi NDVI mostra riduzione vigore vegetativo',
  'HIGH',
  0.85,
  'PENDING'
);

-- Inserisci diary entry test
INSERT INTO daily_diary_entries (
  garden_id,
  date,
  weather_data,
  agronomic_data,
  lunar_phase
) VALUES (
  'YOUR_GARDEN_ID',
  CURRENT_DATE,
  '{"temp_min": 15, "temp_max": 28, "precipitation_mm": 0}'::jsonb,
  '{"gdd_base_10": 18, "water_stress_index": 0.7, "heat_stress_hours": 2}'::jsonb,
  '{"phase": "Crescente", "favorable_for": ["semina", "trapianto"]}'::jsonb
);
```

---

## 📚 RIFERIMENTI

- **Migrations**: `supabase/migrations/`
- **Test**: `test-director-orchestrator-jan20.cjs`
- **Service**: `services/directorService.ts`
- **Widget**: `components/director/DirectorBriefingWidget.tsx`
- **Docs**: `SESSION_SUMMARY_JAN20_PREDICTIVE_ORCHESTRATOR.md`

---

**Creato**: 20 Gennaio 2026  
**Status**: Pronto per applicazione
