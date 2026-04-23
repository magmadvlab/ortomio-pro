/**
 * Daily Task Reminder Cron Job
 * Legacy path kept for backward compatibility.
 *
 * This endpoint no longer handles gamification or daily challenges.
 * It only sends operational reminders for tasks due today or tomorrow.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireSupabase } from '@/lib/supabase-server'
import {
  sendBatchNotifications,
  createTaskReminderNotification,
  NotificationData,
} from '@/services/notificationService'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  try {
    const supabase = requireSupabase()
    const authHeader = request.headers.get('authorization')

    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date()
    const todayForTasks = new Date(today)
    todayForTasks.setHours(0, 0, 0, 0)

    const tomorrow = new Date(todayForTasks)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data: tasksDue, error: tasksError } = await supabase
      .from('garden_tasks')
      .select(
        `
        id,
        plant_name,
        task_type,
        date,
        completed,
        garden_id,
        gardens!inner(user_id)
      `
      )
      .eq('completed', false)
      .in('date', [
        todayForTasks.toISOString().split('T')[0],
        tomorrow.toISOString().split('T')[0],
      ])
      .limit(1000)

    if (tasksError) {
      console.error('Error fetching tasks for reminders:', tasksError)
      return NextResponse.json({ error: tasksError.message }, { status: 500 })
    }

    const userTasksMap = new Map<
      string,
      Array<{
        id: string
        plant_name: string
        task_type: string
        date: string
        daysUntilDue: number
      }>
    >()

    for (const task of tasksDue || []) {
      const userId = (task.gardens as { user_id?: string } | null)?.user_id
      if (!userId) continue

      const taskDate = new Date(task.date)
      const daysUntilDue = Math.floor(
        (taskDate.getTime() - todayForTasks.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (!userTasksMap.has(userId)) {
        userTasksMap.set(userId, [])
      }

      userTasksMap.get(userId)!.push({
        id: task.id,
        plant_name: task.plant_name,
        task_type: task.task_type,
        date: task.date,
        daysUntilDue,
      })
    }

    const emailNotifications: NotificationData[] = []

    for (const [userId, tasks] of userTasksMap.entries()) {
      const { data: authUser } = await supabase.auth.admin.getUserById(userId)
      if (!authUser?.user?.email) continue

      for (const task of tasks) {
        emailNotifications.push(
          createTaskReminderNotification(userId, authUser.user.email, {
            id: task.id,
            plant_name: task.plant_name,
            task_type: task.task_type,
            date: task.date,
            daysUntilDue: task.daysUntilDue,
          })
        )
      }
    }

    let sentCount = 0
    let failedCount = 0

    if (emailNotifications.length > 0) {
      const result = await sendBatchNotifications(emailNotifications, supabase)
      sentCount = result.sent
      failedCount = result.failed

      if (result.errors.length > 0) {
        console.error('Some task reminder notifications failed:', result.errors.slice(0, 5))
      }
    }

    return NextResponse.json({
      success: true,
      date: today.toISOString(),
      tasks_due_count: tasksDue?.length || 0,
      notifications_count: emailNotifications.length,
      task_reminder_notifications: emailNotifications.length,
      sent_count: sentCount,
      failed_count: failedCount,
      legacy_path: 'daily-challenge',
      mode: 'task_reminders_only',
    })
  } catch (error) {
    console.error('Error in daily task reminder cron:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
