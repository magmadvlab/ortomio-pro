'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, List, Grid } from 'lucide-react';
import { getSupabaseClient } from '../../config/supabase';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  type: 'planting' | 'harvest' | 'treatment' | 'irrigation' | 'maintenance' | 'other';
  completed: boolean;
  garden_id: string;
  created_at: string;
}

type ViewMode = 'month' | 'week' | 'list';

export const IntegratedCalendar: React.FC = () => {
  const supabase = getSupabaseClient();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Form states
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventType, setEventType] = useState<CalendarEvent['type']>('other');

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user, currentDate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // Load events for the current month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);

    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!eventTitle.trim() || !eventDate) return;

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert([{
          title: eventTitle,
          description: eventDescription || null,
          date: eventDate,
          time: eventTime || null,
          type: eventType,
          completed: false,
          garden_id: 'default' // In a real app, this would be the actual garden ID
        }])
        .select()
        .single();

      if (error) throw error;

      setEvents([...events, data]);
      resetEventForm();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Errore nella creazione dell\'evento');
    }
  };

  const handleToggleComplete = async (eventId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .update({ completed: !completed })
        .eq('id', eventId);

      if (error) throw error;

      setEvents(events.map(e => 
        e.id === eventId ? { ...e, completed: !completed } : e
      ));
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const resetEventForm = () => {
    setEventTitle('');
    setEventDescription('');
    setEventDate('');
    setEventTime('');
    setEventType('other');
    setShowEventForm(false);
    setSelectedDate('');
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDate = (date: string) => {
    return events.filter(event => event.date === date);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    const colors = {
      planting: 'bg-green-100 text-green-800 border-green-200',
      harvest: 'bg-orange-100 text-orange-800 border-orange-200',
      treatment: 'bg-red-100 text-red-800 border-red-200',
      irrigation: 'bg-blue-100 text-blue-800 border-blue-200',
      maintenance: 'bg-purple-100 text-purple-800 border-purple-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type];
  };

  const getEventTypeLabel = (type: CalendarEvent['type']) => {
    const labels = {
      planting: 'Semina/Trapianto',
      harvest: 'Raccolto',
      treatment: 'Trattamento',
      irrigation: 'Irrigazione',
      maintenance: 'Manutenzione',
      other: 'Altro'
    };
    return labels[type];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-2xl font-semibold text-gray-900">
            {formatDate(currentDate)}
          </h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'month' ? 'bg-white shadow' : 'text-gray-600'
              }`}
            >
              <Grid size={16} className="inline mr-1" />
              Mese
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'list' ? 'bg-white shadow' : 'text-gray-600'
              }`}
            >
              <List size={16} className="inline mr-1" />
              Lista
            </button>
          </div>
          
          <button
            onClick={() => {
              setSelectedDate(new Date().toISOString().split('T')[0]);
              setEventDate(new Date().toISOString().split('T')[0]);
              setShowEventForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={20} />
            Nuovo Evento
          </button>
        </div>
      </div>

      {viewMode === 'month' ? (
        /* Month View */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 bg-gray-50 border-b">
            {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-700">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {getDaysInMonth().map((day, index) => {
              if (day === null) {
                return <div key={index} className="h-24 border-b border-r border-gray-200" />;
              }
              
              const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = getEventsForDate(dateString);
              const isToday = dateString === new Date().toISOString().split('T')[0];
              
              return (
                <div
                  key={day}
                  className={`h-24 border-b border-r border-gray-200 p-1 cursor-pointer hover:bg-gray-50 ${
                    isToday ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    setSelectedDate(dateString);
                    setEventDate(dateString);
                    setShowEventForm(true);
                  }}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className={`text-xs px-1 py-0.5 rounded truncate ${getEventTypeColor(event.type)} ${
                          event.completed ? 'opacity-50 line-through' : ''
                        }`}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayEvents.length - 2} altri
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Eventi del Mese</h3>
            {events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon size={48} className="mx-auto mb-2 text-gray-300" />
                <p>Nessun evento programmato</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map(event => (
                  <div
                    key={event.id}
                    className={`p-4 border rounded-lg ${
                      event.completed ? 'bg-gray-50 opacity-75' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={event.completed}
                            onChange={() => handleToggleComplete(event.id, event.completed)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <div>
                            <h4 className={`font-medium ${
                              event.completed ? 'line-through text-gray-500' : 'text-gray-900'
                            }`}>
                              {event.title}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>{new Date(event.date).toLocaleDateString('it-IT')}</span>
                              {event.time && <span>• {event.time}</span>}
                              <span className={`px-2 py-0.5 rounded text-xs ${getEventTypeColor(event.type)}`}>
                                {getEventTypeLabel(event.type)}
                              </span>
                            </div>
                            {event.description && (
                              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Nuovo Evento</h3>
              <button
                onClick={resetEventForm}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titolo *
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Titolo dell'evento"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as CalendarEvent['type'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="planting">Semina/Trapianto</option>
                  <option value="harvest">Raccolto</option>
                  <option value="treatment">Trattamento</option>
                  <option value="irrigation">Irrigazione</option>
                  <option value="maintenance">Manutenzione</option>
                  <option value="other">Altro</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ora
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrizione
                </label>
                <textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Descrizione dell'evento (opzionale)"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={resetEventForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  onClick={handleCreateEvent}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Salva
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};