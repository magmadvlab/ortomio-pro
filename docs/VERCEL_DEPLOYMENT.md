# Guida Deploy Vercel - OrtoMio AI

## Prerequisiti

- Repository GitHub configurato

- Account Vercel (gratuito)

- API Key Gemini configurata

## Deploy Automatico (Raccomandato)

### Step 1: Connetti Repository

1. Vai su <https://vercel.com> e accedi

1. Clicca **"Add New Project"**

1. Seleziona **"Import Git Repository"**

1. Autorizza Vercel ad accedere a GitHub

1. Seleziona il repository `ortomio-ai`

### Step 2: Configurazione Build

Vercel dovrebbe rilevare automaticamente:

- **Framework Preset**: Vite

- **Build Command**: `npm run build`

- **Output Directory**: `dist`

- **Install Command**: `npm install`

Se non rileva automaticamente, configura manualmente:

- **Framework Preset**: Other

- **Build Command**: `npm run build`

- **Output Directory**: `dist`

- **Root Directory**: `./` (o lascia vuoto)

### Step 3: Variabili Ambiente

Prima di fare deploy, configura le variabili ambiente:

1. Nella schermata di configurazione, vai a **"Environment Variables"**

1. Aggiungi **SOLO** questa variabile (versione Free):

```text
VITE_GEMINI_API_KEY = your_actual_api_key_here

```text

### ⚠️ IMPORTANTE - Versione Free:

- **NON** configurare `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY`

- L'app userà automaticamente localStorage (versione Free)

- Le funzionalità Pro richiedono Supabase e sono disponibili solo in locale per ora

### Per versione Pro (solo locale):

- Vedi [DOCKER_SUPABASE_SETUP.md](DOCKER_SUPABASE_SETUP.md) per setup locale

- Vedi [DEPLOY_STRATEGY.md](DEPLOY_STRATEGY.md) per strategia Free/Pro

1. Seleziona **"Production"**, **"Preview"**, e **"Development"** per la variabile

### Step 4: Deploy

1. Clicca **"Deploy"**

1. Attendi il build (circa 2-3 minuti)

1. Una volta completato, avrai un URL tipo: `ortomio-ai.vercel.app`

## Deploy Manuale (Vercel CLI)

### Installazione CLI

```bash
npm i -g vercel

```text

### Login

```bash
vercel login

```text

### Deploy

```bash

# Prima volta (setup)

vercel

# Deploy produzione

vercel --prod

```text

### Configura Variabili Ambiente via CLI

```bash
vercel env add VITE_GEMINI_API_KEY

# Inserisci il valore quando richiesto

```text

## Configurazione Avanzata

### File `vercel.json` (Opzionale)

Se hai bisogno di configurazioni custom, crea un file `vercel.json` nella root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}

```text

**Nota**: Vercel rileva automaticamente Vite, quindi `vercel.json` è opzionale. Usalo solo se hai bisogno di configurazioni specifiche.

## Domini Custom

1. Vai su **Settings → Domains** nel progetto Vercel

1. Aggiungi il tuo dominio

1. Segui le istruzioni per configurare DNS:
   - Aggiungi record CNAME o A
   - Attendi propagazione DNS (può richiedere fino a 24h)

1. Vercel configurerà automaticamente HTTPS

## Environment Variables per Branch

Puoi avere variabili diverse per branch diversi:

- **Production**: Variabili per branch `main` (o branch di default)

- **Preview**: Variabili per tutti gli altri branch

- **Development**: Variabili per sviluppo locale

**Best Practice**: Configura almeno `VITE_GEMINI_API_KEY` per tutti e tre gli ambienti.

## Monitoring e Logs

### View Logs

1. Vai su **Deployments** nel dashboard Vercel

1. Clicca su un deployment

1. Vai su **"Functions"** o **"Logs"** per vedere i log

### Analytics

Vercel fornisce analytics gratuite:

- Page views

- Performance metrics

- Geographic distribution

- Real User Monitoring (RUM)

Abilita in **Settings → Analytics**.

## Troubleshooting

### Build Fails

### Errore: "Module not found"

- Verifica che tutte le dipendenze siano in `package.json`

- Controlla che i path degli import siano corretti

- Verifica che non ci siano errori TypeScript: `npm run build` localmente

### Errore: "Environment variable not found"

- Verifica che le variabili inizino con `VITE_`

- Controlla che siano configurate per l'ambiente corretto (Production/Preview)

- Verifica che non ci siano spazi extra nel nome della variabile

### Errore: "Build timeout"

- Aumenta il timeout in `vercel.json`:

  ```json
  {
    "functions": {
      "app/**": {
        "maxDuration": 60
      }
    }
  }
  ```text

- Ottimizza il build rimuovendo dipendenze non necessarie

### Runtime Errors

### App non carica (pagina bianca)

- Controlla console browser (F12)

- Verifica che `index.html` sia nella root di `dist/`

- Controlla che tutti gli asset siano referenziati correttamente

- Verifica che non ci siano errori CORS

### API non funziona

- Verifica che `VITE_GEMINI_API_KEY` sia configurata correttamente

- Controlla console browser per errori API

- Verifica che l'API key sia valida su <https://aistudio.google.com/apikey>

- Controlla che non ci siano limiti di rate sulla API key

### Geolocalizzazione non funziona

- Verifica che l'app sia servita via HTTPS (Vercel lo fa automaticamente)

- Controlla permessi browser per geolocalizzazione

- Verifica che l'utente abbia concesso i permessi

### Performance Issues

### Build lento

- Abilita caching in Vercel (automatico)

- Considera code splitting per componenti grandi

- Rimuovi dipendenze non utilizzate

### App lenta al caricamento

- Abilita compressione (automatica in Vercel)

- Ottimizza immagini

- Usa lazy loading per componenti pesanti

## Best Practices

1. **Non committare `.env`**: Usa sempre variabili ambiente Vercel

1. **Usa Preview Deploys**: Testa su branch prima di merge su main

1. **Monitora Performance**: Usa Vercel Analytics per ottimizzare

1. **Backup**: Mantieni backup del database Supabase se usi Pro

1. **Versioning**: Usa tag Git per versioning delle release

1. **CI/CD**: Vercel fa deploy automatico ad ogni push (configurabile)

## Costi

### Vercel Free Tier include:

- 100GB bandwidth/mese

- Build illimitati

- Deploy preview per ogni PR

- HTTPS automatico

- Analytics base

### Limiti Free:

- 100GB bandwidth/mese

- 100 build hours/mese

- 1 team member

Per la maggior parte dei progetti, il tier gratuito è sufficiente.

**Upgrade a Pro** ($20/mese) se hai bisogno di:

- Più bandwidth

- Più build hours

- Team più grande

- Analytics avanzate

## Supporto

- [Vercel Documentation](<https://vercel.com/docs>

- [Vercel Discord](<https://vercel.com/discord>

- [GitHub Issues](<https://github.com/tuo-username/ortomio-ai/issues>

## Checklist Pre-Deploy

- [ ] Repository GitHub configurato

- [ ] Variabili ambiente configurate in Vercel

- [ ] Build locale funziona: `npm run build`

- [ ] Test su localhost: `npm run dev`

- [ ] `.env` non committato (verifica `.gitignore`)

- [ ] Documentazione aggiornata

## Post-Deploy

- [ ] Verifica che l'app carichi correttamente

- [ ] Testa funzionalità AI (suggerimenti, diagnosi)

- [ ] Verifica geolocalizzazione

- [ ] Testa su mobile

- [ ] Configura dominio custom (opzionale)

- [ ] Abilita analytics (opzionale)

---

**Problemi?** Apri una issue su GitHub o consulta la [documentazione Vercel](<https://vercel.com/docs>.

