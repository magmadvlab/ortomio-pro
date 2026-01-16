# Database Migrations Fixed - 16 Gennaio 2026

## ✅ Problema Risolto

**Errore:** `ERROR: 42703: column g.size_sqm does not exist`

**Causa:** Le migrazioni facevano riferimento a `g.size_sqm` ma la colonna corretta nella tabella `gardens` è `size_sq_meters`.

## 🔧 Correzioni Applicate

### 1. Migration: `20260116000000_create_bio_certifications.sql`
- ✅ Rimosso `g.size_sqm as garden_size` dalla vista `bio_certifications_with_readiness`
- ✅ Corretto `garden_info.size_sqm` → `garden_info.size_sq_meters` nella funzione helper

### 2. Migration: `20260116010000_update_zones_with_dimensions.sql`
- ✅ Rimosso `g.size_sqm as garden_size` dalla vista `garden_zones_with_stats`
- ✅ Corretto `SELECT size_sqm` → `SELECT size_sq_meters` nella funzione `create_standard_zones_for_garden()`

### 3. Migration: `20260116020000_fix_migration_errors.sql`
- ✅ Rimosso `g.size_sqm as garden_size` dalla vista ricreata `garden_zones_with_stats`
- ✅ Aggiornato commento da "rimosso g.location" a "rimosso g.size_sqm"

### 4. File: `APPLY_ALL_MIGRATIONS_JAN16.sql`
- ✅ Applicati tutti i fix sopra nel file all-in-one

## 📋 Colonne Corrette Tabella Gardens

```sql
-- Colonna CORRETTA:
size_sq_meters DECIMAL(10, 2) NOT NULL DEFAULT 0

-- NON ESISTE:
size_sqm
location
```

## 🚀 Come Applicare le Migrazioni Ora

### Opzione 1: File Singoli (Consigliato)

Vai su **Supabase Dashboard → SQL Editor** e applica in ordine:

```sql
-- 1. Prima migrazione (Certificazioni BIO)
-- Copia e incolla: supabase/migrations/20260116000000_create_bio_certifications.sql

-- 2. Seconda migrazione (Zone con dimensioni)
-- Copia e incolla: supabase/migrations/20260116010000_update_zones_with_dimensions.sql

-- 3. Terza migrazione (Fix errori)
-- Copia e incolla: supabase/migrations/20260116020000_fix_migration_errors.sql
```

### Opzione 2: File All-in-One

Copia e incolla l'intero contenuto di `APPLY_ALL_MIGRATIONS_JAN16.sql` nel SQL Editor.

## ✅ Verifica Successo

Dopo aver applicato le migrazioni, esegui:

```sql
-- Verifica tabelle create
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'bio_certifications',
  'bio_certification_documents',
  'bio_certification_inspections'
);

-- Verifica viste create
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN (
  'bio_certifications_with_readiness',
  'garden_zones_with_stats',
  'garden_zones_area_usage'
);

-- Verifica colonne aggiunte a garden_zones
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'garden_zones' 
AND column_name IN (
  'area_sqm',
  'soil_type',
  'irrigation_type',
  'sun_exposure'
);
```

**Output atteso:**
- 3 tabelle bio_certifications
- 3 viste
- 4+ colonne in garden_zones

## 📝 Commit

```
fix: Correct gardens table column name from size_sqm to size_sq_meters

- Fixed all migration files to use correct column name size_sq_meters
- Removed non-existent g.size_sqm references from views
- Updated bio_certifications helper function
- Updated zone creation function

This fixes the ERROR: 42703: column g.size_sqm does not exist
```

**Commit hash:** 927df18  
**Pushed to:** main branch

## 🎯 Prossimi Passi

1. ✅ Applica le migrazioni nel database Supabase
2. ✅ Verifica che non ci siano errori
3. ✅ Testa il form certificazioni BIO nell'app
4. ✅ Verifica che le zone mostrino l'area in LocationSelector
5. ✅ Testa il calcolo automatico area quando aggiungi filari

---

**Status:** ✅ PRONTO PER APPLICAZIONE  
**Data:** 16 Gennaio 2026  
**Autore:** Kiro AI Assistant
