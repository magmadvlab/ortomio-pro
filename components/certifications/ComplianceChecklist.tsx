'use client'

import React, { useState } from 'react'
import {
  CheckCircle,
  Circle,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  FileText,
  Camera,
  Plus,
  X,
  Save
} from 'lucide-react'

interface ChecklistItem {
  id: string
  title: string
  description: string
  category: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  dueDate?: string
  completedDate?: string
  completedBy?: string
  notes?: string
  evidence?: string[]
  subItems?: ChecklistItem[]
}

interface ComplianceChecklistProps {
  certification: string
  certificationName: string
}

export default function ComplianceChecklist({ certification, certificationName }: ComplianceChecklistProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: '1',
      title: 'Documentazione Sistema Qualità',
      description: 'Verificare che tutta la documentazione del sistema qualità sia aggiornata',
      category: 'Documentazione',
      priority: 'HIGH',
      status: 'COMPLETED',
      dueDate: '2024-01-15',
      completedDate: '2024-01-10',
      completedBy: 'Mario Rossi',
      notes: 'Documentazione aggiornata e approvata',
      evidence: ['doc1.pdf', 'doc2.pdf']
    },
    {
      id: '2',
      title: 'Controllo Punti Critici',
      description: 'Verificare il monitoraggio dei punti critici di controllo',
      category: 'Controllo Qualità',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      dueDate: '2024-01-20',
      subItems: [
        {
          id: '2.1',
          title: 'Temperatura di conservazione',
          description: 'Verificare registrazioni temperature',
          category: 'Controllo Qualità',
          priority: 'CRITICAL',
          status: 'COMPLETED',
          completedDate: '2024-01-12',
          completedBy: 'Anna Bianchi'
        },
        {
          id: '2.2',
          title: 'pH del suolo',
          description: 'Controllo pH nelle diverse zone',
          category: 'Controllo Qualità',
          priority: 'HIGH',
          status: 'PENDING',
          dueDate: '2024-01-18'
        }
      ]
    },
    {
      id: '3',
      title: 'Formazione Personale',
      description: 'Verificare che tutto il personale abbia completato la formazione obbligatoria',
      category: 'Formazione',
      priority: 'MEDIUM',
      status: 'PENDING',
      dueDate: '2024-01-25'
    },
    {
      id: '4',
      title: 'Audit Interno',
      description: 'Eseguire audit interno del sistema di gestione',
      category: 'Audit',
      priority: 'HIGH',
      status: 'FAILED',
      dueDate: '2024-01-10',
      notes: 'Riscontrate non conformità minori da correggere'
    }
  ])

  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'MEDIUM' as ChecklistItem['priority'],
    dueDate: ''
  })

  const categories = ['Documentazione', 'Controllo Qualità', 'Formazione', 'Audit', 'Procedure', 'Registrazioni']
  const priorities = [
    { value: 'LOW', label: 'Bassa', color: 'text-gray-600 bg-gray-100' },
    { value: 'MEDIUM', label: 'Media', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'HIGH', label: 'Alta', color: 'text-orange-600 bg-orange-100' },
    { value: 'CRITICAL', label: 'Critica', color: 'text-red-600 bg-red-100' }
  ]

  const getStatusColor = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-100'
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100'
      case 'PENDING': return 'text-gray-600 bg-gray-100'
      case 'FAILED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle size={16} />
      case 'IN_PROGRESS': return <Clock size={16} />
      case 'PENDING': return <Circle size={16} />
      case 'FAILED': return <AlertTriangle size={16} />
      default: return <Circle size={16} />
    }
  }

  const getStatusText = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'COMPLETED': return 'Completato'
      case 'IN_PROGRESS': return 'In Corso'
      case 'PENDING': return 'In Attesa'
      case 'FAILED': return 'Fallito'
      default: return 'Sconosciuto'
    }
  }

  const getPriorityColor = (priority: ChecklistItem['priority']) => {
    const p = priorities.find(p => p.value === priority)
    return p?.color || 'text-gray-600 bg-gray-100'
  }

  const getPriorityText = (priority: ChecklistItem['priority']) => {
    const p = priorities.find(p => p.value === priority)
    return p?.label || priority
  }

  const updateItemStatus = (itemId: string, newStatus: ChecklistItem['status'], notes?: string) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === itemId) {
        const updated = {
          ...item,
          status: newStatus,
          completedDate: newStatus === 'COMPLETED' ? new Date().toISOString().split('T')[0] : undefined,
          completedBy: newStatus === 'COMPLETED' ? 'Utente Corrente' : undefined,
          notes: notes || item.notes
        }
        return updated
      }
      
      // Check sub-items
      if (item.subItems) {
        const updatedSubItems = item.subItems.map(subItem => {
          if (subItem.id === itemId) {
            return {
              ...subItem,
              status: newStatus,
              completedDate: newStatus === 'COMPLETED' ? new Date().toISOString().split('T')[0] : undefined,
              completedBy: newStatus === 'COMPLETED' ? 'Utente Corrente' : undefined,
              notes: notes || subItem.notes
            }
          }
          return subItem
        })
        
        // Update parent status based on sub-items
        const allCompleted = updatedSubItems.every(sub => sub.status === 'COMPLETED')
        const anyInProgress = updatedSubItems.some(sub => sub.status === 'IN_PROGRESS')
        const anyFailed = updatedSubItems.some(sub => sub.status === 'FAILED')
        
        let parentStatus = item.status
        if (allCompleted) parentStatus = 'COMPLETED'
        else if (anyFailed) parentStatus = 'FAILED'
        else if (anyInProgress) parentStatus = 'IN_PROGRESS'
        else parentStatus = 'PENDING'
        
        return {
          ...item,
          status: parentStatus,
          subItems: updatedSubItems
        }
      }
      
      return item
    }))
  }

  const addNewItem = () => {
    const item: ChecklistItem = {
      id: Date.now().toString(),
      title: newItem.title,
      description: newItem.description,
      category: newItem.category,
      priority: newItem.priority,
      status: 'PENDING',
      dueDate: newItem.dueDate || undefined
    }
    
    setChecklist(prev => [...prev, item])
    setNewItem({ title: '', description: '', category: '', priority: 'MEDIUM', dueDate: '' })
    setShowAddModal(false)
  }

  const getCompletionStats = () => {
    const total = checklist.length + checklist.reduce((sum, item) => sum + (item.subItems?.length || 0), 0)
    const completed = checklist.filter(item => item.status === 'COMPLETED').length + 
                     checklist.reduce((sum, item) => sum + (item.subItems?.filter(sub => sub.status === 'COMPLETED').length || 0), 0)
    const inProgress = checklist.filter(item => item.status === 'IN_PROGRESS').length +
                      checklist.reduce((sum, item) => sum + (item.subItems?.filter(sub => sub.status === 'IN_PROGRESS').length || 0), 0)
    const failed = checklist.filter(item => item.status === 'FAILED').length +
                   checklist.reduce((sum, item) => sum + (item.subItems?.filter(sub => sub.status === 'FAILED').length || 0), 0)
    
    return { total, completed, inProgress, failed, percentage: Math.round((completed / total) * 100) }
  }

  const stats = getCompletionStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Checklist Compliance</h3>
          <p className="text-gray-600">{certificationName}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={16} />
          Aggiungi Controllo
        </button>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">Progresso Compliance</h4>
          <span className="text-2xl font-bold text-green-600">{stats.percentage}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-green-500 h-3 rounded-full transition-all duration-500"
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
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            <p className="text-sm text-gray-600">Falliti</p>
          </div>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-4">
        {checklist.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      {getStatusText(item.status)}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {getPriorityText(item.priority)}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-2">{item.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>📂 {item.category}</span>
                    {item.dueDate && (
                      <span>📅 Scadenza: {new Date(item.dueDate).toLocaleDateString('it-IT')}</span>
                    )}
                    {item.completedDate && (
                      <span>✅ Completato: {new Date(item.completedDate).toLocaleDateString('it-IT')}</span>
                    )}
                    {item.completedBy && (
                      <span>👤 {item.completedBy}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {item.status === 'PENDING' && (
                    <button
                      onClick={() => updateItemStatus(item.id, 'IN_PROGRESS')}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Inizia
                    </button>
                  )}
                  {item.status === 'IN_PROGRESS' && (
                    <>
                      <button
                        onClick={() => updateItemStatus(item.id, 'COMPLETED')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        Completa
                      </button>
                      <button
                        onClick={() => updateItemStatus(item.id, 'FAILED', 'Controllo fallito')}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        Fallito
                      </button>
                    </>
                  )}
                  {item.status === 'FAILED' && (
                    <button
                      onClick={() => updateItemStatus(item.id, 'IN_PROGRESS')}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Riprova
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FileText size={16} />
                  </button>
                </div>
              </div>

              {item.notes && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700">📝 {item.notes}</p>
                </div>
              )}

              {item.evidence && item.evidence.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Evidenze:</p>
                  <div className="flex gap-2">
                    {item.evidence.map((evidence, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        📎 {evidence}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-items */}
              {item.subItems && item.subItems.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Sotto-controlli:</p>
                  <div className="space-y-2">
                    {item.subItems.map((subItem) => (
                      <div key={subItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-gray-900">{subItem.title}</h5>
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subItem.status)}`}>
                              {getStatusIcon(subItem.status)}
                              {getStatusText(subItem.status)}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{subItem.description}</p>
                          {subItem.completedBy && (
                            <p className="text-xs text-gray-500 mt-1">
                              Completato da {subItem.completedBy} il {new Date(subItem.completedDate!).toLocaleDateString('it-IT')}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {subItem.status === 'PENDING' && (
                            <button
                              onClick={() => updateItemStatus(subItem.id, 'IN_PROGRESS')}
                              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                            >
                              Inizia
                            </button>
                          )}
                          {subItem.status === 'IN_PROGRESS' && (
                            <>
                              <button
                                onClick={() => updateItemStatus(subItem.id, 'COMPLETED')}
                                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => updateItemStatus(subItem.id, 'FAILED')}
                                className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                              >
                                ✗
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Aggiungi Controllo</h3>
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
                  value={newItem.title}
                  onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Es: Controllo temperatura"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={3}
                  placeholder="Descrizione dettagliata del controllo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Seleziona categoria</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priorità</label>
                <select
                  value={newItem.priority}
                  onChange={(e) => setNewItem(prev => ({ ...prev, priority: e.target.value as ChecklistItem['priority'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scadenza (opzionale)</label>
                <input
                  type="date"
                  value={newItem.dueDate}
                  onChange={(e) => setNewItem(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
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
                onClick={addNewItem}
                disabled={!newItem.title || !newItem.description || !newItem.category}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Aggiungi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Dettagli Controllo</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{selectedItem.title}</h4>
                <p className="text-gray-600">{selectedItem.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoria</label>
                  <p className="text-gray-900">{selectedItem.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priorità</label>
                  <p className="text-gray-900">{getPriorityText(selectedItem.priority)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="text-gray-900">{getStatusText(selectedItem.status)}</p>
                </div>
                {selectedItem.dueDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Scadenza</label>
                    <p className="text-gray-900">{new Date(selectedItem.dueDate).toLocaleDateString('it-IT')}</p>
                  </div>
                )}
              </div>

              {selectedItem.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-700">{selectedItem.notes}</p>
                  </div>
                </div>
              )}

              {selectedItem.evidence && selectedItem.evidence.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Evidenze</label>
                  <div className="space-y-2">
                    {selectedItem.evidence.map((evidence, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <FileText size={16} className="text-gray-400" />
                        <span className="text-gray-700">{evidence}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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