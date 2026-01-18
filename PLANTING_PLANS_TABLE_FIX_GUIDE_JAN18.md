# Planting Plans Table Fix - Guida Completa

## Problema Identificato

L'applicazione sta generando errori perché la tabella `planting_plans` non esiste nel database remoto:

```
Error: Could not find the table 'public.planting_plans' in the schema cache
Code: PGRST205
Hint: Perhaps you meant the table 'public.planting_batches'
```

## Causa del Problema

La migrazione `20260114100000_create_planting_plans_table.sql` non è stata applicata al database remoto, causando:

1. **Errori PGRST205** quando l'app cerca di accedere alla tabella
2. **Promise rejection non gestite** nei servizi
3. **Funzionalità planner non disponibili**

## Soluzione Implementata

### 1. Fix SQL Immediato
**File**: `APPLY_PLANTING_PLANS_TABLE_FIX_JAN18.sql`

Questo script:
- ✅ Verifica se la tabella esiste
- ✅ Crea la tabella con struttura completa
- ✅ Aggiunge tutti gli indici necessari
- ✅ Configura RLS policies
- ✅ Crea trigger per updated_at
- ✅ Fornisce feedback dettagliato

### 2. Miglioramento Gestione Errori
**File**: `services/classicPlannerService.ts`

Modifiche applicate:
- ✅ Try-catch completi per tutti i metodi
- ✅ Gestione specifica errore PGRST205
- ✅ Fallback graceful (array vuoto invece di crash)
- ✅ Logging dettagliato per debugging
- ✅ Messaggi utente più chiari

### 3. Test di Verifica
**File**: `test-planting-plans-table-fix.js`

Il test verifica:
- ✅ Esistenza tabella
- ✅ Struttura corretta
- ✅ RLS policies
- ✅ Indici creati
- ✅ Integrazione servizi

## Come Applicare il Fix

### Opzione 1: Supabase Dashboard (Raccomandato)

1. **Accedi a Supabase Dashboard**
   - Vai su https://supabase.com/dashboard
   - Seleziona il progetto OrtoMio

2. **Apri SQL Editor**
   - Clicca su "SQL Editor" nella sidebar
   - Crea una nuova query

3. **Esegui il Fix**
   - Copia il contenuto di `APPLY_PLANTING_PLANS_TABLE_FIX_JAN18.sql`
   - Incolla nell'editor
   - Clicca "Run"

4. **Verifica Risultato**
   - Dovresti vedere: `✅ planting_plans table created successfully`
   - Controlla che non ci siano errori

### Opzione 2: Supabase CLI

```bash
# Se hai Supabase CLI configurato
supabase db push

# Oppure esegui direttamente il file
supabase db execute -f APPLY_PLANTING_PLANS_TABLE_FIX_JAN18.sql
```

### Opzione 3: Migrazione Manuale

Se le opzioni sopra non funzionano:

1. **Controlla migrazioni applicate**:
   ```sql
   SELECT * FROM supabase_migrations.schema_migrations 
   WHERE version LIKE '%planting_plans%';
   ```

2. **Applica migrazione mancante**:
   ```bash
   # Trova la migrazione originale
   supabase db execute -f supabase/migrations/20260114100000_create_planting_plans_table.sql
   ```

## Verifica del Fix

### 1. Test Automatico
```bash
node test-planting-plans-table-fix.js
```

**Output atteso**:
```
🧪 Testing Planting Plans Table Fix...
✅ planting_plans table exists
✅ All expected columns present
✅ Found 4 RLS policies
✅ Service integration works
🎉 Planting Plans Table Test Complete!
```

### 2. Test Manuale nell'App

1. **Vai al Planner**
   - Apri http://localhost:3002/app/planner
   - Non dovrebbero più esserci errori console

2. **Crea un Piano**
   - Prova a creare una nuova pianificazione
   - Dovrebbe salvare senza errori

3. **Visualizza Piani**
   - I piani dovrebbero caricarsi correttamente
   - Nessun errore PGRST205

### 3. Verifica Database

```sql
-- Controlla tabella
SELECT COUNT(*) FROM planting_plans;

-- Controlla struttura
\d planting_plans

-- Controlla policies
SELECT policyname FROM pg_policies 
WHERE tablename = 'planting_plans';
```

## Struttura Tabella Creata

```sql
CREATE TABLE public.planting_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    garden_id UUID NOT NULL REFERENCES public.gardens(id),
    field_row_id UUID REFERENCES public.field_rows(id),
    zone_id UUID REFERENCES public.garden_zones(id),
    
    -- Dati pianificazione
    plant_name VARCHAR(255) NOT NULL,
    plant_variety VARCHAR(255),
    plant_type VARCHAR(100) NOT NULL,
    
    -- Date
    planned_planting_date DATE NOT NULL,
    planned_harvest_date DATE,
    actual_planting_date DATE,
    actual_harvest_date DATE,
    
    -- Quantità e spazio
    quantity INTEGER DEFAULT 1,
    spacing_cm INTEGER,
    area_sqm DECIMAL(10,2),
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'planned',
    growth_stage VARCHAR(50) DEFAULT 'seed',
    
    -- Rotazione
    rotation_plan_id UUID,
    companion_plants TEXT[],
    previous_crop VARCHAR(255),
    
    -- Note
    notes TEXT,
    care_instructions TEXT,
    expected_yield VARCHAR(100),
    
    -- Metadati
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Indici Creati

- `idx_planting_plans_user` - Performance query per utente
- `idx_planting_plans_garden` - Performance query per orto
- `idx_planting_plans_field_row` - Performance query per filare
- `idx_planting_plans_zone` - Performance query per zona
- `idx_planting_plans_status` - Filtri per status
- `idx_planting_plans_planned_date` - Ordinamento per data
- `idx_planting_plans_rotation` - Tracking rotazioni

## RLS Policies

- **SELECT**: Utenti vedono solo i propri piani
- **INSERT**: Utenti possono creare solo i propri piani
- **UPDATE**: Utenti possono modificare solo i propri piani
- **DELETE**: Utenti possono eliminare solo i propri piani

## Troubleshooting

### Errore: "relation does not exist"
```sql
-- Verifica schema
SELECT schemaname, tablename FROM pg_tables 
WHERE tablename = 'planting_plans';
```

### Errore: "permission denied"
```sql
-- Verifica RLS
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'planting_plans';
```

### Errore: "foreign key constraint"
```sql
-- Verifica tabelle referenziate
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('gardens', 'field_rows', 'garden_zones');
```

## Benefici del Fix

### Funzionalità Ripristinate
- ✅ **Planner Classico**: Pianificazione coltivazioni
- ✅ **Rotazione Colture**: Tracking automatico rotazioni
- ✅ **Timeline Coltivazioni**: Visualizzazione temporale
- ✅ **Analytics**: Statistiche pianificazioni

### Performance
- ✅ **Indici ottimizzati**: Query veloci
- ✅ **RLS efficiente**: Sicurezza senza overhead
- ✅ **Cache friendly**: Struttura ottimizzata

### Manutenibilità
- ✅ **Gestione errori robusta**: Nessun crash app
- ✅ **Logging dettagliato**: Debug facilitato
- ✅ **Fallback graceful**: UX sempre funzionante

## Prossimi Passi

1. **Applica il fix** seguendo una delle opzioni sopra
2. **Esegui il test** per verificare successo
3. **Testa l'applicazione** per confermare funzionamento
4. **Monitora logs** per eventuali altri errori
5. **Crea piani di test** per validare funzionalità complete

Il fix è stato progettato per essere **idempotente** - può essere eseguito più volte senza problemi.