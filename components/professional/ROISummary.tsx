'use client'

import React from 'react'

interface ROISummaryData {
  totalRevenue?: number
  totalCosts?: number
  roiPercentage?: number
  totalYield?: number
  previousMonth?: {
    revenue: number
    costs: number
    roi: number
  }
}

interface ROISummaryProps {
  data?: ROISummaryData
}

export function ROISummary({ data }: ROISummaryProps) {
  const revenue = data?.totalRevenue || 0
  const costs = data?.totalCosts || 0
  const roi = data?.roiPercentage || 0
  const yield_ = data?.totalYield || 0
  
  const revenueChange = data?.previousMonth
    ? ((revenue - data.previousMonth.revenue) / data.previousMonth.revenue) * 100
    : 0
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">ROI Summary</h2>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Totale Revenue</p>
          <p className="text-2xl font-bold text-gray-900">€{revenue.toFixed(2)}</p>
          {data?.previousMonth && (
            <p className={`text-xs mt-1 ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}% vs mese precedente
            </p>
          )}
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Totale Costi</p>
          <p className="text-2xl font-bold text-gray-900">€{costs.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">ROI %</p>
          <p className={`text-2xl font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {roi.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Resa Totale</p>
          <p className="text-2xl font-bold text-gray-900">{yield_.toFixed(2)} kg</p>
        </div>
      </div>
    </div>
  )
}







