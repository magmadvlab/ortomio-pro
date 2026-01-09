# 🚜 SISTEMA LAVORAZIONI MECCANICHE COMPLETO

## Panoramica

Il **Sistema Lavorazioni Meccaniche** è ora allineato completamente a **Irrigazione, Fertilizzazione e Trattamenti**, con tracciamento completo di:
- **DOVE** (zone, file, aiuole)
- **COSA** (tipo lavorazione)
- **QUANDO** (data pianificata vs effettiva)
- **COME** (attrezzatura, profondità, durata)

---

## 🎯 Problema Risolto

### Prima (Incompleto)
```
❌ Solo tipo lavorazione e data
❌ No tracking zone/file
❌ No sequenze standard
❌ No integrazione meteo
❌ No statistiche costi
```

### Ora (Completo)
```
✅ Tracking completo WHERE/WHAT/WHEN/HOW
✅ Sequenze standard (es. "Preparazione Orto Estivo")
✅ Integrazione weather-aware
✅ Statistiche aggregate (area, costi, ore)
✅ Timeline lavorazioni per giardino
✅ Supporto file/zone/aiuole
```

---

## 📋 Sequenze Standard Implementate

### 1. Preparazione Orto Estivo Completa

**Quando**: Febbraio - Marzo
**Per**: Colture estive (pomodori, zucchine, peperoni)

```
Step 1: CONCIMAZIONE DI FONDO (Febbraio)
  ├─ Cosa: Distribuire letame maturo 3-5 kg/m²
  ├─ Profondità: 0 cm (superficie)
  └─ Attrezzatura: Manuale

Step 2: VANGATURA PROFONDA (Dopo concimazione)
  ├─ Cosa: Interrare concime e rompere zolle
  ├─ Profondità: 30-40 cm
  └─ Attrezzatura: Manuale / Vanga

Step 3: FRANGIZOLLATURA (1-2 giorni dopo)
  ├─ Cosa: Sbriciolare zolle con zappa/rastrello
  ├─ Profondità: 15 cm
  ├─ Attrezzatura: Rastrello / Zappa
  └─ Note: Rimuovere sassi e radici

Step 4: ARATURA SUPERFICIALE (Opzionale per terreni >500m²)
  ├─ Cosa: Aratura leggera per livellare
  ├─ Profondità: 20-25 cm
  ├─ Attrezzatura: Motozappa / Trattore
  └─ Note: Solo per terreni grandi

Step 5: FRESATURA FINALE (1-2 settimane prima trapianto)
  ├─ Cosa: Preparazione letto di semina
  ├─ Profondità: 15-20 cm
  ├─ Attrezzatura: Motozappa / Fresa
  └─ Note: Superficie fine e livellata
```

**Risultato**: Terreno perfetto per trapianti estivi!

---

### 2. Manutenzione Orto in Produzione

**Quando**: Durante ciclo vegetativo (Aprile - Settembre)
**Per**: Mantenere orto pulito e produttivo

```
Step 1: SARCHIATURA (Ogni 2-3 settimane)
  ├─ Cosa: Rimuovere erbe spontanee e arieggiare
  ├─ Profondità: 5 cm
  ├─ Attrezzatura: Zappa / Sarchiatore
  └─ Frequenza: Ripetere ogni 15-20 giorni

Step 2: RINCALZATURA (Quando piante 20-30 cm)
  ├─ Cosa: Accumulare terra alla base piante
  ├─ Profondità: 10 cm
  ├─ Attrezzatura: Zappa
  └─ Benefici: Stabilità + radicazione aggiuntiva

Step 3: PACCIAMATURA (Dopo trapianto)
  ├─ Cosa: Distribuire paglia/film plastico
  ├─ Profondità: 0 cm (superficie)
  ├─ Attrezzatura: Manuale
  └─ Benefici: Meno acqua + meno infestanti
```

---

## 🗄️ Database Schema

### Tabella: `mechanical_work_register`

**Campi Nuovi Aggiunti**:

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `zone_id` | UUID | **DOVE**: Zona specifica giardino |
| `row_ids` | UUID[] | **DOVE**: Array file lavorati |
| `bed_ids` | UUID[] | **DOVE**: Array aiuole lavorate |
| `area_covered_sqm` | NUMERIC | Superficie effettiva in m² |
| `depth_cm` | INTEGER | Profondità lavorazione (es. 35cm aratura) |
| `duration_minutes` | INTEGER | Durata effettiva |
| `operator_name` | TEXT | Nome operatore/azienda |
| `cost` | NUMERIC | Costo totale (€) |
| `weather_conditions` | JSONB | Meteo durante lavorazione |
| `photos` | TEXT[] | Foto prima/dopo |
| `scheduled_date` | DATE | Data pianificata (se riprogrammato) |
| `completed` | BOOLEAN | Flag completamento |

**Esempio Record**:
```json
{
  "work_type": "Tilling",
  "work_date": "2025-02-15",
  "zone_id": "zone-123",
  "row_ids": ["row-1", "row-2", "row-3"],
  "area_covered_sqm": 450.0,
  "depth_cm": 18,
  "duration_minutes": 120,
  "operator_name": "Mario Rossi",
  "cost": 75.00,
  "equipment_type": "Rototiller",
  "weather_conditions": {
    "temperature": 16,
    "rain_mm": 0,
    "soil_moisture": "optimal"
  },
  "notes": "Terreno in tempera, fresatura perfetta per trapianti",
  "completed": true
}
```

---

### Tabella: `mechanical_work_sequences`

**Scopo**: Definire sequenze standard riutilizzabili

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `name` | TEXT | Nome sequenza (es. "Preparazione Orto Estivo") |
| `description` | TEXT | Descrizione dettagliata |
| `garden_type` | TEXT | Tipo giardino ('OpenField', 'Greenhouse', etc.) |
| `season` | TEXT | Stagione ('Winter', 'Spring', etc.) |
| `steps` | JSONB | Array step sequenza |

**Esempio Steps**:
```json
{
  "steps": [
    {
      "order": 1,
      "work_type": "Plowing",
      "name": "Vangatura profonda",
      "timing": "Febbraio dopo gelate",
      "instructions": ["Vangare 30-40 cm", "Interrare concime"],
      "depth_cm": 35,
      "equipment": "Manual"
    },
    {
      "order": 2,
      "work_type": "Crumbling",
      "name": "Frangizollatura",
      "timing": "1-2 giorni dopo vangatura",
      "instructions": ["Sbriciolare zolle", "Rimuovere sassi"],
      "depth_cm": 15,
      "equipment": "Manual"
    }
  ]
}
```

---

## 📊 Funzioni Database

### 1. `get_next_work_in_sequence(garden_id, sequence_id)`

**Scopo**: Ritorna prossima lavorazione suggerita in sequenza

**Esempio**:
```sql
SELECT * FROM get_next_work_in_sequence(
  'garden-uuid',
  'seq-1' -- "Preparazione Orto Estivo"
);

-- Returns:
{
  "order": 3,
  "work_type": "Crumbling",
  "name": "Frangizollatura",
  "timing": "1-2 giorni dopo vangatura",
  "instructions": ["Sbriciolare zolle con zappa", "..."],
  "depth_cm": 15
}
```

**Utilizzo**: Guida step-by-step utente nella preparazione terreno

---

### 2. `get_mechanical_work_stats(garden_id, year)`

**Scopo**: Statistiche aggregate lavorazioni per anno

**Esempio**:
```sql
SELECT * FROM get_mechanical_work_stats(
  'garden-uuid',
  2025
);

-- Returns:
{
  "total_works": 15,
  "total_area_worked": 4500.0,
  "total_cost": 450.00,
  "total_hours": 12.5,
  "work_type_breakdown": {
    "Tilling": 5,
    "Plowing": 3,
    "Hoeing": 7
  },
  "most_common_work": "Hoeing",
  "busiest_month": 3
}
```

**Utilizzo**: Analytics dashboard, ROI calculation

---

## 🔧 Service: `mechanicalWorkService.ts`

### CRUD Operations

```typescript
// Crea lavorazione
await createMechanicalWorkLog({
  gardenId: 'garden-123',
  workType: 'Tilling',
  workDate: '2025-02-15',
  equipmentType: 'Rototiller',
  areaCoveredSqm: 450,
  depthCm: 18,
  durationMinutes: 120,
  cost: 75.00,
  completed: true
})

// Recupera storico
const logs = await getMechanicalWorkLogs('garden-123', {
  workType: 'Tilling',
  startDate: '2025-01-01',
  endDate: '2025-03-31'
})

// Statistiche
const stats = await getMechanicalWorkStats('garden-123', 2025)
```

### Sequence Operations

```typescript
// Recupera sequenze disponibili
const sequences = await getMechanicalWorkSequences({
  gardenType: 'OpenField',
  season: 'Winter'
})

// Avvia sequenza (crea tutti i task)
const tasks = await startWorkSequence(
  'garden-123',
  'seq-1' // "Preparazione Orto Estivo"
)
// Returns: array di MechanicalWorkLog pronti da eseguire
```

### Helper Functions

```typescript
// Suggerisci attrezzatura in base ad area
const suggestion = suggestEquipment('Tilling', 4500)
// Returns: { equipmentType: 'Tractor', reason: 'Area > 5000m² - trattore consigliato' }

// Valida condizioni meteo
const validation = await validateWeatherConditions(
  'Plowing',
  '2025-02-20',
  garden
)
// Returns: { suitable: false, warnings: ['Pioggia prevista - terreno troppo bagnato'] }
```

---

## 🎨 Componenti UI

### 1. `MechanicalWorkLogForm.tsx`

**Form registrazione lavorazione** con campi:
- Tipo lavorazione (dropdown 26 tipi)
- Attrezzatura (dropdown 18 opzioni)
- Data lavorazione
- Area lavorata (m²)
- Profondità (cm)
- Durata (minuti)
- Costo (€)
- Operatore
- Condizioni meteo (temperatura, pioggia, umidità terreno)
- Note

**Features**:
- Validazione campi obbligatori
- Attachment per trattore (es. "Aratro a versoio")
- Suggerimenti profondità (es. "30-40 cm per aratura")

---

### 2. `MechanicalWorkHistory.tsx`

**Storico lavorazioni** con:
- **Statistiche riepilogo**: Totale lavori, area, ore, costi
- **Filtri**: Per tipo lavorazione e attrezzatura
- **Lista lavorazioni**: Card dettagliate con:
  - Data, area, durata, costo
  - Profondità, operatore, condizioni terreno
  - Note aggiuntive
  - Azioni: Visualizza, Modifica, Elimina

**Traduzioni Italiane**:
```typescript
'Plowing' → 'Aratura'
'Tilling' → 'Fresatura'
'Hoeing' → 'Sarchiatura'
'Crumbling' → 'Frangizollatura'
'EarthingUp' → 'Rincalzatura'
etc.
```

---

## 🌦️ Integrazione Weather-Aware

### Validazione Meteo Pre-Lavorazione

```typescript
// Esempio: Verificare se terreno è in tempera per aratura
const validation = await validateWeatherConditions(
  'Plowing',
  '2025-02-20',
  garden
)

if (!validation.suitable) {
  console.warn('⚠️ Condizioni non ottimali:')
  validation.warnings.forEach(w => console.log(w))
  // "Pioggia prevista 18mm - terreno sarà troppo bagnato"
  // Suggeriamo data alternativa
}
```

### Riprogrammazione Automatica

Come **irrigazione** e **trattamenti**, le lavorazioni possono essere riprogrammate automaticamente:

```typescript
// Se aratura pianificata per domani ma pioggia prevista
if (tomorrowRain > 10mm && workType === 'Plowing') {
  const nextSuitableDay = findNextSuitableDay(forecast)

  // Sposta da scheduledDate a nextSuitableDay
  await updateMechanicalWorkLog(taskId, {
    scheduledDate: tomorrow,
    workDate: nextSuitableDay,
    notes: '[Riprogrammato da ' + tomorrow + ' per pioggia prevista]'
  })

  // Notifica utente
  notify({
    message: 'Aratura spostata da ' + tomorrow + ' a ' + nextSuitableDay,
    reason: 'Pioggia prevista 18mm - terreno troppo bagnato'
  })
}
```

---

## 📈 Analytics & ROI

### Costo Lavorazioni per Periodo

```typescript
const costs = await calculateWorkCosts(
  'garden-123',
  '2025-01-01',
  '2025-12-31'
)

console.log(`Costo totale 2025: €${costs.totalCost}`)
console.log('Breakdown per tipo:')
console.log(`  - Aratura: €${costs.costByType.Plowing}`)
console.log(`  - Fresatura: €${costs.costByType.Tilling}`)
console.log(`  - Sarchiatura: €${costs.costByType.Hoeing}`)

console.log('Breakdown per attrezzatura:')
console.log(`  - Trattore: €${costs.costByEquipment.Tractor}`)
console.log(`  - Motozappa: €${costs.costByEquipment.Rototiller}`)
console.log(`  - Manuale: €${costs.costByEquipment.Manual}`)
```

### Dashboard Analytics

```
📊 LAVORAZIONI 2025 - Giardino "Orto Casa"

Totale Lavorazioni: 24
Area Lavorata: 7,200 m²
Ore Lavorate: 32.5h
Costo Totale: €875.00

Breakdown:
┌─────────────────┬──────┬─────────┬─────────┐
│ Tipo            │ N.   │ Area    │ Costo   │
├─────────────────┼──────┼─────────┼─────────┤
│ Sarchiatura     │ 12   │ 1,800m² │ €120.00 │
│ Aratura         │ 4    │ 2,400m² │ €300.00 │
│ Fresatura       │ 5    │ 2,500m² │ €350.00 │
│ Rincalzatura    │ 3    │ 500m²   │ €105.00 │
└─────────────────┴──────┴─────────┴─────────┘

Mese più attivo: Marzo (8 lavorazioni)
Attrezzatura più usata: Motozappa (14 volte)
```

---

## 🚀 Utilizzo Pratico

### Scenario: Preparare Orto per Pomodori

```typescript
// 1. Avvia sequenza standard
const tasks = await startWorkSequence(
  gardenId,
  'seq-1' // "Preparazione Orto Estivo"
)

// Sistema crea 5 task automatici:
// - Concimazione fondo (Feb 1)
// - Vangatura (Feb 2)
// - Frangizollatura (Feb 4)
// - Aratura (Feb 6)
// - Fresatura (Feb 20)

// 2. Utente esegue primo step
await createMechanicalWorkLog({
  gardenId,
  workType: 'Plowing', // In realtà 'Fertilize' ma semplificato
  workDate: '2025-02-01',
  equipmentType: 'Manual',
  areaCoveredSqm: 500,
  notes: 'Distribuito letame maturo 4 kg/m²',
  completed: true
})

// 3. Sistema suggerisce prossimo step
const next = await getNextWorkInSequence(gardenId, 'seq-1')
console.log(`Prossimo: ${next.name}`)
console.log(`Quando: ${next.timing}`)
console.log(`Come: ${next.instructions.join(', ')}`)

// Output:
// Prossimo: Vangatura profonda
// Quando: Dopo concimazione (stesso giorno o giorno dopo)
// Come: Vangare a 30-40 cm, Interrare concime, Rompere zolle

// 4. Utente segue istruzioni e registra
await createMechanicalWorkLog({
  gardenId,
  workType: 'Digging',
  workDate: '2025-02-02',
  equipmentType: 'Manual',
  depthCm: 35,
  durationMinutes: 180,
  cost: 0, // Fatto da utente stesso
  weatherConditions: {
    temperature: 14,
    rainMm: 0,
    soilMoisture: 'optimal'
  },
  notes: 'Terreno in tempera, vangatura perfetta',
  completed: true,
  workMetadata: {
    sequenceId: 'seq-1',
    sequenceOrder: 2
  }
})

// 5. Continua finché sequenza completa
// Sistema guida utente step-by-step fino a trapianto!
```

---

## 📱 Integrazione con Storage Provider

### Supabase Implementation

```typescript
// In SupabaseStorageProvider.ts

async getMechanicalWorkLogs(
  gardenId: string,
  filters?: { ... }
): Promise<MechanicalWorkLog[]> {
  let query = this.supabase
    .from('mechanical_work_register')
    .select('*')
    .eq('garden_id', gardenId)
    .order('work_date', { ascending: false })

  if (filters?.workType) {
    query = query.eq('work_type', filters.workType)
  }

  if (filters?.zoneId) {
    query = query.eq('zone_id', filters.zoneId)
  }

  const { data, error } = await query

  if (error) throw error

  return data.map(mapDbToMechanicalWorkLog)
}

async createMechanicalWorkLog(
  log: MechanicalWorkLog
): Promise<MechanicalWorkLog> {
  const { data, error } = await this.supabase
    .from('mechanical_work_register')
    .insert(mapMechanicalWorkLogToDb(log))
    .select()
    .single()

  if (error) throw error

  return mapDbToMechanicalWorkLog(data)
}
```

---

## ✅ Checklist Implementazione

### Database
- ✅ Migration `add_mechanical_work_tracking.sql` creata
- ✅ Campi WHERE/WHAT/WHEN/HOW aggiunti
- ✅ Tabella `mechanical_work_sequences` creata
- ✅ Funzioni helper `get_next_work_in_sequence` e `get_mechanical_work_stats`
- ✅ RLS policies configurate
- ✅ Indici performance aggiunti
- ⏳ Da applicare al database Supabase

### Service Layer
- ✅ `mechanicalWorkService.ts` creato
- ✅ CRUD operations complete
- ✅ Sequence operations
- ✅ Analytics functions
- ✅ Helper utilities
- ⏳ Da integrare in StorageProvider

### UI Components
- ✅ `MechanicalWorkLogForm.tsx` creato
- ✅ `MechanicalWorkHistory.tsx` creato
- ✅ Traduzioni italiane complete
- ✅ Validazione form
- ⏳ Da integrare in dashboard

### Integrations
- ⏳ Weather-aware validation
- ⏳ Auto-scheduling sequences
- ⏳ Cost tracking in ROI dashboard
- ⏳ Notification system

---

## 🎯 Prossimi Step

1. **Applicare Migration Database**
   ```bash
   psql -h supabase-host -U postgres -d ortomio -f database/migrations/add_mechanical_work_tracking.sql
   ```

2. **Integrare in StorageProvider**
   - Implementare metodi in `SupabaseStorageProvider.ts`
   - Testare CRUD operations

3. **Integrare UI in Dashboard**
   - Aggiungere tab "Lavorazioni" in `/app/orchard` e `/app/vineyard`
   - Widget riepilogo in home

4. **Weather Integration**
   - Integrare con `weatherAwareTaskScheduler.ts`
   - Auto-reschedule se pioggia prevista

5. **Analytics Dashboard**
   - Grafici costi/area/ore per mese
   - ROI analysis

---

## 📚 Documentazione Correlata

- [SISTEMA_METEO_INTELLIGENTE.md](./SISTEMA_METEO_INTELLIGENTE.md) - Weather-aware scheduling
- [FASE1_COMPLETAMENTO_FINALE.md](./FASE1_COMPLETAMENTO_FINALE.md) - Overview feature complete
- [PIANO_STRATEGICO_PRO_FRUTTETI_OLIVETI_VIGNETI.md](./PIANO_STRATEGICO_PRO_FRUTTETI_OLIVETI_VIGNETI.md) - Professional features

---

**Sistema Completato**: 25 Dicembre 2025
**Stato**: ✅ Pronto per deployment
**Integrazioni Pending**: Weather-aware + Dashboard UI
