


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."cultivation_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "archetype_id" "text" NOT NULL,
    "archetype_category" "text" NOT NULL,
    "plant_name" "text" NOT NULL,
    "variety_name" "text",
    "starting_material" "text" NOT NULL,
    "seed_inventory_id" "uuid",
    "seedling_batch_id" "uuid",
    "sapling_inventory_id" "uuid",
    "current_phase" "text" NOT NULL,
    "current_location" "text" NOT NULL,
    "current_quantity" integer DEFAULT 1 NOT NULL,
    "planned_start_date" "date" NOT NULL,
    "actual_start_date" "date",
    "estimated_harvest_date" "date",
    "actual_harvest_date" "date",
    "phase_history" "jsonb" DEFAULT '[]'::"jsonb",
    "notes" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "cultivation_plans_archetype_category_check" CHECK (("archetype_category" = ANY (ARRAY['vegetable'::"text", 'aromatic'::"text", 'berry'::"text", 'tree'::"text"]))),
    CONSTRAINT "cultivation_plans_current_phase_check" CHECK (("current_phase" = ANY (ARRAY['planning'::"text", 'preparation'::"text", 'sowing'::"text", 'germination'::"text", 'nursing'::"text", 'hardening'::"text", 'transplanting'::"text", 'growing'::"text", 'flowering'::"text", 'fruiting'::"text", 'harvesting'::"text", 'composting'::"text"]))),
    CONSTRAINT "cultivation_plans_starting_material_check" CHECK (("starting_material" = ANY (ARRAY['seed'::"text", 'seedling'::"text", 'sapling'::"text", 'cutting'::"text", 'bulb'::"text"])))
);


ALTER TABLE "public"."cultivation_plans" OWNER TO "postgres";


COMMENT ON TABLE "public"."cultivation_plans" IS 'Piani di coltivazione completi dal seme/piantina alla raccolta';



COMMENT ON COLUMN "public"."cultivation_plans"."archetype_category" IS 'Categoria: vegetable, aromatic, berry, tree';



COMMENT ON COLUMN "public"."cultivation_plans"."starting_material" IS 'Materiale di partenza: seed, seedling, sapling, cutting, bulb';



COMMENT ON COLUMN "public"."cultivation_plans"."current_phase" IS 'Fase attuale del ciclo di coltivazione';



COMMENT ON COLUMN "public"."cultivation_plans"."phase_history" IS 'Storico completo delle fasi attraversate';



CREATE OR REPLACE FUNCTION "public"."advance_cultivation_phase"("plan_id" "uuid", "new_phase" "text", "new_location" "text" DEFAULT NULL::"text", "new_quantity" integer DEFAULT NULL::integer, "notes" "text" DEFAULT NULL::"text", "photos" "jsonb" DEFAULT NULL::"jsonb") RETURNS "public"."cultivation_plans"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    plan cultivation_plans;
    old_phase TEXT;
    old_quantity INTEGER;
BEGIN
    -- Ottieni piano corrente
    SELECT * INTO plan FROM cultivation_plans WHERE id = plan_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Piano coltivazione non trovato';
    END IF;
    
    -- Salva stato precedente
    old_phase := plan.current_phase;
    old_quantity := plan.current_quantity;
    
    -- Aggiorna piano
    UPDATE cultivation_plans SET
        current_phase = new_phase,
        current_location = COALESCE(new_location, current_location),
        current_quantity = COALESCE(new_quantity, current_quantity),
        updated_at = NOW()
    WHERE id = plan_id;
    
    -- Registra transizione
    INSERT INTO phase_transitions (
        cultivation_plan_id,
        from_phase,
        to_phase,
        location,
        quantity_before,
        quantity_after,
        notes,
        photos
    ) VALUES (
        plan_id,
        old_phase,
        new_phase,
        COALESCE(new_location, plan.current_location),
        old_quantity,
        COALESCE(new_quantity, old_quantity),
        notes,
        photos
    );
    
    -- Ritorna piano aggiornato
    SELECT * INTO plan FROM cultivation_plans WHERE id = plan_id;
    RETURN plan;
END;
$$;


ALTER FUNCTION "public"."advance_cultivation_phase"("plan_id" "uuid", "new_phase" "text", "new_location" "text", "new_quantity" integer, "notes" "text", "photos" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."advance_cultivation_phase_validated"("plan_id" "uuid", "new_phase" "text", "new_location" "text" DEFAULT NULL::"text", "new_quantity" integer DEFAULT NULL::integer, "notes" "text" DEFAULT NULL::"text", "photos" "jsonb" DEFAULT NULL::"jsonb", "weather_data" "jsonb" DEFAULT NULL::"jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    plan cultivation_plans;
    old_phase TEXT;
    old_quantity INTEGER;
    old_location TEXT;
    transition_id UUID;
    result JSONB;
BEGIN
    -- Ottieni piano corrente
    SELECT * INTO plan FROM cultivation_plans WHERE id = plan_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Piano non trovato');
    END IF;
    
    -- Validazioni fase
    IF NOT is_valid_phase_transition(plan.current_phase, new_phase) THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Transizione non valida da ' || plan.current_phase || ' a ' || new_phase
        );
    END IF;
    
    -- Salva stato precedente
    old_phase := plan.current_phase;
    old_quantity := plan.current_quantity;
    old_location := plan.current_location;
    
    -- Aggiorna piano
    UPDATE cultivation_plans SET
        current_phase = new_phase,
        current_location = COALESCE(new_location, current_location),
        current_quantity = COALESCE(new_quantity, current_quantity),
        updated_at = NOW()
    WHERE id = plan_id;
    
    -- Registra transizione
    INSERT INTO phase_transitions (
        cultivation_plan_id,
        from_phase,
        to_phase,
        location,
        quantity_before,
        quantity_after,
        notes,
        photos,
        weather_conditions,
        phase_data
    ) VALUES (
        plan_id,
        old_phase,
        new_phase,
        COALESCE(new_location, old_location),
        old_quantity,
        COALESCE(new_quantity, old_quantity),
        notes,
        photos,
        weather_data,
        jsonb_build_object(
            'transition_type', 'manual',
            'previous_location', old_location,
            'timestamp', NOW()
        )
    ) RETURNING id INTO transition_id;
    
    -- Azioni specifiche per fase
    PERFORM handle_phase_specific_actions(plan_id, new_phase, new_quantity);
    
    -- Ritorna risultato
    SELECT jsonb_build_object(
        'success', true,
        'plan_id', plan_id,
        'transition_id', transition_id,
        'old_phase', old_phase,
        'new_phase', new_phase,
        'quantity_change', COALESCE(new_quantity, old_quantity) - old_quantity
    ) INTO result;
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."advance_cultivation_phase_validated"("plan_id" "uuid", "new_phase" "text", "new_location" "text", "new_quantity" integer, "notes" "text", "photos" "jsonb", "weather_data" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."advance_cultivation_phase_validated"("plan_id" "uuid", "new_phase" "text", "new_location" "text", "new_quantity" integer, "notes" "text", "photos" "jsonb", "weather_data" "jsonb") IS 'Avanza fase con validazioni e azioni automatiche';



CREATE OR REPLACE FUNCTION "public"."apply_operation_to_row_plants"("p_operation_type" "text", "p_row_id" "uuid" DEFAULT NULL::"uuid", "p_field_row_id" "uuid" DEFAULT NULL::"uuid", "p_operation_date" "date" DEFAULT CURRENT_DATE, "p_quantity" numeric DEFAULT NULL::numeric, "p_unit" "text" DEFAULT NULL::"text", "p_product_name" "text" DEFAULT NULL::"text", "p_notes" "text" DEFAULT NULL::"text") RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    plant_record RECORD;
    operations_created INTEGER := 0;
BEGIN
    -- Itera su tutte le piante del filare
    FOR plant_record IN 
        SELECT * FROM get_plants_in_row(p_row_id, p_field_row_id, 'healthy')
    LOOP
        INSERT INTO plant_operations (
            plant_id,
            garden_id,
            operation_type,
            operation_date,
            quantity,
            unit,
            product_name,
            notes
        ) 
        SELECT 
            plant_record.plant_id,
            gp.garden_id,
            p_operation_type,
            p_operation_date,
            p_quantity,
            p_unit,
            p_product_name,
            p_notes
        FROM garden_plants gp 
        WHERE gp.id = plant_record.plant_id;
        
        operations_created := operations_created + 1;
    END LOOP;
    
    RETURN operations_created;
END;
$$;


ALTER FUNCTION "public"."apply_operation_to_row_plants"("p_operation_type" "text", "p_row_id" "uuid", "p_field_row_id" "uuid", "p_operation_date" "date", "p_quantity" numeric, "p_unit" "text", "p_product_name" "text", "p_notes" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."apply_operation_to_row_plants"("p_operation_type" "text", "p_row_id" "uuid", "p_field_row_id" "uuid", "p_operation_date" "date", "p_quantity" numeric, "p_unit" "text", "p_product_name" "text", "p_notes" "text") IS 'Applica un operazione a tutte le piante sane di un filare';



CREATE OR REPLACE FUNCTION "public"."auto_calculate_statistics"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Calcola statistiche quando un piano viene completato
    IF NEW.actual_harvest_date IS NOT NULL AND OLD.actual_harvest_date IS NULL THEN
        PERFORM calculate_cultivation_statistics(NEW.user_id, NEW.garden_id);
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_calculate_statistics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_generate_plants_in_row"("p_garden_id" "uuid", "p_row_id" "uuid" DEFAULT NULL::"uuid", "p_field_row_id" "uuid" DEFAULT NULL::"uuid", "p_plant_name" "text" DEFAULT 'Pianta'::"text", "p_variety" "text" DEFAULT NULL::"text", "p_planting_date" "date" DEFAULT CURRENT_DATE, "p_plant_spacing_cm" integer DEFAULT 30) RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    row_length DECIMAL;
    max_plants INTEGER;
    i INTEGER;
    plant_code TEXT;
    plants_created INTEGER := 0;
BEGIN
    -- Ottieni lunghezza filare
    IF p_row_id IS NOT NULL THEN
        -- Per garden_rows usa row_length_cm convertito in metri
        SELECT COALESCE(row_length_cm, 0) / 100.0 INTO row_length FROM garden_rows WHERE id = p_row_id;
    ELSIF p_field_row_id IS NOT NULL THEN
        -- Per field_rows usa length_meters
        SELECT COALESCE(length_meters, 0) INTO row_length FROM field_rows WHERE id = p_field_row_id;
    ELSE
        RAISE EXCEPTION 'Deve essere specificato row_id o field_row_id';
    END IF;
    
    -- Calcola numero massimo piante
    max_plants := calculate_plants_in_row(row_length, p_plant_spacing_cm);
    
    -- Genera piante
    FOR i IN 1..max_plants LOOP
        plant_code := generate_plant_code(p_garden_id, p_row_id, p_field_row_id, i);
        
        INSERT INTO garden_plants (
            garden_id,
            row_id,
            field_row_id,
            position_in_row,
            plant_code,
            plant_name,
            variety,
            planting_date,
            coordinates
        ) VALUES (
            p_garden_id,
            p_row_id,
            p_field_row_id,
            i,
            plant_code,
            p_plant_name,
            p_variety,
            p_planting_date,
            jsonb_build_object(
                'x', (i - 1) * (p_plant_spacing_cm / 100.0),
                'y', 0
            )
        );
        
        plants_created := plants_created + 1;
    END LOOP;
    
    RETURN plants_created;
END;
$$;


ALTER FUNCTION "public"."auto_generate_plants_in_row"("p_garden_id" "uuid", "p_row_id" "uuid", "p_field_row_id" "uuid", "p_plant_name" "text", "p_variety" "text", "p_planting_date" "date", "p_plant_spacing_cm" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."auto_generate_plants_in_row"("p_garden_id" "uuid", "p_row_id" "uuid", "p_field_row_id" "uuid", "p_plant_name" "text", "p_variety" "text", "p_planting_date" "date", "p_plant_spacing_cm" integer) IS 'Genera automaticamente tutte le piante in un filare con codici progressivi e coordinate';



CREATE OR REPLACE FUNCTION "public"."auto_generate_plants_in_row"("p_garden_id" "uuid", "p_row_id" "uuid" DEFAULT NULL::"uuid", "p_field_row_id" "uuid" DEFAULT NULL::"uuid", "p_plant_name" "text" DEFAULT 'Pianta'::"text", "p_variety" "text" DEFAULT NULL::"text", "p_planting_date" "date" DEFAULT CURRENT_DATE, "p_plant_spacing_cm" numeric DEFAULT 30) RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    row_length NUMERIC;
    max_plants INTEGER;
    i INTEGER;
    plant_code TEXT;
    plants_created INTEGER := 0;
BEGIN
    -- Ottieni lunghezza filare
    IF p_row_id IS NOT NULL THEN
        -- Per garden_rows usa row_length_cm convertito in metri
        SELECT COALESCE(row_length_cm, 0) / 100.0 INTO row_length FROM garden_rows WHERE id = p_row_id;
    ELSIF p_field_row_id IS NOT NULL THEN
        -- Per field_rows usa length_meters
        SELECT COALESCE(length_meters, 0) INTO row_length FROM field_rows WHERE id = p_field_row_id;
    ELSE
        RAISE EXCEPTION 'Deve essere specificato row_id o field_row_id';
    END IF;
    
    -- Calcola numero massimo piante
    max_plants := calculate_plants_in_row(row_length, p_plant_spacing_cm);
    
    -- Genera piante
    FOR i IN 1..max_plants LOOP
        plant_code := generate_plant_code(p_garden_id, p_row_id, p_field_row_id, i);
        
        INSERT INTO garden_plants (
            garden_id,
            row_id,
            field_row_id,
            position_in_row,
            plant_code,
            plant_name,
            variety,
            planting_date,
            coordinates
        ) VALUES (
            p_garden_id,
            p_row_id,
            p_field_row_id,
            i,
            plant_code,
            p_plant_name,
            p_variety,
            p_planting_date,
            jsonb_build_object(
                'x', (i - 1) * (p_plant_spacing_cm / 100.0),
                'y', 0
            )
        );
        
        plants_created := plants_created + 1;
    END LOOP;
    
    RETURN plants_created;
END;
$$;


ALTER FUNCTION "public"."auto_generate_plants_in_row"("p_garden_id" "uuid", "p_row_id" "uuid", "p_field_row_id" "uuid", "p_plant_name" "text", "p_variety" "text", "p_planting_date" "date", "p_plant_spacing_cm" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."backup_plant_data"("p_garden_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    backup_data JSONB;
BEGIN
    SELECT jsonb_build_object(
        'timestamp', NOW(),
        'garden_id', p_garden_id,
        'plants', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', id,
                    'plant_code', plant_code,
                    'plant_name', plant_name,
                    'variety', variety,
                    'position_in_row', position_in_row,
                    'status', status,
                    'health_score', health_score,
                    'planting_date', planting_date,
                    'coordinates', coordinates,
                    'notes', notes
                )
            )
            FROM garden_plants 
            WHERE garden_id = p_garden_id
        ),
        'operations', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'plant_code', gp.plant_code,
                    'operation_type', po.operation_type,
                    'operation_date', po.operation_date,
                    'quantity', po.quantity,
                    'unit', po.unit,
                    'product_name', po.product_name,
                    'notes', po.notes
                )
            )
            FROM plant_operations po
            JOIN garden_plants gp ON po.plant_id = gp.id
            WHERE gp.garden_id = p_garden_id
        ),
        'harvests', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'plant_code', gp.plant_code,
                    'harvest_date', ph.harvest_date,
                    'quantity_kg', ph.quantity_kg,
                    'quality_grade', ph.quality_grade,
                    'market_value', ph.market_value
                )
            )
            FROM plant_harvests ph
            JOIN garden_plants gp ON ph.plant_id = gp.id
            WHERE gp.garden_id = p_garden_id
        )
    ) INTO backup_data;
    
    RETURN backup_data;
END;
$$;


ALTER FUNCTION "public"."backup_plant_data"("p_garden_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_cultivation_statistics"("user_id_param" "uuid", "garden_id_param" "uuid" DEFAULT NULL::"uuid", "period_start_param" "date" DEFAULT NULL::"date", "period_end_param" "date" DEFAULT NULL::"date") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    start_date DATE;
    end_date DATE;
    archetype_record RECORD;
BEGIN
    -- Default: ultimo mese
    start_date := COALESCE(period_start_param, CURRENT_DATE - INTERVAL '1 month');
    end_date := COALESCE(period_end_param, CURRENT_DATE);
    
    -- Calcola per ogni archetipo
    FOR archetype_record IN 
        SELECT DISTINCT archetype_id, archetype_category 
        FROM cultivation_plans 
        WHERE user_id = user_id_param
        AND (garden_id_param IS NULL OR garden_id = garden_id_param)
        AND created_at BETWEEN start_date AND end_date
    LOOP
        
        INSERT INTO cultivation_statistics (
            user_id,
            garden_id,
            period_type,
            period_start,
            period_end,
            archetype_id,
            archetype_category,
            total_plans,
            completed_plans,
            success_rate,
            avg_days_to_harvest,
            avg_days_germination,
            avg_days_transplant,
            losses_germination,
            losses_nursing,
            losses_transplant,
            total_harvest_quantity,
            avg_harvest_per_plant
        )
        SELECT 
            user_id_param,
            COALESCE(garden_id_param, cp.garden_id),
            'monthly',
            start_date,
            end_date,
            archetype_record.archetype_id,
            archetype_record.archetype_category,
            
            -- Conteggi
            COUNT(*) as total_plans,
            COUNT(CASE WHEN actual_harvest_date IS NOT NULL THEN 1 END) as completed_plans,
            
            -- Success rate
            ROUND(
                COUNT(CASE WHEN actual_harvest_date IS NOT NULL THEN 1 END)::decimal / 
                NULLIF(COUNT(*), 0) * 100, 2
            ) as success_rate,
            
            -- Tempi medi
            AVG(EXTRACT(days FROM actual_harvest_date - actual_start_date)) as avg_days_to_harvest,
            
            -- Giorni germinazione (dalla semina alla germinazione)
            AVG(CASE 
                WHEN EXISTS (
                    SELECT 1 FROM phase_transitions pt1 
                    WHERE pt1.cultivation_plan_id = cp.id AND pt1.to_phase = 'germination'
                ) AND EXISTS (
                    SELECT 1 FROM phase_transitions pt2 
                    WHERE pt2.cultivation_plan_id = cp.id AND pt2.to_phase = 'sowing'
                ) THEN (
                    SELECT EXTRACT(days FROM pt1.transition_date - pt2.transition_date)
                    FROM phase_transitions pt1, phase_transitions pt2
                    WHERE pt1.cultivation_plan_id = cp.id AND pt1.to_phase = 'germination'
                    AND pt2.cultivation_plan_id = cp.id AND pt2.to_phase = 'sowing'
                )
            END) as avg_days_germination,
            
            -- Giorni al trapianto
            AVG(CASE 
                WHEN EXISTS (
                    SELECT 1 FROM phase_transitions pt 
                    WHERE pt.cultivation_plan_id = cp.id AND pt.to_phase = 'transplanting'
                ) THEN (
                    SELECT EXTRACT(days FROM pt.transition_date - cp.actual_start_date)
                    FROM phase_transitions pt
                    WHERE pt.cultivation_plan_id = cp.id AND pt.to_phase = 'transplanting'
                )
            END) as avg_days_transplant,
            
            -- Perdite per fase (percentuale media)
            AVG(CASE 
                WHEN EXISTS (
                    SELECT 1 FROM phase_transitions pt 
                    WHERE pt.cultivation_plan_id = cp.id AND pt.to_phase = 'germination'
                    AND pt.quantity_before > pt.quantity_after
                ) THEN (
                    SELECT (pt.quantity_before - pt.quantity_after)::decimal / pt.quantity_before * 100
                    FROM phase_transitions pt
                    WHERE pt.cultivation_plan_id = cp.id AND pt.to_phase = 'germination'
                )
            END) as losses_germination,
            
            0 as losses_nursing, -- TODO: Calcolare
            0 as losses_transplant, -- TODO: Calcolare
            
            -- Raccolto totale
            COALESCE(SUM(dh.quantity_harvested), 0) as total_harvest_quantity,
            
            -- Media per pianta
            CASE 
                WHEN COUNT(CASE WHEN actual_harvest_date IS NOT NULL THEN 1 END) > 0 THEN
                    COALESCE(SUM(dh.quantity_harvested), 0) / 
                    COUNT(CASE WHEN actual_harvest_date IS NOT NULL THEN 1 END)
                ELSE 0
            END as avg_harvest_per_plant
            
        FROM cultivation_plans cp
        LEFT JOIN detailed_harvests dh ON cp.id = dh.cultivation_plan_id
        WHERE cp.user_id = user_id_param
        AND (garden_id_param IS NULL OR cp.garden_id = garden_id_param)
        AND cp.archetype_id = archetype_record.archetype_id
        AND cp.created_at BETWEEN start_date AND end_date
        GROUP BY cp.garden_id
        
        ON CONFLICT (user_id, garden_id, period_start, period_end, archetype_id) 
        DO UPDATE SET
            total_plans = EXCLUDED.total_plans,
            completed_plans = EXCLUDED.completed_plans,
            success_rate = EXCLUDED.success_rate,
            avg_days_to_harvest = EXCLUDED.avg_days_to_harvest,
            avg_days_germination = EXCLUDED.avg_days_germination,
            avg_days_transplant = EXCLUDED.avg_days_transplant,
            losses_germination = EXCLUDED.losses_germination,
            total_harvest_quantity = EXCLUDED.total_harvest_quantity,
            avg_harvest_per_plant = EXCLUDED.avg_harvest_per_plant,
            calculated_at = NOW();
            
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."calculate_cultivation_statistics"("user_id_param" "uuid", "garden_id_param" "uuid", "period_start_param" "date", "period_end_param" "date") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."calculate_cultivation_statistics"("user_id_param" "uuid", "garden_id_param" "uuid", "period_start_param" "date", "period_end_param" "date") IS 'Calcola statistiche periodiche per utente/giardino';



CREATE OR REPLACE FUNCTION "public"."calculate_field_row_plant_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Calcola il numero massimo di piante basato su lunghezza e spaziatura
  IF NEW.length_meters IS NOT NULL AND NEW.plant_spacing IS NOT NULL AND NEW.plant_spacing > 0 THEN
    NEW.max_plant_count = FLOOR((NEW.length_meters * 100) / NEW.plant_spacing);
  ELSE
    NEW.max_plant_count = 0;
  END IF;
  
  -- Inizializza current_plant_count se non impostato
  IF NEW.current_plant_count IS NULL THEN
    NEW.current_plant_count = 0;
  END IF;
  
  -- Assicurati che is_active sia impostato
  IF NEW.is_active IS NULL THEN
    NEW.is_active = true;
  END IF;
  
  -- Assicurati che status sia impostato
  IF NEW.status IS NULL THEN
    NEW.status = 'active';
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."calculate_field_row_plant_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_harvest_stats"("p_garden_id" "uuid", "p_start_date" "date" DEFAULT NULL::"date", "p_end_date" "date" DEFAULT NULL::"date") RETURNS TABLE("plant_name" "text", "total_quantity" numeric, "total_weight_kg" numeric, "harvest_count" bigint, "avg_quality" numeric)
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.plant_name,
    SUM(h.quantity) as total_quantity,
    SUM(h.weight_kg) as total_weight_kg,
    COUNT(*) as harvest_count,
    AVG(h.quality_rating) as avg_quality
  FROM harvests h
  WHERE h.garden_id = p_garden_id
    AND (p_start_date IS NULL OR h.harvest_date >= p_start_date)
    AND (p_end_date IS NULL OR h.harvest_date <= p_end_date)
  GROUP BY h.plant_name
  ORDER BY total_weight_kg DESC NULLS LAST;
END;
$$;


ALTER FUNCTION "public"."calculate_harvest_stats"("p_garden_id" "uuid", "p_start_date" "date", "p_end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_min_row_length"("plants_count" integer, "plant_spacing_cm" numeric) RETURNS numeric
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
    -- Calcola lunghezza minima in metri
    RETURN ((plants_count - 1) * plant_spacing_cm) / 100.0;
END;
$$;


ALTER FUNCTION "public"."calculate_min_row_length"("plants_count" integer, "plant_spacing_cm" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_plants_in_row"("row_length_m" numeric, "plant_spacing_cm" numeric) RETURNS integer
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
    -- Converte lunghezza in cm e calcola numero piante
    -- Sottrae uno spazio perché la prima pianta è a 0cm
    RETURN FLOOR((row_length_m * 100) / plant_spacing_cm) + 1;
END;
$$;


ALTER FUNCTION "public"."calculate_plants_in_row"("row_length_m" numeric, "plant_spacing_cm" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_task_dynamic_priority"("task_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  task_record RECORD;
  priority TEXT;
  days_overdue INTEGER;
BEGIN
  SELECT * INTO task_record FROM garden_tasks WHERE id = task_id;

  IF NOT FOUND THEN
    RETURN 'medium';
  END IF;

  -- Default priority
  priority := COALESCE(task_record.task_priority, 'medium');

  -- Calcola giorni di ritardo
  days_overdue := CURRENT_DATE - task_record.scheduled_date;

  -- Urgenza per ritardo
  IF days_overdue > 7 THEN
    priority := 'critical';
  ELSIF days_overdue > 3 THEN
    priority := 'urgent';
  ELSIF days_overdue > 1 THEN
    priority := 'high';
  END IF;

  -- Criticalità per blocchi meteo
  IF task_record.blocking_reason IN ('frost', 'heat') THEN
    priority := 'critical';
  END IF;

  -- Urgenza per piantine pronte
  IF task_record.task_type = 'Transplant' AND task_record.seedling_batch_id IS NOT NULL THEN
    -- Controlla se batch è pronto
    IF EXISTS (
      SELECT 1 FROM seedling_batches
      WHERE id = task_record.seedling_batch_id
      AND phase = 'ReadyToTransplant'
    ) THEN
      priority := 'urgent';
    END IF;
  END IF;

  RETURN priority;
END;
$$;


ALTER FUNCTION "public"."calculate_task_dynamic_priority"("task_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."calculate_task_dynamic_priority"("task_id" "uuid") IS 'Calcola priorità dinamica di un task basata su ritardi, blocchi e stato';



CREATE OR REPLACE FUNCTION "public"."check_rotation_compliance"("p_bed_id" "uuid", "p_plant_family" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_last_planting RECORD;
  v_result JSONB;
BEGIN
  -- Get last planting for this bed
  SELECT plant_family, plant_name, year, season
  INTO v_last_planting
  FROM bed_planting_history
  WHERE bed_id = p_bed_id
  ORDER BY year DESC, season DESC
  LIMIT 1;
  
  -- If no history, rotation is OK
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'severity', 'SUCCESS',
      'message', 'Aiuola nuova - nessuna rotazione da rispettare'
    );
  END IF;
  
  -- Check if same family
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
  
  -- Rotation OK
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


ALTER FUNCTION "public"."check_rotation_compliance"("p_bed_id" "uuid", "p_plant_family" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_rotation_compliance"("p_garden_id" "uuid", "p_zone_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("zone_id" "uuid", "zone_name" "text", "current_family" "text", "previous_families" "text"[], "is_compliant" boolean, "recommendation" "text")
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gz.id as zone_id,
    gz.name as zone_name,
    gz.current_plant_family as current_family,
    gz.rotation_history as previous_families,
    (gz.current_plant_family IS NULL OR 
     NOT (gz.current_plant_family = ANY(gz.rotation_history))) as is_compliant,
    CASE 
      WHEN gz.current_plant_family = ANY(gz.rotation_history) 
      THEN 'Famiglia già coltivata di recente. Considera una rotazione.'
      ELSE 'Rotazione conforme'
    END as recommendation
  FROM garden_zones gz
  WHERE gz.garden_id = p_garden_id
    AND (p_zone_id IS NULL OR gz.id = p_zone_id);
END;
$$;


ALTER FUNCTION "public"."check_rotation_compliance"("p_garden_id" "uuid", "p_zone_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_expired_weather_cache"() RETURNS integer
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM weather_cache
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_weather_cache"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."consume_seed_inventory"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  seed_record seed_inventory%ROWTYPE;
  consumption_amount INTEGER;
BEGIN
  -- Solo se il piano parte da seme
  IF NEW.starting_material = 'seed' AND NEW.seed_inventory_id IS NOT NULL THEN
    
    -- Ottieni record seme
    SELECT * INTO seed_record 
    FROM seed_inventory 
    WHERE id = NEW.seed_inventory_id;
    
    -- Calcola consumo (default 5 semi per piano)
    consumption_amount := COALESCE(NEW.current_quantity, 5);
    
    -- Aggiorna quantità semi
    UPDATE seed_inventory 
    SET 
      quantity_remaining = CASE 
        WHEN quantity_remaining = 'High' AND consumption_amount > 10 THEN 'Medium'
        WHEN quantity_remaining = 'High' AND consumption_amount > 5 THEN 'High'
        WHEN quantity_remaining = 'Medium' AND consumption_amount > 5 THEN 'Low'
        WHEN quantity_remaining = 'Medium' AND consumption_amount <= 5 THEN 'Medium'
        WHEN quantity_remaining = 'Low' THEN 'Empty'
        ELSE quantity_remaining
      END,
      updated_at = NOW()
    WHERE id = NEW.seed_inventory_id;
    
    -- Log consumo
    INSERT INTO phase_transitions (
      cultivation_plan_id,
      from_phase,
      to_phase,
      location,
      quantity_before,
      quantity_after,
      notes,
      phase_data
    ) VALUES (
      NEW.id,
      'planning',
      NEW.current_phase,
      NEW.current_location,
      consumption_amount,
      NEW.current_quantity,
      'Consumo automatico semi',
      jsonb_build_object(
        'seed_consumed', consumption_amount,
        'seed_variety', seed_record.variety_name
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."consume_seed_inventory"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_default_notification_preferences"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_default_notification_preferences"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_example_tomato_field"("p_garden_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    zone_id UUID;
    row_ids UUID[];
    row_id UUID;
    i INTEGER;
    j INTEGER;
    plants_created INTEGER := 0;
    operations_created INTEGER := 0;
    harvests_created INTEGER := 0;
    result JSONB;
BEGIN
    -- 1. Crea zona "Campo Pomodori"
    INSERT INTO garden_zones (
        garden_id, name, description, size_sq_meters,
        primary_cultivar, crop_type, soil_type, sun_exposure
    ) VALUES (
        p_garden_id, 
        'Campo Pomodori - Esempio',
        'Campo dimostrativo con 10 filari di pomodori San Marzano (1000 piante totali)',
        600, -- 40m × 15m
        'Pomodoro San Marzano',
        'Vegetables',
        'Loamy',
        'FullSun'
    ) RETURNING id INTO zone_id;
    
    -- 2. Crea 10 filari
    FOR i IN 1..10 LOOP
        INSERT INTO field_rows (
            garden_id, zone_id, name, row_number,
            length_meters, distance_from_previous_row, plant_spacing,
            cultivar, orientation, is_active, planted_date
        ) VALUES (
            p_garden_id, zone_id, 
            'Filare Pomodori ' || i, 
            i,
            40.0,  -- 40 metri di lunghezza
            150,   -- 150cm tra filari
            40,    -- 40cm tra piante
            'Pomodoro San Marzano',
            'N-S',
            true,
            (CURRENT_DATE - INTERVAL '60 days')::DATE -- FIX: Cast esplicito a DATE
        ) RETURNING id INTO row_id;
        
        row_ids := array_append(row_ids, row_id);
        
        -- 3. Genera 100 piante per filare (calcolo automatico)
        plants_created := plants_created + auto_generate_plants_in_row(
            p_garden_id, NULL, row_id, 'Pomodoro', 'San Marzano', 
            (CURRENT_DATE - INTERVAL '60 days')::DATE, 40 -- FIX: Cast esplicito a DATE
        );
    END LOOP;
    
    -- Resto della funzione uguale...
    result := jsonb_build_object(
        'success', true,
        'zone_id', zone_id,
        'plants_created', plants_created
    );
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."create_example_tomato_field"("p_garden_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."create_example_tomato_field"("p_garden_id" "uuid") IS 'Crea un campo di esempio con 10 filari di pomodori (1000 piante totali) per dimostrare il sistema di tracking individuale';



CREATE OR REPLACE FUNCTION "public"."generate_plant_code"("p_garden_id" "uuid", "p_row_id" "uuid" DEFAULT NULL::"uuid", "p_field_row_id" "uuid" DEFAULT NULL::"uuid", "p_position" integer DEFAULT NULL::integer) RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    row_num INTEGER;
    row_prefix TEXT;
    position_num INTEGER;
BEGIN
    -- Determina il numero del filare
    IF p_row_id IS NOT NULL THEN
        SELECT fr.row_number INTO row_num FROM garden_rows fr WHERE fr.id = p_row_id;
        row_prefix := 'B'; -- Bed row
    ELSIF p_field_row_id IS NOT NULL THEN
        SELECT fr.row_number INTO row_num FROM field_rows fr WHERE fr.id = p_field_row_id;
        row_prefix := 'F'; -- Field row
    ELSE
        RETURN 'UNKNOWN';
    END IF;
    
    -- Usa la posizione fornita o calcola la prossima
    IF p_position IS NOT NULL THEN
        position_num := p_position;
    ELSE
        -- Trova la prossima posizione disponibile
        IF p_row_id IS NOT NULL THEN
            SELECT COALESCE(MAX(position_in_row), 0) + 1 
            INTO position_num 
            FROM garden_plants 
            WHERE row_id = p_row_id;
        ELSE
            SELECT COALESCE(MAX(position_in_row), 0) + 1 
            INTO position_num 
            FROM garden_plants 
            WHERE field_row_id = p_field_row_id;
        END IF;
    END IF;
    
    -- Genera codice: F1-P001, B2-P015, etc.
    RETURN row_prefix || COALESCE(row_num, 1) || '-P' || LPAD(position_num::TEXT, 3, '0');
END;
$$;


ALTER FUNCTION "public"."generate_plant_code"("p_garden_id" "uuid", "p_row_id" "uuid", "p_field_row_id" "uuid", "p_position" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_available_materials"("garden_id_param" "uuid", "archetype_id_param" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    result JSONB := '{"seeds": [], "seedlings": [], "saplings": []}'::jsonb;
    seeds JSONB;
    seedlings JSONB;
    saplings JSONB;
BEGIN
    -- Semi disponibili
    SELECT COALESCE(jsonb_agg(to_jsonb(si.*)), '[]'::jsonb) INTO seeds
    FROM seed_inventory si
    WHERE si.garden_id = garden_id_param
    AND si.quantity_remaining != 'Empty';
    
    -- Piantine disponibili
    SELECT COALESCE(jsonb_agg(to_jsonb(sb.*)), '[]'::jsonb) INTO seedlings
    FROM seedling_batches sb
    WHERE sb.garden_id = garden_id_param
    AND sb.phase IN ('ReadyToTransplant', 'Hardening');
    
    -- Alberelli disponibili
    SELECT COALESCE(jsonb_agg(to_jsonb(sap.*)), '[]'::jsonb) INTO saplings
    FROM sapling_inventory sap
    WHERE sap.garden_id = garden_id_param
    AND sap.quantity_available > 0;
    
    -- Costruisci risultato
    result := jsonb_build_object(
        'seeds', seeds,
        'seedlings', seedlings,
        'saplings', saplings
    );
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_available_materials"("garden_id_param" "uuid", "archetype_id_param" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_complete_row_stats"("p_row_id" "uuid" DEFAULT NULL::"uuid", "p_field_row_id" "uuid" DEFAULT NULL::"uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    row_info RECORD;
    plant_stats RECORD;
    operation_stats RECORD;
    harvest_stats RECORD;
    result JSONB;
BEGIN
    -- Ottieni info filare
    IF p_row_id IS NOT NULL THEN
        SELECT row_number, row_length_cm, spacing_between_plants_cm, calculated_plants, crop_name
        INTO row_info
        FROM garden_rows WHERE id = p_row_id;
    ELSIF p_field_row_id IS NOT NULL THEN
        SELECT name, length_meters, plant_spacing, calculated_plants, cultivar
        INTO row_info
        FROM field_rows WHERE id = p_field_row_id;
    END IF;
    
    -- Statistiche piante
    SELECT 
        COUNT(*) as total_plants,
        COUNT(*) FILTER (WHERE status = 'healthy') as healthy_plants,
        COUNT(*) FILTER (WHERE status = 'diseased') as diseased_plants,
        COUNT(*) FILTER (WHERE status = 'dead') as dead_plants,
        AVG(health_score) as avg_health_score,
        MIN(planting_date) as first_planting,
        MAX(planting_date) as last_planting
    INTO plant_stats
    FROM garden_plants
    WHERE (p_row_id IS NOT NULL AND row_id = p_row_id) 
       OR (p_field_row_id IS NOT NULL AND field_row_id = p_field_row_id);
    
    -- Statistiche operazioni (ultimi 30 giorni)
    SELECT 
        COUNT(*) as total_operations,
        COUNT(DISTINCT operation_type) as operation_types,
        MAX(operation_date) as last_operation
    INTO operation_stats
    FROM plant_operations po
    JOIN garden_plants gp ON po.plant_id = gp.id
    WHERE po.operation_date >= CURRENT_DATE - INTERVAL '30 days'
      AND ((p_row_id IS NOT NULL AND gp.row_id = p_row_id) 
           OR (p_field_row_id IS NOT NULL AND gp.field_row_id = p_field_row_id));
    
    -- Statistiche raccolti
    SELECT 
        COUNT(*) as total_harvests,
        COALESCE(SUM(quantity_kg), 0) as total_production_kg,
        COALESCE(AVG(quantity_kg), 0) as avg_harvest_kg
    INTO harvest_stats
    FROM plant_harvests ph
    JOIN garden_plants gp ON ph.plant_id = gp.id
    WHERE (p_row_id IS NOT NULL AND gp.row_id = p_row_id) 
       OR (p_field_row_id IS NOT NULL AND gp.field_row_id = p_field_row_id);
    
    -- Costruisci risultato JSON
    result := jsonb_build_object(
        'row_info', jsonb_build_object(
            'name', COALESCE(row_info.name, 'Bed Row ' || row_info.row_number),
            'length_meters', COALESCE(row_info.length_meters, row_info.row_length_cm / 100.0),
            'plant_spacing', COALESCE(row_info.plant_spacing, row_info.spacing_between_plants_cm),
            'calculated_plants', row_info.calculated_plants,
            'cultivar', COALESCE(row_info.cultivar, row_info.crop_name)
        ),
        'plant_stats', jsonb_build_object(
            'total_plants', COALESCE(plant_stats.total_plants, 0),
            'healthy_plants', COALESCE(plant_stats.healthy_plants, 0),
            'diseased_plants', COALESCE(plant_stats.diseased_plants, 0),
            'dead_plants', COALESCE(plant_stats.dead_plants, 0),
            'avg_health_score', COALESCE(plant_stats.avg_health_score, 0),
            'health_percentage', CASE 
                WHEN COALESCE(plant_stats.total_plants, 0) > 0 
                THEN (COALESCE(plant_stats.healthy_plants, 0) * 100.0 / plant_stats.total_plants)
                ELSE 0 
            END,
            'first_planting', plant_stats.first_planting,
            'last_planting', plant_stats.last_planting
        ),
        'operation_stats', jsonb_build_object(
            'total_operations_30d', COALESCE(operation_stats.total_operations, 0),
            'operation_types', COALESCE(operation_stats.operation_types, 0),
            'last_operation', operation_stats.last_operation
        ),
        'harvest_stats', jsonb_build_object(
            'total_harvests', COALESCE(harvest_stats.total_harvests, 0),
            'total_production_kg', COALESCE(harvest_stats.total_production_kg, 0),
            'avg_harvest_kg', COALESCE(harvest_stats.avg_harvest_kg, 0)
        )
    );
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_complete_row_stats"("p_row_id" "uuid", "p_field_row_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_complete_row_stats"("p_row_id" "uuid", "p_field_row_id" "uuid") IS 'Ottiene statistiche complete di un filare incluse piante, operazioni e raccolti';



CREATE OR REPLACE FUNCTION "public"."get_field_row_mechanical_works"("p_field_row_id" "uuid") RETURNS TABLE("work_id" "uuid", "work_date" "date", "work_type" "text", "equipment_type" "text", "area_m2" numeric, "depth_cm" numeric, "operator_name" "text", "notes" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mwr.id,
    mwr.work_date,
    mwr.work_type,
    mwr.equipment_type,
    mwr.area_m2,
    mwr.depth_cm,
    mwr.operator_name,
    mwr.notes
  FROM mechanical_work_register mwr
  WHERE mwr.field_row_id = p_field_row_id
  ORDER BY mwr.work_date DESC;
END;
$$;


ALTER FUNCTION "public"."get_field_row_mechanical_works"("p_field_row_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_field_row_occupancy"("p_field_row_id" "uuid") RETURNS TABLE("field_row_id" "uuid", "row_number" integer, "max_plants" integer, "current_plants" integer, "occupancy_percent" numeric, "available_slots" integer)
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fr.id as field_row_id,
    fr.row_number,
    fr.max_plant_count as max_plants,
    fr.current_plant_count as current_plants,
    CASE 
      WHEN fr.max_plant_count > 0 
      THEN ROUND((fr.current_plant_count::NUMERIC / fr.max_plant_count) * 100, 2)
      ELSE 0
    END as occupancy_percent,
    GREATEST(0, fr.max_plant_count - fr.current_plant_count) as available_slots
  FROM field_rows fr
  WHERE fr.id = p_field_row_id;
END;
$$;


ALTER FUNCTION "public"."get_field_row_occupancy"("p_field_row_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_field_row_treatments"("p_field_row_id" "uuid") RETURNS TABLE("treatment_id" "uuid", "treatment_date" "date", "product_name" "text", "active_ingredient" "text", "dosage" numeric, "dosage_unit" "text", "method" "text", "reason" "text", "notes" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tr.id,
    tr.treatment_date,
    tr.product_name,
    tr.active_ingredient,
    tr.dosage,
    tr.dosage_unit,
    tr.method,
    tr.reason,
    tr.notes
  FROM treatment_register tr
  WHERE tr.field_row_id = p_field_row_id
  ORDER BY tr.treatment_date DESC;
END;
$$;


ALTER FUNCTION "public"."get_field_row_treatments"("p_field_row_id" "uuid") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "email_enabled" boolean DEFAULT true,
    "task_reminders" boolean DEFAULT true,
    "weather_alerts" boolean DEFAULT true,
    "challenge_notifications" boolean DEFAULT true,
    "harvest_notifications" boolean DEFAULT true,
    "seed_notifications" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notification_preferences" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_or_create_notification_preferences"("p_user_id" "uuid") RETURNS "public"."notification_preferences"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  v_prefs public.notification_preferences;
BEGIN
  SELECT * INTO v_prefs
  FROM public.notification_preferences
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.notification_preferences (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_prefs;
  END IF;

  RETURN v_prefs;
END;
$$;


ALTER FUNCTION "public"."get_or_create_notification_preferences"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_plants_in_row"("p_row_id" "uuid" DEFAULT NULL::"uuid", "p_field_row_id" "uuid" DEFAULT NULL::"uuid", "p_status" "text" DEFAULT NULL::"text") RETURNS TABLE("plant_id" "uuid", "plant_code" "text", "position_in_row" integer, "plant_name" "text", "variety" "text", "status" "text", "health_score" integer)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gp.id,
        gp.plant_code,
        gp.position_in_row,
        gp.plant_name,
        gp.variety,
        gp.status,
        gp.health_score
    FROM garden_plants gp
    WHERE 
        (p_row_id IS NULL OR gp.row_id = p_row_id) AND
        (p_field_row_id IS NULL OR gp.field_row_id = p_field_row_id) AND
        (p_status IS NULL OR gp.status = p_status)
    ORDER BY gp.position_in_row;
END;
$$;


ALTER FUNCTION "public"."get_plants_in_row"("p_row_id" "uuid", "p_field_row_id" "uuid", "p_status" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_plants_in_row"("p_row_id" "uuid", "p_field_row_id" "uuid", "p_status" "text") IS 'Ottiene tutte le piante di un filare con filtri opzionali per stato';



CREATE OR REPLACE FUNCTION "public"."get_recurring_issues"("user_id_param" "uuid", "archetype_id_param" "text" DEFAULT NULL::"text", "min_occurrences" integer DEFAULT 2) RETURNS TABLE("issue_type" "text", "issue_description" "text", "occurrences" bigint, "avg_severity" numeric, "most_common_phase" "text", "success_rate" numeric, "recommended_prevention" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ci.issue_type,
        ci.issue_description,
        COUNT(*) as occurrences,
        AVG(CASE ci.issue_severity 
            WHEN 'low' THEN 1 
            WHEN 'medium' THEN 2 
            WHEN 'high' THEN 3 
            WHEN 'critical' THEN 4 
        END) as avg_severity,
        MODE() WITHIN GROUP (ORDER BY ci.phase_occurred) as most_common_phase,
        AVG(CASE WHEN ci.resolution_effective THEN 100.0 ELSE 0.0 END) as success_rate,
        STRING_AGG(DISTINCT ci.prevention_notes, '; ') as recommended_prevention
    FROM cultivation_issues ci
    JOIN cultivation_plans cp ON ci.cultivation_plan_id = cp.id
    WHERE cp.user_id = user_id_param
    AND (archetype_id_param IS NULL OR cp.archetype_id = archetype_id_param)
    GROUP BY ci.issue_type, ci.issue_description
    HAVING COUNT(*) >= min_occurrences
    ORDER BY occurrences DESC, avg_severity DESC;
END;
$$;


ALTER FUNCTION "public"."get_recurring_issues"("user_id_param" "uuid", "archetype_id_param" "text", "min_occurrences" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_recurring_issues"("user_id_param" "uuid", "archetype_id_param" "text", "min_occurrences" integer) IS 'Identifica problemi ricorrenti e raccomandazioni';



CREATE OR REPLACE FUNCTION "public"."get_row_operation_stats"("p_row_id" "uuid" DEFAULT NULL::"uuid", "p_field_row_id" "uuid" DEFAULT NULL::"uuid", "p_operation_type" "text" DEFAULT NULL::"text", "p_date_from" "date" DEFAULT NULL::"date", "p_date_to" "date" DEFAULT NULL::"date") RETURNS TABLE("operation_type" "text", "total_operations" bigint, "plants_affected" bigint, "total_quantity" numeric, "avg_quantity_per_plant" numeric, "last_operation_date" "date")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        po.operation_type,
        COUNT(*) as total_operations,
        COUNT(DISTINCT po.plant_id) as plants_affected,
        COALESCE(SUM(po.quantity), 0) as total_quantity,
        COALESCE(AVG(po.quantity), 0) as avg_quantity_per_plant,
        MAX(po.operation_date) as last_operation_date
    FROM plant_operations po
    JOIN garden_plants gp ON po.plant_id = gp.id
    WHERE 
        (p_row_id IS NULL OR gp.row_id = p_row_id) AND
        (p_field_row_id IS NULL OR gp.field_row_id = p_field_row_id) AND
        (p_operation_type IS NULL OR po.operation_type = p_operation_type) AND
        (p_date_from IS NULL OR po.operation_date >= p_date_from) AND
        (p_date_to IS NULL OR po.operation_date <= p_date_to)
    GROUP BY po.operation_type
    ORDER BY po.operation_type;
END;
$$;


ALTER FUNCTION "public"."get_row_operation_stats"("p_row_id" "uuid", "p_field_row_id" "uuid", "p_operation_type" "text", "p_date_from" "date", "p_date_to" "date") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_row_operation_stats"("p_row_id" "uuid", "p_field_row_id" "uuid", "p_operation_type" "text", "p_date_from" "date", "p_date_to" "date") IS 'Calcola statistiche delle operazioni per un filare in un periodo';



CREATE OR REPLACE FUNCTION "public"."grant_credits"("p_user_id" "uuid", "p_amount" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE public.profiles
  SET ai_credits_total = ai_credits_total + p_amount
  WHERE id = p_user_id;
END;
$$;


ALTER FUNCTION "public"."grant_credits"("p_user_id" "uuid", "p_amount" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    tier,
    email_verified,
    onboarding_completed
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), ' ', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', split_part(COALESCE(NEW.raw_user_meta_data->>'name', ''), ' ', 2)),
    COALESCE(NEW.raw_user_meta_data->>'tier', 'PRO'),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    false
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."handle_new_user"() IS 'Creates profile for new auth users. Security: search_path fixed.';



CREATE OR REPLACE FUNCTION "public"."handle_new_user_credits"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
BEGIN
  -- Ensure profile exists
  INSERT INTO public.profiles (id, tier, ai_credits_total, ai_credits_used)
  VALUES (NEW.id, 'PRO', 3, 0)
  ON CONFLICT (id) DO NOTHING;

  -- Grant 3 free credits if profile was just created
  IF NOT EXISTS (SELECT 1 FROM public.ai_credit_transactions
                 WHERE user_id = NEW.id AND type = 'bonus' AND description LIKE '%Welcome%') THEN
    PERFORM public.grant_credits(NEW.id, 3);

    INSERT INTO public.ai_credit_transactions (user_id, amount, type, description)
    VALUES (NEW.id, 3, 'bonus', 'Welcome bonus - 3 free AI credits');
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user_credits"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_phase_specific_actions"("plan_id" "uuid", "phase" "text", "quantity" integer DEFAULT NULL::integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    plan cultivation_plans;
BEGIN
    SELECT * INTO plan FROM cultivation_plans WHERE id = plan_id;
    
    CASE phase
        WHEN 'transplanting' THEN
            -- Crea record in custom_crops se non esiste
            INSERT INTO custom_crops (
                user_id,
                garden_id,
                common_name,
                scientific_name,
                family,
                initial_data
            )
            SELECT 
                plan.user_id,
                plan.garden_id,
                plan.plant_name,
                plan.variety_name,
                'Unknown', -- TODO: derivare da archetype
                jsonb_build_object(
                    'cultivation_plan_id', plan.id,
                    'archetype_id', plan.archetype_id,
                    'starting_material', plan.starting_material,
                    'transplant_date', NOW()
                )
            WHERE NOT EXISTS (
                SELECT 1 FROM custom_crops 
                WHERE initial_data->>'cultivation_plan_id' = plan.id::text
            );
            
        WHEN 'harvesting' THEN
            -- Aggiorna data raccolta effettiva
            UPDATE cultivation_plans 
            SET actual_harvest_date = CURRENT_DATE
            WHERE id = plan.id;
            
        WHEN 'composting' THEN
            -- Chiudi piano
            UPDATE cultivation_plans 
            SET is_active = false
            WHERE id = plan.id;
            
    END CASE;
END;
$$;


ALTER FUNCTION "public"."handle_phase_specific_actions"("plan_id" "uuid", "phase" "text", "quantity" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."handle_phase_specific_actions"("plan_id" "uuid", "phase" "text", "quantity" integer) IS 'Esegue azioni specifiche per ogni fase';



CREATE OR REPLACE FUNCTION "public"."initialize_default_certifications"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    garden_record RECORD;
BEGIN
    -- Loop through all existing gardens
    FOR garden_record IN SELECT id FROM gardens LOOP
        -- Initialize GlobalG.A.P. as compliant (already implemented)
        INSERT INTO certifications (garden_id, type, status)
        VALUES (garden_record.id, 'GLOBALGAP', 'COMPLIANT')
        ON CONFLICT (garden_id, type) DO NOTHING;
        
        -- Initialize HACCP as in progress
        INSERT INTO certifications (garden_id, type, status)
        VALUES (garden_record.id, 'HACCP', 'IN_PROGRESS')
        ON CONFLICT (garden_id, type) DO NOTHING;
        
        -- Initialize Organic as not started
        INSERT INTO certifications (garden_id, type, status)
        VALUES (garden_record.id, 'ORGANIC_EU', 'NOT_STARTED')
        ON CONFLICT (garden_id, type) DO NOTHING;
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."initialize_default_certifications"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_valid_phase_transition"("current_phase" "text", "new_phase" "text") RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
    -- Matrice transizioni valide
    RETURN CASE 
        WHEN current_phase = 'planning' AND new_phase IN ('preparation', 'sowing', 'transplanting') THEN TRUE
        WHEN current_phase = 'preparation' AND new_phase IN ('sowing', 'transplanting') THEN TRUE
        WHEN current_phase = 'sowing' AND new_phase IN ('germination', 'nursing') THEN TRUE
        WHEN current_phase = 'germination' AND new_phase IN ('nursing', 'hardening') THEN TRUE
        WHEN current_phase = 'nursing' AND new_phase IN ('hardening', 'transplanting') THEN TRUE
        WHEN current_phase = 'hardening' AND new_phase = 'transplanting' THEN TRUE
        WHEN current_phase = 'transplanting' AND new_phase = 'growing' THEN TRUE
        WHEN current_phase = 'growing' AND new_phase IN ('flowering', 'harvesting') THEN TRUE
        WHEN current_phase = 'flowering' AND new_phase IN ('fruiting', 'harvesting') THEN TRUE
        WHEN current_phase = 'fruiting' AND new_phase = 'harvesting' THEN TRUE
        WHEN current_phase = 'harvesting' AND new_phase = 'composting' THEN TRUE
        -- Transizioni di emergenza (sempre valide)
        WHEN new_phase = 'composting' THEN TRUE
        ELSE FALSE
    END;
END;
$$;


ALTER FUNCTION "public"."is_valid_phase_transition"("current_phase" "text", "new_phase" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_valid_phase_transition"("current_phase" "text", "new_phase" "text") IS 'Valida se una transizione di fase è permessa';



CREATE OR REPLACE FUNCTION "public"."manage_sapling_inventory"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Solo se il piano parte da alberello
  IF NEW.starting_material = 'sapling' AND NEW.sapling_inventory_id IS NOT NULL THEN
    
    -- Scala disponibilità e incrementa piantati
    UPDATE sapling_inventory 
    SET 
      quantity_available = GREATEST(0, quantity_available - NEW.current_quantity),
      quantity_planted = quantity_planted + NEW.current_quantity,
      updated_at = NOW()
    WHERE id = NEW.sapling_inventory_id;
    
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."manage_sapling_inventory"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_actual_completion"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Se task viene completato e non ha actual_completed_date
  IF NEW.completed = true AND OLD.completed = false THEN
    NEW.actual_completed_date := NOW();

    -- Se non ha actual_duration e ha estimated_duration, usa quello come base
    IF NEW.actual_duration IS NULL AND NEW.estimated_duration IS NOT NULL THEN
      NEW.actual_duration := NEW.estimated_duration;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."record_actual_completion"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_plant_canonical"("search_query" "text", "filter_archetype_id" "text" DEFAULT NULL::"text", "similarity_threshold" numeric DEFAULT 0.3, "result_limit" integer DEFAULT 10) RETURNS TABLE("plant_id" "text", "plant_name" "text", "archetype_id" "text", "family_id" "text", "functional_category" "text", "similarity_score" numeric)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pt.plant_id,
    pt.names->>'it' as plant_name,
    pt.archetype_id,
    pt.family_id,
    pt.functional_category,
    similarity(pt.names->>'it', search_query) as similarity_score
  FROM plant_taxonomy pt
  WHERE (pt.names->>'it' % search_query OR similarity(pt.names->>'it', search_query) > similarity_threshold)
    AND (filter_archetype_id IS NULL OR pt.archetype_id = filter_archetype_id)
  ORDER BY similarity_score DESC
  LIMIT result_limit;
END;
$$;


ALTER FUNCTION "public"."search_plant_canonical"("search_query" "text", "filter_archetype_id" "text", "similarity_threshold" numeric, "result_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_plant_synonyms"("search_query" "text", "search_locale" "text" DEFAULT 'it'::"text", "filter_archetype_id" "text" DEFAULT NULL::"text", "similarity_threshold" numeric DEFAULT 0.3, "result_limit" integer DEFAULT 10) RETURNS TABLE("synonym_id" "uuid", "synonym" "text", "plant_id" "text", "plant_name" "text", "archetype_id" "text", "family_id" "text", "functional_category" "text", "similarity_score" numeric, "confidence" numeric)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id as synonym_id,
    ps.synonym,
    pt.plant_id,
    pt.names->>'it' as plant_name,
    pt.archetype_id,
    pt.family_id,
    pt.functional_category,
    similarity(ps.normalized_synonym, search_query) as similarity_score,
    ps.confidence
  FROM plant_synonyms ps
  JOIN plant_taxonomy pt ON ps.plant_id = pt.plant_id
  WHERE ps.locale = search_locale
    AND (ps.normalized_synonym % search_query OR similarity(ps.normalized_synonym, search_query) > similarity_threshold)
    AND (filter_archetype_id IS NULL OR pt.archetype_id = filter_archetype_id)
  ORDER BY similarity_score DESC, ps.confidence DESC, ps.usage_count DESC
  LIMIT result_limit;
END;
$$;


ALTER FUNCTION "public"."search_plant_synonyms"("search_query" "text", "search_locale" "text", "filter_archetype_id" "text", "similarity_threshold" numeric, "result_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_plant_operations_to_main_tables"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    affected_plants INTEGER;
    total_quantity DECIMAL;
    garden_id_val UUID;
    row_id_val UUID;
    field_row_id_val UUID;
BEGIN
    -- Ottieni informazioni sulla pianta
    SELECT gp.garden_id, gp.row_id, gp.field_row_id 
    INTO garden_id_val, row_id_val, field_row_id_val
    FROM garden_plants gp 
    WHERE gp.id = NEW.plant_id;
    
    -- Conta operazioni simili nello stesso giorno per lo stesso filare
    SELECT COUNT(DISTINCT po.plant_id), COALESCE(SUM(po.quantity), 0)
    INTO affected_plants, total_quantity
    FROM plant_operations po
    JOIN garden_plants gp ON po.plant_id = gp.id
    WHERE po.operation_type = NEW.operation_type
    AND po.operation_date = NEW.operation_date
    AND (
        (row_id_val IS NOT NULL AND gp.row_id = row_id_val) OR
        (field_row_id_val IS NOT NULL AND gp.field_row_id = field_row_id_val)
    );
    
    -- Log per debug (opzionale)
    RAISE NOTICE 'Sync operation: % plants affected, total quantity: %', affected_plants, total_quantity;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_plant_operations_to_main_tables"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_scheduled_date"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Se scheduled_date non è impostato, usa date
  IF NEW.scheduled_date IS NULL THEN
    NEW.scheduled_date := NEW.date;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_scheduled_date"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_calculated_plants"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Per field_rows
    IF TG_TABLE_NAME = 'field_rows' THEN
        IF NEW.length_meters IS NOT NULL AND NEW.plant_spacing IS NOT NULL THEN
            NEW.calculated_plants := calculate_plants_in_row(NEW.length_meters::NUMERIC, NEW.plant_spacing::NUMERIC);
        END IF;
    END IF;
    
    -- Per garden_rows  
    IF TG_TABLE_NAME = 'garden_rows' THEN
        IF NEW.row_length_cm IS NOT NULL AND NEW.spacing_between_plants_cm IS NOT NULL THEN
            NEW.calculated_plants := calculate_plants_in_row((NEW.row_length_cm / 100.0)::NUMERIC, NEW.spacing_between_plants_cm::NUMERIC);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_calculated_plants"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_field_row_on_mechanical_work"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.field_row_id IS NOT NULL THEN
    UPDATE field_rows 
    SET updated_at = NOW()
    WHERE id = NEW.field_row_id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_field_row_on_mechanical_work"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_field_row_on_treatment"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.field_row_id IS NOT NULL THEN
    UPDATE field_rows 
    SET updated_at = NOW()
    WHERE id = NEW.field_row_id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_field_row_on_treatment"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_field_row_plant_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE field_rows 
    SET current_plant_count = current_plant_count + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.field_row_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE field_rows 
    SET current_plant_count = current_plant_count - OLD.quantity,
        updated_at = NOW()
    WHERE id = OLD.field_row_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE field_rows 
    SET current_plant_count = current_plant_count - OLD.quantity + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.field_row_id;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_field_row_plant_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_field_rows_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_field_rows_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_haccp_certification_status"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Update base certification when HACCP system changes
    INSERT INTO certifications (garden_id, type, status, updated_at)
    VALUES (NEW.garden_id, 'HACCP', NEW.status, NOW())
    ON CONFLICT (garden_id, type)
    DO UPDATE SET 
        status = NEW.status,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_haccp_certification_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_organic_certification_status"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    cert_type TEXT;
BEGIN
    -- Determine certification type based on certifying body
    cert_type := CASE NEW.certifying_body
        WHEN 'ICEA' THEN 'ORGANIC_ICEA'
        WHEN 'CCPB' THEN 'ORGANIC_CCPB'
        ELSE 'ORGANIC_EU'
    END;
    
    -- Update base certification
    INSERT INTO certifications (garden_id, type, status, valid_from, valid_until, certifying_body, certificate_number, updated_at)
    VALUES (NEW.garden_id, cert_type, NEW.status, NEW.valid_from, NEW.valid_until, NEW.certifying_body, NEW.certificate_number, NOW())
    ON CONFLICT (garden_id, type)
    DO UPDATE SET 
        status = NEW.status,
        valid_from = NEW.valid_from,
        valid_until = NEW.valid_until,
        certifying_body = NEW.certifying_body,
        certificate_number = NEW.certificate_number,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_organic_certification_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_plan_quantity_from_transition"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Aggiorna quantità corrente nel piano
  UPDATE cultivation_plans 
  SET 
    current_quantity = NEW.quantity_after,
    current_phase = NEW.to_phase,
    current_location = NEW.location,
    updated_at = NOW()
  WHERE id = NEW.cultivation_plan_id;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_plan_quantity_from_transition"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_plant_taxonomy_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_plant_taxonomy_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_updated_at_column"() IS 'Auto-updates updated_at timestamp. Security: search_path fixed.';



CREATE OR REPLACE FUNCTION "public"."update_updated_at_column_sync"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column_sync"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_zone_last_watered"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE irrigation_zones
  SET last_watered_at = NEW.watered_at
  WHERE id = NEW.zone_id;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_zone_last_watered"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."water_all_plants_in_row"("p_row_id" "uuid" DEFAULT NULL::"uuid", "p_field_row_id" "uuid" DEFAULT NULL::"uuid", "p_liters_per_plant" numeric DEFAULT 3.0, "p_notes" "text" DEFAULT 'Irrigazione automatica filare'::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    operations_created INTEGER;
    plants_affected INTEGER;
    total_water DECIMAL;
    result JSONB;
BEGIN
    -- Applica irrigazione a tutte le piante sane
    operations_created := apply_operation_to_row_plants(
        'watering',
        p_row_id,
        p_field_row_id,
        CURRENT_DATE,
        p_liters_per_plant,
        'L',
        NULL,
        p_notes
    );
    
    -- Calcola totali
    plants_affected := operations_created;
    total_water := plants_affected * p_liters_per_plant;
    
    -- Prepara risultato
    result := jsonb_build_object(
        'success', true,
        'operation_type', 'watering',
        'plants_affected', plants_affected,
        'operations_created', operations_created,
        'total_water_liters', total_water,
        'water_per_plant_liters', p_liters_per_plant,
        'date', CURRENT_DATE
    );
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."water_all_plants_in_row"("p_row_id" "uuid", "p_field_row_id" "uuid", "p_liters_per_plant" numeric, "p_notes" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."water_all_plants_in_row"("p_row_id" "uuid", "p_field_row_id" "uuid", "p_liters_per_plant" numeric, "p_notes" "text") IS 'Irriga tutte le piante sane di un filare con quantità specificata';



CREATE TABLE IF NOT EXISTS "public"."agronomist_advice" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "consultation_id" "uuid" NOT NULL,
    "task_id" "uuid",
    "advice_text" "text" NOT NULL,
    "category" "text",
    "priority" "text",
    "apply_date" "date",
    "apply_season" "jsonb",
    "applied" boolean DEFAULT false,
    "applied_date" "date",
    "result" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "agronomist_advice_category_check" CHECK (("category" = ANY (ARRAY['Fertilization'::"text", 'Pruning'::"text", 'Irrigation'::"text", 'Disease'::"text", 'Harvest'::"text", 'Other'::"text"]))),
    CONSTRAINT "agronomist_advice_priority_check" CHECK (("priority" = ANY (ARRAY['High'::"text", 'Medium'::"text", 'Low'::"text"])))
);


ALTER TABLE "public"."agronomist_advice" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agronomist_consultations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agronomist_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_id" "uuid",
    "task_id" "uuid",
    "date" "date" NOT NULL,
    "consultation_type" "text",
    "topic" "text" NOT NULL,
    "advice" "jsonb",
    "notes" "text",
    "attachments" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "agronomist_consultations_consultation_type_check" CHECK (("consultation_type" = ANY (ARRAY['InPerson'::"text", 'Phone'::"text", 'Email'::"text", 'Video'::"text"])))
);


ALTER TABLE "public"."agronomist_consultations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agronomists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "specialization" "jsonb",
    "notes" "text",
    "preferred_contact_method" "text",
    "consultation_frequency" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "agronomists_consultation_frequency_check" CHECK (("consultation_frequency" = ANY (ARRAY['Weekly'::"text", 'Monthly'::"text", 'Seasonal'::"text", 'OnDemand'::"text"]))),
    CONSTRAINT "agronomists_preferred_contact_method_check" CHECK (("preferred_contact_method" = ANY (ARRAY['Email'::"text", 'Phone'::"text", 'InPerson'::"text"])))
);


ALTER TABLE "public"."agronomists" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_credit_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "amount" integer NOT NULL,
    "type" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ai_credit_transactions_type_check" CHECK (("type" = ANY (ARRAY['purchase'::"text", 'usage'::"text", 'bonus'::"text", 'refund'::"text"])))
);


ALTER TABLE "public"."ai_credit_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."api_configurations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "service_name" "text" NOT NULL,
    "api_key" "text",
    "api_secret" "text",
    "endpoint_url" "text",
    "configuration" "jsonb" DEFAULT '{}'::"jsonb",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."api_configurations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."aquaponic_readings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "reading_date" timestamp with time zone DEFAULT "now"(),
    "ph" numeric(3,2),
    "ammonia" numeric(5,2),
    "nitrite" numeric(5,2),
    "nitrate" numeric(5,2),
    "water_temperature" numeric(4,1),
    "dissolved_oxygen" numeric(4,2),
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "aquaponic_readings_ph_check" CHECK ((("ph" >= (0)::numeric) AND ("ph" <= (14)::numeric)))
);


ALTER TABLE "public"."aquaponic_readings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_checklist_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "audit_id" "uuid" NOT NULL,
    "section" "text" NOT NULL,
    "requirement" "text" NOT NULL,
    "evidence" "text",
    "conformity" "text",
    "notes" "text",
    "corrective_action" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "audit_checklist_items_conformity_check" CHECK (("conformity" = ANY (ARRAY['COMPLIANT'::"text", 'NON_COMPLIANT'::"text", 'NOT_APPLICABLE'::"text", 'OBSERVATION'::"text"])))
);


ALTER TABLE "public"."audit_checklist_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_schedules" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "certification_type" "text" NOT NULL,
    "audit_type" "text" NOT NULL,
    "scheduled_date" timestamp with time zone NOT NULL,
    "auditor" "text" NOT NULL,
    "scope" "text"[] DEFAULT '{}'::"text"[],
    "status" "text" DEFAULT 'SCHEDULED'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "audit_schedules_audit_type_check" CHECK (("audit_type" = ANY (ARRAY['INTERNAL'::"text", 'EXTERNAL'::"text", 'SURVEILLANCE'::"text", 'RECERTIFICATION'::"text"]))),
    CONSTRAINT "audit_schedules_status_check" CHECK (("status" = ANY (ARRAY['SCHEDULED'::"text", 'IN_PROGRESS'::"text", 'COMPLETED'::"text", 'CANCELLED'::"text"])))
);


ALTER TABLE "public"."audit_schedules" OWNER TO "postgres";


COMMENT ON TABLE "public"."audit_schedules" IS 'Audit and inspection scheduling and tracking';



CREATE TABLE IF NOT EXISTS "public"."bed_planting_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "bed_id" "uuid" NOT NULL,
    "plant_id" "text" NOT NULL,
    "plant_name" "text" NOT NULL,
    "plant_family" "text" NOT NULL,
    "season" "text" NOT NULL,
    "year" integer NOT NULL,
    "planted_at" timestamp with time zone,
    "harvested_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "bed_planting_history_season_check" CHECK (("season" = ANY (ARRAY['Summer'::"text", 'Winter'::"text"])))
);


ALTER TABLE "public"."bed_planting_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."calendar_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "task_type" "text" NOT NULL,
    "scheduled_date" "date" NOT NULL,
    "completed_at" timestamp with time zone,
    "priority" "text" DEFAULT 'medium'::"text",
    "estimated_duration" integer,
    "actual_duration" integer,
    "weather_dependent" boolean DEFAULT false,
    "recurring_pattern" "jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "calendar_tasks_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'urgent'::"text"]))),
    CONSTRAINT "calendar_tasks_task_type_check" CHECK (("task_type" = ANY (ARRAY['seeding'::"text", 'transplanting'::"text", 'watering'::"text", 'fertilizing'::"text", 'harvesting'::"text", 'pruning'::"text", 'treatment'::"text", 'maintenance'::"text", 'custom'::"text"])))
);


ALTER TABLE "public"."calendar_tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."certification_documents" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "certification_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "type" "text" NOT NULL,
    "version" "text" DEFAULT '1.0'::"text",
    "approved_by" "text",
    "approval_date" timestamp with time zone DEFAULT "now"(),
    "effective_date" timestamp with time zone DEFAULT "now"(),
    "review_date" timestamp with time zone DEFAULT ("now"() + '1 year'::interval),
    "status" "text" DEFAULT 'DRAFT'::"text" NOT NULL,
    "file_path" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "certification_documents_status_check" CHECK (("status" = ANY (ARRAY['DRAFT'::"text", 'APPROVED'::"text", 'OBSOLETE'::"text"]))),
    CONSTRAINT "certification_documents_type_check" CHECK (("type" = ANY (ARRAY['PROCEDURE'::"text", 'RECORD'::"text", 'CERTIFICATE'::"text", 'REPORT'::"text", 'MANUAL'::"text"])))
);


ALTER TABLE "public"."certification_documents" OWNER TO "postgres";


COMMENT ON TABLE "public"."certification_documents" IS 'Document management for certifications';



CREATE TABLE IF NOT EXISTS "public"."certifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "status" "text" DEFAULT 'NOT_STARTED'::"text" NOT NULL,
    "valid_from" timestamp with time zone,
    "valid_until" timestamp with time zone,
    "certifying_body" "text",
    "certificate_number" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "certifications_status_check" CHECK (("status" = ANY (ARRAY['NOT_STARTED'::"text", 'IN_PROGRESS'::"text", 'COMPLIANT'::"text", 'NON_COMPLIANT'::"text", 'EXPIRED'::"text", 'SUSPENDED'::"text"]))),
    CONSTRAINT "certifications_type_check" CHECK (("type" = ANY (ARRAY['GLOBALGAP'::"text", 'HACCP'::"text", 'ORGANIC_EU'::"text", 'ORGANIC_ICEA'::"text", 'ORGANIC_CCPB'::"text", 'BRC'::"text", 'IFS'::"text", 'ISO22000'::"text", 'GRASP'::"text", 'RAINFOREST'::"text", 'FAIRTRADE'::"text"])))
);


ALTER TABLE "public"."certifications" OWNER TO "postgres";


COMMENT ON TABLE "public"."certifications" IS 'Base table for all certification types and their status';



CREATE TABLE IF NOT EXISTS "public"."certified_suppliers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "status" "text" DEFAULT 'APPROVED'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "certified_suppliers_status_check" CHECK (("status" = ANY (ARRAY['APPROVED'::"text", 'CONDITIONAL'::"text", 'SUSPENDED'::"text", 'REJECTED'::"text"]))),
    CONSTRAINT "certified_suppliers_type_check" CHECK (("type" = ANY (ARRAY['SEED'::"text", 'FERTILIZER'::"text", 'PESTICIDE'::"text", 'EQUIPMENT'::"text", 'SERVICE'::"text"])))
);


ALTER TABLE "public"."certified_suppliers" OWNER TO "postgres";


COMMENT ON TABLE "public"."certified_suppliers" IS 'Supplier qualification and certification tracking';



CREATE TABLE IF NOT EXISTS "public"."challenge_completions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "challenge_id" "text" NOT NULL,
    "challenge_type" "text" NOT NULL,
    "challenge_name" "text" NOT NULL,
    "challenge_description" "text",
    "target_value" integer,
    "current_progress" integer DEFAULT 0,
    "completed_at" timestamp with time zone,
    "reward_points" integer DEFAULT 0,
    "reward_badge" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "challenge_completions_challenge_type_check" CHECK (("challenge_type" = ANY (ARRAY['daily'::"text", 'weekly'::"text", 'monthly'::"text", 'seasonal'::"text", 'achievement'::"text", 'milestone'::"text"])))
);


ALTER TABLE "public"."challenge_completions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."crop_archetypes" (
    "id" "text" NOT NULL,
    "label" "text" NOT NULL,
    "icon" "text" NOT NULL,
    "botanical_family" "text" NOT NULL,
    "default_profile_id" "uuid",
    "parent_archetype_id" "text",
    "examples" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."crop_archetypes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."crop_learning_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "crop_name" "text" NOT NULL,
    "archetype_id" "text",
    "event_type" "text" NOT NULL,
    "event_title" "text" NOT NULL,
    "event_description" "text",
    "lesson_learned" "text",
    "confidence_level" integer,
    "reproducible" boolean DEFAULT false,
    "conditions" "jsonb" DEFAULT '{}'::"jsonb",
    "outcome" "jsonb" DEFAULT '{}'::"jsonb",
    "photos" "text"[],
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "shared_publicly" boolean DEFAULT false,
    "helpful_votes" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "crop_learning_events_confidence_level_check" CHECK ((("confidence_level" >= 1) AND ("confidence_level" <= 5))),
    CONSTRAINT "crop_learning_events_event_type_check" CHECK (("event_type" = ANY (ARRAY['success'::"text", 'failure'::"text", 'observation'::"text", 'experiment'::"text", 'discovery'::"text"])))
);


ALTER TABLE "public"."crop_learning_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."crop_mechanical_works" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "crop_name" "text" NOT NULL,
    "archetype_id" "text",
    "work_type" "text" NOT NULL,
    "work_name" "text" NOT NULL,
    "timing_description" "text",
    "tools_required" "text"[],
    "estimated_time_minutes" integer,
    "difficulty_level" "text" DEFAULT 'medium'::"text",
    "instructions" "text",
    "tips" "text",
    "frequency" "text",
    "season_applicability" "text"[] DEFAULT '{}'::"text"[],
    "weather_requirements" "text",
    "created_by_user" boolean DEFAULT true,
    "is_template" boolean DEFAULT false,
    "usage_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "crop_mechanical_works_difficulty_level_check" CHECK (("difficulty_level" = ANY (ARRAY['easy'::"text", 'medium'::"text", 'hard'::"text"]))),
    CONSTRAINT "crop_mechanical_works_work_type_check" CHECK (("work_type" = ANY (ARRAY['soil_preparation'::"text", 'seeding'::"text", 'transplanting'::"text", 'cultivation'::"text", 'weeding'::"text", 'pruning'::"text", 'harvesting'::"text", 'post_harvest'::"text"])))
);


ALTER TABLE "public"."crop_mechanical_works" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."crop_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "archetype_id" "text",
    "root_zone_depth_cm_default" integer NOT NULL,
    "root_zone_depth_cm_min" integer,
    "root_zone_depth_cm_max" integer,
    "kc_json" "jsonb" NOT NULL,
    "stress_depletion_p_default" numeric(3,2) DEFAULT 0.5,
    "nutrient_plan_json" "jsonb",
    "irrigation_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."crop_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cultivation_issues" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cultivation_plan_id" "uuid" NOT NULL,
    "issue_type" "text" NOT NULL,
    "issue_severity" "text" NOT NULL,
    "issue_description" "text" NOT NULL,
    "phase_occurred" "text" NOT NULL,
    "location" "text" NOT NULL,
    "quantity_affected" integer,
    "quantity_lost" integer DEFAULT 0,
    "resolution_applied" "text",
    "resolution_effective" boolean,
    "prevention_notes" "text",
    "detected_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "resolved_date" "date",
    "photos" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "cultivation_issues_issue_severity_check" CHECK (("issue_severity" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'critical'::"text"]))),
    CONSTRAINT "cultivation_issues_issue_type_check" CHECK (("issue_type" = ANY (ARRAY['pest'::"text", 'disease'::"text", 'weather'::"text", 'nutrient'::"text", 'watering'::"text", 'transplant_shock'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."cultivation_issues" OWNER TO "postgres";


COMMENT ON TABLE "public"."cultivation_issues" IS 'Tracking problemi ricorrenti e loro risoluzioni';



CREATE TABLE IF NOT EXISTS "public"."cultivation_statistics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "period_type" "text" NOT NULL,
    "period_start" "date" NOT NULL,
    "period_end" "date" NOT NULL,
    "archetype_id" "text" NOT NULL,
    "archetype_category" "text" NOT NULL,
    "total_plans" integer DEFAULT 0,
    "completed_plans" integer DEFAULT 0,
    "success_rate" numeric(5,2) DEFAULT 0,
    "avg_days_to_harvest" numeric(8,2),
    "avg_days_germination" numeric(8,2),
    "avg_days_transplant" numeric(8,2),
    "losses_germination" numeric(5,2) DEFAULT 0,
    "losses_nursing" numeric(5,2) DEFAULT 0,
    "losses_transplant" numeric(5,2) DEFAULT 0,
    "losses_growing" numeric(5,2) DEFAULT 0,
    "total_harvest_quantity" numeric(10,2) DEFAULT 0,
    "avg_harvest_per_plant" numeric(8,2) DEFAULT 0,
    "calculated_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "cultivation_statistics_period_type_check" CHECK (("period_type" = ANY (ARRAY['monthly'::"text", 'seasonal'::"text", 'yearly'::"text"])))
);


ALTER TABLE "public"."cultivation_statistics" OWNER TO "postgres";


COMMENT ON TABLE "public"."cultivation_statistics" IS 'Statistiche aggregate per performance coltivazioni';



CREATE TABLE IF NOT EXISTS "public"."custom_crops" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "archetype_id" "text",
    "custom_profile_id" "uuid",
    "scientific_name" "text",
    "variety" "text",
    "source" "text",
    "notes" "text",
    "photos" "text"[],
    "growing_notes" "jsonb" DEFAULT '{}'::"jsonb",
    "harvest_notes" "jsonb" DEFAULT '{}'::"jsonb",
    "is_public" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."custom_crops" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."custom_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "base_master_sheet_id" "text" NOT NULL,
    "overrides" "jsonb",
    "custom_notes" "jsonb",
    "custom_methods" "jsonb",
    "additional_parameters" "jsonb",
    "is_public" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."custom_plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."detailed_harvests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cultivation_plan_id" "uuid" NOT NULL,
    "harvest_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "quantity_harvested" numeric(8,2) NOT NULL,
    "unit_of_measure" "text" DEFAULT 'kg'::"text" NOT NULL,
    "quality_grade" "text",
    "brix_level" numeric(4,1),
    "size_category" "text",
    "plant_health" "text",
    "weather_conditions" "jsonb",
    "destination" "text",
    "market_price" numeric(8,2),
    "notes" "text",
    "photos" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "detailed_harvests_destination_check" CHECK (("destination" = ANY (ARRAY['consumption'::"text", 'sale'::"text", 'gift'::"text", 'compost'::"text", 'seed_saving'::"text"]))),
    CONSTRAINT "detailed_harvests_plant_health_check" CHECK (("plant_health" = ANY (ARRAY['excellent'::"text", 'good'::"text", 'fair'::"text", 'poor'::"text"]))),
    CONSTRAINT "detailed_harvests_quality_grade_check" CHECK (("quality_grade" = ANY (ARRAY['excellent'::"text", 'good'::"text", 'fair'::"text", 'poor'::"text"])))
);


ALTER TABLE "public"."detailed_harvests" OWNER TO "postgres";


COMMENT ON TABLE "public"."detailed_harvests" IS 'Dettagli raccolti con qualità e destinazione';



CREATE TABLE IF NOT EXISTS "public"."fertilization_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_zone_id" "uuid",
    "fertilizer_name" "text" NOT NULL,
    "fertilizer_type" "text" NOT NULL,
    "application_date" "date" NOT NULL,
    "quantity_applied" numeric(8,2) NOT NULL,
    "quantity_unit" "text" NOT NULL,
    "npk_ratio" "text",
    "application_method" "text",
    "weather_conditions" "text",
    "soil_moisture_level" "text",
    "crop_growth_stage" "text",
    "cost" numeric(8,2),
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "fertilization_logs_application_method_check" CHECK (("application_method" = ANY (ARRAY['broadcast'::"text", 'banding'::"text", 'foliar'::"text", 'fertigation'::"text", 'side_dress'::"text"]))),
    CONSTRAINT "fertilization_logs_fertilizer_type_check" CHECK (("fertilizer_type" = ANY (ARRAY['organic'::"text", 'mineral'::"text", 'liquid'::"text", 'granular'::"text", 'compost'::"text", 'manure'::"text"]))),
    CONSTRAINT "fertilization_logs_quantity_unit_check" CHECK (("quantity_unit" = ANY (ARRAY['kg'::"text", 'g'::"text", 'l'::"text", 'ml'::"text", 'bags'::"text", 'scoops'::"text"]))),
    CONSTRAINT "fertilization_logs_soil_moisture_level_check" CHECK (("soil_moisture_level" = ANY (ARRAY['dry'::"text", 'moist'::"text", 'wet'::"text", 'saturated'::"text"])))
);


ALTER TABLE "public"."fertilization_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fertilizer_application_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_id" "uuid",
    "crop_name" "text",
    "application_date" "date" NOT NULL,
    "fertilizer_name" "text" NOT NULL,
    "fertilizer_type" "text",
    "nitrogen_n" numeric(5,2),
    "phosphorus_p" numeric(5,2),
    "potassium_k" numeric(5,2),
    "dosage" numeric(10,2) NOT NULL,
    "dosage_unit" "text" NOT NULL,
    "area_applied" numeric(10,2),
    "application_method" "text",
    "weather_conditions" "jsonb",
    "operator_name" "text",
    "notes" "text",
    "zone_id" "uuid",
    "row_ids" "uuid"[],
    "bed_ids" "uuid"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "bed_id" "uuid",
    "bed_row_id" "uuid",
    "field_row_id" "uuid",
    "plant_ids" "uuid"[],
    "plants_affected" integer,
    "fertilizer_per_plant_grams" numeric(8,2) DEFAULT NULL::numeric,
    CONSTRAINT "check_fertilizer_row_reference" CHECK (((("bed_row_id" IS NULL) AND ("field_row_id" IS NULL)) OR (("bed_row_id" IS NOT NULL) AND ("field_row_id" IS NULL)) OR (("bed_row_id" IS NULL) AND ("field_row_id" IS NOT NULL)))),
    CONSTRAINT "fertilizer_application_logs_application_method_check" CHECK (("application_method" = ANY (ARRAY['broadcast'::"text", 'band'::"text", 'foliar'::"text", 'fertigation'::"text", 'manual'::"text"]))),
    CONSTRAINT "fertilizer_application_logs_dosage_unit_check" CHECK (("dosage_unit" = ANY (ARRAY['kg'::"text", 'g'::"text", 'L'::"text", 'ml'::"text", 'kg/ha'::"text", 'L/ha'::"text"]))),
    CONSTRAINT "fertilizer_application_logs_fertilizer_type_check" CHECK (("fertilizer_type" = ANY (ARRAY['organic'::"text", 'chemical'::"text", 'mineral'::"text", 'mixed'::"text"])))
);


ALTER TABLE "public"."fertilizer_application_logs" OWNER TO "postgres";


COMMENT ON COLUMN "public"."fertilizer_application_logs"."plant_ids" IS 'Array di IDs delle piante specifiche fertilizzate';



COMMENT ON COLUMN "public"."fertilizer_application_logs"."plants_affected" IS 'Numero totale di piante fertilizzate';



COMMENT ON COLUMN "public"."fertilizer_application_logs"."fertilizer_per_plant_grams" IS 'Grammi di fertilizzante per singola pianta';



CREATE TABLE IF NOT EXISTS "public"."fertilizer_inventory" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_id" "uuid",
    "fertilizer_name" "text" NOT NULL,
    "fertilizer_type" "text" NOT NULL,
    "nitrogen_n" numeric(5,2),
    "phosphorus_p" numeric(5,2),
    "potassium_k" numeric(5,2),
    "calcium_ca" numeric(5,2),
    "magnesium_mg" numeric(5,2),
    "sulfur_s" numeric(5,2),
    "micronutrients" "jsonb",
    "quantity" numeric(10,2) NOT NULL,
    "quantity_unit" "text" NOT NULL,
    "purchase_date" "date",
    "expiry_date" "date",
    "manufacturer" "text",
    "storage_location" "text",
    "min_stock_alert" numeric(10,2),
    "unit_cost" numeric(10,2),
    "currency" "text" DEFAULT 'EUR'::"text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "fertilizer_inventory_fertilizer_type_check" CHECK (("fertilizer_type" = ANY (ARRAY['organic'::"text", 'chemical'::"text", 'mineral'::"text", 'mixed'::"text"]))),
    CONSTRAINT "fertilizer_inventory_quantity_unit_check" CHECK (("quantity_unit" = ANY (ARRAY['kg'::"text", 'g'::"text", 'L'::"text", 'ml'::"text"])))
);


ALTER TABLE "public"."fertilizer_inventory" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."field_rows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "zone_id" "uuid",
    "name" "text" NOT NULL,
    "row_number" integer NOT NULL,
    "length_meters" numeric(10,2) NOT NULL,
    "distance_from_previous_row" numeric(10,2),
    "plant_spacing" numeric(10,2),
    "cultivar" "text",
    "plant_count" integer,
    "orientation" "text",
    "irrigation_line" "jsonb",
    "planted_date" "date",
    "is_active" boolean DEFAULT true,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "max_plant_count" integer DEFAULT 0,
    "current_plant_count" integer DEFAULT 0,
    "status" "text" DEFAULT 'active'::"text",
    "calculated_plants" integer,
    CONSTRAINT "field_rows_orientation_check" CHECK (("orientation" = ANY (ARRAY['N-S'::"text", 'E-W'::"text", 'NE-SW'::"text", 'NW-SE'::"text"]))),
    CONSTRAINT "positive_length" CHECK (("length_meters" > (0)::numeric)),
    CONSTRAINT "positive_spacing" CHECK ((("plant_spacing" IS NULL) OR ("plant_spacing" > (0)::numeric)))
);


ALTER TABLE "public"."field_rows" OWNER TO "postgres";


COMMENT ON TABLE "public"."field_rows" IS 'Sistema di gestione filari per orti professionali';



COMMENT ON COLUMN "public"."field_rows"."garden_id" IS 'Riferimento al giardino';



COMMENT ON COLUMN "public"."field_rows"."zone_id" IS 'Riferimento alla zona (opzionale)';



COMMENT ON COLUMN "public"."field_rows"."name" IS 'Nome identificativo del filare';



COMMENT ON COLUMN "public"."field_rows"."row_number" IS 'Numero progressivo del filare';



COMMENT ON COLUMN "public"."field_rows"."length_meters" IS 'Lunghezza del filare in metri';



COMMENT ON COLUMN "public"."field_rows"."distance_from_previous_row" IS 'Distanza dal filare precedente in cm';



COMMENT ON COLUMN "public"."field_rows"."plant_spacing" IS 'Spaziatura tra le piante in cm';



COMMENT ON COLUMN "public"."field_rows"."plant_count" IS 'Auto-calcolato da trigger: (length_meters * 100) / plant_spacing';



COMMENT ON COLUMN "public"."field_rows"."max_plant_count" IS 'Numero massimo di piante calcolato automaticamente';



COMMENT ON COLUMN "public"."field_rows"."current_plant_count" IS 'Numero attuale di piante nel filare';



CREATE TABLE IF NOT EXISTS "public"."garden_accessories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "category" "text" NOT NULL,
    "support_type" "text",
    "netting_type" "text",
    "wire_type" "text",
    "material" "text" NOT NULL,
    "quantity" integer,
    "length_cm" integer,
    "height_cm" integer,
    "width_cm" integer,
    "diameter_cm" integer,
    "mesh_size_mm" integer,
    "used_for" "jsonb",
    "installation_date" "date",
    "expected_lifespan_years" integer,
    "last_maintenance" "date",
    "needs_replacement" boolean DEFAULT false,
    "position" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "garden_accessories_category_check" CHECK (("category" = ANY (ARRAY['Support'::"text", 'Netting'::"text", 'Wire'::"text", 'Structure'::"text"]))),
    CONSTRAINT "garden_accessories_material_check" CHECK (("material" = ANY (ARRAY['Wood'::"text", 'Steel'::"text", 'Plastic'::"text", 'Bamboo'::"text", 'Cane'::"text", 'Aluminum'::"text", 'Polyethylene'::"text", 'Polypropylene'::"text"]))),
    CONSTRAINT "garden_accessories_netting_type_check" CHECK (("netting_type" = ANY (ARRAY['Shade'::"text", 'Hail'::"text", 'Insect'::"text", 'Harvest'::"text"]))),
    CONSTRAINT "garden_accessories_support_type_check" CHECK (("support_type" = ANY (ARRAY['Stake'::"text", 'Tutor'::"text", 'Trellis'::"text", 'Cage'::"text"]))),
    CONSTRAINT "garden_accessories_wire_type_check" CHECK (("wire_type" = ANY (ARRAY['Steel'::"text", 'Plastic'::"text"])))
);


ALTER TABLE "public"."garden_accessories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."garden_beds" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "bed_type" "text",
    "shape" "text",
    "length_cm" numeric(8,2),
    "width_cm" numeric(8,2),
    "diameter_cm" numeric(8,2),
    "size_sq_meters" numeric(5,2),
    "sun_exposure" "text",
    "daily_sun_hours" integer,
    "aspect_direction" "text",
    "soil_type" "text",
    "structure_id" "uuid",
    "structure_type" "text",
    "is_covered" boolean DEFAULT false,
    "covering_structure_id" "uuid",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "garden_beds_bed_type_check" CHECK (("bed_type" = ANY (ARRAY['RaisedBed'::"text", 'Container'::"text", 'Pot'::"text", 'Ground'::"text", 'Greenhouse'::"text", 'Hydroponic'::"text", 'Aquaponic'::"text", 'Aeroponic'::"text", 'Indoor'::"text"]))),
    CONSTRAINT "garden_beds_shape_check" CHECK (("shape" = ANY (ARRAY['Rectangle'::"text", 'Circle'::"text", 'Custom'::"text"]))),
    CONSTRAINT "garden_beds_structure_type_check" CHECK (("structure_type" = ANY (ARRAY['Greenhouse'::"text", 'Hydroponic'::"text", 'Aquaponic'::"text", 'Aeroponic'::"text", 'Indoor'::"text"]))),
    CONSTRAINT "garden_beds_sun_exposure_check" CHECK (("sun_exposure" = ANY (ARRAY['FullSun'::"text", 'PartSun'::"text", 'Shade'::"text"])))
);


ALTER TABLE "public"."garden_beds" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."garden_correlations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "correlation_type" "text" NOT NULL,
    "primary_crop" "text" NOT NULL,
    "secondary_crop" "text",
    "relationship_strength" numeric(3,2),
    "effect_description" "text",
    "evidence_level" "text" DEFAULT 'observed'::"text",
    "season" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "garden_correlations_correlation_type_check" CHECK (("correlation_type" = ANY (ARRAY['companion_planting'::"text", 'succession_planting'::"text", 'crop_rotation'::"text", 'pest_management'::"text", 'nutrient_cycling'::"text"]))),
    CONSTRAINT "garden_correlations_evidence_level_check" CHECK (("evidence_level" = ANY (ARRAY['theoretical'::"text", 'observed'::"text", 'measured'::"text", 'scientific'::"text"]))),
    CONSTRAINT "garden_correlations_relationship_strength_check" CHECK ((("relationship_strength" >= '-1.0'::numeric) AND ("relationship_strength" <= 1.0)))
);


ALTER TABLE "public"."garden_correlations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."garden_obstacles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "azimuth" numeric(5,2) NOT NULL,
    "height_meters" numeric(6,2) NOT NULL,
    "distance_meters" numeric(6,2) NOT NULL,
    "width_degrees" numeric(5,2) DEFAULT 30,
    "type" "text" DEFAULT 'Other'::"text",
    "source" "text" DEFAULT 'manual'::"text",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "garden_obstacles_azimuth_check" CHECK ((("azimuth" >= (0)::numeric) AND ("azimuth" <= (360)::numeric))),
    CONSTRAINT "garden_obstacles_distance_meters_check" CHECK (("distance_meters" > (0)::numeric)),
    CONSTRAINT "garden_obstacles_height_meters_check" CHECK (("height_meters" > (0)::numeric)),
    CONSTRAINT "garden_obstacles_source_check" CHECK (("source" = ANY (ARRAY['photo_360'::"text", 'manual'::"text", 'ai_analysis'::"text"]))),
    CONSTRAINT "garden_obstacles_type_check" CHECK (("type" = ANY (ARRAY['Building'::"text", 'Tree'::"text", 'Mountain'::"text", 'Other'::"text"]))),
    CONSTRAINT "garden_obstacles_width_degrees_check" CHECK ((("width_degrees" > (0)::numeric) AND ("width_degrees" <= (180)::numeric)))
);


ALTER TABLE "public"."garden_obstacles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."garden_patterns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "pattern_name" "text" NOT NULL,
    "pattern_type" "text" NOT NULL,
    "pattern_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "success_rate" numeric(3,2),
    "difficulty_level" "text" DEFAULT 'medium'::"text",
    "season_applicability" "text"[] DEFAULT '{}'::"text"[],
    "space_requirements" "jsonb" DEFAULT '{}'::"jsonb",
    "expected_benefits" "text"[],
    "notes" "text",
    "is_template" boolean DEFAULT false,
    "is_public" boolean DEFAULT false,
    "usage_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "garden_patterns_difficulty_level_check" CHECK (("difficulty_level" = ANY (ARRAY['easy'::"text", 'medium'::"text", 'hard'::"text", 'expert'::"text"]))),
    CONSTRAINT "garden_patterns_pattern_type_check" CHECK (("pattern_type" = ANY (ARRAY['layout'::"text", 'rotation'::"text", 'succession'::"text", 'companion'::"text", 'seasonal'::"text"])))
);


ALTER TABLE "public"."garden_patterns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."garden_plants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "row_id" "uuid",
    "field_row_id" "uuid",
    "position_in_row" integer NOT NULL,
    "plant_code" "text" NOT NULL,
    "plant_name" "text" NOT NULL,
    "variety" "text",
    "planting_date" "date",
    "expected_harvest_date" "date",
    "status" "text" DEFAULT 'healthy'::"text" NOT NULL,
    "health_score" integer DEFAULT 100,
    "seedling_batch_id" "uuid",
    "sapling_batch_id" "uuid",
    "seed_packet_id" "uuid",
    "coordinates" "jsonb",
    "photos" "text"[],
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_health_score" CHECK ((("health_score" >= 0) AND ("health_score" <= 100))),
    CONSTRAINT "valid_row_reference" CHECK (((("row_id" IS NOT NULL) AND ("field_row_id" IS NULL)) OR (("row_id" IS NULL) AND ("field_row_id" IS NOT NULL)))),
    CONSTRAINT "valid_status" CHECK (("status" = ANY (ARRAY['healthy'::"text", 'diseased'::"text", 'dead'::"text", 'harvested'::"text", 'transplanted'::"text"])))
);


ALTER TABLE "public"."garden_plants" OWNER TO "postgres";


COMMENT ON TABLE "public"."garden_plants" IS 'Tracciamento individuale di ogni singola pianta nell orto con posizione precisa nel filare';



CREATE TABLE IF NOT EXISTS "public"."garden_rows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_zone_id" "uuid" NOT NULL,
    "row_number" integer NOT NULL,
    "row_length_cm" integer,
    "row_width_cm" integer,
    "spacing_between_plants_cm" integer,
    "spacing_between_rows_cm" integer,
    "orientation" "text",
    "crop_name" "text",
    "archetype_id" "text",
    "planting_date" "date",
    "expected_harvest_date" "date",
    "row_status" "text" DEFAULT 'planned'::"text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "calculated_plants" integer,
    CONSTRAINT "garden_rows_orientation_check" CHECK (("orientation" = ANY (ARRAY['north_south'::"text", 'east_west'::"text", 'northeast_southwest'::"text", 'northwest_southeast'::"text"]))),
    CONSTRAINT "garden_rows_row_status_check" CHECK (("row_status" = ANY (ARRAY['planned'::"text", 'planted'::"text", 'growing'::"text", 'harvested'::"text", 'fallow'::"text"])))
);


ALTER TABLE "public"."garden_rows" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."garden_season_analyses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "season" "text" NOT NULL,
    "year" integer NOT NULL,
    "total_yield_kg" numeric(8,2),
    "total_varieties_grown" integer,
    "success_rate" numeric(3,2),
    "most_successful_crops" "text"[],
    "least_successful_crops" "text"[],
    "weather_impact_score" numeric(3,2),
    "pest_pressure_score" numeric(3,2),
    "disease_pressure_score" numeric(3,2),
    "resource_efficiency_score" numeric(3,2),
    "sustainability_score" numeric(3,2),
    "lessons_learned" "text"[],
    "improvements_planned" "text"[],
    "analysis_data" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "garden_season_analyses_season_check" CHECK (("season" = ANY (ARRAY['spring'::"text", 'summer'::"text", 'autumn'::"text", 'winter'::"text"])))
);


ALTER TABLE "public"."garden_season_analyses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."garden_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "bed_id" "uuid",
    "plant_name" "text" NOT NULL,
    "variety" "text",
    "planting_method" "text",
    "location_type" "text",
    "initial_quantity" integer,
    "current_quantity" integer,
    "task_type" "text" NOT NULL,
    "stage" "text",
    "lifecycle_state" "text",
    "season" "text",
    "date" "date" NOT NULL,
    "expected_transplant_date" "date",
    "moon_phase" "text",
    "completed" boolean DEFAULT false,
    "notes" "text",
    "next_due_date" "date",
    "treatment_product_id" "text",
    "grid_position" "jsonb",
    "grid_rotation" integer,
    "user_responses" "jsonb",
    "recorded_brix" numeric(4,2),
    "harvest_ready_analysis" "text",
    "harvest_history" "jsonb",
    "final_harvest" "jsonb",
    "strawberry_data" "jsonb",
    "fruit_tree_data" "jsonb",
    "aromatic_data" "jsonb",
    "olive_data" "jsonb",
    "vine_data" "jsonb",
    "exotic_fruit_data" "jsonb",
    "mechanical_work_data" "jsonb",
    "tree_pruning_data" "jsonb",
    "hydroponic_data" "jsonb",
    "aquaponic_data" "jsonb",
    "aeroponic_data" "jsonb",
    "suggested_date" "date",
    "actual_completed_date" timestamp with time zone,
    "is_suggested" boolean DEFAULT false,
    "suggested_by" "text",
    "images" "jsonb",
    "last_photo_date" "date",
    "zone_id" "uuid",
    "seed_packet_id" "uuid",
    "seedling_batch_id" "uuid",
    "sapling_batch_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    "archetype_id" "text",
    "root_zone_depth_cm" integer,
    "irrigation_setup" "jsonb",
    "title" "text",
    "due_date" "date",
    "estimated_duration" integer,
    "actual_duration" integer,
    "weather_dependent" boolean DEFAULT false,
    "tools_needed" "text"[],
    "materials_needed" "text"[],
    "description" "text",
    "priority" "text" DEFAULT 'Medium'::"text",
    "orchestrator_source" "text",
    "task_priority" "text" DEFAULT 'medium'::"text",
    "scheduled_date" "date",
    "lunar_optimal" boolean DEFAULT false,
    "blocking_reason" "text",
    "parent_plan_id" "uuid",
    "recurrence_pattern" "jsonb",
    "auto_scheduled" boolean DEFAULT false,
    "is_critical" boolean DEFAULT false,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "bed_row_id" "uuid",
    "field_row_id" "uuid",
    CONSTRAINT "check_garden_tasks_row_reference" CHECK (((("bed_row_id" IS NULL) AND ("field_row_id" IS NULL)) OR (("bed_row_id" IS NOT NULL) AND ("field_row_id" IS NULL)) OR (("bed_row_id" IS NULL) AND ("field_row_id" IS NOT NULL)))),
    CONSTRAINT "garden_tasks_blocking_reason_check" CHECK (("blocking_reason" = ANY (ARRAY['frost'::"text", 'rain'::"text", 'heat'::"text", 'wind'::"text", 'moon_phase'::"text", 'soil_temp'::"text", 'other'::"text"]))),
    CONSTRAINT "garden_tasks_grid_rotation_check" CHECK ((("grid_rotation" >= 0) AND ("grid_rotation" <= 360))),
    CONSTRAINT "garden_tasks_lifecycle_state_check" CHECK (("lifecycle_state" = ANY (ARRAY['Sowing'::"text", 'Germination'::"text", 'Nursing'::"text", 'IntermediateRepotting'::"text", 'Hardening'::"text", 'Transplanting'::"text", 'Production'::"text", 'Disposal'::"text"]))),
    CONSTRAINT "garden_tasks_location_type_check" CHECK (("location_type" = ANY (ARRAY['Pot'::"text", 'Ground'::"text", 'RaisedBed'::"text", 'HydroponicNFT'::"text", 'HydroponicDWC'::"text", 'HydroponicEbbFlow'::"text", 'HydroponicDrip'::"text", 'HydroponicWick'::"text", 'HydroponicKratky'::"text", 'Aquaponic'::"text", 'Aeroponic'::"text", 'Indoor'::"text"]))),
    CONSTRAINT "garden_tasks_moon_phase_check" CHECK (("moon_phase" = ANY (ARRAY['New'::"text", 'WaxingCrescent'::"text", 'FirstQuarter'::"text", 'WaxingGibbous'::"text", 'Full'::"text", 'WaningGibbous'::"text", 'LastQuarter'::"text", 'WaningCrescent'::"text"]))),
    CONSTRAINT "garden_tasks_orchestrator_source_check" CHECK (("orchestrator_source" = ANY (ARRAY['director'::"text", 'lifecycle'::"text", 'cultivation'::"text", 'seedling'::"text", 'planting'::"text", 'weather'::"text", 'lunar'::"text", 'manual'::"text"]))),
    CONSTRAINT "garden_tasks_planting_method_check" CHECK (("planting_method" = ANY (ARRAY['Seed'::"text", 'Seedling'::"text", 'Sapling'::"text"]))),
    CONSTRAINT "garden_tasks_season_check" CHECK (("season" = ANY (ARRAY['Summer'::"text", 'Winter'::"text"]))),
    CONSTRAINT "garden_tasks_stage_check" CHECK (("stage" = ANY (ARRAY['Germination'::"text", 'Vegetative'::"text", 'ReadyToTransplant'::"text", 'Flowering'::"text", 'Fruiting'::"text", 'Harvested'::"text"]))),
    CONSTRAINT "garden_tasks_task_priority_check" CHECK (("task_priority" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'urgent'::"text", 'critical'::"text"]))),
    CONSTRAINT "garden_tasks_task_type_check" CHECK (("task_type" = ANY (ARRAY['Sowing'::"text", 'Transplant'::"text", 'Watering'::"text", 'Fertilizing'::"text", 'Pruning'::"text", 'Harvesting'::"text", 'Treatment'::"text", 'Maintenance'::"text", 'watering'::"text", 'fertilizing'::"text", 'pruning'::"text", 'harvesting'::"text", 'planting'::"text", 'transplanting'::"text", 'weeding'::"text", 'pest_control'::"text", 'soil_preparation'::"text", 'mulching'::"text", 'support_installation'::"text", 'disease_treatment'::"text", 'seed_starting'::"text", 'thinning'::"text", 'companion_planting'::"text", 'crop_rotation'::"text", 'winter_protection'::"text", 'summer_care'::"text", 'monitoring'::"text", 'maintenance'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."garden_tasks" OWNER TO "postgres";


COMMENT ON COLUMN "public"."garden_tasks"."estimated_duration" IS 'Durata stimata in minuti';



COMMENT ON COLUMN "public"."garden_tasks"."actual_duration" IS 'Durata effettiva in minuti (registrata al completamento)';



COMMENT ON COLUMN "public"."garden_tasks"."weather_dependent" IS 'Task rimandabile in caso di maltempo';



COMMENT ON COLUMN "public"."garden_tasks"."orchestrator_source" IS 'Origine del task: director=generato automaticamente, manual=creato manualmente';



COMMENT ON COLUMN "public"."garden_tasks"."task_priority" IS 'Priorità calcolata dinamicamente dal Director';



COMMENT ON COLUMN "public"."garden_tasks"."scheduled_date" IS 'Data pianificata ottimale (può essere diversa da date se riprogrammato)';



COMMENT ON COLUMN "public"."garden_tasks"."lunar_optimal" IS 'Task ottimale per fase lunare corrente';



COMMENT ON COLUMN "public"."garden_tasks"."blocking_reason" IS 'Motivo blocco temporaneo del task';



COMMENT ON COLUMN "public"."garden_tasks"."parent_plan_id" IS 'Riferimento al piano di coltivazione che ha generato questo task';



COMMENT ON COLUMN "public"."garden_tasks"."recurrence_pattern" IS 'Pattern ricorrenza: {type: "daily"|"weekly"|"monthly", interval: number, end_date?: Date, conditions?: {weather?: [], moon_phase?: []}}';



COMMENT ON COLUMN "public"."garden_tasks"."auto_scheduled" IS 'true se schedulato automaticamente dal Director';



COMMENT ON COLUMN "public"."garden_tasks"."is_critical" IS 'true se task critico/urgente (calcolato dinamicamente)';



COMMENT ON COLUMN "public"."garden_tasks"."metadata" IS 'Metadati aggiuntivi per estensibilità futura';



CREATE TABLE IF NOT EXISTS "public"."garden_tree_memories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "tree_name" "text" NOT NULL,
    "tree_type" "text",
    "archetype_id" "text",
    "planting_date" "date",
    "location_description" "text",
    "coordinates" "jsonb",
    "growth_stages" "jsonb" DEFAULT '{}'::"jsonb",
    "pruning_history" "jsonb" DEFAULT '{}'::"jsonb",
    "harvest_history" "jsonb" DEFAULT '{}'::"jsonb",
    "health_events" "jsonb" DEFAULT '{}'::"jsonb",
    "photos" "text"[],
    "notes" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."garden_tree_memories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."garden_zone_memories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_zone_id" "uuid" NOT NULL,
    "memory_date" "date" NOT NULL,
    "memory_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "crops_involved" "text"[],
    "weather_conditions" "text",
    "photos" "text"[],
    "lessons_learned" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "mood_score" integer,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "garden_zone_memories_memory_type_check" CHECK (("memory_type" = ANY (ARRAY['planting'::"text", 'harvest'::"text", 'treatment'::"text", 'observation'::"text", 'problem'::"text", 'success'::"text", 'experiment'::"text"]))),
    CONSTRAINT "garden_zone_memories_mood_score_check" CHECK ((("mood_score" >= 1) AND ("mood_score" <= 5)))
);


ALTER TABLE "public"."garden_zone_memories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."garden_zones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "size_sq_meters" numeric(10,2) NOT NULL,
    "length_meters" numeric(10,2),
    "width_meters" numeric(10,2),
    "position_x" numeric(5,2),
    "position_y" numeric(5,2),
    "primary_cultivar" "text",
    "crop_type" "text",
    "soil_type" "text",
    "soil_ph" numeric(3,1),
    "sun_exposure" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "zone_kind" "text" DEFAULT 'OpenField'::"text",
    "coordinates" "jsonb",
    "color" "text" DEFAULT '#3b82f6'::"text",
    "order_index" integer DEFAULT 0,
    "position" "jsonb",
    "dimensions" "jsonb",
    "greenhouse_type" "text",
    "covering_type" "text",
    "heating_type" "text",
    "ventilation_type" "text",
    CONSTRAINT "garden_zones_crop_type_check" CHECK (("crop_type" = ANY (ARRAY['Vegetables'::"text", 'Fruits'::"text", 'Herbs'::"text", 'Mixed'::"text"]))),
    CONSTRAINT "garden_zones_soil_type_check" CHECK (("soil_type" = ANY (ARRAY['Clay'::"text", 'Sandy'::"text", 'Loamy'::"text", 'Peaty'::"text", 'Chalky'::"text", 'Silty'::"text"]))),
    CONSTRAINT "garden_zones_sun_exposure_check" CHECK (("sun_exposure" = ANY (ARRAY['FullSun'::"text", 'PartSun'::"text", 'Shade'::"text"]))),
    CONSTRAINT "garden_zones_zone_kind_check" CHECK (("zone_kind" = ANY (ARRAY['OpenField'::"text", 'Greenhouse'::"text", 'Indoor'::"text"]))),
    CONSTRAINT "valid_dimensions" CHECK (((("length_meters" IS NULL) AND ("width_meters" IS NULL)) OR (("length_meters" > (0)::numeric) AND ("width_meters" > (0)::numeric))))
);


ALTER TABLE "public"."garden_zones" OWNER TO "postgres";


COMMENT ON TABLE "public"."garden_zones" IS 'Zone di coltivazione gerarchiche: OpenField, Greenhouse, Indoor. Supporta mapping visivo e tracking micro-zone.';



COMMENT ON COLUMN "public"."garden_zones"."primary_cultivar" IS 'Coltura principale della zona (es. Pomodoro, Lattuga)';



COMMENT ON COLUMN "public"."garden_zones"."crop_type" IS 'Categoria coltura: Vegetables, Fruits, Herbs, Mixed';



COMMENT ON COLUMN "public"."garden_zones"."zone_kind" IS 'Tipo zona: OpenField (pieno campo), Greenhouse (serra), Indoor (coltura protetta interna)';



COMMENT ON COLUMN "public"."garden_zones"."coordinates" IS 'Coordinate poligonali per Visual Planner (array punti in cm relativi)';



COMMENT ON COLUMN "public"."garden_zones"."color" IS 'Colore hex per visualizzazione mappa zone';



COMMENT ON COLUMN "public"."garden_zones"."order_index" IS 'Ordine visualizzazione (per UI drag & drop)';



COMMENT ON COLUMN "public"."garden_zones"."position" IS 'Posizione percentuale {x,y} per layout rapido';



COMMENT ON COLUMN "public"."garden_zones"."greenhouse_type" IS 'Tipologia serra: Arched, Tunnel, ColdFrame, Polytunnel';



COMMENT ON COLUMN "public"."garden_zones"."covering_type" IS 'Copertura serra: Polyethylene, Polycarbonate, Glass, Netting';



COMMENT ON COLUMN "public"."garden_zones"."heating_type" IS 'Riscaldamento: None, Electric, Gas, Geothermal, Biomass';



COMMENT ON COLUMN "public"."garden_zones"."ventilation_type" IS 'Ventilazione: Natural, Forced, Automatic, Fog';



CREATE TABLE IF NOT EXISTS "public"."gardens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "coordinates" "jsonb",
    "size_sq_meters" numeric(10,2) DEFAULT 0 NOT NULL,
    "size_unit" "text" DEFAULT 'sqm'::"text",
    "soil_type" "text",
    "soil_ph" numeric(3,1),
    "primary_crop" "jsonb",
    "altitude_meters" integer,
    "delay_factor_days" integer,
    "sun_exposure" "text",
    "daily_sun_hours" integer,
    "aspect_direction" "text",
    "wind_protection" "text",
    "photo_north_offset" numeric(5,2),
    "has_compost_bin" boolean DEFAULT false,
    "is_raised_bed" boolean DEFAULT false,
    "garden_type" "text",
    "greenhouse_config" "jsonb",
    "indoor_config" "jsonb",
    "hydroponic_config" "jsonb",
    "aquaponic_config" "jsonb",
    "aeroponic_config" "jsonb",
    "structure_config" "jsonb",
    "vacation_mode" "jsonb",
    "has_zones" boolean DEFAULT false,
    "precision_mode_enabled" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "pot_count" integer,
    "pot_diameter" numeric(5,2),
    "bed_count" integer,
    "bed_length" numeric(5,2),
    "bed_width" numeric(5,2),
    "container_count" integer,
    "container_length" numeric(5,2),
    "container_width" numeric(5,2),
    "container_height" numeric(5,2),
    "row_config" "jsonb",
    "seasonal_config" "jsonb",
    "cultivation_category" "text",
    "orchard_config" "jsonb",
    "olive_grove_config" "jsonb",
    "vineyard_config" "jsonb",
    CONSTRAINT "gardens_aspect_direction_check" CHECK (("aspect_direction" = ANY (ARRAY['North'::"text", 'South'::"text", 'East'::"text", 'West'::"text", 'Flat'::"text"]))),
    CONSTRAINT "gardens_cultivation_category_check" CHECK (("cultivation_category" = ANY (ARRAY['orto'::"text", 'frutteto'::"text", 'oliveto'::"text", 'vigneto'::"text", 'misto'::"text"]))),
    CONSTRAINT "gardens_daily_sun_hours_check" CHECK ((("daily_sun_hours" >= 0) AND ("daily_sun_hours" <= 24))),
    CONSTRAINT "gardens_garden_type_check" CHECK (("garden_type" = ANY (ARRAY['OpenField'::"text", 'Greenhouse'::"text", 'Tunnel'::"text", 'RaisedBed'::"text", 'Indoor'::"text", 'Hydroponic'::"text", 'Aquaponic'::"text", 'Aeroponic'::"text", 'NFT'::"text", 'DWC'::"text", 'EbbFlow'::"text", 'Drip'::"text", 'Wick'::"text", 'Kratky'::"text", 'Orchard'::"text", 'OliveGrove'::"text", 'Vineyard'::"text"]))),
    CONSTRAINT "gardens_photo_north_offset_check" CHECK ((("photo_north_offset" >= (0)::numeric) AND ("photo_north_offset" <= (360)::numeric))),
    CONSTRAINT "gardens_size_unit_check" CHECK (("size_unit" = ANY (ARRAY['sqm'::"text", 'are'::"text", 'hectare'::"text"]))),
    CONSTRAINT "gardens_soil_ph_check" CHECK ((("soil_ph" >= (0)::numeric) AND ("soil_ph" <= (14)::numeric))),
    CONSTRAINT "gardens_soil_type_check" CHECK (("soil_type" = ANY (ARRAY['Clay'::"text", 'Sandy'::"text", 'Loamy'::"text", 'Peaty'::"text", 'Chalky'::"text", 'Silty'::"text"]))),
    CONSTRAINT "gardens_sun_exposure_check" CHECK (("sun_exposure" = ANY (ARRAY['FullSun'::"text", 'PartSun'::"text", 'Shade'::"text"]))),
    CONSTRAINT "gardens_wind_protection_check" CHECK (("wind_protection" = ANY (ARRAY['High'::"text", 'Medium'::"text", 'Low'::"text"])))
);


ALTER TABLE "public"."gardens" OWNER TO "postgres";


COMMENT ON TABLE "public"."gardens" IS 'Gardens table with all PRO features - updated for cloud compatibility';



COMMENT ON COLUMN "public"."gardens"."hydroponic_config" IS 'Configurazione sistema idroponico: { systemType, nftChannelCount, dwcBucketCount, ... }';



COMMENT ON COLUMN "public"."gardens"."aquaponic_config" IS 'Configurazione sistema acquaponico: { systemType, fishTankVolume, bedCount, ... }';



COMMENT ON COLUMN "public"."gardens"."aeroponic_config" IS 'Configurazione sistema aeroponico: { systemType, chamberCount, nozzleCount, ... }';



COMMENT ON COLUMN "public"."gardens"."pot_count" IS 'Numero totale di vasi nell''orto';



COMMENT ON COLUMN "public"."gardens"."pot_diameter" IS 'Diametro medio dei vasi in cm';



COMMENT ON COLUMN "public"."gardens"."bed_count" IS 'Numero di letti rialzati';



COMMENT ON COLUMN "public"."gardens"."bed_length" IS 'Lunghezza media dei letti in metri';



COMMENT ON COLUMN "public"."gardens"."bed_width" IS 'Larghezza media dei letti in metri';



COMMENT ON COLUMN "public"."gardens"."container_count" IS 'Numero di cassoni/vasche';



COMMENT ON COLUMN "public"."gardens"."container_length" IS 'Lunghezza media cassoni in metri';



COMMENT ON COLUMN "public"."gardens"."container_width" IS 'Larghezza media cassoni in metri';



COMMENT ON COLUMN "public"."gardens"."container_height" IS 'Altezza media cassoni in metri';



COMMENT ON COLUMN "public"."gardens"."row_config" IS 'Configurazione filari: { numberOfRows, lengthMeters, widthMeters, defaultRowSpacingCm }';



COMMENT ON COLUMN "public"."gardens"."seasonal_config" IS 'Configurazione stagionale serra: { isSeasonal, activeMonths: [1,2,3,...] }';



COMMENT ON COLUMN "public"."gardens"."cultivation_category" IS 'Categoria coltivazione: orto, frutteto, oliveto, vigneto, misto';



COMMENT ON COLUMN "public"."gardens"."orchard_config" IS 'Configurazione frutteto: categoria, data impianto, numero alberi, varietà';



COMMENT ON COLUMN "public"."gardens"."olive_grove_config" IS 'Configurazione oliveto: tipo (olio/mensa/dual), data impianto, numero alberi, varietà';



COMMENT ON COLUMN "public"."gardens"."vineyard_config" IS 'Configurazione vigneto: tipo (vino/tavola), sistema allevamento, data impianto, numero viti, varietà';



CREATE TABLE IF NOT EXISTS "public"."globalgap_compliance_checklist" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "control_point" character varying(20) NOT NULL,
    "control_point_description" "text" NOT NULL,
    "compliance_criteria" "text" NOT NULL,
    "compliance_status" character varying(20) DEFAULT 'pending'::character varying,
    "evidence_type" character varying(50),
    "evidence_description" "text",
    "evidence_file_url" "text",
    "last_assessment_date" timestamp with time zone,
    "next_assessment_due" timestamp with time zone,
    "responsible_person" character varying(255),
    "corrective_actions" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "globalgap_compliance_checklist_compliance_status_check" CHECK ((("compliance_status")::"text" = ANY ((ARRAY['compliant'::character varying, 'non_compliant'::character varying, 'not_applicable'::character varying, 'pending'::character varying])::"text"[])))
);


ALTER TABLE "public"."globalgap_compliance_checklist" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."globalgap_ggn_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "ggn_code" character varying(13) NOT NULL,
    "producer_name" character varying(255) NOT NULL,
    "producer_address" "text",
    "product_scope" "text" NOT NULL,
    "certification_body" character varying(255),
    "certificate_number" character varying(100),
    "issue_date" timestamp with time zone NOT NULL,
    "expiry_date" timestamp with time zone NOT NULL,
    "is_active" boolean DEFAULT true,
    "suspension_reason" "text",
    "suspension_date" timestamp with time zone,
    "reinstatement_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."globalgap_ggn_codes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."globalgap_health_safety_managers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "manager_name" character varying(255) NOT NULL,
    "employee_id" character varying(50),
    "qualification_level" character varying(100) NOT NULL,
    "certification_body" character varying(255),
    "certificate_number" character varying(100),
    "certificate_expiry_date" timestamp with time zone,
    "appointment_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "responsibilities" "text" NOT NULL,
    "training_records" "jsonb",
    "contact_details" "jsonb" NOT NULL,
    "emergency_contact_details" "jsonb",
    "is_active" boolean DEFAULT true,
    "termination_date" timestamp with time zone,
    "termination_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."globalgap_health_safety_managers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."globalgap_recall_procedures" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "procedure_name" character varying(255) NOT NULL,
    "procedure_version" character varying(20) DEFAULT '1.0'::character varying,
    "responsible_person" character varying(255) NOT NULL,
    "contact_details" "text" NOT NULL,
    "trigger_criteria" "text" NOT NULL,
    "notification_process" "text" NOT NULL,
    "traceability_requirements" "text" NOT NULL,
    "recall_team_members" "jsonb",
    "communication_plan" "text",
    "documentation_requirements" "text",
    "testing_frequency" character varying(50) DEFAULT 'annual'::character varying,
    "last_test_date" timestamp with time zone,
    "next_test_date" timestamp with time zone,
    "test_results" "text",
    "effectiveness_rating" integer,
    "last_updated" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "globalgap_recall_procedures_effectiveness_rating_check" CHECK ((("effectiveness_rating" >= 1) AND ("effectiveness_rating" <= 5)))
);


ALTER TABLE "public"."globalgap_recall_procedures" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."globalgap_risk_management_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "risk_category" character varying(100) NOT NULL,
    "risk_description" "text" NOT NULL,
    "risk_level" character varying(20) DEFAULT 'medium'::character varying,
    "probability_score" integer,
    "impact_score" integer,
    "risk_score" integer GENERATED ALWAYS AS (("probability_score" * "impact_score")) STORED,
    "mitigation_measures" "text" NOT NULL,
    "responsible_person" character varying(255),
    "implementation_date" timestamp with time zone,
    "review_frequency" character varying(50) DEFAULT 'quarterly'::character varying,
    "last_review_date" timestamp with time zone,
    "next_review_date" timestamp with time zone,
    "status" character varying(50) DEFAULT 'active'::character varying,
    "monitoring_indicators" "text",
    "contingency_plan" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "globalgap_risk_management_plans_impact_score_check" CHECK ((("impact_score" >= 1) AND ("impact_score" <= 5))),
    CONSTRAINT "globalgap_risk_management_plans_probability_score_check" CHECK ((("probability_score" >= 1) AND ("probability_score" <= 5))),
    CONSTRAINT "globalgap_risk_management_plans_risk_level_check" CHECK ((("risk_level")::"text" = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::"text"[]))),
    CONSTRAINT "globalgap_risk_management_plans_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['active'::character varying, 'mitigated'::character varying, 'accepted'::character varying, 'transferred'::character varying])::"text"[])))
);


ALTER TABLE "public"."globalgap_risk_management_plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."globalgap_self_assessments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "assessment_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "assessor_name" character varying(255) NOT NULL,
    "assessor_qualification" character varying(255),
    "assessment_type" character varying(50) DEFAULT 'internal'::character varying,
    "overall_compliance_score" numeric(5,2),
    "total_control_points" integer DEFAULT 0,
    "compliant_points" integer DEFAULT 0,
    "non_compliant_points" integer DEFAULT 0,
    "not_applicable_points" integer DEFAULT 0,
    "major_non_conformities" integer DEFAULT 0,
    "minor_non_conformities" integer DEFAULT 0,
    "recommendations" "text",
    "corrective_action_plan" "text",
    "next_assessment_date" timestamp with time zone,
    "certification_status" character varying(50) DEFAULT 'in_progress'::character varying,
    "certificate_number" character varying(100),
    "certificate_expiry_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "globalgap_self_assessments_assessment_type_check" CHECK ((("assessment_type")::"text" = ANY ((ARRAY['internal'::character varying, 'external'::character varying, 'pre_audit'::character varying])::"text"[]))),
    CONSTRAINT "globalgap_self_assessments_certification_status_check" CHECK ((("certification_status")::"text" = ANY ((ARRAY['in_progress'::character varying, 'compliant'::character varying, 'non_compliant'::character varying, 'suspended'::character varying])::"text"[]))),
    CONSTRAINT "globalgap_self_assessments_overall_compliance_score_check" CHECK ((("overall_compliance_score" >= (0)::numeric) AND ("overall_compliance_score" <= (100)::numeric)))
);


ALTER TABLE "public"."globalgap_self_assessments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."haccp_critical_control_points" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "hazard_analysis_id" "uuid",
    "step" "text" NOT NULL,
    "hazard" "text" NOT NULL,
    "critical_limit" "text" NOT NULL,
    "monitoring_procedure" "text" NOT NULL,
    "frequency" "text" NOT NULL,
    "responsibility" "text" NOT NULL,
    "corrective_action" "text" NOT NULL,
    "verification" "text" NOT NULL,
    "records" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."haccp_critical_control_points" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."haccp_hazard_analysis" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "process_step" "text" NOT NULL,
    "hazard_type" "text" NOT NULL,
    "hazard_description" "text" NOT NULL,
    "severity" "text" NOT NULL,
    "likelihood" "text" NOT NULL,
    "risk_level" "text" NOT NULL,
    "preventive_measures" "text"[] DEFAULT '{}'::"text"[],
    "is_ccp" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "haccp_hazard_analysis_hazard_type_check" CHECK (("hazard_type" = ANY (ARRAY['BIOLOGICAL'::"text", 'CHEMICAL'::"text", 'PHYSICAL'::"text"]))),
    CONSTRAINT "haccp_hazard_analysis_likelihood_check" CHECK (("likelihood" = ANY (ARRAY['LOW'::"text", 'MEDIUM'::"text", 'HIGH'::"text"]))),
    CONSTRAINT "haccp_hazard_analysis_risk_level_check" CHECK (("risk_level" = ANY (ARRAY['LOW'::"text", 'MEDIUM'::"text", 'HIGH'::"text", 'CRITICAL'::"text"]))),
    CONSTRAINT "haccp_hazard_analysis_severity_check" CHECK (("severity" = ANY (ARRAY['LOW'::"text", 'MEDIUM'::"text", 'HIGH'::"text"])))
);


ALTER TABLE "public"."haccp_hazard_analysis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."haccp_systems" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "team_leader" "text" NOT NULL,
    "status" "text" DEFAULT 'IN_PROGRESS'::"text" NOT NULL,
    "last_review" timestamp with time zone DEFAULT "now"(),
    "next_review" timestamp with time zone DEFAULT ("now"() + '1 year'::interval),
    "record_retention_period" "text" DEFAULT '3 anni'::"text",
    "storage_location" "text" DEFAULT 'Ufficio amministrativo'::"text",
    "access_control" "text" DEFAULT 'Solo personale autorizzato'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "haccp_systems_status_check" CHECK (("status" = ANY (ARRAY['NOT_STARTED'::"text", 'IN_PROGRESS'::"text", 'COMPLIANT'::"text", 'NON_COMPLIANT'::"text", 'EXPIRED'::"text", 'SUSPENDED'::"text"])))
);


ALTER TABLE "public"."haccp_systems" OWNER TO "postgres";


COMMENT ON TABLE "public"."haccp_systems" IS 'HACCP system implementation and management';



CREATE TABLE IF NOT EXISTS "public"."haccp_team_members" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "role" "text" NOT NULL,
    "qualifications" "text"[] DEFAULT '{}'::"text"[],
    "responsibilities" "text"[] DEFAULT '{}'::"text"[],
    "contact_info" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."haccp_team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."harvest_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "garden_id" "uuid",
    "task_id" "uuid",
    "plant_name" "text" NOT NULL,
    "quantity" numeric(8,2) NOT NULL,
    "unit" "text" DEFAULT 'kg'::"text" NOT NULL,
    "rating" integer,
    "harvest_date" "date" NOT NULL,
    "photo" "text",
    "brix" numeric(4,2),
    "notes" "text",
    "suggested_recipes" "jsonb",
    "strawberry_harvest" "jsonb",
    "fruit_tree_harvest" "jsonb",
    "aromatic_harvest" "jsonb",
    "olive_harvest" "jsonb",
    "vine_harvest" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "harvest_logs_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5))),
    CONSTRAINT "harvest_logs_unit_check" CHECK (("unit" = ANY (ARRAY['kg'::"text", 'g'::"text", 'units'::"text"])))
);


ALTER TABLE "public"."harvest_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."harvest_logs" IS 'Log raccolti (storico). garden_id è opzionale (SET NULL) per preservare lo storico anche dopo eliminazione garden';



CREATE TABLE IF NOT EXISTS "public"."hydroponic_readings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "reading_date" timestamp with time zone DEFAULT "now"(),
    "ph" numeric(3,2),
    "ec" numeric(5,2),
    "water_temperature" numeric(4,1),
    "reservoir_volume" numeric(6,2),
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "hydroponic_readings_ph_check" CHECK ((("ph" >= (0)::numeric) AND ("ph" <= (14)::numeric)))
);


ALTER TABLE "public"."hydroponic_readings" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."individual_plants" AS
 SELECT "id",
    "garden_id",
    "row_id",
    "field_row_id",
    "position_in_row",
    "plant_code",
    "plant_name",
    "variety",
    "planting_date",
    "expected_harvest_date",
    "status",
    "health_score",
    "seedling_batch_id",
    "sapling_batch_id",
    "seed_packet_id",
    "coordinates",
    "photos",
    "notes",
    "created_at",
    "updated_at"
   FROM "public"."garden_plants";


ALTER VIEW "public"."individual_plants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."irrigation_components" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "zone_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "length_meters" numeric(10,2),
    "flow_rate_per_meter_lph" numeric(10,2),
    "dripper_spacing" numeric(10,2),
    "dripper_flow_rate_lph" numeric(10,2),
    "quantity" integer,
    "flow_rate_lph" numeric(10,2),
    "brand" "text",
    "model" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "irrigation_components_type_check" CHECK (("type" = ANY (ARRAY['Dripline'::"text", 'Dripper'::"text", 'MicroSprinkler'::"text", 'MainLine'::"text", 'SecondaryLine'::"text", 'Filter'::"text", 'Reducer'::"text"])))
);


ALTER TABLE "public"."irrigation_components" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."irrigation_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_id" "uuid",
    "system_id" "uuid",
    "irrigation_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "duration_minutes" integer NOT NULL,
    "water_amount_liters" numeric(10,2),
    "zones_irrigated" "text"[],
    "weather_conditions" "jsonb",
    "soil_moisture_before" numeric(5,2),
    "soil_moisture_after" numeric(5,2),
    "irrigation_type" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "irrigation_logs_irrigation_type_check" CHECK (("irrigation_type" = ANY (ARRAY['Manual'::"text", 'Automatic'::"text", 'Scheduled'::"text"])))
);


ALTER TABLE "public"."irrigation_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."irrigation_systems" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" DEFAULT 'Drip'::"text",
    "water_source" "text",
    "pressure_bar" numeric(4,2),
    "has_timer" boolean DEFAULT false,
    "has_valve" boolean DEFAULT false,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'active'::"text",
    "bed_ids" "uuid"[] DEFAULT '{}'::"uuid"[],
    "row_ids" "uuid"[] DEFAULT '{}'::"uuid"[],
    "cultivation_type" "text",
    CONSTRAINT "irrigation_systems_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'maintenance'::"text", 'broken'::"text"]))),
    CONSTRAINT "irrigation_systems_type_check" CHECK (("type" = ANY (ARRAY['Manual'::"text", 'Drip'::"text", 'Sprinkler'::"text", 'Micro'::"text", 'Soaker'::"text"]))),
    CONSTRAINT "irrigation_systems_water_source_check" CHECK (("water_source" = ANY (ARRAY['Municipal'::"text", 'Well'::"text", 'Rainwater'::"text", 'River'::"text", 'Pond'::"text"])))
);


ALTER TABLE "public"."irrigation_systems" OWNER TO "postgres";


COMMENT ON COLUMN "public"."irrigation_systems"."bed_ids" IS 'Array di ID delle aiuole collegate a questo sistema di irrigazione';



COMMENT ON COLUMN "public"."irrigation_systems"."row_ids" IS 'Array di ID dei filari collegati a questo sistema di irrigazione';



COMMENT ON COLUMN "public"."irrigation_systems"."cultivation_type" IS 'Tipo di coltivazione: orto, frutteto, uliveto, vigneto, serra, giardino';



CREATE TABLE IF NOT EXISTS "public"."irrigation_zones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "system_id" "uuid" NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "area_sqm" numeric(8,2) NOT NULL,
    "method" "text" NOT NULL,
    "flow_rate_lph" numeric(10,2) NOT NULL,
    "dripper_spacing_cm" integer,
    "dripper_flow_rate_lph" numeric(4,2),
    "dripline_spacing_cm" integer,
    "num_drippers" integer,
    "plant_types" "jsonb",
    "is_automated" boolean DEFAULT false,
    "valve_id" "uuid",
    "schedule" "jsonb",
    "last_watered_at" timestamp with time zone,
    "bed_ids" "uuid"[] DEFAULT '{}'::"uuid"[],
    "plant_task_ids" "uuid"[] DEFAULT '{}'::"uuid"[],
    "notes" "text",
    "calculated_from_components" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "irrigation_zones_method_check" CHECK (("method" = ANY (ARRAY['Manual'::"text", 'Hose'::"text", 'Dripline'::"text", 'Drippers'::"text", 'MicroSprinkler'::"text", 'Sprinkler'::"text", 'Mixed'::"text"])))
);


ALTER TABLE "public"."irrigation_zones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mechanical_work_register" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_id" "uuid",
    "work_type" "text" NOT NULL,
    "work_date" "date" NOT NULL,
    "area_m2" numeric(10,2) NOT NULL,
    "depth_cm" numeric(5,2),
    "equipment_type" "text",
    "equipment_attachment" "text",
    "work_metadata" "jsonb",
    "weather_conditions" "jsonb",
    "operator_name" "text",
    "notes" "text",
    "zone_id" "uuid",
    "row_ids" "uuid"[],
    "bed_ids" "uuid"[],
    "area_covered_sqm" numeric(10,2),
    "duration_minutes" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "field_row_id" "uuid",
    "bed_id" "uuid",
    "bed_row_id" "uuid",
    "plant_ids" "uuid"[],
    "plants_affected" integer,
    CONSTRAINT "check_mechanical_work_row_reference" CHECK (((("bed_row_id" IS NULL) AND ("field_row_id" IS NULL)) OR (("bed_row_id" IS NOT NULL) AND ("field_row_id" IS NULL)) OR (("bed_row_id" IS NULL) AND ("field_row_id" IS NOT NULL)))),
    CONSTRAINT "mechanical_work_register_equipment_type_check" CHECK (("equipment_type" = ANY (ARRAY['Tractor'::"text", 'RotaryHarrow'::"text", 'Shredder'::"text", 'FertilizerSpreader'::"text", 'Seeder'::"text", 'Topper'::"text", 'Defoliator'::"text", 'PrePruner'::"text", 'Thinner'::"text", 'Rototiller'::"text", 'Cultivator'::"text", 'Mower'::"text", 'BrushCutter'::"text", 'TrackedCart'::"text", 'BackpackSprayer'::"text", 'ElectricTier'::"text", 'ElectricPruner'::"text", 'TelescopicPruner'::"text", 'Manual'::"text"]))),
    CONSTRAINT "mechanical_work_register_work_type_check" CHECK (("work_type" = ANY (ARRAY['Plowing'::"text", 'Subsoiling'::"text", 'Harrowing'::"text", 'Tilling'::"text", 'Rolling'::"text", 'Hoeing'::"text", 'EarthingUp'::"text", 'Mulching'::"text", 'PostSowingRolling'::"text", 'Clearing'::"text", 'Stumping'::"text", 'StoneRemoval'::"text", 'Leveling'::"text", 'DeepSubsoiling'::"text", 'Digging'::"text", 'DeepHarrowing'::"text", 'Crumbling'::"text", 'Scraping'::"text", 'SurfaceLeveling'::"text", 'MinimumTillage'::"text", 'StripTillage'::"text", 'NoTill'::"text", 'FormativePruning'::"text", 'MaintenancePruning'::"text", 'RejuvenationPruning'::"text", 'SummerPruning'::"text", 'WinterPruning'::"text", 'Thinning'::"text", 'Suckering'::"text", 'Defoliation'::"text", 'Tying'::"text", 'OliveShredding'::"text", 'RunnerManagement'::"text", 'StrawberryMulching'::"text", 'StrawberryCleaning'::"text", 'CaneRemoval'::"text", 'TipPruning'::"text", 'RaspberryTying'::"text", 'SuckerThinning'::"text", 'FruitBagging'::"text", 'ExoticThinning'::"text", 'Shredding'::"text", 'Topping'::"text", 'Pruning'::"text"])))
);


ALTER TABLE "public"."mechanical_work_register" OWNER TO "postgres";


COMMENT ON COLUMN "public"."mechanical_work_register"."field_row_id" IS 'Riferimento al filare specifico per lavorazioni mirate';



COMMENT ON COLUMN "public"."mechanical_work_register"."plant_ids" IS 'Array di IDs delle piante specifiche su cui è stata fatta l operazione';



COMMENT ON COLUMN "public"."mechanical_work_register"."plants_affected" IS 'Numero totale di piante coinvolte nell operazione';



CREATE TABLE IF NOT EXISTS "public"."mechanical_work_sequences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "sequence_name" "text" NOT NULL,
    "crop_name" "text",
    "archetype_id" "text",
    "season" "text",
    "sequence_steps" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "total_estimated_time_minutes" integer,
    "difficulty_level" "text" DEFAULT 'medium'::"text",
    "tools_required" "text"[],
    "prerequisites" "text"[],
    "success_criteria" "text"[],
    "common_mistakes" "text"[],
    "is_template" boolean DEFAULT false,
    "is_public" boolean DEFAULT false,
    "usage_count" integer DEFAULT 0,
    "success_rate" numeric(3,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "mechanical_work_sequences_difficulty_level_check" CHECK (("difficulty_level" = ANY (ARRAY['easy'::"text", 'medium'::"text", 'hard'::"text", 'expert'::"text"]))),
    CONSTRAINT "mechanical_work_sequences_season_check" CHECK (("season" = ANY (ARRAY['spring'::"text", 'summer'::"text", 'autumn'::"text", 'winter'::"text", 'all'::"text"])))
);


ALTER TABLE "public"."mechanical_work_sequences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."operation_sync_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_type" "text" NOT NULL,
    "source_operation_id" "uuid" NOT NULL,
    "plants_affected" integer DEFAULT 0 NOT NULL,
    "operations_created" integer DEFAULT 0 NOT NULL,
    "sync_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "sync_status" "text" DEFAULT 'completed'::"text" NOT NULL,
    "error_message" "text",
    "garden_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."operation_sync_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organic_certifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "certifying_body" "text" NOT NULL,
    "certificate_number" "text" NOT NULL,
    "valid_from" timestamp with time zone NOT NULL,
    "valid_until" timestamp with time zone NOT NULL,
    "scope" "text"[] DEFAULT '{CROP_PRODUCTION}'::"text"[],
    "conversion_status" "text" DEFAULT 'CONVENTIONAL'::"text" NOT NULL,
    "conversion_start_date" timestamp with time zone,
    "conversion_end_date" timestamp with time zone,
    "status" "text" DEFAULT 'IN_PROGRESS'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "organic_certifications_certifying_body_check" CHECK (("certifying_body" = ANY (ARRAY['ICEA'::"text", 'CCPB'::"text", 'BIOAGRICERT'::"text", 'SUOLO_E_SALUTE'::"text", 'OTHER'::"text"]))),
    CONSTRAINT "organic_certifications_conversion_status_check" CHECK (("conversion_status" = ANY (ARRAY['CONVENTIONAL'::"text", 'IN_CONVERSION_1'::"text", 'IN_CONVERSION_2'::"text", 'IN_CONVERSION_3'::"text", 'ORGANIC'::"text"]))),
    CONSTRAINT "organic_certifications_status_check" CHECK (("status" = ANY (ARRAY['NOT_STARTED'::"text", 'IN_PROGRESS'::"text", 'COMPLIANT'::"text", 'NON_COMPLIANT'::"text", 'EXPIRED'::"text", 'SUSPENDED'::"text"])))
);


ALTER TABLE "public"."organic_certifications" OWNER TO "postgres";


COMMENT ON TABLE "public"."organic_certifications" IS 'Organic certification management and compliance';



CREATE TABLE IF NOT EXISTS "public"."organic_inputs_register" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "date" timestamp with time zone NOT NULL,
    "type" "text" NOT NULL,
    "product" "text" NOT NULL,
    "supplier" "text" NOT NULL,
    "certificate" "text",
    "quantity" "text" NOT NULL,
    "cost" numeric(10,2),
    "field" "text",
    "purpose" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "organic_inputs_register_type_check" CHECK (("type" = ANY (ARRAY['SEED'::"text", 'FERTILIZER'::"text", 'PESTICIDE'::"text", 'EQUIPMENT'::"text", 'SERVICE'::"text"])))
);


ALTER TABLE "public"."organic_inputs_register" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organic_sales_register" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "date" timestamp with time zone NOT NULL,
    "product" "text" NOT NULL,
    "quantity" "text" NOT NULL,
    "unit" "text" NOT NULL,
    "buyer" "text" NOT NULL,
    "certificate" "text",
    "price" numeric(10,2),
    "field" "text",
    "harvest_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."organic_sales_register" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."phase_transitions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cultivation_plan_id" "uuid" NOT NULL,
    "from_phase" "text",
    "to_phase" "text" NOT NULL,
    "transition_date" timestamp with time zone DEFAULT "now"(),
    "location" "text" NOT NULL,
    "quantity_before" integer,
    "quantity_after" integer,
    "phase_data" "jsonb" DEFAULT '{}'::"jsonb",
    "notes" "text",
    "photos" "jsonb" DEFAULT '[]'::"jsonb",
    "weather_conditions" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."phase_transitions" OWNER TO "postgres";


COMMENT ON TABLE "public"."phase_transitions" IS 'Log dettagliato delle transizioni tra fasi di coltivazione';



CREATE TABLE IF NOT EXISTS "public"."photo_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "task_id" "uuid" NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "photo_url" "text" NOT NULL,
    "photo_date" "date" NOT NULL,
    "days_from_planting" integer NOT NULL,
    "analysis_result" "jsonb",
    "notes" "text",
    "vegetation_indices_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."photo_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."phyto_inventory" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_id" "uuid",
    "product_name" "text" NOT NULL,
    "active_ingredient" "text",
    "product_type" "text",
    "quantity" numeric(8,2) NOT NULL,
    "quantity_unit" "text" NOT NULL,
    "purchase_date" "date",
    "expiry_date" "date",
    "manufacturer" "text",
    "registration_number" "text",
    "storage_location" "text",
    "min_stock_alert" numeric(8,2),
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "phyto_inventory_product_type_check" CHECK (("product_type" = ANY (ARRAY['insecticide'::"text", 'fungicide'::"text", 'herbicide'::"text", 'acaricide'::"text", 'bactericide'::"text", 'other'::"text"]))),
    CONSTRAINT "phyto_inventory_quantity_unit_check" CHECK (("quantity_unit" = ANY (ARRAY['ml'::"text", 'L'::"text", 'g'::"text", 'kg'::"text"])))
);


ALTER TABLE "public"."phyto_inventory" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."plant_families" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "common_names" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."plant_families" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."plant_harvests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "plant_id" "uuid" NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "harvest_date" "date" NOT NULL,
    "harvest_time" time without time zone,
    "quantity_kg" numeric(8,3) NOT NULL,
    "quality_grade" "text",
    "size_category" "text",
    "ripeness_level" "text",
    "destination" "text",
    "market_value" numeric(8,2),
    "weather_conditions" "jsonb",
    "storage_method" "text",
    "photos" "text"[],
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "positive_quantity" CHECK (("quantity_kg" > (0)::numeric)),
    CONSTRAINT "valid_quality" CHECK ((("quality_grade" IS NULL) OR ("quality_grade" = ANY (ARRAY['excellent'::"text", 'good'::"text", 'fair'::"text", 'poor'::"text"])))),
    CONSTRAINT "valid_ripeness" CHECK ((("ripeness_level" IS NULL) OR ("ripeness_level" = ANY (ARRAY['unripe'::"text", 'perfect'::"text", 'overripe'::"text"])))),
    CONSTRAINT "valid_size" CHECK ((("size_category" IS NULL) OR ("size_category" = ANY (ARRAY['large'::"text", 'medium'::"text", 'small'::"text"]))))
);


ALTER TABLE "public"."plant_harvests" OWNER TO "postgres";


COMMENT ON TABLE "public"."plant_harvests" IS 'Registro di tutti i raccolti da ogni singola pianta con quantità e qualità';



CREATE TABLE IF NOT EXISTS "public"."plant_operations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "plant_id" "uuid" NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "operation_type" "text" NOT NULL,
    "operation_category" "text",
    "operation_date" "date" NOT NULL,
    "operation_time" time without time zone,
    "quantity" numeric(10,3),
    "unit" "text",
    "product_name" "text",
    "concentration" numeric(5,2),
    "effectiveness_score" integer,
    "plant_response" "text",
    "weather_conditions" "jsonb",
    "photos" "text"[],
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_effectiveness" CHECK ((("effectiveness_score" IS NULL) OR (("effectiveness_score" >= 1) AND ("effectiveness_score" <= 10)))),
    CONSTRAINT "valid_operation_type" CHECK (("operation_type" = ANY (ARRAY['watering'::"text", 'fertilizing'::"text", 'treatment'::"text", 'pruning'::"text", 'harvest'::"text", 'transplanting'::"text", 'thinning'::"text", 'staking'::"text", 'mulching'::"text"]))),
    CONSTRAINT "valid_response" CHECK ((("plant_response" IS NULL) OR ("plant_response" = ANY (ARRAY['positive'::"text", 'negative'::"text", 'neutral'::"text"]))))
);


ALTER TABLE "public"."plant_operations" OWNER TO "postgres";


COMMENT ON TABLE "public"."plant_operations" IS 'Registro di tutte le operazioni eseguite su ogni singola pianta (irrigazione, fertilizzazione, trattamenti)';



CREATE OR REPLACE VIEW "public"."plant_operations_complete" AS
 SELECT "gp"."id" AS "plant_id",
    "gp"."plant_code",
    "gp"."plant_name",
    "gp"."variety",
    "gp"."position_in_row",
    COALESCE("concat"('Row ', "gr"."row_number", ' - ', "gr"."crop_name"), "fr"."name") AS "row_name",
    "po"."operation_type",
    "po"."operation_date",
    "po"."quantity",
    "po"."unit",
    "po"."product_name",
    "po"."effectiveness_score",
    "po"."plant_response",
    "po"."notes",
    "po"."created_at"
   FROM ((("public"."garden_plants" "gp"
     LEFT JOIN "public"."garden_rows" "gr" ON (("gp"."row_id" = "gr"."id")))
     LEFT JOIN "public"."field_rows" "fr" ON (("gp"."field_row_id" = "fr"."id")))
     LEFT JOIN "public"."plant_operations" "po" ON (("gp"."id" = "po"."plant_id")))
  ORDER BY "gp"."plant_code", "po"."operation_date" DESC;


ALTER VIEW "public"."plant_operations_complete" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."plant_production_summary" AS
 SELECT "gp"."id" AS "plant_id",
    "gp"."plant_code",
    "gp"."plant_name",
    "gp"."variety",
    "gp"."planting_date",
    "count"("ph"."id") AS "total_harvests",
    COALESCE("sum"("ph"."quantity_kg"), (0)::numeric) AS "total_production_kg",
    COALESCE("avg"("ph"."quantity_kg"), (0)::numeric) AS "avg_harvest_kg",
    COALESCE("sum"("ph"."market_value"), (0)::numeric) AS "total_value",
    "min"("ph"."harvest_date") AS "first_harvest_date",
    "max"("ph"."harvest_date") AS "last_harvest_date"
   FROM ("public"."garden_plants" "gp"
     LEFT JOIN "public"."plant_harvests" "ph" ON (("gp"."id" = "ph"."plant_id")))
  GROUP BY "gp"."id", "gp"."plant_code", "gp"."plant_name", "gp"."variety", "gp"."planting_date";


ALTER VIEW "public"."plant_production_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."plant_rules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "family_id" "text",
    "archetype_id" "text",
    "rule_type" "text" NOT NULL,
    "rule_data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "plant_rules_rule_type_check" CHECK (("rule_type" = ANY (ARRAY['rotation'::"text", 'companion'::"text", 'disease_risk'::"text", 'npk_profile'::"text", 'water_needs'::"text"])))
);


ALTER TABLE "public"."plant_rules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."plant_synonyms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "synonym" "text" NOT NULL,
    "normalized_synonym" "text" NOT NULL,
    "plant_id" "text" NOT NULL,
    "locale" "text" DEFAULT 'it'::"text" NOT NULL,
    "confidence" numeric(3,2) DEFAULT 1.0,
    "source" "text" NOT NULL,
    "created_by" "uuid",
    "usage_count" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "plant_synonyms_confidence_check" CHECK ((("confidence" >= 0.0) AND ("confidence" <= 1.0))),
    CONSTRAINT "plant_synonyms_source_check" CHECK (("source" = ANY (ARRAY['user'::"text", 'admin'::"text", 'system'::"text"])))
);


ALTER TABLE "public"."plant_synonyms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."plant_taxonomy" (
    "plant_id" "text" NOT NULL,
    "names" "jsonb" NOT NULL,
    "family_id" "text" NOT NULL,
    "archetype_id" "text" NOT NULL,
    "functional_category" "text" NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "plant_taxonomy_functional_category_check" CHECK (("functional_category" = ANY (ARRAY['LEAF'::"text", 'FRUIT'::"text", 'ROOT'::"text", 'AROMATIC'::"text", 'LEGUME'::"text", 'SPECIALIZED'::"text"])))
);


ALTER TABLE "public"."plant_taxonomy" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."planting_batches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "field_row_id" "uuid" NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "batch_number" integer NOT NULL,
    "plant_name" "text" NOT NULL,
    "variety" "text",
    "plants_count" integer NOT NULL,
    "seeds_used" integer,
    "sowing_date" "date",
    "transplanting_date" "date",
    "expected_harvest_date" "date",
    "seed_packet_id" "uuid",
    "seedling_batch_id" "uuid",
    "status" "text" DEFAULT 'Planned'::"text" NOT NULL,
    "current_quantity" integer NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "planting_batches_status_check" CHECK (("status" = ANY (ARRAY['Planned'::"text", 'Sown'::"text", 'Transplanted'::"text", 'Growing'::"text", 'Harvesting'::"text", 'Completed'::"text"]))),
    CONSTRAINT "positive_plants" CHECK (("plants_count" > 0)),
    CONSTRAINT "valid_current_quantity" CHECK ((("current_quantity" >= 0) AND ("current_quantity" <= "plants_count")))
);


ALTER TABLE "public"."planting_batches" OWNER TO "postgres";


COMMENT ON TABLE "public"."planting_batches" IS 'Batch di semina/trapianto scalare per produzioni diluite nel tempo';



COMMENT ON COLUMN "public"."planting_batches"."batch_number" IS 'Numero progressivo batch: 1=prima semina, 2=seconda scalare, etc.';



COMMENT ON COLUMN "public"."planting_batches"."current_quantity" IS 'Piante ancora vive in questo batch (può diminuire per perdite)';



CREATE OR REPLACE VIEW "public"."plants_per_row_summary" AS
 SELECT COALESCE("concat"('Row ', "gr"."row_number", ' - ', "gr"."crop_name"), "fr"."name") AS "row_name",
    COALESCE("gr"."id", "fr"."id") AS "row_id",
        CASE
            WHEN ("gr"."id" IS NOT NULL) THEN 'garden_row'::"text"
            ELSE 'field_row'::"text"
        END AS "row_type",
    "gp"."garden_id",
    "count"(*) AS "total_plants",
    "count"(*) FILTER (WHERE ("gp"."status" = 'healthy'::"text")) AS "healthy_plants",
    "count"(*) FILTER (WHERE ("gp"."status" = 'diseased'::"text")) AS "diseased_plants",
    "count"(*) FILTER (WHERE ("gp"."status" = 'dead'::"text")) AS "dead_plants",
    "avg"("gp"."health_score") AS "avg_health_score",
    "min"("gp"."planting_date") AS "first_planting_date",
    "max"("gp"."planting_date") AS "last_planting_date"
   FROM (("public"."garden_plants" "gp"
     LEFT JOIN "public"."garden_rows" "gr" ON (("gp"."row_id" = "gr"."id")))
     LEFT JOIN "public"."field_rows" "fr" ON (("gp"."field_row_id" = "fr"."id")))
  GROUP BY COALESCE("concat"('Row ', "gr"."row_number", ' - ', "gr"."crop_name"), "fr"."name"), COALESCE("gr"."id", "fr"."id"),
        CASE
            WHEN ("gr"."id" IS NOT NULL) THEN 'garden_row'::"text"
            ELSE 'field_row'::"text"
        END, "gp"."garden_id";


ALTER VIEW "public"."plants_per_row_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prescription_map_exports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "prescription_map_id" "uuid" NOT NULL,
    "export_format" "text" NOT NULL,
    "export_configuration" "jsonb" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_size_bytes" bigint,
    "file_path" "text",
    "download_url" "text",
    "export_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "export_progress" integer DEFAULT 0,
    "error_message" "text",
    "download_count" integer DEFAULT 0 NOT NULL,
    "last_downloaded_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."prescription_map_exports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prescription_maps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "garden_name" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "map_type" "text" NOT NULL,
    "generation_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "data_source_period" "jsonb" NOT NULL,
    "data_sources" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "total_zones" integer DEFAULT 0 NOT NULL,
    "total_area_sqm" numeric DEFAULT 0 NOT NULL,
    "export_formats" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "validation_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "quality_score" integer DEFAULT 0 NOT NULL,
    "validation_errors" "jsonb",
    "cost_analysis" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid"
);


ALTER TABLE "public"."prescription_maps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prescription_zones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "prescription_map_id" "uuid" NOT NULL,
    "zone_number" integer NOT NULL,
    "zone_name" "text" NOT NULL,
    "zone_type" "text" DEFAULT 'uniform'::"text" NOT NULL,
    "geometry" "jsonb" NOT NULL,
    "centroid" "jsonb" NOT NULL,
    "area_sqm" numeric NOT NULL,
    "prescription" "jsonb" NOT NULL,
    "source_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "data_quality" integer DEFAULT 0 NOT NULL,
    "confidence" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."prescription_zones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."professional_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_id" "uuid",
    "analysis_type" "text" NOT NULL,
    "period_start" "date" NOT NULL,
    "period_end" "date" NOT NULL,
    "data_points" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "metrics" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "insights" "jsonb" DEFAULT '{}'::"jsonb",
    "recommendations" "jsonb" DEFAULT '{}'::"jsonb",
    "generated_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "professional_analytics_analysis_type_check" CHECK (("analysis_type" = ANY (ARRAY['yield_analysis'::"text", 'cost_analysis'::"text", 'efficiency_analysis'::"text", 'seasonal_report'::"text", 'crop_performance'::"text", 'resource_usage'::"text"])))
);


ALTER TABLE "public"."professional_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "tier" "text" DEFAULT 'PRO'::"text",
    "ai_credits_total" integer DEFAULT 0,
    "ai_credits_used" integer DEFAULT 0,
    "ai_credits_reset_date" "date" DEFAULT (("date_trunc"('month'::"text", "now"()) + '1 mon'::interval))::"date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "preferences" "jsonb" DEFAULT '{}'::"jsonb",
    "first_name" "text",
    "last_name" "text",
    "phone" "text",
    "birth_date" "date",
    "company" "text",
    "avatar_url" "text",
    "email_verified" boolean DEFAULT false,
    "phone_verified" boolean DEFAULT false,
    "onboarding_completed" boolean DEFAULT false,
    "terms_accepted_at" timestamp with time zone,
    "privacy_accepted_at" timestamp with time zone,
    "marketing_consent" boolean DEFAULT false,
    "email" "text",
    CONSTRAINT "check_birth_date_range" CHECK ((("birth_date" IS NULL) OR (("birth_date" >= '1900-01-01'::"date") AND ("birth_date" <= (CURRENT_DATE - '13 years'::interval))))),
    CONSTRAINT "check_company_length" CHECK ((("company" IS NULL) OR ("length"("company") <= 100))),
    CONSTRAINT "check_first_name_length" CHECK ((("first_name" IS NULL) OR ("length"("first_name") <= 50))),
    CONSTRAINT "check_last_name_length" CHECK ((("last_name" IS NULL) OR ("length"("last_name") <= 50))),
    CONSTRAINT "check_phone_format" CHECK ((("phone" IS NULL) OR ("phone" ~ '^\+?[1-9]\d{1,14}$'::"text"))),
    CONSTRAINT "profiles_tier_check" CHECK (("tier" = 'PRO'::"text"))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."tier" IS 'Tier utente - Solo PRO supportato in questo database. FREE avrà repo separato.';



COMMENT ON COLUMN "public"."profiles"."preferences" IS 'User preferences and notification settings in JSON format';



COMMENT ON COLUMN "public"."profiles"."first_name" IS 'User first name for personalization';



COMMENT ON COLUMN "public"."profiles"."last_name" IS 'User last name for personalization';



COMMENT ON COLUMN "public"."profiles"."phone" IS 'User phone number in international format';



COMMENT ON COLUMN "public"."profiles"."birth_date" IS 'User birth date for age-appropriate features';



COMMENT ON COLUMN "public"."profiles"."company" IS 'User company name for professional features';



COMMENT ON COLUMN "public"."profiles"."avatar_url" IS 'URL to user profile picture';



COMMENT ON COLUMN "public"."profiles"."email_verified" IS 'Whether user email has been verified';



COMMENT ON COLUMN "public"."profiles"."phone_verified" IS 'Whether user phone has been verified';



COMMENT ON COLUMN "public"."profiles"."onboarding_completed" IS 'Whether user has completed initial setup';



COMMENT ON COLUMN "public"."profiles"."terms_accepted_at" IS 'Timestamp when user accepted terms and conditions';



COMMENT ON COLUMN "public"."profiles"."privacy_accepted_at" IS 'Timestamp when user accepted privacy policy';



COMMENT ON COLUMN "public"."profiles"."marketing_consent" IS 'Whether user consented to marketing communications';



CREATE OR REPLACE VIEW "public"."row_health_summary" AS
 SELECT COALESCE("gr"."id", "fr"."id") AS "row_id",
    COALESCE("concat"('Row ', "gr"."row_number", ' - ', "gr"."crop_name"), "fr"."name") AS "row_name",
        CASE
            WHEN ("gr"."id" IS NOT NULL) THEN 'garden_row'::"text"
            ELSE 'field_row'::"text"
        END AS "row_type",
    "gp"."garden_id",
    "count"(*) AS "total_plants",
    "avg"("gp"."health_score") AS "avg_health_score",
    "count"(*) FILTER (WHERE ("gp"."status" = 'healthy'::"text")) AS "healthy_count",
    "count"(*) FILTER (WHERE ("gp"."status" = 'diseased'::"text")) AS "diseased_count",
    "count"(*) FILTER (WHERE ("gp"."status" = 'dead'::"text")) AS "dead_count",
    "count"(DISTINCT "po"."id") FILTER (WHERE ("po"."operation_date" >= (CURRENT_DATE - '30 days'::interval))) AS "recent_operations",
    "max"("po"."operation_date") AS "last_operation_date"
   FROM ((("public"."garden_plants" "gp"
     LEFT JOIN "public"."garden_rows" "gr" ON (("gp"."row_id" = "gr"."id")))
     LEFT JOIN "public"."field_rows" "fr" ON (("gp"."field_row_id" = "fr"."id")))
     LEFT JOIN "public"."plant_operations" "po" ON (("gp"."id" = "po"."plant_id")))
  GROUP BY COALESCE("gr"."id", "fr"."id"), COALESCE("concat"('Row ', "gr"."row_number", ' - ', "gr"."crop_name"), "fr"."name"),
        CASE
            WHEN ("gr"."id" IS NOT NULL) THEN 'garden_row'::"text"
            ELSE 'field_row'::"text"
        END, "gp"."garden_id";


ALTER VIEW "public"."row_health_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sapling_batches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "plant_name" "text" NOT NULL,
    "variety" "text",
    "sapling_type" "text" NOT NULL,
    "purchase_date" "date" NOT NULL,
    "planting_date" "date",
    "quantity" integer NOT NULL,
    "initial_quantity" integer,
    "location" "text" NOT NULL,
    "phase" "text" DEFAULT 'Purchased'::"text",
    "current_quantity" integer,
    "expected_establishment_date" "date",
    "rootstock" "text",
    "spacing" "text",
    "notes" "text",
    "photo_log" "jsonb" DEFAULT '[]'::"jsonb",
    "specialized_crop_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "sapling_batches_phase_check" CHECK (("phase" = ANY (ARRAY['Purchased'::"text", 'Planted'::"text", 'Establishing'::"text", 'Growing'::"text", 'ReadyToOrchard'::"text"]))),
    CONSTRAINT "sapling_batches_sapling_type_check" CHECK (("sapling_type" = ANY (ARRAY['FruitTree'::"text", 'Olive'::"text", 'Vine'::"text"])))
);


ALTER TABLE "public"."sapling_batches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sapling_inventory" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "species_name" "text" NOT NULL,
    "variety_name" "text" NOT NULL,
    "rootstock" "text",
    "supplier" "text",
    "purchase_date" "date",
    "purchase_price" numeric(8,2),
    "age_years" integer,
    "height_cm" integer,
    "pot_size_liters" integer,
    "quantity_available" integer DEFAULT 1 NOT NULL,
    "quantity_planted" integer DEFAULT 0,
    "notes" "text",
    "photos" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sapling_inventory" OWNER TO "postgres";


COMMENT ON TABLE "public"."sapling_inventory" IS 'Inventario alberelli per frutteti, oliveti, vigneti';



CREATE OR REPLACE VIEW "public"."scalar_production_timeline" WITH ("security_invoker"='true') AS
 SELECT "pb"."garden_id",
    "pb"."field_row_id",
    "fr"."zone_id",
    "pb"."batch_number",
    "pb"."plant_name",
    "pb"."variety",
    "pb"."plants_count",
    "pb"."sowing_date",
    "pb"."transplanting_date",
    "pb"."expected_harvest_date",
    "pb"."status",
    "pb"."current_quantity",
    "fr"."name" AS "field_row_name",
    "gz"."name" AS "zone_name"
   FROM (("public"."planting_batches" "pb"
     JOIN "public"."field_rows" "fr" ON (("fr"."id" = "pb"."field_row_id")))
     LEFT JOIN "public"."garden_zones" "gz" ON (("gz"."id" = "fr"."zone_id")))
  ORDER BY COALESCE("pb"."sowing_date", "pb"."transplanting_date", "pb"."expected_harvest_date");


ALTER VIEW "public"."scalar_production_timeline" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."seed_inventory" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_id" "uuid",
    "variety_id" "text" NOT NULL,
    "variety_name" "text" NOT NULL,
    "species_name" "text" NOT NULL,
    "purchase_date" "date",
    "expiry_year" integer NOT NULL,
    "is_open" boolean DEFAULT false,
    "quantity_remaining" "text" DEFAULT 'High'::"text",
    "initial_quantity" integer,
    "current_quantity" integer,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "seed_inventory_quantity_remaining_check" CHECK (("quantity_remaining" = ANY (ARRAY['High'::"text", 'Medium'::"text", 'Low'::"text", 'Empty'::"text"])))
);


ALTER TABLE "public"."seed_inventory" OWNER TO "postgres";


COMMENT ON TABLE "public"."seed_inventory" IS 'Inventario semi dell''utente. garden_id è opzionale (SET NULL) per permettere riuso dei semi tra garden diversi';



COMMENT ON COLUMN "public"."seed_inventory"."initial_quantity" IS 'Quantità iniziale di semi nel pacchetto (es. 100)';



COMMENT ON COLUMN "public"."seed_inventory"."current_quantity" IS 'Quantità corrente rimanente (es. 90 dopo aver usato 10)';



CREATE TABLE IF NOT EXISTS "public"."seedling_batches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "plant_name" "text" NOT NULL,
    "variety" "text",
    "sowing_date" "date" NOT NULL,
    "quantity" integer NOT NULL,
    "initial_quantity" integer,
    "location" "text" NOT NULL,
    "phase" "text" DEFAULT 'Sowing'::"text",
    "current_quantity" integer,
    "expected_transplant_date" "date",
    "notes" "text",
    "photo_log" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'Planned'::"text",
    CONSTRAINT "seedling_batches_location_check" CHECK (("location" = ANY (ARRAY['Indoor'::"text", 'Greenhouse'::"text", 'ColdFrame'::"text"]))),
    CONSTRAINT "seedling_batches_phase_check" CHECK (("phase" = ANY (ARRAY['Sowing'::"text", 'Germination'::"text", 'Nursing'::"text", 'Hardening'::"text", 'ReadyToTransplant'::"text"])))
);


ALTER TABLE "public"."seedling_batches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sensor_readings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_id" "uuid",
    "sensor_type" "text" NOT NULL,
    "sensor_location" "text",
    "value" numeric(10,4) NOT NULL,
    "unit" "text" NOT NULL,
    "quality_score" numeric(3,2) DEFAULT 1.0,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "recorded_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "sensor_readings_sensor_type_check" CHECK (("sensor_type" = ANY (ARRAY['temperature'::"text", 'humidity'::"text", 'soil_moisture'::"text", 'ph'::"text", 'light'::"text", 'co2'::"text", 'pressure'::"text", 'wind_speed'::"text", 'rainfall'::"text"])))
);


ALTER TABLE "public"."sensor_readings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."soil_analysis" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_id" "uuid",
    "garden_zone_id" "uuid",
    "analysis_date" "date" NOT NULL,
    "ph_value" numeric(3,1),
    "organic_matter_percent" numeric(4,2),
    "nitrogen_ppm" numeric(8,2),
    "phosphorus_ppm" numeric(8,2),
    "potassium_ppm" numeric(8,2),
    "calcium_ppm" numeric(8,2),
    "magnesium_ppm" numeric(8,2),
    "sulfur_ppm" numeric(8,2),
    "iron_ppm" numeric(8,2),
    "manganese_ppm" numeric(8,2),
    "zinc_ppm" numeric(8,2),
    "copper_ppm" numeric(8,2),
    "boron_ppm" numeric(8,2),
    "electrical_conductivity" numeric(6,2),
    "cation_exchange_capacity" numeric(6,2),
    "soil_texture" "text",
    "laboratory" "text",
    "lab_report_url" "text",
    "recommendations" "jsonb" DEFAULT '{}'::"jsonb",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "soil_analysis_soil_texture_check" CHECK (("soil_texture" = ANY (ARRAY['clay'::"text", 'silt'::"text", 'sand'::"text", 'loam'::"text", 'clay_loam'::"text", 'silt_loam'::"text", 'sandy_loam'::"text"])))
);


ALTER TABLE "public"."soil_analysis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."supplier_certifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "supplier_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "certificate_number" "text" NOT NULL,
    "valid_from" timestamp with time zone NOT NULL,
    "valid_until" timestamp with time zone NOT NULL,
    "certifying_body" "text" NOT NULL,
    "scope" "text"[] DEFAULT '{}'::"text"[],
    "status" "text" DEFAULT 'VALID'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "supplier_certifications_status_check" CHECK (("status" = ANY (ARRAY['VALID'::"text", 'EXPIRED'::"text", 'SUSPENDED'::"text"])))
);


ALTER TABLE "public"."supplier_certifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."training_materials" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "program_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "type" "text" NOT NULL,
    "url" "text",
    "mandatory" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "training_materials_type_check" CHECK (("type" = ANY (ARRAY['DOCUMENT'::"text", 'VIDEO'::"text", 'PRESENTATION'::"text", 'QUIZ'::"text"])))
);


ALTER TABLE "public"."training_materials" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."training_participants" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "program_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "role" "text" NOT NULL,
    "completion_date" timestamp with time zone,
    "score" integer,
    "certificate" "text",
    "status" "text" DEFAULT 'ENROLLED'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "training_participants_status_check" CHECK (("status" = ANY (ARRAY['ENROLLED'::"text", 'IN_PROGRESS'::"text", 'COMPLETED'::"text", 'FAILED'::"text"])))
);


ALTER TABLE "public"."training_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."training_programs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "certification_types" "text"[] DEFAULT '{}'::"text"[],
    "mandatory" boolean DEFAULT false,
    "frequency" "text" DEFAULT 'Annuale'::"text",
    "duration" "text",
    "trainer" "text",
    "status" "text" DEFAULT 'PLANNED'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "training_programs_status_check" CHECK (("status" = ANY (ARRAY['PLANNED'::"text", 'ACTIVE'::"text", 'COMPLETED'::"text", 'CANCELLED'::"text"])))
);


ALTER TABLE "public"."training_programs" OWNER TO "postgres";


COMMENT ON TABLE "public"."training_programs" IS 'Training and competence management';



CREATE TABLE IF NOT EXISTS "public"."treatment_register" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_id" "uuid",
    "crop_name" "text" NOT NULL,
    "treatment_date" "date" NOT NULL,
    "product_name" "text" NOT NULL,
    "active_ingredient" "text",
    "dosage" numeric(8,2),
    "dosage_unit" "text",
    "area_treated" numeric(8,2),
    "method" "text",
    "reason" "text",
    "weather_conditions" "jsonb",
    "operator_name" "text",
    "notes" "text",
    "zone_id" "uuid",
    "row_ids" "uuid"[],
    "bed_ids" "uuid"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "field_row_id" "uuid",
    "bed_id" "uuid",
    "bed_row_id" "uuid",
    "plant_ids" "uuid"[],
    "plants_affected" integer,
    "product_per_plant_ml" numeric(8,2) DEFAULT NULL::numeric,
    "treatment_type" "text" DEFAULT 'conventional'::"text",
    "organic_approved" boolean DEFAULT false,
    "registration_number" "text",
    "pre_harvest_interval_days" integer,
    CONSTRAINT "check_treatment_row_reference" CHECK (((("bed_row_id" IS NULL) AND ("field_row_id" IS NULL)) OR (("bed_row_id" IS NOT NULL) AND ("field_row_id" IS NULL)) OR (("bed_row_id" IS NULL) AND ("field_row_id" IS NOT NULL)))),
    CONSTRAINT "treatment_register_dosage_unit_check" CHECK (("dosage_unit" = ANY (ARRAY['ml'::"text", 'g'::"text", 'kg'::"text", 'L'::"text"]))),
    CONSTRAINT "treatment_register_method_check" CHECK (("method" = ANY (ARRAY['spray'::"text", 'soil'::"text", 'seed'::"text", 'foliar'::"text"]))),
    CONSTRAINT "treatment_register_reason_check" CHECK (("reason" = ANY (ARRAY['preventive'::"text", 'curative'::"text", 'pest_control'::"text", 'disease_control'::"text", 'nutrient'::"text"]))),
    CONSTRAINT "treatment_register_treatment_type_check" CHECK (("treatment_type" = ANY (ARRAY['organic'::"text", 'conventional'::"text", 'integrated'::"text"])))
);


ALTER TABLE "public"."treatment_register" OWNER TO "postgres";


COMMENT ON COLUMN "public"."treatment_register"."field_row_id" IS 'Riferimento al filare specifico per trattamenti mirati';



COMMENT ON COLUMN "public"."treatment_register"."plant_ids" IS 'Array di IDs delle piante specifiche trattate';



COMMENT ON COLUMN "public"."treatment_register"."plants_affected" IS 'Numero totale di piante trattate';



COMMENT ON COLUMN "public"."treatment_register"."product_per_plant_ml" IS 'Millilitri di prodotto per singola pianta';



COMMENT ON COLUMN "public"."treatment_register"."treatment_type" IS 'Tipo di trattamento: organic (biologico), conventional (tradizionale), integrated (integrato)';



COMMENT ON COLUMN "public"."treatment_register"."organic_approved" IS 'Indica se il prodotto è ammesso in agricoltura biologica';



COMMENT ON COLUMN "public"."treatment_register"."registration_number" IS 'Numero di registrazione del prodotto fitosanitario';



COMMENT ON COLUMN "public"."treatment_register"."pre_harvest_interval_days" IS 'Tempo di carenza in giorni prima del raccolto';



CREATE TABLE IF NOT EXISTS "public"."treatment_registry" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_zone_id" "uuid",
    "treatment_name" "text" NOT NULL,
    "treatment_category" "text" NOT NULL,
    "active_ingredient" "text",
    "target_pest_disease" "text",
    "application_date" "date" NOT NULL,
    "dosage" "text" NOT NULL,
    "application_method" "text",
    "weather_at_application" "jsonb" DEFAULT '{}'::"jsonb",
    "pre_harvest_interval_days" integer,
    "effectiveness_rating" integer,
    "side_effects" "text",
    "cost" numeric(8,2),
    "supplier" "text",
    "batch_number" "text",
    "expiry_date" "date",
    "safety_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "treatment_registry_application_method_check" CHECK (("application_method" = ANY (ARRAY['spray'::"text", 'dust'::"text", 'granular'::"text", 'systemic'::"text", 'soil_drench'::"text"]))),
    CONSTRAINT "treatment_registry_effectiveness_rating_check" CHECK ((("effectiveness_rating" >= 1) AND ("effectiveness_rating" <= 5))),
    CONSTRAINT "treatment_registry_treatment_category_check" CHECK (("treatment_category" = ANY (ARRAY['fungicide'::"text", 'insecticide'::"text", 'herbicide'::"text", 'bactericide'::"text", 'organic'::"text", 'biological'::"text", 'preventive'::"text"])))
);


ALTER TABLE "public"."treatment_registry" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_badges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "badge_id" "text" NOT NULL,
    "badge_name" "text" NOT NULL,
    "badge_description" "text",
    "badge_icon" "text",
    "badge_category" "text",
    "earned_at" timestamp with time zone DEFAULT "now"(),
    "earned_for" "text",
    "points_awarded" integer DEFAULT 0,
    "rarity" "text" DEFAULT 'common'::"text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "user_badges_badge_category_check" CHECK (("badge_category" = ANY (ARRAY['cultivation'::"text", 'harvest'::"text", 'sustainability'::"text", 'knowledge'::"text", 'community'::"text", 'milestone'::"text"]))),
    CONSTRAINT "user_badges_rarity_check" CHECK (("rarity" = ANY (ARRAY['common'::"text", 'uncommon'::"text", 'rare'::"text", 'epic'::"text", 'legendary'::"text"])))
);


ALTER TABLE "public"."user_badges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vegetation_indices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_zone_id" "uuid",
    "measurement_date" "date" NOT NULL,
    "measurement_method" "text" NOT NULL,
    "ndvi_value" numeric(4,3),
    "evi_value" numeric(4,3),
    "savi_value" numeric(4,3),
    "lai_value" numeric(4,2),
    "chlorophyll_content" numeric(6,2),
    "biomass_estimate_kg" numeric(8,2),
    "health_score" numeric(3,2),
    "stress_indicators" "jsonb" DEFAULT '{}'::"jsonb",
    "growth_stage" "text",
    "weather_conditions" "jsonb" DEFAULT '{}'::"jsonb",
    "image_url" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "vegetation_indices_health_score_check" CHECK ((("health_score" >= 0.0) AND ("health_score" <= 1.0))),
    CONSTRAINT "vegetation_indices_measurement_method_check" CHECK (("measurement_method" = ANY (ARRAY['satellite'::"text", 'drone'::"text", 'handheld_sensor'::"text", 'visual_estimation'::"text", 'photo_analysis'::"text"])))
);


ALTER TABLE "public"."vegetation_indices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."watering_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "zone_id" "uuid" NOT NULL,
    "garden_id" "uuid" NOT NULL,
    "watered_at" timestamp with time zone NOT NULL,
    "date" "date" NOT NULL,
    "duration_minutes" integer NOT NULL,
    "liters_applied" numeric(10,2) NOT NULL,
    "method" "text" NOT NULL,
    "weather_condition" "text",
    "soil_moisture_before" integer,
    "soil_moisture_after" integer,
    "air_temperature_c" numeric(4,2),
    "notes" "text",
    "valve_id" "uuid",
    "completed" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "bed_id" "uuid",
    "bed_row_id" "uuid",
    "field_row_id" "uuid",
    "plant_ids" "uuid"[],
    "plants_affected" integer,
    "water_per_plant_liters" numeric(6,2) DEFAULT NULL::numeric,
    CONSTRAINT "check_watering_logs_row_reference" CHECK (((("bed_row_id" IS NULL) AND ("field_row_id" IS NULL)) OR (("bed_row_id" IS NOT NULL) AND ("field_row_id" IS NULL)) OR (("bed_row_id" IS NULL) AND ("field_row_id" IS NOT NULL)))),
    CONSTRAINT "watering_logs_method_check" CHECK (("method" = ANY (ARRAY['Manual'::"text", 'Automatic'::"text", 'Timer'::"text"])))
);


ALTER TABLE "public"."watering_logs" OWNER TO "postgres";


COMMENT ON COLUMN "public"."watering_logs"."plant_ids" IS 'Array di IDs delle piante specifiche irrigate';



COMMENT ON COLUMN "public"."watering_logs"."plants_affected" IS 'Numero totale di piante irrigate';



COMMENT ON COLUMN "public"."watering_logs"."water_per_plant_liters" IS 'Litri d acqua per singola pianta';



CREATE TABLE IF NOT EXISTS "public"."weather_cache" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lat_lng" "text" NOT NULL,
    "date" "date" NOT NULL,
    "forecast" "jsonb" NOT NULL,
    "cached_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone DEFAULT ("now"() + '24:00:00'::interval)
);


ALTER TABLE "public"."weather_cache" OWNER TO "postgres";


COMMENT ON TABLE "public"."weather_cache" IS 'Cache delle previsioni meteo per coordinate e data.
Riduce chiamate API esterne e migliora performance WeatherWidget.';



COMMENT ON COLUMN "public"."weather_cache"."lat_lng" IS 'Coordinate in formato "lat_lng" con 4 decimali.
Es: "44.4944_11.3425" per Bologna.';



COMMENT ON COLUMN "public"."weather_cache"."date" IS 'Data di riferimento della previsione (YYYY-MM-DD).';



COMMENT ON COLUMN "public"."weather_cache"."expires_at" IS 'Data e ora di scadenza cache (default 24 ore).';



CREATE TABLE IF NOT EXISTS "public"."weather_reschedule_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "original_task_id" "uuid",
    "task_type" "text" NOT NULL,
    "original_date" "date" NOT NULL,
    "rescheduled_date" "date" NOT NULL,
    "weather_reason" "text" NOT NULL,
    "weather_data" "jsonb" DEFAULT '{}'::"jsonb",
    "automatic_reschedule" boolean DEFAULT false,
    "user_confirmed" boolean DEFAULT false,
    "reschedule_algorithm" "text" DEFAULT 'basic'::"text",
    "confidence_score" numeric(3,2),
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "weather_reschedule_logs_weather_reason_check" CHECK (("weather_reason" = ANY (ARRAY['rain'::"text", 'frost'::"text", 'heat_wave'::"text", 'wind'::"text", 'storm'::"text", 'drought'::"text", 'humidity'::"text", 'temperature'::"text"])))
);


ALTER TABLE "public"."weather_reschedule_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."yield_predictions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "garden_zone_id" "uuid",
    "crop_name" "text" NOT NULL,
    "archetype_id" "text",
    "planting_date" "date" NOT NULL,
    "predicted_harvest_date" "date" NOT NULL,
    "predicted_yield_kg" numeric(8,2),
    "predicted_yield_units" integer,
    "confidence_score" numeric(3,2),
    "factors_considered" "jsonb" DEFAULT '{}'::"jsonb",
    "weather_impact" "jsonb" DEFAULT '{}'::"jsonb",
    "soil_impact" "jsonb" DEFAULT '{}'::"jsonb",
    "care_impact" "jsonb" DEFAULT '{}'::"jsonb",
    "actual_harvest_date" "date",
    "actual_yield_kg" numeric(8,2),
    "actual_yield_units" integer,
    "accuracy_score" numeric(3,2),
    "model_version" "text" DEFAULT 'v1.0'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "yield_predictions_confidence_score_check" CHECK ((("confidence_score" >= 0.0) AND ("confidence_score" <= 1.0)))
);


ALTER TABLE "public"."yield_predictions" OWNER TO "postgres";


ALTER TABLE ONLY "public"."agronomist_advice"
    ADD CONSTRAINT "agronomist_advice_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agronomist_consultations"
    ADD CONSTRAINT "agronomist_consultations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agronomists"
    ADD CONSTRAINT "agronomists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_credit_transactions"
    ADD CONSTRAINT "ai_credit_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_configurations"
    ADD CONSTRAINT "api_configurations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_configurations"
    ADD CONSTRAINT "api_configurations_user_id_service_name_key" UNIQUE ("user_id", "service_name");



ALTER TABLE ONLY "public"."aquaponic_readings"
    ADD CONSTRAINT "aquaponic_readings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_checklist_items"
    ADD CONSTRAINT "audit_checklist_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_schedules"
    ADD CONSTRAINT "audit_schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bed_planting_history"
    ADD CONSTRAINT "bed_planting_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."calendar_tasks"
    ADD CONSTRAINT "calendar_tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."certification_documents"
    ADD CONSTRAINT "certification_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."certifications"
    ADD CONSTRAINT "certifications_garden_id_type_key" UNIQUE ("garden_id", "type");



ALTER TABLE ONLY "public"."certifications"
    ADD CONSTRAINT "certifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."certified_suppliers"
    ADD CONSTRAINT "certified_suppliers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."challenge_completions"
    ADD CONSTRAINT "challenge_completions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."crop_archetypes"
    ADD CONSTRAINT "crop_archetypes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."crop_learning_events"
    ADD CONSTRAINT "crop_learning_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."crop_mechanical_works"
    ADD CONSTRAINT "crop_mechanical_works_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."crop_profiles"
    ADD CONSTRAINT "crop_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cultivation_issues"
    ADD CONSTRAINT "cultivation_issues_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cultivation_plans"
    ADD CONSTRAINT "cultivation_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cultivation_statistics"
    ADD CONSTRAINT "cultivation_statistics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."custom_crops"
    ADD CONSTRAINT "custom_crops_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."custom_plans"
    ADD CONSTRAINT "custom_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."detailed_harvests"
    ADD CONSTRAINT "detailed_harvests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fertilization_logs"
    ADD CONSTRAINT "fertilization_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fertilizer_application_logs"
    ADD CONSTRAINT "fertilizer_application_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fertilizer_inventory"
    ADD CONSTRAINT "fertilizer_inventory_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."field_rows"
    ADD CONSTRAINT "field_rows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."garden_accessories"
    ADD CONSTRAINT "garden_accessories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."garden_beds"
    ADD CONSTRAINT "garden_beds_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."garden_correlations"
    ADD CONSTRAINT "garden_correlations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."garden_obstacles"
    ADD CONSTRAINT "garden_obstacles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."garden_patterns"
    ADD CONSTRAINT "garden_patterns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."garden_plants"
    ADD CONSTRAINT "garden_plants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."garden_rows"
    ADD CONSTRAINT "garden_rows_garden_zone_id_row_number_key" UNIQUE ("garden_zone_id", "row_number");



ALTER TABLE ONLY "public"."garden_rows"
    ADD CONSTRAINT "garden_rows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."garden_season_analyses"
    ADD CONSTRAINT "garden_season_analyses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."garden_season_analyses"
    ADD CONSTRAINT "garden_season_analyses_user_id_garden_id_season_year_key" UNIQUE ("user_id", "garden_id", "season", "year");



ALTER TABLE ONLY "public"."garden_tasks"
    ADD CONSTRAINT "garden_tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."garden_tree_memories"
    ADD CONSTRAINT "garden_tree_memories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."garden_zone_memories"
    ADD CONSTRAINT "garden_zone_memories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."garden_zones"
    ADD CONSTRAINT "garden_zones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gardens"
    ADD CONSTRAINT "gardens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."globalgap_compliance_checklist"
    ADD CONSTRAINT "globalgap_compliance_checklist_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."globalgap_ggn_codes"
    ADD CONSTRAINT "globalgap_ggn_codes_ggn_code_key" UNIQUE ("ggn_code");



ALTER TABLE ONLY "public"."globalgap_ggn_codes"
    ADD CONSTRAINT "globalgap_ggn_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."globalgap_health_safety_managers"
    ADD CONSTRAINT "globalgap_health_safety_managers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."globalgap_recall_procedures"
    ADD CONSTRAINT "globalgap_recall_procedures_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."globalgap_risk_management_plans"
    ADD CONSTRAINT "globalgap_risk_management_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."globalgap_self_assessments"
    ADD CONSTRAINT "globalgap_self_assessments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."haccp_critical_control_points"
    ADD CONSTRAINT "haccp_critical_control_points_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."haccp_hazard_analysis"
    ADD CONSTRAINT "haccp_hazard_analysis_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."haccp_systems"
    ADD CONSTRAINT "haccp_systems_garden_id_key" UNIQUE ("garden_id");



ALTER TABLE ONLY "public"."haccp_systems"
    ADD CONSTRAINT "haccp_systems_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."haccp_team_members"
    ADD CONSTRAINT "haccp_team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."harvest_logs"
    ADD CONSTRAINT "harvest_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hydroponic_readings"
    ADD CONSTRAINT "hydroponic_readings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."irrigation_components"
    ADD CONSTRAINT "irrigation_components_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."irrigation_logs"
    ADD CONSTRAINT "irrigation_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."irrigation_systems"
    ADD CONSTRAINT "irrigation_systems_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."irrigation_zones"
    ADD CONSTRAINT "irrigation_zones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mechanical_work_register"
    ADD CONSTRAINT "mechanical_work_register_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mechanical_work_sequences"
    ADD CONSTRAINT "mechanical_work_sequences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."operation_sync_log"
    ADD CONSTRAINT "operation_sync_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organic_certifications"
    ADD CONSTRAINT "organic_certifications_garden_id_key" UNIQUE ("garden_id");



ALTER TABLE ONLY "public"."organic_certifications"
    ADD CONSTRAINT "organic_certifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organic_inputs_register"
    ADD CONSTRAINT "organic_inputs_register_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organic_sales_register"
    ADD CONSTRAINT "organic_sales_register_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."phase_transitions"
    ADD CONSTRAINT "phase_transitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."photo_logs"
    ADD CONSTRAINT "photo_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."phyto_inventory"
    ADD CONSTRAINT "phyto_inventory_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plant_families"
    ADD CONSTRAINT "plant_families_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plant_harvests"
    ADD CONSTRAINT "plant_harvests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plant_operations"
    ADD CONSTRAINT "plant_operations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plant_rules"
    ADD CONSTRAINT "plant_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plant_synonyms"
    ADD CONSTRAINT "plant_synonyms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plant_synonyms"
    ADD CONSTRAINT "plant_synonyms_synonym_locale_key" UNIQUE ("synonym", "locale");



ALTER TABLE ONLY "public"."plant_taxonomy"
    ADD CONSTRAINT "plant_taxonomy_pkey" PRIMARY KEY ("plant_id");



ALTER TABLE ONLY "public"."planting_batches"
    ADD CONSTRAINT "planting_batches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prescription_map_exports"
    ADD CONSTRAINT "prescription_map_exports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prescription_maps"
    ADD CONSTRAINT "prescription_maps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prescription_zones"
    ADD CONSTRAINT "prescription_zones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."professional_analytics"
    ADD CONSTRAINT "professional_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sapling_batches"
    ADD CONSTRAINT "sapling_batches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sapling_inventory"
    ADD CONSTRAINT "sapling_inventory_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."seed_inventory"
    ADD CONSTRAINT "seed_inventory_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."seedling_batches"
    ADD CONSTRAINT "seedling_batches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sensor_readings"
    ADD CONSTRAINT "sensor_readings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."soil_analysis"
    ADD CONSTRAINT "soil_analysis_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supplier_certifications"
    ADD CONSTRAINT "supplier_certifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."training_materials"
    ADD CONSTRAINT "training_materials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."training_participants"
    ADD CONSTRAINT "training_participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."training_programs"
    ADD CONSTRAINT "training_programs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."treatment_register"
    ADD CONSTRAINT "treatment_register_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."treatment_registry"
    ADD CONSTRAINT "treatment_registry_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."planting_batches"
    ADD CONSTRAINT "unique_field_row_batch" UNIQUE ("field_row_id", "batch_number");



ALTER TABLE ONLY "public"."field_rows"
    ADD CONSTRAINT "unique_garden_row_number" UNIQUE ("garden_id", "row_number");



ALTER TABLE ONLY "public"."garden_plants"
    ADD CONSTRAINT "unique_plant_code_per_garden" UNIQUE ("garden_id", "plant_code");



ALTER TABLE ONLY "public"."garden_plants"
    ADD CONSTRAINT "unique_position_per_field_row" UNIQUE ("field_row_id", "position_in_row");



ALTER TABLE ONLY "public"."garden_plants"
    ADD CONSTRAINT "unique_position_per_row" UNIQUE ("row_id", "position_in_row");



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_user_id_badge_id_key" UNIQUE ("user_id", "badge_id");



ALTER TABLE ONLY "public"."vegetation_indices"
    ADD CONSTRAINT "vegetation_indices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."watering_logs"
    ADD CONSTRAINT "watering_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."weather_cache"
    ADD CONSTRAINT "weather_cache_lat_lng_date_key" UNIQUE ("lat_lng", "date");



ALTER TABLE ONLY "public"."weather_cache"
    ADD CONSTRAINT "weather_cache_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."weather_reschedule_logs"
    ADD CONSTRAINT "weather_reschedule_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."yield_predictions"
    ADD CONSTRAINT "yield_predictions_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_accessories_category" ON "public"."garden_accessories" USING "btree" ("category");



CREATE INDEX "idx_accessories_garden_id" ON "public"."garden_accessories" USING "btree" ("garden_id");



CREATE INDEX "idx_advice_consultation_id" ON "public"."agronomist_advice" USING "btree" ("consultation_id");



CREATE INDEX "idx_advice_task_id" ON "public"."agronomist_advice" USING "btree" ("task_id");



CREATE INDEX "idx_agronomists_user_id" ON "public"."agronomists" USING "btree" ("user_id");



CREATE INDEX "idx_ai_credit_transactions_type" ON "public"."ai_credit_transactions" USING "btree" ("type");



CREATE INDEX "idx_ai_credit_transactions_user_id" ON "public"."ai_credit_transactions" USING "btree" ("user_id");



CREATE INDEX "idx_api_configurations_service" ON "public"."api_configurations" USING "btree" ("service_name");



CREATE INDEX "idx_api_configurations_user" ON "public"."api_configurations" USING "btree" ("user_id");



CREATE INDEX "idx_aquaponic_readings_garden_date" ON "public"."aquaponic_readings" USING "btree" ("garden_id", "reading_date" DESC);



CREATE INDEX "idx_archetypes_parent" ON "public"."crop_archetypes" USING "btree" ("parent_archetype_id");



CREATE INDEX "idx_audit_checklist_audit_id" ON "public"."audit_checklist_items" USING "btree" ("audit_id");



CREATE INDEX "idx_audit_schedules_date" ON "public"."audit_schedules" USING "btree" ("scheduled_date");



CREATE INDEX "idx_audit_schedules_garden_id" ON "public"."audit_schedules" USING "btree" ("garden_id");



CREATE INDEX "idx_bed_history_bed_id" ON "public"."bed_planting_history" USING "btree" ("bed_id");



CREATE INDEX "idx_bed_history_plant_family" ON "public"."bed_planting_history" USING "btree" ("plant_family");



CREATE INDEX "idx_bed_history_year_season" ON "public"."bed_planting_history" USING "btree" ("year", "season");



CREATE INDEX "idx_calendar_tasks_completed" ON "public"."calendar_tasks" USING "btree" ("completed_at");



CREATE INDEX "idx_calendar_tasks_date" ON "public"."calendar_tasks" USING "btree" ("scheduled_date");



CREATE INDEX "idx_calendar_tasks_garden" ON "public"."calendar_tasks" USING "btree" ("garden_id");



CREATE INDEX "idx_calendar_tasks_type" ON "public"."calendar_tasks" USING "btree" ("task_type");



CREATE INDEX "idx_calendar_tasks_user" ON "public"."calendar_tasks" USING "btree" ("user_id");



CREATE INDEX "idx_certification_documents_garden_id" ON "public"."certification_documents" USING "btree" ("garden_id");



CREATE INDEX "idx_certification_documents_type" ON "public"."certification_documents" USING "btree" ("certification_type");



CREATE INDEX "idx_certifications_garden_id" ON "public"."certifications" USING "btree" ("garden_id");



CREATE INDEX "idx_certifications_status" ON "public"."certifications" USING "btree" ("status");



CREATE INDEX "idx_certifications_type" ON "public"."certifications" USING "btree" ("type");



CREATE INDEX "idx_certifications_valid_until" ON "public"."certifications" USING "btree" ("valid_until");



CREATE INDEX "idx_certified_suppliers_garden_id" ON "public"."certified_suppliers" USING "btree" ("garden_id");



CREATE INDEX "idx_challenge_completions_challenge" ON "public"."challenge_completions" USING "btree" ("challenge_id");



CREATE INDEX "idx_challenge_completions_completed" ON "public"."challenge_completions" USING "btree" ("completed_at");



CREATE INDEX "idx_challenge_completions_type" ON "public"."challenge_completions" USING "btree" ("challenge_type");



CREATE INDEX "idx_challenge_completions_user" ON "public"."challenge_completions" USING "btree" ("user_id");



CREATE INDEX "idx_consultations_agronomist_id" ON "public"."agronomist_consultations" USING "btree" ("agronomist_id");



CREATE INDEX "idx_consultations_task_id" ON "public"."agronomist_consultations" USING "btree" ("task_id");



CREATE INDEX "idx_consultations_user_id" ON "public"."agronomist_consultations" USING "btree" ("user_id");



CREATE INDEX "idx_crop_learning_events_archetype" ON "public"."crop_learning_events" USING "btree" ("archetype_id");



CREATE INDEX "idx_crop_learning_events_crop" ON "public"."crop_learning_events" USING "btree" ("crop_name");



CREATE INDEX "idx_crop_learning_events_public" ON "public"."crop_learning_events" USING "btree" ("shared_publicly");



CREATE INDEX "idx_crop_learning_events_tags" ON "public"."crop_learning_events" USING "gin" ("tags");



CREATE INDEX "idx_crop_learning_events_type" ON "public"."crop_learning_events" USING "btree" ("event_type");



CREATE INDEX "idx_crop_learning_events_user" ON "public"."crop_learning_events" USING "btree" ("user_id");



CREATE INDEX "idx_crop_mechanical_works_archetype" ON "public"."crop_mechanical_works" USING "btree" ("archetype_id");



CREATE INDEX "idx_crop_mechanical_works_crop" ON "public"."crop_mechanical_works" USING "btree" ("crop_name");



CREATE INDEX "idx_crop_mechanical_works_template" ON "public"."crop_mechanical_works" USING "btree" ("is_template");



CREATE INDEX "idx_crop_mechanical_works_type" ON "public"."crop_mechanical_works" USING "btree" ("work_type");



CREATE INDEX "idx_crop_mechanical_works_user" ON "public"."crop_mechanical_works" USING "btree" ("user_id");



CREATE INDEX "idx_cultivation_issues_type_severity" ON "public"."cultivation_issues" USING "btree" ("issue_type", "issue_severity");



CREATE INDEX "idx_cultivation_plans_active_phase" ON "public"."cultivation_plans" USING "btree" ("is_active", "current_phase");



CREATE INDEX "idx_cultivation_plans_archetype" ON "public"."cultivation_plans" USING "btree" ("archetype_id");



CREATE INDEX "idx_cultivation_plans_dates" ON "public"."cultivation_plans" USING "btree" ("planned_start_date", "estimated_harvest_date");



CREATE INDEX "idx_cultivation_plans_garden_active" ON "public"."cultivation_plans" USING "btree" ("garden_id", "is_active");



CREATE INDEX "idx_cultivation_plans_phase" ON "public"."cultivation_plans" USING "btree" ("current_phase");



CREATE INDEX "idx_cultivation_plans_user_garden_archetype" ON "public"."cultivation_plans" USING "btree" ("user_id", "garden_id", "archetype_id");



CREATE INDEX "idx_cultivation_statistics_archetype" ON "public"."cultivation_statistics" USING "btree" ("archetype_id", "archetype_category");



CREATE INDEX "idx_cultivation_statistics_user_archetype_period" ON "public"."cultivation_statistics" USING "btree" ("user_id", "archetype_id", "period_start");



CREATE INDEX "idx_cultivation_statistics_user_period" ON "public"."cultivation_statistics" USING "btree" ("user_id", "period_start", "period_end");



CREATE INDEX "idx_custom_crops_archetype" ON "public"."custom_crops" USING "btree" ("archetype_id");



CREATE INDEX "idx_custom_crops_name" ON "public"."custom_crops" USING "btree" ("name");



CREATE INDEX "idx_custom_crops_public" ON "public"."custom_crops" USING "btree" ("is_public");



CREATE INDEX "idx_custom_crops_user" ON "public"."custom_crops" USING "btree" ("user_id");



CREATE INDEX "idx_custom_plans_base_master_sheet" ON "public"."custom_plans" USING "btree" ("base_master_sheet_id");



CREATE INDEX "idx_custom_plans_garden_id" ON "public"."custom_plans" USING "btree" ("garden_id");



CREATE INDEX "idx_custom_plans_user_id" ON "public"."custom_plans" USING "btree" ("user_id");



CREATE INDEX "idx_detailed_harvests_plan_date" ON "public"."detailed_harvests" USING "btree" ("cultivation_plan_id", "harvest_date");



CREATE INDEX "idx_fertilization_logs_date" ON "public"."fertilization_logs" USING "btree" ("application_date");



CREATE INDEX "idx_fertilization_logs_type" ON "public"."fertilization_logs" USING "btree" ("fertilizer_type");



CREATE INDEX "idx_fertilization_logs_user" ON "public"."fertilization_logs" USING "btree" ("user_id");



CREATE INDEX "idx_fertilization_logs_zone" ON "public"."fertilization_logs" USING "btree" ("garden_zone_id");



CREATE INDEX "idx_fertilizer_application_logs_plant_ids" ON "public"."fertilizer_application_logs" USING "gin" ("plant_ids");



CREATE INDEX "idx_fertilizer_bed" ON "public"."fertilizer_application_logs" USING "btree" ("bed_id");



CREATE INDEX "idx_fertilizer_bed_row" ON "public"."fertilizer_application_logs" USING "btree" ("bed_row_id");



CREATE INDEX "idx_fertilizer_field_row" ON "public"."fertilizer_application_logs" USING "btree" ("field_row_id");



CREATE INDEX "idx_fertilizer_inventory_garden" ON "public"."fertilizer_inventory" USING "btree" ("garden_id");



CREATE INDEX "idx_fertilizer_inventory_type" ON "public"."fertilizer_inventory" USING "btree" ("fertilizer_type");



CREATE INDEX "idx_fertilizer_inventory_updated" ON "public"."fertilizer_inventory" USING "btree" ("updated_at" DESC);



CREATE INDEX "idx_fertilizer_inventory_user" ON "public"."fertilizer_inventory" USING "btree" ("user_id");



CREATE INDEX "idx_fertilizer_logs_crop" ON "public"."fertilizer_application_logs" USING "btree" ("crop_name");



CREATE INDEX "idx_fertilizer_logs_date" ON "public"."fertilizer_application_logs" USING "btree" ("application_date" DESC);



CREATE INDEX "idx_fertilizer_logs_garden" ON "public"."fertilizer_application_logs" USING "btree" ("garden_id");



CREATE INDEX "idx_fertilizer_logs_type" ON "public"."fertilizer_application_logs" USING "btree" ("fertilizer_type");



CREATE INDEX "idx_fertilizer_logs_user" ON "public"."fertilizer_application_logs" USING "btree" ("user_id");



CREATE INDEX "idx_fertilizer_logs_zone" ON "public"."fertilizer_application_logs" USING "btree" ("zone_id");



CREATE INDEX "idx_field_rows_active" ON "public"."field_rows" USING "btree" ("is_active");



CREATE INDEX "idx_field_rows_garden" ON "public"."field_rows" USING "btree" ("garden_id");



CREATE INDEX "idx_field_rows_status" ON "public"."field_rows" USING "btree" ("status");



CREATE INDEX "idx_field_rows_zone" ON "public"."field_rows" USING "btree" ("zone_id");



CREATE INDEX "idx_garden_beds_garden_id" ON "public"."garden_beds" USING "btree" ("garden_id");



CREATE INDEX "idx_garden_correlations_garden" ON "public"."garden_correlations" USING "btree" ("garden_id");



CREATE INDEX "idx_garden_correlations_primary" ON "public"."garden_correlations" USING "btree" ("primary_crop");



CREATE INDEX "idx_garden_correlations_type" ON "public"."garden_correlations" USING "btree" ("correlation_type");



CREATE INDEX "idx_garden_correlations_user" ON "public"."garden_correlations" USING "btree" ("user_id");



CREATE INDEX "idx_garden_obstacles_azimuth" ON "public"."garden_obstacles" USING "btree" ("azimuth");



CREATE INDEX "idx_garden_obstacles_garden_id" ON "public"."garden_obstacles" USING "btree" ("garden_id");



CREATE INDEX "idx_garden_patterns_garden" ON "public"."garden_patterns" USING "btree" ("garden_id");



CREATE INDEX "idx_garden_patterns_public" ON "public"."garden_patterns" USING "btree" ("is_public");



CREATE INDEX "idx_garden_patterns_template" ON "public"."garden_patterns" USING "btree" ("is_template");



CREATE INDEX "idx_garden_patterns_type" ON "public"."garden_patterns" USING "btree" ("pattern_type");



CREATE INDEX "idx_garden_patterns_user" ON "public"."garden_patterns" USING "btree" ("user_id");



CREATE INDEX "idx_garden_plants_field_row_id" ON "public"."garden_plants" USING "btree" ("field_row_id");



CREATE INDEX "idx_garden_plants_garden_id" ON "public"."garden_plants" USING "btree" ("garden_id");



CREATE INDEX "idx_garden_plants_garden_status" ON "public"."garden_plants" USING "btree" ("garden_id", "status");



CREATE INDEX "idx_garden_plants_plant_name" ON "public"."garden_plants" USING "btree" ("plant_name");



CREATE INDEX "idx_garden_plants_plant_name_gin" ON "public"."garden_plants" USING "gin" ("to_tsvector"('"italian"'::"regconfig", "plant_name"));



CREATE INDEX "idx_garden_plants_planting_date" ON "public"."garden_plants" USING "btree" ("planting_date");



CREATE INDEX "idx_garden_plants_row_id" ON "public"."garden_plants" USING "btree" ("row_id");



CREATE INDEX "idx_garden_plants_row_position" ON "public"."garden_plants" USING "btree" (COALESCE("row_id", "field_row_id"), "position_in_row");



CREATE INDEX "idx_garden_plants_status" ON "public"."garden_plants" USING "btree" ("status");



CREATE INDEX "idx_garden_plants_variety_gin" ON "public"."garden_plants" USING "gin" ("to_tsvector"('"italian"'::"regconfig", COALESCE("variety", ''::"text")));



CREATE INDEX "idx_garden_rows_archetype" ON "public"."garden_rows" USING "btree" ("archetype_id");



CREATE INDEX "idx_garden_rows_planting" ON "public"."garden_rows" USING "btree" ("planting_date");



CREATE INDEX "idx_garden_rows_status" ON "public"."garden_rows" USING "btree" ("row_status");



CREATE INDEX "idx_garden_rows_user" ON "public"."garden_rows" USING "btree" ("user_id");



CREATE INDEX "idx_garden_rows_zone" ON "public"."garden_rows" USING "btree" ("garden_zone_id");



CREATE INDEX "idx_garden_season_analyses_garden" ON "public"."garden_season_analyses" USING "btree" ("garden_id");



CREATE INDEX "idx_garden_season_analyses_season" ON "public"."garden_season_analyses" USING "btree" ("season", "year");



CREATE INDEX "idx_garden_season_analyses_user" ON "public"."garden_season_analyses" USING "btree" ("user_id");



CREATE INDEX "idx_garden_tasks_auto_scheduled" ON "public"."garden_tasks" USING "btree" ("auto_scheduled") WHERE ("auto_scheduled" = true);



CREATE INDEX "idx_garden_tasks_bed_id" ON "public"."garden_tasks" USING "btree" ("bed_id");



CREATE INDEX "idx_garden_tasks_bed_row" ON "public"."garden_tasks" USING "btree" ("bed_row_id");



CREATE INDEX "idx_garden_tasks_blocking" ON "public"."garden_tasks" USING "btree" ("blocking_reason") WHERE ("blocking_reason" IS NOT NULL);



CREATE INDEX "idx_garden_tasks_completed" ON "public"."garden_tasks" USING "btree" ("completed");



CREATE INDEX "idx_garden_tasks_completed_scheduled_critical" ON "public"."garden_tasks" USING "btree" ("completed", "scheduled_date", "is_critical");



CREATE INDEX "idx_garden_tasks_critical" ON "public"."garden_tasks" USING "btree" ("is_critical") WHERE ("is_critical" = true);



CREATE INDEX "idx_garden_tasks_date" ON "public"."garden_tasks" USING "btree" ("date");



CREATE INDEX "idx_garden_tasks_field_row" ON "public"."garden_tasks" USING "btree" ("field_row_id");



CREATE INDEX "idx_garden_tasks_garden_completed_date" ON "public"."garden_tasks" USING "btree" ("garden_id", "completed", "date");



CREATE INDEX "idx_garden_tasks_garden_id" ON "public"."garden_tasks" USING "btree" ("garden_id");



CREATE INDEX "idx_garden_tasks_lunar_optimal" ON "public"."garden_tasks" USING "btree" ("lunar_optimal") WHERE ("lunar_optimal" = true);



CREATE INDEX "idx_garden_tasks_orchestrator_source" ON "public"."garden_tasks" USING "btree" ("orchestrator_source");



CREATE INDEX "idx_garden_tasks_parent_plan" ON "public"."garden_tasks" USING "btree" ("parent_plan_id") WHERE ("parent_plan_id" IS NOT NULL);



CREATE INDEX "idx_garden_tasks_plant_name" ON "public"."garden_tasks" USING "btree" ("plant_name");



CREATE INDEX "idx_garden_tasks_plant_season" ON "public"."garden_tasks" USING "btree" ("plant_name", "season") WHERE ("plant_name" IS NOT NULL);



CREATE INDEX "idx_garden_tasks_priority" ON "public"."garden_tasks" USING "btree" ("task_priority");



CREATE INDEX "idx_garden_tasks_sapling_batch_id" ON "public"."garden_tasks" USING "btree" ("sapling_batch_id") WHERE ("sapling_batch_id" IS NOT NULL);



CREATE INDEX "idx_garden_tasks_scheduled_date" ON "public"."garden_tasks" USING "btree" ("scheduled_date");



CREATE INDEX "idx_garden_tasks_seed_packet_id" ON "public"."garden_tasks" USING "btree" ("seed_packet_id") WHERE ("seed_packet_id" IS NOT NULL);



CREATE INDEX "idx_garden_tasks_seedling_batch_id" ON "public"."garden_tasks" USING "btree" ("seedling_batch_id") WHERE ("seedling_batch_id" IS NOT NULL);



CREATE INDEX "idx_garden_tasks_suggested" ON "public"."garden_tasks" USING "btree" ("is_suggested") WHERE ("is_suggested" = true);



CREATE INDEX "idx_garden_tasks_suggested_date" ON "public"."garden_tasks" USING "btree" ("suggested_date") WHERE ("suggested_date" IS NOT NULL);



CREATE INDEX "idx_garden_tasks_task_type" ON "public"."garden_tasks" USING "btree" ("task_type");



CREATE INDEX "idx_garden_tasks_weather_dependent" ON "public"."garden_tasks" USING "btree" ("weather_dependent") WHERE ("weather_dependent" = true);



CREATE INDEX "idx_garden_tasks_zone_id" ON "public"."garden_tasks" USING "btree" ("zone_id") WHERE ("zone_id" IS NOT NULL);



CREATE INDEX "idx_garden_tree_memories_active" ON "public"."garden_tree_memories" USING "btree" ("is_active");



CREATE INDEX "idx_garden_tree_memories_archetype" ON "public"."garden_tree_memories" USING "btree" ("archetype_id");



CREATE INDEX "idx_garden_tree_memories_garden" ON "public"."garden_tree_memories" USING "btree" ("garden_id");



CREATE INDEX "idx_garden_tree_memories_user" ON "public"."garden_tree_memories" USING "btree" ("user_id");



CREATE INDEX "idx_garden_zone_memories_date" ON "public"."garden_zone_memories" USING "btree" ("memory_date");



CREATE INDEX "idx_garden_zone_memories_tags" ON "public"."garden_zone_memories" USING "gin" ("tags");



CREATE INDEX "idx_garden_zone_memories_type" ON "public"."garden_zone_memories" USING "btree" ("memory_type");



CREATE INDEX "idx_garden_zone_memories_user" ON "public"."garden_zone_memories" USING "btree" ("user_id");



CREATE INDEX "idx_garden_zone_memories_zone" ON "public"."garden_zone_memories" USING "btree" ("garden_zone_id");



CREATE INDEX "idx_garden_zones_garden" ON "public"."garden_zones" USING "btree" ("garden_id");



CREATE INDEX "idx_garden_zones_garden_id_kind" ON "public"."garden_zones" USING "btree" ("garden_id", "zone_kind");



CREATE INDEX "idx_garden_zones_order" ON "public"."garden_zones" USING "btree" ("garden_id", "order_index");



CREATE INDEX "idx_garden_zones_primary_cultivar" ON "public"."garden_zones" USING "btree" ("primary_cultivar");



CREATE INDEX "idx_gardens_created_at" ON "public"."gardens" USING "btree" ("created_at");



CREATE INDEX "idx_gardens_olive_grove_config" ON "public"."gardens" USING "gin" ("olive_grove_config");



CREATE INDEX "idx_gardens_orchard_config" ON "public"."gardens" USING "gin" ("orchard_config");



CREATE INDEX "idx_gardens_user_id" ON "public"."gardens" USING "btree" ("user_id");



CREATE INDEX "idx_gardens_vineyard_config" ON "public"."gardens" USING "gin" ("vineyard_config");



CREATE INDEX "idx_globalgap_compliance_checklist_control_point" ON "public"."globalgap_compliance_checklist" USING "btree" ("control_point");



CREATE INDEX "idx_globalgap_compliance_checklist_garden_id" ON "public"."globalgap_compliance_checklist" USING "btree" ("garden_id");



CREATE INDEX "idx_globalgap_compliance_checklist_status" ON "public"."globalgap_compliance_checklist" USING "btree" ("compliance_status");



CREATE INDEX "idx_globalgap_ggn_codes_active" ON "public"."globalgap_ggn_codes" USING "btree" ("is_active");



CREATE INDEX "idx_globalgap_ggn_codes_garden_id" ON "public"."globalgap_ggn_codes" USING "btree" ("garden_id");



CREATE INDEX "idx_globalgap_ggn_codes_ggn" ON "public"."globalgap_ggn_codes" USING "btree" ("ggn_code");



CREATE INDEX "idx_globalgap_health_safety_managers_active" ON "public"."globalgap_health_safety_managers" USING "btree" ("is_active");



CREATE INDEX "idx_globalgap_health_safety_managers_garden_id" ON "public"."globalgap_health_safety_managers" USING "btree" ("garden_id");



CREATE INDEX "idx_globalgap_recall_procedures_garden_id" ON "public"."globalgap_recall_procedures" USING "btree" ("garden_id");



CREATE INDEX "idx_globalgap_recall_procedures_updated" ON "public"."globalgap_recall_procedures" USING "btree" ("last_updated" DESC);



CREATE INDEX "idx_globalgap_risk_management_plans_garden_id" ON "public"."globalgap_risk_management_plans" USING "btree" ("garden_id");



CREATE INDEX "idx_globalgap_risk_management_plans_level" ON "public"."globalgap_risk_management_plans" USING "btree" ("risk_level");



CREATE INDEX "idx_globalgap_risk_management_plans_score" ON "public"."globalgap_risk_management_plans" USING "btree" ("risk_score" DESC);



CREATE INDEX "idx_globalgap_self_assessments_date" ON "public"."globalgap_self_assessments" USING "btree" ("assessment_date" DESC);



CREATE INDEX "idx_globalgap_self_assessments_garden_id" ON "public"."globalgap_self_assessments" USING "btree" ("garden_id");



CREATE INDEX "idx_haccp_ccp_garden_id" ON "public"."haccp_critical_control_points" USING "btree" ("garden_id");



CREATE INDEX "idx_haccp_hazard_analysis_garden_id" ON "public"."haccp_hazard_analysis" USING "btree" ("garden_id");



CREATE INDEX "idx_haccp_systems_garden_id" ON "public"."haccp_systems" USING "btree" ("garden_id");



CREATE INDEX "idx_haccp_team_members_garden_id" ON "public"."haccp_team_members" USING "btree" ("garden_id");



CREATE INDEX "idx_harvest_logs_garden_date" ON "public"."harvest_logs" USING "btree" ("garden_id", "harvest_date");



CREATE INDEX "idx_harvest_logs_garden_id" ON "public"."harvest_logs" USING "btree" ("garden_id");



CREATE INDEX "idx_harvest_logs_harvest_date" ON "public"."harvest_logs" USING "btree" ("harvest_date");



CREATE INDEX "idx_harvest_logs_plant_name" ON "public"."harvest_logs" USING "btree" ("plant_name");



CREATE INDEX "idx_harvest_logs_plant_quantity" ON "public"."harvest_logs" USING "btree" ("plant_name", "quantity") WHERE ("plant_name" IS NOT NULL);



CREATE INDEX "idx_harvest_logs_task_id" ON "public"."harvest_logs" USING "btree" ("task_id");



CREATE INDEX "idx_hydroponic_readings_garden_date" ON "public"."hydroponic_readings" USING "btree" ("garden_id", "reading_date" DESC);



CREATE INDEX "idx_irrigation_components_zone" ON "public"."irrigation_components" USING "btree" ("zone_id");



CREATE INDEX "idx_irrigation_logs_date_sync" ON "public"."irrigation_logs" USING "btree" ("irrigation_date" DESC);



CREATE INDEX "idx_irrigation_logs_garden_id" ON "public"."irrigation_logs" USING "btree" ("garden_id");



CREATE INDEX "idx_irrigation_logs_garden_sync" ON "public"."irrigation_logs" USING "btree" ("garden_id");



CREATE INDEX "idx_irrigation_logs_irrigation_date" ON "public"."irrigation_logs" USING "btree" ("irrigation_date");



CREATE INDEX "idx_irrigation_logs_system_sync" ON "public"."irrigation_logs" USING "btree" ("system_id");



CREATE INDEX "idx_irrigation_logs_user_sync" ON "public"."irrigation_logs" USING "btree" ("user_id");



CREATE INDEX "idx_irrigation_systems_bed_ids" ON "public"."irrigation_systems" USING "gin" ("bed_ids");



CREATE INDEX "idx_irrigation_systems_cultivation_type" ON "public"."irrigation_systems" USING "btree" ("cultivation_type");



CREATE INDEX "idx_irrigation_systems_garden" ON "public"."irrigation_systems" USING "btree" ("garden_id");



CREATE INDEX "idx_irrigation_systems_garden_id" ON "public"."irrigation_systems" USING "btree" ("garden_id");



CREATE INDEX "idx_irrigation_systems_garden_sync" ON "public"."irrigation_systems" USING "btree" ("garden_id");



CREATE INDEX "idx_irrigation_systems_row_ids" ON "public"."irrigation_systems" USING "gin" ("row_ids");



CREATE INDEX "idx_irrigation_systems_status_fix" ON "public"."irrigation_systems" USING "btree" ("status");



CREATE INDEX "idx_irrigation_systems_user_sync" ON "public"."irrigation_systems" USING "btree" ("user_id");



CREATE INDEX "idx_irrigation_zones_garden" ON "public"."irrigation_zones" USING "btree" ("garden_id");



CREATE INDEX "idx_irrigation_zones_system" ON "public"."irrigation_zones" USING "btree" ("system_id");



CREATE INDEX "idx_irrigation_zones_valve" ON "public"."irrigation_zones" USING "btree" ("valve_id") WHERE ("valve_id" IS NOT NULL);



CREATE INDEX "idx_mechanical_work_bed" ON "public"."mechanical_work_register" USING "btree" ("bed_id");



CREATE INDEX "idx_mechanical_work_bed_row" ON "public"."mechanical_work_register" USING "btree" ("bed_row_id");



CREATE INDEX "idx_mechanical_work_date" ON "public"."mechanical_work_register" USING "btree" ("work_date" DESC);



CREATE INDEX "idx_mechanical_work_date_sync" ON "public"."mechanical_work_register" USING "btree" ("work_date" DESC);



CREATE INDEX "idx_mechanical_work_field_row" ON "public"."mechanical_work_register" USING "btree" ("field_row_id");



CREATE INDEX "idx_mechanical_work_garden" ON "public"."mechanical_work_register" USING "btree" ("garden_id");



CREATE INDEX "idx_mechanical_work_garden_sync" ON "public"."mechanical_work_register" USING "btree" ("garden_id");



CREATE INDEX "idx_mechanical_work_register_field_row" ON "public"."mechanical_work_register" USING "btree" ("field_row_id");



CREATE INDEX "idx_mechanical_work_register_garden_id" ON "public"."mechanical_work_register" USING "btree" ("garden_id");



CREATE INDEX "idx_mechanical_work_register_plant_ids" ON "public"."mechanical_work_register" USING "gin" ("plant_ids");



CREATE INDEX "idx_mechanical_work_register_work_date" ON "public"."mechanical_work_register" USING "btree" ("work_date");



CREATE INDEX "idx_mechanical_work_register_work_type" ON "public"."mechanical_work_register" USING "btree" ("work_type");



CREATE INDEX "idx_mechanical_work_sequences_archetype" ON "public"."mechanical_work_sequences" USING "btree" ("archetype_id");



CREATE INDEX "idx_mechanical_work_sequences_crop" ON "public"."mechanical_work_sequences" USING "btree" ("crop_name");



CREATE INDEX "idx_mechanical_work_sequences_season" ON "public"."mechanical_work_sequences" USING "btree" ("season");



CREATE INDEX "idx_mechanical_work_sequences_template" ON "public"."mechanical_work_sequences" USING "btree" ("is_template");



CREATE INDEX "idx_mechanical_work_sequences_user" ON "public"."mechanical_work_sequences" USING "btree" ("user_id");



CREATE INDEX "idx_mechanical_work_type" ON "public"."mechanical_work_register" USING "btree" ("work_type");



CREATE INDEX "idx_mechanical_work_type_sync" ON "public"."mechanical_work_register" USING "btree" ("work_type");



CREATE INDEX "idx_mechanical_work_user" ON "public"."mechanical_work_register" USING "btree" ("user_id");



CREATE INDEX "idx_mechanical_work_user_sync" ON "public"."mechanical_work_register" USING "btree" ("user_id");



CREATE INDEX "idx_mechanical_work_zone" ON "public"."mechanical_work_register" USING "btree" ("zone_id");



CREATE INDEX "idx_notification_preferences_user_id" ON "public"."notification_preferences" USING "btree" ("user_id");



CREATE INDEX "idx_organic_certifications_garden_id" ON "public"."organic_certifications" USING "btree" ("garden_id");



CREATE INDEX "idx_organic_inputs_date" ON "public"."organic_inputs_register" USING "btree" ("date");



CREATE INDEX "idx_organic_inputs_garden_id" ON "public"."organic_inputs_register" USING "btree" ("garden_id");



CREATE INDEX "idx_organic_sales_date" ON "public"."organic_sales_register" USING "btree" ("date");



CREATE INDEX "idx_organic_sales_garden_id" ON "public"."organic_sales_register" USING "btree" ("garden_id");



CREATE INDEX "idx_phase_transitions_date" ON "public"."phase_transitions" USING "btree" ("transition_date" DESC);



CREATE INDEX "idx_phase_transitions_plan" ON "public"."phase_transitions" USING "btree" ("cultivation_plan_id");



CREATE INDEX "idx_phase_transitions_plan_date_desc" ON "public"."phase_transitions" USING "btree" ("cultivation_plan_id", "transition_date" DESC);



CREATE INDEX "idx_photo_logs_garden_id" ON "public"."photo_logs" USING "btree" ("garden_id");



CREATE INDEX "idx_photo_logs_photo_date" ON "public"."photo_logs" USING "btree" ("photo_date");



CREATE INDEX "idx_photo_logs_task_id" ON "public"."photo_logs" USING "btree" ("task_id");



CREATE INDEX "idx_phyto_inventory_expiry_date" ON "public"."phyto_inventory" USING "btree" ("expiry_date");



CREATE INDEX "idx_phyto_inventory_expiry_sync" ON "public"."phyto_inventory" USING "btree" ("expiry_date");



CREATE INDEX "idx_phyto_inventory_garden" ON "public"."phyto_inventory" USING "btree" ("garden_id");



CREATE INDEX "idx_phyto_inventory_garden_id" ON "public"."phyto_inventory" USING "btree" ("garden_id");



CREATE INDEX "idx_phyto_inventory_garden_sync" ON "public"."phyto_inventory" USING "btree" ("garden_id");



CREATE INDEX "idx_phyto_inventory_product_sync" ON "public"."phyto_inventory" USING "btree" ("product_name");



CREATE INDEX "idx_phyto_inventory_product_type" ON "public"."phyto_inventory" USING "btree" ("product_type");



CREATE INDEX "idx_phyto_inventory_type" ON "public"."phyto_inventory" USING "btree" ("product_type");



CREATE INDEX "idx_phyto_inventory_updated" ON "public"."phyto_inventory" USING "btree" ("updated_at" DESC);



CREATE INDEX "idx_phyto_inventory_user" ON "public"."phyto_inventory" USING "btree" ("user_id");



CREATE INDEX "idx_phyto_inventory_user_sync" ON "public"."phyto_inventory" USING "btree" ("user_id");



CREATE INDEX "idx_plant_families_name" ON "public"."plant_families" USING "btree" ("name");



CREATE INDEX "idx_plant_harvests_garden_id" ON "public"."plant_harvests" USING "btree" ("garden_id");



CREATE INDEX "idx_plant_harvests_harvest_date" ON "public"."plant_harvests" USING "btree" ("harvest_date");



CREATE INDEX "idx_plant_harvests_plant_date" ON "public"."plant_harvests" USING "btree" ("plant_id", "harvest_date" DESC);



CREATE INDEX "idx_plant_harvests_plant_id" ON "public"."plant_harvests" USING "btree" ("plant_id");



CREATE INDEX "idx_plant_operations_garden_id" ON "public"."plant_operations" USING "btree" ("garden_id");



CREATE INDEX "idx_plant_operations_operation_date" ON "public"."plant_operations" USING "btree" ("operation_date");



CREATE INDEX "idx_plant_operations_operation_type" ON "public"."plant_operations" USING "btree" ("operation_type");



CREATE INDEX "idx_plant_operations_plant_date" ON "public"."plant_operations" USING "btree" ("plant_id", "operation_date" DESC);



CREATE INDEX "idx_plant_operations_plant_id" ON "public"."plant_operations" USING "btree" ("plant_id");



CREATE INDEX "idx_planting_batches_expected_harvest" ON "public"."planting_batches" USING "btree" ("expected_harvest_date");



CREATE INDEX "idx_planting_batches_field_row" ON "public"."planting_batches" USING "btree" ("field_row_id");



CREATE INDEX "idx_planting_batches_garden" ON "public"."planting_batches" USING "btree" ("garden_id");



CREATE INDEX "idx_planting_batches_priority_date" ON "public"."planting_batches" USING "btree" (COALESCE("sowing_date", "transplanting_date", "expected_harvest_date"));



CREATE INDEX "idx_planting_batches_sowing_date" ON "public"."planting_batches" USING "btree" ("sowing_date");



CREATE INDEX "idx_planting_batches_status" ON "public"."planting_batches" USING "btree" ("status");



CREATE INDEX "idx_professional_analytics_expires" ON "public"."professional_analytics" USING "btree" ("expires_at");



CREATE INDEX "idx_professional_analytics_garden" ON "public"."professional_analytics" USING "btree" ("garden_id");



CREATE INDEX "idx_professional_analytics_period" ON "public"."professional_analytics" USING "btree" ("period_start", "period_end");



CREATE INDEX "idx_professional_analytics_type" ON "public"."professional_analytics" USING "btree" ("analysis_type");



CREATE INDEX "idx_professional_analytics_user" ON "public"."professional_analytics" USING "btree" ("user_id");



CREATE INDEX "idx_profiles_archetype" ON "public"."crop_profiles" USING "btree" ("archetype_id");



CREATE INDEX "idx_profiles_created_at" ON "public"."profiles" USING "btree" ("created_at");



CREATE INDEX "idx_profiles_email_verified" ON "public"."profiles" USING "btree" ("email_verified");



CREATE INDEX "idx_profiles_onboarding_completed" ON "public"."profiles" USING "btree" ("onboarding_completed");



CREATE INDEX "idx_profiles_onboarding_status" ON "public"."profiles" USING "btree" ("onboarding_completed", "email_verified");



CREATE INDEX "idx_profiles_phone_verified" ON "public"."profiles" USING "btree" ("phone_verified");



CREATE INDEX "idx_profiles_tier" ON "public"."profiles" USING "btree" ("tier");



CREATE INDEX "idx_profiles_tier_email_verified" ON "public"."profiles" USING "btree" ("tier", "email_verified");



CREATE INDEX "idx_rules_archetype" ON "public"."plant_rules" USING "btree" ("archetype_id");



CREATE INDEX "idx_rules_family" ON "public"."plant_rules" USING "btree" ("family_id");



CREATE INDEX "idx_rules_type" ON "public"."plant_rules" USING "btree" ("rule_type");



CREATE INDEX "idx_sapling_batches_garden_id" ON "public"."sapling_batches" USING "btree" ("garden_id");



CREATE INDEX "idx_sapling_batches_phase" ON "public"."sapling_batches" USING "btree" ("phase");



CREATE INDEX "idx_sapling_batches_purchase_date" ON "public"."sapling_batches" USING "btree" ("purchase_date");



CREATE INDEX "idx_sapling_batches_sapling_type" ON "public"."sapling_batches" USING "btree" ("sapling_type");



CREATE INDEX "idx_sapling_inventory_garden" ON "public"."sapling_inventory" USING "btree" ("garden_id");



CREATE INDEX "idx_seed_inventory_expiry_year" ON "public"."seed_inventory" USING "btree" ("expiry_year");



CREATE INDEX "idx_seed_inventory_garden_id" ON "public"."seed_inventory" USING "btree" ("garden_id");



CREATE INDEX "idx_seed_inventory_garden_species" ON "public"."seed_inventory" USING "btree" ("garden_id", "species_name");



CREATE INDEX "idx_seed_inventory_user_id" ON "public"."seed_inventory" USING "btree" ("user_id");



CREATE INDEX "idx_seedling_batches_garden_id" ON "public"."seedling_batches" USING "btree" ("garden_id");



CREATE INDEX "idx_seedling_batches_phase" ON "public"."seedling_batches" USING "btree" ("phase");



CREATE INDEX "idx_seedling_batches_sowing_date" ON "public"."seedling_batches" USING "btree" ("sowing_date");



CREATE INDEX "idx_sensor_readings_garden" ON "public"."sensor_readings" USING "btree" ("garden_id");



CREATE INDEX "idx_sensor_readings_location" ON "public"."sensor_readings" USING "btree" ("sensor_location");



CREATE INDEX "idx_sensor_readings_recorded" ON "public"."sensor_readings" USING "btree" ("recorded_at");



CREATE INDEX "idx_sensor_readings_type" ON "public"."sensor_readings" USING "btree" ("sensor_type");



CREATE INDEX "idx_sensor_readings_user" ON "public"."sensor_readings" USING "btree" ("user_id");



CREATE INDEX "idx_soil_analysis_date" ON "public"."soil_analysis" USING "btree" ("analysis_date");



CREATE INDEX "idx_soil_analysis_garden" ON "public"."soil_analysis" USING "btree" ("garden_id");



CREATE INDEX "idx_soil_analysis_user" ON "public"."soil_analysis" USING "btree" ("user_id");



CREATE INDEX "idx_soil_analysis_zone" ON "public"."soil_analysis" USING "btree" ("garden_zone_id");



CREATE INDEX "idx_supplier_certifications_supplier_id" ON "public"."supplier_certifications" USING "btree" ("supplier_id");



CREATE INDEX "idx_synonyms_locale" ON "public"."plant_synonyms" USING "btree" ("locale");



CREATE INDEX "idx_synonyms_locale_plant" ON "public"."plant_synonyms" USING "btree" ("locale", "plant_id");



CREATE INDEX "idx_synonyms_normalized" ON "public"."plant_synonyms" USING "btree" ("normalized_synonym");



CREATE INDEX "idx_synonyms_plant" ON "public"."plant_synonyms" USING "btree" ("plant_id");



CREATE INDEX "idx_synonyms_text" ON "public"."plant_synonyms" USING "btree" ("synonym");



CREATE INDEX "idx_synonyms_trgm" ON "public"."plant_synonyms" USING "gin" ("normalized_synonym" "public"."gin_trgm_ops");



CREATE INDEX "idx_tasks_archetype" ON "public"."garden_tasks" USING "btree" ("archetype_id");



CREATE INDEX "idx_taxonomy_archetype" ON "public"."plant_taxonomy" USING "btree" ("archetype_id");



CREATE INDEX "idx_taxonomy_category" ON "public"."plant_taxonomy" USING "btree" ("functional_category");



CREATE INDEX "idx_taxonomy_family" ON "public"."plant_taxonomy" USING "btree" ("family_id");



CREATE INDEX "idx_taxonomy_names" ON "public"."plant_taxonomy" USING "gin" ("names");



CREATE INDEX "idx_taxonomy_names_trgm" ON "public"."plant_taxonomy" USING "gin" ((("names" ->> 'it'::"text")) "public"."gin_trgm_ops");



CREATE INDEX "idx_training_materials_program_id" ON "public"."training_materials" USING "btree" ("program_id");



CREATE INDEX "idx_training_participants_program_id" ON "public"."training_participants" USING "btree" ("program_id");



CREATE INDEX "idx_training_programs_garden_id" ON "public"."training_programs" USING "btree" ("garden_id");



CREATE INDEX "idx_treatment_bed" ON "public"."treatment_register" USING "btree" ("bed_id");



CREATE INDEX "idx_treatment_bed_row" ON "public"."treatment_register" USING "btree" ("bed_row_id");



CREATE INDEX "idx_treatment_field_row" ON "public"."treatment_register" USING "btree" ("field_row_id");



CREATE INDEX "idx_treatment_register_crop" ON "public"."treatment_register" USING "btree" ("crop_name");



CREATE INDEX "idx_treatment_register_date" ON "public"."treatment_register" USING "btree" ("treatment_date" DESC);



CREATE INDEX "idx_treatment_register_field_row" ON "public"."treatment_register" USING "btree" ("field_row_id");



CREATE INDEX "idx_treatment_register_garden" ON "public"."treatment_register" USING "btree" ("garden_id");



CREATE INDEX "idx_treatment_register_organic_approved" ON "public"."treatment_register" USING "btree" ("organic_approved");



CREATE INDEX "idx_treatment_register_plant_ids" ON "public"."treatment_register" USING "gin" ("plant_ids");



CREATE INDEX "idx_treatment_register_type" ON "public"."treatment_register" USING "btree" ("treatment_type");



CREATE INDEX "idx_treatment_register_user" ON "public"."treatment_register" USING "btree" ("user_id");



CREATE INDEX "idx_treatment_register_zone" ON "public"."treatment_register" USING "btree" ("zone_id");



CREATE INDEX "idx_treatment_registry_category" ON "public"."treatment_registry" USING "btree" ("treatment_category");



CREATE INDEX "idx_treatment_registry_date" ON "public"."treatment_registry" USING "btree" ("application_date");



CREATE INDEX "idx_treatment_registry_target" ON "public"."treatment_registry" USING "btree" ("target_pest_disease");



CREATE INDEX "idx_treatment_registry_user" ON "public"."treatment_registry" USING "btree" ("user_id");



CREATE INDEX "idx_treatment_registry_zone" ON "public"."treatment_registry" USING "btree" ("garden_zone_id");



CREATE INDEX "idx_user_badges_badge" ON "public"."user_badges" USING "btree" ("badge_id");



CREATE INDEX "idx_user_badges_category" ON "public"."user_badges" USING "btree" ("badge_category");



CREATE INDEX "idx_user_badges_earned" ON "public"."user_badges" USING "btree" ("earned_at");



CREATE INDEX "idx_user_badges_rarity" ON "public"."user_badges" USING "btree" ("rarity");



CREATE INDEX "idx_user_badges_user" ON "public"."user_badges" USING "btree" ("user_id");



CREATE INDEX "idx_vegetation_indices_date" ON "public"."vegetation_indices" USING "btree" ("measurement_date");



CREATE INDEX "idx_vegetation_indices_method" ON "public"."vegetation_indices" USING "btree" ("measurement_method");



CREATE INDEX "idx_vegetation_indices_user" ON "public"."vegetation_indices" USING "btree" ("user_id");



CREATE INDEX "idx_vegetation_indices_zone" ON "public"."vegetation_indices" USING "btree" ("garden_zone_id");



CREATE INDEX "idx_watering_logs_bed" ON "public"."watering_logs" USING "btree" ("bed_id");



CREATE INDEX "idx_watering_logs_bed_row" ON "public"."watering_logs" USING "btree" ("bed_row_id");



CREATE INDEX "idx_watering_logs_date" ON "public"."watering_logs" USING "btree" ("date");



CREATE INDEX "idx_watering_logs_field_row" ON "public"."watering_logs" USING "btree" ("field_row_id");



CREATE INDEX "idx_watering_logs_garden" ON "public"."watering_logs" USING "btree" ("garden_id");



CREATE INDEX "idx_watering_logs_plant_ids" ON "public"."watering_logs" USING "gin" ("plant_ids");



CREATE INDEX "idx_watering_logs_watered_at" ON "public"."watering_logs" USING "btree" ("watered_at" DESC);



CREATE INDEX "idx_watering_logs_zone" ON "public"."watering_logs" USING "btree" ("zone_id");



CREATE INDEX "idx_watering_logs_zone_date" ON "public"."watering_logs" USING "btree" ("zone_id", "date");



CREATE INDEX "idx_weather_cache_cached_at" ON "public"."weather_cache" USING "btree" ("cached_at");



CREATE INDEX "idx_weather_cache_expires_at" ON "public"."weather_cache" USING "btree" ("expires_at");



CREATE INDEX "idx_weather_cache_lat_lng_date" ON "public"."weather_cache" USING "btree" ("lat_lng", "date");



CREATE INDEX "idx_weather_reschedule_logs_automatic" ON "public"."weather_reschedule_logs" USING "btree" ("automatic_reschedule");



CREATE INDEX "idx_weather_reschedule_logs_original_date" ON "public"."weather_reschedule_logs" USING "btree" ("original_date");



CREATE INDEX "idx_weather_reschedule_logs_reason" ON "public"."weather_reschedule_logs" USING "btree" ("weather_reason");



CREATE INDEX "idx_weather_reschedule_logs_task" ON "public"."weather_reschedule_logs" USING "btree" ("original_task_id");



CREATE INDEX "idx_weather_reschedule_logs_user" ON "public"."weather_reschedule_logs" USING "btree" ("user_id");



CREATE INDEX "idx_yield_predictions_archetype" ON "public"."yield_predictions" USING "btree" ("archetype_id");



CREATE INDEX "idx_yield_predictions_harvest" ON "public"."yield_predictions" USING "btree" ("predicted_harvest_date");



CREATE INDEX "idx_yield_predictions_planting" ON "public"."yield_predictions" USING "btree" ("planting_date");



CREATE INDEX "idx_yield_predictions_user" ON "public"."yield_predictions" USING "btree" ("user_id");



CREATE INDEX "idx_yield_predictions_zone" ON "public"."yield_predictions" USING "btree" ("garden_zone_id");



CREATE OR REPLACE TRIGGER "auto_consume_seeds" AFTER INSERT ON "public"."cultivation_plans" FOR EACH ROW EXECUTE FUNCTION "public"."consume_seed_inventory"();



CREATE OR REPLACE TRIGGER "auto_manage_saplings" AFTER INSERT ON "public"."cultivation_plans" FOR EACH ROW EXECUTE FUNCTION "public"."manage_sapling_inventory"();



CREATE OR REPLACE TRIGGER "auto_stats_on_harvest" AFTER UPDATE ON "public"."cultivation_plans" FOR EACH ROW EXECUTE FUNCTION "public"."auto_calculate_statistics"();



CREATE OR REPLACE TRIGGER "auto_update_plan_from_transition" AFTER INSERT ON "public"."phase_transitions" FOR EACH ROW EXECUTE FUNCTION "public"."update_plan_quantity_from_transition"();



CREATE OR REPLACE TRIGGER "sync_plant_operations_trigger" AFTER INSERT ON "public"."plant_operations" FOR EACH ROW EXECUTE FUNCTION "public"."sync_plant_operations_to_main_tables"();



CREATE OR REPLACE TRIGGER "trigger_calculate_field_row_plant_count" BEFORE INSERT OR UPDATE ON "public"."field_rows" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_field_row_plant_count"();



CREATE OR REPLACE TRIGGER "trigger_field_rows_updated_at" BEFORE UPDATE ON "public"."field_rows" FOR EACH ROW EXECUTE FUNCTION "public"."update_field_rows_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_record_actual_completion" BEFORE UPDATE ON "public"."garden_tasks" FOR EACH ROW EXECUTE FUNCTION "public"."record_actual_completion"();



CREATE OR REPLACE TRIGGER "trigger_sync_scheduled_date" BEFORE INSERT OR UPDATE ON "public"."garden_tasks" FOR EACH ROW EXECUTE FUNCTION "public"."sync_scheduled_date"();



CREATE OR REPLACE TRIGGER "trigger_update_api_configurations_updated_at" BEFORE UPDATE ON "public"."api_configurations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_calendar_tasks_updated_at" BEFORE UPDATE ON "public"."calendar_tasks" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_challenge_completions_updated_at" BEFORE UPDATE ON "public"."challenge_completions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_crop_learning_events_updated_at" BEFORE UPDATE ON "public"."crop_learning_events" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_crop_mechanical_works_updated_at" BEFORE UPDATE ON "public"."crop_mechanical_works" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_custom_crops_updated_at" BEFORE UPDATE ON "public"."custom_crops" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_field_row_on_mechanical_work" AFTER INSERT OR UPDATE ON "public"."mechanical_work_register" FOR EACH ROW EXECUTE FUNCTION "public"."update_field_row_on_mechanical_work"();



CREATE OR REPLACE TRIGGER "trigger_update_field_row_on_treatment" AFTER INSERT OR UPDATE ON "public"."treatment_register" FOR EACH ROW EXECUTE FUNCTION "public"."update_field_row_on_treatment"();



CREATE OR REPLACE TRIGGER "trigger_update_garden_correlations_updated_at" BEFORE UPDATE ON "public"."garden_correlations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_garden_patterns_updated_at" BEFORE UPDATE ON "public"."garden_patterns" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_garden_rows_updated_at" BEFORE UPDATE ON "public"."garden_rows" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_garden_tree_memories_updated_at" BEFORE UPDATE ON "public"."garden_tree_memories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_haccp_certification" AFTER INSERT OR UPDATE ON "public"."haccp_systems" FOR EACH ROW EXECUTE FUNCTION "public"."update_haccp_certification_status"();



CREATE OR REPLACE TRIGGER "trigger_update_irrigation_systems_updated_at_sync" BEFORE UPDATE ON "public"."irrigation_systems" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column_sync"();



CREATE OR REPLACE TRIGGER "trigger_update_mechanical_work_sequences_updated_at" BEFORE UPDATE ON "public"."mechanical_work_sequences" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_organic_certification" AFTER INSERT OR UPDATE ON "public"."organic_certifications" FOR EACH ROW EXECUTE FUNCTION "public"."update_organic_certification_status"();



CREATE OR REPLACE TRIGGER "trigger_update_phyto_inventory_updated_at_sync" BEFORE UPDATE ON "public"."phyto_inventory" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column_sync"();



CREATE OR REPLACE TRIGGER "trigger_update_plant_synonyms_updated_at" BEFORE UPDATE ON "public"."plant_synonyms" FOR EACH ROW EXECUTE FUNCTION "public"."update_plant_taxonomy_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_plant_taxonomy_updated_at" BEFORE UPDATE ON "public"."plant_taxonomy" FOR EACH ROW EXECUTE FUNCTION "public"."update_plant_taxonomy_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_yield_predictions_updated_at" BEFORE UPDATE ON "public"."yield_predictions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_zone_last_watered" AFTER INSERT ON "public"."watering_logs" FOR EACH ROW EXECUTE FUNCTION "public"."update_zone_last_watered"();



CREATE OR REPLACE TRIGGER "update_agronomists_updated_at" BEFORE UPDATE ON "public"."agronomists" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_cultivation_plans_updated_at" BEFORE UPDATE ON "public"."cultivation_plans" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_custom_plans_updated_at" BEFORE UPDATE ON "public"."custom_plans" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_field_rows_calculated_plants" BEFORE INSERT OR UPDATE ON "public"."field_rows" FOR EACH ROW EXECUTE FUNCTION "public"."update_calculated_plants"();



CREATE OR REPLACE TRIGGER "update_garden_beds_updated_at" BEFORE UPDATE ON "public"."garden_beds" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_garden_obstacles_updated_at" BEFORE UPDATE ON "public"."garden_obstacles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_garden_plants_updated_at" BEFORE UPDATE ON "public"."garden_plants" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_garden_rows_calculated_plants" BEFORE INSERT OR UPDATE ON "public"."garden_rows" FOR EACH ROW EXECUTE FUNCTION "public"."update_calculated_plants"();



CREATE OR REPLACE TRIGGER "update_garden_tasks_updated_at" BEFORE UPDATE ON "public"."garden_tasks" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_garden_zones_updated_at" BEFORE UPDATE ON "public"."garden_zones" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_gardens_updated_at" BEFORE UPDATE ON "public"."gardens" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_globalgap_compliance_checklist_updated_at" BEFORE UPDATE ON "public"."globalgap_compliance_checklist" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_globalgap_ggn_codes_updated_at" BEFORE UPDATE ON "public"."globalgap_ggn_codes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_globalgap_health_safety_managers_updated_at" BEFORE UPDATE ON "public"."globalgap_health_safety_managers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_globalgap_risk_management_plans_updated_at" BEFORE UPDATE ON "public"."globalgap_risk_management_plans" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_globalgap_self_assessments_updated_at" BEFORE UPDATE ON "public"."globalgap_self_assessments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_irrigation_systems_updated_at" BEFORE UPDATE ON "public"."irrigation_systems" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_irrigation_zones_updated_at" BEFORE UPDATE ON "public"."irrigation_zones" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_mechanical_work_register_updated_at" BEFORE UPDATE ON "public"."mechanical_work_register" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_notification_preferences_updated_at" BEFORE UPDATE ON "public"."notification_preferences" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_phyto_inventory_updated_at" BEFORE UPDATE ON "public"."phyto_inventory" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_plant_operations_updated_at" BEFORE UPDATE ON "public"."plant_operations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_sapling_batches_updated_at" BEFORE UPDATE ON "public"."sapling_batches" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_sapling_inventory_updated_at" BEFORE UPDATE ON "public"."sapling_inventory" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_seed_inventory_updated_at" BEFORE UPDATE ON "public"."seed_inventory" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_seedling_batches_updated_at" BEFORE UPDATE ON "public"."seedling_batches" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."agronomist_advice"
    ADD CONSTRAINT "agronomist_advice_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "public"."agronomist_consultations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agronomist_advice"
    ADD CONSTRAINT "agronomist_advice_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."garden_tasks"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."agronomist_consultations"
    ADD CONSTRAINT "agronomist_consultations_agronomist_id_fkey" FOREIGN KEY ("agronomist_id") REFERENCES "public"."agronomists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agronomist_consultations"
    ADD CONSTRAINT "agronomist_consultations_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."agronomist_consultations"
    ADD CONSTRAINT "agronomist_consultations_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."garden_tasks"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."agronomist_consultations"
    ADD CONSTRAINT "agronomist_consultations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agronomists"
    ADD CONSTRAINT "agronomists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_credit_transactions"
    ADD CONSTRAINT "ai_credit_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."api_configurations"
    ADD CONSTRAINT "api_configurations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."aquaponic_readings"
    ADD CONSTRAINT "aquaponic_readings_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audit_checklist_items"
    ADD CONSTRAINT "audit_checklist_items_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "public"."audit_schedules"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audit_schedules"
    ADD CONSTRAINT "audit_schedules_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bed_planting_history"
    ADD CONSTRAINT "bed_planting_history_bed_id_fkey" FOREIGN KEY ("bed_id") REFERENCES "public"."garden_beds"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."calendar_tasks"
    ADD CONSTRAINT "calendar_tasks_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."calendar_tasks"
    ADD CONSTRAINT "calendar_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."certification_documents"
    ADD CONSTRAINT "certification_documents_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."certifications"
    ADD CONSTRAINT "certifications_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."certified_suppliers"
    ADD CONSTRAINT "certified_suppliers_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."challenge_completions"
    ADD CONSTRAINT "challenge_completions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."crop_archetypes"
    ADD CONSTRAINT "crop_archetypes_parent_archetype_id_fkey" FOREIGN KEY ("parent_archetype_id") REFERENCES "public"."crop_archetypes"("id");



ALTER TABLE ONLY "public"."crop_learning_events"
    ADD CONSTRAINT "crop_learning_events_archetype_id_fkey" FOREIGN KEY ("archetype_id") REFERENCES "public"."crop_archetypes"("id");



ALTER TABLE ONLY "public"."crop_learning_events"
    ADD CONSTRAINT "crop_learning_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."crop_mechanical_works"
    ADD CONSTRAINT "crop_mechanical_works_archetype_id_fkey" FOREIGN KEY ("archetype_id") REFERENCES "public"."crop_archetypes"("id");



ALTER TABLE ONLY "public"."crop_mechanical_works"
    ADD CONSTRAINT "crop_mechanical_works_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."crop_profiles"
    ADD CONSTRAINT "crop_profiles_archetype_id_fkey" FOREIGN KEY ("archetype_id") REFERENCES "public"."crop_archetypes"("id");



ALTER TABLE ONLY "public"."cultivation_issues"
    ADD CONSTRAINT "cultivation_issues_cultivation_plan_id_fkey" FOREIGN KEY ("cultivation_plan_id") REFERENCES "public"."cultivation_plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cultivation_plans"
    ADD CONSTRAINT "cultivation_plans_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cultivation_plans"
    ADD CONSTRAINT "cultivation_plans_seed_inventory_id_fkey" FOREIGN KEY ("seed_inventory_id") REFERENCES "public"."seed_inventory"("id");



ALTER TABLE ONLY "public"."cultivation_plans"
    ADD CONSTRAINT "cultivation_plans_seedling_batch_id_fkey" FOREIGN KEY ("seedling_batch_id") REFERENCES "public"."seedling_batches"("id");



ALTER TABLE ONLY "public"."cultivation_plans"
    ADD CONSTRAINT "cultivation_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cultivation_statistics"
    ADD CONSTRAINT "cultivation_statistics_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cultivation_statistics"
    ADD CONSTRAINT "cultivation_statistics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."custom_crops"
    ADD CONSTRAINT "custom_crops_archetype_id_fkey" FOREIGN KEY ("archetype_id") REFERENCES "public"."crop_archetypes"("id");



ALTER TABLE ONLY "public"."custom_crops"
    ADD CONSTRAINT "custom_crops_custom_profile_id_fkey" FOREIGN KEY ("custom_profile_id") REFERENCES "public"."crop_profiles"("id");



ALTER TABLE ONLY "public"."custom_crops"
    ADD CONSTRAINT "custom_crops_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."custom_plans"
    ADD CONSTRAINT "custom_plans_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."custom_plans"
    ADD CONSTRAINT "custom_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."detailed_harvests"
    ADD CONSTRAINT "detailed_harvests_cultivation_plan_id_fkey" FOREIGN KEY ("cultivation_plan_id") REFERENCES "public"."cultivation_plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fertilization_logs"
    ADD CONSTRAINT "fertilization_logs_garden_zone_id_fkey" FOREIGN KEY ("garden_zone_id") REFERENCES "public"."garden_zones"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fertilization_logs"
    ADD CONSTRAINT "fertilization_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fertilizer_application_logs"
    ADD CONSTRAINT "fertilizer_application_logs_bed_id_fkey" FOREIGN KEY ("bed_id") REFERENCES "public"."garden_beds"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."fertilizer_application_logs"
    ADD CONSTRAINT "fertilizer_application_logs_bed_row_id_fkey" FOREIGN KEY ("bed_row_id") REFERENCES "public"."garden_rows"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."fertilizer_application_logs"
    ADD CONSTRAINT "fertilizer_application_logs_field_row_id_fkey" FOREIGN KEY ("field_row_id") REFERENCES "public"."field_rows"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."fertilizer_application_logs"
    ADD CONSTRAINT "fertilizer_application_logs_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fertilizer_application_logs"
    ADD CONSTRAINT "fertilizer_application_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fertilizer_application_logs"
    ADD CONSTRAINT "fertilizer_application_logs_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "public"."garden_zones"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."fertilizer_inventory"
    ADD CONSTRAINT "fertilizer_inventory_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fertilizer_inventory"
    ADD CONSTRAINT "fertilizer_inventory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."field_rows"
    ADD CONSTRAINT "field_rows_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."field_rows"
    ADD CONSTRAINT "field_rows_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "public"."garden_zones"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."garden_accessories"
    ADD CONSTRAINT "garden_accessories_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."garden_beds"
    ADD CONSTRAINT "garden_beds_covering_structure_id_fkey" FOREIGN KEY ("covering_structure_id") REFERENCES "public"."gardens"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."garden_beds"
    ADD CONSTRAINT "garden_beds_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."garden_beds"
    ADD CONSTRAINT "garden_beds_structure_id_fkey" FOREIGN KEY ("structure_id") REFERENCES "public"."gardens"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."garden_correlations"
    ADD CONSTRAINT "garden_correlations_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."garden_correlations"
    ADD CONSTRAINT "garden_correlations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."garden_obstacles"
    ADD CONSTRAINT "garden_obstacles_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."garden_patterns"
    ADD CONSTRAINT "garden_patterns_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."garden_patterns"
    ADD CONSTRAINT "garden_patterns_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."garden_plants"
    ADD CONSTRAINT "garden_plants_field_row_id_fkey" FOREIGN KEY ("field_row_id") REFERENCES "public"."field_rows"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."garden_plants"
    ADD CONSTRAINT "garden_plants_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."garden_plants"
    ADD CONSTRAINT "garden_plants_row_id_fkey" FOREIGN KEY ("row_id") REFERENCES "public"."garden_rows"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."garden_rows"
    ADD CONSTRAINT "garden_rows_archetype_id_fkey" FOREIGN KEY ("archetype_id") REFERENCES "public"."crop_archetypes"("id");



ALTER TABLE ONLY "public"."garden_rows"
    ADD CONSTRAINT "garden_rows_garden_zone_id_fkey" FOREIGN KEY ("garden_zone_id") REFERENCES "public"."garden_zones"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."garden_rows"
    ADD CONSTRAINT "garden_rows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."garden_season_analyses"
    ADD CONSTRAINT "garden_season_analyses_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."garden_season_analyses"
    ADD CONSTRAINT "garden_season_analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."garden_tasks"
    ADD CONSTRAINT "garden_tasks_archetype_id_fkey" FOREIGN KEY ("archetype_id") REFERENCES "public"."crop_archetypes"("id");



ALTER TABLE ONLY "public"."garden_tasks"
    ADD CONSTRAINT "garden_tasks_bed_id_fkey" FOREIGN KEY ("bed_id") REFERENCES "public"."garden_beds"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."garden_tasks"
    ADD CONSTRAINT "garden_tasks_bed_row_id_fkey" FOREIGN KEY ("bed_row_id") REFERENCES "public"."garden_rows"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."garden_tasks"
    ADD CONSTRAINT "garden_tasks_field_row_id_fkey" FOREIGN KEY ("field_row_id") REFERENCES "public"."field_rows"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."garden_tasks"
    ADD CONSTRAINT "garden_tasks_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."garden_tasks"
    ADD CONSTRAINT "garden_tasks_parent_plan_id_fkey" FOREIGN KEY ("parent_plan_id") REFERENCES "public"."cultivation_plans"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."garden_tasks"
    ADD CONSTRAINT "garden_tasks_sapling_batch_id_fkey" FOREIGN KEY ("sapling_batch_id") REFERENCES "public"."sapling_batches"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."garden_tasks"
    ADD CONSTRAINT "garden_tasks_seed_packet_id_fkey" FOREIGN KEY ("seed_packet_id") REFERENCES "public"."seed_inventory"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."garden_tasks"
    ADD CONSTRAINT "garden_tasks_seedling_batch_id_fkey" FOREIGN KEY ("seedling_batch_id") REFERENCES "public"."seedling_batches"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."garden_tree_memories"
    ADD CONSTRAINT "garden_tree_memories_archetype_id_fkey" FOREIGN KEY ("archetype_id") REFERENCES "public"."crop_archetypes"("id");



ALTER TABLE ONLY "public"."garden_tree_memories"
    ADD CONSTRAINT "garden_tree_memories_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."garden_tree_memories"
    ADD CONSTRAINT "garden_tree_memories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."garden_zone_memories"
    ADD CONSTRAINT "garden_zone_memories_garden_zone_id_fkey" FOREIGN KEY ("garden_zone_id") REFERENCES "public"."garden_zones"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."garden_zone_memories"
    ADD CONSTRAINT "garden_zone_memories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."garden_zones"
    ADD CONSTRAINT "garden_zones_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gardens"
    ADD CONSTRAINT "gardens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."globalgap_compliance_checklist"
    ADD CONSTRAINT "globalgap_compliance_checklist_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."globalgap_ggn_codes"
    ADD CONSTRAINT "globalgap_ggn_codes_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."globalgap_health_safety_managers"
    ADD CONSTRAINT "globalgap_health_safety_managers_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."globalgap_recall_procedures"
    ADD CONSTRAINT "globalgap_recall_procedures_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."globalgap_risk_management_plans"
    ADD CONSTRAINT "globalgap_risk_management_plans_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."globalgap_self_assessments"
    ADD CONSTRAINT "globalgap_self_assessments_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."haccp_critical_control_points"
    ADD CONSTRAINT "haccp_critical_control_points_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."haccp_critical_control_points"
    ADD CONSTRAINT "haccp_critical_control_points_hazard_analysis_id_fkey" FOREIGN KEY ("hazard_analysis_id") REFERENCES "public"."haccp_hazard_analysis"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."haccp_hazard_analysis"
    ADD CONSTRAINT "haccp_hazard_analysis_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."haccp_systems"
    ADD CONSTRAINT "haccp_systems_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."haccp_team_members"
    ADD CONSTRAINT "haccp_team_members_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."harvest_logs"
    ADD CONSTRAINT "harvest_logs_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."harvest_logs"
    ADD CONSTRAINT "harvest_logs_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."garden_tasks"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."hydroponic_readings"
    ADD CONSTRAINT "hydroponic_readings_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."irrigation_components"
    ADD CONSTRAINT "irrigation_components_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "public"."irrigation_zones"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."irrigation_logs"
    ADD CONSTRAINT "irrigation_logs_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."irrigation_logs"
    ADD CONSTRAINT "irrigation_logs_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "public"."irrigation_systems"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."irrigation_logs"
    ADD CONSTRAINT "irrigation_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."irrigation_systems"
    ADD CONSTRAINT "irrigation_systems_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."irrigation_systems"
    ADD CONSTRAINT "irrigation_systems_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."irrigation_zones"
    ADD CONSTRAINT "irrigation_zones_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."irrigation_zones"
    ADD CONSTRAINT "irrigation_zones_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "public"."irrigation_systems"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mechanical_work_register"
    ADD CONSTRAINT "mechanical_work_register_bed_id_fkey" FOREIGN KEY ("bed_id") REFERENCES "public"."garden_beds"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."mechanical_work_register"
    ADD CONSTRAINT "mechanical_work_register_bed_row_id_fkey" FOREIGN KEY ("bed_row_id") REFERENCES "public"."garden_rows"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."mechanical_work_register"
    ADD CONSTRAINT "mechanical_work_register_field_row_id_fkey" FOREIGN KEY ("field_row_id") REFERENCES "public"."field_rows"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."mechanical_work_register"
    ADD CONSTRAINT "mechanical_work_register_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mechanical_work_register"
    ADD CONSTRAINT "mechanical_work_register_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mechanical_work_register"
    ADD CONSTRAINT "mechanical_work_register_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "public"."garden_zones"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."mechanical_work_sequences"
    ADD CONSTRAINT "mechanical_work_sequences_archetype_id_fkey" FOREIGN KEY ("archetype_id") REFERENCES "public"."crop_archetypes"("id");



ALTER TABLE ONLY "public"."mechanical_work_sequences"
    ADD CONSTRAINT "mechanical_work_sequences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."operation_sync_log"
    ADD CONSTRAINT "operation_sync_log_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organic_certifications"
    ADD CONSTRAINT "organic_certifications_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organic_inputs_register"
    ADD CONSTRAINT "organic_inputs_register_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organic_sales_register"
    ADD CONSTRAINT "organic_sales_register_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."phase_transitions"
    ADD CONSTRAINT "phase_transitions_cultivation_plan_id_fkey" FOREIGN KEY ("cultivation_plan_id") REFERENCES "public"."cultivation_plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photo_logs"
    ADD CONSTRAINT "photo_logs_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photo_logs"
    ADD CONSTRAINT "photo_logs_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."garden_tasks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."phyto_inventory"
    ADD CONSTRAINT "phyto_inventory_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."phyto_inventory"
    ADD CONSTRAINT "phyto_inventory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."plant_harvests"
    ADD CONSTRAINT "plant_harvests_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."plant_harvests"
    ADD CONSTRAINT "plant_harvests_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "public"."garden_plants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."plant_operations"
    ADD CONSTRAINT "plant_operations_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."plant_operations"
    ADD CONSTRAINT "plant_operations_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "public"."garden_plants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."plant_rules"
    ADD CONSTRAINT "plant_rules_archetype_id_fkey" FOREIGN KEY ("archetype_id") REFERENCES "public"."crop_archetypes"("id");



ALTER TABLE ONLY "public"."plant_rules"
    ADD CONSTRAINT "plant_rules_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "public"."plant_families"("id");



ALTER TABLE ONLY "public"."plant_synonyms"
    ADD CONSTRAINT "plant_synonyms_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."plant_synonyms"
    ADD CONSTRAINT "plant_synonyms_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "public"."plant_taxonomy"("plant_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."plant_taxonomy"
    ADD CONSTRAINT "plant_taxonomy_archetype_id_fkey" FOREIGN KEY ("archetype_id") REFERENCES "public"."crop_archetypes"("id");



ALTER TABLE ONLY "public"."plant_taxonomy"
    ADD CONSTRAINT "plant_taxonomy_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "public"."plant_families"("id");



ALTER TABLE ONLY "public"."planting_batches"
    ADD CONSTRAINT "planting_batches_field_row_id_fkey" FOREIGN KEY ("field_row_id") REFERENCES "public"."field_rows"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."planting_batches"
    ADD CONSTRAINT "planting_batches_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prescription_map_exports"
    ADD CONSTRAINT "prescription_map_exports_prescription_map_id_fkey" FOREIGN KEY ("prescription_map_id") REFERENCES "public"."prescription_maps"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prescription_maps"
    ADD CONSTRAINT "prescription_maps_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prescription_zones"
    ADD CONSTRAINT "prescription_zones_prescription_map_id_fkey" FOREIGN KEY ("prescription_map_id") REFERENCES "public"."prescription_maps"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."professional_analytics"
    ADD CONSTRAINT "professional_analytics_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."professional_analytics"
    ADD CONSTRAINT "professional_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sapling_batches"
    ADD CONSTRAINT "sapling_batches_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sapling_inventory"
    ADD CONSTRAINT "sapling_inventory_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sapling_inventory"
    ADD CONSTRAINT "sapling_inventory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."seed_inventory"
    ADD CONSTRAINT "seed_inventory_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."seed_inventory"
    ADD CONSTRAINT "seed_inventory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."seedling_batches"
    ADD CONSTRAINT "seedling_batches_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sensor_readings"
    ADD CONSTRAINT "sensor_readings_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sensor_readings"
    ADD CONSTRAINT "sensor_readings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."soil_analysis"
    ADD CONSTRAINT "soil_analysis_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."soil_analysis"
    ADD CONSTRAINT "soil_analysis_garden_zone_id_fkey" FOREIGN KEY ("garden_zone_id") REFERENCES "public"."garden_zones"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."soil_analysis"
    ADD CONSTRAINT "soil_analysis_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supplier_certifications"
    ADD CONSTRAINT "supplier_certifications_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."certified_suppliers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."training_materials"
    ADD CONSTRAINT "training_materials_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."training_programs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."training_participants"
    ADD CONSTRAINT "training_participants_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."training_programs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."training_programs"
    ADD CONSTRAINT "training_programs_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."treatment_register"
    ADD CONSTRAINT "treatment_register_bed_id_fkey" FOREIGN KEY ("bed_id") REFERENCES "public"."garden_beds"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."treatment_register"
    ADD CONSTRAINT "treatment_register_bed_row_id_fkey" FOREIGN KEY ("bed_row_id") REFERENCES "public"."garden_rows"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."treatment_register"
    ADD CONSTRAINT "treatment_register_field_row_id_fkey" FOREIGN KEY ("field_row_id") REFERENCES "public"."field_rows"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."treatment_register"
    ADD CONSTRAINT "treatment_register_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."treatment_register"
    ADD CONSTRAINT "treatment_register_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."treatment_register"
    ADD CONSTRAINT "treatment_register_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "public"."garden_zones"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."treatment_registry"
    ADD CONSTRAINT "treatment_registry_garden_zone_id_fkey" FOREIGN KEY ("garden_zone_id") REFERENCES "public"."garden_zones"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."treatment_registry"
    ADD CONSTRAINT "treatment_registry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vegetation_indices"
    ADD CONSTRAINT "vegetation_indices_garden_zone_id_fkey" FOREIGN KEY ("garden_zone_id") REFERENCES "public"."garden_zones"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vegetation_indices"
    ADD CONSTRAINT "vegetation_indices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."watering_logs"
    ADD CONSTRAINT "watering_logs_bed_id_fkey" FOREIGN KEY ("bed_id") REFERENCES "public"."garden_beds"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."watering_logs"
    ADD CONSTRAINT "watering_logs_bed_row_id_fkey" FOREIGN KEY ("bed_row_id") REFERENCES "public"."garden_rows"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."watering_logs"
    ADD CONSTRAINT "watering_logs_field_row_id_fkey" FOREIGN KEY ("field_row_id") REFERENCES "public"."field_rows"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."watering_logs"
    ADD CONSTRAINT "watering_logs_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."watering_logs"
    ADD CONSTRAINT "watering_logs_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "public"."irrigation_zones"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."weather_reschedule_logs"
    ADD CONSTRAINT "weather_reschedule_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."yield_predictions"
    ADD CONSTRAINT "yield_predictions_archetype_id_fkey" FOREIGN KEY ("archetype_id") REFERENCES "public"."crop_archetypes"("id");



ALTER TABLE ONLY "public"."yield_predictions"
    ADD CONSTRAINT "yield_predictions_garden_zone_id_fkey" FOREIGN KEY ("garden_zone_id") REFERENCES "public"."garden_zones"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."yield_predictions"
    ADD CONSTRAINT "yield_predictions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admin can modify crop_archetypes" ON "public"."crop_archetypes" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."tier" = 'ADMIN'::"text")))));



CREATE POLICY "Admin can modify crop_profiles" ON "public"."crop_profiles" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."tier" = 'ADMIN'::"text")))));



CREATE POLICY "Admin can modify plant_families" ON "public"."plant_families" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."tier" = 'ADMIN'::"text")))));



CREATE POLICY "Admin can modify plant_rules" ON "public"."plant_rules" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."tier" = 'ADMIN'::"text")))));



CREATE POLICY "Admin can modify plant_synonyms" ON "public"."plant_synonyms" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."tier" = 'ADMIN'::"text")))));



CREATE POLICY "Admin can modify plant_taxonomy" ON "public"."plant_taxonomy" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."tier" = 'ADMIN'::"text")))));



CREATE POLICY "Anyone can read weather cache" ON "public"."weather_cache" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can update weather cache" ON "public"."weather_cache" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users can write weather cache" ON "public"."weather_cache" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Public read access for crop_archetypes" ON "public"."crop_archetypes" FOR SELECT USING (true);



CREATE POLICY "Public read access for crop_profiles" ON "public"."crop_profiles" FOR SELECT USING (true);



CREATE POLICY "Public read access for plant_families" ON "public"."plant_families" FOR SELECT USING (true);



CREATE POLICY "Public read access for plant_rules" ON "public"."plant_rules" FOR SELECT USING (true);



CREATE POLICY "Public read access for plant_synonyms" ON "public"."plant_synonyms" FOR SELECT USING (true);



CREATE POLICY "Public read access for plant_taxonomy" ON "public"."plant_taxonomy" FOR SELECT USING (true);



CREATE POLICY "Users can access accessories in their gardens" ON "public"."garden_accessories" USING ((EXISTS ( SELECT 1
   FROM "public"."gardens"
  WHERE (("gardens"."id" = "garden_accessories"."garden_id") AND ("gardens"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can access aquaponic readings in their gardens" ON "public"."aquaponic_readings" USING ((EXISTS ( SELECT 1
   FROM "public"."gardens"
  WHERE (("gardens"."id" = "aquaponic_readings"."garden_id") AND ("gardens"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can access hydroponic readings in their gardens" ON "public"."hydroponic_readings" USING ((EXISTS ( SELECT 1
   FROM "public"."gardens"
  WHERE (("gardens"."id" = "hydroponic_readings"."garden_id") AND ("gardens"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can access sapling batches in their gardens" ON "public"."sapling_batches" USING ((EXISTS ( SELECT 1
   FROM "public"."gardens"
  WHERE (("gardens"."id" = "sapling_batches"."garden_id") AND ("gardens"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can access seedling batches in their gardens" ON "public"."seedling_batches" USING ((EXISTS ( SELECT 1
   FROM "public"."gardens"
  WHERE (("gardens"."id" = "seedling_batches"."garden_id") AND ("gardens"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can access their own custom crops" ON "public"."custom_crops" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can access their own garden patterns" ON "public"."garden_patterns" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can access their own learning events" ON "public"."crop_learning_events" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can access their own mechanical works" ON "public"."crop_mechanical_works" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can access their own work sequences" ON "public"."mechanical_work_sequences" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create obstacles in their gardens" ON "public"."garden_obstacles" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."gardens"
  WHERE (("gardens"."id" = "garden_obstacles"."garden_id") AND ("gardens"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can create their own custom plans" ON "public"."custom_plans" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete obstacles in their gardens" ON "public"."garden_obstacles" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."gardens"
  WHERE (("gardens"."id" = "garden_obstacles"."garden_id") AND ("gardens"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can delete own cultivation plans" ON "public"."cultivation_plans" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own sapling inventory" ON "public"."sapling_inventory" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own custom plans" ON "public"."custom_plans" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own field rows" ON "public"."field_rows" FOR DELETE USING (("garden_id" IN ( SELECT "gardens"."id"
   FROM "public"."gardens"
  WHERE ("gardens"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can delete their own garden zones" ON "public"."garden_zones" FOR DELETE USING (("garden_id" IN ( SELECT "gardens"."id"
   FROM "public"."gardens"
  WHERE ("gardens"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can delete their own gardens" ON "public"."gardens" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own notification preferences" ON "public"."notification_preferences" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own planting batches" ON "public"."planting_batches" FOR DELETE USING (("garden_id" IN ( SELECT "gardens"."id"
   FROM "public"."gardens"
  WHERE ("gardens"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert cultivation issues" ON "public"."cultivation_issues" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."cultivation_plans"
  WHERE (("cultivation_plans"."id" = "cultivation_issues"."cultivation_plan_id") AND ("cultivation_plans"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert detailed harvests" ON "public"."detailed_harvests" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."cultivation_plans"
  WHERE (("cultivation_plans"."id" = "detailed_harvests"."cultivation_plan_id") AND ("cultivation_plans"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert own cultivation plans" ON "public"."cultivation_plans" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own cultivation statistics" ON "public"."cultivation_statistics" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own sapling inventory" ON "public"."sapling_inventory" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert phase transitions" ON "public"."phase_transitions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."cultivation_plans"
  WHERE (("cultivation_plans"."id" = "phase_transitions"."cultivation_plan_id") AND ("cultivation_plans"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert their own field rows" ON "public"."field_rows" FOR INSERT WITH CHECK (("garden_id" IN ( SELECT "gardens"."id"
   FROM "public"."gardens"
  WHERE ("gardens"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert their own garden zones" ON "public"."garden_zones" FOR INSERT WITH CHECK (("garden_id" IN ( SELECT "gardens"."id"
   FROM "public"."gardens"
  WHERE ("gardens"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert their own gardens" ON "public"."gardens" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own notification preferences" ON "public"."notification_preferences" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own planting batches" ON "public"."planting_batches" FOR INSERT WITH CHECK (("garden_id" IN ( SELECT "gardens"."id"
   FROM "public"."gardens"
  WHERE ("gardens"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert weather cache" ON "public"."weather_cache" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can manage HACCP CCPs for their gardens" ON "public"."haccp_critical_control_points" USING (("garden_id" IN ( SELECT "gardens"."id"
   FROM "public"."gardens"
  WHERE ("gardens"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage HACCP hazard analysis for their gardens" ON "public"."haccp_hazard_analysis" USING (("garden_id" IN ( SELECT "gardens"."id"
   FROM "public"."gardens"
  WHERE ("gardens"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage HACCP systems for their gardens" ON "public"."haccp_systems" USING (("garden_id" IN ( SELECT "gardens"."id"
   FROM "public"."gardens"
  WHERE ("gardens"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage HACCP team members for their gardens" ON "public"."haccp_team_members" USING (("garden_id" IN ( SELECT "gardens"."id"
   FROM "public"."gardens"
  WHERE ("gardens"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage accessories for own gardens" ON "public"."garden_accessories" USING ((EXISTS ( SELECT 1
   FROM "public"."gardens"
  WHERE (("gardens"."id" = "garden_accessories"."garden_id") AND ("gardens"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage audit checklist items" ON "public"."audit_checklist_items" USING (("audit_id" IN ( SELECT "audit_schedules"."id"
   FROM "public"."audit_schedules"
  WHERE ("audit_schedules"."garden_id" IN ( SELECT "gardens"."id"
           FROM "public"."gardens"
          WHERE ("gardens"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can manage audits for their gardens" ON "public"."audit_schedules" USING (("garden_id" IN ( SELECT "gardens"."id"
   FROM "public"."gardens"
  WHERE ("gardens"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage beds for own gardens" ON "public"."garden_beds" USING ((EXISTS ( SELECT 1
   FROM "public"."gardens"
  WHERE (("gardens"."id" = "garden_beds"."garden_id") AND ("gardens"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage certification documents for their gardens" ON "public"."certification_documents" USING (("garden_id" IN ( SELECT "gardens"."id"
   FROM "public"."gardens"
  WHERE ("gardens"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage certifications for their gardens" ON "public"."certifications" USING (("garden_id" IN ( SELECT "gardens"."id"
   FROM "public"."gardens"
  WHERE ("gardens"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage certified suppliers for their gardens" ON "public"."certified_suppliers" USING (("garden_id" IN ( SELECT "gardens"."id"
   FROM "public"."gardens"
  WHERE ("gardens"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage organic certifications for their gardens" ON "public"."organic_certifications" USING (("garden_id" IN ( SELECT "gardens"."id"
   FROM "public"."gardens"
  WHERE ("gardens"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage organic inputs for their gardens" ON "public"."organic_inputs_register" USING (("garden_id" IN ( SELECT "gardens"."id"
   FROM "public"."gardens"
  WHERE ("gardens"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage organic sales for their gardens" ON "public"."organic_sales_register" USING (("garden_id" IN ( SELECT "gardens"."id"
   FROM "public"."gardens"
  WHERE ("gardens"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage seedling batches for own gardens" ON "public"."seedling_batches" USING ((EXISTS ( SELECT 1
   FROM "public"."gardens"
  WHERE (("gardens"."id" = "seedling_batches"."garden_id") AND ("gardens"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage supplier certifications" ON "public"."supplier_certifications" USING (("supplier_id" IN ( SELECT "certified_suppliers"."id"
   FROM "public"."certified_suppliers"
  WHERE ("certified_suppliers"."garden_id" IN ( SELECT "gardens"."id"
           FROM "public"."gardens"
          WHERE ("gardens"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can manage their garden's GGN codes" ON "public"."globalgap_ggn_codes" USING (("garden_id" IN ( SELECT "g"."id"
   FROM "public"."gardens" "g"
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage their garden's compliance checklist" ON "public"."globalgap_compliance_checklist" USING (("garden_id" IN ( SELECT "g"."id"
   FROM "public"."gardens" "g"
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage their garden's health safety managers" ON "public"."globalgap_health_safety_managers" USING (("garden_id" IN ( SELECT "g"."id"
   FROM "public"."gardens" "g"
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage their garden's recall procedures" ON "public"."globalgap_recall_procedures" USING (("garden_id" IN ( SELECT "g"."id"
   FROM "public"."gardens" "g"
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage their garden's risk management plans" ON "public"."globalgap_risk_management_plans" USING (("garden_id" IN ( SELECT "g"."id"
   FROM "public"."gardens" "g"
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage their garden's self assessments" ON "public"."globalgap_self_assessments" USING (("garden_id" IN ( SELECT "g"."id"
   FROM "public"."gardens" "g"
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage their own agronomists" ON "public"."agronomists" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own consultations" ON "public"."agronomist_consultations" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own garden plants" ON "public"."garden_plants" USING (("garden_id" IN ( SELECT "g"."id"
   FROM "public"."gardens" "g"
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage their own operation sync logs" ON "public"."operation_sync_log" USING (("garden_id" IN ( SELECT "g"."id"
   FROM "public"."gardens" "g"
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage their own plant harvests" ON "public"."plant_harvests" USING (("garden_id" IN ( SELECT "g"."id"
   FROM "public"."gardens" "g"
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage their own plant operations" ON "public"."plant_operations" USING (("garden_id" IN ( SELECT "g"."id"
   FROM "public"."gardens" "g"
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage their own prescription exports" ON "public"."prescription_map_exports" USING (("prescription_map_id" IN ( SELECT "pm"."id"
   FROM ("public"."prescription_maps" "pm"
     JOIN "public"."gardens" "g" ON (("pm"."garden_id" = "g"."id")))
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage their own prescription maps" ON "public"."prescription_maps" USING (("garden_id" IN ( SELECT "g"."id"
   FROM "public"."gardens" "g"
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage their own prescription zones" ON "public"."prescription_zones" USING (("prescription_map_id" IN ( SELECT "pm"."id"
   FROM ("public"."prescription_maps" "pm"
     JOIN "public"."gardens" "g" ON (("pm"."garden_id" = "g"."id")))
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage training materials" ON "public"."training_materials" USING (("program_id" IN ( SELECT "training_programs"."id"
   FROM "public"."training_programs"
  WHERE ("training_programs"."garden_id" IN ( SELECT "gardens"."id"
           FROM "public"."gardens"
          WHERE ("gardens"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can manage training participants" ON "public"."training_participants" USING (("program_id" IN ( SELECT "training_programs"."id"
   FROM "public"."training_programs"
  WHERE ("training_programs"."garden_id" IN ( SELECT "gardens"."id"
           FROM "public"."gardens"
          WHERE ("gardens"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can manage training programs for their gardens" ON "public"."training_programs" USING (("garden_id" IN ( SELECT "gardens"."id"
   FROM "public"."gardens"
  WHERE ("gardens"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can only access beds in their gardens" ON "public"."garden_beds" USING ((EXISTS ( SELECT 1
   FROM "public"."gardens"
  WHERE (("gardens"."id" = "garden_beds"."garden_id") AND ("gardens"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can only access harvests in their gardens" ON "public"."harvest_logs" USING ((EXISTS ( SELECT 1
   FROM "public"."gardens"
  WHERE (("gardens"."id" = "harvest_logs"."garden_id") AND ("gardens"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can only access history in their beds" ON "public"."bed_planting_history" USING ((EXISTS ( SELECT 1
   FROM ("public"."garden_beds"
     JOIN "public"."gardens" ON (("gardens"."id" = "garden_beds"."garden_id")))
  WHERE (("garden_beds"."id" = "bed_planting_history"."bed_id") AND ("gardens"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can only access irrigation components in their zones" ON "public"."irrigation_components" USING ((EXISTS ( SELECT 1
   FROM (("public"."irrigation_zones"
     JOIN "public"."irrigation_systems" ON (("irrigation_systems"."id" = "irrigation_zones"."system_id")))
     JOIN "public"."gardens" ON (("gardens"."id" = "irrigation_systems"."garden_id")))
  WHERE (("irrigation_zones"."id" = "irrigation_components"."zone_id") AND ("gardens"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can only access irrigation systems in their gardens" ON "public"."irrigation_systems" USING ((EXISTS ( SELECT 1
   FROM "public"."gardens"
  WHERE (("gardens"."id" = "irrigation_systems"."garden_id") AND ("gardens"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can only access irrigation zones in their systems" ON "public"."irrigation_zones" USING ((EXISTS ( SELECT 1
   FROM ("public"."irrigation_systems"
     JOIN "public"."gardens" ON (("gardens"."id" = "irrigation_systems"."garden_id")))
  WHERE (("irrigation_systems"."id" = "irrigation_zones"."system_id") AND ("gardens"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can only access photos in their gardens" ON "public"."photo_logs" USING ((EXISTS ( SELECT 1
   FROM "public"."gardens"
  WHERE (("gardens"."id" = "photo_logs"."garden_id") AND ("gardens"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can only access tasks in their gardens" ON "public"."garden_tasks" USING ((EXISTS ( SELECT 1
   FROM "public"."gardens"
  WHERE (("gardens"."id" = "garden_tasks"."garden_id") AND ("gardens"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can only access their garden tasks" ON "public"."garden_tasks" USING ((EXISTS ( SELECT 1
   FROM "public"."gardens"
  WHERE (("gardens"."id" = "garden_tasks"."garden_id") AND ("gardens"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can only access their gardens" ON "public"."gardens" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their irrigation logs" ON "public"."irrigation_logs" USING ((EXISTS ( SELECT 1
   FROM "public"."gardens"
  WHERE (("gardens"."id" = "irrigation_logs"."garden_id") AND ("gardens"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can only access their irrigation systems" ON "public"."irrigation_systems" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their mechanical work" ON "public"."mechanical_work_register" USING ((EXISTS ( SELECT 1
   FROM "public"."gardens"
  WHERE (("gardens"."id" = "mechanical_work_register"."garden_id") AND ("gardens"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can only access their own API configurations" ON "public"."api_configurations" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own analytics" ON "public"."professional_analytics" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own badges" ON "public"."user_badges" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own calendar tasks" ON "public"."calendar_tasks" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own challenge completions" ON "public"."challenge_completions" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own fertilization logs" ON "public"."fertilization_logs" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own fertilizer inventory" ON "public"."fertilizer_inventory" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own fertilizer logs" ON "public"."fertilizer_application_logs" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own garden correlations" ON "public"."garden_correlations" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own garden rows" ON "public"."garden_rows" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own irrigation logs sync" ON "public"."irrigation_logs" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own mechanical work" ON "public"."mechanical_work_register" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own mechanical work sync" ON "public"."mechanical_work_register" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own phyto inventory" ON "public"."phyto_inventory" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own phyto inventory sync" ON "public"."phyto_inventory" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own profile" ON "public"."profiles" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can only access their own reschedule logs" ON "public"."weather_reschedule_logs" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own season analyses" ON "public"."garden_season_analyses" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own seeds" ON "public"."seed_inventory" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own sensor readings" ON "public"."sensor_readings" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own soil analysis" ON "public"."soil_analysis" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own treatment registry" ON "public"."treatment_registry" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own treatments" ON "public"."treatment_register" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own tree memories" ON "public"."garden_tree_memories" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own vegetation indices" ON "public"."vegetation_indices" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own yield predictions" ON "public"."yield_predictions" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own zone memories" ON "public"."garden_zone_memories" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their phyto inventory" ON "public"."phyto_inventory" USING ((EXISTS ( SELECT 1
   FROM "public"."gardens"
  WHERE (("gardens"."id" = "phyto_inventory"."garden_id") AND ("gardens"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can only access watering logs in their zones" ON "public"."watering_logs" USING ((EXISTS ( SELECT 1
   FROM (("public"."irrigation_zones"
     JOIN "public"."irrigation_systems" ON (("irrigation_systems"."id" = "irrigation_zones"."system_id")))
     JOIN "public"."gardens" ON (("gardens"."id" = "irrigation_systems"."garden_id")))
  WHERE (("irrigation_zones"."id" = "watering_logs"."zone_id") AND ("gardens"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update advice from their consultations" ON "public"."agronomist_advice" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."agronomist_consultations"
  WHERE (("agronomist_consultations"."id" = "agronomist_advice"."consultation_id") AND ("agronomist_consultations"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update obstacles in their gardens" ON "public"."garden_obstacles" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."gardens"
  WHERE (("gardens"."id" = "garden_obstacles"."garden_id") AND ("gardens"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update own cultivation issues" ON "public"."cultivation_issues" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."cultivation_plans"
  WHERE (("cultivation_plans"."id" = "cultivation_issues"."cultivation_plan_id") AND ("cultivation_plans"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update own cultivation plans" ON "public"."cultivation_plans" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own detailed harvests" ON "public"."detailed_harvests" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."cultivation_plans"
  WHERE (("cultivation_plans"."id" = "detailed_harvests"."cultivation_plan_id") AND ("cultivation_plans"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update own sapling inventory" ON "public"."sapling_inventory" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own custom plans" ON "public"."custom_plans" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own field rows" ON "public"."field_rows" FOR UPDATE USING (("garden_id" IN ( SELECT "gardens"."id"
   FROM "public"."gardens"
  WHERE ("gardens"."user_id" = "auth"."uid"())))) WITH CHECK (("garden_id" IN ( SELECT "gardens"."id"
   FROM "public"."gardens"
  WHERE ("gardens"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can update their own garden zones" ON "public"."garden_zones" FOR UPDATE USING (("garden_id" IN ( SELECT "gardens"."id"
   FROM "public"."gardens"
  WHERE ("gardens"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can update their own gardens" ON "public"."gardens" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own notification preferences" ON "public"."notification_preferences" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own planting batches" ON "public"."planting_batches" FOR UPDATE USING (("garden_id" IN ( SELECT "gardens"."id"
   FROM "public"."gardens"
  WHERE ("gardens"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view advice from their consultations" ON "public"."agronomist_advice" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."agronomist_consultations"
  WHERE (("agronomist_consultations"."id" = "agronomist_advice"."consultation_id") AND ("agronomist_consultations"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view obstacles in their gardens" ON "public"."garden_obstacles" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."gardens"
  WHERE (("gardens"."id" = "garden_obstacles"."garden_id") AND ("gardens"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view own cultivation issues" ON "public"."cultivation_issues" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."cultivation_plans"
  WHERE (("cultivation_plans"."id" = "cultivation_issues"."cultivation_plan_id") AND ("cultivation_plans"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view own cultivation plans" ON "public"."cultivation_plans" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own cultivation statistics" ON "public"."cultivation_statistics" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own detailed harvests" ON "public"."detailed_harvests" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."cultivation_plans"
  WHERE (("cultivation_plans"."id" = "detailed_harvests"."cultivation_plan_id") AND ("cultivation_plans"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view own phase transitions" ON "public"."phase_transitions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."cultivation_plans"
  WHERE (("cultivation_plans"."id" = "phase_transitions"."cultivation_plan_id") AND ("cultivation_plans"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view own sapling inventory" ON "public"."sapling_inventory" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view public custom crops" ON "public"."custom_crops" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Users can view public custom plans" ON "public"."custom_plans" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Users can view public garden patterns" ON "public"."garden_patterns" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Users can view public learning events" ON "public"."crop_learning_events" FOR SELECT USING (("shared_publicly" = true));



CREATE POLICY "Users can view public work sequences" ON "public"."mechanical_work_sequences" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Users can view template mechanical works" ON "public"."crop_mechanical_works" FOR SELECT USING (("is_template" = true));



CREATE POLICY "Users can view their garden's GGN codes" ON "public"."globalgap_ggn_codes" FOR SELECT USING (("garden_id" IN ( SELECT "g"."id"
   FROM "public"."gardens" "g"
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their garden's compliance checklist" ON "public"."globalgap_compliance_checklist" FOR SELECT USING (("garden_id" IN ( SELECT "g"."id"
   FROM "public"."gardens" "g"
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their garden's health safety managers" ON "public"."globalgap_health_safety_managers" FOR SELECT USING (("garden_id" IN ( SELECT "g"."id"
   FROM "public"."gardens" "g"
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their garden's recall procedures" ON "public"."globalgap_recall_procedures" FOR SELECT USING (("garden_id" IN ( SELECT "g"."id"
   FROM "public"."gardens" "g"
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their garden's risk management plans" ON "public"."globalgap_risk_management_plans" FOR SELECT USING (("garden_id" IN ( SELECT "g"."id"
   FROM "public"."gardens" "g"
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their garden's self assessments" ON "public"."globalgap_self_assessments" FOR SELECT USING (("garden_id" IN ( SELECT "g"."id"
   FROM "public"."gardens" "g"
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own custom plans" ON "public"."custom_plans" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own field rows" ON "public"."field_rows" FOR SELECT USING (("garden_id" IN ( SELECT "gardens"."id"
   FROM "public"."gardens"
  WHERE ("gardens"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own garden plants" ON "public"."garden_plants" FOR SELECT USING (("garden_id" IN ( SELECT "g"."id"
   FROM "public"."gardens" "g"
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own garden zones" ON "public"."garden_zones" FOR SELECT USING (("garden_id" IN ( SELECT "gardens"."id"
   FROM "public"."gardens"
  WHERE ("gardens"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own gardens" ON "public"."gardens" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own notification preferences" ON "public"."notification_preferences" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own operation sync logs" ON "public"."operation_sync_log" FOR SELECT USING (("garden_id" IN ( SELECT "g"."id"
   FROM "public"."gardens" "g"
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own plant harvests" ON "public"."plant_harvests" FOR SELECT USING (("garden_id" IN ( SELECT "g"."id"
   FROM "public"."gardens" "g"
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own plant operations" ON "public"."plant_operations" FOR SELECT USING (("garden_id" IN ( SELECT "g"."id"
   FROM "public"."gardens" "g"
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own planting batches" ON "public"."planting_batches" FOR SELECT USING (("garden_id" IN ( SELECT "gardens"."id"
   FROM "public"."gardens"
  WHERE ("gardens"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own prescription exports" ON "public"."prescription_map_exports" FOR SELECT USING (("prescription_map_id" IN ( SELECT "pm"."id"
   FROM ("public"."prescription_maps" "pm"
     JOIN "public"."gardens" "g" ON (("pm"."garden_id" = "g"."id")))
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own prescription maps" ON "public"."prescription_maps" FOR SELECT USING (("garden_id" IN ( SELECT "g"."id"
   FROM "public"."gardens" "g"
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own prescription zones" ON "public"."prescription_zones" FOR SELECT USING (("prescription_map_id" IN ( SELECT "pm"."id"
   FROM ("public"."prescription_maps" "pm"
     JOIN "public"."gardens" "g" ON (("pm"."garden_id" = "g"."id")))
  WHERE ("g"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own transactions" ON "public"."ai_credit_transactions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Weather cache is publicly readable" ON "public"."weather_cache" FOR SELECT USING (true);



ALTER TABLE "public"."agronomist_advice" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agronomist_consultations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agronomists" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_credit_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."api_configurations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."aquaponic_readings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_checklist_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_schedules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bed_planting_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."calendar_tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."certification_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."certifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."certified_suppliers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."challenge_completions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."crop_archetypes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."crop_learning_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."crop_mechanical_works" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."crop_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cultivation_issues" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cultivation_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cultivation_statistics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."custom_crops" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."custom_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."detailed_harvests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fertilization_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fertilizer_application_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fertilizer_inventory" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."field_rows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."garden_accessories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."garden_beds" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."garden_correlations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."garden_obstacles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."garden_patterns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."garden_plants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."garden_rows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."garden_season_analyses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."garden_tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."garden_tree_memories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."garden_zone_memories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."garden_zones" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gardens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."globalgap_compliance_checklist" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."globalgap_ggn_codes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."globalgap_health_safety_managers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."globalgap_recall_procedures" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."globalgap_risk_management_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."globalgap_self_assessments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."haccp_critical_control_points" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."haccp_hazard_analysis" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."haccp_systems" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."haccp_team_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."harvest_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hydroponic_readings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."irrigation_components" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."irrigation_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."irrigation_systems" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."irrigation_zones" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mechanical_work_register" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mechanical_work_sequences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."operation_sync_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organic_certifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organic_inputs_register" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organic_sales_register" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."phase_transitions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."photo_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."phyto_inventory" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plant_families" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plant_harvests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plant_operations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plant_rules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plant_synonyms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plant_taxonomy" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."planting_batches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prescription_map_exports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prescription_maps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prescription_zones" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."professional_analytics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sapling_batches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sapling_inventory" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."seed_inventory" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."seedling_batches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sensor_readings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."soil_analysis" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supplier_certifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."training_materials" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."training_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."training_programs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."treatment_register" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."treatment_registry" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_badges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vegetation_indices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."watering_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."weather_cache" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."weather_reschedule_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."yield_predictions" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";

























































































































































GRANT ALL ON TABLE "public"."cultivation_plans" TO "anon";
GRANT ALL ON TABLE "public"."cultivation_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."cultivation_plans" TO "service_role";



GRANT ALL ON FUNCTION "public"."advance_cultivation_phase"("plan_id" "uuid", "new_phase" "text", "new_location" "text", "new_quantity" integer, "notes" "text", "photos" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."advance_cultivation_phase"("plan_id" "uuid", "new_phase" "text", "new_location" "text", "new_quantity" integer, "notes" "text", "photos" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."advance_cultivation_phase"("plan_id" "uuid", "new_phase" "text", "new_location" "text", "new_quantity" integer, "notes" "text", "photos" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."advance_cultivation_phase_validated"("plan_id" "uuid", "new_phase" "text", "new_location" "text", "new_quantity" integer, "notes" "text", "photos" "jsonb", "weather_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."advance_cultivation_phase_validated"("plan_id" "uuid", "new_phase" "text", "new_location" "text", "new_quantity" integer, "notes" "text", "photos" "jsonb", "weather_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."advance_cultivation_phase_validated"("plan_id" "uuid", "new_phase" "text", "new_location" "text", "new_quantity" integer, "notes" "text", "photos" "jsonb", "weather_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."apply_operation_to_row_plants"("p_operation_type" "text", "p_row_id" "uuid", "p_field_row_id" "uuid", "p_operation_date" "date", "p_quantity" numeric, "p_unit" "text", "p_product_name" "text", "p_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."apply_operation_to_row_plants"("p_operation_type" "text", "p_row_id" "uuid", "p_field_row_id" "uuid", "p_operation_date" "date", "p_quantity" numeric, "p_unit" "text", "p_product_name" "text", "p_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."apply_operation_to_row_plants"("p_operation_type" "text", "p_row_id" "uuid", "p_field_row_id" "uuid", "p_operation_date" "date", "p_quantity" numeric, "p_unit" "text", "p_product_name" "text", "p_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_calculate_statistics"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_calculate_statistics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_calculate_statistics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_generate_plants_in_row"("p_garden_id" "uuid", "p_row_id" "uuid", "p_field_row_id" "uuid", "p_plant_name" "text", "p_variety" "text", "p_planting_date" "date", "p_plant_spacing_cm" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."auto_generate_plants_in_row"("p_garden_id" "uuid", "p_row_id" "uuid", "p_field_row_id" "uuid", "p_plant_name" "text", "p_variety" "text", "p_planting_date" "date", "p_plant_spacing_cm" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_generate_plants_in_row"("p_garden_id" "uuid", "p_row_id" "uuid", "p_field_row_id" "uuid", "p_plant_name" "text", "p_variety" "text", "p_planting_date" "date", "p_plant_spacing_cm" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_generate_plants_in_row"("p_garden_id" "uuid", "p_row_id" "uuid", "p_field_row_id" "uuid", "p_plant_name" "text", "p_variety" "text", "p_planting_date" "date", "p_plant_spacing_cm" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."auto_generate_plants_in_row"("p_garden_id" "uuid", "p_row_id" "uuid", "p_field_row_id" "uuid", "p_plant_name" "text", "p_variety" "text", "p_planting_date" "date", "p_plant_spacing_cm" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_generate_plants_in_row"("p_garden_id" "uuid", "p_row_id" "uuid", "p_field_row_id" "uuid", "p_plant_name" "text", "p_variety" "text", "p_planting_date" "date", "p_plant_spacing_cm" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."backup_plant_data"("p_garden_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."backup_plant_data"("p_garden_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."backup_plant_data"("p_garden_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_cultivation_statistics"("user_id_param" "uuid", "garden_id_param" "uuid", "period_start_param" "date", "period_end_param" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_cultivation_statistics"("user_id_param" "uuid", "garden_id_param" "uuid", "period_start_param" "date", "period_end_param" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_cultivation_statistics"("user_id_param" "uuid", "garden_id_param" "uuid", "period_start_param" "date", "period_end_param" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_field_row_plant_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_field_row_plant_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_field_row_plant_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_harvest_stats"("p_garden_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_harvest_stats"("p_garden_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_harvest_stats"("p_garden_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_min_row_length"("plants_count" integer, "plant_spacing_cm" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_min_row_length"("plants_count" integer, "plant_spacing_cm" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_min_row_length"("plants_count" integer, "plant_spacing_cm" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_plants_in_row"("row_length_m" numeric, "plant_spacing_cm" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_plants_in_row"("row_length_m" numeric, "plant_spacing_cm" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_plants_in_row"("row_length_m" numeric, "plant_spacing_cm" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_task_dynamic_priority"("task_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_task_dynamic_priority"("task_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_task_dynamic_priority"("task_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_rotation_compliance"("p_bed_id" "uuid", "p_plant_family" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_rotation_compliance"("p_bed_id" "uuid", "p_plant_family" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_rotation_compliance"("p_bed_id" "uuid", "p_plant_family" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_rotation_compliance"("p_garden_id" "uuid", "p_zone_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_rotation_compliance"("p_garden_id" "uuid", "p_zone_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_rotation_compliance"("p_garden_id" "uuid", "p_zone_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_expired_weather_cache"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_weather_cache"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_weather_cache"() TO "service_role";



GRANT ALL ON FUNCTION "public"."consume_seed_inventory"() TO "anon";
GRANT ALL ON FUNCTION "public"."consume_seed_inventory"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."consume_seed_inventory"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_default_notification_preferences"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_default_notification_preferences"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_default_notification_preferences"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_example_tomato_field"("p_garden_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_example_tomato_field"("p_garden_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_example_tomato_field"("p_garden_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_plant_code"("p_garden_id" "uuid", "p_row_id" "uuid", "p_field_row_id" "uuid", "p_position" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."generate_plant_code"("p_garden_id" "uuid", "p_row_id" "uuid", "p_field_row_id" "uuid", "p_position" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_plant_code"("p_garden_id" "uuid", "p_row_id" "uuid", "p_field_row_id" "uuid", "p_position" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_available_materials"("garden_id_param" "uuid", "archetype_id_param" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_available_materials"("garden_id_param" "uuid", "archetype_id_param" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_available_materials"("garden_id_param" "uuid", "archetype_id_param" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_complete_row_stats"("p_row_id" "uuid", "p_field_row_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_complete_row_stats"("p_row_id" "uuid", "p_field_row_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_complete_row_stats"("p_row_id" "uuid", "p_field_row_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_field_row_mechanical_works"("p_field_row_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_field_row_mechanical_works"("p_field_row_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_field_row_mechanical_works"("p_field_row_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_field_row_occupancy"("p_field_row_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_field_row_occupancy"("p_field_row_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_field_row_occupancy"("p_field_row_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_field_row_treatments"("p_field_row_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_field_row_treatments"("p_field_row_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_field_row_treatments"("p_field_row_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."notification_preferences" TO "anon";
GRANT ALL ON TABLE "public"."notification_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_preferences" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_or_create_notification_preferences"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_or_create_notification_preferences"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_or_create_notification_preferences"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_plants_in_row"("p_row_id" "uuid", "p_field_row_id" "uuid", "p_status" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_plants_in_row"("p_row_id" "uuid", "p_field_row_id" "uuid", "p_status" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_plants_in_row"("p_row_id" "uuid", "p_field_row_id" "uuid", "p_status" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_recurring_issues"("user_id_param" "uuid", "archetype_id_param" "text", "min_occurrences" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_recurring_issues"("user_id_param" "uuid", "archetype_id_param" "text", "min_occurrences" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_recurring_issues"("user_id_param" "uuid", "archetype_id_param" "text", "min_occurrences" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_row_operation_stats"("p_row_id" "uuid", "p_field_row_id" "uuid", "p_operation_type" "text", "p_date_from" "date", "p_date_to" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_row_operation_stats"("p_row_id" "uuid", "p_field_row_id" "uuid", "p_operation_type" "text", "p_date_from" "date", "p_date_to" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_row_operation_stats"("p_row_id" "uuid", "p_field_row_id" "uuid", "p_operation_type" "text", "p_date_from" "date", "p_date_to" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."grant_credits"("p_user_id" "uuid", "p_amount" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."grant_credits"("p_user_id" "uuid", "p_amount" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."grant_credits"("p_user_id" "uuid", "p_amount" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user_credits"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user_credits"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user_credits"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_phase_specific_actions"("plan_id" "uuid", "phase" "text", "quantity" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."handle_phase_specific_actions"("plan_id" "uuid", "phase" "text", "quantity" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_phase_specific_actions"("plan_id" "uuid", "phase" "text", "quantity" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."initialize_default_certifications"() TO "anon";
GRANT ALL ON FUNCTION "public"."initialize_default_certifications"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."initialize_default_certifications"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_valid_phase_transition"("current_phase" "text", "new_phase" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_valid_phase_transition"("current_phase" "text", "new_phase" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_valid_phase_transition"("current_phase" "text", "new_phase" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."manage_sapling_inventory"() TO "anon";
GRANT ALL ON FUNCTION "public"."manage_sapling_inventory"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."manage_sapling_inventory"() TO "service_role";



GRANT ALL ON FUNCTION "public"."record_actual_completion"() TO "anon";
GRANT ALL ON FUNCTION "public"."record_actual_completion"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_actual_completion"() TO "service_role";



GRANT ALL ON FUNCTION "public"."search_plant_canonical"("search_query" "text", "filter_archetype_id" "text", "similarity_threshold" numeric, "result_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."search_plant_canonical"("search_query" "text", "filter_archetype_id" "text", "similarity_threshold" numeric, "result_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_plant_canonical"("search_query" "text", "filter_archetype_id" "text", "similarity_threshold" numeric, "result_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."search_plant_synonyms"("search_query" "text", "search_locale" "text", "filter_archetype_id" "text", "similarity_threshold" numeric, "result_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."search_plant_synonyms"("search_query" "text", "search_locale" "text", "filter_archetype_id" "text", "similarity_threshold" numeric, "result_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_plant_synonyms"("search_query" "text", "search_locale" "text", "filter_archetype_id" "text", "similarity_threshold" numeric, "result_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";



GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_plant_operations_to_main_tables"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_plant_operations_to_main_tables"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_plant_operations_to_main_tables"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_scheduled_date"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_scheduled_date"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_scheduled_date"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_calculated_plants"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_calculated_plants"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_calculated_plants"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_field_row_on_mechanical_work"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_field_row_on_mechanical_work"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_field_row_on_mechanical_work"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_field_row_on_treatment"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_field_row_on_treatment"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_field_row_on_treatment"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_field_row_plant_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_field_row_plant_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_field_row_plant_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_field_rows_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_field_rows_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_field_rows_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_haccp_certification_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_haccp_certification_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_haccp_certification_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_organic_certification_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_organic_certification_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_organic_certification_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_plan_quantity_from_transition"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_plan_quantity_from_transition"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_plan_quantity_from_transition"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_plant_taxonomy_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_plant_taxonomy_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_plant_taxonomy_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column_sync"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column_sync"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column_sync"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_zone_last_watered"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_zone_last_watered"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_zone_last_watered"() TO "service_role";



GRANT ALL ON FUNCTION "public"."water_all_plants_in_row"("p_row_id" "uuid", "p_field_row_id" "uuid", "p_liters_per_plant" numeric, "p_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."water_all_plants_in_row"("p_row_id" "uuid", "p_field_row_id" "uuid", "p_liters_per_plant" numeric, "p_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."water_all_plants_in_row"("p_row_id" "uuid", "p_field_row_id" "uuid", "p_liters_per_plant" numeric, "p_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";


















GRANT ALL ON TABLE "public"."agronomist_advice" TO "anon";
GRANT ALL ON TABLE "public"."agronomist_advice" TO "authenticated";
GRANT ALL ON TABLE "public"."agronomist_advice" TO "service_role";



GRANT ALL ON TABLE "public"."agronomist_consultations" TO "anon";
GRANT ALL ON TABLE "public"."agronomist_consultations" TO "authenticated";
GRANT ALL ON TABLE "public"."agronomist_consultations" TO "service_role";



GRANT ALL ON TABLE "public"."agronomists" TO "anon";
GRANT ALL ON TABLE "public"."agronomists" TO "authenticated";
GRANT ALL ON TABLE "public"."agronomists" TO "service_role";



GRANT ALL ON TABLE "public"."ai_credit_transactions" TO "anon";
GRANT ALL ON TABLE "public"."ai_credit_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_credit_transactions" TO "service_role";
GRANT ALL ON TABLE "public"."ai_credit_transactions" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."api_configurations" TO "anon";
GRANT ALL ON TABLE "public"."api_configurations" TO "authenticated";
GRANT ALL ON TABLE "public"."api_configurations" TO "service_role";



GRANT ALL ON TABLE "public"."aquaponic_readings" TO "anon";
GRANT ALL ON TABLE "public"."aquaponic_readings" TO "authenticated";
GRANT ALL ON TABLE "public"."aquaponic_readings" TO "service_role";



GRANT ALL ON TABLE "public"."audit_checklist_items" TO "anon";
GRANT ALL ON TABLE "public"."audit_checklist_items" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_checklist_items" TO "service_role";



GRANT ALL ON TABLE "public"."audit_schedules" TO "anon";
GRANT ALL ON TABLE "public"."audit_schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_schedules" TO "service_role";



GRANT ALL ON TABLE "public"."bed_planting_history" TO "anon";
GRANT ALL ON TABLE "public"."bed_planting_history" TO "authenticated";
GRANT ALL ON TABLE "public"."bed_planting_history" TO "service_role";



GRANT ALL ON TABLE "public"."calendar_tasks" TO "anon";
GRANT ALL ON TABLE "public"."calendar_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."calendar_tasks" TO "service_role";



GRANT ALL ON TABLE "public"."certification_documents" TO "anon";
GRANT ALL ON TABLE "public"."certification_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."certification_documents" TO "service_role";



GRANT ALL ON TABLE "public"."certifications" TO "anon";
GRANT ALL ON TABLE "public"."certifications" TO "authenticated";
GRANT ALL ON TABLE "public"."certifications" TO "service_role";



GRANT ALL ON TABLE "public"."certified_suppliers" TO "anon";
GRANT ALL ON TABLE "public"."certified_suppliers" TO "authenticated";
GRANT ALL ON TABLE "public"."certified_suppliers" TO "service_role";



GRANT ALL ON TABLE "public"."challenge_completions" TO "anon";
GRANT ALL ON TABLE "public"."challenge_completions" TO "authenticated";
GRANT ALL ON TABLE "public"."challenge_completions" TO "service_role";



GRANT ALL ON TABLE "public"."crop_archetypes" TO "anon";
GRANT ALL ON TABLE "public"."crop_archetypes" TO "authenticated";
GRANT ALL ON TABLE "public"."crop_archetypes" TO "service_role";



GRANT ALL ON TABLE "public"."crop_learning_events" TO "anon";
GRANT ALL ON TABLE "public"."crop_learning_events" TO "authenticated";
GRANT ALL ON TABLE "public"."crop_learning_events" TO "service_role";



GRANT ALL ON TABLE "public"."crop_mechanical_works" TO "anon";
GRANT ALL ON TABLE "public"."crop_mechanical_works" TO "authenticated";
GRANT ALL ON TABLE "public"."crop_mechanical_works" TO "service_role";



GRANT ALL ON TABLE "public"."crop_profiles" TO "anon";
GRANT ALL ON TABLE "public"."crop_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."crop_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."cultivation_issues" TO "anon";
GRANT ALL ON TABLE "public"."cultivation_issues" TO "authenticated";
GRANT ALL ON TABLE "public"."cultivation_issues" TO "service_role";



GRANT ALL ON TABLE "public"."cultivation_statistics" TO "anon";
GRANT ALL ON TABLE "public"."cultivation_statistics" TO "authenticated";
GRANT ALL ON TABLE "public"."cultivation_statistics" TO "service_role";



GRANT ALL ON TABLE "public"."custom_crops" TO "anon";
GRANT ALL ON TABLE "public"."custom_crops" TO "authenticated";
GRANT ALL ON TABLE "public"."custom_crops" TO "service_role";



GRANT ALL ON TABLE "public"."custom_plans" TO "anon";
GRANT ALL ON TABLE "public"."custom_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."custom_plans" TO "service_role";



GRANT ALL ON TABLE "public"."detailed_harvests" TO "anon";
GRANT ALL ON TABLE "public"."detailed_harvests" TO "authenticated";
GRANT ALL ON TABLE "public"."detailed_harvests" TO "service_role";



GRANT ALL ON TABLE "public"."fertilization_logs" TO "anon";
GRANT ALL ON TABLE "public"."fertilization_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."fertilization_logs" TO "service_role";



GRANT ALL ON TABLE "public"."fertilizer_application_logs" TO "anon";
GRANT ALL ON TABLE "public"."fertilizer_application_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."fertilizer_application_logs" TO "service_role";
GRANT ALL ON TABLE "public"."fertilizer_application_logs" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."fertilizer_inventory" TO "anon";
GRANT ALL ON TABLE "public"."fertilizer_inventory" TO "authenticated";
GRANT ALL ON TABLE "public"."fertilizer_inventory" TO "service_role";
GRANT ALL ON TABLE "public"."fertilizer_inventory" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."field_rows" TO "anon";
GRANT ALL ON TABLE "public"."field_rows" TO "authenticated";
GRANT ALL ON TABLE "public"."field_rows" TO "service_role";



GRANT ALL ON TABLE "public"."garden_accessories" TO "anon";
GRANT ALL ON TABLE "public"."garden_accessories" TO "authenticated";
GRANT ALL ON TABLE "public"."garden_accessories" TO "service_role";



GRANT ALL ON TABLE "public"."garden_beds" TO "anon";
GRANT ALL ON TABLE "public"."garden_beds" TO "authenticated";
GRANT ALL ON TABLE "public"."garden_beds" TO "service_role";



GRANT ALL ON TABLE "public"."garden_correlations" TO "anon";
GRANT ALL ON TABLE "public"."garden_correlations" TO "authenticated";
GRANT ALL ON TABLE "public"."garden_correlations" TO "service_role";



GRANT ALL ON TABLE "public"."garden_obstacles" TO "anon";
GRANT ALL ON TABLE "public"."garden_obstacles" TO "authenticated";
GRANT ALL ON TABLE "public"."garden_obstacles" TO "service_role";



GRANT ALL ON TABLE "public"."garden_patterns" TO "anon";
GRANT ALL ON TABLE "public"."garden_patterns" TO "authenticated";
GRANT ALL ON TABLE "public"."garden_patterns" TO "service_role";



GRANT ALL ON TABLE "public"."garden_plants" TO "anon";
GRANT ALL ON TABLE "public"."garden_plants" TO "authenticated";
GRANT ALL ON TABLE "public"."garden_plants" TO "service_role";



GRANT ALL ON TABLE "public"."garden_rows" TO "anon";
GRANT ALL ON TABLE "public"."garden_rows" TO "authenticated";
GRANT ALL ON TABLE "public"."garden_rows" TO "service_role";



GRANT ALL ON TABLE "public"."garden_season_analyses" TO "anon";
GRANT ALL ON TABLE "public"."garden_season_analyses" TO "authenticated";
GRANT ALL ON TABLE "public"."garden_season_analyses" TO "service_role";



GRANT ALL ON TABLE "public"."garden_tasks" TO "anon";
GRANT ALL ON TABLE "public"."garden_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."garden_tasks" TO "service_role";



GRANT ALL ON TABLE "public"."garden_tree_memories" TO "anon";
GRANT ALL ON TABLE "public"."garden_tree_memories" TO "authenticated";
GRANT ALL ON TABLE "public"."garden_tree_memories" TO "service_role";



GRANT ALL ON TABLE "public"."garden_zone_memories" TO "anon";
GRANT ALL ON TABLE "public"."garden_zone_memories" TO "authenticated";
GRANT ALL ON TABLE "public"."garden_zone_memories" TO "service_role";



GRANT ALL ON TABLE "public"."garden_zones" TO "anon";
GRANT ALL ON TABLE "public"."garden_zones" TO "authenticated";
GRANT ALL ON TABLE "public"."garden_zones" TO "service_role";



GRANT ALL ON TABLE "public"."gardens" TO "anon";
GRANT ALL ON TABLE "public"."gardens" TO "authenticated";
GRANT ALL ON TABLE "public"."gardens" TO "service_role";



GRANT ALL ON TABLE "public"."globalgap_compliance_checklist" TO "anon";
GRANT ALL ON TABLE "public"."globalgap_compliance_checklist" TO "authenticated";
GRANT ALL ON TABLE "public"."globalgap_compliance_checklist" TO "service_role";



GRANT ALL ON TABLE "public"."globalgap_ggn_codes" TO "anon";
GRANT ALL ON TABLE "public"."globalgap_ggn_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."globalgap_ggn_codes" TO "service_role";



GRANT ALL ON TABLE "public"."globalgap_health_safety_managers" TO "anon";
GRANT ALL ON TABLE "public"."globalgap_health_safety_managers" TO "authenticated";
GRANT ALL ON TABLE "public"."globalgap_health_safety_managers" TO "service_role";



GRANT ALL ON TABLE "public"."globalgap_recall_procedures" TO "anon";
GRANT ALL ON TABLE "public"."globalgap_recall_procedures" TO "authenticated";
GRANT ALL ON TABLE "public"."globalgap_recall_procedures" TO "service_role";



GRANT ALL ON TABLE "public"."globalgap_risk_management_plans" TO "anon";
GRANT ALL ON TABLE "public"."globalgap_risk_management_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."globalgap_risk_management_plans" TO "service_role";



GRANT ALL ON TABLE "public"."globalgap_self_assessments" TO "anon";
GRANT ALL ON TABLE "public"."globalgap_self_assessments" TO "authenticated";
GRANT ALL ON TABLE "public"."globalgap_self_assessments" TO "service_role";



GRANT ALL ON TABLE "public"."haccp_critical_control_points" TO "anon";
GRANT ALL ON TABLE "public"."haccp_critical_control_points" TO "authenticated";
GRANT ALL ON TABLE "public"."haccp_critical_control_points" TO "service_role";



GRANT ALL ON TABLE "public"."haccp_hazard_analysis" TO "anon";
GRANT ALL ON TABLE "public"."haccp_hazard_analysis" TO "authenticated";
GRANT ALL ON TABLE "public"."haccp_hazard_analysis" TO "service_role";



GRANT ALL ON TABLE "public"."haccp_systems" TO "anon";
GRANT ALL ON TABLE "public"."haccp_systems" TO "authenticated";
GRANT ALL ON TABLE "public"."haccp_systems" TO "service_role";



GRANT ALL ON TABLE "public"."haccp_team_members" TO "anon";
GRANT ALL ON TABLE "public"."haccp_team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."haccp_team_members" TO "service_role";



GRANT ALL ON TABLE "public"."harvest_logs" TO "anon";
GRANT ALL ON TABLE "public"."harvest_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."harvest_logs" TO "service_role";



GRANT ALL ON TABLE "public"."hydroponic_readings" TO "anon";
GRANT ALL ON TABLE "public"."hydroponic_readings" TO "authenticated";
GRANT ALL ON TABLE "public"."hydroponic_readings" TO "service_role";



GRANT ALL ON TABLE "public"."individual_plants" TO "anon";
GRANT ALL ON TABLE "public"."individual_plants" TO "authenticated";
GRANT ALL ON TABLE "public"."individual_plants" TO "service_role";



GRANT ALL ON TABLE "public"."irrigation_components" TO "anon";
GRANT ALL ON TABLE "public"."irrigation_components" TO "authenticated";
GRANT ALL ON TABLE "public"."irrigation_components" TO "service_role";



GRANT ALL ON TABLE "public"."irrigation_logs" TO "anon";
GRANT ALL ON TABLE "public"."irrigation_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."irrigation_logs" TO "service_role";
GRANT ALL ON TABLE "public"."irrigation_logs" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."irrigation_systems" TO "anon";
GRANT ALL ON TABLE "public"."irrigation_systems" TO "authenticated";
GRANT ALL ON TABLE "public"."irrigation_systems" TO "service_role";
GRANT ALL ON TABLE "public"."irrigation_systems" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."irrigation_zones" TO "anon";
GRANT ALL ON TABLE "public"."irrigation_zones" TO "authenticated";
GRANT ALL ON TABLE "public"."irrigation_zones" TO "service_role";



GRANT ALL ON TABLE "public"."mechanical_work_register" TO "anon";
GRANT ALL ON TABLE "public"."mechanical_work_register" TO "authenticated";
GRANT ALL ON TABLE "public"."mechanical_work_register" TO "service_role";
GRANT ALL ON TABLE "public"."mechanical_work_register" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."mechanical_work_sequences" TO "anon";
GRANT ALL ON TABLE "public"."mechanical_work_sequences" TO "authenticated";
GRANT ALL ON TABLE "public"."mechanical_work_sequences" TO "service_role";



GRANT ALL ON TABLE "public"."operation_sync_log" TO "anon";
GRANT ALL ON TABLE "public"."operation_sync_log" TO "authenticated";
GRANT ALL ON TABLE "public"."operation_sync_log" TO "service_role";



GRANT ALL ON TABLE "public"."organic_certifications" TO "anon";
GRANT ALL ON TABLE "public"."organic_certifications" TO "authenticated";
GRANT ALL ON TABLE "public"."organic_certifications" TO "service_role";



GRANT ALL ON TABLE "public"."organic_inputs_register" TO "anon";
GRANT ALL ON TABLE "public"."organic_inputs_register" TO "authenticated";
GRANT ALL ON TABLE "public"."organic_inputs_register" TO "service_role";



GRANT ALL ON TABLE "public"."organic_sales_register" TO "anon";
GRANT ALL ON TABLE "public"."organic_sales_register" TO "authenticated";
GRANT ALL ON TABLE "public"."organic_sales_register" TO "service_role";



GRANT ALL ON TABLE "public"."phase_transitions" TO "anon";
GRANT ALL ON TABLE "public"."phase_transitions" TO "authenticated";
GRANT ALL ON TABLE "public"."phase_transitions" TO "service_role";



GRANT ALL ON TABLE "public"."photo_logs" TO "anon";
GRANT ALL ON TABLE "public"."photo_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."photo_logs" TO "service_role";



GRANT ALL ON TABLE "public"."phyto_inventory" TO "anon";
GRANT ALL ON TABLE "public"."phyto_inventory" TO "authenticated";
GRANT ALL ON TABLE "public"."phyto_inventory" TO "service_role";
GRANT ALL ON TABLE "public"."phyto_inventory" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."plant_families" TO "anon";
GRANT ALL ON TABLE "public"."plant_families" TO "authenticated";
GRANT ALL ON TABLE "public"."plant_families" TO "service_role";



GRANT ALL ON TABLE "public"."plant_harvests" TO "anon";
GRANT ALL ON TABLE "public"."plant_harvests" TO "authenticated";
GRANT ALL ON TABLE "public"."plant_harvests" TO "service_role";



GRANT ALL ON TABLE "public"."plant_operations" TO "anon";
GRANT ALL ON TABLE "public"."plant_operations" TO "authenticated";
GRANT ALL ON TABLE "public"."plant_operations" TO "service_role";



GRANT ALL ON TABLE "public"."plant_operations_complete" TO "anon";
GRANT ALL ON TABLE "public"."plant_operations_complete" TO "authenticated";
GRANT ALL ON TABLE "public"."plant_operations_complete" TO "service_role";



GRANT ALL ON TABLE "public"."plant_production_summary" TO "anon";
GRANT ALL ON TABLE "public"."plant_production_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."plant_production_summary" TO "service_role";



GRANT ALL ON TABLE "public"."plant_rules" TO "anon";
GRANT ALL ON TABLE "public"."plant_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."plant_rules" TO "service_role";



GRANT ALL ON TABLE "public"."plant_synonyms" TO "anon";
GRANT ALL ON TABLE "public"."plant_synonyms" TO "authenticated";
GRANT ALL ON TABLE "public"."plant_synonyms" TO "service_role";



GRANT ALL ON TABLE "public"."plant_taxonomy" TO "anon";
GRANT ALL ON TABLE "public"."plant_taxonomy" TO "authenticated";
GRANT ALL ON TABLE "public"."plant_taxonomy" TO "service_role";



GRANT ALL ON TABLE "public"."planting_batches" TO "anon";
GRANT ALL ON TABLE "public"."planting_batches" TO "authenticated";
GRANT ALL ON TABLE "public"."planting_batches" TO "service_role";



GRANT ALL ON TABLE "public"."plants_per_row_summary" TO "anon";
GRANT ALL ON TABLE "public"."plants_per_row_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."plants_per_row_summary" TO "service_role";



GRANT ALL ON TABLE "public"."prescription_map_exports" TO "anon";
GRANT ALL ON TABLE "public"."prescription_map_exports" TO "authenticated";
GRANT ALL ON TABLE "public"."prescription_map_exports" TO "service_role";



GRANT ALL ON TABLE "public"."prescription_maps" TO "anon";
GRANT ALL ON TABLE "public"."prescription_maps" TO "authenticated";
GRANT ALL ON TABLE "public"."prescription_maps" TO "service_role";



GRANT ALL ON TABLE "public"."prescription_zones" TO "anon";
GRANT ALL ON TABLE "public"."prescription_zones" TO "authenticated";
GRANT ALL ON TABLE "public"."prescription_zones" TO "service_role";



GRANT ALL ON TABLE "public"."professional_analytics" TO "anon";
GRANT ALL ON TABLE "public"."professional_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."professional_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";
GRANT ALL ON TABLE "public"."profiles" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."row_health_summary" TO "anon";
GRANT ALL ON TABLE "public"."row_health_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."row_health_summary" TO "service_role";



GRANT ALL ON TABLE "public"."sapling_batches" TO "anon";
GRANT ALL ON TABLE "public"."sapling_batches" TO "authenticated";
GRANT ALL ON TABLE "public"."sapling_batches" TO "service_role";



GRANT ALL ON TABLE "public"."sapling_inventory" TO "anon";
GRANT ALL ON TABLE "public"."sapling_inventory" TO "authenticated";
GRANT ALL ON TABLE "public"."sapling_inventory" TO "service_role";



GRANT ALL ON TABLE "public"."scalar_production_timeline" TO "anon";
GRANT ALL ON TABLE "public"."scalar_production_timeline" TO "authenticated";
GRANT ALL ON TABLE "public"."scalar_production_timeline" TO "service_role";



GRANT ALL ON TABLE "public"."seed_inventory" TO "anon";
GRANT ALL ON TABLE "public"."seed_inventory" TO "authenticated";
GRANT ALL ON TABLE "public"."seed_inventory" TO "service_role";



GRANT ALL ON TABLE "public"."seedling_batches" TO "anon";
GRANT ALL ON TABLE "public"."seedling_batches" TO "authenticated";
GRANT ALL ON TABLE "public"."seedling_batches" TO "service_role";



GRANT ALL ON TABLE "public"."sensor_readings" TO "anon";
GRANT ALL ON TABLE "public"."sensor_readings" TO "authenticated";
GRANT ALL ON TABLE "public"."sensor_readings" TO "service_role";



GRANT ALL ON TABLE "public"."soil_analysis" TO "anon";
GRANT ALL ON TABLE "public"."soil_analysis" TO "authenticated";
GRANT ALL ON TABLE "public"."soil_analysis" TO "service_role";



GRANT ALL ON TABLE "public"."supplier_certifications" TO "anon";
GRANT ALL ON TABLE "public"."supplier_certifications" TO "authenticated";
GRANT ALL ON TABLE "public"."supplier_certifications" TO "service_role";



GRANT ALL ON TABLE "public"."training_materials" TO "anon";
GRANT ALL ON TABLE "public"."training_materials" TO "authenticated";
GRANT ALL ON TABLE "public"."training_materials" TO "service_role";



GRANT ALL ON TABLE "public"."training_participants" TO "anon";
GRANT ALL ON TABLE "public"."training_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."training_participants" TO "service_role";



GRANT ALL ON TABLE "public"."training_programs" TO "anon";
GRANT ALL ON TABLE "public"."training_programs" TO "authenticated";
GRANT ALL ON TABLE "public"."training_programs" TO "service_role";



GRANT ALL ON TABLE "public"."treatment_register" TO "anon";
GRANT ALL ON TABLE "public"."treatment_register" TO "authenticated";
GRANT ALL ON TABLE "public"."treatment_register" TO "service_role";
GRANT ALL ON TABLE "public"."treatment_register" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."treatment_registry" TO "anon";
GRANT ALL ON TABLE "public"."treatment_registry" TO "authenticated";
GRANT ALL ON TABLE "public"."treatment_registry" TO "service_role";



GRANT ALL ON TABLE "public"."user_badges" TO "anon";
GRANT ALL ON TABLE "public"."user_badges" TO "authenticated";
GRANT ALL ON TABLE "public"."user_badges" TO "service_role";



GRANT ALL ON TABLE "public"."vegetation_indices" TO "anon";
GRANT ALL ON TABLE "public"."vegetation_indices" TO "authenticated";
GRANT ALL ON TABLE "public"."vegetation_indices" TO "service_role";



GRANT ALL ON TABLE "public"."watering_logs" TO "anon";
GRANT ALL ON TABLE "public"."watering_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."watering_logs" TO "service_role";



GRANT ALL ON TABLE "public"."weather_cache" TO "anon";
GRANT ALL ON TABLE "public"."weather_cache" TO "authenticated";
GRANT ALL ON TABLE "public"."weather_cache" TO "service_role";



GRANT ALL ON TABLE "public"."weather_reschedule_logs" TO "anon";
GRANT ALL ON TABLE "public"."weather_reschedule_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."weather_reschedule_logs" TO "service_role";



GRANT ALL ON TABLE "public"."yield_predictions" TO "anon";
GRANT ALL ON TABLE "public"."yield_predictions" TO "authenticated";
GRANT ALL ON TABLE "public"."yield_predictions" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































