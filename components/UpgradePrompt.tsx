/**
 * Upgrade Prompt Component
 * Reusable component for showing upgrade prompts when Free tier limits are reached
 */

import React from 'react';
import { useTier } from '../packages/core/hooks/useTier';
import { Sparkles, Zap, Shield, TrendingUp, X } from 'lucide-react';

interface UpgradePromptProps {
  feature: string;
  limit?: string;
  onUpgrade?: () => void;
  onDismiss?: () => void;
  variant?: 'banner' | 'modal' | 'inline';
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  feature,
  limit,
  onUpgrade,
  onDismiss,
  variant = 'banner',
}) => {
  const { isPro, config } = useTier();

  // Don't show if already Pro
  if (isPro) {
    return null;
  }

  const proFeatures = [
    { icon: Sparkles, text: 'Visual Garden Planner' },
    { icon: Zap, text: 'Time-Lapse Foto' },
    { icon: TrendingUp, text: 'Analisi Resa Economica' },
    { icon: Shield, text: 'Meteo Avanzato' },
  ];

  const content = (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Sparkles size={20} className="text-purple-600 flex-shrink-0" />
            <h4 className="font-bold text-gray-800 text-sm sm:text-base">Passa a Pro</h4>
          </div>
          <p className="text-xs sm:text-sm text-gray-700 mb-2 break-words">
            {limit ? (
              <>Hai raggiunto il limite per <strong>{feature}</strong>: {limit}</>
            ) : (
              <>La funzionalità <strong>{feature}</strong> è disponibile solo in versione Pro</>
            )}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            {proFeatures.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                <feat.icon size={14} className="text-purple-600" />
                <span>{feat.text}</span>
              </div>
            ))}
          </div>
          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-xs sm:text-sm transition-colors w-full sm:w-auto"
            >
              Sblocca Pro
            </button>
          )}
        </div>
        {onDismiss && variant !== 'modal' && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 ml-2"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default UpgradePrompt;

