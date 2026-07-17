'use client';

import React, { useState } from 'react';
import { HelpCircle, X, Book, MessageCircle, ExternalLink, Search } from 'lucide-react';

interface HelpResource {
  id: string;
  title: string;
  description: string;
  type: 'manual' | 'video' | 'guide';
  link: string;
  category: string;
}

interface HelpPanelProps {
  contextId?: string; // ID della pagina/sezione corrente
  resources?: HelpResource[];
}

export default function HelpPanel({ contextId, resources = [] }: HelpPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Default resources se non fornite
  const defaultResources: HelpResource[] = [
    {
      id: 'quick-start',
      title: 'Guida Rapida',
      description: 'Inizia in 5 minuti con OrtoMio',
      type: 'manual',
      link: '/docs/manual/27-quick-start',
      category: 'Primi Passi'
    },
    {
      id: 'support',
      title: 'Contatta il Supporto',
      description: 'Assistenza diretta dal team',
      type: 'guide',
      link: '/docs/manual/33-support-contacts',
      category: 'Supporto'
    }
  ];

  const allResources = resources.length > 0 ? resources : defaultResources;

  const filteredResources = allResources.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'manual':
        return <Book className="w-5 h-5" />;
      case 'guide':
        return <MessageCircle className="w-5 h-5" />;
      default:
        return <HelpCircle className="w-5 h-5" />;
    }
  };

  return (
    <>
      {/* Floating Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
        aria-label="Apri pannello aiuto"
      >
        <HelpCircle className="w-6 h-6" />
        <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Serve aiuto?
        </span>
      </button>

      {/* Help Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Centro Assistenza
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Guide, tutorial e supporto
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cerca aiuto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Resources List */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredResources.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    Nessuna risorsa trovata
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredResources.map((resource) => (
                    <a
                      key={resource.id}
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-blue-600 mt-0.5">
                          {getIcon(resource.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {resource.title}
                            </h3>
                            <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-xs text-gray-600 mb-2">
                            {resource.description}
                          </p>
                          <span className="inline-block text-xs text-blue-600 font-medium">
                            {resource.category}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Non trovi quello che cerchi?
                </p>
                <a
                  href="mailto:support@ortomio.com"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contatta il Supporto
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
