'use client';

import React, { useState, useEffect } from 'react';
import { Sprout, Calendar, TrendingUp, Bell, CheckCircle, X, Loader2 } from 'lucide-react';
import {
  getActiveLifecycleEvents,
  getPendingNotifications,
  getLifecycleStats,
  updateLifecycleEvent,
  markNotificationSent,
  getStatusLabel,
  getStatusColor
} from '../../services/plantLifecycleService';
import { PlantLifecycleEvent, PendingNotification } from '../../types/plantLifecycle';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

interface PlantLifecycleWidgetProps {
  gardenId: string;
  compact?: boolean;
}

export const PlantLifecycleWidget: React.FC<PlantLifecycleWidgetProps> = ({
  gardenId,
  compact = false
}) => {
  const [events, setEvents] = useState<PlantLifecycleEvent[]>([]);
  const [notifications, setNotifications] = useState<PendingNotification[]>([]);
  const [stats, setStats] = useState({
    activeCount: 0,
    completedCount: 0,
    pendingNotifications: 0,
    averageYield: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadData();
  }, [gardenId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, notificationsData, statsData] = await Promise.all([
        getActiveLifecycleEvents(gardenId),
        getPendingNotifications(gardenId),
        getLifecycleStats(gardenId)
      ]);
      
      setEvents(eventsData);
      setNotifications(notificationsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading lifecycle data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkGerminated = async (event: PlantLifecycleEvent) => {
    try {
      await updateLifecycleEvent(event.id, {
        germination_date: new Date().toISOString().split('T')[0]
      });
      await loadData();
    } catch (error) {
      console.error('Error marking as germinated:', error);
      alert('Errore nell\'aggiornamento');
    }
  };

  const handleMarkTransplanted = async (event: PlantLifecycleEvent) => {
    try {
      await updateLifecycleEvent(event.id, {
        transplant_date: new Date().toISOString().split('T')[0]
      });
      await loadData();
    } catch (error) {
      console.error('Error marking as transplanted:', error);
      alert('Errore nell\'aggiornamento');
    }
  };

  const handleMarkHarvested = async (event: PlantLifecycleEvent) => {
    try {
      await updateLifecycleEvent(event.id, {
        first_harvest_date: new Date().toISOString().split('T')[0]
      });
      await loadData();
    } catch (error) {
      console.error('Error marking as harvested:', error);
      alert('Errore nell\'aggiornamento');
    }
  };

  const handleDismissNotification = async (notification: PendingNotification) => {
    if (!notification.notification_type) return;
    
    try {
      await markNotificationSent(notification.id, notification.notification_type);
      await loadData();
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-green-600" size={32} />
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Sprout className="text-green-600" size={24} />
          <h2 className="text-lg font-bold text-gray-900">Ciclo Vita Piante</h2>
        </div>
        <div className="text-center py-8">
          <Sprout size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600 font-medium">Nessuna coltura attiva</p>
          <p className="text-sm text-gray-500 mt-1">
            Crea un filare con coltura per iniziare il tracciamento automatico
          </p>
        </div>
      </div>
    );
  }

  const displayEvents = showAll ? events : events.slice(0, compact ? 3 : 5);

  return (
    <div className="bg-white rounded-xl border-2 border-green-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Sprout className="text-green-600" size={24} />
          <div>
            <h2 className="text-lg font-bold text-gray-900">Ciclo Vita Piante</h2>
            <p className="text-sm text-gray-600">Tracciamento automatico</p>
          </div>
        </div>
        {notifications.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
            <Bell size={16} />
            <span className="text-sm font-semibold">{notifications.length}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600">{stats.activeCount}</div>
          <div className="text-xs text-gray-600">Attive</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600">{stats.completedCount}</div>
          <div className="text-xs text-gray-600">Completate</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-purple-600">
            {stats.averageYield > 0 ? `${stats.averageYield}kg` : '-'}
          </div>
          <div className="text-xs text-gray-600">Resa media</div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mb-6 space-y-2">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Bell size={16} />
            Notifiche Pending
          </h3>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-orange-50 border border-orange-200 rounded-lg p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">
                      {notification.crop_name}
                    </span>
                    {notification.crop_variety && (
                      <span className="text-sm text-gray-600">
                        ({notification.crop_variety})
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">
                    {notification.notification_type === 'germination' && (
                      <>✅ Dovrebbe essere germinata! Controlla e registra.</>
                    )}
                    {notification.notification_type === 'transplant' && (
                      <>🌱 Pronta per il trapianto! {notification.days_until_transplant !== undefined && notification.days_until_transplant < 0 && `(${Math.abs(notification.days_until_transplant)} giorni fa)`}</>
                    )}
                    {notification.notification_type === 'harvest' && (
                      <>🧺 Pronta per la raccolta! {notification.days_until_harvest !== undefined && notification.days_until_harvest < 0 && `(${Math.abs(notification.days_until_harvest)} giorni fa)`}</>
                    )}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {notification.notification_type === 'germination' && (
                      <button
                        onClick={() => handleMarkGerminated(notification as any)}
                        className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Registra Germinazione
                      </button>
                    )}
                    {notification.notification_type === 'transplant' && (
                      <button
                        onClick={() => handleMarkTransplanted(notification as any)}
                        className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Registra Trapianto
                      </button>
                    )}
                    {notification.notification_type === 'harvest' && (
                      <button
                        onClick={() => handleMarkHarvested(notification as any)}
                        className="text-xs px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Registra Raccolta
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDismissNotification(notification)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Events */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <TrendingUp size={16} />
          Colture Attive
        </h3>
        {displayEvents.map((event) => {
          const seedingDate = parseISO(event.seeding_date);
          const daysAgo = event.days_since_seeding || 0;
          
          return (
            <div
              key={event.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">
                      {event.crop_name}
                    </span>
                    {event.crop_variety && (
                      <span className="text-sm text-gray-600">
                        ({event.crop_variety})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar size={12} />
                    <span>
                      Piantato {format(seedingDate, 'dd MMM yyyy', { locale: it })}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>{daysAgo} giorni fa</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.current_status)}`}>
                  {getStatusLabel(event.current_status)}
                </span>
              </div>

              {/* Progress bar */}
              {event.expected_maturity_days && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Progresso verso maturità</span>
                    <span>
                      {Math.min(100, Math.round((daysAgo / event.expected_maturity_days) * 100))}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (daysAgo / event.expected_maturity_days) * 100)}%`
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span>Giorno {daysAgo}</span>
                    <span>Maturità: ~{event.expected_maturity_days} giorni</span>
                  </div>
                </div>
              )}

              {/* Milestones */}
              <div className="mt-3 flex flex-wrap gap-2">
                {event.germination_date && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle size={12} />
                    <span>Germinata</span>
                  </div>
                )}
                {event.transplant_date && (
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <CheckCircle size={12} />
                    <span>Trapiantata</span>
                  </div>
                )}
                {event.first_harvest_date && (
                  <div className="flex items-center gap-1 text-xs text-purple-600">
                    <CheckCircle size={12} />
                    <span>In raccolta</span>
                  </div>
                )}
              </div>

              {/* Plant count */}
              {event.plant_count > 1 && (
                <div className="mt-2 text-xs text-gray-600">
                  {event.plant_count} piante
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show more button */}
      {events.length > (compact ? 3 : 5) && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-4 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
        >
          {showAll ? 'Mostra meno' : `Mostra altre ${events.length - (compact ? 3 : 5)} colture`}
        </button>
      )}
    </div>
  );
};
