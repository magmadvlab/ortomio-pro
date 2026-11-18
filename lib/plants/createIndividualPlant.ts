import type { GardenPlant } from '@/types/individualPlant'

export type PlantInput = {
  gardenId: string; plantName: string; plantCode: string; variety?: string;
  fieldRowId?: string; positionInRow: number; plantingDate?: string;
  status: GardenPlant['status']; healthScore: number; notes?: string
}

export function buildIndividualPlant(input: PlantInput): Omit<GardenPlant, 'id' | 'createdAt' | 'updatedAt'> {
  if (!input.gardenId || !input.plantName.trim() || !input.plantCode.trim()) throw new Error('Inserisci terreno, nome e codice della pianta.')
  if (!Number.isInteger(input.positionInRow) || input.positionInRow < 1) throw new Error('La posizione deve essere un numero intero maggiore di zero.')
  if (!Number.isFinite(input.healthScore) || input.healthScore < 0 || input.healthScore > 100) throw new Error('Inserisci la valutazione osservata tra 0 e 100.')
  if (!['healthy', 'diseased', 'dead', 'harvested', 'transplanted'].includes(input.status)) throw new Error('Seleziona lo stato osservato della pianta.')
  if (input.plantingDate) {
    const date = new Date(`${input.plantingDate}T00:00:00Z`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.plantingDate) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== input.plantingDate) throw new Error('Controlla la data di impianto.')
  }
  return { ...input, plantName: input.plantName.trim(), plantCode: input.plantCode.trim(), variety: input.variety?.trim() || undefined, fieldRowId: input.fieldRowId || undefined, plantingDate: input.plantingDate || undefined, notes: input.notes?.trim() || undefined, photos: [] }
}
