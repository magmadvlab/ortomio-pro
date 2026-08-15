# OrtoMio — Landing page: design del copy

- **Data:** 2026-08-15
- **Stato:** in revisione (bozza approvata come architettura, copy da validare)
- **Fonti:** [MASTERDOC.md](../../../MASTERDOC.md), [DOCUMENTO_COMMERCIALE_ORTOMIO_PRO_2026-08-01.md](../../DOCUMENTO_COMMERCIALE_ORTOMIO_PRO_2026-08-01.md), `public/logo.png`
- **Contesto tecnico:** oggi `app/page.tsx` non è una landing — è un redirect automatico verso `/app` (o verso `/auth/callback` se arrivano parametri Supabase). Questo documento specifica il copy; l'implementazione (dove va la landing, come convive col redirect) è nel piano che segue.

## Decisioni vincolanti (già approvate)

- **Prodotto:** OrtoMio (non MealDesk).
- **Formato output:** documento di copy (questo file) + mockup Artifact HTML.
- **Tono:** ambizioso ma onesto. Lo stato beta/NO-GO commerciale non va nascosto, va dichiarato con sicurezza (Pratfall Effect: ammettere un limite reale aumenta la credibilità).
- **Pubblico:** doppio — aziende agricole strutturate + tecnici/consulenti agronomici. Un solo hero, un solo CTA, con una sezione dedicata a metà pagina che parla a entrambi separatamente (architettura C).
- **CTA primaria:** "Prova la demo ora" → `/app`.
- **Logo/naming:** solo valutazione critica, nessuna proposta di rebrand.

## Principi di copy applicati (skill: copywriting, marketing-psychology)

- **Jobs to be Done**: non vendiamo "un software agronomico", vendiamo "sapere sempre perché è stato deciso un intervento".
- **Specificità > vaghezza**: niente "ottimizza", "innovativo", "rivoluzionario". Frasi concrete, verificabili nel prodotto reale.
- **Honest over sensational**: nessuna metrica inventata, nessun logo-cliente finto, nessuna promessa di risultati agronomici garantiti.
- **Contrast Effect**: la sezione "come funziona" mostra esplicitamente il prima (quaderni/fogli sparsi) e il dopo (memoria unica).
- **Authority Bias via onestà**: la sezione sullo stato beta non è una nota legale in fondo pagina, è una sezione a sé con lo stesso peso visivo delle altre — dichiarare i limiti rafforza la fiducia su tutto il resto.
- **Loss/Regret Aversion azzerata sul CTA finale**: "ambiente demo, dati fittizi, nessun impegno" toglie il rischio percepito nel cliccare.

---

## 0. Revisione — la leva differenziante (2026-08-15)

Prima bozza di questo documento vendeva "memoria operativa": onesto ma generico, indistinguibile da un qualsiasi software di gestione orto/campo. Rileggendo MASTERDOC §5-7 e §28/§51 in profondità emerge il vero differenziale, verificabile nel codice, non uno slogan:

- **Il punteggio è scomponibile, non un voto a scatola chiusa.** `agronomicPriorityService.ts` parte da un `baseScore` e aggiunge/sottrae in modo tracciabile: confidenza, copertura segnali P0, bonus fase critica, feedback misurato, lettura economica, contesto raffinato del sito, qualità della fonte del profilo. Un concorrente "consiglio AI generico" non mostra questa scomposizione — dà un numero e basta.
- **La confidenza è un numero (0.3–0.98), non un tono rassicurante.** Il sistema dichiara quanto è sicuro di sé, sempre, e la confidenza scende quando i segnali mancano o la fonte è un fallback generico (`fallback`: -3 punti; `plant_id`: +4 punti).
- **C'è un layer economico esplicito.** `agronomicEconomicPriorityService.ts` non si limita al "serve intervenire": stima costo dell'intervento, costo del ritardo, valore protetto e restituisce `intervene_now` / `next_cycle` / `monitor` con la logica visibile.
- **La maturità di ogni funzione è un dato di codice, non marketing.** `config/capabilities.ts` registra 31 capability con un campo `maturity` reale, mostrato nell'interfaccia stessa (`getCapabilityBadge()`): 15 stable senza badge, 14 beta con badge "Beta", 2 simulazione con badge esplicito. Nessuna capability beta viene promossa senza prova riproducibile — è una regola di prodotto confermata, non un'intenzione.

Questo diventa il nuovo asse portante della landing: **"non fidarti di noi, verifica il calcolo"** — molto più forte di "abbiamo una memoria unica", e categoricamente non replicabile da un'agenda agricola o da un chatbot AI generico.

## 1. Hero

**Headline (raccomandata):**
> Non un consiglio a scatola chiusa: un punteggio che puoi scomporre.

**Alternative:**
- A — *"Non un consiglio a scatola chiusa: un punteggio che puoi scomporre."* — differenziazione diretta dal meccanismo reale (score scomponibile), non dal beneficio generico.
- B — *"Ogni priorità arriva con il suo calcolo, la sua confidenza e il suo perché."* — più descrittiva, utile come sub-headline se A viene scelta come titolo.
- C — *"Ogni intervento in campo, con il perché scritto accanto."* — versione precedente, più calda ma più generica: conservata come opzione se si vuole un hero meno tecnico.

**Sub-headline:**
> Ogni priorità che OrtoMio propone porta con sé il calcolo che l'ha generata: confidenza numerica, segnali coperti e mancanti, convenienza economica. Non un'agenda in più, non un'AI che "sente" cosa fare: un motore che mostra il proprio ragionamento.

**CTA primaria:** `Prova la demo ora` (bottone, → `/app`)
**CTA secondaria (testuale, sotto al bottone):** `Ambiente demo con dati fittizi — nessuna registrazione richiesta` *(verificare in fase di implementazione se `/app` richiede login; se sì, riformulare come "Richiedi accesso alla demo")*

> **Annotazione:** ho evitato "assistente intelligente" e "AI" in prima battuta nell'headline: nel documento commerciale e nel MASTERDOC il posizionamento reale è "memoria operativa + priorità spiegabili", l'AI è un mezzo non il messaggio. Il payoff del logo ("il tuo assistente smart") resta nel lock-up del brand, ma l'hero deve vendere l'esito, non la tecnologia.

---

## 2. Barra di stato onesta (sotto l'hero, prima del fold)

> **Demo/beta pubblica.** Codice in produzione, dati di prova. Zero aziende reali finché non hai letto la sezione *"Maturità e uso corretto"* qui sotto.

Micro-link inline: `→ leggi lo stato reale`

> **Annotazione:** questa riga fa doppio lavoro — imposta aspettative corrette (evita utenti delusi/arrabbiati dopo il click) e, paradossalmente, aumenta la fiducia rispetto a una landing "troppo perfetta" per un prodotto che è onestamente ancora in beta.

---

## 3. Il problema

**Titolo sezione:** `Il campo genera più informazione di quanta ne riesci a trattenere`

**Corpo:**
> In molte aziende agricole le informazioni vivono in quaderni, fogli Excel, foto sul telefono, promemoria a voce e app meteo separate. Quando serve ricostruire *perché* è stato fatto un trattamento, o confrontare cosa era stato previsto con cosa è successo davvero, la risposta dipende da chi se lo ricorda meglio.

**Bullet (linguaggio cliente, non aziendale):**
- Non sai più perché un intervento è stato deciso tre settimane fa.
- Coordinare zone, filari, colture e operatori diversi resta a voce o su carta.
- Non distingui a colpo d'occhio un dato misurato da una stima o da un dato mancante.
- Confrontare previsione ed esito richiede di rimettere insieme fonti diverse.
- I registri esistono, ma nessuno li rilegge davvero.

> **Annotazione:** bullet riscritti in seconda persona e al presente (voice-of-customer), non "il problema è che le aziende non hanno X" ma "non sai più perché".

---

## 4. Come funziona (contrasto prima/dopo)

**Titolo sezione:** `Da osservazione a decisione, in un unico filo`

1. **Configuri il contesto reale** — garden, zone, filari, colture, suolo, esposizione, acqua.
2. **Il sistema costruisce priorità spiegabili** — combina meteo, storico e fattibilità in una coda di azioni con motivazione, non un punteggio a scatola chiusa.
3. **Approvi o pianifichi il task** — resta una decisione umana, il sistema propone e argomenta.
4. **L'esito aggiorna la memoria** — ogni lavorazione registrata rende più precisa la proposta successiva.

> **Annotazione:** step 3 è deliberatamente esplicito sul fatto che la decisione resta umana — coerente con MASTERDOC ("Il prodotto non sostituisce il responsabile agronomico") e disinnesca l'obiezione "un algoritmo decide al posto mio".

---

## 4bis. Il calcolo che puoi verificare (revisione 2 — pannello reale, non esempio inventato)

**Titolo sezione:** `Non "fidati di noi". Apri il pannello di trasparenza.`

**Corpo:**
> Ogni suggerimento AI di OrtoMio si può aprire in un pannello dedicato — Panoramica, Dati Usati, Calcoli, Alternative — che mostra esattamente cosa ha pesato nella decisione. Non è una demo isolata: è il componente `AITransparencyPanel` che accompagna ogni proposta AI nel prodotto vero.

**Cosa mostrano i 4 tab (reali, non ipotetici):**
- **Panoramica** — cosa propone il sistema e perché, in una frase.
- **Dati usati** — quali segnali ha letto (meteo, suolo, storico, feedback misurato) e quali mancavano.
- **Calcoli** — la scomposizione del punteggio: confidenza, copertura segnali, bonus fase critica, fonte del profilo, layer economico.
- **Alternative** — le altre opzioni valutate e perché sono state scartate.

**Esempio illustrativo di cosa si vede nel tab "Calcoli" (meccanismo reale, valori a scopo dimostrativo):

**Esempio illustrativo (etichettato come tale, meccanismo reale da MASTERDOC §6-7, valori a scopo dimostrativo):**

```
baseScore                         62
+ confidenza segnali disponibili  +9
+ copertura segnali P0            +6
+ bonus fase critica               +8
+ fonte profilo (plant_id)         +4
+ lettura economica (ROI alto)    →  soglia minima ~75
────────────────────────────────────
punteggio finale                   78/100
confidenza dichiarata              0.84
```

> Se i segnali mancano, o il profilo è generico (fallback), il punteggio non viene gonfiato: scende, e la confidenza dichiarata scende con lui. Il sistema non finge certezza che non ha.

**Tre prove concrete, non aggettivi:**
- **Confidenza numerica su ogni priorità** — 0.3-0.98, mai un generico "alta/media/bassa".
- **Layer economico separato dal layer agronomico** — due interventi possono essere entrambi corretti dal punto di vista agronomico, ma OrtoMio distingue `intervene_now`, `next_cycle`, `monitor` in base a costo del ritardo e valore protetto.
- **Qualità della fonte pesa sul punteggio** — una pianta riconosciuta con precisione (`plant_id`) pesa diversamente da una coltura dedotta per fallback generico. Nessuna raccomandazione generica finge la stessa precisione di una basata su dati reali.

> **Annotazione (aggiornata):** ancorare la sezione a un componente reale del prodotto (`AITransparencyPanel`, 4 tab) invece che a un esempio numerico inventato è molto più forte in demo: il commerciale può letteralmente aprire il pannello su un suggerimento vero davanti al cliente. È anche coerente con l'honesty-first del tono generale: la trasparenza del calcolo È il prodotto, non solo la sua giustificazione a parole.

---

## 4ter. Il motore che correla, non solo registra (revisione 2, dopo scavo nel codice)

**Contesto della revisione:** feedback diretto — "anche Excel tratta i dati, il problema è come li tratti". Vero: la 4bis mostrava un punteggio scomponibile, ma non ancora *cosa viene messo in relazione* per produrlo. Sono andato oltre MASTERDOC, nel codice sorgente reale (`services/directorService.ts`, `services/cropRotationService.ts`, `services/aiSuggestionsService.ts`, `components/director/DirectorBriefingWidget.tsx`).

**Titolo sezione:** `Excel contiene i dati. OrtoMio li mette in relazione.`

**Corpo:**
> `directorService.ts` non è una dashboard con più widget affiancati: è un orchestratore che importa ~20 motori distinti — irrigazione, fenologia, fase lunare, fotoperiodo, storico ambientale, salute piante, mappe di prescrizione, ledger decisionale, priorità economica — e ne fa un'unica lettura correlata, il briefing del giorno. Un foglio Excel può contenere ognuno di questi dati separatamente. Non può far scattare un avviso perché *la fase lunare, lo stress idrico e il pH sono fuori soglia nello stesso momento sulla stessa zona*.

**Prova concreta 1 — rotazione con motivazione botanica reale, non una regola "non ripetere":**

```
Coltura precedente:   Pomodoro (famiglia Solanaceae)
Da evitare:            Solanaceae (impoveriscono lo stesso suolo)
Consigliato:           Brassicaceae
Eccellente:            Leguminose
Motivazione:           "Le Solanacee depauperano il suolo.
                         Seguire con leguminose per ripristinare l'azoto."
```

> Questa logica (famiglia botanica → successori raccomandati → motivazione agronomica) vive in `cropRotationService.ts` per 8 famiglie botaniche complete. Non è un flag booleano "stessa coltura sì/no": è un ragionamento di rotazione che tiene conto di cosa impoverisce e cosa arricchisce il suolo.

**Prova concreta 2 — briefing come lettura unica, non somma di dati:**
> Il `DailyBriefing` di ogni mattina combina in un colpo d'occhio: azioni critiche prioritizzate, meteo sintetico, fase lunare, GDD (Growing Degree Days), ore di stress da caldo, indice di stress idrico, fotoperiodo — e le traduce in una coda di azioni con urgenza, impatto, costo e confidenza. Non dieci grafici da leggere: una decisione già correlata.

**Prova concreta 3 — l'AI è tipizzata e vincolata, non una chat che inventa:**
> Le proposte AI (`aiSuggestionsService.ts`) hanno un tipo esplicito — piano di semina, timing di raccolta, **piano di rotazione**, irrigazione, nutrizione — e restano sempre dentro il contratto spiegabile: punteggio → spiegazione → task → ledger → feedback. Nessuna proposta AI esiste fuori da questo percorso.

> **Annotazione:** questa sezione sostituisce/rinforza la 4bis come cuore della differenziazione. La 4bis mostrava *che* il punteggio è scomponibile; questa mostra *cosa viene correlato* per generarlo — è la risposta diretta a "sembra un software qualsiasi di gestione orto". Nell'implementazione finale, valutare se fondere 4bis e 4ter in un'unica sezione a due blocchi (calcolo + correlazione) per non appesantire la pagina con due sezioni molto simili in intento.

---

## 4quater. Revisione 3 — trasparenza reale + dualità di pianificazione (dopo scavo ulteriore)

**Contesto:** il feedback "rivedi il tutto, approfondisci anche uso di AI, planning tradizionale e planning AI" ha portato a due scoperte che cambiano la 4bis e aggiungono una sezione nuova:

1. **`components/ai/AITransparencyPanel.tsx` esiste davvero.** Non serve inventare un esempio numerico: il prodotto ha un pannello reale, apribile su qualunque suggerimento AI, con 4 tab — Panoramica, Dati Usati, Calcoli, Alternative. La 4bis va riscritta per mostrare *questo* pannello, non un esempio illustrativo generico — è più credibile perché è dimostrabile in demo dal vivo.
2. **Planning classico e planning AI sono due motori distinti e complementari**, non un solo "planner":
   - `classicPlannerService.ts` — deterministico, rule-based: punteggio di rotazione, motivazione botanica, warning, date ideali di semina.
   - `aiPlanningService.ts` — predittivo ed economico: scaglionamento (semine successive per raccolto continuo), overview con superficie/resa stimata/investimento/ricavo atteso/**ROI**, timeline di fasi con attività e costi, analisi del rischio tipizzata (meteo/mercato/malattie, ognuna con probabilità, impatto, mitigazione), calibrato su ettari, canale di mercato (fresco/trasformazione/export) e livello di esperienza dell'utente.
   - Entrambi confluiscono in `logic/annualPlannerEngine.ts`, che aggiunge un altro livello reale: date di semina corrette per altitudine e temperatura del suolo, compatibilità solare validata, e ottimizzazione automatica della rotazione su più annate (`rotationOptimizer.ts`) — un piano annuale unico, non due strumenti scollegati.
   - **Il ciclo si chiude davvero:** `buildMeasuredFeedbackOptimizations` confronta rese e costi *realmente registrati* con la media del piano e genera raccomandazioni adattive concrete ("riduci la superficie delle fasi deboli e concentra il prossimo ciclo nelle finestre che hanno reso di più"). Il piano non è statico: si corregge sull'esito reale.

**Decisione di struttura per l'implementazione:** la sezione 4bis va aggiornata per nominare esplicitamente il pannello di trasparenza reale (invece dell'esempio inventato). Va aggiunta una sezione **4quinquies "Due modi di pianificare, un solo piano"** dopo la 4ter, prima del doppio binario. Il documento aggiorna entrambe qui sotto.

---

## 4quinquies. Due modi di pianificare, un solo piano annuale

**Titolo sezione:** `Pianificazione classica e pianificazione AI, non in competizione`

**Corpo:**
> OrtoMio non ti obbliga a scegliere tra "faccio a modo mio" e "mi fido dell'AI". Sono due motori distinti che lavorano sullo stesso piano.

**Colonna 1 — Planner classico:**
> Regole deterministiche di rotazione: punteggio, motivazione botanica, avvisi, finestra di semina ideale. Prevedibile, verificabile riga per riga, nessuna sorpresa.

**Colonna 2 — Planner AI:**
> Scaglionamento delle semine per raccolto continuo, proiezione di investimento/ricavo/ROI, analisi del rischio (gelate tardive, oscillazioni di mercato, pressione fungina — ognuna con probabilità, impatto e mitigazione), calibrata su superficie, canale di vendita ed esperienza di chi pianifica.

**Riga di chiusura, sotto le due colonne:**
> I due piani confluiscono in un unico piano annuale, corretto per altitudine e temperatura del suolo. E non si ferma alla previsione: quando registri rese e costi reali, il sistema li confronta con il piano e propone correzioni concrete per il ciclo successivo — non un piano che si dimentica di sé stesso a fine stagione.

> **Annotazione:** questa sezione risponde direttamente al secondo giro di feedback ("planning tradizionale e planning AI"). È anche l'unico punto della pagina che mostra esplicitamente il ciclo di apprendimento dai dati reali (misurato → confronto col piano → correzione), che finora era solo implicito nella sezione "diario e memoria operativa" del documento commerciale originale.

---

## 4sexies. Dal seme al raccolto, pianta per pianta (revisione 4)

**Contesto:** terzo giro di domande — "come vengono trattati i dati", il calcolo previsionale dell'irrigazione, la storia per ogni singola piantina, il vivaio che traccia dal seme al raccolto. Materiale trovato in `advancedIrrigationService.ts`, `types/individualPlant.ts`, `seedlingService.ts` (MASTERDOC §38), `BioCertificationForm.tsx`.

**Titolo sezione:** `Dal seme al raccolto, una pianta alla volta`

**Corpo:**
> Ogni piantina ha un codice proprio (es. `F1-P001`), collegato al lotto del vivaio da cui arriva. Da lì in poi, ogni operazione — irrigazione, concimazione, trattamento, potatura — registra lo stato di salute prima e dopo, non solo "fatto". Il raccolto chiude il cerchio: quantità, qualità, destinazione, valore — per quella pianta specifica, non per la zona in generale.

**Pipeline reale (da `seedlingService.ts`):**
```
semina/acquisto → germinazione → nursing → hardening → pronto al trapianto
  → pianta individuale (codice, posizione, storia operazioni)
  → raccolto (quantità, qualità, destinazione)
```

**Perché conta, non solo per curiosità:** questa tracciabilità alimenta direttamente il punteggio di conformità per la certificazione biologica (`BioCertificationForm.tsx`) — 7 punti su "sistema di tracciabilità", 7 su "separazione bio/convenzionale", 6 su "registri di produzione". Non è un accessorio: è infrastruttura per la certificazione.

**Calcolo previsionale irrigazione — versione corretta (sostituisce l'esempio semplificato in sezione 8):**
> Il calcolatore rapido (portata gocciolatore × numero, ecc.) è solo il livello base. Il livello previsionale reale (`advancedIrrigationService.ts`) usa il metodo **Penman-Monteith**: evapotranspirazione di riferimento (ET0) × coefficiente colturale per fase fenologica (Kc) = fabbisogno colturale (ETc), meno la pioggia efficace, corretto per pendenza ed esposizione del sito, bilancio idrico del suolo, qualità dell'acqua (aggiustamento per lisciviazione), efficienza dell'impianto (85% di default) — con un fattore di correzione AI e un livello di confidenza dichiarato, aggiornati dal confronto con l'irrigazione realmente eseguita.

> **Annotazione:** questa sezione risponde punto per punto al terzo giro di feedback. Va posizionata dopo "due modi di pianificare" e prima del doppio binario — chiude idealmente il blocco "differenziazione tecnica" prima di passare ai due pubblici. In implementazione, valutare se comprimere in due sotto-blocchi (tracciabilità pianta + irrigazione previsionale) dentro una sola sezione per bilanciare la lunghezza complessiva della pagina, che a questo punto ha 4-5 sezioni dedicate al meccanismo tecnico.

---

## 5. Per chi lavora il campo / Per chi segue più aziende (doppio binario)

**Titolo sezione:** `Pensato per chi decide sul campo, tutti i giorni`

**Colonna 1 — Aziende agricole**
> **Coordini zone, filari e operatori senza rincorrerli.**
> Ogni zona ha la sua storia: colture, trattamenti, irrigazioni, esiti. Chi lavora in campo trova il contesto già pronto, chi coordina vede tutto in un unico posto.

**Colonna 2 — Tecnici e consulenti agronomici**
> **Segui più aziende con dati che si possono confrontare.**
> Stessa struttura, stessi criteri, stessa provenienza del dato per ogni cliente che segui. Meno tempo a ricostruire il contesto a ogni visita, più tempo a decidere con il cliente.

---

## 6. Benefici concreti

**Titolo sezione:** `Cosa cambia davvero`

- Una sola memoria per attività, osservazioni e risultati — non più tra quaderno, Excel e WhatsApp.
- Sai sempre chi ha deciso, chi ha eseguito, chi ha verificato.
- Il sistema distingue in modo esplicito dato misurato, stimato, assente o simulato — mai un numero inventato spacciato per misura.
- Meno dipendenza dalla memoria di una singola persona in azienda.
- Una base dati reale per confrontare previsione ed esito, non solo sensazioni.

> **Annotazione:** ultimo bullet della lista benefici del documento commerciale ("distinzione dato misurato/stimato/simulato") promosso in cima perché è il claim di onestà tecnica più forte e differenziante — pochi competitor lo dichiarano esplicitamente.

---

## 7. Precision farming (con disclosure)

**Titolo sezione:** `NDVI e mappe di prescrizione, quando i dati ci sono`

> Per frutteti, oliveti e vigneti, OrtoMio integra dati satellitari e mappe di prescrizione con provenienza tracciata e controlli di qualità. Sono funzioni **in fase di validazione**: dipendono dal provider collegato e dalla qualità del dato disponibile, e vanno sempre lette insieme al giudizio di chi conosce il campo.

> **Annotazione:** disclosure incorporata nel corpo del testo, non in una nota a parte — evita sia l'overclaim sia l'effetto "piccola scritta illeggibile in fondo" che mina la fiducia quando scoperta dopo.

---

## 8. Maturità e uso corretto (sezione dedicata, stesso peso delle altre)

**Titolo sezione:** `Dove siamo davvero — funzione per funzione, non a parole`

> La maturità di OrtoMio non è un'affermazione di marketing: è un campo nel codice (`config/capabilities.ts`), letto e mostrato dall'interfaccia stessa. Oggi, delle 31 capability registrate:

**Numeri reali (verificati nel codice, MASTERDOC §28):**
- **15 stabili** — nessun badge, uso pieno.
- **14 in beta** — badge "Beta" visibile in app: centro operativo, planner AI, diario, irrigazione, nutrizione e trattamenti, certificazioni, NDVI satellitare, prescription maps e altre. Beta qui significa *funzionalmente completo e testato in locale, ma senza le prove richieste in produzione* (RLS su più aziende reali, pilot con cliente vero, contract test sul provider esterno) — non "rotto" o "incompleto".
- **2 in simulazione** — drone e blockchain/NFT: laboratori isolati, mai promossi finché non c'è hardware o provider reale collegato.

> Nessuna capability beta viene promossa a stabile finché la sua prova specifica non è chiusa con evidenza riproducibile. Oggi è corretto usare OrtoMio con un'azienda fittizia, utenti di prova e dati approssimativi: serve a mostrare il prodotto, verificare i flussi, trovare bug — non a sostituire un pilot agronomico reale.
>
> Non sostituiamo il responsabile agronomico. Non garantiamo certificazioni ufficiali.

**Micro-CTA interna:** `Vuoi un pilot reale sulla tua azienda? Parliamone` *(mailto o form da definire in implementazione)*

> **Annotazione:** questa versione sostituisce l'onestà generica ("siamo in beta") con l'onestà specifica e verificabile (15/14/2, fonte nel codice). È molto più credibile perché è falsificabile — chi entra in demo può letteralmente vedere i badge sulle funzioni beta e contarli. Rinforza anche l'asse "verifica, non fidarti" impostato nella sezione 4bis.

---

## 9. CTA finale

**Titolo sezione:** `Prova a portare un tuo caso reale nella demo`

> Configura un garden, aggiungi una coltura, guarda come il sistema costruisce una priorità e spiega perché. Dati fittizi, nessun impegno, puoi ricominciare da capo quando vuoi.

**CTA:** `Prova la demo ora` (stesso bottone dell'hero, per coerenza — Mere Exposure/consistenza)

---

## 10. Valutazione logo e naming (solo revisione, nessuna proposta di rebrand)

**Naming — "OrtoMio":**
- Punto di forza: nome caldo, personale ("il mio orto"), coerente con un prodotto che parla anche a piccole realtà, non solo enterprise agricolo.
- Frizione potenziale: il posizionamento reale (aziende agricole strutturate, tecnici, precision farming, NDVI) è più B2B/professionale di quanto "OrtoMio" suggerisca da solo — il nome suona più hobbistico del prodotto.
- **Non propongo un cambio nome.** È un asset già investito (dominio, logo, codice). Suggerisco invece che il payoff/sottotitolo nella landing faccia il lavoro che il nome da solo non fa: non "il tuo assistente smart" in hero, ma un payoff più esplicito sul B2B agronomico (es. "la memoria operativa della tua azienda agricola" come sottotitolo del logo in header, tenendo "il tuo assistente smart" solo nel lock-up ufficiale/favicon).

**Logo:**
- Concept (foglia/cervello a circuito) comunica bene "agricoltura + intelligenza artificiale" in un solo simbolo — buona sintesi visiva, riconoscibile anche piccolo grazie al contorno netto della foglia.
- Problema di leggibilità: i dettagli del circuito nell'emisfero destro (nodi, linee sottili) si perdono sotto ~40px (favicon, header mobile) — a quella scala resta leggibile solo la foglia intera, il "cervello" sparisce.
- Contrasto: il verde petrolio (`#1b7a6b` circa) del circuito su sfondo bianco funziona; va verificato su sfondo scuro (se la landing usa una hero scura, serve una variante logo a contrasto invertito).
- **Micro-ritocco suggerito, non un redesign:** produrre una versione "solo foglia" (senza dettaglio circuito) come favicon/icona piccola, e riservare il logo completo a header desktop e materiali dove è leggibile a piena dimensione.

---

## Prossimo passo

Documento di copy da validare (questa sezione). Dopo l'approvazione:
1. Mockup Artifact HTML con questo copy impaginato.
2. Revisione con skill `impeccable` sul mockup (gerarchia visiva, contrasto, spaziatura, responsive).
3. Piano di implementazione per portare il copy validato in `app/page.tsx` (routing landing vs redirect auth, componenti, sezione stato beta).
