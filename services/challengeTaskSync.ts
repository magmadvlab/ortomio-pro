/**
 * Challenge Task Sync Service
 * Sincronizza completamento calendar tasks con challenge actions
 */

import { SupabaseClient } from '@supabase/supabase-js';

interface CalendarTask {
  id: string;
  user_id: string;
  challenge_id?: string;
  challenge_action_index?: number;
  completed: boolean;
  completed_at?: string;
}

/**
 * Aggiorna challenge action quando un calendar task viene completato
 */
export async function syncTaskCompletionToChallenge(
  supabase: SupabaseClient,
  task: CalendarTask
): Promise<boolean> {
  // Se il task non proviene da una challenge, non fare nulla
  if (!task.challenge_id || task.challenge_action_index === undefined || task.challenge_action_index === null) {
    return false;
  }

  // Se il task non è completato, non fare nulla
  if (!task.completed) {
    return false;
  }

  try {
    // Recupera la challenge completion esistente
    const { data: completion, error: fetchError } = await supabase
      .from('challenge_completions')
      .select('actions_completed')
      .eq('user_id', task.user_id)
      .eq('challenge_id', task.challenge_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching challenge completion:', fetchError);
      return false;
    }

    // Se la challenge è già completata completamente, non fare nulla
    if (completion?.actions_completed) {
      // Verifica se questa azione è già marcata come completata
      if (completion.actions_completed.includes(task.challenge_action_index)) {
        return true; // Già sincronizzato
      }
    }

    // Aggiorna o crea challenge completion
    const actionsCompleted = completion?.actions_completed || [];
    const updatedActions = [...new Set([...actionsCompleted, task.challenge_action_index])].sort();

    const { error: upsertError } = await supabase
      .from('challenge_completions')
      .upsert({
        user_id: task.user_id,
        challenge_id: task.challenge_id,
        actions_completed: updatedActions,
        completed_at: task.completed_at || new Date().toISOString(),
        // Mantieni punti e badge esistenti se presenti
        points_awarded: completion?.points_awarded || 0,
        badge_earned: completion?.badge_earned || null,
        photo_url: completion?.photo_url || null,
      }, {
        onConflict: 'user_id,challenge_id'
      });

    if (upsertError) {
      console.error('Error syncing task completion to challenge:', upsertError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in syncTaskCompletionToChallenge:', error);
    return false;
  }
}

/**
 * Rimuove challenge action quando un calendar task viene marcato come non completato
 */
export async function syncTaskUncompletionFromChallenge(
  supabase: SupabaseClient,
  task: CalendarTask
): Promise<boolean> {
  // Se il task non proviene da una challenge, non fare nulla
  if (!task.challenge_id || task.challenge_action_index === undefined || task.challenge_action_index === null) {
    return false;
  }

  // Se il task è completato, non fare nulla (dovrebbe chiamare syncTaskCompletionToChallenge)
  if (task.completed) {
    return false;
  }

  try {
    // Recupera la challenge completion esistente
    const { data: completion, error: fetchError } = await supabase
      .from('challenge_completions')
      .select('actions_completed')
      .eq('user_id', task.user_id)
      .eq('challenge_id', task.challenge_id)
      .single();

    if (fetchError || !completion?.actions_completed) {
      return false; // Nessuna completion da aggiornare
    }

    // Rimuovi l'azione dall'array
    const updatedActions = completion.actions_completed.filter(
      idx => idx !== task.challenge_action_index
    );

    // Se non ci sono più azioni completate, elimina la completion
    if (updatedActions.length === 0) {
      const { error: deleteError } = await supabase
        .from('challenge_completions')
        .delete()
        .eq('user_id', task.user_id)
        .eq('challenge_id', task.challenge_id);

      return !deleteError;
    }

    // Altrimenti aggiorna l'array
    const { error: updateError } = await supabase
      .from('challenge_completions')
      .update({
        actions_completed: updatedActions
      })
      .eq('user_id', task.user_id)
      .eq('challenge_id', task.challenge_id);

    return !updateError;
  } catch (error) {
    console.error('Error in syncTaskUncompletionFromChallenge:', error);
    return false;
  }
}

/**
 * Verifica se un task proviene da una challenge
 */
export function isChallengeTask(task: CalendarTask): boolean {
  return !!(task.challenge_id && task.challenge_action_index !== undefined && task.challenge_action_index !== null);
}

