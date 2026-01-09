# 🔧 Fix Trigger e Set Superadmin Online

## Problema Identificato

Il trigger `handle_new_user_credits()` sulla tabella `auth.users` **non aveva `SECURITY DEFINER`**, causando l'errore "Database error querying schema" durante il login.

## Soluzione

### Step 1: Applica lo Script SQL Online

1. Vai su **Supabase Dashboard** → **SQL Editor**
2. Clicca **New Query**
3. Apri il file: `database/migrations/fix_trigger_and_set_superadmin_online.sql`
4. **Copia tutto il contenuto**
5. **Incolla** nel SQL Editor
6. Clicca **Run**

### Step 2: Verifica Configurazione

Dopo aver eseguito lo script, dovresti vedere:

```
email                        | tier | ai_credits_total | ai_credits_used | credits_remaining | status
-----------------------------+------+------------------+-----------------+--------------------+------------------
roberto.lalinga@gmail.com    | PRO  | 999999           | 0               | 999999             | ✅ SUPERADMIN PRO
```

### Step 3: Test Login

1. Vai su: `https://tuo-dominio.com/login`
2. Email: `roberto.lalinga@gmail.com`
3. Password: `testadmin123@`
4. Dovresti essere loggato come **SUPERADMIN PRO** con accesso completo

## Cosa Fa lo Script

1. **Corregge il trigger** `handle_new_user_credits()` aggiungendo `SECURITY DEFINER SET search_path = ''`
   - Risolve l'errore "Database error querying schema"
   - Permette a Supabase Auth di verificare correttamente lo schema

2. **Crea il profilo** se non esiste per `roberto.lalinga@gmail.com`

3. **Imposta superadmin PRO** con:
   - Tier: `PRO`
   - Crediti totali: `999999` (illimitati)
   - Crediti usati: `0`

4. **Verifica** la configurazione finale

## Note Importanti

- ✅ Il trigger ora ha `SECURITY DEFINER` come richiesto da Supabase
- ✅ L'utente ha accesso completo alla versione PRO
- ✅ I crediti sono illimitati (999999)
- ✅ Lo script è idempotente (può essere eseguito più volte senza problemi)

## Troubleshooting

Se il login ancora non funziona:

1. Verifica che lo script sia stato eseguito correttamente
2. Controlla i log di Supabase Auth per errori specifici
3. Verifica che l'utente esista in `auth.users`:
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'roberto.lalinga@gmail.com';
   ```
4. Verifica che il profilo esista e sia configurato:
   ```sql
   SELECT * FROM profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'roberto.lalinga@gmail.com');
   ```

