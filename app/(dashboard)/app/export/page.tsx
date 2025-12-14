'use client'

import React, { useState } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { useTier } from '@/packages/core/hooks/useTier'
import { ProFeatureGate } from '@/components/shared/ProFeatureGate'
import { Database, FileText, Download, Calendar, MapPin, Loader2 } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { it } from 'date-fns/locale'

export default function ExportPage() {
  const { storageProvider } = useStorage()
  const { isProfessional } = useTier()
  const [gardens, setGardens] = useState<any[]>([])
  const [selectedGardenId, setSelectedGardenId] = useState<string>('')
  const [exportType, setExportType] = useState<'analytics' | 'treatments' | 'tasks' | 'harvest'>('analytics')
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  })
  const [fileFormat, setFileFormat] = useState<'csv' | 'pdf'>('csv')
  const [exporting, setExporting] = useState(false)

  React.useEffect(() => {
    const loadGardens = async () => {
      const gardensList = await storageProvider.getGardens()
      setGardens(gardensList)
      if (gardensList.length > 0) {
        setSelectedGardenId(gardensList[0].id)
      }
    }
    loadGardens()
  }, [storageProvider])

  const handleExport = async () => {
    setExporting(true)
    try {
      if (exportType === 'analytics' || exportType === 'treatments') {
        // Usa API esistente
        const params = new URLSearchParams()
        params.append('type', exportType)
        if (selectedGardenId) {
          params.append('garden_id', selectedGardenId)
        }

        const response = await fetch(`/api/export/${fileFormat}?${params.toString()}`)
        
        if (response.ok) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `ortomio-${exportType}-${format(new Date(), 'yyyy-MM-dd')}.${fileFormat}`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
        } else {
          const error = await response.json()
          alert(`Errore: ${error.message || 'Impossibile esportare i dati'}`)
        }
      } else {
        // Export tasks o harvest da storage locale
        alert('Export per tasks e harvest sarà implementato prossimamente')
      }
    } catch (error: any) {
      console.error('Export error:', error)
      alert(`Errore: ${error.message || 'Impossibile esportare i dati'}`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto">
      <ProFeatureGate
        feature="data-export"
        title="Export Dati"
        description="Esporta i tuoi dati in formato CSV o PDF"
        requiredTier="PRO_PROFESSIONAL"
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Database className="text-blue-600" size={32} />
            Export Dati
          </h1>
          <p className="text-gray-600">
            Esporta analytics, trattamenti, task e raccolti in formato CSV o PDF
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Tipo Export */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo di Dati
            </label>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="analytics">Analytics Professionali</option>
              <option value="treatments">Trattamenti</option>
              <option value="tasks">Task e Lavori</option>
              <option value="harvest">Raccolti</option>
            </select>
          </div>

          {/* Formato File */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formato File
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="csv"
                  checked={fileFormat === 'csv'}
                  onChange={(e) => setFileFormat(e.target.value as 'csv' | 'pdf')}
                  className="w-4 h-4 text-blue-600"
                />
                <FileText size={20} />
                <span>CSV</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="pdf"
                  checked={fileFormat === 'pdf'}
                  onChange={(e) => setFileFormat(e.target.value as 'csv' | 'pdf')}
                  className="w-4 h-4 text-blue-600"
                />
                <FileText size={20} />
                <span>PDF</span>
              </label>
            </div>
          </div>

          {/* Filtro Giardino */}
          {gardens.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-2" />
                Giardino
              </label>
              <select
                value={selectedGardenId}
                onChange={(e) => setSelectedGardenId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tutti i giardini</option>
                {gardens.map(garden => (
                  <option key={garden.id} value={garden.id}>
                    {garden.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Data Inizio
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Data Fine
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Pulsante Export */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {exporting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Esportazione in corso...</span>
              </>
            ) : (
              <>
                <Download size={20} />
                <span>Esporta {exportType.toUpperCase()} in {fileFormat.toUpperCase()}</span>
              </>
            )}
          </button>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> L'export include tutti i dati disponibili per il tipo selezionato.
              {exportType === 'tasks' || exportType === 'harvest' ? ' Funzionalità in sviluppo.' : ''}
            </p>
          </div>
        </div>
      </ProFeatureGate>
    </div>
  )
}





