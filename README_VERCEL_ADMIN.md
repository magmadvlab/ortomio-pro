# 🚀 Guida Admin Online - Vercel/Supabase Cloud

## Setup Superadmin Online

### Prerequisiti

1. **Supabase Cloud configurato**:
   - Progetto Supabase creato su https://supabase.com
   - Credenziali configurate in Vercel Environment Variables

2. **Environment Variables su Vercel**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Per operazioni admin
   ```

### Metodo 1: Script TypeScript (Raccomandato)

```bash
# Imposta le variabili d'ambiente
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Esegui lo script
npx tsx scripts/set_superadmin_online.ts your-email@example.com
```

### Metodo 2: Via Supabase Studio (SQL)

1. **Accedi a Supabase Studio**: https://app.supabase.com
2. Vai su **SQL Editor**
3. Esegui questo SQL (sostituisci l'email):

```sql
-- Trova l'ID utente
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Imposta tier PRO_PROFESSIONAL (sostituisci USER_ID)
UPDATE profiles
SET tier = 'PRO_PROFESSIONAL',
    ai_credits_total = 999999,
    ai_credits_used = 0
WHERE id = 'USER_ID_HERE';

-- Oppure usa la funzione admin
SELECT set_user_tier('USER_ID_HERE', 'PRO_PROFESSIONAL');
SELECT admin_grant_credits('USER_ID_HERE', 999999);
```

### Metodo 3: Via Admin Panel Online

1. **Deploy su Vercel** con le variabili d'ambiente configurate
2. **Crea un account** normale su https://your-app.vercel.app/register
3. **Esegui lo script** per impostare il tier:
   ```bash
   npx tsx scripts/set_superadmin_online.ts your-email@example.com
   ```
4. **Accedi** e vai su `/app/admin`
5. Clicca **"Set My Tier to PRO"** per attivare PRO

## Come Funziona Online

### Caricamento Tier dal Database

Quando un utente è autenticato:
1. Il sistema carica automaticamente il tier dalla tabella `profiles`
2. Se il tier è `PRO_PROFESSIONAL`, l'utente ha accesso a tutte le feature PRO
3. Il tier viene salvato anche in localStorage per accesso offline

### Admin Panel Online

- **URL**: `https://your-app.vercel.app/app/admin`
- **Accesso**: Solo utenti con tier `PRO_PROFESSIONAL`
- **Funzionalità**:
  - Visualizza tutti gli utenti
  - Cambia tier utenti
  - Concede credits
  - Pulsante rapido "Set My Tier to PRO"

### Sicurezza

⚠️ **IMPORTANTE**:
- L'Admin Panel controlla che l'utente sia `PRO_PROFESSIONAL`
- In produzione, considera di aggiungere una colonna `is_admin` per maggiore sicurezza
- Le funzioni SQL usano `SECURITY DEFINER` per bypassare RLS

## Troubleshooting

### "Accesso Negato" nell'Admin Panel

1. Verifica che il tuo tier sia `PRO_PROFESSIONAL`:
   ```sql
   SELECT tier FROM profiles WHERE id = auth.uid();
   ```

2. Se non è PRO_PROFESSIONAL, esegui:
   ```bash
   npx tsx scripts/set_superadmin_online.ts your-email@example.com
   ```

### Tier non si aggiorna dopo login

1. Svuota la cache del browser
2. Fai logout e login di nuovo
3. Verifica che il tier sia corretto nel database:
   ```sql
   SELECT * FROM profiles WHERE id = 'USER_ID';
   ```

### Script fallisce con "Missing Supabase credentials"

Assicurati di avere queste variabili d'ambiente:
```bash
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
```

### Funzioni SQL non disponibili

Se le funzioni admin non esistono, esegui la migrazione:
```sql
-- In Supabase Studio → SQL Editor
-- Copia e incolla il contenuto di database/migrations/create_superadmin.sql
```

## Verifica Setup

Dopo aver configurato il superadmin:

1. ✅ Accedi con l'email configurata
2. ✅ Verifica che il badge "PRO Professional" sia visibile
3. ✅ Vai su `/app/admin` - dovresti vedere il pannello admin
4. ✅ Verifica che tutte le feature PRO siano disponibili

## Prossimi Passi

1. **Deploy su Vercel** con environment variables configurate
2. **Crea account superadmin** usando lo script
3. **Testa tutte le feature PRO** online
4. **Configura Stripe** per pagamenti reali (opzionale)
