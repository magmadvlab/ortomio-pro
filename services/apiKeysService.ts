/**
 * API Keys Service
 * Manage external API keys for AI services and integrations
 */

import { APIKey, APIService, APIKeyTestResult, API_SERVICES } from '@/types/apiKeys';
import { getSupabaseClient } from '@/config/supabase';
import { encryptText, decryptText, simpleEncrypt, simpleDecrypt, isCryptoAvailable } from '@/utils/crypto';

const getAPIKeysSupabaseClient = () => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  return supabase;
};

/**
 * Encrypt API key value
 */
const encryptKey = async (value: string): Promise<string> => {
  if (isCryptoAvailable()) {
    try {
      return await encryptText(value);
    } catch (error) {
      console.warn('Crypto encryption failed, falling back to simple encoding:', error);
      return simpleEncrypt(value);
    }
  } else {
    console.warn('Web Crypto API not available, using simple encoding (not secure)');
    return simpleEncrypt(value);
  }
};

/**
 * Decrypt API key value
 */
const decryptKey = async (encrypted: string): Promise<string> => {
  if (isCryptoAvailable()) {
    try {
      return await decryptText(encrypted);
    } catch (error) {
      console.warn('Crypto decryption failed, falling back to simple decoding:', error);
      return simpleDecrypt(encrypted);
    }
  } else {
    return simpleDecrypt(encrypted);
  }
};

/**
 * Create API key
 */
export const createAPIKey = async (
  userId: string,
  service: APIService,
  name: string,
  keyValue: string,
  config?: Record<string, any>,
  organizationId?: string
): Promise<APIKey> => {
  const supabase = getAPIKeysSupabaseClient();
  
  const apiKey: APIKey = {
    id: crypto.randomUUID(),
    userId,
    organizationId,
    service,
    name,
    keyValue: await encryptKey(keyValue),
    config,
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      id: apiKey.id,
      user_id: apiKey.userId,
      organization_id: apiKey.organizationId,
      service: apiKey.service,
      name: apiKey.name,
      description: apiKey.description,
      key_value: apiKey.keyValue,
      config: apiKey.config || {},
      is_active: apiKey.isActive,
      usage_count: apiKey.usageCount,
      created_at: apiKey.createdAt,
      updated_at: apiKey.updatedAt
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating API key:', error);
    throw new Error(`Failed to create API key: ${error.message}`);
  }

  return {
    id: data.id,
    userId: data.user_id,
    organizationId: data.organization_id,
    service: data.service,
    name: data.name,
    description: data.description,
    keyValue: data.key_value,
    config: data.config,
    isActive: data.is_active,
    lastUsed: data.last_used,
    usageCount: data.usage_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

/**
 * Get user's API keys
 */
export const getUserAPIKeys = async (
  userId: string,
  organizationId?: string
): Promise<APIKey[]> => {
  const supabase = getAPIKeysSupabaseClient();

  let query = supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', userId);

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting API keys:', error);
    throw new Error(`Failed to get API keys: ${error.message}`);
  }

  return (data || []).map(key => ({
    id: key.id,
    userId: key.user_id,
    organizationId: key.organization_id,
    service: key.service,
    name: key.name,
    description: key.description,
    keyValue: key.key_value,
    config: key.config,
    isActive: key.is_active,
    lastUsed: key.last_used,
    usageCount: key.usage_count,
    createdAt: key.created_at,
    updatedAt: key.updated_at
  }));
};

/**
 * Get API key by ID
 */
export const getAPIKey = async (keyId: string): Promise<APIKey | null> => {
  const supabase = getAPIKeysSupabaseClient();

  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('id', keyId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Error getting API key:', error);
    throw new Error(`Failed to get API key: ${error.message}`);
  }

  return {
    id: data.id,
    userId: data.user_id,
    organizationId: data.organization_id,
    service: data.service,
    name: data.name,
    description: data.description,
    keyValue: data.key_value,
    config: data.config,
    isActive: data.is_active,
    lastUsed: data.last_used,
    usageCount: data.usage_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

/**
 * Get decrypted API key value
 */
export const getDecryptedAPIKey = async (keyId: string): Promise<string | null> => {
  const apiKey = await getAPIKey(keyId);
  if (!apiKey) return null;
  return await decryptKey(apiKey.keyValue);
};

/**
 * Update API key
 */
export const updateAPIKey = async (
  keyId: string,
  updates: Partial<APIKey>
): Promise<void> => {
  const supabase = getAPIKeysSupabaseClient();

  // If updating keyValue, encrypt it
  const dbUpdates: any = { ...updates };
  if (updates.keyValue) {
    dbUpdates.key_value = await encryptKey(updates.keyValue);
    delete dbUpdates.keyValue;
  }

  // Convert camelCase to snake_case for database
  const dbFields: any = {};
  Object.keys(dbUpdates).forEach(key => {
    switch (key) {
      case 'userId': dbFields.user_id = dbUpdates[key]; break;
      case 'organizationId': dbFields.organization_id = dbUpdates[key]; break;
      case 'keyValue': dbFields.key_value = dbUpdates[key]; break;
      case 'isActive': dbFields.is_active = dbUpdates[key]; break;
      case 'lastUsed': dbFields.last_used = dbUpdates[key]; break;
      case 'usageCount': dbFields.usage_count = dbUpdates[key]; break;
      case 'createdAt': dbFields.created_at = dbUpdates[key]; break;
      case 'updatedAt': dbFields.updated_at = dbUpdates[key]; break;
      default: dbFields[key] = dbUpdates[key];
    }
  });

  dbFields.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('api_keys')
    .update(dbFields)
    .eq('id', keyId);

  if (error) {
    console.error('Error updating API key:', error);
    throw new Error(`Failed to update API key: ${error.message}`);
  }
};

/**
 * Delete API key
 */
export const deleteAPIKey = async (keyId: string): Promise<void> => {
  const supabase = getAPIKeysSupabaseClient();

  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', keyId);

  if (error) {
    console.error('Error deleting API key:', error);
    throw new Error(`Failed to delete API key: ${error.message}`);
  }
};

/**
 * Toggle API key active status
 */
export const toggleAPIKeyStatus = async (keyId: string): Promise<void> => {
  const supabase = getAPIKeysSupabaseClient();

  // First get current status
  const { data: currentKey, error: getError } = await supabase
    .from('api_keys')
    .select('is_active')
    .eq('id', keyId)
    .single();

  if (getError) {
    console.error('Error getting API key status:', getError);
    throw new Error(`Failed to get API key status: ${getError.message}`);
  }

  // Toggle status
  const { error } = await supabase
    .from('api_keys')
    .update({ 
      is_active: !currentKey.is_active,
      updated_at: new Date().toISOString()
    })
    .eq('id', keyId);

  if (error) {
    console.error('Error toggling API key status:', error);
    throw new Error(`Failed to toggle API key status: ${error.message}`);
  }
};

/**
 * Increment usage count
 */
export const incrementUsageCount = async (keyId: string): Promise<void> => {
  const supabase = getAPIKeysSupabaseClient();

  const { data: currentKey, error: currentKeyError } = await supabase
    .from('api_keys')
    .select('usage_count')
    .eq('id', keyId)
    .single();

  if (currentKeyError) {
    console.error('Error reading API key usage count:', currentKeyError);
    throw new Error(`Failed to read API key usage count: ${currentKeyError.message}`);
  }

  const { error } = await supabase
    .from('api_keys')
    .update({ 
      usage_count: (currentKey?.usage_count || 0) + 1,
      last_used: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', keyId);

  if (error) {
    console.error('Error incrementing usage count:', error);
    throw new Error(`Failed to increment usage count: ${error.message}`);
  }
};

/**
 * Test API key
 */
export const testAPIKey = async (
  service: APIService,
  keyValue: string,
  config?: Record<string, any>
): Promise<APIKeyTestResult> => {
  const result: APIKeyTestResult = {
    success: false,
    message: '',
    testedAt: new Date().toISOString(),
  };

  try {
    switch (service) {
      case 'OpenAI':
        result.success = await testOpenAI(keyValue, config);
        result.message = result.success
          ? 'OpenAI API key is valid'
          : 'Invalid OpenAI API key';
        break;

      case 'Anthropic':
        result.success = await testAnthropic(keyValue);
        result.message = result.success
          ? 'Anthropic API key is valid'
          : 'Invalid Anthropic API key';
        break;

      case 'GoogleAI':
        result.success = await testGoogleAI(keyValue);
        result.message = result.success
          ? 'Google AI API key is valid'
          : 'Invalid Google AI API key';
        break;

      case 'SentinelHub':
        result.success = await testSentinelHub(config);
        result.message = result.success
          ? 'Sentinel Hub credentials are valid'
          : 'Invalid Sentinel Hub credentials';
        break;

      case 'WeatherAPI':
        result.success = await testWeatherAPI(keyValue);
        result.message = result.success
          ? 'Weather API key is valid'
          : 'Invalid Weather API key';
        break;

      default:
        result.message = 'Testing not supported for this service';
    }
  } catch (error: any) {
    result.success = false;
    result.message = error.message || 'Test failed';
    result.details = error;
  }

  return result;
};

/**
 * Test OpenAI API key
 */
const testOpenAI = async (apiKey: string, config?: Record<string, any>): Promise<boolean> => {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        ...(config?.organization && { 'OpenAI-Organization': config.organization })
      }
    });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Test Anthropic API key
 */
const testAnthropic = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }]
      })
    });
    return response.ok || response.status === 400; // 400 is ok, means auth worked
  } catch {
    return false;
  }
};

/**
 * Test Google AI API key
 */
const testGoogleAI = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
    );
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Test Sentinel Hub credentials
 */
const testSentinelHub = async (config?: Record<string, any>): Promise<boolean> => {
  if (!config?.clientId || !config?.clientSecret) return false;
  
  try {
    const response = await fetch('https://services.sentinel-hub.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.clientId,
        client_secret: config.clientSecret
      })
    });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Test Weather API key
 */
const testWeatherAPI = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=London`
    );
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Get active API key for service
 */
export const getActiveAPIKeyForService = async (
  userId: string,
  service: APIService,
  organizationId?: string
): Promise<APIKey | null> => {
  const keys = await getUserAPIKeys(userId, organizationId);
  const activeKeys = keys.filter(k => k.service === service && k.isActive);
  
  // Return most recently used or created
  if (activeKeys.length === 0) return null;
  
  return activeKeys.sort((a, b) => {
    const aTime = a.lastUsed || a.createdAt;
    const bTime = b.lastUsed || b.createdAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  })[0];
};

/**
 * Get service configuration
 */
export const getServiceConfig = (service: APIService) => {
  return API_SERVICES[service];
};

/**
 * Get all supported services
 */
export const getSupportedServices = () => {
  return Object.values(API_SERVICES);
};
