# ORTOMIO: STATO REALE DELL'APPLICAZIONE, SCOPO E CAPACITA VERIFICATE DAL CODICE (2026-04-18)

## Scopo del documento
Questo documento serve come riferimento operativo aggiornato su cosa OrtoMio sia oggi, a cosa serva e cosa sia realmente in grado di fare.

Regola di redazione:
- solo evidenze verificabili nel codice del repository locale
- nessun claim commerciale o funzionale non dimostrabile dal codice
- distinzione esplicita tra moduli operativi, moduli parziali e strumenti interni/supporto

Questo documento deve essere considerato piu affidabile dei documenti piu vecchi che avevano un taglio piu strategico o visionario.

## Metodo di analisi
La classificazione usata in questo documento e:

- `operativa`: route esposta, componente principale collegato, base storage/servizi concreta
- `parziale`: route e UI esistono, ma nel codice sono presenti mock, simulazioni, placeholder o TODO strutturali
- `interna/supporto`: pagina utile a sviluppo, migrazione, test, admin o documentazione, non da presentare come funzione core per l'utente finale

## In una frase
OrtoMio oggi e una web app agricola professionale costruita come sistema operativo di gestione colturale e decisionale per:
- orti e pieno campo
- piante individuali
- vivai e semenzai
- frutteti, oliveti e vigneti
- irrigazione, nutrizione, raccolta e diario operativo
- moduli di precision agriculture
- automazione smart / IoT
- analytics, export e compliance

## Scopo dell'applicazione
Dal codice emerge che OrtoMio non e pensato come semplice agenda agricola.

Lo scopo reale oggi e:
- modellare il contesto agricolo: orti, giardini, zone, filari, piante, colture specializzate
- pianificare attivita e trasformare suggerimenti in task eseguibili
- registrare esecuzioni reali e outcome osservati
- supportare decisioni agronomiche con servizi dedicati
- collegare operativita, monitoraggio, qualita, storico ed export

In termini pratici, OrtoMio serve a centralizzare il lavoro quotidiano di gestione agricola in un'unica applicazione.

## Architettura verificata dal codice
### Stack applicativo
- frontend web in Next.js 16
- React 19
- TypeScript

### Persistenza dati
- provider cloud Supabase
- fallback locale via localStorage
- selezione automatica provider in `packages/core/storage/factory.ts`

### Modello di prodotto
- l'app e oggi trattata come `PRO-only`
- il tier hook restituisce sempre PRO
- molte feature storicamente separate per piano sono ormai considerate sempre disponibili a livello tier

### Feature flags
- esiste comunque un layer separato di feature flags in `config/features.ts`
- alcune route o sottosistemi restano attivi/disattivi via flag anche se il tier e sempre PRO

## Perimetro funzionale reale
### 1. Contesto aziendale e strutture colturali
Stato: `operativa`

Capacita verificate:
- creazione e gestione orti/giardini con wizard
- selezione orto attivo e dashboard centrale
- gestione hub orto per pieno campo
- gestione filari di campo aperto
- gestione zone terreno
- supporto a diversi tipi di giardino e sistemi colturali

Evidenze principali:
- route `app/app/page.tsx`
- route `app/app/garden/page.tsx`
- route `app/app/garden/rows/page.tsx`
- route `app/app/garden/zones/page.tsx`
- wizard e gestione in `components/GardenTypeWizard.tsx`
- servizi `services/landZoneService.ts`, `services/zoneMappingService.ts`

Ruolo nel sistema:
- questo e il livello base che struttura tutto il resto
- molte altre funzioni dipendono da giardino, zona, filare o pianta

### 2. Planner e orchestrazione task
Stato: `operativa`

Capacita verificate:
- planner modulare con tab dedicate
- smart planner
- task calendar
- task list
- suggerimenti AI nel planner
- rotazione colturale
- biological control dashboard
- persistenza task e aggiornamento outcome
- task-aware launch verso moduli di esecuzione
- task agronomici con snapshot decisionale e metadati contestuali persistiti nelle note tecniche
- summary operativo nel planner per task agronomici: prontezza esecuzione, urgenza, confidence e segnali mancanti

Evidenze principali:
- route `app/app/planner/page.tsx`
- componenti `components/planner/SmartPlanner.tsx`
- componenti `components/planner/AgronomicQueueTaskPanel.tsx`
- componenti `components/planner/TaskList.tsx`
- servizi `services/taskCompletionHook.ts`
- servizi `services/agronomicQueueOutcomeService.ts`
- servizi `services/taskExecutionOrchestratorService.ts`
- servizi `services/agronomicQueueTaskService.ts`

Ruolo nel sistema:
- il planner e oggi una delle superfici centrali dell'app
- collega pianificazione, esecuzione e feedback
- per i task agronomici di nuova generazione, l'operatore vede gia prima del lancio parte del contesto decisionale che ha prodotto il task

### 3. Piante individuali, banca semi, vivaio e semenzaio
Stato: `operativa`

Capacita verificate:
- gestione piante individuali
- vista piante di un filare specifico
- banca semi
- gestione piantine
- gestione alberelli / saplings
- pagina dedicata semenzaio con tab semi, piantine e alberelli

Evidenze principali:
- route `app/app/plants/page.tsx`
- route `app/app/semenzaio/page.tsx`
- componenti `components/plants/SmartPlantManager.tsx`
- componenti `components/seedbank/SeedInventory.tsx`
- componenti `components/seedling/SeedlingDashboard.tsx`
- componenti `components/seedbank/SaplingDashboard.tsx`
- storage provider con metodi seed, seedling, sapling in `packages/core/storage/interface.ts`

Ruolo nel sistema:
- consente di lavorare sia a livello struttura generale sia a livello singola pianta

### 4. Diario operativo e viste cronologiche
Stato: `operativa` con aree `parziali`

Capacita verificate:
- diario operativo
- timeline unificata
- viewer del diario automatico
- route separata `/app/diary`
- route `/app/journal` dedicata al diario operativo con quick event modal

Parti parziali o ancora transitorie:
- nella route `/app/journal`, il salvataggio quick event e marcato con TODO e oggi non scrive davvero nel database
- nella route `/app/diary`, la vista calendario e dichiarata esplicitamente "in sviluppo"

Evidenze principali:
- route `app/app/diary/page.tsx`
- route `app/app/journal/page.tsx`
- componenti `components/diary/OperationalDiary.tsx`
- componenti `components/diary/UnifiedTimelineDiary.tsx`
- componenti `components/diary/AutomatedDiaryViewer.tsx`

Conclusione:
- il diario esiste davvero come area applicativa
- non va pero presentato come chiuso al 100% in tutte le sue sottofunzioni

### 5. Calendario agricolo
Stato: `parziale`

Capacita verificate:
- esiste una route calendario dedicata
- esiste un componente calendario con eventi mensili/lista
- scrittura e lettura da tabella `calendar_events`

Punti di attenzione:
- il componente e separato dal diary e dal planner
- la route usa un componente che va validato meglio prima di presentarlo come cuore stabile del prodotto
- il diario stesso dichiara ancora la propria vista calendario come futura

Evidenze principali:
- route `app/app/calendar/page.tsx`
- componente `components/calendar/IntegratedCalendar.tsx`

Conclusione:
- il calendario esiste, ma oggi va comunicato come area presente e non ancora completamente consolidata

### 6. Irrigazione
Stato: `operativa` con elementi `parziali`

Capacita verificate:
- gestione orti attivi per irrigazione
- caricamento zone irrigue e sistemi irrigui
- wizard per sistema di irrigazione
- log irrigazione
- dashboard professionale irrigazione
- suggerimenti AI irrigui
- collegamento con orchestrazione task
- measured feedback post-esecuzione

Evidenze principali:
- route `app/app/irrigation/page.tsx`
- componenti `components/irrigation/ProfessionalIrrigationDashboard.tsx`
- componenti `components/irrigation/IrrigationZoneManager.tsx`
- componenti `components/irrigation/WateringLogForm.tsx`
- servizi `services/advancedIrrigationService.ts`
- servizi `services/agronomicMeasuredFeedbackService.ts`

Parti parziali:
- il file di pagina contiene anche blocchi storici e strutture demo interne
- in `config/features.ts` alcuni subflag irrigazione avanzata risultano ancora disattivi:
  - `IRRIGATION_ZONES`
  - `IRRIGATION_SCHEDULING`
  - `IRRIGATION_ANALYTICS`

Conclusione:
- l'area irrigazione esiste ed e reale
- alcune sotto-capacita avanzate sono ancora in fase di allineamento tra base, feature flags e UI

### 7. Nutrizione e trattamenti
Stato: `operativa` con elementi `parziali`

Capacita verificate:
- dashboard nutrizione
- prodotti
- trattamenti
- analytics
- inventario
- task-aware bootstrap dal planner/orchestratore

Evidenze principali:
- route `app/app/nutrition/page.tsx`
- route `app/app/treatments/page.tsx`
- componenti `components/nutrition/ProfessionalNutritionDashboard.tsx`
- componenti `components/nutrition/ProductManager.tsx`
- componenti `components/nutrition/TreatmentPlanner.tsx`
- componenti `components/nutrition/InventoryManager.tsx`

Parti parziali:
- nella pagina nutrizione il caricamento delle treatment configs e simulato
- in `config/features.ts` risultano ancora disattivi alcuni subflag:
  - `NUTRITION_INVENTORY`
  - `NUTRITION_DOSE_CALCULATOR`
  - `NUTRITION_COMPATIBILITY`
- la route legacy `/app/treatments` e esplicitamente congelata e rimanda all'area nuova `/app/nutrition`

Conclusione:
- la sezione corretta oggi e Nutrizione & Trattamenti
- non va presentata come modulo completamente rifinito in tutte le sue parti avanzate

### 8. Salute colture e monitoraggio rischio
Stato: `operativa`

Capacita verificate:
- dashboard salute colture
- alert e classificazione severita
- contesto per pianta / vigneto / oliveto
- snapshot microclimatici
- scope insights salute
- uso di weather service e motori di monitoraggio salute

Evidenze principali:
- route `app/app/health/page.tsx`
- servizi `services/plantHealthMonitoringService.ts`
- servizi `services/healthMicroclimateService.ts`
- servizi `services/healthScopeService.ts`

Conclusione:
- la parte salute e una delle aree operative piu forti lato decision support

### 9. Raccolta e risultati di qualita
Stato: `operativa`

Capacita verificate:
- gestione raccolti
- bootstrap da task verso registrazione raccolta
- dashboard raccolti
- quality overview e quality learning usati negli analytics
- risultati di qualita persistibili a livello storage interface

Evidenze principali:
- route `app/app/harvest/page.tsx`
- componenti `components/harvest/HarvestDashboard.tsx`
- servizi `services/qualityResultsService.ts`
- storage methods quality results in `packages/core/storage/interface.ts`

Conclusione:
- raccolta e qualita sono presenti come flusso reale

### 10. Analytics applicativi
Stato: `operativa`

Capacita verificate:
- analytics di task, giardini e raccolti
- uso di `qualityResultsService`
- adaptive pricing basato su qualita
- learning snapshots agronomici

Evidenze principali:
- route `app/app/analytics/page.tsx`
- servizi `services/adaptiveMarketPricingService.ts`
- servizi `services/agronomicProfileLearningService.ts`

Conclusione:
- analytics esiste come modulo reale e data-driven
- il suo valore e piu solido della reportistica mock della pagina reports

### 11. Reportistica utente
Stato: `parziale`

Capacita verificate:
- esiste una route dedicata
- esistono layout, filtri e rendering report

Limite strutturale:
- la pagina usa esplicitamente `mockData`

Evidenze principali:
- route `app/app/reports/page.tsx`

Conclusione:
- la reportistica va considerata presente ma non ancora basata su dataset reali end-to-end

### 12. Export dati
Stato: `operativa`

Capacita verificate:
- export CSV
- export HTML-print come PDF semplice
- export di task, gardens e analytics derivati

Evidenze principali:
- route `app/app/export/page.tsx`

Conclusione:
- export utente esiste davvero
- e pero oggi di tipo generalista, non da presentare come sistema documentale avanzato completo

### 13. Certificazioni e compliance
Stato: `parziale`

Capacita verificate:
- dashboard certificazioni
- tab dedicate a bio, GlobalG.A.P., SQNPI, GRASP
- integrazione con `GlobalGapDashboard`
- form bio dedicata

Evidenze principali:
- route `app/app/certifications/page.tsx`
- componente `components/certifications/CertificationsDashboard.tsx`
- componente `components/compliance/GlobalGapDashboard.tsx`
- componente `components/certifications/BioCertificationForm.tsx`

Limiti verificabili:
- la dashboard certificazioni usa metadati e progress iniziali statici per diverse certificazioni
- quindi la parte esiste, ma non va raccontata come motore completo e uniformemente data-driven per tutte le certificazioni elencate

### 14. Precision agriculture
Stato: `operativa` con alcune parti `parziali`

Sotto-aree verificate:

### NDVI satellitare
Stato: `operativa`

Capacita verificate:
- dashboard NDVI
- trend storico
- analisi zone
- rilevazione stress
- collegamento con wizard di intervento
- dipendenza da configurazione Sentinel Hub

Evidenze principali:
- route `app/app/ndvi/page.tsx`
- componente `components/ndvi/NDVIDashboard.tsx`
- servizio `services/ndviSatelliteService.ts`

Nota:
- il modulo e reale ma dipende da credenziali/configurazione satellitare

### Prescription Maps
Stato: `operativa` con elementi `parziali`

Capacita verificate:
- dashboard mappe prescrizione
- caricamento mappe dal service
- statistiche
- esecuzione, variance, outcome, efficacy e intelligence summary
- revisione mappa
- export modal
- cost optimization panel
- historical comparison panel

Evidenze principali:
- route `app/app/prescription-maps/page.tsx`
- componente `components/prescription/PrescriptionMapsDashboard.tsx`
- servizio `services/prescriptionMapsService.ts`
- storage interface con prescription maps, execution records ed export records

Limiti verificabili:
- progress generation simulato nella dashboard
- preview mappa con TODO esplicito

Conclusione:
- il modulo esiste davvero e ha base dati reale
- alcune parti di UX/preview sono ancora transitorie

### Zone e filari precision-oriented
Stato: `operativa`

Capacita verificate:
- zone terreno
- filari
- storico filari
- predizioni filari
- suggerimenti rotazione e salute suolo

Evidenze principali:
- route `app/app/garden/zones/page.tsx`
- route `app/app/garden/rows/page.tsx`
- servizi `services/landZoneService.ts`
- servizi `services/fieldRowPredictiveService.ts`

### 15. Smart Hub e IoT
Stato: `operativa` con elementi `parziali`

Capacita verificate:
- caricamento dispositivi smart per garden
- analytics automazione dispositivi
- log automazione
- diagnostica scope irrigazione
- decisioni di automazione irrigua
- letture sensori associate a dispositivi

Evidenze principali:
- route `app/app/smart/page.tsx`
- componente `components/smart/IntegratedSmartHub.tsx`
- servizi `services/scopeIrrigationAutomationService.ts`
- servizi `services/smartDeviceAutomationAnalyticsService.ts`
- servizi `services/sensorDataService.ts`

Limiti verificabili:
- nel componente smart esistono anche blocchi simulati, ad esempio piani di volo drone mock

Conclusione:
- il nucleo IoT/automation esiste
- alcune sottosezioni restano ibride tra reale e simulato

### 16. Frutteto, oliveto e vigneto
Stato: `operativa`

Capacita verificate:
- dashboard dedicate per frutteto, oliveto e vigneto
- wizard di creazione configurazioni
- manager per alberi o viti
- potature
- raccolte / vendemmie
- integrazione con piante individuali
- contesti woody dedicati

Evidenze principali:
- route `app/app/orchard/page.tsx`
- route `app/app/olives/page.tsx`
- route `app/app/vineyard/page.tsx`
- componenti `components/orchard/*`
- componenti `components/vineyard/*`
- servizi `services/orchardService.ts`
- servizi `services/vineyardService.ts`
- servizi `services/woodyGardenResolverService.ts`

Conclusione:
- questi verticali non sono solo voci di menu
- hanno superfici applicative dedicate e integrate

### 17. Advice e suggerimenti
Stato: `parziale`

Capacita verificate:
- pagina dedicata
- tab overview, rotation, biological, AI suggestions, seasonal
- collegamenti a crop rotation planner e biological control dashboard

Limite strutturale:
- la pagina costruisce `mockAdvice` esplicito

Evidenze principali:
- route `app/app/advice/page.tsx`

Conclusione:
- area presente, ma non va presentata oggi come flusso completamente data-driven

### 18. AI predictions
Stato: `parziale`

Capacita verificate:
- route dedicata
- dashboard dedicata
- tab malattie, resa, risorse
- feature flag `AI_PREDICTIONS` attiva

Limite strutturale:
- la dashboard usa esplicitamente dati mock e contiene TODO per l'endpoint API

Evidenze principali:
- route `app/app/ai-predictions/page.tsx`
- componente `components/ai/predictions/AIPredictionsDashboard.tsx`

Conclusione:
- il modulo esiste come shell UI
- non va comunicato come sistema predittivo completo attivo end-to-end

### 19. Lavorazioni meccaniche
Stato: `parziale`

Capacita verificate:
- route dedicata
- form esecuzione lavori meccanici
- bootstrap task-aware
- creazione mechanical work su storage

Evidenze principali:
- route `app/app/mechanical-work/page.tsx`
- componente `components/mechanicalWork/MechanicalWorkLogForm.tsx`

Limiti verificabili:
- config lavori e attrezzature iniziali sono simulate nel file di pagina

Conclusione:
- la registrazione lavori esiste
- la parte di gestione attrezzature/configurazioni non e completamente consolidata

### 20. Impostazioni, documentazione, auth e supporto
Stato: `operativa`

Capacita verificate:
- auth pages
- reset password, register, login, privacy, terms
- settings con sezioni gardens, satellite, apikeys, organization, notifications, security, data, appearance
- help page con indicizzazione manuale
- docs manuali serviti via route

Evidenze principali:
- route `app/(auth)/*`
- route `app/app/settings/page.tsx`
- route `app/app/help/page.tsx`
- route `app/docs/manual/[slug]/page.tsx`

Conclusione:
- la documentazione e integrata nell'app
- i contenuti pero non sono necessariamente tutti allineati allo stato reale del codice

### 21. Pagine interne, tecniche o non core
Stato: `interna/supporto`

Route principali:
- `/app/admin`
- `/app/compare`
- `/app/compare/detailed`
- `/test`
- `/dashboard`

Uso reale:
- pannello admin
- confronto tra versioni
- pagina test
- dashboard semplice/storica

Queste non vanno raccontate come cuore funzionale dell'app per l'utente standard.

## Cosa OrtoMio puo essere presentato come capace di fare oggi
In termini comunicabili senza sovrastimare il prodotto, oggi OrtoMio puo essere descritto come:

- piattaforma web professionale per gestione operativa agricola multi-modulo
- sistema che modella orti, filari, zone, piante e colture specializzate
- planner operativo con task e passaggio verso esecuzione
- strumento per irrigazione, nutrizione, raccolta, diario operativo e monitoraggio salute
- piattaforma con verticali dedicati per frutteto, oliveto e vigneto
- applicazione con moduli concreti di precision agriculture: NDVI, zone/filari e prescription maps
- base applicativa per smart device e automazione irrigua
- sistema con analytics, export e superfici di compliance/certificazione

## Cosa non deve essere presentato come pienamente completato oggi
Le seguenti aree esistono nel codice, ma non devono essere comunicate come completamente mature o pienamente chiuse:

- AI Predictions end-to-end
- Advice data-driven end-to-end
- Reports basati su dati reali end-to-end
- Mechanical work equipment/config completamente data-driven
- Journal quick events persistiti davvero
- Vista calendario del diario come funzione completa
- Tutte le certificazioni come motori completi e uniformemente alimentati da dati reali
- Tutte le sotto-feature irrigazione/nutrizione avanzate come gia rifinite solo perche la route base esiste
- Smart Hub come area totalmente priva di simulazioni
- Prescription Maps preview completa lato UX

## Posizionamento corretto dell'applicazione ad oggi
La descrizione piu corretta, aderente al codice, e:

OrtoMio e oggi un'applicazione professionale di gestione agricola e supporto decisionale, con forte copertura su pianificazione, operativita, monitoraggio, colture specializzate e precision agriculture.

Non e solo un diario.
Non e solo una dashboard.
Non e solo una chat AI.

E un sistema applicativo ampio, gia utilizzabile su molte superfici operative reali, ma con maturita non uniforme tra tutti i moduli.

## Uso consigliato di questo documento
Da oggi questo documento dovrebbe essere usato come:
- base per aggiornare manuale utente e descrizione prodotto
- fonte primaria per allineare marketing, supporto e documentazione tecnica
- riferimento per distinguere tra funzioni realmente operative e funzioni ancora parziali
- base tecnica per derivare testi narrativi o stakeholder-facing, come `docs/reports/ORTOMIO_STAKEHOLDER_PRESENTATION_2026-04-18.md`

## Documento da superare
Il documento `docs/reports/ORTOMIO_PLATFORM_CAPABILITIES_2026-03-30.md` resta utile come lettura strategica, ma non dovrebbe piu essere usato da solo come fotografia dello stato attuale del prodotto.
