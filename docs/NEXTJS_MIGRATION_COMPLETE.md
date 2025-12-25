# Migrazione Next.js Completata

## Riepilogo

La migrazione da Vite a Next.js 15 è stata completata con successo. L'applicazione ora supporta:

- ✅ Next.js 15 con App Router
- ✅ Sistema Credit AI sostenibile
- ✅ Segmentazione Tier: FREE / PRO Consumer / PRO Professional
- ✅ API Routes server-side per sicurezza
- ✅ Dashboard differenziate per Consumer e Professional
- ✅ Componenti UI condivisi e specifici per tier

## Struttura Nuova

```
ortomio-main/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Route pubbliche
│   │   ├── page.tsx              # Homepage
│   │   └── pricing/              # Pricing page
│   ├── (dashboard)/              # Route protette
│   │   ├── layout.tsx            # Layout con sidebar
│   │   └── app/
│   │       ├── page.tsx          # Dashboard (router)
│   │       ├── planner/
│   │       ├── journal/
│   │       ├── harvest/
│   │       └── advice/
│   └── api/                      # API Routes
│       ├── ai/                   # Gemini AI (server-side)
│       ├── credits/              # Credits management
│       ├── analytics/            # Professional analytics
│       ├── treatments/           # Treatment register
│       ├── export/               # CSV/PDF export
│       └── cron/                 # Cron jobs
│
├── components/
│   ├── shared/                   # Componenti condivisi
│   ├── consumer/                 # Componenti PRO Consumer
│   └── professional/             # Componenti PRO Professional
│
├── lib/                          # Utilities server-side
│   ├── auth.ts                   # Autenticazione
│   └── credits.ts                # Credits utilities
│
├── hooks/                         # React hooks
│   └── useAICredits.ts
│
└── database/
    ├── schema_credits.sql        # Schema credits
    └── schema_professional.sql  # Schema professional
```

## Tier System

### FREE
- 1 orto, 50 task, 20 semi
- Wizard consigli pre-generati
- 3 AI credits gratis signup
- Meteo 7 giorni

### PRO Consumer (€9.99/mese)
- Tutto FREE +
- 50 AI credits/mese
- Ricette AI 🍳
- Guide approfondite
- Lifecycle + Nutrient + Health Coach
- Fragole Basilicata + Frutta esotica

### PRO Professional (€29.99/mese)
- Tutto PRO Consumer +
- 200 AI credits/mese
- Analytics avanzate (ROI, resa)
- Registro trattamenti
- Calcolatore NPK preciso
- Export CSV/PDF
- **NO ricette** (per professionisti)

## Sistema Credit AI

### Costi
- Chat: 1 credit
- Ricetta: 1 credit (solo PRO Consumer)
- Diagnosi foto: 3 credits
- Analisi avanzata: 5 credits

### Limiti
- FREE: 3 credits (welcome bonus)
- PRO Consumer: 50 credits/mese (max 200)
- PRO Professional: 200 credits/mese (max 500)

### Reset
Credits si resettano automaticamente il 1° di ogni mese via cron job.

## API Routes

### Credits
- `GET /api/credits/status` - Status credits utente
- `POST /api/credits/deduct` - Deduce credits

### AI
- `POST /api/ai/chat` - Chat AI (1 credit)
- `POST /api/ai/diagnose` - Diagnosi foto (3 credits)
- `POST /api/ai/recipe` - Ricette AI (1 credit, solo PRO Consumer)

### Professional
- `GET /api/analytics/professional` - Analytics avanzate
- `GET /api/treatments` - Lista trattamenti
- `POST /api/treatments` - Nuovo trattamento
- `GET /api/export/csv` - Export CSV
- `GET /api/export/pdf` - Export PDF

### Free Advice
- `POST /api/advice/free` - Consigli pre-generati (gratis)

## Componenti Chiave

### Shared
- `ProFeatureGate` - Gating feature PRO
- `UpgradeCard` - Card upgrade
- `AICreditsWidget` - Widget credits
- `AIRequestModal` - Modal conferma richiesta AI

### Consumer
- `ConsumerDashboard` - Dashboard friendly
- `RecipeCard` - Card ricetta
- `GuideCard` - Card guide
- `ConsumerSidebar` - Sidebar con ricette/guide

### Professional
- `ProfessionalDashboard` - Dashboard diretta
- `AnalyticsTable` - Tabella analytics
- `ROISummary` - Summary ROI
- `TreatmentRegister` - Registro trattamenti
- `NutrientCalculator` - Calcolatore NPK
- `ProfessionalSidebar` - Sidebar minimale

## Database Schema

### Nuove Tabelle
- `profiles` - Tier e credits utente
- `ai_credit_transactions` - Transazioni credits
- `professional_analytics` - Analytics professionali
- `treatment_register` - Registro trattamenti

### Funzioni SQL
- `deduct_credits(user_id, amount)` - Deduce credits
- `grant_credits(user_id, amount)` - Aggiunge credits

### Trigger
- `on_user_created_credits` - Welcome bonus 3 credits

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Gemini AI (server-side)
GEMINI_API_KEY=...

# Stripe
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Vercel Cron
CRON_SECRET=...
```

## Scripts Disponibili

```bash
npm run dev          # Next.js dev server
npm run dev:next     # Next.js dev server (esplicito)
npm run build        # Next.js build
npm run build:next   # Next.js build (esplicito)
npm run start:next   # Next.js production server
```

## Deploy Vercel

1. Connetti repository a Vercel
2. Configura environment variables
3. Build command: `npm run build:next`
4. Output directory: `.next`
5. Cron jobs configurati in `vercel.json`

## Prossimi Passi

1. **Eseguire schema database**: Applicare `schema_credits.sql` e `schema_professional.sql` su Supabase
2. **Generare database AI**: Eseguire `scripts/generateAIDatabase.ts` per generare risposte pre-generate
3. **Configurare Stripe**: Setup account Stripe e webhook
4. **Testare**: Testare tutti i flow (FREE, PRO Consumer, PRO Professional)
5. **Deploy**: Deploy su Vercel

## Note Importanti

- Vite è ancora presente per riferimento (non rimosso)
- Componenti esistenti sono stati wrappati, non riscritti
- Miglioramenti incrementali possono essere fatti gradualmente
- Database pre-generato FREE può essere esteso con più risposte

## Troubleshooting

### Errori Import
Se vedi errori di import, verifica che i path alias `@/*` siano configurati correttamente in `tsconfig.json`.

### API Routes non funzionano
Verifica che le environment variables siano configurate correttamente e che Supabase sia accessibile.

### Credits non si resettano
Verifica che il cron job sia configurato in Vercel e che `CRON_SECRET` sia impostato.



















