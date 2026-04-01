# PRECISION AGRICULTURE EXCELLENCE ROADMAP (2026-03-30)

## Purpose
This roadmap turns the current transversal precision-agriculture foundation into a system that can credibly support:
- cereals, brassicas, legumes, artichoke, industrial crops, orchard, olive, vineyard, protected cultivation
- multiple management scales: site, plot, zone, row, plant, tree, bed, reservoir
- multiple operating contexts: open field, orchard, greenhouse, hydroponic, controlled environment
- multiple climates and soils with explicit confidence, traceability, and economic logic

The focus is not deployability or feature count.
The focus is system maturity.

## Current position
OrtoMio already has:
- a shared agronomic kernel
- transversal crop-profile resolution
- irrigation, phenology, health, prescription, and planner integration
- execution tracing and outcome feedback
- adaptive quality benchmarking and pricing
- first-generation ROI-aware prioritization

The main remaining limits are:
- crop packages are still not deep enough for full agronomic universality
- the soil-water engine is still partially estimated
- geo-climate and microclimate binding are not yet rigorous enough
- ROI is now intelligent, but still only partially grounded in observed economics
- validation by crop family, region, and site type is still too light

## Strategic target
Within 12 months, OrtoMio should behave like a real precision-agriculture operating system, where every important agronomic decision can answer:
1. which crop package is active
2. which phenological phase matters now
3. which soil-water constraints apply on this site
4. which climate and microclimate signals are trustworthy
5. which action protects the most agronomic and economic value

## Target maturity
Current estimated maturity:
- transversal architecture: 8/10
- decision integration: 8/10
- crop-package depth: 6.5/10
- soil-water rigor: 5.5/10
- geo-climate rigor: 5.5/10
- economic intelligence: 6.5/10
- overall precision-agriculture readiness: 6.5/10

12-month target:
- transversal architecture: 8.5/10
- decision integration: 8.5/10
- crop-package depth: 8.5/10
- soil-water rigor: 8/10
- geo-climate rigor: 7.5/10
- economic intelligence: 8/10
- overall precision-agriculture readiness: 8/10

## Delivery principles
1. Depth before breadth.
   Build strong crop families before onboarding more aliases.
2. Measured before estimated.
   Keep heuristics, but always prefer observed site data when available.
3. Confidence must be explicit.
   No recommendation should appear technically equivalent when the data quality differs.
4. One canonical contract.
   Crop, soil, climate, execution, outcome, and economics must use shared system contracts.
5. Validation is part of product, not a postscript.
   Every major workstream ends with crop-family test scenarios and measurable acceptance criteria.

## Workstreams

### W1 - Crop Intelligence
Goal:
- turn current agronomic profiles into real crop packages with operational depth

Must include:
- stage-by-stage phenology
- water sensitivity by phase
- nutrition demand by phase
- health-risk priorities by crop family
- quality metrics by market logic
- economic sensitivity by package

Priority families:
1. winter cereals
2. field brassicas
3. broadacre legumes
4. artichoke and perennial field vegetables
5. industrial and extensive crops
6. orchard generic
7. olive grove
8. vineyard
9. controlled-environment crops

Exit criteria:
- every priority family has a package richer than alias-level mapping
- every package drives irrigation, health, quality, and ROI differently
- no major family still falls back to an unrelated vertical in normal use

### W2 - Soil-Water Engine
Goal:
- move from descriptive hydraulic reasoning to operational soil-water intelligence

Must include:
- field capacity by zone
- wilting point by zone
- available water by zone
- effective rootable depth
- drainage class
- compaction risk
- salinity accumulation risk
- water quality by source
- distinction between observed and estimated hydraulic attributes

Exit criteria:
- irrigation, nutrition, and health can read the same normalized soil-water profile
- decisions explicitly state which hydraulic fields are measured vs estimated
- zone-level soil-water constraints materially change recommendations

### W3 - Geo-Climate and Microclimate
Goal:
- stop treating geography and weather as generic environmental context

Must include:
- strong site-to-weather binding
- elevation and exposure awareness
- distinction between regional forecast and local microclimate
- region-sensitive agronomic windows
- explicit signal source quality on weather and sensor signals

Exit criteria:
- operational decisions are always tied to a site/weather context source
- the system can explain whether a recommendation is based on forecast, local sensor, or inferred climate
- region and exposure can materially change timing recommendations

### W4 - Economic Intelligence
Goal:
- make the system managerially useful, not only biologically plausible

Must include:
- observed intervention cost by focus and crop package
- crop-package-specific cost of delay
- protected-value estimation by yield and quality logic
- comparison between alternative actions
- zone-level economic prioritization

Exit criteria:
- each transversal priority can expose intervention cost, delay cost, protected value, and expected net impact
- crop-package economics are no longer generic across cereals, brassicas, orchard, vineyard, and protected systems
- operator-facing surfaces show enough rationale to justify action sequencing

### W5 - Confidence, Explainability, and Data Quality
Goal:
- make every important recommendation auditable and trustworthy

Must include:
- per-signal provenance
- per-signal quality state
- recommendation confidence contract
- missing-signal visibility
- fallback reason visibility

Exit criteria:
- recommendation confidence can be explained from data coverage, source quality, and observed outcomes
- hidden technical fallbacks no longer drive top-level operator decisions silently

### W6 - Validation and Calibration
Goal:
- turn the roadmap into agronomic credibility

Validation scenarios to maintain:
1. winter wheat in rainfed conditions
2. barley with nitrogen-sensitive management
3. broadacre legumes under spring stress
4. brassicas under quality-sensitive bulking
5. artichoke across repeated harvest windows
6. orchard under fruit-quality pressure
7. olive grove with oil-quality sensitivity
8. vineyard around veraison and ripening
9. controlled-environment leafy crop with water-quality constraints

Exit criteria:
- each scenario has expected agronomic behavior, expected economic behavior, and expected confidence behavior
- major regressions become visible before production changes scale

## Roadmap by time horizon

### Phase A - 0 to 30 days
Objective:
- strengthen foundations already started and remove remaining structural gaps

Priority deliverables:
1. Deepen crop packages for winter cereals, field brassicas, broadacre legumes, artichoke, industrial broadacre.
2. Extend soil-water profile with more explicit zone-level measured vs estimated state.
3. Persist more observed economic signals into measured feedback and operation registry.
4. Tighten confidence/rationale surfacing in planner, director, irrigation, nutrition, and health.

Files and systems likely impacted:
- `data/agronomicCropProfiles.ts`
- `services/agronomicKernelService.ts`
- `services/soilAnalysisService.ts`
- `services/advancedIrrigationService.ts`
- `services/agronomicEconomicPriorityService.ts`
- `services/agronomicMeasuredFeedbackService.ts`
- `services/operationRegistryService.ts`

Exit criteria:
- crop-family packages drive materially different water, quality, and ROI outputs
- soil-water explanations clearly distinguish observed vs inferred values
- ROI can read more real cost/value data than today

### Phase B - 30 to 90 days
Objective:
- make the system site-aware enough to support stronger real-world precision logic

Priority deliverables:
1. Geo-climate site binding overhaul.
2. Microclimate confidence layering.
3. Zone-level salinity and drainage propagation into irrigation, health, and nutrition.
4. Alternative-action comparison in the transversal queue.
5. Validation harness for core crop families.

Files and systems likely impacted:
- `services/weatherService.ts`
- `services/geoClimateService.ts`
- `services/healthMicroclimateService.ts`
- `services/agronomicPriorityService.ts`
- `services/agronomicActionQueueService.ts`
- `services/directorService.ts`
- scenario-specific validation docs and fixtures

Exit criteria:
- the queue can explain why one intervention beats another economically and agronomically
- site + weather + crop package change decisions in a measurable way
- at least 6 validation scenarios are executable and reviewable

### Phase C - 3 to 6 months
Objective:
- move from a strong architecture to a serious precision-agriculture system

Priority deliverables:
1. Full crop-package refinement for orchard, olive, vineyard, controlled environment.
2. Region-aware timing logic.
3. Multi-season learning tied to crop package and site.
4. Economic benchmarking by crop family and season.
5. Better registry alignment between execution, outcome, and financial impact.

Exit criteria:
- crop-family differences are visible not only in rationale, but in execution priorities and expected value
- economic decisions can be benchmarked by site and crop family
- repeated campaigns improve thresholds instead of restarting from neutral baselines

### Phase D - 6 to 12 months
Objective:
- reach a level where OrtoMio can credibly position itself as a high-grade transversal precision-agriculture platform

Priority deliverables:
1. Stable agronomic-economic decision engine across major crop families.
2. Strong site profile usable across regions and management systems.
3. Validation-backed confidence model.
4. Managerial views where ROI, quality, timing, and risk are reconciled into one operational picture.

Exit criteria:
- major families no longer depend on generic fallback economics
- soil-water and geo-climate are strong enough to change agronomic choices across different regions
- precision decisions can be defended technically and economically in front of an advanced operator

## Detailed backlog by domain

### Crop packages backlog
For each priority family:
1. Formalize stages and critical windows.
2. Define stage-weighted water sensitivity.
3. Define stage-weighted nutrition demand.
4. Define top health-pressure patterns.
5. Define target quality outputs.
6. Define crop-package-specific economic sensitivity.
7. Add at least 2 validation scenarios.

### Soil-water backlog
1. Promote zone-level hydraulic fields to first-class system data.
2. Distinguish observed sensor-backed values from estimated pedotransfer values.
3. Add salinity-by-zone support where data exists.
4. Add drainage and compaction-driven irrigation adjustments.
5. Use rootable depth instead of nominal root depth wherever possible.

### Geo-climate backlog
1. Normalize absolute site coordinates and weather source binding.
2. Add slope/exposure/elevation to decision context where available.
3. Separate regional forecast confidence from local sensor confidence.
4. Introduce region-specific timing offsets only when confidence is clear.

### Economic backlog
1. Store more real intervention cost from logs and registries.
2. Link value protected to adaptive pricing and crop quality targets.
3. Compare intervention now vs intervention next cycle.
4. Benchmark observed ROI by focus and crop family.
5. Feed economic lessons back into planner and queue ranking.

### Validation backlog
1. Build canonical test gardens by crop family.
2. Define expected signals, expected missing signals, and expected confidence.
3. Define expected intervention ranking for each scenario.
4. Define expected ROI direction, not just agronomic urgency.

## Metrics
Track these metrics monthly:
- number of priority crop families with full packages
- percentage of top queue decisions using measured rather than inferred economics
- percentage of irrigation decisions using zone-level soil-water profiles
- percentage of recommendations with explicit confidence and missing-signal rationale
- number of validation scenarios passing without manual overrides
- ratio of queue items with crop-aware ROI vs focus-only ROI

## Risk register
1. Over-modeling without validation.
   Mitigation: every major crop-package extension must ship with scenarios.
2. Economic claims becoming too confident.
   Mitigation: keep confidence visible and separate observed from inferred economics.
3. Too many crop aliases mapped to shallow packages.
   Mitigation: limit expansion until package depth is acceptable.
4. Sensor and weather quality inconsistency.
   Mitigation: keep provenance and fallback rationale explicit.

## Recommended execution order
1. crop packages
2. soil-water
3. geo-climate
4. economic intelligence
5. validation and calibration

This is the correct order because:
- crop packages define what should matter
- soil-water and geo-climate define why it matters on this site
- economics defines what it is worth operationally
- validation proves the system behaves correctly

## Immediate next block
If implementation resumes after this roadmap, the highest-value next block is:
1. finish depth on crop packages for major families
2. bind crop-package economics to more real observed values from execution and harvest
3. raise zone-level soil-water from useful approximation to first-class operational state
