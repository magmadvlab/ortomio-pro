'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/ortomio-adapter'
import { Button } from '@/components/ui/Button'
import { 
  Sprout, 
  Camera, 
  Edit3, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Calendar,
  TrendingUp,
  Droplets,
  Sun,
  Thermometer
} from 'lucide-react'

interface SeedlingBatch {
  id: string
  plantName: string
  variety: string
  source: 'home' | 'nursery'
  currentPhase: 'germination' | 'nursing' | 'hardening' | 'ready' | 'transplanted'
  startDate: Date
  quantity: number
  survivingQuantity: number
  photos: Array<{
    id: string
    url: string
    date: Date
    phase: string
    notes?: string
  }>
  notes: string
  expectedTransplantDate: Date
  actualTransplantDate?: Date
}

interface SeedingProgressCardProps {
  batch: SeedlingBatch
  onPhaseUpdate?: (batchId: string, newPhase: SeedlingBatch['currentPhase']) => void
  onPhotoAdd?: (batchId: string, photo: File) => void
  onNotesUpdate?: (batchId: string, notes: string) => void
  onTransplant?: (batchId: string) => void
  compact?: boolean
}

export default function SeedingProgressCard({
  batch,
  onPhaseUpdate,
  onPhotoAdd,
  onNotesUpdate,
  onTransplant,
  compact = false
}: SeedingProgressCardProps) {
  const [showNotes, setShowNotes] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState(batch.notes)

  const getPhaseInfo = (phase: SeedlingBatch['currentPhase']) => {
    switch (phase) {
      case 'germination':
        return {
          label: 'Germinazione',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Sprout className="w-4 h-4" />,
          progress: 25
        }
      case 'nursing':
        return {
          label: 'Nursing',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Droplets className="w-4 h-4" />,
          progress: 50
        }
      case 'hardening':
        return {
          label: 'Indurimento',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: <Sun className="w-4 h-4" />,
          progress: 75
        }
      case 'ready':
        return {
          label: 'Pronto',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className="w-4 h-4" />,
          progress: 100
        }
      case 'transplanted':
        return {
          label: 'Trapiantato',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <CheckCircle className="w-4 h-4" />,
          progress: 100
        }
      default:
        return {
          label: 'Sconosciuto',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <Clock className="w-4 h-4" />,
          progress: 0
        }
    }
  }

  const phaseInfo = getPhaseInfo(batch.currentPhase)
  const survivalRate = (batch.survivingQuantity / batch.quantity) * 100
  const daysSinceStart = Math.floor((new Date().getTime() - batch.startDate.getTime()) / (1000 * 60 * 60 * 24))
  const isDelayed = batch.currentPhase === 'germination' && daysSinceStart > 14

  const handlePhaseAdvance = () => {
    const phases: SeedlingBatch['currentPhase'][] = ['germination', 'nursing', 'hardening', 'ready', 'transplanted']
    const currentIndex = phases.indexOf(batch.currentPhase)
    if (currentIndex < phases.length - 1) {
      onPhaseUpdate?.(batch.id, phases[currentIndex + 1])
    }
  }

  const handleNotesSubmit = () => {
    onNotesUpdate?.(batch.id, notesValue)
    setEditingNotes(false)
  }

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🌱</div>
              <div>
                <h3 className="font-semibold text-gray-900">{batch.plantName}</h3>
                <p className="text-sm text-gray-600">{batch.variety}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={phaseInfo.color}>
                {phaseInfo.icon}
                <span className="ml-1">{phaseInfo.label}</span>
              </Badge>
              
              <div className="text-right text-sm">
                <p className="font-medium">{batch.survivingQuantity}/{batch.quantity}</p>
                <p className="text-gray-500">{survivalRate.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🌱</div>
            <div>
              <CardTitle className="text-lg">{batch.plantName}</CardTitle>
              <p className="text-sm text-gray-600">{batch.variety}</p>
              <p className="text-xs text-gray-500">
                {batch.source === 'home' ? 'Semi propri' : 'Da vivaio'}
              </p>
            </div>
          </div>
          
          {isDelayed && (
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Fase corrente */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Badge className={phaseInfo.color}>
              {phaseInfo.icon}
              <span className="ml-1">{phaseInfo.label}</span>
            </Badge>
            <span className="text-sm text-gray-600">{daysSinceStart} giorni</span>
          </div>
          
          {/* Barra progresso */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${phaseInfo.progress}%` }}
            />
          </div>
        </div>

        {/* Statistiche sopravvivenza */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{batch.survivingQuantity}</div>
            <div className="text-xs text-gray-600">Piantine vive</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className={`text-lg font-bold ${
              survivalRate >= 80 ? 'text-green-600' :
              survivalRate >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {survivalRate.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-600">Sopravvivenza</div>
          </div>
        </div>

        {/* Date importanti */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Inizio: {batch.startDate.toLocaleDateString('it-IT')}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              Trapianto previsto: {batch.expectedTransplantDate.toLocaleDateString('it-IT')}
            </span>
          </div>
          {batch.actualTransplantDate && (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-700">
                Trapiantato: {batch.actualTransplantDate.toLocaleDateString('it-IT')}
              </span>
            </div>
          )}
        </div>

        {/* Foto */}
        {batch.photos.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Camera className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{batch.photos.length} foto</span>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {batch.photos.slice(0, 3).map((photo) => (
                <div key={photo.id} className="flex-shrink-0">
                  <img 
                    src={photo.url} 
                    alt={`Foto ${photo.phase}`}
                    className="w-16 h-16 object-cover rounded border"
                  />
                </div>
              ))}
              {batch.photos.length > 3 && (
                <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                  <span className="text-xs text-gray-600">+{batch.photos.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Note */}
        {(batch.notes || showNotes) && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Note</span>
              <button
                onClick={() => setEditingNotes(!editingNotes)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            {editingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded resize-none"
                  rows={3}
                  placeholder="Aggiungi note..."
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleNotesSubmit}>
                    Salva
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingNotes(false)}>
                    Annulla
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                {batch.notes || 'Nessuna nota'}
              </p>
            )}
          </div>
        )}

        {/* Azioni */}
        <div className="flex gap-2 pt-2 border-t border-gray-200">
          {onPhaseUpdate && batch.currentPhase !== 'transplanted' && batch.currentPhase !== 'ready' && (
            <Button size="sm" onClick={handlePhaseAdvance} className="flex-1">
              Avanza Fase
            </Button>
          )}
          
          {onTransplant && batch.currentPhase === 'ready' && (
            <Button size="sm" onClick={() => onTransplant?.(batch.id)} className="flex-1">
              <CheckCircle className="w-4 h-4 mr-1" />
              Trapianta
            </Button>
          )}
          
          <Button size="sm" variant="outline" onClick={() => setShowNotes(!showNotes)}>
            <Camera className="w-4 h-4" />
          </Button>
          
          {!showNotes && (
            <Button size="sm" variant="outline" onClick={() => setShowNotes(true)}>
              <Edit3 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Avvisi specifici */}
        {isDelayed && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Germinazione ritardata - controlla condizioni
              </span>
            </div>
          </div>
        )}

        {survivalRate < 50 && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-800">
                Bassa sopravvivenza - verifica cure
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
