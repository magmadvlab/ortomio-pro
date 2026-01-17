-- FIXED NUTRITION SYSTEM MIGRATION
-- Date: January 17, 2026
-- Fix: Corrected SQL function delimiter syntax errors

-- Apply only the utility functions that had syntax errors
-- The rest of the migration should work fine

-- Function to calculate treatment cost
CREATE OR REPLACE FUNCTION calculate_treatment_cost(
  dosage DECIMAL,
  area_sqm DECIMAL,
  product_cost_per_unit DECIMAL,
  labor_hours DECIMAL DEFAULT 1,
  labor_rate_per_hour DECIMAL DEFAULT 15
) RETURNS DECIMAL AS $$
DECLARE
  product_cost DECIMAL;
  labor_cost DECIMAL;
  total_cost DECIMAL;
BEGIN
  -- Calculate product cost based on dosage and area
  product_cost := (dosage * area_sqm / 10000) * product_cost_per_unit; -- convert m² to ha
  
  -- Calculate labor cost
  labor_cost := labor_hours * labor_rate_per_hour;
  
  -- Total cost
  total_cost := product_cost + labor_cost;
  
  RETURN total_cost;
END;
$$ LANGUAGE plpgsql;

-- Function to check product compatibility
CREATE OR REPLACE FUNCTION check_product_compatibility(
  product1_id UUID,
  product2_id UUID
) RETURNS TEXT AS $$
DECLARE
  compatibility_result TEXT;
BEGIN
  SELECT compatibility_type INTO compatibility_result
  FROM product_compatibility
  WHERE (product1_id = product1_id AND product2_id = product2_id)
     OR (product1_id = product2_id AND product2_id = product1_id)
  LIMIT 1;
  
  -- If no specific compatibility record found, assume compatible
  RETURN COALESCE(compatibility_result, 'compatible');
END;
$$ LANGUAGE plpgsql;

-- Function to get low stock products
CREATE OR REPLACE FUNCTION get_low_stock_products(garden_id_param UUID)
RETURNS TABLE(
  product_id UUID,
  product_name TEXT,
  product_type TEXT,
  current_stock DECIMAL,
  minimum_stock DECIMAL,
  stock_unit TEXT,
  days_until_empty INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pi.product_id,
    pi.product_name,
    pi.product_type,
    pi.current_stock,
    pi.minimum_stock,
    pi.stock_unit,
    CASE 
      WHEN pi.average_usage_per_month > 0 
      THEN CEIL((pi.current_stock / pi.average_usage_per_month) * 30)::INTEGER
      ELSE NULL
    END as days_until_empty
  FROM product_inventory pi
  WHERE pi.garden_id = garden_id_param
    AND pi.current_stock <= pi.minimum_stock
  ORDER BY (pi.current_stock / NULLIF(pi.minimum_stock, 0)) ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate organic compliance percentage
CREATE OR REPLACE FUNCTION calculate_organic_compliance(garden_id_param UUID, date_from DATE DEFAULT CURRENT_DATE - INTERVAL '30 days')
RETURNS DECIMAL AS $$
DECLARE
  total_treatments INTEGER;
  organic_treatments INTEGER;
  compliance_percentage DECIMAL;
BEGIN
  -- Count total treatments in period
  SELECT COUNT(*) INTO total_treatments
  FROM nutrition_treatments
  WHERE garden_id = garden_id_param
    AND actual_application_date >= date_from
    AND status = 'completed';
  
  -- Count organic compliant treatments
  SELECT COUNT(*) INTO organic_treatments
  FROM nutrition_treatments
  WHERE garden_id = garden_id_param
    AND actual_application_date >= date_from
    AND status = 'completed'
    AND organic_compliant = TRUE;
  
  -- Calculate percentage
  IF total_treatments > 0 THEN
    compliance_percentage := (organic_treatments::DECIMAL / total_treatments::DECIMAL) * 100;
  ELSE
    compliance_percentage := 100; -- No treatments = 100% compliant
  END IF;
  
  RETURN compliance_percentage;
END;
$$ LANGUAGE plpgsql;