# ✨ Feature: Campo pH Terreno in Info Base

**Data:** 2026-01-04
**Priorità:** BASSA - Nice to Have
**Status:** ✅ COMPLETATO

---

## 🎯 Obiettivo

Aggiungere il campo **pH del terreno** nella sezione "Info Base" del modal di modifica orto per dare un quadro completo delle caratteristiche dell'orto.

---

## 💡 Motivazione

### User Request
> "Ora in info base dell'orto potrebbe anche esserci l'informazione sul pH giusto per dare un quadro completo"

### Perché il pH è Importante?

Il **pH del terreno** è un parametro fondamentale per la gestione dell'orto perché:

1. **Disponibilità Nutrienti**: Il pH influenza l'assorbimento dei nutrienti
   - pH troppo acido (< 6.0): carenza di azoto, fosforo, potassio
   - pH troppo basico (> 7.5): carenza di ferro, manganese, zinco

2. **Crescita Piante**: Ogni pianta ha un range pH ottimale
   - Ortaggi: **6.0-7.0** (leggermente acido/neutro)
   - Mirtilli: 4.5-5.5 (acido)
   - Asparagi: 6.5-7.5 (neutro/leggermente basico)

3. **Attività Microbica**: Il pH influenza i microrganismi benefici del suolo

4. **Pianificazione Colture**: Conoscere il pH aiuta a scegliere le colture adatte

---

## ✅ Implementazione

### File Modificato

**File:** `components/settings/GardenEditModal.tsx`

### 1. Nuovo Stato (riga 28)

```typescript
const [soilPh, setSoilPh] = useState(garden.soilPh?.toString() || '')
```

### 2. Campo UI nel Tab "Info Base" (righe 449-472)

```typescript
<div className="bg-green-50 border border-green-200 rounded-xl p-4">
  <div className="flex items-center gap-2 mb-3">
    <TreeDeciduous size={18} className="text-green-600" />
    <h3 className="font-semibold text-gray-900">Terreno</h3>
  </div>
  <div>
    <label className="block text-xs text-gray-600 mb-1">
      pH del Terreno (opzionale)
    </label>
    <input
      type="number"
      value={soilPh}
      onChange={(e) => setSoilPh(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
      placeholder="Es. 6.5"
      step="0.1"
      min="0"
      max="14"
    />
    <p className="text-xs text-gray-500 mt-1">
      Scala pH: 0-14 (acido &lt; 7 &lt; basico). Ortaggi: 6.0-7.0 ideale
    </p>
  </div>
</div>
```

**Caratteristiche UI:**
- **Icona**: 🌳 `TreeDeciduous` (albero) - rappresenta il terreno/natura
- **Colore**: Verde - coerente con tema orto/terreno
- **Range**: 0-14 (scala pH completa)
- **Step**: 0.1 (precisione decimale)
- **Placeholder**: "Es. 6.5" (valore medio ortaggi)
- **Help text**: Spiega scala pH e range ideale per ortaggi

### 3. Riepilogo Aggiornato (righe 481-483)

```typescript
{soilPh && (
  <li>• pH Terreno: {parseFloat(soilPh).toFixed(1)}</li>
)}
```

**Esempio Output:**
```
Riepilogo
• Area: 20000 m²
• GPS: 40.3609, 16.6863
• pH Terreno: 6.5
• Coltura principale: Pomodori
```

### 4. Salvataggio nel Database (riga 119)

```typescript
const updates: Partial<Garden> = {
  name,
  sizeSqMeters,
  sizeUnit,
  coordinates: latitude && longitude ? { latitude, longitude } : undefined,
  soilPh: soilPh ? parseFloat(soilPh) : undefined,  // ✅ NUOVO
  structureConfig: { ... }
}
```

**Conversione:**
- Input stringa (da form) → `parseFloat()` → Numero
- Se vuoto → `undefined` (non salvato)

---

## 🎨 UI/UX

### Posizionamento

```
Tab: Info Base
├── Nome Orto
├── Dimensione + Unità
├── 📍 Coordinate GPS (opzionale)
│   ├── Latitudine
│   └── Longitudine
├── 🌳 Terreno (opzionale) ← NUOVO
│   └── pH del Terreno
└── Riepilogo
```

### Colori e Stile

- **Background**: `bg-green-50` (verde chiaro)
- **Border**: `border-green-200` (verde medio)
- **Icona**: `text-green-600` (verde scuro)
- **Coerente con**: tema "terreno/natura"

---

## 📊 Scala pH e Valori di Riferimento

### Scala Completa

```
0   ═══════════════════════════════════════ 14
    ACIDO              NEUTRO          BASICO

    0-3:   Molto acido (limoni, batterie)
    3-5:   Acido (mirtilli, azalee)
    5-6:   Leggermente acido (patate, ravanelli)
    6-7:   Neutro/Ideale ortaggi ⭐
    7-8:   Leggermente basico (asparagi, bietole)
    8-10:  Basico (poche piante tollerano)
    10-14: Molto basico (non adatto coltivazioni)
```

### Valori Ideali per Colture Comuni

| Coltura | pH Ideale | Tolleranza |
|---------|-----------|------------|
| Pomodori | 6.0-6.8 | 5.5-7.5 |
| Lattuga | 6.0-7.0 | 5.5-7.5 |
| Carote | 5.5-7.0 | 5.0-7.5 |
| Patate | 5.0-6.0 | 4.8-6.5 |
| Asparagi | 6.5-7.5 | 6.0-8.0 |
| Mirtilli | 4.5-5.5 | 4.0-5.5 |
| Cavoli | 6.0-7.5 | 5.5-7.5 |
| Fagioli | 6.0-7.5 | 5.5-8.0 |

---

## 🧪 Come Misurare il pH del Terreno

### Metodi Comuni

1. **Kit pH Testuale** (€10-20)
   - Mistura terreno + acqua distillata
   - Aggiungi reagente
   - Confronta colore con scala

2. **pH Meter Digitale** (€20-50)
   - Infila sonda nel terreno umido
   - Lettura diretta su display
   - Precisione ±0.1 pH

3. **Analisi Laboratorio** (€30-100)
   - Campione terreno → laboratorio
   - Analisi completa: pH, NPK, microelementi
   - Raccomandazioni personalizzate

4. **Striscia pH** (€5-10)
   - Economica ma meno precisa
   - Terreno + acqua → striscia → colore

---

## ✅ Testing

### TypeScript Compilation
```bash
npm run type-check
# ✅ No errors
```

### Test Manuali

**Test 1: Inserimento pH valido**
```
Input: 6.5
Riepilogo: "• pH Terreno: 6.5"
Database: soilPh = 6.5 ✅
```

**Test 2: pH con decimali**
```
Input: 6.75
Riepilogo: "• pH Terreno: 6.8" (arrotondato 1 decimale)
Database: soilPh = 6.75 ✅
```

**Test 3: Campo vuoto (opzionale)**
```
Input: "" (vuoto)
Riepilogo: NO pH mostrato ✅
Database: soilPh = undefined ✅
```

**Test 4: Valori estremi**
```
Input: 3.2 (acido)
Riepilogo: "• pH Terreno: 3.2" ✅

Input: 8.5 (basico)
Riepilogo: "• pH Terreno: 8.5" ✅
```

---

## 🚀 Utilizzi Futuri

### 1. Raccomandazioni Colture

Basandosi sul pH salvato, suggerire colture adatte:

```typescript
function getSuitableCrops(soilPh: number): string[] {
  if (soilPh < 5.5) {
    return ['Mirtilli', 'Azalee', 'Patate acide']
  } else if (soilPh >= 5.5 && soilPh <= 7.0) {
    return ['Pomodori', 'Lattuga', 'Carote', 'Peperoni'] // Maggior parte ortaggi
  } else if (soilPh > 7.0 && soilPh <= 7.5) {
    return ['Asparagi', 'Bietole', 'Cavoli']
  } else {
    return ['Terreno troppo basico - correggere pH']
  }
}
```

### 2. Alert Correzione pH

Se pH fuori range ideale:

```typescript
if (soilPh < 6.0) {
  alert('⚠️ pH troppo acido. Suggerimento: aggiungi calce per alzare pH')
}

if (soilPh > 7.5) {
  alert('⚠️ pH troppo basico. Suggerimento: aggiungi zolfo per abbassare pH')
}
```

### 3. Tracking Storico pH

Salvare misurazioni nel tempo:

```typescript
interface SoilPhReading {
  date: Date
  ph: number
  location?: string  // Zona orto
  notes?: string     // Es. "Dopo aggiunta compost"
}
```

### 4. Integrazione con Task

Suggerire task di correzione pH:

```typescript
if (soilPh < 6.0) {
  createTask({
    title: 'Correzione pH terreno',
    description: 'Aggiungere 200g/m² di calce agricola',
    dueDate: addDays(new Date(), 7)
  })
}
```

---

## 📝 Best Practice pH Terreno

### Quando Misurare

✅ **Momenti Ideali:**
- Inizio stagione (primavera)
- Dopo modifiche suolo (compost, calce, zolfo)
- Ogni 1-2 anni per monitoraggio
- Prima di nuove piantagioni importanti

❌ **Evitare:**
- Terreno troppo secco (falsa lettura)
- Subito dopo pioggia forte (diluito)
- Vicino a muretti/cemento (contaminazione basica)

### Come Correggere pH

**Abbassare pH (terreno troppo basico):**
- Zolfo elementare: 100-200g/m²
- Torba acida
- Compost di foglie di pino
- Solfato di ammonio

**Alzare pH (terreno troppo acido):**
- Calce agricola (carbonato calcio): 200-400g/m²
- Cenere di legna: 100-150g/m²
- Dolomite (calce + magnesio)

**Tempo effetto:**
- Calce/Zolfo: 2-3 mesi
- Applicare in autunno per primavera seguente

---

## 🎯 Impatto

### Informazioni Complete Orto

**Prima:**
```
Info Base
• Nome
• Dimensione
• GPS (opzionale)
```

**Dopo:**
```
Info Base
• Nome
• Dimensione
• GPS (opzionale)
• pH Terreno (opzionale) ✅ NUOVO
```

### User Benefits

1. ✅ **Quadro Completo**: Tutte le info importanti in un posto
2. ✅ **Pianificazione Migliore**: Scelta colture in base pH
3. ✅ **Tracciamento**: Storico pH nel tempo
4. ✅ **Decision Making**: Quando correggere terreno

---

## 🔗 File Correlati

- [components/settings/GardenEditModal.tsx](../components/settings/GardenEditModal.tsx) - File modificato
- [types.ts](../types.ts) - Type `Garden` con campo `soilPh`
- [Database Schema](../supabase/migrations/) - Campo `soil_ph` in tabella `gardens`

---

## 📚 Risorse pH Terreno

### Link Utili
- [Wikipedia - Scala pH](https://it.wikipedia.org/wiki/PH)
- [Optimal pH for Vegetables](https://extension.umd.edu/resource/soil-ph-and-liming/)
- [Come misurare pH terreno](https://www.agronotizie.it)

### Valori Comuni pH
- Acqua distillata: 7.0 (neutro)
- Acqua piovana: 5.5-6.5
- Limone: 2.0
- Aceto: 3.0
- Latte: 6.5
- Sangue umano: 7.4
- Bicarbonato: 8.5

---

**Conclusione:** Feature implementata con successo. Il campo pH completa le informazioni di base dell'orto, permettendo una gestione più precisa e scientifica delle coltivazioni.
