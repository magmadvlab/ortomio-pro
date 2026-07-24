CREATE TABLE IF NOT EXISTS public.macerate_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id uuid NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  macerate_type text NOT NULL
    CHECK (macerate_type IN ('ortica', 'aglio', 'equiseto', 'tanaceto', 'consolida')),
  start_date timestamptz NOT NULL,
  materials jsonb NOT NULL DEFAULT '[]'::jsonb,
  preparation_time_days integer NOT NULL CHECK (preparation_time_days >= 0),
  quantity_produced numeric NOT NULL CHECK (quantity_produced >= 0),
  unit text NOT NULL DEFAULT 'L' CHECK (unit = 'L'),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_macerate_logs_garden_start
  ON public.macerate_logs (garden_id, start_date DESC);

ALTER TABLE public.macerate_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS macerate_logs_owner ON public.macerate_logs;
CREATE POLICY macerate_logs_owner
ON public.macerate_logs
FOR ALL
TO authenticated
USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.gardens g
    WHERE g.id = garden_id
      AND g.user_id = auth.uid()
  )
)
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.gardens g
    WHERE g.id = garden_id
      AND g.user_id = auth.uid()
  )
);
