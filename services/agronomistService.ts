/**
 * Agronomist Service
 * Manages agronomists, consultations, and advice
 */

import { Agronomist, AgronomistConsultation, AgronomistAdvice } from '../types/agronomist';

/**
 * Create a new agronomist
 */
export const createAgronomist = async (
  userId: string,
  name: string,
  email?: string,
  phone?: string,
  specialization?: string[],
  notes?: string,
  preferredContactMethod: 'Email' | 'Phone' | 'InPerson' = 'Email',
  consultationFrequency?: 'Weekly' | 'Monthly' | 'Seasonal' | 'OnDemand'
): Promise<Agronomist> => {
  const agronomist: Agronomist = {
    id: crypto.randomUUID(),
    userId,
    name,
    email,
    phone,
    specialization: specialization || [],
    notes,
    preferredContactMethod,
    consultationFrequency,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return agronomist;
};

/**
 * Get all agronomists for a user
 */
export const getAgronomists = async (userId: string): Promise<Agronomist[]> => {
  // This will be implemented by storage provider
  return [];
};

/**
 * Create a consultation
 */
export const createConsultation = async (
  agronomistId: string,
  userId: string,
  date: string,
  consultationType: 'InPerson' | 'Phone' | 'Email' | 'Video',
  topic: string,
  advice: AgronomistConsultation['advice'],
  gardenId?: string,
  taskId?: string,
  notes?: string,
  attachments?: string[]
): Promise<AgronomistConsultation> => {
  const consultation: AgronomistConsultation = {
    id: crypto.randomUUID(),
    agronomistId,
    userId,
    gardenId,
    taskId,
    date,
    consultationType,
    topic,
    advice,
    notes,
    attachments: attachments || [],
    createdAt: new Date().toISOString(),
  };

  return consultation;
};

/**
 * Get consultations for a user
 */
export const getConsultations = async (
  userId: string,
  agronomistId?: string
): Promise<AgronomistConsultation[]> => {
  // This will be implemented by storage provider
  return [];
};

/**
 * Create advice from a consultation
 */
export const createAdvice = async (
  consultationId: string,
  adviceText: string,
  category: 'Fertilization' | 'Pruning' | 'Irrigation' | 'Disease' | 'Harvest' | 'Other',
  priority: 'High' | 'Medium' | 'Low',
  taskId?: string,
  applyDate?: string,
  applySeason?: ('Spring' | 'Summer' | 'Autumn' | 'Winter')[]
): Promise<AgronomistAdvice> => {
  const advice: AgronomistAdvice = {
    id: crypto.randomUUID(),
    consultationId,
    taskId,
    adviceText,
    category,
    priority,
    applyDate,
    applySeason: applySeason || [],
    applied: false,
    createdAt: new Date().toISOString(),
  };

  return advice;
};

/**
 * Get advice for a task
 */
export const getAdviceForTask = async (taskId: string): Promise<AgronomistAdvice[]> => {
  // This will be implemented by storage provider
  return [];
};

/**
 * Mark advice as applied
 */
export const markAdviceApplied = async (
  adviceId: string,
  result?: string
): Promise<void> => {
  // This will be implemented by storage provider
};















