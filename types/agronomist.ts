/**
 * Agronomist Types
 * System for managing trusted agronomists and their consultations
 */

/**
 * Agronomist - Trusted agronomist contact
 */
export interface Agronomist {
  id: string;
  userId: string;  // User who has this agronomist
  
  // Agronomist data
  name: string;
  email?: string;
  phone?: string;
  specialization?: string[];  // e.g. ['Fragole', 'Frutteti', 'Olive']
  notes?: string;  // General notes
  
  // Preferences
  preferredContactMethod: 'Email' | 'Phone' | 'InPerson';
  consultationFrequency?: 'Weekly' | 'Monthly' | 'Seasonal' | 'OnDemand';
  
  createdAt: string;
  updatedAt: string;
}

/**
 * Agronomist Consultation - Record of a consultation
 */
export interface AgronomistConsultation {
  id: string;
  agronomistId: string;
  userId: string;
  gardenId?: string;
  taskId?: string;  // If related to a specific task
  
  // Consultation details
  date: string;
  consultationType: 'InPerson' | 'Phone' | 'Email' | 'Video';
  topic: string;  // Consultation topic
  
  // Advice received
  advice: {
    plantName?: string;
    issue?: string;
    recommendation: string;
    priority: 'High' | 'Medium' | 'Low';
    followUpDate?: string;
  }[];
  
  // Personal notes
  notes?: string;
  
  // Attachments (photos, documents)
  attachments?: string[];  // URLs or base64
  
  createdAt: string;
}

/**
 * Agronomist Advice - Specific advice from agronomist (for integration with tasks)
 */
export interface AgronomistAdvice {
  id: string;
  consultationId: string;
  taskId?: string;
  
  // Specific advice
  adviceText: string;
  category: 'Fertilization' | 'Pruning' | 'Irrigation' | 'Disease' | 'Harvest' | 'Other';
  priority: 'High' | 'Medium' | 'Low';
  
  // When to apply
  applyDate?: string;
  applySeason?: ('Spring' | 'Summer' | 'Autumn' | 'Winter')[];
  
  // Status
  applied: boolean;
  appliedDate?: string;
  result?: string;  // Result after application
  
  createdAt: string;
}




















