/**
 * API Keys Types
 * Manage external API keys for AI services and integrations
 */

/**
 * API Key - Stored API key for external services
 */
export interface APIKey {
  id: string;
  userId: string;
  organizationId?: string;
  
  // Service info
  service: APIService;
  name: string;
  description?: string;
  
  // Key data (encrypted)
  keyValue: string;
  
  // Additional config
  config?: Record<string, any>;
  
  // Status
  isActive: boolean;
  lastUsed?: string;
  usageCount: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

/**
 * Supported API Services
 */
export type APIService =
  | 'OpenAI'
  | 'Anthropic'
  | 'GoogleAI'
  | 'Cohere'
  | 'HuggingFace'
  | 'SentinelHub'
  | 'WeatherAPI'
  | 'CustomEndpoint';

/**
 * API Service Configuration
 */
export interface APIServiceConfig {
  service: APIService;
  displayName: string;
  description: string;
  icon: string;
  fields: APIKeyField[];
  testable: boolean;
  documentation?: string;
}

/**
 * API Key Field Configuration
 */
export interface APIKeyField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'select';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: { value: string; label: string }[];
}

/**
 * API Key Test Result
 */
export interface APIKeyTestResult {
  success: boolean;
  message: string;
  details?: any;
  testedAt: string;
}

/**
 * Supported Services Configuration
 */
export const API_SERVICES: Record<APIService, APIServiceConfig> = {
  OpenAI: {
    service: 'OpenAI',
    displayName: 'OpenAI',
    description: 'GPT-4, GPT-3.5, DALL-E, Whisper',
    icon: '🤖',
    testable: true,
    documentation: 'https://platform.openai.com/docs/api-reference',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        required: true,
        placeholder: 'sk-...',
        helpText: 'Get your API key from platform.openai.com'
      },
      {
        name: 'organization',
        label: 'Organization ID (Optional)',
        type: 'text',
        required: false,
        placeholder: 'org-...',
        helpText: 'Optional organization ID for team accounts'
      }
    ]
  },
  Anthropic: {
    service: 'Anthropic',
    displayName: 'Anthropic Claude',
    description: 'Claude 3 Opus, Sonnet, Haiku',
    icon: '🧠',
    testable: true,
    documentation: 'https://docs.anthropic.com/claude/reference',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        required: true,
        placeholder: 'sk-ant-...',
        helpText: 'Get your API key from console.anthropic.com'
      }
    ]
  },
  GoogleAI: {
    service: 'GoogleAI',
    displayName: 'Google AI (Gemini)',
    description: 'Gemini Pro, Gemini Ultra',
    icon: '🔷',
    testable: true,
    documentation: 'https://ai.google.dev/docs',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        required: true,
        placeholder: 'AIza...',
        helpText: 'Get your API key from makersuite.google.com'
      }
    ]
  },
  Cohere: {
    service: 'Cohere',
    displayName: 'Cohere',
    description: 'Command, Embed, Rerank',
    icon: '🌐',
    testable: true,
    documentation: 'https://docs.cohere.com',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        required: true,
        placeholder: 'co-...',
        helpText: 'Get your API key from dashboard.cohere.com'
      }
    ]
  },
  HuggingFace: {
    service: 'HuggingFace',
    displayName: 'Hugging Face',
    description: 'Open source models and inference',
    icon: '🤗',
    testable: true,
    documentation: 'https://huggingface.co/docs/api-inference',
    fields: [
      {
        name: 'apiKey',
        label: 'API Token',
        type: 'password',
        required: true,
        placeholder: 'hf_...',
        helpText: 'Get your token from huggingface.co/settings/tokens'
      }
    ]
  },
  SentinelHub: {
    service: 'SentinelHub',
    displayName: 'Sentinel Hub',
    description: 'Satellite imagery and NDVI data',
    icon: '🛰️',
    testable: true,
    documentation: 'https://docs.sentinel-hub.com',
    fields: [
      {
        name: 'clientId',
        label: 'Client ID',
        type: 'text',
        required: true,
        placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        helpText: 'OAuth client ID from Sentinel Hub dashboard'
      },
      {
        name: 'clientSecret',
        label: 'Client Secret',
        type: 'password',
        required: true,
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        helpText: 'OAuth client secret from Sentinel Hub dashboard'
      },
      {
        name: 'instanceId',
        label: 'Instance ID',
        type: 'text',
        required: true,
        placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        helpText: 'Configuration instance ID'
      }
    ]
  },
  WeatherAPI: {
    service: 'WeatherAPI',
    displayName: 'Weather API',
    description: 'Weather forecasts and historical data',
    icon: '🌤️',
    testable: true,
    documentation: 'https://www.weatherapi.com/docs/',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        required: true,
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        helpText: 'Get your API key from weatherapi.com'
      }
    ]
  },
  CustomEndpoint: {
    service: 'CustomEndpoint',
    displayName: 'Custom API Endpoint',
    description: 'Custom REST API or webhook',
    icon: '🔌',
    testable: false,
    fields: [
      {
        name: 'url',
        label: 'Endpoint URL',
        type: 'url',
        required: true,
        placeholder: 'https://api.example.com/v1',
        helpText: 'Full URL of your API endpoint'
      },
      {
        name: 'apiKey',
        label: 'API Key/Token',
        type: 'password',
        required: false,
        placeholder: 'Bearer token or API key',
        helpText: 'Authentication token if required'
      },
      {
        name: 'authType',
        label: 'Authentication Type',
        type: 'select',
        required: true,
        options: [
          { value: 'none', label: 'None' },
          { value: 'bearer', label: 'Bearer Token' },
          { value: 'apikey', label: 'API Key Header' },
          { value: 'basic', label: 'Basic Auth' }
        ]
      }
    ]
  }
};
