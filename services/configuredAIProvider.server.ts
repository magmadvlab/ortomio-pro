import 'server-only'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { APIConfiguration } from './apiConfigurationService'
import type { AIProvider, GenerateContentOptions } from './aiProviderAdapter'
type ProviderConfig = APIConfiguration['config'];

/**
 * Crea provider Gemini
 */
function createGeminiProvider(apiKey: string, config?: ProviderConfig): AIProvider {
  const ai = new GoogleGenerativeAI(apiKey);
  const model = config?.model || 'gemini-2.5-flash';

  const generateGeminiContent = async (request: {
    contents: string;
    generationConfig?: Record<string, unknown>;
    systemInstruction?: string;
  }) => {
    const modelClient = ai.getGenerativeModel({ model });
    const result = await modelClient.generateContent({
      contents: [{ role: 'user', parts: [{ text: request.contents }] }],
      generationConfig: request.generationConfig,
      systemInstruction: request.systemInstruction,
    }, { timeout: 30000 });

    return {
      text: result.response.text() || '',
    };
  };

  return {
    async generateContent(prompt: string, options?: GenerateContentOptions) {
      const response = await generateGeminiContent({
        contents: prompt,
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 2048,
        },
        systemInstruction: options?.systemInstruction,
      });
      return response;
    },
    async generateContentWithSchema(prompt: string, schema: Record<string, unknown>, options?: GenerateContentOptions) {
      // Per Gemini, usa responseMimeType e responseSchema nel config
      const response = await generateGeminiContent({
        contents: prompt,
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
        systemInstruction: options?.systemInstruction,
      });
      return response;
    },
  };
}

/**
 * Crea provider OpenAI
 */
function createOpenAIProvider(apiKey: string, config?: ProviderConfig): AIProvider {
  const model = config?.model || 'gpt-4';
  const baseURL = 'https://api.openai.com/v1';

  return {
    async generateContent(prompt: string, options?: GenerateContentOptions) {
      const response = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        redirect: 'error', signal: AbortSignal.timeout(30000),
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
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 2048,
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
function createOllamaProvider(apiKey: string, config?: ProviderConfig): AIProvider {
  const model = config?.model || 'llama3';
  const baseURL = config?.base_url || 'http://localhost:11434';

  return {
    async generateContent(prompt: string, options?: GenerateContentOptions) {
      const response = await fetch(`${baseURL}/api/generate`, {
        method: 'POST',
        redirect: 'error', signal: AbortSignal.timeout(30000),
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: options?.temperature ?? 0.7,
            num_predict: options?.maxTokens ?? 2048,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json()
      if (typeof data.response !== 'string') throw new Error('invalid_provider_response')
      return { text: data.response };
    },
  };
}

/**
 * Crea provider Anthropic (Claude)
 */
function createAnthropicProvider(apiKey: string, config?: ProviderConfig): AIProvider {
  const model = config?.model || 'claude-3-opus-20240229';

  return {
    async generateContent(prompt: string, options?: GenerateContentOptions) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        redirect: 'error', signal: AbortSignal.timeout(30000),
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: options?.maxTokens ?? 2048,
          temperature: options?.temperature ?? 0.7,
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


export function configuredAIProvider(configuration: APIConfiguration): AIProvider {
  switch (configuration.service_type) {
    case 'ai_gemini': return createGeminiProvider(configuration.api_key, configuration.config)
    case 'ai_openai':
      if (configuration.config?.base_url && configuration.config.base_url !== 'https://api.openai.com/v1') throw new Error('provider_origin_not_allowed')
      return createOpenAIProvider(configuration.api_key, configuration.config)
    case 'ai_anthropic': return createAnthropicProvider(configuration.api_key, configuration.config)
    case 'ai_ollama': case 'ai_local': {
      const origin = new URL(configuration.config?.base_url || 'http://localhost:11434').origin
      const allowed = (process.env.API_PROVIDER_ALLOWED_ORIGINS || '').split(',').map(value => value.trim())
      if (!allowed.includes(origin)) throw new Error('provider_origin_not_allowed')
      return createOllamaProvider(configuration.api_key, { ...configuration.config, base_url: origin })
    }
    default: throw new Error('provider_not_supported')
  }
}
