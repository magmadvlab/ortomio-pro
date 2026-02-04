# 🌍 Sistema Macro-Zone e Memoria del Terreno

**Data**: 4 Febbraio 2026  
**Concetto**: Il terreno ha memoria, i filari sono temporanei

---

## 🎯 Il Problema

### Scenario Reale

Hai **4 ettari di terreno**:
- 2 ettari → Orto estivo (aprile-settembre)
- 2 ettari → A riposo (rotazione)

**Cosa succede a fine stagione?**
- ❌ Elimini i filari (struttura fisica)
- ❌ Lavori la terra (aratura, fresatura)
- ❌ Ricrei nuovi filari per la prossima stagione

**Ma la terra ricorda!**
- ✅ Cosa è stato coltivato
- ✅ Dove è stato coltivato
- ✅ Come è andato il raccolto
- ✅ Quali nutrienti sono stati consumati/aggiunti

---

## 💡 La Soluzione: 3 Livelli di Memoria

```
┌─────────────────────────────────────────┐
│ LIVELLO 1: LAND ZONES (Macro-Zone)     │
│ La divisione fisica del terreno         │
│ • Zona Nord (2 ettari)                  │
│ • Zona Sud (2 ettari)                   │
│ • Coordinate GPS permanenti             │
│ • Caratteristiche terreno               │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ LIVELLO 2: SEASON CYCLES (Cicli)       │
│ I cicli stagionali temporanei           │
│ • Orto Estivo 2026 (Zona Nord)          │
│ • Orto Autunnale 2026 (Zona Sud)        │
│ • Snapshot configurazione filari        │
│ • Risultati aggregati                   │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ LIVELLO 3: SOIL MEMORY (Memoria)       │
│ La memoria permanente del terreno       │
│ • Cosa è stato coltivato                │
│ • Dove (coordinate GPS)                 │
│ • Performance e risultati               │
│ • Impatto sul terreno                   │
│ • INDIPENDENTE dai filari!              │
└─────────────────────────────────────────┘
```

---

## 🗺️ LIVELLO 1: Land Zones (Macro-Zone)

### Cos'è una Land Zone?

Una **porzione fisica del terreno** con:
- Nome identificativo (es. "Zona Nord", "Appezzamento A")
- Superficie in ettari
- Coordinate GPS (poligono che delimita l'area)
- Caratteristiche del terreno (tipo, pH, drenaggio)
- Stato attuale (attivo, riposo, maggese)

### Esempio Pratico

```javascript
{
  zone_name: "Zona Nord",
  zone_code: "ZN-01",
  area_hectares: 2.0,
  gps_boundaries: {
    type: "Polygon",
    coordinates: [
      [45.4642, 9.1900],  // Angolo NW
      [45.4642, 9.1920],  // Angolo NE
      [45.4632, 9.1920],  // Angolo SE
      [45.4632, 9.1900],  // Angolo SW
      [45.4642, 9.1900]   // Chiude il poligono
    ]
  },
  gps_center: { lat: 45.4637, lng: 9.1910 },
  soil_type: "argilloso",
  soil_ph: 6.8,
  current_status: "active", // o "resting"
  status_since: "2026-04-01",
  planned_rest_until: null // o "2026-10-01"
}
```

### Stati Possibili

- **active**: In coltivazione
- **resting**: A riposo (rotazione)
- **fallow**: Maggese (riposo lungo)
- **preparation**: In preparazione

---

## 📅 LIVELLO 2: Season Cycles (Cicli Stagionali)

### Cos'è un Season Cycle?

Un **ciclo di coltivazione** in una zona specifica:
- Nome del ciclo (es. "Orto Estivo 2026")
- Anno e stagione
- Date inizio/fine
- Snapshot della configurazione filari
- Risultati aggregati

### Esempio Pratico

```javascript
{
  cycle_name: "Orto Estivo 2026",
  cycle_year: 2026,
  cycle_season: "summer",
  land_zone_id: "zona-nord-uuid",
  start_date: "2026-04-15",
  end_date: "2026-09-30",
  status: "active", // planning, active, completed, archived
  
  // Snapshot configurazione filari
  field_rows_config: [
    {
      row_id: "filare-1-uuid",
      row_name: "Filare 1",
      length_meters: 10,
      crop: "Pomodoro San Marzano",
      planting_date: "2026-04-20"
    },
    {
      row_id: "filare-2-uuid",
      row_name: "Filare 2",
      length_meters: 10,
      crop: "Peperone",
      planting_date: "2026-04-22"
    }
  ],
  
  // Lavorazioni del terreno
  soil_preparation: {
    tilling_date: "2026-03-15",
    amendments: ["compost", "lime"],
    amendments_kg_per_mq: 5.0,
    cover_crop_previous: "vetch" // sovescio precedente
  },
  
  // Risultati aggregati
  total_yield_kg: 450.5,
  total_area_used: 0.5, // ettari
  avg_quality_rating: 4.2,
  success_rate: 85.5
}
```

---

## 🧠 LIVELLO 3: Soil Memory (Memoria del Terreno)

### Cos'è la Soil Memory?

La **memoria permanente** di cosa è stato coltivato dove:
- Collegata alla Land Zone (non al filare!)
- Persiste anche dopo eliminazione filari
- Include impatto sul terreno
- Usata dall'AI per suggerimenti futuri

### Esempio Pratico

```javascript
{
  land_zone_id: "zona-nord-uuid",
  field_row_id: "filare-1-uuid", // può essere NULL se filare eliminato
  
  // Dati coltura
  crop_name: "Pomodoro",
  crop_variety: "San Marzano",
  crop_family: "Solanacee",
  
  // Date
  planting_date: "2026-04-20",
  harvest_date: "2026-07-25",
  days_to_harvest: 96,
  season_year: 2026,
  season_type: "summer",
  
  // Performance
  yield_kg: 18.5,
  yield_per_hectare: 370.0, // calcolato
  quality_rating: 5,
  
  // IMPATTO SUL TERRENO (CHIAVE!)
  nitrogen_impact: -30, // Solanacee consumano azoto
  organic_matter_added: 2.5, // kg/mq di compost
  soil_structure_impact: 5, // Migliora struttura
  
  // Gestione
  fertilization_type: "bio",
  irrigation_method: "drip",
  treatments_count: 2,
  pesticides_used: false,
  
  // Problemi
  diseases_occurred: ["peronospora"],
  pests_occurred: ["afidi"],
  weather_issues: ["siccità_luglio"],
  
  // Contesto ambientale
  planting_context: { /* ... */ },
  
  // AI
  success_score: 85
}
```

### Impatto sul Terreno

**Nitrogen Impact** (-100 a +100):
- **Leguminose**: +50 a +80 (arricchiscono)
- **Solanacee**: -20 a -40 (consumano)
- **Crucifere**: -10 a -20 (consumano poco)
- **Cucurbitacee**: -30 a -50 (consumano molto)

**Soil Structure Impact** (-10 a +10):
- **Radici profonde**: +5 a +10 (migliorano)
- **Radici superficiali**: 0 a +2
- **Colture intensive**: -2 a -5 (peggiorano)

---

## 🔄 Workflow Completo

### 1. Inizio Stagione

```
1. Crei una Land Zone (se non esiste)
   → "Zona Nord" (2 ettari)

2. Crei un Season Cycle
   → "Orto Estivo 2026" nella Zona Nord

3. Crei i Filari
   → Filare 1, Filare 2, Filare 3...

4. Trapianti le colture
   → Sistema registra automaticamente in:
      - field_row_crop_history (storico filare)
      - soil_memory (memoria terreno)
```

### 2. Durante la Stagione

```
- Gestisci i filari normalmente
- Registri operazioni
- Raccogli i frutti
- Sistema aggiorna automaticamente:
  → Storico filare
  → Memoria terreno
  → Performance
```

### 3. Fine Stagione

```
1. Chiudi il Season Cycle
   → close_season_cycle(cycle_id)
   
2. Sistema automaticamente:
   ✅ Copia tutto lo storico in soil_memory
   ✅ Calcola risultati aggregati
   ✅ Preserva snapshot configurazione
   ✅ Marca ciclo come "completed"

3. Elimini i filari
   → Lavori la terra
   → Prepari per prossima stagione

4. La memoria rimane!
   → soil_memory conserva tutto
   → Collegato alla Land Zone
   → Indipendente dai filari
```

### 4. Nuova Stagione

```
1. Crei nuovo Season Cycle
   → "Orto Autunnale 2026" nella Zona Sud
   → "Orto Primaverile 2027" nella Zona Nord

2. L'AI suggerisce colture basandosi su:
   ✅ Memoria terreno della zona
   ✅ Ultime colture (da soil_memory)
   ✅ Bilancio azoto
   ✅ Diversità colture
   ✅ Salute del terreno

3. Crei nuovi filari
   → Seguendo suggerimenti AI

4. Il ciclo ricomincia!
```

---

## 🎯 Gestione 4 Ettari con Rotazione

### Scenario Completo

```
ANNO 2026

┌─────────────────────────────────────────┐
│ ZONA NORD (2 ettari)                    │
│ Status: ACTIVE                          │
│                                         │
│ Ciclo: Orto Estivo 2026                 │
│ • Aprile-Settembre                      │
│ • 10 filari di pomodori                 │
│ • 5 filari di peperoni                  │
│ • 5 filari di melanzane                 │
│                                         │
│ Memoria Terreno:                        │
│ • 2025: Leguminose (fagioli)            │
│ • 2024: Crucifere (cavoli)              │
│ • 2023: Cucurbitacee (zucchine)         │
│ → Rotazione OK per Solanacee! ✅        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ZONA SUD (2 ettari)                     │
│ Status: RESTING                         │
│                                         │
│ A riposo fino: Ottobre 2026             │
│ • Sovescio: veccia e segale             │
│ • Arricchimento azoto                   │
│                                         │
│ Memoria Terreno:                        │
│ • 2025: Solanacee (pomodori)            │
│ • 2024: Cucurbitacee (zucche)           │
│ • 2023: Leguminose (piselli)            │
│ → Prossimo: Crucifere! 💡              │
└─────────────────────────────────────────┘

ANNO 2027

┌─────────────────────────────────────────┐
│ ZONA NORD (2 ettari)                    │
│ Status: RESTING                         │
│ A riposo: Gennaio-Marzo 2027            │
│ → Poi: Orto Primaverile 2027            │
│ → Suggerimento AI: Leguminose           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ZONA SUD (2 ettari)                     │
│ Status: ACTIVE                          │
│ Ciclo: Orto Autunnale 2026              │
│ • Ottobre 2026 - Marzo 2027             │
│ • Crucifere (cavoli, broccoli)          │
│ → Seguendo suggerimento AI! ✅          │
└─────────────────────────────────────────┘
```

---

## 🤖 Intelligenza AI

### Calcolo Salute del Terreno

```sql
SELECT calculate_zone_soil_health('zona-nord-uuid');

-- Output:
{
  "zone_id": "zona-nord-uuid",
  "zone_name": "Zona Nord",
  "health_score": 75,
  "nitrogen_balance": -45, // Consumato azoto
  "diversity_score": 30, // 3 famiglie diverse
  "recent_crops_count": 4,
  "recommendation": "Good soil health"
}
```

### Suggerimenti Rotazione per Zona

```sql
SELECT get_zone_rotation_suggestions('zona-nord-uuid', 4);

-- Output:
[
  {
    "family": "Leguminose",
    "reason": "Ripristinano fertilità del terreno",
    "score": 95,
    "nitrogen_benefit": "high"
  },
  {
    "family": "Crucifere",
    "reason": "Buona alternativa per rotazione",
    "score": 85,
    "nitrogen_benefit": "medium"
  }
]
```

---

## 📊 Vantaggi del Sistema

### 1. Memoria Permanente
- ✅ Non perdi dati eliminando filari
- ✅ Storico completo multi-anno
- ✅ Tracciabilità totale

### 2. Rotazione Intelligente
- ✅ Suggerimenti basati su memoria zona
- ✅ Considera bilancio nutrienti
- ✅ Ottimizza salute terreno

### 3. Gestione Professionale
- ✅ Gestisci grandi appezzamenti
- ✅ Rotazione zone (2 ettari attivi, 2 a riposo)
- ✅ Pianificazione multi-anno

### 4. AI Potenziata
- ✅ Apprende da storico completo
- ✅ Correla posizione-performance
- ✅ Prevede problemi ricorrenti

---

## 🚀 Come Usarlo

### 1. Crea le Land Zones

```typescript
await landZoneService.createZone({
  garden_id: 'garden-uuid',
  zone_name: 'Zona Nord',
  zone_code: 'ZN-01',
  area_hectares: 2.0,
  gps_boundaries: { /* poligono */ },
  soil_type: 'argilloso',
  soil_ph: 6.8,
  current_status: 'active'
});
```

### 2. Crea un Season Cycle

```typescript
await seasonCycleService.createCycle({
  land_zone_id: 'zona-nord-uuid',
  cycle_name: 'Orto Estivo 2026',
  cycle_year: 2026,
  cycle_season: 'summer',
  start_date: new Date('2026-04-15'),
  soil_preparation: {
    tilling_date: '2026-03-15',
    amendments: ['compost', 'lime'],
    amendments_kg_per_mq: 5.0
  }
});
```

### 3. Crea i Filari (come sempre)

```typescript
// Normale creazione filari
// Sistema li collega automaticamente al ciclo attivo
```

### 4. Fine Stagione: Chiudi il Ciclo

```typescript
await seasonCycleService.closeCycle(cycle_id);

// Sistema automaticamente:
// ✅ Copia storico in soil_memory
// ✅ Calcola risultati aggregati
// ✅ Preserva configurazione
// ✅ Marca come completato
```

### 5. Elimina i Filari

```typescript
// Elimina pure i filari!
// La memoria rimane in soil_memory
```

### 6. Nuova Stagione: Consulta AI

```typescript
const suggestions = await landZoneService.getRotationSuggestions('zona-nord-uuid');

// AI suggerisce basandosi su:
// - Memoria terreno della zona
// - Bilancio nutrienti
// - Diversità colture
// - Salute del terreno
```

---

## 💡 Best Practices

### 1. Dividi il Terreno in Zone Logiche
- Per posizione geografica (Nord, Sud, Est, Ovest)
- Per caratteristiche terreno (Argilloso, Sabbioso)
- Per dimensione gestibile (1-2 ettari per zona)

### 2. Usa i Season Cycles
- Un ciclo per ogni stagione di coltivazione
- Chiudi sempre il ciclo a fine stagione
- Documenta le lavorazioni del terreno

### 3. Rotazione Zone
- Alterna zone attive e a riposo
- Usa sovescio nelle zone a riposo
- Pianifica con 1 anno di anticipo

### 4. Monitora Salute Terreno
- Controlla regolarmente `calculate_zone_soil_health()`
- Intervieni se score < 60
- Usa ammendanti quando necessario

### 5. Segui i Suggerimenti AI
- Basati su dati reali della tua zona
- Considera bilancio nutrienti
- Mantieni alta la diversità

---

## 🔜 Prossimi Passi

1. **Applica migrazione database**
2. **Crea le tue Land Zones**
3. **Inizia primo Season Cycle**
4. **Gestisci normalmente i filari**
5. **A fine stagione, chiudi il ciclo**
6. **Consulta memoria per prossima stagione**

---

**Il terreno ha memoria, usala! 🌍**
