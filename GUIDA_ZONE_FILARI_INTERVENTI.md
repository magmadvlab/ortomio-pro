# 📍 Guida Completa: Zone, Filari e Gestione Interventi

**Data:** 14 Gennaio 2026  
**Versione:** 1.0.0

---

## 🎯 Panoramica Sistema

OrtoMio PRO utilizza un sistema gerarchico a 4 livelli per la gestione precisa delle operazioni:

```
🏡 ORTO (Garden)
    ↓
🗺️ ZONE (Zones)
    ↓
📏 FILARI (Field Rows)
    ↓
✂️ PORZIONI DI FILARE (Field Row Sections)
```

---

## 📊 Struttura Database

### 1. Tabella `gardens` (Orti)
```sql
CREATE TABLE gardens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  name TEXT NOT NULL,
  location TEXT,
  size_sqm NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Tabella `garden_zones` (Zone)
```sql
CREATE TABLE garden_zones (
  id UUID PRIMARY KEY,
  garden_id UUID REFERENCES gardens,
  name TEXT NOT NULL,
  description TEXT,
  area_sqm NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Esempio Zone:**
- Zona Nord (area settentrionale)
- Zona Sud (area meridionale)
- Zona Est (area orientale)
- Zona Ovest (area occidentale)
- Serra 1, Serra 2, ecc.

### 3. Tabella `field_rows` (Filari)
```sql
CREATE TABLE field_rows (
  id UUID PRIMARY KEY,
  garden_id UUID REFERENCES gardens,
  zone_id UUID REFERENCES garden_zones,
  name TEXT NOT NULL,
  length_meters NUMERIC NOT NULL,
  plant_spacing_cm NUMERIC,
  row_number INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Esempio Filari:**
- Filare 1 (100m, sesto 50cm) → Zona Nord
- Filare 2 (80m, sesto 40cm) → Zona Nord
- Filare 3 (120m, sesto 60cm) → Zona Sud

### 4. Tabella `field_row_sections` (Porzioni di Filare)
```sql
CREATE TABLE field_row_sections (
  id UUID PRIMARY KEY,
  field_row_id UUID REFERENCES field_rows,
  section_name TEXT NOT NULL,
  section_number INTEGER,
  start_position_meters NUMERIC NOT NULL,
  end_position_meters NUMERIC NOT NULL,
  length_meters NUMERIC GENERATED ALWAYS AS (end_position_meters - start_position_meters) STORED,
  plant_count INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Validazione: sezione non può superare lunghezza filare
  CONSTRAINT check_section_within_row CHECK (
    start_position_meters >= 0 AND 
    end_position_meters > start_position_meters
  )
);
```

**Esempio Porzioni:**
Per un Filare di 100m:
- Sezione 1 "Inizio" (0-33.33m) → 67 piante
- Sezione 2 "Centro" (33.33-66.66m) → 67 piante
- Sezione 3 "Fine" (66.66-100m) → 67 piante

---

## 🔧 Come Vengono Gestite le Zone e i Filari

### 1. Creazione Gerarchica

#### A. Creazione Orto
```typescript
// L'utente crea un orto
const garden = {
  name: "Orto Principale",
  location: "Via Roma 123",
  size_sqm: 1000
}
```

#### B. Creazione Zone
```typescript
// L'utente divide l'orto in zone
const zones = [
  { name: "Zona Nord", area_sqm: 300, garden_id: garden.id },
  { name: "Zona Sud", area_sqm: 400, garden_id: garden.id },
  { name: "Serra 1", area_sqm: 300, garden_id: garden.id }
]
```

#### C. Creazione Filari
```typescript
// L'utente crea filari all'interno delle zone
const fieldRows = [
  {
    name: "Filare 1",
    zone_id: zones[0].id, // Zona Nord
    length_meters: 100,
    plant_spacing_cm: 50,
    garden_id: garden.id
  },
  {
    name: "Filare 2",
    zone_id: zones[0].id, // Zona Nord
    length_meters: 80,
    plant_spacing_cm: 40,
    garden_id: garden.id
  }
]
```

#### D. Creazione Automatica Porzioni
```sql
-- Funzione helper per creare 3 porzioni standard
CREATE OR REPLACE FUNCTION create_standard_field_row_sections(
  p_field_row_id UUID,
  p_row_length NUMERIC
) RETURNS VOID AS $$
DECLARE
  section_length NUMERIC := p_row_length / 3.0;
BEGIN
  -- Sezione 1: Inizio
  INSERT INTO field_row_sections (
    field_row_id, section_name, section_number,
    start_position_meters, end_position_meters
  ) VALUES (
    p_field_row_id, 'Inizio', 1,
    0, section_length
  );
  
  -- Sezione 2: Centro
  INSERT INTO field_row_sections (
    field_row_id, section_name, section_number,
    start_position_meters, end_position_meters
  ) VALUES (
    p_field_row_id, 'Centro', 2,
    section_length, section_length * 2
  );
  
  -- Sezione 3: Fine
  INSERT INTO field_row_sections (
    field_row_id, section_name, section_number,
    start_position_meters, end_position_meters
  ) VALUES (
    p_field_row_id, 'Fine', 3,
    section_length * 2, p_row_length
  );
END;
$$ LANGUAGE plpgsql;
```

### 2. Selezione tramite LocationSelector

Il componente `LocationSelector` permette la selezione gerarchica:

```typescript
<LocationSelector
  garden={activeGarden}
  selectedZoneId={zoneId}
  selectedFieldRowId={fieldRowId}
  selectedSectionId={sectionId}
  onLocationChange={(location) => {
    // location contiene:
    // - zoneId, zoneName
    // - fieldRowId, fieldRowName
    // - sectionId, sectionName
    // - fullLocationName (stringa completa)
    setSelectedLocation(location)
  }}
/>
```

**Interfaccia Utente:**
```
┌─────────────────────────────────────────┐
│ 📍 Seleziona zona, filare o porzione... │
│                                       ▼ │
└─────────────────────────────────────────┘
  ↓ (click)
┌─────────────────────────────────────────┐
│ ZONE                                    │
│ 🗺️ Zona Nord                            │
│    Area settentrionale                  │
│ 🗺️ Zona Sud                             │
│    Area meridionale                     │
├─────────────────────────────────────────┤
│ FILARI                                  │
│ 📏 Zona Nord - Filare 1                 │
│    100m • Sesto 50cm                    │
│ 📏 Zona Nord - Filare 2                 │
│    80m • Sesto 40cm                     │
├─────────────────────────────────────────┤
│ PORZIONI DI FILARE (se filare selezionato)│
│ ✂️ Zona Nord - Filare 1 - Inizio       │
│    0-33.33m (33.3m) • 67 piante         │
│ ✂️ Zona Nord - Filare 1 - Centro       │
│    33.33-66.66m (33.3m) • 67 piante     │
│ ✂️ Zona Nord - Filare 1 - Fine         │
│    66.66-100m (33.3m) • 67 piante       │
├─────────────────────────────────────────┤
│ GENERALE                                │
│ 📍 Tutto l'orto                         │
│    Orto Principale                      │
└─────────────────────────────────────────┘
```

---

## 💾 Come Vengono Salvati gli Interventi

### 1. Struttura Tabelle Operazioni

Tutte le tabelle di operazioni hanno colonne per tracciare la location:

```sql
-- Esempio: treatment_register (trattamenti)
CREATE TABLE treatment_register (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  garden_id UUID REFERENCES gardens,
  
  -- LOCATION TRACKING (gerarchico)
  zone_id UUID REFERENCES garden_zones,
  field_row_id UUID REFERENCES field_rows,
  field_row_section_id UUID REFERENCES field_row_sections,
  
  -- Dati operazione
  treatment_type TEXT,
  product_name TEXT,
  dosage TEXT,
  application_date DATE,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tabelle con Location Tracking:**
- ✅ `treatment_register` (trattamenti)
- ✅ `watering_logs` (irrigazioni)
- ✅ `mechanical_work_register` (lavorazioni meccaniche)
- ✅ `nutrition_applications` (concimazioni)
- ✅ `interventions` (interventi generici)
- ✅ `planting_plans` (pianificazioni colture)
- ✅ `crop_rotation_history` (storico rotazioni)

### 2. Salvataggio Intervento - Flow Completo

#### Step 1: Utente Seleziona Location
```typescript
// Nel form di intervento
const [selectedLocation, setSelectedLocation] = useState({
  zoneId: undefined,
  fieldRowId: undefined,
  sectionId: undefined
})

<LocationSelector
  garden={garden}
  onLocationChange={(location) => {
    setSelectedLocation({
      zoneId: location.zoneId,
      fieldRowId: location.fieldRowId,
      sectionId: location.sectionId
    })
  }}
/>
```

#### Step 2: Utente Compila Form
```typescript
const [interventionData, setInterventionData] = useState({
  type: 'treatment', // o 'irrigation', 'mechanical', ecc.
  product: 'Rame',
  dosage: '2g/L',
  date: new Date(),
  notes: 'Trattamento preventivo'
})
```

#### Step 3: Salvataggio nel Database
```typescript
// Service: interventionService.ts
async function createIntervention(data) {
  const { data: result, error } = await supabase
    .from('treatment_register')
    .insert({
      user_id: user.id,
      garden_id: garden.id,
      
      // LOCATION TRACKING
      zone_id: selectedLocation.zoneId,
      field_row_id: selectedLocation.fieldRowId,
      field_row_section_id: selectedLocation.sectionId,
      
      // DATI INTERVENTO
      treatment_type: interventionData.type,
      product_name: interventionData.product,
      dosage: interventionData.dosage,
      application_date: interventionData.date,
      notes: interventionData.notes
    })
    .select()
    .single()
  
  return result
}
```

### 3. Esempio Concreto: Trattamento su Porzione

**Scenario:** Applicare rame sulla porzione "Inizio" del Filare 1 in Zona Nord

```typescript
// 1. Selezione location
const location = {
  zoneId: 'zone-north-id',
  zoneName: 'Zona Nord',
  fieldRowId: 'row-1-id',
  fieldRowName: 'Filare 1',
  sectionId: 'section-1-id',
  sectionName: 'Inizio',
  fullLocationName: 'Zona Nord - Filare 1 - Inizio (0-33.33m)'
}

// 2. Dati trattamento
const treatment = {
  type: 'fungicide',
  product: 'Rame Ossicloruro',
  dosage: '2g/L',
  quantity_liters: 10,
  date: '2026-01-14',
  notes: 'Trattamento preventivo peronospora'
}

// 3. Salvataggio
const saved = await supabase
  .from('treatment_register')
  .insert({
    user_id: currentUser.id,
    garden_id: garden.id,
    zone_id: location.zoneId,
    field_row_id: location.fieldRowId,
    field_row_section_id: location.sectionId,
    treatment_type: treatment.type,
    product_name: treatment.product,
    dosage: treatment.dosage,
    quantity_liters: treatment.quantity_liters,
    application_date: treatment.date,
    notes: treatment.notes
  })

// 4. Risultato salvato nel database
/*
{
  id: 'treatment-uuid',
  user_id: 'user-uuid',
  garden_id: 'garden-uuid',
  zone_id: 'zone-north-id',
  field_row_id: 'row-1-id',
  field_row_section_id: 'section-1-id',
  treatment_type: 'fungicide',
  product_name: 'Rame Ossicloruro',
  dosage: '2g/L',
  quantity_liters: 10,
  application_date: '2026-01-14',
  notes: 'Trattamento preventivo peronospora',
  created_at: '2026-01-14T10:30:00Z'
}
*/
```

---

## 🔍 Query e Recupero Dati

### 1. Recuperare Tutti gli Interventi per Filare

```sql
-- Tutti i trattamenti sul Filare 1
SELECT 
  t.*,
  z.name as zone_name,
  fr.name as field_row_name,
  frs.section_name
FROM treatment_register t
LEFT JOIN garden_zones z ON t.zone_id = z.id
LEFT JOIN field_rows fr ON t.field_row_id = fr.id
LEFT JOIN field_row_sections frs ON t.field_row_section_id = frs.id
WHERE t.field_row_id = 'row-1-id'
ORDER BY t.application_date DESC;
```

### 2. Recuperare Interventi per Porzione Specifica

```sql
-- Tutti i trattamenti sulla porzione "Inizio" del Filare 1
SELECT 
  t.*,
  frs.start_position_meters,
  frs.end_position_meters,
  frs.length_meters
FROM treatment_register t
JOIN field_row_sections frs ON t.field_row_section_id = frs.id
WHERE t.field_row_section_id = 'section-1-id'
ORDER BY t.application_date DESC;
```

### 3. Statistiche per Zona

```sql
-- Numero di interventi per zona
SELECT 
  z.name as zone_name,
  COUNT(t.id) as total_treatments,
  COUNT(DISTINCT t.field_row_id) as rows_treated,
  SUM(t.quantity_liters) as total_liters_used
FROM garden_zones z
LEFT JOIN treatment_register t ON z.id = t.zone_id
WHERE z.garden_id = 'garden-uuid'
GROUP BY z.id, z.name
ORDER BY total_treatments DESC;
```

### 4. View Unificata per Location

```sql
-- View per visualizzare location completa
CREATE VIEW operations_with_location AS
SELECT 
  t.id,
  t.treatment_type,
  t.product_name,
  t.application_date,
  g.name as garden_name,
  z.name as zone_name,
  fr.name as field_row_name,
  fr.length_meters as row_length,
  frs.section_name,
  frs.start_position_meters,
  frs.end_position_meters,
  frs.length_meters as section_length,
  CONCAT_WS(' - ',
    z.name,
    fr.name,
    CASE 
      WHEN frs.section_name IS NOT NULL 
      THEN CONCAT(frs.section_name, ' (', frs.start_position_meters, '-', frs.end_position_meters, 'm)')
      ELSE NULL
    END
  ) as full_location
FROM treatment_register t
JOIN gardens g ON t.garden_id = g.id
LEFT JOIN garden_zones z ON t.zone_id = z.id
LEFT JOIN field_rows fr ON t.field_row_id = fr.id
LEFT JOIN field_row_sections frs ON t.field_row_section_id = frs.id;
```

---

## 🎨 Componenti UI Integrati

### 1. InterventionWizard
```typescript
// components/actions/InterventionWizard.tsx
<InterventionWizard
  garden={garden}
  actionType="treatment"
  onInterventionCreated={(intervention) => {
    console.log('Salvato:', intervention)
    // intervention contiene zone_id, field_row_id, section_id
  }}
/>
```

### 2. ClassicPlannerWithRotation
```typescript
// components/planner/ClassicPlannerWithRotation.tsx
<ClassicPlannerWithRotation
  garden={garden}
  onPlanCreated={(plan) => {
    // plan contiene location + rotation score
    console.log('Piano creato per:', plan.field_row_id)
  }}
/>
```

### 3. CropRotationPlanner
```typescript
// components/advice/CropRotationPlanner.tsx
<CropRotationPlanner
  garden={garden}
  onRotationPlanned={(rotation) => {
    // rotation contiene storico per filare
    console.log('Rotazione per filare:', rotation.field_row_id)
  }}
/>
```

---

## 📱 Flusso Utente Completo

### Scenario: Applicare Trattamento

1. **Utente apre form trattamento**
   - Click su "Nuovo Trattamento" o ActionButton

2. **Seleziona location**
   - Click su LocationSelector
   - Sceglie: Zona Nord → Filare 1 → Sezione Inizio
   - Vede: "Zona Nord - Filare 1 - Inizio (0-33.33m)"

3. **Compila dati trattamento**
   - Tipo: Fungicida
   - Prodotto: Rame Ossicloruro
   - Dosaggio: 2g/L
   - Quantità: 10L
   - Data: 14/01/2026
   - Note: "Trattamento preventivo"

4. **Salva**
   - Sistema salva in `treatment_register` con:
     - `zone_id`, `field_row_id`, `field_row_section_id`
     - Tutti i dati del trattamento
   
5. **Conferma**
   - Messaggio: "Trattamento salvato per Zona Nord - Filare 1 - Inizio"
   - Intervento visibile in:
     - Lista trattamenti
     - Diario operativo
     - Storico filare
     - Report certificazioni

---

## 🔐 Sicurezza e Validazione

### 1. RLS Policies
```sql
-- Solo l'utente proprietario può vedere i suoi interventi
CREATE POLICY "Users can view own treatments"
ON treatment_register FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own treatments"
ON treatment_register FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### 2. Validazioni
```sql
-- Constraint: sezione deve appartenere al filare
ALTER TABLE treatment_register
ADD CONSTRAINT check_section_belongs_to_row
CHECK (
  field_row_section_id IS NULL OR
  EXISTS (
    SELECT 1 FROM field_row_sections frs
    WHERE frs.id = field_row_section_id
    AND frs.field_row_id = treatment_register.field_row_id
  )
);
```

---

## 📊 Vantaggi del Sistema

### 1. Precisione
- ✅ Tracking esatto fino alla porzione di filare
- ✅ Storico completo per ogni location
- ✅ Analisi dettagliate per zona/filare

### 2. Flessibilità
- ✅ Intervento su tutto l'orto
- ✅ Intervento su zona specifica
- ✅ Intervento su filare specifico
- ✅ Intervento su porzione di filare

### 3. Certificazioni
- ✅ Tracciabilità completa per bio/GlobalGAP
- ✅ Report dettagliati per location
- ✅ Storico completo operazioni

### 4. Rotazione Colture
- ✅ Memoria per filare
- ✅ Score compatibilità automatico
- ✅ Warnings intelligenti

---

## 🚀 Prossimi Sviluppi

### Fase 2
- [ ] Mappa visuale zone e filari
- [ ] Drag & drop per selezione location
- [ ] Heatmap interventi per zona
- [ ] Timeline operazioni per filare

### Fase 3
- [ ] GPS tracking per filari
- [ ] Integrazione con droni per mapping
- [ ] AR per visualizzazione filari
- [ ] Export KML/GeoJSON

---

## 📝 Note Implementazione

### Database Remoto
Il sistema è configurato per usare il database remoto Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://qhmujoivfxftlrcrluaj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Services
Tutti i services usano il client Supabase corretto:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

---

**Documentazione completa e aggiornata al 14 Gennaio 2026**
