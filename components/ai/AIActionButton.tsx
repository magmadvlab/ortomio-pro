/**
 * AI Action Button - Bottone AI universale per ogni componente
 * Si integra con il sistema AI esistente e fornisce assistenza contestuale
 */

import React, { useState } from 'react';
import { Bot, Sparkles, Loader2, MessageCircle, Camera, TrendingUp } from 'lucide-react';

export interface AIActionContext {
  component: string;
  data?: any;
  action?: 'analyze' | 'suggest' | 'plan' | 'diagnose' | 'optimize';
  imageData?: string;
}

interface AIActionButtonProps {
  context: AIActionContext;
  onAIResponse?: (response: string) => void;
  variant?: 'floating' | 'inline' | 'compact';
  position?: 'bottom-right' | 'top-right' | 'inline';
  className?: string;
}

export const AIActionButton: React.FC<AIActionButtonProps> = ({
  context,
  onAIResponse,
  variant = 'inline',
  position = 'inline',
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const handleAIAction = async (action: string, additionalData?: any) => {
    setIsLoading(true);
    setShowOptions(false);
    
    try {
      // Usa il sistema AI esistente di OrtoMio Free
      const { callAI } = await import('../../services/aiProxyService');
      
      const prompt = buildContextualPrompt(context, action, additionalData);
      
      const response = await callAI([
        { role: 'system', content: getSystemPrompt(context.component) },
        { role: 'user', content: prompt }
      ], {
        provider: 'groq', // Usa Groq per velocità
        model: 'llama-3.2-90b-vision-preview',
        temperature: 0.7
      });
      
      setAiResponse(response.content);
      onAIResponse?.(response.content);
      
    } catch (error) {
      console.error('AI Action failed:', error);
      setAiResponse('Mi dispiace, si è verificato un errore. Riprova più tardi.');
    } finally {
      setIsLoading(false);
    }
  };

  const buildContextualPrompt = (
    context: AIActionContext, 
    action: string, 
    additionalData?: any
  ): string => {
    const baseContext = `COMPONENTE: ${context.component}\nDATA: ${JSON.stringify(context.data, null, 2)}`;
    
    switch (action) {
      case 'analyze':
        return `${baseContext}\n\nAnalizza questi dati e fornisci insights utili per l'utente. Concentrati su aspetti pratici e attuabili.`;
        
      case 'suggest':
        return `${baseContext}\n\nFornisci 3-5 suggerimenti specifici per migliorare o ottimizzare questa situazione.`;
        
      case 'plan':
        return `${baseContext}\n\nCrea un piano d'azione dettagliato basato su questi dati. Includi timeline e priorità.`;
        
      case 'diagnose':
        return `${baseContext}\n\nAnalizza eventuali problemi o anomalie e suggerisci soluzioni specifiche.`;
        
      case 'optimize':
        return `${baseContext}\n\nCome posso ottimizzare questa configurazione per ottenere risultati migliori?`;
        
      case 'image_analyze':
        return `${baseContext}\n\nAnalizza questa immagine nel contesto dei dati forniti: ${additionalData?.imageData}`;
        
      default:
        return `${baseContext}\n\nFornisci assistenza contestuale per questa situazione.`;
    }
  };

  const getSystemPrompt = (component: string): string => {
    const basePrompt = "Sei un assistente AI esperto in agricoltura e orticoltura italiana.";
    
    const componentPrompts: Record<string, string> = {
      'planner': `${basePrompt} Specializzati in pianificazione colturale, rotazioni e scaglionamenti.`,
      'journal': `${basePrompt} Specializzati in analisi dello stato delle piante e diagnosi problemi.`,
      'compliance': `${basePrompt} Specializzati in normative agricole e certificazioni GlobalG.A.P.`,
      'plants': `${basePrompt} Specializzati in gestione delle piante individuali e cure specifiche.`,
      'irrigation': `${basePrompt} Specializzati in sistemi di irrigazione e gestione idrica.`,
      'weather': `${basePrompt} Specializzati in interpretazione dati meteo per decisioni agricole.`,
      'harvest': `${basePrompt} Specializzati in timing di raccolta e post-raccolta.`,
      'fertilization': `${basePrompt} Specializzati in nutrizione delle piante e fertilizzazione.`,
      'default': basePrompt
    };
    
    return componentPrompts[component] || componentPrompts.default;
  };

  const getActionOptions = () => {
    const commonOptions = [
      { key: 'analyze', label: 'Analizza', icon: Bot },
      { key: 'suggest', label: 'Suggerisci', icon: Sparkles }
    ];
    
    const componentOptions: Record<string, any[]> = {
      'planner': [
        ...commonOptions,
        { key: 'plan', label: 'Pianifica', icon: TrendingUp }
      ],
      'journal': [
        ...commonOptions,
        { key: 'diagnose', label: 'Diagnosi', icon: MessageCircle },
        { key: 'image_analyze', label: 'Analizza Foto', icon: Camera }
      ],
      'plants': [
        ...commonOptions,
        { key: 'diagnose', label: 'Diagnosi', icon: MessageCircle },
        { key: 'optimize', label: 'Ottimizza', icon: TrendingUp }
      ]
    };
    
    return componentOptions[context.component] || commonOptions;
  };

  if (variant === 'floating') {
    return (
      <div className={`fixed ${position === 'bottom-right' ? 'bottom-4 right-4' : 'top-4 right-4'} z-40`}>
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Bot size={20} />
            )}
          </button>
          
          {showOptions && (
            <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[150px]">
              {getActionOptions().map((option) => (
                <button
                  key={option.key}
                  onClick={() => handleAIAction(option.key)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                >
                  <option.icon size={16} />
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {aiResponse && (
          <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm">
            <div className="text-sm text-gray-800 whitespace-pre-wrap">
              {aiResponse}
            </div>
            <button
              onClick={() => setAiResponse(null)}
              className="mt-2 text-xs text-gray-500 hover:text-gray-700"
            >
              Chiudi
            </button>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={() => handleAIAction('suggest')}
        disabled={isLoading}
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors ${className}`}
      >
        {isLoading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Sparkles size={12} />
        )}
        AI
      </button>
    );
  }

  // Variant inline (default)
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Bot size={16} />
        )}
        Assistente AI
      </button>
      
      {showOptions && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[180px] z-50">
          {getActionOptions().map((option) => (
            <button
              key={option.key}
              onClick={() => handleAIAction(option.key)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
            >
              <option.icon size={16} />
              {option.label}
            </button>
          ))}
        </div>
      )}
      
      {aiResponse && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-md z-50">
          <div className="text-sm text-gray-800 whitespace-pre-wrap">
            {aiResponse}
          </div>
          <button
            onClick={() => setAiResponse(null)}
            className="mt-2 text-xs text-green-600 hover:text-green-700"
          >
            Chiudi
          </button>
        </div>
      )}
    </div>
  );
};

export default AIActionButton;