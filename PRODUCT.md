# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing codebase: Next.js 16, React 19, TypeScript, Supabase/PostgreSQL. The landing page is a new route/surface within this existing app (not a separate greenfield stack decision — inherited from the repo).

## Users

Two confirmed primary audiences, addressed together on this surface (no split funnel):
- **Aziende agricole strutturate**: titolari/responsabili di campo con più ettari, più colture, più operatori. Il problema è coordinamento e memoria operativa (dove sono le informazioni, chi ha deciso cosa e perché).
- **Tecnici e consulenti agronomici**: professionisti che seguono più aziende clienti. Il problema è tracciabilità, dati confrontabili tra clienti, credibilità nel proprio consiglio.

## Product Purpose

OrtoMio collega anagrafiche, attività, osservazioni, motori decisionali e registri operativi per orti, campi, frutteti, oliveti e vigneti, mantenendo distinti dati reali, stime e simulazioni. Non è un'agenda agricola: costruisce una memoria intorno a ogni decisione, collegando suggerimento, task, esecuzione ed esito. Successo = l'utente sa sempre perché un intervento è stato deciso e può confrontare previsione con esito reale.

## Positioning

Il meccanismo differenziante confermato: OrtoMio distingue esplicitamente dato misurato, stimato, assente e simulato — non presenta mai un numero inventato come una misura. Le priorità operative sono spiegabili (motivazione visibile, non solo un punteggio), e la decisione finale resta sempre umana: il sistema propone e argomenta, non sostituisce il responsabile agronomico.

## Operating Context

Flusso reale: configurazione azienda/garden/zone → registrazione colture, suolo, esposizione, segnali disponibili → il sistema prepara priorità con motivazione → il responsabile approva o pianifica un task → esecuzione e registrazione → l'esito aggiorna il ledger e migliora il contesto successivo. Oggi l'uso autorizzato è demo/beta: una sola azienda fittizia, utenti e dati di prova, nessun comando verso dispositivi fisici, nessuna decisione agronomica automatica.

## Capabilities and Constraints

Confermate: gestione garden/zone/filari/piante, motore di priorità agronomiche, moduli irrigazione/nutrizione/salute, diario e ledger operativo persistente, NDVI e mappe di prescrizione (in fase di validazione, dipendenti da provider e qualità dato), organizzazioni/inviti/ruoli/piano PRO.

Vincolo esplicito e non negoziabile per questo surface: il prodotto è **release candidate tecnica con decisione commerciale NO-GO** (non ancora una certificazione commerciale 1.0). Drone e blockchain sono laboratori simulati. La landing deve dichiarare questo stato con lo stesso peso visivo delle sezioni di vendita, non come nota legale minimizzata — è un requisito di prodotto confermato dall'utente (tono "ambizioso ma onesto"), non solo una preferenza estetica.

## Brand Commitments

Nome: **OrtoMio**. Nessuna proposta di rebrand per questo lavoro — solo valutazione/micro-ritocchi. Logo esistente in `public/logo.png`: foglia stilizzata con emisfero destro a circuito (metafora agricoltura + intelligenza), payoff attuale "il tuo assistente smart". Colore principale del logo: verde petrolio (~#1b7a6b) su bianco.

## Evidence on Hand

Fonti di verità reali usate per il copy, nessun dato inventato: [MASTERDOC.md](./MASTERDOC.md) (mappa funzionale completa), [docs/DOCUMENTO_COMMERCIALE_ORTOMIO_PRO_2026-08-01.md](./docs/DOCUMENTO_COMMERCIALE_ORTOMIO_PRO_2026-08-01.md) (problema/soluzione/benefici già validati in altra sede), [docs/superpowers/specs/2026-08-15-ortomio-landing-copy-design.md](./docs/superpowers/specs/2026-08-15-ortomio-landing-copy-design.md) (copy della landing, sezione per sezione).

Assenze esplicite da non colmare con invenzioni: nessun logo-cliente reale, nessuna testimonianza cliente, nessuna metrica di risultato agronomico misurata su un pilot reale (il pilot reale non è ancora avvenuto).

## Product Principles

- Onestà sullo stato beta come leva di fiducia, non come rischio da nascondere (Pratfall Effect confermato come principio di tono).
- La decisione resta sempre umana: il sistema propone e spiega, non sostituisce il responsabile agronomico.
- Specificità sopra la genericità: niente "ottimizza"/"innovativo" senza un meccanismo concreto dietro.
- Un solo messaggio, un solo CTA primario (`Prova la demo ora` → `/app`), anche parlando a due pubblici diversi.
- Nessun dato, testimonianza o metrica non verificabile nel prodotto reale.

## Accessibility & Inclusion

Nessun requisito specifico oltre lo standard: contrasto colore adeguato (verificare il verde petrolio del logo su sfondo scuro se la hero usa un tema scuro), navigazione da tastiera sul CTA principale.
