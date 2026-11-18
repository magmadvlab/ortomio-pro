import 'server-only'
import { z } from 'zod'

export const externalRequestSchema = z.object({
  provider: z.enum(['groq', 'openrouter', 'mistral', 'huggingface']),
  messages: z.array(z.object({ role: z.enum(['user', 'assistant', 'system']), content: z.string().min(1).max(50000) }).strict()).min(1).max(40),
  model: z.string().min(1).max(200).optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().int().min(1).max(8192).default(2048),
}).strict()
type Provider = z.infer<typeof externalRequestSchema>['provider']
const providers: Provider[] = ['groq', 'openrouter', 'mistral', 'huggingface']
const settings = (provider: Provider) => {
  const prefix = provider === 'mistral' ? 'OPENROUTER' : provider.toUpperCase()
  const endpoint = provider === 'groq' ? 'https://api.groq.com/openai/v1/chat/completions'
    : provider === 'huggingface' ? 'https://router.huggingface.co/v1/chat/completions'
    : 'https://openrouter.ai/api/v1/chat/completions'
  return { key: process.env[`${prefix}_API_KEY`], model: process.env[`${provider.toUpperCase()}_MODEL`], endpoint }
}
// A configured model is required; discontinued aliases are never guessed.
export const configuredExternalProviders = () => providers.filter(provider => { const value = settings(provider); return !!value.key && !!value.model })
export async function generateExternalContent(input: z.infer<typeof externalRequestSchema>) {
  const config = settings(input.provider)
  if (!config.key || !config.model) throw new Error('provider_not_configured')
  if (input.model && input.model !== config.model) throw new Error('model_not_allowed')
  const response = await fetch(config.endpoint, {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(30000),
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.key}` },
    body: JSON.stringify({ model: config.model, messages: input.messages, temperature: input.temperature, max_tokens: input.maxTokens, stream: false }),
  })
  if (!response.ok) throw new Error(`provider_http_${response.status}`)
  const result = await response.json()
  const text = result.choices?.[0]?.message?.content
  if (typeof text !== 'string' || !text.trim()) throw new Error('invalid_provider_response')
  return { text, model: config.model, provider: input.provider }
}
