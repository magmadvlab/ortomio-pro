-- Fix broken orchard tree trigger functions introduced by generic linter migration
-- This restores compatibility with orchard_trees schema (tree_age_years + orchard_configurations).

CREATE OR REPLACE FUNCTION public.update_tree_age()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.planting_date IS NOT NULL THEN
    NEW.tree_age_years := EXTRACT(YEAR FROM AGE(CURRENT_DATE, NEW.planting_date))::INTEGER;
  END IF;

  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_update_orchard_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  target_orchard_id UUID;
BEGIN
  target_orchard_id := CASE
    WHEN TG_OP = 'DELETE' THEN OLD.orchard_id
    ELSE NEW.orchard_id
  END;

  IF target_orchard_id IS NOT NULL THEN
    UPDATE orchard_configurations
    SET
      total_trees = (
        SELECT COUNT(*)
        FROM orchard_trees
        WHERE orchard_id = target_orchard_id
          AND is_active = true
      ),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = target_orchard_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;
