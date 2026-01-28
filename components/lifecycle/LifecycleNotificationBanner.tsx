'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Sprout, ArrowRight } from 'lucide-react';
import {
  getPendingNotifications,
  markNotificationSent,
  updateLifecycleEvent
} from '../../services/plantLifecycleService';
import { PendingNotification } from '../../types/plantLifecycle';

interface LifecycleNotificationBannerProps {
  gardenId: string;
  onActionComplete?: () => void;
}

export const LifecycleNotificationBanner: React.FC<LifecycleNotificationBannerProps> = ({
  gardenId,
  onActionComplete
}) => {
  const [notifications, setNotifications] = useState<PendingNotification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    
    // Ricarica ogni 5 minuti
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [gardenId]);

  const loadNotifications = async () => {
    try {
      const data = await getPendingNotifications(gardenId);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (notification: PendingNotification) => {
    if (!notification.notification_type) return;
    
    try {
      await markNotificationSent(notification.id, notification.notification_type);
      setDismissed(prev => new Set(prev).add(notification.id));
      await loadNotifications();
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const handleAction = async (notification: PendingNotification) => {
    try {
      const updates: any = {};
      
      if (notification.notification_type === 'germination') {
        updates.germination_date = new Date().toISOString().split('T')[0];
      } else if (notification.notification_type === 'transplant') {
        updates.transplant_date = new Date().toISOString().split('T')[0];
      } else if (notification.notification_type === 'harvest') {
        updates.first_harvest_date = new Date().toISOString().split('T')[0];
      }
      
      await updateLifecycleEvent(notification.id, updates);
      await loadNotifications();
      
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (error) {
      console.error('Error handling action:', error);
      alert('Errore nell\'aggiornamento');
    }
  };

  if (loading) return null;

  const visibleNotifications = notifications.filter(n => !dismissed.has(n.id));
  
  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md space-y-2">
      {visibleNotifications.slice(0, 3).map((notification) => (
        <div
          key={notification.id}
          className="bg-white border-2 border-orange-300 rounded-xl shadow-lg p-4 animate-slide-in-right"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Bell className="text-orange-600" size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Sprout size={16} className="text-green-600" />
                <span className="font-semibold text-gray-900">
                  {notification.crop_name}
                </span>
                {notification.crop_variety && (
                  <span className="text-sm text-gray-600">
                    ({notification.crop_variety})
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-700 mb-3">
                {notification.notification_type === 'germination' && (
                  <>Dovrebbe essere germinata! Controlla le piantine.</>
                )}
                {notification.notification_type === 'transplant' && (
                  <>Pronta per il trapianto in campo aperto.</>
                )}
                {notification.notification_type === 'harvest' && (
                  <>Pronta per la raccolta! Controlla la maturazione.</>
                )}
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(notification)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  {notification.notification_type === 'germination' && 'Registra'}
                  {notification.notification_type === 'transplant' && 'Trapianta'}
                  {notification.notification_type === 'harvest' && 'Raccogli'}
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => handleDismiss(notification)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Dopo
                </button>
              </div>
            </div>
            
            <button
              onClick={() => handleDismiss(notification)}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ))}
      
      {visibleNotifications.length > 3 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-center">
          <p className="text-sm text-gray-600">
            +{visibleNotifications.length - 3} altre notifiche
          </p>
        </div>
      )}
    </div>
  );
};
