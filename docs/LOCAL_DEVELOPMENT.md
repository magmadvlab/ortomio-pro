# Sviluppo Locale - Guida Completa

Questa guida spiega come configurare e utilizzare l'ambiente di sviluppo locale con bypass dell'autenticazione.

## Bypass Autenticazione

Per facilitare lo sviluppo e il testing locale, è possibile attivare un sistema di bypass completo dell'autenticazione Supabase. Quando attivo, l'app funziona senza richiedere login e utilizza un mock user con tier PRO.

### Attivazione

1. **Aggiungi la variabile d'ambiente** al file `.env.local`:
   ```bash
   NEXT_PUBLIC_BYPASS_AUTH=true
   ```

2. **Verifica che l'app sia in esecuzione su localhost**:
   - L'app deve essere accessibile su `http://localhost:3000` o `http://127.0.0.1:3000`
   - Il bypass si attiva automaticamente quando:
     - `NEXT_PUBLIC_BYPASS_AUTH=true` è impostato
     - L'app è in esecuzione su localhost/127.0.0.1
     - `NODE_ENV=development` (default in sviluppo)

### Comportamento con Bypass Attivo

Quando il bypass è attivo:

- **Autenticazione**: 
  - Viene creato automaticamente un mock user con tier PRO
  - Non è necessario fare login
  - La pagina di login reindirizza automaticamente all'app

- **Storage**:
  - Tutti i dati vengono salvati in `localStorage`
  - Non viene utilizzato Supabase Storage
  - I dati sono persistenti solo nel browser locale

- **Tier**:
  - Tier PRO forzato automaticamente
  - Tutte le funzionalità PRO sono accessibili
  - Nessun limite di crediti o funzionalità

- **Sincronizzazione**:
  - I dati NON vengono sincronizzati con Supabase
  - I dati sono disponibili solo nel browser locale
  - Per testare la sincronizzazione, disattiva il bypass

### Disattivazione

Per disattivare il bypass e tornare all'autenticazione normale:

1. **Rimuovi o commenta** la variabile in `.env.local`:
   ```bash
   # NEXT_PUBLIC_BYPASS_AUTH=true
   ```

2. **Riavvia l'app**:
   ```bash
   npm run dev
   ```

3. **Pulisci il localStorage** (opzionale):
   - Apri DevTools → Application → Local Storage
   - Cancella tutti i dati di `localhost`

### Indicatori Visivi

Quando il bypass è attivo, vedrai:

- **Pagina di Login**: Banner verde con messaggio "🔓 Auth Bypass Attivo"
- **Console Browser**: Messaggio "🔓 Auth Bypass ACTIVE - Running in local development mode without Supabase"
- **Dashboard**: Tutte le funzionalità PRO sono accessibili senza autenticazione

## Configurazione Database Locale

Per testare con database Supabase locale:

1. **Avvia Supabase locale**:
   ```bash
   supabase start
   ```

2. **Applica lo schema**:
   ```bash
   # Applica lo schema completo
   supabase db reset
   
   # Oppure applica migration specifiche
   supabase migration up
   ```

3. **Configura le variabili d'ambiente** in `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<chiave_anon_da_supabase_status>
   ```

4. **Disattiva il bypass** per testare con Supabase:
   ```bash
   # NEXT_PUBLIC_BYPASS_AUTH=true  # Commenta questa riga
   ```

## Testing

### Test con Bypass Attivo

1. Avvia l'app con bypass attivo
2. Verifica che:
   - Non sia richiesto login
   - Tutte le funzionalità PRO siano accessibili
   - I dati vengano salvati in localStorage
   - Non ci siano errori di autenticazione

### Test con Autenticazione Normale

1. Disattiva il bypass
2. Avvia Supabase locale
3. Registra un nuovo account
4. Verifica che:
   - Il login funzioni correttamente
   - I dati vengano sincronizzati con Supabase
   - Le funzionalità siano limitate dal tier dell'utente

## Risoluzione Problemi

### Il bypass non si attiva

- Verifica che `NEXT_PUBLIC_BYPASS_AUTH=true` sia nel file `.env.local`
- Verifica che l'app sia in esecuzione su localhost
- Riavvia il server di sviluppo (`npm run dev`)

### Errori durante il login normale

Se hai problemi con il login quando il bypass è disattivato:

1. **Verifica che Supabase sia avviato**:
   ```bash
   supabase status
   ```

2. **Applica le correzioni del database**:
   ```bash
   # Applica la migration per correggere problemi di login
   supabase db reset
   # Oppure applica solo la migration specifica
   psql -h localhost -p 54322 -U postgres -d postgres -f database/migrations/fix_login_schema_error_v2.sql
   ```

3. **Verifica i log di Supabase**:
   ```bash
   supabase logs
   ```

### Dati persi dopo disattivazione bypass

I dati salvati in localStorage durante il bypass NON vengono sincronizzati automaticamente con Supabase. Per migrare i dati:

1. Esporta i dati da localStorage (DevTools → Application → Local Storage)
2. Crea un account Supabase
3. Importa manualmente i dati tramite l'interfaccia dell'app

## Note Importanti

- ⚠️ **Il bypass è attivo SOLO in sviluppo locale**
- ⚠️ **In produzione, il bypass è sempre disattivato** (anche se la variabile è impostata)
- ⚠️ **I dati in localStorage NON vengono sincronizzati** quando il bypass è attivo
- ⚠️ **Usa il bypass solo per sviluppo e testing locale**

## File Coinvolti

- `lib/auth-bypass.ts` - Logica di rilevamento e mock user
- `packages/core/hooks/useAuth.tsx` - Hook autenticazione con supporto bypass
- `packages/core/context/StorageContext.tsx` - Context storage con supporto bypass
- `app/(auth)/login/page.tsx` - Pagina login con bypass automatico
- `app/(dashboard)/layout.tsx` - Layout dashboard già configurato per locale

## Comandi Utili

```bash
# Avvia app con bypass (se configurato)
npm run dev

# Avvia Supabase locale
supabase start

# Reset database locale
supabase db reset

# Applica migration specifica
supabase migration up

# Verifica status Supabase
supabase status

# Logs Supabase
supabase logs
```

