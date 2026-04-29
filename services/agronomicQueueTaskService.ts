import type { GardenTask } from '@/types'
import type { AgronomicDecisionExplanation } from '@/services/agronomicDecisionExplanationService'
import type { AgronomicEconomicPrioritySummary } from '@/services/agronomicEconomicPriorityService'
import type { AgronomicRefinedContext, AgronomicSignalKey } from '@/types/agronomicKernel'
import type { AgronomicActionQueueItem } from '@/services/agronomicActionQueueService'

export interface AgronomicQueueTaskDraft {
  id: string
  sourceQueueId: string
  source: AgronomicActionQueueItem['source']
  title: string
  priorityScore: number
  priorityConfidence: number
  urgencyLabel: AgronomicActionQueueItem['urgencyLabel']
  missingSignals: AgronomicSignalKey[]
  economicSummary?: AgronomicEconomicPrioritySummary | null
  decisionSnapshot?: AgronomicDecisionSnapshot | null
  task: Omit<GardenTask, 'id'>
}

export interface AgronomicDecisionSnapshot {
  id: string
  capturedAt: string
  queueItemId: string
  source: AgronomicActionQueueItem['source']
  focus: AgronomicActionQueueItem['focus']
  title: string
  scopeLabel?: string
  agronomicProfileId?: string
  priorityScore: number
  priorityConfidence: number
  urgencyLabel: AgronomicActionQueueItem['urgencyLabel']
  missingSignals: AgronomicSignalKey[]
  refinedContext?: AgronomicRefinedContext | null
  decisionExplanation?: AgronomicDecisionExplanation | null
  economicSummary?: AgronomicEconomicPrioritySummary | null
}

export interface AgronomicQueueTaskMetadata {
  queueItemId: string
  source: AgronomicActionQueueItem['source']
  focus: AgronomicActionQueueItem['focus']
  priorityScore: number
  priorityConfidence: number
  urgencyLabel: AgronomicActionQueueItem['urgencyLabel']
  agronomicProfileId?: string
  missingSignals: AgronomicSignalKey[]
  refinedContext?: AgronomicRefinedContext | null
  decisionExplanation?: AgronomicDecisionExplanation | null
  decisionSnapshot?: AgronomicDecisionSnapshot | null
  economicSummary?: AgronomicEconomicPrioritySummary | null
}

export interface AgronomicQueueTaskOperationalSummary {
  readiness: 'ready' | 'partial' | 'blocked'
  readinessLabel: string
  focusLabel: string
  urgencyLabel: string
  confidenceLabel: string
  mobileActionLabel: string
  mobileEvidencePrompt: string
  evidenceLabels: string[]
  missingSignalsLabel?: string
  contextLabels: string[]
  primaryRationale?: string
}

export const AGRONOMIC_QUEUE_SUGGESTED_BY_PREFIX = 'agronomic_queue:'
const AGRONOMIC_QUEUE_META_MARKER = 'AQ_META::'

const HEALTH_ALERT_TYPE_LABELS: Record<string, string> = {
  disease_risk: 'Rischio malattie',
  pest_alert: 'Allerta parassiti',
  nutrient_deficiency: 'Carenza nutrizionale',
  stress_symptoms: 'Segni di stress',
  harvest_timing: 'Finestra di raccolta',
  weather_stress: 'Stress meteo',
}

const AGRONOMIC_FOCUS_LABELS: Record<string, string> = {
  water: 'Focus acqua',
  nutrition: 'Focus nutrizione',
  health: 'Focus salute',
  quality: 'Focus qualita',
}

const AGRONOMIC_URGENCY_LABELS: Record<string, string> = {
  immediate: 'Urgente oggi',
  next_cycle: 'Prossimo ciclo',
  monitor: 'Monitoraggio',
}

const AGRONOMIC_SIGNAL_LABELS: Record<AgronomicSignalKey, string> = {
  weather_current: 'meteo attuale',
  weather_forecast: 'previsione meteo',
  leaf_wetness: 'bagnatura fogliare',
  dew_point: 'punto di rugiada',
  vpd: 'VPD',
  rain_gauge_local: 'pioggia locale',
  soil_moisture_10cm: 'umidita suolo 10 cm',
  soil_moisture_30cm: 'umidita suolo 30 cm',
  soil_moisture_60cm: 'umidita suolo 60 cm',
  soil_tension_kpa: 'tensione del suolo',
  canopy_temperature: 'temperatura chioma',
  flow_rate_actual: 'portata reale',
  line_pressure: 'pressione linea',
  water_salinity: 'salinita acqua',
  water_ph: 'pH acqua',
  water_bicarbonates: 'bicarbonati acqua',
  phenology_observation: 'osservazione fenologica',
  quality_result: 'risultati di qualita',
  operation_ledger: 'registro operazioni',
  ndvi: 'NDVI',
  satellite_vigor: 'vigore satellitare',
}

const MOBILE_ACTION_LABELS: Record<AgronomicQueueTaskOperationalSummary['readiness'], string> = {
  ready: 'Esegui ora',
  partial: 'Esegui guidato',
  blocked: 'Verifica prima',
}

const FOCUS_EVIDENCE_LABELS: Record<string, string[]> = {
  water: ['ora esecuzione', 'litri o durata', 'umidita dopo intervento'],
  nutrition: ['prodotto e dose', 'area trattata', 'note risposta coltura'],
  health: ['prodotto o rilievo', 'foto sintomi', 'note evoluzione'],
  quality: ['quantita o qualita', 'foto lotto', 'note raccolta'],
}

const toISODate = (date: Date): string => date.toISOString().split('T')[0]

const addDays = (baseDate: Date, days: number): Date => {
  const nextDate = new Date(baseDate)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

const resolveTaskType = (item: AgronomicActionQueueItem): GardenTask['taskType'] => {
  if (item.source === 'phenology') {
    return item.urgencyLabel === 'immediate' && item.focus === 'quality' ? 'Harvest' : 'Photo'
  }

  if (item.source === 'irrigation' || item.focus === 'water') {
    return 'Irrigation'
  }

  if (item.source === 'prescription' || item.focus === 'nutrition') {
    return 'Fertilize'
  }

  if (item.focus === 'quality') {
    return 'Harvest'
  }

  return 'Treatment'
}

const resolveTaskDate = (item: AgronomicActionQueueItem): string => {
  const today = new Date()

  if (item.urgencyLabel === 'immediate') {
    return toISODate(today)
  }

  if (item.urgencyLabel === 'next_cycle') {
    return toISODate(addDays(today, 2))
  }

  return toISODate(addDays(today, 5))
}

const resolveSchedulingType = (
  item: AgronomicActionQueueItem
): GardenTask['schedulingType'] => {
  return item.urgencyLabel === 'immediate' ? 'Immediate' : 'Scheduled'
}

const resolveDurationMinutes = (taskType: GardenTask['taskType']): number => {
  switch (taskType) {
    case 'Photo':
      return 10
    case 'Harvest':
      return 35
    case 'Fertilize':
      return 30
    case 'Irrigation':
      return 25
    case 'Treatment':
    default:
      return 20
  }
}

const resolvePlantName = (item: AgronomicActionQueueItem): string => {
  if (item.scopeLabel && item.scopeLabel.trim().length > 0) {
    return item.scopeLabel
  }

  return item.title
    .replace(/^Irrigazione\s+/i, '')
    .replace(/^Prescription\s+/i, '')
    .replace(/^Verifica fase fenologica\s+/i, '')
    .trim()
}

const normalizeReadableText = (value: string): string =>
  value
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,:;!?])/g, '$1')
    .trim()

const sanitizeAgronomicQueueVisibleText = (value?: string | null): string => {
  if (!value) {
    return ''
  }

  const cleaned = value
    .replace(/Origine coda trasversale:[^.]*\.\s*/gi, '')
    .replace(/Focus agronomico:[^.]*\.\s*/gi, '')
    .replace(/Profilo agronomico:[^.]*\.\s*/gi, '')
    .replace(/Priorita:\s*[^.]*\.\s*/gi, '')
    .replace(/Segnali P0 mancanti:[^.]*\.\s*/gi, '')
    .replace(/Copertura P0 sufficiente per questo suggerimento\.\s*/gi, '')
    .replace(/Fase\s+([A-Za-zÀ-ÿ' -]+)\s+stimata\s+sullo scope\s+profilo agronomico\./gi, 'Fase $1 stimata dal profilo agronomico.')
    .replace(/\bsullo scope\s+/gi, "nell'area ")

  return normalizeReadableText(cleaned)
}

const humanizeProductionIntent = (value?: string | null): string | null => {
  switch (value) {
    case 'wine':
      return 'Vino'
    case 'table':
      return 'Fresco'
    case 'oil':
      return 'Olio'
    case 'processing':
      return 'Trasformazione'
    case 'fresh_market':
      return 'Mercato fresco'
    case 'storage':
      return 'Conservazione'
    default:
      return value ? value.replace(/_/g, ' ') : null
  }
}

const humanizeSystemType = (value?: string | null): string | null => {
  switch (value) {
    case 'vineyard':
      return 'Vigneto'
    case 'orchard':
      return 'Frutteto'
    case 'olive_grove':
      return 'Oliveto'
    case 'open_field':
      return 'Pieno campo'
    case 'protected_culture':
      return 'Coltura protetta'
    case 'nursery':
      return 'Vivaio'
    default:
      return value ? value.replace(/_/g, ' ') : null
  }
}

const humanizeIrrigationMode = (value?: string | null): string | null => {
  switch (value) {
    case 'pressurized_irrigation':
      return 'Irrigazione pressurizzata'
    case 'manual_irrigation':
      return 'Irrigazione manuale'
    case 'rainfed':
      return 'Asciutta'
    case 'hydroponic':
      return 'Idroponica'
    default:
      return value ? value.replace(/_/g, ' ') : null
  }
}

const humanizeSiteExposureClass = (value?: string | null): string | null => {
  switch (value) {
    case 'exposed':
      return 'Sito esposto'
    case 'sheltered':
      return 'Sito riparato'
    case 'balanced':
      return 'Esposizione bilanciata'
    default:
      return null
  }
}

const humanizeSiteSlopeClass = (value?: string | null): string | null => {
  switch (value) {
    case 'steep':
      return 'Pendenza forte'
    case 'rolling':
      return 'Pendenza moderata'
    case 'flat':
      return 'Pianeggiante'
    default:
      return null
  }
}

const formatSiteMetricLabels = (
  refinedContext: AgronomicRefinedContext
): string[] => {
  const siteProfile = refinedContext.siteOperationalProfile
  if (!siteProfile) {
    return []
  }

  return [
    typeof siteProfile.altitudeMeters === 'number'
      ? `Quota ${Math.round(siteProfile.altitudeMeters)} m`
      : null,
    typeof siteProfile.soilPh === 'number'
      ? `pH ${siteProfile.soilPh.toFixed(1)}`
      : null,
    typeof siteProfile.dailySunHours === 'number'
      ? `Sole ${siteProfile.dailySunHours.toFixed(1)} h`
      : null,
    siteProfile.aspectDirection
      ? `Orientamento ${siteProfile.aspectDirection}`
      : null,
    siteProfile.windProtection
      ? `Vento ${siteProfile.windProtection}`
      : null,
    typeof siteProfile.shadowObstaclesCount === 'number' && siteProfile.shadowObstaclesCount > 0
      ? `Ombre ${siteProfile.shadowObstaclesCount}`
      : null,
  ].filter((value): value is string => Boolean(value))
}

const buildOperationalContextLabels = (
  refinedContext?: AgronomicRefinedContext | null
): string[] => {
  if (!refinedContext) {
    return []
  }

  const rawLabels = [
    refinedContext.cultivarContext?.cultivarLabel
      ? `Cultivar ${refinedContext.cultivarContext.cultivarLabel}`
      : null,
    humanizeProductionIntent(refinedContext.cultivarContext?.productionIntent)
      ? `Target ${humanizeProductionIntent(refinedContext.cultivarContext?.productionIntent)}`
      : null,
    humanizeSystemType(refinedContext.subSystemContext?.systemType),
    humanizeIrrigationMode(refinedContext.subSystemContext?.irrigationMode),
    refinedContext.siteOperationalProfile?.terroir
      ? `Terroir ${refinedContext.siteOperationalProfile.terroir}`
      : null,
    refinedContext.siteOperationalProfile?.soilType
      ? `Suolo ${refinedContext.siteOperationalProfile.soilType}`
      : null,
    humanizeSiteExposureClass(refinedContext.siteOperationalProfile?.exposureClass),
    humanizeSiteSlopeClass(refinedContext.siteOperationalProfile?.slopeClass),
    ...formatSiteMetricLabels(refinedContext),
  ].filter((value): value is string => Boolean(value))

  return Array.from(new Set(rawLabels)).slice(0, 14)
}

const formatConfidenceLabel = (confidence: number): string =>
  `Conf. ${Math.round(confidence * 100)}%`

const formatAgronomicQueueTitle = (item: AgronomicActionQueueItem): string => {
  const title = item.title.trim()

  if (item.source === 'health') {
    const [scopeLabel, rawType] = title.split(/\s+-\s+/, 2)
    if (scopeLabel && rawType) {
      return `${scopeLabel} - ${HEALTH_ALERT_TYPE_LABELS[rawType] || rawType.replace(/_/g, ' ')}`
    }
  }

  if (/^Prescription\s+/i.test(title)) {
    return title.replace(/^Prescription\s+/i, 'Prescrizione ')
  }

  return title
}

export const humanizeAgronomicSignal = (signal: AgronomicSignalKey): string => {
  return AGRONOMIC_SIGNAL_LABELS[signal] || signal.replace(/_/g, ' ')
}

export const parseAgronomicQueueSuggestedBy = (value?: string | null): string | null => {
  if (!value || !value.startsWith(AGRONOMIC_QUEUE_SUGGESTED_BY_PREFIX)) {
    return null
  }

  return value.slice(AGRONOMIC_QUEUE_SUGGESTED_BY_PREFIX.length) || null
}

export const buildAgronomicQueueTaskMetadata = (
  item: AgronomicActionQueueItem
): AgronomicQueueTaskMetadata => {
  const economicSummary =
    item.metadata && 'economicSummary' in item.metadata
      ? (item.metadata.economicSummary as AgronomicEconomicPrioritySummary | null | undefined) || null
      : null
  const decisionExplanation =
    item.metadata && 'decisionExplanation' in item.metadata
      ? (item.metadata.decisionExplanation as AgronomicDecisionExplanation | null | undefined) || null
      : null
  const refinedContext =
    item.metadata && 'refinedContext' in item.metadata
      ? (item.metadata.refinedContext as AgronomicRefinedContext | null | undefined) ||
        decisionExplanation?.refinedContext ||
        null
      : decisionExplanation?.refinedContext || null

  return {
    queueItemId: item.id,
    source: item.source,
    focus: item.focus,
    priorityScore: item.priorityScore,
    priorityConfidence: item.priorityConfidence,
    urgencyLabel: item.urgencyLabel,
    agronomicProfileId: item.agronomicProfileId,
    missingSignals: item.missingSignals,
    refinedContext,
    decisionExplanation,
    decisionSnapshot: buildAgronomicDecisionSnapshot(item, {
      economicSummary,
      refinedContext,
      decisionExplanation,
    }),
    economicSummary,
  }
}

export const buildAgronomicDecisionSnapshot = (
  item: AgronomicActionQueueItem,
  overrides?: {
    economicSummary?: AgronomicEconomicPrioritySummary | null
    refinedContext?: AgronomicRefinedContext | null
    decisionExplanation?: AgronomicDecisionExplanation | null
  }
): AgronomicDecisionSnapshot => ({
  id: `aq_snapshot:${item.id}`,
  capturedAt: new Date().toISOString(),
  queueItemId: item.id,
  source: item.source,
  focus: item.focus,
  title: item.title,
  scopeLabel: item.scopeLabel,
  agronomicProfileId: item.agronomicProfileId,
  priorityScore: item.priorityScore,
  priorityConfidence: item.priorityConfidence,
  urgencyLabel: item.urgencyLabel,
  missingSignals: item.missingSignals,
  refinedContext:
    overrides?.refinedContext ||
    overrides?.decisionExplanation?.refinedContext ||
    null,
  decisionExplanation: overrides?.decisionExplanation || null,
  economicSummary: overrides?.economicSummary || null,
})

export const parseAgronomicQueueTaskMetadata = (
  notes?: string | null
): AgronomicQueueTaskMetadata | null => {
  return splitAgronomicQueueTaskNotes(notes).metadata
}

export const buildAgronomicQueueTaskOperationalSummary = (
  taskOrNotes?: Pick<GardenTask, 'notes'> | string | null
): AgronomicQueueTaskOperationalSummary | null => {
  const metadata =
    typeof taskOrNotes === 'string'
      ? parseAgronomicQueueTaskMetadata(taskOrNotes)
      : parseAgronomicQueueTaskMetadata(taskOrNotes?.notes)

  if (!metadata) {
    return null
  }

  const missingSignalsCount = metadata.missingSignals.length
  const confidence = metadata.priorityConfidence

  let readiness: AgronomicQueueTaskOperationalSummary['readiness'] = 'partial'
  let readinessLabel = 'Eseguibile con presidio'

  if (missingSignalsCount === 0 && confidence >= 0.75) {
    readiness = 'ready'
    readinessLabel = 'Pronto all esecuzione'
  } else if (missingSignalsCount >= 3 || confidence < 0.45) {
    readiness = 'blocked'
    readinessLabel = 'Verifica segnali prima di eseguire'
  } else if (missingSignalsCount > 0) {
    readiness = 'partial'
    readinessLabel = 'Eseguibile con dati parziali'
  }

  const primaryRationale =
    metadata.decisionExplanation?.agronomicRationale?.[0] ||
    metadata.decisionExplanation?.contextRationale?.[0]
  const evidenceLabels = FOCUS_EVIDENCE_LABELS[metadata.focus] || [
    'azione eseguita',
    'note operatore',
    'risultato osservato',
  ]

  return {
    readiness,
    readinessLabel,
    focusLabel: AGRONOMIC_FOCUS_LABELS[metadata.focus] || metadata.focus,
    urgencyLabel: AGRONOMIC_URGENCY_LABELS[metadata.urgencyLabel] || metadata.urgencyLabel,
    confidenceLabel: formatConfidenceLabel(confidence),
    mobileActionLabel: MOBILE_ACTION_LABELS[readiness],
    mobileEvidencePrompt: `Registra ${evidenceLabels.slice(0, 2).join(' + ')}`,
    evidenceLabels,
    missingSignalsLabel:
      missingSignalsCount > 0
        ? `Segnali mancanti: ${metadata.missingSignals
            .slice(0, 2)
            .map(humanizeAgronomicSignal)
            .join(', ')}${missingSignalsCount > 2 ? ' +' : ''}`
        : undefined,
    contextLabels: buildOperationalContextLabels(
      metadata.refinedContext || metadata.decisionExplanation?.refinedContext || null
    ),
    primaryRationale,
  }
}

const buildTaskNotes = (
  item: AgronomicActionQueueItem,
  metadata: AgronomicQueueTaskMetadata = buildAgronomicQueueTaskMetadata(item)
): string => {
  const visibleDescription = sanitizeAgronomicQueueVisibleText(item.description)
  const parts = [
    visibleDescription,
    `${AGRONOMIC_QUEUE_META_MARKER}${JSON.stringify(metadata)}`,
  ].filter(Boolean)

  return parts.join(' ')
}

export const stripAgronomicQueueTaskMetadata = (notes?: string | null): string => {
  return sanitizeAgronomicQueueVisibleText(splitAgronomicQueueTaskNotes(notes).visibleNotes)
}

export const preserveAgronomicQueueTaskMetadata = (
  originalNotes: string | null | undefined,
  visibleNotes: string | null | undefined
): string | undefined => {
  const { metadata } = splitAgronomicQueueTaskNotes(originalNotes)
  const cleanedVisibleNotes = visibleNotes?.trim()

  if (!metadata) {
    return cleanedVisibleNotes || undefined
  }

  const serializedMetadata = `${AGRONOMIC_QUEUE_META_MARKER}${JSON.stringify(metadata)}`
  return [cleanedVisibleNotes, serializedMetadata].filter(Boolean).join(' ')
}

function splitAgronomicQueueTaskNotes(notes?: string | null): {
  visibleNotes: string
  metadata: AgronomicQueueTaskMetadata | null
} {
  if (!notes || !notes.includes(AGRONOMIC_QUEUE_META_MARKER)) {
    return {
      visibleNotes: notes?.trim() || '',
      metadata: null,
    }
  }

  const markerIndex = notes.indexOf(AGRONOMIC_QUEUE_META_MARKER)
  const visibleNotes = notes.slice(0, markerIndex).trim()
  const rawPayload = notes.slice(markerIndex + AGRONOMIC_QUEUE_META_MARKER.length).trim()

  if (!rawPayload) {
    return {
      visibleNotes,
      metadata: null,
    }
  }

  try {
    return {
      visibleNotes,
      metadata: JSON.parse(rawPayload) as AgronomicQueueTaskMetadata,
    }
  } catch {
    return {
      visibleNotes: notes.trim(),
      metadata: null,
    }
  }
}

export function buildAgronomicQueueTaskDrafts(
  gardenId: string,
  queue: AgronomicActionQueueItem[],
  existingTasks: GardenTask[]
): AgronomicQueueTaskDraft[] {
  return queue.flatMap((item) => {
    const taskType = resolveTaskType(item)
    const suggestedBy = `${AGRONOMIC_QUEUE_SUGGESTED_BY_PREFIX}${item.id}`
    const alreadyOpen = existingTasks.some(
      (task) =>
        task.gardenId === gardenId &&
        task.suggestedBy === suggestedBy &&
        !task.completed
    )

    if (alreadyOpen) {
      return []
    }

    const date = resolveTaskDate(item)
    const metadata = buildAgronomicQueueTaskMetadata(item)

    return [
      {
        id: `draft:${item.id}`,
        sourceQueueId: item.id,
        source: item.source,
        title: formatAgronomicQueueTitle(item),
        priorityScore: item.priorityScore,
        priorityConfidence: item.priorityConfidence,
        urgencyLabel: item.urgencyLabel,
        missingSignals: item.missingSignals,
        economicSummary: metadata.economicSummary || null,
        decisionSnapshot: metadata.decisionSnapshot || null,
        task: {
          gardenId,
          plantName: resolvePlantName(item),
          taskType,
          date,
          nextDueDate: date,
          completed: false,
          isSuggested: true,
          aiGenerated: true,
          suggestedBy,
          suggestedDate: new Date().toISOString(),
          schedulingType: resolveSchedulingType(item),
          durationMinutes: resolveDurationMinutes(taskType),
          notes: buildTaskNotes(item, metadata),
        },
      },
    ]
  })
}
