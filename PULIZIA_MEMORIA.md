# Guida: Pulizia Memoria LocalStorage

## Problema
L'app stava accumulando oltre 10GB di dati in localStorage (foto, letture sensori, log) causando saturazione della memoria del browser.

## Causa
Il sistema utilizzava `NEXT_PUBLIC_BYPASS_AUTH=true` che forzava l'uso di LocalStorageProvider anche con Supabase disponibile.

---

## ✅ SOLUZIONE APPLICATA

### 1. Disattivato Bypass Auth
**File modificato**: `.env.local`

```bash
# PRIMA (SBAGLIATO):
# NEXT_PUBLIC_BYPASS_AUTH=true

# DOPO (CORRETTO):
NEXT_PUBLIC_BYPASS_AUTH=false
```

**Effetto**: Ora l'app usa **SupabaseStorageProvider** quando sei autenticato, salvando TUTTI i dati nel database PostgreSQL invece che in localStorage.

---

### 2. Script di Pulizia Creato
**File creato**: `scripts/clearLocalStorage.ts`

Fornisce funzioni per analizzare e pulire il localStorage accumulato.

---

## 📋 ISTRUZIONI PER PULIRE LA MEMORIA

### **Passo 1: Riavvia il Dev Server**

Ferma e riavvia il server Next.js per applicare la variabile d'ambiente:

```bash
# Ferma il server (Ctrl+C)
# Poi riavvia:
npm run dev
```

### **Passo 2: Verifica Uso di Supabase**

Apri la console del browser (F12) e verifica:

```
🔓 Auth bypass active
```

**NON** dovrebbe apparire questo messaggio. Se appare, significa che il bypass è ancora attivo.

### **Passo 3: Analizza LocalStorage**

Nella console del browser, digita:

```javascript
analyzeOrtomioStorage()
```

Vedrai qualcosa tipo:

```
📊 Analisi localStorage (Top 20):
══════════════════════════════════════════════
1. ortoPhotoLogs: 8234.56 KB
2. ortoHydroponicReadings: 1234.12 KB
3. ortoGardens: 567.89 KB
...
══════════════════════════════════════════════
💾 TOTALE: 10.24 MB
```

### **Passo 4: Pulisci LocalStorage**

⚠️ **ATTENZIONE**: Questa operazione rimuoverà tutti i dati salvati in localStorage!

Prima di procedere, assicurati che:
- [ ] Supabase locale è running (`supabase status`)
- [ ] Sei autenticato nell'app
- [ ] I dati importanti sono già nel database

Poi, nella console del browser:

```javascript
clearOrtomioLocalStorage()
```

Vedrai:

```
📊 Analisi localStorage...
Totale chiavi: 45
💾 Dimensione totale da rimuovere: 10.24 MB
🗑️  Rimuovo ortoPhotoLogs: 8234.56 KB
🗑️  Rimuovo ortoHydroponicReadings: 1234.12 KB
...
✅ Pulizia completata!
   - Chiavi rimosse: 43
   - Spazio liberato: 10.24 MB
   - Chiavi mantenute: 2
```

---

## 🔍 VERIFICA POST-PULIZIA

### Test 1: Verifica Uso Database

1. Crea un nuovo orto
2. Aggiungi alcune piante
3. Apri DevTools → Application → Local Storage
4. Verifica che `ortoGardens` sia **piccolo** (~5-10 KB max)

Se vedi dimensioni grandi, significa che sta ancora usando localStorage!

### Test 2: Verifica Connessione Supabase

Nella console del browser:

```javascript
// Dovrebbe stampare i gardens dal database
fetch('http://127.0.0.1:54321/rest/v1/gardens', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
  }
}).then(r => r.json()).then(console.log)
```

Dovresti vedere i tuoi orti dal database.

---

## 📊 COSA VIENE SALVATO DOVE

### Nel DATABASE (Supabase):
✅ Gardens (orti)
✅ Tasks (attività)
✅ Plants (piante)
✅ Harvest logs (raccolti)
✅ Photo logs (foto e analisi)
✅ Sensor readings (letture idroponica/acquaponica/aeroponica)
✅ Inventory (semi, fertilizzanti, fitosanitari)
✅ Custom plans
✅ Treatment records

### In LocalStorage (solo cache/preferenze):
- `ortomio_user_name` - Nome utente
- `ortomio_user_onboarding_completed` - Flag onboarding completato
- Cache temporanea (se necessario)

---

## 🚨 TROUBLESHOOTING

### Problema: localStorage continua a crescere

**Causa**: Il bypass auth è ancora attivo.

**Soluzione**:
1. Verifica `.env.local`: deve avere `NEXT_PUBLIC_BYPASS_AUTH=false`
2. Riavvia completamente il dev server (kill e restart)
3. Hard refresh del browser (Ctrl+Shift+R o Cmd+Shift+R)
4. Verifica nella console: NON deve apparire "🔓 Auth bypass active"

### Problema: Errore "not authenticated"

**Causa**: Non sei loggato nell'app.

**Soluzione**:
1. Vai a `/login`
2. Usa credenziali:
   - Email: `test@test.com`
   - Password: `test1234`
3. Oppure crea nuovo account

### Problema: Dati persi dopo pulizia

**Causa**: I dati non erano sincronizzati su Supabase prima della pulizia.

**Soluzione**:
- Se hai un backup: ripristinalo
- Altrimenti: ricrea i dati nell'app (ora verranno salvati su DB)

---

## 📈 MONITORING CONTINUO

Per evitare che il problema si ripresenti:

### Controlla periodicamente:

```javascript
// In console browser - ogni tanto
analyzeOrtomioStorage()
```

Se vedi dimensioni > 5 MB, qualcosa non va!

### Imposta limite localStorage

Nel tuo browser, puoi vedere lo storage quota:

```javascript
navigator.storage.estimate().then(console.log)
```

---

## 🎯 BEST PRACTICES

1. **Non usare mai BYPASS_AUTH in produzione**
2. **Usa localStorage solo per cache leggera** (<1MB)
3. **Tutti i dati persistenti vanno nel database**
4. **Monitora dimensioni localStorage periodicamente**
5. **Implementa auto-cleanup per cache vecchie**

---

## 🧹 PULIZIA AUTOMATICA TASK

### Problema Task Accumulati

Anche i task possono accumularsi in memoria React causando instabilità. Abbiamo implementato:

1. **Hook ottimizzato** (`useTasksOptimized`) - Carica solo task recenti con paginazione
2. **Servizio cleanup** (`taskCleanupService`) - Elimina task vecchi completati automaticamente

### Cleanup Manuale Task

Nella console del browser:

```javascript
// Analizza task da pulire (dry run)
cleanupOrtomioTasks(storageProvider, gardenId) // Chiede conferma prima di eliminare
```

Report esempio:
```
📊 Task Cleanup Dry Run Report:
   - Totale task controllati: 1234
   - Task da eliminare: 567 (> 1 anno, completati)
   - Task da archiviare: 123 (> 90 giorni, completati)
   - Task da mantenere: 544
   - Spazio da liberare: 234.56 KB
```

### Task Mantenuti Sempre

Il cleanup **NON** elimina mai:
- ✅ Task non completati
- ✅ Task di tipo "Harvest" (raccolti)
- ✅ Task di tipo "PlantingSeed" (semine)
- ✅ Task di tipo "Pruning" (potature)
- ✅ Task di tipo "Treatment" (trattamenti)
- ✅ Task con note dettagliate (>100 caratteri)
- ✅ Task più recenti di 90 giorni

### Hook Ottimizzati per Componenti

Usa questi hook nei componenti invece di caricare tutti i task:

```typescript
import { useTodayTasks, useWeekTasks, useMonthTasks } from '@/packages/core/hooks/useTasksOptimized'

// Solo task di oggi (max 50)
const { tasks, loading, refresh } = useTodayTasks(gardenId)

// Task della settimana (max 100)
const { tasks, loading, refresh } = useWeekTasks(gardenId)

// Task del mese (max 200)
const { tasks, loading, refresh, loadMore, hasMore } = useMonthTasks(gardenId)
```

---

## 📝 PROSSIMI PASSI

- [ ] Verifica che l'app usi Supabase correttamente
- [ ] Pulisci localStorage accumulato
- [ ] Esegui cleanup task vecchi
- [ ] Migra componenti a useTasksOptimized
- [ ] Testa creazione/modifica orti
- [ ] Verifica che i dati persistano dopo reload
- [ ] Programma cleanup automatico settimanale

---

## 🔧 FILE CREATI/MODIFICATI

### File Creati:
1. `scripts/clearLocalStorage.ts` - Utility pulizia localStorage
2. `services/taskCleanupService.ts` - Servizio cleanup task automatico
3. `packages/core/hooks/useTasksOptimized.ts` - Hook task ottimizzato con paginazione
4. `PULIZIA_MEMORIA.md` - Questa guida

### File Modificati:
1. `.env.local` - Disattivato bypass auth (`NEXT_PUBLIC_BYPASS_AUTH=false`)
2. `app/(dashboard)/layout.tsx` - Aggiunto import script cleanup (solo dev)

---

**Creato**: 2026-01-02
**Riferimenti**:
- Issue saturazione memoria localStorage 10GB
- Issue task non salvati nel database causano instabilità
