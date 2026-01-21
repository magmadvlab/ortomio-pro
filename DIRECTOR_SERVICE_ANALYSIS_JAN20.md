# Analisi Pre-Implementazione Director Service

**Data:** 20 Gennaio 2026  
**Obiettivo:** Verificare cosa esiste già prima di implementare

---

## ✅ COSA ESISTE GIÀ

### 1. Sistema Suggerimenti AI
**File:** `services/collaborativeAIService.ts`  
**Tabella:** `ai_suggestions`

**Metodi disponibili:**
- `createSuggestion()` - Crea suggerimento
- `getSuggestions()` - Ottieni suggerimenti con filtri
- `getActiveSuggestions()` - Suggerimenti attivi (pending)
- `getCriticalSuggestions()` - Suggerimenti critici
- `updateSuggestionStatus()` - Aggiorna stato
- `recordDecision()` - Registra decisione utente

**Struttura AISuggestion:**
```typescript
{
  id: string
  user_id: string
  garden_id?: string
  suggestion_type: 'PLANTING' | 'WATERING' | 'FERTILIZING' | 'PEST_CONTROL' | 'HARVESTING' | 'PRUNING' | 'GENERAL'
  action_priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED'
  title: string
  description: string
  reasoning: string
  confidence_score: number
  data_sources: string[]
  expected_impact?: any
  alternative_actions?: any[]
  created_at: string
}
```

### 2. Sistema Previsioni
**Tabella:** `yield_predictions`

**Campi:**
- Previsioni raccolto
- Confidence score
- Data prevista

### 3. Raccomandazioni Raccolta
**Tabella:** `harvest_recommendations`

**Campi:**
- Raccomandazioni per timing raccolta
- Basate su plant monitoring

### 4. Daily Diary Service
**File:** `services/dailyDiaryService.ts`

**Funzionalità:**
- Registrazione automatica giornaliera
- Calcoli GDD, stress indices
- Eventi automatici
- Previsioni fenologiche

### 5. Weather Service
**File:** `services/weatherService.ts`

**Metodi:**
- `getWeatherForLocation()`
- `getWeatherForUserLocation()`
- `getWeatherForGarden()`
- ❌ **NON HA** `getWeatherAlerts()` (usato erroneamente nel directorService)

### 6. Altri Servizi Esistenti
- `plantHealthMonitoringService.ts` - Monitoraggio salute
- `advancedIrrigationService.ts` - Irrigazione avanzata
- `advancedNutritionService.ts` - Nutrizione avanzata
- `aiSuggestionsService.ts` - Suggerimenti AI generici

---

## ❌ COSA MANCA

### 1. Tabella `recommendations`
La tabella che ho usato nel directorService **NON ESISTE** ancora.

**Serve creare:**
```sql
CREATE TABLE recommendations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  cultivation_id UUID,
  zone_id UUID,
  recommendation_type TEXT,
  category TEXT,
  priority INTEGER,
  urgency TEXT,
  title TEXT,
  description TEXT,
  reasoning TEXT,
  action_type TEXT,
  action_parameters JSONB,
  ...
)
```

### 2. Tabella `director_coordination_log`
**NON ESISTE** ancora.

### 3. Tabella `action_outcomes`
**NON ESISTE** ancora.

### 4. Metodi nei Servizi Esistenti
I servizi esistenti **NON HANNO** metodi `getRecommendations()`:
- ❌ `weatherService.getWeatherAlerts()`
- ❌ `healthService.getRecommendations()`
- ❌ `irrigationService.getRecommendations()`
- ❌ `nutritionService.getRecommendations()`

---

## 🔄 SOVRAPPOSIZIONI

### `ai_suggestions` vs `recommendations`
**Problema:** Abbiamo due sistemi simili!

**ai_suggestions (esistente):**
- Sistema collaborativo "4 mani"
- Focus su dialogo AI-Utente
- Feedback e learning
- Già integrato in UI

**recommendations (proposto):**
- Sistema orchestrato Director
- Focus su prioritizzazione e conflitti
- Coordinamento multi-servizio
- Da integrare

**DECISIONE NECESSARIA:**
1. **Unificare** - Usare solo `ai_suggestions` ed estenderlo
2. **Separare** - Mantenere entrambi con scopi diversi
3. **Migrare** - Sostituire `ai_suggestions` con `recommendations`

---

## 💡 RACCOMANDAZIONI

### Opzione A: ESTENDERE SISTEMA ESISTENTE (Consigliata)
**Pro:**
- Non duplicare codice
- Sfruttare sistema già funzionante
- UI già integrata
- Feedback loop già implementato

**Azioni:**
1. Estendere `ai_suggestions` con campi Director:
   - `priority_score` (0-100)
   - `urgency_breakdown` (urgency/impact/feasibility/cost)
   - `conflicts_with` (array IDs)
   - `sequencing_order`
   
2. Aggiungere metodi a `collaborativeAIService`:
   - `prioritizeSuggestions()`
   - `resolveConflicts()`
   - `sequenceActions()`
   
3. Creare `directorService` come **orchestratore** che:
   - Coordina servizi esistenti
   - Usa `collaborativeAIService` per salvare suggerimenti
   - Aggiunge logica prioritizzazione/conflitti

### Opzione B: SISTEMA PARALLELO
**Pro:**
- Separazione concerns
- Director per orchestrazione
- AI Suggestions per dialogo

**Contro:**
- Duplicazione
- Confusione utente
- Più complessità

### Opzione C: MIGRAZIONE COMPLETA
**Pro:**
- Sistema unificato nuovo
- Design ottimale

**Contro:**
- Riscrivere tutto
- Perdere lavoro esistente
- Tempo lungo

---

## 🎯 PIANO CORRETTO

### FASE 1: Analisi Completa (QUESTA)
- ✅ Verificare servizi esistenti
- ✅ Identificare sovrapposizioni
- ✅ Decidere strategia integrazione

### FASE 2: Estensione Sistema Esistente
1. **Estendere `ai_suggestions` table:**
   ```sql
   ALTER TABLE ai_suggestions ADD COLUMN priority_score INTEGER;
   ALTER TABLE ai_suggestions ADD COLUMN urgency_breakdown JSONB;
   ALTER TABLE ai_suggestions ADD COLUMN conflicts_with UUID[];
   ALTER TABLE ai_suggestions ADD COLUMN sequencing_order INTEGER;
   ```

2. **Creare tabelle mancanti:**
   - `director_coordination_log`
   - `action_outcomes` (o estendere `user_decisions`)

3. **Estendere `collaborativeAIService`:**
   - Aggiungere metodi prioritizzazione
   - Aggiungere metodi risoluzione conflitti

4. **Creare `directorService` leggero:**
   - Coordina servizi
   - Usa `collaborativeAIService` per storage
   - Focus su orchestrazione, non storage

### FASE 3: Integrazione Servizi
1. Aggiungere metodi `getRecommendations()` ai servizi:
   - `weatherService`
   - `healthService`
   - `irrigationService`
   - `nutritionService`

2. Ogni servizio genera suggerimenti nel formato `AISuggestion`

3. Director coordina e prioritizza

---

## 🚨 ERRORI NEL CODICE CREATO

### `services/directorService.ts` (appena creato)
**Problemi:**
1. ❌ Usa tabella `recommendations` che non esiste
2. ❌ Chiama `weatherService.getWeatherAlerts()` che non esiste
3. ❌ Duplica funzionalità di `collaborativeAIService`
4. ❌ Non integra con sistema esistente

**Azione:** RISCRIVERE usando sistema esistente

---

## ✅ PROSSIMI PASSI CORRETTI

1. **STOP implementazione attuale**
2. **Decidere strategia:** Opzione A (estendere esistente) - CONSIGLIATA
3. **Creare migration** per estendere `ai_suggestions`
4. **Estendere `collaborativeAIService`** con logica Director
5. **Creare `directorService`** come thin wrapper/orchestrator
6. **Aggiungere metodi** ai servizi esistenti
7. **Testare integrazione**

---

**Documento creato da:** Kiro AI Assistant  
**Data:** 20 Gennaio 2026  
**Status:** ⚠️ BLOCCO IMPLEMENTAZIONE - Analisi necessaria
