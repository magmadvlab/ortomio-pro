import React from 'react';
import { useTier } from '../packages/core/hooks/useTier';

interface LimitIndicatorProps {
  limitKey: 'maxGardens' | 'maxTasksPerGarden' | 'maxSeedPackets' | 'maxHarvestLogs' | 'maxSeedlingBatches' | 'maxPhotosPerBatch';
  currentValue: number;
  label: string;
  showProgress?: boolean;
}

const LimitIndicator: React.FC<LimitIndicatorProps> = ({ 
  limitKey, 
  currentValue, 
  label,
  showProgress = false 
}) => {
  const { isPro, checkLimit, limit } = useTier();
  
  if (isPro) {
    return null; // Non mostrare limiti per Pro
  }

  const limitCheck = checkLimit(limitKey, currentValue);
  const maxValue = limit(limitKey);
  
  if (maxValue === -1) {
    return null; // Illimitato
  }

  const percentage = (currentValue / maxValue) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = !limitCheck.allowed;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`font-medium ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-gray-500'}`}>
        {label}: {currentValue}/{maxValue}
      </span>
      {showProgress && (
        <div className="flex-1 max-w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all ${
              isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-orange-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default LimitIndicator;

