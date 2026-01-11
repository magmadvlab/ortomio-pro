import React, { useState } from 'react';
import { useTier } from '../packages/core/hooks/useTier';
import { Sparkles, Check, X, ArrowRight, Zap, Shield, TrendingUp, Camera, Map, Calendar, Package } from 'lucide-react';

interface OnboardingTierProps {
  onComplete: () => void;
  onUpgrade?: () => void;
}

const OnboardingTier: React.FC<OnboardingTierProps> = ({ onComplete, onUpgrade }) => {
  const { tier, isPro, config } = useTier();

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

  // Versione semplificata single-page
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          🌱 Benvenuto in OrtoMio
        </h1>
        <p className="text-gray-600">
          Scegli la versione più adatta alle tue esigenze
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Free */}
        <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
          <h3 className="font-bold text-lg text-gray-900 mb-1">Free</h3>
          <p className="text-xl md:text-2xl font-bold text-gray-600 mb-2">0€</p>
          <ul className="space-y-1.5 text-sm">
            {freeFeatures.slice(0, 3).map((feat, idx) => (
              <li key={idx} className="flex items-center gap-3 text-gray-700">
                <Check size={14} className="text-green-600 flex-shrink-0" />
                <span>{feat.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pro */}
        <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-300 relative">
          <span className="absolute top-3 right-2 px-2 py-0.5 bg-purple-600 text-white rounded text-xs font-bold">
            CONSIGLIATO
          </span>
          <h3 className="font-bold text-lg text-gray-900 mb-1">Pro</h3>
          <p className="text-xl md:text-2xl font-bold text-purple-600 mb-2">9.99€/mese</p>
          <ul className="space-y-1.5 text-sm">
            {proFeatures.slice(0, 3).map((feat, idx) => (
              <li key={idx} className="flex items-center gap-3 text-gray-700">
                <Sparkles size={14} className="text-purple-600 flex-shrink-0" />
                <span>{feat.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onComplete}
          className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Continua con Free
        </button>
        {onUpgrade && (
          <button
            onClick={() => {
              onUpgrade();
              onComplete();
            }}
            className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-3"
          >
            <Sparkles size={16} />
            Passa a Pro
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingTier;

