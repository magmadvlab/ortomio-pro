'use client'

import React, { useState, useEffect } from 'react'
import { Sun, ChevronRight, Loader2 } from 'lucide-react'
import { Garden } from '@/types'
import { InfoTooltip } from '@/components/shared/InfoTooltip'
import { SunExposureDetailModal } from './SunExposureDetailModal'

interface SunExposureWidgetProps {
  garden: Garden
  className?: string
}

export function SunExposureWidget({ garden, className = '' }: SunExposureWidgetProps) {
  const [dailyHours, setDailyHours] = useState<number | null>(null)
  const [exposure, setExposure] = useState<'FullSun' | 'PartialSun' | 'PartialShade' | 'FullShade' | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const loadSunExposure = async () => {
      if (!garden.coordinates) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `/api/garden/sun-exposure?gardenId=${garden.id}&date=${new Date().toISOString().split('T')[0]}`
        )
        
        if (response.ok) {
          const data = await response.json()
          setDailyHours(data.dailySunHours)
          setExposure(data.exposure)
        } else {
          // Fallback a valore manuale se disponibile
          if (garden.dailySunHours) {
            setDailyHours(garden.dailySunHours)
            const mappedExposure = garden.sunExposure === 'Shade' ? 'FullShade' : 
                                   garden.sunExposure === 'PartSun' ? 'PartialShade' : 
                                   garden.sunExposure === 'FullSun' ? 'FullSun' :
                                   garden.sunExposure === 'PartialSun' ? 'PartialSun' : 'PartialSun';
            setExposure(mappedExposure as 'FullSun' | 'PartialSun' | 'PartialShade' | 'FullShade' | null)
          }
        }
      } catch (error) {
        console.error('Error loading sun exposure:', error)
        // Fallback a valore manuale
        if (garden.dailySunHours) {
          setDailyHours(garden.dailySunHours)
          const mappedExposure2 = garden.sunExposure === 'Shade' ? 'FullShade' : 
                                   garden.sunExposure === 'PartSun' ? 'PartialShade' : 
                                   garden.sunExposure === 'FullSun' ? 'FullSun' :
                                   garden.sunExposure === 'PartialSun' ? 'PartialSun' : 'PartialSun';
          setExposure(mappedExposure2 as 'FullSun' | 'PartialSun' | 'PartialShade' | 'FullShade' | null)
        }
      } finally {
        setLoading(false)
      }
    }

    loadSunExposure()
  }, [garden])

  const getExposureBadgeClass = (exp: string | null) => {
    switch (exp) {
      case 'FullSun':
        return 'bg-yellow-100 text-yellow-800'
      case 'PartialSun':
        return 'bg-orange-100 text-orange-800'
      case 'PartialShade':
        return 'bg-blue-100 text-blue-800'
      case 'FullShade':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getExposureLabel = (exp: string | null) => {
    switch (exp) {
      case 'FullSun':
        return 'Pieno Sole'
      case 'PartialSun':
        return 'Sole Parziale'
      case 'PartialShade':
        return 'Mezz\'Ombra'
      case 'FullShade':
        return 'Ombra'
      default:
        return 'Non disponibile'
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-gray-600 ${className}`}>
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">Caricamento...</span>
      </div>
    )
  }

  if (!garden.coordinates) {
    return null
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all ${className}`}
      >
        <Sun size={18} className="text-yellow-500" />
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Esposizione Solare</span>
            <InfoTooltip
              content="L'esposizione solare indica quante ore di sole diretto riceve il tuo orto ogni giorno. Questo valore viene calcolato considerando la posizione geografica, la stagione e gli ostacoli circostanti (palazzi, alberi)."
              size="sm"
            />
          </div>
          {dailyHours !== null && exposure ? (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-bold text-gray-900">{dailyHours}h</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getExposureBadgeClass(exposure)}`}>
                {getExposureLabel(exposure)}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-500">Non configurato</span>
          )}
        </div>
        <ChevronRight size={16} className="text-gray-400" />
      </button>

      {showModal && (
        <SunExposureDetailModal
          garden={garden}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

