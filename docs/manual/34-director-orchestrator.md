# Director Orchestrator - Sistema Predittivo Intelligente

## Panoramica

Il **Director Orchestrator** è una superficie di sintesi e briefing che riusa segnali, storico e servizi decisionali presenti nell'app. Non va ancora descritto come un cervello unico completamente autonomo che coordina in modo uniforme tutti i sistemi del prodotto.

## Stato Modulo

**Stato attuale**: **Ibrido**

La parte reale oggi è:
- briefing e sintesi operative su parte dei segnali disponibili
- riuso di storico, meteo e servizi decisionali in alcune superfici
- collegamento concettuale con planner, salute, irrigazione e diario
- propagazione del refined context nelle azioni prioritarie quando sono disponibili cultivar, specie, intento produttivo, sottosistema e profilo sito
- uso prudente del profilo garden-level del wizard in scoring, spiegazioni e riepiloghi economici

I limiti da dichiarare sono:
- non tutti i moduli convergono ancora nello stesso orchestratore
- IoT e NDVI entrano nel briefing solo quando i dati sono disponibili e affidabili
- il director non sostituisce ancora un ledger unificato o una regia totalmente coerente su tutto il prodotto

## Caratteristiche Principali

### 1. Briefing Giornaliero Intelligente

Il Director fornisce ogni giorno un briefing personalizzato che include:

- **Priorità del Giorno**: Azioni urgenti basate su condizioni meteo, fase fenologica e storico
- **Raccomandazioni Contestuali**: Suggerimenti specifici per ogni coltivazione
- **Alert Predittivi**: Avvisi su potenziali problemi prima che si verifichino
- **Ottimizzazione Risorse**: Suggerimenti per ottimizzare acqua, nutrienti e tempo

### 2. Analisi Predittiva Multi-Fonte

Il sistema integra dati da:

- **Diario Automatico**: Storico giornaliero di crescita e stress
- **Dati Meteorologici**: Condizioni attuali e previsioni
- **Sensori IoT**: Dati disponibili quando collegati e persistiti in modo sufficiente
- **Immagini Satellitari**: segnali NDVI o analoghi quando la pipeline dati è effettivamente disponibile
- **Storico Utente**: Pattern e risultati delle stagioni precedenti
- **Profilo Sito**: suolo, pH, quota, sole, ombra, esposizione e protezione dal vento quando raccolti dal wizard o da metadata affidabili

### 3. Motore di Raccomandazioni

Il Director utilizza algoritmi avanzati per:

- **Prevedere Raccolti**: Stima date ottimali di raccolta basate su GDD
- **Rilevare Stress**: Identifica stress idrico, termico o nutrizionale prima che sia visibile
- **Ottimizzare Trattamenti**: Suggerisce timing ottimale per irrigazione e nutrizione
- **Prevenire Malattie**: Alert su condizioni favorevoli a patogeni
- **Pesare il profilo sito**: aumenta o riduce la priorità in modo conservativo quando sole, ombra, suolo, pH, quota o esposizione cambiano il rischio agronomico

## Come Funziona

### Flusso di Lavoro Giornaliero

```
1. Raccolta Dati (Automatica - Notte)
   ↓
2. Analisi Predittiva (AI Engine)
   ↓
3. Generazione Briefing (Director)
   ↓
4. Notifica Utente (Dashboard)
   ↓
5. Azioni Suggerite (Interattive)
```

### Dashboard Director

Accedi al briefing giornaliero dalla dashboard principale:

1. **Widget Director**: Mostra priorità del giorno
2. **Azioni Rapide**: Pulsanti per eseguire raccomandazioni
3. **Dettagli Espandibili**: Approfondimenti su ogni suggerimento
4. **Feedback Loop**: Valuta l'utilità delle raccomandazioni

## Tipi di Raccomandazioni

### 🌱 Crescita e Sviluppo

- Previsione cambio fase fenologica
- Stima giorni alla raccolta
- Ottimizzazione crescita vegetativa

### 💧 Gestione Idrica

- Timing ottimale irrigazione
- Quantità acqua consigliata
- Alert stress idrico

### 🌡️ Gestione Termica

- Protezione da gelate
- Ombreggiamento per caldo estremo
- Ventilazione ottimale

### 🍃 Nutrizione

- Timing concimazioni
- Carenze nutrizionali previste
- Dosaggi ottimali

### 🐛 Protezione Fitosanitaria

- Rischio malattie fungine
- Condizioni favorevoli a parassiti
- Timing trattamenti preventivi

## Integrazione con Altri Sistemi

### Diario Automatico

Il Director si basa sul **Diario Automatico** che registra quotidianamente:

- Dati meteorologici (temperatura, umidità, precipitazioni)
- GDD (Growing Degree Days) accumulati
- Ore di freddo per colture perenni
- Indici di stress (freddo, caldo, idrico)
- Eventi automatici e manuali

Vedi: [Diario Automatico](./35-automated-diary.md)

### Sistema Collaborativo AI

Le raccomandazioni del Director sono integrate con:

- **Planner AI**: Suggerimenti nel calendario
- **Irrigation AI**: Ottimizzazione irrigazione
- **Nutrition AI**: Piano nutrizionale dinamico
- **Health Monitor**: Alert salute piante

### Refined Context

Quando il dato esiste, il Director può allegare alle azioni prioritarie:

- cultivar o specie
- intento produttivo
- sistema colturale o sottosistema operativo
- profilo sito con suolo, pH, quota, pendenza, sole, ombre, esposizione e vento

Questi segnali non vengono usati come tassonomia rigida. Servono a rendere più difendibili priorità, spiegazioni e confronto economico tra alternative.

### IoT e Sensori

Quando disponibili, il Director può integrare:

- Sensori umidità suolo
- Stazioni meteo locali
- Sensori ambientali (temperatura, umidità)
- dispositivi e telemetria Smart Hub nei limiti dello stato attuale del modulo

## Configurazione

### Attivazione Director

Leggi questa sezione come descrizione del comportamento del modulo e non come garanzia che ogni opzione di configurazione dedicata sia già esposta e stabile in tutte le installazioni.

### Personalizzazione Raccomandazioni

Puoi personalizzare:

- **Priorità**: Quali aspetti sono più importanti per te
- **Stile**: Tecnico vs. semplificato
- **Frequenza**: Giornaliero, settimanale, on-demand
- **Canali**: Dashboard, email, notifiche push

## Best Practices

### Per Massimizzare l'Efficacia

1. **Feedback Costante**: Valuta le raccomandazioni per migliorare l'AI
2. **Dati Completi**: Più dati inserisci, più accurate sono le previsioni
3. **Azioni Tempestive**: Segui i suggerimenti nei tempi indicati
4. **Storico Accurato**: Registra risultati per confronti anno su anno

### Interpretazione Raccomandazioni

- **Priorità Alta** (🔴): Azione urgente entro 24h
- **Priorità Media** (🟡): Azione consigliata entro 3 giorni
- **Priorità Bassa** (🟢): Suggerimento per ottimizzazione

### Confidence Score

Ogni raccomandazione ha un punteggio di confidenza:

- **90-100%**: Basato su contesto forte e segnali coerenti disponibili
- **70-89%**: Buona probabilità, ma con alcune incertezze
- **50-69%**: Suggerimento esplorativo, da valutare

## Casi d'Uso

### Scenario 1: Previsione Gelata

```
Alert Director:
🔴 PRIORITÀ ALTA
Gelata prevista stanotte (-2°C)

Azioni Consigliate:
1. Copri piante sensibili (pomodori, peperoni)
2. Irriga leggermente per protezione termica
3. Prepara teli antigelo

Impatto Previsto:
- Senza azione: Danno grave a 15 piante
- Con azione: Protezione 95% efficace
```

### Scenario 2: Timing Raccolta Ottimale

```
Previsione Director:
🟡 RACCOLTA IMMINENTE
Pomodori San Marzano - Zona A

GDD Accumulati: 1180/1200
Giorni Stimati: 3-5 giorni

Raccomandazioni:
1. Prepara cassette e attrezzi
2. Riduci irrigazione gradualmente
3. Monitora colore e consistenza

Finestra Ottimale: 22-26 Gennaio
```

### Scenario 3: Stress Idrico Previsto

```
Alert Director:
🟡 STRESS IDRICO PREVISTO
Melanzane - Zona B

Analisi:
- Nessuna pioggia prevista 7 giorni
- ETo elevato (6mm/giorno)
- Umidità suolo in calo

Azioni:
1. Aumenta frequenza irrigazione
2. Applica pacciamatura
3. Monitora foglie per segni stress

Timing: Inizia oggi, continua 5 giorni
```

## Metriche e Analytics

### Dashboard Metriche Director

Monitora l'efficacia del sistema:

- **Accuracy Rate**: % raccomandazioni accurate
- **Action Rate**: % raccomandazioni seguite
- **Impact Score**: Miglioramento resa/qualità
- **Time Saved**: Ore risparmiate in decisioni

### Report Stagionali

A fine stagione, ricevi:

- Confronto previsioni vs. risultati reali
- Analisi decisioni prese
- Suggerimenti per prossima stagione
- ROI delle raccomandazioni seguite

## Tecnologia

### Algoritmi Utilizzati

- **Machine Learning**: Pattern recognition su dati storici
- **Time Series Analysis**: Previsioni basate su serie temporali
- **Rule-Based Engine**: Regole agronomiche consolidate
- **Ensemble Methods**: Combinazione di più modelli

### Fonti Dati

- **Open-Meteo API**: Dati meteorologici globali
- **Sentinel Hub**: Immagini satellitari
- **Database Interno**: Storico utente e community
- **Sensori IoT**: Dati in tempo reale quando disponibili

## Supporto e Feedback

### Hai Domande?

- **In-App Help**: Icona "?" su ogni raccomandazione
- **Community Forum**: Condividi esperienze con altri utenti
- **Support Team**: support@ortomio.ai

### Migliora il Director

Il sistema impara continuamente. Aiutaci:

1. **Valuta Raccomandazioni**: 👍 👎 su ogni suggerimento
2. **Registra Risultati**: Inserisci dati di raccolta e qualità
3. **Segnala Anomalie**: Report se qualcosa non torna
4. **Suggerisci Miglioramenti**: Cosa vorresti vedere?

---

**Prossimi Passi:**
- [Diario Automatico](./35-automated-diary.md)
- [Sistema Collaborativo AI](./08-global-ai-chat.md)
- [Monitoraggio Salute Piante](./21-individual-plants.md)
