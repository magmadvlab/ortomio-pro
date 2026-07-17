# Smart Hub

[← Indice](./README.md)

**Stato:** beta.

Telemetria e dispositivi sono autorizzati e persistiti. I comandi seguono un lifecycle con idempotenza, tentativi limitati, timeout, dead letter e audit. Stato richiesto, inviato e confermato restano distinti.

Un comando non è considerato fisicamente eseguito finché non arriva un ack o una misura coerente. Automazioni non presidiate e compatibilità universale hardware non sono garantite. L'attivazione richiede provider smoke, pilot e rollback verificato.
