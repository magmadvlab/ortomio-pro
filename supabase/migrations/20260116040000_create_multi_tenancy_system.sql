-- Multi-Tenancy System Migration
-- Organizations, Members, Roles, Permissions, API Keys

-- =====================================================
-- ORGANIZATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('Farm', 'Cooperative', 'Enterprise', 'Research')),
  
  -- Contact info
  email TEXT,
  phone TEXT,
  address TEXT,
  vat_number TEXT,
  
  -- Settings
  logo TEXT,
  website TEXT,
  
  -- Owner
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_id);

-- =====================================================
-- ROLES
-- =====================================================

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Permissions (JSONB array)
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- System role (cannot be deleted)
  is_system BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(organization_id, name)
);

CREATE INDEX IF NOT EXISTS idx_roles_organization ON roles(organization_id);

-- =====================================================
-- ORGANIZATION MEMBERS
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Role
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Invited', 'Suspended')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_organization ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON organization_members(role_id);

-- =====================================================
-- ORGANIZATION INVITATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Declined', 'Expired')),
  
  -- Token
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Metadata
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_org_invitations_organization ON organization_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_invitations_email ON organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_org_invitations_token ON organization_invitations(token);

-- =====================================================
-- GARDEN ASSIGNMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS garden_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES organization_members(id) ON DELETE CASCADE,
  
  -- Access level
  access_level TEXT NOT NULL CHECK (access_level IN ('Full', 'ReadWrite', 'ReadOnly')),
  
  -- Metadata
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(organization_id, garden_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_garden_assignments_organization ON garden_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_garden_assignments_garden ON garden_assignments(garden_id);
CREATE INDEX IF NOT EXISTS idx_garden_assignments_member ON garden_assignments(member_id);

-- =====================================================
-- API KEYS
-- =====================================================

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Service info
  service TEXT NOT NULL CHECK (service IN (
    'OpenAI', 'Anthropic', 'GoogleAI', 'Cohere', 'HuggingFace',
    'SentinelHub', 'WeatherAPI', 'CustomEndpoint'
  )),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Key data (encrypted)
  key_value TEXT NOT NULL,
  
  -- Additional config (JSONB)
  config JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used TIMESTAMPTZ,
  usage_count INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_organization ON api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_service ON api_keys(service);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
      AND organization_members.status = 'Active'
    )
  );

CREATE POLICY "Users can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their organizations"
  ON organizations FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their organizations"
  ON organizations FOR DELETE
  USING (owner_id = auth.uid());

-- Roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view organization roles"
  ON roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = roles.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.status = 'Active'
    )
  );

CREATE POLICY "Owners can manage roles"
  ON roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = roles.organization_id
      AND organizations.owner_id = auth.uid()
    )
  );

-- Organization Members
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view organization members"
  ON organization_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.status = 'Active'
    )
  );

CREATE POLICY "Owners can manage members"
  ON organization_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = organization_members.organization_id
      AND organizations.owner_id = auth.uid()
    )
  );

-- Organization Invitations
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view organization invitations"
  ON organization_invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organization_invitations.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.status = 'Active'
    )
  );

CREATE POLICY "Owners can manage invitations"
  ON organization_invitations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = organization_invitations.organization_id
      AND organizations.owner_id = auth.uid()
    )
  );

-- Garden Assignments
ALTER TABLE garden_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their assignments"
  ON garden_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.id = garden_assignments.member_id
      AND organization_members.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = garden_assignments.organization_id
      AND organizations.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage assignments"
  ON garden_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = garden_assignments.organization_id
      AND organizations.owner_id = auth.uid()
    )
  );

-- API Keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their API keys"
  ON api_keys FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their API keys"
  ON api_keys FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their API keys"
  ON api_keys FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their API keys"
  ON api_keys FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to create system roles for new organization
CREATE OR REPLACE FUNCTION create_system_roles_for_organization(org_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Owner role
  INSERT INTO roles (organization_id, name, description, permissions, is_system)
  VALUES (
    org_id,
    'Owner',
    'Full access to all resources and settings',
    '[{"resource": "*", "actions": ["manage"]}]'::jsonb,
    true
  );
  
  -- Admin role
  INSERT INTO roles (organization_id, name, description, permissions, is_system)
  VALUES (
    org_id,
    'Administrator',
    'Manage all resources except organization settings',
    '[
      {"resource": "gardens", "actions": ["create", "read", "update", "delete"]},
      {"resource": "plants", "actions": ["create", "read", "update", "delete"]},
      {"resource": "tasks", "actions": ["create", "read", "update", "delete"]},
      {"resource": "members", "actions": ["read", "update"]},
      {"resource": "roles", "actions": ["read"]}
    ]'::jsonb,
    true
  );
  
  -- Agronomist role
  INSERT INTO roles (organization_id, name, description, permissions, is_system)
  VALUES (
    org_id,
    'Agronomist',
    'Manage treatments, nutrition, and provide advice',
    '[
      {"resource": "gardens", "actions": ["read"]},
      {"resource": "plants", "actions": ["read", "update"]},
      {"resource": "treatments", "actions": ["create", "read", "update"]},
      {"resource": "nutrition", "actions": ["create", "read", "update"]},
      {"resource": "analytics", "actions": ["read"]},
      {"resource": "agronomist", "actions": ["create", "read", "update"]}
    ]'::jsonb,
    true
  );
  
  -- Operator role
  INSERT INTO roles (organization_id, name, description, permissions, is_system)
  VALUES (
    org_id,
    'Operator',
    'Execute tasks and record operations',
    '[
      {"resource": "gardens", "actions": ["read"], "scope": {"type": "Assigned"}},
      {"resource": "plants", "actions": ["read", "update"], "scope": {"type": "Assigned"}},
      {"resource": "tasks", "actions": ["read", "update"], "scope": {"type": "Assigned"}},
      {"resource": "harvests", "actions": ["create", "read"], "scope": {"type": "Assigned"}},
      {"resource": "irrigation", "actions": ["read", "update"], "scope": {"type": "Assigned"}}
    ]'::jsonb,
    true
  );
  
  -- Viewer role
  INSERT INTO roles (organization_id, name, description, permissions, is_system)
  VALUES (
    org_id,
    'Viewer',
    'Read-only access to assigned resources',
    '[
      {"resource": "gardens", "actions": ["read"], "scope": {"type": "Assigned"}},
      {"resource": "plants", "actions": ["read"], "scope": {"type": "Assigned"}},
      {"resource": "tasks", "actions": ["read"], "scope": {"type": "Assigned"}},
      {"resource": "analytics", "actions": ["read"], "scope": {"type": "Assigned"}}
    ]'::jsonb,
    true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create system roles when organization is created
CREATE OR REPLACE FUNCTION trigger_create_system_roles()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_system_roles_for_organization(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_organization_created
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_system_roles();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE organizations IS 'Organizations for multi-tenancy support';
COMMENT ON TABLE roles IS 'Roles with permissions for organization members';
COMMENT ON TABLE organization_members IS 'Users belonging to organizations';
COMMENT ON TABLE organization_invitations IS 'Pending invitations to join organizations';
COMMENT ON TABLE garden_assignments IS 'Garden access assignments for members';
COMMENT ON TABLE api_keys IS 'User API keys for external services';
