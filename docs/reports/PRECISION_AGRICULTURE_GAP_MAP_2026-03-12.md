# PRECISION AGRICULTURE GAP MAP (2026-03-12)

## Obiettivo
Portare OrtoMio da piattaforma con buone funzioni agronomiche e IoT parziali a sistema decisionale di precisione affidabile per:
- frutteto
- oliveto
- vigneto

L'obiettivo realistico non e "infallibile", ma:
- ridurre l'incertezza decisionale
- chiudere il ciclo misura -> decisione -> esecuzione -> verifica
- rendere ogni consiglio spiegabile, tracciabile e confrontabile con il risultato reale

## Stato attuale sintetico
Oggi OrtoMio ha gia una base utile:
- meteo operativo e forecast
- ingestione di alcune letture sensori
- NDVI e indicatori vegetativi
- analisi suolo
- motori salute/irrigazione/predizione
- registry Smart Hub in fase di consolidamento

Ma la catena non e ancora chiusa end-to-end:
- non tutti i fattori agronomici chiave sono tracciati
- non tutti i sensori sono legati in modo robusto a zona/filare/pianta
- attuazione e feedback risultato non sono ancora governati come un unico sistema
- i modelli agronomici non hanno ancora un data quality score forte per ogni decisione

## Principio guida
Per fare vera agricoltura di precisione servono sempre 5 strati:
1. contesto statico del sito
2. misure dinamiche affidabili
3. modello agronomico specifico per coltura e fase fenologica
4. esecuzione reale tracciata
5. verifica dell'effetto ottenuto

Se uno dei 5 strati manca, la precisione si abbassa drasticamente.

## Fattori che influenzano davvero la precisione

### 1. Suolo
Fattori gia presenti o abbozzati:
- pH
- EC
- tessitura
- sostanza organica
- macro e micro elementi

Fattori ancora mancanti o non operativi in modo forte:
- umidita suolo a piu profondita
- tensione idrica del suolo / tensiometri
- capacita di campo reale per zona
- punto di appassimento reale per zona
- densita apparente / compattazione
- velocita di infiltrazione reale
- salinita del profilo per sottozona
- uniformita di bagnatura nel volume radicale

### 2. Microclima
Gia presenti:
- temperatura
- umidita relativa
- vento
- pioggia
- pressione
- UV in alcune pipeline

Mancano o non sono chiusi:
- bagnatura fogliare
- dew point
- VPD
- ore di bagnatura utili ai modelli malattia
- temperatura chioma / canopy temperature
- radiazione PAR operativa
- ore di luce effettive in chioma

### 3. Pianta
Gia presenti:
- stato salute
- alcuni modelli per frutteto/oliveto/vigneto
- Brix in alcune aree
- NDVI / LAI / chlorophyll index in pipeline satellite-vegetativa

Mancano o sono parziali:
- fenologia precisa per parcella/varieta
- carico produttivo per pianta o filare
- allegagione e cascola reali
- crescita diametro frutto / grappolo
- potenziale idrico fogliare o proxy robusti
- vigore per sottozona ad alta frequenza
- resa qualitativa per area omogenea

### 4. Impianto irriguo
Gia presenti:
- sistemi, zone e watering logs
- calcoli ET0/ETc nel dominio dati
- Smart Hub in crescita

Mancano o non sono affidabili abbastanza:
- pressione reale per zona
- portata reale per zona
- uniformita distributiva
- allarme intasamenti/perdite
- stato reale valvola confermato dal campo
- differenza tra comando inviato e comando eseguito
- bilancio idrico chiuso con verifica post-irrigazione

### 5. Sanita vegetale
Gia presenti:
- alert e regole salute contestuali
- supporto meteo e AI

Mancano o vanno elevati:
- modelli epidemiologici veri per coltura/patogeno
- uso di bagnatura fogliare e dew point nel rischio
- tracking focolai per geometria reale
- confronto trattamento -> esito -> recidiva
- punteggio di affidabilita per ogni alert sanitario

### 6. Geometria e variabilita spaziale
Gia presenti:
- garden, zone, filari, alcune mappe, NDVI, prescription maps beta

Manca o va consolidato:
- mapping rigido device -> zona -> filare -> sottozona -> pianta
- georeferenziazione delle osservazioni sanitarie
- mappe di vigore/resa/stress confrontabili nel tempo
- storico spaziale coerente per anno, fase e intervento

## Gap prioritari

### P0 - Bloccano precisione affidabile
1. Mancanza di `leaf_wetness`, `dew_point`, `vpd`
Impatto:
- modelli malattia troppo deboli per vigneto, oliveto e frutteto

2. Mancanza di `soil_moisture` multi-depth e `tensiometer`
Impatto:
- irrigazione ancora troppo basata su proxy singoli

3. Smart Hub non ancora chiuso su telemetria/comandi reali
Impatto:
- impossibile verificare attuazione reale

4. Assenza di `device binding` forte con zona/filare/pianta
Impatto:
- il dato perde significato agronomico locale

5. Mancanza del ledger completo `prescrizione -> esecuzione -> risultato`
Impatto:
- niente miglioramento continuo serio

### P1 - Degradano molto la qualita del modello
1. Fenologia non abbastanza rigorosa per parcella e varieta
2. Qualita acqua irrigua non integrata operativamente
3. Mancanza di canopy temperature / thermal stress
4. Mancanza di pressione e portata reali per zona
5. Prescription maps ancora beta e non chiuse sul risultato

### P2 - Aumentano il vantaggio competitivo
1. Visione multisorgente drone + satellite + sensori
2. Score affidabilita dato per ogni alert e suggerimento
3. Benchmark multiannuale per cultivar e appezzamento
4. Modelli causali resa/qualita e non solo predittivi

## Matrice per coltura

| Coltura | Fattori decisivi | Cosa manca di piu oggi | Priorita |
|---|---|---|---|
| Vigneto | leaf wetness, dew point, VPD, Brix, fenologia, stress idrico, canopy temp | modelli peronospora/oidio con sensori reali, multi-depth soil water, termico chioma | P0 |
| Oliveto | mosca, occhio di pavone, invaiatura, stress idrico estivo, resa in olio | bagnatura fogliare, trappole/monitoraggio infestazione, stress idrico reale, resa olio per zona | P0 |
| Frutteto | ticchiolatura/monilia, allegagione, cascola, calibro, stress estivo, uniformita chioma | leaf wetness, fenologia fine, qualita frutto per parcella, uniformita irrigua e microclima chioma | P0 |

## Fattori da tenere traccia che oggi non sono presenti o non sono presenti bene

### Sensori / segnali da introdurre come dominio nativo
- `leaf_wetness`
- `dew_point`
- `vpd`
- `soil_moisture_10cm`
- `soil_moisture_30cm`
- `soil_moisture_60cm`
- `soil_tension_kpa`
- `canopy_temperature`
- `flow_rate_actual`
- `line_pressure`
- `rain_gauge_local`
- `solar_radiation`
- `par`
- `water_salinity`
- `water_ph`
- `water_bicarbonates`

### Entita da rafforzare
- device registry persistito e non transitorio
- device-channel binding verso sensore specifico
- sensore installato con profondita, orientamento, data calibrazione
- health event georeferenziato
- phenology observation per parcella/filare/pianta
- quality result per raccolta e sottozona

### Metadati obbligatori per ogni misura
- timestamp reale
- garden_id
- zone_id
- field_row_id o tree_id o plant_id
- provider
- device_id
- sensor_id
- data_quality_score
- calibration_status
- battery/signal se sensore IoT

## Mappa target del sistema

### Livello 1 - Data acquisition
- ThingsBoard come hub telemetria
- endpoint ingestione uniformi per tutti i sensori
- device registry unico
- normalizzazione misure e unita

### Livello 2 - Context engine
- binding automatico sensore -> zona -> filare -> pianta
- meteo locale + microclima + stato suolo
- data quality score per ogni snapshot

### Livello 3 - Decision engine
- irrigazione di precisione
- rischio sanitario per coltura
- previsione resa e qualita
- prescription maps robuste

### Livello 4 - Execution engine
- invio comandi valvole
- verifica attuazione reale
- registrazione interventi
- chiusura automatica del ciclo evento

### Livello 5 - Learning engine
- confronto previsione vs risultato
- correzione soglie per cultivar e sito
- ranking affidabilita modelli

## Roadmap esecutiva raccomandata

### Fase 1 - Fondamenta dati e sensori (1-2 sprint)
Obiettivo:
- rendere il dato utilizzabile davvero

Da fare:
- estendere `SensorType` e API ingestione ai segnali P0
- introdurre `data_quality_score`
- legare ogni device a zona/filare/pianta
- rendere persistente e centrale il registry device

Accettazione:
- ogni device ha scope agronomico chiaro
- ogni lettura e tracciabile, validata e confrontabile

### Fase 2 - Irrigazione di precisione reale (1-2 sprint)
Obiettivo:
- passare da stima a controllo verificabile

Da fare:
- integrare portata e pressione reali
- aggiungere multi-depth soil moisture o tensione suolo
- chiudere il ciclo comando valvola -> stato reale -> volume erogato
- confrontare irrigazione pianificata vs irrigazione eseguita

Accettazione:
- ogni zona ha storico fabbisogno, comando, esecuzione, esito

### Fase 3 - Sanita vegetale robusta (2 sprint)
Obiettivo:
- rendere credibile il rischio malattia

Da fare:
- introdurre leaf wetness, dew point, VPD
- implementare modelli specifici:
  - vigneto: peronospora, oidio
  - oliveto: occhio di pavone, mosca olearia
  - frutteto: ticchiolatura, monilia
- registrare ispezioni e focolai georeferenziati

Accettazione:
- ogni alert sanitario mostra fattori usati, confidenza e area coinvolta

### Fase 4 - Fenologia, qualita, resa (2 sprint)
Obiettivo:
- legare il lavoro al risultato economico e qualitativo

Da fare:
- osservazioni fenologiche strutturate
- Brix/acidita/calibro/resa olio/umidita frutto per coltura
- confronto tra interventi e outcome

Accettazione:
- sistema capace di spiegare quali fattori hanno inciso su resa e qualita

### Fase 5 - Prescription maps e apprendimento continuo (2 sprint)
Obiettivo:
- chiudere la precision agriculture completa

Da fare:
- rendere persistite e versionate le mappe prescrittive
- legare mappa -> esecuzione -> risultato
- introdurre metriche di accuratezza del modello

Accettazione:
- ogni prescrizione ha outcome misurabile e storico confrontabile

## KPI del livello superiore
- `device_binding_rate >= 95%`
- `sensor_traceability_rate = 100%`
- `telemetry_quality_rate >= 95%`
- `closed_loop_irrigation_rate >= 90%`
- `disease_alert_explainability_rate = 100%`
- `prescription_feedback_rate >= 80%`
- `yield_outcome_linked_rate >= 85%`

## Backlog iniziale consigliato

### Sprint A
- aggiungere nuovi sensori al dominio
- allineare API ingestione e Smart Hub
- device registry persistente
- associazione forte a zona/filare

### Sprint B
- dashboard irrigazione con portata/pressione reali
- storico comando vs esecuzione
- alert perdita/intasamento

### Sprint C
- motore sanitario con leaf wetness + dew point + VPD
- confidenza alert e spiegazione fattori

### Sprint D
- modulo fenologia e qualita raccolta per frutteto/oliveto/vigneto
- outcome analytics

## Decisione pratica raccomandata
Se l'obiettivo e "portarlo a un livello superiore" senza disperdere energia, la sequenza giusta e:
1. chiudere telemetria e mapping dei device
2. chiudere irrigazione reale
3. rinforzare rischio sanitario con sensori giusti
4. solo dopo spingere forte su prescription maps e AI avanzata

## Conclusione
OrtoMio ha gia il perimetro giusto, ma oggi non ha ancora tutti i fattori critici per essere una piattaforma di precisione forte in campo.

Il salto vero non sta in "piu AI", ma in:
- piu segnali agronomici giusti
- migliore qualita del dato
- migliore georeferenziazione
- ciclo chiuso tra decisione, attuazione e risultato

Questa e la mappa minima per portarlo a un livello superiore in modo credibile.
