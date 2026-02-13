# Analisi Tipi di Orto - Implementazione vs Disponibilità UI

## Data Analisi
13 Febbraio 2026

## Sommario Esecutivo

L'applicazione ha un'architettura completa per gestire diversi tipi di orto, ma **non tutti i tipi sono accessibili tramite l'interfaccia utente**. Esistono significative discrepanze tra:
- Tipi definiti nel database e nei types
- Tipi implementati nel codice
- Tipi effettivamente disponibili nei menu/wizard

---

## 1. TIPI DI ORTO DEFINITI NEL DATABASE

### Schema Database (gardens_garden_type_check)
```sql
CHECK ((garden_type = ANY (ARRAY[
  'OpenField'::text,
  'Greenhouse'::text,
  'Tunnel'::text,
  'RaisedBed'::text,
  'Indoor'::text,
  'Hydroponic'::text,
  'Aquaponic'::text,
  'Aeroponic'::text,
  'NFT'::text,
  'DWC'::text,
  'EbbFlow'::text,
  'Drip'::text,
  'Wick'::text,
  'Kratky'::text
])))
```

**Totale: 14 tipi di orto supportati nel database**

---

## 2. TIPI DEFINITI IN TYPESCRIPT (types.ts)

```typescript
export type GardenType = 
  | 'OpenField'           // Campo aperto tradizionale
  | 'Greenhouse'          // Serra tradizionale
  | 'Tunnel'              // Tunnel/polytunnel
  | 'RaisedBed'           // Aiuola/cassone rialzato
  | 'Pot'                 // Vasi/Contenitori
  | 'Container'           // Contenitori generici
  | 'Indoor'              // Indoor generico
  | 'Hydroponic'          // Idroponica generica
  | 'Aquaponic'           // Acquaponica
  | 'Aeroponic'           // Aeroponica
  | 'NFT'                 // Nutrient Film Technique
  | 'DWC'                 // Deep Water Culture
  | 'EbbFlow'             // Ebb and Flow / Flood and Drain
  | 'Drip'                // Drip System
  | 'Wick'                // Wick System
  | 'Kratky'              // Kratky Method (passive)
  | 'Orchard'             // Frutteto
  | 'OliveGrove'          // Oliveto
  | 'Vineyard';           // Vigneto
```

**Totale: 19 tipi definiti in TypeScript**

**Nota**: Ci sono 5 tipi in TypeScript non presenti nel database:
- `Pot`
- `Container`
- `Orchard`
- `OliveGrove`
- `Vineyard`

---

## 3. TIPI DISPONIBILI NEL WIZARD UI (GardenTypeWizard.tsx)

### Wizard Principale - 4 Opzioni Visibili

```typescript
export type SpaceType = 'vegetable' | 'orchard' | 'oliveGrove' | 'vineyard';
```

Il wizard mostra solo 4 categorie macro:

1. **Orto** (vegetable)
   - Icona: Sprout
   - Descrizione: "Ortaggi, verdure, erbe"
   - Usa: `GardenOnboarding` direttamente

2. **Frutteto** (orchard)
   - Icona: TreePine
   - Descrizione: "Alberi da frutto"
   - Usa: `GardenOnboarding` + `CreateOrchardWizard`

3. **Oliveto** (oliveGrove)
   - Icona: CircleDot
   - Descrizione: "Olivi per olio o mensa"
   - Usa: `GardenOnboarding` + `CreateOrchardWizard`

4. **Vigneto** (vineyard)
   - Icona: Grape
   - Descrizione: "Viti da vino o tavola"
   - Usa: `GardenOnboarding` + `CreateOrchardWizard`

### Wizard Onboarding - Tipi Selezionabili

Nel componente `GardenOnboarding.tsx` (Step 2), l'utente può selezionare il tipo di orto, ma **non c'è evidenza di un menu dropdown o selezione visibile** nel codice mostrato.

---

## 4. SISTEMI IDROPONICI - IMPLEMENTAZIONE COMPLETA

### Componenti Implementati

✅ **HydroponicConfigForm** - Configurazione sistemi idroponici
✅ **AquaponicConfigForm** - Configurazione sistemi acquaponici  
✅ **AeroponicConfigForm** - Configurazione sistemi aeroponici
✅ **ReadingForm** - Form per letture parametri (pH, EC, ecc.)

### Tipi di Sistema Idroponico Supportati

```typescript
// Da types/indoorGrowing.ts
export type HydroponicSystemType = 
  | 'NFT'           // Nutrient Film Technique
  | 'DWC'           // Deep Water Culture
  | 'EbbFlow'       // Ebb and Flow
  | 'Drip'          // Drip System
  | 'Wick'          // Wick System
  | 'Kratky';       // Kratky Method

export type AquaponicSystemType = 
  | 'MediaBed'
  | 'NFT'
  | 'DWC'
  | 'Hybrid';

export type AeroponicSystemType = 
  | 'LowPressure'
  | 'HighPressure'
  | 'Ultrasonic';
```

### Database - Tabelle Dedicate

✅ `hydroponic_readings` - Letture parametri idroponici
✅ `aquaponic_readings` - Letture parametri acquaponici
✅ Campi JSONB in `garden_tasks`:
  - `hydroponic_data`
  - `aquaponic_data`
  - `aeroponic_data`

### Configurazioni in Garden

```typescript
interface Garden {
  // ...
  hydroponicConfig?: HydroponicSystemConfig;
  aquaponicConfig?: AquaponicSystemConfig;
  aeroponicConfig?: AeroponicSystemConfig;
  // ...
}
```

---

## 5. FRAGOLE - IMPLEMENTAZIONE COMPLETA

### Master Sheets Disponibili

File: `data/strawberryMasterSheets.ts`

✅ **11 varietà di fragole implementate**:

1. FRAGOLA DI BOSCO (fragola-bosco)
2. FRAGOLA ELSANTA (fragola-elsanta)
3. FRAGOLA ALBION (fragola-albion)
4. FRAGOLA SEASCAPE (fragola-seascape)
5. **FRAGOLA CANDONGA** (fragola-candonga) - Basilicata, esportazione
6. **FRAGOLA MATERA** (fragola-matera) - Basilicata, esportazione
7. FRAGOLA SABRINA (fragola-sabrina)
8. FRAGOLA ALBA (fragola-alba)
9. FRAGOLA CLERY (fragola-clery)
10. FRAGOLA ELIANY (fragola-eliany)
11. FRAGOLA FLORENCE (fragola-florence)
12. FRAGOLA GARIGUETTE (fragola-gariguette)
13. FRAGOLA MALGA (fragola-malga)
14. FRAGOLA ROXANA (fragola-roxana)

### Dati Specializzati per Fragole

```typescript
interface StrawberryCrop {
  id: string;
  commonName: string;
  cropType: 'Strawberry';
  varietyType: 'June-bearing' | 'Day-neutral' | 'Ever-bearing';
  plantingSystem: 'Matted Row' | 'Spaced Row' | 'Hill System';
  runnerManagement: {
    removeRunners: boolean;
    keepForPropagation: boolean;
  };
  mulching: {
    material: 'Straw' | 'Plastic' | 'Organic';
    thickness: number;
  };
  harvestWindow: {
    startMonth: number;
    endMonth: number;
  };
  renovationRequired: boolean;
  renovationMonth?: number;
  // ... altri campi dettagliati
}
```

### Database - Supporto Fragole

✅ Campi JSONB in `garden_tasks`:
  - `strawberry_data`

✅ Campi JSONB in `harvest_logs`:
  - `strawberry_harvest`

✅ Operazioni meccaniche specifiche:
  - `RunnerManagement`
  - `StrawberryMulching`
  - `StrawberryCleaning`

### Varietà Basilicata (Pro Feature)

Le varietà **CANDONGA** e **MATERA** sono implementate con:
- Dati specifici per esportazione
- Gestione qualità commerciale
- Parametri conservabilità
- Istruzioni raccolta professionale

---

## 6. PROBLEMI IDENTIFICATI

### 🔴 PROBLEMA 1: Idroponica Non Accessibile da UI

**Stato**: ❌ NON DISPONIBILE NEI MENU

- ✅ Implementazione completa nel codice
- ✅ Database configurato
- ✅ Componenti form esistenti
- ❌ **NON presente in GardenTypeWizard**
- ❌ **NON presente in GardenOnboarding come opzione selezionabile**

**Impatto**: Gli utenti non possono creare orti idroponici/acquaponici/aeroponici tramite UI.

### 🔴 PROBLEMA 2: Fragole Non Visibili nei Menu

**Stato**: ❌ NON DISPONIBILE NEI MENU PRINCIPALI

- ✅ 14 varietà completamente implementate
- ✅ Master sheets dettagliati
- ✅ Database configurato
- ❌ **NON presente in menu di selezione piante**
- ❌ **NON presente in wizard creazione task**
- ⚠️ Probabilmente accessibile solo tramite ricerca o AI

**Impatto**: Le fragole sono "nascoste" - gli utenti potrebbero non sapere che sono disponibili.

### 🟡 PROBLEMA 3: Discrepanza Database vs TypeScript

**Tipi mancanti nel database**:
- `Pot` (presente in TS, non in DB)
- `Container` (presente in TS, non in DB)
- `Orchard` (presente in TS, non in DB)
- `OliveGrove` (presente in TS, non in DB)
- `Vineyard` (presente in TS, non in DB)

**Impatto**: Possibili errori di validazione quando si salvano questi tipi.

### 🟡 PROBLEMA 4: Tunnel e RaisedBed Non Accessibili

**Stato**: ⚠️ DEFINITI MA NON SELEZIONABILI

- ✅ Definiti in database
- ✅ Definiti in TypeScript
- ❌ Non presenti in GardenTypeWizard
- ❌ Non chiaramente selezionabili in GardenOnboarding

---

## 7. RACCOMANDAZIONI

### Priorità ALTA

1. **Aggiungere Idroponica al Wizard**
   - Creare opzione "Coltivazione Idroponica" in GardenTypeWizard
   - Mostrare sotto-opzioni: NFT, DWC, Ebb&Flow, Drip, Wick, Kratky
   - Integrare form di configurazione esistenti

2. **Rendere Fragole Visibili**
   - Aggiungere categoria "Fragole" nei menu di selezione piante
   - Creare sezione dedicata nel planner
   - Evidenziare varietà Basilicata come Pro Feature

3. **Allineare Database e TypeScript**
   - Aggiungere tipi mancanti al database:
     ```sql
     ALTER TABLE gardens DROP CONSTRAINT gardens_garden_type_check;
     ALTER TABLE gardens ADD CONSTRAINT gardens_garden_type_check 
     CHECK ((garden_type = ANY (ARRAY[
       'OpenField', 'Greenhouse', 'Tunnel', 'RaisedBed', 
       'Pot', 'Container', 'Indoor',
       'Hydroponic', 'Aquaponic', 'Aeroponic',
       'NFT', 'DWC', 'EbbFlow', 'Drip', 'Wick', 'Kratky',
       'Orchard', 'OliveGrove', 'Vineyard'
     ])));
     ```

### Priorità MEDIA

4. **Aggiungere Tunnel e RaisedBed al Wizard**
   - Opzione "Tunnel/Serra Fredda"
   - Opzione "Aiuole Rialzate"

5. **Documentare Tipi Disponibili**
   - Creare guida utente per ogni tipo di orto
   - Spiegare quando usare ciascun tipo

### Priorità BASSA

6. **Ottimizzare Wizard**
   - Raggruppare tipi simili
   - Aggiungere wizard guidato per principianti

---

## 8. CONCLUSIONI

### Implementazione Tecnica: ✅ ECCELLENTE

L'applicazione ha un'architettura solida e completa per gestire:
- Tutti i tipi di orto tradizionali
- Sistemi idroponici avanzati (6 tipi)
- Sistemi acquaponici (4 tipi)
- Sistemi aeroponici (3 tipi)
- Coltivazioni specializzate (fragole, frutta, olive, viti)

### Accessibilità UI: ⚠️ LIMITATA

Solo 4 categorie macro sono accessibili tramite wizard:
- Orto tradizionale
- Frutteto
- Oliveto
- Vigneto

**Mancano completamente**:
- Idroponica (tutti i 6 tipi)
- Acquaponica (tutti i 4 tipi)
- Aeroponica (tutti i 3 tipi)
- Tunnel
- Aiuole rialzate
- Indoor generico

### Gap Principale

C'è un **enorme gap tra capacità tecniche e accessibilità utente**. L'applicazione può fare molto di più di quanto gli utenti possano scoprire attraverso l'interfaccia.

### Azione Immediata Consigliata

Creare un wizard "Tipo di Coltivazione" con 3 categorie principali:
1. **Tradizionale** (campo aperto, serra, tunnel, aiuole)
2. **Idroponica/Acquaponica/Aeroponica** (tutti i sottotipi)
3. **Colture Specializzate** (frutteto, oliveto, vigneto, fragole)

Questo renderebbe immediatamente accessibili tutte le funzionalità già implementate.
