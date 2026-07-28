-- Canonical, transactional persistence for the live sapling batch workflow.

ALTER TABLE public.sapling_batches
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS total_quantity integer,
  ADD COLUMN IF NOT EXISTS remaining_quantity integer,
  ADD COLUMN IF NOT EXISTS supplier text,
  ADD COLUMN IF NOT EXISTS rootstock_type text,
  ADD COLUMN IF NOT EXISTS price_per_unit numeric(10, 2),
  ADD COLUMN IF NOT EXISTS total_cost numeric(10, 2);

UPDATE public.sapling_batches
SET source = COALESCE(source, 'nursery'),
    total_quantity = COALESCE(total_quantity, initial_quantity, quantity),
    remaining_quantity = COALESCE(remaining_quantity, current_quantity, quantity),
    rootstock_type = COALESCE(rootstock_type, rootstock)
WHERE source IS NULL
   OR total_quantity IS NULL
   OR remaining_quantity IS NULL
   OR (rootstock_type IS NULL AND rootstock IS NOT NULL);

ALTER TABLE public.sapling_batches
  ALTER COLUMN source SET DEFAULT 'nursery',
  ALTER COLUMN source SET NOT NULL,
  ALTER COLUMN total_quantity SET NOT NULL,
  ALTER COLUMN remaining_quantity SET NOT NULL,
  ALTER COLUMN location DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.sapling_batches'::regclass
      AND conname = 'sapling_batches_source_check'
  ) THEN
    ALTER TABLE public.sapling_batches
      ADD CONSTRAINT sapling_batches_source_check
      CHECK (source IN ('nursery', 'own'));
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.sapling_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.sapling_batches(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'nursery'
    CHECK (status IN ('nursery', 'ready_to_plant', 'planted', 'dead')),
  planting_date date,
  location text,
  health text NOT NULL DEFAULT 'good'
    CHECK (health IN ('excellent', 'good', 'fair', 'poor')),
  notes text,
  soil_type text,
  spacing integer,
  irrigation text,
  fertilizer text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sapling_items_batch_id
  ON public.sapling_items(batch_id);

ALTER TABLE public.sapling_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view sapling items from their batches" ON public.sapling_items;
CREATE POLICY "Users can view sapling items from their batches"
  ON public.sapling_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.sapling_batches sb
      JOIN public.gardens g ON g.id = sb.garden_id
      WHERE sb.id = sapling_items.batch_id
        AND g.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert sapling items to their batches" ON public.sapling_items;
CREATE POLICY "Users can insert sapling items to their batches"
  ON public.sapling_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.sapling_batches sb
      JOIN public.gardens g ON g.id = sb.garden_id
      WHERE sb.id = sapling_items.batch_id
        AND g.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update sapling items from their batches" ON public.sapling_items;
CREATE POLICY "Users can update sapling items from their batches"
  ON public.sapling_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.sapling_batches sb
      JOIN public.gardens g ON g.id = sb.garden_id
      WHERE sb.id = sapling_items.batch_id
        AND g.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.sapling_batches sb
      JOIN public.gardens g ON g.id = sb.garden_id
      WHERE sb.id = sapling_items.batch_id
        AND g.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete sapling items from their batches" ON public.sapling_items;
CREATE POLICY "Users can delete sapling items from their batches"
  ON public.sapling_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.sapling_batches sb
      JOIN public.gardens g ON g.id = sb.garden_id
      WHERE sb.id = sapling_items.batch_id
        AND g.user_id = auth.uid()
    )
  );

INSERT INTO public.sapling_items (
  batch_id,
  status,
  planting_date,
  location,
  health
)
SELECT
  sb.id,
  CASE
    WHEN sb.phase = 'Planted' THEN 'planted'
    WHEN sb.phase = 'ReadyToOrchard' THEN 'ready_to_plant'
    ELSE 'nursery'
  END,
  sb.planting_date,
  sb.location,
  'good'
FROM public.sapling_batches sb
CROSS JOIN LATERAL generate_series(1, sb.total_quantity)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.sapling_items si
  WHERE si.batch_id = sb.id
);

CREATE TABLE IF NOT EXISTS public.sapling_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sapling_id uuid NOT NULL REFERENCES public.sapling_items(id) ON DELETE CASCADE,
  date timestamptz NOT NULL DEFAULT now(),
  event text NOT NULL,
  description text,
  photos text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sapling_timeline_sapling_id
  ON public.sapling_timeline(sapling_id);

ALTER TABLE public.sapling_timeline ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their sapling timeline" ON public.sapling_timeline;
CREATE POLICY "Users can view their sapling timeline"
  ON public.sapling_timeline
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.sapling_items si
      JOIN public.sapling_batches sb ON sb.id = si.batch_id
      JOIN public.gardens g ON g.id = sb.garden_id
      WHERE si.id = sapling_timeline.sapling_id
        AND g.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can add to their sapling timeline" ON public.sapling_timeline;
CREATE POLICY "Users can add to their sapling timeline"
  ON public.sapling_timeline
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.sapling_items si
      JOIN public.sapling_batches sb ON sb.id = si.batch_id
      JOIN public.gardens g ON g.id = sb.garden_id
      WHERE si.id = sapling_timeline.sapling_id
        AND g.user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.create_sapling_batch_with_items(
  p_plant_name text,
  p_variety text,
  p_source text,
  p_total_quantity integer,
  p_purchase_date date,
  p_supplier text,
  p_rootstock_type text,
  p_price_per_unit numeric,
  p_total_cost numeric,
  p_notes text,
  p_garden_id uuid,
  p_sapling_type text,
  p_initial_status text DEFAULT 'nursery',
  p_planting_date date DEFAULT NULL,
  p_location text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_batch_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication_required';
  END IF;

  IF p_total_quantity IS NULL OR p_total_quantity <= 0 THEN
    RAISE EXCEPTION 'invalid_total_quantity';
  END IF;

  IF p_initial_status NOT IN ('nursery', 'ready_to_plant', 'planted') THEN
    RAISE EXCEPTION 'invalid_sapling_status';
  END IF;

  IF p_sapling_type NOT IN ('FruitTree', 'Olive', 'Vine') THEN
    RAISE EXCEPTION 'invalid_sapling_type';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.gardens g
    WHERE g.id = p_garden_id
      AND g.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'garden_not_accessible';
  END IF;

  INSERT INTO public.sapling_batches (
    plant_name,
    variety,
    sapling_type,
    source,
    total_quantity,
    remaining_quantity,
    quantity,
    initial_quantity,
    current_quantity,
    purchase_date,
    planting_date,
    location,
    phase,
    supplier,
    rootstock_type,
    rootstock,
    price_per_unit,
    total_cost,
    notes,
    garden_id
  )
  VALUES (
    p_plant_name,
    p_variety,
    p_sapling_type,
    p_source,
    p_total_quantity,
    CASE WHEN p_initial_status = 'planted' THEN 0 ELSE p_total_quantity END,
    p_total_quantity,
    p_total_quantity,
    CASE WHEN p_initial_status = 'planted' THEN 0 ELSE p_total_quantity END,
    p_purchase_date,
    CASE WHEN p_initial_status = 'planted' THEN COALESCE(p_planting_date, p_purchase_date) ELSE NULL END,
    CASE WHEN p_initial_status = 'planted' THEN p_location ELSE NULL END,
    CASE
      WHEN p_initial_status = 'planted' THEN 'Planted'
      WHEN p_initial_status = 'ready_to_plant' THEN 'ReadyToOrchard'
      ELSE 'Purchased'
    END,
    p_supplier,
    p_rootstock_type,
    p_rootstock_type,
    p_price_per_unit,
    p_total_cost,
    p_notes,
    p_garden_id
  )
  RETURNING id INTO v_batch_id;

  INSERT INTO public.sapling_items (
    batch_id,
    status,
    planting_date,
    location,
    health
  )
  SELECT
    v_batch_id,
    p_initial_status,
    CASE WHEN p_initial_status = 'planted' THEN COALESCE(p_planting_date, p_purchase_date) ELSE NULL END,
    CASE WHEN p_initial_status = 'planted' THEN p_location ELSE NULL END,
    'good'
  FROM generate_series(1, p_total_quantity);

  RETURN v_batch_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_sapling_item_planting(
  p_sapling_item_id uuid,
  p_planting_date date,
  p_location text,
  p_notes text,
  p_garden_id uuid,
  p_soil_type text DEFAULT NULL,
  p_spacing integer DEFAULT NULL,
  p_irrigation text DEFAULT NULL,
  p_fertilizer text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_batch_id uuid;
  v_remaining integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication_required';
  END IF;

  SELECT si.batch_id
  INTO v_batch_id
  FROM public.sapling_items si
  JOIN public.sapling_batches sb ON sb.id = si.batch_id
  JOIN public.gardens g ON g.id = sb.garden_id
  WHERE si.id = p_sapling_item_id
    AND sb.garden_id = p_garden_id
    AND g.user_id = auth.uid();

  IF v_batch_id IS NULL THEN
    RAISE EXCEPTION 'sapling_item_not_accessible';
  END IF;

  UPDATE public.sapling_items
  SET status = 'planted',
      planting_date = p_planting_date,
      location = p_location,
      soil_type = p_soil_type,
      spacing = p_spacing,
      irrigation = p_irrigation,
      fertilizer = p_fertilizer,
      notes = COALESCE(p_notes, notes),
      updated_at = now()
  WHERE id = p_sapling_item_id;

  SELECT count(*)::integer
  INTO v_remaining
  FROM public.sapling_items si
  WHERE si.batch_id = v_batch_id
    AND si.status IN ('nursery', 'ready_to_plant');

  UPDATE public.sapling_batches sb
  SET remaining_quantity = v_remaining,
      current_quantity = v_remaining,
      phase = CASE WHEN v_remaining = 0 THEN 'Planted' ELSE 'Establishing' END,
      planting_date = COALESCE(planting_date, p_planting_date),
      location = COALESCE(location, p_location),
      updated_at = now()
  WHERE sb.id = v_batch_id;

  RETURN jsonb_build_object(
    'planting_id', p_sapling_item_id,
    'sapling_id', p_sapling_item_id,
    'planting_date', p_planting_date,
    'location', p_location,
    'garden_id', p_garden_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.set_sapling_batch_status(
  p_batch_id uuid,
  p_status text,
  p_planting_date date DEFAULT NULL,
  p_location text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication_required';
  END IF;

  IF p_status NOT IN ('nursery', 'ready_to_plant', 'planted') THEN
    RAISE EXCEPTION 'invalid_sapling_status';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.sapling_batches sb
    JOIN public.gardens g ON g.id = sb.garden_id
    WHERE sb.id = p_batch_id
      AND g.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'sapling_batch_not_accessible';
  END IF;

  UPDATE public.sapling_items
  SET status = p_status,
      planting_date = CASE
        WHEN p_status = 'planted' THEN COALESCE(p_planting_date, planting_date)
        ELSE NULL
      END,
      location = CASE
        WHEN p_status = 'planted' THEN COALESCE(p_location, location)
        ELSE NULL
      END,
      updated_at = now()
  WHERE batch_id = p_batch_id
    AND status <> 'dead';

  UPDATE public.sapling_batches
  SET remaining_quantity = CASE WHEN p_status = 'planted' THEN 0 ELSE total_quantity END,
      current_quantity = CASE WHEN p_status = 'planted' THEN 0 ELSE total_quantity END,
      phase = CASE
        WHEN p_status = 'planted' THEN 'Planted'
        WHEN p_status = 'ready_to_plant' THEN 'ReadyToOrchard'
        ELSE 'Purchased'
      END,
      planting_date = CASE WHEN p_status = 'planted' THEN p_planting_date ELSE NULL END,
      location = CASE WHEN p_status = 'planted' THEN p_location ELSE location END,
      updated_at = now()
  WHERE id = p_batch_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.resize_sapling_batch(
  p_batch_id uuid,
  p_total_quantity integer
)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_current_total integer;
  v_removable integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication_required';
  END IF;

  IF p_total_quantity IS NULL OR p_total_quantity <= 0 THEN
    RAISE EXCEPTION 'invalid_total_quantity';
  END IF;

  SELECT sb.total_quantity
  INTO v_current_total
  FROM public.sapling_batches sb
  JOIN public.gardens g ON g.id = sb.garden_id
  WHERE sb.id = p_batch_id
    AND g.user_id = auth.uid()
  FOR UPDATE OF sb;

  IF v_current_total IS NULL THEN
    RAISE EXCEPTION 'sapling_batch_not_accessible';
  END IF;

  IF p_total_quantity > v_current_total THEN
    INSERT INTO public.sapling_items (batch_id, status, health)
    SELECT p_batch_id, 'nursery', 'good'
    FROM generate_series(1, p_total_quantity - v_current_total);
  ELSIF p_total_quantity < v_current_total THEN
    SELECT count(*)::integer
    INTO v_removable
    FROM public.sapling_items
    WHERE batch_id = p_batch_id
      AND status = 'nursery';

    IF v_removable < v_current_total - p_total_quantity THEN
      RAISE EXCEPTION 'cannot_remove_non_nursery_saplings';
    END IF;

    WITH removable AS (
      SELECT id
      FROM public.sapling_items
      WHERE batch_id = p_batch_id
        AND status = 'nursery'
      ORDER BY created_at DESC, id
      LIMIT (v_current_total - p_total_quantity)
    )
    DELETE FROM public.sapling_items si
    USING removable r
    WHERE si.id = r.id;
  END IF;

  UPDATE public.sapling_batches
  SET total_quantity = p_total_quantity,
      quantity = p_total_quantity,
      initial_quantity = p_total_quantity,
      remaining_quantity = (
        SELECT count(*)::integer
        FROM public.sapling_items
        WHERE batch_id = p_batch_id
          AND status IN ('nursery', 'ready_to_plant')
      ),
      current_quantity = (
        SELECT count(*)::integer
        FROM public.sapling_items
        WHERE batch_id = p_batch_id
          AND status IN ('nursery', 'ready_to_plant')
      ),
      updated_at = now()
  WHERE id = p_batch_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_sapling_batch_with_items(
  text, text, text, integer, date, text, text, numeric, numeric, text, uuid, text, text, date, text
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_sapling_batch_with_items(
  text, text, text, integer, date, text, text, numeric, numeric, text, uuid, text, text, date, text
) TO authenticated;

REVOKE ALL ON FUNCTION public.record_sapling_item_planting(
  uuid, date, text, text, uuid, text, integer, text, text
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_sapling_item_planting(
  uuid, date, text, text, uuid, text, integer, text, text
) TO authenticated;

REVOKE ALL ON FUNCTION public.set_sapling_batch_status(
  uuid, text, date, text
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_sapling_batch_status(
  uuid, text, date, text
) TO authenticated;

REVOKE ALL ON FUNCTION public.resize_sapling_batch(uuid, integer)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.resize_sapling_batch(uuid, integer)
  TO authenticated;
