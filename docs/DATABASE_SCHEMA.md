# Database Schema - Documentazione Completa

## Panoramica

Il database OrtoMio utilizza PostgreSQL su Supabase con:
- **Row Level Security (RLS)**: Sicurezza a livello di riga
- **Triggers**: Automatizzazione operazioni
- **Funzioni**: Logica business nel database
- **Indici**: Ottimizzazione query

## Tabelle Principali

### Gardens (Orti)

Tabella centrale per ogni orto dell'utente.

**Campi chiave**:
- `id`: UUID primario
- `user_id`: Riferimento utente
- `name`: Nome orto
- `coordinates`: Latitudine/longitudine (JSONB)
- `size_sq_meters`: Dimensione in m²
- `soil_type`: Tipo terreno
- `soil_ph`: pH suolo
- `has_zones`: Flag precision agriculture
- `precision_mode_enabled`: Abilita modalità precisione

**Indici**:
- `idx_gardens_user_id`: Per query per utente
- `idx_gardens_created_at`: Per ordinamento temporale

### Garden Zones (Zone Precision Agriculture)

Zonazione orto per agricoltura di precisione.

**Campi chiave**:
- `id`: UUID primario
- `garden_id`: Riferimento orto
- `name`: Nome zona
- `coordinates`: Poligono zona (JSONB array punti)
- `soil_type`: Tipo terreno zona
- `soil_ph`: pH zona
- `water_capacity`: Capacità idrica
- `sun_exposure`: Esposizione solare
- `area_sq_meters`: Area zona calcolata

**Relazioni**:
- `garden_id` → `gardens.id`

**Indici**:
- `idx_garden_zones_garden_id`: Per query zone per orto
- `idx_garden_zones_order`: Per ordinamento visualizzazione

### Soil Analysis (Analisi Suolo)

Analisi suolo avanzate per zona o giardino.

**Campi chiave**:
- `id`: UUID primario
- `zone_id`: Riferimento zona (opzionale)
- `garden_id`: Riferimento orto
- `analysis_date`: Data analisi
- `analysis_type`: Tipo (basic/complete/professional)
- `nitrogen_n`, `phosphorus_p`, `potassium_k`: Macro-nutrienti
- `iron_fe`, `manganese_mn`, `zinc_zn`, `copper_cu`, `boron_b`: Micro-nutrienti
- `ph`: pH suolo
- `organic_matter_percent`: Materia organica %
- `cec`: Capacità Scambio Cationico
- `recommendations`: Suggerimenti fertilizzazione (JSONB)

**Relazioni**:
- `zone_id` → `garden_zones.id`
- `garden_id` → `gardens.id`

**Indici**:
- `idx_soil_analysis_zone_id`: Per query per zona
- `idx_soil_analysis_garden_id`: Per query per orto
- `idx_soil_analysis_date`: Per ordinamento temporale

### Vegetation Indices (Indicatori Vegetativi)

Indici calcolati da foto (NDVI, EVI, LAI, Chlorophyll Index).

**Campi chiave**:
- `id`: UUID primario
- `photo_log_id`: Riferimento foto
- `task_id`: Riferimento task pianta
- `zone_id`: Riferimento zona (opzionale)
- `ndvi`: Normalized Difference Vegetation Index
- `evi`: Enhanced Vegetation Index
- `lai`: Leaf Area Index
- `chlorophyll_index`: Indice clorofilla
- `r_value`, `g_value`, `b_value`: Valori RGB utilizzati
- `calculation_method`: Metodo calcolo (rgb_approximation/satellite/drone)
- `confidence`: Confidenza calcolo (0-1)

**Relazioni**:
- `photo_log_id` → `photo_logs.id`
- `task_id` → `garden_tasks.id`
- `zone_id` → `garden_zones.id`

**Indici**:
- `idx_vegetation_indices_photo_log`: Per query per foto
- `idx_vegetation_indices_task`: Per query per task
- `idx_vegetation_indices_date`: Per ordinamento temporale

### Yield Predictions (Previsioni Resa)

Previsioni resa basate su modelli predittivi.

**Campi chiave**:
- `id`: UUID primario
- `task_id`: Riferimento task
- `zone_id`: Riferimento zona (opzionale)
- `garden_id`: Riferimento orto
- `predicted_yield_kg`: Resa prevista (kg)
- `predicted_yield_per_sqm`: Resa per m²
- `confidence_level`: Confidenza previsione (0-1)
- `predicted_harvest_date`: Data raccolto prevista
- `factors`: Fattori utilizzati (JSONB)
- `actual_yield_kg`: Resa reale (popolato dopo raccolto)
- `accuracy_percent`: Accuratezza previsione

**Relazioni**:
- `task_id` → `garden_tasks.id`
- `zone_id` → `garden_zones.id`
- `garden_id` → `gardens.id`

**Indici**:
- `idx_yield_predictions_task`: Per query per task
- `idx_yield_predictions_date`: Per ordinamento temporale

### Sensor Readings (Letture Sensori)

Storico letture sensori simulati o reali.

**Campi chiave**:
- `id`: UUID primario
- `garden_id`: Riferimento orto
- `zone_id`: Riferimento zona (opzionale)
- `sensor_type`: Tipo sensore (moisture/temperature/ec/ph/etc.)
- `value`: Valore lettura
- `unit`: Unità misura
- `reading_date`: Timestamp lettura
- `is_simulated`: Flag simulazione

**Relazioni**:
- `garden_id` → `gardens.id`
- `zone_id` → `garden_zones.id`

**Indici**:
- `idx_sensor_readings_garden`: Per query per orto
- `idx_sensor_readings_type_date`: Per query per tipo e data
- `idx_sensor_readings_date`: Per ordinamento temporale

### Garden Tasks

Task operativi per piante.

**Campi chiave**:
- `id`: UUID primario
- `garden_id`: Riferimento orto
- `plant_name`: Nome pianta
- `task_type`: Tipo operazione (Sowing, Transplant, Fertilize, Prune, Harvest, Treatment, etc.)
- `date`: Data pianificata/suggerita (DATE)
- `completed`: Flag completamento (BOOLEAN)
- `completed_at`: Timestamp completamento (TIMESTAMP WITH TIME ZONE)
- `actual_completed_date`: Data effettiva completamento (TIMESTAMP WITH TIME ZONE)
- `suggested_date`: Data suggerita dall'orchestrator (DATE)
- `is_suggested`: Flag task suggerito automaticamente (BOOLEAN)
- `suggested_by`: ID sistema che ha suggerito il task (TEXT)

**Tracking Completamento**:
- `date`: Data originale del task (pianificata o suggerita)
- `suggested_date`: Se `is_suggested = true`, contiene la data suggerita dall'orchestrator
- `actual_completed_date`: Data/ora effettiva in cui il task è stato completato (popolata quando `completed = true`)
- `completed_at`: Timestamp di quando il campo `completed` è stato impostato a `true`

**Differenza tra `actual_completed_date` e `completed_at`**:
- `actual_completed_date`: Usato per tracciare quando il lavoro è stato effettivamente fatto (può essere diverso da `date` se completato in anticipo o ritardo)
- `completed_at`: Timestamp tecnico di quando il record è stato aggiornato nel database

**Modifiche per Precision Agriculture**:
- `zone_id`: Riferimento zona (opzionale)

**Relazioni**:
- `garden_id` → `gardens.id`
- `zone_id` → `garden_zones.id`
- `bed_id` → `garden_beds.id`

**Indici**:
- `idx_garden_tasks_garden_id`: Per query per orto
- `idx_garden_tasks_date`: Per query per data pianificata
- `idx_garden_tasks_completed`: Per filtrare task completati/non completati
- `idx_garden_tasks_suggested`: Per query task suggeriti (parziale)
- `idx_garden_tasks_suggested_date`: Per query per data suggerita (parziale)
- `idx_garden_tasks_actual_completed_date`: Per query per data completamento effettiva (parziale)

### Photo Logs

Log foto piante.

**Modifiche per Precision Agriculture**:
- `vegetation_indices_id`: Riferimento indici vegetativi calcolati

**Relazioni**:
- `vegetation_indices_id` → `vegetation_indices.id`

## Relazioni Principali

```
gardens
  ├── garden_zones (1:N)
  │     ├── soil_analysis (1:N)
  │     └── sensor_readings (1:N)
  ├── garden_tasks (1:N)
  │     ├── photo_logs (1:N)
  │     │     └── vegetation_indices (1:1)
  │     └── yield_predictions (1:N)
  └── harvest_logs (1:N)
```

## Row Level Security (RLS)

Tutte le tabelle hanno RLS abilitato con policy:
- **SELECT**: Utenti possono vedere solo i propri dati
- **INSERT**: Utenti possono inserire solo nei propri orti
- **UPDATE**: Utenti possono aggiornare solo i propri dati
- **DELETE**: Utenti possono eliminare solo i propri dati

## Triggers

### update_updated_at_column()

Funzione trigger per aggiornare automaticamente `updated_at` su UPDATE.

Applicata a:
- `garden_zones`
- `soil_analysis`
- `yield_predictions`
- `irrigation_zones`

## Funzioni Database

### calculate_zone_area()

Calcola area approssimativa di una zona da coordinate poligono.

**Parametri**:
- `coordinates`: JSONB array di punti
- `garden_size_sq_meters`: Dimensione orto

**Ritorna**: Area in m²

## Indici Performance

### Query Comuni Ottimizzate

1. **Zone per orto**: `idx_garden_zones_garden_id`
2. **Analisi suolo recenti**: `idx_soil_analysis_date DESC`
3. **Indici vegetativi per task**: `idx_vegetation_indices_task`
4. **Letture sensori per tipo**: `idx_sensor_readings_type_date`

## Export/Import

### Export Schema Completo

Usa `database/export_schema.sql` per:
- Export completo schema
- Include tabelle, indici, trigger, funzioni
- Formato compatibile deployment online

### Import Migrazioni

Vedi `database/migration_guide.md` per:
- Ordine applicazione migrazioni
- Procedure rollback
- Backup recommendations

## Note Tecniche

### JSONB Fields

Molti campi usano JSONB per flessibilità:
- `coordinates`: Array punti poligono
- `recommendations`: Suggerimenti strutturati
- `factors`: Fattori previsioni

### UUID vs Serial

Tutti gli ID usano UUID per:
- Sicurezza (non prevedibili)
- Distribuzione (no collisioni)
- Privacy (non sequenziali)

### Timestamps

Tutti i timestamp usano `TIMESTAMPTZ` per:
- Timezone awareness
- Confronti temporali corretti
- Supporto multi-timezone

## Manutenzione

### Backup

Raccomandato backup giornaliero di:
- Tutte le tabelle precision agriculture
- Storico analisi suolo
- Storico indici vegetativi

### Pulizia Dati

Considera archiviazione per:
- `sensor_readings` > 1 anno
- `yield_predictions` completati > 2 anni
- `soil_analysis` > 3 anni (mantieni solo ultime 5 per zona)

## Riferimenti

- [Precision Agriculture Guide](./PRECISION_AGRICULTURE.md)
- [Architecture](./ARCHITECTURE.md)
- [Migration Guide](../database/migration_guide.md)

