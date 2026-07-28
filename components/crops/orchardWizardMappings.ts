import type { FruitTreeCategory } from '../../types/orchardTypes';
import type { OrchardType } from '../../types/orchard';
import type { VineyardTrainingSystem, VineyardType } from '../../types/vineyard';

export type VineTypeSelection = 'WINE' | 'TABLE';
export type TrainingSystemSelection =
  | 'Guyot'
  | 'Cordon'
  | 'Pergola'
  | 'Alberello'
  | 'Tendone'
  | 'Spalliera'
  | 'Sylvoz'
  | 'GDC'
  | 'Casarsa'
  | 'Bellussi';

const orchardTypeByCategory: Record<FruitTreeCategory, OrchardType> = {
  DRUPACEE: 'mixed',
  POMACEE: 'mixed',
  AGRUMI: 'citrus',
  FRUTTA_GUSCIO: 'mixed',
  MEDITERRANEA: 'mixed',
  KIWI: 'mixed',
  ESOTICHE: 'tropical',
};

const vineyardTrainingSystemBySelection: Record<
  TrainingSystemSelection,
  VineyardTrainingSystem
> = {
  Guyot: 'guyot',
  Cordon: 'cordon',
  Pergola: 'pergola',
  Alberello: 'other',
  Tendone: 'tendone',
  Spalliera: 'other',
  Sylvoz: 'sylvoz',
  GDC: 'other',
  Casarsa: 'other',
  Bellussi: 'other',
};

export const toPersistedOrchardType = (category: FruitTreeCategory): OrchardType =>
  orchardTypeByCategory[category];

export const toPersistedVineyardType = (selection: VineTypeSelection): VineyardType =>
  selection === 'TABLE' ? 'table' : 'wine';

export const toPersistedVineyardTrainingSystem = (
  selection: TrainingSystemSelection
): VineyardTrainingSystem => vineyardTrainingSystemBySelection[selection];
