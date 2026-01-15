'use client'

import React from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'

const pricingPlans = [
  {
    id: 'free',
    name: 'FREE',
    price: 0,
    period: 'forever',
    description: 'Per iniziare',
    features: [
      '1 orto',
      '50 task',
      '20 semi in inventario',
      'Wizard consigli pre-generati',
      '3 richieste AI gratis alla signup 🎁',
      'Meteo 7 giorni',
      'Support community',
    ],
    cta: 'Inizia Gratis',
    popular: false,
  },
  {
    id: 'pro-consumer',
    name: 'PRO Consumer',
    price: 9.99,
    period: 'mese',
    description: 'Per appassionati',
    features: [
      'Tutto di FREE +',
      'Orti illimitati',
      'Task illimitati',
      '50 AI credits/mese 🤖',
      '1 credit = chat/ricetta',
      '3 credits = diagnosi foto',
      'Credits accumulabili (max 200)',
      'Lifecycle + Nutrient + Health Coach',
      'Fragole Basilicata + Frutta esotica',
      'Time-lapse foto',
      'Meteo 15 giorni',
      'Analytics base',
      '🍳 Ricette AI',
      '📚 Guide approfondite',
      'Support prioritario',
    ],
    cta: 'Inizia PRO Consumer',
    popular: true,
  },
  {
    id: 'pro-professional',
    name: 'PRO Professional',
    price: 29.99,
    period: 'mese',
    description: 'Per professionisti',
    features: [
      'Tutto di PRO Consumer +',
      '200 AI credits/mese 🚀',
      'Credits accumulabili (max 500)',
      '📊 Analytics avanzate (ROI, resa)',
      '📋 Registro trattamenti',
      '🧮 Calcolatore NPK preciso',
      '📈 Export CSV/PDF',
      '🔄 Rotazione colturale multi-anno',
      '❌ NO ricette (per professionisti)',
      'Early access nuove feature',
      'Support dedicato 1-to-1',
    ],
    cta: 'Inizia PRO Professional',
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Scegli il Piano Perfetto per Te
          </h1>
          <p className="text-xl text-gray-600">
            Dalla passione all'orto professionale
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-lg p-8 ${
                plan.popular ? 'ring-2 ring-green-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4">
                  PIÙ POPOLARE
                </div>
              )}
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h2>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  €{plan.price}
                </span>
                {plan.price > 0 && (
                  <span className="text-gray-600">/{plan.period}</span>
                )}
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link
                href={`/checkout?tier=${plan.id}`}
                className={`block w-full text-center px-6 py-3 rounded-lg font-semibold ${
                  plan.popular
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}






















