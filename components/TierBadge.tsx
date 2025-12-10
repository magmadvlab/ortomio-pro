import React from 'react';
import { useTier } from '../packages/core/hooks/useTier';
import { Sparkles } from 'lucide-react';

interface TierBadgeProps {
  variant?: 'default' | 'compact' | 'large';
  showIcon?: boolean;
}

const TierBadge: React.FC<TierBadgeProps> = ({ variant = 'default', showIcon = false }) => {
  const { isPro, tier } = useTier();

  const variants = {
    default: 'px-2 py-1 text-xs',
    compact: 'px-1.5 py-0.5 text-[10px]',
    large: 'px-3 py-1.5 text-sm'
  };

  if (isPro) {
    return (
      <span className={`${variants[variant]} bg-purple-100 text-purple-700 rounded-full font-bold flex items-center gap-1`}>
        {showIcon && <Sparkles size={12} />}
        PRO
      </span>
    );
  }

  return (
    <span className={`${variants[variant]} bg-gray-100 text-gray-600 rounded-full font-bold`}>
      FREE
    </span>
  );
};

export default TierBadge;

