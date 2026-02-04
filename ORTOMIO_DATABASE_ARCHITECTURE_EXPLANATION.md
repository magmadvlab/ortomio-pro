# OrtoMio Database Architecture - Spiegazione Completa 🗄️

## 🤔 LA TUA DOMANDA È GIUSTISSIMA!

Hai ragione a chiedere perché si chiama "storage" invece di "database". Il termine può confondere, ma in realtà **il `storageProvider` È il sistema che gestisce il database** - è solo un'astrazione che permette di usare diversi backend.

## 🏗️ ARCHITETTURA ORTOMIO

### 1. **Storage Provider = Database Abstraction Layer**

```typescript
interface IStorageProvider {
  // Field Rows (salvati in database)
  createFieldRow(row: FieldRow): Promise<FieldRow>
  updateFieldRow(id: string, updates: Partial<FieldRow>): Promise<FieldRow>
  getFieldRows(gardenId: string): Promise<FieldRow[]>
  
  // Irrigazioni (salvate in database)
  createWateringLog(log: WateringLog): Promise<WateringLog>
  getWateringLogs(zoneId: string): Promise<WateringLog[]>
  
  // Fertilizzazioni (salvate in database)
  createFertilizerApplicationLog(log: FertilizerLog): Promise<FertilizerLog>
  getFertilizerApplicationLogs(gardenId: string): Promise<FertilizerLog[]>
  
  // Trattamenti (salvati in database)
  createTreatment(treatment: Treatment): Promise<Treatment>
  getTreatments(gardenId: string): Promise<Treatment[]>
}
```

### 2. **Due Implementazioni del Database**

#### A. **SupabaseStorageProvider** (Database Cloud PostgreSQL)
```typescript
async createFieldRow(row: FieldRow): Promise<FieldRow> {
  const client = this.ensureClient();
  const dbRow = this.mapFieldRowToDB(row);
  
  // SALVA NEL DATABASE POSTGRESQL SU SUPABASE
  const { data, error } = await client
    .from('field_rows')  // ← TABELLA DATABASE
    .insert(dbRow)       // ← INSERT SQL
    .select()
    .single();

  if (error) throw error;
  return this.mapFieldRowFromDB(data);
}
```

#### B. **LocalStorageProvider** (Database Locale Browser)
```typescript
async createFieldRow(row: FieldRow): Promise<FieldRow> {
  // SALVA NEL LOCALSTORAGE DEL BROWSER (per sviluppo/offline)
  const fieldRows = this.getStoredData('field_rows') || [];
  const newRow = { ...row, id: generateId(), createdAt: new Date() };
  fieldRows.push(newRow);
  localStorage.setItem('field_rows', JSON.stringify(fieldRows));
  return newRow;
}
```

## 🗄️ STRUTTURA DATABASE REALE

### Tabelle PostgreSQL su Supabase:

```sql
-- FIELD ROWS (Filari)
CREATE TABLE field_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID REFERENCES gardens(id),
  zone_id UUID REFERENCES garden_zones(id),
  name TEXT NOT NULL,
  row_number INTEGER,
  length_meters NUMERIC,
  distance_from_previous_row NUMERIC,
  plant_spacing NUMERIC,
  cultivar TEXT,
  plant_count INTEGER,
  orientation TEXT,
  irrigation_line TEXT,
  planted_date DATE,
  status TEXT DEFAULT 'Active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WATERING LOGS (Irrigazioni)
CREATE TABLE watering_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID REFERENCES irrigation_zones(id),
  field_row_id UUID REFERENCES field_rows(id),
  duration_minutes INTEGER,
  water_amount_liters NUMERIC,
  method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FERTILIZER APPLICATION LOGS (Fertilizzazioni)
CREATE TABLE fertilizer_application_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID REFERENCES gardens(id),
  field_row_id UUID REFERENCES field_rows(id),
  fertilizer_name TEXT NOT NULL,
  quantity_used NUMERIC,
  unit TEXT,
  application_method TEXT,
  application_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TREATMENTS (Trattamenti)
CREATE TABLE treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID REFERENCES gardens(id),
  field_row_id UUID REFERENCES field_rows(id),
  treatment_type TEXT NOT NULL,
  product_name TEXT,
  active_ingredient TEXT,
  dosage NUMERIC,
  unit TEXT,
  application_method TEXT,
  target_pest_disease TEXT,
  application_date DATE,
  weather_conditions TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 📊 TRACCIAMENTO COMPLETO DELLE OPERAZIONI

### 1. **Irrigazioni Tracciate**
```typescript
// Ogni irrigazione viene salvata nel database
await storageProvider.createWateringLog({
  zoneId: 'zone-123',
  fieldRowId: 'row-456',
  durationMinutes: 30,
  waterAmountLiters: 150,
  method: 'drip',
  notes: 'Irrigazione mattutina'
});
```

### 2. **Fertilizzazioni Tracciate**
```typescript
// Ogni fertilizzazione viene salvata nel database
await storageProvider.createFertilizerApplicationLog({
  gardenId: 'garden-123',
  fieldRowId: 'row-456',
  fertilizerName: 'NPK 20-20-20',
  quantityUsed: 2.5,
  unit: 'kg',
  applicationMethod: 'broadcast',
  applicationDate: '2024-01-28'
});
```

### 3. **Trattamenti Tracciati**
```typescript
// Ogni trattamento viene salvato nel database
await storageProvider.createTreatment({
  gardenId: 'garden-123',
  fieldRowId: 'row-456',
  treatmentType: 'fungicide',
  productName: 'Copper Sulfate',
  activeIngredient: 'Copper',
  dosage: 1.5,
  unit: 'g/L',
  targetPestDisease: 'Downy Mildew'
});
```

## 🔄 FLUSSO DATI COMPLETO

### 1. **Salvataggio Field Row**
```
User Input → Field Row Form → storageProvider.createFieldRow() → 
PostgreSQL INSERT → field_rows table → Success Response
```

### 2. **Tracciamento Operazioni**
```
Irrigation Action → storageProvider.createWateringLog() → 
PostgreSQL INSERT → watering_logs table → Linked to field_row_id
```

### 3. **AI Predictions Integration**
```
Field Row Data + Operations History → AI Analysis → 
Predictions Dashboard → Recommendations
```

## 🎯 PERCHÉ "STORAGE PROVIDER"?

Il termine "Storage Provider" è usato perché:

1. **Astrazione**: Permette di cambiare backend (PostgreSQL, MySQL, MongoDB) senza cambiare codice
2. **Flessibilità**: Supporta sia database cloud che locale
3. **Testabilità**: Facilita i test con mock providers
4. **Scalabilità**: Permette di aggiungere nuovi provider facilmente

## ✅ CONFERMA: TUTTO È NEL DATABASE

### Field Rows: ✅ Salvati in `field_rows` table
### Irrigazioni: ✅ Salvate in `watering_logs` table  
### Fertilizzazioni: ✅ Salvate in `fertilizer_application_logs` table
### Trattamenti: ✅ Salvati in `treatments` table
### Operazioni: ✅ Salvate in `mechanical_works` table
### Piante: ✅ Salvate in `individual_plants` table

## 🔍 VERIFICA PRATICA

Per verificare che tutto sia salvato nel database:

1. **Apri Supabase Dashboard**
2. **Vai su Database → Tables**
3. **Controlla le tabelle**:
   - `field_rows` - I tuoi filari
   - `watering_logs` - Le irrigazioni
   - `fertilizer_application_logs` - Le fertilizzazioni
   - `treatments` - I trattamenti
   - `mechanical_works` - Le lavorazioni

## 🚀 CONCLUSIONE

**Il `storageProvider` NON è solo "storage" - È IL SISTEMA COMPLETO DI GESTIONE DATABASE che:**

- ✅ Salva tutti i field rows nel database PostgreSQL
- ✅ Traccia TUTTE le irrigazioni con timestamp e quantità
- ✅ Registra TUTTE le fertilizzazioni con prodotti e dosi
- ✅ Memorizza TUTTI i trattamenti con principi attivi
- ✅ Mantiene lo storico completo di TUTTE le operazioni
- ✅ Collega tutto ai field rows per analisi AI avanzate

**È un database completo e professionale, non semplice storage!** 🎯