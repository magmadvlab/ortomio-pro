# 🧪 Guida Test Sistema Collaborativo AI

**Come vedere il sistema in azione**

---

## 📋 Prerequisiti

✅ Database remoto connesso (porta 3002)  
✅ Server in esecuzione  
✅ Utente loggato con almeno un orto  

---

## 🚀 Step 1: Applica Migration

### Via Supabase Dashboard

1. Apri https://supabase.com/dashboard/project/qhmujoivfxftlrcrluaj
2. Vai su **SQL Editor**
3. Copia il contenuto di `supabase/migrations/20260114120000_create_ai_feedback_system.sql`
4. Incolla nell'editor
5. Click **RUN**
6. Verifica che appaia "Success. No rows returned"

### Verifica Tabelle Create

```sql
-- Esegui questo per verificare
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'ai_suggestions',
  'user_decisions',
  'success_metrics',
  'learning_feedback',
  'ai_transparency_log'
);
```

Dovresti vedere 5 tabelle.

---

## 🎯 Step 2: Popola con Dati di Test

### Esegui Script di Test

```bash
# Assicurati che il server sia in esecuzione
npm run dev

# In un altro terminale
node test-collaborative-ai-system.js
```

### Cosa Crea lo Script

Lo script crea **4 suggerimenti AI di esempio**:

1. **🚨 Rischio Peronospora** (HIGH priority)
   - Tipo: Disease Prevention
   - Confidenza: 85%
   - Azione: Trattamento preventivo entro 48h

2. **💧 Ottimizzazione Irrigazione** (MEDIUM priority)
   - Tipo: Resource Saving
   - Confidenza: 88%
   - Risparmio: €6.30/settimana

3. **📈 Aumenta Resa Lattuga** (MEDIUM priority)
   - Tipo: Yield Optimization
   - Confidenza: 82%
   - Aumento resa: +25%

4. **🍅 Finestra Raccolta Pomodori** (HIGH priority)
   - Tipo: Harvest Timing
   - Confidenza: 88%
   - Data ottimale: 20 Gennaio

---

## 👀 Step 3: Visualizza Dashboard

### Apri la Pagina

```
http://localhost:3002/app/ai-collaborative
```

### Cosa Vedrai

#### 1. Performance Banner
- Score globale collaborazione AI-Utente
- Tasso accettazione
- Accuratezza media
- Soddisfazione
- Totale suggerimenti

#### 2. Suggerimenti Attivi
Ogni card mostra:
- Titolo e descrizione
- Confidenza AI (%)
- Predizioni (probabilità, risparmio, etc.)
- Azione suggerita con deadline
- 3 bottoni: **Accetta** / **Modifica** / **Rifiuta**

#### 3. Dettagli Espandibili
Click "Mostra dettagli completi" per vedere:
- Ragionamento AI completo
- Fonti dati usate
- Risultati attesi
- Alternative considerate

---

## 🔍 Step 4: Testa Trasparenza AI

### Vedi Come l'AI Decide

1. Su qualsiasi suggerimento, click **"Vedi come l'AI è arrivata a questa conclusione"**
2. Si apre il **Transparency Panel** con 4 tab:

#### Tab 1: Overview
- Albero decisionale
- Regole attivate
- Pesi applicati
- Modelli AI usati

#### Tab 2: Dati
- Dati meteo usati
- Dati suolo
- Dati salute piante
- Dati storici
- Preferenze utente

#### Tab 3: Calcoli
- Formula matematica
- Input di ogni step
- Output calcolato
- Soglie usate

#### Tab 4: Alternative
- Opzioni considerate
- Score di ogni opzione
- Perché non scelte

---

## ✅ Step 5: Testa Decisioni Utente

### Accetta Suggerimento

1. Click **Accetta** su un suggerimento
2. Sistema registra decisione
3. Suggerimento passa a stato "ACCEPTED"
4. Alert: "✅ Suggerimento accettato! L'AI imparerà dalle tue preferenze."

### Modifica Suggerimento

1. Click **Modifica**
2. Si apre dialog con parametri
3. Modifica valori (es: dosaggio da 200g a 150g)
4. Click "Applica Modifiche"
5. Sistema registra modifiche
6. Alert: "✏️ Suggerimento modificato! L'AI imparerà dalle tue preferenze."

### Rifiuta Suggerimento

1. Click **Rifiuta**
2. Si apre dialog per motivazione
3. Scrivi perché (es: "Troppo costoso")
4. Click "Conferma Rifiuto"
5. Sistema registra motivazione
6. Alert: "❌ Suggerimento rifiutato. L'AI adatterà i futuri suggerimenti."

---

## 📊 Step 6: Verifica Apprendimento

### Vai su Tab "Performance"

Vedrai:
- **Stats**: Accettati / Modificati / Rifiutati
- **Learning Insights**: Cosa sta imparando l'AI

Esempio insights:
```
🧠 Cosa sta Imparando l'AI

Pattern identificato: Preferisci soluzioni biologiche
Confidenza: 85% • Basato su 12 decisioni

Pattern identificato: Tendi a modificare quantità -20%
Confidenza: 72% • Basato su 8 modifiche

Adattamento: Futuri suggerimenti personalizzati
```

---

## 🔄 Step 7: Testa Ciclo Completo

### Scenario Completo

1. **Ricevi suggerimento** → "Rischio Peronospora"
2. **Vedi trasparenza** → Capisci perché l'AI lo suggerisce
3. **Decidi** → Accetti
4. **Implementa** → Applichi trattamento
5. **Traccia risultato** → Registri se ha funzionato
6. **Dai feedback** → Rating e commento
7. **AI impara** → Prossimi suggerimenti migliori

---

## 🧪 Test Avanzati

### Test Filtri

1. Usa filtri per priorità: CRITICAL / HIGH / MEDIUM / LOW
2. Verifica che suggerimenti si filtrino correttamente

### Test Storico

1. Vai su tab "Storico"
2. Click "Carica Storico"
3. Vedi tutti i suggerimenti passati

### Test Performance Score

Verifica calcolo score:
```
Performance Score = 
  Acceptance Rate (30%) +
  Accuracy (40%) +
  Satisfaction (30%)
```

---

## 🐛 Troubleshooting

### Nessun Suggerimento Visibile

```bash
# Verifica che lo script sia stato eseguito
node test-collaborative-ai-system.js

# Verifica nel database
# Supabase Dashboard → Table Editor → ai_suggestions
```

### Errore "Table doesn't exist"

```bash
# Riapplica migration
# Supabase Dashboard → SQL Editor → Esegui migration
```

### Performance Score = 0

È normale all'inizio! Serve:
- Almeno 1 decisione per acceptance rate
- Almeno 1 metrica per accuracy
- Almeno 1 feedback per satisfaction

---

## 📸 Screenshot Attesi

### Dashboard Principale
```
┌─────────────────────────────────────────┐
│ 🤝 Performance Collaborazione           │
│ Score: 0 (iniziale)                     │
│ ┌────┬────┬────┬────┐                  │
│ │ 0% │ 0% │ 0% │ 4  │                  │
│ └────┴────┴────┴────┘                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🚨 Rischio Peronospora sui Pomodori     │
│ Confidenza: 85% | Probabilità: 78%      │
│ [Accetta] [Modifica] [Rifiuta]          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 💧 Ottimizzazione Irrigazione           │
│ Confidenza: 88% | Risparmio: €6.30      │
│ [Accetta] [Modifica] [Rifiuta]          │
└─────────────────────────────────────────┘
```

### Transparency Panel
```
┌─────────────────────────────────────────┐
│ 👁️ Trasparenza AI                       │
│ [Overview] [Dati] [Calcoli] [Alternative]│
│                                          │
│ 🧠 Processo Decisionale                 │
│ ├─ Umidità > 80% → Rischio elevato      │
│ ├─ Temp 18-24°C → Favorevole            │
│ └─ Storico → Pattern confermato         │
│                                          │
│ Pesi Applicati:                          │
│ Dati meteo     ████████░░ 40%           │
│ Salute piante  ██████░░░░ 30%           │
│ Dati storici   ████░░░░░░ 20%           │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist Test Completo

- [ ] Migration applicata
- [ ] Script test eseguito
- [ ] Dashboard visibile
- [ ] 4 suggerimenti presenti
- [ ] Transparency panel funziona
- [ ] Accetta suggerimento funziona
- [ ] Modifica suggerimento funziona
- [ ] Rifiuta suggerimento funziona
- [ ] Performance tab visibile
- [ ] Learning insights presenti

---

## 🎯 Risultato Atteso

Dopo aver completato tutti gli step, avrai:

✅ Sistema collaborativo AI funzionante  
✅ 4 suggerimenti di test visibili  
✅ Trasparenza completa su decisioni AI  
✅ Possibilità di accettare/modificare/rifiutare  
✅ Sistema che impara dalle tue decisioni  
✅ Dashboard con performance tracking  

---

**Pronto per testare! 🚀**

Vai su: http://localhost:3002/app/ai-collaborative
