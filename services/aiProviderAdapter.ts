import { getActiveAPIConfiguration, type AIServiceType } from './apiConfigurationService'
import { getSupabaseClient } from '@/config/supabase'
export interface GenerateContentOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemInstruction?: string;
}

export interface AIProvider {
  generateContent: (prompt: string, options?: GenerateContentOptions) => Promise<{ text: string }>;
  generateContentWithSchema?: (
    prompt: string,
    schema: Record<string, unknown>,
    options?: GenerateContentOptions
  ) => Promise<{ text: string }>;
}


export async function getAIProvider(serviceType: AIServiceType = 'ai_gemini'): Promise<AIProvider | null> {
  const configuration = await getActiveAPIConfiguration(serviceType)
  if (!configuration) return null
  async function generate(prompt: string, options?: GenerateContentOptions, schema?: Record<string, unknown>) {
    const { data } = await getSupabaseClient()!.auth.getSession()
    const response = await fetch('/api/api-configurations/generate', {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {}) },
      body: JSON.stringify({ id: configuration!.id, prompt, options, schema }),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.message || 'Generazione non riuscita')
    if (typeof result.text !== 'string') throw new Error('Risposta AI non valida')
    return { text: result.text }
  }
  return { generateContent: generate, generateContentWithSchema: (prompt, schema, options) => generate(prompt, options, schema) }
}
export async function isAIProviderAvailable(serviceType: AIServiceType = 'ai_gemini'): Promise<boolean> { return (await getAIProvider(serviceType)) !== null }
