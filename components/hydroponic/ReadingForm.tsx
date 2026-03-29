import React, { useState } from 'react';
import { Garden } from '@/types';
import { HydroponicReading, AquaponicReading } from '@/types/indoorGrowing';
import { GreenhouseReading } from '@/types/greenhouseReading';
import { useStorage } from '@/packages/core/hooks/useStorage';
import { Save } from 'lucide-react';
import { buildControlledEnvironmentProfile } from '@/services/controlledEnvironmentService';
import { createControlledEnvironmentExecutionService } from '@/services/controlledEnvironmentExecutionService';

interface ReadingFormProps {
  garden: Garden;
  readingType: 'hydroponic' | 'aquaponic' | 'greenhouse';
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
  const [internalTemperature, setInternalTemperature] = useState('');
  const [internalHumidity, setInternalHumidity] = useState('');
  const [co2Level, setCo2Level] = useState('');
  const [lightIntensity, setLightIntensity] = useState('');

  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const executionService = createControlledEnvironmentExecutionService(storageProvider);
      const environmentProfile = buildControlledEnvironmentProfile(garden);

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
        await executionService.createObservation({
          gardenId: garden.id,
          environmentProfileId: environmentProfile.id,
          observationType: 'water_quality',
          observedAt: reading.readingDate,
          source: 'manual',
          payload: {
            readingType,
            ph: reading.ph,
            ec: reading.ec,
            temperatureCelsius: reading.waterTemperature,
            reservoirVolumeLiters: reading.reservoirVolume,
          },
          notes: reading.notes,
        });
      } else if (readingType === 'aquaponic') {
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
        await executionService.createObservation({
          gardenId: garden.id,
          environmentProfileId: environmentProfile.id,
          observationType: 'water_quality',
          observedAt: reading.readingDate,
          source: 'manual',
          payload: {
            readingType,
            ph: reading.ph,
            ammonia: reading.ammonia,
            nitrite: reading.nitrite,
            nitrate: reading.nitrate,
            temperatureCelsius: reading.waterTemperature,
            dissolvedOxygen: reading.dissolvedOxygen,
          },
          notes: reading.notes,
        });
      } else {
        const now = new Date();
        const reading: Omit<GreenhouseReading, 'id' | 'createdAt' | 'updatedAt'> = {
          gardenId: garden.id,
          readingDate: now.toISOString().slice(0, 10),
          readingTime: now.toTimeString().slice(0, 5),
          timestamp: now.toISOString(),
          internalTemperature: internalTemperature ? parseFloat(internalTemperature) : 0,
          internalHumidity: internalHumidity ? parseFloat(internalHumidity) : 0,
          co2Level: co2Level ? parseFloat(co2Level) : undefined,
          lightIntensity: lightIntensity ? parseFloat(lightIntensity) : undefined,
          ventilationActive: false,
          heatingActive: false,
          shadingActive: false,
          notes: notes || undefined,
        };
        if (storageProvider.createGreenhouseReading) {
          await storageProvider.createGreenhouseReading(reading);
        }
        await executionService.createObservation({
          gardenId: garden.id,
          environmentProfileId: environmentProfile.id,
          observationType: 'reading',
          observedAt: reading.timestamp,
          source: 'manual',
          payload: {
            readingType,
            internalTemperature: reading.internalTemperature,
            internalHumidity: reading.internalHumidity,
            co2Level: reading.co2Level,
            lightIntensity: reading.lightIntensity,
          },
          notes: reading.notes,
        });
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {readingType !== 'greenhouse' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              pH *
            </label>
            <input
              type="number"
              value={ph}
              onChange={(e) => setPh(e.target.value)}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
              required
              step="0.1"
              min="0"
              max="14"
              placeholder={readingType === 'hydroponic' ? '5.5-6.5' : '6.8-7.2'}
            />
          </div>
        )}

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
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
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
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
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
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                min="0"
                step="0.1"
              />
            </div>
          </>
        ) : readingType === 'aquaponic' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ammoniaca (mg/L) *
              </label>
              <input
                type="number"
                value={ammonia}
                onChange={(e) => setAmmonia(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
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
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
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
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
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
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
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
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                step="0.1"
                min="0"
                max="15"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperatura Interna (°C) *
              </label>
              <input
                type="number"
                value={internalTemperature}
                onChange={(e) => setInternalTemperature(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                required
                step="0.1"
                min="-10"
                max="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Umidita Interna (%) *
              </label>
              <input
                type="number"
                value={internalHumidity}
                onChange={(e) => setInternalHumidity(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                required
                step="0.1"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CO2 (ppm)
              </label>
              <input
                type="number"
                value={co2Level}
                onChange={(e) => setCo2Level(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                min="0"
                max="5000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intensita Luce (lux)
              </label>
              <input
                type="number"
                value={lightIntensity}
                onChange={(e) => setLightIntensity(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                min="0"
                max="200000"
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
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
          rows={3}
          placeholder="Note aggiuntive sulla lettura..."
        />
      </div>

      <div className="flex gap-3 justify-end pt-4">
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
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-3"
        >
          <Save size={18} />
          {loading ? 'Salvataggio...' : 'Salva Lettura'}
        </button>
      </div>
    </form>
  );
};














