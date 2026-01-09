# SISTEMA METEO-INTELLIGENTE PER TASK SCHEDULING

## Problema Risolto

**SCENARIO:**
1. Sistema dice: "Trattamento fogliare tra 15 giorni"
2. Giorno 14: previsioni dicono "Domani pioggia 20mm"
3. **PROBLEMA:** Utente deve ricordarsi manualmente e riprogrammare
4. **RISCHIO:** Se dimentica → trattamento inefficace (pioggia lava prodotto)

**SOLUZIONE:**
- Sistema controlla automaticamente meteo ogni sera
- Se meteo incompatibile, trova primo giorno utile
- Notifica utente: "Task riprogrammato automaticamente"
- Memoria permanente: registra perché riprogrammato

---

## Architettura Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                  WEATHER-AWARE TASK SCHEDULER                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. TASK CREATION                                              │
│     └─> GardenTask con nextDueDate = oggi + 15 giorni         │
│                                                                 │
│  2. NIGHTLY CHECK (Eseguito ogni sera ore 20:00)              │
│     ├─> getWeatherForecast7Days(garden.coordinates)            │
│     ├─> checkTomorrowTasksWeather(garden, tasks)               │
│     └─> Se meteo incompatibile:                                │
│         ├─> findNextSuitableDay(task, forecast)                │
│         ├─> updateTask.nextDueDate = newDate                   │
│         └─> createNotification(user, reason)                   │
│                                                                 │
│  3. USER NOTIFICATION                                          │
│     ├─> Push notification: "Task riprogrammato per meteo"      │
│     ├─> In-app alert: WeatherTaskAlert component               │
│     └─> Opzioni: Conferma / Mantieni data originale           │
│                                                                 │
│  4. LOGGING                                                    │
│     └─> task.notes += "Riprogrammato da X a Y per: pioggia"   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Requisiti Meteo per Tipo Task

### 1. Trattamenti Fogliari (Treatment)

**Requisiti CRITICI:**
- ❌ **NO pioggia** (maxRain: 0mm)
- ✅ **Tempo asciutto per 24h DOPO** applicazione
- ✅ **Vento moderato** (max 20 km/h per evitare deriva)

**Perché:**
- Pioggia lava il prodotto → trattamento inefficace
- Vento forte → deriva su colture non target
- Servono 24-48h per assorbimento fogliare

**Esempio:**
```typescript
Task: Trattamento Pomodori con rame (anti-peronospora)
Programmato: 15 Maggio

Forecast 15 Maggio:
- Pioggia: 12mm ❌
- Forecast 16 Maggio: Pioggia 8mm ❌

Sistema trova: 17 Maggio (sereno, 0mm pioggia)
Azione: Riprogramma automaticamente al 17 Maggio
Notifica: "⚠️ Trattamento rinviato al 17/05 (pioggia prevista 15-16)"
```

---

### 2. Fertilizzazione (Fertilize)

**Requisiti:**
- ⚠️ **Pioggia leggera OK** (max 5mm) - aiuta distribuzione
- ✅ **NO pioggia intensa** (>10mm dilavamento)
- ✅ **Temperatura minima >5°C** (terreno non ghiacciato)

**Perché:**
- Pioggia leggera aiuta distribuzione granulare
- Pioggia intensa dilava fertilizzante → spreco + inquinamento
- Terreno ghiacciato = no assorbimento

**Esempio:**
```typescript
Task: Concimazione NPK 15-15-15
Programmato: 10 Marzo

Forecast 10 Marzo:
- Pioggia: 25mm ❌ (troppo intensa)
- Temperatura: 12°C ✅

Sistema trova: 12 Marzo (pioggia 3mm ✅, temp 14°C ✅)
Azione: Riprogramma al 12 Marzo
Notifica: "Concimazione rinviata al 12/03 (pioggia intensa prevista)"
```

---

### 3. Potatura (Prune)

**Requisiti:**
- ⚠️ **Preferibile tempo asciutto** (max 2mm pioggia)
- ✅ **Temperatura >0°C** (OK anche con gelo leggero)

**Perché:**
- Tagli freschi bagnati → rischio infezioni fungine
- Potatura invernale OK anche con gelo

**Esempio:**
```typescript
Task: Potatura Melo
Programmato: 20 Febbraio

Forecast 20 Febbraio:
- Pioggia: 8mm ❌
- Temperatura: 5°C ✅

Sistema trova: 22 Febbraio (sereno, 0mm)
Azione: Riprogramma al 22 Febbraio
Notifica: "Potatura rinviata al 22/02 (rischio infezioni con tagli bagnati)"
```

---

### 4. Semina (Sowing)

**Requisiti:**
- ✅ **Terreno lavorabile** (max 10mm pioggia nei 2 giorni prima)
- ✅ **Temperatura minima adeguata** (dipende da pianta, media 8°C)
- ✅ **NO caldo estremo** (max 35°C)

**Perché:**
- Terreno troppo bagnato → compattamento, no ossigenazione
- Temperatura bassa → seme non germina
- Caldo estremo → stress germinazione

**Esempio:**
```typescript
Task: Semina Pomodori
Programmato: 15 Aprile

Forecast 13-14 Aprile:
- Pioggia 30mm (terreno fangoso) ❌

Sistema trova: 17 Aprile (terreno asciugato, temp 18°C ✅)
Azione: Riprogramma al 17 Aprile
Notifica: "Semina rinviata al 17/04 (terreno troppo bagnato dopo piogge)"
```

---

### 5. Trapianto (Transplant)

**Requisiti:**
- ✅ **Pioggia leggera aiuta** (max 5mm)
- ✅ **Temperatura mite** (min 10°C, max 32°C)
- ✅ **NO vento forte** (piantine delicate)

**Perché:**
- Pioggia leggera aiuta attecchimento
- Temperature estreme → stress trapianto
- Vento disidrata piantine

---

### 6. Irrigazione (Watering)

**Requisiti:**
- ✅ **Se pioggia >10mm → CANCELLA task**

**Perché:**
- Pioggia sufficiente = no spreco acqua
- Sistema ottimizza automaticamente

**Esempio:**
```typescript
Task: Irrigazione Orto
Programmato: 18 Giugno

Forecast 18 Giugno:
- Pioggia: 15mm ✅

Azione: CANCELLA task automaticamente
Notifica: "✅ Irrigazione cancellata (pioggia sufficiente prevista)"
```

---

### 7. Raccolta (Harvest)

**Requisiti:**
- ⚠️ **Preferibile tempo asciutto** (max 5mm)

**Perché:**
- Prodotti bagnati → peggiore conservazione
- Funghi post-raccolta

---

## Flusso Operativo

### Scenario 1: Check Automatico Notturno

**Ore 20:00 ogni sera:**
```typescript
1. Sistema esegue: checkTomorrowTasksWeather(garden, tasks)

2. Per ogni task di domani:
   - Fetch forecast domani
   - Verifica requisiti meteo
   - Se incompatibile → trova primo giorno utile

3. Genera notifiche:
   - Push notification
   - Email (se abilitato)
   - In-app alert

4. User apre app al mattino:
   - Vede WeatherTaskAlert
   - Opzioni:
     ✅ Conferma riprogrammazione
     ❌ Mantieni data originale (override)
```

### Scenario 2: Check On-Demand

**User apre app:**
```typescript
1. HomeDashboard monta WeatherTaskWidget

2. Widget esegue: checkTomorrowTasksWeather()

3. Se alert presenti:
   - Badge rosso su widget
   - Click → espande alert
   - User conferma/rifiuta riprogrammazione
```

### Scenario 3: Batch Reschedule (ogni 7 giorni)

**Domenica sera:**
```typescript
1. Sistema esegue: rescheduleTasksBasedOnWeather(garden, tasks, 7)

2. Analizza TUTTI task prossimi 7 giorni

3. Riprogramma in batch:
   - Trattamenti incompatibili
   - Irrigazioni non necessarie (pioggia)
   - Trapianti con gelo

4. Report riepilogativo via email
```

---

## Implementazione Tecnica

### 1. Service: weatherAwareTaskScheduler.ts

**Funzioni principali:**

```typescript
// Analizza compatibilità meteo per un singolo task
analyzeTaskWeatherSuitability(
  task: GardenTask,
  scheduledDate: Date,
  forecast: WeatherForecast[]
): WeatherTaskAnalysis

// Trova primo giorno utile alternativo
findNextSuitableDay(
  task: GardenTask,
  currentScheduled: Date,
  forecast: WeatherForecast[]
): string | null

// Check task di domani (run ogni sera)
checkTomorrowTasksWeather(
  garden: Garden,
  tasks: GardenTask[]
): Promise<RescheduleNotification[]>

// Batch reschedule prossimi 7 giorni
rescheduleTasksBasedOnWeather(
  garden: Garden,
  tasks: GardenTask[],
  daysAhead: number = 7
): Promise<{
  analyses: WeatherTaskAnalysis[]
  rescheduled: RescheduleNotification[]
  updatedTasks: GardenTask[]
}>

// Helper: cancella irrigazioni se pioggia
cancelIrrigationIfRain(
  garden: Garden,
  wateringTasks: GardenTask[],
  rainThreshold: number = 10
): Promise<GardenTask[]>
```

---

### 2. Component: WeatherTaskAlert.tsx

**UI Components:**

```tsx
// Alert dettagliato con azioni
<WeatherTaskAlert
  garden={garden}
  tasks={tasks}
  onTaskUpdate={handleTaskUpdate}
  autoCheck={true}
/>

// Widget compatto per dashboard
<WeatherTaskWidget
  garden={garden}
  tasks={tasks}
  onTaskUpdate={handleTaskUpdate}
/>
```

**Features:**
- ✅ Mostra task incompatibili con meteo
- ✅ Suggerisce data alternativa
- ✅ Bottone "Riprogramma" one-click
- ✅ Bottone "Mantieni" (override utente)
- ✅ Dismissable (nascondi alert)

---

### 3. Integration: HomeDashboard.tsx

**Aggiungere widget meteo:**

```tsx
import { WeatherTaskWidget } from '@/components/shared/WeatherTaskAlert'

// In HomeDashboard, dopo "Cosa fare oggi":
<WeatherTaskWidget
  garden={activeGarden}
  tasks={gardenTasks}
  onTaskUpdate={async (task) => {
    await storageProvider.updateTask(task.id, task)
    const updatedTasks = await storageProvider.getTasks(activeGarden.id)
    setGardenTasks(updatedTasks || [])
  }}
/>
```

---

### 4. Cron Job Setup

**Vercel Cron (quando passi a Pro):**

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/weather-task-scheduler",
      "schedule": "0 20 * * *"
    }
  ]
}
```

**API Route:**

```typescript
// app/api/cron/weather-task-scheduler/route.ts
import { rescheduleTasksBasedOnWeather } from '@/services/weatherAwareTaskScheduler'

export async function GET(request: Request) {
  // Fetch tutti giardini con task attivi
  const gardens = await getActiveGardens()

  for (const garden of gardens) {
    const tasks = await getTasks(garden.id)
    const { rescheduled, updatedTasks } = await rescheduleTasksBasedOnWeather(
      garden,
      tasks,
      7
    )

    // Salva task aggiornati
    for (const task of updatedTasks) {
      await updateTask(task.id, task)
    }

    // Invia notifiche utente
    if (rescheduled.length > 0) {
      await sendRescheduleEmail(garden.userId, rescheduled)
      await createPushNotification(garden.userId, rescheduled)
    }
  }

  return Response.json({ success: true })
}
```

**Alternative (piano Hobby):**

```typescript
// GitHub Actions (gratis)
// .github/workflows/weather-scheduler.yml
name: Weather Task Scheduler
on:
  schedule:
    - cron: '0 20 * * *' # Ogni sera ore 20:00 UTC
  workflow_dispatch: # Trigger manuale

jobs:
  schedule:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run scheduler
        run: |
          curl -X GET https://ortomio.app/api/cron/weather-task-scheduler \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

---

## Logging e Tracciabilità

### 1. Task Notes (storico modifiche)

Ogni riprogrammazione viene loggata in `task.notes`:

```
[Auto-riprogrammato da 15/05/2025 per meteo: Pioggia prevista: 12mm (richiesto 0mm)]
```

### 2. Notification History Table

```sql
CREATE TABLE weather_reschedule_logs (
  id UUID PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id),
  task_id UUID REFERENCES garden_tasks(id),

  original_date DATE NOT NULL,
  new_date DATE NOT NULL,
  reason TEXT NOT NULL,

  user_action TEXT CHECK (user_action IN ('accepted', 'rejected', 'auto')),

  weather_data JSONB, -- Forecast snapshot

  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Esempi Pratici

### Esempio 1: Oliveto - Trattamento Rame

**Contesto:**
- Varietà: Frantoio
- Trattamento: Ossicloruro di Rame (anti-occhio di pavone)
- Programmato: 20 Marzo 2025

**Forecast 19 Marzo (sera):**
```
20 Mar: Pioggia 15mm, Temp 14°C
21 Mar: Pioggia 8mm, Temp 12°C
22 Mar: Sereno, Temp 16°C ✅
```

**Sistema:**
1. Analizza task "Treatment - Olivo Frantoio"
2. Requisiti: NO pioggia, 24h asciutto dopo
3. 20 Mar ❌ (pioggia)
4. 21 Mar ❌ (pioggia)
5. 22 Mar ✅ (sereno + 23 Mar sereno)
6. **Riprogramma al 22 Marzo**

**Notifica Utente (ore 20:00 del 19 Marzo):**
```
⚠️ TASK RIPROGRAMMATO

Trattamento Rame - Olivo Frantoio
Previsto: 20 Marzo → Nuovo: 22 Marzo

Motivo: Pioggia prevista 20-21 Marzo (trattamento inefficace)

[Conferma] [Mantieni 20 Marzo]
```

---

### Esempio 2: Vigneto - Trattamento Poltiglia Bordolese

**Contesto:**
- Varietà: Sangiovese
- Trattamento: Poltiglia bordolese (anti-peronospora)
- Programmato: 5 Maggio

**Forecast 4 Maggio (sera):**
```
5 Mag: Pioggia 22mm, Vento 35km/h ❌
6 Mag: Pioggia 5mm, Vento 15km/h ❌
7 Mag: Sereno, Vento 10km/h ✅
```

**Sistema:**
1. Requisiti: NO pioggia, vento <20km/h
2. 5 Mag ❌ (pioggia forte + vento)
3. 6 Mag ❌ (pioggia leggera, ma forecast 7 Mag OK)
4. 7 Mag ✅
5. **Riprogramma al 7 Maggio**

**Utente conferma → Sistema registra:**
```
task.notes += "[Auto-riprogrammato da 05/05 a 07/05 per meteo:
Pioggia 22mm + vento 35km/h previsti (trattamento inefficace)]"
```

---

### Esempio 3: Frutteto - Diradamento Mele

**Contesto:**
- Varietà: Golden Delicious
- Task: Diradamento frutti
- Programmato: 15 Giugno

**Forecast 14 Giugno:**
```
15 Giu: Temp Max 38°C ❌ (caldo estremo)
16 Giu: Temp Max 35°C ⚠️
17 Giu: Temp Max 28°C ✅
```

**Sistema:**
1. Requisiti: Temp max <35°C (evita stress pianta)
2. 15 Giu ❌ (38°C)
3. 16 Giu ❌ (35°C limite)
4. 17 Giu ✅ (28°C)
5. **Riprogramma al 17 Giugno**

**Notifica:**
```
🌡️ CALDO ESTREMO

Diradamento Mele
Previsto: 15 Giugno → Nuovo: 17 Giugno

Motivo: Temperatura 38°C prevista (stress per pianta)
Meglio operare con temperature <30°C

[Conferma] [Mantieni (sconsigliato)]
```

---

## Benefits per l'Utente

### 1. Zero Spreco
- ❌ Trattamenti lavati via dalla pioggia
- ❌ Fertilizzanti dilavati
- ❌ Irrigazioni inutili con pioggia
- ✅ **Risparmio €€€**

### 2. Ottimizzazione Efficacia
- ✅ Trattamenti applicati in condizioni ideali
- ✅ Fertilizzanti assorbiti gradualmente
- ✅ Trapianti che attecchiscono meglio

### 3. Riduzione Carico Mentale
- ❌ "Devo ricordarmi di controllare meteo"
- ✅ **Sistema pensa per te**
- ✅ Notifica solo quando serve

### 4. Tracciabilità Professionale
- 📊 Storico completo riprogrammazioni
- 📊 Analisi correlazione meteo → risultati
- 📊 Esportabile per certificazioni

### 5. Memoria Permanente
- 💾 "Perché ho spostato il trattamento?"
- 💾 Risposta: "Pioggia 15mm prevista"
- 💾 Consultabile dopo anni

---

## Roadmap Futur

### FASE 1: MVP (Corrente)
- ✅ Requisiti meteo base per 7 task types
- ✅ Check giornaliero automatico
- ✅ UI notifiche + conferma/rifiuta
- ✅ Logging in task.notes

### FASE 2: Advanced (Q2 2025)
- 🔮 ML per apprendimento pattern utente
  - "Utente preferisce sempre trattare al mattino presto"
  - "Utente tende a confermare riprogrammazioni"
- 🔮 Integrazione sensori IoT
  - Soil moisture → cancella irrigazione se terreno umido
  - Leaf wetness → ritarda trattamenti
- 🔮 Multi-day planning
  - "Questa settimana hai 3 trattamenti. Giorni migliori: Mer, Ven"

### FASE 3: Pro Features (Q3 2025)
- 🔮 Historical weather analysis
  - "Ultima volta trattamenti a Mag → meteo simile"
- 🔮 Climate change adaptation
  - "Trend ultimi 5 anni: piogge più intense a Giugno"
  - "Anticipa trattamenti di 1 settimana"
- 🔮 Pest/disease prediction
  - Peronospora risk = f(pioggia, temp, umidità)
  - Trigger trattamenti preventivi automatici

---

## Metriche di Successo

**KPI da tracciare:**

1. **Efficacia Riprogrammazioni**
   - % task riprogrammati evitano meteo sfavorevole ✅
   - Target: >95%

2. **User Acceptance Rate**
   - % utenti che confermano riprogrammazione vs rifiutano
   - Target: >80% conferma

3. **Risparmio Economico**
   - € risparmiati in trattamenti non sprecati
   - Calcolo: (task riprogrammati × costo medio prodotto)

4. **Engagement**
   - % utenti che aprono notifica meteo
   - Target: >70%

5. **Retention**
   - Utenti con meteo-scheduler attivo vs disattivato
   - Ipotesi: +30% retention con feature attiva

---

## Conclusioni

Il **Sistema Meteo-Intelligente** trasforma OrtoMio da **calendario passivo** a **assistente proattivo**:

- 🧠 **Pensa per l'utente** → controlla meteo ogni sera
- ⚡ **Agisce automaticamente** → riprogramma task
- 💬 **Comunica chiaramente** → "Perché ho spostato"
- 💾 **Ricorda tutto** → storico completo
- 💰 **Risparmia denaro** → no sprechi

Questa feature è un **game-changer** per agricoltori professionisti che:
- Gestiscono 10+ ettari
- Hanno 50+ task/settimana
- Non possono permettersi errori (margini stretti)

**Nessun competitor** offre riprogrammazione meteo-aware automatica con questo livello di intelligenza.

**This is a KILLER FEATURE.** 🚀
