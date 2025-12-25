'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'

interface ProgressTrackerProps {
  title: string
  progress: number // 0-100
  current: number
  target: number
  unit?: string
}

export function ProgressTracker({
  title,
  progress,
  current,
  target,
  unit = '',
}: ProgressTrackerProps) {
  return (
    <Card variant="default" className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <span className="text-sm text-gray-600">
          {current} / {target} {unit}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-ortomio-green-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        {progress >= 100 ? 'Completato!' : `${Math.round(progress)}% completato`}
      </p>
    </Card>
  )
}

