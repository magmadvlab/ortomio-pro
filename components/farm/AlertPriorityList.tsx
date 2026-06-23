// components/farm/AlertPriorityList.tsx
import type { FieldAlert } from '@/types/fieldAlerts';
import Link from 'next/link';

interface AlertPriorityListProps {
  alerts: FieldAlert[]
  highlightedGardenId?: string
  getGardenName: (gardenId: string) => string
}

const CATEGORY_ICONS: Record<FieldAlert['category'], string> = {
  water: '💧',
  treatment: '🧪',
  heat: '🌡',
  disease: '🍄',
  harvest: '📅',
};

const CTA: Record<FieldAlert['category'], { label: string; href: string } | null> = {
  treatment: { label: 'Registra intervento →', href: '/dashboard' },
  disease: { label: 'Vedi prescrizione AI →', href: '/dashboard' },
  water: { label: 'Pianifica irrigazione →', href: '/dashboard' },
  heat: null,
  harvest: null,
};

function sortAlerts(alerts: FieldAlert[]): FieldAlert[] {
  const order: Record<string, number> = { critical: 0, warning: 1, ok: 2 };
  return [...alerts].sort((a, b) => (order[a.severity] ?? 2) - (order[b.severity] ?? 2));
}

export function AlertPriorityList({ alerts, highlightedGardenId, getGardenName }: AlertPriorityListProps) {
  const activeAlerts = sortAlerts(alerts.filter(a => a.severity !== 'ok'));
  const okAlerts = alerts.filter(a => a.severity === 'ok');

  return (
    <div className="p-3 overflow-y-auto h-full">
      <p className="text-xs text-green-400 font-semibold uppercase mb-2">Priorità oggi</p>

      <div className="flex flex-col gap-2">
        {activeAlerts.map((alert, i) => {
          const isCritical = alert.severity === 'critical';
          const isHighlighted = alert.gardenId === highlightedGardenId;
          const cta = CTA[alert.category];
          const borderColor = isCritical ? 'border-red-500' : 'border-amber-500';
          const bgColor = isCritical ? 'bg-red-950/60' : 'bg-amber-950/60';
          const badgeColor = isCritical ? 'bg-red-600' : 'bg-amber-500';
          const titleColor = isCritical ? 'text-red-300' : 'text-amber-300';

          return (
            <div
              key={`${alert.gardenId}-${alert.category}-${i}`}
              id={`alert-${alert.gardenId}`}
              className={`${bgColor} border-l-4 ${borderColor} rounded-r-lg p-3 transition-all ${
                isHighlighted ? 'ring-1 ring-white/30' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-bold ${titleColor}`}>
                  {CATEGORY_ICONS[alert.category]} {getGardenName(alert.gardenId)}
                </span>
                <span className={`${badgeColor} text-white text-[10px] rounded-full px-2 py-0.5 font-bold`}>
                  {isCritical ? 'CRITICO' : 'ATTENZIONE'}
                </span>
              </div>
              <p className="text-xs text-green-100">{alert.message}</p>
              {cta && (
                <Link href={cta.href} className="mt-2 inline-block text-[10px] bg-red-600 hover:bg-red-700 text-white rounded px-2 py-1 transition-colors">
                  {cta.label}
                </Link>
              )}
            </div>
          );
        })}

        {okAlerts.length > 0 && (
          <div className="bg-green-950/40 border-l-4 border-green-700 rounded-r-lg p-3">
            <p className="text-xs text-green-400 font-semibold">
              ✓ {okAlerts.map(a => getGardenName(a.gardenId)).join(', ')} — Nessun alert
            </p>
            <p className="text-[10px] text-gray-500 mt-1">
              Ultimo controllo: {new Date(okAlerts[0].computedAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}

        {alerts.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-4">Nessun dato disponibile</p>
        )}
      </div>
    </div>
  );
}
