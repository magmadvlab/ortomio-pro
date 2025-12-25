/**
 * Calendar Task Badge Component
 * Mostra badge per task che provengono da challenge
 */

'use client';

import React from 'react';
import { Trophy } from 'lucide-react';

interface CalendarTaskBadgeProps {
  sourceType?: string;
  challengeId?: string;
  className?: string;
}

export const CalendarTaskBadge: React.FC<CalendarTaskBadgeProps> = ({
  sourceType,
  challengeId,
  className = ''
}) => {
  if (sourceType !== 'challenge' || !challengeId) {
    return null;
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
        bg-purple-100 text-purple-700 border border-purple-200
        ${className}
      `}
      title={`Task da challenge: ${challengeId}`}
    >
      <Trophy size={12} />
      <span>Da Challenge</span>
    </span>
  );
};




