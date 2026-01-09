-- Migration: Trigger per notifiche quando vengono creati calendar tasks da challenge
-- Invia notifica quando un task viene creato da una challenge

-- Funzione per inviare notifica quando viene creato un calendar task da challenge
CREATE OR REPLACE FUNCTION notify_calendar_task_created()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  challenge_title TEXT;
  notification_html TEXT;
BEGIN
  -- Se il task viene da una challenge, invia notifica
  IF NEW.source_type = 'challenge' AND NEW.challenge_id IS NOT NULL THEN
    -- Recupera email utente
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = NEW.user_id;
    
    -- Costruisci HTML notifica
    notification_html := format(
      '<html><body>' ||
      '<h1 style="color: #7c3aed;">Nuovo Task nel Calendario!</h1>' ||
      '<p>Hai aggiunto un task dalla challenge al tuo calendario:</p>' ||
      '<div style="background: #f3f4f6; padding: 12px; border-radius: 8px; margin: 16px 0;">' ||
      '<p style="font-weight: bold; margin: 0;">%s</p>' ||
      '<p style="color: #6b7280; font-size: 14px; margin: 8px 0 0 0;">Data: %s</p>' ||
      '</div>' ||
      '<p style="color: #6b7280;">Il task è stato aggiunto al tuo calendario e riceverai un promemoria quando sarà il momento di completarlo.</p>' ||
      '<a href="https://ortomio.it/app/calendar" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">Vai al Calendario</a>' ||
      '</body></html>',
      NEW.title,
      to_char(NEW.start_date, 'DD/MM/YYYY')
    );
    
    IF user_email IS NOT NULL THEN
      -- Chiama Edge Function per inviare notifica
      -- Nota: In produzione, sostituisci YOUR_PROJECT_REF con il tuo project reference
      PERFORM net.http_post(
        url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body := jsonb_build_object(
          'to', user_email,
          'subject', 'Nuovo Task da Challenge: ' || NEW.title,
          'html', notification_html,
          'type', 'task_created'
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per inviare notifica quando viene creato un task da challenge
DROP TRIGGER IF EXISTS on_calendar_task_created ON calendar_tasks;
CREATE TRIGGER on_calendar_task_created
  AFTER INSERT ON calendar_tasks
  FOR EACH ROW
  WHEN (NEW.source_type = 'challenge')
  EXECUTE FUNCTION notify_calendar_task_created();

-- Commento
COMMENT ON FUNCTION notify_calendar_task_created() IS 'Invia notifica email quando viene creato un calendar task da una challenge';







