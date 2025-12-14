# 🔧 Soluzione Problema Spazio Disco

## ⚠️ Problema Identificato

**Disco pieno al 99%** - Questo impedisce:
- Installazione Supabase CLI
- Estrazione immagini Docker
- Funzionamento corretto di Docker

## 🚀 Soluzioni

### Opzione 1: Libera Spazio Disco (Raccomandato)

#### 1. Pulisci Cache Homebrew
```bash
brew cleanup --prune=all
```

#### 2. Pulisci Cache Docker
```bash
export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
docker system prune -a --volumes -f
```

#### 3. Pulisci Cache npm
```bash
cd /Users/magma/Downloads/ortomio-main
npm cache clean --force
```

#### 4. Rimuovi node_modules e reinstalla (se necessario)
```bash
cd /Users/magma/Downloads/ortomio-main
rm -rf node_modules
npm install
```

#### 5. Verifica spazio liberato
```bash
df -h /
```

### Opzione 2: Usa Supabase Cloud (Gratuito) - PIÙ SEMPLICE

Invece di Supabase locale, usa Supabase Cloud (gratuito fino a 500MB):

1. **Crea account Supabase**
   - Vai su https://supabase.com
   - Crea account gratuito
   - Crea nuovo progetto

2. **Ottieni credenziali**
   - Settings → API
   - Copia `URL` e `anon public` key

3. **Configura `.env`**
   ```env
   VITE_GEMINI_API_KEY=your_key
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Esegui schema database**
   - Vai su Supabase Dashboard → SQL Editor
   - Copia contenuto di `database/schema.sql`
   - Esegui lo script

5. **Avvia app**
   ```bash
   npm run dev
   ```

**Vantaggi:**
- ✅ Nessun problema spazio disco
- ✅ Setup in 5 minuti
- ✅ Gratuito fino a 500MB
- ✅ Backup automatico
- ✅ Accessibile da qualsiasi dispositivo

### Opzione 3: Usa Docker con Immagini Minime

Se preferisci locale, dopo aver liberato spazio:

1. **Libera spazio** (vedi Opzione 1)
2. **Installa Supabase CLI** (più leggero di docker-compose)
   ```bash
   brew install supabase/tap/supabase
   ```
3. **Inizializza e avvia**
   ```bash
   cd /Users/magma/Downloads/ortomio-main
   supabase init
   supabase start
   ```

## 📊 Verifica Spazio

```bash
# Spazio totale e utilizzato
df -h /

# Spazio utilizzato da directory specifiche
du -sh ~/Library/Caches
du -sh ~/.docker
du -sh ~/Downloads
```

## 💡 Raccomandazione

**Per test rapidi**: Usa **Supabase Cloud** (Opzione 2)
- Setup immediato
- Nessun problema spazio
- Funziona subito

**Per sviluppo locale**: Libera spazio e usa **Supabase CLI** (Opzione 3)

## 🎯 Prossimi Passi

1. **Scegli opzione** (Cloud o Locale)
2. **Libera spazio** se necessario
3. **Configura Supabase** (Cloud o CLI)
4. **Esegui schema database**
5. **Configura `.env`**
6. **Testa app Pro**

