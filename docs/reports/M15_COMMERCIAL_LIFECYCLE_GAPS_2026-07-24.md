# M15 - Lifecycle commerciale e ruoli

## Capability presenti

- registrazione utente;
- organizzazioni, ruoli e membership nello schema locale;
- inviti persistiti con scadenza;
- UI di gestione organizzazione;
- guard server admin e organizzazione.

## Correzione sicurezza

Il token di invito non viene piu' scritto nei log insieme all'indirizzo email. La consegna resta esplicitamente in attesa di un provider server-side.

## Gap bloccanti

| Fase | Stato |
|---|---|
| provisioning azienda transazionale | implementato localmente; migrazione e prova E2E staging aperte |
| invio e accettazione invito server-side | incompleto |
| ruoli amministratore/responsabile/operatore | schema presente, E2E non certificato |
| piano/licenza e limiti | assente |
| rinnovo e fatturazione | assente |
| sospensione | assente |
| cancellazione/esportazione/retention | assente |
| audit amministrativo | parziale |

## Condizione di uscita

M15 resta incompleto finche' l'intero lifecycle non e' disponibile tramite API server autorizzate e provato su due aziende, incluso downgrade, sospensione, cancellazione e conservazione dati.

## Avanzamento O38 - 26/07/2026

Il provisioning non scrive piu' direttamente `organizations` dal client:

- la route autenticata `POST /api/organizations/provision` deriva l'owner dalla sessione server;
- la funzione SQL `provision_organization` crea organizzazione, ruoli di sistema e membership Owner nella stessa transazione;
- la funzione e' eseguibile soltanto dal `service_role`, quindi un client non puo' scegliere arbitrariamente `p_owner_id`;
- la UI usa esclusivamente la route server e rilegge poi lo stato organizzazione esistente.

Evidenza locale: lint mirato senza errori, type-check verde, test mirati O38/M15 4/4 e build produzione 148 pagine. O38 resta `[L]` e non `[x]` finche' la migrazione non viene applicata e provata sullo staging isolato richiesto da M06.
