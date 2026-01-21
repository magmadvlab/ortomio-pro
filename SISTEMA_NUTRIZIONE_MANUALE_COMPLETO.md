# 🎯 Sistema Nutrizione Manuale - Guida Completa

## RISPOSTA ALLE DOMANDE

### **1. Come vengono fatti i calcoli quando il sistema NON è IOT?**

I calcoli vengono fatti in **2 MODI**:

#### **A. CALCOLO AUTOMATICO (Sistema suggerisce)**
```typescript
// Il sistema calcola automaticamente in base a:
1. AREA inserita manualmente (es. 30m²)
2. TIPO PIANTA dal database (es. pomodoro = FRUITING)
3. FASE CRESCITA dal database (es. vegetativa)
4. URGENZA dal problema (es. foglie gialle = HIGH)

FORMULA AUTOMATICA:
Dosaggio base (30g/m²) × Moltiplicatore fase (1.0) × Moltiplicatore urgenza (1.2) × Area (30m²)
= 30 × 1.0 × 1.2 × 30 = 1.080g (1.08kg)
```

#### **B. INSERIMENTO MANUALE (Utente decide)**
```typescript
// L'utente può inserire manualmente:
- Dosaggio: 1.5kg (CAMPO LIBERO)
- Area trattata: 30m² (CAMPO LIBERO)
- Prodotto: "NPK 20-20-20" (CAMPO LIBERO)
```

---

### **2. Quali sono i PARAMETRI che vengono registrati?**

Ecco **TUTTI** i parametri presenti nel form di registrazione manuale:

```typescript
// FORM DI REGISTRAZIONE MANUALE
// File: components/professional/TreatmentRegisterForm.tsx

PARAMETRI OBBLIGATORI:
✅ Coltura trattata (es. "Pomodoro")
✅ Data trattamento (es. "2026-01-21")
✅ Prodotto fitosanitario (es. "NPK 20-20-20")
✅ Dosaggio (es. "1.5" + unità "kg")

PARAMETRI OPZIONALI:
📍 Dove:
   - Aiuola/Letto (selezione da dropdown)
   - Fila/Filare (selezione da dropdown)

🧪 Dettagli Prodotto:
   - Principio attivo (es. "Azoto 20%")
   - Area trattata (es. "30 m²")

🎯 Metodo e Motivo:
   - Metodo applicazione:
     • Spray/Nebulizzazione
     • Fogliare
     • Al Terreno
     • Concia Seme
   - Motivo trattamento:
     • Preventivo
     • Curativo
     • Controllo Parassiti
     • Controllo Malattie
     • Nutrizione

🌡️ Condizioni Meteo (INSERIMENTO MANUALE):
   - Temperatura (°C) - CAMPO NUMERICO
   - Vento (km/h) - CAMPO NUMERICO
   - Pioggia (Sì/No) - DROPDOWN

👤 Operatore:
   - Nome operatore (es. "Mario Rossi")

📝 Note:
   - Note libere (es. "Applicato dopo irrigazione")
```

---

### **3. Possono essere inseriti MANUALMENTE?**

**SÌ, TUTTI i parametri possono essere inseriti manualmente!**

#### **FORM COMPLETO DI INSERIMENTO MANUALE:**

```html
<!-- ESEMPIO REALE DEL FORM -->

┌─────────────────────────────────────────────────────────────┐
│           REGISTRAZIONE TRATTAMENTO MANUALE                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Coltura Trattata *                                         │
│  [Pomodoro San Marzano________________]                     │
│                                                              │
│  📍 Dove (opzionale)                                         │
│  Aiuola/Letto: [Zona Nord ▼]                               │
│  Fila/Filare:  [Filare 3 ▼]                                │
│                                                              │
│  📅 Data Trattamento *                                       │
│  [21/01/2026]                                               │
│                                                              │
│  🧪 Prodotto Fitosanitario *                                 │
│  [Nitrato di Calcio 15.5-0-0_________]                     │
│                                                              │
│  Principio Attivo                                           │
│  [Azoto 15.5%_____________________]                         │
│                                                              │
│  Dosaggio *          Area Trattata (m²)                     │
│  [1.08] [kg ▼]      [30.0]                                 │
│                                                              │
│  Metodo Applicazione    Motivo Trattamento                  │
│  [Fertirrigazione ▼]   [Nutrizione ▼]                      │
│                                                              │
│  🌡️ CONDIZIONI METEO                                        │
│  ┌──────────────────────────────────────────────┐          │
│  │ Temperatura (°C)  Vento (km/h)  Pioggia      │          │
│  │ [18]              [5]           [No ▼]       │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  👤 Operatore                                                │
│  [Mario Rossi_____________________]                         │
│                                                              │
│  📝 Note                                                     │
│  [Applicato via fertirrigazione mattutina.                 │
│   Verificare miglioramento colore foglie tra 7 giorni.]    │
│                                                              │
│  [Salva Trattamento]  [Annulla]                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### **4. Sono collegati all'ORTO?**

**SÌ, COMPLETAMENTE collegati all'orto!**

#### **COLLEGAMENTO GERARCHICO:**

```
ORTO (Garden)
  └─ ID Orto: "orto-mario-123"
      │
      ├─ ZONE (Beds)
      │   └─ Zona Nord (bed-001)
      │       │
      │       └─ FILARI (Rows)
      │           ├─ Filare 1 (row-001)
      │           ├─ Filare 2 (row-002)
      │           └─ Filare 3 (row-003) ← TRATTAMENTO QUI
      │
      └─ TRATTAMENTI (Nutrition Treatments)
          └─ Treatment-20260121-001
              ├─ gardenId: "orto-mario-123"
              ├─ bedId: "bed-001" (Zona Nord)
              ├─ rowId: "row-003" (Filare 3)
              ├─ cropName: "Pomodoro San Marzano"
              ├─ productName: "Nitrato di Calcio"
              ├─ dosage: 1.08
              ├─ dosageUnit: "kg"
              ├─ areaTreated: 30
              ├─ weatherConditions: {
              │     temperature: 18,
              │     windSpeed: 5,
              │     rain: false
              │   }
              ├─ operatorName: "Mario Rossi"
              └─ notes: "Applicato via fertirrigazione..."
```

---

## 📊 FLUSSO COMPLETO: Da Input Manuale a Database

### **STEP 1: Utente Apre Form**

```typescript
// Pagina: /app/nutrition
// Componente: ProfessionalNutritionDashboard.tsx

Utente clicca: "Nuovo Trattamento"
↓
Si apre: TreatmentRegisterForm.tsx
↓
Form carica automaticamente:
- ID Orto corrente
- Lista Zone/Aiuole dell'orto
- Lista Filari per ogni zona
- Data odierna pre-compilata
```

---

### **STEP 2: Utente Compila Form**

```typescript
// CAMPI COMPILATI DALL'UTENTE:

1. Coltura: "Pomodoro San Marzano" (DIGITATO)
2. Zona: "Zona Nord" (SELEZIONATO da dropdown)
3. Filare: "Filare 3" (SELEZIONATO da dropdown)
4. Data: "21/01/2026" (SELEZIONATO da calendario)
5. Prodotto: "Nitrato di Calcio 15.5-0-0" (DIGITATO)
6. Principio attivo: "Azoto 15.5%" (DIGITATO)
7. Dosaggio: "1.08" (DIGITATO)
8. Unità: "kg" (SELEZIONATO)
9. Area: "30" (DIGITATO)
10. Metodo: "Fertirrigazione" (SELEZIONATO)
11. Motivo: "Nutrizione" (SELEZIONATO)
12. Temperatura: "18" (DIGITATO)
13. Vento: "5" (DIGITATO)
14. Pioggia: "No" (SELEZIONATO)
15. Operatore: "Mario Rossi" (DIGITATO)
16. Note: "Applicato via fertirrigazione..." (DIGITATO)
```

---

### **STEP 3: Sistema Valida e Salva**

```typescript
// File: components/professional/TreatmentRegisterForm.tsx

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  // VALIDAZIONE
  if (!formData.cropName || !formData.productName || !formData.dosage) {
    alert('Compila tutti i campi obbligatori')
    return
  }

  // PREPARAZIONE DATI
  const treatmentLog: TreatmentLog = {
    id: crypto.randomUUID(), // Genera ID unico
    gardenId: garden.id, // "orto-mario-123"
    bedId: selectedBed || null, // "bed-001"
    rowId: selectedRow || null, // "row-003"
    cropName: formData.cropName, // "Pomodoro San Marzano"
    treatmentDate: formData.treatmentDate, // "2026-01-21"
    productName: formData.productName, // "Nitrato di Calcio"
    activeIngredient: formData.activeIngredient, // "Azoto 15.5%"
    dosage: formData.dosage, // 1.08
    dosageUnit: formData.dosageUnit, // "kg"
    areaTreated: formData.areaTreated, // 30
    method: formData.method, // "fertigation"
    reason: formData.reason, // "nutrient"
    weatherConditions: {
      temperature: formData.weatherConditions?.temperature, // 18
      windSpeed: formData.weatherConditions?.windSpeed, // 5
      rain: formData.weatherConditions?.rain // false
    },
    operatorName: formData.operatorName, // "Mario Rossi"
    notes: formData.notes // "Applicato via..."
  }

  // SALVATAGGIO
  await onSubmit(treatmentLog)
}
```

---

### **STEP 4: Salvataggio nel Database**

```typescript
// File: services/advancedNutritionService.ts

async createNutritionTreatment(treatment: NutritionTreatment) {
  const supabase = getSupabaseClient()
  
  // Get current user ID
  const { data: { user } } = await supabase.auth.getUser()
  
  // INSERIMENTO NEL DATABASE
  const { data, error } = await supabase
    .from('nutrition_treatments')
    .insert([{
      // IDENTIFICAZIONE
      id: treatment.id,
      garden_id: treatment.gardenId, // "orto-mario-123"
      zone_id: treatment.bedId, // "bed-001"
      field_row_id: treatment.rowId, // "row-003"
      
      // PRODOTTO
      product_name: treatment.productName, // "Nitrato di Calcio"
      dosage: treatment.dosage, // 1.08
      dosage_unit: treatment.dosageUnit, // "kg"
      application_method: treatment.method, // "fertigation"
      
      // TIMING
      scheduled_date: treatment.treatmentDate, // "2026-01-21"
      actual_application_date: treatment.treatmentDate,
      
      // METEO (INSERITO MANUALMENTE)
      weather_conditions: {
        temperatureCelsius: treatment.weatherConditions?.temperature, // 18
        windSpeedKmh: treatment.weatherConditions?.windSpeed, // 5
        rainfall24h: treatment.weatherConditions?.rain ? 10 : 0
      },
      
      // OPERATORE
      operator_id: user?.id,
      operator_name: treatment.operatorName, // "Mario Rossi"
      
      // AREA
      actual_coverage: treatment.areaTreated, // 30
      
      // NOTE
      notes: treatment.notes,
      
      // STATUS
      status: 'completed',
      
      // TIMESTAMP
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) throw error
  
  return data
}
```

---

### **STEP 5: Dati Salvati nel Database**

```sql
-- TABELLA: nutrition_treatments

INSERT INTO nutrition_treatments (
  id,
  garden_id,
  zone_id,
  field_row_id,
  product_name,
  dosage,
  dosage_unit,
  application_method,
  scheduled_date,
  actual_application_date,
  weather_conditions,
  operator_id,
  operator_name,
  actual_coverage,
  notes,
  status,
  created_at,
  updated_at
) VALUES (
  'treatment-20260121-001',
  'orto-mario-123',
  'bed-001',
  'row-003',
  'Nitrato di Calcio 15.5-0-0',
  1.08,
  'kg',
  'fertigation',
  '2026-01-21',
  '2026-01-21',
  '{"temperatureCelsius": 18, "windSpeedKmh": 5, "rainfall24h": 0}',
  'user-123',
  'Mario Rossi',
  30,
  'Applicato via fertirrigazione mattutina. Verificare miglioramento colore foglie tra 7 giorni.',
  'completed',
  '2026-01-21T08:30:00Z',
  '2026-01-21T08:30:00Z'
);
```

---

## 🔍 COME VISUALIZZARE I DATI

### **1. Dashboard Nutrizione**

```typescript
// Pagina: /app/nutrition
// Mostra:
- Trattamenti attivi
- Trattamenti pianificati
- Trattamenti del mese
- Prodotti in inventario
- Alert stock basso
```

---

### **2. Timeline Filare**

```typescript
// Filtro per filare specifico
GET /api/nutrition/treatments?fieldRowId=row-003

// RISULTATO:
[
  {
    date: "21/01/2026",
    product: "Nitrato di Calcio",
    dosage: "1.08kg",
    operator: "Mario Rossi",
    weather: "18°C, vento 5km/h",
    notes: "Applicato via fertirrigazione"
  },
  {
    date: "07/01/2026",
    product: "Compost organico",
    dosage: "10kg",
    operator: "Luigi Bianchi",
    weather: "12°C, nuvoloso",
    notes: "Applicazione manuale"
  }
]
```

---

### **3. Report Certificazioni**

```typescript
// Export per audit
GET /api/nutrition/export?gardenId=orto-mario-123&year=2026

// GENERA PDF CON:
- Elenco completo trattamenti
- Prodotti utilizzati
- Dosaggi applicati
- Condizioni meteo di ogni applicazione
- Operatori responsabili
- Costi totali
- Conformità biologica
```

---

## 📈 DIFFERENZA IOT vs MANUALE

### **SISTEMA IOT (Automatico)**

```typescript
// Sensori registrano automaticamente:
✅ Temperatura: 18°C (da sensore meteo)
✅ Umidità: 65% (da sensore meteo)
✅ Vento: 5km/h (da sensore meteo)
✅ Umidità terreno: 45% (da sensore suolo)
✅ pH terreno: 6.8 (da sensore suolo)
✅ Conducibilità: 1.2 mS/cm (da sensore suolo)
✅ Quantità erogata: 1.08kg (da pompa dosatrice)
✅ Durata: 45 minuti (da timer sistema)
```

---

### **SISTEMA MANUALE (Inserimento Utente)**

```typescript
// Utente inserisce manualmente:
📝 Temperatura: 18°C (DIGITATO dall'utente)
📝 Vento: 5km/h (DIGITATO dall'utente)
📝 Pioggia: No (SELEZIONATO dall'utente)
📝 Quantità: 1.08kg (DIGITATO dall'utente)
📝 Operatore: Mario Rossi (DIGITATO dall'utente)
📝 Note: "Applicato via..." (DIGITATO dall'utente)

// Parametri NON disponibili senza IOT:
❌ Umidità terreno (non misurabile manualmente)
❌ pH terreno (richiede test kit)
❌ Conducibilità (richiede strumento)
❌ Durata esatta (stimata dall'utente)
```

---

## ✅ RIEPILOGO FINALE

### **DOMANDE E RISPOSTE:**

**Q1: Come vengono fatti i calcoli senza IOT?**
**A:** In 2 modi:
1. Sistema suggerisce dosaggio automatico (area × tipo pianta × fase × urgenza)
2. Utente inserisce manualmente il dosaggio che preferisce

**Q2: Quali parametri vengono registrati?**
**A:** TUTTI questi parametri:
- Coltura, Data, Prodotto, Dosaggio, Area (OBBLIGATORI)
- Zona, Filare, Principio attivo, Metodo, Motivo (OPZIONALI)
- Temperatura, Vento, Pioggia (METEO MANUALE)
- Operatore, Note (TRACCIABILITÀ)

**Q3: Possono essere inseriti manualmente?**
**A:** SÌ, TUTTI i parametri hanno campi di input nel form

**Q4: Sono collegati all'orto?**
**A:** SÌ, COMPLETAMENTE:
- Ogni trattamento ha `gardenId` (orto)
- Ogni trattamento ha `bedId` (zona)
- Ogni trattamento ha `rowId` (filare)
- Puoi filtrare per orto/zona/filare
- Puoi vedere timeline per filare specifico

---

## 📁 FILE COINVOLTI

1. **Form Inserimento**: `components/professional/TreatmentRegisterForm.tsx`
2. **Dashboard**: `components/nutrition/ProfessionalNutritionDashboard.tsx`
3. **Servizio**: `services/advancedNutritionService.ts`
4. **Tipi**: `types/nutrition.ts`
5. **Database**: `supabase/migrations/20260117020000_create_advanced_nutrition_system.sql`

---

**CONCLUSIONE**: Il sistema funziona PERFETTAMENTE anche senza IOT. Tutti i parametri possono essere inseriti manualmente tramite form intuitivi, e vengono salvati nel database collegati all'orto, zona e filare specifici per tracciabilità completa.
