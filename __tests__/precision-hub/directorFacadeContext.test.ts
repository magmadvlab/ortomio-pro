import test from 'node:test'
import assert from 'node:assert/strict'

import { directorService } from '@/services/directorService'
import type { DailyBriefing } from '@/services/directorService'
import type { GardenTask } from '@/types'

const originalGetDailyBriefing = directorService.getDailyBriefing.bind(directorService)
const originalGetLegacyDailyPlanBridge = directorService.getLegacyDailyPlanBridge.bind(directorService)
const originalStorageProvider = (directorService as any).storageProvider

const restoreDirectorService = () => {
  directorService.getDailyBriefing = originalGetDailyBriefing
  directorService.getLegacyDailyPlanBridge = originalGetLegacyDailyPlanBridge
  ;(directorService as any).storageProvider = originalStorageProvider
}

test.afterEach(restoreDirectorService)

const briefing: DailyBriefing = {
  date: new Date('2026-04-24T08:00:00.000Z'),
  gardenId: 'garden-1',
  gardenName: 'Vigneto Nord',
  summary: 'Briefing operativo',
  criticalActions: [
    {
      id: 'action-1',
      type: 'HIGH',
      title: 'Controllare stress idrico',
      description: 'Verificare la zona nord',
      urgency: 80,
      impact: 75,
      feasibility: 70,
      cost: 20,
      priorityScore: 82,
      dependencies: [],
      source: 'ai_suggestion',
      reasoning: 'Stress crescente',
    },
  ],
  transversalQueue: [
    {
      id: 'queue-1',
      source: 'health',
      title: 'Ispezione fogliare',
      description: 'Verifica pressione fungina',
      scopeLabel: 'Zona Nord',
      focus: 'health',
      priorityScore: 88,
      priorityConfidence: 0.74,
      missingSignals: ['local_sensor_observation'],
      urgencyLabel: 'immediate',
      metadata: {
        decisionExplanation: {
          source: 'health',
          focus: 'health',
          profileResolution: {
            profileId: 'vineyard',
            matchedBy: 'explicit',
          },
          signals: {
            coveredP0Signals: [],
            requiredP0Signals: [],
            missingP0Signals: [],
          },
          contextRationale: [],
        },
      },
    },
  ],
  weatherSummary: {},
  agronomicInsights: {},
  recommendations: ['Apri planner'],
  stats: {
    totalSuggestions: 1,
    criticalCount: 0,
    highCount: 1,
    avgConfidence: 0.74,
  },
}

test('director facade builds bounded chat context from daily briefing', async () => {
  directorService.getDailyBriefing = async () => briefing

  const context = await directorService.getChatContext('user-1', 'garden-1')

  assert.equal(context.scope.gardenId, 'garden-1')
  assert.equal(context.scope.gardenName, 'Vigneto Nord')
  assert.equal(context.scope.primaryScope, 'site')
  assert.equal(context.currentPriorities[0].id, 'queue-1')
  assert.equal(context.currentPriorities[0].scopeLabel, 'Zona Nord')
  assert.deepEqual(context.missingSignals, ['local_sensor_observation'])
  assert.equal(context.routingHints[0].route, '/app/planner')
  assert.equal(context.routingHints[0].suggestedAction, 'review-now')
  assert.equal(context.decisionExplanations[0].queueItemId, 'queue-1')
})

test('director facade exposes executable task launch contexts without mutating tasks', async () => {
  const tasks: GardenTask[] = [
    {
      id: 'task-1',
      gardenId: 'garden-1',
      plantName: 'Pomodoro',
      taskType: 'Fertilize',
      date: '2026-04-24',
      completed: false,
      priority: 'High',
      zoneId: 'zone-1',
      rowId: 'row-1',
      rowNumber: 3,
    },
    {
      id: 'task-2',
      gardenId: 'garden-1',
      plantName: 'Lattuga',
      taskType: 'Photo',
      date: '2026-04-24',
      completed: false,
      priority: 'Low',
    },
  ] as GardenTask[]
  ;(directorService as any).storageProvider = {
    getTasks: async () => tasks,
  }

  const context = await directorService.getExecutionLaunchContext('garden-1')

  assert.equal(context.tasks.length, 1)
  assert.equal(context.tasks[0].taskId, 'task-1')
  assert.equal(context.tasks[0].context.route, 'nutrition')
  assert.equal(context.tasks[0].context.zoneId, 'zone-1')
  assert.equal(context.tasks[0].context.rowId, 'row-1')
  assert.equal(context.tasks[0].context.rowNumber, '3')
  assert.ok(context.tasks[0].url.startsWith('/app/nutrition?'))
  assert.equal(tasks[0].completed, false)
})

test('director facade exposes decision memory summary and recent entries', async () => {
  ;(directorService as any).storageProvider = {
    getUserPreference: async () => [
      {
        id: 'ledger-1',
        gardenId: 'garden-1',
        queueItemId: 'queue-1',
        source: 'health',
        focus: 'health',
        status: 'task_created',
        createdAt: '2026-04-24T08:00:00.000Z',
        updatedAt: '2026-04-24T08:00:00.000Z',
        decisionSnapshot: {
          source: 'health',
          focus: 'health',
          capturedAt: '2026-04-24T08:00:00.000Z',
        },
      },
    ],
  }

  const context = await directorService.getDecisionMemoryContext('garden-1')

  assert.equal(context.summary.totalEntries, 1)
  assert.equal(context.summary.taskCreated, 1)
  assert.equal(context.entries[0].queueItemId, 'queue-1')
})

test('director legacy bridge remains callable as facade method', () => {
  assert.equal(typeof directorService.getLegacyDailyPlanBridge, 'function')
})

test('director field-row insights expose canonical row scope descriptor', async () => {
  directorService.getLegacyDailyPlanBridge = async () => ({
    date: '2026-04-24',
    urgentAlerts: [],
    lifecycleTasks: [
      {
        id: 'life-1',
        plantName: 'Sangiovese',
        phase: 'Produzione',
        adviceTitle: 'Gestione chioma',
        advice: 'Controllare sviluppo vegetativo',
        priority: 'Medium',
        suggestedDate: '2026-04-24',
        actionType: 'Maintenance',
      },
    ],
    nutrientTasks: [],
    healthTasks: [],
    climateWarnings: [{ type: 'Rain', severity: 'Medium', message: 'Rischio pioggia', recommendation: 'Monitorare' }],
    baselinePrompts: [
      { id: 'prompt-1', category: 'seasonal_baseline', priority: 'Medium', title: 'Controllo filare', body: '', options: [] },
    ],
    lunarAdvice: {
      phase: 'waxing',
      phaseName: 'Luna crescente',
      advice: 'favorevole alla crescita vegetativa',
      idealFor: [],
    },
    priority: 'Medium',
  } as any)

  const insights = await directorService.getFieldRowDirectorInsights({
    garden: { id: 'garden-1', name: 'Vigneto Nord' } as any,
    tasks: [],
    fieldRow: {
      id: 'row-1',
      name: 'Filare 1',
      zoneId: 'zone-1',
      cultivar: 'Sangiovese',
    },
  })

  assert.equal(insights.scope.primaryScope, 'row')
  assert.equal(insights.scope.gardenId, 'garden-1')
  assert.equal(insights.scope.zoneId, 'zone-1')
  assert.equal(insights.scope.rowId, 'row-1')
  assert.equal(insights.scope.fieldRowId, 'row-1')
  assert.equal(insights.scope.rowName, 'Filare 1')
  assert.equal(insights.lifecyclePhase, 'Produzione')
  assert.deepEqual(insights.seasonalAdvice, ['Controllo filare'])
  assert.equal(insights.weatherAlerts[0], 'Rischio pioggia')
})
