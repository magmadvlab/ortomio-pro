import React, { useState } from 'react';
import { Garden } from '@/types';
import { HydroponicReading, AquaponicReading } from '@/types/indoorGrowing';
import { useStorage } from '@/packages/core/hooks/useStorage';
import { Save } from 'lucide-react';

interface ReadingFormProps {
  garden: Garden;
  readingType: 'hydroponic' | 'aquaponic';
  onComplete?: () => void;
  onCancel?: () => void;
}

export const ReadingForm: React.FC<ReadingFormProps> = ({
  garden,
  readingType,
  onComplete,
  onCancel
}) => {
  const { storageProvider } = useStorage();
  const [loading, setLoading] = useState(false);

  // Hydroponic fields
  const [ph, setPh] = useState('');
  const [ec, setEc] = useState('');
  const [waterTemperature, setWaterTemperature] = useState('');
  const [reservoirVolume, setReservoirVolume] = useState('');

  // Aquaponic fields
  const [ammonia, setAmmonia] = useState('');
  const [nitrite, setNitrite] = useState('');
  const [nitrate, setNitrate] = useState('');
  const [dissolvedOxygen, setDissolvedOxygen] = useState('');

  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (readingType === 'hydroponic') {
        const reading: Omit<HydroponicReading, 'id' | 'createdAt'> = {
          gardenId: garden.id,
          readingDate: new Date().toISOString(),
          ph: ph ? parseFloat(ph) : undefined,
          ec: ec ? parseFloat(ec) : undefined,
          waterTemperature: waterTemperature ? parseFloat(waterTemperature) : undefined,
          reservoirVolume: reservoirVolume ? parseFloat(reservoirVolume) : undefined,
          notes: notes || undefined,
        };
        await storageProvider.createHydroponicReading(reading);
      } else {
        const reading: Omit<AquaponicReading, 'id' | 'createdAt'> = {
          gardenId: garden.id,
          readingDate: new Date().toISOString(),
          ph: ph ? parseFloat(ph) : undefined,
          ammonia: ammonia ? parseFloat(ammonia) : undefined,
          nitrite: nitrite ? parseFloat(nitrite) : undefined,
          nitrate: nitrate ? parseFloat(nitrate) : undefined,
          waterTemperature: waterTemperature ? parseFloat(waterTemperature) : undefined,
          dissolvedOxygen: dissolvedOxygen ? parseFloat(dissolvedOxygen) : undefined,
          notes: notes || undefined,
        };
        await storageProvider.createAquaponicReading(reading);
      }

      if (onComplete) onComplete();
    } catch (error) {
      console.error('Error saving reading:', error);
      alert('Errore nel salvare la lettura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            pH *
          </label>
          <input
            type="number"
            value={ph}
            onChange={(e) => setPh(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
            step="0.1"
            min="0"
            max="14"
            placeholder={readingType === 'hydroponic' ? '5.5-6.5' : '6.8-7.2'}
          />
        </div>

        {readingType === 'hydroponic' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                EC (mS/cm) *
              </label>
              <input
                type="number"
                value={ec}
                onChange={(e) => setEc(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
                step="0.1"
                min="0"
                max="5"
                placeholder="1.5-3.0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperatura Acqua (°C)
              </label>
              <input
                type="number"
                value={waterTemperature}
                onChange={(e) => setWaterTemperature(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                step="0.1"
                min="10"
                max="35"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Volume Serbatoio (L)
              </label>
              <input
                type="number"
                value={reservoirVolume}
                onChange={(e) => setReservoirVolume(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="0"
                step="0.1"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ammoniaca (mg/L) *
              </label>
              <input
                type="number"
                value={ammonia}
                onChange={(e) => setAmmonia(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
                step="0.1"
                min="0"
                max="5"
                placeholder="< 0.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nitriti (mg/L) *
              </label>
              <input
                type="number"
                value={nitrite}
                onChange={(e) => setNitrite(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
                step="0.1"
                min="0"
                max="5"
                placeholder="< 0.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nitrati (mg/L) *
              </label>
              <input
                type="number"
                value={nitrate}
                onChange={(e) => setNitrate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
                min="0"
                max="150"
                placeholder="20-80"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperatura Acqua (°C)
              </label>
              <input
                type="number"
                value={waterTemperature}
                onChange={(e) => setWaterTemperature(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                step="0.1"
                min="15"
                max="35"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ossigeno Disciolto (mg/L)
              </label>
              <input
                type="number"
                value={dissolvedOxygen}
                onChange={(e) => setDissolvedOxygen(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                step="0.1"
                min="0"
                max="15"
              />
            </div>
          </>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Note (opzionale)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          rows={3}
          placeholder="Note aggiuntive sulla lettura..."
        />
      </div>

      <div className="flex gap-2 justify-end pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Annulla
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Save size={18} />
          {loading ? 'Salvataggio...' : 'Salva Lettura'}
        </button>
      </div>
    </form>
  );
};










