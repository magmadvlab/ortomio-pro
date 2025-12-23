# Come Applicare le Nuove Migrazioni (16, 17, 18)

Questa guida spiega come applicare manualmente le nuove migrazioni create per il miglioramento del sistema semina e lifecycle tracking.

## File da Applicare

Le nuove migrazioni sono:
- **16_improve_seed_inventory_quantity.sql** - Migliora banca dei semi
- **17_add_sowing_details_to_tasks.sql** - Tracking dettagliato semina
- **18_add_task_scheduling_fields.sql** - Schedulizzazione task

## Metodo: Supabase SQL Editor (Consigliato)

### Step 1: Accedi a Supabase

1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Seleziona il tuo progetto
3. Vai su **SQL Editor** (menu laterale sinistro)

### Step 2: Backup (IMPORTANTE)

Prima di applicare qualsiasi migrazione:

1. Vai su **Database** → **Backups**
2. Clicca **"Create backup"** o verifica che i backup automatici siano attivi
3. Annota la data/ora del backup

### Step 3: Applica Migrazione 16

1. Nel SQL Editor, clicca **"New query"**
2. Apri il file `database/migrations_online/16_improve_seed_inventory_quantity.sql`
3. **Copia tutto il contenuto** del file
4. **Incolla** nel SQL Editor
5. Clicca **"Run"** o premi `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
6. Attendi il completamento
7. Verifica che non ci siano errori (dovresti vedere messaggi `RAISE NOTICE` nel log)

**Verifica**:
```sql
-- Verifica che le colonne siano state aggiunte
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'seed_inventory'
AND column_name IN ('quantity_display', 'quantity_min', 'quantity_max', 'quantity_exact');
```

Dovresti vedere 4 colonne.

### Step 4: Applica Migrazione 17

1. Crea una nuova query nel SQL Editor
2. Apri il file `database/migrations_online/17_add_sowing_details_to_tasks.sql`
3. Copia tutto il contenuto
4. Incolla nel SQL Editor
5. Esegui (`Ctrl+Enter` / `Cmd+Enter`)
6. Verifica che non ci siano errori

**Verifica**:
```sql
-- Verifica che la colonna sia stata aggiunta
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'garden_tasks'
AND column_name = 'sowing_details';

-- Verifica che l'indice sia stato creato
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'garden_tasks' 
AND indexname = 'idx_garden_tasks_sowing_details';
```

### Step 5: Applica Migrazione 18

1. Crea una nuova query nel SQL Editor
2. Apri il file `database/migrations_online/18_add_task_scheduling_fields.sql`
3. Copia tutto il contenuto
4. Incolla nel SQL Editor
5. Esegui (`Ctrl+Enter` / `Cmd+Enter`)
6. Verifica che non ci siano errori

**Verifica**:
```sql
-- Verifica che le colonne siano state aggiunte
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'garden_tasks'
AND column_name IN ('scheduled_date', 'scheduling_type', 'recurrence_pattern');

-- Verifica che gli indici siano stati creati
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'garden_tasks' 
AND indexname IN ('idx_garden_tasks_scheduled_date', 'idx_garden_tasks_scheduling_type');
```

## Verifica Finale Completa

Dopo aver applicato tutte e tre le migrazioni, esegui questa query per verificare:

```sql
-- Verifica tutte le nuove colonne
SELECT 
  'seed_inventory' as table_name,
  array_agg(column_name ORDER BY column_name) as new_columns
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'seed_inventory'
AND column_name IN ('quantity_display', 'quantity_min', 'quantity_max', 'quantity_exact')

UNION ALL

SELECT 
  'garden_tasks' as table_name,
  array_agg(column_name ORDER BY column_name) as new_columns
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'garden_tasks'
AND column_name IN ('sowing_details', 'scheduled_date', 'scheduling_type', 'recurrence_pattern');
```

Dovresti vedere:
- `seed_inventory`: 4 colonne nuove
- `garden_tasks`: 4 colonne nuove

## Troubleshooting

### Errore: "column already exists"

**Causa**: La colonna esiste già nel database.

**Soluzione**: 
- Le migrazioni usano `IF NOT EXISTS`, quindi questo errore non dovrebbe verificarsi
- Se si verifica, significa che la migrazione è già stata applicata
- Verifica con la query sopra per confermare

### Errore: "relation does not exist"

**Causa**: La tabella non esiste ancora.

**Soluzione**: 
- Assicurati di aver applicato prima `01_core_schema.sql`
- Verifica che le tabelle esistano:
  ```sql
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('seed_inventory', 'garden_tasks');
  ```

### Errore: "permission denied"

**Causa**: Permessi insufficienti.

**Soluzione**: 
- Verifica di essere loggato come admin/superadmin
- Controlla i permessi del tuo utente in Supabase

## Note Importanti

1. **Ordine**: Le migrazioni possono essere applicate in qualsiasi ordine (sono indipendenti), ma è consigliato seguire l'ordine numerico (16, 17, 18)

2. **Idempotenza**: Le migrazioni sono idempotenti (usano `IF NOT EXISTS`), quindi puoi eseguirle più volte senza problemi

3. **Dati Esistenti**: 
   - La migrazione 16 migra automaticamente i dati esistenti da `initial_quantity` a `quantity_exact` e `quantity_display`
   - Le migrazioni 17 e 18 aggiungono solo nuove colonne (non modificano dati esistenti)

4. **Performance**: Le nuove colonne sono opzionali e non impattano le query esistenti

## Dopo l'Applicazione

Dopo aver applicato le migrazioni:

1. ✅ Verifica che l'applicazione funzioni correttamente
2. ✅ Testa la banca dei semi con quantità flessibili (es. "10-1000")
3. ✅ Testa la creazione di task di semina con dettagli germinazione
4. ✅ Testa la schedulizzazione di task futuri

## Supporto

Se riscontri problemi:
1. Controlla i log di Supabase: Dashboard → Logs → Postgres Logs
2. Verifica che tutte le colonne siano state create correttamente
3. Controlla che non ci siano errori nella console del browser quando usi l'applicazione

