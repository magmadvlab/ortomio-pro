# PRECISION AGRICULTURE NEXT EXECUTION PLAN (2026-04-01)

Companion documents:
- `docs/reports/PRECISION_AGRICULTURE_IMPROVEMENT_PLAN_2026-03-31.md`
- `docs/reports/TRANSVERSAL_PRECISION_AGRICULTURE_IMPLEMENTATION_PLAN_2026-03-29.md`
- `docs/reports/PRECISION_AGRICULTURE_EXCELLENCE_ROADMAP_2026-03-30.md`
- `docs/reports/ORTOMIO_PLATFORM_CAPABILITIES_2026-03-30.md`

## Purpose
This document replaces scattered "what next?" reasoning with one execution-focused plan for the next development wave.

It is meant to be the starting brief for the next chat.

## Status Review (2026-04-18)
This plan is now only partially current.

Current implementation status versus the original blocks:

### Block 1 - Crop Package Deepening
Status:
- largely implemented

Evidence now present in code:
- winter cereals package exists
- field brassicas package exists
- broadacre legumes package exists
- perennial field vegetables and artichoke package exist
- industrial/extensive crops package exists
- orchard / olive / vineyard packages also already exist in a first materially differentiated form

Primary evidence:
- `data/agronomicCropProfiles.ts`

Residual gap:
- further agronomic refinement is still possible, but Block 1 is no longer the main missing layer

### Block 2 - Forecast Persistence and Geo-climate Hardening
Status:
- partially implemented, still the main remaining architecture gap

What is already implemented:
- persisted daily weather history exists
- persisted forecast snapshots are embedded in persisted weather payloads
- persisted environmental lineage and derived indicators exist
- site-weather binding exists with slope / exposure context
- environmental history summaries are reusable by downstream services
- local sensor confidence and regional forecast confidence are explicitly distinguished in environmental monitoring

What is still incomplete:
- weather caching is still explicitly localStorage-first and Supabase cache is disabled because of RLS/access issues
- canonical forecast persistence is not yet cleanly unified across all weather consumers
- some recommendation surfaces still consume forecast availability indirectly instead of through one canonical persisted forecast layer
- geo-climate hardening exists in parts of the system, but not yet as one finished end-to-end contract

Primary evidence:
- `services/dailyDiaryService.ts`
- `services/environmentalMonitoringService.ts`
- `services/weatherCacheService.ts`

### Block 3 - Validation Harness
Status:
- materially implemented

Evidence now present in code:
- canonical agronomic validation scenarios exist
- there are 9 executable scenario fixtures, covering cereals, legumes, brassicas, artichoke, orchard, olive, vineyard, and controlled environment
- a validation harness service exists and computes scenario outcomes
- dedicated tests verify expected top candidate, score/confidence floor, and ROI direction

Primary evidence:
- `data/agronomicValidationScenarios.ts`
- `services/agronomicValidationHarness.ts`
- `__tests__/precision-hub/agronomicValidationHarness.test.ts`

Residual gap:
- runner/tooling integration can still be hardened, but the validation layer itself now exists

### Block 4 - Alternative-action Economics
Status:
- materially implemented

Evidence now present in code:
- explicit comparison between `intervene_now`, `next_cycle`, and `monitor`
- economic action comparison computes ranked scenarios and a dominance margin
- queue and priority scoring already consume the comparison result
- crop packages can tune next-cycle preference and urgency behavior

Primary evidence:
- `services/agronomicEconomicPriorityService.ts`
- `services/agronomicPriorityService.ts`
- `services/agronomicActionQueueService.ts`

Residual gap:
- explanation quality can still improve, but the core system layer now exists

## Revised Next Priority
The next main priority is no longer crop-package deepening.

The real next priority is:
1. finish forecast persistence and geo-climate hardening end to end
2. unify weather consumers around the persisted forecast/environmental contract
3. remove transitional cache behavior and RLS workarounds in weather caching
4. only after that, continue with second-order crop refinement and validation/UX hardening

## Practical Conclusion
If this document is reused as a starting brief in a new chat, it should no longer say that Blocks 1, 3, and 4 are missing.

The accurate summary today is:
- Block 1 is largely done
- Block 3 exists
- Block 4 exists
- Block 2 remains the principal unfinished systems layer

## Original 2026-04-01 Snapshot
The sections below preserve the original plan wording for historical context.

## What was already materially completed at that time

### Completed foundation
- shared agronomic kernel and transversal queue foundation
- agronomic priority contract across irrigation, health, prescription, phenology, and director
- measured feedback loop tied to queue execution and outcomes
- first crop-aware ROI layer

### Completed in the latest implementation wave
- operational economics now persist real or grounded cost/value signals across irrigation, nutrition, treatment, mechanical work, and harvest
- soil-water reasoning is now more zone-first, with measured vs estimated quality, compaction, drainage, salinity, and effective root-depth logic
- weather is now partially persistent and historically explainable through:
  - daily weather lineage
  - derived agronomic indicators
  - zone-level environmental ledger
  - garden/zone environmental summaries
- environmental history now materially affects:
  - health monitoring
  - weather-aware scheduling
  - predictive yield, disease, and water-demand models
  - director recommendations
  - economic priority scoring
  - prescription intelligence

## What was not finished yet at that time

### A. Crop-package depth is still the main remaining product gap
Still missing:
- deeper crop packages for winter cereals
- deeper crop packages for field brassicas
- deeper crop packages for broadacre legumes
- stronger package for artichoke and perennial field vegetables
- stronger package for industrial/extensive crops
- later refinement for orchard, olive, vineyard, and controlled environment packages

Why this remains the top gap:
- the architecture is now strong enough
- the main limit is agronomic depth by family, not generic integration

### B. Geo-climate rigor is still incomplete
Still missing:
- canonical persistence of short-term forecast instead of mostly transient runtime/cache behavior
- stronger site-to-weather binding
- elevation/exposure/slope-aware timing logic
- explicit distinction between regional forecast confidence and local sensor confidence in all recommendation surfaces
- region-sensitive agronomic windows

### C. Validation harness does not yet exist as a formal system layer
Still missing:
- canonical validation gardens by crop family
- scenario fixtures with expected agronomic, economic, and confidence outputs
- regression harness for queue ranking, prediction logic, and ROI direction

### D. Alternative-action comparison is still weak
Still missing:
- explicit comparison between "intervene now", "delay", and "monitor"
- economic comparison between alternative actions inside the transversal queue
- operator-facing explanation of why one action dominates another

### E. Some environmental persistence remains transitional
Still missing:
- canonical forecast persistence path, not only runtime fetch + local cache
- clearer storage strategy for forecast snapshots vs observed weather vs derived indicators
- explicit retention/history policy for environmental ledger consumers

## Consolidated remaining roadmap

### Block 1 - Crop Package Deepening
Goal:
- turn the current transversal engine into a truly crop-differentiated system

Priority families:
1. winter cereals
2. field brassicas
3. broadacre legumes
4. artichoke and perennial field vegetables
5. industrial and extensive crops

Primary files:
- `data/agronomicCropProfiles.ts`
- `services/agronomicKernelService.ts`
- downstream engines already wired to kernel profiles

Exit criteria:
- each family materially changes irrigation, health, quality, and ROI behavior
- no major family relies on generic fallback logic in normal use

### Block 2 - Forecast Persistence and Geo-climate Hardening
Goal:
- finish the climate layer so weather stops being partially transient

Primary targets:
- persist short-term forecast snapshots with source lineage
- distinguish canonical observed weather, forecast weather, and derived environmental state
- introduce stronger site-weather binding
- propagate slope/exposure/elevation where available
- expose climate confidence more explicitly in recommendation surfaces

Primary files:
- `services/weatherService.ts`
- `services/weatherCacheService.ts`
- `services/operationContextService.ts`
- site/weather context services
- director/planner/recommendation consumers

Exit criteria:
- forecast is no longer only transient runtime context
- timing and action windows can vary by site characteristics, not only by crop defaults

### Block 3 - Validation Harness
Goal:
- make the system testable against agronomic expectations, not only unit-level logic

Priority scenarios:
1. rainfed wheat
2. barley with nitrogen sensitivity
3. legumes under spring stress
4. brassicas under quality bulking
5. artichoke under repeated harvest windows
6. orchard under fruit-quality pressure
7. olive grove with oil-quality pressure
8. vineyard near ripening
9. protected cultivation with water-quality constraints

Primary outputs:
- canonical fixtures
- expected queue ranking
- expected confidence direction
- expected ROI direction
- expected health / irrigation / prediction behavior

Exit criteria:
- at least 6 scenarios are executable and reviewable
- future regressions become visible before release

### Block 4 - Alternative-action Economics
Goal:
- move from single-action scoring to action comparison

Primary targets:
- compare intervene now vs next cycle vs monitor
- expose relative agronomic and economic dominance
- feed comparison into queue ranking and director recommendations

Primary files:
- `services/agronomicPriorityService.ts`
- `services/agronomicEconomicPriorityService.ts`
- `services/agronomicActionQueueService.ts`
- `services/directorService.ts`

Exit criteria:
- queue can justify why action A should beat action B, not only why A is individually urgent

## Recommended order for the next chat
1. Block 1 - Crop Package Deepening
2. Block 2 - Forecast Persistence and Geo-climate Hardening
3. Block 3 - Validation Harness
4. Block 4 - Alternative-action Economics

## Suggested opening prompt for the next chat
Use `docs/reports/PRECISION_AGRICULTURE_NEXT_EXECUTION_PLAN_2026-04-01.md` as the canonical continuation plan.
Assume:
- operational economics, soil-water hardening, and environmental circulation are already implemented
- the next priority is crop-package deepening for cereals, brassicas, legumes, artichoke, and industrial/extensive crops
- after that, continue with forecast persistence / geo-climate hardening and then validation harness

## Stop conditions for this plan
This plan should be replaced once:
- the 5 priority crop families are materially deepened
- forecast persistence and geo-climate hardening are completed
- a usable validation harness exists
