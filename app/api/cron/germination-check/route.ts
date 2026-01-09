/**
 * Germination Check Cron Job
 * Eseguito giornalmente per rilevare piante entrate in fase Germination
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSupabase } from '../../../../lib/supabase-server';
import { findTasksNeedingGerminationNotification, checkGerminationStatus } from '../../../../services/germinationTracker';
import { getMasterSheetSync } from '../../../../services/plantMasterService';
import { sendNotification } from '../../../../services/notificationService';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  try {
    const supabase = requireSupabase();

    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Recupera tutti i task di semina non completati
    const { data: tasks, error: tasksError } = await supabase
      .from('garden_tasks')
      .select('*, user_id, profiles!inner(email)')
      .eq('task_type', 'Sowing')
      .eq('completed', false)
      .limit(1000);

    if (tasksError) {
      console.error('Error fetching tasks for germination check:', tasksError);
      return NextResponse.json({ error: tasksError.message }, { status: 500 });
    }

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No sowing tasks found',
        notificationsSent: 0
      });
    }

    // Crea mappa master data
    const masterDataMap = new Map();
    const uniquePlantNames = [...new Set(tasks.map(t => t.plant_name))];
    for (const plantName of uniquePlantNames) {
      const masterData = getMasterSheetSync(plantName);
      if (masterData) {
        masterDataMap.set(plantName, masterData);
      }
    }

    // Converti tasks a formato GardenTask
    const gardenTasks = tasks.map(t => ({
      id: t.id,
      gardenId: t.garden_id,
      plantName: t.plant_name,
      variety: t.variety,
      plantingMethod: t.planting_method,
      taskType: t.task_type,
      date: t.date,
      completed: t.completed,
      lifecycleState: t.lifecycle_state,
      userResponses: t.user_responses || {}
    }));

    // Trova task che necessitano notifica
    const checks = await findTasksNeedingGerminationNotification(
      gardenTasks,
      masterDataMap,
      new Date()
    );

    let notificationsSent = 0;
    for (const check of checks) {
      const task = tasks.find(t => t.id === check.taskId);
      if (!task || !task.profiles?.email || !task.user_id) {
        continue;
      }

      try {
        const notification = {
          userId: task.user_id,
          userEmail: task.profiles.email,
          type: 'germination-detected' as const,
          subject: `🌱 Germoglio rilevato: ${check.plantName}`,
          templateData: {
            plantName: check.plantName,
            daysSinceSowing: check.daysSinceSowing,
            expectedGerminationDate: check.expectedGerminationDate.toLocaleDateString('it-IT'),
            link: `/app/journal?taskId=${check.taskId}`,
            taskId: check.taskId
          }
        };
        const result = await sendNotification(notification, supabase);
        if (result.success) {
          notificationsSent++;
        }
      } catch (error) {
        console.error(`Error sending germination notification for task ${check.taskId}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${notificationsSent} germination notifications`,
      checksFound: checks.length,
      date: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in germination check cron:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

