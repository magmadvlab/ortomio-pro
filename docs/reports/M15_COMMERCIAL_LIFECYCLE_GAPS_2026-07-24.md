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
| provisioning azienda transazionale | non certificato |
| invio e accettazione invito server-side | incompleto |
| ruoli amministratore/responsabile/operatore | schema presente, E2E non certificato |
| piano/licenza e limiti | assente |
| rinnovo e fatturazione | assente |
| sospensione | assente |
| cancellazione/esportazione/retention | assente |
| audit amministrativo | parziale |

## Condizione di uscita

M15 resta incompleto finche' l'intero lifecycle non e' disponibile tramite API server autorizzate e provato su due aziende, incluso downgrade, sospensione, cancellazione e conservazione dati.
