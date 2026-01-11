/**
 * Social Sharing Service
 * Gestisce la condivisione di achievement, challenge e progressi sui social media
 */

export interface ShareableContent {
  type: 'achievement' | 'challenge' | 'harvest' | 'milestone'
  title: string
  description: string
  image?: string
  stats?: {
    level?: number
    xp?: number
    streak?: number
    harvestWeight?: number
    plantsCount?: number
  }
  badge?: {
    emoji: string
    name: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
  }
}

export interface SocialPlatform {
  name: string
  icon: string
  color: string
  shareUrl: (content: ShareableContent, url: string, hashtags: string[]) => string
}

// Piattaforme social supportate
export const SOCIAL_PLATFORMS: Record<string, SocialPlatform> = {
  facebook: {
    name: 'Facebook',
    icon: '📘',
    color: '#1877F2',
    shareUrl: (content, url, hashtags) => {
      const text = generateShareText(content, hashtags)
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`
    }
  },
  twitter: {
    name: 'Twitter/X',
    icon: '🐦',
    color: '#1DA1F2',
    shareUrl: (content, url, hashtags) => {
      const text = generateShareText(content, hashtags)
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    }
  },
  instagram: {
    name: 'Instagram',
    icon: '📸',
    color: '#E4405F',
    shareUrl: (content, url, hashtags) => {
      // Instagram non supporta condivisione diretta via URL, ma possiamo copiare il testo
      return 'copy-text'
    }
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: '💬',
    color: '#25D366',
    shareUrl: (content, url, hashtags) => {
      const text = generateShareText(content, hashtags)
      return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`
    }
  },
  telegram: {
    name: 'Telegram',
    icon: '✈️',
    color: '#0088CC',
    shareUrl: (content, url, hashtags) => {
      const text = generateShareText(content, hashtags)
      return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
    }
  }
}

// Genera il testo per la condivisione
function generateShareText(content: ShareableContent, hashtags: string[]): string {
  const { type, title, description, stats, badge } = content
  
  let text = ''
  
  switch (type) {
    case 'achievement':
      text = `🏆 Ho sbloccato un nuovo traguardo in OrtoMio!\n\n${badge?.emoji || '🎯'} ${title}\n${description}`
      if (stats?.level) {
        text += `\n\n📊 Livello: ${stats.level}`
      }
      if (stats?.xp) {
        text += ` • XP: ${stats.xp}`
      }
      break
      
    case 'challenge':
      text = `🎯 Sfida completata in OrtoMio!\n\n${title}\n${description}`
      if (stats?.streak) {
        text += `\n\n🔥 Streak: ${stats.streak} giorni consecutivi!`
      }
      break
      
    case 'harvest':
      text = `🌱 Raccolto del giorno in OrtoMio!\n\n${title}`
      if (stats?.harvestWeight) {
        text += `\n📦 Peso: ${stats.harvestWeight} kg`
      }
      if (stats?.plantsCount) {
        text += ` • ${stats.plantsCount} piante`
      }
      text += `\n\n${description}`
      break
      
    case 'milestone':
      text = `🎉 Traguardo raggiunto in OrtoMio!\n\n${title}\n${description}`
      if (stats?.level) {
        text += `\n\n🌟 Livello ${stats.level} raggiunto!`
      }
      break
  }
  
  // Aggiungi hashtags
  if (hashtags.length > 0) {
    text += `\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`
  }
  
  return text
}

// Genera hashtags automatici basati sul contenuto
export function generateHashtags(content: ShareableContent): string[] {
  const baseHashtags = ['OrtoMio', 'OrtoIntelligente', 'Giardinaggio']
  
  switch (content.type) {
    case 'achievement':
      return [...baseHashtags, 'Achievement', 'Traguardo', 'PoliceVerde']
      
    case 'challenge':
      return [...baseHashtags, 'Sfida', 'Challenge', 'Motivazione']
      
    case 'harvest':
      return [...baseHashtags, 'Raccolto', 'Harvest', 'OrtoFresh', 'KmZero']
      
    case 'milestone':
      return [...baseHashtags, 'Milestone', 'Livello', 'Crescita']
      
    default:
      return baseHashtags
  }
}

// Crea URL di condivisione per una piattaforma specifica
export function createShareUrl(
  platform: string, 
  content: ShareableContent, 
  baseUrl: string = 'https://ortomio.ai'
): string {
  const socialPlatform = SOCIAL_PLATFORMS[platform]
  if (!socialPlatform) {
    throw new Error(`Piattaforma social non supportata: ${platform}`)
  }
  
  const hashtags = generateHashtags(content)
  const shareUrl = `${baseUrl}/share/${content.type}/${Date.now()}`
  
  return socialPlatform.shareUrl(content, shareUrl, hashtags)
}

// Copia testo negli appunti (per Instagram e altre piattaforme)
export async function copyShareText(content: ShareableContent): Promise<boolean> {
  try {
    const hashtags = generateHashtags(content)
    const text = generateShareText(content, hashtags)
    
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback per browser più vecchi
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const success = document.execCommand('copy')
      textArea.remove()
      return success
    }
  } catch (error) {
    console.error('Errore nella copia del testo:', error)
    return false
  }
}

// Genera immagine di condivisione (placeholder per futura implementazione)
export function generateShareImage(content: ShareableContent): Promise<string> {
  // TODO: Implementare generazione immagine con Canvas API o servizio esterno
  // Per ora ritorniamo un placeholder
  return Promise.resolve('/images/share-placeholder.jpg')
}

// Traccia condivisioni per analytics
export function trackShare(platform: string, contentType: string, contentId: string): void {
  // TODO: Integrare con sistema di analytics
  console.log(`Condivisione tracciata: ${platform} - ${contentType} - ${contentId}`)
  
  // Salva in localStorage per statistiche locali
  const shares = JSON.parse(localStorage.getItem('ortomio_shares') || '[]')
  shares.push({
    platform,
    contentType,
    contentId,
    timestamp: new Date().toISOString()
  })
  
  // Mantieni solo le ultime 100 condivisioni
  if (shares.length > 100) {
    shares.splice(0, shares.length - 100)
  }
  
  localStorage.setItem('ortomio_shares', JSON.stringify(shares))
}

// Ottieni statistiche condivisioni
export function getShareStats(): {
  total: number
  byPlatform: Record<string, number>
  byType: Record<string, number>
  recent: Array<{ platform: string; contentType: string; timestamp: string }>
} {
  const shares = JSON.parse(localStorage.getItem('ortomio_shares') || '[]')
  
  const byPlatform: Record<string, number> = {}
  const byType: Record<string, number> = {}
  
  shares.forEach((share: any) => {
    byPlatform[share.platform] = (byPlatform[share.platform] || 0) + 1
    byType[share.contentType] = (byType[share.contentType] || 0) + 1
  })
  
  return {
    total: shares.length,
    byPlatform,
    byType,
    recent: shares.slice(-10).reverse()
  }
}