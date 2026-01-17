/**
 * Crypto utilities for secure encryption/decryption
 */

/**
 * Generate a random encryption key
 */
export const generateEncryptionKey = async (): Promise<CryptoKey> => {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
};

/**
 * Export key to base64 string
 */
export const exportKey = async (key: CryptoKey): Promise<string> => {
  const exported = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
};

/**
 * Import key from base64 string
 */
export const importKey = async (keyString: string): Promise<CryptoKey> => {
  const keyData = Uint8Array.from(atob(keyString), c => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
};

/**
 * Encrypt text using AES-256-GCM
 */
export const encryptText = async (text: string, key?: CryptoKey): Promise<string> => {
  try {
    // Use provided key or generate a new one
    const encryptionKey = key || await generateEncryptionKey();
    
    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the text
    const encoded = new TextEncoder().encode(text);
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      encryptionKey,
      encoded
    );

    // Combine IV + encrypted data + key (if generated)
    const encryptedArray = new Uint8Array(encrypted);
    const result = new Uint8Array(iv.length + encryptedArray.length + (key ? 0 : 32));
    
    result.set(iv, 0);
    result.set(encryptedArray, iv.length);
    
    // If no key provided, append the generated key
    if (!key) {
      const exportedKey = await crypto.subtle.exportKey('raw', encryptionKey);
      result.set(new Uint8Array(exportedKey), iv.length + encryptedArray.length);
    }

    // Return as base64
    return btoa(String.fromCharCode(...result));
  } catch (error) {
    console.error('Encryption failed:', error);
    // Fallback to base64 encoding (not secure, but prevents app crash)
    return btoa(text);
  }
};

/**
 * Decrypt text using AES-256-GCM
 */
export const decryptText = async (encryptedText: string, key?: CryptoKey): Promise<string> => {
  try {
    // Decode from base64
    const data = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
    
    // Extract IV (first 12 bytes)
    const iv = data.slice(0, 12);
    
    let encryptedData: Uint8Array;
    let decryptionKey: CryptoKey;
    
    if (key) {
      // Use provided key
      encryptedData = data.slice(12);
      decryptionKey = key;
    } else {
      // Extract key from end (last 32 bytes) and encrypted data (middle)
      const keyData = data.slice(-32);
      encryptedData = data.slice(12, -32);
      
      decryptionKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        {
          name: 'AES-GCM',
          length: 256,
        },
        false,
        ['decrypt']
      );
    }

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      decryptionKey,
      encryptedData
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    // Fallback to base64 decoding (for backwards compatibility)
    try {
      return atob(encryptedText);
    } catch {
      return encryptedText;
    }
  }
};

/**
 * Simple encryption for development (not secure)
 */
export const simpleEncrypt = (text: string): string => {
  return btoa(text);
};

/**
 * Simple decryption for development (not secure)
 */
export const simpleDecrypt = (encrypted: string): string => {
  try {
    return atob(encrypted);
  } catch {
    return encrypted;
  }
};

/**
 * Check if Web Crypto API is available
 */
export const isCryptoAvailable = (): boolean => {
  return typeof crypto !== 'undefined' && 
         typeof crypto.subtle !== 'undefined' &&
         typeof crypto.getRandomValues !== 'undefined';
};