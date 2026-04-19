# ORTOMIO EXECUTION PLAN P2: FIELD EXECUTION / MOBILE OPERATIONAL LOOP (2026-04-19)

## Goal
Strengthen the operational loop from agronomic recommendation to field execution and persisted outcome.

The target is not a new standalone module.
The target is a faster, clearer and more auditable flow across planner, execution pages and technical ledgers.

## Audit Snapshot
What already exists:
- task-aware launch routing for irrigation, nutrition, harvest and mechanical work
- execution bootstrap helpers in `services/taskExecutionLaunchService.ts` and `services/taskExecutionOrchestratorService.ts`
- post-action reconciliation in `services/taskExecutionPostActionService.ts`
- source-task trace markers in `services/taskExecutionTraceService.ts`
- unified field operation bridge in `services/operationExecutionBridgeService.ts`
- field operation UI surfaces in planner, quick operations and integrated row operations

Main gaps still visible in code:
- the planner exposes launch, but not execution readiness in a compact operational way
- missing signals, confidence and refined field context are not surfaced where the operator decides whether to execute now
- the loop is fragmented across pages and modals, especially for mobile use
- evidence capture exists in parts of the system, but not yet as one clearly communicated execution contract
- the documentation still under-explains what is operational today versus what is still partial

## Current Slice In Progress
### P2-A Planner execution readiness layer
Objective:
- expose a compact operational summary directly in agronomic task cards/list view

Deliverables:
- derive readiness, urgency, confidence, missing signals and compact context labels from agronomic queue task metadata
- show that summary in the planner task list before the operator opens the execution module
- keep the implementation metadata-driven so it can later be reused in calendar, mobile and execution headers

Primary files:
- `services/agronomicQueueTaskService.ts`
- `components/planner/TaskList.tsx`
- `__tests__/precision-hub/agronomicQueueTaskService.test.ts`

Exit criteria:
- agronomic queue tasks show a visible readiness state
- operator can distinguish ready vs partial vs blocked execution contexts
- no regression in precision-hub tests

## Next Slices After P2-A
### P2-B Execution banner enrichment
Goal:
- carry decision snapshot hints into execution pages so the operator sees why the task was opened

### P2-C Outcome and evidence normalization
Goal:
- converge toward a clearer contract for notes, measurements, photos and execution source

### P2-D Mobile fast path
Goal:
- identify one tap-first flow for operator actions on phone-sized screens

## Risks
- planner surfaces mix legacy and newer task flows, so improvements must stay additive
- not every task is agronomic-queue generated, therefore summaries must degrade gracefully
- documentation must avoid overselling offline or unified-ledger capabilities that are not fully closed yet

## Status
- 2026-04-19: audit completed
- 2026-04-19: P2-A implementation started
