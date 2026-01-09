# Sessione Configurazione Database OrtoMio

**Data**: 2026-01-02
**Obiettivo**: Configurare OrtoMio per usare Supabase database invece di localStorage (modalità PRO)

## 🎯 Risultati Ottenuti

✅ **Registrazione Funzionante**
- Utente creato: roberto.lalinga@gmail.com
- Tier: PRO
- Crediti AI: 6 (3 iniziali + 3 bonus benvenuto)

✅ **Orto Creato in Database**
- Nome: "ortodi rob"
- ID: 882629ee-469e-48d9-93c2-ae9fbfd44266
- Salvato correttamente in Supabase

✅ **Sistema di Backup Configurato**
- Script automatici in `scripts/`
- Documentazione in `BACKUP_RESTORE.md`

## 🔧 Problemi Risolti

### 1. Registrazione Fallita
**Errore**: `Database error saving new user - relation "profiles" does not exist`

**Causa**:
- Due setup Supabase in conflitto (vecchio Docker Compose + Supabase CLI)
- Funzioni database senza `SECURITY DEFINER` e `search_path`

**Soluzione**:
```sql
-- Rimosso vecchio Docker Compose
-- Fixate 3 funzioni con permessi corretti:
CREATE OR REPLACE FUNCTION public.grant_credits(...)
SECURITY DEFINER
SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
SECURITY DEFINER
SET search_path = public, auth;

CREATE OR REPLACE FUNCTION public.handle_new_user()
SECURITY DEFINER
SET search_path = public, auth;

-- Garantiti permessi
GRANT ALL ON public.profiles TO supabase_auth_admin;
GRANT ALL ON public.ai_credit_transactions TO supabase_auth_admin;
```

**File**: `/tmp/fix_credits_functions.sql`

### 2. Creazione Orto Fallita - Campo primary_crop
**Errore**: `Could not find the 'primary_crop' column of 'gardens' in the schema cache`

**Causa**: Il codice cercava di inserire `primary_crop` che non esiste nello schema database

**Soluzione**:
```typescript
// SupabaseStorageProvider.ts:899-900
// Commentato mapping primaryCrop
// if (garden.primaryCrop !== undefined) db.primary_crop = garden.primaryCrop;

// SupabaseStorageProvider.ts:865
primaryCrop: undefined, // primary_crop non esiste nello schema database
```

**File**: `packages/storage-cloud/SupabaseStorageProvider.ts`

### 3. Query Tasks Fallita - Tabella garden_tasks
**Errore**: `Could not find the table 'public.garden_tasks' in the schema cache`

**Causa**: Nome tabella errato - esiste `calendar_tasks` non `garden_tasks`

**Soluzione**:
```typescript
// Sostituite tutte le 6 occorrenze:
client.from('garden_tasks') → client.from('calendar_tasks')

// Locations:
// - getTasks() - linea 459
// - getTask() - linea 473
// - createTask() - linea 489
// - updateTask() - linee 539, 546
// - deleteTask() - linea 594
```

**File**: `packages/storage-cloud/SupabaseStorageProvider.ts`

### 4. Ordinamento Tasks Fallito - Campo date
**Errore**: `column calendar_tasks.date does not exist`

**Causa**: La tabella usa `start_date` non `date`

**Soluzione**:
```typescript
// SupabaseStorageProvider.ts
query.order('date', { ascending: false })
  ↓
query.order('start_date', { ascending: false })
```

**File**: `packages/storage-cloud/SupabaseStorageProvider.ts`

### 5. Preferences Non Trovate
**Errore**: `Could not find the 'preferences' column`

**Causa**: Colonna JSONB mancante in tabella profiles

**Soluzione**:
```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

NOTIFY pgrst, 'reload schema';
```

## ⚙️ Configurazione Finale

### .env.local
```env
# MODALITÀ PRO - Connessione Supabase
# NEXT_PUBLIC_BYPASS_AUTH=true  # DISABILITATO

NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54324/postgres
```

### Porte Configurate
- Next.js: **3002**
- Supabase API: **54321**
- Supabase Studio: **54326**
- PostgreSQL: **54324**
- Supabase Studio (old): **54330** (cambiato da 3000)

### Database
- **PostgreSQL**: 17.6.1
- **Supabase CLI**: locale
- **Volume Docker**: `supabase_db_ortomio-main` (persistente)

## ⚠️ Errori Non Critici Rimanenti

Questi errori NON bloccano l'applicazione:

1. **fertilizer_application_logs** (tabella non esiste)
   - Errore in `director.ts:1306`
   - Feature: fertilization auto-scheduling
   - Impatto: Funzionalità di schedulazione concimazione non disponibile

2. **irrigation_systems** (tabella non esiste)
   - Errore in `director.ts:2273`
   - Feature: irrigation tasks calculation
   - Impatto: Funzionalità irrigazione automatica non disponibile

3. **Historical Weather API** (errore esterno)
   - API Open-Meteo rifiuta date future (2026-02-01)
   - Impatto: Dati meteo storici non disponibili

**Nota**: Questi errori non impediscono l'uso dell'app. Le funzionalità base (orti, piante, task manuali) funzionano correttamente.

## 📂 File Modificati

1. `packages/storage-cloud/SupabaseStorageProvider.ts`
   - Rimosso mapping `primary_crop`
   - Cambiato `garden_tasks` → `calendar_tasks` (6 occorrenze)
   - Cambiato `order('date')` → `order('start_date')` (2 occorrenze)

2. `docker/docker-compose.yml` (NON PIÙ USATO)
   - Cambiato Studio port da 3000 a 54330
   - Aggiornato GOTRUE_SITE_URL a localhost:3002

3. `.env.local`
   - Disabilitato BYPASS_AUTH
   - Configurato Supabase connection

## 📝 File Creati

1. **scripts/backup-database.sh** (755)
   - Backup automatico con compressione
   - Retention 30 giorni
   - Location: `~/ortomio-backups/`

2. **scripts/restore-database.sh** (755)
   - Ripristino database da backup
   - Conferma utente richiesta

3. **BACKUP_RESTORE.md**
   - Guida completa backup/restore
   - Comandi e best practices

4. **CONFIGURAZIONE_PORTE.md**
   - Documentazione porte e servizi
   - Health checks e troubleshooting

5. **/tmp/fix_profiles_trigger.sql**
   - Trigger creazione profilo automatico
   - Funzione `handle_new_user()`

6. **/tmp/fix_credits_functions.sql**
   - Fix permessi funzioni database
   - SECURITY DEFINER e search_path

## 🗄️ Modifiche Database

```sql
-- 1. Trigger profili automatici
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Permessi auth admin
GRANT ALL ON public.profiles TO supabase_auth_admin;
GRANT ALL ON public.ai_credit_transactions TO supabase_auth_admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;

-- 3. Campo preferences
ALTER TABLE public.profiles
ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;
```

## ✅ Test Eseguiti

1. ✅ Registrazione nuovo utente
2. ✅ Creazione profilo con tier PRO
3. ✅ Assegnazione crediti AI (6 totali)
4. ✅ Creazione orto "ortodi rob"
5. ✅ Persistenza dati in database
6. ✅ Backup database (36K file creato)
7. ✅ Wizard onboarding completato

## 🚀 Prossimi Passi Opzionali

1. **Creare tabelle mancanti** (se servono):
   - `fertilizer_application_logs`
   - `irrigation_systems`

2. **Configurare backup automatico**:
   ```bash
   crontab -e
   # Aggiungi:
   0 2 * * * /Users/magma/Downloads/ortomio-main/scripts/backup-database.sh
   ```

3. **Configurare Gemini API** (per AI features):
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
   ```

4. **Mappare schema calendar_tasks → GardenTask**:
   - Attualmente incompatibili
   - `calendar_tasks` è semplificato
   - `GardenTask` ha molti campi extra

## 📊 Stato Attuale

- ✅ **Autenticazione**: Funzionante
- ✅ **Database**: Configurato e persistente
- ✅ **Orti**: Creazione e salvataggio OK
- ⚠️ **Tasks**: Schema semplificato (calendar_tasks)
- ⚠️ **Fertilizzazione**: Tabella mancante
- ⚠️ **Irrigazione**: Tabella mancante
- ✅ **Backup**: Sistema configurato

## 🎉 Conclusione

L'applicazione OrtoMio è ora configurata in **modalità PRO** con:
- Database Supabase funzionante
- Autenticazione attiva
- Persistenza dati garantita
- Sistema backup configurato

L'utente può:
- ✅ Registrarsi e fare login
- ✅ Creare orti
- ✅ Salvare dati nel database
- ✅ Avere 6 crediti AI disponibili

---

**Versione**: Next.js 16.0.8
**Database**: PostgreSQL 17.6.1 (Supabase CLI)
**Ultimo aggiornamento**: 2026-01-02
