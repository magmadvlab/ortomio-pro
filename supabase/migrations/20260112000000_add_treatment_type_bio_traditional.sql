-- =====================================================
-- MIGRAZIONE: Aggiunta distinzione Bio/Tradizionale per Trattamenti
-- Data: 12 Gennaio 2026
-- Scopo: Supportare registrazione separata prodotti bio e tradizionali
-- =====================================================

-- 1. Aggiungi campo treatment_type alla tabella treatment_register
ALTER TABLE treatment_register 
ADD COLUMN IF NOT EXISTS treatment_type TEXT 
CHECK (treatment_type IN ('organic', 'conventional', 'integrated')) 
DEFAULT 'conventional';

-- 2. Aggiungi campo certification_compliance per tracciare conformità certificazioni
ALTER TABLE treatment_register 
ADD COLUMN IF NOT EXISTS certification_compliance TEXT[] DEFAULT '{}';

-- 3. Aggiungi campo per tracciare se il prodotto è ammesso in agricoltura biologica
ALTER TABLE treatment_register 
ADD COLUMN IF NOT EXISTS organic_approved BOOLEAN DEFAULT false;

-- 4. Aggiungi campo per il numero di registrazione del prodotto fitosanitario
ALTER TABLE treatment_register 
ADD COLUMN IF NOT EXISTS registration_number TEXT;

-- 5. Aggiungi campo per il tempo di carenza
ALTER TABLE treatment_register 
ADD COLUMN IF NOT EXISTS pre_harvest_interval_days INTEGER;

-- 6. Aggiungi indici per performance
CREATE INDEX IF NOT EXISTS idx_treatment_register_type ON treatment_register(treatment_type);
CREATE INDEX IF NOT EXISTS idx_treatment_register_organic_approved ON treatment_register(organic_approved);
CREATE INDEX IF NOT EXISTS idx_treatment_register_garden_type ON treatment_register(garden_id, treatment_type);

-- 7. Aggiorna fertilizer_application_logs per assicurare coerenza
-- (Il campo fertilizerType esiste già, aggiungiamo solo indici se mancanti)
CREATE INDEX IF NOT EXISTS idx_fertilizer_logs_type ON fertilizer_application_logs(fertilizer_type);
CREATE INDEX IF NOT EXISTS idx_fertilizer_logs_garden_type ON fertilizer_application_logs(garden_id, fertilizer_type);

-- 8. Crea vista per statistiche bio/tradizionale
CREATE OR REPLACE VIEW nutrition_statistics_by_type AS
SELECT 
    t.garden_id,
    t.treatment_type,
    COUNT(*) as treatment_count,
    COUNT(DISTINCT t.crop_name) as crops_treated,
    MIN(t.treatment_date) as first_treatment,
    MAX(t.treatment_date) as last_treatment
FROM treatment_register t
WHERE t.treatment_type IS NOT NULL
GROUP BY t.garden_id, t.treatment_type

UNION ALL

SELECT 
    f.garden_id,
    CASE 
        WHEN f.fertilizer_type = 'organic' THEN 'organic'
        ELSE 'conventional'
    END as treatment_type,
    COUNT(*) as treatment_count,
    0 as crops_treated, -- Non applicabile per fertilizzanti
    MIN(f.application_date) as first_treatment,
    MAX(f.application_date) as last_treatment
FROM fertilizer_application_logs f
WHERE f.fertilizer_type IS NOT NULL
GROUP BY f.garden_id, f.fertilizer_type;

-- 9. Funzione per validare compatibilità trattamento con certificazione
CREATE OR REPLACE FUNCTION validate_treatment_certification_compatibility(
    p_garden_id UUID,
    p_treatment_type TEXT,
    p_organic_approved BOOLEAN DEFAULT false
) RETURNS BOOLEAN AS $$
DECLARE
    has_organic_cert BOOLEAN := false;
BEGIN
    -- Verifica se il giardino ha certificazione biologica attiva
    SELECT EXISTS(
        SELECT 1 FROM organic_certifications oc
        WHERE oc.garden_id = p_garden_id
        AND oc.status = 'ACTIVE'
        AND oc.conversion_status IN ('ORGANIC', 'IN_CONVERSION_2', 'IN_CONVERSION_3')
    ) INTO has_organic_cert;
    
    -- Se ha certificazione bio, il trattamento deve essere organic e approvato
    IF has_organic_cert THEN
        RETURN (p_treatment_type = 'organic' AND p_organic_approved = true);
    END IF;
    
    -- Altrimenti qualsiasi trattamento è permesso
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Trigger per validazione automatica
CREATE OR REPLACE FUNCTION check_treatment_certification_compliance()
RETURNS TRIGGER AS $$
BEGIN
    -- Valida compatibilità solo se i campi sono specificati
    IF NEW.treatment_type IS NOT NULL THEN
        IF NOT validate_treatment_certification_compatibility(
            NEW.garden_id, 
            NEW.treatment_type, 
            COALESCE(NEW.organic_approved, false)
        ) THEN
            RAISE EXCEPTION 'Trattamento non compatibile con certificazione biologica del giardino. Utilizzare solo prodotti ammessi in agricoltura biologica.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Applica trigger
DROP TRIGGER IF EXISTS trigger_check_treatment_compliance ON treatment_register;
CREATE TRIGGER trigger_check_treatment_compliance
    BEFORE INSERT OR UPDATE ON treatment_register
    FOR EACH ROW
    EXECUTE FUNCTION check_treatment_certification_compliance();

-- 11. Commenti per documentazione
COMMENT ON COLUMN treatment_register.treatment_type IS 'Tipo di trattamento: organic (biologico), conventional (tradizionale), integrated (integrato)';
COMMENT ON COLUMN treatment_register.certification_compliance IS 'Array di certificazioni con cui il trattamento è compatibile';
COMMENT ON COLUMN treatment_register.organic_approved IS 'Indica se il prodotto è ammesso in agricoltura biologica';
COMMENT ON COLUMN treatment_register.registration_number IS 'Numero di registrazione del prodotto fitosanitario';
COMMENT ON COLUMN treatment_register.pre_harvest_interval_days IS 'Tempo di carenza in giorni prima del raccolto';

-- 12. Dati di esempio per testing (opzionale)
-- Questi verranno aggiunti solo se la tabella è vuota
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM treatment_register LIMIT 1) THEN
        -- Inserisci alcuni dati di esempio per testing
        INSERT INTO treatment_register (
            user_id, garden_id, crop_name, treatment_date, product_name, 
            treatment_type, organic_approved, active_ingredient,
            dosage, dosage_unit, method, reason, notes
        ) VALUES 
        (
            (SELECT auth.uid()),
            (SELECT id FROM gardens WHERE user_id = auth.uid() LIMIT 1),
            'Pomodoro', 
            CURRENT_DATE - INTERVAL '7 days',
            'Rame Ossicloruro Bio',
            'organic',
            true,
            'Ossicloruro di rame',
            2.5,
            'g',
            'spray',
            'preventive',
            'Trattamento preventivo biologico contro peronospora'
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignora errori se non ci sono giardini o utenti
        NULL;
END $$;