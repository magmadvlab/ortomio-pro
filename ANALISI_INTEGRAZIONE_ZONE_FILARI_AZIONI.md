# Analisi Integrazione Zone/Filari/Piante nelle Azioni

**Data**: 15 Gennaio 2026  
**Domanda Utente**: "Ogni azione permette di selezionare singola pianta, filare, porzione e differenziare tra i vari orti?"

---

## 🎯 Risposta Breve

**PARZIALMENTE SÌ** - Il sistema è implementato ma **NON tutte le azioni lo usano ancora**.

### ✅ Cosa Funziona
- Sistema zone/filari/porzioni **completamente implementato** nel database
- `LocationSelector` component **funzionante**
- Alcune azioni **già integrate** (irrigazione, trattamenti, planner)

### ❌ Cosa Manca
- **Molte azioni NON hanno ancora LocationSelector**
- Pagine nuove (Frutteto/Vigneto/Oliveto) **non hanno selezione location**
- Piante individuali **non collegate a zone/filari**

---

## 📊 Stato Attuale per Azione

### ✅ AZIONI CON LOCATION SELECTOR (Funzionanti)

| Azione | Location Selector | Zone | Filari | Porzioni | Piante Singole |
|--------|-------------------|------|--------|----------|----------------|
| **Irrigazione** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Trattamenti** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Planner Classico** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Rotazione Colture** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Lavori Meccanici** | ✅ | ✅ | ✅ | ✅ | ❌ |

**Componenti Usati**:
- `components/irrigation/WateringLogFormWithFieldRows.tsx` ✅
- `components/actions/InterventionWizard.tsx` ✅
- `components/planner/ClassicPlannerWithRotation.tsx` ✅
- `components/shared/LocationSelector.tsx` ✅

---

### ⚠️ AZIONI PARZIALI (Implementate ma senza UI completa)

| Azione | Location Selector | Zone | Filari | Porzioni | Piante Singole |
|--------|-------------------|------|--------|----------|----------------|
| **Nutrizione** | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ |
| **Certificazioni** | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ |
| **Diario Operativo** | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ |

**Problema**: Database supporta location tracking ma UI non mostra selector.

---

### ❌ AZIONI SENZA LOCATION (Da Implementare)

| Azione | Location Selector | Zone | Filari | Porzioni | Piante Singole |
|--------|-------------------|------|--------|----------|----------------|
| **Frutteto** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Vigneto** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Oliveto** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **AI Predictions** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Analytics** | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ |

**Problema**: Pagine appena create non hanno integrazione location.

---

### 🌳 PIANTE INDIVIDUALI (Sistema Separato)

| Funzionalità | Implementato | Collegato a Zone/Filari |
|--------------|--------------|-------------------------|
| **Tracciamento Piante** | ✅ | ⚠️ Parziale |
| **Health Score** | ✅ | ❌ |
| **Operazioni su Pianta** | ✅ | ❌ |
| **Heatmap Salute** | ✅ | ❌ |
| **Bulk Operations** | ✅ | ⚠️ Per filare |

**Componente**: `components/plants/SmartPlantManager.tsx`

**Problema**: Sistema piante individuali esiste ma è **parallelo** al sistema zone/filari, non integrato.

---

## 🔍 Analisi Dettagliata per Categoria

### 1. IRRIGAZIONE ✅ (Completamente Integrato)

**File**: `components/irrigation/WateringLogFormWithFieldRows.tsx`

**Funzionalità**:
```typescript
// ✅ Selezione location completa
<LocationSelector
  garden={garden}
  onLocationChange={(location) => {
    // location contiene: zoneId, fieldRowId, sectionId
    setSelectedLocation(location)
  }}
/>

// ✅ Salvataggio con location
await supabase.from('watering_logs').insert({
  garden_id: garden.id,
  zone_id: location.zoneId,
  field_row_id: location.fieldRowId,
  field_row_section_id: location.sectionId,
  water_amount_liters: 100,
  duration_minutes: 30
})
```

**Cosa Puoi Fare**:
- ✅ Irrigare tutto l'orto
- ✅ Irrigare una zona specifica
- ✅ Irrigare un filare specifico
- ✅ Irrigare una porzione di filare (es: 0-33m)
- ❌ Irrigare una singola pianta

---

### 2. TRATTAMENTI ✅ (Completamente Integrato)

**File**: `components/actions/InterventionWizard.tsx`

**Funzionalità**:
```typescript
// ✅ Selezione location nel wizard
<InterventionWizard
  garden={garden}
  actionType="treatment"
  onInterventionCreated={(intervention) => {
    // intervention contiene zone_id, field_row_id, section_id
  }}
/>

// ✅ Salvataggio con location
await supabase.from('treatment_register').insert({
  garden_id: garden.id,
  zone_id: location.zoneId,
  field_row_id: location.fieldRowId,
  field_row_section_id: location.sectionId,
  product_name: 'Rame',
  dosage: '2g/L'
})
```

**Cosa Puoi Fare**:
- ✅ Trattare tutto l'orto
- ✅ Trattare una zona specifica
- ✅ Trattare un filare specifico
- ✅ Trattare una porzione di filare
- ❌ Trattare una singola pianta

---

### 3. PLANNER CLASSICO ✅ (Con Rotazione Integrata)

**File**: `components/planner/ClassicPlannerWithRotation.tsx`

**Funzionalità**:
```typescript
// ✅ Selezione filare per pianificazione
<LocationSelector
  garden={garden}
  levelFilter="field_row" // Solo filari
  onLocationChange={(location) => {
    // Carica storico rotazione per questo filare
    loadRotationHistory(location.fieldRowId)
  }}
/>

// ✅ Calcolo score compatibilità
const rotationScore = calculateRotationScore(
  previousCrop,
  newCrop,
  fieldRowId
)

// ✅ Salvataggio con location
await supabase.from('planting_plans').insert({
  garden_id: garden.id,
  field_row_id: location.fieldRowId,
  crop_name: 'Pomodoro',
  rotation_score: 85,
  previous_crop: 'Lattuga'
})
```

**Cosa Puoi Fare**:
- ✅ Pianificare per filare specifico
- ✅ Vedere storico rotazione per filare
- ✅ Score compatibilità automatico (0-100)
- ✅ Warnings per rotazioni sconsigliate
- ❌ Pianificare per singola pianta

---

### 4. FRUTTETO/VIGNETO/OLIVETO ❌ (NON Integrato)

**File**: `app/app/orchard/page.tsx`, `vineyard/page.tsx`, `olives/page.tsx`

**Problema**: Pagine appena create mostrano solo lista piante, **nessuna selezione location**.

**Cosa Manca**:
```typescript
// ❌ NON c'è LocationSelector
// ❌ NON si può selezionare zona/filare
// ❌ NON si può registrare operazione su location specifica
// ❌ NON si può vedere storico per filare

// Esempio cosa dovrebbe esserci:
<LocationSelector
  garden={garden}
  onLocationChange={(location) => {
    // Filtra alberi/viti/olivi per location
    filterPlantsByLocation(location)
  }}
/>

// Registra potatura su filare specifico
<button onClick={() => {
  registerPruning({
    field_row_id: selectedLocation.fieldRowId,
    tree_id: selectedTree.id,
    pruning_type: 'winter',
    date: new Date()
  })
}}>
  Registra Potatura
</button>
```

---

### 5. PIANTE INDIVIDUALI ⚠️ (Sistema Parallelo)

**File**: `components/plants/SmartPlantManager.tsx`

**Stato Attuale**:
```typescript
// ✅ Sistema piante individuali esiste
interface GardenPlant {
  id: string
  garden_id: string
  plant_name: string
  position_number: number
  health_score: number
  // ⚠️ HA campi per location ma non sempre usati
  field_row_id?: string
  field_row_section_id?: string
}

// ⚠️ Può filtrare per filare
const plantsInRow = plants.filter(p => 
  p.field_row_id === selectedRowId
)

// ❌ Ma NON c'è UI per selezionare location
// ❌ NON c'è integrazione visuale con zone/filari
```

**Cosa Manca**:
- ❌ LocationSelector nel SmartPlantManager
- ❌ Visualizzazione piante per zona/filare
- ❌ Heatmap salute per filare
- ❌ Operazioni bulk per location

---

## 🎯 Piano di Integrazione Completa

### FASE 2A: Integrare Location nelle Pagine Esistenti (2-3 ore)

#### 1. Frutteto/Vigneto/Oliveto
```typescript
// Aggiungere LocationSelector
<LocationSelector
  garden={garden}
  onLocationChange={(location) => {
    setSelectedLocation(location)
    filterTreesByLocation(location)
  }}
/>

// Mostrare alberi/viti/olivi per location
{selectedLocation && (
  <div>
    <h3>{selectedLocation.fullLocationName}</h3>
    <TreeList trees={filteredTrees} />
  </div>
)}

// Registrare operazioni con location
<button onClick={() => registerOperation({
  field_row_id: selectedLocation.fieldRowId,
  operation_type: 'pruning',
  tree_id: selectedTree.id
})}>
  Registra Operazione
</button>
```

#### 2. Nutrizione
```typescript
// Aggiungere LocationSelector nel form
<NutritionForm>
  <LocationSelector
    garden={garden}
    onLocationChange={(location) => {
      setTargetLocation(location)
    }}
  />
  <ProductSelector />
  <DosageCalculator location={targetLocation} />
</NutritionForm>
```

#### 3. AI Predictions
```typescript
// Filtrare predizioni per location
<LocationSelector
  garden={garden}
  onLocationChange={(location) => {
    loadPredictionsForLocation(location)
  }}
/>

<DiseasePredictions location={selectedLocation} />
<YieldPredictions location={selectedLocation} />
```

---

### FASE 2B: Integrare Piante Individuali con Zone/Filari (3-4 ore)

#### 1. SmartPlantManager con Location
```typescript
// Aggiungere LocationSelector
<SmartPlantManager garden={garden}>
  <LocationSelector
    garden={garden}
    onLocationChange={(location) => {
      filterPlantsByLocation(location)
      updateHeatmapForLocation(location)
    }}
  />
  
  {/* Visualizzazione per location */}
  <PlantGrid 
    plants={filteredPlants}
    groupBy="field_row"
  />
  
  {/* Heatmap per filare */}
  <PlantHealthHeatmap
    plants={filteredPlants}
    fieldRowId={selectedLocation.fieldRowId}
  />
</SmartPlantManager>
```

#### 2. Operazioni su Pianta con Location
```typescript
// Registrare operazione su pianta specifica
<PlantOperationForm
  plant={selectedPlant}
  location={{
    field_row_id: plant.field_row_id,
    field_row_section_id: plant.field_row_section_id
  }}
  onOperationSaved={(operation) => {
    // operation contiene plant_id + location
  }}
/>
```

---

### FASE 2C: Analytics per Location (2-3 ore)

#### 1. Dashboard Analytics con Filtri Location
```typescript
<AnalyticsDashboard garden={garden}>
  <LocationSelector
    garden={garden}
    onLocationChange={(location) => {
      loadAnalyticsForLocation(location)
    }}
  />
  
  {/* Metriche per location */}
  <MetricsGrid location={selectedLocation}>
    <WaterUsageChart />
    <TreatmentFrequencyChart />
    <YieldComparisonChart />
    <HealthScoreChart />
  </MetricsGrid>
  
  {/* Confronto tra filari */}
  <FieldRowComparison
    rows={garden.field_rows}
    metrics={['water_usage', 'yield', 'health']}
  />
</AnalyticsDashboard>
```

---

## 📋 Checklist Integrazione Completa

### Database ✅
- [x] Tabelle zone/filari/porzioni create
- [x] Location tracking su tutte le operazioni
- [x] RLS policies configurate
- [x] Indexes ottimizzati

### Componenti Base ✅
- [x] LocationSelector component
- [x] InterventionWizard con location
- [x] ClassicPlanner con rotazione

### Azioni Integrate ✅
- [x] Irrigazione
- [x] Trattamenti
- [x] Planner Classico
- [x] Rotazione Colture
- [x] Lavori Meccanici

### Azioni da Integrare ❌
- [ ] Frutteto (aggiungere LocationSelector)
- [ ] Vigneto (aggiungere LocationSelector)
- [ ] Oliveto (aggiungere LocationSelector)
- [ ] Nutrizione (completare integrazione)
- [ ] AI Predictions (filtrare per location)
- [ ] Diario (mostrare location negli eventi)
- [ ] Certificazioni (report per location)

### Piante Individuali ⚠️
- [x] Sistema base implementato
- [ ] LocationSelector in SmartPlantManager
- [ ] Visualizzazione per filare
- [ ] Heatmap per location
- [ ] Operazioni bulk per location

### Analytics ❌
- [ ] Filtri per location
- [ ] Metriche per zona/filare
- [ ] Confronto tra filari
- [ ] Report per location

---

## 🚀 Priorità Implementazione

### ALTA (Fare Subito)
1. **Frutteto/Vigneto/Oliveto** - Aggiungere LocationSelector (1 ora)
2. **SmartPlantManager** - Integrare con zone/filari (2 ore)
3. **Nutrizione** - Completare integrazione location (1 ora)

### MEDIA (Fare Dopo)
4. **AI Predictions** - Filtrare per location (1 ora)
5. **Diario** - Mostrare location negli eventi (1 ora)
6. **Analytics** - Dashboard per location (2-3 ore)

### BASSA (Opzionale)
7. **Certificazioni** - Report per location
8. **Mappa Visuale** - Visualizzazione zone/filari
9. **Timeline** - Operazioni per filare

---

## 💡 Risposta alla Domanda Utente

### "Ogni azione permette di selezionare singola pianta, filare, porzione e differenziare tra i vari orti?"

**Risposta Dettagliata**:

✅ **Differenziare tra orti**: SÌ - Ogni azione è sempre legata a un garden_id specifico

✅ **Selezionare zona**: SÌ - Irrigazione, Trattamenti, Planner hanno LocationSelector

✅ **Selezionare filare**: SÌ - Irrigazione, Trattamenti, Planner hanno LocationSelector

✅ **Selezionare porzione**: SÌ - Irrigazione, Trattamenti, Planner hanno LocationSelector

⚠️ **Selezionare singola pianta**: PARZIALE - Sistema esiste ma non integrato ovunque

❌ **Tutte le azioni**: NO - Frutteto/Vigneto/Oliveto/AI Predictions non hanno ancora LocationSelector

---

## 🎯 Prossimo Step Consigliato

**Implementare FASE 2A** (2-3 ore):
1. Aggiungere LocationSelector a Frutteto/Vigneto/Oliveto
2. Filtrare alberi/viti/olivi per location
3. Registrare operazioni con location

Vuoi che proceda con questa implementazione?
