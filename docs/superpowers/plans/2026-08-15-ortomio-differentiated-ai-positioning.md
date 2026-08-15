# OrtoMio Differentiated AI Positioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trasformare home e pagina “Come funziona” in un percorso persuasivo che posiziona OrtoMio come AI agronomica “dal satellite alla singola pianta” e converte verso una prova guidata.

**Architecture:** Conservare il design system e i componenti interattivi esistenti, ma riordinare la home intorno a tre prove: osservazione multi-livello, AI spiegabile e storia individuale della pianta. Estrarre il nuovo copy verificabile in componenti di sezione focalizzati, riusare `FinalCta` su entrambe le pagine e coprire il contratto commerciale con test sorgente Node.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, lucide-react, node:test.

**Spec:** `docs/superpowers/specs/2026-08-15-ortomio-differentiated-ai-positioning-design.md`

## Global Constraints

- Una sola CTA commerciale per pagina, sempre alla fine; “Accedi” resta navigazione di utilità.
- Nessun link pubblico ai manuali tecnici o contatto email generico.
- Nessuna testimonianza, logo cliente, metrica agronomica o ROI non verificato.
- NDVI è scouting e compare con disponibilità condizionata a dati satellitari reali.
- “Misurato” richiede telemetria reale e dispositivo associato; manuale, pianificato e calcolato restano distinti.
- Certificazioni significa preparazione e recuperabilità delle evidenze, non emissione del certificato.
- L’AI supporta e spiega; la decisione resta al responsabile.
- Nel copy commerciale non usare: “segnale”, “briefing”, “task”, “esito”, “orchestratore”.
- Preservare tablist, tastiera, focus e disclosure illustrativa di `PillarTransparency`.
- Non aggiungere dipendenze o asset inventati.

---

### Task 1: Bloccare il nuovo contratto commerciale con test failing

**Files:**
- Modify: `__tests__/landing/marketingContent.test.ts`

**Interfaces:**
- Consumes: sorgenti di `LandingPage`, `Hero`, sezioni nuove/esistenti e `app/come-funziona/page.tsx`.
- Produces: contratto di copy e composizione che guida tutte le attività successive.

- [ ] **Step 1: Sostituire le aspettative obsolete dell’hero**

Aggiornare il test hero per richiedere:

```ts
test('hero states the differentiated AI promise', () => {
  const content = read('components/landing/content.ts')
  const hero = read('components/landing/sections/Hero.tsx')

  for (const phrase of [
    'AI agronomica dal satellite alla singola pianta',
    'Tutto ciò che accade in campo diventa una decisione che puoi spiegare',
    'NDVI',
    'ogni singola pianta, vite o albero',
  ]) {
    assert.equal((content + hero).toLowerCase().includes(phrase.toLowerCase()), true, phrase)
  }
})
```

- [ ] **Step 2: Aggiungere il test delle prove differenzianti**

```ts
test('homepage proves observation, individual inputs, AI reasoning, and certification evidence', () => {
  const source = [
    read('components/landing/LandingPage.tsx'),
    read('components/landing/sections/ReasonWhySection.tsx'),
    read('components/landing/sections/DecisionScenario.tsx'),
    read('components/landing/sections/PrecisionEvidence.tsx'),
    read('components/landing/sections/PillarTraceability.tsx'),
    read('components/landing/sections/CertificationEvidence.tsx'),
  ].join('\n')

  for (const phrase of [
    'Un’unica lettura, dal campo alla singola pianta',
    'Un dato isolato dice poco',
    'acqua',
    'nutrimenti',
    'trattamenti',
    'NDVI',
    'IoT',
    'biologico',
    'GlobalG.A.P.',
  ]) {
    assert.equal(source.toLowerCase().includes(phrase.toLowerCase()), true, phrase)
  }
})
```

- [ ] **Step 3: Aggiungere il test dei guardrail**

```ts
test('commercial surfaces avoid internal jargon and unsupported promises', () => {
  const source = [
    read('components/landing/content.ts'),
    read('components/landing/LandingPage.tsx'),
    read('components/landing/sections/ReasonWhySection.tsx'),
    read('components/landing/sections/DecisionScenario.tsx'),
    read('components/landing/sections/PrecisionEvidence.tsx'),
    read('components/landing/sections/CertificationEvidence.tsx'),
    read('app/come-funziona/page.tsx'),
  ].join('\n').toLowerCase()

  for (const forbidden of ['briefing', 'orchestratore', 'segnali correlati', 'certificazione automatica']) {
    assert.equal(source.includes(forbidden), false, forbidden)
  }
  assert.equal(source.includes('quando i dati satellitari sono disponibili'), true)
  assert.equal(source.includes('telemetria'), true)
})
```

- [ ] **Step 4: Aggiungere il test dell’ordine e CTA**

```ts
test('homepage follows the approved persuasion order and ends with one CTA', () => {
  const home = read('components/landing/LandingPage.tsx')
  const expected = [
    '<Hero />',
    '<ReasonWhySection />',
    '<DecisionScenario />',
    '<PillarTransparency />',
    '<PrecisionEvidence />',
    '<PillarTraceability />',
    '<CertificationEvidence />',
    '<PlanningMemory />',
    '<SpecialistCrops />',
    '<AudienceSplit />',
    '<BenefitsList />',
    '<FinalCta />',
  ]
  let previous = -1
  for (const component of expected) {
    const index = home.indexOf(component)
    assert.equal(index > previous, true, component)
    previous = index
  }
})
```

- [ ] **Step 5: Eseguire il test e verificare RED**

Run: `node --test __tests__/landing/marketingContent.test.ts`  
Expected: FAIL per componenti mancanti e vecchio hero.

- [ ] **Step 6: Commit del solo test**

```bash
git add __tests__/landing/marketingContent.test.ts
git commit -m "test: define differentiated landing contract"
```

---

### Task 2: Aggiornare hero e reason why

**Files:**
- Modify: `components/landing/content.ts`
- Modify: `components/landing/sections/Hero.tsx`
- Create: `components/landing/sections/ReasonWhySection.tsx`
- Modify: `components/landing/LandingPage.tsx`
- Test: `__tests__/landing/marketingContent.test.ts`

**Interfaces:**
- Produces: default export `ReasonWhySection`; aggiorna `landingContent.eyebrow/title/summary`.

- [ ] **Step 1: Aggiornare il contenuto hero**

```ts
export const landingContent = {
  eyebrow: 'AI agronomica dal satellite alla singola pianta',
  title: 'Tutto ciò che accade in campo diventa una decisione che puoi spiegare.',
  summary:
    'OrtoMio aiuta aziende agricole e consulenti agronomici a collegare NDVI, meteo, sensori, stato delle colture, lavorazioni, costi e raccolti. Per ogni intervento mostra perché è importante e conserva come ha risposto ogni singola pianta, vite o albero.',
  finalCta: 'Richiedi una prova guidata',
} as const
```

- [ ] **Step 2: Creare `ReasonWhySection`**

Il componente deve avere titolo, paragrafo con disponibilità condizionata e tre article:

```tsx
const PROOFS = [
  ['Osserva dove serve attenzione', 'NDVI, meteo e sensori disponibili aiutano a individuare zone, filari e piante da controllare.'],
  ['Ricostruisce cosa è stato fatto', 'Acqua, nutrimenti, trattamenti, operatori e quantità restano collegati al punto in cui sono stati applicati.'],
  ['Verifica come ha risposto la coltura', 'Salute prima e dopo, efficacia, raccolto, qualità e costi completano la storia dell’intervento.'],
] as const
```

Il testo introduttivo deve iniziare con “Quando i dati satellitari sono disponibili”.

- [ ] **Step 3: Montare dopo `Hero`**

```tsx
<Hero />
<ReasonWhySection />
```

Rimuovere `AudienceSplit` dall’inizio; verrà rimontato vicino alla fine.

- [ ] **Step 4: Eseguire test mirato**

Run: `node --test __tests__/landing/marketingContent.test.ts`  
Expected: test hero PASS; test complessivi ancora FAIL sui componenti successivi.

- [ ] **Step 5: Type-check**

Run: `./node_modules/.bin/tsc --noEmit --incremental false`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/landing/content.ts components/landing/sections/Hero.tsx components/landing/sections/ReasonWhySection.tsx components/landing/LandingPage.tsx
git commit -m "feat: lead with satellite-to-plant positioning"
```

---

### Task 3: Mostrare lo scenario AI e il ragionamento

**Files:**
- Create: `components/landing/sections/DecisionScenario.tsx`
- Modify: `components/landing/sections/PillarTransparency.tsx`
- Modify: `components/landing/LandingPage.tsx`
- Test: `__tests__/landing/marketingContent.test.ts`

**Interfaces:**
- Produces: default export `DecisionScenario`; preserva l’interfaccia tab ARIA di `PillarTransparency`.

- [ ] **Step 1: Creare lo scenario**

Usare il titolo approvato e questo testo:

```tsx
<p>
  In un’azienda con NDVI e sensori collegati, il satellite evidenzia una zona con vigore
  diverso e i sensori mostrano poca umidità nel terreno. La coltura è in una fase delicata
  e le previsioni non indicano pioggia. OrtoMio collega queste informazioni allo storico
  delle irrigazioni, allo stato delle piante e ai costi dell’intervento.
</p>
```

Rendere la relazione visibile con quattro blocchi: “Osservazione”, “Contesto”, “Confronto”, “Decisione motivata”. Nessun valore numerico inventato.

- [ ] **Step 2: Riscrivere intestazione e tab in linguaggio umano**

Titolo: “Ogni indicazione mostra il proprio ragionamento.”

Tab:

```ts
const TABS = ['Cosa propone', 'Su cosa si basa', 'Perché viene prima', 'Alternative'] as const
```

Mappare i contenuti attuali senza perdere la disclosure: i valori del calcolo restano “Esempio illustrativo”.

- [ ] **Step 3: Preservare accessibilità**

Conservare `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, roving `tabIndex`, frecce destra/sinistra e focus programmatico.

- [ ] **Step 4: Montare in sequenza**

```tsx
<ReasonWhySection />
<DecisionScenario />
<PillarTransparency />
```

Rimuovere `OrchestratorSection` dalla home; non cancellare il file in questa task.

- [ ] **Step 5: Test e type-check**

Run:

```bash
node --test __tests__/landing/marketingContent.test.ts
./node_modules/.bin/tsc --noEmit --incremental false
```

Expected: nessun errore ARIA/type; contratto ancora FAIL solo sui blocchi mancanti.

- [ ] **Step 6: Commit**

```bash
git add components/landing/sections/DecisionScenario.tsx components/landing/sections/PillarTransparency.tsx components/landing/LandingPage.tsx
git commit -m "feat: demonstrate explainable agronomic AI"
```

---

### Task 4: Aggiungere precisione NDVI/IoT e storia individuale completa

**Files:**
- Create: `components/landing/sections/PrecisionEvidence.tsx`
- Modify: `components/landing/sections/PillarTraceability.tsx`
- Modify: `components/landing/LandingPage.tsx`
- Test: `__tests__/landing/marketingContent.test.ts`

**Interfaces:**
- Produces: default export `PrecisionEvidence`; `PillarTraceability` resta senza props.

- [ ] **Step 1: Creare `PrecisionEvidence`**

Due colonne:

```ts
const EVIDENCE = [
  {
    title: 'NDVI: osserva dove approfondire',
    text: 'Quando i dati satellitari sono disponibili, le differenze di vigore diventano aree da controllare e restano collegate a colture, filari, irrigazioni e storico.',
  },
  {
    title: 'IoT: registra ciò che viene misurato',
    text: 'Con dispositivi associati, la telemetria registra portata e litri erogati. OrtoMio mantiene distinti valori misurati, inseriti manualmente, pianificati e calcolati.',
  },
] as const
```

Il componente deve dire esplicitamente che NDVI guida il controllo sul campo e non è una diagnosi.

- [ ] **Step 2: Espandere la scheda della pianta**

Aggiungere prima del grafico una griglia con:

```ts
const PLANT_RECORD = [
  'Acqua erogata',
  'Nutrimenti, prodotti e dosi',
  'Trattamenti e lavorazioni',
  'Data e operatore',
  'Salute prima e dopo',
  'Quantità, qualità e destinazione del raccolto',
] as const
```

Mantenere il percorso vivaio → filare e il grafico prima/dopo. Eliminare qualsiasi frase che implichi che telemetria assente sia una misura.

- [ ] **Step 3: Montare in sequenza**

```tsx
<PillarTransparency />
<PrecisionEvidence />
<PillarTraceability />
```

- [ ] **Step 4: Test e type-check**

Run:

```bash
node --test __tests__/landing/marketingContent.test.ts
./node_modules/.bin/tsc --noEmit --incremental false
```

- [ ] **Step 5: Commit**

```bash
git add components/landing/sections/PrecisionEvidence.tsx components/landing/sections/PillarTraceability.tsx components/landing/LandingPage.tsx
git commit -m "feat: show NDVI IoT and plant-level evidence"
```

---

### Task 5: Collegare operatività, certificazioni e pianificazione

**Files:**
- Create: `components/landing/sections/CertificationEvidence.tsx`
- Modify: `components/landing/sections/PlanningMemory.tsx`
- Modify: `components/landing/sections/SpecialistCrops.tsx`
- Modify: `components/landing/LandingPage.tsx`
- Test: `__tests__/landing/marketingContent.test.ts`

**Interfaces:**
- Produces: default export `CertificationEvidence`.

- [ ] **Step 1: Creare la sezione certificazioni**

Titolo: “Il lavoro registrato diventa evidenza pronta da recuperare.”

Mostrare:

```ts
const CERTIFICATION_EVIDENCE = [
  'Lavorazioni e prodotti utilizzati',
  'Lotto, pianta, raccolto e destinazione',
  'Autocontrolli e gestione dei rischi',
  'Procedure di richiamo e documenti di supporto',
  'Bozze AI da completare e verificare',
] as const
```

Il corpo nomina biologico e GlobalG.A.P. e usa “prepara e organizza le evidenze”; non usa “certifica”, “garantisce conformità” o “certificazione automatica”.

- [ ] **Step 2: Aggiornare PlanningMemory**

Titolo: “Il piano non finisce quando comincia la stagione.”

Mantenere due colonne ma rinominarle:

- “Pianificazione agronomica”: rotazioni, famiglie botaniche, semina, compatibilità, motivazioni.
- “Pianificazione assistita dall’AI”: periodi, scaglionamento, investimento, ricavo potenziale, meteo, malattie, ritardi.

Chiusura esplicita: rese e costi registrati si confrontano con il piano per preparare il ciclo successivo.

- [ ] **Step 3: Verificare SpecialistCrops**

Ogni riga deve contenere almeno un meccanismo specifico; mantenere le cinque colture e rimuovere termini interni.

- [ ] **Step 4: Montare in sequenza**

```tsx
<PillarTraceability />
<CertificationEvidence />
<PlanningMemory />
<SpecialistCrops />
```

- [ ] **Step 5: Test e type-check**

Run:

```bash
node --test __tests__/landing/marketingContent.test.ts
./node_modules/.bin/tsc --noEmit --incremental false
```

- [ ] **Step 6: Commit**

```bash
git add components/landing/sections/CertificationEvidence.tsx components/landing/sections/PlanningMemory.tsx components/landing/sections/SpecialistCrops.tsx components/landing/LandingPage.tsx
git commit -m "feat: connect planning to certification evidence"
```

---

### Task 6: Completare desiderio, prova e CTA

**Files:**
- Modify: `components/landing/sections/AudienceSplit.tsx`
- Modify: `components/landing/sections/BenefitsList.tsx`
- Modify: `components/landing/sections/FinalCta.tsx`
- Modify: `components/landing/PilotRequestForm.tsx`
- Modify: `components/landing/LandingPage.tsx`
- Test: `__tests__/landing/marketingContent.test.ts`
- Test: `__tests__/landing/guidedTrialForm.test.ts`

**Interfaces:**
- `FinalCta` continua a montare `PilotRequestForm({ onClose?: () => void })`.

- [ ] **Step 1: Aggiornare AudienceSplit**

Per aziende: coordinamento, memoria condivisa, decisione/esecuzione/verifica.  
Per consulenti: confronto tra clienti, preparazione alla visita, storia del consiglio.

- [ ] **Step 2: Trasformare BenefitsList in “Cosa puoi verificare”**

```ts
const BENEFITS = [
  'Dove serve attenzione prima di organizzare la giornata.',
  'Perché viene proposto un intervento.',
  'Cosa ha ricevuto ogni pianta e come ha risposto.',
  'Come piano, lavorazioni, costi e raccolto si confrontano.',
  'Quali informazioni sono pronte per registri e certificazioni.',
  'Come la storia aziendale continua tra una stagione e la successiva.',
] as const
```

- [ ] **Step 3: Aggiornare FinalCta**

Titolo: “Porta un caso reale. Lo ricostruiamo insieme in OrtoMio.”

Testo: “Indicaci azienda, coltura ed esigenza principale. Prepareremo una prova guidata sui flussi più vicini al tuo lavoro: osservazione del campo, priorità AI, tracciabilità delle piante, pianificazione, IoT, NDVI o preparazione delle evidenze per le certificazioni.”

Microcopy sotto il form/pulsante: “Ti ricontatteremo per preparare una dimostrazione coerente con il tuo contesto.”

- [ ] **Step 4: Aggiornare placeholder messaggio**

Il textarea invita a indicare: “Coltura, dimensione aziendale ed esigenza che vuoi approfondire”.

- [ ] **Step 5: Ordinare il finale**

```tsx
<SpecialistCrops />
<AudienceSplit />
<BenefitsList />
<FinalCta />
```

- [ ] **Step 6: Test**

Run:

```bash
node --test __tests__/landing/marketingContent.test.ts __tests__/landing/guidedTrialForm.test.ts
./node_modules/.bin/tsc --noEmit --incremental false
```

Expected: tutti PASS.

- [ ] **Step 7: Commit**

```bash
git add components/landing/sections/AudienceSplit.tsx components/landing/sections/BenefitsList.tsx components/landing/sections/FinalCta.tsx components/landing/PilotRequestForm.tsx components/landing/LandingPage.tsx __tests__/landing
git commit -m "feat: complete guided-trial persuasion path"
```

---

### Task 7: Allineare la pagina Come funziona

**Files:**
- Modify: `app/come-funziona/page.tsx`
- Test: `__tests__/landing/marketingContent.test.ts`

**Interfaces:**
- Consumes: `FinalCta`, `orchestratorSignals`, `specialistCrops`.
- Produces: route server-rendered `/come-funziona` con una sola CTA finale.

- [ ] **Step 1: Aggiungere un test specifico**

```ts
test('come funziona expands the four differentiated mechanisms', () => {
  const source = read('app/come-funziona/page.tsx').toLowerCase()
  for (const phrase of [
    'dal satellite alla singola pianta',
    'dati satellitari',
    'telemetria',
    'acqua, nutrimenti e trattamenti',
    'biologico e globalg.a.p.',
    'ragionamento',
  ]) {
    assert.equal(source.includes(phrase), true, phrase)
  }
  assert.equal((source.match(/<finalcta \/>/g) ?? []).length, 1)
})
```

- [ ] **Step 2: Verificare RED**

Run: `node --test __tests__/landing/marketingContent.test.ts`  
Expected: FAIL sulle nuove frasi.

- [ ] **Step 3: Riscrivere la route**

Struttura:

1. hero “Dal satellite alla singola pianta: come OrtoMio costruisce una decisione”;
2. osservazione NDVI e misure IoT con guardrail;
3. AI spiegabile con le quattro domande;
4. storia individuale con acqua, nutrimenti, trattamenti e raccolto;
5. certificazioni come evidenze;
6. pianificazione e colture;
7. `FinalCta`.

Non importare `Link` o `documentationLinks`.

- [ ] **Step 4: Test e type-check**

Run:

```bash
node --test __tests__/landing/marketingContent.test.ts
./node_modules/.bin/tsc --noEmit --incremental false
```

- [ ] **Step 5: Commit**

```bash
git add app/come-funziona/page.tsx __tests__/landing/marketingContent.test.ts
git commit -m "feat: deepen differentiated how-it-works story"
```

---

### Task 8: Rimuovere superfici obsolete e verificare

**Files:**
- Modify/Delete only if unreferenced: `components/landing/sections/OrchestratorSection.tsx`
- Modify/Delete only if unreferenced: `components/landing/sections/HowItWorks.tsx`
- Modify/Delete only if unreferenced: `components/landing/sections/PillarCorrelation.tsx`
- Modify: `components/landing/content.ts`
- Verify: all landing files and routes.

**Interfaces:**
- Produces: nessun import morto; build completa.

- [ ] **Step 1: Cercare riferimenti**

Run:

```bash
rg -n "OrchestratorSection|HowItWorks|PillarCorrelation|documentationLinks" app components __tests__
```

Expected: nessun riferimento dalla home/come-funziona ai tre blocchi obsoleti; `documentationLinks` non usato nel percorso commerciale.

- [ ] **Step 2: Rimuovere solo file realmente non referenziati**

Eliminare i tre componenti solo se `rg` conferma zero import. Rimuovere `documentationLinks` da `content.ts` se non ha consumer.

- [ ] **Step 3: Eseguire suite mirata**

Run:

```bash
node --test __tests__/landing/marketingContent.test.ts __tests__/landing/guidedTrialForm.test.ts
```

Expected: tutti PASS.

- [ ] **Step 4: Type-check e build**

Run:

```bash
./node_modules/.bin/tsc --noEmit --incremental false
npm run build
```

Expected: PASS; route `/` e `/come-funziona` generate.

- [ ] **Step 5: Controlli sorgente**

Run:

```bash
git diff --check
rg -n "briefing|orchestratore|segnali correlati|certificazione automatica|/docs/manual/|mailto:" components/landing app/come-funziona -i
```

Expected: nessun match commerciale; eventuali termini in nomi interni non renderizzati vanno rinominati o esclusi dal controllo con motivazione esplicita.

- [ ] **Step 6: Controllo manuale**

Aprire `http://localhost:3002/` e `http://localhost:3002/come-funziona` a 390 px e 1440 px. Verificare:

- hero senza overflow;
- tab navigabili da tastiera;
- timeline pianta leggibile;
- una sola CTA finale;
- modulo con nome, email, azienda e messaggio;
- nessun link manuali/contatti;
- nessuna classificazione tecnica di maturità.

- [ ] **Step 7: Commit finale**

```bash
git add components/landing app/come-funziona __tests__/landing
git commit -m "chore: remove obsolete landing narrative"
```
