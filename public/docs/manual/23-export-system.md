# Sistema export

[← Indice](./README.md)

**Stato:** beta.

Gli endpoint professionali generano CSV stabile e PDF binario paginato per un singolo garden autorizzato. Le celle CSV potenzialmente interpretabili come formule vengono neutralizzate. Ogni export sensibile richiede un audit persistito; se l'audit fallisce, il file non viene consegnato.

Non esistono fallback mock nelle route regolatorie. Il contenuto riflette soltanto i record disponibili e non certifica completezza normativa.
