<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🌱 OrtoMio AI

**OrtoMio** è un'applicazione web intelligente per la gestione dell'orto domestico. Combina intelligenza artificiale (Google Gemini), dati meteorologici in tempo reale, e conoscenze agronomiche tradizionali per offrire un assistente virtuale completo.

## ✨ Funzionalità Principali

- 🌱 **Pianificazione Intelligente**: Suggerimenti stagionali basati su posizione GPS e clima
- 📔 **Diario Completo**: Monitoraggio attività con foto, analisi AI e lifecycle coach
- 🛡️ **Diagnosi e Cura**: Diagnosi problemi tramite descrizione o foto, suggerimenti trattamenti bio
- 🧺 **Raccolti e Ricette**: Registrazione raccolti, analisi economica, ricette AI tradizionali italiane
- 📡 **Smart Hub**: Simulazione sensori IoT per irrigazione intelligente
- 🌙 **Calendario Lunare**: Suggerimenti per semine tradizionali
- 🤝 **Consociazioni**: Piante compatibili e rotazione colture
- 🔄 **Successione Intelligente**: Mai più aiuole vuote
- ✈️ **Modalità Vacanza**: Piano di sopravvivenza per le piante
- 🪨 **Lavori Invernali**: Preparazione strutturata per la stagione successiva

## 📚 Documentazione

- **[OVERVIEW.md](OVERVIEW.md)** - Documento di sintesi: cos'è OrtoMio, funzionalità, vantaggi
- **[USER_MANUAL.md](USER_MANUAL.md)** - Manuale utente completo con guide passo-passo
- **[TECHNICAL_DOCS.md](TECHNICAL_DOCS.md)** - Documentazione tecnica per sviluppatori

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (consigliato 20+)
- **npm** o **yarn**

### Installazione

1. **Clona il repository**:
   ```bash
   git clone https://github.com/magmadvlab/ortomio.git
   cd ortomio
   ```

2. **Installa dipendenze**:
   ```bash
   npm install
   ```

3. **Configura API Key** (opzionale ma consigliato):
   - Crea un file `.env` nella root del progetto
   - Aggiungi la tua chiave API Gemini:
     ```
     VITE_GEMINI_API_KEY=your_api_key_here
     ```
   - Ottieni la chiave API da: https://aistudio.google.com/apikey
   - **Nota**: Senza API Key, alcune funzionalità AI usano dati predefiniti

4. **Avvia l'applicazione**:
   ```bash
   npm run dev
   ```

5. **Apri nel browser**:
   - URL locale: `http://localhost:3000`
   - L'app si aprirà automaticamente

### Build per Produzione

```bash
npm run build
```

I file compilati saranno in `dist/`. Puoi deployare su qualsiasi hosting statico (Vercel, Netlify, GitHub Pages, etc.).

## 🛠️ Stack Tecnologico

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **AI**: Google Gemini 2.5 Flash
- **Meteo**: Open-Meteo API
- **Build**: Vite 6
- **Storage**: LocalStorage (dati salvati localmente nel browser)

## 📋 Note Importanti

- **Variabile d'ambiente**: Usa `VITE_GEMINI_API_KEY` (con prefisso `VITE_`) nel file `.env`
- **Funzionalità AI**: Senza API Key, alcune funzionalità AI non saranno disponibili (suggerimenti personalizzati, analisi foto, ricette)
- **Geolocalizzazione**: L'app richiede permessi GPS per suggerimenti personalizzati basati sulla posizione
- **Dati Locali**: Tutti i dati sono salvati nel browser (LocalStorage). Nessun dato viene inviato a server esterni (tranne API meteo e AI per funzionalità specifiche)

## 🌐 Deployment

### Vercel (Consigliato)

1. Collega il repository GitHub a Vercel
2. Vercel rileva automaticamente Vite
3. Configura Environment Variable: `VITE_GEMINI_API_KEY`
4. Deploy automatico su ogni push

### Altri Hosting

Qualsiasi hosting statico supporta OrtoMio:
- **Netlify**: Collega repository, configura build command `npm run build`
- **GitHub Pages**: Usa GitHub Actions per build e deploy
- **Cloudflare Pages**: Collega repository, auto-deploy
- **AWS S3 + CloudFront**: Upload manuale della cartella `dist/`

## 🤝 Contribuire

Contributi sono benvenuti! Per contribuire:

1. Fork il repository
2. Crea un branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è open source e disponibile sotto licenza MIT.

## 🔗 Link Utili

- **AI Studio**: https://ai.studio/apps/drive/18b-unlSD6G_RJSRANLCVcwAsRd1Gy1No
- **Documentazione Completa**: Vedi cartella root per OVERVIEW.md, USER_MANUAL.md, TECHNICAL_DOCS.md

---

**OrtoMio** - Il tuo assistente intelligente per un orto produttivo e sostenibile 🌱
