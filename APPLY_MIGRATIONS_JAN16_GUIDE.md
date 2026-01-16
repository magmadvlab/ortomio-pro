# Guida Applicazione Migrazioni Database - 16 Gennaio 2026

## 📋 Panoramica

Questa guida spiega come applicare le 3 migrazioni create per:
1. **Certificazioni BIO** - Sistema completo certificazioni biologiche EU 2018/848
2. **Zone con Dimensioni** - Aggiunta area_sqm e caratteristiche agronomiche alle zone
3. **Fix Errori** - Correzione errori trigger e viste

## ⚠️ IMPORTANTE: Ordine di Applicazione

Le migrazioni DEVONO essere applicate in questo ordine:

```
1. 20260116000000_create_bio_certifications.sql
2. 20260116010000_update_zones_with_dimensions.sql  
3. 20260116020000_fix_migration_errors.sql
```

## 🔧 Metodo 1: Applicazione tramite Supabase Dashboard

### Step 1: Certificazioni BIO

1. Vai su **Supabase Dashboard** → **SQL Editor**
2. Clicca **New Query**
3. Copia e incolla il contenuto di `supabase/migrations/20260116000000_create_bio_certifications.sql`
4. Clicca **Run** (o Ctrl+Enter)
5. Verifica che non ci siano errori

**Cosa crea:**
- Tabella `bio_certifications` (certificazioni biologiche)
- Tabella `bio_certification_documents` (documenti)
- Tabella `bio_certification_inspections` (ispezioni)
- Funzione `calculate_bio_compliance_score()` (calcolo score 0-100)
- Funzione `get_bio_certification_readiness()` (ready/partially_ready/not_ready)
- Vista `bio_certifications_with_readiness`
- RLS policies per tutte le tabelle

### Step 2: Zone con Dimensioni

1. Vai su **SQL Editor** → **New Query**
2. Copia e incolla il contenuto di `supabase/migrations/20260116010000_update_zones_with_dimensions.sql`
3. Clicca **Run**
4. Verifica che non ci siano errori

**Cosa aggiunge:**
- Colonna `area_sqm` a `garden_zones`
- Colonne `perimeter_meters`, `shape_type`, `coordinates`
- Colonne agronomiche: `soil_type`, `irrigation_type`, `sun_exposure`, `slope_percentage`
- Funzione `calculate_zone_area_from_rows()` (calcolo automatico area)
- Trigger `auto_update_zone_area_on_row_change` (aggiornamento automatico)
- Vista `garden_zones_with_stats` (statistiche complete)
- Vista `garden_zones_area_usage` (utilizzo area)
- Funzione `suggest_field_row_layout()` (suggerimenti layout)

### Step 3: Fix Errori

1. Vai su **SQL Editor** → **New Query**
2. Copia e incolla il contenuto di `supabase/migrations/20260116020000_fix_migration_errors.sql`
3. Clicca **Run**
4. Verifica che non ci siano errori

**Cosa corregge:**
- Ricrea trigger `auto_calc_section_plant_count` (risolve errore "already exists")
- Ricrea vista `bio_certifications_with_readiness` (rimuove `g.location`)
- Ricrea vista `garden_zones_with_stats` (rimuove `fr.plant_spacing_cm` se non esiste)
- Aggiunge colonne mancanti a `field_rows`: `plant_spacing_cm`, `row_width_meters`, `plant_count`
- Aggiorna funzioni per gestire colonne opzionali

## 🔧 Metodo 2: Applicazione tramite Supabase CLI

```bash
# Assicurati di essere nella directory del progetto
cd /path/to/ortomio-pro

# Applica tutte le migrazioni in ordine
supabase db push

# Oppure applica singolarmente
supabase db execute --file supabase/migrations/20260116000000_create_bio_certifications.sql
supabase db execute --file supabase/migrations/20260116010000_update_zones_with_dimensions.sql
supabase db execute --file supabase/migrations/20260116020000_fix_migration_errors.sql
```

## ✅ Verifica Applicazione

Dopo aver applicato tutte le migrazioni, esegui questa query per verificare:

```sql
-- Verifica tabelle create
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'bio_certifications',
  'bio_certification_documents',
  'bio_certification_inspections'
)
ORDER BY table_name;

-- Verifica colonne aggiunte a garden_zones
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'garden_zones' 
AND column_name IN (
  'area_sqm',
  'perimeter_meters',
  'shape_type',
  'soil_type',
  'irrigation_type',
  'sun_exposure',
  'slope_percentage'
)
ORDER BY column_name;

-- Verifica colonne aggiunte a field_rows
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'field_rows' 
AND column_name IN (
  'plant_spacing_cm',
  'row_width_meters',
  'plant_count'
)
ORDER BY column_name;

-- Verifica viste create
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN (
  'bio_certifications_with_readiness',
  'garden_zones_with_stats',
  'garden_zones_area_usage'
)
ORDER BY table_name;

-- Verifica funzioni create
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'calculate_bio_compliance_score',
  'get_bio_certification_readiness',
  'calculate_zone_area_from_rows',
  'auto_update_zone_area',
  'suggest_field_row_layout'
)
ORDER BY routine_name;
```

**Output atteso:**
- 3 tabelle bio_certifications
- 7 colonne in garden_zones
- 3 colonne in field_rows
- 3 viste
- 5 funzioni

## 🧪 Test Funzionalità

### Test 1: Certificazione BIO

```sql
-- Crea una certificazione di test
INSERT INTO bio_certifications (
  garden_id,
  company_name,
  certification_body,
  total_area,
  organic_area,
  uses_chemical_fertilizers,
  uses_synthetic_pesticides,
  uses_gmo,
  has_traceability_system,
  separates_organic_conventional,
  keeps_production_records
) VALUES (
  (SELECT id FROM gardens LIMIT 1), -- Usa primo giardino
  'Azienda Test BIO',
  'ICEA',
  10.0,
  8.0,
  false, -- Corretto per BIO
  false, -- Corretto per BIO
  false, -- Corretto per BIO
  true,  -- Corretto per BIO
  true,  -- Corretto per BIO
  true   -- Corretto per BIO
)
RETURNING id, compliance_score;

-- Verifica compliance score (dovrebbe essere alto, ~80-90)
SELECT 
  company_name,
  compliance_score,
  get_bio_certification_readiness(id) as readiness
FROM bio_certifications
WHERE company_name = 'Azienda Test BIO';
```

### Test 2: Zone con Area

```sql
-- Verifica zone esistenti
SELECT 
  name,
  area_sqm,
  field_row_count,
  total_row_length,
  section_count
FROM garden_zones_with_stats
LIMIT 5;

-- Crea una zona di test
INSERT INTO garden_zones (
  garden_id,
  name,
  area_sqm,
  soil_type,
  irrigation_type,
  sun_exposure
) VALUES (
  (SELECT id FROM gardens LIMIT 1),
  'Zona Test',
  100.0,
  'argilloso',
  'drip',
  'full_sun'
)
RETURNING id, name, area_sqm;

-- Verifica utilizzo area
SELECT * FROM garden_zones_area_usage
WHERE name = 'Zona Test';
```

### Test 3: Calcolo Automatico Area

```sql
-- Crea un filare nella zona test
INSERT INTO field_rows (
  zone_id,
  name,
  length_meters,
  row_width_meters,
  plant_spacing_cm
) VALUES (
  (SELECT id FROM garden_zones WHERE name = 'Zona Test'),
  'Filare Test',
  10.0,
  1.5,
  50
)
RETURNING id, name, length_meters, row_width_meters;

-- Verifica che area zona sia aggiornata automaticamente
SELECT 
  name,
  area_sqm,
  used_area,
  available_area,
  usage_percentage
FROM garden_zones_area_usage
WHERE name = 'Zona Test';
```

## 🚨 Risoluzione Problemi

### Errore: "trigger already exists"

**Causa:** Trigger già presente da migrazione precedente

**Soluzione:** La migrazione fix (step 3) risolve automaticamente con `DROP TRIGGER IF EXISTS`

### Errore: "column does not exist"

**Causa:** Colonna non ancora creata

**Soluzione:** Assicurati di applicare le migrazioni nell'ordine corretto (1 → 2 → 3)

### Errore: "relation does not exist"

**Causa:** Tabella non ancora creata

**Soluzione:** Applica prima la migrazione che crea la tabella

### Compliance Score = 0

**Causa:** Dati mancanti nella certificazione

**Soluzione:** Compila tutti i campi richiesti:
- Company data (20%): company_name, certification_body, certification_number, dates
- Production (20%): total_area, organic_area, buffer_zones
- Practices (30%): uses_chemical_fertilizers=FALSE, uses_synthetic_pesticides=FALSE, uses_gmo=FALSE
- Traceability (20%): has_traceability_system=TRUE, separates_organic_conventional=TRUE, keeps_production_records=TRUE
- Controls (10%): last_inspection_date, next_inspection_date

## 📊 Struttura Compliance Score

Il compliance score è calcolato automaticamente su 100 punti:

| Sezione | Punti | Campi |
|---------|-------|-------|
| **Company Data** | 20 | company_name (4), certification_body (4), certification_number (4), certification_date (4), expiry_date (4) |
| **Production** | 20 | total_area (5), organic_area (5), has_buffer_zones (5), buffer_zone_width≥3m (5) |
| **Practices** | 30 | uses_chemical_fertilizers=FALSE (10), uses_synthetic_pesticides=FALSE (10), uses_gmo=FALSE (10) |
| **Traceability** | 20 | has_traceability_system=TRUE (7), separates_organic_conventional=TRUE (7), keeps_production_records=TRUE (6) |
| **Controls** | 10 | last_inspection_date (5), next_inspection_date (5) |

**Readiness Status:**
- ≥80 punti: `ready` (verde)
- 60-79 punti: `partially_ready` (giallo)
- <60 punti: `not_ready` (rosso)

## 📝 Note Finali

1. **Backup:** Le migrazioni sono sicure e non cancellano dati esistenti
2. **Rollback:** Se necessario, puoi fare rollback manualmente eliminando tabelle/colonne create
3. **Performance:** Gli indici sono già creati per ottimizzare le query
4. **RLS:** Le policies sono già configurate per sicurezza multi-tenant
5. **Trigger:** L'aggiornamento automatico area zone è già attivo

## 🎯 Prossimi Passi

Dopo aver applicato le migrazioni:

1. ✅ Testa il form certificazioni BIO nell'app
2. ✅ Verifica che le zone mostrino l'area in LocationSelector
3. ✅ Testa il calcolo automatico area quando aggiungi filari
4. ✅ Verifica il compliance score nel dashboard certificazioni
5. ✅ Testa l'upload documenti certificazione
6. ✅ Testa il tracking ispezioni

---

**Data creazione:** 16 Gennaio 2026  
**Versione:** 1.0  
**Autore:** Kiro AI Assistant
