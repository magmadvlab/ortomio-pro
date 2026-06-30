/**
 * Treatment Registry Service
 * Registro trattamenti fitosanitari per professionisti (obbligatorio)
 */

import { PhytoProduct } from '../data/phytoproducts';

const isBrowserStorageAvailable = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readStoredTreatments = (gardenId: string): TreatmentRecord[] => {
  if (!isBrowserStorageAvailable()) return [];

  const stored = window.localStorage.getItem(`treatment_registry_${gardenId}`);
  if (!stored) return [];

  return JSON.parse(stored).map((record: any) => ({
    ...record,
    treatmentDate: new Date(record.treatmentDate),
    safetyIntervalEndDate: new Date(record.safetyIntervalEndDate),
    createdAt: new Date(record.createdAt),
  }));
};

const writeStoredTreatments = (gardenId: string, records: TreatmentRecord[]) => {
  if (!isBrowserStorageAvailable()) return;
  window.localStorage.setItem(`treatment_registry_${gardenId}`, JSON.stringify(records));
};

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
  const records = readStoredTreatments(gardenId);

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
  writeStoredTreatments(gardenId, records);

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
  let records = readStoredTreatments(gardenId);

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
