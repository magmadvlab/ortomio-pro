# 📖 MANUALE UTENTE ORTOMIO 2026

## 🌟 PANORAMICA

Questo manuale è allineato allo stato reale del prodotto al **25 aprile 2026** per il perimetro T2 Operational Ledger.

OrtoMio oggi combina moduli già utilizzabili in produzione con moduli ancora in consolidamento. Per questo motivo il manuale non usa più la logica "tutto completo al 100%", ma distingue chiaramente tra:

- **Operativo**: utilizzabile con persistenza reale e workflow coerente
- **Ibrido**: parte reale, parte ancora guidata/mock o non completamente orchestrata
- **Beta**: disponibile per prove operative, non ancora affidabile end-to-end

---

## 📊 STATO REALE DEI MODULI CHIAVE

### **Operativi**
- **Irrigazione**: calcoli acqua e durata più coerenti con filari, piante, portate e meteo
- **Task base e pianificazione calendario/lista**: salvataggio reale in `garden_tasks`
- **Task agronomici evoluti nel planner**: summary operativo con urgenza, confidence e readiness prima del lancio esecuzione
- **Loop planner -> esecuzione su task agronomici recenti**: banner e form mostrano anche il contratto minimo di evidenze prima del salvataggio
- **Operational Ledger T2**: proiezioni Supabase DB-first, servizio aggregato e primo consumer nel Registro Attività
- **Registro attività**: legge lo stream ledger normalizzato quando disponibile e usa task reali solo come fallback degradato
- **Diario/meteo**: schema `daily_weather_log` allineato al runtime per osservazioni ambientali durevoli
- **Registri trattamenti, concimazioni, lavorazioni, irrigazioni**: persistiti nel database
- **Frutteto, oliveto, vigneto, filari**: gestione reale dei domini principali

### **Ibridi**
- **Planner AI / Advice**: alcune azioni creano task reali, ma non tutto il motore AI è ancora persistito end-to-end
- **Health / Salute**: alcuni alert e azioni creano task reali, ma parte del motore salute usa ancora logica euristica o simulata
- **NDVI**: dashboard e workflow di supporto presenti, ma il dato quantitativo non è ancora sempre affidabile come misura satellitare certificata

### **Beta**
- **Prescription Maps**: interfaccia presente, ma generazione, applicazione e confronto risultati non sono ancora completi
- **Smart Hub / IoT attivo**: ingestione dati sensori presente; registry dispositivi, controllo attuatori e automazioni restano beta

---

## 📚 CAPITOLI PRINCIPALI

### **AI e supporto decisionale**
- [AI OrtoMio](./07-ai-overview.md)
- [Predizioni AI](./01-ai-predictions.md)
- [🤖 Planner AI](./09-planner-ai-chat.md)

### **Precision e Smart Farming**
- [🛰️ NDVI Satellitare](./05-ndvi-satellite.md)
- [🗺️ Prescription Maps](./06-prescription-maps.md)
- [🏠 Smart Hub Integrato](./14-smart-hub.md)
- [💧 Sistema Irrigazione](./15-irrigation-system.md)

### **Pianificazione e storico**
- [📋 Registro Attività](./10-activity-registry.md)
- [🔧 Guida Rapida](./27-quick-start.md)
- [📱 Interfaccia e Navigazione](./29-interface-navigation.md)

### **Domini colturali**
- [🌳 Gestione Frutteto](./18-orchard-management.md)
- [🫒 Gestione Oliveto](./19-olive-management.md)
- [🍇 Gestione Vigneto](./20-vineyard-management.md)
- [🌿 Gestione Piante Individuali](./21-individual-plants.md)

---

## 🧭 COME LEGGERE IL MANUALE

- I capitoli aggiornati riportano prima ciò che è **disponibile ora**
- Le parti non ancora chiuse vengono indicate come **limite attuale** o **roadmap**
- Se un modulo produce dati utili ma non ancora pienamente affidabili, viene esplicitato

---

## 🔄 ALLINEAMENTO MARZO 2026

Questa revisione e stata estesa il **25 aprile 2026**.

In questa revisione il manuale è stato riallineato in particolare su:

- **Planner e Advice**: differenza tra task reali e suggerimenti ancora guidati
- **Loop planner -> esecuzione**: disponibilita di summary operativo sui task agronomici piu evoluti e contratto minimo di evidenze anche nei moduli esecutivi principali
- **Health**: alert meteo/monitoraggi con task reali, ma motore non ancora totalmente consolidato
- **Irrigazione**: compatibilità schema legacy/advanced e calcoli filari più precisi
- **NDVI**: uso corretto come supporto decisionale, non ancora come misura satellitare sempre certificabile
- **Prescription Maps**: stato beta reale
- **Smart Hub / IoT**: distinzione tra letture persistite e controllo dispositivi ancora incompleto
- **T2 Operational Ledger**: manuale allineato a proiezioni DB-first, Activity Registry consumer, diario/meteo e segnali piante individuali

---

## 📋 INFORMAZIONI DOCUMENTO

- **Versione**: 2026.3
- **Ultimo aggiornamento**: 25 aprile 2026
- **Formato**: Markdown modulare
- **Lingua**: Italiano

---

*OrtoMio - manuale operativo allineato allo stato reale del prodotto*
