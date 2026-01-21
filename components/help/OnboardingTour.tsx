'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingTour({
  steps,
  onComplete,
  onSkip
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetPosition, setTargetPosition] = useState<DOMRect | null>(null);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Calculate target element position
  useEffect(() => {
    if (step.target) {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetPosition(rect);
        
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setTargetPosition(null);
    }
  }, [step.target]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getTooltipPosition = () => {
    if (!targetPosition || step.position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const padding = 20;
    const position: React.CSSProperties = {};

    switch (step.position) {
      case 'top':
        position.top = `${targetPosition.top - padding}px`;
        position.left = `${targetPosition.left + targetPosition.width / 2}px`;
        position.transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        position.top = `${targetPosition.bottom + padding}px`;
        position.left = `${targetPosition.left + targetPosition.width / 2}px`;
        position.transform = 'translateX(-50%)';
        break;
      case 'left':
        position.top = `${targetPosition.top + targetPosition.height / 2}px`;
        position.left = `${targetPosition.left - padding}px`;
        position.transform = 'translate(-100%, -50%)';
        break;
      case 'right':
        position.top = `${targetPosition.top + targetPosition.height / 2}px`;
        position.left = `${targetPosition.right + padding}px`;
        position.transform = 'translateY(-50%)';
        break;
    }

    return position;
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[9998]" />

      {/* Highlight Target */}
      {targetPosition && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: `${targetPosition.top - 4}px`,
            left: `${targetPosition.left - 4}px`,
            width: `${targetPosition.width + 8}px`,
            height: `${targetPosition.height + 8}px`,
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5)',
            borderRadius: '8px'
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-[10000] w-96 max-w-[90vw]"
        style={getTooltipPosition()}
      >
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Passo {currentStep + 1} di {steps.length}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {step.title}
              </h3>
            </div>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            {step.content}
          </p>

          {/* Action Button */}
          {step.action && (
            <button
              onClick={step.action.onClick}
              className="w-full mb-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              {step.action.label}
            </button>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Indietro
            </button>

            {/* Progress Dots */}
            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-blue-600'
                      : index < currentStep
                      ? 'bg-blue-300'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {isLastStep ? (
                <>
                  Completa
                  <Check className="w-4 h-4" />
                </>
              ) : (
                <>
                  Avanti
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Skip Link */}
          <div className="mt-4 text-center">
            <button
              onClick={onSkip}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Salta il tour
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
