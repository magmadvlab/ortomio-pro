'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { useTier } from '@/packages/core/hooks/useTier'
import { ProFeatureGate } from '@/components/shared/ProFeatureGate'

export default function NutritionPage() {
  return (
    <ProFeatureGate feature="Nutrizione & Trattamenti" requiredTier="PRO">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">Nutrizione & Trattamenti</h1>
        <p className="text-sm text-gray-600 mt-1">
          Sistema temporaneamente in manutenzione per correzioni sintassi.
        </p>
      </div>
    </ProFeatureGate>
  )
}