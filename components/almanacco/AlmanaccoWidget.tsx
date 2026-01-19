/**
 * Almanacco Widget - Dashboard Widget
 * Mostra proverbio del giorno con variante regionale (se disponibile)
 * Include: evento speciale, santo, consigli lunari, lavori specifici
 */

'use client'

import React from 'react';
import { getAlmanaccoForDate, getRegionalContentForDate } from '../../data/almanacco-database';
import { calculateMoonPhase } from '../../logic/lunarCalendar';
import { BookOpen, Share2, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface AlmanaccoWidgetProps {
  regione?: string; // Regione utente (opzionale)
  date?: Date; // Data da mostrare (default: oggi)
}

const AlmanaccoWidget: React.FC<AlmanaccoWidgetProps> = ({ 
  regione, 
  date = new Date() 
}) => {
  const almanacco = getAlmanaccoForDate(date, regione);
  const faseLunare = calculateMoonPhase(date);
  
  if (!almanacco) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
        <p>Nessun almanacco disponibile per oggi</p>
      </div>
    );
  }
  
  // Se esiste variante regionale per la regione dell'utente, usala
  // Altrimenti usa contenuto nazionale
  const hasRegional = !!(almanacco.regioni && regione && almanacco.regioni[regione.toLowerCase()]);
  const content = hasRegional 
    ? almanacco.regioni![regione!.toLowerCase()]
    : {
        proverbio: almanacco.nazionale.proverbio,
        spiegazione: almanacco.nazionale.spiegazione,
        fonte: almanacco.nazionale.fonte
      };
  
  const handleShare = () => {
    const text = `📖 Almanacco del Contadino - ${date.toLocaleDateString('it-IT', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    })}\n\n${almanacco.evento ? `🗓️ ${almanacco.evento}\n` : ''}"${content.dialetto || content.proverbio}"\n\n${content.spiegazione}\n\n🌱 Scopri di più su OrtoMio.app\n\n#AlmanaccoContadino #TradizionePopolare #OrtoMio`;
    
    if (navigator.share) {
      navigator.share({
        title: `Almanacco del Contadino - ${date.toLocaleDateString('it-IT')}`,
        text
      }).catch(() => {
        // User cancelled, do nothing
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text).then(() => {
        // Toast notification (da implementare con toast library)
        alert('Copiato negli appunti! Incollalo sui tuoi social 📱');
      });
    }
  };
  
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg shadow-md overflow-hidden">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl md:text-2xl shrink-0">
              📖
            </div>
            <div>
              <h3 className="font-bold text-lg text-amber-900">
                Almanacco del Contadino
              </h3>
              <p className="text-sm text-amber-700">
                {date.toLocaleDateString('it-IT', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleShare}
            className="p-3 rounded-lg hover:bg-amber-100 transition-colors"
            aria-label="Condividi almanacco"
          >
            <Share2 size={18} className="text-amber-700" />
          </button>
        </div>
        
        {/* Badge regione (se disponibile variante regionale) */}
        {hasRegional && (
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-amber-600" />
            <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
              📍 Tradizione {capitalize(regione!)}
            </span>
          </div>
        )}
        
        {/* Evento speciale */}
        {almanacco.evento && (
          <div className="bg-amber-100 border border-amber-300 rounded-lg p-3">
            <p className="font-semibold text-amber-900 text-sm">
              🗓️ {almanacco.evento}
            </p>
          </div>
        )}
        
        {/* Santo del giorno */}
        {almanacco.santo && (
          <div className="bg-white/70 rounded-lg p-3 text-sm border border-amber-200">
            <span className="font-semibold text-amber-900">🙏 Santo del giorno:</span>{' '}
            <span className="text-amber-800">{almanacco.santo}</span>
          </div>
        )}
        
        {/* Proverbio DIALETTO (se disponibile) */}
        {content.dialetto && (
          <div className="space-y-2">
            <blockquote className="relative pl-6">
              <div className="text-3xl text-amber-300 absolute -top-3 -left-1 select-none">"</div>
              <p className="text-xl md:text-2xl font-serif italic text-amber-900 leading-relaxed">
                {content.dialetto}
              </p>
            </blockquote>
            
            {/* Traduzione italiana (se dialetto poco comprensibile) */}
            {content.traduzione && (
              <p className="text-base text-amber-700 italic pl-6">
                ({content.traduzione})
              </p>
            )}
          </div>
        )}
        
        {/* Proverbio ITALIANO (se no dialetto) */}
        {!content.dialetto && (
          <blockquote className="relative pl-6">
            <div className="text-3xl text-amber-300 absolute -top-3 -left-1 select-none">"</div>
            <p className="text-xl md:text-2xl font-serif italic text-amber-900 leading-relaxed">
              {content.proverbio}
            </p>
          </blockquote>
        )}
        
        {/* Spiegazione */}
        <div className="bg-white/70 rounded-lg p-4 border border-amber-200">
          <p className="text-sm text-amber-900 leading-relaxed">
            {content.spiegazione}
          </p>
          {content.fonte && (
            <p className="text-xs text-amber-600 italic mt-2">
              — {content.fonte}
            </p>
          )}
        </div>
        
        {/* Lavori specifici REGIONE (se disponibile) */}
        {content.lavoriSpecifici && content.lavoriSpecifici.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-semibold text-green-900 text-sm mb-2 flex items-center gap-3">
              <span>🌱</span>
              <span>Lavori consigliati nella tua zona:</span>
            </p>
            <ul className="space-y-1.5">
              {content.lavoriSpecifici.map((lavoro, idx) => (
                <li key={idx} className="text-sm text-green-800 flex items-start gap-3">
                  <span className="text-green-600 mt-0.5 shrink-0">•</span>
                  <span>{lavoro}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Lavori specifici generici (se non specificati per regione) */}
        {!content.lavoriSpecifici && almanacco.lavoriSpecifici && almanacco.lavoriSpecifici.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-semibold text-green-900 text-sm mb-2 flex items-center gap-3">
              <span>🌱</span>
              <span>Lavori consigliati:</span>
            </p>
            <ul className="space-y-1.5">
              {almanacco.lavoriSpecifici.map((lavoro, idx) => (
                <li key={idx} className="text-sm text-green-800 flex items-start gap-3">
                  <span className="text-green-600 mt-0.5 shrink-0">•</span>
                  <span>{lavoro}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Fase lunare consiglio (se disponibile) */}
        {almanacco.luna && faseLunare && (
          <LunarAdviceBox 
            luna={almanacco.luna} 
            faseLunare={faseLunare}
          />
        )}
        
        {/* Curiosità storica/culturale */}
        {almanacco.curiosita && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 leading-relaxed">
              <strong className="text-blue-900">💡 Lo sapevi?</strong>{' '}
              {almanacco.curiosita}
            </p>
          </div>
        )}
        
        {/* CTA Buttons */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/app/planner?tab=calendar"
            className="flex-1 px-4 py-2 bg-white border border-amber-300 text-amber-900 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium flex items-center justify-center gap-3"
          >
            <BookOpen size={16} />
            Vai al Calendario
            <ArrowRight size={14} />
          </Link>
          
          <button
            onClick={handleShare}
            className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-3"
          >
            <Share2 size={16} />
            Condividi
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-component: Lunar Advice Box
function LunarAdviceBox({ 
  luna, 
  faseLunare 
}: { 
  luna: { crescente?: string; calante?: string; piena?: string; nuova?: string };
  faseLunare: { phase: string; isWaxing: boolean; isWaning: boolean };
}) {
  let consiglio = '';
  
  if (faseLunare.isWaxing && luna.crescente) {
    consiglio = luna.crescente;
  } else if (faseLunare.isWaning && luna.calante) {
    consiglio = luna.calante;
  } else if (faseLunare.phase === 'Full' && luna.piena) {
    consiglio = luna.piena;
  } else if (faseLunare.phase === 'New' && luna.nuova) {
    consiglio = luna.nuova;
  }
  
  if (!consiglio) return null;
  
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
      <p className="font-semibold text-indigo-900 text-sm mb-2">
        🌙 Consigli Lunari
      </p>
      <p className="text-sm text-indigo-800">
        {consiglio}
      </p>
    </div>
  );
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default AlmanaccoWidget;
