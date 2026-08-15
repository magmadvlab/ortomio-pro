# OrtoMio Landing Page — Revisione Impeccable (design + persuasione marketing)

- **Data:** 2026-08-15
- **Target:** `components/landing/LandingPage.tsx` (route `/`, PR #159)
- **Metodo:** dual-agent — Assessment A (revisione di design, modello opus) e Assessment B (detector deterministico + evidenza browser, modello sonnet), eseguiti isolati, poi sintetizzati.
- **Snapshot compatta:** `.impeccable/critique/2026-08-15T12-01-44Z__components-landing-landingpage-tsx.md`

## Punteggio di salute del design: 21/40 (Acceptable)

| # | Euristica | Punteggio | Problema chiave |
|---|---|---|---|
| 1 | Visibilità stato sistema | 3 | Badge beta sparisce su mobile (`LandingHeader.tsx:16`, `sm:inline-flex`) |
| 2 | Corrispondenza con mondo reale | 2 | Jargon da sviluppatore esposto: `baseScore`, `plant_id`, `schema M15` |
| 3 | Controllo e libertà utente | 3 | Pagina di 4934px con un solo link interno |
| 4 | Coerenza e standard | 2 | 5 larghezze di contenuto diverse a 1280px (57/121/185/249/297px) |
| 5 | Prevenzione errori | 2 | Validazione form solo al submit |
| 6 | Riconoscimento vs memoria | 2 | Legenda a 4 stati riusata ~3900px dopo, senza etichetta |
| 7 | Flessibilità ed efficienza | 2 | Nessuna navigazione interna/TOC |
| 8 | Estetica minimalista | 2 | 11 blocchi quasi identici, nessun punto focale dopo la hero |
| 9 | Recupero errori | 2 | Un messaggio unico per "campo vuoto" e "server down"; nessun re-invio senza reload |
| 10 | Aiuto e documentazione | 1 | Zero link nel footer; claim verificabili senza fonte |

## Verdetto di specificità del design: ~25% guadagnato, 75% generico

**Reale:** tassonomia a 4 stati (misurato/stimato/assente/simulato) come sistema visivo riusabile; tabella di scomposizione del punteggio.

**Generico:** h2 + paragrafo + lista bordata ripetuto 11 volte; verde brand sbagliato — la pagina usa il verde di default Tailwind (`#16a34a`) invece del verde petrolio del logo (`#1b7a6b`, da PRODUCT.md).

## Findings del detector (21 anti-pattern, scan su pagina renderizzata)

- `low-contrast` ×3 — CTA principale bianco su verde: **3.3:1** (serve 4.5:1)
- `low-contrast` — testo ambra stato beta: **1.8:1** su beige
- `low-contrast` — **2.6:1** grigio su bianco
- `text-overflow` ×16 — elementi che escono dal contenitore da 26 a 154px
- `nested-cards` ×3, `cramped-padding`, `all-caps-body` ×3
- `side-tab` ×3 (`PillarCorrelation.tsx:20,23,26`) — probabile falso positivo, usato come legenda di stato (evita/consigliato/eccellente), non come accento decorativo

## Prova visiva: 0 immagini/diagrammi su 9 sezioni

DOM live: 1 sola immagine su tutta la pagina (logo 28×28px nell'header), 0 SVG, 0 canvas, 0 screenshot. Nessuna delle 9 sezioni sotto l'header ha un elemento visivo non testuale.

## Problemi prioritari

### P0 — L'aritmetica del pannello di trasparenza non torna
`PillarTransparency.tsx:3-52`: 62+9+6+8+4 = **89**, ma la pagina dichiara "punteggio finale **78**/100". `soglia ~75` è una soglia, non un addendo, ma è mescolata nella colonna di somma.
**Perché conta:** è la sezione il cui unico scopo è "non fidarti di noi, verifica" — il lettore più propenso a sommare la colonna (un agronomo consulente) è garantito trovare l'errore, e questo retroattivamente mina la fiducia in tutta la pagina, inclusa la sezione onestà.
**Fix:** far tornare i conti, o rendere esplicita un'operazione (es. `base 62 → +confidenza/segnali → subtotale → × fattore correttivo → 78`); spostare `soglia ~75` fuori dalla colonna di addizione con un'etichetta propria.

### P0 — Il CTA principale e il segnale di onestà falliscono il contrasto colore
CTA bianco su verde `#16a34a`: **3.3:1** (fallisce WCAG AA, serve 4.5:1). Testo "Demo/beta pubblica" ambra su beige: **1.8:1**.
**Perché conta:** l'elemento di conversione e l'elemento di fiducia più importanti della pagina sono i due meno leggibili. Contraddice anche il requisito di prodotto (PRODUCT.md) che lo stato beta abbia "lo stesso peso visivo delle sezioni di vendita".
**Fix:** adottare il verde petrolio reale del brand (#1b7a6b, più scuro → risolve anche il contrasto CTA); sostituire ambra-500 con ambra-700 per il testo di warning.

### P1 — Zero prova visiva ovunque sulla pagina
1 immagine, 0 diagrammi, 0 grafici su 9 sezioni. La sezione che promette di "mettere in relazione i dati" (PillarCorrelation) mostra due liste affiancate — l'opposto di una correlazione visibile.
**Fix per sezione, in ordine di impatto:**
1. **PillarCorrelation:** un piccolo SVG — tre segnali (fase lunare/stress idrico/pH) su un asse temporale condiviso, con il momento in cui incrociano soglia insieme evidenziato. È l'intero argomento della sezione, disegnato invece che descritto.
2. **PillarTraceability:** sostituire la fila di chip piatta con un vero timeline verticale che mostra la pianta F1-P001 con stato di salute prima/dopo ogni operazione — il testo lo dichiara già, il visivo no.
3. **MaturitySection:** uno stacked-bar 15/14/2 nei tre trattamenti swatch già definiti nella legenda — rende quantitativa l'onestà a colpo d'occhio.
4. **Hero:** uno screenshot reale del pannello di trasparenza AI (il componente esiste davvero nel prodotto).

### P1 — Cinque larghezze di contenuto diverse
Margini sinistri a 57/121/185/249/297px a 1280px, tutti allineati a sinistra → margine visibilmente irregolare scorrendo la pagina.
**Fix:** un'unica rotaia di contenuto — `max-w-3xl` per il testo, `max-w-5xl` per i blocchi a due colonne, stesso margine sinistro ovunque; solo gli sfondi possono estendersi a piena larghezza.

### P2 — Le tab del pannello di trasparenza sono finte
`PillarTransparency.tsx:24-37`: 4 tab visivamente attive (sottolineatura, siblings sbiaditi) ma sono `<span>` inerti — click non fa nulla, 3 dei 4 contenuti dichiarati non esistono.
**Perché conta:** nella sezione intitolata "non fidarti di noi", un controllo finto colpisce esattamente l'asse della fiducia.
**Fix:** rendere le tab funzionanti con contenuto reale per Panoramica/Dati usati/Alternative (il contenuto esiste già nel documento commerciale/spec di copy), oppure rimuovere l'affordance da tab e lasciare solo la didascalia.

### P2 — Verde brand sbagliato
`--color-ortomio-green-*` è il verde di default di Tailwind, non il verde petrolio del logo (#1b7a6b).
**Fix:** ri-derivare la rampa di verde da #1b7a6b.

## Red flag per persona

**Jordan (primo visitatore, 40 secondi):**
- Il titolo hero risponde a un'obiezione ("non un consiglio a scatola chiusa") che il lettore non si è ancora formato — presuppone che pensasse già "sarà un'AI generica", ma nessuno gliel'ha ancora detto.
- Le prime cose che vede sono 4 parole gergali senza contesto (la legenda misurato/stimato/assente/simulato).
- Su mobile, 11 righe di testo denso prima del CTA.
- Non vede mai il prodotto: 40 secondi di scroll, zero pixel di cosa userebbe davvero.

**Riley (consulente che controlla tutto):**
- Somma la colonna del calcolo: 89, non 78. Perde fiducia proprio nella sezione "non fidarti di noi".
- Clicca le tab: non succede nulla.
- Chiede dove sono elencate le 14 capability in beta — zero link, zero changelog.
- Compila il form, poi vuole inviarne un secondo per un collega: il form è sparito senza modo di tornare indietro senza reload.

## Cosa funziona bene

1. Tassonomia a 4 stati come vero sistema visivo distintivo (fill/hatch/outline/dash — leggibile anche in scala di grigi).
2. Sezione maturità/onestà: la più alta della pagina (661px), numeri verificabili invece di aggettivi, esecuzione corretta del Pratfall Effect.
3. Disciplina di specificità nel copy: quasi zero aggettivi vuoti, ogni claim nomina un meccanismo reale.

## Osservazioni minori

- Spazio mancante prima del trattino: "14 in beta— badge" (`MaturitySection.tsx:29,36`).
- Footer senza alcun link (privacy/contatti/metodologia).
- `alt="OrtoMio"` sul logo duplica l'annuncio screen-reader accanto al wordmark visibile.
- Target di tocco sotto 44px su mobile ("Accedi", link "leggi lo stato reale").
- Focus non si sposta nel form quando si apre (`PilotRequestForm`) — problema per tastiera/screen reader.
- CTA hero ha `hover:-translate-y-0.5` senza variante `motion-reduce`.

## Decisioni prese con l'utente (2026-08-15)

- **Scope:** tutti i problemi trovati vanno pianificati per il refactoring (non solo i P0).
- **Titolo hero:** va riscritto per un primo visitatore che non ha contesto pregresso, mantenendo il punteggio scomponibile come argomento centrale.
- **Prossimo passo:** piano di implementazione (non esecuzione immediata) — vedi `docs/superpowers/plans/2026-08-15-landing-page-refactor.md`.
