# Tasks

- **19 novembre · Onboarding terreno aperto.** [Piano e registro delle prove](./docs/reports/execution-plans/ORTOMIO_ONBOARDING_TERRENO_2026-11-19.md).

- **Aggiornamento:** 18 novembre 2026.
- **Coda canonica:** [piano master](./docs/reports/execution-plans/ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md), registro §5.1.
- **Stato release:** M01-M02 chiusi per la release; M16 eseguita con NO-GO il 26 luglio. Le evidenze remote mancanti non sono state chiuse dall'audit locale.
- **Verifica corrente:** [audit locale e manuale](./docs/reports/ORTOMIO_AUDIT_LOCALE_MANUALE_2026-11-18.md). Verifica applicativa 481/481, landing 17/30 (13 fallimenti preesistenti), lint 629 warning e zero errori; type-check e build verdi. Prove UI dei componenti con fixture, collaudo backend/provider aperto.
- **Manuale:** 46 capitoli disponibili, indice ricercabile e guide per sezione implementati nel branch locale `codex/manuale-audit-locale`; non pubblicati. Test manuale 10/10, copia pubblica sincronizzata.
- **Nuove scoperte:** O68-O86 nel piano master, con milestone proprietario e criterio di uscita. I rapporti di audit conservano le prove e non costituiscono una seconda coda.
- **Piano correttivo app dopo login:** §5.2 del [piano master](./docs/reports/execution-plans/ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md#52-piano-correttivo-dellapp-dopo-il-login--18-novembre-2026), lotti L0-L7: baseline, comandi reali, dati dell'orchestratore, regole agronomiche, ciclo operativo, mappe/export, automazioni e accettazione. Comprende i residui storici e l'[audit applicativo](./docs/reports/audit-2026-11-18/REPORT.md); landing esclusa dal perimetro richiesto. Correzioni locali L0–L7 e collaudo Docker eseguiti: [rapporto esecuzione](./docs/reports/audit-2026-11-18/EXECUTION.md), [runbook](./docs/reports/audit-2026-11-18/LOCAL_RUNBOOK.md). API/SQL con due utenti, restore locale, export indipendenti; variabili server aggiunte su Vercel. Restano migrazione/pubblicazione remote, credenziali legacy/provider e validazione agronomica. Non equivalgono alla chiusura di tutti i lotti.

## Regola

Il piano master è l'unica coda operativa corrente. I 44 obiettivi originali e le scoperte successive hanno conteggi separati. Ogni nuova scoperta deve aggiornare il blocco proprietario, il registro e il riepilogo; `[L]` non equivale a chiuso per la release. Le prove locali e la navigazione in lettura non sostituiscono salvataggi, riletture, RLS, restore o verifica dei servizi esterni.

- **Evidenza remota 18/11:** backup produttivo con ACL e ripristino Docker senza rete riusciti (10 utenti, 6 terreni, impronta uguale); tre migrazioni collaudate sulla copia. Candidato `/Volumes/990P/ortomio-audit-release` basato sulla produzione, landing preservata. Dominio Resend verificato; trasporto notifiche corretto, chiave Vercel e collaudo di consegna ancora richiesti. Nessun deploy o modifica DB produttivo.

- **Candidato finale aggiornato:** build riuscita, test app 486/486, quattro migrazioni testate nella copia Docker. Trasporto Resend e recupero dei job corretti; i mittenti Production sono salvati, `RESEND_API_KEY` risulta ancora assente. Nessuna email reale e nessun deploy.
