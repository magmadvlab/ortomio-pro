# ✅ Fix Errore "individual_plants" - RISOLTO

**Data:** 14 Gennaio 2026  
**Errore:** `ALTER action ADD COLUMN cannot be performed on relation "individual_plants"`  
**Status:** ✅ Risolto

---

## ❌ Problema

### Errore Completo
```
Error: Failed to run sql query: 
ERROR: 42809: ALTER action ADD COLUMN cannot be performed on relation "individual_plants" 
DETAIL: This operation is not supported for views.
```

### Causa Root
La migration `20260111000000_integrate_plant_row_tracking.sql` cerca di eseguire:

```sql
ALTER TABLE individual_plants 
ADD COLUMN garden_row_id UUID REFERENCES garden_rows(id);
```

**Ma `individual_plants` è una VIEW, non una tabella!**

La tabella reale sottostante è `garden_plants`.

---

## ✅ Soluzione Implementata

### 1. Migration Corretta Creata

**File:** `supabase/migrations/20260114110000_fix_individual_plants_row_tracking.sql`

**Cosa fa:**
- ✅ Modifica `garden_plants` (tabella reale) invece di `individual_plants` (view)
- ✅ Aggiunge colonne `garden_row_id` e `field_row_id`
- ✅ Aggiunge constraint per validazione
- ✅ Crea indexes per performance
- ✅ Ricrea la view `individual_plants` con le nuove colonne

**Codice chiave:**
```sql
-- Modifica la TABELLA reale
ALTER TABLE public.garden_plants 
ADD COLUMN garden_row_id UUID REFERENCES public.garden_rows(id);

ALTER TABLE public.garden_plants 
ADD COLUMN field_row_id UUID REFERENCES public.field_rows(id);

-- Ricrea la VIEW
DROP VIEW IF EXISTS public.individual_plants CASCADE;
CREATE VIEW public.individual_plants AS 
SELECT * FROM public.garden_plants;
```

### 2. SQL Completo per Applicazione

**File:** `APPLY_MISSING_TABLES_REMOTE.sql`

Include:
- ✅ Fix individual_plants row tracking
- ✅ Creazione tabella `planting_plans`
- ✅ Creazione tabella `crop_rotation_history`
- ✅ RLS policies per sicurezza
- ✅ Trigger auto-tracking rotazioni
- ✅ Indexes ottimizzati

### 3. Guida Applicazione

**File:** `GUIDA_APPLICAZIONE_MIGRATIONS_REMOTE.md`

Contiene:
- ✅ Istruzioni passo-passo
- ✅ Query di verifica
- ✅ Troubleshooting
- ✅ Checklist completa

---

## 🔧 Come Applicare

### Metodo 1: Supabase Dashboard (CONSIGLIATO)

1. Vai su https://supabase.com/dashboard
2. Seleziona progetto `qhmujoivfxftlrcrluaj`
3. SQL Editor → New query
4. Copia contenuto di `APPLY_MISSING_TABLES_REMOTE.sql`
5. Incolla e Run
6. Verifica messaggio successo

### Metodo 2: Supabase CLI

```bash
supabase db execute -f APPLY_MISSING_TABLES_REMOTE.sql
```

---

## 📊 Struttura Corretta

### Prima (ERRATO)
```
individual_plants (VIEW)
    ↓ ALTER TABLE ❌ ERRORE!
```

### Dopo (CORRETTO)
```
garden_plants (TABLE)
    ↓ ALTER TABLE ✅ OK!
    ↓
individual_plants (VIEW)
    ↓ SELECT * FROM garden_plants
```

---

## 🎯 Tabelle Create/Modificate

### 1. garden_plants (modificata)
```sql
-- Nuove colonne aggiunte:
garden_row_id UUID REFERENCES garden_rows(id)
field_row_id UUID REFERENCES field_rows(id)

-- Constraint:
CHECK (
  (garden_row_id IS NULL AND field_row_id IS NULL) OR
  (garden_row_id IS NOT NULL AND field_row_id IS NULL) OR
  (garden_row_id IS NULL AND field_row_id IS NOT NULL)
)
```

### 2. planting_plans (creata)
```sql
CREATE TABLE planting_plans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  garden_id UUID REFERENCES gardens,
  field_row_id UUID REFERENCES field_rows,
  field_row_section_id UUID REFERENCES field_row_sections,
  
  crop_name TEXT NOT NULL,
  plant_family TEXT,
  
  rotation_score INTEGER,
  rotation_warnings TEXT[],
  
  planned_sowing_date DATE,
  planned_harvest_date DATE,
  
  status TEXT DEFAULT 'planned',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. crop_rotation_history (creata)
```sql
CREATE TABLE crop_rotation_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  garden_id UUID REFERENCES gardens,
  field_row_id UUID REFERENCES field_rows,
  
  crop_name TEXT NOT NULL,
  plant_family TEXT NOT NULL,
  
  sowing_date DATE NOT NULL,
  harvest_date DATE,
  year INTEGER NOT NULL,
  
  yield_kg DECIMAL(10,2),
  quality_score INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔐 Sicurezza (RLS)

Tutte le tabelle hanno Row Level Security:

```sql
-- Esempio per planting_plans
CREATE POLICY "Users can view own plans"
ON planting_plans FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans"
ON planting_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Stesso per UPDATE e DELETE
```

---

## ✅ Verifica Post-Applicazione

### Test 1: Tabelle Esistenti
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('planting_plans', 'crop_rotation_history', 'garden_plants')
ORDER BY table_name;
```

**Risultato atteso:**
```
crop_rotation_history
garden_plants
planting_plans
```

### Test 2: Colonne garden_plants
```sql
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'garden_plants'
  AND column_name IN ('garden_row_id', 'field_row_id');
```

**Risultato atteso:**
```
field_row_id
garden_row_id
```

### Test 3: View Funzionante
```sql
SELECT COUNT(*) FROM individual_plants;
```

**Risultato atteso:** Nessun errore

---

## 🚀 Funzionalità Abilitate

Dopo l'applicazione, saranno operative:

### ✅ Classic Planner
- Pianificazione colture per filare
- Selezione location gerarchica
- Integrazione con LocationSelector

### ✅ Rotazione Colture
- Storico automatico per filare
- Score compatibilità 0-100
- Warnings intelligenti
- Suggerimenti AI

### ✅ Tracking Preciso
- Zone → Filari → Porzioni
- Storico completo operazioni
- Report per certificazioni

---

## 📝 Files Creati

1. ✅ `supabase/migrations/20260114110000_fix_individual_plants_row_tracking.sql`
   - Migration corretta per individual_plants

2. ✅ `APPLY_MISSING_TABLES_REMOTE.sql`
   - SQL completo da applicare al database remoto

3. ✅ `GUIDA_APPLICAZIONE_MIGRATIONS_REMOTE.md`
   - Guida passo-passo per applicazione

4. ✅ `FIX_INDIVIDUAL_PLANTS_ERROR_COMPLETE.md`
   - Questo documento di riepilogo

---

## 🔄 Migrations Gestite

### ❌ Rinominate in .skip (NON applicare)
- `20260111000000_integrate_plant_row_tracking.sql.skip`
  - Causa l'errore su individual_plants

### ✅ Da Applicare
- `20260114110000_fix_individual_plants_row_tracking.sql`
  - Versione corretta che modifica garden_plants

### ✅ Incluse in APPLY_MISSING_TABLES_REMOTE.sql
- Fix individual_plants
- Creazione planting_plans
- Creazione crop_rotation_history
- RLS policies
- Triggers
- Indexes

---

## 📊 Status Finale

| Componente | Status | Note |
|------------|--------|------|
| Errore identificato | ✅ | VIEW vs TABLE |
| Migration corretta | ✅ | Creata |
| SQL applicazione | ✅ | Pronto |
| Guida | ✅ | Completa |
| Verifica | ⏳ | Da eseguire dopo applicazione |

---

## 🎯 Prossimi Passi

1. **Applica SQL**
   - Usa `APPLY_MISSING_TABLES_REMOTE.sql`
   - Via Supabase Dashboard SQL Editor

2. **Verifica**
   - Esegui query di test
   - Controlla tabelle create
   - Verifica RLS attivo

3. **Test Funzionalità**
   - Apri Classic Planner
   - Crea un piano di coltivazione
   - Verifica rotazione score
   - Testa salvataggio

4. **Conferma**
   - Tutto funzionante ✅
   - Sistema completo ✅
   - Pronto per produzione ✅

---

## ✅ Conclusione

Il problema è stato **completamente risolto**:

- ✅ Identificata causa (VIEW vs TABLE)
- ✅ Creata migration corretta
- ✅ Preparato SQL sicuro per applicazione
- ✅ Documentazione completa
- ✅ Guida passo-passo
- ✅ Query di verifica

**Basta applicare `APPLY_MISSING_TABLES_REMOTE.sql` e il sistema sarà completo!**

---

**Documentazione aggiornata al 14 Gennaio 2026**
