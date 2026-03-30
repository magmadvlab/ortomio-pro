# TRANSVERSAL PRECISION AGRICULTURE IMPLEMENTATION PLAN (2026-03-29)

## Objective
Transform OrtoMio from a collection of strong agronomic modules into a transversal agronomic platform able to support:
- any crop family: cereals, vegetables, legumes, orchards, vineyards, olive groves, protected cultivation, controlled environment
- any agronomic scale: site, plot, zone, row, plant, tree, bed, reservoir
- any operating context: open field, greenhouse, indoor, hydroponic, aquaponic, aeroponic
- any region, soil, and climate condition with explicit confidence and data quality

The core principle is simple:
- do not add more crop-specific logic until the shared agronomic kernel is strong enough
- every recommendation must be explainable through context, measurements, crop profile, execution trace, and observed outcome

## Current reality
The codebase already has useful foundations:
- operational weather, sensors, Smart Hub telemetry, irrigation analytics
- plant taxonomy, master sheets, phenology, quality results, prescription execution
- some strong verticals for orchard, olive grove, vineyard, and controlled environment

What is still missing is the transversal layer:
- a canonical crop profile model that works across cereals, horticulture, woody crops, and protected systems
- a canonical site profile that captures soil, water, terrain, and regional constraints
- a canonical decision contract linking data quality, confidence, execution, and outcome

## Strategic target
Build a shared agronomic kernel with 7 layers:
1. site profile
2. crop profile
3. phenology profile
4. measurement profile
5. operation ledger
6. decision engine
7. learning loop

## Workstreams

### W1 - Agronomic Kernel
Goal:
- define one universal domain model for crops, systems, scopes, and decision requirements

Deliverables:
- `types/agronomicKernel.ts`
- `data/agronomicCropProfiles.ts`
- `services/agronomicKernelService.ts`

Acceptance:
- every crop can resolve to a canonical agronomic profile, even when only taxonomy or custom crop data is available
- every profile declares water, nutrition, health, quality, and required signals

### W2 - Site and Pedoclimatic Profile
Goal:
- move from static garden metadata to an operational site model

Missing capabilities to implement:
- field capacity by zone
- wilting point by zone
- effective rooting depth
- infiltration rate
- compaction / bulk density
- water quality and salinity by source
- terrain, exposure, and obstacle persistence

Acceptance:
- every decision engine can read a normalized site profile without guessing from UI-only fields

### W3 - Universal Crop Packages
Goal:
- support crop families through reusable agronomic packages instead of one-off logic

Priority packages:
1. open-field cereals: wheat, barley, durum wheat, maize
2. leafy vegetables and brassicas
3. fruiting vegetables
4. legumes
5. perennial field vegetables: artichoke, asparagus
6. orchard, olive grove, vineyard
7. controlled-environment leafy and fruiting crops

Each package must define:
- lifecycle type
- main management scope
- phenology milestones
- water strategy
- nutrition strategy
- health pressure model
- quality targets
- required sensors and confidence rules

Acceptance:
- new crops are onboarded by profile configuration first, code branching second

### W4 - Context, Traceability, and Confidence
Goal:
- make every operation and recommendation auditable

Missing capabilities to harden:
- context snapshot persistence on all write paths
- no silent weather fallback for operational decisions
- explicit data quality score on every key signal
- explicit confidence score on recommendations
- full `decision -> execution -> outcome` linkage

Acceptance:
- no agronomic recommendation is emitted without data provenance, context source, and confidence

### W5 - Closed-loop Agronomy
Goal:
- compare what was planned, what was executed, and what actually happened

Priority outcomes:
- irrigation effect
- treatment effect
- nutrition response
- phenology advancement
- yield and quality shift

Acceptance:
- every prescription or recommendation can be evaluated against outcome by crop, scope, season, and site

### W6 - Regionalization and Local Adaptation
Goal:
- stop reasoning with coarse approximations and move to location-aware agronomy

Priority improvements:
- replace simplified USDA-style heuristics with real climate surfaces and agronomic regionalization
- store agro-climatic region, frost profile, chill accumulation, heat accumulation, rainfall regime
- support cultivar-specific adaptation by region

Acceptance:
- location compatibility is based on real agronomic evidence, not only heuristic latitude bands

## Execution order

### Phase P0 - Shared kernel and data reliability
1. Create the agronomic kernel domain model.
2. Seed transversal crop profiles for the main crop families.
3. Resolve crop profiles from taxonomy, aliases, and custom crops.
4. Harden operation context persistence and weather binding.
5. Normalize site profile persistence.

### Phase P1 - Universal crop packages
1. Cereals package
2. Leafy/brassica package
3. Fruiting vegetables package
4. Legume package
5. Perennial vegetable package
6. Orchard/olive/vineyard package alignment
7. Controlled-environment package alignment

### Phase P2 - Decision engine integration
1. Feed kernel profiles into irrigation logic.
2. Feed kernel profiles into phenology logic.
3. Feed kernel profiles into health risk logic.
4. Feed kernel profiles into recommendation ranking and confidence.

### Phase P3 - Learning and benchmarking
1. Outcome scoring by crop package
2. Site-specific calibration
3. Multi-season benchmarking
4. ROI-aware agronomic prioritization

## Immediate sprint
This sprint starts with W1.

### Sprint objective
Create the first reusable agronomic kernel layer so the app can stop relying on crop-specific branching as the only scaling strategy.

### Sprint tasks
1. Add universal agronomic kernel types.
2. Add initial transversal crop profiles:
   - cereals
   - leafy vegetables
   - fruiting vegetables
   - legumes
   - aromatic mediterranean crops
   - perennial field vegetables
   - orchard
   - olive grove
   - vineyard
   - controlled environment
3. Add a resolver service from plant ID, taxonomy, and custom crops.
4. Use the resolver in the next step inside planning and recommendation services.

## Started on 2026-03-29
The work below is started together with this document:
- `types/agronomicKernel.ts`
- `data/agronomicCropProfiles.ts`
- `services/agronomicKernelService.ts`

These files are the first technical foundation of the transversal architecture.

## Progress log

### Completed in the current implementation wave
- `customCropService` can now resolve a canonical agronomic profile for custom crops.
- `enhancedPromptService` and `contextAwareAIService` now inject agronomic context into AI reasoning.
- `aiPlanningService` now uses the agronomic profile to orient cultivation method and planning context.
- `advancedIrrigationService` is now the first operational engine connected to the kernel:
  - resolves agronomic crop profiles from crop name / taxonomy inputs
  - assigns a profile-based fallback crop stage when explicit stage data is missing
  - computes explicit confidence from high-priority signal coverage
  - records agronomic reasoning, water strategy, root profile, and missing P0 signals
  - stores an informative agronomic adjustment factor without overriding the hydraulic base calculation
- `phenologyService` now returns a usable agronomic fallback state even when no explicit phenology observation is stored:
  - keeps observed phenology when available
  - falls back to the canonical crop profile stage when observations are missing
  - exposes source and confidence so downstream services can distinguish confirmed vs inferred stage
- `plantHealthMonitoringService` now uses the kernel to reduce vertical hardcoding:
  - resolves a dominant agronomic profile from task crop names or garden context
  - filters monitoring rules by crop aliases, agronomic profile, and health priorities
  - enriches alert descriptions with agronomic profile and phenology source
  - adjusts alert confidence using real health-signal coverage and phenology quality
  - ranks health alerts with agronomic weighting instead of simple generation order
- `agronomicPriorityService` now defines the first shared priority contract:
  - resolves agronomic profiles from contextual hints
  - evaluates P0 signal coverage by decision focus (`water`, `nutrition`, `health`, `quality`)
  - normalizes cross-engine score and confidence into one reusable model
- `prescriptionAgronomicIntelligenceService` now uses the shared priority contract:
  - resolves an agronomic profile from crop context / garden hints
  - converts zone statuses into agronomic signal availability
  - adjusts operational priority scores using profile focus and P0 signal coverage
  - exposes profile id, priority confidence, and missing signals inside operational priorities
- `advancedIrrigationService` now exposes shared-priority metadata inside irrigation efficiency reports:
  - derives a water-focused priority score from efficiency, uniformity, and water-use performance
  - maps available irrigation execution signals into agronomic signal coverage
  - exposes profile id, confidence, and missing P0 signals for irrigation decisions
- `directorService` now uses the same shared priority contract for daily briefing actions:
  - resolves crop profile hints from AI suggestion context and metadata
  - maps suggestion data sources into agronomic signal availability
  - ranks briefing actions with transversal agronomic scoring instead of raw `action_priority + confidence`
- `agronomicActionQueueService` now exists as explicit cross-engine merger:
  - normalizes health, irrigation, prescription, phenology, and director outputs into one shared queue contract
  - exposes priority score, confidence, agronomic focus, urgency label, and missing P0 signals for each item
- `directorService` and `DirectorBriefingWidget` now consume the transversal queue in a real user-facing flow:
  - gather garden, task, device, irrigation, prescription, and phenology context from the storage layer
  - merge partial outputs from multiple agronomic engines with graceful degradation when one source is unavailable
  - expose one ranked queue inside the daily briefing so the UI can compare water, health, phenology, and prescription priorities side by side
- `agronomicQueueTaskService` and the planner now close the next operational step:
  - convert ranked queue items into normalized `GardenTask` drafts with task type, scheduling, traceability, and notes
  - avoid duplicate task generation when an open task already exists for the same queue item
  - expose the resulting drafts inside the planner so the user can materialize transversal priorities into actionable work items
- `agronomicQueueOutcomeService` and planner task updates now start the closed loop:
  - persist outcome records for completed tasks created from the transversal queue using the storage preference layer
  - keep structured agronomic metadata attached to generated tasks so completion can be traced back to queue source, focus, score, and missing signals
  - trigger both existing crop-learning hooks and transversal outcome recording when a queue-derived task is completed in the planner
  - expose execution summary in the planner so the user can see how many transversal priorities have actually been executed
- the transversal closed loop now checks real execution evidence:
  - scans irrigation, fertilization, treatment, mechanical work, and harvest logs already available in storage
  - links completed queue-derived tasks to the most plausible operational log using explicit references first and narrow temporal/scope matching second
  - distinguishes `task completed`, `execution verified`, and `measured outcome available`, which is essential for trustworthy agronomic benchmarking
- the execution write path now starts carrying direct task lineage:
  - `UnifiedOperationRequest` and the execution bridge support `sourceTaskId`
  - fertilizer logs persist the source task directly when the execution starts from a task-aware flow
  - irrigation, treatment, work, and plant-operation notes now embed a standard `SOURCE_TASK` marker, reducing dependence on fuzzy post-hoc matching
- planner launch surfaces now reuse a shared task-aware execution launcher:
  - `TaskList` and `TaskCalendar` both open nutrition execution flows from the same helper, reducing divergence between planner views
  - the launcher preserves source task, zone, and row context without forcing every planner `rowId` into `fieldRowId`
  - the nutrition page now converts row/task context into explicit execution notes when a strict `fieldRowId` is not available
- irrigation execution is now launchable from planner surfaces with direct lineage:
  - the shared launcher routes irrigation tasks to `/app/irrigation` with source task, zone, date, and row context
  - the irrigation page is now query-aware and opens `WateringLogForm` directly when execution starts from a planner task
  - the watering form accepts initial date and notes so the operator sees the scheduled context before logging the real execution
- dashboard entrypoints now keep task-aware context visible:
  - nutrition and irrigation pages expose a shared execution-context banner even after the first redirect has already opened the form/modal
  - the operator can resume the task-linked execution flow from the dashboard surface without rebuilding the context manually
  - this reduces lineage loss when the first modal is closed or the user navigates across tabs before executing
- mechanical work now joins the same execution contract:
  - planner task launches can route mechanical task types to `/app/mechanical-work`
  - the mechanical page is now query-aware, shows the same execution-context banner, and opens a real execution modal instead of remaining purely configurative
  - mechanical logs persist the `SOURCE_TASK` marker in notes, so queue outcome matching can use explicit lineage instead of relying only on temporal/type coincidence
- harvest now closes the strongest measured loop:
  - planner `Harvest` tasks can route directly to `/app/harvest`
  - the harvest page preserves task context with the shared banner and opens the registration modal already linked to the source task when possible
  - because harvest logs already persist `task_id`, the flow now connects priority -> task -> execution -> measured outcome with minimal inference
- task-aware launch parsing is now centralized:
  - `taskExecutionOrchestratorService` owns query parsing and shared contextual note generation
  - nutrition, irrigation, mechanical work, and harvest pages now consume the same orchestrator instead of duplicating route parsing logic
  - this reduces drift between modules and makes future task-aware verticals cheaper to add
- task-aware launch request generation is now centralized too:
  - the orchestrator now builds typed launch payloads for treatment planner, harvest modal, irrigation execution state, and mechanical execution initial data
  - nutrition, irrigation, mechanical work, and harvest pages no longer re-encode the same `TaskExecutionContext -> UI launch request` mapping locally
  - this makes the execution contract more stable as new task-aware modules are added and reduces the risk of cross-vertical drift
- page bootstrap behavior is now partially centralized:
  - the orchestrator now returns bootstrap state for nutrition, irrigation, harvest, and mechanical execution flows instead of leaving each page to reconstruct tab/modal state ad hoc
  - pages still own their local React state, but the translation from `TaskExecutionContext` to `activeTab + launch payload + modal visibility` is now standardized
  - this materially reduces drift between verticals and lowers the cost of adding a new task-aware operational module
- post-execution reconciliation is now moving behind one contract:
  - `taskExecutionPostActionService` standardizes what happens after a real operation is logged: close the execution surface, refresh the relevant UI slices, and sync agronomic queue evidence for the garden
  - irrigation, nutrition completion, mechanical work, and harvest now reuse the same reconciliation path instead of each module deciding independently how to close, refresh, and resync outcomes
  - harvest also uses the same contract to push the linked crop task to `Harvested`, reducing special-case logic inside the dashboard
- measured agronomic feedback now has a transversal registry:
  - `agronomicMeasuredFeedbackService` stores normalized observed signals across operations, instead of leaving watering response, treatment effectiveness, harvest quality, and mechanical performance trapped inside vertical-specific records
  - irrigation now records applied volume, duration, and moisture delta; nutrition completion records coverage/effectiveness/follow-up; harvest records quantity and quality; mechanical work records area, duration, depth, and cost
  - the shared post-action service can persist these measured signals together with outcome reconciliation, creating the first real bridge from execution evidence to reusable agronomic learning data
- measured feedback now starts influencing decisions:
  - `agronomicPriorityService` can apply a measured-feedback correction to score and confidence, using recent observed outcomes as a site-specific modifier rather than a separate heuristic tree
  - `directorService` now injects the measured-feedback registry into the transversal queue, so shared ranking can react to recent irrigation response, treatment efficacy, and harvest quality
  - `prescriptionMapsService` and `prescriptionAgronomicIntelligenceService` now consume recent measured feedback as a benchmarking signal, producing stronger zone-level rationale when observed outcomes contradict or reinforce the prescription strategy
- measured feedback now reaches upstream recommendation engines:
  - `advancedIrrigationService` now reads recent observed water-response feedback for the zone and uses it to adjust agronomic factor, confidence, and reasoning before the requirement is persisted
  - `plantHealthMonitoringService` now raises alert confidence and ranking when recent observed outcomes already show weak treatment efficacy, weak water response, or poor quality, so the health engine reacts earlier
  - `aiPlanningService.optimizePlan` now converts real yield/cost/weather feedback into explicit optimization recommendations, so planning adjustments are driven by observed performance rather than only static placeholders
- site-specific profile learning now has a persistent layer:
  - `agronomicProfileLearningService` rebuilds learning snapshots from the measured-feedback registry and stores stable, reusable adaptations per focus/zone/profile context
  - `taskExecutionPostActionService` now refreshes these learning snapshots every time new measured feedback is recorded, so the system accumulates memory instead of reading only the most recent events
  - `advancedIrrigationService` now combines recent feedback with learned adaptation snapshots, which is the first real step toward zone-specific response curves rather than season-by-season stateless advice
- learning snapshots now start changing operational thresholds, not only ranking:
  - `agronomicProfileLearningService` now exposes adaptive health, nutrition, and quality adjustments that translate stored site memory into explicit thresholds and sensitivities
  - `plantHealthMonitoringService` now uses these adjustments to lower or relax weather-trigger thresholds, change urgency/confidence, and escalate chronic risk sooner when the site has a recurring weak-response history
  - `advancedNutritionService` now uses adaptive effectiveness targets and follow-up thresholds for analytics, dashboard alerts, and recommendations, making treatment evaluation depend on observed site behavior instead of one static global baseline
- nutrition UI now surfaces the adaptive contract:
  - `NutritionAnalytics` now shows the current site-specific target and uses it in compliance/effectiveness interpretation instead of hard-coded static thresholds
  - `ProfessionalNutritionDashboard` now shows the adaptive target, alert floor, and follow-up threshold together with the agronomic rationale so the operator can understand why the engine is stricter or more tolerant on that site
  - nutrition effectiveness metrics are now normalized as percentages in analytics/dashboard flows, aligning the service output with the UI expectation and making adaptive thresholds legible to the user
- quality-sensitive engines now start consuming the same adaptive memory:
  - `prescriptionAgronomicIntelligenceService` now uses site-specific quality benchmarks for harvest-oriented maps, adding explicit pressure when the latest zone outcome stays below adaptive rating/Brix targets instead of relying only on generic outcome classes
  - `PrescriptionMapsService` now passes agronomic learning snapshots into the prescription intelligence layer, so quality logic can compare each zone against a remembered site benchmark
  - `HarvestTrackingService` now computes quality status against adaptive site thresholds and generates harvest suggestions based on target vs floor, not only on raw historical trend
- harvest UI now exposes adaptive quality benchmarking:
  - `HarvestDashboard` now loads quality learning snapshots from storage and shows current site-specific quality target, alert floor, and indicative Brix benchmark
  - harvest operators now see whether recent quality is above target, watch-level, or below threshold, together with site-memory rationale and concrete operational suggestions
  - this closes another important gap in the transversal model: quality is no longer a passive log field but an adaptive decision reference
- historical comparison now reads quality through the adaptive benchmark too:
  - `historicalComparisonService` now carries adaptive quality target/floor, benchmark gap, and Brix references inside each historical snapshot instead of treating map quality as a context-free scalar
  - zone evolution, seasonal patterns, and summary insights now call out when historical outcomes remain below the site-specific quality benchmark, so the comparison engine no longer uses only static quality baselines
  - the result `quality` payload now exposes adaptive benchmark status, average gap, target score, floor score, and notes, making the benchmark machine-readable for downstream surfaces
- historical comparison UI now surfaces the benchmark explicitly:
  - `HistoricalComparisonPanel` now shows adaptive benchmark score, alert floor, average historical gap, Brix reference, and site-memory notes before the detailed tabs
  - this means the operator can read the whole historical comparison against the remembered site standard, not only against raw map scores
  - together with harvest and prescription updates, the transversal quality contract now covers operational, benchmarking, and historical decision layers
- legacy reports now interpret quality through the same adaptive benchmark:
  - `app/app/reports/page.tsx` now loads the active garden memory layer and resolves a site-specific quality target/floor/Brix contract for the currently selected crop
  - the summary tab now shows current quality against the adaptive benchmark, including status, gap, and site-memory notes instead of presenting quality as a context-free star score
  - the comparison tab now evaluates cycles against both the best cycle and the adaptive site target, so the operator can separate relative historical performance from whether the site is actually on benchmark
- secondary historical/traceability consumers now use the adaptive quality contract too:
  - `ZoneMemoryView` now compares average and per-record quality against the zone/site benchmark instead of rendering historical quality as a neutral scalar
  - `TraceabilityWidget` now resolves a benchmark per product name, shows target/floor/gap on tracked products, and carries the same benchmark into the detail and QR share surfaces
  - this extends adaptive quality memory beyond dashboards into operator-facing history and market-facing traceability narratives
- analytics/economic consumers now start using adaptive quality memory too:
  - `components/professional/AnalyticsDashboard.tsx` now loads real harvest logs, quality overview, and learning snapshots instead of keeping harvest analytics empty and quality baselines generic
  - the pro analytics surface now exposes adaptive quality target/floor/Brix, links suggestions to the site benchmark, and converts premium positioning into a site-specific economic signal
  - `app/app/analytics/page.tsx` now reads the active garden quality benchmark, shows adaptive quality vs target/floor/Brix in the overview, and replaces static productivity/price quality placeholders with site-aware values
- predictive quality now starts using the same benchmark contract:
  - `services/aiPredictiveEngine.ts` now loads site-specific quality memory for the active garden during yield prediction, attaches target/floor/Brix benchmark context to each quality prediction, and generates benchmark-aware recommendations
  - `components/ai/predictions/YieldPredictionsCard.tsx` now renders target, alert floor, gap, Brix reference, and site-memory notes when predictive quality context is available
  - this closes another transversal gap: predicted quality is no longer just a generic 0-100 score, but a site-relative quality expectation
- pricing and market logic now begin using the adaptive quality contract:
  - `services/adaptiveMarketPricingService.ts` centralizes quality-to-price translation so premium, watch, and defensive pricing can be derived from the site-specific benchmark instead of hard-coded universal thresholds
  - `services/blockchainTraceabilityService.ts` now resolves the garden benchmark before automatic quality-based pricing, stores benchmark status/gap/rationale in chain pricing data, and stops treating premium/discount logic as static
  - `components/analytics/YieldOptimizer.tsx` now recalculates market value using adaptive quality pricing, exposing base price, adjusted price, target/floor, and pricing rationale in the ROI surface
- market-facing traceability messaging now uses the same adaptive pricing layer:
  - `TraceabilityWidget` now derives price positioning from adaptive market pricing per product, showing base price, adjusted price, premium/discount, and benchmark-aware rationale instead of generic premium claims
  - `dominanceIntegrationService` now uses actual chain pricing impact when available for blockchain recommendations, and competitive messaging no longer hard-codes fixed premium percentages where the product now has site-specific pricing logic
  - this reduces a key product risk: commercial claims and operator-facing traceability narratives are now more aligned with measurable lot performance

### Next implementation target
- propagate the adaptive-threshold contract into the remaining premium-market and consumer surfaces, especially marketplace-facing UI and any residual premium-quality narratives still based on static assumptions
