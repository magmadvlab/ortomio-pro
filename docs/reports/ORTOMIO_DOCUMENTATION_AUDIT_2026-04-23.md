# ORTOMIO DOCUMENTATION AUDIT (2026-04-23)

## Purpose
Create a precise, stepwise audit of the Markdown documentation before further manual cleanup.

This audit exists to prevent three recurring errors:
- rewriting docs before checking whether they describe real code
- keeping obsolete promise-driven material alive by inertia
- losing implementation gaps because they remain only in chat history
- downgrading promise-heavy chapters into softer prose before first converting their missing capabilities into explicit implementation TODOs

## Documentation Truth Contract
This audit follows one strict principle:
- the manual must be a derivative of implemented product reality, not a source of promises

Therefore:
- if something exists in code, the manual may describe it
- if something is intended but not closed yet, it must first exist as an explicit `todo` in the master plan
- if something is neither implemented nor tracked as a `todo`, it does not belong in the manual as current capability

## Method Reset (applied on 2026-04-23)
The first pass of this audit identified obviously risky chapters, but that approach is not sufficient for modules that may have been implemented in fragments across different sessions, branches or assistants.

From this point on, no chapter should be classified only from its prose style.

For each domain, the required order is now:
1. read the documentation chapter
2. inspect the related code in `app/`, `components/`, `services/`, `types/`, `packages/` and `supabase/` where relevant
3. classify the domain as one of:
   - `implemented-and-connected`
   - `implemented-but-partially-connected`
   - `implemented-as-backend-or-structure-only`
   - `promise-only`
4. only then assign the document status:
   - `keep`
   - `rewrite`
   - `todo-source`
   - `delete-candidate`

Important consequence:
- a chapter must not be downgraded to pure promise if the code reveals real but fragmented implementation
- in those cases the correct output is a tracked architectural/UI gap, not document deletion by assumption
- when a chapter contains intended capabilities that are still materially open, the first classification should prefer `todo-source` over a simple textual downgrade

## Audit Rule
For each Markdown file, classify it before editing it:
- `keep`: still useful and materially aligned
- `rewrite`: useful but drifted from current code or product truth
- `todo-source`: contains promises, gaps or intended capabilities that should become tracked implementation work
- `delete-candidate`: obsolete, duplicated, superseded or misleading enough that removal should be considered

When a file exposes a feature that was promised but is not actually complete:
1. register the feature gap in the master execution index
2. classify the document as `todo-source` unless the missing capability is already proven obsolete or invalid
3. only after the TODO is tracked, decide later whether the file should be rewritten, kept as historical material or deleted
4. only then update the manual or report text

## Inventory Snapshot
Total Markdown files discovered on 2026-04-23: `137`

Main buckets:
- `docs/manual/*`: in-app manual and user-facing product narrative
- `docs/reports/*`: planning, audits, current-state and roadmap artifacts
- `docs/*.md`: mixed legacy technical notes, implementation logs, specs, fix notes and historical material

## Audit Passes

### Pass 0 - Domain verification before document judgment
Priority: highest

Goal:
- verify the actual implementation depth of each domain before deciding whether its document is misleading, incomplete or obsolete

Required evidence sources:
- routes in `app/`
- domain components in `components/`
- domain services in `services/`
- contracts and entities in `types/` and `packages/`
- migrations or persistence structures in `supabase/`

### Pass 1 - User-facing truth sources
Priority: highest

Files in scope:
- `docs/manual/README.md`
- `docs/manual/*.md`
- `docs/reports/ORTOMIO_APPLICATION_CURRENT_STATE_2026-04-18.md`
- `docs/reports/ORTOMIO_STAKEHOLDER_PRESENTATION_2026-04-18.md`

Goal:
- identify which user-facing chapters describe real product behaviour
- convert unimplemented promises into tracked TODOs
- decide which chapters should be rewritten or removed from the manual

### Pass 2 - Planning and roadmap coherence
Priority: high

Files in scope:
- `docs/reports/*roadmap*`
- `docs/reports/*plan*`
- `docs/reports/*audit*`

Goal:
- distinguish what is historical record vs active execution guidance
- preserve useful decisions
- avoid leaving old promises active as if they were current commitments

### Pass 3 - Legacy root docs
Priority: medium

Files in scope:
- `docs/*.md`

Goal:
- separate durable technical documentation from one-off migration notes, completion announcements and stale specs
- identify delete candidates and keepers

## Initial High-Risk Areas
These should be reviewed early because they are likely to contain promise-heavy or misleading material:
- `docs/manual/26-integration-api.md`
- `docs/manual/28-economic-benefits.md`
- `docs/manual/30-use-cases.md`
- `docs/manual/31-success-stories.md`
- `docs/manual/33-support-contacts.md`
- `docs/manual/34-director-orchestrator.md`
- `docs/manual/21-individual-plants.md`
- `docs/manual/22-business-intelligence.md`

## Classification Log
Use the table below as the running audit ledger.

| File | Bucket | Status | Notes |
| --- | --- | --- | --- |
| `docs/manual/README.md` | manual | rewrite | already being realigned to verified product state |
| `docs/manual/04-certifications.md` | manual | rewrite | corrected upward after code verification; still tied to open certification gaps |
| `docs/reports/ORTOMIO_APPLICATION_CURRENT_STATE_2026-04-18.md` | report | keep | current truth source, should remain authoritative and be updated carefully |
| `docs/reports/ORTOMIO_STAKEHOLDER_PRESENTATION_2026-04-18.md` | report | rewrite | useful, but must clearly separate verified state from future phase proposals |
| `docs/manual/21-individual-plants.md` | manual | todo-source | domain verified as real but mixed; advanced per-plant promises should become explicit implementation TODOs before final manual cleanup |
| `docs/manual/22-business-intelligence.md` | manual | provisional keep | acceptable current wording, pending deeper domain verification where needed |
| `docs/manual/24-sustainability.md` | manual | todo-source | real environmental foundations exist, but the broader ESG/carbon/circular-economy promises should first be captured as explicit TODOs |
| `docs/manual/18-orchard-management.md` | manual | todo-source | orchard is real and substantial, but the chapter contains advanced precision/analytics promises that should become tracked TODOs before final rewrite |
| `docs/manual/19-olive-management.md` | manual | todo-source | olive vertical is real but hybrid; specialist olive promises beyond the current orchard-backed implementation should first become TODOs |
| `docs/manual/20-vineyard-management.md` | manual | todo-source | vineyard is real and substantial, but winery/market-intelligence promises should first be converted into tracked TODOs |
| `docs/manual/11-agronomist-consultations.md` | manual | keep | current wording is intentionally conservative and matches the verified state: contact/consultation data structures and UI pieces exist, but marketplace, booking, payment and robust end-to-end prescription integration are not closed |
| `docs/manual/23-export-system.md` | manual | keep | current wording is restrained and substantially aligned: export exists through simple client-side flows, JSON helpers and selected API routes, but not as a universal enterprise export framework |
| `docs/manual/01-ai-predictions.md` | manual | keep | current wording matches the verified state well: predictive capability is real and spread across multiple services/modules, but not a single validated universal AI engine |
| `docs/manual/02-drone-operations.md` | manual | todo-source | drone capability is more real than pure anticipation, but missing persistence/hardware integration should first become explicit TODOs |
| `docs/manual/03-traceability.md` | manual | todo-source | traceability/blockchain capability is real enough to justify a module, but the missing chain-of-custody/commercial layers should first become tracked TODOs |
| `docs/manual/04b-bio-certification-guide.md` | manual | todo-source | the guide is grounded in a real BIO form, but stronger audit-readiness/document-management promises should first become TODOs |
| `docs/manual/05-ndvi-satellite.md` | manual | keep | current wording is appropriately restrained and matches a real but hybrid NDVI surface with dashboards, config checks, provider integration points and fallback/simulated modes |
| `docs/manual/06-prescription-maps.md` | manual | todo-source | prescription maps are materially implemented, but the remaining field-validated end-to-end gaps should first become explicit TODOs |
| `docs/manual/07-ai-overview.md` | manual | todo-source | chapter compresses many real but uneven AI domains into one coherent decision layer; missing cross-module AI closure should first become tracked TODOs |
| `docs/manual/08-global-ai-chat.md` | manual | todo-source | global chat surface exists, but most universal/contextual/knowledge-base/support promises exceed the verified implementation and should first become explicit TODOs |
| `docs/manual/09-planner-ai-chat.md` | manual | keep | current wording is already honest about the hybrid state: planner task/queue flows are real, while AI guidance remains mixed and not yet a unified planner brain |
| `docs/manual/10-activity-registry.md` | manual | keep | current wording is appropriately hybrid: persisted activity/task records are real, while unified ledger closure is still explicitly described as incomplete |
| `docs/manual/26-integration-api.md` | manual | todo-source | real API/integration surface exists, while the larger external ecosystem promises should first become tracked TODOs |
| `docs/manual/28-economic-benefits.md` | manual | todo-source | partial economic tooling exists, but business-impact promises should first be separated into explicit TODOs or later removed if obsolete |
| `docs/manual/30-use-cases.md` | manual | todo-source | chapter aggregates real modules plus intended capability; implied deployment-level promises should first be converted into TODOs |
| `docs/manual/31-success-stories.md` | manual | delete-candidate | code inspection confirms several referenced domains exist, but the chapter presents named customers, testimonials, awards and measured business outcomes as historical facts without repository-grounded evidence |
| `docs/manual/33-support-contacts.md` | manual | provisional keep | safe placeholder, not an urgent source of product truth drift |
| `docs/manual/34-director-orchestrator.md` | manual | todo-source | domain verified as real but distributed; missing orchestration consolidation should first be treated as implementation TODO, then rewritten |
| `docs/manual/14-smart-hub.md` | manual | keep | chapter is already cautious and matches a real but beta IoT/sensor ingestion surface with registry/automation gaps still open |
| `docs/manual/15-irrigation-system.md` | manual | keep | current wording is substantially aligned with a strong irrigation module that still stops short of full IoT actuator automation |
| `docs/manual/35-automated-diary.md` | manual | todo-source | real diary and cron/predictive foundations exist, but the chapter describes a much more uniformly closed automatic growth-tracking system than the verified implementation supports |

### Group: AI overview, global chat and planner chat

#### `docs/manual/07-ai-overview.md`
Classification: `todo-source`

Reason:
- the codebase does support a real cross-cutting AI surface:
  - `app/app/ai-predictions/page.tsx`
  - `services/predictiveAnalyticsService.ts`
  - `services/directorService.ts`
  - planner/task-aware flows
  - NDVI, irrigation, drone and diary-related assistive logic
- however the chapter currently compresses these domains into a single coherent "motore decisionale" with one level of maturity
- the verified implementation is much more uneven:
  - some parts are real and user-facing
  - some are hybrid and partially connected
  - some still depend on fallback logic, local heuristics or distributed orchestration

Action:
- keep the chapter as a source of intended architecture, but first convert the missing cross-module unification promises into tracked TODOs
- only later decide whether the final overview should be tightened into a narrower operational map

#### `docs/manual/08-global-ai-chat.md`
Classification: `todo-source`

Reason:
- there is a real global chat surface in code:
  - `components/ai/GlobalAIChat.tsx`
  - `app/api/ai/chat/route.ts`
  - conversational helpers such as `logic/conversationEngine.ts`
- but the verified implementation is far below the chapter's promise layer:
  - `GlobalAIChat` currently generates local canned responses and simulates latency
  - a real Gemini-backed route exists in `app/api/ai/chat/route.ts`, so the missing piece is not only AI capability but also connection/orchestration between UI and the real route
  - there is no evidence of a universal app-aware action layer, strong conversation memory, enterprise knowledge graph, human escalation workflow or verified support channels as described
  - the route-level AI chat exists, but not as the fully contextual omnipresent assistant described in the chapter

Action:
- treat the chapter as `todo-source`
- convert UI-to-real-AI wiring, global-context chat, memory, action execution, source grounding and support escalation into explicit tracked TODOs before any rewrite decision

#### `docs/manual/09-planner-ai-chat.md`
Classification: `keep`

Reason:
- the current chapter is already explicit about the hybrid state of the planner
- the verified code supports that framing:
  - `app/app/planner/page.tsx`
  - `components/planner/AgronomicQueueTaskPanel.tsx`
  - task persistence and advice/task creation paths
  - task-aware launches into execution modules
  - evidence-contract exposure in the execution forms opened from recent agronomic tasks
- planner chat UI itself still contains local/canned response logic in `PlannerAIChat.tsx` and `PlannerAIChatFixed.tsx`, so the chapter is correct not to oversell it as a fully consolidated AI planner engine

Action:
- keep the chapter as current operational truth
- track cross-module planner unification in the master plan, but no major classification downgrade is needed for this file

### Group: registry, smart hub, irrigation and automated diary

#### `docs/manual/10-activity-registry.md`
Classification: `keep`

Reason:
- the current chapter is already explicit about the hybrid state of the activity ledger
- the verified code supports that framing:
  - persistent planner tasks
  - operational logs for irrigation and other execution modules
  - task-aware execution launches and evidence-contract exposure
  - diary/timeline surfaces that aggregate real records
- the file does not oversell the remaining unification work and correctly states that a full `plan -> operation -> observation -> result` ledger is still incomplete

Action:
- keep as operationally truthful
- continue tracking ledger-unification work in the master plan rather than downgrading this chapter

#### `docs/manual/14-smart-hub.md`
Classification: `keep`

Reason:
- the chapter is cautious and matches the verified code reasonably well:
  - real telemetry ingestion routes exist under `app/api/iot/*` and `app/api/sensors/readings/route.ts`
  - sensor data contracts and persistence helpers exist in `services/sensorDataService.ts`
  - there is still also a lighter/mock-style layer in `services/iotSensorService.ts`
- the text already states that registry, actuation and automations are not yet fully closed

Action:
- keep the chapter
- track the remaining device-registry and actuator-automation gaps in the master plan rather than forcing a manual rewrite first

#### `docs/manual/15-irrigation-system.md`
Classification: `keep`

Reason:
- the irrigation module is one of the stronger real domains in the codebase:
  - `app/app/irrigation/page.tsx`
  - multiple irrigation dashboards/forms/components
  - service layer for calculations, diagnostics, water quality and execution bridging
  - persistent watering logs and task-aware execution flow
- the chapter is already careful about the current boundary:
  - strong operational logging and calculation support
  - incomplete Smart Hub / actuator automation
  - ongoing type/orchestration debt

Action:
- keep as materially aligned current-state documentation

#### `docs/manual/35-automated-diary.md`
Classification: `todo-source`

Reason:
- there is a real diary foundation in code:
  - `app/app/diary/page.tsx`
  - `components/diary/AutomatedDiaryViewer.tsx`, `OperationalDiary.tsx`, `UnifiedTimelineDiary.tsx`
  - `services/diaryPredictiveEngine.ts`
  - `app/api/cron/daily-diary/route.ts`
  - supporting migrations for daily diary tables
- however the chapter still reads as a much more uniformly closed automatic system:
  - full nightly pipeline
  - broad weather/stress/event closure
  - polished seasonal/year-over-year analysis
  - rich predictive and event generation as if already consistently operational everywhere
- the verified code shows a real and important base, but not yet a fully settled automatic diary platform at the maturity implied by the chapter

Action:
- first convert the missing diary-automation closure into explicit TODOs
- only later decide how much of the chapter remains in the final operational manual

## Findings From Early Screening
These are not final judgments for ambiguous domains. They are early screening notes produced before the method reset and should now be treated as provisional unless backed by domain inspection.

### Group: high-risk promise-heavy manual chapters

#### `docs/manual/26-integration-api.md`
Classification: `rewrite`

Reason:
- the codebase does expose a real integration/API layer:
  - many `app/api/*` routes exist for AI, analytics, NDVI, IoT telemetry/commands, export, calendar tasks, support submission and other internal capabilities
  - API-key and provider configuration surfaces exist for selected external services
  - webhook-style endpoints exist in IoT and some automation-related flows
  - adapters exist for external AI/weather providers and selected remote services
- however the chapter is still massively overstated relative to the verified surface:
  - no evidence of official SAP, Dynamics, NetSuite, Shopify, Amazon Business, Alibaba, Zapier or Power Automate connectors as described
  - no evidence of public SDKs like `@ortomio/sdk` or Python client packages
  - no evidence of the broad banking/insurance/fintech ecosystem presented
  - endpoint examples in the chapter do not match the real `app/api/*` structure

Action:
- rewrite the chapter as a narrow and truthful `API & Integrations` note
- document only:
  - current internal route families
  - configured external provider types
  - actual webhook or machine-ingestion points
  - current limits of public/external integration support

#### `docs/manual/28-economic-benefits.md`
Classification: `rewrite`

Reason:
- the codebase does contain some real economic surfaces:
  - analytics routes and pages with revenue/cost/ROI summaries
  - prescription cost analysis and optimization panels
  - harvest/economic value tracking
  - operation cost fields in irrigation, nutrition, mechanical work and tracking flows
  - adaptive pricing and market-oriented services in selected areas
- however the current chapter is still far beyond what the code can justify:
  - guaranteed savings and payback claims
  - fixed ROI bands by company size
  - annual euro figures presented as proven outcomes
  - business-support, financing and dedicated advisory claims not grounded in the product surface
- the problem is therefore not total absence of economics, but a severe mismatch between limited/partial economic tooling and full sales-style claims

Action:
- rewrite as a restrained `economic visibility and cost tracking` chapter, or remove it if that narrower rewrite is not worth keeping in the in-app manual
- keep only verified themes such as:
  - tracked costs
  - ROI-style calculations where actually computed
  - pricing/value estimates where explicitly supported
  - current limitations of economic coverage

#### `docs/manual/30-use-cases.md`
Classification: `rewrite`

Reason:
- the chapter references many domains that do exist in the codebase:
  - NDVI
  - prescription maps
  - certifications
  - analytics
  - drone routes/services
  - challenge/badge mechanics
  - agronomist-related structures
  - IoT/Smart Hub endpoints
- however it still presents them as if they formed real customer deployments with measured business outcomes, uniform maturity and production-grade completeness
- some referenced domains are real but partial, some are assistive, some are still mixed between UI, service and placeholder layers

Action:
- rewrite as `example scenarios`, not as confirmed customer outcomes
- for each scenario, anchor only to verified modules and explicitly label mixed-maturity areas
- convert any missing implementation requirement into tracked TODOs

#### `docs/manual/31-success-stories.md`
Classification: `delete-candidate`

Reason:
- the codebase does contain real domain surfaces that loosely match some ingredients mentioned in the chapter:
  - blockchain traceability routes and services
  - NDVI pages and components
  - analytics pages and routes
  - certifications surfaces
  - drone routes/services
  - agronomist-related services and components
  - challenge/badge mechanics
- however the chapter still crosses a much harder line than other promise-heavy docs:
  - it presents named companies, direct testimonials, awards, press references and exact business results as if they were documented historical facts
  - repository evidence supports the existence of some product modules, not the existence of those customers, those quotes, those awards or those measured outcomes
- this is therefore not just an over-optimistic product chapter; it is non-verifiable factual-looking narrative material inside the operational manual

Action:
- remove from the in-app manual
- if any part is worth preserving, rewrite it later as anonymous illustrative scenarios grounded in verified modules only, with no implied real testimonial or measured customer outcome

### Group: plant, BI, support and orchestrator chapters

#### `docs/manual/21-individual-plants.md`
Classification: `rewrite`

Reason:
- the app does have a substantial plant-level domain:
  - dedicated route `/app/plants`
  - `SmartPlantManager`
  - plant detail, lifecycle, monitoring, harvest, health heatmap and row-sync surfaces
  - storage contracts for `get/create/updateIndividualPlant`
  - lifecycle migrations and services
  - transplant orchestration, seedling/sapling links and plant-row integration
- however maturity is not uniform:
  - some services are persisted against Supabase or storage contracts
  - some monitoring areas are pragmatically client-side or localStorage-backed
  - some operations services still contain TODOs or simulated persistence
- the chapter still overshoots the connected baseline with QR systems, genealogy, breeding workflows, advanced biometric analytics and certified nursery narratives

Action:
- rewrite around the verified core: individual plant records, row-linked views, plant management, lifecycle, monitoring and operational tracking
- distinguish clearly between:
  - connected/persisted features
  - local or assistive monitoring tools
  - future or not-yet-connected capabilities

#### `docs/manual/22-business-intelligence.md`
Classification: `provisional keep`

Reason:
- already rewritten in a disciplined way
- describes analytics as hybrid/in consolidation instead of claiming an enterprise BI suite

Action:
- keep as current manual text unless new code evidence materially changes the analytics surface

#### `docs/manual/24-sustainability.md`
Classification: `rewrite`

Reason:
- the codebase does contain real sustainability-adjacent surfaces:
  - an `analytics` sustainability tab with exposed metrics and UI framing
  - irrigation and environmental monitoring layers for water use, water stress and environmental history
  - environmental scoring inside prescription/cost optimization flows
  - compliance/certification material that references sustainable practices
- however the current chapter is far broader than the verified implementation:
  - no repository evidence of a complete carbon-accounting engine across Scope 1/2/3
  - no evidence of carbon-neutral certification workflow, offset-credit management or third-party carbon audit handling
  - no evidence of full biodiversity indices, waste/biogas/circular-economy ledgers or complete ESG reporting stack as described
  - even the current analytics sustainability surface appears lightweight and partly presentation-driven rather than a deeply persisted environmental accounting module
- the correct interpretation is therefore:
  - a real environmental and water-monitoring foundation exists
  - the chapter over-composes that foundation into a full sustainability platform

Action:
- rewrite as a narrow `sustainability signals` chapter
- keep only verified areas such as:
  - water-use and irrigation efficiency support
  - environmental monitoring and weather lineage
  - selected environmental scores or sustainability indicators where they are actually computed
  - sustainability-related compliance context already present in certification/compliance modules
- move carbon neutrality, ESG reporting, biodiversity indices and circular-economy claims to tracked gaps or future roadmap treatment unless deeper code evidence emerges

### Group: orchard, olive grove and vineyard verticals

#### `docs/manual/18-orchard-management.md`
Classification: `rewrite`

Reason:
- the orchard domain is materially real and implemented:
  - route: `/app/orchard`
  - dedicated dashboard, wizard, tree manager, pruning manager, harvest manager and density/yield tools
  - dedicated service layer with Supabase-backed orchard configurations, trees, observations, pruning schedules, harvest schedules and dashboard data
  - integration with individual-plant management and field-row / irrigation defaults
- however the chapter still goes well beyond the verified baseline:
  - advanced analytics remain uneven, and `/app/orchard` still shows `Analytics Frutteto` as `Funzionalità in sviluppo`
  - robotics, full computer-vision automation, complete post-harvest/commercial layers and broad precision-orchard claims are not established as a uniformly connected product surface
- the correct interpretation is:
  - orchard is a substantial production module
  - the chapter still inflates its most advanced precision and analytics claims

Action:
- rewrite around the verified orchard stack:
  - orchard configuration
  - tree-level management
  - pruning and harvest scheduling/records
  - density and yield tools
  - row/irrigation defaults and individual-plant linkage
- move robotics, full advanced analytics and post-harvest/commercial claims to roadmap or tracked gaps unless stronger evidence emerges

#### `docs/manual/19-olive-management.md`
Classification: `rewrite`

Reason:
- the olive vertical is real, not fictional:
  - route: `/app/olives`
  - olive garden context resolution built from garden + orchard data
  - operational reuse of orchard tree/pruning/harvest managers
  - olive-specific dashboard/widgets such as maturity tracking and olive-fly monitoring
- but maturity is mixed:
  - the page is operational and useful
  - specialist olive widgets currently use local state and sample/demo-style readings rather than a durable dedicated persistence layer
  - much of the operational core still rides on the generic orchard stack instead of a fully separate olive-domain backend
- the chapter therefore overstates:
  - complete olive-specific BI/traceability/quality stack
  - automatic thresholds and full integrated quality/oil analytics
  - a uniformly mature dedicated olive-management module

Action:
- rewrite as `olive workflow on top of orchard foundations plus selected specialist tools`
- keep only verified areas such as:
  - olive orchard resolution/context
  - tree/pruning/harvest operations
  - maturity/fly-monitoring support as current assistive tooling
- clearly separate persistent operational base from local/specialist widgets

#### `docs/manual/20-vineyard-management.md`
Classification: `rewrite`

Reason:
- the vineyard vertical is real and more than superficial:
  - route: `/app/vineyard`
  - dedicated dashboard, wizard and vine manager
  - dedicated Supabase-backed service layer for vineyard configurations and vine records
  - dedicated bud-load / Ravaz service and viticulture-specific types
  - explicit linkage to individual-plant management
- however the chapter still overreaches:
  - cantina integration, market analysis, full vinification workflow and broad advanced viticulture intelligence are not established as uniformly connected end-to-end modules
  - some viticulture tools also exist in calculator/widget form and should not be described as a completely closed production intelligence system
- the right reading is:
  - vineyard is a real vertical with substantial structure and persistence
  - the chapter still promises a wider viticulture-to-winery platform than the verified codebase supports

Action:
- rewrite around the verified vineyard baseline:
  - vineyard configuration and vine registry
  - dashboard and operational navigation
  - bud-load / Ravaz support
  - vine-level management and plant linkage
- move winery integration, deep market intelligence and unsupported advanced claims to roadmap/todo treatment

### Group: agronomist consultations and export

#### `docs/manual/11-agronomist-consultations.md`
Classification: `keep`

Reason:
- the codebase does contain a real agronomist-related surface:
  - agronomist types and contact/consultation/advice data structures
  - agronomist UI components for search, consultation form and consultation list
  - storage-facing calls from UI such as `storageProvider.createAgronomist`
- however the domain is still clearly partial:
  - `services/agronomistService.ts` is mostly stubbed and returns empty arrays for key reads
  - no evidence of a real marketplace, booking engine, payments or strong automatic prescription/task closure loop
  - search is currently scoped to trusted/existing contacts, not to a verified national network
- the important point is that the current manual chapter already says exactly that in a disciplined way

Action:
- keep the chapter as current truthful wording
- if deeper agronomist implementation emerges later, upgrade from this baseline instead of rewriting toward promises

#### `docs/manual/23-export-system.md`
Classification: `keep`

Reason:
- the export surface is real, though narrow and heterogeneous:
  - `/app/export` exists
  - `services/exportService.ts` supports JSON garden export for backup/portability
  - the export page supports pragmatic CSV/PDF generation client-side
  - dedicated API routes exist for selected CSV/PDF exports, especially analytics and treatments
  - some specialist export flows also exist in other modules, such as prescription/compliance areas
- but the current chapter no longer claims a universal export platform, and that restraint matches the code reasonably well
- the remaining limitation is architectural breadth, not documentary inflation

Action:
- keep the chapter as current truthful wording
- later, if needed, replace generic wording with an inventory of real export families and formats actually supported

### Group: AI predictions and drone operations

#### `docs/manual/01-ai-predictions.md`
Classification: `keep`

Reason:
- the predictive surface is real and substantial:
  - dedicated route `/app/ai-predictions`
  - multiple predictive services for harvest timing, yield, disease risk, water requirement and broader agronomic prioritization
  - environmental history, weather, phenology and measured feedback do feed several predictive paths
  - dedicated API route exists for AI predictions
- however implementation is not one unified engine:
  - some surfaces still rely on mock loading or staged dashboards
  - different predictive services use different data contracts and levels of maturity
  - parts of the system are heuristic/rule-based, others are more analytics-driven
- the current manual chapter already explains exactly this hybrid reality without overclaiming

Action:
- keep the chapter as current truthful wording
- future work should improve product consistency, not the prose baseline

#### `docs/manual/02-drone-operations.md`
Classification: `rewrite`

Reason:
- the drone domain is more real than a pure concept:
  - dedicated `droneIntegrationService.ts`
  - API routes for flight plans, auto-planning and execution
  - typed models for missions, sensors, results, health analysis, stress analysis and prescription output
- however the current implementation is still clearly not a fully integrated production drone workflow:
  - flight plans are held in in-memory maps
  - execution is explicitly simulated
  - analysis results are generated through synthetic/randomized logic
  - no verified durable mission history, hardware control loop or DJI-grade operational integration is established
- the current chapter therefore undershoots slightly by implying mostly conceptual status, while the code shows a real but highly simulated prototype layer

Action:
- rewrite the chapter from `beta / documentazione anticipata` toward `ibrido / prototipo operativo`
- describe:
  - real mission-planning and analysis scaffolding
  - current simulated execution and synthetic analysis limits
  - missing persistence and hardware-grade integration

### Group: NDVI and prescription maps

#### `docs/manual/05-ndvi-satellite.md`
Classification: `keep`

Reason:
- the NDVI domain is real and implemented enough to justify the current chapter:
  - dedicated route `/app/ndvi`
  - NDVI dashboard, map view, multi-garden dashboard and configuration status components
  - service layer for satellite access and NDVI analysis
  - API routes for Sentinel/config setup and checks
- but it remains hybrid exactly as the chapter says:
  - Sentinel/provider availability is conditional
  - fallback/simulated generation is explicit in the service
  - trend and stress logic are useful but not a fully closed quantitative remote-sensing pipeline
- the current manual wording is therefore already well calibrated

Action:
- keep the chapter as current truthful wording

#### `docs/manual/06-prescription-maps.md`
Classification: `rewrite`

Reason:
- the prescription maps domain is materially implemented:
  - dedicated route `/app/prescription-maps`
  - rich dashboard with creation, stats, execution summaries, agronomic intelligence, field-ops summary and supporting panels
  - dedicated service layer for generation, revisions, execution summaries and field ops
  - dedicated schema/migrations and cloud persistence for maps, zones, exports and execution records
  - export modal and geo-export service for multiple GIS/machinery-oriented formats
- however the chapter currently undersells the module too much:
  - it is not just a UI preview or conceptual base
  - there is real persistence and operational tracking around maps and exports
- at the same time, the chapter is still right that the chain is not fully closed:
  - data quality and generation pipelines are mixed in maturity
  - end-to-end validation from map -> field import -> application -> measured outcome is still not universally robust
  - export compatibility and productive VRT use still need manual validation

Action:
- rewrite the chapter from `beta preview` toward `real module with partial end-to-end closure`
- document:
  - actual persistence and export capabilities
  - real execution/outcome summary layers
  - remaining limits on field validation, machinery compatibility and fully trusted productive use

### Group: traceability and BIO guide

#### `docs/manual/03-traceability.md`
Classification: `rewrite`

Reason:
- the traceability/blockchain area is not pure fiction:
  - blockchain traceability service exists
  - API routes exist for traceability/record/consumer/NFT flows
  - there are real lot/batch-related data surfaces elsewhere in the product
- but the chapter is still far above the verified baseline:
  - automatic end-to-end tracking of every operation is not established as one closed product loop
  - blockchain storage and immutability are implemented as service-level scaffolding/prototype logic, not a verified production-grade chain-of-custody platform
  - QR/commercial/marketplace/premium-pricing/consumer-engagement claims are much broader than the repository-grounded operational surface
  - carbon, ESG, NFT and marketplace layers are especially inflated relative to evidence
- so the correct reading is:
  - there is a real traceability-oriented domain
  - the current chapter turns it into a far more complete commercial and compliance platform than the code supports

Action:
- rewrite around the verified baseline:
  - traceability-oriented service scaffolding
  - available blockchain/consumer endpoints
  - current lot/batch/document linkages where they really exist
- remove or downgrade claims about immutable production chain, automatic QR commerce, premium pricing, ESG/carbon/NFT marketplace and universal compliance closure unless stronger evidence emerges

#### `docs/manual/04b-bio-certification-guide.md`
Classification: `rewrite`

Reason:
- the guide is anchored to real product surfaces:
  - BIO certification form exists and computes a compliance score
  - certification dashboard/document/checklist components exist
  - BIO is one of the most concrete certifications in the current module
- however the guide still stretches beyond current product closure:
  - document management is present but partially simulated/local
  - the guide reads close to a fully audit-ready operational handbook
  - some economic/benefit framing and document expectations go beyond what is durably persisted and end-to-end guaranteed today
- therefore:
  - the chapter is worth keeping
  - but it should be rewritten as `guided assisted assessment`, not full certification operations manual

Action:
- rewrite around:
  - the actual BIO form sections and score logic
  - the current assistive documentation/checklist support
  - the distinction between readiness support and true certification closure

#### `docs/manual/33-support-contacts.md`
Classification: `provisional keep`

Reason:
- already turned into a safe placeholder
- does not currently overclaim commercial channels or support commitments

Action:
- keep minimal until real support processes and contacts exist

#### `docs/manual/34-director-orchestrator.md`
Classification: `rewrite`

Reason:
- the domain is real:
  - `services/directorService.ts` builds a daily briefing from diary, AI suggestions, environmental monitoring, phenology, plant health and agronomic queue services
  - `components/director/DirectorBriefingWidget.tsx` exposes a real briefing surface in the UI
  - legacy/parallel orchestration logic still exists in `logic/director.ts` and is reused by dashboards and predictive field-row flows
  - the home dashboard embeds the director widget
- but the module is not a standalone, uniformly consolidated product area:
  - there is no dedicated `/app/director` route
  - orchestration is distributed between newer `directorService` flows and older `logic/director.ts`
  - some sections in the chapter still imply a cleaner, more centralized and more measurable system than the current hybrid reality
- support-channel and certain metric claims remain too assertive for the verified baseline

Action:
- keep the concept of a hybrid orchestration/briefing surface
- rewrite the chapter around the actual exposed surfaces: home/dashboard briefing, prioritized actions, transversal queue, links to diary/health/phenology/environmental signals
- explicitly state that the director is currently a distributed orchestration layer, not a single fully unified module

## Output Expectation
At the end of this audit:
- every user-facing manual chapter is classified
- every uncovered feature promise is either closed in code or tracked as a TODO/gap
- obsolete or misleading documents are marked for deletion or archival
- the manual becomes a consequence of the audit, not a parallel narrative
