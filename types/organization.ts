/**
 * Organization Types
 * Multi-tenancy system for enterprise users
 */

/**
 * Organization - Company/Farm entity
 */
export interface Organization {
  id: string;
  name: string;
  description?: string;
  type: 'Farm' | 'Cooperative' | 'Enterprise' | 'Research';
  
  // Contact info
  email?: string;
  phone?: string;
  address?: string;
  vatNumber?: string;
  
  // Settings
  logo?: string;
  website?: string;
  
  // Owner
  ownerId: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

/**
 * Organization Member - User belonging to an organization
 */
export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  
  // Role
  roleId: string;
  
  // Status
  status: 'Active' | 'Invited' | 'Suspended';
  invitedBy?: string;
  invitedAt?: string;
  joinedAt?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

/**
 * Role - Permission set for organization members
 */
export interface Role {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  
  // Permissions
  permissions: Permission[];
  
  // System role (cannot be deleted)
  isSystem: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

/**
 * Permission - Granular access control
 */
export interface Permission {
  resource: ResourceType;
  actions: Action[];
  scope?: PermissionScope;
}

/**
 * Resource Types
 */
export type ResourceType =
  | 'gardens'
  | 'plants'
  | 'tasks'
  | 'harvests'
  | 'treatments'
  | 'irrigation'
  | 'nutrition'
  | 'analytics'
  | 'settings'
  | 'members'
  | 'roles'
  | 'api_keys'
  | 'certifications'
  | 'prescriptions'
  | 'ndvi'
  | 'agronomist';

/**
 * Actions
 */
export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';

/**
 * Permission Scope
 */
export interface PermissionScope {
  type: 'All' | 'Own' | 'Assigned' | 'Specific';
  gardenIds?: string[];
  fieldIds?: string[];
}

/**
 * Garden Assignment - Assign gardens to members
 */
export interface GardenAssignment {
  id: string;
  organizationId: string;
  gardenId: string;
  memberId: string;
  
  // Access level
  accessLevel: 'Full' | 'ReadWrite' | 'ReadOnly';
  
  // Metadata
  assignedBy: string;
  assignedAt: string;
}

/**
 * Invitation - Invite users to organization
 */
export interface OrganizationInvitation {
  id: string;
  organizationId: string;
  email: string;
  roleId: string;
  
  // Status
  status: 'Pending' | 'Accepted' | 'Declined' | 'Expired';
  
  // Token
  token: string;
  expiresAt: string;
  
  // Metadata
  invitedBy: string;
  invitedAt: string;
  respondedAt?: string;
}

/**
 * Default System Roles
 */
export const SYSTEM_ROLES = {
  OWNER: {
    name: 'Owner',
    description: 'Full access to all resources and settings',
    permissions: [
      { resource: '*' as ResourceType, actions: ['manage' as Action] }
    ]
  },
  ADMIN: {
    name: 'Administrator',
    description: 'Manage all resources except organization settings',
    permissions: [
      { resource: 'gardens' as ResourceType, actions: ['create', 'read', 'update', 'delete'] as Action[] },
      { resource: 'plants' as ResourceType, actions: ['create', 'read', 'update', 'delete'] as Action[] },
      { resource: 'tasks' as ResourceType, actions: ['create', 'read', 'update', 'delete'] as Action[] },
      { resource: 'members' as ResourceType, actions: ['read', 'update'] as Action[] },
      { resource: 'roles' as ResourceType, actions: ['read'] as Action[] }
    ]
  },
  AGRONOMIST: {
    name: 'Agronomist',
    description: 'Manage treatments, nutrition, and provide advice',
    permissions: [
      { resource: 'gardens' as ResourceType, actions: ['read'] as Action[] },
      { resource: 'plants' as ResourceType, actions: ['read', 'update'] as Action[] },
      { resource: 'treatments' as ResourceType, actions: ['create', 'read', 'update'] as Action[] },
      { resource: 'nutrition' as ResourceType, actions: ['create', 'read', 'update'] as Action[] },
      { resource: 'analytics' as ResourceType, actions: ['read'] as Action[] },
      { resource: 'agronomist' as ResourceType, actions: ['create', 'read', 'update'] as Action[] }
    ]
  },
  OPERATOR: {
    name: 'Operator',
    description: 'Execute tasks and record operations',
    permissions: [
      { resource: 'gardens' as ResourceType, actions: ['read'] as Action[], scope: { type: 'Assigned' } },
      { resource: 'plants' as ResourceType, actions: ['read', 'update'] as Action[], scope: { type: 'Assigned' } },
      { resource: 'tasks' as ResourceType, actions: ['read', 'update'] as Action[], scope: { type: 'Assigned' } },
      { resource: 'harvests' as ResourceType, actions: ['create', 'read'] as Action[], scope: { type: 'Assigned' } },
      { resource: 'irrigation' as ResourceType, actions: ['read', 'update'] as Action[], scope: { type: 'Assigned' } }
    ]
  },
  VIEWER: {
    name: 'Viewer',
    description: 'Read-only access to assigned resources',
    permissions: [
      { resource: 'gardens' as ResourceType, actions: ['read'] as Action[], scope: { type: 'Assigned' } },
      { resource: 'plants' as ResourceType, actions: ['read'] as Action[], scope: { type: 'Assigned' } },
      { resource: 'tasks' as ResourceType, actions: ['read'] as Action[], scope: { type: 'Assigned' } },
      { resource: 'analytics' as ResourceType, actions: ['read'] as Action[], scope: { type: 'Assigned' } }
    ]
  }
} as const;
