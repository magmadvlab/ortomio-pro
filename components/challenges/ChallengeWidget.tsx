/**
 * Challenge Widget - Dashboard Widget
 * Mostra challenge del giorno (se disponibile)
 * Checklist azioni, progress bar, completamento con badge e punti
 */

'use client'

import React, { useState, useEffect } from 'react';
import { getChallengeForDate } from '../../data/giornateSpeciali';
import { Trophy, Share2, Camera, CheckSquare, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ChallengeToCalendarButton } from './ChallengeToCalendarButton';

interface ChallengeWidgetProps {
  date?: Date; // Data da mostrare (default: oggi)
  userId?: string; // ID utente per salvare completamento
  onComplete?: (challengeId: string, points: number) => void; // Callback quando completata
}

const ChallengeWidget: React.FC<ChallengeWidgetProps> = ({ 
  date,
  userId,
  onComplete
}) => {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  
  useEffect(() => {
    setMounted(true);
    setCurrentDate(date || new Date());
  }, [date]);
  
  if (!mounted || !currentDate) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-6xl mb-3">🌱</div>
        <p className="text-gray-600">Caricamento...</p>
      </div>
    );
  }
  
  const challenge = getChallengeForDate(currentDate);
  const [completedActions, setCompletedActions] = useState<number[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Verifica se challenge già completata (da localStorage o API)
  useEffect(() => {
    if (mounted && challenge && userId) {
      const challengeId = `${challenge.giorno}-${challenge.mese}`;
      const completed = localStorage.getItem(`challenge_${challengeId}_${userId}`);
      if (completed) {
        setIsCompleted(true);
        const data = JSON.parse(completed);
        setCompletedActions(data.actions_completed || []);
      }
    }
  }, [mounted, challenge, userId]);
  
  if (!challenge) {
    // Nessuna challenge oggi
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-6xl mb-3">🌱</div>
        <p className="text-gray-600">
          Nessuna challenge oggi. Goditi il tuo orto!
        </p>
        <Link
          href="/app/progress?tab=achievements"
          className="mt-3 inline-block px-4 py-2 text-sm text-gray-700 hover:text-gray-900 underline flex items-center justify-center gap-1"
        >
          Vedi tutte le challenge
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }
  
  const isAllCompleted = completedActions.length === challenge.challenge.azioni.length;
  const progress = challenge.challenge.azioni.length > 0 
    ? (completedActions.length / challenge.challenge.azioni.length) * 100 
    : 0;
  
  const handleToggleAction = (index: number) => {
    if (isCompleted) return; // Non modificare se già completata
    
    setCompletedActions(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index].sort();
      }
    });
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setPhoto(file);
    }
  };
  
  const handleComplete = async () => {
    if (!isAllCompleted || isSubmitting || isCompleted) return;
    
    setIsSubmitting(true);
    
    try {
      const challengeId = `${challenge.giorno}-${challenge.mese}`;
      
      // 1. Upload foto (se presente) - TODO: implementare API upload
      let photoUrl = null;
      if (photo) {
        // Placeholder: in produzione, upload a Supabase Storage
        photoUrl = URL.createObjectURL(photo);
      }
      
      // 2. Calcola punti totali
      const totalPoints = challenge.challenge.punti + (photo ? 50 : 0);
      
      // 3. Salva completion (localStorage per ora, poi API)
      if (userId) {
        const completionData = {
          challenge_id: challengeId,
          user_id: userId,
          completed_at: new Date().toISOString(),
          photo_url: photoUrl,
          actions_completed: completedActions,
          points_awarded: totalPoints,
          badge_earned: challenge.challenge.badge.emoji + ' ' + challenge.challenge.badge.nome
        };
        
        localStorage.setItem(
          `challenge_${challengeId}_${userId}`,
          JSON.stringify(completionData)
        );
      }
      
      // 4. Callback
      if (onComplete) {
        onComplete(challengeId, totalPoints);
      }
      
      // 5. Show celebration!
      setShowCelebration(true);
      setIsCompleted(true);
      
    } catch (error) {
      console.error('Error completing challenge:', error);
      alert('Errore nel completare la challenge. Riprova.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleShare = () => {
    const text = challenge.challenge.shareText || 
      `Ho completato la challenge "${challenge.challenge.titolo}"! 🎯 +${challenge.challenge.punti} punti #OrtoMio`;
    
    if (navigator.share) {
      navigator.share({
        title: challenge.challenge.titolo,
        text
      }).catch(() => {
        // User cancelled
      });
    } else {
      navigator.clipboard.writeText(text).then(() => {
        alert('Copiato negli appunti! Incollalo sui tuoi social 📱');
      });
    }
  };
  
  return (
    <>
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl shrink-0">
                🎯
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    challenge.tipo === 'mondiale' ? 'bg-blue-100 text-blue-800' :
                    challenge.tipo === 'nazionale' ? 'bg-green-100 text-green-800' :
                    challenge.tipo === 'ambiente' ? 'bg-emerald-100 text-emerald-800' :
                    challenge.tipo === 'benessere' ? 'bg-pink-100 text-pink-800' :
                    challenge.tipo === 'sociale' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {challenge.tipo === 'mondiale' ? '🌍 Mondiale' :
                     challenge.tipo === 'nazionale' ? '🇮🇹 Nazionale' :
                     challenge.tipo === 'ambiente' ? '🌿 Ambiente' :
                     challenge.tipo === 'benessere' ? '💚 Benessere' :
                     challenge.tipo === 'sociale' ? '🤝 Sociale' :
                     '📅 Stagionale'}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-purple-900">
                  Challenge del Giorno
                </h3>
                <p className="text-sm text-purple-700">
                  {challenge.evento}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <Trophy size={14} />
                +{challenge.challenge.punti} punti
              </span>
              {isCompleted && (
                <span className="text-xs text-green-600 font-semibold">✓ Completata</span>
              )}
            </div>
          </div>
          
          {/* Titolo + Descrizione Challenge */}
          <div className="bg-white/70 rounded-lg p-4 border border-purple-200">
            <h4 className="font-bold text-xl text-purple-900 mb-2">
              {challenge.challenge.titolo}
            </h4>
            
            {challenge.challenge.sottotitolo && (
              <p className="text-sm text-purple-700 italic mb-2">
                {challenge.challenge.sottotitolo}
              </p>
            )}
            
            <p className="text-purple-800 leading-relaxed text-sm">
              {challenge.challenge.descrizione}
            </p>
            
            {/* Difficoltà Badge */}
            <div className="mt-3">
              <span className={`px-2 py-1 rounded text-xs font-semibold border ${
                challenge.challenge.difficolta === 'facile' ? 'bg-green-50 text-green-700 border-green-200' :
                challenge.challenge.difficolta === 'media' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                'bg-red-50 text-red-700 border-red-200'
              }`}>
                {challenge.challenge.difficolta === 'facile' ? '🟢 Facile' :
                 challenge.challenge.difficolta === 'media' ? '🟡 Media' :
                 '🔴 Difficile'}
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          {!isCompleted && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-700 font-medium">
                  Progresso: {completedActions.length}/{challenge.challenge.azioni.length} azioni
                </span>
                <span className="text-purple-600 font-semibold">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          {/* AZIONI CHECKLIST */}
          <div className="space-y-3">
            <p className="font-semibold text-purple-900 flex items-center gap-2">
              <CheckSquare size={18} />
              Completa queste azioni:
            </p>
            
            {challenge.challenge.azioni.map((azione, idx) => (
              <ActionChecklistItem
                key={idx}
                azione={azione}
                index={idx}
                completed={completedActions.includes(idx)}
                disabled={isCompleted}
                onToggle={() => handleToggleAction(idx)}
              />
            ))}
          </div>
          
          {/* Add to Calendar Button */}
          {!isCompleted && userId && (
            <div className="pt-2">
              <ChallengeToCalendarButton
                challenge={challenge}
                userId={userId}
                onTasksCreated={(taskIds) => {
                  console.log('Tasks created from challenge:', taskIds);
                  // Opzionale: mostra notifica o aggiorna UI
                }}
              />
            </div>
          )}
          
          {/* Impact Boxes */}
          {challenge.challenge.motivazione && (
            <ImpactBox type="motivazione" content={challenge.challenge.motivazione} />
          )}
          
          {challenge.challenge.impatto && (
            <ImpactBox type="impatto" content={challenge.challenge.impatto} />
          )}
          
          {challenge.challenge.scienzaDietro && (
            <ImpactBox type="scienza" content={challenge.challenge.scienzaDietro} />
          )}
          
          {/* Photo Upload */}
          {isAllCompleted && !isCompleted && (
            <PhotoUploadBox
              photo={photo}
              onPhotoChange={handlePhotoChange}
            />
          )}
          
          {/* Complete Button */}
          {!isCompleted && (
            <button
              disabled={!isAllCompleted || isSubmitting}
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Completamento in corso...
                </>
              ) : isAllCompleted ? (
                <>
                  <Trophy size={20} />
                  Completa Challenge e Ottieni Badge!
                </>
              ) : (
                `Completa ${completedActions.length}/${challenge.challenge.azioni.length} azioni`
              )}
            </button>
          )}
          
          {/* Completed State */}
          {isCompleted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{challenge.challenge.badge.emoji}</span>
                <div>
                  <p className="font-semibold text-green-900">
                    Badge guadagnato: {challenge.challenge.badge.nome}
                  </p>
                  <p className="text-sm text-green-700">
                    {challenge.challenge.badge.descrizione}
                  </p>
                </div>
              </div>
              <button
                onClick={handleShare}
                className="w-full mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Share2 size={16} />
                Condividi su Social
              </button>
            </div>
          )}
          
          {/* Hashtags */}
          {challenge.hashtag && challenge.hashtag.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {challenge.hashtag.map(tag => (
                <span key={tag} className="px-2 py-1 bg-white/70 border border-purple-200 rounded text-xs text-purple-600">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Celebration Modal (semplificato) */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCelebration(false)}>
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-6xl mb-4 animate-bounce">
              {challenge.challenge.badge.emoji}
            </div>
            <h3 className="text-2xl font-bold text-purple-900 mb-2">
              Challenge Completata!
            </h3>
            <p className="text-lg text-purple-700 mb-4">
              Hai guadagnato il badge <strong>{challenge.challenge.badge.nome}</strong>
            </p>
            <p className="text-2xl font-bold text-yellow-600 mb-4">
              +{challenge.challenge.punti + (photo ? 50 : 0)} punti!
            </p>
            <button
              onClick={() => setShowCelebration(false)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Fantastico! 🎉
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Helper component: Action Checklist Item
function ActionChecklistItem({
  azione,
  index,
  completed,
  disabled,
  onToggle
}: {
  azione: { emoji: string; azione: string; perche: string };
  index: number;
  completed: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div 
      onClick={disabled ? undefined : onToggle}
      className={`bg-white/70 rounded-lg p-3 border-2 transition-all ${
        completed ? 'border-green-500 bg-green-50' : 'border-purple-200'
      } ${disabled ? 'cursor-default' : 'cursor-pointer hover:border-purple-400'}`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={completed}
          disabled={disabled}
          onChange={onToggle}
          className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{azione.emoji}</span>
            <p className={`font-medium ${completed ? 'text-green-800 line-through' : 'text-purple-900'}`}>
              {azione.azione}
            </p>
          </div>
          <p className="text-xs text-purple-700 italic">
            {azione.perche}
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper component: Impact Box
function ImpactBox({ 
  type, 
  content 
}: { 
  type: 'motivazione' | 'impatto' | 'scienza';
  content: string;
}) {
  const config = {
    motivazione: { icon: '💚', title: 'Motivazione', bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-900', textContentColor: 'text-green-800' },
    impatto: { icon: '🌍', title: 'Impatto', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-900', textContentColor: 'text-blue-800' },
    scienza: { icon: '🔬', title: 'Scienza', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', textColor: 'text-purple-900', textContentColor: 'text-purple-800' }
  };
  
  const { icon, title, bgColor, borderColor, textColor, textContentColor } = config[type];
  
  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-4`}>
      <p className={`font-semibold ${textColor} text-sm mb-2 flex items-center gap-2`}>
        <span>{icon}</span>
        <span>{title}</span>
      </p>
      <p className={`text-sm ${textContentColor} leading-relaxed`}>
        {content}
      </p>
    </div>
  );
}

// Helper component: Photo Upload Box
function PhotoUploadBox({
  photo,
  onPhotoChange
}: {
  photo: File | null;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="bg-white/70 rounded-lg p-4 border border-purple-200">
      <p className="font-semibold text-purple-900 text-sm mb-2 flex items-center gap-2">
        <Camera size={18} />
        <span>Foto (opzionale, +50 punti bonus)</span>
      </p>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onPhotoChange}
        className="block w-full text-sm text-purple-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
      />
      {photo && (
        <p className="text-xs text-purple-600 mt-2">
          ✓ Foto selezionata: {photo.name}
        </p>
      )}
    </div>
  );
}

export default ChallengeWidget;
