/**
 * Storage Provider Factory
 * Creates the appropriate storage provider based on tier and availability.
 * Priority: Supabase > localStorage. 'auto' does NOT pick Neon right now:
 * NeonStorageProvider only implements gardens/zones/individual_plants/
 * field_alerts, so letting 'auto' pick it (whenever DATABASE_URL happens to
 * be set) put half the app's writes on Neon and half on Supabase, which is
 * not an acceptable split state. Everything stays on Supabase until Neon
 * gets a real, complete migration; pass type 'neon' explicitly to opt in
 * for the domains it does support.
 */

import { IStorageProvider } from './interface';
import { LocalStorageProvider } from '../../storage-local/LocalStorageProvider';
import { SupabaseStorageProvider } from '../../storage-cloud/SupabaseStorageProvider';
import { isSupabaseAvailable } from '@/config/supabase';

export type StorageProviderType = 'local' | 'cloud' | 'neon' | 'auto';

function isNeonAvailable(): boolean {
  return typeof process !== 'undefined' && !!process.env.DATABASE_URL;
}

function createNeonProvider(): IStorageProvider {
  // Dynamic require keeps this server-only module out of the client bundle
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { NeonStorageProvider } = require('../../storage-neon/NeonStorageProvider');
  return new NeonStorageProvider();
}

/**
 * Create storage provider based on type.
 * 'auto' uses Supabase, then localStorage. Neon is only used when 'neon' is
 * requested explicitly (see module comment above).
 */
export const createStorageProvider = (type: StorageProviderType = 'auto'): IStorageProvider => {
  switch (type) {
    case 'local':
      return new LocalStorageProvider();

    case 'neon':
      if (!isNeonAvailable()) {
        console.warn('Neon not available (DATABASE_URL missing), falling back to localStorage');
        return new LocalStorageProvider();
      }
      return createNeonProvider();

    case 'cloud':
      if (!isSupabaseAvailable()) {
        console.warn('Supabase not available, falling back to localStorage');
        return new LocalStorageProvider();
      }
      return new SupabaseStorageProvider();

    case 'auto':
    default:
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

/**
 * Get Supabase storage provider
 */
export const getSupabaseStorageProvider = (): IStorageProvider | null => {
  if (!isSupabaseAvailable()) {
    return null;
  }
  return new SupabaseStorageProvider();
};

/**
 * Get LocalStorage provider
 */
export const getLocalStorageProvider = (): IStorageProvider => {
  return new LocalStorageProvider();
};

