pg_dump: executing SELECT pg_catalog.set_config('search_path', '', false);
pg_dump: last built-in OID is 16383
pg_dump: reading extensions
pg_dump: identifying extension members
pg_dump: reading schemas
pg_dump: reading user-defined tables
pg_dump: reading user-defined functions
pg_dump: reading user-defined types
pg_dump: reading procedural languages
pg_dump: reading user-defined aggregate functions
pg_dump: reading user-defined operators
pg_dump: reading user-defined access methods
pg_dump: reading user-defined operator classes
pg_dump: reading user-defined operator families
pg_dump: reading user-defined text search parsers
pg_dump: reading user-defined text search templates
pg_dump: reading user-defined text search dictionaries
pg_dump: reading user-defined text search configurations
pg_dump: reading user-defined foreign-data wrappers
pg_dump: reading user-defined foreign servers
pg_dump: reading default privileges
pg_dump: reading user-defined collations
pg_dump: reading user-defined conversions
pg_dump: reading type casts
pg_dump: reading transforms
pg_dump: reading table inheritance information
pg_dump: reading event triggers
pg_dump: finding extension tables
pg_dump: finding inheritance relationships
pg_dump: reading column info for interesting tables
pg_dump: finding table default expressions
pg_dump: finding table check constraints
pg_dump: flagging inherited columns in subtables
pg_dump: reading partitioning data
pg_dump: reading indexes
pg_dump: flagging indexes in partitioned tables
pg_dump: reading extended statistics
pg_dump: reading constraints
pg_dump: reading triggers
pg_dump: reading rewrite rules
pg_dump: reading policies
pg_dump: reading row-level security policies
pg_dump: reading publications
pg_dump: reading publication membership of tables
pg_dump: reading publication membership of schemas
pg_dump: reading subscriptions
pg_dump: reading subscription membership of tables
pg_dump: reading large objects
pg_dump: reading dependency data
pg_dump: saving encoding = UTF8
pg_dump: saving "standard_conforming_strings = on"
pg_dump: saving "search_path = "
pg_dump: dropping EVENT TRIGGER pgrst_drop_watch
pg_dump: dropping EVENT TRIGGER pgrst_ddl_watch
pg_dump: dropping EVENT TRIGGER issue_pg_net_access
pg_dump: dropping EVENT TRIGGER issue_pg_graphql_access
pg_dump: dropping EVENT TRIGGER issue_pg_cron_access
pg_dump: dropping EVENT TRIGGER issue_graphql_placeholder
pg_dump: dropping PUBLICATION supabase_realtime
pg_dump: dropping POLICY weather_cache Weather cache is publicly readable
pg_dump: dropping POLICY custom_plans Users can view their own or public custom plans
pg_dump: dropping POLICY challenge_completions Users can view their own challenge completions
pg_dump: dropping POLICY calendar_tasks Users can view their own calendar tasks
pg_dump: dropping POLICY user_badges Users can view their own badges
pg_dump: dropping POLICY garden_obstacles Users can view obstacles in their gardens
pg_dump: dropping POLICY agronomist_advice Users can view advice from their consultations
pg_dump: dropping POLICY custom_plans Users can update their own custom plans
pg_dump: dropping POLICY challenge_completions Users can update their own challenge completions
pg_dump: dropping POLICY calendar_tasks Users can update their own calendar tasks
pg_dump: dropping POLICY garden_obstacles Users can update obstacles in their gardens
pg_dump: dropping POLICY agronomist_advice Users can update advice from their consultations
pg_dump: dropping POLICY treatment_register Users can only access their own treatments
pg_dump: dropping POLICY ai_credit_transactions Users can only access their own transactions
pg_dump: dropping POLICY seed_inventory Users can only access their own seeds
pg_dump: dropping POLICY profiles Users can only access their own profile
pg_dump: dropping POLICY mechanical_work_register Users can only access their own mechanical work
pg_dump: dropping POLICY professional_analytics Users can only access their own analytics
pg_dump: dropping POLICY gardens Users can only access their gardens
pg_dump: dropping POLICY garden_tasks Users can only access tasks in their gardens
pg_dump: dropping POLICY photo_logs Users can only access photos in their gardens
pg_dump: dropping POLICY bed_planting_history Users can only access history in their beds
pg_dump: dropping POLICY harvest_logs Users can only access harvests in their gardens
pg_dump: dropping POLICY garden_beds Users can only access beds in their gardens
pg_dump: dropping POLICY garden_zone_memories Users can manage their own zone memories
pg_dump: dropping POLICY garden_tree_memories Users can manage their own tree memories
pg_dump: dropping POLICY garden_season_analyses Users can manage their own season analyses
pg_dump: dropping POLICY garden_patterns Users can manage their own patterns
pg_dump: dropping POLICY crop_learning_events Users can manage their own learning events
pg_dump: dropping POLICY custom_crops Users can manage their own custom crops
pg_dump: dropping POLICY garden_correlations Users can manage their own correlations
pg_dump: dropping POLICY agronomist_consultations Users can manage their own consultations
pg_dump: dropping POLICY agronomists Users can manage their own agronomists
pg_dump: dropping POLICY weather_cache Users can insert weather cache
pg_dump: dropping POLICY challenge_completions Users can insert their own challenge completions
pg_dump: dropping POLICY calendar_tasks Users can insert their own calendar tasks
pg_dump: dropping POLICY user_badges Users can insert their own badges
pg_dump: dropping POLICY custom_plans Users can delete their own custom plans
pg_dump: dropping POLICY calendar_tasks Users can delete their own calendar tasks
pg_dump: dropping POLICY garden_obstacles Users can delete obstacles in their gardens
pg_dump: dropping POLICY custom_plans Users can create their own custom plans
pg_dump: dropping POLICY garden_obstacles Users can create obstacles in their gardens
pg_dump: dropping POLICY seedling_batches Users can access seedling batches in their gardens
pg_dump: dropping POLICY hydroponic_readings Users can access hydroponic readings in their gardens
pg_dump: dropping POLICY aquaponic_readings Users can access aquaponic readings in their gardens
pg_dump: dropping POLICY garden_accessories Users can access accessories in their gardens
pg_dump: dropping POLICY crop_mechanical_works Crop mechanical works are publicly readable
pg_dump: dropping FK CONSTRAINT user_badges user_badges_user_id_fkey
pg_dump: dropping FK CONSTRAINT treatment_register treatment_register_user_id_fkey
pg_dump: dropping FK CONSTRAINT treatment_register treatment_register_garden_id_fkey
pg_dump: dropping FK CONSTRAINT seedling_batches seedling_batches_garden_id_fkey
pg_dump: dropping FK CONSTRAINT seed_inventory seed_inventory_user_id_fkey
pg_dump: dropping FK CONSTRAINT seed_inventory seed_inventory_garden_id_fkey
pg_dump: dropping FK CONSTRAINT profiles profiles_id_fkey
pg_dump: dropping FK CONSTRAINT professional_analytics professional_analytics_user_id_fkey
pg_dump: dropping FK CONSTRAINT professional_analytics professional_analytics_garden_id_fkey
pg_dump: dropping FK CONSTRAINT photo_logs photo_logs_task_id_fkey
pg_dump: dropping FK CONSTRAINT photo_logs photo_logs_garden_id_fkey
pg_dump: dropping FK CONSTRAINT mechanical_work_register mechanical_work_register_user_id_fkey
pg_dump: dropping FK CONSTRAINT mechanical_work_register mechanical_work_register_garden_id_fkey
pg_dump: dropping FK CONSTRAINT hydroponic_readings hydroponic_readings_garden_id_fkey
pg_dump: dropping FK CONSTRAINT harvest_logs harvest_logs_task_id_fkey
pg_dump: dropping FK CONSTRAINT harvest_logs harvest_logs_garden_id_fkey
pg_dump: dropping FK CONSTRAINT gardens gardens_user_id_fkey
pg_dump: dropping FK CONSTRAINT garden_zone_memories garden_zone_memories_garden_id_fkey
pg_dump: dropping FK CONSTRAINT garden_zone_memories garden_zone_memories_custom_crop_id_fkey
pg_dump: dropping FK CONSTRAINT garden_tree_memories garden_tree_memories_garden_id_fkey
pg_dump: dropping FK CONSTRAINT garden_tree_memories garden_tree_memories_custom_crop_id_fkey
pg_dump: dropping FK CONSTRAINT garden_tasks garden_tasks_garden_id_fkey
pg_dump: dropping FK CONSTRAINT garden_tasks garden_tasks_bed_id_fkey
pg_dump: dropping FK CONSTRAINT garden_season_analyses garden_season_analyses_garden_id_fkey
pg_dump: dropping FK CONSTRAINT garden_patterns garden_patterns_garden_id_fkey
pg_dump: dropping FK CONSTRAINT garden_patterns garden_patterns_custom_crop_id_fkey
pg_dump: dropping FK CONSTRAINT garden_obstacles garden_obstacles_garden_id_fkey
pg_dump: dropping FK CONSTRAINT garden_correlations garden_correlations_garden_id_fkey
pg_dump: dropping FK CONSTRAINT garden_correlations garden_correlations_custom_crop_id_fkey
pg_dump: dropping FK CONSTRAINT garden_beds garden_beds_structure_id_fkey
pg_dump: dropping FK CONSTRAINT garden_beds garden_beds_garden_id_fkey
pg_dump: dropping FK CONSTRAINT garden_beds garden_beds_covering_structure_id_fkey
pg_dump: dropping FK CONSTRAINT garden_accessories garden_accessories_garden_id_fkey
pg_dump: dropping FK CONSTRAINT custom_plans custom_plans_user_id_fkey
pg_dump: dropping FK CONSTRAINT custom_plans custom_plans_garden_id_fkey
pg_dump: dropping FK CONSTRAINT custom_crops custom_crops_user_id_fkey
pg_dump: dropping FK CONSTRAINT custom_crops custom_crops_garden_id_fkey
pg_dump: dropping FK CONSTRAINT crop_learning_events crop_learning_events_user_id_fkey
pg_dump: dropping FK CONSTRAINT crop_learning_events crop_learning_events_garden_id_fkey
pg_dump: dropping FK CONSTRAINT crop_learning_events crop_learning_events_custom_crop_id_fkey
pg_dump: dropping FK CONSTRAINT challenge_completions challenge_completions_user_id_fkey
pg_dump: dropping FK CONSTRAINT calendar_tasks calendar_tasks_user_id_fkey
pg_dump: dropping FK CONSTRAINT calendar_tasks calendar_tasks_garden_id_fkey
pg_dump: dropping FK CONSTRAINT bed_planting_history bed_planting_history_bed_id_fkey
pg_dump: dropping FK CONSTRAINT aquaponic_readings aquaponic_readings_garden_id_fkey
pg_dump: dropping FK CONSTRAINT ai_credit_transactions ai_credit_transactions_user_id_fkey
pg_dump: dropping FK CONSTRAINT agronomists agronomists_user_id_fkey
pg_dump: dropping FK CONSTRAINT agronomist_consultations agronomist_consultations_user_id_fkey
pg_dump: dropping FK CONSTRAINT agronomist_consultations agronomist_consultations_task_id_fkey
pg_dump: dropping FK CONSTRAINT agronomist_consultations agronomist_consultations_garden_id_fkey
pg_dump: dropping FK CONSTRAINT agronomist_consultations agronomist_consultations_agronomist_id_fkey
pg_dump: dropping FK CONSTRAINT agronomist_advice agronomist_advice_task_id_fkey
pg_dump: dropping FK CONSTRAINT agronomist_advice agronomist_advice_consultation_id_fkey
pg_dump: dropping FK CONSTRAINT sso_domains sso_domains_sso_provider_id_fkey
pg_dump: dropping FK CONSTRAINT sessions sessions_user_id_fkey
pg_dump: dropping FK CONSTRAINT sessions sessions_oauth_client_id_fkey
pg_dump: dropping FK CONSTRAINT saml_relay_states saml_relay_states_sso_provider_id_fkey
pg_dump: dropping FK CONSTRAINT saml_relay_states saml_relay_states_flow_state_id_fkey
pg_dump: dropping FK CONSTRAINT saml_providers saml_providers_sso_provider_id_fkey
pg_dump: dropping FK CONSTRAINT refresh_tokens refresh_tokens_session_id_fkey
pg_dump: dropping FK CONSTRAINT one_time_tokens one_time_tokens_user_id_fkey
pg_dump: dropping FK CONSTRAINT oauth_consents oauth_consents_user_id_fkey
pg_dump: dropping FK CONSTRAINT oauth_consents oauth_consents_client_id_fkey
pg_dump: dropping FK CONSTRAINT oauth_authorizations oauth_authorizations_user_id_fkey
pg_dump: dropping FK CONSTRAINT oauth_authorizations oauth_authorizations_client_id_fkey
pg_dump: dropping FK CONSTRAINT mfa_factors mfa_factors_user_id_fkey
pg_dump: dropping FK CONSTRAINT mfa_challenges mfa_challenges_auth_factor_id_fkey
pg_dump: dropping FK CONSTRAINT mfa_amr_claims mfa_amr_claims_session_id_fkey
pg_dump: dropping FK CONSTRAINT identities identities_user_id_fkey
pg_dump: dropping FK CONSTRAINT extensions extensions_tenant_external_id_fkey
pg_dump: dropping TRIGGER subscription tr_check_filters
pg_dump: dropping TRIGGER seedling_batches update_seedling_batches_updated_at
pg_dump: dropping TRIGGER seed_inventory update_seed_inventory_updated_at
pg_dump: dropping TRIGGER gardens update_gardens_updated_at
pg_dump: dropping TRIGGER garden_tasks update_garden_tasks_updated_at
pg_dump: dropping TRIGGER garden_obstacles update_garden_obstacles_updated_at
pg_dump: dropping TRIGGER garden_beds update_garden_beds_updated_at
pg_dump: dropping TRIGGER custom_plans update_custom_plans_updated_at
pg_dump: dropping TRIGGER custom_crops update_custom_crops_updated_at
pg_dump: dropping TRIGGER custom_crops update_custom_crops_timestamp
pg_dump: dropping TRIGGER calendar_tasks update_calendar_tasks_updated_at
pg_dump: dropping TRIGGER agronomists update_agronomists_updated_at
pg_dump: dropping TRIGGER users on_user_created_credits
pg_dump: dropping INDEX supabase_functions_hooks_request_id_idx
pg_dump: dropping INDEX supabase_functions_hooks_h_table_id_h_name_idx
pg_dump: dropping INDEX subscription_subscription_id_entity_filters_key
pg_dump: dropping INDEX messages_2025_12_20_inserted_at_topic_idx
pg_dump: dropping INDEX messages_2025_12_19_inserted_at_topic_idx
pg_dump: dropping INDEX messages_2025_12_18_inserted_at_topic_idx
pg_dump: dropping INDEX messages_2025_12_17_inserted_at_topic_idx
pg_dump: dropping INDEX messages_2025_12_16_inserted_at_topic_idx
pg_dump: dropping INDEX messages_2025_12_15_inserted_at_topic_idx
pg_dump: dropping INDEX messages_2025_12_14_inserted_at_topic_idx
pg_dump: dropping INDEX messages_inserted_at_topic_index
pg_dump: dropping INDEX ix_realtime_subscription_entity
pg_dump: dropping INDEX idx_zone_memories_garden_id
pg_dump: dropping INDEX idx_zone_memories_custom_crop_id
pg_dump: dropping INDEX idx_weather_cache_lat_lng_date
pg_dump: dropping INDEX idx_weather_cache_cached_at
pg_dump: dropping INDEX idx_user_badges_user
pg_dump: dropping INDEX idx_user_badges_earned
pg_dump: dropping INDEX idx_tree_memories_garden_id
pg_dump: dropping INDEX idx_tree_memories_custom_crop_id
pg_dump: dropping INDEX idx_treatment_register_user
pg_dump: dropping INDEX idx_treatment_register_garden
pg_dump: dropping INDEX idx_treatment_register_date
pg_dump: dropping INDEX idx_treatment_register_crop
pg_dump: dropping INDEX idx_seedling_batches_sowing_date
pg_dump: dropping INDEX idx_seedling_batches_phase
pg_dump: dropping INDEX idx_seedling_batches_garden_id
pg_dump: dropping INDEX idx_seed_inventory_user_id
pg_dump: dropping INDEX idx_seed_inventory_garden_id
pg_dump: dropping INDEX idx_seed_inventory_expiry_year
pg_dump: dropping INDEX idx_season_analyses_garden_id
pg_dump: dropping INDEX idx_professional_analytics_year
pg_dump: dropping INDEX idx_professional_analytics_user
pg_dump: dropping INDEX idx_professional_analytics_garden
pg_dump: dropping INDEX idx_professional_analytics_crop
pg_dump: dropping INDEX idx_photo_logs_task_id
pg_dump: dropping INDEX idx_photo_logs_photo_date
pg_dump: dropping INDEX idx_photo_logs_garden_id
pg_dump: dropping INDEX idx_patterns_garden_id
pg_dump: dropping INDEX idx_patterns_custom_crop_id
pg_dump: dropping INDEX idx_mechanical_work_user
pg_dump: dropping INDEX idx_mechanical_work_type
pg_dump: dropping INDEX idx_mechanical_work_garden
pg_dump: dropping INDEX idx_mechanical_work_date
pg_dump: dropping INDEX idx_learning_events_user_id
pg_dump: dropping INDEX idx_learning_events_type
--
-- PostgreSQL database dump
--

\restrict C5UihbcZadNpPzzbzw3rlWoInsrc6hsbjUULF07LL2bfRmgsn643giIMDu1WXWH

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.0

-- Started on 2025-12-17 20:44:15 CET

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP EVENT TRIGGER IF EXISTS pgrst_drop_watch;
DROP EVENT TRIGGER IF EXISTS pgrst_ddl_watch;
DROP EVENT TRIGGER IF EXISTS issue_pg_net_access;
DROP EVENT TRIGGER IF EXISTS issue_pg_graphql_access;
DROP EVENT TRIGGER IF EXISTS issue_pg_cron_access;
DROP EVENT TRIGGER IF EXISTS issue_graphql_placeholder;
DROP PUBLICATION IF EXISTS supabase_realtime;
DROP POLICY IF EXISTS "Weather cache is publicly readable" ON public.weather_cache;
DROP POLICY IF EXISTS "Users can view their own or public custom plans" ON public.custom_plans;
DROP POLICY IF EXISTS "Users can view their own challenge completions" ON public.challenge_completions;
DROP POLICY IF EXISTS "Users can view their own calendar tasks" ON public.calendar_tasks;
DROP POLICY IF EXISTS "Users can view their own badges" ON public.user_badges;
DROP POLICY IF EXISTS "Users can view obstacles in their gardens" ON public.garden_obstacles;
DROP POLICY IF EXISTS "Users can view advice from their consultations" ON public.agronomist_advice;
DROP POLICY IF EXISTS "Users can update their own custom plans" ON public.custom_plans;
DROP POLICY IF EXISTS "Users can update their own challenge completions" ON public.challenge_completions;
DROP POLICY IF EXISTS "Users can update their own calendar tasks" ON public.calendar_tasks;
DROP POLICY IF EXISTS "Users can update obstacles in their gardens" ON public.garden_obstacles;
DROP POLICY IF EXISTS "Users can update advice from their consultations" ON public.agronomist_advice;
DROP POLICY IF EXISTS "Users can only access their own treatments" ON public.treatment_register;
DROP POLICY IF EXISTS "Users can only access their own transactions" ON public.ai_credit_transactions;
DROP POLICY IF EXISTS "Users can only access their own seeds" ON public.seed_inventory;
DROP POLICY IF EXISTS "Users can only access their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can only access their own mechanical work" ON public.mechanical_work_register;
DROP POLICY IF EXISTS "Users can only access their own analytics" ON public.professional_analytics;
DROP POLICY IF EXISTS "Users can only access their gardens" ON public.gardens;
DROP POLICY IF EXISTS "Users can only access tasks in their gardens" ON public.garden_tasks;
DROP POLICY IF EXISTS "Users can only access photos in their gardens" ON public.photo_logs;
DROP POLICY IF EXISTS "Users can only access history in their beds" ON public.bed_planting_history;
DROP POLICY IF EXISTS "Users can only access harvests in their gardens" ON public.harvest_logs;
DROP POLICY IF EXISTS "Users can only access beds in their gardens" ON public.garden_beds;
DROP POLICY IF EXISTS "Users can manage their own zone memories" ON public.garden_zone_memories;
DROP POLICY IF EXISTS "Users can manage their own tree memories" ON public.garden_tree_memories;
DROP POLICY IF EXISTS "Users can manage their own season analyses" ON public.garden_season_analyses;
DROP POLICY IF EXISTS "Users can manage their own patterns" ON public.garden_patterns;
DROP POLICY IF EXISTS "Users can manage their own learning events" ON public.crop_learning_events;
DROP POLICY IF EXISTS "Users can manage their own custom crops" ON public.custom_crops;
DROP POLICY IF EXISTS "Users can manage their own correlations" ON public.garden_correlations;
DROP POLICY IF EXISTS "Users can manage their own consultations" ON public.agronomist_consultations;
DROP POLICY IF EXISTS "Users can manage their own agronomists" ON public.agronomists;
DROP POLICY IF EXISTS "Users can insert weather cache" ON public.weather_cache;
DROP POLICY IF EXISTS "Users can insert their own challenge completions" ON public.challenge_completions;
DROP POLICY IF EXISTS "Users can insert their own calendar tasks" ON public.calendar_tasks;
DROP POLICY IF EXISTS "Users can insert their own badges" ON public.user_badges;
DROP POLICY IF EXISTS "Users can delete their own custom plans" ON public.custom_plans;
DROP POLICY IF EXISTS "Users can delete their own calendar tasks" ON public.calendar_tasks;
DROP POLICY IF EXISTS "Users can delete obstacles in their gardens" ON public.garden_obstacles;
DROP POLICY IF EXISTS "Users can create their own custom plans" ON public.custom_plans;
DROP POLICY IF EXISTS "Users can create obstacles in their gardens" ON public.garden_obstacles;
DROP POLICY IF EXISTS "Users can access seedling batches in their gardens" ON public.seedling_batches;
DROP POLICY IF EXISTS "Users can access hydroponic readings in their gardens" ON public.hydroponic_readings;
DROP POLICY IF EXISTS "Users can access aquaponic readings in their gardens" ON public.aquaponic_readings;
DROP POLICY IF EXISTS "Users can access accessories in their gardens" ON public.garden_accessories;
DROP POLICY IF EXISTS "Crop mechanical works are publicly readable" ON public.crop_mechanical_works;
ALTER TABLE IF EXISTS ONLY public.user_badges DROP CONSTRAINT IF EXISTS user_badges_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.treatment_register DROP CONSTRAINT IF EXISTS treatment_register_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.treatment_register DROP CONSTRAINT IF EXISTS treatment_register_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.seedling_batches DROP CONSTRAINT IF EXISTS seedling_batches_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.seed_inventory DROP CONSTRAINT IF EXISTS seed_inventory_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.seed_inventory DROP CONSTRAINT IF EXISTS seed_inventory_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE IF EXISTS ONLY public.professional_analytics DROP CONSTRAINT IF EXISTS professional_analytics_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.professional_analytics DROP CONSTRAINT IF EXISTS professional_analytics_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.photo_logs DROP CONSTRAINT IF EXISTS photo_logs_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.photo_logs DROP CONSTRAINT IF EXISTS photo_logs_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.mechanical_work_register DROP CONSTRAINT IF EXISTS mechanical_work_register_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.mechanical_work_register DROP CONSTRAINT IF EXISTS mechanical_work_register_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.hydroponic_readings DROP CONSTRAINT IF EXISTS hydroponic_readings_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.harvest_logs DROP CONSTRAINT IF EXISTS harvest_logs_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.harvest_logs DROP CONSTRAINT IF EXISTS harvest_logs_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.gardens DROP CONSTRAINT IF EXISTS gardens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_zone_memories DROP CONSTRAINT IF EXISTS garden_zone_memories_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_zone_memories DROP CONSTRAINT IF EXISTS garden_zone_memories_custom_crop_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_tree_memories DROP CONSTRAINT IF EXISTS garden_tree_memories_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_tree_memories DROP CONSTRAINT IF EXISTS garden_tree_memories_custom_crop_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_tasks DROP CONSTRAINT IF EXISTS garden_tasks_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_tasks DROP CONSTRAINT IF EXISTS garden_tasks_bed_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_season_analyses DROP CONSTRAINT IF EXISTS garden_season_analyses_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_patterns DROP CONSTRAINT IF EXISTS garden_patterns_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_patterns DROP CONSTRAINT IF EXISTS garden_patterns_custom_crop_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_obstacles DROP CONSTRAINT IF EXISTS garden_obstacles_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_correlations DROP CONSTRAINT IF EXISTS garden_correlations_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_correlations DROP CONSTRAINT IF EXISTS garden_correlations_custom_crop_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_beds DROP CONSTRAINT IF EXISTS garden_beds_structure_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_beds DROP CONSTRAINT IF EXISTS garden_beds_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_beds DROP CONSTRAINT IF EXISTS garden_beds_covering_structure_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garden_accessories DROP CONSTRAINT IF EXISTS garden_accessories_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.custom_plans DROP CONSTRAINT IF EXISTS custom_plans_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.custom_plans DROP CONSTRAINT IF EXISTS custom_plans_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.custom_crops DROP CONSTRAINT IF EXISTS custom_crops_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.custom_crops DROP CONSTRAINT IF EXISTS custom_crops_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.crop_learning_events DROP CONSTRAINT IF EXISTS crop_learning_events_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.crop_learning_events DROP CONSTRAINT IF EXISTS crop_learning_events_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.crop_learning_events DROP CONSTRAINT IF EXISTS crop_learning_events_custom_crop_id_fkey;
ALTER TABLE IF EXISTS ONLY public.challenge_completions DROP CONSTRAINT IF EXISTS challenge_completions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.calendar_tasks DROP CONSTRAINT IF EXISTS calendar_tasks_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.calendar_tasks DROP CONSTRAINT IF EXISTS calendar_tasks_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bed_planting_history DROP CONSTRAINT IF EXISTS bed_planting_history_bed_id_fkey;
ALTER TABLE IF EXISTS ONLY public.aquaponic_readings DROP CONSTRAINT IF EXISTS aquaponic_readings_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ai_credit_transactions DROP CONSTRAINT IF EXISTS ai_credit_transactions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.agronomists DROP CONSTRAINT IF EXISTS agronomists_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.agronomist_consultations DROP CONSTRAINT IF EXISTS agronomist_consultations_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.agronomist_consultations DROP CONSTRAINT IF EXISTS agronomist_consultations_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.agronomist_consultations DROP CONSTRAINT IF EXISTS agronomist_consultations_garden_id_fkey;
ALTER TABLE IF EXISTS ONLY public.agronomist_consultations DROP CONSTRAINT IF EXISTS agronomist_consultations_agronomist_id_fkey;
ALTER TABLE IF EXISTS ONLY public.agronomist_advice DROP CONSTRAINT IF EXISTS agronomist_advice_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.agronomist_advice DROP CONSTRAINT IF EXISTS agronomist_advice_consultation_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sso_domains DROP CONSTRAINT IF EXISTS sso_domains_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_oauth_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_flow_state_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_session_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.one_time_tokens DROP CONSTRAINT IF EXISTS one_time_tokens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_challenges DROP CONSTRAINT IF EXISTS mfa_challenges_auth_factor_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS mfa_amr_claims_session_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_user_id_fkey;
ALTER TABLE IF EXISTS ONLY _realtime.extensions DROP CONSTRAINT IF EXISTS extensions_tenant_external_id_fkey;
DROP TRIGGER IF EXISTS tr_check_filters ON realtime.subscription;
DROP TRIGGER IF EXISTS update_seedling_batches_updated_at ON public.seedling_batches;
DROP TRIGGER IF EXISTS update_seed_inventory_updated_at ON public.seed_inventory;
DROP TRIGGER IF EXISTS update_gardens_updated_at ON public.gardens;
DROP TRIGGER IF EXISTS update_garden_tasks_updated_at ON public.garden_tasks;
DROP TRIGGER IF EXISTS update_garden_obstacles_updated_at ON public.garden_obstacles;
DROP TRIGGER IF EXISTS update_garden_beds_updated_at ON public.garden_beds;
DROP TRIGGER IF EXISTS update_custom_plans_updated_at ON public.custom_plans;
DROP TRIGGER IF EXISTS update_custom_crops_updated_at ON public.custom_crops;
DROP TRIGGER IF EXISTS update_custom_crops_timestamp ON public.custom_crops;
DROP TRIGGER IF EXISTS update_calendar_tasks_updated_at ON public.calendar_tasks;
DROP TRIGGER IF EXISTS update_agronomists_updated_at ON public.agronomists;
DROP TRIGGER IF EXISTS on_user_created_credits ON auth.users;
DROP INDEX IF EXISTS supabase_functions.supabase_functions_hooks_request_id_idx;
DROP INDEX IF EXISTS supabase_functions.supabase_functions_hooks_h_table_id_h_name_idx;
DROP INDEX IF EXISTS realtime.subscription_subscription_id_entity_filters_key;
DROP INDEX IF EXISTS realtime.messages_inserted_at_topic_index;
DROP INDEX IF EXISTS realtime.ix_realtime_subscription_entity;
DROP INDEX IF EXISTS public.idx_zone_memories_garden_id;
DROP INDEX IF EXISTS public.idx_zone_memories_custom_crop_id;
DROP INDEX IF EXISTS public.idx_weather_cache_lat_lng_date;
DROP INDEX IF EXISTS public.idx_weather_cache_cached_at;
DROP INDEX IF EXISTS public.idx_user_badges_user;
DROP INDEX IF EXISTS public.idx_user_badges_earned;
DROP INDEX IF EXISTS public.idx_tree_memories_garden_id;
DROP INDEX IF EXISTS public.idx_tree_memories_custom_crop_id;
DROP INDEX IF EXISTS public.idx_treatment_register_user;
DROP INDEX IF EXISTS public.idx_treatment_register_garden;
DROP INDEX IF EXISTS public.idx_treatment_register_date;
DROP INDEX IF EXISTS public.idx_treatment_register_crop;
DROP INDEX IF EXISTS public.idx_seedling_batches_sowing_date;
DROP INDEX IF EXISTS public.idx_seedling_batches_phase;
DROP INDEX IF EXISTS public.idx_seedling_batches_garden_id;
DROP INDEX IF EXISTS public.idx_seed_inventory_user_id;
DROP INDEX IF EXISTS public.idx_seed_inventory_garden_id;
DROP INDEX IF EXISTS public.idx_seed_inventory_expiry_year;
DROP INDEX IF EXISTS public.idx_season_analyses_garden_id;
DROP INDEX IF EXISTS public.idx_professional_analytics_year;
DROP INDEX IF EXISTS public.idx_professional_analytics_user;
DROP INDEX IF EXISTS public.idx_professional_analytics_garden;
DROP INDEX IF EXISTS public.idx_professional_analytics_crop;
DROP INDEX IF EXISTS public.idx_photo_logs_task_id;
DROP INDEX IF EXISTS public.idx_photo_logs_photo_date;
DROP INDEX IF EXISTS public.idx_photo_logs_garden_id;
DROP INDEX IF EXISTS public.idx_patterns_garden_id;
DROP INDEX IF EXISTS public.idx_patterns_custom_crop_id;
DROP INDEX IF EXISTS public.idx_mechanical_work_user;
DROP INDEX IF EXISTS public.idx_mechanical_work_type;
DROP INDEX IF EXISTS public.idx_mechanical_work_garden;
DROP INDEX IF EXISTS public.idx_mechanical_work_date;
DROP INDEX IF EXISTS public.idx_learning_events_user_id;
DROP INDEX IF EXISTS public.idx_learning_events_tpg_dump: dropping INDEX idx_learning_events_crop_id
pg_dump: dropping INDEX idx_learning_events_created_at
pg_dump: dropping INDEX idx_hydroponic_readings_garden_date
pg_dump: dropping INDEX idx_harvest_logs_task_id
pg_dump: dropping INDEX idx_harvest_logs_plant_name
pg_dump: dropping INDEX idx_harvest_logs_harvest_date
pg_dump: dropping INDEX idx_harvest_logs_garden_id
pg_dump: dropping INDEX idx_gardens_user_id
pg_dump: dropping INDEX idx_gardens_created_at
pg_dump: dropping INDEX idx_garden_tasks_suggested_date
pg_dump: dropping INDEX idx_garden_tasks_suggested
pg_dump: dropping INDEX idx_garden_tasks_plant_name
pg_dump: dropping INDEX idx_garden_tasks_garden_id
pg_dump: dropping INDEX idx_garden_tasks_date
pg_dump: dropping INDEX idx_garden_tasks_completed
pg_dump: dropping INDEX idx_garden_tasks_bed_id
pg_dump: dropping INDEX idx_garden_obstacles_garden_id
pg_dump: dropping INDEX idx_garden_obstacles_azimuth
pg_dump: dropping INDEX idx_garden_beds_garden_id
pg_dump: dropping INDEX idx_custom_plans_user_id
pg_dump: dropping INDEX idx_custom_plans_garden_id
pg_dump: dropping INDEX idx_custom_plans_base_master_sheet
pg_dump: dropping INDEX idx_custom_crops_user_id
pg_dump: dropping INDEX idx_custom_crops_garden_id
pg_dump: dropping INDEX idx_custom_crops_common_name
pg_dump: dropping INDEX idx_crop_mechanical_works_work_type
pg_dump: dropping INDEX idx_crop_mechanical_works_priority
pg_dump: dropping INDEX idx_crop_mechanical_works_crop_id
pg_dump: dropping INDEX idx_credit_transactions_user
pg_dump: dropping INDEX idx_credit_transactions_created
pg_dump: dropping INDEX idx_correlations_garden_id
pg_dump: dropping INDEX idx_correlations_custom_crop_id
pg_dump: dropping INDEX idx_consultations_user_id
pg_dump: dropping INDEX idx_consultations_task_id
pg_dump: dropping INDEX idx_consultations_agronomist_id
pg_dump: dropping INDEX idx_challenge_completions_user
pg_dump: dropping INDEX idx_challenge_completions_date
pg_dump: dropping INDEX idx_challenge_completions_challenge
pg_dump: dropping INDEX idx_calendar_tasks_user_date
pg_dump: dropping INDEX idx_calendar_tasks_recurring
pg_dump: dropping INDEX idx_calendar_tasks_garden
pg_dump: dropping INDEX idx_bed_history_year_season
pg_dump: dropping INDEX idx_bed_history_plant_family
pg_dump: dropping INDEX idx_bed_history_bed_id
pg_dump: dropping INDEX idx_aquaponic_readings_garden_date
pg_dump: dropping INDEX idx_agronomists_user_id
pg_dump: dropping INDEX idx_advice_task_id
pg_dump: dropping INDEX idx_advice_consultation_id
pg_dump: dropping INDEX idx_accessories_garden_id
pg_dump: dropping INDEX idx_accessories_category
pg_dump: dropping INDEX users_is_anonymous_idx
pg_dump: dropping INDEX users_instance_id_idx
pg_dump: dropping INDEX users_instance_id_email_idx
pg_dump: dropping INDEX users_email_partial_key
pg_dump: dropping INDEX user_id_created_at_idx
pg_dump: dropping INDEX unique_phone_factor_per_user
pg_dump: dropping INDEX sso_providers_resource_id_pattern_idx
pg_dump: dropping INDEX sso_providers_resource_id_idx
pg_dump: dropping INDEX sso_domains_sso_provider_id_idx
pg_dump: dropping INDEX sso_domains_domain_idx
pg_dump: dropping INDEX sessions_user_id_idx
pg_dump: dropping INDEX sessions_oauth_client_id_idx
pg_dump: dropping INDEX sessions_not_after_idx
pg_dump: dropping INDEX saml_relay_states_sso_provider_id_idx
pg_dump: dropping INDEX saml_relay_states_for_email_idx
pg_dump: dropping INDEX saml_relay_states_created_at_idx
pg_dump: dropping INDEX saml_providers_sso_provider_id_idx
pg_dump: dropping INDEX refresh_tokens_updated_at_idx
pg_dump: dropping INDEX refresh_tokens_session_id_revoked_idx
pg_dump: dropping INDEX refresh_tokens_parent_idx
pg_dump: dropping INDEX refresh_tokens_instance_id_user_id_idx
pg_dump: dropping INDEX refresh_tokens_instance_id_idx
pg_dump: dropping INDEX recovery_token_idx
pg_dump: dropping INDEX reauthentication_token_idx
pg_dump: dropping INDEX one_time_tokens_user_id_token_type_key
pg_dump: dropping INDEX one_time_tokens_token_hash_hash_idx
pg_dump: dropping INDEX one_time_tokens_relates_to_hash_idx
pg_dump: dropping INDEX oauth_consents_user_order_idx
pg_dump: dropping INDEX oauth_consents_active_user_client_idx
pg_dump: dropping INDEX oauth_consents_active_client_idx
pg_dump: dropping INDEX oauth_clients_deleted_at_idx
pg_dump: dropping INDEX oauth_auth_pending_exp_idx
pg_dump: dropping INDEX mfa_factors_user_id_idx
pg_dump: dropping INDEX mfa_factors_user_friendly_name_unique
pg_dump: dropping INDEX mfa_challenge_created_at_idx
pg_dump: dropping INDEX idx_user_id_auth_method
pg_dump: dropping INDEX idx_auth_code
pg_dump: dropping INDEX identities_user_id_idx
pg_dump: dropping INDEX identities_email_idx
pg_dump: dropping INDEX flow_state_created_at_idx
pg_dump: dropping INDEX factor_id_created_at_idx
pg_dump: dropping INDEX email_change_token_new_idx
pg_dump: dropping INDEX email_change_token_current_idx
pg_dump: dropping INDEX confirmation_token_idx
pg_dump: dropping INDEX audit_logs_instance_id_idx
pg_dump: dropping INDEX tenants_external_id_index
pg_dump: dropping INDEX extensions_tenant_external_id_type_index
pg_dump: dropping INDEX extensions_tenant_external_id_index
pg_dump: dropping CONSTRAINT migrations migrations_pkey
pg_dump: dropping CONSTRAINT hooks hooks_pkey
pg_dump: dropping CONSTRAINT schema_migrations schema_migrations_pkey
pg_dump: dropping CONSTRAINT subscription pk_subscription
pg_dump: dropping CONSTRAINT messages_2025_12_20 messages_2025_12_20_pkey
pg_dump: dropping CONSTRAINT messages_2025_12_19 messages_2025_12_19_pkey
pg_dump: dropping CONSTRAINT messages_2025_12_18 messages_2025_12_18_pkey
pg_dump: dropping CONSTRAINT messages_2025_12_17 messages_2025_12_17_pkey
pg_dump: dropping CONSTRAINT messages_2025_12_16 messages_2025_12_16_pkey
pg_dump: dropping CONSTRAINT messages_2025_12_15 messages_2025_12_15_pkey
pg_dump: dropping CONSTRAINT messages_2025_12_14 messages_2025_12_14_pkey
pg_dump: dropping CONSTRAINT messages messages_pkey
pg_dump: dropping CONSTRAINT weather_cache weather_cache_pkey
pg_dump: dropping CONSTRAINT weather_cache weather_cache_lat_lng_date_key
pg_dump: dropping CONSTRAINT user_badges user_badges_user_id_badge_id_key
pg_dump: dropping CONSTRAINT user_badges user_badges_pkey
pg_dump: dropping CONSTRAINT treatment_register treatment_register_pkey
pg_dump: dropping CONSTRAINT seedling_batches seedling_batches_pkey
pg_dump: dropping CONSTRAINT seed_inventory seed_inventory_pkey
pg_dump: dropping CONSTRAINT profiles profiles_pkey
pg_dump: dropping CONSTRAINT professional_analytics professional_analytics_pkey
pg_dump: dropping CONSTRAINT photo_logs photo_logs_pkey
pg_dump: dropping CONSTRAINT mechanical_work_register mechanical_work_register_pkey
pg_dump: dropping CONSTRAINT hydroponic_readings hydroponic_readings_pkey
pg_dump: dropping CONSTRAINT harvest_logs harvest_logs_pkey
pg_dump: dropping CONSTRAINT gardens gardens_pkey
pg_dump: dropping CONSTRAINT garden_zone_memories garden_zone_memories_pkey
pg_dump: dropping CONSTRAINT garden_tree_memories garden_tree_memories_pkey
pg_dump: dropping CONSTRAINT garden_tasks garden_tasks_pkey
pg_dump: dropping CONSTRAINT garden_season_analyses garden_season_analyses_pkey
pg_dump: dropping CONSTRAINT garden_season_analyses garden_season_analyses_garden_id_season_year_key
pg_dump: dropping CONSTRAINT garden_patterns garden_patterns_pkey
pg_dump: dropping CONSTRAINT garden_obstacles garden_obstacles_pkey
pg_dump: dropping CONSTRAINT garden_correlations garden_correlations_pkey
pg_dump: dropping CONSTRAINT garden_beds garden_beds_pkey
pg_dump: dropping CONSTRAINT garden_accessories garden_accessories_pkey
pg_dump: dropping CONSTRAINT custom_plans custom_plans_pkey
pg_dump: dropping CONSTRAINT custom_crops custom_crops_pkey
pg_dump: dropping CONSTRAINT crop_mechanical_works crop_mechanical_works_pkey
pg_dump: dropping CONSTRAINT crop_learning_events crop_learning_events_pkey
pg_dump: dropping CONSTRAINT challenge_completions challenge_completions_user_id_challenge_id_key
pg_dump: dropping CONSTRAINT challenge_completions challenge_completions_pkey
pg_dump: dropping CONSTRAINT calendar_tasks calendar_tasks_pkey
pg_dump: dropping CONSTRAINT bed_planting_history bed_planting_history_pkey
pg_dump: dropping CONSTRAINT aquaponic_readings aquaponic_readings_pkey
pg_dump: dropping CONSTRAINT ai_credit_transactions ai_credit_transactions_pkey
pg_dump: dropping CONSTRAINT agronomists agronomists_pkey
pg_dump: dropping CONSTRAINT agronomist_consultations agronomist_consultations_pkey
pg_dump: dropping CONSTRAINT agronomist_advice agronomist_advice_pkey
pg_dump: dropping CONSTRAINT users users_pkey
pg_dump: dropping CONSTRAINT users users_phone_key
pg_dump: dropping CONSTRAINT sso_providers sso_providers_pkey
pg_dump: dropping CONSTRAINT sso_domains sso_domains_pkey
pg_dump: dropping CONSTRAINT sessions sessions_pkey
pg_dump: dropping CONSTRAINT schema_migrations schema_migrations_pkey
pg_dump: dropping CONSTRAINT saml_relay_states saml_relay_states_pkey
pg_dump: dropping CONSTRAINT saml_providers saml_providers_pkey
pg_dump: dropping CONSTRAINT saml_providers saml_providers_entity_id_key
pg_dump: dropping CONSTRAINT refresh_tokens refresh_tokens_token_unique
pg_dump: dropping CONSTRAINT refresh_tokens refresh_tokens_pkey
pg_dump: dropping CONSTRAINT one_time_tokens one_time_tokens_pkey
pg_dump: dropping CONSTRAINT oauth_consents oauth_consents_user_client_unique
pg_dump: dropping CONSTRAINT oauth_consents oauth_consents_pkey
pg_dump: dropping CONSTRAINT oauth_clients oauth_clients_pkey
pg_dump: dropping CONSTRAINT oauth_authorizations oauth_authorizations_pkey
pg_dump: dropping CONSTRAINT oauth_authorizations oauth_authorizations_authorization_id_key
pg_dump: dropping CONSTRAINT oauth_authorizations oauth_authorizations_authorization_code_key
pg_dump: dropping CONSTRAINT mfa_factors mfa_factors_pkey
pg_dump: dropping CONSTRAINT mfa_factors mfa_factors_last_challenged_at_key
pg_dump: dropping CONSTRAINT mfa_challenges mfa_challenges_pkey
pg_dump: dropping CONSTRAINT mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey
pg_dump: dropping CONSTRAINT instances instances_pkey
pg_dump: dropping CONSTRAINT identities identities_provider_id_provider_unique
pg_dump: dropping CONSTRAINT identities identities_pkey
pg_dump: dropping CONSTRAINT flow_state flow_state_pkey
pg_dump: dropping CONSTRAINT audit_log_entries audit_log_entries_pkey
pg_dump: dropping CONSTRAINT mfa_amr_claims amr_id_pk
pg_dump: dropping CONSTRAINT tenants tenants_pkey
pg_dump: dropping CONSTRAINT schema_migrations schema_migrations_pkey
pg_dump: dropping CONSTRAINT extensions extensions_pkey
pg_dump: dropping DEFAULT hooks id
pg_dump: dropping DEFAULT refresh_tokens id
pg_dump: dropping TABLE migrations
pg_dump: dropping SEQUENCE hooks_id_seq
pg_dump: dropping TABLE hooks
pg_dump: dropping SEQUENCE subscription_id_seq
pg_dump: dropping TABLE subscription
pg_dump: dropping TABLE schema_migrations
pg_dump: dropping TABLE messages_2025_12_20
pg_dump: dropping TABLE messages_2025_12_19
pg_dump: dropping TABLE messages_2025_12_18
pg_dump: dropping TABLE messages_2025_12_17
pg_dump: dropping TABLE messages_2025_12_16
pg_dump: dropping TABLE messages_2025_12_15
pg_dump: dropping TABLE messages_2025_12_14
pg_dump: dropping TABLE messages
pg_dump: dropping TABLE weather_cache
pg_dump: dropping TABLE user_badges
pg_dump: dropping TABLE treatment_register
pg_dump: dropping TABLE seedling_batches
pg_dump: dropping TABLE seed_inventory
pg_dump: dropping TABLE profiles
pg_dump: dropping TABLE professional_analytics
pg_dump: dropping TABLE photo_logs
pg_dump: dropping TABLE mechanical_work_register
pg_dump: dropping TABLE hydroponic_readings
pg_dump: dropping TABLE harvest_logs
pg_dump: dropping TABLE gardens
pg_dump: dropping TABLE garden_zone_memories
pg_dump: dropping TABLE garden_tree_memories
pg_dump: dropping TABLE garden_tasks
pg_dump: dropping TABLE garden_season_analyses
pg_dump: dropping TABLE garden_patterns
pg_dump: dropping TABLE garden_obstacles
pg_dump: dropping TABLE garden_correlations
pg_dump: dropping TABLE garden_beds
pg_dump: dropping TABLE garden_accessories
pg_dump: dropping TABLE custom_plans
pg_dump: dropping TABLE custom_crops
pg_dump: dropping TABLE crop_mechanical_works
pg_dump: dropping TABLE crop_learning_events
pg_dump: dropping TABLE challenge_completions
pg_dump: dropping TABLE calendar_tasks
pg_dump: dropping TABLE bed_planting_history
pg_dump: dropping TABLE aquaponic_readings
pg_dump: dropping TABLE ai_credit_transactions
pg_dump: dropping TABLE agronomists
pg_dump: dropping TABLE agronomist_consultations
pg_dump: dropping TABLE agronomist_advice
pg_dump: dropping TABLE users
pg_dump: dropping TABLE sso_providers
pg_dump: dropping TABLE sso_domains
pg_dump: dropping TABLE sessions
pg_dump: dropping TABLE schema_migrations
pg_dump: dropping TABLE saml_relay_states
pg_dump: dropping TABLE saml_providers
pg_dump: dropping SEQUENCE refresh_tokens_id_seq
pg_dump: dropping TABLE refresh_tokens
pg_dump: dropping TABLE one_time_tokens
pg_dump: dropping TABLE oauth_consents
ype;
DROP INDEX IF EXISTS public.idx_learning_events_crop_id;
DROP INDEX IF EXISTS public.idx_learning_events_created_at;
DROP INDEX IF EXISTS public.idx_hydroponic_readings_garden_date;
DROP INDEX IF EXISTS public.idx_harvest_logs_task_id;
DROP INDEX IF EXISTS public.idx_harvest_logs_plant_name;
DROP INDEX IF EXISTS public.idx_harvest_logs_harvest_date;
DROP INDEX IF EXISTS public.idx_harvest_logs_garden_id;
DROP INDEX IF EXISTS public.idx_gardens_user_id;
DROP INDEX IF EXISTS public.idx_gardens_created_at;
DROP INDEX IF EXISTS public.idx_garden_tasks_suggested_date;
DROP INDEX IF EXISTS public.idx_garden_tasks_suggested;
DROP INDEX IF EXISTS public.idx_garden_tasks_plant_name;
DROP INDEX IF EXISTS public.idx_garden_tasks_garden_id;
DROP INDEX IF EXISTS public.idx_garden_tasks_date;
DROP INDEX IF EXISTS public.idx_garden_tasks_completed;
DROP INDEX IF EXISTS public.idx_garden_tasks_bed_id;
DROP INDEX IF EXISTS public.idx_garden_obstacles_garden_id;
DROP INDEX IF EXISTS public.idx_garden_obstacles_azimuth;
DROP INDEX IF EXISTS public.idx_garden_beds_garden_id;
DROP INDEX IF EXISTS public.idx_custom_plans_user_id;
DROP INDEX IF EXISTS public.idx_custom_plans_garden_id;
DROP INDEX IF EXISTS public.idx_custom_plans_base_master_sheet;
DROP INDEX IF EXISTS public.idx_custom_crops_user_id;
DROP INDEX IF EXISTS public.idx_custom_crops_garden_id;
DROP INDEX IF EXISTS public.idx_custom_crops_common_name;
DROP INDEX IF EXISTS public.idx_crop_mechanical_works_work_type;
DROP INDEX IF EXISTS public.idx_crop_mechanical_works_priority;
DROP INDEX IF EXISTS public.idx_crop_mechanical_works_crop_id;
DROP INDEX IF EXISTS public.idx_credit_transactions_user;
DROP INDEX IF EXISTS public.idx_credit_transactions_created;
DROP INDEX IF EXISTS public.idx_correlations_garden_id;
DROP INDEX IF EXISTS public.idx_correlations_custom_crop_id;
DROP INDEX IF EXISTS public.idx_consultations_user_id;
DROP INDEX IF EXISTS public.idx_consultations_task_id;
DROP INDEX IF EXISTS public.idx_consultations_agronomist_id;
DROP INDEX IF EXISTS public.idx_challenge_completions_user;
DROP INDEX IF EXISTS public.idx_challenge_completions_date;
DROP INDEX IF EXISTS public.idx_challenge_completions_challenge;
DROP INDEX IF EXISTS public.idx_calendar_tasks_user_date;
DROP INDEX IF EXISTS public.idx_calendar_tasks_recurring;
DROP INDEX IF EXISTS public.idx_calendar_tasks_garden;
DROP INDEX IF EXISTS public.idx_bed_history_year_season;
DROP INDEX IF EXISTS public.idx_bed_history_plant_family;
DROP INDEX IF EXISTS public.idx_bed_history_bed_id;
DROP INDEX IF EXISTS public.idx_aquaponic_readings_garden_date;
DROP INDEX IF EXISTS public.idx_agronomists_user_id;
DROP INDEX IF EXISTS public.idx_advice_task_id;
DROP INDEX IF EXISTS public.idx_advice_consultation_id;
DROP INDEX IF EXISTS public.idx_accessories_garden_id;
DROP INDEX IF EXISTS public.idx_accessories_category;
DROP INDEX IF EXISTS auth.users_is_anonymous_idx;
DROP INDEX IF EXISTS auth.users_instance_id_idx;
DROP INDEX IF EXISTS auth.users_instance_id_email_idx;
DROP INDEX IF EXISTS auth.users_email_partial_key;
DROP INDEX IF EXISTS auth.user_id_created_at_idx;
DROP INDEX IF EXISTS auth.unique_phone_factor_per_user;
DROP INDEX IF EXISTS auth.sso_providers_resource_id_pattern_idx;
DROP INDEX IF EXISTS auth.sso_providers_resource_id_idx;
DROP INDEX IF EXISTS auth.sso_domains_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.sso_domains_domain_idx;
DROP INDEX IF EXISTS auth.sessions_user_id_idx;
DROP INDEX IF EXISTS auth.sessions_oauth_client_id_idx;
DROP INDEX IF EXISTS auth.sessions_not_after_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_for_email_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_created_at_idx;
DROP INDEX IF EXISTS auth.saml_providers_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_updated_at_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_session_id_revoked_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_parent_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_instance_id_user_id_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_instance_id_idx;
DROP INDEX IF EXISTS auth.recovery_token_idx;
DROP INDEX IF EXISTS auth.reauthentication_token_idx;
DROP INDEX IF EXISTS auth.one_time_tokens_user_id_token_type_key;
DROP INDEX IF EXISTS auth.one_time_tokens_token_hash_hash_idx;
DROP INDEX IF EXISTS auth.one_time_tokens_relates_to_hash_idx;
DROP INDEX IF EXISTS auth.oauth_consents_user_order_idx;
DROP INDEX IF EXISTS auth.oauth_consents_active_user_client_idx;
DROP INDEX IF EXISTS auth.oauth_consents_active_client_idx;
DROP INDEX IF EXISTS auth.oauth_clients_deleted_at_idx;
DROP INDEX IF EXISTS auth.oauth_auth_pending_exp_idx;
DROP INDEX IF EXISTS auth.mfa_factors_user_id_idx;
DROP INDEX IF EXISTS auth.mfa_factors_user_friendly_name_unique;
DROP INDEX IF EXISTS auth.mfa_challenge_created_at_idx;
DROP INDEX IF EXISTS auth.idx_user_id_auth_method;
DROP INDEX IF EXISTS auth.idx_auth_code;
DROP INDEX IF EXISTS auth.identities_user_id_idx;
DROP INDEX IF EXISTS auth.identities_email_idx;
DROP INDEX IF EXISTS auth.flow_state_created_at_idx;
DROP INDEX IF EXISTS auth.factor_id_created_at_idx;
DROP INDEX IF EXISTS auth.email_change_token_new_idx;
DROP INDEX IF EXISTS auth.email_change_token_current_idx;
DROP INDEX IF EXISTS auth.confirmation_token_idx;
DROP INDEX IF EXISTS auth.audit_logs_instance_id_idx;
DROP INDEX IF EXISTS _realtime.tenants_external_id_index;
DROP INDEX IF EXISTS _realtime.extensions_tenant_external_id_type_index;
DROP INDEX IF EXISTS _realtime.extensions_tenant_external_id_index;
ALTER TABLE IF EXISTS ONLY supabase_functions.migrations DROP CONSTRAINT IF EXISTS migrations_pkey;
ALTER TABLE IF EXISTS ONLY supabase_functions.hooks DROP CONSTRAINT IF EXISTS hooks_pkey;
ALTER TABLE IF EXISTS ONLY realtime.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY realtime.subscription DROP CONSTRAINT IF EXISTS pk_subscription;
ALTER TABLE IF EXISTS ONLY realtime.messages_2025_12_20 DROP CONSTRAINT IF EXISTS messages_2025_12_20_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages_2025_12_19 DROP CONSTRAINT IF EXISTS messages_2025_12_19_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages_2025_12_18 DROP CONSTRAINT IF EXISTS messages_2025_12_18_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages_2025_12_17 DROP CONSTRAINT IF EXISTS messages_2025_12_17_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages_2025_12_16 DROP CONSTRAINT IF EXISTS messages_2025_12_16_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages_2025_12_15 DROP CONSTRAINT IF EXISTS messages_2025_12_15_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages_2025_12_14 DROP CONSTRAINT IF EXISTS messages_2025_12_14_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages DROP CONSTRAINT IF EXISTS messages_pkey;
ALTER TABLE IF EXISTS ONLY public.weather_cache DROP CONSTRAINT IF EXISTS weather_cache_pkey;
ALTER TABLE IF EXISTS ONLY public.weather_cache DROP CONSTRAINT IF EXISTS weather_cache_lat_lng_date_key;
ALTER TABLE IF EXISTS ONLY public.user_badges DROP CONSTRAINT IF EXISTS user_badges_user_id_badge_id_key;
ALTER TABLE IF EXISTS ONLY public.user_badges DROP CONSTRAINT IF EXISTS user_badges_pkey;
ALTER TABLE IF EXISTS ONLY public.treatment_register DROP CONSTRAINT IF EXISTS treatment_register_pkey;
ALTER TABLE IF EXISTS ONLY public.seedling_batches DROP CONSTRAINT IF EXISTS seedling_batches_pkey;
ALTER TABLE IF EXISTS ONLY public.seed_inventory DROP CONSTRAINT IF EXISTS seed_inventory_pkey;
ALTER TABLE IF EXISTS ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.professional_analytics DROP CONSTRAINT IF EXISTS professional_analytics_pkey;
ALTER TABLE IF EXISTS ONLY public.photo_logs DROP CONSTRAINT IF EXISTS photo_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.mechanical_work_register DROP CONSTRAINT IF EXISTS mechanical_work_register_pkey;
ALTER TABLE IF EXISTS ONLY public.hydroponic_readings DROP CONSTRAINT IF EXISTS hydroponic_readings_pkey;
ALTER TABLE IF EXISTS ONLY public.harvest_logs DROP CONSTRAINT IF EXISTS harvest_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.gardens DROP CONSTRAINT IF EXISTS gardens_pkey;
ALTER TABLE IF EXISTS ONLY public.garden_zone_memories DROP CONSTRAINT IF EXISTS garden_zone_memories_pkey;
ALTER TABLE IF EXISTS ONLY public.garden_tree_memories DROP CONSTRAINT IF EXISTS garden_tree_memories_pkey;
ALTER TABLE IF EXISTS ONLY public.garden_tasks DROP CONSTRAINT IF EXISTS garden_tasks_pkey;
ALTER TABLE IF EXISTS ONLY public.garden_season_analyses DROP CONSTRAINT IF EXISTS garden_season_analyses_pkey;
ALTER TABLE IF EXISTS ONLY public.garden_season_analyses DROP CONSTRAINT IF EXISTS garden_season_analyses_garden_id_season_year_key;
ALTER TABLE IF EXISTS ONLY public.garden_patterns DROP CONSTRAINT IF EXISTS garden_patterns_pkey;
ALTER TABLE IF EXISTS ONLY public.garden_obstacles DROP CONSTRAINT IF EXISTS garden_obstacles_pkey;
ALTER TABLE IF EXISTS ONLY public.garden_correlations DROP CONSTRAINT IF EXISTS garden_correlations_pkey;
ALTER TABLE IF EXISTS ONLY public.garden_beds DROP CONSTRAINT IF EXISTS garden_beds_pkey;
ALTER TABLE IF EXISTS ONLY public.garden_accessories DROP CONSTRAINT IF EXISTS garden_accessories_pkey;
ALTER TABLE IF EXISTS ONLY public.custom_plans DROP CONSTRAINT IF EXISTS custom_plans_pkey;
ALTER TABLE IF EXISTS ONLY public.custom_crops DROP CONSTRAINT IF EXISTS custom_crops_pkey;
ALTER TABLE IF EXISTS ONLY public.crop_mechanical_works DROP CONSTRAINT IF EXISTS crop_mechanical_works_pkey;
ALTER TABLE IF EXISTS ONLY public.crop_learning_events DROP CONSTRAINT IF EXISTS crop_learning_events_pkey;
ALTER TABLE IF EXISTS ONLY public.challenge_completions DROP CONSTRAINT IF EXISTS challenge_completions_user_id_challenge_id_key;
ALTER TABLE IF EXISTS ONLY public.challenge_completions DROP CONSTRAINT IF EXISTS challenge_completions_pkey;
ALTER TABLE IF EXISTS ONLY public.calendar_tasks DROP CONSTRAINT IF EXISTS calendar_tasks_pkey;
ALTER TABLE IF EXISTS ONLY public.bed_planting_history DROP CONSTRAINT IF EXISTS bed_planting_history_pkey;
ALTER TABLE IF EXISTS ONLY public.aquaponic_readings DROP CONSTRAINT IF EXISTS aquaponic_readings_pkey;
ALTER TABLE IF EXISTS ONLY public.ai_credit_transactions DROP CONSTRAINT IF EXISTS ai_credit_transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.agronomists DROP CONSTRAINT IF EXISTS agronomists_pkey;
ALTER TABLE IF EXISTS ONLY public.agronomist_consultations DROP CONSTRAINT IF EXISTS agronomist_consultations_pkey;
ALTER TABLE IF EXISTS ONLY public.agronomist_advice DROP CONSTRAINT IF EXISTS agronomist_advice_pkey;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_phone_key;
ALTER TABLE IF EXISTS ONLY auth.sso_providers DROP CONSTRAINT IF EXISTS sso_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.sso_domains DROP CONSTRAINT IF EXISTS sso_domains_pkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY auth.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_entity_id_key;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_token_unique;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_pkey;
ALTER TABLE IF EXISTS ONLY auth.one_time_tokens DROP CONSTRAINT IF EXISTS one_time_tokens_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_user_client_unique;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_clients DROP CONSTRAINT IF EXISTS oauth_clients_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_authorization_id_key;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_authorization_code_key;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_last_challenged_at_key;
ALTER TABLE IF EXISTS ONLY auth.mfa_challenges DROP CONSTRAINT IF EXISTS mfa_challenges_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS mfa_amr_claims_session_id_authentication_method_pkey;
ALTER TABLE IF EXISTS ONLY auth.instances DROP CONSTRAINT IF EXISTS instances_pkey;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_provider_id_provider_unique;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_pkey;
ALTER TABLE IF EXISTS ONLY auth.flow_state DROP CONSTRAINT IF EXISTS flow_state_pkey;
ALTER TABLE IF EXISTS ONLY auth.audit_log_entries DROP CONSTRAINT IF EXISTS audit_log_entries_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS amr_id_pk;
ALTER TABLE IF EXISTS ONLY _realtime.tenants DROP CONSTRAINT IF EXISTS tenants_pkey;
ALTER TABLE IF EXISTS ONLY _realtime.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY _realtime.extensions DROP CONSTRAINT IF EXISTS extensions_pkey;
ALTER TABLE IF EXISTS supabase_functions.hooks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS auth.refresh_tokens ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS supabase_functions.migrations;
DROP SEQUENCE IF EXISTS supabase_functions.hooks_id_seq;
DROP TABLE IF EXISTS supabase_functions.hooks;
DROP TABLE IF EXISTS realtime.subscription;
DROP TABLE IF EXISTS realtime.schema_migrations;
DROP TABLE IF EXISTS realtime.messages_2025_12_20;
DROP TABLE IF EXISTS realtime.messages_2025_12_19;
DROP TABLE IF EXISTS realtime.messages_2025_12_18;
DROP TABLE IF EXISTS realtime.messages_2025_12_17;
DROP TABLE IF EXISTS realtime.messages_2025_12_16;
DROP TABLE IF EXISTS realtime.messages_2025_12_15;
DROP TABLE IF EXISTS realtime.messages_2025_12_14;
DROP TABLE IF EXISTS realtime.messages;
DROP TABLE IF EXISTS public.weather_cache;
DROP TABLE IF EXISTS public.user_badges;
DROP TABLE IF EXISTS public.treatment_register;
DROP TABLE IF EXISTS public.seedling_batches;
DROP TABLE IF EXISTS public.seed_inventory;
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.professional_analytics;
DROP TABLE IF EXISTS public.photo_logs;
DROP TABLE IF EXISTS public.mechanical_work_register;
DROP TABLE IF EXISTS public.hydroponic_readings;
DROP TABLE IF EXISTS public.harvest_logs;
DROP TABLE IF EXISTS public.gardens;
DROP TABLE IF EXISTS public.garden_zone_memories;
DROP TABLE IF EXISTS public.garden_tree_memories;
DROP TABLE IF EXISTS public.garden_tasks;
DROP TABLE IF EXISTS public.garden_season_analyses;
DROP TABLE IF EXISTS public.garden_patterns;
DROP TABLE IF EXISTS public.garden_obstacles;
DROP TABLE IF EXISTS public.garden_correlations;
DROP TABLE IF EXISTS public.garden_beds;
DROP TABLE IF EXISTS public.garden_accessories;
DROP TABLE IF EXISTS public.custom_plans;
DROP TABLE IF EXISTS public.custom_crops;
DROP TABLE IF EXISTS public.crop_mechanical_works;
DROP TABLE IF EXISTS public.crop_learning_events;
DROP TABLE IF EXISTS public.challenge_completions;
DROP TABLE IF EXISTS public.calendar_tasks;
DROP TABLE IF EXISTS public.bed_planting_history;
DROP TABLE IF EXISTS public.aquaponic_readings;
DROP TABLE IF EXISTS public.ai_credit_transactions;
DROP TABLE IF EXISTS public.agronomists;
DROP TABLE IF EXISTS public.agronomist_consultations;
DROP TABLE IF EXISTS public.agronomist_advice;
DROP TABLE IF EXISTS auth.users;
DROP TABLE IF EXISTS auth.sso_providers;
DROP TABLE IF EXISTS auth.sso_domains;
DROP TABLE IF EXISTS auth.sessions;
DROP TABLE IF EXISTS auth.schema_migrations;
DROP TABLE IF EXISTS auth.saml_relay_states;
DROP TABLE IF EXISTS auth.saml_providers;
DROP SEQUENCE IF EXISTS auth.refresh_tokens_id_seq;
DROP TABLE IF EXISTS auth.refresh_tokens;
DROP TABLE IF EXISTS auth.one_time_tokens;
DROP TABLE IF EXISTS auth.oauth_consentspg_dump: dropping TABLE oauth_clients
pg_dump: dropping TABLE oauth_authorizations
pg_dump: dropping TABLE mfa_factors
pg_dump: dropping TABLE mfa_challenges
pg_dump: dropping TABLE mfa_amr_claims
pg_dump: dropping TABLE instances
pg_dump: dropping TABLE identities
pg_dump: dropping TABLE flow_state
pg_dump: dropping TABLE audit_log_entries
pg_dump: dropping TABLE tenants
pg_dump: dropping TABLE schema_migrations
pg_dump: dropping TABLE extensions
pg_dump: dropping FUNCTION http_request()
pg_dump: dropping FUNCTION topic()
pg_dump: dropping FUNCTION to_regrole(text)
pg_dump: dropping FUNCTION subscription_check_filters()
pg_dump: dropping FUNCTION send(jsonb, text, text, boolean)
pg_dump: dropping FUNCTION quote_wal2json(regclass)
pg_dump: dropping FUNCTION list_changes(name, name, integer, integer)
pg_dump: dropping FUNCTION is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[])
pg_dump: dropping FUNCTION check_equality_op(realtime.equality_op, regtype, text, text)
pg_dump: dropping FUNCTION cast(text, regtype)
pg_dump: dropping FUNCTION build_prepared_statement_sql(text, regclass, realtime.wal_column[])
pg_dump: dropping FUNCTION broadcast_changes(text, text, text, text, text, record, record, text)
pg_dump: dropping FUNCTION apply_rls(jsonb, integer)
pg_dump: dropping FUNCTION update_updated_at_column()
pg_dump: dropping FUNCTION update_custom_crops_updated_at()
pg_dump: dropping FUNCTION set_user_tier(uuid, text)
pg_dump: dropping FUNCTION list_all_users()
pg_dump: dropping FUNCTION handle_new_user_credits()
pg_dump: dropping FUNCTION grant_credits(uuid, integer)
pg_dump: dropping FUNCTION deduct_credits(uuid, integer)
pg_dump: dropping FUNCTION create_superadmin(text, text)
pg_dump: dropping FUNCTION check_rotation_compliance(uuid, text)
pg_dump: dropping FUNCTION calculate_harvest_stats(uuid, date, date)
pg_dump: dropping FUNCTION admin_grant_credits(uuid, integer)
pg_dump: dropping FUNCTION get_auth(text)
pg_dump: dropping FUNCTION set_graphql_placeholder()
pg_dump: dropping FUNCTION pgrst_drop_watch()
pg_dump: dropping FUNCTION pgrst_ddl_watch()
pg_dump: dropping FUNCTION grant_pg_net_access()
pg_dump: dropping FUNCTION grant_pg_graphql_access()
pg_dump: dropping FUNCTION grant_pg_cron_access()
pg_dump: dropping FUNCTION uid()
pg_dump: dropping FUNCTION role()
pg_dump: dropping FUNCTION jwt()
pg_dump: dropping FUNCTION email()
pg_dump: dropping TYPE wal_rls
pg_dump: dropping TYPE wal_column
pg_dump: dropping TYPE user_defined_filter
pg_dump: dropping TYPE equality_op
pg_dump: dropping TYPE action
pg_dump: dropping TYPE one_time_token_type
pg_dump: dropping TYPE oauth_response_type
pg_dump: dropping TYPE oauth_registration_type
pg_dump: dropping TYPE oauth_client_type
pg_dump: dropping TYPE oauth_authorization_status
pg_dump: dropping TYPE factor_type
pg_dump: dropping TYPE factor_status
pg_dump: dropping TYPE code_challenge_method
pg_dump: dropping TYPE aal_level
pg_dump: dropping EXTENSION uuid-ossp
pg_dump: dropping EXTENSION supabase_vault
pg_dump: dropping EXTENSION pgcrypto
pg_dump: dropping EXTENSION pg_stat_statements
pg_dump: dropping EXTENSION pg_graphql
pg_dump: dropping SCHEMA vault
pg_dump: dropping SCHEMA supabase_functions
pg_dump: dropping SCHEMA storage
pg_dump: dropping SCHEMA realtime
pg_dump: dropping SCHEMA pgbouncer
pg_dump: dropping EXTENSION pg_net
pg_dump: dropping SCHEMA graphql_public
pg_dump: dropping SCHEMA graphql
pg_dump: dropping SCHEMA extensions
pg_dump: dropping SCHEMA auth
pg_dump: dropping SCHEMA _realtime
pg_dump: creating SCHEMA "_realtime"
pg_dump: creating SCHEMA "auth"
pg_dump: creating SCHEMA "extensions"
pg_dump: creating SCHEMA "graphql"
pg_dump: creating SCHEMA "graphql_public"
pg_dump: creating EXTENSION "pg_net"
pg_dump: creating COMMENT "EXTENSION pg_net"
pg_dump: creating SCHEMA "pgbouncer"
pg_dump: creating SCHEMA "realtime"
pg_dump: creating SCHEMA "storage"
pg_dump: creating SCHEMA "supabase_functions"
pg_dump: creating SCHEMA "vault"
pg_dump: creating EXTENSION "pg_graphql"
pg_dump: creating COMMENT "EXTENSION pg_graphql"
pg_dump: creating EXTENSION "pg_stat_statements"
pg_dump: creating COMMENT "EXTENSION pg_stat_statements"
pg_dump: creating EXTENSION "pgcrypto"
pg_dump: creating COMMENT "EXTENSION pgcrypto"
pg_dump: creating EXTENSION "supabase_vault"
pg_dump: creating COMMENT "EXTENSION supabase_vault"
pg_dump: creating EXTENSION "uuid-ossp"
pg_dump: creating COMMENT "EXTENSION "uuid-ossp""
pg_dump: creating TYPE "auth.aal_level"
pg_dump: creating TYPE "auth.code_challenge_method"
pg_dump: creating TYPE "auth.factor_status"
pg_dump: creating TYPE "auth.factor_type"
pg_dump: creating TYPE "auth.oauth_authorization_status"
pg_dump: creating TYPE "auth.oauth_client_type"
pg_dump: creating TYPE "auth.oauth_registration_type"
pg_dump: creating TYPE "auth.oauth_response_type"
pg_dump: creating TYPE "auth.one_time_token_type"
pg_dump: creating TYPE "realtime.action"
pg_dump: creating TYPE "realtime.equality_op"
pg_dump: creating TYPE "realtime.user_defined_filter"
pg_dump: creating TYPE "realtime.wal_column"
pg_dump: creating TYPE "realtime.wal_rls"
pg_dump: creating FUNCTION "auth.email()"
pg_dump: creating COMMENT "auth.FUNCTION email()"
pg_dump: creating FUNCTION "auth.jwt()"
pg_dump: creating FUNCTION "auth.role()"
pg_dump: creating COMMENT "auth.FUNCTION role()"
pg_dump: creating FUNCTION "auth.uid()"
pg_dump: creating COMMENT "auth.FUNCTION uid()"
pg_dump: creating FUNCTION "extensions.grant_pg_cron_access()"
pg_dump: creating COMMENT "extensions.FUNCTION grant_pg_cron_access()"
pg_dump: creating FUNCTION "extensions.grant_pg_graphql_access()"
;
DROP TABLE IF EXISTS auth.oauth_clients;
DROP TABLE IF EXISTS auth.oauth_authorizations;
DROP TABLE IF EXISTS auth.mfa_factors;
DROP TABLE IF EXISTS auth.mfa_challenges;
DROP TABLE IF EXISTS auth.mfa_amr_claims;
DROP TABLE IF EXISTS auth.instances;
DROP TABLE IF EXISTS auth.identities;
DROP TABLE IF EXISTS auth.flow_state;
DROP TABLE IF EXISTS auth.audit_log_entries;
DROP TABLE IF EXISTS _realtime.tenants;
DROP TABLE IF EXISTS _realtime.schema_migrations;
DROP TABLE IF EXISTS _realtime.extensions;
DROP FUNCTION IF EXISTS supabase_functions.http_request();
DROP FUNCTION IF EXISTS realtime.topic();
DROP FUNCTION IF EXISTS realtime.to_regrole(role_name text);
DROP FUNCTION IF EXISTS realtime.subscription_check_filters();
DROP FUNCTION IF EXISTS realtime.send(payload jsonb, event text, topic text, private boolean);
DROP FUNCTION IF EXISTS realtime.quote_wal2json(entity regclass);
DROP FUNCTION IF EXISTS realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer);
DROP FUNCTION IF EXISTS realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]);
DROP FUNCTION IF EXISTS realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text);
DROP FUNCTION IF EXISTS realtime."cast"(val text, type_ regtype);
DROP FUNCTION IF EXISTS realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]);
DROP FUNCTION IF EXISTS realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text);
DROP FUNCTION IF EXISTS realtime.apply_rls(wal jsonb, max_record_bytes integer);
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.update_custom_crops_updated_at();
DROP FUNCTION IF EXISTS public.set_user_tier(p_user_id uuid, p_tier text);
DROP FUNCTION IF EXISTS public.list_all_users();
DROP FUNCTION IF EXISTS public.handle_new_user_credits();
DROP FUNCTION IF EXISTS public.grant_credits(p_user_id uuid, p_amount integer);
DROP FUNCTION IF EXISTS public.deduct_credits(p_user_id uuid, p_amount integer);
DROP FUNCTION IF EXISTS public.create_superadmin(p_email text, p_password text);
DROP FUNCTION IF EXISTS public.check_rotation_compliance(p_bed_id uuid, p_plant_family text);
DROP FUNCTION IF EXISTS public.calculate_harvest_stats(p_garden_id uuid, p_start_date date, p_end_date date);
DROP FUNCTION IF EXISTS public.admin_grant_credits(p_user_id uuid, p_amount integer);
DROP FUNCTION IF EXISTS pgbouncer.get_auth(p_usename text);
DROP FUNCTION IF EXISTS extensions.set_graphql_placeholder();
DROP FUNCTION IF EXISTS extensions.pgrst_drop_watch();
DROP FUNCTION IF EXISTS extensions.pgrst_ddl_watch();
DROP FUNCTION IF EXISTS extensions.grant_pg_net_access();
DROP FUNCTION IF EXISTS extensions.grant_pg_graphql_access();
DROP FUNCTION IF EXISTS extensions.grant_pg_cron_access();
DROP FUNCTION IF EXISTS auth.uid();
DROP FUNCTION IF EXISTS auth.role();
DROP FUNCTION IF EXISTS auth.jwt();
DROP FUNCTION IF EXISTS auth.email();
DROP TYPE IF EXISTS realtime.wal_rls;
DROP TYPE IF EXISTS realtime.wal_column;
DROP TYPE IF EXISTS realtime.user_defined_filter;
DROP TYPE IF EXISTS realtime.equality_op;
DROP TYPE IF EXISTS realtime.action;
DROP TYPE IF EXISTS auth.one_time_token_type;
DROP TYPE IF EXISTS auth.oauth_response_type;
DROP TYPE IF EXISTS auth.oauth_registration_type;
DROP TYPE IF EXISTS auth.oauth_client_type;
DROP TYPE IF EXISTS auth.oauth_authorization_status;
DROP TYPE IF EXISTS auth.factor_type;
DROP TYPE IF EXISTS auth.factor_status;
DROP TYPE IF EXISTS auth.code_challenge_method;
DROP TYPE IF EXISTS auth.aal_level;
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS supabase_vault;
DROP EXTENSION IF EXISTS pgcrypto;
DROP EXTENSION IF EXISTS pg_stat_statements;
DROP EXTENSION IF EXISTS pg_graphql;
DROP SCHEMA IF EXISTS vault;
DROP SCHEMA IF EXISTS supabase_functions;
DROP SCHEMA IF EXISTS storage;
DROP SCHEMA IF EXISTS realtime;
DROP SCHEMA IF EXISTS pgbouncer;
DROP EXTENSION IF EXISTS pg_net;
DROP SCHEMA IF EXISTS graphql_public;
DROP SCHEMA IF EXISTS graphql;
DROP SCHEMA IF EXISTS extensions;
DROP SCHEMA IF EXISTS auth;
DROP SCHEMA IF EXISTS _realtime;
--
-- TOC entry 10 (class 2615 OID 16658)
-- Name: _realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA _realtime;


--
-- TOC entry 38 (class 2615 OID 16457)
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- TOC entry 22 (class 2615 OID 16394)
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- TOC entry 36 (class 2615 OID 16574)
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- TOC entry 35 (class 2615 OID 16563)
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- TOC entry 2 (class 3079 OID 16659)
-- Name: pg_net; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;


--
-- TOC entry 4796 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pg_net; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_net IS 'Async HTTP';


--
-- TOC entry 12 (class 2615 OID 16386)
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- TOC entry 23 (class 2615 OID 16555)
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- TOC entry 39 (class 2615 OID 16505)
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- TOC entry 17 (class 2615 OID 16704)
-- Name: supabase_functions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_functions;


--
-- TOC entry 33 (class 2615 OID 16603)
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- TOC entry 7 (class 3079 OID 16639)
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- TOC entry 4797 (class 0 OID 0)
-- Dependencies: 7
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- TOC entry 3 (class 3079 OID 16515)
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- TOC entry 4798 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- TOC entry 4 (class 3079 OID 16406)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- TOC entry 4799 (class 0 OID 0)
-- Dependencies: 4
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 6 (class 3079 OID 16604)
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- TOC entry 4800 (class 0 OID 0)
-- Dependencies: 6
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- TOC entry 5 (class 3079 OID 16395)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- TOC entry 4801 (class 0 OID 0)
-- Dependencies: 5
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 1222 (class 1247 OID 25002)
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- TOC entry 1246 (class 1247 OID 25143)
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- TOC entry 1219 (class 1247 OID 24996)
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- TOC entry 1216 (class 1247 OID 24990)
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- TOC entry 1264 (class 1247 OID 25246)
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- TOC entry 1276 (class 1247 OID 25319)
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- TOC entry 1258 (class 1247 OID 25224)
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- TOC entry 1267 (class 1247 OID 25256)
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- TOC entry 1252 (class 1247 OID 25185)
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- TOC entry 1180 (class 1247 OID 17456)
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- TOC entry 1171 (class 1247 OID 17416)
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- TOC entry 1174 (class 1247 OID 17431)
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- TOC entry 1186 (class 1247 OID 17498)
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- TOC entry 1183 (class 1247 OID 17469)
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- TOC entry 500 (class 1255 OID 16503)
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- TOC entry 4802 (class 0 OID 0)
-- Dependencies: 500
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- TOC entry 459 (class 1255 OID 24972)
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- TOC entry 433 (class 1255 OID 16502)
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- TOC entry 4803 (class 0 OID 0)
-- Dependencies: 433
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- TOC entry 431 (class 1255 OID 16501)
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- TOC entry 4804 (class 0 OID 0)
-- Dependencies: 431
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- TOC entry 438 (class 1255 OID 16510)
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- TOC entry 4805 (class 0 OID 0)
-- Dependencies: 438
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- TOC entry 491 (class 1255 OID 16568)
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anopg_dump: creating COMMENT "extensions.FUNCTION grant_pg_graphql_access()"
pg_dump: creating FUNCTION "extensions.grant_pg_net_access()"
pg_dump: creating COMMENT "extensions.FUNCTION grant_pg_net_access()"
pg_dump: creating FUNCTION "extensions.pgrst_ddl_watch()"
pg_dump: creating FUNCTION "extensions.pgrst_drop_watch()"
pg_dump: creating FUNCTION "extensions.set_graphql_placeholder()"
pg_dump: creating COMMENT "extensions.FUNCTION set_graphql_placeholder()"
pg_dump: creating FUNCTION "pgbouncer.get_auth(text)"
pg_dump: creating FUNCTION "public.admin_grant_credits(uuid, integer)"
pg_dump: creating FUNCTION "public.calculate_harvest_stats(uuid, date, date)"
pg_dump: creating FUNCTION "public.check_rotation_compliance(uuid, text)"
pg_dump: creating FUNCTION "public.create_superadmin(text, text)"
pg_dump: creating FUNCTION "public.deduct_credits(uuid, integer)"
pg_dump: creating FUNCTION "public.grant_credits(uuid, integer)"
pg_dump: creating FUNCTION "public.handle_new_user_credits()"
pg_dump: creating FUNCTION "public.list_all_users()"
pg_dump: creating FUNCTION "public.set_user_tier(uuid, text)"
pg_dump: creating FUNCTION "public.update_custom_crops_updated_at()"
pg_dump: creating FUNCTION "public.update_updated_at_column()"
pg_dump: creating FUNCTION "realtime.apply_rls(jsonb, integer)"
n, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- TOC entry 4806 (class 0 OID 0)
-- Dependencies: 491
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- TOC entry 381 (class 1255 OID 16512)
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

    REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
    REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

    GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
  END IF;
END;
$$;


--
-- TOC entry 4807 (class 0 OID 0)
-- Dependencies: 381
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- TOC entry 440 (class 1255 OID 16559)
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- TOC entry 495 (class 1255 OID 16560)
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- TOC entry 489 (class 1255 OID 16570)
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- TOC entry 4808 (class 0 OID 0)
-- Dependencies: 489
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- TOC entry 467 (class 1255 OID 16387)
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


--
-- TOC entry 450 (class 1255 OID 18088)
-- Name: admin_grant_credits(uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_grant_credits(p_user_id uuid, p_amount integer) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  UPDATE profiles
  SET ai_credits_total = ai_credits_total + p_amount
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User % not found', p_user_id;
  END IF;
  
  INSERT INTO ai_credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, p_amount, 'bonus', 'Admin granted credits');
END;
$$;


--
-- TOC entry 424 (class 1255 OID 34191)
-- Name: calculate_harvest_stats(uuid, date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_harvest_stats(p_garden_id uuid, p_start_date date DEFAULT NULL::date, p_end_date date DEFAULT NULL::date) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
  v_total_kg DECIMAL(10, 2);
  v_harvest_count INTEGER;
  v_avg_rating DECIMAL(3, 2);
BEGIN
  SELECT 
    COALESCE(SUM(CASE WHEN unit = 'kg' THEN quantity WHEN unit = 'g' THEN quantity / 1000 ELSE 0 END), 0),
    COUNT(*),
    COALESCE(AVG(rating), 0)
  INTO v_total_kg, v_harvest_count, v_avg_rating
  FROM harvest_logs
  WHERE garden_id = p_garden_id
    AND (p_start_date IS NULL OR harvest_date >= p_start_date)
    AND (p_end_date IS NULL OR harvest_date <= p_end_date);
  
  RETURN jsonb_build_object(
    'totalKgProduced', v_total_kg,
    'harvestCount', v_harvest_count,
    'avgRating', v_avg_rating
  );
END;
$$;


--
-- TOC entry 434 (class 1255 OID 34190)
-- Name: check_rotation_compliance(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_rotation_compliance(p_bed_id uuid, p_plant_family text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
  v_last_planting RECORD;
  v_result JSONB;
BEGIN
  SELECT plant_family, plant_name, year, season
  INTO v_last_planting
  FROM bed_planting_history
  WHERE bed_id = p_bed_id
  ORDER BY year DESC, season DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'severity', 'SUCCESS',
      'message', 'Aiuola nuova - nessuna rotazione da rispettare'
    );
  END IF;
  
  IF v_last_planting.plant_family = p_plant_family THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'severity', 'ERROR',
      'message', format('Stessa famiglia botanica dell''anno scorso (%s). Rischio malattie!', v_last_planting.plant_name),
      'lastPlanting', jsonb_build_object(
        'plantName', v_last_planting.plant_name,
        'plantFamily', v_last_planting.plant_family,
        'year', v_last_planting.year,
        'season', v_last_planting.season
      )
    );
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'severity', 'SUCCESS',
    'message', format('Rotazione OK - ultima pianta: %s (%s)', v_last_planting.plant_name, v_last_planting.plant_family),
    'lastPlanting', jsonb_build_object(
      'plantName', v_last_planting.plant_name,
      'plantFamily', v_last_planting.plant_family,
      'year', v_last_planting.year,
      'season', v_last_planting.season
    )
  );
END;
$$;


--
-- TOC entry 456 (class 1255 OID 18086)
-- Name: create_superadmin(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_superadmin(p_email text, p_password text DEFAULT 'SuperAdmin123!'::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User % does not exist in auth.users. Please create the user via Supabase Auth API first.', p_email;
  END IF;
  
  INSERT INTO profiles (id, tier, ai_credits_total, ai_credits_used)
  VALUES (v_user_id, 'PRO', 999999, 0)
  ON CONFLICT (id) DO UPDATE
  SET tier = 'PRO',
      ai_credits_total = 999999,
      ai_credits_used = 0;
  
  RETURN v_user_id;
END;
$$;


--
-- TOC entry 482 (class 1255 OID 34192)
-- Name: deduct_credits(uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.deduct_credits(p_user_id uuid, p_amount integer) RETURNS void
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE profiles
  SET ai_credits_used = ai_credits_used + p_amount
  WHERE id = p_user_id
    AND (ai_credits_total - ai_credits_used) >= p_amount;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;
END;
$$;


--
-- TOC entry 420 (class 1255 OID 34193)
-- Name: grant_credits(uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.grant_credits(p_user_id uuid, p_amount integer) RETURNS void
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE profiles
  SET ai_credits_total = ai_credits_total + p_amount
  WHERE id = p_user_id;
END;
$$;


--
-- TOC entry 474 (class 1255 OID 34194)
-- Name: handle_new_user_credits(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user_credits() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  INSERT INTO profiles (id, tier, ai_credits_total, ai_credits_used)
  VALUES (NEW.id, 'FREE', 3, 0)
  ON CONFLICT (id) DO NOTHING;
  
  IF NOT EXISTS (SELECT 1 FROM ai_credit_transactions 
                 WHERE user_id = NEW.id AND type = 'bonus' AND description LIKE '%Welcome%') THEN
    PERFORM grant_credits(NEW.id, 3);
    
    INSERT INTO ai_credit_transactions (user_id, amount, type, description)
    VALUES (NEW.id, 3, 'bonus', 'Welcome bonus - 3 free AI credits');
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- TOC entry 497 (class 1255 OID 18089)
-- Name: list_all_users(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.list_all_users() RETURNS TABLE(user_id uuid, email text, tier text, credits_total integer, credits_used integer, created_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    COALESCE(p.tier, 'FREE')::TEXT as tier,
    COALESCE(p.ai_credits_total, 0) as credits_total,
    COALESCE(p.ai_credits_used, 0) as credits_used,
    u.created_at
  FROM auth.users u
  LEFT JOIN profiles p ON p.id = u.id
  ORDER BY u.created_at DESC;
END;
$$;


--
-- TOC entry 403 (class 1255 OID 18087)
-- Name: set_user_tier(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_user_tier(p_user_id uuid, p_tier text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  IF p_tier NOT IN ('FREE', 'PLUS', 'PRO', 'PRO_CONSUMER', 'PRO_PROFESSIONAL') THEN
    RAISE EXCEPTION 'Invalid tier: %. Must be FREE, PLUS, PRO (or legacy PRO_CONSUMER, PRO_PROFESSIONAL)', p_tier;
  END IF;
  
  INSERT INTO profiles (id, tier)
  VALUES (p_user_id, p_tier::TEXT)
  ON CONFLICT (id) DO UPDATE
  SET tier = p_tier::TEXT,
      updated_at = NOW();
END;
$$;


--
-- TOC entry 386 (class 1255 OID 34436)
-- Name: update_custom_crops_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_custom_crops_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- TOC entry 479 (class 1255 OID 34189)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- TOC entry 469 (class 1255 OID 17491)
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns pg_dump: creating FUNCTION "realtime.broadcast_changes(text, text, text, text, text, record, record, text)"
pg_dump: creating FUNCTION "realtime.build_prepared_statement_sql(text, regclass, realtime.wal_column[])"
pg_dump: creating FUNCTION "realtime.cast(text, regtype)"
pg_dump: creating FUNCTION "realtime.check_equality_op(realtime.equality_op, regtype, text, text)"
pg_dump: creating FUNCTION "realtime.is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[])"
pg_dump: creating FUNCTION "realtime.list_changes(name, name, integer, integer)"
=
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- TOC entry 392 (class 1255 OID 17570)
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- TOC entry 481 (class 1255 OID 17503)
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- TOC entry 477 (class 1255 OID 17453)
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- TOC entry 487 (class 1255 OID 17448)
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- TOC entry 436 (class 1255 OID 17499)
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- TOC entry 398 (class 1255 OID 17510)
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := pg_dump: creating FUNCTION "realtime.quote_wal2json(regclass)"
pg_dump: creating FUNCTION "realtime.send(jsonb, text, text, boolean)"
pg_dump: creating FUNCTION "realtime.subscription_check_filters()"
pg_dump: creating FUNCTION "realtime.to_regrole(text)"
pg_dump: creating FUNCTION "realtime.topic()"
pg_dump: creating FUNCTION "supabase_functions.http_request()"
pg_dump: creating TABLE "_realtime.extensions"
pg_dump: creating TABLE "_realtime.schema_migrations"
pg_dump: creating TABLE "_realtime.tenants"
pg_dump: creating TABLE "auth.audit_log_entries"
pg_dump: creating COMMENT "auth.TABLE audit_log_entries"
pg_dump: creating TABLE "auth.flow_state"
pg_dump: creating COMMENT "auth.TABLE flow_state"
pg_dump: creating TABLE "auth.identities"
pg_dump: creating COMMENT "auth.TABLE identities"
pg_dump: creating COMMENT "auth.COLUMN identities.email"
pg_dump: creating TABLE "auth.instances"
pg_dump: creating COMMENT "auth.TABLE instances"
pg_dump: creating TABLE "auth.mfa_amr_claims"
pg_dump: creating COMMENT "auth.TABLE mfa_amr_claims"
pg_dump: creating TABLE "auth.mfa_challenges"
pg_dump: creating COMMENT "auth.TABLE mfa_challenges"
pg_dump: creating TABLE "auth.mfa_factors"
pg_dump: creating COMMENT "auth.TABLE mfa_factors"
pg_dump: creating COMMENT "auth.COLUMN mfa_factors.last_webauthn_challenge_data"
pg_dump: creating TABLE "auth.oauth_authorizations"
pg_dump: creating TABLE "auth.oauth_clients"
w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- TOC entry 488 (class 1255 OID 17447)
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- TOC entry 447 (class 1255 OID 17569)
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- TOC entry 454 (class 1255 OID 17445)
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- TOC entry 465 (class 1255 OID 17480)
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- TOC entry 407 (class 1255 OID 17563)
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- TOC entry 444 (class 1255 OID 16728)
-- Name: http_request(); Type: FUNCTION; Schema: supabase_functions; Owner: -
--

CREATE FUNCTION supabase_functions.http_request() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'supabase_functions'
    AS $$
  DECLARE
    request_id bigint;
    payload jsonb;
    url text := TG_ARGV[0]::text;
    method text := TG_ARGV[1]::text;
    headers jsonb DEFAULT '{}'::jsonb;
    params jsonb DEFAULT '{}'::jsonb;
    timeout_ms integer DEFAULT 1000;
  BEGIN
    IF url IS NULL OR url = 'null' THEN
      RAISE EXCEPTION 'url argument is missing';
    END IF;

    IF method IS NULL OR method = 'null' THEN
      RAISE EXCEPTION 'method argument is missing';
    END IF;

    IF TG_ARGV[2] IS NULL OR TG_ARGV[2] = 'null' THEN
      headers = '{"Content-Type": "application/json"}'::jsonb;
    ELSE
      headers = TG_ARGV[2]::jsonb;
    END IF;

    IF TG_ARGV[3] IS NULL OR TG_ARGV[3] = 'null' THEN
      params = '{}'::jsonb;
    ELSE
      params = TG_ARGV[3]::jsonb;
    END IF;

    IF TG_ARGV[4] IS NULL OR TG_ARGV[4] = 'null' THEN
      timeout_ms = 1000;
    ELSE
      timeout_ms = TG_ARGV[4]::integer;
    END IF;

    CASE
      WHEN method = 'GET' THEN
        SELECT http_get INTO request_id FROM net.http_get(
          url,
          params,
          headers,
          timeout_ms
        );
      WHEN method = 'POST' THEN
        payload = jsonb_build_object(
          'old_record', OLD,
          'record', NEW,
          'type', TG_OP,
          'table', TG_TABLE_NAME,
          'schema', TG_TABLE_SCHEMA
        );

        SELECT http_post INTO request_id FROM net.http_post(
          url,
          payload,
          params,
          headers,
          timeout_ms
        );
      ELSE
        RAISE EXCEPTION 'method argument % is invalid', method;
    END CASE;

    INSERT INTO supabase_functions.hooks
      (hook_table_id, hook_name, request_id)
    VALUES
      (TG_RELID, TG_NAME, request_id);

    RETURN NEW;
  END
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 319 (class 1259 OID 17017)
-- Name: extensions; Type: TABLE; Schema: _realtime; Owner: -
--

CREATE TABLE _realtime.extensions (
    id uuid NOT NULL,
    type text,
    settings jsonb,
    tenant_external_id text,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL
);


--
-- TOC entry 317 (class 1259 OID 16738)
-- Name: schema_migrations; Type: TABLE; Schema: _realtime; Owner: -
--

CREATE TABLE _realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- TOC entry 318 (class 1259 OID 16990)
-- Name: tenants; Type: TABLE; Schema: _realtime; Owner: -
--

CREATE TABLE _realtime.tenants (
    id uuid NOT NULL,
    name text,
    external_id text,
    jwt_secret text,
    max_concurrent_users integer DEFAULT 200 NOT NULL,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL,
    max_events_per_second integer DEFAULT 100 NOT NULL,
    postgres_cdc_default text DEFAULT 'postgres_cdc_rls'::text,
    max_bytes_per_second integer DEFAULT 100000 NOT NULL,
    max_channels_per_client integer DEFAULT 100 NOT NULL,
    max_joins_per_second integer DEFAULT 500 NOT NULL,
    suspend boolean DEFAULT false,
    jwt_jwks jsonb,
    notify_private_alpha boolean DEFAULT false,
    private_only boolean DEFAULT false NOT NULL,
    migrations_ran integer DEFAULT 0,
    broadcast_adapter character varying(255) DEFAULT 'gen_rpc'::character varying,
    max_presence_events_per_second integer DEFAULT 1000,
    max_payload_size_in_kb integer DEFAULT 3000
);


--
-- TOC entry 302 (class 1259 OID 16488)
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- TOC entry 4809 (class 0 OID 0)
-- Dependencies: 302
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- TOC entry 341 (class 1259 OID 25147)
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- TOC entry 4810 (class 0 OID 0)
-- Dependencies: 341
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- TOC entry 332 (class 1259 OID 24944)
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 4811 (class 0 OID 0)
-- Dependencies: 332
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- TOC entry 4812 (class 0 OID 0)
-- Dependencies: 332
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- TOC entry 301 (class 1259 OID 16481)
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- TOC entry 4813 (class 0 OID 0)
-- Dependencies: 301
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- TOC entry 336 (class 1259 OID 25034)
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- TOC entry 4814 (class 0 OID 0)
-- Dependencies: 336
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- TOC entry 335 (class 1259 OID 25022)
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- TOC entry 4815 (class 0 OID 0)
-- Dependencies: 335
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- TOC entry 334 (class 1259 OID 25009)
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- TOC entry 4816 (class 0 OID 0)
-- Dependencies: 334
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- TOC entry 4817 (class 0 OID 0)
-- Dependencies: 334
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- TOC entry 344 (class 1259 OID 25259)
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- TOC entry 343 (class 1259 OID 25229)
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (pg_dump: creating TABLE "auth.oauth_consents"
pg_dump: creating TABLE "auth.one_time_tokens"
pg_dump: creating TABLE "auth.refresh_tokens"
pg_dump: creating COMMENT "auth.TABLE refresh_tokens"
pg_dump: creating SEQUENCE "auth.refresh_tokens_id_seq"
pg_dump: creating SEQUENCE OWNED BY "auth.refresh_tokens_id_seq"
pg_dump: creating TABLE "auth.saml_providers"
pg_dump: creating COMMENT "auth.TABLE saml_providers"
pg_dump: creating TABLE "auth.saml_relay_states"
pg_dump: creating COMMENT "auth.TABLE saml_relay_states"
pg_dump: creating TABLE "auth.schema_migrations"
pg_dump: creating COMMENT "auth.TABLE schema_migrations"
pg_dump: creating TABLE "auth.sessions"
pg_dump: creating COMMENT "auth.TABLE sessions"
pg_dump: creating COMMENT "auth.COLUMN sessions.not_after"
pg_dump: creating COMMENT "auth.COLUMN sessions.refresh_token_hmac_key"
pg_dump: creating COMMENT "auth.COLUMN sessions.refresh_token_counter"
pg_dump: creating TABLE "auth.sso_domains"
pg_dump: creating COMMENT "auth.TABLE sso_domains"
pg_dump: creating TABLE "auth.sso_providers"
pg_dump: creating COMMENT "auth.TABLE sso_providers"
pg_dump: creating COMMENT "auth.COLUMN sso_providers.resource_id"
pg_dump: creating TABLE "auth.users"
pg_dump: creating COMMENT "auth.TABLE users"
pg_dump: creating COMMENT "auth.COLUMN users.is_sso_user"
pg_dump: creating TABLE "public.agronomist_advice"
pg_dump: creating TABLE "public.agronomist_consultations"
pg_dump: creating TABLE "public.agronomists"
pg_dump: creating TABLE "public.ai_credit_transactions"
pg_dump: creating TABLE "public.aquaponic_readings"
pg_dump: creating TABLE "public.bed_planting_history"
pg_dump: creating TABLE "public.calendar_tasks"
pg_dump: creating TABLE "public.challenge_completions"

    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048))
);


--
-- TOC entry 345 (class 1259 OID 25292)
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- TOC entry 342 (class 1259 OID 25197)
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- TOC entry 300 (class 1259 OID 16470)
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- TOC entry 4818 (class 0 OID 0)
-- Dependencies: 300
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- TOC entry 299 (class 1259 OID 16469)
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4819 (class 0 OID 0)
-- Dependencies: 299
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- TOC entry 339 (class 1259 OID 25076)
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- TOC entry 4820 (class 0 OID 0)
-- Dependencies: 339
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- TOC entry 340 (class 1259 OID 25094)
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- TOC entry 4821 (class 0 OID 0)
-- Dependencies: 340
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- TOC entry 303 (class 1259 OID 16496)
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- TOC entry 4822 (class 0 OID 0)
-- Dependencies: 303
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- TOC entry 333 (class 1259 OID 24974)
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


--
-- TOC entry 4823 (class 0 OID 0)
-- Dependencies: 333
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- TOC entry 4824 (class 0 OID 0)
-- Dependencies: 333
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- TOC entry 4825 (class 0 OID 0)
-- Dependencies: 333
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- TOC entry 4826 (class 0 OID 0)
-- Dependencies: 333
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- TOC entry 338 (class 1259 OID 25061)
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- TOC entry 4827 (class 0 OID 0)
-- Dependencies: 338
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- TOC entry 337 (class 1259 OID 25052)
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- TOC entry 4828 (class 0 OID 0)
-- Dependencies: 337
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- TOC entry 4829 (class 0 OID 0)
-- Dependencies: 337
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- TOC entry 298 (class 1259 OID 16458)
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- TOC entry 4830 (class 0 OID 0)
-- Dependencies: 298
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- TOC entry 4831 (class 0 OID 0)
-- Dependencies: 298
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- TOC entry 359 (class 1259 OID 33715)
-- Name: agronomist_advice; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agronomist_advice (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    consultation_id uuid NOT NULL,
    task_id uuid,
    advice_text text NOT NULL,
    category text,
    priority text,
    apply_date date,
    apply_season jsonb,
    applied boolean DEFAULT false,
    applied_date date,
    result text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT agronomist_advice_category_check CHECK ((category = ANY (ARRAY['Fertilization'::text, 'Pruning'::text, 'Irrigation'::text, 'Disease'::text, 'Harvest'::text, 'Other'::text]))),
    CONSTRAINT agronomist_advice_priority_check CHECK ((priority = ANY (ARRAY['High'::text, 'Medium'::text, 'Low'::text])))
);


--
-- TOC entry 358 (class 1259 OID 33682)
-- Name: agronomist_consultations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agronomist_consultations (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    agronomist_id uuid NOT NULL,
    user_id uuid NOT NULL,
    garden_id uuid,
    task_id uuid,
    date date NOT NULL,
    consultation_type text,
    topic text NOT NULL,
    advice jsonb,
    notes text,
    attachments jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT agronomist_consultations_consultation_type_check CHECK ((consultation_type = ANY (ARRAY['InPerson'::text, 'Phone'::text, 'Email'::text, 'Video'::text])))
);


--
-- TOC entry 357 (class 1259 OID 33664)
-- Name: agronomists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agronomists (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    specialization jsonb,
    notes text,
    preferred_contact_method text,
    consultation_frequency text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT agronomists_consultation_frequency_check CHECK ((consultation_frequency = ANY (ARRAY['Weekly'::text, 'Monthly'::text, 'Seasonal'::text, 'OnDemand'::text]))),
    CONSTRAINT agronomists_preferred_contact_method_check CHECK ((preferred_contact_method = ANY (ARRAY['Email'::text, 'Phone'::text, 'InPerson'::text])))
);


--
-- TOC entry 368 (class 1259 OID 33911)
-- Name: ai_credit_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_credit_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    amount integer NOT NULL,
    type text NOT NULL,
    feature text,
    description text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT ai_credit_transactions_type_check CHECK ((type = ANY (ARRAY['monthly_grant'::text, 'purchase'::text, 'usage'::text, 'bonus'::text, 'refund'::text])))
);


--
-- TOC entry 363 (class 1259 OID 33805)
-- Name: aquaponic_readings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.aquaponic_readings (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    reading_date timestamp with time zone DEFAULT now(),
    ph numeric(3,2),
    ammonia numeric(5,2),
    nitrite numeric(5,2),
    nitrate numeric(5,2),
    water_temperature numeric(4,1),
    dissolved_oxygen numeric(4,2),
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT aquaponic_readings_ph_check CHECK (((ph >= (0)::numeric) AND (ph <= (14)::numeric)))
);


--
-- TOC entry 349 (class 1259 OID 33476)
-- Name: bed_planting_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bed_planting_history (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    bed_id uuid NOT NULL,
    plant_id text NOT NULL,
    plant_name text NOT NULL,
    plant_family text NOT NULL,
    season text NOT NULL,
    year integer NOT NULL,
    planted_at timestamp with time zone,
    harvested_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT bed_planting_history_season_check CHECK ((season = ANY (ARRAY['Summer'::text, 'Winter'::text])))
);


--
-- TOC entry 364 (class 1259 OID 33822)
-- Name: calendar_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendar_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    garden_id uuid,
    title text NOT NULL,
    type text NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    recurring boolean DEFAULT false,
    recurring_pattern jsonb,
    plant_id uuid,
    plant_name text,
    completed boolean DEFAULT false,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT calendar_tasks_type_check CHECK ((type = ANY (ARRAY['semina'::text, 'irrigazione'::text, 'raccolta'::text, 'potatura'::text, 'concimazione'::text, 'trattamento'::text, 'altro'::text])))
);


--
-- TOC entry 365 (class 1259 OID 33848)
-- Name: challenge_completions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.challenge_completions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    challenge_id text NOT NULL,
    completed_at timestamp with time zone DEFAULT now(),
    actions_completed integer[],
    photo_url text,
    points_awardepg_dump: creating TABLE "public.crop_learning_events"
pg_dump: creating TABLE "public.crop_mechanical_works"
pg_dump: creating TABLE "public.custom_crops"
pg_dump: creating TABLE "public.custom_plans"
pg_dump: creating TABLE "public.garden_accessories"
pg_dump: creating TABLE "public.garden_beds"
pg_dump: creating TABLE "public.garden_correlations"
pg_dump: creating COMMENT "public.COLUMN garden_correlations.custom_crop_id"
pg_dump: creating TABLE "public.garden_obstacles"
pg_dump: creating TABLE "public.garden_patterns"
pg_dump: creating COMMENT "public.COLUMN garden_patterns.custom_crop_id"
pg_dump: creating TABLE "public.garden_season_analyses"
pg_dump: creating TABLE "public.garden_tasks"
pg_dump: creating TABLE "public.garden_tree_memories"
pg_dump: creating TABLE "public.garden_zone_memories"
pg_dump: creating COMMENT "public.COLUMN garden_zone_memories.custom_crop_id"
pg_dump: creating TABLE "public.gardens"
pg_dump: creating TABLE "public.harvest_logs"
d integer NOT NULL,
    badge_earned text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 374 (class 1259 OID 34045)
-- Name: crop_learning_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crop_learning_events (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    custom_crop_id uuid,
    user_id uuid NOT NULL,
    garden_id uuid,
    event_type text NOT NULL,
    event_data jsonb NOT NULL,
    outcome jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crop_learning_events_event_type_check CHECK ((event_type = ANY (ARRAY['planting'::text, 'harvest'::text, 'work'::text, 'treatment'::text, 'problem'::text, 'fertilize'::text])))
);


--
-- TOC entry 372 (class 1259 OID 34004)
-- Name: crop_mechanical_works; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crop_mechanical_works (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    crop_id text NOT NULL,
    crop_name text NOT NULL,
    work_type text NOT NULL,
    priority integer DEFAULT 0,
    timing jsonb,
    equipment_suggested text[],
    critical boolean DEFAULT false,
    frequency text,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crop_mechanical_works_priority_check CHECK (((priority >= 0) AND (priority <= 10)))
);


--
-- TOC entry 373 (class 1259 OID 34019)
-- Name: custom_crops; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.custom_crops (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    garden_id uuid,
    common_name text NOT NULL,
    scientific_name text,
    family text,
    initial_data jsonb DEFAULT '{}'::jsonb,
    learned_patterns jsonb DEFAULT '{}'::jsonb,
    stats jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 356 (class 1259 OID 33640)
-- Name: custom_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.custom_plans (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    garden_id uuid,
    name text NOT NULL,
    description text,
    base_master_sheet_id text NOT NULL,
    overrides jsonb,
    custom_notes jsonb,
    custom_methods jsonb,
    additional_parameters jsonb,
    is_public boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 361 (class 1259 OID 33765)
-- Name: garden_accessories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.garden_accessories (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    support_type text,
    netting_type text,
    wire_type text,
    material text NOT NULL,
    quantity integer,
    length_cm integer,
    height_cm integer,
    width_cm integer,
    diameter_cm integer,
    mesh_size_mm integer,
    used_for jsonb,
    installation_date date,
    expected_lifespan_years integer,
    last_maintenance date,
    needs_replacement boolean DEFAULT false,
    "position" jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT garden_accessories_category_check CHECK ((category = ANY (ARRAY['Support'::text, 'Netting'::text, 'Wire'::text, 'Structure'::text]))),
    CONSTRAINT garden_accessories_material_check CHECK ((material = ANY (ARRAY['Wood'::text, 'Steel'::text, 'Plastic'::text, 'Bamboo'::text, 'Cane'::text, 'Aluminum'::text, 'Polyethylene'::text, 'Polypropylene'::text]))),
    CONSTRAINT garden_accessories_netting_type_check CHECK ((netting_type = ANY (ARRAY['Shade'::text, 'Hail'::text, 'Insect'::text, 'Harvest'::text]))),
    CONSTRAINT garden_accessories_support_type_check CHECK ((support_type = ANY (ARRAY['Stake'::text, 'Tutor'::text, 'Trellis'::text, 'Cage'::text]))),
    CONSTRAINT garden_accessories_wire_type_check CHECK ((wire_type = ANY (ARRAY['Steel'::text, 'Plastic'::text])))
);


--
-- TOC entry 348 (class 1259 OID 33445)
-- Name: garden_beds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.garden_beds (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    name text NOT NULL,
    bed_type text,
    shape text,
    length_cm numeric(8,2),
    width_cm numeric(8,2),
    diameter_cm numeric(8,2),
    size_sq_meters numeric(5,2),
    sun_exposure text,
    daily_sun_hours integer,
    aspect_direction text,
    soil_type text,
    structure_id uuid,
    structure_type text,
    is_covered boolean DEFAULT false,
    covering_structure_id uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT garden_beds_bed_type_check CHECK ((bed_type = ANY (ARRAY['RaisedBed'::text, 'Container'::text, 'Pot'::text, 'Ground'::text, 'Greenhouse'::text, 'Hydroponic'::text, 'Aquaponic'::text, 'Aeroponic'::text, 'Indoor'::text]))),
    CONSTRAINT garden_beds_shape_check CHECK ((shape = ANY (ARRAY['Rectangle'::text, 'Circle'::text, 'Custom'::text]))),
    CONSTRAINT garden_beds_structure_type_check CHECK ((structure_type = ANY (ARRAY['Greenhouse'::text, 'Hydroponic'::text, 'Aquaponic'::text, 'Aeroponic'::text, 'Indoor'::text]))),
    CONSTRAINT garden_beds_sun_exposure_check CHECK ((sun_exposure = ANY (ARRAY['FullSun'::text, 'PartSun'::text, 'Shade'::text])))
);


--
-- TOC entry 378 (class 1259 OID 34142)
-- Name: garden_correlations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.garden_correlations (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    correlation_type text NOT NULL,
    custom_crop_id uuid,
    factor_a text NOT NULL,
    factor_b text NOT NULL,
    strength numeric(3,2) DEFAULT 0.5,
    correlation_data jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT garden_correlations_strength_check CHECK (((strength >= (0)::numeric) AND (strength <= (1)::numeric)))
);


--
-- TOC entry 4832 (class 0 OID 0)
-- Dependencies: 378
-- Name: COLUMN garden_correlations.custom_crop_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.garden_correlations.custom_crop_id IS 'Riferimento a coltura personalizzata per cui è stata identificata la correlazione';


--
-- TOC entry 360 (class 1259 OID 33739)
-- Name: garden_obstacles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.garden_obstacles (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    azimuth numeric(5,2) NOT NULL,
    height_meters numeric(6,2) NOT NULL,
    distance_meters numeric(6,2) NOT NULL,
    width_degrees numeric(5,2) DEFAULT 30,
    type text DEFAULT 'Other'::text,
    source text DEFAULT 'manual'::text,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT garden_obstacles_azimuth_check CHECK (((azimuth >= (0)::numeric) AND (azimuth <= (360)::numeric))),
    CONSTRAINT garden_obstacles_distance_meters_check CHECK ((distance_meters > (0)::numeric)),
    CONSTRAINT garden_obstacles_height_meters_check CHECK ((height_meters > (0)::numeric)),
    CONSTRAINT garden_obstacles_source_check CHECK ((source = ANY (ARRAY['photo_360'::text, 'manual'::text, 'ai_analysis'::text]))),
    CONSTRAINT garden_obstacles_type_check CHECK ((type = ANY (ARRAY['Building'::text, 'Tree'::text, 'Mountain'::text, 'Other'::text]))),
    CONSTRAINT garden_obstacles_width_degrees_check CHECK (((width_degrees > (0)::numeric) AND (width_degrees <= (180)::numeric)))
);


--
-- TOC entry 377 (class 1259 OID 34120)
-- Name: garden_patterns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.garden_patterns (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    pattern_type text NOT NULL,
    custom_crop_id uuid,
    pattern_data jsonb NOT NULL,
    confidence numeric(3,2) DEFAULT 0.5,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT garden_patterns_confidence_check CHECK (((confidence >= (0)::numeric) AND (confidence <= (1)::numeric)))
);


--
-- TOC entry 4833 (class 0 OID 0)
-- Dependencies: 377
-- Name: COLUMN garden_patterns.custom_crop_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.garden_patterns.custom_crop_id IS 'Riferimento a coltura personalizzata per cui è stato identificato il pattern';


--
-- TOC entry 379 (class 1259 OID 34163)
-- Name: garden_season_analyses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.garden_season_analyses (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    season text NOT NULL,
    year integer NOT NULL,
    analysis_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT garden_season_analyses_season_check CHECK ((season = ANY (ARRAY['Spring'::text, 'Summer'::text, 'Fall'::text, 'Winter'::text])))
);


--
-- TOC entry 350 (class 1259 OID 33494)
-- Name: garden_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.garden_tasks (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    bed_id uuid,
    plant_name text NOT NULL,
    variety text,
    planting_method text,
    location_type text,
    initial_quantity integer,
    current_quantity integer,
    task_type text NOT NULL,
    stage text,
    lifecycle_state text,
    season text,
    date date NOT NULL,
    expected_transplant_date date,
    moon_phase text,
    completed boolean DEFAULT false,
    notes text,
    next_due_date date,
    treatment_product_id text,
    grid_position jsonb,
    grid_rotation integer,
    user_responses jsonb,
    recorded_brix numeric(4,2),
    harvest_ready_analysis text,
    harvest_history jsonb,
    final_harvest jsonb,
    strawberry_data jsonb,
    fruit_tree_data jsonb,
    aromatic_data jsonb,
    olive_data jsonb,
    vine_data jsonb,
    exotic_fruit_data jsonb,
    mechanical_work_data jsonb,
    tree_pruning_data jsonb,
    hydroponic_data jsonb,
    aquaponic_data jsonb,
    aeroponic_data jsonb,
    suggested_date date,
    actual_completed_date timestamp with time zone,
    is_suggested boolean DEFAULT false,
    suggested_by text,
    images jsonb,
    last_photo_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    CONSTRAINT garden_tasks_grid_rotation_check CHECK (((grid_rotation >= 0) AND (grid_rotation <= 360))),
    CONSTRAINT garden_tasks_lifecycle_state_check CHECK ((lifecycle_state = ANY (ARRAY['Sowing'::text, 'Germination'::text, 'Nursing'::text, 'Hardening'::text, 'Transplanting'::text, 'Production'::text]))),
    CONSTRAINT garden_tasks_location_type_check CHECK ((location_type = ANY (ARRAY['Pot'::text, 'Ground'::text, 'RaisedBed'::text, 'HydroponicNFT'::text, 'HydroponicDWC'::text, 'HydroponicEbbFlow'::text, 'HydroponicDrip'::text, 'HydroponicWick'::text, 'HydroponicKratky'::text, 'Aquaponic'::text, 'Aeroponic'::text, 'Indoor'::text]))),
    CONSTRAINT garden_tasks_moon_phase_check CHECK ((moon_phase = ANY (ARRAY['New'::text, 'WaxingCrescent'::text, 'FirstQuarter'::text, 'WaxingGibbous'::text, 'Full'::text, 'WaningGibbous'::text, 'LastQuarter'::text, 'WaningCrescent'::text]))),
    CONSTRAINT garden_tasks_planting_method_check CHECK ((planting_method = ANY (ARRAY['Seed'::text, 'Seedling'::text]))),
    CONSTRAINT garden_tasks_season_check CHECK ((season = ANY (ARRAY['Summer'::text, 'Winter'::text]))),
    CONSTRAINT garden_tasks_stage_check CHECK ((stage = ANY (ARRAY['Germination'::text, 'Vegetative'::text, 'ReadyToTransplant'::text, 'Flowering'::text, 'Fruiting'::text, 'Harvested'::text]))),
    CONSTRAINT garden_tasks_task_type_check CHECK ((task_type = ANY (ARRAY['Sowing'::text, 'Transplant'::text, 'Fertilize'::text, 'Prune'::text, 'Harvest'::text, 'Treatment'::text, 'Plowing'::text, 'Tilling'::text, 'TreePruning'::text])))
);


--
-- TOC entry 376 (class 1259 OID 34097)
-- Name: garden_tree_memories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.garden_tree_memories (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    tree_id uuid,
    tree_name text NOT NULL,
    custom_crop_id uuid,
    production_history jsonb DEFAULT '[]'::jsonb,
    alternance_pattern jsonb DEFAULT '{}'::jsonb,
    pruning_history jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 375 (class 1259 OID 34074)
-- Name: garden_zone_memories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.garden_zone_memories (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    zone_id uuid,
    zone_name text,
    custom_crop_id uuid,
    planting_history jsonb DEFAULT '[]'::jsonb,
    patterns jsonb DEFAULT '{}'::jsonb,
    correlations jsonb DEFAULT '[]'::jsonb,
    last_updated timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 4834 (class 0 OID 0)
-- Dependencies: 375
-- Name: COLUMN garden_zone_memories.custom_crop_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.garden_zone_memories.custom_crop_id IS 'Riferimento a coltura personalizzata (se applicabile)';


--
-- TOC entry 347 (class 1259 OID 33416)
-- Name: gardens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gardens (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    coordinates jsonb,
    size_sq_meters numeric(10,2) DEFAULT 0 NOT NULL,
    size_unit text DEFAULT 'sqm'::text,
    soil_type text,
    soil_ph numeric(3,1),
    altitude_meters integer,
    delay_factor_days integer,
    sun_exposure text,
    daily_sun_hours integer,
    aspect_direction text,
    wind_protection text,
    has_compost_bin boolean DEFAULT false,
    is_raised_bed boolean DEFAULT false,
    garden_type text,
    greenhouse_config jsonb,
    indoor_config jsonb,
    hydroponic_config jsonb,
    aquaponic_config jsonb,
    aeroponic_config jsonb,
    vacation_mode jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT gardens_aspect_direction_check CHECK ((aspect_direction = ANY (ARRAY['North'::text, 'South'::text, 'East'::text, 'West'::text, 'Flat'::text]))),
    CONSTRAINT gardens_daily_sun_hours_check CHECK (((daily_sun_hours >= 0) AND (daily_sun_hours <= 24))),
    CONSTRAINT gardens_garden_type_check CHECK ((garden_type = ANY (ARRAY['OpenField'::text, 'Greenhouse'::text, 'Tunnel'::text, 'RaisedBed'::text, 'Indoor'::text, 'Hydroponic'::text, 'Aquaponic'::text, 'Aeroponic'::text, 'NFT'::text, 'DWC'::text, 'EbbFlow'::text, 'Drip'::text, 'Wick'::text, 'Kratky'::text]))),
    CONSTRAINT gardens_size_unit_check CHECK ((size_unit = ANY (ARRAY['sqm'::text, 'are'::text, 'hectare'::text]))),
    CONSTRAINT gardens_soil_ph_check CHECK (((soil_ph >= (0)::numeric) AND (soil_ph <= (14)::numeric))),
    CONSTRAINT gardens_soil_type_check CHECK ((soil_type = ANY (ARRAY['Clay'::text, 'Sandy'::text, 'Loamy'::text, 'Peaty'::text, 'Chalky'::text, 'Silty'::text]))),
    CONSTRAINT gardens_sun_exposure_check CHECK ((sun_exposure = ANY (ARRAY['FullSun'::text, 'PartSun'::text, 'Shade'::text]))),
    CONSTRAINT gardens_wind_protection_check CHECK ((wind_protection = ANY (ARRAY['High'::text, 'Medium'::text, 'Low'::text])))
);


--
-- TOC entry 351 (class 1259 OID 33531)
-- Name: harvest_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.harvest_logs (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    task_id uuid,
    plant_name text NOT NULL,
    quantity numeric(8,2) NOT NULL,
    unit text DEFAULT 'kg'::text NOT NULL,
    rating integer,
    harvest_date date NOT NULL,
    photo text,
    brix numeric(4,2),
    notes text,
    suggested_recipes jsonb,
    strawbpg_dump: creating TABLE "public.hydroponic_readings"
pg_dump: creating TABLE "public.mechanical_work_register"
pg_dump: creating TABLE "public.photo_logs"
pg_dump: creating TABLE "public.professional_analytics"
pg_dump: creating TABLE "public.profiles"
pg_dump: creating TABLE "public.seed_inventory"
pg_dump: creating TABLE "public.seedling_batches"
pg_dump: creating TABLE "public.treatment_register"
pg_dump: creating TABLE "public.user_badges"
pg_dump: creating TABLE "public.weather_cache"
pg_dump: creating TABLE "realtime.messages"
pg_dump: creating TABLE "realtime.messages_2025_12_14"
pg_dump: creating TABLE "realtime.messages_2025_12_15"
pg_dump: creating TABLE "realtime.messages_2025_12_16"
pg_dump: creating TABLE "realtime.messages_2025_12_17"
pg_dump: creating TABLE "realtime.messages_2025_12_18"
pg_dump: creating TABLE "realtime.messages_2025_12_19"
pg_dump: creating TABLE "realtime.messages_2025_12_20"
pg_dump: creating TABLE "realtime.schema_migrations"
pg_dump: creating TABLE "realtime.subscription"
pg_dump: creating SEQUENCE "realtime.subscription_id_seq"
pg_dump: creating TABLE "supabase_functions.hooks"
pg_dump: creating COMMENT "supabase_functions.TABLE hooks"
pg_dump: creating SEQUENCE "supabase_functions.hooks_id_seq"
pg_dump: creating SEQUENCE OWNED BY "supabase_functions.hooks_id_seq"
pg_dump: creating TABLE "supabase_functions.migrations"
pg_dump: creating TABLE ATTACH "realtime.messages_2025_12_14"
pg_dump: creating TABLE ATTACH "realtime.messages_2025_12_15"
pg_dump: creating TABLE ATTACH "realtime.messages_2025_12_16"
pg_dump: creating TABLE ATTACH "realtime.messages_2025_12_17"
erry_harvest jsonb,
    fruit_tree_harvest jsonb,
    aromatic_harvest jsonb,
    olive_harvest jsonb,
    vine_harvest jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT harvest_logs_rating_check CHECK (((rating >= 1) AND (rating <= 5))),
    CONSTRAINT harvest_logs_unit_check CHECK ((unit = ANY (ARRAY['kg'::text, 'g'::text, 'units'::text])))
);


--
-- TOC entry 362 (class 1259 OID 33788)
-- Name: hydroponic_readings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hydroponic_readings (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    reading_date timestamp with time zone DEFAULT now(),
    ph numeric(3,2),
    ec numeric(5,2),
    water_temperature numeric(4,1),
    reservoir_volume numeric(6,2),
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT hydroponic_readings_ph_check CHECK (((ph >= (0)::numeric) AND (ph <= (14)::numeric)))
);


--
-- TOC entry 371 (class 1259 OID 33979)
-- Name: mechanical_work_register; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mechanical_work_register (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    garden_id uuid,
    work_type text NOT NULL,
    work_date date NOT NULL,
    area_m2 numeric(10,2) NOT NULL,
    depth_cm numeric(5,2),
    equipment_type text,
    equipment_attachment text,
    work_metadata jsonb,
    weather_conditions jsonb,
    operator_name text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT mechanical_work_register_equipment_type_check CHECK ((equipment_type = ANY (ARRAY['Tractor'::text, 'RotaryHarrow'::text, 'Shredder'::text, 'FertilizerSpreader'::text, 'Seeder'::text, 'Topper'::text, 'Defoliator'::text, 'PrePruner'::text, 'Thinner'::text, 'Rototiller'::text, 'Cultivator'::text, 'Mower'::text, 'BrushCutter'::text, 'TrackedCart'::text, 'BackpackSprayer'::text, 'ElectricTier'::text, 'ElectricPruner'::text, 'TelescopicPruner'::text, 'Manual'::text]))),
    CONSTRAINT mechanical_work_register_work_type_check CHECK ((work_type = ANY (ARRAY['Plowing'::text, 'Subsoiling'::text, 'Harrowing'::text, 'Tilling'::text, 'Rolling'::text, 'Hoeing'::text, 'EarthingUp'::text, 'Mulching'::text, 'PostSowingRolling'::text, 'Clearing'::text, 'Stumping'::text, 'StoneRemoval'::text, 'Leveling'::text, 'DeepSubsoiling'::text, 'Digging'::text, 'DeepHarrowing'::text, 'Crumbling'::text, 'Scraping'::text, 'SurfaceLeveling'::text, 'MinimumTillage'::text, 'StripTillage'::text, 'NoTill'::text, 'FormativePruning'::text, 'MaintenancePruning'::text, 'RejuvenationPruning'::text, 'SummerPruning'::text, 'WinterPruning'::text, 'Thinning'::text, 'Suckering'::text, 'Defoliation'::text, 'Tying'::text, 'OliveShredding'::text, 'RunnerManagement'::text, 'StrawberryMulching'::text, 'StrawberryCleaning'::text, 'CaneRemoval'::text, 'TipPruning'::text, 'RaspberryTying'::text, 'SuckerThinning'::text, 'FruitBagging'::text, 'ExoticThinning'::text, 'Shredding'::text, 'Topping'::text, 'Pruning'::text])))
);


--
-- TOC entry 352 (class 1259 OID 33557)
-- Name: photo_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.photo_logs (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    task_id uuid NOT NULL,
    garden_id uuid NOT NULL,
    photo_url text NOT NULL,
    photo_date date NOT NULL,
    days_from_planting integer NOT NULL,
    analysis_result jsonb,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 369 (class 1259 OID 33928)
-- Name: professional_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professional_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    garden_id uuid,
    crop_name text NOT NULL,
    season text NOT NULL,
    year integer NOT NULL,
    total_kg numeric(10,2),
    total_revenue numeric(10,2),
    total_costs numeric(10,2),
    roi_percentage numeric(5,2),
    yield_per_sqm numeric(8,2),
    costs_breakdown jsonb,
    production_breakdown jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT professional_analytics_season_check CHECK ((season = ANY (ARRAY['Summer'::text, 'Winter'::text])))
);


--
-- TOC entry 367 (class 1259 OID 33886)
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    tier text DEFAULT 'FREE'::text,
    ai_credits_total integer DEFAULT 0,
    ai_credits_used integer DEFAULT 0,
    ai_credits_reset_date date DEFAULT ((date_trunc('month'::text, now()) + '1 mon'::interval))::date,
    regione text,
    provincia text,
    comune text,
    zona text,
    clima text,
    location_lat double precision,
    location_lng double precision,
    location_manual boolean DEFAULT false,
    streak_current integer DEFAULT 0,
    streak_longest integer DEFAULT 0,
    streak_last_date date,
    total_points integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT profiles_clima_check CHECK ((clima = ANY (ARRAY['alpino'::text, 'continentale'::text, 'mediterraneo'::text, 'subtropicale'::text]))),
    CONSTRAINT profiles_tier_check CHECK ((tier = ANY (ARRAY['FREE'::text, 'PLUS'::text, 'PRO'::text]))),
    CONSTRAINT profiles_zona_check CHECK ((zona = ANY (ARRAY['nord'::text, 'centro'::text, 'sud'::text, 'isole'::text])))
);


--
-- TOC entry 353 (class 1259 OID 33579)
-- Name: seed_inventory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seed_inventory (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    garden_id uuid NOT NULL,
    variety_id text NOT NULL,
    variety_name text NOT NULL,
    species_name text NOT NULL,
    purchase_date date,
    expiry_year integer NOT NULL,
    is_open boolean DEFAULT false,
    quantity_remaining text DEFAULT 'High'::text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT seed_inventory_quantity_remaining_check CHECK ((quantity_remaining = ANY (ARRAY['High'::text, 'Medium'::text, 'Low'::text, 'Empty'::text])))
);


--
-- TOC entry 354 (class 1259 OID 33605)
-- Name: seedling_batches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seedling_batches (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    garden_id uuid NOT NULL,
    plant_name text NOT NULL,
    variety text,
    sowing_date date NOT NULL,
    quantity integer NOT NULL,
    location text NOT NULL,
    phase text DEFAULT 'Sowing'::text,
    current_quantity integer,
    expected_transplant_date date,
    notes text,
    photo_log jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT seedling_batches_location_check CHECK ((location = ANY (ARRAY['Indoor'::text, 'Greenhouse'::text, 'ColdFrame'::text]))),
    CONSTRAINT seedling_batches_phase_check CHECK ((phase = ANY (ARRAY['Sowing'::text, 'Germination'::text, 'Nursing'::text, 'Hardening'::text, 'ReadyToTransplant'::text])))
);


--
-- TOC entry 370 (class 1259 OID 33953)
-- Name: treatment_register; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.treatment_register (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    garden_id uuid,
    crop_name text NOT NULL,
    treatment_date date NOT NULL,
    product_name text NOT NULL,
    active_ingredient text,
    dosage numeric(8,2),
    dosage_unit text,
    area_treated numeric(8,2),
    method text,
    reason text,
    weather_conditions jsonb,
    operator_name text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT treatment_register_dosage_unit_check CHECK ((dosage_unit = ANY (ARRAY['ml'::text, 'g'::text, 'kg'::text, 'L'::text]))),
    CONSTRAINT treatment_register_method_check CHECK ((method = ANY (ARRAY['spray'::text, 'soil'::text, 'seed'::text, 'foliar'::text]))),
    CONSTRAINT treatment_register_reason_check CHECK ((reason = ANY (ARRAY['preventive'::text, 'curative'::text, 'pest_control'::text, 'disease_control'::text, 'nutrient'::text])))
);


--
-- TOC entry 366 (class 1259 OID 33868)
-- Name: user_badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_badges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    badge_id text NOT NULL,
    badge_name text NOT NULL,
    badge_emoji text NOT NULL,
    badge_description text,
    earned_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 355 (class 1259 OID 33627)
-- Name: weather_cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weather_cache (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    lat_lng text NOT NULL,
    date date NOT NULL,
    forecast jsonb NOT NULL,
    cached_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 326 (class 1259 OID 17573)
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- TOC entry 327 (class 1259 OID 17590)
-- Name: messages_2025_12_14; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_12_14 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 328 (class 1259 OID 17602)
-- Name: messages_2025_12_15; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_12_15 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 329 (class 1259 OID 17614)
-- Name: messages_2025_12_16; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_12_16 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 330 (class 1259 OID 17626)
-- Name: messages_2025_12_17; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_12_17 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 331 (class 1259 OID 17638)
-- Name: messages_2025_12_18; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_12_18 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 346 (class 1259 OID 25332)
-- Name: messages_2025_12_19; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_12_19 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 380 (class 1259 OID 41309)
-- Name: messages_2025_12_20; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_12_20 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 320 (class 1259 OID 17410)
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- TOC entry 323 (class 1259 OID 17433)
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- TOC entry 322 (class 1259 OID 17432)
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 316 (class 1259 OID 16717)
-- Name: hooks; Type: TABLE; Schema: supabase_functions; Owner: -
--

CREATE TABLE supabase_functions.hooks (
    id bigint NOT NULL,
    hook_table_id integer NOT NULL,
    hook_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    request_id bigint
);


--
-- TOC entry 4835 (class 0 OID 0)
-- Dependencies: 316
-- Name: TABLE hooks; Type: COMMENT; Schema: supabase_functions; Owner: -
--

COMMENT ON TABLE supabase_functions.hooks IS 'Supabase Functions Hooks: Audit trail for triggered hooks.';


--
-- TOC entry 315 (class 1259 OID 16716)
-- Name: hooks_id_seq; Type: SEQUENCE; Schema: supabase_functions; Owner: -
--

CREATE SEQUENCE supabase_functions.hooks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4836 (class 0 OID 0)
-- Dependencies: 315
-- Name: hooks_id_seq; Type: SEQUENCE OWNED BY; Schema: supabase_functions; Owner: -
--

ALTER SEQUENCE supabase_functions.hooks_id_seq OWNED BY supabase_functions.hooks.id;


--
-- TOC entry 314 (class 1259 OID 16708)
-- Name: migrations; Type: TABLE; Schema: supabase_functions; Owner: -
--

CREATE TABLE supabase_functions.migrations (
    version text NOT NULL,
    inserted_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 3777 (class 0 OID 0)
-- Name: messages_2025_12_14; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_14 FOR VALUES FROM ('2025-12-14 00:00:00') TO ('2025-12-15 00:00:00');


--
-- TOC entry 3778 (class 0 OID 0)
-- Name: messages_2025_12_15; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_15 FOR VALUES FROM ('2025-12-15 00:00:00') TO ('2025-12-16 00:00:00');


--
-- TOC entry 3779 (class 0 OID 0)
-- Name: messages_2025_12_16; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_16 FOR VALUES FROM ('2025-12-16 00:00:00') TO ('2025-12-17 00:00:00');


--
-- TOC entry 3780 (class 0 OID 0)
-- Name: messages_2025_12_17; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_17 FOR VALUES FROM ('2025-12-17 00:00:00') TO ('2025-12-18 pg_dump: creating TABLE ATTACH "realtime.messages_2025_12_18"
pg_dump: creating TABLE ATTACH "realtime.messages_2025_12_19"
pg_dump: creating TABLE ATTACH "realtime.messages_2025_12_20"
pg_dump: creating DEFAULT "auth.refresh_tokens id"
pg_dump: creating DEFAULT "supabase_functions.hooks id"
pg_dump: processing data for table "_realtime.extensions"
pg_dump: dumping contents of table "_realtime.extensions"
pg_dump: processing data for table "_realtime.schema_migrations"
pg_dump: dumping contents of table "_realtime.schema_migrations"
pg_dump: processing data for table "_realtime.tenants"
pg_dump: dumping contents of table "_realtime.tenants"
pg_dump: processing data for table "auth.audit_log_entries"
pg_dump: dumping contents of table "auth.audit_log_entries"
pg_dump: processing data for table "auth.flow_state"
pg_dump: dumping contents of table "auth.flow_state"
pg_dump: processing data for table "auth.identities"
pg_dump: dumping contents of table "auth.identities"
pg_dump: processing data for table "auth.instances"
pg_dump: dumping contents of table "auth.instances"
pg_dump: processing data for table "auth.mfa_amr_claims"
pg_dump: dumping contents of table "auth.mfa_amr_claims"
pg_dump: processing data for table "auth.mfa_challenges"
pg_dump: dumping contents of table "auth.mfa_challenges"
pg_dump: processing data for table "auth.mfa_factors"
pg_dump: dumping contents of table "auth.mfa_factors"
pg_dump: processing data for table "auth.oauth_authorizations"
pg_dump: dumping contents of table "auth.oauth_authorizations"
pg_dump: processing data for table "auth.oauth_clients"
pg_dump: dumping contents of table "auth.oauth_clients"
pg_dump: processing data for table "auth.oauth_consents"
pg_dump: dumping contents of table "auth.oauth_consents"
pg_dump: processing data for table "auth.one_time_tokens"
pg_dump: dumping contents of table "auth.one_time_tokens"
pg_dump: processing data for table "auth.refresh_tokens"
pg_dump: dumping contents of table "auth.refresh_tokens"
pg_dump: processing data for table "auth.saml_providers"
pg_dump: dumping contents of table "auth.saml_providers"
pg_dump: processing data for table "auth.saml_relay_states"
pg_dump: dumping contents of table "auth.saml_relay_states"
pg_dump: processing data for table "auth.schema_migrations"
pg_dump: dumping contents of table "auth.schema_migrations"
pg_dump: processing data for table "auth.sessions"
pg_dump: dumping contents of table "auth.sessions"
pg_dump: processing data for table "auth.sso_domains"
pg_dump: dumping contents of table "auth.sso_domains"
pg_dump: processing data for table "auth.sso_providers"
pg_dump: dumping contents of table "auth.sso_providers"
pg_dump: processing data for table "auth.users"
pg_dump: dumping contents of table "auth.users"
pg_dump: processing data for table "public.agronomist_advice"
pg_dump: dumping contents of table "public.agronomist_advice"
pg_dump: processing data for table "public.agronomist_consultations"
pg_dump: dumping contents of table "public.agronomist_consultations"
pg_dump: processing data for table "public.agronomists"
pg_dump: dumping contents of table "public.agronomists"
pg_dump: processing data for table "public.ai_credit_transactions"
pg_dump: dumping contents of table "public.ai_credit_transactions"
pg_dump: processing data for table "public.aquaponic_readings"
pg_dump: dumping contents of table "public.aquaponic_readings"
pg_dump: processing data for table "public.bed_planting_history"
pg_dump: dumping contents of table "public.bed_planting_history"
pg_dump: processing data for table "public.calendar_tasks"
pg_dump: dumping contents of table "public.calendar_tasks"
pg_dump: processing data for table "public.challenge_completions"
pg_dump: dumping contents of table "public.challenge_completions"
pg_dump: processing data for table "public.crop_learning_events"
pg_dump: dumping contents of table "public.crop_learning_events"
pg_dump: processing data for table "public.crop_mechanical_works"
pg_dump: dumping contents of table "public.crop_mechanical_works"
pg_dump: processing data for table "public.custom_crops"
pg_dump: dumping contents of table "public.custom_crops"
pg_dump: processing data for table "public.custom_plans"
pg_dump: dumping contents of table "public.custom_plans"
pg_dump: processing data for table "public.garden_accessories"
pg_dump: dumping contents of table "public.garden_accessories"
pg_dump: processing data for table "public.garden_beds"
pg_dump: dumping contents of table "public.garden_beds"
pg_dump: processing data for table "public.garden_correlations"
pg_dump: dumping contents of table "public.garden_correlations"
00:00:00');


--
-- TOC entry 3781 (class 0 OID 0)
-- Name: messages_2025_12_18; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_18 FOR VALUES FROM ('2025-12-18 00:00:00') TO ('2025-12-19 00:00:00');


--
-- TOC entry 3782 (class 0 OID 0)
-- Name: messages_2025_12_19; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_19 FOR VALUES FROM ('2025-12-19 00:00:00') TO ('2025-12-20 00:00:00');


--
-- TOC entry 3783 (class 0 OID 0)
-- Name: messages_2025_12_20; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_20 FOR VALUES FROM ('2025-12-20 00:00:00') TO ('2025-12-21 00:00:00');


--
-- TOC entry 3793 (class 2604 OID 16473)
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- TOC entry 3802 (class 2604 OID 16720)
-- Name: hooks id; Type: DEFAULT; Schema: supabase_functions; Owner: -
--

ALTER TABLE ONLY supabase_functions.hooks ALTER COLUMN id SET DEFAULT nextval('supabase_functions.hooks_id_seq'::regclass);


--
-- TOC entry 4733 (class 0 OID 17017)
-- Dependencies: 319
-- Data for Name: extensions; Type: TABLE DATA; Schema: _realtime; Owner: -
--

COPY _realtime.extensions (id, type, settings, tenant_external_id, inserted_at, updated_at) FROM stdin;
c1d87dc0-3c82-45f6-a6eb-b65534714100	postgres_cdc_rls	{"region": "us-east-1", "db_host": "xeVjeNfRwDq6Opdskks1Fej0SVd239ZldJqQAg6DnZU=", "db_name": "sWBpZNdjggEPTQVlI52Zfw==", "db_port": "+enMDFi1J/3IrrquHHwUmA==", "db_user": "uxbEq/zz8DXVD53TOI1zmw==", "slot_name": "supabase_realtime_replication_slot", "db_password": "sWBpZNdjggEPTQVlI52Zfw==", "publication": "supabase_realtime", "ssl_enforced": false, "poll_interval_ms": 100, "poll_max_changes": 100, "poll_max_record_bytes": 1048576}	realtime-dev	2025-12-17 17:19:16	2025-12-17 17:19:16
\.


--
-- TOC entry 4731 (class 0 OID 16738)
-- Dependencies: 317
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: _realtime; Owner: -
--

COPY _realtime.schema_migrations (version, inserted_at) FROM stdin;
20210706140551	2025-12-15 12:17:27
20220329161857	2025-12-15 12:17:27
20220410212326	2025-12-15 12:17:27
20220506102948	2025-12-15 12:17:27
20220527210857	2025-12-15 12:17:27
20220815211129	2025-12-15 12:17:27
20220815215024	2025-12-15 12:17:27
20220818141501	2025-12-15 12:17:27
20221018173709	2025-12-15 12:17:27
20221102172703	2025-12-15 12:17:27
20221223010058	2025-12-15 12:17:27
20230110180046	2025-12-15 12:17:27
20230810220907	2025-12-15 12:17:27
20230810220924	2025-12-15 12:17:27
20231024094642	2025-12-15 12:17:27
20240306114423	2025-12-15 12:17:27
20240418082835	2025-12-15 12:17:27
20240625211759	2025-12-15 12:17:27
20240704172020	2025-12-15 12:17:27
20240902173232	2025-12-15 12:17:27
20241106103258	2025-12-15 12:17:27
20250424203323	2025-12-15 12:17:27
20250613072131	2025-12-15 12:17:27
20250711044927	2025-12-15 12:17:27
20250811121559	2025-12-15 12:17:27
20250926223044	2025-12-15 12:17:27
\.


--
-- TOC entry 4732 (class 0 OID 16990)
-- Dependencies: 318
-- Data for Name: tenants; Type: TABLE DATA; Schema: _realtime; Owner: -
--

COPY _realtime.tenants (id, name, external_id, jwt_secret, max_concurrent_users, inserted_at, updated_at, max_events_per_second, postgres_cdc_default, max_bytes_per_second, max_channels_per_client, max_joins_per_second, suspend, jwt_jwks, notify_private_alpha, private_only, migrations_ran, broadcast_adapter, max_presence_events_per_second, max_payload_size_in_kb) FROM stdin;
ea9654e6-2805-476b-aea9-68c748065141	realtime-dev	realtime-dev	iNjicxc4+llvc9wovDvqymwfnj9teWMlyOIbJ8Fh6j2WNU8CIJ2ZgjR6MUIKqSmeDmvpsKLsZ9jgXJmQPpwL8w==	200	2025-12-17 17:19:16	2025-12-17 17:19:16	100	postgres_cdc_rls	100000	100	100	f	{"keys": [{"k": "c3VwZXItc2VjcmV0LWp3dC10b2tlbi13aXRoLWF0LWxlYXN0LTMyLWNoYXJhY3RlcnMtbG9uZw", "kty": "oct"}]}	f	f	65	gen_rpc	1000	3000
\.


--
-- TOC entry 4726 (class 0 OID 16488)
-- Dependencies: 302
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- TOC entry 4751 (class 0 OID 25147)
-- Dependencies: 341
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- TOC entry 4742 (class 0 OID 24944)
-- Dependencies: 332
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
\.


--
-- TOC entry 4725 (class 0 OID 16481)
-- Dependencies: 301
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4746 (class 0 OID 25034)
-- Dependencies: 336
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
-- TOC entry 4745 (class 0 OID 25022)
-- Dependencies: 335
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- TOC entry 4744 (class 0 OID 25009)
-- Dependencies: 334
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- TOC entry 4754 (class 0 OID 25259)
-- Dependencies: 344
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- TOC entry 4753 (class 0 OID 25229)
-- Dependencies: 343
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type) FROM stdin;
\.


--
-- TOC entry 4755 (class 0 OID 25292)
-- Dependencies: 345
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- TOC entry 4752 (class 0 OID 25197)
-- Dependencies: 342
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4724 (class 0 OID 16470)
-- Dependencies: 300
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
-- TOC entry 4749 (class 0 OID 25076)
-- Dependencies: 339
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- TOC entry 4750 (class 0 OID 25094)
-- Dependencies: 340
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- TOC entry 4727 (class 0 OID 16496)
-- Dependencies: 303
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
\.


--
-- TOC entry 4743 (class 0 OID 24974)
-- Dependencies: 333
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
\.


--
-- TOC entry 4748 (class 0 OID 25061)
-- Dependencies: 338
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4747 (class 0 OID 25052)
-- Dependencies: 337
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- TOC entry 4722 (class 0 OID 16458)
-- Dependencies: 298
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	9fb960e0-a681-4ad8-9d2e-bd9da5334613	authenticated	authenticated	roberto.lalinga@gmail.com	$2a$06$9dpdyg5c3GyeZUJdN5HHnuWhWvnBey1d0f4sJT5vo12VdVp1gHMie	2025-12-16 08:48:56.51665+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2025-12-16 08:48:56.51665+00	2025-12-16 08:48:56.51665+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- TOC entry 4769 (class 0 OID 33715)
-- Dependencies: 359
-- Data for Name: agronomist_advice; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.agronomist_advice (id, consultation_id, task_id, advice_text, category, priority, apply_date, apply_season, applied, applied_date, result, created_at) FROM stdin;
\.


--
-- TOC entry 4768 (class 0 OID 33682)
-- Dependencies: 358
-- Data for Name: agronomist_consultations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.agronomist_consultations (id, agronomist_id, user_id, garden_id, task_id, date, consultation_type, topic, advice, notes, attachments, created_at) FROM stdin;
\.


--
-- TOC entry 4767 (class 0 OID 33664)
-- Dependencies: 357
-- Data for Name: agronomists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.agronomists (id, user_id, name, email, phone, specialization, notes, preferred_contact_method, consultation_frequency, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4778 (class 0 OID 33911)
-- Dependencies: 368
-- Data for Name: ai_credit_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_credit_transactions (id, user_id, amount, type, feature, description, metadata, created_at) FROM stdin;
\.


--
-- TOC entry 4773 (class 0 OID 33805)
-- Dependencies: 363
-- Data for Name: aquaponic_readings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.aquaponic_readings (id, garden_id, reading_date, ph, ammonia, nitrite, nitrate, water_temperature, dissolved_oxygen, notes, created_at) FROM stdin;
\.


--
-- TOC entry 4759 (class 0 OID 33476)
-- Dependencies: 349
-- Data for Name: bed_planting_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bed_planting_history (id, bed_id, plant_id, plant_name, plant_family, season, year, planted_at, harvested_at, created_at) FROM stdin;
\.


--
-- TOC entry 4774 (class 0 OID 33822)
-- Dependencies: 364
-- Data for Name: calendar_tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.calendar_tasks (id, user_id, garden_id, title, type, start_date, end_date, recurring, recurring_pattern, plant_id, plant_name, completed, notes, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4775 (class 0 OID 33848)
-- Dependencies: 365
-- Data for Name: challenge_completions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.challenge_completions (id, user_id, challenge_id, completed_at, actions_completed, photo_url, points_awarded, badge_earned, created_at) FROM stdin;
\.


--
-- TOC entry 4784 (class 0 OID 34045)
-- Dependencies: 374
-- Data for Name: crop_learning_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.crop_learning_events (id, custom_crop_id, user_id, garden_id, event_type, event_data, outcome, created_at) FROM stdin;
\.


--
-- TOC entry 4782 (class 0 OID 34004)
-- Dependencies: 372
-- Data for Name: crop_mechanical_works; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.crop_mechanical_works (id, crop_id, crop_name, work_type, priority, timing, equipment_suggested, critical, frequency, description, created_at) FROM stdin;
\.


--
-- TOC entry 4783 (class 0 OID 34019)
-- Dependencies: 373
-- Data for Name: custom_crops; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.custom_crops (id, user_id, garden_id, common_name, scientific_name, family, initial_data, learned_patterns, stats, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4766 (class 0 OID 33640)
-- Dependencies: 356
-- Data for Name: custom_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.custom_plans (id, user_id, garden_id, name, description, base_master_sheet_id, overrides, custom_notes, custom_methods, additional_parameters, is_public, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4771 (class 0 OID 33765)
-- Dependencies: 361
-- Data for Name: garden_accessories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.garden_accessories (id, garden_id, name, category, support_type, netting_type, wire_type, material, quantity, length_cm, height_cm, width_cm, diameter_cm, mesh_size_mm, used_for, installation_date, expected_lifespan_years, last_maintenance, needs_replacement, "position", created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4758 (class 0 OID 33445)
-- Dependencies: 348
-- Data for Name: garden_beds; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.garden_beds (id, garden_id, name, bed_type, shape, length_cm, width_cm, diameter_cm, size_sq_meters, sun_exposure, daily_sun_hours, aspect_direction, soil_type, structure_id, structure_type, is_covered, covering_structure_id, notes, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4788 (class 0 OID 34142)
-- Dependencies: 378
-- Data for Name: garden_correlations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.garden_correlations (id, garden_id, correlation_type, custom_crop_id, factor_a, factor_b, strength, correlation_data, created_at) FROM stdin;
\.


--
-- TOC entry 4770 (class 0 OID 33739)
-- Dependpg_dump: processing data for table "public.garden_obstacles"
pg_dump: dumping contents of table "public.garden_obstacles"
pg_dump: processing data for table "public.garden_patterns"
pg_dump: dumping contents of table "public.garden_patterns"
pg_dump: processing data for table "public.garden_season_analyses"
pg_dump: dumping contents of table "public.garden_season_analyses"
pg_dump: processing data for table "public.garden_tasks"
pg_dump: dumping contents of table "public.garden_tasks"
pg_dump: processing data for table "public.garden_tree_memories"
pg_dump: dumping contents of table "public.garden_tree_memories"
pg_dump: processing data for table "public.garden_zone_memories"
pg_dump: dumping contents of table "public.garden_zone_memories"
pg_dump: processing data for table "public.gardens"
pg_dump: dumping contents of table "public.gardens"
pg_dump: processing data for table "public.harvest_logs"
pg_dump: dumping contents of table "public.harvest_logs"
pg_dump: processing data for table "public.hydroponic_readings"
pg_dump: dumping contents of table "public.hydroponic_readings"
pg_dump: processing data for table "public.mechanical_work_register"
pg_dump: dumping contents of table "public.mechanical_work_register"
pg_dump: processing data for table "public.photo_logs"
pg_dump: dumping contents of table "public.photo_logs"
pg_dump: processing data for table "public.professional_analytics"
pg_dump: dumping contents of table "public.professional_analytics"
pg_dump: processing data for table "public.profiles"
pg_dump: dumping contents of table "public.profiles"
pg_dump: processing data for table "public.seed_inventory"
pg_dump: dumping contents of table "public.seed_inventory"
pg_dump: processing data for table "public.seedling_batches"
pg_dump: dumping contents of table "public.seedling_batches"
pg_dump: processing data for table "public.treatment_register"
pg_dump: dumping contents of table "public.treatment_register"
pg_dump: processing data for table "public.user_badges"
pg_dump: dumping contents of table "public.user_badges"
pg_dump: processing data for table "public.weather_cache"
pg_dump: dumping contents of table "public.weather_cache"
pg_dump: processing data for table "realtime.messages_2025_12_14"
pg_dump: dumping contents of table "realtime.messages_2025_12_14"
pg_dump: processing data for table "realtime.messages_2025_12_15"
pg_dump: dumping contents of table "realtime.messages_2025_12_15"
pg_dump: processing data for table "realtime.messages_2025_12_16"
pg_dump: dumping contents of table "realtime.messages_2025_12_16"
pg_dump: processing data for table "realtime.messages_2025_12_17"
pg_dump: dumping contents of table "realtime.messages_2025_12_17"
pg_dump: processing data for table "realtime.messages_2025_12_18"
pg_dump: dumping contents of table "realtime.messages_2025_12_18"
pg_dump: processing data for table "realtime.messages_2025_12_19"
pg_dump: dumping contents of table "realtime.messages_2025_12_19"
pg_dump: processing data for table "realtime.messages_2025_12_20"
pg_dump: dumping contents of table "realtime.messages_2025_12_20"
pg_dump: processing data for table "realtime.schema_migrations"
pg_dump: dumping contents of table "realtime.schema_migrations"
pg_dump: processing data for table "realtime.subscription"
pg_dump: dumping contents of table "realtime.subscription"
pg_dump: processing data for table "supabase_functions.hooks"
pg_dump: dumping contents of table "supabase_functions.hooks"
pg_dump: processing data for table "supabase_functions.migrations"
pg_dump: dumping contents of table "supabase_functions.migrations"
pg_dump: processing data for table "vault.secrets"
pg_dump: dumping contents of table "vault.secrets"
pg_dump: executing SEQUENCE SET refresh_tokens_id_seq
pg_dump: executing SEQUENCE SET subscription_id_seq
pg_dump: executing SEQUENCE SET hooks_id_seq
pg_dump: creating CONSTRAINT "_realtime.extensions extensions_pkey"
pg_dump: creating CONSTRAINT "_realtime.schema_migrations schema_migrations_pkey"
pg_dump: creating CONSTRAINT "_realtime.tenants tenants_pkey"
pg_dump: creating CONSTRAINT "auth.mfa_amr_claims amr_id_pk"
pg_dump: creating CONSTRAINT "auth.audit_log_entries audit_log_entries_pkey"
pg_dump: creating CONSTRAINT "auth.flow_state flow_state_pkey"
pg_dump: creating CONSTRAINT "auth.identities identities_pkey"
pg_dump: creating CONSTRAINT "auth.identities identities_provider_id_provider_unique"
pg_dump: creating CONSTRAINT "auth.instances instances_pkey"
pg_dump: creating CONSTRAINT "auth.mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey"
pg_dump: creating CONSTRAINT "auth.mfa_challenges mfa_challenges_pkey"
pg_dump: creating CONSTRAINT "auth.mfa_factors mfa_factors_last_challenged_at_key"
pg_dump: creating CONSTRAINT "auth.mfa_factors mfa_factors_pkey"
pg_dump: creating CONSTRAINT "auth.oauth_authorizations oauth_authorizations_authorization_code_key"
pg_dump: creating CONSTRAINT "auth.oauth_authorizations oauth_authorizations_authorization_id_key"
pg_dump: creating CONSTRAINT "auth.oauth_authorizations oauth_authorizations_pkey"
encies: 360
-- Data for Name: garden_obstacles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.garden_obstacles (id, garden_id, azimuth, height_meters, distance_meters, width_degrees, type, source, description, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4787 (class 0 OID 34120)
-- Dependencies: 377
-- Data for Name: garden_patterns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.garden_patterns (id, garden_id, pattern_type, custom_crop_id, pattern_data, confidence, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4789 (class 0 OID 34163)
-- Dependencies: 379
-- Data for Name: garden_season_analyses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.garden_season_analyses (id, garden_id, season, year, analysis_data, created_at) FROM stdin;
\.


--
-- TOC entry 4760 (class 0 OID 33494)
-- Dependencies: 350
-- Data for Name: garden_tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.garden_tasks (id, garden_id, bed_id, plant_name, variety, planting_method, location_type, initial_quantity, current_quantity, task_type, stage, lifecycle_state, season, date, expected_transplant_date, moon_phase, completed, notes, next_due_date, treatment_product_id, grid_position, grid_rotation, user_responses, recorded_brix, harvest_ready_analysis, harvest_history, final_harvest, strawberry_data, fruit_tree_data, aromatic_data, olive_data, vine_data, exotic_fruit_data, mechanical_work_data, tree_pruning_data, hydroponic_data, aquaponic_data, aeroponic_data, suggested_date, actual_completed_date, is_suggested, suggested_by, images, last_photo_date, created_at, updated_at, completed_at) FROM stdin;
\.


--
-- TOC entry 4786 (class 0 OID 34097)
-- Dependencies: 376
-- Data for Name: garden_tree_memories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.garden_tree_memories (id, garden_id, tree_id, tree_name, custom_crop_id, production_history, alternance_pattern, pruning_history, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4785 (class 0 OID 34074)
-- Dependencies: 375
-- Data for Name: garden_zone_memories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.garden_zone_memories (id, garden_id, zone_id, zone_name, custom_crop_id, planting_history, patterns, correlations, last_updated, created_at) FROM stdin;
\.


--
-- TOC entry 4757 (class 0 OID 33416)
-- Dependencies: 347
-- Data for Name: gardens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gardens (id, user_id, name, coordinates, size_sq_meters, size_unit, soil_type, soil_ph, altitude_meters, delay_factor_days, sun_exposure, daily_sun_hours, aspect_direction, wind_protection, has_compost_bin, is_raised_bed, garden_type, greenhouse_config, indoor_config, hydroponic_config, aquaponic_config, aeroponic_config, vacation_mode, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4761 (class 0 OID 33531)
-- Dependencies: 351
-- Data for Name: harvest_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.harvest_logs (id, garden_id, task_id, plant_name, quantity, unit, rating, harvest_date, photo, brix, notes, suggested_recipes, strawberry_harvest, fruit_tree_harvest, aromatic_harvest, olive_harvest, vine_harvest, created_at) FROM stdin;
\.


--
-- TOC entry 4772 (class 0 OID 33788)
-- Dependencies: 362
-- Data for Name: hydroponic_readings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hydroponic_readings (id, garden_id, reading_date, ph, ec, water_temperature, reservoir_volume, notes, created_at) FROM stdin;
\.


--
-- TOC entry 4781 (class 0 OID 33979)
-- Dependencies: 371
-- Data for Name: mechanical_work_register; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mechanical_work_register (id, user_id, garden_id, work_type, work_date, area_m2, depth_cm, equipment_type, equipment_attachment, work_metadata, weather_conditions, operator_name, notes, created_at) FROM stdin;
\.


--
-- TOC entry 4762 (class 0 OID 33557)
-- Dependencies: 352
-- Data for Name: photo_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.photo_logs (id, task_id, garden_id, photo_url, photo_date, days_from_planting, analysis_result, notes, created_at) FROM stdin;
\.


--
-- TOC entry 4779 (class 0 OID 33928)
-- Dependencies: 369
-- Data for Name: professional_analytics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.professional_analytics (id, user_id, garden_id, crop_name, season, year, total_kg, total_revenue, total_costs, roi_percentage, yield_per_sqm, costs_breakdown, production_breakdown, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4777 (class 0 OID 33886)
-- Dependencies: 367
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profiles (id, tier, ai_credits_total, ai_credits_used, ai_credits_reset_date, regione, provincia, comune, zona, clima, location_lat, location_lng, location_manual, streak_current, streak_longest, streak_last_date, total_points, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4763 (class 0 OID 33579)
-- Dependencies: 353
-- Data for Name: seed_inventory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seed_inventory (id, user_id, garden_id, variety_id, variety_name, species_name, purchase_date, expiry_year, is_open, quantity_remaining, notes, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4764 (class 0 OID 33605)
-- Dependencies: 354
-- Data for Name: seedling_batches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seedling_batches (id, garden_id, plant_name, variety, sowing_date, quantity, location, phase, current_quantity, expected_transplant_date, notes, photo_log, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4780 (class 0 OID 33953)
-- Dependencies: 370
-- Data for Name: treatment_register; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.treatment_register (id, user_id, garden_id, crop_name, treatment_date, product_name, active_ingredient, dosage, dosage_unit, area_treated, method, reason, weather_conditions, operator_name, notes, created_at) FROM stdin;
\.


--
-- TOC entry 4776 (class 0 OID 33868)
-- Dependencies: 366
-- Data for Name: user_badges; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_badges (id, user_id, badge_id, badge_name, badge_emoji, badge_description, earned_at) FROM stdin;
\.


--
-- TOC entry 4765 (class 0 OID 33627)
-- Dependencies: 355
-- Data for Name: weather_cache; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.weather_cache (id, lat_lng, date, forecast, cached_at) FROM stdin;
\.


--
-- TOC entry 4737 (class 0 OID 17590)
-- Dependencies: 327
-- Data for Name: messages_2025_12_14; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_12_14 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 4738 (class 0 OID 17602)
-- Dependencies: 328
-- Data for Name: messages_2025_12_15; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_12_15 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 4739 (class 0 OID 17614)
-- Dependencies: 329
-- Data for Name: messages_2025_12_16; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_12_16 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 4740 (class 0 OID 17626)
-- Dependencies: 330
-- Data for Name: messages_2025_12_17; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_12_17 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 4741 (class 0 OID 17638)
-- Dependencies: 331
-- Data for Name: messages_2025_12_18; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_12_18 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 4756 (class 0 OID 25332)
-- Dependencies: 346
-- Data for Name: messages_2025_12_19; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_12_19 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 4790 (class 0 OID 41309)
-- Dependencies: 380
-- Data for Name: messages_2025_12_20; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_12_20 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 4734 (class 0 OID 17410)
-- Dependencies: 320
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-12-15 12:17:28
20211116045059	2025-12-15 12:17:28
20211116050929	2025-12-15 12:17:28
20211116051442	2025-12-15 12:17:28
20211116212300	2025-12-15 12:17:28
20211116213355	2025-12-15 12:17:28
20211116213934	2025-12-15 12:17:28
20211116214523	2025-12-15 12:17:28
20211122062447	2025-12-15 12:17:28
20211124070109	2025-12-15 12:17:28
20211202204204	2025-12-15 12:17:28
20211202204605	2025-12-15 12:17:28
20211210212804	2025-12-15 12:17:28
20211228014915	2025-12-15 12:17:28
20220107221237	2025-12-15 12:17:28
20220228202821	2025-12-15 12:17:28
20220312004840	2025-12-15 12:17:28
20220603231003	2025-12-15 12:17:28
20220603232444	2025-12-15 12:17:28
20220615214548	2025-12-15 12:17:28
20220712093339	2025-12-15 12:17:28
20220908172859	2025-12-15 12:17:28
20220916233421	2025-12-15 12:17:28
20230119133233	2025-12-15 12:17:28
20230128025114	2025-12-15 12:17:28
20230128025212	2025-12-15 12:17:28
20230227211149	2025-12-15 12:17:28
20230228184745	2025-12-15 12:17:28
20230308225145	2025-12-15 12:17:28
20230328144023	2025-12-15 12:17:28
20231018144023	2025-12-15 12:17:28
20231204144023	2025-12-15 12:17:28
20231204144024	2025-12-15 12:17:28
20231204144025	2025-12-15 12:17:28
20240108234812	2025-12-15 12:17:28
20240109165339	2025-12-15 12:17:28
20240227174441	2025-12-15 12:17:28
20240311171622	2025-12-15 12:17:28
20240321100241	2025-12-15 12:17:28
20240401105812	2025-12-15 12:17:28
20240418121054	2025-12-15 12:17:28
20240523004032	2025-12-15 12:17:28
20240618124746	2025-12-15 12:17:28
20240801235015	2025-12-15 12:17:28
20240805133720	2025-12-15 12:17:28
20240827160934	2025-12-15 12:17:28
20240919163303	2025-12-15 12:17:28
20240919163305	2025-12-15 12:17:28
20241019105805	2025-12-15 12:17:28
20241030150047	2025-12-15 12:17:28
20241108114728	2025-12-15 12:17:28
20241121104152	2025-12-15 12:17:28
20241130184212	2025-12-15 12:17:28
20241220035512	2025-12-15 12:17:28
20241220123912	2025-12-15 12:17:28
20241224161212	2025-12-15 12:17:28
20250107150512	2025-12-15 12:17:28
20250110162412	2025-12-15 12:17:28
20250123174212	2025-12-15 12:17:28
20250128220012	2025-12-15 12:17:28
20250506224012	2025-12-15 12:17:28
20250523164012	2025-12-15 12:17:28
20250714121412	2025-12-15 12:17:28
20250905041441	2025-12-15 12:17:28
20251103001201	2025-12-15 12:17:28
\.


--
-- TOC entry 4736 (class 0 OID 17433)
-- Dependencies: 323
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- TOC entry 4730 (class 0 OID 16717)
-- Dependencies: 316
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: -
--

COPY supabase_functions.hooks (id, hook_table_id, hook_name, created_at, request_id) FROM stdin;
\.


--
-- TOC entry 4728 (class 0 OID 16708)
-- Dependencies: 314
-- Data for Name: migrations; Type: TABLE DATA; Schema: supabase_functions; Owner: -
--

COPY supabase_functions.migrations (version, inserted_at) FROM stdin;
initial	2025-12-15 12:17:25.369082+00
20210809183423_update_grants	2025-12-15 12:17:25.369082+00
\.


--
-- TOC entry 3776 (class 0 OID 16608)
-- Dependencies: 306
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4837 (class 0 OID 0)
-- Dependencies: 299
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- TOC entry 4838 (class 0 OID 0)
-- Dependencies: 322
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- TOC entry 4839 (class 0 OID 0)
-- Dependencies: 315
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: -
--

SELECT pg_catalog.setval('supabase_functions.hooks_id_seq', 1, false);


--
-- TOC entry 4116 (class 2606 OID 17023)
-- Name: extensions extensions_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: -
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_pkey PRIMARY KEY (id);


--
-- TOC entry 4111 (class 2606 OID 16742)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: -
--

ALTER TABLE ONLY _realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 4114 (class 2606 OID 17003)
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: -
--

ALTER TABLE ONLY _realtime.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- TOC entry 4167 (class 2606 OID 25047)
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- TOC entry 4097 (class 2606 OID 16494)
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 4190 (class 2606 OID 25153)
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- TOC entry 4145 (class 2606 OID 25171)
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- TOC entry 4147 (class 2606 OID 25181)
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- TOC entry 4095 (class 2606 OID 16487)
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- TOC entry 4169 (class 2606 OID 25040)
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- TOC entry 4165 (class 2606 OID 25028)
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- TOC entry 4157 (class 2606 OID 25221)
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- TOC entry 4159 (class 2606 OID 25015)
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- TOC entry 4203 (class 2606 OID 25280)
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- TOC entry 4205 (class 2606 OID 25278)
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- TOC entry 4207 (cpg_dump: creating CONSTRAINT "auth.oauth_clients oauth_clients_pkey"
pg_dump: creating CONSTRAINT "auth.oauth_consents oauth_consents_pkey"
pg_dump: creating CONSTRAINT "auth.oauth_consents oauth_consents_user_client_unique"
pg_dump: creating CONSTRAINT "auth.one_time_tokens one_time_tokens_pkey"
pg_dump: creating CONSTRAINT "auth.refresh_tokens refresh_tokens_pkey"
pg_dump: creating CONSTRAINT "auth.refresh_tokens refresh_tokens_token_unique"
pg_dump: creating CONSTRAINT "auth.saml_providers saml_providers_entity_id_key"
pg_dump: creating CONSTRAINT "auth.saml_providers saml_providers_pkey"
pg_dump: creating CONSTRAINT "auth.saml_relay_states saml_relay_states_pkey"
pg_dump: creating CONSTRAINT "auth.schema_migrations schema_migrations_pkey"
pg_dump: creating CONSTRAINT "auth.sessions sessions_pkey"
pg_dump: creating CONSTRAINT "auth.sso_domains sso_domains_pkey"
pg_dump: creating CONSTRAINT "auth.sso_providers sso_providers_pkey"
pg_dump: creating CONSTRAINT "auth.users users_phone_key"
pg_dump: creating CONSTRAINT "auth.users users_pkey"
pg_dump: creating CONSTRAINT "public.agronomist_advice agronomist_advice_pkey"
pg_dump: creating CONSTRAINT "public.agronomist_consultations agronomist_consultations_pkey"
pg_dump: creating CONSTRAINT "public.agronomists agronomists_pkey"
pg_dump: creating CONSTRAINT "public.ai_credit_transactions ai_credit_transactions_pkey"
pg_dump: creating CONSTRAINT "public.aquaponic_readings aquaponic_readings_pkey"
pg_dump: creating CONSTRAINT "public.bed_planting_history bed_planting_history_pkey"
pg_dump: creating CONSTRAINT "public.calendar_tasks calendar_tasks_pkey"
pg_dump: creating CONSTRAINT "public.challenge_completions challenge_completions_pkey"
pg_dump: creating CONSTRAINT "public.challenge_completions challenge_completions_user_id_challenge_id_key"
pg_dump: creating CONSTRAINT "public.crop_learning_events crop_learning_events_pkey"
pg_dump: creating CONSTRAINT "public.crop_mechanical_works crop_mechanical_works_pkey"
pg_dump: creating CONSTRAINT "public.custom_crops custom_crops_pkey"
pg_dump: creating CONSTRAINT "public.custom_plans custom_plans_pkey"
pg_dump: creating CONSTRAINT "public.garden_accessories garden_accessories_pkey"
pg_dump: creating CONSTRAINT "public.garden_beds garden_beds_pkey"
pg_dump: creating CONSTRAINT "public.garden_correlations garden_correlations_pkey"
pg_dump: creating CONSTRAINT "public.garden_obstacles garden_obstacles_pkey"
pg_dump: creating CONSTRAINT "public.garden_patterns garden_patterns_pkey"
pg_dump: creating CONSTRAINT "public.garden_season_analyses garden_season_analyses_garden_id_season_year_key"
pg_dump: creating CONSTRAINT "public.garden_season_analyses garden_season_analyses_pkey"
pg_dump: creating CONSTRAINT "public.garden_tasks garden_tasks_pkey"
pg_dump: creating CONSTRAINT "public.garden_tree_memories garden_tree_memories_pkey"
pg_dump: creating CONSTRAINT "public.garden_zone_memories garden_zone_memories_pkey"
pg_dump: creating CONSTRAINT "public.gardens gardens_pkey"
pg_dump: creating CONSTRAINT "public.harvest_logs harvest_logs_pkey"
pg_dump: creating CONSTRAINT "public.hydroponic_readings hydroponic_readings_pkey"
pg_dump: creating CONSTRAINT "public.mechanical_work_register mechanical_work_register_pkey"
pg_dump: creating CONSTRAINT "public.photo_logs photo_logs_pkey"
pg_dump: creating CONSTRAINT "public.professional_analytics professional_analytics_pkey"
pg_dump: creating CONSTRAINT "public.profiles profiles_pkey"
pg_dump: creating CONSTRAINT "public.seed_inventory seed_inventory_pkey"
pg_dump: creating CONSTRAINT "public.seedling_batches seedling_batches_pkey"
pg_dump: creating CONSTRAINT "public.treatment_register treatment_register_pkey"
pg_dump: creating CONSTRAINT "public.user_badges user_badges_pkey"
pg_dump: creating CONSTRAINT "public.user_badges user_badges_user_id_badge_id_key"
pg_dump: creating CONSTRAINT "public.weather_cache weather_cache_lat_lng_date_key"
pg_dump: creating CONSTRAINT "public.weather_cache weather_cache_pkey"
pg_dump: creating CONSTRAINT "realtime.messages messages_pkey"
pg_dump: creating CONSTRAINT "realtime.messages_2025_12_14 messages_2025_12_14_pkey"
pg_dump: creating CONSTRAINT "realtime.messages_2025_12_15 messages_2025_12_15_pkey"
pg_dump: creating CONSTRAINT "realtime.messages_2025_12_16 messages_2025_12_16_pkey"
pg_dump: creating CONSTRAINT "realtime.messages_2025_12_17 messages_2025_12_17_pkey"
pg_dump: creating CONSTRAINT "realtime.messages_2025_12_18 messages_2025_12_18_pkey"
pg_dump: creating CONSTRAINT "realtime.messages_2025_12_19 messages_2025_12_19_pkey"
pg_dump: creating CONSTRAINT "realtime.messages_2025_12_20 messages_2025_12_20_pkey"
pg_dump: creating CONSTRAINT "realtime.subscription pk_subscription"
pg_dump: creating CONSTRAINT "realtime.schema_migrations schema_migrations_pkey"
pg_dump: creating CONSTRAINT "supabase_functions.hooks hooks_pkey"
pg_dump: creating CONSTRAINT "supabase_functions.migrations migrations_pkey"
pg_dump: creating INDEX "_realtime.extensions_tenant_external_id_index"
pg_dump: creating INDEX "_realtime.extensions_tenant_external_id_type_index"
lass 2606 OID 25276)
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- TOC entry 4200 (class 2606 OID 25240)
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- TOC entry 4211 (class 2606 OID 25302)
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- TOC entry 4213 (class 2606 OID 25304)
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- TOC entry 4194 (class 2606 OID 25206)
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4089 (class 2606 OID 16477)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4092 (class 2606 OID 24957)
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- TOC entry 4179 (class 2606 OID 25087)
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- TOC entry 4181 (class 2606 OID 25085)
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 4186 (class 2606 OID 25101)
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- TOC entry 4100 (class 2606 OID 16500)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 4152 (class 2606 OID 24978)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4176 (class 2606 OID 25068)
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- TOC entry 4171 (class 2606 OID 25059)
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 4082 (class 2606 OID 25141)
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- TOC entry 4084 (class 2606 OID 16464)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4280 (class 2606 OID 33726)
-- Name: agronomist_advice agronomist_advice_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agronomist_advice
    ADD CONSTRAINT agronomist_advice_pkey PRIMARY KEY (id);


--
-- TOC entry 4275 (class 2606 OID 33691)
-- Name: agronomist_consultations agronomist_consultations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agronomist_consultations
    ADD CONSTRAINT agronomist_consultations_pkey PRIMARY KEY (id);


--
-- TOC entry 4272 (class 2606 OID 33675)
-- Name: agronomists agronomists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agronomists
    ADD CONSTRAINT agronomists_pkey PRIMARY KEY (id);


--
-- TOC entry 4318 (class 2606 OID 33920)
-- Name: ai_credit_transactions ai_credit_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_credit_transactions
    ADD CONSTRAINT ai_credit_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 4295 (class 2606 OID 33815)
-- Name: aquaponic_readings aquaponic_readings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aquaponic_readings
    ADD CONSTRAINT aquaponic_readings_pkey PRIMARY KEY (id);


--
-- TOC entry 4226 (class 2606 OID 33485)
-- Name: bed_planting_history bed_planting_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bed_planting_history
    ADD CONSTRAINT bed_planting_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4298 (class 2606 OID 33834)
-- Name: calendar_tasks calendar_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_tasks
    ADD CONSTRAINT calendar_tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 4303 (class 2606 OID 33857)
-- Name: challenge_completions challenge_completions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_completions
    ADD CONSTRAINT challenge_completions_pkey PRIMARY KEY (id);


--
-- TOC entry 4305 (class 2606 OID 33859)
-- Name: challenge_completions challenge_completions_user_id_challenge_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_completions
    ADD CONSTRAINT challenge_completions_user_id_challenge_id_key UNIQUE (user_id, challenge_id);


--
-- TOC entry 4350 (class 2606 OID 34054)
-- Name: crop_learning_events crop_learning_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crop_learning_events
    ADD CONSTRAINT crop_learning_events_pkey PRIMARY KEY (id);


--
-- TOC entry 4340 (class 2606 OID 34015)
-- Name: crop_mechanical_works crop_mechanical_works_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crop_mechanical_works
    ADD CONSTRAINT crop_mechanical_works_pkey PRIMARY KEY (id);


--
-- TOC entry 4345 (class 2606 OID 34031)
-- Name: custom_crops custom_crops_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_crops
    ADD CONSTRAINT custom_crops_pkey PRIMARY KEY (id);


--
-- TOC entry 4267 (class 2606 OID 33650)
-- Name: custom_plans custom_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_plans
    ADD CONSTRAINT custom_plans_pkey PRIMARY KEY (id);


--
-- TOC entry 4288 (class 2606 OID 33780)
-- Name: garden_accessories garden_accessories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_accessories
    ADD CONSTRAINT garden_accessories_pkey PRIMARY KEY (id);


--
-- TOC entry 4223 (class 2606 OID 33459)
-- Name: garden_beds garden_beds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_beds
    ADD CONSTRAINT garden_beds_pkey PRIMARY KEY (id);


--
-- TOC entry 4368 (class 2606 OID 34152)
-- Name: garden_correlations garden_correlations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_correlations
    ADD CONSTRAINT garden_correlations_pkey PRIMARY KEY (id);


--
-- TOC entry 4284 (class 2606 OID 33757)
-- Name: garden_obstacles garden_obstacles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_obstacles
    ADD CONSTRAINT garden_obstacles_pkey PRIMARY KEY (id);


--
-- TOC entry 4364 (class 2606 OID 34131)
-- Name: garden_patterns garden_patterns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_patterns
    ADD CONSTRAINT garden_patterns_pkey PRIMARY KEY (id);


--
-- TOC entry 4372 (class 2606 OID 34174)
-- Name: garden_season_analyses garden_season_analyses_garden_id_season_year_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_season_analyses
    ADD CONSTRAINT garden_season_analyses_garden_id_season_year_key UNIQUE (garden_id, season, year);


--
-- TOC entry 4374 (class 2606 OID 34172)
-- Name: garden_season_analyses garden_season_analyses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_season_analyses
    ADD CONSTRAINT garden_season_analyses_pkey PRIMARY KEY (id);


--
-- TOC entry 4231 (class 2606 OID 33513)
-- Name: garden_tasks garden_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_tasks
    ADD CONSTRAINT garden_tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 4360 (class 2606 OID 34109)
-- Name: garden_tree_memories garden_tree_memories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_tree_memories
    ADD CONSTRAINT garden_tree_memories_pkey PRIMARY KEY (id);


--
-- TOC entry 4356 (class 2606 OID 34086)
-- Name: garden_zone_memories garden_zone_memories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_zone_memories
    ADD CONSTRAINT garden_zone_memories_pkey PRIMARY KEY (id);


--
-- TOC entry 4219 (class 2606 OID 33437)
-- Name: gardens gardens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gardens
    ADD CONSTRAINT gardens_pkey PRIMARY KEY (id);


--
-- TOC entry 4240 (class 2606 OID 33542)
-- Name: harvest_logs harvest_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.harvest_logs
    ADD CONSTRAINT harvest_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4292 (class 2606 OID 33798)
-- Name: hydroponic_readings hydroponic_readings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hydroponic_readings
    ADD CONSTRAINT hydroponic_readings_pkey PRIMARY KEY (id);


--
-- TOC entry 4338 (class 2606 OID 33989)
-- Name: mechanical_work_register mechanical_work_register_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mechanical_work_register
    ADD CONSTRAINT mechanical_work_register_pkey PRIMARY KEY (id);


--
-- TOC entry 4249 (class 2606 OID 33565)
-- Name: photo_logs photo_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photo_logs
    ADD CONSTRAINT photo_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4326 (class 2606 OID 33938)
-- Name: professional_analytics professional_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_analytics
    ADD CONSTRAINT professional_analytics_pkey PRIMARY KEY (id);


--
-- TOC entry 4316 (class 2606 OID 33905)
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 4254 (class 2606 OID 33591)
-- Name: seed_inventory seed_inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seed_inventory
    ADD CONSTRAINT seed_inventory_pkey PRIMARY KEY (id);


--
-- TOC entry 4259 (class 2606 OID 33618)
-- Name: seedling_batches seedling_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seedling_batches
    ADD CONSTRAINT seedling_batches_pkey PRIMARY KEY (id);


--
-- TOC entry 4332 (class 2606 OID 33964)
-- Name: treatment_register treatment_register_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treatment_register
    ADD CONSTRAINT treatment_register_pkey PRIMARY KEY (id);


--
-- TOC entry 4312 (class 2606 OID 33876)
-- Name: user_badges user_badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_pkey PRIMARY KEY (id);


--
-- TOC entry 4314 (class 2606 OID 33878)
-- Name: user_badges user_badges_user_id_badge_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_badge_id_key UNIQUE (user_id, badge_id);


--
-- TOC entry 4263 (class 2606 OID 33637)
-- Name: weather_cache weather_cache_lat_lng_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weather_cache
    ADD CONSTRAINT weather_cache_lat_lng_date_key UNIQUE (lat_lng, date);


--
-- TOC entry 4265 (class 2606 OID 33635)
-- Name: weather_cache weather_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weather_cache
    ADD CONSTRAINT weather_cache_pkey PRIMARY KEY (id);


--
-- TOC entry 4127 (class 2606 OID 17587)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4130 (class 2606 OID 17598)
-- Name: messages_2025_12_14 messages_2025_12_14_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_12_14
    ADD CONSTRAINT messages_2025_12_14_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4133 (class 2606 OID 17610)
-- Name: messages_2025_12_15 messages_2025_12_15_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_12_15
    ADD CONSTRAINT messages_2025_12_15_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4136 (class 2606 OID 17622)
-- Name: messages_2025_12_16 messages_2025_12_16_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_12_16
    ADD CONSTRAINT messages_2025_12_16_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4139 (class 2606 OID 17634)
-- Name: messages_2025_12_17 messages_2025_12_17_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_12_17
    ADD CONSTRAINT messages_2025_12_17_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4142 (class 2606 OID 17646)
-- Name: messages_2025_12_18 messages_2025_12_18_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_12_18
    ADD CONSTRAINT messages_2025_12_18_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4217 (class 2606 OID 25340)
-- Name: messages_2025_12_19 messages_2025_12_19_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_12_19
    ADD CONSTRAINT messages_2025_12_19_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4378 (class 2606 OID 41317)
-- Name: messages_2025_12_20 messages_2025_12_20_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_12_20
    ADD CONSTRAINT messages_2025_12_20_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4123 (class 2606 OID 17441)
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- TOC entry 4120 (class 2606 OID 17414)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 4107 (class 2606 OID 16725)
-- Name: hooks hooks_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: -
--

ALTER TABLE ONLY supabase_functions.hooks
    ADD CONSTRAINT hooks_pkey PRIMARY KEY (id);


--
-- TOC entry 4105 (class 2606 OID 16715)
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: -
--

ALTER TABLE ONLY supabase_functions.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 4117 (class 1259 OID 17139)
-- Name: extensions_tenant_external_id_index; Type: INDEX; Schema: _realtime; Owner: -
--

CREATE INDEX extensions_tenant_external_id_index ON _realtime.extensions USING btree (tenant_external_id);


--
-- TOC entry 4118 (class 1259 OID 17108)
-- Name: extensions_tenant_external_id_type_index; Type: INDEX; Schema: _realtime; Owner: -
--

CREATE UNIQUE INDEX extensions_tenant_external_id_typpg_dump: creating INDEX "_realtime.tenants_external_id_index"
pg_dump: creating INDEX "auth.audit_logs_instance_id_idx"
pg_dump: creating INDEX "auth.confirmation_token_idx"
pg_dump: creating INDEX "auth.email_change_token_current_idx"
pg_dump: creating INDEX "auth.email_change_token_new_idx"
pg_dump: creating INDEX "auth.factor_id_created_at_idx"
pg_dump: creating INDEX "auth.flow_state_created_at_idx"
pg_dump: creating INDEX "auth.identities_email_idx"
pg_dump: creating COMMENT "auth.INDEX identities_email_idx"
pg_dump: creating INDEX "auth.identities_user_id_idx"
pg_dump: creating INDEX "auth.idx_auth_code"
pg_dump: creating INDEX "auth.idx_user_id_auth_method"
pg_dump: creating INDEX "auth.mfa_challenge_created_at_idx"
pg_dump: creating INDEX "auth.mfa_factors_user_friendly_name_unique"
pg_dump: creating INDEX "auth.mfa_factors_user_id_idx"
pg_dump: creating INDEX "auth.oauth_auth_pending_exp_idx"
pg_dump: creating INDEX "auth.oauth_clients_deleted_at_idx"
pg_dump: creating INDEX "auth.oauth_consents_active_client_idx"
pg_dump: creating INDEX "auth.oauth_consents_active_user_client_idx"
pg_dump: creating INDEX "auth.oauth_consents_user_order_idx"
pg_dump: creating INDEX "auth.one_time_tokens_relates_to_hash_idx"
pg_dump: creating INDEX "auth.one_time_tokens_token_hash_hash_idx"
pg_dump: creating INDEX "auth.one_time_tokens_user_id_token_type_key"
pg_dump: creating INDEX "auth.reauthentication_token_idx"
pg_dump: creating INDEX "auth.recovery_token_idx"
pg_dump: creating INDEX "auth.refresh_tokens_instance_id_idx"
pg_dump: creating INDEX "auth.refresh_tokens_instance_id_user_id_idx"
pg_dump: creating INDEX "auth.refresh_tokens_parent_idx"
pg_dump: creating INDEX "auth.refresh_tokens_session_id_revoked_idx"
pg_dump: creating INDEX "auth.refresh_tokens_updated_at_idx"
pg_dump: creating INDEX "auth.saml_providers_sso_provider_id_idx"
pg_dump: creating INDEX "auth.saml_relay_states_created_at_idx"
pg_dump: creating INDEX "auth.saml_relay_states_for_email_idx"
pg_dump: creating INDEX "auth.saml_relay_states_sso_provider_id_idx"
pg_dump: creating INDEX "auth.sessions_not_after_idx"
pg_dump: creating INDEX "auth.sessions_oauth_client_id_idx"
pg_dump: creating INDEX "auth.sessions_user_id_idx"
pg_dump: creating INDEX "auth.sso_domains_domain_idx"
pg_dump: creating INDEX "auth.sso_domains_sso_provider_id_idx"
pg_dump: creating INDEX "auth.sso_providers_resource_id_idx"
pg_dump: creating INDEX "auth.sso_providers_resource_id_pattern_idx"
pg_dump: creating INDEX "auth.unique_phone_factor_per_user"
pg_dump: creating INDEX "auth.user_id_created_at_idx"
pg_dump: creating INDEX "auth.users_email_partial_key"
pg_dump: creating COMMENT "auth.INDEX users_email_partial_key"
pg_dump: creating INDEX "auth.users_instance_id_email_idx"
pg_dump: creating INDEX "auth.users_instance_id_idx"
pg_dump: creating INDEX "auth.users_is_anonymous_idx"
pg_dump: creating INDEX "public.idx_accessories_category"
pg_dump: creating INDEX "public.idx_accessories_garden_id"
pg_dump: creating INDEX "public.idx_advice_consultation_id"
pg_dump: creating INDEX "public.idx_advice_task_id"
pg_dump: creating INDEX "public.idx_agronomists_user_id"
pg_dump: creating INDEX "public.idx_aquaponic_readings_garden_date"
pg_dump: creating INDEX "public.idx_bed_history_bed_id"
pg_dump: creating INDEX "public.idx_bed_history_plant_family"
pg_dump: creating INDEX "public.idx_bed_history_year_season"
pg_dump: creating INDEX "public.idx_calendar_tasks_garden"
pg_dump: creating INDEX "public.idx_calendar_tasks_recurring"
pg_dump: creating INDEX "public.idx_calendar_tasks_user_date"
pg_dump: creating INDEX "public.idx_challenge_completions_challenge"
pg_dump: creating INDEX "public.idx_challenge_completions_date"
pg_dump: creating INDEX "public.idx_challenge_completions_user"
pg_dump: creating INDEX "public.idx_consultations_agronomist_id"
pg_dump: creating INDEX "public.idx_consultations_task_id"
pg_dump: creating INDEX "public.idx_consultations_user_id"
pg_dump: creating INDEX "public.idx_correlations_custom_crop_id"
pg_dump: creating INDEX "public.idx_correlations_garden_id"
pg_dump: creating INDEX "public.idx_credit_transactions_created"
pg_dump: creating INDEX "public.idx_credit_transactions_user"
pg_dump: creating INDEX "public.idx_crop_mechanical_works_crop_id"
pg_dump: creating INDEX "public.idx_crop_mechanical_works_priority"
e_index ON _realtime.extensions USING btree (tenant_external_id, type);


--
-- TOC entry 4112 (class 1259 OID 17100)
-- Name: tenants_external_id_index; Type: INDEX; Schema: _realtime; Owner: -
--

CREATE UNIQUE INDEX tenants_external_id_index ON _realtime.tenants USING btree (external_id);


--
-- TOC entry 4098 (class 1259 OID 16495)
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- TOC entry 4072 (class 1259 OID 24967)
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4073 (class 1259 OID 24969)
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4074 (class 1259 OID 24970)
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4155 (class 1259 OID 25049)
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- TOC entry 4188 (class 1259 OID 25157)
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- TOC entry 4143 (class 1259 OID 25137)
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- TOC entry 4840 (class 0 OID 0)
-- Dependencies: 4143
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- TOC entry 4148 (class 1259 OID 24964)
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- TOC entry 4191 (class 1259 OID 25154)
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- TOC entry 4192 (class 1259 OID 25155)
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- TOC entry 4163 (class 1259 OID 25160)
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- TOC entry 4160 (class 1259 OID 25021)
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- TOC entry 4161 (class 1259 OID 25166)
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- TOC entry 4201 (class 1259 OID 25291)
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- TOC entry 4198 (class 1259 OID 25244)
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- TOC entry 4208 (class 1259 OID 25317)
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- TOC entry 4209 (class 1259 OID 25315)
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- TOC entry 4214 (class 1259 OID 25316)
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- TOC entry 4195 (class 1259 OID 25213)
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- TOC entry 4196 (class 1259 OID 25212)
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- TOC entry 4197 (class 1259 OID 25214)
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- TOC entry 4075 (class 1259 OID 24971)
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4076 (class 1259 OID 24968)
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4085 (class 1259 OID 16478)
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- TOC entry 4086 (class 1259 OID 16479)
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- TOC entry 4087 (class 1259 OID 24963)
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- TOC entry 4090 (class 1259 OID 25051)
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- TOC entry 4093 (class 1259 OID 25156)
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- TOC entry 4182 (class 1259 OID 25093)
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- TOC entry 4183 (class 1259 OID 25158)
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- TOC entry 4184 (class 1259 OID 25108)
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- TOC entry 4187 (class 1259 OID 25107)
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- TOC entry 4149 (class 1259 OID 25159)
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- TOC entry 4150 (class 1259 OID 25329)
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- TOC entry 4153 (class 1259 OID 25050)
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- TOC entry 4174 (class 1259 OID 25075)
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- TOC entry 4177 (class 1259 OID 25074)
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- TOC entry 4172 (class 1259 OID 25060)
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- TOC entry 4173 (class 1259 OID 25222)
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- TOC entry 4162 (class 1259 OID 25219)
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- TOC entry 4154 (class 1259 OID 25048)
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- TOC entry 4077 (class 1259 OID 25128)
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- TOC entry 4841 (class 0 OID 0)
-- Dependencies: 4077
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- TOC entry 4078 (class 1259 OID 24965)
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- TOC entry 4079 (class 1259 OID 16468)
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- TOC entry 4080 (class 1259 OID 25183)
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- TOC entry 4289 (class 1259 OID 33787)
-- Name: idx_accessories_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_accessories_category ON public.garden_accessories USING btree (category);


--
-- TOC entry 4290 (class 1259 OID 33786)
-- Name: idx_accessories_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_accessories_garden_id ON public.garden_accessories USING btree (garden_id);


--
-- TOC entry 4281 (class 1259 OID 33737)
-- Name: idx_advice_consultation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_advice_consultation_id ON public.agronomist_advice USING btree (consultation_id);


--
-- TOC entry 4282 (class 1259 OID 33738)
-- Name: idx_advice_task_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_advice_task_id ON public.agronomist_advice USING btree (task_id);


--
-- TOC entry 4273 (class 1259 OID 33681)
-- Name: idx_agronomists_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agronomists_user_id ON public.agronomists USING btree (user_id);


--
-- TOC entry 4296 (class 1259 OID 33821)
-- Name: idx_aquaponic_readings_garden_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_aquaponic_readings_garden_date ON public.aquaponic_readings USING btree (garden_id, reading_date DESC);


--
-- TOC entry 4227 (class 1259 OID 33491)
-- Name: idx_bed_history_bed_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bed_history_bed_id ON public.bed_planting_history USING btree (bed_id);


--
-- TOC entry 4228 (class 1259 OID 33493)
-- Name: idx_bed_history_plant_family; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bed_history_plant_family ON public.bed_planting_history USING btree (plant_family);


--
-- TOC entry 4229 (class 1259 OID 33492)
-- Name: idx_bed_history_year_season; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bed_history_year_season ON public.bed_planting_history USING btree (year, season);


--
-- TOC entry 4299 (class 1259 OID 33846)
-- Name: idx_calendar_tasks_garden; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_calendar_tasks_garden ON public.calendar_tasks USING btree (garden_id);


--
-- TOC entry 4300 (class 1259 OID 33847)
-- Name: idx_calendar_tasks_recurring; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_calendar_tasks_recurring ON public.calendar_tasks USING btree (recurring) WHERE (recurring = true);


--
-- TOC entry 4301 (class 1259 OID 33845)
-- Name: idx_calendar_tasks_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_calendar_tasks_user_date ON public.calendar_tasks USING btree (user_id, start_date);


--
-- TOC entry 4306 (class 1259 OID 33867)
-- Name: idx_challenge_completions_challenge; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_challenge_completions_challenge ON public.challenge_completions USING btree (challenge_id);


--
-- TOC entry 4307 (class 1259 OID 33866)
-- Name: idx_challenge_completions_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_challenge_completions_date ON public.challenge_completions USING btree (completed_at);


--
-- TOC entry 4308 (class 1259 OID 33865)
-- Name: idx_challenge_completions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_challenge_completions_user ON public.challenge_completions USING btree (user_id);


--
-- TOC entry 4276 (class 1259 OID 33712)
-- Name: idx_consultations_agronomist_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_consultations_agronomist_id ON public.agronomist_consultations USING btree (agronomist_id);


--
-- TOC entry 4277 (class 1259 OID 33714)
-- Name: idx_consultations_task_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_consultations_task_id ON public.agronomist_consultations USING btree (task_id);


--
-- TOC entry 4278 (class 1259 OID 33713)
-- Name: idx_consultations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_consultations_user_id ON public.agronomist_consultations USING btree (user_id);


--
-- TOC entry 4369 (class 1259 OID 34187)
-- Name: idx_correlations_custom_crop_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_correlations_custom_crop_id ON public.garden_correlations USING btree (custom_crop_id);


--
-- TOC entry 4370 (class 1259 OID 34186)
-- Name: idx_correlations_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_correlations_garden_id ON public.garden_correlations USING btree (garden_id);


--
-- TOC entry 4319 (class 1259 OID 33927)
-- Name: idx_credit_transactions_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_credit_transactions_created ON public.ai_credit_transactions USING btree (created_at DESC);


--
-- TOC entry 4320 (class 1259 OID 33926)
-- Name: idx_credit_transactions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_credit_transactions_user ON public.ai_credit_transactions USING btree (user_id);


--
-- TOC entry 4341 (class 1259 OID 34016)
-- Name: idx_crop_mechanical_works_crop_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crop_mechanical_works_crop_id ON public.crop_mechanical_works USING btree (crop_id);


--
pg_dump: creating INDEX "public.idx_crop_mechanical_works_work_type"
pg_dump: creating INDEX "public.idx_custom_crops_common_name"
pg_dump: creating INDEX "public.idx_custom_crops_garden_id"
pg_dump: creating INDEX "public.idx_custom_crops_user_id"
pg_dump: creating INDEX "public.idx_custom_plans_base_master_sheet"
pg_dump: creating INDEX "public.idx_custom_plans_garden_id"
pg_dump: creating INDEX "public.idx_custom_plans_user_id"
pg_dump: creating INDEX "public.idx_garden_beds_garden_id"
pg_dump: creating INDEX "public.idx_garden_obstacles_azimuth"
pg_dump: creating INDEX "public.idx_garden_obstacles_garden_id"
pg_dump: creating INDEX "public.idx_garden_tasks_bed_id"
pg_dump: creating INDEX "public.idx_garden_tasks_completed"
pg_dump: creating INDEX "public.idx_garden_tasks_date"
pg_dump: creating INDEX "public.idx_garden_tasks_garden_id"
pg_dump: creating INDEX "public.idx_garden_tasks_plant_name"
pg_dump: creating INDEX "public.idx_garden_tasks_suggested"
pg_dump: creating INDEX "public.idx_garden_tasks_suggested_date"
pg_dump: creating INDEX "public.idx_gardens_created_at"
pg_dump: creating INDEX "public.idx_gardens_user_id"
pg_dump: creating INDEX "public.idx_harvest_logs_garden_id"
pg_dump: creating INDEX "public.idx_harvest_logs_harvest_date"
pg_dump: creating INDEX "public.idx_harvest_logs_plant_name"
pg_dump: creating INDEX "public.idx_harvest_logs_task_id"
pg_dump: creating INDEX "public.idx_hydroponic_readings_garden_date"
pg_dump: creating INDEX "public.idx_learning_events_created_at"
pg_dump: creating INDEX "public.idx_learning_events_crop_id"
pg_dump: creating INDEX "public.idx_learning_events_type"
pg_dump: creating INDEX "public.idx_learning_events_user_id"
pg_dump: creating INDEX "public.idx_mechanical_work_date"
pg_dump: creating INDEX "public.idx_mechanical_work_garden"
pg_dump: creating INDEX "public.idx_mechanical_work_type"
pg_dump: creating INDEX "public.idx_mechanical_work_user"
pg_dump: creating INDEX "public.idx_patterns_custom_crop_id"
pg_dump: creating INDEX "public.idx_patterns_garden_id"
pg_dump: creating INDEX "public.idx_photo_logs_garden_id"
pg_dump: creating INDEX "public.idx_photo_logs_photo_date"
pg_dump: creating INDEX "public.idx_photo_logs_task_id"
pg_dump: creating INDEX "public.idx_professional_analytics_crop"
pg_dump: creating INDEX "public.idx_professional_analytics_garden"
pg_dump: creating INDEX "public.idx_professional_analytics_user"
pg_dump: creating INDEX "public.idx_professional_analytics_year"
pg_dump: creating INDEX "public.idx_season_analyses_garden_id"
pg_dump: creating INDEX "public.idx_seed_inventory_expiry_year"
pg_dump: creating INDEX "public.idx_seed_inventory_garden_id"
pg_dump: creating INDEX "public.idx_seed_inventory_user_id"
pg_dump: creating INDEX "public.idx_seedling_batches_garden_id"
pg_dump: creating INDEX "public.idx_seedling_batches_phase"
pg_dump: creating INDEX "public.idx_seedling_batches_sowing_date"
pg_dump: creating INDEX "public.idx_treatment_register_crop"
pg_dump: creating INDEX "public.idx_treatment_register_date"
pg_dump: creating INDEX "public.idx_treatment_register_garden"
pg_dump: creating INDEX "public.idx_treatment_register_user"
pg_dump: creating INDEX "public.idx_tree_memories_custom_crop_id"
pg_dump: creating INDEX "public.idx_tree_memories_garden_id"
pg_dump: creating INDEX "public.idx_user_badges_earned"
pg_dump: creating INDEX "public.idx_user_badges_user"
pg_dump: creating INDEX "public.idx_weather_cache_cached_at"
pg_dump: creating INDEX "public.idx_weather_cache_lat_lng_date"
pg_dump: creating INDEX "public.idx_zone_memories_custom_crop_id"
pg_dump: creating INDEX "public.idx_zone_memories_garden_id"
pg_dump: creating INDEX "realtime.ix_realtime_subscription_entity"
pg_dump: creating INDEX "realtime.messages_inserted_at_topic_index"
pg_dump: creating INDEX "realtime.messages_2025_12_14_inserted_at_topic_idx"
pg_dump: creating INDEX "realtime.messages_2025_12_15_inserted_at_topic_idx"
pg_dump: creating INDEX "realtime.messages_2025_12_16_inserted_at_topic_idx"
pg_dump: creating INDEX "realtime.messages_2025_12_17_inserted_at_topic_idx"
pg_dump: creating INDEX "realtime.messages_2025_12_18_inserted_at_topic_idx"
pg_dump: creating INDEX "realtime.messages_2025_12_19_inserted_at_topic_idx"
pg_dump: creating INDEX "realtime.messages_2025_12_20_inserted_at_topic_idx"
pg_dump: creating INDEX "realtime.subscription_subscription_id_entity_filters_key"
-- TOC entry 4342 (class 1259 OID 34018)
-- Name: idx_crop_mechanical_works_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crop_mechanical_works_priority ON public.crop_mechanical_works USING btree (priority DESC);


--
-- TOC entry 4343 (class 1259 OID 34017)
-- Name: idx_crop_mechanical_works_work_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crop_mechanical_works_work_type ON public.crop_mechanical_works USING btree (work_type);


--
-- TOC entry 4346 (class 1259 OID 34044)
-- Name: idx_custom_crops_common_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_custom_crops_common_name ON public.custom_crops USING btree (common_name);


--
-- TOC entry 4347 (class 1259 OID 34043)
-- Name: idx_custom_crops_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_custom_crops_garden_id ON public.custom_crops USING btree (garden_id);


--
-- TOC entry 4348 (class 1259 OID 34042)
-- Name: idx_custom_crops_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_custom_crops_user_id ON public.custom_crops USING btree (user_id);


--
-- TOC entry 4268 (class 1259 OID 33663)
-- Name: idx_custom_plans_base_master_sheet; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_custom_plans_base_master_sheet ON public.custom_plans USING btree (base_master_sheet_id);


--
-- TOC entry 4269 (class 1259 OID 33662)
-- Name: idx_custom_plans_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_custom_plans_garden_id ON public.custom_plans USING btree (garden_id);


--
-- TOC entry 4270 (class 1259 OID 33661)
-- Name: idx_custom_plans_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_custom_plans_user_id ON public.custom_plans USING btree (user_id);


--
-- TOC entry 4224 (class 1259 OID 33475)
-- Name: idx_garden_beds_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garden_beds_garden_id ON public.garden_beds USING btree (garden_id);


--
-- TOC entry 4285 (class 1259 OID 33764)
-- Name: idx_garden_obstacles_azimuth; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garden_obstacles_azimuth ON public.garden_obstacles USING btree (azimuth);


--
-- TOC entry 4286 (class 1259 OID 33763)
-- Name: idx_garden_obstacles_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garden_obstacles_garden_id ON public.garden_obstacles USING btree (garden_id);


--
-- TOC entry 4232 (class 1259 OID 33525)
-- Name: idx_garden_tasks_bed_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garden_tasks_bed_id ON public.garden_tasks USING btree (bed_id);


--
-- TOC entry 4233 (class 1259 OID 33527)
-- Name: idx_garden_tasks_completed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garden_tasks_completed ON public.garden_tasks USING btree (completed);


--
-- TOC entry 4234 (class 1259 OID 33526)
-- Name: idx_garden_tasks_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garden_tasks_date ON public.garden_tasks USING btree (date);


--
-- TOC entry 4235 (class 1259 OID 33524)
-- Name: idx_garden_tasks_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garden_tasks_garden_id ON public.garden_tasks USING btree (garden_id);


--
-- TOC entry 4236 (class 1259 OID 33528)
-- Name: idx_garden_tasks_plant_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garden_tasks_plant_name ON public.garden_tasks USING btree (plant_name);


--
-- TOC entry 4237 (class 1259 OID 33529)
-- Name: idx_garden_tasks_suggested; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garden_tasks_suggested ON public.garden_tasks USING btree (is_suggested) WHERE (is_suggested = true);


--
-- TOC entry 4238 (class 1259 OID 33530)
-- Name: idx_garden_tasks_suggested_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garden_tasks_suggested_date ON public.garden_tasks USING btree (suggested_date) WHERE (suggested_date IS NOT NULL);


--
-- TOC entry 4220 (class 1259 OID 33444)
-- Name: idx_gardens_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gardens_created_at ON public.gardens USING btree (created_at);


--
-- TOC entry 4221 (class 1259 OID 33443)
-- Name: idx_gardens_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gardens_user_id ON public.gardens USING btree (user_id);


--
-- TOC entry 4241 (class 1259 OID 33553)
-- Name: idx_harvest_logs_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_harvest_logs_garden_id ON public.harvest_logs USING btree (garden_id);


--
-- TOC entry 4242 (class 1259 OID 33555)
-- Name: idx_harvest_logs_harvest_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_harvest_logs_harvest_date ON public.harvest_logs USING btree (harvest_date);


--
-- TOC entry 4243 (class 1259 OID 33556)
-- Name: idx_harvest_logs_plant_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_harvest_logs_plant_name ON public.harvest_logs USING btree (plant_name);


--
-- TOC entry 4244 (class 1259 OID 33554)
-- Name: idx_harvest_logs_task_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_harvest_logs_task_id ON public.harvest_logs USING btree (task_id);


--
-- TOC entry 4293 (class 1259 OID 33804)
-- Name: idx_hydroponic_readings_garden_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hydroponic_readings_garden_date ON public.hydroponic_readings USING btree (garden_id, reading_date DESC);


--
-- TOC entry 4351 (class 1259 OID 34073)
-- Name: idx_learning_events_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_learning_events_created_at ON public.crop_learning_events USING btree (created_at DESC);


--
-- TOC entry 4352 (class 1259 OID 34070)
-- Name: idx_learning_events_crop_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_learning_events_crop_id ON public.crop_learning_events USING btree (custom_crop_id);


--
-- TOC entry 4353 (class 1259 OID 34072)
-- Name: idx_learning_events_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_learning_events_type ON public.crop_learning_events USING btree (event_type);


--
-- TOC entry 4354 (class 1259 OID 34071)
-- Name: idx_learning_events_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_learning_events_user_id ON public.crop_learning_events USING btree (user_id);


--
-- TOC entry 4333 (class 1259 OID 34001)
-- Name: idx_mechanical_work_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mechanical_work_date ON public.mechanical_work_register USING btree (work_date DESC);


--
-- TOC entry 4334 (class 1259 OID 34002)
-- Name: idx_mechanical_work_garden; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mechanical_work_garden ON public.mechanical_work_register USING btree (garden_id);


--
-- TOC entry 4335 (class 1259 OID 34003)
-- Name: idx_mechanical_work_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mechanical_work_type ON public.mechanical_work_register USING btree (work_type);


--
-- TOC entry 4336 (class 1259 OID 34000)
-- Name: idx_mechanical_work_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mechanical_work_user ON public.mechanical_work_register USING btree (user_id);


--
-- TOC entry 4365 (class 1259 OID 34185)
-- Name: idx_patterns_custom_crop_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patterns_custom_crop_id ON public.garden_patterns USING btree (custom_crop_id);


--
-- TOC entry 4366 (class 1259 OID 34184)
-- Name: idx_patterns_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patterns_garden_id ON public.garden_patterns USING btree (garden_id);


--
-- TOC entry 4245 (class 1259 OID 33577)
-- Name: idx_photo_logs_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_photo_logs_garden_id ON public.photo_logs USING btree (garden_id);


--
-- TOC entry 4246 (class 1259 OID 33578)
-- Name: idx_photo_logs_photo_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_photo_logs_photo_date ON public.photo_logs USING btree (photo_date);


--
-- TOC entry 4247 (class 1259 OID 33576)
-- Name: idx_photo_logs_task_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_photo_logs_task_id ON public.photo_logs USING btree (task_id);


--
-- TOC entry 4321 (class 1259 OID 33952)
-- Name: idx_professional_analytics_crop; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_analytics_crop ON public.professional_analytics USING btree (crop_name);


--
-- TOC entry 4322 (class 1259 OID 33950)
-- Name: idx_professional_analytics_garden; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_analytics_garden ON public.professional_analytics USING btree (garden_id);


--
-- TOC entry 4323 (class 1259 OID 33949)
-- Name: idx_professional_analytics_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_analytics_user ON public.professional_analytics USING btree (user_id);


--
-- TOC entry 4324 (class 1259 OID 33951)
-- Name: idx_professional_analytics_year; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_analytics_year ON public.professional_analytics USING btree (year);


--
-- TOC entry 4375 (class 1259 OID 34188)
-- Name: idx_season_analyses_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_season_analyses_garden_id ON public.garden_season_analyses USING btree (garden_id);


--
-- TOC entry 4250 (class 1259 OID 33604)
-- Name: idx_seed_inventory_expiry_year; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_seed_inventory_expiry_year ON public.seed_inventory USING btree (expiry_year);


--
-- TOC entry 4251 (class 1259 OID 33603)
-- Name: idx_seed_inventory_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_seed_inventory_garden_id ON public.seed_inventory USING btree (garden_id);


--
-- TOC entry 4252 (class 1259 OID 33602)
-- Name: idx_seed_inventory_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_seed_inventory_user_id ON public.seed_inventory USING btree (user_id);


--
-- TOC entry 4255 (class 1259 OID 33624)
-- Name: idx_seedling_batches_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_seedling_batches_garden_id ON public.seedling_batches USING btree (garden_id);


--
-- TOC entry 4256 (class 1259 OID 33626)
-- Name: idx_seedling_batches_phase; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_seedling_batches_phase ON public.seedling_batches USING btree (phase);


--
-- TOC entry 4257 (class 1259 OID 33625)
-- Name: idx_seedling_batches_sowing_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_seedling_batches_sowing_date ON public.seedling_batches USING btree (sowing_date);


--
-- TOC entry 4327 (class 1259 OID 33978)
-- Name: idx_treatment_register_crop; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_treatment_register_crop ON public.treatment_register USING btree (crop_name);


--
-- TOC entry 4328 (class 1259 OID 33976)
-- Name: idx_treatment_register_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_treatment_register_date ON public.treatment_register USING btree (treatment_date DESC);


--
-- TOC entry 4329 (class 1259 OID 33977)
-- Name: idx_treatment_register_garden; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_treatment_register_garden ON public.treatment_register USING btree (garden_id);


--
-- TOC entry 4330 (class 1259 OID 33975)
-- Name: idx_treatment_register_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_treatment_register_user ON public.treatment_register USING btree (user_id);


--
-- TOC entry 4361 (class 1259 OID 34183)
-- Name: idx_tree_memories_custom_crop_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tree_memories_custom_crop_id ON public.garden_tree_memories USING btree (custom_crop_id);


--
-- TOC entry 4362 (class 1259 OID 34182)
-- Name: idx_tree_memories_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tree_memories_garden_id ON public.garden_tree_memories USING btree (garden_id);


--
-- TOC entry 4309 (class 1259 OID 33885)
-- Name: idx_user_badges_earned; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_badges_earned ON public.user_badges USING btree (earned_at);


--
-- TOC entry 4310 (class 1259 OID 33884)
-- Name: idx_user_badges_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_badges_user ON public.user_badges USING btree (user_id);


--
-- TOC entry 4260 (class 1259 OID 33639)
-- Name: idx_weather_cache_cached_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weather_cache_cached_at ON public.weather_cache USING btree (cached_at);


--
-- TOC entry 4261 (class 1259 OID 33638)
-- Name: idx_weather_cache_lat_lng_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weather_cache_lat_lng_date ON public.weather_cache USING btree (lat_lng, date);


--
-- TOC entry 4357 (class 1259 OID 34181)
-- Name: idx_zone_memories_custom_crop_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_zone_memories_custom_crop_id ON public.garden_zone_memories USING btree (custom_crop_id);


--
-- TOC entry 4358 (class 1259 OID 34180)
-- Name: idx_zone_memories_garden_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_zone_memories_garden_id ON public.garden_zone_memories USING btree (garden_id);


--
-- TOC entry 4121 (class 1259 OID 17588)
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- TOC entry 4125 (class 1259 OID 17589)
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4128 (class 1259 OID 17599)
-- Name: messages_2025_12_14_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_12_14_inserted_at_topic_idx ON realtime.messages_2025_12_14 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4131 (class 1259 OID 17611)
-- Name: messages_2025_12_15_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_12_15_inserted_at_topic_idx ON realtime.messages_2025_12_15 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4134 (class 1259 OID 17623)
-- Name: messages_2025_12_16_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_12_16_inserted_at_topic_idx ON realtime.messages_2025_12_16 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4137 (class 1259 OID 17635)
-- Name: messages_2025_12_17_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_12_17_inserted_at_topic_idx ON realtime.messages_2025_12_17 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4140 (class 1259 OID 17647)
-- Name: messages_2025_12_18_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_12_18_inserted_at_topic_idx ON realtime.messages_2025_12_18 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4215 (class 1259 OID 25341)
-- Name: messages_2025_12_19_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_12_19_inserted_at_topic_idx ON realtime.messages_2025_12_19 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4376 (class 1259 OID 41318)
-- Name: messages_2025_12_20_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_12_20_inserted_at_topic_idx ON realtime.messages_2025_12_20 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4124 (class 1259 OID 17490)
-- Name: subscriptionpg_dump: creating INDEX "supabase_functions.supabase_functions_hooks_h_table_id_h_name_idx"
pg_dump: creating INDEX "supabase_functions.supabase_functions_hooks_request_id_idx"
pg_dump: creating INDEX ATTACH "realtime.messages_2025_12_14_inserted_at_topic_idx"
pg_dump: creating INDEX ATTACH "realtime.messages_2025_12_14_pkey"
pg_dump: creating INDEX ATTACH "realtime.messages_2025_12_15_inserted_at_topic_idx"
pg_dump: creating INDEX ATTACH "realtime.messages_2025_12_15_pkey"
pg_dump: creating INDEX ATTACH "realtime.messages_2025_12_16_inserted_at_topic_idx"
pg_dump: creating INDEX ATTACH "realtime.messages_2025_12_16_pkey"
pg_dump: creating INDEX ATTACH "realtime.messages_2025_12_17_inserted_at_topic_idx"
pg_dump: creating INDEX ATTACH "realtime.messages_2025_12_17_pkey"
pg_dump: creating INDEX ATTACH "realtime.messages_2025_12_18_inserted_at_topic_idx"
pg_dump: creating INDEX ATTACH "realtime.messages_2025_12_18_pkey"
pg_dump: creating INDEX ATTACH "realtime.messages_2025_12_19_inserted_at_topic_idx"
pg_dump: creating INDEX ATTACH "realtime.messages_2025_12_19_pkey"
pg_dump: creating INDEX ATTACH "realtime.messages_2025_12_20_inserted_at_topic_idx"
pg_dump: creating INDEX ATTACH "realtime.messages_2025_12_20_pkey"
pg_dump: creating TRIGGER "auth.users on_user_created_credits"
pg_dump: creating TRIGGER "public.agronomists update_agronomists_updated_at"
pg_dump: creating TRIGGER "public.calendar_tasks update_calendar_tasks_updated_at"
pg_dump: creating TRIGGER "public.custom_crops update_custom_crops_timestamp"
pg_dump: creating TRIGGER "public.custom_crops update_custom_crops_updated_at"
pg_dump: creating TRIGGER "public.custom_plans update_custom_plans_updated_at"
pg_dump: creating TRIGGER "public.garden_beds update_garden_beds_updated_at"
pg_dump: creating TRIGGER "public.garden_obstacles update_garden_obstacles_updated_at"
pg_dump: creating TRIGGER "public.garden_tasks update_garden_tasks_updated_at"
pg_dump: creating TRIGGER "public.gardens update_gardens_updated_at"
pg_dump: creating TRIGGER "public.seed_inventory update_seed_inventory_updated_at"
pg_dump: creating TRIGGER "public.seedling_batches update_seedling_batches_updated_at"
pg_dump: creating TRIGGER "realtime.subscription tr_check_filters"
pg_dump: creating FK CONSTRAINT "_realtime.extensions extensions_tenant_external_id_fkey"
pg_dump: creating FK CONSTRAINT "auth.identities identities_user_id_fkey"
pg_dump: creating FK CONSTRAINT "auth.mfa_amr_claims mfa_amr_claims_session_id_fkey"
pg_dump: creating FK CONSTRAINT "auth.mfa_challenges mfa_challenges_auth_factor_id_fkey"
pg_dump: creating FK CONSTRAINT "auth.mfa_factors mfa_factors_user_id_fkey"
pg_dump: creating FK CONSTRAINT "auth.oauth_authorizations oauth_authorizations_client_id_fkey"
pg_dump: creating FK CONSTRAINT "auth.oauth_authorizations oauth_authorizations_user_id_fkey"
pg_dump: creating FK CONSTRAINT "auth.oauth_consents oauth_consents_client_id_fkey"
pg_dump: creating FK CONSTRAINT "auth.oauth_consents oauth_consents_user_id_fkey"
pg_dump: creating FK CONSTRAINT "auth.one_time_tokens one_time_tokens_user_id_fkey"
pg_dump: creating FK CONSTRAINT "auth.refresh_tokens refresh_tokens_session_id_fkey"
pg_dump: creating FK CONSTRAINT "auth.saml_providers saml_providers_sso_provider_id_fkey"
pg_dump: creating FK CONSTRAINT "auth.saml_relay_states saml_relay_states_flow_state_id_fkey"
pg_dump: creating FK CONSTRAINT "auth.saml_relay_states saml_relay_states_sso_provider_id_fkey"
pg_dump: creating FK CONSTRAINT "auth.sessions sessions_oauth_client_id_fkey"
pg_dump: creating FK CONSTRAINT "auth.sessions sessions_user_id_fkey"
pg_dump: creating FK CONSTRAINT "auth.sso_domains sso_domains_sso_provider_id_fkey"
pg_dump: creating FK CONSTRAINT "public.agronomist_advice agronomist_advice_consultation_id_fkey"
pg_dump: creating FK CONSTRAINT "public.agronomist_advice agronomist_advice_task_id_fkey"
pg_dump: creating FK CONSTRAINT "public.agronomist_consultations agronomist_consultations_agronomist_id_fkey"
pg_dump: creating FK CONSTRAINT "public.agronomist_consultations agronomist_consultations_garden_id_fkey"
pg_dump: creating FK CONSTRAINT "public.agronomist_consultations agronomist_consultations_task_id_fkey"
pg_dump: creating FK CONSTRAINT "public.agronomist_consultations agronomist_consultations_user_id_fkey"
pg_dump: creating FK CONSTRAINT "public.agronomists agronomists_user_id_fkey"
pg_dump: creating FK CONSTRAINT "public.ai_credit_transactions ai_credit_transactions_user_id_fkey"
pg_dump: creating FK CONSTRAINT "public.aquaponic_readings aquaponic_readings_garden_id_fkey"
pg_dump: creating FK CONSTRAINT "public.bed_planting_history bed_planting_history_bed_id_fkey"
_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- TOC entry 4108 (class 1259 OID 16727)
-- Name: supabase_functions_hooks_h_table_id_h_name_idx; Type: INDEX; Schema: supabase_functions; Owner: -
--

CREATE INDEX supabase_functions_hooks_h_table_id_h_name_idx ON supabase_functions.hooks USING btree (hook_table_id, hook_name);


--
-- TOC entry 4109 (class 1259 OID 16726)
-- Name: supabase_functions_hooks_request_id_idx; Type: INDEX; Schema: supabase_functions; Owner: -
--

CREATE INDEX supabase_functions_hooks_request_id_idx ON supabase_functions.hooks USING btree (request_id);


--
-- TOC entry 4379 (class 0 OID 0)
-- Name: messages_2025_12_14_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_14_inserted_at_topic_idx;


--
-- TOC entry 4380 (class 0 OID 0)
-- Name: messages_2025_12_14_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_14_pkey;


--
-- TOC entry 4381 (class 0 OID 0)
-- Name: messages_2025_12_15_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_15_inserted_at_topic_idx;


--
-- TOC entry 4382 (class 0 OID 0)
-- Name: messages_2025_12_15_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_15_pkey;


--
-- TOC entry 4383 (class 0 OID 0)
-- Name: messages_2025_12_16_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_16_inserted_at_topic_idx;


--
-- TOC entry 4384 (class 0 OID 0)
-- Name: messages_2025_12_16_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_16_pkey;


--
-- TOC entry 4385 (class 0 OID 0)
-- Name: messages_2025_12_17_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_17_inserted_at_topic_idx;


--
-- TOC entry 4386 (class 0 OID 0)
-- Name: messages_2025_12_17_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_17_pkey;


--
-- TOC entry 4387 (class 0 OID 0)
-- Name: messages_2025_12_18_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_18_inserted_at_topic_idx;


--
-- TOC entry 4388 (class 0 OID 0)
-- Name: messages_2025_12_18_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_18_pkey;


--
-- TOC entry 4389 (class 0 OID 0)
-- Name: messages_2025_12_19_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_19_inserted_at_topic_idx;


--
-- TOC entry 4390 (class 0 OID 0)
-- Name: messages_2025_12_19_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_19_pkey;


--
-- TOC entry 4391 (class 0 OID 0)
-- Name: messages_2025_12_20_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_20_inserted_at_topic_idx;


--
-- TOC entry 4392 (class 0 OID 0)
-- Name: messages_2025_12_20_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_20_pkey;


--
-- TOC entry 4463 (class 2620 OID 34205)
-- Name: users on_user_created_credits; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER on_user_created_credits AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();


--
-- TOC entry 4471 (class 2620 OID 34201)
-- Name: agronomists update_agronomists_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_agronomists_updated_at BEFORE UPDATE ON public.agronomists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4473 (class 2620 OID 34203)
-- Name: calendar_tasks update_calendar_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_calendar_tasks_updated_at BEFORE UPDATE ON public.calendar_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4474 (class 2620 OID 34437)
-- Name: custom_crops update_custom_crops_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_custom_crops_timestamp BEFORE UPDATE ON public.custom_crops FOR EACH ROW EXECUTE FUNCTION public.update_custom_crops_updated_at();


--
-- TOC entry 4475 (class 2620 OID 34204)
-- Name: custom_crops update_custom_crops_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_custom_crops_updated_at BEFORE UPDATE ON public.custom_crops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4470 (class 2620 OID 34200)
-- Name: custom_plans update_custom_plans_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_custom_plans_updated_at BEFORE UPDATE ON public.custom_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4466 (class 2620 OID 34196)
-- Name: garden_beds update_garden_beds_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_garden_beds_updated_at BEFORE UPDATE ON public.garden_beds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4472 (class 2620 OID 34202)
-- Name: garden_obstacles update_garden_obstacles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_garden_obstacles_updated_at BEFORE UPDATE ON public.garden_obstacles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4467 (class 2620 OID 34197)
-- Name: garden_tasks update_garden_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_garden_tasks_updated_at BEFORE UPDATE ON public.garden_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4465 (class 2620 OID 34195)
-- Name: gardens update_gardens_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_gardens_updated_at BEFORE UPDATE ON public.gardens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4468 (class 2620 OID 34198)
-- Name: seed_inventory update_seed_inventory_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_seed_inventory_updated_at BEFORE UPDATE ON public.seed_inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4469 (class 2620 OID 34199)
-- Name: seedling_batches update_seedling_batches_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_seedling_batches_updated_at BEFORE UPDATE ON public.seedling_batches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4464 (class 2620 OID 17446)
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- TOC entry 4394 (class 2606 OID 17109)
-- Name: extensions extensions_tenant_external_id_fkey; Type: FK CONSTRAINT; Schema: _realtime; Owner: -
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_tenant_external_id_fkey FOREIGN KEY (tenant_external_id) REFERENCES _realtime.tenants(external_id) ON DELETE CASCADE;


--
-- TOC entry 4395 (class 2606 OID 24951)
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4400 (class 2606 OID 25041)
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- TOC entry 4399 (class 2606 OID 25029)
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- TOC entry 4398 (class 2606 OID 25016)
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4406 (class 2606 OID 25281)
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- TOC entry 4407 (class 2606 OID 25286)
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4408 (class 2606 OID 25310)
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- TOC entry 4409 (class 2606 OID 25305)
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4405 (class 2606 OID 25207)
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4393 (class 2606 OID 24984)
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- TOC entry 4402 (class 2606 OID 25088)
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 4403 (class 2606 OID 25161)
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- TOC entry 4404 (class 2606 OID 25102)
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 4396 (class 2606 OID 25324)
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- TOC entry 4397 (class 2606 OID 24979)
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4401 (class 2606 OID 25069)
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 4431 (class 2606 OID 33727)
-- Name: agronomist_advice agronomist_advice_consultation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agronomist_advice
    ADD CONSTRAINT agronomist_advice_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.agronomist_consultations(id) ON DELETE CASCADE;


--
-- TOC entry 4432 (class 2606 OID 33732)
-- Name: agronomist_advice agronomist_advice_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agronomist_advice
    ADD CONSTRAINT agronomist_advice_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.garden_tasks(id) ON DELETE SET NULL;


--
-- TOC entry 4427 (class 2606 OID 33692)
-- Name: agronomist_consultations agronomist_consultations_agronomist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agronomist_consultations
    ADD CONSTRAINT agronomist_consultations_agronomist_id_fkey FOREIGN KEY (agronomist_id) REFERENCES public.agronomists(id) ON DELETE CASCADE;


--
-- TOC entry 4428 (class 2606 OID 33702)
-- Name: agronomist_consultations agronomist_consultations_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agronomist_consultations
    ADD CONSTRAINT agronomist_consultations_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE SET NULL;


--
-- TOC entry 4429 (class 2606 OID 33707)
-- Name: agronomist_consultations agronomist_consultations_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agronomist_consultations
    ADD CONSTRAINT agronomist_consultations_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.garden_tasks(id) ON DELETE SET NULL;


--
-- TOC entry 4430 (class 2606 OID 33697)
-- Name: agronomist_consultations agronomist_consultations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agronomist_consultations
    ADD CONSTRAINT agronomist_consultations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4426 (class 2606 OID 33676)
-- Name: agronomists agronomists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agronomists
    ADD CONSTRAINT agronomists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4442 (class 2606 OID 33921)
-- Name: ai_credit_transactions ai_credit_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_credit_transactions
    ADD CONSTRAINT ai_credit_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4436 (class 2606 OID 33816)
-- Name: aquaponic_readings aquaponic_readings_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aquaponic_readings
    ADD CONSTRAINT aquaponic_readings_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4414 (class 2606 OID 33486)
-- Name: bed_planting_history bed_planting_history_bed_id_fkey; Type: FK CONSTRAINT; Scpg_dump: creating FK CONSTRAINT "public.calendar_tasks calendar_tasks_garden_id_fkey"
pg_dump: creating FK CONSTRAINT "public.calendar_tasks calendar_tasks_user_id_fkey"
pg_dump: creating FK CONSTRAINT "public.challenge_completions challenge_completions_user_id_fkey"
pg_dump: creating FK CONSTRAINT "public.crop_learning_events crop_learning_events_custom_crop_id_fkey"
pg_dump: creating FK CONSTRAINT "public.crop_learning_events crop_learning_events_garden_id_fkey"
pg_dump: creating FK CONSTRAINT "public.crop_learning_events crop_learning_events_user_id_fkey"
pg_dump: creating FK CONSTRAINT "public.custom_crops custom_crops_garden_id_fkey"
pg_dump: creating FK CONSTRAINT "public.custom_crops custom_crops_user_id_fkey"
pg_dump: creating FK CONSTRAINT "public.custom_plans custom_plans_garden_id_fkey"
pg_dump: creating FK CONSTRAINT "public.custom_plans custom_plans_user_id_fkey"
pg_dump: creating FK CONSTRAINT "public.garden_accessories garden_accessories_garden_id_fkey"
pg_dump: creating FK CONSTRAINT "public.garden_beds garden_beds_covering_structure_id_fkey"
pg_dump: creating FK CONSTRAINT "public.garden_beds garden_beds_garden_id_fkey"
pg_dump: creating FK CONSTRAINT "public.garden_beds garden_beds_structure_id_fkey"
pg_dump: creating FK CONSTRAINT "public.garden_correlations garden_correlations_custom_crop_id_fkey"
pg_dump: creating FK CONSTRAINT "public.garden_correlations garden_correlations_garden_id_fkey"
pg_dump: creating FK CONSTRAINT "public.garden_obstacles garden_obstacles_garden_id_fkey"
pg_dump: creating FK CONSTRAINT "public.garden_patterns garden_patterns_custom_crop_id_fkey"
pg_dump: creating FK CONSTRAINT "public.garden_patterns garden_patterns_garden_id_fkey"
pg_dump: creating FK CONSTRAINT "public.garden_season_analyses garden_season_analyses_garden_id_fkey"
pg_dump: creating FK CONSTRAINT "public.garden_tasks garden_tasks_bed_id_fkey"
pg_dump: creating FK CONSTRAINT "public.garden_tasks garden_tasks_garden_id_fkey"
pg_dump: creating FK CONSTRAINT "public.garden_tree_memories garden_tree_memories_custom_crop_id_fkey"
pg_dump: creating FK CONSTRAINT "public.garden_tree_memories garden_tree_memories_garden_id_fkey"
pg_dump: creating FK CONSTRAINT "public.garden_zone_memories garden_zone_memories_custom_crop_id_fkey"
pg_dump: creating FK CONSTRAINT "public.garden_zone_memories garden_zone_memories_garden_id_fkey"
pg_dump: creating FK CONSTRAINT "public.gardens gardens_user_id_fkey"
pg_dump: creating FK CONSTRAINT "public.harvest_logs harvest_logs_garden_id_fkey"
pg_dump: creating FK CONSTRAINT "public.harvest_logs harvest_logs_task_id_fkey"
pg_dump: creating FK CONSTRAINT "public.hydroponic_readings hydroponic_readings_garden_id_fkey"
pg_dump: creating FK CONSTRAINT "public.mechanical_work_register mechanical_work_register_garden_id_fkey"
pg_dump: creating FK CONSTRAINT "public.mechanical_work_register mechanical_work_register_user_id_fkey"
pg_dump: creating FK CONSTRAINT "public.photo_logs photo_logs_garden_id_fkey"
pg_dump: creating FK CONSTRAINT "public.photo_logs photo_logs_task_id_fkey"
pg_dump: creating FK CONSTRAINT "public.professional_analytics professional_analytics_garden_id_fkey"
pg_dump: creating FK CONSTRAINT "public.professional_analytics professional_analytics_user_id_fkey"
pg_dump: creating FK CONSTRAINT "public.profiles profiles_id_fkey"
pg_dump: creating FK CONSTRAINT "public.seed_inventory seed_inventory_garden_id_fkey"
pg_dump: creating FK CONSTRAINT "public.seed_inventory seed_inventory_user_id_fkey"
pg_dump: creating FK CONSTRAINT "public.seedling_batches seedling_batches_garden_id_fkey"
pg_dump: creating FK CONSTRAINT "public.treatment_register treatment_register_garden_id_fkey"
pg_dump: creating FK CONSTRAINT "public.treatment_register treatment_register_user_id_fkey"
pg_dump: creating FK CONSTRAINT "public.user_badges user_badges_user_id_fkey"
pg_dump: creating ROW SECURITY "auth.audit_log_entries"
pg_dump: creating ROW SECURITY "auth.flow_state"
pg_dump: creating ROW SECURITY "auth.identities"
pg_dump: creating ROW SECURITY "auth.instances"
pg_dump: creating ROW SECURITY "auth.mfa_amr_claims"
pg_dump: creating ROW SECURITY "auth.mfa_challenges"
pg_dump: creating ROW SECURITY "auth.mfa_factors"
pg_dump: creating ROW SECURITY "auth.one_time_tokens"
pg_dump: creating ROW SECURITY "auth.refresh_tokens"
pg_dump: creating ROW SECURITY "auth.saml_providers"
pg_dump: creating ROW SECURITY "auth.saml_relay_states"
pg_dump: creating ROW SECURITY "auth.schema_migrations"
pg_dump: creating ROW SECURITY "auth.sessions"
hema: public; Owner: -
--

ALTER TABLE ONLY public.bed_planting_history
    ADD CONSTRAINT bed_planting_history_bed_id_fkey FOREIGN KEY (bed_id) REFERENCES public.garden_beds(id) ON DELETE CASCADE;


--
-- TOC entry 4437 (class 2606 OID 33840)
-- Name: calendar_tasks calendar_tasks_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_tasks
    ADD CONSTRAINT calendar_tasks_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4438 (class 2606 OID 33835)
-- Name: calendar_tasks calendar_tasks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_tasks
    ADD CONSTRAINT calendar_tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4439 (class 2606 OID 33860)
-- Name: challenge_completions challenge_completions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_completions
    ADD CONSTRAINT challenge_completions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4451 (class 2606 OID 34055)
-- Name: crop_learning_events crop_learning_events_custom_crop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crop_learning_events
    ADD CONSTRAINT crop_learning_events_custom_crop_id_fkey FOREIGN KEY (custom_crop_id) REFERENCES public.custom_crops(id) ON DELETE CASCADE;


--
-- TOC entry 4452 (class 2606 OID 34065)
-- Name: crop_learning_events crop_learning_events_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crop_learning_events
    ADD CONSTRAINT crop_learning_events_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE SET NULL;


--
-- TOC entry 4453 (class 2606 OID 34060)
-- Name: crop_learning_events crop_learning_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crop_learning_events
    ADD CONSTRAINT crop_learning_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4449 (class 2606 OID 34037)
-- Name: custom_crops custom_crops_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_crops
    ADD CONSTRAINT custom_crops_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE SET NULL;


--
-- TOC entry 4450 (class 2606 OID 34032)
-- Name: custom_crops custom_crops_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_crops
    ADD CONSTRAINT custom_crops_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4424 (class 2606 OID 33656)
-- Name: custom_plans custom_plans_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_plans
    ADD CONSTRAINT custom_plans_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE SET NULL;


--
-- TOC entry 4425 (class 2606 OID 33651)
-- Name: custom_plans custom_plans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_plans
    ADD CONSTRAINT custom_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4434 (class 2606 OID 33781)
-- Name: garden_accessories garden_accessories_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_accessories
    ADD CONSTRAINT garden_accessories_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4411 (class 2606 OID 33470)
-- Name: garden_beds garden_beds_covering_structure_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_beds
    ADD CONSTRAINT garden_beds_covering_structure_id_fkey FOREIGN KEY (covering_structure_id) REFERENCES public.gardens(id) ON DELETE SET NULL;


--
-- TOC entry 4412 (class 2606 OID 33460)
-- Name: garden_beds garden_beds_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_beds
    ADD CONSTRAINT garden_beds_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4413 (class 2606 OID 33465)
-- Name: garden_beds garden_beds_structure_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_beds
    ADD CONSTRAINT garden_beds_structure_id_fkey FOREIGN KEY (structure_id) REFERENCES public.gardens(id) ON DELETE SET NULL;


--
-- TOC entry 4460 (class 2606 OID 34158)
-- Name: garden_correlations garden_correlations_custom_crop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_correlations
    ADD CONSTRAINT garden_correlations_custom_crop_id_fkey FOREIGN KEY (custom_crop_id) REFERENCES public.custom_crops(id) ON DELETE SET NULL;


--
-- TOC entry 4461 (class 2606 OID 34153)
-- Name: garden_correlations garden_correlations_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_correlations
    ADD CONSTRAINT garden_correlations_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4433 (class 2606 OID 33758)
-- Name: garden_obstacles garden_obstacles_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_obstacles
    ADD CONSTRAINT garden_obstacles_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4458 (class 2606 OID 34137)
-- Name: garden_patterns garden_patterns_custom_crop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_patterns
    ADD CONSTRAINT garden_patterns_custom_crop_id_fkey FOREIGN KEY (custom_crop_id) REFERENCES public.custom_crops(id) ON DELETE SET NULL;


--
-- TOC entry 4459 (class 2606 OID 34132)
-- Name: garden_patterns garden_patterns_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_patterns
    ADD CONSTRAINT garden_patterns_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4462 (class 2606 OID 34175)
-- Name: garden_season_analyses garden_season_analyses_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_season_analyses
    ADD CONSTRAINT garden_season_analyses_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4415 (class 2606 OID 33519)
-- Name: garden_tasks garden_tasks_bed_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_tasks
    ADD CONSTRAINT garden_tasks_bed_id_fkey FOREIGN KEY (bed_id) REFERENCES public.garden_beds(id) ON DELETE SET NULL;


--
-- TOC entry 4416 (class 2606 OID 33514)
-- Name: garden_tasks garden_tasks_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_tasks
    ADD CONSTRAINT garden_tasks_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4456 (class 2606 OID 34115)
-- Name: garden_tree_memories garden_tree_memories_custom_crop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_tree_memories
    ADD CONSTRAINT garden_tree_memories_custom_crop_id_fkey FOREIGN KEY (custom_crop_id) REFERENCES public.custom_crops(id) ON DELETE SET NULL;


--
-- TOC entry 4457 (class 2606 OID 34110)
-- Name: garden_tree_memories garden_tree_memories_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_tree_memories
    ADD CONSTRAINT garden_tree_memories_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4454 (class 2606 OID 34092)
-- Name: garden_zone_memories garden_zone_memories_custom_crop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_zone_memories
    ADD CONSTRAINT garden_zone_memories_custom_crop_id_fkey FOREIGN KEY (custom_crop_id) REFERENCES public.custom_crops(id) ON DELETE SET NULL;


--
-- TOC entry 4455 (class 2606 OID 34087)
-- Name: garden_zone_memories garden_zone_memories_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garden_zone_memories
    ADD CONSTRAINT garden_zone_memories_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4410 (class 2606 OID 33438)
-- Name: gardens gardens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gardens
    ADD CONSTRAINT gardens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4417 (class 2606 OID 33543)
-- Name: harvest_logs harvest_logs_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.harvest_logs
    ADD CONSTRAINT harvest_logs_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4418 (class 2606 OID 33548)
-- Name: harvest_logs harvest_logs_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.harvest_logs
    ADD CONSTRAINT harvest_logs_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.garden_tasks(id) ON DELETE SET NULL;


--
-- TOC entry 4435 (class 2606 OID 33799)
-- Name: hydroponic_readings hydroponic_readings_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hydroponic_readings
    ADD CONSTRAINT hydroponic_readings_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4447 (class 2606 OID 33995)
-- Name: mechanical_work_register mechanical_work_register_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mechanical_work_register
    ADD CONSTRAINT mechanical_work_register_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4448 (class 2606 OID 33990)
-- Name: mechanical_work_register mechanical_work_register_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mechanical_work_register
    ADD CONSTRAINT mechanical_work_register_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4419 (class 2606 OID 33571)
-- Name: photo_logs photo_logs_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photo_logs
    ADD CONSTRAINT photo_logs_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4420 (class 2606 OID 33566)
-- Name: photo_logs photo_logs_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photo_logs
    ADD CONSTRAINT photo_logs_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.garden_tasks(id) ON DELETE CASCADE;


--
-- TOC entry 4443 (class 2606 OID 33944)
-- Name: professional_analytics professional_analytics_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_analytics
    ADD CONSTRAINT professional_analytics_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4444 (class 2606 OID 33939)
-- Name: professional_analytics professional_analytics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_analytics
    ADD CONSTRAINT professional_analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4441 (class 2606 OID 33906)
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4421 (class 2606 OID 33597)
-- Name: seed_inventory seed_inventory_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seed_inventory
    ADD CONSTRAINT seed_inventory_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4422 (class 2606 OID 33592)
-- Name: seed_inventory seed_inventory_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seed_inventory
    ADD CONSTRAINT seed_inventory_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4423 (class 2606 OID 33619)
-- Name: seedling_batches seedling_batches_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seedling_batches
    ADD CONSTRAINT seedling_batches_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4445 (class 2606 OID 33970)
-- Name: treatment_register treatment_register_garden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treatment_register
    ADD CONSTRAINT treatment_register_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id) ON DELETE CASCADE;


--
-- TOC entry 4446 (class 2606 OID 33965)
-- Name: treatment_register treatment_register_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treatment_register
    ADD CONSTRAINT treatment_register_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4440 (class 2606 OID 33879)
-- Name: user_badges user_badges_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4627 (class 0 OID 16488)
-- Dependencies: 302
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4639 (class 0 OID 25147)
-- Dependencies: 341
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4630 (class 0 OID 24944)
-- Dependencies: 332
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4626 (class 0 OID 16481)
-- Dependencies: 301
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4634 (class 0 OID 25034)
-- Dependencies: 336
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4633 (class 0 OID 25022)
-- Dependencies: 335
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4632 (class 0 OID 25009)
-- Dependencies: 334
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4640 (class 0 OID 25197)
-- Dependencies: 342
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4625 (class 0 OID 16470)
-- Dependencies: 300
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4637 (class 0 OID 25076)
-- Dependencies: 339
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4638 (class 0 OID 25094)
-- Dependencies: 340
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4628 (class 0 OID 16496)
-- Dependencies: 303
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4631 (class 0 OID 24974)
-- Dependencies: 333
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALpg_dump: creating ROW SECURITY "auth.sso_domains"
pg_dump: creating ROW SECURITY "auth.sso_providers"
pg_dump: creating ROW SECURITY "auth.users"
pg_dump: creating POLICY "public.crop_mechanical_works Crop mechanical works are publicly readable"
pg_dump: creating POLICY "public.garden_accessories Users can access accessories in their gardens"
pg_dump: creating POLICY "public.aquaponic_readings Users can access aquaponic readings in their gardens"
pg_dump: creating POLICY "public.hydroponic_readings Users can access hydroponic readings in their gardens"
pg_dump: creating POLICY "public.seedling_batches Users can access seedling batches in their gardens"
pg_dump: creating POLICY "public.garden_obstacles Users can create obstacles in their gardens"
pg_dump: creating POLICY "public.custom_plans Users can create their own custom plans"
pg_dump: creating POLICY "public.garden_obstacles Users can delete obstacles in their gardens"
pg_dump: creating POLICY "public.calendar_tasks Users can delete their own calendar tasks"
pg_dump: creating POLICY "public.custom_plans Users can delete their own custom plans"
pg_dump: creating POLICY "public.user_badges Users can insert their own badges"
pg_dump: creating POLICY "public.calendar_tasks Users can insert their own calendar tasks"
pg_dump: creating POLICY "public.challenge_completions Users can insert their own challenge completions"
pg_dump: creating POLICY "public.weather_cache Users can insert weather cache"
pg_dump: creating POLICY "public.agronomists Users can manage their own agronomists"
pg_dump: creating POLICY "public.agronomist_consultations Users can manage their own consultations"
pg_dump: creating POLICY "public.garden_correlations Users can manage their own correlations"
pg_dump: creating POLICY "public.custom_crops Users can manage their own custom crops"
pg_dump: creating POLICY "public.crop_learning_events Users can manage their own learning events"
pg_dump: creating POLICY "public.garden_patterns Users can manage their own patterns"
pg_dump: creating POLICY "public.garden_season_analyses Users can manage their own season analyses"
pg_dump: creating POLICY "public.garden_tree_memories Users can manage their own tree memories"
pg_dump: creating POLICY "public.garden_zone_memories Users can manage their own zone memories"
pg_dump: creating POLICY "public.garden_beds Users can only access beds in their gardens"
pg_dump: creating POLICY "public.harvest_logs Users can only access harvests in their gardens"
pg_dump: creating POLICY "public.bed_planting_history Users can only access history in their beds"
pg_dump: creating POLICY "public.photo_logs Users can only access photos in their gardens"
pg_dump: creating POLICY "public.garden_tasks Users can only access tasks in their gardens"
pg_dump: creating POLICY "public.gardens Users can only access their gardens"
pg_dump: creating POLICY "public.professional_analytics Users can only access their own analytics"
pg_dump: creating POLICY "public.mechanical_work_register Users can only access their own mechanical work"
pg_dump: creating POLICY "public.profiles Users can only access their own profile"
pg_dump: creating POLICY "public.seed_inventory Users can only access their own seeds"
pg_dump: creating POLICY "public.ai_credit_transactions Users can only access their own transactions"
pg_dump: creating POLICY "public.treatment_register Users can only access their own treatments"
pg_dump: creating POLICY "public.agronomist_advice Users can update advice from their consultations"
pg_dump: creating POLICY "public.garden_obstacles Users can update obstacles in their gardens"
pg_dump: creating POLICY "public.calendar_tasks Users can update their own calendar tasks"
pg_dump: creating POLICY "public.challenge_completions Users can update their own challenge completions"
pg_dump: creating POLICY "public.custom_plans Users can update their own custom plans"
pg_dump: creating POLICY "public.agronomist_advice Users can view advice from their consultations"
pg_dump: creating POLICY "public.garden_obstacles Users can view obstacles in their gardens"
pg_dump: creating POLICY "public.user_badges Users can view their own badges"
pg_dump: creating POLICY "public.calendar_tasks Users can view their own calendar tasks"
pg_dump: creating POLICY "public.challenge_completions Users can view their own challenge completions"
pg_dump: creating POLICY "public.custom_plans Users can view their own or public custom plans"
TER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4636 (class 0 OID 25061)
-- Dependencies: 338
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4635 (class 0 OID 25052)
-- Dependencies: 337
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4624 (class 0 OID 16458)
-- Dependencies: 298
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4704 (class 3256 OID 34237)
-- Name: crop_mechanical_works Crop mechanical works are publicly readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Crop mechanical works are publicly readable" ON public.crop_mechanical_works FOR SELECT USING (true);


--
-- TOC entry 4696 (class 3256 OID 34229)
-- Name: garden_accessories Users can access accessories in their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can access accessories in their gardens" ON public.garden_accessories USING ((EXISTS ( SELECT 1
   FROM public.gardens
  WHERE ((gardens.id = garden_accessories.garden_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4698 (class 3256 OID 34231)
-- Name: aquaponic_readings Users can access aquaponic readings in their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can access aquaponic readings in their gardens" ON public.aquaponic_readings USING ((EXISTS ( SELECT 1
   FROM public.gardens
  WHERE ((gardens.id = aquaponic_readings.garden_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4697 (class 3256 OID 34230)
-- Name: hydroponic_readings Users can access hydroponic readings in their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can access hydroponic readings in their gardens" ON public.hydroponic_readings USING ((EXISTS ( SELECT 1
   FROM public.gardens
  WHERE ((gardens.id = hydroponic_readings.garden_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4681 (class 3256 OID 34214)
-- Name: seedling_batches Users can access seedling batches in their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can access seedling batches in their gardens" ON public.seedling_batches USING ((EXISTS ( SELECT 1
   FROM public.gardens
  WHERE ((gardens.id = seedling_batches.garden_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4693 (class 3256 OID 34226)
-- Name: garden_obstacles Users can create obstacles in their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create obstacles in their gardens" ON public.garden_obstacles FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.gardens
  WHERE ((gardens.id = garden_obstacles.garden_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4685 (class 3256 OID 34218)
-- Name: custom_plans Users can create their own custom plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own custom plans" ON public.custom_plans FOR INSERT WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4695 (class 3256 OID 34228)
-- Name: garden_obstacles Users can delete obstacles in their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete obstacles in their gardens" ON public.garden_obstacles FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.gardens
  WHERE ((gardens.id = garden_obstacles.garden_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4708 (class 3256 OID 34243)
-- Name: calendar_tasks Users can delete their own calendar tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own calendar tasks" ON public.calendar_tasks FOR DELETE USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4687 (class 3256 OID 34220)
-- Name: custom_plans Users can delete their own custom plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own custom plans" ON public.custom_plans FOR DELETE USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4713 (class 3256 OID 34248)
-- Name: user_badges Users can insert their own badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own badges" ON public.user_badges FOR INSERT WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4706 (class 3256 OID 34241)
-- Name: calendar_tasks Users can insert their own calendar tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own calendar tasks" ON public.calendar_tasks FOR INSERT WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4710 (class 3256 OID 34245)
-- Name: challenge_completions Users can insert their own challenge completions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own challenge completions" ON public.challenge_completions FOR INSERT WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4683 (class 3256 OID 34216)
-- Name: weather_cache Users can insert weather cache; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert weather cache" ON public.weather_cache FOR INSERT WITH CHECK (true);


--
-- TOC entry 4688 (class 3256 OID 34221)
-- Name: agronomists Users can manage their own agronomists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own agronomists" ON public.agronomists USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4689 (class 3256 OID 34222)
-- Name: agronomist_consultations Users can manage their own consultations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own consultations" ON public.agronomist_consultations USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4719 (class 3256 OID 34527)
-- Name: garden_correlations Users can manage their own correlations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own correlations" ON public.garden_correlations USING ((( SELECT auth.uid() AS uid) IN ( SELECT gardens.user_id
   FROM public.gardens
  WHERE (gardens.id = garden_correlations.garden_id))));


--
-- TOC entry 4714 (class 3256 OID 34438)
-- Name: custom_crops Users can manage their own custom crops; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own custom crops" ON public.custom_crops USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4715 (class 3256 OID 34439)
-- Name: crop_learning_events Users can manage their own learning events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own learning events" ON public.crop_learning_events USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4718 (class 3256 OID 34526)
-- Name: garden_patterns Users can manage their own patterns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own patterns" ON public.garden_patterns USING ((( SELECT auth.uid() AS uid) IN ( SELECT gardens.user_id
   FROM public.gardens
  WHERE (gardens.id = garden_patterns.garden_id))));


--
-- TOC entry 4720 (class 3256 OID 34528)
-- Name: garden_season_analyses Users can manage their own season analyses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own season analyses" ON public.garden_season_analyses USING ((( SELECT auth.uid() AS uid) IN ( SELECT gardens.user_id
   FROM public.gardens
  WHERE (gardens.id = garden_season_analyses.garden_id))));


--
-- TOC entry 4717 (class 3256 OID 34525)
-- Name: garden_tree_memories Users can manage their own tree memories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own tree memories" ON public.garden_tree_memories USING ((( SELECT auth.uid() AS uid) IN ( SELECT gardens.user_id
   FROM public.gardens
  WHERE (gardens.id = garden_tree_memories.garden_id))));


--
-- TOC entry 4716 (class 3256 OID 34524)
-- Name: garden_zone_memories Users can manage their own zone memories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own zone memories" ON public.garden_zone_memories USING ((( SELECT auth.uid() AS uid) IN ( SELECT gardens.user_id
   FROM public.gardens
  WHERE (gardens.id = garden_zone_memories.garden_id))));


--
-- TOC entry 4675 (class 3256 OID 34207)
-- Name: garden_beds Users can only access beds in their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only access beds in their gardens" ON public.garden_beds USING ((EXISTS ( SELECT 1
   FROM public.gardens
  WHERE ((gardens.id = garden_beds.garden_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4678 (class 3256 OID 34211)
-- Name: harvest_logs Users can only access harvests in their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only access harvests in their gardens" ON public.harvest_logs USING ((EXISTS ( SELECT 1
   FROM public.gardens
  WHERE ((gardens.id = harvest_logs.garden_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4676 (class 3256 OID 34208)
-- Name: bed_planting_history Users can only access history in their beds; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only access history in their beds" ON public.bed_planting_history USING ((EXISTS ( SELECT 1
   FROM (public.garden_beds
     JOIN public.gardens ON ((gardens.id = garden_beds.garden_id)))
  WHERE ((garden_beds.id = bed_planting_history.bed_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4679 (class 3256 OID 34212)
-- Name: photo_logs Users can only access photos in their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only access photos in their gardens" ON public.photo_logs USING ((EXISTS ( SELECT 1
   FROM public.gardens
  WHERE ((gardens.id = photo_logs.garden_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4677 (class 3256 OID 34210)
-- Name: garden_tasks Users can only access tasks in their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only access tasks in their gardens" ON public.garden_tasks USING ((EXISTS ( SELECT 1
   FROM public.gardens
  WHERE ((gardens.id = garden_tasks.garden_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4674 (class 3256 OID 34206)
-- Name: gardens Users can only access their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only access their gardens" ON public.gardens USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4701 (class 3256 OID 34234)
-- Name: professional_analytics Users can only access their own analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only access their own analytics" ON public.professional_analytics USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4703 (class 3256 OID 34236)
-- Name: mechanical_work_register Users can only access their own mechanical work; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only access their own mechanical work" ON public.mechanical_work_register USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4699 (class 3256 OID 34232)
-- Name: profiles Users can only access their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only access their own profile" ON public.profiles USING ((( SELECT auth.uid() AS uid) = id));


--
-- TOC entry 4680 (class 3256 OID 34213)
-- Name: seed_inventory Users can only access their own seeds; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only access their own seeds" ON public.seed_inventory USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4700 (class 3256 OID 34233)
-- Name: ai_credit_transactions Users can only access their own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only access their own transactions" ON public.ai_credit_transactions USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4702 (class 3256 OID 34235)
-- Name: treatment_register Users can only access their own treatments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only access their own treatments" ON public.treatment_register USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4691 (class 3256 OID 34224)
-- Name: agronomist_advice Users can update advice from their consultations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update advice from their consultations" ON public.agronomist_advice FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.agronomist_consultations
  WHERE ((agronomist_consultations.id = agronomist_advice.consultation_id) AND (agronomist_consultations.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4694 (class 3256 OID 34227)
-- Name: garden_obstacles Users can update obstacles in their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update obstacles in their gardens" ON public.garden_obstacles FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.gardens
  WHERE ((gardens.id = garden_obstacles.garden_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4707 (class 3256 OID 34242)
-- Name: calendar_tasks Users can update their own calendar tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own calendar tasks" ON public.calendar_tasks FOR UPDATE USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4711 (class 3256 OID 34246)
-- Name: challenge_completions Users can update their own challenge completions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own challenge completions" ON public.challenge_completions FOR UPDATE USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4686 (class 3256 OID 34219)
-- Name: custom_plans Users can update their own custom plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own custom plans" ON public.custom_plans FOR UPDATE USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4690 (class 3256 OID 34223)
-- Name: agronomist_advice Users can view advice from their consultations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view advice from their consultations" ON public.agronomist_advice FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.agronomist_consultations
  WHERE ((agronomist_consultations.id = agronomist_advice.consultation_id) AND (agronomist_consultations.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4692 (class 3256 OID 34225)
-- Name: garden_obstacles Users can view obstacles in their gardens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view obstacles in their gardens" ON public.garden_obstacles FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.gardens
  WHERE ((gardens.id = garden_obstacles.garden_id) AND (gardens.user_id = ( SELECT auth.uid() AS uid))))));


--
-- TOC entry 4712 (class 3256 OID 34247)
-- Name: user_badges Users can view their own badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own badges" ON public.user_badges FOR SELECT USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4705 (class 3256 OID 34240)
-- Name: calendar_tasks Users can view their own calendar tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own calendar tasks" ON public.calendar_tasks FOR SELECT USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4709 (class 3256 OID 34244)
-- Name: challenge_completions Users can view their own challenge completions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own challenge completions" ON public.challenge_completions FOR SELECT USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- TOC entry 4684 (class 3256 OID 34217)
-- Name: custom_plans Users can view their own or publipg_dump: creating POLICY "public.weather_cache Weather cache is publicly readable"
pg_dump: creating ROW SECURITY "public.agronomist_advice"
pg_dump: creating ROW SECURITY "public.agronomist_consultations"
pg_dump: creating ROW SECURITY "public.agronomists"
pg_dump: creating ROW SECURITY "public.ai_credit_transactions"
pg_dump: creating ROW SECURITY "public.aquaponic_readings"
pg_dump: creating ROW SECURITY "public.bed_planting_history"
pg_dump: creating ROW SECURITY "public.calendar_tasks"
pg_dump: creating ROW SECURITY "public.challenge_completions"
pg_dump: creating ROW SECURITY "public.crop_learning_events"
pg_dump: creating ROW SECURITY "public.crop_mechanical_works"
pg_dump: creating ROW SECURITY "public.custom_crops"
pg_dump: creating ROW SECURITY "public.custom_plans"
pg_dump: creating ROW SECURITY "public.garden_accessories"
pg_dump: creating ROW SECURITY "public.garden_beds"
pg_dump: creating ROW SECURITY "public.garden_correlations"
pg_dump: creating ROW SECURITY "public.garden_obstacles"
pg_dump: creating ROW SECURITY "public.garden_patterns"
pg_dump: creating ROW SECURITY "public.garden_season_analyses"
pg_dump: creating ROW SECURITY "public.garden_tasks"
pg_dump: creating ROW SECURITY "public.garden_tree_memories"
pg_dump: creating ROW SECURITY "public.garden_zone_memories"
pg_dump: creating ROW SECURITY "public.gardens"
pg_dump: creating ROW SECURITY "public.harvest_logs"
pg_dump: creating ROW SECURITY "public.hydroponic_readings"
pg_dump: creating ROW SECURITY "public.mechanical_work_register"
pg_dump: creating ROW SECURITY "public.photo_logs"
pg_dump: creating ROW SECURITY "public.professional_analytics"
pg_dump: creating ROW SECURITY "public.profiles"
pg_dump: creating ROW SECURITY "public.seed_inventory"
pg_dump: creating ROW SECURITY "public.seedling_batches"
pg_dump: creating ROW SECURITY "public.treatment_register"
pg_dump: creating ROW SECURITY "public.user_badges"
pg_dump: creating ROW SECURITY "public.weather_cache"
pg_dump: creating ROW SECURITY "realtime.messages"
pg_dump: creating PUBLICATION "supabase_realtime"
pg_dump: creating EVENT TRIGGER "issue_graphql_placeholder"
pg_dump: creating EVENT TRIGGER "issue_pg_cron_access"
pg_dump: creating EVENT TRIGGER "issue_pg_graphql_access"
pg_dump: creating EVENT TRIGGER "issue_pg_net_access"
pg_dump: creating EVENT TRIGGER "pgrst_ddl_watch"
pg_dump: creating EVENT TRIGGER "pgrst_drop_watch"
c custom plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own or public custom plans" ON public.custom_plans FOR SELECT USING (((( SELECT auth.uid() AS uid) = user_id) OR (is_public = true)));


--
-- TOC entry 4682 (class 3256 OID 34215)
-- Name: weather_cache Weather cache is publicly readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Weather cache is publicly readable" ON public.weather_cache FOR SELECT USING (true);


--
-- TOC entry 4653 (class 0 OID 33715)
-- Dependencies: 359
-- Name: agronomist_advice; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agronomist_advice ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4652 (class 0 OID 33682)
-- Dependencies: 358
-- Name: agronomist_consultations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agronomist_consultations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4651 (class 0 OID 33664)
-- Dependencies: 357
-- Name: agronomists; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agronomists ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4662 (class 0 OID 33911)
-- Dependencies: 368
-- Name: ai_credit_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_credit_transactions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4657 (class 0 OID 33805)
-- Dependencies: 363
-- Name: aquaponic_readings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.aquaponic_readings ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4643 (class 0 OID 33476)
-- Dependencies: 349
-- Name: bed_planting_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bed_planting_history ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4658 (class 0 OID 33822)
-- Dependencies: 364
-- Name: calendar_tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.calendar_tasks ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4659 (class 0 OID 33848)
-- Dependencies: 365
-- Name: challenge_completions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4668 (class 0 OID 34045)
-- Dependencies: 374
-- Name: crop_learning_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crop_learning_events ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4666 (class 0 OID 34004)
-- Dependencies: 372
-- Name: crop_mechanical_works; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crop_mechanical_works ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4667 (class 0 OID 34019)
-- Dependencies: 373
-- Name: custom_crops; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.custom_crops ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4650 (class 0 OID 33640)
-- Dependencies: 356
-- Name: custom_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.custom_plans ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4655 (class 0 OID 33765)
-- Dependencies: 361
-- Name: garden_accessories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.garden_accessories ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4642 (class 0 OID 33445)
-- Dependencies: 348
-- Name: garden_beds; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.garden_beds ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4672 (class 0 OID 34142)
-- Dependencies: 378
-- Name: garden_correlations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.garden_correlations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4654 (class 0 OID 33739)
-- Dependencies: 360
-- Name: garden_obstacles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.garden_obstacles ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4671 (class 0 OID 34120)
-- Dependencies: 377
-- Name: garden_patterns; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.garden_patterns ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4673 (class 0 OID 34163)
-- Dependencies: 379
-- Name: garden_season_analyses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.garden_season_analyses ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4644 (class 0 OID 33494)
-- Dependencies: 350
-- Name: garden_tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.garden_tasks ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4670 (class 0 OID 34097)
-- Dependencies: 376
-- Name: garden_tree_memories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.garden_tree_memories ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4669 (class 0 OID 34074)
-- Dependencies: 375
-- Name: garden_zone_memories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.garden_zone_memories ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4641 (class 0 OID 33416)
-- Dependencies: 347
-- Name: gardens; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.gardens ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4645 (class 0 OID 33531)
-- Dependencies: 351
-- Name: harvest_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.harvest_logs ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4656 (class 0 OID 33788)
-- Dependencies: 362
-- Name: hydroponic_readings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.hydroponic_readings ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4665 (class 0 OID 33979)
-- Dependencies: 371
-- Name: mechanical_work_register; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mechanical_work_register ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4646 (class 0 OID 33557)
-- Dependencies: 352
-- Name: photo_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.photo_logs ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4663 (class 0 OID 33928)
-- Dependencies: 369
-- Name: professional_analytics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.professional_analytics ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4661 (class 0 OID 33886)
-- Dependencies: 367
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4647 (class 0 OID 33579)
-- Dependencies: 353
-- Name: seed_inventory; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.seed_inventory ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4648 (class 0 OID 33605)
-- Dependencies: 354
-- Name: seedling_batches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.seedling_batches ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4664 (class 0 OID 33953)
-- Dependencies: 370
-- Name: treatment_register; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.treatment_register ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4660 (class 0 OID 33868)
-- Dependencies: 366
-- Name: user_badges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4649 (class 0 OID 33627)
-- Dependencies: 355
-- Name: weather_cache; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4629 (class 0 OID 17573)
-- Dependencies: 326
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4721 (class 6104 OID 16388)
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- TOC entry 3769 (class 3466 OID 16571)
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- TOC entry 3774 (class 3466 OID 16650)
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- TOC entry 3768 (class 3466 OID 16569)
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- TOC entry 3775 (class 3466 OID 16653)
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- TOC entry 3770 (class 3466 OID 16572)
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- TOC entry 3771 (class 3466 OID 16573)
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


-- Completed on 2025-12-17 20:44:16 CET

--
-- PostgreSQL database dump complete
--

\unrestrict C5UihbcZadNpPzzbzw3rlWoInsrc6hsbjUULF07LL2bfRmgsn643giIMDu1WXWH

