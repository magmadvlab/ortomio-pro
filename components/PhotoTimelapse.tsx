/**
 * Photo Timelapse Component
 * Displays progressive photos of a plant with AI analysis
 * Pro Feature
 */

import React, { useState, useEffect } from 'react';
import { PlantPhotoLog } from '../types';
import { PhotoLogService } from '../services/photoLogService';
import { Camera, ChevronLeft, ChevronRight, Calendar, Leaf, AlertTriangle, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { useTier } from '../packages/core/hooks/useTier';

interface PhotoTimelapseProps {
  taskId: string;
  plantName: string;
  expectedPhase: string;
  daysFromPlanting: number;
}

const PhotoTimelapse: React.FC<PhotoTimelapseProps> = ({
  taskId,
  plantName,
  expectedPhase,
  daysFromPlanting,
}) => {
  const { can } = useTier();
  const [photos, setPhotos] = useState<PlantPhotoLog[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!can('photoTimeLapse')) {
      setLoading(false);
      return;
    }

    loadPhotos();
  }, [taskId, can]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const logs = await PhotoLogService.getPhotoLogs(taskId);
      setPhotos(logs);
      if (logs.length > 0) {
        setCurrentIndex(logs.length - 1); // Start with most recent
      }
    } catch (error) {
      console.error('Error loading photo logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!can('photoTimeLapse')) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-800">Time-lapse disponibile solo in versione Pro</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <Loader2 className="animate-spin mx-auto mb-2 text-green-600" size={24} />
        <p className="text-gray-600">Caricamento foto...</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
        <Camera className="mx-auto mb-3 text-gray-400" size={48} />
        <p className="text-gray-600 mb-2">Nessuna foto disponibile</p>
        <p className="text-sm text-gray-500">Aggiungi foto nel Journal per creare un time-lapse</p>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];
  const analysis = currentPhoto.analysisResult;

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Camera size={20} className="text-green-600" />
          Time-Lapse {plantName}
        </h3>
        <div className="text-sm text-gray-500">
          Foto {currentIndex + 1} di {photos.length}
        </div>
      </div>

      {/* Photo Display */}
      <div className="relative mb-4">
        <img
          src={currentPhoto.photoUrl}
          alt={`${plantName} - Giorno ${currentPhoto.daysFromPlanting}`}
          className="w-full h-64 object-cover rounded-lg border border-gray-200"
        />
        
        {/* Navigation */}
        {photos.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Photo Info Overlay */}
        <div className="absolute bottom-2 left-2 right-2 bg-black/60 text-white rounded px-3 py-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar size={14} />
              Giorno {currentPhoto.daysFromPlanting}
            </span>
            <span>{new Date(currentPhoto.photoDate).toLocaleDateString('it-IT')}</span>
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      {analysis && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-purple-600" />
            Analisi AI
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {analysis.isHealthy ? (
                <CheckCircle size={16} className="text-green-600" />
              ) : (
                <AlertTriangle size={16} className="text-orange-600" />
              )}
              <span className="text-sm">
                Stato: <strong>{analysis.isHealthy ? 'Sano' : 'Attenzione'}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Leaf size={16} className="text-green-600" />
              <span className="text-sm">
                Crescita: <strong>
                  {analysis.growthRate === 'fast' ? 'Veloce' : 
                   analysis.growthRate === 'slow' ? 'Lenta' : 'Normale'}
                </strong>
              </span>
            </div>

            {analysis.phase && (
              <div className="text-sm text-gray-600">
                Fase rilevata: <strong>{analysis.phase}</strong>
              </div>
            )}

            {analysis.leafCount && (
              <div className="text-sm text-gray-600">
                Foglie vere: <strong>{analysis.leafCount}</strong>
              </div>
            )}

            {analysis.issues && analysis.issues.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-300">
                <p className="text-sm font-bold text-orange-700 mb-1">Problemi rilevati:</p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {analysis.issues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timeline Dots */}
      {photos.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {photos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? 'bg-green-600 w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoTimelapse;

