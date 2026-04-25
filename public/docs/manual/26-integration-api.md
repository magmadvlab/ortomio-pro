# Integrazioni e API

Questo capitolo descrive il confine attuale delle integrazioni OrtoMio. Non esiste ancora una public API `/api/v1`, un developer portal, SDK ufficiali, webhooks outbound o connettori certificati verso ERP, marketplace, banche, assicurazioni o piattaforme cloud.

Le promesse non implementate sono tracciate nel master plan, non presentate come funzionalita' correnti.

## Stato attuale

OrtoMio espone e usa API interne Next.js per diversi moduli applicativi:

- AI, suggerimenti, diagnosi e predizioni;
- NDVI e credenziali satellitari;
- IoT telemetry, sensori e comandi dispositivo con limiti dichiarati;
- export CSV/PDF e backup dati selezionati;
- trattamenti, lavorazioni meccaniche, calendario e cron job;
- drone e blockchain-style traceability in aree ancora prototipali o limitate.

Queste route servono l'applicazione. Non sono ancora un contratto pubblico stabile per integrazioni esterne.

## Configurazioni provider

Il prodotto contiene superfici per configurare chiavi e credenziali di provider esterni:

- AI provider: Gemini, OpenAI, Anthropic, Ollama/local dove supportato;
- meteo: Open-Meteo, WeatherAPI, OpenWeatherMap o provider custom;
- Sentinel Hub / credenziali satellitari;
- custom endpoint in una gestione API key separata.

Limite architetturale: esistono due famiglie di gestione chiavi, `api_configurations` e `api_keys`, con ruoli sovrapposti. La loro unificazione o separazione netta e' un lavoro di consolidamento tracciato nel master plan come `T8-IMPLEMENT-01`.

## Export, import e scambio dati

Sono presenti funzioni concrete di scambio dati:

- export/import JSON per backup e portabilita' di dati selezionati del giardino;
- export CSV/PDF per alcune viste;
- export geospaziale per mappe di prescrizione in formati come CSV, GeoJSON, KML, Shapefile o ISOXML dove previsto dal servizio;
- compatibilita' macchina usata come supporto alla scelta del formato di export, non come connessione live al macchinario.

Queste funzioni sono scambio file e supporto operativo. Non equivalgono a integrazione bidirezionale certificata con macchine, FMIS, ERP o cloud agricoli.

## IoT e dispositivi

Le route IoT consentono ingestione telemetria e comandi limitati secondo il confine gia' documentato nello Smart Hub. Non sono ancora disponibili come prodotto corrente:

- provisioning automatico multi-provider;
- gestione OTA;
- discovery dispositivi;
- garanzia di attuazione fisica;
- integrazione completa LoRaWAN, NB-IoT, Modbus, RS485, CAN bus o piattaforme cloud IoT.

## Promesse convertite in TODO

Il master plan conserva le ambizioni valide come lavoro futuro:

- `T8-IMPLEMENT-01 API credentials security consolidation`: consolidare schema/servizi di gestione credenziali e impedire che segreti decriptati tornino al client;
- `T8-IMPLEMENT-02 public API contract and gateway`: progettare API esterne versionate, autenticate e documentate;
- `T8-IMPLEMENT-03 outbound webhook/event delivery system`: eventi, sottoscrizioni, firma, retry e log consegna;
- `T8-IMPLEMENT-04 integration connector registry`: registro connettori, credenziali, sync state, scope, errori e maturita' per provider;
- `T8-IMPLEMENT-05 developer documentation and SDK generation`: documentazione e SDK generati solo dopo un contratto API reale.

## Integrazioni differite

Restano future e dipendenti da architettura/contratti:

- ERP, CRM e marketplace;
- banking, assicurazioni e finanziamenti;
- Zapier, Power Automate e automazioni no-code;
- cloud provider e data warehouse;
- standard agricoli e macchinari oltre l'export file.

## Cosa non va presentato come attuale

Non sono capability correnti:

- connettori nativi o certificati SAP, Dynamics, NetSuite, Shopify, Amazon Business o marketplace agricoli;
- PSD2/open banking, pagamenti o assicurazioni parametriche;
- SDK JavaScript, Python, mobile o sandbox ufficiali;
- webhooks real-time outbound;
- API gateway, message bus o architettura microservizi pubblica;
- developer community ufficiale o supporto sviluppatori dedicato.

## Uso corretto

Usare le integrazioni attuali per configurare provider supportati, importare/esportare dati e collegare moduli interni. Per qualunque integrazione esterna stabile serve prima chiudere il consolidamento architetturale T8.
