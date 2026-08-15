# OrtoMio Premium Marketing Site Redesign

**Date:** 2026-08-15  
**Status:** Approved design, pending implementation plan  
**Mode:** Persuade  
**Primary conversion:** Request a guided product trial

## 1. Objective

Redesign the public OrtoMio marketing site so that it communicates the product's real depth and converts qualified agricultural businesses and agronomic consultants into requests for a guided trial.

The site must explain who OrtoMio serves, what it does, the operational benefit it creates, and why its decision process is different from generic farm-management or AI software. The distinguishing promise is inspectable agronomic decision-making: OrtoMio connects field signals, operational history, costs, and outcomes; it shows the data, calculations, confidence, and alternatives behind each priority.

## 2. Confirmed Decisions

- The redesign is architectural, not a copy-only refinement.
- The visual direction is **premium agriculture**: authentic agricultural photography, editorial composition, and real product screenshots.
- The homepage uses one commercial CTA, placed only at the end.
- The CTA opens a contact form for a guided trial rather than sending the visitor directly into the demo.
- The form remains essential: name, email, company, and message.
- The public information architecture includes a new curated `/come-funziona` page that links to the complete manuals.
- The recommended content approach is **editorial storytelling with product proof**: each major value claim is followed by a real interface artifact or a concrete product mechanism.

## 3. Audiences

### Structured agricultural businesses

Owners and field managers working across multiple hectares, crops, zones, rows, plants, and operators. Their desired outcome is a reliable operational memory: what happened, why a decision was made, who acted, and what result followed.

### Agronomic technicians and consultants

Professionals working across several client businesses. Their desired outcome is a comparable and defensible decision framework with traceable data provenance and a clear explanation they can review with the client.

Both audiences share one homepage and one conversion flow. Copy may address their different jobs in dedicated sections, but the site must not create separate funnels.

## 4. Positioning and Messaging

### Primary position

> Dai dati di campo a decisioni agronomiche verificabili.

Supporting message:

> OrtoMio aiuta aziende agricole strutturate e consulenti agronomici a collegare condizioni ambientali, stato delle colture, attività, costi e risultati. Ogni priorità mostra dati utilizzati, calcoli, affidabilità e alternative valutate.

### Product mechanism

The site must explain the orchestration engine in buyer language. OrtoMio:

1. gathers weather, water, soil, phenology, crop health, operational history, costs, and outcomes;
2. associates every signal with a zone, crop, row, plant, vine, or tree;
3. distinguishes measured, estimated, absent, and simulated data;
4. identifies conditions acting together;
5. evaluates urgency, impact, cost, and confidence;
6. produces an ordered operational briefing;
7. records the human decision, execution, and observed outcome;
8. uses the resulting history to inform later planning.

The buyer outcome is one coordinated reading that is ready for human review, not a list of disconnected dashboards.

### Copy rules

- Use affirmative language that explains what OrtoMio does.
- Structure claims as audience → action → benefit → proof.
- Prefer concrete mechanisms to adjectives such as “innovative,” “smart,” or “optimized.”
- Avoid defensive copy built around what the product does not do.
- Qualify maturity honestly: distinguish implemented mechanisms, beta capabilities, simulations, and production-validated outcomes.
- Never invent customers, testimonials, performance metrics, economic results, or certification outcomes.
- The final decision remains human; the product proposes, explains, and records.

## 5. Homepage Information Architecture

### 5.1 Header

Contents: OrtoMio logo, section links for “Come funziona,” “Colture,” and “Documentazione,” plus utility link “Accedi.” The header contains no commercial CTA.

### 5.2 Editorial hero

Use an authentic agricultural photograph and the primary position. State the two audiences and the inspectable decision mechanism. Do not render a commercial button in the hero.

### 5.3 Audiences and production contexts

Name structured farms and agronomic consultants, then establish breadth: horticulture, field crops, vineyards, olive groves, orchards, and nurseries. The section must prevent the current “small vegetable garden” interpretation.

### 5.4 Orchestration engine

Explain what the engine observes, how it connects signals, and what the daily briefing gives the user. A real product screenshot or carefully reconstructed interface crop must show the ordered briefing. The section must emphasize decision readiness rather than internal service count.

### 5.5 Inspectable priority

Show the real transparency panel with Panoramica, Dati, Calcoli, and Alternative. Explain measured/estimated/absent/simulated states, the confidence value, and why alternatives were discarded. Illustrative numbers must remain explicitly labeled illustrative.

### 5.6 Operational learning cycle

Show the sequence: observation → analysis → priority → human decision → task → execution → outcome → updated planning context. This is a product loop, not an automated agronomic decision.

### 5.7 Individual plant, vine, and tree history

Explain that each tracked individual can retain origin, position, operations, health before and after, response, harvest, quality, destination, and value. Use a real interface screenshot and connect the mechanism to traceability and certification evidence without claiming certification.

### 5.8 Specialist crops

Present a compact editorial module with one verified mechanism per context:

- horticulture and field crops: rotations, successions, irrigation, and harvest;
- vineyard: rows, individual vines, bud load, and Ravaz index;
- olive grove: individual trees, interventions, condition, and production history;
- orchard: varieties, phenology, treatments, and harvests;
- nursery: sowing or purchase, germination, nursing, hardening, and transplant.

The module must not promise universal support for any crop. It may describe configurable crop records when the product truth supports them.

### 5.9 Planning and operational memory

Explain classic deterministic planning and AI-assisted predictive/economic planning as complementary inputs to one annual plan. Show how recorded yield and cost outcomes can be compared with the plan and used for later corrections. Qualify maturity according to canonical documentation.

### 5.10 Documentation bridge

Introduce `/come-funziona` as a curated reading path. This is an informational link, not a commercial CTA. It leads to orchestrator, data provenance, individual traceability, planning, irrigation, specialist crops, and maturity explanations, each connected to relevant complete manuals.

### 5.11 Maturity and commercial state

Keep the verified breakdown of 15 stable, 14 beta, and 2 simulated capabilities. State with equal visual weight that the current product is a technical release candidate and that commercial 1.0 remains NO-GO pending real pilots and production evidence. Translate these states into what a visitor can safely evaluate today.

### 5.12 Single final conversion

Heading:

> Porta il tuo caso reale nella prova di OrtoMio.

Supporting text:

> Raccontaci azienda, colture ed esigenza principale. Prepareremo una dimostrazione guidata sui processi che vuoi valutare.

Button:

> Richiedi una prova guidata

The button reveals or focuses the form in the same final section. There must be exactly one commercial CTA label and location across the homepage. “Accedi” and informational navigation are exempt because they serve existing users and reading intent rather than conversion.

## 6. Guided-Trial Form

Fields:

- `name`: required text;
- `email`: required email;
- `company`: required text;
- `message`: required textarea inviting the visitor to describe crops and the process they want to evaluate.

Submission uses the existing `/api/support/submit` endpoint with a distinct guided-trial request type. The implementation must preserve entered values on failure and distinguish incomplete fields, invalid email, network failure, rate limiting, and service failure.

Success message:

> Richiesta ricevuta. Ti contatteremo per definire il caso da mostrare durante la prova.

The confirmation must be announced to assistive technology and receive logical focus when it replaces the form.

## 7. `/come-funziona` Page

The page is an editorial explanation layer between the homepage and the complete manuals. It contains:

1. orchestration engine and daily briefing;
2. data provenance and the four data states;
3. inspectable agronomic priorities;
4. individual plant/tree/vine traceability;
5. classic and AI-assisted planning;
6. predictive irrigation and its declared confidence;
7. vineyard, olive, orchard, nursery, and horticultural mechanisms;
8. capability maturity and limitations;
9. links to the relevant existing manuals.

The page is Read mode: comprehension and evidence take priority over conversion. It must not repeat the guided-trial form or introduce a second sales funnel.

## 8. Visual System

### Palette

- Forest green `#0C332C`;
- petroleum green `#1B7A6B`;
- mineral paper `#F4F2EC`;
- dark earth `#5B3A29`;
- harvest amber `#C98A2E`;
- white `#FFFFFF`.

All colors must be expressed through a single token source. Existing brand greens may be retained where they map directly to the approved palette.

### Typography

- an editorial display face for major theses;
- a precise sans serif for body copy and interface explanations;
- monospaced typography only for data, provenance, states, and technical captions.

The implementation plan must select fonts that support Italian text, load through `next/font`, and maintain readable fallbacks.

### Composition

Use asymmetric editorial layouts, generous image-led moments, restrained text columns, and product screenshots framed as evidence. Avoid repeating rounded cards at the same scale across every section. Technical density should increase only after the reader understands the buyer value.

### Signature device

A continuous “agronomic history” line connects observation, decision, action, and outcome across the page. It must encode the product loop rather than act as decoration.

## 9. Media Requirements

Use authentic, professionally selected agricultural photography with verifiable usage rights. Required subjects include a field decision scene, vineyard rows, olive or orchard trees, nursery or individual plant handling, and real technology used in context.

Avoid posed stock scenes, generic green-technology imagery, and perfect empty landscapes without operational relevance.

Real screenshots must be acquired from the existing application and cropped around one mechanism each: daily briefing, transparency panel, individual plant history, annual plan, and one specialist-crop workflow. Each screenshot requires a visible caption explaining what the reader should notice. No essential information may exist only inside an image.

## 10. Technical Architecture

- Preserve Next.js 16, React 19, TypeScript, Tailwind CSS, and the existing authentication/callback behavior.
- Keep `app/page.tsx` server-rendered and limit client components to interactive tabs, the final form, and strictly purposeful motion.
- Add `app/come-funziona/page.tsx` as a server-first editorial page.
- Keep landing sections focused under `components/landing/sections/`.
- Add structured content under `components/landing/content.ts` or smaller responsibility-based modules if the implementation plan demonstrates a clearer boundary.
- Add shared media and caption primitives under `components/landing/media/`.
- Store optimized local assets under `public/landing/` with descriptive filenames.
- Reuse `/api/support/submit`; do not create a new lead backend unless the existing endpoint cannot represent the request truthfully.

## 11. SEO, Accessibility, and Responsive Requirements

### SEO

Provide landing-specific title, description, canonical URL, Open Graph metadata, Twitter metadata, and only truthful structured data. Copy should naturally cover agronomic management software, agricultural businesses, agronomic consultants, crop traceability, and agricultural decision support without keyword stuffing.

### Accessibility

- WCAG AA text and control contrast;
- one logical `h1` per page and ordered headings;
- semantic landmarks;
- keyboard-operable interactions and visible focus;
- minimum 44×44 px interactive targets;
- meaningful image alternatives and explanatory captions;
- form errors associated with fields;
- polite status announcements and deliberate focus management;
- useful reduced-motion behavior.

### Responsive behavior

Editorial split layouts become a single logical reading order on mobile. Photography, explanation, and product proof must remain adjacent. No information may depend on hover, animation, a wide table, or unreadable text embedded in imagery.

## 12. Verification and Acceptance Criteria

The implementation is acceptable when:

1. the homepage contains one and only one commercial CTA, in the final section;
2. the CTA opens the four-field guided-trial form and submission states are accessible;
3. the hero names the decision-support mechanism and both primary audiences;
4. the orchestrator section explains inputs, correlation, prioritization, and feedback in buyer language;
5. the site explicitly shows individual plants, vines, and trees;
6. vineyard, olive, orchard, nursery, and horticultural contexts are represented with verified mechanisms;
7. `/come-funziona` exists and links to relevant complete manuals;
8. stable, beta, simulated, release-candidate, and commercial NO-GO states are disclosed accurately;
9. every material product claim maps to canonical documentation or working code;
10. metadata and social-sharing data are route-specific;
11. automated tests cover CTA count, routing, callback forwarding, form states, and critical semantic content;
12. type-check, lint, targeted tests, desktop/mobile visual inspection, and a final Impeccable pass succeed.

## 13. Out of Scope

- Rebranding or renaming OrtoMio;
- changing the application dashboard or operational product UI beyond screenshot preparation;
- creating pricing, checkout, subscription, or self-service onboarding flows;
- publishing invented customer logos, testimonials, or pilot results;
- promoting drone or blockchain simulations as usable production capabilities;
- changing the underlying agronomic engines;
- creating separate audience funnels.

