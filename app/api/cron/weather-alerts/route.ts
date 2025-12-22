/**
 * Weather Alerts Cron Job
 * Vercel Cron: Esegue ogni giorno alle 6:00 AM
 * Verifica e notifica allarmi meteo critici (gelate, pioggia eccessiva, siccità)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSupabase } from '../../../../lib/supabase-server';
import { getWeatherForecast, checkCriticalWeatherAlerts, WeatherForecast } from '../../../../services/weatherService';
import { sendBatchNotifications, createWeatherAlertNotification, NotificationData } from '../../../../services/notificationService';

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
    
    // Ottieni tutti i giardini con coordinate
    const { data: gardens, error: gardensError } = await supabase
      .from('gardens')
      .select('id, user_id, coordinates, name')
      .not('coordinates', 'is', null)
      .limit(1000);
    
    if (gardensError) {
      console.error('Error fetching gardens:', gardensError);
      return NextResponse.json(
        { error: gardensError.message },
        { status: 500 }
      );
    }
    
    if (!gardens || gardens.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No gardens with coordinates found',
        alerts_sent: 0,
      });
    }
    
    const emailNotifications: NotificationData[] = [];
    const today = new Date().toISOString().split('T')[0];
    
    // Per ogni giardino, verifica allarmi meteo
    for (const garden of gardens) {
      try {
        const coordinates = garden.coordinates as { latitude: number; longitude: number };
        if (!coordinates?.latitude || !coordinates?.longitude) continue;
        
        // Ottieni previsioni meteo
        const forecast = await getWeatherForecast(
          coordinates.latitude,
          coordinates.longitude
        );
        
        if (!forecast || forecast.length === 0) continue;
        
        // Verifica allarmi critici per oggi
        const todayForecast = forecast.find(f => f.date === today) || forecast[0];
        const alerts = checkCriticalWeatherAlerts(todayForecast);
        
        if (alerts.length === 0) continue;
        
        // Ottieni email utente
        const { data: authUser } = await supabase.auth.admin.getUserById(garden.user_id);
        if (!authUser?.user?.email) continue;
        
        // Crea notifica per ogni allarme
        for (const alert of alerts) {
          emailNotifications.push(
            createWeatherAlertNotification(
              garden.user_id,
              authUser.user.email,
              {
                type: alert.type === 'frost' ? 'Gelata' : 
                      alert.type === 'heat' ? 'Ondata di Calore' : 
                      'Pioggia Intensa',
                severity: alert.severity.toLowerCase(),
                message: alert.message,
                date: today,
              }
            )
          );
        }
      } catch (error) {
        console.error(`Error processing garden ${garden.id}:`, error);
        // Continua con prossimo giardino
        continue;
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
        console.error('Some weather alert notifications failed:', result.errors.slice(0, 5));
      }
    }
    
    return NextResponse.json({
      success: true,
      date: today,
      gardens_checked: gardens.length,
      alerts_found: emailNotifications.length,
      notifications_sent: sentCount,
      notifications_failed: failedCount,
    });
  } catch (error: any) {
    console.error('Error in weather alerts cron:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}


