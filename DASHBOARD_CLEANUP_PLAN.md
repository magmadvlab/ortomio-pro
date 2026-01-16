# 🎯 Piano Pulizia Dashboard e Miglioramenti

**Data:** 16 Gennaio 2026  
**Problemi Identificati dall'Utente:**

## ❌ Problemi Attuali

### 1. Dashboard Troppo Affollata
- ❌ Widget NDVI sulla dashboard (deve stare in pagina dedicata)
- ❌ Widget Mappe Prescrizione sulla dashboard (deve stare in pagina dedicata)
- ❌ Widget Trattamenti sulla dashboard (deve stare in pagina dedicata)
- ❌ Widget Irrigazione sulla dashboard (deve stare in pagina dedicata)
- ✅ Mantenere solo: Garden Card, Weather, AI Suggestions, Cosa Fare Oggi, Progress

### 2. NDVI Mostra Dati Demo
- ❌ Modalità Demo attiva con dati simulati
- ❌ Non mostra mappa satellitare reale
- ✅ Deve mostrare mappa Sentinel-2 reale con WMS

### 3. Mappe Prescrizione Vuote
- ❌ Nessuna spiegazione di cosa sono
- ❌ Nessun tutorial su come usarle
- ❌ Interfaccia poco chiara
- ✅ Serve guida introduttiva e wizard

### 4. Certificazioni Incomplete
- ❌ Manca certificazione BIO
- ❌ GlobalGAP sembra "buttata lì"
- ❌ Mancano form compilabili per requisiti
- ✅ Serve sistema completo con form strutturati

---

## ✅ Soluzioni da Implementare

### FASE 1: Pulizia Dashboard
1. Rimuovere widget NDVI da HomeDashboard
2. Rimuovere widget Mappe Prescrizione da HomeDashboard
3. Rimuovere widget Trattamenti da HomeDashboard (o renderlo molto compatto)
4. Rimuovere widget Irrigazione da HomeDashboard (o renderlo molto compatto)
5. Mantenere solo widget essenziali

### FASE 2: NDVI - Rimuovere Demo Mode
1. Disabilitare modalità demo
2. Mostrare solo dati reali da Sentinel Hub
3. Migliorare visualizzazione mappa WMS
4. Aggiungere tutorial inline

### FASE 3: Mappe Prescrizione - Guida Introduttiva
1. Aggiungere sezione "Cos'è una Mappa Prescrizione"
2. Creare wizard guidato per prima mappa
3. Aggiungere esempi pratici
4. Tutorial step-by-step

### FASE 4: Certificazioni - Sistema Completo
1. Aggiungere certificazione BIO con form
2. Migliorare GlobalGAP con form strutturati per ogni requisito
3. Aggiungere altre certificazioni (SQNPI, ecc.)
4. Dashboard certificazioni con progress

---

## 📋 Checklist Implementazione

### Dashboard
- [ ] Rimuovere TreatmentDashboardWidget da HomeDashboard
- [ ] Rimuovere IrrigationDashboardWidget da HomeDashboard
- [ ] Mantenere solo link/card per accedere alle pagine dedicate
- [ ] Testare dashboard pulita

### NDVI
- [ ] Disabilitare modalità demo
- [ ] Forzare uso dati reali Sentinel Hub
- [ ] Migliorare NDVIMap component
- [ ] Aggiungere tutorial inline
- [ ] Testare con dati reali

### Mappe Prescrizione
- [ ] Creare sezione introduttiva
- [ ] Aggiungere wizard guidato
- [ ] Creare esempi pratici
- [ ] Aggiungere FAQ
- [ ] Testare flusso completo

### Certificazioni
- [ ] Creare form certificazione BIO
- [ ] Migliorare form GlobalGAP
- [ ] Aggiungere dashboard certificazioni
- [ ] Creare checklist compilabili
- [ ] Testare sistema completo

---

## 🎯 Priorità

1. **ALTA**: Pulizia Dashboard (immediato)
2. **ALTA**: NDVI Demo Mode (immediato)
3. **MEDIA**: Mappe Prescrizione Guida (importante)
4. **MEDIA**: Certificazioni Complete (importante)

