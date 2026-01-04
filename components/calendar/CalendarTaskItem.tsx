/**
 * Calendar Task Item Component
 * Mostra un singolo calendar task con badge se proviene da challenge
 */

'use client';

import React from 'react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { CalendarTaskBadge } from './CalendarTaskBadge';
import { CheckCircle, Circle } from 'lucide-react';

interface CalendarTaskItemProps {
  task: {
    id: string;
    title: string;
    type: string;
    start_date: string;
    completed: boolean;
    completed_at?: string;
    source_type?: string;
    challenge_id?: string;
    challenge_action_index?: number;
    notes?: string;
  };
  onToggleComplete?: (taskId: string, completed: boolean) => void;
  showDate?: boolean;
}

export const CalendarTaskItem: React.FC<CalendarTaskItemProps> = ({
  task,
  onToggleComplete,
  showDate = true
}) => {
  const taskDate = parseISO(task.start_date);
  const isOverdue = !task.completed && taskDate < new Date() && !isSameDay(taskDate, new Date());
  
  function isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  return (
    <div
      className={`
        bg-white rounded-lg p-3 border transition-all
        ${task.completed 
          ? 'border-green-200 bg-green-50/50 opacity-75' 
          : isOverdue
          ? 'border-red-300 bg-red-50/50'
          : 'border-gray-200 hover:border-gray-300'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        {onToggleComplete && (
          <button
            onClick={() => onToggleComplete(task.id, !task.completed)}
            className={`
              mt-0.5 flex-shrink-0 transition-all
              ${task.completed
                ? 'text-green-600'
                : 'text-gray-400 hover:text-green-600'
              }
            `}
          >
            {task.completed ? (
              <CheckCircle size={20} className="fill-current" />
            ) : (
              <Circle size={20} />
            )}
          </button>
        )}
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={`
                font-medium
                ${task.completed 
                  ? 'text-gray-500 line-through' 
                  : 'text-gray-900'
                }
              `}>
                {task.title}
              </p>
              
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {/* Tipo task */}
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                  {task.type}
                </span>
                
                {/* Badge Challenge */}
                <CalendarTaskBadge
                  sourceType={task.source_type}
                  challengeId={task.challenge_id}
                />
                
                {/* Data */}
                {showDate && (
                  <span className={`
                    text-xs
                    ${isOverdue && !task.completed
                      ? 'text-red-600 font-semibold'
                      : 'text-gray-500'
                    }
                  `}>
                    {format(taskDate, 'dd MMM', { locale: it })}
                  </span>
                )}
              </div>
              
              {/* Note */}
              {task.notes && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {task.notes}
                </p>
              )}
              
              {/* Completed date */}
              {task.completed && task.completed_at && (
                <p className="text-xs text-green-600 mt-1">
                  Completato: {format(parseISO(task.completed_at), 'dd/MM/yyyy', { locale: it })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};







