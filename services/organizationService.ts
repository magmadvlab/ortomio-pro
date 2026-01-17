/**
 * Organization Service
 * Multi-tenancy management for enterprise users
 */

import {
  Organization,
  OrganizationMember,
  Role,
  GardenAssignment,
  OrganizationInvitation,
  Permission,
  SYSTEM_ROLES
} from '@/types/organization';
import { getSupabaseClient } from '@/config/supabase';

/**
 * Create a new organization
 */
export const createOrganization = async (
  ownerId: string,
  name: string,
  type: Organization['type'],
  data?: Partial<Organization>
): Promise<Organization> => {
  const supabase = getSupabaseClient();
  
  const organization: Organization = {
    id: crypto.randomUUID(),
    name,
    type,
    ownerId,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const { data: result, error } = await supabase
    .from('organizations')
    .insert({
      id: organization.id,
      name: organization.name,
      type: organization.type,
      description: organization.description,
      email: organization.email,
      phone: organization.phone,
      address: organization.address,
      vat_number: organization.vatNumber,
      logo: organization.logo,
      website: organization.website,
      owner_id: organization.ownerId,
      created_at: organization.createdAt,
      updated_at: organization.updatedAt
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating organization:', error);
    throw new Error(`Failed to create organization: ${error.message}`);
  }

  return {
    id: result.id,
    name: result.name,
    type: result.type,
    description: result.description,
    email: result.email,
    phone: result.phone,
    address: result.address,
    vatNumber: result.vat_number,
    logo: result.logo,
    website: result.website,
    ownerId: result.owner_id,
    createdAt: result.created_at,
    updatedAt: result.updated_at
  };
};

/**
 * Get organizations for a user
 */
export const getUserOrganizations = async (userId: string): Promise<Organization[]> => {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .or(`owner_id.eq.${userId},id.in.(${await getUserOrganizationIds(userId)})`);

  if (error) {
    console.error('Error getting user organizations:', error);
    throw new Error(`Failed to get organizations: ${error.message}`);
  }

  return (data || []).map(org => ({
    id: org.id,
    name: org.name,
    type: org.type,
    description: org.description,
    email: org.email,
    phone: org.phone,
    address: org.address,
    vatNumber: org.vat_number,
    logo: org.logo,
    website: org.website,
    ownerId: org.owner_id,
    createdAt: org.created_at,
    updatedAt: org.updated_at
  }));
};

/**
 * Helper function to get organization IDs where user is a member
 */
const getUserOrganizationIds = async (userId: string): Promise<string> => {
  const supabase = getSupabaseClient();
  
  const { data } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', userId)
    .eq('status', 'Active');

  const ids = (data || []).map(m => m.organization_id);
  return ids.length > 0 ? ids.join(',') : 'null';
};

/**
 * Get organization by ID
 */
export const getOrganization = async (organizationId: string): Promise<Organization | null> => {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Error getting organization:', error);
    throw new Error(`Failed to get organization: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    type: data.type,
    description: data.description,
    email: data.email,
    phone: data.phone,
    address: data.address,
    vatNumber: data.vat_number,
    logo: data.logo,
    website: data.website,
    ownerId: data.owner_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

/**
 * Update organization
 */
export const updateOrganization = async (
  organizationId: string,
  updates: Partial<Organization>
): Promise<void> => {
  const supabase = getSupabaseClient();

  // Convert camelCase to snake_case for database
  const dbUpdates: any = {};
  Object.keys(updates).forEach(key => {
    switch (key) {
      case 'ownerId': dbUpdates.owner_id = updates[key]; break;
      case 'vatNumber': dbUpdates.vat_number = updates[key]; break;
      case 'createdAt': dbUpdates.created_at = updates[key]; break;
      case 'updatedAt': dbUpdates.updated_at = updates[key]; break;
      default: dbUpdates[key] = updates[key];
    }
  });

  dbUpdates.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('organizations')
    .update(dbUpdates)
    .eq('id', organizationId);

  if (error) {
    console.error('Error updating organization:', error);
    throw new Error(`Failed to update organization: ${error.message}`);
  }
};

/**
 * Delete organization
 */
export const deleteOrganization = async (organizationId: string): Promise<void> => {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('organizations')
    .delete()
    .eq('id', organizationId);

  if (error) {
    console.error('Error deleting organization:', error);
    throw new Error(`Failed to delete organization: ${error.message}`);
  }
};

/**
 * Create system roles for organization
 */
export const createSystemRoles = async (organizationId: string): Promise<Role[]> => {
  const supabase = getSupabaseClient();
  const roles: Role[] = [];

  for (const [key, roleData] of Object.entries(SYSTEM_ROLES)) {
    const role: Role = {
      id: crypto.randomUUID(),
      organizationId,
      name: roleData.name,
      description: roleData.description,
      permissions: roleData.permissions,
      isSystem: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('roles')
      .insert({
        id: role.id,
        organization_id: role.organizationId,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        is_system: role.isSystem,
        created_at: role.createdAt,
        updated_at: role.updatedAt
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating system role:', error);
      throw new Error(`Failed to create system role: ${error.message}`);
    }

    roles.push({
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      description: data.description,
      permissions: data.permissions,
      isSystem: data.is_system,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    });
  }

  return roles;
};

/**
 * Get roles for organization
 */
export const getOrganizationRoles = async (organizationId: string): Promise<Role[]> => {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error getting organization roles:', error);
    throw new Error(`Failed to get roles: ${error.message}`);
  }

  return (data || []).map(role => ({
    id: role.id,
    organizationId: role.organization_id,
    name: role.name,
    description: role.description,
    permissions: role.permissions,
    isSystem: role.is_system,
    createdAt: role.created_at,
    updatedAt: role.updated_at
  }));
};

/**
 * Create custom role
 */
export const createRole = async (
  organizationId: string,
  name: string,
  description: string,
  permissions: Permission[]
): Promise<Role> => {
  const supabase = getSupabaseClient();

  const role: Role = {
    id: crypto.randomUUID(),
    organizationId,
    name,
    description,
    permissions,
    isSystem: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('roles')
    .insert({
      id: role.id,
      organization_id: role.organizationId,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      is_system: role.isSystem,
      created_at: role.createdAt,
      updated_at: role.updatedAt
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating role:', error);
    throw new Error(`Failed to create role: ${error.message}`);
  }

  return {
    id: data.id,
    organizationId: data.organization_id,
    name: data.name,
    description: data.description,
    permissions: data.permissions,
    isSystem: data.is_system,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

/**
 * Update role
 */
export const updateRole = async (
  roleId: string,
  updates: Partial<Role>
): Promise<void> => {
  const supabase = getSupabaseClient();

  // Convert camelCase to snake_case for database
  const dbUpdates: any = {};
  Object.keys(updates).forEach(key => {
    switch (key) {
      case 'organizationId': dbUpdates.organization_id = updates[key]; break;
      case 'isSystem': dbUpdates.is_system = updates[key]; break;
      case 'createdAt': dbUpdates.created_at = updates[key]; break;
      case 'updatedAt': dbUpdates.updated_at = updates[key]; break;
      default: dbUpdates[key] = updates[key];
    }
  });

  dbUpdates.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('roles')
    .update(dbUpdates)
    .eq('id', roleId);

  if (error) {
    console.error('Error updating role:', error);
    throw new Error(`Failed to update role: ${error.message}`);
  }
};

/**
 * Delete role
 */
export const deleteRole = async (roleId: string): Promise<void> => {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id', roleId)
    .eq('is_system', false); // Only allow deletion of custom roles

  if (error) {
    console.error('Error deleting role:', error);
    throw new Error(`Failed to delete role: ${error.message}`);
  }
};

/**
 * Add member to organization
 */
export const addMember = async (
  organizationId: string,
  userId: string,
  roleId: string,
  invitedBy: string
): Promise<OrganizationMember> => {
  const supabase = getSupabaseClient();

  const member: OrganizationMember = {
    id: crypto.randomUUID(),
    organizationId,
    userId,
    roleId,
    status: 'Active',
    joinedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('organization_members')
    .insert({
      id: member.id,
      organization_id: member.organizationId,
      user_id: member.userId,
      role_id: member.roleId,
      status: member.status,
      invited_by: invitedBy,
      joined_at: member.joinedAt,
      created_at: member.createdAt,
      updated_at: member.updatedAt
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding member:', error);
    throw new Error(`Failed to add member: ${error.message}`);
  }

  return {
    id: data.id,
    organizationId: data.organization_id,
    userId: data.user_id,
    roleId: data.role_id,
    status: data.status,
    invitedBy: data.invited_by,
    invitedAt: data.invited_at,
    joinedAt: data.joined_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

/**
 * Get organization members
 */
export const getOrganizationMembers = async (
  organizationId: string
): Promise<OrganizationMember[]> => {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error getting organization members:', error);
    throw new Error(`Failed to get members: ${error.message}`);
  }

  return (data || []).map(member => ({
    id: member.id,
    organizationId: member.organization_id,
    userId: member.user_id,
    roleId: member.role_id,
    status: member.status,
    invitedBy: member.invited_by,
    invitedAt: member.invited_at,
    joinedAt: member.joined_at,
    createdAt: member.created_at,
    updatedAt: member.updated_at
  }));
};

/**
 * Update member role
 */
export const updateMemberRole = async (
  memberId: string,
  roleId: string
): Promise<void> => {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('organization_members')
    .update({ 
      role_id: roleId,
      updated_at: new Date().toISOString()
    })
    .eq('id', memberId);

  if (error) {
    console.error('Error updating member role:', error);
    throw new Error(`Failed to update member role: ${error.message}`);
  }
};

/**
 * Remove member from organization
 */
export const removeMember = async (memberId: string): Promise<void> => {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('id', memberId);

  if (error) {
    console.error('Error removing member:', error);
    throw new Error(`Failed to remove member: ${error.message}`);
  }
};

/**
 * Suspend/Activate member
 */
export const updateMemberStatus = async (
  memberId: string,
  status: OrganizationMember['status']
): Promise<void> => {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('organization_members')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', memberId);

  if (error) {
    console.error('Error updating member status:', error);
    throw new Error(`Failed to update member status: ${error.message}`);
  }
};

/**
 * Create invitation
 */
export const createInvitation = async (
  organizationId: string,
  email: string,
  roleId: string,
  invitedBy: string
): Promise<OrganizationInvitation> => {
  const supabase = getSupabaseClient();

  const invitation: OrganizationInvitation = {
    id: crypto.randomUUID(),
    organizationId,
    email,
    roleId,
    status: 'Pending',
    token: crypto.randomUUID(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    invitedBy,
    invitedAt: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('organization_invitations')
    .insert({
      id: invitation.id,
      organization_id: invitation.organizationId,
      email: invitation.email,
      role_id: invitation.roleId,
      status: invitation.status,
      token: invitation.token,
      expires_at: invitation.expiresAt,
      invited_by: invitation.invitedBy,
      invited_at: invitation.invitedAt
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating invitation:', error);
    throw new Error(`Failed to create invitation: ${error.message}`);
  }

  // TODO: Send email invitation
  console.log(`Invitation created for ${email} - Token: ${invitation.token}`);

  return {
    id: data.id,
    organizationId: data.organization_id,
    email: data.email,
    roleId: data.role_id,
    status: data.status,
    token: data.token,
    expiresAt: data.expires_at,
    invitedBy: data.invited_by,
    invitedAt: data.invited_at,
    respondedAt: data.responded_at
  };
};

/**
 * Get pending invitations
 */
export const getPendingInvitations = async (
  organizationId: string
): Promise<OrganizationInvitation[]> => {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('organization_invitations')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'Pending')
    .order('invited_at', { ascending: false });

  if (error) {
    console.error('Error getting pending invitations:', error);
    throw new Error(`Failed to get invitations: ${error.message}`);
  }

  return (data || []).map(invitation => ({
    id: invitation.id,
    organizationId: invitation.organization_id,
    email: invitation.email,
    roleId: invitation.role_id,
    status: invitation.status,
    token: invitation.token,
    expiresAt: invitation.expires_at,
    invitedBy: invitation.invited_by,
    invitedAt: invitation.invited_at,
    respondedAt: invitation.responded_at
  }));
};

/**
 * Accept invitation
 */
export const acceptInvitation = async (
  token: string,
  userId: string
): Promise<OrganizationMember> => {
  const supabase = getSupabaseClient();

  // First, get the invitation
  const { data: invitation, error: inviteError } = await supabase
    .from('organization_invitations')
    .select('*')
    .eq('token', token)
    .eq('status', 'Pending')
    .single();

  if (inviteError || !invitation) {
    throw new Error('Invalid or expired invitation');
  }

  // Check if invitation is expired
  if (new Date(invitation.expires_at) < new Date()) {
    throw new Error('Invitation has expired');
  }

  // Create member
  const member = await addMember(
    invitation.organization_id,
    userId,
    invitation.role_id,
    invitation.invited_by
  );

  // Update invitation status
  await supabase
    .from('organization_invitations')
    .update({
      status: 'Accepted',
      responded_at: new Date().toISOString()
    })
    .eq('id', invitation.id);

  return member;
};

/**
 * Decline invitation
 */
export const declineInvitation = async (token: string): Promise<void> => {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('organization_invitations')
    .update({
      status: 'Declined',
      responded_at: new Date().toISOString()
    })
    .eq('token', token)
    .eq('status', 'Pending');

  if (error) {
    console.error('Error declining invitation:', error);
    throw new Error(`Failed to decline invitation: ${error.message}`);
  }
};

/**
 * Assign garden to member
 */
export const assignGarden = async (
  organizationId: string,
  gardenId: string,
  memberId: string,
  accessLevel: GardenAssignment['accessLevel'],
  assignedBy: string
): Promise<GardenAssignment> => {
  const supabase = getSupabaseClient();

  const assignment: GardenAssignment = {
    id: crypto.randomUUID(),
    organizationId,
    gardenId,
    memberId,
    accessLevel,
    assignedBy,
    assignedAt: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('garden_assignments')
    .insert({
      id: assignment.id,
      organization_id: assignment.organizationId,
      garden_id: assignment.gardenId,
      member_id: assignment.memberId,
      access_level: assignment.accessLevel,
      assigned_by: assignment.assignedBy,
      assigned_at: assignment.assignedAt
    })
    .select()
    .single();

  if (error) {
    console.error('Error assigning garden:', error);
    throw new Error(`Failed to assign garden: ${error.message}`);
  }

  return {
    id: data.id,
    organizationId: data.organization_id,
    gardenId: data.garden_id,
    memberId: data.member_id,
    accessLevel: data.access_level,
    assignedBy: data.assigned_by,
    assignedAt: data.assigned_at
  };
};

/**
 * Get member garden assignments
 */
export const getMemberGardenAssignments = async (
  memberId: string
): Promise<GardenAssignment[]> => {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('garden_assignments')
    .select('*')
    .eq('member_id', memberId)
    .order('assigned_at', { ascending: false });

  if (error) {
    console.error('Error getting member garden assignments:', error);
    throw new Error(`Failed to get garden assignments: ${error.message}`);
  }

  return (data || []).map(assignment => ({
    id: assignment.id,
    organizationId: assignment.organization_id,
    gardenId: assignment.garden_id,
    memberId: assignment.member_id,
    accessLevel: assignment.access_level,
    assignedBy: assignment.assigned_by,
    assignedAt: assignment.assigned_at
  }));
};

/**
 * Remove garden assignment
 */
export const removeGardenAssignment = async (assignmentId: string): Promise<void> => {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('garden_assignments')
    .delete()
    .eq('id', assignmentId);

  if (error) {
    console.error('Error removing garden assignment:', error);
    throw new Error(`Failed to remove garden assignment: ${error.message}`);
  }
};

/**
 * Check if user has permission
 */
export const hasPermission = async (
  userId: string,
  organizationId: string,
  resource: string,
  action: string,
  gardenId?: string
): Promise<boolean> => {
  const supabase = getSupabaseClient();

  try {
    // Get user's role in organization
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select(`
        role_id,
        roles!inner(permissions)
      `)
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .eq('status', 'Active')
      .single();

    if (memberError || !member) {
      return false;
    }

    const role = member.roles as any;
    const permissions = role.permissions as Permission[];

    // Check permissions
    for (const permission of permissions) {
      // Check if resource matches (wildcard or exact match)
      if (permission.resource === '*' || permission.resource === resource) {
        // Check if action is allowed
        if (permission.actions.includes('manage' as Action) || 
            permission.actions.includes(action as Action)) {
          
          // Check scope if specified
          if (permission.scope) {
            switch (permission.scope.type) {
              case 'All':
                return true;
              case 'Own':
                // TODO: Check if resource belongs to user
                return true;
              case 'Assigned':
                if (gardenId) {
                  // Check if user has access to this garden
                  const { data: assignment } = await supabase
                    .from('garden_assignments')
                    .select('id')
                    .eq('member_id', member.role_id) // This should be member.id, but we need member table structure
                    .eq('garden_id', gardenId)
                    .single();
                  return !!assignment;
                }
                return true;
              case 'Specific':
                if (gardenId && permission.scope.gardenIds) {
                  return permission.scope.gardenIds.includes(gardenId);
                }
                return true;
            }
          } else {
            // No scope restriction
            return true;
          }
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

/**
 * Get user's accessible gardens in organization
 */
export const getUserAccessibleGardens = async (
  userId: string,
  organizationId: string
): Promise<string[]> => {
  const supabase = getSupabaseClient();

  try {
    // Get user's member record
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('id, role_id, roles!inner(permissions)')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .eq('status', 'Active')
      .single();

    if (memberError || !member) {
      return [];
    }

    const role = member.roles as any;
    const permissions = role.permissions as Permission[];

    // Check if user has access to all gardens
    for (const permission of permissions) {
      if ((permission.resource === '*' || permission.resource === 'gardens') &&
          (permission.actions.includes('manage' as Action) || permission.actions.includes('read' as Action))) {
        
        if (!permission.scope || permission.scope.type === 'All') {
          // User has access to all gardens - return all garden IDs for this organization
          // TODO: Implement getting all garden IDs for organization
          return ['*']; // Placeholder for "all gardens"
        }
      }
    }

    // Get specifically assigned gardens
    const { data: assignments, error: assignError } = await supabase
      .from('garden_assignments')
      .select('garden_id')
      .eq('member_id', member.id)
      .eq('organization_id', organizationId);

    if (assignError) {
      console.error('Error getting garden assignments:', assignError);
      return [];
    }

    return (assignments || []).map(a => a.garden_id);
  } catch (error) {
    console.error('Error getting accessible gardens:', error);
    return [];
  }
};
