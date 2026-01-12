'use client'

import React from 'react'
import { BarChart3, TrendingUp, Leaf, Beaker } from 'lucide-react'

interface NutritionStatsProps {
  treatments: any[]
  fertilizers: any[]
}

export function NutritionStatsWidget({ treatments, fertilizers }: NutritionStatsProps) {
  // Calcola statistiche trattamenti
  const treatmentStats = {
    total: treatments.length,
    organic: treatments.filter(t => t.treatment_type === 'organic' || t.organic_approved).length,
    conventional: treatments.filter(t => t.treatment_type === 'conventional' || (!t.treatment_type && !t.organic_approved)).length,
    integrated: treatments.filter(t => t.treatment_type === 'integrated').length,
  }

  // Calcola statistiche fertilizzanti
  const fertilizerStats = {
    total: fertilizers.length,
    organic: fertilizers.filter(f => f.fertilizerType === 'organic').length,
    mineral: fertilizers.filter(f => f.fertilizerType === 'mineral').length,
    chemical: fertilizers.filter(f => f.fertilizerType === 'chemical').length,
    mixed: fertilizers.filter(f => f.fertilizerType === 'mixed').length,
  }

  // Calcola percentuali
  const organicPercentage = treatmentStats.total > 0 
    ? Math.round((treatmentStats.organic / treatmentStats.total) * 100) 
    : 0

  const organicFertilizerPercentage = fertilizerStats.total > 0 
    ? Math.round((fertilizerStats.organic / fertilizerStats.total) * 100) 
    : 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={18} className="text-purple-700" />
        <h2 className="text-lg font-bold text-gray-900">Statistiche Bio/Tradizionale</h2>
      </div>

      <div className="space-y-4">
        {/* Statistiche Trattamenti */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Trattamenti</h3>
            <span className="text-xs text-gray-500">{treatmentStats.total} totali</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Leaf size={14} className="text-green-600" />
                <span className="text-sm text-gray-700">Biologici</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{treatmentStats.organic}</span>
                <span className="text-xs text-green-600 font-semibold">{organicPercentage}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Beaker size={14} className="text-blue-600" />
                <span className="text-sm text-gray-700">Tradizionali</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{treatmentStats.conventional}</span>
                <span className="text-xs text-blue-600 font-semibold">{100 - organicPercentage}%</span>
              </div>
            </div>

            {treatmentStats.integrated > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-yellow-600" />
                  <span className="text-sm text-gray-700">Integrati</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{treatmentStats.integrated}</span>
              </div>
            )}
          </div>

          {/* Barra di progresso */}
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${organicPercentage}%` }}
            />
          </div>
        </div>

        {/* Statistiche Fertilizzanti */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Fertilizzazioni</h3>
            <span className="text-xs text-gray-500">{fertilizerStats.total} totali</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Leaf size={14} className="text-green-600" />
                <span className="text-sm text-gray-700">Organiche</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{fertilizerStats.organic}</span>
                <span className="text-xs text-green-600 font-semibold">{organicFertilizerPercentage}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Beaker size={14} className="text-blue-600" />
                <span className="text-sm text-gray-700">Minerali/Chimiche</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{fertilizerStats.mineral + fertilizerStats.chemical}</span>
                <span className="text-xs text-blue-600 font-semibold">{100 - organicFertilizerPercentage}%</span>
              </div>
            </div>

            {fertilizerStats.mixed > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-purple-600" />
                  <span className="text-sm text-gray-700">Miste</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{fertilizerStats.mixed}</span>
              </div>
            )}
          </div>

          {/* Barra di progresso */}
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${organicFertilizerPercentage}%` }}
            />
          </div>
        </div>

        {/* Alert per compliance */}
        {organicPercentage < 80 && treatmentStats.total > 5 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="text-yellow-600 mt-0.5">⚠️</div>
              <div className="text-xs text-yellow-800">
                <strong>Suggerimento:</strong> Per mantenere la certificazione biologica, considera di aumentare l'uso di prodotti ammessi in agricoltura biologica.
              </div>
            </div>
          </div>
        )}

        {organicPercentage >= 90 && treatmentStats.total > 5 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="text-green-600 mt-0.5">✅</div>
              <div className="text-xs text-green-800">
                <strong>Ottimo!</strong> Stai mantenendo un approccio prevalentemente biologico ({organicPercentage}% dei trattamenti).
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}