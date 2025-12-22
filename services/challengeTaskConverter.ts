/**
 * Challenge Task Converter Service
 * Converte le azioni di una challenge in calendar tasks tracciabili
 */

import { GiornataSpeciale } from '@/data/giornateSpeciali';
import { SupabaseClient } from '@supabase/supabase-js';

interface ConvertOptions {
  autoSchedule?: boolean; // Se true, distribuisce i task nei prossimi giorni
  defaultDate?: Date; // Data di default se autoSchedule è false
  gardenId?: string; // ID giardino opzionale
}

/**
 * Converte le azioni di una challenge in calendar tasks
 */
export async function convertChallengeActionsToTasks(
  supabase: SupabaseClient,
  userId: string,
  challenge: GiornataSpeciale,
  options?: ConvertOptions
): Promise<string[]> {
  const challengeId = `${challenge.giorno}-${challenge.mese}`;
  const createdTaskIds: string[] = [];
  
  // Determina date per i task
  const baseDate = options?.defaultDate || new Date();
  const dates = options?.autoSchedule !== false
    ? distributeTasksAcrossWeek(challenge.challenge.azioni.length, baseDate)
    : challenge.challenge.azioni.map(() => baseDate);
  
  // Mappa azioni challenge a tipi calendar task
  const actionTypeMap: Record<string, 'semina' | 'irrigazione' | 'raccolta' | 'potatura' | 'concimazione' | 'trattamento' | 'altro'> = {
    'semina': 'semina',
    'semine': 'semina',
    'pianta': 'semina',
    'piantare': 'semina',
    'seminare': 'semina',
    'raccolta': 'raccolta',
    'raccogli': 'raccolta',
    'raccogliere': 'raccolta',
    'potatura': 'potatura',
    'potare': 'potatura',
    'irrigazione': 'irrigazione',
    'acqua': 'irrigazione',
    'innaffia': 'irrigazione',
    'innaffiare': 'irrigazione',
    'irrigare': 'irrigazione',
    'concimazione': 'concimazione',
    'concima': 'concimazione',
    'concimare': 'concimazione',
    'trattamento': 'trattamento',
    'tratta': 'trattamento',
    'trattare': 'trattamento',
  };
  
  for (let i = 0; i < challenge.challenge.azioni.length; i++) {
    const action = challenge.challenge.azioni[i];
    const taskType = inferTaskType(action.azione, actionTypeMap);
    
    const { data: task, error } = await supabase
      .from('calendar_tasks')
      .insert({
        user_id: userId,
        garden_id: options?.gardenId || null,
        title: action.azione,
        type: taskType,
        start_date: dates[i].toISOString(),
        notes: `${action.perche}\n\nDa challenge: ${challenge.evento}`,
        challenge_id: challengeId,
        challenge_action_index: i,
        source_type: 'challenge',
        completed: false
      })
      .select('id')
      .single();
    
    if (!error && task) {
      createdTaskIds.push(task.id);
    } else if (error) {
      console.error(`Error creating task for action ${i}:`, error);
    }
  }
  
  return createdTaskIds;
}

/**
 * Distribuisce i task su una settimana (massimo 7 giorni)
 */
function distributeTasksAcrossWeek(count: number, startDate: Date): Date[] {
  const dates: Date[] = [];
  const maxDays = Math.min(count, 7); // Massimo 7 giorni
  
  for (let i = 0; i < count; i++) {
    const date = new Date(startDate);
    // Distribuisce i task nei prossimi giorni, massimo uno al giorno
    const dayOffset = i < maxDays ? i : Math.floor(i / maxDays) * 7 + (i % maxDays);
    date.setDate(startDate.getDate() + dayOffset);
    dates.push(date);
  }
  return dates;
}

/**
 * Inferisce il tipo di task dall'azione usando keyword matching
 */
function inferTaskType(
  actionText: string, 
  typeMap: Record<string, string>
): 'semina' | 'irrigazione' | 'raccolta' | 'potatura' | 'concimazione' | 'trattamento' | 'altro' {
  const lowerText = actionText.toLowerCase();
  
  // Cerca keyword nel testo
  for (const [keyword, type] of Object.entries(typeMap)) {
    if (lowerText.includes(keyword)) {
      return type as any;
    }
  }
  
  // Default: altro
  return 'altro';
}

/**
 * Verifica se i task per una challenge sono già stati creati
 */
export async function checkChallengeTasksExist(
  supabase: SupabaseClient,
  userId: string,
  challengeId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('calendar_tasks')
    .select('id')
    .eq('user_id', userId)
    .eq('challenge_id', challengeId)
    .limit(1);
  
  if (error) {
    console.error('Error checking challenge tasks:', error);
    return false;
  }
  
  return (data?.length || 0) > 0;
}

