/**
 * Visual Sun Input Component
 * Wizard visivo per semplificare l'input dell'esposizione solare
 */

import React, { useState } from 'react';
import { Sun, Home, Building2, Flower2, Mountain, TreePine, X } from 'lucide-react';

export interface VisualSunInputData {
  position: 'campo' | 'muro' | 'balcone';
  morningSun: number; // 1-5
  noonSun: number; // 1-5
  afternoonSun: number; // 1-5
  obstacles: string[]; // ['edificio_sud', 'albero', 'nessuno']
}

interface VisualSunInputProps {
  value?: VisualSunInputData;
  onChange: (data: VisualSunInputData) => void;
  estimatedHours?: number; // Preview ore stimate
}

const VisualSunInput: React.FC<VisualSunInputProps> = ({
  value,
  onChange,
  estimatedHours,
}) => {
  const [data, setData] = useState<VisualSunInputData>(
    value || {
      position: 'campo',
      morningSun: 3,
      noonSun: 5,
      afternoonSun: 3,
      obstacles: [],
    }
  );

  const handleChange = (updates: Partial<VisualSunInputData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    onChange(newData);
  };

  const toggleObstacle = (obstacle: string) => {
    const newObstacles = data.obstacles.includes(obstacle)
      ? data.obstacles.filter((o) => o !== obstacle)
      : [...data.obstacles, obstacle];
    handleChange({ obstacles: newObstacles });
  };

  const SunSlider: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    icon: React.ReactNode;
  }> = ({ label, value, onChange, icon }) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {icon}
          <label className="text-sm font-medium text-gray-700">{label}</label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1"
            max="5"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
          />
          <div className="flex gap-1 w-24">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`flex-1 h-6 rounded ${
                  level <= value
                    ? 'bg-yellow-400'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600 w-8 text-right">
            {value === 1
              ? 'poco'
              : value === 2
              ? 'poco'
              : value === 3
              ? 'medio'
              : value === 4
              ? 'tanto'
              : 'tanto'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <Sun size={16} />
        Esposizione Solare
      </h3>

      {/* Tipo Posizione */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📍 Dove si trova questo punto?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { value: 'campo', label: 'Pieno campo', icon: <Home size={20} /> },
              { value: 'muro', label: 'Vicino muro', icon: <Building2 size={20} /> },
              { value: 'balcone', label: 'Balcone', icon: <Flower2 size={20} /> },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              onClick={() => handleChange({ position: option.value })}
              className={`p-3 rounded-lg border-2 transition-all ${
                data.position === option.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                {option.icon}
                <span className="text-xs font-medium text-gray-700">
                  {option.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Slider Sole */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ☀️ Quando prende sole?
        </label>
        <div className="space-y-3">
          <SunSlider
            label="Mattino"
            value={data.morningSun}
            onChange={(value) => handleChange({ morningSun: value })}
            icon={<Sun size={16} className="text-yellow-500" />}
          />
          <SunSlider
            label="Mezzogiorno"
            value={data.noonSun}
            onChange={(value) => handleChange({ noonSun: value })}
            icon={<Sun size={16} className="text-orange-500" />}
          />
          <SunSlider
            label="Pomeriggio"
            value={data.afternoonSun}
            onChange={(value) => handleChange({ afternoonSun: value })}
            icon={<Sun size={16} className="text-red-500" />}
          />
        </div>
      </div>

      {/* Ostacoli */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🧱 Ci sono ostacoli?
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'edificio_sud', label: 'Edificio a Sud', icon: <Building2 size={16} /> },
            { id: 'edificio_est', label: 'Edificio a Est', icon: <Building2 size={16} /> },
            { id: 'edificio_ovest', label: 'Edificio a Ovest', icon: <Building2 size={16} /> },
            { id: 'albero', label: 'Albero', icon: <TreePine size={16} /> },
            { id: 'montagna', label: 'Montagna', icon: <Mountain size={16} /> },
            { id: 'nessuno', label: 'Nessuno', icon: <X size={16} /> },
          ].map((obstacle) => (
            <button
              key={obstacle.id}
              onClick={() => {
                if (obstacle.id === 'nessuno') {
                  handleChange({ obstacles: [] });
                } else {
                  const newObstacles = data.obstacles.includes('nessuno')
                    ? [obstacle.id]
                    : toggleObstacle(obstacle.id)
                    ? data.obstacles.filter((o) => o !== obstacle.id)
                    : [...data.obstacles.filter((o) => o !== 'nessuno'), obstacle.id];
                  handleChange({ obstacles: newObstacles });
                }
              }}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-all ${
                data.obstacles.includes(obstacle.id)
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {obstacle.icon}
              <span className="text-xs font-medium">{obstacle.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview Ore Stimate */}
      {estimatedHours !== undefined && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              Ore di sole stimate:
            </span>
            <span className="text-lg font-bold text-blue-700">
              {estimatedHours.toFixed(1)} h/giorno
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualSunInput;

