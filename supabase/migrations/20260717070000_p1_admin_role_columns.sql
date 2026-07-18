-- Additive fix: profiles.role/is_superadmin were referenced by requireAdmin()
-- (lib/auth.server.ts) and by P7/P8 RLS policies and set_release_capability_rollout(),
-- but never existed on this database. Every admin check silently denied
-- everyone. This adds the columns and grants admin to the two owner accounts.

BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  ADD COLUMN IF NOT EXISTS is_superadmin boolean NOT NULL DEFAULT false;

UPDATE public.profiles SET role = 'admin', is_superadmin = true
  WHERE email IN ('roberto.lalinga@gmail.com', 'magmadvlab@gmail.com');

DROP POLICY IF EXISTS admin_audit_admin_only ON public.admin_audit_log;
CREATE POLICY admin_audit_admin_only ON public.admin_audit_log FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.is_superadmin = true)));

DROP POLICY IF EXISTS release_rollouts_admin_read ON public.release_capability_rollouts;
CREATE POLICY release_rollouts_admin_read ON public.release_capability_rollouts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND (p.role='admin' OR p.is_superadmin=true)));

DROP POLICY IF EXISTS release_observability_owner_read ON public.release_observability_events;
CREATE POLICY release_observability_owner_read ON public.release_observability_events FOR SELECT TO authenticated
USING (
  user_id=auth.uid()
  OR EXISTS (SELECT 1 FROM public.gardens g WHERE g.id=garden_id AND g.user_id=auth.uid())
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND (p.role='admin' OR p.is_superadmin=true))
);

DROP POLICY IF EXISTS release_rollout_audit_admin_read ON public.release_rollout_audit;
CREATE POLICY release_rollout_audit_admin_read ON public.release_rollout_audit FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND (p.role='admin' OR p.is_superadmin=true)));

COMMIT;
