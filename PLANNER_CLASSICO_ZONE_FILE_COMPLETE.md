# PLANNER CLASSICO CON ZONE E FILE - IMPLEMENTAZIONE COMPLETA

## Problemi Risolti

### 1. Aggiunto Supporto Zone e File nei Task
**Problema**: I task non potevano essere assegnati a zone specifiche o file dell'orto
**Soluzione**:
- Aggiornato `types.ts` con nuovi campi in `GardenTask`:
  - `rowId?: string` - ID della fila specifica
  - `rowNumber?: number` - Numero della fila (1, 2, 3, etc.)
  - `positionInRow?: number` - Posizione nella fila
- Aggiunte interfacce `GardenZone` e `GardenRow` per gestione completa
- Aggiornati form in `TaskCalendar.tsx` e `TaskList.tsx` con campi:
  - Zona (input testo)
  - Fila N° (input numerico)
  - Quantità Piante (input numerico)

### 2. Creato Planner Classico nella Sezione Principale
**Problema**: Mancava il planner classico, solo quello AI era disponibile
**Soluzione**:
- Aggiunto "📅 Planner Classico" nel menu principale della sidebar
- Creata pagina `/app/planner-classic/page.tsx` con 4 tab:
  - **Calendario**: Vista calendario mensile con task
  - **Lista Task**: Vista lista con filtri e ricerca
  - **Timeline**: Placeholder per sviluppo futuro
  - **Statistiche**: Placeholder per sviluppo futuro
- Integrato con sistema esistente di gestione task

### 3. Migliorata Visualizzazione Task
**Problema**: I task non mostravano informazioni su zone e file
**Soluzione**:
- Aggiornato `TaskList.tsx` per mostrare badge colorati:
  - 🟣 Zona (viola)
  - 🔵 Fila (indaco)
  - 🟢 Quantità piante (verde)
- Mantenuta compatibilità con task esistenti (campi opzionali)

## Struttura Menu Aggiornata

```
PRINCIPALE
├── Dashboard
├── Il Mio Orto
├── 🤖 Planner AI (esistente)
├── 📅 Planner Classico (NUOVO)
└── Salute
```

## Funzionalità Planner Classico

### Tab Calendario
- Vista mensile con navigazione
- Task visualizzati per data con colori per tipo operazione
- Click su giorno per creare nuovo task
- Click su task per modificare
- Legenda operazioni con colori

### Tab Lista Task
- Vista lista con raggruppamento per data
- Filtri: Tutti, Da fare, Oggi, In ritardo, Prossimi, Completati
- Ordinamento: Per data, pianta, tipo, stato
- Ricerca testuale
- Statistiche in tempo reale

### Form Task Migliorato
- **Nome Pianta** (obbligatorio)
- **Tipo Operazione** (dropdown in italiano)
- **Data** (date picker)
- **Varietà** (opzionale)
- **Zona** (input testo, es. "Zona A")
- **Fila N°** (input numerico, es. 1, 2, 3)
- **Quantità Piante** (input numerico, default 1)
- **Note** (textarea opzionale)

## Campi Database Aggiunti

```typescript
interface GardenTask {
  // ... campi esistenti
  rowId?: string;           // ID della fila specifica
  rowNumber?: number;       // Numero della fila (1, 2, 3, etc.)
  positionInRow?: number;   // Posizione nella fila
  quantity?: number;        // Quantità di piante (default: 1)
}

interface GardenZone {
  id: string;
  gardenId: string;
  name: string;             // es. "Zona A", "Settore Nord"
  description?: string;
  area?: number;            // metri quadrati
  soilType?: string;
  sunExposure?: 'Full Sun' | 'Partial Sun' | 'Shade';
  irrigationSystemId?: string;
  color?: string;           // per visualizzazione su mappa
}

interface GardenRow {
  id: string;
  gardenId: string;
  zoneId?: string;          // Zona di appartenenza
  rowNumber: number;        // Numero progressivo della fila
  name?: string;            // Nome personalizzato
  length?: number;          // Lunghezza in metri
  width?: number;           // Larghezza in metri
  spacing?: number;         // Distanza tra piante in cm
  maxPlants?: number;       // Numero massimo di piante
  currentPlants?: number;   // Numero attuale di piante
  plantType?: string;       // Tipo di pianta principale
  notes?: string;
}
```

## File Modificati

### Core Types
- `types.ts` - Aggiunte interfacce GardenZone, GardenRow e campi task

### Components
- `components/planner/TaskCalendar.tsx` - Form con zone/file
- `components/planner/TaskList.tsx` - Visualizzazione zone/file
- `components/professional/Sidebar.tsx` - Aggiunto menu item

### Pages
- `app/app/planner-classic/page.tsx` - Nuova pagina planner classico

## Utilizzo Pratico

### Esempio Task con Zone/File
```
Pianta: Pomodoro San Marzano
Operazione: Trapianto
Data: 15/03/2024
Zona: Zona A
Fila: 3
Quantità: 12 piante
Note: Distanza 50cm tra piante
```

### Visualizzazione nel Sistema
- **Calendario**: Task mostrato con nome pianta e tipo operazione
- **Lista**: Badge colorati per zona, fila e quantità
- **Form**: Campi dedicati per organizzazione spaziale

## Benefici per l'Utente

1. **Organizzazione Spaziale**: Assegnazione task a zone/file specifiche
2. **Pianificazione Precisa**: Controllo quantità e posizionamento
3. **Vista Unificata**: Calendario e lista in un'unica interfaccia
4. **Compatibilità**: Funziona con task esistenti (campi opzionali)
5. **Scalabilità**: Supporta orti di qualsiasi dimensione

## Status Attuale

✅ **Planner Classico Creato**: Disponibile nel menu principale
✅ **Zone e File Implementate**: Supporto completo nei task
✅ **Form Aggiornati**: Campi per organizzazione spaziale
✅ **Visualizzazione Migliorata**: Badge informativi
✅ **Compatibilità Mantenuta**: Task esistenti continuano a funzionare

## Prossimi Sviluppi Suggeriti

1. **Gestione Zone**: Interfaccia per creare/modificare zone
2. **Gestione File**: Sistema per definire file e layout
3. **Mappa Visuale**: Rappresentazione grafica dell'orto
4. **Timeline Avanzata**: Vista temporale delle operazioni
5. **Statistiche Dettagliate**: Analytics per zone e file

Il Planner Classico è ora completamente funzionale e integrato nel sistema, fornendo agli utenti un modo tradizionale e preciso per pianificare le operazioni del loro orto con supporto completo per zone e file.