import type { OrchardTree } from '@/types/orchard'

export type NewOrchardTree = Omit<OrchardTree, 'id' | 'createdAt' | 'updatedAt'>

export function validateWizardOrchardTreeInputs(
  treeData: Partial<OrchardTree>[],
  gardenId: string
): void {
  if (!gardenId) {
    throw new Error('orchard_tree_scope_required')
  }

  treeData.forEach((tree, index) => {
    if (!tree.treeNumber?.trim() || !tree.variety?.trim()) {
      throw new Error(`orchard_tree_identity_required:${index}`)
    }
  })
}

export function buildWizardOrchardTrees(
  treeData: Partial<OrchardTree>[],
  orchardId: string,
  gardenId: string
): NewOrchardTree[] {
  if (!orchardId) {
    throw new Error('orchard_tree_scope_required')
  }

  validateWizardOrchardTreeInputs(treeData, gardenId)

  return treeData.map((tree) => {
    const treeNumber = tree.treeNumber?.trim()
    const variety = tree.variety?.trim()

    return {
      ...tree,
      orchardId,
      gardenId,
      treeNumber: treeNumber!,
      variety: variety!,
      healthStatus: tree.healthStatus || 'healthy',
      vigorLevel: tree.vigorLevel || 'normal',
      productivityStatus: tree.productivityStatus || 'young',
      cumulativeYieldKg: tree.cumulativeYieldKg ?? 0,
      needsPruning: tree.needsPruning ?? false,
      needsTreatment: tree.needsTreatment ?? false,
      needsReplacement: tree.needsReplacement ?? false,
      isActive: tree.isActive ?? true,
    }
  })
}
