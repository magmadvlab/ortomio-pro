# Tasks

- **Aggiornamento:** 17 luglio 2026
- **Stato:** baseline locale P0-P9 completata; rollout remoto bloccato
- **Coda canonica:** `docs/reports/execution-plans/ORTOMIO_PIANO_ESECUTIVO_COMPLETAMENTO_2026-07-16.md`

## Gate remoto successivo

- [ ] predisporre staging isolato e snapshot del target;
- [ ] provare restore sul target autorizzato;
- [ ] applicare P1-P8 e verificare drift/RLS cross-tenant;
- [ ] rieseguire Security Advisor;
- [ ] eseguire smoke Sentinel e ThingsBoard senza comandi fisici;
- [ ] eseguire shadow mode e pilot su un solo garden;
- [ ] registrare rollback o attivazione progressiva tramite readiness Admin.

## Regola

Nessun nuovo piano parziale deve essere creato nella root. Un residuo applicativo entra nel piano canonico; un'attivita futura separata deve avere owner, stato e criterio di uscita.
