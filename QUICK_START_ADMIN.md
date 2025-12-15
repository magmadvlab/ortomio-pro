# 🚀 Quick Start - Configurazione Admin Online

## Email Superadmin

**Non c'è un'email pre-configurata per l'online.** Devi usare la **tua email** quando esegui lo script.

## Setup Rapido (3 passi)

### 1. Crea un account normale

Vai su https://your-app.vercel.app/register e crea un account con la **tua email** (es: `tuonome@email.com`)

### 2. Esegui lo script per impostare PRO

```bash
# Sostituisci con la TUA email
npx tsx scripts/set_superadmin_online.ts tuonome@email.com
```

**Oppure con variabili d'ambiente:**

```bash
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
export SUPERADMIN_EMAIL="tuonome@email.com"

npx tsx scripts/set_superadmin_online.ts
```

### 3. Accedi e usa PRO

1. Vai su https://your-app.vercel.app/login
2. Accedi con la tua email
3. Ora hai accesso a tutte le feature PRO! 🎉

## Esempio Completo

```bash
# 1. Configura variabili (una volta sola)
export NEXT_PUBLIC_SUPABASE_URL="https://abc123.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."

# 2. Crea account normale su Vercel (via browser)
# Email: mario.rossi@gmail.com

# 3. Imposta come superadmin
npx tsx scripts/set_superadmin_online.ts mario.rossi@gmail.com

# Output:
# ✅ Found user: mario.rossi@gmail.com (uuid-1234)
# ✅ Tier set to PRO_PROFESSIONAL
# ✅ Credits set to 999999
# 🎉 Superadmin configured successfully!

# 4. Accedi su Vercel e usa PRO!
```

## Verifica Setup

Dopo aver eseguito lo script:

1. ✅ Accedi con la tua email
2. ✅ Verifica che il badge "PRO Professional" sia visibile
3. ✅ Vai su `/app/admin` - dovresti vedere il pannello admin
4. ✅ Tutte le feature PRO sono disponibili

## Troubleshooting

### "User with email X not found"

**Soluzione**: Assicurati di aver creato l'account prima di eseguire lo script:
1. Vai su `/register`
2. Crea account con quella email
3. Poi esegui lo script

### "Missing Supabase credentials"

**Soluzione**: Configura le variabili d'ambiente:
```bash
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
```

### Script funziona ma tier non si aggiorna

**Soluzione**: 
1. Fai logout e login di nuovo
2. Svuota cache del browser (Cmd+Shift+R)
3. Verifica nel database:
   ```sql
   SELECT tier FROM profiles WHERE id = 'USER_ID';
   ```

## Note Importanti

- ✅ Puoi usare **qualsiasi email** tu voglia
- ✅ Non c'è limite al numero di superadmin
- ✅ Lo script funziona solo se l'account esiste già
- ✅ Il tier viene caricato automaticamente dal database al login
