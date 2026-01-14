# Piano Consigli AI Attivi e Integrati
## Sistema Completo per Consigli Azionabili

**Data**: 14 Gennaio 2026  
**Status**: Implementazione Base Completata

---

## 📋 PANORAMICA

Trasformazione dei consigli AI da passivi ad attivi con integrazione completa nel sistema:

### Prima (Passivo)
- Consigli generici senza azione
- Nessun tracking
- Nessuna integrazione con dati reali

### Dopo (Attivo)
- Consigli azionabili con checklist
- Tracking completo per certificazioni
- Integrazione con memoria storica
- Automazione basata su meteo/eventi

---

## 🎯 FUNZIONALITÀ IMPLEMENTATE

### 1. ROTAZIONE COLTURE (Crop Rotation)

**Database**:
- `crop_rotation_history` - Storia completa delle colture per filare
- `crop_rotation_plans` - Piani di rotazione suggeriti dall'AI

**Funzionalità**:
- ✅ Memoria storica delle colture per ogni filare
- ✅ Tracking famiglia botanica (Solanaceae, Leguminose, etc.)
- ✅ Registrazione rese, qualità, problemi
- ✅ AI suggerisce prossima coltura basata su:
  - Storia ultimi 3 anni
  - Regole rotazione famiglie botaniche
  - Problemi riscontrati (malattie, parassiti)
  - Depauperamento suolo
- ✅ Score di confidenza basato su completezza dati
- ✅ Benefici e rischi spiegati

**Regole Rotazione**:
```
Solanaceae → Leguminose (ripristino azoto)
Leguminose → Solanaceae/Cucurbitaceae (sfruttano azoto)
Brassicaceae → Leguminose (recupero suolo)
Cucurbitaceae → Leguminose (molto esigenti)
```

**Service**: `services/cropRotationService.ts`
- `addToHistory()` - Aggiunge coltura alla storia
- `getHistory()` - Recupera storia per orto/filare
- `generateRotationPlan()` - Genera piano rotazione AI
- `acceptPlan()` - Accetta suggerimento
- `getPlantFamily()` - Identifica famiglia botanica

---

### 2. CONTROLLO BIOLOGICO (Biological Control)

**Database**:
- `biological_control_checklists` - Checklist controllo biologico
- `biological_control_subtasks` - Sotto-task per ogni checklist

**Funzionalità**:
- ✅ Checklist per pratiche biologiche
- ✅ Categorie:
  - Insetti benefici (coccinelle, parassitoidi)
  - Trappole (cromatiche, feromoniche)
  - Barriere fisiche (reti, collari)
  - Monitoraggio parassiti
- ✅ Tracking per certificazioni (BIO, GLOBALGAP)
- ✅ Frequenza automatica (giornaliera, settimanale, mensile)
- ✅ Sotto-task con status individuale
- ✅ Foto evidenze per audit
- ✅ Score efficacia trattamento
- ✅ Report per certificazioni

**Template Predefiniti**:
1. **Insetti Benefici**: Introduzione coccinelle, crisope, etc.
2. **Trappole**: Installazione e monitoraggio trappole
3. **Barriere Fisiche**: Reti anti-insetto, collari
4. **Monitoraggio**: Ispezione regolare parassiti

**Service**: `services/biologicalControlService.ts`
- `createFromTemplate()` - Crea checklist da template
- `getChecklists()` - Recupera checklist con filtri
- `updateChecklistStatus()` - Aggiorna status
- `getCertificationReport()` - Report per certificazioni

---

### 3. COMPOSTIERA (Composter Tracking)

**Database**:
- `composters` - Compostiere dell'orto
- `composter_additions` - Materiali aggiunti
- `composter_monitoring` - Monitoraggio stato compost

**Funzionalità**:
- ✅ Tracking multiple compostiere
- ✅ Tipi: Heap, Bin, Tumbler, Worm, Bokashi
- ✅ Registrazione aggiunte materiali:
  - Tipo (verde, marrone, scarti, letame)
  - Quantità in kg
  - Rapporto C/N
- ✅ **Validazione AI materiali**:
  - ⚠️ Blocca materiale infetto
  - ⚠️ Avvisa su materiale trattato chimicamente
  - ✅ Suggerisce bilanciamento C/N
- ✅ Monitoraggio:
  - Temperatura
  - Umidità (troppo secco/ottimale/troppo umido)
  - Odore (terroso/ammoniaca/marcio)
  - Azioni (rivoltato, innaffiato)
- ✅ AI Health Score (0-100)
- ✅ Raccomandazioni automatiche
- ✅ Stima data maturazione

**Validazione Sicurezza**:
```sql
validate_compost_material(
  material_description,
  is_diseased,
  is_treated_chemically
) → {
  is_safe: boolean,
  warning: string,
  recommendation: string
}
```

**Service**: Da implementare `services/composterService.ts`

---

### 4. PROTEZIONE INVERNALE (Winter Protection)

**Database**:
- `winter_protection_checklists` - Checklist protezione
- `winter_protection_tasks` - Task specifici

**Funzionalità**:
- ✅ **Trigger automatico da meteo**:
  - Previsione gelate
  - Temperature < 0°C
  - Alert notti fredde
- ✅ Urgenza automatica:
  - CRITICAL: < -5°C
  - HIGH: -5°C a -2°C
  - MEDIUM: -2°C a 0°C
  - LOW: > 0°C
- ✅ Tipi protezione:
  - Tessuto non tessuto
  - Pacciamatura
  - Tunnel freddi
  - Serre
  - Coperture
- ✅ Task automatici:
  1. Preparare materiali
  2. Coprire piante sensibili
  3. Proteggere radici
  4. Verificare copertura
- ✅ Valutazione efficacia post-gelata
- ✅ Foto danni/protezioni

**Funzione Automatica**:
```sql
create_winter_protection_from_forecast(
  garden_id,
  min_temperature,
  frost_date
) → checklist_id
```

**Service**: Da implementare `services/winterProtectionService.ts`

---

## 📊 SCHEMA DATABASE

### Tabelle Create
```
crop_rotation_history          - Storia colture per filare
crop_rotation_plans            - Piani rotazione AI
biological_control_checklists  - Checklist controllo biologico
biological_control_subtasks    - Sotto-task checklist
composters                     - Compostiere
composter_additions            - Aggiunte materiali
composter_monitoring           - Monitoraggio compost
winter_protection_checklists   - Checklist protezione
winter_protection_tasks        - Task protezione
```

### Funzioni Helper
```sql
suggest_next_crop_rotation()           - Suggerisce prossima coltura
validate_compost_material()            - Valida materiale compost
create_winter_protection_from_forecast() - Crea checklist da meteo
```

### Indexes
- Ottimizzati per query per garden_id, status, date
- Performance garantita anche con molti dati

### RLS Policies
- Abilitato Row Level Security
- Policies base per utenti autenticati
- Da raffinare con ownership orti

---

## 🔧 SERVICES IMPLEMENTATI

### 1. cropRotationService.ts ✅
```typescript
- addToHistory()           // Aggiunge coltura a storia
- getHistory()             // Recupera storia
- getHistoryByRow()        // Storia per filare specifico
- generateRotationPlan()   // Genera piano AI
- acceptPlan()             // Accetta suggerimento
- rejectPlan()             // Rifiuta suggerimento
- getPlantFamily()         // Identifica famiglia
```

### 2. biologicalControlService.ts ✅
```typescript
- createChecklist()        // Crea checklist
- createFromTemplate()     // Crea da template
- getChecklists()          // Recupera con filtri
- updateChecklistStatus()  // Aggiorna status
- createSubtask()          // Crea sotto-task
- getSubtasks()            // Recupera sotto-task
- updateSubtaskStatus()    // Aggiorna sotto-task
- getCertificationReport() // Report certificazioni
```

### 3. composterService.ts ⏳
Da implementare:
```typescript
- createComposter()
- addMaterial()
- validateMaterial()       // AI validation
- recordMonitoring()
- getHealthScore()
- getRecommendations()
```

### 4. winterProtectionService.ts ⏳
Da implementare:
```typescript
- createFromWeatherForecast()
- getActiveChecklists()
- updateTaskStatus()
- recordEffectiveness()
- getSeasonalReport()
```

---

## 🎨 UI COMPONENTS DA CREARE

### 1. Crop Rotation Planner
**File**: `components/advice/CropRotationPlanner.tsx`

**Features**:
- Vista storia colture per filare
- Timeline rotazioni
- Suggerimenti AI con score
- Accetta/Rifiuta piano
- Visualizzazione benefici/rischi
- Filtri per famiglia botanica

### 2. Biological Control Dashboard
**File**: `components/advice/BiologicalControlDashboard.tsx`

**Features**:
- Lista checklist attive
- Progress bar completamento
- Filtri per categoria/status
- Creazione da template
- Gestione sotto-task
- Upload foto evidenze
- Export report certificazioni

### 3. Composter Manager
**File**: `components/advice/ComposterManager.tsx`

**Features**:
- Lista compostiere
- Aggiungi materiale con validazione AI
- Warnings materiale infetto
- Monitoraggio temperatura/umidità
- Health score visualizzato
- Raccomandazioni AI
- Timeline maturazione

### 4. Winter Protection Manager
**File**: `components/advice/WinterProtectionManager.tsx`

**Features**:
- Alert gelate automatici
- Checklist urgenti evidenziate
- Task list con materiali
- Foto protezioni applicate
- Valutazione efficacia
- Report stagionale

### 5. Active Advice Dashboard
**File**: `app/app/advice/page.tsx` (da aggiornare)

**Features**:
- Cards consigli attivi
- Badge azioni richieste
- Link diretti a funzionalità
- Progress tracking
- Notifiche urgenti

---

## 🔄 INTEGRAZIONE CON SISTEMI ESISTENTI

### Weather API
```typescript
// Trigger winter protection
if (forecast.minTemp < 0 && forecast.date < 3days) {
  await winterProtectionService.createFromWeatherForecast(
    gardenId,
    forecast.minTemp,
    forecast.date
  )
}
```

### Field Row Tracking
```typescript
// Quando si raccoglie un filare
await cropRotationService.addToHistory({
  gardenId,
  fieldRowId,
  plantName,
  plantFamily,
  harvestDate,
  yieldKg,
  qualityScore
})

// Genera automaticamente piano rotazione
const plan = await cropRotationService.generateRotationPlan(
  gardenId,
  fieldRowId,
  currentCrop,
  currentFamily
)
```

### Certification System
```typescript
// Report controllo biologico per audit
const report = await biologicalControlService.getCertificationReport(
  gardenId,
  'BIO',
  startDate,
  endDate
)
// → Usato in unifiedCertificationsService
```

### Intervention Wizard
```typescript
// Quando si completa un'operazione
if (operation.type === 'HARVEST') {
  // Suggerisci prossima coltura
  showRotationSuggestion()
}

if (operation.type === 'BIOLOGICAL_CONTROL') {
  // Aggiorna checklist
  await biologicalControlService.updateChecklistStatus()
}
```

---

## 📱 FLUSSI UTENTE

### Flusso 1: Rotazione Colture
```
1. Utente raccoglie pomodori da Filare A
2. Sistema registra in crop_rotation_history
3. AI analizza storia ultimi 3 anni
4. AI genera piano rotazione
5. Mostra card "Rotazione Consigliata" in dashboard
6. Utente clicca → Vede suggerimenti con score
7. Utente accetta "Fagioli" (Leguminose)
8. Sistema crea task pianificazione
```

### Flusso 2: Controllo Biologico
```
1. Sistema crea checklist mensile automatica
2. Notifica "Controllo Biologico Mensile"
3. Utente apre checklist
4. Completa sotto-task uno per uno
5. Carica foto coccinelle introdotte
6. Registra efficacia (riduzione afidi 80%)
7. Sistema salva per certificazione BIO
```

### Flusso 3: Compostiera
```
1. Utente vuole aggiungere scarti pomodori malati
2. Seleziona "Materiale infetto: Sì"
3. AI valida → ⚠️ WARNING
4. "Non aggiungere materiale infetto al compost"
5. "Smaltire separatamente per evitare diffusione"
6. Utente annulla operazione
7. Sistema previene contaminazione compost
```

### Flusso 4: Protezione Invernale
```
1. Weather API: Gelata -3°C prevista tra 2 giorni
2. Sistema crea checklist URGENZA HIGH
3. Notifica push "Gelata in arrivo!"
4. Utente apre checklist
5. Vede task: preparare tessuto, coprire piante, etc.
6. Completa task con foto
7. Dopo gelata: valuta efficacia
8. Sistema impara per prossime volte
```

---

## 🚀 PROSSIMI PASSI

### Fase 1: Completamento Services ⏳
- [ ] Implementare `composterService.ts`
- [ ] Implementare `winterProtectionService.ts`
- [ ] Integrare con Weather API
- [ ] Testing services

### Fase 2: UI Components ⏳
- [ ] CropRotationPlanner component
- [ ] BiologicalControlDashboard component
- [ ] ComposterManager component
- [ ] WinterProtectionManager component
- [ ] Aggiornare advice page

### Fase 3: Integrazione ⏳
- [ ] Collegare con InterventionWizard
- [ ] Collegare con Weather API
- [ ] Collegare con Certification System
- [ ] Notifiche push per urgenze

### Fase 4: AI Enhancement ⏳
- [ ] ML model per rotazione colture
- [ ] AI validation materiali compost
- [ ] Predizione efficacia protezioni
- [ ] Ottimizzazione suggerimenti

### Fase 5: Testing & Refinement ⏳
- [ ] Test end-to-end flussi
- [ ] Validazione con utenti reali
- [ ] Ottimizzazione performance
- [ ] Documentazione utente

---

## 📈 BENEFICI ATTESI

### Per Utenti
- ✅ Consigli azionabili, non solo informativi
- ✅ Tracking automatico per certificazioni
- ✅ Prevenzione errori (materiale infetto)
- ✅ Automazione basata su meteo
- ✅ Memoria storica per decisioni migliori

### Per Certificazioni
- ✅ Documentazione completa pratiche biologiche
- ✅ Foto evidenze per audit
- ✅ Report automatici
- ✅ Compliance tracking

### Per Produttività
- ✅ Riduzione malattie (rotazione corretta)
- ✅ Miglior fertilità suolo (compost qualità)
- ✅ Riduzione danni gelate (protezione tempestiva)
- ✅ Riduzione parassiti (controllo biologico)

---

## 🎯 METRICHE DI SUCCESSO

### Engagement
- Tasso utilizzo consigli attivi > 60%
- Completamento checklist > 70%
- Accettazione piani rotazione > 50%

### Qualità
- Riduzione malattie da rotazione errata: -40%
- Qualità compost migliorata: +30%
- Danni da gelate ridotti: -50%

### Certificazioni
- Tempo preparazione audit: -60%
- Conformità pratiche biologiche: 100%
- Documentazione completa: 100%

---

## 📝 NOTE TECNICHE

### Performance
- Indexes ottimizzati per query frequenti
- Caching suggerimenti AI
- Lazy loading checklist storiche

### Sicurezza
- RLS abilitato su tutte le tabelle
- Validazione input lato server
- Sanitizzazione foto upload

### Scalabilità
- Schema supporta multiple compostiere
- Checklist ricorrenti automatiche
- Archiving dati storici

---

**Status Implementazione**: 40% Completato
- ✅ Database schema
- ✅ Types
- ✅ 2/4 Services
- ⏳ UI Components
- ⏳ Integrations

**Prossimo Milestone**: Completare tutti i services e creare primo component UI (CropRotationPlanner)
