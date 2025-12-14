'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Upload, Compass, Building, Trees, Mountain, Loader2, X } from 'lucide-react'
import { Garden } from '@/types'
import { Obstacle3D } from '@/services/preciseSunCalculator'
import { extractObstaclesFrom360, parseObstaclesFromManualInput, formatObstacleDescription } from '@/services/obstacleExtractor'
import { fileToBase64 } from '@/services/photoAnalysisService'
import { InfoTooltip } from '@/components/shared/InfoTooltip'

interface ObstacleManagerProps {
  garden: Garden
  obstacles: Obstacle3D[]
  onObstaclesChange: (obstacles: Obstacle3D[]) => void
  className?: string
}

export function ObstacleManager({ garden, obstacles, onObstaclesChange, className = '' }: ObstacleManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  
  // Form state
  const [direction, setDirection] = useState('South')
  const [azimuth, setAzimuth] = useState('180')
  const [height, setHeight] = useState('')
  const [distance, setDistance] = useState('')
  const [widthDegrees, setWidthDegrees] = useState('30')
  const [type, setType] = useState<'Building' | 'Tree' | 'Mountain' | 'Other'>('Building')

  const directionOptions = [
    { value: 'North', label: 'Nord (0°)', azimuth: 0 },
    { value: 'Northeast', label: 'Nord-Est (45°)', azimuth: 45 },
    { value: 'East', label: 'Est (90°)', azimuth: 90 },
    { value: 'Southeast', label: 'Sud-Est (135°)', azimuth: 135 },
    { value: 'South', label: 'Sud (180°)', azimuth: 180 },
    { value: 'Southwest', label: 'Sud-Ovest (225°)', azimuth: 225 },
    { value: 'West', label: 'Ovest (270°)', azimuth: 270 },
    { value: 'Northwest', label: 'Nord-Ovest (315°)', azimuth: 315 },
  ]

  const resetForm = () => {
    setDirection('South')
    setAzimuth('180')
    setHeight('')
    setDistance('')
    setWidthDegrees('30')
    setType('Building')
    setEditingIndex(null)
    setShowAddForm(false)
  }

  const handleAddObstacle = () => {
    const obstacle = parseObstaclesFromManualInput({
      direction: direction === 'custom' ? parseFloat(azimuth) : direction,
      height: parseFloat(height),
      distance: parseFloat(distance),
      widthDegrees: parseFloat(widthDegrees),
      type,
    })

    if (editingIndex !== null) {
      const updated = [...obstacles]
      updated[editingIndex] = obstacle
      onObstaclesChange(updated)
    } else {
      onObstaclesChange([...obstacles, obstacle])
    }
    
    resetForm()
  }

  const handleDeleteObstacle = (index: number) => {
    if (confirm('Sei sicuro di voler eliminare questo ostacolo?')) {
      const updated = obstacles.filter((_, i) => i !== index)
      onObstaclesChange(updated)
    }
  }

  const handleEditObstacle = (index: number) => {
    const obstacle = obstacles[index]
    setDirection('custom')
    setAzimuth(obstacle.azimuth.toString())
    setHeight(obstacle.height.toString())
    setDistance(obstacle.distance.toString())
    setWidthDegrees(obstacle.widthDegrees.toString())
    setType(obstacle.type || 'Building')
    setEditingIndex(index)
    setShowAddForm(true)
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !garden.coordinates) return

    setUploadingPhoto(true)
    try {
      const base64 = await fileToBase64(file)
      const extracted = await extractObstaclesFrom360(
        base64,
        garden.coordinates.latitude,
        garden.coordinates.longitude
      )
      
      // Aggiungi ostacoli estratti (evita duplicati)
      const existingAzimuths = new Set(obstacles.map(o => Math.round(o.azimuth)))
      const newObstacles = extracted.filter(
        o => !existingAzimuths.has(Math.round(o.azimuth))
      )
      
      onObstaclesChange([...obstacles, ...newObstacles])
      alert(`Estratti ${newObstacles.length} ostacolo${newObstacles.length !== 1 ? 'i' : ''} dalla foto 360°`)
    } catch (error) {
      console.error('Error extracting obstacles:', error)
      alert('Errore durante l\'estrazione degli ostacoli dalla foto')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'Building':
        return <Building size={16} className="text-gray-600" />
      case 'Tree':
        return <Trees size={16} className="text-green-600" />
      case 'Mountain':
        return <Mountain size={16} className="text-gray-700" />
      default:
        return <Compass size={16} className="text-gray-500" />
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Ostacoli</h3>
          <InfoTooltip
            content="Gli ostacoli (palazzi, alberi, montagne) possono bloccare il sole e ridurre le ore di esposizione solare. Aggiungi gli ostacoli principali per un calcolo più preciso."
            size="sm"
          />
        </div>
        <div className="flex gap-2">
          <label className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer text-sm font-medium flex items-center gap-2 transition-colors">
            <Upload size={16} />
            Foto 360°
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
              disabled={uploadingPhoto || !garden.coordinates}
            />
          </label>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            Aggiungi Manuale
          </button>
        </div>
      </div>

      {/* Form Aggiunta/Modifica */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">
              {editingIndex !== null ? 'Modifica Ostacolo' : 'Nuovo Ostacolo'}
            </h4>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Direzione
              </label>
              <select
                value={direction}
                onChange={(e) => {
                  setDirection(e.target.value)
                  if (e.target.value !== 'custom') {
                    const option = directionOptions.find(o => o.value === e.target.value)
                    if (option) setAzimuth(option.azimuth.toString())
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {directionOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
                <option value="custom">Personalizzata (azimut)</option>
              </select>
            </div>

            {direction === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Azimut (0-360°)
                </label>
                <input
                  type="number"
                  min="0"
                  max="360"
                  value={azimuth}
                  onChange={(e) => setAzimuth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Altezza (metri)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Es. 10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distanza (metri)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="Es. 20"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Larghezza Angolare (gradi)
              </label>
              <input
                type="number"
                min="1"
                max="180"
                value={widthDegrees}
                onChange={(e) => setWidthDegrees(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="Building">Edificio</option>
                <option value="Tree">Albero</option>
                <option value="Mountain">Montagna</option>
                <option value="Other">Altro</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAddObstacle}
              disabled={!height || !distance}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {editingIndex !== null ? 'Salva Modifiche' : 'Aggiungi'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
            >
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Lista Ostacoli */}
      {obstacles.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
          <Compass size={48} className="mx-auto mb-2 text-gray-400" />
          <p>Nessun ostacolo configurato</p>
          <p className="text-sm mt-1">Aggiungi ostacoli per un calcolo più preciso dell'esposizione solare</p>
        </div>
      ) : (
        <div className="space-y-2">
          {obstacles.map((obstacle, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-green-300 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                {getTypeIcon(obstacle.type)}
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {formatObstacleDescription(obstacle)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Azimut: {Math.round(obstacle.azimuth)}° | 
                    Larghezza: {obstacle.widthDegrees}°
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditObstacle(index)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  aria-label="Modifica"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDeleteObstacle(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Elimina"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {uploadingPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <Loader2 className="animate-spin text-green-600" size={24} />
            <span className="text-gray-700">Analisi foto 360° in corso...</span>
          </div>
        </div>
      )}
    </div>
  )
}

