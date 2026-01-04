/**
 * Weekly Photo Reminder Service
 * Gestisce reminder settimanali per foto di tracking crescita
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface WeeklyPhotoReminder {
  id: string;
  taskId: string;
  userId: string;
  gardenId: string;
  lastPhotoDate?: string;
  nextReminderDate: string;
  reminderSent: boolean;
  reminderCount: number;
  frequencyDays: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Crea un reminder settimanale per un task
 */
export async function createWeeklyReminder(
  supabase: SupabaseClient,
  taskId: string,
  userId: string,
  gardenId: string,
  frequencyDays: number = 7
): Promise<WeeklyPhotoReminder> {
  const nextReminderDate = new Date();
  nextReminderDate.setDate(nextReminderDate.getDate() + frequencyDays);

  const { data, error } = await supabase
    .from('weekly_photo_reminders')
    .upsert({
      task_id: taskId,
      user_id: userId,
      garden_id: gardenId,
      next_reminder_date: nextReminderDate.toISOString().split('T')[0],
      reminder_sent: false,
      reminder_count: 0,
      frequency_days: frequencyDays
    }, {
      onConflict: 'task_id',
      ignoreDuplicates: false
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create weekly reminder: ${error.message}`);
  }

  return {
    id: data.id,
    taskId: data.task_id,
    userId: data.user_id,
    gardenId: data.garden_id,
    lastPhotoDate: data.last_photo_date,
    nextReminderDate: data.next_reminder_date,
    reminderSent: data.reminder_sent,
    reminderCount: data.reminder_count,
    frequencyDays: data.frequency_days,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

/**
 * Recupera reminder pendenti per un utente
 */
export async function getPendingReminders(
  supabase: SupabaseClient,
  userId: string,
  date?: Date
): Promise<WeeklyPhotoReminder[]> {
  const checkDate = date || new Date();
  const dateStr = checkDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('weekly_photo_reminders')
    .select('*')
    .eq('user_id', userId)
    .eq('reminder_sent', false)
    .lte('next_reminder_date', dateStr)
    .order('next_reminder_date', { ascending: true });

  if (error) {
    throw new Error(`Failed to get pending reminders: ${error.message}`);
  }

  return (data || []).map(r => ({
    id: r.id,
    taskId: r.task_id,
    userId: r.user_id,
    gardenId: r.garden_id,
    lastPhotoDate: r.last_photo_date,
    nextReminderDate: r.next_reminder_date,
    reminderSent: r.reminder_sent,
    reminderCount: r.reminder_count,
    frequencyDays: r.frequency_days,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }));
}

/**
 * Marca un reminder come inviato e calcola il prossimo
 */
export async function markReminderSent(
  supabase: SupabaseClient,
  reminderId: string
): Promise<void> {
  const { data: reminder, error: fetchError } = await supabase
    .from('weekly_photo_reminders')
    .select('frequency_days, reminder_count')
    .eq('id', reminderId)
    .single();

  if (fetchError || !reminder) {
    throw new Error(`Reminder not found: ${fetchError?.message}`);
  }

  const nextReminderDate = new Date();
  nextReminderDate.setDate(nextReminderDate.getDate() + reminder.frequency_days);

  const { error: updateError } = await supabase
    .from('weekly_photo_reminders')
    .update({
      reminder_sent: true,
      reminder_count: reminder.reminder_count + 1,
      next_reminder_date: nextReminderDate.toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    })
    .eq('id', reminderId);

  if (updateError) {
    throw new Error(`Failed to mark reminder as sent: ${updateError.message}`);
  }
}

/**
 * Aggiorna last_photo_date quando viene scattata una foto
 */
export async function updateLastPhotoDate(
  supabase: SupabaseClient,
  taskId: string,
  photoDate: Date
): Promise<void> {
  const { error } = await supabase
    .from('weekly_photo_reminders')
    .update({
      last_photo_date: photoDate.toISOString().split('T')[0],
      reminder_sent: false, // Reset per permettere nuovo reminder
      updated_at: new Date().toISOString()
    })
    .eq('task_id', taskId);

  if (error) {
    // Se il reminder non esiste, non è un errore critico (potrebbe essere la prima foto)
    if (error.code !== 'PGRST116') {
      throw new Error(`Failed to update last photo date: ${error.message}`);
    }
  }
}

/**
 * Elimina reminder per un task (quando task completato o eliminato)
 */
export async function deleteReminder(
  supabase: SupabaseClient,
  taskId: string
): Promise<void> {
  const { error } = await supabase
    .from('weekly_photo_reminders')
    .delete()
    .eq('task_id', taskId);

  if (error) {
    throw new Error(`Failed to delete reminder: ${error.message}`);
  }
}

/**
 * Aggiorna frequenza reminder in base alla fase del ciclo vitale
 */
export async function updateReminderFrequency(
  supabase: SupabaseClient,
  taskId: string,
  lifecycleState: string
): Promise<void> {
  // Production: reminder ogni 2 settimane invece di settimanale
  const frequencyDays = lifecycleState === 'Production' ? 14 : 7;

  const { error } = await supabase
    .from('weekly_photo_reminders')
    .update({
      frequency_days: frequencyDays,
      updated_at: new Date().toISOString()
    })
    .eq('task_id', taskId);

  if (error && error.code !== 'PGRST116') {
    // Se il reminder non esiste, non è un errore critico
    console.warn(`Failed to update reminder frequency: ${error.message}`);
  }
}







