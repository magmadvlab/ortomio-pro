'use client'

import { useState } from 'react'
import { BookOpen, Search, ChevronRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const helpSections = [
    {
      title: 'Guida Rapida',
      description: 'Inizia subito con OrtoMio',
      items: [
        { title: 'Primi Passi', href: '/docs/manual/27-quick-start' },
        { title: 'Navigazione Interfaccia', href: '/docs/manual/29-interface-navigation' },
        { title: 'Casi d\'Uso Pratici', href: '/docs/manual/30-use-cases' },
      ]
    },
    {
      title: 'Funzionalità AI',
      description: 'Intelligenza artificiale per il tuo orto',
      items: [
        { title: 'Predizioni AI', href: '/docs/manual/01-ai-predictions' },
        { title: 'Planner AI Chat', href: '/docs/manual/09-planner-ai-chat' },
        { title: 'Chat AI Globale', href: '/docs/manual/08-global-ai-chat' },
      ]
    },
    {
      title: 'Monitoraggio Avanzato',
      description: 'Tecnologie di precisione',
      items: [
        { title: 'Operazioni Drone', href: '/docs/manual/02-drone-operations' },
        { title: 'NDVI Satellitare', href: '/docs/manual/05-ndvi-satellite' },
        { title: 'Prescription Maps', href: '/docs/manual/06-prescription-maps' },
        { title: 'Smart Hub', href: '/docs/manual/14-smart-hub' },
      ]
    },
    {
      title: 'Gestione Professionale',
      description: 'Strumenti per professionisti',
      items: [
        { title: 'Certificazioni', href: '/docs/manual/04-certifications' },
        { title: 'Tracciabilità', href: '/docs/manual/03-traceability' },
        { title: 'Sistema Irrigazione', href: '/docs/manual/15-irrigation-system' },
        { title: 'Nutrizione e Trattamenti', href: '/docs/manual/16-nutrition-treatments' },
        { title: 'Lavorazioni Meccaniche', href: '/docs/manual/17-mechanical-operations' },
      ]
    },
    {
      title: 'Colture Specializzate',
      description: 'Gestione colture specifiche',
      items: [
        { title: 'Gestione Frutteto', href: '/docs/manual/18-orchard-management' },
        { title: 'Gestione Oliveto', href: '/docs/manual/19-olive-management' },
        { title: 'Gestione Vigneto', href: '/docs/manual/20-vineyard-management' },
        { title: 'Piante Individuali', href: '/docs/manual/21-individual-plants' },
      ]
    },
    {
      title: 'Analytics e Business',
      description: 'Analisi e ottimizzazione',
      items: [
        { title: 'Business Intelligence', href: '/docs/manual/22-business-intelligence' },
        { title: 'Sistema Export', href: '/docs/manual/23-export-system' },
        { title: 'Benefici Economici', href: '/docs/manual/28-economic-benefits' },
      ]
    },
    {
      title: 'Gamification e Social',
      description: 'Sfide e condivisione',
      items: [
        { title: 'Sfide e Gamification', href: '/docs/manual/07-challenges-gamification' },
        { title: 'Sistema Badge', href: '/docs/manual/13-badge-system' },
        { title: 'Condivisione Social', href: '/docs/manual/12-social-sharing' },
      ]
    },
    {
      title: 'Supporto e Risorse',
      description: 'Aiuto e contatti',
      items: [
        { title: 'Contatti Supporto', href: '/docs/manual/33-support-contacts' },
        { title: 'Roadmap Sviluppo', href: '/docs/manual/32-roadmap' },
        { title: 'Storie di Successo', href: '/docs/manual/31-success-stories' },
      ]
    }
  ]

  const filteredSections = helpSections.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.items.length > 0)

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
          <BookOpen className="text-blue-600" size={24} />
          Manuale Utente
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Guida completa alle funzionalità di OrtoMio</p>
      </div>

      {/* Barra di Ricerca */}
      <div className="mb-6 sm:mb-8">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cerca nella documentazione..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Sezioni Aiuto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredSections.map((section, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">{section.title}</h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">{section.description}</p>

            <div className="space-y-1 sm:space-y-2">
              {section.items.map((item, itemIndex) => (
                <Link
                  key={itemIndex}
                  href={item.href}
                  className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors group"
                >
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{item.title}</span>
                  <ChevronRight className="text-gray-400 group-hover:text-gray-600 flex-shrink-0" size={16} />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Link Esterni */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Risorse Aggiuntive</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="#"
            className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ExternalLink className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Video Tutorial</h3>
              <p className="text-sm text-gray-600">Guide video passo-passo</p>
            </div>
          </a>
          
          <a
            href="#"
            className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ExternalLink className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Community Forum</h3>
              <p className="text-sm text-gray-600">Discuti con altri utenti</p>
            </div>
          </a>
        </div>
      </div>

      {/* Contatti Supporto */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4">Non trovi quello che cerchi?</p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Contatta il Supporto
        </button>
      </div>

      {/* Credits */}
      <div className="mt-12 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-500">
          Sviluppato da <span className="font-medium text-gray-700">Roberto Lalinga</span>
        </p>
        <a
          href="mailto:roberto.lalinga@gmail.com"
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          roberto.lalinga@gmail.com
        </a>
      </div>
    </div>
  )
}