BEGIN;
-- The observed production table still has api_key/configuration, not the newer UI columns.
ALTER TABLE public.api_configurations
  ADD COLUMN IF NOT EXISTS provider_name text,
  ADD COLUMN IF NOT EXISTS api_key_encrypted text,
  ADD COLUMN IF NOT EXISTS api_secret_encrypted text,
  ADD COLUMN IF NOT EXISTS config jsonb,
  ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false;
UPDATE public.api_configurations SET provider_name=coalesce(provider_name,service_name), config=coalesce(config,configuration,'{}'::jsonb);
-- Client-side access would bypass the server encryption/proxy boundary.
REVOKE ALL ON TABLE public.api_configurations FROM anon, authenticated;
GRANT ALL ON TABLE public.api_configurations TO service_role;
-- Retired client-side store embedded its own decryption key in key_value.
-- Preserve records for reviewed migration; never expose them to browser clients.
REVOKE ALL ON TABLE public.api_keys FROM anon, authenticated;
GRANT ALL ON TABLE public.api_keys TO service_role;
CREATE OR REPLACE FUNCTION public.save_api_configuration(p_id uuid, p_user_id uuid, p_service_name text, p_provider_name text, p_encrypted_key text, p_config jsonb, p_is_active boolean, p_is_default boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE saved public.api_configurations;
BEGIN
  -- Serialize default changes within one owner; route authenticates and supplies this owner.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
  IF p_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.api_configurations WHERE id=p_id AND user_id=p_user_id) THEN RAISE EXCEPTION 'configuration_not_found'; END IF;
  IF p_is_default THEN UPDATE public.api_configurations SET is_default=false WHERE user_id=p_user_id AND service_name=p_service_name; END IF;
  IF p_id IS NULL THEN
    INSERT INTO public.api_configurations(user_id,service_name,provider_name,api_key_encrypted,config,is_active,is_default)
    VALUES(p_user_id,p_service_name,p_provider_name,p_encrypted_key,p_config,p_is_active,p_is_default) RETURNING * INTO saved;
  ELSE
    UPDATE public.api_configurations SET service_name=p_service_name,provider_name=p_provider_name,api_key_encrypted=p_encrypted_key,config=p_config,is_active=p_is_active,is_default=p_is_default,updated_at=now()
    WHERE id=p_id AND user_id=p_user_id RETURNING * INTO saved;
  END IF;
  RETURN to_jsonb(saved);
END $$;
REVOKE ALL ON FUNCTION public.save_api_configuration(uuid,uuid,text,text,text,jsonb,boolean,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.save_api_configuration(uuid,uuid,text,text,text,jsonb,boolean,boolean) TO service_role;
-- Service-only atomic transfer and archive of the retired browser credential store.
CREATE OR REPLACE FUNCTION public.migrate_legacy_api_key(
  p_id uuid, p_user_id uuid, p_original_key text, p_original_config jsonb,
  p_archive text, p_service_name text, p_encrypted_key text, p_config jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE original public.api_keys; existing_id uuid; transferred boolean := false;
BEGIN
  SELECT * INTO original FROM public.api_keys WHERE id=p_id AND user_id=p_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'legacy_key_not_found'; END IF;
  IF original.key_value IS DISTINCT FROM p_original_key OR original.config IS DISTINCT FROM p_original_config THEN RAISE EXCEPTION 'legacy_key_changed'; END IF;
  IF p_archive IS NULL OR p_encrypted_key IS NULL OR p_archive NOT LIKE 'v1.%' OR p_encrypted_key NOT LIKE 'v1.%' THEN RAISE EXCEPTION 'encrypted_value_required'; END IF;
  IF p_service_name IS NOT NULL THEN
    IF original.organization_id IS NOT NULL THEN RAISE EXCEPTION 'organization_scope_must_be_preserved'; END IF;
    IF p_service_name IS DISTINCT FROM (CASE original.service WHEN 'OpenAI' THEN 'ai_openai' WHEN 'Anthropic' THEN 'ai_anthropic' WHEN 'GoogleAI' THEN 'ai_gemini' WHEN 'WeatherAPI' THEN 'weather_weatherapi' END) THEN RAISE EXCEPTION 'legacy_service_mismatch'; END IF;
    PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
    SELECT id INTO existing_id FROM public.api_configurations WHERE user_id=p_user_id AND service_name=p_service_name;
    IF existing_id IS NULL THEN
      INSERT INTO public.api_configurations(id,user_id,service_name,provider_name,api_key_encrypted,config,is_active,is_default)
      VALUES(original.id,p_user_id,p_service_name,original.name,p_encrypted_key,p_config,original.is_active,false);
      transferred := true;
    ELSIF existing_id=original.id THEN
      transferred := true;
    END IF;
  END IF;
  -- Original configuration, including any secret fields, is retained inside the encrypted archive.
  UPDATE public.api_keys SET key_value=p_archive,config='{}'::jsonb,updated_at=now() WHERE id=p_id;
  RETURN jsonb_build_object('transferred',transferred,'archived',true);
END $$;
REVOKE ALL ON FUNCTION public.migrate_legacy_api_key(uuid,uuid,text,jsonb,text,text,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.migrate_legacy_api_key(uuid,uuid,text,jsonb,text,text,text,jsonb) TO service_role;
COMMIT;
