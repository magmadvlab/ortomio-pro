# 🔧 Fix Errori Applicati - Guida Completa

## ✅ Modifiche Applicate al Codice

Ho già sistemato questi problemi nel codice:

1. ✅ **Manifest.json 401** - Route configurata come pubblica e statica
2. ✅ **Tabella seedling_batches mancante** - Schema aggiornato
3. ✅ **Hardcoded 'current-user-id'** - AgronomistManager ora usa auth reale
4. ✅ **API credits 401** - Gestione errori migliorata

## 📋 Cosa Devi Fare Ora

### Opzione 1: Supabase Cloud (Vercel/Produzione)

Se stai usando **Supabase Cloud** su Vercel:

#### Step 1: Applica la Migrazione Database

1. **Accedi a Supabase Studio**: https://app.supabase.com
2. Seleziona il tuo progetto
3. Vai su **SQL Editor** (icona SQL nella sidebar)
4. Clicca **"New query"**
5. Apri il file `database/migrations/add_seedling_batches.sql`
6. **Copia tutto il contenuto** e incollalo nell'editor
7. Clicca **"Run"** (o premi Cmd+Enter)
8. Verifica che non ci siano errori

#### Step 2: Verifica Tabella Creata

1. In Supabase Studio, vai su **Table Editor**
2. Cerca la tabella **`seedling_batches`**
3. Verifica che esista e abbia le colonne corrette

#### Step 3: Deploy su Vercel (se necessario)

Se hai fatto modifiche al codice:

```bash
git add .
git commit -m "Fix: Add seedling_batches table and fix auth issues"
git push
```

Vercel farà il deploy automaticamente.

---

### Opzione 2: Supabase Locale (Sviluppo)

Se stai usando **Supabase locale** per sviluppo:

#### Step 1: Verifica Supabase Attivo

```bash
cd /Users/magma/Downloads/ortomio-main
supabase status
```

Dovresti vedere:
```
API URL: http://localhost:54321
Studio URL: http://localhost:54323
```

#### Step 2: Applica Migrazione

**Metodo A: Via Supabase Studio (Raccomandato)**

1. Apri: **http://localhost:54323**
2. Vai su **SQL Editor**
3. Clicca **"New query"**
4. Apri `database/migrations/add_seedling_batches.sql`
5. Copia tutto e incolla
6. Clicca **"Run"**

**Metodo B: Via CLI**

```bash
cd /Users/magma/Downloads/ortomio-main
psql postgresql://postgres:postgres@localhost:54322/postgres < database/migrations/add_seedling_batches.sql
```

#### Step 3: Verifica

In Supabase Studio → Table Editor, verifica che `seedling_batches` esista.

---

## 🔍 Verifica Fix Applicati

### 1. Manifest.json ✅

Il file `app/manifest.json/route.ts` è stato aggiornato con:
- `export const dynamic = 'force-static'` - Route pubblica
- Cache headers configurati correttamente

**Test**: Apri `https://your-app.vercel.app/manifest.json` - dovrebbe funzionare senza 401.

### 2. Tabella seedling_batches ✅

La tabella è stata aggiunta allo schema. Dopo aver applicato la migrazione:

**Test**: 
- Vai su Supabase Studio → Table Editor
- Verifica che `seedling_batches` esista
- Prova a creare un batch semenzai nell'app

### 3. AgronomistManager - User ID ✅

Il componente ora usa `getSupabaseClient().auth.getUser()` invece di `'current-user-id'`.

**Test**:
- Accedi all'app con un account Supabase
- Vai alla sezione Agronomi
- Non dovresti più vedere errori "invalid input syntax for type uuid"

### 4. API Credits 401 ✅

Gli hook `useAICredits` e `AICreditsWidget` ora gestiscono i 401 gracefully.

**Test**:
- Apri la console del browser
- Non dovresti più vedere errori rossi per `/api/credits/status`
- Se non sei autenticato, vedrai credits a 0 invece di errori

---

## 🚨 Troubleshooting

### Errore: "relation seedling_batches does not exist"

**Soluzione**: La migrazione non è stata applicata. Esegui lo Step 1 o Step 2 sopra.

### Errore: "function uuid_generate_v4() does not exist"

**Soluzione**: Abilita l'estensione UUID:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

Poi riprova la migrazione.

### Errore: "policy already exists"

**Soluzione**: La migrazione usa `IF NOT EXISTS`, quindi è sicura. Se vedi questo errore, significa che la tabella esiste già - va bene!

### Manifest.json ancora da 401 su Vercel

**Soluzione**: 
1. Verifica che il deploy sia completato
2. Controlla che non ci siano middleware che bloccano la route
3. Prova a fare un hard refresh (Cmd+Shift+R)

### AgronomistManager ancora usa 'current-user-id'

**Soluzione**: 
1. Verifica che il file `components/AgronomistManager.tsx` sia stato salvato
2. Riavvia il server di sviluppo: `npm run dev`
3. Svuota la cache del browser

---

## 📝 File Modificati

- ✅ `app/manifest.json/route.ts` - Route config pubblica
- ✅ `database/schema.sql` - Aggiunta tabella seedling_batches
- ✅ `database/migrations/add_seedling_batches.sql` - Nuova migrazione
- ✅ `components/AgronomistManager.tsx` - Fix user ID
- ✅ `hooks/useAICredits.ts` - Gestione 401
- ✅ `components/shared/AICreditsWidget.tsx` - Gestione 401

---

## ✅ Checklist Finale

- [ ] Migrazione database applicata (locale o cloud)
- [ ] Tabella `seedling_batches` verificata in Supabase Studio
- [ ] Deploy su Vercel completato (se produzione)
- [ ] Test manifest.json senza 401
- [ ] Test agronomist senza errori UUID
- [ ] Test credits senza errori in console

---

## 🎯 Prossimi Passi

Dopo aver applicato la migrazione:

1. **Testa l'app** - Verifica che tutto funzioni
2. **Crea un batch semenzai** - Testa la nuova funzionalità
3. **Verifica console** - Non dovrebbero esserci più errori 401

Se hai problemi, controlla i log in:
- **Browser Console** (F12)
- **Supabase Studio** → Logs
- **Vercel Dashboard** → Functions Logs

