# Deploy Micro-Zone Tracking Migration

## Overview
Questa migrazione aggiunge il supporto completo per il tracking delle operazioni agronomiche a livello di micro-zone (aiuole/letti e filari).

## Cosa fa questa migration

### Tabelle modificate
1. **garden_rows** (NUOVA) - Gestione filari
2. **fertilizer_application_logs** - Aggiunge `row_id`
3. **treatment_register** - Aggiunge `bed_id` e `row_id`
4. **watering_logs** - Aggiunge `bed_id` e `row_id`
5. **mechanical_work_register** - Aggiunge `bed_id` e `row_id`

### Viste create (opzionali, per analytics)
- `treatment_by_microzone`
- `fertilization_by_microzone`
- `irrigation_by_microzone`
- `mechanical_work_by_microzone`

## Prerequisiti

Le seguenti tabelle devono esistere nel database:
- `gardens`
- `garden_beds`
- `fertilizer_application_logs`
- `treatment_register`
- `watering_logs`
- `mechanical_work_register`
- `irrigation_zones` (per vista irrigation)

## Deploy via Supabase Dashboard

### Opzione 1: SQL Editor (Consigliato)

1. Apri Supabase Dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
2. Vai a **SQL Editor**
3. Crea una nuova query
4. Copia il contenuto di `database/migrations/CONSOLIDATED_microzone_tracking_FINAL.sql`
5. Incolla nell'editor
6. Clicca **Run** (oppure Cmd/Ctrl + Enter)
7. Verifica i messaggi di successo

### Opzione 2: Supabase CLI

```bash
# Se hai Supabase CLI linkato al progetto remoto
supabase db push

# Oppure applica direttamente
supabase db execute --file database/migrations/CONSOLIDATED_microzone_tracking_FINAL.sql
```

### Opzione 3: psql diretto

```bash
# Recupera la connection string dal Dashboard Supabase
# Settings > Database > Connection String (URI)

psql "YOUR_CONNECTION_STRING" \
  -f database/migrations/CONSOLIDATED_microzone_tracking_FINAL.sql
```

## Verifica Post-Deploy

Esegui questa query per verificare che tutto sia stato creato:

```sql
-- Verifica colonne aggiunte
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name IN ('bed_id', 'row_id')
ORDER BY table_name, column_name;

-- Verifica garden_rows table
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'garden_rows'
) as garden_rows_exists;

-- Verifica viste create
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE '%microzone%';
```

**Output atteso:**
```
 table_name                    | column_name | data_type
-------------------------------+-------------+-----------
 fertilizer_application_logs   | bed_id      | uuid
 fertilizer_application_logs   | row_id      | uuid
 mechanical_work_register      | bed_id      | uuid
 mechanical_work_register      | row_id      | uuid
 treatment_register            | bed_id      | uuid
 treatment_register            | row_id      | uuid
 watering_logs                 | bed_id      | uuid
 watering_logs                 | row_id      | uuid

 garden_rows_exists
--------------------
 t

 table_name
-------------------------------
 fertilization_by_microzone
 irrigation_by_microzone
 mechanical_work_by_microzone
 treatment_by_microzone
```

## Rollback (se necessario)

Se qualcosa va storto, puoi rimuovere le modifiche:

```sql
-- Rimuovi colonne aggiunte
ALTER TABLE fertilizer_application_logs DROP COLUMN IF EXISTS row_id;
ALTER TABLE treatment_register DROP COLUMN IF EXISTS bed_id, DROP COLUMN IF EXISTS row_id;
ALTER TABLE watering_logs DROP COLUMN IF EXISTS bed_id, DROP COLUMN IF EXISTS row_id;
ALTER TABLE mechanical_work_register DROP COLUMN IF EXISTS bed_id, DROP COLUMN IF EXISTS row_id;

-- Rimuovi viste
DROP VIEW IF EXISTS treatment_by_microzone;
DROP VIEW IF EXISTS fertilization_by_microzone;
DROP VIEW IF EXISTS irrigation_by_microzone;
DROP VIEW IF EXISTS mechanical_work_by_microzone;

-- Rimuovi tabella garden_rows (ATTENZIONE: elimina tutti i filari!)
DROP TABLE IF EXISTS garden_rows CASCADE;
```

## Frontend già aggiornato

I seguenti componenti sono stati aggiornati per utilizzare i nuovi campi:

✅ `components/fertilizer/FertilizerApplicationModal.tsx` - bed/row selectors
✅ `components/professional/TreatmentRegisterForm.tsx` - form completo con bed/row
✅ `components/professional/TreatmentRegister.tsx` - visualizzazione micro-zone
✅ `components/mechanicalWork/MechanicalWorkLogForm.tsx` - già supportato
✅ `components/irrigation/WateringLogForm.tsx` - già supportato

## Note

- Tutte le colonne `bed_id` e `row_id` sono **opzionali** (NULL consentito)
- Se non specificati, l'operazione si riferisce a tutto l'orto
- Le policy RLS sono configurate correttamente per multi-tenant
- Gli indici sono creati solo per valori NOT NULL (performance)

## Support

Per problemi o domande, verifica:
1. I log dell'errore nel SQL Editor
2. Che le tabelle prerequisite esistano
3. Che non ci siano vincoli di foreign key mancanti
