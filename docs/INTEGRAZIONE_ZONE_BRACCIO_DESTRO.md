# Integrazione Zone Coltivazione con Sistema "Braccio Destro"

## Stato Attuale

✅ **Sistema Zone Coltivazione COMPLETO:**
- `types/gardenBed.ts` - Tipi definiti
- `components/gardens/BedManager.tsx` - Gestione UI completa
- `logic/spaceCalculator.ts` - Calcolo spazio occupato/disponibile
- `components/shared/GardenBedsWidget.tsx` - Widget dashboard
- Integrazione nel Planner e VisualGardenPlanner
- Storage providers (local e Supabase) implementati

## Opportunità: Memoria Profonda per Zone

Il sistema attuale traccia:
- ✅ Spazio occupato/disponibile per ogni letto
- ✅ Piante associate a ogni letto
- ✅ Dimensioni e posizione letti

**MANCA:** Memoria contestuale profonda per ogni zona!

## Integrazione con MEMORY LAYER

### 1. Estendere `gardenMemoryService.ts` per Zone

Ogni `GardenBed` diventa una **zona con memoria propria**:

```typescript
// In services/gardenMemoryService.ts

/**
 * Salva contesto completo di una piantagione in una zona specifica
 */
export async function saveBedPlantingContext(
  bedId: string,
  bedName: string,
  gardenId: string,
  plantingData: {
    plant: string;
    variety?: string;
    method: 'Seed' | 'Seedling';
    date: Date;
    soilConditions: {
      type: string;
      pH?: number;
      compaction?: number;
    };
  },
  weatherConditions: {
    avgTemp: number;
    rain: number;
    frosts: number;
  }
): Promise<void> {
  // Usa getZoneMemory con bedId come zoneId
  await savePlantingContext(
    bedId,
    bedName,
    gardenId,
    plantingData,
    weatherConditions
  );
}

/**
 * Recupera memoria completa di un letto
 */
export async function getBedMemory(
  bedId: string,
  gardenId: string
): Promise<ZoneMemory | null> {
  return getZoneMemory(bedId, gardenId);
}
```

### 2. Correlazioni per Zona

Il DECISION ENGINE può ora fare correlazioni specifiche per zona:

```typescript
// Esempio: Correlazione tra zona e risultati

"Zona 'Cassone Est' (bedId: abc123):
- Pomodori San Marzano: 3 anni consecutivi
- Anno 2023: Trapianto 20/3 + Gelata 28/3 = -30% resa
- Anno 2024: Trapianto 5/4 = +40% resa
- Pattern: Trapianto dopo 5/4 in questa zona = successo

Suggerimento 2025: Trapianta dopo 5/4 in questa zona"
```

### 3. Alert Proattivi per Zona

Il `proactiveAlertEngine.ts` può generare alert specifici per zona:

```typescript
// In logic/proactiveAlertEngine.ts

async function generateBedSpecificAlerts(
  bed: GardenBed,
  bedMemory: ZoneMemory,
  garden: Garden,
  tasks: GardenTask[],
  currentDate: Date
): Promise<UrgentAlert[]> {
  const alerts: UrgentAlert[] = [];
  
  // Alert basato su storia zona
  const bedTasks = tasks.filter(t => t.bedId === bed.id);
  const currentMonth = currentDate.getMonth() + 1;
  
  // Controlla problemi ricorrenti in questa zona
  const recurringProblems = bedMemory.patterns.recurringProblems.filter(
    p => p.months.includes(currentMonth)
  );
  
  if (recurringProblems.length > 0) {
    alerts.push({
      type: 'Planning',
      message: `⚠️ ZONA "${bed.name}": ${recurringProblems[0].problem} ricorrente questo mese`,
      action: `Considera trattamento preventivo o varietà resistenti`,
      bedId: bed.id, // Nuovo campo per identificare zona
      proactiveContext: {
        historicalPattern: `Problema osservato ${recurringProblems[0].frequency} volte in questa zona`,
        confidence: Math.min(0.8, recurringProblems[0].frequency / 5),
      },
    });
  }
  
  // Alert spazio disponibile
  const spaceCalc = calculateBedSpace(bed, tasks, masterSheets);
  if (spaceCalc.occupancyPercentage > 90) {
    alerts.push({
      type: 'Planning',
      message: `📦 ZONA "${bed.name}": Spazio quasi esaurito (${spaceCalc.occupancyPercentage.toFixed(0)}%)`,
      action: `Considera di trapiantare in altra zona o diradare piante`,
      bedId: bed.id,
    });
  }
  
  return alerts;
}
```

### 4. Pattern Recognition per Zona

Il `patternRecognitionEngine.ts` può riconoscere pattern specifici per zona:

```typescript
// Esempio pattern riconosciuto:

"Zona 'Cassone Sud':
- Temperatura media marzo: +2°C vs storico
- Ultime 3 stagioni: Gelate tardive fino a metà aprile
- Trapianti prima del 10 aprile: 80% fallimento
- Trapianti dopo il 10 aprile: 95% successo

Pattern locale: Aspetta dopo 10 aprile per trapianti in questa zona"
```

### 5. Decision Engine con Contesto Zona

Il DECISION ENGINE può prendere decisioni considerando la zona:

```typescript
// In logic/decisionEngine.ts (da creare)

export interface BedDecisionContext {
  bed: GardenBed;
  bedMemory: ZoneMemory;
  spaceCalculation: SpaceCalculation;
  activeTasks: GardenTask[];
  weatherForecast: WeatherForecast[];
}

export function makeBedDecision(
  context: BedDecisionContext,
  userProfile: UserProfile
): Decision[] {
  const decisions: Decision[] = [];
  
  // Decisione 1: Timing trapianto basato su storia zona
  const bestPlantingDate = bedMemory.patterns.bestPlantingDate;
  if (bestPlantingDate) {
    const daysUntilBest = Math.floor(
      (bestPlantingDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilBest >= 0 && daysUntilBest <= 7) {
      decisions.push({
        type: 'suggestion',
        priority: 'high',
        timing: daysUntilBest <= 3 ? 'now' : 'this_week',
        message: `Zona "${bed.name}": Data migliore storica tra ${daysUntilBest} giorni`,
        action: `Considera di pianificare piantagioni per ${bestPlantingDate.toLocaleDateString('it-IT')}`,
        confidence: 0.85,
        reasoning: `Basato su ${bedMemory.plantingHistory.length} piantagioni precedenti in questa zona`,
        sources: ['MemoryLayer', 'PatternRecognition'],
        bedId: bed.id, // Identifica zona
      });
    }
  }
  
  // Decisione 2: Spazio disponibile
  if (context.spaceCalculation.occupancyPercentage > 80) {
    decisions.push({
      type: 'alert',
      priority: 'medium',
      timing: 'this_week',
      message: `Zona "${bed.name}": ${context.spaceCalculation.occupancyPercentage.toFixed(0)}% occupata`,
      action: `Spazio disponibile: ${context.spaceCalculation.availableArea.toFixed(2)} m²`,
      confidence: 1.0,
      reasoning: `Calcolo basato su piante attive nella zona`,
      sources: ['SpaceCalculator'],
      bedId: bed.id,
    });
  }
  
  return decisions;
}
```

## Schema Database Esteso

### Tabella `bed_memory` (nuova)

```sql
CREATE TABLE bed_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bed_id UUID REFERENCES garden_beds(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  
  -- Storia piantagioni
  planting_history JSONB NOT NULL DEFAULT '[]',
  
  -- Pattern riconosciuti
  patterns JSONB NOT NULL DEFAULT '{
    "bestPlantingDate": null,
    "worstPlantingDate": null,
    "recurringProblems": [],
    "successfulTreatments": []
  }',
  
  -- Correlazioni scoperte
  correlations JSONB NOT NULL DEFAULT '[]',
  
  -- Metadati
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(bed_id)
);

CREATE INDEX idx_bed_memory_bed_id ON bed_memory(bed_id);
CREATE INDEX idx_bed_memory_garden_id ON bed_memory(garden_id);
```

## Flusso Integrato

```
┌─────────────────────────────────────────────────────────┐
│              DECISION ENGINE                            │
│                                                         │
│  Per ogni GardenBed:                                    │
│  1. Carica bedMemory (da Supabase)                     │
│  2. Carica spaceCalculation                             │
│  3. Carica activeTasks per questa zona                  │
│  4. Carica weatherForecast                              │
│  5. Analizza pattern e correlazioni                   │
│  6. Genera decisioni specifiche per zona               │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│         COMMUNICATION LAYER                             │
│                                                         │
│  Formatta messaggi con contesto zona:                  │
│  "Zona 'Cassone Est': [messaggio]"                     │
│                                                         │
│  Adatta tono in base a:                                │
│  - Esperienza utente                                   │
│  - Storia zona (nuova vs consolidata)                  │
└─────────────────────────────────────────────────────────┘
```

## Esempi di Interventi Proattivi per Zona

### Esempio 1: Memoria Pluriennale

```
"Zona 'Cassone Nord':
- 2022: Pomodori San Marzano, trapianto 15/3, resa 8kg/m²
- 2023: Pomodori San Marzano, trapianto 20/3, gelata 28/3, resa 5kg/m² (-37%)
- 2024: Pomodori San Marzano, trapianto 5/4, resa 11kg/m² (+37%)

Pattern riconosciuto: Trapianto dopo 5/4 in questa zona = successo

Suggerimento 2025: Pianifica trapianto pomodori San Marzano 
in questa zona dopo il 5 aprile."
```

### Esempio 2: Correlazione Multi-Fattore

```
"Zona 'Letto Sud':
- Terreno argilloso
- 5h sole/giorno
- Anno scorso: Peronospora a fine giugno
- Trattamento con rame il 25/6 (tardi)

Correlazione trovata:
- Umidità >80% per 3 giorni + temperatura 18-22°C = peronospora
- Trattamento preventivo 1 settimana prima = efficace

Alert proattivo: 
'Condizioni simili all'anno scorso previste per il 20/6.
Tratta con rame il 15/6 in questa zona per prevenire peronospora.'"
```

### Esempio 3: Spazio e Rotazione

```
"Zona 'Cassone Est':
- 2022: Pomodori (Solanaceae)
- 2023: Pomodori (Solanaceae) - Problemi nematodi
- 2024: Pomodori (Solanaceae) - Resa -30%

Rotazione violata: 3 anni consecutivi stessa famiglia

Suggerimento:
'Questa zona ha bisogno di rotazione. 
Piano suggerito:
- 2025: Fave (leguminose, fissano azoto)
- 2026: Zucchine (cucurbitacee)
- 2027: Pomodori tornano qui

Spazio disponibile: 2.5 m² (sufficiente per fave)'"
```

## Prossimi Passi

1. **Fase 1:** Estendere `gardenMemoryService.ts` con funzioni per `GardenBed`
2. **Fase 2:** Creare tabella `bed_memory` in Supabase
3. **Fase 3:** Integrare `proactiveAlertEngine.ts` con zone
4. **Fase 4:** Estendere `decisionEngine.ts` (quando creato) per considerare zone
5. **Fase 5:** Aggiornare UI per mostrare memoria zona nel BedManager

## Benefici

✅ **Memoria contestuale profonda** per ogni zona
✅ **Pattern recognition locale** specifico per zona
✅ **Alert proattivi** basati su storia zona
✅ **Correlazioni** tra fattori specifici della zona
✅ **Rotazioni intelligenti** basate su storia zona
✅ **Timing ottimale** per ogni zona specifica

Ogni zona diventa un'entità con la sua storia, pattern e personalità!


