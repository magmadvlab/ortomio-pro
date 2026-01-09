-- ============================================
-- ORTOMIO - ANALYTICS E STATISTICHE ORCHESTRATORE
-- Aggiunge tabelle e funzioni per analytics avanzate
-- ============================================

-- 1. TABELLA per statistiche aggregate
CREATE TABLE IF NOT EXISTS cultivation_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    
    -- Periodo di riferimento
    period_type TEXT NOT NULL CHECK (period_type IN ('monthly', 'seasonal', 'yearly')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Statistiche per archetipo
    archetype_id TEXT NOT NULL,
    archetype_category TEXT NOT NULL,
    
    -- Metriche di performance
    total_plans INTEGER DEFAULT 0,
    completed_plans INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Tempi medi
    avg_days_to_harvest DECIMAL(8,2),
    avg_days_germination DECIMAL(8,2),
    avg_days_transplant DECIMAL(8,2),
    
    -- Perdite per fase
    losses_germination DECIMAL(5,2) DEFAULT 0,
    losses_nursing DECIMAL(5,2) DEFAULT 0,
    losses_transplant DECIMAL(5,2) DEFAULT 0,
    losses_growing DECIMAL(5,2) DEFAULT 0,
    
    -- Produttività
    total_harvest_quantity DECIMAL(10,2) DEFAULT 0,
    avg_harvest_per_plant DECIMAL(8,2) DEFAULT 0,
    
    -- Metadati
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELLA per tracking problemi ricorrenti
CREATE TABLE IF NOT EXISTS cultivation_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cultivation_plan_id UUID NOT NULL REFERENCES cultivation_plans(id) ON DELETE CASCADE,
    
    -- Classificazione problema
    issue_type TEXT NOT NULL CHECK (issue_type IN (
        'pest', 'disease', 'weather', 'nutrient', 'watering', 'transplant_shock', 'other'
    )),
    issue_severity TEXT NOT NULL CHECK (issue_severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Dettagli
    issue_description TEXT NOT NULL,
    phase_occurred TEXT NOT NULL,
    location TEXT NOT NULL,
    
    -- Impatto
    quantity_affected INTEGER,
    quantity_lost INTEGER DEFAULT 0,
    
    -- Risoluzione
    resolution_applied TEXT,
    resolution_effective BOOLEAN,
    
    -- Prevenzione futura
    prevention_notes TEXT,
    
    -- Metadati
    detected_date DATE NOT NULL DEFAULT CURRENT_DATE,
    resolved_date DATE,
    photos JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELLA per raccolti dettagliati
CREATE TABLE IF NOT EXISTS detailed_harvests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cultivation_plan_id UUID NOT NULL REFERENCES cultivation_plans(id) ON DELETE CASCADE,
    
    -- Dettagli raccolta
    harvest_date DATE NOT NULL DEFAULT CURRENT_DATE,
    quantity_harvested DECIMAL(8,2) NOT NULL,
    unit_of_measure TEXT NOT NULL DEFAULT 'kg',
    
    -- Qualità
    quality_grade TEXT CHECK (quality_grade IN ('excellent', 'good', 'fair', 'poor')),
    brix_level DECIMAL(4,1), -- Per frutti
    size_category TEXT, -- small, medium, large
    
    -- Condizioni
    plant_health TEXT CHECK (plant_health IN ('excellent', 'good', 'fair', 'poor')),
    weather_conditions JSONB,
    
    -- Destinazione
    destination TEXT CHECK (destination IN ('consumption', 'sale', 'gift', 'compost', 'seed_saving')),
    market_price DECIMAL(8,2), -- Se venduto
    
    -- Metadati
    notes TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FUNZIONE per calcolare statistiche periodiche
CREATE OR REPLACE FUNCTION calculate_cultivation_statistics(
    user_id_param UUID,
    garden_id_param UUID DEFAULT NULL,
    period_start_param DATE DEFAULT NULL,
    period_end_param DATE DEFAULT NULL
) RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FUNZIONE per report problemi ricorrenti
CREATE OR REPLACE FUNCTION get_recurring_issues(
    user_id_param UUID,
    archetype_id_param TEXT DEFAULT NULL,
    min_occurrences INTEGER DEFAULT 2
) RETURNS TABLE (
    issue_type TEXT,
    issue_description TEXT,
    occurrences BIGINT,
    avg_severity DECIMAL,
    most_common_phase TEXT,
    success_rate DECIMAL,
    recommended_prevention TEXT
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. VIEW per dashboard analytics
CREATE OR REPLACE VIEW cultivation_analytics_dashboard AS
SELECT 
    cs.user_id,
    cs.garden_id,
    cs.archetype_id,
    cs.archetype_category,
    
    -- Performance corrente
    cs.success_rate,
    cs.avg_days_to_harvest,
    cs.total_harvest_quantity,
    cs.avg_harvest_per_plant,
    
    -- Confronto con media
    cs.success_rate - AVG(cs.success_rate) OVER (PARTITION BY cs.archetype_id) as success_vs_avg,
    cs.avg_days_to_harvest - AVG(cs.avg_days_to_harvest) OVER (PARTITION BY cs.archetype_id) as days_vs_avg,
    
    -- Trend (confronto con periodo precedente)
    LAG(cs.success_rate) OVER (
        PARTITION BY cs.user_id, cs.garden_id, cs.archetype_id 
        ORDER BY cs.period_start
    ) as prev_success_rate,
    
    -- Problemi principali
    (SELECT COUNT(*) FROM cultivation_issues ci 
     JOIN cultivation_plans cp ON ci.cultivation_plan_id = cp.id
     WHERE cp.user_id = cs.user_id 
     AND cp.archetype_id = cs.archetype_id
     AND ci.detected_date BETWEEN cs.period_start AND cs.period_end
    ) as total_issues,
    
    -- Raccomandazioni
    CASE 
        WHEN cs.success_rate < 50 THEN 'Richiede attenzione immediata'
        WHEN cs.success_rate < 70 THEN 'Margini di miglioramento'
        WHEN cs.success_rate < 90 THEN 'Buone performance'
        ELSE 'Eccellente'
    END as performance_rating,
    
    cs.period_start,
    cs.period_end,
    cs.calculated_at
    
FROM cultivation_statistics cs
WHERE cs.period_type = 'monthly'
ORDER BY cs.user_id, cs.garden_id, cs.archetype_id, cs.period_start DESC;

-- 7. INDICI per performance analytics
CREATE INDEX IF NOT EXISTS idx_cultivation_statistics_user_period ON cultivation_statistics(user_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_cultivation_statistics_archetype ON cultivation_statistics(archetype_id, archetype_category);
CREATE INDEX IF NOT EXISTS idx_cultivation_issues_type_severity ON cultivation_issues(issue_type, issue_severity);
CREATE INDEX IF NOT EXISTS idx_detailed_harvests_plan_date ON detailed_harvests(cultivation_plan_id, harvest_date);

-- 8. RLS POLICIES per nuove tabelle
ALTER TABLE cultivation_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultivation_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE detailed_harvests ENABLE ROW LEVEL SECURITY;

-- Cultivation Statistics Policies
CREATE POLICY "Users can view own cultivation statistics" ON cultivation_statistics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cultivation statistics" ON cultivation_statistics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Cultivation Issues Policies
CREATE POLICY "Users can view own cultivation issues" ON cultivation_issues
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cultivation_plans 
            WHERE id = cultivation_issues.cultivation_plan_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert cultivation issues" ON cultivation_issues
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM cultivation_plans 
            WHERE id = cultivation_issues.cultivation_plan_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own cultivation issues" ON cultivation_issues
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM cultivation_plans 
            WHERE id = cultivation_issues.cultivation_plan_id 
            AND user_id = auth.uid()
        )
    );

-- Detailed Harvests Policies
CREATE POLICY "Users can view own detailed harvests" ON detailed_harvests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cultivation_plans 
            WHERE id = detailed_harvests.cultivation_plan_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert detailed harvests" ON detailed_harvests
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM cultivation_plans 
            WHERE id = detailed_harvests.cultivation_plan_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own detailed harvests" ON detailed_harvests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM cultivation_plans 
            WHERE id = detailed_harvests.cultivation_plan_id 
            AND user_id = auth.uid()
        )
    );

-- 9. TRIGGER per calcolo automatico statistiche
CREATE OR REPLACE FUNCTION auto_calculate_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcola statistiche quando un piano viene completato
    IF NEW.actual_harvest_date IS NOT NULL AND OLD.actual_harvest_date IS NULL THEN
        PERFORM calculate_cultivation_statistics(NEW.user_id, NEW.garden_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER auto_stats_on_harvest
    AFTER UPDATE ON cultivation_plans
    FOR EACH ROW EXECUTE FUNCTION auto_calculate_statistics();

-- 10. COMMENTI per documentazione
COMMENT ON TABLE cultivation_statistics IS 'Statistiche aggregate per performance coltivazioni';
COMMENT ON TABLE cultivation_issues IS 'Tracking problemi ricorrenti e loro risoluzioni';
COMMENT ON TABLE detailed_harvests IS 'Dettagli raccolti con qualità e destinazione';
COMMENT ON FUNCTION calculate_cultivation_statistics IS 'Calcola statistiche periodiche per utente/giardino';
COMMENT ON FUNCTION get_recurring_issues IS 'Identifica problemi ricorrenti e raccomandazioni';
COMMENT ON VIEW cultivation_analytics_dashboard IS 'Dashboard completa analytics coltivazioni';