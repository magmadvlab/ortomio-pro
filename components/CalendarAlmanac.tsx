/**
 * CalendarAlmanac - Componente principale Calendario + Almanacco integrato
 * Integra visualizzazione calendario mensile con:
 * - Eventi stagionali (equinozi, solstizi, candelora)
 * - Detti contadini del giorno
 * - Fasi lunari
 * - Almanacco integrato come componente accessorio
 */

import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { getDettiForDate } from '../data/dettiContadini';
import { getSeasonalEventForDate } from '../logic/seasonalEvents';
import { calculateMoonPhase, MoonPhaseInfo } from '../logic/lunarCalendar';
import { GardenTask } from '../types';
import { calculateNutrientNeeds } from '../logic/nutrientEngine';
import { calculateHealthStrategy } from '../logic/healthEngine';
import { getMasterSheetSync } from '../services/plantMasterService';
import { calculatePlantDaysActive } from '../services/taskCalculationService';
import { FlaskConical, Shield, X, BookOpen, Sun } from 'lucide-react';

interface CalendarAlmanacProps {
  // Props opzionali per integrazione futura
  tasks?: GardenTask[];
  onDateClick?: (date: Date) => void;
  onUpdateTask?: (task: GardenTask) => void;
}

const CalendarAlmanac: React.FC<CalendarAlmanacProps> = ({ tasks = [], onDateClick, onUpdateTask }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [showCompletionDialog, setShowCompletionDialog] = useState<{ task: GardenTask; suggestedDate: Date } | null>(null);
  const [completionDate, setCompletionDate] = useState<string>('');
  const [showAlmanacco, setShowAlmanacco] = useState<boolean>(false);
  
  // Dati per il giorno selezionato
  const dettiOggi = getDettiForDate(selectedDate);
  const eventoStagionale = getSeasonalEventForDate(selectedDate);
  const faseLunareInfo = calculateMoonPhase(selectedDate);
  
  // Mappa emoji per fasi lunari
  const moonPhaseEmoji: Record<string, string> = {
    'New': '🌑',
    'WaxingCrescent': '🌒',
    'FirstQuarter': '🌓',
    'WaxingGibbous': '🌔',
    'Full': '🌕',
    'WaningGibbous': '🌖',
    'LastQuarter': '🌗',
    'WaningCrescent': '🌘'
  };
  
  const faseLunare = faseLunareInfo ? {
    ...faseLunareInfo,
    emoji: moonPhaseEmoji[faseLunareInfo.phase] || '🌙',
    consiglio: faseLunareInfo.isWaxing 
      ? 'Luna crescente: ideale per semine di ortaggi da foglia e frutto'
      : faseLunareInfo.isWaning
      ? 'Luna calante: ideale per semine di ortaggi da radice e potature'
      : faseLunareInfo.phase === 'Full'
      ? 'Luna piena: momento ideale per raccolto e raccolta erbe officinali'
      : 'Luna nuova: riposo, pianificazione e preparazione terreno'
  } : null;
  
  // Calcola giorni del mese (include giorni mese precedente/successivo per griglia completa)
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Lunedì
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (onDateClick) {
      onDateClick(date);
    }
  };

  const handleDateDoubleClick = (date: Date) => {
    // Double click per creare un nuovo task
    if (onDateClick) {
      onDateClick(date);
    }
    // Qui potresti aprire un modal per creare un task
    console.log('Double click su data:', date);
  };
  
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-col md:flex-col md:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800">📅 Calendario</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handlePrevMonth}
            className="p-3 rounded-lg hover:bg-green-100 transition-colors"
            aria-label="Mese precedente"
          >
            ←
          </button>
          <h2 className="text-lg md:text-lg md:text-xl font-semibold text-gray-700 min-w-[200px] text-center">
            {format(currentMonth, 'MMMM yyyy', { locale: it })}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-3 rounded-lg hover:bg-green-100 transition-colors"
            aria-label="Mese successivo"
          >
            →
          </button>
          <button
            onClick={() => {
              const today = new Date()
              setCurrentMonth(today)
              setSelectedDate(today)
            }}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Oggi
          </button>
          {/* Pulsante Almanacco */}
          <button
            onClick={() => setShowAlmanacco(!showAlmanacco)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showAlmanacco 
                ? 'bg-orange-600 text-white hover:bg-orange-700' 
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
            title={showAlmanacco ? 'Nascondi almanacco' : 'Mostra almanacco'}
          >
            <Sun size={16} />
            Almanacco
          </button>
        </div>
      </div>
      
      {/* Calendario Mensile */}
      <div className="bg-white rounded-lg shadow-md p-4">
        {/* Intestazioni giorni */}
        <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-7 gap-3 mb-2">
          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Griglia giorni */}
        <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-7 gap-3">
          {days.map(day => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isDayToday = isToday(day);
            const isSelected = isSameDay(day, selectedDate);
            
            // Task per questo giorno
            const dayTasks = (tasks || []).filter(t => {
              const taskDate = t.suggestedDate ? parseISO(t.suggestedDate) : parseISO(t.date);
              return isSameDay(taskDate, day);
            });
            const suggestedTasks = (dayTasks || []).filter(t => t.isSuggested);
            const manualTasks = (dayTasks || []).filter(t => !t.isSuggested);
            
            // Dati per questo giorno
            const dettiGiorno = getDettiForDate(day);
            const eventoGiorno = getSeasonalEventForDate(day);
            const faseLunareGiornoInfo = calculateMoonPhase(day);
            const faseLunareGiorno = faseLunareGiornoInfo ? {
              ...faseLunareGiornoInfo,
              emoji: moonPhaseEmoji[faseLunareGiornoInfo.phase] || '🌙'
            } : null;
            
            return (
              <div
                key={day.toString()}
                onClick={() => handleDateClick(day)}
                onDoubleClick={() => handleDateDoubleClick(day)}
                className={`
                  min-h-[100px] p-2 rounded-lg border-2 transition-all cursor-pointer
                  hover:border-green-500 hover:shadow-md hover:scale-[1.02]
                  ${isSelected ? 'border-green-600 bg-green-50 shadow-md' : 'border-gray-200 bg-white'}
                  ${isDayToday && !isSelected ? 'ring-2 ring-green-500 border-green-400' : ''}
                  ${!isCurrentMonth ? 'opacity-40' : ''}
                `}
                title={`${format(day, 'dd/MM/yyyy')} - Clicca per dettagli, doppio click per aggiungere task`}
              >
                {/* Numero giorno */}
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-3">
                  <span className={`
                    text-lg font-semibold
                      ${isDayToday ? 'text-green-600 font-bold' : 'text-gray-900'}
                  `}>
                    {format(day, 'd')}
                  </span>
                    {/* Badge Task Count */}
                    {dayTasks.length > 0 && (
                      <span className={`
                        text-xs font-bold px-1.5 py-0.5 rounded-full
                        ${isDayToday 
                          ? 'bg-green-600 text-white' 
                          : dayTasks.some(t => !t.completed)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-300 text-gray-700'
                        }
                      `}>
                        {(dayTasks || []).filter(t => !t.completed).length || (dayTasks || []).length}
                      </span>
                    )}
                  </div>
                  
                  {/* Icone eventi */}
                  <div className="flex items-center gap-3">
                    {eventoGiorno && (
                      <span className="text-sm" title={eventoGiorno.name}>
                        {eventoGiorno.emoji}
                      </span>
                    )}
                    {faseLunareGiorno && ['Full', 'New'].includes(faseLunareGiorno.phase) && (
                      <span className="text-sm" title={faseLunareGiorno.name}>
                        {faseLunareGiorno.emoji}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Task suggeriti */}
                {suggestedTasks.length > 0 && (
                  <div className="text-xs text-blue-600 font-semibold truncate" title={`${suggestedTasks.length} task suggeriti`}>
                    💡 {suggestedTasks.length} suggerito{suggestedTasks.length > 1 ? 'i' : ''}
                  </div>
                )}
                
                {/* Lavorazioni meccaniche */}
                {(dayTasks || []).some(t => t.taskType === 'Plowing' || t.taskType === 'Tilling') && (
                  <div className="text-xs text-orange-600 font-semibold truncate" title="Lavorazioni meccaniche">
                    🚜 {(dayTasks || []).filter(t => t.taskType === 'Plowing' || t.taskType === 'Tilling').length} lavoraz.
                  </div>
                )}
                
                {/* Potatura alberi */}
                {(dayTasks || []).some(t => t.taskType === 'TreePruning') && (
                  <div className="text-xs text-green-700 font-semibold truncate" title="Potatura alberi">
                    ✂️ {(dayTasks || []).filter(t => t.taskType === 'TreePruning').length} potatura
                  </div>
                )}
                
                {/* Task manuali */}
                {manualTasks.length > 0 && (
                  <div className="text-xs text-green-600 font-semibold truncate" title={`${manualTasks.length} task manuali`}>
                    ✓ {manualTasks.length} task
                  </div>
                )}
                
                {/* Detti o eventi */}
                {dettiGiorno.length > 0 && (
                  <div className="text-xs text-gray-600 truncate" title={dettiGiorno[0].detto}>
                    💬 {dettiGiorno[0].detto.substring(0, 20)}...
                  </div>
                )}
                
                {eventoGiorno && (
                  <div className="text-xs text-blue-600 font-semibold truncate" title={eventoGiorno.name}>
                    {eventoGiorno.emoji} {eventoGiorno.name.substring(0, 15)}...
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Pannello Dettagli Giorno Selezionato */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg md:text-lg md:text-xl font-bold text-gray-800 capitalize">
          {format(selectedDate, 'EEEE d MMMM yyyy', { locale: it })}
        </h3>
          {isToday(selectedDate) && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              Oggi
            </span>
          )}
        </div>

        {/* Almanacco Integrato - Mostra solo se attivato */}
        {showAlmanacco && (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Sun className="text-orange-600" size={24} />
                <h4 className="font-bold text-orange-900">📖 Almanacco del Giorno</h4>
              </div>
              <button
                onClick={() => setShowAlmanacco(false)}
                className="p-1 hover:bg-orange-200 rounded-full transition-colors"
                title="Chiudi almanacco"
              >
                <X size={16} className="text-orange-600" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fase Lunare nell'almanacco */}
              {faseLunare && (
                <div className="bg-white/70 rounded-lg p-3 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{faseLunare.emoji}</span>
                    <div>
                      <h5 className="font-semibold text-orange-900 text-sm">{faseLunare.name}</h5>
                      <p className="text-xs text-orange-700">{faseLunare.consiglio}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Evento Stagionale nell'almanacco */}
              {eventoStagionale && (
                <div className="bg-white/70 rounded-lg p-3 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{eventoStagionale.emoji}</span>
                    <div>
                      <h5 className="font-semibold text-orange-900 text-sm">{eventoStagionale.name}</h5>
                      <p className="text-xs text-orange-700">{eventoStagionale.description}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Detti Contadini nell'almanacco */}
              {dettiOggi.length > 0 && (
                <div className="bg-white/70 rounded-lg p-3 border border-orange-200 md:col-span-2">
                  <h5 className="font-semibold text-orange-900 mb-2 text-sm flex items-center gap-2">
                    <BookOpen size={16} />
                    Saggezza Contadina
                  </h5>
                  {dettiOggi.slice(0, 1).map((detto, idx) => (
                    <div key={idx}>
                      <blockquote className="text-sm italic text-orange-800 mb-1">
                        "{detto.detto}"
                      </blockquote>
                      {detto.consiglioOrto && (
                        <p className="text-xs text-orange-700 font-medium">
                          💡 {detto.consiglioOrto}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Fase Lunare - Solo se almanacco non è mostrato */}
        {!showAlmanacco && faseLunare && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{faseLunare.emoji}</span>
              <div>
                <h4 className="font-semibold text-indigo-900">{faseLunare.name}</h4>
                <p className="text-sm text-indigo-700">{faseLunare.consiglio}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Evento Stagionale - Solo se almanacco non è mostrato */}
        {!showAlmanacco && eventoStagionale && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{eventoStagionale.emoji}</span>
              <div>
                <h4 className="font-semibold text-blue-900">{eventoStagionale.name}</h4>
                <p className="text-sm text-blue-700">{eventoStagionale.description}</p>
                {eventoStagionale.consiglioOrto && (
                  <p className="text-sm text-blue-800 mt-2 italic">
                    💡 {eventoStagionale.consiglioOrto}
                  </p>
                )}
                {eventoStagionale.proverbio && (
                  <p className="text-sm text-blue-800 mt-2 font-serif italic">
                    "{eventoStagionale.proverbio}"
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Detti Contadini - Solo se almanacco non è mostrato */}
        {!showAlmanacco && dettiOggi.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2">📖 Detti Contadini</h4>
            {dettiOggi.map((detto, idx) => (
              <div key={idx} className="mb-3 last:mb-0">
                <blockquote className="relative pl-6">
                  <div className="text-3xl text-amber-300 absolute -top-3 -left-1 select-none">"</div>
                  <p className="text-lg font-serif italic text-amber-900 leading-relaxed">
                    {detto.detto}
                  </p>
                </blockquote>
                {detto.spiegazione && (
                  <p className="text-sm text-amber-700 mt-2 pl-6">
                    {detto.spiegazione}
                  </p>
                )}
                {detto.consiglioOrto && (
                  <p className="text-sm text-amber-800 mt-2 pl-6 font-semibold">
                    💡 {detto.consiglioOrto}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Task del Giorno */}
        {(() => {
          const dayTasks = (tasks || []).filter(t => {
            const taskDate = t.suggestedDate ? parseISO(t.suggestedDate) : parseISO(t.date);
            return isSameDay(taskDate, selectedDate);
          });
          const suggestedTasks = (dayTasks || []).filter(t => t.isSuggested && !t.completed);
          const completedTasks = (dayTasks || []).filter(t => t.completed);
          const manualTasks = (dayTasks || []).filter(t => !t.isSuggested && !t.completed);
          
          return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-green-900">📋 Task del Giorno</h4>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs font-bold">
                    {dayTasks.length} totali
                  </span>
                  <button
                    onClick={() => onDateClick && onDateClick(selectedDate)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                    title="Aggiungi nuovo task per questo giorno"
                  >
                    <span>+</span>
                    Aggiungi Task
                  </button>
                </div>
              </div>
              
              {dayTasks.length === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-gray-500 mb-2">Nessun task per questo giorno</p>
                  <button
                    onClick={() => onDateClick && onDateClick(selectedDate)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Crea il primo task
                  </button>
                </div>
              )}
              
              {/* Task suggeriti */}
              {suggestedTasks.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-blue-700 mb-2">💡 Suggerimenti ({suggestedTasks.length})</h5>
                  <div className="space-y-2">
                    {suggestedTasks.map(task => (
                      <div key={task.id} className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{task.plantName} - {task.taskType}</p>
                            {task.suggestedDate && (
                              <p className="text-xs text-blue-600 mt-1">
                                Suggerito per: {format(parseISO(task.suggestedDate), 'dd/MM/yyyy')}
                              </p>
                            )}
                            {task.notes && (
                              <p className="text-xs text-gray-600 mt-1">{task.notes}</p>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setShowCompletionDialog({ task, suggestedDate: task.suggestedDate ? parseISO(task.suggestedDate) : selectedDate });
                              setCompletionDate(format(selectedDate, 'yyyy-MM-dd'));
                            }}
                            className="ml-2 px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Completa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Task manuali */}
              {manualTasks.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-green-700 mb-2">✓ Task Manuali ({manualTasks.length})</h5>
                  <div className="space-y-2">
                    {manualTasks.map(task => (
                      <div key={task.id} className="bg-white rounded-lg p-3 border border-green-200">
                        <p className="font-medium text-gray-900">{task.plantName} - {task.taskType}</p>
                        {task.notes && (
                          <p className="text-xs text-gray-600 mt-1">{task.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Task completati */}
              {completedTasks.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">✅ Completati ({completedTasks.length})</h5>
                  <div className="space-y-2">
                    {completedTasks.map(task => {
                      const suggestedDate = task.suggestedDate ? parseISO(task.suggestedDate) : null;
                      const actualDate = task.actualCompletedDate ? parseISO(task.actualCompletedDate) : parseISO(task.date);
                      const dateDiff = suggestedDate && !isSameDay(suggestedDate, actualDate);
                      
                      return (
                        <div key={task.id} className="bg-white rounded-lg p-3 border border-gray-200 opacity-75">
                          <p className="font-medium text-gray-700 line-through">{task.plantName} - {task.taskType}</p>
                          {dateDiff && suggestedDate && (
                            <p className="text-xs text-orange-600 mt-1">
                              Suggerito: {format(suggestedDate, 'dd/MM')} → Completato: {format(actualDate, 'dd/MM')}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* AI Consigli Nutrizione e Salute */}
        {(() => {
          const dayTasks = (tasks || []).filter(t => {
            const taskDate = t.suggestedDate ? parseISO(t.suggestedDate) : parseISO(t.date);
            return isSameDay(taskDate, selectedDate);
          });

          const activeTasks = (dayTasks || []).filter(t => !t.completed && (t.taskType === 'Sowing' || t.taskType === 'Transplant'));

          if (activeTasks.length === 0) return null;

          return (
            <div className="space-y-3">
              {activeTasks.slice(0, 2).map(task => {
                const masterSheet = getMasterSheetSync(task.plantName);
                if (!masterSheet) return null;

                const daysActive = calculatePlantDaysActive(dayTasks, task.plantName, task.variety);
                if (daysActive === null) return null;

                // Consigli nutrizionali
                const nutrientAdvice = calculateNutrientNeeds(masterSheet, daysActive);
                const healthAdvice = calculateHealthStrategy(masterSheet, daysActive);

                return (
                  <div key={task.id} className="space-y-3">
                    {/* Nutrizione */}
                    {nutrientAdvice && (
                      <div className={`p-4 rounded-xl border-2 ${
                        nutrientAdvice.elementFocus === 'N' ? 'bg-green-50 border-green-200' :
                        nutrientAdvice.elementFocus === 'P' ? 'bg-blue-50 border-blue-200' :
                        nutrientAdvice.elementFocus === 'K' ? 'bg-orange-50 border-orange-200' :
                        'bg-purple-50 border-purple-200'
                      }`}>
                        <div className="flex items-center gap-3 mb-2">
                          <FlaskConical size={16} className={
                            nutrientAdvice.elementFocus === 'N' ? 'text-green-600' :
                            nutrientAdvice.elementFocus === 'P' ? 'text-blue-600' :
                            nutrientAdvice.elementFocus === 'K' ? 'text-orange-600' :
                            'text-purple-600'
                          } />
                          <div>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                nutrientAdvice.elementFocus === 'N' ? 'bg-green-100 text-green-700' :
                                nutrientAdvice.elementFocus === 'P' ? 'bg-blue-100 text-blue-700' :
                                nutrientAdvice.elementFocus === 'K' ? 'bg-orange-100 text-orange-700' :
                                'bg-purple-100 text-purple-700'
                              }`}>
                                {{N: 'Azoto', P: 'Fosforo', K: 'Potassio', Micro: 'Micronutrienti', None: 'Nessuno'}[nutrientAdvice.elementFocus]}
                              </span>
                              <span className="text-[10px] text-gray-500 uppercase">
                                {task.plantName}
                              </span>
                            </div>
                            <h4 className={`font-bold text-sm mt-1 ${
                              nutrientAdvice.elementFocus === 'N' ? 'text-green-800' :
                              nutrientAdvice.elementFocus === 'P' ? 'text-blue-800' :
                              nutrientAdvice.elementFocus === 'K' ? 'text-orange-800' :
                              'text-purple-800'
                            }`}>
                              {nutrientAdvice.adviceTitle}
                            </h4>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{nutrientAdvice.adviceBody}</p>
                      </div>
                    )}

                    {/* Salute */}
                    {healthAdvice && (
                      <div className={`p-4 rounded-xl border-2 ${
                        healthAdvice.priority === 'High' ? 'bg-red-50 border-red-200' :
                        healthAdvice.priority === 'Medium' ? 'bg-orange-50 border-orange-200' :
                        'bg-yellow-50 border-yellow-200'
                      }`}>
                        <div className="flex items-center gap-3 mb-2">
                          <Shield size={16} className={
                            healthAdvice.priority === 'High' ? 'text-red-600' :
                            healthAdvice.priority === 'Medium' ? 'text-orange-600' :
                            'text-yellow-600'
                          } />
                          <div>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                healthAdvice.priority === 'High' ? 'bg-red-100 text-red-700' :
                                healthAdvice.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {healthAdvice.actionType === 'Prevent' ? 'Prevenzione' : 'Monitoraggio'}
                              </span>
                              <span className="text-[10px] text-gray-500 uppercase">
                                {task.plantName}
                              </span>
                            </div>
                            <h4 className={`font-bold text-sm mt-1 ${
                              healthAdvice.priority === 'High' ? 'text-red-800' :
                              healthAdvice.priority === 'Medium' ? 'text-orange-800' :
                              'text-yellow-800'
                            }`}>
                              {healthAdvice.productToUse}
                            </h4>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{healthAdvice.reason}</p>
                        {healthAdvice.dosage && (
                          <p className="text-xs text-gray-600 mt-2">
                            <strong>Dosaggio:</strong> {healthAdvice.dosage}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}

      </div>
      
      {/* Dialog per completamento task suggerito */}
      {showCompletionDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg md:text-lg md:text-xl font-bold text-gray-900 mb-4">Completa Task Suggerito</h3>
            <p className="text-gray-700 mb-2">
              <strong>{showCompletionDialog.task.plantName}</strong> - {showCompletionDialog.task.taskType}
            </p>
            <p className="text-sm text-blue-600 mb-4">
              Suggerito per: {format(showCompletionDialog.suggestedDate, 'dd/MM/yyyy')}
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data di completamento
              </label>
              <input
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (onUpdateTask && completionDate) {
                    const updatedTask: GardenTask = {
                      ...showCompletionDialog.task,
                      completed: true,
                      date: completionDate,
                      actualCompletedDate: new Date(completionDate).toISOString()
                    };
                    onUpdateTask(updatedTask);
                  }
                  setShowCompletionDialog(null);
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Conferma
              </button>
              <button
                onClick={() => setShowCompletionDialog(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarAlmanac;
