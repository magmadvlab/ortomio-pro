# 🎯 Setup Pro - Riepilogo e Soluzione

## ⚠️ Problema Identificato

**Disco completamente pieno (99%)** - Questo impedisce:
- ❌ Installazione Supabase CLI
- ❌ Estrazione immagini Docker
- ❌ Creazione file temporanei

## ✅ Soluzione Raccomandata: Supabase Cloud

**Perché Cloud è la scelta migliore ora:**
- ✅ **Nessun problema spazio disco**
- ✅ **Setup in 5 minuti**
- ✅ **Gratuito fino a 500MB** (più che sufficiente)
- ✅ **Backup automatico**
- ✅ **Accessibile da qualsiasi dispositivo**

## 🚀 Setup Supabase Cloud (5 Minuti)

### Step 1: Crea Account e Progetto
1. Vai su https://supabase.com
2. Clicca **"Start your project"**
3. Accedi (GitHub, Google, o email)
4. Clicca **"New Project"**
5. Compila:
   - Nome: `ortomio-ai-dev`
   - Password database: (salvala!)
   - Region: più vicina
   - Plan: **Free**
6. Clicca **"Create new project"**
7. Attendi 2-3 minuti

### Step 2: Ottieni Credenziali
1. Dashboard → **Settings** (⚙️)
2. **API**
3. Copia:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 3: Esegui Schema Database
1. Dashboard → **SQL Editor**
2. Clicca **"New query"**
3. Apri `database/schema.sql` dalla root
4. Copia tutto il contenuto
5. Incolla in SQL Editor
6. Clicca **"Run"**
7. Verifica tabelle in **Table Editor**

### Step 4: Configura App
Modifica `.env` nella root:

```env
VITE_GEMINI_API_KEY=your_key
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 5: Avvia e Testa
```bash
npm run dev
```

Poi in console browser:
```javascript
localStorage.setItem('ortomio_tier', 'PRO')
location.reload()
```

## 📚 Documentazione Completa

Vedi **`docs/SETUP_SUPABASE_CLOUD.md`** per guida dettagliata passo-passo.

## 🔄 Alternativa: Setup Locale (Dopo aver liberato spazio)

Se in futuro vuoi passare a locale:

1. **Libera spazio disco** (almeno 5GB)
2. **Installa Supabase CLI**:
   ```bash
   brew install supabase/tap/supabase
   ```
3. **Inizializza e avvia**:
   ```bash
   supabase init
   supabase start
   ```

Vedi `docker/SOLUZIONE_SPAZIO_DISCO.md` per dettagli.

## ✅ Checklist Setup Cloud

- [ ] Account Supabase creato
- [ ] Progetto creato
- [ ] Credenziali copiate (URL + anon key)
- [ ] Schema database eseguito
- [ ] `.env` configurato
- [ ] App avviata (`npm run dev`)
- [ ] Tier Pro impostato (localStorage)
- [ ] Funzionalità Pro testate

## 🎯 Prossimi Passi

1. **Crea account Supabase** (5 min)
2. **Esegui schema database** (2 min)
3. **Configura `.env`** (1 min)
4. **Testa app Pro** (5 min)

**Totale: ~15 minuti per setup completo!**

---

**Nota**: Una volta liberato spazio disco, puoi sempre migrare a locale se preferisci. Ma per ora, Cloud è la soluzione più pratica e veloce! 🚀

