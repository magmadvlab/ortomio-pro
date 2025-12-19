'use client'

import React, { useState } from 'react'
import { Zap, Image, MessageSquare, X } from 'lucide-react'
import Link from 'next/link'

interface AIRequestModalProps {
  type: 'chat' | 'diagnose' | 'recipe'
  onConfirm: () => void
  onCancel: () => void
  credits?: { total: number; used: number }
}

const COST_MAP = {
  chat: { credits: 1, icon: MessageSquare, label: 'Chat AI' },
  diagnose: { credits: 3, icon: Image, label: 'Diagnosi Foto' },
  recipe: { credits: 1, icon: MessageSquare, label: 'Suggerimento Ricetta' }
}

export function AIRequestModal({ type, onConfirm, onCancel, credits }: AIRequestModalProps) {
  const { credits: cost, icon: Icon, label } = COST_MAP[type]
  const remaining = credits ? credits.total - credits.used : 0
  
  if (remaining < cost) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <div className="text-center space-y-4">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <Zap className="text-red-600" size={32} />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Credits insufficienti
              </h3>
              <p className="text-gray-600 mt-2">
                Hai solo {remaining} credits disponibili, ma questa richiesta costa {cost} credits.
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 text-left">
              <p className="font-medium text-blue-900 mb-2">Puoi:</p>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>✓ Aspettare il reset credits</li>
                <li>✓ Acquistare 50 credits extra per €4.99</li>
                <li>✓ Fare upgrade a PRO+ (200 credits/mese) per €19.99/mese</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Annulla
              </button>
              <Link
                href="/settings/credits"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center"
              >
                Compra Credits
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
              <Icon className="text-green-600" size={24} />
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">
                Conferma richiesta AI
              </h3>
              <p className="text-gray-600 mt-1">
                Questa richiesta <strong>"{label}"</strong> costerà:
              </p>
            </div>
            
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-yellow-900">
                Costo:
              </span>
              <div className="flex items-center gap-2">
                <Zap className="text-yellow-600" size={20} />
                <span className="text-2xl font-bold text-yellow-900">
                  {cost} credit{cost > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
          
          {credits && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
              Credits rimanenti dopo: <strong>{remaining - cost}</strong> / {credits.total}
            </div>
          )}
          
          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Annulla
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Conferma e procedi
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}














