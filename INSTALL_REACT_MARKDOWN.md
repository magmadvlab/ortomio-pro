# ⚠️ INSTALLAZIONE REACT-MARKDOWN RICHIESTA

**Data**: 21 Gennaio 2026  
**Priorità**: ALTA  
**Componente**: Pagina Manuale `/app/manual`

---

## 🎯 PROBLEMA

La pagina `/app/manual` richiede il package `react-markdown` per renderizzare i file Markdown del manuale utente.

**Errore atteso se non installato**:
```
Module not found: Can't resolve 'react-markdown'
```

---

## ✅ SOLUZIONE

### **Comando Installazione**
```bash
npm install react-markdown remark-gfm
```

### **Versioni Consigliate**
- `react-markdown`: ^9.0.0 o superiore
- `remark-gfm`: ^4.0.0 o superiore (GitHub Flavored Markdown)

---

## 📦 COSA FANNO QUESTI PACKAGE

### **react-markdown**
- Renderizza Markdown in React components
- Supporto completo sintassi Markdown
- Sicuro (sanitizza HTML)
- Personalizzabile con plugins

### **remark-gfm**
- Aggiunge supporto GitHub Flavored Markdown
- Tabelle
- Task lists
- Strikethrough
- Autolink literals

---

## 🔧 INSTALLAZIONE MANUALE (se npm install fallisce)

### **Opzione 1: Pulire cache npm**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm install react-markdown remark-gfm
```

### **Opzione 2: Usare yarn**
```bash
yarn add react-markdown remark-gfm
```

### **Opzione 3: Usare pnpm**
```bash
pnpm add react-markdown remark-gfm
```

---

## 📝 AGGIORNAMENTO PACKAGE.JSON

Se preferisci aggiungere manualmente al `package.json`:

```json
{
  "dependencies": {
    "react-markdown": "^9.0.1",
    "remark-gfm": "^4.0.0"
  }
}
```

Poi esegui:
```bash
npm install
```

---

## ✅ VERIFICA INSTALLAZIONE

### **Check Package**
```bash
npm list react-markdown
npm list remark-gfm
```

### **Test Build**
```bash
npm run build
```

Se il build completa senza errori, l'installazione è corretta.

---

## 🚀 DOPO L'INSTALLAZIONE

### **Avvia Dev Server**
```bash
npm run dev
```

### **Testa Pagina Manuale**
1. Apri browser: `http://localhost:3002/app/manual`
2. Verifica sidebar con 32 moduli
3. Click su "Smart Hub Integrato" (modulo 14)
4. Verifica rendering Markdown corretto
5. Testa ricerca moduli

---

## 🐛 TROUBLESHOOTING

### **Errore: Module not found**
```bash
rm -rf .next
npm install react-markdown remark-gfm
npm run dev
```

### **Errore: Type errors**
```bash
npm install --save-dev @types/react-markdown
```

### **Errore: Build fails**
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## 📊 IMPATTO

### **Senza react-markdown**
- ❌ Pagina `/app/manual` non funziona
- ❌ Build fallisce
- ❌ Manuale non accessibile dall'app

### **Con react-markdown**
- ✅ Pagina manuale completamente funzionante
- ✅ 32 moduli accessibili
- ✅ Rendering Markdown perfetto
- ✅ Ricerca e navigazione operative

---

## 🎯 PRIORITÀ

**ALTA** - La pagina manuale è essenziale per:
- Documentazione IoT Tuya (modulo 14)
- Onboarding nuovi utenti
- Supporto self-service
- Riduzione richieste supporto

---

## 📞 SUPPORTO

Se l'installazione continua a fallire:

1. Verifica versione Node.js: `node --version` (richiesto >=22.0.0)
2. Verifica versione npm: `npm --version` (richiesto >=10.0.0)
3. Controlla log errori: `~/.npm/_logs/`
4. Prova con yarn o pnpm come alternativa

---

**STATUS**: ⚠️ **INSTALLAZIONE RICHIESTA**  
**COMANDO**: `npm install react-markdown remark-gfm`  
**VERIFICA**: `npm run build`

