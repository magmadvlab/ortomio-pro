# 🧪 Test Guide - Orchard Yield Per Tree Tracker

**Data:** 19 Gennaio 2026  
**Feature:** Resa per Pianta nel Frutteto  
**URL Test:** https://ortomio-pro.vercel.app/orchard

---

## 🎯 COSA TESTARE

### 1. Accesso alla Funzionalità
- [ ] Vai su `/app/orchard`
- [ ] Verifica presenza tab "Resa per Pianta" con icona Target (🎯)
- [ ] Clicca sul tab
- [ ] Verifica caricamento componente

### 2. Visualizzazione Dati

#### Con Dati Presenti:
- [ ] Verifica visualizzazione 5 stats cards:
  - Alberi Totali
  - Media Resa (kg)
  - Top Performer (conteggio)
  - Scarsi (conteggio)
  - Totale (kg)
- [ ] Verifica sezione "Top Performers" (se presenti alberi >130% media)
- [ ] Verifica alert "Alberi con Resa Scarsa" (se presenti alberi <50% media)
- [ ] Verifica tabella completa con tutti gli alberi

#### Senza Dati:
- [ ] Verifica messaggio "Nessun dato disponibile"
- [ ] Verifica suggerimento "Registra raccolti per albero"

### 3. Filtro Stagione
- [ ] Clicca sul selector stagione (in alto a destra)
- [ ] Seleziona anno corrente
- [ ] Seleziona anno precedente
- [ ] Seleziona 2 anni fa
- [ ] Verifica ricalcolo statistiche per ogni selezione

### 4. Classificazione Performance

Verifica badge colorati nella tabella:
- [ ] 🏆 Top (verde) - >130% media
- [ ] ✅ Buono (blu) - 110-130% media
- [ ] ➖ Medio (grigio) - 70-110% media
- [ ] ⚠️ Sotto Media (giallo) - 50-70% media
- [ ] ❌ Scarso (rosso) - <50% media o zero

### 5. Tabella Completa

Verifica colonne:
- [ ] Posizione (#1, #2, etc.)
- [ ] Codice albero
- [ ] Zona/Posizione
- [ ] Resa Totale (kg)
- [ ] N. Raccolte
- [ ] Media/Raccolta (kg)
- [ ] Performance (badge)

Verifica ordinamento:
- [ ] Alberi ordinati per resa decrescente
- [ ] Top performers in alto

### 6. Responsive Design

#### Desktop:
- [ ] Stats cards in griglia 5 colonne
- [ ] Top performers in griglia 4 colonne
- [ ] Tabella completa leggibile

#### Mobile:
- [ ] Stats cards in griglia 2 colonne
- [ ] Top performers in griglia 2 colonne
- [ ] Tabella scrollabile orizzontalmente

---

## 📊 DATI DI TEST

### Scenario 1: Frutteto con Dati Completi
**Setup:**
- 20+ alberi nel frutteto
- Raccolti registrati per almeno 10 alberi
- Raccolti in stagione corrente

**Risultato Atteso:**
- Statistiche calcolate correttamente
- Top performers identificati (se presenti)
- Alberi scarsi evidenziati (se presenti)
- Tabella completa con tutti gli alberi

### Scenario 2: Frutteto Nuovo (Senza Raccolti)
**Setup:**
- Alberi presenti ma nessun raccolto registrato

**Risultato Atteso:**
- Messaggio "Nessun dato disponibile"
- Suggerimento per registrare raccolti

### Scenario 3: Confronto Stagioni
**Setup:**
- Raccolti in più stagioni (2024, 2025, 2026)

**Risultato Atteso:**
- Cambio stagione aggiorna statistiche
- Dati corretti per ogni anno

---

## 🐛 POSSIBILI PROBLEMI

### Problema: Nessun dato visualizzato
**Causa:** Nessun raccolto con `tree_id` specificato  
**Soluzione:** Registrare raccolti associando albero specifico

### Problema: Statistiche a zero
**Causa:** Filtro stagione su anno senza raccolti  
**Soluzione:** Cambiare anno o registrare raccolti

### Problema: Alberi non trovati
**Causa:** `orchard_id` non corretto o alberi non attivi  
**Soluzione:** Verificare `is_active = true` su orchard_trees

---

## ✅ CHECKLIST VALIDAZIONE

### Funzionalità:
- [ ] Caricamento dati corretto
- [ ] Calcolo statistiche accurato
- [ ] Classificazione performance corretta
- [ ] Filtro stagione funzionante
- [ ] Ordinamento tabella corretto

### UI/UX:
- [ ] Layout professionale
- [ ] Colori appropriati
- [ ] Icone visibili
- [ ] Testo leggibile
- [ ] Responsive su mobile

### Performance:
- [ ] Caricamento rapido (<2 secondi)
- [ ] Cambio stagione reattivo
- [ ] Nessun lag su scroll tabella

### Accessibilità:
- [ ] Contrasto colori sufficiente
- [ ] Testo alternativo per icone
- [ ] Navigazione da tastiera

---

## 📝 NOTE PER IL TEST

### Dati Necessari:
Per testare completamente la funzionalità, assicurati di avere:
1. Almeno un frutteto creato
2. Almeno 10 alberi nel frutteto
3. Raccolti registrati con `tree_id` specificato
4. Raccolti in stagioni diverse (opzionale per test filtro)

### Come Registrare Raccolti per Albero:
1. Vai su `/app/orchard`
2. Seleziona frutteto
3. Vai su gestione raccolti
4. Registra raccolto specificando albero specifico
5. Ripeti per più alberi

### Valori di Test Suggeriti:
- Albero 1: 50 kg (top performer)
- Albero 2: 45 kg (buono)
- Albero 3: 30 kg (medio)
- Albero 4: 20 kg (sotto media)
- Albero 5: 5 kg (scarso)
- Albero 6: 0 kg (scarso)

Questo creerà una distribuzione che mostrerà tutte le classificazioni.

---

## 🎉 RISULTATO ATTESO

Dopo il test completo, dovresti vedere:
- ✅ Dashboard funzionante con 3 tab
- ✅ Resa per Pianta accessibile e funzionale
- ✅ Statistiche accurate e aggiornate
- ✅ Classificazione performance corretta
- ✅ UI professionale e responsive
- ✅ Filtro stagione operativo

**Se tutto funziona: Feature pronta per produzione! 🚀**

---

**Tester:** [Nome]  
**Data Test:** [Data]  
**Esito:** [ ] ✅ Approvato  [ ] ⚠️ Con note  [ ] ❌ Da rivedere

**Note:**
_[Inserire eventuali note o problemi riscontrati]_

