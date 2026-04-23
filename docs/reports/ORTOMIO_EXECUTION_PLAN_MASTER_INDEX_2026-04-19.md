# ORTOMIO EXECUTION PLAN MASTER INDEX (2026-04-19)

## Purpose
This file is the cascading index for implementation plans produced during the current consolidation wave.

Rule:
- every focused implementation plan gets its own dated file
- this master index links the plan, its status, and the next decision point
- the master index is the first file to open when resuming work
- every architectural or interface gap discovered during implementation or manual review must be added here as a tracked item with priority, owner block and closure rule
- when documentation contains promised but unclosed capability, that promise must first become an explicit `todo` here before any attempt to merely soften the wording in the manual

Allowed status labels:
- `done`
- `in progress`
- `todo`

## Documentation Truth Contract
The master plan is the control layer that prevents the manual from drifting away from the real product.

Operational rule:
- the codebase is the source of truth for implemented behaviour
- this master plan is the source of truth for open gaps, intended capabilities, deferred implementation and explicit removals
- the in-app manual must only describe:
  - behaviour already implemented in code
  - or clearly bounded current limitations of that implemented behaviour

Hard constraints:
- if a capability is not implemented in code and is not tracked here as an explicit `todo`, it must not appear in the manual as current product capability
- if a capability appears in legacy documentation but is not closed in code, it must first be converted into an explicit tracked item here
- once all active `todo` items related to product capability are either completed or removed as obsolete, the manual becomes an operational derivative of the real system rather than a promise layer

## Current Execution Priority Map
1. `P1 Agronomic Context Refinement`
   Status: done
   Done on: 2026-04-19
   Output:
   - refined cultivar / sub-system / terroir context contracts
   - propagation into director, prescription, queue and explanation layers
   - frontend exposure in agronomic queue task cards
   Document:
   - `docs/reports/execution-plans/ORTOMIO_EXECUTION_PLAN_P1_AGRONOMIC_CONTEXT_REFINEMENT_2026-04-19.md` if restored from earlier planning notes

2. `P2 Field Execution / Mobile Operational Loop`
   Status: in progress
   Goal:
   - make planner task -> execution module -> outcome registration a faster and clearer field workflow
   Current sub-slice:
   - `P2-D Mobile fast path` first slice done on 2026-04-23
   - type-check remediation and contract cleanup done on 2026-04-23, no longer blocking implementation
   - execution headers and evidence capture forms aligned with the mobile fast path on 2026-04-23
   - next recommended: validate the phone-sized loop end-to-end in runtime and then decide whether to close `P2-D` or open the next `P2` follow-up slice
   Current document:
   - `docs/reports/execution-plans/ORTOMIO_EXECUTION_PLAN_P2_FIELD_EXECUTION_LOOP_2026-04-19.md`

3. `P3 Documentation Truthfulness and Product Positioning`
   Status: in progress
   Goal:
   - align stakeholder docs, current-state docs and manual with what the code can actually do after the latest agronomic and execution improvements
   Working method:
   - before rewriting any remaining manual chapter, run a `promise -> code` audit against the older docs and convert unresolved promises into tracked `todo` items in this file
   Primary targets:
   - `docs/reports/ORTOMIO_APPLICATION_CURRENT_STATE_2026-04-18.md`
   - `docs/reports/ORTOMIO_STAKEHOLDER_PRESENTATION_2026-04-18.md`
   - `docs/manual/README.md`
   - `docs/manual/09-planner-ai-chat.md`
   - `docs/manual/10-activity-registry.md`
   New operating rule:
   - every gap surfaced while reviewing docs against code must be captured below in `Open Gap Register` before the session can be considered closed

4. `P4 Type-check and contract cleanup`
   Status: done
   Done on: 2026-04-23
   Goal:
   - reduce residual contract drift and prepare a cleaner verification loop beyond precision-hub tests
   Output:
   - global `tsc --noEmit` loop restored to clean state
   - residual contract drift closed across planner, execution, weather, irrigation, lifecycle, queue evidence and supporting services
   - precision-hub targeted verification rerun on the cleaned branch

5. `P5 Promise-to-Code Audit`
   Status: in progress
   Goal:
   - compare historical product promises with the current codebase before further manual cleanup
   Method reset on 2026-04-23:
   - do not classify a document from prose alone
   - first inspect the corresponding domain in code
   - distinguish `implemented-and-connected`, `implemented-but-partially-connected`, `implemented-as-backend-or-structure-only`, and `promise-only`
   - only after that decide whether the document is `keep`, `rewrite`, `todo-source`, or `delete-candidate`
   - if the chapter contains intended but unclosed capability, prefer `todo-source` first; only later decide whether to implement, rewrite down, archive or remove it
   Output expected:
   - list of modules that are `done`, `in progress`, or `todo`
   - explicit conversion of unclosed promises into tracked gaps or future implementation blocks
   Source set:
   - `docs/manual/*` legacy chapters
   - `docs/reports/ORTOMIO_STAKEHOLDER_PRESENTATION_2026-04-18.md`
   - older roadmap-style claims that describe product capability rather than verified code state
   Working document:
   - `docs/reports/ORTOMIO_DOCUMENTATION_AUDIT_2026-04-23.md`

## Companion Documents
- `docs/reports/ORTOMIO_TECHNICAL_IMPLEMENTATION_PLAN_2026-04-18.md`
- `docs/reports/PRECISION_AGRICULTURE_NEXT_EXECUTION_PLAN_2026-04-01.md`
- `docs/reports/ORTOMIO_APPLICATION_CURRENT_STATE_2026-04-18.md`
- `docs/reports/ORTOMIO_STAKEHOLDER_PRESENTATION_2026-04-18.md`
- `docs/reports/ORTOMIO_DOCUMENTATION_AUDIT_2026-04-23.md`

## Open Gap Register
Use this section for cross-cutting gaps that emerge while comparing UI, architecture and documentation. Do not leave them only in chat history.

Meta-rule for this register:
- if a manual chapter promises a capability that is not closed in code, the missing capability belongs here as a tracked `todo`
- only after that tracking step can the chapter be treated as `rewrite` or `delete-candidate`

1. `GAP-2026-04-23-A` Certifications maturity is not homogeneous across tabs
   Priority: high
   Related block: `P3`
   Evidence:
   - the route and dashboard are real, but `BIO` and `GlobalG.A.P.` are materially more implemented than `SQNPI` and `GRASP`
   Risk:
   - the product can be described too optimistically as one uniform certifications suite, or too pessimistically as pure concept
   TODO:
   - make the per-certification maturity explicit in docs and, if needed, in UI copy
   Closure rule:
   - each certification surface is labelled and documented according to its real implementation status

2. `GAP-2026-04-23-B` BIO workflow is visible in UI but not yet a full persisted certification loop
   Priority: high
   Related block: `P2` / `P3`
   Evidence:
   - `BioCertificationForm` provides structured capture and scoring, but current save flow is callback-driven and not yet clearly closed as a durable certification record pipeline
   Risk:
   - operators may infer that the BIO process is stored and audit-ready end-to-end when it is not yet guaranteed
   TODO:
   - decide whether to implement durable persistence and retrieval for BIO certification records or explicitly mark the current flow as assisted assessment
   Closure rule:
   - either BIO records are persisted/reloaded end-to-end, or the UI/manual consistently describe the current limitation

3. `GAP-2026-04-23-C` GlobalG.A.P. UI mixes real compliance structures with simulated completion actions
   Priority: medium
   Related block: `P2` / `P3`
   Evidence:
   - `GlobalGapDashboard` loads real overview services, but some action completion and document generation paths are simulated in UI
   Risk:
   - the dashboard can look more operationally closed than the underlying workflow really is
   TODO:
   - separate simulated actions from real persisted actions, or wire the remaining UI paths to durable backend behaviour
   Closure rule:
   - every visible action in the GlobalG.A.P. dashboard is either fully wired or explicitly marked as template/simulated support

4. `GAP-2026-04-23-D` Documentation drift was discovered too late and without mandatory capture
   Priority: high
   Related block: `P3`
   Evidence:
   - multiple manual chapters had diverged from the codebase and required forensic correction during the review
   Risk:
   - unresolved product mismatches remain invisible and continue to compound
   TODO:
   - keep this register active and add new mismatches as they are found during the manual sweep
   Closure rule:
   - all remaining manual chapters are reviewed against code and any mismatch is either fixed or logged here as an open item

5. `GAP-2026-04-23-E` Legacy manual still contains promise-driven chapters not grounded in verified code
   Priority: high
   Related block: `P5`
   Evidence:
   - several chapters still use language about ROI, autonomous operations, automatic certifications, premium support, full drone workflows or strong integration claims without first proving those paths in the current codebase
   Risk:
   - the manual keeps reintroducing ambiguity because some chapters are inherited from older promise documents rather than from implementation evidence
   TODO:
   - audit the remaining manual chapters against code and classify each chapter as `done`, `in progress`, or `todo`
   Closure rule:
   - no manual chapter remains in an unclassified promise state

6. `GAP-2026-04-23-F` Success-story and ROI style chapters are especially likely to overstate current product reality
   Priority: high
   Related block: `P5`
   Evidence:
   - legacy chapters such as `31-success-stories`, `28-economic-benefits`, parts of `21-individual-plants`, `26-integration-api` and `34-director-orchestrator` still contain strong outcome or integration claims
   Risk:
   - these chapters can silently undo the truthfulness work done elsewhere in the manual
   TODO:
   - audit these chapters first and either downgrade them to clearly aspirational material or rewrite them to verified current-state language
   Closure rule:
   - all high-risk promise-heavy chapters are either rewritten or explicitly moved out of the operational manual

7. `GAP-2026-04-23-G` Integration/API chapter describes an ecosystem much wider than the verified code surface
   Priority: high
   Related block: `P5`
   Evidence:
   - `docs/manual/26-integration-api.md` presents official ERP, marketplace, banking, insurance, SDK and automation integrations as current product capabilities
   Risk:
   - users and stakeholders can infer a public integration layer and partner ecosystem that the current repository does not substantiate
   TODO:
   - replace this chapter with a narrow description of real APIs/integrations
   Closure rule:
   - the manual no longer claims unsupported external integration breadth

8. `GAP-2026-04-23-H` ROI and business-benefit claims are documented as measured outcomes without verifiable grounding
   Priority: high
   Related block: `P5`
   Evidence:
   - `docs/manual/28-economic-benefits.md` and `docs/manual/31-success-stories.md` contain guaranteed savings, ROI, payback and market uplift claims
   Risk:
   - product documentation becomes commercially unreliable and undermines the credibility of the verified technical manual
   TODO:
   - remove or rewrite these chapters so that hypothetical value framing is clearly separated from verified product state
   Closure rule:
   - no operational manual chapter contains fabricated or unverified ROI/testimonial material

9. `GAP-2026-04-23-I` Scenario chapters blur illustrative examples with claimed real deployments
   Priority: medium
   Related block: `P5`
   Evidence:
   - `docs/manual/30-use-cases.md` presents staged adoption patterns and business results as if they were observed production use
   Risk:
   - scenario material can be misread as proof of implementation completeness or customer validation
   TODO:
   - rewrite scenario chapters as clearly illustrative workflows tied to verified modules only
   Closure rule:
   - scenario docs are explicitly labeled as examples, not proof points

10. `GAP-2026-04-23-J` Individual plant manual chapter overstates the verified plant-level feature surface
   Priority: medium
   Related block: `P5`
   Evidence:
   - `docs/manual/21-individual-plants.md` mixes a real plant-management domain with QR labeling, genealogy, breeding, biometric analytics and advanced predictive claims not yet established as the current connected baseline
   Risk:
   - a real but bounded module is documented as if it were a full per-plant precision platform
   TODO:
   - rewrite the chapter around verified plant management capabilities and move speculative features to roadmap/todo treatment
   Closure rule:
   - the chapter reflects only the actual plant-level workflows and clearly labels any forward-looking sections

11. `GAP-2026-04-23-K` Director manual chapter still contains residual maturity claims beyond the verified orchestration layer
   Priority: medium
   Related block: `P5`
   Evidence:
   - `docs/manual/34-director-orchestrator.md` now frames the module as hybrid, but still includes detailed workflow, metric, data-source and support claims that may exceed current verified implementation
   Risk:
   - the director surface appears more operationally unified and measurable than it really is today
   TODO:
   - tighten the chapter to the evidenced orchestration/briefing behaviour and remove unsupported metric/support claims
   Closure rule:
   - the director chapter is consistent with the actual hybrid state of the module

12. `GAP-2026-04-23-L` Individual plant domain is implemented across multiple layers but with uneven persistence and connection quality
   Priority: high
   Related block: `P5`
   Evidence:
   - the codebase includes `/app/plants`, `SmartPlantManager`, detail/lifecycle/monitoring/harvest surfaces, storage contracts, lifecycle migrations, transplant orchestration and row integration
   - however some plant operations still contain TODO/simulated persistence and some monitoring functions are client-side/localStorage based
   Risk:
   - the product can be underestimated as “just mock” or overestimated as fully unified and durable end-to-end
   TODO:
   - map plant-domain features into `implemented-and-connected`, `implemented-but-partially-connected`, and `implemented-as-backend-or-structure-only`
   - use that mapping to drive both manual rewrite and future integration work
   Closure rule:
   - the plant domain has an explicit maturity map and the manual reflects it accurately

13. `GAP-2026-04-23-M` Advanced plant monitoring features exist, but not all are backed by durable shared persistence
   Priority: medium
   Related block: `P5`
   Evidence:
   - plant monitoring services cover photos, maturity, Brix, treatments and harvest recommendation logic, but persistence is explicitly pragmatic and localStorage-backed in key areas
   Risk:
   - advanced monitoring can appear production-grade and team-shared when it may still behave as local or assistive tooling
   TODO:
   - decide which plant monitoring features should remain local assistive tools and which should be promoted to durable shared records
   Closure rule:
   - each advanced plant monitoring feature is clearly identified as local-assistive or durable-persisted

14. `GAP-2026-04-23-N` Director/orchestration domain is real but split between newer service flows and older legacy logic
   Priority: high
   Related block: `P5`
   Evidence:
   - `services/directorService.ts` powers a real daily briefing and agronomic queue layer
   - `components/director/DirectorBriefingWidget.tsx` exposes it in the UI
   - `logic/director.ts` still contains broad orchestration logic reused by dashboards and predictive flows
   - there is no standalone `/app/director` module
   Risk:
   - the product can be described as either more unified than it is, or less implemented than it really is
   TODO:
   - map which orchestration responsibilities belong to `directorService` vs `logic/director.ts`
   - decide whether to converge toward one orchestrator surface or continue documenting the layer as distributed
   Closure rule:
   - director/orchestration responsibilities are explicitly mapped and the manual describes the current architecture truthfully

15. `GAP-2026-04-23-O` API/integration domain exists, but as an internal route/provider layer rather than a mature external partner ecosystem
   Priority: high
   Related block: `P5`
   Evidence:
   - the codebase has many `app/api/*` endpoints, API-key/provider configuration, NDVI/IoT endpoints, support submission routes and selected external adapters
   - the current manual chapter describes official ERP, marketplace, fintech, SDK and automation ecosystems not supported by the verified code surface
   Risk:
   - real API work is obscured by an inflated narrative, making the product seem either overbuilt or untrustworthy
   TODO:
   - map the actual integration surface into:
     - internal application APIs
     - external provider adapters
     - webhook/machine ingestion points
     - not-yet-implemented external/public integrations
   Closure rule:
   - the integration chapter reflects the real API surface and clearly separates internal endpoints from future external integrations

16. `GAP-2026-04-23-P` Use-case chapter aggregates real modules with very different maturity levels and presents them as proven deployments
   Priority: medium
   Related block: `P5`
   Evidence:
   - `docs/manual/30-use-cases.md` references real domains such as NDVI, prescription maps, certifications, analytics, challenges, agronomist flows, drone services and IoT
   - the same chapter converts those references into measured results, validated customer stories and uniformly mature operational stacks
   Risk:
   - mixed-maturity modules are perceived as end-to-end production deployments rather than illustrative combinations of currently available building blocks
   TODO:
   - rewrite the chapter as scenario-based examples tied to verified modules and label mixed-maturity areas explicitly
   Closure rule:
   - each scenario is grounded in verified modules and contains no implied real-customer outcome claims

17. `GAP-2026-04-23-Q` Economic domain exists in limited form, but the manual describes it as a validated business-impact system
   Priority: high
   Related block: `P5`
   Evidence:
   - the codebase includes partial economic tooling: analytics ROI summaries, prescription cost analysis, harvest value tracking, operation costs and selected pricing/market services
   - `docs/manual/28-economic-benefits.md` turns that partial surface into guaranteed savings, fixed payback windows, size-based ROI tables and business advisory claims
   Risk:
   - a partially implemented economic layer is perceived as a validated commercial outcome engine
   TODO:
   - map the actual economic features into verified coverage vs unsupported claims
   - rewrite the chapter as narrow economic visibility/cost tracking, or remove it from the in-app manual
   Closure rule:
   - the economic chapter, if retained, reflects only the currently supported economic calculations and clearly states their limits

18. `GAP-2026-04-23-R` Success-stories chapter contains factual-looking customer/testimonial material that is not verifiable from the repository
   Priority: high
   Related block: `P5`
   Evidence:
   - `docs/manual/31-success-stories.md` references real product domains such as certifications, analytics, NDVI, drone, traceability, agronomist and challenge mechanics
   - the same chapter then presents named companies, direct testimonials, awards, media mentions and precise business outcomes as historical facts without repository-grounded evidence
   Risk:
   - the operational manual includes narrative material that reads as factual proof, but is not supported by implementation evidence and is therefore more misleading than a normal roadmap-style promise
   TODO:
   - remove `31-success-stories` from the in-app manual
   - if any content is worth preserving, reintroduce it only as anonymous illustrative scenarios tied to verified modules and explicitly not as customer proof
   Closure rule:
   - no in-app manual chapter contains named testimonial, award or customer-outcome material unless it is backed by verifiable source evidence available to the product team

19. `GAP-2026-04-23-S` Sustainability chapter composes real environmental signals into a much broader ESG/carbon platform than the verified code supports
   Priority: medium
   Related block: `P5`
   Evidence:
   - the codebase includes environmental monitoring, weather lineage, irrigation efficiency context, selected environmental scoring and a sustainability tab in analytics
   - `docs/manual/24-sustainability.md` describes full carbon accounting, biodiversity indices, circular-economy programs, ESG reporting and environmental certification workflows as if they were already implemented end-to-end
   Risk:
   - a real but narrow environmental foundation is documented as a comprehensive sustainability suite, which creates both product overclaim and confusion about what data is actually durable and measurable
   TODO:
   - map sustainability features into verified environmental monitoring, water/irrigation support, lightweight analytics indicators and unsupported broader ESG/carbon claims
   - rewrite the chapter around the verified baseline only
   Closure rule:
   - the sustainability chapter reflects the actual environmental tooling and clearly excludes unsupported ESG/carbon/circular-economy claims

20. `GAP-2026-04-23-T` Orchard chapter overstates the most advanced precision-orchard and analytics layers relative to a real but uneven implementation
   Priority: medium
   Related block: `P5`
   Evidence:
   - `/app/orchard`, `orchardService`, orchard dashboard/wizard/tree/pruning/harvest managers and Supabase-backed orchard structures are real
   - the current chapter extends that real base into robotics, complete advanced analytics, computer-vision automation and broader commercial/post-harvest workflows that are not established as uniformly connected modules
   Risk:
   - a substantial orchard module is documented as if every advanced precision-orchard promise were already closed and production-ready
   TODO:
   - map orchard features into verified operational core vs unsupported advanced precision claims
   - rewrite the chapter around the verified core only
   Closure rule:
   - orchard docs describe the real operational stack and clearly exclude unsupported advanced precision/commercial claims

21. `GAP-2026-04-23-U` Olive vertical is real but partly assembled from orchard foundations plus local specialist widgets
   Priority: high
   Related block: `P5`
   Evidence:
   - `/app/olives` exists and is operational
   - olive contexts are resolved from garden/orchard data and the page reuses orchard operational managers
   - olive-specific widgets such as maturity tracking and olive-fly monitoring currently rely on local state/sample-style readings rather than a clear durable domain backend
   Risk:
   - the product can be documented as a fully mature olive-specialist stack when part of the specialist layer is still assistive/local and built on shared orchard infrastructure
   TODO:
   - map which olive features are durable/shared vs local assistive
   - decide whether to deepen olive-specific persistence or document the current hybrid state explicitly
   Closure rule:
   - olive documentation clearly separates orchard-backed operations from local/demo-style specialist tooling, or the tooling is promoted to durable persisted workflows

22. `GAP-2026-04-23-V` Vineyard chapter extends a real vertical into winery/market-intelligence coverage beyond the verified product surface
   Priority: medium
   Related block: `P5`
   Evidence:
   - `/app/vineyard`, `vineyardService`, `vineyardBudLoadService`, vineyard dashboards/wizard and vine management are real and materially implemented
   - the current chapter still describes deeper cantina integration, market analysis and broad end-to-end viticulture intelligence not established as uniformly connected modules
   Risk:
   - a real vineyard vertical is oversold as a full vineyard-to-winery intelligence suite
   TODO:
   - map verified vineyard operations vs unsupported winery/market-intelligence claims
   - rewrite the chapter around the verified vineyard baseline only
   Closure rule:
   - vineyard docs reflect the actual operational and persistence layer without unsupported winery/market overclaim

23. `GAP-2026-04-23-W` Agronomist domain has real UI/data structures but not a consolidated consultation-service backend
   Priority: medium
   Related block: `P5`
   Evidence:
   - agronomist types and UI components exist for contacts, consultation capture and listing
   - `services/agronomistService.ts` remains largely stubbed for reads and applied-advice workflows
   - there is no verified marketplace, booking, payment or robust automatic prescription integration layer
   Risk:
   - a partially implemented agronomist surface can oscillate between being dismissed as fake or overstated as a complete consultation module
   TODO:
   - map which agronomist flows are truly storage-backed vs scaffold/UI-only
   - decide whether to keep the module intentionally lightweight or deepen the backend/service layer
   Closure rule:
   - agronomist documentation and implementation clearly agree on what is currently operational and what is not

24. `GAP-2026-04-23-X` Export surface is real but fragmented across simple client-side flows, helper services and selected API endpoints
   Priority: medium
   Related block: `P5`
   Evidence:
   - `/app/export`, `services/exportService.ts` and selected `/api/export/*` routes exist
   - the current export capability is pragmatic and partial, not a single consolidated export framework
   Risk:
   - future docs or UI could again collapse these scattered capabilities into an overclaimed universal export system
   TODO:
   - inventory actual export families and supported formats
   - distinguish client-side convenience export, backup/portability export and specialist module export
   Closure rule:
   - export documentation and product copy reference only the verified export families and formats actually supported

25. `GAP-2026-04-23-Y` AI predictions are real but still distributed across multiple engines, dashboards and maturity levels
   Priority: medium
   Related block: `P5`
   Evidence:
   - predictive services exist for harvest timing, yield, disease risk, water requirement and agronomic prioritization
   - dedicated route and API exist for AI predictions
   - some UI layers still use mock-loading patterns and not all predictive surfaces share the same engine or data contracts
   Risk:
   - the product can be documented either as a single unified AI engine or dismissed as mostly mock, while the real state is a distributed hybrid predictive layer
   TODO:
   - map predictive surfaces into mature operational services vs staged dashboards
   - converge or document the current multi-engine architecture explicitly
   Closure rule:
   - AI predictions are documented and exposed according to their actual service/UI maturity

26. `GAP-2026-04-23-Z` Drone domain includes real planning/execution scaffolding but remains simulated and non-persisted
   Priority: high
   Related block: `P5`
   Evidence:
   - `droneIntegrationService.ts` and `/api/drone/*` endpoints implement flight-plan creation, auto-planning and execution flows
   - flight plans are held in memory, execution is explicitly simulated and analysis results are synthetic/randomized
   Risk:
   - the drone module can be understated as pure concept or overstated as real hardware-integrated operations, while it is actually a prototype-like operational scaffold
   TODO:
   - decide whether to deepen persistence/hardware integration or document the current prototype boundary explicitly
   - rewrite drone docs and, if needed, UI copy around this real-but-simulated state
   Closure rule:
   - drone documentation and product copy clearly describe the current scaffold/prototype status or the implementation is promoted to durable integrated workflows

27. `GAP-2026-04-23-AA` NDVI surface is real but still mixes provider-backed data with fallback/simulated analysis paths
   Priority: medium
   Related block: `P5`
   Evidence:
   - `/app/ndvi`, NDVI dashboards, config-status flows and satellite service are real
   - the NDVI service explicitly falls back to simulated data and some trend/stress logic is still hybrid rather than fully quantitative remote-sensing processing
   Risk:
   - the module can be described either as too weak to matter or as a fully quantitative satellite intelligence pipeline, while the real state is in between
   TODO:
   - keep NDVI docs/provider status explicit about real vs fallback data
   - improve visibility of source quality where needed in UI/manual
   Closure rule:
   - NDVI documentation and UI consistently disclose when data is provider-backed versus fallback/simulated

28. `GAP-2026-04-23-AB` Prescription maps are more implemented than a preview, but the field-validated end-to-end chain remains uneven
   Priority: high
   Related block: `P5`
   Evidence:
   - dedicated route, dashboard, service layer, schema, persistence, export records and execution/outcome summaries exist
   - productive use still depends on mixed-maturity data sources, manual validation and incomplete closure of map -> field import -> applied outcome
   Risk:
   - the module is either underestimated as a mere beta mockup or overstated as a universally trusted VRT execution chain
   TODO:
   - rewrite docs/UI around `real module with partial end-to-end closure`
   - continue improving field import/applied/export/outcome linkage and machinery validation
   Closure rule:
   - prescription maps are documented according to their true operational maturity and the remaining field-validation gaps are either closed or explicitly surfaced

29. `GAP-2026-04-23-AC` Traceability domain is real but documented as a much broader immutable commercial/compliance platform
   Priority: high
   Related block: `P5`
   Evidence:
   - blockchain traceability service and related API routes exist
   - the current chapter claims automatic end-to-end product history, QR/commercial activation, premium pricing, ESG/carbon/NFT and broad compliance closure far beyond the verified baseline
   Risk:
   - a real but bounded traceability/prototype layer is mistaken for a fully operational chain-of-custody and consumer commerce platform
   TODO:
   - map verified traceability features vs unsupported commercial/compliance claims
   - rewrite the chapter around the actual traceability scaffold only
   Closure rule:
   - traceability docs describe only the real operational/prototype surface and exclude unsupported chain-of-custody/commercial overclaim

30. `GAP-2026-04-23-AD` BIO certification guide is grounded in a real form but still implies stronger audit-readiness than the product currently guarantees
   Priority: medium
   Related block: `P5`
   Evidence:
   - BIO form, checklist and document surfaces exist
   - document handling and certification closure are still mixed in maturity and not all support is durably end-to-end
   Risk:
   - operators may read the guide as a full certification operations manual rather than an assisted readiness tool
   TODO:
   - rewrite the guide around actual score/form support and current certification-readiness boundaries
   Closure rule:
   - BIO guide clearly distinguishes assisted readiness support from full certification closure

31. `GAP-2026-04-23-AE` AI overview chapter compresses uneven AI domains into one coherent decision layer
   Priority: medium
   Related block: `P5`
   Evidence:
   - `docs/manual/07-ai-overview.md` presents AI as a unified transversal decision engine across predictions, director, planner chat, diary, NDVI, drones and irrigation
   - code inspection shows those domains are real but materially uneven in architecture, persistence and runtime maturity
   Risk:
   - the product can appear more uniformly AI-orchestrated than the current implementation actually is
   TODO:
   - map current AI surfaces into explicit sub-domains with maturity labels instead of one flattened AI layer
   - decide later whether to converge those surfaces architecturally or document them as intentionally distributed
   Closure rule:
   - the AI overview is backed by an explicit sub-domain maturity map and no longer implies a uniform AI engine where one does not exist

32. `GAP-2026-04-23-AF` Global AI chat chapter promises a universal contextual assistant well beyond the verified implementation
   Priority: high
   Related block: `P5`
   Evidence:
   - `components/ai/GlobalAIChat.tsx` exists, but currently uses local canned responses and simulated delay
   - `app/api/ai/chat/route.ts` provides a real Gemini-backed AI route with credits/tier checks
   - the current gap is therefore partly architectural/UI: the globally mounted chat widget is not wired to the real AI route
   - there is still no verified end-to-end evidence for universal page context, strong memory, support escalation, omnipresent actions or the large specialist knowledge base claimed in `docs/manual/08-global-ai-chat.md`
   Risk:
   - users can infer a globally contextual assistant with production-grade grounding and operational control that the codebase does not currently close
   - at the same time, the product can be underestimated as “fake chat only” even though a real backend AI path already exists
   TODO:
   - wire the global chat UI to the real AI route or explicitly split demo chat from production AI entrypoints
   - separate current chat surface from future capabilities such as durable memory, grounded contextual actions, support escalation and broad knowledge integration
   - treat the missing capabilities as tracked implementation work before any manual rewrite
   Closure rule:
   - the global chat chapter only describes verified chat behaviour, the UI path to real AI is explicit, and all stronger assistant capabilities are either implemented or explicitly tracked as open work

33. `GAP-2026-04-23-AG` Planner task loop is materially stronger than planner chat generation logic
   Priority: medium
   Related block: `P2` / `P5`
   Evidence:
   - planner task persistence, agronomic queue, execution launches and evidence-contract exposure are real and connected
   - `PlannerAIChat.tsx` and `PlannerAIChatFixed.tsx` still rely on local canned response logic rather than a durable, task-aware planning engine
   Risk:
   - the planner can be discussed either too optimistically as a unified AI planner or too pessimistically as mostly mock, while the real state is split between solid task orchestration and lighter chat guidance
   TODO:
   - keep documenting the planner as hybrid
   - later decide whether planner chat should be wired into the same real task/orchestration substrate or remain a lightweight assistive layer
   Closure rule:
   - planner documentation and architecture clearly distinguish real task/execution orchestration from assistive chat guidance

34. `GAP-2026-04-23-AH` Smart Hub has real telemetry foundations but still mixed registry, actuation and automation maturity
   Priority: medium
   Related block: `P5`
   Evidence:
   - telemetry and sensor-reading routes exist under `app/api/iot/*` and `app/api/sensors/readings/route.ts`
   - `services/sensorDataService.ts` provides real typed sensor-reading persistence helpers
   - `services/iotSensorService.ts` still contains TODO/mock-style device connectivity paths
   Risk:
   - the IoT domain can be misunderstood either as mostly absent or as a fully operational device-management and automation center
   TODO:
   - separate the real ingestion/persistence layer from future device registry, actuator control and stable automation rules
   Closure rule:
   - Smart Hub documentation and implementation explicitly distinguish telemetry reality from still-open actuation/automation work

35. `GAP-2026-04-23-AI` Automated diary chapter implies a more uniformly closed daily tracking system than the current implementation guarantees
   Priority: high
   Related block: `P5`
   Evidence:
   - real diary surfaces, cron entrypoint, predictive engine and diary-related migrations exist
   - `docs/manual/35-automated-diary.md` still describes a strongly closed nightly pipeline, broad event generation and mature comparative analytics as if they were uniformly settled product behaviour
   Risk:
   - users can infer a fully reliable automatic agronomic diary platform where the current system is real but still uneven in closure, presentation and operational guarantees
   TODO:
   - map which diary capabilities are already durable and operational versus predictive/assistive or still partial
   - convert the missing automatic-diary closure into tracked work before any final rewrite of the chapter
   Closure rule:
   - the diary chapter reflects only verified daily-tracking behaviour and all stronger automation claims are either implemented or explicitly tracked as open work

## Resume Protocol
When a new chat resumes work:
1. open this master index
2. open the latest active plan document
3. review the `Open Gap Register` and pick the highest-priority unresolved item if it blocks truthful product communication or reliable execution
4. verify git status before editing
5. implement one bounded slice
6. update status in the active plan and, if priorities change, in this index
