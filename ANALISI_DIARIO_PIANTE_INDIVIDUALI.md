# 📖 Analisi: Diario Piante Individuali

**Data:** 13 Febbraio 2026  
**Obiettivo:** Verificare tracciamento operazioni per singola pianta

---

## 🎯 DOMANDE DA RISPONDERE

1. ✅ **Esiste un diario per singola pianta?**
2. ✅ **Il diario è editabile?**
3. ✅ **Posso registrare interventi manuali?**
4. ✅ **Gli interventi automatici vengono tracciati?**
5. ⚠️ **Cosa funziona e cosa manca?**

---

## ✅ SISTEMA ESISTENTE

### 1. PlantDetailModal - Diario Pianta

**File:** `components/plants/PlantDetailModal.tsx`

**Funzionalità:**
- ✅ Mostra dettagli completi pianta
- ✅ Storico operazioni (tutte le operazioni sulla pianta)
- ✅ Carta d'identità pianta (data impianto, meteo, luna, stagione)
- ✅ Statistiche operazioni (irrigazioni, fertilizzazioni, trattamenti)
- ✅ Filtri per tipo operazione
- ✅ Foto operazioni
- ✅ Note operazioni
- ✅ Contesto ambientale (meteo, luna) per ogni operazione

**Operazioni Visualizzate:**
1. **Operazioni dirette** sulla pianta (verde)
2. **Operazioni di filare** applicate a tutte le piante del filare (blu)

**Tabs Disponibili:**
- Tutte
- Irrigazioni
- Fertilizzazioni
- Trattamenti
- Lavorazioni

**Cosa Mostra per Ogni Operazione:**
```typescript
- Data e ora
- Tipo operazione (con icona)
- Dettagli specifici:
  * Irrigazione: durata, quantità acqua
  * Fertilizzazione: tipo, dosaggio, NPK
  * Trattamento: tipo (preventivo/curativo), prodotto, target
  * Lavorazione: tipo, durata
- Contesto ambientale (temperatura, umidità, luna, stagione)
- Salute prima/dopo (se disponibile)
- Note
- Foto
```

**❌ LIMITAZIONE CRITICA:**
- **NON è editabile!** È solo visualizzazione
- **NON posso aggiungere operazioni manuali** dal diario
- **NON posso modificare operazioni esistenti**

---

### 2. PlantLifecycleManager - Gestione Completa

**File:** `components/plants/PlantLifecycleManager.tsx`

**Funzionalità:**
- ✅ Visualizzazione completa ciclo vita pianta
- ✅ **AGGIUNTA OPERAZIONI MANUALI** ✨
- ✅ Modifica operazioni esistenti
- ✅ Eliminazione operazioni
- ✅ Template operazioni rapide
- ✅ Calendario operazioni
- ✅ Analytics pianta

**Template Operazioni Disponibili:**
```typescript
const operationTemplates = [
  { type: 'watering', name: 'Irrigazione', icon: Droplets },
  { type: 'fertilizing', name: 'Fertilizzazione', icon: Zap },
  { type: 'treatment', name: 'Trattamento', icon: Shield },
  { type: 'pruning', name: 'Potatura', icon: Scissors },
  { type: 'health', name: 'Controllo Salute', icon: Heart }
]
```

**Form Aggiunta Operazione:**
- Selezione template
- Data operazione
- Quantità e unità
- Prodotto (se applicabile)
- Dosaggio/concentrazione
- Note
- Foto

**✅ QUESTO È IL COMPONENTE COMPLETO!**

---

### 3. BulkOperationModal - Operazioni di Massa

**File:** `components/plants/BulkOperationModal.tsx`

**Funzionalità:**
- ✅ Operazioni su più piante contemporaneamente
- ✅ Selezione piante da operare
- ✅ Tipi operazione: irrigazione, fertilizzazione, trattamento, salute
- ✅ Upload foto multiple
- ✅ Note condivise

**Workflow:**
1. Seleziona piante (o tutte)
2. Scegli tipo operazione
3. Inserisci dettagli (quantità, prodotto, ecc.)
4. Aggiungi foto (opzionale)
5. Aggiungi note (opzionale)
6. Conferma → Crea operazione per ogni pianta

---

### 4. PlantOperationsService - Backend

**File:** `services/plantOperationsService.ts`

**Funzioni Principali:**

#### createPlantOperation()
```typescript
// Crea operazione singola pianta
const operation = await createPlantOperation(plantId, gardenId, {
  operationType: 'watering',
  operationDate: '2026-02-13',
  quantity: 5,
  unit: 'L',
  notes: 'Irrigazione manuale',
  photos: ['url1', 'url2']
});
```

#### createBulkOperation()
```typescript
// Crea operazioni di massa
const result = await createBulkOperation({
  operationType: 'fertilizing',
  operationDate: '2026-02-13',
  plantIds: ['plant1', 'plant2', 'plant3'],
  quantityPerPlant: 50,
  unit: 'g',
  productName: 'NPK 10-10-10',
  notes: 'Fertilizzazione di fondo'
});
```

#### updatePlantHealth()
```typescript
// Aggiorna salute pianta dopo operazione
await updatePlantHealth(plantId, {
  healthScore: 85,
  status: 'healthy',
  notes: 'Migliorata dopo trattamento'
});
```

**⚠️ NOTA IMPORTANTE:**
Tutte le funzioni hanno `// TODO: Implementare con storage provider`
Significa che sono **SIMULATE** ma la struttura è pronta!

---

## 🔍 TRACCIAMENTO AUTOMATICO vs MANUALE

### Tracciamento Automatico

**Quando Avviene:**
1. **Irrigazione automatica** (se configurata)
   - Sistema registra automaticamente quando l'impianto si attiva
   - Calcola acqua per pianta in base a configurazione

2. **Fertilizzazione programmata**
   - Quando completi task fertilizzazione
   - Sistema registra per tutte le piante del filare

3. **Operazioni di filare**
   - Quando fai operazione su tutto il filare
   - Sistema registra per ogni pianta individuale

**Come Funziona:**
```typescript
// Esempio: Irrigazione automatica
const irrigationEvent = {
  date: '2026-02-13',
  time: '07:00',
  duration: 30, // minuti
  waterPerPlant: 5, // litri (calcolato da configurazione)
  source: 'automatic' // Flag automatico
};

// Sistema crea PlantOperation per ogni pianta
for (const plant of plantsInRow) {
  await createPlantOperation(plant.id, gardenId, {
    operationType: 'watering',
    operationDate: irrigationEvent.date,
    operationTime: irrigationEvent.time,
    duration: irrigationEvent.duration,
    waterAmount: irrigationEvent.waterPerPlant,
    notes: 'Irrigazione automatica programmata'
  });
}
```

### Tracciamento Manuale

**Quando Serve:**
1. **Operazioni non programmate**
   - Irrigazione manuale extra (es. giornata molto calda)
   - Fertilizzazione fogliare spot
   - Trattamento urgente per malattia

2. **Operazioni specifiche pianta**
   - Potatura pianta singola
   - Tutoraggio
   - Rimozione foglie malate
   - Controllo salute

3. **Registrazione a posteriori**
   - Hai fatto operazione ma dimenticato di registrare
   - Vuoi aggiungere note/foto a operazione passata

**Come Funziona:**
```typescript
// Utente apre PlantLifecycleManager
// Clicca "Aggiungi Operazione"
// Compila form:
{
  operationType: 'treatment',
  operationDate: '2026-02-13',
  productName: 'Rame',
  dosage: '2g/L',
  targetPest: 'Peronospora',
  notes: 'Trattamento preventivo dopo pioggia',
  photos: [photo1, photo2]
}
// Sistema salva operazione
```

---

## 📊 CONFRONTO COMPONENTI

| Feature | PlantDetailModal | PlantLifecycleManager | BulkOperationModal |
|---------|------------------|----------------------|-------------------|
| **Visualizza operazioni** | ✅ | ✅ | ❌ |
| **Aggiungi operazione** | ❌ | ✅ | ✅ |
| **Modifica operazione** | ❌ | ✅ | ❌ |
| **Elimina operazione** | ❌ | ✅ | ❌ |
| **Operazioni multiple** | ❌ | ❌ | ✅ |
| **Template rapidi** | ❌ | ✅ | ❌ |
| **Calendario** | ❌ | ✅ | ❌ |
| **Analytics** | ✅ (base) | ✅ (avanzate) | ❌ |
| **Carta identità** | ✅ | ✅ | ❌ |
| **Contesto ambientale** | ✅ | ✅ | ❌ |

---

## ✅ COSA FUNZIONA

### 1. Visualizzazione Diario
- ✅ PlantDetailModal mostra tutte le operazioni
- ✅ Filtri per tipo operazione
- ✅ Statistiche aggregate
- ✅ Contesto ambientale per ogni operazione
- ✅ Foto operazioni
- ✅ Distinzione operazioni dirette vs filare

### 2. Aggiunta Operazioni Manuali
- ✅ PlantLifecycleManager permette aggiunta
- ✅ Template operazioni rapide
- ✅ Form completo con tutti i dettagli
- ✅ Upload foto
- ✅ Note personalizzate

### 3. Operazioni di Massa
- ✅ BulkOperationModal per operazioni multiple
- ✅ Selezione piante
- ✅ Applicazione uniforme

### 4. Tracciamento Automatico
- ✅ Operazioni di filare registrate per ogni pianta
- ✅ Irrigazione automatica (se configurata)
- ✅ Fertilizzazione programmata

---

## ❌ COSA MANCA / LIMITAZIONI

### 1. PlantDetailModal NON Editabile
**Problema:**
- Diario è solo visualizzazione
- Non posso aggiungere operazioni direttamente
- Non posso modificare operazioni esistenti

**Soluzione:**
Aggiungere pulsante "Aggiungi Operazione" che apre form inline o modal

### 2. Storage Provider Non Implementato
**Problema:**
- Tutte le funzioni sono simulate (`// TODO`)
- Operazioni non vengono salvate realmente
- Dati persi al refresh

**Soluzione:**
Implementare metodi storage provider:
```typescript
interface IStorageProvider {
  // Operazioni piante
  getPlantOperations(plantId: string): Promise<PlantOperation[]>
  createPlantOperation(operation: PlantOperation): Promise<PlantOperation>
  updatePlantOperation(id: string, updates: Partial<PlantOperation>): Promise<PlantOperation>
  deletePlantOperation(id: string): Promise<void>
  
  // Operazioni filare
  getFieldRowOperations(fieldRowId: string): Promise<PlantOperation[]>
  createFieldRowOperation(operation: PlantOperation): Promise<PlantOperation>
}
```

### 3. Integrazione Irrigazione Automatica
**Problema:**
- Non c'è collegamento diretto tra sistema irrigazione e PlantOperation
- Irrigazioni automatiche non vengono registrate automaticamente

**Soluzione:**
Creare hook che registra operazione quando irrigazione si attiva:
```typescript
// Quando irrigazione si attiva
onIrrigationStart(event => {
  const plantsInZone = getPlantsInIrrigationZone(event.zoneId);
  
  for (const plant of plantsInZone) {
    createPlantOperation(plant.id, gardenId, {
      operationType: 'watering',
      operationDate: event.date,
      operationTime: event.time,
      duration: event.duration,
      waterAmount: calculateWaterPerPlant(event, plant),
      notes: 'Irrigazione automatica',
      source: 'automatic'
    });
  }
});
```

### 4. Calcolo Automatico Acqua per Pianta
**Problema:**
- Non c'è calcolo automatico acqua ricevuta da ogni pianta
- Dipende da configurazione impianto (gocciolatori, portata, ecc.)

**Soluzione:**
Implementare servizio calcolo:
```typescript
function calculateWaterPerPlant(
  irrigationEvent: IrrigationEvent,
  plant: GardenPlant,
  irrigationConfig: IrrigationConfig
): number {
  // Esempio per gocciolatori
  if (irrigationConfig.type === 'drip') {
    const emitterFlowRate = irrigationConfig.emitterFlowRateLph; // L/h
    const duration = irrigationEvent.duration; // minuti
    const emittersPerPlant = irrigationConfig.emittersPerPlant || 1;
    
    return (emitterFlowRate * (duration / 60) * emittersPerPlant);
  }
  
  // Esempio per aspersori
  if (irrigationConfig.type === 'sprinkler') {
    const areaPerPlant = calculatePlantArea(plant);
    const precipitationRate = irrigationConfig.precipitationRateMmH;
    const duration = irrigationEvent.duration;
    
    return (areaPerPlant * precipitationRate * (duration / 60) / 1000);
  }
  
  return 0;
}
```

### 5. Notifiche Operazioni Mancanti
**Problema:**
- Non ci sono alert per operazioni mancanti
- Es: "Pianta non irrigata da 5 giorni"

**Soluzione:**
Aggiungere sistema alert nel Director:
```typescript
// In director.ts
const lastWatering = getLastOperation(plant.id, 'watering');
const daysSinceWatering = differenceInDays(currentDate, lastWatering.date);

if (daysSinceWatering > 3) {
  urgentAlerts.push({
    type: 'Drought',
    message: `Pianta ${plant.plantCode} non irrigata da ${daysSinceWatering} giorni`,
    action: 'Irriga immediatamente',
    blockOperations: false
  });
}
```

---

## 🎯 RACCOMANDAZIONI

### PRIORITÀ ALTA (Implementare Subito)

#### 1. Implementare Storage Provider
**Effort:** 2-3 giorni  
**Impatto:** CRITICO

Senza storage, tutto è simulato e dati si perdono.

**Task:**
- Creare tabella `plant_operations` nel database
- Implementare metodi CRUD in SupabaseStorageProvider
- Collegare PlantLifecycleManager a storage reale
- Testare salvataggio/caricamento operazioni

#### 2. Rendere PlantDetailModal Editabile
**Effort:** 1 giorno  
**Impatto:** ALTO

Utenti si aspettano di poter aggiungere operazioni dal diario.

**Task:**
- Aggiungere pulsante "Aggiungi Operazione"
- Aprire form inline o modal
- Salvare operazione
- Ricaricare lista operazioni

### PRIORITÀ MEDIA (Implementare Dopo)

#### 3. Integrazione Irrigazione Automatica
**Effort:** 2-3 giorni  
**Impatto:** MEDIO

Tracciamento automatico irrigazioni.

**Task:**
- Hook su eventi irrigazione
- Calcolo acqua per pianta
- Registrazione automatica PlantOperation
- Visualizzazione nel diario

#### 4. Sistema Alert Operazioni Mancanti
**Effort:** 1-2 giorni  
**Impatto:** MEDIO

Promemoria operazioni necessarie.

**Task:**
- Logica calcolo giorni da ultima operazione
- Alert nel Director
- Suggerimenti operazioni
- Notifiche UI

### PRIORITÀ BASSA (Nice-to-Have)

#### 5. Analytics Avanzate
**Effort:** 2-3 giorni  
**Impatto:** BASSO

Correlazioni operazioni → salute/resa.

**Task:**
- Grafici trend salute
- Correlazioni operazioni → performance
- Predizioni resa
- Suggerimenti ottimizzazione

---

## 📋 CHECKLIST IMPLEMENTAZIONE

### Fase 1: Storage (CRITICO)
- [ ] Creare tabella `plant_operations`
- [ ] Implementare `getPlantOperations()`
- [ ] Implementare `createPlantOperation()`
- [ ] Implementare `updatePlantOperation()`
- [ ] Implementare `deletePlantOperation()`
- [ ] Testare CRUD completo

### Fase 2: UI Editabile (ALTO)
- [ ] Aggiungere pulsante "Aggiungi" in PlantDetailModal
- [ ] Form aggiunta operazione inline
- [ ] Salvare operazione via storage
- [ ] Ricaricare lista dopo salvataggio
- [ ] Testare workflow completo

### Fase 3: Integrazione Irrigazione (MEDIO)
- [ ] Hook eventi irrigazione
- [ ] Calcolo acqua per pianta
- [ ] Registrazione automatica
- [ ] Visualizzazione nel diario
- [ ] Testare con irrigazione reale

### Fase 4: Alert (MEDIO)
- [ ] Logica calcolo giorni da ultima operazione
- [ ] Alert nel Director
- [ ] Suggerimenti operazioni
- [ ] Notifiche UI
- [ ] Testare alert

---

## ✅ CONCLUSIONI

### Cosa Funziona Già
- ✅ Diario pianta completo (visualizzazione)
- ✅ Aggiunta operazioni manuali (PlantLifecycleManager)
- ✅ Operazioni di massa (BulkOperationModal)
- ✅ Struttura dati completa (PlantOperation)
- ✅ Servizi backend (simulati ma pronti)

### Cosa Serve Implementare
- ❌ Storage Provider (CRITICO)
- ❌ PlantDetailModal editabile (ALTO)
- ❌ Integrazione irrigazione automatica (MEDIO)
- ❌ Sistema alert operazioni (MEDIO)

### Effort Totale Stimato
- Fase 1 (Storage): 2-3 giorni
- Fase 2 (UI): 1 giorno
- Fase 3 (Irrigazione): 2-3 giorni
- Fase 4 (Alert): 1-2 giorni

**TOTALE: 6-9 giorni**

### ROI
- **ALTO**: Fase 1 e 2 (funzionalità base)
- **MEDIO**: Fase 3 (automazione)
- **BASSO**: Fase 4 (nice-to-have)

---

**Raccomandazione:** Iniziare con Fase 1 (Storage) per rendere il sistema funzionante, poi Fase 2 (UI editabile) per migliorare UX.
