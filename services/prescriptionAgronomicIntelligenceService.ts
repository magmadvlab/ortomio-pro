import type { PrescriptionMap } from '@/types/prescriptionMaps'
import type { ZoneEnvironmentalHistorySummary } from '@/services/environmentalMonitoringService'
import {
  summarizeAgronomicMeasuredFeedback,
  type AgronomicMeasuredFeedbackRecord,
} from '@/services/agronomicMeasuredFeedbackService'
import type {
  PrescriptionExecutionEfficacySummary,
  PrescriptionExecutionOutcomeSummary,
  PrescriptionExecutionVarianceSummary,
} from '@/services/prescriptionExecutionService'
import {
  resolveAgronomicPriorityProfileSync,
  scoreAgronomicPriority,
  type AgronomicPriorityFocus,
} from '@/services/agronomicPriorityService'
import {
  buildAgronomicQualityLearningAdjustment,
  type AgronomicProfileLearningSnapshot,
} from '@/services/agronomicProfileLearningService'
import type { AgronomicSignalKey } from '@/types/agronomicKernel'

export interface PrescriptionAgronomicRecommendation {
  id: string
  severity: 'urgent' | 'high' | 'medium' | 'low'
  category: 'rules' | 'soil' | 'health' | 'timing' | 'benchmark'
  title: string
  message: string
  scopeLabel?: string
  agronomicProfileId?: string
  confidence?: number
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
  agronomicProfileId?: string
  priorityConfidence?: number
  missingSignals?: AgronomicSignalKey[]
  environmentalSummary?: ZoneEnvironmentalHistorySummary | null
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

const hasPersistentEnvironmentalDeficit = (
  environmentalSummary?: ZoneEnvironmentalHistorySummary | null
) =>
  (environmentalSummary?.highSoilWaterStressDays || 0) >= 2 ||
  (environmentalSummary?.deficitWaterBalanceDays || 0) >= 3

const hasPersistentEnvironmentalHumidity = (
  environmentalSummary?: ZoneEnvironmentalHistorySummary | null
) =>
  (environmentalSummary?.highDiseasePressureDays || 0) >= 2 ||
  (environmentalSummary?.surplusWaterBalanceDays || 0) >= 2 ||
  (environmentalSummary?.lowDryingPowerDays || 0) >= 2

const getPriorityFocusFromMapType = (mapType: PrescriptionMap['mapType']): AgronomicPriorityFocus => {
  switch (mapType) {
    case 'irrigation':
      return 'water'
    case 'fertilizer':
    case 'seeding':
      return 'nutrition'
    case 'treatment':
      return 'health'
    case 'harvest':
      return 'quality'
    default:
      return 'health'
  }
}

const getFallbackAgronomicProfileId = (prescriptionMap: PrescriptionMap) => {
  const gardenName = prescriptionMap.gardenName.toLowerCase()

  if (gardenName.includes('vigneto') || gardenName.includes('vineyard')) {
    return 'vineyard_quality'
  }

  if (gardenName.includes('oliveto') || gardenName.includes('olive')) {
    return 'olive_grove_oil'
  }

  if (gardenName.includes('frutteto') || gardenName.includes('orchard')) {
    return 'orchard_generic'
  }

  return null
}

const buildPrescriptionAvailableSignals = (
  prescriptionMap: PrescriptionMap,
  zone: PrescriptionExecutionEfficacySummary['zoneScores'][number],
  outcome?: PrescriptionExecutionOutcomeSummary['zoneOutcomes'][number]
): Set<AgronomicSignalKey> => {
  const availableSignals = new Set<AgronomicSignalKey>(['operation_ledger'])

  if (prescriptionMap.dataSources.weatherData || zone.microclimateStatus !== 'no_data') {
    availableSignals.add('weather_current')
    availableSignals.add('weather_forecast')
  }

  if (zone.microclimateStatus !== 'no_data') {
    availableSignals.add('leaf_wetness')
    availableSignals.add('dew_point')
    availableSignals.add('vpd')
    availableSignals.add('canopy_temperature')
    availableSignals.add('rain_gauge_local')
  }

  if (zone.soilResponseStatus !== 'no_data') {
    availableSignals.add('soil_moisture_30cm')
    availableSignals.add('soil_moisture_60cm')
    availableSignals.add('soil_tension_kpa')
  }

  if (prescriptionMap.dataSources.ndviData) {
    availableSignals.add('ndvi')
    availableSignals.add('satellite_vigor')
  }

  if (prescriptionMap.dataSources.plantLevelData) {
    availableSignals.add('phenology_observation')
  }

  if (outcome?.outcomeStatus && outcome.outcomeStatus !== 'no_data') {
    availableSignals.add('quality_result')
  }

  return availableSignals
}

export function buildPrescriptionAgronomicIntelligenceSummary(
  prescriptionMap: PrescriptionMap,
  efficacySummary: PrescriptionExecutionEfficacySummary,
  varianceSummary: PrescriptionExecutionVarianceSummary,
  outcomeSummary: PrescriptionExecutionOutcomeSummary,
  measuredFeedbackRecords: AgronomicMeasuredFeedbackRecord[] = [],
  learningSnapshots: AgronomicProfileLearningSnapshot[] = [],
  environmentalSummariesByZone?: Record<string, ZoneEnvironmentalHistorySummary | null | undefined>
): PrescriptionAgronomicIntelligenceSummary {
  const priorityFocus = getPriorityFocusFromMapType(prescriptionMap.mapType)
  const resolvedAgronomicProfile = resolveAgronomicPriorityProfileSync({
    hints: [
      efficacySummary.cropContextScores[0]?.key,
      efficacySummary.cropContextScores[0]?.label,
      prescriptionMap.gardenName,
      prescriptionMap.name,
    ],
    fallbackProfileId: getFallbackAgronomicProfileId(prescriptionMap),
  })
  const qualityLearningAdjustment =
    priorityFocus === 'quality'
      ? buildAgronomicQualityLearningAdjustment(learningSnapshots, {
          plantName: efficacySummary.cropContextScores[0]?.label || prescriptionMap.gardenName,
          profileId: resolvedAgronomicProfile?.profile.id,
        })
      : null
  const recommendations: PrescriptionAgronomicRecommendation[] = []
  const operationalPriorities: PrescriptionAgronomicPriority[] = []

  const sortedZones = [...efficacySummary.zoneScores].sort((left, right) => right.efficacyScore - left.efficacyScore)
  const bestZone = sortedZones[0]
  const worstZone = [...sortedZones].reverse()[0]

  for (const zone of efficacySummary.zoneScores) {
    const variance = varianceSummary.zoneVariances.find((item) => item.zoneId === zone.zoneId)
    const outcome = outcomeSummary.zoneOutcomes.find((item) => item.zoneId === zone.zoneId)
    const environmentalSummary = environmentalSummariesByZone?.[zone.zoneId]
    const persistentDeficit = hasPersistentEnvironmentalDeficit(environmentalSummary)
    const persistentHumidity = hasPersistentEnvironmentalHumidity(environmentalSummary)

    if (zone.soilResponseStatus === 'poor') {
      recommendations.push({
        id: `soil:${zone.zoneId}`,
        severity: zone.efficacyStatus === 'low' ? 'urgent' : 'high',
        category: 'soil',
        scopeLabel: zone.zoneName,
        title: 'Risposta del suolo insufficiente',
        message: `Su ${zone.zoneName} il profilo non sta reagendo bene dopo l'intervento. Controlla tensione del suolo, profondita del sensore e uniformita idraulica prima di aumentare i volumi.`,
        agronomicProfileId: resolvedAgronomicProfile?.profile.id,
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
        agronomicProfileId: resolvedAgronomicProfile?.profile.id,
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
        agronomicProfileId: resolvedAgronomicProfile?.profile.id,
      })
    }

    const latestQualityResult = outcome?.latestQualityResult
    const adaptiveQualityScoreTarget =
      qualityLearningAdjustment ? qualityLearningAdjustment.qualityTargetRating * 20 : null
    const adaptiveQualityScoreFloor =
      qualityLearningAdjustment ? qualityLearningAdjustment.qualityAlertFloorRating * 20 : null
    const qualityScoreGap =
      priorityFocus === 'quality' &&
      typeof latestQualityResult?.qualityScore === 'number' &&
      typeof adaptiveQualityScoreTarget === 'number'
        ? Math.max(0, adaptiveQualityScoreTarget - latestQualityResult.qualityScore)
        : 0
    const brixGap =
      priorityFocus === 'quality' &&
      typeof latestQualityResult?.brix === 'number' &&
      typeof qualityLearningAdjustment?.brixTarget === 'number'
        ? Math.max(0, qualityLearningAdjustment.brixTarget - latestQualityResult.brix)
        : 0

    const basePriorityScore = Math.min(100, Math.max(
      0,
      Math.round(
        (100 - zone.efficacyScore) * 0.48
        + varianceWeight[variance?.varianceStatus || 'pending']
        + outcomeWeight[outcome?.outcomeStatus || 'no_data']
        + microclimateWeight[zone.microclimateStatus]
        + soilWeight[zone.soilResponseStatus]
        + (persistentDeficit ? 10 : 0)
        + (persistentHumidity ? 12 : 0)
        + qualityScoreGap * 0.45
        + brixGap * 3
      )
    ))
    const availableSignals = buildPrescriptionAvailableSignals(prescriptionMap, zone, outcome)
    const measuredFeedbackSummary = summarizeAgronomicMeasuredFeedback(measuredFeedbackRecords, {
      focus: priorityFocus,
      zoneId: zone.zoneId,
      plantName: efficacySummary.cropContextScores[0]?.label || prescriptionMap.gardenName,
    })
    const priorityResult = scoreAgronomicPriority({
      baseScore: basePriorityScore,
      confidence:
        outcome?.outcomeStatus === 'negative'
          ? 0.86
          : outcome?.outcomeStatus === 'mixed'
            ? 0.76
            : zone.microclimateStatus !== 'no_data' || zone.soilResponseStatus !== 'no_data'
              ? 0.72
              : 0.62 + (environmentalSummary ? 0.04 : 0),
      resolvedProfile: resolvedAgronomicProfile,
      focus: priorityFocus,
      availableSignals,
      measuredFeedbackSummary,
      environmentalSummary,
    })
    const priorityScore = priorityResult.score

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
      persistentDeficit ? 'storico deficit persistente' : null,
      persistentHumidity ? 'storico umido persistente' : null,
      priorityFocus === 'quality' && qualityScoreGap > 0 ? `qualita sotto target ${(adaptiveQualityScoreTarget || 0).toFixed(0)}` : null,
      priorityFocus === 'quality' && brixGap > 0 ? `brix sotto target ${qualityLearningAdjustment?.brixTarget}` : null,
    ].filter((value): value is string => Boolean(value))

    let recommendedAction = 'Mantieni la strategia corrente e monitora il prossimo outcome per conferma.'
    if (urgency === 'immediate') {
      recommendedAction = `Intervieni subito su ${zone.zoneName}: correggi dose/copertura ed elimina il fattore operativo o microclimatico dominante prima del prossimo passaggio.`
    } else if (urgency === 'next_cycle') {
      recommendedAction = `Pianifica un aggiustamento nel prossimo ciclo su ${zone.zoneName}, con target piu aderente e controllo post-intervento.`
    }
    if (persistentHumidity) {
      recommendedAction += ' Usa una finestra piu asciutta e stabile prima di replicare la prescrizione.'
    } else if (persistentDeficit) {
      recommendedAction += ' Verifica la componente idrica e la risposta del suolo prima di aumentare la dose.'
    }
    if (
      priorityFocus === 'quality' &&
      (qualityScoreGap > 0 || brixGap > 0) &&
      qualityLearningAdjustment
    ) {
      recommendedAction =
        urgency === 'immediate'
          ? `Intervieni subito su ${zone.zoneName}: riallinea timing e gestione della zona per tornare sopra ${qualityLearningAdjustment.qualityTargetRating.toFixed(1)}/5 e ${qualityLearningAdjustment.brixTarget}° Brix.`
          : `Nel prossimo ciclo usa ${zone.zoneName} per recuperare il target qualità ${qualityLearningAdjustment.qualityTargetRating.toFixed(1)}/5 e il benchmark Brix ${qualityLearningAdjustment.brixTarget}°.`
    }

    const rationale = drivers.length > 0
      ? `${zone.zoneName} entra in priorita per ${drivers.join(', ')}.`
      : `${zone.zoneName} resta stabile e va solo monitorata.`
    const coverageSuffix =
      priorityResult.signalCoverage.missingP0Signals.length > 0
        ? ` Segnali P0 mancanti: ${priorityResult.signalCoverage.missingP0Signals.join(', ')}.`
        : ''
    const profileSuffix = resolvedAgronomicProfile
      ? ` Profilo agronomico: ${resolvedAgronomicProfile.profile.label}.`
      : ''
    const measuredFeedbackSuffix =
      priorityResult.measuredFeedbackSummary?.rationale?.length
        ? ` Feedback osservato: ${priorityResult.measuredFeedbackSummary.rationale.join(' ')}.`
        : ''
    const adaptiveQualitySuffix =
      priorityFocus === 'quality' && qualityLearningAdjustment
        ? ` Benchmark qualita sito-specifico: ${qualityLearningAdjustment.qualityTargetRating.toFixed(1)}/5, soglia ${qualityLearningAdjustment.qualityAlertFloorRating.toFixed(1)}/5, Brix ${qualityLearningAdjustment.brixTarget}°.`
        : ''
    const environmentalSuffix = environmentalSummary
      ? ` Storico ambientale: ${persistentDeficit ? `${environmentalSummary.highSoilWaterStressDays || 0} giorni con stress idrico alto` : ''}${persistentDeficit && persistentHumidity ? ', ' : ''}${persistentHumidity ? `${environmentalSummary.highDiseasePressureDays || 0} giorni con pressione ambientale alta` : ''}.`
      : ''

    operationalPriorities.push({
      id: `priority:${zone.zoneId}`,
      zoneId: zone.zoneId,
      scopeLabel: zone.zoneName,
      priorityScore,
      urgency,
      recommendedAction,
      drivers,
      efficacyScore: zone.efficacyScore,
      varianceStatus: variance?.varianceStatus || 'pending',
      outcomeStatus: outcome?.outcomeStatus || 'no_data',
      microclimateStatus: zone.microclimateStatus,
      soilResponseStatus: zone.soilResponseStatus,
      agronomicProfileId: resolvedAgronomicProfile?.profile.id,
      priorityConfidence: priorityResult.confidence,
      missingSignals: priorityResult.signalCoverage.missingP0Signals,
      environmentalSummary,
      rationale: `${rationale}${profileSuffix}${coverageSuffix}${measuredFeedbackSuffix}${adaptiveQualitySuffix}${environmentalSuffix}`,
    })

    if (
      environmentalSummary &&
      (persistentDeficit || persistentHumidity) &&
      recommendations.every((entry) => entry.id !== `environment:${zone.zoneId}`)
    ) {
      recommendations.push({
        id: `environment:${zone.zoneId}`,
        severity:
          persistentHumidity && (environmentalSummary.highDiseasePressureDays || 0) >= 3
            ? 'high'
            : persistentDeficit && (environmentalSummary.highSoilWaterStressDays || 0) >= 3
              ? 'high'
              : 'medium',
        category: 'timing',
        scopeLabel: zone.zoneName,
        title: 'Pressione ambientale persistente sulla zona',
        message: persistentHumidity
          ? `Su ${zone.zoneName} il ledger ambientale mostra una sequenza recente umida. Conviene riaprire timing e copertura prima di ripetere la prescrizione.`
          : `Su ${zone.zoneName} il ledger ambientale mostra deficit idrico persistente. Conviene riallineare componente irrigua e risposta del suolo prima di forzare ulteriormente la dose.`,
        agronomicProfileId: resolvedAgronomicProfile?.profile.id,
        confidence: Math.min(0.9, 0.62 + (priorityResult.confidence - 0.5) * 0.5),
      })
    }

    if (
      measuredFeedbackSummary &&
      measuredFeedbackSummary.negativeSignals > 0 &&
      recommendations.every((entry) => entry.id !== `benchmark:${zone.zoneId}:feedback`)
    ) {
      recommendations.push({
        id: `benchmark:${zone.zoneId}:feedback`,
        severity: measuredFeedbackSummary.scoreAdjustment >= 8 ? 'urgent' : 'medium',
        category: 'benchmark',
        scopeLabel: zone.zoneName,
        title: 'Feedback operativo recente sfavorevole',
        message: `Su ${zone.zoneName} il feedback osservato recente segnala criticita: ${measuredFeedbackSummary.rationale.join(' ')}`,
        agronomicProfileId: resolvedAgronomicProfile?.profile.id,
        confidence: Math.min(0.92, 0.58 + measuredFeedbackSummary.confidenceAdjustment),
      })
    }

    if (
      priorityFocus === 'quality' &&
      qualityLearningAdjustment &&
      latestQualityResult &&
      recommendations.every((entry) => entry.id !== `quality:${zone.zoneId}:adaptive-gap`)
    ) {
      const qualityScore = latestQualityResult.qualityScore
      const brix = latestQualityResult.brix
      const belowAdaptiveFloor =
        typeof qualityScore === 'number' &&
        typeof adaptiveQualityScoreFloor === 'number' &&
        qualityScore < adaptiveQualityScoreFloor
      const belowAdaptiveBrix =
        typeof brix === 'number' &&
        brix < qualityLearningAdjustment.brixTarget

      if (belowAdaptiveFloor || belowAdaptiveBrix) {
        recommendations.push({
          id: `quality:${zone.zoneId}:adaptive-gap`,
          severity:
            belowAdaptiveFloor && qualityScoreGap >= 12
              ? 'urgent'
              : belowAdaptiveBrix || qualityScoreGap > 0
                ? 'high'
                : 'medium',
          category: 'benchmark',
          scopeLabel: zone.zoneName,
          title: 'Zona sotto benchmark qualitativo del sito',
          message: `Su ${zone.zoneName} il risultato qualitativo recente resta sotto il benchmark adattivo del sito (${qualityLearningAdjustment.qualityTargetRating.toFixed(1)}/5${typeof brix === 'number' ? `, target ${qualityLearningAdjustment.brixTarget}° Brix` : ''}). Conviene usare la zona migliore come riferimento e ritarare timing, copertura e raccolta.`,
          agronomicProfileId: resolvedAgronomicProfile?.profile.id,
          confidence: Math.min(0.94, 0.64 + (priorityResult.confidence - 0.5) * 0.4),
        })
      }
    }
  }

  if (bestZone && worstZone && bestZone.zoneId !== worstZone.zoneId && bestZone.efficacyScore - worstZone.efficacyScore >= 15) {
    recommendations.push({
      id: 'benchmark:zone-gap',
      severity: 'medium',
      category: 'benchmark',
      title: 'Usare la zona migliore come benchmark',
      message: `${bestZone.zoneName} sta performando meglio di ${worstZone.zoneName}. Confronta dose, copertura, risposta suolo e finestra operativa per allineare la strategia.`,
      agronomicProfileId: resolvedAgronomicProfile?.profile.id,
      confidence: resolvedAgronomicProfile ? 0.78 : 0.62,
    })
  }

  if ((efficacySummary.averageEfficacyScore ?? 0) < 60) {
    recommendations.push({
      id: `map:${prescriptionMap.id}`,
      severity: 'high',
      category: 'rules',
      title: 'Strategia da rivedere a livello mappa',
      message: `La mappa ${prescriptionMap.name} ha un'efficacia media bassa. Prima di replicarla conviene correggere le zone deboli e consolidare il benchmark operativo.`,
      agronomicProfileId: resolvedAgronomicProfile?.profile.id,
      confidence: resolvedAgronomicProfile ? 0.8 : 0.64,
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
