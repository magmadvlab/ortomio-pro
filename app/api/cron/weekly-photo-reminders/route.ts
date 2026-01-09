/**
 * Weekly Photo Reminders Cron Job
 * Eseguito giornalmente per inviare reminder foto settimanali
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSupabase } from '../../../../lib/supabase-server';
import { getPendingReminders, markReminderSent } from '../../../../services/weeklyPhotoReminder';
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

    // Recupera tutti gli utenti con reminder pendenti
    const { data: allReminders, error: remindersError } = await supabase
      .from('weekly_photo_reminders')
      .select(`
        *,
        garden_tasks!inner(plant_name, task_type, lifecycle_state),
        profiles!inner(email)
      `)
      .eq('reminder_sent', false)
      .lte('next_reminder_date', new Date().toISOString().split('T')[0])
      .limit(1000);

    if (remindersError) {
      console.error('Error fetching photo reminders:', remindersError);
      return NextResponse.json({ error: remindersError.message }, { status: 500 });
    }

    if (!allReminders || allReminders.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending photo reminders',
        notificationsSent: 0
      });
    }

    let notificationsSent = 0;
    const errors: string[] = [];

    for (const reminder of allReminders) {
      try {
        const task = reminder.garden_tasks;
        const profile = reminder.profiles;

        if (!task || !profile?.email) {
          continue;
        }

        const plantName = task.plant_name || 'la tua pianta';
        const daysSinceLastPhoto = reminder.last_photo_date
          ? Math.floor((new Date().getTime() - new Date(reminder.last_photo_date).getTime()) / (1000 * 60 * 60 * 24))
          : null;

        const notification = {
          userId: reminder.user_id,
          userEmail: profile.email,
          type: 'weekly-photo-reminder' as const,
          subject: `📸 È il momento di scattare una foto settimanale: ${plantName}`,
          templateData: {
            plantName: plantName,
            taskId: reminder.task_id,
            daysSinceLastPhoto: daysSinceLastPhoto,
            reminderCount: reminder.reminder_count + 1,
            link: `/app/journal?taskId=${reminder.task_id}`
          }
        };
        await sendNotification(notification, supabase);

        // Marca reminder come inviato
        await markReminderSent(supabase, reminder.id);
        notificationsSent++;
      } catch (error: any) {
        const errorMsg = `Error processing reminder ${reminder.id}: ${error.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${notificationsSent} photo reminders`,
      notificationsSent,
      errors: errors.length > 0 ? errors : undefined,
      date: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in weekly photo reminders cron:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

