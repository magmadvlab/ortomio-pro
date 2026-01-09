-- ============================================
-- ORTOMIO - TRIGGER E AUTOMAZIONI ORCHESTRATORE
-- Aggiunge trigger automatici per gestire le relazioni
-- ============================================

-- 1. TRIGGER per aggiornare automaticamente quantità nei piani
CREATE OR REPLACE FUNCTION update_plan_quantity_from_transition()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER auto_update_plan_from_transition
  AFTER INSERT ON phase_transitions
  FOR EACH ROW EXECUTE FUNCTION update_plan_quantity_from_transition();

-- 2. TRIGGER per consumo automatico semi
CREATE OR REPLACE FUNCTION consume_seed_inventory()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER auto_consume_seeds
  AFTER INSERT ON cultivation_plans
  FOR EACH ROW EXECUTE FUNCTION consume_seed_inventory();

-- 3. TRIGGER per gestione alberelli
CREATE OR REPLACE FUNCTION manage_sapling_inventory()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER auto_manage_saplings
  AFTER INSERT ON cultivation_plans
  FOR EACH ROW EXECUTE FUNCTION manage_sapling_inventory();

-- 4. FUNZIONE per avanzamento fase con validazioni
CREATE OR REPLACE FUNCTION advance_cultivation_phase_validated(
    plan_id UUID,
    new_phase TEXT,
    new_location TEXT DEFAULT NULL,
    new_quantity INTEGER DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    photos JSONB DEFAULT NULL,
    weather_data JSONB DEFAULT NULL
) RETURNS JSONB AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FUNZIONE validazione transizioni
CREATE OR REPLACE FUNCTION is_valid_phase_transition(
    current_phase TEXT,
    new_phase TEXT
) RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql IMMUTABLE;

-- 6. FUNZIONE azioni specifiche per fase
CREATE OR REPLACE FUNCTION handle_phase_specific_actions(
    plan_id UUID,
    phase TEXT,
    quantity INTEGER DEFAULT NULL
) RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. VIEW per dashboard orchestratore
CREATE OR REPLACE VIEW cultivation_dashboard AS
SELECT 
    cp.id,
    cp.plant_name,
    cp.variety_name,
    cp.archetype_id,
    cp.current_phase,
    cp.current_location,
    cp.current_quantity,
    cp.planned_start_date,
    cp.estimated_harvest_date,
    cp.actual_harvest_date,
    cp.is_active,
    
    -- Materiale di partenza
    cp.starting_material,
    si.variety_name as seed_variety,
    sb.plant_name as seedling_name,
    sap.variety_name as sapling_variety,
    
    -- Statistiche
    (SELECT COUNT(*) FROM phase_transitions WHERE cultivation_plan_id = cp.id) as total_transitions,
    (SELECT MAX(transition_date) FROM phase_transitions WHERE cultivation_plan_id = cp.id) as last_transition,
    
    -- Giorni dal inizio
    CASE 
        WHEN cp.actual_start_date IS NOT NULL THEN 
            EXTRACT(days FROM NOW() - cp.actual_start_date)
        ELSE 
            EXTRACT(days FROM NOW() - cp.planned_start_date)
    END as days_since_start,
    
    -- Giorni alla raccolta stimata
    EXTRACT(days FROM cp.estimated_harvest_date - NOW()) as days_to_harvest,
    
    -- Giardino info
    g.name as garden_name,
    g.cultivation_category
    
FROM cultivation_plans cp
LEFT JOIN seed_inventory si ON cp.seed_inventory_id = si.id
LEFT JOIN seedling_batches sb ON cp.seedling_batch_id = sb.id
LEFT JOIN sapling_inventory sap ON cp.sapling_inventory_id = sap.id
LEFT JOIN gardens g ON cp.garden_id = g.id;

-- 8. INDICI aggiuntivi per performance
CREATE INDEX IF NOT EXISTS idx_phase_transitions_date ON phase_transitions(transition_date DESC);
CREATE INDEX IF NOT EXISTS idx_cultivation_plans_dates ON cultivation_plans(planned_start_date, estimated_harvest_date);
CREATE INDEX IF NOT EXISTS idx_cultivation_plans_active_phase ON cultivation_plans(is_active, current_phase);

-- 9. COMMENTI per documentazione
COMMENT ON FUNCTION advance_cultivation_phase_validated IS 'Avanza fase con validazioni e azioni automatiche';
COMMENT ON FUNCTION is_valid_phase_transition IS 'Valida se una transizione di fase è permessa';
COMMENT ON FUNCTION handle_phase_specific_actions IS 'Esegue azioni specifiche per ogni fase';
COMMENT ON VIEW cultivation_dashboard IS 'Vista completa per dashboard coltivazioni';