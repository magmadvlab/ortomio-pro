'use client'

import React, { useState, useEffect } from 'react'
import { TrendingUp, Target, Plus, BarChart3, Award, AlertCircle } from 'lucide-react'
import { getSupabaseClient } from '@/config/supabase'

interface YieldPerTreeTrackerProps {
  orchardId: string
  orchardName?: string
}

interface TreeYieldData {
  tree_id: string
  tree_code: string
  location: string
  total_yield_kg: number
  harvest_count: number
  average_yield_kg: number
  performance: 'top' | 'good' | 'average' | 'below-average' | 'poor'
}

export default function YieldPerTreeTracker({ orchardId, orchardName }: YieldPerTreeTrackerProps) {
  const [yieldData, setYieldData] = useState<TreeYieldData[]>([])
  const [stats, setStats] = useState({
    totalTrees: 0,
    averageYield: 0,
    topPerformers: 0,
    poorPerformers: 0,
    totalYield: 0
  })
  const [selectedSeason, setSelectedSeason] = useState<string>(new Date().getFullYear().toString())

  useEffect(() => {
    loadYieldData()
  }, [orchardId, selectedSeason])

  const loadYieldData = async () => {
    try {
      const supabase = getSupabaseClient()
      
      // Get all trees in orchard
      const { data: trees, error: treesError } = await supabase
        .from('orchard_trees')
        .select('id, tree_code, location, zone_id, field_row_id')
        .eq('orchard_id', orchardId)
        .eq('is_active', true)

      if (treesError) throw treesError

      // Get harvests for selected season
      const seasonStart = `${selectedSeason}-01-01`
      const seasonEnd = `${selectedSeason}-12-31`

      const { data: harvests, error: harvestsError } = await supabase
        .from('harvests')
        .select('tree_id, quantity_kg')
        .eq('garden_id', orchardId)
        .gte('harvest_date', seasonStart)
        .lte('harvest_date', seasonEnd)

      if (harvestsError) throw harvestsError

      // Calculate yield per tree
      const yieldByTree = new Map<string, { total: number, count: number }>()
      
      harvests?.forEach(h => {
        if (h.tree_id) {
          const current = yieldByTree.get(h.tree_id) || { total: 0, count: 0 }
          yieldByTree.set(h.tree_id, {
            total: current.total + (h.quantity_kg || 0),
            count: current.count + 1
          })
        }
      })

      // Build tree yield data
      const treeYields: TreeYieldData[] = trees?.map(tree => {
        const yield_info = yieldByTree.get(tree.id) || { total: 0, count: 0 }
        const average = yield_info.count > 0 ? yield_info.total / yield_info.count : 0
        
        return {
          tree_id: tree.id,
          tree_code: tree.tree_code || `Albero ${tree.id.slice(0, 8)}`,
          location: tree.location || tree.zone_id || 'N/D',
          total_yield_kg: yield_info.total,
          harvest_count: yield_info.count,
          average_yield_kg: average,
          performance: 'average' // Will be calculated below
        }
      }) || []

      // Calculate overall average
      const totalYield = treeYields.reduce((sum, t) => sum + t.total_yield_kg, 0)
      const treesWithYield = treeYields.filter(t => t.total_yield_kg > 0)
      const overallAverage = treesWithYield.length > 0 
        ? totalYield / treesWithYield.length 
        : 0

      // Classify performance
      treeYields.forEach(tree => {
        if (tree.total_yield_kg === 0) {
          tree.performance = 'poor'
        } else if (tree.total_yield_kg >= overallAverage * 1.3) {
          tree.performance = 'top'
        } else if (tree.total_yield_kg >= overallAverage * 1.1) {
          tree.performance = 'good'
        } else if (tree.total_yield_kg >= overallAverage * 0.7) {
          tree.performance = 'average'
        } else if (tree.total_yield_kg >= overallAverage * 0.5) {
          tree.performance = 'below-average'
        } else {
          tree.performance = 'poor'
        }
      })

      // Sort by yield descending
      treeYields.sort((a, b) => b.total_yield_kg - a.total_yield_kg)

      setYieldData(treeYields)

      // Calculate stats
      setStats({
        totalTrees: trees?.length || 0,
        averageYield: overallAverage,
        topPerformers: treeYields.filter(t => t.performance === 'top').length,
        poorPerformers: treeYields.filter(t => t.performance === 'poor').length,
        totalYield
      })

    } catch (error) {
      console.error('Error loading yield data:', error)
    }
  }

  const getPerformanceBadge = (performance: TreeYieldData['performance']) => {
    switch (performance) {
      case 'top':
        return { label: 'Top', color: 'bg-green-100 text-green-800', icon: '🏆' }
      case 'good':
        return { label: 'Buono', color: 'bg-blue-100 text-blue-800', icon: '✅' }
      case 'average':
        return { label: 'Medio', color: 'bg-gray-100 text-gray-800', icon: '➖' }
      case 'below-average':
        return { label: 'Sotto Media', color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' }
      case 'poor':
        return { label: 'Scarso', color: 'bg-red-100 text-red-800', icon: '❌' }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Target className="text-orange-600" size={20} />
            Resa per Pianta
          </h3>
          {orchardName && (
            <p className="text-sm text-gray-600">{orchardName}</p>
          )}
        </div>
        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value={new Date().getFullYear().toString()}>{new Date().getFullYear()}</option>
          <option value={(new Date().getFullYear() - 1).toString()}>{new Date().getFullYear() - 1}</option>
          <option value={(new Date().getFullYear() - 2).toString()}>{new Date().getFullYear() - 2}</option>
        </select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="text-gray-600" size={16} />
            <span className="text-sm font-medium text-gray-700">Alberi Totali</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalTrees}</div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-blue-600" size={16} />
            <span className="text-sm font-medium text-gray-700">Media Resa</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.averageYield.toFixed(1)} kg</div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Award className="text-green-600" size={16} />
            <span className="text-sm font-medium text-gray-700">Top Performer</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.topPerformers}</div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="text-red-600" size={16} />
            <span className="text-sm font-medium text-gray-700">Scarsi</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.poorPerformers}</div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-purple-600" size={16} />
            <span className="text-sm font-medium text-gray-700">Totale</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.totalYield.toFixed(0)} kg</div>
        </div>
      </div>

      {/* Top Performers */}
      {yieldData.filter(t => t.performance === 'top').length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <Award className="text-green-600" size={18} />
            Top Performers (&gt;{(stats.averageYield * 1.3).toFixed(1)} kg)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {yieldData.filter(t => t.performance === 'top').slice(0, 8).map(tree => (
              <div key={tree.tree_id} className="bg-white rounded-lg p-3 border border-green-300">
                <p className="text-sm font-medium text-gray-900">{tree.tree_code}</p>
                <p className="text-xs text-gray-600">{tree.location}</p>
                <p className="text-lg font-bold text-green-600 mt-1">{tree.total_yield_kg.toFixed(1)} kg</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Poor Performers Alert */}
      {yieldData.filter(t => t.performance === 'poor').length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
            <AlertCircle className="text-red-600" size={18} />
            Alberi con Resa Scarsa - Richiedono Attenzione
          </h4>
          <p className="text-sm text-red-700 mb-3">
            {stats.poorPerformers} alberi con resa molto bassa. Verificare salute, potatura, irrigazione.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {yieldData.filter(t => t.performance === 'poor').slice(0, 8).map(tree => (
              <div key={tree.tree_id} className="bg-white rounded-lg p-3 border border-red-300">
                <p className="text-sm font-medium text-gray-900">{tree.tree_code}</p>
                <p className="text-xs text-gray-600">{tree.location}</p>
                <p className="text-lg font-bold text-red-600 mt-1">
                  {tree.total_yield_kg === 0 ? 'Nessuna' : `${tree.total_yield_kg.toFixed(1)} kg`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Trees Table */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">Tutti gli Alberi - Stagione {selectedSeason}</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Posizione</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Codice</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Zona</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Resa Totale</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">N. Raccolte</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Media/Raccolta</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {yieldData.slice(0, 50).map((tree, index) => {
                const badge = getPerformanceBadge(tree.performance)
                return (
                  <tr key={tree.tree_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">#{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{tree.tree_code}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{tree.location}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                      {tree.total_yield_kg.toFixed(1)} kg
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">{tree.harvest_count}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {tree.average_yield_kg.toFixed(1)} kg
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                        {badge.icon} {badge.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {yieldData.length > 50 && (
          <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-600">
            Mostrati primi 50 alberi. Totale: {yieldData.length}
          </div>
        )}
      </div>

      {/* No Data State */}
      {yieldData.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <Target size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium mb-2">Nessun dato disponibile</p>
          <p className="text-sm text-gray-500">
            Registra raccolti per albero per vedere le statistiche di resa
          </p>
        </div>
      )}
    </div>
  )
}
