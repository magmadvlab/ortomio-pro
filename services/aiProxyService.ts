/**
 * AI Proxy Service - Integrazione con architettura AI esistente OrtoMio
 * Fornisce interfaccia unificata per chiamate AI multi-provider
 */

import { getAIProvider, type AIProvider } from './aiProviderAdapter';
import { type AIServiceType } from './apiConfigurationService';
import { planningImageContents } from '@/lib/ai/legacyContents';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  imageData?: { mimeType: string; data: string };
}

export interface AICallOptions {
  provider?: 'gemini' | 'openai' | 'anthropic' | 'ollama' | 'openrouter' | 'groq' | 'huggingface' | 'mistral';
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

/**
 * Mappa provider names ai service types
 */
const PROVIDER_MAP: Record<string, AIServiceType> = {
  'gemini': 'ai_gemini',
  'openai': 'ai_openai',
  'anthropic': 'ai_anthropic',
  'ollama': 'ai_ollama',
  'groq': 'ai_openai', // Groq usa API compatibile OpenAI
  'mistral': 'ai_openai', // Mistral usa API compatibile OpenAI
};

// External provider secrets and network requests stay behind the authenticated server proxy.
async function externalRequest(body?: unknown) {
  const response = await fetch('/api/ai/external', {
    method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Provider AI non disponibile');
  return result;
}
function createExternalProvider(provider: string): AIProvider {
  return { async generateContent(prompt, options) {
    const messages = Array.isArray(prompt) ? prompt : [{ role: 'user', content: prompt }];
    return externalRequest({ provider, messages, model: options?.model, temperature: options?.temperature, maxTokens: options?.maxTokens });
  } };
}

/**
 * Chiamata AI unificata che supporta tutti i provider
 */
export async function callAI(
  messages: AIMessage[],
  options: AICallOptions = {}
): Promise<AIResponse> {
  if (messages.some(message => message.imageData)) {
    if (options.provider && options.provider !== 'gemini') throw new Error('Questo percorso immagini richiede il provider Gemini.');
    const response = await fetch('/api/ai/generate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature: 'advanced_analysis', model: 'gemini-2.5-flash', contents: planningImageContents(messages), config: { temperature: options.temperature ?? 0.3, maxOutputTokens: options.maxTokens ?? 2048 } }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Analisi immagine non riuscita');
    return { content: result.text, provider: 'gemini', model: 'gemini-2.5-flash' };
  }
  const {
    provider = 'gemini',
    model,
    temperature = 0.7,
    maxTokens = 2048
  } = options;

  let aiProvider: AIProvider | null = null;
  const actualProvider = provider;
  let actualModel = model;

  try {
    // Provider esterni (Groq, HuggingFace, OpenRouter)
    if (['openrouter', 'groq', 'mistral', 'huggingface'].includes(provider)) {
      aiProvider = createExternalProvider(provider);
    } else {
      // Provider interni (tramite aiProviderAdapter)
      const serviceType = PROVIDER_MAP[provider];
      if (!serviceType) {
        throw new Error(`Provider non supportato: ${provider}`);
      }
      
      aiProvider = await getAIProvider(serviceType);
      if (!aiProvider && provider === 'gemini') {
        actualModel = 'gemini-2.5-flash';
        aiProvider = { async generateContent(prompt, settings) {
          const response = await fetch('/api/ai/generate', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feature: 'advanced_analysis', model: 'gemini-2.5-flash', contents: prompt, config: { temperature: settings?.temperature, maxOutputTokens: settings?.maxTokens } }),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'Richiesta AI non riuscita');
          return { text: result.text };
        } };
      }
      if (!aiProvider) {
        throw new Error(`Provider ${provider} non disponibile`);
      }
    }

    // Prepara il prompt
    let prompt: string;
    if (messages.length === 1 && messages[0].role === 'user') {
      prompt = messages[0].content;
    } else {
      // Per provider che supportano conversazioni, passa i messaggi
      prompt = ['openrouter', 'groq', 'mistral', 'huggingface'].includes(provider) ? messages as any : messages.map(message => `${message.role}: ${message.content}`).join('\n');
    }

    // Estrai system instruction se presente
    const systemMessage = messages.find(m => m.role === 'system');
    const systemInstruction = systemMessage?.content;

    // Chiama il provider
    const result = await aiProvider.generateContent(prompt, {
      model: actualModel,
      temperature,
      maxTokens,
      systemInstruction
    });

    return {
      content: result.text,
      provider: actualProvider,
      model: actualModel || 'default',

    };

  } catch (error) {
    console.error(`Errore chiamata AI (${provider}):`, error);
    // A single fallback for legacy callers that explicitly request an unconfigured provider.
    if (provider !== 'gemini' && error instanceof Error && error.message === 'provider_not_configured') {
      return callAI(messages, { ...options, provider: 'gemini', model: undefined });
    }
    throw error;
  }
}

/**
 * Verifica disponibilità provider
 */
export async function checkProviderAvailability(provider: string): Promise<boolean> {
  try {
    if (['openrouter', 'groq', 'mistral', 'huggingface'].includes(provider)) {
      return (await externalRequest()).providers.includes(provider);
    } else {
      const serviceType = PROVIDER_MAP[provider];
      if (!serviceType) return false;
      
      const aiProvider = await getAIProvider(serviceType);
      return aiProvider !== null;
    }
  } catch {
    return false;
  }
}

/**
 * Lista provider disponibili
 */
export async function getAvailableProviders(): Promise<string[]> {
  const providers = ['groq', 'huggingface', 'mistral', 'openrouter', 'gemini', 'openai', 'anthropic', 'ollama'];
  const available: string[] = [];
  
  for (const provider of providers) {
    if (await checkProviderAvailability(provider)) {
      available.push(provider);
    }
  }
  
  return available;
}

/**
 * Chiamata AI con retry automatico su provider diversi
 */
export async function callAIWithRetry(
  messages: AIMessage[],
  options: AICallOptions = {},
  maxRetries: number = 4
): Promise<AIResponse> {
  const availableProviders = await getAvailableProviders();
  const preferredProvider = options.provider || 'gemini';
  
  // Fallback Chain Ottimizzata basata sulla tua strategia
  const providerChain = ['groq', 'huggingface', 'mistral', 'openrouter'];
  const orderedProviders = [
    preferredProvider,
    ...providerChain.filter(p => p !== preferredProvider && availableProviders.includes(p))
  ];
  
  let lastError: Error | null = null;
  
  for (const provider of orderedProviders.slice(0, maxRetries)) {
    try {
      console.log(`🤖 Tentativo AI con provider: ${provider}`);
      
      // Ottimizzazioni specifiche per provider
      const optimizedOptions = { ...options, provider: provider as any };
      
      return await callAI(messages, optimizedOptions);
    } catch (error) {
      lastError = error as Error;
      console.warn(`⚠️ Provider ${provider} fallito:`, error);
    }
  }
  
  throw lastError || new Error('Tutti i provider AI non disponibili');
}

/**
 * Utility per creare messaggi AI
 */
export const createMessage = {
  system: (content: string): AIMessage => ({ role: 'system', content }),
  user: (content: string): AIMessage => ({ role: 'user', content }),
  assistant: (content: string): AIMessage => ({ role: 'assistant', content })
};

/**
 * Template per prompt agricoli comuni
 */
export const AgriculturePrompts = {
  soilAnalysis: (cropName: string, location: { latitude: number; longitude: number }) => 
    `Analizza questa foto del terreno per coltivazione di ${cropName} nella zona geografica lat ${location.latitude}, lng ${location.longitude}. Valuta tipo di suolo, drenaggio, struttura, presenza infestanti, pendenza ed esposizione. Fornisci valutazione di idoneità e raccomandazioni specifiche.`,
    
  layoutOptimization: (surfaceHectares: number, cropName: string) =>
    `Analizza questa foto aerea per progettare layout ottimale di ${surfaceHectares} ettari per ${cropName}. Considera zonizzazione, accessi, irrigazione, aree servizio, flussi di lavoro, protezione venti ed esposizione solare.`,
    
  varietyRecognition: (expectedCrop?: string) =>
    `Identifica la varietà di questa pianta${expectedCrop ? ` (dovrebbe essere ${expectedCrop})` : ''}. Analizza caratteristiche morfologiche, stadio sviluppo, varietà specifica, esigenze colturali, compatibilità e problemi visibili.`,
    
  scalingPlan: (cropName: string, surfaceHectares: number, location: string) =>
    `Crea un piano di scaglionamento dettagliato per ${cropName} su ${surfaceHectares} ettari in ${location}. Include fasi di semina, timeline, costi, ricavi, rischi e raccomandazioni operative.`
};
