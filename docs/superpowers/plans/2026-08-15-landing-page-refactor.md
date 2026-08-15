# OrtoMio Landing Page Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix every issue found in the Impeccable design critique (`docs/superpowers/reports/2026-08-15-landing-page-impeccable-critique.md`) — broken calculation arithmetic, failing color contrast, wrong brand color, zero visual proof across 9 sections, inconsistent content widths, non-functional tabs, a hero headline that presupposes context the reader doesn't have, and a handful of minor accessibility/polish gaps.

**Architecture:** Each task is a scoped fix to one or two existing landing components (all already built and live on PR #159), verified manually via the dev server since this repo has no component-test infrastructure (established in the original landing-page plan). Visual-proof tasks add small inline SVG/HTML diagrams — no charting library, no new dependency.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS. No new dependencies for this plan.

## Global Constraints

- **Source of truth for this plan:** `docs/superpowers/reports/2026-08-15-landing-page-impeccable-critique.md` — every task below maps to one numbered issue there. Do not fix anything not listed in that report or this plan.
- **Honesty guardrail (carried over, still binding):** no fabricated customer names, quotes, or results. New diagram content must illustrate the real, already-documented mechanism (from `docs/superpowers/specs/2026-08-15-ortomio-landing-copy-design.md` and `docs/DOCUMENTO_COMMERCIALE_ORTOMIO_PRO_2026-08-15_APPROFONDITO.md`), not invent new claims.
- **Brand color:** the correct brand green is verde petrolio, hex `#1b7a6b` (from `PRODUCT.md`), not Tailwind's default green. This plan re-derives the `ortomio-green-*` ramp from it — every other task's green usage automatically inherits the fix once Task 1 lands.
- **No new test framework:** verify visually via `npm run dev` + browser, same as the original landing-page plan. `npm run type-check` must stay clean after every task.
- **Design tokens:** continue using `ortomio-green-*`/`ortomio-earth-*`/`semantic-*` for brand/accent, standard Tailwind gray scale for neutral text/borders (per the original plan's Global Constraints, carried forward unchanged).
- **Content rail:** after Task 8, every section's inner content wrapper uses one of exactly two widths — `max-w-3xl` for single-column prose sections, `max-w-5xl` for two-column/wide sections — with identical left padding (`px-6` on the outer `<section>`, no additional horizontal margin on the inner wrapper beyond `mx-auto`). Do not introduce a third width in any task.

---

### Task 1: Rebrand the green token ramp to verde petrolio (fixes P0 contrast + P2 wrong brand color)

**Files:**
- Modify: `index.css`

**Interfaces:**
- Produces: the existing `--color-ortomio-green-50/100/500/600/700/900` custom properties, same names, new values. No component file changes — every component already references these tokens by class name (`bg-ortomio-green-600`, `text-ortomio-green-700`, etc.) and inherits the new color automatically.

- [ ] **Step 1: Read the current green ramp**

Open `index.css` and find the `@theme` block's `--color-ortomio-green-*` declarations (added in the original landing-page plan's font-token fix, so they're already inside `@theme`).

- [ ] **Step 2: Replace only the six shades the landing page uses — leave `-200`/`-300`/`-400`/`-800` untouched**

The file currently defines nine shades (`-50` through `-900`, including `-200`/`-300`/`-400`/`-800`). Those four are used by unrelated, non-landing components (`components/planner/PopularPlantsTags.tsx`, `components/planner/CompanionPlants.tsx`, `components/planner/SimplifiedPlantingForm.tsx`, `components/onboarding/OnboardingStep7Tutorial.tsx`) — deleting them would break those pages' colors. Change ONLY these six lines, leaving `-200`/`-300`/`-400`/`-800` exactly as they are today, in place, at their current position in the list:

```css
--color-ortomio-green-50: #eaf5f3;
--color-ortomio-green-100: #cde9e3;
--color-ortomio-green-500: #1f9483;
--color-ortomio-green-600: #1b7a6b;
--color-ortomio-green-700: #146054;
--color-ortomio-green-900: #0c332c;
```

(`-600` is the brand hex itself, verified below to pass contrast as a button fill; `-700` is the darker hover/text shade; `-900` is near-black-green for headings; `-50`/`-100` are light tints for section backgrounds, kept close in hue to the old values so existing background usages don't shift dramatically.)

- [ ] **Step 3: Verify contrast math**

White text (`#ffffff`) on `#1b7a6b` (the new `-600`, used by the primary CTA button and header CTA) must be ≥4.5:1. Compute or check with a contrast tool: `#1b7a6b` relative luminance is low enough that white-on-it is approximately 5.1:1 — passes WCAG AA. If your verification shows otherwise, darken `-600` further (e.g. to `#166054`) until white text passes 4.5:1, and keep `-700` proportionally darker.

- [ ] **Step 4: Manual verification**

Run `npm run dev`, open `/`, confirm: the header logo and the CTA buttons now show the teal-green brand color (not the previous bright Tailwind green), the page still reads correctly with no broken contrast elsewhere (spot-check the `AudienceSplit` green-tinted column and the `PillarCorrelation` "eccellente" highlighted rotation row, both of which use `-50`/`-700`). Then confirm `git diff index.css` shows ONLY the six changed lines — `-200`/`-300`/`-400`/`-800` must show zero diff. As a final check, open one non-landing page that uses those shades (e.g. navigate to a page rendering `components/onboarding/OnboardingStep7Tutorial.tsx` if reachable in this environment, or at minimum confirm by reading the file that its `ortomio-green-200`/`ortomio-green-800` classes still resolve to defined CSS variables) to confirm no regression outside the landing page.

- [ ] **Step 5: Commit**

```bash
git add index.css
git commit -m "fix: rebrand green token ramp to the product's verde petrolio, fixing CTA contrast"
```

---

### Task 2: Fix the amber/warning text contrast (P0)

**Files:**
- Modify: `components/landing/sections/StatusBanner.tsx`
- Modify: `components/landing/sections/MaturitySection.tsx`

**Interfaces:**
- No new props or exports — both remain no-prop default exports, only className changes.

- [ ] **Step 1: Read both files' current warning-color usage**

`StatusBanner.tsx` uses `text-semantic-warning` on the "Demo/beta pubblica." strong text. `MaturitySection.tsx` uses `border-semantic-warning` on the blockquote and on the certification callout, plus `text-semantic-warning` is not used for body text there (check — if it is, include it in this fix).

- [ ] **Step 2: Add a darker warning token for text use**

In `index.css`, inside the same `@theme` block, add one new token next to the existing `--color-semantic-warning`:

```css
--color-semantic-warning-text: #92400e;
```

(`#92400e` on the page's `ortomio-earth-100`/`#f5ebe0`-family backgrounds measures above 4.5:1 — this is Tailwind's amber-800 value, chosen because it's a standard, well-tested dark-amber.)

- [ ] **Step 3: Use the new token for warning text, keep the original for borders/fills**

In `StatusBanner.tsx`, change `text-semantic-warning` (on the `<strong>`) to `text-semantic-warning-text`. Leave the dot indicator and any border usages on `semantic-warning` as-is (borders/fills don't have the same contrast requirement as text). In `MaturitySection.tsx`, leave `border-semantic-warning` as-is (it's a border, not text) — this file doesn't currently set warning text color on body copy, so no change needed there unless your Step 1 read found one; if it did, apply the same swap.

- [ ] **Step 4: Manual verification**

Run `npm run dev`, open `/`, confirm the "Demo/beta pubblica." text in the status banner is now clearly legible dark-amber, not washed-out light amber, while the dot/border accents keep their original brighter amber.

- [ ] **Step 5: Commit**

```bash
git add index.css components/landing/sections/StatusBanner.tsx components/landing/sections/MaturitySection.tsx
git commit -m "fix: darken warning text color to pass contrast, keep bright amber for accents"
```

---

### Task 3: Fix the transparency panel's calculation arithmetic (P0)

**Files:**
- Modify: `components/landing/sections/PillarTransparency.tsx`

**Interfaces:**
- No new props or exports.

- [ ] **Step 1: Read the current `CALC_ROWS` array and final score**

Confirm the current mismatch: `baseScore 62 + 9 + 6 + 8 + 4 = 89`, displayed final score `78/100`.

- [ ] **Step 2: Replace the calc breakdown so it visibly sums correctly, and separate the threshold from the addition**

Replace the `CALC_ROWS` constant and the calc-block JSX with a version that (a) sums correctly and (b) shows the economic threshold as a labeled comparison, not a hidden addend:

```tsx
const CALC_ROWS: Array<[string, string]> = [
  ['baseScore', '62'],
  ['+ confidenza segnali disponibili', '+9'],
  ['+ copertura segnali P0', '+6'],
  ['+ bonus fase critica', '+8'],
  ['+ fonte profilo (plant_id)', '+4'],
]
```

And in the calc-block JSX, after the `CALC_ROWS.map(...)` block, replace the existing "→ lettura economica" row and the final-score block with:

```tsx
<div className="flex justify-between border-b border-dashed border-ortomio-earth-200 py-1.5 font-mono text-sm">
  <span className="text-gray-600">subtotale</span>
  <span className="font-bold text-ortomio-green-700">89</span>
</div>
<div className="flex justify-between border-b border-dashed border-ortomio-earth-200 py-1.5 font-mono text-sm">
  <span className="text-gray-600">lettura economica (ROI alto → soglia minima)</span>
  <span className="text-gray-500">≥75</span>
</div>
<div className="mt-2 flex justify-between border-t border-ortomio-green-900 pt-2 font-mono text-base font-bold text-ortomio-green-900">
  <span>punteggio finale</span>
  <span>89/100</span>
</div>
```

This makes the subtotal (89) visible as its own labeled row, shows the economic threshold (≥75) as a separate comparison rather than a mixed-in addend, and sets the final score equal to the subtotal — the arithmetic now closes completely: every number on screen is either an addend or the correct sum of the addends above it.

- [ ] **Step 3: Update the confidence line below it (unchanged value, just confirm it still reads correctly under the new final score)**

The existing `<div className="calc-line" ...><span>confidenza dichiarata</span><span>0.84</span></div>`-equivalent block stays as-is — 0.84 is independent of the score arithmetic and doesn't need to change.

- [ ] **Step 4: Manual verification**

Run `npm run dev`, open `/`, scroll to the transparency panel section, confirm: baseScore 62 + 9 + 6 + 8 + 4 visibly sums to 89 (readable top-to-bottom as a runnable addition), the ROI threshold row is visually distinct from the addition (dimmer/labeled as a comparison, not another addend), and the final score matches the subtotal.

- [ ] **Step 5: Commit**

```bash
git add components/landing/sections/PillarTransparency.tsx
git commit -m "fix: make the transparency panel's calculation breakdown arithmetically correct"
```

---

### Task 4: Rewrite the hero headline for a first-time visitor

**Files:**
- Modify: `components/landing/sections/Hero.tsx`

**Interfaces:**
- No new props or exports.

- [ ] **Step 1: Read the current headline and sub-headline**

Current: `Non un consiglio a scatola chiusa: un punteggio che puoi <em>scomporre</em>.` — this presupposes the reader already thinks "this is a black-box AI advisor," an objection a first-time visitor hasn't formed yet (confirmed persona finding: Jordan reads it as answering a question he hasn't asked).

- [ ] **Step 2: Replace the headline with a version that leads with the mechanism, not a rebuttal**

Replace the `<h1>` content:

```tsx
<h1 className="mb-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ortomio-green-900 sm:text-5xl">
  Ogni priorità che OrtoMio propone ha un calcolo che puoi{' '}
  <span className="text-ortomio-green-700 underline decoration-ortomio-green-500 decoration-[3px] underline-offset-4">
    verificare
  </span>
  .
</h1>
```

This states the mechanism directly (a priority comes with a checkable calculation) instead of opening with a negation of an unstated competitor claim. It keeps the same visual treatment (the underlined accent word) and the same core differentiator (verifiability) the rest of the page's copy and this plan's Task 3 fix are built around.

- [ ] **Step 3: Adjust the sub-headline's opening clause to match (it currently assumes the headline's "scomporre" framing)**

Read the current sub-headline paragraph. If it opens by referring back to "il calcolo che l'ha generata" in a way that still reads naturally after the new headline, leave it unchanged — the rest of the sub-headline (confidence, missing signals, economic convenience) doesn't presuppose prior context and stays valid. Only adjust the sub-headline if, after making the Step 2 change, reading headline+sub-headline together sounds disconnected; if so, keep the meaning but smooth the transition, e.g. start with "Non è un'agenda in più, non un'AI che 'sente' cosa fare" moved earlier if that reads better — use your judgment on the transition, but do not change the sub-headline's factual claims.

- [ ] **Step 4: Manual verification**

Run `npm run dev`, open `/` in a fresh/incognito context (simulating a first-time visitor with no prior context), read just the hero in isolation: confirm it states a concrete, self-contained claim (checkable calculation) without requiring the reader to already hold an assumption about "typical AI advisors."

- [ ] **Step 5: Commit**

```bash
git add components/landing/sections/Hero.tsx
git commit -m "fix: rewrite hero headline to lead with the mechanism instead of rebutting an unstated objection"
```

---

### Task 5: Add a threshold-crossing diagram to PillarCorrelation (P1)

**Files:**
- Modify: `components/landing/sections/PillarCorrelation.tsx`

**Interfaces:**
- No new props or exports.

- [ ] **Step 1: Read the current section — it has a rotation card and a briefing card side by side, but no visual demonstration of "correlation"**

The section's whole argument is "OrtoMio notices when several independent signals cross threshold at the same time." Nothing on the page currently shows that.

- [ ] **Step 2: Add an inline SVG diagram showing three signal tracks crossing threshold together**

Insert this diagram between the section's intro paragraph and the existing `.orchestrate-grid`/two-card block (read the file to find that exact insertion point — it's right after the `<p className="mb-8 max-w-2xl text-gray-700">...</p>` intro):

```tsx
<div className="mb-8 max-w-2xl rounded-md border border-ortomio-earth-200 bg-white p-4">
  <svg viewBox="0 0 400 150" className="w-full" role="img" aria-label="Tre segnali — fase lunare, stress idrico, pH — che incrociano la soglia critica nello stesso momento, sulla stessa zona">
    <line x1="0" y1="20" x2="400" y2="20" stroke="#e8d4c0" strokeWidth="1" />
    <line x1="0" y1="75" x2="400" y2="75" stroke="#e8d4c0" strokeWidth="1" />
    <line x1="0" y1="130" x2="400" y2="130" stroke="#e8d4c0" strokeWidth="1" />

    <line x1="260" y1="5" x2="260" y2="145" stroke="#B45309" strokeWidth="1.5" strokeDasharray="4 3" />

    <path d="M0,15 C60,10 120,25 180,18 C220,14 240,16 260,20 C290,26 340,15 400,10" fill="none" stroke="#1b7a6b" strokeWidth="2.5" />
    <circle cx="260" cy="20" r="4" fill="#1b7a6b" />

    <path d="M0,60 C60,65 120,55 180,68 C220,74 240,72 260,75 C290,79 340,62 400,58" fill="none" stroke="#1f9483" strokeWidth="2.5" />
    <circle cx="260" cy="75" r="4" fill="#1f9483" />

    <path d="M0,120 C60,115 120,125 180,118 C220,114 240,124 260,130 C290,136 340,118 400,112" fill="none" stroke="#146054" strokeWidth="2.5" />
    <circle cx="260" cy="130" r="4" fill="#146054" />

    <text x="8" y="12" className="fill-gray-500" fontSize="10">fase lunare</text>
    <text x="8" y="67" className="fill-gray-500" fontSize="10">stress idrico</text>
    <text x="8" y="122" className="fill-gray-500" fontSize="10">pH</text>
    <text x="264" y="145" className="fill-amber-800" fontSize="10">soglia superata insieme</text>
  </svg>
</div>
```

This renders three colored lines (using the Task 1 green ramp) over an implicit time axis, each with a dot marking where it crosses a shared vertical threshold marker — the exact mechanism the section's prose already describes ("fase lunare, stress idrico e pH sono fuori soglia nello stesso momento, sulla stessa zona"), now shown instead of only asserted.

- [ ] **Step 3: Manual verification**

Run `npm run dev`, open `/`, scroll to "Excel contiene i dati. OrtoMio li mette in relazione." — confirm the diagram renders above the two-card block, the three lines are distinguishable (different green shades), the dashed threshold line and its three markers line up, and the SVG scales down cleanly on mobile (375px) without overflowing.

- [ ] **Step 4: Commit**

```bash
git add components/landing/sections/PillarCorrelation.tsx
git commit -m "feat: add a threshold-crossing diagram to the data-correlation section"
```

---

### Task 6: Add a plant health timeline to PillarTraceability (P1)

**Files:**
- Modify: `components/landing/sections/PillarTraceability.tsx`

**Interfaces:**
- No new props or exports.

- [ ] **Step 1: Read the current section — it has a horizontal chip pipeline but no visual health-state timeline**

The section's prose claims "ogni operazione registra lo stato di salute prima e dopo" but nothing currently shows a before/after health value.

- [ ] **Step 2: Add a compact health-timeline block under the existing pipeline chips**

Insert this block right after the existing `.trace-flow`/pipeline-chips `<div>` and before the certification callout paragraph:

```tsx
<div className="mb-6 max-w-2xl rounded-md border border-ortomio-earth-200 bg-white p-4">
  <p className="mb-3 font-mono text-xs uppercase tracking-wide text-gray-500">
    Pianta F1-P001 — storia salute per operazione
  </p>
  <div className="flex items-end gap-3">
    {[
      { label: 'Trapianto', before: 78, after: 76 },
      { label: 'Irrigazione', before: 76, after: 81 },
      { label: 'Concimazione', before: 81, after: 85 },
      { label: 'Trattamento', before: 85, after: 88 },
    ].map((op) => (
      <div key={op.label} className="flex flex-1 flex-col items-center gap-1">
        <div className="flex h-16 w-full items-end gap-1">
          <div
            className="flex-1 rounded-t-sm bg-ortomio-earth-200"
            style={{ height: `${op.before}%` }}
            title={`Prima: ${op.before}`}
          />
          <div
            className="flex-1 rounded-t-sm bg-ortomio-green-600"
            style={{ height: `${op.after}%` }}
            title={`Dopo: ${op.after}`}
          />
        </div>
        <span className="text-center text-[10px] leading-tight text-gray-500">{op.label}</span>
        <span className="font-mono text-[10px] text-gray-400">{op.before}→{op.after}</span>
      </div>
    ))}
  </div>
  <p className="mt-3 text-[11px] text-gray-500">
    Esempio illustrativo — ogni operazione reale registra un valore di salute prima e dopo (0-100), non solo &quot;fatto&quot;.
  </p>
</div>
```

Four paired bar-columns (before in light earth tone, after in brand green) for four representative operation types, each with a numeric before→after label underneath, plus an explicit "esempio illustrativo" caption — consistent with this project's honesty guardrail (labeled illustrative data, real mechanism).

- [ ] **Step 3: Manual verification**

Run `npm run dev`, open `/`, scroll to "Dal seme al raccolto" — confirm four paired bars render with visibly different heights (green bar taller than earth bar for improving operations), labels are legible at both desktop and 375px mobile width, and the "esempio illustrativo" caption is present.

- [ ] **Step 4: Commit**

```bash
git add components/landing/sections/PillarTraceability.tsx
git commit -m "feat: add a before/after health-value timeline to the traceability section"
```

---

### Task 7: Add a stacked-bar visualization to MaturitySection (P1)

**Files:**
- Modify: `components/landing/sections/MaturitySection.tsx`

**Interfaces:**
- No new props or exports.

- [ ] **Step 1: Read the current section — 15/14/2 is presented as three bullet list items, no proportional visual**

- [ ] **Step 2: Add a proportional stacked bar above the existing `<ul>` breakdown**

Insert this block right after the `<blockquote>` and before the existing `<ul className="mb-6 divide-y ...">`:

```tsx
<div className="mb-6 flex h-4 w-full max-w-md overflow-hidden rounded-sm border border-ortomio-earth-200" role="img" aria-label="15 capability stabili, 14 in beta, 2 in simulazione, su 31 totali">
  <div className="bg-ortomio-green-600" style={{ width: `${(15 / 31) * 100}%` }} title="15 stabili" />
  <div
    className="bg-ortomio-green-100"
    style={{
      width: `${(14 / 31) * 100}%`,
      backgroundImage: 'repeating-linear-gradient(45deg, #1b7a6b 0 3px, transparent 3px 7px)',
    }}
    title="14 in beta"
  />
  <div className="border-l border-dashed border-ortomio-earth-500 bg-white" style={{ width: `${(2 / 31) * 100}%` }} title="2 in simulazione" />
</div>
```

The bar is proportional (15:14:2 out of 31 total capabilities), using the same three swatch treatments already established in the Hero legend (solid fill = misurato/stabile, diagonal hatch = stimato/beta, dashed outline = simulato), so it reinforces the page's existing visual language instead of introducing a new one.

- [ ] **Step 3: Manual verification**

Run `npm run dev`, open `/`, scroll to "Dove siamo davvero" — confirm the bar renders above the bullet list, segment widths are visibly proportional (the green solid segment slightly larger than the hatched segment, both much larger than the dashed segment), and it doesn't overflow on mobile.

- [ ] **Step 4: Commit**

```bash
git add components/landing/sections/MaturitySection.tsx
git commit -m "feat: add a proportional stacked-bar visualization of the 15/14/2 capability breakdown"
```

---

### Task 8: Unify content widths to a single rail (P1)

**Files:**
- Modify: `components/landing/sections/ProblemSection.tsx`
- Modify: `components/landing/sections/PillarTransparency.tsx`
- Modify: `components/landing/sections/PillarCorrelation.tsx`
- Modify: `components/landing/sections/PillarTraceability.tsx`
- Modify: `components/landing/sections/BenefitsList.tsx`
- Modify: `components/landing/sections/MaturitySection.tsx`
- Modify: `components/landing/sections/FinalCta.tsx`
- Modify: `components/landing/LandingHeader.tsx`
- Modify: `components/landing/LandingFooter.tsx`

**Interfaces:**
- No new props or exports in any file — className-only changes.

- [ ] **Step 1: Audit every section's inner wrapper width class**

Read each file listed above and note its current `max-w-*` class on the direct child of the outer `<section>`/`<header>`/`<footer>`. Per the critique, current values include `max-w-6xl` (header/footer), `max-w-5xl` (AudienceSplit — already correct, leave as-is), `max-w-4xl` (the three pillars), `max-w-3xl` (most single-column sections), `max-w-2xl` (FinalCta).

- [ ] **Step 2: Set every single-column prose section to `max-w-3xl`**

`ProblemSection.tsx`, `BenefitsList.tsx`, `MaturitySection.tsx`, `FinalCta.tsx` — confirm or change their outer content wrapper to `max-w-3xl` (most already are; `FinalCta.tsx` is currently `max-w-2xl`, change it to `max-w-3xl`).

- [ ] **Step 3: Set every wide/two-element section to `max-w-5xl`**

`PillarTransparency.tsx`, `PillarCorrelation.tsx`, `PillarTraceability.tsx` are currently `max-w-4xl` — change each to `max-w-5xl` to match `AudienceSplit.tsx`'s existing width (these three sections contain diagrams/cards similar in nature to the audience-split two-column layout, so `max-w-5xl` is the correct bucket per this plan's Global Constraints, not `max-w-3xl`).

- [ ] **Step 4: Set header and footer to `max-w-5xl` as well**

`LandingHeader.tsx` and `LandingFooter.tsx` currently use `max-w-6xl` — change both to `max-w-5xl` so the header/footer edges align with the widest content sections below them, removing the last width discrepancy.

- [ ] **Step 5: Manual verification**

Run `npm run dev`, open `/` at desktop width (1280px+), use the browser's element inspector or a ruler overlay to confirm every section's left content edge now falls at the same x-position (two clusters are acceptable — the `max-w-3xl` prose sections nested inside the wider `max-w-5xl` outer rail will have a smaller effective width but the same *centering*, so their left edges will differ from the `max-w-5xl` sections by design; what must be identical is that all `max-w-5xl` sections share one left edge, and all `max-w-3xl` sections share one left edge). Confirm no section overflows or looks visually broken at mobile width (375px).

- [ ] **Step 6: Commit**

```bash
git add components/landing/sections/ProblemSection.tsx components/landing/sections/PillarTransparency.tsx components/landing/sections/PillarCorrelation.tsx components/landing/sections/PillarTraceability.tsx components/landing/sections/BenefitsList.tsx components/landing/sections/MaturitySection.tsx components/landing/sections/FinalCta.tsx components/landing/LandingHeader.tsx components/landing/LandingFooter.tsx
git commit -m "fix: unify section content widths to two consistent rails (max-w-3xl / max-w-5xl)"
```

---

### Task 9: Make the transparency panel's tabs functional (P2)

**Files:**
- Modify: `components/landing/sections/PillarTransparency.tsx`

**Interfaces:**
- No new exports; internal component gains local `useState` (already `'use client'`-eligible since it's a browser-interactive component — check the file's top; if it doesn't already have `'use client'`, add it as the first line, since this task introduces `onClick`/`useState`).

- [ ] **Step 1: Read the current tab strip**

The four tabs (`Panoramica`, `Dati usati`, `Calcoli`, `Alternative`) are rendered as static `<span>`s with `Calcoli` hardcoded active; clicking does nothing.

- [ ] **Step 2: Add `'use client'` if not already present, and add tab state**

If the file doesn't start with `'use client'`, add it as line 1. Add near the top of the component function:

```tsx
const TAB_CONTENT: Record<(typeof TABS)[number], React.ReactNode> = {
  Panoramica: (
    <p className="text-sm text-gray-700">
      OrtoMio propone di intervenire ora su questa zona perché il punteggio agronomico è alto
      e il ritardo avrebbe un costo economico stimato superiore al beneficio di aspettare.
    </p>
  ),
  'Dati usati': (
    <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
      <li>Storico irrigazioni e trattamenti della zona (misurato)</li>
      <li>Profilo colturale riconosciuto tramite <code className="font-mono text-xs">plant_id</code> (misurato)</li>
      <li>Previsione meteo a 72 ore (stimato)</li>
      <li>Umidità del suolo in tempo reale — segnale non disponibile su questa zona (assente)</li>
    </ul>
  ),
  Calcoli: null, // rendered by the existing calc-block below, not through this map
  Alternative: (
    <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
      <li><strong>Rimandare al prossimo ciclo</strong> — scartata: il costo del ritardo supera il valore protetto stimato.</li>
      <li><strong>Solo monitorare</strong> — scartata: la copertura dei segnali critici è sufficiente per agire, non solo osservare.</li>
    </ul>
  ),
}
```

Then add `const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Calcoli')` near the top of the component.

- [ ] **Step 3: Wire the tab strip to the new state**

Replace the static tab-strip `<span>` map with clickable buttons:

```tsx
<div className="mb-6 flex flex-nowrap gap-1 overflow-x-auto border-b border-ortomio-earth-200 font-mono text-sm">
  {TABS.map((tab) => (
    <button
      key={tab}
      type="button"
      onClick={() => setActiveTab(tab)}
      className={
        tab === activeTab
          ? 'shrink-0 whitespace-nowrap border-b-2 border-ortomio-green-600 px-3 py-2 font-bold text-ortomio-green-700'
          : 'shrink-0 whitespace-nowrap px-3 py-2 text-gray-400 hover:text-gray-600'
      }
    >
      {tab}
    </button>
  ))}
</div>
```

- [ ] **Step 4: Conditionally render tab content**

Below the tab strip, before the existing `calc-wrap`/calc-block `<div>`, add:

```tsx
{activeTab !== 'Calcoli' && <div className="mb-6">{TAB_CONTENT[activeTab]}</div>}
```

And wrap the existing calc-block `<div>` (the one containing `CALC_ROWS.map(...)`) so it only renders when `activeTab === 'Calcoli'`:

```tsx
{activeTab === 'Calcoli' && (
  <div className="rounded-md border border-ortomio-earth-200 bg-ortomio-green-50 p-5">
    {/* existing calc-block content unchanged */}
  </div>
)}
```

- [ ] **Step 5: Manual verification**

Run `npm run dev`, open `/`, scroll to the transparency panel, click each of the four tabs: confirm each shows different, real content (not a placeholder), the active tab's underline moves correctly, and keyboard users can reach and activate each tab via Tab+Enter/Space (native `<button>` gives this for free — confirm by tabbing through with the keyboard, no mouse).

- [ ] **Step 6: Commit**

```bash
git add components/landing/sections/PillarTransparency.tsx
git commit -m "feat: make the transparency panel's four tabs functional with real content"
```

---

### Task 10: Minor accessibility and polish fixes

**Files:**
- Modify: `components/landing/sections/MaturitySection.tsx`
- Modify: `components/landing/LandingFooter.tsx`
- Modify: `components/landing/LandingHeader.tsx`
- Modify: `components/landing/sections/Hero.tsx`
- Modify: `components/landing/sections/StatusBanner.tsx`
- Modify: `components/landing/PilotRequestForm.tsx`

**Interfaces:**
- No new props or exports; `PilotRequestForm` gains an internal `useRef` for focus management, still takes the same `{ onClose: () => void }` prop.

- [ ] **Step 1: Fix the missing space before em-dashes in `MaturitySection.tsx`**

Find `<strong>14 in beta</strong>—` and `<strong>2 in simulazione</strong>—` (or equivalent — read the file for the exact current text) and add a space: `<strong>14 in beta</strong> —` / `<strong>2 in simulazione</strong> —`. Do the same for `<strong>15 capability stabili</strong>` if it has the same issue.

- [ ] **Step 2: Add real footer links**

In `LandingFooter.tsx`, add links next to the existing text content:

```tsx
<nav className="flex gap-4 text-xs text-gray-500">
  <a href="mailto:roberto.lalinga@gmail.com" className="hover:text-ortomio-green-700 hover:underline">Contatti</a>
  <a href="#maturita" className="hover:text-ortomio-green-700 hover:underline">Stato e maturità</a>
</nav>
```

Add this `<nav>` inside the footer's existing flex row, alongside the current text spans (read the file to place it sensibly — e.g. as a third item in the existing `flex flex-wrap items-center justify-between` row).

- [ ] **Step 3: Fix the logo's redundant `alt` text**

In `LandingHeader.tsx`, find `<Image src="/logo.png" alt="OrtoMio" .../>` — since the visible "OrtoMio" wordmark text sits immediately next to it, change `alt="OrtoMio"` to `alt=""` (decorative, screen readers skip it and read only the adjacent visible text once instead of twice).

- [ ] **Step 4: Add `motion-reduce` variant to the hero CTA hover**

In `Hero.tsx`, find the primary CTA's className containing `hover:-translate-y-0.5`. Add `motion-reduce:hover:translate-y-0` alongside it, e.g.: `"... hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 hover:bg-ortomio-green-700 ..."`.

- [ ] **Step 5: Move keyboard focus into the pilot-request form when it opens**

In `PilotRequestForm.tsx`, add a ref and an effect that focuses the first field on mount:

```tsx
import { useEffect, useRef, useState } from 'react'
```

(add `useEffect`, `useRef` to the existing `useState` import)

```tsx
const nameInputRef = useRef<HTMLInputElement>(null)

useEffect(() => {
  nameInputRef.current?.focus()
}, [])
```

Add `ref={nameInputRef}` to the existing `<input id="pilot-name" ... />` element.

- [ ] **Step 6: Enlarge the two undersized mobile tap targets**

In `LandingHeader.tsx`, the "Accedi" link currently has no vertical padding, measuring under 44px tall on mobile. Add `py-2` to its className (alongside existing classes) so its tap area grows without changing its visual text size. In `StatusBanner.tsx`, the "→ leggi lo stato reale" link has the same issue — add `inline-block py-2` to its className.

- [ ] **Step 7: Manual verification**

Run `npm run dev`, open `/`: confirm the em-dash spacing looks correct in the maturity section, footer shows two working links (mailto and the `#maturita` anchor), inspect the header logo's accessibility tree (or view page source) to confirm `alt=""`, click "Vuoi un pilot reale..." and confirm keyboard focus visibly lands in the Name field immediately (no extra Tab press needed), and confirm (via browser dev tools element sizing, or just visually at 375px) that "Accedi" and "→ leggi lo stato reale" now have a comfortably tappable vertical area.

- [ ] **Step 8: Commit**

```bash
git add components/landing/sections/MaturitySection.tsx components/landing/LandingFooter.tsx components/landing/LandingHeader.tsx components/landing/sections/Hero.tsx components/landing/sections/StatusBanner.tsx components/landing/PilotRequestForm.tsx
git commit -m "fix: minor accessibility and polish fixes (footer links, alt text, focus management, motion-reduce, tap targets)"
```

---

### Task 11: Final verification pass

**Files:**
- None (verification only).

- [ ] **Step 1: Type-check**

Run `npm run type-check` — expect no errors.

- [ ] **Step 2: Full test suite**

Run `npm run test:release` — expect the same pass count as before this plan (229 + 4 `test:landing` = 233), since this plan touches no tested logic, only presentational components.

- [ ] **Step 3: Re-run the detector**

Run `node .claude/skills/impeccable/scripts/detect.mjs --json components/landing/` (adjust the skills path if it differs in this checkout — it was `/Users/magma/.claude/skills/impeccable/scripts/detect.mjs` in the original critique). Confirm the `low-contrast` findings from the original critique no longer appear. The `side-tab` findings on `PillarCorrelation.tsx` may still appear (assessed as a likely false positive in the critique) — that's acceptable, not a regression, but note it in your final report.

- [ ] **Step 4: Full manual walkthrough at desktop and mobile (375px)**

Open `/` fresh (incognito), read top to bottom: confirm the hero headline reads standalone without prior context, the transparency panel's calc math visibly sums, all three pillar sections now show a diagram/visual (not just prose), the tabs are clickable and show different content, the maturity section's stacked bar renders proportionally, content edges align consistently down the page, and the CTA buttons and warning text are clearly legible.

- [ ] **Step 5: Commit (if Step 3 or 4 required any touch-ups not already covered by a prior task's commit)**

Only commit here if verification uncovered something outside the scope of Tasks 1-10 — if everything passes cleanly, no commit is needed for this task.

## Explicitly out of scope for this plan

The critique's P1 visual-proof fix list ranked a **real product screenshot in the hero** (of the actual transparency panel running in `/app`) as its highest-payoff item. This plan does not include it: fabricating a screenshot would violate the honesty guardrail (it would need to be a real capture from the running app, not an illustration), and capturing one requires a logged-in session against real or realistic demo data that this plan's scope doesn't cover. Task the screenshot capture separately once there's a demo environment worth screenshotting, then add it to the hero in a follow-up task.
