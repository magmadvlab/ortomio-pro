# Piante individuali

[← Indice](./README.md)

**Stato:** operativo locale con capability attiva.

Anagrafica, operazioni singole e bulk e segnali salute usano persistenza cloud. I writer critici non ripiegano silenziosamente sul browser. Le operazioni bulk sono idempotenti e non modificano automaticamente la salute senza osservazione o outcome.

La disponibilità effettiva dipende dalle tabelle e dalle policy RLS dello staging. Controlla sempre garden, filare e pianta prima di registrare un intervento.
