'use client'

import React, { useState } from 'react'
import {
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle,
  Bell,
  Plus,
  X,
  Mail,
  Smartphone,
  User
} from 'lucide-react'

interface Deadline {
  id: string
  title: string
  description: string
  certification: string
  type: 'RENEWAL' | 'AUDIT' | 'TRAINING' | 'DOCUMENT' | 'INSPECTION'
  dueDate: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'UPCOMING' | 'DUE_SOON' | 'OVERDUE' | 'COMPLETED'
  assignedTo?: string
  reminderDays: number[]
  notifications: {
    email: boolean
    sms: boolean
    inApp: boolean
  }
  completedDate?: string
  notes?: string
}

interface DeadlineManagerProps {
  certification?: string
  certificationName?: string
}

export default function DeadlineManager({ certification, certificationName }: DeadlineManagerProps) {
  const [deadlines, setDeadlines] = useState<Deadline[]>([
    {
      id: '1',
      title: 'Rinnovo Certificato GlobalG.A.P.',
      description: 'Rinnovo annuale della certificazione GlobalG.A.P.',
      certification: 'GLOBALGAP',
      type: 'RENEWAL',
      dueDate: '2024-12-15',
      priority: 'CRITICAL',
      status: 'UPCOMING',
      assignedTo: 'Mario Rossi',
      reminderDays: [30, 15, 7, 1],
      notifications: {
        email: true,
        sms: true,
        inApp: true
      }
    },
    {
      id: '2',
      title: 'Audit Interno HACCP',
      description: 'Audit interno semestrale del sistema HACCP',
      certification: 'HACCP',
      type: 'AUDIT',
      dueDate: '2024-02-28',
      priority: 'HIGH',
      status: 'DUE_SOON',
      assignedTo: 'Anna Bianchi',
      reminderDays: [14, 7, 3, 1],
      notifications: {
        email: true,
        sms: false,
        inApp: true
      }
    },
    {
      id: '3',
      title: 'Formazione Personale Biologico',
      description: 'Corso di aggiornamento per certificazione biologica',
      certification: 'ORGANIC_EU',
      type: 'TRAINING',
      dueDate: '2024-01-20',
      priority: 'MEDIUM',
      status: 'OVERDUE',
      assignedTo: 'Luca Verdi',
      reminderDays: [7, 3, 1],
      notifications: {
        email: true,
        sms: false,
        inApp: true
      }
    },
    {
      id: '4',
      title: 'Aggiornamento Procedure HACCP',
      description: 'Revisione annuale delle procedure HACCP',
      certification: 'HACCP',
      type: 'DOCUMENT',
      dueDate: '2024-01-10',
      priority: 'HIGH',
      status: 'COMPLETED',
      assignedTo: 'Mario Rossi',
      reminderDays: [14, 7, 1],
      notifications: {
        email: true,
        sms: false,
        inApp: true
      },
      completedDate: '2024-01-08',
      notes: 'Procedure aggiornate e approvate'
    }
  ])

  const [showAddModal, setShowAddModal] = useState(false)
  const [newDeadline, setNewDeadline] = useState({
    title: '',
    description: '',
    certification: certification || '',
    type: 'DOCUMENT' as Deadline['type'],
    dueDate: '',
    priority: 'MEDIUM' as Deadline['priority'],
    assignedTo: '',
    reminderDays: [7, 3, 1],
    notifications: {
      email: true,
      sms: false,
      inApp: true
    }
  })

  const deadlineTypes = [
    { value: 'RENEWAL', label: 'Rinnovo', icon: '🔄' },
    { value: 'AUDIT', label: 'Audit', icon: '🔍' },
    { value: 'TRAINING', label: 'Formazione', icon: '🎓' },
    { value: 'DOCUMENT', label: 'Documento', icon: '📄' },
    { value: 'INSPECTION', label: 'Ispezione', icon: '👁️' }
  ]

  const priorities = [
    { value: 'LOW', label: 'Bassa', color: 'text-gray-600 bg-gray-100' },
    { value: 'MEDIUM', label: 'Media', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'HIGH', label: 'Alta', color: 'text-orange-600 bg-orange-100' },
    { value: 'CRITICAL', label: 'Critica', color: 'text-red-600 bg-red-100' }
  ]

  const getStatusColor = (status: Deadline['status']) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-100'
      case 'UPCOMING': return 'text-blue-600 bg-blue-100'
      case 'DUE_SOON': return 'text-yellow-600 bg-yellow-100'
      case 'OVERDUE': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: Deadline['status']) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle size={16} />
      case 'UPCOMING': return <Calendar size={16} />
      case 'DUE_SOON': return <Clock size={16} />
      case 'OVERDUE': return <AlertTriangle size={16} />
      default: return <Calendar size={16} />
    }
  }

  const getStatusText = (status: Deadline['status']) => {
    switch (status) {
      case 'COMPLETED': return 'Completato'
      case 'UPCOMING': return 'Prossimo'
      case 'DUE_SOON': return 'In Scadenza'
      case 'OVERDUE': return 'Scaduto'
      default: return 'Sconosciuto'
    }
  }

  const getPriorityColor = (priority: Deadline['priority']) => {
    const p = priorities.find(p => p.value === priority)
    return p?.color || 'text-gray-600 bg-gray-100'
  }

  const getPriorityText = (priority: Deadline['priority']) => {
    const p = priorities.find(p => p.value === priority)
    return p?.label || priority
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getDeadlineStatus = (dueDate: string, completedDate?: string): Deadline['status'] => {
    if (completedDate) return 'COMPLETED'
    
    const daysUntil = getDaysUntilDue(dueDate)
    if (daysUntil < 0) return 'OVERDUE'
    if (daysUntil <= 7) return 'DUE_SOON'
    return 'UPCOMING'
  }

  const filteredDeadlines = certification 
    ? deadlines.filter(d => d.certification === certification)
    : deadlines

  const markAsCompleted = (id: string, notes?: string) => {
    setDeadlines(prev => prev.map(deadline => 
      deadline.id === id 
        ? { 
            ...deadline, 
            status: 'COMPLETED', 
            completedDate: new Date().toISOString().split('T')[0],
            notes: notes || deadline.notes
          }
        : deadline
    ))
  }

  const addNewDeadline = () => {
    const deadline: Deadline = {
      id: Date.now().toString(),
      ...newDeadline,
      status: getDeadlineStatus(newDeadline.dueDate)
    }
    
    setDeadlines(prev => [...prev, deadline])
    setNewDeadline({
      title: '',
      description: '',
      certification: certification || '',
      type: 'DOCUMENT',
      dueDate: '',
      priority: 'MEDIUM',
      assignedTo: '',
      reminderDays: [7, 3, 1],
      notifications: {
        email: true,
        sms: false,
        inApp: true
      }
    })
    setShowAddModal(false)
  }

  const getStats = () => {
    const total = filteredDeadlines.length
    const completed = filteredDeadlines.filter(d => d.status === 'COMPLETED').length
    const overdue = filteredDeadlines.filter(d => d.status === 'OVERDUE').length
    const dueSoon = filteredDeadlines.filter(d => d.status === 'DUE_SOON').length
    const upcoming = filteredDeadlines.filter(d => d.status === 'UPCOMING').length
    
    return { total, completed, overdue, dueSoon, upcoming }
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Gestione Scadenze</h3>
          {certificationName && <p className="text-gray-600">{certificationName}</p>}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Nuova Scadenza
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Totali</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Scaduti</p>
              <p className="text-xl font-bold text-red-600">{stats.overdue}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">In Scadenza</p>
              <p className="text-xl font-bold text-yellow-600">{stats.dueSoon}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Prossimi</p>
              <p className="text-xl font-bold text-blue-600">{stats.upcoming}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completati</p>
              <p className="text-xl font-bold text-green-600">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Deadlines List */}
      <div className="space-y-4">
        {filteredDeadlines.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna scadenza</h3>
            <p className="text-gray-600 mb-4">
              {certification ? 'Nessuna scadenza per questa certificazione' : 'Aggiungi la prima scadenza'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Aggiungi Scadenza
            </button>
          </div>
        ) : (
          filteredDeadlines
            .sort((a, b) => {
              // Sort by status priority, then by due date
              const statusPriority = { 'OVERDUE': 0, 'DUE_SOON': 1, 'UPCOMING': 2, 'COMPLETED': 3 }
              const statusDiff = statusPriority[a.status] - statusPriority[b.status]
              if (statusDiff !== 0) return statusDiff
              return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            })
            .map((deadline) => {
              const daysUntil = getDaysUntilDue(deadline.dueDate)
              const typeInfo = deadlineTypes.find(t => t.value === deadline.type)
              
              return (
                <div key={deadline.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{deadline.title}</h4>
                        <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deadline.status)}`}>
                          {getStatusIcon(deadline.status)}
                          {getStatusText(deadline.status)}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(deadline.priority)}`}>
                          {getPriorityText(deadline.priority)}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{deadline.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{typeInfo?.icon} {typeInfo?.label}</span>
                        <span>📅 {new Date(deadline.dueDate).toLocaleDateString('it-IT')}</span>
                        {deadline.status !== 'COMPLETED' && (
                          <span className={`font-medium ${
                            daysUntil < 0 ? 'text-red-600' : 
                            daysUntil <= 7 ? 'text-yellow-600' : 
                            'text-blue-600'
                          }`}>
                            {daysUntil < 0 ? `${Math.abs(daysUntil)} giorni fa` : 
                             daysUntil === 0 ? 'Oggi' :
                             `${daysUntil} giorni`}
                          </span>
                        )}
                        {deadline.assignedTo && (
                          <span>👤 {deadline.assignedTo}</span>
                        )}
                        {deadline.completedDate && (
                          <span>✅ Completato: {new Date(deadline.completedDate).toLocaleDateString('it-IT')}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {deadline.status !== 'COMPLETED' && (
                        <button
                          onClick={() => markAsCompleted(deadline.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          Completa
                        </button>
                      )}
                      
                      <div className="flex items-center gap-1">
                        {deadline.notifications.email && (
                          <Mail className="h-4 w-4 text-blue-600" />
                        )}
                        {deadline.notifications.sms && (
                          <Smartphone className="h-4 w-4 text-green-600" />
                        )}
                        {deadline.notifications.inApp && (
                          <Bell className="h-4 w-4 text-purple-600" />
                        )}
                      </div>
                    </div>
                  </div>

                  {deadline.notes && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-700">📝 {deadline.notes}</p>
                    </div>
                  )}

                  {deadline.reminderDays.length > 0 && deadline.status !== 'COMPLETED' && (
                    <div className="border-t border-gray-200 pt-3">
                      <p className="text-sm text-gray-600 mb-2">Promemoria attivi:</p>
                      <div className="flex gap-2">
                        {deadline.reminderDays.map((days) => (
                          <span key={days} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {days} {days === 1 ? 'giorno' : 'giorni'} prima
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
        )}
      </div>

      {/* Add Deadline Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Nuova Scadenza</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titolo</label>
                <input
                  type="text"
                  value={newDeadline.title}
                  onChange={(e) => setNewDeadline(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Es: Rinnovo certificato"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione</label>
                <textarea
                  value={newDeadline.description}
                  onChange={(e) => setNewDeadline(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Descrizione dettagliata"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={newDeadline.type}
                  onChange={(e) => setNewDeadline(prev => ({ ...prev, type: e.target.value as Deadline['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {deadlineTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Scadenza</label>
                <input
                  type="date"
                  value={newDeadline.dueDate}
                  onChange={(e) => setNewDeadline(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priorità</label>
                <select
                  value={newDeadline.priority}
                  onChange={(e) => setNewDeadline(prev => ({ ...prev, priority: e.target.value as Deadline['priority'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assegnato a</label>
                <input
                  type="text"
                  value={newDeadline.assignedTo}
                  onChange={(e) => setNewDeadline(prev => ({ ...prev, assignedTo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nome responsabile"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notifiche</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newDeadline.notifications.email}
                      onChange={(e) => setNewDeadline(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, email: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Mail size={16} className="text-blue-600" />
                    <span className="text-sm text-gray-700">Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newDeadline.notifications.sms}
                      onChange={(e) => setNewDeadline(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, sms: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <Smartphone size={16} className="text-green-600" />
                    <span className="text-sm text-gray-700">SMS</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newDeadline.notifications.inApp}
                      onChange={(e) => setNewDeadline(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, inApp: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <Bell size={16} className="text-purple-600" />
                    <span className="text-sm text-gray-700">Notifiche App</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={addNewDeadline}
                disabled={!newDeadline.title || !newDeadline.dueDate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Aggiungi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}