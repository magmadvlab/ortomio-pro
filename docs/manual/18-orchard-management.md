# Gestione Frutteto

[← Torna all'Indice](./README.md)

---

## Panoramica

Il modulo Frutteto è un verticale reale per gestire configurazioni di impianto, alberi, potature, raccolte e alcune analisi operative. È un prodotto specializzato DB-backed, ma non va descritto come piattaforma completa di robotica, computer vision, post-raccolta commerciale o precision orchard totalmente automatizzata.

**Percorso**: Sidebar → "Frutteto"

---

## Stato modulo

**Stato attuale**: operativo come verticale frutteto con analytics parziali.

La parte consolidata oggi è:
- route `/app/orchard`
- servizio `orchardService`
- configurazioni frutteto su `orchard_configurations`
- alberi su `orchard_trees`
- gestione alberi, potature e raccolte tramite componenti dedicati
- calcolo densità impianto come supporto decisionale
- tracking resa per pianta quando i dati sono presenti
- collegamento a zone, filari e posizione dell'albero quando disponibili

Non va presentato come già chiuso:
- database varietale ufficiale completo per tutte le specie
- rilevamento automatico fenologico da immagini
- conteggio automatico fiori/frutti da drone o computer vision
- robot potatura/raccolta/diradamento
- grading automatico commerciale dei frutti
- gestione post-raccolta, packaging, canali vendita o ROI varietale garantito

---

## Cosa è disponibile ora

Il modulo può supportare:
- creazione/configurazione frutteto
- gestione alberi individuali nel frutteto
- filtri per varietà, salute, vigore e necessità di potatura/trattamento
- import massivo alberi dove previsto dal servizio
- pianificazione o registrazione di potature e raccolte
- dashboard con conteggi e indicatori derivati dai record disponibili
- calcolo densità e sesti come strumento assistivo

---

## Relazione con piante individuali

Gli alberi del frutteto sono un dominio specialistico rispetto alle piante individuali generiche.

Quando esistono record su albero, il frutteto può dare una vista più precisa di:
- posizione nella fila
- varietà
- stato salute
- vigore
- necessità operative
- resa o raccolta legata all'albero

Non ogni pianta generica ha automaticamente lo stesso livello di storico frutteto.

---

## Analytics

Le analytics frutteto sono utili quando esistono dati reali di alberi, potature, raccolte e qualità.

Sono indicatori gestionali, non prove commerciali o modelli predittivi universali. La qualità delle sintesi dipende dalla copertura dei record inseriti.

---

## Uso consigliato

Usa il modulo per:
- strutturare un frutteto reale
- mantenere anagrafica e stato degli alberi
- pianificare o registrare operazioni specifiche
- leggere resa e criticità per albero quando disponibili
- preparare decisioni operative con supporto dei registri

Non usarlo come:
- sistema robotico o computer-vision
- piattaforma completa post-raccolta/commerciale
- fonte unica di previsioni economiche o qualità commerciale
- certificazione di precision orchard management end-to-end

---

## Backlog tracciato

Da trattare come sviluppo futuro:
- integrazione stabile con immagini e conteggi automatici
- outcome qualità/raccolta più sistematici per albero
- collegamento più forte con prescription maps e operazioni di campo
- eventuale gestione post-raccolta come modulo dedicato
- analytics pluriennali solo quando la base dati è sufficientemente popolata

---

[← Torna all'Indice](./README.md)
