-- Migration: API Configurations
-- Permette agli utenti di configurare API keys personalizzate per servizi AI e meteo
-- Supporta diversi provider: Gemini, OpenAI, Anthropic, Ollama, Open-Meteo, WeatherAPI, etc.

-- ============================================
-- API CONFIGURATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS api_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Tipo servizio
  service_type TEXT NOT NULL CHECK (
    service_type IN (
      -- AI Services
      'ai_gemini', 'ai_openai', 'ai_anthropic', 'ai_ollama', 'ai_local',
      -- Weather Services
      'weather_openmeteo', 'weather_weatherapi', 'weather_openweathermap', 'weather_custom'
    )
  ),
  
  -- Nome provider (es. "Gemini Flash", "OpenAI GPT-4", "Ollama Llama 3")
  provider_name TEXT NOT NULL,
  
  -- API Key (criptata con pgcrypto)
  api_key_encrypted TEXT NOT NULL,
  
  -- Configurazione aggiuntiva (JSONB)
  config JSONB DEFAULT '{}', -- { model: "gpt-4", base_url: "http://localhost:11434", etc. }
  
  -- Stato
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false, -- true se è il provider di default per questo tipo servizio
  
  -- Metadata
  last_used_at TIMESTAMPTZ,
  last_error TEXT, -- Ultimo errore se test fallito
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_configurations_user ON api_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_api_configurations_service ON api_configurations(service_type);
CREATE INDEX IF NOT EXISTS idx_api_configurations_active ON api_configurations(user_id, service_type, is_active) WHERE is_active = true;

-- Partial unique index: garantisce un solo provider default per tipo servizio per utente
-- Questo permette più configurazioni per tipo servizio, ma solo una può essere default
CREATE UNIQUE INDEX IF NOT EXISTS idx_api_configurations_one_default_per_service 
ON api_configurations(user_id, service_type) 
WHERE is_default = true;

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_api_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_api_configurations_updated_at ON api_configurations;
CREATE TRIGGER update_api_configurations_updated_at
  BEFORE UPDATE ON api_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_api_configurations_updated_at();

-- Funzione per criptare API key (usa pgcrypto)
-- Nota: In produzione, usa una chiave di criptazione più sicura
CREATE OR REPLACE FUNCTION encrypt_api_key(plain_key TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Usa pgcrypto per criptare (richiede estensione pgcrypto)
  -- In produzione, usa una chiave di criptazione gestita dal sistema
  RETURN encode(digest(plain_key || 'salt_key_change_in_production', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Funzione per decriptare API key (per uso interno, solo server-side)
CREATE OR REPLACE FUNCTION decrypt_api_key(encrypted_key TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Nota: Questo è un esempio semplificato
  -- In produzione, usa criptazione simmetrica con chiave gestita dal sistema
  -- Per ora, restituiamo l'encrypted_key (la decriptazione vera sarà fatta lato applicazione)
  RETURN encrypted_key;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE api_configurations ENABLE ROW LEVEL SECURITY;

-- Policy: Utenti possono vedere solo le proprie configurazioni
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'api_configurations' 
    AND policyname = 'api_configurations_user_select'
  ) THEN
    CREATE POLICY api_configurations_user_select ON api_configurations
      FOR SELECT
      USING ((SELECT auth.uid()) = user_id);
  END IF;
END $$;

-- Policy: Utenti possono inserire solo le proprie configurazioni
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'api_configurations' 
    AND policyname = 'api_configurations_user_insert'
  ) THEN
    CREATE POLICY api_configurations_user_insert ON api_configurations
      FOR INSERT
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
END $$;

-- Policy: Utenti possono aggiornare solo le proprie configurazioni
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'api_configurations' 
    AND policyname = 'api_configurations_user_update'
  ) THEN
    CREATE POLICY api_configurations_user_update ON api_configurations
      FOR UPDATE
      USING ((SELECT auth.uid()) = user_id)
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
END $$;

-- Policy: Utenti possono eliminare solo le proprie configurazioni
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'api_configurations' 
    AND policyname = 'api_configurations_user_delete'
  ) THEN
    CREATE POLICY api_configurations_user_delete ON api_configurations
      FOR DELETE
      USING ((SELECT auth.uid()) = user_id);
  END IF;
END $$;

-- Funzione helper per ottenere API key attiva per un servizio
CREATE OR REPLACE FUNCTION get_active_api_key(
  p_user_id UUID,
  p_service_type TEXT
)
RETURNS TABLE (
  id UUID,
  provider_name TEXT,
  api_key_encrypted TEXT,
  config JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ac.id,
    ac.provider_name,
    ac.api_key_encrypted,
    ac.config
  FROM api_configurations ac
  WHERE ac.user_id = p_user_id
    AND ac.service_type = p_service_type
    AND ac.is_active = true
  ORDER BY ac.is_default DESC, ac.last_used_at DESC NULLS LAST
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commenti
COMMENT ON TABLE api_configurations IS 'Configurazioni API keys personalizzate degli utenti per servizi AI e meteo';
COMMENT ON COLUMN api_configurations.service_type IS 'Tipo servizio: ai_gemini, ai_openai, weather_openmeteo, etc.';
COMMENT ON COLUMN api_configurations.api_key_encrypted IS 'API key criptata (non in plain text)';
COMMENT ON COLUMN api_configurations.config IS 'Configurazione aggiuntiva: model, base_url, temperature, etc.';
COMMENT ON COLUMN api_configurations.is_default IS 'True se è il provider di default per questo tipo servizio';

