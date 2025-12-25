/**
 * Challenge Detail Page - Dynamic Route
 * Mostra dettagli completi di una challenge specifica
 * Route: /app/challenges/[giorno-mese]
 */

'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getChallengeForDate } from '@/data/giornateSpeciali';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Trophy, Share2, Camera, CheckSquare, Loader2, ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function ChallengeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = params.id as string;
  
  // Parse ID format: "giorno-mese" (e.g., "5-12")
  const [giorno, mese] = challengeId.split('-').map(Number);
  
  // Create date for this challenge (using current year)
  const challengeDate = new Date(new Date().getFullYear(), mese - 1, giorno);
  const challenge = getChallengeForDate(challengeDate);
  
  const [userId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return 'demo-user';
    return localStorage.getItem('user_id') || 'demo-user';
  });
  
  const [completedActions, setCompletedActions] = useState<number[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Load completion status
  useEffect(() => {
    if (challenge && userId) {
      const completed = localStorage.getItem(`challenge_${challengeId}_${userId}`);
      if (completed) {
        setIsCompleted(true);
        const data = JSON.parse(completed);
        setCompletedActions(data.actions_completed || []);
      }
    }
  }, [challenge, userId, challengeId]);
  
  if (!challenge) {
    return (
      <div className="min-h-screen p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Challenge non trovata</h1>
          <p className="text-gray-600 mb-6">
            La challenge per il {format(challengeDate, 'd MMMM', { locale: it })} non è disponibile.
          </p>
          <Link
            href="/app/progress?tab=achievements"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
          >
            <ArrowLeft size={18} className="inline mr-2" />
            Torna ai Traguardi
          </Link>
        </div>
      </div>
    );
  }
  
  const isAllCompleted = completedActions.length === challenge.challenge.azioni.length;
  const progress = challenge.challenge.azioni.length > 0 
    ? (completedActions.length / challenge.challenge.azioni.length) * 100 
    : 0;
  
  const handleToggleAction = (index: number) => {
    if (isCompleted) return;
    
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
      // 1. Upload foto (se presente) - TODO: implementare API upload
      let photoUrl = null;
      if (photo) {
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
      
      // 4. Show celebration!
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
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        alert('Copiato negli appunti! Incollalo sui tuoi social 📱');
      });
    }
  };
  
  return (
    <>
      <div className="min-h-screen p-4 sm:p-6 max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/app/progress?tab=achievements"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Torna ai Traguardi
        </Link>
        
        {/* Main Challenge Card */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg shadow-md overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl shrink-0">
                  🎯
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${
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
                    {isCompleted && (
                      <span className="px-3 py-1 bg-green-500 text-white rounded text-xs font-semibold">
                        ✓ Completata
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-purple-900 mb-1">
                    {challenge.evento}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <Calendar size={16} />
                    {format(challengeDate, 'EEEE d MMMM yyyy', { locale: it })}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <span className="bg-yellow-500 text-white px-4 py-2 rounded-full text-lg font-semibold flex items-center gap-2">
                  <Trophy size={18} />
                  +{challenge.challenge.punti} punti
                </span>
                {photo && (
                  <span className="text-xs text-purple-600 font-medium">
                    +50 punti bonus per la foto
                  </span>
                )}
              </div>
            </div>
            
            {/* Titolo + Descrizione Challenge */}
            <div className="bg-white/70 rounded-lg p-6 border border-purple-200">
              <h2 className="font-bold text-2xl sm:text-3xl text-purple-900 mb-3">
                {challenge.challenge.titolo}
              </h2>
              
              {challenge.challenge.sottotitolo && (
                <p className="text-lg text-purple-700 italic mb-3">
                  {challenge.challenge.sottotitolo}
                </p>
              )}
              
              <p className="text-purple-800 leading-relaxed text-base mb-4">
                {challenge.challenge.descrizione}
              </p>
              
              {/* Difficoltà Badge */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded text-sm font-semibold border ${
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
              <div className="space-y-3">
                <div className="flex items-center justify-between text-base">
                  <span className="text-purple-700 font-semibold">
                    Progresso: {completedActions.length}/{challenge.challenge.azioni.length} azioni
                  </span>
                  <span className="text-purple-600 font-bold text-lg">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-3">
                  <div 
                    className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            
            {/* AZIONI CHECKLIST */}
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-purple-900 flex items-center gap-2">
                <CheckSquare size={24} />
                Completa queste azioni:
              </h3>
              
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
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl py-5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    Completamento in corso...
                  </>
                ) : isAllCompleted ? (
                  <>
                    <Trophy size={24} />
                    Completa Challenge e Ottieni Badge!
                  </>
                ) : (
                  `Completa ${completedActions.length}/${challenge.challenge.azioni.length} azioni`
                )}
              </button>
            )}
            
            {/* Completed State */}
            {isCompleted && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{challenge.challenge.badge.emoji}</span>
                  <div>
                    <p className="font-bold text-xl text-green-900">
                      Badge guadagnato: {challenge.challenge.badge.nome}
                    </p>
                    <p className="text-base text-green-700">
                      {challenge.challenge.badge.descrizione}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleShare}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Share2 size={20} />
                  Condividi su Social
                </button>
              </div>
            )}
            
            {/* Hashtags */}
            {challenge.hashtag && challenge.hashtag.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-purple-200">
                <span className="text-sm font-semibold text-purple-700">Hashtag:</span>
                {challenge.hashtag.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white/70 border border-purple-200 rounded text-sm text-purple-600 font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Celebration Modal */}
      {showCelebration && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" 
          onClick={() => setShowCelebration(false)}
        >
          <div 
            className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-7xl mb-4 animate-bounce">
              {challenge.challenge.badge.emoji}
            </div>
            <h3 className="text-3xl font-bold text-purple-900 mb-2">
              Challenge Completata!
            </h3>
            <p className="text-xl text-purple-700 mb-4">
              Hai guadagnato il badge <strong>{challenge.challenge.badge.nome}</strong>
            </p>
            <p className="text-3xl font-bold text-yellow-600 mb-6">
              +{challenge.challenge.punti + (photo ? 50 : 0)} punti!
            </p>
            <button
              onClick={() => {
                setShowCelebration(false);
                router.push('/app/progress?tab=achievements');
              }}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-lg"
            >
              Fantastico! 🎉
            </button>
          </div>
        </div>
      )}
    </>
  );
}

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
      className={`bg-white/70 rounded-lg p-4 border-2 transition-all ${
        completed ? 'border-green-500 bg-green-50' : 'border-purple-200'
      } ${disabled ? 'cursor-default' : 'cursor-pointer hover:border-purple-400'}`}
    >
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={completed}
          disabled={disabled}
          onChange={onToggle}
          className="mt-1 w-6 h-6 text-green-600 border-gray-300 rounded focus:ring-green-500"
        />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{azione.emoji}</span>
            <p className={`font-semibold text-lg ${completed ? 'text-green-800 line-through' : 'text-purple-900'}`}>
              {azione.azione}
            </p>
          </div>
          <p className="text-sm text-purple-700 italic">
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
    <div className={`${bgColor} border-2 ${borderColor} rounded-lg p-5`}>
      <p className={`font-bold ${textColor} text-lg mb-2 flex items-center gap-2`}>
        <span className="text-2xl">{icon}</span>
        <span>{title}</span>
      </p>
      <p className={`text-base ${textContentColor} leading-relaxed`}>
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
    <div className="bg-white/70 rounded-lg p-5 border-2 border-purple-200">
      <p className="font-semibold text-purple-900 text-base mb-3 flex items-center gap-2">
        <Camera size={20} />
        <span>Foto (opzionale, +50 punti bonus)</span>
      </p>
      <input
        type="file"
        accept="image/*"
        onChange={onPhotoChange}
        className="block w-full text-sm text-purple-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
      />
      {photo && (
        <p className="text-sm text-purple-600 mt-2">
          ✓ Foto selezionata: {photo.name}
        </p>
      )}
    </div>
  );
}

