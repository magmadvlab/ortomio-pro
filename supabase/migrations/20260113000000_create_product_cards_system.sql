-- Migrazione: Sistema Fertilizzanti e Trattamenti AI PRO
-- Crea tabella product_cards per schede AI generate

-- Tabella principale per schede prodotto AI
CREATE TABLE product_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fertilizer', 'treatment')),
  category TEXT,
  description TEXT,
  scientific_name TEXT,
  active_ingredients TEXT,
  recommended_dosage TEXT,
  application_method TEXT,
  application_frequency TEXT,
  default_repeat_days INTEGER,
  seasonal_adjustment JSONB,
  precautions TEXT[],
  best_for TEXT[],
  avoid_with TEXT[],
  best_time TEXT,
  ph_requirement TEXT,
  organic_certified BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE,
  times_used INTEGER DEFAULT 0,
  ai_generated BOOLEAN DEFAULT false,
  ai_provider TEXT,
  ai_model TEXT,
  ai_prompt TEXT,
  application_history JSONB DEFAULT '[]'::jsonb
);

-- Indici per performance
CREATE INDEX idx_product_cards_user_id ON product_cards(user_id);
CREATE INDEX idx_product_cards_garden_id ON product_cards(garden_id);
CREATE INDEX idx_product_cards_type ON product_cards(type);
CREATE INDEX idx_product_cards_last_used ON product_cards(last_used DESC NULLS LAST);
CREATE INDEX idx_product_cards_category ON product_cards(category);
CREATE INDEX idx_product_cards_ai_generated ON product_cards(ai_generated);

-- RLS (Row Level Security)
ALTER TABLE product_cards ENABLE ROW LEVEL SECURITY;

-- Policy: utenti possono vedere solo le proprie schede
CREATE POLICY "Users can view own product cards" ON product_cards
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: utenti possono inserire proprie schede
CREATE POLICY "Users can insert own product cards" ON product_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: utenti possono aggiornare proprie schede
CREATE POLICY "Users can update own product cards" ON product_cards
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: utenti possono eliminare proprie schede
CREATE POLICY "Users can delete own product cards" ON product_cards
  FOR DELETE USING (auth.uid() = user_id);

-- Funzione per aggiornare last_used automaticamente
CREATE OR REPLACE FUNCTION update_product_card_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Aggiorna last_used e incrementa times_used quando viene usata una scheda
  UPDATE product_cards 
  SET 
    last_used = NOW(),
    times_used = times_used + 1
  WHERE id = NEW.product_card_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per aggiornare usage quando viene creato un task con product_card_id
-- (Sarà attivato quando aggiungeremo il campo product_card_id alla tabella tasks)

-- Commenti per documentazione
COMMENT ON TABLE product_cards IS 'Schede prodotto AI per fertilizzanti e trattamenti fitosanitari - Sistema PRO';
COMMENT ON COLUMN product_cards.type IS 'Tipo prodotto: fertilizer o treatment';
COMMENT ON COLUMN product_cards.seasonal_adjustment IS 'Aggiustamenti stagionali per frequenza applicazione (JSON)';
COMMENT ON COLUMN product_cards.application_history IS 'Storico applicazioni con date e risultati (JSON)';
COMMENT ON COLUMN product_cards.ai_generated IS 'Indica se la scheda è stata generata da AI';
COMMENT ON COLUMN product_cards.ai_provider IS 'Provider AI utilizzato (groq, openai, etc.)';
COMMENT ON COLUMN product_cards.ai_model IS 'Modello AI utilizzato';
COMMENT ON COLUMN product_cards.ai_prompt IS 'Prompt utilizzato per generazione AI (per debugging)';