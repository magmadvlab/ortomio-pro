/**
 * AI Proxy Service - Integrazione con architettura AI esistente OrtoMio
 * Fornisce interfaccia unificata per chiamate AI multi-provider
 */

import { getAIProvider, type AIProvider } from './aiProviderAdapter';
import { type AIServiceType } from './apiConfigurationService';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
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

/**
 * Configurazioni specifiche per provider esterni
 */
const EXTERNAL_PROVIDERS = {
  openrouter: {
    baseURL: 'https://openrouter.ai/api/v1',
    models: {
      // Modelli gratuiti/economici
      'google/gemini-2.0-flash-exp:free': 'google/gemini-2.0-flash-exp:free',
      'meta-llama/llama-3.3-70b-instruct:free': 'meta-llama/llama-3.3-70b-instruct:free',
      'mistralai/mistral-7b-instruct:free': 'mistralai/mistral-7b-instruct:free',
      'microsoft/phi-3-mini-128k-instruct:free': 'microsoft/phi-3-mini-128k-instruct:free',
      // Modelli premium per funzioni avanzate
      'anthropic/claude-3.5-sonnet': 'anthropic/claude-3.5-sonnet',
      'openai/gpt-4o': 'openai/gpt-4o',
      'google/gemini-pro-1.5': 'google/gemini-pro-1.5'
    }
  },
  groq: {
    baseURL: 'https://api.groq.com/openai/v1',
    models: {
      'llama-3.2-90b-vision-preview': 'llama-3.2-90b-vision-preview',
      'llama-3.3-70b-versatile': 'llama-3.3-70b-versatile',
      'llama-3.1-70b-versatile': 'llama-3.1-70b-versatile',
      'mixtral-8x7b-32768': 'mixtral-8x7b-32768'
    }
  },
  huggingface: {
    baseURL: 'https://api-inference.huggingface.co/models',
    models: {
      'microsoft/DialoGPT-large': 'microsoft/DialoGPT-large',
      'microsoft/DialoGPT-medium': 'microsoft/DialoGPT-medium',
      'facebook/blenderbot-400M-distill': 'facebook/blenderbot-400M-distill',
      'microsoft/GODEL-v1_1-large-seq2seq': 'microsoft/GODEL-v1_1-large-seq2seq'
    }
  },
  mistral: {
    baseURL: 'https://api.mistral.ai/v1',
    models: {
      'mistral-large-latest': 'mistral-large-latest',
      'mistral-medium-latest': 'mistral-medium-latest',
      'mistral-small-latest': 'mistral-small-latest'
    }
  }
};

/**
 * Crea provider per servizi esterni (OpenRouter, Groq, Mistral, HuggingFace)
 */
function createExternalProvider(
  providerName: 'openrouter' | 'groq' | 'mistral' | 'huggingface',
  apiKey: string
): AIProvider {
  const config = EXTERNAL_PROVIDERS[providerName];
  
  return {
    async generateContent(prompt: string, options?: any) {
      const messages = Array.isArray(prompt) ? prompt : [{ role: 'user', content: prompt }];
      
      // HuggingFace ha un'API diversa
      if (providerName === 'huggingface') {
        const model = options?.model || Object.values(config.models)[0];
        const response = await fetch(`${config.baseURL}/${model}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            inputs: messages[messages.length - 1].content,
            parameters: {
              temperature: options?.temperature || 0.7,
              max_new_tokens: options?.maxTokens || 2048,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`${providerName} API error: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        return { text: data[0]?.generated_text || data.generated_text || '' };
      }
      
      // OpenRouter, Groq, Mistral usano API compatibile OpenAI
      const response = await fetch(`${config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          ...(providerName === 'openrouter' ? {
            'HTTP-Referer': 'https://ortomio.com',
            'X-Title': 'OrtoMio AI Assistant'
          } : {})
        },
        body: JSON.stringify({
          model: options?.model || Object.values(config.models)[0],
          messages,
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 2048,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${providerName} API error: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return { text: data.choices[0]?.message?.content || '' };
    },
  };
}

/**
 * Ottiene API key per provider esterni dalle variabili ambiente
 */
function getExternalAPIKey(provider: string): string | null {
  switch (provider) {
    case 'openrouter':
      return process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || null;
    case 'groq':
      return process.env.NEXT_PUBLIC_GROQ_API_KEY || null;
    case 'huggingface':
      return process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || null;
    case 'mistral':
      return process.env.NEXT_PUBLIC_MISTRAL_API_KEY || null;
    default:
      return null;
  }
}

/**
 * Chiamata AI unificata che supporta tutti i provider
 */
export async function callAI(
  messages: AIMessage[],
  options: AICallOptions = {}
): Promise<AIResponse> {
  const {
    provider = 'groq', // Default a Groq per velocità e limiti generosi
    model,
    temperature = 0.7,
    maxTokens = 2048
  } = options;

  let aiProvider: AIProvider | null = null;
  let actualProvider = provider;
  let actualModel = model;

  try {
    // Provider esterni (Groq, HuggingFace, OpenRouter)
    if (['openrouter', 'groq', 'mistral', 'huggingface'].includes(provider)) {
      const apiKey = getExternalAPIKey(provider === 'mistral' ? 'openrouter' : provider);
      if (!apiKey) {
        throw new Error(`API Key non configurata per ${provider}`);
      }
      
      // Mistral tramite OpenRouter
      if (provider === 'mistral') {
        aiProvider = createExternalProvider('openrouter', apiKey);
        actualModel = model || 'mistralai/mistral-small-3.1-24b-instruct:free';
        actualProvider = 'mistral';
      } else {
        aiProvider = createExternalProvider(provider as any, apiKey);
        
        // Modelli default ottimizzati per agricoltura
        if (!actualModel) {
          switch (provider) {
            case 'groq':
              actualModel = 'llama-3.3-70b-versatile'; // Veloce e accurato per reasoning
              break;
            case 'huggingface':
              actualModel = 'microsoft/GODEL-v1_1-large-seq2seq'; // Specializzato conversazioni
              break;
            case 'openrouter':
              actualModel = 'google/gemini-2.0-flash-exp:free'; // Gratuito e potente
              break;
          }
        }
      }
    } else {
      // Provider interni (tramite aiProviderAdapter)
      const serviceType = PROVIDER_MAP[provider];
      if (!serviceType) {
        throw new Error(`Provider non supportato: ${provider}`);
      }
      
      aiProvider = await getAIProvider(serviceType);
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
      prompt = messages as any;
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
      usage: {
        // I provider non sempre restituiscono usage, ma possiamo stimare
        promptTokens: Math.ceil(JSON.stringify(messages).length / 4),
        completionTokens: Math.ceil(result.text.length / 4),
        totalTokens: Math.ceil((JSON.stringify(messages).length + result.text.length) / 4)
      }
    };

  } catch (error) {
    console.error(`Errore chiamata AI (${provider}):`, error);
    
    // Fallback Chain Ottimizzata: Groq → HuggingFace → Mistral → OpenRouter
    const fallbackChain = ['groq', 'huggingface', 'mistral', 'openrouter'];
    const currentIndex = fallbackChain.indexOf(provider);
    
    if (currentIndex < fallbackChain.length - 1) {
      const nextProvider = fallbackChain[currentIndex + 1];
      console.log(`🔄 Fallback a ${nextProvider}...`);
      try {
        return await callAI(messages, { ...options, provider: nextProvider as any });
      } catch (fallbackError) {
        console.error(`Fallback ${nextProvider} fallito:`, fallbackError);
        
        // Prova il prossimo nella chain
        if (currentIndex < fallbackChain.length - 2) {
          const finalProvider = fallbackChain[currentIndex + 2];
          console.log(`🔄 Ultimo tentativo con ${finalProvider}...`);
          try {
            return await callAI(messages, { ...options, provider: finalProvider as any });
          } catch (finalError) {
            console.error(`Tutti i fallback falliti:`, finalError);
          }
        }
      }
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
      return getExternalAPIKey(provider) !== null;
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
  const preferredProvider = options.provider || 'groq';
  
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
      let optimizedOptions = { ...options, provider: provider as any };
      
      switch (provider) {
        case 'groq':
          // Groq: Veloce per reasoning, ottimo per pianificazione
          optimizedOptions.model = optimizedOptions.model || 'llama-3.3-70b-versatile';
          break;
        case 'huggingface':
          // HuggingFace: Specializzato per piante e conversazioni
          optimizedOptions.model = optimizedOptions.model || 'microsoft/GODEL-v1_1-large-seq2seq';
          break;
        case 'mistral':
          // Mistral via OpenRouter: Modelli gratuiti per reasoning
          optimizedOptions.model = optimizedOptions.model || 'mistralai/mistral-small-3.1-24b-instruct:free';
          break;
        case 'openrouter':
          // OpenRouter: 400+ modelli, molti gratuiti
          optimizedOptions.model = optimizedOptions.model || 'google/gemini-2.0-flash-exp:free';
          break;
      }
      
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