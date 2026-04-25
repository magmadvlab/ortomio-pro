# Diario Automatico

[← Torna all'Indice](./README.md)

---

## Stato Modulo

**Stato attuale**: **osservazione durevole con schema DB allineato al runtime**

Il Diario Automatico contribuisce alla catena operativa come livello di osservazione e contesto ambientale. La chiusura T2 non lo trasforma in un motore predittivo completo, ma allinea la persistenza meteo/diario al contratto runtime usato dai servizi applicativi.

La tabella `daily_weather_log` in produzione e stata corretta additivamente per includere le colonne operative lette dai servizi meteo, diario e monitoraggio ambientale.

---

## Cosa E Persistito Oggi

- dati meteo giornalieri in `daily_weather_log`
- entries giornaliere in `daily_diary_entries` dove il flusso le crea
- eventi diario in `diary_events`
- contesto ambientale usato da servizi di weather cache, diary predictive engine e environmental monitoring

Colonne runtime rilevanti ora presenti su `daily_weather_log`:

- `log_date`
- `temp_min`, `temp_max`, `temp_avg`
- `humidity_min`, `humidity_max`, `humidity_avg`
- `precipitation_mm`, `precipitation_type`
- `weather_conditions`, `data_source`, `raw_data`
- campi vento, radiazione, pressione, ETo e stress termico dove disponibili

---

## Ruolo Nel Ledger Operativo

Il diario non e una tabella di esecuzione. Il suo ruolo principale e fornire osservazioni e contesto:

- condizioni meteo della giornata
- segnali ambientali per interpretare un intervento
- base dati per letture predittive dove i dati sono sufficienti
- supporto a correlazioni future tra operazioni, meteo e risultati

---

## Cosa Permette Gia

- leggere dati meteo giornalieri ordinati per `log_date`
- usare snapshot meteo persistiti come fallback rispetto alla cache locale
- alimentare servizi ambientali senza errori di schema sulle colonne principali
- mantenere una storia meteo nel database invece di dipendere solo da memoria locale

---

## Limiti Attuali

- non e garantito che ogni giorno abbia una riga meteo in produzione
- le previsioni GDD, fenologiche, resa, qualita e harvest window dipendono da altri moduli e dati sufficienti
- sensori IoT, stazioni locali, notifiche automatiche e processi schedulati devono essere verificati modulo per modulo prima di essere descritti come completi
- il diario non sostituisce i registri operativi: osserva il contesto, non prova da solo l'esecuzione di un intervento

---

## Uso Consigliato

- usare il diario come fonte di contesto ambientale
- collegare le interpretazioni operative ai registri reali di task, irrigazione, trattamento, concimazione, lavorazione e raccolta
- considerare i dati meteo assenti come dato mancante, non come condizione neutra
- evitare di presentare insight predittivi come certi quando mancano osservazioni storiche rappresentative

---

## TODO Futuri

- verificare end-to-end eventuali job schedulati di raccolta meteo prima di documentarli come automatici
- definire la copertura minima per analisi multi-annuali meteo/resa
- collegare in modo piu esplicito osservazioni diario e outcome agronomici
- aggiungere test/QA visuale quando esistono dati produzione rappresentativi

---

[← Torna all'Indice](./README.md)
