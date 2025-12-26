-- Migration: Create Weather Cache Table
-- Tabella per cache delle previsioni meteo per ridurre chiamate API
-- Created: 2025-12-26

-- Enable UUID extension (se non già abilitato)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TABELLA WEATHER_CACHE
-- ============================================
-- Cache delle previsioni meteo per coordinate e data
-- Evita chiamate ripetute API meteo per stessa località/giorno

CREATE TABLE IF NOT EXISTS weather_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Chiave univoca: lat_lng + date
  lat_lng TEXT NOT NULL, -- formato: "44.4944_11.3425"
  date DATE NOT NULL, -- data della previsione (YYYY-MM-DD)
  
  -- Dati previsione
  forecast JSONB NOT NULL, -- array previsioni 7 giorni
  
  -- Metadata
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  
  -- Constraint univoco per evitare duplicati
  CONSTRAINT weather_cache_unique UNIQUE (lat_lng, date)
);

-- ============================================
-- 2. INDICI
-- ============================================
CREATE INDEX IF NOT EXISTS idx_weather_cache_lat_lng_date ON weather_cache(lat_lng, date);
CREATE INDEX IF NOT EXISTS idx_weather_cache_expires_at ON weather_cache(expires_at);

-- ============================================
-- 3. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE weather_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Tutti possono leggere (cache condivisa)
CREATE POLICY "Anyone can read weather cache"
  ON weather_cache FOR SELECT
  USING (true);

-- Policy: Solo utenti autenticati possono scrivere
CREATE POLICY "Authenticated users can write weather cache"
  ON weather_cache FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update weather cache"
  ON weather_cache FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ============================================
-- 4. AUTO-CLEANUP EXPIRED ENTRIES
-- ============================================
-- Funzione per pulire automaticamente entry scadute
CREATE OR REPLACE FUNCTION cleanup_expired_weather_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM weather_cache 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger per pulizia automatica ogni ora (opzionale)
-- CREATE OR REPLACE FUNCTION trigger_cleanup_weather_cache()
-- RETURNS trigger AS $$
-- BEGIN
--   PERFORM cleanup_expired_weather_cache();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- ============================================
-- 5. COMMENTI
-- ============================================
COMMENT ON TABLE weather_cache IS
'Cache delle previsioni meteo per coordinate e data.
Riduce chiamate API esterne e migliora performance WeatherWidget.';

COMMENT ON COLUMN weather_cache.lat_lng IS
'Coordinate in formato "lat_lng" con 4 decimali.
Es: "44.4944_11.3425" per Bologna.';

COMMENT ON COLUMN weather_cache.date IS
'Data di riferimento della previsione (YYYY-MM-DD).';

COMMENT ON COLUMN weather_cache.expires_at IS
'Data e ora di scadenza cache (default 24 ore).';
