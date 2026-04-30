# GUIDA BIO: READINESS INTERNA

[← Torna alle Certificazioni](./04-certifications.md) | [← Torna all'Indice](./README.md)

---

## STATO REALE

Questa guida descrive il supporto BIO oggi disponibile in Ortomio: un percorso di raccolta dati e readiness interna, persistito nel database.

Non e una guida normativa completa, non sostituisce l'organismo di certificazione e non produce da sola una certificazione biologica ufficiale.

**Percorso**: Sidebar -> **"Certificazioni"** -> tab **"Certificazione Biologica"**

---

## COSA FA IL MODULO

Il form BIO consente di registrare:
- dati azienda e organismo di certificazione
- numero certificato, date e scadenza quando disponibili
- superfici totali, biologiche, in conversione e convenzionali
- zone tampone e larghezza dichiarata
- pratiche non compatibili dichiarate dall'operatore
- tracciabilita, separazione biologico/convenzionale e registri di produzione
- date ispezione, non conformita e azioni correttive

Il record viene salvato su `bio_certifications` e ricaricato tramite `bio_certifications_with_readiness`.

---

## READINESS SCORE

Lo score e un indicatore operativo interno, non un giudizio ufficiale.

La logica considera:
- dati aziendali: fino a 20 punti
- produzione e zone tampone: fino a 20 punti
- pratiche agricole dichiarate: fino a 30 punti
- tracciabilita e separazione: fino a 20 punti
- controlli/ispezioni: fino a 10 punti

La vista database aggiunge uno stato di readiness indicativo:
- `ready` se lo score e almeno 80
- `partially_ready` se lo score e almeno 60
- `not_ready` sotto 60 o senza dati sufficienti

---

## COSA RESTA FUORI

Oggi non sono chiusi come workflow ufficiale:
- invio pratica a organismi di certificazione
- verifica legale automatica dei requisiti BIO
- gestione documentale completa e validata per audit esterno
- firma, protocollazione o approvazione ufficiale
- garanzia che i dati dichiarati siano sufficienti per superare un audit

Queste parti restano da trattare come TODO di prodotto o come processo esterno seguito da consulente/ente certificatore.

---

## USO CONSIGLIATO

Usa questa sezione per preparare e mantenere una fotografia aggiornata della readiness BIO dell'orto o azienda.

Per audit, rinnovi o presentazioni ufficiali, usa i dati come supporto istruttorio e verifica sempre con professionista o organismo competente.

---

[← Torna alle Certificazioni](./04-certifications.md) | [← Torna all'Indice](./README.md)
