'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Garden } from '@/types'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { X, Camera, Upload, RotateCcw, Check } from 'lucide-react'

interface PhotoCaptureModalProps {
  garden: Garden
  isOpen: boolean
  onClose: () => void
  onPhotoSaved?: (photoUrl: string) => void
}

export function PhotoCaptureModal({ 
  garden, 
  isOpen, 
  onClose, 
  onPhotoSaved 
}: PhotoCaptureModalProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState('')
  const [location, setLocation] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { storageProvider } = useStorage()

  const startCamera = useCallback(async () => {
    try {
      setIsCapturing(true)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Usa camera posteriore se disponibile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Impossibile accedere alla fotocamera. Verifica i permessi del browser.')
      setIsCapturing(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCapturing(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Imposta le dimensioni del canvas
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Disegna il frame corrente del video sul canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Converti in base64
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedImage(imageDataUrl)
    stopCamera()
  }, [stopCamera])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setCapturedImage(result)
    }
    reader.readAsDataURL(file)
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    startCamera()
  }

  const savePhoto = async () => {
    if (!capturedImage) return

    setSaving(true)
    try {
      // Simula il salvataggio della foto
      // In un'implementazione reale, qui caricheresti l'immagine su un server o storage
      const photoId = `photo_${Date.now()}`
      
      // Crea un entry nel diario se il metodo esiste
      if ('createJournalEntry' in storageProvider) {
        await (storageProvider as any).createJournalEntry({
          gardenId: garden.id,
          type: 'photo',
          title: `Foto del ${new Date().toLocaleDateString('it-IT')}`,
          content: notes || 'Foto scattata dall\'app',
          location: location || 'Non specificato',
          photoUrl: capturedImage, // In produzione sarebbe un URL del server
          createdAt: new Date().toISOString()
        })
      }

      // Reset form
      setCapturedImage(null)
      setNotes('')
      setLocation('')
      
      onPhotoSaved?.(capturedImage)
      onClose()
      
      alert('Foto salvata con successo!')
    } catch (error) {
      console.error('Error saving photo:', error)
      alert('Errore durante il salvataggio della foto')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    stopCamera()
    setCapturedImage(null)
    setNotes('')
    setLocation('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-3">
              <Camera className="text-purple-600" size={24} />
              Scatta Foto
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {!capturedImage ? (
            <div className="space-y-4">
              {/* Camera View */}
              {isCapturing ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg bg-black"
                    style={{ maxHeight: '300px' }}
                  />
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={capturePhoto}
                      className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition-colors"
                    >
                      <Camera size={24} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="text-6xl mb-4">📷</div>
                  <p className="text-gray-600 mb-6">
                    Scatta una foto delle tue piante per documentare la crescita
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={startCamera}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-3"
                    >
                      <Camera size={20} />
                      Usa Fotocamera
                    </button>
                    
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
                    >
                      <Upload size={20} />
                      Carica da Galleria
                    </button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="Foto catturata"
                  className="w-full rounded-lg"
                  style={{ maxHeight: '300px', objectFit: 'cover' }}
                />
              </div>

              {/* Form */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Posizione (opzionale)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="es. Aiuola Nord, Filare 3..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note (opzionale)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="Descrivi cosa vedi nella foto..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={retakePhoto}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
                >
                  <RotateCcw size={16} />
                  Rifai
                </button>
                <button
                  onClick={savePhoto}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <Check size={16} />
                  {saving ? 'Salvando...' : 'Salva'}
                </button>
              </div>
            </div>
          )}

          {/* Hidden canvas for photo capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  )
}