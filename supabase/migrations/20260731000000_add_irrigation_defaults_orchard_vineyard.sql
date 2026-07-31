-- ============================================================================
-- Add irrigation_defaults column to orchard_configurations and
-- vineyard_configurations. The orchard column was referenced by
-- services/orchardService.ts since the orchard advanced-features work but
-- was never actually created by a migration; the service has been silently
-- falling back to browser localStorage on every write. This migration adds
-- the real column for both crops so the "default irrigation profile" panel
-- persists correctly.
-- ============================================================================

ALTER TABLE orchard_configurations ADD COLUMN IF NOT EXISTS irrigation_defaults JSONB;
ALTER TABLE vineyard_configurations ADD COLUMN IF NOT EXISTS irrigation_defaults JSONB;
