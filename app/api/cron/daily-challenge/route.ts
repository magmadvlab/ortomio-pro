/**
 * Daily Challenge Notification Cron Job
 * Vercel Cron: Esegue ogni giorno alle 8:00 AM
 * Notifica challenge del giorno disponibile + streak reminder
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSupabase } from '../../../../lib/supabase-server';
import { getChallengeForDate } from '../../../../data/giornateSpeciali';
import { sendBatchNotifications, createChallengeNotification, NotificationData } from '../../../../services/notificationService';

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
    const challenge = getChallengeForDate(today);
    
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
    
    // Invia notifiche email in batch
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
    
    console.log(`Daily challenge notifications: ${sentCount} sent, ${failedCount} failed out of ${emailNotifications.length} total`);
    
    return NextResponse.json({
      success: true,
      date: today.toISOString(),
      challenge: {
        id: `${challenge.giorno}-${challenge.mese}`,
        titolo: challenge.challenge.titolo,
        punti: challenge.challenge.punti
      },
      notifications_count: emailNotifications.length,
      sent_count: sentCount,
      failed_count: failedCount,
      notifications: emailNotifications.slice(0, 10).map(n => ({ userId: n.userId, type: n.type })) // Mostra primi 10 per debug
    });
  } catch (error) {
    console.error('Error in daily challenge cron:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
