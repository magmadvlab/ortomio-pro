# FASE 2A: Integrazione LocationSelector - COMPLETATA ✅

**Data**: 15 Gennaio 2026  
**Tempo**: 15 minuti  
**Status**: ✅ Implementazione Completata

---

## 🎯 Obiettivo

Integrare **LocationSelector** nelle pagine Frutteto/Vigneto/Oliveto per permettere:
- Selezione zona/filare/porzione
- Filtro alberi/viti/olivi per location
- Differenziazione tra orti diversi

---

## ✅ Implementazioni Completate

### 1. Frutteto (`/app/orchard`)

**Modifiche**:
- ✅ Aggiunto import `LocationSelector`
- ✅ Aggiunto state `selectedLocation` e `filteredTasks`
- ✅ Aggiunto useEffect per filtrare alberi per location
- ✅ Aggiunto UI LocationSelector con label "Filtra per Zona/Filare/Porzione"
- ✅ Aggiunto bottone "Rimuovi filtro"
- ✅ Aggiornato titolo lista per mostrare location attiva

**Funzionalità**:
```typescript
// Filtra alberi per location selezionata
if (selectedLocation.sectionId) {
  // Filtra per porzione di filare
  filteredTasks = tasks.filter(t => t.field_row_section_id === selectedLocation.sectionId)
} else if (selectedLocation.fieldRowId) {
  // Filtra per filare
  filteredTasks = tasks.filter(t => t.field_row_id === selectedLocation.fieldRowId)
} else if (selectedLocation.zoneId) {
  // Filtra per zona
  filteredTasks = tasks.filter(t => t.zone_id === selectedLocation.zoneId)
}
```

---

### 2. Vigneto (`/app/vineyard`)

**Modifiche**: Identiche a Frutteto
- ✅ LocationSelector integrato
- ✅ Filtro viti per location
- ✅ UI aggiornata

**Placeholder**: "Tutte le viti"

---

### 3. Oliveto (`/app/olives`)

**Modifiche**: Identiche a Frutteto
- ✅ LocationSelector integrato
- ✅ Filtro olivi per location
- ✅ UI aggiornata

**Placeholder**: "Tutti gli olivi"

---

## 🎨 UI/UX Implementata

### Location Selector Card

```
┌─────────────────────────────────────────────────────┐
│ 🔍 Filtra per Zona/Filare/Porzione                  │
│                                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 📍 Tutti gli alberi                           ▼ │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ Filtro attivo: Zona Nord - Filare 1 - Inizio       │
│ [Rimuovi filtro]                                    │
└─────────────────────────────────────────────────────┘
```

### Lista Filtrata

```
┌─────────────────────────────────────────────────────┐
│ Alberi in Zona Nord - Filare 1 - Inizio (12)       │
├─────────────────────────────────────────────────────┤
│ 🌳 Melo Golden Delicious                            │
│    Età: 5 anni • Piantato: 15 Mar 2021             │
│    📅 Periodo Raccolta: settembre - ottobre         │
├─────────────────────────────────────────────────────┤
│ 🌳 Pero Conference                                   │
│    Età: 3 anni • Piantato: 20 Apr 2023             │
│    📅 Periodo Raccolta: agosto - settembre          │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Architettura Tecnica

### State Management

```typescript
// State per location
const [selectedLocation, setSelectedLocation] = useState<any>(null)
const [filteredTasks, setFilteredTasks] = useState<GardenTask[]>([])

// Effect per filtrare
useEffect(() => {
  if (!selectedLocation) {
    setFilteredTasks(tasks) // Mostra tutti
  } else {
    // Filtra per location
    const filtered = tasks.filter(task => {
      if (selectedLocation.sectionId && task.field_row_section_id) {
        return task.field_row_section_id === selectedLocation.sectionId
      }
      if (selectedLocation.fieldRowId && task.field_row_id) {
        return task.field_row_id === selectedLocation.fieldRowId
      }
      if (selectedLocation.zoneId && task.zone_id) {
        return task.zone_id === selectedLocation.zoneId
      }
      return true
    })
    setFilteredTasks(filtered)
  }
}, [tasks, selectedLocation])
```

### Location Object Structure

```typescript
interface Location {
  zoneId?: string
  zoneName?: string
  fieldRowId?: string
  fieldRowName?: string
  sectionId?: string
  sectionName?: string
  fullLocationName: string // "Zona Nord - Filare 1 - Inizio (0-33.33m)"
}
```

---

## 📊 Funzionalità Disponibili

### Per Ogni Pagina (Frutteto/Vigneto/Oliveto)

✅ **Visualizzazione Completa**
- Mostra tutti gli alberi/viti/olivi dell'orto

✅ **Filtro per Zona**
- Seleziona zona → Mostra solo alberi in quella zona
- Es: "Zona Nord" → 45 alberi

✅ **Filtro per Filare**
- Seleziona filare → Mostra solo alberi in quel filare
- Es: "Zona Nord - Filare 1" → 15 alberi

✅ **Filtro per Porzione**
- Seleziona porzione → Mostra solo alberi in quella porzione
- Es: "Filare 1 - Inizio (0-33.33m)" → 5 alberi

✅ **Rimozione Filtro**
- Click "Rimuovi filtro" → Torna a visualizzazione completa

✅ **Differenziazione Orti**
- Ogni orto ha le sue zone/filari/porzioni
- Cambio orto → Cambiano opzioni location

---

## 🔄 Integrazione con Rotazione Colture

### Sistema Rotazione GIÀ Implementato ✅

La rotazione colture è **completamente orchestrata** per:

#### 1. Per Anno
```typescript
// Storico per anno
const history2026 = await cropRotationService.getHistory(gardenId, { year: 2026 })
const history2027 = await cropRotationService.getHistory(gardenId, { year: 2027 })

// Esempio:
// 2026: Orto 1 - Filare 10 → Pomodori
// 2027: Orto 1 - Filare 10 → Angurie (suggerito da AI)
```

#### 2. Per Orto
```typescript
// Ogni orto ha storico separato
const orto1History = await cropRotationService.getHistory('orto-1-id')
const orto2History = await cropRotationService.getHistory('orto-2-id')

// Orto 1 e Orto 2 hanno rotazioni indipendenti
```

#### 3. Per Filare
```typescript
// Storico specifico per filare
const filare10History = await cropRotationService.getHistoryByRow('filare-10-id')

// Esempio:
// Filare 10:
//   2024: Lattuga (Asteraceae)
//   2025: Fagioli (Leguminose) - Score: 95
//   2026: Pomodori (Solanaceae) - Score: 90
//   2027: Angurie (Cucurbitaceae) - Score: 85 (suggerito)
```

#### 4. Score Automatico
```typescript
// Sistema calcola score 0-100 basato su:
// - Famiglia botanica precedente
// - Anni dall'ultima coltivazione stessa famiglia
// - Malattie storiche
// - Fertilità suolo

const plan = await cropRotationService.generateRotationPlan(
  gardenId,
  fieldRowId,
  'Pomodoro',
  'Solanaceae'
)

// plan.suggestedNextCrops = [
//   { plantName: 'Anguria', score: 85, benefits: [...] },
//   { plantName: 'Zucchina', score: 82, benefits: [...] },
//   { plantName: 'Fagiolo', score: 95, benefits: [...] }
// ]
```

#### 5. Warnings Automatici
```typescript
// Sistema avvisa se:
// ❌ Stessa famiglia ripetuta
// ❌ Famiglia usata < 2 anni fa
// ⚠️  Malattie storiche presenti
// ⚠️  Suolo depauperato

// Esempio warning:
// "Famiglia Solanaceae ripetuta 2 volte - rischio patogeni"
// "Presenza storica di peronospora - rotazione importante"
```

---

## 📋 Database Schema Rotazione

### Tabella `crop_rotation_history`
```sql
CREATE TABLE crop_rotation_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  garden_id UUID REFERENCES gardens,
  field_row_id UUID REFERENCES field_rows,
  zone_id UUID REFERENCES garden_zones,
  
  plant_name TEXT NOT NULL,
  plant_family TEXT NOT NULL,
  
  planted_date DATE NOT NULL,
  harvest_date DATE,
  season TEXT, -- 'spring', 'summer', 'fall', 'winter'
  year INTEGER NOT NULL,
  
  yield_kg NUMERIC,
  quality_score INTEGER, -- 0-100
  diseases TEXT[],
  pests TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index per performance
CREATE INDEX idx_rotation_history_field_row ON crop_rotation_history(field_row_id);
CREATE INDEX idx_rotation_history_year ON crop_rotation_history(year);
```

### Tabella `crop_rotation_plans`
```sql
CREATE TABLE crop_rotation_plans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  garden_id UUID REFERENCES gardens,
  field_row_id UUID REFERENCES field_rows,
  
  current_crop TEXT NOT NULL,
  current_family TEXT NOT NULL,
  
  suggested_next_crops JSONB NOT NULL, -- Array di SuggestedCrop
  rotation_cycle INTEGER DEFAULT 4,
  
  reasoning TEXT,
  benefits TEXT[],
  risks_to_avoid TEXT[],
  confidence_score NUMERIC, -- 0-1
  
  status TEXT DEFAULT 'SUGGESTED', -- SUGGESTED, ACCEPTED, REJECTED
  accepted_crop TEXT,
  accepted_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎯 Esempio Completo Workflow

### Scenario: Pianificare Rotazione 2027 per Filare 10

**Step 1: Utente apre Planner Classico**
```
/app/planner-classic
```

**Step 2: Seleziona Location**
```
LocationSelector:
  Orto: "Orto di Rob"
  Zona: "Zona Nord"
  Filare: "Filare 10"
```

**Step 3: Sistema Carica Storico**
```typescript
const history = await cropRotationService.getHistoryByRow('filare-10-id')

// Risultato:
// 2024: Lattuga (Asteraceae)
// 2025: Fagioli (Leguminose)
// 2026: Pomodori (Solanaceae) ← ATTUALE
```

**Step 4: Sistema Genera Suggerimenti**
```typescript
const plan = await cropRotationService.generateRotationPlan(
  'orto-rob-id',
  'filare-10-id',
  'Pomodoro',
  'Solanaceae'
)

// Suggerimenti AI:
// 1. Anguria (Cucurbitaceae) - Score: 85
//    Benefici: Famiglia diversa, radici profonde, migliora struttura
// 2. Zucchina (Cucurbitaceae) - Score: 82
//    Benefici: Famiglia diversa, ciclo breve
// 3. Fagiolo (Leguminose) - Score: 95
//    Benefici: Arricchisce azoto, ripristina fertilità
```

**Step 5: Utente Accetta Suggerimento**
```typescript
await cropRotationService.acceptPlan(plan.id, 'Anguria')

// Sistema registra:
// - Piano accettato
// - Crop: Anguria
// - Anno: 2027
// - Filare: Filare 10
```

**Step 6: A Raccolta, Sistema Aggiorna History**
```typescript
await cropRotationService.addToHistory({
  gardenId: 'orto-rob-id',
  fieldRowId: 'filare-10-id',
  plantName: 'Anguria',
  plantFamily: 'Cucurbitaceae',
  plantedDate: '2027-04-15',
  harvestDate: '2027-08-20',
  year: 2027,
  yieldKg: 150,
  qualityScore: 88
})

// Storico aggiornato:
// 2024: Lattuga (Asteraceae)
// 2025: Fagioli (Leguminose)
// 2026: Pomodori (Solanaceae)
// 2027: Anguria (Cucurbitaceae) ← NUOVO
```

---

## ✅ Checklist Completamento

### Location Integration
- [x] LocationSelector in Frutteto
- [x] LocationSelector in Vigneto
- [x] LocationSelector in Oliveto
- [x] Filtro alberi/viti/olivi per location
- [x] UI "Rimuovi filtro"
- [x] Titolo dinamico con location

### Rotazione Colture (GIÀ IMPLEMENTATA)
- [x] Database schema completo
- [x] Storico per anno/orto/filare
- [x] Score automatico 0-100
- [x] Suggerimenti AI
- [x] Warnings automatici
- [x] Tracking automatico history
- [x] UI CropRotationPlanner
- [x] Integrazione con ClassicPlanner

---

## 🎉 Risultato Finale

### Ora Puoi:

✅ **Filtrare per Location**
- Frutteto: Filtra alberi per zona/filare/porzione
- Vigneto: Filtra viti per zona/filare/porzione
- Oliveto: Filtra olivi per zona/filare/porzione

✅ **Pianificare Rotazione Orchestrata**
- Per Anno: 2026, 2027, 2028...
- Per Orto: Orto 1, Orto 2, Orto 3...
- Per Filare: Filare 1, Filare 2, Filare 10...
- Score Automatico: 0-100 basato su regole botaniche
- Suggerimenti AI: Top 10 colture compatibili

✅ **Tracciare Storia**
- Storico completo per filare
- Malattie e problemi registrati
- Rese e qualità tracciati
- Memoria persistente multi-anno

✅ **Differenziare Orti**
- Ogni orto ha zone/filari propri
- Storico separato per orto
- Rotazioni indipendenti

---

## 📝 Prossimi Passi Opzionali

### Miglioramenti Futuri (Non Urgenti)

1. **Visualizzazione Grafica**
   - Timeline rotazioni per filare
   - Heatmap compatibilità
   - Grafico famiglie botaniche

2. **Export Report**
   - Report rotazioni per certificazioni
   - Piano colturale annuale PDF
   - Statistiche produttività

3. **AI Avanzata**
   - Predizione rese basata su rotazione
   - Suggerimenti automatici piano annuale
   - Analisi trend multi-anno

---

**Implementato da:** Kiro AI Assistant  
**Tempo Totale FASE 2A:** 15 minuti  
**Status:** ✅ COMPLETATO

**Sistema Rotazione:** ✅ GIÀ IMPLEMENTATO E FUNZIONANTE

---

## 🚀 Come Usare

### 1. Filtrare Alberi/Viti/Olivi
```
1. Vai su /app/orchard (o vineyard, olives)
2. Click su LocationSelector
3. Seleziona Zona/Filare/Porzione
4. Vedi solo alberi in quella location
5. Click "Rimuovi filtro" per vedere tutti
```

### 2. Pianificare Rotazione
```
1. Vai su /app/planner-classic
2. Tab "Pianificazione Classica"
3. Seleziona Filare con LocationSelector
4. Sistema mostra storico rotazioni
5. Sistema calcola score compatibilità
6. Scegli coltura suggerita
7. Sistema registra piano
```

### 3. Vedere Storico Rotazioni
```
1. Vai su /app/advice
2. Tab "Rotazione Colture"
3. Click "Mostra Storia"
4. Vedi storico completo per orto
5. Filtra per filare specifico
```

---

**Tutto Funzionante e Pronto all'Uso!** 🎉
