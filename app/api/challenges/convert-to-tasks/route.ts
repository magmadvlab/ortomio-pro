/**
 * Challenge to Tasks Conversion API
 * Converte le azioni di una challenge in calendar tasks
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSupabase } from '../../../../lib/supabase-server';
// import { getChallengeForDate } from '@/data/giornateSpeciali'; // REMOVED: gamification
import { convertChallengeActionsToTasks, checkChallengeTasksExist } from '../../../../services/challengeTaskConverter';
import { accessErrorResponse, requireGardenAccess, requireUser } from '@/lib/auth.server';

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const supabase = requireSupabase();
    const body = await request.json();
    const { challenge_id, auto_schedule, garden_id } = body;
    
    if (!challenge_id) {
      return NextResponse.json(
        { error: 'challenge_id required' },
        { status: 400 }
      );
    }
    if (garden_id) await requireGardenAccess(request, garden_id);
    
    // Parse challenge_id (formato: "giorno-mese")
    const [giorno, mese] = challenge_id.split('-').map(Number);
    
    if (!giorno || !mese || giorno < 1 || giorno > 31 || mese < 1 || mese > 12) {
      return NextResponse.json(
        { error: 'Invalid challenge_id format. Expected "giorno-mese" (e.g., "22-4")' },
        { status: 400 }
      );
    }
    
    const challengeDate = new Date(new Date().getFullYear(), mese - 1, giorno);
    // const challenge = getChallengeForDate(challengeDate); // REMOVED: gamification
    const challenge = null; // Gamification removed
    
    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }
    
    // Verifica se i task sono già stati creati
    const tasksExist = await checkChallengeTasksExist(supabase, user.id, challenge_id);
    
    if (tasksExist) {
      // Recupera i task esistenti
      const { data: existingTasks } = await supabase
        .from('calendar_tasks')
        .select('id, title, start_date, completed')
        .eq('user_id', user.id)
        .eq('challenge_id', challenge_id);
      
      return NextResponse.json({
        success: true,
        already_exists: true,
        task_ids: existingTasks?.map(t => t.id) || [],
        tasks: existingTasks,
        message: 'Tasks già creati per questa challenge'
      });
    }
    
    // Converti challenge actions in tasks
    const taskIds = await convertChallengeActionsToTasks(supabase, user.id, challenge, {
      autoSchedule: auto_schedule !== false,
      defaultDate: new Date(),
      gardenId: garden_id
    });
    
    if (taskIds.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create tasks' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      task_ids: taskIds,
      message: `Creati ${taskIds.length} task nel calendario`
    });
  } catch (error: any) {
    const accessResponse = accessErrorResponse(error);
    if (accessResponse) return accessResponse;
    console.error('Error converting challenge to tasks:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
