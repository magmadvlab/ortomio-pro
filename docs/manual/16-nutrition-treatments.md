# Nutrizione e Trattamenti

[← Torna all'Indice](./README.md)

---

## Panoramica

Modulo operativo per pianificare, eseguire e consultare attività nutrizionali e trattamenti, con persistenza reale su più registri e alcune parti ancora di supporto o legacy.

**Percorso**: Sidebar → "Nutrizione & Trattamenti"

---

## Stato modulo

**Stato attuale**: operativo con confini espliciti.

La parte consolidata oggi è:
- gestione di prodotti fertilizzanti e prodotti trattamento su tabelle dedicate
- planner trattamenti persistito su `nutrition_treatments`
- schedule nutrizionali persistite su `nutrition_schedules`
- inventario prodotti e movimenti scorta
- registro professionale trattamenti fitosanitari su `treatment_register`
- export operativo dei trattamenti registrati
- analytics e dashboard basati sui record disponibili

Restano da non comunicare come chiusi:
- motore scientifico completo per dosi, fabbisogni e asportazioni
- database fitofarmaci ufficiale, completo e automaticamente aggiornato
- verifica LMR/residui end-to-end
- compliance certificativa automatica
- quaderno di campagna ufficiale garantito in formato normativo
- VRT nutrizionale con catena campo-macchina-esito completamente chiusa

---

## Cosa è disponibile ora

- dashboard nutrizione e trattamenti
- gestione prodotti e inventario
- creazione, aggiornamento, completamento e cancellazione di trattamenti pianificati
- stati trattamento `planned / in_progress / completed / cancelled / postponed`
- registrazione di dose, metodo, data pianificata, data effettiva, operatore, attrezzatura, condizioni e note quando il flusso li raccoglie
- aggiornamento scorte quando un trattamento viene completato dal planner
- registro professionale trattamenti via API, con coltura, prodotto, principio attivo, dose, area trattata, metodo, motivazione, meteo, operatore e note
- campi BIO/convenzionale/integrato sul registro professionale, con supporto a compatibilità biologica
- export CSV/PDF come supporto gestionale

---

## Registri persistenti

### Planner nutrizione e trattamenti

Il workspace principale usa `advancedNutritionService` e salva su:
- `fertilizer_products`
- `treatment_products`
- `nutrition_treatments`
- `nutrition_schedules`
- `product_inventory`
- `stock_movements`
- `treatment_history`
- `compliance_records`

Questo blocco è il registro operativo del modulo `Nutrizione & Trattamenti`. Serve per pianificare, completare, analizzare e collegare uso prodotti e scorte.

### Registro trattamenti professionale

La route `/api/treatments` usa `treatment_register`. Questo registro è separato dal planner avanzato e rappresenta il registro professionale fitosanitario più vicino al quaderno campagna operativo.

Campi principali:
- coltura
- data trattamento
- prodotto
- principio attivo
- dose e unità
- area trattata
- metodo
- motivo
- condizioni meteo
- operatore
- note
- riferimenti a giardino, zona, filari o aiuole quando disponibili

### Componenti legacy

Alcuni componenti phyto usano ancora `services/treatmentRegistryService.ts`, che salva in `localStorage`. Questi flussi sono supporto browser/legacy e non sono la fonte autorevole del quaderno campagna.

---

## Compliance e sicurezza

### Quaderno di campagna

Ortomio può raccogliere record operativi utili alla ricostruzione dei trattamenti e all'esportazione di supporto.

Non va però presentato come quaderno di campagna ufficiale completo: formato, validità normativa, firma, controlli obbligatori e conservazione legale devono essere verificati fuori dal prodotto o implementati come lavoro dedicato.

### BIO e certificazioni

Il registro professionale include campi `treatment_type`, `organic_approved`, `certification_compliance`, `registration_number` e `pre_harvest_interval_days`.

La migrazione BIO/tradizionale aggiunge un controllo di compatibilità con certificazioni biologiche attive. Questo è un supporto interno: non sostituisce etichetta prodotto, autorizzazioni, disciplinari, organismo di controllo o consulenza professionale.

### GlobalG.A.P. e compliance records

`compliance_records` e le strutture GlobalG.A.P. sono workspace di readiness e supporto documentale. Possono aiutare a organizzare evidenze, ma non certificano automaticamente l'azienda.

### Residui, LMR e DPI

Il sistema può registrare tempi di carenza e dati prodotto quando disponibili. Non esiste oggi una verifica globale e validata di:
- LMR per coltura, prodotto e mercato
- residui effettivi
- DPI obbligatori
- formazione operatori
- limiti per export o disciplinari specifici

Questi controlli richiedono fonti normative/professionali aggiornate.

---

## Analytics disponibili

Le analytics attuali usano i trattamenti completati e i dati già presenti nel database per calcolare:
- numero trattamenti nel periodo
- costo totale e costo medio
- efficacia media quando valorizzata
- ripartizione per tipologia
- percentuale trattamenti marcati come conformi BIO
- suggerimenti operativi basati sui record disponibili
- alert scorte basse

Questi indicatori sono gestionali. Non sono audit scientifici, prove di efficacia registrativa o validazioni normative.

---

## Limiti attuali

- il planner e il registro professionale sono due superfici persistenti distinte
- alcuni flussi legacy restano localStorage
- non tutte le viste storiche sono rifinite o collegate allo stesso registro
- il calcolo dosi resta assistivo
- le informazioni su prodotti e principi attivi dipendono dai dati inseriti o disponibili nel sistema
- export e report sono supporto operativo, non modulistica ufficiale garantita

---

## Backlog tracciato

Da trattare come sviluppo futuro, non come funzionalità già chiusa:
- unificazione o riconciliazione tra `treatment_register` e `nutrition_treatments`
- formato ufficiale quaderno campagna con regole di validazione dedicate
- fonti normative aggiornate per prodotti autorizzati, etichette, LMR e DPI
- workflow completo per residui, campioni e analisi laboratorio
- VRT nutrizionale end-to-end con prescription map, macchina, esecuzione e verifica outcome
- integrazioni attrezzature, sensori, laboratori e servizi meteo avanzati

---

[← Torna all'Indice](./README.md) | [Prossimo: Lavorazioni Meccaniche →](./17-mechanical-operations.md)
