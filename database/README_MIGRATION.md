# 🗄️ Guida Applicazione Migration Database

## ⚠️ IMPORTANTE

Le modifiche TypeScript committate richiedono le seguenti tabelle nel database:
- `garden_zones` (zone orto per cultivar diversi)
- `field_rows` (filari con auto-calcolo piante)
- `planting_batches` (produzioni scalari)

**Senza queste tabelle, l'applicazione non funzionerà correttamente.**

---

## 🎯 Migration da Applicare

**File:** `database/migrations/add_field_rows_system.sql`

**Cosa crea:**
1. Tabella `garden_zones` - Zone dell'orto per dividere aree con cultivar diversi
2. Tabella `field_rows` - Filari con calcolo automatico numero piante
3. Tabella `planting_batches` - Batch di semina scalare
4. RLS Policies complete per tutte le tabelle
5. Trigger `update_field_row_plant_count()` per auto-calcolo
6. Helper function `get_field_row_occupancy()`
7. View `scalar_production_timeline`

---

## 🚀 Metodo 1: Supabase Studio (CONSIGLIATO)

### Passo 1: Apri Supabase Studio

```bash
# Assicurati che Supabase locale sia in esecuzione
supabase status

# Apri nel browser
open http://127.0.0.1:54326
```

### Passo 2: SQL Editor

1. Clicca su **SQL Editor** nella sidebar sinistra (icona </>)
2. Clicca su **New Query**

### Passo 3: Copia e Incolla SQL

1. Apri il file `database/migrations/add_field_rows_system.sql`
2. Copia **tutto** il contenuto (337 righe)
3. Incolla nell'editor SQL di Supabase Studio

### Passo 4: Esegui Query

1. Clicca su **RUN** (o premi `Cmd/Ctrl + Enter`)
2. Attendi il completamento
3. Dovresti vedere il messaggio di successo

### Passo 5: Verifica

Vai su **Table Editor** e verifica che esistano:
- ✅ `garden_zones`
- ✅ `field_rows`
- ✅ `planting_batches`

---

## 🔧 Metodo 2: Script Bash

### Prerequisiti

- `psql` installato
- Supabase locale in esecuzione

### Esecuzione

```bash
cd /Users/magma/Downloads/ortomio-main
./database/deploy_field_rows.sh
```

Se ricevi errore di autenticazione, usa il Metodo 1.

---

## 🌐 Applicare su Supabase Remoto

Se hai un progetto Supabase su **supabase.com** (non solo locale):

### Passo 1: Ottieni Database URL

```bash
# Nel dashboard Supabase.com, vai su Settings > Database
# Copia la "Connection string" (Direct connection o Pooler)
```

### Passo 2: Applica Migration

```bash
# Sostituisci con la tua connection string
psql "postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres" \
  -f database/migrations/add_field_rows_system.sql
```

**Oppure** usa Supabase Studio online:
1. Vai su https://app.supabase.com
2. Seleziona il tuo progetto
3. SQL Editor > New Query
4. Copia/incolla il contenuto di `add_field_rows_system.sql`
5. RUN

---

## 🔍 Verifica Successo Migration

### Query di Test

Esegui questa query in SQL Editor per verificare:

```sql
-- Verifica tabelle create
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('garden_zones', 'field_rows', 'planting_batches');

-- Verifica RLS abilitato
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('garden_zones', 'field_rows', 'planting_batches');

-- Verifica trigger
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'auto_calc_field_row_plants';
```

**Output atteso:**
```
table_name
-----------------
garden_zones
field_rows
planting_batches

tablename         | rowsecurity
------------------+-------------
garden_zones      | t
field_rows        | t
planting_batches  | t

trigger_name             | event_manipulation | event_object_table
-------------------------+--------------------+--------------------
auto_calc_field_row_plants | INSERT            | field_rows
auto_calc_field_row_plants | UPDATE            | field_rows
```

---

## 🐛 Troubleshooting

### Errore: "relation gardens does not exist"

**Causa:** Lo schema base non è stato applicato prima della migration.

**Soluzione:**
1. Assicurati che la tabella `gardens` esista
2. Se non esiste, applica prima `database/schema.sql`

### Errore: "password authentication failed"

**Causa:** Credenziali database errate.

**Soluzione:** Usa Supabase Studio (Metodo 1) invece dello script bash.

### Errore: "policy already exists"

**Causa:** Migration già applicata in precedenza.

**Soluzione:**
1. Verifica con le query di test sopra
2. Se le tabelle esistono già, ignora l'errore
3. Se vuoi riapplicare, prima esegui:
```sql
DROP TABLE IF EXISTS planting_batches CASCADE;
DROP TABLE IF EXISTS field_rows CASCADE;
DROP TABLE IF EXISTS garden_zones CASCADE;
```

---

## 📝 Dopo l'Applicazione

Una volta applicata la migration:

1. ✅ Le tabelle sono pronte per l'uso
2. ✅ Il TypeScript commitato funzionerà correttamente
3. ✅ Puoi procedere con lo sviluppo del nuovo wizard

**Prossimo step:** Implementare `GardenWizardV2` e componenti UI per gestire filari.

---

## 📚 File Correlati

- Migration SQL: `database/migrations/add_field_rows_system.sql`
- TypeScript Types: `types/fieldRow.ts`, `types/gardenSpaces.ts`
- Documentazione: `docs/WIZARD_DESIGN_GERARCHICO.md`
- Deploy Script: `database/deploy_field_rows.sh`

---

**Data creazione:** 2025-12-26
**Status:** Migration pronta per l'applicazione
**Priorità:** 🔴 ALTA - Richiesta per funzionamento app
