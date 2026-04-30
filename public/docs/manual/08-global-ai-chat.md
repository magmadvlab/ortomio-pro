# Chat AI Globale

[← Torna all'Indice](./README.md)

---

## Stato modulo

**Stato attuale**: **reale ma bounded**

La Chat AI Globale e disponibile nell'app e usa una route backend effettiva. Non e un agente autonomo con memoria durevole completa, azioni scriventi generalizzate o escalation umana integrata.

Percorso: pulsante chat AI nel layout applicativo autenticato.

---

## Cosa e disponibile ora

- widget chat globale accessibile dalle principali sezioni app
- invio domanda utente alla route backend `POST /api/ai/chat`
- controllo tier (`PLUS`/`PRO`) e verifica crediti AI
- prompt bounded con regole esplicite: non dichiarare azioni non eseguite, usare solo contesto dichiarato
- supporto contesto route/modulo con hint di navigazione (context type `director-context` e correlati)
- gestione errori/crediti insufficenti con messaggi espliciti lato UI

---

## Limiti attuali

- nessuna memoria durevole cross-session della conversazione in un registro dedicato
- nessun registro ufficiale di action execution con conferma utente dal canale chat globale
- nessun workflow nativo di handoff verso operatore umano
- base conoscenza non e dichiarabile come "database scientifico verificato e versionato" nel prodotto corrente
- suggerimenti UI restano assistivi; non equivalgono a operazioni persistite automatiche

---

## Cosa non va promesso come chiuso

- assistente universale con memoria storica completa aziendale
- esecuzione autonoma di task, registrazioni, comandi dispositivi o modifiche dati da chat
- SLA/tempi risposta garantiti o supporto multicanale enterprise
- knowledge base certificata con copertura normativa/commerciale completa e aggiornata in tempo reale
- comandi speciali (`/escalate`, `/export chat`, ecc.) come funzioni operative confermate se non implementate

---

## Uso corretto oggi

Usa la chat globale per:

- chiarimenti agronomici e orientamento operativo
- lettura guidata del contesto modulo corrente
- suggerimenti su prossimo passo e su quale sezione aprire

Non usarla come:

- canale ufficiale di chiusura decisionale/audit
- prova di esecuzione operativa o compliance normativa
- sostituto di consulenza professionale nei casi ad alta criticita

---

## Roadmap realistica

- memoria contestuale durevole e governata
- registro azioni suggerite -> confermate -> eseguite
- handoff strutturato verso supporto umano
- contract unificato tra chat, planner, director e ledger operativo

---

[← Torna all'Indice](./README.md)
