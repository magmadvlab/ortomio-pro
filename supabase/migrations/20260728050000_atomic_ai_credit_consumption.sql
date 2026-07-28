-- Atomically consume a technical AI quota and append its audit ledger entry.
-- The RPC is intentionally service-role only: user identity is derived by the
-- API route before this function is called.

ALTER TABLE public.ai_credit_transactions
  ADD COLUMN IF NOT EXISTS feature text,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE OR REPLACE FUNCTION public.consume_ai_credits(
  p_user_id uuid,
  p_amount integer,
  p_feature text,
  p_description text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_remaining integer;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'invalid_user_id' USING ERRCODE = '22023';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'invalid_credit_amount' USING ERRCODE = '22023';
  END IF;

  IF p_feature IS NULL OR btrim(p_feature) = '' OR length(p_feature) > 120 THEN
    RAISE EXCEPTION 'invalid_credit_feature' USING ERRCODE = '22023';
  END IF;

  UPDATE public.profiles
  SET ai_credits_used = COALESCE(ai_credits_used, 0) + p_amount
  WHERE id = p_user_id
    AND COALESCE(ai_credits_total, 0) - COALESCE(ai_credits_used, 0) >= p_amount
  RETURNING COALESCE(ai_credits_total, 0) - COALESCE(ai_credits_used, 0)
    INTO v_remaining;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_credits' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.ai_credit_transactions (
    user_id,
    amount,
    type,
    feature,
    description,
    metadata
  )
  VALUES (
    p_user_id,
    -p_amount,
    'usage',
    btrim(p_feature),
    NULLIF(btrim(p_description), ''),
    COALESCE(p_metadata, '{}'::jsonb)
  );

  RETURN v_remaining;
END;
$function$;

REVOKE ALL ON FUNCTION public.consume_ai_credits(uuid, integer, text, text, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_credits(uuid, integer, text, text, jsonb)
  TO service_role;

DO $block$
BEGIN
  IF to_regprocedure('public.deduct_credits(uuid,integer)') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.deduct_credits(uuid, integer) FROM PUBLIC, anon, authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.deduct_credits(uuid, integer) TO service_role';
  END IF;
END;
$block$;

COMMENT ON FUNCTION public.consume_ai_credits(uuid, integer, text, text, jsonb)
  IS 'Atomically consumes technical AI quota and writes its usage ledger; service-role only.';

NOTIFY pgrst, 'reload schema';
