# Analisi Approfondita Ciclo di Vita: Colture Specializzate

## Data: 2026-02-13

---

## 1. METODOLOGIA ANALISI

Per ogni tipo di coltivazione, analizziamo 7 fasi del ciclo di vita:

1. **Creazione**: Come viene creato l'orto
2. **Gestione**: Operazioni quotidiane
3. **Monitoraggio**: Raccolta parametri
4. **Registrazione**: Come vengono salvati i dati
5. **Analisi Predittiva**: Algoritmi e previsioni
6. **Suggerimenti Proattivi**: Come vengono generati
7. **Riutilizzo Dati**: Learning e miglioramento

---

## 2. IDROPONICA - ANALISI COMPLETA

### FASE 1: CREAZIONE

#### Stato Attuale: ❌ NON ACCESSIBILE DA UI

**Cosa Esiste**:
- ✅ Types completi: `HydroponicSystemConfig`
- ✅ Form configurazione: `HydroponicConfigForm.tsx`
- ✅ Database: campo `hydroponic_config` in `gardens`
- ✅ Storage methods: `createGarden()` supporta config

**Cosa Manca**:
- ❌ Opzione nel `GardenTypeWizard`
- ❌ Flusso guidato per scegliere tipo sistema
- ❌ Validazioni specifiche per ogni tipo
- ❌ Template pre-configurati per principianti

**Come Dovrebbe Funzionare**:
```
User → GardenTypeWizard 
     → Seleziona "Idroponica"
     → Sceglie tipo (NFT/DWC/etc)
     → Vede descrizione + vantaggi + difficoltà
     → Compila HydroponicConfigForm
     → Sistema salva in gardens.hydroponic_config
     → Redirect a dashboard idroponico
```

### FASE 2: GESTIONE QUOTIDIANA

#### Stato Attuale: ⚠️ PARZIALMENTE IMPLEMENTATO

**Operazioni Disponibili**:
- ✅ Registrazione letture (pH, EC, temp)
- ✅ Form: `ReadingForm.tsx`
- ❌ Cambio soluzione nutritiva (non implementato)
- ❌ Pulizia sistema (non implementato)
- ❌ Manutenzione pompe (non implementato)

**Dove Mancano UI**:
- ❌ Nessun dashboard dedicato
- ❌ Nessuna checklist operazioni
- ❌ Nessun calendario manutenzione

**Come Dovrebbe Funzionare**:
```
User → Dashboard Idroponico
     → Vede: Parametri attuali, Alert, Prossime operazioni
     → Può: Registrare lettura, Segnare operazione completata
     → Riceve: Promemoria automatici (es. "Cambia soluzione tra 3 giorni")
```

### FASE 3: MONITORAGGIO

#### Stato Attuale: ✅ IMPLEMENTATO MA NON VISIBILE

**Parametri Monitorati**:
- ✅ pH (range ottimale: 5.5-6.5)
- ✅ EC (conducibilità elettrica)
- ✅ Temperatura acqua
- ✅ Volume serbatoio
- ✅ Note testuali

**Storage**:
- ✅ Tabella: `hydroponic_readings`
- ✅ Methods: `getHydroponicReadings()`, `createHydroponicReading()`

**Cosa Manca**:
- ❌ Visualizzazione grafici trend
- ❌ Alert automatici se fuori range
- ❌ Confronto con valori ottimali
- ❌ Export dati

**Come Dovrebbe Funzionare**:
```
User → Dashboard → Sezione "Parametri"
     → Vede grafici ultimi 30 giorni
     → Alert rosso se pH < 5.5 o > 6.5
     → Suggerimento: "Aggiungi pH Down 5ml"
     → Può esportare CSV per analisi esterna
```

### FASE 4: REGISTRAZIONE DATI

#### Stato Attuale: ✅ IMPLEMENTATO

**Tipi di Dati Registrati**:
1. **Letture Parametri**: Via `ReadingForm`
2. **Task Idroponici**: Via `garden_tasks.hydroponic_data`
3. **Raccolti**: Via `harvest_logs` (standard)

**Struttura Dati**:
```typescript
// hydroponic_readings table
{
  id: uuid,
  garden_id: uuid,
  reading_date: timestamp,
  ph: numeric,
  ec: numeric,
  water_temp: numeric,
  reservoir_volume: numeric,
  notes: text
}

// garden_tasks.hydroponic_data (JSONB)
{
  systemType: 'NFT' | 'DWC' | ...,
  operationType: 'SolutionChange' | 'Cleaning' | ...,
  parameters: { ... }
}
```

**Validazioni Esistenti**:
- ✅ pH: 0-14
- ✅ EC: > 0
- ✅ Temp: > 0
- ❌ Mancano validazioni specifiche per tipo sistema

### FASE 5: ANALISI PREDITTIVA

#### Stato Attuale: ❌ NON IMPLEMENTATO

**Algoritmi Potenziali**:
1. **Previsione Consumo Nutrienti**:
   - Input: Storico EC, numero piante, tipo piante
   - Output: "Soluzione durerà altri 5 giorni"

2. **Identificazione Pattern Problemi**:
   - Input: Storico pH instabile
   - Output: "pH scende ogni 3 giorni → Aumenta buffer"

3. **Ottimizzazione Parametri**:
   - Input: Rese raccolti + parametri usati
   - Output: "Migliori risultati con EC 1.8 invece di 1.5"

**Dove Implementare**:
- Nuovo service: `services/hydroponicPredictiveEngine.ts`
- Integrazione con Director: `logic/hydroponicDirector.ts`

**Dati Necessari**:
- ✅ Storico letture (già disponibile)
- ✅ Raccolti (già disponibile)
- ❌ Correlazione letture ↔ raccolti (da implementare)

### FASE 6: SUGGERIMENTI PROATTIVI

#### Stato Attuale: ❌ NON IMPLEMENTATO

**Director/Orchestrator**:
- ✅ Esiste: `logic/director.ts`
- ❌ Non gestisce idroponica

**Suggerimenti Potenziali**:
1. **Manutenzione Preventiva**:
   - "Ultima pulizia sistema: 15 giorni fa → Pulisci entro 3 giorni"

2. **Correzioni Parametri**:
   - "pH 7.2 (alto) → Aggiungi 10ml pH Down"
   - "EC 0.8 (basso) → Aggiungi nutrienti"

3. **Ottimizzazione**:
   - "Piante simili hanno reso meglio con EC 1.6 → Prova ad aumentare"

**Come Implementare**:
```typescript
// logic/hydroponicDirector.ts
export function generateHydroponicSuggestions(
  garden: Garden,
  readings: HydroponicReading[],
  tasks: GardenTask[]
): UrgentAlert[] {
  const suggestions: UrgentAlert[] = [];
  
  // Check pH
  const latestReading = readings[0];
  if (latestReading.ph < 5.5) {
    suggestions.push({
      type: 'Safety',
      message: 'pH troppo basso',
      action: 'Aggiungi pH Up',
      timing: 'now'
    });
  }
  
  // Check maintenance
  const lastCleaning = tasks.find(t => 
    t.hydroponicData?.operationType === 'Cleaning'
  );
  if (daysSince(lastCleaning) > 14) {
    suggestions.push({
      type: 'Planning',
      message: 'Pulizia sistema necessaria',
      action: 'Pulisci sistema entro 3 giorni',
      timing: 'this_week'
    });
  }
  
  return suggestions;
}
```

### FASE 7: RIUTILIZZO DATI E LEARNING

#### Stato Attuale: ❌ NON IMPLEMENTATO

**Learning Potenziale**:
1. **Parametri Ottimali per Orto Specifico**:
   - Traccia: pH/EC/Temp → Resa
   - Impara: "Nel tuo orto, EC 1.7 dà +15% resa"

2. **Pattern Stagionali**:
   - Traccia: Consumo nutrienti per stagione
   - Impara: "In estate consumi +30% nutrienti"

3. **Varietà Migliori**:
   - Traccia: Performance varietà in idroponica
   - Impara: "Lattuga Romana rende meglio di Iceberg nel tuo sistema"

**Implementazione**:
```typescript
// services/hydroponicLearningEngine.ts
export class HydroponicLearningEngine {
  async analyzeOptimalParameters(gardenId: string) {
    // 1. Get all readings
    const readings = await getHydroponicReadings(gardenId);
    
    // 2. Get all harvests
    const harvests = await getHarvestLogs(gardenId);
    
    // 3. Correlate readings → harvests
    const correlations = this.correlateReadingsToHarvests(
      readings, 
      harvests
    );
    
    // 4. Find optimal ranges
    const optimal = this.findOptimalRanges(correlations);
    
    // 5. Return insights
    return {
      optimalPH: optimal.ph,
      optimalEC: optimal.ec,
      confidence: optimal.confidence,
      basedOnHarvests: harvests.length
    };
  }
}
```

---

## 3. FRAGOLE - ANALISI COMPLETA

### FASE 1: CREAZIONE

#### Stato Attuale: ⚠️ PARZIALMENTE ACCESSIBILE

**Cosa Esiste**:
- ✅ Master sheets: 14 varietà in `strawberryMasterSheets.ts`
- ✅ Types: `StrawberryCrop` completo
- ✅ Component: `StrawberryManagement.tsx`
- ❌ Non visibile in menu principale

**Varietà Disponibili**:
1. Fragola di Bosco (rustica)
2. Elsanta (commerciale)
3. Albion (day-neutral, produzione continua)
4. Seascape (ever-bearing)
5. **Candonga** (Basilicata, esportazione) 🌟
6. **Matera** (Basilicata, esportazione) 🌟
7. Sabrina, Alba, Clery, Eliany, Florence, Gariguette, Malga, Roxana

**Dati Disponibili per Varietà**:
- Tipo: June-bearing / Day-neutral / Ever-bearing
- Sistema impianto: Matted Row / Spaced Row / Hill System
- Gestione stoloni: Remove / Keep for propagation
- Pacciamatura: Straw / Plastic / Organic
- Finestra raccolta: mese inizio → mese fine
- Rinnovo impianto: required / not required
- Istruzioni dettagliate: semina, trapianto, cura, errori comuni

**Come Dovrebbe Funzionare**:
```
User → Planner → Categoria "Fragole"
     → Vede 14 varietà con filtri:
        - Tipo produzione (June-bearing/Day-neutral/Ever-bearing)
        - Difficoltà (Easy/Medium/Hard)
        - Regione (Basilicata evidenziata)
     → Seleziona varietà
     → Wizard chiede:
        - Quantità piante
        - Sistema impianto (suggerito da master sheet)
        - Data trapianto
     → Sistema crea task con strawberry_data
```

### FASE 2: GESTIONE QUOTIDIANA

#### Stato Attuale: ✅ LOGICA IMPLEMENTATA, ❌ UI LIMITATA

**Operazioni Specifiche Fragole**:
1. **Gestione Stoloni**:
   - ✅ Logic: `strawberryEngine.ts` → `calculateStrawberryTasks()`
   - ✅ Data: `strawberry_data.runnerAction` = 'Remove' | 'Propagate'
   - ⚠️ UI: Solo in `StrawberryManagement.tsx` (non integrato in dashboard)

2. **Pacciamatura**:
   - ✅ Definita in master sheet
   - ❌ Nessun task automatico generato
   - ❌ Nessun promemoria

3. **Rinnovo Impianto** (June-bearing):
   - ✅ Logic: `calculateNextRenovationDate()`
   - ✅ Data: `strawberry_data.renovationCompleted`
   - ⚠️ UI: Alert in `StrawberryManagement.tsx`

4. **Raccolta**:
   - ✅ Finestra definita in master sheet
   - ✅ Check: `isOptimalHarvestTime()`
   - ❌ Nessun promemoria automatico

**Cosa Manca**:
- ❌ Dashboard fragole dedicato
- ❌ Calendario operazioni stagionali
- ❌ Checklist per varietà specifica
- ❌ Integrazione con Director per promemoria

### FASE 3: MONITORAGGIO

#### Stato Attuale: ⚠️ DATI DISPONIBILI, VISUALIZZAZIONE LIMITATA

**Parametri Monitorabili**:
- ✅ Fase crescita (via `garden_tasks.stage`)
- ✅ Quantità piante (via `garden_tasks.quantity`)
- ✅ Operazioni completate (via `garden_tasks.completed`)
- ❌ Salute piante (non tracciato)
- ❌ Dimensione frutti (non tracciato durante crescita)

**Dati Raccolto**:
- ✅ Quantità (kg/g/units)
- ✅ Qualità (rating 1-5)
- ✅ Brix (dolcezza)
- ✅ Dati specifici: `strawberry_harvest`
  ```typescript
  {
    harvestType: 'FirstFlush' | 'MainHarvest' | 'LateHarvest',
    berrySize: 'Small' | 'Medium' | 'Large',
    qualityNotes: string
  }
  ```

**Visualizzazione**:
- ⚠️ `StrawberryManagement.tsx` mostra alcuni dati
- ❌ Nessun grafico trend
- ❌ Nessun confronto varietà
- ❌ Nessun KPI dashboard

### FASE 4: REGISTRAZIONE DATI

#### Stato Attuale: ✅ STRUTTURA COMPLETA

**Database Schema**:
```sql
-- garden_tasks
strawberry_data JSONB {
  varietyType: 'June-bearing' | 'Day-neutral' | 'Ever-bearing',
  plantingSystem: 'Matted Row' | 'Spaced Row' | 'Hill System',
  runnerAction: 'Remove' | 'Propagate' | null,
  mulchingType: 'Straw' | 'Plastic' | 'Organic',
  renovationCompleted: boolean,
  lastRenovationDate: ISO string
}

-- harvest_logs
strawberry_harvest JSONB {
  harvestType: 'FirstFlush' | 'MainHarvest' | 'LateHarvest',
  berrySize: 'Small' | 'Medium' | 'Large',
  qualityNotes: string
}
```

**Forms Esistenti**:
- ✅ Task creation (standard)
- ✅ Harvest logging (standard + strawberry_harvest)
- ❌ Form dedicato operazioni fragole (manca)

### FASE 5: ANALISI PREDITTIVA

#### Stato Attuale: ❌ NON IMPLEMENTATO

**Algoritmi Potenziali**:
1. **Previsione Resa**:
   - Input: Varietà, numero piante, storico raccolti
   - Output: "Stima 15kg per questa stagione"

2. **Finestra Raccolta Ottimale**:
   - Input: Storico raccolti, meteo, varietà
   - Output: "Inizia raccolta tra 5 giorni per qualità ottimale"

3. **Performance Varietà**:
   - Input: Raccolti multipli anni, varietà diverse
   - Output: "Albion rende +20% rispetto a Elsanta nel tuo orto"

**Dati Disponibili**:
- ✅ Master sheets con finestre teoriche
- ✅ Storico raccolti reali
- ✅ Dati qualità (brix, size, rating)
- ❌ Correlazione con meteo (da implementare)
- ❌ Correlazione con operazioni (da implementare)

### FASE 6: SUGGERIMENTI PROATTIVI

#### Stato Attuale: ❌ NON IMPLEMENTATO

**Suggerimenti Potenziali**:
1. **Operazioni Stagionali**:
   - "Varietà June-bearing → Rimuovi stoloni a giugno"
   - "Tempo di rinnovo impianto (luglio)"
   - "Applica pacciamatura prima fioritura"

2. **Ottimizzazione Raccolta**:
   - "Raccogli ogni 2-3 giorni per qualità ottimale"
   - "Brix medio 8.5 → Aspetta 2 giorni per dolcezza migliore"

3. **Gestione Varietà**:
   - "Albion produce fino a ottobre → Continua raccolta"
   - "Seascape ha due picchi → Aspettati seconda ondata a settembre"

**Integrazione Director**:
```typescript
// logic/strawberryDirector.ts
export function generateStrawberrySuggestions(
  tasks: GardenTask[],
  harvests: HarvestLog[],
  masterSheet: StrawberryCrop
): UrgentAlert[] {
  const suggestions: UrgentAlert[] = [];
  
  // Check runner management
  if (masterSheet.runnerManagement.removeRunners) {
    const currentMonth = new Date().getMonth() + 1;
    if (currentMonth >= 5 && currentMonth <= 7) {
      suggestions.push({
        type: 'Planning',
        message: 'Gestione stoloni necessaria',
        action: 'Rimuovi stoloni per concentrare energia su frutti',
        timing: 'this_week'
      });
    }
  }
  
  // Check renovation (June-bearing only)
  if (masterSheet.renovationRequired && 
      masterSheet.varietyType === 'June-bearing') {
    const lastRenovation = tasks.find(t => 
      t.strawberryData?.renovationCompleted
    );
    if (!lastRenovation || yearsSince(lastRenovation) >= 1) {
      suggestions.push({
        type: 'Planning',
        message: 'Rinnovo impianto necessario',
        action: 'Rinnova impianto dopo raccolta',
        timing: 'this_week'
      });
    }
  }
  
  return suggestions;
}
```

### FASE 7: RIUTILIZZO DATI E LEARNING

#### Stato Attuale: ❌ NON IMPLEMENTATO

**Learning Potenziale**:
1. **Varietà Migliori per Orto**:
   - Traccia: Resa per varietà, qualità, facilità gestione
   - Impara: "Albion è la tua varietà top: +25% resa, qualità 4.5/5"

2. **Timing Ottimale Operazioni**:
   - Traccia: Date operazioni → Risultati
   - Impara: "Trapianto a settembre dà +15% resa vs marzo"

3. **Pattern Problemi**:
   - Traccia: Problemi ricorrenti (malattie, parassiti)
   - Impara: "Oidio appare sempre a giugno → Previeni con zolfo a maggio"

4. **Confronto Anno su Anno**:
   - Traccia: Rese, qualità, problemi per anno
   - Impara: "Quest'anno: +10% resa, -20% problemi → Replica strategie"

**Implementazione**:
```typescript
// services/strawberryLearningEngine.ts
export class StrawberryLearningEngine {
  async analyzeVarietyPerformance(gardenId: string) {
    // 1. Get all strawberry tasks
    const tasks = await getTasks(gardenId, { 
      filter: t => t.strawberryData !== null 
    });
    
    // 2. Get all strawberry harvests
    const harvests = await getHarvestLogs(gardenId, {
      filter: h => h.strawberryHarvest !== null
    });
    
    // 3. Group by variety
    const byVariety = this.groupByVariety(tasks, harvests);
    
    // 4. Calculate metrics
    const metrics = byVariety.map(v => ({
      variety: v.name,
      totalYield: sum(v.harvests.map(h => h.quantity)),
      avgQuality: avg(v.harvests.map(h => h.rating)),
      avgBrix: avg(v.harvests.map(h => h.brix)),
      problemsCount: v.tasks.filter(t => t.notes?.includes('problema')).length,
      score: this.calculateScore(v)
    }));
    
    // 5. Rank and return
    return metrics.sort((a, b) => b.score - a.score);
  }
  
  async generateYearOverYearReport(gardenId: string) {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    
    const current = await this.getYearData(gardenId, currentYear);
    const previous = await this.getYearData(gardenId, lastYear);
    
    return {
      yieldChange: ((current.yield - previous.yield) / previous.yield) * 100,
      qualityChange: current.avgQuality - previous.avgQuality,
      insights: this.generateInsights(current, previous),
      recommendations: this.generateRecommendations(current, previous)
    };
  }
}
```

---

## 4. ACQUAPONICA & AEROPONICA

### Analisi Rapida

**Stato**: Simile a Idroponica

- ✅ Types completi
- ✅ Forms configurazione
- ✅ Database tables (`aquaponic_readings`)
- ✅ Storage methods
- ❌ Non accessibili da wizard
- ❌ Nessun dashboard dedicato
- ❌ Nessuna analisi predittiva
- ❌ Nessun suggerimento proattivo

**Parametri Specifici Acquaponica**:
- pH, Ammonia, Nitrite, Nitrate
- Fish count, Fish health
- Plant health

**Parametri Specifici Aeroponica**:
- Misting frequency, Misting duration
- Pressure, Droplet size
- Root health

---

## 5. CONCLUSIONI E RACCOMANDAZIONI

### Gap Principali Identificati

1. **Accessibilità UI**: ❌ CRITICO
   - Nessun modo per utenti di creare orti specializzati
   - Componenti esistono ma non sono collegati

2. **Dashboard e Visualizzazione**: ❌ ALTO
   - Dati vengono salvati ma non visualizzati
   - Nessun grafico, trend, KPI

3. **Analisi Predittiva**: ❌ MEDIO
   - Dati storici disponibili ma non analizzati
   - Nessun algoritmo predittivo implementato

4. **Suggerimenti Proattivi**: ❌ MEDIO
   - Director non gestisce colture specializzate
   - Nessun promemoria automatico

5. **Learning System**: ❌ BASSO
   - Nessun sistema di apprendimento
   - Dati non vengono riutilizzati per migliorare

### Priorità Implementazione

**FASE 1 (CRITICO)**: Accessibilità
- Wizard per creare orti specializzati
- Menu per selezionare fragole
- Dashboard base per visualizzare dati

**FASE 2 (ALTO)**: Gestione Completa
- Operazioni specifiche per tipo
- Calendario e promemoria
- Registrazione dati facilitata

**FASE 3 (MEDIO)**: Intelligenza
- Analisi predittiva base
- Suggerimenti proattivi
- Integrazione Director

**FASE 4 (BASSO)**: Learning
- Sistema apprendimento
- Ottimizzazione automatica
- Report avanzati

### ROI Stimato

**Fase 1**: ALTO
- Sblocca funzionalità già implementate
- Effort basso (1-2 settimane)
- Impatto immediato su adoption

**Fase 2**: MEDIO-ALTO
- Migliora engagement
- Effort medio (3-4 settimane)
- Differenziazione competitiva

**Fase 3**: MEDIO
- Aumenta retention
- Effort medio-alto (5-8 settimane)
- Valore percepito alto

**Fase 4**: BASSO-MEDIO
- Feature premium
- Effort alto (9-12 settimane)
- Monetizzazione potenziale

---

## 6. NEXT STEPS

1. ✅ Analisi completata
2. ⏳ Review con stakeholders
3. ⏳ Prioritizzazione finale
4. ⏳ Creazione tasks dettagliati Fase 1
5. ⏳ Inizio implementazione

---

**Fine Analisi Ciclo di Vita**
