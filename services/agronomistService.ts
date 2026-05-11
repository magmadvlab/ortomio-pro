/**
 * Agronomist Service
 * Manages agronomists, consultations, and advice
 */

import { Agronomist, AgronomistConsultation, AgronomistAdvice } from '../types/agronomist';

type AgronomistStorageAdapter = {
  createAgronomist?: (agronomist: Omit<Agronomist, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Agronomist>
  getAgronomists?: (userId: string) => Promise<Agronomist[]>
  createConsultation?: (consultation: Omit<AgronomistConsultation, 'id' | 'createdAt'>) => Promise<AgronomistConsultation>
  getConsultations?: (userId: string, agronomistId?: string) => Promise<AgronomistConsultation[]>
  createAdvice?: (advice: Omit<AgronomistAdvice, 'id' | 'createdAt'>) => Promise<AgronomistAdvice>
  getAgronomistAdvice?: (taskId: string) => Promise<AgronomistAdvice[]>
  updateAdvice?: (id: string, updates: Partial<AgronomistAdvice>) => Promise<AgronomistAdvice>
}

const persistFallbackEnabled = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const readLocal = <T>(key: string): T[] => {
  if (!persistFallbackEnabled) return []
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T[] : []
  } catch {
    return []
  }
}

const writeLocal = <T>(key: string, items: T[]) => {
  if (!persistFallbackEnabled) return
  window.localStorage.setItem(key, JSON.stringify(items))
}

const AGRONOMIST_KEYS = {
  agronomists: 'ortomio:agronomists:v1',
  consultations: 'ortomio:agronomist-consultations:v1',
  advice: 'ortomio:agronomist-advice:v1',
}

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
  consultationFrequency?: 'Weekly' | 'Monthly' | 'Seasonal' | 'OnDemand',
  storageProvider?: AgronomistStorageAdapter
): Promise<Agronomist> => {
  if (storageProvider?.createAgronomist) {
    return storageProvider.createAgronomist({
      userId,
      name,
      email,
      phone,
      specialization: specialization || [],
      notes,
      preferredContactMethod,
      consultationFrequency,
    })
  }

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
  return readLocal<Agronomist>(AGRONOMIST_KEYS.agronomists).filter(a => a.userId === userId);
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
  attachments?: string[],
  storageProvider?: AgronomistStorageAdapter
): Promise<AgronomistConsultation> => {
  if (storageProvider?.createConsultation) {
    return storageProvider.createConsultation({
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
    })
  }

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
  agronomistId?: string,
  storageProvider?: AgronomistStorageAdapter
): Promise<AgronomistConsultation[]> => {
  if (storageProvider?.getConsultations) {
    return storageProvider.getConsultations(userId, agronomistId)
  }

  const consultations = readLocal<AgronomistConsultation>(AGRONOMIST_KEYS.consultations)
  return consultations.filter(c => c.userId === userId && (!agronomistId || c.agronomistId === agronomistId))
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
  applySeason?: ('Spring' | 'Summer' | 'Autumn' | 'Winter')[],
  storageProvider?: AgronomistStorageAdapter
): Promise<AgronomistAdvice> => {
  if (storageProvider?.createAdvice) {
    return storageProvider.createAdvice({
      consultationId,
      taskId,
      adviceText,
      category,
      priority,
      applyDate,
      applySeason: applySeason || [],
      applied: false,
      createdAt: new Date().toISOString(),
    } as Omit<AgronomistAdvice, 'id' | 'createdAt'>)
  }

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
  return readLocal<AgronomistAdvice>(AGRONOMIST_KEYS.advice).filter(a => a.taskId === taskId);
};

/**
 * Mark advice as applied
 */
export const markAdviceApplied = async (
  adviceId: string,
  result?: string,
  storageProvider?: AgronomistStorageAdapter
): Promise<void> => {
  if (storageProvider?.updateAdvice) {
    await storageProvider.updateAdvice(adviceId, {
      applied: true,
      result,
      appliedDate: new Date().toISOString(),
    })
    return
  }

  const advice = readLocal<AgronomistAdvice>(AGRONOMIST_KEYS.advice)
  const index = advice.findIndex(item => item.id === adviceId)
  if (index >= 0) {
    advice[index] = {
      ...advice[index],
      applied: true,
      result,
      appliedDate: new Date().toISOString(),
    }
    writeLocal(AGRONOMIST_KEYS.advice, advice)
  }
};





















