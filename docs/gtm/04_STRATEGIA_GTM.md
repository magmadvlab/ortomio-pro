# 04 — Strategia go-to-market OrtoMio

**Data:** 28 agosto 2026 · **Vincoli:** `00_PRINCIPI_VINCOLANTI.md` · **Claims:** `03_MATRICE_CLAIM.md` · **Concorrenza:** `01_ANALISI_COMPETITIVA.md`.
**Anti-staticità:** ogni "non ora" in questo documento ha una condizione di riapertura esplicita (§4). Ogni sezione va rivalettà contro lo stato reale del progetto a ogni ripresa del lavoro GTM (trigger in `README.md`).

---

## 1. Audit onesto dello stato attuale (cosa è pronto, cosa no)

**Prodotto — pronto:**
- Release candidate tecnica: baseline locale P0-P8 del 17/07/2026 verificata (228 test di regressione, type-check, build 144 pagine).
- Meccanismi differenzianti implementati e dimostrabili in demo: pannello di trasparenza AI, punteggio scomponibile, DailyBriefing, ciclo previsione→esito, Ravaz, Penman-Monteith, tracciabilità pianta per pianta, export con audit gate.
- Multi-tenancy con organizzazioni/inviti/ruoli; singolo piano PRO con crediti.

**Prodotto — non pronto:**
- 14/31 capability in beta; 2 simulate. Gate di industrializzazione aperti (registro O01-O44: migrazioni remote da riconciliare, RLS, Security Advisor, provider smoke, shadow mode).
- **Nessun pilot reale concluso**: uso autorizzato attuale = demo/beta con azienda fittizia, nessun comando fisico, nessuna decisione agronomica automatica.
- Deploy parziale in produzione senza staging (decisione del 24/07, gate O06 non soddisfatto).

**Commerciale — pronto:**
- Landing pubblica con copy master approvato; CTA unico "Prenota la tua prova guidata"; form verificato end-to-end (→ `support_requests` su Supabase, con rate limiting).

**Commerciale — non pronto (bloccanti in ordine):**
1. **Privacy policy e termini assenti dalla landing** mentre il form raccoglie nome/email/azienda → bloccante per qualsiasi campagna di traffico e per GDPR. (I file vuoti `Privacy`, `Impostazioni`, `Cancella` in root suggeriscono pagine pianificate e mai create.)
2. **Prezzo del piano PRO non definito** → non si può chiudere una vendita né fare pubblicità.
3. **Nessun materiale di seguito alla richiesta** (oggi il form promette "Ti scriviamo" senza template/processo).
4. **Responsabilità commerciali non assegnate**: chi risponde alle richieste, chi tiene le demo, con che SLA — informazione mancante da parte del titolare del progetto.

**Conclusione dell'audit:** il prodotto può sostenere demo guidate credibili oggi; non può sostenere campagne a pagamento, annunci di risultati o vendita con prezzo. La strategia segue questo ordine di maturazione.

## 2. Segmentazione del pubblico e definizione di lead qualificato

**ICP-1 — Azienda agricola strutturata** (decide e usa):
- criteri: più colture e più zone/filari; registrazione attuale su carta/Excel/WhatsApp; ≥1 persona dedicata al campo; interesse dichiarato per tracciabilità o certificazione.
- esclusioni: hobbisti dell'orto (prodotto sovradimensionato); aziende in cerca solo di fatturazione elettronica.

**ICP-2 — Tecnico/consulente agronomico** (consiglia e usa):
- criteri: ≥5 aziende clienti; necessità di dati confrontabili; dà valore alla difendibilità del proprio consiglio.
- Nota: è il canale moltiplicatore — ogni tecnico convinto porta più aziende. **[ipotesi da validare]**

**Definizione vincolante di lead qualificato (SQL):** richiesta prova guidata compilata (azienda + coltura + esigenza) che soddisfa almeno un criterio ICP. Una visita, un click sul form o un download **non** sono lead qualificati (principio 6).

## 3. Buyer journey per fase

| Fase | ICP-1 (titolare) | ICP-2 (tecnico) | Touchpoint attuale |
|---|---|---|---|
| Inconsapevole | "il quaderno/Excel funziona, è sempre stato così" | "i miei dati stanno nella mia testa e nei miei fogli" | — (nessuna attività top-funnel attiva) |
| Consapevole | scopre che esiste un registro che ragiona e distingue dato/stima | scopre che il confronto previsione-esito può misurare il suo contributo | landing, LinkedIn [da attivare] |
| In valutazione | vuole vedere il pannello di trasparenza sul proprio caso | vuole vedere multi-azienda, ruoli, export | demo guidata (form esistente) |
| Pronto al pilota | chiede una prova sul proprio orto/vigneto/oliveto | propone la piattaforma a 1-2 clienti | pilota strutturato [da definire: durata, dati, esiti] |

Messaggio per fase: consapevolezza → "il registro che ragiona"; valutazione → "non fidarti, verifica" (demo del pannello); decisione → "prova guidata sul tuo caso" (già CTA della landing).

## 4. Tabella canali

Legenda confidenza: quanta evidenza abbiamo che funzioni per questo prodotto/mercato in questa fase.

| Canale | Costo | Tempo a segnale | Confidenza | Criterio di successo | Stato / condizione di riapertura se scartato |
|---|---|---|---|---|---|
| Demo guidate 1:1 via form | ~0 € (tempo) | 2-4 sett. | alta (funnel già cablato) | ≥30% richieste → demo svolta | **Attivo** |
| Outreach diretto a tecnici/agronomi (network + ordini professionali) | ~0 € (tempo) | 2-6 sett. | media-alta | 10 colloqui, ≥3 demo | **Attivo** |
| LinkedIn organico (studio/fondatore) | ~0 € | 2-3 mesi | media | richieste form traced da LinkedIn | **Attivo** |
| Formazione/CFP per dottori agronomi (ordine, eventi) | basso-medio | 1-3 mesi | media | 1 evento → ≥5 contatti tecnici | Attivo dopo il primo pilota |
| Fiere di settore (Macfrut, Eima, Fieragricola) | alto (stand) | — | bassa in questa fase | — | **Non ora. Riapre a: 3 pilot conclusi con esiti documentati** (il prodotto deve reggere domande dal vivo) |
| Content SEO (blog agronomico tecnico) | tempo | 4-6 mesi | media (compounding) | prime posizioni su 5 query nicchia | Attivo con cadenza sostenibile; stop se dopo 6 mesi zero segnali di ricerca |
| Google/Meta Ads | medio | — | bassa (zero baseline) | — | **Non ora. Riapre a: prezzo pubblico definito + privacy pubblicata + ≥20 richieste organiche/3 mesi** (baseline di conversione) |
| PR / stampa di settore | medio | — | bassa | — | **Non ora. Riapre a: 3 pilot conclusi con esiti citabili (con consenso)** — la PR senza prove amplifica claim non dicibili |
| Pagine "alternative to xFarm" | tempo | — | — | — | **Non ora. Riapre a: casi clienti reali + pricing pubblico** (pagina di confronto senza terze parti verificabili non è onesta né utile) |
| App store / mobile | — | — | — | — | **Non ora. Riapre se/un quando esiste un'app nativa** |

## 5. Budget a scenari

> Tutte le cifre sono **stime di massima da validare** (principio 13); il vincolo reale di partenza è il tempo disponibile, non il budget pubblicitario.

- **Essenziale / zero budget:** outreach diretto + LinkedIn organico + demo via form. Costo: tempo (indicativamente 4-8 ore/settimana). Obiettivo: 10 colloqui, 5 demo, 1 pilota in 90 giorni.
- **Validazione (dopo il primo pilota):** eventi formativi CFP + presenza a una fiera come visitatore (non espositore) + eventuail tool (CRM leggero, calendario). Range indicativo: centinaia-di-migliaia di €/anno da confermare sui preventivi reali.
- **Crescita (dopo 3 pilot + prezzo pubblico):** Ads, PR, pagina prezzi, materiale Fiera con stand. Budget da definire sui dati di conversione raccolti nelle fasi precedenti.

## 6. Piano operativo 90 giorni

> Responsabilità: "PO" = product owner OrtoMio, "MAGMA" = studio MAGMA Design & Innovation. **Assegnazione da confermare** (vedi audit §1.4).

**Giorni 1-30 — Sbloccanti e fondazioni**
| # | Azione | Resp. | Output | Metrica | Decisione successiva |
|---|---|---|---|---|---|
| 1 | Pubblicare privacy policy + termini sulla landing (pagine `Privacy`/`Impostazioni`/`Cancella` pianificate) | MAGMA+PO | pagine legali live | link visibili nel footer | sblocca ogni attività di traffico |
| 2 | 10 colloqui discovery (tecnici + titolari, dalla rete) | PO | note per persona/claim matrix | 10 colloqui done | aggiorna 02 e 03 con ciò che emerge |
| 3 | Script demo guidata 30' (pezzo forte: pannello di trasparenza sul caso del visitatore) | MAGMA | script + checklist | demo pilota interna superata | versione 1 per le prime demo reali |
| 4 | Template email post-richiesta (risposta ≤48h promessa sostenibile) | MAGMA | 3 email (ricevuta, proposta demo, follow-up) | usate sulle prime richieste | iterate sui tassi di risposta |
| 5 | Interviste di pricing (inserite nei colloqui: willingness-to-pay di ICP-1 e ICP-2) | PO | range di prezzo motivato | ≥8 risposte utilizzabili | decisione prezzo del piano PRO |

**Giorni 31-60 — Prime demo e primo pilota**
| # | Azione | Resp. | Output | Metrica | Decisione successiva |
|---|---|---|---|---|---|
| 6 | 5 demo guidate | PO | demo svolte + obiezioni trascritte | ≥3 "mi piacerebbe provarlo sul mio campo" | selezione candidato pilota |
| 7 | Struttura pilota: durata (4-8 sett.), dati da registrare, esiti da confrontare, consenso per citazione | PO | documento pilota v1 | firmato con 1 candidato | pilota parte |
| 8 | One-pager PDF per outreach (tutti claim categoria V) | MAGMA | PDF 1 pagina | usato in ≥5 outreach | revisione dopo le prime reazioni |
| 9 | LinkedIn: profilo aziendale verificato/attivato + 2 post/mese (meccanismi reali, non feature-list) | MAGMA | pagina + calendario | richieste traced | continua/stop a 3 mesi |

**Giorni 61-90 — Pilota e decisioni**
| # | Azione | Resp. | Output | Metrica | Decisione successiva |
|---|---|---|---|---|---|
| 10 | Pilota attivo con tecnico o azienda | PO | esiti documentati (previsione vs esito) | North star > 0 per ≥4 settimane | retrospettiva: promuovere/correggere |
| 11 | Retrospettiva 90 giorni: aggiorna matrice claim (le ipotesi valide diventano V o muoiono), personas, e questo documento | PO+MAGMA | commit di aggiornamento docs/gtm | documenti allineati allo stato reale | piano dei 90 successivi |
| 12 | Decisione prezzo sulla base delle interviste | PO | listino piano PRO (o range pubblico) | — | sblocca eventualmente Ads/PR ai loro trigger |

## 7. Dashboard metriche

**North star:** numero di **decisioni agronomiche chiuse con confronto previsione-esito** nel ledger (per pilo e poi per cliente). È la metrica in-prodotto che misura il valore consegnato — coerente con la tesi ("sa sempre perché un intervento è stato deciso e confronta previsione con esito").

| Tipo | Metrica | A cosa serve |
|---|---|---|
| Vanity (non guidano decisioni) | visite landing, follower, impressions | solo contesto |
| Diagnostiche | richieste form (totali vs qualificate), tasso richieste→demo, fonti delle richieste | capire dove lavorare |
| Decisionali | demo svolte, pilota avviati/conclusi, North star settimanale, conversione pilota→abbonamento (quando esiste il prezzo) | decidere investimenti e canali |

## 8. Condizioni di riapertura (registro centralizzato)

Riepilogo estratto dalla tabella canali — ogni "no" ha il suo trigger:
- Fiere → 3 pilot conclusi con esiti documentati.
- Ads → prezzo pubblico + privacy live + ≥20 richieste organiche/3 mesi.
- PR di settore → 3 pilot conclusi con esiti citabili e consenso.
- Pagine alternative/comparative → casi reali + pricing pubblico.
- App store/mobile → esistenza app nativa.
- Split funnel per coltura (persona 3) → ≥40% richieste qualificate da colture legnose nei primi 60 giorni.

## 9. Esperimenti prioritari (max 10)

| # | Ipotesi | Metodo | Costo | Segnale atteso | Criterio di decisione |
|---|---|---|---|---|---|
| E1 | L'outreach diretto produce colloqui con tecnici | 30 contatti personalizzati in 4 settimane | tempo | ≥30% risposta, ≥10 colloqui | se <10 colloqui: cambiare messaggio, non il canale, prima di scartare |
| E2 | Il pannello di trasparenza è il momento che convince in demo | demo con/div senza enfasi sul pannello (A/B qualitativo su 5+5) | tempo | domande e reazioni registrate | se indifferente: il posizionamento va riletto (ipotesi 6 della matrice) |
| E3 | Il problema "memoria dispersa" è top-of-mind | classificazione libera delle frustrazioni nei 10 colloqui | ~0 | citazione spontanea ≥60% | se <60%: riposizionare l'apertura della landing sul problema dominante |
| E4 | Il tecnico è il canale moltiplicatore | tracciare l'origine di ogni pilota | ~0 | ≥50% piloti da tecnici | se <50%: invertire l'ordine dei binari nella comunicazione |
| E5 | Willingness-to-pay esiste per il piano PRO | domande Van Westendorp nelle interviste | ~0 | range coerente | decide il listino (giorno 61-90) |
| E6 | La landing converte visitatori giusti | metriche form per 60 giorni | ~0 | ≥1 richiesta qualificata/100 visite [soglia da calibrare] | sotto soglia: copy/CRO prima di spendere in traffico |
| E7 | LinkedIn organico genera richieste traced | 2 post/mese per 3 mesi con UTM | tempo | ≥3 richieste traced | stop o continua a 3 mesi |
| E8 | La demo sul "caso del visititore" batte la demo generica | confronto qualitativo tra demo | tempo | maggiore prosecuzione al pilota | adottare la variante migliore nello script |
| E9 | Il pilota produce il confronto previsione-esito | esecuzione del pilota v1 | tempo | North star >0 per 4 settimane | se il ledger resta vuoto: il flusso di registrazione è troppo pesante → product fix |
| E10 | Le email post-richiesta alzano la conversione richieste→demo | tassi per template | ~0 | ≥50% richieste→demo | iterare i template |

## 10. Decision log

| Data | Decisione | Motivo | Evidenza | Confidenza | Quando rivederla |
|---|---|---|---|---|---|
| 26/07/2026 | Un solo piano PRO (free/plus/pro unificati) | semplificazione commerciale | commit `72852c0`, test | alta | al primo dato di pricing |
| 18/08/2026 | Nessun banner beta/NO-GO sulla landing | la maturità si comunica in demo e documentazione, non come deterrente in homepage | decisione di prodotto confermata, commit `53dbdcf` | media | se un prospect lamenta sorprese post-demo |
| 28/08/2026 | GTM = direct + demo + LinkedIn; no Ads/PR/fiere | zero pilot, zero prezzo, privacy assente → solo canali a costo di tempo con feedback diretto | questo audit | media | ai trigger di §8 |
| 28/08/2026 | North star = decisioni chiuse con confronto previsione-esito | metrica in-prodotto allineata alla tesi | MASTERDOC §1 | media | dopo il primo pilota (misurabile davvero?) |
| 28/08/2026 | Privacy policy trattata come bloccante pre-traffico | form raccoglie dati personali, GDPR | ispezione footer/landing | alta | appena pubblicata |

## 11. Riferimenti

- Materiali (censimento, priorità, bloccanti): `05_PIANO_MATERIALI.md`.
- Questo documento sostituisce ogni considerazione GTM sparsa in note precedenti; ogni aggiornamento va fatto qui nello stesso commit dei materiali che genera.
