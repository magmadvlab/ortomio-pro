# 🤖 Guida Completa: AI Predictions e Integrazione con Planner

**Data:** 14 Gennaio 2026  
**Status:** Analisi e Piano di Integrazione

---

## 📊 Situazione Attuale

### 1. AI Predictions (Pagina Separata)
**Location:** `/app/ai-predictions`

**Funzionalità:**
- ✅ Predizioni malattie (7-14 giorni anticipo)
- ✅ Stime di resa (kg/m², finestra raccolta)
- ✅ Ottimizzazione risorse (acqua, fertilizzanti)
- ✅ Confidence score e probabilità
- ✅ Raccomandazioni dettagliate

**Problema:** È una pagina separata, non integrata nel flusso di lavoro

### 2. Planner AI Chat
**Location:** Componente floating in `/app/planner`

**Funzionalità:**
- ✅ Chat conversazionale
- ✅ Consigli su cosa piantare
- ✅ Suggerimenti consociazioni
- ✅ Calendario semine
- ✅ Domande suggerite

**Problema:** Non usa le predizioni AI, solo risposte pre-programmate

---

## 🎯 Come Funzionano le AI Predictions

### Architettura Attuale

```
User → /app/ai-predictions
         ↓
    Page Component
         ↓
    API /api/ai/predictions
         ↓
    aiPredictiveEngine Service
         ↓
    3 Funzioni Principali:
    ├── predictDiseases()
    ├── predictYield()
    └── optimizeResources()
```

### Input Dati

```typescript
// Dati richiesti per predizioni
{
  gardenId: string,
  weatherData: {
    temperature: { current, min, max, forecast15Days },
    humidity: number,
    precipitation: { current, forecast15Days },
    windSpeed, pressure, uvIndex, soilTemperature
  },
  soilData: {
    ph, ec, moisture, temperature,
    nutrients: { nitrogen, phosphorus, potassium, organicMatter },
    compaction, lastAnalysis
  },
  plantHealthData: [{
    plantId, healthScore, growthStage,
    stressIndicators, diseases, pests,
    nutritionalStatus, lastUpdate
  }],
  tasks: GardenTask[]
}
```

### Output Predizioni

#### A. Disease Predictions
```typescript
{
  id: string,
  plantName: string,
  disease: string,
  probability: number,        // 0-1
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  leadTime: number,          // giorni di anticipo
  symptoms: string[],
  preventiveMeasures: string[],
  treatments: string[],
  confidence: number         // 0-1
}
```

#### B. Yield Predictions
```typescript
{
  id: string,
  plantName: string,
  variety: string,
  expectedYield: number,     // kg/m²
  yieldRange: {
    min: number,
    max: number,
    confidence: number
  },
  harvestWindow: {
    start: Date,
    end: Date,
    optimal: Date
  },
  qualityScore: number,      // 0-100
  recommendations: string[]
}
```

#### C. Resource Optimizations
```typescript
{
  id: string,
  type: 'WATER' | 'FERTILIZER' | 'LABOR' | 'ENERGY',
  currentUsage: number,
  optimizedUsage: number,
  savings: {
    amount: number,
    percentage: number,
    cost: number
  },
  recommendations: string[]
}
```

---

## 🔗 Piano di Integrazione

### Fase 1: Integrazione nel Planner AI Chat

#### Obiettivo
Rendere il Planner AI Chat "intelligente" usando le predizioni reali invece di risposte pre-programmate.

#### Implementazione

**1. Modificare PlannerAIChat per usare predizioni**

```typescript
// components/planner/PlannerAIChatIntegrated.tsx

const generateAIResponse = async (question: string, garden: any) => {
  // Carica predizioni AI
  const predictions = await fetch(`/api/ai/predictions?gardenId=${garden.id}`)
    .then(res => res.json())
  
  const { diseasePredicitions, yieldPredictions, resourceOptimizations } = predictions.data
  
  // Analizza domanda e usa predizioni reali
  if (question.includes('malattie') || question.includes('problemi')) {
    // Usa diseasePredicitions reali
    const criticalDiseases = diseasePredicitions.filter(d => d.severity === 'CRITICAL')
    
    return {
      content: `🚨 **Analisi AI Predittiva:**
      
Ho rilevato ${criticalDiseases.length} rischi critici nel tuo orto:

${criticalDiseases.map(d => `
**${d.disease}** su ${d.plantName}
• Probabilità: ${(d.probability * 100).toFixed(0)}%
• Anticipo: ${d.leadTime} giorni
• Azioni immediate:
${d.preventiveMeasures.map(m => `  - ${m}`).join('\n')}
`).join('\n')}`,
      suggestions: [
        'Come prevenire queste malattie?',
        'Prodotti biologici consigliati',
        'Calendario trattamenti preventivi'
      ]
    }
  }
  
  if (question.includes('resa') || question.includes('raccolto')) {
    // Usa yieldPredictions reali
    const totalYield = yieldPredictions.reduce((sum, p) => sum + p.expectedYield, 0)
    
    return {
      content: `📊 **Previsione Resa AI:**
      
Resa totale prevista: **${totalYield.toFixed(1)} kg/m²**

${yieldPredictions.map(p => `
**${p.plantName}** (${p.variety})
• Resa: ${p.expectedYield} kg/m² (range: ${p.yieldRange.min}-${p.yieldRange.max})
• Raccolta ottimale: ${new Date(p.harvestWindow.optimal).toLocaleDateString('it-IT')}
• Qualità prevista: ${p.qualityScore}/100
`).join('\n')}`,
      suggestions: [
        'Come aumentare la resa?',
        'Quando iniziare il raccolto?',
        'Consigli per migliorare qualità'
      ]
    }
  }
  
  if (question.includes('acqua') || question.includes('irrigazione')) {
    // Usa resourceOptimizations reali
    const waterOpt = resourceOptimizations.find(r => r.type === 'WATER')
    
    if (waterOpt) {
      return {
        content: `💧 **Ottimizzazione Irrigazione AI:**
        
**Analisi attuale:**
• Uso attuale: ${waterOpt.currentUsage} litri/settimana
• Uso ottimale: ${waterOpt.optimizedUsage} litri/settimana
• Risparmio: ${waterOpt.savings.percentage.toFixed(1)}% (-€${waterOpt.savings.cost.toFixed(2)}/mese)

**Raccomandazioni:**
${waterOpt.recommendations.map(r => `• ${r}`).join('\n')}`,
        suggestions: [
          'Come implementare queste ottimizzazioni?',
          'Sistema di irrigazione automatico',
          'Sensori di umidità del suolo'
        ]
      }
    }
  }
  
  // Risposta generica con overview predizioni
  return {
    content: `🤖 **Analisi AI Completa:**
    
**Stato Salute Orto:**
• Rischi malattie: ${diseasePredicitions.length} rilevati
• Resa prevista: ${yieldPredictions.reduce((s, p) => s + p.expectedYield, 0).toFixed(1)} kg/m²
• Potenziale risparmio: €${resourceOptimizations.reduce((s, r) => s + r.savings.cost, 0).toFixed(2)}/mese

Chiedi specificamente su malattie, resa o ottimizzazione risorse per dettagli!`,
    suggestions: [
      'Mostra rischi malattie',
      'Previsione raccolti',
      'Come risparmiare acqua?',
      'Ottimizzazione fertilizzanti'
    ]
  }
}
```

**2. Widget Predizioni nel Planner**

```typescript
// components/planner/AIPredictionsWidget.tsx

export function AIPredictionsWidget({ garden }: { garden: Garden }) {
  const [predictions, setPredictions] = useState(null)
  
  useEffect(() => {
    loadPredictions()
  }, [garden.id])
  
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="h-6 w-6 text-purple-600" />
        <h3 className="font-semibold text-purple-900">AI Predictions</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {/* Rischi Malattie */}
        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium">Rischi</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {predictions?.diseasePredicitions.length || 0}
          </div>
          <p className="text-xs text-gray-600">malattie previste</p>
        </div>
        
        {/* Resa Prevista */}
        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Resa</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {predictions?.yieldPredictions.reduce((s, p) => s + p.expectedYield, 0).toFixed(1) || '0'}
          </div>
          <p className="text-xs text-gray-600">kg/m² previsti</p>
        </div>
        
        {/* Risparmio */}
        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Risparmio</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            €{predictions?.resourceOptimizations.reduce((s, r) => s + r.savings.cost, 0).toFixed(0) || '0'}
          </div>
          <p className="text-xs text-gray-600">al mese</p>
        </div>
      </div>
      
      <button
        onClick={() => router.push('/app/ai-predictions')}
        className="mt-4 w-full text-sm text-purple-600 hover:text-purple-700 font-medium"
      >
        Vedi dettagli completi →
      </button>
    </div>
  )
}
```

### Fase 2: Notifiche Proattive

#### Alert Automatici

```typescript
// components/planner/AIPredictionsAlerts.tsx

export function AIPredictionsAlerts({ garden }: { garden: Garden }) {
  const [criticalAlerts, setCriticalAlerts] = useState([])
  
  useEffect(() => {
    checkCriticalAlerts()
  }, [garden.id])
  
  const checkCriticalAlerts = async () => {
    const predictions = await fetch(`/api/ai/predictions?gardenId=${garden.id}`)
      .then(res => res.json())
    
    const critical = predictions.data.diseasePredicitions
      .filter(d => d.severity === 'CRITICAL' && d.leadTime <= 7)
    
    setCriticalAlerts(critical)
  }
  
  if (criticalAlerts.length === 0) return null
  
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-2">
            ⚠️ {criticalAlerts.length} Rischi Critici Rilevati
          </h3>
          {criticalAlerts.map(alert => (
            <div key={alert.id} className="mb-3 last:mb-0">
              <p className="text-sm font-medium text-red-800">
                {alert.disease} su {alert.plantName}
              </p>
              <p className="text-xs text-red-700">
                Probabilità {(alert.probability * 100).toFixed(0)}% • 
                Agisci entro {alert.leadTime} giorni
              </p>
              <div className="mt-2 flex gap-2">
                <button className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
                  Crea Intervento
                </button>
                <button className="text-xs bg-white text-red-600 px-3 py-1 rounded border border-red-600 hover:bg-red-50">
                  Vedi Dettagli
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Fase 3: Integrazione nel Dashboard

#### Dashboard Widget

```typescript
// components/shared/HomeDashboard.tsx - Aggiungi widget

<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Widget esistenti */}
  
  {/* Nuovo: AI Predictions Summary */}
  <div className="lg:col-span-3">
    <AIPredictionsSummary garden={activeGarden} />
  </div>
</div>
```

---

## 🎨 UI/UX Migliorata

### 1. Badge AI nel Menu

```typescript
// Aggiungi badge "AI" accanto a funzionalità predittive
<MenuItem href="/app/ai-predictions">
  <Brain size={20} />
  <span>AI Predictions</span>
  <span className="ml-auto bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
    AI
  </span>
</MenuItem>
```

### 2. Floating AI Assistant Migliorato

```typescript
// Mostra badge con numero di alert
<button className="fixed bottom-6 right-6 ...">
  <MessageCircle size={24} />
  {criticalAlerts > 0 && (
    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
      {criticalAlerts}
    </div>
  )}
</button>
```

### 3. Timeline Predizioni

```typescript
// Mostra timeline predizioni nel calendario
<TaskCalendar
  tasks={tasks}
  predictions={predictions}  // Nuovo prop
  onDateClick={(date) => {
    // Mostra predizioni per quella data
  }}
/>
```

---

## 📊 Flusso Utente Integrato

### Scenario 1: Utente Apre Planner

```
1. User → /app/planner
2. Sistema carica predizioni AI in background
3. Mostra widget con summary:
   - 2 rischi malattie
   - Resa prevista: 45 kg/m²
   - Risparmio: €25/mese
4. Se rischi critici → Alert in alto
5. AI Chat usa predizioni per risposte
```

### Scenario 2: Utente Chiede Consiglio

```
User: "Cosa devo fare questa settimana?"

AI Chat (usa predizioni):
"🤖 Basandomi sulle predizioni AI:

**URGENTE (entro 3 giorni):**
• Trattamento preventivo peronospora su pomodori
  (Probabilità 85%, anticipo 5 giorni)

**QUESTA SETTIMANA:**
• Ridurre irrigazione del 30% (risparmio €8)
• Preparare raccolta lattuga (finestra ottimale: 18-22 Gen)

**PROSSIMA SETTIMANA:**
• Seminare ravanelli (resa prevista: 2.5 kg/m²)

Vuoi che crei gli interventi automaticamente?"
```

### Scenario 3: Creazione Intervento Automatica

```
User: "Sì, crea intervento per peronospora"

Sistema:
1. Apre InterventionWizard
2. Pre-compila con dati da predizione:
   - Tipo: Trattamento preventivo
   - Prodotto: Rame (da raccomandazioni AI)
   - Location: Zona pomodori
   - Data: Entro 3 giorni
   - Note: "Predizione AI: 85% probabilità peronospora"
3. User conferma e salva
```

---

## 🚀 Implementazione Prioritaria

### Quick Wins (1-2 ore)

1. ✅ **Widget Predizioni nel Planner**
   - Mostra summary 3 metriche
   - Link a pagina dettagli

2. ✅ **Alert Critici**
   - Banner rosso se rischi entro 7 giorni
   - Bottone "Crea Intervento"

3. ✅ **Badge AI nel Menu**
   - Indica funzionalità AI
   - Numero alert se presenti

### Medio Termine (3-5 ore)

4. ✅ **AI Chat Integrato**
   - Usa predizioni reali
   - Risposte contestuali
   - Crea interventi da chat

5. ✅ **Dashboard Widget**
   - Summary predizioni in home
   - Grafici trend
   - Quick actions

### Lungo Termine (1-2 giorni)

6. ✅ **Notifiche Push**
   - Alert automatici rischi critici
   - Reminder azioni consigliate
   - Report settimanale AI

7. ✅ **Timeline Predizioni**
   - Calendario con predizioni
   - Visualizzazione grafica
   - Drag & drop interventi

---

## 📝 Conclusione

**Situazione Attuale:**
- ✅ AI Predictions funzionanti ma separate
- ✅ Planner AI Chat con risposte pre-programmate
- ❌ Nessuna integrazione tra i due

**Dopo Integrazione:**
- ✅ Predizioni visibili ovunque
- ✅ AI Chat usa dati reali
- ✅ Alert proattivi
- ✅ Creazione interventi automatica
- ✅ UX fluida e integrata

**Beneficio Utente:**
- 🎯 Informazioni AI sempre disponibili
- ⚡ Azioni immediate da predizioni
- 🤖 Assistente veramente intelligente
- 💰 Risparmio tempo e risorse

---

**Vuoi che implementi l'integrazione? Posso iniziare dai Quick Wins!**

---

**Documentazione aggiornata al 14 Gennaio 2026**
