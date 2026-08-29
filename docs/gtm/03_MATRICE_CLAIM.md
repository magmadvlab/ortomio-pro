# 03 — Matrice claim di OrtoMio

**Data:** 28 agosto 2026 · **Fonte primaria:** `docs/DOCUMENTO_COMMERCIALE_ORTOMIO_PRO_2026-08-15_APPROFONDITO.md` (ogni claim lì è verificato in MASTERDOC/codice/manuali/storia git) + `MASTERDOC.md` §0.
**Regola vincolante:** ogni materiale nuovo (landing, one-pager, email, post, demo) va confrontato con questa matrice **prima** della consegna. Se un materiale userebbe un claim di categoria (c), va segnalato, non scritto.

Legenda: **(V)** verificato con fonte · **(I)** ipotesi plausibile da validare · **(N)** non dicibile ora.

---

## Categoria (V) — Verificati con fonte

| Claim | Fonte |
|---|---|
| Il punteggio di priorità è scomponibile: pesi, segnali mancanti, qualità della fonte visibili | `services/agronomicPriorityService.ts`; `components/ai/AITransparencyPanel.tsx` (4 tab: Panoramica, Dati Usati, Calcoli, Alternative) |
| La confidenza è un numero tra 0.3 e 0.98 e scende quando i segnali mancano | `services/agronomicPriorityService.ts` |
| Un layer economico separato stima costo dell'intervento, costo del ritardo e valore protetto → `intervene_now` / `next_cycle` / `monitor` | `services/agronomicEconomicPriorityService.ts` |
| Il DailyBriefing correla ~20 motori (meteo, fase lunare, GDD, stress idrico, fotoperiodo, salute, mappe…) in una lettura unica | `services/directorService.ts` |
| Rotazione su 8 famiglie botaniche con regole di successione e motivazione agronomica esplicita; ottimizzazione su più annate | `services/cropRotationService.ts`, `logic/rotationOptimizer.ts` |
| Due planner distinti (deterministico verificabile + AI predittiva/economica) che confluiscono in un piano annuale con date corrette per altitudine e temperatura suolo | `classicPlannerService.ts`, `aiPlanningService.ts`, `annualPlannerEngine.ts` |
| Il piano si corregge sui raccolti realmente registrati (raccomandazioni adattive da feedback misurato) | `buildMeasuredFeedbackOptimizations` in `aiPlanningService.ts` |
| Tracciabilità pianta per pianta: codice individuale (es. F1-P001), lotto vivaio di origine, salute prima/dopo ogni operazione, raccolto con destinazione e valore | `types/individualPlant.ts`, `services/seedlingService.ts` |
| Irrigazione previsionale con metodo Penman-Monteith (ET0 × Kc di fase − pioggia efficace, correzioni sito/qualità acqua/efficienza impianto) e feedback dall'irrigazione reale | `services/advancedIrrigationService.ts` |
| Indice di Ravaz implementato con fasce interpretative codificate e target di default 7 | `services/vineyardBudLoadService.ts` |
| Monitoraggio oliveto (maturazione, mosca olearia, trappole) con persistenza reale | `/app/olives`, service collegato dopo censimento M05 |
| Export PDF/CSV bloccato se l'audit trail non persiste; difesa da formula-injection CSV | `regulatoryExportService.server.ts`, `app/api/export/*` |
| Comandi IoT con lifecycle a stati (`requested → sent → acknowledged/failed/timed_out/dead_letter`); integrazione ThingsBoard + Tuya; "un comando non è eseguito senza ack o misura coerente" | `app/api/iot/`, `docs/manual/14-smart-hub.md` |
| Un solo piano PRO; funzioni AI con costo in crediti dichiarato (chat 1, diagnose 3, advanced_analysis 5), scalati con transazione; `402 insufficient_credits` esplicito | `lib/credits.ts`, `/api/ai/*`, commit `72852c0` |
| 31 capability: 15 stabili, 14 beta, 2 in simulazione (drone, blockchain) | `config/capabilities.ts` (verificato 22/07/2026) |
| Baseline tecnica: 228 test di regressione, type-check e build di 144 pagine verdi — baseline locale, non deploy di produzione | `MASTERDOC.md` §0, README |
| Organizzazioni multi-tenant con inviti e ruoli | migrazioni multi-tenancy 17/01/2026 |
| Le funzioni di certificazione organizzano evidenze e dossier (bio, GlobalG.A.P.) — non dichiarano conformità, non sostituiscono audit, non emettono certificati | `docs/manual/04-certifications.md` |
| Form "prova guidata" funzionante end-to-end (inserimento in `support_requests` su Supabase) | `PilotRequestForm.tsx`, `app/api/support/submit/route.ts` |
| La documentazione ufficiale dichiara esplicitamente i propri limiti, con una campagna di correzione verificabile nella storia git (21 commit T1–T16 + allineamenti) | documento commerciale §3.15, §7; storia git |

## Categoria (I) — Ipotesi plausibili, da validare

| Claim | Come si valida |
|---|---|
| Il problema "memoria operativa dispersa" è sentito come prioritario dal target | primi 10 colloqui (persona 1 e 2) |
| I tecnici vogliono dati confrontabili tra clienti e useranno la piattaforma come leva di credibilità | colloqui + primo pilota con un tecnico |
| Le due audience accettano un funnel unico senza split | percentuale di richieste qualificate per tipo nei primi 60 giorni |
| L'outreach diretto e le demo 1:1 battono la pubblicità paid in fase iniziale | esperimento E1/E4 (vedi 04_STRATEGIA_GTM §9) |
| Esiste disponibilità a pagare per il piano PRO a un prezzo sostenibile | interviste di pricing prima di definire il listino |
| Il posizionamento "verificabile, non fidati" è differenziante percepito (non solo vero in codice) | reazioni in demo: il pannello di trasparenza genera domande o indifferenza? |

## Categoria (N) — Non dicibili ora (e perché)

| Non dicibile | Perché / cosa serve per sbloccarlo |
|---|---|
| Qualsiasi metrica di risultato agronomico o economico ("% risparmio", "resa migliorata", ROI osservato) | il pilot reale non è ancora avvenuto |
| Testimonianze, citazioni, loghi clienti, "usato da N aziende" | nessun utente reale; politica respinta già in `31-success-stories.md` |
| "Risparmio idrico fino al 50%" o simili | è un claim di Agricolus, non nostro (principio 12) |
| "Certificazione (bio/GlobalG.A.P.) automatizzata/completa" | il prodotto organizza evidenze; la certificazione resta dell'ente |
| API pubbliche, SDK, webhook | `external-api: not-in-release-scope` nel runtime |
| Import dati da Excel | funzionalità inesistente nel codice |
| App mobile nativa | niente di dichiarabile; il prodotto è web |
| Integrazioni telematiche macchine (John Deere, Case IH), GPS, fleet | helper mock dichiarati nel manuale |
| Drone / blockchain / NFT | laboratori simulati isolati |
| Predizioni AI come funzionalità attiva | disattivate nella release candidate in attesa di migrazione/calibrazione/pilot |
| Qualsiasi prezzo del piano PRO | prezzo non ancora definito |
| "Elabora i tuoi dati in tempo reale sul campo con migliaia di utenti" / scala | nessuna scala reale dichiarabile |
| Consulenze agronomiche come servizio strutturato (marketplace, booking, SLA) | helper/stub dichiarati nel manuale |
| Promesse di disponibilità/affidabilità (uptime, SLA) | nessun dato di produzione che le sostenga |

## Nota d'uso per i materiali

1. I claim (V) si possono usare, citando il meccanismo reale (non solo l'aggettivo): "mostra il ragionamento" va accompagnato dal pannello reale in demo.
2. I claim (I) si usano solo come ipotesi di lavoro interna — mai nel copy pubblico.
3. I claim (N) non entrano in nessun materiale; se un bozzone li contiene, si segnala al responsabile del materiale.
4. Quando un claim passa di categoria (es. primo pilot documentato → nascono metriche reali), aggiornare questa matrice nello stesso commit del materiale che lo usa.
