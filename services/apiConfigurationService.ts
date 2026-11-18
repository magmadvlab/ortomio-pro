import { getSupabaseClient } from '@/config/supabase'
export type AIServiceType = 'ai_gemini' | 'ai_openai' | 'ai_anthropic' | 'ai_ollama' | 'ai_local';
export type WeatherServiceType = 'weather_openmeteo' | 'weather_weatherapi' | 'weather_openweathermap' | 'weather_custom';
export type ServiceType = AIServiceType | WeatherServiceType;

export interface APIConfiguration {
  id?: string;
  user_id: string;
  service_type: ServiceType;
  provider_name: string;
  api_key: string; // Plain text per inserimento/aggiornamento
  has_api_key?: boolean; // Metadata only; secrets stay on the server
  config?: {
    model?: string; // es. "gpt-4", "gemini-2.5-flash", "llama3"
    base_url?: string; // Per Ollama o servizi custom: "http://localhost:11434"
    temperature?: number;
    max_tokens?: number;
    [key: string]: unknown;
  };
  is_active?: boolean;
  is_default?: boolean;
  last_used_at?: string;
  last_error?: string;
  usage_count?: number;
}


async function request(path: string, method = 'GET', body?: unknown) {
  const client = getSupabaseClient()
  const { data } = client ? await client.auth.getSession() : { data: { session: null } }
  const response = await fetch(`/api/api-configurations${path}`, {
    method, cache: 'no-store', headers: { 'Content-Type': 'application/json', ...(data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || 'Configurazione API non disponibile')
  return result
}
export async function saveAPIConfiguration(config: Omit<APIConfiguration, 'id'>): Promise<APIConfiguration> {
  return (await request('', 'POST', config)).configuration
}
export async function updateAPIConfiguration(id: string, updates: Partial<Omit<APIConfiguration, 'id' | 'user_id'>>): Promise<APIConfiguration> {
  return (await request('', 'PATCH', { ...updates, id })).configuration
}
export async function getUserAPIConfigurations(): Promise<APIConfiguration[]> {
  return (await request('')).configurations
}
export async function getActiveAPIConfiguration(serviceType: ServiceType): Promise<APIConfiguration | null> {
  return (await request(`/${serviceType}`)).configuration
}
export async function deleteAPIConfiguration(id: string): Promise<void> { await request('', 'DELETE', { id }) }
export async function testAPIConfiguration(id: string): Promise<{ success: boolean; error?: string }> {
  try { return await request('/test', 'POST', { id }) }
  catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Test non riuscito' } }
}
