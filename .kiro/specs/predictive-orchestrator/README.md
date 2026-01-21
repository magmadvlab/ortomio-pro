# Sistema Predittivo Orchestrato - Quick Reference

**Status:** Design Complete - Ready for Implementation  
**Data:** 20 Gennaio 2026

---

## 📁 STRUTTURA SPEC

```
.kiro/specs/predictive-orchestrator/
├── README.md           ← Questo file (quick reference)
├── requirements.md     ← Requisiti dettagliati (user stories, acceptance criteria)
├── design.md          ← Design tecnico (architettura, database, algoritmi)
└── tasks.md           ← Task breakdown (40 task, 8 fasi, 17 settimane)
```

---

## 🎯 COSA FA QUESTO SISTEMA

Il **Sistema Predittivo Orchestrato** è un cervello centrale che:

1. **Coordina** tutti i servizi esistenti (meteo, irrigazione, nutrizione, salute)
2. **Traccia** TUTTI i parametri che influenzano la crescita vegetativa
3. **Correla** eventi multi-fattore con risultati (es: meteo + nutrizione → resa)
4. **Predice** resa, qualità, malattie basandosi su dati storici
5. **Raccomanda** azioni ottimali con timing preciso
6. **Impara** continuamente dai risultati

---

## 🏗️ ARCHITETTURA (7 Layer)

```
┌─────────────────────────────────────────────────────────┐
│ 1. PRESENTATION      Dashboard │ Mobile │ Notifications │
├─────────────────────────────────────────────────────────┤
│ 2. ORCHESTRATION     DirectorService ★NEW★              │
│                      (Priority │ Conflicts │ Sequence)   │
├─────────────────────────────────────────────────────────┤
│ 3. RECOMMENDATION    Actions │ Timing │ Resources        │
├─────────────────────────────────────────────────────────┤
│ 4. PREDICTION        Yield │ Quality │ Disease ★NEW★    │
├─────────────────────────────────────────────────────────┤
│ 5. ANALYSIS          Correlations │ Causality │ Patterns│
├─────────────────────────────────────────────────────────┤
│ 6. DATA COLLECTION   Weather │ Soil │ Growth │ Quality  │
│                      ✅ Existing │ ❌ New                │
├─────────────────────────────────────────────────────────┤
│ 7. DATA STORAGE      PostgreSQL (Supabase)              │
└─────────────────────────────────────────────────────────┘
```

---

## 🆕 COMPONENTI NUOVI

### 1. DirectorService (Orchestratore Centrale)
**File:** `services/directorService.ts`  
**Responsabilità:**
- Coordina tutti i servizi
- Calcola priorità azioni (0-100)
- Risolve conflitti tra raccomandazioni
- Sequenzia azioni ottimalmente
- Gestisce feedback loop

### 2. SoilMonitoringService
**File:** `services/soilMonitoringService.ts`  
**Traccia:** pH, EC, NPK, microelementi, tessitura, umidità multi-profondità

### 3. GrowthTrackingService
**File:** `services/growthTrackingService.ts`  
**Traccia:** Altezza, diametro, foglie, LAI, NDVI, biomassa

### 4. QualityTrackingService
**File:** `services/qualityTrackingService.ts`  
**Traccia:** Brix, acidità, colore, consistenza, shelf life

### 5. YieldPredictionEngine
**File:** `services/yieldPredictionEngine.ts`  
**Predice:** Resa finale con confidence intervals (accuracy > 80%)

### 6. DiseasePredictionEngine
**File:** `services/diseasePredictionEngine.ts`  
**Predice:** Probabilità malattie 7 giorni in anticipo (accuracy > 70%)

### 7. CorrelationEngine (Potenziato)
**File:** `services/correlationEngine.ts`  
**Calcola:** Correlazioni multi-fattore (Pearson, Spearman, Multiple Regression)

---

## 💾 DATABASE (8 Nuove Tabelle)

1. **soil_measurements** - Parametri terreno (chimici, fisici, biologici)
2. **growth_measurements** - Misure crescita (morfologici, indici, radicali)
3. **quality_measurements** - Parametri qualità (chimici, fisici, organolettici)
4. **multi_factor_correlations** - Correlazioni complesse con R², p-values
5. **predictions** - Previsioni con confidence intervals
6. **recommendations** - Raccomandazioni prioritizzate
7. **action_outcomes** - Risultati azioni (feedback loop)
8. **director_coordination_log** - Log coordinamento

---

## 📊 PARAMETRI TRACCIATI

### ✅ Già Implementati
- Meteo (temp, precipitazioni, umidità, vento, UV)
- GDD, ore freddo, stress indices
- Fase lunare
- Eventi automatici

### ❌ Da Implementare
- **Terreno:** 14 parametri (pH, EC, NPK, tessitura, umidità, ecc.)
- **Crescita:** 15 parametri (altezza, LAI, NDVI, biomassa, ecc.)
- **Qualità:** 18 parametri (Brix, acidità, colore, shelf life, ecc.)

---

## 🔬 ALGORITMI CHIAVE

### Prioritizzazione Azioni
```
Priority = Urgency(0-40) + Impact(0-30) + Feasibility(0-20) + Cost(0-10)
```

### Previsione Resa
```
Yield = BaseYield × (0.30×GDD + 0.25×Weather + 0.20×Nutrition + 0.15×Health + 0.10×Irrigation)
```

### Previsione Malattie
```
P(disease) = 1 / (1 + e^-(β0 + β1×weather + β2×susceptibility + β3×pressure + β4×history))
```

---

## 📈 METRICHE DI SUCCESSO

### Tecniche
- Accuracy previsioni resa > 80%
- Accuracy previsioni qualità > 75%
- Accuracy previsioni malattie > 70%
- Tempo risposta < 2 secondi

### Agronomiche
- Aumento resa +15-25%
- Miglioramento qualità +10-20%
- Riduzione perdite -40%
- Ottimizzazione acqua -20%

### Utente
- Adozione raccomandazioni > 80%
- Soddisfazione > 4.5/5
- Retention 6 mesi > 90%

---

## 🚀 ROADMAP IMPLEMENTAZIONE

### MVP (10 settimane)
1. **Fase 1:** Director Service (2 settimane)
2. **Fase 2:** Tracking Avanzato (3 settimane)
3. **Fase 4:** Prediction Engines base (3 settimane)
4. **Fase 5:** Recommendation Engine (2 settimane)

### v1.1 (7 settimane aggiuntive)
5. **Fase 3:** Correlation Engine (2 settimane)
6. **Fase 6:** Learning System (2 settimane)
7. **Fase 7:** Integration & Testing (2 settimane)
8. **Fase 8:** Deployment (1 settimana)

**Totale:** 17 settimane (circa 4 mesi)

---

## 📚 COME USARE QUESTA SPEC

### Per Sviluppatori
1. Leggi `requirements.md` per capire COSA costruire
2. Leggi `design.md` per capire COME costruire
3. Segui `tasks.md` per implementare passo-passo

### Per Product Manager
1. Leggi `requirements.md` per user stories e acceptance criteria
2. Usa `tasks.md` per pianificazione sprint
3. Monitora metriche di successo

### Per Stakeholder
1. Leggi questo README per overview
2. Leggi sezione "Obiettivi Business" in `requirements.md`
3. Monitora KPI agronomici e utente

---

## 🔗 LINK UTILI

### Documentazione
- [Requirements](./requirements.md) - Requisiti dettagliati
- [Design](./design.md) - Design tecnico completo
- [Tasks](./tasks.md) - Task breakdown e stime

### Analisi
- [ANALISI_SISTEMA_PREDITTIVO_ORCHESTRATO.md](../../../ANALISI_SISTEMA_PREDITTIVO_ORCHESTRATO.md) - Analisi completa sistema

### Servizi Esistenti
- `services/dailyDiaryService.ts` - Registrazione giornaliera
- `services/cultivationOrchestrator.ts` - Orchestratore colture
- `services/weatherService.ts` - Dati meteo
- `services/plantHealthMonitoringService.ts` - Salute piante

---

## ❓ FAQ

### Q: Quanto tempo ci vuole per implementare?
**A:** MVP in 10 settimane, sistema completo in 17 settimane (4 mesi).

### Q: Serve hardware speciale?
**A:** No per MVP. Input manuale parametri. Sensori IoT opzionali per v2.0.

### Q: Quanto è accurato?
**A:** Target accuracy: resa 80%, qualità 75%, malattie 70%. Migliora con dati storici.

### Q: Funziona offline?
**A:** No, richiede connessione per API meteo e coordinamento servizi.

### Q: Supporta tutte le colture?
**A:** Sì, parametri GDD configurabili per ogni coltura. Database include 11+ colture comuni.

### Q: Come impara il sistema?
**A:** Feedback loop: utente registra risultati → sistema confronta con previsioni → aggiorna modelli.

---

## 📞 SUPPORTO

Per domande o chiarimenti:
1. Consulta i documenti dettagliati (requirements, design, tasks)
2. Verifica analisi sistema esistente
3. Contatta il team di sviluppo

---

**Spec creata da:** Kiro AI Assistant  
**Data:** 20 Gennaio 2026  
**Versione:** 1.0.0  
**Status:** ✅ Ready for Implementation
