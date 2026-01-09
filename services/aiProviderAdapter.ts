/**
 * AI Provider Adapter
 * Adapter per diversi provider AI (Gemini, OpenAI, Anthropic, Ollama, etc.)
 * Usa configurazioni API personalizzate quando disponibili
 */

import { GoogleGenAI } from "@google/genai";
import { getActiveAPIConfiguration, type AIServiceType } from './apiConfigurationService';

// Fallback a variabili ambiente se non ci sono configurazioni personalizzate
const getDefaultGeminiKey = (): string | null => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY || 
           (import.meta as any)?.env?.VITE_GEMINI_API_KEY || null;
  }
  return process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || null;
};

export interface AIProvider {
  generateContent: (prompt: string, options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemInstruction?: string;
  }) => Promise<{ text: string }>;
  generateContentWithSchema?: (prompt: string, schema: any, options?: any) => Promise<any>;
}

/**
 * Crea provider Gemini
 */
function createGeminiProvider(apiKey: string, config?: any): AIProvider {
  const ai = new GoogleGenAI({ apiKey });
  const model = config?.model || 'gemini-2.5-flash';

  return {
    async generateContent(prompt: string, options?: any) {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: options?.temperature || 0.7,
          maxOutputTokens: options?.maxTokens || 2048,
          systemInstruction: options?.systemInstruction,
        },
      });
      return { text: response.text || '' };
    },
    async generateContentWithSchema(prompt: string, schema: any, options?: any) {
      // Per Gemini, usa responseMimeType e responseSchema nel config
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: options?.temperature || 0.7,
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });
      return response;
    },
  };
}

/**
 * Crea provider OpenAI
 */
function createOpenAIProvider(apiKey: string, config?: any): AIProvider {
  const model = config?.model || 'gpt-4';
  const baseURL = config?.base_url || 'https://api.openai.com/v1';

  return {
    async generateContent(prompt: string, options?: any) {
      const response = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            ...(options?.systemInstruction ? [{ role: 'system', content: options.systemInstruction }] : []),
            { role: 'user', content: prompt },
          ],
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 2048,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return { text: data.choices[0]?.message?.content || '' };
    },
  };
}

/**
 * Crea provider Ollama (Open Source locale)
 */
function createOllamaProvider(apiKey: string, config?: any): AIProvider {
  const model = config?.model || 'llama3';
  const baseURL = config?.base_url || 'http://localhost:11434';

  return {
    async generateContent(prompt: string, options?: any) {
      const response = await fetch(`${baseURL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          options: {
            temperature: options?.temperature || 0.7,
            num_predict: options?.maxTokens || 2048,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      // Ollama restituisce stream, leggiamo tutto
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(l => l.trim());
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.response) {
                fullText += data.response;
              }
            } catch {
              // Ignora linee non JSON
            }
          }
        }
      }

      return { text: fullText };
    },
  };
}

/**
 * Crea provider Anthropic (Claude)
 */
function createAnthropicProvider(apiKey: string, config?: any): AIProvider {
  const model = config?.model || 'claude-3-opus-20240229';

  return {
    async generateContent(prompt: string, options?: any) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: options?.maxTokens || 2048,
          temperature: options?.temperature || 0.7,
          messages: [
            { role: 'user', content: prompt },
          ],
          ...(options?.systemInstruction ? { system: options.systemInstruction } : {}),
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.statusText}`);
      }

      const data = await response.json();
      return { text: data.content[0]?.text || '' };
    },
  };
}

/**
 * Ottiene il provider AI attivo (configurazione personalizzata o default)
 */
export async function getAIProvider(
  serviceType: AIServiceType = 'ai_gemini'
): Promise<AIProvider | null> {
  try {
    // Prova prima a recuperare configurazione personalizzata
    const customConfig = await getActiveAPIConfiguration(serviceType);
    
    if (customConfig && customConfig.api_key) {
      switch (serviceType) {
        case 'ai_gemini':
          return createGeminiProvider(customConfig.api_key, customConfig.config);
        case 'ai_openai':
          return createOpenAIProvider(customConfig.api_key, customConfig.config);
        case 'ai_anthropic':
          return createAnthropicProvider(customConfig.api_key, customConfig.config);
        case 'ai_ollama':
        case 'ai_local':
          return createOllamaProvider(customConfig.api_key, customConfig.config);
        default:
          return null;
      }
    }
  } catch (error) {
    console.warn('Errore recupero configurazione AI personalizzata:', error);
  }

  // Fallback a configurazione default (variabili ambiente)
  if (serviceType === 'ai_gemini') {
    const defaultKey = getDefaultGeminiKey();
    if (defaultKey) {
      return createGeminiProvider(defaultKey);
    }
  }

  return null;
}

/**
 * Verifica se un provider AI è disponibile
 */
export async function isAIProviderAvailable(serviceType: AIServiceType = 'ai_gemini'): Promise<boolean> {
  const provider = await getAIProvider(serviceType);
  return provider !== null;
}

