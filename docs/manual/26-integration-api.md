# Integrazioni e API

[← Indice](./README.md)

**Stato:** API interne; nessun contratto pubblico stabile.

Le route Next.js servono app, cron, device e provider. Autenticazione utente, ruolo Admin, ownership garden/organizzazione, secret cron e token device sono verificati server-side secondo il tipo di endpoint.

Non esistono developer portal, SDK o SLA pubblici. Sentinel e ThingsBoard sono provider opzionali; la loro assenza produce capability non disponibile. Le credenziali restano server-side e non sono mostrate nelle risposte di health.
