# Bozza copy landing — concept "L'orchestratore agronomico"

Data: 2026-08-19
Stato: BOZZA da revisione. Nessun file di produzione modificato.

## Base documentale (ogni claim è verificato su)

- `MASTERDOC.md` §5 (Director e ledger), §10 (pressione ambientale), §16 (GDD/fenologia), §17 (fotoperiodo/luna)
- `docs/manual/34-director-orchestrator.md`, `18-orchard-management.md`, `19-olive-management.md`, `20-vineyard-management.md`
- Codice: `services/directorService.ts`, `agronomicPriorityService.ts` (scoreAgronomicPriority), `agronomicEconomicPriorityService.ts` (intervene_now/next_cycle/monitor), `agronomicPredictionPipelineService.ts` (versioni+hash), `agronomicMeasuredFeedbackService.ts`, `photoAnalysisService.ts` (Gemini Vision), `healthAlertEngine.ts`, `types/agronomicKernel.ts` (21 segnali)
- Vincoli di onestà rispettati: niente robotica/computer vision di conteggio, niente flussi DOP/cantina/blockchain, niente marketplace agronomi, previsioni mai chiamate diagnosi.

## Concetto

Il soggetto non sono i dati ma il ciclo: **registra → analizza → punteggia → propone → verifica**.
L'orchestratore (Director) viene nominato e mostrato per come lavora: compone, spiega, firma. La decisione resta umana.

---

## 1. Hero

- **Eyebrow:** L'orchestratore agronomico per aziende e consulenti
- **Titolo:** Ogni mattina una coda di azioni motivate: cosa fare, perché, quanto costa aspettare.
- **Summary:** OrtoMio registra ogni intervento e lo collega a satellite, suolo, acqua e fenologia. Punteggia le azioni del giorno su urgenza, impatto, fattibilità e costo, confronta intervenire ora, rinviare o monitorare — e firma ogni previsione con i dati usati. La decisione resta tua.
- **CTA:** Prenota la tua prova guidata

## 2. Galleria prodotto

Invariata (screenshot reali).

## 3. Come punteggia (ex ReasonWhy)

- **Titolo:** Le tue giornate non sono una lista di avvisi. Sono una coda punteggiata.
- **Intro:** Ogni proposta nasce da un calcolo esplicito, non da un punteggio opaco. Il Director combina profilo colturale, fenologia, pressione ambientale e storia dei tuoi interventi; il punteggio finale somma fattori che puoi leggere uno a uno.
- **Fattori (griglia):**
  1. **Confidenza dei dati** — Più i tuoi dati sono misurati, più la proposta sale. Un valore stimato non si finge una misura.
  2. **Copertura dei segnali** — Satellite, suolo a tre profondità, acqua, pianta: il punteggio cresce con i segnali che hai davvero — e ti dice quali mancano.
  3. **Fase fenologica** — GDD accumulati e fase della coltura: lo stesso intervento vale di più in una fase delicata.
  4. **Pressione ambientale** — Giorni recenti di stress idrico o di pressione malattia pesano su irrigazione, nutrizione e difesa.
  5. **Feedback misurato** — Come ha risposto il tuo campo le volte scorse modifica la proposta di oggi.
  6. **Economia** — Perdite attese e costi a confronto: anche non intervenire è una scelta con un prezzo.

## 4. Cosa produce ogni mattina (ex DecisionScenario, id `come-funziona`)

- **Titolo:** Dal briefing al campo, senza passaggi persi.
- **Step:**
  1. **Briefing** — Meteo sintetico, stress idrico e termico, fotoperiodo, fase lunare, GDD accumulati: il quadro del giorno, con la qualità dichiarata di ogni fonte.
  2. **Coda delle azioni** — Cosa fare prima, perché, con quale confidenza — e quali segnali mancano per decidere meglio.
  3. **Task eseguibili** — Dalla proposta all'azione: link diretti a irrigazione, nutrizione, raccolta, lavorazioni.
  4. **Previsioni firmate** — Rischio malattie, resa, risorse: ogni previsione porta versione del modello, dati usati e finestra di validità.
  5. **Memoria della decisione** — Perché hai deciso, cosa è stato fatto, com'è andata: la storia che vale anche la prossima stagione.

## 5. Ogni proposta si spiega (PillarTransparency, tab invariati)

Già allineata: *Cosa propone / Su cosa si basa / Perché viene prima / Alternative* + calcolo illustrato.
Rititolare: **"Quattro domande aprono ogni proposta. Ogni risposta è nei dati."** — copia interna invariata.

## 6. Previsioni firmate (ex PrecisionEvidence)

- **Titolo:** Previsioni che puoi verificare, non promesse.
- **Intro:** Stesso input, stesso output: le previsioni di OrtoMio sono deterministiche e firmate — versione del modello, versione delle regole, hash dell'input, orizzonte e finestra di validità. Se un dato manca, la previsione lo dichiara invece di riempirlo.
- **Card:**
  1. **Deterministiche e versionate** — Ogni previsione è riproducibile: sai quale modello e quali regole l'hanno prodotta.
  2. **Qualità della fonte esplicita** — Measured, estimated, insufficient: la provenienza del dato è parte del risultato.
  3. **Segnali mancanti visibili** — Quando non c'è abbastanza per prevedere, OrtoMio dice cosa manca — e come procurarlo.

## 7. L'occhio AI su ogni pianta, ogni albero (NUOVA)

- **Titolo:** Ogni pianta ha un codice, una storia — e un occhio AI.
- **Intro:** Scatta una foto: OrtoMio la analizza per esposizione solare, stato di salute, ritmo di crescita e fase. Ogni pianta e ogni albero mantiene codice, posizione, varietà e la sequenza di ciò che ha ricevuto e prodotto.
- **Card:**
  1. **Analisi fotografica** — Esposizione, salute, crescita, fase fenologica: dalla foto dell'appezzamento o della singola pianta.
  2. **Allerte salute** — Rischio malattia dal meteo, parassiti stagionali, deficit idrico, soglie dei sensori: l'attenzione arriva prima del danno.
  3. **Storia per individuo** — Codice, filare, posizione: potature, trattamenti e raccolte restano legati alla pianta, non alla media dell'appezzamento.

## 8. Il ciclo che impara (ex PillarTraceability)

- **Titolo:** Il campo risponde. Il sistema prende nota.
- **Intro:** Ogni proposta finisce in un registro decisionale: fonte, motivazione, snapshot, task creato, esito. Quando registri il risultato reale, il feedback misurato rientra nei punteggi: più usi OrtoMio, più le proposte assomigliano al tuo campo — e non a una media.

## 9. Verticali veri (SpecialistCrops, id `colture` — copy espansa)

- **Titolo:** Non pagine generiche: verticali con i dati del tuo mestiere.
- **Voci (da `content.ts`, testo ampliato):**
  - **Orticole e seminativi** — Pianifica semine, rotazioni e raccordi fra irrigazione, lavorazioni e raccolto; il sistema segnala le successioni poco adatte.
  - **Vigneto** — Dalla vite singola al filare: ceppi individuali, carico gemme, indice Ravaz con storico, impianto irriguo per fila.
  - **Oliveto** — Indice di Jaen con storico e raccomandazione di raccolta; mosca olearia monitorata a soglie sulle catture reali delle trappole.
  - **Frutteto** — Alberi individuali per varietà, salute e vigore; potature e raccolte registrate; sesti e densità d'impianto come supporto alla configurazione.
  - **Vivaio** — Dalla semina al trapianto: ogni piantina porta il suo codice, che la segue quando entra nel filare.

## 10-12. Pianificazione, Certificazioni, Pubblici

PlanningMemory, CertificationEvidence, AudienceSplit: copy invariata (già allineata al concept).

## 13. CTA finale

Invariata (form prova guidata).

---

## Metadati

- **Meta description (SEO):** OrtoMio registra ogni intervento, punteggia le azioni del giorno su urgenza, impatto, fattibilità e costo, e firma ogni previsione con i dati usati. La decisione resta tua.
- **OG description:** L'orchestratore agronomico: registra, analizza, prevede — e spiega ogni proposta.
- **come-funziona (meta):** Come OrtoMio trasforma satellite, suolo, acqua e storia delle piante in una coda di azioni punteggiate e spiegate.

## Note di implementazione

- Sezioni modificate: content.ts (hero), ReasonWhy→punteggio, DecisionScenario→produzione, PrecisionEvidence→previsioni, PillarTraceability→ciclo, SpecialistCrops espansa, NUOVA sezione AI piante (posizione: dopo Previsioni, prima del ciclo).
- Da tenere: id `come-funziona` su sezione 4, id `colture` su 9, id `prova-guidata` su FinalCta, id `perche-ortomio` (rinominabile).
- Conteggio sezioni finali: 13 (era 12): la nuova sezione AI sostituisce contenuto che non esisteva, non duplica.
