import type { Garden } from '@/types'
import type { GardenTask } from '@/types'
import type { GardenZone } from '@/types'
import type { GardenBed } from '@/types/gardenBed'
import type { FieldRow } from '@/types/fieldRow'
import type { SmartDevice } from '@/types'
import type { IStorageProvider } from '@/packages/core/storage/interface'
import { logServiceError } from '@/utils/serviceError'

export interface ResolvedGardenContext {
  garden: Garden
  history: {
    taskCount: number
    openTaskCount: number
    recentTaskTitles: string[]
  }
  structure: {
    structureConfig: Garden['structureConfig'] | null
    openFieldSpace: Garden['openFieldSpace'] | null
    greenhouseSpace: Garden['greenhouseSpace'] | null
    indoorSpace: Garden['indoorSpace'] | null
    beds: GardenBed[]
    zones: GardenZone[]
    fieldRows: FieldRow[]
  }
  site: {
    altitudeMeters: number | null
    soilType: Garden['soilType'] | null
    soilPh: number | null
    sunExposure: Garden['sunExposure'] | null
    aspectDirection: Garden['aspectDirection'] | null
    windProtection: Garden['windProtection'] | null
    slopePercentage: number | null
    obstacles: Garden['obstacles'] | null
  }
  systems: {
    greenhouseConfig: Garden['greenhouseConfig'] | null
    indoorConfig: Garden['indoorConfig'] | null
    hydroponicConfig: Garden['hydroponicConfig'] | null
    aquaponicConfig: Garden['aquaponicConfig'] | null
    aeroponicConfig: Garden['aeroponicConfig'] | null
    devices: SmartDevice[]
  }
  crop: {
    primaryCropId: string | null
    primaryCropLabel: string | null
    orchardConfig: Garden['orchardConfig'] | null
    oliveGroveConfig: Garden['oliveGroveConfig'] | null
    vineyardConfig: Garden['vineyardConfig'] | null
  }
}

export async function resolveGardenContext(
  storageProvider: IStorageProvider | null | undefined,
  gardenId: string
): Promise<ResolvedGardenContext | null> {
  if (!storageProvider?.getGarden) return null

  let garden: Awaited<ReturnType<NonNullable<typeof storageProvider.getGarden>>> | null = null
  try {
    garden = await storageProvider.getGarden(gardenId)
  } catch (err) {
    logServiceError(err, 'GARDEN_CONTEXT_RESOLVER_ERROR', { gardenId })
    return null
  }
  if (!garden) return null

  const [tasks, beds, zones, fieldRows, devices] = await Promise.all([
    storageProvider.getTasks?.(gardenId).catch(() => [] as GardenTask[]) || Promise.resolve([] as GardenTask[]),
    storageProvider.getGardenBeds?.(gardenId).catch(() => [] as GardenBed[]) || Promise.resolve([] as GardenBed[]),
    storageProvider.getGardenZones?.(gardenId).catch(() => [] as GardenZone[]) || Promise.resolve([] as GardenZone[]),
    storageProvider.getFieldRows?.(gardenId).catch(() => [] as FieldRow[]) || Promise.resolve([] as FieldRow[]),
    storageProvider.getDevices?.(gardenId).catch(() => [] as SmartDevice[]) || Promise.resolve([] as SmartDevice[]),
  ])

  const openTasks = tasks.filter((task) => !task.completed)

  return {
    garden,
    history: {
      taskCount: tasks.length,
      openTaskCount: openTasks.length,
      recentTaskTitles: openTasks.slice(0, 5).map((task) => task.plantName).filter(Boolean),
    },
    structure: {
      structureConfig: garden.structureConfig || null,
      openFieldSpace: garden.openFieldSpace || null,
      greenhouseSpace: garden.greenhouseSpace || null,
      indoorSpace: garden.indoorSpace || null,
      beds,
      zones,
      fieldRows,
    },
    site: {
      altitudeMeters: garden.altitudeMeters ?? null,
      soilType: garden.soilType || null,
      soilPh: garden.soilPh ?? null,
      sunExposure: garden.sunExposure || null,
      aspectDirection: garden.aspectDirection || null,
      windProtection: garden.windProtection || null,
      slopePercentage: (garden as any).slopePercentage ?? null,
      obstacles: garden.obstacles || null,
    },
    systems: {
      greenhouseConfig: garden.greenhouseConfig || null,
      indoorConfig: garden.indoorConfig || null,
      hydroponicConfig: garden.hydroponicConfig || null,
      aquaponicConfig: garden.aquaponicConfig || null,
      aeroponicConfig: garden.aeroponicConfig || null,
      devices,
    },
    crop: {
      primaryCropId: garden.primaryCrop?.archetypeId || null,
      primaryCropLabel: garden.primaryCrop?.label || null,
      orchardConfig: garden.orchardConfig || null,
      oliveGroveConfig: garden.oliveGroveConfig || null,
      vineyardConfig: garden.vineyardConfig || null,
    },
  }
}
