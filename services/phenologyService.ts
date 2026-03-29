import type { Garden, PhenologyCropContextId, PhenologyObservation, PhenologyStage } from '@/types'
import type { IStorageProvider } from '@/packages/core/storage/interface'
import { inferHealthCropContext } from '@/utils/healthCropContext'

export interface CurrentPhenologyState {
  observation: PhenologyObservation
  stageLabel: string
  scopeLabel: string
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

export async function getCurrentPhenologyState(
  storageProvider: Pick<IStorageProvider, 'getPhenologyObservations'> | null | undefined,
  garden: Garden,
  scope: PhenologyScopeOptions = {}
): Promise<CurrentPhenologyState | null> {
  if (!storageProvider?.getPhenologyObservations) {
    return null
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
        stageLabel: getPhenologyStageLabel(observation.phenologyStage),
        scopeLabel: getScopeLabel(observation),
      }
    }
  }

  return null
}
