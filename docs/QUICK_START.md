# Quick Start Guide - OrtoMio AI

## 🚀 Setup in 5 Minuti

### 1. Clona e Installa

```bash
git clone https://github.com/tuo-username/ortomio-ai.git
cd ortomio-ai
npm install
```

### 2. Configura API Key

Crea file `.env` nella root:
```env
VITE_GEMINI_API_KEY=your_key_here
```

**Ottieni la chiave**: https://aistudio.google.com/apikey

### 3. Avvia

```bash
npm run dev
```

Apri http://localhost:3000

✅ **Fatto!** L'app è pronta.

## 📱 Deploy su Vercel (2 minuti)

1. **Push su GitHub**
   ```bash
   git push origin main
   ```

2. **Vai su vercel.com → New Project**

3. **Importa repository**

4. **Aggiungi `VITE_GEMINI_API_KEY` in Environment Variables**

5. **Deploy!**

✅ **Fatto!** L'app è live.

> 📖 **Dettagli**: Vedi [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) per guida completa.

## ✅ Checklist Pre-Deploy

- [ ] `.env` configurato (non committato!)
- [ ] `VITE_GEMINI_API_KEY` valida
- [ ] Build locale funziona: `npm run build`
- [ ] Test su localhost: `npm run dev`
- [ ] Variabili ambiente configurate su Vercel

## 🆘 Problemi Comuni

### "API Key non configurata"
**Soluzione**: Verifica che `.env` esista e contenga `VITE_GEMINI_API_KEY`

### "Build fails"
**Soluzione**: 
- Verifica Node.js 18+: `node --version`
- Reinstalla: `rm -rf node_modules && npm install`

### "App bianca su Vercel"
**Soluzione**: 
- Controlla variabili ambiente in Vercel Dashboard
- Verifica che inizino con `VITE_`
- Controlla log build in Vercel

### "Funzionalità AI non funzionano"
**Soluzione**:
- Verifica che `VITE_GEMINI_API_KEY` sia valida
- Controlla console browser (F12) per errori
- Verifica che la chiave non abbia raggiunto limiti di rate

## 📚 Prossimi Passi

- [Architettura](ARCHITECTURE.md) - Capire come funziona
- [Deployment](DEPLOYMENT.md) - Setup Supabase (Pro)
- [Migrazione](MIGRATION_GUIDE.md) - Passare da Free a Pro

## 🔗 Link Utili

- **API Key Gemini**: https://aistudio.google.com/apikey
- **Supabase**: https://supabase.com
- **Vercel**: https://vercel.com
- **Documentazione Vite**: https://vitejs.dev

---

**Hai bisogno di aiuto?** Apri una issue su GitHub!

