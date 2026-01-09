# Guida Rapida Deploy SQL su Supabase.com

**Data**: 2026-01-02
**Tempo stimato**: 5 minuti

---

## 🎯 PROCEDURA RAPIDA

### Step 1: Apri SQL Editor

1. Vai su **https://supabase.com/dashboard**
2. Seleziona il tuo progetto OrtoMio
3. Nel menu laterale, clicca su **SQL Editor**
4. Clicca su **+ New query**

---

### Step 2: Esegui PARTE 1 (Fix Critici)

1. Apri il file: **`DEPLOY_SQL_PARTE_1_CRITICAL_FIXES.sql`**
2. **Copia TUTTO il contenuto** (Cmd+A, Cmd+C)
3. **Incolla** nel SQL Editor su Supabase
4. Clicca su **RUN** (o Cmd+Enter)

**Atteso**:
- ✅ Success
- Nessun errore (o solo warning ignorabili)

---

### Step 3: Esegui PARTE 2 (RLS Policies)

1. Clicca su **+ New query** per creare una nuova query
2. Apri il file: **`DEPLOY_SQL_PARTE_2_RLS_POLICIES.sql`**
3. **Copia TUTTO il contenuto**
4. **Incolla** nel SQL Editor
5. Clicca su **RUN**

**Atteso**:
- ✅ Success
- Policies create/ricreate

---

### Step 4: Esegui PARTE 3 (Verifica)

1. Clicca su **+ New query**
2. Apri il file: **`DEPLOY_SQL_PARTE_3_VERIFICA.sql`**
3. **Copia TUTTO il contenuto**
4. **Incolla** nel SQL Editor
5. Clicca su **RUN**

**Atteso**:
- Multiple result sets
- Tutti i check con ✅ OK
- Se vedi ❌, ricontrolla che Parte 1 e 2 siano state eseguite

---

## ✅ VERIFICA RAPIDA

Dopo aver eseguito tutti e 3 gli script, controlla:

### Opzione A: Da Table Editor

1. **Table Editor** > `profiles`
2. Dovresti vedere colonna **`preferences`** (tipo: jsonb)

3. **Database** > **Triggers**
4. Dovresti vedere trigger **`on_auth_user_created`** su tabella `auth.users`

5. **Database** > **Functions**
6. Dovresti vedere:
   - `grant_credits`
   - `handle_new_user`
   - `handle_new_user_credits`

### Opzione B: Risultati PARTE 3

Controlla output dello script PARTE 3:
- ✅ Tutte le verifiche devono passare
- ✅ RLS policies configurate: ~20+
- ✅ Tabelle principali: 8/8
- ✅ Funzioni SECURITY DEFINER: 3/3
- ✅ Trigger: 1/1

---

## 📝 COSA FANNO GLI SCRIPT

### PARTE 1: Fix Critici
- ✅ Aggiunge colonna `preferences` a `profiles`
- ✅ Crea/aggiorna funzioni con SECURITY DEFINER
- ✅ Crea trigger automatico creazione profili
- ✅ Garantisce permessi a supabase_auth_admin

### PARTE 2: RLS Policies
- ✅ Abilita Row Level Security su tutte le tabelle principali
- ✅ Crea policies per SELECT, INSERT, UPDATE, DELETE
- ✅ Garantisce che ogni utente veda solo i propri dati

### PARTE 3: Verifica
- ✅ Verifica che tutto sia configurato
- ✅ Conta tabelle, trigger, funzioni, policies
- ✅ Fornisce report dettagliato

---

## 🔄 SE QUALCOSA VA STORTO

### "Error: function already exists"
**OK**: Significa che la funzione era già presente, viene sovrascritta

### "Error: policy already exists"
**OK**: Gli script fanno DROP prima di CREATE

### "Error: permission denied"
**Problema**: Devi essere OWNER del progetto Supabase
**Fix**: Verifica di essere loggato con l'account giusto

### "Error: relation does not exist"
**Problema**: Manca una tabella
**Fix**: Devi prima applicare le migration dello schema base
**Soluzione**: Usa `supabase db push` da CLI (vedi ISTRUZIONI_DEPLOY_IMMEDIATO.md)

---

## 🚀 DOPO IL DEPLOY SQL

### 1. Ottieni Credenziali

Su Supabase Dashboard:
1. **Settings** > **API**
2. Copia:
   - **URL**: `https://YOUR_PROJECT_REF.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (clicca Reveal)

### 2. Aggiorna .env.local

```bash
# Backup
cp .env.local .env.local.backup

# Modifica .env.local
nano .env.local
```

Inserisci:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tua_anon_key_qui
SUPABASE_SERVICE_ROLE_KEY=tua_service_role_key_qui
```

### 3. Riavvia App

```bash
# Ferma server (Ctrl+C)
npm run dev
```

### 4. Test

1. Vai su http://localhost:3002
2. Registra nuovo utente
3. Verifica che:
   - ✅ Registrazione funziona
   - ✅ Profilo creato automaticamente
   - ✅ Tier PRO assegnato
   - ✅ 6 crediti AI (controlla su Supabase Dashboard)

---

## 📊 RIEPILOGO FILE

| File | Scopo | Ordine | Obbligatorio |
|------|-------|--------|--------------|
| DEPLOY_SQL_PARTE_1_CRITICAL_FIXES.sql | Fix funzioni e trigger | 1° | ✅ SÌ |
| DEPLOY_SQL_PARTE_2_RLS_POLICIES.sql | Sicurezza dati | 2° | ✅ SÌ |
| DEPLOY_SQL_PARTE_3_VERIFICA.sql | Verifica setup | 3° | ⚠️  Raccomandato |

---

## ⏱️ TIMING

- Parte 1: ~30 secondi
- Parte 2: ~1 minuto
- Parte 3: ~10 secondi (solo lettura)
- **Totale**: ~2 minuti

---

## 🎉 COMPLETATO!

Se tutti gli script sono stati eseguiti con successo:
- ✅ Database online = Database locale
- ✅ Stesso schema
- ✅ Stesse funzioni
- ✅ Stesse policies
- ✅ Pronto per produzione

**Prossimo passo**: Test registrazione utente e creazione orto!

---

**Ultimo aggiornamento**: 2026-01-02
**Versione**: OrtoMio PRO - Database Schema v2
