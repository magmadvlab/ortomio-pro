/**
 * Calendar Tasks API - CRUD per task calendario
 * Supporto task ricorrenti
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSupabase } from '../../../../lib/supabase-server';

// GET /api/calendar/tasks?start_date=&end_date=
export async function GET(request: NextRequest) {
  try {
    const supabase = requireSupabase();
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    
    // TODO: Get user from auth
    // const user = await getCurrentUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    
    // Per ora, usa user_id da query (temporaneo)
    const userId = searchParams.get('user_id');
    if (!userId) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }
    
    let query = supabase
      .from('calendar_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: true });
    
    if (startDate) {
      query = query.gte('start_date', startDate);
    }
    
    if (endDate) {
      query = query.lte('start_date', endDate);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching calendar tasks:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Espandi task ricorrenti
    const expandedTasks = await expandRecurringTasks(data || [], startDate, endDate);
    
    return NextResponse.json({ tasks: expandedTasks });
  } catch (error) {
    console.error('Error in GET /api/calendar/tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/calendar/tasks
export async function POST(request: NextRequest) {
  try {
    const supabase = requireSupabase();
    const body = await request.json();
    const { user_id, title, type, start_date, recurring, recurring_pattern, garden_id, plant_name, notes } = body;
    
    if (!user_id || !title || !type || !start_date) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, title, type, start_date' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('calendar_tasks')
      .insert({
        user_id,
        title,
        type,
        start_date,
        end_date: body.end_date || null,
        recurring: recurring || false,
        recurring_pattern: recurring_pattern || null,
        garden_id: garden_id || null,
        plant_name: plant_name || null,
        notes: notes || null,
        completed: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating calendar task:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ task: data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/calendar/tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/calendar/tasks/[id]
export async function PATCH(request: NextRequest) {
  try {
    const supabase = requireSupabase();
    const searchParams = request.nextUrl.searchParams;
    const taskId = searchParams.get('id');
    
    if (!taskId) {
      return NextResponse.json({ error: 'task id required' }, { status: 400 });
    }
    
    const body = await request.json();
    
    // Recupera il task esistente per verificare se proviene da challenge
    const { data: existingTask } = await supabase
      .from('calendar_tasks')
      .select('challenge_id, challenge_action_index, user_id, completed')
      .eq('id', taskId)
      .single();
    
    // Aggiorna il task
    const updateData: any = {
      ...body,
      updated_at: new Date().toISOString()
    };
    
    // Se viene marcato come completato, aggiungi completed_at
    if (body.completed === true && !body.completed_at) {
      updateData.completed_at = new Date().toISOString();
    }
    
    // Se viene marcato come non completato, rimuovi completed_at
    if (body.completed === false) {
      updateData.completed_at = null;
    }
    
    const { data, error } = await supabase
      .from('calendar_tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating calendar task:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Sincronizza con challenge se il task proviene da una challenge
    if (existingTask?.challenge_id && existingTask?.challenge_action_index !== undefined && existingTask?.challenge_id) {
      try {
        const { syncTaskCompletionToChallenge, syncTaskUncompletionFromChallenge } = await import('../../../../services/challengeTaskSync');
        
        if (data.completed) {
          await syncTaskCompletionToChallenge(supabase, {
            id: data.id,
            user_id: data.user_id,
            challenge_id: data.challenge_id,
            challenge_action_index: data.challenge_action_index,
            completed: data.completed,
            completed_at: data.completed_at
          });
        } else if (existingTask.completed && !data.completed) {
          // Task è stato marcato come non completato
          await syncTaskUncompletionFromChallenge(supabase, {
            id: data.id,
            user_id: data.user_id,
            challenge_id: data.challenge_id,
            challenge_action_index: data.challenge_action_index,
            completed: data.completed
          });
        }
      } catch (syncError) {
        console.error('Error syncing task completion to challenge:', syncError);
        // Non bloccare l'aggiornamento del task se la sincronizzazione fallisce
      }
    }
    
    return NextResponse.json({ task: data });
  } catch (error) {
    console.error('Error in PATCH /api/calendar/tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/calendar/tasks/[id]
export async function DELETE(request: NextRequest) {
  try {
    const supabase = requireSupabase();
    const searchParams = request.nextUrl.searchParams;
    const taskId = searchParams.get('id');
    
    if (!taskId) {
      return NextResponse.json({ error: 'task id required' }, { status: 400 });
    }
    
    const { error } = await supabase
      .from('calendar_tasks')
      .delete()
      .eq('id', taskId);
    
    if (error) {
      console.error('Error deleting calendar task:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/calendar/tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Espande task ricorrenti calcolando prossime occorrenze
 */
async function expandRecurringTasks(
  tasks: any[],
  startDate?: string | null,
  endDate?: string | null
): Promise<any[]> {
  const expanded: any[] = [];
  
  for (const task of tasks) {
    expanded.push(task);
    
    // Se task è ricorrente, calcola prossime occorrenze
    if (task.recurring && task.recurring_pattern) {
      const pattern = task.recurring_pattern;
      const occurrences = calculateRecurringOccurrences(
        task.start_date,
        pattern,
        startDate,
        endDate
      );
      
      // Crea task virtuali per ogni occorrenza
      for (const occDate of occurrences) {
        expanded.push({
          ...task,
          id: `${task.id}_${occDate}`,
          start_date: occDate,
          isRecurringInstance: true,
          originalTaskId: task.id
        });
      }
    }
  }
  
  return expanded;
}

/**
 * Calcola occorrenze ricorrenti
 */
function calculateRecurringOccurrences(
  startDate: string,
  pattern: { type: 'daily' | 'weekly' | 'monthly'; interval: number; endDate?: string },
  rangeStart?: string | null,
  rangeEnd?: string | null
): string[] {
  const occurrences: string[] = [];
  const start = new Date(startDate);
  const end = pattern.endDate ? new Date(pattern.endDate) : null;
  const rangeStartDate = rangeStart ? new Date(rangeStart) : new Date();
  const rangeEndDate = rangeEnd ? new Date(rangeEnd) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 giorni default
  
  let current = new Date(start);
  let count = 0;
  const maxOccurrences = 100; // Limite sicurezza
  
  while (count < maxOccurrences) {
    if (end && current > end) break;
    if (current > rangeEndDate) break;
    
    if (current >= rangeStartDate) {
      occurrences.push(current.toISOString());
    }
    
    // Incrementa data in base al pattern
    if (pattern.type === 'daily') {
      current.setDate(current.getDate() + pattern.interval);
    } else if (pattern.type === 'weekly') {
      current.setDate(current.getDate() + (7 * pattern.interval));
    } else if (pattern.type === 'monthly') {
      current.setMonth(current.getMonth() + pattern.interval);
    }
    
    count++;
  }
  
  return occurrences;
}
