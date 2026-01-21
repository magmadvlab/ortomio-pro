// ============================================
// ESEMPIO INTEGRAZIONE SISTEMA GUIDE IN-APP
// ============================================

// 1. LAYOUT PRINCIPALE CON ONBOARDING E HELP PANEL
// File: app/app/layout.tsx

'use client';

import { useOnboarding } from '@/hooks/useOnboarding';
import OnboardingTour from '@/components/help/OnboardingTour';
import HelpPanel from '@/components/help/HelpPanel';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { showTour, tourSteps, completeTour, skipTour } = useOnboarding();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      {children}

      {/* Onboarding Tour (solo per nuovi utenti) */}
      {showTour && (
        <OnboardingTour
          steps={tourSteps}
          onComplete={completeTour}
          onSkip={skipTour}
        />
      )}

      {/* Help Panel (sempre disponibile) */}
      <HelpPanel />
    </div>
  );
}

// ============================================
// 2. COMPONENTE CON TOOLTIP CONTESTUALI
// File: components/dashboard/PredictionsWidget.tsx

import ContextualTooltip from '@/components/help/ContextualTooltip';

export default function PredictionsWidget() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header con Tooltip */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Predizioni AI</h3>
          <ContextualTooltip
            title="Come Funzionano le Predizioni"
            content="L'intelligenza artificiale analizza meteo, stagione e condizioni specifiche del tuo orto per fornire consigli personalizzati in tempo reale."
            manualLink="/docs/manual/01-ai-predictions.md"
            position="right"
            size="md"
          />
        </div>
        <button className="text-blue-600 hover:text-blue-700">
          Aggiorna
        </button>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Predictions list */}
      </div>
    </div>
  );
}

// ============================================
// 3. PAGINA CON HELP CONTESTUALE
// File: app/app/certifications/page.tsx

'use client';

import { useEffect } from 'react';
import { guidesService } from '@/services/guidesService';
import HelpPanel from '@/components/help/HelpPanel';

export default function CertificationsPage() {
  // Get contextual help resources
  const helpResources = guidesService.getContextualHelp('certifications');

  return (
    <div className="container mx-auto p-6">
      <h1>Certificazioni</h1>
      
      {/* Content */}
      <div>
        {/* Certifications content */}
      </div>

      {/* Help Panel con risorse contestuali */}
      <HelpPanel 
        contextId="certifications"
        resources={helpResources}
      />
    </div>
  );
}

// ============================================
// 4. AGGIUNGERE DATA-TOUR ATTRIBUTES
// File: components/shared/Sidebar.tsx

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r">
      <nav className="p-4 space-y-2">
        {/* Dashboard */}
        <Link 
          href="/app" 
          data-tour="dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <Home className="w-5 h-5" />
          Dashboard
        </Link>

        {/* AI Predictions */}
        <Link 
          href="/app/predictions" 
          data-tour="ai-predictions"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <Brain className="w-5 h-5" />
          Predizioni AI
        </Link>

        {/* Planner */}
        <Link 
          href="/app/planner" 
          data-tour="planner"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <Calendar className="w-5 h-5" />
          Planner
        </Link>

        {/* Health */}
        <Link 
          href="/app/health" 
          data-tour="health"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <Heart className="w-5 h-5" />
          Salute
        </Link>

        {/* Certifications */}
        <Link 
          href="/app/certifications" 
          data-tour="certifications"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <Award className="w-5 h-5" />
          Certificazioni
        </Link>

        {/* Smart Hub */}
        <Link 
          href="/app/smart" 
          data-tour="smart-hub"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <Cpu className="w-5 h-5" />
          Smart Hub
        </Link>
      </nav>
    </aside>
  );
}

// ============================================
// 5. GARDEN SELECTOR CON TOUR
// File: components/shared/LocationSelector.tsx

export default function LocationSelector() {
  return (
    <div 
      data-tour="garden-selector"
      className="flex items-center gap-2"
    >
      <select className="px-3 py-2 border rounded-lg">
        <option>Orto di Casa</option>
        <option>Orto Montagna</option>
      </select>
      
      <ContextualTooltip
        title="Selettore Orto"
        content="Gestisci più orti contemporaneamente. Passa da uno all'altro con un click per vedere dati e operazioni specifiche."
        manualLink="/docs/manual/29-interface-navigation.md"
        position="bottom"
      />
    </div>
  );
}

// ============================================
// 6. RESTART TOUR BUTTON (per testing)
// File: components/settings/DeveloperSettings.tsx

import { guidesService } from '@/services/guidesService';

export default function DeveloperSettings() {
  const handleRestartTour = () => {
    guidesService.resetOnboarding();
    window.location.reload();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Impostazioni Sviluppatore</h3>
      
      <button
        onClick={handleRestartTour}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Riavvia Tour Onboarding
      </button>
    </div>
  );
}

// ============================================
// 7. SEARCH HELP RESOURCES
// File: components/help/HelpSearch.tsx

import { useState } from 'react';
import { guidesService } from '@/services/guidesService';

export default function HelpSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.length > 2) {
      const searchResults = guidesService.searchResources(value);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Cerca aiuto..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg"
      />

      {results.length > 0 && (
        <div className="mt-2 space-y-2">
          {results.map((result) => (
            <a
              key={result.id}
              href={result.link}
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <h4 className="font-medium">{result.title}</h4>
              <p className="text-sm text-gray-600">{result.description}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// 8. MOST VIEWED RESOURCES WIDGET
// File: components/help/PopularHelpWidget.tsx

import { useEffect, useState } from 'react';
import { guidesService } from '@/services/guidesService';

export default function PopularHelpWidget() {
  const [popularResources, setPopularResources] = useState([]);

  useEffect(() => {
    const resources = guidesService.getMostViewedResources(3);
    setPopularResources(resources);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold mb-3">Guide Popolari</h3>
      <div className="space-y-2">
        {popularResources.map((resource) => (
          <a
            key={resource.id}
            href={resource.link}
            onClick={() => guidesService.trackResourceView(resource.id)}
            className="block text-sm text-blue-600 hover:text-blue-700"
          >
            {resource.title}
          </a>
        ))}
      </div>
    </div>
  );
}
