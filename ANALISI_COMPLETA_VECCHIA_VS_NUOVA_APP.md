# Analisi Completa: Vecchia App vs Nuova App

**Data**: 15 Gennaio 2026  
**Status**: ✅ ANALISI COMPLETA

## Executive Summary

Dopo un'analisi approfondita del codice sorgente, è emerso che:

1. **La nuova app è SEMPLIFICATA** - Molte pagine sono state ridotte da centinaia di righe a poche decine
2. **La nuova app ha NUOVE FUNZIONALITÀ AI** - Planner e Advice sono stati espansi con AI
3. **23 pagine della vecchia app NON esistono nella nuova** - Alcune potrebbero essere critiche
4. **La vecchia app ha logica di autenticazione più complessa** - Gestione bypass, verifica email, restore automatico

---

## 📊 Statistiche Generali

| Metrica | Vecchia App | Nuova App | Differenza |
|---------|-------------|-----------|------------|
| **Pagine Totali** | 39 | 17 | -22 (-56%) |
| **Pagine Uniche Vecchia** | 23 | - | Mancanti |
| **Pagine Uniche Nuova** | - | 1 | `/planner-classic` |
| **Pagine Identiche** | 0 | 0 | Tutte modificate |

---

## 🔍 Analisi Dashboard Principale

### Dashboard Vecchia App (`vcchiortomio/vecchia app/app/(dashboard)/app/page.tsx`)

**Caratteristiche**:
- **Linee di codice**: ~500 righe
- **Complessità**: ALTA

**Funzionalità Presenti**:
1. ✅ **Sistema di autenticazione complesso**:
   - Verifica se online/offline
   - Gestione bypass auth (solo locale)
   - Verifica email obbligatoria
   - Listener auth state changes
   - Redirect automatico a `/auth` se non autenticato

2. ✅ **Sistema di onboarding multi-step**:
   - `UserOnboardingWizard` - Primo accesso utente
   - `GardenOnboarding` - Creazione orto semplice
   - `GardenTypeWizard` - Configurazione orto completa
   - Salvataggio preferences in database (utenti auth) o localStorage (offline)

3. ✅ **Sistema di ripristino automatico**:
   - `attemptAutoRestore()` - Ripristina dati da backup cloud
   - Banner di conferma ripristino
   - Loading screen durante restore

4. ✅ **Gestione multi-tier**:
   - `useTier()` hook per tier detection
   - Dashboard diverse per Consumer/Professional/Free
   - `isPro` flag per funzionalità premium

5. ✅ **Gestione errori robusta**:
   - Try/catch su tutte le operazioni
   - Fallback a LocalStorageProvider se Supabase fallisce
   - Alert informativi per l'utente

6. ✅ **UI condizionale**:
   - Loading states
   - Empty states con CTA
   - Banner di ripristino
   - Messaggi di benvenuto personalizzati

### Dashboard Nuova App (`app/app/page.tsx`)

**Caratteristiche**:
- **Linee di codice**: ~100 righe
- **Complessità**: BASSA

**Funzionalità Presenti**:
1. ✅ **Caricamento dati base**:
   - Carica gardens
   - Carica tasks
   - Imposta activeGarden automaticamente

2. ✅ **Handlers CRUD**:
   - `handleUpdateTask`
   - `handleUpdateGarden`
   - `refreshTasks`

3. ✅ **UI semplice**:
   - Loading spinner
   - Empty state con link a `/app/garden`
   - Render `HomeDashboard` component

**Funzionalità MANCANTI** (rispetto alla vecchia):
1. ❌ **Sistema di autenticazione** - Nessun controllo auth
2. ❌ **Onboarding multi-step** - Solo messaggio "Crea orto"
3. ❌ **Ripristino automatico** - Nessun auto-restore
4. ❌ **Gestione multi-tier** - Nessuna differenziazione tier
5. ❌ **Gestione errori** - Nessun fallback a LocalStorage
6. ❌ **Verifica email** - Nessun controllo email_confirmed_at
7. ❌ **Banner informativi** - Nessun feedback visivo restore

### 🎯 Raccomandazione Dashboard

**CRITICO**: La nuova dashboard è troppo semplificata. Mancano funzionalità essenziali:

**Da portare dalla vecchia alla nuova**:
1. Sistema autenticazione completo (online/offline, bypass, verifica email)
2. Onboarding multi-step (UserOnboardingWizard)
3. Auto-restore da backup cloud
4. Gestione errori con fallback LocalStorage
5. Banner informativi per restore/errori

---

## 🗓️ Analisi Planner

### Planner Vecchia App

**Caratteristiche**:
- **Linee di codice**: 130 righe
- **Complessità**: MEDIA

**Funzionalità**:
1. ✅ **Toggle view mode**: Calendar vs Planner classico
2. ✅ **IntegratedCalendarWithChallenges** - Calendario con challenge integrate
3. ✅ **Planner classico** - Vista griglia tradizionale
4. ✅ **AI Badge** - Indicatore "AI Powered"
5. ✅ **Quick stats** - Statistiche rapide
6. ✅ **Challenge system** - Sistema challenge giornaliere

### Planner Nuova App

**Caratteristiche**:
- **Linee di codice**: 425 righe (+295 righe)
- **Complessità**: ALTA

**Funzionalità**:
1. ✅ **5 tabs**: Planner AI, Suggerimenti AI, Calendario, Lista Task, Timeline
2. ✅ **SmartPlanner** - Planner intelligente con AI
3. ✅ **PlannerAISuggestions** - Tab dedicato suggerimenti AI
4. ✅ **TaskCalendar** - Calendario task avanzato
5. ✅ **TaskList** - Lista task con filtri
6. ✅ **Timeline** - Grafico andamento attività ultimi 7 giorni
7. ✅ **Statistiche avanzate** - Completate, In programma, Efficienza
8. ✅ **Attività recenti** - Lista ultimi 10 task completati
9. ✅ **Grafico a barre** - Visualizzazione attività per giorno

**Funzionalità MANCANTI** (rispetto alla vecchia):
1. ❌ **Challenge system** - Nessuna integrazione challenge
2. ❌ **IntegratedCalendarWithChallenges** - Componente non usato

**Funzionalità NUOVE** (non nella vecchia):
1. ✨ **Tab Suggerimenti AI** - Suggerimenti contestuali AI
2. ✨ **Timeline grafica** - Visualizzazione andamento
3. ✨ **Statistiche efficienza** - Metriche performance
4. ✨ **Lista task avanzata** - Filtri e ordinamento

### 🎯 Raccomandazione Planner

**BUONO**: La nuova versione è più completa e professionale.

**Da considerare**:
- Valutare se reintegrare il sistema challenge (se importante per gamification)
- La timeline e le statistiche sono un grande valore aggiunto

---

## 📄 Pagine Mancanti nella Nuova App

### 🔴 CRITICHE (Potrebbero essere essenziali)

1. **`/ai-predictions`** - Predizioni AI ✅ **ESISTE**
   - **Importanza**: ALTA
   - **Descrizione**: Sistema di predizioni AI per raccolti, meteo, malattie
   - **Status**: ✅ Servizio `aiPredictiveEngine` esiste e funziona
   - **Endpoint**: `/app/api/ai/predictions/route.ts`
   - **Componenti**: Integrato in `DominanceDashboard`, link in `/help`
   - **Azione**: ⚠️ Manca pagina dedicata `/app/ai-predictions` - Creare UI per visualizzare predizioni

2. **`/treatments`** - Trattamenti ✅ **INTEGRATO**
   - **Importanza**: ALTA
   - **Descrizione**: Gestione trattamenti fitosanitari
   - **Status**: ✅ Integrato in `/nutrition` con `TreatmentRecordDB`
   - **Componenti**: `NutritionStatsWidget`, sistema trattamenti AI
   - **Azione**: ✅ OK - Funzionalità presente in nutrition

3. **`/harvest`** - Raccolti ✅ **INTEGRATO**
   - **Importanza**: ALTA
   - **Descrizione**: Registrazione e analisi raccolti
   - **Status**: ✅ Tipo `HarvestLogData` esiste, integrato in analytics
   - **Servizi**: `predictiveAnalyticsService`, `yieldModelService`
   - **Componenti**: Integrato in analytics e timeline
   - **Azione**: ✅ OK - Funzionalità presente, ma valutare se serve pagina dedicata

4. **`/journal`** - Diario ✅ **ESISTE**
   - **Importanza**: ALTA
   - **Descrizione**: Diario operativo giornaliero
   - **Status**: ✅ Componente `OperationalDiary` esiste
   - **Servizi**: `operationalDiaryService` completo
   - **Componenti**: `UnifiedTimelineDiary`, `DiaryPlannerIntegration`
   - **Azione**: ⚠️ Manca pagina dedicata `/app/journal` - Creare route

5. **`/calendar`** - Calendario ✅ **INTEGRATO**
   - **Importanza**: MEDIA
   - **Descrizione**: Calendario dedicato
   - **Status**: ✅ Integrato in `/planner` come tab "Calendario"
   - **Componenti**: `TaskCalendar`, `ProfessionalCalendar`
   - **Azione**: ✅ OK - Funzionalità presente in planner

6. **`/plants`** - Piante ✅ **ESISTE**
   - **Importanza**: MEDIA
   - **Descrizione**: Gestione piante individuali
   - **Status**: ✅ Sistema completo individual plant tracking
   - **Componenti**: `SmartPlantManager`, `FieldPlantManager`, `PlantLifecycleManager`
   - **Servizi**: `individualPlantService`, `unifiedPlantTrackingService`
   - **Azione**: ⚠️ Manca pagina dedicata `/app/plants` - Creare route

### 🟡 MEDIE (Funzionalità utili ma non essenziali)

7. **`/almanacco`** - Almanacco
   - **Importanza**: MEDIA
   - **Descrizione**: Almanacco lunare e stagionale
   - **Azione**: Valutare se reintegrare

9. **`/guide`** - Guide
   - **Importanza**: MEDIA
   - **Descrizione**: Guide coltivazione (ora in `/help`?)
   - **Azione**: Verificare se contenuto è in `/help`

10. **`/search`** - Ricerca
    - **Importanza**: MEDIA
    - **Descrizione**: Ricerca globale nell'app
    - **Azione**: Valutare se aggiungere ricerca globale

11. **`/semenzaio`** - Semenzaio
    - **Importanza**: MEDIA
    - **Descrizione**: Gestione semenzaio
    - **Azione**: Verificare se integrato in planner

12. **`/progress`** - Progressi
    - **Importanza**: MEDIA
    - **Descrizione**: Tracking progressi utente
    - **Azione**: Verificare se integrato in analytics

### 🟢 BASSE (Funzionalità secondarie)


    - **Azione**: Probabilmente non necessaria

16. **`/solar-engine`** - Solar Engine
    - **Importanza**: BASSA
    - **Descrizione**: Calcoli energia solare
    - **Azione**: Valutare se funzionalità è usata

### 🔵 ADMIN/SPECIALI (Funzionalità specifiche)

17. **`/admin`** - Admin
    - **Importanza**: VARIABILE
    - **Descrizione**: Pannello amministrazione
    - **Azione**: Verificare se esiste pannello admin alternativo

18. **`/agronomist`** - Agronomo
    - **Importanza**: VARIABILE
    - **Descrizione**: Consultazioni agronomo
    - **Azione**: Verificare se funzionalità è disponibile

19. **`/compliance`** - Compliance
    - **Importanza**: VARIABILE
    - **Descrizione**: Gestione compliance (ora in `/certifications`?)
    - **Azione**: Verificare se integrato in certifications

20. **`/export`** - Export
    - **Importanza**: VARIABILE
    - **Descrizione**: Export dati
    - **Azione**: Verificare se funzionalità export esiste

21. **`/drone-operations`** - Operazioni Drone
    - **Importanza**: VARIABILE
    - **Descrizione**: Gestione droni
    - **Azione**: Verificare se integrato in smart hub

22. **`/blockchain-traceability`** - Tracciabilità Blockchain
    - **Importanza**: VARIABILE
    - **Descrizione**: Sistema tracciabilità blockchain
    - **Azione**: Verificare se integrato altrove

23. **`/pianifica`** - Pianifica
    - **Importanza**: BASSA
    - **Descrizione**: Probabilmente duplicato di `/planner`
    - **Azione**: Verificare se è duplicato

---

## 📋 Pagine Semplificate (Analisi Dettagliata)

### 1. `/mechanical-work` (-924 righe)

**Vecchia**: 1026 righe - Sistema completo gestione lavori meccanici
- Componenti: MechanicalWork, TillageWork, AccessoriesManager
- Gestione attrezzature, lavorazioni, accessori
- ProFeatureGate per funzionalità premium

**Nuova**: 102 righe - Versione semplificata
- Solo MechanicalWorkContent
- Suspense boundary per SSR

**Impatto**: ALTO - Persa gestione completa attrezzature e accessori

### 2. `/certifications` (-618 righe)

**Vecchia**: 683 righe - Dashboard certificazioni completo
- Componenti multipli: DocumentManager, ComplianceChecklist, DeadlineManager
- Statistiche, scadenze, documenti
- Icone e badge per stati

**Nuova**: 65 righe - Solo GlobalGapDashboard
- Versione minimalista

**Impatto**: ALTO - Persa gestione documenti e scadenze dettagliata

### 3. `/help` (-522 righe)

**Vecchia**: 689 righe - Sistema help completo
- Sezioni multiple con icone
- Guide dettagliate per ogni funzionalità
- Accordion con ChevronDown/ChevronRight

**Nuova**: 167 righe - Manuale semplificato
- Link a documentazione modulare
- Struttura più semplice

**Impatto**: MEDIO - Documentazione ora in file separati (docs/manual/)

### 4. `/orchard` (-434 righe)

**Vecchia**: 457 righe - Gestione frutteto completa
- CreateOrchardWizard
- Gestione task specifici frutteto
- ProFeatureGate

**Nuova**: 23 righe - Placeholder "Coming soon"

**Impatto**: CRITICO - Funzionalità frutteto completamente persa

### 5. `/vineyard` (-398 righe)

**Vecchia**: 421 righe - Gestione vigneto completa
- CreateOrchardWizard per vigneti
- Task specifici vigneto
- Icone Wine, Grape

**Nuova**: 23 righe - Placeholder "Coming soon"

**Impatto**: CRITICO - Funzionalità vigneto completamente persa

### 6. `/irrigation` (-371 righe)

**Vecchia**: 643 righe - Sistema irrigazione completo
- IrrigationSystem, IrrigationZone, WateringLog
- IrrigationMetrics, IrrigationSystemCard
- IrrigationZoneList, WateringHistory
- IrrigationZoneAnalytics
- Modal per creazione/modifica sistemi e zone
- WateringLogFormWithFieldRows

**Nuova**: 272 righe - Versione semplificata con AI
- IrrigationAISuggestionsWidget
- Metriche base
- Meno componenti

**Impatto**: ALTO - Persa gestione dettagliata zone e sistemi

### 7. `/nutrition` (-365 righe)

**Vecchia**: 527 righe - Sistema nutrizione completo
- TreatmentRecordDB, FertilizerApplicationLogDB
- Gestione per bed e row
- ProFeatureGate
- DatabaseConnectionStatus

**Nuova**: 162 righe - Versione semplificata con AI
- NutritionAISuggestionsWidget
- NutritionStatsWidget
- Meno dettagli

**Impatto**: ALTO - Persa gestione dettagliata trattamenti e fertilizzanti

### 8. `/olives` (-356 righe)

**Vecchia**: 379 righe - Gestione oliveto completa
- CreateOrchardWizard per oliveti
- Task specifici oliveto
- Icone CircleDot, Droplets

**Nuova**: 23 righe - Placeholder "Coming soon"

**Impatto**: CRITICO - Funzionalità oliveto completamente persa

---

## 📈 Pagine Espanse (Analisi Dettagliata)

### 1. `/planner` (+295 righe)

**Vecchia**: 130 righe - Planner base
- Toggle Calendar/Planner
- IntegratedCalendarWithChallenges
- Planner classico

**Nuova**: 425 righe - Planner professionale
- 5 tabs (Planner AI, Suggerimenti AI, Calendario, Lista, Timeline)
- SmartPlanner con AI
- Timeline grafica con statistiche
- Attività recenti
- Metriche efficienza

**Impatto**: POSITIVO - Grande miglioramento funzionalità

### 2. `/advice` (+245 righe)

**Vecchia**: 100 righe - Advice semplice
- Componente Advice base
- Suspense boundary

**Nuova**: 345 righe - Sistema consigli completo
- CropRotationPlanner
- BiologicalControlDashboard
- Icone e widget multipli
- Consigli attivi integrati

**Impatto**: POSITIVO - Sistema consigli molto più ricco

### 3. `/analytics` (+129 righe)

**Vecchia**: 232 righe - Analytics base
- HarvestAnalytics
- ROISummary
- AnalyticsTable
- ProFeatureGate

**Nuova**: 361 righe - Analytics avanzato
- Metriche multiple (Euro, TrendingUp, Award, etc.)
- Più visualizzazioni
- Dashboard più completo

**Impatto**: POSITIVO - Analytics più professionale

---

## 🎯 Raccomandazioni Prioritarie

### 🔴 URGENTE (Da fare subito)

1. **Ripristinare funzionalità colture specializzate**:
   - `/orchard` - Frutteto (attualmente placeholder)
   - `/vineyard` - Vigneto (attualmente placeholder)
   - `/olives` - Oliveto (attualmente placeholder)
   - **Azione**: Portare CreateOrchardWizard e logica specifica da vecchia app

2. **Integrare sistema autenticazione completo**:
   - Verifica email obbligatoria
   - Gestione online/offline
   - Auto-restore da backup
   - **Azione**: Portare logica auth da vecchia dashboard

3. **Creare pagine mancanti per funzionalità esistenti**:
   - ✅ `/ai-predictions` - Servizio esiste, manca UI → **Creare pagina**
   - ✅ `/journal` - Componente esiste, manca route → **Creare pagina**
   - ✅ `/plants` - Sistema esiste, manca route → **Creare pagina**
   - ✅ `/treatments` - Integrato in nutrition → **OK**
   - ✅ `/harvest` - Integrato in analytics → **Valutare se serve pagina dedicata**
   - ✅ `/calendar` - Integrato in planner → **OK**

### 🟡 IMPORTANTE (Da fare presto)

4. **Ripristinare gestione dettagliata**:
   - Irrigation: zone, sistemi, analytics
   - Nutrition: trattamenti, fertilizzanti per bed/row
   - Mechanical work: attrezzature, accessori
   - Certifications: documenti, scadenze
   - **Azione**: Valutare se semplificazione è intenzionale o perdita

5. **Integrare onboarding multi-step**:
   - UserOnboardingWizard
   - Salvataggio preferences
   - **Azione**: Portare da vecchia dashboard

6. **Sistema challenge**:
   - Verificare se gamification è priorità
   - IntegratedCalendarWithChallenges
   - **Azione**: Decidere se reintegrare

### 🟢 OPZIONALE (Nice to have)

7. **Funzionalità secondarie**:
   - Almanacco
   - Ricette
   - Ricerca globale
   - Semenzaio
   - Progress tracking
   - **Azione**: Valutare in base a feedback utenti

---

## 📊 Matrice Decisionale

| Funzionalità | Vecchia App | Nuova App | Priorità | Azione |
|--------------|-------------|-----------|----------|--------|
| **Dashboard Auth** | ✅ Completa | ❌ Mancante | 🔴 CRITICA | Portare |
| **Onboarding Multi-step** | ✅ Completa | ❌ Mancante | 🔴 CRITICA | Portare |
| **Auto-restore** | ✅ Presente | ❌ Mancante | 🔴 CRITICA | Portare |
| **Frutteto** | ✅ Completo | ❌ Placeholder | 🔴 CRITICA | Portare |
| **Vigneto** | ✅ Completo | ❌ Placeholder | 🔴 CRITICA | Portare |
| **Oliveto** | ✅ Completo | ❌ Placeholder | 🔴 CRITICA | Portare |
| **AI Predictions** | ✅ Pagina | ❌ Mancante | 🔴 CRITICA | Verificare |
| **Treatments** | ✅ Pagina | ❌ Mancante | 🔴 CRITICA | Verificare |
| **Harvest** | ✅ Pagina | ❌ Mancante | 🔴 CRITICA | Verificare |
| **Journal** | ✅ Pagina | ❌ Mancante | 🔴 CRITICA | Verificare |
| **Irrigation Dettagliata** | ✅ Completa | ⚠️ Semplificata | 🟡 ALTA | Valutare |
| **Nutrition Dettagliata** | ✅ Completa | ⚠️ Semplificata | 🟡 ALTA | Valutare |
| **Mechanical Work Dettagliata** | ✅ Completa | ⚠️ Semplificata | 🟡 ALTA | Valutare |
| **Certifications Dettagliata** | ✅ Completa | ⚠️ Semplificata | 🟡 ALTA | Valutare |
| **Planner AI** | ⚠️ Base | ✅ Avanzato | ✅ OK | Mantenere |
| **Advice AI** | ⚠️ Base | ✅ Avanzato | ✅ OK | Mantenere |
| **Analytics** | ⚠️ Base | ✅ Avanzato | ✅ OK | Mantenere |
| **Challenge System** | ✅ Presente | ❌ Mancante | 🟢 MEDIA | Valutare |
| **Almanacco** | ✅ Pagina | ❌ Mancante | 🟢 BASSA | Valutare |
| **Ricette** | ✅ Pagina | ❌ Mancante | 🟢 BASSA | Valutare |

---

## 🚀 Piano d'Azione Consigliato

### Fase 1: Funzionalità Critiche (1-2 giorni)

1. **Portare sistema autenticazione completo** da vecchia dashboard
   - File: `app/app/page.tsx`
   - Includere: verifica email, online/offline, auto-restore

2. **Verificare dove sono finite le pagine critiche**:
   - `/ai-predictions` → Cercare componente predizioni
   - `/treatments` → Cercare in nutrition o altrove
   - `/harvest` → Cercare in analytics o dashboard
   - `/journal` → Cercare componente diario

3. **Ripristinare colture specializzate**:
   - Portare `CreateOrchardWizard` completo
   - Implementare `/orchard`, `/vineyard`, `/olives`
   - Usare codice da vecchia app come base

### Fase 2: Gestione Dettagliata (2-3 giorni)

4. **Valutare semplificazioni**:
   - Irrigation: decidere se ripristinare zone/sistemi dettagliati
   - Nutrition: decidere se ripristinare gestione bed/row
   - Mechanical work: decidere se ripristinare attrezzature
   - Certifications: decidere se ripristinare documenti/scadenze

5. **Integrare onboarding**:
   - Portare `UserOnboardingWizard`
   - Implementare salvataggio preferences

### Fase 3: Funzionalità Secondarie (1-2 giorni)

6. **Challenge system** (se priorità):
   - Portare `IntegratedCalendarWithChallenges`
   - Integrare in planner

7. **Altre funzionalità** (in base a feedback):
   - Almanacco
   - Ricette
   - Ricerca globale

---

## 📝 Conclusioni

### Punti di Forza Nuova App

1. ✅ **Planner molto più avanzato** - Timeline, statistiche, AI suggestions
2. ✅ **Sistema consigli completo** - CropRotation, BiologicalControl
3. ✅ **Analytics professionale** - Metriche avanzate
4. ✅ **Codice più pulito** - Meno righe, più manutenibile
5. ✅ **Servizi backend completi** - aiPredictiveEngine, operationalDiaryService, individualPlantService

### Punti Critici Nuova App

1. ❌ **Mancano 3 pagine critiche** - `/ai-predictions`, `/journal`, `/plants` (servizi esistono, mancano UI)
2. ❌ **Colture specializzate incomplete** - Frutteto, vigneto, oliveto sono placeholder
3. ❌ **Autenticazione semplificata** - Manca verifica email, auto-restore
4. ❌ **Gestione dettagliata persa** - Irrigation, nutrition, mechanical work semplificati
5. ❌ **Onboarding base** - Manca wizard multi-step

### Scoperta Importante ✨

**La maggior parte delle funzionalità "mancanti" ESISTONO già come servizi/componenti**, ma mancano le pagine dedicate per accedervi:

- ✅ **AI Predictions**: Servizio completo (`aiPredictiveEngine`) → Manca solo UI
- ✅ **Journal**: Componente completo (`OperationalDiary`) → Manca solo route
- ✅ **Plants**: Sistema completo (`individualPlantService`) → Manca solo route
- ✅ **Treatments**: Integrato in `/nutrition` → OK
- ✅ **Harvest**: Integrato in analytics → OK
- ✅ **Calendar**: Integrato in `/planner` → OK

### Raccomandazione Finale

**La nuova app è più vicina al completamento di quanto sembrava!** 

La maggior parte del lavoro backend è già fatto. Servono principalmente:

1. **3 nuove pagine** per esporre funzionalità esistenti (1-2 giorni)
2. **Sistema auth completo** dalla vecchia app (1 giorno)
3. **Colture specializzate** dalla vecchia app (2-3 giorni)

**Totale stimato**: 4-6 giorni di lavoro per completare la migrazione.

**NON eliminare la vecchia app ancora** - Serve come riferimento per:
- Sistema autenticazione completo
- Wizard colture specializzate
- UI per pagine mancanti

---

**Prossimi Passi Consigliati**:

1. **Creare `/app/ai-predictions/page.tsx`** - UI per visualizzare predizioni AI
2. **Creare `/app/journal/page.tsx`** - Route per OperationalDiary
3. **Creare `/app/plants/page.tsx`** - Route per SmartPlantManager
4. **Portare sistema auth** da vecchia dashboard
5. **Implementare colture specializzate** (orchard, vineyard, olives)
