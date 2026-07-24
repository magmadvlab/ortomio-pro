/**
 * Custom Plan Service
 * Manages custom plans for expert farmers
 */

import { CustomPlan } from '../types/customPlan';
import { PlantMasterSheet } from '../types';
import { getMasterSheet } from './plantMasterService';
import type { IStorageProvider } from '../packages/core/storage/interface';

type CustomPlanStorage = Pick<
  IStorageProvider,
  'createCustomPlan' | 'getCustomPlan' | 'getUserCustomPlans' | 'updateTask'
>;

const hydrateCustomPlan = async (plan: CustomPlan): Promise<CustomPlan> => {
  const baseMasterSheet = await getMasterSheet(plan.baseMasterSheetId);
  if (!baseMasterSheet) {
    throw new Error(`Master sheet not found: ${plan.baseMasterSheetId}`);
  }
  return { ...baseMasterSheet, ...plan };
};

/**
 * Create a custom plan from a master sheet
 */
export const createCustomPlan = async (
  storageProvider: CustomPlanStorage,
  baseMasterSheetId: string,
  name: string,
  userId: string,
  overrides: CustomPlan['overrides'],
  customNotes?: CustomPlan['customNotes'],
  customMethods?: CustomPlan['customMethods'],
  gardenId?: string,
  description?: string
): Promise<CustomPlan> => {
  const baseMasterSheet = await getMasterSheet(baseMasterSheetId);
  if (!baseMasterSheet) {
    throw new Error(`Master sheet not found: ${baseMasterSheetId}`);
  }

  const customPlan: Omit<CustomPlan, 'id' | 'createdAt' | 'updatedAt'> = {
    ...baseMasterSheet,
    baseMasterSheetId,
    userId,
    gardenId,
    name,
    description,
    overrides,
    customNotes: customNotes || [],
    customMethods: customMethods || [],
    isPublic: false,
  };

  return hydrateCustomPlan(await storageProvider.createCustomPlan(customPlan));
};

/**
 * Get a custom plan by ID
 */
export const getCustomPlan = async (
  storageProvider: CustomPlanStorage,
  planId: string
): Promise<CustomPlan | null> => {
  const plan = await storageProvider.getCustomPlan(planId);
  return plan ? hydrateCustomPlan(plan) : null;
};

/**
 * Get all custom plans for a user
 */
export const getUserCustomPlans = async (
  storageProvider: CustomPlanStorage,
  userId: string,
  gardenId?: string
): Promise<CustomPlan[]> => {
  const plans = await storageProvider.getUserCustomPlans(userId, gardenId);
  return Promise.all(plans.map(hydrateCustomPlan));
};

/**
 * Apply a custom plan to a task
 */
export const applyCustomPlanToTask = async (
  storageProvider: CustomPlanStorage,
  taskId: string,
  planId: string
): Promise<void> => {
  const plan = await storageProvider.getCustomPlan(planId);
  if (!plan) throw new Error(`Custom plan not found: ${planId}`);
  await storageProvider.updateTask(taskId, { customPlanId: plan.id });
};

/**
 * Merge custom plan with master sheet to get final plan
 */
export const mergePlanWithMaster = async (customPlan: CustomPlan): Promise<PlantMasterSheet> => {
  const baseMasterSheet = await getMasterSheet(customPlan.baseMasterSheetId);
  if (!baseMasterSheet) {
    throw new Error(`Master sheet not found: ${customPlan.baseMasterSheetId}`);
  }

  // Start with base master sheet
  const merged: PlantMasterSheet = { ...baseMasterSheet };

  // Apply overrides
  if (customPlan.overrides.germination) {
    merged.germination = { ...merged.germination, ...customPlan.overrides.germination };
  }
  if (customPlan.overrides.transplanting) {
    merged.transplanting = { ...merged.transplanting, ...customPlan.overrides.transplanting };
  }
  if (customPlan.overrides.baseInstructions) {
    merged.baseInstructions = { ...merged.baseInstructions, ...customPlan.overrides.baseInstructions };
  }
  if (customPlan.overrides.susceptibility) {
    merged.susceptibility = {
      ...merged.susceptibility,
      ...customPlan.overrides.susceptibility,
      fungalDiseases: customPlan.overrides.susceptibility.fungalDiseases ?? merged.susceptibility?.fungalDiseases ?? [],
      pests: customPlan.overrides.susceptibility.pests ?? merged.susceptibility?.pests ?? [],
      preventiveStrategy: customPlan.overrides.susceptibility.preventiveStrategy ?? merged.susceptibility?.preventiveStrategy ?? 'MEDIUM',
    };
  }

  return merged;
};








