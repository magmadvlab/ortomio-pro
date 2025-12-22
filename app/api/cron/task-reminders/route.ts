/**
 * Task Reminders Cron Job
 * Vercel Cron: Esegue ogni giorno alle 7:00 AM
 * Notifica utenti con task in scadenza oggi o domani
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSupabase } from '../../../../lib/supabase-server';
import { sendBatchNotifications, createTaskReminderNotification, NotificationData } from '../../../../services/notificationService';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  try {
    const supabase = requireSupabase();
    
    // Verifica secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Ottieni task in scadenza oggi o domani che non sono completati
    const { data: tasksDue, error: tasksError } = await supabase
      .from('garden_tasks')
      .select(`
        id,
        plant_name,
        task_type,
        date,
        completed,
        garden_id,
        gardens!inner(user_id)
      `)
      .eq('completed', false)
      .in('date', [
        today.toISOString().split('T')[0],
        tomorrow.toISOString().split('T')[0]
      ])
      .limit(1000);
    
    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      return NextResponse.json(
        { error: tasksError.message },
        { status: 500 }
      );
    }
    
    if (!tasksDue || tasksDue.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No tasks due today or tomorrow',
        date: today.toISOString(),
        notifications_count: 0,
      });
    }
    
    // Raggruppa task per utente e prepara notifiche
    const userTasksMap = new Map<string, Array<{
      id: string;
      plant_name: string;
      task_type: string;
      date: string;
      daysUntilDue: number;
    }>>();
    
    for (const task of tasksDue) {
      const userId = (task.gardens as any)?.user_id;
      if (!userId) continue;
      
      const taskDate = new Date(task.date);
      const daysUntilDue = Math.floor(
        (taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (!userTasksMap.has(userId)) {
        userTasksMap.set(userId, []);
      }
      
      userTasksMap.get(userId)!.push({
        id: task.id,
        plant_name: task.plant_name,
        task_type: task.task_type,
        date: task.date,
        daysUntilDue,
      });
    }
    
    // Prepara notifiche email
    const emailNotifications: NotificationData[] = [];
    
    for (const [userId, tasks] of userTasksMap.entries()) {
      // Ottieni email utente
      const { data: authUser } = await supabase.auth.admin.getUserById(userId);
      if (!authUser?.user?.email) continue;
      
      // Crea notifica per ogni task (o una notifica aggregata per utente)
      for (const task of tasks) {
        emailNotifications.push(
          createTaskReminderNotification(
            userId,
            authUser.user.email,
            {
              id: task.id,
              plant_name: task.plant_name,
              task_type: task.task_type,
              date: task.date,
              daysUntilDue: task.daysUntilDue,
            }
          )
        );
      }
    }
    
    // Invia notifiche in batch
    let sentCount = 0;
    let failedCount = 0;
    
    if (emailNotifications.length > 0) {
      const result = await sendBatchNotifications(emailNotifications, supabase);
      sentCount = result.sent;
      failedCount = result.failed;
      
      if (result.errors.length > 0) {
        console.error('Some task reminder notifications failed:', result.errors.slice(0, 5));
      }
    }
    
    return NextResponse.json({
      success: true,
      date: today.toISOString(),
      tasks_due_count: tasksDue.length,
      users_notified: userTasksMap.size,
      notifications_sent: sentCount,
      notifications_failed: failedCount,
      total_notifications: emailNotifications.length,
    });
  } catch (error: any) {
    console.error('Error in task reminders cron:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}


