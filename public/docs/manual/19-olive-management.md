# Gestione Oliveto

[← Torna all'Indice](./README.md)

---

## Panoramica

Il modulo Oliveto è un verticale operativo costruito sopra le fondazioni frutteto e piante legnose, con alcune estensioni specialistiche per maturazione olive e monitoraggio mosca. È reale come superficie di lavoro, ma oggi resta ibrido tra persistenza condivisa e widget specialistici non ancora completamente collegati al backend.

**Percorso**: Sidebar → "Oliveto"

---

## Stato modulo

**Stato attuale**: verticale ibrido orchard-backed.

La parte consolidata oggi è:
- route `/app/olives`
- risoluzione dei contesti olivo da giardini/frutteti
- riuso di `orchardService` per configurazioni, alberi, potature e raccolte
- gestione alberi e operazioni tramite componenti frutteto condivisi
- integrazione con task olivo e lavorazioni meccaniche quando presenti
- migrazioni per `olive_maturity_tracking`, `olive_fly_traps` e `olive_fly_monitoring`

La parte ancora non pienamente chiusa è:
- widget maturazione olive e mosca olearia con stato locale/sample-style nella UI corrente
- collegamento uniforme dei widget specialistici alle tabelle olive dedicate
- workflow DOP/IGP, qualità olio, molitura, stoccaggio e commercializzazione
- tracciabilità bottiglia/lotto e blockchain end-to-end

---

## Cosa è disponibile ora

Puoi usare il modulo per:
- lavorare su oliveti configurati come frutteti/impianti legnosi
- gestire alberi, potature e raccolte attraverso il core frutteto
- vedere sintesi su oliveti, alberi, criticità e raccolte programmate
- consultare strumenti specialistici per indice di Jaén e mosca olearia
- usare task, registri, irrigazione e trattamenti generali come supporto operativo

---

## Maturazione e mosca olearia

Il database prevede tabelle per:
- maturazione olive
- trappole mosca
- monitoraggi mosca e soglie operative

La UI specialistica corrente però non va trattata come workflow persistente completamente consolidato finché il collegamento ai dati reali non è uniforme. Le letture mostrate o inserite nei widget vanno considerate supporto operativo/assistivo se non risultano salvate nel backend.

---

## Certificazioni e qualità olio

BIO e GlobalG.A.P. vanno gestiti attraverso i moduli certificazioni già descritti nei capitoli dedicati.

Il modulo Oliveto non sostituisce:
- disciplinari DOP/IGP
- organismo di controllo
- analisi chimiche ufficiali
- panel test
- gestione frantoio
- HACCP o tracciabilità commerciale completa

---

## Uso consigliato

Usa il modulo per:
- organizzare oliveti e alberi
- pianificare potature e raccolte
- leggere indicatori operativi da record reali
- usare maturazione e mosca come supporto agronomico specialistico
- preparare dati utili per consulente o registri tecnici

Non usarlo come:
- piattaforma completa olio dal campo alla bottiglia
- workflow DOP/IGP ufficiale
- sistema automatico di difesa olearia
- controllo qualità olio certificato
- tracciabilità commerciale completa

---

## Backlog tracciato

Da trattare come sviluppo futuro:
- collegare i widget olive alle tabelle `olive_*`
- consolidare storico reale di maturazione e mosca
- collegare trattamenti consigliati a registri operativi persistenti
- definire se qualità olio/frantoio/DOP diventano un dominio prodotto separato
- integrare tracciabilità lotti solo se supportata da flussi reali

---

[← Torna all'Indice](./README.md)
