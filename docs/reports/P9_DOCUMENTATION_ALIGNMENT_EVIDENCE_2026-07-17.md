# P9 — Evidenze allineamento documentale

- **Data:** 17 luglio 2026
- **Branch:** `codex/ortomio-p9-documentation-cleanup`
- **Perimetro:** contenuti canonici; bonifica massiva in PR successiva
- **Stato:** release candidate locale documentata; rollout remoto differito

## Fonti canoniche

- `MASTERDOC.md` assorbe il vecchio `docs/ORTOMIO_DOCUMENTAZIONE_COMPLETA.md`;
- `README.md` rimanda soltanto a masterdoc, manuale, piano corrente e baseline sicurezza;
- `docs/manual` e la fonte del manuale servito dall'app;
- `public/docs/manual` e una copia generata e verificata.

## Correzioni di verita prodotto

- rimosse promesse di compliance al 100%, certificazione automatica e ROI garantito;
- P0-P8 descritti come baseline locale, non come deploy di produzione;
- NDVI usa Sentinel Statistical API reale e fallisce senza dati/provider, senza fallback casuale;
- predizioni, scheduling irriguo e certificazioni avanzate restano disattivati;
- comandi IoT richiedono ack o misura prima dello stato eseguito;
- dossier certificativi non sostituiscono organismi di controllo;
- drone e blockchain restano simulazioni isolate.

## Verifiche

- `npm run docs:sync` — 35 capitoli copiati;
- `npm run docs:sync:check` — verde;
- `npm run test:capabilities` — 7/7, inclusi route e link Help;
- `npm run type-check` — verde;
- `npm run build` — verde, 144 pagine generate;
- scansione claim ad alto rischio e link fittizi — nessuna occorrenza residua nei file canonici;
- `git diff --check` — verde.

## Limiti dichiarati

Nessuna migrazione P1-P8 e stata applicata al progetto remoto da questa esecuzione. Snapshot, restore drill remoto, Security Advisor, provider smoke, shadow mode e pilot non sono stati eseguiti. La bonifica dei documenti e piani storici e separata da questo aggiornamento contenuti.
