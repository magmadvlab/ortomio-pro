/**
 * Photo Capture Component
 * Componente per catturare foto da associare ai traguardi e condivisioni social
 */

'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Camera, X, RotateCcw, Check, Download } from 'lucide-react'

interface PhotoCaptureProps {
  isOpen: boolean
  onClose: () => void
  onPhotoTaken: (photoDataUrl: string) => void
  title?: string
}

export function PhotoCapture({ 
  isOpen, 
  onClose, 
  onPhotoTaken, 
  title = "Scatta una foto del tuo traguardo" 
}: PhotoCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Usa camera posteriore se disponibile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error('Errore accesso camera:', err)
      setError('Impossibile accedere alla camera. Verifica i permessi.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Imposta dimensioni canvas uguali al video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Disegna il frame corrente del video sul canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Converti in data URL
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedPhoto(photoDataUrl)
  }, [])

  const retakePhoto = useCallback(() => {
    setCapturedPhoto(null)
  }, [])

  const confirmPhoto = useCallback(() => {
    if (capturedPhoto) {
      onPhotoTaken(capturedPhoto)
      handleClose()
    }
  }, [capturedPhoto, onPhotoTaken])

  const handleClose = useCallback(() => {
    stopCamera()
    setCapturedPhoto(null)
    setError(null)
    onClose()
  }, [stopCamera, onClose])

  // Avvia camera quando il modal si apre
  React.useEffect(() => {
    if (isOpen && !stream && !capturedPhoto) {
      startCamera()
    }
  }, [isOpen, stream, capturedPhoto, startCamera])

  // Pulisci quando il componente si smonta
  React.useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-[90vw] md:max-w-md max-h-[90vh] overflow-y-auto w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={handleClose}
            className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Camera/Photo Area */}
        <div className="relative bg-black">
          {error ? (
            <div className="aspect-video flex items-center justify-center p-8">
              <div className="text-center text-white">
                <Camera size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-sm">{error}</p>
                <button
                  onClick={startCamera}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Riprova
                </button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="aspect-video flex items-center justify-center">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-sm">Avvio camera...</p>
              </div>
            </div>
          ) : capturedPhoto ? (
            <div className="relative">
              <img 
                src={capturedPhoto} 
                alt="Foto catturata" 
                className="w-full aspect-video object-cover"
              />
            </div>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full aspect-video object-cover"
              />
              
              {/* Overlay con griglia */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full border-2 border-white/30 grid grid-cols-1 md:grid-cols-3 grid-rows-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="border border-white/20" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Canvas nascosto per cattura */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="p-4">
          {capturedPhoto ? (
            <div className="flex gap-3">
              <button
                onClick={retakePhoto}
                className="flex-1 flex items-center justify-center gap-3 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RotateCcw size={18} />
                Rifai
              </button>
              <button
                onClick={confirmPhoto}
                className="flex-1 flex items-center justify-center gap-3 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check size={18} />
                Conferma
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={capturePhoto}
                disabled={!stream || isLoading}
                className="w-16 h-16 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-12 h-12 bg-gray-300 rounded-full" />
              </button>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="px-4 pb-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              💡 <strong>Suggerimento:</strong> Inquadra le tue piante, il raccolto o l'orto per rendere la condivisione più interessante!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook per gestire la cattura foto
export function usePhotoCapture() {
  const [isOpen, setIsOpen] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)

  const openCamera = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeCamera = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handlePhotoTaken = useCallback((photoDataUrl: string) => {
    setCapturedPhoto(photoDataUrl)
    setIsOpen(false)
  }, [])

  const clearPhoto = useCallback(() => {
    setCapturedPhoto(null)
  }, [])

  return {
    isOpen,
    capturedPhoto,
    openCamera,
    closeCamera,
    handlePhotoTaken,
    clearPhoto,
    PhotoCaptureComponent: (props: Omit<PhotoCaptureProps, 'isOpen' | 'onClose' | 'onPhotoTaken'>) => (
      <PhotoCapture
        {...props}
        isOpen={isOpen}
        onClose={closeCamera}
        onPhotoTaken={handlePhotoTaken}
      />
    )
  }
}