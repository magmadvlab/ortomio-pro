# 🚀 Quick Access Guide - Advanced Features

**Guida Rapida per Accedere alle Nuove Funzionalità**

---

## 🍇 VIGNETO

### Accesso: `/app/vineyard`

#### Tab Disponibili:
1. **Panoramica** - Dashboard principale
2. **Gestione Viti** - CRUD viti
3. **Potature** - Gestione potature
4. **Raccolti** - Gestione vendemmie
5. **Calcolo Densità** ⭐ NUOVO
6. **Carico Gemme (Ravaz)** ⭐ NUOVO
7. **Maturazione Uva** ⭐ NUOVO

### Funzionalità Nuove:

#### 🎯 Calcolo Densità Impianto
**Tab:** "Calcolo Densità"  
**Cosa fa:**
- Calcola piante/ha per forma allevamento
- 4 forme vigneto: Guyot, Cordone Speronato, Pergola, Tendone
- Suggerimenti automatici
- Soluzioni alternative

#### 📊 Indice di Ravaz (Carico Gemme)
**Tab:** "Carico Gemme"  
**Cosa fa:**
- Calcola Indice Ravaz (Resa Uva / Peso Legno Potatura)
- Interpretazione automatica (< 5 sotto, 5-10 ottimale, > 10 sovra)
- Raccomandazioni specifiche
- Storico stagioni con trend

#### 🍇 Maturazione Tecnologica
**Tab:** "Maturazione Uva"  
**Cosa fa:**
- Tracking Brix (zuccheri)
- pH e acidità totale
- Calcolo alcol stimato (Brix × 0.6)
- Raccomandazioni vendemmia automatiche
- Trend maturazione

---

## 🫒 OLIVETO

### Accesso: `/app/olives`

#### Tab Disponibili:
1. **Panoramica** - Dashboard principale
2. **Gestione Olivi** - CRUD olivi
3. **Potature** - Gestione potature
4. **Raccolti** - Gestione raccolte
5. **Calcolo Densità** ⭐ NUOVO
6. **Maturazione** ⭐ NUOVO
7. **Mosca Olearia** ⭐ NUOVO

### Funzionalità Nuove:

#### 🎯 Calcolo Densità Impianto
**Tab:** "Calcolo Densità"  
**Cosa fa:**
- Calcola piante/ha per forma allevamento
- 3 forme oliveto: Globo, Vaso Policonico, Monocono
- Suggerimenti automatici
- Soluzioni alternative

#### 🫒 Indici Maturazione Olive
**Tab:** "Maturazione"  
**Cosa fa:**
- Tracking invaiatura % (cambio colore)
- Calcolo automatico Indice Jaén (scala 0-7)
- Stima contenuto olio (%)
- Raccomandazioni raccolta
- Ottimale olio qualità: Indice 2.0-3.5

#### 🪰 Monitoraggio Mosca dell'Olivo
**Tab:** "Mosca Olearia"  
**Cosa fa:**
- Gestione trappole (cromotrop, feromoni, food-bait)
- Tracking catture settimanali
- Calcolo % infestazione
- Soglie intervento automatiche (>2 mosche/settimana o >10% infestazione)
- Urgenza intervento (nessuna/monitorare/pianificare/immediato)

---

## 🌳 FRUTTETO

### Accesso: `/app/orchard`

#### Tab Disponibili:
1. **Panoramica** - Dashboard principale
2. **Calcolo Densità** ⭐ NUOVO
3. **Resa per Pianta** ⭐ NUOVO

### Funzionalità Nuove:

#### 🎯 Calcolo Densità Impianto
**Tab:** "Calcolo Densità"  
**Cosa fa:**
- Calcola piante/ha per forma allevamento
- 18 forme allevamento supportate
- 12 tipi colture (melo, pero, pesco, ciliegio, agrumi, etc.)
- Sistema confidenza (alta/media/bassa)
- Soluzioni alternative

#### 📊 Resa per Pianta
**Tab:** "Resa per Pianta" ⭐⭐⭐  
**Cosa fa:**
- Tracking produttività individuale per albero
- Classificazione performance:
  - 🏆 Top Performer (>130% media)
  - ✅ Buono (110-130% media)
  - ➖ Medio (70-110% media)
  - ⚠️ Sotto Media (50-70% media)
  - ❌ Scarso (<50% media o zero)
- Statistiche aggregate (media, totale, conteggi)
- Identificazione top performers
- Alert alberi con resa scarsa
- Filtro per stagione (anno corrente, -1, -2)
- Tabella completa ordinata per resa

---

## 🎨 LEGENDA COLORI

### Performance:
- 🟢 **Verde** - Top, Ottimale, Buono
- 🔵 **Blu** - Buono, Normale
- ⚪ **Grigio** - Medio, Neutro
- 🟡 **Giallo** - Sotto Media, Attenzione
- 🔴 **Rosso** - Scarso, Critico, Urgente

### Icone:
- 🏆 Top Performer
- ✅ Buono / Approvato
- ➖ Medio / Neutro
- ⚠️ Attenzione / Warning
- ❌ Scarso / Critico
- 🎯 Target / Obiettivo
- 📊 Statistiche / Analytics
- 🧮 Calcolo / Calculator

---

## 📱 COMPATIBILITÀ

### Desktop:
- ✅ Layout ottimizzato
- ✅ Tutte le funzionalità accessibili
- ✅ Grafici e tabelle complete

### Mobile:
- ✅ Layout responsive
- ✅ Tab navigation ottimizzata
- ✅ Tabelle scrollabili
- ✅ Touch-friendly

### Browser:
- ✅ Chrome / Edge (consigliato)
- ✅ Firefox
- ✅ Safari
- ⚠️ IE11 non supportato

---

## 🔑 REQUISITI DATI

### Per Calcolo Densità:
- Nessun dato richiesto (calcolo standalone)

### Per Ravaz Index (Vigneto):
- Peso legno potatura (kg)
- Resa uva (kg)

### Per Maturazione Uva (Vigneto):
- Brix (°Bx)
- pH (opzionale)
- Acidità totale (g/L) (opzionale)

### Per Maturazione Olive (Oliveto):
- Invaiatura % (0-100)
- Colore stadio (verde → nero)

### Per Mosca Olearia (Oliveto):
- Trappole installate
- Catture settimanali
- Olive ispezionate

### Per Resa per Pianta (Frutteto):
- Raccolti registrati con `tree_id` specificato
- Almeno 1 stagione di dati

---

## 🎯 WORKFLOW CONSIGLIATO

### Vigneto:
1. **Inizio Stagione:** Calcola densità (se nuovo impianto)
2. **Post-Potatura:** Registra Ravaz Index
3. **Pre-Vendemmia:** Monitora maturazione uva
4. **Vendemmia:** Registra raccolti

### Oliveto:
1. **Inizio Stagione:** Calcola densità (se nuovo impianto)
2. **Primavera-Estate:** Installa trappole mosca
3. **Estate-Autunno:** Monitora mosca settimanalmente
4. **Pre-Raccolta:** Monitora maturazione olive
5. **Raccolta:** Registra raccolti

### Frutteto:
1. **Inizio Stagione:** Calcola densità (se nuovo impianto)
2. **Durante Stagione:** Registra raccolti per albero
3. **Fine Stagione:** Analizza resa per pianta
4. **Pianificazione:** Identifica top/poor performers

---

## 📚 DOCUMENTAZIONE COMPLETA

### Guide Dettagliate:
- `VINEYARD_ADVANCED_FEATURES_COMPLETE.md` - Vigneto
- `OLIVE_ADVANCED_FEATURES_COMPLETE.md` - Oliveto
- `ORCHARD_DENSITY_CALCULATOR_COMPLETE.md` - Frutteto Densità
- `ORCHARD_YIELD_TRACKER_INTEGRATION_COMPLETE.md` - Frutteto Resa
- `FRUTTETO_OLIVETO_VIGNETO_FINAL_SUMMARY.md` - Riepilogo Completo

### Guide Test:
- `TEST_ORCHARD_YIELD_TRACKER_JAN19.md` - Test Resa per Pianta

### Roadmap:
- `ROADMAP_FUNZIONALITA_FRUTTETO_OLIVETO_VIGNETO.md` - Prossimi sviluppi

---

## 🆘 SUPPORTO

### Problemi Comuni:

#### "Nessun dato disponibile"
**Causa:** Dati non ancora registrati  
**Soluzione:** Registra dati richiesti (vedi sezione Requisiti Dati)

#### "Calcolo non accurato"
**Causa:** Dati incompleti o errati  
**Soluzione:** Verifica input e riprova

#### "Tab non visibile"
**Causa:** Cache browser  
**Soluzione:** Ricarica pagina (Ctrl+F5 o Cmd+Shift+R)

### Contatti:
- **Email:** support@ortomio.com
- **Documentazione:** `/docs/manual/`
- **GitHub Issues:** [link repository]

---

## 🎉 NOVITÀ FASE 1

**Totale Funzionalità Implementate:** 9

### Vigneto: 3
- ✅ Calcolo Densità
- ✅ Ravaz Index
- ✅ Maturazione Uva

### Oliveto: 3
- ✅ Calcolo Densità
- ✅ Maturazione Olive
- ✅ Mosca Olearia

### Frutteto: 3
- ✅ Calcolo Densità
- ✅ Brix Tracker (già esistente)
- ✅ Resa per Pianta

**Tutte accessibili e funzionanti su ortomio-pro.vercel.app! 🚀**

---

**Ultimo Aggiornamento:** 19 Gennaio 2026  
**Versione:** 1.0.0  
**Status:** ✅ Produzione

