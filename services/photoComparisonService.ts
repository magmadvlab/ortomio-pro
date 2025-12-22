/**
 * Photo Comparison Service
 * Confronta foto consecutive per analizzare crescita e rilevare problemi
 */

import { PlantPhotoLog } from '../types';
import { SupabaseClient } from '@supabase/supabase-js';

export interface PhotoComparison {
  previousPhoto: PlantPhotoLog;
  currentPhoto: PlantPhotoLog;
  growthDelta: {
    leafCountDelta?: number;
    growthRateChange: 'improved' | 'stable' | 'declined';
    daysBetween: number;
    healthChange: 'improved' | 'stable' | 'worsened';
  };
  recommendations: string[];
  needsAttention: boolean;
}

/**
 * Confronta una foto corrente con la foto precedente dello stesso task
 */
export async function comparePhotos(
  supabase: SupabaseClient,
  currentPhoto: PlantPhotoLog,
  taskId: string
): Promise<PhotoComparison | null> {
  // Recupera foto precedente
  const { data: previousPhotos, error } = await supabase
    .from('photo_logs')
    .select('*')
    .eq('task_id', taskId)
    .lt('photo_date', currentPhoto.photoDate)
    .order('photo_date', { ascending: false })
    .limit(1);

  if (error || !previousPhotos || previousPhotos.length === 0) {
    // Nessuna foto precedente, non c'è confronto da fare
    return null;
  }

  const previousPhotoData = previousPhotos[0];
  const previousPhoto: PlantPhotoLog = {
    id: previousPhotoData.id,
    taskId: previousPhotoData.task_id,
    gardenId: previousPhotoData.garden_id,
    photoUrl: previousPhotoData.photo_url,
    photoDate: previousPhotoData.photo_date,
    daysFromPlanting: previousPhotoData.days_from_planting,
    analysisResult: previousPhotoData.analysis_result,
    createdAt: previousPhotoData.created_at
  };

  // Calcola giorni tra le foto
  const daysBetween = Math.floor(
    (new Date(currentPhoto.photoDate).getTime() - new Date(previousPhoto.photoDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Confronta leafCount
  const currentLeafCount = currentPhoto.analysisResult?.leafCount;
  const previousLeafCount = previousPhoto.analysisResult?.leafCount;
  const leafCountDelta = currentLeafCount && previousLeafCount 
    ? currentLeafCount - previousLeafCount 
    : undefined;

  // Confronta growthRate
  const currentGrowthRate = currentPhoto.analysisResult?.growthRate || 'normal';
  const previousGrowthRate = previousPhoto.analysisResult?.growthRate || 'normal';
  
  let growthRateChange: 'improved' | 'stable' | 'declined' = 'stable';
  if (previousGrowthRate === 'slow' && currentGrowthRate !== 'slow') {
    growthRateChange = 'improved';
  } else if (previousGrowthRate !== 'slow' && currentGrowthRate === 'slow') {
    growthRateChange = 'declined';
  } else if (previousGrowthRate === 'normal' && currentGrowthRate === 'fast') {
    growthRateChange = 'improved';
  } else if (previousGrowthRate === 'fast' && currentGrowthRate === 'normal') {
    growthRateChange = 'declined';
  }

  // Confronta salute
  const currentHealthy = currentPhoto.analysisResult?.isHealthy !== false;
  const previousHealthy = previousPhoto.analysisResult?.isHealthy !== false;
  
  let healthChange: 'improved' | 'stable' | 'worsened' = 'stable';
  if (!previousHealthy && currentHealthy) {
    healthChange = 'improved';
  } else if (previousHealthy && !currentHealthy) {
    healthChange = 'worsened';
  }

  // Confronta issues
  const currentIssues = currentPhoto.analysisResult?.issues || [];
  const previousIssues = previousPhoto.analysisResult?.issues || [];
  const newIssues = currentIssues.filter(issue => !previousIssues.includes(issue));
  const resolvedIssues = previousIssues.filter(issue => !currentIssues.includes(issue));

  // Genera raccomandazioni
  const recommendations: string[] = [];
  const needsAttention = false;

  if (growthRateChange === 'declined' || currentGrowthRate === 'slow') {
    recommendations.push('Crescita rallentata rilevata. Considera micro-fertilizzazione.');
    needsAttention = true;
  }

  if (healthChange === 'worsened' || newIssues.length > 0) {
    recommendations.push(`Nuovi problemi rilevati: ${newIssues.join(', ')}. Verifica e tratta se necessario.`);
    needsAttention = true;
  }

  if (leafCountDelta !== undefined && leafCountDelta < 0) {
    recommendations.push('Riduzione del numero di foglie rilevata. Verifica condizioni di crescita.');
    needsAttention = true;
  }

  if (resolvedIssues.length > 0) {
    recommendations.push(`Problemi risolti: ${resolvedIssues.join(', ')}. Ottimo lavoro!`);
  }

  if (growthRateChange === 'improved' && healthChange === 'improved') {
    recommendations.push('Crescita e salute migliorate. Continua così!');
  }

  // Se crescita normale e salute stabile, nessuna raccomandazione particolare
  if (growthRateChange === 'stable' && healthChange === 'stable' && newIssues.length === 0) {
    recommendations.push('Crescita stabile e regolare. Continua il monitoraggio settimanale.');
  }

  return {
    previousPhoto,
    currentPhoto,
    growthDelta: {
      leafCountDelta,
      growthRateChange,
      daysBetween,
      healthChange
    },
    recommendations,
    needsAttention
  };
}

/**
 * Calcola crescita attesa basata su giorni e fase
 */
export function calculateExpectedGrowth(
  plantName: string,
  daysFromPlanting: number,
  phase: string
): {
  expectedLeafCount?: number;
  expectedHeight?: number;
  growthStatus: 'on_track' | 'ahead' | 'behind';
} {
  // Questa funzione può essere estesa con dati master per calcoli più precisi
  // Per ora, restituisce valori generici
  
  let expectedLeafCount: number | undefined;
  
  if (phase === 'Germination') {
    expectedLeafCount = 0; // Cotiledoni
  } else if (phase === 'Nursing') {
    expectedLeafCount = Math.min(4, Math.floor(daysFromPlanting / 7)); // ~1 foglia ogni settimana
  } else if (phase === 'Hardening' || phase === 'Transplanting') {
    expectedLeafCount = 4 + Math.floor((daysFromPlanting - 30) / 5); // ~1 foglia ogni 5 giorni
  } else if (phase === 'Production') {
    expectedLeafCount = undefined; // Troppo variabile
  }

  return {
    expectedLeafCount,
    growthStatus: 'on_track' // Placeholder, da calcolare con dati reali
  };
}

