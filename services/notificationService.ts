/**
 * Notification Service
 * Servizio centralizzato per gestione notifiche email
 * Supporta template HTML, rate limiting, error handling e retry logic
 */

export type NotificationType =
  | 'task_completed'
  | 'task_reminder'
  | 'task_created'
  | 'challenge_available'
  | 'streak_reminder'
  | 'harvest_logged'
  | 'weather_alert'
  | 'seed_expiring'
  | 'seed_low_quantity'
  | 'germination-detected'
  | 'weekly-photo-reminder'
  | 'photo-analysis-complete'
  | 'fertilization-suggested';

export interface NotificationData {
  userId: string;
  userEmail: string;
  type: NotificationType;
  subject: string;
  templateData: Record<string, any>;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  task_reminders: boolean;
  weather_alerts: boolean;
  challenge_notifications: boolean;
  harvest_notifications: boolean;
  seed_notifications: boolean;
}

/**
 * Rate limiting: max 10 email per utente al giorno
 */
const RATE_LIMIT_PER_USER = 10;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 ore

// In-memory rate limiting (in produzione usare Redis)
const rateLimitCache = new Map<string, { count: number; resetAt: number }>();

/**
 * Verifica se l'utente può ricevere notifiche (rate limiting)
 */
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitCache.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    // Reset o nuovo utente
    rateLimitCache.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_PER_USER) {
    console.warn(`Rate limit exceeded for user ${userId}`);
    return false;
  }

  userLimit.count++;
  return true;
}

/**
 * Verifica preferenze utente per tipo di notifica
 */
async function checkUserPreferences(
  userId: string,
  type: NotificationType,
  supabaseClient: any
): Promise<boolean> {
  try {
    const { data: preferences, error } = await supabaseClient
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // Senza preferenze autorevoli non inviare: evitare consegne non consentite.
      console.error('Error fetching notification preferences:', error);
      return false;
    }

    if (!preferences) {
      // Nessuna preferenza salvata, usa default (invia tutto)
      return true;
    }

    // Verifica preferenze specifiche
    if (!preferences.email_enabled) {
      return false;
    }

    switch (type) {
      case 'task_completed':
      case 'task_reminder':
      case 'task_created':
        return preferences.task_reminders ?? true;
      case 'weather_alert':
        return preferences.weather_alerts ?? true;
      case 'challenge_available':
      case 'streak_reminder':
        return preferences.challenge_notifications ?? true;
      case 'harvest_logged':
        return preferences.harvest_notifications ?? true;
      case 'seed_expiring':
      case 'seed_low_quantity':
        return preferences.seed_notifications ?? true;
      case 'germination-detected':
      case 'weekly-photo-reminder':
      case 'photo-analysis-complete':
      case 'fertilization-suggested':
        return preferences.task_reminders ?? true; // Usa task_reminders per notifiche agricoltura di precisione
      default:
        return true;
    }
  } catch (error) {
    console.error('Error checking user preferences:', error);
    return false;
  }
}

/**
 * Invia notifica email tramite Supabase Edge Function
 */
export async function sendNotification(
  notification: NotificationData,
  supabaseClient: any
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verifica rate limiting
    if (!checkRateLimit(notification.userId)) {
      return {
        success: false,
        error: 'Rate limit exceeded',
      };
    }

    // Verifica preferenze utente
    const canSend = await checkUserPreferences(
      notification.userId,
      notification.type,
      supabaseClient
    );

    if (!canSend) {
      return {
        success: false,
        error: 'User preferences disabled this notification type',
      };
    }

    // Ottieni URL Edge Function da variabile ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      // Non loggare come errore - è normale se le notifiche email non sono configurate
      // Silently fail invece di loggare errori che confondono gli utenti
      return {
        success: false,
        error: 'Notifications not configured',
      };
    }

    // Chiama Edge Function
    const response = await fetch(
      `${supabaseUrl}/functions/v1/send-notification`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          to: notification.userEmail,
          subject: notification.subject,
          type: notification.type,
          templateData: notification.templateData,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge Function error:', errorText);
      return {
        success: false,
        error: `Edge Function failed: ${response.statusText}`,
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error sending notification:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Invia notifiche batch (per cron jobs)
 */
export async function sendBatchNotifications(
  notifications: NotificationData[],
  supabaseClient: any
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = await Promise.allSettled(
    notifications.map((notif) => sendNotification(notif, supabaseClient))
  );

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      sent++;
    } else {
      failed++;
      const error =
        result.status === 'rejected'
          ? result.reason?.message || 'Unknown error'
          : result.value.error || 'Failed';
      errors.push(`Notification ${index}: ${error}`);
    }
  });

  return { sent, failed, errors };
}

/**
 * Helper per creare NotificationData per task completato
 */
export function createTaskCompletedNotification(
  userId: string,
  userEmail: string,
  task: { id: string; plant_name: string; task_type: string; date: string }
): NotificationData {
  return {
    userId,
    userEmail,
    type: 'task_completed',
    subject: `✅ Task completato: ${task.plant_name}`,
    templateData: {
      taskId: task.id,
      plantName: task.plant_name,
      taskType: task.task_type,
      completedDate: task.date,
    },
  };
}

/**
 * Helper per creare NotificationData per task reminder
 */
export function createTaskReminderNotification(
  userId: string,
  userEmail: string,
  task: {
    id: string;
    plant_name: string;
    task_type: string;
    date: string;
    daysUntilDue: number;
  }
): NotificationData {
  return {
    userId,
    userEmail,
    type: 'task_reminder',
    subject: `⏰ Promemoria: ${task.plant_name} - ${task.task_type}`,
    templateData: {
      taskId: task.id,
      plantName: task.plant_name,
      taskType: task.task_type,
      dueDate: task.date,
      daysUntilDue: task.daysUntilDue,
    },
  };
}

/**
 * Helper per creare NotificationData per challenge
 */
export function createChallengeNotification(
  userId: string,
  userEmail: string,
  challenge: { id: string; titolo: string; punti: number }
): NotificationData {
  return {
    userId,
    userEmail,
    type: 'challenge_available',
    subject: `🎯 Nuova Challenge: ${challenge.titolo}`,
    templateData: {
      challengeId: challenge.id,
      titolo: challenge.titolo,
      punti: challenge.punti,
    },
  };
}

/**
 * Helper per creare NotificationData per weather alert
 */
export function createWeatherAlertNotification(
  userId: string,
  userEmail: string,
  alert: { type: string; severity: string; message: string; date: string }
): NotificationData {
  return {
    userId,
    userEmail,
    type: 'weather_alert',
    subject: `⚠️ Allarme Meteo: ${alert.type}`,
    templateData: {
      alertType: alert.type,
      severity: alert.severity,
      message: alert.message,
      date: alert.date,
    },
  };
}

