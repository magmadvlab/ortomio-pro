ALTER TABLE public.field_rows
ADD COLUMN IF NOT EXISTS row_ordering text;

ALTER TABLE public.field_rows
ADD COLUMN IF NOT EXISTS plant_ordering_in_row text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'field_rows_row_ordering_check'
  ) THEN
    ALTER TABLE public.field_rows
    ADD CONSTRAINT field_rows_row_ordering_check
    CHECK (
      row_ordering IS NULL OR
      row_ordering IN ('west_to_east', 'east_to_west', 'north_to_south', 'south_to_north')
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'field_rows_plant_ordering_in_row_check'
  ) THEN
    ALTER TABLE public.field_rows
    ADD CONSTRAINT field_rows_plant_ordering_in_row_check
    CHECK (
      plant_ordering_in_row IS NULL OR
      plant_ordering_in_row IN ('west_to_east', 'east_to_west', 'north_to_south', 'south_to_north')
    );
  END IF;
END $$;
