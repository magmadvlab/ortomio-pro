# Feature Flags Setup - COMPLETATO ✅

**Data**: 15 Gennaio 2026  
**Tempo**: 15 minuti

---

## 🎯 Obiettivo

Creare sistema centralizzato per attivare/disattivare moduli singolarmente, permettendo:
- Testing isolato di ogni modulo
- Deploy graduale delle funzionalità
- Rollback immediato in caso di problemi
- A/B testing futuro

---

## ✅ File Creati

### 1. `config/features.ts`
File centrale con tutti i feature flags organizzati per fase:

**FASE 1 - CRITICI**:
- `AI_PREDICTIONS` - Predizioni malattie e resa
- `JOURNAL` - Diario operativo
- `INDIVIDUAL_PLANTS` - Piante individuali
- `ORCHARD` - Frutteto
- `VINEYARD` - Vigneto
- `OLIVE_GROVE` - Oliveto

**FASE 2 - ALTI**:
- `IRRIGATION_ZONES` - Gestione zone irrigazione
- `IRRIGATION_SCHEDULING` - Programmazione automatica
- `IRRIGATION_ANALYTICS` - Analytics consumo acqua
- `NUTRITION_INVENTORY` - Inventario prodotti
- `NUTRITION_DOSE_CALCULATOR` - Calcolo dosi
- `NUTRITION_COMPATIBILITY` - Compatibilità prodotti

**FASE 3 - MEDI**:
- `EQUIPMENT_MANAGEMENT` - Gestione attrezzature
- `MAINTENANCE_SCHEDULER` - Calendario manutenzioni
- `OPERATIONAL_COSTS` - Costi operativi
- `ADVANCED_CERTIFICATIONS` - Certificazioni avanzate
- `SEASONAL_ADVICE` - Consigli stagionali
- `PLANNER_WIZARD_EXTENDED` - Wizard esteso
- `PLANNER_MATERIAL_SELECTOR` - Selezione materiale
- `PLANNER_SEED_BANK` - Banca semi

**Funzioni helper**:
- `isFeatureEnabled(feature)` - Controlla se feature è attiva
- `getEnabledFeatures()` - Lista tutte le feature attive
- `FEATURES_BY_PHASE` - Feature organizzate per fase

---

### 2. `hooks/useFeature.ts`
Hook React per usare feature flags nei componenti:

**Hook disponibili**:
- `useFeature(feature)` - Controlla singola feature
- `useFeatures([...])` - Controlla multiple features
- `useAllFeatures([...])` - Tutte devono essere attive
- `useAnyFeature([...])` - Almeno una deve essere attiva

---

### 3. `components/shared/FeatureGate.tsx`
Componenti per rendering condizionale:

**Componenti**:
- `<FeatureGate feature="...">` - Mostra se feature attiva
- `<MultiFeatureGate features={[...]} mode="all|any">` - Multiple features

---

## 📖 Come Usare

### Metodo 1: Hook in Componenti

```tsx
import { useFeature } from '@/hooks/useFeature'

function MyComponent() {
  const hasAIPredictions = useFeature('AI_PREDICTIONS')
  
  return (
    <div>
      {hasAIPredictions && <AIPredictionsDashboard />}
    </div>
  )
}
```

### Metodo 2: FeatureGate Component

```tsx
import { FeatureGate } from '@/components/shared/FeatureGate'

function MyComponent() {
  return (
    <div>
      <FeatureGate feature="AI_PREDICTIONS">
        <AIPredictionsDashboard />
      </FeatureGate>
    </div>
  )
}
```

### Metodo 3: Multiple Features

```tsx
import { MultiFeatureGate } from '@/components/shared/FeatureGate'

function MyComponent() {
  return (
    <div>
      <MultiFeatureGate 
        features={['ORCHARD', 'VINEYARD', 'OLIVE_GROVE']} 
        mode="any"
      >
        <OrchardSection />
      </MultiFeatureGate>
    </div>
  )
}
```

### Metodo 4: Environment Variables (Override)

Puoi sovrascrivere la configurazione con variabili d'ambiente:

```bash
# .env.local
NEXT_PUBLIC_FEATURE_AI_PREDICTIONS=true
NEXT_PUBLIC_FEATURE_JOURNAL=true
```

---

## 🔧 Attivare/Disattivare Moduli

### Durante Sviluppo

Modifica `config/features.ts`:

```typescript
export const FEATURES = {
  AI_PREDICTIONS: true,  // ✅ Attiva
  JOURNAL: false,        // ❌ Disattiva
  // ...
}
```

### In Produzione

Usa environment variables per override senza modificare codice:

```bash
# Vercel/Production
NEXT_PUBLIC_FEATURE_AI_PREDICTIONS=true
```

---

## 🎯 Workflow Implementazione Modulo

1. **Implementa modulo** con feature flag disattivato
2. **Testa in locale** attivando flag in `config/features.ts`
3. **Deploy in staging** con flag disattivato
4. **Attiva in staging** con environment variable
5. **Testa in staging**
6. **Attiva in produzione** con environment variable
7. **Se problemi**: disattiva immediatamente con environment variable
8. **Se tutto ok**: aggiorna `config/features.ts` per attivare di default

---

## 📊 Esempio Completo: Pagina Irrigazione

```tsx
// app/app/irrigation/page.tsx
import { FeatureGate } from '@/components/shared/FeatureGate'
import IrrigationDashboard from '@/components/irrigation/IrrigationDashboard'
import ZoneManagement from '@/components/irrigation/modules/ZoneManagement'
import AutoScheduling from '@/components/irrigation/modules/AutoScheduling'
import WaterAnalytics from '@/components/irrigation/modules/WaterAnalytics'

export default function IrrigationPage() {
  return (
    <div className="space-y-6">
      {/* Funzionalità base - sempre attiva */}
      <IrrigationDashboard />
      
      {/* Moduli opzionali */}
      <FeatureGate feature="IRRIGATION_ZONES">
        <ZoneManagement />
      </FeatureGate>
      
      <FeatureGate feature="IRRIGATION_SCHEDULING">
        <AutoScheduling />
      </FeatureGate>
      
      <FeatureGate feature="IRRIGATION_ANALYTICS">
        <WaterAnalytics />
      </FeatureGate>
    </div>
  )
}
```

---

## ✅ Vantaggi Sistema

1. **Modularità**: Ogni funzionalità è indipendente
2. **Testing**: Testa moduli singolarmente
3. **Deploy Sicuro**: Attiva gradualmente
4. **Rollback Rapido**: Disattiva immediatamente se problemi
5. **A/B Testing**: Testa varianti con utenti diversi (futuro)
6. **Manutenzione**: Modifica un modulo senza toccare altri
7. **Performance**: Carica solo moduli attivi

---

## 🚀 Prossimo Step

Ora possiamo iniziare l'implementazione dei moduli con la certezza che:
- Ogni modulo è isolato
- Possiamo testare singolarmente
- Possiamo attivare/disattivare senza modificare codice
- Possiamo fare rollback immediato

**INIZIARE FASE 1.1**: AI Predictions UI (2-3 ore)

