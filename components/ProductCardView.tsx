/**
 * Componente per visualizzare schede prodotto (fertilizzanti e trattamenti)
 * UI friendly e riutilizzabile
 */

import React from 'react';
import { ProductCard } from '@/types';
import {
  Leaf,
  Shield,
  Droplet,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sun,
  Snowflake,
  Info,
  Beaker,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Sparkles
} from 'lucide-react';

interface ProductCardViewProps {
  product: ProductCard;
  onUse?: (product: ProductCard) => void; // Callback quando utente vuole usare questo prodotto
  onEdit?: (product: ProductCard) => void; // Callback per modificare
  compact?: boolean; // Modalità compatta per liste
}

const ProductCardView: React.FC<ProductCardViewProps> = ({
  product,
  onUse,
  onEdit,
  compact = false
}) => {
  const isFertilizer = product.type === 'fertilizer';

  // Icona principale basata su categoria
  const getCategoryIcon = () => {
    if (isFertilizer) {
      switch (product.category) {
        case 'organic':
          return <Leaf size={20} className="text-green-600" />;
        case 'mineral':
          return <Beaker size={20} className="text-blue-600" />;
        case 'biostimulant':
          return <Sparkles size={20} className="text-purple-600" />;
        default:
          return <Leaf size={20} className="text-green-600" />;
      }
    } else {
      switch (product.category) {
        case 'fungal':
          return <Shield size={20} className="text-amber-600" />;
        case 'pest':
          return <Shield size={20} className="text-red-600" />;
        case 'bacterial':
          return <Shield size={20} className="text-orange-600" />;
        case 'preventive':
          return <Shield size={20} className="text-blue-600" />;
        default:
          return <Shield size={20} className="text-gray-600" />;
      }
    }
  };

  // Colore bordo basato su tipo
  const borderColor = isFertilizer ? 'border-green-200' : 'border-amber-200';
  const bgColor = isFertilizer ? 'bg-green-50' : 'bg-amber-50';
  const accentColor = isFertilizer ? 'text-green-700' : 'text-amber-700';

  // Versione compatta per liste
  if (compact) {
    return (
      <div
        className={`border-2 ${borderColor} ${bgColor} rounded-xl p-3 hover:shadow-md transition-all cursor-pointer`}
        onClick={() => onUse && onUse(product)}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            {getCategoryIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-bold ${accentColor} text-sm truncate`}>{product.name}</h4>
            {product.scientificName && (
              <p className="text-xs text-gray-500 italic truncate">{product.scientificName}</p>
            )}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs bg-white px-2 py-0.5 rounded-full font-medium text-gray-700">
                {product.recommendedDosage}
              </span>
              {product.organicCertified && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                  BIO
                </span>
              )}
              {product.timesUsed !== undefined && product.timesUsed > 0 && (
                <span className="text-xs text-gray-500">
                  Usato {product.timesUsed}x
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Versione completa
  return (
    <div className={`border-2 ${borderColor} rounded-2xl overflow-hidden bg-white shadow-lg`}>
      {/* Header */}
      <div className={`${bgColor} p-4 border-b-2 ${borderColor}`}>
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            {getCategoryIcon()}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className={`font-bold text-lg ${accentColor}`}>{product.name}</h3>
                {product.scientificName && (
                  <p className="text-sm text-gray-600 italic mt-0.5">{product.scientificName}</p>
                )}
              </div>
              {product.aiGenerated && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold shrink-0">
                  AI
                </span>
              )}
            </div>

            <div className="flex gap-2 mt-2 flex-wrap">
              {product.category && (
                <span className="text-xs bg-white px-2 py-1 rounded-lg font-semibold capitalize">
                  {product.category}
                </span>
              )}
              {product.organicCertified && (
                <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-lg font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> BIOLOGICO
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Descrizione */}
        {product.description && (
          <div>
            <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Principi attivi */}
        {product.activeIngredients && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Beaker size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-blue-800 uppercase mb-1">Composizione</p>
                <p className="text-sm text-blue-900">{product.activeIngredients}</p>
              </div>
            </div>
          </div>
        )}

        {/* Dosaggio e applicazione */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Droplet size={14} className="text-gray-600" />
              <p className="text-xs font-bold text-gray-500 uppercase">Dosaggio</p>
            </div>
            <p className="text-sm font-semibold text-gray-800">{product.recommendedDosage || 'Vedi confezione'}</p>
            {product.applicationMethod && (
              <p className="text-xs text-gray-600 mt-1">{product.applicationMethod}</p>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={14} className="text-gray-600" />
              <p className="text-xs font-bold text-gray-500 uppercase">Frequenza</p>
            </div>
            <p className="text-sm font-semibold text-gray-800">
              {product.applicationFrequency || `Ogni ${product.defaultRepeatDays} giorni`}
            </p>
            {product.seasonalAdjustment && (
              <div className="flex gap-2 mt-1">
                <span className="text-xs text-orange-600 flex items-center gap-1">
                  <Sun size={10} /> x{product.seasonalAdjustment.summer}
                </span>
                <span className="text-xs text-blue-600 flex items-center gap-1">
                  <Snowflake size={10} /> x{product.seasonalAdjustment.winter}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Momento migliore */}
        {product.bestTime && (
          <div className="flex items-center gap-2 text-sm">
            <Clock size={14} className="text-purple-600" />
            <span className="font-semibold text-purple-800">Quando applicare:</span>
            <span className="text-gray-700">{product.bestTime}</span>
          </div>
        )}

        {/* Indicato per */}
        {product.bestFor && product.bestFor.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ThumbsUp size={14} className="text-green-600" />
              <p className="text-xs font-bold text-gray-700 uppercase">Indicato per</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {product.bestFor.map((item, idx) => (
                <span key={idx} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-lg">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Da evitare con */}
        {product.avoidWith && product.avoidWith.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ThumbsDown size={14} className="text-red-600" />
              <p className="text-xs font-bold text-gray-700 uppercase">Incompatibilità</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {product.avoidWith.map((item, idx) => (
                <span key={idx} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-lg">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Precauzioni */}
        {product.precautions && product.precautions.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-800 uppercase mb-1">Precauzioni</p>
                <ul className="text-xs text-amber-900 space-y-1">
                  {product.precautions.map((precaution, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="shrink-0">•</span>
                      <span>{precaution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Statistiche utilizzo */}
        {(product.timesUsed !== undefined || product.lastUsed) && (
          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              {product.timesUsed !== undefined && (
                <span>Usato {product.timesUsed} volte</span>
              )}
              {product.lastUsed && (
                <span>Ultimo uso: {new Date(product.lastUsed).toLocaleDateString('it-IT')}</span>
              )}
            </div>
          </div>
        )}

        {/* Pulsanti azione */}
        {(onUse || onEdit) && (
          <div className="flex gap-2 pt-2">
            {onUse && (
              <button
                onClick={() => onUse(product)}
                className={`flex-1 py-2 ${
                  isFertilizer ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'
                } text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2`}
              >
                {isFertilizer ? <Leaf size={16} /> : <Shield size={16} />}
                Usa questo prodotto
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(product)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                Modifica
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCardView;