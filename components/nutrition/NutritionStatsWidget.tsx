'use client'

import React from 'react'
import { BarChart3, TrendingUp, Leaf, Beaker } from 'lucide-react'
import type { FertilizerInventoryItemDB, TreatmentRecordDB } from '@/types'
import { calculateNutritionEvidenceStats } from '@/lib/nutrition/nutritionStats'

interface NutritionStatsProps {
  treatments: TreatmentRecordDB[] | null
  fertilizers: FertilizerInventoryItemDB[] | null
  loading?: boolean
}

export function NutritionStatsWidget({ treatments, fertilizers, loading = false }: NutritionStatsProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6" aria-busy="true">
        <div className="h-5 w-52 bg-gray-200 rounded animate-pulse mb-5" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!treatments || !fertilizers) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={18} className="text-purple-700" />
          <h2 className="text-lg font-bold text-gray-900">Statistiche Bio/Tradizionale</h2>
        </div>
        <p className="text-sm text-gray-600">
          Dati non disponibili: impossibile leggere registri trattamenti e inventario fertilizzanti.
        </p>
      </div>
    )
  }

  const stats = calculateNutritionEvidenceStats(treatments, fertilizers)
  const treatmentStats = stats.treatments
  const fertilizerStats = stats.fertilizers
  const organicPercentage = treatmentStats.organicPercentage
  const organicFertilizerPercentage = fertilizerStats.organicPercentage

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
                <span className="text-xs text-green-600 font-semibold">
                  {organicPercentage == null ? 'n/d' : `${organicPercentage}%`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Beaker size={14} className="text-blue-600" />
                <span className="text-sm text-gray-700">Tradizionali</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{treatmentStats.conventional}</span>
                <span className="text-xs text-blue-600 font-semibold">
                  {organicPercentage == null ? 'n/d' : `${100 - organicPercentage}%`}
                </span>
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
              style={{ width: `${organicPercentage || 0}%` }}
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
                <span className="text-xs text-green-600 font-semibold">
                  {organicFertilizerPercentage == null ? 'n/d' : `${organicFertilizerPercentage}%`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Beaker size={14} className="text-blue-600" />
                <span className="text-sm text-gray-700">Non organiche</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {fertilizerStats.mineral + fertilizerStats.corrective + fertilizerStats.microelement}
                </span>
                <span className="text-xs text-blue-600 font-semibold">
                  {organicFertilizerPercentage == null ? 'n/d' : `${100 - organicFertilizerPercentage}%`}
                </span>
              </div>
            </div>

            {fertilizerStats.microelement > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-purple-600" />
                  <span className="text-sm text-gray-700">Microelementi</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{fertilizerStats.microelement}</span>
              </div>
            )}
          </div>

          {/* Barra di progresso */}
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${organicFertilizerPercentage || 0}%` }}
            />
          </div>
        </div>

        {/* Alert per compliance */}
        {organicPercentage != null && organicPercentage < 80 && treatmentStats.total > 5 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="text-yellow-600 mt-0.5">⚠️</div>
              <div className="text-xs text-yellow-800">
                <strong>Suggerimento:</strong> Per mantenere la certificazione biologica, considera di aumentare l'uso di prodotti ammessi in agricoltura biologica.
              </div>
            </div>
          </div>
        )}

        {organicPercentage != null && organicPercentage >= 90 && treatmentStats.total > 5 && (
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
