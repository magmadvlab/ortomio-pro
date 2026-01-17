/**
 * Plant Photo Timeline
 * Timeline fotografica per singola pianta con upload e visualizzazione
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Camera, Upload, X, Calendar, Tag, Eye, Trash2, Download, ZoomIn } from 'lucide-react'
import { PlantPhoto, PhotoUploadRequest } from '@/types/plantMonitoring'
import { plantPhotoService } from '@/services/plantMonitoringService'

interface PlantPhotoTimelineProps {
  plantId: string
  gardenId: string
  onPhotoUploaded?: (photo: PlantPhoto) => void
}

export default function PlantPhotoTimeline({
  plantId,
  gardenId,
  onPhotoUploaded
}: PlantPhotoTimelineProps) {
  const [photos, setPhotos] = useState<PlantPhoto[]>([])
  const [timeline, setTimeline] = useState<Array<{ date: string; photos: PlantPhoto[] }>>([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<PlantPhoto | null>(null)
  const [uploadData, setUploadData] = useState<Partial<PhotoUploadRequest>>({
    photoType: 'general'
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    loadPhotos()
  }, [plantId])

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [selectedFile])

  const loadPhotos = async () => {
    try {
      setLoading(true)
      const loadedPhotos = await plantPhotoService.getPlantPhotos(plantId)
      setPhotos(loadedPhotos)
      
      const timelineData = await plantPhotoService.getPhotoTimeline(plantId)
      setTimeline(timelineData)
    } catch (error) {
      console.error('Error loading photos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      const request: PhotoUploadRequest = {
        plantId,
        gardenId,
        file: selectedFile,
        photoType: uploadData.photoType || 'general',
        notes: uploadData.notes,
        tags: uploadData.tags
      }

      const photo = await plantPhotoService.uploadPhoto(request)
      
      setPhotos(prev => [photo, ...prev])
      setShowUploadModal(false)
      setSelectedFile(null)
      setPreviewUrl('')
      setUploadData({ photoType: 'general' })
      
      if (onPhotoUploaded) {
        onPhotoUploaded(photo)
      }
      
      await loadPhotos()
    } catch (error) {
      console.error('Error uploading photo:', error)
      alert('Errore durante il caricamento della foto')
    }
  }

  const getPhotoTypeLabel = (type: PlantPhoto['photoType']) => {
    const labels: Record<PlantPhoto['photoType'], string> = {
      general: 'Generale',
      health_issue: 'Problema Salute',
      treatment_before: 'Prima Trattamento',
      treatment_after: 'Dopo Trattamento',
      maturity_check: 'Controllo Maturazione',
      harvest: 'Raccolta',
      growth_progress: 'Crescita',
      brix_measurement: 'Misurazione Brix'
    }
    return labels[type]
  }

  const getPhotoTypeColor = (type: PlantPhoto['photoType']) => {
    const colors: Record<PlantPhoto['photoType'], string> = {
      general: 'bg-gray-100 text-gray-700',
      health_issue: 'bg-red-100 text-red-700',
      treatment_before: 'bg-orange-100 text-orange-700',
      treatment_after: 'bg-green-100 text-green-700',
      maturity_check: 'bg-purple-100 text-purple-700',
      harvest: 'bg-blue-100 text-blue-700',
      growth_progress: 'bg-teal-100 text-teal-700',
      brix_measurement: 'bg-yellow-100 text-yellow-700'
    }
    return colors[type]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Caricamento foto...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con pulsante upload */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Timeline Fotografica</h3>
          <p className="text-sm text-gray-600">{photos.length} foto totali</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Camera size={18} />
          Aggiungi Foto
        </button>
      </div>

      {/* Timeline */}
      {timeline.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Camera size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium mb-2">Nessuna foto ancora</p>
          <p className="text-sm text-gray-500 mb-4">Inizia a documentare la crescita della pianta</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Camera size={18} />
            Carica Prima Foto
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {timeline.map((day, index) => (
            <div key={day.date} className="relative">
              {/* Linea timeline */}
              {index < timeline.length - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
              )}
              
              {/* Data */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full border-4 border-white shadow-sm z-10">
                  <Calendar size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {new Date(day.date).toLocaleDateString('it-IT', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600">{day.photos.length} foto</p>
                </div>
              </div>

              {/* Foto del giorno */}
              <div className="ml-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {day.photos.map(photo => (
                  <div
                    key={photo.id}
                    className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    {/* Immagine */}
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={photo.url}
                        alt={`Foto ${photo.photoType}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Overlay hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                      <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
                    </div>

                    {/* Info */}
                    <div className="p-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPhotoTypeColor(photo.photoType)}`}>
                        {getPhotoTypeLabel(photo.photoType)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(photo.capturedAt).toLocaleTimeString('it-IT', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {photo.aiAnalysis && (
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          <span className="text-xs text-blue-600">AI analizzata</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Carica Nuova Foto</h3>
                <button
                  onClick={() => {
                    setShowUploadModal(false)
                    setSelectedFile(null)
                    setPreviewUrl('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* File input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleziona Foto
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded" />
                      ) : (
                        <>
                          <Upload size={48} className="mx-auto text-gray-400 mb-2" />
                          <p className="text-gray-600">Click per selezionare o trascina qui</p>
                          <p className="text-sm text-gray-500 mt-1">JPG, PNG, HEIC fino a 10MB</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Tipo foto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo Foto
                  </label>
                  <select
                    value={uploadData.photoType}
                    onChange={(e) => setUploadData(prev => ({ ...prev, photoType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="general">Generale</option>
                    <option value="health_issue">Problema Salute</option>
                    <option value="treatment_before">Prima Trattamento</option>
                    <option value="treatment_after">Dopo Trattamento</option>
                    <option value="maturity_check">Controllo Maturazione</option>
                    <option value="harvest">Raccolta</option>
                    <option value="growth_progress">Crescita</option>
                    <option value="brix_measurement">Misurazione Brix</option>
                  </select>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note (opzionale)
                  </label>
                  <textarea
                    value={uploadData.notes || ''}
                    onChange={(e) => setUploadData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    placeholder="Aggiungi note o osservazioni..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Pulsanti */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowUploadModal(false)
                      setSelectedFile(null)
                      setPreviewUrl('')
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Carica Foto
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visualizzazione Foto */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="max-w-6xl w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="text-white">
                <p className="text-lg font-semibold">{getPhotoTypeLabel(selectedPhoto.photoType)}</p>
                <p className="text-sm text-gray-300">
                  {new Date(selectedPhoto.capturedAt).toLocaleString('it-IT')}
                </p>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-white hover:text-gray-300"
              >
                <X size={32} />
              </button>
            </div>
            
            <img
              src={selectedPhoto.url}
              alt="Foto pianta"
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />
            
            {selectedPhoto.notes && (
              <div className="mt-4 bg-white bg-opacity-10 rounded-lg p-4">
                <p className="text-white">{selectedPhoto.notes}</p>
              </div>
            )}
            
            {selectedPhoto.aiAnalysis && (
              <div className="mt-4 bg-blue-900 bg-opacity-50 rounded-lg p-4">
                <p className="text-white font-semibold mb-2">Analisi AI</p>
                <p className="text-white">Health Score: {selectedPhoto.aiAnalysis.healthScore}/100</p>
                {selectedPhoto.aiAnalysis.detectedIssues && selectedPhoto.aiAnalysis.detectedIssues.length > 0 && (
                  <div className="mt-2">
                    <p className="text-white text-sm">Problemi rilevati:</p>
                    <ul className="text-white text-sm list-disc list-inside">
                      {selectedPhoto.aiAnalysis.detectedIssues.map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
