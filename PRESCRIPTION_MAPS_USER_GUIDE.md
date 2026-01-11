# 🗺️ PRESCRIPTION MAPS - GUIDA UTENTE COMPLETA
## Sistema Avanzato Mappe Prescrizione per Precision Farming

*Versione: 1.0 - Gennaio 2026*

---

## 📖 INDICE

1. [Introduzione](#introduzione)
2. [Accesso al Sistema](#accesso-al-sistema)
3. [Creazione Mappe Prescrizione](#creazione-mappe-prescrizione)
4. [Gestione Zone](#gestione-zone)
5. [Ottimizzazione Costi](#ottimizzazione-costi)
6. [Confronto Storico](#confronto-storico)
7. [Export per Machinery](#export-per-machinery)
8. [Integrazione GPS](#integrazione-gps)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## 🎯 INTRODUZIONE

Il sistema **Prescription Maps** di OrtoMio trasforma i dati plant-level, NDVI satellitare e analisi del suolo in mappe prescrizione precise per l'applicazione variabile di fertilizzanti, pesticidi e altri input agricoli.

### **Vantaggi Chiave**
- 🎯 **Precisione Plant-Level**: Mappe basate su dati individuali delle piante
- 🛰️ **Integrazione NDVI**: Fusione dati satellitari e ground truth
- 🚜 **Compatibilità Universale**: Export per tutti i GPS agricoli
- 💰 **Ottimizzazione Costi**: Riduzione input fino al 30%
- 📊 **Analisi Storica**: Confronto performance nel tempo

### **Workflow Completo**
```
Dati Plant-Level + NDVI → Analisi Zone → Mappa Prescrizione → Export GPS → Applicazione Campo
```

---

## 🚪 ACCESSO AL SISTEMA

### **Navigazione**
1. Accedi a OrtoMio Pro
2. Menu laterale → **"Analytics & Smart"**
3. Seleziona **"Prescription Maps"**

### **Requisiti**
- ✅ Abbonamento OrtoMio **Enterprise** o superiore
- ✅ Dati NDVI attivi (configurazione Sentinel Hub)
- ✅ Almeno 30 giorni di dati plant-level
- ✅ Coordinate GPS del campo configurate

---

## 🗺️ CREAZIONE MAPPE PRESCRIZIONE

### **Passo 1: Avvio Creazione**

1. **Click "Nuova Mappa"** nel dashboard principale
2. **Compila i dettagli**:
   - **Nome Mappa**: Es. "Fertilizzazione Azoto Gennaio 2026"
   - **Tipo Applicazione**: Fertilizzante, Pesticida, Irrigazione, Semina
   - **Descrizione**: Note aggiuntive per identificazione

### **Passo 2: Configurazione Dati**

#### **Sorgenti Dati**
- ✅ **NDVI Satellitare**: Automatico da Sentinel Hub
- ✅ **Plant-Level Data**: Salute e produttività per pianta
- ✅ **Soil Analysis**: Dati analisi terreno (se disponibili)
- ✅ **Historical Data**: Performance stagioni precedenti

#### **Parametri Applicazione**
- **Dose Base**: Quantità standard (es. 150 kg/ha)
- **Unità Misura**: kg/ha, L/ha, semi/m²
- **Range Variazione**: ±20% dalla dose base (raccomandato)
- **Periodo Analisi**: Ultimi 30-90 giorni

### **Passo 3: Generazione Automatica**

1. **Click "Genera Mappa"**
2. **Monitoraggio Progresso**:
   - Analisi dati NDVI: 10-15 secondi
   - Calcolo zone: 5-10 secondi
   - Generazione mappa: 5-15 secondi
3. **Risultato**: Mappa con zone colorate e dosi specifiche

### **Algoritmi di Calcolo**

#### **Zone Calculation Engine**
```
Zone Score = (NDVI Weight × NDVI Value) + 
             (Plant Health Weight × Plant Health Score) + 
             (Soil Weight × Soil Quality) +
             (Historical Weight × Historical Performance)
```

#### **Variable Rate Calculation**
```
Application Rate = Base Rate × (1 + Zone Score Adjustment)

Dove Zone Score Adjustment:
- Zone Eccellente: -15% (riduzione input)
- Zone Buona: -5%
- Zone Media: 0% (dose base)
- Zone Scarsa: +10%
- Zone Critica: +20% (massimo supporto)
```

---

## 🎯 GESTIONE ZONE

### **Accesso Zone Management**
1. Seleziona mappa esistente
2. Click **"Gestisci Zone"**
3. Si apre il pannello Zone Management

### **Visualizzazione Zone**

#### **Mappa Interattiva**
- **Colori Zone**: Verde (eccellente) → Rosso (critica)
- **Click su Zona**: Mostra dettagli specifici
- **Hover**: Anteprima rapida dose e area

#### **Lista Zone**
- **Zone ID**: Identificativo univoco
- **Area**: Superficie in ettari/m²
- **Dose**: Quantità applicazione
- **Confidence**: Livello confidenza calcolo (0-100%)

### **Modifica Zone**

#### **Aggiustamento Manuale**
1. **Seleziona zona** dalla lista o mappa
2. **Modifica dose**: Inserisci nuovo valore
3. **Rationale**: Spiega motivo modifica
4. **Salva**: Conferma modifiche

#### **Validazione Automatica**
- **Range Check**: Verifica dose entro limiti sicuri
- **Consistency Check**: Coerenza con zone adiacenti
- **Cost Impact**: Calcolo impatto economico
- **Environmental Check**: Verifica impatto ambientale

### **Operazioni Bulk**

#### **Selezione Multipla**
- **Ctrl+Click**: Selezione zone multiple
- **Drag Selection**: Selezione area rettangolare
- **Filter Selection**: Selezione per criteri (es. dose >100)

#### **Azioni Bulk**
- **Applica Dose**: Stessa dose a zone selezionate
- **Scala Percentuale**: Aumenta/diminuisci % su selezione
- **Reset**: Ripristina calcolo automatico
- **Merge**: Unisci zone simili

---

## 💰 OTTIMIZZAZIONE COSTI

### **Accesso Cost Optimization**
1. Seleziona mappa prescrizione
2. Click **"Ottimizza Costi"**
3. Si apre il pannello Advanced Optimization

### **Configurazione Obiettivi**

#### **Multi-Objective Optimization**
- **Minimizza Costi** (0-100%): Riduzione spesa input
- **Massimizza Resa** (0-100%): Ottimizzazione produzione
- **Minimizza Impatto Ambientale** (0-100%): Sostenibilità
- **Massimizza Efficienza** (0-100%): Rapporto costo/beneficio

#### **Vincoli Operativi**
- **Budget Massimo**: Limite spesa totale (€)
- **Resa Minima**: Produzione minima accettabile (t/ha)
- **Impatto Ambientale**: Limite emissioni/inquinamento
- **Efficienza Minima**: ROI minimo richiesto

### **Algoritmi di Ottimizzazione**

#### **1. Genetic Algorithm**
- **Migliore per**: Ottimizzazione globale complessa
- **Tempo**: 30-60 secondi
- **Precisione**: Molto alta
- **Uso**: Problemi multi-obiettivo complessi

#### **2. Simulated Annealing**
- **Migliore per**: Evitare minimi locali
- **Tempo**: 20-40 secondi  
- **Precisione**: Alta
- **Uso**: Ottimizzazione con molti vincoli

#### **3. Particle Swarm Optimization**
- **Migliore per**: Convergenza rapida
- **Tempo**: 15-30 secondi
- **Precisione**: Buona
- **Uso**: Ottimizzazione veloce

#### **4. Gradient Descent**
- **Migliore per**: Problemi lineari
- **Tempo**: 10-20 secondi
- **Precisione**: Buona per problemi semplici
- **Uso**: Ottimizzazione rapida

### **Risultati Ottimizzazione**

#### **Configurazione Ottimizzata**
- **Nuove Dosi per Zona**: Valori ottimizzati
- **Costo Totale**: Spesa prevista
- **Resa Stimata**: Produzione attesa
- **ROI Previsto**: Ritorno investimento

#### **Miglioramenti Ottenuti**
- **Riduzione Costi**: Percentuale risparmio
- **Aumento Resa**: Incremento produzione
- **Miglioramento Efficienza**: Ottimizzazione ROI
- **Riduzione Impatto**: Benefici ambientali

#### **Piano Implementazione**
- **Fase 1**: Zone prioritarie (settimana 1)
- **Fase 2**: Zone secondarie (settimana 2-3)
- **Fase 3**: Zone marginali (settimana 4)
- **Monitoraggio**: KPI da tracciare

---

## 📊 CONFRONTO STORICO

### **Accesso Historical Comparison**
1. Click **"Confronto Storico"** nel dashboard
2. Seleziona mappe da confrontare
3. Configura parametri analisi

### **Configurazione Confronto**

#### **Selezione Mappe**
- **Checkbox Selection**: Seleziona 2-5 mappe
- **Time Range**: Periodo temporale analisi
- **Map Type Filter**: Filtra per tipo applicazione
- **Season Filter**: Filtra per stagione

#### **Tipo Confronto**
- **Temporale**: Evoluzione nel tempo
- **Spaziale**: Confronto zone geografiche
- **Performance**: Confronto risultati
- **Costi**: Analisi economica

#### **Metriche Analisi**
- **Application Rate**: Dosi applicate
- **Yield**: Rese ottenute
- **Cost**: Costi sostenuti
- **Environmental Impact**: Impatto ambientale
- **Efficiency**: Efficienza operativa

### **Risultati Analisi**

#### **Tab 1: Trend Temporali**
- **Grafici Trend**: Evoluzione metriche nel tempo
- **Trend Detection**: Identificazione automatica pattern
- **Change Rate**: Tasso variazione per periodo
- **Confidence Score**: Affidabilità trend identificati

#### **Tab 2: Evoluzione Zone**
- **Zone Performance**: Performance per zona nel tempo
- **Spatial Grouping**: Raggruppamento zone simili
- **Outcome Correlation**: Correlazione risultati attesi/reali
- **Zone Recommendations**: Raccomandazioni specifiche

#### **Tab 3: Pattern Stagionali**
- **Seasonal Analysis**: Efficacia per stagione
- **Variability Assessment**: Variabilità stagionale
- **Effectiveness Score**: Punteggio efficacia stagionale
- **Seasonal Optimization**: Suggerimenti ottimizzazione

#### **Tab 4: Insights Automatici**
- **Key Findings**: Risultati chiave automatici
- **Risk Factors**: Fattori di rischio identificati
- **Opportunities**: Opportunità di miglioramento
- **Next Actions**: Azioni consigliate prioritarie

---

## 📤 EXPORT PER MACHINERY

### **Accesso Export**
1. Seleziona mappa prescrizione
2. Click **"Esporta"**
3. Si apre Export Modal

### **Formati Disponibili**

#### **1. Shapefile (.shp)**
- **Compatibilità**: GIS software, GPS avanzati
- **Contenuto**: Geometrie + attributi completi
- **Dimensione**: Media (2-8 MB)
- **Raccomandato per**: Analisi GIS, GPS professionali

#### **2. KML/KMZ (.kml/.kmz)**
- **Compatibilità**: Google Earth, GPS consumer
- **Contenuto**: Geometrie + visualizzazione
- **Dimensione**: Piccola (0.5-2 MB)
- **Raccomandato per**: Visualizzazione, GPS semplici

#### **3. ISO-XML (.xml)**
- **Compatibilità**: Trattori ISOBUS, machinery avanzata
- **Contenuto**: Task data + prescription
- **Dimensione**: Piccola (0.2-1 MB)
- **Raccomandato per**: Automazione machinery

#### **4. GeoJSON (.json)**
- **Compatibilità**: Web mapping, API integration
- **Contenuto**: Geometrie + attributi JSON
- **Dimensione**: Media (1-4 MB)
- **Raccomandato per**: Sviluppo software, web apps

#### **5. CSV con Coordinate (.csv)**
- **Compatibilità**: Universale, Excel, GPS base
- **Contenuto**: Coordinate + dosi tabulari
- **Dimensione**: Piccola (0.1-0.5 MB)
- **Raccomandato per**: GPS semplici, analisi Excel

### **Configurazione Export**

#### **Tab Generale**
- **Nome File**: Nome file export
- **Formato**: Selezione formato principale
- **Compressione**: ZIP per file multipli
- **Metadati**: Includi informazioni aggiuntive

#### **Tab Machinery**
- **Brand**: Selezione marca machinery
- **Modello**: Modello specifico
- **Compatibility Check**: Verifica automatica compatibilità
- **Format Optimization**: Ottimizzazione per device

#### **Tab Avanzate**
- **Coordinate System**: Sistema coordinate (WGS84, UTM, etc.)
- **Precision**: Decimali coordinate (4-8 cifre)
- **Units**: Unità misura output
- **Validation**: Controlli qualità export

### **Processo Export**

1. **Configurazione**: Selezione opzioni
2. **Validation**: Controllo dati e compatibilità
3. **Generation**: Creazione file export
4. **Quality Check**: Verifica qualità file
5. **Download**: Link download disponibile

---

## 🛰️ INTEGRAZIONE GPS

### **Dispositivi Testati e Compatibili**

#### **Trattori ISOBUS**
- ✅ **John Deere 8R Series**: ISO-XML, Shapefile
- ✅ **Case IH Magnum**: ISO-XML, Shapefile, KML
- ✅ **New Holland T7**: KML, CSV
- ✅ **Fendt 900 Series**: ISO-XML, Shapefile, GeoJSON
- ✅ **Massey Ferguson 8700**: Shapefile, CSV

#### **GPS Standalone**
- ✅ **Trimble CFX-750**: Shapefile, ISO-XML
- ✅ **Ag Leader Integra**: Shapefile, CSV
- ✅ **Raven Viper 4**: ISO-XML, KML
- ✅ **Topcon X35**: Shapefile, GeoJSON

#### **Sistemi Aftermarket**
- ✅ **Climate FieldView**: Shapefile export
- ✅ **Farmers Edge**: CSV, KML
- ✅ **Granular**: Shapefile, CSV

### **Procedura Caricamento GPS**

#### **Metodo 1: USB Transfer**
1. Export mappa in formato compatibile
2. Salva file su USB drive
3. Inserisci USB nel terminale GPS
4. Importa file dal menu GPS
5. Verifica caricamento corretto

#### **Metodo 2: Wireless Transfer**
1. Configura connessione WiFi/Bluetooth
2. Usa app companion del GPS
3. Trasferisci file wireless
4. Sincronizza con terminale
5. Verifica ricezione dati

#### **Metodo 3: Cloud Sync**
1. Carica file su piattaforma cloud GPS
2. Sincronizza dal terminale
3. Download automatico in campo
4. Attivazione mappa prescrizione

### **Verifica Compatibilità**

#### **Automatic Compatibility Check**
- **Device Detection**: Riconoscimento automatico GPS
- **Format Validation**: Verifica formato supportato
- **Feature Check**: Controllo funzionalità disponibili
- **Recommendation**: Suggerimento formato ottimale

#### **Manual Compatibility Check**
1. Seleziona marca e modello GPS
2. Verifica formati supportati
3. Controlla limitazioni specifiche
4. Ottieni raccomandazioni export

---

## 🔧 TROUBLESHOOTING

### **Problemi Comuni**

#### **Mappa Non Si Genera**
**Sintomi**: Errore durante generazione mappa
**Cause Possibili**:
- Dati NDVI insufficienti
- Coordinate GPS mancanti
- Dati plant-level incompleti

**Soluzioni**:
1. Verifica configurazione Sentinel Hub
2. Controlla coordinate campo in Impostazioni
3. Assicurati di avere almeno 30 giorni dati piante
4. Riprova con periodo analisi più lungo

#### **Zone Troppo Piccole/Grandi**
**Sintomi**: Zone non adatte per machinery
**Cause Possibili**:
- Sensibilità algoritmo troppo alta/bassa
- Dati NDVI troppo variabili
- Campo troppo omogeneo/eterogeneo

**Soluzioni**:
1. Regola parametri sensibilità in Impostazioni Avanzate
2. Usa smoothing per ridurre variabilità
3. Merge manuale zone piccole
4. Split manuale zone grandi

#### **Export Fallisce**
**Sintomi**: Errore durante export file
**Cause Possibili**:
- Formato non supportato da GPS
- File troppo grande
- Errori coordinate

**Soluzioni**:
1. Verifica compatibilità GPS
2. Usa compressione per ridurre dimensioni
3. Controlla sistema coordinate
4. Prova formato alternativo (CSV)

#### **GPS Non Riconosce File**
**Sintomi**: File non importabile in GPS
**Cause Possibili**:
- Formato errato
- Coordinate system incompatibile
- File corrotto

**Soluzioni**:
1. Verifica formato supportato dal GPS
2. Cambia sistema coordinate (WGS84 universale)
3. Re-export con validazione attiva
4. Contatta supporto GPS manufacturer

### **Diagnostica Avanzata**

#### **Log Analysis**
1. Vai in Impostazioni → Diagnostica
2. Scarica log sistema
3. Cerca errori specifici
4. Invia a supporto se necessario

#### **Data Validation**
1. Usa strumento "Valida Dati" nel dashboard
2. Controlla completezza dati NDVI
3. Verifica qualità dati plant-level
4. Correggi anomalie identificate

---

## ❓ FAQ

### **Domande Generali**

**Q: Quanto tempo serve per generare una mappa prescrizione?**
A: Tipicamente 30-60 secondi per campi fino a 50 ettari. Campi più grandi possono richiedere 2-3 minuti.

**Q: Posso modificare manualmente le zone generate?**
A: Sì, puoi modificare dosi, unire/dividere zone, e aggiungere note per ogni zona.

**Q: Le mappe sono compatibili con tutti i GPS?**
A: Supportiamo i 5 formati più comuni che coprono 95%+ dei GPS agricoli. Verifica compatibilità specifica nel tool.

**Q: Quanto spesso devo aggiornare le mappe prescrizione?**
A: Raccomandato ogni 2-4 settimane durante stagione attiva, o dopo eventi significativi (piogge intense, trattamenti).

### **Domande Tecniche**

**Q: Che precisione hanno le coordinate GPS?**
A: Usiamo precisione sub-metro (0.5-2m) compatibile con GPS RTK e sistemi precision farming.

**Q: Posso esportare mappe per machinery di marche diverse?**
A: Sì, il sistema ottimizza automaticamente il formato per ogni marca/modello di machinery.

**Q: I dati NDVI sono in tempo reale?**
A: Dati Sentinel Hub aggiornati ogni 3-5 giorni (dipende da copertura nuvolosa). Per tempo reale usa integrazione droni.

**Q: Posso integrare dati da sensori IoT?**
A: Sì, il sistema può integrare dati da sensori suolo, umidità, pH per mappe più precise.

### **Domande Business**

**Q: Quanto posso risparmiare con le mappe prescrizione?**
A: Clienti tipici riportano 15-30% riduzione costi input mantenendo o migliorando rese.

**Q: Il sistema funziona per tutte le colture?**
A: Ottimizzato per cereali, orticole, frutticole. Supporto limitato per colture specialistiche.

**Q: Posso condividere mappe con agronomo/consulente?**
A: Sì, funzione export e condivisione con permessi granulari per collaboratori esterni.

**Q: I dati sono sicuri e privati?**
A: Tutti i dati sono crittografati e rimangono di tua proprietà. Nessuna condivisione con terzi senza consenso.

### **Domande Operative**

**Q: Cosa fare se il GPS non legge il file?**
A: 1) Verifica formato compatibile, 2) Prova CSV universale, 3) Controlla sistema coordinate, 4) Contatta supporto GPS.

**Q: Posso usare mappe su più trattori?**
A: Sì, puoi esportare la stessa mappa in formati diversi per machinery diverse.

**Q: Come verifico che l'applicazione sia corretta?**
A: Usa funzione "Tracking Applicazione" per monitorare in tempo reale e confrontare con prescrizione.

**Q: Posso modificare la mappa durante l'applicazione?**
A: Modifiche minori possibili da mobile. Per cambi significativi, ferma applicazione e rigenera mappa.

---

## 📞 SUPPORTO

### **Contatti**
- **Email**: support@ortomio.com
- **Telefono**: +39 02 1234 5678
- **Chat**: Disponibile in app 24/7
- **Video Call**: Su appuntamento per training

### **Risorse Aggiuntive**
- **Video Tutorial**: Disponibili in app
- **Webinar Mensili**: Training avanzato
- **Community Forum**: Condivisione best practices
- **Knowledge Base**: Articoli tecnici dettagliati

---

*Guida aggiornata: Gennaio 2026 - Versione 1.0*
*Per suggerimenti e miglioramenti: feedback@ortomio.com*