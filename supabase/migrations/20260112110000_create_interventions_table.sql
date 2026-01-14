-- ============================================
-- INTERVENTIONS TABLE MIGRATION
-- ============================================
-- Crea la tabella per gestire gli interventi creati dai pulsanti azione

-- Crea la tabella interventions
CREATE TABLE IF NOT EXISTS interventions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    garden_id UUID REFERENCES gardens(id) ON DELETE SET NULL,
    
    -- Tipo di intervento
    type TEXT NOT NULL CHECK (type IN ('scouting', 'prescription', 'irrigation', 'treatment')),
    
    -- Informazioni base
    title TEXT NOT NULL,
    description TEXT,
    
    -- Zona di riferimento
    zone_id UUID,
    zone_name TEXT,
    
    -- Pianificazione
    scheduled_date TIMESTAMPTZ NOT NULL,
    assigned_to TEXT,
    
    -- Priorità e stato
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'in_progress', 'completed', 'cancelled')),
    
    -- Contesto sorgente (NDVI, Drone, IoT)
    source_context JSONB NOT NULL,
    
    -- Parametri specifici per tipo di intervento
    parameters JSONB DEFAULT '{}',
    
    -- Timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_interventions_user_id ON interventions(user_id);
CREATE INDEX IF NOT EXISTS idx_interventions_garden_id ON interventions(garden_id);
CREATE INDEX IF NOT EXISTS idx_interventions_type ON interventions(type);
CREATE INDEX IF NOT EXISTS idx_interventions_status ON interventions(status);
CREATE INDEX IF NOT EXISTS idx_interventions_priority ON interventions(priority);
CREATE INDEX IF NOT EXISTS idx_interventions_scheduled_date ON interventions(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_interventions_zone_id ON interventions(zone_id);

-- Indice composto per query comuni
CREATE INDEX IF NOT EXISTS idx_interventions_user_status_date ON interventions(user_id, status, scheduled_date);

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION trigger_update_interventions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_interventions_updated_at
    BEFORE UPDATE ON interventions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_interventions_updated_at();

-- RLS (Row Level Security)
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;

-- Policy: Gli utenti possono vedere solo i propri interventi
CREATE POLICY "Users can view their own interventions"
    ON interventions FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Gli utenti possono inserire i propri interventi
CREATE POLICY "Users can insert their own interventions"
    ON interventions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Gli utenti possono aggiornare i propri interventi
CREATE POLICY "Users can update their own interventions"
    ON interventions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Gli utenti possono eliminare i propri interventi
CREATE POLICY "Users can delete their own interventions"
    ON interventions FOR DELETE
    USING (auth.uid() = user_id);

-- Commenti per documentazione
COMMENT ON TABLE interventions IS 'Tabella per gestire gli interventi creati tramite Action Buttons';
COMMENT ON COLUMN interventions.type IS 'Tipo di intervento: scouting, prescription, irrigation, treatment';
COMMENT ON COLUMN interventions.source_context IS 'Contesto della sorgente che ha generato l''intervento (NDVI, Drone, IoT)';
COMMENT ON COLUMN interventions.parameters IS 'Parametri specifici per il tipo di intervento';
COMMENT ON COLUMN interventions.zone_id IS 'ID della zona di riferimento (può essere garden_zones o field_rows)';
COMMENT ON COLUMN interventions.priority IS 'Priorità dell''intervento: low, medium, high, critical';
COMMENT ON COLUMN interventions.status IS 'Stato dell''intervento: draft, scheduled, in_progress, completed, cancelled';

-- Inserisci alcuni dati di esempio per testing (solo se non esistono già)
DO $$
BEGIN
    -- Verifica se esistono già interventi
    IF NOT EXISTS (SELECT 1 FROM interventions LIMIT 1) THEN
        -- Inserisci dati di esempio solo se la tabella è vuota
        INSERT INTO interventions (
            id, user_id, type, title, description, scheduled_date, priority, status, source_context, parameters
        ) VALUES 
        (
            'intervention_example_1',
            (SELECT id FROM auth.users LIMIT 1), -- Prende il primo utente disponibile
            'scouting',
            'Verifica Stress NDVI - Zona Nord',
            'Controllo sul campo per validare alert NDVI su possibile stress idrico',
            NOW() + INTERVAL '1 day',
            'high',
            'scheduled',
            '{"sourceType": "ndvi", "ndvi_value": 0.45, "timestamp": "2026-01-12T10:00:00Z"}',
            '{"checklistItems": ["stress_idrico", "sintomi_foglie", "foto_documentazione"]}'
        ),
        (
            'intervention_example_2',
            (SELECT id FROM auth.users LIMIT 1),
            'prescription',
            'Mappa Fertilizzazione Variabile',
            'Creazione mappa prescrizione per fertilizzazione azotata basata su analisi NDVI',
            NOW() + INTERVAL '3 days',
            'medium',
            'draft',
            '{"sourceType": "ndvi", "ndvi_value": 0.52, "timestamp": "2026-01-12T10:00:00Z"}',
            '{"prescriptionType": "Fertilizzazione", "targetRate": "120", "product": "Urea 46%"}'
        );
        
        RAISE NOTICE '✅ Dati di esempio inseriti nella tabella interventions';
    ELSE
        RAISE NOTICE '✅ Tabella interventions già popolata, skip inserimento esempi';
    END IF;
END $$;

-- Log di completamento
DO $$
BEGIN
    RAISE NOTICE '
    =====================================
    🎯 INTERVENTIONS TABLE CREATED!
    =====================================
    
    ✅ Tabella interventions creata con successo
    ✅ Indici per performance ottimizzati
    ✅ RLS policies configurate
    ✅ Trigger per updated_at attivo
    ✅ Dati di esempio inseriti
    
    🚀 FUNZIONALITÀ DISPONIBILI:
    • Creazione interventi da Action Buttons
    • Gestione completa workflow interventi
    • Tracking stato e priorità
    • Integrazione con zone e gardens
    • Parametri personalizzabili per tipo
    
    📊 TIPI INTERVENTO SUPPORTATI:
    • scouting - Verifiche sul campo
    • prescription - Mappe prescrizione
    • irrigation - Gestione irrigazione
    • treatment - Trattamenti/nutrizione
    
    🔧 PROSSIMO STEP:
    Integrare ActionButton nei componenti NDVI, Drone, IoT
    =====================================';
END $$;