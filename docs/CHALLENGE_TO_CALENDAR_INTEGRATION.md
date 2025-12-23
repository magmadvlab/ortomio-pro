# Challenge → Calendar Tasks → Notifiche

## Panoramica

Sistema completo per convertire le azioni delle challenge in task tracciabili nel calendario, con notifiche integrate.

## Flusso Completo

1. **Utente vede una challenge** → Es. "Pianifica il Tuo Anno Verde"
2. **Clicca "Aggiungi al Calendario"** → Le azioni vengono convertite in calendar tasks
3. **Task creati nel calendario** → Distribuiti nei prossimi giorni
4. **Notifica inviata** → "Nuovo Task: Crea calendario semine"
5. **Task appare nel calendario** → Con badge "Da Challenge"
6. **Notifica reminder** → "Task in scadenza: Crea calendario semine"
7. **Utente completa task** → Aggiorna anche la challenge action
8. **Challenge completata** → Badge e punti assegnati

## File Creati

### 1. Servizio di Conversione
**File**: `services/challengeTaskConverter.ts`

Funzioni principali:
- `convertChallengeActionsToTasks()`: Converte azioni challenge in calendar tasks
- `checkChallengeTasksExist()`: Verifica se i task sono già stati creati
- `distributeTasksAcrossWeek()`: Distribuisce i task su una settimana
- `inferTaskType()`: Inferisce il tipo di task dall'azione

### 2. API Endpoint
**File**: `app/api/challenges/convert-to-tasks/route.ts`

Endpoint POST che:
- Valida challenge_id e user_id
- Verifica se i task esistono già
- Crea i calendar tasks
- Restituisce gli ID dei task creati

### 3. Componente UI
**File**: `components/challenges/ChallengeToCalendarButton.tsx`

Bottone React che:
- Mostra stato di caricamento
- Gestisce successo/errore
- Mostra conteggio task creati
- Chiama l'API endpoint

### 4. Aggiornamento ChallengeWidget
**File**: `components/challenges/ChallengeWidget.tsx`

Aggiunto bottone "Aggiungi al Calendario" dopo le azioni checklist.

### 5. Migrazioni Database
**File**: `database/migrations/add_challenge_to_calendar_tasks.sql`

Aggiunge colonne:
- `challenge_id`: ID challenge (formato "giorno-mese")
- `challenge_action_index`: Indice azione nella challenge
- `source_type`: Origine task ('manual', 'challenge', 'suggested', 'recurring')

**File**: `database/migrations/add_calendar_task_notification_trigger.sql`

Trigger SQL che:
- Rileva creazione di task da challenge
- Invia notifica email automatica
- Include link al calendario

## Schema Database

### Tabella `calendar_tasks` (estesa)

```sql
ALTER TABLE calendar_tasks 
ADD COLUMN challenge_id TEXT,
ADD COLUMN challenge_action_index INTEGER,
ADD COLUMN source_type TEXT CHECK (source_type IN ('manual', 'challenge', 'suggested', 'recurring')) DEFAULT 'manual';
```

## Utilizzo

### Per l'Utente

1. Vai alla pagina Challenge o Dashboard
2. Vedi la challenge del giorno
3. Clicca "Aggiungi al Calendario"
4. I task vengono creati automaticamente
5. Ricevi notifica email
6. I task appaiono nel calendario con badge "Da Challenge"

### Per lo Sviluppatore

#### Convertire una challenge in tasks

```typescript
import { convertChallengeActionsToTasks } from '@/services/challengeTaskConverter';
import { getChallengeForDate } from '@/data/giornateSpeciali';
import { requireSupabase } from '@/lib/supabase-server';

const supabase = requireSupabase();
const challenge = getChallengeForDate(new Date());
const taskIds = await convertChallengeActionsToTasks(
  supabase,
  userId,
  challenge,
  {
    autoSchedule: true,
    gardenId: 'garden-id-optional'
  }
);
```

#### Verificare se i task esistono

```typescript
import { checkChallengeTasksExist } from '@/services/challengeTaskConverter';

const exists = await checkChallengeTasksExist(
  supabase,
  userId,
  '22-4' // challenge_id formato "giorno-mese"
);
```

## Notifiche

### Quando viene creato un task da challenge

Il trigger SQL `notify_calendar_task_created()` invia automaticamente:
- **Subject**: "Nuovo Task da Challenge: [titolo task]"
- **Contenuto**: HTML con dettagli task e link al calendario
- **Tipo**: `task_created`

### Notifiche Reminder

I task creati da challenge ricevono anche le notifiche standard:
- **Task in scadenza oggi o domani**: Invio automatico dal cron job `daily-challenge` (combinato)
  - **Schedule**: Ogni giorno alle 8:00 AM (configurato in `vercel.json`)
  - **Endpoint**: `/api/cron/daily-challenge` (esegue sia challenge che task reminders)
  - **Funzionalità**: Cerca task non completati con `date` uguale a oggi o domani e invia email di promemoria
  - **Rispetta preferenze utente**: Le notifiche vengono inviate solo se l'utente ha abilitato `task_reminders` nelle preferenze
  - **Nota**: Combinato con daily-challenge per rispettare il limite di 2 cron jobs su Vercel

## Mappatura Tipi Task

Il sistema inferisce automaticamente il tipo di task dall'azione:

| Keyword | Tipo Task |
|---------|-----------|
| semina, semine, pianta | `semina` |
| raccolta, raccogli | `raccolta` |
| potatura, potare | `potatura` |
| irrigazione, acqua, innaffia | `irrigazione` |
| concimazione, concima | `concimazione` |
| trattamento, tratta | `trattamento` |
| altro | `altro` |

## Distribuzione Date

Quando `autoSchedule: true`:
- I task vengono distribuiti nei prossimi giorni
- Massimo 1 task per giorno
- Se ci sono più di 7 task, vengono distribuiti su più settimane

Esempio:
- Task 1: Oggi
- Task 2: Domani
- Task 3: Dopodomani
- ...

## Esempi

### Challenge "Pianifica il Tuo Anno Verde" (1 Gennaio)

Azioni:
1. "Crea calendario semine per l'anno" → Task tipo `altro`
2. "Fai lista semi da ordinare" → Task tipo `altro`
3. "Pulisci e organizza attrezzi" → Task tipo `altro`
4. "Scatta foto stato attuale orto" → Task tipo `altro`

Risultato:
- 4 calendar tasks creati
- Distribuiti nei prossimi 4 giorni
- Notifiche inviate per ogni task
- Badge "Da Challenge" visibile nel calendario

## Funzionalità Implementate

1. ✅ Conversione challenge → tasks
2. ✅ Notifiche creazione task
3. ✅ Notifiche reminder (già implementato)
4. ✅ Sincronizzazione completamento task → challenge action
5. ✅ Visualizzazione badge "Da Challenge" nel calendario
6. ✅ Componenti UI per visualizzazione task con badge

## Prossimi Passi

1. 🔄 Statistiche challenge completate tramite task
2. 🔄 Integrazione completa con CalendarAlmanac component
3. 🔄 Visualizzazione progresso challenge nel calendario

## Sincronizzazione Completamento

### Servizio di Sincronizzazione
**File**: `services/challengeTaskSync.ts`

Quando un calendar task viene completato:
1. Il sistema verifica se proviene da una challenge
2. Aggiorna `challenge_completions.actions_completed`
3. Se tutte le azioni sono completate, la challenge è pronta per essere finalizzata

Funzioni:
- `syncTaskCompletionToChallenge()`: Aggiorna challenge quando task completato
- `syncTaskUncompletionFromChallenge()`: Rimuove azione quando task non completato
- `isChallengeTask()`: Verifica se un task proviene da challenge

### Componenti UI

**File**: `components/calendar/CalendarTaskBadge.tsx`
- Badge "Da Challenge" con icona Trophy
- Mostrato solo per task con `source_type = 'challenge'`

**File**: `components/calendar/CalendarTaskItem.tsx`
- Componente completo per visualizzare calendar task
- Include badge challenge, checkbox completamento, date
- Gestisce stati: completato, in scadenza, normale

## Note Tecniche

- Il trigger SQL usa `net.http_post` per chiamare l'Edge Function
- In produzione, configurare `app.settings.supabase_url` e `app.settings.service_role_key`
- Il componente UI gestisce errori e stati di caricamento
- I task mantengono riferimento alla challenge tramite `challenge_id`
- La sincronizzazione è bidirezionale: task completato → challenge action completata
- L'API PATCH `/api/calendar/tasks/[id]` gestisce automaticamente la sincronizzazione

