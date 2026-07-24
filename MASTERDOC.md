# OrtoMio — Masterdoc canonico

- **Versione:** 3.1 release candidate P0-P8 + correzioni 21-22/07
- **Ultimo aggiornamento:** 2026-07-22
- **Repository canonico:** `/Volumes/990P/ortomio-main`
- **Baseline verificata:** `main` = `c7ab657` (22 luglio 2026, pomeriggio) — antenato diretto della catena P0-P9 di questo documento, nessuna divergenza
- **Documento sorgente confrontato:** `/Users/magma/Desktop/MASTERDOC_16Luglio-2026.md`
- **SHA-256 del sorgente:** `4e03edb1134179be16ebb2a5393bbbdba27632ba06a600d49e685bc7a5bd18d0`
- **Stato:** documento unico canonico di prodotto, architettura e maturita; rollout remoto differito
- **Scopo:** spiegare cosa fa OrtoMio, come lo fa, quali dati usa, quali calcoli esegue, cosa e realmente operativo e come completare il prodotto.

Questo file sostituisce e assorbe il vecchio documento `docs/ORTOMIO_DOCUMENTAZIONE_COMPLETA.md`, che era una fotografia tecnica datata gennaio 2026. Da questo aggiornamento il riferimento unico da leggere e mantenere e `MASTERDOC.md`.

Questo documento non e soltanto un manuale operativo. E una fusione tra:

- manuale prodotto;
- spiegazione funzionale;
- mappa tecnica dei moduli;
- descrizione dei calcoli;
- catena dati -> decisione -> azione -> storico;
- limiti attuali da conoscere durante evoluzione e test;
- audit di completezza e visibilita;
- piano esecutivo, rollout e criteri di rilascio.

La baseline corretta e il checkout 990P. Il checkout LaCie e un antenato fermo al 15 gennaio 2026: 990P e 383 commit avanti e modifica 1.281 file rispetto a quella base. Le analisi precedenti eseguite su LaCie sono state riesaminate sul codice 990P e assorbite qui.

## 0. Stato vincolante della release candidate

P0-P8 sono implementate e verificate nella baseline locale del 17 luglio 2026. Sono verdi le suite di fase, 228 test di regressione, type-check, build da 144 pagine. Questa evidenza non equivale a un deploy di produzione.

Restano obbligatori prima dell'attivazione remota: snapshot del target, restore drill sul target autorizzato (ultimo backup reale disponibile: 12 gennaio 2026 — non un drill recente), riconciliazione completa delle migrazioni (vedi sotto), verifica drift e RLS cross-tenant, Security Advisor, smoke dei provider, shadow mode, pilot e prova del rollback. In assenza di questi gate `deployReady` resta `false`.

**Stato migrazioni verificato il 22/07** (non piu una stima): `schema_migrations` remoto ha 40 righe tracciate; 79 file locali restano da riconciliare uno per uno via query read-only su `information_schema` (nessun branch disponibile, piano Supabase free); 3 file hanno naming che ne impedisce l'applicazione automatica, decisione ancora da prendere. Dettaglio operativo in `docs/reports/execution-plans/ORTOMIO_ROADMAP_INDUSTRIALIZZAZIONE_2026-07-22.md`.

Nessun comando fisico, provider remoto o capability critica e stato attivato. Le funzioni non validate restano spente server-side; drone e blockchain restano simulazioni isolate (decisione confermata il 22/07: nessun hardware/blockchain reale previsto a breve, restano cosi).

**Correzioni verificate 21-22 luglio 2026** (bug reali trovati e corretti in produzione, fuori dal perimetro P0-P8 originale — dettaglio completo in `docs/reports/execution-plans/` e PR #34-#44 su GitHub):
- Checkout riproducibile (lockfile canonico), CORS rotto su `compute-field-alerts`, hang su "Verifica autenticazione...".
- Persistenza meteo storica (`daily_weather_log`) non scriveva mai nulla per due bug distinti (nomi colonna sbagliati, client anonimo senza permessi in contesto cron) — corretto e verificato con query reale.
- Chiavi Gemini/OpenRouter/Groq/HuggingFace esposte lato client (una addirittura hardcoded nel sorgente) — rimosse; 9 funzioni AI legacy migrate su una route server-side unica (`/api/ai/generate`) gated per tier e crediti.
- 11 file con identita fittizie (`'current-user'` letterale) invece dell'utente autenticato reale — 5 erano bug funzionali attivi (es. notifiche sempre vuote per ogni utente reale), 5 corrompevano l'audit trail.
- Lint era disattivato senza motivo tecnico (script faceva solo `echo`) — riattivato; dei 39 errori reali emersi, corretti i 10 hook React chiamati dopo un return condizionale (bug dormiente, innocuo solo perche il tier-gating e oggi disattivato).
- `smartOperationsService.ts`: su errore API meteo restituiva dati completamente casuali usati per warning reali su irrigazione/trattamenti; separatamente l'umidita era sempre finta anche a chiamata riuscita (Open-Meteo non la include nel blocco daily).
- `intelligentNotificationService.ts`: l'invio notifiche costruiva l'oggetto per la funzione di invio reale ma non la chiamava mai, marcando comunque un falso "inviato con successo".

Nessuna di queste correzioni ha cambiato lo stato `deployReady`/`maturity` di alcuna capability — sono bug fix, non promozioni. Vedi sezione 28 per il registro di maturita reale.

La regola di lettura e semplice: quando il documento dice che una funzione "calcola", deve spiegare almeno:

1. quali input legge;
2. quale trasformazione applica;
3. quale output produce;
4. dove l'utente vede il risultato;
5. dove il sistema lo salva o lo riusa.

## 1. Tesi del prodotto

OrtoMio non e solo un'app per registrare un orto. Il prodotto prova a trasformare un insieme di osservazioni agricole in decisioni operative.

La catena principale e:

```text
Campo / giardino / azienda
  -> zone, filari, colture, piante, suolo, esposizione, acqua, meteo, storico
  -> motori agronomici e calcoli
  -> priorita, avvisi, mappe, trattamenti, irrigazioni, task
  -> esecuzione e diario
  -> feedback misurato
  -> nuova decisione piu precisa
```

Il valore sta quindi in tre cose:

- conoscere il contesto reale del terreno;
- non perdere memoria delle operazioni fatte;
- suggerire l'azione piu utile nel momento corretto, spiegando il perche.

## 2. Mappa generale dell'applicazione

### 2.1 Route applicative esistenti

Le route sotto `app/app` mostrano l'ampiezza del prodotto. Esistenza della pagina e visibilita non sono sinonimi: la sidebar primaria espone solo un sottoinsieme, descritto nella sezione 52.

- `/app`: dashboard operativa;
- `/app/garden`: gestione giardino/campo;
- `/app/farm`: vista aziendale;
- `/app/zones`: zone operative;
- `/app/plants`: piante e tracking;
- `/app/planner` e `/app/pianifica`: pianificazione;
- `/app/calendar`: calendario;
- `/app/diary` e `/app/journal`: diario e storico;
- `/app/irrigation`: irrigazione;
- `/app/nutrition`: nutrizione e concimazioni;
- `/app/treatments`: trattamenti;
- `/app/health`: salute piante;
- `/app/orchard`: frutteto;
- `/app/olives`: oliveto;
- `/app/vineyard`: vigneto;
- `/app/semenzaio`: semenzaio;
- `/app/mechanical-work`: lavori meccanici;
- `/app/prescription-maps`: mappe di prescrizione;
- `/app/ndvi`: dati satellitari/NDVI;
- `/app/certifications`: certificazioni;
- `/app/reports` e `/app/export`: report ed esportazioni;
- `/app/settings`: configurazione.

### 2.2 Struttura logica

Il codice e organizzato in quattro livelli:

- `app/`: pagine, route API, flussi utente;
- `components/`: interfacce, form, viste specialistiche;
- `services/`: logica di dominio, calcoli, orchestrazione, persistenza applicativa;
- `types/`: modelli dati e contratti TypeScript;
- `packages/core/storage/`: provider di storage astratto.

La verita del prodotto non e in una sola pagina. E distribuita nei servizi. Per questo il documento deve seguire il dominio, non solo le route.

## 3. Il modello dati mentale

OrtoMio ragiona per entita collegate.

### 3.1 Garden

Il garden e l'unita principale. Puo rappresentare:

- un orto domestico;
- un campo;
- una parte di azienda;
- un appezzamento;
- un contesto produttivo piu strutturato.

Dentro il garden vivono zone, piante, filari, task, irrigazioni, trattamenti, osservazioni, mappe e decisioni.

### 3.2 Zone e filari

La zona serve a localizzare un'azione. Un trattamento o una irrigazione non e solo "fatto nel giardino": idealmente e fatto in una zona, un filare o un gruppo di piante.

Questo permette al sistema di:

- distinguere aree con suolo diverso;
- distinguere aree con esposizione diversa;
- calcolare interventi piu precisi;
- creare storico localizzato;
- generare mappe di prescrizione.

### 3.3 Piante e colture

La pianta puo essere trattata come:

- coltura generica;
- specie o varieta;
- pianta individuale;
- filare;
- lotto produttivo.

Il motore agronomico prova a ricondurre questi dati a un profilo agronomico. Quando trova un profilo preciso, aumenta la fiducia. Quando deve usare fallback generici, abbassa la fiducia.

### 3.4 Storici

Gli storici sono fondamentali perche trasformano OrtoMio da agenda a sistema decisionale:

- diario operativo;
- ledger decisionale;
- feedback misurati;
- storico meteo e ambientale;
- trattamenti;
- irrigazioni;
- concimazioni;
- lavori meccanici;
- raccolte;
- mappe generate ed eseguite.

## 4. La catena decisionale

### 4.1 Input grezzi

Il sistema puo usare:

- posizione geografica;
- latitudine e longitudine;
- meteo;
- pioggia;
- temperature;
- umidita;
- vento;
- ore di sole;
- ostacoli;
- tipo di suolo;
- pH;
- esposizione;
- pendenza;
- altitudine;
- coltura;
- portinnesto;
- forma di allevamento;
- stato fenologico;
- storico operazioni;
- feedback di efficacia;
- sensori;
- NDVI;
- mappe;
- inventario prodotti.

### 4.2 Normalizzazione

I servizi non dovrebbero prendere decisioni direttamente su stringhe libere. Molti moduli normalizzano:

- testo in minuscolo;
- spazi;
- sinonimi di colture;
- categorie operative;
- segnali disponibili;
- focus dell'intervento.

Esempio: `agronomicPriorityService.ts` normalizza hint e testi per capire se un suolo e sabbioso o argilloso anche quando l'utente scrive in italiano o inglese.

### 4.3 Focus agronomico

Molti motori ragionano su quattro focus:

- `water`: acqua e stress idrico;
- `nutrition`: nutrizione, fertilita, pH, concimazione;
- `health`: salute, malattie, parassiti, stress;
- `quality`: qualita produttiva.

Il focus e importante perche lo stesso dato puo pesare in modo diverso.

Esempio:

- poche ore di sole possono ridurre lo stress idrico;
- ma possono aumentare pressione sanitaria;
- e possono incidere sulla qualita.

## 5. Orchestratore e Director

Il servizio `directorService.ts` coordina molti motori. Non e un'intelligenza magica autonoma: e un compositore.

Importa e combina:

- `dailyDiaryService`;
- `advancedIrrigationService`;
- `agronomicActionQueueService`;
- `agronomicMeasuredFeedbackService`;
- `agronomicPriorityService`;
- `agronomicEconomicPriorityService`;
- `agronomicDecisionExplanationService`;
- `agronomicRefinedContextService`;
- `gardenContextResolverService`;
- `phenologyService`;
- `plantHealthMonitoringService`;
- `prescriptionMapsService`;
- `environmentalMonitoringService`;
- `agronomicDecisionLedgerService`;
- `healthScopeService`;
- `taskExecutionLaunchService`;
- funzioni da `logic/director`.

### 5.1 Cosa produce

Il Director produce un `DailyBriefing`.

Un briefing contiene:

- data;
- gardenId;
- riepilogo;
- azioni critiche;
- coda trasversale agronomica;
- meteo sintetico;
- insight agronomici;
- riepilogo ambientale;
- fase lunare;
- raccomandazioni;
- statistiche.

Gli insight agronomici includono campi come:

- `gdd_base_10`;
- `heat_stress_hours`;
- `water_stress_index`;
- `photoperiod_hours`.

### 5.2 Coda operativa

Il Director non si limita a dire "attenzione". Crea o alimenta una coda di azioni con:

- priorita;
- urgenza;
- impatto;
- fattibilita;
- costo;
- punteggio finale;
- ragionamento;
- confidenza;
- segnali mancanti;
- spiegazione decisionale;
- link di esecuzione task.

### 5.3 Perche serve il ledger

Senza ledger, il sistema suggerirebbe ma non ricorderebbe perche ha suggerito.

Il ledger decisionale salva:

- fonte della decisione;
- focus;
- profilo agronomico;
- ambito;
- task creato;
- data pianificata;
- stato;
- snapshot della decisione.

Questo e il ponte tra AI/agronomia e responsabilita operativa.

## 6. Priorita agronomica

Il servizio `agronomicPriorityService.ts` calcola un punteggio di priorita 0-100 e una confidenza.

### 6.1 Input principali

Il calcolo riceve:

- `baseScore`;
- `confidence`;
- profilo agronomico risolto;
- focus (`water`, `nutrition`, `health`, `quality`);
- segnali disponibili;
- fase critica;
- feedback misurato;
- riepilogo economico;
- riepilogo ambientale;
- contesto raffinato.

### 6.2 Copertura segnali P0

Ogni profilo agronomico puo richiedere segnali P0. Il sistema calcola:

- segnali richiesti;
- segnali coperti;
- segnali mancanti;
- rapporto di copertura.

Formula logica:

```text
coverageRatio = segnaliP0Coperti / segnaliP0Richiesti
```

Se non ci sono segnali P0 richiesti, la copertura vale 1.

### 6.3 Formula del punteggio

Il punteggio parte da `baseScore`.

Poi aggiunge o sottrae:

```text
score += round((confidence - 0.5) * 18)
score += round((coverageRatio - 0.5) * 14 * signalCoverageWeight)
score += baseScoreDelta del profilo
score += bonus fase critica
score += adjustment feedback misurato
score += adjustment economico
score += adjustment pressione ambientale
score += adjustment contesto raffinato
score += adjustment fonte profilo
```

Alla fine il punteggio viene allineato alla raccomandazione economica e limitato tra 0 e 100.

### 6.4 Effetto della fonte del profilo

Il sistema premia profili piu precisi:

- fonte `plant_id`: +4 punti;
- fonte `custom_crop`: +3 punti;
- fonte `taxonomy` o `functional_category`: +2 punti;
- fonte `fallback`: -3 punti.

Questo evita che una raccomandazione generica sembri precisa quanto una basata su coltura riconosciuta.

### 6.5 Confidenza

La confidenza parte dal valore normalizzato e viene ricalcolata combinando:

- confidenza originale;
- copertura segnali;
- qualita della fonte profilo;
- modificatori del profilo;
- feedback misurato;
- riepilogo economico;
- contesto raffinato;
- storico ambientale.

Il risultato viene limitato tra 0.3 e 0.98.

### 6.6 Contesto raffinato

Il contesto raffinato modifica la priorita in base a condizioni reali del sito.

Per `water`:

- suolo sabbioso: +4;
- suolo argilloso: +1;
- esposizione alta: +3;
- vento/scarsa protezione: +2;
- sole >= 8 ore: +4;
- sole >= 6 ore: +2;
- sole <= 3.5 ore: -3;
- almeno 2 ostacoli d'ombra: -2.

Per `health`:

- sito riparato: +2;
- sole <= 4 ore: +3;
- almeno 2 ostacoli: +3;
- suolo argilloso: +1;
- sito esposto e sole >= 7 ore: -2.

Per `nutrition`:

- pH < 5.8 o > 7.8: +6;
- pH < 6.2 o > 7.3: +3;
- suolo sabbioso: +2;
- suolo argilloso: +1.

Per `quality`:

- altitudine >= 700 m: +3;
- pendenza ripida: +1;
- sole <= 4 ore: +3;
- pH fuori finestra: +2.

Poi il sistema considera anche sottosistemi come:

- portinnesto;
- forma di allevamento;
- sistemi orientati a qualita;
- sistemi orientati a resa.

## 7. Priorita economica

Il servizio `agronomicEconomicPriorityService.ts` affianca al punteggio agronomico una lettura economica.

### 7.1 Perche esiste

Due interventi possono essere entrambi agronomicamente corretti, ma non ugualmente convenienti.

Il motore prova a stimare:

- costo dell'intervento;
- costo del ritardo;
- valore protetto;
- impatto netto;
- rapporto ROI;
- azione raccomandata.

### 7.2 Alternative valutate

Le alternative sono:

- `intervene_now`: intervenire ora;
- `next_cycle`: rimandare al prossimo ciclo;
- `monitor`: monitorare senza intervenire subito.

L'output puo raccomandare:

- `immediate`;
- `next_cycle`;
- `monitor`.

### 7.3 Come influenza la priorita

La raccomandazione economica puo riallineare il punteggio:

- se raccomanda intervento immediato, il punteggio viene portato almeno circa a 75-78;
- se raccomanda prossimo ciclo, viene contenuto in fascia intermedia;
- se raccomanda monitoraggio, viene abbassato sotto circa 44.

Questo impedisce che un'azione a basso valore economico finisca in cima solo per un segnale tecnico isolato.

### 7.4 Esempio

Se un vigneto in fase critica ha stress idrico alto, valore produttivo elevato e costo del ritardo alto:

```text
priorita agronomica alta
+ costo del ritardo alto
+ valore protetto alto
=> intervento immediato
=> score finale spinto in fascia alta
```

Se invece il segnale e debole, il valore protetto basso e il costo di intervento alto:

```text
priorita agronomica media
+ basso ROI
=> monitoraggio
=> score finale compresso
```

## 8. Irrigazione

OrtoMio ha piu livelli irrigui:

- calcolo manuale semplice;
- gestione impianti;
- storico irrigazioni;
- efficienza;
- stress idrico;
- possibile integrazione con meteo/sensori.

Il servizio `irrigationCalculatorService.ts` calcola portata, durata e confidenza per diversi sistemi.

### 8.1 Sistema a goccia

Metodo 1: portata per gocciolatore x numero gocciolatori.

```text
portataTotaleLph = dripperFlowRateLph * dripperCount
durataMinuti = ceil((volumeTargetLitri / portataTotaleLph) * 60)
```

Confidenza: alta.

Metodo 2: passo gocciolatori e lunghezza filare.

```text
spacingM = dripperSpacingCm / 100
numeroGocciolatori = floor(rowLengthM / spacingM)
portataTotaleLph = dripperFlowRateLph * numeroGocciolatori
durataMinuti = ceil((volumeTargetLitri / portataTotaleLph) * 60)
```

Confidenza: alta.

Fallback:

```text
portataStimata = 20 L/h
durataMinuti = ceil((volumeTargetLitri / 20) * 60)
```

Confidenza: bassa.

### 8.2 Sprinkler

Input:

- portata ugello;
- numero ugelli;
- efficienza.

Formula:

```text
portataTotaleLph = sprinklerFlowRateLph * sprinklerCount
portataEffettivaLph = portataTotaleLph * (efficiency / 100)
durataMinuti = ceil((volumeTargetLitri / portataEffettivaLph) * 60)
```

Default efficienza: 75%.

### 8.3 Tubo o manichetta

Metodo migliore: portata misurata.

```text
flowRateLph = hoseFlowRateLpm * 60
durataMinuti = ceil(volumeTargetLitri / hoseFlowRateLpm)
```

Confidenza: alta.

Metodo teorico: diametro e pressione, con formula di Torricelli semplificata.

```text
diameterM = hoseDiameterMm / 1000
areaM2 = PI * (diameterM / 2)^2
heightM = pressureBar * 10
velocityMs = sqrt(2 * 9.81 * heightM) * 0.6
flowRateM3s = areaM2 * velocityMs
flowRateLph = flowRateM3s * 1000 * 3600
durationMinutes = ceil(volumeTargetLitri / (flowRateLph / 60))
```

Confidenza: media, perche una stima teorica dipende da perdite, curve, rubinetti, pressione reale.

Fallback:

```text
estimatedFlowLpm = hoseDiameterMm ? (hoseDiameterMm / 10) * 2 : 15
durationMinutes = ceil(volumeTargetLitri / estimatedFlowLpm)
```

Confidenza: bassa.

### 8.4 Solco

Per il solco il sistema considera:

- lunghezza;
- larghezza;
- area bagnata;
- infiltrazione;
- profondita target.

La logica serve a stimare quanta acqua serve per bagnare il volume di suolo desiderato.

### 8.5 Perche la confidenza conta

Un calcolo basato su dati misurati e diverso da una stima.

OrtoMio espone o porta con se:

- metodo usato;
- confidenza;
- note;
- avvisi;
- suggerimenti per migliorare la precisione.

## 9. Sole, esposizione e ostacoli

Il servizio `preciseSunCalculator.ts` calcola posizione del sole e ore di sole diretto.

### 9.1 Posizione solare

Input:

- latitudine;
- longitudine;
- data;
- ora.

Calcoli:

- giorno dell'anno;
- declinazione solare;
- correzione temporale per longitudine e timezone;
- ora solare;
- angolo orario;
- elevazione;
- azimut.

Formula semplificata usata:

```text
declination = 23.45 * sin(360 * (284 + dayOfYear) / 365)
hourAngle = 15 * (solarTime - 12)
elevation = asin(sin(lat) * sin(decl) + cos(lat) * cos(decl) * cos(hourAngle))
azimuth = atan2(...)
```

### 9.2 Ostacoli

Un ostacolo ha:

- azimut;
- altezza;
- distanza;
- ampiezza angolare;
- tipo.

Il sistema calcola l'elevazione apparente dell'ostacolo:

```text
obstacleElevation = atan2(height, distance)
```

Poi verifica:

```text
se il sole e nella direzione dell'ostacolo
e l'elevazione del sole e piu bassa dell'ostacolo
=> sole bloccato
```

### 9.3 Ore di sole diretto

Il calcolo giornaliero campiona dalle 6:00 alle 18:00 ogni 10 minuti.

Per ogni step:

- calcola posizione del sole;
- ignora il sole sotto orizzonte;
- controlla ostacoli;
- aggiunge minuti se non bloccato.

Output:

```text
oreSole = round((minutiSole / 60) * 10) / 10
```

### 9.4 Medie mensili

Il calcolo mensile non misura ogni giorno. Campiona giorni rappresentativi:

- 10% del mese;
- 30%;
- 50%;
- 70%;
- 90%.

Poi calcola:

- media;
- minimo;
- massimo.

Questo e utile per scegliere periodi di coltivazione e valutare esposizione stagionale.

## 10. Meteo, ambiente e pressione

I servizi ambientali alimentano il Director e la priorita.

Gli output ambientali possono includere:

- classe fonte meteo;
- fonte primaria;
- qualita del segnale meteo;
- confidenza regionale;
- confidenza locale;
- precedenza sensori;
- segnali sensore;
- livello stress idrico suolo;
- note di circolazione aria;
- note sito;
- giorni recenti di pressione malattia alta;
- giorni recenti di stress idrico alto;
- giorni recenti con basso potere asciugante.

Questi dati diventano input nei punteggi:

- per `water`, piu giorni di stress idrico aumentano la priorita;
- per `nutrition`, stress idrico e pressione malattia possono aumentare urgenza;
- per `health`, giorni di pressione malattia alti aumentano priorita.

## 11. Salute piante

Il servizio `plantHealthMonitoringService.ts` genera alert e azioni.

### 11.1 Tipi di alert

Gli alert possono essere:

- rischio malattia;
- parassiti;
- carenza nutrizionale;
- sintomi di stress;
- timing raccolta;
- stress meteo.

Ogni alert contiene:

- severita;
- pianta;
- descrizione;
- data rilevazione;
- azioni suggerite;
- richiesta foto;
- consulenza agronomo;
- urgenza in giorni;
- confidenza;
- trigger.

### 11.2 Regole esempio

Peronospora pomodoro:

- umidita almeno 80%;
- temperatura 15-25 gradi;
- bagnatura fogliare almeno 50;
- durata 12 ore;
- eta pianta oltre 30 giorni;
- stagione primavera/estate.

Azioni:

- controllo foglie;
- foto;
- trattamento preventivo.

Afidi primaverili:

- mesi marzo, aprile, maggio;
- stagione primavera;
- ispezione germogli;
- identificazione parassiti.

Carenze nutrizionali:

- analisi colore foglie;
- anomalie crescita;
- eta pianta oltre 14 giorni;
- concimazione correttiva.

### 11.3 Collegamento al Director

Le piante con stato `diseased` o `dead` possono essere trasformate in `HealthAlert`.

Regola:

- `healthScore <= 20`: severita critica;
- altrimenti severita alta;
- stato `dead`: suggerisce rimozione/sostituzione;
- stato `diseased`: suggerisce monitoraggio/intervento;
- se critica: consulenza agronomo consigliata.

## 12. Nutrizione e trattamenti

Il servizio `advancedNutritionService.ts` gestisce:

- prodotti fertilizzanti;
- prodotti trattamento;
- trattamenti nutrizionali;
- inventario;
- movimenti stock;
- storico;
- analytics;
- compliance;
- compatibilita prodotti;
- soglie adattive;
- qualita acqua irrigua;
- analisi suolo.

Questa e la superficie funzionale avanzata. Lo stato complessivo resta ibrido perche `treatmentRegistryService` e `phytoInventoryService` conservano ancora percorsi legacy browser-backed o incompleti. Le funzioni avanzate non vanno dichiarate operative finche writer, inventario e registro non convergono sul contratto DB-first della sezione 54.

### 12.1 Prodotti fertilizzanti

Ogni prodotto puo essere filtrato per:

- garden;
- attivo;
- ammesso bio.

La cancellazione e logica: imposta `is_active = false`, non elimina necessariamente la memoria.

### 12.2 Prodotti trattamento

I prodotti trattamento possono essere filtrati per:

- tipo trattamento;
- biologico;
- garden;
- stato attivo.

### 12.3 Trattamenti nutrizionali

I trattamenti sono filtrabili per:

- intervallo date;
- tipo trattamento;
- stato;
- zona;
- solo bio.

Questo permette viste operative e storiche.

### 12.4 Apprendimento

Il servizio importa:

- `buildAgronomicNutritionLearningAdjustment`;
- `buildAgronomicQualityLearningAdjustment`;
- snapshot di apprendimento agronomico.

Quindi nutrizione e qualita non sono solo registrazioni: possono contribuire a migliorare le soglie decisionali.

## 13. Mappe di prescrizione

Il servizio `prescriptionMapsService.ts` e il motore delle mappe di precision farming.

### 13.1 Cosa gestisce

Gestisce:

- mappe;
- export;
- zone;
- esecuzioni;
- NDVI;
- punti pianta;
- punti suolo;
- algoritmi di generazione zone;
- algoritmi prescrizione;
- analisi costi.

### 13.2 Statistiche mappe

Calcola:

- mappe totali generate;
- mappe generate nel mese;
- area totale coperta;
- tipi mappa piu usati;
- formati export piu usati;
- zone medie per mappa;
- quality score medio;
- completezza dati media;
- success rate;
- risparmio costi totale;
- ROI medio;
- riduzione input;
- utenti attivi;
- download;
- integrazioni macchine.

Esempi di formule:

```text
totalAreaCovered = sum(map.areaHectares)
averageZonesPerMap = average(map.totalZones)
averageQualityScore = average(map.qualityScore)
successRate = average(map.validationStatus === 'invalid' ? 0 : 100)
totalCostSavings = sum(map.costSavings)
averageRoi = average(map.costAnalysis.roi)
```

### 13.3 Intelligenza agronomica della mappa

Per una mappa, il servizio combina:

- efficacia esecuzione;
- varianza;
- outcome;
- feedback misurati;
- snapshot apprendimento;
- riepiloghi ambientali per zona.

Poi costruisce un riepilogo agronomico di prescrizione.

La logica e: una mappa non e valida solo perche e stata generata. Va confrontata con esecuzione, risultati e condizioni ambientali.

## 14. Ledger decisionale

Il servizio `agronomicDecisionLedgerService.ts` salva la memoria delle decisioni.

### 14.1 Cosa salva

Ogni entry contiene:

- id;
- gardenId;
- queueItemId;
- source;
- focus;
- profilo agronomico;
- scope;
- pianta;
- task;
- data pianificata;
- stato;
- data creazione;
- data aggiornamento;
- snapshot decisionale.

### 14.2 Stati

Gli stati principali sono:

- `task_created`;
- `completed`.

### 14.3 Summary

Il summary calcola:

```text
totalEntries = numero entry
taskCreated = entry con status task_created
completed = entry con status completed
withExplanation = entry con spiegazione decisionale
byFocus = conteggio per focus
bySource = conteggio per fonte
latestEntry = entry piu recente
```

### 14.4 Persistenza

Il ledger prova prima a usare metodi DB dedicati:

- `getAgronomicDecisionLedgerEntries`;
- `upsertAgronomicDecisionLedgerEntry`.

Se non disponibili, usa preferenze utente:

```text
agronomic_decision_ledger:{gardenId}
```

Questa doppia strada indica una logica di compatibilita: l'app puo funzionare anche se il provider evoluto non e disponibile.

## 15. Certificazioni

Le certificazioni non sono solo archivio documentale. Alcuni form calcolano punteggi di conformita.

### 15.1 Bio EU 2018/848

Il componente `BioCertificationForm.tsx` calcola un compliance score.

Categorie:

- dati azienda: 20 punti;
- produzione: 20 punti;
- pratiche: 30 punti;
- tracciabilita: 20 punti;
- controlli: 10 punti.

### 15.2 Formula

```text
score = punti soddisfatti
total = 100
complianceScore = round((score / total) * 100)
```

Dettaglio:

Dati azienda:

- companyName: +4;
- certificationBody: +4;
- certificationNumber: +4;
- certificationDate: +4;
- expiryDate: +4.

Produzione:

- totalArea > 0: +5;
- organicArea > 0: +5;
- hasBufferZones: +5;
- bufferZoneWidth >= 3: +5.

Pratiche:

- non usa fertilizzanti chimici: +10;
- non usa pesticidi sintetici: +10;
- non usa GMO: +10.

Tracciabilita:

- sistema tracciabilita: +7;
- separazione bio/convenzionale: +7;
- registri produzione: +6.

Controlli:

- ultima ispezione: +5;
- prossima ispezione: +5.

## 16. GDD e fenologia

Il Director espone `gdd_base_10`, cioe Growing Degree Days con base 10 gradi.

La logica agronomica tipica e:

```text
temperaturaMedia = (tempMin + tempMax) / 2
gddGiornaliero = max(0, temperaturaMedia - 10)
gddAccumulato = somma(gddGiornaliero nel periodo)
```

Nel prodotto questo dato serve a collegare:

- meteo;
- fase fenologica;
- timing interventi;
- raccolta;
- pressione fitosanitaria;
- pianificazione.

## 17. Fasi lunari e fotoperiodo

Il Director importa:

- `calculatePhotoperiodHours`;
- `getLunarPhase`;
- `getLunarActivities`;
- `getPhaseDisplayName`;
- `isWaxingPhase`.

Questo significa che il briefing puo includere:

- ore di fotoperiodo;
- fase lunare;
- attivita favorite.

La parte lunare va trattata come supporto operativo/tradizionale, non come unico determinante scientifico.

## 18. Diario e storico operativo

Il diario serve a registrare cio che succede.

Oggi esistono due generazioni: il diario giornaliero DB-oriented e il diario operativo legacy, che conserva parte delle entry in memoria di processo. Anche `/app/diary` e `/app/journal` sono percorsi concorrenti. La descrizione seguente rappresenta il contratto definitivo da raggiungere, non la garanzia che ogni write corrente sia gia durevole.

In ottica prodotto, il diario ha tre funzioni:

1. memoria dell'utente;
2. input per analytics;
3. prova per certificazioni e tracciabilita.

Un diario utile deve collegare:

- data;
- zona;
- coltura;
- operazione;
- motivo;
- prodotto;
- dose;
- durata;
- esito;
- foto o allegati;
- condizioni meteo.

## 19. Lavori meccanici

La route `/app/mechanical-work` e l'API `/api/mechanical-work` indicano una verticalizzazione per lavorazioni:

- sfalcio;
- trinciatura;
- lavorazione terreno;
- fresatura;
- potatura meccanica;
- passaggi macchina;
- note operative;
- storico.

Nel modello complessivo questi lavori devono entrare nel ledger operativo, perche influenzano:

- compattamento;
- gestione infestanti;
- sanita;
- disponibilita operativa;
- costi.

## 20. Frutteto, oliveto, vigneto

Le route dedicate indicano che OrtoMio non e solo generico:

- `/app/orchard`;
- `/app/olives`;
- `/app/vineyard`.

Questi contesti richiedono dati specifici:

- sesto d'impianto;
- portinnesto;
- forma di allevamento;
- eta impianto;
- filari;
- varieta;
- fase fenologica;
- resa attesa;
- qualita;
- trattamenti specifici.

Il servizio di priorita usa gia portinnesto e sistema di allevamento per modificare il punteggio.

Esempio:

- portinnesti tolleranti alla siccita possono modificare la priorita acqua;
- sistemi di qualita come Guyot o alberello possono modificare la priorita qualita;
- sistemi ad alta resa possono abbassare leggermente alcune priorita qualita.

## 21. NDVI, satellitare e dati avanzati

La presenza di `/app/ndvi` e `satellite-config` indica il supporto a dati remoti.

Nel modello agronomico, NDVI dovrebbe contribuire a:

- vigoria;
- disomogeneita;
- stress;
- mappe di prescrizione;
- priorita per zona;
- confronto pre/post intervento.

Dato che il masterdoc deve restare fedele al codice, ogni integrazione NDVI va sempre distinta tra:

- UI presente;
- storage presente;
- calcolo presente;
- provider realmente collegato;
- dati demo o placeholder.

Stato verificato: il modulo e ancora simulato con integrazione parziale. La route Sentinel puo collegarsi al provider, ma il valore NDVI restituito resta sintetico/casuale e lo storico legacy genera trend simulati. La connessione al provider non equivale quindi a una misura NDVI reale.

## 22. Storage e persistenza

Il codice usa un provider di storage astratto. Questo permette di non legare tutta la logica a una sola implementazione.

Il pattern e:

```text
servizio dominio
  -> storageProvider
  -> metodi DB dedicati se disponibili
  -> fallback preferenze/locale se necessario
```

Il fallback e ammesso solo per preferenze o stato non critico dichiarato. Per diary, trattamenti, device, certificazioni, decisioni e outcome, un errore cloud deve restare un errore visibile: non deve trasformarsi silenziosamente in un salvataggio locale.

Questo pattern si vede nel ledger decisionale.

Vantaggio:

- evoluzione graduale;
- possibilita di test;
- compatibilita con funzioni non ancora migrate.

Rischio:

- se un dato resta nel fallback, puo sembrare salvato ma non essere disponibile in tutte le viste;
- il masterdoc deve indicare sempre se una memoria e DB-backed o fallback-backed.

## 23. AI e spiegabilita

L'AI nel prodotto non dovrebbe essere intesa come chat generica.

Nel codice ha senso se:

- riceve contesto strutturato;
- produce suggerimenti;
- viene filtrata da regole;
- salva decisioni;
- genera task;
- permette feedback.

Il Director importa servizi di spiegazione decisionale. Quindi la direzione corretta e:

```text
suggerimento
  -> punteggio
  -> spiegazione
  -> task
  -> ledger
  -> completamento
  -> feedback
```

Una funzione AI non e completa se non spiega:

- quale dato ha pesato;
- quale dato mancava;
- quanto e affidabile;
- cosa fare ora.

## 24. Esempio end-to-end: irrigazione vigneto

Scenario:

- vigneto;
- suolo sabbioso;
- esposizione alta;
- 8 ore di sole;
- ultimi giorni con stress idrico alto;
- impianto a goccia;
- gocciolatori noti;
- fase fenologica sensibile.

Passaggi:

1. Garden context legge posizione, zona e coltura.
2. Refined context riconosce suolo sabbioso, esposizione, sole.
3. Environmental summary segnala stress idrico.
4. Priority service parte da un baseScore.
5. Aggiunge confidenza, copertura segnali e fase critica.
6. Aggiunge adjustment acqua:
   - suolo sabbioso +4;
   - esposizione +3;
   - sole >= 8 +4;
   - pressione ambientale alta +9.
7. Economic service valuta costo ritardo e valore protetto.
8. Se conviene intervenire ora, riallinea score in fascia alta.
9. Irrigation calculator calcola durata:

```text
portata = portataGocciolatore * numeroGocciolatori
minuti = ceil((litriTarget / portata) * 60)
```

10. Director inserisce l'azione in briefing/coda.
11. L'utente esegue il task.
12. Il ledger salva snapshot e stato.
13. Il feedback futuro corregge le soglie.

## 25. Esempio end-to-end: rischio peronospora pomodoro

Scenario:

- pomodoro;
- primavera/estate;
- pianta oltre 30 giorni;
- umidita alta;
- temperatura 15-25;
- bagnatura fogliare elevata.

Passaggi:

1. Health monitoring intercetta la regola.
2. Crea alert `disease_risk`.
3. Aggiunge azioni:
   - controllo foglie;
   - foto;
   - trattamento preventivo.
4. Priority service valuta focus `health`.
5. Se il sito e ombreggiato o poco arieggiato, aumenta priorita.
6. Director porta l'alert nel briefing.
7. Task e ledger rendono tracciabile la decisione.

## 26. Esempio end-to-end: certificazione biologica

Scenario:

- azienda compila form bio;
- ha certificatore, numero, date;
- area bio;
- buffer zone;
- tracciabilita;
- non usa chimica/GMO.

Passaggi:

1. Form raccoglie dati.
2. `useMemo` calcola score.
3. Ogni sezione contribuisce a un totale di 100.
4. UI mostra percentuale e colore.
5. Dato salvato puo diventare base per report e audit.

## 27. Cosa rende OrtoMio utile

Per un utente domestico:

- sa quando irrigare;
- ricorda cosa ha fatto;
- riceve avvisi semplici;
- tiene un diario ordinato;
- capisce meglio piante e cicli.

Per una piccola azienda:

- pianifica operazioni;
- confronta zone;
- traccia trattamenti;
- migliora efficienza;
- supporta certificazioni;
- crea report;
- conserva memoria operativa.

Per un contesto professionale:

- usa mappe;
- usa feedback;
- valuta ROI;
- integra dati ambientali;
- costruisce decisioni tracciabili;
- separa interventi immediati, prossimo ciclo e monitoraggio.

## 28. Limiti e verita da non nascondere

La maturita reale di ogni capability non e un giudizio soggettivo di questo documento: e un dato di codice, definito in `config/capabilities.ts` (campo `maturity` su ciascuna delle 31 capability registrate) e mostrato realmente nella UI tramite `getCapabilityBadge()`. Stato verificato il 22/07/2026:

- **15 stable** (nessun badge mostrato all'utente);
- **14 beta** (badge "Beta"): Centro operativo, Planner AI, Consigli AI, Diario operativo, Irrigazione, Nutrizione e trattamenti, Lavorazioni, Certificazioni, Predizioni AI, NDVI satellitare, Prescription Maps, Smart Hub, Export, Configurazione satellite;
- **2 simulation** (badge "Simulazione"): drone e blockchain/NFT — demo isolate, mai da promuovere senza hardware/provider reale.

Qui "beta" significa specificamente: *funzionalmente completo e testato in locale, ma senza le prove richieste in produzione* (RLS testate su piu aziende reali con dati reali, pilot con cliente vero, contract test sul provider esterno, restore drill). Non significa "codice incompleto" ne "rotto". **Decisione di prodotto confermata il 22/07/2026: nessuna delle 14 capability beta va promossa a stable finche il suo gate specifico (vedi Specifica v1.1, matrice delle 29 capability) non e chiuso con evidenza riproducibile.** Promuovere in blocco senza quella evidenza ripeterebbe l'errore opposto gia corretto in questa stessa data (dichiarare piu pronto di quanto verificato — vedi bug fix 21-22/07 in sezione 0).

Le aree da verificare sempre prima di dichiararle complete sono:

- provider reali meteo/satellite;
- persistenza DB vs fallback preferenze;
- coerenza tra route e navigazione;
- dati demo vs dati produttivi;
- completezza dei metodi storage;
- export realmente scaricabili;
- ledger leggibile in UI;
- task generati e completabili;
- feedback che rientra davvero nei calcoli.

## 29. Regola di manutenzione del documento

Ogni nuova funzionalita rilevante deve aggiornare questo file con:

1. descrizione utente;
2. input;
3. calcolo o regola;
4. output;
5. route/componenti;
6. servizi;
7. tipi dati;
8. persistenza;
9. limiti;
10. esempio concreto.

## 30. Fonti codice principali da tenere allineate

Servizi chiave:

- `services/directorService.ts`;
- `services/agronomicPriorityService.ts`;
- `services/agronomicEconomicPriorityService.ts`;
- `services/agronomicDecisionLedgerService.ts`;
- `services/irrigationCalculatorService.ts`;
- `services/preciseSunCalculator.ts`;
- `services/prescriptionMapsService.ts`;
- `services/advancedNutritionService.ts`;
- `services/plantHealthMonitoringService.ts`;
- `services/environmentalMonitoringService.ts`;
- `services/agronomicRefinedContextService.ts`;
- `services/agronomicKernelService.ts`;
- `services/phenologyService.ts`;
- `services/operationalLedgerService.ts`;
- `services/unifiedAgronomicMemoryService.ts`.

Componenti/calcoli visibili:

- `components/certifications/BioCertificationForm.tsx`;
- componenti irrigazione;
- componenti diario;
- componenti planner;
- componenti salute;
- componenti mappe.

Route prodotto:

- `app/app/*`;
- `app/api/*`;
- `app/(auth)/*`.

## 31. Regola di evoluzione del masterplan

Questa versione e il masterplan canonico. Non deve essere sostituita da altri documenti generali paralleli.

Gli approfondimenti futuri devono essere aggiunti qui o in appendici specialistiche richiamate da qui, in particolare per:

- tutte le route;
- tutti i servizi;
- tutte le tabelle o storage method;
- tutti gli enum e tipi dominio;
- tutte le formule;
- tutti gli stati;
- tutte le integrazioni esterne;
- tutte le differenze tra demo, beta e produzione.

Il criterio non deve essere "abbiamo nominato il modulo". Deve essere: "un lettore capisce cosa puo fare, perche e utile, come si calcola, da dove arriva il dato, quanto e maturo e cosa manca per il rilascio".

## 32. Rilettura 2026-07-16: cosa emerge scavando meglio nel codice

La seconda rilettura conferma che OrtoMio va descritto come una piattaforma a memoria agronomica stratificata.

Non c'e un solo storico:

- c'e un diario giornaliero climatico;
- c'e uno storico operativo;
- c'e un ledger decisionale;
- c'e un operational ledger unificato;
- ci sono feedback misurati;
- ci sono proiezioni su outcome, segnali ed esecuzioni precision.

Questa distinzione e fondamentale per spiegare davvero come funziona.

```text
Meteo e ambiente
  -> daily_weather_log
  -> environmental ledger per zona
  -> pressione idrica/sanitaria

Decisione agronomica
  -> action queue
  -> decision snapshot
  -> agronomic decision ledger

Esecuzione reale
  -> task, trattamenti, irrigazioni, lavori, mappe
  -> operational ledger
  -> outcome e misure

Apprendimento
  -> feedback misurato
  -> adjustment priorita
  -> prossima raccomandazione
```

## 33. Storage provider: il contratto che rivela l'ampiezza reale del prodotto

Il file `packages/core/storage/interface.ts` e una delle fonti piu importanti per capire cosa OrtoMio intende supportare.

L'interfaccia `IStorageProvider` non contiene solo CRUD base. Contiene il contratto funzionale dell'app.

### 33.1 Blocchi principali

Il provider gestisce:

- gardens;
- tasks;
- smart devices;
- osservazioni fenologiche;
- risultati qualita;
- mappe di prescrizione;
- esecuzioni mappe;
- export mappe;
- proiezioni operational ledger;
- inventario semi;
- raccolti;
- semenzai;
- piantine/astoni;
- foto;
- preferenze utente;
- decision ledger;
- queue outcome;
- piani custom;
- agronomi;
- consulenze;
- consigli agronomo;
- accessori;
- letture idroponiche;
- letture acquaponiche;
- aiuole/zone;
- filari;
- lavori meccanici;
- inventario fertilizzanti;
- inventario fitosanitario.

### 33.2 Cosa significa

Questa interfaccia indica che OrtoMio non e solo una dashboard. E progettato per:

- gestire asset fisici;
- gestire operazioni;
- gestire dati ambientali;
- gestire consulenza professionale;
- gestire precision farming;
- gestire storicizzazione e apprendimento.

Quando una funzione non e ancora completa, il modo corretto per verificarla e:

1. esiste la UI?
2. esiste il tipo dati?
3. esiste il metodo storage?
4. esiste implementazione Supabase/local?
5. esiste un servizio che usa il dato?
6. esiste una vista che rilegge il risultato?

## 34. Diario giornaliero: memoria climatica e predittiva

Il servizio `dailyDiaryService.ts` chiarisce che il diario non e solo un "journal" manuale. E un sistema di registrazione giornaliera automatica.

### 34.1 Obiettivo dichiarato dal codice

Il servizio registra:

- dati meteorologici giornalieri;
- GDD;
- ore di freddo;
- indici di stress;
- eventi automatici e manuali.

Lo scopo e costruire una base dati per:

- confronto anno su anno;
- raccomandazioni predittive.

### 34.2 Flusso giornaliero

La funzione `recordDailyEntries`:

1. sceglie la data;
2. legge tutti i garden con `user_id`;
3. deduplica gli utenti;
4. per ogni utente chiama `runDailyRegistration`;
5. conta utenti processati, riusciti e falliti;
6. raccoglie errori.

La funzione `runDailyRegistration`:

1. registra meteo giornaliero;
2. aggiorna tracking coltivazioni attive;
3. genera eventi automatici;
4. persiste environmental ledger di zona;
5. restituisce conteggio coltivazioni aggiornate, eventi generati, errori.

### 34.3 Meteo giornaliero

`recordDailyWeather` controlla prima se esiste gia un log per la data.

Se esiste:

```text
ritorna il log esistente
```

Se non esiste:

```text
fetchWeatherData(userId, date)
calcola ETo
costruisce DailyWeatherLog
inserisce in daily_weather_log
```

### 34.4 Scelta coordinate

Il fetch meteo segue una priorita:

1. coordinate del profilo utente;
2. coordinate del primo garden dell'utente;
3. fallback sintetico.

Questo e importante: l'app evita di usare una localita hardcoded quando mancano coordinate. Se mancano i dati, produce un fallback segnalato come sintetico.

### 34.5 Open-Meteo

Se la data e storica:

```text
endpoint = archive-api.open-meteo.com
```

Se la data e corrente/futura:

```text
endpoint = api.open-meteo.com/v1/forecast
```

Campi daily richiesti:

- temperatura max;
- temperatura min;
- precipitazione;
- umidita max;
- umidita min;
- vento max;
- vento medio;
- radiazione shortwave;
- UV index;
- weather code.

### 34.6 ETo

Il servizio calcola `eto_calculated`, cioe evapotraspirazione di riferimento. La formula deve restare tracciata fino alla funzione specifica e accompagnata da un test numerico di riferimento; questo e un requisito di manutenzione della versione definitiva.

Qui conta il comportamento:

```text
temp_min/temp_max + radiazione + data
  -> calculateETo
  -> eto_calculated
  -> daily_weather_log
```

ETo diventa un dato di base per irrigazione, stress idrico e confronto stagionale.

### 34.7 Environmental ledger per zona

Dopo la registrazione meteo, il servizio cerca zone attive:

- legge garden dell'utente;
- legge `irrigation_zones` attive;
- per ogni zona genera uno snapshot ambientale;
- lo inserisce nel raw_data del daily weather log tramite `upsertZoneEnvironmentalLedger`.

Quindi una giornata meteo non e solo "meteo utente": puo contenere memoria ambientale per zona.

### 34.8 Fallback sintetico

Se non ci sono coordinate valide, il servizio crea dati sintetici stagionali:

- estate: min 18, max 30;
- primavera: min 12, max 22;
- autunno: min 10, max 20;
- inverno: min 4, max 12;
- pioggia 0;
- umidita media 60;
- condizioni `fallback_synthetic`;
- fonte `manual`;
- raw_data con `fallback: true`.

Questo va esplicitato perche un dato sintetico non deve essere letto come dato meteorologico reale.

## 35. Contesto raffinato: come il sistema capisce il tipo di coltivazione

Il servizio `agronomicRefinedContextService.ts` costruisce un contesto piu ricco a partire da dati espliciti e testo.

### 35.1 Cosa normalizza

Normalizza:

- cultivar;
- varieta;
- specie;
- intenzione produttiva;
- sistema colturale;
- modalita irrigua;
- forma di allevamento;
- portinnesto;
- altitudine;
- pendenza;
- ore sole;
- fotoperiodo;
- esposizione;
- vento;
- suolo;
- pH;
- terroir;
- ostacoli;
- tag sito.

### 35.2 Intenzione produttiva

La produzione puo diventare:

- `wine`;
- `table_grape`;
- `oil`;
- `table_olive`;
- `fresh_market`;
- `processing`.

Il sistema non guarda solo il campo `productionIntent`. Cerca anche nel testo:

- vite;
- uva;
- grape;
- vineyard;
- vigneto;
- olivo;
- oliva;
- olive;
- oliveto;
- vinificazione;
- uva da vino;
- uva da tavola;
- oliva da mensa;
- frantoio;
- olio;
- trasformazione.

Questo e cruciale: se un utente scrive "vigneto uva da vino", il sistema puo inferire l'intenzione produttiva anche se non ha selezionato un enum perfetto.

### 35.3 Sistema colturale

Il sistema riconosce:

- campo aperto;
- serra/protected culture;
- frutteto;
- vigneto;
- oliveto;
- indoor;
- idroponico;
- acquaponico;
- aeroponico;
- misto.

La normalizzazione accetta sinonimi italiani e inglesi.

### 35.4 Modalita irrigua

Riconosce:

- `rainfed`: asciutta/dryland;
- `manual_irrigation`: manuale;
- `pressurized_irrigation`: drip/sprinkler/pressione.

Anche qui puo inferire dai tag operativi o dal testo.

### 35.5 Esposizione e pendenza

Esposizione:

```text
full/exposed/exposed_site -> exposed
shade/partial/partsun/sheltered/sheltered_site -> sheltered
altra esposizione presente -> balanced
```

Pendenza:

```text
slopePercentage >= 12 -> steep
slopePercentage >= 3 -> rolling
altrimenti -> flat
```

Se non c'e percentuale ma esiste tag `steep_slope_site`, la classe diventa `steep`.

### 35.6 Tag derivati

Dal contesto raffinato derivano tag operativi:

- tipo sistema;
- modalita irrigua;
- `wine_grape`;
- `table_grape`;
- `oil_cultivar`;
- `table_olive`;
- alta quota;
- forte pendenza;
- sito esposto;
- sito riparato.

Questi tag tornano nei calcoli di priorita e nella priorita economica.

## 36. Agronomic kernel: come viene scelto il profilo colturale

Il servizio `agronomicKernelService.ts` risolve il profilo agronomico.

### 36.1 Ordine di risoluzione

Il sistema cerca:

1. match diretto per `plantId` o alias;
2. match da coltura custom;
3. fallback da categoria funzionale;
4. fallback generico.

### 36.2 Fonti e avvisi

Se trova per `plant_id`, la decisione e piu forte.

Se trova da coltura custom, aggiunge warning:

```text
Resolved custom crop through canonical plant alias. Site-specific tuning is still required.
```

Se trova da categoria funzionale:

```text
Resolved through functional category fallback. Crop-specific calibration is still needed.
```

Se non trova nulla:

```text
No direct agronomic profile match found. Using generic fallback profile.
```

### 36.3 Perche conta

Questo spiega perche la priorita agronomica penalizza il fallback. Una raccomandazione su "pomodoro" riconosciuto e piu affidabile di una su "coltura generica da frutto".

## 37. Operational ledger: storico operativo unificato

Il servizio `operationalLedgerService.ts` e diverso dal decision ledger.

Il decision ledger risponde alla domanda:

```text
Perche il sistema ha deciso/suggerito questa azione?
```

L'operational ledger risponde alla domanda:

```text
Cosa e successo davvero nel campo o nel sistema?
```

### 37.1 Famiglie evento

Normalizza tre famiglie:

- `outcome`;
- `signal`;
- `precision_execution`.

### 37.2 Outcome event

Un outcome prende dati da una proiezione e costruisce:

- id;
- source;
- gardenId;
- taskId;
- data evento;
- categoria;
- tipo;
- classe risultato;
- presenza risultato misurato;
- presenza evidenza esecuzione;
- record sorgente.

La data evento viene scelta in ordine:

```text
operationTimestamp
  oppure outcomeCompletedAt
  oppure taskCompletedAt
  oppure createdAt
```

### 37.3 Signal event

Un signal puo essere:

- risultato qualita misurato;
- operazione pianta;
- automazione device;
- export prescrizione;
- altra sorgente normalizzata.

Il sistema considera `hasMeasuredResult` vero se il ruolo o la classe risultato indicano misura reale, risultato benefico o qualita negativa.

### 37.4 Precision execution

Un evento precision viene da applicazioni a rateo variabile.

Campi principali:

- source `variable_rate_applications`;
- categoria `precision_execution`;
- tipo da operazione/prodotto/mappa;
- classe risultato da varianza o execution status;
- evidenza esecuzione vera se lo stato non e `planned_or_unknown`.

### 37.5 Summary

Il summary calcola:

```text
totalEvents
outcomeEvents
signalEvents
precisionExecutionEvents
measuredResultEvents
verifiedExecutionEvents
byCategory
byResultClass
latestEvent
events
```

Gli eventi sono ordinati dal piu recente al piu vecchio.

### 37.6 Valore prodotto

Questo e uno dei punti piu importanti per spiegare OrtoMio:

- il sistema non deve solo suggerire;
- deve sapere cosa e stato fatto;
- deve distinguere segnale, esecuzione e risultato;
- deve poter confrontare decisione prevista e risultato reale.

## 38. Semenzaio: calcoli temporali e gestione disponibilita

Il servizio `seedlingService.ts` gestisce batch di semenzai e piantine acquistate.

### 38.1 Dati batch

Un batch contiene:

- pianta;
- varieta;
- data semina o acquisto;
- quantita iniziale;
- quantita corrente;
- quantita sopravvissuta;
- posizione;
- fase;
- data attesa trapianto;
- note;
- foto;
- gardenId;
- fonte `home` o `nursery`;
- vivaio.

### 38.2 Creazione batch

Quando crea un batch da semina domestica:

1. legge master sheet della pianta;
2. calcola giorni medi germinazione;
3. aggiunge nursing standard;
4. aggiunge hardening standard;
5. genera data trapianto attesa.

Formula:

```text
avgGerminationDays = (emergenceDays.min + emergenceDays.max) / 2
nursingDays = 30
hardeningDays = 10
totalDays = avgGerminationDays + nursingDays + hardeningDays
expectedTransplantDate = sowingDate + totalDays
```

### 38.3 Semina ottimale da data target

Se l'utente vuole trapiantare in una certa data:

```text
optimalSowingDate = targetTransplantDate - totalDays
```

Se la data cade nel passato, il servizio ritorna `null`: e troppo tardi per seminare.

### 38.4 Timeline fasi

Calcola i giorni dalla semina:

```text
daysSinceSowing = floor((today - sowingDate) / giorno)
```

Poi assegna la fase:

- prima della germinazione media: `Germination`;
- dopo germinazione e prima di nursing + germinazione: `Nursing`;
- dopo nursing e prima di hardening: `Hardening`;
- dopo tutto: `ReadyToTransplant`.

### 38.5 Hardening

Il sistema suggerisce hardening quando:

```text
fase == Nursing
e daysToNextPhase <= 14
```

### 38.6 Pronto al trapianto

Se la fonte e `nursery`, le piantine sono pronte se c'e quantita disponibile.

Se la fonte e `home`:

- deve essere in `ReadyToTransplant` o `Hardening`;
- deve avere quantita corrente > 0;
- se e in hardening, servono almeno 7 giorni;
- se sopravvive <= 50%, genera warning.

### 38.7 Valore prodotto

Questa logica rende il semenzaio una pipeline, non una lista:

```text
semina/acquisto
  -> germinazione
  -> nursing
  -> hardening
  -> pronto al trapianto
  -> consumo quantita disponibile
```

## 39. Aggiornamento del criterio di completezza

Dopo la rilettura, una sezione del masterdoc e completa solo se risponde anche a queste domande:

1. Quale servizio contiene la logica?
2. Quale interfaccia storage rende persistente il dato?
3. Il dato e operativo, decisionale, ambientale o di feedback?
4. Esiste un fallback?
5. Il fallback e esplicitato all'utente?
6. L'output entra nel Director, nel ledger o solo nella UI?
7. Esiste una formula o una soglia?
8. Esiste un modo per verificare l'esecuzione reale?
9. Esiste un modo per misurare il risultato?
10. Il risultato modifica decisioni future?

## 40. Merge definitivo della vecchia documentazione tecnica

Questa sezione assorbe il contenuto utile del vecchio `docs/ORTOMIO_DOCUMENTAZIONE_COMPLETA.md`.

Quel documento aveva valore per:

- stack tecnico;
- struttura progetto;
- elenco route;
- feature flags;
- panoramica database;
- tipi principali;
- servizi principali;
- hook principali.

Non era pero sufficiente come masterdoc perche si fermava molto all'inventario. Da ora questi dati vivono qui, dentro un documento che spiega anche logica, calcoli, flussi e utilita.

## 41. Stack tecnico aggiornato

Fonte: `package.json`, rilettura del 2026-07-16.

### 41.1 Informazioni base

| Attributo | Valore |
|---|---|
| Nome pacchetto | `ortomio-ai` |
| Versione package | `0.0.0` |
| Tipo modulo | `module` |
| Node richiesto | `>=22.0.0` |
| npm richiesto | `>=10.0.0` |

### 41.2 Framework e librerie principali

| Tecnologia | Versione | Uso |
|---|---:|---|
| Next.js | `^16.1.1` | App Router, routing, rendering |
| React | `^19.2.1` | UI |
| React DOM | `^19.2.1` | rendering React |
| TypeScript | `~5.8.2` | type safety |
| Tailwind CSS | `^4.1.17` | styling |
| Supabase JS | `^2.87.1` | database/auth/storage |
| Supabase SSR | `^0.8.0` | auth SSR Next |
| Google Generative AI | `^0.24.1` | Gemini/AI |
| Neon serverless | `^1.1.0` | integrazione Postgres/serverless |
| Leaflet | `^1.9.4` | mappe |
| React Leaflet | `^5.0.0` | mappe React |
| Recharts | `^3.6.0` | grafici |
| jsPDF | `^2.5.2` | PDF |
| jsPDF AutoTable | `^3.8.4` | tabelle PDF |
| Zod | `^3.23.8` | validazione |
| date-fns | `^4.1.0` | date |
| lucide-react | `^0.556.0` | icone |

## 42. Struttura progetto assorbita nel masterdoc

```text
ortomio-main/
  app/                  Next.js App Router, pagine e API
  components/           componenti React e form di dominio
  services/             logica agronomica, calcoli, orchestratori
  types/                modelli TypeScript
  hooks/                custom React hooks
  lib/                  utility applicative e auth
  data/                 dati master colture, profili, tassonomie
  database/             schema e migrazioni
  config/               feature flags e configurazioni
  packages/core/        storage, context e astrazioni base
  docs/                 documenti tecnici e piani storici
  scripts/              script manutenzione/deploy/import
  public/               asset statici
```

Questa struttura va letta cosi:

- `app` mostra cosa l'utente puo raggiungere;
- `components` mostra come l'utente interagisce;
- `services` contiene la verita funzionale;
- `types` definisce quali dati il sistema considera reali;
- `packages/core/storage` spiega quali dati possono essere persistiti;
- `data` fornisce le conoscenze di base su piante e profili.

## 43. Inventario delle route applicative

Questa sezione inventaria route esistenti. Non certifica che siano tutte visibili, autorizzate o complete: maturita e destinazione sono definite nelle sezioni 51-53.

Route auth:

| Route | Funzione |
|---|---|
| `/login` | accesso |
| `/register` | registrazione |
| `/reset-password` | reset password |
| `/forgot-password` | recupero password |
| `/verify-email` | verifica email |
| `/confirm` | conferma auth |
| `/privacy` | privacy |
| `/terms` | termini |

Route prodotto:

| Route | Funzione |
|---|---|
| `/app` | dashboard principale |
| `/app/garden` | configurazione garden |
| `/app/farm` | contesto aziendale |
| `/app/planner` | planner smart |
| `/app/planner-classic` | planner tradizionale |
| `/app/pianifica` | pianificazione operativa |
| `/app/calendar` | calendario task |
| `/app/journal` | diario operativo |
| `/app/diary` | diario/registrazioni |
| `/app/plants` | piante individuali |
| `/app/orchard` | frutteto |
| `/app/vineyard` | vigneto |
| `/app/olives` | oliveto |
| `/app/health` | salute piante |
| `/app/ai-predictions` | predizioni AI |
| `/app/treatments` | trattamenti |
| `/app/nutrition` | nutrizione |
| `/app/irrigation` | irrigazione |
| `/app/harvest` | raccolti |
| `/app/semenzaio` | semi, semenzai, piantine |
| `/app/zones` | zone |
| `/app/certifications` | certificazioni |
| `/app/prescription-maps` | mappe prescrizione |
| `/app/ndvi` | NDVI/satellite |
| `/app/analytics` | analytics |
| `/app/advice` | consigli |
| `/app/smart` | operazioni smart |
| `/app/smart-simple` | operazioni smart semplificate |
| `/app/compare` | confronto |
| `/app/mechanical-work` | lavori meccanici |
| `/app/almanacco` | almanacco e luna |
| `/app/satellite-config` | configurazione satellite |
| `/app/export` | esportazioni |
| `/app/reports` | report |
| `/app/help` | aiuto |
| `/app/settings` | impostazioni |
| `/app/admin` | amministrazione |

Route API rilevate:

| Route | Funzione |
|---|---|
| `/api/mechanical-work` | lavori meccanici |
| `/api/treatments` | trattamenti |
| `/api/api-configurations` | configurazioni API |
| `/api/public-contract` | contratto pubblico/API |
| `/api/test` | test |
| `/auth/callback` | callback auth |

## 44. Feature flags integrate

Fonte: `config/features.ts`.

### 44.1 Feature attive

`true` significa che il gate client consente la funzione, non che il flusso sia completo o sicuro end-to-end. In particolare `AI_PREDICTIONS`, `JOURNAL`, `INDIVIDUAL_PLANTS` e `COLLABORATIVE_AI` restano soggette ai gap indicati nella matrice di maturita.

| Feature | Stato | Significato |
|---|---:|---|
| `AI_PREDICTIONS` | true | predizioni malattie/resa |
| `JOURNAL` | true | diario operativo |
| `INDIVIDUAL_PLANTS` | true | piante individuali |
| `ORCHARD` | true | frutteto |
| `VINEYARD` | true | vigneto |
| `OLIVE_GROVE` | true | oliveto |
| `PROFESSIONAL_DASHBOARD` | true | dashboard professionale |
| `COLLABORATIVE_AI` | true | AI collaborativa |
| `PLANNER_BASE` | true | planner modulare base |
| `ANALYTICS` | true | analytics |
| `CERTIFICATIONS_BASE` | true | certificazioni base |
| `IRRIGATION_BASE` | true | irrigazione base |
| `NUTRITION_BASE` | true | nutrizione base |
| `MECHANICAL_WORK_BASE` | true | lavori meccanici base |
| `ADVICE_BASE` | true | consigli AI base |

### 44.2 Feature non attive nel flag file

| Feature | Stato | Nota |
|---|---:|---|
| `IRRIGATION_SCHEDULING` | rimosso il 24/07/2026 | vedi 44.3 |
| `IRRIGATION_ANALYTICS` | rimosso il 24/07/2026 | vedi 44.3 |
| `NUTRITION_INVENTORY` | rimosso il 24/07/2026 | vedi 44.3 |
| `NUTRITION_DOSE_CALCULATOR` | rimosso il 24/07/2026 | vedi 44.3 |
| `NUTRITION_COMPATIBILITY` | rimosso il 24/07/2026 | vedi 44.3 |
| `EQUIPMENT_MANAGEMENT` | rimosso il 24/07/2026 | vedi 44.3 |
| `MAINTENANCE_SCHEDULER` | rimosso il 24/07/2026 | vedi 44.3 |
| `OPERATIONAL_COSTS` | rimosso il 24/07/2026 | vedi 44.3 |
| `ADVANCED_CERTIFICATIONS` | rimosso il 24/07/2026 | vedi 44.3 |
| `SEASONAL_ADVICE` | rimosso il 24/07/2026 | vedi 44.3 |
| `PLANNER_WIZARD_EXTENDED` | rimosso il 24/07/2026 | vedi 44.3 |
| `PLANNER_MATERIAL_SELECTOR` | rimosso il 24/07/2026 | vedi 44.3 |
| `PLANNER_SEED_BANK` | rimosso il 24/07/2026 | vedi 44.3 |

Nessuna feature `false` residua in `config/features.ts`: l'unico flag della Fase 2 rimasto, `IRRIGATION_ZONES`, è `true` (vedi 44.1).

### 44.3 Rimozione dei 13 flag morti (D5, 24/07/2026)

`IRRIGATION_ZONES` era nella lista 44.2 fino al 22/07/2026: verificato che il componente era già montato senza gate (`app/app/irrigation/page.tsx`), flag disallineato dalla realtà, corretto a `true` (D5, `config/features.ts:67`).

Le altre 13 righe sono state verificate il 24/07/2026 con una ricerca sull'intero repo (esclusi `node_modules`) sul nome del componente citato nel commento di ciascun flag: **nessuno dei 13 file esisteva**. Non erano funzionalità disattivate temporaneamente, ma flag creati in anticipo per moduli della Fase 2 ("MODULI ALTI") e Fase 3 ("MODULI MEDI") del piano originale mai scritti — zero codice dietro. Nessuno dei 13 nomi è mai stato letto da `isFeatureEnabled`, `<FeatureGate>` o `FEATURES_BY_PHASE` fuori da `config/features.ts` stesso: rimuoverli non ha effetto sul comportamento dell'app (verificato con `tsc --noEmit`, nessun errore).

Decisione presa: eliminati da `config/features.ts` insieme all'intera sezione "MODULI MEDI - Fase 3" (tutti e 8 i suoi flag erano in questo elenco) e dalla relativa voce in `FEATURES_BY_PHASE`, invece di lasciarli come dichiarazione di roadmap futura — nessuna implementazione esisteva da preservare.

| Feature rimossa | Componente referenziato (comment ormai eliminato) |
|---|---|
| `IRRIGATION_SCHEDULING` | `AutomaticScheduler.tsx` |
| `IRRIGATION_ANALYTICS` | `WaterConsumptionAnalytics.tsx` |
| `NUTRITION_INVENTORY` | `ProductInventoryManager.tsx` |
| `NUTRITION_DOSE_CALCULATOR` | `DoseCalculator.tsx` |
| `NUTRITION_COMPATIBILITY` | `ProductCompatibilityChecker.tsx` |
| `EQUIPMENT_MANAGEMENT` | `EquipmentManager.tsx` |
| `MAINTENANCE_SCHEDULER` | `MaintenanceScheduler.tsx` |
| `OPERATIONAL_COSTS` | `OperationalCostsTracker.tsx` |
| `ADVANCED_CERTIFICATIONS` | `AdvancedDocumentManager.tsx` |
| `SEASONAL_ADVICE` | `SeasonalAdvice.tsx` |
| `PLANNER_WIZARD_EXTENDED` | `ExtendedPlannerWizard.tsx` |
| `PLANNER_MATERIAL_SELECTOR` | `MaterialSelector.tsx` |
| `PLANNER_SEED_BANK` | `SeedBankConnector.tsx` |

Se uno di questi moduli tornerà in roadmap, va ricreato da zero (flag + componente + route + gate), non riattivato: non c'era nulla dietro da riaccendere.

## 45. Database e tabelle storicamente documentate

Il vecchio documento elencava queste aree Supabase/PostgreSQL.

Tabelle core:

- `gardens`;
- `garden_beds`;
- `bed_planting_history`;
- `profiles`;
- `calendar_tasks`;
- `harvest_logs`;
- `photo_logs`;
- `seed_inventory`;
- `seedling_batches`.

Tabelle professionali:

- `treatment_register`;
- `mechanical_work_register`;
- `professional_analytics`;
- `ai_credit_transactions`.

Sistema archetipi:

- `crop_archetypes`;
- `crop_profiles`;
- `crop_aliases`.

Queste tabelle vanno considerate come base storica. La verifica definitiva deve sempre passare da migrazioni/schema attuale e da `IStorageProvider`, perche il prodotto e cresciuto oltre l'elenco gennaio 2026.

## 46. Tipi di dominio integrati dal vecchio documento

Il vecchio documento elencava famiglie TypeScript che restano utili come mappa:

- `orchard.ts`: frutteto, alberi, osservazioni fenologiche, potature, raccolti, trattamenti;
- `vineyard.ts`: vigneto, filari, carico gemme;
- `olive.ts`: oliveto e raccolta olive;
- `irrigation.ts`: zone, impianti, log, scheduling, sensori;
- `nutrition.ts`: fertilizzanti, trattamenti, compatibilita, schedule;
- `individualPlant.ts`: tracking pianta individuale;
- `plantMonitoring.ts`: alert e diagnosi;
- `activeAIAdvice.ts`: raccomandazioni AI;
- `auth.ts`: profili e registrazione;
- `gardenBed.ts`: aiuole;
- `seedInventory.ts`: semi;
- `certifications.ts`: certificazioni;
- `prescriptionMaps.ts`: mappe prescrizione;
- `healthAlert.ts`: alert salute;
- `fruitTree.ts`: alberi da frutto;
- `aromatic.ts`: aromatiche;
- `strawberry.ts`: fragole;
- `raspberry.ts`: lamponi;
- `vine.ts`: viti;
- `greenhouse.ts`: serra;
- `indoorGrowing.ts`: indoor, idroponica, acquaponica;
- `customCrop.ts`: colture personalizzate;
- `archetypes.ts`: archetipi.

Per il masterdoc, questi tipi non sono solo "file". Sono il vocabolario del prodotto.

## 47. Servizi confluiti dalla vecchia documentazione

Il vecchio documento divideva i servizi in famiglie. Questa divisione resta valida, ma va letta insieme alle sezioni profonde sopra.

### 47.1 AI

- `geminiService.ts`;
- `aiPredictiveEngine.ts`;
- `aiPlanningService.ts`;
- `aiSuggestionsService.ts`;
- `collaborativeAIService.ts`;
- `aiProxyService.ts`;
- `contextAwareAIService.ts`;
- `enhancedPromptService.ts`.

### 47.2 Dominio agricolo

- `orchardService.ts`;
- `vineyardService.ts`;
- `oliveyardService.ts`;
- `dailyDiaryService.ts`;
- `plantTrackingService.ts`;
- `individualPlantService.ts`.

### 47.3 Irrigazione

- `advancedIrrigationService.ts`;
- `irrigationCalculatorService.ts`;
- `irrigationService.ts`.

### 47.4 Nutrizione e trattamenti

- `advancedNutritionService.ts`;
- `biologicalControlService.ts`;
- `composterService.ts`;
- `treatmentRegistryService.ts`;
- `unifiedOperationsService.ts`.

### 47.5 Analytics e reporting

- `costOptimizationService.ts`;
- `harvestTrackingService.ts`;
- `historicalComparisonService.ts`;
- `ndviSatelliteService.ts`;
- `diaryPredictiveEngine.ts`.

### 47.6 Integrazioni

- `droneIntegrationService.ts`;
- `blockchainTraceabilityService.ts`;
- `continuousMonitoringService.ts`;
- `photoAnalysisService.ts`.

### 47.7 Utility

- `weatherService.ts`;
- `geoClimateService.ts`;
- `fuzzySearchService.ts`;
- `plantMasterService.ts`;
- `geolocationService.ts`;
- `authErrorHandler.ts`.

## 48. Hook applicativi confluiti

Hook principali:

- `useGarden`;
- `useWeather`;
- `useFeature`;
- `useAICredits`;
- `useUserLocation`;
- `useDeviceOrientation`;
- `useOnboarding`;
- `useProductCards`;
- `useChallengeNotifications`.

Il punto chiave e che gli hook non definiscono il dominio: collegano UI e servizi. La spiegazione funzionale deve restare agganciata ai servizi e ai tipi, non solo agli hook.

## 49. Stato definitivo della documentazione

Dal 2026-07-16:

- documento canonico: `MASTERDOC.md`;
- vecchio documento tecnico generale confluito: `docs/ORTOMIO_DOCUMENTAZIONE_COMPLETA.md`;
- data definitiva visibile in intestazione: `2026-07-16`;
- regola di manutenzione: ogni aggiornamento prodotto deve aggiornare questo file, non creare un nuovo documento generale parallelo.

I documenti storici possono restare come prove o piani specifici, ma non devono essere usati come masterdoc concorrenti.

## 50. Baseline verificata e qualita tecnica

Il masterplan e stato riconciliato con il checkout 990P, non con la copia LaCie.

### 50.1 Confronto dei checkout

| Evidenza | 990P | LaCie |
|---|---|---|
| HEAD verificato | `cc5f99f`, 2 luglio 2026 | `0bdefa9`, 15 gennaio 2026 |
| Relazione | discendente diretto | antenato |
| Distanza | 383 commit avanti | 383 commit indietro |
| Differenza | 1.281 file, +322.592/-27.304 righe | base precedente |
| Scelta | repository canonico | archivio storico |

Le centinaia di file indicati come modificati nel checkout LaCie non generano un diff Git sostanziale sui file tracciati. I documenti prodotti li sono stati usati come materiale di confronto, non come verita applicativa.

### 50.2 Verifiche del 16 luglio 2026

| Controllo | Risultato |
|---|---|
| `npm run type-check` | superato |
| `npm run test:precision-hub` | 228 test superati, 0 falliti |
| `npm run build` | superato |
| Pagine generate dal build | 140 |
| Route API | 53 |
| Route prodotto principali sotto `/app` | 39, oltre alle sottoroute |

Questi controlli dimostrano che la baseline compila ed e internamente coerente. Non dimostrano da soli la corretta applicazione dello schema remoto, delle RLS o dei provider esterni.

### 50.3 Lavori gia assorbiti da non ripetere

- storage provider tipizzato in `unifiedOperationsService`;
- `getBedIdForRow` implementato e testato;
- guardie SSR sugli accessi browser nel provider cloud;
- segnali `local_sensor`, `user_observation`, `satellite`, `irrigation_meter` collegati al Director;
- fotoperiodo e fase lunare nel contesto decisionale;
- bridge piante individuali verso health alert;
- unified agronomic memory e operational ledger;
- decision ledger, outcome ed evidence;
- Smart Device persistence e automation audit;
- mappe di prescrizione con versioni, esecuzioni e outcome;
- pagine Export e Admin.

### 50.4 Confronto con `MASTERDOC_16Luglio-2026.md`

Il file di confronto e `/Users/magma/Desktop/MASTERDOC_16Luglio-2026.md`:

- 2.369 righe;
- versione 1.0 del 16 luglio 2026;
- 49 sezioni;
- descrizione funzionale, tecnica e agronomica molto ampia;
- nessuna matrice conclusiva che separi sistematicamente operativo, ibrido, beta e simulato;
- nessun piano esecutivo unico collegato ai gap verificati nel checkout 990P.

`MASTERDOC.md` conserva integralmente l'impianto utile delle 49 sezioni originali e lo traduce in una versione definitiva verificabile. Il confronto materiale produce 526 righe aggiunte e 16 righe corrette: non e una riscrittura che perde il lavoro precedente, ma una sua validazione e chiusura.

| Tema | Masterdoc 16 luglio originale | Evidenza emersa dalla verifica 990P | Traduzione nel masterdoc definitivo |
|---|---|---|---|
| Funzioni e logica agronomica | descrizione ampia e corretta di Director, priorita, irrigazione, meteo, ledger e colture | il nucleo e confermato da servizi e 228 test precision-hub verdi | sezioni 1-49 preservate; baseline e lavori gia assorbiti nelle sezioni 50.2-50.3 |
| Route | le route erano presentate come aree visibili principali | molte pagine esistono ma non sono nella sidebar primaria | sezione 2.1 rinominata `Route applicative esistenti`; destinazione e visibilita nella sezione 52 |
| Stato delle funzioni | distinzione generale tra operativo, ibrido e beta | serviva una valutazione dominio per dominio | matrice definitiva nella sezione 51 |
| Diario | descritto come memoria operativa e input per analytics/certificazioni | diario giornaliero DB-oriented e diario operativo in memoria convivono; quick event non persiste | caveat nella sezione 18 e convergenza obbligatoria nella sezione 54.1 |
| Piante individuali | modello funzionale presente | `plantOperationsService` conserva TODO, upload fake e update salute simulati | stato ibrido in 51.2 e piano DB-first in 54.2 |
| Nutrizione e trattamenti | superficie avanzata descritta da `advancedNutritionService` | servizi legacy di registro e inventario restano browser-backed/incompleti | caveat nella sezione 12 e contratto canonico in 54.4 |
| Storage | provider e fallback descritti come vantaggio evolutivo | il fallback e pericoloso sui write critici e puo creare due verita | regola fail-visible nella sezione 22 e convergenza nella sezione 54 |
| Predizioni AI | spiegata la catena contesto → suggerimento → task → feedback | POST usa engine/grounding, GET usa mock; auth garden e validazione statistica mancano | stato beta in 51.2 e gate R4 in 56 |
| NDVI | il documento chiedeva di distinguere provider, storage e dati demo | anche con Sentinel connesso il valore restituito e ancora sintetico/casuale | correzione esplicita nella sezione 21, stato simulato in 51.2 e gate reale in R5 |
| Smart Hub | contratto storage ampio, senza conclusione unica sulla maturita | device, command, telemetry e audit sono avanzati; ack/provider non sono completi | classificazione beta avanzata in 51.2 e chiusura command lifecycle in R3 |
| Prescription Maps | funzionalita e formule descritte | versioni, esecuzioni, outcome e test esistono realmente | classificazione avanzata da validare; E2E produttivo richiesto in R5 |
| Drone e blockchain | elencati tra le integrazioni | esecuzione, risultati, hash, NFT e smart contract sono simulati | esclusione dal prodotto operativo nella sezione 55 e in R5 |
| Export e Admin | route inventariate | le pagine ora esistono; Export e parziale e Admin e visibile a tutti i PRO prima del controllo ruolo | stato reale in 51.2, capability in 52.3 e completamento in R6 |
| Feature flag | `true` era elencato come funzione attiva | una flag client non dimostra persistenza, sicurezza o completezza | avvertenza corretta nella sezione 44 e capability server-side in 52.3 |
| Sicurezza | non esisteva un inventario conclusivo delle esposizioni | 53 API; route service-role fidate dal client; setup credenziali, telemetry e test esposti | gap P0 e contratto auth/ownership nella sezione 53 |
| Produzione | architettura locale descritta in profondita | build/test verdi non provano schema remoto, RLS e Security Advisor | gate remoto in 50.2 e 53.4 |
| Completamento | presenti criteri funzionali sparsi | mancava una coda unica, ordinata e verificabile | R0-R7, PR, test, rollout, KPI e Definition of Done nelle sezioni 56-61 |

### 50.5 Cosa e emerso in piu rispetto al masterdoc originale

La nuova analisi non ha smentito il valore funzionale del documento del 16 luglio. Ha reso esplicite sei verita che prima erano disperse o implicite.

1. **Il cervello agronomico e la parte piu matura.** Director, priorita, contesto raffinato, ledger, outcome, fotoperiodo, fase lunare e mappe di prescrizione non sono soltanto idee documentali: hanno implementazioni e test mirati.

2. **La maturita non e uniforme.** Accanto al nucleo nuovo restano servizi legacy in `Map`, `localStorage`, TODO e risposte simulate. Il prodotto contiene quindi tre generazioni che devono convergere.

3. **Esistenza, visibilita e operativita sono tre cose diverse.** Una pagina puo esistere senza essere nel menu; una flag puo essere `true` senza un flusso durevole; una API puo rispondere senza applicare ownership.

4. **Il rischio principale immediato e il perimetro server.** Le nuove evidenze piu urgenti sono le route credenziali NDVI, le API service-role che accettano identificativi client, la telemetry non autenticata e le route test incluse nel build.

5. **Le simulazioni devono essere isolate dal circuito decisionale.** NDVI, drone e blockchain non possono alimentare KPI, certificazioni, ledger o confidence reali finche restano sintetici.

6. **Il masterdoc deve essere anche una coda di esecuzione.** La sola descrizione del prodotto non basta: per diventare definitivo il documento deve indicare ordine, gate, rollout, rollback, KPI e criterio di uscita. Questo e il ruolo delle sezioni 56-61.

### 50.6 Decisione documentale finale

`MASTERDOC_16Luglio-2026.md` resta la fotografia sorgente da cui e partita la revisione. `MASTERDOC.md` e l'unica fonte canonica da aggiornare da questo momento.

Non devono essere creati altri masterplan generali paralleli. Audit, piani tecnici e appendici possono esistere solo come documenti subordinati e devono rimandare a questo file per stato, priorita e definizione di completamento.

## 51. Matrice definitiva di maturita

### 51.1 Stati

- **Operativo:** percorso reale, persistente, autorizzato e rileggibile.
- **Avanzato da validare:** codice e test solidi, ma manca prova completa su produzione/provider/RLS.
- **Ibrido:** percorso reale mescolato con fallback locale, servizio legacy o copertura parziale.
- **Beta:** funzione reale ma non ancora validata per esposizione generale.
- **Simulato/demo:** risultato sintetico, in memoria o browser.
- **Non esposto:** pagina presente ma non inclusa nel percorso primario.

### 51.2 Stato dei domini

| Dominio | Stato corrente | Verita operativa |
|---|---|---|
| Director e priorita agronomica | beta locale | coda spiegabile su contesto, economia, ledger e segnali persistiti; pilot non eseguito |
| Memoria agronomica unificata | operativo locale | eventi canonici DB-first e writer critici fail-closed |
| Garden, zone, filari e task | operativo locale | persistenza e ownership verificate; schema/RLS remoto da provare |
| Centro operativo | operativo locale | route primaria e contesto aziendale/operativo |
| Diario automatico e operativo | beta locale | writer persistenti, cron autenticati e retry osservabili |
| Piante individuali | operativo locale | operazioni singole/bulk persistenti e idempotenti |
| Suolo e garden memory | operativo locale | fatti durevoli nel provider, preferenze UI separate |
| Trattamenti e inventario fito | beta locale | registro DB-first, carenza e scarico solo dopo conferma |
| Irrigazione | beta locale | bisogno, piano e misura distinti; scheduling automatico disattivato |
| Nutrizione | beta locale | lifecycle e stock confermato; dose/compatibilita avanzate disattivate |
| Smart Hub | beta locale | telemetry, idempotenza, retry e ack; provider/pilot remoti mancanti |
| Salute e alert | beta locale | alert deterministici, persistenti e deduplicati |
| Predizioni AI | disattivato | motore riproducibile e outcome; manca validazione staging |
| Monitoraggio continuo | beta locale | run, alert, errori e outcome persistiti |
| NDVI | beta/indisponibile | Statistical API reale con provenienza; nessun fallback sintetico |
| Prescription Maps | beta locale | dati reali, quality gate e persistenza atomica; campo-macchina da validare |
| Drone | simulato | laboratorio isolato da KPI e registri reali |
| Blockchain/NFT | simulato | laboratorio privo di ricevute pubbliche o valore certificativo |
| Certificazioni | beta locale | provenance, append-only e demo exclusion; storage/RLS remoto da provare |
| Export | beta locale | CSV stabile e PDF binario paginato, autorizzati e auditati |
| Admin | operativo locale | ruolo server-side, overview, health e readiness auditata |

## 52. Visibilita, navigazione e capability

### 52.1 Navigazione corrente

Desktop, mobile, bottom navigation, ricerca e Help derivano dal registro unico `config/capabilities.ts`. Il server risolve ruolo, tier, feature rollout, schema e provider; i client consumano l'insieme gia autorizzato. I test verificano parita desktop/mobile, route esistenti, link Help e visibilita Admin per ruolo.

### 52.2 Route esistenti ma non primarie

- `/app/ai-predictions`;
- `/app/almanacco`;
- `/app/calendar`;
- `/app/diary` e `/app/journal`;
- `/app/harvest`;
- `/app/plants`;
- `/app/reports`;
- `/app/satellite-config`;
- `/app/semenzaio`;
- `/app/smart-simple`;
- `/app/treatments`;
- `/app/zones`;
- `/app/pianifica`.

Classificazione applicata:

| Route/gruppo | Destinazione |
|---|---|
| `diary` + `journal` | Diario canonico esposto tramite capability |
| calendar, harvest, semenzaio, plants, treatments | capability operative o accessi contestuali |
| ai-predictions | nascosta finche il rollout server-side non la abilita |
| satellite-config | Admin-only |
| smart-simple | route tecnica non primaria |
| compare | accesso contestuale da Analytics |
| reports | accesso da Analytics/Export |
| zones e pianifica | alias o accesso contestuale da Garden/Planner |

### 52.3 Capability canonica

La navigazione deriva da un solo descriptor con:

- route, label, gruppo e icona;
- ruolo e tier;
- capability server-side;
- stato `operativo/beta/simulato`;
- visibilita desktop/mobile;
- provider e schema richiesti.

Admin deve dipendere dal ruolo reale, non dal tier PRO.

## 53. Sicurezza, autorizzazione e ownership

### 53.1 Stato corrente

`/app/*` e protetto dal proxy server. Gli endpoint sensibili usano guardie canoniche per utente, Admin, garden, organizzazione, cron e dispositivo. Gli identificativi inviati dal client non costituiscono autorita. I test coprono anonimo, non-Admin, cross-garden, cross-organization, cron replay e device token.

Il bypass locale e invece adeguatamente confinato: richiede localhost, ambiente development e tre flag espliciti, ed e disattivato in produzione.

### 53.2 Gap P0 originari, chiusi localmente

1. `[chiuso]` le route credenziali NDVI richiedono Admin e non scrivono secret via browser;
2. `[chiuso]` il setup Sentinel non esegue script arbitrari per utenti non autorizzati;
3. `[chiuso]` suggestions deriva l'utente dalla sessione;
4. `[chiuso]` calendario e challenge non accettano l'identita client come autorita;
5. `[chiuso]` predictions verifica sessione e ownership garden;
6. `[chiuso]` drone e blockchain sono autorizzati e isolati come simulazioni;
7. `[chiuso]` la telemetry autentica la sorgente device;
8. `[chiuso]` API test e route test sono indisponibili in produzione.

Catalogo piante, manuale, registrazione, supporto limitato e tracciabilita consumer read-only possono essere pubblici, ma devono essere classificati e rate-limited esplicitamente.

### 53.3 Contratto di sicurezza implementato

Helper server-only canonici:

- `requireUser(request)`;
- `requireAdmin(request)`;
- `requireGardenAccess(request, gardenId, action)`;
- `requireOrganizationAccess(request, organizationId, action)`;
- `requireCron(request)`;
- `requireDeviceSource(request, deviceId)`.

La matrice API P0 registra metodo, classe, ownership, uso service role, rate limit, dati sensibili, test e stato rollout.

### 53.4 RLS e produzione

Le migrazioni contengono policy e hardening e le prove locali bloccano accessi cross-tenant. La prova locale non certifica lo stato remoto. Prima del rilascio occorre confrontare:

- migrazioni locali;
- schema remoto;
- policy RLS effettive;
- Security Advisor;
- accesso cross-user e cross-organization;
- route service-role che possono aggirare RLS.

## 54. Convergenza dei dati operativi

### 54.1 Diario unico

Il percorso canonico converge `dailyDiaryService`, `operationalDiaryService`, `/app/diary`, `/app/journal`, `diary_events` e `daily_diary_entries` su un contratto persistente. Restano alias UI, ma non writer browser critici. Il contratto comprende:

- garden/zone/filare/pianta;
- autore, data e fonte;
- task/intervento correlato;
- allegati reali;
- lineage e audit;
- stato di verifica;
- writer DB-first e reader dopo reload.

### 54.2 Piante individuali

`plantOperationsService` usa `IStorageProvider` per:

- operazioni singole e bulk;
- foto con ownership;
- health update basato su osservazione/outcome;
- lineage completo;
- idempotenza, concorrenza e retry.

### 54.3 Memoria e suolo

I fatti durevoli vivono nel DB, le decisioni nel decision ledger, gli outcome nell'operational ledger. Il local storage resta per preferenze UI o cache esplicitamente non critica.

### 54.4 Trattamenti

Il registro canonico e DB-first con:

- prodotto, lotto, dose, unita e operatore;
- garden, zona, filare, pianta e task;
- meteo osservato;
- carenza e intervallo di sicurezza;
- stock e scarico inventario;
- outcome ed efficacia;
- audit append-only ed export conforme.

### 54.5 Migrazioni

P1-P8 costituiscono la sequenza additiva della release candidate. Gli ambienti esistenti devono ancora essere aggiornati con controlli di drift e prove su snapshot; nessuna migrazione remota e stata applicata in questa esecuzione.

## 55. Simulazioni e verita del prodotto

Una simulazione e ammessa se il contratto e la UI dichiarano `simulated` o `demo`.

Non possono essere presentati come reali:

- NDVI casuale o privo di provenienza provider;
- volo drone marcato eseguito quando usa `simulateFlightExecution`;
- transaction hash, NFT o smart contract generati casualmente;
- alert persistente conservato soltanto in una `Map`;
- quick event con alert di successo senza write;
- foto con URL `example.com`;
- PDF che e in realta HTML stampabile o JSON.

Drone e blockchain restano laboratori separati finche non esistono provider, ricevute, chiavi, costi, failure mode e verifiche reali.

NDVI usa ora il servizio Statistical autenticato e salva provider, intervallo, geometria, cloud cover, algoritmo e quality status. Senza provider, geometria o qualita adeguata fallisce in modo esplicito; il rollout resta beta finche provider smoke e confronto campo non sono completati.

## 56. Piano esecutivo definitivo

Il piano operativo corrente e mantenuto in [`docs/reports/execution-plans/ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md`](./docs/reports/execution-plans/ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md). Il piano del 16 luglio, la roadmap del 22 luglio e i piani di singola feature restano evidenze storiche e di progettazione, non code operative concorrenti. Le sezioni seguenti riassumono la sequenza; il piano master contiene stato, criteri di uscita, verifiche, commit e rischio residuo per ogni blocco.

### 56.0 Consuntivo P0-P8

| Fase | Stato locale | Evidenza principale | Residuo remoto |
|---|---|---|---|
| P0 | completata | inventario, route/API/schema e baseline | progetto staging dedicato |
| P1 | completata | guardie server, ownership, RLS locale | Security Advisor e RLS target |
| P2 | completata | capability unica e test link/ruoli | nessuno applicativo |
| P3 | completata | write critici DB-first e idempotenza | migrazione target |
| P4 | completata | lifecycle fisico, ack, retry e dead letter | provider e pilot |
| P5 | completata | predizioni riproducibili e outcome | calibrazione staging |
| P6 | completata | Sentinel reale, provenance e atomicita | provider smoke/costi |
| P7 | completata | dossier, CSV/PDF e Admin auditati | storage policy target |
| P8 | completata | rollout server-side, readiness e restore drill locale | snapshot, shadow e pilot |

Le sezioni R0-R7 sotto descrivono il contratto che ha guidato l'implementazione. Sono consuntivo storico, non una seconda coda attiva.

### R0 — Sicurezza e ownership

- session helper server-only;
- protezione server `/app/*`;
- classificazione delle 53 API;
- chiusura test/setup routes;
- ownership su route service-role;
- auth device e cron;
- admin visibility basata sul ruolo;
- verifica RLS e schema remoto.

**Uscita:** nessun identificativo client e usato come autorita; cross-user e cross-organization sono bloccati.

### R1 — Navigazione e capability

- descriptor unico desktop/mobile;
- eliminazione link e menu storici incoerenti;
- consolidamento route duplicate;
- badge Beta/Simulazione;
- capability server-side per ruolo, tier, schema e provider.

**Uscita:** ogni voce visibile apre una funzione autorizzata e realmente disponibile.

### R2 — Nucleo persistente

- Diario canonico;
- operazioni/foto piante individuali;
- memoria suolo/garden DB-first;
- registro trattamenti e inventario;
- baseline migrazioni e drift check.

**Uscita:** tutti i dati sopravvivono a reload e restart senza fallback silenzioso.

### R3 — Smart Hub, irrigazione e nutrizione

- command lifecycle `requested/sent/acknowledged/failed/timed_out`;
- idempotency e device ownership;
- rimozione task irrigazione mock;
- volume previsto/misurato;
- inventario, dose, compatibilita, applicazione e outcome;
- attivazione graduale delle flag.

**Uscita:** nessun comando o intervento e dichiarato eseguito prima della conferma.

### R4 — Salute, predizioni e monitoraggio

- memoria storica canonica in tutti gli engine;
- input predizioni caricati server-side;
- rimozione GET mock;
- modello/regola, orizzonte, confidence e validita;
- alert persistenti e job idempotenti;
- forecast confrontato con outcome.

**Uscita:** ogni previsione e riproducibile, verificabile e limitata al garden autorizzato.

### R5 — Precision farming e provider remoti

- processing NDVI reale;
- quality gate e storico satellite;
- E2E Prescription Maps con dati reali;
- transazioni/RPC per aggiornamenti critici;
- isolamento esplicito di drone e blockchain demo.

**Uscita:** dati remoti e simulati non possono confluire nello stesso KPI senza provenienza.

### R6 — Certificazioni, export e Admin

- CRUD/RLS e audit append-only;
- esclusione dati demo dai dossier;
- CSV stabile e PDF reale;
- audit export sensibili;
- Admin server-gated, azioni complete e provider health sicuro.

**Uscita:** documenti riproducibili, autorizzati e utilizzabili come evidenza.

### R7 — Documentazione e pulizia

- mantenere questo file come unico masterplan;
- manuale limitato al comportamento rilasciato;
- archiviare `COMPLETE/SUCCESS/FINAL` storici;
- aggiornare `TASKS.md` eliminando fix gia presenti;
- spostare DeFi, marketplace, NFT e superintelligence nella roadmap sperimentale.

**Uscita:** una sola verita per prodotto, maturita, sicurezza e roadmap.

## 57. Ordine delle pull request

1. PR #17 — P0 baseline;
2. PR #18 — P1 sicurezza;
3. PR #19 — P2 capability e navigazione;
4. PR #20 — P3 persistenza core;
5. PR #21 — P4 operazioni fisiche;
6. PR #22 — P5 salute, predizioni e monitoraggio;
7. PR #23 — P6 dati remoti e isolamento demo;
8. PR #24 — P7 certificazioni, export e Admin;
9. PR #25 — P8 rollout e osservabilita;
10. PR #26 — P9 contenuti canonici;
11. PR #27 — P9 bonifica documentale separata.

Ogni PR deve essere limitata a un dominio, reversibile e priva di pulizie massive non correlate.

## 58. Test e gate di rilascio

### 58.1 Sicurezza

- anonimo → 401 sulle route authenticated;
- utente A → 403/404 sulle risorse di B;
- membro senza permesso → 403;
- PRO non-admin → nessun link Admin e 403 API;
- cron senza secret → 401;
- device senza credenziale → 401;
- route test/setup → disabilitate in produzione.

### 58.2 Persistenza

- write → reload → read;
- write → restart → read;
- errore cloud → errore visibile, nessun fallback locale silenzioso;
- bulk parziale → stato idempotente/coerente;
- foto → owner e URL temporaneo;
- migrazione → schema atteso e rollback logico.

### 58.3 Agronomia

- mantenere i 228 test esistenti;
- aggiungere golden scenario con dati reali anonimizzati;
- verificare vento, pioggia, temperatura, carenza e disponibilita prodotto;
- confrontare forecast e outcome;
- impedire che input simulato aumenti confidence reale;
- regressione su ledger e spiegabilita.

### 58.4 Gate tecnico

```bash
npm run test:release
npm run type-check
npm run build
npm run release:check
npm run docs:sync:check
```

Risultato locale P8: tutte le suite di fase verdi, 228 test `precision-hub`, type-check verde, build 144 pagine e manifest locale completo. `deployReady=false` e il risultato corretto finche i gate remoti non sono registrati.

## 59. Rollout e rollback

### 59.1 Staging

**Non eseguito al 17 luglio 2026.** I punti seguenti sono gate obbligatori, non risultati acquisiti.

- migrazioni su clone/snapshot;
- test RLS cross-user;
- provider di staging;
- dataset anonimizzato;
- audit e log verificati.

### 59.2 Shadow mode

- nuove decisioni calcolate ma non pubblicate;
- confronto con il flusso corrente;
- raccolta mismatch;
- nessun comando automatico.

### 59.3 Pilot

- una organizzazione/garden;
- capability per singolo dominio;
- monitoraggio errori e outcome;
- rollback indipendente.

### 59.4 Attivazione progressiva

1. sicurezza e core operativo;
2. diario, piante e trattamenti;
3. Smart Hub, irrigazione e nutrizione;
4. predizioni;
5. NDVI reale;
6. funzioni sperimentali solo opt-in.

### 59.5 Regole di rollback

- capability disattivabile server-side;
- migrazioni additive prima delle rimozioni;
- dual-read temporaneo e single-write canonico;
- backup e query di riconciliazione;
- nessuna cancellazione legacy prima della verifica;
- provider non disponibile → stato esplicito, mai dato finto.

## 60. KPI del completamento

### Misure disponibili nella baseline locale

- 10/10 test sicurezza, 7/7 capability, 9/9 persistenza, 6/6 operazioni fisiche;
- 7/7 salute/predizioni, 7/7 dati remoti, 7/7 regulatory/export/Admin, 7/7 rollout;
- 228/228 regressioni `precision-hub`;
- 0 link capability/Help mancanti nei test;
- 0 fallback casuali nei percorsi NDVI e 0 mock negli export regolatori;
- 144 pagine generate dal build.

I KPI percentuali seguenti sono target di esercizio. Non sono dichiarati raggiunti finche staging e pilot non producono misure reali.

### Sicurezza

- 100% route classificate;
- 100% route sensibili con test auth/ownership;
- 0 accessi cross-tenant;
- 0 secret scritti via route HTTP.

### Affidabilita dati

- 100% write critici rileggibili dopo restart;
- 0 fallback silenziosi cloud → local storage;
- 100% record operativi con owner, fonte e timestamp;
- tasso errori write e code retry misurati.

### Agronomia

- percentuale decisioni con explanation completa;
- percentuale task con outcome misurato;
- errore forecast per dominio e orizzonte;
- copertura segnali reali vs stimati;
- miglioramento misurato dopo intervento.

### Prodotto

- 0 link morti;
- 0 funzioni simulate senza badge;
- tempo garden → prima decisione utile;
- percentuale task completati e verificati;
- export/certificazioni generati senza dati demo.

## 61. Definizione definitiva di completamento

Un dominio OrtoMio e completo soltanto quando:

1. risolve un flusso utente end-to-end;
2. usa dati con owner, fonte, timestamp, freshness e qualita;
3. applica autorizzazione server-side;
4. persiste e rilegge dopo restart;
5. distingue reale, stimato e simulato;
6. gestisce errori, retry e idempotenza;
7. ha test di dominio, sicurezza e persistenza;
8. coincide con schema e RLS di produzione;
9. navigazione, capability, manuale e masterplan dichiarano lo stesso stato;
10. l'esecuzione produce un outcome che puo migliorare la decisione successiva.

Il circuito finale e:

```text
dato reale
  -> contesto agronomico
  -> decisione spiegabile
  -> task autorizzato
  -> esecuzione verificata
  -> outcome persistito
  -> memoria aggiornata
  -> decisione successiva migliore
```

Questo e il criterio definitivo con cui OrtoMio deve essere sviluppato, verificato, documentato e rilasciato.

## 62. Release candidate P0-P8 e limiti residui

La baseline locale e pronta per essere valutata in staging, non per un'attivazione diretta in produzione. Il gate remoto deve registrare identificatori verificabili di snapshot, restore drill, Security Advisor, provider smoke e pilot. Qualunque violazione delle soglie P8 richiede rollback della capability interessata.

Limiti residui:

- stato effettivo di schema, RLS e bucket storage sul target non verificato;
- nessun provider remoto chiamato durante questa esecuzione;
- predizioni, scheduling irriguo e certificazioni avanzate disattivati;
- automazioni fisiche subordinate ad ack e pilot;
- NDVI e Prescription Maps beta fino al confronto sul campo;
- dossier di conformita senza valore di certificazione ufficiale;
- drone e blockchain esclusivamente simulati.

La successiva decisione di rilascio deve basarsi sull'endpoint Admin di readiness e su evidenze esterne, non sulla sola presenza del codice.
