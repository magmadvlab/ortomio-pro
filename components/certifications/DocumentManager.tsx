'use client'

import React, { useState, useRef } from 'react'
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Eye,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  X
} from 'lucide-react'

interface Document {
  id: string
  name: string
  type: 'CERTIFICATE' | 'PROCEDURE' | 'RECORD' | 'AUDIT' | 'TRAINING'
  certification: string
  uploadDate: string
  expiryDate?: string
  status: 'VALID' | 'EXPIRING' | 'EXPIRED'
  size: number
  url: string
}

interface DocumentManagerProps {
  certification: string
  certificationName: string
}

export default function DocumentManager({ certification, certificationName }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Certificato GlobalG.A.P. 2024',
      type: 'CERTIFICATE',
      certification: 'GLOBALGAP',
      uploadDate: '2024-01-15',
      expiryDate: '2025-01-15',
      status: 'VALID',
      size: 2048000,
      url: '#'
    },
    {
      id: '2',
      name: 'Procedura Controllo Qualità',
      type: 'PROCEDURE',
      certification: 'GLOBALGAP',
      uploadDate: '2024-02-01',
      status: 'VALID',
      size: 1024000,
      url: '#'
    },
    {
      id: '3',
      name: 'Registro Trattamenti 2024',
      type: 'RECORD',
      certification: 'GLOBALGAP',
      uploadDate: '2024-03-01',
      expiryDate: '2024-12-31',
      status: 'EXPIRING',
      size: 512000,
      url: '#'
    }
  ])
  
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'CERTIFICATE' as Document['type'],
    expiryDate: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const documentTypes = [
    { value: 'CERTIFICATE', label: 'Certificato', icon: '🏆' },
    { value: 'PROCEDURE', label: 'Procedura', icon: '📋' },
    { value: 'RECORD', label: 'Registro', icon: '📝' },
    { value: 'AUDIT', label: 'Audit', icon: '🔍' },
    { value: 'TRAINING', label: 'Formazione', icon: '🎓' }
  ]

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'VALID': return 'text-green-600 bg-green-100'
      case 'EXPIRING': return 'text-yellow-600 bg-yellow-100'
      case 'EXPIRED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'VALID': return <CheckCircle size={16} />
      case 'EXPIRING': return <Clock size={16} />
      case 'EXPIRED': return <AlertTriangle size={16} />
      default: return <Clock size={16} />
    }
  }

  const getStatusText = (status: Document['status']) => {
    switch (status) {
      case 'VALID': return 'Valido'
      case 'EXPIRING': return 'In Scadenza'
      case 'EXPIRED': return 'Scaduto'
      default: return 'Sconosciuto'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Simulate file upload
    const newDocument: Document = {
      id: Date.now().toString(),
      name: uploadForm.name || file.name,
      type: uploadForm.type,
      certification,
      uploadDate: new Date().toISOString().split('T')[0],
      expiryDate: uploadForm.expiryDate || undefined,
      status: 'VALID',
      size: file.size,
      url: URL.createObjectURL(file)
    }

    setDocuments(prev => [newDocument, ...prev])
    setShowUploadModal(false)
    setUploadForm({ name: '', type: 'CERTIFICATE', expiryDate: '' })
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeleteDocument = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo documento?')) {
      setDocuments(prev => prev.filter(doc => doc.id !== id))
    }
  }

  const filteredDocuments = documents.filter(doc => doc.certification === certification)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Gestione Documenti</h3>
          <p className="text-gray-600">{certificationName}</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Carica Documento
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Totali</p>
              <p className="text-xl font-bold text-gray-900">{filteredDocuments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Validi</p>
              <p className="text-xl font-bold text-green-600">
                {filteredDocuments.filter(d => d.status === 'VALID').length}
              </p>
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
              <p className="text-xl font-bold text-yellow-600">
                {filteredDocuments.filter(d => d.status === 'EXPIRING').length}
              </p>
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
              <p className="text-xl font-bold text-red-600">
                {filteredDocuments.filter(d => d.status === 'EXPIRED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">Documenti Caricati</h4>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredDocuments.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun documento</h3>
              <p className="text-gray-600 mb-4">Carica il primo documento per questa certificazione</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Carica Documento
              </button>
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <div key={doc.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <FileText className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{doc.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>
                          {documentTypes.find(t => t.value === doc.type)?.icon} {' '}
                          {documentTypes.find(t => t.value === doc.type)?.label}
                        </span>
                        <span>Caricato: {new Date(doc.uploadDate).toLocaleDateString('it-IT')}</span>
                        {doc.expiryDate && (
                          <span>Scadenza: {new Date(doc.expiryDate).toLocaleDateString('it-IT')}</span>
                        )}
                        <span>{formatFileSize(doc.size)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(doc.status)}`}>
                      {getStatusIcon(doc.status)}
                      {getStatusText(doc.status)}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(doc.url, '_blank')}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = doc.url
                          link.download = doc.name
                          link.click()
                        }}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Carica Documento</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Documento
                </label>
                <input
                  type="text"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Es: Certificato GlobalG.A.P. 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo Documento
                </label>
                <select
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, type: e.target.value as Document['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {documentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Scadenza (opzionale)
                </label>
                <input
                  type="date"
                  value={uploadForm.expiryDate}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formati supportati: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (max 10MB)
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Seleziona File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}