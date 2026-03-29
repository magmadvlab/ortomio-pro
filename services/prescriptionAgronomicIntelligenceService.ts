import type { PrescriptionMap } from '@/types/prescriptionMaps'
import type {
  PrescriptionExecutionEfficacySummary,
  PrescriptionExecutionOutcomeSummary,
  PrescriptionExecutionVarianceSummary,
} from '@/services/prescriptionExecutionService'

export interface PrescriptionAgronomicRecommendation {
  id: string
  severity: 'urgent' | 'high' | 'medium' | 'low'
  category: 'rules' | 'soil' | 'health' | 'timing' | 'benchmark'
  title: string
  message: string
  scopeLabel?: string
}

export interface PrescriptionAgronomicPriority {
  id: string
  zoneId: string
  scopeLabel: string
  priorityScore: number
  urgency: 'immediate' | 'next_cycle' | 'monitor'
  rationale: string
  recommendedAction: string
  drivers: string[]
  efficacyScore: number
  varianceStatus: PrescriptionExecutionVarianceSummary['zoneVariances'][number]['varianceStatus']
  outcomeStatus: PrescriptionExecutionOutcomeSummary['zoneOutcomes'][number]['outcomeStatus']
  microclimateStatus: PrescriptionExecutionEfficacySummary['zoneScores'][number]['microclimateStatus']
  soilResponseStatus: PrescriptionExecutionEfficacySummary['zoneScores'][number]['soilResponseStatus']
}

export interface PrescriptionAgronomicIntelligenceSummary {
  averageEfficacyScore: number
  bestZoneLabel?: string
  worstZoneLabel?: string
  benchmarkCropLabel?: string
  benchmarkSeasonLabel?: string
  topPriorityLabel?: string
  immediatePriorities: number
  nextCyclePriorities: number
  monitorPriorities: number
  recommendations: PrescriptionAgronomicRecommendation[]
  operationalPriorities: PrescriptionAgronomicPriority[]
}

const severityWeight = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
}

const varianceWeight = {
  pending: 10,
  aligned: 0,
  partial: 10,
  off_target: 22,
  missed: 28,
} satisfies Record<PrescriptionExecutionVarianceSummary['zoneVariances'][number]['varianceStatus'], number>

const outcomeWeight = {
  no_data: 8,
  positive: 0,
  mixed: 10,
  negative: 22,
} satisfies Record<PrescriptionExecutionOutcomeSummary['zoneOutcomes'][number]['outcomeStatus'], number>

const microclimateWeight = {
  no_data: 5,
  stable: 0,
  watch: 8,
  critical: 16,
} satisfies Record<PrescriptionExecutionEfficacySummary['zoneScores'][number]['microclimateStatus'], number>

const soilWeight = {
  no_data: 5,
  responsive: 0,
  watch: 9,
  poor: 18,
} satisfies Record<PrescriptionExecutionEfficacySummary['zoneScores'][number]['soilResponseStatus'], number>

export function buildPrescriptionAgronomicIntelligenceSummary(
  prescriptionMap: PrescriptionMap,
  efficacySummary: PrescriptionExecutionEfficacySummary,
  varianceSummary: PrescriptionExecutionVarianceSummary,
  outcomeSummary: PrescriptionExecutionOutcomeSummary
): PrescriptionAgronomicIntelligenceSummary {
  const recommendations: PrescriptionAgronomicRecommendation[] = []
  const operationalPriorities: PrescriptionAgronomicPriority[] = []

  const sortedZones = [...efficacySummary.zoneScores].sort((left, right) => right.efficacyScore - left.efficacyScore)
  const bestZone = sortedZones[0]
  const worstZone = [...sortedZones].reverse()[0]

  for (const zone of efficacySummary.zoneScores) {
    const variance = varianceSummary.zoneVariances.find((item) => item.zoneId === zone.zoneId)
    const outcome = outcomeSummary.zoneOutcomes.find((item) => item.zoneId === zone.zoneId)

    if (zone.soilResponseStatus === 'poor') {
      recommendations.push({
        id: `soil:${zone.zoneId}`,
        severity: zone.efficacyStatus === 'low' ? 'urgent' : 'high',
        category: 'soil',
        scopeLabel: zone.zoneName,
        title: 'Risposta del suolo insufficiente',
        message: `Su ${zone.zoneName} il profilo non sta reagendo bene dopo l'intervento. Controlla tensione del suolo, profondita del sensore e uniformita idraulica prima di aumentare i volumi.`,
      })
    }

    if (variance?.varianceStatus === 'off_target' && outcome?.outcomeStatus === 'negative') {
      recommendations.push({
        id: `rules:${zone.zoneId}`,
        severity: 'urgent',
        category: 'rules',
        scopeLabel: zone.zoneName,
        title: 'Prescrizione eseguita male e con esito negativo',
        message: `Su ${zone.zoneName} lo scostamento tra pianificato ed eseguito coincide con un outcome negativo. Serve ritarare la dose o il setup operativo prima del prossimo ciclo.`,
      })
    }

    if (zone.microclimateStatus === 'critical' && outcome?.outcomeStatus !== 'positive') {
      recommendations.push({
        id: `timing:${zone.zoneId}`,
        severity: 'high',
        category: 'timing',
        scopeLabel: zone.zoneName,
        title: 'Finestra microclimatica sfavorevole',
        message: `Su ${zone.zoneName} stress idrico/termico o pressione fungina stanno compromettendo il risultato. Conviene rivedere il timing dell'intervento e usare una finestra piu stabile.`,
      })
    }

    const priorityScore = Math.min(100, Math.max(
      0,
      Math.round(
        (100 - zone.efficacyScore) * 0.48
        + varianceWeight[variance?.varianceStatus || 'pending']
        + outcomeWeight[outcome?.outcomeStatus || 'no_data']
        + microclimateWeight[zone.microclimateStatus]
        + soilWeight[zone.soilResponseStatus]
      )
    ))

    let urgency: PrescriptionAgronomicPriority['urgency'] = 'monitor'
    if (priorityScore >= 75 || (outcome?.outcomeStatus === 'negative' && variance?.varianceStatus === 'off_target')) {
      urgency = 'immediate'
    } else if (priorityScore >= 45) {
      urgency = 'next_cycle'
    }

    const drivers = [
      variance?.varianceStatus && variance.varianceStatus !== 'aligned' ? `esecuzione ${variance.varianceStatus}` : null,
      outcome?.outcomeStatus && outcome.outcomeStatus !== 'positive' ? `outcome ${outcome.outcomeStatus}` : null,
      zone.microclimateStatus !== 'stable' ? `microclima ${zone.microclimateStatus}` : null,
      zone.soilResponseStatus !== 'responsive' ? `suolo ${zone.soilResponseStatus}` : null,
    ].filter((value): value is string => Boolean(value))

    let recommendedAction = 'Mantieni la strategia corrente e monitora il prossimo outcome per conferma.'
    if (urgency === 'immediate') {
      recommendedAction = `Intervieni subito su ${zone.zoneName}: correggi dose/copertura ed elimina il fattore operativo o microclimatico dominante prima del prossimo passaggio.`
    } else if (urgency === 'next_cycle') {
      recommendedAction = `Pianifica un aggiustamento nel prossimo ciclo su ${zone.zoneName}, con target piu aderente e controllo post-intervento.`
    }

    const rationale = drivers.length > 0
      ? `${zone.zoneName} entra in priorita per ${drivers.join(', ')}.`
      : `${zone.zoneName} resta stabile e va solo monitorata.`

    operationalPriorities.push({
      id: `priority:${zone.zoneId}`,
      zoneId: zone.zoneId,
      scopeLabel: zone.zoneName,
      priorityScore,
      urgency,
      rationale,
      recommendedAction,
      drivers,
      efficacyScore: zone.efficacyScore,
      varianceStatus: variance?.varianceStatus || 'pending',
      outcomeStatus: outcome?.outcomeStatus || 'no_data',
      microclimateStatus: zone.microclimateStatus,
      soilResponseStatus: zone.soilResponseStatus,
    })
  }

  if (bestZone && worstZone && bestZone.zoneId !== worstZone.zoneId && bestZone.efficacyScore - worstZone.efficacyScore >= 15) {
    recommendations.push({
      id: 'benchmark:zone-gap',
      severity: 'medium',
      category: 'benchmark',
      title: 'Usare la zona migliore come benchmark',
      message: `${bestZone.zoneName} sta performando meglio di ${worstZone.zoneName}. Confronta dose, copertura, risposta suolo e finestra operativa per allineare la strategia.`,
    })
  }

  if ((efficacySummary.averageEfficacyScore ?? 0) < 60) {
    recommendations.push({
      id: `map:${prescriptionMap.id}`,
      severity: 'high',
      category: 'rules',
      title: 'Strategia da rivedere a livello mappa',
      message: `La mappa ${prescriptionMap.name} ha un'efficacia media bassa. Prima di replicarla conviene correggere le zone deboli e consolidare il benchmark operativo.`,
    })
  }

  recommendations.sort((left, right) => severityWeight[right.severity] - severityWeight[left.severity])
  operationalPriorities.sort((left, right) => right.priorityScore - left.priorityScore)

  return {
    averageEfficacyScore: efficacySummary.averageEfficacyScore,
    bestZoneLabel: bestZone?.zoneName,
    worstZoneLabel: worstZone?.zoneName,
    benchmarkCropLabel: efficacySummary.cropContextScores[0]?.label,
    benchmarkSeasonLabel: efficacySummary.seasonScores[0]?.label,
    topPriorityLabel: operationalPriorities[0]?.scopeLabel,
    immediatePriorities: operationalPriorities.filter((item) => item.urgency === 'immediate').length,
    nextCyclePriorities: operationalPriorities.filter((item) => item.urgency === 'next_cycle').length,
    monitorPriorities: operationalPriorities.filter((item) => item.urgency === 'monitor').length,
    recommendations: recommendations.slice(0, 6),
    operationalPriorities,
  }
}
