import type { Garden, GardenTask, GardenZone } from '@/types'
import type { FieldRow } from '@/types/fieldRow'
import {
  getScopedHealthMicroclimateSnapshot,
  healthRiskLevelToScore,
  type HealthMicroclimateSnapshot,
  type HealthRiskLevel,
} from '@/services/healthMicroclimateService'
import type { SmartDevice } from '@/types'

type HealthScopeStorageProvider = {
  getGardenZones?: (gardenId: string) => Promise<GardenZone[]>
  getFieldRows?: (gardenId?: string, zoneId?: string) => Promise<FieldRow[]>
  getDevices?: (gardenId?: string) => Promise<SmartDevice[]>
}

export interface HealthScopeInsight {
  scopeType: 'zone' | 'field_row'
  scopeId: string
  scopeName: string
  zoneId?: string
  zoneName?: string
  plantCount: number
  plantNames: string[]
  fungalPressure: HealthRiskLevel
  waterStress: HealthRiskLevel
  heatStress: HealthRiskLevel
  score: number
  source: 'zone_sensor' | 'zone_inherited'
  supportingSignals: string[]
  note: string
}

function getScopedPlantNames(tasks: GardenTask[]): string[] {
  return Array.from(new Set(tasks.map((task) => task.plantName).filter(Boolean))).slice(0, 4)
}

function buildScopeNote(snapshot: HealthMicroclimateSnapshot, source: HealthScopeInsight['source']): string {
  const leadingSignals = snapshot.supportingSignals.slice(0, 3)
  const inheritedNote =
    source === 'zone_inherited' ? ' Usa sensori condivisi della zona di appartenenza.' : ''

  if (leadingSignals.length === 0) {
    return `Nessun segnale sensore recente oltre la classificazione aggregata.${inheritedNote}`
  }

  return `Segnali chiave: ${leadingSignals.join(', ')}.${inheritedNote}`
}

function buildScopeScore(snapshot: HealthMicroclimateSnapshot): number {
  return (
    healthRiskLevelToScore(snapshot.fungalPressure) * 3 +
    healthRiskLevelToScore(snapshot.waterStress) * 2 +
    healthRiskLevelToScore(snapshot.heatStress) * 2
  )
}

export async function getHealthScopeInsights(
  garden: Garden,
  tasks: GardenTask[],
  storageProvider?: HealthScopeStorageProvider | null
): Promise<HealthScopeInsight[]> {
  if (!garden?.id || !storageProvider) {
    return []
  }

  const activeTasks = tasks.filter((task) => !task.completed)
  const zoneTaskMap = new Map<string, GardenTask[]>()
  const rowTaskMap = new Map<string, GardenTask[]>()

  activeTasks.forEach((task) => {
    if (task.zoneId) {
      const zoneTasks = zoneTaskMap.get(task.zoneId) || []
      zoneTasks.push(task)
      zoneTaskMap.set(task.zoneId, zoneTasks)
    }

    if (task.rowId) {
      const rowTasks = rowTaskMap.get(task.rowId) || []
      rowTasks.push(task)
      rowTaskMap.set(task.rowId, rowTasks)
    }
  })

  const [zones, fieldRows] = await Promise.all([
    typeof storageProvider.getGardenZones === 'function'
      ? storageProvider.getGardenZones(garden.id).catch(() => [])
      : Promise.resolve([]),
    typeof storageProvider.getFieldRows === 'function'
      ? storageProvider.getFieldRows(garden.id).catch(() => [])
      : Promise.resolve([]),
  ])
  const devices =
    typeof storageProvider.getDevices === 'function'
      ? await storageProvider.getDevices(garden.id).catch(() => [])
      : []

  const zoneMap = new Map(zones.map((zone) => [zone.id, zone]))
  const fieldRowMap = new Map(fieldRows.map((row) => [row.id, row]))
  const relevantZoneIds = Array.from(
    new Set([
      ...zoneTaskMap.keys(),
      ...fieldRows.filter((row) => row.zoneId && rowTaskMap.has(row.id)).map((row) => row.zoneId as string),
    ])
  )

  const zoneSnapshots = new Map<string, HealthMicroclimateSnapshot>()
  await Promise.all(
    relevantZoneIds.map(async (zoneId) => {
      const snapshot = await getScopedHealthMicroclimateSnapshot(garden, {
        zoneId,
        devices,
      }).catch(() => null)
      if (snapshot?.hasRecentData) {
        zoneSnapshots.set(zoneId, snapshot)
      }
    })
  )

  const insights: HealthScopeInsight[] = []

  for (const zoneId of relevantZoneIds) {
    const snapshot = zoneSnapshots.get(zoneId)
    if (!snapshot) continue

    const zone = zoneMap.get(zoneId)
    const scopedTasks = zoneTaskMap.get(zoneId) || []
    insights.push({
      scopeType: 'zone',
      scopeId: zoneId,
      scopeName: zone?.name || `Zona ${zoneId.slice(0, 6)}`,
      plantCount: scopedTasks.length,
      plantNames: getScopedPlantNames(scopedTasks),
      fungalPressure: snapshot.fungalPressure,
      waterStress: snapshot.waterStress,
      heatStress: snapshot.heatStress,
      score: buildScopeScore(snapshot),
      source: 'zone_sensor',
      supportingSignals: snapshot.supportingSignals,
      note: buildScopeNote(snapshot, 'zone_sensor'),
    })
  }

  for (const [rowId, scopedTasks] of rowTaskMap.entries()) {
    const row = fieldRowMap.get(rowId)
    if (!row?.zoneId) continue

    const snapshot =
      (await getScopedHealthMicroclimateSnapshot(garden, {
        zoneId: row.zoneId,
        fieldRowId: rowId,
        devices,
      }).catch(() => null)) || zoneSnapshots.get(row.zoneId)
    if (!snapshot) continue

    const zone = zoneMap.get(row.zoneId)
    insights.push({
      scopeType: 'field_row',
      scopeId: rowId,
      scopeName: row.name,
      zoneId: row.zoneId,
      zoneName: zone?.name,
      plantCount: scopedTasks.length,
      plantNames: getScopedPlantNames(scopedTasks),
      fungalPressure: snapshot.fungalPressure,
      waterStress: snapshot.waterStress,
      heatStress: snapshot.heatStress,
      score: buildScopeScore(snapshot) + 1,
      source: snapshot.resolutionScopeType === 'field_row' ? 'zone_sensor' : 'zone_inherited',
      supportingSignals: snapshot.supportingSignals,
      note: buildScopeNote(
        snapshot,
        snapshot.resolutionScopeType === 'field_row' ? 'zone_sensor' : 'zone_inherited'
      ),
    })
  }

  return insights.sort((left, right) => right.score - left.score || right.plantCount - left.plantCount).slice(0, 5)
}
