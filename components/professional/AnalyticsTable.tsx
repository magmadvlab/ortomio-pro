'use client'

import React, { useState } from 'react'

interface AnalyticsData {
  crop: string
  kg: number
  revenue: number
  costs: number
  roi: number
  yieldPerSqm: number
}

interface AnalyticsTableProps {
  data?: AnalyticsData[]
}

export function AnalyticsTable({ data = [] }: AnalyticsTableProps) {
  const [sortBy, setSortBy] = useState<keyof AnalyticsData>('crop')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortBy]
    const bVal = b[sortBy]
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1
    }
    return aVal < bVal ? 1 : -1
  })
  
  const handleSort = (column: keyof AnalyticsData) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
        <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">
          Export CSV
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th
                className="text-left p-2 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('crop')}
              >
                Coltura {sortBy === 'crop' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="text-left p-2 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('kg')}
              >
                Kg {sortBy === 'kg' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="text-left p-2 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('revenue')}
              >
                Revenue {sortBy === 'revenue' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="text-left p-2 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('costs')}
              >
                Costi {sortBy === 'costs' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="text-left p-2 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('roi')}
              >
                ROI % {sortBy === 'roi' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="text-left p-2 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('yieldPerSqm')}
              >
                Resa/m² {sortBy === 'yieldPerSqm' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  Nessun dato disponibile
                </td>
              </tr>
            ) : (
              sortedData.map((row, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-2 text-sm text-gray-900">{row.crop}</td>
                  <td className="p-2 text-sm text-gray-700">{row.kg.toFixed(2)}</td>
                  <td className="p-2 text-sm text-gray-700">€{row.revenue.toFixed(2)}</td>
                  <td className="p-2 text-sm text-gray-700">€{row.costs.toFixed(2)}</td>
                  <td className={`p-2 text-sm font-medium ${row.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {row.roi.toFixed(1)}%
                  </td>
                  <td className="p-2 text-sm text-gray-700">{row.yieldPerSqm.toFixed(2)} kg/m²</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}














