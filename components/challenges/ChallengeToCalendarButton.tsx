/**
 * Challenge to Calendar Button Component
 * Bottone per convertire le azioni di una challenge in calendar tasks
 */

'use client';

import React, { useState } from 'react';
import { Calendar, Check, Loader, AlertCircle } from 'lucide-react';
import { GiornataSpeciale } from '@/data/giornateSpeciali';

interface ChallengeToCalendarButtonProps {
  challenge: GiornataSpeciale;
  userId: string;
  gardenId?: string;
  onTasksCreated?: (taskIds: string[]) => void;
  className?: string;
}

export const ChallengeToCalendarButton: React.FC<ChallengeToCalendarButtonProps> = ({
  challenge,
  userId,
  gardenId,
  onTasksCreated,
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskCount, setTaskCount] = useState<number | null>(null);
  
  const handleAddToCalendar = async () => {
    if (!userId) {
      setError('ID utente non disponibile');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const challengeId = `${challenge.giorno}-${challenge.mese}`;
      
      const response = await fetch('/api/challenges/convert-to-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          challenge_id: challengeId,
          auto_schedule: true, // Distribuisce i task nei prossimi giorni
          garden_id: gardenId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nella conversione');
      }
      
      const data = await response.json();
      
      if (data.already_exists) {
        setError('Task già creati per questa challenge');
        setTaskCount(data.tasks?.length || 0);
      } else {
        setSuccess(true);
        setTaskCount(data.task_ids?.length || challenge.challenge.azioni.length);
        
        if (onTasksCreated && data.task_ids) {
          onTasksCreated(data.task_ids);
        }
      }
      
      // Reset dopo 3 secondi
      setTimeout(() => {
        setSuccess(false);
        setError(null);
        setTaskCount(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error converting challenge to tasks:', err);
      setError(err.message || 'Errore nel creare i task. Riprova.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!userId) {
    return null;
  }
  
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <button
        onClick={handleAddToCalendar}
        disabled={loading || success}
        className={`
          flex items-center justify-center gap-2 px-4 py-2 
          rounded-lg font-medium transition-all
          ${success 
            ? 'bg-green-600 text-white cursor-default' 
            : error
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
          }
        `}
      >
        {loading ? (
          <>
            <Loader className="animate-spin" size={16} />
            <span>Creazione task...</span>
          </>
        ) : success ? (
          <>
            <Check size={16} />
            <span>{taskCount ? `${taskCount} task creati!` : 'Task creati!'}</span>
          </>
        ) : error ? (
          <>
            <AlertCircle size={16} />
            <span>{error}</span>
          </>
        ) : (
          <>
            <Calendar size={16} />
            <span>Aggiungi al Calendario</span>
          </>
        )}
      </button>
      
      {!loading && !success && !error && (
        <p className="text-xs text-gray-500 text-center">
          Crea {challenge.challenge.azioni.length} task nel calendario
        </p>
      )}
    </div>
  );
};

