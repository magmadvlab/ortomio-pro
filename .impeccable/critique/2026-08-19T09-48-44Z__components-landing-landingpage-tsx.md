---
target: landing page (LandingPage.tsx + sections)
total_score: 17
max_score: 24
na_heuristics: 5,7,9,10
p0_count: 2
p1_count: 1
timestamp: 2026-08-19T09-48-44Z
slug: components-landing-landingpage-tsx
---
Method: dual-agent (A: design-review agent · B: detector/browser-evidence agent)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3/4 | ProductGallery rompe la numerazione § stabilita dal resto della pagina |
| 2 | Match System/Real World | 3/4 | Vocabolario di dominio autentico ma zero glossario per un primo visitatore |
| 3 | User Control and Freedom | 3/4 | Tab navigabili da tastiera, focus gestito correttamente |
| 4 | Consistency and Standards | 4/4 | SectionHeader riusato coerentemente su 10 sezioni |
| 5 | Error Prevention | n/a | Form fuori scope |
| 6 | Recognition Rather Than Recall | 2/4 | Sigle tecniche senza spiegazione inline |
| 7 | Flexibility/Efficiency | n/a | Non applicabile a surface Persuade single-scroll |
| 8 | Aesthetic and Minimalist Design | 2/4 | 10 sezioni dense, griglie con 5-6 elementi simultanei |
| 9 | Error Recovery | n/a | Nessuno stato d'errore osservabile |
| 10 | Help and Documentation | n/a | Solo un link "Come funziona" |
| Total | | 17/24 applicabile (71%, Good) | |

## Design Specificity Verdict
LLM: alta specificità — SignalTape, PillarTransparency e l'estetica Director sono specifiche al dominio agronomico.
Deterministic scan: CLI detect.mjs pulito (exit 0). Browser injection live: 54 anti-pattern (12x ai-color-palette, 12x nested-cards, 8x line-length, 6x kicker-above-heading, 3x undersized-ui-text, 3x heading-rhythm, 2x all-caps-body, 1x oversized-h1, 1x overused-font, 1x first-viewport-column-overflow, 1x hero-eyebrow-chip, 1x tiny-text).
Correlazione: oversized-h1/first-viewport-column-overflow corrisponde a un difetto reale confermato visivamente (H1 hero tagliato dall'header sticky su desktop). Causa del 400 sull'immagine hero trovata: mismatch nome file (production_greenhouse.webp nel codice vs production-greenhouse.webp su disco).
Possibili falsi positivi: 12x ai-color-palette e 12x nested-cards potrebbero derivare da pochi pattern di componente ripetuti, non istanze indipendenti; il ciano neon potrebbe essere scelta di brand deliberata da confermare.

## Overall Impression
Pagina più specifica al prodotto della media, ma due difetti tecnici concreti (immagine hero rotta, H1 tagliato su desktop) minano la prima impressione, e la promessa "mai un numero inventato" è indebolita da dati illustrativi visivamente indistinguibili dai reali.

## What's Working
- SectionHeader + SignalTape: chrome coerente, segnali reali non decorativi
- PillarTransparency: fa vivere la differenziazione invece di dichiararla
- Disciplina dei disclaimer coerente col principio di prodotto

## Priority Issues

[P0] Immagine hero rotta (400 Bad Request)
Why it matters: visual più prominente della pagina, oggi vuoto.
Fix: correggere riferimento file (underscore vs trattino).
Suggested command: /impeccable harden

[P0] H1 hero tagliato dall'header sticky su desktop
Why it matters: prima cosa vista da un visitatore desktop è un titolo troncato.
Fix: ridurre scala tipografica H1 o spazio verticale riservato.
Suggested command: /impeccable layout

[P1] Dati illustrativi e reali visivamente indistinguibili
Why it matters: erode la promessa centrale del prodotto ("mai un numero inventato") verso un buyer scettico.
Fix: trattamento visivo distinto e persistente per i pannelli illustrativi.
Suggested command: /impeccable clarify

[P2] Chunking oltre 4 elementi in 3 sezioni (ReasonWhySection 6, DecisionScenario 5, PillarTraceability 6)
Why it matters: supera il limite di working-memory per un visitatore che scorre, non studia una scheda tecnica.
Suggested command: /impeccable distill

[P3] CTA sepolta sotto muro di testo su mobile (H1 su 6 righe a 375px)
Suggested command: /impeccable adapt

## Persona Red Flags
Jordan (first-timer): SignalTape mostra 21 identificatori snake_case grezzi senza contesto.
Riley (stress-tester): numerazione § non copre Hero/SignalTape/ProductGallery, inconsistente col device "instrument panel".
Casey (mobile): CTA sepolta + SpecialistCrops con lungo tratto di scroll-fatigue.

## Minor Observations
- ProductGallery unica sezione senza chrome SectionHeader
- --font-display: Arial appiattisce la gerarchia headline/body (corroborato da overused-font)
- Logo con payoff "il tuo assistente smart" stona con il posizionamento "orchestratore agronomico"
- 8x righe di testo oltre 80 caratteri

## Questions to Consider
1. Se ogni proof point quantitativo fuori da ProductGallery è dichiaratamente inventato, qual è l'unico numero reale e verificabile che uno scettico vede prima di essere invitato a prenotare?
2. La marquee di 21 signal key senza spiegazione legge come rigore ingegneristico credibile o come rumore tecnico?
3. Se il principio è "la decisione resta umana", aprire con una dashboard "Director" autonoma è l'ingresso emotivo giusto, o converrebbe anteporre i pilastri human-in-the-loop?
