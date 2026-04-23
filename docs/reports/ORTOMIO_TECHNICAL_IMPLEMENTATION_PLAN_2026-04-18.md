# ORTOMIO - TECHNICAL IMPLEMENTATION PLAN FOR THE NEXT QUALITY LEAP (2026-04-18)

Companion documents:
- `docs/reports/ORTOMIO_EXECUTION_PLAN_MASTER_INDEX_2026-04-19.md`
- `docs/reports/ORTOMIO_APPLICATION_CURRENT_STATE_2026-04-18.md`
- `docs/reports/ORTOMIO_STAKEHOLDER_PRESENTATION_2026-04-18.md`
- `docs/reports/PRECISION_AGRICULTURE_NEXT_EXECUTION_PLAN_2026-04-01.md`
- `docs/reports/PRECISION_AGRICULTURE_IMPROVEMENT_PLAN_2026-03-31.md`

## Purpose
This document translates the current strategic discussion into one execution-oriented technical plan.

It answers one concrete question:

What should OrtoMio implement next, in what order, to make a real quality leap as a decision-oriented agricultural platform?

This is not a generic product wishlist.
It is an implementation plan anchored to the current codebase.

## Execution Priority Map (2026-04-19)
The current order of execution is:

1. `P1 Agronomic Context Refinement`
   Status:
   - completed
   Delivered:
   - refined cultivar / sub-system / site operational context
   - propagation into explanation, prescription, queue and director flows
   - frontend exposure inside agronomic queue task cards

2. `P2 Field Execution / Mobile Operational Loop`
   Status:
   - active
   Current sub-slice:
   - planner execution readiness layer for agronomic queue tasks
   Reference:
   - `docs/reports/execution-plans/ORTOMIO_EXECUTION_PLAN_P2_FIELD_EXECUTION_LOOP_2026-04-19.md`

3. `P3 Documentation Truthfulness and Product Positioning`
   Status:
   - active after P2-A
   Scope:
   - stakeholder deck
   - current-state report
   - manual pages for planner and activity registry

4. `P4 Type-check and contract cleanup`
   Status:
   - pending

## Starting Point
Today OrtoMio already has a strong technical base:
- operational modules across planning, irrigation, health, harvest, analytics, export, and woody crops
- an agronomic kernel with differentiated crop profiles
- orchestration between suggestion, task, execution, and outcome
- first ROI-aware priority logic
- first environmental history and confidence logic
- NDVI and prescription-map architecture

The main problem is no longer "absence of architecture".
The main problem is uneven maturity.

The next quality leap therefore should not be:
- adding many new pages
- expanding feature count horizontally
- creating more UI around incomplete engines

The next quality leap should be:
- consolidating data contracts
- hardening decision engines
- making precision modules auditable
- turning orchestration into a measurable feedback loop
- specializing a small number of strong verticals before scaling further

## Guiding Principles
The execution plan should follow five rules:

### 1. No wide feature expansion before core hardening
Do not add large new surfaces until the core data, decision, and evaluation layers are stronger.

### 2. Prefer depth over breadth
It is better to make vineyard, orchard, and olive materially stronger than to add five more medium-quality verticals.

### 3. Every recommendation must become explainable
If the system suggests an action, it should be able to explain:
- which signals it used
- which signals were missing
- why the action is urgent
- what economic rationale supports it

### 4. Every important engine must become testable
Priority, irrigation, prediction, and prescription logic should have deterministic validation scenarios and regression checks.

### 5. Real data closure comes before stronger AI claims
The platform should become more data-grounded before becoming more "AI-looking".

## Technical North Star
The target state is:

OrtoMio becomes a decision engine for agriculture, not only a management app.

That means:
- one canonical environmental contract
- one canonical agronomic profile layer
- one canonical decision-priority layer
- one measurable loop from recommendation to outcome
- a small number of verticals that are technically strong enough to support serious external validation

## Recommended Pilot Scope
For the next quality leap, the recommended pilot scope is:

### Primary pilot verticals
- vineyard
- orchard

### Secondary pilot vertical
- olive grove

### Cross-system pilot family
- one open-field family with strong kernel logic, preferably winter cereals or field brassicas

Reason:
- vineyard and orchard already have both vertical UI and differentiated agronomic logic
- olive has strong quality-oriented agronomic modeling
- one open-field family is needed to prove that the system is not limited to woody crops

## Main Workstreams

## Workstream 1 - Canonical Environmental and Data Contract
Goal:
- make all weather, sensor, soil-water, and environmental consumers read one coherent contract

Current strength:
- `services/environmentalMonitoringService.ts`
- `services/weatherService.ts`
- `services/weatherCacheService.ts`
- `services/sensorDataService.ts`
- `services/operationContextService.ts`

Main gaps:
- some consumers still read weather indirectly or inconsistently
- forecast persistence is not yet fully canonical across the system
- data lineage is present, but not uniformly surfaced

Implementation targets:
- define one canonical environmental payload used by irrigation, health, predictions, and prescription
- distinguish explicitly:
  - observed weather
  - forecast weather
  - local sensor readings
  - derived indicators
  - fallback-estimated values
- propagate confidence and source quality consistently
- eliminate transitional cache behavior where possible

Exit criteria:
- every major consumer can say which environmental source it is reading
- recommendation surfaces do not silently mix forecast and observed data
- confidence becomes a first-class field, not an optional afterthought

## Workstream 2 - Agronomic Kernel Formalization
Goal:
- turn the agronomic profiles into a stronger execution-grade kernel

Current strength:
- `data/agronomicCropProfiles.ts`
- `services/agronomicKernelService.ts`
- `services/agronomicPriorityService.ts`
- `services/advancedIrrigationService.ts`

Main gaps:
- crop-stage logic is still partly descriptive rather than computational
- Kc curves by crop stage are not yet formalized in the irrigation engine
- some thresholds remain implicit or heuristic

Implementation targets:
- formalize stage-level Kc behavior for pilot crops
- formalize stress thresholds for pilot crops
- formalize minimum signal requirements by focus:
  - water
  - nutrition
  - health
  - quality
- distinguish measured profile values from estimated profile values in engine behavior

Exit criteria:
- irrigation and priority logic change materially by crop and stage
- pilot crops no longer depend on generic fallback behavior in normal use

## Workstream 3 - Decision Orchestration and Explainability
Goal:
- make the orchestration layer visible, explainable, and auditable

Current strength:
- `services/agronomicPriorityService.ts`
- `services/agronomicEconomicPriorityService.ts`
- `services/taskExecutionOrchestratorService.ts`
- `services/agronomicMeasuredFeedbackService.ts`
- `services/agronomicQueueOutcomeService.ts`

Main gaps:
- the decision chain exists, but explanation quality is still uneven
- some decisions are strong internally but under-explained externally

Implementation targets:
- create a standard explanation payload for every critical recommendation:
  - resolved crop profile
  - available signals
  - missing P0 signals
  - urgency rationale
  - economic rationale
  - confidence rationale
- persist recommendation snapshots before execution
- persist outcome snapshots after execution
- make the recommendation-to-task-to-outcome chain queryable

Exit criteria:
- one can inspect why a recommendation was generated
- one can compare suggested action vs executed action vs observed outcome
- the orchestration layer becomes reviewable by technical and agronomic stakeholders

## Workstream 4 - Precision Data Fusion and Prescription Hardening
Goal:
- move prescription maps from strong architecture to stronger field credibility

Current strength:
- `services/prescriptionMapsService.ts`
- `services/prescriptionExecutionService.ts`
- `services/prescriptionAgronomicIntelligenceService.ts`
- `services/ndviSatelliteService.ts`

Main gaps:
- some data acquisition points are still placeholder-based
- soil value fusion remains simplified
- garden bounds are still defaulted in part of the service
- economic assumptions are generic

Implementation targets:
- replace default garden bounds with real geometry or resolved boundaries
- replace placeholder plant/soil data fetch paths with real providers
- distinguish fused-value confidence by source quality
- calibrate prescription cost analysis per crop family and operation type
- improve execution comparison and zone performance interpretation

Exit criteria:
- prescription generation uses real source pipelines on pilot verticals
- fused outputs can be explained source by source
- execution variance and outcome summaries are credible enough for agronomic review

## Workstream 5 - Evaluation and Validation Layer
Goal:
- make system quality measurable

Current strength:
- `services/agronomicValidationHarness.ts`
- `data/agronomicValidationScenarios.ts`

Main gaps:
- the harness exists, but it needs to become a broader acceptance layer for engine evolution

Implementation targets:
- expand validation scenarios for pilot verticals
- add acceptance thresholds for:
  - top recommendation
  - confidence band
  - ROI direction
  - expected signal coverage
- add evaluation fixtures for irrigation logic
- add evaluation fixtures for prescription outcomes where possible

Exit criteria:
- major engine changes must pass scenario validation before being considered acceptable
- system evolution becomes less subjective and more reviewable

## Workstream 6 - Vertical Hardening
Goal:
- turn the strongest domains into reference-quality verticals

Priority order:
1. vineyard
2. orchard
3. olive grove
4. one open-field family

Implementation targets:
- vineyard:
  - stronger coupling between maturation, quality, health, and operational priority
  - improve bridge between Ravaz logic, maturity tracking, harvest timing, and recommendation layer
- orchard:
  - close analytics and per-tree historical comparison
  - strengthen quality and defect-driven decision support
- olive grove:
  - harden persistence and traceability for maturity and phytosanitary pressure
  - connect specialist tools more strongly with the common decision engine
- open-field pilot:
  - prove that stage-aware, signal-aware decision logic works outside woody systems

Exit criteria:
- each pilot vertical has a technically coherent end-to-end story:
  - context
  - signals
  - recommendation
  - task
  - execution
  - outcome

## Execution Phases

## Phase 0 - Planning and Contract Freeze
Suggested duration:
- 1 to 2 weeks

Objective:
- prepare the codebase for focused hardening without branching into scattered work

Actions:
- choose pilot verticals officially
- define canonical environmental contract
- define canonical recommendation-explanation contract
- define success metrics for each phase
- create technical backlog by workstream

Primary files:
- `services/environmentalMonitoringService.ts`
- `services/agronomicPriorityService.ts`
- `services/agronomicEconomicPriorityService.ts`
- `docs/reports/*`

Exit criteria:
- one approved technical contract for environmental data
- one approved technical contract for decision explanations
- one approved pilot scope

## Phase 1 - 30-Day Foundation Hardening
Objective:
- strengthen the core contracts and observability before larger agronomic refactoring

Priority deliverables:
- canonical environmental payload
- canonical recommendation explanation payload
- persistence of recommendation snapshots
- persistence of post-execution outcome snapshots
- stronger confidence propagation
- expansion of validation harness for pilot verticals

Primary files:
- `services/environmentalMonitoringService.ts`
- `services/weatherService.ts`
- `services/weatherCacheService.ts`
- `services/agronomicPriorityService.ts`
- `services/agronomicEconomicPriorityService.ts`
- `services/taskExecutionOrchestratorService.ts`
- `services/agronomicMeasuredFeedbackService.ts`
- `services/agronomicValidationHarness.ts`

Exit criteria:
- every critical recommendation can be explained
- every critical recommendation can be traced to execution and outcome
- pilot verticals have updated validation scenarios

## Phase 2 - 90-Day Engine Hardening
Objective:
- materially improve precision and agronomic consistency on pilot verticals

Priority deliverables:
- stage-aware Kc logic for pilot crops
- stronger soil-water behavior by zone
- removal of prescription placeholders for pilot verticals
- real garden-bound geometry integration where available
- crop-aware cost analysis for prescription and action priority
- stronger field-row and pilot-vertical prediction coherence

Primary files:
- `services/advancedIrrigationService.ts`
- `services/soilAnalysisService.ts`
- `services/advancedNutritionService.ts`
- `services/prescriptionMapsService.ts`
- `services/ndviSatelliteService.ts`
- `services/fieldRowPredictiveService.ts`
- `data/agronomicCropProfiles.ts`

Exit criteria:
- pilot verticals show materially different and stage-aware recommendations
- prescription logic is less placeholder-dependent
- zone constraints materially alter recommendations on pilot verticals

## Phase 3 - 6 to 12 Months Consolidation
Objective:
- move from stronger engineering to system-level credibility

Priority deliverables:
- vertical hardening across vineyard, orchard, olive, and one open-field family
- stronger prediction-output evaluation
- better economic calibration from observed operations
- broader quality metrics:
  - recommendation accuracy
  - input reduction
  - protected value
  - outcome consistency
- documentation of the system as a reviewable technical platform

Primary files:
- all pilot vertical services and dashboards
- `services/operationRegistryService.ts`
- `services/agronomicOperationalEconomicsService.ts`
- `services/agronomicProfileLearningService.ts`
- `services/plantHealthMonitoringService.ts`
- `services/directorService.ts`

Exit criteria:
- the platform can be defended not only as feature-rich, but as technically coherent and measurable
- the strongest verticals are ready for serious agronomic review or external pilot validation

## Recommended Implementation Order
The recommended order is:

1. freeze contracts and pilot scope
2. harden environmental and explanation contracts
3. harden recommendation-to-outcome traceability
4. strengthen validation harness
5. formalize crop-stage and soil-water logic for pilot crops
6. harden prescription data fusion for pilot domains
7. complete pilot vertical end-to-end coherence
8. only then expand horizontally

## What Should Not Be Done First
To protect execution quality, avoid these as first moves:
- building many new dashboards before engine hardening
- adding more generic AI text-generation surfaces
- expanding too many crop families simultaneously
- marketing prescription maps as fully mature before source closure
- broadening vertical count before pilot vertical quality is clear

## Success Metrics
The implementation should be judged by measurable outcomes, not only by completed tickets.

Recommended metrics:
- percentage of critical recommendations with full explanation payload
- percentage of critical recommendations linked to execution and outcome
- percentage of pilot decisions passing validation scenarios
- reduction of placeholder or fallback behavior in pilot engines
- percentage of pilot prescription generation using real data sources
- number of pilot vertical flows with full end-to-end coherence

## Practical Conclusion
The next quality leap is not a UI project.
It is a systems-hardening project.

The correct implementation plan is therefore:
- first, make data and decisions canonical
- second, make core engines stronger and more explainable
- third, harden a small number of strong verticals
- fourth, expand only after the pilot domains are technically credible

If executed in this order, OrtoMio can move from:
- a rich and promising agricultural platform

to:
- a reviewable, measurable, and technically credible agricultural decision system
