# 🐳 Verifica e Avvio Docker Desktop

## ⚠️ Problema

Supabase CLI richiede Docker Desktop completamente avviato, ma il daemon non risponde ancora.

## ✅ Soluzione

### Step 1: Verifica Docker Desktop

1. **Apri Docker Desktop**
   - Vai su **Applications** → **Docker**
   - Oppure cerca "Docker" in Spotlight (Cmd+Space)

2. **Verifica Stato**
   - Icona Docker nella barra menu (in alto a destra)
   - **Verde** = Docker è pronto ✅
   - **Gialla/Rossa** = ancora in avvio ⏳
   - **Assente** = Docker non avviato ❌

3. **Se icona non è verde:**
   - Attendi 30-60 secondi
   - Docker Desktop mostra progresso durante avvio
   - Quando icona diventa verde, Docker è pronto

### Step 2: Verifica da Terminale

Apri un terminale e verifica:

```bash
# Verifica che Docker risponda
docker ps

# Se funziona, vedrai una lista (anche vuota)
# Se non funziona, vedrai errore di connessione
```

### Step 3: Avvia Supabase

Una volta che Docker Desktop è verde e `docker ps` funziona:

```bash
cd /Users/magma/Downloads/ortomio-main
export PATH="/opt/homebrew/bin:$PATH"
supabase start
```

Questo:
- Scaricherà le immagini Docker necessarie (~2GB)
- Avvierà tutti i servizi Supabase
- Richiederà 2-5 minuti la prima volta

### Step 4: Verifica Credenziali

Dopo `supabase start`, esegui:

```bash
supabase status
```

Questo mostrerà:
- **API URL**: `http://localhost:54321`
- **Studio URL**: `http://localhost:54323`
- **DB URL**: `postgresql://postgres:postgres@localhost:54322/postgres`
- **anon key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🔧 Troubleshooting

### Docker Desktop non si avvia
- Riavvia Docker Desktop: **Docker** → **Quit Docker Desktop**, poi riavvia
- Verifica risorse sistema (RAM, spazio disco)
- Riavvia Mac se necessario

### `docker ps` non funziona
- Attendi che Docker Desktop finisca di avviarsi (icona verde)
- Riavvia Docker Desktop
- Verifica che Docker Desktop sia completamente avviato (non solo l'app aperta)

### `supabase start` fallisce
- Verifica che `docker ps` funzioni prima
- Attendi che Docker Desktop sia completamente avviato
- Verifica spazio disco (serve almeno 5GB liberi)

## 📝 Prossimi Passi

Una volta che `supabase start` funziona:

1. **Copia credenziali** da `supabase status`
2. **Configura `.env`** nella root con:
   ```env
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_ANON_KEY=<anon_key_da_supabase_status>
   ```
3. **Esegui schema database** (vedi prossima sezione)
4. **Avvia app**: `npm run dev`
5. **Imposta tier Pro**: `localStorage.setItem('ortomio_tier', 'PRO')`

