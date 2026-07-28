import type { OrchardType } from '@/types/orchard'
import type { FruitTreeCategory } from '@/types/orchardTypes'

export const TROPICAL_FRUIT_TREE_CATEGORY: FruitTreeCategory = 'ESOTICHE'

export function getDefaultFruitTreeCategory(
  orchardType: OrchardType
): FruitTreeCategory | '' {
  return orchardType === 'tropical' ? TROPICAL_FRUIT_TREE_CATEGORY : ''
}

export function synchronizeOrchardTypeWithCategory(
  currentType: OrchardType,
  category: FruitTreeCategory | ''
): OrchardType {
  if (category === TROPICAL_FRUIT_TREE_CATEGORY) {
    return 'tropical'
  }

  return currentType === 'tropical' ? 'mixed' : currentType
}
