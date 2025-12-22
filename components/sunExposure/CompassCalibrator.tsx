'use client'

import React, { useState, useRef, useEffect } from 'react'
import { RotateCcw, Check, X, Compass, AlertCircle } from 'lucide-react'

interface CompassCalibratorProps {
  photoUrl: string // URL o base64 della foto panoramica
  onConfirm: (offset: number) => void
  onCancel: () => void
  initialOffset?: number // Offset iniziale se già presente
}

/**
 * Componente per calibrare manualmente il Nord nella foto panoramica 360°
 * Mostra la foto con una bussola sovrapposta che l'utente può ruotare
 */
export function CompassCalibrator({
  photoUrl,
  onConfirm,
  onCancel,
  initialOffset = 0,
}: CompassCalibratorProps) {
  const [rotation, setRotation] = useState(initialOffset)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, rotation: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Calcola offset Nord: rotazione della foto per allineare Nord reale
  // Se l'utente ruota la foto di X gradi, l'offset è X
  const northOffset = rotation

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    setIsDragging(true)
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    setDragStart({
      x: e.clientX,
      rotation: rotation,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const deltaX = e.clientX - dragStart.x
    // Converti movimento orizzontale in rotazione (1px = 0.5 gradi)
    const deltaRotation = deltaX * 0.5
    let newRotation = dragStart.rotation + deltaRotation
    
    // Normalizza a 0-360
    while (newRotation < 0) newRotation += 360
    while (newRotation >= 360) newRotation -= 360
    
    setRotation(newRotation)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRotation(parseFloat(e.target.value))
  }

  const handleReset = () => {
    setRotation(0)
  }

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return
      
      const rect = containerRef.current.getBoundingClientRect()
      const deltaX = e.clientX - dragStart.x
      const deltaRotation = deltaX * 0.5
      let newRotation = dragStart.rotation + deltaRotation
      
      while (newRotation < 0) newRotation += 360
      while (newRotation >= 360) newRotation -= 360
      
      setRotation(newRotation)
    }

    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove)
      window.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging, dragStart])

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="text-blue-600" size={24} />
            <h3 className="text-lg font-bold text-gray-900">
              Calibra il Nord nella foto
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Istruzioni */}
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Come calibrare:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800">
                <li>Ruota la foto fino a quando il Nord nella foto corrisponde al Nord reale</li>
                <li>Puoi trascinare la foto o usare lo slider</li>
                <li>L'indicatore rosso mostra dove si trova il Nord nella foto</li>
                <li>Clicca "Conferma" quando hai allineato correttamente</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Foto con bussola */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-gray-50">
          <div
            ref={containerRef}
            className="relative max-w-full"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            {/* Foto panoramica */}
            <img
              ref={imageRef}
              src={photoUrl}
              alt="Foto panoramica 360°"
              className="max-w-full max-h-[60vh] rounded-lg shadow-lg"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              }}
              draggable={false}
            />

            {/* Overlay bussola */}
            <div className="absolute top-4 left-4 bg-white/90 rounded-lg p-3 shadow-lg border-2 border-blue-500">
              <div className="relative w-32 h-32">
                {/* Cerchio bussola */}
                <svg
                  width="128"
                  height="128"
                  viewBox="0 0 128 128"
                  className="absolute inset-0"
                >
                  {/* Cerchio esterno */}
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  
                  {/* Indicatori direzioni */}
                  {[0, 90, 180, 270].map((angle) => {
                    const rad = (angle * Math.PI) / 180
                    const x1 = 64 + 50 * Math.sin(rad)
                    const y1 = 64 - 50 * Math.cos(rad)
                    const x2 = 64 + 60 * Math.sin(rad)
                    const y2 = 64 - 60 * Math.cos(rad)
                    const label = angle === 0 ? 'N' : angle === 90 ? 'E' : angle === 180 ? 'S' : 'W'
                    
                    return (
                      <g key={angle}>
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={angle === 0 ? '#ef4444' : '#6b7280'}
                          strokeWidth={angle === 0 ? '3' : '2'}
                        />
                        <text
                          x={x2 + (angle === 0 ? 0 : angle === 90 ? 8 : angle === 180 ? 0 : -8)}
                          y={y2 + (angle === 0 ? -8 : angle === 90 ? 4 : angle === 180 ? 12 : 4)}
                          textAnchor={angle === 0 || angle === 180 ? 'middle' : angle === 90 ? 'start' : 'end'}
                          fontSize="14"
                          fontWeight="bold"
                          fill={angle === 0 ? '#ef4444' : '#374151'}
                        >
                          {label}
                        </text>
                      </g>
                    )
                  })}
                  
                  {/* Indicatore Nord corrente nella foto (ruotato) */}
                  <line
                    x1="64"
                    y1="64"
                    x2="64"
                    y2="20"
                    stroke="#ef4444"
                    strokeWidth="4"
                    strokeLinecap="round"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transformOrigin: '64px 64px',
                    }}
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="4"
                    fill="#ef4444"
                  />
                </svg>
              </div>
              <div className="text-center mt-2">
                <p className="text-xs font-semibold text-gray-700">
                  Offset: {rotation.toFixed(1)}°
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controlli */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="space-y-4">
            {/* Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rotazione: {rotation.toFixed(1)}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                step="0.5"
                value={rotation}
                onChange={handleSliderChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0°</span>
                <span>90°</span>
                <span>180°</span>
                <span>270°</span>
                <span>360°</span>
              </div>
            </div>

            {/* Pulsanti */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2 transition-colors"
              >
                <RotateCcw size={16} />
                Reset
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={() => onConfirm(northOffset)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
                >
                  <Check size={16} />
                  Conferma
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


