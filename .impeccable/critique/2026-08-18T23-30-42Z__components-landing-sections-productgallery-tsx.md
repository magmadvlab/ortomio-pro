---
target: ProductGallery intervento card
total_score: 18
max_score: 24
na_heuristics: 5,7,9,10
p0_count: 1
p1_count: 2
timestamp: 2026-08-18T23-30-42Z
slug: components-landing-sections-productgallery-tsx
---
# Critique: ProductGallery.tsx — new "intervento" card

Method: dual-agent (A: a1d48d68a3fe544c2 · B: ad8d0f5942792e931)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Thin scrollbar hints more content, but no position indicator (worse now at 6 cards) |
| 2 | Match System / Real World | 4 | Agronomic vocabulary and real metrics throughout, including new card's copy |
| 3 | User Control and Freedom | 3 | Free snap-scroll works; no visible keyboard-arrow affordance |
| 4 | Consistency and Standards | 2 | New card breaks the established image-crop and copy-length pattern |
| 5 | Error Prevention | n/a | Static gallery, no input |
| 6 | Recognition Rather Than Recall | 3 | Titles scannable; new card reuses the "Ogni ___" opening already used by card 3 |
| 7 | Flexibility and Efficiency | n/a | Not applicable to a Persuade/marketing surface |
| 8 | Aesthetic and Minimalist Design | 3 | Clean frame-level consistency, but new card's longer copy stretches the row |
| 9 | Error Recovery | n/a | No error states on this surface |
| 10 | Help and Documentation | n/a | Not applicable to a Persuade/marketing surface |
| **Total** | | **18/24** | **Good (75%)** |

## Design Specificity Verdict

**LLM assessment**: The gallery is genuinely authored for OrtoMio — real numbers (273 alberi, 231/29 piante, €1043 ROI), Italian agronomic vocabulary, screenshots from a live tenant. The new card's copy continues that voice. But the section's own intro sentence ("alberi, piante, consigli e semenzaio con i numeri reali") was never updated to mention "interventi" — the tell of a card bolted onto the row without the row's summary being re-authored to match.

**Deterministic scan**: `detect.mjs` on the isolated file returned clean (no anti-patterns). A full-page browser scan (not scoped to this component) found 12 whole-page findings, none new: `overused-font` (Arial 46%), `kicker-above-heading` ×5 (pre-existing pattern across all landing sections, including the gallery's own "L'applicazione" kicker), `nested-cards` ×6 (count matches the 6 gallery cards but no location string confirmed it — likely a false positive against plain `<article>` cards, not literal nesting), plus unrelated hero/warning-box findings outside the gallery. None of these were introduced by the new card.

**Visual/computed evidence**: All 6 cards share identical container geometry (438×427px) and identical `object-fit: cover` / `object-position: 50% 0%` rendering — the layout system itself is consistent. The difference is the source image: cards 0-4 are wide screenshots (1.82:1 to 2.43:1 natural ratio), all wider than the 1.61:1 card frame, so `cover` only trims width and the full screenshot height stays visible. Card 5 (intervento.webp) is **1.02:1**, nearly square — the only outlier. With top-anchored cropping, roughly 37% of that screenshot's height is cut off the bottom.

## Overall Impression

The new card is the right narrative move — it closes the gallery's story arc (diagnose → recommend → **act on record**) instead of padding it. Execution is the problem, not placement: the source screenshot's aspect ratio doesn't match the other five, so the crop hides the exact UI element ("Salva Intervento") that gives the card its point, and the row's own intro copy wasn't touched when the card was added.

## What's Working

1. **Alt text discipline**: every card's `alt` attribute describes the exact on-screen data, including the new one — a rare level of specificity for marketing image alt text.
2. **Frame-level consistency**: border, background, padding, and card sizing are pixel-identical across all 6 cards regardless of source image — the component itself didn't need touching to add a 6th item.
3. **Narrative completion**: the new card is the first one in the row that shows the *action* step (registering an intervention), closing a loop the other 5 only set up.

## Priority Issues

**[P0] Image crop hides the card's own payoff**
Why it matters: `intervento.webp` is near-square (1.02:1) while every other gallery image is wide (1.82:1+). Combined with `object-position: 50% 0%` (top-anchored) on a 16:10 frame, ~37% of the screenshot's bottom is cropped off — the region where the "Salva Intervento" button lives, i.e. the exact UI proof the card's copy promises ("registri l'intervento... resta nello storico"). A skeptical reader checking the claim against the image won't find it.
Fix: Re-crop the source screenshot before converting to webp — crop to the 16:10 region that keeps the form fields *and* the Salva Intervento button (top of the scrolled state, not the full modal), or swap `object-position` for this card to `50% 100%`/`center` so cover anchors on the bottom instead of the top.
Suggested command: `/impeccable layout` or a direct manual re-crop of `public/landing/intervento.webp`.

**[P1] Section intro copy doesn't mention the new content**
Why it matters: "Queste schermate arrivano... alberi, piante, consigli e semenzaio" omits "interventi," so the row's own summary undersells what's now in it — a visible seam.
Fix: Update the intro paragraph in ProductGallery.tsx to include interventi (or generalize the sentence so it doesn't need updating every time a card is added).
Suggested command: `/impeccable clarify`.

**[P1] Copy length inconsistency stretches the row**
Why it matters: The new card's body copy (~140 chars) runs 30-60% longer than the other 5 (~85-110 chars). Because the flex row stretches all cards to equal height, every other card gains dead whitespace under its (shorter) copy to match.
Fix: Tighten the new card's body text to roughly the same length as the other 5, or accept variable card heights (`items-start` instead of default stretch) if variable length is intended going forward.
Suggested command: `/impeccable clarify` then `/impeccable layout`.

**[P2] No position indicator at 6 cards**
Why it matters: A horizontal-scroll gallery with no dots/counter was tolerable at 5 cards; at 6 (and ~2.5 visible at once on desktop, 1 per swipe on mobile) more users will stop scrolling before reaching the last card — which is now the newest, most narratively important one.
Fix: Add a simple dot/counter indicator, or a subtle "scroll for more" affordance.
Suggested command: `/impeccable layout`.

**[P3] Title pattern repetition**
Why it matters: "Ogni consiglio, con il suo perché" (card 3) and "Ogni intervento, sulla pianta giusta" (card 6) both open with "Ogni" — minor rhythm repetition in an otherwise varied set of titles.
Fix: Optional rewording of one title for variety.
Suggested command: `/impeccable clarify`.

## Persona Red Flags

**Jordan (first-timer)**: The section's own intro copy doesn't mention "interventi," so nothing signals this content is coming — Jordan has no scent to keep scrolling and may never reach card 6.

**Riley (stress-tester)**: Will compare the card's copy claim ("registri l'intervento... resta nello storico") against the screenshot and find the save action it describes is cropped out of frame — a small credibility hit on a page whose stated positioning is "l'app con dati veri, presa così com'è" (real, unedited screenshots).

**Casey (mobile)**: On a phone, cards render near-full-bleed (one swipe per card); card 6 is both the last swipe (most likely to be abandoned before) and the worst-cropped image (least legible if reached).

## Minor Observations

- `kicker-above-heading` and `overused-font` (Arial 46%) are pre-existing, site-wide patterns, not introduced by this change — worth a separate pass, not blocking this card.
- The `nested-cards` ×6 detector finding could not be confirmed as gallery-related (no location string) and is plausibly a false positive against the plain `<article>` cards.

## Questions to Consider

- Should the new card use a different `object-position` (bottom-anchored) rather than force every image into the same top-anchored 16:10 crop?
- Is 6 cards the practical ceiling for this scroll pattern, or does crossing from 5 to 6 mean it's time for a counter/dots?
- Was `intervento.webp` captured at a different resolution/crop intent than the other five, and should future gallery screenshots be captured pre-cropped to 16:10 to avoid this class of issue?
