# Workflow Sviluppo - Database Locale + Online

**Data**: 2026-01-02
**Setup**: Dual database (locale per dev, online per produzione)

---

## 🎯 FILOSOFIA

- **LOCALE**: Sviluppo, test, modifiche, breaking changes OK
- **ONLINE**: Solo codice testato e migrations approvate

---

## 📂 FILE AMBIENTE

### .env.local (LOCALE - default)
Usa questo per sviluppo quotidiano:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=local_anon_key
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54324/postgres
```

### .env.production (ONLINE - per test produzione)
Copia questo in `.env.local` quando vuoi testare online:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=online_anon_key
SUPABASE_SERVICE_ROLE_KEY=online_service_role_key
```

**Templates**: Vedi `.env.local.example` e `.env.production.example`

---

## 🔄 CICLO DI SVILUPPO

### 1. Sviluppo in LOCALE

```bash
# Assicurati di usare .env.local con DB locale
cat .env.local | grep SUPABASE_URL
# Output atteso: http://127.0.0.1:54321

# Avvia Supabase locale (se non già running)
supabase start

# Avvia app
npm run dev
```

**Lavora normalmente**:
- Aggiungi funzionalità
- Modifica database (aggiungi tabelle, colonne, funzioni)
- Testa con utenti fake
- Elimina e ricrea dati quando vuoi

---

### 2. Modifica Database Manualmente

Se modifichi il database con SQL diretto (non migrations):

```sql
-- Esempio: Aggiungi nuova colonna
ALTER TABLE profiles ADD COLUMN new_feature TEXT;
```

**Genera migration dalle modifiche**:
```bash
supabase db diff -f add_new_feature
```

Questo crea: `supabase/migrations/TIMESTAMP_add_new_feature.sql`

---

### 3. Verifica Migration

```bash
# Controlla il file generato
cat supabase/migrations/TIMESTAMP_add_new_feature.sql

# Se OK, committa
git add supabase/migrations/
git commit -m "feat: Add new feature to profiles"
git push
```

---

### 4. Test Locale Completo

```bash
# Reset database locale e riapplica TUTTE le migrations
supabase db reset

# Questo:
# 1. Cancella tutto
# 2. Riapplica tutte le migrations in ordine
# 3. Verifica che le migrations siano corrette

# Testa app
npm run dev
# Registra utente, crea orto, ecc.
```

**Se tutto funziona** → OK per deploy online

---

### 5. Deploy su Database ONLINE

```bash
# Link progetto online (una volta sola)
supabase link --project-ref YOUR_PROJECT_REF

# Push TUTTE le migrations al database online
supabase db push

# Verifica quali migrations sono state applicate
supabase migration list
```

---

### 6. Test Produzione (Opzionale)

```bash
# Backup .env.local attuale
cp .env.local .env.local.backup

# Usa configurazione produzione
cp .env.production .env.local

# Test veloce
npm run dev
# Testa registrazione, creazione orto

# Torna a locale
mv .env.local.backup .env.local

# Riavvia
npm run dev
```

---

## 🛠️ COMANDI UTILI

### Database Locale

```bash
# Avvia Supabase locale
supabase start

# Ferma Supabase locale
supabase stop

# Status
supabase status

# Reset completo (ATTENZIONE: cancella dati)
supabase db reset

# Accesso SQL diretto
psql "postgresql://postgres:postgres@127.0.0.1:54324/postgres"

# Backup locale
./scripts/backup-database.sh
```

### Migrations

```bash
# Genera migration dalle modifiche
supabase db diff -f nome_migration

# Lista migrations
ls -la supabase/migrations/

# Verifica quali sono applicate online
supabase migration list

# Applica migrations a database online
supabase db push
```

### Switch Ambiente

```bash
# Vai a LOCALE
cp .env.local.example .env.local
npm run dev

# Vai a ONLINE
cp .env.production .env.local
npm run dev

# Verifica quale ambiente stai usando
cat .env.local | grep SUPABASE_URL
```

---

## 📋 CHECKLIST DEPLOY

Prima di fare `supabase db push`:

- [ ] Testato tutto in locale
- [ ] Migration generata e committata
- [ ] `supabase db reset` funziona senza errori
- [ ] App funziona con DB resetted
- [ ] Codice TypeScript compatibile con nuovo schema
- [ ] Backup database online fatto (se contiene dati importanti)

---

## ⚠️ REGOLE IMPORTANTI

### ❌ NON FARE

1. **Non modificare direttamente database online** (usa sempre migrations)
2. **Non testare codice non stabile online**
3. **Non cancellare migrations già pushate online**
4. **Non fare `supabase db reset` su online** (cancella tutto!)

### ✅ FARE

1. **Sempre sviluppa in locale prima**
2. **Genera migration per ogni modifica schema**
3. **Testa `db reset` prima di pushare**
4. **Committa migrations prima di pushare**
5. **Backup database online prima di deploy importanti**

---

## 🔍 VERIFICA ALLINEAMENTO

### Schema Locale vs Online

```bash
# Genera diff tra locale e online
supabase db diff

# Se vuoto: perfettamente sincronizzati ✅
# Se mostra SQL: ci sono differenze ⚠️
```

### Migration Status

```bash
# Lista migrations applicate online
supabase migration list

# Output:
# ✓ 20260102000000_fix_database_schema_pro_mode.sql
# ✓ 20260102010000_align_task_table_schema.sql
# ⚠ 20260102020000_new_feature.sql  ← non ancora applicata
```

---

## 🆘 TROUBLESHOOTING

### "Migration already applied"

```bash
# Migration già applicata online, non serve rifare push
supabase migration list
```

### "Schema mismatch"

```bash
# Genera migration dalle differenze
supabase db diff -f fix_mismatch

# Verifica il file
cat supabase/migrations/*fix_mismatch.sql

# Push
supabase db push
```

### "Lost connection to database"

```bash
# Supabase locale non running
supabase start

# Verifica
supabase status
```

---

## 📊 STATO ATTUALE

### Database LOCALE
- ✅ Tabella: `garden_tasks` (non calendar_tasks)
- ✅ Colonna: `date` (non start_date)
- ✅ Funzioni SECURITY DEFINER
- ✅ Trigger `on_auth_user_created`
- ✅ Schema completo 33+ tabelle

### Database ONLINE
- ✅ Tabella: `garden_tasks`
- ✅ Colonna: `date`
- ✅ Funzioni SECURITY DEFINER
- ✅ Trigger `on_auth_user_created`
- ✅ Schema completo 33+ tabelle

**Status**: ✅ ALLINEATI

---

## 🎯 NEXT STEPS

1. **Sviluppa in locale** con utenti fake
2. **Testa tutto** fino a quando funziona perfettamente
3. **Genera migrations** quando modifichi schema
4. **Push online** solo quando tutto è stabile
5. **Test finale** online con un utente di prova
6. **Deploy frontend** quando tutto è OK

---

**Ultimo aggiornamento**: 2026-01-02
**Ambiente corrente**: LOCALE (sviluppo)
