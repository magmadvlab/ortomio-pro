# 🚀 Test Versione PRO - Istruzioni Immediate

## ✅ Stato Attuale

- ✅ **Database schema applicato**: 12 tabelle (incluso custom_plans, agronomists, etc.)
- ✅ **Docker Supabase**: Container in esecuzione
- ⚠️ **.env**: Da configurare manualmente

---

## 📋 Step 1: Configura .env

Apri il file `.env` nella root e aggiungi queste righe:

```env
# Supabase Locale (per test PRO)
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

**Oppure esegui:**
```bash
cd /Users/magma/Downloads/ortomio-main
cat >> .env << 'EOF'

# Supabase Locale (per test PRO)
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
EOF
```

---

## 📋 Step 2: Avvia App

```bash
cd /Users/magma/Downloads/ortomio-main
npm run dev
```

Apri: **http://localhost:5173**

---

## 📋 Step 3: Imposta Tier PRO

1. Apri **Console Browser** (F12)
2. Esegui:
```javascript
localStorage.setItem('ortomio_tier', 'PRO');
location.reload();
```

---

## 📋 Step 4: Test Funzionalità

### Test 1: Verifica Badge PRO
- Dashboard dovrebbe mostrare badge "PRO" in alto
- Nessun limit indicator visibile

### Test 2: Crea Orto
1. Dashboard → "+ Nuovo Orto"
2. Nome: "Test PRO"
3. Salva
4. **Verifica in Supabase Studio**: http://localhost:3000 → Table Editor → `gardens`
5. Dovresti vedere "Test PRO"

### Test 3: Fragole Basilicata
1. **Planner** → Cerca "CANDONGA"
2. Dovresti vedere "FRAGOLA CANDONGA"
3. Seleziona → Aggiungi
4. **Verifica**: Task creato con `strawberry_data`

### Test 4: Frutta Esotica
1. **Planner** → Cerca "PAPAYA" o "MANGO"
2. Dovresti vedere le varietà esotiche
3. Seleziona → Aggiungi
4. **Verifica**: Task creato con `exotic_fruit_data`

### Test 5: Verifica Supabase Studio
1. Apri: **http://localhost:3000**
2. Table Editor → `garden_tasks`
3. Clicca su un task
4. Verifica campi JSONB: `strawberry_data`, `exotic_fruit_data`, etc.

---

## 🔍 Verifica Console Browser

Apri Console (F12) e verifica:
- ✅ Nessun errore rosso
- ✅ Nessun "Supabase credentials not configured"
- ✅ Dati salvati correttamente

---

## 🐛 Troubleshooting

### "Supabase credentials not configured"
- Verifica `.env` contiene `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- Riavvia server: `npm run dev`

### "Error loading initial data"
- Verifica Docker: `docker compose ps` (tutti healthy?)
- Attendi 30 secondi dopo avvio Docker
- Verifica API: `curl http://localhost:8000/rest/v1/`

### Container "Restarting"
- Normale al primo avvio
- Attendi 1-2 minuti
- Verifica: `docker compose logs postgres` (ultime righe)

---

## ✅ Checklist Test

- [ ] .env configurato con variabili Supabase
- [ ] App avviata (`npm run dev`)
- [ ] Tier impostato a PRO (localStorage)
- [ ] Badge "PRO" visibile
- [ ] Creato orto → salvato in Supabase
- [ ] Creato task → salvato in Supabase
- [ ] Fragole Basilicata disponibili
- [ ] Frutta esotica disponibili
- [ ] Verificato in Supabase Studio
- [ ] Nessun errore in console

---

**Pronto per test!** 🎉




















