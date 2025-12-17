import React from 'react';
import { Recycle, Leaf, Sprout, Info } from 'lucide-react';

interface CompostBinInfoProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const CompostBinInfo: React.FC<CompostBinInfoProps> = ({ checked, onChange }) => {
  return (
    <div className={`border-2 rounded-lg p-4 transition-all ${checked ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-green-500 cursor-pointer"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Recycle size={20} className={`${checked ? 'text-green-600' : 'text-gray-400'}`} />
            <h4 className={`font-bold text-base ${checked ? 'text-green-800' : 'text-gray-700'}`}>
              🌱 Ho una compostiera
            </h4>
          </div>
          
          <div className={`space-y-2 text-sm ${checked ? 'text-green-700' : 'text-gray-600'}`}>
            <p>
              La compostiera ti permette di trasformare i <strong>materiali di risulta dell'orto</strong> 
              (scarti vegetali, foglie, erba tagliata, rami tritati) in <strong>humus fertile</strong> da 
              utilizzare come fertilizzante naturale nelle stagioni successive.
            </p>
            
            <div className="bg-white bg-opacity-50 rounded-lg p-3 mt-3 border border-current border-opacity-20">
              <div className="flex items-start gap-2 mb-2">
                <Info size={16} className="mt-0.5 flex-shrink-0" />
                <p className="font-semibold text-xs">Come funziona:</p>
              </div>
              <ul className="text-xs space-y-1.5 ml-6 list-disc">
                <li>
                  <strong>Aggiungi materiali:</strong> Il sistema ti suggerirà quando aggiungere 
                  scarti vegetali, foglie secche, erba tagliata
                </li>
                <li>
                  <strong>Gestione:</strong> Monitoraggio temperatura, umidità e tempi di maturazione
                </li>
                <li>
                  <strong>Utilizzo:</strong> Suggerimenti su quando utilizzare il compost maturo 
                  come fertilizzante per le tue coltivazioni
                </li>
                <li>
                  <strong>Benefici:</strong> Riduzione rifiuti, produzione di fertilizzante naturale, 
                  miglioramento struttura del suolo
                </li>
              </ul>
            </div>

            {checked && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-current border-opacity-20">
                <Sprout size={16} className="text-green-600" />
                <p className="text-xs font-semibold">
                  ✓ Compostiera attivata! Il sistema ti guiderà nella gestione del compost.
                </p>
              </div>
            )}
          </div>
        </div>
      </label>
    </div>
  );
};

