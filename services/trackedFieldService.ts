import type { IStorageProvider } from '@/packages/core/storage/interface'
import type { FieldWizardConfig, GardenPlant } from '@/types/individualPlant'
import type { FieldRow } from '@/services/fieldRowPlantIntegrationService'

type TrackedFieldStorage = Pick<
  IStorageProvider,
  'createFieldRow' | 'deleteFieldRow' | 'createIndividualPlant' | 'deleteIndividualPlant'
>

export interface TrackedFieldCreationResult {
  rows: FieldRow[]
  plants: GardenPlant[]
}

const requireCapability = <K extends keyof TrackedFieldStorage>(
  storage: Partial<TrackedFieldStorage>,
  capability: K
): NonNullable<TrackedFieldStorage[K]> => {
  const method = storage[capability]
  if (typeof method !== 'function') {
    throw new Error(`Tracked field requires cloud capability: ${capability}`)
  }
  return method.bind(storage) as NonNullable<TrackedFieldStorage[K]>
}

export async function createTrackedField(
  storage: Partial<TrackedFieldStorage>,
  gardenId: string,
  config: FieldWizardConfig
): Promise<TrackedFieldCreationResult> {
  const createRow = requireCapability(storage, 'createFieldRow')
  const deleteRow = requireCapability(storage, 'deleteFieldRow')
  const createPlant = requireCapability(storage, 'createIndividualPlant')
  const deletePlant = requireCapability(storage, 'deleteIndividualPlant')
  const plantsPerRow = Math.floor(config.rowLengthMeters * 100 / config.plantSpacingCm)
  if (!gardenId || config.rowCount < 1 || plantsPerRow < 1) {
    throw new Error('Invalid tracked field configuration')
  }

  const rows: FieldRow[] = []
  const plants: GardenPlant[] = []
  try {
    for (let rowNumber = 1; rowNumber <= config.rowCount; rowNumber += 1) {
      const row = await createRow({
        gardenId,
        name: `${config.zoneName} - Filare ${rowNumber}`,
        rowNumber,
        lengthMeters: config.rowLengthMeters,
        distanceFromPreviousRow: rowNumber === 1 ? 0 : config.rowSpacingCm,
        cultivar: config.variety || config.plantName,
        plantSpacing: config.plantSpacingCm,
        plantedDate: config.plantingDate,
        orientation: config.orientation,
        isActive: true,
        plantCount: plantsPerRow,
      })
      rows.push(row)

      const outcomes = await Promise.allSettled(
        Array.from({ length: plantsPerRow }, (_, index) =>
          createPlant({
            gardenId,
            fieldRowId: row.id,
            fieldRowName: row.name,
            positionInRow: index + 1,
            plantCode: `F${rowNumber}-P${String(index + 1).padStart(3, '0')}`,
            plantName: config.plantName,
            variety: config.variety,
            plantingDate: config.plantingDate,
            plantedDate: config.plantingDate,
            source: 'transplant',
            status: 'healthy',
            healthScore: 100,
            photos: [],
          })
        )
      )
      for (const outcome of outcomes) {
        if (outcome.status === 'fulfilled') plants.push(outcome.value)
      }
      const failed = outcomes.find(
        (outcome): outcome is PromiseRejectedResult => outcome.status === 'rejected'
      )
      if (failed) throw failed.reason
    }
    return { rows, plants }
  } catch (error) {
    await Promise.allSettled(plants.map(plant => deletePlant(plant.id)))
    await Promise.allSettled([...rows].reverse().map(row => deleteRow(row.id)))
    throw error
  }
}
