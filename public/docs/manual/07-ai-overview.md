# AI OrtoMio

[← Torna all'Indice](./README.md)

---

## Stato attuale

L'AI in OrtoMio è un insieme di superfici assistive e predittive distribuite. Non è ancora un unico motore decisionale autonomo con memoria completa, validazione statistica uniforme e controllo operativo end-to-end.

La parte oggi più solida è dove l'AI o la logica predittiva si appoggia a dati già persistiti, contesto operativo verificabile e azioni confermate dall'utente. Le aree basate su dati parziali, fallback, simulazioni o integrazioni non ancora chiuse vanno lette come supporto decisionale.

---

## Mappa di maturità

| Area | Stato attuale | Nota operativa |
| --- | --- | --- |
| Chat AI globale | Reale, bounded | Usa una route AI backend con controlli di piano/crediti e contesto limitato. Non è ancora un agente con memoria durevole e azioni scriventi generalizzate. |
| Planner AI | Ibrido | Il planner ha flussi task-aware reali, ma la chat planner resta più assistiva e non chiude da sola tutta la pianificazione agronomica. |
| Predizioni AI | Ibrido | Esistono servizi predittivi e route dedicate, ma le superfici sono distribuite e non condividono ancora un unico contratto dati/validazione. |
| Director | Ibrido | Aggrega priorità e briefing da più segnali, ma non sostituisce un orchestratore autonomo con piena tracciabilità decisionale. |
| Diario automatico | Reale su meteo/ambiente | Il cron giornaliero e il diario ambientale sono DB-backed; la convergenza con tutti i registri operativi resta in evoluzione. |
| NDVI | Reale con fallback | Supporta scouting e priorità quando i provider sono configurati; alcuni percorsi possono usare fallback o analisi ibride. |
| Drone | Scaffold/simulato | Le operazioni drone sono un prototipo operativo interno, non controllo hardware reale né computer vision validata. |
| Irrigazione, nutrizione, prescrizioni | Ibrido | Le raccomandazioni usano regole, contesto e servizi specialistici; la chiusura completa predizione -> esecuzione -> outcome dipende dal modulo. |

---

## Cosa può fare oggi

- supportare domande agronomiche e operative tramite chat bounded
- suggerire priorità, finestre operative e rischi quando il contesto dati è sufficiente
- usare diario, meteo, attività, colture e alcuni segnali precision-hub per migliorare le decisioni
- aiutare a trasformare alcune raccomandazioni in task o flussi operativi confermati
- mostrare confidence e segnali di qualità in diversi servizi decisionali

---

## Cosa non va promesso come chiuso

- accuratezza universale del modulo AI o percentuali generali non validate
- apprendimento continuo automatico da ogni esito operativo
- memoria AI durevole e completa su tutta l'azienda
- controllo autonomo di irrigazione, trattamenti, droni o macchine senza conferma utente e audit
- computer vision drone reale quando il flusso corrente è simulato
- report certificativi o auditabili generati solo da raccomandazioni AI

---

## Uso corretto

Usa le superfici AI per orientare priorità, verificare alternative e accelerare la lettura dei dati. Prima di eseguire azioni ad alto impatto, controlla sempre:

- fonte dei dati usati
- confidence o qualità del segnale
- presenza di fallback o simulazione
- modulo operativo in cui l'azione verrà registrata
- esito reale da confrontare con la raccomandazione

---

## Direzione di prodotto

Le promesse più avanzate non vengono cancellate: diventano lavoro esplicito nel master plan. La direzione corretta è consolidare prima i contratti dati, poi collegare predizione, raccomandazione, azione confermata e outcome in un ledger verificabile.

Priorità evolutive:

- unificare il contratto minimo delle predizioni
- rendere DB-backed la pagina Predizioni AI e rimuovere mock locali
- registrare input, modello/servizio, confidence, raccomandazione e outcome
- distinguere sempre provider reale, fallback, simulazione e dato manuale
- validare accuratezza per coltura, sito e fase solo dopo sufficiente storico

---

## Collegamenti rapidi

- [Predizioni AI](./01-ai-predictions.md)
- [Chat AI Globale](./08-global-ai-chat.md)
- [Chat AI Planner](./09-planner-ai-chat.md)
- [Director Orchestrator](./34-director-orchestrator.md)
- [Diario Automatico](./35-automated-diary.md)
- [NDVI Satellitare](./05-ndvi-satellite.md)
- [Operazioni Drone](./02-drone-operations.md)
- [Sistema Irrigazione](./15-irrigation-system.md)
