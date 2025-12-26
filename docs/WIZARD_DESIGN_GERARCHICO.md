# 🎨 Design Wizard Gerarchico - Ortomio

Data: 2025-12-26

## 🎯 Obiettivo

Creare un wizard che rifletta la **struttura gerarchica reale** degli orti, distinguendo chiaramente:

1. **Categorie Padre**: Campo Aperto, Serra, Indoor
2. **Categorie Figlie**: Vasi, Cassoni, Letti, Filari (per campo/serra) + Sistemi specializzati (per indoor)
3. **Flessibilità**: 1 orto può contenere tutto (campo + serra + indoor) OPPURE essere diviso in 3 orti separati

---

## 📊 Struttura Gerarchica

```
ORTO (Garden)
│
├── 🌾 CAMPO APERTO (OpenField)
│   ├── 🪴 Vasi
│   ├── 📦 Cassoni/Contenitori
│   ├── 🛏️ Letti Rialzati
│   └── 📏 Filari (Piena Terra)
│
├── 🏠 SERRA (Greenhouse)
│   ├── 🪴 Vasi
│   ├── 📦 Cassoni/Contenitori
│   ├── 🛏️ Letti Rialzati
│   └── 📏 Filari
│
└── 💡 INDOOR (Indoor Growing)
    ├── 💧 Idroponica
    ├── 🐟 Acquaponica
    ├── 💨 Aeroponica
    └── 🌱 Grow Box/Tent

```

---

## 🧭 Flusso del Wizard

### STEP 1: Scelta Strategica Iniziale

**Domanda**: "Come vuoi organizzare il tuo orto?"

```
┌─────────────────────────────────────────────────────┐
│ 🌟 STRATEGIA UNICA (Consigliata)                    │
│ Un unico orto con tutto dentro                      │
│ ✓ Gestione centralizzata                            │
│ ✓ Calendario unificato                              │
│ ✓ Report complessivi                                │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 🔀 STRATEGIA SEPARATA                               │
│ Più orti indipendenti                               │
│ ✓ Separazione netta tra spazi                       │
│ ✓ Gestione autonoma                                 │
│ ✓ Utile per location diverse                        │
└─────────────────────────────────────────────────────┘
```

**Se STRATEGIA UNICA** → Vai a STEP 2
**Se STRATEGIA SEPARATA** → Vai a STEP 1B

---

### STEP 1B: Crea Primo Orto (Solo se Strategia Separata)

"Iniziamo creando il primo orto. Potrai aggiungerne altri dopo."

[Passa a STEP 2]

---

### STEP 2: Tipo di Spazio Coltivabile

**Domanda**: "Che tipo di spazio hai?" (Multi-select)

```
☐ 🌾 Campo Aperto
   Terra naturale, esposizione diretta agli elementi

☐ 🏠 Serra / Tunnel
   Struttura coperta, microclima controllato

☐ 💡 Indoor / Grow Room
   Coltivazione in casa, luce artificiale
```

**Nota**: Se Strategia Unica, può selezionare 1, 2 o tutti e 3.
Se Strategia Separata, ne sceglie solo 1 per questo orto.

---

### STEP 3A: Campo Aperto - Strutture (Se selezionato)

**Domanda**: "Come coltivi nel campo aperto?" (Multi-select)

```
☐ 🪴 Vasi
   Vasi singoli per piante

☐ 📦 Cassoni/Contenitori
   Cassoni di legno o plastica rialzati

☐ 🛏️ Letti Rialzati
   Letti con struttura permanente

☐ 📏 Filari in Piena Terra
   Solchi tradizionali direttamente nel terreno
```

**Per ogni selezione**:
- **Vasi**: Quanti? Diametro medio?
- **Cassoni**: Numero? Dimensioni (L×W×H)?
- **Letti**: Numero? Dimensioni (L×W×H)?
- **Filari**: Lunghezza complessiva? Numero filari? Spaziatura?

---

### STEP 3B: Serra - Strutture (Se selezionato)

**Domanda 1**: "Che tipo di serra hai?"

```
○ Archi (Arched)
○ Tunnel (Tunnel)
○ Telaio Freddo (ColdFrame)
○ Polytunnel
```

**Domanda 2**: "Dimensioni serra"
- Lunghezza (m)
- Larghezza (m)
- Altezza (m)

**Domanda 3**: "Cosa hai dentro la serra?" (Multi-select)

```
☐ 🪴 Vasi
☐ 📦 Cassoni/Contenitori
☐ 🛏️ Letti Rialzati
☐ 📏 Filari

(Stessi dettagli di Campo Aperto per ogni selezione)
```

---

### STEP 3C: Indoor - Sistemi (Se selezionato)

**Domanda**: "Che sistema indoor usi?" (Multi-select)

```
☐ 💧 Idroponica
   Radici in soluzione nutritiva

☐ 🐟 Acquaponica
   Simbiosi pesci + piante

☐ 💨 Aeroponica
   Radici nebulizzate

☐ 🌱 Grow Box/Tent con Terra
   Coltivazione tradizionale indoor
```

**Per ogni sistema**:
- **Idroponica**: Tipo sistema (NFT, DWC, Ebb&Flow)?
- **Acquaponica**: Litri vasca? Numero pesci?
- **Aeroponica**: Numero torri? Capacità?
- **Grow Box**: Dimensioni (L×W×H)? Watt lampade?

---

### STEP 4: Mono/Pluricoltivar

**Domanda**: "Cosa coltivi?"

```
○ 🎯 Monocoltivar
   Una sola pianta (es. solo pomodori)
   → Quale pianta? _____________

○ 🌈 Pluricoltivar
   Mix di piante diverse
   → Lo specificherai dopo, pianificando le coltivazioni
```

---

### STEP 5: Informazioni Base

(Come wizard attuale)
- Nome orto
- Posizione GPS (opzionale)
- Dimensione totale
- Clima/Zona

---

### STEP 6: Riepilogo & Conferma

```
✅ IL TUO ORTO

Nome: Il Mio Orto 2025

📍 Spazi Coltivabili:
  🌾 Campo Aperto
    - 10 Vasi (⌀30cm)
    - 3 Letti Rialzati (200×100×40cm)
    - 5 Filari (20m ciascuno)

  🏠 Serra Tunnel (10×4×2.5m)
    - 2 Letti Rialzati (300×80×30cm)
    - 4 Filari (8m ciascuno)

🌱 Colture: Pluricoltivar

📏 Dimensione: 150 m²

[Modifica] [Conferma e Crea]
```

---

## 🔄 Caso d'Uso: Strategia Separata

**Esempio**: Utente ha campo aperto + serra in location diverse

**Approccio**:
1. Wizard STEP 1 → "Strategia Separata"
2. Crea "Orto Campo" (solo Campo Aperto)
3. Crea "Orto Serra" (solo Serra)

**Risultato**: 2 Garden separati nel database, ognuno con gardenType distinto

---

## 📁 Dove Salvare i Dati

### Nel Database Garden:

```typescript
Garden {
  name: "Il Mio Orto 2025"

  // Strategia
  gardenType: "Mixed" | "OpenField" | "Greenhouse" | "Indoor"

  // Campo Aperto (se presente)
  structureConfig: {
    pots: [{ count: 10, diameter: 30 }]
    beds: [{ count: 3, length: 200, width: 100, height: 40 }]
    // filari → salvati in field_rows table
  }

  // Serra (se presente)
  greenhouseConfig: {
    structureType: "Tunnel"
    length: 10
    width: 4
    height: 2.5
    // strutture interne → GardenBed con bedType: 'Greenhouse'
  }

  // Indoor (se presente)
  hydroponicConfig: { ... }
  aquaponicConfig: { ... }
  aeroponicConfig: { ... }
  indoorConfig: { ... }

  // Colture
  primaryCrop: { label: "Pluricoltivar", value: "mixed" }

  // ... altri campi esistenti
}
```

---

## 🎨 Design UI del Wizard

### Estetica:

**Palette Colori per Categoria**:
- 🌾 Campo Aperto: Verde terra (`green-600`)
- 🏠 Serra: Viola/Fucsia (`purple-600`)
- 💡 Indoor: Blue tecnologico (`blue-600`)

**Layout**:
- Card grandi con icone chiare
- Multi-select con checkbox visibili
- Progress bar in alto (step 1/6, 2/6, ecc.)
- Bottoni "Indietro" e "Avanti" sempre visibili

**Accessibilità**:
- Tooltip su ogni opzione
- Esempi visivi per ogni tipo di struttura
- "Salta questo step" se non applicabile

---

## 🚀 Benefici di Questo Approccio

### ✅ Chiarezza Concettuale
- Utente capisce immediatamente la gerarchia
- Distinzione netta tra spazio (campo/serra/indoor) e struttura (vasi/letti/filari)

### ✅ Flessibilità
- Supporta utenti con orto semplice (solo vasi) fino a farm complessa (campo+serra+indoor)
- Adatta a hobbisti e professionisti

### ✅ Scalabilità
- Facile aggiungere nuovi tipi di strutture
- Ogni categoria è estensibile indipendentemente

### ✅ UX Intuitiva
- Flow naturale: prima "DOVE" (campo/serra/indoor), poi "COME" (vasi/letti/filari)
- Scelte progressive che guidano l'utente

---

## 📝 Note Implementative

### Database:
- `garden_zones` → Zone per dividere campo aperto
- `field_rows` → Filari (campo o serra)
- `planting_batches` → Produzioni scalari
- `garden_beds` → Letti/cassoni (campo, serra, indoor)

### TypeScript Types:
- Tutti i tipi già esistono in `types/fieldRow.ts`
- Estendere `Garden` interface con flag `strategy: 'unified' | 'separated'`

### Componenti:
- `GardenWizard.tsx` → Da ristrutturare
- `SpaceTypeSelector.tsx` → Nuovo (STEP 2)
- `OpenFieldConfig.tsx` → Nuovo (STEP 3A)
- `GreenhouseConfig.tsx` → Nuovo (STEP 3B)
- `IndoorConfig.tsx` → Nuovo (STEP 3C)

---

## 🎯 Prossimi Step

1. ✅ SQL caricato su Supabase
2. 📄 Documento design completato (questo file)
3. 💻 Implementare nuovo wizard
4. 🧪 Testing con casi reali
5. 📚 Documentazione utente

---

**Questo design rispetta la struttura gerarchica reale degli orti e offre massima flessibilità all'utente, mantenendo la UX semplice e intuitiva.**
