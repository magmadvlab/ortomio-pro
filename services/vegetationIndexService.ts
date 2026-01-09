/**
 * Vegetation Index Service
 * Calcola indicatori vegetativi avanzati da foto RGB (NDVI, EVI, LAI, Chlorophyll Index)
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface VegetationIndices {
  id?: string;
  photoLogId: string;
  taskId: string;
  zoneId?: string;
  ndvi?: number; // Normalized Difference Vegetation Index (-1 to 1)
  evi?: number; // Enhanced Vegetation Index (-1 to 1)
  lai?: number; // Leaf Area Index (0+)
  chlorophyllIndex?: number; // Chlorophyll Index (0+)
  rValue?: number; // Red channel value (0-255)
  gValue?: number; // Green channel value (0-255)
  bValue?: number; // Blue channel value (0-255)
  calculationMethod: 'rgb_approximation' | 'satellite' | 'drone';
  confidence: number; // 0-1
  createdAt?: string;
}

/**
 * Calcola indici vegetativi da immagine RGB
 * Nota: NDVI vero richiede immagini multispettrali (NIR), 
 * qui usiamo approssimazioni basate su RGB
 */
export async function calculateVegetationIndices(
  imageUrl: string,
  photoLogId: string,
  taskId: string,
  zoneId?: string
): Promise<VegetationIndices> {
  try {
    // Carica immagine e estrai valori RGB medi
    const rgbValues = await extractRGBValues(imageUrl);
    
    // Calcola indici approssimati
    const indices = calculateIndicesFromRGB(rgbValues);

    return {
      photoLogId,
      taskId,
      zoneId,
      ndvi: indices.ndvi,
      evi: indices.evi,
      lai: indices.lai,
      chlorophyllIndex: indices.chlorophyllIndex,
      rValue: rgbValues.r,
      gValue: rgbValues.g,
      bValue: rgbValues.b,
      calculationMethod: 'rgb_approximation',
      confidence: 0.7 // Media confidenza per approssimazione RGB
    };
  } catch (error) {
    console.error('Error calculating vegetation indices:', error);
    throw error;
  }
}

/**
 * Estrae valori RGB medi da un'immagine
 */
async function extractRGBValues(imageUrl: string): Promise<{ r: number; g: number; b: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let rSum = 0;
        let gSum = 0;
        let bSum = 0;
        let pixelCount = 0;
        
        // Campiona pixel (ogni 10 per performance)
        for (let i = 0; i < data.length; i += 40) { // RGBA = 4 bytes per pixel, ogni 10 pixel
          rSum += data[i];
          gSum += data[i + 1];
          bSum += data[i + 2];
          pixelCount++;
        }
        
        resolve({
          r: Math.round(rSum / pixelCount),
          g: Math.round(gSum / pixelCount),
          b: Math.round(bSum / pixelCount)
        });
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Calcola indici vegetativi da valori RGB
 * Usa formule approssimate basate su correlazioni RGB-NIR
 */
function calculateIndicesFromRGB(rgb: { r: number; g: number; b: number }): {
  ndvi: number;
  evi: number;
  lai: number;
  chlorophyllIndex: number;
} {
  // Normalizza valori RGB (0-1)
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  // Approssimazione NIR da RGB usando formula comune
  // NIR ≈ 0.3*R + 0.6*G + 0.1*B (approssimazione)
  const nirApprox = 0.3 * r + 0.6 * g + 0.1 * b;
  
  // NDVI approssimato: (NIR - Red) / (NIR + Red)
  const ndvi = (nirApprox - r) / (nirApprox + r + 0.0001); // +0.0001 per evitare divisione per zero
  // Clamp tra -1 e 1
  const ndviClamped = Math.max(-1, Math.min(1, ndvi));
  
  // EVI approssimato: 2.5 * ((NIR - Red) / (NIR + 6*Red - 7.5*Blue + 1))
  const evi = 2.5 * ((nirApprox - r) / (nirApprox + 6 * r - 7.5 * b + 1 + 0.0001));
  const eviClamped = Math.max(-1, Math.min(1, evi));
  
  // LAI approssimato: LAI ≈ -ln(1 - NDVI) / k (k ≈ 0.5 per foglie)
  // Per valori NDVI negativi o molto bassi, usa formula alternativa
  let lai = 0;
  if (ndviClamped > 0.1) {
    lai = -Math.log(1 - ndviClamped) / 0.5;
  } else {
    // Per vegetazione scarsa, usa formula basata su Green
    lai = g * 2; // Approssimazione semplificata
  }
  lai = Math.max(0, Math.min(10, lai)); // Clamp tra 0 e 10
  
  // Chlorophyll Index approssimato: CI ≈ (NIR / Red) - 1
  const chlorophyllIndex = (nirApprox / (r + 0.0001)) - 1;
  const ciClamped = Math.max(0, Math.min(5, chlorophyllIndex));
  
  return {
    ndvi: Math.round(ndviClamped * 1000) / 1000, // 3 decimali
    evi: Math.round(eviClamped * 1000) / 1000,
    lai: Math.round(lai * 100) / 100, // 2 decimali
    chlorophyllIndex: Math.round(ciClamped * 100) / 100
  };
}

/**
 * Salva indici vegetativi nel database
 */
export async function saveVegetationIndices(
  supabase: SupabaseClient,
  indices: VegetationIndices
): Promise<VegetationIndices> {
  const { data, error } = await supabase
    .from('vegetation_indices')
    .insert({
      photo_log_id: indices.photoLogId,
      task_id: indices.taskId,
      zone_id: indices.zoneId,
      ndvi: indices.ndvi,
      evi: indices.evi,
      lai: indices.lai,
      chlorophyll_index: indices.chlorophyllIndex,
      r_value: indices.rValue,
      g_value: indices.gValue,
      b_value: indices.bValue,
      calculation_method: indices.calculationMethod,
      confidence: indices.confidence
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save vegetation indices: ${error.message}`);
  }

  return mapIndicesFromDB(data);
}

/**
 * Recupera indici vegetativi per un task
 */
export async function getVegetationIndicesByTask(
  supabase: SupabaseClient,
  taskId: string
): Promise<VegetationIndices[]> {
  const { data, error } = await supabase
    .from('vegetation_indices')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch vegetation indices: ${error.message}`);
  }

  return (data || []).map(mapIndicesFromDB);
}

/**
 * Recupera indici vegetativi per una zona
 */
export async function getVegetationIndicesByZone(
  supabase: SupabaseClient,
  zoneId: string
): Promise<VegetationIndices[]> {
  const { data, error } = await supabase
    .from('vegetation_indices')
    .select('*')
    .eq('zone_id', zoneId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch vegetation indices: ${error.message}`);
  }

  return (data || []).map(mapIndicesFromDB);
}

/**
 * Verifica se gli indici sono sotto soglie critiche
 */
export function checkIndicesThresholds(indices: VegetationIndices): {
  isHealthy: boolean;
  alerts: string[];
} {
  const alerts: string[] = [];
  
  // Soglie ottimali
  const thresholds = {
    ndvi: { min: 0.3, optimal: 0.6 },
    evi: { min: 0.2, optimal: 0.5 },
    lai: { min: 1.0, optimal: 3.0 },
    chlorophyllIndex: { min: 0.5, optimal: 2.0 }
  };
  
  if (indices.ndvi !== undefined && indices.ndvi < thresholds.ndvi.min) {
    alerts.push(`NDVI basso (${indices.ndvi.toFixed(3)}): vegetazione stressata o scarsa`);
  }
  
  if (indices.evi !== undefined && indices.evi < thresholds.evi.min) {
    alerts.push(`EVI basso (${indices.evi.toFixed(3)}): possibile stress vegetativo`);
  }
  
  if (indices.lai !== undefined && indices.lai < thresholds.lai.min) {
    alerts.push(`LAI basso (${indices.lai.toFixed(2)}): superficie fogliare insufficiente`);
  }
  
  if (indices.chlorophyllIndex !== undefined && indices.chlorophyllIndex < thresholds.chlorophyllIndex.min) {
    alerts.push(`Chlorophyll Index basso (${indices.chlorophyllIndex.toFixed(2)}): possibile carenza clorofilla`);
  }
  
  return {
    isHealthy: alerts.length === 0,
    alerts
  };
}

/**
 * Mappa dati da database a tipo TypeScript
 */
function mapIndicesFromDB(db: any): VegetationIndices {
  return {
    id: db.id,
    photoLogId: db.photo_log_id,
    taskId: db.task_id,
    zoneId: db.zone_id,
    ndvi: db.ndvi ? Number(db.ndvi) : undefined,
    evi: db.evi ? Number(db.evi) : undefined,
    lai: db.lai ? Number(db.lai) : undefined,
    chlorophyllIndex: db.chlorophyll_index ? Number(db.chlorophyll_index) : undefined,
    rValue: db.r_value,
    gValue: db.g_value,
    bValue: db.b_value,
    calculationMethod: db.calculation_method || 'rgb_approximation',
    confidence: db.confidence ? Number(db.confidence) : 0.7,
    createdAt: db.created_at
  };
}







