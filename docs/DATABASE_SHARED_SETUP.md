# 📊 Configurazione Database Condiviso - Locale e Produzione

## ✅ Sì, possono usare lo stesso database!

Sia l'applicazione locale che quella su Vercel possono connettersi allo stesso database Supabase Cloud.

## 🏗️ Architettura

```
┌─────────────────────────┐
│  APP LOCALE             │
│  (localhost:3002)       │──┐
└─────────────────────────┘  │
                              ├──> SUPABASE CLOUD
┌─────────────────────────┐  │    (database online)
│  APP VERCEL             │──┘    https://xxx.supabase.co
│  (online)               │
└─────────────────────────┘
```

## 🔧 Configurazione

### 1. Ottieni Credenziali Supabase Cloud

1. Vai su https://supabase.com/dashboard
2. Seleziona il tuo progetto (o creane uno nuovo)
3. Vai su **Settings** → **API**
4. Copia:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 2. Configura App Locale

Modifica il file `.env` nella root del progetto:

```env
# Supabase Cloud (condiviso con produzione)
NEXT_PUBLIC_SUPABASE_URL=https://tuo-progetto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tua-chiave-anon-cloud

# Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyDF1nX_pVSmFYWYNBkXziRMX-l9wybOvuA
```

### 3. Configura Vercel

1. Vai su Vercel Dashboard → Il tuo progetto
2. Vai su **Settings** → **Environment Variables**
3. Aggiungi le variabili:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://tuo-progetto.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `tua-chiave-anon-cloud`
   - `NEXT_PUBLIC_GEMINI_API_KEY` = `tua-chiave-gemini`

4. Seleziona gli ambienti (Production, Preview, Development)
5. Clicca **Save**

### 4. Applica Schema su Supabase Cloud

1. Vai su Supabase Dashboard → **SQL Editor**
2. Crea una nuova query
3. Apri il file `database/schema_complete.sql`
4. Copia tutto il contenuto
5. Incolla nel SQL Editor
6. Clicca **Run**
7. Verifica che tutte le tabelle siano state create

### 5. Imposta Superadmin su Cloud

1. Nel SQL Editor di Supabase Cloud
2. Esegui lo script `scripts/set_superadmin_direct.sql`
3. Oppure usa:
   ```sql
   UPDATE profiles 
   SET tier = 'PRO', ai_credits_total = 999999
   WHERE id = (SELECT id FROM auth.users WHERE email = 'roberto.lalinga@gmail.com');
   ```

## ⚠️ Considerazioni Importanti

### ✅ Vantaggi Database Condiviso

- **Dati sincronizzati**: Modifiche locali e produzione vedono gli stessi dati
- **Test realistici**: Puoi testare con dati di produzione
- **Un solo database**: Più semplice da gestire
- **Sviluppo rapido**: Nessuna sincronizzazione manuale

### ⚠️ Svantaggi e Attenzioni

- **Rischio produzione**: Modifiche locali influenzano anche produzione
- **Dati di test**: I dati di test locali appaiono anche in produzione
- **Concorrenza**: Più sviluppatori possono interferire tra loro

## 💡 Best Practices

### Per Sviluppo

**Opzione A: Database Separati (Raccomandato)**
- Locale → Supabase locale (`localhost:54324`)
- Vercel → Supabase Cloud
- ✅ Sviluppo completamente isolato
- ✅ Nessun rischio per produzione

**Opzione B: Database Condiviso (Per test)**
- Locale → Supabase Cloud
- Vercel → Supabase Cloud
- ✅ Test con dati reali
- ⚠️ Usa con cautela

### Per Produzione

- Usa sempre Supabase Cloud per produzione
- Configura RLS policies correttamente
- Usa variabili ambiente diverse per ogni ambiente se necessario

## 🔄 Switching tra Locale e Cloud

Se vuoi passare da database locale a cloud (o viceversa):

1. **Modifica `.env`**:
   ```env
   # Per database locale:
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   
   # Per database cloud:
   NEXT_PUBLIC_SUPABASE_URL=https://tuo-progetto.supabase.co
   ```

2. **Riavvia l'app**: `npm run dev`

3. **Verifica**: Controlla che i dati siano quelli attesi

## 📝 Checklist Setup Database Condiviso

- [ ] Credenziali Supabase Cloud ottenute
- [ ] `.env` configurato con URL cloud
- [ ] Variabili ambiente Vercel configurate
- [ ] Schema applicato su Supabase Cloud
- [ ] Superadmin configurato
- [ ] Test di connessione da locale
- [ ] Test di connessione da Vercel
- [ ] RLS policies verificate

## 🆘 Troubleshooting

### App locale non si connette a Cloud

1. Verifica `.env` contiene URL corretto
2. Verifica che Supabase Cloud sia attivo
3. Controlla che l'anon key sia corretta
4. Riavvia l'app: `npm run dev`

### App Vercel non si connette

1. Verifica variabili ambiente in Vercel Dashboard
2. Assicurati che siano impostate per l'ambiente corretto
3. Riavvia il deployment su Vercel
4. Controlla i log di Vercel per errori

### Dati non sincronizzati

- Verifica che entrambe le app usino lo stesso URL Supabase
- Controlla che le RLS policies permettano l'accesso
- Verifica che l'utente sia autenticato correttamente

