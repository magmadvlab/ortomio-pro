/**
 * Storage Provider Factory
 * Creates the appropriate storage provider based on tier and availability
 */

import { IStorageProvider } from './interface';
import { LocalStorageProvider } from '../../storage-local/LocalStorageProvider';
import { SupabaseStorageProvider } from '../../storage-cloud/SupabaseStorageProvider';
import { isSupabaseAvailable } from '@/config/supabase';

export type StorageProviderType = 'local' | 'cloud' | 'auto';

/**
 * Create storage provider based on type
 * 'auto' will use Supabase if available, otherwise localStorage
 */
export const createStorageProvider = (type: StorageProviderType = 'auto'): IStorageProvider => {
  switch (type) {
    case 'local':
      return new LocalStorageProvider();
    
    case 'cloud':
      if (!isSupabaseAvailable()) {
        console.warn('Supabase not available, falling back to localStorage');
        return new LocalStorageProvider();
      }
      return new SupabaseStorageProvider();
    
    case 'auto':
    default:
      // Try Supabase first, fallback to localStorage
      if (isSupabaseAvailable()) {
        return new SupabaseStorageProvider();
      }
      return new LocalStorageProvider();
  }
};

/**
 * Get default storage provider (auto-detect)
 */
export const getDefaultStorageProvider = (): IStorageProvider => {
  return createStorageProvider('auto');
};

