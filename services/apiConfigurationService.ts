/**
 * API Configuration Service
 * Gestisce configurazioni API keys personalizzate degli utenti
 * Supporta diversi provider AI e meteo
 */

import { getSupabaseClient } from '../config/supabase';

export type AIServiceType = 'ai_gemini' | 'ai_openai' | 'ai_anthropic' | 'ai_ollama' | 'ai_local';
export type WeatherServiceType = 'weather_openmeteo' | 'weather_weatherapi' | 'weather_openweathermap' | 'weather_custom';
export type ServiceType = AIServiceType | WeatherServiceType;

export interface APIConfiguration {
  id?: string;
  user_id: string;
  service_type: ServiceType;
  provider_name: string;
  api_key: string; // Plain text per inserimento/aggiornamento
  api_key_encrypted?: string; // Criptata dal database
  config?: {
    model?: string; // es. "gpt-4", "gemini-2.5-flash", "llama3"
    base_url?: string; // Per Ollama o servizi custom: "http://localhost:11434"
    temperature?: number;
    max_tokens?: number;
    [key: string]: any;
  };
  is_active?: boolean;
  is_default?: boolean;
  last_used_at?: string;
  last_error?: string;
  usage_count?: number;
}

/**
 * Cripta API key (semplificato - in produzione usa criptazione più sicura)
 * Nota: Questo è solo per nascondere la chiave nel database, non è sicurezza reale
 * La sicurezza vera deve essere lato server con chiavi di criptazione gestite dal sistema
 */
function encryptApiKey(apiKey: string): string {
  // In produzione, usa una libreria di criptazione lato server
  // Per ora, usiamo Base64 encoding (NON criptazione sicura!)
  // TODO: Implementare criptazione vera con chiave gestita dal server
  if (typeof Buffer !== 'undefined') {
    // Server-side (Node.js)
    return Buffer.from(apiKey).toString('base64');
  } else if (typeof btoa !== 'undefined') {
    // Client-side (browser)
    return btoa(apiKey);
  }
  // Fallback
  return apiKey;
}

/**
 * Decripta API key (solo per uso interno)
 */
function decryptApiKey(encrypted: string): string {
  try {
    if (typeof Buffer !== 'undefined') {
      // Server-side (Node.js)
      return Buffer.from(encrypted, 'base64').toString('utf-8');
    } else if (typeof atob !== 'undefined') {
      // Client-side (browser)
      return atob(encrypted);
    }
    return encrypted; // Fallback
  } catch {
    return encrypted; // Se non è base64, restituisci così com'è
  }
}

/**
 * Salva configurazione API
 * Usa API endpoint quando disponibile (client-side), altrimenti Supabase diretto (server-side)
 */
export async function saveAPIConfiguration(
  config: Omit<APIConfiguration, 'id' | 'api_key_encrypted'>
): Promise<APIConfiguration> {
  // Se siamo lato client, usa API endpoint
  if (typeof window !== 'undefined') {
    try {
      const response = await fetch('/api/api-configurations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_type: config.service_type,
          provider_name: config.provider_name,
          api_key: config.api_key,
          config: config.config,
          is_active: config.is_active ?? true,
          is_default: config.is_default ?? false,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Errore salvataggio configurazione API');
      }

      const { configuration } = await response.json();
      return {
        ...configuration,
        api_key: config.api_key, // Mantieni API key per uso immediato
      };
    } catch (error: any) {
      throw new Error(error.message || 'Errore salvataggio configurazione API');
    }
  }

  // Server-side: usa Supabase diretto
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error('Supabase non disponibile');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Utente non autenticato');
  }

  // Cripta API key
  const encryptedKey = encryptApiKey(config.api_key);

  // Se is_default = true, imposta altri a false
  if (config.is_default) {
    await supabase
      .from('api_configurations')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .eq('service_type', config.service_type)
      .eq('is_default', true);
  }

  const { data, error } = await supabase
    .from('api_configurations')
    .insert({
      user_id: user.id,
      service_type: config.service_type,
      provider_name: config.provider_name,
      api_key_encrypted: encryptedKey,
      config: config.config || {},
      is_active: config.is_active ?? true,
      is_default: config.is_default ?? false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Errore salvataggio configurazione API: ${error.message}`);
  }

  return {
    id: data.id,
    user_id: data.user_id,
    service_type: data.service_type as ServiceType,
    provider_name: data.provider_name,
    api_key: decryptApiKey(data.api_key_encrypted), // Decripta per restituire
    config: data.config,
    is_active: data.is_active,
    is_default: data.is_default,
    last_used_at: data.last_used_at,
    last_error: data.last_error,
    usage_count: data.usage_count,
  };
}

/**
 * Aggiorna configurazione API esistente
 */
export async function updateAPIConfiguration(
  id: string,
  updates: Partial<Omit<APIConfiguration, 'id' | 'user_id'>>
): Promise<APIConfiguration> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error('Supabase non disponibile');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Utente non autenticato');
  }

  const updateData: any = {};

  if (updates.provider_name) updateData.provider_name = updates.provider_name;
  if (updates.api_key) updateData.api_key_encrypted = encryptApiKey(updates.api_key);
  if (updates.config) updateData.config = updates.config;
  if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
  if (updates.is_default !== undefined) {
    updateData.is_default = updates.is_default;
    
    // Se si imposta come default, imposta altri a false
    if (updates.is_default) {
      await supabase
        .from('api_configurations')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('service_type', updates.service_type || '')
        .neq('id', id)
        .eq('is_default', true);
    }
  }

  const { data, error } = await supabase
    .from('api_configurations')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Errore aggiornamento configurazione API: ${error.message}`);
  }

  return {
    id: data.id,
    user_id: data.user_id,
    service_type: data.service_type as ServiceType,
    provider_name: data.provider_name,
    api_key: decryptApiKey(data.api_key_encrypted),
    config: data.config,
    is_active: data.is_active,
    is_default: data.is_default,
    last_used_at: data.last_used_at,
    last_error: data.last_error,
    usage_count: data.usage_count,
  };
}

/**
 * Recupera tutte le configurazioni API dell'utente
 * Usa API endpoint quando disponibile (client-side), altrimenti Supabase diretto (server-side)
 */
export async function getUserAPIConfigurations(): Promise<APIConfiguration[]> {
  // Se siamo lato client, usa API endpoint
  if (typeof window !== 'undefined') {
    try {
      const response = await fetch('/api/api-configurations');
      if (!response.ok) {
        return [];
      }
      const { configurations } = await response.json();
      // Le configurazioni dall'API non includono api_key per sicurezza
      // Aggiungiamo placeholder per il form
      return configurations.map((config: any) => ({
        ...config,
        api_key: '***', // Placeholder - l'utente deve reinserire per modificare
      }));
    } catch (error) {
      console.error('Errore recupero configurazioni API:', error);
      return [];
    }
  }

  // Server-side: usa Supabase diretto
  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('api_configurations')
    .select('*')
    .eq('user_id', user.id)
    .order('service_type', { ascending: true })
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    service_type: row.service_type as ServiceType,
    provider_name: row.provider_name,
    api_key: decryptApiKey(row.api_key_encrypted), // Decripta per uso
    config: row.config,
    is_active: row.is_active,
    is_default: row.is_default,
    last_used_at: row.last_used_at,
    last_error: row.last_error,
    usage_count: row.usage_count,
  }));
}

/**
 * Recupera configurazione API attiva per un tipo servizio
 * Usa API endpoint quando disponibile (client-side), altrimenti Supabase diretto (server-side)
 */
export async function getActiveAPIConfiguration(
  serviceType: ServiceType
): Promise<APIConfiguration | null> {
  // Se siamo lato client, usa API endpoint specifico per evitare errori 406
  if (typeof window !== 'undefined') {
    try {
      // Usa endpoint specifico per serviceType che restituisce anche api_key
      const response = await fetch(`/api/api-configurations/${serviceType}`);
      if (!response.ok) {
        // Se l'API fallisce, ritorna null (fallback a default)
        return null;
      }
      const { configuration } = await response.json();
      
      if (!configuration) {
        return null;
      }
      
      return {
        id: configuration.id,
        user_id: configuration.user_id,
        service_type: configuration.service_type as ServiceType,
        provider_name: configuration.provider_name,
        api_key: configuration.api_key || '', // API key decriptata dall'endpoint
        config: configuration.config,
        is_active: configuration.is_active,
        is_default: configuration.is_default,
        last_used_at: configuration.last_used_at,
        last_error: configuration.last_error,
        usage_count: configuration.usage_count,
      };
    } catch (error) {
      // In caso di errore, ritorna null (fallback a default)
      console.warn('Errore recupero configurazione API attiva:', error);
      return null;
    }
  }

  // Server-side: usa Supabase diretto
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('api_configurations')
    .select('*')
    .eq('user_id', user.id)
    .eq('service_type', serviceType)
    .eq('is_active', true)
    .order('is_default', { ascending: false })
    .order('last_used_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    user_id: data.user_id,
    service_type: data.service_type as ServiceType,
    provider_name: data.provider_name,
    api_key: decryptApiKey(data.api_key_encrypted),
    config: data.config,
    is_active: data.is_active,
    is_default: data.is_default,
    last_used_at: data.last_used_at,
    last_error: data.last_error,
    usage_count: data.usage_count,
  };
}

/**
 * Elimina configurazione API
 */
export async function deleteAPIConfiguration(id: string): Promise<void> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error('Supabase non disponibile');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Utente non autenticato');
  }

  const { error } = await supabase
    .from('api_configurations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Errore eliminazione configurazione API: ${error.message}`);
  }
}

/**
 * Testa configurazione API (verifica che funzioni)
 */
export async function testAPIConfiguration(id: string): Promise<{ success: boolean; error?: string }> {
  const config = await getActiveAPIConfiguration('ai_gemini' as ServiceType);
  if (!config || config.id !== id) {
    return { success: false, error: 'Configurazione non trovata' };
  }

  // TODO: Implementare test reale per ogni tipo di servizio
  // Per ora, restituiamo successo se la chiave è presente
  if (!config.api_key || config.api_key.length < 10) {
    return { success: false, error: 'API key non valida' };
  }

  return { success: true };
}

