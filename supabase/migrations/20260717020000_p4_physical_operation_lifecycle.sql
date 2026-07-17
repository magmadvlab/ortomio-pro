-- P4: lifecycle affidabile per comandi fisici, irrigazione misurata e nutrizione eseguita.

ALTER TABLE public.smart_devices
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.smart_device_commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id uuid NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  zone_id text,
  device_id uuid NOT NULL REFERENCES public.smart_devices(id) ON DELETE CASCADE,
  provider text NOT NULL,
  idempotency_key text NOT NULL CHECK (char_length(idempotency_key) BETWEEN 8 AND 128),
  desired_valve_state boolean NOT NULL,
  observed_valve_state boolean,
  status text NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'sent', 'acknowledged', 'failed', 'timed_out', 'dead_letter')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  max_attempts integer NOT NULL DEFAULT 3 CHECK (max_attempts BETWEEN 1 AND 10),
  requested_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  timeout_at timestamptz,
  acknowledged_at timestamptz,
  failed_at timestamptz,
  dead_letter_at timestamptz,
  last_error text,
  dispatch_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  provider_response jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (device_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_smart_device_commands_retry
  ON public.smart_device_commands (status, timeout_at)
  WHERE status IN ('requested', 'sent', 'failed', 'timed_out');
CREATE INDEX IF NOT EXISTS idx_smart_device_commands_device_requested
  ON public.smart_device_commands (device_id, requested_at DESC);

CREATE OR REPLACE FUNCTION public.p4_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_smart_device_commands_updated_at ON public.smart_device_commands;
CREATE TRIGGER trg_smart_device_commands_updated_at
BEFORE UPDATE ON public.smart_device_commands
FOR EACH ROW EXECUTE FUNCTION public.p4_touch_updated_at();

ALTER TABLE public.smart_device_commands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS smart_device_commands_owner_select ON public.smart_device_commands;
CREATE POLICY smart_device_commands_owner_select ON public.smart_device_commands
FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS smart_device_commands_owner_insert ON public.smart_device_commands;
CREATE POLICY smart_device_commands_owner_insert ON public.smart_device_commands
FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.gardens g
    WHERE g.id = garden_id AND g.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.smart_devices d
    WHERE d.id = device_id AND d.garden_id = garden_id
  )
  AND (
    organization_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.garden_assignments ga
      WHERE ga.organization_id = smart_device_commands.organization_id
        AND ga.garden_id = smart_device_commands.garden_id
    )
  )
);
DROP POLICY IF EXISTS smart_device_commands_owner_update ON public.smart_device_commands;
CREATE POLICY smart_device_commands_owner_update ON public.smart_device_commands
FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
GRANT SELECT, INSERT, UPDATE ON public.smart_device_commands TO authenticated;

ALTER TABLE public.irrigation_logs
  ADD COLUMN IF NOT EXISTS lifecycle_status text NOT NULL DEFAULT 'planned'
    CHECK (lifecycle_status IN ('need', 'planned', 'commanded', 'executing', 'measured', 'failed', 'cancelled')),
  ADD COLUMN IF NOT EXISTS command_id uuid REFERENCES public.smart_device_commands(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS volume_source text NOT NULL DEFAULT 'estimated_no_sensor'
    CHECK (volume_source IN ('sensor', 'meter', 'operator', 'estimated_no_sensor')),
  ADD COLUMN IF NOT EXISTS measurement_recorded_at timestamptz;

-- Una misura reale richiede fonte e timestamp. Il volume pianificato resta distinto.
ALTER TABLE public.irrigation_logs DROP CONSTRAINT IF EXISTS irrigation_logs_measurement_evidence;
ALTER TABLE public.irrigation_logs ADD CONSTRAINT irrigation_logs_measurement_evidence CHECK (
  actual_volume_liters IS NULL
  OR (measurement_recorded_at IS NOT NULL AND volume_source IN ('sensor', 'meter', 'operator'))
);

CREATE OR REPLACE FUNCTION public.complete_nutrition_treatment(
  p_treatment_id uuid,
  p_quantity numeric,
  p_unit text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_inventory public.product_inventory%ROWTYPE;
  v_treatment public.nutrition_treatments%ROWTYPE;
BEGIN
  IF p_quantity <= 0 OR p_unit IS NULL OR btrim(p_unit) = '' THEN
    RAISE EXCEPTION 'invalid_nutrition_quantity_or_unit';
  END IF;

  SELECT * INTO v_treatment FROM public.nutrition_treatments
  WHERE id = p_treatment_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'nutrition_treatment_not_found'; END IF;
  IF v_treatment.status = 'completed' THEN
    RETURN jsonb_build_object('status', 'completed', 'duplicate', true);
  END IF;

  SELECT * INTO v_inventory FROM public.product_inventory
  WHERE product_id = v_treatment.product_id AND garden_id = v_treatment.garden_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'nutrition_inventory_not_found'; END IF;
  IF lower(v_inventory.stock_unit) <> lower(p_unit) THEN RAISE EXCEPTION 'nutrition_unit_mismatch'; END IF;
  IF v_inventory.current_stock < p_quantity THEN RAISE EXCEPTION 'insufficient_nutrition_stock'; END IF;

  UPDATE public.product_inventory
  SET current_stock = current_stock - p_quantity, updated_at = now()
  WHERE id = v_inventory.id;
  UPDATE public.nutrition_treatments
  SET status = 'completed', updated_at = now()
  WHERE id = p_treatment_id;

  RETURN jsonb_build_object(
    'status', 'completed',
    'duplicate', false,
    'remaining_stock', v_inventory.current_stock - p_quantity,
    'unit', p_unit
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.complete_nutrition_treatment(uuid, numeric, text) TO authenticated;

-- Compatibilità DB-first per il vecchio pannello inventario fertilizzanti.
ALTER TABLE public.fertilizer_inventory
  ADD COLUMN IF NOT EXISTS product_id text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS npk jsonb;
UPDATE public.fertilizer_inventory SET product_id = COALESCE(product_id, id::text) WHERE product_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_fertilizer_inventory_garden_product
  ON public.fertilizer_inventory (garden_id, product_id) WHERE product_id IS NOT NULL;
