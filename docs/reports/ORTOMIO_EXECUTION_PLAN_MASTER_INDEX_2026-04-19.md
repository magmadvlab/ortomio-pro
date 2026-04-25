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

## Strategic TODO Map
This section is Phase 2 of the audit: convert `todo-source` chapters and open gaps into grouped execution blocks that can later be implemented, removed or archived explicitly.

Rule:
- every block below is a real master-plan `todo`
- each block groups multiple documentation promises into one product/program decision area
- only capabilities that still make sense for the product should stay here
- obsolete or purely speculative promises should move toward explicit removal/archive, not silent persistence

1. `T1 AI Surfaces Consolidation`
   Status: todo
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
     Status: in_progress
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
       Status: in_progress
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
     - `T1-B6 Decision Templates`
       Status: todo
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
     - `T1-B7 Suggested Action Registry`
       Status: todo
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
     - `T1-B8 Guided Routing Hooks`
       Status: todo
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

2. `T2 Operational Ledger Closure`
   Status: in_progress
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
   Closure rule:
   - the product has an explicit cross-module record model and the manual can describe one truthful operational ledger rather than fragmented histories

3. `T3 Compliance and Certifications Closure`
   Status: todo
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
   - decide if BIO becomes a persisted loop or stays assisted assessment
   - separate simulated compliance actions from durable ones
   Closure rule:
   - each certification/compliance workflow has an explicit target state and the manual no longer overstates regulatory closure

4. `T4 Precision Execution Chain`
   Status: todo
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
   Closure rule:
   - the precision chain is documented and implemented according to a real execution path, not a mixture of analysis previews and aspirational automation

5. `T5 IoT and Smart Hub Consolidation`
   Status: todo
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
   Closure rule:
   - Smart Hub and irrigation docs can state one explicit truth about telemetry, control and automation maturity

6. `T6 Specialized Verticals Completion`
   Status: todo
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
   Closure rule:
   - each vertical has a declared target maturity and the manual reflects only the chosen supported depth

7. `T7 Strategic Promise Triage`
   Status: todo
   Goal:
   - remove or archive non-product narrative promises from the manual unless they are promoted into explicit strategic work
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
   First TODO candidates:
   - mark which chapters are to be archived/removed outright
   - keep only future capabilities that still deserve explicit product consideration
   - remove named customer/testimonial material from the operational manual perimeter
   Closure rule:
   - the manual contains no strategic or commercial promise layer that is not explicitly backed by either current code or an approved master-plan TODO

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

36. `GAP-2026-04-23-AJ` Nutrition and treatments chapter mixes a real operational core with much broader scientific/compliance promises
   Priority: high
   Related block: `P5`
   Evidence:
   - real nutrition/treatments routes, dashboards, planners, products and execution flows exist
   - `docs/manual/16-nutrition-treatments.md` then expands into full scientific nutrient engines, complete fitopharmaceutical/compliance systems, residue frameworks and mature VRT nutritional chains not verified as closed product behaviour
   Risk:
   - a useful real module is documented as if it were already a fully scientific, normative and precision-application platform
   TODO:
   - separate the verified operational nutrition/treatments core from still-open scientific/compliance/VRT ambitions
   Closure rule:
   - nutrition/treatments documentation clearly distinguishes current operational capability from tracked future extensions

37. `GAP-2026-04-23-AK` Mechanical operations chapter extends a real register/execution module into telematics and fleet-management promises
   Priority: medium
   Related block: `P5`
   Evidence:
   - real mechanical-work route, forms, service layer and task-aware execution flow exist
   - `docs/manual/17-mechanical-operations.md` then adds GPS fleet tracking, guidance systems, auto-steer, telematics integrations and broad optimization layers not verified as current product capability
   Risk:
   - users can mistake a real operational register module for a complete machinery telematics platform
   TODO:
   - isolate current mechanical execution/recording capability from still-open fleet/telematics ambitions
   Closure rule:
   - mechanical documentation describes the real module truthfully and tracks precision/telematics ambitions separately

38. `GAP-2026-04-23-AL` R&D and roadmap chapters are future-capability/backlog material currently living inside the manual
   Priority: high
   Related block: `P5`
   Evidence:
   - `docs/manual/25-research-development.md` and `docs/manual/32-roadmap.md` describe partnerships, patents, labs, commercialization paths and speculative future technologies rather than verified in-app capability
   Risk:
   - the manual continues to mix operational product truth with strategic aspiration and speculative backlog
   TODO:
   - convert still-relevant future capability claims from these chapters into explicit tracked roadmap/TODO items
   - later decide what should be archived, removed from the manual or retained only as internal planning material
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
