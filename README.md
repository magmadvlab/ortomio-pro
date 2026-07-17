# OrtoMio

OrtoMio è una piattaforma Next.js per la gestione agronomica di orti, campi, frutteti, oliveti e vigneti. Collega anagrafiche, attività, osservazioni, motori decisionali e registri operativi, mantenendo distinti dati reali, stime e simulazioni.

## Stato della baseline

La baseline locale P0-P8 del 17 luglio 2026 è implementata e verificata con test, type-check e build. Non è ancora una release di produzione: migrazioni remote, RLS sul progetto di destinazione, Security Advisor, provider smoke, pilot e rollback devono superare i gate descritti nel piano esecutivo.

Le capability non validate restano disattivate. Drone e blockchain sono laboratori simulati. Le funzioni di certificazione organizzano evidenze e dossier, ma non rilasciano né garantiscono certificazioni ufficiali.

## Documentazione canonica

- [MASTERDOC.md](./MASTERDOC.md): prodotto, architettura, maturità e limiti.
- [Manuale utente](./docs/manual/README.md): comportamento visibile e uso operativo.
- [Piano esecutivo](./docs/reports/execution-plans/ORTOMIO_PIANO_ESECUTIVO_COMPLETAMENTO_2026-07-16.md): fasi, evidenze, gate e residui.
- [Baseline sicurezza](./docs/security/P1_SECURITY_REMEDIATION_2026-07-17.md): contratto di autenticazione, ownership e residui remoti.

Nessun altro documento generale nella root è una fonte canonica.

## Avvio locale

Prerequisiti: Node.js 20+, npm e un progetto Supabase compatibile.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Non inserire credenziali reali in file versionati.

## Verifiche

```bash
npm run test:release
npm run type-check
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
