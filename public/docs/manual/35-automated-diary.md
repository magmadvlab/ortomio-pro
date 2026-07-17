# Diario automatico

[← Indice](./README.md)

**Stato:** beta.

Job autenticati e idempotenti possono registrare meteo, monitoraggi e promemoria. Il diario canonico usa record persistiti con garden, fonte, timestamp e lineage. Fallimenti e retry sono osservabili.

L'automazione dipende da cron configurati e dallo schema remoto. In assenza dei prerequisiti non va considerata attiva. Il diario conserva osservazioni e attività; non trasforma automaticamente una previsione in un fatto eseguito.
