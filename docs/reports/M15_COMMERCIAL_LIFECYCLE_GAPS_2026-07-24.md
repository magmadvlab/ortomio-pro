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
| invio e accettazione invito server-side | implementato localmente; provider e prova E2E staging aperti |
| ruoli amministratore/responsabile/operatore | schema presente, E2E non certificato |
| piano/licenza e limiti | superato: decisione prodotto single-PRO, nessun piano o limite commerciale |
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

## Avanzamento O39 - 26/07/2026

Il flusso inviti e' stato spostato dal browser al server:

- `POST /api/organizations/invitations` autorizza soltanto Owner/Administrator, valida che il ruolo appartenga all'organizzazione e non restituisce il token;
- la delivery usa Resend esclusivamente lato server e registra stato, provider, message ID, timestamp o errore;
- `GET /api/organizations/invitations` non seleziona ne' espone token;
- `/accept-invitation` porta il destinatario al flusso reale di accettazione;
- `PATCH /api/organizations/invitations` deriva ID ed email dalla sessione autenticata;
- `accept_organization_invitation` verifica destinatario e scadenza, poi attiva membership e invito nella stessa transazione.

Configurazione richiesta: `RESEND_API_KEY`, `ORGANIZATION_INVITATION_FROM` e `NEXT_PUBLIC_SITE_URL`, documentate in `.env.production.example`.

Evidenza locale: test mirati M15/O38/O39 6/6, type-check verde e build produzione 150 pagine. O39 resta `[L]`, non `[x]`: la migrazione, la consegna provider e l'accettazione con due utenti reali devono essere provate sullo staging isolato.

## Chiusura O40 - decisione single-PRO del 26/07/2026

L'utente ha confermato che il precedente modello a piani e limiti e' superato: OrtoMio esiste in una sola versione **PRO**, con tutte le capability applicative abilitate e limiti applicativi illimitati.

Di conseguenza O40 non e' stato implementato come nuovo sottosistema licenze:

- annullati schema e quote multi-piano preparati ma mai committati;
- autorizzazione server consolidata: `verifyTier` continua a richiedere utente e profilo reali, ma non rifiuta piu' per tier legacy;
- contratto capability restituisce sempre `PRO`;
- `ProFeatureGate` non nasconde piu' capability incluse;
- registro trattamenti non richiede piu' il tier inesistente `PRO_PROFESSIONAL`;
- rimossi prezzi, acquisto crediti e messaggi di upgrade dai widget AI vivi.

I crediti AI restano una quota tecnica operativa, non una licenza o un piano commerciale. I campi/mapping legacy restano compatibili durante la migrazione dati ma non decidono piu' l'accesso.
