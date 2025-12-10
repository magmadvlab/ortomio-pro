<div align="center">
<img width="1200" height="475" alt="OrtoMio AI Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# OrtoMio AI - Assistente Agronomico Intelligente

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple)](https://vitejs.dev)

## 🌱 Panoramica

OrtoMio AI è un assistente agronomico completo per giardinieri italiani che combina intelligenza artificiale (Google Gemini) con motori logici agronomici avanzati per fornire consigli personalizzati su:

- **Pianificazione Orto**: Calendario semina, rotazioni, consociazioni
- **Gestione Ciclo Vitale**: Dalla semina al raccolto con timeline automatiche
- **Nutrizione Intelligente**: Calcolo fabbisogni NPK basato su fase crescita e tipo terreno
- **Prevenzione Malattie**: Diagnosi AI da foto e trattamenti biologici
- **Gestione Seedling**: Tracking completo semenzai con fasi nursery e hardening
- **Fertirrigazione**: Calcolo dosaggi e tempistiche ottimali
- **Pianificazione Annuale**: Piano completo con rotazioni automatiche e proiezioni resa

### Versione Free vs Pro

**Free (localStorage)**
- ✅ Funziona senza configurazione Supabase
- ✅ Limiti: 1 orto, 50 task, 20 semi
- ✅ Funzionalità base: pianificazione, journal, suggerimenti AI

**Pro (Supabase)**
- ✅ Nessun limite
- ✅ Sincronizzazione cloud
- ✅ Time-lapse foto
- ✅ Analytics avanzate
- ✅ Meteo avanzato
- ✅ Colture specializzate (fragole, frutti, erbe, olivi, viti)

## 🚀 Quick Start

### Prerequisiti

- **Node.js** 18+ ([Download](https://nodejs.org))
- **npm** o **yarn**
- **Account Google AI Studio** (per API key Gemini) - [Ottieni API Key](https://aistudio.google.com/apikey)
- **Account Supabase** (opzionale, solo per versione Pro) - [Crea Account](https://supabase.com)

### Installazione Locale

1. **Clona il repository**
   ```bash
   git clone https://github.com/tuo-username/ortomio-ai.git
   cd ortomio-ai
   ```

2. **Installa dipendenze**
   ```bash
   npm install
   ```

3. **Configura variabili ambiente**
   
   Crea un file `.env` nella root del progetto:
   ```env
   # Obbligatorio per funzionalità AI
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   
   # Opzionale - Solo per versione Pro (Supabase)
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   **Ottieni la chiave Gemini:**
   - Vai su https://aistudio.google.com/apikey
   - Crea una nuova API key
   - Copiala nel file `.env`

4. **Avvia l'applicazione**
   ```bash
   npm run dev
   ```
   
   L'app sarà disponibile su `http://localhost:3000`

> 💡 **Suggerimento**: Vedi [docs/QUICK_START.md](docs/QUICK_START.md) per una guida ancora più rapida.

## 📦 Deploy su Vercel

### Setup Automatico (Raccomandato)

1. **Connetti il repository GitHub a Vercel**
   - Vai su https://vercel.com
   - Clicca "New Project"
   - Importa il repository GitHub
   - Vercel rileverà automaticamente Vite

2. **Configura variabili ambiente in Vercel**
   
   Vai su **Settings → Environment Variables** e aggiungi:
   ```
   VITE_GEMINI_API_KEY = your_gemini_api_key
   VITE_SUPABASE_URL = your_supabase_url (opzionale)
   VITE_SUPABASE_ANON_KEY = your_supabase_anon_key (opzionale)
   ```

3. **Deploy**
   - Vercel build automaticamente con:
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

> 📖 **Guida Completa**: Vedi [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) per istruzioni dettagliate.

## 🔧 Configurazione

### Variabili Ambiente

| Variabile | Obbligatorio | Descrizione |
|-----------|--------------|-------------|
| `VITE_GEMINI_API_KEY` | ✅ Sì | API key per Google Gemini AI |
| `VITE_SUPABASE_URL` | ❌ No | URL progetto Supabase (solo Pro) |
| `VITE_SUPABASE_ANON_KEY` | ❌ No | Anon key Supabase (solo Pro) |

**Nota**: Tutte le variabili devono iniziare con `VITE_` per essere accessibili in Vite.

### Setup Supabase (Solo Pro)

1. Crea progetto su [supabase.com](https://supabase.com)
2. Vai a Settings → API
3. Copia `URL` e `anon key`
4. Esegui schema database: `database/schema.sql` in SQL Editor
5. Configura variabili ambiente (vedi sopra)

Vedi [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) per dettagli completi.

## 📚 Documentazione

- **[Quick Start Guide](docs/QUICK_START.md)** - Setup in 5 minuti
- **[Architettura del Sistema](docs/ARCHITECTURE.md)** - Panoramica tecnica completa
- **[Guida Deployment](docs/DEPLOYMENT.md)** - Setup Supabase e deploy
- **[Deploy Vercel](docs/VERCEL_DEPLOYMENT.md)** - Guida dettagliata Vercel
- **[Guida Migrazione](docs/MIGRATION_GUIDE.md)** - Migrazione dati Free → Pro

## 🛠️ Scripts Disponibili

```bash
npm run dev      # Avvia server sviluppo (localhost:3000)
npm run build    # Build produzione (output: dist/)
npm run preview  # Preview build produzione
```

## 🏗️ Struttura Progetto

```
ortomio-main/
├── components/          # Componenti React UI
│   ├── Dashboard.tsx
│   ├── Planner.tsx
│   ├── Journal.tsx
│   └── ...
├── logic/              # Motori logici agronomici
│   ├── director.ts          # Orchestratore centrale
│   ├── nutrientEngine.ts    # Calcolo NPK
│   ├── healthEngine.ts      # Prevenzione malattie
│   ├── lifecycleEngine.ts  # Gestione fasi crescita
│   └── ...
├── services/           # Servizi (API, storage, etc.)
│   ├── geminiService.ts     # Integrazione Gemini AI
│   ├── weatherService.ts    # Previsioni meteo
│   └── ...
├── packages/           # Core packages
│   ├── core/               # Storage abstraction, tier system
│   ├── storage-local/       # localStorage provider
│   └── storage-cloud/      # Supabase provider
├── data/              # Database statici
│   ├── plantMasterSheets.ts # Database piante
│   ├── diseaseDatabase.ts   # Database malattie
│   └── ...
├── types/             # TypeScript type definitions
├── docs/              # Documentazione
├── database/          # Schema SQL Supabase
└── scripts/           # Script utility
```

## 🔐 Sicurezza

- **API Keys**: Non committare mai il file `.env` nel repository
- **Supabase RLS**: Row Level Security abilitata su tutte le tabelle
- **Validazione**: Input validati sia lato client che server
- **CORS**: Configurato correttamente per API esterne

## 🐛 Troubleshooting

### L'app non si avvia
- Verifica Node.js versione: `node --version` (richiesto 18+)
- Reinstalla dipendenze: `rm -rf node_modules && npm install`
- Controlla errori console browser

### Funzionalità AI non funzionano
- Verifica che `VITE_GEMINI_API_KEY` sia configurata in `.env`
- Controlla console browser per errori API
- Verifica che la chiave API sia valida su https://aistudio.google.com/apikey

### Build fallisce su Vercel
- Verifica che tutte le variabili ambiente siano configurate
- Controlla log build in Vercel Dashboard
- Verifica che `package.json` contenga tutti gli script necessari

### Geolocalizzazione non funziona
- Verifica permessi browser per geolocalizzazione
- Controlla che HTTPS sia abilitato (richiesto per geolocalizzazione in produzione)

## 📝 Note Importanti

- **Geolocalizzazione**: L'app richiede permessi geolocalizzazione per suggerimenti personalizzati
- **Browser Support**: Chrome, Firefox, Safari, Edge (ultime versioni)
- **Mobile**: Responsive design ottimizzato per mobile
- **Storage**: Free usa localStorage (dati locali), Pro usa Supabase (cloud sync)

## 🤝 Contribuire

1. Fork il repository
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

[Specifica la tua licenza]

## 👤 Autore

[Il tuo nome/team]

---

**OrtoMio AI** - Trasforma il tuo orto in un giardino intelligente 🌱✨
