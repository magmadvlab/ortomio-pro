# Test Versione PRO - Guida Rapida

## Prerequisiti

1. **Docker Desktop** in esecuzione
2. **Supabase locale** avviato
3. **Variabili ambiente** configurate

---

## Step 1: Verifica Docker Supabase

```bash
cd /Users/magma/Downloads/ortomio-main/docker
/Applications/Docker.app/Contents/Resources/bin/docker compose ps
```

**Dovresti vedere:**
- ✅ `ortomio-postgres` - healthy
- ✅ `ortomio-kong` - healthy (porta 8000)
- ✅ `ortomio-studio` - running (porta 3000)

**Se non sono in esecuzione:**
```bash
cd /Users/magma/Downloads/ortomio-main/docker
/Applications/Docker.app/Contents/Resources/bin/docker compose up -d
```

**Attendi 30 secondi** per l'avvio completo.

---

## Step 2: Verifica Database

```bash
cd /Users/magma/Downloads/ortomio-main/docker
/Applications/Docker.app/Contents/Resources/bin/docker compose exec -T postgres psql -U postgres -c "\dt" 2>&1
```

**Dovresti vedere 8+ tabelle:**
- gardens
- garden_tasks
- garden_beds
- harvest_logs
- photo_logs
- seed_inventory
- weather_cache
- **custom_plans** (nuova)
- **agronomists** (nuova)
- **agronomist_consultations** (nuova)
- **agronomist_advice** (nuova)

**Se le tabelle non ci sono:**
```bash
cd /Users/magma/Downloads/ortomio-main/docker
/Applications/Docker.app/Contents/Resources/bin/docker compose exec -T postgres psql -U postgres -f /docker-entrypoint-initdb.d/schema.sql 2>&1 || \
cat /Users/magma/Downloads/ortomio-main/database/schema.sql | /Applications/Docker.app/Contents/Resources/bin/docker compose exec -T postgres psql -U postgres 2>&1
```

---

## Step 3: Configura Variabili Ambiente

Crea/modifica `.env` nella root del progetto:

```bash
cd /Users/magma/Downloads/ortomio-main
cat > .env << 'EOF'
# API Gemini (opzionale)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Locale (OBBLIGATORIO per PRO)
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
EOF
```

**Verifica:**
```bash
cat .env | grep VITE_SUPABASE
```

---

## Step 4: Avvia App

```bash
cd /Users/magma/Downloads/ortomio-main
npm run dev
```

Apri: **http://localhost:5173**

---

## Step 5: Imposta Tier PRO

1. Apri **Console Browser** (F12)
2. Esegui:
```javascript
localStorage.setItem('ortomio_tier', 'PRO');
location.reload();
```

---

## Step 6: Verifica Funzionalità PRO

### ✅ Test Base

1. **Badge PRO**
   - Dashboard dovrebbe mostrare badge "PRO"
   - Nessun limit indicator visibile

2. **Crea Orto**
   - Dashboard → "+ Nuovo Orto"
   - Crea un orto di test
   - **Verifica in Supabase Studio**: http://localhost:3000 → Table Editor → `gardens`
   - Dovresti vedere l'orto creato

3. **Aggiungi Task**
   - Planner → Cerca una pianta → Aggiungi
   - **Verifica in Supabase Studio**: `garden_tasks`
   - Dovresti vedere il task creato

### ✅ Test Fragole Basilicata

1. **Planner** → Cerca "CANDONGA" o "MATERA"
2. Dovresti vedere:
   - "FRAGOLA CANDONGA"
   - "FRAGOLA MATERA"
3. Seleziona una → Aggiungi
4. Verifica che il task sia creato correttamente

### ✅ Test Piani Personalizzati

1. **Dashboard** → Dovrebbe esserci sezione "Piani Personalizzati" (se implementato in UI)
2. Oppure via Console:
```javascript
// Test creazione custom plan (via storage provider)
const { storageProvider } = window; // Se esposto per debug
// O usa CustomPlanEditor component se integrato in UI
```

### ✅ Test Agronomo di Fiducia

1. **Dashboard** → Dovrebbe esserci sezione "Agronomi" (se implementato in UI)
2. Oppure via Console:
```javascript
// Test creazione agronomo (via storage provider)
```

### ✅ Test Frutta Esotica

1. **Planner** → Cerca "PAPAYA", "MANGO", "AVOCADO"
2. Dovresti vedere le varietà esotiche
3. Seleziona una → Aggiungi
4. Verifica che il task includa `exoticFruitData`

---

## Step 7: Verifica Supabase Studio

Apri: **http://localhost:3000**

### Tabelle da Verificare

1. **gardens** - Dovresti vedere gli orti creati
2. **garden_tasks** - Dovresti vedere i task creati
3. **custom_plans** - Se hai creato piani personalizzati
4. **agronomists** - Se hai registrato agronomi
5. **agronomist_consultations** - Se hai creato consultazioni

### Test Query

```sql
-- Conta gardens
SELECT COUNT(*) FROM gardens;

-- Conta tasks
SELECT COUNT(*) FROM garden_tasks;

-- Vedi ultimi gardens
SELECT id, name, size_sq_meters, created_at 
FROM gardens 
ORDER BY created_at DESC 
LIMIT 5;

-- Vedi task con dati specializzati
SELECT id, plant_name, task_type, 
       strawberry_data, 
       fruit_tree_data, 
       exotic_fruit_data
FROM garden_tasks
WHERE strawberry_data IS NOT NULL 
   OR fruit_tree_data IS NOT NULL
   OR exotic_fruit_data IS NOT NULL
LIMIT 5;
```

---

## Step 8: Test Storage Provider

### Verifica Quale Provider è Attivo

**Console Browser:**
```javascript
// Verifica variabili ambiente
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurato' : 'Non configurato');

// Se entrambi configurati → SupabaseStorageProvider (PRO)
// Se mancanti → LocalStorageProvider (FREE)
```

### Test Operazioni

1. **Crea un orto** → Verifica in Supabase Studio
2. **Modifica orto** → Verifica aggiornamento in Supabase
3. **Elimina orto** → Verifica rimozione in Supabase

---

## Troubleshooting

### Problema: "Supabase credentials not configured"

**Soluzione:**
1. Verifica `.env` esiste e contiene `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
2. Riavvia server: `npm run dev`

### Problema: "Error loading initial data"

**Soluzione:**
1. Verifica Docker Supabase è in esecuzione
2. Verifica API accessibile: `curl http://localhost:8000/rest/v1/`
3. Verifica database schema applicato

### Problema: "RLS policy violation"

**Soluzione:**
Per test locale, puoi temporaneamente disabilitare RLS:
```sql
-- In Supabase Studio → SQL Editor
ALTER TABLE gardens DISABLE ROW LEVEL SECURITY;
ALTER TABLE garden_tasks DISABLE ROW LEVEL SECURITY;
-- ⚠️ Solo per test! Riabilita dopo.
```

### Problema: Tabelle custom_plans/agronomists non esistono

**Soluzione:**
Esegui schema SQL:
```bash
cd /Users/magma/Downloads/ortomio-main/docker
cat ../database/schema.sql | /Applications/Docker.app/Contents/Resources/bin/docker compose exec -T postgres psql -U postgres 2>&1
```

---

## Checklist Test Completo

- [ ] Docker Supabase in esecuzione
- [ ] Database schema applicato (11+ tabelle)
- [ ] `.env` configurato con variabili Supabase
- [ ] App avviata (`npm run dev`)
- [ ] Tier impostato a PRO (localStorage)
- [ ] Badge "PRO" visibile
- [ ] Creato orto → salvato in Supabase
- [ ] Creato task → salvato in Supabase
- [ ] Fragole Basilicata (Candonga/Matera) disponibili
- [ ] Frutta esotica (Papaya/Mango/Avocado) disponibili
- [ ] Verificato in Supabase Studio
- [ ] Nessun errore in console browser
- [ ] Dati persistono dopo reload pagina

---

## Test Rapido (1 minuto)

```bash
# 1. Verifica Docker
cd /Users/magma/Downloads/ortomio-main/docker
/Applications/Docker.app/Contents/Resources/bin/docker compose ps | grep -E "(healthy|running)"

# 2. Verifica .env
cd /Users/magma/Downloads/ortomio-main
grep VITE_SUPABASE .env

# 3. Avvia app
npm run dev

# 4. Nel browser (F12 Console):
localStorage.setItem('ortomio_tier', 'PRO'); location.reload();

# 5. Crea orto e verifica in http://localhost:3000
```

---

**Stato**: ✅ Pronto per test
**Ultimo aggiornamento**: 2025-01-XX









