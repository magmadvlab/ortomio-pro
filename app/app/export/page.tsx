'use client'

import { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden, GardenTask } from '@/types'
import { Download, FileText, Database, Calendar, Package, BarChart3, Settings } from 'lucide-react'

export default function ExportPage() {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGarden, setSelectedGarden] = useState<string>('all')
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv')
  const [exportType, setExportType] = useState<'tasks' | 'gardens' | 'analytics'>('tasks')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedGardens, loadedTasks] = await Promise.all([
          storageProvider.getGardens(),
          storageProvider.getTasks()
        ])
        setGardens(loadedGardens)
        setTasks(loadedTasks)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [storageProvider])

  const handleExport = async () => {
    try {
      let dataToExport: any[] = []
      let filename = ''

      switch (exportType) {
        case 'tasks':
          dataToExport = selectedGarden === 'all' 
            ? (tasks || [])
            : (tasks || []).filter(t => t.gardenId === selectedGarden)
          filename = `ortomio-tasks-${new Date().toISOString().split('T')[0]}`
          break
        case 'gardens':
          dataToExport = selectedGarden === 'all' 
            ? gardens 
            : gardens.filter(g => g.id === selectedGarden)
          filename = `ortomio-gardens-${new Date().toISOString().split('T')[0]}`
          break
        case 'analytics':
          // Create analytics data
          dataToExport = gardens.map(garden => {
            const gardenTasks = (tasks || []).filter(t => t.gardenId === garden.id)
            return {
              gardenName: garden.name,
              totalTasks: gardenTasks.length,
              completedTasks: gardenTasks.filter(t => t.completed).length,
              activePlants: gardenTasks.filter(t => !t.completed).length,
              varieties: new Set(gardenTasks.map(t => t.plantName)).size
            }
          })
          filename = `ortomio-analytics-${new Date().toISOString().split('T')[0]}`
          break
      }

      if (exportFormat === 'csv') {
        exportToCSV(dataToExport, filename)
      } else {
        exportToPDF(dataToExport, filename)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Errore durante l\'esportazione. Riprova.')
    }
  }

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('Nessun dato da esportare')
      return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = (data: any[], filename: string) => {
    // For now, we'll create a simple HTML export that can be printed as PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>OrtoMio Export - ${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #16a34a; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .header { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌱 OrtoMio Export</h1>
          <p>Data esportazione: ${new Date().toLocaleDateString('it-IT')}</p>
          <p>Tipo: ${exportType === 'tasks' ? 'Attività' : exportType === 'gardens' ? 'Orti' : 'Analytics'}</p>
        </div>
        <table>
          <thead>
            <tr>
              ${Object.keys(data[0] || {}).map(key => `<th>${key}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const newWindow = window.open(url, '_blank')
    if (newWindow) {
      newWindow.onload = () => {
        setTimeout(() => {
          newWindow.print()
        }, 250)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento dati...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Download className="text-green-600" />
            Export Dati
          </h1>
          <p className="text-gray-600 mt-1">
            Esporta i tuoi dati in formato CSV o PDF per backup e analisi
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          {/* Export Configuration */}
          <div className="space-y-6">
            {/* Export Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo di Dati da Esportare
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setExportType('tasks')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    exportType === 'tasks'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Calendar className="mx-auto mb-2" size={24} />
                  <div className="font-medium">Attività</div>
                  <div className="text-sm text-gray-600">Task e operazioni</div>
                </button>

                <button
                  onClick={() => setExportType('gardens')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    exportType === 'gardens'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Package className="mx-auto mb-2" size={24} />
                  <div className="font-medium">Orti</div>
                  <div className="text-sm text-gray-600">Configurazioni orti</div>
                </button>

                <button
                  onClick={() => setExportType('analytics')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    exportType === 'analytics'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <BarChart3 className="mx-auto mb-2" size={24} />
                  <div className="font-medium">Analytics</div>
                  <div className="text-sm text-gray-600">Statistiche e KPI</div>
                </button>
              </div>
            </div>

            {/* Garden Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleziona Orto
              </label>
              <select
                value={selectedGarden}
                onChange={(e) => setSelectedGarden(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Tutti gli orti</option>
                {gardens.map((garden) => (
                  <option key={garden.id} value={garden.id}>
                    {garden.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Formato di Export
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setExportFormat('csv')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    exportFormat === 'csv'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Database className="mx-auto mb-2" size={24} />
                  <div className="font-medium">CSV</div>
                  <div className="text-sm text-gray-600">Per Excel e fogli di calcolo</div>
                </button>

                <button
                  onClick={() => setExportFormat('pdf')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    exportFormat === 'pdf'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className="mx-auto mb-2" size={24} />
                  <div className="font-medium">PDF</div>
                  <div className="text-sm text-gray-600">Per stampa e archiviazione</div>
                </button>
              </div>
            </div>

            {/* Data Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Anteprima Dati</h3>
              <div className="text-sm text-gray-600">
                {exportType === 'tasks' && (
                  <p>
                    {selectedGarden === 'all' 
                      ? `${(tasks || []).length} attività totali`
                      : `${(tasks || []).filter(t => t.gardenId === selectedGarden).length} attività per l'orto selezionato`
                    }
                  </p>
                )}
                {exportType === 'gardens' && (
                  <p>
                    {selectedGarden === 'all' 
                      ? `${gardens.length} orti configurati`
                      : `1 orto selezionato`
                    }
                  </p>
                )}
                {exportType === 'analytics' && (
                  <p>
                    Statistiche per {selectedGarden === 'all' ? 'tutti gli orti' : '1 orto'}
                  </p>
                )}
              </div>
            </div>

            {/* Export Button */}
            <div className="flex justify-end">
              <button
                onClick={handleExport}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
              >
                <Download size={20} />
                Esporta {exportFormat.toUpperCase()}
              </button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Settings className="text-blue-600 mt-1" size={20} />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Informazioni Export</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• I file CSV possono essere aperti con Excel, Google Sheets o altri fogli di calcolo</li>
                <li>• I file PDF sono ottimizzati per la stampa e l'archiviazione</li>
                <li>• Tutti i dati esportati includono timestamp e informazioni complete</li>
                <li>• L'export è compatibile con sistemi di backup e analisi esterni</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}