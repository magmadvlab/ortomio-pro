'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Edit, Trash2, Droplets, Gauge, Factory, Clock, Zap } from 'lucide-react'
import { IrrigationSystem } from '@/types/irrigation'

interface IrrigationSystemCardProps {
  system: IrrigationSystem
  onEdit: () => void
  onDelete: () => void
}

export function IrrigationSystemCard({ system, onEdit, onDelete }: IrrigationSystemCardProps) {
  const typeIcons = {
    Manual: '💧',
    Drip: '💦',
    Sprinkler: '🌧️',
    Micro: '🌊',
    Soaker: '🚿'
  }

  const typeLabels = {
    Manual: 'Manuale',
    Drip: 'Goccia',
    Sprinkler: 'Irrigatori',
    Micro: 'Micro-irrigazione',
    Soaker: 'Tubo Poroso'
  }

  const sourceLabels = {
    Municipal: 'Acquedotto',
    Consortium: 'Consorzio di Bonifica',
    Well: 'Pozzo',
    Rainwater: 'Raccolta Piovana',
    River: 'Fiume/Canale',
    Pond: 'Laghetto'
  }

  const systemType = (system.type || 'Drip') as keyof typeof typeIcons

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{typeIcons[systemType]}</div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">{system.name}</h3>
              <p className="text-sm text-gray-600">{typeLabels[systemType]}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={onEdit} variant="outline" size="sm">
              <Edit size={16} className="mr-1" />
              Modifica
            </Button>
            <Button onClick={onDelete} variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Fonte Acqua */}
          {system.waterSource && (
            <div className="flex items-start gap-3">
              <Factory className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-xs text-gray-500">Fonte Acqua</p>
                <p className="text-sm font-medium text-gray-900">
                  {sourceLabels[system.waterSource]}
                </p>
              </div>
            </div>
          )}

          {/* Pressione */}
          {system.pressureBar && (
            <div className="flex items-start gap-3">
              <Gauge className="text-orange-500 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-xs text-gray-500">Pressione</p>
                <p className="text-sm font-medium text-gray-900">
                  {system.pressureBar} bar
                </p>
              </div>
            </div>
          )}

          {/* Timer */}
          <div className="flex items-start gap-3">
            <Clock className={`flex-shrink-0 mt-0.5 ${system.hasTimer ? 'text-green-500' : 'text-gray-300'}`} size={18} />
            <div>
              <p className="text-xs text-gray-500">Timer</p>
              <p className={`text-sm font-medium ${system.hasTimer ? 'text-green-600' : 'text-gray-400'}`}>
                {system.hasTimer ? 'Presente' : 'Assente'}
              </p>
            </div>
          </div>

          {/* Valvole */}
          <div className="flex items-start gap-3">
            <Zap className={`flex-shrink-0 mt-0.5 ${system.hasValve ? 'text-purple-500' : 'text-gray-300'}`} size={18} />
            <div>
              <p className="text-xs text-gray-500">Valvole Smart</p>
              <p className={`text-sm font-medium ${system.hasValve ? 'text-purple-600' : 'text-gray-400'}`}>
                {system.hasValve ? 'Presenti' : 'Assenti'}
              </p>
            </div>
          </div>
        </div>

        {/* Note */}
        {system.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Note</p>
            <p className="text-sm text-gray-700">{system.notes}</p>
          </div>
        )}

        {/* Created At */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-gray-500">
          <span>Creato il {new Date(system.createdAt).toLocaleDateString('it-IT')}</span>
          {system.updatedAt && system.updatedAt !== system.createdAt && (
            <span>Aggiornato il {new Date(system.updatedAt).toLocaleDateString('it-IT')}</span>
          )}
        </div>
      </div>
    </Card>
  )
}
