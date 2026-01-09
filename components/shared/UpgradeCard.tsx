'use client'

import React from 'react'
import Link from 'next/link'

interface UpgradeCardProps {
  feature: string
  description?: string
  benefits?: string[]
  variant?: 'banner' | 'modal' | 'inline'
  requiredTier?: 'PLUS' | 'PRO' | 'PRO_CONSUMER' | 'PRO_PROFESSIONAL' | string
}

export function UpgradeCard({
  feature,
  description,
  benefits,
  variant = 'inline',
  requiredTier = 'PRO'
}: UpgradeCardProps) {
  const tierName = requiredTier === 'PRO_PROFESSIONAL' || requiredTier === 'PRO'
    ? 'PRO' 
    : requiredTier === 'PRO_CONSUMER' || requiredTier === 'PLUS'
    ? 'PLUS'
    : 'PRO'
  
  const tierPrice = requiredTier === 'PRO_PROFESSIONAL' || requiredTier === 'PRO'
    ? '€29.99/mese' 
    : '€9.99/mese'
  
  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🔒</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {feature || 'Feature'} - {tierName} Feature
            </h3>
            {description && (
              <p className="text-gray-700 mb-4">{description}</p>
            )}
            {benefits && benefits.length > 0 && (
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                {benefits.map((benefit, idx) => (
                  <li key={idx}>{benefit || ''}</li>
                ))}
              </ul>
            )}
            <Link
              href="/pricing"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              Upgrade to {tierName} ({tierPrice})
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md mx-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            🔒 {feature}
          </h3>
          {description && (
            <p className="text-gray-700 mb-4">{description}</p>
          )}
          {benefits && benefits.length > 0 && (
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
              {benefits.map((benefit, idx) => (
                <li key={idx}>{benefit}</li>
              ))}
            </ul>
          )}
          <div className="flex gap-3">
            <Link
              href="/pricing"
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-center"
            >
              Upgrade to {tierName}
            </Link>
            <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Chiudi
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  // inline (default)
  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="text-2xl">🔒</div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">
            {feature || 'Feature'} - {tierName} Feature
          </h4>
          {description && (
            <p className="text-sm text-gray-700 mb-2">{description}</p>
          )}
          <Link
            href="/pricing"
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Upgrade to {tierName} →
          </Link>
        </div>
      </div>
    </div>
  )
}








