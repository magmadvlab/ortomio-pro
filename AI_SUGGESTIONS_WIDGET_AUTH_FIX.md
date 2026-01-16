# Fix AI Suggestions Widget - Autenticazione Utente

## 🐛 Problema Identificato

**Errore Console:**
```
Error fetching suggestions: {}
```

**Causa:** Il widget `AISuggestionsWidget` usava un `userId` mock (`'mock-user-id'`) invece dell'utente autenticato reale.

**File Affetto:**
- `components/ai/AISuggestionsWidget.tsx`

---

## ✅ Soluzione Applicata

### 1. Importato Hook Autenticazione

```typescript
import { useAuth } from '@/packages/core/hooks/useAuth'
```

### 2. Aggiunto User dal Context

```typescript
const { user } = useAuth()
```

### 3. Rimosso Mock User ID

**Prima:**
```typescript
const userId = 'mock-user-id' // Temporary mock
const suggs = await collaborativeAIService.getSuggestions(userId, {
  // ...
})
```

**Dopo:**
```typescript
const suggs = await collaborativeAIService.getSuggestions(user.id, {
  // ...
})
```

### 4. Aggiunto Check User

```typescript
useEffect(() => {
  if (activeGarden && user) {
    loadSuggestions()
  }
}, [activeGarden, user])

// ...

if (!activeGarden || !user) return null
```

---

## 🔍 Verifica Altri Widget

### Widget Irrigazione (`IrrigationAISuggestionsWidget.tsx`)
✅ **OK** - Usa `garden.user_id` (corretto se il garden ha il campo)

```typescript
const suggs = await collaborativeAIService.getSuggestions(garden.user_id, {
  // ...
})
```

### Widget Nutrizione (`NutritionAISuggestionsWidget.tsx`)
✅ **OK** - Usa `garden.user_id` (corretto se il garden ha il campo)

```typescript
const suggs = await collaborativeAIService.getSuggestions(garden.user_id, {
  // ...
})
```

**Nota:** Questi widget assumono che l'oggetto `garden` abbia il campo `user_id`. Se il garden viene caricato dal database, questo campo dovrebbe essere presente.

---

## 🧪 Test da Eseguire

### 1. Verifica Widget nel Dashboard

1. Apri http://localhost:3002
2. Fai login
3. Vai al Dashboard
4. Cerca il widget "Suggerimenti AI"
5. Verifica che:
   - Non ci siano errori in console
   - Il widget carichi correttamente (anche se vuoto)
   - Mostri "Nessun suggerimento urgente al momento" se non ci sono dati

### 2. Verifica Console Browser

Apri DevTools → Console e verifica che NON ci siano:
- ❌ `Error fetching suggestions: {}`
- ❌ `mock-user-id`

### 3. Verifica Database

Controlla che la tabella `ai_suggestions` esista:

```sql
SELECT COUNT(*) FROM ai_suggestions;
```

Se la tabella non esiste, applica la migration:

```sql
-- Vedi: supabase/migrations/20260114120000_create_ai_feedback_system.sql
```

---

## 📊 Schema Database AI Feedback

### Tabelle Coinvolte

1. **ai_suggestions** - Suggerimenti AI generati
2. **user_decisions** - Decisioni utente sui suggerimenti
3. **success_metrics** - Metriche di successo
4. **learning_feedback** - Pattern di apprendimento
5. **ai_transparency_log** - Log trasparenza AI

### Migration Necessaria

Se le tabelle non esistono, applica:

```bash
# Controlla se la migration esiste
ls -la supabase/migrations/20260114120000_create_ai_feedback_system.sql

# Se esiste, applicala su Supabase Dashboard → SQL Editor
```

---

## 🔧 Troubleshooting

### Problema: Widget Non Appare

**Causa:** Widget non incluso nel dashboard

**Soluzione:** Verifica che sia importato in `HomeDashboard.tsx` o `HomeDashboardSimple.tsx`:

```typescript
import AISuggestionsWidget from '@/components/ai/AISuggestionsWidget'

// Nel render:
<AISuggestionsWidget maxItems={3} priorities={['CRITICAL', 'HIGH']} />
```

### Problema: "user is undefined"

**Causa:** Componente non wrappato in `AuthProvider`

**Soluzione:** Verifica che il layout abbia l'AuthProvider:

```typescript
// In app/dashboard/layout.tsx o app/layout.tsx
import { AuthProvider } from '@/packages/core/hooks/useAuth'

export default function Layout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
```

### Problema: "garden.user_id is undefined"

**Causa:** Il garden non ha il campo `user_id`

**Soluzione:** Verifica la query che carica i gardens:

```typescript
// Assicurati di selezionare user_id
const { data: gardens } = await supabase
  .from('gardens')
  .select('*, user_id') // <-- Importante!
  .eq('user_id', user.id)
```

---

## 📝 File Modificati

### 1. components/ai/AISuggestionsWidget.tsx

**Modifiche:**
- ✅ Aggiunto import `useAuth`
- ✅ Aggiunto `const { user } = useAuth()`
- ✅ Rimosso `mock-user-id`
- ✅ Usato `user.id` nelle chiamate API
- ✅ Aggiunto check `user` in useEffect e render

**Righe Modificate:**
- Linea 8: Aggiunto import useAuth
- Linea 27: Aggiunto `const { user } = useAuth()`
- Linea 35: Cambiato condizione useEffect
- Linea 40: Usato `user.id` invece di mock
- Linea 52: Usato `user.id` invece di mock
- Linea 62: Usato `user.id` invece di mock
- Linea 117: Aggiunto check `!user`

---

## ✅ Risultato Atteso

Dopo il fix:

1. ✅ Nessun errore in console
2. ✅ Widget carica correttamente
3. ✅ Usa l'utente autenticato reale
4. ✅ Query al database con user_id corretto
5. ✅ Mostra suggerimenti se presenti nel DB
6. ✅ Mostra "Nessun suggerimento" se DB vuoto

---

## 🎯 Prossimi Passi

### 1. Popolare Database con Suggerimenti Test

Per testare il widget con dati reali, crea suggerimenti di test:

```typescript
// Script di test (da eseguire in console browser o Node)
import { collaborativeAIService } from '@/services/collaborativeAIService'

await collaborativeAIService.createSuggestion({
  user_id: 'user-id-reale',
  garden_id: 'garden-id-reale',
  suggestion_type: 'IRRIGATION',
  title: 'Riduci irrigazione del 20%',
  description: 'Le previsioni meteo indicano pioggia nei prossimi 3 giorni',
  suggested_action: 'Sospendi irrigazione fino a Venerdì',
  confidence_score: 0.85,
  action_priority: 'HIGH',
  status: 'PENDING',
  expected_outcomes: JSON.stringify([
    {
      metric: 'Risparmio Acqua',
      expectedValue: 150,
      unit: 'litri',
      timeframe: '3 giorni'
    }
  ])
})
```

### 2. Integrare con Sistema AI Reale

Attualmente i suggerimenti devono essere creati manualmente. Per integrazione completa:

1. Implementare generatore automatico suggerimenti
2. Collegare con dati meteo reali
3. Analizzare storico operazioni
4. Generare suggerimenti basati su ML

### 3. Test End-to-End

1. Crea suggerimento test
2. Verifica appaia nel widget
3. Accetta/Rifiuta suggerimento
4. Verifica stato aggiornato nel DB
5. Controlla metriche di successo

---

**Data:** 16 Gennaio 2026, 09:10  
**Autore:** Kiro AI Assistant  
**Status:** ✅ FIX APPLICATO - PRONTO PER TEST
