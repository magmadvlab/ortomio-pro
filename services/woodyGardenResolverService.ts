import { Garden } from '@/types'
import { orchardService } from '@/services/orchardService'
import { OrchardConfiguration } from '@/types/orchard'
import { vineyardService } from '@/services/vineyardService'
import { VineyardConfiguration } from '@/types/vineyard'

export interface OliveGardenContext {
  garden: Garden
  oliveOrchards: OrchardConfiguration[]
}

export interface VineyardGardenContext {
  garden: Garden
  vineyards: VineyardConfiguration[]
}

const uniqueStrings = (values: Array<string | undefined>): string[] => {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value))
    )
  )
}

const normalizeOliveGarden = (
  garden: Garden,
  oliveOrchards: OrchardConfiguration[]
): Garden => {
  if (garden.oliveGroveConfig) {
    return garden
  }

  const totalTrees = oliveOrchards.reduce((sum, orchard) => sum + (orchard.totalTrees || 0), 0)
  const varieties = uniqueStrings(
    oliveOrchards.flatMap((orchard) => orchard.mainVarieties?.map((item) => item.variety) || [])
  )

  return {
    ...garden,
    oliveGroveConfig: {
      type: 'DUAL_PURPOSE',
      establishedDate: oliveOrchards[0]?.establishedDate,
      totalTrees: totalTrees > 0 ? totalTrees : undefined,
      varieties: varieties.length > 0 ? varieties : undefined,
    },
  }
}

const normalizeVineyardGarden = (
  garden: Garden,
  vineyards: VineyardConfiguration[]
): Garden => {
  if (garden.vineyardConfig) {
    return garden
  }

  const totalVines = vineyards.reduce((sum, vineyard) => sum + (vineyard.totalVines || 0), 0)
  const firstType = vineyards[0]?.vineyardType
  const varieties = uniqueStrings(
    vineyards.flatMap((vineyard) => vineyard.mainVarieties?.map((item) => item.variety) || [])
  )

  return {
    ...garden,
    vineyardConfig: {
      type: firstType === 'table' ? 'TABLE' : 'WINE',
      establishedDate: vineyards[0]?.establishedDate
        ? new Date(vineyards[0].establishedDate).toISOString()
        : undefined,
      totalVines: totalVines > 0 ? totalVines : undefined,
      varieties: varieties.length > 0 ? varieties : undefined,
      trainingSystem:
        vineyards[0]?.trainingSystem === 'guyot'
          ? 'Guyot'
          : vineyards[0]?.trainingSystem === 'cordon'
            ? 'Cordon'
            : vineyards[0]?.trainingSystem === 'pergola'
              ? 'Pergola'
              : undefined,
    },
  }
}

export async function resolveOliveGardenContexts(gardens: Garden[]): Promise<OliveGardenContext[]> {
  const contexts = await Promise.all(
    gardens.map(async (garden) => {
      const orchards = await orchardService.getOrchardConfigurations(garden.id)
      const oliveOrchards = orchards.filter((orchard) => orchard.orchardType === 'olive')

      if (garden.gardenType !== 'OliveGrove' && !garden.oliveGroveConfig && oliveOrchards.length === 0) {
        return null
      }

      return {
        garden: normalizeOliveGarden(garden, oliveOrchards),
        oliveOrchards,
      }
    })
  )

  return contexts
    .filter((context): context is OliveGardenContext => Boolean(context))
    .sort((left, right) => {
      const leftScore = left.garden.gardenType === 'OliveGrove' ? 0 : 1
      const rightScore = right.garden.gardenType === 'OliveGrove' ? 0 : 1
      if (leftScore !== rightScore) return leftScore - rightScore
      return left.garden.name.localeCompare(right.garden.name)
    })
}

export async function resolveVineyardGardenContexts(gardens: Garden[]): Promise<VineyardGardenContext[]> {
  const contexts = await Promise.all(
    gardens.map(async (garden) => {
      const vineyards = await vineyardService.getVineyardConfigurations(garden.id)

      if (garden.gardenType !== 'Vineyard' && !garden.vineyardConfig && vineyards.length === 0) {
        return null
      }

      return {
        garden: normalizeVineyardGarden(garden, vineyards),
        vineyards,
      }
    })
  )

  return contexts
    .filter((context): context is VineyardGardenContext => Boolean(context))
    .sort((left, right) => {
      const leftScore = left.garden.gardenType === 'Vineyard' ? 0 : 1
      const rightScore = right.garden.gardenType === 'Vineyard' ? 0 : 1
      if (leftScore !== rightScore) return leftScore - rightScore
      return left.garden.name.localeCompare(right.garden.name)
    })
}
