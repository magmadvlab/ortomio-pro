import type { SmartDevice, SmartDeviceAutomationLog } from '@/types'

export interface SmartDeviceAutomationAnalyticsSummary {
  totalEvents: number
  automatedCommands: number
  manualCommands: number
  commandTimeouts: number
  commandFailures: number
  nominalOutcomes: number
  warningOutcomes: number
  criticalOutcomes: number
  averageAckMs?: number
  nominalOutcomeRate?: number
}

export interface SmartDeviceAutomationDeviceAnalytics {
  deviceId: string
  deviceName: string
  scopeLabel: string
  automatedCommands: number
  commandTimeouts: number
  commandFailures: number
  nominalOutcomes: number
  warningOutcomes: number
  criticalOutcomes: number
  averageAckMs?: number
  nominalOutcomeRate?: number
}

export interface SmartDeviceAutomationScopeHotspot {
  deviceId: string
  deviceName: string
  scopeLabel: string
  severityScore: number
  commandTimeouts: number
  criticalOutcomes: number
  warningOutcomes: number
  averageAckMs?: number
}

export interface SmartDeviceAutomationScopeHistoryPoint {
  date: string
  label: string
  automatedCommands: number
  manualCommands: number
  nominalOutcomes: number
  warningOutcomes: number
  criticalOutcomes: number
  totalTargetLiters: number
  averageMoistureDelta?: number
}

export interface SmartDeviceAutomationScopeHistorySeries {
  scopeKey: string
  scopeLabel: string
  deviceIds: string[]
  severityScore: number
  warningOutcomes: number
  criticalOutcomes: number
  nominalOutcomeRate?: number
  averageMoistureDelta?: number
  totalTargetLiters: number
  points: SmartDeviceAutomationScopeHistoryPoint[]
}

export interface SmartDeviceAutomationRecommendation {
  id: string
  severity: 'high' | 'medium' | 'low'
  title: string
  message: string
  scopeLabel?: string
  deviceId?: string
}

export interface SmartDeviceAutomationBenchmarkScope {
  scopeKey: string
  scopeLabel: string
  deviceIds: string[]
  nominalOutcomeRate?: number
  averageMoistureDelta?: number
  severityScore: number
  totalTargetLiters: number
}

export interface SmartDeviceAutomationBenchmarkGap {
  scopeKey: string
  scopeLabel: string
  nominalOutcomeGap?: number
  moistureDeltaGap?: number
  severityGap: number
}

export interface SmartDeviceAutomationScopeAction {
  id: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  category: 'connectivity' | 'hydraulics' | 'rules' | 'sensors' | 'benchmark'
  deviceIds: string[]
  scopeKey?: string
  scopeLabel: string
  title: string
  action: string
  changes?: {
    autoMode?: boolean
    targetLitersDelta?: number
    targetLitersAbsolute?: number
    autoThresholdDelta?: number
    autoThresholdAbsolute?: number
  }
}

export interface SmartDeviceAutomationAppliedScopeActionDeviceChange {
  deviceId: string
  deviceName: string
  beforeTargetLiters?: number
  afterTargetLiters?: number
  beforeAutoThreshold?: number
  afterAutoThreshold?: number
  beforeAutoMode?: boolean
  afterAutoMode?: boolean
}

export interface SmartDeviceAutomationAppliedScopeAction {
  executionId: string
  title: string
  scopeLabel: string
  priority: NonNullable<SmartDeviceAutomationScopeAction['priority']>
  category: NonNullable<SmartDeviceAutomationScopeAction['category']>
  appliedAt: string
  rolledBack: boolean
  deviceChanges: SmartDeviceAutomationAppliedScopeActionDeviceChange[]
}

export interface SmartDeviceAutomationAnalytics {
  summary: SmartDeviceAutomationAnalyticsSummary
  perDevice: Record<string, SmartDeviceAutomationDeviceAnalytics>
  hotspots: SmartDeviceAutomationScopeHotspot[]
  scopeHistory: SmartDeviceAutomationScopeHistorySeries[]
  recommendations: SmartDeviceAutomationRecommendation[]
  scopeActions: SmartDeviceAutomationScopeAction[]
  appliedScopeActions: SmartDeviceAutomationAppliedScopeAction[]
  benchmark: {
    bestScope?: SmartDeviceAutomationBenchmarkScope
    worstScope?: SmartDeviceAutomationBenchmarkScope
    topGaps: SmartDeviceAutomationBenchmarkGap[]
  }
}

const EMPTY_ANALYTICS: SmartDeviceAutomationAnalytics = {
  summary: {
    totalEvents: 0,
    automatedCommands: 0,
    manualCommands: 0,
    commandTimeouts: 0,
    commandFailures: 0,
    nominalOutcomes: 0,
    warningOutcomes: 0,
    criticalOutcomes: 0,
  },
  perDevice: {},
  hotspots: [],
  scopeHistory: [],
  recommendations: [],
  scopeActions: [],
  appliedScopeActions: [],
  benchmark: {
    topGaps: [],
  },
}

function roundMetric(value?: number): number | undefined {
  if (value === undefined || Number.isNaN(value)) {
    return undefined
  }

  return Math.round(value * 10) / 10
}

function getLatencyMs(log: SmartDeviceAutomationLog): number | undefined {
  const rawValue = log.metadata?.latencyMs
  if (typeof rawValue === 'number' && !Number.isNaN(rawValue)) {
    return rawValue
  }

  if (typeof rawValue === 'string') {
    const numericValue = Number(rawValue)
    return Number.isNaN(numericValue) ? undefined : numericValue
  }

  return undefined
}

function getMetadataString(log: SmartDeviceAutomationLog, key: string): string | undefined {
  const value = log.metadata?.[key]
  return typeof value === 'string' ? value : undefined
}

function getMetadataNumber(log: SmartDeviceAutomationLog, key: string): number | undefined {
  const value = log.metadata?.[key]
  return typeof value === 'number' && !Number.isNaN(value) ? value : undefined
}

function getMetadataBoolean(log: SmartDeviceAutomationLog, key: string): boolean | undefined {
  const value = log.metadata?.[key]
  return typeof value === 'boolean' ? value : undefined
}

function getScopeLabel(log: SmartDeviceAutomationLog, device?: SmartDevice): string {
  if (log.scopeId && log.scopeType) {
    return `${log.scopeType}: ${log.scopeId}`
  }

  if (device?.scopeId && device.scopeType) {
    return `${device.scopeType}: ${device.scopeId}`
  }

  if (log.fieldRowId || device?.fieldRowId) return `field_row: ${log.fieldRowId ?? device?.fieldRowId}`
  if (log.zoneId || device?.zoneId) return `zone: ${log.zoneId ?? device?.zoneId}`
  if (log.treeId || device?.treeId) return `tree: ${log.treeId ?? device?.treeId}`
  if (log.plantId || device?.plantId) return `plant: ${log.plantId ?? device?.plantId}`

  return 'scope: n/d'
}

function buildRecentDayKeys(days: number): Array<{ key: string; label: string }> {
  const dayKeys: Array<{ key: string; label: string }> = []

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - index)
    const key = date.toISOString().slice(0, 10)
    const label = date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
    })
    dayKeys.push({ key, label })
  }

  return dayKeys
}

function getScopeDeviceConfig(deviceIds: string[], devicesById: Map<string, SmartDevice>) {
  const scopedDevices = deviceIds
    .map(deviceId => devicesById.get(deviceId))
    .filter((device): device is SmartDevice => Boolean(device))

  if (scopedDevices.length === 0) {
    return {
      averageTargetLiters: undefined,
      averageAutoThreshold: undefined,
    }
  }

  const targetSamples = scopedDevices
    .filter(device => device.targetLiters > 0)
    .map(device => device.targetLiters)
  const thresholdSamples = scopedDevices
    .filter(device => device.autoThreshold > 0)
    .map(device => device.autoThreshold)

  return {
    averageTargetLiters:
      targetSamples.length > 0
        ? roundMetric(targetSamples.reduce((sum, sample) => sum + sample, 0) / targetSamples.length)
        : undefined,
    averageAutoThreshold:
      thresholdSamples.length > 0
        ? roundMetric(thresholdSamples.reduce((sum, sample) => sum + sample, 0) / thresholdSamples.length)
        : undefined,
  }
}

function compareBestBenchmarkScope(
  left: SmartDeviceAutomationScopeHistorySeries,
  right: SmartDeviceAutomationScopeHistorySeries
) {
  const rightRate = right.nominalOutcomeRate ?? -1
  const leftRate = left.nominalOutcomeRate ?? -1
  if (rightRate !== leftRate) {
    return rightRate - leftRate
  }

  const rightDelta = right.averageMoistureDelta ?? -1
  const leftDelta = left.averageMoistureDelta ?? -1
  if (rightDelta !== leftDelta) {
    return rightDelta - leftDelta
  }

  return left.severityScore - right.severityScore
}

function compareWorstBenchmarkScope(
  left: SmartDeviceAutomationScopeHistorySeries,
  right: SmartDeviceAutomationScopeHistorySeries
) {
  if (right.severityScore !== left.severityScore) {
    return right.severityScore - left.severityScore
  }

  const leftRate = left.nominalOutcomeRate ?? 101
  const rightRate = right.nominalOutcomeRate ?? 101
  return leftRate - rightRate
}

export function buildSmartDeviceAutomationAnalytics(
  devices: SmartDevice[],
  logs: SmartDeviceAutomationLog[]
): SmartDeviceAutomationAnalytics {
  if (logs.length === 0) {
    return EMPTY_ANALYTICS
  }

  const devicesById = new Map(devices.map(device => [device.id, device]))
  const ackSamples: number[] = []
  const perDevice: Record<string, SmartDeviceAutomationDeviceAnalytics> = {}
  const recentDayKeys = buildRecentDayKeys(7)
  const recentDayKeySet = new Set(recentDayKeys.map(day => day.key))
  const rolledBackExecutionIds = new Set<string>()
  const appliedScopeActionAccumulator = new Map<
    string,
    {
      title: string
      scopeLabel: string
      priority: SmartDeviceAutomationScopeAction['priority']
      category: SmartDeviceAutomationScopeAction['category']
      appliedAt: string
      deviceChanges: SmartDeviceAutomationAppliedScopeActionDeviceChange[]
    }
  >()
  const scopeSeriesAccumulator = new Map<
    string,
    {
      scopeLabel: string
      deviceIds: Set<string>
      severityScore: number
      nominalOutcomes: number
      warningOutcomes: number
      criticalOutcomes: number
      moistureDeltaSamples: number[]
      totalTargetLiters: number
      points: Record<
        string,
        {
          automatedCommands: number
          manualCommands: number
          nominalOutcomes: number
          warningOutcomes: number
          criticalOutcomes: number
          totalTargetLiters: number
          moistureDeltaSamples: number[]
        }
      >
    }
  >()

  const summary: SmartDeviceAutomationAnalyticsSummary = {
    totalEvents: logs.length,
    automatedCommands: 0,
    manualCommands: 0,
    commandTimeouts: 0,
    commandFailures: 0,
    nominalOutcomes: 0,
    warningOutcomes: 0,
    criticalOutcomes: 0,
  }

  for (const log of logs) {
    const device = devicesById.get(log.deviceId)
    const scopeLabel = getScopeLabel(log, device)
    const scopeActionExecutionId = getMetadataString(log, 'scopeActionExecutionId')
    const scopeActionMode = getMetadataString(log, 'scopeActionMode')
    const rollbackOfExecutionId = getMetadataString(log, 'scopeActionRollbackOfExecutionId')

    if (scopeActionMode === 'rollback' && rollbackOfExecutionId) {
      rolledBackExecutionIds.add(rollbackOfExecutionId)
    }

    if (scopeActionExecutionId && scopeActionMode === 'apply') {
      const accumulator =
        appliedScopeActionAccumulator.get(scopeActionExecutionId) ??
        {
          title: getMetadataString(log, 'scopeActionTitle') ?? 'Correzione scope applicata',
          scopeLabel,
          priority:
            (getMetadataString(log, 'scopeActionPriority') as SmartDeviceAutomationScopeAction['priority']) ??
            'medium',
          category:
            (getMetadataString(log, 'scopeActionCategory') as SmartDeviceAutomationScopeAction['category']) ??
            'rules',
          appliedAt: log.eventAt,
          deviceChanges: [],
        }

      if (!accumulator.deviceChanges.some(change => change.deviceId === log.deviceId)) {
        accumulator.deviceChanges.push({
          deviceId: log.deviceId,
          deviceName: device?.name ?? `Device ${log.deviceId}`,
          beforeTargetLiters: getMetadataNumber(log, 'beforeTargetLiters'),
          afterTargetLiters: getMetadataNumber(log, 'afterTargetLiters'),
          beforeAutoThreshold: getMetadataNumber(log, 'beforeAutoThreshold'),
          afterAutoThreshold: getMetadataNumber(log, 'afterAutoThreshold'),
          beforeAutoMode: getMetadataBoolean(log, 'beforeAutoMode'),
          afterAutoMode: getMetadataBoolean(log, 'afterAutoMode'),
        })
      }

      appliedScopeActionAccumulator.set(scopeActionExecutionId, accumulator)
    }

    const deviceAnalytics =
      perDevice[log.deviceId] ??
      {
        deviceId: log.deviceId,
        deviceName: device?.name ?? `Device ${log.deviceId}`,
        scopeLabel,
        automatedCommands: 0,
        commandTimeouts: 0,
        commandFailures: 0,
        nominalOutcomes: 0,
        warningOutcomes: 0,
        criticalOutcomes: 0,
      }

    if (log.eventType === 'command_sent') {
      if (log.source === 'automation') {
        summary.automatedCommands += 1
        deviceAnalytics.automatedCommands += 1
      } else if (log.source === 'manual') {
        summary.manualCommands += 1
      }
    }

    if (log.commandStatus === 'timeout') {
      summary.commandTimeouts += 1
      deviceAnalytics.commandTimeouts += 1
    }

    if (log.commandStatus === 'failed') {
      summary.commandFailures += 1
      deviceAnalytics.commandFailures += 1
    }

    if (log.irrigationOutcome === 'nominal') {
      summary.nominalOutcomes += 1
      deviceAnalytics.nominalOutcomes += 1
    } else if (log.irrigationOutcome === 'warning') {
      summary.warningOutcomes += 1
      deviceAnalytics.warningOutcomes += 1
    } else if (log.irrigationOutcome === 'critical') {
      summary.criticalOutcomes += 1
      deviceAnalytics.criticalOutcomes += 1
    }

    const latencyMs = getLatencyMs(log)
    if (latencyMs !== undefined) {
      ackSamples.push(latencyMs)
      const currentSamples = deviceAnalytics.averageAckMs ? [deviceAnalytics.averageAckMs, latencyMs] : [latencyMs]
      deviceAnalytics.averageAckMs = roundMetric(
        currentSamples.reduce((sum, sample) => sum + sample, 0) / currentSamples.length
      )
    }

    const totalOutcomes =
      deviceAnalytics.nominalOutcomes +
      deviceAnalytics.warningOutcomes +
      deviceAnalytics.criticalOutcomes

    deviceAnalytics.nominalOutcomeRate =
      totalOutcomes > 0
        ? roundMetric((deviceAnalytics.nominalOutcomes / totalOutcomes) * 100)
        : undefined

    perDevice[log.deviceId] = deviceAnalytics

    const dayKey = log.eventAt.slice(0, 10)
    if (!recentDayKeySet.has(dayKey)) {
      continue
    }

    const scopeHistoryLabel = getScopeLabel(log, device)
    const scopeKey = `${log.scopeType ?? 'scope'}:${log.scopeId ?? log.fieldRowId ?? log.zoneId ?? log.treeId ?? log.plantId ?? log.deviceId}`
    const scopeAccumulator =
      scopeSeriesAccumulator.get(scopeKey) ??
      {
        scopeLabel: scopeHistoryLabel,
        deviceIds: new Set<string>(),
        severityScore: 0,
        nominalOutcomes: 0,
        warningOutcomes: 0,
        criticalOutcomes: 0,
        moistureDeltaSamples: [],
        totalTargetLiters: 0,
        points: {},
      }

    const dayPoint =
      scopeAccumulator.points[dayKey] ??
      {
        automatedCommands: 0,
        manualCommands: 0,
        nominalOutcomes: 0,
        warningOutcomes: 0,
        criticalOutcomes: 0,
        totalTargetLiters: 0,
        moistureDeltaSamples: [],
      }

    scopeAccumulator.deviceIds.add(log.deviceId)

    if (log.eventType === 'command_sent') {
      if (log.source === 'automation') {
        dayPoint.automatedCommands += 1
      } else if (log.source === 'manual') {
        dayPoint.manualCommands += 1
      }
    }

    if (log.irrigationOutcome === 'nominal') {
      dayPoint.nominalOutcomes += 1
      scopeAccumulator.nominalOutcomes += 1
    } else if (log.irrigationOutcome === 'warning') {
      dayPoint.warningOutcomes += 1
      scopeAccumulator.warningOutcomes += 1
      scopeAccumulator.severityScore += 2
    } else if (log.irrigationOutcome === 'critical') {
      dayPoint.criticalOutcomes += 1
      scopeAccumulator.criticalOutcomes += 1
      scopeAccumulator.severityScore += 4
    }

    if (log.commandStatus === 'timeout' || log.commandStatus === 'failed') {
      scopeAccumulator.severityScore += 3
    }

    if (log.targetLiters !== undefined) {
      dayPoint.totalTargetLiters += log.targetLiters
      scopeAccumulator.totalTargetLiters += log.targetLiters
    }

    if (log.irrigationDeltaMoisture !== undefined) {
      dayPoint.moistureDeltaSamples.push(log.irrigationDeltaMoisture)
      scopeAccumulator.moistureDeltaSamples.push(log.irrigationDeltaMoisture)
    }

    scopeAccumulator.points[dayKey] = dayPoint
    scopeSeriesAccumulator.set(scopeKey, scopeAccumulator)
  }

  summary.averageAckMs =
    ackSamples.length > 0
      ? roundMetric(ackSamples.reduce((sum, sample) => sum + sample, 0) / ackSamples.length)
      : undefined

  const totalOutcomes =
    summary.nominalOutcomes + summary.warningOutcomes + summary.criticalOutcomes
  summary.nominalOutcomeRate =
    totalOutcomes > 0
      ? roundMetric((summary.nominalOutcomes / totalOutcomes) * 100)
      : undefined

  const hotspots = Object.values(perDevice)
    .map(deviceAnalytics => ({
      deviceId: deviceAnalytics.deviceId,
      deviceName: deviceAnalytics.deviceName,
      scopeLabel: deviceAnalytics.scopeLabel,
      severityScore:
        deviceAnalytics.criticalOutcomes * 4 +
        deviceAnalytics.warningOutcomes * 2 +
        deviceAnalytics.commandTimeouts * 3 +
        deviceAnalytics.commandFailures * 3,
      commandTimeouts: deviceAnalytics.commandTimeouts,
      criticalOutcomes: deviceAnalytics.criticalOutcomes,
      warningOutcomes: deviceAnalytics.warningOutcomes,
      averageAckMs: deviceAnalytics.averageAckMs,
    }))
    .filter(hotspot => hotspot.severityScore > 0)
    .sort((left, right) => right.severityScore - left.severityScore)
    .slice(0, 4)

  const scopeHistory = Array.from(scopeSeriesAccumulator.entries())
    .map(([scopeKey, scopeAccumulator]) => {
      const points = recentDayKeys.map(day => {
        const point = scopeAccumulator.points[day.key]
        return {
          date: day.key,
          label: day.label,
          automatedCommands: point?.automatedCommands ?? 0,
          manualCommands: point?.manualCommands ?? 0,
          nominalOutcomes: point?.nominalOutcomes ?? 0,
          warningOutcomes: point?.warningOutcomes ?? 0,
          criticalOutcomes: point?.criticalOutcomes ?? 0,
          totalTargetLiters: roundMetric(point?.totalTargetLiters) ?? 0,
          averageMoistureDelta:
            point && point.moistureDeltaSamples.length > 0
              ? roundMetric(
                  point.moistureDeltaSamples.reduce((sum, sample) => sum + sample, 0) /
                    point.moistureDeltaSamples.length
                )
              : undefined,
        }
      })

      const totalOutcomes =
        scopeAccumulator.nominalOutcomes +
        scopeAccumulator.warningOutcomes +
        scopeAccumulator.criticalOutcomes

      return {
        scopeKey,
        scopeLabel: scopeAccumulator.scopeLabel,
        deviceIds: Array.from(scopeAccumulator.deviceIds),
        severityScore: scopeAccumulator.severityScore,
        warningOutcomes: scopeAccumulator.warningOutcomes,
        criticalOutcomes: scopeAccumulator.criticalOutcomes,
        nominalOutcomeRate:
          totalOutcomes > 0
            ? roundMetric((scopeAccumulator.nominalOutcomes / totalOutcomes) * 100)
            : undefined,
        averageMoistureDelta:
          scopeAccumulator.moistureDeltaSamples.length > 0
            ? roundMetric(
                scopeAccumulator.moistureDeltaSamples.reduce((sum, sample) => sum + sample, 0) /
                  scopeAccumulator.moistureDeltaSamples.length
              )
            : undefined,
        totalTargetLiters: roundMetric(scopeAccumulator.totalTargetLiters) ?? 0,
        points,
      }
    })
    .sort((left, right) => {
      if (right.severityScore !== left.severityScore) {
        return right.severityScore - left.severityScore
      }

      return right.totalTargetLiters - left.totalTargetLiters
    })
    .slice(0, 6)

  const recommendations: SmartDeviceAutomationRecommendation[] = []

  for (const deviceAnalytics of Object.values(perDevice)) {
    if (deviceAnalytics.commandTimeouts >= 2) {
      recommendations.push({
        id: `timeouts:${deviceAnalytics.deviceId}`,
        severity: 'high',
        title: 'Troppi timeout comando',
        message: `Verifica connettivita, webhook e conferma telemetrica su ${deviceAnalytics.deviceName}. I timeout stanno degradando l'affidabilita della regola.`,
        scopeLabel: deviceAnalytics.scopeLabel,
        deviceId: deviceAnalytics.deviceId,
      })
    }

    if ((deviceAnalytics.averageAckMs ?? 0) >= 7000) {
      recommendations.push({
        id: `ack:${deviceAnalytics.deviceId}`,
        severity: 'medium',
        title: 'Ack troppo lento',
        message: `La latenza media di conferma su ${deviceAnalytics.deviceName} e alta. Riduci il timeout operativo o verifica il canale cloud.`,
        scopeLabel: deviceAnalytics.scopeLabel,
        deviceId: deviceAnalytics.deviceId,
      })
    }

    if (
      deviceAnalytics.automatedCommands >= 3 &&
      deviceAnalytics.nominalOutcomeRate !== undefined &&
      deviceAnalytics.nominalOutcomeRate < 60
    ) {
      recommendations.push({
        id: `success:${deviceAnalytics.deviceId}`,
        severity: 'high',
        title: 'Regola con esiti deboli',
        message: `Lo scope ${deviceAnalytics.scopeLabel} chiude troppi cicli con warning o criticita. Conviene ricalibrare soglia di avvio e target dinamico.`,
        scopeLabel: deviceAnalytics.scopeLabel,
        deviceId: deviceAnalytics.deviceId,
      })
    }
  }

  for (const scope of scopeHistory) {
    if ((scope.averageMoistureDelta ?? 0) < 2 && scope.totalTargetLiters >= 20) {
      recommendations.push({
        id: `delta:${scope.scopeKey}`,
        severity: 'medium',
        title: 'Delta umidita basso',
        message: `Su ${scope.scopeLabel} il suolo reagisce poco rispetto ai litri erogati. Controlla uniformita della linea, infiltrazione e profondita dei sensori.`,
        scopeLabel: scope.scopeLabel,
      })
    }

    if (scope.criticalOutcomes >= 2) {
      recommendations.push({
        id: `critical:${scope.scopeKey}`,
        severity: 'high',
        title: 'Scope con outcome critici ricorrenti',
        message: `Lo scope ${scope.scopeLabel} accumula criticita ripetute. Serve revisione prioritaria di target, pressione e condizioni microclimatiche.`,
        scopeLabel: scope.scopeLabel,
      })
    }

    if (
      scope.nominalOutcomeRate !== undefined &&
      scope.nominalOutcomeRate >= 85 &&
      scope.severityScore <= 2
    ) {
      recommendations.push({
        id: `stable:${scope.scopeKey}`,
        severity: 'low',
        title: 'Scope stabile',
        message: `Le regole su ${scope.scopeLabel} stanno lavorando bene. Puoi usarlo come benchmark per gli altri filari o zone.`,
        scopeLabel: scope.scopeLabel,
      })
    }
  }

  recommendations.sort((left, right) => {
    const weight = { high: 3, medium: 2, low: 1 }
    return weight[right.severity] - weight[left.severity]
  })

  const bestScope =
    [...scopeHistory]
      .filter(scope => scope.nominalOutcomeRate !== undefined)
      .sort(compareBestBenchmarkScope)[0]

  const worstScope =
    [...scopeHistory].sort(compareWorstBenchmarkScope)[0]

  const benchmarkTopGaps =
    bestScope === undefined
      ? []
      : scopeHistory
          .filter(scope => scope.scopeKey !== bestScope.scopeKey)
          .map(scope => ({
            scopeKey: scope.scopeKey,
            scopeLabel: scope.scopeLabel,
            nominalOutcomeGap:
              bestScope.nominalOutcomeRate !== undefined && scope.nominalOutcomeRate !== undefined
                ? roundMetric(bestScope.nominalOutcomeRate - scope.nominalOutcomeRate)
                : undefined,
            moistureDeltaGap:
              bestScope.averageMoistureDelta !== undefined && scope.averageMoistureDelta !== undefined
                ? roundMetric(bestScope.averageMoistureDelta - scope.averageMoistureDelta)
                : undefined,
            severityGap: Math.max(0, scope.severityScore - bestScope.severityScore),
          }))
          .sort((left, right) => {
            if (right.severityGap !== left.severityGap) {
              return right.severityGap - left.severityGap
            }

            const rightNominalGap = right.nominalOutcomeGap ?? -1
            const leftNominalGap = left.nominalOutcomeGap ?? -1
            return rightNominalGap - leftNominalGap
          })
          .slice(0, 3)
  const bestScopeDeviceConfig =
    bestScope !== undefined ? getScopeDeviceConfig(bestScope.deviceIds, devicesById) : undefined

  const scopeActions: SmartDeviceAutomationScopeAction[] = []
  const appliedScopeActions = Array.from(appliedScopeActionAccumulator.entries())
    .map(([executionId, appliedScopeAction]) => ({
      executionId,
      title: appliedScopeAction.title,
      scopeLabel: appliedScopeAction.scopeLabel,
      priority: appliedScopeAction.priority,
      category: appliedScopeAction.category,
      appliedAt: appliedScopeAction.appliedAt,
      rolledBack: rolledBackExecutionIds.has(executionId),
      deviceChanges: appliedScopeAction.deviceChanges,
    }))
    .sort((left, right) => new Date(right.appliedAt).getTime() - new Date(left.appliedAt).getTime())
    .slice(0, 6)

  for (const deviceAnalytics of Object.values(perDevice)) {
    if (deviceAnalytics.commandTimeouts >= 2) {
      scopeActions.push({
        id: `action-timeout:${deviceAnalytics.deviceId}`,
        priority: 'urgent',
        category: 'connectivity',
        deviceIds: [deviceAnalytics.deviceId],
        scopeLabel: deviceAnalytics.scopeLabel,
        title: 'Stabilizzare la conferma cloud',
        action: `Verifica webhook, latenza rete e conferma telemetrica per ${deviceAnalytics.deviceName}. Finche i timeout restano alti, le regole automatiche non sono affidabili.`,
        changes: {
          autoMode: false,
        },
      })
    }

    if ((deviceAnalytics.averageAckMs ?? 0) >= 7000) {
      scopeActions.push({
        id: `action-ack:${deviceAnalytics.deviceId}`,
        priority: 'high',
        category: 'connectivity',
        deviceIds: [deviceAnalytics.deviceId],
        scopeLabel: deviceAnalytics.scopeLabel,
        title: 'Ridurre il tempo di ack',
        action: `Su ${deviceAnalytics.scopeLabel} l'ack medio e lento. Conviene ridurre il roundtrip cloud o aumentare il timeout operativo solo dopo aver verificato il canale ThingsBoard.`,
        changes: {
          autoMode: false,
        },
      })
    }
  }

  for (const scope of scopeHistory) {
    if ((scope.averageMoistureDelta ?? 0) < 2 && scope.totalTargetLiters >= 20) {
      scopeActions.push({
        id: `action-delta:${scope.scopeKey}`,
        priority: 'high',
        category: 'hydraulics',
        deviceIds: scope.deviceIds,
        scopeKey: scope.scopeKey,
        scopeLabel: scope.scopeLabel,
        title: 'Verificare uniformita idraulica',
        action: `Il suolo reagisce poco ai litri erogati su ${scope.scopeLabel}. Controlla pressione linea, portata reale, intasamenti e posizione/profondita del sensore.`,
        changes: {
          targetLitersDelta: -2,
        },
      })
    }

    if (scope.criticalOutcomes >= 2) {
      scopeActions.push({
        id: `action-critical:${scope.scopeKey}`,
        priority: 'urgent',
        category: 'rules',
        deviceIds: scope.deviceIds,
        scopeKey: scope.scopeKey,
        scopeLabel: scope.scopeLabel,
        title: 'Ricalibrare la regola irrigua',
        action: `Questo scope accumula outcome critici. Riduci rischio operativo rivedendo soglia di avvio, target dinamico e blocchi fungini prima di lasciare la zona in pieno automatico.`,
        changes: {
          autoMode: false,
        },
      })
    }

    if (
      scope.nominalOutcomeRate !== undefined &&
      scope.nominalOutcomeRate < 60 &&
      scope.totalTargetLiters >= 10
    ) {
      scopeActions.push({
        id: `action-rate:${scope.scopeKey}`,
        priority: 'high',
        category: 'rules',
        deviceIds: scope.deviceIds,
        scopeKey: scope.scopeKey,
        scopeLabel: scope.scopeLabel,
        title: 'Ritarare target e soglia',
        action: `Lo storico su ${scope.scopeLabel} mostra pochi outcome nominali. Conviene ridurre i litri target o rivedere la soglia di partenza per evitare cicli poco efficaci.`,
        changes: {
          targetLitersDelta: -3,
          autoThresholdDelta: 5,
        },
      })
    }
  }

  if (bestScope !== undefined) {
    scopeActions.push({
      id: `action-benchmark:${bestScope.scopeKey}`,
      priority: 'low',
      category: 'benchmark',
      deviceIds: bestScope.deviceIds,
      scopeKey: bestScope.scopeKey,
      scopeLabel: bestScope.scopeLabel,
      title: 'Usare questo scope come riferimento',
      action: `Le regole su ${bestScope.scopeLabel} stanno performando meglio delle altre. Usa target, latenza e risposta suolo di questo scope come benchmark operativo.`,
    })
  }

  for (const gap of benchmarkTopGaps) {
    if (gap.severityGap >= 3 || (gap.nominalOutcomeGap ?? 0) >= 15 || (gap.moistureDeltaGap ?? 0) >= 2) {
      scopeActions.push({
        id: `action-gap:${gap.scopeKey}`,
        priority: gap.severityGap >= 5 ? 'urgent' : 'medium',
        category: 'benchmark',
        deviceIds:
          scopeHistory.find(scope => scope.scopeKey === gap.scopeKey)?.deviceIds ?? [],
        scopeKey: gap.scopeKey,
        scopeLabel: gap.scopeLabel,
        title: 'Recuperare il gap rispetto al benchmark',
        action: `Questo scope e sotto benchmark. Allinealo al riferimento correggendo target, tempi di chiusura e risposta del suolo prima di aumentare l'automazione.`,
        changes: {
          targetLitersAbsolute: bestScopeDeviceConfig?.averageTargetLiters,
          autoThresholdAbsolute: bestScopeDeviceConfig?.averageAutoThreshold,
        },
      })
    }
  }

  scopeActions.sort((left, right) => {
    const weight = { urgent: 4, high: 3, medium: 2, low: 1 }
    return weight[right.priority] - weight[left.priority]
  })

  return {
    summary,
    perDevice,
    hotspots,
    scopeHistory,
    recommendations: recommendations.slice(0, 6),
    scopeActions: scopeActions.slice(0, 8),
    appliedScopeActions,
    benchmark: {
      bestScope,
      worstScope,
      topGaps: benchmarkTopGaps,
    },
  }
}
