import type { Garden, SmartDevice } from '@/types'
import {
  getScopedHealthMicroclimateSnapshot,
  type HealthMicroclimateSnapshot,
  type HealthRiskLevel,
} from '@/services/healthMicroclimateService'

export interface IrrigationScopeDiagnostics {
  deviceId: string
  scopeLabel: string
  resolutionLabel: string
  status: 'nominal' | 'warning' | 'critical'
  waterStress: HealthRiskLevel
  heatStress: HealthRiskLevel
  fungalPressure: HealthRiskLevel
  supportingSignals: string[]
  recommendation: string
  snapshot: HealthMicroclimateSnapshot
}

function getScopeLabel(device: SmartDevice): string {
  if (device.plantId) return `Pianta ${device.plantId}`
  if (device.treeId) return `Albero ${device.treeId}`
  if (device.fieldRowId) return `Filare ${device.fieldRowId}`
  if (device.zoneId) return `Zona ${device.zoneId}`
  return 'Scope non assegnato'
}

function getResolutionLabel(snapshot: HealthMicroclimateSnapshot): string {
  switch (snapshot.resolutionScopeType) {
    case 'plant':
      return 'Sensore diretto pianta'
    case 'tree':
      return 'Sensore diretto albero'
    case 'field_row':
      return 'Sensore diretto filare'
    case 'zone':
      return 'Sensore di zona'
    case 'garden':
      return 'Sensore garden-wide'
    default:
      return 'Telemetria non risolta'
  }
}

function getDiagnosticsStatus(snapshot: HealthMicroclimateSnapshot): IrrigationScopeDiagnostics['status'] {
  if (snapshot.waterStress === 'high') {
    return 'critical'
  }

  if (snapshot.waterStress === 'medium' || snapshot.heatStress === 'high') {
    return 'warning'
  }

  return 'nominal'
}

function buildRecommendation(device: SmartDevice, snapshot: HealthMicroclimateSnapshot): string {
  if (snapshot.waterStress === 'high') {
    return `Priorita irrigua alta su ${getScopeLabel(device)}: verifica tensione del suolo, portata reale e uniformita della linea.`
  }

  if (snapshot.waterStress === 'medium') {
    return `Stress idrico da confermare su ${getScopeLabel(device)}: confronta umidita di profilo e delta post-irrigazione.`
  }

  if (snapshot.heatStress === 'high') {
    return `Stress termico in aumento su ${getScopeLabel(device)}: controlla delta chioma-aria e distribuzione nelle ore calde.`
  }

  return `Scope ${getScopeLabel(device)} coerente con i dati disponibili. Mantieni il monitoraggio della risposta del suolo.`
}

export async function buildIrrigationScopeDiagnostics(
  garden: Garden,
  devices: SmartDevice[]
): Promise<Record<string, IrrigationScopeDiagnostics>> {
  const diagnosticsEntries = await Promise.all(
    devices.map(async (device) => {
      if (!device.zoneId && !device.fieldRowId && !device.treeId && !device.plantId) {
        return [device.id, null] as const
      }

      const snapshot = await getScopedHealthMicroclimateSnapshot(garden, {
        zoneId: device.zoneId,
        fieldRowId: device.fieldRowId,
        treeId: device.treeId,
        plantId: device.plantId,
        devices,
      }).catch(() => null)

      if (!snapshot?.hasRecentData) {
        return [device.id, null] as const
      }

      const diagnostics: IrrigationScopeDiagnostics = {
        deviceId: device.id,
        scopeLabel: getScopeLabel(device),
        resolutionLabel: getResolutionLabel(snapshot),
        status: getDiagnosticsStatus(snapshot),
        waterStress: snapshot.waterStress,
        heatStress: snapshot.heatStress,
        fungalPressure: snapshot.fungalPressure,
        supportingSignals: snapshot.supportingSignals,
        recommendation: buildRecommendation(device, snapshot),
        snapshot,
      }

      return [device.id, diagnostics] as const
    })
  )

  return Object.fromEntries(
    diagnosticsEntries.filter(
      (entry): entry is readonly [string, IrrigationScopeDiagnostics] => Boolean(entry[1])
    )
  )
}
