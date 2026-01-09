# 🌱 SCHEMA RELAZIONI ORCHESTRATORE COLTIVAZIONE

## 📋 **TABELLE PRINCIPALI**

### 1. **cultivation_plans** (Piano Maestro)
```sql
cultivation_plans
├── id (UUID) - Identificativo unico piano
├── user_id (UUID) → auth.users
├── garden_id (UUID) → gardens
├── archetype_id (TEXT) - A1, A2, etc.
├── archetype_category (TEXT) - vegetable, aromatic, berry, tree
├── plant_name (TEXT) - Nome pianta
├── variety_name (TEXT) - Varietà specifica
├── starting_material (TEXT) - seed, seedling, sapling, cutting, bulb
├── seed_inventory_id (UUID) → seed_inventory (se parte da seme)
├── seedling_batch_id (UUID) → seedling_batches (se parte da piantina)
├── sapling_inventory_id (UUID) → sapling_inventory (se parte da alberello)
├── current_phase (TEXT) - Fase attuale
├── current_location (TEXT) - Dove si trova ora
├── current_quantity (INTEGER) - Quantità attuale
├── planned_start_date (DATE) - Data pianificata
├── actual_start_date (DATE) - Data effettiva inizio
├── estimated_harvest_date (DATE) - Raccolta stimata
├── actual_harvest_date (DATE) - Raccolta effettiva
├── phase_history (JSONB) - Storico fasi
├── notes (TEXT) - Note generali
└── is_active (BOOLEAN) - Piano attivo
```

### 2. **phase_transitions** (Log Dettagliato)
```sql
phase_transitions
├── id (UUID) - Identificativo transizione
├── cultivation_plan_id (UUID) → cultivation_plans
├── from_phase (TEXT) - Fase precedente
├── to_phase (TEXT) - Nuova fase
├── transition_date (TIMESTAMPTZ) - Quando è avvenuta
├── location (TEXT) - Dove è avvenuta
├── quantity_before (INTEGER) - Quantità prima
├── quantity_after (INTEGER) - Quantità dopo
├── phase_data (JSONB) - Dati specifici fase
├── notes (TEXT) - Note transizione
├── photos (JSONB) - Array foto
└── weather_conditions (JSONB) - Condizioni meteo
```

### 3. **sapling_inventory** (Nuova - Alberelli)
```sql
sapling_inventory
├── id (UUID) - Identificativo alberello
├── user_id (UUID) → auth.users
├── garden_id (UUID) → gardens
├── species_name (TEXT) - Specie
├── variety_name (TEXT) - Varietà
├── rootstock (TEXT) - Portainnesto
├── supplier (TEXT) - Fornitore
├── purchase_date (DATE) - Data acquisto
├── purchase_price (DECIMAL) - Prezzo
├── age_years (INTEGER) - Età in anni
├── height_cm (INTEGER) - Altezza
├── pot_size_liters (INTEGER) - Dimensione vaso
├── quantity_available (INTEGER) - Disponibili
├── quantity_planted (INTEGER) - Già piantati
├── notes (TEXT) - Note
└── photos (JSONB) - Foto
```

## 🔗 **RELAZIONI E FLUSSO**

### **FLUSSO COMPLETO TRACCIATO:**

```
1. PIANIFICAZIONE
   cultivation_plans.current_phase = 'planning'
   ↓

2. PREPARAZIONE MATERIALE
   IF starting_material = 'seed':
     → Collega seed_inventory_id
     → Scala quantità semi
   IF starting_material = 'seedling':
     → Collega seedling_batch_id
   IF starting_material = 'sapling':
     → Collega sapling_inventory_id
   ↓

3. OGNI CAMBIO FASE
   → INSERT in phase_transitions
   → UPDATE cultivation_plans.current_phase
   → UPDATE cultivation_plans.current_quantity
   → UPDATE cultivation_plans.current_location
   ↓

4. RACCOLTA
   → INSERT in harvest_logs
   → UPDATE cultivation_plans.actual_harvest_date
   ↓

5. CHIUSURA CICLO
   → cultivation_plans.is_active = false
   → Statistiche aggiornate
```

## 📊 **ESEMPI PRATICI**

### **Esempio 1: Pomodoro da Seme**
```sql
-- 1. Crea piano
INSERT INTO cultivation_plans (
  archetype_id = 'A1',
  plant_name = 'Pomodoro',
  starting_material = 'seed',
  seed_inventory_id = 'uuid-seme-pomodoro',
  current_phase = 'sowing',
  current_location = 'Indoor'
);

-- 2. Scala semi
UPDATE seed_inventory 
SET quantity_remaining = 'Medium' 
WHERE id = 'uuid-seme-pomodoro';

-- 3. Transizione Semina → Germinazione
INSERT INTO phase_transitions (
  cultivation_plan_id = 'uuid-piano',
  from_phase = 'sowing',
  to_phase = 'germination',
  location = 'Indoor',
  quantity_before = 10,
  quantity_after = 8,
  notes = '2 semi non germinati'
);
```

### **Esempio 2: Olivo da Alberello**
```sql
-- 1. Crea piano
INSERT INTO cultivation_plans (
  archetype_id = 'A12',
  plant_name = 'Olivo',
  starting_material = 'sapling',
  sapling_inventory_id = 'uuid-olivo',
  current_phase = 'transplanting',
  current_location = 'Garden'
);

-- 2. Scala alberelli
UPDATE sapling_inventory 
SET quantity_available = quantity_available - 1,
    quantity_planted = quantity_planted + 1
WHERE id = 'uuid-olivo';
```

## 🎯 **QUERY UTILI**

### **Stato Completo Piano**
```sql
SELECT 
  cp.*,
  si.variety_name as seed_variety,
  sb.plant_name as seedling_name,
  sap.variety_name as sapling_variety,
  COUNT(pt.id) as total_transitions
FROM cultivation_plans cp
LEFT JOIN seed_inventory si ON cp.seed_inventory_id = si.id
LEFT JOIN seedling_batches sb ON cp.seedling_batch_id = sb.id  
LEFT JOIN sapling_inventory sap ON cp.sapling_inventory_id = sap.id
LEFT JOIN phase_transitions pt ON cp.id = pt.cultivation_plan_id
WHERE cp.user_id = $1
GROUP BY cp.id, si.variety_name, sb.plant_name, sap.variety_name;
```

### **Storico Transizioni**
```sql
SELECT 
  pt.*,
  cp.plant_name,
  cp.variety_name
FROM phase_transitions pt
JOIN cultivation_plans cp ON pt.cultivation_plan_id = cp.id
WHERE cp.user_id = $1
ORDER BY pt.transition_date DESC;
```

### **Materiali Disponibili per Archetipo**
```sql
-- Funzione già creata nella migrazione
SELECT get_available_materials('garden-uuid', 'A1');
```

## 📈 **STATISTICHE E ANALYTICS**

### **Performance per Archetipo**
```sql
SELECT 
  archetype_id,
  plant_name,
  AVG(EXTRACT(days FROM (actual_harvest_date - actual_start_date))) as avg_days_to_harvest,
  AVG(current_quantity::float / 
      (SELECT quantity_before FROM phase_transitions 
       WHERE cultivation_plan_id = cp.id 
       ORDER BY transition_date LIMIT 1)) as success_rate
FROM cultivation_plans cp
WHERE actual_harvest_date IS NOT NULL
GROUP BY archetype_id, plant_name;
```

### **Perdite per Fase**
```sql
SELECT 
  to_phase,
  AVG(quantity_before - quantity_after) as avg_losses,
  COUNT(*) as total_transitions
FROM phase_transitions
WHERE quantity_before > quantity_after
GROUP BY to_phase
ORDER BY avg_losses DESC;
```

## 🔄 **TRIGGER AUTOMATICI**

### **Auto-update Quantità**
```sql
CREATE OR REPLACE FUNCTION update_plan_quantity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE cultivation_plans 
  SET current_quantity = NEW.quantity_after,
      updated_at = NOW()
  WHERE id = NEW.cultivation_plan_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_plan_quantity
  AFTER INSERT ON phase_transitions
  FOR EACH ROW EXECUTE FUNCTION update_plan_quantity();
```

## 🎯 **VANTAGGI SISTEMA**

1. **Tracciabilità Completa**: Ogni passo è registrato
2. **Relazioni Forti**: Nessun dato orfano
3. **Statistiche Automatiche**: Performance e perdite
4. **Scalabilità**: Supporta qualsiasi tipo di coltivazione
5. **Flessibilità**: JSONB per dati specifici
6. **Integrità**: Foreign keys e constraints
7. **Performance**: Indici ottimizzati
8. **Sicurezza**: RLS policies complete