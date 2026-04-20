# ORTOMIO EXECUTION PLAN MASTER INDEX (2026-04-19)

## Purpose
This file is the cascading index for implementation plans produced during the current consolidation wave.

Rule:
- every focused implementation plan gets its own dated file
- this master index links the plan, its status, and the next decision point
- the master index is the first file to open when resuming work

## Current Execution Priority Map
1. `P1 Agronomic Context Refinement`
   Status: completed on 2026-04-19
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
   - next recommended: `P2-C operator evidence payloads`
   Current document:
   - `docs/reports/execution-plans/ORTOMIO_EXECUTION_PLAN_P2_FIELD_EXECUTION_LOOP_2026-04-19.md`

3. `P3 Documentation Truthfulness and Product Positioning`
   Status: pending
   Goal:
   - align stakeholder docs, current-state docs and manual with what the code can actually do after the latest agronomic and execution improvements
   Primary targets:
   - `docs/reports/ORTOMIO_APPLICATION_CURRENT_STATE_2026-04-18.md`
   - `docs/reports/ORTOMIO_STAKEHOLDER_PRESENTATION_2026-04-18.md`
   - `docs/manual/README.md`
   - `docs/manual/09-planner-ai-chat.md`
   - `docs/manual/10-activity-registry.md`

4. `P4 Type-check and contract cleanup`
   Status: pending
   Goal:
   - reduce residual contract drift and prepare a cleaner verification loop beyond precision-hub tests

## Companion Documents
- `docs/reports/ORTOMIO_TECHNICAL_IMPLEMENTATION_PLAN_2026-04-18.md`
- `docs/reports/PRECISION_AGRICULTURE_NEXT_EXECUTION_PLAN_2026-04-01.md`
- `docs/reports/ORTOMIO_APPLICATION_CURRENT_STATE_2026-04-18.md`
- `docs/reports/ORTOMIO_STAKEHOLDER_PRESENTATION_2026-04-18.md`

## Resume Protocol
When a new chat resumes work:
1. open this master index
2. open the latest active plan document
3. verify git status before editing
4. implement one bounded slice
5. update status in the active plan and, if priorities change, in this index
