# Piano Integrazione Suggerimenti AI - Opzione B

**Data:** 14 Gennaio 2026  
**Obiettivo:** Widget integrati contestuali invece di pagine separate

---

## 🎯 Architettura Finale

### 1. Dashboard (Priorità ALTA)
**Widget:** `AISuggestionsWidget.tsx`
- Mostra top 3 suggerimenti CRITICAL/HIGH
- Compatto, sempre visibile
- Click su card → Espande dettagli inline
- Azioni: Accetta/Modifica/Rifiuta direttamente

### 2. Planner (Priorità ALTA)
**Tab:** "Suggerimenti AI" nel Planner esistente
- Suggerimenti filtrati per pianificazione
- Integrato con calendario
- Suggerimenti su semine, raccolti, rotazioni

### 3. Irrigazione (Priorità MEDIA)
**Widget:** Nella pagina irrigazione
- Solo suggerimenti tipo `RESOURCE_SAVING` (acqua)
- Calcoli risparmio idrico
- Integrato con sistema irrigazione esistente

### 4. Nutrizione (Priorità MEDIA)
**Widget:** Nella pagina nutrizione
- Solo suggerimenti tipo `DISEASE_PREVENTION`, `YIELD_OPTIMIZATION`
- Trattamenti consigliati
- Integrato con registro trattamenti

### 5. Analytics (Priorità BASSA)
**Sezione:** Performance AI
- Statistiche apprendimento
- Accuratezza predizioni
- Trend nel tempo

---

## 🗑️ Cosa Rimuovere

1. ❌ `/app/ai-predictions` - Pagina separata vecchia
2. ❌ `/app/ai-collaborative` - Pagina separata nuova
3. ❌ Link menu "Predizioni AI"
4. ❌ Link menu "AI Collaborativo"

---

## ✅ Cosa Creare

### Component Riutilizzabili

1. **`AISuggestionsWidget.tsx`** (Dashboard)
   - Props: `maxItems`, `priorities`, `types`
   - Compatto, card orizzontali
   - Espandibile inline

2. **`AISuggestionsPanel.tsx`** (Planner tab)
   - Lista completa filtrata
   - Filtri per tipo/priorità
   - Vista dettagliata

3. **`AISuggestionCompact.tsx`** (Card singola)
   - Versione compatta di `AISuggestionCard`
   - Azioni inline
   - Espandibile

---

## 📋 Step Implementazione

### Fase 1: Dashboard Widget (30 min)
1. Crea `components/ai/AISuggestionsWidget.tsx`
2. Integra in `components/shared/HomeDashboard.tsx`
3. Mostra top 3 suggerimenti urgenti

### Fase 2: Planner Tab (20 min)
1. Aggiungi tab "Suggerimenti" in Planner
2. Riusa `CollaborativeAIDashboard` con filtri
3. Integra con calendario

### Fase 3: Widget Contestuali (40 min)
1. Irrigazione → Widget risparmio idrico
2. Nutrizione → Widget trattamenti
3. Ogni widget filtra per tipo specifico

### Fase 4: Cleanup (10 min)
1. Rimuovi pagine separate
2. Rimuovi link menu
3. Aggiorna documentazione

---

## 🎨 Design Pattern

### Widget Dashboard
```tsx
<AISuggestionsWidget
  maxItems={3}
  priorities={['CRITICAL', 'HIGH']}
  showActions={true}
  compact={true}
/>
```

### Planner Tab
```tsx
<AISuggestionsPanel
  types={['PLANTING', 'HARVEST_TIMING', 'ROTATION']}
  showFilters={true}
  integrateWithCalendar={true}
/>
```

### Widget Irrigazione
```tsx
<AISuggestionsWidget
  types={['RESOURCE_SAVING']}
  context="irrigation"
  maxItems={2}
/>
```

---

## 🔄 Flusso Utente

**Dashboard:**
```
Login → Dashboard
  ↓
Vede widget "⚠️ 2 Suggerimenti Urgenti"
  ↓
Click su card → Espande dettagli
  ↓
[Accetta] → Suggerimento applicato
  ↓
Widget si aggiorna automaticamente
```

**Planner:**
```
Planner → Tab "Suggerimenti AI"
  ↓
Vede lista completa suggerimenti pianificazione
  ↓
Filtra per "Semine" → Vede solo suggerimenti semine
  ↓
Click "Accetta" → Aggiunge al calendario
```

**Irrigazione:**
```
Irrigazione → Vede widget "💧 Risparmia 30% acqua"
  ↓
Click "Dettagli" → Vede calcoli completi
  ↓
Click "Applica" → Aggiorna piano irrigazione
```

---

## 📊 Vantaggi Opzione B

✅ **Contestuale:** Suggerimenti dove servono  
✅ **Sempre visibile:** Non serve cercarli  
✅ **Integrato:** Parte del workflow normale  
✅ **Professionale:** UX pulita e funzionale  
✅ **Scalabile:** Facile aggiungere nuovi widget  

---

## ⏱️ Tempo Totale Stimato

- Fase 1 (Dashboard): 30 min
- Fase 2 (Planner): 20 min
- Fase 3 (Widget): 40 min
- Fase 4 (Cleanup): 10 min

**Totale: ~2 ore**

---

## 🚀 Prossimi Step

1. Conferma architettura
2. Inizio Fase 1: Dashboard Widget
3. Test con dati reali "orto di Rob"
4. Iterazione basata su feedback

---

**Pronto per iniziare Fase 1?**
