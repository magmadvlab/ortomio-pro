# OrtoMio

OrtoMio è una piattaforma Next.js per la gestione agronomica di orti, campi, frutteti, oliveti e vigneti. Collega anagrafiche, attività, osservazioni, motori decisionali e registri operativi, mantenendo distinti dati reali, stime e simulazioni.

## Stato e verifiche

Baseline iniziale del 18 novembre 2026: type-check e build passano; la suite release ha 441 test superati e 13 falliti, tutti nella landing. Il lint segnala 637 warning e zero errori. L'app è già pubblicata, ma questi controlli non certificano la release commerciale: prove remote, isolamento, provider, pilot e rollback restano soggetti ai gate del piano master.

Sono state aggiunte correzioni locali per Impostazioni, consulti, piante, routing, test satellite e anteprima mappe, oltre al manuale. Il [rapporto corrente](./docs/reports/ORTOMIO_AUDIT_LOCALE_MANUALE_2026-11-18.md) distingue test del codice, prove UI con fixture e collaudo dei servizi reali. Le modifiche non sono pubblicate. Verifica applicativa corrente: `test:app` 472/472, type-check e build verdi, lint 0 errori/634 warning. La landing conserva 13 fallimenti e il gate documentale storico resta aperto.

Le capability non validate restano disattivate. Drone e blockchain sono laboratori simulati. Le funzioni di certificazione organizzano evidenze e dossier, ma non rilasciano né garantiscono certificazioni ufficiali.

## Documentazione canonica

- [MASTERDOC.md](./MASTERDOC.md): prodotto, architettura, maturità e limiti.
- [Manuale utente](./docs/manual/README.md): comportamento visibile e uso operativo.
- [Piano master](./docs/reports/execution-plans/ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md): unica coda corrente, evidenze, gate e residui.
- [Audit locale e manuale, 18 novembre 2026](./docs/reports/ORTOMIO_AUDIT_LOCALE_MANUALE_2026-11-18.md): controlli eseguiti, difetti accertati e limiti delle prove.
- [Baseline sicurezza](./docs/security/P1_SECURITY_REMEDIATION_2026-07-17.md): contratto di autenticazione, ownership e residui remoti.

Nessun altro documento generale nella root è una fonte canonica.

## Avvio locale

Prerequisiti: Node.js 22+, npm 10+ e un progetto Supabase compatibile per usare le funzioni autenticate.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Non inserire credenziali reali in file versionati.

Il manuale è disponibile su `http://localhost:3002/docs/manual` anche senza accesso all'account. Nell'app si apre da **Manuale** (`/app/help`); **Guida sezione** nella barra superiore apre le istruzioni della pagina corrente. Comprende 45 capitoli, ricerca nel testo, percorso iniziale, routine quotidiana e risoluzione dei problemi.

Per aggiornarlo, modifica `docs/manual/`, mantieni il catalogo `config/manual.ts`, poi esegui `npm run docs:sync` e `npm run docs:check`. La copia `public/docs/manual/` è generata dalla sorgente. Un cambiamento di comportamento richiede anche la verifica della relativa guida e dei limiti dichiarati.

## Verifiche

```bash
npm run test:app
npm run test:release
npm run docs:check
npm run test:weather
npm run type-check
npm run lint
npm run build
npm run release:check
```

`release:check` verifica la baseline locale, ma non può dichiarare il deploy pronto. Per il gate remoto servono un ambiente autorizzato e le variabili previste da `npm run release:check:remote`.

## Principi operativi

- autenticazione e ownership sono verificate server-side;
- i write critici falliscono in modo visibile senza persistenza cloud;
- comandi e interventi non risultano eseguiti senza evidenza;
- export sensibili sono autorizzati e auditati;
- dati demo non entrano in KPI o dossier reali;
- provider assenti producono stato indisponibile, mai dati inventati.

## Stack

Next.js 16, React 19, TypeScript, Supabase/PostgreSQL e provider esterni opzionali per AI, meteo, satellite e IoT.

## Licenza

Repository privato. Uso e distribuzione sono soggetti agli accordi del progetto.
