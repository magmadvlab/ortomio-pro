/**
 * Device Detection Service
 * Rileva primo avvio e nuovo dispositivo
 * Genera e traccia device ID univoco
 */

const DEVICE_ID_KEY = 'ortomio_device_id';
const FIRST_LAUNCH_KEY = 'ortomio_first_launch';
const LAST_DEVICE_ID_KEY = 'ortomio_last_device_id';

/**
 * Ottiene o genera device ID univoco
 */
export function getDeviceId(): string {
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    
    if (!deviceId) {
      // Genera nuovo device ID
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
      localStorage.setItem(FIRST_LAUNCH_KEY, 'true');
    }
    
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    // Fallback: genera ID temporaneo
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Verifica se è il primo avvio dell'app
 */
export function isFirstLaunch(): boolean {
  try {
    const firstLaunch = localStorage.getItem(FIRST_LAUNCH_KEY);
    return firstLaunch === 'true';
  } catch (error) {
    console.error('Error checking first launch:', error);
    return false;
  }
}

/**
 * Marca launch come completato
 */
export function markLaunchComplete(): void {
  try {
    localStorage.setItem(FIRST_LAUNCH_KEY, 'false');
    
    // Salva device ID corrente come ultimo conosciuto
    const currentDeviceId = getDeviceId();
    localStorage.setItem(LAST_DEVICE_ID_KEY, currentDeviceId);
  } catch (error) {
    console.error('Error marking launch complete:', error);
  }
}

/**
 * Verifica se il dispositivo è cambiato rispetto all'ultimo avvio
 */
export function isDeviceChanged(): boolean {
  try {
    const currentDeviceId = getDeviceId();
    const lastDeviceId = localStorage.getItem(LAST_DEVICE_ID_KEY);
    
    if (!lastDeviceId) {
      // Prima volta, non è cambiato
      return false;
    }
    
    return currentDeviceId !== lastDeviceId;
  } catch (error) {
    console.error('Error checking device change:', error);
    return false;
  }
}

/**
 * Ottiene informazioni dispositivo
 */
export function getDeviceInfo(): {
  deviceId: string;
  isFirstLaunch: boolean;
  isDeviceChanged: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'web';
  userAgent: string;
} {
  const deviceId = getDeviceId();
  const firstLaunch = isFirstLaunch();
  const deviceChanged = isDeviceChanged();
  
  // Rileva piattaforma
  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent.toLowerCase() : '';
  let platform: 'ios' | 'android' | 'desktop' | 'web' = 'web';
  
  if (/iphone|ipad|ipod/.test(userAgent)) {
    platform = 'ios';
  } else if (/android/.test(userAgent)) {
    platform = 'android';
  } else if (typeof window !== 'undefined' && window.navigator.platform) {
    const platformStr = window.navigator.platform.toLowerCase();
    if (platformStr.includes('win') || platformStr.includes('mac') || platformStr.includes('linux')) {
      platform = 'desktop';
    }
  }
  
  return {
    deviceId,
    isFirstLaunch: firstLaunch,
    isDeviceChanged: deviceChanged,
    platform,
    userAgent,
  };
}

/**
 * Reset device detection (per testing)
 */
export function resetDeviceDetection(): void {
  try {
    localStorage.removeItem(DEVICE_ID_KEY);
    localStorage.removeItem(FIRST_LAUNCH_KEY);
    localStorage.removeItem(LAST_DEVICE_ID_KEY);
  } catch (error) {
    console.error('Error resetting device detection:', error);
  }
}


