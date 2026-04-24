-- Canonical agronomic decision/outcome ledger
-- Promotes queue decision history from profiles.preferences JSON into queryable tables.

CREATE TABLE IF NOT EXISTS public.agronomic_decision_ledger_entries (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  queue_item_id TEXT NOT NULL,
  source TEXT NOT NULL,
  focus TEXT NOT NULL,
  agronomic_profile_id TEXT,
  scope_label TEXT,
  plant_name TEXT,
  task_suggested_by TEXT,
  task_id UUID REFERENCES public.garden_tasks(id) ON DELETE SET NULL,
  task_type TEXT,
  planned_date DATE,
  status TEXT NOT NULL CHECK (status IN ('task_created', 'completed')),
  task_created_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  decision_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  actor_type TEXT NOT NULL DEFAULT 'ai' CHECK (actor_type IN ('ai', 'user', 'device', 'automation', 'manual')),
  source_type TEXT NOT NULL DEFAULT 'agronomic_queue',
  garden_scope_id TEXT,
  zone_id TEXT,
  field_row_id TEXT,
  tree_id TEXT,
  plant_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agronomic_decision_ledger_garden_updated
  ON public.agronomic_decision_ledger_entries(garden_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_agronomic_decision_ledger_user_updated
  ON public.agronomic_decision_ledger_entries(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_agronomic_decision_ledger_queue_item
  ON public.agronomic_decision_ledger_entries(queue_item_id);
CREATE INDEX IF NOT EXISTS idx_agronomic_decision_ledger_task
  ON public.agronomic_decision_ledger_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_agronomic_decision_ledger_status
  ON public.agronomic_decision_ledger_entries(status);
CREATE INDEX IF NOT EXISTS idx_agronomic_decision_ledger_snapshot
  ON public.agronomic_decision_ledger_entries USING GIN(decision_snapshot);

CREATE TABLE IF NOT EXISTS public.agronomic_queue_outcomes (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.garden_tasks(id) ON DELETE SET NULL,
  queue_item_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  task_type TEXT NOT NULL,
  plant_name TEXT NOT NULL,
  scheduling_type TEXT,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  execution_evidence JSONB,
  measurement_evidence JSONB,
  evidence_snapshot JSONB,
  operator_evidence JSONB,
  actor_type TEXT NOT NULL DEFAULT 'user' CHECK (actor_type IN ('ai', 'user', 'device', 'automation', 'manual')),
  source_type TEXT NOT NULL DEFAULT 'agronomic_queue',
  zone_id TEXT,
  field_row_id TEXT,
  tree_id TEXT,
  plant_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agronomic_queue_outcomes_garden_completed
  ON public.agronomic_queue_outcomes(garden_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_agronomic_queue_outcomes_user_completed
  ON public.agronomic_queue_outcomes(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_agronomic_queue_outcomes_task
  ON public.agronomic_queue_outcomes(task_id);
CREATE INDEX IF NOT EXISTS idx_agronomic_queue_outcomes_queue_item
  ON public.agronomic_queue_outcomes(queue_item_id);
CREATE INDEX IF NOT EXISTS idx_agronomic_queue_outcomes_metadata
  ON public.agronomic_queue_outcomes USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_agronomic_queue_outcomes_evidence
  ON public.agronomic_queue_outcomes USING GIN(evidence_snapshot);

CREATE OR REPLACE FUNCTION public.update_agronomic_ledger_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_agronomic_decision_ledger_updated_at
  ON public.agronomic_decision_ledger_entries;
CREATE TRIGGER trigger_agronomic_decision_ledger_updated_at
  BEFORE UPDATE ON public.agronomic_decision_ledger_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_agronomic_ledger_updated_at();

DROP TRIGGER IF EXISTS trigger_agronomic_queue_outcomes_updated_at
  ON public.agronomic_queue_outcomes;
CREATE TRIGGER trigger_agronomic_queue_outcomes_updated_at
  BEFORE UPDATE ON public.agronomic_queue_outcomes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_agronomic_ledger_updated_at();

ALTER TABLE public.agronomic_decision_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agronomic_queue_outcomes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own agronomic decision ledger entries"
  ON public.agronomic_decision_ledger_entries;
CREATE POLICY "Users can view their own agronomic decision ledger entries"
  ON public.agronomic_decision_ledger_entries
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own agronomic decision ledger entries"
  ON public.agronomic_decision_ledger_entries;
CREATE POLICY "Users can insert their own agronomic decision ledger entries"
  ON public.agronomic_decision_ledger_entries
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.gardens
      WHERE gardens.id = agronomic_decision_ledger_entries.garden_id
        AND gardens.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own agronomic decision ledger entries"
  ON public.agronomic_decision_ledger_entries;
CREATE POLICY "Users can update their own agronomic decision ledger entries"
  ON public.agronomic_decision_ledger_entries
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own agronomic decision ledger entries"
  ON public.agronomic_decision_ledger_entries;
CREATE POLICY "Users can delete their own agronomic decision ledger entries"
  ON public.agronomic_decision_ledger_entries
  FOR DELETE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their own agronomic queue outcomes"
  ON public.agronomic_queue_outcomes;
CREATE POLICY "Users can view their own agronomic queue outcomes"
  ON public.agronomic_queue_outcomes
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own agronomic queue outcomes"
  ON public.agronomic_queue_outcomes;
CREATE POLICY "Users can insert their own agronomic queue outcomes"
  ON public.agronomic_queue_outcomes
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.gardens
      WHERE gardens.id = agronomic_queue_outcomes.garden_id
        AND gardens.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own agronomic queue outcomes"
  ON public.agronomic_queue_outcomes;
CREATE POLICY "Users can update their own agronomic queue outcomes"
  ON public.agronomic_queue_outcomes
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own agronomic queue outcomes"
  ON public.agronomic_queue_outcomes;
CREATE POLICY "Users can delete their own agronomic queue outcomes"
  ON public.agronomic_queue_outcomes
  FOR DELETE
  USING (user_id = auth.uid());

COMMENT ON TABLE public.agronomic_decision_ledger_entries
  IS 'Normalized decision ledger linking AI/user decisions to suggested tasks and later outcomes.';
COMMENT ON TABLE public.agronomic_queue_outcomes
  IS 'Normalized outcome ledger for agronomic queue tasks, execution evidence and measured results.';
