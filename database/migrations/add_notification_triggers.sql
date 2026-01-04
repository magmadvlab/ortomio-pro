-- Migration: Add Notification Triggers
-- Crea trigger per inviare notifiche quando si verificano eventi critici
-- I trigger chiamano la Supabase Edge Function send-notification

-- Abilita estensione per chiamate HTTP (se non già abilitata)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================
-- HELPER FUNCTION: Chiama Edge Function per notifiche
-- ============================================

CREATE OR REPLACE FUNCTION notify_via_edge_function(
  p_user_id UUID,
  p_user_email TEXT,
  p_type TEXT,
  p_subject TEXT,
  p_template_data JSONB
)
RETURNS VOID AS $$
DECLARE
  v_supabase_url TEXT;
  v_service_role_key TEXT;
  v_payload JSONB;
BEGIN
  -- Ottieni configurazione da variabili ambiente (da configurare in Supabase)
  -- Per ora usa URL hardcoded (da aggiornare con variabile ambiente)
  v_supabase_url := current_setting('app.settings.supabase_url', true);
  v_service_role_key := current_setting('app.settings.service_role_key', true);

  -- Se non configurato, esci silenziosamente (non bloccare operazioni)
  IF v_supabase_url IS NULL OR v_service_role_key IS NULL THEN
    RAISE NOTICE 'Notification service not configured, skipping notification';
    RETURN;
  END IF;

  -- Costruisci payload
  v_payload := jsonb_build_object(
    'to', p_user_email,
    'subject', p_subject,
    'type', p_type,
    'templateData', p_template_data
  );

  -- Chiama Edge Function via HTTP
  PERFORM net.http_post(
    url := v_supabase_url || '/functions/v1/send-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_service_role_key
    ),
    body := v_payload::jsonb
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Log errore ma non bloccare operazione principale
    RAISE WARNING 'Error sending notification: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Task Completato
-- ============================================

CREATE OR REPLACE FUNCTION notify_task_completed()
RETURNS TRIGGER AS $$
DECLARE
  v_user_email TEXT;
  v_user_id UUID;
BEGIN
  -- Solo se task è stato appena completato (era false, ora è true)
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    -- Ottieni email utente dal garden
    SELECT g.user_id INTO v_user_id
    FROM gardens g
    WHERE g.id = NEW.garden_id;

    -- Ottieni email da auth.users
    SELECT email INTO v_user_email
    FROM auth.users
    WHERE id = v_user_id;

    IF v_user_email IS NOT NULL THEN
      PERFORM notify_via_edge_function(
        v_user_id,
        v_user_email,
        'task_completed',
        '✅ Task completato: ' || NEW.plant_name,
        jsonb_build_object(
          'taskId', NEW.id,
          'plantName', NEW.plant_name,
          'taskType', NEW.task_type,
          'completedDate', COALESCE(NEW.completed_at::text, NOW()::text)
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_task_completed
  AFTER UPDATE ON garden_tasks
  FOR EACH ROW
  WHEN (NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false))
  EXECUTE FUNCTION notify_task_completed();

-- ============================================
-- TRIGGER: Nuovo Task Creato
-- ============================================

CREATE OR REPLACE FUNCTION notify_task_created()
RETURNS TRIGGER AS $$
DECLARE
  v_user_email TEXT;
  v_user_id UUID;
BEGIN
  -- Solo per task non suggeriti (task manuali)
  IF NEW.is_suggested = false THEN
    -- Ottieni email utente dal garden
    SELECT g.user_id INTO v_user_id
    FROM gardens g
    WHERE g.id = NEW.garden_id;

    -- Ottieni email da auth.users
    SELECT email INTO v_user_email
    FROM auth.users
    WHERE id = v_user_id;

    IF v_user_email IS NOT NULL THEN
      PERFORM notify_via_edge_function(
        v_user_id,
        v_user_email,
        'task_created',
        '📝 Nuovo task creato: ' || NEW.plant_name,
        jsonb_build_object(
          'taskId', NEW.id,
          'plantName', NEW.plant_name,
          'taskType', NEW.task_type,
          'date', NEW.date::text
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_task_created
  AFTER INSERT ON garden_tasks
  FOR EACH ROW
  WHEN (NEW.is_suggested = false)
  EXECUTE FUNCTION notify_task_created();

-- ============================================
-- TRIGGER: Raccolto Registrato
-- ============================================

CREATE OR REPLACE FUNCTION notify_harvest_logged()
RETURNS TRIGGER AS $$
DECLARE
  v_user_email TEXT;
  v_user_id UUID;
BEGIN
  -- Ottieni email utente dal garden
  SELECT g.user_id INTO v_user_id
  FROM gardens g
  WHERE g.id = NEW.garden_id;

  -- Ottieni email da auth.users
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = v_user_id;

  IF v_user_email IS NOT NULL THEN
    PERFORM notify_via_edge_function(
      v_user_id,
      v_user_email,
      'harvest_logged',
      '🌾 Raccolto registrato: ' || NEW.plant_name,
      jsonb_build_object(
        'harvestId', NEW.id,
        'plantName', NEW.plant_name,
        'quantity', NEW.quantity,
        'unit', NEW.unit,
        'harvestDate', NEW.harvest_date::text
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_harvest_logged
  AFTER INSERT ON harvest_logs
  FOR EACH ROW
  EXECUTE FUNCTION notify_harvest_logged();

-- ============================================
-- TRIGGER: Semi in Scadenza
-- ============================================

CREATE OR REPLACE FUNCTION notify_seed_expiring()
RETURNS TRIGGER AS $$
DECLARE
  v_user_email TEXT;
  v_days_remaining INTEGER;
BEGIN
  -- Calcola giorni rimanenti fino alla scadenza
  v_days_remaining := NEW.expiry_year - EXTRACT(YEAR FROM CURRENT_DATE);

  -- Notifica solo se scadenza entro 30 giorni
  IF v_days_remaining <= 30 AND v_days_remaining > 0 THEN
    -- Ottieni email da auth.users
    SELECT email INTO v_user_email
    FROM auth.users
    WHERE id = NEW.user_id;

    IF v_user_email IS NOT NULL THEN
      PERFORM notify_via_edge_function(
        NEW.user_id,
        v_user_email,
        'seed_expiring',
        '⚠️ Semi in scadenza: ' || NEW.variety_name,
        jsonb_build_object(
          'seedId', NEW.id,
          'varietyName', NEW.variety_name,
          'expiryYear', NEW.expiry_year,
          'daysRemaining', v_days_remaining
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_seed_expiring
  AFTER INSERT OR UPDATE ON seed_inventory
  FOR EACH ROW
  WHEN (NEW.expiry_year - EXTRACT(YEAR FROM CURRENT_DATE) <= 30 AND NEW.expiry_year - EXTRACT(YEAR FROM CURRENT_DATE) > 0)
  EXECUTE FUNCTION notify_seed_expiring();

-- ============================================
-- TRIGGER: Scorte Semi Basse
-- ============================================

CREATE OR REPLACE FUNCTION notify_seed_low_quantity()
RETURNS TRIGGER AS $$
DECLARE
  v_user_email TEXT;
BEGIN
  -- Notifica solo se quantità è "Low" o "Empty"
  IF NEW.quantity_remaining IN ('Low', 'Empty') AND 
     (OLD.quantity_remaining IS NULL OR OLD.quantity_remaining NOT IN ('Low', 'Empty')) THEN
    -- Ottieni email da auth.users
    SELECT email INTO v_user_email
    FROM auth.users
    WHERE id = NEW.user_id;

    IF v_user_email IS NOT NULL THEN
      PERFORM notify_via_edge_function(
        NEW.user_id,
        v_user_email,
        'seed_low_quantity',
        '📦 Scorte basse: ' || NEW.variety_name,
        jsonb_build_object(
          'seedId', NEW.id,
          'varietyName', NEW.variety_name,
          'quantityRemaining', NEW.quantity_remaining
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_seed_low_quantity
  AFTER UPDATE ON seed_inventory
  FOR EACH ROW
  WHEN (NEW.quantity_remaining IN ('Low', 'Empty') AND (OLD.quantity_remaining IS NULL OR OLD.quantity_remaining NOT IN ('Low', 'Empty')))
  EXECUTE FUNCTION notify_seed_low_quantity();

-- ============================================
-- NOTE: Configurazione Variabili Ambiente
-- ============================================
-- Per far funzionare i trigger, configurare in Supabase:
-- ALTER DATABASE postgres SET app.settings.supabase_url = 'https://your-project.supabase.co';
-- ALTER DATABASE postgres SET app.settings.service_role_key = 'your-service-role-key';
--
-- Oppure usare Supabase Secrets per maggiore sicurezza








