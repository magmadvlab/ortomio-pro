# Casi d'Uso e Template Operativi

I casi d'uso in questo capitolo sono esempi illustrativi, non prove di deployment reali e non success stories. Ogni scenario combina moduli esistenti con limiti espliciti; dove manca automazione guidata, il lavoro resta un TODO del master plan.

## Stato attuale

OrtoMio puo' supportare scenari operativi basati su moduli reali:

- pianificazione e registro attivita';
- trattamenti, nutrizione, irrigazione e lavorazioni;
- mappe NDVI e prescrizione;
- certificazioni/readiness con maturita' diversa per standard;
- Smart Hub e sensoristica con confini di automazione dichiarati;
- verticali frutteto, oliveto e vigneto con livelli di persistenza differenti.

## Template di scenario

### Azienda orticola operativa

Uso tipico: pianificare attivita', registrare interventi, monitorare colture, collegare osservazioni e mantenere storico operativo.

Moduli coinvolti:

- planner;
- diario/registro;
- trattamenti e nutrizione;
- irrigazione;
- analytics di base.

Limite: non e' un percorso automatico di certificazione o ROI; l'operatore deve validare dati, esecuzioni e risultati.

### Precision agriculture

Uso tipico: leggere mappe, generare o usare prescrizioni, pianificare interventi differenziati e registrare l'esecuzione.

Moduli coinvolti:

- NDVI e mappe;
- prescription maps;
- task planner;
- trattamenti/nutrizione;
- registri di esecuzione.

Limite: la catena non garantisce ancora piena chiusura VRT macchina-origin o telemetria di applicazione.

### Readiness certificazioni

Uso tipico: raccogliere dati, checklist e documentazione di supporto per prepararsi a controlli o audit.

Moduli coinvolti:

- BIO readiness DB-backed;
- GlobalG.A.P. workspace/checklist;
- trattamenti e quaderno operativo;
- registri e documenti.

Limite: OrtoMio supporta preparazione e organizzazione; non sostituisce ente certificatore, consulente normativo o chiusura ufficiale audit.

### Smart monitoring e irrigazione

Uso tipico: usare letture sensori, condizioni meteo e storico irriguo per decidere interventi piu' consapevoli.

Moduli coinvolti:

- Smart Hub;
- sensor readings;
- irrigation system;
- weather;
- analytics.

Limite: automazione fisica e comandi attuatori dipendono da hardware, provider e configurazioni non uniformemente chiuse.

### Verticali specializzati

Uso tipico: gestire parcelle, piante o filari con strumenti specialistici per frutteto, oliveto e vigneto.

Moduli coinvolti:

- orchard management;
- olive management;
- vineyard management;
- piante individuali dove applicabile;
- registri e raccolte.

Limite: ogni verticale ha maturita' propria; non tutti i widget specialistici sono persistiti o equivalenti a una piattaforma end-to-end.

## Promessa convertita in TODO

Il master plan traccia `T7-IMPLEMENT-03 use-case templates and deployment playbooks`: trasformare questi esempi in percorsi guidati dentro il prodotto, con checklist, prerequisiti, dati richiesti, limiti e stato di maturita'.
