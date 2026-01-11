/**
 * Social Share Modal
 * Modal per condividere achievement, challenge e progressi sui social media
 */

'use client'

import React, { useState, useEffect } from 'react'
import { X, Copy, Check, Share2, Camera, Download, Trash2 } from 'lucide-react'
import { 
  ShareableContent, 
  SOCIAL_PLATFORMS, 
  createShareUrl, 
  copyShareText, 
  trackShare,
  generateHashtags 
} from '@/services/socialSharingService'
import { PhotoCapture, usePhotoCapture } from './PhotoCapture'

interface SocialShareModalProps {
  isOpen: boolean
  onClose: () => void
  content: ShareableContent
  userPhoto?: string
  onPhotoCapture?: () => void
}

export function SocialShareModal({ 
  isOpen, 
  onClose, 
  content, 
  userPhoto: initialUserPhoto,
  onPhotoCapture 
}: SocialShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  
  const { 
    isOpen: isCameraOpen, 
    capturedPhoto, 
    openCamera, 
    closeCamera, 
    handlePhotoTaken, 
    clearPhoto,
    PhotoCaptureComponent 
  } = usePhotoCapture()

  // Usa la foto catturata o quella passata come prop
  const userPhoto = capturedPhoto || initialUserPhoto

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [copied])

  if (!isOpen) return null

  const handleShare = async (platform: string) => {
    try {
      const shareUrl = createShareUrl(platform, content)
      
      if (shareUrl === 'copy-text') {
        // Per Instagram e altre piattaforme che non supportano condivisione diretta
        const success = await copyShareText(content)
        if (success) {
          setCopied(true)
          trackShare(platform, content.type, content.title)
        }
      } else {
        // Apri la finestra di condivisione
        window.open(shareUrl, '_blank', 'width=600,height=400')
        trackShare(platform, content.type, content.title)
      }
    } catch (error) {
      console.error('Errore nella condivisione:', error)
    }
  }

  const handleCopyText = async () => {
    const success = await copyShareText(content)
    if (success) {
      setCopied(true)
    }
  }

  const getContentEmoji = () => {
    switch (content.type) {
      case 'achievement': return content.badge?.emoji || '🏆'
      case 'challenge': return '🎯'
      case 'harvest': return '🌱'
      case 'milestone': return '🎉'
      default: return '🌟'
    }
  }

  const getContentColor = () => {
    switch (content.type) {
      case 'achievement': return 'from-yellow-400 to-orange-500'
      case 'challenge': return 'from-purple-400 to-pink-500'
      case 'harvest': return 'from-green-400 to-blue-500'
      case 'milestone': return 'from-blue-400 to-purple-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  const hashtags = generateHashtags(content)

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-[90vw] md:max-w-md max-h-[90vh] overflow-y-auto w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getContentColor()} flex items-center justify-center text-white text-xl`}>
                <Share2 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Condividi Traguardo</h2>
                <p className="text-sm text-gray-600">Mostra i tuoi progressi!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content Preview */}
          <div className="p-6 border-b border-gray-200">
            <div className={`bg-gradient-to-br ${getContentColor()} rounded-xl p-6 text-white relative overflow-hidden`}>
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 text-6xl">{getContentEmoji()}</div>
                <div className="absolute bottom-4 left-4 text-4xl">🌱</div>
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">{getContentEmoji()}</div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold">{content.title}</h3>
                    <p className="text-white/90 text-sm">{content.description}</p>
                  </div>
                </div>
                
                {/* Stats */}
                {content.stats && (
                  <div className="flex gap-4 text-sm">
                    {content.stats.level && (
                      <span className="bg-white/20 px-3 py-1 rounded-full">
                        Livello {content.stats.level}
                      </span>
                    )}
                    {content.stats.xp && (
                      <span className="bg-white/20 px-3 py-1 rounded-full">
                        {content.stats.xp} XP
                      </span>
                    )}
                    {content.stats.streak && (
                      <span className="bg-white/20 px-3 py-1 rounded-full">
                        🔥 {content.stats.streak} giorni
                      </span>
                    )}
                  </div>
                )}
                
                {/* OrtoMio Branding */}
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">OrtoMio AI</span>
                    <span className="text-xs text-white/80">🌱 Orto Intelligente</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Section */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Aggiungi Foto</h4>
                <div className="flex gap-3">
                  <button
                    onClick={openCamera}
                    className="flex items-center gap-3 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    <Camera size={16} />
                    Scatta Foto
                  </button>
                  {onPhotoCapture && (
                    <button
                      onClick={onPhotoCapture}
                      className="flex items-center gap-3 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                    >
                      <Camera size={16} />
                      Galleria
                    </button>
                  )}
                </div>
              </div>
              
              {userPhoto && (
                <div className="relative">
                  <img 
                    src={userPhoto} 
                    alt="Foto del traguardo" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute top-3 right-2 flex gap-3">
                    <button 
                      onClick={clearPhoto}
                      className="p-3.5 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors"
                      title="Rimuovi foto"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button className="p-3.5 bg-white/90 rounded-lg hover:bg-white transition-colors">
                      <Download size={14} className="text-gray-700" />
                    </button>
                  </div>
                </div>
              )}
              
              {!userPhoto && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Camera size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    Aggiungi una foto per rendere la condivisione più coinvolgente
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Social Platforms */}
          <div className="p-6">
            <h4 className="font-medium text-gray-900 mb-4">Condividi su:</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {Object.entries(SOCIAL_PLATFORMS).map(([key, platform]) => (
                <button
                  key={key}
                  onClick={() => handleShare(key)}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  style={{ borderColor: selectedPlatform === key ? platform.color : undefined }}
                >
                  <span className="text-lg md:text-xl">{platform.icon}</span>
                  <span className="font-medium text-gray-900">{platform.name}</span>
                </button>
              ))}
            </div>

            {/* Copy Text Button */}
            <button
              onClick={handleCopyText}
              className="w-full flex items-center justify-center gap-3 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check size={18} className="text-green-600" />
                  <span className="font-medium text-green-600">Testo Copiato!</span>
                </>
              ) : (
                <>
                  <Copy size={18} className="text-gray-600" />
                  <span className="font-medium text-gray-900">Copia Testo</span>
                </>
              )}
            </button>

            {/* Hashtags Preview */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Hashtags inclusi:</p>
              <div className="flex flex-wrap gap-3">
                {hashtags.map((tag, index) => (
                  <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Capture Modal */}
      <PhotoCaptureComponent 
        title="Scatta una foto del tuo traguardo"
      />
    </>
  )
}