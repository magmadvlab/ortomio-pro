import type { Garden, PhenologyCropContextId, PhenologyObservation, PhenologyStage } from '@/types'
import type { IStorageProvider } from '@/packages/core/storage/interface'
import { inferHealthCropContext } from '@/utils/healthCropContext'
import {
  getAgronomicCropProfileById,
  resolveAgronomicCropProfile,
} from '@/services/agronomicKernelService'
import type {
  AgronomicCropProfile,
  ResolvedAgronomicCropProfile,
} from '@/types/agronomicKernel'
import type { ArchetypeId } from '@/types/archetypes'
import type { FunctionalCategory } from '@/data/plantTaxonomy'

export interface CurrentPhenologyState {
  observation?: PhenologyObservation | null
  stageKey: string
  stageLabel: string
  scopeLabel: string
  source: 'observation' | 'agronomic_fallback'
  confidence: number
  profileId?: string
}

const PHENOLOGY_STAGE_LABELS: Record<PhenologyStage, string> = {
  dormancy: 'Dormienza',
  bud_break: 'Germogliamento',
  flowering: 'Fioritura',
  fruit_set: 'Allegagione',
  fruit_growth: 'Accrescimento frutto',
  fruit_maturation: 'Maturazione frutto',
  harvest: 'Raccolta',
  leaf_fall: 'Caduta foglie',
  pit_hardening: 'Indurimento nocciolo',
  veraison: 'Invaiatura',
  shoot_growth: 'Accrescimento germogli',
  ripening: 'Maturazione',
}

type PhenologyScopeOptions = {
  zoneId?: string
  fieldRowId?: string
  treeId?: string
  plantId?: string
}

export interface PhenologyFallbackOptions {
  cropName?: string
  profileId?: string
  archetypeId?: ArchetypeId
  functionalCategory?: FunctionalCategory
}

function getScopeLabel(observation: PhenologyObservation): string {
  if (observation.plantId) return `pianta ${observation.plantId}`
  if (observation.treeId) return `albero ${observation.treeId}`
  if (observation.fieldRowId) return `filare ${observation.fieldRowId}`
  if (observation.zoneId) return `zona ${observation.zoneId}`
  return 'giardino'
}

function resolveCropContextId(garden: Garden): PhenologyCropContextId | null {
  const context = inferHealthCropContext(garden)
  return context.id === 'generic' ? null : context.id
}

export function getPhenologyStageLabel(stage: PhenologyStage): string {
  return PHENOLOGY_STAGE_LABELS[stage] ?? stage
}

function humanizeStageLabel(stage: string): string {
  return stage
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function getPhenologyFallbackLabel(stage: string): string {
  return PHENOLOGY_STAGE_LABELS[stage as PhenologyStage] ?? humanizeStageLabel(stage)
}

function getFallbackProfileForGarden(garden: Garden): AgronomicCropProfile | null {
  if (garden.vineyardConfig || garden.gardenType === 'Vineyard') {
    return getAgronomicCropProfileById('vineyard_quality')
  }

  if (garden.oliveGroveConfig || garden.gardenType === 'OliveGrove') {
    return getAgronomicCropProfileById('olive_grove_oil')
  }

  if (garden.orchardConfig || garden.gardenType === 'Orchard') {
    return getAgronomicCropProfileById('orchard_generic')
  }

  if (
    garden.indoorConfig ||
    garden.hydroponicConfig ||
    garden.aquaponicConfig ||
    garden.aeroponicConfig ||
    garden.gardenType === 'Indoor' ||
    garden.gardenType === 'Hydroponic' ||
    garden.gardenType === 'Aquaponic' ||
    garden.gardenType === 'Aeroponic'
  ) {
    return getAgronomicCropProfileById('controlled_environment_leafy')
  }

  return null
}

async function resolveFallbackPhenologyProfile(
  garden: Garden,
  scope: PhenologyScopeOptions,
  options: PhenologyFallbackOptions
): Promise<ResolvedAgronomicCropProfile | null> {
  if (options.profileId) {
    const directProfile = getAgronomicCropProfileById(options.profileId)
    if (directProfile) {
      return {
        profile: directProfile,
        source: 'fallback',
        matchedBy: options.profileId,
        warnings: ['Phenology fallback resolved through explicit agronomic profile id.'],
      }
    }
  }

  const resolvedProfile = await resolveAgronomicCropProfile({
    plantId: options.cropName || scope.plantId,
    archetypeId: options.archetypeId,
    functionalCategory: options.functionalCategory,
  })

  if (options.cropName || scope.plantId || options.archetypeId || options.functionalCategory) {
    return resolvedProfile
  }

  const fallbackProfile = getFallbackProfileForGarden(garden)
  if (!fallbackProfile) {
    return null
  }

  return {
    profile: fallbackProfile,
    source: 'fallback',
    matchedBy: garden.gardenType || 'garden_context',
    warnings: ['Phenology fallback resolved from garden context because no observation was available.'],
  }
}

export async function getCurrentPhenologyState(
  storageProvider: Pick<IStorageProvider, 'getPhenologyObservations'> | null | undefined,
  garden: Garden,
  scope: PhenologyScopeOptions = {},
  options: PhenologyFallbackOptions = {}
): Promise<CurrentPhenologyState | null> {
  if (!storageProvider?.getPhenologyObservations) {
    const fallbackProfile = await resolveFallbackPhenologyProfile(garden, scope, options)
    if (!fallbackProfile) {
      return null
    }

    const stageKey =
      fallbackProfile.profile.phenology.decisionCriticalStages[0] ||
      fallbackProfile.profile.phenology.stages[0]

    if (!stageKey) {
      return null
    }

    return {
      observation: null,
      stageKey,
      stageLabel: getPhenologyFallbackLabel(stageKey),
      scopeLabel: scope.plantId ? `pianta ${scope.plantId}` : 'profilo agronomico',
      source: 'agronomic_fallback',
      confidence: fallbackProfile.source === 'plant_id' ? 0.68 : 0.52,
      profileId: fallbackProfile.profile.id,
    }
  }

  const cropContextId = resolveCropContextId(garden)
  if (!cropContextId) {
    return null
  }

  const scopes: Array<Required<Pick<PhenologyObservation, 'scopeType'>> & { scopeId?: string } & PhenologyScopeOptions> = []

  if (scope.plantId) scopes.push({ scopeType: 'plant', scopeId: scope.plantId, plantId: scope.plantId })
  if (scope.treeId) scopes.push({ scopeType: 'tree', scopeId: scope.treeId, treeId: scope.treeId })
  if (scope.fieldRowId) scopes.push({ scopeType: 'field_row', scopeId: scope.fieldRowId, fieldRowId: scope.fieldRowId })
  if (scope.zoneId) scopes.push({ scopeType: 'zone', scopeId: scope.zoneId, zoneId: scope.zoneId })
  scopes.push({ scopeType: 'garden' })

  for (const scopeCandidate of scopes) {
    const observations = await storageProvider.getPhenologyObservations(garden.id, {
      cropContextId,
      scopeType: scopeCandidate.scopeType,
      scopeId: scopeCandidate.scopeId,
      zoneId: scopeCandidate.zoneId,
      fieldRowId: scopeCandidate.fieldRowId,
      treeId: scopeCandidate.treeId,
      plantId: scopeCandidate.plantId,
      limit: 1,
    })

    const observation = observations[0]
    if (observation) {
      return {
        observation,
        stageKey: observation.phenologyStage,
        stageLabel: getPhenologyStageLabel(observation.phenologyStage),
        scopeLabel: getScopeLabel(observation),
        source: 'observation',
        confidence:
          typeof observation.confidenceLevel === 'number'
            ? observation.confidenceLevel > 1
              ? observation.confidenceLevel / 100
              : observation.confidenceLevel
            : 0.9,
      }
    }
  }

  const fallbackProfile = await resolveFallbackPhenologyProfile(garden, scope, options)
  if (!fallbackProfile) {
    return null
  }

  const stageKey =
    fallbackProfile.profile.phenology.decisionCriticalStages[0] ||
    fallbackProfile.profile.phenology.stages[0]

  if (!stageKey) {
    return null
  }

  const baseConfidence =
    fallbackProfile.source === 'plant_id'
      ? 0.66
      : fallbackProfile.source === 'custom_crop'
        ? 0.62
        : fallbackProfile.source === 'taxonomy' || fallbackProfile.source === 'functional_category'
          ? 0.56
          : 0.48

  return {
    observation: null,
    stageKey,
    stageLabel: getPhenologyFallbackLabel(stageKey),
    scopeLabel: scope.plantId ? `pianta ${scope.plantId}` : 'profilo agronomico',
    source: 'agronomic_fallback',
    confidence: baseConfidence,
    profileId: fallbackProfile.profile.id,
  }
}
