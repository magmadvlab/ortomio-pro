# 🔄 Database Schema Comparison: Local vs Online

**Data:** 2026-01-04
**Local DB:** Supabase CLI (port 54324)
**Online DB:** Produzione cloud

---

## 📊 Executive Summary

### Local Database
- **Tables:** 25 tabelle
- **Migrations Applied:** Tutte le migrations locali inclusa `20260104100000_simplify_tier_to_pro_only.sql`
- **Tier System:** Solo PRO
- **Field Rows:** Completamente implementati con tutti i campi avanzati

### Online Database
- **Tables:** Da verificare con schema fornito
- **Status:** Schema fornito dall'utente da comparare

---

## 📋 Tables Inventory

### Local Database Tables (25)

```sql
1.  agronomist_advice
2.  agronomist_consultations
3.  agronomists
4.  ai_credit_transactions
5.  aquaponic_readings
6.  bed_planting_history
7.  custom_plans
8.  field_rows                      ⭐ NUOVO
9.  garden_accessories
10. garden_beds
11. garden_obstacles               ⭐ Sun exposure system
12. garden_tasks
13. garden_zones
14. gardens
15. harvest_logs
16. hydroponic_readings
17. notification_preferences       ⭐ NUOVO
18. photo_logs
19. planting_batches
20. profiles
21. sapling_batches
22. scalar_production_timeline
23. seed_inventory
24. seedling_batches
25. weather_cache
```

---

## 🆕 Key Differences to Check

### 1. Tier System - `profiles` Table

**Local (Current):**
```sql
-- Solo tier PRO
CONSTRAINT profiles_tier_check CHECK (tier = 'PRO')
tier text DEFAULT 'PRO'::text

COMMENT ON COLUMN profiles.tier IS
  'Tier utente - Solo PRO supportato in questo database. FREE avrà repo separato.';
```

**Online (Probabile stato precedente):**
```sql
-- Vecchio constraint con 3 tier
CONSTRAINT profiles_tier_check CHECK (
  tier = ANY (ARRAY['FREE'::text, 'PRO_CONSUMER'::text, 'PRO_PROFESSIONAL'::text])
)
```

**⚠️ AZIONE RICHIESTA:** Applicare migration `20260104100000_simplify_tier_to_pro_only.sql` online

---

### 2. Field Rows Support in Operations Tables

**Local (Current):**
Tutte le tabelle operative hanno sia `bed_row_id` che `field_row_id`:

```sql
-- Esempio da migration 20260104000000

-- treatment_register
ALTER TABLE treatment_register
  RENAME COLUMN row_id TO bed_row_id;

ALTER TABLE treatment_register
  ADD COLUMN field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL;

ADD CONSTRAINT check_single_row_reference
  CHECK (
    (bed_row_id IS NULL AND field_row_id IS NULL) OR
    (bed_row_id IS NOT NULL AND field_row_id IS NULL) OR
    (bed_row_id IS NULL AND field_row_id IS NOT NULL)
  );
```

**Tabelle Modificate:**
1. `treatment_register`
2. `watering_logs`
3. `fertilizer_application_logs`
4. `mechanical_work_records`
5. `soil_analysis_records`

**⚠️ AZIONE RICHIESTA:** Verificare se queste tabelle esistono online e applicare migration

---

### 3. `notification_preferences` Table

**Local (Current):**
```sql
CREATE TABLE notification_preferences (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    email_enabled boolean DEFAULT true,
    task_reminders boolean DEFAULT true,
    weather_alerts boolean DEFAULT true,
    challenge_notifications boolean DEFAULT true,
    harvest_notifications boolean DEFAULT true,
    seed_notifications boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Trigger per creazione automatica
CREATE TRIGGER on_user_created_notification_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();
```

**⚠️ AZIONE RICHIESTA:** Verificare se esiste online, altrimenti applicare migration

---

### 4. `field_rows` Table

**Local (Current):**
```sql
CREATE TABLE field_rows (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    garden_id uuid NOT NULL,
    zone_id uuid,
    name text NOT NULL,
    row_number integer NOT NULL,
    length_meters numeric(10,2) NOT NULL,
    distance_from_previous_row numeric(10,2),
    plant_spacing numeric(10,2),              -- ⭐ Auto-calc plant_count
    cultivar text,
    plant_count integer,                      -- ⭐ Trigger auto-calc
    orientation text,                         -- ⭐ N-S, E-W, NE-SW, NW-SE
    irrigation_line jsonb,                    -- ⭐ Configurazione irrigazione
    planted_date date,                        -- ⭐ Data semina/trapianto
    is_active boolean DEFAULT true,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),

    CONSTRAINT unique_garden_row_number UNIQUE (garden_id, row_number),
    CONSTRAINT field_rows_orientation_check CHECK (
      orientation = ANY (ARRAY['N-S'::text, 'E-W'::text, 'NE-SW'::text, 'NW-SE'::text])
    )
);

-- Trigger auto-calcolo numero piante
CREATE TRIGGER auto_calc_field_row_plants
  BEFORE INSERT OR UPDATE ON field_rows
  FOR EACH ROW
  EXECUTE FUNCTION update_field_row_plant_count();
```

**⚠️ AZIONE RICHIESTA:** Verificare se esiste online con tutti i campi

---

### 5. `garden_obstacles` Table (Sun Exposure)

**Local (Current):**
```sql
CREATE TABLE garden_obstacles (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    azimuth numeric(5,2) NOT NULL,            -- 0-360 gradi
    height_meters numeric(6,2) NOT NULL,
    distance_meters numeric(6,2) NOT NULL,
    width_degrees numeric(5,2) DEFAULT 30,
    type text DEFAULT 'Other'::text,
    source text DEFAULT 'manual'::text,       -- photo_360, manual, ai_analysis
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),

    CONSTRAINT garden_obstacles_type_check CHECK (
      type = ANY (ARRAY['Building'::text, 'Tree'::text, 'Mountain'::text, 'Other'::text])
    ),
    CONSTRAINT garden_obstacles_source_check CHECK (
      source = ANY (ARRAY['photo_360'::text, 'manual'::text, 'ai_analysis'::text])
    )
);
```

**⚠️ AZIONE RICHIESTA:** Verificare se esiste online

---

### 6. `gardens` Table - Sun Exposure Fields

**Local (Current):**
```sql
-- Campi per esposizione solare
sun_exposure text,                    -- FullSun, PartSun, Shade
daily_sun_hours integer,              -- 0-24 ore
aspect_direction text,                -- North, South, East, West, Flat
photo_north_offset numeric(5,2),      -- 0-360 gradi offset foto 360°

CONSTRAINT gardens_sun_exposure_check CHECK (
  sun_exposure = ANY (ARRAY['FullSun'::text, 'PartSun'::text, 'Shade'::text])
),
CONSTRAINT gardens_aspect_direction_check CHECK (
  aspect_direction = ANY (ARRAY['North'::text, 'South'::text, 'East'::text, 'West'::text, 'Flat'::text])
),
CONSTRAINT gardens_daily_sun_hours_check CHECK (
  daily_sun_hours >= 0 AND daily_sun_hours <= 24
),
CONSTRAINT gardens_photo_north_offset_check CHECK (
  photo_north_offset >= 0 AND photo_north_offset <= 360
)
```

**⚠️ AZIONE RICHIESTA:** Verificare constraints online

---

### 7. `garden_zones` Table - Extended Fields

**Local (Current):**
```sql
-- Nuovi campi per greenhouse/indoor zones
zone_kind text DEFAULT 'OpenField'::text,
coordinates jsonb,
color text DEFAULT '#3b82f6'::text,
order_index integer DEFAULT 0,
position jsonb,
dimensions jsonb,
greenhouse_type text,
covering_type text,
heating_type text,
ventilation_type text,

CONSTRAINT garden_zones_zone_kind_check CHECK (
  zone_kind = ANY (ARRAY['OpenField'::text, 'Greenhouse'::text, 'Indoor'::text])
)
```

**⚠️ AZIONE RICHIESTA:** Verificare se questi campi esistono online

---

## 🔍 Step-by-Step Comparison Checklist

### ✅ Tables to Verify Online

- [ ] `field_rows` - Esiste? Ha tutti i campi (plant_spacing, orientation, irrigation_line, planted_date)?
- [ ] `garden_obstacles` - Esiste? Ha i campi per sun exposure?
- [ ] `notification_preferences` - Esiste? Ha il trigger on_user_created?
- [ ] `treatment_register` - Ha `bed_row_id` e `field_row_id` separati?
- [ ] `watering_logs` - Ha `bed_row_id` e `field_row_id` separati?
- [ ] `fertilizer_application_logs` - Ha `bed_row_id` e `field_row_id` separati?
- [ ] `mechanical_work_records` - Ha `bed_row_id` e `field_row_id` separati?
- [ ] `soil_analysis_records` - Ha `bed_row_id` e `field_row_id` separati?
- [ ] `profiles` - Ha constraint solo PRO o ancora vecchi tier?
- [ ] `gardens` - Ha campi sun_exposure completi (sun_exposure, daily_sun_hours, aspect_direction, photo_north_offset)?
- [ ] `garden_zones` - Ha campi greenhouse (zone_kind, greenhouse_type, covering_type, heating_type, ventilation_type)?
- [ ] `garden_accessories` - Ha campo `position` JSONB?

---

## 📦 Migrations da Applicare Online

### 1. Tier Simplification (PRIORITÀ ALTA)

**File:** `supabase/migrations/20260104100000_simplify_tier_to_pro_only.sql`

```sql
-- Rimuovi vecchio constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_tier_check;

-- Aggiorna tutti i profili a PRO
UPDATE profiles SET tier = 'PRO' WHERE tier != 'PRO';

-- Nuovo constraint solo PRO
ALTER TABLE profiles
ADD CONSTRAINT profiles_tier_check CHECK (tier = 'PRO');

-- Default PRO
ALTER TABLE profiles ALTER COLUMN tier SET DEFAULT 'PRO';

-- Aggiorna trigger handle_new_user()
-- (vedi file completo)
```

**Risultato atteso:**
- ✅ Solo tier 'PRO' accettato
- ✅ Tutti i profili esistenti migrati a PRO
- ✅ Nuovi utenti creati automaticamente con tier PRO

---

### 2. Field Rows to Operations (PRIORITÀ ALTA)

**File:** `supabase/migrations/20260104000000_add_field_rows_to_operations.sql`

**Tabelle da modificare:**
1. `treatment_register`
2. `watering_logs`
3. `fertilizer_application_logs`
4. `mechanical_work_records`
5. `soil_analysis_records`

**Schema pattern per ogni tabella:**
```sql
-- Rinomina row_id → bed_row_id
ALTER TABLE <table_name> RENAME COLUMN row_id TO bed_row_id;

-- Aggiungi field_row_id
ALTER TABLE <table_name>
ADD COLUMN field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL;

-- Constraint: uno solo tra bed_row_id e field_row_id
ALTER TABLE <table_name>
ADD CONSTRAINT check_single_row_reference
CHECK (
  (bed_row_id IS NULL AND field_row_id IS NULL) OR
  (bed_row_id IS NOT NULL AND field_row_id IS NULL) OR
  (bed_row_id IS NULL AND field_row_id IS NOT NULL)
);

-- Indici
CREATE INDEX idx_<table_name>_bed_row_id ON <table_name>(bed_row_id);
CREATE INDEX idx_<table_name>_field_row_id ON <table_name>(field_row_id);
```

**⚠️ BREAKING CHANGE:** Questo richiede aggiornamento del codice TypeScript (già fatto in locale)

---

### 3. Notification Preferences (PRIORITÀ MEDIA)

**File:** `supabase/migrations/20251230121000_add_notification_preferences.sql`

Se non esiste online:

```sql
CREATE TABLE notification_preferences (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    email_enabled boolean DEFAULT true,
    task_reminders boolean DEFAULT true,
    weather_alerts boolean DEFAULT true,
    challenge_notifications boolean DEFAULT true,
    harvest_notifications boolean DEFAULT true,
    seed_notifications boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Trigger creazione automatica
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_notification_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();
```

---

### 4. Garden Obstacles (Sun Exposure) (PRIORITÀ MEDIA)

**File:** Verificare se esiste in migrations precedenti

Se non esiste:

```sql
CREATE TABLE garden_obstacles (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    azimuth numeric(5,2) NOT NULL,
    height_meters numeric(6,2) NOT NULL,
    distance_meters numeric(6,2) NOT NULL,
    width_degrees numeric(5,2) DEFAULT 30,
    type text DEFAULT 'Other'::text,
    source text DEFAULT 'manual'::text,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),

    CONSTRAINT garden_obstacles_azimuth_check
      CHECK (azimuth >= 0 AND azimuth <= 360),
    CONSTRAINT garden_obstacles_type_check
      CHECK (type = ANY (ARRAY['Building', 'Tree', 'Mountain', 'Other'])),
    CONSTRAINT garden_obstacles_source_check
      CHECK (source = ANY (ARRAY['photo_360', 'manual', 'ai_analysis']))
);

CREATE INDEX idx_garden_obstacles_garden_id ON garden_obstacles(garden_id);
CREATE INDEX idx_garden_obstacles_azimuth ON garden_obstacles(azimuth);

ALTER TABLE garden_obstacles
ADD CONSTRAINT garden_obstacles_garden_id_fkey
FOREIGN KEY (garden_id) REFERENCES gardens(id) ON DELETE CASCADE;
```

---

## 🎯 Deployment Strategy

### Opzione A: CLI Deploy (Raccomandato)

```bash
# 1. Assicurati di essere collegato al progetto online
supabase link --project-ref <your-project-ref>

# 2. Verifica lo stato
supabase db diff

# 3. Applica le migrations in ordine
supabase db push

# 4. Verifica applicazione
supabase db remote commit
```

### Opzione B: SQL Editor Dashboard

1. Accedi a Supabase Dashboard → SQL Editor
2. Applica le migrations in questo ordine:
   - `20260104100000_simplify_tier_to_pro_only.sql`
   - `20260104000000_add_field_rows_to_operations.sql`
   - Altre migrations mancanti
3. Verifica ogni migration con query SELECT

### Opzione C: Deploy Manuale Sicuro

**Script SQL Unificato:**

```bash
# Genera un unico file SQL con tutte le migrations
cat supabase/migrations/20260104100000_simplify_tier_to_pro_only.sql \
    supabase/migrations/20260104000000_add_field_rows_to_operations.sql \
    > /tmp/deploy_all_migrations.sql

# Applica manualmente via dashboard
```

---

## ⚠️ Pre-Deployment Checklist

### 1. Backup Database Online
```bash
# Da fare PRIMA di applicare migrations
supabase db dump --db-url <online-db-url> > backup_pre_migration_$(date +%Y%m%d).sql
```

### 2. Verifica Utenti Esistenti
```sql
-- Conta utenti per tier
SELECT tier, COUNT(*) as count
FROM profiles
GROUP BY tier;

-- Trova utenti con tier vecchi
SELECT id, email, tier
FROM auth.users
JOIN profiles ON auth.users.id = profiles.id
WHERE tier IN ('FREE', 'PRO_CONSUMER', 'PRO_PROFESSIONAL');
```

### 3. Test Migration su Clone Database

Se possibile, crea un clone del database online e testa lì prima.

---

## 📊 Post-Deployment Verification

### Query di Verifica

```sql
-- 1. Verifica tier constraint
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'profiles_tier_check';

-- Risultato atteso: CHECK (tier = 'PRO'::text)

-- 2. Verifica field_rows table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'field_rows'
ORDER BY ordinal_position;

-- Risultato atteso: 17 colonne inclusi plant_spacing, orientation, irrigation_line

-- 3. Verifica notification_preferences
SELECT COUNT(*) as notification_prefs_count
FROM notification_preferences;

-- Risultato atteso: Almeno 1 record (per roberto.lalinga@gmail.com)

-- 4. Verifica bed_row_id vs field_row_id
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'treatment_register'
AND column_name IN ('bed_row_id', 'field_row_id');

-- Risultato atteso: Entrambi presenti

-- 5. Verifica garden_obstacles
SELECT COUNT(*) as tables_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'garden_obstacles';

-- Risultato atteso: 1
```

---

## 🚨 Rollback Plan

Se qualcosa va storto durante il deploy:

### Rollback Tier System
```sql
-- Ripristina vecchio constraint (solo se necessario)
ALTER TABLE profiles DROP CONSTRAINT profiles_tier_check;
ALTER TABLE profiles
ADD CONSTRAINT profiles_tier_check CHECK (
  tier = ANY (ARRAY['FREE'::text, 'PRO_CONSUMER'::text, 'PRO_PROFESSIONAL'::text])
);
```

### Rollback Field Rows in Operations
```sql
-- Per ogni tabella modificata
ALTER TABLE treatment_register RENAME COLUMN bed_row_id TO row_id;
ALTER TABLE treatment_register DROP COLUMN IF EXISTS field_row_id;
ALTER TABLE treatment_register DROP CONSTRAINT IF EXISTS check_single_row_reference;
```

---

## 📝 Migration Order (Priorità)

1. **ALTA** - Tier Simplification (`20260104100000_simplify_tier_to_pro_only.sql`)
   - Impatta autenticazione
   - Necessario per nuovi utenti

2. **ALTA** - Field Rows Operations (`20260104000000_add_field_rows_to_operations.sql`)
   - Breaking changes per codice TypeScript
   - Necessario per funzionalità campo aperto

3. **MEDIA** - Notification Preferences
   - Feature UX
   - Non bloccante

4. **MEDIA** - Garden Obstacles (Sun Exposure)
   - Feature avanzata
   - Non bloccante

---

## 📚 File Correlati

### Migrations
- [20260104100000_simplify_tier_to_pro_only.sql](../supabase/migrations/20260104100000_simplify_tier_to_pro_only.sql)
- [20260104000000_add_field_rows_to_operations.sql](../supabase/migrations/20260104000000_add_field_rows_to_operations.sql)

### Docs
- [TIER_SIMPLIFICATION_PRO_ONLY.md](TIER_SIMPLIFICATION_PRO_ONLY.md)
- [FIELD_ROWS_UI_COMPLETE.md](FIELD_ROWS_UI_COMPLETE.md)
- [DATABASE_SUN_EXPOSURE_PREFERENCES.md](DATABASE_SUN_EXPOSURE_PREFERENCES.md)

---

**Next Step:** Eseguire query di verifica sul database online per confermare quali migrations servono.
