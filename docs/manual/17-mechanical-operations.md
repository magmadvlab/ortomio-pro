# Lavorazioni Meccaniche

[← Torna all'Indice](./README.md)

---

## Panoramica

Modulo per registrare lavorazioni meccaniche eseguite o pianificate, con un registro operativo persistente e integrazione nei flussi task-aware più recenti.

**Percorso**: Sidebar → "Lavorazioni"

---

## Stato modulo

**Stato attuale**: operativo come registro, non come piattaforma telematica.

La parte consolidata oggi è:
- route dedicata `/app/mechanical-work`
- API `/api/mechanical-work` con lettura e scrittura su `mechanical_work_register`
- registrazione di tipo lavorazione, data, area, profondità, attrezzatura, meteo, operatore e note
- riferimenti a giardino, zona, filari e aiuole quando disponibili
- collegamento con task sorgente nei flussi planner-aware già coperti
- presenza nello storico operazioni insieme a irrigazioni, fertilizzazioni, trattamenti e raccolte

Non va presentato come già chiuso:
- tracking GPS real-time delle macchine
- telematica John Deere, Case IH, New Holland, Fendt, Claas o simili
- auto-steer, guidance system e controllo automatico passate
- fleet management multi-macchina
- manutenzione predittiva o diagnosi remota
- ottimizzazione AI completa della campagna meccanica

---

## Cosa è disponibile ora

Il registro meccanico permette di salvare:
- tipo lavorazione
- data lavorazione
- area lavorata
- profondità
- attrezzatura e attrezzo specifico
- metadati lavorazione
- condizioni meteo
- operatore
- note
- zona, filari o aiuole quando il flusso li fornisce

I tipi lavorazione includono operazioni di suolo, preparazione terreno, tecniche conservative, chioma e operazioni generali.

Le attrezzature supportate coprono trattore, attrezzi trainati, piccoli mezzi, attrezzi elettrificati e manuale.

---

## Registro persistente

La fonte DB-backed è `mechanical_work_register`.

La tabella nasce per il tracking operativo professionale e conserva i campi principali necessari a ricostruire una lavorazione. L'accesso è protetto da RLS per utente.

La API `/api/mechanical-work`:
- richiede tier PRO quando Supabase è disponibile
- valida i tipi lavorazione supportati
- valida i tipi attrezzatura supportati
- inserisce record reali su `mechanical_work_register`
- in locale senza Supabase simula la risposta per consentire lo sviluppo UI

---

## Relazione con planner e precision chain

Nei flussi più recenti una lavorazione può essere aperta da un task agronomico e mantenere il riferimento al task sorgente. Questo la rende utile come evidenza operativa dentro la catena:

`segnale / raccomandazione → task → lavorazione registrata → storico operazioni`

La catena non è ancora:

`prescription map → macchina con import VRT → esecuzione automatica telemetrica → outcome misurato`

Per ora la lavorazione meccanica è quindi una chiusura operativa manuale o task-aware, non una prova telematica automatica.

---

## Uso consigliato

Usa il modulo per:
- registrare lavorazioni eseguite
- indicare area, profondità e attrezzatura
- collegare operazioni a zone, filari o aiuole
- mantenere uno storico operativo consultabile
- dare evidenza a task agronomici già pianificati

Non usarlo come:
- sistema di fleet tracking
- registro automatico da macchina
- prova GPS di copertura
- manutenzione macchine completa
- integrazione diretta con console agricole o Operations Center

---

## Limiti attuali

- alcune funzioni helper in `mechanicalWorkService` sono ancora mock o sequenze predefinite
- la route API è la parte persistente più affidabile per il registro
- non sono verificate integrazioni con macchine reali o provider telematici
- non c'è misurazione automatica di sovrapposizioni, gap, consumi o qualità spaziale
- l'ottimizzazione economica e la manutenzione restano fuori dal perimetro chiuso

---

## Backlog tracciato

Da trattare come lavoro futuro:
- riconciliare helper/service mock con la fonte `mechanical_work_register`
- aggiungere import/export tecnico se richiesto da macchine reali
- collegare prescription maps a lavorazioni meccaniche con esito applicato
- tracciare copertura, passate, overlap e gap solo quando esiste una fonte GPS/telematica reale
- introdurre manutenzione e costi macchina come modulo dedicato, non come promessa implicita del registro

---

[← Torna all'Indice](./README.md) | [Prossimo: Gestione Frutteto →](./18-orchard-management.md)
