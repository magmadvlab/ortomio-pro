# PRECISION AGRICULTURE IMPLEMENTATION PLAN (2026-03-12)

## Obiettivo operativo
Tradurre la gap map in un piano di implementazione rigoroso, ordinato e misurabile.

Il criterio guida e:
- prima affidabilita del dato
- poi chiusura del controllo
- poi modelli agronomici piu sofisticati

## Priorita strategiche

### Priorita 1 - Fondamenta dati
Obiettivo:
- nessun sensore utile fuori dominio
- nessun dato ambiguo
- nessuna telemetria senza scope agronomico

### Priorita 2 - Closed loop irriguo
Obiettivo:
- ogni comando abbia conferma
- ogni irrigazione abbia riscontro reale

### Priorita 3 - Motore sanitario robusto
Obiettivo:
- alert malattia basati su segnali davvero rilevanti

### Priorita 4 - Fenologia e outcome
Obiettivo:
- collegare osservazioni, qualita e resa agli interventi

### Priorita 5 - Learning loop
Obiettivo:
- confrontare decisione, esecuzione e risultato per migliorare il sistema

## Piano in microstep

## Fase P0-A - Catalogo sensori e telemetria affidabile

### P0-A1 - Estendere il catalogo sensori prioritari
Stato:
- da iniziare subito

Microstep:
1. allineare `SensorType` e API ingestione
2. introdurre sensori P0:
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
3. creare migrazione DB per consentire i nuovi `sensor_type`
4. centralizzare la lista dei tipi supportati per evitare drift tra service e route

Criterio di accettazione:
- API e service accettano gli stessi tipi
- il DB non rifiuta i nuovi sensori

### P0-A2 - Aggiungere metadati minimi di qualita
Microstep:
1. aggiungere campi lettura:
   - `provider`
   - `data_quality_score`
   - `calibration_status`
   - `battery_level_percentage`
   - `signal_strength`
2. salvare i campi nelle pipeline di ingestione
3. mostrare in UI almeno qualita e ultimo stato sensore

Criterio di accettazione:
- ogni lettura ha qualita e provenienza

### P0-A3 - Binding agronomico forte dei device
Microstep:
1. estendere il registry device
2. aggiungere riferimenti:
   - `zone_id`
   - `field_row_id`
   - `tree_id`
   - `plant_id`
3. impedire device "orfani" senza scope
4. mostrare lo scope in Smart Hub

Criterio di accettazione:
- ogni device e collocato in un contesto agronomico preciso

## Fase P0-B - Closed loop irriguo

### P0-B1 - Telemetria reale irrigua
Microstep:
1. acquisire `flow_rate_actual`
2. acquisire `line_pressure`
3. collegare valvole a zone irrigue reali
4. registrare ultimo stato valvola confermato

### P0-B2 - Comando e conferma
Microstep:
1. invio comando
2. attesa conferma
3. gestione timeout/fallimento
4. log comando vs esito

### P0-B3 - Bilancio idrico chiuso
Microstep:
1. confrontare ETc pianificato vs volume erogato
2. verificare risposta sensori post-irrigazione
3. rilevare anomalie:
   - pressione bassa
   - portata assente
   - umidita invariata

## Fase P0-C - Sanita vegetale robusta

### P0-C1 - Segnali microclimatici
Microstep:
1. usare `leaf_wetness`
2. usare `dew_point`
3. usare `vpd`
4. usare `rain_gauge_local`

### P0-C2 - Modelli coltura-specifici
Microstep:
1. vigneto:
   - peronospora
   - oidio
2. oliveto:
   - occhio di pavone
   - mosca olearia
3. frutteto:
   - ticchiolatura
   - monilia

### P0-C3 - Evidenze e confidenza
Microstep:
1. ogni alert mostra fattori usati
2. ogni alert mostra confidenza
3. ogni alert collega sensori + meteo + fase fenologica

## Fase P1-A - Fenologia e qualita

### P1-A1 - Osservazioni fenologiche strutturate
Microstep:
1. definire fasi per coltura
2. registrare fase per parcella/filare/pianta
3. storicizzare avanzamento

### P1-A2 - Qualita raccolta
Microstep:
1. vigneto:
   - Brix
   - acidita
   - resa
2. oliveto:
   - resa olive
   - resa olio
3. frutteto:
   - calibro
   - qualita
   - scarto

## Fase P1-B - Prescription e outcome

### P1-B1 - Prescrizione persistita
Microstep:
1. salvare mappa prescrittiva con versione
2. legarla a zona/periodo/fonte dati

### P1-B2 - Esecuzione reale
Microstep:
1. legare mappa a operazione eseguita
2. legare operazione al risultato

### P1-B3 - Valutazione finale
Microstep:
1. confronto prescrizione vs esecuzione
2. confronto esecuzione vs outcome
3. score efficacia

## Ordine raccomandato di implementazione
1. `P0-A1`
2. `P0-A2`
3. `P0-A3`
4. `P0-B1`
5. `P0-B2`
6. `P0-B3`
7. `P0-C1`
8. `P0-C2`
9. `P0-C3`
10. `P1-A1`
11. `P1-A2`
12. `P1-B1`
13. `P1-B2`
14. `P1-B3`

## Cosa iniziamo ora
Si parte da `P0-A1` perche:
- sblocca tutta la telemetria avanzata
- riduce incoerenze tra API e service
- prepara Smart Hub, irrigazione e salute senza salti logici
