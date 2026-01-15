# Piano Completamento Migrazione - Vecchia → Nuova App

**Data**: 15 Gennaio 2026  
**Status**: 📋 PIANO OPERATIVO

## 🎯 Obiettivo

Completare la migrazione dalla vecchia alla nuova app portando le funzionalità mancanti critiche.

## 📊 Situazione Attuale

### ✅ Cosa Funziona Già

La nuova app ha:
- ✅ Planner avanzato con AI, timeline, statistiche
- ✅ Sistema consigli completo (CropRotation, BiologicalControl)
- ✅ Analytics professionale
- ✅ Servizi backend completi:
  - `aiPredictiveEngine` - Predizioni AI
  - `operationalDiaryService` - Diario operativo
  - `individualPlantService` - Gestione piante individuali
  - `unifiedPlantTrackingService` - Tracking piante
- ✅ Componenti completi:
  - `OperationalDiary` - Diario
  - `SmartPlantManager` - Gestione piante
  - `UnifiedTimelineDiary` - Timeline unificata

### ⚠️ Cosa Manca

1. **3 pagine per funzionalità esistenti** (servizi ci sono, mancano UI):
   - `/app/ai-predictions/page.tsx` - UI per predizioni AI
   - `/app/journal/page.tsx` - Route per diario
   - `/app/plants/page.tsx` - Route per gestione piante

2. **Sistema autenticazione completo**:
   - Verifica email obbligatoria
   - Gestione online/offline
   - Auto-restore da backup cloud
   - Listener auth state changes

3. **Colture specializzate**:
   - `/app/orchard/page.tsx` - Frutteto (ora placeholder)
   - `/app/vineyard/page.tsx` - Vigneto (ora placeholder)
   - `/app/olives/page.tsx` - Oliveto (ora placeholder)

4. **Onboarding multi-step**:
   - `UserOnboardingWizard` - Primo accesso
   - Salvataggio preferences

---

## 📅 Piano di Lavoro (4-6 giorni)

### 🔴 Fase 1: Pagine Critiche (1-2 giorni)

#### Task 1.1: Creare `/app/ai-predictions/page.tsx`

**Obiettivo**: Esporre il servizio `aiPredictiveEngine` con UI dedicata

**Componenti da creare**:
```typescript
// app/app/ai-predictions/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden } from '@/types'
import { Brain, TrendingUp, AlertTriangle, Droplets } from 'lucide-react'

export default function AIPredictionsPage() {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [predictions, setPredictions] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPredictions()
  }, [])

  const loadPredictions = async () => {
    try {
      const loadedGardens = await storageProvider.getGardens()
      setGardens(loadedGardens)
      
      if (loadedGardens.length > 0) {
        // Chiama API predizioni
        const response = await fetch('/api/ai/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gardenId: loadedGardens[0].id,
            weatherData: {}, // Da integrare con weather service
            soilData: {},
            plantHealthData: {}
          })
        })
        const data = await response.json()
        setPredictions(data)
      }
    } catch (error) {
      console.error('Error loading predictions:', error)
    } finally {
      setLoading(false)
    }
  }

  // UI per visualizzare:
  // - Disease predictions (malattie previste)
  // - Yield predictions (resa prevista)
  // - Resource optimizations (ottimizzazioni risorse)
  // - Confidence scores
  // - Recommended actions
}
```

**Stima**: 4-6 ore

---

#### Task 1.2: Creare `/app/journal/page.tsx`

**Obiettivo**: Route dedicata per `OperationalDiary`

**Componenti da usare**:
- `OperationalDiary` (già esiste)
- `UnifiedTimelineDiary` (già esiste)
- `DiaryPlannerIntegration` (già esiste)

```typescript
// app/app/journal/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden } from '@/types'
import OperationalDiary from '@/components/diary/OperationalDiary'
import UnifiedTimelineDiary from '@/components/diary/UnifiedTimelineDiary'
import { BookOpen, Calendar, BarChart3 } from 'lucide-react'

export default function JournalPage() {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [activeView, setActiveView] = useState<'diary' | 'timeline'>('diary')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGardens()
  }, [])

  const loadGardens = async () => {
    try {
      const loadedGardens = await storageProvider.getGardens()
      setGardens(loadedGardens)
    } catch (error) {
      console.error('Error loading gardens:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Caricamento...</div>
  if (gardens.length === 0) return <div>Nessun orto trovato</div>

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <BookOpen className="text-green-600" size={28} />
          Diario Operativo
        </h1>
        <p className="text-gray-600 mt-1">
          Registra e analizza tutte le operazioni del tuo orto
        </p>
      </div>

      {/* Toggle View */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setActiveView('diary')}
          className={`px-4 py-2 rounded-lg ${
            activeView === 'diary'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          <BookOpen size={16} className="inline mr-2" />
          Diario
        </button>
        <button
          onClick={() => setActiveView('timeline')}
          className={`px-4 py-2 rounded-lg ${
            activeView === 'timeline'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Calendar size={16} className="inline mr-2" />
          Timeline
        </button>
      </div>

      {/* Content */}
      {activeView === 'diary' ? (
        <OperationalDiary
          gardenId={gardens[0].id}
          onEntryAdded={(entry) => {
            console.log('Entry added:', entry)
          }}
        />
      ) : (
        <UnifiedTimelineDiary
          gardenId={gardens[0].id}
          tasks={[]}
          onTaskUpdate={() => {}}
        />
      )}
    </div>
  )
}
```

**Stima**: 2-3 ore

---

#### Task 1.3: Creare `/app/plants/page.tsx`

**Obiettivo**: Route dedicata per gestione piante individuali

**Componenti da usare**:
- `SmartPlantManager` (già esiste)
- `FieldPlantManager` (già esiste)
- `PlantLifecycleManager` (già esiste)

```typescript
// app/app/plants/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden } from '@/types'
import SmartPlantManager from '@/components/plants/SmartPlantManager'
import { Sprout, Grid3x3, List } from 'lucide-react'

export default function PlantsPage() {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGardens()
  }, [])

  const loadGardens = async () => {
    try {
      const loadedGardens = await storageProvider.getGardens()
      setGardens(loadedGardens)
    } catch (error) {
      console.error('Error loading gardens:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Caricamento...</div>
  if (gardens.length === 0) return <div>Nessun orto trovato</div>

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Sprout className="text-green-600" size={28} />
          Gestione Piante Individuali
        </h1>
        <p className="text-gray-600 mt-1">
          Traccia e gestisci ogni singola pianta del tuo orto
        </p>
      </div>

      <SmartPlantManager
        gardenId={gardens[0].id}
        onPlantUpdate={(plant) => {
          console.log('Plant updated:', plant)
        }}
      />
    </div>
  )
}
```

**Stima**: 2-3 ore

---

### 🟡 Fase 2: Sistema Autenticazione (1 giorno)

#### Task 2.1: Portare logica auth completa

**File da modificare**: `app/app/page.tsx`

**Funzionalità da portare dalla vecchia app**:

1. **Verifica autenticazione con email confirmation**:
```typescript
// Controlla se online/offline
const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
const isOnline = hostname !== 'localhost' && 
  hostname !== '127.0.0.1' &&
  !hostname.includes('localhost')

// Se online, richiedi sempre autenticazione
if (isOnline) {
  const supabase = getSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  // Verifica email confermata
  const isValidSession = session?.user &&
    session.expires_at &&
    session.expires_at > now &&
    session.user.email_confirmed_at
  
  if (!isValidSession) {
    router.push('/auth')
  }
}
```

2. **Listener auth state changes**:
```typescript
const supabase = getSupabaseClient()
const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  // Se email non verificata, reindirizza
  if (session?.user && !session.user.email_confirmed_at) {
    router.push(`/verify-email?email=${encodeURIComponent(session.user.email || '')}`)
  }
  setIsAuthenticated(!!session?.user && !!session?.user?.email_confirmed_at)
})
```

3. **Auto-restore da backup**:
```typescript
import { attemptAutoRestore } from '@/services/autoRestoreService'

// Dopo caricamento gardens
if (loadedGardens.length === 0) {
  setRestoring(true)
  const restoreResult = await attemptAutoRestore(storageProvider)
  setRestoreResult(restoreResult)
  setRestoring(false)
  
  if (restoreResult.restored) {
    // Ricarica gardens dopo restore
    const restoredGardens = await storageProvider.getGardens()
    setGardens(restoredGardens)
  }
}
```

4. **Banner ripristino**:
```typescript
{restoreResult?.restored && (
  <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
    <p className="font-semibold text-green-800">
      Dati ripristinati automaticamente!
    </p>
    <p className="text-sm text-green-700">
      Ripristinati {restoreResult.gardensRestored} giardini, 
      {restoreResult.tasksRestored} task
    </p>
  </div>
)}
```

**Stima**: 6-8 ore

---

### 🟠 Fase 3: Colture Specializzate (2-3 giorni)

#### Task 3.1: Implementare `/app/orchard/page.tsx`

**Riferimento**: `vcchiortomio/vecchia app/app/(dashboard)/app/orchard/page.tsx`

**Componenti da portare**:
- `CreateOrchardWizard` (già esiste, verificare se completo)
- Logica gestione task specifici frutteto
- UI per visualizzazione alberi da frutto

**Stima**: 8-10 ore

---

#### Task 3.2: Implementare `/app/vineyard/page.tsx`

**Riferimento**: `vcchiortomio/vecchia app/app/(dashboard)/app/vineyard/page.tsx`

**Componenti da portare**:
- Wizard creazione vigneto
- Gestione filari e viti
- Task specifici vigneto (potatura, vendemmia, etc.)

**Stima**: 8-10 ore

---

#### Task 3.3: Implementare `/app/olives/page.tsx`

**Riferimento**: `vcchiortomio/vecchia app/app/(dashboard)/app/olives/page.tsx`

**Componenti da portare**:
- Wizard creazione oliveto
- Gestione alberi di olivo
- Task specifici oliveto (potatura, raccolta, etc.)

**Stima**: 8-10 ore

---

### 🟢 Fase 4: Onboarding (1 giorno - Opzionale)

#### Task 4.1: Integrare UserOnboardingWizard

**Riferimento**: `vcchiortomio/vecchia app/components/onboarding/UserOnboardingWizard.tsx`

**Funzionalità**:
- Wizard primo accesso
- Raccolta dati utente (nome, tipo, obiettivi)
- Salvataggio preferences in database
- Integrazione con GardenTypeWizard

**Stima**: 6-8 ore

---

## 📋 Checklist Completamento

### Fase 1: Pagine Critiche
- [ ] `/app/ai-predictions/page.tsx` creata e funzionante
- [ ] `/app/journal/page.tsx` creata e funzionante
- [ ] `/app/plants/page.tsx` creata e funzionante
- [ ] Link aggiunti al menu/sidebar
- [ ] Test funzionalità base

### Fase 2: Autenticazione
- [ ] Verifica email implementata
- [ ] Gestione online/offline implementata
- [ ] Auto-restore implementato
- [ ] Banner ripristino implementato
- [ ] Listener auth state implementato
- [ ] Test login/logout
- [ ] Test verifica email
- [ ] Test auto-restore

### Fase 3: Colture Specializzate
- [ ] `/app/orchard/page.tsx` implementata
- [ ] `/app/vineyard/page.tsx` implementata
- [ ] `/app/olives/page.tsx` implementata
- [ ] Wizard creazione funzionanti
- [ ] Task specifici per ogni coltura
- [ ] Test creazione e gestione

### Fase 4: Onboarding (Opzionale)
- [ ] UserOnboardingWizard portato
- [ ] Integrazione con dashboard
- [ ] Salvataggio preferences
- [ ] Test primo accesso

---

## 🎯 Priorità

### 🔴 CRITICA (Fare subito)
1. Sistema autenticazione completo (Fase 2)
2. Colture specializzate (Fase 3)

### 🟡 ALTA (Fare presto)
3. Pagine critiche (Fase 1)

### 🟢 MEDIA (Nice to have)
4. Onboarding multi-step (Fase 4)

---

## 📊 Stima Totale

| Fase | Tempo Stimato | Priorità |
|------|---------------|----------|
| Fase 1: Pagine Critiche | 8-12 ore (1-2 giorni) | 🟡 ALTA |
| Fase 2: Autenticazione | 6-8 ore (1 giorno) | 🔴 CRITICA |
| Fase 3: Colture Specializzate | 24-30 ore (3-4 giorni) | 🔴 CRITICA |
| Fase 4: Onboarding | 6-8 ore (1 giorno) | 🟢 MEDIA |
| **TOTALE** | **44-58 ore (5-7 giorni)** | |

---

## 🚀 Prossimi Passi Immediati

1. **Decidere priorità**: Quale fase iniziare per prima?
   - Suggerimento: Fase 2 (Auth) → Fase 3 (Colture) → Fase 1 (Pagine)

2. **Verificare componenti esistenti**:
   - `CreateOrchardWizard` è completo?
   - `autoRestoreService` esiste?
   - `UserOnboardingWizard` esiste?

3. **Iniziare implementazione**:
   - Creare branch `feature/complete-migration`
   - Implementare fase per fase
   - Test dopo ogni fase
   - Commit incrementali

---

## 📝 Note Finali

- **NON eliminare vecchia app** fino a completamento migrazione
- **Testare ogni fase** prima di passare alla successiva
- **Commit frequenti** per poter fare rollback se necessario
- **Documentare** eventuali differenze o problemi riscontrati

---

**Vuoi che inizi con una delle fasi?** Quale preferisci?

1. Fase 1 (Pagine critiche) - Più veloce, risultati immediati
2. Fase 2 (Autenticazione) - Più importante, fondamentale per produzione
3. Fase 3 (Colture specializzate) - Più complessa, richiede più tempo
