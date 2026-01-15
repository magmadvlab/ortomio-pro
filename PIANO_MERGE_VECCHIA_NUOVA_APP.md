# Piano Merge Vecchia → Nuova App

**Data Inizio**: 15 Gennaio 2026  
**Obiettivo**: Integrare le funzionalità mancanti dalla vecchia app nella nuova, mantenendo l'architettura moderna

---

## 🎯 Strategia Generale

**PRINCIPIO**: La nuova app ha l'architettura giusta (modulare, AI-driven, professionale). La vecchia app ha funzionalità utente complete che mancano nella nuova.

**APPROCCIO**: 
- ✅ Mantenere architettura nuova app
- ✅ Portare UI/UX mancanti dalla vecchia
- ✅ Integrare azioni utente mancanti
- ✅ **ARCHITETTURA MODULARE**: Ogni funzionalità è un modulo indipendente
- ✅ **FEATURE FLAGS**: Ogni modulo può essere attivato/disattivato
- ❌ NON portare gamification
- ❌ NON portare ricette (già integrato SmartRecipesWidget)

---

## 🔧 Architettura Modulare

### Sistema Feature Flags

Creeremo un file di configurazione centrale per attivare/disattivare moduli:

```typescript
// config/features.ts
export const FEATURES = {
  // Moduli CRITICI
  AI_PREDICTIONS: true,
  JOURNAL: true,
  INDIVIDUAL_PLANTS: true,
  ORCHARD: true,
  VINEYARD: true,
  OLIVE_GROVE: true,
  
  // Moduli ALTI
  IRRIGATION_ZONES: true,
  IRRIGATION_SCHEDULING: true,
  NUTRITION_INVENTORY: true,
  NUTRITION_DOSE_CALCULATOR: true,
  
  // Moduli MEDI
  EQUIPMENT_MANAGEMENT: true,
  MAINTENANCE_SCHEDULER: true,
  ADVANCED_CERTIFICATIONS: true,
  SEASONAL_ADVICE: true,
  PLANNER_WIZARD_EXTENDED: true
}
```

### Struttura Modulare

Ogni modulo avrà:
1. **Componente principale** isolato
2. **Servizio dedicato** (opzionale)
3. **Types dedicati** (opzionale)
4. **Feature flag** per attivazione/disattivazione
5. **Nessuna dipendenza** da altri moduli (solo da servizi base)

### Esempio Struttura Modulo

```
components/
  irrigation/
    modules/
      ZoneManagement/           # MODULO INDIPENDENTE
        index.tsx               # Componente principale
        ZoneList.tsx            # Sub-componente
        ZoneForm.tsx            # Sub-componente
        useZoneManagement.ts    # Hook dedicato
      
      AutoScheduling/           # MODULO INDIPENDENTE
        index.tsx
        ScheduleCalendar.tsx
        ScheduleForm.tsx
        useAutoScheduling.ts
```

### Integrazione con Feature Flags

```typescript
// app/app/irrigation/page.tsx
import { FEATURES } from '@/config/features'
import ZoneManagement from '@/components/irrigation/modules/ZoneManagement'
import AutoScheduling from '@/components/irrigation/modules/AutoScheduling'

export default function IrrigationPage() {
  return (
    <div>
      {/* Funzionalità base sempre attiva */}
      <IrrigationDashboard />
      
      {/* Moduli opzionali */}
      {FEATURES.IRRIGATION_ZONES && <ZoneManagement />}
      {FEATURES.IRRIGATION_SCHEDULING && <AutoScheduling />}
    </div>
  )
}
```

---

## 📋 Checklist Generale

### Pagine da Tenere NUOVA
- [x] Analytics (nuova è molto più avanzata)
- [x] Dashboard (nuova è professionale)
- [x] Settings (nuova è completa)

### Pagine da ELIMINARE (non portare)
- [ ] Gamification/Challenges (fuori scope professionale)
- [ ] Ricette (già integrato in SmartRecipesWidget)
- [ ] Progress/Badge (gamification)
- [ ] Almanacco (low priority)

### Pagine da MERGE (portare funzionalità mancanti)
- [ ] **Irrigazione** - Portare gestione zone e programmazione
- [ ] **Nutrizione** - Portare inventario prodotti e calcolo dosi
- [ ] **Lavori Meccanici** - Portare gestione attrezzature completa
- [ ] **Certificazioni** - Portare gestione documenti avanzata
- [ ] **Consigli** - Merge con sistema AI esistente
- [ ] **Planner** - Portare wizard piantagione step-by-step

### Pagine CRITICHE da Creare (mancano completamente)
- [ ] **AI Predictions** - Creare UI per servizio esistente
- [ ] **Diario** - Creare route per componente esistente
- [ ] **Piante Individuali** - Creare route per componente esistente
- [ ] **Frutteto** - Portare da vecchia app
- [ ] **Vigneto** - Portare da vecchia app
- [ ] **Oliveto** - Portare da vecchia app

---

## 🔥 FASE 1: Funzionalità CRITICHE (Priorità Massima)

### 1.1 AI Predictions UI ⏱️ 2-3 ore ✅ COMPLETATO
**Problema**: Servizio esiste (`aiPredictiveEngine.ts` 779 righe), manca solo UI

**Azione**:
- [x] Creare `/app/app/ai-predictions/page.tsx`
- [x] Usare componente dalla vecchia app come base
- [x] Integrare con servizio esistente `aiPredictiveEngine.ts`
- [x] Aggiungere visualizzazione malattie previste
- [x] Aggiungere predizioni resa
- [x] Aggiungere confidence score
- [x] Aggiungere azioni raccomandate
- [x] Aggiungere ottimizzazione risorse

**File creati**:
- `app/app/ai-predictions/page.tsx` ✅
- `components/ai/predictions/AIPredictionsDashboard.tsx` ✅
- `components/ai/predictions/DiseasePredictionsCard.tsx` ✅
- `components/ai/predictions/YieldPredictionsCard.tsx` ✅
- `components/ai/predictions/ResourceOptimizationCard.tsx` ✅

**Feature Flag**: `AI_PREDICTIONS` = true ✅

**Tempo effettivo**: 45 minuti

**Note**: Modulo completamente modulare e indipendente. Può essere attivato/disattivato con feature flag.

---

### 1.2 Diario Operativo Route ⏱️ 1 ora ✅ COMPLETATO
**Problema**: Componente esiste (`OperationalDiary.tsx`), manca solo route

**Azione**:
- [x] Creare `/app/app/journal/page.tsx`
- [x] Usare componente esistente `OperationalDiary.tsx`
- [x] Integrare con servizio esistente `operationalDiaryService.ts`
- [x] Aggiungere FeatureGate per controllo modulo

**File creati**:
- `app/app/journal/page.tsx` ✅

**Feature Flag**: `JOURNAL` = true ✅

**Tempo effettivo**: 5 minuti

**Note**: Componente già completo con timeline, filtri, export. Solo route mancante.

---

### 1.3 Piante Individuali Route ⏱️ 1 ora ✅ COMPLETATO
**Problema**: Componente esiste (`SmartPlantManager.tsx`), manca solo route

**Azione**:
- [x] Creare `/app/app/plants/page.tsx`
- [x] Usare componente esistente `SmartPlantManager.tsx`
- [x] Integrare con servizio esistente `individualPlantService.ts`

**File creati**:
- `app/app/plants/page.tsx` ✅

**Feature Flag**: `INDIVIDUAL_PLANTS` = true ✅

**Tempo effettivo**: 3 minuti

**Note**: Componente già completo con tracciamento, health score, heatmap.

---

### 1.4 Frutteto Completo ⏱️ 4-6 ore ✅ COMPLETATO
**Problema**: Nuova app ha solo placeholder, vecchia ha sistema completo

**Azione**:
- [x] Analizzare vecchia app `/app/old/orchard/page.tsx`
- [x] Creare pagina frutteto con lista alberi
- [x] Integrare con sistema zone/filari esistente
- [x] Mostrare prossime potature
- [x] Mostrare periodo raccolta
- [x] Link al Planner per aggiungere alberi

**File creati**:
- `app/app/orchard/page.tsx` ✅

**Feature Flag**: `ORCHARD` = true ✅

**Tempo effettivo**: 15 minuti

**Note**: Implementazione base funzionante. Usa componenti esistenti e servizi già presenti.

---

### 1.5 Vigneto Completo ⏱️ 4-6 ore ✅ COMPLETATO
**Problema**: Nuova app ha solo placeholder, vecchia ha sistema completo

**Azione**:
- [x] Analizzare vecchia app `/app/old/vineyard/page.tsx`
- [x] Creare pagina vigneto con lista viti
- [x] Integrare con sistema zone/filari esistente
- [x] Mostrare prossime potature
- [x] Mostrare finestra vendemmia
- [x] Link al Planner per aggiungere viti

**File creati**:
- `app/app/vineyard/page.tsx` ✅

**Feature Flag**: `VINEYARD` = true ✅

**Tempo effettivo**: 15 minuti

**Note**: Implementazione base funzionante. Usa componenti esistenti e servizi già presenti.

---

### 1.6 Oliveto Completo ⏱️ 4-6 ore ✅ COMPLETATO
**Problema**: Nuova app ha solo placeholder, vecchia ha sistema completo

**Azione**:
- [x] Analizzare vecchia app `/app/old/olives/page.tsx`
- [x] Creare pagina oliveto con lista olivi
- [x] Integrare con sistema zone/filari esistente
- [x] Mostrare prossime potature
- [x] Mostrare finestra raccolta
- [x] Link al Planner per aggiungere olivi

**File creati**:
- `app/app/olives/page.tsx` ✅

**Feature Flag**: `OLIVE_GROVE` = true ✅

**Tempo effettivo**: 15 minuti

**Note**: Implementazione base funzionante. Usa componenti esistenti e servizi già presenti.

---

**TOTALE FASE 1**: ✅ COMPLETATA in 1.5 ore (invece di 16-23 ore stimate)

---

## 🟠 FASE 2: Funzionalità ALTE (Priorità Alta)

### 2.1 Irrigazione - Gestione Completa ⏱️ 3-4 ore

**Cosa manca nella nuova**:
- Gestione zone irrigazione
- Sistemi irrigazione (goccia, aspersione)
- Log irrigazioni dettagliati
- Analytics consumo acqua
- Calcolo fabbisogno idrico
- Programmazione automatica
- Storico completo

**Cosa c'è nella nuova**:
- Widget AI suggerimenti ✅
- Integrazione meteo ✅
- Log semplificato ✅
- Dashboard essenziale ✅

**Azione**:
- [ ] Analizzare `/app/old/irrigation/page.tsx`
- [ ] Aggiungere tab "Zone" in `/app/app/irrigation/page.tsx`
- [ ] Creare `IrrigationZoneManager.tsx`
- [ ] Creare `IrrigationSystemSelector.tsx` (goccia/aspersione)
- [ ] Espandere log irrigazioni con dettagli
- [ ] Aggiungere analytics consumo acqua
- [ ] Aggiungere calcolo fabbisogno idrico
- [ ] Aggiungere programmazione automatica
- [ ] Mantenere widget AI esistente

**File da creare/modificare**:
- `app/app/irrigation/page.tsx` (aggiungere tabs)
- `components/irrigation/IrrigationZoneManager.tsx`
- `components/irrigation/IrrigationSystemSelector.tsx`
- `components/irrigation/DetailedWateringLog.tsx`
- `components/irrigation/WaterConsumptionAnalytics.tsx`
- `components/irrigation/WaterNeedsCalculator.tsx`
- `components/irrigation/AutomaticScheduler.tsx`
- `services/irrigationService.ts` (espandere)

**Stima**: 3-4 ore

---

### 2.2 Nutrizione - Gestione Completa ⏱️ 3-4 ore

**Cosa manca nella nuova**:
- Gestione fertilizzanti per bed/row
- Trattamenti fitosanitari dettagliati
- Calcolo dosi per zona
- Storico trattamenti completo
- Inventario prodotti
- Compatibilità prodotti
- Registro trattamenti

**Cosa c'è nella nuova**:
- Widget AI suggerimenti ✅
- Gestione semplificata ✅
- Trattamenti bio/tradizionale ✅
- Dashboard essenziale ✅

**Azione**:
- [ ] Analizzare `/app/old/nutrition/page.tsx`
- [ ] Aggiungere tab "Inventario" in `/app/app/nutrition/page.tsx`
- [ ] Creare `ProductInventoryManager.tsx`
- [ ] Creare `DoseCalculator.tsx` per zona/filare
- [ ] Espandere storico trattamenti
- [ ] Aggiungere compatibilità prodotti
- [ ] Aggiungere registro trattamenti completo
- [ ] Mantenere widget AI esistente

**File da creare/modificare**:
- `app/app/nutrition/page.tsx` (aggiungere tabs)
- `components/nutrition/ProductInventoryManager.tsx`
- `components/nutrition/DoseCalculator.tsx`
- `components/nutrition/TreatmentHistory.tsx`
- `components/nutrition/ProductCompatibilityChecker.tsx`
- `components/nutrition/TreatmentRegistry.tsx`
- `services/nutritionService.ts` (espandere)

**Stima**: 3-4 ore

---

**TOTALE FASE 2**: 6-8 ore (1 giorno)

---

## 🟡 FASE 3: Funzionalità MEDIE (Priorità Media)

### 3.1 Lavori Meccanici - Gestione Completa ⏱️ 3-4 ore

**Cosa manca nella nuova**:
- Gestione attrezzature complete
- Manutenzione attrezzature
- Lavorazioni terreno dettagliate
- Accessori e ricambi
- Costi operativi
- Storico manutenzioni
- Calendario manutenzioni

**Cosa c'è nella nuova**:
- Versione minimalista
- Log lavorazioni base

**Azione**:
- [ ] Analizzare `/app/old/mechanical-work/page.tsx`
- [ ] Espandere `/app/app/mechanical-work/page.tsx`
- [ ] Creare `EquipmentManager.tsx`
- [ ] Creare `MaintenanceScheduler.tsx`
- [ ] Creare `TillageOperationsLog.tsx`
- [ ] Creare `AccessoriesInventory.tsx`
- [ ] Creare `OperationalCostsTracker.tsx`
- [ ] Creare `MaintenanceHistory.tsx`

**File da creare/modificare**:
- `app/app/mechanical-work/page.tsx` (espandere)
- `components/mechanicalWork/EquipmentManager.tsx`
- `components/mechanicalWork/MaintenanceScheduler.tsx`
- `components/mechanicalWork/TillageOperationsLog.tsx`
- `components/mechanicalWork/AccessoriesInventory.tsx`
- `components/mechanicalWork/OperationalCostsTracker.tsx`
- `components/mechanicalWork/MaintenanceHistory.tsx`
- `services/mechanicalWorkService.ts` (espandere)

**Stima**: 3-4 ore

---

### 3.2 Certificazioni - Gestione Documenti Avanzata ⏱️ 2-3 ore

**Cosa manca nella nuova**:
- Gestione documenti avanzata
- Export report completi
- Moduli GlobalGAP completi
- Audit trail dettagliato

**Cosa c'è nella nuova**:
- GlobalGapDashboard ✅
- Compliance checklist ✅
- Document manager base ✅
- Deadline manager ✅

**Azione**:
- [ ] Analizzare `/app/old/certifications/page.tsx`
- [ ] Espandere document manager
- [ ] Aggiungere export report avanzati
- [ ] Completare moduli GlobalGAP
- [ ] Aggiungere audit trail dettagliato

**File da modificare**:
- `components/certifications/DocumentManager.tsx` (espandere)
- `components/certifications/ReportExporter.tsx` (nuovo)
- `components/certifications/AuditTrail.tsx` (nuovo)
- `services/unifiedCertificationsService.ts` (espandere)

**Stima**: 2-3 ore

---

### 3.3 Consigli - Merge con AI Esistente ⏱️ 2 ore

**Cosa manca nella nuova**:
- Consigli base stagionali

**Cosa c'è nella nuova**:
- CropRotationPlanner ✅
- BiologicalControlDashboard ✅
- Sistema consigli attivi integrati ✅
- AI collaborativa ✅

**Azione**:
- [ ] Analizzare `/app/old/advice/page.tsx`
- [ ] Integrare consigli stagionali base
- [ ] Merge con sistema AI esistente
- [ ] Mantenere architettura nuova

**File da modificare**:
- `app/app/advice/page.tsx` (aggiungere tab consigli base)
- `components/advice/SeasonalAdvice.tsx` (nuovo)

**Stima**: 2 ore

---

### 3.4 Planner - Wizard Piantagione ⏱️ 4-5 ore

**Cosa manca nella nuova**:
- Wizard piantagione step-by-step completo
- Selezione materiale (seme/piantina/alberello)
- Collegamento banca semi visuale
- Collegamento vivaio
- Compatibilità pH visuale
- Piante compagne visuale

**Cosa c'è nella nuova**:
- Planner modulare con 5 tabs ✅
- SmartPlanner con AI ✅
- ClassicPlanner con rotazione ✅
- Timeline grafica ✅
- Metriche efficienza ✅
- Suggerimenti AI contestuali ✅
- Calendario professionale ✅
- Task list avanzata ✅
- Analytics integrati ✅

**Azione**:
- [ ] Analizzare `/app/old/planner/page.tsx`
- [ ] Espandere wizard esistente in `PlannerWizard.tsx`
- [ ] Aggiungere step selezione materiale
- [ ] Aggiungere collegamento banca semi visuale
- [ ] Aggiungere collegamento vivaio
- [ ] Aggiungere compatibilità pH visuale
- [ ] Aggiungere piante compagne visuale
- [ ] Mantenere architettura modulare nuova

**File da modificare**:
- `components/planner/tabs/PlannerWizard.tsx` (espandere)
- `components/planner/MaterialSelector.tsx` (nuovo)
- `components/planner/SeedBankConnector.tsx` (nuovo)
- `components/planner/NurseryConnector.tsx` (nuovo)
- `components/planner/PHCompatibilityVisual.tsx` (nuovo)
- `components/planner/CompanionPlantsVisual.tsx` (nuovo)

**Stima**: 4-5 ore

---

**TOTALE FASE 3**: 11-14 ore (1.5-2 giorni)

---

## 📊 Riepilogo Tempi

| Fase | Descrizione | Tempo | Priorità |
|------|-------------|-------|----------|
| **FASE 1** | Funzionalità CRITICHE | 16-23 ore | 🔴 MASSIMA |
| **FASE 2** | Funzionalità ALTE | 6-8 ore | 🟠 ALTA |
| **FASE 3** | Funzionalità MEDIE | 11-14 ore | 🟡 MEDIA |
| **TOTALE** | | **33-45 ore** | **4-6 giorni** |

---

## 🎯 Approccio Implementazione

### Step-by-Step per Ogni Funzionalità

1. **Analizza vecchia app** (15 min)
   - Apri pagina vecchia in browser
   - Testa tutte le funzionalità
   - Annota cosa serve

2. **Leggi codice vecchia** (15 min)
   - Leggi `/app/old/[pagina]/page.tsx`
   - Identifica componenti chiave
   - Identifica servizi usati

3. **Pianifica integrazione** (15 min)
   - Decidi cosa portare
   - Decidi dove integrare
   - Crea lista file da creare/modificare

4. **Implementa** (tempo variabile)
   - Crea/modifica file
   - Testa funzionalità
   - Verifica integrazione

5. **Test finale** (15 min)
   - Testa in browser
   - Verifica database
   - Verifica nessun errore

---

## 📝 Note Implementazione

### Principi da Seguire

1. **Mantenere architettura nuova**
   - Componenti modulari
   - Servizi separati
   - Types ben definiti

2. **Integrare, non sostituire**
   - Aggiungere tabs, non sostituire pagine
   - Espandere componenti esistenti
   - Mantenere widget AI

3. **Testare sempre**
   - Ogni funzionalità deve funzionare
   - Nessun errore console
   - Database deve essere consistente

4. **Documentare**
   - Aggiornare questo file dopo ogni step
   - Segnare [x] quando completato
   - Annotare problemi incontrati

---

## 🚀 Prossimo Step

**STEP 0**: Creare sistema feature flags (15 min)

**STEP 1**: INIZIARE DA FASE 1.1 - AI Predictions UI (2-3 ore)

### Step 0: Setup Feature Flags

Prima di iniziare qualsiasi implementazione, creiamo il sistema di feature flags:

1. **Creare `config/features.ts`** - File centrale feature flags
2. **Creare `hooks/useFeature.ts`** - Hook per controllare feature
3. **Aggiornare `.env.example`** - Documentare feature flags

Questo permette di:
- ✅ Attivare/disattivare ogni modulo singolarmente
- ✅ Testare moduli in isolamento
- ✅ Deploy graduale delle funzionalità
- ✅ Rollback immediato se problemi

Vuoi che inizi con lo Step 0 (setup feature flags)?

