# Componenti Calendario Lunare

Sistema di calendario lunare proattivo per suggerimenti di semina, trapianto, raccolta e potatura basati sulle fasi lunari tradizionali.

## Componenti Disponibili

### 1. LunarWindowCalendar

Widget completo che mostra le prossime 3 finestre lunari ideali per un'operazione specifica.

**Utilizzo**:
```tsx
import { LunarWindowCalendar } from '@/components/lunar/LunarWindowCalendar'

<LunarWindowCalendar
  operation="sowing"
  plantCategory="FRUITING"
  plantName="Pomodoro"
  onSelectDate={(date, window) => {
    console.log('Selezionata data:', date)
    console.log('Finestra lunare:', window)
  }}
  maxWindows={3}
/>
```

**Props**:
- `operation`: Tipo operazione ('sowing' | 'transplant' | 'harvest' | 'pruning')
- `plantCategory`: Categoria pianta ('LEAFY' | 'FRUITING' | 'ROOT' | 'LEGUME' | 'GENERIC')
- `plantName`: Nome pianta (opzionale, per display)
- `onSelectDate`: Callback quando utente seleziona una data (opzionale)
- `maxWindows`: Numero massimo finestre da mostrare (default: 3)

**Features**:
- ✅ Evidenzia finestra lunare ATTIVA in tempo reale
- 📅 Mostra date esatte di inizio/fine finestra
- 🌙 Emoji fase lunare (🌒 crescente, 🌘 calante)
- ⏰ Countdown giorni mancanti alla prossima finestra
- 💡 Spiegazione tradizione contadina

### 2. LunarAdviceWidget

Widget compatto per dashboard che mostra fase lunare corrente e consigli.

**Utilizzo**:
```tsx
import { LunarAdviceWidget } from '@/components/lunar/LunarAdviceWidget'

// Versione completa
<LunarAdviceWidget
  operation="sowing"
  plantCategory="FRUITING"
/>

// Versione compatta
<LunarAdviceWidget
  operation="sowing"
  plantCategory="FRUITING"
  compact={true}
/>
```

**Props**:
- `operation`: Tipo operazione (default: 'sowing')
- `plantCategory`: Categoria pianta (default: 'FRUITING')
- `compact`: Modalità compatta per sidebar (default: false)

**Features**:
- 🌙 Fase lunare corrente con emoji
- 📊 Progress bar ciclo lunare (29.5 giorni)
- ✅ Operazioni ideali per oggi
- 📅 Prossima finestra ideale (se non attiva)
- 💡 Spiegazione saggezza contadina

## Funzioni Logiche

### getNextLunarWindows()

Calcola le prossime N finestre lunari ideali per un'operazione.

```typescript
import { getNextLunarWindows } from '@/logic/lunarCalendar'

const windows = getNextLunarWindows(
  'sowing',      // operazione
  'FRUITING',    // categoria pianta
  new Date(),    // data partenza
  3              // numero finestre
)

// Risultato:
// [
//   {
//     startDate: Date,
//     endDate: Date,
//     phase: 'waxing',
//     phaseName: 'Luna Crescente',
//     idealFor: ['Semina frutti', 'Trapianto', ...],
//     daysFromNow: 0,
//     isActive: true
//   },
//   ...
// ]
```

### getNextIdealDate()

Ottiene la prossima data singola ideale per un'operazione.

```typescript
import { getNextIdealDate } from '@/logic/lunarCalendar'

const nextDate = getNextIdealDate('sowing', 'ROOT', new Date())

// Risultato:
// {
//   date: Date,
//   reason: 'Prossima Luna Calante dal 18 Febbraio',
//   daysFromNow: 5
// }
```

### calculateMoonPhase()

Calcola la fase lunare per una data specifica.

```typescript
import { calculateMoonPhase } from '@/logic/lunarCalendar'

const moonInfo = calculateMoonPhase(new Date())

// Risultato:
// {
//   phase: 'WaxingCrescent',
//   name: 'Crescente',
//   isWaxing: true,
//   isWaning: false,
//   daysInCycle: 5.2
// }
```

## Regole Tradizionali

### Luna Crescente (da Nuova a Piena)
**Ideale per**:
- ✅ Semina piante da foglia e frutto (pomodori, lattuga, zucchine)
- ✅ Trapianto (migliore radicazione)
- ✅ Raccolta frutti (più succosi)
- ✅ Innesti

**Ragione**: I liquidi risalgono verso la superficie, favorendo germinazione e sviluppo aereo.

### Luna Calante (da Piena a Nuova)
**Ideale per**:
- ✅ Semina radici e bulbi (carote, cipolle, patate)
- ✅ Potatura (meno stress per la pianta)
- ✅ Raccolta foglie (più saporite e concentrate)
- ✅ Concimazione di fondo

**Ragione**: I liquidi si ritirano verso le radici, favorendo sviluppo sotterraneo e conservazione.

## Integrazione Director

Il sistema è già integrato nel Director in 2 punti:

1. **Baseline Prompts** (Gennaio-Febbraio semine indoor):
   - Calcola automaticamente prossime finestre Luna Crescente
   - Mostra opzioni "SEMINA OGGI" se finestra attiva
   - Suggerisce date future con countdown giorni

2. **Trapianti da Piantine**:
   - Verifica fase lunare ideale per trapianto
   - Posticipa data suggerita se non in fase corretta

## Esempio Prompt Generato

**Se Luna Crescente ATTIVA**:
```
🌒 Semine Indoor - Luna Crescente ATTIVA

Hai semi indoor utilizzabili per: Pomodoro (2), Peperoncino (1).
Il peperoncino ha tempi lunghi: conviene partire ora.

🌙 Fase Lunare: Crescente (Luna Crescente) fino al 26/02/2025.
✅ Momento IDEALE per seminare piante da frutto (favorisce germinazione)!

Scegli quando seminare:
- ✅ OGGI: Pomodoro - San Marzano
- ✅ OGGI: Pomodoro - Cuor di Bue
- 14 Mar: Peperoncino - Prossima Luna Crescente (tra 18 gg)
```

**Se Luna Calante**:
```
Semine Indoor (Prossima Luna Crescente: 18 feb)

Hai semi indoor utilizzabili per: Pomodoro (2), Peperoncino (1).

🌙 Fase Lunare: Calante (Luna Calante). Per semina ideale, aspetta Luna Crescente dal 18/02/2025 (tra 5 giorni).

Scegli quando seminare:
- 18 feb: Pomodoro - Luna Crescente (tra 5 gg)
- 14 mar: Pomodoro - Luna Crescente (tra 32 gg)
```

## Testing

```bash
# Compila TypeScript
npx tsc --noEmit

# Test visivo componenti
npm run dev
# Vai a /app/lunar-test (se crei pagina test)
```

## Note Implementazione

- ✅ **0 errori TypeScript** - Tutto type-safe
- ✅ **Algoritmo astronomico accurato** (Jean Meeus)
- ✅ **Responsive** - Funziona mobile e desktop
- ✅ **Accessibile** - Emoji universali + testo descrittivo
- ✅ **Performance** - Calcoli matematici puri (no API calls)
- ⚠️ **Opzionale** - Calendario lunare NON blocca mai operazioni (solo ottimizza timing)
