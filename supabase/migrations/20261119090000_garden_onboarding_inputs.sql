BEGIN;
ALTER TABLE public.gardens ADD COLUMN IF NOT EXISTS visual_sun_input jsonb,
  ADD COLUMN IF NOT EXISTS obstacle_changes jsonb;

-- Apply only explicit additions/removals, leaving concurrent and historical observations intact.
CREATE OR REPLACE FUNCTION public.apply_garden_obstacle_changes() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  DELETE FROM public.garden_obstacles
    WHERE garden_id = NEW.id AND id IN (
      SELECT value::uuid FROM jsonb_array_elements_text(NEW.obstacle_changes->'removed')
    );
  INSERT INTO public.garden_obstacles(garden_id,azimuth,height_meters,distance_meters,width_degrees,type,source)
  SELECT NEW.id, azimuth, height, distance, "widthDegrees", coalesce(type,'Other'), 'manual'
  FROM jsonb_to_recordset(NEW.obstacle_changes->'added')
    AS input(azimuth numeric, height numeric, distance numeric, "widthDegrees" numeric, type text);
  UPDATE public.gardens SET obstacle_changes = NULL WHERE id = NEW.id;
  RETURN NULL;
END $$;
DROP TRIGGER IF EXISTS apply_garden_obstacle_changes ON public.gardens;
CREATE TRIGGER apply_garden_obstacle_changes AFTER INSERT OR UPDATE OF obstacle_changes ON public.gardens
  FOR EACH ROW WHEN (NEW.obstacle_changes IS NOT NULL) EXECUTE FUNCTION public.apply_garden_obstacle_changes();
COMMIT;
