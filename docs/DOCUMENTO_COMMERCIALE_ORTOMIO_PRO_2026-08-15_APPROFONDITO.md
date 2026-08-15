# OrtoMio Pro — Documento commerciale approfondito

- **Data:** 2026-08-15
- **Stato:** in costruzione — versione in aggiornamento continuo mentre prosegue lo scavo nel codice, nei manuali (`docs/manual/*.md`, 35 file) e nella storia git (1117 commit)
- **Sostituisce/estende:** [DOCUMENTO_COMMERCIALE_ORTOMIO_PRO_2026-08-01.md](./DOCUMENTO_COMMERCIALE_ORTOMIO_PRO_2026-08-01.md) (versione precedente, più generica) — questa versione va in profondità sui meccanismi reali, verificati nel codice sorgente, non solo nella prosa dei documenti.
- **Metodo:** ogni claim in questo documento è verificato in almeno uno di: MASTERDOC.md, codice sorgente (`services/`, `logic/`, `types/`, `components/`), manuali utente (`docs/manual/`), storia git. Nessun numero, formula o meccanismo è inventato. Dove un dato è illustrativo (non un valore reale osservato in produzione), è etichettato esplicitamente.

## 1. Tesi del prodotto

OrtoMio Pro non registra dati agricoli: li **mette in relazione** e mostra il ragionamento che porta a un'azione. È la differenza tra un foglio Excel (che può contenere meteo, rotazioni, fasi lunari, ognuno nella sua scheda) e un motore che fa scattare un avviso perché fase lunare, stress idrico e pH sono fuori soglia nello stesso momento sulla stessa zona — e spiega perché.

## 2. Il problema

In molte aziende agricole le informazioni vivono in quaderni, fogli Excel, foto sul telefono, promemoria a voce, app meteo separate. Questo rende difficile:
- ricostruire perché un intervento è stato deciso;
- coordinare zone, filari, colture e operatori;
- distinguere dato misurato, stimato, mancante;
- confrontare previsione ed esito;
- dimostrare tracciabilità a un ente certificatore.

## 3. I meccanismi differenzianti (verificati nel codice)

### 3.1 Il punteggio è scomponibile, non un voto a scatola chiusa

`services/agronomicPriorityService.ts` calcola un punteggio 0-100 partendo da un `baseScore` e sommando/sottraendo in modo tracciabile: confidenza sui segnali disponibili, copertura dei segnali P0 richiesti, bonus di fase critica, feedback misurato, lettura economica, contesto raffinato del sito, qualità della fonte del profilo colturale.

La qualità della fonte pesa esplicitamente sul punteggio:
- fonte `plant_id` (pianta riconosciuta con precisione): **+4**
- fonte `custom_crop`: **+3**
- fonte `taxonomy`/`functional_category`: **+2**
- fonte `fallback` (dato generico): **−3**

La confidenza finale è un numero tra **0.3 e 0.98**, mai un generico "alta/media/bassa", e scende quando i segnali mancano.

### 3.2 Un pannello reale mostra il ragionamento — non serve fidarsi

`components/ai/AITransparencyPanel.tsx` è un componente reale, apribile su qualunque suggerimento AI, con **4 tab**: Panoramica, Dati Usati, Calcoli, Alternative. Mostra esattamente quali segnali hanno pesato, quali mancavano, come si è arrivati al punteggio, e quali alternative sono state scartate e perché. È dimostrabile dal vivo in demo, non un'affermazione di marketing.

### 3.3 Un layer economico separato da quello agronomico

`services/agronomicEconomicPriorityService.ts` stima costo dell'intervento, costo del ritardo, valore protetto, e restituisce una fra tre raccomandazioni: `intervene_now`, `next_cycle`, `monitor`. Due interventi possono essere entrambi agronomicamente corretti ma non ugualmente convenienti — il sistema li distingue.

### 3.4 Un orchestratore che correla ~20 motori in un'unica lettura

`services/directorService.ts` (1300+ righe) importa e combina servizi di irrigazione, fenologia, fase lunare, fotoperiodo, storico ambientale, salute piante, mappe di prescrizione, ledger decisionale, priorità economica. Il risultato è un `DailyBriefing` giornaliero: meteo sintetico, fase lunare, GDD (Growing Degree Days), ore di stress da caldo, indice di stress idrico, fotoperiodo, azioni prioritizzate con urgenza/impatto/costo/confidenza. Non dieci grafici da leggere separatamente: una lettura già correlata.

### 3.5 Rotazione colturale con motivazione botanica reale

`services/cropRotationService.ts` e `logic/rotationOptimizer.ts` codificano 8 famiglie botaniche (Solanacee, Leguminose, Brassicacee, Cucurbitacee, Ombrellifere, Asteracee, Chenopodiacee, Liliacee) con regole di successione — da evitare / buono / eccellente — e **motivazione agronomica esplicita**. Esempio reale dal codice: dopo Solanacee, "le Solanacee depauperano il suolo. Seguire con leguminose per ripristinare l'azoto." Non è un flag "non ripetere la stessa coltura": è un ragionamento su cosa impoverisce e cosa arricchisce il suolo. `rotationOptimizer.ts` estende questo a un'ottimizzazione automatica su più annate (trimestri Q1-Q4).

### 3.6 Due motori di pianificazione distinti, non in competizione

- **Planner classico** (`services/classicPlannerService.ts`): deterministico. Punteggio di rotazione, motivazione botanica, avvisi, finestra di semina ideale. Verificabile riga per riga.
- **Planner AI** (`services/aiPlanningService.ts`): predittivo ed economico. Scaglionamento delle semine per raccolto continuo, overview con superficie/resa stimata/investimento/ricavo atteso/**ROI**, timeline di fasi con attività e costi, analisi del rischio tipizzata (meteo, mercato, malattie — ognuna con probabilità, impatto, mitigazione), calibrata su ettari, canale di mercato (fresco/trasformazione/export) e livello di esperienza dell'utente.
- I due piani confluiscono in `logic/annualPlannerEngine.ts`: date di semina corrette per altitudine e temperatura del suolo, compatibilità solare validata.
- **Il ciclo si chiude davvero:** `buildMeasuredFeedbackOptimizations` in `aiPlanningService.ts` confronta rese e costi realmente registrati con la media del piano e genera raccomandazioni adattive concrete (es. "riduci la superficie delle fasi deboli e concentra il prossimo ciclo nelle finestre che hanno reso di più"). Il piano si corregge sull'esito reale, non resta statico a fine stagione.

### 3.7 Tracciabilità pianta per pianta, dal seme al raccolto

`services/seedlingService.ts` gestisce la pipeline vivaio: semina/acquisto → germinazione → nursing (30 giorni standard) → hardening (10 giorni standard) → pronto al trapianto, con calcolo della data di trapianto attesa e della semina ottimale a ritroso da una data target.

Ogni pianta individuale (`types/individualPlant.ts`, tipo `GardenPlant`) ha un **codice proprio** (es. `F1-P001`), collegato al lotto vivaio di origine (`seedlingBatchId`). Ogni operazione successiva (`PlantOperation`: irrigazione, concimazione, trattamento, potatura...) registra lo stato di salute **prima e dopo** (`healthScoreBefore`/`healthScoreAfter`), l'efficacia (1-10) e la risposta della pianta. Il raccolto (`PlantHarvest`) chiude il cerchio con quantità, qualità, categoria dimensionale, destinazione (consumo/stoccaggio/trasformazione/vendita/seme), valore di mercato — per quella pianta specifica, non per la zona in generale.

**Collegamento di business reale:** questa tracciabilità alimenta direttamente il punteggio di conformità per la certificazione biologica (`BioCertificationForm.tsx`, MASTERDOC §15): "sistema di tracciabilità" vale 7 punti su 100, "separazione bio/convenzionale" altri 7, "registri di produzione" altri 6. Non è un dettaglio tecnico fine a sé stesso: è infrastruttura che serve direttamente a un obiettivo di certificazione.

### 3.8 Irrigazione previsionale reale (non solo il calcolatore rapido)

Il calcolatore rapido (portata gocciolatore × numero gocciolatori, ecc. — `irrigationCalculatorService.ts`) è solo il livello base, con metodo dichiarato e confidenza (alta/media/bassa a seconda che il dato sia misurato o stimato).

Il livello previsionale reale (`services/advancedIrrigationService.ts`) usa il metodo **Penman-Monteith**: evapotraspirazione di riferimento (ET0) moltiplicata per il coefficiente colturale della fase fenologica (Kc) = fabbisogno colturale (ETc), meno la pioggia efficace, corretto per pendenza ed esposizione del sito, bilancio idrico del suolo, qualità dell'acqua (aggiustamento per lisciviazione), efficienza dell'impianto (85% di default) → volume in litri e durata in minuti raccomandati, con un fattore di correzione AI e un livello di confidenza dichiarato, aggiornati dal confronto con l'irrigazione realmente eseguita (`getWaterMeasuredFeedbackSummary`).

### 3.9 IoT: Smart Hub con lifecycle dei comandi a prova di falso positivo

`app/api/iot/` integra **ThingsBoard** (telemetria) e dispositivi **Tuya** reali. Ogni comando verso un dispositivo fisico (es. apertura valvola) segue un lifecycle a stati con idempotenza: `requested → sent → acknowledged / failed / timed_out / dead_letter`. Principio dichiarato nel manuale (`docs/manual/14-smart-hub.md`): *"un comando non è considerato fisicamente eseguito finché non arriva un ack o una misura coerente. Automazioni non presidiate e compatibilità universale hardware non sono garantite."*

Sopra la telemetria, `services/smartDeviceAutomationAnalyticsService.ts` calcola un punteggio di severità per dispositivo/zona e rileva automazioni inefficaci — esempio reale dal codice: *"il suolo reagisce poco rispetto ai litri erogati. Controlla uniformità della linea, infiltrazione e profondità dei sensori."* Non solo raccolta dati: diagnosi di malfunzionamento idraulico.

**Perché questo principio conta:** è la stessa disciplina che ha portato, il 21-22 luglio 2026, a correggere un bug reale in produzione dove l'invio di una notifica veniva marcato "riuscito" senza che la notifica fosse mai stata effettivamente inviata (vedi MASTERDOC §0). Il lifecycle a stati del Smart Hub è progettato apposta per non ripetere quella classe di errore sui comandi fisici.

### 3.10 Export bloccato senza audit trail, difeso da CSV injection

`services/regulatoryExportService.server.ts` implementa `csvCell()`: antepone un apice a qualunque valore che inizi con `=`, `+`, `-`, `@` — difesa standard da formula-injection CSV (un attaccante non può far eseguire una formula/comando aprendo l'export in Excel). Più rilevante dal punto di vista di prodotto: ogni export PDF/CSV richiede un insert riuscito su `export_audit_log` (`app/api/export/pdf/route.ts`, `app/api/export/csv/route.ts`) — se l'audit fallisce, **il file non viene consegnato**. Nessun tool generico blocca la consegna in assenza di un audit trail persistito; qui è un gate hard-coded lato server, non una policy scritta su carta.

### 3.11 Indice di Ravaz per il vigneto — formula agronomica reale, non un campo libero

`services/vineyardBudLoadService.ts` implementa l'**indice di Ravaz** (standard viticolo reale): resa uva in kg / peso del legno di potatura in kg, con fasce di interpretazione codificate (`<3`, `<5`, `≤10`, `≤15`, `>15`) e un target di default a 7 (metà del range ottimale 5-10) usato da `calculateOptimalBudLoad()` per calibrare il carico di gemme. Non un campo numerico libero: un indice agronomico professionale con soglie vere.

### 3.12 Registro attività su proiezioni Postgres reali, con collegamento diretto al piano AI

`docs/manual/10-activity-registry.md` + migrazioni verificate: il registro legge da tre viste Postgres reali — `agronomic_operation_outcome_projection` (migrazione `20260424130000`), `agronomic_operation_signal_projection` (`20260424140000`), `agronomic_precision_execution_projection` (`20260424133000`). I task della coda agronomica avanzata portano uno **"snapshot decisionale" come metadata** — collegamento diretto e verificabile tra planner AI e ledger operativo, non due sistemi paralleli scollegati. Il manuale ammette onestamente che in modalità degradata (senza ledger DB) il registro mostra solo `garden_tasks`, non il ledger operativo completo — limite dichiarato, non nascosto.

### 3.13 API pubbliche: assenza dichiarata per scelta, non gap nascosto

`app/api/public-contract/route.ts` espone un endpoint versionato (`version: 'v1'`) che elenca cosa è realmente implementato (`agronomist-consultations`, `ai-suggestions`, `projection-ledger`) e dichiara esplicitamente `external-api: 'not-in-release-scope'`, con nota: *"The commercial 1.0 scope does not expose a public SDK or webhook gateway."* Non un manuale vago: è il codice runtime stesso a negare, in modo verificabile, l'esistenza di un'API pubblica per la release 1.0. Da non promettere in materiale commerciale finché non cambia.

### 3.14 Chat AI: un solo provider, gating a crediti reale (non a tier)

`/api/ai/chat` e `/api/ai/generate` usano un unico provider server-side, **Google Gemini** (`gemini-2.0-flash-exp`), con chiave lato server. Ogni funzione ha un costo in crediti dichiarato in `lib/credits.ts` (chat: 1, diagnose: 3, advanced_analysis: 5...), scalati via RPC Supabase con transazione registrata (`ai_credit_transactions`); senza crediti sufficienti la richiesta risponde `402 insufficient_credits` in modo esplicito, non con un fallback silenzioso.

**Nota di consolidamento commerciale:** dal 26/07/2026 (commit `72852c0`, confermato dal test `singleProCommercialModel.test.ts`) il prodotto ha un solo piano PRO — free/plus/pro sono stati unificati. Questo è materiale commerciale legittimo (un solo piano, nessuna scala a gradini da spiegare), ma va scritto come tale, non come "gating per tier": il gating reale oggi è solo sui crediti.

### 3.15 La campagna di correzione è più ampia di quanto pensassi

Verificata con precisione: **21 commit**, concentrati in **3 giorni** (25-27/04/2026), etichettati T1-T16 più alcune chiusure di gap puntuali (`GAP-2026-04-23-A` ... `-AL`, circa 38 item nel registro). Non tocca solo prosa dei manuali: almeno 8 commit modificano **codice applicativo reale** — dashboard analytics, Smart Hub, form di certificazione bio, dashboard predizioni AI, widget di tracciabilità, pagina export. È quindi una correzione di sostanza (badge, stati, componenti UI), non solo di testo. Il documento master che tracciava questi task (`ORTOMIO_EXECUTION_PLAN_MASTER_INDEX_2026-04-19.md`) è stato rimosso dal repo a fine campagna come "superato" — tutti i 16 blocchi risultavano chiusi.

## 4. Maturità e uso corretto — dato di codice, non affermazione

`config/capabilities.ts` registra 31 capability con un campo `maturity` reale, mostrato nell'interfaccia stessa (`getCapabilityBadge()`). Stato verificato il 22/07/2026:
- **15 stabili** — nessun badge mostrato, uso pieno.
- **14 in beta** — badge "Beta" visibile in app (centro operativo, planner AI, diario, irrigazione, nutrizione e trattamenti, certificazioni, NDVI satellitare, prescription maps, Smart Hub e altre). Beta = funzionalmente completo e testato in locale, senza ancora le prove richieste in produzione (RLS su più aziende reali, pilot con cliente vero, contract test sul provider esterno) — non "rotto" o "incompleto".
- **2 in simulazione** — drone e blockchain/NFT: laboratori isolati, mai promossi finché non c'è hardware o provider reale collegato.

Nessuna capability beta viene promossa a stabile finché la sua prova specifica non è chiusa con evidenza riproducibile — decisione di prodotto confermata il 22/07/2026.

## 4bis. La cultura dell'onestà è verificabile anche nella documentazione stessa

16 dei 35 manuali utente (`docs/manual/*.md`) sono stati riscritti in una passata esplicita di correzione per eliminare marketing gonfiato — non genericamente "aggiornati", ma riportati a dichiarare stati reali con formato uniforme (Stato / descrizione / limiti). Esempi letterali trovati nel codice:

- **Certificazioni** (`04-certifications.md`): *"non dichiara conformità GlobalG.A.P., non sostituisce un audit, non emette certificati."*
- **Business Intelligence** (`22-business-intelligence.md`): dichiara sé stesso corretto perché il capitolo precedente *"era scritto come se esistesse una suite enterprise di BI completamente chiusa"* — forecasting finanziario, data mining e customer segmentation *"non vanno presentati come funzionalità chiuse."*
- **Success stories** (`31-success-stories.md`): *"nessuna success story verificata"* — nessun cliente, citazione o ROI pubblicabile senza consenso e fonte reale.
- **Support contacts** (`33-support-contacts.md`): si dichiara *"placeholder interno, non informazione commerciale confermata."*
- **NDVI** (`05-ndvi-satellite.md`): indisponibile senza credenziali Sentinel Hub verificate — **nessun fallback casuale o inventato**.
- **Consulenze agronomiche** (`11-agronomist-consultations.md`): il servizio ammette di contenere ancora *"helper leggeri/stub per diverse letture"* — nessun marketplace, booking, pagamenti, SLA, matching.
- **Lavorazioni meccaniche** (`17-mechanical-operations.md`): alcuni helper sono *"ancora mock o sequenze predefinite"*, nessuna integrazione telematica reale (John Deere, Case IH), niente GPS, niente fleet management.
- **Maturazione olive/mosca olearia** (`19-olive-management.md`): i widget sono *"stato locale/sample-style"*, non uniformemente collegati al backend — da non vendere come monitoraggio completo.
- **Sostenibilità** (`24-sustainability.md`): nessun carbon accounting Scope 1/2/3 verificato, nessun ESG formale — tutto tracciato come lavoro futuro esplicito.
- **Predizioni AI**: disattivate in release candidate, richiedono migrazione remota, calibrazione e pilot prima di essere riattivate.

**Perché questo è materiale commerciale, non solo trasparenza interna:** pochissimi prodotti agri-tech ammettono per iscritto, nella propria documentazione ufficiale, che un modulo non fa quello che sembrerebbe fare. Questo livello di autocorrezione è esso stesso una prova di serietà, coerente con l'asse "verifica, non fidarti" già stabilito per il resto del prodotto (Authority Bias via onestà — chi ammette i propri limiti risulta più credibile su tutto il resto).

**Uso raccomandato:** citare 2-3 di questi esempi nella landing/nel documento commerciale definitivo, non tutti — l'elenco completo rischia di diventare un disclaimer legale invece che una prova di cultura. Il documento finale dovrebbe scegliere gli esempi più rilevanti per il pubblico target (aziende agricole + tecnici), probabilmente certificazioni e NDVI, che toccano direttamente la loro decisione d'uso.

## 5. Utenti

- aziende agricole strutturate — coordinamento di zone, filari, operatori;
- tecnici e consulenti agronomici — dati confrontabili tra più aziende clienti;
- gestori di frutteti, oliveti, vigneti — precision farming, monitoraggio specifico (es. maturazione olive e mosca olearia, compliance GlobalG.A.P.);
- organizzazioni che necessitano ruoli, audit, separazione dei dati.

## 6. Nota metodologica — cosa NON è (ancora) vero

Verificato esplicitamente per evitare overclaim:
- **Nessun import Excel/XLSX reale nel codice.** Non è una funzionalità del prodotto — non va menzionata come tale.
- **Il pilot agronomico reale non è ancora avvenuto.** Ogni claim su "risultati" o "resa migliorata" andrebbe verificato con dati reali prima di essere usato in un materiale commerciale definitivo.
- Drone e blockchain/NFT sono laboratori simulati, isolati da KPI e registri reali.

## 7. Confronto: marketing di promessa vs operatività reale (con fonti commit)

Approfondimento richiesto: la sezione 4bis parlava di "manuali riscritti", ma vale la pena mostrare *cosa* dicevano prima, con le fonti esatte. La cronologia è verificabile: la documentazione originale è stata scritta l'**11/01/2026** (commit `0c7e099`, *"SISTEMA DOCUMENTAZIONE MODULARE ORTOMIO COMPLETATO"*), poi corretta in una campagna concentrata il **25/04/2026** (commit di "truth alignment" T4/T6/T7 su moduli diversi lo stesso giorno) e infine riallineata il **17/07/2026** (`fdb0aa9`, "align canonical release candidate documentation"). Non una correzione isolata: un processo di governance ripetuto su più moduli.

### 7.1 Success stories — l'esempio più netto

**Prima (`0c7e099`, 11/01/2026) — `31-success-stories.md`:**
> *"Il Poggio Verde - Trasformazione Digitale Completa"* — azienda fittizia in Chianti, 12 ettari, "Marco e Giulia Rossi". Fatturato dichiarato +45% (da €180K a €261K), margini +60%, "tracciabilità blockchain" che porta il prezzo del pomodoro da €2,50 a €8/kg, "Predizioni AI" con +90% di accuratezza, una citazione diretta virgolettata attribuita a "Marco Rossi, Titolare". Nessuna di queste aziende, cifre o citazioni esiste nel prodotto o nei dati reali — è materiale interamente inventato, con nome, numeri e virgolettato come se fosse un caso reale.

**Dopo (attuale) — `31-success-stories.md`:**
> *"Questo capitolo non contiene success stories verificate. Il repository non fornisce evidenza sufficiente per pubblicare nomi di clienti, citazioni, premi, risultati economici o casi aziendali come fatti storici."* Segue una policy esplicita (consenso, fonte verificabile, metriche misurate, approvazione editoriale) prima che qualunque case study possa rientrare nel manuale, e un elenco di ciò che è stato respinto: *"testimonianze inventate o non verificabili; aziende nominate senza fonte; ROI e risultati percentuali presentati come reali senza dati; citazioni dirette non approvate."*

### 7.2 Certificazioni — da "automazione completa" a "non sostituisce un audit"

**Prima:** *"Automazione completa dei processi di compliance"*, GlobalG.A.P. con *"163 punti di controllo automatizzati"*, HACCP *"Azioni correttive procedure automatiche"*, certificazioni multiple presentate come funzionanti end-to-end.

**Dopo:** *"Stato: beta, non equivale a certificazione ufficiale... OrtoMio prepara evidenze e dossier: non dichiara conformità GlobalG.A.P., non sostituisce un audit e non emette certificati."*

### 7.3 Business Intelligence — da "suite enterprise" a "ibrido, in consolidamento"

**Prima:** *"Sistema completo di business intelligence... Analytics predittive, KPI automatici... ROI: Ritorno investimenti per tecnologia/processo... Benchmark settoriali."*

**Dopo:** *"Questo capitolo era scritto come se esistesse una suite enterprise di BI completamente chiusa... non esiste oggi una piattaforma BI unificata enterprise con tutte le metriche economiche, ESG e di capacity mostrate nel testo precedente... forecasting, what-if analysis, customer segmentation e data mining generalista non vanno presentati come funzionalità chiuse."*

### 7.4 Cosa significa per il documento commerciale e per la landing

Questo confronto non va usato per imbarazzare il lavoro passato — va usato per due cose concrete:

1. **Prova di governance reale**, non solo dichiarazione d'intenti: il prodotto ha un processo dimostrabile (con commit, date, autori) che trova e corregge marketing gonfiato nella propria documentazione ufficiale. Pochissimi prodotti possono mostrare questo con fonti verificabili.
2. **Guardrail per il lavoro di copy che stiamo facendo ora**: ogni claim nella landing/nel documento commerciale nuovo deve superare lo stesso test che ha bocciato "Il Poggio Verde" — nessun nome di azienda, nessuna cifra di risultato, nessuna citazione, a meno che non esista davvero nel prodotto o nei dati. Il rischio concreto è ripetere lo stesso errore in un canale diverso (landing invece che manuale).

**Come usarlo in pubblico (raccomandazione):** non riportare il testo integrale della fake success story nella landing pubblica — è materiale interno utile per il team, non un elemento di vendita. Nella landing, la sezione 4bis (già scritta) può citare *un* esempio breve (es. certificazioni) come prova di rigore, senza il dettaglio completo della vicenda "Il Poggio Verde", che resta più utile come documentazione interna/governance che come argomento di vendita diretto.

## 8. Stato della ricerca

**Completato (2026-08-15):** tutti i 35 manuali utente letti e incrociati col codice sorgente; API di integrazione verificate (assenti per scelta dichiarata, §3.13); chat AI globale verificata nel meccanismo reale (Gemini + crediti, §3.14); campagna "truth alignment" mappata per intero (21 commit T1-T16, §3.15 e §7); MASTERDOC §56-63 controllate — solo project management interno, nessun materiale commerciale aggiuntivo.

**Manuali generici/marketing senza sostanza verificabile nel codice — da NON usare come fonte tecnica per claim di prodotto:** `27-quick-start.md`, `29-interface-navigation.md`, `32-roadmap.md`, `33-support-contacts.md`, `30-use-cases.md`, `31-success-stories.md`. Utili solo come prova della cultura dell'onestà (sezione 4bis), non come fonte di funzionalità.

**Nota fuori-scope per questo documento:** durante la ricerca è emerso un tema di sicurezza (possibile esposizione di chiavi API lato client) — deliberatamente non trattato qui perché fuori perimetro per un documento commerciale. Va gestito separatamente prima di qualunque diffusione pubblica del prodotto.

**A questo punto la ricerca ha una copertura ragionevolmente completa** per sostenere sia questo documento sia la landing page: motore di priorità, pannello di trasparenza AI, orchestratore, rotazione, planning duale, tracciabilità pianta+certificazione, irrigazione previsionale, IoT, export/sicurezza dati, indice di Ravaz, registro attività, cultura dell'onestà con confronto prima/dopo, posizionamento su API/chat AI/piano commerciale unico. Le aree residue (git completo sistematico per modulo) hanno rendimento decrescente rispetto allo sforzo — da riprendere solo su richiesta specifica, non come prossimo passo di default.

**Prossimo passo naturale:** il documento ha ora abbastanza profondità per essere la base della landing page (che era la richiesta originale). Valutare con l'utente se procedere a (a) scrivere/aggiornare la landing con questo materiale, comprimendo per leggibilità, o (b) continuare lo scavo sulle aree residue elencate sopra.
