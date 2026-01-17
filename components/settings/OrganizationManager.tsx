'use client'

import { useState, useEffect } from 'react'
import {
  Building2,
  Users,
  Shield,
  Plus,
  Edit2,
  Trash2,
  Mail,
  UserPlus,
  MapPin,
  Check,
  X,
  AlertCircle
} from 'lucide-react'
import {
  Organization,
  OrganizationMember,
  Role,
  GardenAssignment,
  OrganizationInvitation,
  SYSTEM_ROLES
} from '@/types/organization'
import {
  getUserOrganizations,
  createOrganization,
  getOrganizationMembers,
  getOrganizationRoles,
  createInvitation,
  getPendingInvitations,
  removeMember,
  updateMemberRole,
  assignGarden,
  getMemberGardenAssignments
} from '@/services/organizationService'

export default function OrganizationManager() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'roles' | 'invitations'>('overview')
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)

  useEffect(() => {
    loadOrganizations()
  }, [])

  useEffect(() => {
    if (selectedOrg) {
      loadOrganizationData()
    }
  }, [selectedOrg])

  const loadOrganizations = async () => {
    try {
      setLoading(true)
      // TODO: Get actual user ID
      const userId = 'current-user-id'
      const orgs = await getUserOrganizations(userId)
      setOrganizations(orgs)
      if (orgs.length > 0 && !selectedOrg) {
        setSelectedOrg(orgs[0])
      }
    } catch (error) {
      console.error('Error loading organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadOrganizationData = async () => {
    if (!selectedOrg) return

    try {
      const [membersData, rolesData, invitationsData] = await Promise.all([
        getOrganizationMembers(selectedOrg.id),
        getOrganizationRoles(selectedOrg.id),
        getPendingInvitations(selectedOrg.id)
      ])

      setMembers(membersData)
      setRoles(rolesData)
      setInvitations(invitationsData)
    } catch (error) {
      console.error('Error loading organization data:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (organizations.length === 0) {
    return (
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Sistema Multi-Tenancy per Aziende</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Crea un'organizzazione per la tua azienda agricola</li>
                <li>Invita collaboratori e assegna ruoli specifici</li>
                <li>Gestisci permessi su diversi campi e operazioni</li>
                <li>Lavoro collaborativo su più garden contemporaneamente</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Building2 size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium mb-2">Nessuna organizzazione</p>
          <p className="text-sm text-gray-500 mb-4">
            Crea un'organizzazione per gestire team e permessi
          </p>
          <button
            onClick={() => setShowCreateOrgModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={18} />
            Crea Organizzazione
          </button>
        </div>

        {showCreateOrgModal && (
          <CreateOrganizationModal
            onClose={() => setShowCreateOrgModal(false)}
            onSave={async () => {
              await loadOrganizations()
              setShowCreateOrgModal(false)
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 size={24} className="text-green-600" />
            Organizzazioni
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Gestisci team, ruoli e permessi
          </p>
        </div>
        <button
          onClick={() => setShowCreateOrgModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={18} />
          Nuova Organizzazione
        </button>
      </div>

      {/* Organization Selector */}
      {organizations.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {organizations.map((org) => (
            <button
              key={org.id}
              onClick={() => setSelectedOrg(org)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedOrg?.id === org.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {org.name}
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          {[
            { id: 'overview', label: 'Panoramica', icon: Building2 },
            { id: 'members', label: 'Membri', icon: Users },
            { id: 'roles', label: 'Ruoli', icon: Shield },
            { id: 'invitations', label: 'Inviti', icon: Mail }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={18} />
                {tab.label}
                {tab.id === 'members' && members.length > 0 && (
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                    {members.length}
                  </span>
                )}
                {tab.id === 'invitations' && invitations.length > 0 && (
                  <span className="px-2 py-0.5 bg-orange-200 text-orange-700 text-xs rounded-full">
                    {invitations.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && selectedOrg && (
        <OrganizationOverview organization={selectedOrg} />
      )}

      {activeTab === 'members' && (
        <MembersTab
          members={members}
          roles={roles}
          onInvite={() => setShowInviteModal(true)}
          onRefresh={loadOrganizationData}
        />
      )}

      {activeTab === 'roles' && (
        <RolesTab roles={roles} onRefresh={loadOrganizationData} />
      )}

      {activeTab === 'invitations' && (
        <InvitationsTab invitations={invitations} onRefresh={loadOrganizationData} />
      )}

      {/* Modals */}
      {showCreateOrgModal && (
        <CreateOrganizationModal
          onClose={() => setShowCreateOrgModal(false)}
          onSave={async () => {
            await loadOrganizations()
            setShowCreateOrgModal(false)
          }}
        />
      )}

      {showInviteModal && selectedOrg && (
        <InviteMemberModal
          organizationId={selectedOrg.id}
          roles={roles}
          onClose={() => setShowInviteModal(false)}
          onSave={async () => {
            await loadOrganizationData()
            setShowInviteModal(false)
          }}
        />
      )}
    </div>
  )
}

// Organization Overview Component
function OrganizationOverview({ organization }: { organization: Organization }) {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Informazioni Organizzazione</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Nome:</span>
            <p className="font-medium text-gray-900">{organization.name}</p>
          </div>
          <div>
            <span className="text-gray-600">Tipo:</span>
            <p className="font-medium text-gray-900">{organization.type}</p>
          </div>
          {organization.email && (
            <div>
              <span className="text-gray-600">Email:</span>
              <p className="font-medium text-gray-900">{organization.email}</p>
            </div>
          )}
          {organization.phone && (
            <div>
              <span className="text-gray-600">Telefono:</span>
              <p className="font-medium text-gray-900">{organization.phone}</p>
            </div>
          )}
          {organization.vatNumber && (
            <div>
              <span className="text-gray-600">P.IVA:</span>
              <p className="font-medium text-gray-900">{organization.vatNumber}</p>
            </div>
          )}
          <div>
            <span className="text-gray-600">Creata il:</span>
            <p className="font-medium text-gray-900">
              {new Date(organization.createdAt).toLocaleDateString('it-IT')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Members Tab Component
function MembersTab({
  members,
  roles,
  onInvite,
  onRefresh
}: {
  members: OrganizationMember[]
  roles: Role[]
  onInvite: () => void
  onRefresh: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">{members.length} membri attivi</p>
        <button
          onClick={onInvite}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <UserPlus size={18} />
          Invita Membro
        </button>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">Nessun membro</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => {
            const role = roles.find((r) => r.id === member.roleId)
            return (
              <div
                key={member.id}
                className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">User ID: {member.userId}</p>
                  <p className="text-sm text-gray-600">
                    Ruolo: {role?.name || 'Sconosciuto'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Membro dal {new Date(member.joinedAt || member.createdAt).toLocaleDateString('it-IT')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      member.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {member.status}
                  </span>
                  <button
                    onClick={async () => {
                      if (confirm('Rimuovere questo membro?')) {
                        await removeMember(member.id)
                        onRefresh()
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Roles Tab Component
function RolesTab({ roles, onRefresh }: { roles: Role[]; onRefresh: () => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">{roles.length} ruoli configurati</p>

      {roles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Shield size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">Nessun ruolo configurato</p>
        </div>
      ) : (
        <div className="space-y-3">
          {roles.map((role) => (
            <div
              key={role.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{role.name}</h4>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
                {role.isSystem && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    Sistema
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Permessi:</span> {role.permissions.length} configurati
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Invitations Tab Component
function InvitationsTab({
  invitations,
  onRefresh
}: {
  invitations: OrganizationInvitation[]
  onRefresh: () => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">{invitations.length} inviti in sospeso</p>

      {invitations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Mail size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">Nessun invito in sospeso</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-gray-900">{invitation.email}</p>
                <p className="text-sm text-gray-600">
                  Invitato il {new Date(invitation.invitedAt).toLocaleDateString('it-IT')}
                </p>
                <p className="text-xs text-gray-500">
                  Scade il {new Date(invitation.expiresAt).toLocaleDateString('it-IT')}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded ${
                  invitation.status === 'Pending'
                    ? 'bg-orange-100 text-orange-800'
                    : invitation.status === 'Accepted'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {invitation.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Create Organization Modal
function CreateOrganizationModal({
  onClose,
  onSave
}: {
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Farm' as Organization['type'],
    email: '',
    phone: '',
    vatNumber: '',
    address: ''
  })

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Inserisci il nome dell\'organizzazione')
      return
    }

    try {
      // TODO: Get actual user ID
      const userId = 'current-user-id'
      await createOrganization(userId, formData.name, formData.type, formData)
      onSave()
    } catch (error) {
      console.error('Error creating organization:', error)
      alert('Errore durante la creazione')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Crea Organizzazione</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Organizzazione *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Es: Azienda Agricola Rossi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="Farm">Azienda Agricola</option>
                <option value="Cooperative">Cooperativa</option>
                <option value="Enterprise">Impresa</option>
                <option value="Research">Ricerca</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">P.IVA</label>
              <input
                type="text"
                value={formData.vatNumber}
                onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Crea
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annulla
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Invite Member Modal
function InviteMemberModal({
  organizationId,
  roles,
  onClose,
  onSave
}: {
  organizationId: string
  roles: Role[]
  onClose: () => void
  onSave: () => void
}) {
  const [email, setEmail] = useState('')
  const [roleId, setRoleId] = useState(roles[0]?.id || '')

  const handleSave = async () => {
    if (!email.trim() || !roleId) {
      alert('Compila tutti i campi')
      return
    }

    try {
      // TODO: Get actual user ID
      const userId = 'current-user-id'
      await createInvitation(organizationId, email, roleId, userId)
      onSave()
    } catch (error) {
      console.error('Error creating invitation:', error)
      alert('Errore durante l\'invio')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Invita Membro</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="email@esempio.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ruolo *</label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Invia Invito
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annulla
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
