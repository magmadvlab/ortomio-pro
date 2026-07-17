INSERT INTO auth.users VALUES
  ('00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002');
INSERT INTO public.gardens VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002');
INSERT INTO public.organizations VALUES ('60000000-0000-0000-0000-000000000001');
INSERT INTO public.garden_assignments (organization_id, garden_id) VALUES (
  '60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'
);
INSERT INTO public.irrigation_zones VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001');
INSERT INTO public.smart_devices (id, garden_id, external_device_id) VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'tb-1'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'tb-2');

INSERT INTO public.smart_device_commands (
  user_id, garden_id, organization_id, zone_id, device_id, provider, idempotency_key, desired_valve_state
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '60000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  'thingsboard', 'sql-idempotency-001', true
);

DO $$ BEGIN
  BEGIN
    INSERT INTO public.smart_device_commands (
      user_id, garden_id, device_id, provider, idempotency_key, desired_valve_state
    ) VALUES (
      '00000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000001',
      '30000000-0000-0000-0000-000000000001',
      'thingsboard', 'sql-idempotency-001', true
    );
    RAISE EXCEPTION 'duplicate command was accepted';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
END $$;

SET ROLE authenticated;
SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
INSERT INTO public.smart_device_commands (
  user_id, garden_id, device_id, provider, idempotency_key, desired_valve_state
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  'thingsboard', 'rls-owned-command-001', false
);
DO $$ BEGIN
  BEGIN
    INSERT INTO public.smart_device_commands (
      user_id, garden_id, device_id, provider, idempotency_key, desired_valve_state
    ) VALUES (
      '00000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000002',
      '30000000-0000-0000-0000-000000000002',
      'thingsboard', 'rls-foreign-command-001', true
    );
    RAISE EXCEPTION 'foreign garden command was accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;
RESET ROLE;

DO $$ BEGIN
  BEGIN
    INSERT INTO public.irrigation_logs (zone_id, planned_volume_liters, actual_volume_liters)
    VALUES ('20000000-0000-0000-0000-000000000001', 100, 87);
    RAISE EXCEPTION 'measured volume without evidence was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END $$;
INSERT INTO public.irrigation_logs (
  zone_id, planned_volume_liters, actual_volume_liters, volume_source, measurement_recorded_at, lifecycle_status
) VALUES (
  '20000000-0000-0000-0000-000000000001', 100, 87, 'meter', now(), 'measured'
);

INSERT INTO public.nutrition_treatments (
  id, garden_id, product_id, dosage, dosage_unit, status
) VALUES (
  '40000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000001', 5, 'kg', 'planned'
);
INSERT INTO public.product_inventory (
  product_id, product_name, product_type, garden_id, current_stock, stock_unit
) VALUES (
  '50000000-0000-0000-0000-000000000001', 'Concime test', 'fertilizer',
  '10000000-0000-0000-0000-000000000001', 25, 'kg'
);

SELECT public.complete_nutrition_treatment(
  '40000000-0000-0000-0000-000000000001', 5, 'kg'
);
SELECT public.complete_nutrition_treatment(
  '40000000-0000-0000-0000-000000000001', 5, 'kg'
);

DO $$
DECLARE v_stock numeric; v_status text;
BEGIN
  SELECT current_stock INTO v_stock FROM public.product_inventory
  WHERE product_id = '50000000-0000-0000-0000-000000000001';
  SELECT status INTO v_status FROM public.nutrition_treatments
  WHERE id = '40000000-0000-0000-0000-000000000001';
  IF v_stock <> 20 OR v_status <> 'completed' THEN
    RAISE EXCEPTION 'atomic completion assertion failed: stock %, status %', v_stock, v_status;
  END IF;
END $$;

SELECT 'P4 SQL assertions passed' AS result;
