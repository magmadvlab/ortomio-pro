// components/farm/FieldMapPanel.tsx
import type { Garden } from '@/types';
import type { FieldAlert } from '@/types/fieldAlerts';

interface FieldMapPanelProps {
  gardens: Garden[]
  alerts: FieldAlert[]
  onFieldSelect: (gardenId: string) => void
}

function getFieldColor(gardenId: string, alerts: FieldAlert[]): { bg: string; border: string; text: string } {
  const fieldAlerts = alerts.filter(a => a.gardenId === gardenId);
  if (fieldAlerts.some(a => a.severity === 'critical')) {
    return { bg: 'bg-red-900/70', border: 'border-red-500', text: 'text-red-200' };
  }
  if (fieldAlerts.some(a => a.severity === 'warning')) {
    return { bg: 'bg-amber-900/70', border: 'border-amber-500', text: 'text-amber-200' };
  }
  return { bg: 'bg-green-900/70', border: 'border-green-600', text: 'text-green-200' };
}

function getStatusIcon(gardenId: string, alerts: FieldAlert[]): string {
  const fieldAlerts = alerts.filter(a => a.gardenId === gardenId);
  if (fieldAlerts.some(a => a.severity === 'critical')) return '🚨';
  if (fieldAlerts.some(a => a.severity === 'warning')) return '⚠';
  return '✓';
}

export function FieldMapPanel({ gardens, alerts, onFieldSelect }: FieldMapPanelProps) {
  return (
    <div className="p-3 h-full overflow-y-auto">
      <p className="text-xs text-green-400 font-semibold uppercase mb-2">
        📍 {gardens.length} Appezzamenti
      </p>
      <div className="grid grid-cols-2 gap-2">
        {gardens.map(garden => {
          const { bg, border, text } = getFieldColor(garden.id, alerts);
          const icon = getStatusIcon(garden.id, alerts);
          return (
            <button
              key={garden.id}
              onClick={() => onFieldSelect(garden.id)}
              className={`${bg} ${border} ${text} border rounded-lg p-3 text-left text-xs hover:opacity-90 transition-opacity`}
            >
              <div className="font-bold truncate">{garden.name}</div>
              <div className="mt-1">{icon}</div>
              {garden.primaryCrop && (
                <div className="text-[10px] opacity-70 mt-1 truncate">{garden.primaryCrop.label}</div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 mt-3 text-[10px] text-gray-400">
        <span><span className="text-red-400">■</span> Critico</span>
        <span><span className="text-amber-400">■</span> Attenzione</span>
        <span><span className="text-green-400">■</span> OK</span>
      </div>
    </div>
  );
}
