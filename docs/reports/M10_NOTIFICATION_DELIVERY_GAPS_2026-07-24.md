# M10 - Notifiche e osservabilita'

## Correzione locale

La lettura fallita delle preferenze non abilita piu' implicitamente l'invio. `sentAt` viene impostato soltanto quando il provider restituisce successo; le notifiche programmate dichiarano esplicitamente che non esiste ancora uno scheduler persistente.

## Gap bloccanti

- coda persistente con stato `scheduled`, `processing`, `sent`, `failed`, `dead_letter`;
- idempotency key e deduplica per utente/evento/canale;
- retry con backoff e limite tentativi;
- provider message ID e webhook di consegna;
- scheduler cron autorizzato;
- rate limit persistente, non in memoria;
- metriche, alert e runbook provider.

M10 non e' completato finche' una consegna non e' tracciabile fino a conferma o dead letter.
