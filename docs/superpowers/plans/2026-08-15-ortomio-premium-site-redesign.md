# OrtoMio Premium Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current generic landing with a premium agricultural marketing site that proves OrtoMio's inspectable decision system and converts visitors through one final guided-trial request.

**Architecture:** Keep the root page server-rendered, decompose the homepage into focused editorial sections backed by structured content, and add a server-first `/come-funziona` reading surface. Limit client code to the transparency tabs and guided-trial form; reuse the support endpoint and existing manual routes.

**Tech Stack:** Next.js 16, React 19, TypeScript 5.8, Tailwind CSS 4, Node test runner, Next Image, next/font.

**Spec:** `docs/superpowers/specs/2026-08-15-ortomio-premium-site-redesign-design.md`

## Global Constraints

- Exactly one commercial CTA location on the homepage: the final guided-trial section.
- Header may contain informational navigation and the utility link `Accedi`, but no trial/demo button.
- Use affirmative Italian copy: audience → action → benefit → proof.
- All claims must map to canonical documentation or working code; no invented customers, testimonials, or outcome metrics.
- State `15 stabili / 14 beta / 2 in simulazione`, technical release-candidate status, and commercial 1.0 NO-GO.
- Preserve Supabase callback forwarding and authenticated-user redirect behavior.
- Use authentic licensed photography and real application screenshots; no generated or decorative evidence.
- Meet WCAG AA, 44×44px targets, keyboard access, visible focus, reduced motion, and accessible form status.

---

### Task 1: Lock the marketing contract with source-level tests

**Files:**
- Create: `__tests__/landing/marketingContent.test.ts`
- Modify: `__tests__/landing/rootRouting.test.ts`
- Test: `__tests__/landing/marketingContent.test.ts`

**Interfaces:**
- Consumes: source files under `components/landing/**`, `app/page.tsx`, and `app/come-funziona/page.tsx`.
- Produces: regression assertions for CTA count, required positioning, crop breadth, maturity disclosure, and documentation route.

- [ ] **Step 1: Write failing source-contract tests**

```ts
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path: string) => readFileSync(path, 'utf8')

test('homepage exposes one guided-trial CTA and no early demo CTA', () => {
  const source = [
    read('components/landing/LandingHeader.tsx'),
    read('components/landing/sections/Hero.tsx'),
    read('components/landing/sections/FinalCta.tsx'),
  ].join('\n')
  assert.equal((source.match(/Richiedi una prova guidata/g) ?? []).length, 1)
  assert.equal(source.includes('Prova la demo ora'), false)
})

test('homepage names decision verification, specialist crops, and commercial maturity', () => {
  const source = read('components/landing/content.ts')
  for (const phrase of ['decisioni agronomiche verificabili', 'vigneto', 'oliveto', 'frutteto', 'vivaio', 'NO-GO']) {
    assert.equal(source.toLowerCase().includes(phrase.toLowerCase()), true, phrase)
  }
})

test('come funziona route links to the existing manuals', () => {
  const source = read('app/come-funziona/page.tsx')
  assert.match(source, /\/docs\/manual\//)
})
```

- [ ] **Step 2: Run the tests and verify the expected failure**

Run: `npm run test:landing`

Expected: FAIL because `components/landing/content.ts` and `app/come-funziona/page.tsx` do not exist and early demo CTAs remain.

- [ ] **Step 3: Keep root-routing coverage aligned with the server-first page**

Add assertions only if routing behavior changes; preserve the existing four outcomes: auth callback, loading, authenticated redirect, and public landing.

- [ ] **Step 4: Commit the test contract**

```bash
git add __tests__/landing/marketingContent.test.ts __tests__/landing/rootRouting.test.ts
git commit -m "test: define premium landing contract"
```

### Task 2: Establish the premium visual system and editorial shell

**Files:**
- Modify: `index.css`
- Modify: `app/layout.tsx`
- Modify: `components/landing/LandingPage.tsx`
- Modify: `components/landing/LandingHeader.tsx`
- Modify: `components/landing/LandingFooter.tsx`
- Create: `components/landing/content.ts`

**Interfaces:**
- Produces: exported `landingContent`, `specialistCrops`, and `documentationLinks` constants used by subsequent sections.
- Produces: token classes for forest, petroleum, paper, earth, and harvest colors.

- [ ] **Step 1: Create typed content records**

```ts
export type SpecialistCrop = {
  id: 'orticole' | 'vigneto' | 'oliveto' | 'frutteto' | 'vivaio'
  label: string
  proof: string
  maturity: 'stabile' | 'beta'
}

export const landingContent = {
  eyebrow: 'Sistema decisionale agronomico trasparente',
  title: 'Dai dati di campo a decisioni agronomiche verificabili.',
  summary: 'OrtoMio aiuta aziende agricole strutturate e consulenti agronomici a collegare condizioni ambientali, stato delle colture, attività, costi e risultati.',
  finalCta: 'Richiedi una prova guidata',
} as const
```

- [ ] **Step 2: Consolidate the approved color and typography tokens**

Use one Tailwind `@theme` source with `#0C332C`, `#1B7A6B`, `#F4F2EC`, `#5B3A29`, `#C98A2E`, and white. Remove landing reliance on the fixed global emerald body gradient while preserving app compatibility.

- [ ] **Step 3: Load an editorial display font and retain precise body/mono roles**

Use `next/font` in `app/layout.tsx`; Italian glyphs and `display: swap` are mandatory. Map variables to `--font-display`, `--font-body`, and `--font-mono`.

- [ ] **Step 4: Replace the header with informational navigation only**

Render links for `#come-funziona`, `#colture`, `/come-funziona`, and `/login`. Ensure each control has a 44px target and shared `focus-visible` treatment. Delete the `/app` trial link.

- [ ] **Step 5: Update the landing assembly and footer**

Use semantic `<main>` and ordered sections. Footer links to `/come-funziona`, `/docs/manual/README`, maturity, and contact; qualify release status rather than claiming generic production readiness.

- [ ] **Step 6: Run the source tests**

Run: `npm run test:landing`

Expected: contract remains partially failing until the remaining sections and route land; TypeScript source compiles for the new exports.

- [ ] **Step 7: Commit the shell**

```bash
git add index.css app/layout.tsx components/landing/LandingPage.tsx components/landing/LandingHeader.tsx components/landing/LandingFooter.tsx components/landing/content.ts
git commit -m "feat: establish premium editorial landing shell"
```

### Task 3: Build the hero, audience, and orchestrator narrative

**Files:**
- Modify: `components/landing/sections/Hero.tsx`
- Modify: `components/landing/sections/AudienceSplit.tsx`
- Replace: `components/landing/sections/PillarCorrelation.tsx`
- Create: `components/landing/sections/OrchestratorSection.tsx`
- Create: `components/landing/media/EditorialMedia.tsx`

**Interfaces:**
- `EditorialMedia` consumes `{ src, alt, caption, priority?, sizes? }` and produces an accessible `<figure>` using `next/image`.
- `OrchestratorSection` consumes no runtime data; it reads typed content constants.

- [ ] **Step 1: Implement the media primitive**

```tsx
type EditorialMediaProps = {
  src: string
  alt: string
  caption: string
  priority?: boolean
  sizes?: string
}

export default function EditorialMedia(props: EditorialMediaProps) {
  return (
    <figure>
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={props.src} alt={props.alt} fill priority={props.priority} sizes={props.sizes ?? '(min-width: 768px) 50vw, 100vw'} className="object-cover" />
      </div>
      <figcaption>{props.caption}</figcaption>
    </figure>
  )
}
```

- [ ] **Step 2: Rewrite the hero without a CTA**

Use the approved headline and summary, name both audiences, and reserve the visual half for the field-decision photograph. No button or `/app` link may appear.

- [ ] **Step 3: Move production contexts near the top**

Audience copy must name structured farms, consultants, horticulture, vineyards, olive groves, orchards, and nurseries before the dense technical proof.

- [ ] **Step 4: Implement the buyer-language orchestrator**

Show the sequence `segnali → contesto → correlazione → priorità → esito` and group inputs into environment, crop, operations, and economics. Output language must center the ordered daily briefing, not internal service count.

- [ ] **Step 5: Remove the old three-signal section from the assembly**

Retain only evidence that helps explain coordination; do not headline lunar phase or technical acronyms.

- [ ] **Step 6: Run type-check and landing tests**

Run: `npm run type-check && npm run test:landing`

Expected: PASS for types; content tests still fail only for unfinished later routes/content.

- [ ] **Step 7: Commit the narrative opening**

```bash
git add components/landing/sections components/landing/media
git commit -m "feat: explain OrtoMio orchestration in buyer language"
```

### Task 4: Build product proof, operational loop, and specialist crops

**Files:**
- Modify: `components/landing/sections/PillarTransparency.tsx`
- Modify: `components/landing/sections/HowItWorks.tsx`
- Modify: `components/landing/sections/PillarTraceability.tsx`
- Create: `components/landing/sections/SpecialistCrops.tsx`
- Create: `components/landing/sections/PlanningMemory.tsx`
- Modify: `components/landing/LandingPage.tsx`

**Interfaces:**
- `PillarTransparency` retains the four-tab keyboard interface.
- `SpecialistCrops` maps `specialistCrops` into semantic editorial articles.

- [ ] **Step 1: Preserve and restyle the four-tab transparency proof**

Keep `tablist/tab/tabpanel`, roving `tabIndex`, arrow keys, and visible focus. Replace defensive copy with affirmative explanation and retain the illustrative-values disclosure.

- [ ] **Step 2: Expand the operational loop to include observed outcome**

Render the ordered stages observation, analysis, priority, human decision, task, execution, outcome, and updated context. On mobile the list remains linear.

- [ ] **Step 3: Expand individual traceability to plants, vines, and trees**

Copy and visual labels must include origin, position, interventions, health response, harvest, quality, destination, and value. Keep certification wording limited to evidence preparation.

- [ ] **Step 4: Add specialist crop proof**

Implement five contexts with exactly one verified mechanism each. Show maturity labels; do not imply universal crop coverage.

- [ ] **Step 5: Add classic + AI planning and measured feedback**

Explain the deterministic and predictive/economic planners as complementary. State that recorded yield/cost outcomes can inform later corrections and qualify beta status.

- [ ] **Step 6: Run tests and type-check**

Run: `npm run test:landing && npm run type-check`

Expected: only documentation-route test may remain failing.

- [ ] **Step 7: Commit product proof**

```bash
git add components/landing
git commit -m "feat: show crop-specific product proof"
```

### Task 5: Add the curated Come funziona reading surface

**Files:**
- Create: `app/come-funziona/page.tsx`
- Create: `components/landing/docs/MechanismArticle.tsx`
- Create: `components/landing/docs/ManualLinkList.tsx`
- Modify: `components/landing/content.ts`
- Test: `__tests__/landing/marketingContent.test.ts`

**Interfaces:**
- `ManualLinkList` consumes `{ href: `/docs/manual/${string}`, label: string, description: string }[]`.
- `/come-funziona` exports route-specific `metadata` and renders server-only content.

- [ ] **Step 1: Define verified manual links**

Map orchestration, data provenance, traceability, planning, irrigation, vineyards, olive groves, orchards, and maturity to existing manual slugs such as `34-director-orchestrator`, `21-individual-plants`, `20-vineyard-management`, `19-olive-management`, `18-orchard-management`, and `15-irrigation-system`.

- [ ] **Step 2: Build semantic reading components**

Use article headings, concise explanations, evidence lists, and visible links. No guided-trial form or commercial CTA appears on this page.

- [ ] **Step 3: Add route metadata**

Export a specific Italian title and description, Open Graph data, and canonical `/come-funziona`.

- [ ] **Step 4: Run the landing tests**

Run: `npm run test:landing`

Expected: PASS.

- [ ] **Step 5: Commit documentation**

```bash
git add app/come-funziona components/landing/docs components/landing/content.ts __tests__/landing/marketingContent.test.ts
git commit -m "feat: add OrtoMio mechanism guide"
```

### Task 6: Replace the pilot branch with one accessible guided-trial conversion

**Files:**
- Modify: `components/landing/sections/MaturitySection.tsx`
- Modify: `components/landing/sections/FinalCta.tsx`
- Modify: `components/landing/PilotRequestForm.tsx`
- Modify: `app/api/support/submit/route.ts`
- Create: `__tests__/landing/guidedTrialForm.test.ts`

**Interfaces:**
- Form submits `name`, `email`, `company`, `type='guided_trial'`, `message`, and `includeSystemInfo='false'`.
- API stores company inside structured `system_info` only if schema supports it; otherwise prepend a labeled company line to the message without schema migration.

- [ ] **Step 1: Write failing form/API source tests**

```ts
test('guided trial submits the four approved fields', () => {
  const source = readFileSync('components/landing/PilotRequestForm.tsx', 'utf8')
  for (const field of ['name', 'email', 'company', 'message']) assert.match(source, new RegExp(field))
  assert.match(source, /guided_trial/)
})
```

- [ ] **Step 2: Remove the pilot CTA and form from maturity**

Maturity becomes informational and states 15/14/2, release candidate, and commercial NO-GO in affirmative language.

- [ ] **Step 3: Make FinalCta the only conversion location**

Render the approved heading and one `Richiedi una prova guidata` button. On activation reveal the form and focus its first field.

- [ ] **Step 4: Implement four fields and distinct error states**

Use per-field messages for missing/invalid input, server-aware messages for 429/503/500, preserve values, and expose success through `role="status"`, `aria-live="polite"`, and focus management.

- [ ] **Step 5: Update the support handler truthfully**

Accept `guided_trial`, validate company for that type, and store it without altering unrelated support requests. Keep fail-closed Supabase behavior.

- [ ] **Step 6: Run targeted tests**

Run: `npm run test:landing && npm run test:security`

Expected: PASS.

- [ ] **Step 7: Commit conversion**

```bash
git add components/landing/sections/MaturitySection.tsx components/landing/sections/FinalCta.tsx components/landing/PilotRequestForm.tsx app/api/support/submit/route.ts __tests__/landing/guidedTrialForm.test.ts
git commit -m "feat: add guided trial request flow"
```

### Task 7: Acquire and integrate authentic media

**Files:**
- Create: `public/landing/field-decision.webp`
- Create: `public/landing/vineyard-rows.webp`
- Create: `public/landing/olive-orchard.webp`
- Create: `public/landing/nursery-plant.webp`
- Create: `public/landing/product-briefing.webp`
- Create: `public/landing/product-transparency.webp`
- Create: `public/landing/product-plant-history.webp`
- Create: `public/landing/product-planning.webp`
- Create: `docs/landing-media-sources.md`

**Interfaces:**
- Photography source log records source URL, author, license, retrieval date, and local filename.
- Screenshots contain only demo/fictitious data and no personal information.

- [ ] **Step 1: Select licensed editorial photographs**

Choose operationally relevant field, vineyard, orchard/olive, and nursery scenes. Reject generic posed technology imagery.

- [ ] **Step 2: Record source and license details before download**

Write `docs/landing-media-sources.md` with one complete record per photograph.

- [ ] **Step 3: Capture real product screenshots from demo data**

Capture daily briefing, transparency, plant history, and annual planning at sufficient resolution. Verify there is no private or production data.

- [ ] **Step 4: Optimize assets**

Convert photographs/screenshots to WebP, keep hero near 2400px wide and content media near 1600px, and visually confirm compression quality.

- [ ] **Step 5: Wire all media through EditorialMedia**

Add meaningful alt text, captions, responsive sizes, priority only for hero, and lazy loading elsewhere.

- [ ] **Step 6: Commit media separately**

```bash
git add public/landing docs/landing-media-sources.md components/landing
git commit -m "feat: add authentic OrtoMio landing media"
```

### Task 8: Final SEO, accessibility, visual verification, and live handoff

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Modify: landing files identified by verification
- Test: `__tests__/landing/*.test.ts`

**Interfaces:**
- Produces: production-ready metadata and a locally running review session on port 3002.

- [ ] **Step 1: Add route-specific metadata and truthful structured data**

Export title, description, canonical, Open Graph, and Twitter data. Add only a valid `SoftwareApplication` JSON-LD representation that avoids ratings, pricing, or customer counts.

- [ ] **Step 2: Run the deterministic checks**

Run: `npm run test:landing && npm run type-check && npm run lint`

Expected: PASS.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: PASS with `/` and `/come-funziona` generated without runtime errors.

- [ ] **Step 4: Run Impeccable detector once**

Run: `node /Users/magma/.agents/skills/impeccable/scripts/detect.mjs --json app/page.tsx app/come-funziona/page.tsx components/landing`

Expected: no unreviewed findings.

- [ ] **Step 5: Start the review session**

Run: `npm run dev`

Expected: Next.js ready at `http://localhost:3002/` and `/come-funziona` responds successfully.

- [ ] **Step 6: Inspect desktop and mobile in one bounded pass**

Verify 1440px and 390px viewports, keyboard path, one CTA, form errors/success layout, media crops, no horizontal overflow, and reduced-motion behavior. Apply one batched correction pass, then one confirmation pass.

- [ ] **Step 7: Commit verification fixes**

```bash
git add app components __tests__ index.css
git commit -m "fix: complete premium landing verification"
```

## Execution Notes

- Existing unrelated working-tree changes must be preserved and reviewed before each commit; stage only files belonging to the active task.
- If authentic photography cannot be downloaded with a verified license, keep the section image-free and stop media finalization rather than publishing an unverified asset.
- If the live application cannot expose safe demo screenshots, use source-built interface proof blocks temporarily and list screenshot acquisition as the only remaining blocker; do not fabricate product UI.

