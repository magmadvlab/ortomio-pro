# 🚨 DIFFERENZE CRITICHE: Database Locale vs Online

**Data:** 2026-01-04
**Priorità:** ALTA - Richiede intervento immediato

---

## ⚠️ PROBLEMA PRINCIPALE: Tier System

### ❌ Database Online - VECCHIO CONSTRAINT

```sql
-- ONLINE (SBAGLIATO)
tier text DEFAULT 'FREE'::text
CHECK (tier = ANY (ARRAY['FREE'::text, 'PLUS'::text, 'PRO'::text]))
```

### ✅ Database Locale - NUOVO CONSTRAINT

```sql
-- LOCALE (CORRETTO)
tier text DEFAULT 'PRO'::text
CHECK (tier = 'PRO'::text)
```

### 🔥 Impatto

**Questo spiega l'errore 400 durante la registrazione!**

- Online accetta solo: `FREE`, `PLUS`, `PRO`
- Locale accetta solo: `PRO`
- Trigger locale tenta di creare profili con `tier = 'PRO'`
- Ma online rifiuta perché si aspetta `FREE`, `PLUS` o `PRO`

**AZIONE IMMEDIATA RICHIESTA:** Applicare migration tier simplification online

---

## 📊 Confronto Dettagliato Tabelle

### Tabelle SOLO nel Database Online (NON in locale)

```
❌ Mancanti in locale (67 tabelle online vs 25 locali):

1.  api_configurations              ⭐ Gestione API keys (AI, Weather)
2.  calendar_tasks                   ⭐ Sistema calendario
3.  challenge_completions            ⭐ Gamification
4.  crop_aliases                     ⭐ Alias colture
5.  crop_archetypes                  ⭐ Archetipi colture
6.  crop_learning_events             ⭐ Learning system
7.  crop_mechanical_works            ⭐ Lavori meccanici per coltura
8.  crop_profiles                    ⭐ Profili colture
9.  custom_crops                     ⭐ Colture custom utente
10. fertilization_logs               ⭐ Log fertilizzazioni (diverso da fertilizer_application_logs)
11. fertilizer_inventory             ⭐ Inventario fertilizzanti
12. garden_correlations              ⭐ Correlazioni giardino
13. garden_patterns                  ⭐ Pattern rilevati
14. garden_rows                      ⭐ IMPORTANTE - Filari aiuole (bed rows)
15. garden_season_analyses           ⭐ Analisi stagionali
16. garden_tree_memories             ⭐ Memoria alberi
17. garden_zone_memories             ⭐ Memoria zone
18. irrigation_components            ⭐ Componenti irrigazione
19. irrigation_systems               ⭐ Sistemi irrigazione
20. irrigation_zones                 ⭐ Zone irrigazione
21. mechanical_work_register         ⭐ Registro lavori meccanici
22. mechanical_work_sequences        ⭐ Sequenze lavori
23. official_crops                   ⭐ Colture ufficiali
24. phyto_inventory                  ⭐ Inventario fitosanitari
25. plant_families                   ⭐ Famiglie botaniche
26. plant_rules                      ⭐ Regole piante
27. plant_synonyms                   ⭐ Sinonimi piante
28. plant_taxonomy                   ⭐ Tassonomia piante
29. planting_batches                 ✅ Esiste anche in locale
30. professional_analytics           ⭐ Analytics PRO
31. sensor_readings                  ⭐ Letture sensori
32. soil_analysis                    ⭐ Analisi suolo
33. treatment_register               ⭐ Registro trattamenti
34. treatment_registry               ⭐ Registry trattamenti (duplicato?)
35. user_badges                      ⭐ Badge gamification
36. vegetation_indices               ⭐ Indici vegetazione
37. watering_logs                    ⭐ Log irrigazioni
```

### Tabelle SOLO nel Database Locale (NON in online)

```
✅ Presenti solo in locale:

1. scalar_production_timeline       ⭐ Timeline produzione
2. (possibilmente altre - da verificare meglio)
```

---

## 🔍 DIFFERENZE CRITICHE PER TABELLA

### 1. `profiles` - TIER SYSTEM (CRITICO!)

**Online:**
```sql
tier text DEFAULT 'FREE'::text
CHECK (tier = ANY (ARRAY['FREE'::text, 'PLUS'::text, 'PRO'::text]))
```

**Locale:**
```sql
tier text DEFAULT 'PRO'::text
CHECK (tier = 'PRO'::text)

COMMENT ON COLUMN profiles.tier IS
  'Tier utente - Solo PRO supportato in questo database. FREE avrà repo separato.';
```

**Fix:** Applicare `20260104100000_simplify_tier_to_pro_only.sql` online

---

### 2. `field_rows` - ESISTENZA E STRUTTURA

**Online:**
```sql
CREATE TABLE public.field_rows (
  id uuid DEFAULT gen_random_uuid(),
  garden_id uuid NOT NULL,
  zone_id uuid,
  name text NOT NULL,
  row_number integer NOT NULL,
  length_meters numeric NOT NULL CHECK (length_meters > 0),
  distance_from_previous_row numeric,
  plant_spacing numeric CHECK (plant_spacing IS NULL OR plant_spacing > 0),
  cultivar text,
  plant_count integer,
  orientation text CHECK (orientation = ANY (ARRAY['N-S', 'E-W', 'NE-SW', 'NW-SE'])),
  irrigation_line jsonb,
  planted_date date,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

**Locale:**
```sql
-- IDENTICO! ✅
-- Tutti i campi avanzati presenti
```

**Status:** ✅ field_rows ESISTE ONLINE e ha la stessa struttura!

---

### 3. `garden_rows` - TABELLA MANCANTE IN LOCALE

**Online HA questa tabella:**
```sql
CREATE TABLE public.garden_rows (
  id uuid DEFAULT uuid_generate_v4(),
  garden_id uuid NOT NULL,
  bed_id uuid NOT NULL,
  name text NOT NULL,
  row_number integer,
  length_meters numeric NOT NULL,
  irrigation_line jsonb NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

**Locale:** ❌ NON ESISTE

**Impatto:** `garden_rows` è la tabella per **bed rows** (filari di aiuole/letti)
- Locale: Probabilmente non ancora implementata
- Online: Esiste e viene referenziata in `fertilizer_application_logs` e `watering_logs`

---

### 4. `notification_preferences` - ESISTENZA

**Locale:**
```sql
CREATE TABLE notification_preferences (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL UNIQUE,
    email_enabled boolean DEFAULT true,
    task_reminders boolean DEFAULT true,
    weather_alerts boolean DEFAULT true,
    challenge_notifications boolean DEFAULT true,
    harvest_notifications boolean DEFAULT true,
    seed_notifications boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

**Online:** ✅ **ESISTE CON STRUTTURA IDENTICA**

---

### 5. `garden_obstacles` - ESISTENZA

**Locale:**
```sql
CREATE TABLE garden_obstacles (
    id uuid DEFAULT uuid_generate_v4(),
    garden_id uuid NOT NULL,
    azimuth numeric NOT NULL CHECK (azimuth >= 0 AND azimuth <= 360),
    height_meters numeric NOT NULL CHECK (height_meters > 0),
    distance_meters numeric NOT NULL CHECK (distance_meters > 0),
    width_degrees numeric DEFAULT 30,
    type text DEFAULT 'Other'::text,
    source text DEFAULT 'manual'::text,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

**Online:** ✅ **ESISTE CON STRUTTURA IDENTICA**

---

### 6. `fertilizer_application_logs` - BREAKING CHANGE

**Online:**
```sql
CREATE TABLE fertilizer_application_logs (
  -- ...
  row_id uuid,  -- ⚠️ ANCORA VECCHIO NOME
  CONSTRAINT fertilizer_application_logs_row_id_fkey
    FOREIGN KEY (row_id) REFERENCES public.garden_rows(id)
);
```

**Locale:**
```sql
-- Non più presente nei log estratti (probabilmente spostato in altre tabelle)
```

**Problema:** Online usa `row_id` che referenzia `garden_rows` (bed rows)
**Locale:** Usa `bed_row_id` separato da `field_row_id`

---

### 7. `watering_logs` - BREAKING CHANGE

**Online:**
```sql
CREATE TABLE watering_logs (
  -- ...
  row_id uuid,  -- ⚠️ ANCORA VECCHIO NOME
  CONSTRAINT watering_logs_row_id_fkey
    FOREIGN KEY (row_id) REFERENCES public.field_rows(id)  -- ⚠️ Referenzia field_rows!
);
```

**Locale:**
```sql
-- Presumibilmente usa bed_row_id e field_row_id separati
```

**CONFUSIONE CRITICA:** Online ha `row_id` che punta a `field_rows`, ma dovrebbe separare bed rows e field rows!

---

## 🎯 Differenze Strutturali Principali

### Database Online
- **67+ tabelle** (molto più ricco)
- Ha sistema completo di:
  - Crop learning e AI
  - Gamification (badges, challenges)
  - Plant taxonomy e aliases
  - Irrigation systems avanzati
  - Sensor readings
  - Professional analytics
  - Treatment register completo
  - Soil analysis

### Database Locale
- **25 tabelle** (più snello)
- Focus su:
  - Field rows (filari campo aperto)
  - Sun exposure (obstacles)
  - Notification preferences
  - Tier PRO-only
  - Core features

---

## 🚨 AZIONI IMMEDIATE RICHIESTE

### 1. FIX TIER SYSTEM (PRIORITÀ MASSIMA)

**Problema:** Online ha constraint vecchio, locale ha nuovo constraint
**Impatto:** 400 error durante registrazione nuovi utenti

**SQL da eseguire online:**
```sql
-- 1. Backup
CREATE TABLE profiles_backup_20260104 AS SELECT * FROM profiles;

-- 2. Rimuovi vecchio constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_tier_check;

-- 3. Converti utenti esistenti
UPDATE profiles SET tier = 'PRO' WHERE tier IN ('FREE', 'PLUS');

-- 4. Nuovo constraint
ALTER TABLE profiles
ADD CONSTRAINT profiles_tier_check CHECK (tier = 'PRO');

-- 5. Default PRO
ALTER TABLE profiles ALTER COLUMN tier SET DEFAULT 'PRO';

-- 6. Verifica
SELECT tier, COUNT(*) FROM profiles GROUP BY tier;
-- Deve restituire solo: PRO | N
```

---

### 2. DECIDERE: Sincronizzare Locale → Online o viceversa?

**Opzione A: Portare tutte le tabelle online in locale**
- Pro: Database locale completo come produzione
- Contro: Molte tabelle da migrare (40+ tabelle mancanti)

**Opzione B: Mantenere locale snello**
- Pro: Locale focalizzato su feature core
- Contro: Schema diverso tra locale e online

**Opzione C: Allineare gradualmente**
- Pro: Migrazione controllata
- Contro: Schema inconsistente temporaneamente

---

### 3. FIX `garden_rows` (BED ROWS)

**Problema:** Locale NON ha tabella `garden_rows` (bed rows)
**Impatto:** Features bed rows non disponibili in locale

**Decisione richiesta:**
1. Creare `garden_rows` anche in locale?
2. O usare solo `field_rows`?

---

### 4. VERIFICARE Breaking Changes `row_id`

**Online ha:**
- `fertilizer_application_logs.row_id` → `garden_rows`
- `watering_logs.row_id` → `field_rows` ⚠️ CONFUSO!

**Locale vuole:**
- `bed_row_id` → `garden_rows` (bed rows)
- `field_row_id` → `field_rows` (field rows)

**Azione:** Applicare migration per separare bed_row_id e field_row_id anche online

---

## 📋 Migration Plan Raccomandato

### Fase 1: Emergency Fix (OGGI)
```bash
# 1. Fix tier constraint online
supabase db remote execute --file fix_tier_emergency.sql

# 2. Verifica
supabase db remote execute --query "SELECT tier, COUNT(*) FROM profiles GROUP BY tier"
```

### Fase 2: Allineamento Schema (Settimana prossima)
```bash
# 1. Decidere direzione sincronizzazione
# 2. Portare tabelle mancanti o rimuovere extra
# 3. Applicare breaking changes row_id → bed_row_id + field_row_id
```

### Fase 3: Testing Completo
```bash
# 1. Test registrazione utenti
# 2. Test creazione gardens
# 3. Test field rows
# 4. Test operazioni (fertilization, watering, treatments)
```

---

## 🔗 File SQL di Emergenza

Creare file `fix_tier_emergency.sql`:

```sql
-- ============================================
-- EMERGENCY FIX: Tier System Online
-- Data: 2026-01-04
-- ============================================

BEGIN;

-- 1. Backup
CREATE TABLE IF NOT EXISTS profiles_backup_20260104 AS
SELECT * FROM profiles;

-- 2. Drop vecchio constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_tier_check;

-- 3. Converti utenti esistenti
UPDATE profiles
SET tier = 'PRO'
WHERE tier IN ('FREE', 'PLUS');

-- 4. Nuovo constraint PRO-only
ALTER TABLE profiles
ADD CONSTRAINT profiles_tier_check
CHECK (tier = 'PRO');

-- 5. Default PRO
ALTER TABLE profiles
ALTER COLUMN tier SET DEFAULT 'PRO';

-- 6. Commento
COMMENT ON COLUMN profiles.tier IS
  'Tier utente - Solo PRO supportato. FREE avrà repo separato.';

-- 7. Verifica
DO $$
DECLARE
  tier_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT tier) INTO tier_count FROM profiles;

  IF tier_count = 1 THEN
    RAISE NOTICE '✅ Migration completata - Solo tier PRO presente';
  ELSE
    RAISE EXCEPTION '❌ Errore - Trovati % tier diversi', tier_count;
  END IF;
END $$;

COMMIT;
```

---

## 📊 Summary Priorità

| Priorità | Item | Impatto | Tempo Stimato |
|----------|------|---------|---------------|
| 🔴 **MASSIMA** | Fix tier constraint | BLOCCA registrazioni | 10 min |
| 🟠 **ALTA** | Decidere sync strategy | Confusione schema | 1 ora |
| 🟡 **MEDIA** | Aggiungere garden_rows locale | Feature bed rows | 2 ore |
| 🟡 **MEDIA** | Fix breaking changes row_id | Consistency | 3 ore |
| 🟢 **BASSA** | Portare tabelle mancanti | Feature complete | 1-2 giorni |

---

**NEXT STEP IMMEDIATO:**
Applicare `fix_tier_emergency.sql` sul database online per sbloccare le registrazioni!

