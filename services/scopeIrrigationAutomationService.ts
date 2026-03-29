import type { SmartDevice } from '@/types'
import type { IrrigationScopeDiagnostics } from '@/services/irrigationScopeDiagnosticsService'

export interface ScopeIrrigationAutomationDecision {
  deviceId: string
  action: 'open_now' | 'close_now' | 'hold' | 'manual_review'
  trigger: NonNullable<SmartDevice['lastAutomationTrigger']>
  reason: string
  confidence: NonNullable<SmartDevice['lastAutomationConfidence']>
  recommendedTargetLiters?: number
}

function roundLiters(value: number): number {
  return Math.round(value * 10) / 10
}

export function evaluateScopeIrrigationAutomation(
  device: SmartDevice,
  diagnostics?: IrrigationScopeDiagnostics
): ScopeIrrigationAutomationDecision {
  if (device.deviceCategory !== 'irrigation_valve') {
    return {
      deviceId: device.id,
      action: 'hold',
      trigger: 'awaiting_data',
      reason: 'Automazione irrigua applicata solo alle valvole.',
      confidence: 'low',
    }
  }

  if (!device.autoMode) {
    return {
      deviceId: device.id,
      action: 'hold',
      trigger: 'stability_hold',
      reason: 'Automazione disabilitata sul dispositivo.',
      confidence: 'low',
    }
  }

  if (!diagnostics) {
    return {
      deviceId: device.id,
      action: 'manual_review',
      trigger: 'awaiting_data',
      reason: 'Nessun microclima scope-aware disponibile: non apro in automatico senza evidenza sensoriale.',
      confidence: 'low',
    }
  }

  if (device.lastCommandStatus === 'pending') {
    return {
      deviceId: device.id,
      action: 'hold',
      trigger: 'telemetry_block',
      reason: 'Comando precedente ancora in attesa di conferma telemetrica.',
      confidence: 'high',
    }
  }

  const snapshot = diagnostics.snapshot
  const thresholdGap = Math.max(4, device.autoThreshold * 0.2)
  const moistureOpenThreshold = Math.max(0, device.autoThreshold)
  const moistureCloseThreshold = Math.min(100, device.autoThreshold + thresholdGap)
  const moisture = device.moisture
  const litersBase = device.targetLiters > 0 ? device.targetLiters : 12
  const litersMultiplier =
    (diagnostics.waterStress === 'high' ? 1.35 : diagnostics.waterStress === 'medium' ? 1.15 : 1) +
    (diagnostics.heatStress === 'high' ? 0.2 : diagnostics.heatStress === 'medium' ? 0.1 : 0)
  const recommendedTargetLiters = roundLiters(Math.max(8, litersBase * litersMultiplier))
  const shouldCloseForTarget = device.isValveOpen && device.sessionLiters >= recommendedTargetLiters
  const highFungalBlock = diagnostics.fungalPressure === 'high' && diagnostics.waterStress !== 'high'
  const confirmedRecovery =
    diagnostics.waterStress === 'none' &&
    moisture >= moistureCloseThreshold &&
    (snapshot.soilTensionKpa === undefined || snapshot.soilTensionKpa < 70)

  if (shouldCloseForTarget) {
    return {
      deviceId: device.id,
      action: 'close_now',
      trigger: 'target_reached',
      reason: `Target dinamico raggiunto (${device.sessionLiters.toFixed(1)} / ${recommendedTargetLiters.toFixed(1)} L) sullo scope ${diagnostics.scopeLabel}.`,
      confidence: 'high',
      recommendedTargetLiters,
    }
  }

  if (highFungalBlock && device.isValveOpen) {
    return {
      deviceId: device.id,
      action: 'close_now',
      trigger: 'fungal_block',
      reason: `Pressione fungina alta su ${diagnostics.scopeLabel} senza stress idrico severo: chiusura prudenziale.`,
      confidence: 'medium',
      recommendedTargetLiters,
    }
  }

  if (highFungalBlock) {
    return {
      deviceId: device.id,
      action: 'hold',
      trigger: 'fungal_block',
      reason: `Pressione fungina alta su ${diagnostics.scopeLabel}: evito apertura automatica finché lo stress idrico non diventa severo.`,
      confidence: 'medium',
      recommendedTargetLiters,
    }
  }

  if (confirmedRecovery && device.isValveOpen) {
    return {
      deviceId: device.id,
      action: 'close_now',
      trigger: 'stability_hold',
      reason: `Il profilo di suolo ha recuperato su ${diagnostics.scopeLabel}: chiusura per evitare eccessi.`,
      confidence: 'medium',
      recommendedTargetLiters,
    }
  }

  const severeWaterStress = diagnostics.waterStress === 'high'
  const moderateWaterStress = diagnostics.waterStress === 'medium'
  const heatSupport = diagnostics.heatStress === 'high' || diagnostics.heatStress === 'medium'
  const pressureSupportsOpening =
    severeWaterStress ||
    (moderateWaterStress &&
      moisture <= moistureOpenThreshold &&
      ((snapshot.soilTensionKpa ?? 0) >= 80 || (snapshot.vpd ?? 0) >= 1.4 || heatSupport))

  if (pressureSupportsOpening && !device.isValveOpen) {
    return {
      deviceId: device.id,
      action: 'open_now',
      trigger: severeWaterStress ? 'water_stress' : 'heat_support',
      reason: `Apro in automatico su ${diagnostics.scopeLabel}: stress ${diagnostics.waterStress} con supporto microclimatico ${diagnostics.resolutionLabel.toLowerCase()}.`,
      confidence: severeWaterStress ? 'high' : 'medium',
      recommendedTargetLiters,
    }
  }

  return {
    deviceId: device.id,
    action: 'hold',
    trigger: 'stability_hold',
    reason: `Nessuna apertura automatica: scope ${diagnostics.scopeLabel} sotto controllo o senza conferme sufficienti.`,
    confidence: 'medium',
    recommendedTargetLiters,
  }
}
