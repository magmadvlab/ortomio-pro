/**
 * API Keys Service
 * Manage external API keys for AI services and integrations
 */

import { APIKey, APIService, APIKeyTestResult, API_SERVICES } from '@/types/apiKeys';

/**
 * Encrypt API key value
 * NOTE: In production, use proper encryption (AES-256-GCM)
 */
const encryptKey = (value: string): string => {
  // TODO: Implement proper encryption
  // For now, just base64 encode (NOT SECURE - placeholder only)
  return btoa(value);
};

/**
 * Decrypt API key value
 */
const decryptKey = (encrypted: string): string => {
  // TODO: Implement proper decryption
  // For now, just base64 decode (NOT SECURE - placeholder only)
  try {
    return atob(encrypted);
  } catch {
    return encrypted;
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
  const apiKey: APIKey = {
    id: crypto.randomUUID(),
    userId,
    organizationId,
    service,
    name,
    keyValue: encryptKey(keyValue),
    config,
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // TODO: Save to database via storage provider
  return apiKey;
};

/**
 * Get user's API keys
 */
export const getUserAPIKeys = async (
  userId: string,
  organizationId?: string
): Promise<APIKey[]> => {
  // TODO: Implement via storage provider
  return [];
};

/**
 * Get API key by ID
 */
export const getAPIKey = async (keyId: string): Promise<APIKey | null> => {
  // TODO: Implement via storage provider
  return null;
};

/**
 * Get decrypted API key value
 */
export const getDecryptedAPIKey = async (keyId: string): Promise<string | null> => {
  const apiKey = await getAPIKey(keyId);
  if (!apiKey) return null;
  return decryptKey(apiKey.keyValue);
};

/**
 * Update API key
 */
export const updateAPIKey = async (
  keyId: string,
  updates: Partial<APIKey>
): Promise<void> => {
  // If updating keyValue, encrypt it
  if (updates.keyValue) {
    updates.keyValue = encryptKey(updates.keyValue);
  }
  
  // TODO: Implement via storage provider
};

/**
 * Delete API key
 */
export const deleteAPIKey = async (keyId: string): Promise<void> => {
  // TODO: Implement via storage provider
};

/**
 * Toggle API key active status
 */
export const toggleAPIKeyStatus = async (keyId: string): Promise<void> => {
  // TODO: Implement via storage provider
};

/**
 * Increment usage count
 */
export const incrementUsageCount = async (keyId: string): Promise<void> => {
  // TODO: Implement via storage provider
  // Update usageCount and lastUsed timestamp
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
