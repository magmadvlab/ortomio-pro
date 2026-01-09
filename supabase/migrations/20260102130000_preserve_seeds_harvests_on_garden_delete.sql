-- Fix CASCADE DELETE per preservare semi e raccolti quando si elimina un orto
-- Created: 2026-01-02

-- IMPORTANTE: Quando elimini un orto per cambio stagione, vuoi:
-- ✅ PRESERVARE: Semi, Raccolti completati (storico importante)
-- ❌ ELIMINARE: Piante attive, Task futuri, Configurazioni specifiche del garden

-- 1. SEED_INVENTORY: Cambia garden_id da CASCADE a SET NULL
-- I semi sono dell'utente, non del giardino specifico
-- Quando elimini un garden, i semi rimangono disponibili per il prossimo

DO $$
BEGIN
  -- Rimuovi il vecchio constraint con CASCADE
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name LIKE 'seed_inventory_garden_id%'
    AND table_name = 'seed_inventory'
  ) THEN
    ALTER TABLE seed_inventory DROP CONSTRAINT seed_inventory_garden_id_fkey;
    RAISE NOTICE 'Rimosso constraint CASCADE da seed_inventory.garden_id';
  END IF;

  -- Rendi garden_id nullable
  ALTER TABLE seed_inventory ALTER COLUMN garden_id DROP NOT NULL;

  -- Aggiungi nuovo constraint con SET NULL
  ALTER TABLE seed_inventory
    ADD CONSTRAINT seed_inventory_garden_id_fkey
    FOREIGN KEY (garden_id)
    REFERENCES gardens(id)
    ON DELETE SET NULL;

  RAISE NOTICE 'Aggiunto constraint SET NULL a seed_inventory.garden_id';
END $$;

-- 2. HARVEST_LOGS: Cambia garden_id da CASCADE a SET NULL
-- I raccolti sono storico prezioso, non devono essere eliminati

DO $$
BEGIN
  -- Rimuovi il vecchio constraint con CASCADE
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name LIKE 'harvest_logs_garden_id%'
    AND table_name = 'harvest_logs'
  ) THEN
    ALTER TABLE harvest_logs DROP CONSTRAINT harvest_logs_garden_id_fkey;
    RAISE NOTICE 'Rimosso constraint CASCADE da harvest_logs.garden_id';
  END IF;

  -- Rendi garden_id nullable
  ALTER TABLE harvest_logs ALTER COLUMN garden_id DROP NOT NULL;

  -- Aggiungi nuovo constraint con SET NULL
  ALTER TABLE harvest_logs
    ADD CONSTRAINT harvest_logs_garden_id_fkey
    FOREIGN KEY (garden_id)
    REFERENCES gardens(id)
    ON DELETE SET NULL;

  RAISE NOTICE 'Aggiunto constraint SET NULL a harvest_logs.garden_id';
END $$;

-- 3. GARDEN_TASKS: Task completati rimangono come storico, task futuri vengono eliminati
-- Questa parte è già OK perché garden_tasks ha CASCADE (vogliamo eliminare task futuri)
-- Ma i task completati potrebbero rimanere? Verifichiamo...
-- Commento: Per ora lasciamo CASCADE sui tasks, l'utente può decidere

COMMENT ON TABLE seed_inventory IS
'Inventario semi dell''utente. garden_id è opzionale (SET NULL) per permettere riuso dei semi tra garden diversi';

COMMENT ON TABLE harvest_logs IS
'Log raccolti (storico). garden_id è opzionale (SET NULL) per preservare lo storico anche dopo eliminazione garden';
