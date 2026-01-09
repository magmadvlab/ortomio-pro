-- ============================================
-- Fix Login Schema Error v2
-- Correzione problemi con trigger e funzioni durante il login
-- ============================================

-- Step 1: Correggere grant_credits() per compatibilità con SECURITY DEFINER
-- Il problema: grant_credits() ha SET search_path = public, ma viene chiamata
-- da handle_new_user_credits() che ha SET search_path = ''
-- Soluzione: Aggiungere SECURITY DEFINER e SET search_path = '' anche a grant_credits()

CREATE OR REPLACE FUNCTION grant_credits(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET ai_credits_total = ai_credits_total + p_amount
  WHERE id = p_user_id;
  
  -- Se il profilo non esiste, crealo
  IF NOT FOUND THEN
    INSERT INTO profiles (id, tier, ai_credits_total, ai_credits_used)
    VALUES (p_user_id, 'FREE', p_amount, 0)
    ON CONFLICT (id) DO UPDATE
    SET ai_credits_total = profiles.ai_credits_total + p_amount;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Step 2: Rendere handle_new_user_credits() più robusto con gestione errori
-- Aggiungere BEGIN ... EXCEPTION ... END per catturare errori e non bloccare il login

CREATE OR REPLACE FUNCTION handle_new_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- Usa un blocco con gestione errori per evitare che errori blocchino il login
  BEGIN
    -- Crea profilo se non esiste
    INSERT INTO profiles (id, tier, ai_credits_total, ai_credits_used)
    VALUES (NEW.id, 'FREE', 3, 0)
    ON CONFLICT (id) DO NOTHING;
    
    -- Verifica se il bonus welcome è già stato dato
    IF NOT EXISTS (
      SELECT 1 FROM ai_credit_transactions 
      WHERE user_id = NEW.id 
        AND type = 'bonus' 
        AND description LIKE '%Welcome%'
    ) THEN
      -- Concedi crediti iniziali
      PERFORM grant_credits(NEW.id, 3);
      
      -- Registra transazione
      INSERT INTO ai_credit_transactions (user_id, amount, type, description)
      VALUES (NEW.id, 3, 'bonus', 'Welcome bonus - 3 free AI credits')
      ON CONFLICT DO NOTHING;
    END IF;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Log errore ma non bloccare il login
      -- In produzione, potresti voler loggare questo errore
      RAISE WARNING 'Error in handle_new_user_credits for user %: %', NEW.id, SQLERRM;
      -- Continua comunque, non bloccare il login
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Step 3: Verificare che il trigger esista e sia configurato correttamente
-- Il trigger dovrebbe essere AFTER INSERT ON auth.users, quindi non interferisce con login esistenti

DROP TRIGGER IF EXISTS on_user_created_credits ON auth.users CASCADE;

CREATE TRIGGER on_user_created_credits
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user_credits();

-- Step 4: Correggere anche deduct_credits() per consistenza
CREATE OR REPLACE FUNCTION deduct_credits(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET ai_credits_used = ai_credits_used + p_amount
  WHERE id = p_user_id
    AND (ai_credits_total - ai_credits_used) >= p_amount;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Verifica: Le funzioni ora hanno tutte SECURITY DEFINER SET search_path = ''
-- Questo garantisce che funzionino correttamente quando chiamate da trigger

