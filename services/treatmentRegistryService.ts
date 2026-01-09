/**
 * Treatment Registry Service
 * Registro trattamenti fitosanitari per professionisti (obbligatorio)
 */

import { PhytoProduct } from '../data/phytoproducts';

export interface TreatmentRecord {
  id: string;
  gardenId: string;
  taskId?: string;
  productId: string;
  productName: string;
  plantName: string;
  treatmentDate: Date;
  dosage: string;
  applicationMethod: string;
  targetPestDisease: string;
  weatherConditions?: {
    temp: number;
    humidity: number;
    wind: number;
  };
  safetyIntervalEndDate: Date;
  notes?: string;
  createdAt: Date;
}

/**
 * Registra trattamento
 */
export async function registerTreatment(
  gardenId: string,
  treatmentData: {
    taskId?: string;
    product: PhytoProduct;
    plantName: string;
    treatmentDate: Date;
    dosage: string;
    applicationMethod: string;
    targetPestDisease: string;
    weatherConditions?: { temp: number; humidity: number; wind: number };
    notes?: string;
  }
): Promise<TreatmentRecord> {
  // TODO: Implementare salvataggio in Supabase
  const storageKey = `treatment_registry_${gardenId}`;
  const stored = localStorage.getItem(storageKey);
  const records: TreatmentRecord[] = stored ? JSON.parse(stored) : [];

  const safetyIntervalEndDate = new Date(treatmentData.treatmentDate);
  safetyIntervalEndDate.setDate(safetyIntervalEndDate.getDate() + treatmentData.product.safetyInterval);

  const newRecord: TreatmentRecord = {
    id: `treatment_${Date.now()}`,
    gardenId,
    taskId: treatmentData.taskId,
    productId: treatmentData.product.id,
    productName: treatmentData.product.name,
    plantName: treatmentData.plantName,
    treatmentDate: treatmentData.treatmentDate,
    dosage: treatmentData.dosage,
    applicationMethod: treatmentData.applicationMethod,
    targetPestDisease: treatmentData.targetPestDisease,
    weatherConditions: treatmentData.weatherConditions,
    safetyIntervalEndDate,
    notes: treatmentData.notes,
    createdAt: new Date(),
  };

  records.push(newRecord);
  localStorage.setItem(storageKey, JSON.stringify(records));

  return newRecord;
}

/**
 * Recupera storico trattamenti
 */
export async function getTreatmentHistory(
  gardenId: string,
  plantName?: string,
  dateRange?: { start: Date; end: Date }
): Promise<TreatmentRecord[]> {
  const storageKey = `treatment_registry_${gardenId}`;
  const stored = localStorage.getItem(storageKey);
  if (!stored) return [];

  let records: TreatmentRecord[] = JSON.parse(stored).map((r: any) => ({
    ...r,
    treatmentDate: new Date(r.treatmentDate),
    safetyIntervalEndDate: new Date(r.safetyIntervalEndDate),
    createdAt: new Date(r.createdAt),
  }));

  if (plantName) {
    records = records.filter((r) => r.plantName.toLowerCase().includes(plantName.toLowerCase()));
  }

  if (dateRange) {
    records = records.filter(
      (r) => r.treatmentDate >= dateRange.start && r.treatmentDate <= dateRange.end
    );
  }

  return records.sort((a, b) => b.treatmentDate.getTime() - a.treatmentDate.getTime());
}

/**
 * Verifica se trattamento ancora in periodo carenza
 */
export function checkSafetyInterval(treatment: TreatmentRecord, currentDate: Date = new Date()): boolean {
  return currentDate < treatment.safetyIntervalEndDate;
}

/**
 * Trattamenti ancora in periodo carenza
 */
export async function getActiveSafetyIntervals(gardenId: string): Promise<TreatmentRecord[]> {
  const records = await getTreatmentHistory(gardenId);
  return records.filter((r) => checkSafetyInterval(r));
}

/**
 * Esporta registro (PDF/CSV)
 */
export async function exportRegistry(
  gardenId: string,
  format: 'pdf' | 'csv'
): Promise<string> {
  const records = await getTreatmentHistory(gardenId);

  if (format === 'csv') {
    const headers = [
      'Data',
      'Prodotto',
      'Pianta',
      'Dosaggio',
      'Metodo',
      'Target',
      'Fine Carenza',
      'Note',
    ];
    const rows = records.map((r) => [
      r.treatmentDate.toLocaleDateString('it-IT'),
      r.productName,
      r.plantName,
      r.dosage,
      r.applicationMethod,
      r.targetPestDisease,
      r.safetyIntervalEndDate.toLocaleDateString('it-IT'),
      r.notes || '',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return csv;
  }

  // PDF: TODO implementare generazione PDF
  return JSON.stringify(records, null, 2);
}

