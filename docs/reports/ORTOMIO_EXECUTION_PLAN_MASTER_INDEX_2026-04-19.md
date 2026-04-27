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

## Product Advancement Contract
Manual truth alignment is not a product retreat.

Operational rule:
- when legacy documentation promises a valuable capability that is not implemented yet, the default action is to preserve the ambition as an explicit implementation candidate in this master plan
- the manual may stop presenting the capability as current behaviour, but the capability must not disappear from product planning unless it is intentionally rejected as obsolete, unsafe, legally risky or strategically out of scope
- each softened/removed manual promise should be classified as one of:
  - `implement`: promote into a concrete product epic/task
  - `defer`: keep as a future roadmap item with dependencies
  - `reject`: document why it should not be built
- for future blocks after T6, the expected output is not only cleaner documentation; it is a prioritized implementation backlog that moves Ortomio toward the original product vision where that vision is technically and commercially valid

## Architecture Boundary Contract
Product advancement must also respect the current architecture boundary.

Context:
- OrtoMio started as a smaller application and grew through repeated product expansions
- some domains are now mature enough to keep extending in the current stack
- other domains show fragmentation across UI state, local storage, Supabase tables, API routes, services, simulated workflows and documentation promises
- before implementing large promises, the team must decide whether to extend, consolidate or convert the architecture

Operational rule:
- every promoted implementation candidate must declare one of these architecture paths:
  - `extend-current`: the current stack and module boundary are adequate; implement by wiring or deepening existing services/routes/schema
  - `consolidate-first`: the product direction is valid, but the current implementation is fragmented and needs service/schema/API consolidation before feature work
  - `convert-platform`: the promise requires a stronger architectural change, such as a dedicated domain service, event/evidence ledger, integration gateway, background workflow layer or different persistence boundary
  - `reject-architecture`: the promise is not worth implementing because it would distort the product or create disproportionate technical/operational risk
- manual alignment must therefore capture both truth and architecture readiness
- if a feature is valuable but blocked by architecture, it should stay in the master plan as a conversion/consolidation TODO, not vanish from the product vision

Decision checklist for every future gap:
- identify the real current implementation surface: UI, services, API routes, schema, background jobs, external dependencies and persistence
- identify the promised product outcome
- classify missing work as `feature-completion`, `service-consolidation`, `schema-consolidation`, `integration-boundary`, `workflow-orchestration`, `evidence-ledger`, `runtime-scaling` or `out-of-scope`
- choose `extend-current`, `consolidate-first`, `convert-platform` or `reject-architecture`
- update this master plan before changing the manual

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

## Strategic TODO Map
This section is Phase 2 of the audit: convert `todo-source` chapters and open gaps into grouped execution blocks that can later be implemented, removed or archived explicitly.

Rule:
- every block below is a real master-plan `todo`
- each block groups multiple documentation promises into one product/program decision area
- only capabilities that still make sense for the product should stay here
- obsolete or purely speculative promises should move toward explicit removal/archive, not silent persistence

1. `T1 AI Surfaces Consolidation`
   Status: done
   Goal:
   - unify what should be a real AI surface across global chat, planner assistance, director and overview layers
   Source chapters:
   - `docs/manual/07-ai-overview.md`
   - `docs/manual/08-global-ai-chat.md`
   - `docs/manual/09-planner-ai-chat.md`
   - `docs/manual/34-director-orchestrator.md`
   Includes:
   - global AI chat UI/backend wiring and post-wiring hardening
   - contextual AI memory strategy
   - planner chat versus real planner task/orchestration boundary
   - director versus distributed orchestration clarity
   First TODO candidates:
   - define the canonical AI entry surfaces that are meant to be real product capabilities
   - decide which AI surfaces remain assistive/lightweight and which must be fully connected
   - converge or explicitly separate `global chat`, `planner chat` and `director` responsibilities
   Closure rule:
   - AI capabilities shown in the manual correspond to explicit, named product surfaces with clear ownership and maturity
   Working breakdown:
   - `T1-A AI Surface Inventory`
     Status: done
     Scope:
     - inventory `global chat`, `planner chat`, `director`, `ai-predictions`, `advice` and related assistive layers
     - classify each one as `execution-grade`, `assistive`, or `legacy/distributed`
     Sources:
     - `GAP-2026-04-23-AE`
     - `GAP-2026-04-23-N`
     - `GAP-2026-04-23-Y`
     Output:
     - one explicit AI surface map with owner, runtime path and maturity
     Current inventory snapshot:
     - `Global AI Chat`
       Owner area:
       - cross-app assistant entry surface
       UI/runtime:
       - `components/ai/GlobalAIChat.tsx`
       - mounted in `app/app/layout.tsx`
       Service/backend:
       - `app/api/ai/chat/route.ts`
       Maturity:
       - `assistive`
       Main gap:
       - real backend path exists, but memory, contextual grounding, action layer and support escalation are not closed
     - `Planner AI Chat`
       Owner area:
       - planner assistive conversation layer
       UI/runtime:
       - `components/planner/PlannerAIChat.tsx`
       - `components/planner/PlannerAIChatFixed.tsx`
       - used around planner/diary integrations
       Service/backend:
       - local canned-response logic in component layer
       Maturity:
       - `assistive`
       Main gap:
       - not yet part of the durable planner task/orchestration substrate
     - `Planner Task/Queue Intelligence`
       Owner area:
       - planner execution-grade agronomic orchestration
       UI/runtime:
       - `app/app/planner/page.tsx`
       - `components/planner/AgronomicQueueTaskPanel.tsx`
       Service/backend:
       - `services/directorService.ts`
       - agronomic queue and execution launch services
       Maturity:
       - `execution-grade`
       Main gap:
       - strong operational path exists, but the product boundary versus planner chat is still unclear
     - `Director`
       Owner area:
       - cross-module briefing and orchestration
       UI/runtime:
       - `components/director/DirectorBriefingWidget.tsx`
       - dashboard embeddings
       Service/backend:
       - `services/directorService.ts`
       - `logic/director.ts`
       Maturity:
       - `legacy/distributed`
       Main gap:
       - responsibilities are split between newer service flows and older orchestration logic
     - `AI Predictions`
       Owner area:
       - predictive analytics and recommendation domain
       UI/runtime:
       - `app/app/ai-predictions/page.tsx`
       - predictive dashboards/components
       Service/backend:
       - `services/predictiveAnalyticsService.ts`
       - related predictive services
       Maturity:
       - `execution-grade`
       Main gap:
       - predictive capability is real, but distributed across multiple services and UI layers rather than one unified engine
     - `Advice`
       Owner area:
       - assistive agronomic recommendation surface
       UI/runtime:
       - `app/app/advice/page.tsx`
       Service/backend:
       - mixed component logic and selected task-creation integrations
       Maturity:
       - `assistive`
       Main gap:
       - useful recommendation surface, but much of the page still behaves as guided/sample assistance rather than a fully grounded decision engine
     - `Health`
       Owner area:
       - assistive and monitoring-heavy health surface
       UI/runtime:
       - `app/app/health/page.tsx`
       - health dashboard components
       Service/backend:
       - `services/health*`
       - monitoring and microclimate services
       Maturity:
       - `hybrid`
       Main gap:
       - real monitoring context exists, but the surface is not a unified diagnostic AI engine
   - `T1-B Global Chat Hardening`
     Status: done
     Scope:
     - stabilize the real global AI chat path now that UI -> backend wiring exists
     - define what current chat guarantees are actually supported
     - defer or reject unsupported promises such as full memory/action/support escalation until explicitly planned
     Sources:
     - `GAP-2026-04-23-AF`
     Output:
     - global chat documented and implemented as a real bounded capability
     Current guaranteed scope:
     - globally mounted chat entry exists in the authenticated app shell
     - the widget calls the real backend route `app/api/ai/chat/route.ts`
     - the route performs real model invocation with tier/credit checks
     - the surface is currently an `assistive` conversational entry point, not an execution-grade orchestrator
     Verified current code:
     - `components/ai/GlobalAIChat.tsx`
       Current behavior:
       - sends only `{ message }` to `/api/ai/chat`
       - renders backend reply
       - handles insufficient credits, auth/tier failure and backend errors with user-facing fallback text
       - appends remaining credits when returned
       Gap:
       - no bounded app/module context is sent yet
       - suggestions are fallback/static, not returned by a verified action registry
     - `app/api/ai/chat/route.ts`
       Current behavior:
       - requires `PLUS` or `PRO`
       - charges `getCreditCost('chat')`
       - calls Gemini with raw message text
       - deducts credits and logs a credit transaction
       Gap:
       - no structured prompt contract
       - no context schema validation
       - no routing/action response contract
     Not yet guaranteed:
     - durable conversation memory across sessions
     - strong page-aware contextual grounding
     - direct in-app actions and tool execution from chat
     - human escalation/support workflow
     - source-attributed domain grounding across the product
     Concrete TODOs:
     - `T1-B1 Chat Contract`
       Status: done
       Goal:
       - define the exact supported contract of global chat today: who can use it, what it answers, and what it explicitly does not guarantee
       Closure rule:
       - one short bounded capability statement exists in master/docs and matches the actual implementation
       Current proposed contract:
       - `Global AI Chat` is a cross-app assistive chat entry available inside the authenticated application shell
       - it is intended for natural-language agronomic and product-support questions
       - it uses the real backend AI route with tier/credit checks
       - it may answer using general agronomic and product guidance, but it is not yet a guaranteed page-aware orchestration surface
       - it does not yet guarantee durable memory, direct operational execution, official support escalation, or source-grounded product reasoning across every module
       Decision target:
       - accept this bounded contract as the current product truth unless a broader chat scope is explicitly planned and implemented
       Implementation:
       - `app/api/ai/chat/route.ts` now builds a controlled OrtoMio prompt rather than sending raw user text directly
       - prompt guardrails explicitly prohibit claiming task creation, operation logging, device control or hidden data mutation
       Verification:
       - `npx tsc --noEmit` passes
     - `T1-B2 Error and Credit UX`
       Status: done
       Goal:
       - standardize the user-facing behaviour for auth/tier failure, insufficient credits and backend errors
       Closure rule:
       - error states are consistent and do not silently degrade into misleading “AI worked” behaviour
       Implementation:
       - `components/ai/GlobalAIChat.tsx` now separates recoverable UI error messages from AI answers
       - insufficient credits, auth/tier failure, invalid input, backend failure and network failure have explicit user-facing messages
       - backend/network failures no longer append canned agronomic fallback content that could look like a successful AI response
       - `app/api/ai/chat/route.ts` returns a stable generic `internal_error` message instead of leaking raw exception text
       Verification:
       - `npx tsc --noEmit` passes
     - `T1-B3 Context Strategy`
       Status: done
       Goal:
       - decide whether global chat should remain mostly generic or receive a first bounded layer of app/page context
       Closure rule:
       - context strategy is explicit: either intentionally generic, or context-aware with named inputs
       Current backend decision:
       - global chat supports optional bounded context
       - if context is missing or invalid, the route continues as generic assistive chat
       - accepted context is schema-limited and must be declared by `type`
       Current frontend decision:
       - `components/ai/GlobalAIChat.tsx` sends a first bounded `director-context`
       - the first UI context contains only current route, inferred module and safe routing hints
       - no hidden page state, garden records, sensor data, task mutation context or durable memory is passed implicitly
       Verification:
       - `npx tsc --noEmit` passes
     - `T1-B4 Memory and Action Triage`
       Status: done
       Goal:
       - decide whether memory, action execution and support escalation belong to the product target of global chat or should stay out of scope
       Closure rule:
       - unsupported promises are either promoted into planned work or explicitly excluded from the global chat contract
       Current decision:
       - `support escalation`:
         - `out of scope` for now
       - `context-aware analysis`:
         - `in scope`
       - `decision assistance`:
         - `in scope`
       - `suggested next actions`:
         - `in scope`
       - `launch into existing modules / guided operational routing`:
         - `in scope`
       - `autonomous open-ended execution`:
         - `out of scope` for now
       - `durable memory`:
         - `defer`
       Working product boundary:
       - global chat is allowed to understand context, evaluate signals, suggest next actions and route the operator into existing product flows
       - global chat is not yet a free-form autonomous agent and is not a human support escalation channel
       Code audit:
       - `components/ai/GlobalAIChat.tsx` keeps conversation state only in local React state for the current widget session
       - no durable chat transcript table, memory store or cross-session recall is wired to the global chat route
       - `app/api/ai/chat/route.ts` performs model invocation, credit deduction and credit transaction logging only
       - the global chat route does not create tasks, mutate agronomic records, command devices or open support tickets
       - real task creation exists in explicit planner surfaces such as `components/planner/AgronomicQueueTaskPanel.tsx`, where the user clicks to create the task and the decision snapshot is registered
       - separate AI suggestion surfaces such as `components/ai/AISuggestionsWidget.tsx` support accept/reject feedback, but they are not the global chat action layer
       - `components/ai/AIActionButton.tsx` is a contextual assistive AI button, not a governed global-chat tool execution system
       Promoted future work:
       - durable memory remains a future explicit block after the operational ledger/memory model is clarified
       - write-capable AI actions require a dedicated suggested-action registry and user-confirmed execution contract before they can be exposed from global chat
       - support escalation remains excluded until a real support workflow exists
       Verification:
       - code search confirms no global-chat write path beyond credits and transaction logging
     Implementation tracks now allowed by the boundary:
     - `T1-B5 Context Input Contract`
       Status: done
       Goal:
       - define which module-level signals can be passed to global chat in a bounded and explicit way
       Candidate first contexts:
       - health
       - planner/task context
       - irrigation summary
       - diary/environmental summary
       - harvest/maturity context where available
       Closure rule:
       - the chat receives only named, documented context payloads per module instead of undefined implicit app state
       Current proposed allowed context families:
       - `garden-context`
         Fields:
         - `gardenId`
         - `gardenName`
         - `zoneId`
         - `fieldRowId`
         - `primaryCrop`
         Use:
         - base anchoring of the conversation to the active agronomic perimeter
       - `task-context`
         Fields:
         - `sourceTaskId`
         - `taskType`
         - `plantName`
         - `date`
         - `zoneId`
         - `rowId`
         - `rowNumber`
         Source baseline:
         - `services/taskExecutionLaunchService.ts`
         Use:
         - interpret next actions from planner/task-aware flows
       - `health-context`
         Fields:
         - `scopeType`
         - `scopeId`
         - `scopeName`
         - `fungalPressure`
         - `waterStress`
         - `heatStress`
         - `supportingSignals`
         - `note`
         Source baseline:
         - `services/healthScopeService.ts`
         Use:
         - bounded health-state interpretation and next-action assistance
       - `diary-environment-context`
         Fields:
         - `date`
         - `weather_data`
         - `agronomic_data`
         - `automated_events`
         Source baseline:
         - `components/diary/AutomatedDiaryViewer.tsx`
         - diary/environmental services
         Use:
         - interpret recent environmental conditions and diary-derived agronomic signals
       - `irrigation-context`
         Fields:
         - `gardenId`
         - `zoneId`
         - `fieldRowId`
         - latest operational watering/task summary when available
         Use:
         - evaluate irrigation-related next actions without granting actuator autonomy
       - `harvest-maturity-context`
         Fields:
         - `gardenId`
         - `plantName`
         - `analysisType`
         - `maturityPercentage`
         - `harvestRecommendation`
         Source baseline:
         - `types/plantMonitoring.ts`
         - crop-specific maturity/harvest types where available
         Use:
         - bounded maturity interpretation and harvest preparation guidance
       Explicit exclusions for this stage:
       - arbitrary full-page state dumps
       - hidden internal stores with no declared schema
       - unrestricted write-capable action contexts
       Decision note:
       - every context family must have a named schema and a documented source before it can be passed into global chat
       Backend implementation:
       - `app/api/ai/chat/route.ts` accepts optional `context`
       - accepted context types:
         - `garden-context`
         - `task-context`
         - `health-context`
         - `diary-environment-context`
         - `irrigation-context`
         - `harvest-maturity-context`
         - `director-context`
       - accepted context fields:
         - `type`
         - `scope`
         - `summary`
         - `signals`
         - `missingSignals`
         - `routingHints`
       Guardrail:
       - unknown context types are ignored rather than trusted
       - only primitive values from `scope` and `signals` are passed into the prompt
       Frontend implementation:
       - `components/ai/GlobalAIChat.tsx` now sends the first `director-context`
       - current payload includes:
         - `scope.primaryScope = site`
         - `scope.route`
         - `scope.module`
         - a human-readable summary of the active app module
         - module-specific safe routing hints
       Remaining TODO:
       - wire module-owned `health-context`, `task-context`, `irrigation-context`, `diary-environment-context` and `harvest-maturity-context` only where the source data is explicit and schema-mapped
       Closure result:
       - global chat now has a bounded input contract and a first route/module `director-context`
       - richer module-owned contexts are future hardening and must not be documented as current global-chat grounding until implemented
     - `T1-B6 Decision Templates`
       Status: done
       Goal:
       - define the first bounded agronomic decision templates the chat is allowed to support
       Candidate first templates:
       - health-state interpretation
       - fruit maturity interpretation
       - planting opportunity analysis from weather/soil/history signals
       - next-action recommendation from task/diary/environment context
       Closure rule:
       - the product exposes a bounded set of recognized decision-support patterns instead of generic “ask anything” ambiguity
       Current proposed first template set:
       - `DT-01 Health State Interpretation`
         Inputs:
         - `health-context`
         - optional `garden-context`
         Output:
         - concise interpretation of current pressure/stress signals
         - operator-facing risk framing
         - suggested next checks or actions
         Guardrail:
         - no claim of definitive diagnosis unless backed by a dedicated diagnostic flow
       - `DT-02 Fruit Maturity Interpretation`
         Inputs:
         - `harvest-maturity-context`
         - optional `garden-context`
         Output:
         - maturity reading
         - harvest timing guidance
         - suggested preparation actions
         Guardrail:
         - support interpretation only; not an autonomous harvest decision engine
       - `DT-03 Planting Opportunity Analysis`
         Inputs:
         - `diary-environment-context`
         - `garden-context`
         - optional historical/task context when available
         Output:
         - whether current conditions support planting/planning
         - main blocking or enabling signals
         - suggested next planning action
         Guardrail:
         - no guarantee of full agronomic optimization from incomplete context
       - `DT-04 Next Action Recommendation`
         Inputs:
         - `task-context`
         - optional `diary-environment-context`
         - optional `health-context`
         Output:
         - prioritized next action
         - reason for recommendation
         - routing suggestion into the right module
         Guardrail:
         - recommendation must map to a supported action in the action registry
       - `DT-05 Irrigation Support Interpretation`
         Inputs:
         - `irrigation-context`
         - optional `diary-environment-context`
         Output:
         - bounded interpretation of irrigation-related signals
         - suggested next review or intervention
         Guardrail:
         - no autonomous actuator command or automatic watering commitment
       - `DT-06 Product Navigation and Capability Clarification`
         Inputs:
         - current module context when available
         Output:
         - explain what the module can do now
         - clarify whether the user should use planner, health, irrigation, nutrition, harvest or mechanical flow next
         Guardrail:
         - must follow the current manual/master truth contract, not legacy promises
       Closure result:
       - first bounded decision-support templates are defined as product governance
       - these templates are not yet a separate runtime classifier; current runtime remains prompt-guarded assistive chat with bounded context
     - `T1-B7 Suggested Action Registry`
       Status: done
       Goal:
       - define the set of allowed next-action suggestions the chat can emit
       Candidate first actions:
       - create or open a task
       - open health module
       - open nutrition/treatments
       - open irrigation
       - open harvest registration
       - open mechanical work execution
       Closure rule:
       - chat suggestions map to an explicit registry of supported actions, not to free-form promises
       Current proposed first registry:
       - `AR-01 Open Planner`
         Effect:
         - route the user to planner for review or task follow-up
         Type:
         - navigation
       - `AR-02 Open Health`
         Effect:
         - route the user to health for monitoring or diagnostic follow-up
         Type:
         - navigation
       - `AR-03 Open Irrigation`
         Effect:
         - route the user to irrigation for review or watering execution
         Type:
         - navigation / guided routing
       - `AR-04 Open Nutrition/Treatments`
         Effect:
         - route the user to nutrition/treatments for treatment planning or execution
         Type:
         - navigation / guided routing
       - `AR-05 Open Harvest Registration`
         Effect:
         - route the user to harvest flow for maturity follow-up or registration
         Type:
         - navigation / guided routing
       - `AR-06 Open Mechanical Work`
         Effect:
         - route the user to mechanical-work execution or logging
         Type:
         - navigation / guided routing
       - `AR-07 Suggest Task Creation`
         Effect:
         - propose that the operator create a task or continue from planner rather than pretending the chat already created it
         Type:
         - recommendation
       - `AR-08 Suggest Monitoring Check`
         Effect:
         - ask the operator to inspect, measure or confirm a condition before proceeding
         Type:
         - recommendation
       - `AR-09 Suggest Evidence Capture`
         Effect:
         - ask the operator to collect photo, observation or field evidence before deciding
         Type:
         - recommendation
       - `AR-10 Clarify Capability Boundary`
         Effect:
         - explain that a requested action is not directly executable from chat and route the user to the correct module instead
         Type:
         - boundary / explanation
       Guardrail:
       - no suggested action may imply that the chat has already executed a field operation, persisted a record, or commanded hardware unless a real guided routing hook exists for that action
       Closure result:
       - the allowed suggested-action vocabulary is defined
       - current implementation exposes safe routing hints only; write-capable actions remain excluded until a governed execution contract exists
     - `T1-B8 Guided Routing Hooks`
       Status: done
       Goal:
       - connect supported chat suggestions to existing module entrypoints in a controlled way
       Closure rule:
       - when chat suggests an action, the user can be routed into a real existing product flow without pretending the chat executed the work itself
       Current verified hook classes:
       - `HR-01 Plain navigation hooks`
         Verified targets:
         - `/app/planner`
         - `/app/health`
         - `/app/irrigation`
         - `/app/nutrition`
         - `/app/mechanical-work`
         - `/app/harvest`
         Availability:
         - real route-level navigation exists through sidebar/menu/link patterns
         Current use:
         - safe baseline for `open module` actions
       - `HR-02 Task-aware execution hooks`
         Verified source:
         - `services/taskExecutionLaunchService.ts`
         Verified routed targets:
         - nutrition execution URL builder
         - irrigation execution URL builder
         - harvest execution URL builder
         - mechanical-work execution URL builder
         Availability:
         - real guided routing exists when a valid task context is present
         Current use:
         - strongest existing foundation for `suggested next action -> open execution flow`
       - `HR-03 Planner queue creation hooks`
         Verified source:
         - `components/planner/AgronomicQueueTaskPanel.tsx`
         Availability:
         - queue intelligence can already create task drafts and persist decision snapshots
         Current use:
         - supports bounded routing toward planner-centered operational follow-up
       - `HR-04 Non-verified direct action hooks`
         Current status:
         - not yet verified for global chat
         Includes:
         - direct task creation from global chat
         - direct device/actuator commands
         - direct write actions into health/diary without entering the target module flow
         Rule:
         - remain suggestion-only until a dedicated hook is explicitly implemented and verified
       Immediate routing policy:
       - `open module` actions may route immediately
       - `execute task-aware flow` actions may route only when task context is present and compatible
       - all other actions stay advisory until promoted into a verified hook class
       Closure result:
       - safe route targets and task-aware execution hook classes are defined
       - global chat does not yet execute these hooks directly; it may suggest module routing and must stay advisory without compatible task context
   - `T1-C Planner AI Boundary`
     Status: done
     Scope:
     - decide whether planner chat remains lightweight assistive UX or is promoted into the real planner task/orchestration substrate
     - prevent confusion between chat suggestions and durable planner operations
     Sources:
     - `GAP-2026-04-23-AG`
     Output:
     - one declared planner-AI boundary, reflected in code and docs
     Current boundary reading:
     - `planner chat` exists as an assistive conversational UI
     - `planner task/queue intelligence` is the real execution-grade planner surface
     - planner value today is strongest where tasks, queue, execution launches and evidence contracts are durable
     - planner chat does not yet define or own the durable planner state machine
     Current product decision to formalize:
     - the planner should be described first as a task/orchestration product surface
     - planner chat should remain a secondary assistive layer until explicitly promoted
     Concrete TODOs:
     - `T1-C1 Planner Surface Contract`
       Status: done
       Goal:
       - define the canonical planner surface in product terms: task list, calendar, queue, execution launches, advice linkage
       Closure rule:
       - one bounded planner contract exists and is not confused with chat assistance
       Current proposed contract:
       - `Planner` is the primary operational surface for persisted agronomic work planning
       - its canonical core consists of:
         - task list
         - calendar view
         - agronomic queue/task drafts
         - task creation and persistence
         - execution launches into supported modules
         - evidence-aware follow-through in the covered execution flows
       - `Advice` may feed the planner, but does not replace it
       - `Planner chat` may explain or support the planner, but does not define the canonical planner state
       What the planner contract must guarantee:
       - a task can exist independently of chat
       - a task can be reviewed and acted on through planner-native surfaces
       - supported task types can route into real execution modules
       - the planner remains the strongest operational anchor for year-over-year work history
       What the planner contract does not yet guarantee:
       - complete closure of every smart/AI suggestion into one unified historical loop
       - native full-depth vertical planning for every orchard/vineyard/olive complexity
       - planner chat as an execution-grade orchestration engine
     - `T1-C2 Planner Chat Scope`
       Status: done
       Goal:
       - define what planner chat is actually allowed to do now
       Candidate allowed roles:
       - explain planner state
       - suggest next planning actions
       - clarify agronomic timing/rotation logic
       Candidate excluded roles for now:
       - silently creating durable planner objects without an explicit planner flow
       - replacing the real queue/task execution pipeline
       Closure rule:
       - planner chat has an explicit assistive scope with clear exclusions
       Current proposed scope:
       - planner chat is a conversational planner assistant connected to the real planner surface
       - it may:
         - explain planner state
         - interpret timing, rotation and agronomic planning logic
         - suggest one or more next tasks
         - prefill or prepare planner task drafts
         - route the user into planner-native task creation or task execution flows
       - it may not:
         - commit durable planner objects silently
         - bypass planner-native confirmation steps
         - replace the queue/task execution model
       Decision authority rule:
       - the user remains the final decision authority
       - AI may prepare and trigger execution only after explicit user confirmation
       Commitment rule:
       - the source of truth is the persisted planner task or downstream execution record, not the chat transcript itself
     - `T1-C3 Queue vs Chat Ownership`
       Status: done
       Goal:
       - declare which planner intelligence belongs to queue/orchestration services and which belongs to conversational UX
       Closure rule:
       - no planner capability is ambiguously “owned” by both chat and queue layers
       Current proposed ownership split:
       - `Queue / orchestration owns:`
         - agronomic prioritization
         - task draft generation
         - durable task semantics
         - task-to-execution routing
         - evidence-aware operational follow-through
         - decision ledger and measurable outcome linkage where present
       - `Planner chat owns:`
         - conversational explanation
         - interactive clarification with the user
         - proposal framing
         - user-facing translation of queue/planner logic into natural language
         - prefill assistance before planner confirmation
       - `Shared but with single source of truth:`
         - next-task recommendation:
           - source of truth belongs to queue/planner intelligence
           - chat may explain or present it
         - task creation:
           - source of truth belongs to planner persistence flow
           - chat may prepare the draft but not own commitment
       Explicit non-ownership for planner chat:
       - no independent planner state machine
       - no hidden task creation authority
       - no ownership of execution evidence or downstream records
     - `T1-C4 Promotion Gate`
       Status: done
       Goal:
       - define the conditions under which planner chat could later be promoted into a more execution-aware surface
       Candidate gate conditions:
       - durable planner context inputs
       - verified action registry
       - safe routing hooks
       - explicit write-path governance
       Closure rule:
       - planner chat cannot silently evolve into a pseudo-agent without meeting declared promotion conditions
       Current proposed promotion conditions:
       - `PG-01 Garden-system-aware context`
         Requirement:
         - planner chat must receive structured `garden` context, not only orto-specific context
         - the context must remain compatible with:
           - orto / annual crops
           - orchard
           - olive grove
           - vineyard
           - other supported cultivation systems
         - where relevant, the base garden context must be enriched by vertical/system context rather than inferred loosely from chat alone
       - `PG-02 Verified action registry`
         Requirement:
         - planner chat may only promote actions that exist in the explicit action registry
       - `PG-03 Verified routing hooks`
         Requirement:
         - any promoted action must connect to a real planner-native or module-native flow
       - `PG-04 Explicit user confirmation`
         Requirement:
         - AI may prepare or trigger, but durable commitment requires explicit user confirmation
       - `PG-05 Auditability`
         Requirement:
         - the system must be able to reconstruct what the AI proposed, what the user confirmed, and which durable object was created or launched
       - `PG-06 Source-of-truth protection`
         Requirement:
         - planner chat must not become a second hidden planner state machine
         - durable planner truth remains in planner persistence, queue/orchestration and downstream execution records
   - `T1-D Director Consolidation Decision`
     Status: done
     Scope:
     - decide whether director stays distributed across legacy/new services or converges toward one explicit orchestrator surface
     Sources:
     - `GAP-2026-04-23-N`
     - `GAP-2026-04-23-AE`
     Output:
     - one architectural decision for director ownership and product positioning
     Target product role:
     - `Director` is intended to be the central agronomic orchestrator of the system
     - it should relate heterogeneous signals coming from:
       - IoT
       - manual records
       - planner/task state
       - diary/environment
       - health
       - execution records
       - vertical/system context
     - it should be scope-aware across:
       - `garden`
       - `zone`
       - `row`
       - `plant id`
     - it should:
       - understand current context
       - remember historical context
       - anticipate next priorities
       - coordinate downstream layers and operational flows
     Current state:
     - this target is not yet fully closed
     - current logic is still distributed between `services/directorService.ts`, `logic/director.ts` and dependent planner/dashboard layers
     Current proposed direction:
     - do not reduce Director to a mere briefing widget in product language
     - describe it as the target central orchestrator, while explicitly acknowledging that the current implementation is still partial and distributed
     Concrete TODOs:
     - `T1-D1 Director Target Model`
       Status: done
       Goal:
       - define the formal target model of Director as a multi-level agronomic orchestrator
       Closure rule:
       - the master contains one explicit Director target model with scope hierarchy and responsibilities
       Current proposed target model:
       - `Scope hierarchy`
         - `garden`
         - `zone`
         - `row`
         - `plant id`
       - `Scope rules`
         - every signal, memory item, recommendation and action should resolve to one primary scope
         - higher scopes may aggregate lower scopes
         - lower scopes may inherit context from higher scopes, but not overwrite it silently
       - `Signal families`
         - `iot-signals`
           - sensor telemetry
           - device state
           - environmental readings
         - `manual-signals`
           - observations
           - operator notes
           - explicit field measurements
         - `planner-signals`
           - open tasks
           - scheduled work
           - overdue work
         - `execution-signals`
           - completed operations
           - evidence captured
           - measured outcomes
         - `environmental-signals`
           - weather
           - diary-derived agronomic indicators
           - local environmental history
         - `health-signals`
           - risk pressures
           - monitoring summaries
           - crop/plant stress signals
         - `vertical-context-signals`
           - orchard / olive / vineyard / annual-crop specific context
       - `Director memory layers`
         - `current-state memory`
           - what is active now at each scope
         - `historical memory`
           - what happened before at each scope
         - `decision memory`
           - what was suggested, accepted, rejected or executed
         - `outcome memory`
           - what results or feedback followed the action
       - `Core Director responsibilities`
         - normalize signals across scopes
         - maintain scope-aware operational memory
         - prioritize actions
         - explain why an action is being prioritized
         - pass structured context to downstream layers
       - `Primary downstream outputs`
         - `briefing outputs`
         - `planner queue outputs`
         - `chat context outputs`
         - `health support outputs`
         - `execution launch context outputs`
       - `Non-goals for now`
         - unconstrained autonomous action execution
         - hidden mutation of durable records without passing through governed product flows
     - `T1-D2 Director Current-State Map`
       Status: done
       Goal:
       - map which current Director responsibilities live in `directorService`, which in `logic/director`, and which in adjacent services
       Closure rule:
       - the distributed implementation is explicitly mapped before any consolidation decision
       Current implementation map:
       - `services/directorService.ts`
         Current role:
         - modern daily briefing and agronomic queue service
         Owns today:
         - `getDailyBriefing(userId, gardenId)`
         - `DailyBriefing`
         - `PrioritizedAction`
         - conversion of active collaborative AI suggestions into prioritized actions
         - transversal agronomic queue construction
         - refined agronomic context attachment
         - decision explanations and economic priority summaries
         - environmental summaries from garden/zone history where available
         - measured feedback intake for queue/outcome context
         Main consumers:
         - `components/director/DirectorBriefingWidget.tsx`
         - `components/planner/AgronomicQueueTaskPanel.tsx`
       - `logic/director.ts`
         Current role:
         - legacy broad daily-plan generator and rule engine
         Owns today:
         - `checkWeatherUrgency`
         - `getDailyGardenPlan`
         - `generateLifecycleTasks`
         - `generateUrgentAlerts`
         - `generateBaselinePrompts`
         - broad seasonal, weather, lifecycle, crop-system and legacy prompt logic
         Main consumers:
         - `components/Dashboard.tsx`
         - `components/professional/ProfessionalDashboard.tsx`
         - `components/shared/HomeDashboard.tsx`
         - `services/fieldRowPredictiveService.ts`
         - `services/continuousMonitoringService.ts`
       - Adjacent service contributors:
         - `services/agronomicActionQueueService.ts`
           Role:
           - builds transversal queue items from health, irrigation, prescription, phenology, director actions and feedback
         - `services/agronomicDecision*`
           Role:
           - explanation, decision ledger, analytics and outcome history around queue/task decisions
         - `services/environmentalMonitoringService.ts`
           Role:
           - weather/sensor/environmental summaries at garden/zone level
         - `services/plantHealthMonitoringService.ts`
           Role:
           - health alerts used by the modern queue
         - `services/prescriptionMapsService.ts`
           Role:
           - prescription intelligence summaries fed into queue prioritization
         - `services/advancedIrrigationService.ts`
           Role:
           - irrigation efficiency reports fed into queue prioritization
       Current scope coverage:
       - `garden`
         Status:
         - substantially covered by both modern and legacy director flows
       - `zone`
         Status:
         - partially covered through irrigation, prescription and environmental zone summaries
       - `row`
         Status:
         - partially covered in adjacent field-row predictive and task/execution layers, not yet a first-class Director scope
       - `plant id`
         Status:
         - not yet first-class in Director; plant-level services exist elsewhere but are not centrally orchestrated by Director
       Main architectural gap:
       - Director target is multi-level and memory-aware, but current implementation is split between modern briefing/queue service and broad legacy daily-plan logic
       - row and plant-level scope resolution are not yet first-class Director responsibilities
       Decision needed before consolidation:
       - choose whether `directorService.ts` becomes the canonical Director facade and progressively absorbs/contracts legacy responsibilities from `logic/director.ts`
       - or keep both paths but document a stable facade contract that hides the distribution from downstream product layers
     - `T1-D3 Director Downstream Contract`
       Status: done
       Goal:
       - define how Director hands context to planner, chat, health and execution modules
       Closure rule:
       - downstream layers receive named Director outputs rather than ambiguous implicit intelligence
       Verified downstream output contracts:
       - `DO-01 Briefing Output`
         Target consumer:
         - `components/director/DirectorBriefingWidget.tsx`
         Current code basis:
         - `DailyBriefing` from `services/directorService.ts`
         Minimum payload:
         - briefing summary
         - critical actions
         - transversal agronomic queue
         - weather summary
         - agronomic insights
         - environmental summary
         - recommendations
         - briefing stats
         Director rule:
         - this is the user-facing daily command summary, not the canonical durable task source
       - `DO-02 Planner Queue Output`
         Target consumer:
         - `components/planner/AgronomicQueueTaskPanel.tsx`
         Current code basis:
         - `AgronomicActionQueueItem` from `services/agronomicActionQueueService.ts`
         Minimum payload:
         - `id`
         - `source`
         - `title`
         - `description`
         - `scopeLabel`
         - `focus`
         - `priorityScore`
         - `priorityConfidence`
         - `agronomicProfileId`
         - `missingSignals`
         - `urgencyLabel`
         - metadata carrying decision explanation, refined context and supporting signals where available
         Director rule:
         - this is the operational bridge from intelligence to planner-visible work, but durable task creation still belongs to planner/task flows
       - `DO-03 Chat Context Output`
         Target consumers:
         - `Global AI Chat`
         - Planner chat
         Current code basis:
         - partially present through queue metadata, refined agronomic context and planned AI context hooks
         Minimum payload:
         - scope path: `garden -> zone -> row -> plant id` where known
         - current priorities
         - relevant signals
         - missing signals
         - suggested action registry item
         - routing hint
         - decision explanation
         Director rule:
         - chat receives bounded context packets, not arbitrary raw application state
         Gap:
         - this contract is not yet implemented as a stable Director output for all chat surfaces
       - `DO-04 Health Support Output`
         Target consumer:
         - health surface and health-aware AI context
         Current code basis:
         - `HealthScopeInsight` from `services/healthScopeService.ts`
         - health-sourced queue items from `services/agronomicActionQueueService.ts`
         Minimum payload:
         - `scopeType`
         - `scopeId`
         - `scopeName`
         - `zoneId`
         - `zoneName`
         - `plantCount`
         - `plantNames`
         - fungal pressure
         - water stress
         - heat stress
         - supporting signals
         - next checks
         Director rule:
         - health output must preserve scope precision and should not collapse row/plant symptoms into generic garden advice when lower-level context exists
       - `DO-05 Execution Launch Context Output`
         Target consumers:
         - nutrition execution
         - irrigation/watering execution
         - harvest execution
         - mechanical work execution
         Current code basis:
         - `taskExecutionLaunchService.ts`
         - `taskExecutionOrchestratorService.ts`
         Minimum payload:
         - `route`
         - `sourceTaskId`
         - `taskType`
         - `plantName`
         - `zoneId`
         - `rowId`
         - `rowNumber`
         - `date`
         Director rule:
         - Director may prepare/route execution context, but execution records must be created by the governed module flow
       - `DO-06 Decision Memory Output`
         Target consumers:
         - decision ledger
         - planner/task history
         - future Director memory layer
         Current code basis:
         - `AgronomicDecisionLedgerEntry` from `services/agronomicDecisionLedgerService.ts`
         Minimum payload:
         - queue item reference
         - source
         - focus
         - scope label
         - suggested task
         - user confirmation or task creation state
         - completion state
         - decision snapshot
         Director rule:
         - accepted, rejected, created and completed decisions must be recoverable as memory rather than remaining only in chat/briefing text
       - `DO-07 Outcome Feedback Output`
         Target consumers:
         - queue outcome layer
         - Director priority refinement
         - future contextual AI memory
         Current code basis:
         - `agronomicMeasuredFeedbackService.ts`
         - `agronomicOperatorEvidenceService.ts`
         - `agronomicQueueOutcomeService.ts`
         Minimum payload:
         - source task or queue item reference
         - operator evidence
         - measured feedback
         - confidence
         - outcome metrics
         - linked agronomic context where available
         Director rule:
         - outcomes close the loop and should feed future priority/context calculation, not remain isolated evidence attachments
       Contract guardrails:
       - every downstream output must carry a scope reference when available
       - `plant id` is a target scope, but it is often absent today and must not be implied when not present
       - downstream layers should consume named Director outputs rather than call random Director internals
       - downstream layers must not mutate durable records directly unless passing through governed planner, execution, ledger or module-specific flows
     - `T1-D4 Consolidation Strategy`
       Status: done
       Goal:
       - decide whether Director converges toward one orchestrator service or remains distributed behind a clear product contract
       Closure rule:
       - Director has an explicit architectural ownership strategy instead of legacy drift
       Recommended decision:
       - `services/directorService.ts` becomes the canonical Director facade
       - `logic/director.ts` remains a legacy intelligence source to be wrapped, migrated or decomposed progressively
       - downstream product layers should converge toward the canonical facade instead of importing legacy Director logic directly
       Why this direction:
       - `services/directorService.ts` already owns the modern user-facing briefing and transversal queue path
       - `components/director/DirectorBriefingWidget.tsx` and `components/planner/AgronomicQueueTaskPanel.tsx` already consume the modern facade
       - `logic/director.ts` still contains broad agronomic intelligence that should not be discarded: weather urgency, lifecycle prompts, baseline prompts, lunar/seasonal/soil/altitude/vertical crop engines and legacy daily plan generation
       - a hard replacement would risk losing mature but scattered intelligence implemented by previous development passes
       Current import split:
       - modern facade consumers:
         - `components/director/DirectorBriefingWidget.tsx`
         - `components/planner/AgronomicQueueTaskPanel.tsx`
         - precision-hub tests around Director operational context and environmental recommendations
       - legacy logic consumers:
         - `components/Dashboard.tsx`
         - `components/Planner.tsx`
         - `components/professional/ProfessionalDashboard.tsx`
         - `components/shared/HomeDashboard.tsx`
         - `services/fieldRowPredictiveService.ts`
         - `services/continuousMonitoringService.ts`
       Consolidation pattern:
       - `directorService.ts` exposes named stable outputs aligned with `T1-D3`
       - legacy functions from `logic/director.ts` are treated as internal contributors until replaced
       - dashboard/planner consumers migrate toward facade outputs where product behaviour overlaps
       - specialized legacy engines are not deleted until their output is either represented in facade contracts or explicitly archived
       Initial facade responsibilities to add or stabilize:
       - `getDailyBriefing`
         Status:
         - exists
       - `getPlannerQueueContext`
         Status:
         - todo
         Purpose:
         - expose planner queue and priority context without forcing planner consumers to parse the full briefing object
       - `getChatContext`
         Status:
         - todo
         Purpose:
         - provide bounded Director context packets for global/planner chat using the `DO-03` contract
       - `getHealthSupportContext`
         Status:
         - todo
         Purpose:
         - provide scope-aware health support context without collapsing row/plant-level insight into generic garden advice
       - `getExecutionLaunchContext`
         Status:
         - todo
         Purpose:
         - normalize task-aware execution routing context for supported operational modules
       - `getDecisionMemoryContext`
         Status:
         - todo
         Purpose:
         - expose decision ledger and outcome memory to future Director reasoning without making chat transcript the source of truth
       - `getLegacyDailyPlanBridge`
         Status:
         - todo
         Purpose:
         - wrap `getDailyGardenPlan` output while legacy dashboard flows still depend on it
       Migration guardrails:
       - no mass rewrite of dashboard/planner consumers before facade outputs are implemented
       - no deletion of `logic/director.ts` until its useful engines have an explicit destination or removal decision
       - no direct downstream mutation through Director; writes still pass through planner, execution, ledger or module-specific services
       - row and `plant id` scope must be introduced as explicit optional scope fields before being promised in UI/manual language
       Implementation TODOs opened by this decision:
       - `T1-D4.1 Facade Method Skeleton`
         Status: done
         Goal:
         - add or define stable facade methods for planner, chat, health, execution, decision memory and legacy bridge outputs
         First implementation:
         - `services/directorService.ts` now exposes typed facade contexts for:
           - planner queue context
           - bounded chat context
           - health support context
           - execution launch context
           - decision memory context
           - legacy daily-plan bridge
         Added facade methods:
         - `getPlannerQueueContext(userId, gardenId)`
         - `getChatContext(userId, gardenId)`
         - `getHealthSupportContext(userId, gardenId)`
         - `getExecutionLaunchContext(gardenId)`
         - `getDecisionMemoryContext(gardenId)`
         - `getLegacyDailyPlanBridge(...args)`
         Verification:
         - `npx tsc --noEmit` passes after adding the facade skeleton
         - `npm run test:precision-hub` passes with focused facade coverage
         Tests added:
         - `__tests__/precision-hub/directorFacadeContext.test.ts`
         Covered:
         - bounded chat context generation
         - execution launch context extraction
         - decision memory context extraction
         - legacy bridge method availability
         Follow-up:
         - consumer migration and optional API exposure belong to `T1-D4.2` / `T1-D4.5`, not to this skeleton task
       - `T1-D4.2 Legacy Import Reduction Plan`
         Status: done
         Goal:
         - list every direct import of `logic/director.ts` and decide whether it should migrate, remain as legacy, or become a specialized engine call
         Current direct imports:
         - `services/directorService.ts`
           Import:
           - `getDailyGardenPlan`
           Current use:
           - canonical facade bridge through `getLegacyDailyPlanBridge`
           Decision:
           - keep
           Rationale:
           - this is the intended legacy containment point
         - `components/Dashboard.tsx`
           Import:
           - `getDailyGardenPlan`
           Current use:
           - main legacy daily-plan UI: priority, urgent alerts, climate warnings, solar classification, lifecycle tasks, nutrient tasks, health tasks, irrigation tasks, lunar advice and refresh after watering execution
           Decision:
           - migrated through compatibility facade
           Risk:
           - high UI breadth; do not migrate until output parity is tested
           Implementation:
           - now calls `directorService.getLegacyDailyPlanBridge(...)`
           - no `DailyPlan` output shape change
           Verification:
           - `npx tsc --noEmit` passes
           - `npm run test:precision-hub` passes
         - `components/Planner.tsx`
           Import:
           - `getDailyGardenPlan`
           Current use:
           - loads daily plan mostly for urgent alert visibility and solar classification support
           Decision:
           - migrated through compatibility facade
           Rationale:
           - narrower usage than `Dashboard.tsx`
           Implementation:
           - now calls `directorService.getLegacyDailyPlanBridge(...)`
           - no `DailyPlan` output shape change
           Verification:
           - `npx tsc --noEmit` passes
         - `components/professional/ProfessionalDashboard.tsx`
           Import:
           - `getDailyGardenPlan`
           Current use:
           - professional command center rendering urgent alerts, lifecycle tasks, baseline prompts, irrigation tasks, priority, climate warnings, lunar advice and task counts
           Decision:
           - migrated through compatibility facade
           Risk:
           - broad dependency on full `DailyPlan` shape
           Implementation:
           - now calls `directorService.getLegacyDailyPlanBridge(...)`
           - no `DailyPlan` output shape change
           Verification:
           - `npx tsc --noEmit` passes
           - `npm run test:precision-hub` passes
         - `components/shared/HomeDashboard.tsx`
           Import:
           - `getDailyGardenPlan`
           Current use:
           - debounced daily-plan loading, baseline prompts and fallback empty plan
           Decision:
           - migrated through compatibility facade
           Rationale:
           - narrower visible dependency than the full dashboard
           Implementation:
           - now calls `directorService.getLegacyDailyPlanBridge(...)`
           - no `DailyPlan` output shape change
           Verification:
           - `npx tsc --noEmit` passes
         - `services/fieldRowPredictiveService.ts`
           Import:
           - `getDailyGardenPlan`
           Current use:
           - row-level insights from lifecycle tasks, baseline prompts, lunar advice and climate warnings
           Decision:
           - migrated to specialized row-aware Director facade method
           Target:
           - `getFieldRowDirectorInsights` or row-aware extension of `getHealthSupportContext` / `getChatContext`
           Risk:
           - this service is close to the target `garden -> zone -> row -> plant id` model and should not stay tied to garden-only legacy plan extraction
           Implementation:
           - `directorService.getFieldRowDirectorInsights(...)` now returns a scope-aware row context with lifecycle phase, seasonal advice, lunar timing and weather alerts
           - `services/fieldRowPredictiveService.ts` now consumes the facade method instead of importing `getDailyGardenPlan` directly
           - the facade output includes `gardenId`, `gardenName`, `zoneId`, `rowId` and cultivar/plant name where known
           Verification:
           - `npx tsc --noEmit` passes
           - `npm run test:precision-hub` passes
         - `services/continuousMonitoringService.ts`
           Import:
           - `generateUrgentAlerts`
           Current use:
           - converts weather/operation-blocking Director alerts into monitoring alerts
         Decision:
         - migrated to a small facade method
         Target:
         - `getUrgentWeatherAlerts` exposed through `directorService.ts`, backed initially by legacy `generateUrgentAlerts`
         Rationale:
         - narrowest and safest import to eliminate first
         Implementation:
         - `directorService.getUrgentWeatherAlerts(garden, currentDate?)` now wraps legacy `generateUrgentAlerts`
         - `services/continuousMonitoringService.ts` now imports `directorService` instead of `generateUrgentAlerts` from `logic/director.ts`
         Verification:
         - `npx tsc --noEmit` passes
         - `npm run test:precision-hub` passes
         Preferred migration order:
         - done: `services/continuousMonitoringService.ts`
         - done: `components/Planner.tsx`
         - done: `components/shared/HomeDashboard.tsx`
         - done: `services/fieldRowPredictiveService.ts` with row-aware contract design
         - done: `components/Dashboard.tsx`
         - done: `components/professional/ProfessionalDashboard.tsx`
       Closure result:
       - direct imports of `logic/director.ts` are now contained inside `services/directorService.ts`
       - all former downstream consumers route through the canonical Director facade
       Migration rule:
       - no consumer should be moved from `getDailyGardenPlan` to `getDailyBriefing` directly unless the required output shape is explicitly equivalent
       - broad `DailyPlan` consumers need a compatibility facade or dashboard-plan contract
       - specialized service consumers should move toward narrower facade methods instead of importing the whole legacy plan
       - `T1-D4.3 Scope Model Extension`
         Status: done
         Goal:
         - introduce a common Director scope descriptor supporting `garden`, `zone`, `row` and `plant id`
         Implementation:
         - `types/agronomicKernel.ts` now defines `AgronomicScopeDescriptor`
         - `DirectorScopeDescriptor` now aliases the canonical agronomic scope descriptor
         - `getChatContext` emits a `site` scoped context
         - `getFieldRowDirectorInsights` emits a `row` scoped context with `gardenId`, `gardenName`, `zoneId`, `rowId`, `fieldRowId`, `rowName` and plant/cultivar name where known
         Verification:
         - `npx tsc --noEmit` passes
         - `npm run test:precision-hub` passes with 108/108 tests
         Closure note:
         - `plantId` is included in the canonical descriptor but not yet populated broadly; this remains a future implementation concern, not a current product promise
       - `T1-D4.4 Legacy Engine Extraction Map`
         Status: done
         Goal:
         - classify useful logic inside `logic/director.ts` into weather, lifecycle, nutrient, health, vertical, lunar, soil/altitude and baseline prompt contributors
         Current source:
         - `logic/director.ts`
         Current size:
         - about 2500+ lines
         Current role:
         - broad legacy daily-plan aggregator, not a single coherent engine
         Extraction map:
         - `LEG-01 Weather urgency engine`
           Current code:
           - `checkWeatherUrgency`
           - `generateUrgentAlerts`
           Inputs:
           - garden coordinates
           - current weather forecast
           Output:
           - urgent alerts and climate warnings
           Decision:
           - keep as specialized weather contributor behind Director facade
           Current facade:
           - `directorService.getUrgentWeatherAlerts(...)`
         - `LEG-02 Legacy DailyPlan compatibility engine`
           Current code:
           - `getDailyGardenPlan`
           Inputs:
           - garden
           - tasks
           - date
           - annual plan
           - user profile
           - seedling batches
           - storage provider
           - seed inventory
           Output:
           - legacy `DailyPlan`
           Decision:
           - keep as compatibility bridge until dashboard-grade outputs are replaced by named facade contracts
           Current facade:
           - `directorService.getLegacyDailyPlanBridge(...)`
         - `LEG-03 Lifecycle and basic crop advice`
           Current code:
           - `checkLifecycleStatus`
           - inline lifecycle processing in `getDailyGardenPlan`
           - placeholder `generateLifecycleTasks`
           Decision:
           - extract later only if lifecycle tasks become a named Director output
           Risk:
           - standalone helper is currently placeholder while real behaviour is mostly inside `getDailyGardenPlan`
         - `LEG-04 Baseline seasonal prompt engine`
           Current code:
           - large inline baseline prompt logic inside `getDailyGardenPlan`
           - partial `generateBaselinePrompts`
           Covers:
           - cleaning/preparing soil
           - compost/fondo
           - indoor sowing
           - seed inventory
           - lunar windows
           - equipment checks
           Decision:
           - keep, then extract only after baseline prompts have their own product contract
           Risk:
           - partial helper does not yet cover full inline behaviour
         - `LEG-05 Soil, altitude and solar suitability engine`
           Current code:
           - `applySoilAndAltitudeAdjustments`
           - `getPlantTypeForAltitude`
           - `calculateGardenSolarClassification`
           - `validatePlantCompatibility`
           - soil temperature and altitude utilities
           Decision:
           - preserve as specialized suitability contributor
           Target:
           - future `Director suitability context` or planner planting-window contributor
         - `LEG-06 Nutrition and treatment recommendation contributor`
           Current code:
           - `calculateNutrientNeeds`
           - `suggestFertilizerProduct`
           - fertilizer inventory checks
           - `suggestPhytoProduct`
           - safety interval checks
           Decision:
           - preserve, but do not document as complete compliance closure
           Target:
           - future nutrition/treatments facade contract or `T3`/`T4` implementation work
         - `LEG-07 Health and prevention contributor`
           Current code:
           - `calculateHealthStrategy`
           - `calculateWindEffect`
           - `getPreventiveMeasures`
           - treatment weather checks
           Decision:
           - preserve as health-support contributor
           Target:
           - future linkage with `getHealthSupportContext`
         - `LEG-08 Specialized crop vertical contributors`
           Current code:
           - strawberry engine
           - fruit tree engine
           - aromatic engine
           - olive engine
           - vine engine
           - exotic fruit engine
           - raspberry engine
           Decision:
           - keep as vertical contributors; do not flatten into generic garden logic
           Target:
           - future `T6 Specialized Verticals Completion`
         - `LEG-09 Advanced growing system contributors`
           Current code:
           - hydroponic Director
           - aquaponic Director
           - aeroponic Director
           - greenhouse Director
           - filtering of non-applicable traditional tasks
           Decision:
           - keep as system-specific contributors
           Risk:
           - should not be mixed into open-field/orchard assumptions
         - `LEG-10 Mechanical and pruning contributors`
           Current code:
           - `calculateMechanicalWorkTasks`
           - `calculateTreePruningTasks`
           - tillage engine
           - soil state/tempera checks
           Decision:
           - preserve and later align with mechanical execution/ledger flows
           Target:
           - `T2 Operational Ledger Closure` and `T4 Precision Execution Chain`
         - `LEG-11 Irrigation and fertigation contributors`
           Current code:
           - `adjustIrrigationForRain`
           - `calculateFertigationPlan`
           - irrigation design suggestions
           - weather-adjusted irrigation task generation
           Decision:
           - preserve; future consolidation belongs with Smart Hub/Irrigation boundary
           Target:
           - `T5 IoT and Smart Hub Consolidation`
         - `LEG-12 Lunar/traditional timing contributor`
           Current code:
           - `generateLunarAdvice`
           - lunar windows for sowing/transplant timing
           Decision:
           - keep as advisory/traditional timing contributor, not as hard agronomic rule
         - `LEG-13 Learning, memory and synchronizer hooks`
           Current code:
           - learning engine suggestions
           - zone/tree memory
           - pending suggestions
           - task synchronizer hooks
           Decision:
           - preserve as legacy intelligence inputs, but do not treat as final durable Director memory model
           Target:
           - future memory/outcome layer after `T2`
         Extraction rule:
         - do not delete `logic/director.ts` while `getLegacyDailyPlanBridge` remains needed
         - extract contributors only when a named facade output or strategic block needs them
         - prioritize narrow contributors before broad `DailyPlan` replacement
         - avoid moving placeholder helpers as if they represented full behaviour when the real logic remains inline
         Recommended extraction order:
         - first: weather urgency contributor because it is already facade-contained
         - second: row/scope-aware field-row insights where scope contracts are now explicit
         - third: dashboard-plan compatibility output only when Dashboard and ProfessionalDashboard can be validated visually
         - fourth: vertical/system contributors under `T6`
         - fifth: Smart Hub/irrigation contributors under `T5`
         Closure result:
         - useful legacy intelligence is now classified and protected from accidental deletion
         - extraction is tied to named product/facade contracts instead of arbitrary file cleanup
       - `T1-D4.5 Consumer Migration Gate`
         Status: done
         Goal:
         - migrate consumers only after each target facade output is present and tested
         Closure verification:
         - no downstream app/component/service consumer imports `logic/director.ts` directly anymore
         - `logic/director.ts` imports are contained in `services/directorService.ts`
         - broad UI consumers use `directorService.getLegacyDailyPlanBridge(...)`
         - narrow service consumers use named facade methods:
           - `directorService.getUrgentWeatherAlerts(...)`
           - `directorService.getFieldRowDirectorInsights(...)`
         Gate policy:
         - future consumers must not import `logic/director.ts` directly
         - future migrations from legacy `DailyPlan` must use a named facade output or compatibility bridge
         - a facade output is migration-ready only when it has:
           - typed return contract
           - explicit scope semantics when scope is relevant
           - precision-hub or equivalent targeted test coverage
           - no hidden durable mutations outside governed planner/execution/ledger/module flows
         Enforcement query:
         - `rg -n "from ['\"](@/logic/director|\\.\\./logic/director|../logic/director)['\"]|getDailyGardenPlan\\(|generateUrgentAlerts\\(|checkWeatherUrgency\\(" components services app --glob '!*.backup'`
         Current allowed result:
         - only `services/directorService.ts` may match legacy Director imports/calls
       Closure result:
       - Director consolidation gate is now explicit and test-backed; future drift can be detected with a simple search
   - `T1-E AI Surface Closure Decision`
     Status: done
     Goal:
     - close T1 without overstating future assistant capabilities
     Closure decision:
     - T1 is closed as an AI-surface consolidation, contract and governance block
     - current product truth:
       - global chat is real and backend-backed, but assistive
       - planner chat remains assistive and does not own planner persistence
       - planner queue/task flows are the execution-grade planning surface
       - Director has a canonical facade and legacy imports are contained
       - AI prediction/advice surfaces remain distributed and documented by maturity rather than flattened into one universal AI engine
     Explicitly deferred beyond T1:
     - durable cross-session chat memory
     - autonomous write-capable global chat actions
     - human support escalation from chat
     - full source-grounded product reasoning across every module
     - broad module-owned context packets beyond the first route/module context
     Verification:
     - `npm run type-check -- --noEmit`
     - `npm run test:precision-hub`
     - legacy Director import guard returns only `services/directorService.ts`
     Closure result:
     - AI capabilities shown in the manual now correspond to explicit named surfaces with clear ownership and maturity
     - stronger assistant promises are tracked as future work or excluded from current product truth

2. `T2 Operational Ledger Closure`
   Status: done
   Goal:
   - close the operational chain `plan -> operation -> observation -> result` across the modules already carrying real field execution value
   Source chapters:
   - `docs/manual/10-activity-registry.md`
   - `docs/manual/35-automated-diary.md`
   - `docs/manual/03-traceability.md`
   - `docs/manual/21-individual-plants.md`
   Includes:
   - unified activity/operation ledger
   - diary closure and durable event semantics
   - durable evidence, observations and outcomes
   - stronger traceability of source/manual/AI/device origin
   First TODO candidates:
   - define the canonical entities for `plan`, `operation`, `observation` and `result`
   - map which current modules already write durable records and which do not
   - decide whether traceability stays bounded prototype support or becomes a broader operational chain
   Newly confirmed ledger gap:
   - `GAP-2026-04-24-A` decision history is partially durable but not yet a normalized decision/outcome ledger
   Evidence:
   - `services/agronomicDecisionLedgerService.ts` records agronomic queue decisions through `getUserPreference` / `setUserPreference`
   - `packages/storage-cloud/SupabaseStorageProvider.ts` persists those preferences inside `profiles.preferences` JSONB when cloud storage is active
   - local storage mode persists the same preference keys in browser `localStorage`
   - `services/agronomicQueueOutcomeService.ts` stores queue outcomes through the same preference mechanism
   - stronger normalized database histories already exist for adjacent domains:
     - `ai_suggestions`, `user_decisions`, `success_metrics`
     - `daily_diary_entries`, `diary_events`
     - `garden_tasks`, operation tables and `unified_operations`
     - `smart_device_automation_logs`
   Risk:
   - the product can show recent decision/outcome history, but the agronomic queue ledger is not yet robust enough for long-term audit, cross-device consistency, indexed analytics or predictive learning
   TODO:
   - promote agronomic decision ledger and queue outcomes from preference JSON into normalized DB tables
   - link `decision -> suggested task -> execution record -> observation/result -> measured outcome`
   - include scope fields `garden`, `zone`, `field_row`, `tree`, `plant_id` where available
   - preserve source and actor fields: `AI`, `user`, `device`, `automation`, `manual`
   - define retention/query strategy for predictive analytics and future AI memory
   Working breakdown:
   - `T2-A Canonical Ledger Data Model`
     Status: done
     Goal:
     - create the normalized DB substrate for durable decision and outcome history
     Current implementation:
     - migration `supabase/migrations/20260424120000_create_agronomic_decision_outcome_ledger.sql`
     - creates `agronomic_decision_ledger_entries`
     - creates `agronomic_queue_outcomes`
     - includes RLS, user/garden ownership checks, query indexes, JSONB snapshots/evidence and scope fields for `zone`, `field_row`, `tree`, `plant_id`
     Service wiring:
     - `packages/core/storage/interface.ts` now exposes optional normalized ledger provider methods
     - `packages/storage-cloud/SupabaseStorageProvider.ts` reads and upserts `agronomic_decision_ledger_entries`
     - `packages/storage-cloud/SupabaseStorageProvider.ts` reads and upserts `agronomic_queue_outcomes`
     - `services/agronomicDecisionLedgerService.ts` now prefers normalized DB rows and falls back to preference JSON
     - `services/agronomicQueueOutcomeService.ts` now prefers normalized DB rows and falls back to preference JSON
     Remaining limitation:
     - existing `profiles.preferences` records are not migrated yet; fallback keeps them readable until `T2-B`
     Verification:
     - `npx tsc --noEmit` passes
   - `T2-B Preference Ledger Migration`
     Status: done
     Goal:
     - migrate existing `agronomic_decision_ledger:*` and `agronomic_queue_outcomes:*` preference payloads into normalized rows without losing historical records
     Implementation:
     - `services/agronomicDecisionLedgerService.ts` lazily migrates legacy preference-backed decision entries into `agronomic_decision_ledger_entries` when normalized rows are absent
     - `services/agronomicQueueOutcomeService.ts` lazily migrates legacy preference-backed outcome entries into `agronomic_queue_outcomes` when normalized rows are absent
     - migration is fallback-safe: legacy preference data remains readable even if normalized upsert fails
     - no destructive cleanup of `profiles.preferences` is performed in this step
     Verification:
     - `npx tsc --noEmit` passes
   - `T2-C Execution Evidence Linkage`
     Status: done
     Goal:
     - connect ledger rows to real operation logs, measured feedback and outcome records with queryable foreign/source references
     Current implementation:
     - migration `supabase/migrations/20260424123000_extend_agronomic_queue_outcomes_evidence_columns.sql`
     - extends `agronomic_queue_outcomes` with queryable evidence columns derived from the existing evidence JSON
     - migration `supabase/migrations/20260424124500_backfill_agronomic_queue_outcome_evidence_columns.sql`
     - backfills queryable evidence columns from existing `execution_evidence`, `measurement_evidence` and `evidence_snapshot` JSON values
     - adds evidence status, execution verification flags, measurement flags, operator evidence flag, last evidence timestamp
     - adds source operation evidence fields:
       - `execution_evidence_kind`
       - `execution_evidence_log_id`
       - `execution_evidence_date`
       - `execution_evidence_confidence`
     - adds measured outcome evidence fields:
       - `measurement_evidence_kind`
       - `measurement_evidence_record_id`
       - `measurement_evidence_recorded_at`
     - adds agronomic outcome fields:
       - `agronomic_outcome_status`
       - `agronomic_outcome_matched_by`
       - `agronomic_outcome_recorded_at`
     - `packages/storage-cloud/SupabaseStorageProvider.ts` now writes these derived fields on each `agronomic_queue_outcomes` upsert
     Remaining TODO:
     - future hardening may decide whether source evidence ids should become strict foreign keys or remain polymorphic source references
     Closure result:
     - queue outcome evidence is no longer only opaque JSON; it is available as queryable columns for audit, analytics and future predictive learning
     Verification:
     - `npx tsc --noEmit` passes
   - `T2-D Operational Ledger Coverage Map`
     Status: done
     Goal:
     - map which operational modules already write durable records and how they relate to the common `plan -> operation -> observation -> result` chain
     Coverage snapshot:
     - `Planner / agronomic queue`
       Current durable records:
       - `garden_tasks`
       - `agronomic_decision_ledger_entries`
       - `agronomic_queue_outcomes`
       Chain role:
       - `plan`
       - `decision`
       - `completion/outcome bridge`
       Maturity:
       - `execution-grade after T2-A/B/C`
     - `Unified operations service`
       Current durable records:
       - creates `watering_logs`
       - creates `fertilizer_application_logs`
       - creates `treatments`
       - creates `mechanical_work_register`
       - creates `individual_plant_operations`
       Chain role:
       - `operation`
       - row/plant propagation
       Maturity:
       - `execution-grade bridge`
       Notes:
       - `services/unifiedOperationsService.ts` is the closest implementation to the canonical operational chain
       - it propagates selected row operations to plant operations and preserves source task references in notes/context
     - `Irrigation`
       Current durable records:
       - `watering_logs`
       - `irrigation_logs`
       - `smart_device_automation_logs`
       Chain role:
       - `operation`
       - `device decision/command/outcome`
       - `execution evidence`
       Maturity:
       - `execution-grade but split across manual/device histories`
     - `Nutrition / fertilization`
       Current durable records:
       - `fertilizer_application_logs`
       - advanced nutrition/treatment records where used
       Chain role:
       - `operation`
       - `execution evidence`
       Maturity:
       - `execution-grade for application logs; broader scientific/compliance claims stay under T3/T4`
     - `Treatments / protection`
       Current durable records:
       - `treatments`
       - plant treatment tracking/outcome objects in plant monitoring flows
       Chain role:
       - `operation`
       - partial `result`
       Maturity:
       - `execution-grade for treatment records; outcome linkage remains uneven`
     - `Mechanical work`
       Current durable records:
       - `mechanical_work_register`
       Chain role:
       - `operation`
       - `execution evidence`
       Maturity:
       - `execution-grade for work logging; no fleet/telematics closure`
     - `Harvest`
       Current durable records:
       - `harvest_logs`
       - `plant_harvests`
       - vertical harvest records such as orchard/vineyard harvest records
       Chain role:
       - `result`
       - `measurement evidence`
       Maturity:
       - `execution-grade but multi-surface`
     - `Individual plant operations`
       Current durable records:
       - `individual_plant_operations`
       - `plant_operations`
       - `operation_sync_log`
       Chain role:
       - `operation`
       - row-to-plant propagation
       Maturity:
       - `execution-grade in places; schema duplication/history split remains`
     - `Automated diary`
       Current durable records:
       - `daily_diary_entries`
       - `diary_events`
       Chain role:
       - `observation`
       - environmental context
       Maturity:
       - `durable observation layer`
     - `Prescription maps`
       Current durable records:
       - `prescription_maps`
       - `prescription_execution_records`
       - `prescription_map_export_records`
       Chain role:
       - `plan/recommendation`
       - `field execution`
       - `execution variance/outcome analysis`
       Maturity:
       - `execution-grade precision chain component`
     - `AI suggestions / feedback`
       Current durable records:
       - `ai_suggestions`
       - `user_decisions`
       - `success_metrics`
       - `ai_transparency_log`
       Chain role:
       - `decision support`
       - `user decision`
       - `expected vs actual result`
       Maturity:
       - `durable but separate from global chat`
     Current architectural conclusion:
     - the product already has many durable operational histories
     - the main gap is not raw persistence but canonical cross-module semantics and consistent source linkage
     - `unifiedOperationsService` plus `agronomic_decision_ledger_entries` / `agronomic_queue_outcomes` should become the canonical bridge rather than creating another competing operational table immediately
     Recommended next sub-block:
     - `T2-E Canonical Operation Projection`
       Status: done
       Goal:
       - define whether the product needs a DB view/service projection that reads all durable operation sources into one `decision -> operation -> outcome` shape
       Core product rule:
       - the projection must not only answer “what was done?”
       - it must also answer “what happened after doing it?” whenever outcome or measured feedback exists
       Candidate sources:
       - `unified_operations`
       - `watering_logs`
       - `fertilizer_application_logs`
       - `treatments`
       - `mechanical_work_register`
       - `harvest_logs`
       - `individual_plant_operations`
       - `smart_device_automation_logs`
       - `prescription_execution_records`
       Closure rule:
       - consumers can ask one canonical question: “what was decided, what was done, where, why, from which plan/actor/source, and what result was obtained?”
       Current implementation:
       - migration `supabase/migrations/20260424130000_create_agronomic_operation_outcome_projection.sql`
       - creates view `agronomic_operation_outcome_projection`
       - first projection joins:
         - `agronomic_queue_outcomes`
         - `agronomic_decision_ledger_entries`
         - `garden_tasks`
       - exposes decision source/focus/snapshot, planned task, completion, execution evidence, measurement evidence, agronomic outcome and result class
       Current scope:
       - covers the agronomic queue chain first because it already has the strongest `decision -> task -> evidence -> outcome` linkage
       Remaining TODO:
       - future extension can decide whether additional operation families should be folded directly into this projection or exposed through companion projections
       Closure result:
       - first canonical outcome-first projection is available in DB as `agronomic_operation_outcome_projection`
       - the projection is intentionally centered on the strongest current chain: agronomic queue decision -> planned task -> execution evidence -> measured outcome
       Verification:
       - migration applied successfully to production database
       - `npx tsc --noEmit` passes
     - `T2-F Real Operation History Projection`
       Status: done
       Goal:
       - extend the outcome-first projection beyond agronomic queue outcomes without introducing another competing ledger table
       Decision:
       - keep `agronomic_operation_outcome_projection` as a virtual projection over existing durable histories
       - do not create a new physical `operations_ledger` table at this stage
       - use existing operation tables as source of truth and expose their rows through the canonical projection shape
       Implementation started:
       - migration `supabase/migrations/20260424133000_extend_operation_outcome_projection_to_real_histories.sql`
       - adds queryable `task_id` linkage to:
         - `watering_logs`
         - `treatment_register`
         - `mechanical_work_register`
       - keeps existing `SOURCE_TASK::...` note markers as fallback linkage for historical records
       - recreates `agronomic_operation_outcome_projection` with:
         - existing agronomic queue outcome rows
         - real operation-history rows from `watering_logs`, `fertilizer_application_logs`, `treatment_register`, `mechanical_work_register` and `harvest_logs`
         - deduplication when an operation is already represented as queue execution or measurement evidence
       Service wiring started:
       - `packages/storage-cloud/SupabaseStorageProvider.ts` writes and reads `task_id` for watering logs
       - treatment and mechanical work creation now persist `task_id` when launched from a source task
       - `services/unifiedOperationsService.ts` passes source task ids into treatment and mechanical operation records
       Current scope:
       - folds high-value real histories into one queryable projection
       - preserves existing tables and RLS ownership semantics
       - treats harvest rows as measured-result evidence even when they do not originate from a queue decision
       Production verification:
       - migration applied successfully to production database on 2026-04-24
       - pre-apply rollback validation succeeded against the live schema
       - production columns `task_id` now exist on:
         - `watering_logs`
         - `fertilizer_application_logs`
         - `treatment_register`
         - `mechanical_work_register`
       - production view `agronomic_operation_outcome_projection` was recreated successfully
       Current data caveat:
       - production projection currently returns 0 rows because the covered operational source tables are empty:
         - `agronomic_queue_outcomes`: 0
         - `watering_logs`: 0
         - `fertilizer_application_logs`: 0
         - `treatment_register`: 0
         - `mechanical_work_register`: 0
         - `harvest_logs`: 0
       Remaining future TODO:
       - decide whether `individual_plant_operations`, `smart_device_automation_logs`, prescription execution records and quality results should enter this same projection or companion projections
       - older operation rows with `SOURCE_TASK` markers are backfilled into `task_id` by `T2-M`; keep the note parser only as defensive compatibility
       Closure rule:
       - the product can query queue decisions and non-queue real operation histories through one outcome-first projection without duplicating durable operational tables
     - `T2-G Specialized Operation Signal Projection`
       Status: done
       Goal:
       - decide how to expose specialized histories that are real but not identical to the primary task/outcome ledger shape
       Decision:
       - keep `agronomic_operation_outcome_projection` focused on the primary `decision/task -> operation -> outcome` chain
       - add a companion virtual projection for plant-level operations, device automation, measured quality and prescription export signals
       - do not create a new physical table and do not force semantically different histories into the primary projection prematurely
       Implementation:
       - migration `supabase/migrations/20260424140000_create_agronomic_operation_signal_projection.sql`
       - creates view `agronomic_operation_signal_projection`
       - includes:
         - `individual_plant_operations`
         - `smart_device_automation_logs`
         - `quality_results`
         - `prescription_map_exports`
       Production verification:
       - rollback validation succeeded against the production schema on 2026-04-24
       - migration applied successfully to production database on 2026-04-24
       - production view currently returns:
         - `individual_plant_operations`: 1 row
         - smart automation, quality and prescription export sources: 0 rows because their source tables are currently empty
       Important gap:
       - production does not currently have a table named `prescription_execution_records`
       - follow-up inspection showed that the real cloud storage contract persists `PrescriptionExecutionRecord` rows in `variable_rate_applications`
       - the gap is therefore naming/visibility rather than total absence of a durable execution substrate
       Remaining future TODO:
       - decide whether a true prescription execution record table should be promoted into T4 Precision Execution Chain
       - decide whether the manual should describe prescription exports as export/import/application signals rather than full execution records until that table exists
       Closure rule:
       - specialized histories are visible through a shared virtual projection without weakening the primary outcome-first ledger semantics
     - `T2-H Prescription Execution Projection`
       Status: done
       Goal:
       - close the naming/visibility gap around prescription execution records without creating a duplicate execution table
       Decision:
       - do not create `prescription_execution_records`
       - keep using the existing provider-backed table `variable_rate_applications` as the durable prescription execution record table
       - expose it through a named projection so downstream documentation and analytics can refer to a truthful execution surface
       Evidence:
       - `packages/storage-cloud/SupabaseStorageProvider.ts` reads and writes `PrescriptionExecutionRecord` through `variable_rate_applications`
       - production table `variable_rate_applications` exists and matches the service mapper contract
       Implementation:
       - migration `supabase/migrations/20260424143000_create_agronomic_precision_execution_projection.sql`
       - creates view `agronomic_precision_execution_projection`
       - joins:
         - `variable_rate_applications`
         - `prescription_maps`
         - `gardens`
         - optional `prescription_map_exports`
       - exposes planned rate, actual rate, planned/applied area, accuracy, costs, source operation, export linkage and derived variance classes
       Production verification:
       - rollback validation succeeded against the production schema on 2026-04-24
       - migration applied successfully to production database on 2026-04-24
       - projection currently returns 0 rows because `variable_rate_applications` is empty in production
       Manual/doc implication:
       - the truthful wording is not “no prescription execution ledger exists”
       - the truthful wording is “prescription execution records are persisted as variable-rate applications; production currently has no rows yet”
       Closure rule:
       - prescription execution has a named queryable projection without duplicating the existing provider-backed execution table
     - `T2-I Operational Ledger Read Contract`
       Status: done
       Goal:
       - make the DB projections consumable by application code through a typed storage contract instead of leaving them as SQL-only artifacts
       Decision:
       - expose the three projection families as optional storage-provider reads
       - keep writes governed by the existing source tables/services; projection reads are read-only
       Implementation:
       - `types/operationalLedger.ts` defines typed rows and shared filters for:
         - `AgronomicOperationOutcomeProjection`
         - `AgronomicOperationSignalProjection`
         - `AgronomicPrecisionExecutionProjection`
       - `packages/core/storage/interface.ts` exposes optional provider methods:
         - `getAgronomicOperationOutcomeProjection`
         - `getAgronomicOperationSignalProjection`
         - `getAgronomicPrecisionExecutionProjection`
       - `packages/storage-cloud/SupabaseStorageProvider.ts` reads from:
         - `agronomic_operation_outcome_projection`
         - `agronomic_operation_signal_projection`
         - `agronomic_precision_execution_projection`
       - supports bounded filters by garden, task/source/projection family, prescription map/status and date/limit where relevant
       Closure result:
       - the operational ledger projections are no longer only database artifacts; cloud storage consumers have a typed read path
       Remaining future TODO:
       - first UI consumer is completed by `T2-K` and `T2-N`
       - local/offline projection synthesis is intentionally not implemented by `T2-O`; DB-backed projections are the canonical ledger mode
       Closure rule:
       - application code can read the unified ledger projections without directly hand-writing Supabase view queries
     - `T2-J Operational Ledger Service Aggregation`
       Status: done
       Goal:
       - provide one application-level aggregation over the three projection families so UI/report consumers do not need to understand every DB view directly
       Decision:
       - keep the DB projections separate by semantics
       - add a service that normalizes them into a lightweight unified event stream and summary
       - do not introduce a write path; this remains a read-only composition layer
       Implementation:
       - `services/operationalLedgerService.ts`
       - exposes:
         - `getOperationalLedgerUnifiedEvents`
         - `getOperationalLedgerSummary`
       - normalizes:
         - outcome projection rows as `outcome`
         - specialized signal projection rows as `signal`
         - precision execution projection rows as `precision_execution`
       - summarizes:
         - total events
         - family counts
         - measured-result count
         - verified-execution count
         - category counts
         - result-class counts
         - latest event
       Verification:
       - `__tests__/precision-hub/operationalLedgerService.test.ts`
       Closure result:
       - the operational ledger has a stable service-level read model ready for a first UI/report consumer
       Remaining future TODO:
       - wire the first real app surface to the service-level read model without reintroducing demo-only events
       Closure rule:
       - app code can ask for a unified operational ledger summary without manually combining the three projection families
     - `T2-K Activity Registry Truthful Ledger Consumer`
       Status: done
       Goal:
       - make the existing activity registry compatible with the outcome-first operational ledger without overstating demo/sample activity as real history
       Decision:
       - choose Activity Registry as the first UI-level consumer boundary for the T2-J service
       - keep the registry task list based only on real task props
       - expose operational ledger data as an optional real summary loaded from the projection service when `gardenId` and a compatible storage provider are available
       - do not add a new durable table or synthetic “activity” source
       Implementation:
       - `components/garden/ActivityRegistry.tsx`
       - removed hard-coded simulated observation/harvest rows from the activity list
       - added optional `gardenId` + ledger-capable `storageProvider` props
       - added month-bounded `getOperationalLedgerSummary` loading for outcome, signal, and precision execution projection families
       - guarded empty CSV export and zero-activity completion percentage
       - `app/app/analytics/page.tsx` mounts the registry in the overview tab for the active garden and passes the live storage provider
       Verification:
       - `npm run type-check -- --noEmit`
       - `npm run test:precision-hub`
       Closure result:
       - the Activity Registry no longer presents demo events as real activity history and displays a real operational ledger summary on the active analytics page
       Remaining future TODO:
       - activity list expansion to normalized ledger events is completed by `T2-N`
       Closure rule:
       - no simulated activity appears in the truthful registry path; ledger totals come from T2 projections only
     - `T2-L DB-backed Source Services Closure`
       Status: done
       Goal:
       - ensure the source services feeding the operational ledger use the new durable DB tables when available instead of staying preference-first after DB migration work
       Decision:
       - prefer provider-backed DB reads/writes for decision ledger entries and agronomic queue outcomes
       - keep preference-backed storage as fallback for local/offline/legacy contexts
       - opportunistically migrate preference-backed records into DB-backed upsert methods when the provider exposes them and DB rows are not yet present
       - do not create another ledger abstraction; source services remain the write path and projections remain the read path
       Implementation:
       - `services/agronomicDecisionLedgerService.ts`
       - `services/agronomicQueueOutcomeService.ts`
       - DB-backed optional provider methods already exposed through the storage contract:
         - `getAgronomicDecisionLedgerEntries`
         - `upsertAgronomicDecisionLedgerEntry`
         - `getAgronomicQueueOutcomeRecords`
         - `upsertAgronomicQueueOutcomeRecord`
       Verification:
       - `__tests__/precision-hub/agronomicDecisionLedgerService.test.ts`
       - `__tests__/precision-hub/agronomicQueueOutcomeService.test.ts`
       - `npm run type-check -- --noEmit`
       - `npm run test:precision-hub`
       Closure result:
       - the decision ledger and agronomic queue outcome services now align with the durable DB-backed T2 substrate while preserving legacy fallback behavior
       Remaining future TODO:
       - remove preference fallback only if/when local/offline behavior has an explicit equivalent durable implementation
       Closure rule:
       - source-service reads and writes are DB-first where the provider supports the T2 ledger tables
     - `T2-M Legacy Source Task Backfill`
       Status: done
       Goal:
       - remove the main concrete T2-F caveat where older operation rows could remain linked to source tasks only through `SOURCE_TASK::...` note markers
       Decision:
       - keep `SOURCE_TASK` parsing in projections as a compatibility fallback
       - add an explicit DB backfill that writes valid marker task ids into the real `task_id` columns where available
       - validate every marker against `garden_tasks` and matching `garden_id` before updating
       Implementation:
       - migration `supabase/migrations/20260425100000_backfill_operation_task_ids_from_source_task_markers.sql`
       - covers:
         - `watering_logs`
         - `fertilizer_application_logs`
         - `treatment_register`
         - `mechanical_work_register`
         - `harvest_logs`
       Verification:
       - rollback validation against production schema succeeded on 2026-04-25
       - production migration applied on 2026-04-25
       - production updated 0 rows because the covered operation tables currently have no valid legacy `SOURCE_TASK` markers requiring backfill
       - `npm run type-check -- --noEmit`
       Closure result:
       - legacy operation rows can become queryable by `task_id` without creating duplicate ledger records
       Remaining future TODO:
       - if future source tables adopt different marker formats, add table-specific backfills rather than weakening the UUID validation
       Closure rule:
       - historical operation/task linkage is explicit when the legacy marker points to a real task in the same garden
     - `T2-N Activity Registry Ledger Event Stream`
       Status: done
       Goal:
       - make the first UI consumer display the normalized ledger stream itself, not only a task list plus ledger summary counters
       Decision:
       - when `getOperationalLedgerSummary` returns events, Activity Registry uses those normalized events as its primary activity timeline
       - when no ledger events are available, it falls back to real task props
       - do not synthesize demo rows and do not create a new activity table
       Implementation:
       - `components/garden/ActivityRegistry.tsx`
       - maps `OperationalLedgerUnifiedEvent` rows into visible activity records
       - shows source family/table, execution evidence and measured-result badges where available
       Verification:
       - `npm run type-check -- --noEmit`
       Closure result:
       - the registry can now act as a real event-stream consumer of T2 projections while preserving task-only behavior for empty/local contexts
       Remaining future TODO:
       - improve labels per operation family once production contains representative ledger rows for visual QA
       Closure rule:
       - the first consumer can render the normalized operational ledger event stream without duplicating durable records
     - `T2-O Database-first Ledger Runtime Decision`
       Status: done
       Goal:
       - close the open local/offline projection question without creating a second ledger truth
       Decision:
       - the operational ledger is database-backed and Supabase projections are the canonical runtime path
       - local/offline mode does not synthesize equivalent operational ledger projections
       - UI fallback may show already-available task data only as degraded mode when the ledger DB/view is unavailable or returns no events
       - this fallback must not be described as a complete local operational ledger
       Implementation:
       - `components/garden/ActivityRegistry.tsx`
       - displays an explicit degraded/fallback note when it is showing task rows instead of ledger events for a garden-scoped registry
       Verification:
       - `npm run type-check -- --noEmit`
       Closure result:
       - the product keeps one canonical operational ledger source and avoids divergent local projection semantics
       Remaining future TODO:
       - define separate resilience/offline-read requirements only if the product later commits to true offline operation
       Closure rule:
       - cloud/database-backed projections are the source of truth; fallback UI is availability handling, not a second ledger implementation
     - `T2-P Daily Weather Log Runtime Schema Drift`
       Status: done
       Goal:
       - close the production schema drift that made diary/weather reads fail against `daily_weather_log` even though the operational code expected the richer automated diary schema
       Runtime finding:
       - browser/Supabase requests ordered by `log_date` returned HTTP 400
       - production already had `log_date`, so the failure source was not ordering itself
       - the compact Supabase-created table was missing runtime columns used by weather, diary and environmental monitoring services, including `temp_min`, `temp_max`, `temp_avg`, `humidity_avg`, `weather_conditions`, `data_source` and `raw_data`
       Decision:
       - patch the existing `daily_weather_log` table additively
       - do not create a duplicate weather or diary table
       - backfill compatibility columns from existing `temperature_min`, `temperature_max`, `weather_code` and `notes` where possible
       - keep garden ownership/RLS semantics intact and add `user_id` only as an indexed compatibility/read column
       Implementation:
       - migration `supabase/migrations/20260425103000_patch_daily_weather_log_runtime_columns.sql`
       Verification:
       - rollback validation against production schema succeeded on 2026-04-25
       - production migration applied on 2026-04-25
       - `npm run type-check -- --noEmit`
       Closure result:
       - the automated diary/weather observation layer now matches the DB-first runtime contract without duplicating durable weather history
     - `T2-Q Manual Truth Alignment`
       Status: done
       Goal:
       - align the T2 source manual chapters with the implemented DB-first operational ledger instead of describing future/marketing capabilities as current product behavior
       Decision:
       - keep the manual derived from code, production migrations and this master plan
       - describe unimplemented capabilities as limits or TODOs, not as active features
       - preserve the DB-first runtime rule from `T2-O`
       Implementation:
       - updated `docs/manual/10-activity-registry.md`
       - updated `docs/manual/35-automated-diary.md`
       - updated `docs/manual/03-traceability.md`
       - updated `docs/manual/21-individual-plants.md`
       Closure result:
       - T2 source chapters now describe the real ledger projections, service consumer, diary/weather schema, signal projection and known limits without promising blockchain, QR, full offline ledger or complete per-plant analytics
   Closure rule:
   - the product has an explicit cross-module record model and the manual can describe one truthful operational ledger rather than fragmented histories

3. `T3 Compliance and Certifications Closure`
   Status: in_progress
   Goal:
   - decide which compliance and certification workflows are meant to become truly durable operational product features
   Source chapters:
   - `docs/manual/04-certifications.md`
   - `docs/manual/04b-bio-certification-guide.md`
   - `docs/manual/16-nutrition-treatments.md`
   Includes:
   - BIO persistence and retrieval
   - GlobalG.A.P. action realism
   - treatment/compliance/quaderno-campagna boundaries
   - certification-readiness versus full certification operations
   First TODO candidates:
   - define per-certification maturity and intended target state
   - separate simulated compliance actions from durable ones
   Progress:
   - `T3-A Certification maturity map` — Status: done
     Decision:
     - `BIO`: durable readiness-assessment loop backed by `bio_certifications` and `bio_certifications_with_readiness`, not full certification authority workflow
     - `GlobalG.A.P.`: durable compliance workspace for the service-backed schema; UI actions remain either persisted records or explicitly labelled template support
     - `SQNPI` and `GRASP`: informational tabs/backlog, not operational certification workflows
     Evidence:
     - production schema contains `bio_certifications`, `bio_certification_documents`, `bio_certification_inspections`, `bio_certifications_with_readiness`, `globalgap_risk_management_plans`, `globalgap_self_assessments`, `globalgap_health_safety_managers`, `globalgap_recall_procedures`, `globalgap_ggn_codes`, `certifications`, `organic_certifications`, `certification_documents`, `supplier_certifications`, `compliance_records`
     - `20260425150000_consolidate_globalgap_operational_schema.sql` added the missing GlobalG.A.P. operational tables and generation functions referenced by the services
   - `T3-B BIO persistence and retrieval` — Status: done
     Implementation:
     - added `services/bioCertificationService.ts`
     - `components/certifications/CertificationsDashboard.tsx` now loads the latest BIO record from Supabase and saves the form to `bio_certifications`
     - `components/certifications/BioCertificationForm.tsx` now accepts initial DB state and exposes save status/error state instead of only logging and alerting
     Decision:
     - BIO is now consolidated as persisted readiness support. It remains explicitly not an official certification closure or audit substitute.
   Remaining:
   - `T3-C GlobalG.A.P. action realism` — Status: done
     Implementation:
     - `components/compliance/GlobalGapDashboard.tsx` now labels missing-requirement document creation as template support and avoids saying dashboard readiness is official certification
     - `supabase/migrations/20260425150000_consolidate_globalgap_operational_schema.sql` aligns production schema with the richer service paths for recall tests, transaction documents, CB/FV records and lot/GGN generation helpers
     Production:
     - migration applied to production on 2026-04-25
     - post-apply verification confirmed 16 additional `globalgap_*` tables, checklist compatibility columns and functions `generate_ggn_code` / `generate_lot_code`
   - `T3-D treatment/compliance/quaderno-campagna boundary` — Status: done
     Decision:
     - `treatment_register` is the durable professional phytosanitary register exposed through `/api/treatments` and export routes. It supports operative entries with crop, date, product, active ingredient, dose, treated area, method, reason, weather, operator, notes and location references.
     - `nutrition_treatments`, `fertilizer_products`, `treatment_products`, `nutrition_schedules`, inventory and stock movement tables are the durable planning/execution core for the `Nutrizione & Trattamenti` workspace.
     - `compliance_records` and the organic-compliance helper are internal support/readiness structures. They are not a complete regulatory validation engine and do not close LMR, official residue, DPI/training or certification obligations.
     - legacy phyto components using `services/treatmentRegistryService.ts` remain localStorage/browser support and must not be documented as the authoritative quaderno di campagna.
     - exports are operational support artifacts, not guaranteed official formats.
     Evidence:
     - `supabase/migrations/20260105040000_add_pro_mode_nutrition_tables.sql` creates the DB-backed professional treatment and fertilizer logs
     - `supabase/migrations/20260112000000_add_treatment_type_bio_traditional.sql` adds BIO/conventional/integrated compatibility fields and a trigger against active organic certifications
     - `supabase/migrations/20260117020000_create_advanced_nutrition_system.sql` creates the durable nutrition/treatment planning, product, inventory, history and compliance-support tables
     - `/api/treatments` persists to `treatment_register`; `advancedNutritionService` persists planner/workspace records to `nutrition_treatments`
     Closure result:
     - the quaderno-campagna claim is bounded to persisted operational records and support exports; complete legal/compliance automation remains future work
   - `T3-E manual truth alignment for BIO/compliance/nutrition claims` — Status: done
     Implementation:
     - rewrote `docs/manual/16-nutrition-treatments.md` around the verified persistent treatment/nutrition registers and their explicit limits
     - synchronized `public/docs/manual/16-nutrition-treatments.md`
     - synchronized public certification manual copies with the already-correct source chapters:
       - `public/docs/manual/04-certifications.md`
       - `public/docs/manual/04b-bio-certification-guide.md`
     Decision:
     - manuals describe BIO as persisted readiness support, GlobalG.A.P. as a durable compliance workspace, treatment records as operational registers, and nutrition analytics as management indicators
     - complete certification automation, official quaderno-campagna closure, LMR/residue validation, DPI/training validation and VRT end-to-end remain backlog/future work
     Closure result:
     - T3 source/public manual claims are aligned with the implemented maturity map and do not market unimplemented regulatory closure as current behavior
   Closure rule:
   - each certification/compliance workflow has an explicit target state and the manual no longer overstates regulatory closure

4. `T4 Precision Execution Chain`
   Status: done
   Goal:
   - decide which precision-agriculture flows should become fully connected from analysis to field execution and measured outcome
   Source chapters:
   - `docs/manual/05-ndvi-satellite.md`
   - `docs/manual/06-prescription-maps.md`
   - `docs/manual/16-nutrition-treatments.md`
   - `docs/manual/17-mechanical-operations.md`
   Includes:
   - NDVI source quality and role
   - prescription maps field closure
   - nutrition VRT ambitions
   - machinery/execution linkage
   First TODO candidates:
   - define the intended end-to-end chain for `remote sensing -> recommendation/map -> field execution -> outcome`
   - decide what remains assistive analysis versus what becomes execution-grade
   - isolate unsupported VRT/machinery promises from the real precision baseline
   Progress:
   - `T4-A precision execution maturity map` — Status: done
     Decision:
     - `NDVI`: real route/dashboard/provider-status surface. Current role is scouting, prioritization and decision support; provider-backed versus fallback/simulated source quality must stay visible.
     - `Prescription maps`: real persisted module with map/export/application-support structures and tests, but field validation is still partial. Current role is draft/planning/export support and selected execution projections, not an unsupervised universal VRT chain.
     - `Nutrition VRT`: backlog/future chain. Nutrition/treatment records are DB-backed, but VRT prescription-to-machine-to-outcome closure is not implemented.
     - `Mechanical operations`: DB-backed operational register via `mechanical_work_register` and `/api/mechanical-work`; not GPS fleet tracking, telematics, auto-steer or machine-origin execution proof.
     Target chain:
     - current truthful chain: `signal or recommendation -> task/planner/manual validation -> operation record/export/application support -> historical review`
     - future execution-grade chain: `provider-quality signal -> prescription map -> validated machine/import/export -> applied execution record -> measured field outcome`
   - `T4-B mechanical operations truth alignment` — Status: done
     Implementation:
     - rewrote `docs/manual/17-mechanical-operations.md`
     - synchronized `public/docs/manual/17-mechanical-operations.md`
     Decision:
     - mechanical operations are documented as a persisted operational register with task-aware linkage, not as a telematics/fleet-management platform
     - machinery integrations, GPS coverage, overlap/gap analysis, predictive maintenance and console/provider integrations remain backlog
     Closure result:
     - `GAP-2026-04-23-AK` is closed for manual truth alignment
   - `T4-C prescription maps execution-boundary alignment` — Status: done
     Implementation:
     - rewrote `docs/manual/06-prescription-maps.md`
     - synchronized `public/docs/manual/06-prescription-maps.md`
     Decision:
     - prescription maps are documented as a real persisted module with maps, zones, exports, revisions and `variable_rate_applications` execution records
     - export/import/application statuses are support signals, not proof of universal machine execution
     - outcome and efficacy summaries are valid only when post-application records, quality results or measured feedback exist
     Closure result:
     - `GAP-2026-04-23-AB` is closed for documentation truth alignment while deeper field validation remains tracked as future implementation work
   - `T4-D NDVI source-quality boundary` — Status: done
     Evidence:
     - `docs/manual/05-ndvi-satellite.md` and `public/docs/manual/05-ndvi-satellite.md` already describe NDVI as scouting/prioritization support with explicit provider/fallback limits
     - `components/ndvi/SentinelHubStatus.tsx` exposes Sentinel Hub connected versus missing-credentials status
     - `services/ndviSatelliteService.ts` and `/api/ndvi/sentinel` include simulated/fallback paths when provider data is unavailable
     Decision:
     - no code/doc rewrite was needed in this step; NDVI remains a real assistive signal, not a certified quantitative source for automatic prescriptions
     Closure result:
     - `GAP-2026-04-23-AA` is closed for current manual/UI source-quality disclosure
   - `T4-E precision chain closure` — Status: done
     Decision:
     - T4 closes as a truth-alignment and target-state block, not as a claim that all future machine/provider integrations are implemented
     - current execution-grade persistence is spread across operational records (`mechanical_work_register`, nutrition/treatment logs), prescription maps/zones/exports and `variable_rate_applications`
     - future work remains explicit for validated machine import/export, automated telemetry, universal VRT execution, systematic outcome capture and stronger cross-module transaction linkage
     Closure result:
     - the precision chain is now documented as a real but mixed-maturity operational path with clear assistive versus execution-grade boundaries
   Closure rule:
   - the precision chain is documented and implemented according to a real execution path, not a mixture of analysis previews and aspirational automation

5. `T5 IoT and Smart Hub Consolidation`
   Status: done
   Goal:
   - consolidate sensor ingestion, device registry, actuator control and automation into an explicit Smart Hub target state
   Source chapters:
   - `docs/manual/14-smart-hub.md`
   - `docs/manual/15-irrigation-system.md`
   Includes:
   - sensor persistence
   - device registry maturity
   - actuator/command boundary
   - automation rules versus telemetry-only support
   First TODO candidates:
   - define the intended Smart Hub perimeter for production use
   - distinguish ingestion-ready capabilities from control/automation capabilities
   - decide whether irrigation automation becomes a first-class product target
   Progress:
   - `T5-A Smart Hub maturity map` — Status: done
     Decision:
     - `sensor readings`: DB-backed and production-usable as telemetry ingestion, with validation for sensor type, value ranges, data quality, calibration, battery and signal
     - `smart_devices`: durable registry foundation for Sensor/Valve/Hub with provider, scope, telemetry state and command status fields; not yet complete provisioning for all real hardware
     - `commands`: limited actuator command path for valve state; local no-Supabase mode is simulated, ThingsBoard sends attributes, Tuya direct dispatch is not implemented in the route
     - `automation logs`: durable audit/analytics substrate for decisions, commands, telemetry and outcomes; not yet a stable unsupervised automation engine
     - `irrigation`: mature operational register/calculation module with systems, zones, components and watering logs; automation hardware remains controlled/partial
   - `T5-B Smart Hub manual truth alignment` — Status: done
     Implementation:
     - rewrote `docs/manual/14-smart-hub.md`
     - synchronized `public/docs/manual/14-smart-hub.md`
     Decision:
     - Smart Hub is documented as telemetry persistence plus limited device/command/automation-log support, not universal IoT control
   - `T5-C irrigation automation boundary` — Status: done
     Implementation:
     - rewrote `docs/manual/15-irrigation-system.md`
     - synchronized `public/docs/manual/15-irrigation-system.md`
     Decision:
     - irrigation is documented as operational for configuration, flow calculation and watering logs; valve/device automation is explicit support work with no physical actuation guarantee without provider confirmation
   Closure result:
   - `GAP-2026-04-23-AH` is closed for current manual/master-plan alignment
   Closure rule:
   - Smart Hub and irrigation docs can state one explicit truth about telemetry, control and automation maturity

6. `T6 Specialized Verticals Completion`
   Status: done
   Goal:
   - decide which vertical domains should be deepened into durable, coherent product slices versus remain hybrid/specialized overlays
   Source chapters:
   - `docs/manual/18-orchard-management.md`
   - `docs/manual/19-olive-management.md`
   - `docs/manual/20-vineyard-management.md`
   - `docs/manual/21-individual-plants.md`
   - `docs/manual/22-business-intelligence.md`
   - `docs/manual/11-agronomist-consultations.md`
   Includes:
   - orchard/olive/vineyard maturity mapping
   - per-plant persistence and monitoring consistency
   - agronomist backend depth
   - BI/reporting truthfulness for verticals
   First TODO candidates:
   - define which verticals are strategic product pillars versus opportunistic extensions
   - identify the minimum durable backend/persistence expectations for each one
   - separate local assistive tools from team-shared operational records
   Progress:
   - `T6-A vertical maturity map` — Status: done
     Decision:
     - `Frutteto`: durable product vertical. DB-backed configurations, trees, pruning/harvest surfaces and operational analytics are real; robotics, computer vision, post-harvest commerce and complete precision-orchard automation remain backlog.
     - `Oliveto`: hybrid orchard-backed vertical. It reuses frutteto foundations and has olive-specific schema for maturity/fly monitoring, but current specialist widgets are not uniformly wired to durable olive tables.
     - `Vigneto`: durable product vertical for configurations, vines and bud-load/Ravaz support; winery, ERP, market intelligence, denomination and bottle traceability are outside current scope.
     - `Piante individuali`: specialized signal/history layer already aligned under T2, not a full QR/genealogy/breeding platform.
     - `Agronomo`: partially persisted consultation/advice domain through storage provider tables; not marketplace, booking, payment or prescription-automation platform.
     - `Business Intelligence`: hybrid analytics/reporting surface built on real operational modules, not enterprise BI/data warehouse.
   - `T6-B orchard/olive/vineyard manual truth alignment` — Status: done
     Implementation:
     - rewrote `docs/manual/18-orchard-management.md`
     - rewrote `docs/manual/19-olive-management.md`
     - rewrote `docs/manual/20-vineyard-management.md`
     - synchronized public copies for chapters 18, 19 and 20
   - `T6-C agronomist/individual-plants/BI alignment` — Status: done
     Implementation:
     - rewrote `docs/manual/11-agronomist-consultations.md` around the storage-provider-backed but non-marketplace reality
     - synchronized public copies for chapters 11, 21 and 22
     Decision:
     - manual copies now describe verticals according to actual backend maturity, and strategic/commercial claims are left for T7 if they remain in roadmap-style chapters
   Closure result:
   - `GAP-2026-04-23-T`, `GAP-2026-04-23-U`, `GAP-2026-04-23-V` and `GAP-2026-04-23-W` are closed for manual/master-plan alignment
   Closure rule:
   - each vertical has a declared target maturity and the manual reflects only the chosen supported depth

7. `T7 Strategic Promise Triage`
   Status: done
   Goal:
   - classify strategic promises into `implement`, `defer` or `reject`, then align the manual without losing valid product ambition
   Source chapters:
   - `docs/manual/25-research-development.md`
   - `docs/manual/28-economic-benefits.md`
   - `docs/manual/30-use-cases.md`
   - `docs/manual/31-success-stories.md`
   - `docs/manual/32-roadmap.md`
   Includes:
   - R&D manifesto material
   - ROI/commercial claims
   - scenario material
   - roadmap promises
   - testimonial/success-story content
   Implementation candidates promoted from legacy promises:
   - `T7-IMPLEMENT-01 R&D trial and experiment registry` — Architecture path: `convert-platform` / `evidence-ledger`; build a durable project/trial layer for hypotheses, protocols, measurements, outcomes and links to sensor, diary, treatment and harvest evidence
   - `T7-IMPLEMENT-02 economic analytics and ROI evidence module` — Architecture path: `consolidate-first` / `schema-consolidation`; add baseline/cost/revenue/benefit tracking with confidence labels instead of guaranteed ROI claims
   - `T7-IMPLEMENT-03 use-case templates and deployment playbooks` — Architecture path: `extend-current` first, then `workflow-orchestration`; turn illustrative scenarios into guided setup/checklist workflows tied to verified modules
   - `T7-IMPLEMENT-04 roadmap governance and maturity publishing` — Architecture path: `extend-current`; expose feature maturity from this master plan as a controlled product/planning view
   - `T7-IMPLEMENT-05 customer evidence workflow` — Architecture path: `consolidate-first` / `evidence-ledger`; support consented customer stories only when source evidence, metrics, dates and approval state are stored
   Deferred strategic candidates:
   - `T7-DEFER-01 partner and integration program` — Architecture path: `convert-platform` / `integration-boundary`; formal university, provider, ERP, machinery and marketplace partnerships require commercial/legal confirmation and dedicated integration work
   - `T7-DEFER-02 advanced robotics/autonomous operations` — Architecture path: `convert-platform`; dependent on hardware integration, safety controls, durable telemetry and field validation
   - `T7-DEFER-03 ESG/carbon platform expansion` — Architecture path: `consolidate-first`; dependent on closed environmental evidence models, external standards and auditable reporting workflows
   - `T7-DEFER-04 enterprise BI and data warehouse layer` — Architecture path: `convert-platform` / `runtime-scaling`; dependent on API/integration consolidation and customer-scale reporting requirements
   Rejected claims:
   - `T7-REJECT-01 fabricated or unverifiable success stories, named testimonials, awards and media proof`
   - `T7-REJECT-02 guaranteed ROI, fixed payback windows and unsupported percentage outcome tables`
   - `T7-REJECT-03 unverifiable partnerships, publications, patents, labs and commercialization achievements`
   - `T7-REJECT-04 AGI, quantum, metaverse, space agriculture, planetary transformation and similar speculative claims as operational roadmap`
   Completed alignment:
   - rewrote `docs/manual/25-research-development.md`
   - rewrote `docs/manual/28-economic-benefits.md`
   - rewrote `docs/manual/30-use-cases.md`
   - rewrote `docs/manual/31-success-stories.md`
   - rewrote `docs/manual/32-roadmap.md`
   - synchronized public copies for chapters 25, 28, 30, 31 and 32
   Closure result:
   - `GAP-2026-04-23-E`, `GAP-2026-04-23-F`, `GAP-2026-04-23-H`, `GAP-2026-04-23-I`, `GAP-2026-04-23-P`, `GAP-2026-04-23-Q`, `GAP-2026-04-23-R` and `GAP-2026-04-23-AL` are closed for the strategic-promise chapters
   Closure rule:
   - the manual contains no strategic or commercial promise layer that is not explicitly backed by either current code or an approved master-plan TODO

8. `T8 Integration/API Boundary Consolidation`
   Status: done
   Goal:
   - separate current internal/API-adjacent capabilities from unsupported external ecosystem promises, and identify the architecture boundary needed before public integrations can be promised
   Source chapters:
   - `docs/manual/26-integration-api.md`
   Current verified surface:
   - internal Next.js API routes exist for product modules such as AI, NDVI, IoT telemetry, sensors, export, treatments, mechanical work, drones, blockchain-style traceability and cron jobs
   - `api_configurations` / `/api/api-configurations` support user/provider configuration for AI and weather providers, but the schema/service boundary is inconsistent with older migration fields and uses weak base64-style storage in some paths
   - `api_keys` supports user API keys for AI, Sentinel Hub, WeatherAPI and custom endpoints
   - export/import exists for selected garden backup and prescription-map/GIS formats
   - IoT telemetry and command routes exist, but device provisioning, provider dispatch and physical actuation remain bounded under T5
   - machinery compatibility/export support exists for prescription maps, but not as a live machinery/cloud integration
   Unsupported current claims:
   - public `/api/v1` product API, public developer portal, official SDKs and sandbox
   - real-time outbound webhooks/event bus/message queues
   - native ERP, CRM, marketplace, banking, insurance, Zapier, Power Automate or cloud-platform connectors
   - official ISOBUS/ADAPT/AgGateway integration layer beyond export-format support
   - multi-tenant cooperative integration platform, API gateway, message bus or data warehouse as current product
   Implementation candidates promoted from legacy promises:
   - `T8-IMPLEMENT-01 API credentials security consolidation` — Architecture path: `consolidate-first` / `schema-consolidation`; unify `api_configurations` and `api_keys` or clearly separate their roles, replace weak reversible/base64 handling with server-side secret management, and prevent decrypted secrets from being returned to client code
   - `T8-IMPLEMENT-02 public API contract and gateway` — Architecture path: `convert-platform` / `integration-boundary`; design authenticated, versioned external API endpoints only after internal module contracts are stable
   - `T8-IMPLEMENT-03 outbound webhook/event delivery system` — Architecture path: `convert-platform` / `workflow-orchestration`; add event definitions, subscriptions, signing, retry, delivery logs and rate limits
   - `T8-IMPLEMENT-04 integration connector registry` — Architecture path: `convert-platform` / `integration-boundary`; model provider connectors, credentials, sync state, scopes, error handling and per-provider maturity
   - `T8-IMPLEMENT-05 developer documentation and SDK generation` — Architecture path: `defer until T8-IMPLEMENT-02`; generate docs/SDKs only from a real public API contract
   Deferred strategic candidates:
   - `T8-DEFER-01 ERP/CRM/marketplace connectors` — dependent on public API/gateway, connector registry, customer demand and partner contracts
   - `T8-DEFER-02 banking/insurance/financing integrations` — dependent on legal/compliance review, provider agreements and secure credential/payment boundaries
   - `T8-DEFER-03 standards-grade machinery/cloud integrations` — dependent on stable prescription export, hardware/provider validation and field safety controls
   Rejected claims:
   - `T8-REJECT-01 presenting named third-party integrations as certified/native without implemented connector and partner validation`
   - `T8-REJECT-02 presenting SDK examples, developer portal, sandbox or webhook delivery as current product without shipped contracts`
   Completed alignment:
   - rewrote `docs/manual/26-integration-api.md`
   - synchronized `public/docs/manual/26-integration-api.md`
   Closure result:
   - `GAP-2026-04-23-G` and `GAP-2026-04-23-O` are closed for manual/master-plan alignment
   Closure rule:
   - integration documentation distinguishes internal routes, provider credential configuration, export/import support and prototype connectors from any future public integration platform

9. `T9 Drone Scaffold Boundary Consolidation`
   Status: done
   Goal:
   - preserve the drone product direction while making the current boundary explicit: internal planning scaffold and simulated execution, not hardware-integrated drone operations
   Source chapters:
   - `docs/manual/02-drone-operations.md`
   Current verified surface:
   - `/api/drone/flight-plans`, `/api/drone/auto-plan` and `/api/drone/execute` exist
   - `droneIntegrationService.ts` can create plans, generate waypoints, choose basic flight types and return simulated analysis
   - Smart Hub now uses the internal drone API scaffold instead of local component-only mock flight data
   Current limitations:
   - flight plans are in-memory and not durable across runtime restart/deploy
   - garden/task inputs in `droneIntegrationService` are mocked rather than loaded from the real storage/database layer
   - execution is simulated and does not dispatch to DJI, Parrot, MAVLink, provider cloud or physical hardware
   - analysis results use synthetic/randomized values rather than uploaded imagery/computer vision output
   - no mission media storage, telemetry ledger, pilot authorization, no-fly-zone validation, safety checklist or compliance workflow is implemented
   Implementation candidates promoted from legacy promises:
   - `T9-IMPLEMENT-01 durable drone mission registry` — Architecture path: `consolidate-first` / `schema-consolidation`; persist flight plans, mission state, simulated/real results and links to garden/field context
   - `T9-IMPLEMENT-02 drone evidence/media pipeline` — Architecture path: `convert-platform` / `evidence-ledger`; support upload/import of imagery, orthomosaic/NDVI outputs, processing state and traceable derived observations
   - `T9-IMPLEMENT-03 provider/hardware integration boundary` — Architecture path: `convert-platform` / `integration-boundary`; define provider adapters, credentials, mission dispatch, telemetry ingestion and failure modes before claiming live drone control
   - `T9-IMPLEMENT-04 drone safety and authorization workflow` — Architecture path: `convert-platform` / `workflow-orchestration`; add preflight checklist, weather/no-fly validation, pilot/legal responsibility and audit records
   - `T9-IMPLEMENT-05 prescription-map handoff from drone evidence` — Architecture path: `consolidate-first`; connect verified drone-derived zones to NDVI/prescription workflows only after the evidence pipeline is real
   Rejected claims:
   - `T9-REJECT-01 presenting DJI/flotta/telemetria/video live as current product`
   - `T9-REJECT-02 presenting synthetic analysis as AI computer vision accuracy or measured agronomic outcome`
   Completed alignment:
   - synchronized `public/docs/manual/02-drone-operations.md` with the already bounded source chapter
   - updated Smart Hub drone copy to label the module as beta/scaffold/simulated
   - wired Smart Hub drone actions to the existing internal `/api/drone/*` scaffold instead of maintaining a separate local mock
   Closure result:
   - `GAP-2026-04-23-Z` is closed for manual/UI/master-plan alignment
   Closure rule:
   - drone surfaces describe the current scaffold honestly, while durable mission registry, evidence pipeline, hardware integration and safety workflow remain tracked implementation work

10. `T10 Sustainability/ESG Boundary Consolidation`
   Status: done
   Goal:
   - preserve sustainability as a product direction while separating real environmental evidence from unsupported carbon/ESG/circular-economy platform claims
   Source chapters:
   - `docs/manual/24-sustainability.md`
   Current verified surface:
   - `environmentalMonitoringService.ts` provides weather lineage, derived indicators, site binding and zone environmental ledger summaries
   - irrigation, sensor, weather and diary/predictive services consume environmental context for operational decisions
   - analytics includes a sustainability tab, but its CO2/water/organic values are lightweight static/summary indicators rather than audited accounting
   - prescription/cost optimization services include environmental scores/impact indicators for local decision support
   - `blockchainTraceabilityService.ts` contains carbon-footprint types and fixed/simulated calculations, not a verified carbon accounting system
   Current limitations:
   - no Scope 1/2/3 emissions ledger with auditable activity factors
   - no verified sequestration model, carbon credits, offset workflow or third-party certification support
   - no biodiversity census/index module
   - no circular-economy program tracking, waste ledger, biogas/compost certification or industrial symbiosis workflow
   - no formal ESG report generator or ISO/EMAS/Carbon Trust/Rainforest certification workflow
   Implementation candidates promoted from legacy promises:
   - `T10-IMPLEMENT-01 sustainability evidence ledger` — Architecture path: `convert-platform` / `evidence-ledger`; persist environmental observations, water/energy/input events, assumptions, source quality and audit lineage
   - `T10-IMPLEMENT-02 water efficiency analytics` — Architecture path: `consolidate-first`; promote irrigation/water-quality and environmental ledger data into measured water-use indicators with baseline and confidence labels
   - `T10-IMPLEMENT-03 carbon accounting module` — Architecture path: `convert-platform`; implement activity factors, Scope 1/2/3 categories, units, emission factors, uncertainty and source references before any carbon-footprint claims
   - `T10-IMPLEMENT-04 biodiversity and habitat tracking` — Architecture path: `consolidate-first`; add field observations, habitat elements, monitoring dates and simple indicators before advanced indices
   - `T10-IMPLEMENT-05 ESG/export reporting` — Architecture path: `defer until T10-IMPLEMENT-01/03`; generate reports only from an auditable evidence ledger and selected standards
   Deferred strategic candidates:
   - `T10-DEFER-01 environmental certifications and third-party audit workflows` — dependent on standards/legal review and partner validation
   - `T10-DEFER-02 circular-economy and waste/byproduct marketplace workflows` — dependent on operational waste ledger, partner/integration program and commercial scope
   Rejected claims:
   - `T10-REJECT-01 presenting fixed/simulated carbon calculations as verified carbon footprint or carbon-neutral status`
   - `T10-REJECT-02 presenting ESG/certification/credit workflows as current product without standards mapping and audit evidence`
   Completed alignment:
   - rewrote `docs/manual/24-sustainability.md`
   - synchronized `public/docs/manual/24-sustainability.md`
   Closure result:
   - `GAP-2026-04-23-S` is closed for manual/master-plan alignment
   Closure rule:
   - sustainability documentation describes current environmental evidence support and tracks carbon/ESG/biodiversity/circular-economy as explicit implementation work

11. `T11 Automated Diary Boundary Consolidation`
   Status: done
   Goal:
   - distinguish the real DB-backed daily weather/environment diary pipeline from broader automatic agronomic diary promises and in-memory operational diary surfaces
   Source chapters:
   - `docs/manual/35-automated-diary.md`
   Current verified surface:
   - `vercel.json` schedules `/api/cron/daily-diary` daily at 23:00
   - `/api/cron/daily-diary` calls `dailyDiaryService.recordDailyEntries()` with production cron-secret protection
   - `dailyDiaryService.ts` records `daily_weather_log`, calculates ETo/GDD/chill/stress indicators where data exists, updates `cultivation_daily_tracking`, generates selected `diary_events` and persists zone environmental ledger entries into weather raw data
   - production/runtime schema has been aligned for `daily_weather_log`, `daily_diary_entries`, `diary_events`, `cultivation_daily_tracking`, GDD parameters and event correlations
   - `AutomatedDiaryViewer` reads daily diary/weather/tracking/event data through `dailyDiaryService`
   Current limitations:
   - daily coverage depends on cron execution, Supabase availability, user/garden coordinates and API/fallback quality
   - active-cultivation tracking depends on `cultivations` rows and GDD parameter coverage
   - `operationalDiaryService.ts` remains an in-memory operational diary/analytics layer and is not the same durable daily diary pipeline
   - broad claims about mature year-over-year analytics, complete automatic event generation, community data, local station/IoT priority and guaranteed nightly completeness are not fully closed
   Implementation candidates promoted from legacy promises:
   - `T11-IMPLEMENT-01 diary pipeline observability` — Architecture path: `extend-current`; persist cron runs, processed users, failures, coverage gaps and retry state
   - `T11-IMPLEMENT-02 durable operational diary convergence` — Architecture path: `consolidate-first` / `evidence-ledger`; move in-memory operational diary entries/analytics into durable tables or clearly separate them from the automated diary
   - `T11-IMPLEMENT-03 diary event provenance and confidence` — Architecture path: `consolidate-first`; mark automatic/manual/fallback events with source, confidence, input coverage and resolving record
   - `T11-IMPLEMENT-04 multi-season agronomic analytics` — Architecture path: `defer until coverage`; enable year-over-year GDD/stress/yield comparison only after sufficient persisted history and outcome linkage
   - `T11-IMPLEMENT-05 local station and IoT diary ingestion` — Architecture path: `convert-platform` / `integration-boundary`; integrate station/sensor priority only through stable device/provider ingestion and quality flags
   Rejected claims:
   - `T11-REJECT-01 presenting the diary as guaranteed complete nightly pipeline without coverage/observability evidence`
   - `T11-REJECT-02 presenting in-memory operational diary analytics as durable historical evidence`
   Completed alignment:
   - synchronized `public/docs/manual/35-automated-diary.md` with the bounded source chapter
   Closure result:
   - `GAP-2026-04-23-AI` is closed for manual/master-plan alignment
   Closure rule:
   - diary documentation distinguishes DB-backed daily environmental observations from still-open operational diary convergence, pipeline observability and multi-season analytics work

12. `T12 AI Prediction/Overview Boundary Consolidation`
   Status: done
   Goal:
   - keep AI as a strategic product direction while separating real assistive/predictive surfaces from unsupported claims of one unified autonomous AI engine
   Source chapters:
   - `docs/manual/01-ai-predictions.md`
   - `docs/manual/07-ai-overview.md`
   Current verified surface:
   - `Global AI Chat` is a real Gemini-backed bounded chat surface from T1, with tier/credit checks and limited context
   - predictive services exist across `aiPredictiveEngine.ts`, `predictiveAnalyticsService.ts`, `diaryPredictiveEngine.ts`, `fieldRowPredictiveService.ts`, agronomic priority services and prescription intelligence services
   - `/api/ai/predictions` exists; POST can run the predictive engine with supplied data, while GET currently builds predictions from demo/mock weather/soil/plant inputs
   - `AIPredictionsDashboard` currently uses local empty mock data and is not yet DB-grounded against the route or a prediction ledger
   - Director, planner, diary, NDVI, drone, irrigation, nutrition and prescription surfaces each have their own maturity boundaries rather than one shared AI runtime contract
   Current limitations:
   - no single canonical AI/prediction engine with uniform input, confidence, provenance and output contracts
   - no universal accuracy claim is supported across crops, sites, stages and modules
   - prediction surfaces range from DB-backed/contextual services to rules, heuristics, fallback paths, mock/demo routes and staged UI
   - no central prediction ledger stores input snapshot, model/service identity, confidence, recommendation, user decision and field outcome
   - no validation harness currently reports measured accuracy by crop/site/stage
   Implementation candidates promoted from legacy promises:
   - `T12-IMPLEMENT-01 AI prediction maturity map in product/UI` — Architecture path: `extend-current`; expose the same maturity map used in docs where users encounter mixed predictive surfaces
   - `T12-IMPLEMENT-02 DB-grounded AI predictions route/dashboard` — Architecture path: `consolidate-first` / `service-consolidation`; replace demo GET data and local dashboard mock with persisted garden/crop/weather/activity context
   - `T12-IMPLEMENT-03 prediction evidence ledger` — Architecture path: `convert-platform` / `evidence-ledger`; persist input snapshot, source quality, service/model, confidence, recommendation, user action and measured outcome
   - `T12-IMPLEMENT-04 predictive service contract convergence` — Architecture path: `consolidate-first`; standardize confidence, fallback flags, source quality, actionability and caveat fields across predictive services
   - `T12-IMPLEMENT-05 validation harness and accuracy reporting` — Architecture path: `defer until T12-IMPLEMENT-03`; publish accuracy only after enough linked predictions/outcomes exist
   - `T12-IMPLEMENT-06 AI overview generated from master-plan maturity` — Architecture path: `extend-current`; prevent future manual drift by deriving overview labels from the source-of-truth maturity map
   Rejected claims:
   - `T12-REJECT-01 presenting 94.5% or any universal AI accuracy claim without validation evidence`
   - `T12-REJECT-02 presenting proprietary deep-learning/continuous-learning platform claims as current product without implementation and outcome tracking`
   - `T12-REJECT-03 presenting drone computer vision, autonomous orchestration or report certification as closed AI capabilities`
   Completed alignment:
   - rewrote `docs/manual/07-ai-overview.md` as an AI sub-domain maturity map
   - synchronized `public/docs/manual/01-ai-predictions.md` with the bounded source chapter
   - added `public/docs/manual/07-ai-overview.md` so the public manual can serve the same bounded overview
   - indexed AI overview and predictions in both source/public manual README files
   - updated the Predizioni AI dashboard subtitle/disclosure to show the surface is in consolidation rather than a fully validated AI engine
   Closure result:
   - `GAP-2026-04-23-Y` is closed for manual/UI/master-plan alignment
   - `GAP-2026-04-23-AE` is closed for manual/master-plan alignment
   Closure rule:
   - AI documentation and product copy describe a distributed assistive/predictive layer with explicit maturity boundaries, while DB-grounded predictions, evidence ledger and validation remain tracked implementation work

13. `T13 Traceability/Blockchain Boundary Consolidation`
   Status: done
   Goal:
   - preserve commercial traceability, QR and cryptographic verification as product directions while separating them from the DB-backed operational ledger that is actually implemented today
   Source chapters:
   - `docs/manual/03-traceability.md`
   Current verified surface:
   - T2 established the real traceability baseline through DB-backed operational records and projections such as `agronomic_operation_outcome_projection`, `agronomic_operation_signal_projection` and `agronomic_precision_execution_projection`
   - `services/blockchainTraceabilityService.ts` exists, but uses in-memory maps, generated hashes/block numbers, simulated smart contracts/NFT minting and non-persisted QR/consumer app state
   - `/api/blockchain/*` routes call that in-memory/simulated service and are not a durable blockchain integration or commercial chain-of-custody API
   - `TraceabilityWidget` is a local/demonstrative product trace view with hard-coded example products and local QR generation, not a DB-backed commercial traceability workspace
   - GlobalG.A.P. lot traceability is a separate compliance subdomain and does not by itself close public consumer QR, NFT or immutable blockchain proof workflows
   Current limitations:
   - no durable product-lot registry binds harvests, batches, transformations, sale units and consumer-facing pages end-to-end
   - no cryptographic anchoring to a real blockchain/provider or verifiable timestamping service
   - no persisted QR scan analytics, consumer app publication flow or public product-page governance
   - no certification authority integration, automatic commercial badges, NFT marketplace workflow or legal chain-of-custody closure
   - simulated carbon, sustainability and quality indicators must not be treated as verified consumer/compliance evidence
   Implementation candidates promoted from legacy promises:
   - `T13-IMPLEMENT-01 product lot registry` — Architecture path: `consolidate-first` / `schema-consolidation`; bind crop/plant/harvest/batch/sale units to operational records with stable identifiers
   - `T13-IMPLEMENT-02 public QR traceability pages` — Architecture path: `consolidate-first`; publish selected ledger-backed events with privacy filters, QR issuance, scan logging and revocation
   - `T13-IMPLEMENT-03 cryptographic evidence anchoring` — Architecture path: `convert-platform` / `evidence-ledger`; add hash chains, timestamping/anchoring provider, verification API and immutable audit rules only after product lots are durable
   - `T13-IMPLEMENT-04 consumer/commercial traceability workflow` — Architecture path: `convert-platform`; support labels, packaging units, public claims approval, scan analytics, feedback and commerce integrations
   - `T13-IMPLEMENT-05 certification/compliance evidence linkage` — Architecture path: `consolidate-first`; connect BIO/GlobalG.A.P./HACCP evidence to lot records without implying authority-issued certification
   - `T13-IMPLEMENT-06 retire or persist simulated blockchain service` — Architecture path: `consolidate-first`; either move `blockchainTraceabilityService` to durable tables/provider adapters or keep it explicitly demo/internal
   Rejected claims:
   - `T13-REJECT-01 presenting generated hashes and in-memory maps as real immutable blockchain storage`
   - `T13-REJECT-02 presenting QR, NFT, premium pricing, consumer app, marketplace or certification badges as current commercial product`
   - `T13-REJECT-03 presenting carbon-neutral or sustainability claims from simulated calculations as verified product evidence`
   Completed alignment:
   - synchronized `public/docs/manual/03-traceability.md` with the bounded source chapter
   - updated `TraceabilityWidget` copy and emitted activity type to label the current surface as operational/demo support rather than blockchain/commercial traceability
   Closure result:
   - `GAP-2026-04-23-AC` is closed for manual/UI/master-plan alignment
   Closure rule:
   - traceability docs and UI distinguish the real DB-backed operational ledger from future product-lot, QR, cryptographic anchoring and consumer/commercial traceability work

14. `T14 Export Surface Boundary Consolidation`
   Status: done
   Goal:
   - preserve export as a product capability while separating real current export families from unsupported claims of one unified enterprise export framework
   Source chapters:
   - `docs/manual/23-export-system.md`
   Current verified surface:
   - `/app/export` provides client-side operational export for `tasks`, `gardens`, `analytics` in CSV and report-print flow
   - client-side "PDF" in `/app/export` is currently an HTML report opened in a new window and printed/saved by browser workflow
   - `/api/export/csv` and `/api/export/pdf` exist, are tier-guarded (`PRO`) and currently cover `analytics` and `treatments`
   - API export routes use real Supabase tables when available (`professional_analytics`, `treatment_register`) and fallback mock datasets in bypass mode
   - `/api/export/pdf` currently returns text content (`.txt`) and not a rendered binary PDF document
   - specialist export for prescription maps is materially more advanced through `MapExportModal`, `geoExportService`, GIS/ISOBUS-oriented formats and persisted export records
   Current limitations:
   - no single unified export contract across client export, professional API export and specialist module export
   - no cross-module scheduler/retry/delivery pipeline for recurring exports
   - no product-wide format matrix with verified support guarantees
   - no general-purpose public export API with stable versioned contract
   - compliance/stakeholder reporting remains partial and domain-specific
   Implementation candidates promoted from legacy promises:
   - `T14-IMPLEMENT-01 export surface inventory registry` — Architecture path: `extend-current`; maintain one canonical list of export families, owners, inputs, outputs, maturity and evidence
   - `T14-IMPLEMENT-02 unified export contract and metadata` — Architecture path: `consolidate-first`; standardize minimum metadata (source, generated_at, filters, fallback flag, schema version) across export surfaces
   - `T14-IMPLEMENT-03 true PDF generation pipeline` — Architecture path: `consolidate-first`; replace text/html-print approximations with deterministic PDF generation for declared report families
   - `T14-IMPLEMENT-04 fallback transparency and quality flags` — Architecture path: `consolidate-first`; expose mock/bypass provenance in API responses and exported files
   - `T14-IMPLEMENT-05 scheduled and durable export jobs` — Architecture path: `convert-platform`; introduce queue/scheduler/retry/audit for recurring delivery workflows
   - `T14-IMPLEMENT-06 public export API boundary` — Architecture path: `convert-platform`; define authenticated versioned external export interface only after unified contracts are stable
   Rejected claims:
   - `T14-REJECT-01 presenting the current product as a complete enterprise export platform with universal formats and automation`
   - `T14-REJECT-02 presenting /api/export/pdf as a production-grade PDF rendering system`
   - `T14-REJECT-03 presenting all export routes as uniformly DB-grounded without fallback/mock modes`
   Completed alignment:
   - rewrote `docs/manual/23-export-system.md` around verified export families and boundaries
   - synchronized `public/docs/manual/23-export-system.md` with bounded source chapter
   - updated `/app/export` UI copy to label the report-print flow explicitly instead of implying a full PDF engine
   Closure result:
   - `GAP-2026-04-23-X` is closed for manual/UI/master-plan alignment
   Closure rule:
   - export documentation and product copy reference only verified export families and their real maturity, while unification/scheduling/public API work remains explicit backlog

## Recommended Start Order
To turn this map into execution without losing precision, start in this order:

1. `T1 AI Surfaces Consolidation`
   Reason:
   - highest leverage on user-visible product truth
   - already partially live in code
   - easiest place to separate real AI from assistive AI

2. `T2 Operational Ledger Closure`
   Reason:
   - foundational for many other modules
   - directly affects diary, evidence, registry and outcome truthfulness

3. `T3 Compliance and Certifications Closure`
   Reason:
   - high documentation risk and real product value
   - already has working surfaces that need explicit target states

4. `T5 IoT and Smart Hub Consolidation`
   Reason:
   - prevents telemetry/control promises from staying vague
   - clarifies automation scope for irrigation and sensors

5. `T4 Precision Execution Chain`
   Reason:
   - depends in part on clearer execution/ledger and Smart Hub boundaries

6. `T6 Specialized Verticals Completion`
   Reason:
   - important, but easier to prioritize once shared platform blocks are clearer

7. `T7 Strategic Promise Triage`
   Reason:
   - should continue in parallel as governance, but not block product-facing implementation choices

## Open Gap Register
Use this section for cross-cutting gaps that emerge while comparing UI, architecture and documentation. Do not leave them only in chat history.

Meta-rule for this register:
- if a manual chapter promises a capability that is not closed in code, the missing capability belongs here as a tracked `todo`
- only after that tracking step can the chapter be treated as `rewrite` or `delete-candidate`

1. `GAP-2026-04-23-A` Certifications maturity is not homogeneous across tabs
   Status: partially_closed_by_T3
   Priority: medium
   Related block: `P3`
   Evidence:
   - the route and dashboard are real, but `BIO` and `GlobalG.A.P.` are materially more implemented than `SQNPI` and `GRASP`
   - T3-A now records the target state: BIO persisted readiness, GlobalG.A.P. partial durable compliance workspace, SQNPI/GRASP informational tabs
   Risk:
   - the product can be described too optimistically as one uniform certifications suite, or too pessimistically as pure concept
   TODO:
   - make the per-certification maturity explicit in docs and, if needed, in UI copy
   Closure rule:
   - each certification surface is labelled and documented according to its real implementation status

2. `GAP-2026-04-23-B` BIO workflow is visible in UI but not yet a full persisted certification loop
   Status: closed_by_T3
   Priority: low
   Related block: `P2` / `P3`
   Evidence:
   - `BioCertificationForm` provides structured capture and scoring
   - `CertificationsDashboard` now loads/saves the latest BIO record through `bioCertificationService`
   - production schema contains `bio_certifications` and `bio_certifications_with_readiness`
   Risk:
   - operators may still infer that persisted readiness equals official certification closure if the manual/UI overstate the status
   TODO:
   - keep manual wording bounded to persisted readiness support; full certification authority workflow remains outside current scope
   Closure rule:
   - BIO records are persisted/reloaded end-to-end and the UI/manual describe the remaining limitation

3. `GAP-2026-04-23-C` GlobalG.A.P. UI mixes real compliance structures with simulated completion actions
   Status: closed_by_T3
   Priority: low
   Related block: `P2` / `P3`
   Evidence:
   - `GlobalGapDashboard` loads real overview services, but some action completion and document generation paths are simulated in UI
   - production schema now confirms the core and richer GlobalG.A.P. service tables after `20260425150000_consolidate_globalgap_operational_schema.sql`
   - UI template actions are labelled as template support rather than durable completion
   Risk:
   - the dashboard can look more operationally closed than the underlying workflow really is
   TODO:
   - keep future UI actions either wired to these persisted tables or explicitly labelled as template/non-persisted support
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
   Status: closed for strategic chapters under `T7`
   Priority: high
   Related block: `P5`
   Evidence:
   - several chapters still use language about ROI, autonomous operations, automatic certifications, premium support, full drone workflows or strong integration claims without first proving those paths in the current codebase
   Risk:
   - the manual keeps reintroducing ambiguity because some chapters are inherited from older promise documents rather than from implementation evidence
   TODO:
   - done for T7 strategic chapters: chapters 25, 28, 30, 31 and 32 now classify unimplemented promises as implement/defer/reject in the master plan before manual alignment
   Closure note:
   - the remaining non-T7 legacy gaps stay tracked under their own entries; T7 closes the strategic promise subset
   Closure rule:
   - no manual chapter remains in an unclassified promise state

6. `GAP-2026-04-23-F` Success-story and ROI style chapters are especially likely to overstate current product reality
   Status: closed under `T7`
   Priority: high
   Related block: `P5`
   Evidence:
   - legacy chapters such as `31-success-stories`, `28-economic-benefits`, parts of `21-individual-plants`, `26-integration-api` and `34-director-orchestrator` still contain strong outcome or integration claims
   Risk:
   - these chapters can silently undo the truthfulness work done elsewhere in the manual
   TODO:
   - done: ROI, use-case, success-story, R&D and roadmap chapters were rewritten around evidence policy and tracked backlog
   Closure note:
   - success-story and ROI outcome claims are no longer presented as verified product facts in chapters 28 and 31
   Closure rule:
   - all high-risk promise-heavy chapters are either rewritten or explicitly moved out of the operational manual

7. `GAP-2026-04-23-G` Integration/API chapter describes an ecosystem much wider than the verified code surface
   Status: closed under `T8`
   Priority: high
   Related block: `P5`
   Evidence:
   - `docs/manual/26-integration-api.md` presents official ERP, marketplace, banking, insurance, SDK and automation integrations as current product capabilities
   Risk:
   - users and stakeholders can infer a public integration layer and partner ecosystem that the current repository does not substantiate
   TODO:
   - done: chapter 26 now describes internal API-adjacent surfaces, credential configuration, export/import and bounded IoT/machinery support
   - done: public API, webhooks, SDKs, ERP/marketplace/banking/insurance and integration gateway promises were converted into `T8-IMPLEMENT-*` / `T8-DEFER-*`
   Closure note:
   - the security/schema consolidation around `api_configurations` and `api_keys` is tracked as `T8-IMPLEMENT-01`
   Closure rule:
   - the manual no longer claims unsupported external integration breadth

8. `GAP-2026-04-23-H` ROI and business-benefit claims are documented as measured outcomes without verifiable grounding
   Status: closed under `T7`
   Priority: high
   Related block: `P5`
   Evidence:
   - `docs/manual/28-economic-benefits.md` and `docs/manual/31-success-stories.md` contain guaranteed savings, ROI, payback and market uplift claims
   Risk:
   - product documentation becomes commercially unreliable and undermines the credibility of the verified technical manual
   TODO:
   - done: `docs/manual/28-economic-benefits.md` and `docs/manual/31-success-stories.md` now reject guaranteed ROI/testimonial claims and promote a future evidence-backed economic analytics/customer evidence workflow
   Closure note:
   - ROI is now treated as future measured evidence, not a guaranteed outcome
   Closure rule:
   - no operational manual chapter contains fabricated or unverified ROI/testimonial material

9. `GAP-2026-04-23-I` Scenario chapters blur illustrative examples with claimed real deployments
   Status: closed under `T7`
   Priority: medium
   Related block: `P5`
   Evidence:
   - `docs/manual/30-use-cases.md` presents staged adoption patterns and business results as if they were observed production use
   Risk:
   - scenario material can be misread as proof of implementation completeness or customer validation
   TODO:
   - done: `docs/manual/30-use-cases.md` now presents scenarios as illustrative templates tied to verified modules, with missing guided playbooks tracked as implementation work
   Closure note:
   - scenario material is no longer framed as customer proof or deployment evidence
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
   Status: closed under `T8`
   Priority: high
   Related block: `P5`
   Evidence:
   - the codebase has many `app/api/*` endpoints, API-key/provider configuration, NDVI/IoT endpoints, support submission routes and selected external adapters
   - the current manual chapter describes official ERP, marketplace, fintech, SDK and automation ecosystems not supported by the verified code surface
   Risk:
   - real API work is obscured by an inflated narrative, making the product seem either overbuilt or untrustworthy
   TODO:
   - done: T8 maps internal application APIs, external provider configuration, IoT/sensor ingestion, file/export support and unsupported public integrations
   - done: public API, webhooks, connector registry and SDK generation are tracked as implementation candidates with architecture paths
   Closure note:
   - chapter 26 now separates current internal/API-adjacent capability from future external integration platform work
   Closure rule:
   - the integration chapter reflects the real API surface and clearly separates internal endpoints from future external integrations

16. `GAP-2026-04-23-P` Use-case chapter aggregates real modules with very different maturity levels and presents them as proven deployments
   Status: closed under `T7`
   Priority: medium
   Related block: `P5`
   Evidence:
   - `docs/manual/30-use-cases.md` references real domains such as NDVI, prescription maps, certifications, analytics, challenges, agronomist flows, drone services and IoT
   - the same chapter converts those references into measured results, validated customer stories and uniformly mature operational stacks
   Risk:
   - mixed-maturity modules are perceived as end-to-end production deployments rather than illustrative combinations of currently available building blocks
   TODO:
   - done: chapter 30 is now a scenario-template guide and the missing productized playbook layer is tracked as `T7-IMPLEMENT-03`
   Closure note:
   - examples are explicitly illustrative and contain no implied real-customer outcome claims
   Closure rule:
   - each scenario is grounded in verified modules and contains no implied real-customer outcome claims

17. `GAP-2026-04-23-Q` Economic domain exists in limited form, but the manual describes it as a validated business-impact system
   Status: closed under `T7`
   Priority: high
   Related block: `P5`
   Evidence:
   - the codebase includes partial economic tooling: analytics ROI summaries, prescription cost analysis, harvest value tracking, operation costs and selected pricing/market services
   - `docs/manual/28-economic-benefits.md` turns that partial surface into guaranteed savings, fixed payback windows, size-based ROI tables and business advisory claims
   Risk:
   - a partially implemented economic layer is perceived as a validated commercial outcome engine
   TODO:
   - done: actual economic support is documented as visibility/evidence support, while a durable economic analytics module is tracked as `T7-IMPLEMENT-02`
   - done: guaranteed savings and fixed ROI claims were rejected
   Closure note:
   - the economic chapter now separates current operational evidence from future ROI measurement work
   Closure rule:
   - the economic chapter, if retained, reflects only the currently supported economic calculations and clearly states their limits

18. `GAP-2026-04-23-R` Success-stories chapter contains factual-looking customer/testimonial material that is not verifiable from the repository
   Status: closed under `T7`
   Priority: high
   Related block: `P5`
   Evidence:
   - `docs/manual/31-success-stories.md` references real product domains such as certifications, analytics, NDVI, drone, traceability, agronomist and challenge mechanics
   - the same chapter then presents named companies, direct testimonials, awards, media mentions and precise business outcomes as historical facts without repository-grounded evidence
   Risk:
   - the operational manual includes narrative material that reads as factual proof, but is not supported by implementation evidence and is therefore more misleading than a normal roadmap-style promise
   TODO:
   - done: chapter 31 now contains a success-story publication policy, not named/verbatim customer proof
   - done: future customer evidence is tracked as `T7-IMPLEMENT-05`
   Closure note:
   - no T7 manual chapter contains named testimonial, award or customer-outcome material as current fact
   Closure rule:
   - no in-app manual chapter contains named testimonial, award or customer-outcome material unless it is backed by verifiable source evidence available to the product team

19. `GAP-2026-04-23-S` Sustainability chapter composes real environmental signals into a much broader ESG/carbon platform than the verified code supports
   Status: closed under `T10`
   Priority: medium
   Related block: `P5`
   Evidence:
   - the codebase includes environmental monitoring, weather lineage, irrigation efficiency context, selected environmental scoring and a sustainability tab in analytics
   - `docs/manual/24-sustainability.md` describes full carbon accounting, biodiversity indices, circular-economy programs, ESG reporting and environmental certification workflows as if they were already implemented end-to-end
   Risk:
   - a real but narrow environmental foundation is documented as a comprehensive sustainability suite, which creates both product overclaim and confusion about what data is actually durable and measurable
   TODO:
   - done: T10 maps verified environmental monitoring, irrigation/water context, lightweight analytics indicators and simulated carbon structures
   - done: carbon accounting, ESG reporting, biodiversity tracking, certification workflows and circular-economy programs are tracked as `T10-IMPLEMENT-*` / `T10-DEFER-*`
   Closure note:
   - chapter 24 now describes environmental evidence support, not a complete ESG/carbon platform
   Closure rule:
   - the sustainability chapter reflects the actual environmental tooling and clearly excludes unsupported ESG/carbon/circular-economy claims

20. `GAP-2026-04-23-T` Orchard chapter overstates the most advanced precision-orchard and analytics layers relative to a real but uneven implementation
   Priority: medium
   Related block: `P5`
   Status: closed under `T6-B`
   Evidence:
   - `/app/orchard`, `orchardService`, orchard dashboard/wizard/tree/pruning/harvest managers and Supabase-backed orchard structures are real
   - original chapter extended that real base into robotics, complete advanced analytics, computer-vision automation and broader commercial/post-harvest workflows that are not established as uniformly connected modules
   Risk:
   - a substantial orchard module is documented as if every advanced precision-orchard promise were already closed and production-ready
   TODO:
   - done: map orchard features into verified operational core vs unsupported advanced precision claims
   - done: rewrite the chapter around the verified core only
   Closure note:
   - `docs/manual/18-orchard-management.md` and `public/docs/manual/18-orchard-management.md` now describe the DB-backed frutteto core and exclude robotics, computer vision, post-harvest commerce and ROI promises from current capability
   Closure rule:
   - orchard docs describe the real operational stack and clearly exclude unsupported advanced precision/commercial claims

21. `GAP-2026-04-23-U` Olive vertical is real but partly assembled from orchard foundations plus local specialist widgets
   Priority: high
   Related block: `P5`
   Status: closed under `T6-B`
   Evidence:
   - `/app/olives` exists and is operational
   - olive contexts are resolved from garden/orchard data and the page reuses orchard operational managers
   - olive-specific widgets such as maturity tracking and olive-fly monitoring currently rely on local state/sample-style readings rather than a clear durable domain backend
   Risk:
   - the product can be documented as a fully mature olive-specialist stack when part of the specialist layer is still assistive/local and built on shared orchard infrastructure
   TODO:
   - done: map which olive features are durable/shared vs local assistive
   - done: document the current hybrid state explicitly
   Closure note:
   - `docs/manual/19-olive-management.md` and `public/docs/manual/19-olive-management.md` now distinguish orchard-backed operations, olive-specific schemas and current local/sample-style specialist widgets
   Closure rule:
   - olive documentation clearly separates orchard-backed operations from local/demo-style specialist tooling, or the tooling is promoted to durable persisted workflows

22. `GAP-2026-04-23-V` Vineyard chapter extends a real vertical into winery/market-intelligence coverage beyond the verified product surface
   Priority: medium
   Related block: `P5`
   Status: closed under `T6-B`
   Evidence:
   - `/app/vineyard`, `vineyardService`, `vineyardBudLoadService`, vineyard dashboards/wizard and vine management are real and materially implemented
   - the current chapter still describes deeper cantina integration, market analysis and broad end-to-end viticulture intelligence not established as uniformly connected modules
   Risk:
   - a real vineyard vertical is oversold as a full vineyard-to-winery intelligence suite
   TODO:
   - done: map verified vineyard operations vs unsupported winery/market-intelligence claims
   - done: rewrite the chapter around the verified vineyard baseline only
   Closure note:
   - `docs/manual/20-vineyard-management.md` and `public/docs/manual/20-vineyard-management.md` now describe the DB-backed vineyard/vine/Ravaz support and exclude winery, ERP, market intelligence, denomination and bottle-traceability claims from current capability
   Closure rule:
   - vineyard docs reflect the actual operational and persistence layer without unsupported winery/market overclaim

23. `GAP-2026-04-23-W` Agronomist domain has real UI/data structures but not a consolidated consultation-service backend
   Priority: medium
   Related block: `P5`
   Status: closed under `T6-C`
   Evidence:
   - agronomist types and UI components exist for contacts, consultation capture and listing
   - `services/agronomistService.ts` remains largely stubbed for reads and applied-advice workflows
   - there is no verified marketplace, booking, payment or robust automatic prescription integration layer
   Risk:
   - a partially implemented agronomist surface can oscillate between being dismissed as fake or overstated as a complete consultation module
   TODO:
   - done: map which agronomist flows are truly storage-backed vs scaffold/UI-only
   - done: document the module as partially persisted and non-marketplace
   Closure note:
   - `docs/manual/11-agronomist-consultations.md` and `public/docs/manual/11-agronomist-consultations.md` now describe storage-provider-backed agronomists/consultations/advice while keeping marketplace, booking, payments and prescription automation out of current scope
   Closure rule:
   - agronomist documentation and implementation clearly agree on what is currently operational and what is not

24. `GAP-2026-04-23-X` Export surface is real but fragmented across simple client-side flows, helper services and selected API endpoints
   Status: closed under `T14`
   Priority: medium
   Related block: `P5`
   Evidence:
   - `/app/export`, `services/exportService.ts` and selected `/api/export/*` routes exist
   - the current export capability is pragmatic and partial, not a single consolidated export framework
   Risk:
   - future docs or UI could again collapse these scattered capabilities into an overclaimed universal export system
   TODO:
   - done: T14 maps three verified families (client operational export, professional API export, prescription specialist export)
   - done: source/public chapter 23 now describes actual route/service behavior, including report-print and fallback limits
   - future implementation: unified contract/metadata, deterministic PDF pipeline, scheduled jobs and public API boundary tracked under `T14-IMPLEMENT-*`
   Closure note:
   - export capability is no longer represented as one complete framework; specialist and generic surfaces are clearly separated by maturity
   Closure rule:
   - export documentation and product copy reference only the verified export families and formats actually supported

25. `GAP-2026-04-23-Y` AI predictions are real but still distributed across multiple engines, dashboards and maturity levels
   Status: closed under `T12`
   Priority: medium
   Related block: `P5`
   Evidence:
   - predictive services exist for harvest timing, yield, disease risk, water requirement and agronomic prioritization
   - dedicated route and API exist for AI predictions
   - some UI layers still use mock-loading patterns and not all predictive surfaces share the same engine or data contracts
   Risk:
   - the product can be documented either as a single unified AI engine or dismissed as mostly mock, while the real state is a distributed hybrid predictive layer
   TODO:
   - done: T12 maps predictive surfaces into DB-backed/contextual services, heuristic engines, demo/mock paths and staged UI
   - future implementation: converge predictive route/dashboard, evidence ledger, service contract and validation harness through `T12-IMPLEMENT-*`
   Closure note:
   - public/source manuals now avoid universal accuracy and proprietary ML claims; the dashboard shows a consolidation disclosure
   Closure rule:
   - AI predictions are documented and exposed according to their actual service/UI maturity

26. `GAP-2026-04-23-Z` Drone domain includes real planning/execution scaffolding but remains simulated and non-persisted
   Status: closed under `T9`
   Priority: high
   Related block: `P5`
   Evidence:
   - `droneIntegrationService.ts` and `/api/drone/*` endpoints implement flight-plan creation, auto-planning and execution flows
   - flight plans are held in memory, execution is explicitly simulated and analysis results are synthetic/randomized
   Risk:
   - the drone module can be understated as pure concept or overstated as real hardware-integrated operations, while it is actually a prototype-like operational scaffold
   TODO:
   - done: T9 classifies the current state as an internal scaffold with simulated execution and non-durable in-memory plan state
   - done: Smart Hub now uses the internal `/api/drone/*` scaffold and labels execution as simulation rather than physical flight
   - done: durable registry, evidence/media pipeline, provider integration, safety workflow and prescription handoff are tracked as `T9-IMPLEMENT-*`
   Closure note:
   - public manual chapter 02 is synchronized with the bounded source chapter
   Closure rule:
   - drone documentation and product copy clearly describe the current scaffold/prototype status or the implementation is promoted to durable integrated workflows

27. `GAP-2026-04-23-AA` NDVI surface is real but still mixes provider-backed data with fallback/simulated analysis paths
   Priority: medium
   Related block: `P5`
   Status: closed under `T4-D`
   Evidence:
   - `/app/ndvi`, NDVI dashboards, config-status flows and satellite service are real
   - the NDVI service explicitly falls back to simulated data and some trend/stress logic is still hybrid rather than fully quantitative remote-sensing processing
   Risk:
   - the module can be described either as too weak to matter or as a fully quantitative satellite intelligence pipeline, while the real state is in between
   TODO:
   - done: keep NDVI docs/provider status explicit about real vs fallback data
   - done: verify visibility of source quality in UI/manual
   Closure note:
   - source and public manuals describe NDVI as scouting/prioritization support with provider/fallback limits; `SentinelHubStatus` and config-status flows expose connected versus missing provider configuration; fallback/simulated paths remain documented as limits
   Closure rule:
   - NDVI documentation and UI consistently disclose when data is provider-backed versus fallback/simulated

28. `GAP-2026-04-23-AB` Prescription maps are more implemented than a preview, but the field-validated end-to-end chain remains uneven
   Priority: high
   Related block: `P5`
   Status: closed under `T4-C`
   Evidence:
   - dedicated route, dashboard, service layer, schema, persistence, export records and execution/outcome summaries exist
   - productive use still depends on mixed-maturity data sources, manual validation and incomplete closure of map -> field import -> applied outcome
   Risk:
   - the module is either underestimated as a mere beta mockup or overstated as a universally trusted VRT execution chain
   TODO:
   - done: rewrite docs around `real module with partial end-to-end closure`
   - future implementation: continue improving field import/applied/export/outcome linkage and machinery validation
   Closure note:
   - `docs/manual/06-prescription-maps.md` and `public/docs/manual/06-prescription-maps.md` now describe persisted maps/zones/exports/`variable_rate_applications`, field-operation statuses, execution/outcome summaries and the remaining limits around universal machine validation and measured field outcomes
   Closure rule:
   - prescription maps are documented according to their true operational maturity and the remaining field-validation gaps are either closed or explicitly surfaced

29. `GAP-2026-04-23-AC` Traceability domain is real but documented as a much broader immutable commercial/compliance platform
   Status: closed under `T13`
   Priority: high
   Related block: `P5`
   Evidence:
   - blockchain traceability service and related API routes exist
   - the current chapter claims automatic end-to-end product history, QR/commercial activation, premium pricing, ESG/carbon/NFT and broad compliance closure far beyond the verified baseline
   Risk:
   - a real but bounded traceability/prototype layer is mistaken for a fully operational chain-of-custody and consumer commerce platform
   TODO:
   - done: T13 maps DB-backed operational ledger, simulated blockchain service/routes and demo traceability UI separately
   - done: public manual 03 now matches the bounded source chapter
   - future implementation: product lot registry, public QR pages, cryptographic anchoring, consumer/commercial workflow and certification evidence linkage remain tracked under `T13-IMPLEMENT-*`
   Closure note:
   - generated hashes, in-memory blockchain records, NFT/QR and commercial claims are no longer presented as current verified product capability
   Closure rule:
   - traceability docs describe only the real operational/prototype surface and exclude unsupported chain-of-custody/commercial overclaim

30. `GAP-2026-04-23-AD` BIO certification guide is grounded in a real form but still implies stronger audit-readiness than the product currently guarantees
   Status: partially_closed_by_T3
   Priority: medium
   Related block: `P5`
   Evidence:
   - BIO form, checklist and document surfaces exist
   - BIO record persistence and readiness reload are now DB-backed
   - document handling and certification authority closure are still mixed in maturity and not all support is durably end-to-end
   Risk:
   - operators may read the guide as a full certification operations manual rather than an assisted readiness tool
   TODO:
   - rewrite the guide around actual score/form support and current certification-readiness boundaries
   Closure rule:
   - BIO guide clearly distinguishes assisted readiness support from full certification closure

31. `GAP-2026-04-23-AE` AI overview chapter compresses uneven AI domains into one coherent decision layer
   Status: closed under `T12`
   Priority: medium
   Related block: `P5`
   Evidence:
   - `docs/manual/07-ai-overview.md` presents AI as a unified transversal decision engine across predictions, director, planner chat, diary, NDVI, drones and irrigation
   - code inspection shows those domains are real but materially uneven in architecture, persistence and runtime maturity
   Risk:
   - the product can appear more uniformly AI-orchestrated than the current implementation actually is
   TODO:
   - done: `docs/manual/07-ai-overview.md` and `public/docs/manual/07-ai-overview.md` now map AI sub-domains by maturity
   - future implementation: decide convergence through `T12-IMPLEMENT-02/03/04`, not through manual overclaim
   Closure note:
   - the overview now frames AI as distributed assistive/predictive support rather than one autonomous decision layer
   Closure rule:
   - the AI overview is backed by an explicit sub-domain maturity map and no longer implies a uniform AI engine where one does not exist

32. `GAP-2026-04-23-AF` Global AI chat chapter promises a universal contextual assistant well beyond the verified implementation
   Status: partially_closed_by_T1
   Priority: medium
   Related block: `P5`
   Evidence:
   - `components/ai/GlobalAIChat.tsx` exists and now calls the real backend route
   - `app/api/ai/chat/route.ts` provides a real Gemini-backed AI route with credits/tier checks
   - T1 added bounded route/module context, prompt guardrails, explicit error/credit UX and context validation
   - there is still no verified end-to-end evidence for strong durable memory, support escalation, write-capable omnipresent actions or a large specialist knowledge base
   Risk:
   - users can infer a globally contextual assistant with production-grade memory, grounding and operational control that the codebase does not currently close
   TODO:
   - keep current manual wording bounded to verified chat behaviour
   - treat durable memory, grounded write actions, support escalation and broad specialist knowledge as future explicit work, not current capability
   Closure rule:
   - the global chat chapter only describes verified chat behaviour, and all stronger assistant capabilities are either implemented or explicitly tracked as open work

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
   Status: closed under `T5`
   Evidence:
   - telemetry and sensor-reading routes exist under `app/api/iot/*` and `app/api/sensors/readings/route.ts`
   - `services/sensorDataService.ts` provides real typed sensor-reading persistence helpers
   - `services/iotSensorService.ts` still contains TODO/mock-style device connectivity paths
   Risk:
   - the IoT domain can be misunderstood either as mostly absent or as a fully operational device-management and automation center
   TODO:
   - done: separate the real ingestion/persistence layer from future device registry, actuator control and stable automation rules
   Closure note:
   - `docs/manual/14-smart-hub.md`, `public/docs/manual/14-smart-hub.md`, `docs/manual/15-irrigation-system.md` and `public/docs/manual/15-irrigation-system.md` now describe telemetry ingestion, `smart_devices`, limited valve command dispatch, automation logs and irrigation register/calculation separately from open provider provisioning, Tuya dispatch, physical actuation guarantees and unsupervised automation
   Closure rule:
   - Smart Hub documentation and implementation explicitly distinguish telemetry reality from still-open actuation/automation work

35. `GAP-2026-04-23-AI` Automated diary chapter implies a more uniformly closed daily tracking system than the current implementation guarantees
   Status: closed under `T11`
   Priority: high
   Related block: `P5`
   Evidence:
   - real diary surfaces, cron entrypoint, predictive engine and diary-related migrations exist
   - `docs/manual/35-automated-diary.md` still describes a strongly closed nightly pipeline, broad event generation and mature comparative analytics as if they were uniformly settled product behaviour
   Risk:
   - users can infer a fully reliable automatic agronomic diary platform where the current system is real but still uneven in closure, presentation and operational guarantees
   TODO:
   - done: T11 maps the DB-backed daily weather/environment diary pipeline separately from in-memory operational diary surfaces and broader predictive promises
   - done: pipeline observability, durable operational diary convergence, event provenance, multi-season analytics and local station/IoT ingestion are tracked as `T11-IMPLEMENT-*`
   Closure note:
   - public manual chapter 35 is synchronized with the bounded source chapter
   Closure rule:
   - the diary chapter reflects only verified daily-tracking behaviour and all stronger automation claims are either implemented or explicitly tracked as open work

36. `GAP-2026-04-23-AJ` Nutrition and treatments chapter mixes a real operational core with much broader scientific/compliance promises
   Priority: high
   Related block: `P5`
   Status: closed under `T3-D` / `T3-E`
   Evidence:
   - real nutrition/treatments routes, dashboards, planners, products and execution flows exist
   - original `docs/manual/16-nutrition-treatments.md` expanded into full scientific nutrient engines, complete fitopharmaceutical/compliance systems, residue frameworks and mature VRT nutritional chains not verified as closed product behaviour
   Risk:
   - a useful real module is documented as if it were already a fully scientific, normative and precision-application platform
   TODO:
   - done: separate the verified operational nutrition/treatments core from still-open scientific/compliance/VRT ambitions
   Closure note:
   - `docs/manual/16-nutrition-treatments.md` and `public/docs/manual/16-nutrition-treatments.md` now describe DB-backed planner/registry capability, localStorage legacy limits, support-only exports, and backlog for official quaderno, LMR/residue/DPI validation and VRT end-to-end closure
   Closure rule:
   - nutrition/treatments documentation clearly distinguishes current operational capability from tracked future extensions

37. `GAP-2026-04-23-AK` Mechanical operations chapter extends a real register/execution module into telematics and fleet-management promises
   Priority: medium
   Related block: `P5`
   Status: closed under `T4-B`
   Evidence:
   - real mechanical-work route, forms, service layer and task-aware execution flow exist
   - original `docs/manual/17-mechanical-operations.md` added GPS fleet tracking, guidance systems, auto-steer, telematics integrations and broad optimization layers not verified as current product capability
   Risk:
   - users can mistake a real operational register module for a complete machinery telematics platform
   TODO:
   - done: isolate current mechanical execution/recording capability from still-open fleet/telematics ambitions
   Closure note:
   - `docs/manual/17-mechanical-operations.md` and `public/docs/manual/17-mechanical-operations.md` now describe the DB-backed `mechanical_work_register`, task-aware operational closure and explicit limits around GPS, telematics, fleet management, predictive maintenance and machine-origin execution proof
   Closure rule:
   - mechanical documentation describes the real module truthfully and tracks precision/telematics ambitions separately

38. `GAP-2026-04-23-AL` R&D and roadmap chapters are future-capability/backlog material currently living inside the manual
   Status: closed under `T7`
   Priority: high
   Related block: `P5`
   Evidence:
   - `docs/manual/25-research-development.md` and `docs/manual/32-roadmap.md` describe partnerships, patents, labs, commercialization paths and speculative future technologies rather than verified in-app capability
   Risk:
   - the manual continues to mix operational product truth with strategic aspiration and speculative backlog
   TODO:
   - done: relevant R&D, economic, scenario, roadmap and customer-evidence promises were converted into explicit `T7-IMPLEMENT-*` or `T7-DEFER-*` items
   - done: speculative or unverifiable claims were rejected under `T7-REJECT-*`
   Closure note:
   - chapters 25 and 32 now point to controlled backlog/maturity governance instead of presenting unverifiable labs, partnerships, patents or speculative technologies as product truth
   Closure rule:
   - no future-facing capability chapter remains in the user manual unless it is explicitly justified as tracked roadmap material and clearly separated from current product truth

## Resume Protocol
When a new chat resumes work:
1. open this master index
2. open the latest active plan document
3. review the `Open Gap Register` and pick the highest-priority unresolved item if it blocks truthful product communication or reliable execution
4. verify git status before editing
5. implement one bounded slice
6. update status in the active plan and, if priorities change, in this index
