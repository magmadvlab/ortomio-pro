# 🚀 Quick Start - Report Piante Avanzati

## ⚡ AVVIO RAPIDO

### **1. Installa le Librerie PDF** (Opzionale)

```bash
npm install jspdf jspdf-autotable
```

> **Nota**: Le librerie PDF sono opzionali. Tutti i grafici e il confronto funzionano già senza installarle. Servono solo per l'export PDF.

---

### **2. Avvia l'App**

```bash
npm run dev
```

---

### **3. Accedi alla Pagina**

Apri il browser:
```
http://localhost:3000/reports
```

---

## 🎯 COSA PUOI FARE

### **📊 Tab RIEPILOGO**
- Visualizza KPI principali (resa, qualità, ricavi, ROI)
- Vedi timeline completa operazioni
- Analizza distribuzione costi
- Controlla problemi e soluzioni

### **📈 Tab DETTAGLIATO** (NUOVO!)
- **Grafico Crescita**: Altezza, foglie, salute nel tempo
- **Distribuzione Costi**: Pie chart con categorie
- **Resa Settimanale**: Bar chart produzione
- **Trend Qualità**: Area chart salute pianta
- **Metriche Avanzate**: Efficienza, costi, margini

### **🔄 Tab CONFRONTO** (NUOVO!)
- **Tabella Comparativa**: 3 cicli a confronto
- **Grafici Comparativi**: Resa, qualità, costi, ROI
- **Analisi Miglioramenti**: Cosa è migliorato
- **Aree Ottimizzazione**: Dove migliorare
- **Statistiche Aggregate**: Medie di tutti i cicli

### **🔍 FILTRI AVANZATI** (NUOVO!)
1. Clicca "Filtri" nel header
2. Imposta:
   - Data inizio/fine
   - Qualità minima
   - Tipo operazione
3. Clicca "Applica Filtri"
4. La timeline si aggiorna

### **📄 EXPORT PDF** (NUOVO!)
- Clicca "Esporta PDF" nel header
- (Dopo npm install jspdf) Scarica report completo

---

## 🎨 COLTURE DISPONIBILI

Clicca per cambiare:
- 🍅 **Pomodoro San Marzano** (60 giorni, ROI +182%)
- 🥬 **Lattuga Romana** (60 giorni, ROI +140%)

---

## 📊 GRAFICI INTERATTIVI

Tutti i grafici hanno:
- ✅ Tooltip su hover (passa il mouse)
- ✅ Legenda cliccabile
- ✅ Responsive (mobile/tablet/desktop)
- ✅ Colori professionali

---

## 💡 TIPS

### **Per Vedere Dati Reali**:
1. Registra operazioni nel sistema
2. Aggiungi lavorazioni, irrigazioni, trattamenti
3. Registra raccolti con quantità e qualità
4. Torna su `/reports` per vedere i tuoi dati

### **Per Confrontare Cicli**:
1. Completa un ciclo colturale
2. Inizia un nuovo ciclo della stessa coltura
3. Vai su tab "Confronto"
4. Analizza differenze e miglioramenti

### **Per Filtrare Operazioni**:
1. Apri "Filtri"
2. Seleziona tipo operazione (es. solo Irrigazioni)
3. Applica
4. Vedi solo le operazioni filtrate

---

## 🐛 TROUBLESHOOTING

### **Grafici non si vedono?**
- Verifica che Recharts sia installato: `npm list recharts`
- Riavvia il server: `Ctrl+C` poi `npm run dev`

### **Export PDF non funziona?**
- Installa le librerie: `npm install jspdf jspdf-autotable`
- Riavvia il server

### **Filtri non funzionano?**
- Clicca "Reset Filtri" e riprova
- Verifica che ci siano operazioni da filtrare

---

## 📚 DOCUMENTAZIONE COMPLETA

Per dettagli tecnici completi:
- `PLANT_REPORTS_ADVANCED_FEATURES_COMPLETE.md`

---

## ✅ CHECKLIST RAPIDA

- [ ] Installato jsPDF (opzionale)
- [ ] Avviato `npm run dev`
- [ ] Aperto `http://localhost:3000/reports`
- [ ] Esplorato tab "Dettagliato"
- [ ] Esplorato tab "Confronto"
- [ ] Provato i filtri
- [ ] Cambiato coltura (Pomodoro/Lattuga)

---

**Tutto pronto! Buon lavoro! 🚀**
