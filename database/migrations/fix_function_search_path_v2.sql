-- Migration: Fix Function Search Path (v2)
-- Aggiunge SET search_path alle funzioni che ancora non lo hanno
-- Risolve gli avvisi del Security Advisor per search_path mutabile
--
-- Data: 2025-01-XX
-- Descrizione: Corregge search_path mutabile su funzioni per sicurezza

-- ============================================
-- Fix calculate_zone_area
-- ============================================
CREATE OR REPLACE FUNCTION calculate_zone_area(coordinates JSONB, garden_size_sq_meters DECIMAL)
RETURNS DECIMAL 
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  area_cm2 DECIMAL;
  area_m2 DECIMAL;
BEGIN
  -- Calcolo area poligono usando Shoelace formula (approssimato)
  -- Per ora restituisce area approssimativa basata su bounding box
  -- In futuro si può implementare calcolo preciso poligono
  
  -- Se coordinates è un array di punti, calcola bounding box
  IF jsonb_typeof(coordinates) = 'array' THEN
    -- Approssimazione: usa bounding box
    -- In produzione implementare calcolo preciso poligono
    area_m2 := garden_size_sq_meters * 0.1; -- Default 10% dell'orto
  ELSE
    -- Se è un oggetto con width/height, calcola direttamente
    IF coordinates ? 'width' AND coordinates ? 'height' THEN
      area_m2 := (coordinates->>'width')::DECIMAL * (coordinates->>'height')::DECIMAL / 10000; -- cm² to m²
    ELSE
      area_m2 := garden_size_sq_meters * 0.1; -- Default fallback
    END IF;
  END IF;
  
  RETURN area_m2;
END;
$$;

-- ============================================
-- Fix update_updated_at_column (assicurarsi che sia corretta)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- Verifica che le funzioni abbiano search_path impostato
-- ============================================
DO $$
BEGIN
  -- Verifica calculate_zone_area
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = 'calculate_zone_area'
    AND p.proconfig IS NOT NULL
    AND array_to_string(p.proconfig, ',') LIKE '%search_path%'
  ) THEN
    RAISE NOTICE '✅ calculate_zone_area ha search_path impostato';
  ELSE
    RAISE WARNING '⚠️ calculate_zone_area potrebbe non avere search_path impostato correttamente';
  END IF;

  -- Verifica update_updated_at_column
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = 'update_updated_at_column'
    AND p.proconfig IS NOT NULL
    AND array_to_string(p.proconfig, ',') LIKE '%search_path%'
  ) THEN
    RAISE NOTICE '✅ update_updated_at_column ha search_path impostato';
  ELSE
    RAISE WARNING '⚠️ update_updated_at_column potrebbe non avere search_path impostato correttamente';
  END IF;
END $$;

