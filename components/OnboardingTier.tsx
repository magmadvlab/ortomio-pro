import React, { useState } from 'react';
import { useTier } from '../packages/core/hooks/useTier';
import { Sparkles, Check, X, ArrowRight, Zap, Shield, TrendingUp, Camera, Map, Calendar, Package } from 'lucide-react';

interface OnboardingTierProps {
  onComplete: () => void;
  onUpgrade?: () => void;
}

const OnboardingTier: React.FC<OnboardingTierProps> = ({ onComplete, onUpgrade }) => {
  const { tier, isPro, config } = useTier();
  const [currentStep, setCurrentStep] = useState(0);

  const freeFeatures = [
    { icon: Calendar, text: 'Pianificazione Base', available: true },
    { icon: Package, text: 'Inventario Semi (max 20)', available: true },
    { icon: Calendar, text: 'Diario Attività (max 50 task)', available: true },
    { icon: Calendar, text: '1 Giardino', available: true },
    { icon: Calendar, text: 'Calendario Lunare', available: true },
  ];

  const proFeatures = [
    { icon: Map, text: 'Visual Garden Planner', available: true },
    { icon: Camera, text: 'Time-Lapse Foto', available: true },
    { icon: TrendingUp, text: 'Analisi Resa Economica', available: true },
    { icon: Shield, text: 'Meteo Avanzato', available: true },
    { icon: Camera, text: 'Diagnosi Malattie AI', available: true },
    { icon: Calendar, text: 'Pianificazione Annuale', available: true },
    { icon: Package, text: 'Gestione Semenzai Avanzata', available: true },
    { icon: Calendar, text: 'Colture Specializzate', available: true },
    { icon: Zap, text: 'Giardini Illimitati', available: true },
    { icon: Zap, text: 'Task Illimitati', available: true },
  ];

  const steps = [
    {
      title: 'Benvenuto in OrtoMio AI',
      content: 'Scegli la versione più adatta alle tue esigenze',
    },
    {
      title: 'Confronto Free vs Pro',
      content: 'Scopri tutte le funzionalità disponibili',
    },
  ];

  if (currentStep === 0) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-green-400 to-emerald-600 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 animate-in zoom-in-95">
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
              🌱 Benvenuto in OrtoMio AI
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Il tuo assistente agronomico personale
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
              <h3 className="font-bold text-lg text-gray-800 mb-2">Versione Free</h3>
              <p className="text-sm text-gray-600 mb-3">Perfetta per iniziare</p>
              <ul className="space-y-2">
                {freeFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-green-600 flex-shrink-0" />
                    <span>{feat.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-800">Versione Pro</h3>
                <span className="px-2 py-1 bg-purple-600 text-white rounded-full text-xs font-bold">
                  CONSIGLIATO
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Per professionisti e appassionati</p>
              <ul className="space-y-2">
                {proFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <Sparkles size={16} className="text-purple-600 flex-shrink-0" />
                    <span>{feat.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onComplete}
              className="flex-1 py-3 min-h-[44px] bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all duration-200 text-sm sm:text-base"
            >
              Continua con Free
            </button>
            {onUpgrade && (
              <button
                onClick={() => {
                  onUpgrade();
                  onComplete();
                }}
                className="flex-1 py-3 min-h-[44px] bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Sparkles size={18} />
                Passa a Pro
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-in zoom-in-95">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Confronto Dettagliato
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Free Column */}
          <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border-2 border-gray-200">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 mb-1">Free</h3>
              <p className="text-3xl font-bold text-gray-600">0€</p>
              <p className="text-sm text-gray-500">per sempre</p>
            </div>
            <ul className="space-y-2">
              {freeFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feat.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Column */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 sm:p-6 rounded-xl border-2 border-purple-300 relative">
            <div className="absolute top-2 right-2">
              <span className="px-2 py-1 bg-purple-600 text-white rounded-full text-xs font-bold">
                POPOLARE
              </span>
            </div>
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 mb-1">Pro</h3>
              <p className="text-3xl font-bold text-purple-600">9.99€</p>
              <p className="text-sm text-gray-500">al mese</p>
            </div>
            <ul className="space-y-2">
              {proFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <Sparkles size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">{feat.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onComplete}
            className="flex-1 py-3 min-h-[44px] bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all duration-200 text-sm sm:text-base"
          >
            Continua con Free
          </button>
          {onUpgrade && (
            <button
              onClick={() => {
                onUpgrade();
                onComplete();
              }}
              className="flex-1 py-3 min-h-[44px] bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Sparkles size={18} />
              Passa a Pro Ora
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingTier;

