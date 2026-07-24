# M10 - Notifiche e osservabilita'

## Correzione locale

La lettura fallita delle preferenze non abilita piu' implicitamente l'invio. `sentAt` viene impostato soltanto quando il provider restituisce successo; le notifiche programmate dichiarano esplicitamente che non esiste ancora uno scheduler persistente.

## Lifecycle implementato localmente

- coda `notification_delivery_queue` con stati `scheduled`, `processing`, `sent`, `delivered`, `failed`, `dead_letter`, `suppressed`;
- idempotency key unica e deduplica per evento/canale;
- claim atomico concorrente con `FOR UPDATE SKIP LOCKED`;
- retry esponenziale limitato e dead-letter terminale;
- cron autorizzato `/api/cron/notification-delivery`;
- rate limit calcolato sulle consegne persistite delle ultime 24 ore;
- provider message ID e webhook autenticato `/api/notifications/provider-webhook`;
- metriche delivery incluse nella readiness amministrativa;
- tutti i chiamanti di `sendNotification` accodano per default; solo il worker invoca direttamente il provider.

## Runbook

1. controllare `notificationMetrics` nella readiness admin;
2. se `deadLetters > 0`, filtrare `notification_delivery_queue` per `status='dead_letter'` e correggere `last_error`;
3. non reinviare modificando l'idempotency key: riportare consapevolmente il record a `failed`, impostare `next_attempt_at` e conservare `attempts`;
4. verificare `provider_message_id` per ogni record `sent`;
5. una consegna e' conclusa soltanto con webhook `delivered` oppure `dead_letter`;
6. sospendere il cron se errori provider o dead-letter superano le soglie operative.

## Residuo remoto

Applicare la migrazione in staging, configurare `NOTIFICATION_WEBHOOK_SECRET`, eseguire una consegna reale e acquisire il webhook del provider. M10 non e' chiuso per la release finche' `O23` non e' provato end-to-end.

## Verifiche locali

- type-check verde;
- test rollout/observability 13/13;
- suite release 318/318;
- audit debito release: zero voci M10 e zero voci non classificate;
- build produzione: 149 pagine.
