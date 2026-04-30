import type { Garden } from '@/types'

export type AIGroundingSource = 'realtime' | 'fallback' | 'static'

export interface AIGroundingContext {
  siteContext: {
    gardenId: string
    gardenName?: string
    gardenType?: string
    isControlledEnvironment: boolean
    systemTags: string[]
  }
  cropContext: {
    primaryCropId?: string
    primaryCropLabel?: string
  }
  source: AIGroundingSource
  confidence: number
  missingSignals: string[]
}

export interface AIAssistantGroundingContext {
  scope: 'global-chat' | 'planner-chat' | 'prediction' | 'advice' | 'health' | 'director'
  source: AIGroundingSource
  confidence: number
  contextSummary: string
  missingSignals: string[]
}

const controlledEnvironmentTypes = new Set([
  'Indoor',
  'Hydroponic',
  'Aquaponic',
  'Aeroponic',
  'Greenhouse',
])

export function buildAIGroundingContext(garden: Pick<Garden, 'id' | 'name' | 'gardenType' | 'primaryCrop' | 'indoorConfig' | 'hydroponicConfig' | 'aquaponicConfig' | 'aeroponicConfig' | 'greenhouseConfig' | 'hasIndoor' | 'hasGreenhouse'>): AIGroundingContext {
  const systemTags = [
    garden.indoorConfig ? 'indoorConfig' : null,
    garden.hydroponicConfig ? 'hydroponicConfig' : null,
    garden.aquaponicConfig ? 'aquaponicConfig' : null,
    garden.aeroponicConfig ? 'aeroponicConfig' : null,
    garden.greenhouseConfig ? 'greenhouseConfig' : null,
    garden.hasIndoor ? 'hasIndoor' : null,
    garden.hasGreenhouse ? 'hasGreenhouse' : null,
  ].filter(Boolean) as string[]

  const isControlledEnvironment =
    Boolean(garden.indoorConfig || garden.hydroponicConfig || garden.aquaponicConfig || garden.aeroponicConfig || garden.greenhouseConfig) ||
    controlledEnvironmentTypes.has(garden.gardenType || '')

  const missingSignals: string[] = []
  if (!garden.primaryCrop?.archetypeId) missingSignals.push('primaryCrop')
  if (!garden.gardenType) missingSignals.push('gardenType')
  if (!systemTags.length) missingSignals.push('systemConfig')

  const confidence = isControlledEnvironment
    ? (garden.primaryCrop?.archetypeId ? 0.82 : 0.7)
    : (garden.primaryCrop?.archetypeId ? 0.76 : 0.62)

  return {
    siteContext: {
      gardenId: garden.id,
      gardenName: garden.name,
      gardenType: garden.gardenType,
      isControlledEnvironment,
      systemTags,
    },
    cropContext: {
      primaryCropId: garden.primaryCrop?.archetypeId,
      primaryCropLabel: garden.primaryCrop?.label,
    },
    source: systemTags.length || garden.primaryCrop?.archetypeId ? 'realtime' : 'fallback',
    confidence,
    missingSignals,
  }
}

export function buildAIAssistantGroundingContext(params: {
  scope: AIAssistantGroundingContext['scope']
  garden?: Pick<Garden, 'id' | 'name' | 'gardenType' | 'primaryCrop' | 'indoorConfig' | 'hydroponicConfig' | 'aquaponicConfig' | 'aeroponicConfig' | 'greenhouseConfig' | 'hasIndoor' | 'hasGreenhouse'>
  extraSignals?: string[]
  summary?: string
}): AIAssistantGroundingContext {
  const gardenGrounding = params.garden ? buildAIGroundingContext(params.garden) : null
  const missingSignals = [...(gardenGrounding?.missingSignals || []), ...(params.extraSignals || [])]

  return {
    scope: params.scope,
    source: gardenGrounding?.source || 'static',
    confidence: gardenGrounding?.confidence || (params.summary ? 0.68 : 0.58),
    contextSummary:
      params.summary ||
      (gardenGrounding
        ? `Contesto AI per ${gardenGrounding.siteContext.gardenName || gardenGrounding.siteContext.gardenId}`
        : 'Contesto AI minimale senza giardino strutturato.'),
    missingSignals,
  }
}
