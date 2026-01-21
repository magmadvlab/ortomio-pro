# 🚀 QUICK START - Director Orchestrator

Sistema Predittivo Orchestrato pronto all'uso in 5 minuti!

---

## ⚡ SETUP RAPIDO

### 1. Applica Migrations (2 min)

```bash
# Metodo A: Supabase CLI (raccomandato)
supabase db push

# Metodo B: SQL Editor Dashboard
# Copia e incolla in Supabase Dashboard > SQL Editor:
# - supabase/migrations/20260119030000_create_daily_diary_system.sql
# - supabase/migrations/20260120000000_extend_ai_suggestions_for_director.sql
```

### 2. Verifica Setup (30 sec)

```bash
export $(grep -E "NEXT_PUBLIC_SUPABASE" .env.local | xargs)
node test-director-orchestrator-jan20.cjs
```

**Output atteso**: Tutti ✅

### 3. Avvia App (30 sec)

```bash
npm run dev
```

### 4. Testa Widget (1 min)

1. Apri http://localhost:3000
2. Login
3. Seleziona orto
4. **Verifica**: DirectorBriefingWidget visibile in alto nella dashboard

---

## 🎯 COSA VEDRAI

### DirectorBriefingWidget

```
┌─────────────────────────────────────────────┐
│ 📈 Briefing Giornaliero                     │
│ Martedì 20 Gennaio 2026                     │
├─────────────────────────────────────────────┤
│ Meteo: 15°-28°C • 2 azioni prioritarie     │
├─────────────────────────────────────────────┤
│ [2] Critiche  [3] Prioritarie  [5] Totali  │
├─────────────────────────────────────────────┤
│ ☀️ Meteo: 15° - 28°C                       │
│ 🌙 Fase Lunare: Crescente                  │
├─────────────────────────────────────────────┤
│ ⚡ Azioni Prioritarie:                      │
│   [HIGH] Irrigazione urgente necessaria     │
│   Score: 75                                 │
│   💡 Stress idrico rilevato                │
├─────────────────────────────────────────────┤
│ ✅ Raccomandazioni:                         │
│   • 🌡️ Temperature elevate: aumenta...    │
│   • 💧 Stress idrico: irrigazione urgente  │
│   • 🌙 Favorevole per: semina, trapianto   │
├─────────────────────────────────────────────┤
│ [Aggiorna Briefing]                         │
└─────────────────────────────────────────────┘
```

---

## 🧪 TEST FUNZIONALITÀ

### Test 1: Verifica Widget Visibile
- ✅ Widget appare in dashboard
- ✅ Mostra data corrente
- ✅ Mostra statistiche

### Test 2: Verifica Dati
- ✅ Suggerimenti AI caricati
- ✅ Dati meteo presenti (se disponibili)
- ✅ Raccomandazioni generate

### Test 3: Interazione
- ✅ Click "Aggiorna Briefing" funziona
- ✅ Expand/collapse funziona (se compact)
- ✅ Badge colorati corretti

---

## 🐛 PROBLEMI COMUNI

### Widget non visibile
**Causa**: Nessun orto selezionato  
**Fix**: Seleziona un orto dalla dashboard

### Nessun dato visualizzato
**Causa**: Database vuoto  
**Fix**: Genera dati test (vedi sotto)

### Errore "table not found"
**Causa**: Migrations non applicate  
**Fix**: Esegui `supabase db push`

---

## 🎲 GENERA DATI TEST

```sql
-- 1. Inserisci suggerimento test
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
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM gardens LIMIT 1),
  'WATERING',
  'Irrigazione urgente necessaria',
  'Le piante mostrano segni di stress idrico',
  'Analisi NDVI mostra riduzione vigore vegetativo',
  'HIGH',
  0.85,
  'PENDING'
);

-- 2. Inserisci diary entry test
INSERT INTO daily_diary_entries (
  garden_id,
  date,
  weather_data,
  agronomic_data,
  lunar_phase
) VALUES (
  (SELECT id FROM gardens LIMIT 1),
  CURRENT_DATE,
  '{"temp_min": 15, "temp_max": 28, "precipitation_mm": 0}'::jsonb,
  '{"gdd_base_10": 18, "water_stress_index": 0.7, "heat_stress_hours": 2}'::jsonb,
  '{"phase": "Crescente", "favorable_for": ["semina", "trapianto"]}'::jsonb
);

-- 3. Refresh widget nella dashboard
```

---

## 📚 DOCUMENTAZIONE COMPLETA

- **Analisi**: `ANALISI_SISTEMA_PREDITTIVO_ORCHESTRATO.md`
- **Riepilogo**: `SESSION_SUMMARY_JAN20_PREDICTIVE_ORCHESTRATOR.md`
- **Migrations**: `APPLY_DIRECTOR_MIGRATIONS_JAN20.md`

---

## ✅ CHECKLIST COMPLETAMENTO

- [ ] Migrations applicate
- [ ] Test passa
- [ ] App avviata
- [ ] Widget visibile
- [ ] Dati visualizzati
- [ ] Refresh funziona

---

## 🎉 FATTO!

Il sistema è pronto! Ora hai un orchestratore predittivo che:
- ✅ Coordina suggerimenti AI
- ✅ Integra dati meteo e agronomici
- ✅ Prioritizza azioni automaticamente
- ✅ Genera raccomandazioni actionable
- ✅ Visualizza tutto in un widget intuitivo

**Tempo totale setup**: ~5 minuti  
**Complessità**: Bassa  
**Risultato**: Sistema professionale funzionante ⭐⭐⭐⭐⭐

---

**Creato**: 20 Gennaio 2026  
**Status**: ✅ PRONTO ALL'USO
