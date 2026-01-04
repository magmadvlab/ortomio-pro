'use client'

import React, { useState, useRef } from 'react'
import { Plus, Trash2, Mountain, Building2, TreeDeciduous, CircleDot, Info } from 'lucide-react'
import { Obstacle3D } from '@/services/preciseSunCalculator'
import { parseObstaclesFromManualInput, validateObstacle } from '@/services/obstacleExtractor'

interface CompassObstacleSelectorProps {
  onObstaclesChange: (obstacles: Obstacle3D[]) => void
  initialObstacles?: Obstacle3D[]
  latitude: number
  longitude: number
}

interface ObstacleInput {
  azimuth: number
  heightMeters: number
  distanceMeters: number
  type: 'Building' | 'Tree' | 'Mountain' | 'Other'
}

/**
 * Componente Compass per selezionare ostacoli con azimuth preciso (0-360°)
 * Permette inserimento manuale di altezza, distanza e tipo ostacolo
 * Calcola automaticamente l'impatto sulle ore di sole
 */
export function CompassObstacleSelector({
  onObstaclesChange,
  initialObstacles = [],
  latitude,
  longitude
}: CompassObstacleSelectorProps) {
  const [obstacles, setObstacles] = useState<Obstacle3D[]>(
    initialObstacles.map(obs => ({
      ...obs,
      widthDegrees: obs.widthDegrees || 30
    }))
  )

  const [currentInput, setCurrentInput] = useState<ObstacleInput>({
    azimuth: 180, // Default: Sud
    heightMeters: 10,
    distanceMeters: 25,
    type: 'Building'
  })

  const [selectedAzimuth, setSelectedAzimuth] = useState<number>(180)
  const [isDragging, setIsDragging] = useState(false)
  const compassRef = useRef<SVGSVGElement>(null)

  // Calcola coordinate X,Y dal centro per un dato azimuth
  const getPointFromAzimuth = (azimuth: number, radius: number) => {
    const angleRad = ((azimuth - 90) * Math.PI) / 180 // -90 per iniziare da Nord (in alto)
    return {
      x: 200 + radius * Math.cos(angleRad),
      y: 200 + radius * Math.sin(angleRad)
    }
  }

  // Calcola azimuth da coordinate mouse
  const getAzimuthFromPoint = (clientX: number, clientY: number) => {
    if (!compassRef.current) return 0

    const rect = compassRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const dx = clientX - centerX
    const dy = clientY - centerY

    let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90
    if (angle < 0) angle += 360
    if (angle >= 360) angle -= 360

    return Math.round(angle)
  }

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsDragging(true)
    const azimuth = getAzimuthFromPoint(e.clientX, e.clientY)
    setSelectedAzimuth(azimuth)
    setCurrentInput({ ...currentInput, azimuth })
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return
    const azimuth = getAzimuthFromPoint(e.clientX, e.clientY)
    setSelectedAzimuth(azimuth)
    setCurrentInput({ ...currentInput, azimuth })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const addObstacle = () => {
    const newObstacle = parseObstaclesFromManualInput({
      direction: currentInput.azimuth,
      height: currentInput.heightMeters,
      distance: currentInput.distanceMeters,
      type: currentInput.type
    })

    const validation = validateObstacle(newObstacle)
    if (!validation.valid) {
      alert(`Errore: ${validation.errors.join(', ')}`)
      return
    }

    const updatedObstacles = [...obstacles, newObstacle]
    setObstacles(updatedObstacles)
    onObstaclesChange(updatedObstacles)
  }

  const removeObstacle = (index: number) => {
    const updatedObstacles = obstacles.filter((_, i) => i !== index)
    setObstacles(updatedObstacles)
    onObstaclesChange(updatedObstacles)
  }

  // Calcola angolo elevazione ostacolo (per preview)
  const calculateElevationAngle = (height: number, distance: number) => {
    return (Math.atan2(height, distance) * 180 / Math.PI).toFixed(1)
  }

  // Direzione cardinale da azimuth
  const getCardinalDirection = (azimuth: number): string => {
    const directions = [
      { min: 0, max: 22.5, label: 'N' },
      { min: 22.5, max: 67.5, label: 'NE' },
      { min: 67.5, max: 112.5, label: 'E' },
      { min: 112.5, max: 157.5, label: 'SE' },
      { min: 157.5, max: 202.5, label: 'S' },
      { min: 202.5, max: 247.5, label: 'SW' },
      { min: 247.5, max: 292.5, label: 'W' },
      { min: 292.5, max: 337.5, label: 'NW' },
      { min: 337.5, max: 360, label: 'N' }
    ]

    const dir = directions.find(d => azimuth >= d.min && azimuth < d.max)
    return dir?.label || 'N'
  }

  const getObstacleIcon = (type: string) => {
    switch (type) {
      case 'Building': return <Building2 size={16} />
      case 'Tree': return <TreeDeciduous size={16} />
      case 'Mountain': return <Mountain size={16} />
      default: return <CircleDot size={16} />
    }
  }

  const getObstacleColor = (type: string) => {
    switch (type) {
      case 'Building': return '#ef4444' // red
      case 'Tree': return '#10b981' // green
      case 'Mountain': return '#8b5cf6' // purple
      default: return '#6b7280' // gray
    }
  }

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Modalità Avanzata - Compass Selector</p>
            <p className="text-blue-800">
              Clicca sulla bussola per selezionare la direzione precisa dell'ostacolo (0-360°).
              Inserisci altezza e distanza per un calcolo scientifico delle ore di sole perse.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compass Selector */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">🧭 Seleziona Direzione</h3>

          <div className="bg-gray-50 rounded-xl p-6 flex items-center justify-center">
            <svg
              ref={compassRef}
              width="400"
              height="400"
              viewBox="0 0 400 400"
              className="cursor-crosshair select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Cerchio esterno */}
              <circle
                cx="200"
                cy="200"
                r="180"
                fill="white"
                stroke="#d1d5db"
                strokeWidth="2"
              />

              {/* Cerchi concentrici */}
              <circle cx="200" cy="200" r="120" fill="none" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="200" cy="200" r="60" fill="none" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />

              {/* Direzioni cardinali principali */}
              {[
                { angle: 0, label: 'N', color: '#ef4444' },
                { angle: 90, label: 'E', color: '#6b7280' },
                { angle: 180, label: 'S', color: '#6b7280' },
                { angle: 270, label: 'W', color: '#6b7280' }
              ].map(({ angle, label, color }) => {
                const point = getPointFromAzimuth(angle, 190)
                const linePoint = getPointFromAzimuth(angle, 175)
                return (
                  <g key={angle}>
                    <line
                      x1="200"
                      y1="200"
                      x2={linePoint.x}
                      y2={linePoint.y}
                      stroke={color}
                      strokeWidth={angle === 0 ? 3 : 2}
                    />
                    <text
                      x={point.x}
                      y={point.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="18"
                      fontWeight="bold"
                      fill={color}
                    >
                      {label}
                    </text>
                  </g>
                )
              })}

              {/* Direzioni intercardinali */}
              {[45, 135, 225, 315].map((angle) => {
                const point = getPointFromAzimuth(angle, 190)
                const linePoint = getPointFromAzimuth(angle, 175)
                const label = getCardinalDirection(angle)
                return (
                  <g key={angle}>
                    <line
                      x1="200"
                      y1="200"
                      x2={linePoint.x}
                      y2={linePoint.y}
                      stroke="#9ca3af"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={point.x}
                      y={point.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="14"
                      fill="#6b7280"
                    >
                      {label}
                    </text>
                  </g>
                )
              })}

              {/* Ostacoli esistenti */}
              {obstacles.map((obs, index) => {
                const point = getPointFromAzimuth(obs.azimuth, 150)
                const color = getObstacleColor(obs.type || 'Other')
                return (
                  <g key={index}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="8"
                      fill={color}
                      stroke="white"
                      strokeWidth="2"
                      opacity="0.8"
                    />
                    <line
                      x1="200"
                      y1="200"
                      x2={point.x}
                      y2={point.y}
                      stroke={color}
                      strokeWidth="2"
                      opacity="0.4"
                      strokeDasharray="4 2"
                    />
                  </g>
                )
              })}

              {/* Indicatore selezione corrente */}
              {(() => {
                const point = getPointFromAzimuth(selectedAzimuth, 150)
                return (
                  <>
                    <line
                      x1="200"
                      y1="200"
                      x2={point.x}
                      y2={point.y}
                      stroke="#3b82f6"
                      strokeWidth="3"
                      opacity="0.8"
                    />
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="10"
                      fill="#3b82f6"
                      stroke="white"
                      strokeWidth="3"
                    />
                  </>
                )
              })()}

              {/* Centro */}
              <circle cx="200" cy="200" r="5" fill="#374151" />
            </svg>
          </div>

          {/* Valore azimuth */}
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {selectedAzimuth}° {getCardinalDirection(selectedAzimuth)}
            </p>
            <p className="text-sm text-gray-600">Azimuth selezionato</p>
          </div>
        </div>

        {/* Form Parametri */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">📏 Parametri Ostacolo</h3>

          {/* Tipo Ostacolo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo Ostacolo
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'Building', label: 'Edificio', icon: <Building2 size={16} /> },
                { value: 'Tree', label: 'Albero', icon: <TreeDeciduous size={16} /> },
                { value: 'Mountain', label: 'Montagna', icon: <Mountain size={16} /> },
                { value: 'Other', label: 'Altro', icon: <CircleDot size={16} /> }
              ].map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() => setCurrentInput({ ...currentInput, type: value as any })}
                  className={`px-3 py-2 rounded-lg border-2 flex items-center gap-2 justify-center transition-all ${
                    currentInput.type === value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {icon}
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Altezza */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Altezza (metri)
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              step="0.5"
              value={currentInput.heightMeters}
              onChange={(e) => setCurrentInput({ ...currentInput, heightMeters: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Edificio ~3m/piano, albero medio ~8m, montagna ~100m+
            </p>
          </div>

          {/* Distanza */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distanza (metri)
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              step="1"
              value={currentInput.distanceMeters}
              onChange={(e) => setCurrentInput({ ...currentInput, distanceMeters: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Stima la distanza orizzontale dall'orto all'ostacolo
            </p>
          </div>

          {/* Preview Calcoli */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">📊 Calcoli Automatici</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p>
                <span className="font-medium">Angolo elevazione:</span>{' '}
                {calculateElevationAngle(currentInput.heightMeters, currentInput.distanceMeters)}°
              </p>
              <p>
                <span className="font-medium">Direzione:</span>{' '}
                {currentInput.azimuth}° ({getCardinalDirection(currentInput.azimuth)})
              </p>
            </div>
          </div>

          {/* Pulsante Aggiungi */}
          <button
            onClick={addObstacle}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium transition-colors"
          >
            <Plus size={20} />
            Aggiungi Ostacolo
          </button>
        </div>
      </div>

      {/* Lista Ostacoli */}
      {obstacles.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">🏔️ Ostacoli Aggiunti ({obstacles.length})</h3>

          <div className="space-y-2">
            {obstacles.map((obs, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div style={{ color: getObstacleColor(obs.type || 'Other') }}>
                    {getObstacleIcon(obs.type || 'Other')}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {obs.type === 'Building' ? 'Edificio' :
                       obs.type === 'Tree' ? 'Albero' :
                       obs.type === 'Mountain' ? 'Montagna' : 'Altro'}
                      {' '}a {obs.azimuth}° ({getCardinalDirection(obs.azimuth)})
                    </p>
                    <p className="text-xs text-gray-600">
                      Altezza: {obs.height}m • Distanza: {obs.distance}m •
                      Elevazione: {calculateElevationAngle(obs.height, obs.distance)}°
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeObstacle(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
