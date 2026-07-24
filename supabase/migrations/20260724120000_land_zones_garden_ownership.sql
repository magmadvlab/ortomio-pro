-- M03: make land zones belong directly to an authorized garden.
ALTER TABLE public.land_zones
  ADD COLUMN IF NOT EXISTS garden_id UUID REFERENCES public.gardens(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS shape_type TEXT NOT NULL DEFAULT 'custom',
  ADD COLUMN IF NOT EXISTS length_meters NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS width_meters NUMERIC(12, 2);

UPDATE public.land_zones lz
SET garden_id = gz.garden_id
FROM public.garden_zones gz
WHERE lz.garden_id IS NULL
  AND lz.garden_zone_id = gz.id;

ALTER TABLE public.land_zones
  ALTER COLUMN garden_zone_id DROP NOT NULL,
  ALTER COLUMN garden_id SET NOT NULL,
  DROP CONSTRAINT IF EXISTS land_zones_shape_type_check,
  ADD CONSTRAINT land_zones_shape_type_check
    CHECK (shape_type IN ('rectangle', 'custom')),
  DROP CONSTRAINT IF EXISTS land_zones_dimensions_check,
  ADD CONSTRAINT land_zones_dimensions_check CHECK (
    (shape_type = 'rectangle' AND length_meters > 0 AND width_meters > 0)
    OR
    (shape_type = 'custom' AND length_meters IS NULL AND width_meters IS NULL)
  ),
  DROP CONSTRAINT IF EXISTS land_zones_area_positive_check,
  ADD CONSTRAINT land_zones_area_positive_check CHECK (area_hectares > 0);

CREATE INDEX IF NOT EXISTS idx_land_zones_garden_id
  ON public.land_zones(garden_id);

DROP POLICY IF EXISTS "Users can view their land zones" ON public.land_zones;
DROP POLICY IF EXISTS "Users can insert their land zones" ON public.land_zones;
DROP POLICY IF EXISTS "Users can update their land zones" ON public.land_zones;
DROP POLICY IF EXISTS "Users can delete their land zones" ON public.land_zones;

CREATE POLICY "Users can view their land zones"
  ON public.land_zones FOR SELECT
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.gardens g
      WHERE g.id = land_zones.garden_id AND g.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their land zones"
  ON public.land_zones FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.gardens g
      WHERE g.id = land_zones.garden_id AND g.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their land zones"
  ON public.land_zones FOR UPDATE
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.gardens g
      WHERE g.id = land_zones.garden_id AND g.user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.gardens g
      WHERE g.id = land_zones.garden_id AND g.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their land zones"
  ON public.land_zones FOR DELETE
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.gardens g
      WHERE g.id = land_zones.garden_id AND g.user_id = auth.uid()
    )
  );
