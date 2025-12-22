# Configurazione Auth Supabase

## Leaked Password Protection

Il Security Advisor segnala che la protezione contro password compromesse è disabilitata.

### Come abilitarla:

1. Vai su **Supabase Dashboard** → **Authentication** → **Settings**
2. Scorri fino a **Password Strength**
3. Abilita **"Enable leaked password protection"**
4. Questa funzione controlla le password contro il database di HaveIBeenPwned.org

### Note:

- Questa è una configurazione del dashboard Supabase, non una migrazione SQL
- Migliora la sicurezza impedendo agli utenti di usare password già compromesse
- Non richiede modifiche al codice dell'applicazione

### Riferimenti:

- [Documentazione Supabase - Password Security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

