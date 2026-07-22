'use client'

import React, { useState, useEffect } from 'react'
import {
  Bug,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  Camera,
  FileText,
  Filter,
  Download
} from 'lucide-react'
import { useGarden } from '@/packages/core/hooks/useGarden'
import { useAuth } from '@/packages/core/hooks/useAuth'
import { biologicalControlService } from '@/services/biologicalControlService'
import {
  BiologicalControlChecklist,
  BiologicalControlSubtask,
  BiologicalControlCategory,
  ChecklistStatus
} from '@/types/activeAIAdvice'
import ComplianceChecklist from '@/components/certifications/ComplianceChecklist'

const CATEGORY_LABELS: Record<BiologicalControlCategory, string> = {
  'INSETTI_BENEFICI': 'Insetti Benefici',
  'TRAPPOLE': 'Trappole',
  'BARRIERE_FISICHE': 'Barriere Fisiche',
  'ROTAZIONE': 'Rotazione',
  'CONSOCIAZIONE': 'Consociazione',
  'MONITORAGGIO': 'Monitoraggio'
}

export default function BiologicalControlDashboard() {
  const { activeGarden } = useGarden()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [checklists, setChecklists] = useState<BiologicalControlChecklist[]>([])
  const [selectedChecklist, setSelectedChecklist] = useState<BiologicalControlChecklist | null>(null)
  const [subtasks, setSubtasks] = useState<BiologicalControlSubtask[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<ChecklistStatus | 'ALL'>('ALL')
  const [filterCategory, setFilterCategory] = useState<BiologicalControlCategory | 'ALL'>('ALL')

  useEffect(() => {
    if (activeGarden) {
      loadChecklists()
    }
  }, [activeGarden, filterStatus, filterCategory])

  const loadChecklists = async () => {
    if (!activeGarden) return
    
    try {
      setLoading(true)
      const filters: any = {}
      if (filterStatus !== 'ALL') filters.status = filterStatus
      if (filterCategory !== 'ALL') filters.category = filterCategory
      
      const data = await biologicalControlService.getChecklists(activeGarden.id, filters)
      setChecklists(data)
    } catch (error) {
      console.error('Error loading checklists:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSubtasks = async (checklistId: string) => {
    try {
      const data = await biologicalControlService.getSubtasks(checklistId)
      setSubtasks(data)
    } catch (error) {
      console.error('Error loading subtasks:', error)
    }
  }

  const handleCreateFromTemplate = async (category: BiologicalControlCategory) => {
    if (!activeGarden) return
    
    try {
      await biologicalControlService.createFromTemplate(activeGarden.id, category)
      await loadChecklists()
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating checklist:', error)
    }
  }

  const handleUpdateStatus = async (checklistId: string, status: ChecklistStatus) => {
    if (!user) {
      console.error('Cannot update checklist status: user not authenticated')
      return
    }
    try {
      await biologicalControlService.updateChecklistStatus(checklistId, status, user.id)
      await loadChecklists()
      if (selectedChecklist?.id === checklistId) {
        const updated = checklists.find(c => c.id === checklistId)
        if (updated) setSelectedChecklist(updated)
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const getStatusColor = (status: ChecklistStatus) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-100'
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100'
      case 'PENDING': return 'text-gray-600 bg-gray-100'
      case 'FAILED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: ChecklistStatus) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle size={16} />
      case 'IN_PROGRESS': return <Clock size={16} />
      case 'PENDING': return <Clock size={16} />
      case 'FAILED': return <AlertTriangle size={16} />
      default: return <Clock size={16} />
    }
  }

  const getCompletionStats = () => {
    const total = checklists.length
    const completed = checklists.filter(c => c.status === 'COMPLETED').length
    const inProgress = checklists.filter(c => c.status === 'IN_PROGRESS').length
    const pending = checklists.filter(c => c.status === 'PENDING').length
    
    return { total, completed, inProgress, pending, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }

  const stats = getCompletionStats()

  if (!activeGarden) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Bug className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Seleziona un Orto
        </h2>
        <p className="text-gray-600">
          Seleziona un orto per gestire il controllo biologico
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg">
            <Bug className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Controllo Biologico
            </h1>
            <p className="text-gray-600">
              Checklist per certificazioni BIO e GLOBALGAP
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Nuova Checklist
        </button>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">Progresso Compliance</h4>
          <span className="text-2xl font-bold text-blue-600">{stats.percentage}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${stats.percentage}%` }}
          ></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Totali</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-sm text-gray-600">Completati</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            <p className="text-sm text-gray-600">In Corso</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">{stats.pending}</p>
            <p className="text-sm text-gray-600">In Attesa</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-4">
          <Filter size={20} className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">Tutti gli stati</option>
            <option value="PENDING">In Attesa</option>
            <option value="IN_PROGRESS">In Corso</option>
            <option value="COMPLETED">Completati</option>
            <option value="FAILED">Falliti</option>
          </select>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">Tutte le categorie</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Checklists */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento checklist...</p>
        </div>
      ) : checklists.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Bug className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Nessuna Checklist
          </h3>
          <p className="text-gray-600 mb-4">
            Crea la tua prima checklist per il controllo biologico
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Crea Checklist
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {checklists.map((checklist) => (
            <div key={checklist.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{checklist.title}</h3>
                    <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(checklist.status)}`}>
                      {getStatusIcon(checklist.status)}
                      {checklist.status}
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {CATEGORY_LABELS[checklist.category]}
                    </span>
                    {checklist.requiredForCertification && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Certificazione
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{checklist.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>📂 {checklist.frequency}</span>
                    {checklist.dueDate && (
                      <span>📅 Scadenza: {new Date(checklist.dueDate).toLocaleDateString('it-IT')}</span>
                    )}
                    {checklist.completedDate && (
                      <span>✅ Completato: {new Date(checklist.completedDate).toLocaleDateString('it-IT')}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {checklist.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus(checklist.id, 'IN_PROGRESS')}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Inizia
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedChecklist(checklist)
                      loadSubtasks(checklist.id)
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FileText size={16} />
                  </button>
                </div>
              </div>

              {checklist.effectivenessScore && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Efficacia:</span>
                    <span className="text-lg font-bold text-green-600">{checklist.effectivenessScore}/100</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Crea Checklist da Template</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleCreateFromTemplate(key as BiologicalControlCategory)}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                >
                  <Bug className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{label}</h4>
                    <p className="text-sm text-gray-600">
                      Crea checklist per {label.toLowerCase()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedChecklist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ComplianceChecklist
              certification={selectedChecklist.category}
              certificationName={CATEGORY_LABELS[selectedChecklist.category]}
            />
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedChecklist(null)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
