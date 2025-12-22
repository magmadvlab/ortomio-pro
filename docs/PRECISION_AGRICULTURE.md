# Agricoltura di Precisione - Guida Completa

## Introduzione

Il sistema di Agricoltura di Precisione di OrtoMio permette di ottimizzare la gestione dell'orto attraverso:

- **Mappatura variabilità spaziale**: Zonazione dell'orto con caratteristiche specifiche
- **Analisi suolo avanzata**: Analisi complete macro/micro-nutrienti
- **Indicatori vegetativi**: NDVI, EVI, LAI calcolati da foto
- **Analisi predittiva**: Previsioni resa, raccolto, malattie, fabbisogno idrico
- **Ottimizzazione ROI**: Analisi costi/benefici per fertilizzazione

## Zone Mapping

### Cos'è la Zonazione

La zonazione permette di dividere l'orto in aree con caratteristiche diverse:
- Tipo terreno (argilloso, sabbioso, limoso, etc.)
- pH suolo
- Capacità idrica
- Esposizione solare
- Profondità suolo

### Come Creare Zone

1. Apri il **Visual Garden Planner**
2. Clicca sul pulsante **Zone Mapping** (icona mappa)
3. Clicca su **"Disegna Nuova Zona"**
4. Clicca sul Visual Planner per aggiungere punti al poligono
5. Completa con almeno 3 punti
6. Compila le caratteristiche della zona:
   - Nome zona
   - Tipo terreno
   - pH
   - Esposizione solare
   - Colore per visualizzazione

### Suggerimenti per Zona

Il sistema calcola automaticamente:
- **Irrigazione**: Frequenza e quantità ottimale per zona
- **Fertilizzazione**: Dosaggi specifici basati su caratteristiche zona
- **Timing operazioni**: Momento migliore per irrigare/fertilizzare

## Analisi Suolo Avanzata

### Tipi di Analisi

1. **Base**: pH, macro-nutrienti (N, P, K)
2. **Completa**: Include micro-nutrienti (Fe, Mn, Zn, Cu, B)
3. **Professionale**: Include CEC, materia organica, texture

### Come Inserire Analisi

1. Vai alla pagina della zona o del giardino
2. Apri **"Analisi Suolo"**
3. Clicca **"+ Nuova Analisi"**
4. Compila i valori:
   - Data analisi
   - Tipo analisi
   - Valori nutrienti
   - Proprietà fisico-chimiche
5. Salva

### Raccomandazioni Automatiche

Il sistema analizza automaticamente:
- **Carenze**: Identifica nutrienti sotto soglie ottimali
- **Suggerimenti fertilizzazione**: Prodotti e dosaggi specifici
- **Correzioni pH**: Se necessario

### Trend Nutrienti

Visualizza grafici temporali per:
- Azoto, Fosforo, Potassio nel tempo
- pH e materia organica
- Identifica tendenze e problemi

## Indicatori Vegetativi

### NDVI (Normalized Difference Vegetation Index)

- **Range**: -1 a 1
- **Ottimale**: > 0.6
- **Basso**: < 0.3 (vegetazione stressata)
- **Significato**: Indice di vegetazione normalizzato

### EVI (Enhanced Vegetation Index)

- **Range**: -1 a 1
- **Ottimale**: > 0.5
- **Significato**: Più sensibile alle variazioni di biomassa

### LAI (Leaf Area Index)

- **Range**: 0+
- **Ottimale**: 2-4
- **Significato**: Superficie fogliare per unità di terreno

### Chlorophyll Index

- **Range**: 0+
- **Ottimale**: 1-3
- **Significato**: Indice di clorofilla (fotosintesi)

### Calcolo Automatico

Gli indici vengono calcolati automaticamente quando:
- Carichi una foto della pianta
- La foto viene analizzata dall'AI
- I valori vengono salvati nel database

### Visualizzazione Trend

Il componente **VegetationIndicesChart** mostra:
- Grafici temporali per ogni indice
- Confronto con valori ottimali
- Alert quando indici scendono sotto soglie

## Analisi Predittiva

### Previsione Data Raccolto

Il sistema prevede la data ottimale di raccolto basandosi su:
- Giorni attivi dalla semina
- Fase crescita attuale
- Previsioni meteo
- Tasso crescita

**Output**:
- Data ottimale raccolto
- Finestra raccolto (earliest - latest)
- Confidenza previsione

### Previsione Resa

Calcola resa prevista considerando:
- Resa storica utente
- Condizioni crescita attuali
- Previsioni meteo
- Salute pianta

**Output**:
- Resa prevista (kg)
- Resa per m²
- Range di confidenza
- Confidenza previsione

### Rischio Malattie

Identifica probabilità malattie basandosi su:
- Condizioni meteo (umidità, temperatura, precipitazioni)
- Famiglia pianta
- Pattern storici

**Output**:
- Livello rischio (low/medium/high/critical)
- Malattie probabili con probabilità
- Consigli prevenzione

### Fabbisogno Idrico Predittivo

Prevede fabbisogno idrico per 7-14 giorni:
- Fase crescita pianta
- Evapotranspiration prevista
- Precipitazioni previste
- Caratteristiche zona

**Output**:
- Litri per m² per giorno
- Totale litri per zona
- Grafici temporali

## Ottimizzazione ROI

### Analisi Costi/Benefici

Il sistema calcola:
- **Resa attuale prevista**: Basata su condizioni attuali
- **Resa ottimizzata**: Con migliori pratiche applicate
- **Costi aggiuntivi**: Fertilizzazione, trattamenti
- **ROI**: Ritorno investimento

### Raccomandazioni

Per ogni azione suggerita:
- **Azione**: Cosa fare
- **Impatto atteso**: Resa aggiuntiva
- **Costo**: Spesa necessaria
- **ROI**: Ritorno investimento

### Timing Ottimale Raccolto

Trova momento migliore per:
- Massimizzare resa
- Evitare sovramaturazione
- Ottimizzare qualità

## Integrazione Dati Multi-Sorgente

### Dashboard Unificata

Aggrega dati da:
- **Sensori IoT** (simulati): Umidità, temperatura, EC, pH
- **Previsioni meteo**: Temperatura, precipitazioni, umidità
- **Analisi foto**: Salute, crescita, problemi
- **Storico raccolti**: Resa media, pattern
- **Analisi suolo**: Nutrienti, pH
- **Task history**: Irrigazione, fertilizzazione

### Insights Automatici

Il sistema genera automaticamente:
- Alert per problemi rilevati
- Suggerimenti basati su correlazioni
- Raccomandazioni preventive

### Correlazioni

Identifica relazioni tra:
- Crescita vs Irrigazione
- Resa vs Fertilizzazione
- Malattie vs Condizioni Meteo

## Best Practices

1. **Crea zone** per aree con caratteristiche diverse
2. **Inserisci analisi suolo** almeno 2 volte l'anno
3. **Scatta foto settimanali** per tracciare crescita
4. **Monitora indici vegetativi** per identificare problemi precoci
5. **Usa previsioni** per pianificare operazioni
6. **Ottimizza ROI** prima di investire in fertilizzazione

## Note Tecniche

### Approssimazioni

- **NDVI da RGB**: Gli indici vegetativi calcolati da foto RGB sono approssimazioni. Per misurazioni precise servono sensori multispettrali o satellitari.
- **Confidenza**: Le previsioni hanno livelli di confidenza variabili basati su dati disponibili.

### Hardware

- **Sensori IoT**: Attualmente simulati, struttura pronta per integrazione futura
- **Droni**: Supporto per import dati da software esterni
- **Strumenti esterni**: API per import dati da laboratori

## Riferimenti

- [Database Schema](./DATABASE_SCHEMA.md)
- [Architettura](./ARCHITECTURE.md)
- [Guida Migrazioni](../database/migration_guide.md)

