# Setup Schema Professional su Supabase Online

Questa guida spiega come applicare lo schema professional su Supabase Cloud per abilitare tutte le funzionalità PRO.

## 📋 Prerequisiti

1. ✅ Account Supabase Cloud configurato
2. ✅ Credenziali Supabase nel file `.env`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. ✅ Schema base già applicato (`database/schema.sql`)

## 🚀 Passo 1: Applicare Schema Professional

### Opzione A: Via SQL Editor (Consigliato)

1. Accedi al dashboard Supabase: https://app.supabase.com
2. Seleziona il tuo progetto
3. Vai su **SQL Editor** (icona database nella sidebar)
4. Clicca **New Query**
5. Apri il file `database/schema_professional.sql`
6. **Copia tutto il contenuto** del file
7. **Incolla** nel SQL Editor di Supabase
8. Clicca **Run** (o premi Cmd/Ctrl + Enter)
9. Attendi che lo script finisca (dovrebbe dire "Success. No rows returned")

### Opzione B: Via CLI Supabase

```bash
# Se hai Supabase CLI installato
supabase db push --db-url "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" < database/schema_professional.sql
```

## ✅ Passo 2: Verificare Tabelle Create

Nel dashboard Supabase, vai su **Table Editor** e verifica che esistano queste tabelle:

- ✅ `professional_analytics` - Analytics avanzate con ROI
- ✅ `treatment_register` - Registro trattamenti
- ✅ `mechanical_work_register` - Registro lavorazioni meccaniche
- ✅ `crop_mechanical_works` - Mapping coltura-lavorazioni

## 🔐 Passo 3: Configurare Superadmin

Dopo aver fatto login online, esegui lo script per impostare il tier PRO:

```bash
# Sostituisci con la tua email
npx tsx scripts/set_superadmin_online.ts your-email@example.com
```

Oppure usa la variabile d'ambiente:

```bash
export SUPERADMIN_EMAIL="your-email@example.com"
npx tsx scripts/set_superadmin_online.ts
```

Lo script:
- ✅ Trova l'utente per email
- ✅ Imposta `tier: 'PRO'` nella tabella `profiles` (supporta anche legacy 'PRO_PROFESSIONAL')
- ✅ Imposta crediti AI a 999999

**Nota**: Il sistema ora usa 3 tier: FREE, PLUS, PRO. I tier legacy (PRO_CONSUMER, PRO_PROFESSIONAL) sono ancora supportati per retrocompatibilità.

## 🧪 Passo 4: Verificare Funzionalità PRO

Dopo il login online, verifica che:

1. ✅ Il tier sia `PRO` (controlla in `/app/settings`)
2. ✅ Le pagine PRO siano accessibili:
   - `/app/analytics` - Analytics avanzate
   - `/app/treatments` - Registro trattamenti
   - `/app/mechanical-work` - Lavorazioni meccaniche
   - `/app/export` - Export CSV/PDF
3. ✅ Le funzionalità PRO funzionino correttamente

## 🔄 Passo 5: Applicare Migrazioni (Se Necessario)

Se hai già applicato lo schema professional ma mancano alcune colonne o tabelle, applica anche le migrazioni:

1. Vai su **SQL Editor** in Supabase
2. Apri `database/migrations/expand_mechanical_work_types.sql`
3. Copia e incolla nel SQL Editor
4. Esegui lo script

Questa migrazione aggiunge:
- ✅ Colonne `equipment_attachment` e `work_metadata` a `mechanical_work_register`
- ✅ Aggiorna i CHECK constraints per i nuovi tipi di lavorazioni

## 🎯 Fase di Test: Forzare PRO per Tutti

Durante la fase di test, il sistema forza automaticamente `PRO` per tutti gli utenti autenticati online.

Questo è controllato da:
- `NEXT_PUBLIC_FORCE_PRO_TEST=true` (variabile d'ambiente)
- Oppure automaticamente se `NODE_ENV !== 'production'`

Per disabilitare in produzione, rimuovi o imposta:
```env
NEXT_PUBLIC_FORCE_PRO_TEST=false
NODE_ENV=production
```

## 📊 Sistema Tier Aggiornato

Il sistema ora usa **3 tier** invece di 4:

- **FREE**: Funzionalità base limitate
- **PLUS**: Tutte le Pro Features + Consumer Features (ricette, guide, community)
- **PRO**: Tutte le Pro Features + Professional Features (analytics avanzate, treatment register, mechanical work, export CSV/PDF)

I tier legacy (`PRO_CONSUMER`, `PRO_PROFESSIONAL`) sono ancora supportati per retrocompatibilità e vengono automaticamente mappati ai nuovi tier.

## 📝 Note Importanti

1. **RLS (Row Level Security)**: Tutte le tabelle professional hanno RLS abilitato. Gli utenti possono vedere solo i propri dati.

2. **Crop Mechanical Works**: La tabella `crop_mechanical_works` è pubblica (read-only) perché contiene il mapping standard coltura-lavorazioni per tutte le colture.

3. **Dati di Test**: Puoi popolare `crop_mechanical_works` con i dati da `data/cropMechanicalWork.ts` usando uno script di migrazione.

4. **Backup**: Prima di applicare lo schema, fai un backup del database da Supabase Dashboard → Settings → Database → Backups.

## 🐛 Troubleshooting

### Errore: "relation already exists"
- Le tabelle esistono già. Lo script usa `CREATE TABLE IF NOT EXISTS`, quindi è sicuro ri-eseguirlo.

### Errore: "permission denied"
- Verifica di avere i permessi corretti nel progetto Supabase.
- Usa la Service Role Key per operazioni admin.

### Errore: "column does not exist"
- Applica prima `database/schema.sql` (schema base).
- Poi applica `database/schema_professional.sql`.

### Tier non si aggiorna dopo login
- Verifica che il profilo esista nella tabella `profiles`.
- Controlla la console del browser per errori.
- Esegui manualmente: `npx tsx scripts/set_superadmin_online.ts your-email@example.com`

## ✅ Checklist Finale

- [ ] Schema professional applicato su Supabase
- [ ] Tabelle verificate nel Table Editor
- [ ] Superadmin configurato con script
- [ ] Login effettuato e tier verificato
- [ ] Funzionalità PRO testate
- [ ] Migrazioni applicate (se necessario)

## 🎉 Completato!

Ora hai tutte le funzionalità PRO disponibili su Supabase Cloud. Puoi testare tutte le feature professional durante la fase di sviluppo.

