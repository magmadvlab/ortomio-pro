-- ============================================
-- ORTOMIO DATABASE - PARTE 2: RLS POLICIES
-- Esegui questo SQL su Supabase.com SQL Editor DOPO la Parte 1
-- ============================================

-- IMPORTANTE: Queste policies garantiscono che ogni utente veda solo i propri dati

-- ============================================
-- 1. PROFILES - Row Level Security
-- ============================================

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can only access their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create policies
CREATE POLICY "Users can only access their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. GARDENS - Row Level Security
-- ============================================

ALTER TABLE public.gardens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own gardens" ON public.gardens;
DROP POLICY IF EXISTS "Users can create their own gardens" ON public.gardens;
DROP POLICY IF EXISTS "Users can update their own gardens" ON public.gardens;
DROP POLICY IF EXISTS "Users can delete their own gardens" ON public.gardens;

CREATE POLICY "Users can view their own gardens"
  ON public.gardens
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own gardens"
  ON public.gardens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gardens"
  ON public.gardens
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gardens"
  ON public.gardens
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. CALENDAR_TASKS - Row Level Security
-- ============================================

ALTER TABLE public.calendar_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view tasks for their gardens" ON public.calendar_tasks;
DROP POLICY IF EXISTS "Users can create tasks for their gardens" ON public.calendar_tasks;
DROP POLICY IF EXISTS "Users can update tasks for their gardens" ON public.calendar_tasks;
DROP POLICY IF EXISTS "Users can delete tasks for their gardens" ON public.calendar_tasks;

CREATE POLICY "Users can view tasks for their gardens"
  ON public.calendar_tasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gardens
      WHERE gardens.id = calendar_tasks.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks for their gardens"
  ON public.calendar_tasks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.gardens
      WHERE gardens.id = calendar_tasks.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks for their gardens"
  ON public.calendar_tasks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.gardens
      WHERE gardens.id = calendar_tasks.garden_id
      AND gardens.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.gardens
      WHERE gardens.id = calendar_tasks.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks for their gardens"
  ON public.calendar_tasks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.gardens
      WHERE gardens.id = calendar_tasks.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

-- ============================================
-- 4. SEED_INVENTORY - Row Level Security
-- ============================================

ALTER TABLE public.seed_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own seeds" ON public.seed_inventory;
DROP POLICY IF EXISTS "Users can create their own seeds" ON public.seed_inventory;
DROP POLICY IF EXISTS "Users can update their own seeds" ON public.seed_inventory;
DROP POLICY IF EXISTS "Users can delete their own seeds" ON public.seed_inventory;

CREATE POLICY "Users can view their own seeds"
  ON public.seed_inventory
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own seeds"
  ON public.seed_inventory
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own seeds"
  ON public.seed_inventory
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own seeds"
  ON public.seed_inventory
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. AI_CREDIT_TRANSACTIONS - Row Level Security
-- ============================================

ALTER TABLE public.ai_credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own credit transactions" ON public.ai_credit_transactions;
DROP POLICY IF EXISTS "Users can create their own credit transactions" ON public.ai_credit_transactions;

CREATE POLICY "Users can view their own credit transactions"
  ON public.ai_credit_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own credit transactions"
  ON public.ai_credit_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 6. GARDEN_BEDS - Row Level Security
-- ============================================

ALTER TABLE public.garden_beds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view beds for their gardens" ON public.garden_beds;
DROP POLICY IF EXISTS "Users can create beds for their gardens" ON public.garden_beds;
DROP POLICY IF EXISTS "Users can update beds for their gardens" ON public.garden_beds;
DROP POLICY IF EXISTS "Users can delete beds for their gardens" ON public.garden_beds;

CREATE POLICY "Users can view beds for their gardens"
  ON public.garden_beds
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gardens
      WHERE gardens.id = garden_beds.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create beds for their gardens"
  ON public.garden_beds
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.gardens
      WHERE gardens.id = garden_beds.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update beds for their gardens"
  ON public.garden_beds
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.gardens
      WHERE gardens.id = garden_beds.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete beds for their gardens"
  ON public.garden_beds
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.gardens
      WHERE gardens.id = garden_beds.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

-- ============================================
-- 7. GARDEN_ZONES - Row Level Security
-- ============================================

ALTER TABLE public.garden_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view zones for their gardens" ON public.garden_zones;
DROP POLICY IF EXISTS "Users can create zones for their gardens" ON public.garden_zones;
DROP POLICY IF EXISTS "Users can update zones for their gardens" ON public.garden_zones;
DROP POLICY IF EXISTS "Users can delete zones for their gardens" ON public.garden_zones;

CREATE POLICY "Users can view zones for their gardens"
  ON public.garden_zones
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gardens
      WHERE gardens.id = garden_zones.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create zones for their gardens"
  ON public.garden_zones
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.gardens
      WHERE gardens.id = garden_zones.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update zones for their gardens"
  ON public.garden_zones
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.gardens
      WHERE gardens.id = garden_zones.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete zones for their gardens"
  ON public.garden_zones
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.gardens
      WHERE gardens.id = garden_zones.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

-- ============================================
-- FINE PARTE 2
-- ============================================

-- ✅ RLS configurato per le tabelle principali
-- Vai avanti con PARTE 3 se necessario
