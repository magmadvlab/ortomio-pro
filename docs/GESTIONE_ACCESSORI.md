# Gestione Accessori Giardino - OrtoMio AI

## Panoramica

Gli accessori del giardino (serre, pali, reti, fili, ecc.) sono gestiti in OrtoMio attraverso un sistema integrato che suggerisce automaticamente gli accessori necessari in base alle piante coltivate e permette di gestirli in modo organizzato.

---

## Categorie di Accessori

Gli accessori sono organizzati in **4 categorie principali**:

### 1. **Support** (Supporti)
- **Stake** (Palo): Paletti singoli per piante che necessitano supporto verticale
- **Tutor** (Tutore): Supporto più robusto per piante pesanti
- **Trellis** (Spalliera): Struttura reticolare per piante rampicanti
- **Cage** (Gabbia): Gabbia metallica per pomodori, peperoni
- **Espalier** (Spalliera): Sistema di allevamento per alberi da frutto

### 2. **Netting** (Reti)
- **Shade** (Ombreggiante): Rete ombreggiante per protezione dal sole
- **Hail** (Antigrandine): Rete protettiva contro grandine
- **Insect** (Antinsetto): Rete per protezione da insetti
- **Harvest** (Raccolta): Rete per raccolta olive/frutta

### 3. **Wire** (Fili)
- **Steel** (Acciaio): Filo metallico per strutture permanenti
- **Plastic** (Plastica): Filo plastificato per strutture temporanee

### 4. **Structure** (Strutture)
- **Serre**: Serre fredde, temperate, tropicali
- **Tunnel**: Tunnel per colture protette
- **Archi**: Archi per tunnel o pergole
- **Altri**: Strutture permanenti del giardino

---

## Dove Sono Visualizzati nel Frontend

### 1. **Dashboard (Home)**

**Widget "Accessori"** (`AccessoriesWidget`):
- Mostra statistiche per categoria:
  - Numero Supporti
  - Numero Reti
  - Numero Fili
  - Numero Strutture
- Alert per accessori da sostituire
- Pulsante "Gestisci" per aprire la gestione completa

**Posizione**: Nella Dashboard principale, insieme agli altri widget (Semi, Piantine, ecc.)

### 2. **Planner (Semina)**

**Sezione "Accessori Consigliati"** (`AccessoriesSuggestionsSection`):
- Appare automaticamente quando selezioni una pianta nel Planner
- Mostra suggerimenti intelligenti basati su:
  - `supportRequirements` della pianta (dal PlantMasterSheet)
  - `growthHabit` (rampicante, eretto, strisciante)
  - `maxHeight` (altezza massima)
  - `susceptibility` (vulnerabilità a insetti/grandine)

**Caratteristiche**:
- Badge di priorità (Importante/Consigliato/Opzionale)
- Indicazione se l'accessorio è già presente
- Pulsante "Aggiungi Accessorio" che apre form pre-compilato
- Istruzioni per installazione

**Esempio**: 
- Selezioni "FAGIOLINO ARRAMPICANTE" → Sistema suggerisce:
  - 🪴 **Trellis** (Alta priorità) - Altezza consigliata: 200cm
  - 🕸️ **Rete antinsetto** (Media priorità) - Protezione da afidi

### 3. **Visual Garden Planner** (Pro Feature)

**Visualizzazione Accessori**:
- Gli accessori possono essere visualizzati come overlay sulla griglia del giardino
- Toggle "Mostra/Nascondi accessori" per attivare/disattivare visualizzazione
- Posizionamento opzionale con coordinate (x, y) nella griglia

**Utilizzo**:
- Pianificazione visiva del posizionamento
- Verifica sovrapposizioni con piante
- Ottimizzazione spazio

### 4. **Gestione Accessori** (Modal)

**AccessoriesManager**:
- Accessibile dalla Dashboard tramite pulsante "Gestisci" nel widget Accessori
- Funzionalità complete:
  - **Aggiungere** nuovo accessorio
  - **Modificare** accessorio esistente
  - **Eliminare** accessorio
  - **Filtrare** per categoria o pianta
  - **Visualizzare** lista completa con dettagli

**Filtri disponibili**:
- Per categoria: Support, Netting, Wire, Structure, Tutti
- Per pianta: Filtra accessori usati per una specifica pianta

---

## Come Funziona il Sistema di Suggerimenti

### Engine di Suggerimenti (`accessoriesEngine.ts`)

Il sistema analizza automaticamente le caratteristiche della pianta e suggerisce accessori appropriati:

**Logica di Suggerimento**:

1. **Analisi `supportRequirements`** (se presente nel PlantMasterSheet):
   ```typescript
   supportRequirements: {
     needsSupport: true,
     supportType: 'Trellis',
     minHeight: 180,
     maxHeight: 250,
     material: 'Steel'
   }
   ```

2. **Analisi `growthHabit`**:
   - `Climbing`: Suggerisce Trellis o Tutor
   - `Erect`: Suggerisce Stake o Cage
   - `Spreading`: Suggerisce Cage o Tutor

3. **Analisi `maxHeight`**:
   - Determina altezza consigliata per supporti
   - Esempio: Pianta alta 200cm → Trellis 200-250cm

4. **Analisi `susceptibility`**:
   - Insetti → Rete antinsetto
   - Grandine → Rete antigrandine
   - Sole eccessivo → Rete ombreggiante

**Esempi Pratici**:

**Fagiolino Rampicante**:
```typescript
{
  growthHabit: 'Climbing',
  maxHeight: 200,
  supportRequirements: {
    needsSupport: true,
    supportType: 'Trellis',
    minHeight: 180
  }
}
```
→ Suggerisce: **Trellis** (Alta priorità, 200cm)

**Pomodoro**:
```typescript
{
  growthHabit: 'Erect',
  maxHeight: 150,
  supportRequirements: {
    needsSupport: true,
    supportType: 'Cage'
  },
  susceptibility: {
    insects: ['Afidi', 'Mosca bianca']
  }
}
```
→ Suggerisce: 
- **Cage** (Alta priorità, 150cm)
- **Rete antinsetto** (Media priorità)

**Fragole**:
```typescript
{
  growthHabit: 'Spreading',
  susceptibility: {
    hail: true,
    insects: ['Afidi']
  }
}
```
→ Suggerisce: **Rete antigrandine** + **Rete antinsetto** (Media priorità)

---

## Struttura Dati

### GardenAccessory

```typescript
interface GardenAccessory {
  id: string;
  gardenId: string;              // Associazione a orto/serra
  
  // Identificazione
  name: string;                  // Nome accessorio
  category: 'Support' | 'Netting' | 'Wire' | 'Structure';
  
  // Tipo specifico
  supportType?: 'Stake' | 'Tutor' | 'Trellis' | 'Cage' | 'Espalier';
  nettingType?: 'Shade' | 'Hail' | 'Insect' | 'Harvest';
  wireType?: 'Steel' | 'Plastic';
  
  // Materiale
  material: 'Wood' | 'Steel' | 'Plastic' | 'Bamboo' | 'Cane' | 
            'Aluminum' | 'Polyethylene' | 'Polypropylene';
  
  // Dimensioni
  quantity?: number;             // Numero pezzi
  length?: number;               // Lunghezza in cm
  height?: number;               // Altezza in cm
  width?: number;                // Larghezza in cm
  diameter?: number;             // Diametro in cm (per paletti)
  meshSize?: number;             // Dimensione maglia rete in mm
  
  // Utilizzo
  usedFor?: string[];            // Piante/colture per cui è usato
  installationDate?: string;     // Data installazione (ISO)
  expectedLifespan?: number;     // Durata prevista in anni
  
  // Manutenzione
  lastMaintenance?: string;      // Ultima manutenzione (ISO)
  needsReplacement?: boolean;    // Da sostituire
  
  // Posizione (opzionale, per Visual Planner)
  position?: {
    x: number;                   // Coordinate nella griglia (0-100%)
    y: number;
  };
  
  createdAt: string;
  updatedAt: string;
}
```

---

## Flusso di Utilizzo

### Scenario 1: Aggiungere Accessorio da Suggerimento

1. **Utente seleziona pianta nel Planner**
   - Esempio: "FAGIOLINO ARRAMPICANTE"

2. **Sistema mostra sezione "Accessori Consigliati"**
   - Mostra suggerimenti con priorità e istruzioni

3. **Utente clicca "Aggiungi Accessorio"**
   - Si apre form pre-compilato con:
     - Nome: "Trellis per FAGIOLINO ARRAMPICANTE"
     - Categoria: Support
     - Tipo: Trellis
     - Altezza: 200cm (suggerita)
     - Materiale: Wood (default)
     - Usato per: ["FAGIOLINO ARRAMPICANTE"]

4. **Utente completa/modifica form e salva**
   - Accessorio viene salvato nel database
   - Appare nel widget Dashboard
   - Disponibile nel Visual Planner

### Scenario 2: Gestione Manuale Accessori

1. **Utente clicca "Gestisci" nel widget Accessori (Dashboard)**

2. **Si apre modal "Gestione Accessori"**
   - Lista completa accessori
   - Filtri per categoria/pianta
   - Pulsante "Aggiungi Nuovo"

3. **Utente aggiunge/modifica/elimina accessori**
   - Form completo con tutti i campi
   - Possibilità di associare a più piante
   - Impostare date installazione/manutenzione

### Scenario 3: Visualizzazione nel Visual Planner

1. **Utente apre Visual Garden Planner**

2. **Attiva toggle "Mostra Accessori"**
   - Gli accessori vengono visualizzati come overlay sulla griglia
   - Posizionamento basato su coordinate (se impostate)

3. **Pianificazione visiva**
   - Verifica sovrapposizioni
   - Ottimizzazione spazio
   - Visualizzazione completa layout giardino

---

## Task Automatici

Il sistema genera automaticamente task per:

### 1. **Manutenzione Programmata**
- Annuale per reti e strutture
- Alert quando manutenzione scaduta (>365 giorni)

### 2. **Sostituzione Scaduta**
- Alert per accessori marcati `needsReplacement: true`
- Alert quando si avvicina fine durata prevista (<30 giorni)

### 3. **Installazione Suggerita**
- Quando si aggiunge una pianta che necessita accessori
- Task suggerito per installazione accessorio

---

## Integrazione con Piante

### PlantMasterSheet - Campo `supportRequirements`

```typescript
supportRequirements?: {
  needsSupport: boolean;
  supportType?: 'Stake' | 'Tutor' | 'Trellis' | 'Cage' | 'Espalier';
  minHeight?: number;        // cm
  maxHeight?: number;        // cm
  material?: 'Wood' | 'Steel' | 'Plastic' | 'Bamboo';
  installationTiming?: 'AtPlanting' | 'BeforePlanting' | 'AfterPlanting';
  notes?: string;
}
```

**Esempio nel PlantMasterSheet**:
```typescript
{
  id: 'fagiolino-arrampicante',
  commonName: 'FAGIOLINO ARRAMPICANTE',
  growthHabit: 'Climbing',
  maxHeight: 200,
  supportRequirements: {
    needsSupport: true,
    supportType: 'Trellis',
    minHeight: 180,
    maxHeight: 250,
    material: 'Steel',
    installationTiming: 'AtPlanting',
    notes: 'Installare supporto al momento della semina'
  }
}
```

---

## Riepilogo Voci Frontend

| Voce Frontend | Componente | Posizione | Funzione |
|---------------|------------|-----------|----------|
| **Widget Accessori** | `AccessoriesWidget` | Dashboard | Statistiche e accesso rapido |
| **Accessori Consigliati** | `AccessoriesSuggestionsSection` | Planner | Suggerimenti quando si seleziona pianta |
| **Gestione Accessori** | `AccessoriesManager` | Modal (da Dashboard) | Gestione completa CRUD |
| **Visualizzazione Accessori** | `VisualGardenPlanner` | Visual Planner (Pro) | Overlay sulla griglia |
| **Form Accessorio** | `AccessoryForm` | Modal (da suggerimenti o gestione) | Creazione/modifica accessorio |

---

## Best Practices

1. **Associa sempre accessori alle piante**: Usa campo `usedFor` per tracciare utilizzo
2. **Imposta date installazione**: Utile per calcolo manutenzione e sostituzione
3. **Usa suggerimenti automatici**: Il sistema suggerisce accessori appropriati
4. **Registra manutenzioni**: Aiuta a mantenere accessori in buono stato
5. **Marca sostituzioni**: Usa `needsReplacement` per accessori da sostituire

---

## Note Tecniche

- **Storage**: Accessori salvati tramite `storageProvider.getAccessories()`, `createAccessory()`, `updateAccessory()`, `deleteAccessory()`
- **Engine**: `logic/accessoriesEngine.ts` contiene logica suggerimenti e task automatici
- **Tipi**: `types/accessories.ts` contiene tutte le definizioni TypeScript
- **Feature Pro**: Visualizzazione nel Visual Planner è feature Pro






