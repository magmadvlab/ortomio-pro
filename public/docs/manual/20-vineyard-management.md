# Gestione Vigneto

[← Torna all'Indice](./README.md)

---

## Panoramica

Il modulo Vigneto è un verticale reale per configurare vigneti, gestire ceppi, monitorare carico gemme e seguire alcune operazioni viticole. È più maturo di una semplice pagina descrittiva, ma non è una suite cantina/market intelligence o un sistema completo dalla vigna al vino.

**Percorso**: Sidebar → "Vigneto"

---

## Stato modulo

**Stato attuale**: operativo come verticale vigneto con confini espliciti.

La parte consolidata oggi è:
- route `/app/vineyard`
- servizio `vineyardService`
- configurazioni vigneto su `vineyard_configurations`
- ceppi/viti su `vineyard_vines`
- dashboard, wizard e gestione viti
- filtri per varietà, salute, vigore e necessità operative
- bulk creation di viti
- servizio `vineyardBudLoadService`
- calcolo e storico Ravaz/carico gemme quando i dati sono presenti

Non va presentato come già chiuso:
- database ampelografico ufficiale completo
- integrazione cantina o ERP vinicolo
- mercato vino, pricing e marketing intelligence
- vinificazione, fermentazioni, blend e tracciabilità bottiglia
- microzonazione automatica completa
- previsioni ML validate di resa/qualità per ogni vigneto

---

## Cosa è disponibile ora

Il modulo può supportare:
- creazione/configurazione vigneto
- gestione viti/ceppi individuali
- informazioni su varietà, portinnesto, sistema allevamento e posizione quando valorizzate
- stato salute, vigore e necessità di potatura/trattamento
- indicatori dashboard basati sui record disponibili
- calcolo densità come supporto
- Ravaz index e suggerimenti sul carico gemme tramite servizio dedicato
- maturazione uva come supporto operativo se il flusso raccoglie i dati

---

## Carico gemme e maturazione

`vineyardBudLoadService` consente di calcolare:
- indice di Ravaz
- equilibrio vegeto-produttivo indicativo
- carico gemme consigliato
- trend storico quando esistono record per più stagioni

Questi calcoli sono supporto agronomico interno. Non sostituiscono rilievi professionali, campionamenti di laboratorio o decisioni enologiche.

---

## Fuori perimetro attuale

Restano fuori dal perimetro chiuso:
- gestione cantina
- conferimento, pigiatura, fermentazione e affinamento
- analisi fenolica/aromatica di laboratorio come workflow completo
- vendita vino, canali commerciali e premium pricing
- integrazione ERP/contabilità vinicola
- certificazioni denominazione o tracciabilità bottiglia end-to-end

---

## Uso consigliato

Usa il modulo per:
- strutturare un vigneto
- gestire anagrafica e stato delle viti
- monitorare carico gemme e alcune metriche viticole
- pianificare o seguire operazioni agronomiche
- preparare dati utili per consulenza viticola

Non usarlo come:
- sistema cantina
- piattaforma commerciale vino
- fonte unica per scelte enologiche o mercato
- motore predittivo validato di qualità del vino

---

## Backlog tracciato

Da trattare come sviluppo futuro:
- collegare più stabilmente maturazione, raccolta e outcome qualità
- aumentare copertura persistente delle operazioni viticole specialistiche
- decidere se cantina e denominazioni sono domini prodotto separati
- integrare eventuali analisi laboratorio solo con fonti e workflow reali
- evitare promesse di mercato/ROI finché non esistono dati verificabili

---

[← Torna all'Indice](./README.md)
