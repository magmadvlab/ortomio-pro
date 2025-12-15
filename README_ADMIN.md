# 🛡️ Guida Admin - OrtoMio

## Creazione Superadmin

### Metodo 1: Script TypeScript (Raccomandato)

```bash
# Imposta variabili d'ambiente (opzionale)
export SUPERADMIN_EMAIL="admin@ortomio.ai"
export SUPERADMIN_PASSWORD="SuperAdmin123!"

# Esegui lo script
npx tsx scripts/create_superadmin.ts
```

### Metodo 2: SQL Diretto

1. **Crea l'utente via Supabase Auth** (via UI o API):
   - Vai su Supabase Studio → Authentication → Users
   - Clicca "Add User"
   - Email: `admin@ortomio.ai`
   - Password: `SuperAdmin123!`

2. **Ottieni l'ID utente**:
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'admin@ortomio.ai';
   ```

3. **Imposta tier e credits**:
   ```sql
   -- Sostituisci USER_ID con l'ID ottenuto sopra
   SELECT set_user_tier('USER_ID', 'PRO_PROFESSIONAL');
   SELECT admin_grant_credits('USER_ID', 999999);
   ```

### Metodo 3: Via Admin Panel

1. Accedi all'app con qualsiasi account
2. Vai su `/app/admin` (disponibile solo in sviluppo locale)
3. Clicca "Set My Tier to PRO"
4. Il tuo account verrà aggiornato a PRO_PROFESSIONAL con 999999 credits

## Funzioni Admin Disponibili

### `set_user_tier(user_id, tier)`
Imposta il tier di un utente.

```sql
SELECT set_user_tier('USER_ID', 'PRO_PROFESSIONAL');
-- Tier disponibili: 'FREE', 'PRO_CONSUMER', 'PRO_PROFESSIONAL'
```

### `admin_grant_credits(user_id, amount)`
Concede credits a un utente.

```sql
SELECT admin_grant_credits('USER_ID', 100);
```

### `list_all_users()`
Lista tutti gli utenti con i loro tier e credits.

```sql
SELECT * FROM list_all_users();
```

## Accesso Admin Panel

L'Admin Panel è disponibile solo in sviluppo locale:
- URL: `http://localhost:3000/app/admin`
- Appare automaticamente nel menu sidebar quando sei su `localhost`

## Attivazione PRO per Test

### Metodo Rapido (Sviluppo Locale)

Il sistema forza automaticamente `PRO_PROFESSIONAL` quando:
- Hostname è `localhost` o `127.0.0.1`
- `NODE_ENV === 'development'`

Vedi: `packages/core/context/TierContext.tsx`

### Metodo Manuale

1. **Via Browser Console**:
   ```javascript
   localStorage.setItem('ortomio_tier', 'PRO_PROFESSIONAL');
   location.reload();
   ```

2. **Via Admin Panel**:
   - Vai su `/app/admin`
   - Clicca "Set My Tier to PRO"

3. **Via SQL** (se autenticato):
   ```sql
   SELECT set_user_tier(auth.uid(), 'PRO_PROFESSIONAL');
   ```

## Tier Disponibili

- **FREE**: Versione gratuita con limiti
- **PRO_CONSUMER**: Versione PRO per consumatori (con ricette e guide)
- **PRO_PROFESSIONAL**: Versione PRO per professionisti (con analytics e trattamenti)

## Note di Sicurezza

⚠️ **IMPORTANTE**: 
- Le funzioni admin usano `SECURITY DEFINER` per bypassare RLS
- In produzione, aggiungere controlli aggiuntivi per verificare che l'utente sia effettivamente admin
- Considerare l'aggiunta di una colonna `is_admin` nella tabella `profiles`

## Troubleshooting

### "User not found"
- Assicurati che l'utente esista in `auth.users`
- Verifica che l'ID utente sia corretto

### "Invalid tier"
- Usa solo: `'FREE'`, `'PRO_CONSUMER'`, `'PRO_PROFESSIONAL'`

### Admin Panel non visibile
- Verifica di essere su `localhost` o `127.0.0.1`
- Controlla la console del browser per errori
