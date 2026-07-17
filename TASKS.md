# Tasks

Aggiornato il 16 luglio 2026. La coda canonica e
`docs/reports/execution-plans/ORTOMIO_PIANO_ESECUTIVO_COMPLETAMENTO_2026-07-16.md`.

## Active

- [x] P0 — Inventario eseguibile e baseline di produzione.
- [ ] P1 — Sicurezza server, ownership e RLS.

Le fasi P2-P9 restano ordinate nel piano canonico e non vengono duplicate qui.

## Reconciliation dei piani giugno

- [x] Component Quality: implementato e integrato con merge PR `afff1b7`.
- [x] Storage Provider Integrity: implementato e integrato con merge PR `456e169`.
- [x] Agronomic Context Refinement: integrato in `main` con merge PR `8e88136`; il vecchio task di apertura PR e superato.
- [-R] Service Logic Correctness come piano autonomo: implementato in parte (`93041c5`, `f88afb4`, `7d98e7f`, `20bfc57`) e assorbito nelle fasi P3/P5 per i residui verificati.

## Governance documentale obbligatoria

- [ ] P9/PR-16 — classificare e ripulire 540 Markdown e 85 TXT storici tracciati nella root;
- [ ] mantenere una root su allowlist e un archivio storico minimo indicizzato;
- [ ] eliminare piani assorbiti, report di sessione, messaggi commit e duplicati dopo la chiusura P1-P8;
- [ ] aggiungere il gate `docs:hygiene`.

## Fuori perimetro della release P0-P9

- decomposizione generalizzata dei componenti UI;
- consolidamento indistinto di tutti i servizi AI.

Questi lavori possono essere riaperti soltanto come slice bounded quando bloccano un gate del piano canonico.
