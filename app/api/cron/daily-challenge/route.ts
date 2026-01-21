/**
 * Daily Notifications Cron Job
 * Vercel Cron: Esegue ogni giorno alle 8:00 AM
 * Combina:
 * - Challenge del giorno disponibile + streak reminder
 * - Task reminders (task in scadenza oggi o domani)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSupabase } from '../../../../lib/supabase-server';
// import { getChallengeForDate } from '../../../../data/giornateSpeciali'; // REMOVED: gamification
import { sendBatchNotifications, createChallengeNotification, createTaskReminderNotification, NotificationData } from '../../../../services/notificationService';

// Verifica CRON_SECRET per sicurezza
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  try {
    const supabase = requireSupabase();
    // Verifica secret (protezione da chiamate non autorizzate)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const today = new Date();
    // const challenge = getChallengeForDate(today); // REMOVED: gamification
    const challenge = null; // Gamification removed
    
    if (!challenge) {
      return NextResponse.json({
        message: 'No challenge today',
        date: today.toISOString()
      });
    }
    
    // Ottieni utenti attivi (ultimi 30 giorni)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: activeUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id, streak_current, streak_last_date')
      .gte('updated_at', thirtyDaysAgo.toISOString())
      .limit(1000); // Limite per batch processing
    
    if (usersError) {
      console.error('Error fetching active users:', usersError);
      return NextResponse.json(
        { error: usersError.message },
        { status: 500 }
      );
    }
    
    if (!activeUsers || activeUsers.length === 0) {
      return NextResponse.json({
        message: 'No active users to notify',
        date: today.toISOString()
      });
    }
    
    // Per ogni utente, verifica se ha già completato la challenge e prepara notifiche
    const emailNotifications: NotificationData[] = [];
    const challengeId = `${challenge.giorno}-${challenge.mese}`;
    
    for (const user of activeUsers) {
      // Ottieni email utente
      const { data: authUser } = await supabase.auth.admin.getUserById(user.id);
      if (!authUser?.user?.email) continue;
      
      // Verifica se challenge già completata
      const { data: completion } = await supabase
        .from('challenge_completions')
        .select('id')
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId)
        .single();
      
      if (!completion) {
        // Challenge non completata, aggiungi notifica
        emailNotifications.push(
          createChallengeNotification(
            user.id,
            authUser.user.email,
            {
              id: challengeId,
              titolo: challenge.challenge.titolo,
              punti: challenge.challenge.punti,
            }
          )
        );
      }
      
      // Streak reminder (se streak > 0 e ultima completion > 1 giorno fa)
      if (user.streak_current && user.streak_current > 0) {
        const lastDate = user.streak_last_date ? new Date(user.streak_last_date) : null;
        if (lastDate) {
          const daysSinceLast = Math.floor(
            (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (daysSinceLast >= 1) {
            emailNotifications.push({
              userId: user.id,
              userEmail: authUser.user.email,
              type: 'streak_reminder',
              subject: '🔥 Mantieni la tua Streak!',
              templateData: {
                streakCurrent: user.streak_current,
                daysSinceLast: daysSinceLast,
              },
            });
          }
        }
      }
    }
    
    // ============================================
    // TASK REMINDERS (task in scadenza oggi o domani)
    // ============================================
    const todayForTasks = new Date();
    todayForTasks.setHours(0, 0, 0, 0);
    const tomorrow = new Date(todayForTasks);
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
        todayForTasks.toISOString().split('T')[0],
        tomorrow.toISOString().split('T')[0]
      ])
      .limit(1000);
    
    if (tasksError) {
      console.error('Error fetching tasks for reminders:', tasksError);
    } else if (tasksDue && tasksDue.length > 0) {
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
          (taskDate.getTime() - todayForTasks.getTime()) / (1000 * 60 * 60 * 24)
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
      
      // Aggiungi notifiche task reminders
      for (const [userId, tasks] of userTasksMap.entries()) {
        // Ottieni email utente
        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        if (!authUser?.user?.email) continue;
        
        // Crea notifica per ogni task
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
    }
    
    // Invia tutte le notifiche (challenge + task reminders) in batch
    let sentCount = 0;
    let failedCount = 0;
    
    if (emailNotifications.length > 0) {
      const result = await sendBatchNotifications(emailNotifications, supabase);
      sentCount = result.sent;
      failedCount = result.failed;
      
      if (result.errors.length > 0) {
        console.error('Some notifications failed:', result.errors.slice(0, 5));
      }
    }
    
    const challengeNotifications = emailNotifications.filter(n => n.type === 'challenge_available' || n.type === 'streak_reminder').length;
    const taskReminderNotifications = emailNotifications.filter(n => n.type === 'task_reminder').length;
    
    console.log(`Daily notifications: ${sentCount} sent, ${failedCount} failed out of ${emailNotifications.length} total (${challengeNotifications} challenge, ${taskReminderNotifications} task reminders)`);
    
    return NextResponse.json({
      success: true,
      date: today.toISOString(),
      challenge: challenge ? {
        id: `${challenge.giorno}-${challenge.mese}`,
        titolo: challenge.challenge.titolo,
        punti: challenge.challenge.punti
      } : null,
      tasks_due_count: tasksDue?.length || 0,
      notifications_count: emailNotifications.length,
      challenge_notifications: challengeNotifications,
      task_reminder_notifications: taskReminderNotifications,
      sent_count: sentCount,
      failed_count: failedCount,
    });
  } catch (error) {
    console.error('Error in daily challenge cron:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
