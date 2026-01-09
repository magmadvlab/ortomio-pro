-- Migration: Fix Function Search Path
-- Aggiunge SET search_path a tutte le funzioni che non lo hanno
-- Risolve gli avvisi del Security Advisor

-- ============================================
-- Fix update_updated_at_column
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================
-- Fix deduct_credits
-- ============================================
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
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================
-- Fix grant_credits
-- ============================================
CREATE OR REPLACE FUNCTION grant_credits(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET ai_credits_total = ai_credits_total + p_amount
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================
-- Fix update_custom_crops_updated_at (se esiste)
-- ============================================
CREATE OR REPLACE FUNCTION update_custom_crops_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

