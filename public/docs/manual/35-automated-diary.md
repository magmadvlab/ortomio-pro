# Diario Automatico - Registrazione Intelligente della Crescita

## Panoramica

Il **Diario Automatico** è il sistema di registrazione giornaliera che tiene traccia automaticamente di tutti i parametri che influenzano la crescita delle tue colture, costruendo una base dati storica fondamentale per il sistema predittivo.

## Cosa Registra

### 1. Dati Meteorologici Giornalieri

Ogni giorno il sistema registra automaticamente:

- **Temperature**: Minima, massima e media giornaliera
- **Umidità**: Minima, massima e media
- **Precipitazioni**: Millimetri di pioggia
- **Vento**: Velocità media e massima
- **Radiazione Solare**: Energia ricevuta
- **Indice UV**: Intensità raggi ultravioletti
- **Condizioni**: Sereno, nuvoloso, pioggia, ecc.

### 2. Growing Degree Days (GDD)

Il sistema calcola automaticamente i **GDD** (Gradi Giorno di Crescita):

```
GDD = ((Tmax + Tmin) / 2) - Tbase
```

Dove:
- `Tmax`: Temperatura massima giornaliera
- `Tmin`: Temperatura minima giornaliera
- `Tbase`: Temperatura base della coltura (es. 10°C per pomodori)

#### Perché sono Importanti?

I GDD permettono di:
- **Prevedere Fasi Fenologiche**: Quando la pianta fiorirà o fruttificherà
- **Stimare Raccolta**: Giorni mancanti alla maturazione
- **Confrontare Stagioni**: Indipendentemente dalle temperature assolute
- **Ottimizzare Timing**: Quando fare trattamenti o interventi

### 3. Ore di Freddo (Chill Hours)

Per colture perenni (vite, olivo, frutteto):

- Ore tra 0-7°C accumulate
- Necessarie per rompere dormienza
- Predizione fioritura primaverile

### 4. Indici di Stress

Il sistema calcola quotidianamente:

#### Stress da Freddo (0-1)
- Basato su temperature sotto la soglia ottimale
- Impatto su crescita e sviluppo
- Alert per protezione necessaria

#### Stress da Caldo (0-1)
- Temperature sopra soglia ottimale
- Rischio danni cellulari
- Necessità ombreggiamento/irrigazione

#### Stress Idrico (0-1)
- Rapporto precipitazioni/evapotraspirazione
- Umidità relativa
- Necessità irrigazione

### 5. Evapotraspirazione (ETo)

Calcolo giornaliero dell'acqua persa:

- Formula Hargreaves-Samani
- Basata su temperatura e radiazione solare
- Fondamentale per piano irriguo

## Come Funziona

### Processo Automatico Notturno

```
23:00 - Inizio Processo
  ↓
23:05 - Raccolta Dati Meteo (API)
  ↓
23:10 - Calcolo GDD e Stress
  ↓
23:15 - Aggiornamento Tracking Coltivazioni
  ↓
23:20 - Generazione Eventi Automatici
  ↓
23:25 - Analisi Predittiva
  ↓
23:30 - Preparazione Briefing Director
  ↓
00:00 - Processo Completato
```

### Fonti Dati

#### Dati Meteorologici

- **API Open-Meteo**: Dati globali gratuiti e accurati
- **Stazione Locale**: Se configurata, priorità ai dati locali
- **Sensori IoT**: Integrazione con dispositivi personali

#### Parametri Colture

- **Database Interno**: Parametri per 100+ colture
- **Personalizzazione**: Puoi modificare parametri per varietà specifiche
- **Community Data**: Dati aggregati da altri utenti

## Visualizzazione Diario

### Vista Giornaliera

Accedi al diario da **Menu** → **Diario**:

```
📅 20 Gennaio 2026

🌡️ Meteo
- Temp: 8°C - 16°C (media 12°C)
- Precipitazioni: 0mm
- ETo: 2.5mm
- Condizioni: Sereno

🌱 Coltivazioni (5 attive)

Pomodori San Marzano - Zona A
- GDD Giornalieri: 12.5
- GDD Accumulati: 1180/1200
- Fase: Maturazione
- Stress: Nessuno
- Crescita: 85%

Zucchine - Zona B
- GDD Giornalieri: 14.2
- GDD Accumulati: 580/700
- Fase: Fruttificazione
- Stress Idrico: 0.3 (Leggero)
- Crescita: 92%

📋 Eventi (3)
- ⚠️ Stress idrico rilevato (Zucchine)
- ℹ️ Fase maturazione iniziata (Pomodori)
- ✅ Irrigazione completata (Manuale)
```

### Vista Settimanale

Grafici e trend degli ultimi 7 giorni:

- **GDD Accumulati**: Progressione crescita
- **Stress Index**: Andamento stress
- **Condizioni Meteo**: Temperature e precipitazioni
- **Eventi**: Timeline eventi automatici e manuali

### Vista Stagionale

Confronto con stagioni precedenti:

- **GDD Totali**: Confronto anno su anno
- **Stress Days**: Giorni con stress significativo
- **Precipitazioni**: Totale stagionale
- **Resa**: Correlazione con condizioni

## Eventi Automatici

### Tipi di Eventi Generati

#### 🌡️ Alert Meteorologici

**Gelata Rilevata**
```
Temperatura minima: -2°C
Parametri Affetti: Stress freddo, Crescita
Raccomandazioni:
- Verifica danni da gelo
- Proteggi colture sensibili
```

**Caldo Estremo**
```
Temperatura massima: 38°C
Parametri Affetti: Stress caldo, Acqua
Raccomandazioni:
- Aumenta irrigazione
- Applica ombreggiamento
- Evita lavorazioni
```

**Pioggia Abbondante**
```
Precipitazioni: 45mm
Parametri Affetti: Bilancio idrico, Malattie
Raccomandazioni:
- Verifica drenaggio
- Monitora malattie fungine
- Rimanda trattamenti
```

#### 🌱 Alert Stress Colture

**Stress da Freddo**
```
Indice: 0.7 (Alto)
Coltura: Melanzane
Durata: 3 giorni
Azioni:
- Monitora pianta
- Considera protezione
```

**Stress Idrico**
```
Indice: 0.8 (Critico)
Coltura: Peperoni
Durata: 5 giorni
Azioni:
- Irriga immediatamente
- Applica pacciamatura
```

#### 📊 Cambio Fase Fenologica

```
Coltura: Pomodori
Fase Precedente: Fioritura
Fase Attuale: Fruttificazione
GDD Accumulati: 850

Raccomandazioni:
- Aumenta potassio
- Riduci azoto
- Monitora allegagione
```

## Registrazione Eventi Manuali

### Aggiungi Evento

Oltre agli eventi automatici, puoi registrare:

1. **Osservazioni**: Note su crescita, colore, vigore
2. **Trattamenti**: Concimazioni, trattamenti fitosanitari
3. **Operazioni**: Potature, diradamenti, legature
4. **Problemi**: Parassiti, malattie, anomalie

### Formato Evento Manuale

```
Tipo: Trattamento
Data: 20 Gennaio 2026
Coltura: Pomodori - Zona A
Descrizione: Concimazione fogliare
Prodotto: Concime NPK 20-20-20
Dose: 2g/L
Note: Applicato al mattino, condizioni ottimali
```

## Analisi Predittiva

### Previsione Raccolta

Basata su GDD accumulati:

```
Coltura: Zucchine
GDD Attuali: 580
GDD Target: 700
GDD Mancanti: 120

Media GDD/giorno (ultimi 7gg): 15.2
Giorni Stimati: 8 giorni

Data Prevista: 28 Gennaio 2026
Confidenza: 85%
```

### Confronto Anno su Anno

```
Pomodori San Marzano - Confronto 3 Anni

                2024    2025    2026
GDD Totali      1450    1380    1180*
Stress Freddo   2gg     5gg     1gg
Stress Caldo    8gg     12gg    6gg
Stress Idrico   15gg    10gg    8gg
Precipitazioni  320mm   280mm   195mm*
Resa            45kg    42kg    TBD

* Stagione in corso
```

### Insight Predittivi

Il sistema genera automaticamente:

- **Yield Prediction**: Stima resa finale
- **Quality Score**: Previsione qualità
- **Optimal Harvest Window**: Finestra raccolta ottimale
- **Risk Assessment**: Valutazione rischi

## Parametri Colture

### Parametri GDD Standard

| Coltura | T Base | T Opt Min | T Opt Max | GDD Germinazione | GDD Fioritura | GDD Raccolta |
|---------|--------|-----------|-----------|------------------|---------------|--------------|
| Pomodoro | 10°C | 20°C | 30°C | 100 | 600 | 1200 |
| Zucchina | 10°C | 18°C | 28°C | 80 | 400 | 700 |
| Peperone | 12°C | 20°C | 30°C | 120 | 700 | 1400 |
| Melanzana | 12°C | 22°C | 30°C | 130 | 750 | 1500 |
| Lattuga | 4°C | 15°C | 22°C | 50 | - | 500 |
| Vite | 10°C | 20°C | 30°C | - | 350 | 1500 |
| Olivo | 9°C | 18°C | 28°C | - | 500 | 2000 |

### Personalizzazione Parametri

Puoi modificare i parametri per:

- Varietà specifiche
- Condizioni locali
- Esperienze personali

**Impostazioni** → **Colture** → **Parametri GDD**

## Integrazione con Altri Sistemi

### Director Orchestrator

Il Diario fornisce i dati per:
- Briefing giornaliero
- Raccomandazioni predittive
- Alert proattivi

### Sistema Irrigazione

Dati ETo e stress idrico per:
- Piano irriguo automatico
- Ottimizzazione consumi
- Alert necessità irrigazione

### Sistema Nutrizione

Fase fenologica e crescita per:
- Piano nutrizionale dinamico
- Timing concimazioni
- Dosaggi ottimali

### Monitoraggio Salute

Stress index per:
- Early warning problemi
- Correlazione con malattie
- Prevenzione

## Best Practices

### Per Dati Accurati

1. **Verifica Posizione**: Assicurati che la tua posizione GPS sia corretta
2. **Stazione Locale**: Se possibile, configura una stazione meteo locale
3. **Registra Eventi**: Aggiungi eventi manuali per contesto completo
4. **Feedback Previsioni**: Valuta accuracy delle previsioni

### Interpretazione Dati

- **GDD**: Più alti = crescita più rapida
- **Stress < 0.3**: Normale, nessuna azione
- **Stress 0.3-0.6**: Monitorare, azione preventiva
- **Stress > 0.6**: Azione immediata necessaria

### Utilizzo Storico

- **Pianificazione**: Usa dati anni precedenti per pianificare
- **Varietà**: Scegli varietà adatte al tuo clima
- **Timing**: Ottimizza date semine/trapianti

## Configurazione

### Impostazioni Diario

**Impostazioni** → **Diario Automatico**

- **Orario Esecuzione**: Quando eseguire processo notturno
- **Fonte Dati Meteo**: API, stazione locale, sensori
- **Livello Dettaglio**: Minimo, standard, completo
- **Notifiche**: Quali eventi notificare
- **Retention**: Quanto tempo conservare dati

### Privacy e Dati

- Tutti i dati sono privati e criptati
- Puoi esportare il tuo storico in qualsiasi momento
- Puoi eliminare dati specifici o tutto lo storico
- Dati aggregati anonimi possono migliorare il sistema (opt-in)

## Supporto

### Problemi Comuni

**Dati Meteo Non Aggiornati**
- Verifica connessione internet
- Controlla posizione GPS
- Riavvia processo manuale

**GDD Sembrano Errati**
- Verifica parametri coltura
- Controlla temperatura base
- Confronta con altre fonti

**Eventi Non Generati**
- Verifica soglie alert
- Controlla log sistema
- Contatta supporto

### Contatti

- **Email**: support@ortomio.ai
- **In-App**: Icona "?" → "Diario Automatico"
- **Community**: Forum utenti

---

**Prossimi Passi:**
- [Director Orchestrator](./34-director-orchestrator.md)
- [Sistema Irrigazione](./15-irrigation-system.md)
- [Monitoraggio Salute](./21-individual-plants.md)
