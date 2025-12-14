# 🚀 Guida Sviluppo OrtoMio AI

## ⚠️ IMPORTANTE: Quale Versione Usare?

### **Versione PRO (Next.js) - RACCOMANDATO per sviluppo**
Questa è la versione completa con tutte le feature Pro implementate.

**Comando:**
```bash
npm run dev
```

**Porta:** `http://localhost:3002`

**Caratteristiche:**
- ✅ Tutte le feature Pro disponibili
- ✅ Sidebar completa con tutti i menu
- ✅ API Routes server-side
- ✅ Sistema Credit AI
- ✅ Tier system completo (FREE / PRO_CONSUMER / PRO_PROFESSIONAL)
- ✅ Dashboard differenziate per tier
- ✅ In locale, automaticamente imposta `PRO_PROFESSIONAL` tier

**Struttura:**
- Entry point: `app/page.tsx` → `app/(dashboard)/app/page.tsx`
- Layout: `app/(dashboard)/layout.tsx`
- API: `app/api/`

---

## 🎯 Setup Sviluppo Locale

### 1. Installa Dipendenze
```bash
npm install
```

### 2. Configura Variabili Ambiente
Crea `.env` nella root:
```env
# Obbligatorio per funzionalità AI
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Opzionale - Solo per versione Pro (Supabase)
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Avvia Versione PRO (Next.js)
```bash
npm run dev
```

Apri: **http://localhost:3002/app/**

### 4. Tier Automatico in Locale
In sviluppo locale, il sistema **automaticamente** imposta:
- Tier: `PRO_PROFESSIONAL` (tier più completo)
- Tutte le feature sbloccate
- Nessun limite

**Non serve configurare manualmente il tier in locale!**

---

## 📁 Struttura Progetto

```
ortomio-main/
├── app/                    # Next.js App Router (VERSIONE PRO)
│   ├── (dashboard)/        # Route protette con sidebar
│   │   ├── layout.tsx     # Layout con TierProvider
│   │   └── app/           # Dashboard principale
│   ├── (marketing)/       # Route pubbliche
│   └── api/               # API Routes server-side
│
├── components/             # Componenti React condivisi
├── logic/                  # Logic Engines
├── services/               # Services
├── packages/               # Core packages
│   ├── core/              # Storage abstraction, tier system
│   ├── storage-local/     # LocalStorage provider
│   └── storage-cloud/     # Supabase provider
│
└── database/               # Schema SQL Supabase
```

---

## 🔧 Comandi Disponibili

### Next.js (PRO)
```bash
npm run dev          # Avvia Next.js dev server (porta 3002)
npm run dev:next     # Stesso di sopra (esplicito)
npm run build        # Build Next.js produzione
npm run build:next   # Stesso di sopra (esplicito)
npm run start:next   # Avvia Next.js production server
```

---

## 🐛 Troubleshooting

### Problema: Porta 3002 già in uso

**Soluzione:**
```bash
# Trova processo che usa porta 3002
lsof -i :3002

# Kill processo (sostituisci PID con il numero trovato)
kill -9 <PID>

# Oppure cambia porta in package.json:
# "dev": "next dev -p 3003"
```

### Problema: Tier non è PRO_PROFESSIONAL in locale

**Verifica:**
1. Apri console browser (F12)
2. Controlla `localStorage.getItem('ortomio_tier')`
3. Dovrebbe essere `PRO_PROFESSIONAL` in locale

**Fix manuale:**
```javascript
// Console browser
localStorage.setItem('ortomio_tier', 'PRO_PROFESSIONAL');
location.reload();
```

### Problema: Menu mancanti

**Soluzione:**
1. Assicurati di usare `npm run dev` (Next.js)
2. Verifica che l'URL sia `http://localhost:3002/app/`
3. Controlla che il tier sia `PRO_PROFESSIONAL` (automatico in locale)

---

## 📝 Note Importanti

1. **Sempre usare `npm run dev`** per sviluppo (Next.js)
2. **Tier PRO_PROFESSIONAL è automatico** in locale (localhost)
3. **Tutti i menu e feature** sono disponibili in versione Next.js
4. **L'app usa Next.js 16** con App Router

---

## ✅ Checklist Setup Corretto

- [ ] Usato `npm run dev` (Next.js)
- [ ] URL: `http://localhost:3002/app/`
- [ ] Tier automaticamente `PRO_PROFESSIONAL` (verifica in console)
- [ ] Sidebar completa visibile
- [ ] Tutti i menu disponibili
- [ ] Nessun errore in console browser

---

**Ultimo aggiornamento:** Gennaio 2025
**Versione attuale:** Next.js (PRO) - **USARE QUESTA**

