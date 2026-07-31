# Gestione Oliveto

[← Torna all'Indice](./README.md)

---

## Panoramica

Il modulo Oliveto è un verticale operativo costruito sopra le fondazioni frutteto e piante legnose, con estensioni specialistiche per maturazione olive, monitoraggio mosca olearia e gestione filari. È reale come superficie di lavoro: dal 30/07/2026 anche i widget specialistici scrivono e leggono su tabelle reali, non più su stato locale.

**Percorso**: Sidebar → "Oliveto"

---

## Stato modulo

**Stato attuale**: verticale orchard-backed, con persistenza reale su tutte le viste principali.

La parte consolidata oggi è:
- route `/app/olives`
- risoluzione dei contesti olivo da giardini/frutteti
- riuso di `orchardService` per configurazioni, alberi, potature e raccolte
- gestione alberi e operazioni tramite componenti frutteto condivisi
- integrazione con task olivo e lavorazioni meccaniche quando presenti
- tab **Filari**: raggruppamento alberi per fila, allineamento filari legacy, configurazione dell'impianto irriguo per singolo filare (stessa vista gia' disponibile sul Frutteto)
- tab **Maturazione**: letture Indice di Jaen persistite su `olive_maturity_tracking`, storico reale, raccomandazione di raccolta derivata dall'indice inserito
- tab **Mosca Olearia**: ispezioni trappola persistite su `olive_fly_traps`/`olive_fly_monitoring`, soglie di intervento calcolate sulle catture reali

**Verifica ancora aperta**: la migrazione che crea le tabelle `olive_maturity_tracking`/`olive_fly_traps`/`olive_fly_monitoring` non risulta confermata come applicata sul progetto Supabase di produzione. Se non e' stata applicata, le due viste falliranno nel salvataggio — verificarlo prima di considerarle operative in produzione.

La parte ancora non pienamente chiusa è:
- workflow DOP/IGP, qualità olio, molitura, stoccaggio e commercializzazione
- tracciabilità bottiglia/lotto e blockchain end-to-end

---

## Cosa è disponibile ora

Puoi usare il modulo per:
- lavorare su oliveti configurati come frutteti/impianti legnosi
- gestire alberi, potature e raccolte attraverso il core frutteto
- gestire i filari e l'impianto irriguo per filare
- vedere sintesi su oliveti, alberi, criticità e raccolte programmate
- registrare e consultare letture reali di maturazione (Indice di Jaen) e mosca olearia, con storico persistito
- usare task, registri, irrigazione e trattamenti generali come supporto operativo

---

## Maturazione e mosca olearia

Le due viste specialistiche persistono ora su tabelle reali:
- **Maturazione**: ogni lettura salvata include indice di Jaen, invaiatura (%), note; lo stadio colore e la raccomandazione di raccolta sono derivati dall'indice con una mappatura documentata, non inventati.
- **Mosca Olearia**: ogni ispezione crea o riusa una trappola per numero e registra le catture; il livello di rischio e l'azione raccomandata usano le stesse soglie mostrate nella guida in pagina.

Restano da compilare a mano (non stimati automaticamente): tipo di trappola specifico, stima erogatori/portata per filari senza impianto configurato.

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

Chiuso il 30/07/2026: collegamento widget olive alle tabelle `olive_*`, storico reale di maturazione e mosca.

Da trattare come sviluppo futuro:
- verificare che la migrazione `olive_*` sia applicata sul progetto Supabase di produzione
- collegare trattamenti consigliati a registri operativi persistenti
- definire se qualità olio/frantoio/DOP diventano un dominio prodotto separato
- integrare tracciabilità lotti solo se supportata da flussi reali

---

[← Torna all'Indice](./README.md)
