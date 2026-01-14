# 🔧 Guida Applicazione Migrations al Database Remoto

**Data:** 14 Gennaio 2026  
**Problema:** Errore "ALTER action ADD COLUMN cannot be performed on relation individual_plants" perché è una VIEW

---

## ❌ Problema Identificato

### Errore
```
ERROR: 42809: ALTER action ADD COLUMN cannot be performed on relation "individual_plants"
DETAIL: This operation is not supported for views.
```

### Causa
La migration `20260111000000_integrate_plant_row_tracking.sql` cerca di fare:
```sql
ALTER TABLE individual_plants ADD COLUMN ...
```

Ma `individual_plants` è una **VIEW**, non una tabella! La tabella reale è `garden_plants`.

---

## ✅ Soluzione

### Opzione 1: SQL Editor Supabase (CONSIGLIATO)

1. **Vai su Supabase Dashboard**
   - https://supabase.com/dashboard
   - Seleziona il progetto: `qhmujoivfxftlrcrluaj`

2. **Apri SQL Editor**
   - Menu laterale → SQL Editor
   - Click su "New query"

3. **Copia e Incolla il SQL**
   - Apri il file `APPLY_MISSING_TABLES_REMOTE.sql`
   - Copia tutto il contenuto
   - Incolla nell'editor SQL

4. **Esegui**
   - Click su "Run" o `Ctrl+Enter`
   - Attendi il completamento
   - Verifica il messaggio di successo

### Opzione 2: Supabase CLI

Se hai Supabase CLI installato:

```bash
# Applica la migration corretta
supabase db execute -f supabase/migrations/20260114110000_fix_individual_plants_row_tracking.sql

# Oppure applica il file completo
supabase db execute -f APPLY_MISSING_TABLES_REMOTE.sql
```

---

## 📋 Cosa Viene Applicato

### 1. Fix Individual Plants Row Tracking
```sql
-- Modifica garden_plants (tabella reale)
ALTER TABLE garden_plants ADD COLUMN garden_row_id UUID;
ALTER TABLE garden_plants ADD COLUMN field_row_id UUID;

-- Ricrea la view individual_plants
DROP VIEW individual_plants CASCADE;
CREATE VIEW individual_plants AS SELECT * FROM garden_plants;
```

### 2. Tabella planting_plans
```sql
CREATE TABLE planting_plans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  garden_id UUID REFERENCES gardens,
  field_row_id UUID REFERENCES field_rows,
  field_row_section_id UUID REFERENCES field_row_sections,
  
  crop_name TEXT NOT NULL,
  variety TEXT,
  plant_family TEXT,
  
  rotation_score INTEGER,
  rotation_warnings TEXT[],
  
  planned_sowing_date DATE,
  planned_harvest_date DATE,
  
  status TEXT DEFAULT 'planned',
  
  ai_suggestions JSONB,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Tabella crop_rotation_history
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
  
  diseases TEXT[],
  pests TEXT[],
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Trigger Auto-tracking
```sql
-- Quando un planting_plan viene marcato come "harvested",
-- crea automaticamente un record in crop_rotation_history
CREATE TRIGGER trigger_auto_track_rotation
  AFTER UPDATE ON planting_plans
  FOR EACH ROW
  EXECUTE FUNCTION auto_track_rotation_on_harvest();
```

---

## 🔐 Sicurezza (RLS)

Tutte le tabelle hanno Row Level Security abilitato:

```sql
-- Solo l'utente proprietario può vedere i suoi dati
CREATE POLICY "Users can view own data"
ON planting_plans FOR SELECT
USING (auth.uid() = user_id);

-- Stesso per INSERT, UPDATE, DELETE
```

---

## ✅ Verifica Applicazione

Dopo aver eseguito il SQL, verifica che tutto sia OK:

### Test 1: Verifica Tabelle
```sql
-- Controlla che le tabelle esistano
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('planting_plans', 'crop_rotation_history')
ORDER BY table_name;

-- Risultato atteso:
-- crop_rotation_history
-- planting_plans
```

### Test 2: Verifica Colonne garden_plants
```sql
-- Controlla che garden_plants abbia le nuove colonne
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'garden_plants'
  AND column_name IN ('garden_row_id', 'field_row_id')
ORDER BY column_name;

-- Risultato atteso:
-- field_row_id    | uuid
-- garden_row_id   | uuid
```

### Test 3: Verifica View individual_plants
```sql
-- Controlla che la view funzioni
SELECT COUNT(*) FROM individual_plants;

-- Dovrebbe funzionare senza errori
```

### Test 4: Verifica RLS
```sql
-- Controlla che RLS sia abilitato
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('planting_plans', 'crop_rotation_history');

-- Risultato atteso: rowsecurity = true per entrambe
```

---

## 🚀 Dopo l'Applicazione

Una volta applicate le migrations, il sistema sarà completo con:

### ✅ Funzionalità Operative
- Classic Planner con rotazione colture
- Tracking automatico storico rotazioni
- Score compatibilità 0-100
- Warnings intelligenti
- Location tracking preciso (zona/filare/porzione)

### ✅ Database Completo
- Tutte le tabelle operative
- RLS configurato
- Indexes ottimizzati
- Triggers automatici

### ✅ Pronto per l'Uso
- Server: http://localhost:3002
- Database: Supabase Remoto
- Tutte le features funzionanti

---

## 📝 Note Importanti

### Migrations da NON Applicare
Queste migrations sono state rinominate in `.skip` perché hanno problemi:

- ❌ `20260111000000_integrate_plant_row_tracking.sql.skip`
  - Cerca di modificare la VIEW individual_plants
  - Sostituita da `20260114110000_fix_individual_plants_row_tracking.sql`

### Migrations Sicure
Usa invece:

- ✅ `APPLY_MISSING_TABLES_REMOTE.sql` (tutto in uno)
- ✅ `20260114110000_fix_individual_plants_row_tracking.sql` (solo fix)

---

## 🆘 Troubleshooting

### Errore: "relation already exists"
```sql
-- Normale se la tabella esiste già
-- Il SQL usa CREATE TABLE IF NOT EXISTS
-- Nessun problema, continua
```

### Errore: "column already exists"
```sql
-- Normale se la colonna esiste già
-- Il SQL controlla prima di aggiungere
-- Nessun problema, continua
```

### Errore: "permission denied"
```sql
-- Verifica di essere loggato come owner del progetto
-- Vai su Supabase Dashboard → Settings → Database
-- Usa le credenziali corrette
```

---

## 📊 Riepilogo

| Componente | Status | Note |
|------------|--------|------|
| Database Remoto | ✅ Connesso | qhmujoivfxftlrcrluaj.supabase.co |
| garden_plants | ✅ Esistente | Tabella reale |
| individual_plants | ✅ View | Punta a garden_plants |
| planting_plans | ⚠️ Da creare | Usa SQL fornito |
| crop_rotation_history | ⚠️ Da creare | Usa SQL fornito |
| Row tracking | ⚠️ Da aggiungere | Modifica garden_plants |

---

## ✅ Checklist Applicazione

- [ ] Apri Supabase Dashboard
- [ ] Vai su SQL Editor
- [ ] Copia contenuto `APPLY_MISSING_TABLES_REMOTE.sql`
- [ ] Incolla nell'editor
- [ ] Esegui (Run)
- [ ] Verifica messaggio successo
- [ ] Testa con query di verifica
- [ ] Riavvia server locale (se necessario)
- [ ] Testa funzionalità Classic Planner

---

**Dopo l'applicazione, il sistema sarà completamente operativo! 🚀**

---

**Documentazione aggiornata al 14 Gennaio 2026**
