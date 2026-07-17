# P9 — Report finale di igiene documentale

- **Data:** 17 luglio 2026
- **Branch:** `codex/ortomio-p9-doc-hygiene`
- **Manifest:** `P9_DOCUMENT_HYGIENE_MANIFEST_2026-07-17.csv`
- **Stato:** bonifica locale completata; rollout remoto ancora differito

## Risultato

Il manifest classifica 879 elementi: 870 documenti tracciati, 6 piani locali non tracciati e 3 artefatti generati dalla bonifica. La classificazione finale contiene 91 `keep` e 788 `delete`.

- 782 file Markdown/TXT tracciati eliminati;
- 6 piani parziali locali non tracciati eliminati;
- root ridotta da 625 documenti a `README.md`, `MASTERDOC.md` e `TASKS.md`;
- piani e specifiche di marzo, aprile e giugno assorbiti nel masterdoc/piano corrente;
- report `COMPLETE`, `SUCCESS`, `SESSION_SUMMARY`, messaggi commit e istruzioni deploy storiche eliminati;
- manuale sorgente, copia pubblica, security baseline ed evidenze P0-P9 mantenuti;
- archivio storico ridotto a un indice; i contenuti rimossi restano ricostruibili dalla cronologia Git.

## Esclusioni deliberate

`dashboard.html`, gli script locali di estrazione/import e il backup SQL non sono stati spostati, versionati o cancellati: non sono documentazione canonica e restano esclusi dalla PR. Nessuna credenziale o backup e stato inserito nell'archivio.

## Gate

- `npm run docs:hygiene` verifica allowlist, copia manuale e unico piano attivo;
- `npm run docs:sync:check` verifica i 35 capitoli pubblici;
- app, script e build leggono solo documenti mantenuti;
- il piano corrente espone uno stato esecuzione esplicito;
- la root non accetta nuovi Markdown/TXT fuori allowlist.
