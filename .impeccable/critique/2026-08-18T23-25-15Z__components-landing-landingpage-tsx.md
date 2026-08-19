---
target: components/landing/LandingPage.tsx
total_score: 24
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 3
timestamp: 2026-08-18T23-25-15Z
slug: components-landing-landingpage-tsx
---
# OrtoMio Landing Page — Impeccable Critique

**Target:** `components/landing/LandingPage.tsx` (route `/`, live at ortomioapp.it)
**Method:** dual-agent — Assessment A (design review) and Assessment B (detector + browser evidence), run isolated, then synthesized.

## Design Health Score: 24/32 (75% — Good band)

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | No indication anywhere of product maturity/availability status |
| 2 | Match System / Real World | 4 | Precise domain vocabulary (filare, vigoria, semenzaio) throughout — strongest heuristic |
| 3 | User Control and Freedom | 3 | Gallery horizontal scroll has no visible escape/nav affordance beyond snap-scroll |
| 4 | Consistency and Standards | 2 | 3 different content-rail left-offsets (57px/121px/249px) at 1280px viewport |
| 5 | Error Prevention | 3 | Not fully in scope; no destructive actions on a marketing page |
| 6 | Recognition Rather Than Recall | 2 | Data-state taxonomy (Misurato/Manuale/Pianificato/Calcolato) defined once, never restated where reused |
| 7 | Flexibility and Efficiency | n/a | Persuade-mode landing page; not applicable |
| 8 | Aesthetic and Minimalist Design | 3 | Clean grid, but 6+ near-identical 01/02/03 numbered-list sections read as padding |
| 9 | Error Recovery | 2 | The page's biggest trust risk (beta/NO-GO status) is never pre-empted anywhere |
| 10 | Help and Documentation | n/a | Not applicable to a marketing page |

**Total: 24/32** (8 scored heuristics × 4; #7 and #10 marked n/a as genuinely inapplicable to Persuade mode).

## Design Specificity Verdict

**LLM assessment:** Not generic-SaaS-swappable. The page is unusually well-anchored to OrtoMio's real mechanism: `PillarTransparency` renders an actual scoring ledger (62 → +9/+6/+8/+4 → 89/100), `PrecisionEvidence` operationalizes the measured/manual/planned/calculated taxonomy as a UI pattern rather than a claim, and copy uses precise domain terms (filare, vigoria, GlobalG.A.P.) throughout. It slips toward genericism only in tone — dry, enumerative, lots of `01/02/03` micro-lists — not in substance.

**Deterministic scan:** `detect.mjs --json components/landing` returned a clean pass (0 findings, exit 0). This is a **false negative on real issues** — the detector is a static-analysis tool over markup/class patterns and did not (and structurally cannot) catch the font-fallback, image-delivery, or cross-viewport rail-inconsistency issues below, all of which required live browser measurement. Treat the clean detector run as "no anti-pattern smells in the markup," not "no problems."

**Visual overlays:** Not attempted this run — evidence was gathered via direct DOM/CSS/JS measurement against the live production page rather than the standard local dev-server + `detect.js` script-injection overlay, because the screenshot tool was unreliable mid-session (documented below). No user-visible overlay exists in a browser tab as a result; treat the numbers below as the evidence in place of a highlighted screenshot.

## Overall Impression

This is a page with real substance underneath — the transparency/traceability mechanism is *shown*, not just asserted, which is rare and valuable. But it ships with one confirmed compliance gap against its own PRODUCT.md (the beta/NO-GO disclosure is required to carry equal visual weight to sales content and is currently absent entirely), a font that silently fails to load on the single most important line of copy on the page, and — the gap the founder flagged directly — zero photographic proof that the "one plant, one record" claim has a physical, findable counterpart in a real field. None of this is expensive to fix; all of it is currently costing trust with the exact audience (agronomists, farm operators) the page is trying to earn.

## What's Working

1. **The transparency mechanism is rendered, not narrated.** `PillarTransparency.tsx` shows an actual scoring breakdown with a labeled "Esempio illustrativo" disclaimer — most "explainable AI" B2B pages just use the phrase and stop.
2. **The measured/manual/planned/calculated taxonomy is a real UI pattern.** `PrecisionEvidence.tsx` renders it as a definition list mirroring how the product likely tags data internally, reinforcing the "we don't conflate real and estimated" promise structurally.
3. **"Non una demo. L'app con dati veri, presa così com'è."** — a sharp, well-aimed line that pre-empts the most common skepticism (are these screenshots mockups?) at exactly the point a skeptical reader would form that doubt.

## Priority Issues

**[P0] Beta / commercial-NO-GO status is completely absent from the page**
- **Why it matters:** PRODUCT.md states this must carry the *same visual weight* as sales sections — a confirmed product requirement, not a style preference. A repo-wide grep of `components/landing/**` for beta/NO-GO/pilota/sperimentale terms returns zero hits, and the full rendered page text confirms it never appears. A farm owner or consultant can read every claim and book a demo before learning the product isn't commercially ready — for this compliance-conscious, evidence-driven audience, that reads as concealment once discovered, and it retroactively undermines every trust-building section on the page (transparency, traceability, certification), because those sections all trade on "we don't hide things."
- **Fix:** Add a persistent, equally-weighted disclosure (not a footer asterisk) — a banner/strip near the hero, restated near the final CTA, plainly stating "release candidate, non ancora disponibile commercialmente" and what a guided demo actually delivers.
- **Suggested command:** `/impeccable harden`

**[P1] Two hero-weight images are served at ~3.5x upscale from their delivered pixel size, despite large source files**
- **Why it matters:** Live-DOM measurement shows `production-greenhouse.webp` (hero) and `vineyard-rows.webp` (colture section) decode in-browser at only 282px and 307px tall inside `object-cover` boxes that render at 999px and 1136px tall — a ~3.5–3.7x effective upscale, well past the blur threshold, especially on high-DPI screens. Source-file inspection shows the underlying assets are actually 1600px+ tall, so this is **not a low-resolution asset problem** (correcting the preliminary read) — it's a Next.js `<Image>` `sizes`/`w=` request misconfiguration causing the browser to fetch an undersized variant for how large the box actually renders. The other 5 gallery screenshots are fine (1.1–1.35x, no issue).
- **Fix:** Correct the `sizes` prop (or explicit width request) on those two `<Image>` components so the requested width matches the actual rendered box width at each breakpoint.
- **Suggested command:** `/impeccable optimize`

**[P1] No photograph connects a physical plant to its digital record**
- **Why it matters:** This is the gap the founder flagged directly, and both independent assessments confirmed it. Across all imagery (2 real photos: a greenhouse aisle, a hillside of vine rows; 5 UI screenshots), nothing shows a tagged trunk, a marker/QR on a vine, or any close-up tying one specific physical plant to its data card — yet the copy repeatedly claims exactly this link ("273 alberi, uno per uno," "posizione esatta nel filare"). The UI screenshots prove the *software* tracks per-plant records; nothing proves those records tie back to a real, findable plant in a real field, for an audience specifically primed by the page's own rhetoric to expect that proof.
- **Fix:** One photo — a numbered tag/marker stake at the base of a vine or tree, ideally with a phone/tablet showing that plant's record nearby — placed between the product gallery and the traceability section, where the "vivaio → filare" claim is made. A short sequence (plant in the row → its code → its record) would be stronger still, but even one image closes the gap.
- **Suggested command:** `/impeccable harden` (or scope as an asset-only `/impeccable polish` pass)

**[P1] Content rail switches between 3 different left-margins at the same viewport width**
- **Why it matters:** At 1280px, major sections measure 57px, 121px, and 249px left-offset (1152px / 1024px / 768px inner containers) with no apparent deliberate reason — scrolling the page produces a visibly wandering left edge, which reads as unpolished on a page otherwise built with real design discipline.
- **Fix:** Standardize on one content rail (e.g. `max-w-5xl` for two-column blocks, `max-w-3xl` for prose-only blocks) with the same left margin throughout; let backgrounds go full-bleed, not the text containers.
- **Suggested command:** `/impeccable layout`

**[P2] H1 renders on Arial fallback; body text on generic system-font stack — the brand display font never loads**
- **Why it matters:** The H1 markup names a `font-display` utility class implying a custom typeface was designed for the page's single most important line, but `document.fonts` is empty and no font `<link>` exists in the DOM — full silent fallback to Arial/Helvetica. This is invisible in the source (the class name looks correct) and only shows up under live measurement, which is exactly why it shipped unnoticed.
- **Fix:** Verify the font is actually declared/preloaded (check `next/font` config or a missing `@font-face`/`<link rel="preload">`), and confirm it resolves in a fresh browser profile.
- **Suggested command:** `/impeccable typeset`

## Persona Red Flags

**Riley (consultant, checks everything):** Riley reads both "Esempio illustrativo" disclaimers correctly and then goes looking for the maturity/availability disclosure PRODUCT.md requires — finds nothing. Either books a demo and gets blindsided in the sales call, or leaves because the omission itself reads as evasive to a checks-everything mindset. Directly traces to the P0 above and is the single worst outcome on the page.

**Jordan (first-timer):** Served reasonably well by the consistent eyebrow+h2+body rhythm (easy to tell "what section am I in"), but the page never states in one plain sentence what OrtoMio *is* before diving into NDVI/IoT/AI-scoring/certification mechanism — a reader without precision-agriculture vocabulary may be 3–4 sections in before forming a confident category mental model.

**Casey (distracted mobile user):** Hits the 5-card product gallery at ~85% card width with no position indicator (dots/counter) and no visible affordance beyond scroll-snap — likely to register only 2 of 5 screenshots, possibly missing the strongest evidentiary cards (273 alberi, ROI briefing), and has no re-engagement mechanism (sticky mini-CTA, progress bar) if they exit mid-scroll across the page's 13 sections.

## Minor Observations

- CTA color contrast passes but only marginally in one placement: hero CTA text `rgb(12,51,44)` on gold `rgb(201,138,46)` computes to ≈4.70:1 (WCAG AA minimum is 4.5:1) — technically compliant but with almost no margin; the footer/closing CTA (white on dark green, ≈13.8:1) is comfortably safe by comparison.
- `CertificationEvidence`/`PillarTraceability` reuses a "warning" semantic color (`bg-semantic-warning/10`) for what is actually a positive, reassuring claim ("Dati pronti per registri e certificazioni") — a careful reader could misread the tint as a caution.
- Footer is minimal to a fault for a form-collecting B2B site: one nav link, no privacy/terms link — worth a look given `PilotRequestForm` collects lead data.
- ProductGallery's 5-card horizontal scroll has no position indicator (dots/counter/arrows) — ties into the Casey red flag above.
- Data-state taxonomy (heuristic #6 finding) recurs conceptually in the certification section ("Bozze AI da completare") without visual reinforcement of the earlier legend.

## Questions to Consider

1. Is the beta/NO-GO disclosure missing because it was cut in a prior pass, or because it was never built — does anyone on the team currently believe it's already live?
2. The page proves the AI's reasoning is inspectable in five different sections — would it be on-brand to apply that same rigor to the page's *own* marketing numbers (273 alberi, €1043 ROI) with a one-line source citation, the way a skeptical Riley would want?
3. If one photo closes most of the physical-proof gap, is there already a real tagged plant in an existing customer's field that could be photographed this week, or does this need a staged shot?
