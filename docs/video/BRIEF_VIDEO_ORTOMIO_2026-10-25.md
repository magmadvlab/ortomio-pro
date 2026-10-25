# Brief video OrtoMio — primo video «Cos'è OrtoMio»

**Data di apertura:** 25 ottobre 2026. **Stato:** APERTO, fase 1–2 (diagnosi e brainstorming sui contenuti).
**Metodo:** `/Volumes/990P/mealdesk/docs/video/HANDOFF_METODO_VIDEO_ORTOMIO_2026-10-25.md`. Modello di forma: brief MealDesk (`/Volumes/990P/mealdesk/docs/video/BRIEF_VIDEO_SERIE_MEALDESK_2026-10-25.md`).
**Regola:** prima i contenuti, poi lo stile. Nessun set, render, voce o clip prima che la scaletta sia approvata.

Fonti usate (tutte nella repo, non dalla memoria): `PRODUCT.md`, `README.md`, `MASTERDOC.md` §0–§1 e §27–§28, `docs/gtm/00`–`05`, `docs/superpowers/specs/2026-08-15-ortomio-landing-copy-design.md`, `docs/superpowers/specs/2026-08-19-landing-concept-orchestratore.md`, `components/landing/content.ts`.

---

## 1. Correzione al hand-off

Il hand-off ipotizzava un pubblico «probabilmente consumatore». **Non è così.** `PRODUCT.md` e `docs/gtm/02_BUYER_PERSONAS.md` confermano un prodotto B2B per:
- aziende agricole strutturate (più ettari, più colture, più operatori);
- tecnici e consulenti agronomici che seguono più aziende.

Gli hobbisti dell'orto sono esplicitamente **esclusi** dall'ICP (`04_STRATEGIA_GTM.md` §2). Il nome «Orto Mio» suona domestico, il prodotto no: questo scarto è il primo problema di comunicazione del video (§2.2, punto 1).

Repository canonico: `/Volumes/990P/ortomio-main` (`MASTERDOC.md`, intestazione). `ortomio_free` e `ortomio_free_capacitor` sono versioni ferme a gennaio 2026.

---

## 2. Diagnosi

### 2.1 Che cos'è, in una riga
OrtoMio collega anagrafiche, attività, osservazioni, motori decisionali e registri operativi per orti, campi, frutteti, oliveti e vigneti. Ogni mattina propone le cose da fare con il loro perché, e ricorda che cosa è stato deciso, fatto e ottenuto (`PRODUCT.md`, Product Purpose; `MASTERDOC.md` §1).

### 2.2 Perché è difficile da spiegare in video
1. **Il nome tira verso l'hobby.** «Orto Mio» evoca l'orto di casa; il pubblico è un'azienda con filari, operai e un tecnico. Le prime immagini devono dire «azienda agricola» prima che il nome dica «orto».
2. **Il valore è un ragionamento, non una cosa.** Il differenziale (punteggio scomponibile, confidenza dichiarata, dato misurato contro stimato) è invisibile in una ripresa di campo. Va mostrato sullo schermo del prodotto o in motion graphic.
3. **Due pubblici con paure diverse.** Il titolare teme di perdere memoria e controllo; il tecnico teme di essere scavalcato da «l'app che decide» (`02_BUYER_PERSONAS.md`).
4. **Il settore è saturo di promesse.** Risparmi idrici in percentuale, «agricoltura 4.0», droni. OrtoMio non può usare nessuna di queste leve (`03_MATRICE_CLAIM.md`, categoria N).
5. **Mancano le prove sociali.** Nessun pilot reale, nessun cliente, nessuna testimonianza, nessuna metrica di risultato, nessun prezzo.
6. **Il prodotto è ampio.** Irrigazione Penman-Monteith, Ravaz, Jaén, mosca olearia, rotazioni, GDD, NDVI, certificazioni. La tentazione è l'elenco; il metodo chiede pochi momenti.

### 2.3 Che cosa esiste già
- Posizionamento confermato (`PRODUCT.md`): distinzione esplicita fra dato misurato, stimato, assente e simulato; priorità spiegabili; decisione sempre umana.
- Copy della landing live (`components/landing/content.ts`): eyebrow «L'orchestratore agronomico per aziende e consulenti»; sezioni per orticole, vigneto, oliveto, frutteto, vivaio.
- Concept «orchestratore» del 19/08: il ciclo **registra → analizza → punteggia → propone → verifica**; titolo «Ogni mattina una coda di azioni motivate: cosa fare, perché, quanto costa aspettare.»
- Buyer personas con angoli di messaggio: «sa sempre perché un intervento è stato deciso» (titolare); «porta il ragionamento, non solo i dati» (tecnico); «indici veri e dossier che si costruiscono da soli» (gestore specializzato).
- Matrice claim (V/I/N) e principi vincolanti GTM.
- CTA unico: «Prenota la tua prova guidata», form verificato end-to-end.
- Schermate reali: galleria prodotto nella landing (da verificare se adatte o se rifare con dati demo puliti).

### 2.4 Che cosa manca
- Nessun video OrtoMio prodotto.
- Nessuna presenza social verificata (`05_PIANO_MATERIALI.md` §1: profilo LinkedIn aziendale da accertare).
- ~~Privacy policy e termini assenti dalla landing~~ **Superato (verifica 25/10):** PR #165 (`0dcd9769`) collega Privacy e Termini nel footer e aggiunge consenso obbligatorio al form. Le pagine sono online ma incomplete (campi «[da inserire]», contatto Gmail provvisorio): vedi §10.

---

## 3. Vincoli di verità

Fonte: `docs/gtm/00_PRINCIPI_VINCOLANTI.md`, `docs/gtm/03_MATRICE_CLAIM.md`, `PRODUCT.md`.

**Non si può dire**
- Percentuali di risparmio, rese migliorate, ROI osservato, «fino al 50% d'acqua» (claim di Agricolus, non nostro).
- Testimonianze, loghi, «usato da N aziende», casi studio.
- «Certificazione bio / GlobalG.A.P. automatica»: il prodotto organizza evidenze e dossier, la certificazione resta dell'ente.
- Drone, blockchain, NFT: laboratori simulati.
- Predizioni AI come funzione attiva: disattivate nella release candidate.
- API pubbliche, import da Excel, app nativa, telematica macchine (John Deere, Case IH).
- Prezzi, uptime, SLA, scala.
- «L'AI decide», «rischio zero», «elimina gli errori».

**Si può dire, con misura (claim V)**
- Ogni priorità mostra il calcolo: pesi, segnali mancanti, qualità della fonte (pannello di trasparenza a 4 tab).
- La confidenza è un numero e scende quando mancano i segnali.
- Un layer economico confronta intervenire ora, al ciclo successivo o monitorare.
- Il briefing del mattino correla molti motori in una lettura unica. **Non dire un numero:** la matrice claim dice «circa 20», il masterdoc §5 elenca circa 16 servizi importati dal Director.
- Rotazione su 8 famiglie botaniche con motivazione esplicita.
- Irrigazione previsionale Penman-Monteith corretta dall'irrigazione reale.
- Indice di Ravaz, indice di Jaén, monitoraggio mosca olearia con trappole e soglie.
- Tracciabilità pianta per pianta (codice individuale, lotto vivaio, raccolto).
- Il piano si corregge sui raccolti realmente registrati.
- Organizzazioni con ruoli e inviti (multi-azienda per il tecnico).

**Regola MealDesk riusata:** una funzione si racconta anche se è opzionale o richiede configurazione; frenano solo le promesse di risultato.

**Stato di rilascio:** demo/beta con azienda fittizia, nessun pilot reale concluso (`PRODUCT.md`, Operating Context). Il video non può dire «disponibile» né «già in uso». Può invitare alla prova guidata.

**Tono (ipotesi):** concreto, sobrio, da campo. Rispetto per il mestiere di chi guarda. La tecnologia è un mezzo, non il messaggio (annotazione della landing §1).

---

## 4. Chi deve capire che cos'è OrtoMio

| Pubblico | Che cosa teme | Che cosa deve pensare alla fine | Dove lo incontriamo |
|---|---|---|---|
| **Titolare di azienda strutturata** | Che tutto dipenda dalla sua testa; non saper ricostruire perché si è fatto un trattamento; consigli «a scatola chiusa» | «Finalmente un posto dove la decisione nasce, si esegue e lascia traccia. E decido io.» | LinkedIn, Facebook di settore, fiere, passaparola, tecnico di fiducia |
| **Tecnico / consulente agronomico** | Essere scavalcato da «l'app che decide»; clienti che registrano ognuno a modo suo; non poter mostrare che cosa aveva previsto | «Mi rende difendibile il consiglio, azienda per azienda.» | LinkedIn, ordini e collegi professionali, convegni |
| **Gestore specializzato** (vigneto, oliveto, frutteto) | Strumenti generici che non conoscono Ravaz o la mosca; dossier rifatto a mano ogni anno | «Conosce il mio mestiere e il dossier si costruisce lavorando.» | Consorzi, associazioni di prodotto |
| Hobbista dell'orto | — | **Fuori pubblico** (ICP esclude) | — |

---

## 5. Messaggio centrale (candidati, da discutere)

1. **Meccanismo:** «Ogni mattina ti dice che cosa fare in campo, e perché.»
2. **Memoria:** «Saprai sempre perché un intervento è stato deciso.» (angolo persona 1)
3. **Onestà del dato:** «Un dato stimato non si finge una misura.» (posizionamento)
4. **Categoria (chiusura fissa):** «L'orchestratore agronomico.» oppure la versione della landing «L'orchestratore agronomico per aziende e consulenti».

Prima lettura del tavolo: **1 come motore**, **2 come beneficio**, **4 come chiusura**. La 3 è il cuore tecnico: entra come una frase sola, non come tesi del video.

---

## 6. Brainstorming sui contenuti (in corso, 25/10)

### 6.1 Schema dei contenuti applicato a OrtoMio (proposta del tavolo, da verificare con l'utente)

| # | Passaggio dello schema | Proposta per OrtoMio | Su che cosa si regge |
|---|---|---|---|
| 1 | Momento vero | Mattina presto, prima di uscire in campo. Quaderno, foto sul telefono, messaggi, meteo su un'altra app. «Oggi da dove comincio?» | Persona 1, frustrazioni; landing §3 |
| 2 | Domanda che gira il problema | «E se ogni intervento arrivasse con il suo perché scritto accanto?» | Landing §1, alternativa C |
| 3 | Che cos'è, in una frase | «OrtoMio mette in fila il lavoro del giorno e ti spiega ogni scelta.» | Concept orchestratore |
| 4 | Pochi momenti in cui la vita cambia | **Mattina:** il briefing e la coda di azioni. **In campo:** il task, la registrazione, la pianta con il suo codice. **Fine stagione / audit:** la memoria, previsione contro esito, il dossier | MASTERDOC §1, §5, §14; landing §4 |
| 5 | Il ruolo resta intatto | «La decisione resta tua.» Per il tecnico: «Tu consigli come sempre; ora il tuo ragionamento resta scritto.» | PRODUCT.md, Product Principles |
| 6 | I limiti dentro la frase | «Con i dati che hai, e ti dice quali mancano.» | Claim V sulla confidenza |
| 7 | Chiusura di categoria | «OrtoMio. L'orchestratore agronomico.» | Eyebrow della landing |

### 6.2 Materiale di contenuto già pronto (verificato)
- **Frasi già approvate in landing:** «Un valore stimato non si finge una misura»; «anche non intervenire è una scelta con un prezzo»; «Il campo risponde. Il sistema prende nota.»; «più usi OrtoMio, più le proposte assomigliano al tuo campo, e non a una media».
- **Una scena dimostrabile:** la rotazione dopo il pomodoro (Solanacee → leguminose, «per ripristinare l'azoto»). È concreta, agronomica, e chiunque del settore la riconosce.
- **Un oggetto da mostrare:** il pannello di trasparenza con i suoi quattro tab. Nomi live in landing: «Cosa propone / Su cosa si basa / Perché viene prima / Alternative» (verificare i nomi nell'app prima di rifare la schermata).
- **Indici del mestiere:** Ravaz per la vite, Jaén e trappole per l'olivo. Utili per i video brevi per coltura.

### 6.3 Domande di fondo ancora senza risposta
1. **Il momento vero:** la mattina («da dove comincio?») o la domanda a posteriori («perché abbiamo trattato quella zona tre settimane fa?»)?
2. **Chi guarda il primo video:** il titolare o il tecnico?
3. **Coltura protagonista:** generica (campo aperto), oppure una coltura riconoscibile (vigneto, oliveto)? Il vigneto rende bene in immagine e ha indici veri; le orticole sono più vicine al nome.
4. **Quanto «dentro il calcolo»:** il pannello di trasparenza è il differenziale, ma è il punto più tecnico. Una pausa centrale nel primo video, o un secondo video a sé?
5. **Il concetto dell'utente:** per MealDesk erano i tre momenti reception, ospite, cucina. Qual è il tuo per OrtoMio?

---

## 7. Decisioni aperte (numerate)

1. **Pubblico del primo video:** titolare, tecnico, o entrambi con un solo video?
2. **Momento d'apertura** (§6.3, punto 1).
3. **Coltura protagonista** (§6.3, punto 3).
4. **Scaletta:** conferma o modifica dello schema §6.1.
5. **Frase di chiusura:** «L'orchestratore agronomico» o altra.
6. **Titolo della landing live:** «Il cervello agronomico della tua azienda. Dalla decisione al raccolto, zero improvvisazione.» «Zero» è il tipo di assoluto che su MealDesk è stato escluso. Il video lo riprende, lo evita o lo sostituisce?
7. **Ordine rispetto al piano GTM:** `05_PIANO_MATERIALI.md` mette il «video demo walkthrough 3'» in P3, dopo almeno 3 demo reali. Il video «Cos'è OrtoMio» è un materiale diverso (consapevolezza, non walkthrough), ma va confermato che si produce adesso.
8. **Pubblicazione e CTA:** il video porta alla prova guidata? Il blocco GDPR è superato (#165). Restano da scegliere la dicitura (live: «Metti alla prova il tuo campo» / bottone form «Prenota la prova guidata») e se pubblicare prima di completare privacy e termini (§10). CTA unica e identica nei due video (`PRODUCT.md`: un messaggio, una CTA).
9. **Durata:** riferimento MealDesk 91 s. Da confermare dopo la scaletta.
10. **Lingua:** italiano (ipotesi).

Stile, voce, musica e riprese: **non si aprono** finché le decisioni 1–5 non sono chiuse.

---

## 10. Verifica approfondita (25/10)

Fonti: `MASTERDOC.md` completo, `docs/manual/`, `config/capabilities.ts`, `docs/gtm/00`–`05`, specs landing, `components/landing/` (incluse `sections/`), sito live ortomioapp.it (home, form, `/privacy`, `/terms`).

### 10.1 Maturità delle funzioni che il video vuole mostrare

| Scena | Funzione | Stato (`config/capabilities.ts`) | Come si racconta |
|---|---|---|---|
| Coda del mattino | Centro operativo `/app/farm` | **Beta** (badge visibile) | Si mostra; non si dice «collaudato» né «in uso» |
| Pannello di trasparenza | Spiegazione decisionale | Parte del Centro operativo, **Beta** | Si mostra; è il differenziale |
| Task → diario | Diario operativo `/app/diary` | **Beta** | Si mostra |
| Pianta con codice e storico | Piante `/app/plants` | Stable | Si mostra |
| Vigneto: Filari, Ravaz | `/app/vineyard` | Stable | Si mostra |
| Oliveto: Jaén, mosca | `/app/olives` | Stable; persistenza reale dal 30/07 (PR #157, migrazione applicata secondo memoria 31/07, da ricontrollare) | Si mostra |
| Rotazione dopo il pomodoro | `CropRotationPlanner.tsx` | Planner AI **Beta** | Si mostra |
| Irrigazione con confidenza | `/app/irrigation` | **Beta**; pianificazione automatica **disattivata** | Calcolo sì, automatismo no |
| Predizioni AI | — | **Disattivate** | Non si mostrano |
| Analisi da foto | Plant intelligence | **Beta** | Meglio evitare nel primo video |
| Consulenze agronomo | `agronomistService` | Parziale, non marketplace | **Fuori** dal video del tecnico |
| Confronto fra aziende clienti | — | Nessuna vista trovata | **Non promettere**; si può dire «organizzazioni, ruoli, inviti» |
| Drone, blockchain | — | Simulazione | Mai |

### 10.2 Stato di rilascio
- Go/no-go del 26/07: **NO-GO** (`M16_GO_NO_GO_2026-07-26.md`). `deployReady=false`. Nessun pilot reale; azienda fittizia per demo.
- Conseguenza invariata: niente «disponibile», «in uso», «già scelto da». Sì alla prova guidata.

### 10.3 Sito live: frasi da NON riprendere nel video
Il sito live contiene assoluti e un'affermazione falsa sullo stato del prodotto. Il video non li riprende.

- **Grave:** «Queste schermate arrivano da un'azienda che usa OrtoMio ogni giorno» (`components/landing/sections/ProductGallery.tsx` o vicino). È una testimonianza implicita; oggi esiste solo un'azienda fittizia.
- **Assoluti:** «zero improvvisazione» (H1, `content.ts:10`); «Margine di errore azzerato»; «Zero stime al buio»; «Tracciabilità totale»; «Elimina lo stress da burocrazia»; «con la certezza dell'affidabilità di ogni fonte»; «Mappatura chirurgica»; «Base agronomica certificata»; «certezza dei dati» (footer).
- **Promesse oltre lo stato:** «evitando sprechi di acqua, concimi»; «l'AI calcola l'impatto dei rischi climatici e delle malattie» (predizioni disattivate, lo dicono anche i termini, punto 4); «Basta una foto… l'AI valuta salute, vigore e stadio fenologico» (beta).
- **Numero da galleria:** «ROI stimato di 1043 euro» (alt di un'immagine). Se la schermata entra nel video, va rifatta con dati demo puliti, senza ROI in evidenza.

Fuori dal perimetro del video ma da segnalare: privacy e termini hanno campi «[da inserire]» (sede, P.IVA, regione cloud, conservazione, prezzo), contatto Gmail personale provvisorio, link «Torna alla registrazione», titolo «OrtoMio Agricoltura». Nella root della repo ci sono file vuoti `Privacy`, `Impostazioni`, `Cancella`.

### 10.4 Materiale utile confermato
- **Frasi per la voce** (già approvate): «Un valore stimato non si finge una misura.» · «Anche non intervenire è una scelta con un prezzo.» · «Il campo risponde. Il sistema prende nota.» · «Più usi OrtoMio, più le proposte assomigliano al tuo campo, e non a una media.» · «Ogni mattina una coda di azioni motivate: cosa fare, perché, quanto costa aspettare.» · «La decisione resta tua.» · Titolo della pagina live: «Decisioni agronomiche verificabili».
- **Binari dei pubblici in landing:** titolare «Una regia unica per tutta la squadra»; tecnico «Valorizza ogni visita sul campo».
- **UVP** (`01` §4): «OrtoMio è il registro che ragiona… La decisione resta tua.»
- **Brand:** verde petrolio ~`#1b7a6b` (scale `ortomio-green`, `ortomio-earth`, accenti `ortomio-harvest`, `ortomio-paper`); font di sistema, nessun font di brand; prima schermata scura con titolo bianco; etichette dorate «§ 0X». Foto vere (serra di pomodori, filari). Nessun cartoon.
- **Riferimento per il motion:** la console della prima schermata «BRIEFING 06:12 · GDD 428 · SEGNALI 14/21 · FASE fioritura» e il reticolo NDVI animato.
- **Concorrenti** (`01`): xFarm («oltre 170.000 agricoltori», AI su WhatsApp), Agricolus («fino al 50%» d'acqua), HORTA (DSS di filiera), AgriVerse, AGRIVI, ISAGRI, Image Line, TeamSystem. Il concorrente vero è lo status quo: quaderno, Excel, WhatsApp. Differenziale: spiegabilità, previsione contro esito, memoria unica.

### 10.5 Vincoli nuovi per la produzione
1. **Un messaggio, una CTA** (`PRODUCT.md`): i due video cambiano apertura e frase sul ruolo, ma chiudono con la stessa categoria e la stessa CTA.
2. **Personas ancora ipotesi:** nessun colloquio fatto (`02`). Le paure usate nei video vanno scritte come situazioni, non come dati.
3. **Censire i video in `05_PIANO_MATERIALI.md`** (regola §3.2 del GTM): sono materiali di consapevolezza, diversi dal walkthrough P3.
4. **Schermate:** rifatte con dati demo puliti, mai riprese dalla galleria live così come sono.

---

## 11. Scaletta video 1 — Titolare (v1, **approvata 25/10**)

Durata obiettivo: 85–90 s, circa 190–210 parole parlate. Azienda demo: orticole in pieno campo e un vigneto. Testo parlato in corsivo; le parole fra virgolette sono testo a schermo.

| # | Tempo | Passaggio | Immagine | Voce |
|---|---|---|---|---|
| 1 | 0–12 s | Momento vero | Alba, cortile dell'azienda. Mani che sfogliano un quaderno, il telefono pieno di foto e messaggi, il meteo su un'altra app. | *Sono le sei. Il quaderno da una parte, le foto sul telefono, i messaggi della squadra, il meteo su un'altra app. E la domanda di ogni mattina: oggi da dove comincio?* |
| 2 | 12–20 s | La domanda | Lo sguardo verso i filari e le file di ortaggi. | *E se ogni intervento arrivasse con il suo perché scritto accanto?* |
| 3 | 20–30 s | Che cos'è | Logo, poi il telefono che si accende sul briefing. «Il cervello agronomico della tua azienda.» | *OrtoMio è il cervello agronomico della tua azienda: mette in fila il lavoro del giorno e ti spiega ogni scelta.* |
| 4a | 30–45 s | Momento 1: la mattina | La coda di azioni animata: irrigare il pomodoro, controllare il vigneto, rimandare una concimazione. Punteggio e confidenza. | *Ogni mattina una coda di azioni motivate: cosa fare, perché, quanto costa aspettare. Anche non intervenire è una scelta con un prezzo.* |
| 4b | 45–58 s | Momento 2: in campo | Un operaio fra i filari apre il task e lo segna come fatto. Il diario si aggiorna. | *In campo, la squadra vede che cosa fare e dove. Fatto, registrato. Il campo risponde, il sistema prende nota.* |
| 4c | 58–72 s | Momento 3: fine stagione | Il titolare in ufficio, il diario della stagione, previsione contro esito, la rotazione dopo il pomodoro. | *A fine stagione ritrovi tutto: che cosa è stato deciso, perché, e com'è andata. E più lo usi, più le proposte assomigliano al tuo campo, non a una media.* |
| 5 | 72–80 s | Il ruolo resta | Il titolare guarda il pannello del perché e conferma. | *Con i dati che hai, e ti dice quali mancano. La decisione resta tua.* |
| 6 | 80–90 s | Chiusura | Campo al tramonto, logo, sito. «Dalla decisione al raccolto, zero improvvisazione.» CTA. | *OrtoMio. Decisioni agronomiche verificabili. Dalla decisione al raccolto, zero improvvisazione.* — «Prenota la prova guidata · ortomioapp.it» |

Punti da confermare:
1. La frase sul ruolo per il titolare: «La decisione resta tua.»
2. La CTA a schermo: «Prenota la prova guidata · ortomioapp.it».
3. Il momento 3 tiene insieme memoria e rotazione: se il ritmo è troppo denso, la rotazione passa a un video breve.

---

## 12. Ricerca sullo stile (fase 3, 25/10)

Sette video ufficiali, osservati fotogramma per fotogramma; le quote sono stime a occhio. HORTA, Cropwise, Trimble, Farmers Edge e Image Line non trovati (YouTube ha bloccato le richieste automatiche).

| Video | Durata | Schermate | Riprese vere | Motion | Voce |
|---|---|---|---|---|---|
| [xFarm, «Benvenuto in xFarm»](https://youtu.be/mc3VPr5BfjU) | 89 s | ~55% | ~10% | ~35% | No, testo e musica |
| [AGRIVI, Farm Management Software](https://youtu.be/aAIH6yLgI68) | 46 s | ~55% | ~20% | ~25% | Sì |
| [John Deere, Operations Center](https://youtu.be/cfC27F1T-Ow) | 68 s | ~30% | ~55% | ~15% | Testo a schermo |
| [John Deere Italia, Operations Center](https://youtu.be/aPGfyXY30KY) | 110 s | ~35% | ~55% | ~10% | Sì, agricoltori intervistati |
| [Agricolus, Farmtopia](https://youtu.be/lLJnAjttyfc) | 85 s | 0% | ~20% | ~80% | No |
| [AGRIVI, «Changing the Way Food is Produced»](https://youtu.be/Nvq01lvGF1Q) | 172 s | ~10% | ~80% | ~10% | Sì |
| [FieldView Advisor, «A Day in the Life»](https://youtu.be/t41rad7w4Co) | 213 s | ~12% | ~85% | ~3% | Sì, intervista |

**Schemi.** Nei promo brevi (46–110 s, media ~80 s): schermate ~45%, riprese ~35%, motion il resto. Il prodotto compare quasi sempre dentro un telefono o un tablet. Nessuno usa il cartoon. **Nessuno mostra il perché di una decisione:** è lo spazio libero di OrtoMio. Verde e bianco dappertutto, quindi il colore non basta a distinguersi.

**Direzioni.**
- **A. Ibrido (consigliata):** riprese stock per i momenti veri, schermate ricostruite in Remotion sopra le immagini o dentro il telefono, motion per punteggio e confidenza. Materiale: 12–16 clip Pexels/Pixabay, 4–5 schermate (briefing, coda, task e diario, pannello del perché, rotazione).
- **B. Prodotto in primo piano, alla xFarm:** schermate e cartelli su fondo verde petrolio. Costa meno, ma diventa un elenco di funzioni e perde la mattina.
- **C. Documentario, alla FieldView:** riprese vere dominanti. Credibile, ma su stock regge male e il ragionamento resta invisibile. Da tenere per il futuro, se ci saranno riprese proprie.

Stato: **D12 (25/10, utente): scelta la direzione A, ibrido.**

---

## 13. Scaletta video 2 — Tecnico (v1, **approvata 25/10**)

Stessa ossatura del titolare (D2). Cambiano apertura, frase sul ruolo e il fatto che il tecnico segue **più aziende** (claim V: organizzazioni, ruoli, inviti; nessun confronto fra aziende, §10.1). Chiusura e CTA identiche (§10.5). Durata obiettivo 75–85 s.

**R** = frase già registrata in `take-v2.mp3`, si riusa senza crediti. **N** = frase nuova da generare con Adriatico.

| # | Passaggio | Immagine | Voce |
|---|---|---|---|
| 1 | Momento vero, a posteriori | Il tecnico in auto o fra i filari, il telefono vibra. Messaggio del cliente sullo schermo. Poi scorre chat, foto, appunti di aziende diverse. | **N** *Il cliente ti scrive: perché abbiamo trattato quel vigneto tre settimane fa?* **N** *La risposta c'è. Sparsa fra messaggi, foto e appunti di cinque aziende diverse.* |
| 2 | La domanda | Filari, poi ortaggi (riuso 2a). | **N** *E se ogni tuo consiglio restasse scritto, con il suo perché?* |
| 3 | Che cos'è | Logo, poi il selettore delle aziende seguite. «Il cervello agronomico delle aziende che segui.» | **N** *OrtoMio è il cervello agronomico delle aziende che segui: ognuna con i suoi dati, i suoi campi, la sua squadra.* |
| 4a | Prima della visita | La coda di azioni di un'azienda, il costo dell'attesa (riuso schermata). | **R** *Ogni mattina, una coda di azioni motivate, ognuna con il suo perché e con quanto costa aspettare.* |
| 4b | Il perché, scritto | Il pannello del perché: dati usati, dati mancanti, confidenza. | **R** *Lavora con i dati che hai, e ti dice quali mancano.* **N** *E il calcolo resta visibile, anche al tuo cliente.* |
| 4c | L'esito | Timeline: proposto → fatto → esito, «Previsione confermata». | **R** *Il campo risponde, il sistema prende nota.* **N** *Quello che avevi previsto, accanto a com'è andata.* |
| 5 | Il ruolo resta | Il tecnico fra i filari con il titolare, o al tavolo. «Il tuo ragionamento resta scritto.» | **N** *Tu consigli come sempre. Ora il tuo ragionamento resta scritto.* |
| 6 | Chiusura | Tramonto, logo, CTA (identica). | **R** *OrtoMio. Decisioni agronomiche verificabili.* **R** *Dalla decisione al raccolto, zero improvvisazione.* |

Frasi nuove: 7 (circa 90 parole, una sola generazione). Riprese nuove da cercare: il tecnico (35–55 anni, in campo con telefono o tablet; tecnico e titolare insieme fra i filari). «Cinque aziende» è un numero illustrativo della scena, non un dato di prodotto.

---

## 14. Video brevi (fase 9, proposta 25/10, da approvare)

Formato principale 9:16 per Reels, Shorts e il feed di LinkedIn, con il 16:9 come secondo formato. Durata 15–30 s, sottotitoli sempre presenti, una sola idea per video, stessa chiusura e stessa CTA dei video principali.

**Prima ondata: tagli dai due video approvati.** Non servono voce nuova né riprese nuove.

| # | Titolo di lavoro | Pubblico | Contenuto | Voce (già registrata) | Durata |
|---|---|---|---|---|---|
| B1 | Il prezzo dell'attesa | Titolare | Coda del mattino e pannello del costo dell'attesa. | *Ogni mattina, una coda di azioni motivate…* · *Anche non intervenire è una scelta con un prezzo.* + chiusura | ~18 s |
| B2 | Il perché, scritto | Titolare | Pannello di trasparenza: dati usati, dati mancanti, confidenza. | *Lavora con i dati che hai, e ti dice quali mancano.* · *La decisione resta tua.* + chiusura | ~15 s |
| B3 | Fatto, registrato | Titolare | Dal compito in campo al diario, poi previsione contro esito. | *In campo, la squadra vede che cosa fare e dove.* · *Fatto, registrato.* · *Il campo risponde, il sistema prende nota.* + chiusura | ~18 s |
| B4 | La domanda del cliente | Tecnico | Messaggio del cliente, risposta sparsa, poi il calcolo condiviso con il cliente. | *Il cliente ti scrive…* · *La risposta c'è…* · *E il calcolo resta visibile, anche al tuo cliente.* + chiusura | ~25 s |

**Seconda ondata: una coltura per video (D3).** Servono voce nuova di Adriatico, stock nuovo e schermate nuove con dati demo. Si scrivono dopo la prima ondata.

| # | Coltura | Indice del mestiere da mettere in scena |
|---|---|---|
| B5 | Vigneto | Indice di Ravaz e rischio peronospora. |
| B6 | Oliveto | Catture nelle trappole e indice di Jaén. |
| B7 | Frutteto | Da definire. Nel brief non c'è ancora un indice verificato. |

### 14.1 Seconda ondata: scalette B5–B7 (v1, proposta 25/10, da approvare)

**Verifica sul codice.** Tutti e tre i moduli sono `stable` in `config/capabilities.ts`. Funzioni e soglie usate nei video:

- **Vigneto.** Fonti: `services/vineyardBudLoadService.ts` e manuale cap. 20. L'indice di Ravaz è l'uva raccolta divisa per il legno di potatura, in kg. Sotto 3 c'è troppa vegetazione e fra 5 e 10 c'è l'equilibrio ottimale, con obiettivo 7. Sopra 10 il carico è eccessivo. Il servizio suggerisce il carico gemme.
- **Oliveto.** Fonti: `components/olives/OliveFlyMonitor.tsx`, `OliveMaturityTracker.tsx` e manuale cap. 19.
  - Mosca, catture per trappola: 0 vuol dire rischio assente, fino a 5 basso («Monitoraggio»), fino a 15 medio («Preparare trattamento»), fino a 30 alto («Trattamento consigliato»), oltre 30 critico.
  - Indice di Jaén: fra 2,5 e 3,5 è «Momento ideale».
  - Il manuale segnala che la migrazione delle tabelle `olive_*` in produzione non è confermata. Non pesa sul video (D11).
- **Frutteto.** Fonti: `logic/healthAlertEngine.ts` e `logic/fruitTreeEngine.ts`. L'avviso dice «Microclima favorevole a ticchiolatura e altre pressioni fungine nel frutteto». Il motore propone anche il diradamento (maggio–giugno) e il controllo degli impollinatori. Salute e monitoraggio sono in Beta, quindi si raccontano come funzionanti (D11).

**Legenda.** N = frase nuova di Adriatico. R = frase già registrata. Ogni breve chiude con la chiusura comune (R) e dura circa 20–25 s, nei formati 9:16 e 16:9.

**B5 Vigneto: «Quante gemme lasciare?»**

| Inq. | Immagine | Voce |
|---|---|---|
| 1 | Potatura invernale, forbici su un tralcio. | **N** *A potatura, la domanda è sempre la stessa: quante gemme lasciare?* |
| 2 | Pannello Ravaz per filare. Filare 4: uva 6,3 kg, legno 0,9 kg, indice 7,0 «Equilibrio ottimale». Filare 7: indice 12,4 «Carico eccessivo». | **N** *OrtoMio mette a confronto l'uva raccolta e il legno di potatura di ogni filare: l'indice di Ravaz.* |
| 3 | Sul filare 7 compare «Ridurre il carico gemme». | **N** *E ti dice dove alleggerire, filare per filare.* |
| 4 | Chiusura comune. | **R** |

**B6 Oliveto: «Tratti o aspetti?»**

| Inq. | Immagine | Voce |
|---|---|---|
| 1 | Trappola cromotropica gialla su un ramo di olivo. | **N** *Dodici catture nella trappola tre. Tratti o aspetti?* |
| 2 | Pannello mosca: 12 catture, rischio «Medio», azione «Preparare trattamento», storico delle ultime settimane in salita. | **N** *OrtoMio legge le catture contro le soglie e ti dice a che punto sei.* |
| 3 | Pannello maturazione: indice di Jaén 2,8, «Momento ideale». | **N** *E con l'indice di Jaén ti dice quando raccogliere.* |
| 4 | Chiusura comune. | **R** |

**B7 Frutteto: «Dopo la pioggia»**

| Inq. | Immagine | Voce |
|---|---|---|
| 1 | Pioggia su un meleto in fioritura. | **N** *Due giorni di pioggia sul meleto, in piena fioritura.* |
| 2 | Avviso: «Microclima favorevole a ticchiolatura», con i segnali (pioggia, umidità, fase). | **N** *OrtoMio incrocia meteo e fase, e ti avvisa prima che si veda.* |
| 3 | Pannello del perché con un dato mancante. | **R** *Lavora con i dati che hai, e ti dice quali mancano.* |
| 4 | Chiusura comune. | **R** |

**Riprese da cercare (Pexels e Pixabay):** potatura della vite in inverno; trappola gialla su olivo oppure oliveto; meleto in fioritura sotto la pioggia. Servono 7 frasi nuove di Adriatico, generate in un'unica ripresa.

**Decisioni aperte**

- ~~17~~ e ~~18~~ chiuse: prima ondata approvata (D17), seconda ondata adesso (D21).
- **22:** approvare le scalette B5–B7 (§14.1).

## 8. Registro delle modifiche

| Data | Modifica |
|---|---|
| 25/10/2026 | Apertura del brief: diagnosi, vincoli, pubblici, messaggio, schema dei contenuti proposto, decisioni aperte 1–10. Corretto il pubblico del hand-off (B2B, non consumatore). |
| 25/10/2026 | Verifica approfondita (masterdoc completo, manuale, `config/capabilities.ts`, `docs/gtm/`, specs landing, componenti, sito live ortomioapp.it): aggiunta §10; aggiornati §2.4, §3, §6.2, decisione 8. |
| 25/10/2026 | **Decisioni 1 e 9 (utente):** due video distinti, uno per il titolare e uno per il tecnico. Durata massima 90 s ciascuno. |
| 25/10/2026 | **Decisione 2 (utente):** approvate le due aperture, mattina per il titolare e a posteriori per il tecnico. |
| 25/10/2026 | **Decisioni 3, 5, 6 e ordine (utente):** coltura mista orticole + vigneto; chiusura «Decisioni agronomiche verificabili»; «zero improvvisazione» ripresa; primo video il titolare. Scaletta del titolare proposta in §11. |
| 25/10/2026 | **Decisione 4 (utente):** scaletta del titolare approvata. Si apre la fase 3 (stile). |
| 25/10/2026 | **Decisione 12 (utente):** stile ibrido. Si apre la fase 4: copione e narrazione del titolare in `video-ortomio/`. |
| 25/10/2026 | **Decisione 13 (utente):** copione v1 del titolare approvato (`video-ortomio/copione-titolare-v1.md`, `narrazione-titolare-v1.txt`). Si aprono le fasi 5 (stock) e 6 (voce). |
| 25/10/2026 | **Video titolare v1 montato** (`video-ortomio/out/ortomio-titolare-v1-*.mp4`, 72,5 s, 16:9 e 9:16): voce Adriatico take-v2, 11 clip Pexels, schermate ricostruite con dati demo, musica provvisoria «Uplifting acoustic» (riserva MealDesk, Pixabay). 32/32 tagli voce nel silenzio. Difetti noti: leggero alone verde sul pollice in 1c, stelo di tulipano in fondo a 5b. In attesa di revisione dell'utente. |
| 25/10/2026 | **Decisione 15 (utente):** video titolare v1 approvato. Proposta la scaletta del tecnico (§13). |
| 25/10/2026 | **Decisione 16 (utente):** scaletta del tecnico approvata (§13). |
| 25/10/2026 | **Video tecnico v1 montato** (`video-ortomio/out/ortomio-tecnico-v1-*.mp4`, 60,8 s, 16:9 e 9:16): 7 frasi nuove di Adriatico (`tecnico.mp3`) e 5 riusate da take-v2, 4 clip Pexels nuove (T1a, T1b con schermo verde scontornato, T5a) più riuso del titolare, stessa chiusura e stessa CTA. 12/12 tagli voce nel silenzio. Limiti noti: nessuno stock di un tecnico che riceve un messaggio fra i filari, quindi il messaggio del cliente compare come notifica sopra il telefono; T5a è girato in un vivaio, non in un vigneto. In attesa di revisione dell'utente. |
| 25/10/2026 | **Decisione 11 (utente):** la pubblicità simula per far capire; le funzioni Beta si raccontano come funzionanti. Esclusi solo i fatti falsi su uso e risultati. |
| 25/10/2026 | **Decisione 19 (utente):** video tecnico v1 approvato. Proposti i video brevi (§14) e scritti i post dei due video principali (`video-ortomio/post-social-v1.md`). |
| 25/10/2026 | **Decisione 17 (utente):** prima ondata B1–B4 approvata. **Brevi v1 montati** (`video-ortomio/out/brevi/`, 9:16 e 16:9): B1 Attesa 20,7 s, B2 Perché 15,9 s, B3 Registrato 18,9 s, B4 Cliente 24,8 s. Stessa voce e stesse schermate dei video principali (tagli già verificati nel silenzio). Chiusura comune con 1,5 s di coda invece di 3. In attesa di revisione dell'utente. |
| 25/10/2026 | **Decisione 20 (utente):** brevi B1–B4 v1 approvati. Scritti i loro post (LinkedIn e Reel) in `video-ortomio/post-social-v1.md` §5–8. |
| 25/10/2026 | **Decisione 21 (utente):** seconda ondata adesso, un breve per coltura. Verificate sul codice le funzioni di vigneto, oliveto e frutteto; scalette B5–B7 proposte in §14.1. |
| 25/10/2026 | **Decisione 22 (utente):** scalette B5–B7 approvate. **Brevi per coltura v1 montati** (`video-ortomio/out/brevi/`, 9:16 e 16:9): B5 Vigneto 25,2 s, B6 Oliveto 22,5 s, B7 Frutteto 22,6 s. Voce: 8 frasi nuove di Adriatico in `coltura.mp3`, allineate 8/8. Stock Pexels in `riprese-stock-brevi-coltura-v1.md`. Lacune: nessuna trappola gialla su olivo (la trappola sta solo nel pannello); i fiori di B7 non si riconoscono come melo. In attesa di revisione dell'utente. |
| 25/10/2026 | **Decisione 23 (utente):** brevi B5–B7 v1 approvati. Scritti i loro post (LinkedIn e Reel) in `video-ortomio/post-social-v1.md` §9–11. |
| 25/10/2026 | **Decisione 24 (utente):** musica definitiva «Acoustic Corporate» di AtlasAudio (Pixabay, licenza in `public/footage/LICENZE.md`), scelta fra cinque prove sotto la voce. Normalizzata al volume della traccia provvisoria. Rifatti i render di tutti i 18 video (2 principali e 7 brevi, 16:9 e 9:16) con gli stessi nomi di file. |

---

## 9. Riepilogo delle decisioni valide

- **D1 (25/10):** due video principali, uno per pubblico — titolare d'azienda e tecnico/consulente agronomico.
- **D9 (25/10):** ciascun video dura al massimo 90 s.
- **D2 (25/10, utente):** apertura diversa per pubblico. **Titolare:** la mattina, «Oggi da dove comincio?» (quaderno, foto sul telefono, messaggi, meteo su un'altra app). **Tecnico:** a posteriori, il cliente chiede «perché abbiamo trattato quella zona tre settimane fa?» e la risposta è sparsa nei messaggi. Il resto dell'ossatura (domanda, che cos'è, tre momenti, ruolo intatto, chiusura) è comune.
- **D3 (25/10, utente):** coltura mista nei due video principali: un'azienda con orticole e vigneto. Le colture singole (vigneto, oliveto, frutteto) vanno nei video brevi.
- **D5 (25/10, utente):** chiusura comune «OrtoMio. Decisioni agronomiche verificabili.»
- **D6 (25/10, utente):** «zero improvvisazione» si riprende nel video, come sul sito.
- **D4 (25/10, utente):** scaletta del titolare approvata (§11 v1), inclusi la frase «La decisione resta tua.», la CTA «Prenota la prova guidata · ortomioapp.it» e la rotazione nel momento 3 (si sposta in un video breve solo se il ritmo lo richiede).
- **D12 (25/10, utente):** stile ibrido (§12, direzione A): riprese stock dal vero, schermate ricostruite in Remotion sopra le immagini o dentro il telefono, motion per punteggio e confidenza. Niente cartoon.
- **D13 (25/10, utente):** copione v1 del titolare approvato, inclusa la frase «Lavora con i dati che hai, e ti dice quali mancano.»
- **D14 (25/10, utente):** voce Adriatico (`covxL85MSd0uUrktE45z`), modello `eleven_v4`. Profilo e prova in `video-ortomio/voce-profilo-v1.md`.
- **Ordine (25/10, utente):** primo video il titolare; il video del tecnico riusa la sua ossatura.
- **D11 (25/10, utente) — Il video simula per far capire, non deve dimostrare.** Scene, schermate, dati demo e funzioni in Beta si mettono in scena come funzionanti. Prevale su §10.1, colonna «Come si racconta»: il badge Beta non frena il racconto. Restano esclusi solo i fatti falsi su uso e risultati (testimonianze o «azienda che lo usa ogni giorno», percentuali, numero di clienti, «disponibile ora»), perché la pubblicità ingannevole verso le imprese è vietata (D.Lgs. 145/2007). Drone e blockchain restano fuori per scelta di messaggio, non per prudenza.
- Valgono i vincoli di verità (§3) e il metodo del hand-off.
