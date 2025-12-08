<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/18b-unlSD6G_RJSRANLCVcwAsRd1Gy1No

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure API Key:
   - Copia il file `.env.example` e rinominalo in `.env` (o `.env.local`)
   - Aggiungi la tua chiave API Gemini:
     ```
     VITE_GEMINI_API_KEY=your_api_key_here
     ```
   - Ottieni la chiave API da: https://aistudio.google.com/apikey

3. Run the app:
   ```bash
   npm run dev
   ```

## Note Importanti

- **Variabile d'ambiente**: Assicurati di usare `VITE_GEMINI_API_KEY` (con prefisso `VITE_`) nel file `.env`
- **Funzionalità AI**: Senza la chiave API configurata, le funzionalità AI (suggerimenti piante, diagnosi malattie, analisi immagini) non funzioneranno
- **Geolocalizzazione**: L'app richiede i permessi di geolocalizzazione per fornire suggerimenti personalizzati basati sulla posizione
