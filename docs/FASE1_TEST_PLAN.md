# FASE 1 - Piano di Test Completo

**Versione**: 1.0.0
**Data**: 2024-12-24
**Tipo**: Manual Testing + Automated (futuro)

---

## Indice

1. [Setup Test Environment](#setup-test-environment)
2. [Test Sprint 1: Navigazione](#test-sprint-1-navigazione)
3. [Test Sprint 2: Raccolto](#test-sprint-2-raccolto)
4. [Test Sprint 3: Il Mio Orto](#test-sprint-3-il-mio-orto)
5. [Test Sprint 4: Salute](#test-sprint-4-salute)
6. [Test Sprint 5: Onboarding](#test-sprint-5-onboarding)
7. [Regression Tests](#regression-tests)
8. [Bug Report Template](#bug-report-template)

---

## Setup Test Environment

### Prerequisiti

- [ ] Database locale pulito (o staging)
- [ ] Nessun dato utente precedente in localStorage
- [ ] Browser dev tools aperti (Console + Network tab)
- [ ] Utente test creato con email: `test-fase1@ortomio.app`

### Reset Completo

```bash
# 1. Clear localStorage
localStorage.clear()

# 2. Reset database (locale)
npm run db:reset

# 3. Clear browser cache
Cmd+Shift+Delete (Chrome)
```

### Dati Test

Creare giardino test con:
- **Nome**: Orto Test FASE 1
- **Tipo**: Orto in piena terra
- **Dimensioni**: 10m x 5m
- **Posizione**: Milano (45.4642, 9.1900)

Creare piante test:
1. **Pomodoro San Marzano** - Seminato 60 giorni fa (MATURO)
2. **Basilico** - Seminato 30 giorni fa (GIOVANE)
3. **Lattuga** - Seminata 20 giorni fa (GIOVANE)

---

## Test Sprint 1: Navigazione

### Test 1.1: Menu PRO Collapsable

**Precondizioni**: Utente con tier PRO

**Passi**:
1. Login come PRO user
2. Osserva sidebar sinistra

**Verifiche**:
- [ ] ✅ Menu mostra 5 gruppi: PRINCIPALE, COLTURE SPECIALIZZATE, GESTIONE AVANZATA, STRUMENTI, IMPOSTAZIONI
- [ ] ✅ Gruppo "PRINCIPALE" NON ha chevron (sempre aperto)
- [ ] ✅ Gruppo "COLTURE SPECIALIZZATE" ha chevron (collapsable)
- [ ] ✅ Gruppo "GESTIONE AVANZATA" ha chevron (collapsable)
- [ ] ✅ Gruppo "STRUMENTI" NON ha chevron (sempre aperto)
- [ ] ✅ Gruppo "IMPOSTAZIONI" NON ha chevron (sempre aperto)

**Screenshot**: `test-sprint1-menu-groups.png`

---

### Test 1.2: Collapse/Expand Funzionalità

**Passi**:
1. Click sul chevron di "COLTURE SPECIALIZZATE"
2. Attendi animazione
3. Osserva menu
4. Click di nuovo sul chevron
5. Attendi animazione

**Verifiche**:
- [ ] ✅ Primo click → chevron ruota 90° e voci nascoste
- [ ] ✅ Secondo click → chevron torna normale e voci visibili
- [ ] ✅ Animazione smooth (no jump)
- [ ] ✅ Altre sezioni non influenzate

**Screenshot**:
- `test-sprint1-collapsed.png`
- `test-sprint1-expanded.png`

---

### Test 1.3: Persistenza localStorage

**Passi**:
1. Collapse "COLTURE SPECIALIZZATE"
2. Collapse "GESTIONE AVANZATA"
3. Reload pagina (F5)
4. Osserva menu

**Verifiche**:
- [ ] ✅ "COLTURE SPECIALIZZATE" rimane collapsed dopo reload
- [ ] ✅ "GESTIONE AVANZATA" rimane collapsed dopo reload
- [ ] ✅ localStorage contiene `ortomio_sidebar_collapsed` key
- [ ] ✅ Valore è array JSON: `["COLTURE SPECIALIZZATE", "GESTIONE AVANZATA"]`

**Console Command**:
```javascript
localStorage.getItem('ortomio_sidebar_collapsed')
// Expected: '["COLTURE SPECIALIZZATE","GESTIONE AVANZATA"]'
```

---

### Test 1.4: Mobile Navigation

**Precondizioni**: Riduci finestra a mobile width (<768px)

**Passi**:
1. Osserva bottom navigation bar
2. Click sul menu hamburger

**Verifiche**:
- [ ] ✅ Bottom nav mostra 4 icone: Dashboard, Il Mio Orto, Salute, Progressi
- [ ] ✅ Drawer menu apre da destra
- [ ] ✅ Drawer menu contiene stessi gruppi di sidebar desktop
- [ ] ✅ Collapse/expand funziona anche in drawer

---

## Test Sprint 2: Raccolto

### Test 2.1: Harvest Modal su Task Watering

**Precondizioni**:
- Pianta MATURA esistente (Pomodoro San Marzano, 60+ giorni)
- Task "Irrigazione" non completato per questa pianta

**Passi**:
1. Vai a "Il Mio Orto" → Tab "Lista"
2. Trova task "Irrigazione - Pomodoro San Marzano"
3. Click sul checkbox per completare task
4. Attendi 500ms

**Verifiche**:
- [ ] ✅ Task marcato come completato
- [ ] ✅ Modal "Registra Raccolto" apre AUTOMATICAMENTE
- [ ] ✅ Modal pre-compilato con "Pomodoro San Marzano"
- [ ] ✅ Modal mostra campi: quantità, unità, qualità, note, foto
- [ ] ✅ Button "Registra Raccolto" abilitato

**Screenshot**: `test-sprint2-harvest-modal-watering.png`

**⚠️ CRITICO**: Se modal NON apre, è un bug critico (vedi bug #FASE1-001)

---

### Test 2.2: Harvest Modal su Task Fertilize

**Precondizioni**:
- Stessa pianta MATURA
- Task "Concimazione" non completato

**Passi**:
1. Completa task "Concimazione - Pomodoro San Marzano"
2. Attendi 500ms

**Verifiche**:
- [ ] ✅ Modal "Registra Raccolto" apre AUTOMATICAMENTE
- [ ] ✅ Pre-compilato correttamente

**Screenshot**: `test-sprint2-harvest-modal-fertilize.png`

---

### Test 2.3: NO Harvest Modal su Pianta Giovane

**Precondizioni**:
- Pianta GIOVANE (Basilico, 30 giorni - NON maturo)
- Task qualsiasi per questa pianta

**Passi**:
1. Completa task per Basilico
2. Attendi 1 secondo

**Verifiche**:
- [ ] ✅ Task completato
- [ ] ✅ Modal raccolto NON apre (pianta non matura)
- [ ] ✅ Nessun errore in console

---

### Test 2.4: NO Harvest Modal se Già Raccolto

**Precondizioni**:
- Pianta MATURA con `harvestLogId` già presente
- Task qualsiasi per questa pianta

**Passi**:
1. Completa task per pianta già raccolta
2. Attendi 1 secondo

**Verifiche**:
- [ ] ✅ Task completato
- [ ] ✅ Modal raccolto NON apre (già raccolto)

---

### Test 2.5: FAB Raccolto Manuale

**Passi**:
1. Vai a "Il Mio Orto"
2. Click sul FAB (Floating Action Button) in basso a destra
3. Osserva menu opzioni
4. Click su "Raccolto" (icona 🛒)

**Verifiche**:
- [ ] ✅ FAB mostra opzioni: Nuovo Task, Raccolto, Scatta Foto, Nuova Semina
- [ ] ✅ Click "Raccolto" → HarvestPromptModal apre
- [ ] ✅ Modal in modalità "manuale" (dropdown selezione pianta)
- [ ] ✅ Dropdown mostra tutte piante mature disponibili

**Screenshot**: `test-sprint2-fab-harvest.png`

---

### Test 2.6: Submit Harvest Modal

**Passi**:
1. Apri harvest modal (via task completion o FAB)
2. Compila campi:
   - Quantità: 2.5
   - Unità: kg
   - Qualità: Ottima
   - Note: "Primo raccolto stagione"
3. Click "Registra Raccolto"

**Verifiche**:
- [ ] ✅ Modal si chiude
- [ ] ✅ Toast success "Raccolto registrato! 🎉"
- [ ] ✅ Harvest log creato in database
- [ ] ✅ Task.harvestLogId aggiornato (se da task)
- [ ] ✅ Pagina "Progressi" → Tab "Raccolti" mostra nuovo entry

**Console Command**:
```javascript
// Verifica harvest log creato
const logs = await storageProvider.getHarvestLogs()
console.log(logs[logs.length - 1]) // Ultimo creato
```

---

## Test Sprint 3: Il Mio Orto

### Test 3.1: PlantCard Display

**Passi**:
1. Vai a "Il Mio Orto" → Tab "Piante"
2. Osserva cards piante

**Verifiche**:
- [ ] ✅ Ogni pianta ha una card dedicata
- [ ] ✅ Card mostra emoji status (🌱 giovane, 🥗 pronto)
- [ ] ✅ Card mostra nome pianta + varietà (se presente)
- [ ] ✅ Card mostra zona/letto
- [ ] ✅ Card mostra progress bar maturità (%)
- [ ] ✅ Card mostra "X giorni dalla semina"
- [ ] ✅ Card mostra badge status (In crescita, Pronto!, Appena seminato)

**Screenshot**: `test-sprint3-plant-cards.png`

---

### Test 3.2: Harvest Button Visibility

**Precondizioni**:
- Almeno 1 pianta MATURA
- Almeno 1 pianta GIOVANE

**Verifiche**:
- [ ] ✅ Pianta MATURA mostra button "Raccogli ora" (verde)
- [ ] ✅ Pianta GIOVANE NON mostra button "Raccogli ora"
- [ ] ✅ Pianta già raccolta NON mostra button "Raccogli ora"
- [ ] ✅ Tutte piante mostrano button "Dettagli"

**Screenshot**:
- `test-sprint3-mature-plant.png` (con button Raccogli)
- `test-sprint3-young-plant.png` (senza button Raccogli)

---

### Test 3.3: Harvest da PlantCard

**Passi**:
1. Trova pianta MATURA con button "Raccogli ora"
2. Click "Raccogli ora"
3. Osserva modal

**Verifiche**:
- [ ] ✅ HarvestPromptModal apre
- [ ] ✅ Pre-compilato con dati pianta corretta
- [ ] ✅ Submit funziona (vedi Test 2.6)

---

### Test 3.4: Dettagli Pianta

**Passi**:
1. Click "Dettagli" su qualsiasi PlantCard

**Verifiche**:
- [ ] ✅ Console log mostra: `View details for: [NomePianta]`
- [ ] ⚠️ TODO: Implementare modal/page dettagli (FASE 2)

---

## Test Sprint 4: Salute

**⚠️ NOTA**: Test Sprint 4 richiedono implementazione metodi storage provider per health alerts. Se metodi non implementati, questi test falliranno con errori "function not found".

### Test 4.1: Database Schema

**Precondizioni**: Accesso a database (Supabase o locale)

**SQL Queries**:
```sql
-- 1. Verifica tabella esiste
SELECT table_name FROM information_schema.tables
WHERE table_name = 'health_alerts';
-- Expected: 1 row

-- 2. Verifica RLS abilitato
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename = 'health_alerts';
-- Expected: rowsecurity = true

-- 3. Verifica policy
SELECT policyname FROM pg_policies
WHERE tablename = 'health_alerts';
-- Expected: 'health_alerts_user'

-- 4. Verifica indici
SELECT indexname FROM pg_indexes
WHERE tablename = 'health_alerts';
-- Expected: 4 indici (garden, unresolved, created, severity)

-- 5. Verifica trigger
SELECT tgname FROM pg_trigger
WHERE tgrelid = 'health_alerts'::regclass;
-- Expected: 'health_alerts_updated_at'
```

**Verifiche**:
- [ ] ✅ Tabella `health_alerts` esiste
- [ ] ✅ RLS abilitato (`rowsecurity = true`)
- [ ] ✅ Policy `health_alerts_user` esiste
- [ ] ✅ 4 indici esistono
- [ ] ✅ Trigger `updated_at` esiste

---

### Test 4.2: Create Health Alert

**Precondizioni**: Storage provider implementato

**Console Command**:
```javascript
// Create test alert
const alert = await storageProvider.createHealthAlert({
  gardenId: 'your-garden-id',
  alertType: 'water',
  severity: 'critical',
  source: 'task_overdue',
  title: 'Test Irrigazione Ritardo',
  message: 'Basilico non irrigato da 7 giorni',
  recommendation: 'Irriga abbondantemente SUBITO',
  resolved: false,
  metadata: { daysSinceLastWatering: 7 }
})

console.log('Alert creato:', alert.id)
```

**Verifiche**:
- [ ] ✅ Alert creato (no errori)
- [ ] ✅ `alert.id` UUID valido
- [ ] ✅ `alert.createdAt` timestamp corrente
- [ ] ✅ `alert.updatedAt` uguale a `createdAt`

---

### Test 4.3: HealthDashboard Display

**Precondizioni**: Almeno 1 alert non risolto in database

**Passi**:
1. Vai a "Salute"
2. Scroll verso sezione "Alert Automatici"

**Verifiche**:
- [ ] ✅ Sezione "Alert Automatici" visibile
- [ ] ✅ Badge count corretto (es. "3" se 3 alert)
- [ ] ✅ Alert ordinati per severity (critical primo)
- [ ] ✅ Ogni alert mostra AlertCard component

**Screenshot**: `test-sprint4-health-dashboard.png`

---

### Test 4.4: AlertCard Rendering

**Verifiche per ogni AlertCard**:
- [ ] ✅ Icona severity corretta (🔴 critical, ⚠️ warning, ℹ️ info)
- [ ] ✅ Border-left color corretto (rosso/giallo/blu)
- [ ] ✅ Background color corretto (red-50/yellow-50/blue-50)
- [ ] ✅ Titolo alert mostrato
- [ ] ✅ Messaggio alert mostrato
- [ ] ✅ Raccomandazione mostrata (se presente)
- [ ] ✅ Metadata mostrata (temp, humidity, giorni, piante)
- [ ] ✅ Timestamp creazione mostrato
- [ ] ✅ 3 button: Risolto, Pianifica, Ignora

**Screenshot**:
- `test-sprint4-alert-critical.png`
- `test-sprint4-alert-warning.png`
- `test-sprint4-alert-info.png`

---

### Test 4.5: Risolvi Alert

**Passi**:
1. Click "Risolto" su un alert
2. Attendi aggiornamento UI

**Verifiche**:
- [ ] ✅ Alert scompare dalla lista
- [ ] ✅ Badge count decrementato
- [ ] ✅ Database: `alert.resolved = true`
- [ ] ✅ Database: `alert.resolvedAt` popolato
- [ ] ✅ Nessun errore in console

**Console Command**:
```javascript
// Verifica alert risolto
const alert = await storageProvider.getHealthAlert('alert-id')
console.log('Resolved:', alert.resolved) // true
console.log('Resolved at:', alert.resolvedAt) // ISO timestamp
```

---

### Test 4.6: No Alert Message

**Precondizioni**: Nessun alert non risolto

**Passi**:
1. Risolvi tutti gli alert
2. Vai a "Salute"

**Verifiche**:
- [ ] ✅ Sezione "Alert Automatici" nascosta
- [ ] ✅ Messaggio "Nessun Alert Attivo" visibile
- [ ] ✅ Icona ✅ mostrata
- [ ] ✅ Testo "Il tuo orto è in ottime condizioni!"

**Screenshot**: `test-sprint4-no-alerts.png`

---

### Test 4.7: Alert Engine - Weather Disease Risk

**Precondizioni**: Simulare condizioni meteo peronospora

**Setup**:
```javascript
// Mock weather data
const weatherData = {
  temp: 22,
  humidity: 85,
  rainTomorrow: true
}

// Mock tasks con piante vulnerabili
const tasks = [
  { plantName: 'Pomodoro', taskType: 'Sowing', completed: false },
  { plantName: 'Patate', taskType: 'Sowing', completed: false }
]

// Call engine
const alerts = await checkHealthAlerts({
  garden: { id: 'test-garden' },
  tasks,
  weather: weatherData
})

console.log('Alerts generated:', alerts)
```

**Verifiche**:
- [ ] ✅ Engine genera alert "Rischio Peronospora"
- [ ] ✅ Alert.severity = 'warning'
- [ ] ✅ Alert.alertType = 'disease'
- [ ] ✅ Alert.source = 'weather_api'
- [ ] ✅ Metadata contiene temp, humidity
- [ ] ✅ affectedPlants = ['Pomodoro', 'Patate']

---

### Test 4.8: Alert Engine - Water Deficit

**Setup**:
```javascript
// Task irrigazione in ritardo
const tasks = [
  {
    id: 'task-1',
    plantName: 'Basilico',
    taskType: 'Watering',
    completed: false,
    date: '2024-12-17' // 7 giorni fa
  }
]

const alerts = await checkHealthAlerts({
  garden: { id: 'test-garden' },
  tasks
})
```

**Verifiche**:
- [ ] ✅ Engine genera alert "Irrigazione in Ritardo"
- [ ] ✅ Alert.severity = 'critical' (>7 giorni)
- [ ] ✅ Alert.alertType = 'water'
- [ ] ✅ Metadata.daysSinceLastWatering = 7

---

### Test 4.9: Alert Engine - Seasonal Pests

**Setup**:
```javascript
// Simula mese Aprile (afidi attivi)
const currentMonth = 4

const tasks = [
  { plantName: 'Pomodoro', taskType: 'Sowing', completed: false },
  { plantName: 'Peperoni', taskType: 'Sowing', completed: false }
]

const alerts = await checkHealthAlerts({
  garden: { id: 'test-garden' },
  tasks
})
```

**Verifiche**:
- [ ] ✅ Engine genera alert "Periodo Afidi"
- [ ] ✅ Alert.severity = 'info'
- [ ] ✅ Alert.alertType = 'pest'
- [ ] ✅ Alert.source = 'seasonal'
- [ ] ✅ affectedPlants contiene piante sensibili

---

## Test Sprint 5: Onboarding

### Test 5.1: Skip User Onboarding

**Precondizioni**:
- Nuovo utente (localStorage pulito)
- Nessun giardino esistente

**Passi**:
1. Registra nuovo account
2. Login
3. Osserva UserOnboardingWizard
4. Click "Salta per ora" (top-right)

**Verifiche**:
- [ ] ✅ Button "Salta per ora" visibile in header
- [ ] ✅ Click button → wizard si chiude
- [ ] ✅ Dashboard mostrata immediatamente
- [ ] ✅ OnboardingBanner visibile
- [ ] ✅ localStorage `ortomio_user_onboarding_completed` = 'true'

**Screenshot**: `test-sprint5-skip-wizard.png`

---

### Test 5.2: OnboardingBanner Display

**Precondizioni**: User onboarding completato, nessun giardino

**Passi**:
1. Osserva dashboard

**Verifiche**:
- [ ] ✅ OnboardingBanner visibile in top
- [ ] ✅ Gradient background (verde/smeraldo/teal)
- [ ] ✅ Icona Sprout (🌱) visibile
- [ ] ✅ Titolo "👋 Benvenuto in OrtoMio!"
- [ ] ✅ 3 button: "Usa mia posizione", "Inserisci manualmente", "Salta per ora"
- [ ] ✅ Tooltip informativo sui benefici
- [ ] ✅ Button X (close) in top-right

**Screenshot**: `test-sprint5-banner.png`

---

### Test 5.3: Banner - Usa Mia Posizione

**Passi**:
1. Click "Usa mia posizione"
2. Accetta prompt browser geolocation
3. Osserva modal

**Verifiche**:
- [ ] ✅ Browser richiede permesso geolocation
- [ ] ✅ Modal GardenOnboarding apre
- [ ] ✅ Modal in "quick mode" (3 step invece 6)
- [ ] ✅ Posizione auto-rilevata e pre-compilata
- [ ] ✅ Workflow semplificato

**Screenshot**: `test-sprint5-auto-location.png`

---

### Test 5.4: Banner - Inserisci Manualmente

**Passi**:
1. Click "Inserisci manualmente"
2. Osserva modal

**Verifiche**:
- [ ] ✅ Modal GardenOnboarding apre
- [ ] ✅ Campi posizione VUOTI (da compilare)
- [ ] ✅ Workflow completo normale

---

### Test 5.5: Banner - Salta per Ora

**Passi**:
1. Click "Salta per ora"
2. Osserva dashboard

**Verifiche**:
- [ ] ✅ OnboardingBanner scompare
- [ ] ✅ Dashboard vuota mostrata
- [ ] ✅ Messaggio "Benvenuto in OrtoMio!"
- [ ] ✅ Icona 🌱 grande
- [ ] ✅ Button CTA "Crea il tuo orto"

**Screenshot**: `test-sprint5-empty-dashboard.png`

---

### Test 5.6: Dashboard Vuota - CTA

**Passi**:
1. Click "Crea il tuo orto" (dopo banner dismissed)
2. Osserva

**Verifiche**:
- [ ] ✅ GardenOnboarding full-page apre
- [ ] ✅ Workflow completo (6 step)
- [ ] ✅ Dopo completamento → dashboard con giardino

---

### Test 5.7: Banner Non Mostrato con Giardino

**Precondizioni**: Almeno 1 giardino esistente

**Passi**:
1. Login
2. Osserva dashboard

**Verifiche**:
- [ ] ✅ OnboardingBanner NON visibile
- [ ] ✅ Dashboard normale (HomeDashboard) visibile
- [ ] ✅ Dati giardino caricati

---

## Regression Tests

### Regression 1: Login/Logout

**Passi**:
1. Logout
2. Torna a login page
3. Login con credenziali corrette

**Verifiche**:
- [ ] ✅ Logout redirect a `/login`
- [ ] ✅ Login redirect a `/app`
- [ ] ✅ Session mantenuta dopo reload
- [ ] ✅ Nessun errore console

---

### Regression 2: Creazione Giardino

**Passi**:
1. Apri wizard creazione giardino
2. Completa tutti step
3. Submit

**Verifiche**:
- [ ] ✅ Giardino creato in database
- [ ] ✅ Redirect a dashboard
- [ ] ✅ Dashboard mostra nuovo giardino
- [ ] ✅ Nessun errore

---

### Regression 3: Creazione Task

**Passi**:
1. Vai a "Il Mio Orto"
2. Click FAB → "Nuovo Task"
3. Compila form task
4. Submit

**Verifiche**:
- [ ] ✅ Task creato
- [ ] ✅ Task visibile in liste
- [ ] ✅ Task visibile in calendario

---

### Regression 4: Challenge System

**Passi**:
1. Completa un task
2. Verifica challenge progress

**Verifiche**:
- [ ] ✅ Challenge progress aggiornato
- [ ] ✅ Notifica challenge completato (se applicabile)
- [ ] ✅ Badge challenge visibile

---

### Regression 5: Foto Piante

**Passi**:
1. Click FAB → "Scatta Foto"
2. Carica foto
3. Submit

**Verifiche**:
- [ ] ✅ Foto caricata
- [ ] ✅ Photo log creato
- [ ] ✅ Foto visibile in galleria

---

## Bug Report Template

### Bug #FASE1-XXX: [Titolo Breve]

**Severity**: Critical | High | Medium | Low

**Sprint**: Sprint X - [Nome Feature]

**Descrizione**:
[Descrizione dettagliata del problema]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior**:
[Cosa dovrebbe succedere]

**Actual Behavior**:
[Cosa succede realmente]

**Screenshots**:
[Allegare screenshot]

**Console Errors**:
```
[Copia errori da console]
```

**Environment**:
- Browser: [Chrome 120.0]
- OS: [macOS 14.0]
- Tier: [FREE/PLUS/PRO]
- Database: [Local/Supabase]

**Workaround** (se esiste):
[Soluzione temporanea]

---

## Esempi Bug Known

### Bug #FASE1-001: Harvest Modal Non Apre su Task Watering

**Severity**: Critical

**Sprint**: Sprint 2 - Raccolto Integrato

**Descrizione**:
Completando task "Watering" su pianta matura, il modal HarvestPrompt non apre automaticamente.

**Steps to Reproduce**:
1. Crea pianta matura (60+ giorni)
2. Crea task "Watering" per questa pianta
3. Completa task
4. Osserva

**Expected**: Modal harvest apre automaticamente
**Actual**: Nulla succede, task completato ma no modal

**Root Cause**:
`isPlantMature(task)` riceve task Watering invece di sowingTask.
La funzione `isPlantMature()` funziona solo su task Sowing/Transplant.

**Fix**: Implementato in Sprint 2 - cerca sowingTask prima di check maturity

**Status**: ✅ FIXED

---

## Test Report Template

### FASE 1 Test Report - [Data]

**Tester**: [Nome]
**Environment**: [Local/Staging/Production]
**Duration**: [Ore totali testing]

#### Sprint 1: Navigazione
- [ ] Test 1.1: PASS / FAIL
- [ ] Test 1.2: PASS / FAIL
- [ ] Test 1.3: PASS / FAIL
- [ ] Test 1.4: PASS / FAIL

#### Sprint 2: Raccolto
- [ ] Test 2.1: PASS / FAIL
- [ ] Test 2.2: PASS / FAIL
- [ ] Test 2.3: PASS / FAIL
- [ ] Test 2.4: PASS / FAIL
- [ ] Test 2.5: PASS / FAIL
- [ ] Test 2.6: PASS / FAIL

#### Sprint 3: Il Mio Orto
- [ ] Test 3.1: PASS / FAIL
- [ ] Test 3.2: PASS / FAIL
- [ ] Test 3.3: PASS / FAIL
- [ ] Test 3.4: PASS / FAIL

#### Sprint 4: Salute
- [ ] Test 4.1: PASS / FAIL
- [ ] Test 4.2: PASS / FAIL
- [ ] Test 4.3: PASS / FAIL
- [ ] Test 4.4: PASS / FAIL
- [ ] Test 4.5: PASS / FAIL
- [ ] Test 4.6: PASS / FAIL
- [ ] Test 4.7: PASS / FAIL
- [ ] Test 4.8: PASS / FAIL
- [ ] Test 4.9: PASS / FAIL

#### Sprint 5: Onboarding
- [ ] Test 5.1: PASS / FAIL
- [ ] Test 5.2: PASS / FAIL
- [ ] Test 5.3: PASS / FAIL
- [ ] Test 5.4: PASS / FAIL
- [ ] Test 5.5: PASS / FAIL
- [ ] Test 5.6: PASS / FAIL
- [ ] Test 5.7: PASS / FAIL

#### Regression Tests
- [ ] Regression 1: PASS / FAIL
- [ ] Regression 2: PASS / FAIL
- [ ] Regression 3: PASS / FAIL
- [ ] Regression 4: PASS / FAIL
- [ ] Regression 5: PASS / FAIL

#### Summary
- **Total Tests**: XX
- **Passed**: XX
- **Failed**: XX
- **Pass Rate**: XX%
- **Bugs Found**: XX (X critical, X high, X medium, X low)

#### Critical Issues
1. [Bug #XXX]: [Descrizione]
2. [Bug #XXX]: [Descrizione]

#### Recommendations
- [Raccomandazione 1]
- [Raccomandazione 2]

---

**READY FOR TESTING** ✅

Eseguire test in ordine sequenziale per massima coverage.
