# PRECISION AGRICULTURE IMPROVEMENT PLAN (2026-03-31)

Companion documents:
- `docs/reports/TRANSVERSAL_PRECISION_AGRICULTURE_IMPLEMENTATION_PLAN_2026-03-29.md`
- `docs/reports/PRECISION_AGRICULTURE_EXCELLENCE_ROADMAP_2026-03-30.md`
- `docs/reports/ORTOMIO_PLATFORM_CAPABILITIES_2026-03-30.md`

## Purpose
This document consolidates the improvement plan discussed for OrtoMio as a precision-agriculture system.

The goal is not just to keep the platform deployable.
The goal is to make the agronomic system deeper, more transversal, more reliable, and more competitive across crops, soils, climates, and operating contexts.

## Current system position
OrtoMio already has:
- a shared agronomic kernel
- first-generation transversal crop packages
- irrigation, health, phenology, prescription, planner, and outcome integration
- execution traceability
- adaptive quality benchmarking
- first-generation ROI-aware prioritization

The system is no longer a collection of isolated vertical modules.
It is now a real transversal agronomic platform.

The remaining gap is not the absence of architecture.
The remaining gap is depth.

## Main improvement areas

### 1. Crop packages depth
This is the area that determines whether OrtoMio can truly support very different crop families through one system.

Priority families:
1. winter cereals
2. field brassicas
3. broadacre legumes
4. artichoke and perennial field vegetables
5. industrial and extensive crops
6. orchard
7. olive grove
8. vineyard
9. protected and controlled-environment crops

Each package must define:
- phenology by operational phase
- water demand and stress sensitivity by phase
- nutrition demand by phase
- health pressures and risk priorities
- quality and harvest logic
- economic sensitivity and cost-of-delay profile

Expected result:
- new crops are onboarded through package logic first
- irrigation, health, quality, and ROI vary coherently by crop family

### 2. Soil-water engine
This is the most important technical gap for real precision agriculture.

The current system already reasons on hydraulic profiles, but it still needs stronger zone-level rigor.

Must be strengthened for:
- field capacity
- wilting point
- available water
- effective rootable depth
- infiltration
- drainage class
- compaction risk
- salinity accumulation risk
- water quality by source
- explicit distinction between measured and estimated values

Expected result:
- irrigation, nutrition, and health read the same normalized soil-water profile
- recommendations materially change when zone constraints change

### 3. Geo-climate and microclimate
If OrtoMio must support any region, weather and geography cannot remain generic context.

Must include:
- stronger site-to-weather binding
- elevation and exposure awareness
- distinction between forecast and local sensor reality
- explicit distinction between transient forecast, persisted weather history, and derived agronomic indicators
- source lineage across API weather, local sensors, and estimated fallback
- zone-level environmental history that links weather, soil-water balance, and crop response
- region-sensitive agronomic windows
- explicit climate-signal quality

Expected result:
- every important recommendation can explain which climate source it is using
- timing logic changes by region and exposure, not only by generic crop rules
- weather becomes an auditable agronomic signal, not only transient context

### 4. Economic intelligence
The system already has ROI-aware prioritization, but it must become more managerially reliable.

Must include:
- observed intervention cost from operational logs
- crop-package-specific cost of delay
- protected value by yield and quality logic
- comparison between alternative actions
- zone-level economic prioritization

Expected result:
- the system can say not only what to do, but also why it is economically preferable

### 5. Validation and calibration
This is the workstream that turns good architecture into agronomic credibility.

Validation scenarios must cover:
1. rainfed wheat
2. barley with nitrogen sensitivity
3. legumes under spring stress
4. brassicas under quality-sensitive bulking
5. artichoke under repeated harvest windows
6. orchard with fruit-quality pressure
7. olive grove with oil-quality sensitivity
8. vineyard near ripening
9. protected cultivation with water-quality constraints

Expected result:
- changes are evaluated against realistic agronomic expectations
- regressions become visible before they affect production quality

## Priority roadmap

### Phase 1 - Immediate next block
Focus:
- strengthen the operational economic ledger

Main objective:
- make the operation registry a real source of observed economics for ROI, not only a neutral execution log

Main targets:
- irrigation cost estimation from liters, duration, energy, and labor assumptions
- nutrition and treatment real cost persistence
- mechanical work cost normalization
- harvest economic value propagation

Primary files:
- `services/operationRegistryService.ts`
- `services/agronomicEconomicPriorityService.ts`
- `services/agronomicMeasuredFeedbackService.ts`

Exit criteria:
- ROI reads real or strongly grounded economic data across the main operation families

### Phase 2 - Soil-water zone-first hardening
Focus:
- move from generic hydraulic reasoning to stronger zone-first agronomy

Main targets:
- explicit measured vs estimated fields in soil-water reasoning
- stronger zone salinity propagation
- stronger drainage and compaction interpretation
- better rootable depth logic

Primary files:
- `services/soilAnalysisService.ts`
- `services/advancedIrrigationService.ts`
- `services/advancedNutritionService.ts`

Exit criteria:
- hydraulic and water-quality constraints materially alter decision logic by zone

### Phase 3 - Weather persistence and environmental circulation
Focus:
- turn weather from mostly operational context into persistent agronomic state

Main objective:
- make weather historically traceable and zone-actionable across crops, soil, productivity, and operations

Main targets:
- persist daily weather observations and relevant forecast snapshots with source lineage
- distinguish clearly between transient forecast, persisted observation, and derived agronomic indicators
- build a zone-level environmental ledger that links weather, sensor readings, and soil-water balance
- propagate weather impact into cultivation tracking, productivity logic, and operation context with explicit source quality
- make health monitoring read accumulated environmental pressure, not only current forecast and microclimate
- make weather-aware scheduling read recent environmental stability or instability before moving tasks
- make predictive yield, disease, and water-demand models consume recent environmental history
- surface persistent environmental pressure in the daily director recommendations
- let prescription intelligence and agronomic ROI models price recent environmental instability into priority and timing
- expose monitoring quality and precedence rules: local sensors first, then weather API, then estimated fallback

Primary files:
- `services/weatherService.ts`
- `services/weatherCacheService.ts`
- `services/dailyDiaryService.ts`
- `services/sensorDataService.ts`
- `services/advancedIrrigationService.ts`
- `services/operationContextService.ts`
- `services/environmentalMonitoringService.ts`
- `services/plantHealthMonitoringService.ts`
- `services/weatherAwareTaskScheduler.ts`
- `services/predictiveAnalyticsService.ts`
- `services/directorService.ts`
- `services/fieldRowPredictiveService.ts`
- `services/agronomicEconomicPriorityService.ts`
- `services/prescriptionAgronomicIntelligenceService.ts`
- `services/prescriptionMapsService.ts`

Exit criteria:
- weather is no longer treated mainly as transient forecast context
- crops, soil-water logic, and productivity tracking can all read a persisted and explainable environmental history
- health alerts and automatic task rescheduling react to recent environmental history, not only to current-day forecast
- predictive outputs and daily recommendations are materially altered by persisted environmental history
- economic priority and prescription intelligence factor recent environmental pressure into ROI and action timing

### Phase 4 - Crop package deepening
Focus:
- complete high-priority crop families so the platform behaves more consistently across field systems

Main targets:
- deeper phase logic for cereals
- deeper brassica logic
- deeper legume logic
- stronger artichoke package
- stronger industrial/extensive package

Primary files:
- `data/agronomicCropProfiles.ts`
- `services/agronomicKernelService.ts`
- downstream engines that consume crop packages

Exit criteria:
- each priority family has clearly differentiated water, health, quality, and ROI behavior

### Phase 5 - Geo-climate rigor
Focus:
- improve environmental trustworthiness

Main targets:
- site-to-weather binding hardening
- elevation and exposure support
- explicit climate confidence in recommendations
- regional windows and timing sensitivity

Primary files:
- weather and site context services
- planning and recommendation engines

Exit criteria:
- timing recommendations reflect real site context, not only crop defaults

### Phase 6 - Validation harness
Focus:
- create a repeatable agronomic validation layer

Main targets:
- scenario-based validation per crop family
- expected outputs for priority, confidence, and ROI
- regression visibility for future iterations

Exit criteria:
- major agronomic changes can be checked against a known validation matrix

## Recommended execution order
1. operational economics and registry hardening
2. soil-water zone-first hardening
3. weather persistence and environmental circulation
4. crop-package deepening
5. geo-climate rigor
6. validation harness

## What success looks like
OrtoMio reaches a much stronger level when:
- the same platform can support cereals, vegetables, orchards, vineyard, olive grove, and protected crops through one coherent agronomic model
- every recommendation can explain crop, phase, soil-water, climate, and economic rationale
- operator-facing surfaces show confidence and not only urgency
- ROI reflects observed economics and not only heuristics
- new crop onboarding becomes mainly a package-definition problem, not a new-code vertical

## Immediate next implementation step
Resume from:
- `services/dailyDiaryService.ts`
- `services/weatherService.ts`
- `services/weatherCacheService.ts`

Immediate engineering objective:
- persist and normalize weather history, forecast lineage, and zone-level environmental impact so crops, soil-water logic, and productivity models consume the same auditable climate state.
