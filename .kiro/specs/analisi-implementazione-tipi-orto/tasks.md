# Tasks: Implementazione Colture Specializzate

## Status: Ready for Implementation

---

## FASE 1: QUICK WINS (1-2 settimane)

### 1. Wizard Creazione Orto - Idroponica

- [x] 1.1 Modificare GardenTypeWizard per aggiungere opzione "Idroponica"
  - [x] 1.1.1 Aggiungere tipo 'hydroponic' a SpaceType
  - [x] 1.1.2 Creare card UI con icona e descrizione
  - [x] 1.1.3 Gestire selezione e routing

- [x] 1.2 Creare sotto-menu selezione tipo sistema
  - [x] 1.2.1 Mostrare 6 tipi (NFT, DWC, Ebb&Flow, Drip, Wick, Kratky)
  - [x] 1.2.2 Per ogni tipo: descrizione, vantaggi, difficoltà
  - [x] 1.2.3 Permettere selezione

- [x] 1.3 Integrare HydroponicConfigForm nel wizard
  - [x] 1.3.1 Importare componente esistente
  - [x] 1.3.2 Passare tipo sistema selezionato
  - [x] 1.3.3 Gestire submit e salvataggio

- [x] 1.4 Testare flusso completo
  - [x] 1.4.1 Test creazione orto NFT
  - [x] 1.4.2 Test creazione orto DWC
  - [x] 1.4.3 Verificare salvataggio in database
  - [x] 1.4.4 Verificare redirect a dashboard

### 2. Menu Fragole nel Planner

- [ ] 2.1 Aggiungere categoria "Fragole" nel planner
  - [ ] 2.1.1 Creare sezione UI dedicata
  - [ ] 2.1.2 Aggiungere icona e titolo

- [ ] 2.2 Mostrare varietà da strawberryMasterSheets
  - [ ] 2.2.1 Importare master sheets
  - [ ] 2.2.2 Creare card per ogni varietà
  - [ ] 2.2.3 Mostrare: nome, tipo, finestra raccolta

- [ ] 2.3 Implementare filtri
  - [ ] 2.3.1 Filtro per tipo produzione (June-bearing/Day-neutral/Ever-bearing)
  - [ ] 2.3.2 Filtro per difficoltà
  - [ ] 2.3.3 Evidenziare varietà Basilicata come Pro

- [ ] 2.4 Collegare a wizard creazione task
  - [ ] 2.4.1 Click su varietà → apre wizard
  - [ ] 2.4.2 Pre-compilare dati da master sheet
  - [ ] 2.4.3 Salvare con strawberry_data

### 3. Dashboard Letture Idroponiche

- [ ] 3.1 Creare componente HydroponicDashboard
  - [ ] 3.1.1 Layout base con sezioni
  - [ ] 3.1.2 Sezione parametri attuali
  - [ ] 3.1.3 Sezione alert
  - [ ] 3.1.4 Sezione prossime operazioni

- [ ] 3.2 Integrare ReadingForm esistente
  - [ ] 3.2.1 Importare componente
  - [ ] 3.2.2 Gestire submit
  - [ ] 3.2.3 Aggiornare dashboard dopo submit

- [ ] 3.3 Mostrare storico letture
  - [ ] 3.3.1 Fetch ultimi 30 giorni
  - [ ] 3.3.2 Tabella con letture
  - [ ] 3.3.3 Grafici trend (pH, EC, temp)

- [ ] 3.4 Implementare alert automatici
  - [ ] 3.4.1 Definire range ottimali per tipo sistema
  - [ ] 3.4.2 Controllare ultima lettura
  - [ ] 3.4.3 Mostrare alert se fuori range
  - [ ] 3.4.4 Suggerire correzioni

---

## FASE 2: CORE FEATURES (3-4 settimane)

### 4. Ciclo Completo Gestione Fragole

- [ ] 4.1 Creare StrawberryDashboard
  - [ ] 4.1.1 Layout con sezioni: stato, operazioni, KPI
  - [ ] 4.1.2 Mostrare fase corrente
  - [ ] 4.1.3 Giorni a raccolta
  - [ ] 4.1.4 Operazioni stagionali

- [ ] 4.2 Implementare task specifici fragole
  - [ ] 4.2.1 Task gestione stoloni
  - [ ] 4.2.2 Task pacciamatura
  - [ ] 4.2.3 Task rinnovo impianto
  - [ ] 4.2.4 Collegare a calendario

- [ ] 4.3 Creare StrawberryHarvestForm
  - [ ] 4.3.1 Form con campi specifici (berrySize, harvestType)
  - [ ] 4.3.2 Validazioni
  - [ ] 4.3.3 Salvataggio con strawberry_harvest

- [ ] 4.4 Implementare KPI dashboard
  - [ ] 4.4.1 Resa totale
  - [ ] 4.4.2 Qualità media
  - [ ] 4.4.3 Brix medio
  - [ ] 4.4.4 Confronto con target

### 5. Monitoraggio Avanzato Idroponica

- [ ] 5.1 Creare ParameterCharts component
  - [ ] 5.1.1 Grafico pH ultimi 30 giorni
  - [ ] 5.1.2 Grafico EC ultimi 30 giorni
  - [ ] 5.1.3 Grafico temperatura ultimi 30 giorni
  - [ ] 5.1.4 Linee range ottimale

- [ ] 5.2 Implementare AlertSystem
  - [ ] 5.2.1 Definire soglie per tipo sistema
  - [ ] 5.2.2 Controllare parametri in real-time
  - [ ] 5.2.3 Generare alert
  - [ ] 5.2.4 Mostrare suggerimenti correzione

- [ ] 5.3 Creare hydroponicAnalysisService
  - [ ] 5.3.1 Calcolare trend parametri
  - [ ] 5.3.2 Identificare anomalie
  - [ ] 5.3.3 Suggerire ottimizzazioni

- [ ] 5.4 Implementare export dati
  - [ ] 5.4.1 Export CSV
  - [ ] 5.4.2 Export Excel
  - [ ] 5.4.3 Selezione periodo

### 6. Integrazione Director per Colture Specializzate

- [ ] 6.1 Creare hydroponicDirector.ts
  - [ ] 6.1.1 Funzione generateHydroponicSuggestions
  - [ ] 6.1.2 Check parametri fuori range
  - [ ] 6.1.3 Check manutenzione necessaria
  - [ ] 6.1.4 Generare UrgentAlert

- [ ] 6.2 Creare strawberryDirector.ts
  - [ ] 6.2.1 Funzione generateStrawberrySuggestions
  - [ ] 6.2.2 Check operazioni stagionali
  - [ ] 6.2.3 Check rinnovo impianto
  - [ ] 6.2.4 Generare UrgentAlert

- [ ] 6.3 Integrare con Director principale
  - [ ] 6.3.1 Modificare logic/director.ts
  - [ ] 6.3.2 Chiamare hydroponicDirector se garden.gardenType === 'Hydroponic'
  - [ ] 6.3.3 Chiamare strawberryDirector se task ha strawberry_data
  - [ ] 6.3.4 Unire suggerimenti in DailyPlan

- [ ] 6.4 Implementare daily briefing personalizzato
  - [ ] 6.4.1 Sezione dedicata colture specializzate
  - [ ] 6.4.2 Mostrare suggerimenti specifici
  - [ ] 6.4.3 Promemoria operazioni

---

## FASE 3: ADVANCED FEATURES (5-8 settimane)

### 7. Analisi Predittiva Idroponica

- [ ] 7.1 Creare hydroponicPredictiveEngine.ts
  - [ ] 7.1.1 Funzione predictNutrientConsumption
  - [ ] 7.1.2 Funzione identifyProblems
  - [ ] 7.1.3 Funzione optimizeParameters

- [ ] 7.2 Implementare previsione consumo nutrienti
  - [ ] 7.2.1 Analizzare storico EC
  - [ ] 7.2.2 Calcolare trend consumo
  - [ ] 7.2.3 Prevedere giorni rimanenti

- [ ] 7.3 Implementare identificazione pattern
  - [ ] 7.3.1 Analizzare instabilità pH
  - [ ] 7.3.2 Identificare pattern ricorrenti
  - [ ] 7.3.3 Suggerire soluzioni

- [ ] 7.4 Implementare ottimizzazione parametri
  - [ ] 7.4.1 Correlare parametri → rese
  - [ ] 7.4.2 Identificare parametri ottimali
  - [ ] 7.4.3 Suggerire modifiche

### 8. Learning System Fragole

- [ ] 8.1 Creare strawberryLearningEngine.ts
  - [ ] 8.1.1 Funzione analyzeVarietyPerformance
  - [ ] 8.1.2 Funzione generateYearOverYearReport
  - [ ] 8.1.3 Funzione identifyBestPractices

- [ ] 8.2 Implementare analisi performance varietà
  - [ ] 8.2.1 Raggruppare dati per varietà
  - [ ] 8.2.2 Calcolare metriche (resa, qualità, problemi)
  - [ ] 8.2.3 Rankare varietà

- [ ] 8.3 Implementare confronto anno su anno
  - [ ] 8.3.1 Fetch dati anno corrente e precedente
  - [ ] 8.3.2 Calcolare variazioni
  - [ ] 8.3.3 Generare insights

- [ ] 8.4 Creare strawberryAnalytics.ts
  - [ ] 8.4.1 Dashboard analytics
  - [ ] 8.4.2 Grafici comparativi
  - [ ] 8.4.3 Report fine stagione

### 9. Dashboard Unificato Colture Specializzate

- [ ] 9.1 Creare UnifiedDashboard component
  - [ ] 9.1.1 Layout con tabs per tipo coltura
  - [ ] 9.1.2 Sezione idroponica
  - [ ] 9.1.3 Sezione fragole
  - [ ] 9.1.4 Sezione acquaponica/aeroponica

- [ ] 9.2 Implementare KPIComparison
  - [ ] 9.2.1 Confronto rese tra sistemi
  - [ ] 9.2.2 Confronto efficienza
  - [ ] 9.2.3 Confronto qualità

- [ ] 9.3 Centralizzare alert
  - [ ] 9.3.1 Aggregare alert da tutti i sistemi
  - [ ] 9.3.2 Prioritizzare per urgenza
  - [ ] 9.3.3 Mostrare in dashboard unificato

- [ ] 9.4 Implementare daily briefing personalizzato
  - [ ] 9.4.1 Riassunto stato tutti i sistemi
  - [ ] 9.4.2 Operazioni prioritarie
  - [ ] 9.4.3 Suggerimenti del giorno

---

## FASE 4: AI & LEARNING (9-12 settimane)

### 10. Machine Learning per Ottimizzazione

- [ ] 10.1 Implementare ML model previsione resa
- [ ] 10.2 Implementare ottimizzazione parametri idroponici
- [ ] 10.3 Implementare raccomandazioni personalizzate
- [ ] 10.4 Implementare A/B testing automatico

### 11. Sistema Esperto Fragole

- [ ] 11.1 Implementare diagnosi problemi automatica
- [ ] 11.2 Implementare suggerimenti varietà basati su clima/suolo
- [ ] 11.3 Implementare pianificazione rotazione varietà
- [ ] 11.4 Implementare ottimizzazione finestre raccolta

---

## TESTING & QA

### Per Ogni Fase

- [ ] Unit tests per nuovi services
- [ ] Integration tests per flussi completi
- [ ] E2E tests per user journeys critici
- [ ] Performance tests per query database
- [ ] Accessibility tests per nuovi componenti

---

## DOCUMENTATION

### Per Ogni Fase

- [ ] Aggiornare README con nuove features
- [ ] Creare user guides per nuove funzionalità
- [ ] Documentare API/Services
- [ ] Creare video tutorials (opzionale)

---

## DEPLOYMENT

### Per Ogni Fase

- [ ] Code review
- [ ] Merge to main
- [ ] Deploy to staging
- [ ] QA su staging
- [ ] Deploy to production
- [ ] Monitor metrics

---

## NOTES

- Priorità: Fase 1 > Fase 2 > Fase 3 > Fase 4
- Fase 1 è MVP e dovrebbe essere completata per prima
- Ogni fase può essere rilasciata indipendentemente
- Testing e documentation sono paralleli all'implementazione
