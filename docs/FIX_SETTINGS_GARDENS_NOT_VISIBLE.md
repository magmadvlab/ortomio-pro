# 🐛 Fix: Orti Non Visibili in Impostazioni > I Miei Orti

**Data:** 2026-01-05
**Priorità:** ALTA - UX Issue
**Status:** ✅ RISOLTO

---

## 🚨 Problema

### Comportamento Inconsistente

**Sintomi:**
- ✅ Orto visibile in **Gestione Orti** (dashboard)
- ❌ Orto **NON visibile** in **Impostazioni > I Miei Orti**
- ❌ Messaggio "Nessun orto configurato" anche con orto esistente

**User Feedback:**
> "se vado da impostazioni i miei orti non vedo l'orto registrato possiamo fixare questa cosa così l'utente può raggiungere l'orto da più parti per fare modifiche"

**Screenshot:**
```
┌─────────────────────────────────────┐
│ Impostazioni > I Miei Orti          │
├─────────────────────────────────────┤
│                                     │
│         🏠                          │
│   Nessun orto configurato           │
│                                     │
│   Crea il tuo primo orto per        │
│   iniziare a pianificare            │
│                                     │
│   [+ Crea Orto]                     │
│                                     │
└─────────────────────────────────────┘
```

**Mentre contemporaneamente:**
```
┌─────────────────────────────────────┐
│ Dashboard > Il Mio Orto             │
├─────────────────────────────────────┤
│ ✓ Orto: "Campo Mais"                │
│   Area: 20000 m²                    │
│   GPS: 40.36°N, 16.69°E             │
│   [Gestisci] [Pianifica]            │
└─────────────────────────────────────┘
```

---

## 🔍 Root Cause

### Problema 1: Doppio Caricamento Dati

Il componente `GardenManager` (usato in Impostazioni) caricava gli orti **separatamente** invece di usare il hook `useGarden` già esistente.

**File:** `components/settings/GardenManager.tsx`

#### PRIMA del Fix ❌

```typescript
export function GardenManager() {
  const { storageProvider } = useStorage()
  const { activeGarden, setActiveGarden } = useGarden()  // Hook chiamato
  const [gardens, setGardens] = useState<Garden[]>([])   // ❌ Stato duplicato
  const [loading, setLoading] = useState(true)           // ❌ Loading duplicato

  useEffect(() => {
    loadGardens()
  }, [])  // ❌ Nessuna dipendenza da storageProvider

  const loadGardens = async () => {
    try {
      setLoading(true)
      const allGardens = await storageProvider.getGardens()  // ❌ Chiamata diretta
      setGardens(allGardens || [])
    } catch (error) {
      console.error('Error loading gardens:', error)
    } finally {
      setLoading(false)
    }
  }
}
```

**Problemi:**
1. **Doppio stato**: `gardens` locale + `gardens` in `useGarden` hook
2. **Race condition**: `loadGardens()` chiamato prima che `storageProvider` sia pronto
3. **Nessuna dipendenza**: `useEffect` con array vuoto `[]` non reagisce a cambiamenti
4. **Chiamata diretta**: Bypassa la logica centralizzata del hook

### Problema 2: Timing di Caricamento

```
Timeline Errata:
t=0ms:  Component mount
t=1ms:  useEffect(() => loadGardens(), [])  → Trigger
t=2ms:  loadGardens() inizia
t=3ms:  await storageProvider.getGardens()  ← storageProvider NON pronto!
t=5ms:  Error o array vuoto []
t=10ms: useGarden hook finisce caricamento (ma troppo tardi)

Risultato: gardens = [] (vuoto) in GardenManager
```

### Problema 3: Context Separato

`useGarden` hook ha la logica corretta per:
- Aspettare che `storageProvider` sia pronto
- Normalizzare i gardens
- Gestire active garden
- Caching e refresh

Ma `GardenManager` **ignorava tutto questo** e rifaceva il caricamento da zero.

---

## ✅ Soluzione Applicata

### Usa il Hook Esistente

**File Modificato:** `components/settings/GardenManager.tsx:13-26`

#### DOPO il Fix ✅

```typescript
export function GardenManager() {
  const { storageProvider } = useStorage()
  const {
    activeGarden,
    setActiveGarden,
    gardens: gardensFromHook,      // ✅ Usa dati dal hook
    loading: loadingFromHook,       // ✅ Usa loading dal hook
    refreshGardens                  // ✅ Usa refresh dal hook
  } = useGarden()

  const [deleting, setDeleting] = useState<string | null>(null)
  const [editingGarden, setEditingGarden] = useState<Garden | null>(null)
  const [addingStructuresFor, setAddingStructuresFor] = useState<Garden | null>(null)

  // Usa i dati dal hook invece di caricarli separatamente
  const gardens = gardensFromHook   // ✅ Singola fonte di verità
  const loading = loadingFromHook   // ✅ Singola fonte di verità

  const loadGardens = async () => {
    await refreshGardens()           // ✅ Delega al hook
  }
}
```

**Vantaggi:**
1. ✅ **Single Source of Truth**: Un solo posto che gestisce i gardens
2. ✅ **Timing Corretto**: `useGarden` aspetta che tutto sia pronto
3. ✅ **Normalizzazione**: I gardens sono già normalizzati dal hook
4. ✅ **Sincronizzazione**: Dashboard e Impostazioni vedono gli stessi dati
5. ✅ **Meno Codice**: Rimuove 15 righe di codice duplicato

---

## 📊 Flusso Dati Corretto

### PRIMA (Duplicato) ❌

```
┌────────────────────────────────────────────────────────┐
│                  Supabase Database                     │
└────────────────────────────────────────────────────────┘
              ↓                           ↓
    ┌─────────────────┐       ┌──────────────────────┐
    │  useGarden Hook │       │  GardenManager       │
    │                 │       │  (chiamata diretta)  │
    │  gardens: [...]  │       │  gardens: []  ❌     │
    └─────────────────┘       └──────────────────────┘
              ↓                           ↓
       Dashboard OK         Impostazioni VUOTO ❌
```

### DOPO (Centralizzato) ✅

```
┌────────────────────────────────────────────────────────┐
│                  Supabase Database                     │
└────────────────────────────────────────────────────────┘
                          ↓
              ┌──────────────────────┐
              │   useGarden Hook     │
              │                      │
              │   gardens: [...]     │
              │   loading: false     │
              │   activeGarden: {...}│
              └──────────────────────┘
                    ↓           ↓
         ┌──────────┴──────────┴──────────┐
         ↓                                 ↓
    Dashboard ✅                    Impostazioni ✅
  (usa hook)                       (usa hook)
```

---

## 🔧 Modifiche Tecniche

### Rimozioni (Codice Eliminato)

```typescript
// ❌ RIMOSSO - Stato duplicato
const [gardens, setGardens] = useState<Garden[]>([])
const [loading, setLoading] = useState(true)

// ❌ RIMOSSO - useEffect senza dipendenze
useEffect(() => {
  loadGardens()
}, [])

// ❌ RIMOSSO - Caricamento manuale
const loadGardens = async () => {
  try {
    setLoading(true)
    const allGardens = await storageProvider.getGardens()
    setGardens(allGardens || [])
  } catch (error) {
    console.error('Error loading gardens:', error)
  } finally {
    setLoading(false)
  }
}
```

**Righe eliminate:** 15 righe di codice ridondante

### Aggiunte (Codice Nuovo)

```typescript
// ✅ AGGIUNTO - Usa dati dal hook
const {
  activeGarden,
  setActiveGarden,
  gardens: gardensFromHook,
  loading: loadingFromHook,
  refreshGardens
} = useGarden()

// ✅ AGGIUNTO - Alias per compatibilità
const gardens = gardensFromHook
const loading = loadingFromHook

// ✅ AGGIUNTO - loadGardens delega al hook
const loadGardens = async () => {
  await refreshGardens()
}
```

**Righe aggiunte:** 12 righe (netto: -3 righe, più semplice!)

---

## ✅ Testing

### TypeScript Compilation

```bash
npm run type-check
# ✅ No errors
```

### Test Manuale

**Test 1: Visualizzazione Orto Esistente**

**Steps:**
1. Creare un orto dalla dashboard
2. Andare su Impostazioni > I Miei Orti
3. Verificare che l'orto sia visibile

**Expected:** ✅ Orto visibile con tutte le info (nome, area, GPS, data)

**Actual:** ✅ PASS - Orto visibile correttamente

---

**Test 2: Sincronizzazione Dashboard ↔ Impostazioni**

**Steps:**
1. Creare orto "Orto 1"
2. Dashboard mostra "Orto 1" ✓
3. Impostazioni mostra "Orto 1" ✓
4. Creare orto "Orto 2" dalla dashboard
5. Tornare su Impostazioni
6. Verificare che entrambi gli orti siano visibili

**Expected:** ✅ Entrambi gli orti visibili in entrambe le sezioni

**Actual:** ✅ PASS - Sincronizzazione perfetta

---

**Test 3: Modifica Orto da Impostazioni**

**Steps:**
1. Andare su Impostazioni > I Miei Orti
2. Cliccare "Modifica" su un orto
3. Cambiare nome orto
4. Salvare
5. Tornare alla dashboard
6. Verificare che il nome sia aggiornato

**Expected:** ✅ Nome aggiornato in entrambi i posti

**Actual:** ✅ PASS - Modifica sincronizzata

---

**Test 4: Eliminazione Orto**

**Steps:**
1. Impostazioni > I Miei Orti
2. Eliminare un orto
3. Verificare che scompaia dalla lista
4. Tornare alla dashboard
5. Verificare che l'orto non ci sia più

**Expected:** ✅ Orto eliminato da tutte le sezioni

**Actual:** ✅ PASS - Eliminazione sincronizzata

---

## 🎯 Impatto

### Prima del Fix

- ❌ Orti non visibili in Impostazioni
- ❌ Utenti confusi ("ho creato l'orto ma non lo vedo")
- ❌ Impossibile modificare orto da Impostazioni
- ❌ Due fonti di verità separate (dati inconsistenti)
- ❌ Race conditions potenziali

### Dopo il Fix

- ✅ Orti visibili in tutte le sezioni
- ✅ Esperienza utente consistente
- ✅ Modifica orto da Impostazioni funzionante
- ✅ Singola fonte di verità (useGarden hook)
- ✅ Nessuna race condition
- ✅ Codice più semplice (-3 righe, -15 logica duplicata)

---

## 📝 Best Practice

### Pattern: Single Source of Truth

**❌ SBAGLIATO - Doppio Caricamento**

```typescript
function ComponentA() {
  const [data, setData] = useState([])
  useEffect(() => {
    loadData().then(setData)
  }, [])
  // ...
}

function ComponentB() {
  const [data, setData] = useState([])  // ❌ Duplicato!
  useEffect(() => {
    loadData().then(setData)            // ❌ Duplicato!
  }, [])
  // ...
}
```

**✅ CORRETTO - Usa Hook Condiviso**

```typescript
function ComponentA() {
  const { data, loading } = useData()  // ✅ Usa hook
  // ...
}

function ComponentB() {
  const { data, loading } = useData()  // ✅ Usa stesso hook
  // ...
}
```

### Pattern: Hook Dependencies

**❌ SBAGLIATO - Array Dipendenze Vuoto**

```typescript
useEffect(() => {
  storageProvider.getData()  // ❌ storageProvider potrebbe non essere pronto
}, [])  // ❌ Nessuna dipendenza
```

**✅ CORRETTO - Hook Gestisce Timing**

```typescript
// Nel hook
useEffect(() => {
  if (storageProvider) {  // ✅ Controlla se pronto
    loadData()
  }
}, [storageProvider])  // ✅ Dipendenza corretta

// Nel componente
const { data } = useData()  // ✅ Hook gestisce tutto
```

---

## 🔗 File Correlati

- [components/settings/GardenManager.tsx](../components/settings/GardenManager.tsx) - File modificato
- [packages/core/hooks/useGarden.ts](../packages/core/hooks/useGarden.ts) - Hook centralizzato
- [app/(dashboard)/app/settings/page.tsx](../app/(dashboard)/app/settings/page.tsx) - Pagina impostazioni

---

## 🚀 Miglioramenti Futuri

### 1. Loading States Migliori

Mostrare skeleton UI invece di spinner generico:

```typescript
if (loading) {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
        </div>
      ))}
    </div>
  )
}
```

### 2. Refresh Button

Aggiungere pulsante manuale per forzare refresh:

```typescript
<button onClick={refreshGardens} className="...">
  <RefreshCw size={16} />
  Aggiorna
</button>
```

### 3. Transizione Animata

Animare l'ingresso/uscita degli orti dalla lista:

```typescript
import { motion, AnimatePresence } from 'framer-motion'

<AnimatePresence>
  {gardens.map(garden => (
    <motion.div
      key={garden.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Garden card */}
    </motion.div>
  ))}
</AnimatePresence>
```

---

## 🔑 Key Takeaways

1. **Single Source of Truth**: Non duplicare stato/logica se esiste già un hook
2. **Hook Dependencies**: Sempre includere dipendenze corrette in `useEffect`
3. **Trust the Hook**: Se un hook gestisce tutto, usalo - non reimplementare
4. **Timing Matters**: Race conditions sono facili da introdurre, difficili da debuggare
5. **Less is More**: Meno codice = meno bug potenziali

---

**Conclusione:** Fix applicato con successo. Gli orti sono ora visibili in tutte le sezioni dell'app grazie all'uso centralizzato del `useGarden` hook. L'esperienza utente è ora consistente e il codice è più semplice e manutenibile.
