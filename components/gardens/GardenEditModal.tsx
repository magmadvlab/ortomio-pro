import React from 'react';
import { Garden } from '@/types';
import GardenOnboarding from '@/components/GardenOnboarding';

interface GardenEditModalProps {
  garden: Garden;
  onSave: (garden: Garden) => Promise<void>;
  onCancel: () => void;
}

export const GardenEditModal: React.FC<GardenEditModalProps> = ({
  garden,
  onSave,
  onCancel
}) => {
  const handleComplete = async (updatedGarden: Garden) => {
    await onSave(updatedGarden);
  };

  return (
    <GardenOnboarding
      existingGarden={garden}
      onComplete={handleComplete}
      onCancel={onCancel}
    />
  );
};













