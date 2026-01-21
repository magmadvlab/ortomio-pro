'use client';

import React, { useState } from 'react';
import { HelpCircle, X, ExternalLink } from 'lucide-react';

interface TooltipProps {
  title: string;
  content: string;
  manualLink?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

export default function ContextualTooltip({
  title,
  content,
  manualLink,
  position = 'top',
  size = 'md'
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96'
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-block">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-5 h-5 text-blue-600 hover:text-blue-700 transition-colors"
        aria-label="Mostra aiuto"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {/* Tooltip Content */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Tooltip */}
          <div
            className={`absolute z-50 ${positionClasses[position]} ${sizeClasses[size]}`}
          >
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900 pr-2">
                  {title}
                </h4>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                {content}
              </p>

              {/* Manual Link */}
              {manualLink && (
                <a
                  href={manualLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Leggi la guida completa
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              )}

              {/* Arrow */}
              <div
                className={`absolute w-3 h-3 bg-white border transform rotate-45 ${
                  position === 'top'
                    ? 'bottom-[-6px] left-1/2 -translate-x-1/2 border-b border-r'
                    : position === 'bottom'
                    ? 'top-[-6px] left-1/2 -translate-x-1/2 border-t border-l'
                    : position === 'left'
                    ? 'right-[-6px] top-1/2 -translate-y-1/2 border-r border-t'
                    : 'left-[-6px] top-1/2 -translate-y-1/2 border-l border-b'
                }`}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
