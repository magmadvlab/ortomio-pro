# Audit funzionale dell'app autenticata — 18 novembre 2026

## Esito e perimetro

**L'orchestratore non rispetta tutti i parametri in tutti i percorsi. Sono presenti difetti riproducibili nei dati predittivi, nel briefing e nell'export, oltre a comandi visibili senza implementazione.** Non è una certificazione agronomica o una verifica end-to-end di ogni schermata.

Perimetro richiesto: applicazione dopo il login. Landing, video e comunicazione commerciale esclusi dalle priorità. Documentazione commerciale consultata solo per confrontare promesse e meccanismi reali.

Baseline: checkout `/Volumes/990P/ortomio-pro-check`, HEAD `0dcd9769`, con modifiche locali concorrenti al manuale e alla navigazione. Non sono state sovrascritte. Il codice pubblico non è stato assunto identico al checkout. Le query di produzione sono state esclusivamente in lettura sul progetto `qhmujoivfxftlrcrluaj`. Nessun dato operativo, account, comando fisico o configurazione modificato durante questo audit.

## Fonti storiche e aggiornamenti

- `MASTERDOC.md`, aggiornamento 30 luglio: distingue implementazione locale e readiness remota; descrive esplicitamente residui di previsione, finestre d'impianto ed export UTM.
- Rapporti M09, M10, M12, M14 e M16 di luglio: provider canonici, delivery notifiche, pilot, shadow validation e decisione NO-GO commerciale. La presenza delle migrazioni non chiude quei gate.
- Specifiche del 31 luglio: piano annuale collegato alla HomeDashboard e altitudine nella pipeline predittiva. Il commit funzionale più recente tra i file dell'orchestratore esaminati è `f960200f` del 31 luglio.
- Matrice claim del 28 agosto e specifica orchestratore del 19 agosto: consultate come requisiti, non come prova di funzionamento.
- Manuale riscritto il 18 novembre, nuovo `ORTOMIO_AUDIT_LOCALE_MANUALE_2026-11-18.md` e registro unico §5.1 del piano master: incorporati i difetti già censiti O68–O73, senza attribuirli a nuove scoperte.

Alcune fonti sono disallineate: il Masterdoc dice ancora che il piano annuale non arriva al Director e che l'altitudine non entra nelle predizioni; entrambi i collegamenti sono ora presenti. La matrice claim dice che le predizioni sono disattivate, mentre `config/features.ts` le abilita e `/app/farm` monta la dashboard tramite FeatureGate. Non basta quindi leggere un solo documento storico.

## Difetti verificati

Gli identificativi A sono riferimenti alle prove di questo rapporto, non una seconda coda operativa. Le correzioni vanno ricondotte al registro unico del piano master.

**Piano correttivo:** [piano master, §5.2](../execution-plans/ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md#52-piano-correttivo-dellapp-dopo-il-login--18-novembre-2026). A01-A07 corrispondono a O76-O82; provenienza delle predizioni e verifica delle automazioni sono O83-O84. Il piano include O68-O73 e i residui storici, con dipendenze e prove di chiusura; non costituisce esecuzione delle correzioni.

### A01 — Alta: il briefing ignora meteo e stress restituiti dal diario

`services/dailyDiaryService.ts:1308` restituisce `weather`, `tracking`, `events`. `getDailyBriefing` passa questo oggetto a `generateRecommendations`, ma `services/directorService.ts:1152` legge `weather_data` e il ramo successivo legge `agronomic_data`. Anche `generateSummary`, riga 1262, cerca il vecchio campo.

**Prova:** 40 mm di pioggia, massima 39 °C e minima 1 °C producono zero raccomandazioni quando passati nel formato reale `weather`. Gli stessi numeri in `weather_data` ne producono tre. La raccomandazione basata sullo storico ambientale è un percorso distinto e può funzionare: non si afferma che tutti gli avvisi meteo dell'app siano spenti.

**Correzione:** mappare esplicitamente il contratto del diario, chiarendo anche aggregazione per coltura e unità degli indici; testare il percorso dal diario al briefing visibile, non soltanto helper con fixture legacy.

### A02 — Alta: pioggia storica usata come previsione futura

`services/agronomicPredictionPipelineService.ts:284` carica gli ultimi 15 record da `daily_weather_log`, ordinati per data decrescente. Alle righe 310–320 li inserisce in `forecast15Days`. La funzione di ottimizzazione idrica, righe 167–169, sottrae questa pioggia dal fabbisogno futuro.

**Prova:** un record del 17 novembre con 100 mm diventa previsione per un calcolo del 18 novembre e porta l'acqua ottimizzata a zero nella fixture. Non è una previsione meteorologica: è una conversione errata tra storico e futuro.

**Correzione:** forecast con date future e provenienza esplicita; storico usato soltanto nel bilancio pregresso. In assenza di forecast dichiarare il limite, senza rinominare lo storico.

### A03 — Media: il raccolto si allontana a ogni ricalcolo

`services/agronomicPredictionPipelineService.ts:139` usa `60 + calculateAltitudeDelay(...)` giorni a partire da `input.asOf`. Data di impianto, età e stadio della pianta non ancorano la finestra.

**Prova:** con la stessa pianta e gli stessi dati, il calcolo del 18 novembre dà raccolto ottimale il 17 gennaio; quello del 28 novembre lo sposta al 27 gennaio. L'altitudine è realmente applicata, ma non risolve questa deriva. Il limite dei 60 giorni era già dichiarato nelle specifiche di luglio.

**Correzione:** ancorare la previsione al ciclo reale e alla fenologia; indicare dati insufficienti se manca una base temporale attendibile.

### A04 — Alta: risparmio idrico calcolato su task fuori periodo e senza unità

`services/agronomicPredictionPipelineService.ts:164` somma `quantity` dei task di irrigazione senza filtrare data, completamento o unità. Il loader prende gli ultimi 500 task in generale. Il confronto usa un fabbisogno derivato dal numero di piante e sottrae millimetri di pioggia senza conversione tramite superficie.

**Prova:** un task già completato del gennaio 2025, quantità 100, viene contato come `currentUsage=100` nel novembre 2026. Non è una misura dei consumi correnti e non dimostra un risparmio reale. Questo riguarda la pipeline predittiva, non implica lo stesso difetto in ogni calcolatore irriguo dell'app.

**Correzione:** finestra temporale esplicita, distinzione piano/eseguito, misure effettive e normalizzazione dimensionale prima di esporre percentuali o costi.

### A05 — Media: altitudine e tipo suolo persi nelle finestre d'impianto

`app/api/garden/sun-exposure/planting-windows/route.ts:111` chiama `findPlantingWindows` con sei argomenti; i parametri opzionali `soilType` e `altitudeMeters` del motore non vengono valorizzati, nonostante la query abbia caricato l'intero garden. Il piano annuale della HomeDashboard usa proprio questo endpoint.

Inoltre `services/plantingWindowOptimizer.ts:73` dichiara esplicitamente che `historicalWeather` non modifica il risultato. Non è un motore privo di qualsiasi contesto: coordinate, sole, ostacoli e anno arrivano; questi altri tre fattori no.

**Correzione:** trasferire e normalizzare suolo/altitudine; verificare casi a quote diverse. Definire separatamente la regola da applicare allo storico meteorologico, senza inventarla per eliminare il TODO.

### A06 — Alta: GeoJSON UTM etichettato senza trasformazione

La UI `components/prescription/MapExportModal.tsx:259` permette UTM. `services/geoExportService.ts:554` restituisce invece le coordinate inalterate; l'export GeoJSON scrive il CRS UTM, con EPSG 32633 fisso a riga 764.

**Prova:** coordinate in gradi restano identiche, mentre il CRS dichiarato è metrico UTM. Il problema è la geometria interpretata nel sistema sbagliato, non un'etichetta puramente estetica.

**Correzione:** disabilitare questa opzione finché non esiste una trasformazione verificata per zona/emisfero; mantenere un export WGS84 coerente.

### A07 — Media: il formato Shapefile predefinito non è implementato

`components/prescription/MapExportModal.tsx:41` preseleziona `shapefile`. `services/geoExportService.ts:562` lancia sempre un errore perché manca l'encoder binario.

**Prova:** il generatore rifiuta anche un input valido; il servizio propaga un risultato fallito. Non è un falso successo, ma un percorso offerto e predefinito che non può riuscire. Non estendere questa conclusione agli altri formati.

**Correzione:** offrire un formato realmente supportato come default e rendere esplicita l'indisponibilità dello Shapefile, oppure implementare e validare l'encoder.

### Ulteriore limite di affidabilità delle predizioni

Alle righe 201–208, la mancanza di tutti i timestamp delle fonti produce età zero e confidenza 0,9; `sensorBacked=true` classifica l'intero bundle come `measured`. La fixture lo riproduce. Nel loader normale alcune date possono essere presenti: questa è una debolezza del contratto e della provenienza, non una prova che ogni previsione di produzione abbia confidenza errata.

## Funzioni visibili già censite, ancora non operative

Riconfermate leggendo i gestori attuali; non inviate richieste reali per provarle:

| Riferimento esistente | Percorso dopo login | Risultato reale |
|---|---|---|
| O68 | Impostazioni generiche | Salva Modifiche, Scarica Backup ed Elimina Account senza handler. I moduli dedicati sono distinti. |
| O69 | Salute → consulto agronomo | Crea un oggetto e un console.log, poi dichiara invio e risposta entro 24 ore; nessun writer o delivery. |
| O72 | Impostazioni → test satellite | Non verifica `response.ok`; un JSON di errore senza `simulated` viene classificato successo. |
| O71 | Centro operativo → campo senza alert | Naviga sempre all'hub garden, anche per colture specializzate; limite già riportato nel nuovo manuale. |
| O73 | Mappe → Anteprima | Avviso di funzione in sviluppo, non una vera anteprima. |

## Matrice dei parametri e dei percorsi

“Collegato” significa presenza nel percorso letto, non validazione agronomica o E2E in produzione.

| Parametro/funzione | Evidenza | Valutazione |
|---|---|---|
| Identità garden | Query e API con contesto garden; test autorizzazione/persistenza verdi | Coperto localmente; non rifatta matrice completa tra due utenti reali |
| Coordinate, sole, ostacoli | Endpoint finestre → seasonal windows → optimizer | Collegati |
| Tipo suolo nelle finestre | Argomento non passato | A05 |
| Altitudine nelle finestre | Argomento non passato | A05 |
| Storico meteo nelle finestre | Parametro presente ma inutilizzato | Gap esplicito |
| Piano annuale → HomeDashboard | Fetch finestre, generateAnnualPlan, quarto argomento del bridge | Collegamento ripristinato rispetto al Masterdoc |
| Altitudine nella resa | Loader gardens.altitude_meters, calculateAltitudeDelay, test dedicato | Collegata; non corregge A03 |
| Età/stadio nella data raccolto | Raccolto calcolato da asOf + 60 giorni | A03 |
| Meteo e stress nel testo del briefing | Contratto weather/tracking contro campi legacy | A01 |
| Storico ambientale nel briefing | Percorso separato e test dedicato | Funziona localmente |
| Pioggia futura nelle ottimizzazioni | Derivata dal diario passato | A02 |
| Volume, periodo e unità dell'acqua | quantity generica di task senza filtro | A04 |
| Qualità/freschezza fonte | Timestamp incompleti non penalizzati adeguatamente | Limite riprodotto |
| Priorità: segnali, fenologia, pH, esposizione | scoreAgronomicPriority applica modificatori e copertura | Collegati nel motore; calibrazione non certificata |
| Economia e feedback misurato | Modificatori espliciti nei punteggi e suite precision hub | Copertura locale, esito agronomico reale da validare |
| Fase lunare/fotoperiodo | Calcolo dedicato e suite Director | Test software verdi; non prova efficacia agronomica |
| Task → moduli esecuzione | Bootstrap e contesto su irrigazione/nutrizione/raccolti/lavorazioni | Test locali verdi; non eseguite operazioni fisiche |
| Export coordinate/formato | UI collegata al servizio | A06–A07 |

## Produzione: automazioni e presenza dati

Query in lettura del 18 novembre sul progetto indicato dall'utente:

| Controllo | Risultato |
|---|---|
| Tabelle campionate | Presenti tutte e 10: agronomic_predictions, monitoring_runs, notification_delivery_queue, organization_commercial_accounts, orchard_trees, vineyard_vines, olive_maturity_tracking, garden_soil_states, planting_plans, seedling_batches |
| monitoring_runs | 6 record; ultimo creato il 22 luglio 2026 alle 11:16:52 UTC |
| notification_delivery_queue | 0 record |
| agronomic_predictions | 0 record |
| cron.job | Relazione assente |
| vercel.json locale | Pianifica soltanto `/api/cron/daily-diary` |

**Non c'è evidenza recente del monitoraggio nel suo registro canonico.** Le code vuote non provano da sole un guasto: potrebbero mancare invocazioni o input. L'assenza di cron locali/pg_cron non esclude uno scheduler esterno non ispezionato. Occorre verificare configurazione effettiva di produzione e invocazioni autenticate di health-check e notification-delivery, senza dedurre che l'esistenza di un endpoint equivalga a una schedulazione attiva.

## Verifiche eseguite e limiti

- 424/424 test delle nove suite applicative comprese in test:release: security, capabilities, persistence, physical operations, health/predictions/monitoring, remote-data isolation, regulatory/export/admin, rollout/observability, precision hub.
- Meteo: 13/13. Manuale: 10/10. Totale rilevante: **447 test passati**.
- TypeScript: `tsc --noEmit --incremental false` completato con exit code 0.
- La suite generale termina non verde per 13 test della landing: esclusi dalle priorità applicative di questo rapporto, come richiesto.
- `release:check`: localReady=true, deployReady=false; controlla anche la presenza di file, non sostituisce le prove di comportamento.
- Riproduzioni diagnostiche A01–A07 eseguite senza rete né mutazioni remote; sorgente `reproduce.ts`, output `reproductions.log` nella stessa directory. Gli assert documentano il comportamento difettoso corrente: dopo la correzione vanno sostituiti da test dell'esito corretto.
- Non ripetuti in questa sessione build completa, browser E2E con salvataggi, invio provider, comandi IoT, ciclo completo di ogni coltura, restore o isolamento multi-account remoto. Le visite browser dell'altro rapporto del 18 novembre sono evidenza storica attribuita a quel rapporto, non esecuzioni svolte qui.

Esecuzione delle prove:

```sh
NODE_OPTIONS=--conditions=react-server ./node_modules/.bin/tsx docs/reports/audit-2026-11-18/reproduce.ts
```

## Ordine delle correzioni

1. Eliminare falsi successi: consulto agronomo, test satellite, comandi Impostazioni senza effetto.
2. Correggere contratto del briefing, storico/forecast e calcolo dei consumi nella pipeline.
3. Verificare e riattivare consapevolmente le automazioni con input di prova isolati e registri verificabili.
4. Correggere coordinate export e formati non supportati.
5. Collegare parametri delle finestre, ancorare raccolti alla coltivazione reale e definire regole per dati mancanti.
6. Eseguire prove E2E con rilettura dei dati su un ambiente di prova: proposta → task → esecuzione registrata → storico → feedback. Solo dopo questi passaggi dichiarare chiusi i relativi difetti.

Questo intervento consegna diagnosi e prove, non modifica il comportamento applicativo o la produzione.


## Correzioni successive

Le riproduzioni sopra documentano la baseline difettosa. Stato delle correzioni e prove del candidato: [EXECUTION](./EXECUTION.md); ambiente e comandi: [LOCAL_RUNBOOK](./LOCAL_RUNBOOK.md). Gli assert di riproduzione storici non sono test dell’esito corretto.
