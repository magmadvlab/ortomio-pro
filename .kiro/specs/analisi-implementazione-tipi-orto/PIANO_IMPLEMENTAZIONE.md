# Piano di Implementazione: Colture Specializzate

## Data: 2026-02-13

---

## FASE 1: QUICK WINS (1-2 settimane)

### Obiettivo
Rendere accessibili le funzionalità già implementate

### 1.1 Wizard Creazione Orto - Aggiungere Idroponica
**Effort**: 3 giorni  
**Priority**: CRITICAL

**Tasks**:
- [ ] Modificare `GardenTypeWizard.tsx` per aggiungere opzione "Idroponica"
- [ ] Creare sotto-menu con 6 tipi di sistemi
- [ ] Integrare `HydroponicConfigForm` esistente nel wizard
- [ ] Testare flusso completo creazione → salvataggio → visualizzazione

**Files da Modificare**:
- `components/GardenTypeWizard.tsx`
- `components/GardenOnboarding.tsx`

**Files Esistenti da Riutilizzare**:
- `components/gardens/HydroponicConfigForm.tsx` ✅
- `components/gardens/AquaponicConfigForm.tsx` ✅
- `components/gardens/AeroponicConfigForm.tsx` ✅

### 1.2 Menu Fragole nel Planner
**Effort**: 2 giorni  
**Priority**: HIGH

**Tasks**:
- [ ] Aggiungere categoria "Fragole" nel planner
- [ ] Mostrare 14 varietà da `strawberryMasterSheets`
- [ ] Evidenziare varietà Basilicata come Pro Feature
- [ ] Collegare a wizard creazione task

**Files da Modificare**:
- `app/app/planner/page.tsx` (o equivalente)
- Componente selezione piante

**Files Esistenti da Riutilizzare**:
- `data/strawberryMasterSheets.ts` ✅
- `components/StrawberryManagement.tsx` ✅

### 1.3 Dashboard Letture Idroponiche
**Effort**: 2 giorni  
**Priority**: HIGH

**Tasks**:
- [ ] Creare sezione "Letture Idroponiche" in dashboard
- [ ] Integrare `ReadingForm` esistente
- [ ] Mostrare storico letture con grafici
- [ ] Aggiungere alert per parametri fuori range

**Files da Creare**:
- `components/hydroponic/HydroponicDashboard.tsx`

**Files Esistenti da Riutilizzare**:
- `components/hydroponic/ReadingForm.tsx` ✅
- Storage methods già implementati ✅

---

## FASE 2: CORE FEATURES (3-4 settimane)

### 2.1 Ciclo Completo Gestione Fragole
**Effort**: 1 settimana  
**Priority**: HIGH

**Tasks**:
- [ ] Task specifici fragole: gestione stoloni, pacciamatura, rinnovo
- [ ] Calendario operazioni stagionali
- [ ] Registrazione raccolti con dati specifici
- [ ] Dashboard fragole con KPI

**Components da Creare**:
- `components/strawberry/StrawberryDashboard.tsx`
- `components/strawberry/StrawberryTaskWizard.tsx`
- `components/strawberry/StrawberryHarvestForm.tsx`

### 2.2 Monitoraggio Avanzato Idroponica
**Effort**: 1 settimana  
**Priority**: MEDIUM

**Tasks**:
- [ ] Grafici trend parametri (pH, EC, temp)
- [ ] Alert automatici con soglie configurabili
- [ ] Suggerimenti correzioni (es. "Aggiungi pH Down")
- [ ] Export dati CSV/Excel

**Components da Creare**:
- `components/hydroponic/ParameterCharts.tsx`
- `components/hydroponic/AlertSystem.tsx`
- `services/hydroponicAnalysisService.ts`

### 2.3 Integrazione Director per Colture Specializzate
**Effort**: 1.5 settimane  
**Priority**: HIGH

**Tasks**:
- [ ] Estendere Director per gestire idroponica/fragole
- [ ] Generare suggerimenti basati su parametri
- [ ] Daily briefing personalizzato
- [ ] Promemoria operazioni stagionali

**Files da Modificare**:
- `logic/director.ts`
- `services/directorService.ts`

**New Services**:
- `logic/hydroponicDirector.ts`
- `logic/strawberryDirector.ts`

---

## FASE 3: ADVANCED FEATURES (5-8 settimane)

### 3.1 Analisi Predittiva Idroponica
**Effort**: 2 settimane  
**Priority**: MEDIUM

**Features**:
- Previsione consumo nutrienti
- Identificazione pattern problemi
- Suggerimenti ottimizzazione
- Confronto performance tra sistemi

**Services da Creare**:
- `services/hydroponicPredictiveEngine.ts`
- `services/hydroponicOptimizer.ts`

### 3.2 Learning System Fragole
**Effort**: 2 settimane  
**Priority**: MEDIUM

**Features**:
- Tracciamento performance varietà
- Confronto anno su anno
- Identificazione varietà migliori per orto
- Report fine stagione con lessons learned

**Services da Creare**:
- `services/strawberryLearningEngine.ts`
- `services/strawberryAnalytics.ts`

### 3.3 Dashboard Unificato Colture Specializzate
**Effort**: 1.5 settimane  
**Priority**: HIGH

**Features**:
- Vista unificata tutte colture specializzate
- KPI comparativi
- Alert centralizzati
- Daily briefing personalizzato

**Components da Creare**:
- `components/specialized/UnifiedDashboard.tsx`
- `components/specialized/KPIComparison.tsx`

---

## FASE 4: AI & LEARNING (9-12 settimane)

### 4.1 Machine Learning per Ottimizzazione
**Effort**: 3 settimane  
**Priority**: LOW

**Features**:
- ML model per previsione resa
- Ottimizzazione parametri idroponici
- Raccomandazioni personalizzate
- A/B testing automatico

### 4.2 Sistema Esperto Fragole
**Effort**: 2 settimane  
**Priority**: LOW

**Features**:
- Diagnosi problemi automatica
- Suggerimenti varietà basati su clima/suolo
- Pianificazione rotazione varietà
- Ottimizzazione finestre raccolta

---

## PRIORITIZZAZIONE

### Must Have (MVP) - Fase 1
1. Wizard idroponica nel GardenTypeWizard
2. Menu fragole nel planner
3. Dashboard letture idroponiche base

### Should Have (V1) - Fase 2
4. Ciclo completo gestione fragole
5. Monitoraggio avanzato idroponica
6. Integrazione Director

### Could Have (V2) - Fase 3
7. Analisi predittiva
8. Learning system
9. Dashboard unificato

### Won't Have (Future) - Fase 4
10. Machine learning avanzato
11. Sistema esperto

---

## DIPENDENZE

### Tecniche
- Director/Orchestrator deve supportare nuovi tipi
- Storage providers devono gestire nuove query
- Database schema è già pronto ✅

### Business
- Definire quali feature sono Pro vs Free
- Validare priorità con stakeholders
- Confermare requisiti compliance

---

## RISCHI E MITIGAZIONI

### Rischio 1: Complessità UI
**Impatto**: HIGH  
**Probabilità**: MEDIUM  
**Mitigazione**: Usare wizard guidati, progressive disclosure

### Rischio 2: Performance con Molti Dati
**Impatto**: MEDIUM  
**Probabilità**: LOW  
**Mitigazione**: Paginazione, lazy loading, indici database

### Rischio 3: Algoritmi Predittivi Inaccurati
**Impatto**: MEDIUM  
**Probabilità**: MEDIUM  
**Mitigazione**: Iniziare con regole semplici, iterare con feedback utenti

---

## METRICHE DI SUCCESSO

### Adoption
- % utenti che creano orti idroponici
- % utenti che selezionano fragole
- Numero letture registrate/settimana

### Engagement
- Frequenza accesso dashboard specializzati
- Tasso utilizzo suggerimenti Director
- Tempo medio sessione su features specializzate

### Quality
- Accuratezza previsioni (quando implementate)
- Soddisfazione utenti (survey)
- Riduzione problemi segnalati

---

## EFFORT TOTALE STIMATO

- **Fase 1**: 7 giorni (1.4 settimane)
- **Fase 2**: 3.5 settimane
- **Fase 3**: 5.5 settimane
- **Fase 4**: 5 settimane

**Totale**: ~15.4 settimane (3.8 mesi) per implementazione completa

**MVP (Fase 1)**: 1.4 settimane - RACCOMANDATO COME PRIMO STEP

---

## NEXT STEPS IMMEDIATI

1. ✅ Review requirements con stakeholders
2. ✅ Validare priorità business
3. ⏳ Creare tasks dettagliati per Fase 1
4. ⏳ Assegnare risorse
5. ⏳ Iniziare implementazione Fase 1

---

## APPENDICE: COMPONENTI ESISTENTI DA RIUTILIZZARE

### Forms ✅
- `HydroponicConfigForm.tsx`
- `AquaponicConfigForm.tsx`
- `AeroponicConfigForm.tsx`
- `ReadingForm.tsx`

### Management ✅
- `StrawberryManagement.tsx`

### Data ✅
- `strawberryMasterSheets.ts` (14 varietà)
- `types/indoorGrowing.ts`
- `types/strawberry.ts`

### Services ✅
- Storage methods per hydroponic/aquaponic readings
- `strawberryEngine.ts` (logic esistente)

### Database ✅
- `hydroponic_readings` table
- `aquaponic_readings` table
- JSONB fields in `gardens` and `garden_tasks`
