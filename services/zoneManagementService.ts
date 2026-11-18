import type { IStorageProvider } from '@/packages/core/storage/interface'

export interface ZoneAnalysis {
  zoneId: string
  statistics: { area: number; fieldCount: number | null; rowCount: number | null; avgFieldSize: number | null }
  recommendations: { optimizationSuggestions: string[]; irrigationRecommendations: string[]; plantingRecommendations: string[] }
}

/** Prescription zones belong to persisted maps, not land_zones.
 * Do not query land-zone IDs using prescription-zone IDs or invent spatial relationships.
 */
export class ZoneManagementService {
  constructor(private storage: Pick<IStorageProvider, 'getPrescriptionMap'>) {}

  async analyzeZone(zoneId: string, mapId: string, gardenId: string): Promise<ZoneAnalysis> {
    if (!this.storage.getPrescriptionMap) throw new Error('Lettura delle mappe non disponibile.')
    const map = await this.storage.getPrescriptionMap(mapId)
    if (!map || map.gardenId !== gardenId) throw new Error('Mappa non disponibile per questo terreno.')
    const zone = map.zones.find(item => item.id === zoneId && item.prescriptionMapId === mapId)
    if (!zone) throw new Error('Zona non presente nella mappa salvata. Ricarica la mappa.')
    if (!Number.isFinite(zone.areaSqm) || zone.areaSqm <= 0) throw new Error('La superficie della zona non è valida.')
    const optimizationSuggestions: string[] = []
    if (!Number.isFinite(zone.confidence) || zone.confidence < 50) optimizationSuggestions.push('Confidenza bassa o non disponibile: acquisire ulteriori osservazioni prima dell’applicazione.')
    if (!Number.isFinite(zone.dataQuality) || zone.dataQuality < 60) optimizationSuggestions.push('Qualità delle fonti insufficiente: verificare i dati utilizzati nella generazione.')
    if (zone.zoneType === 'exclusion') optimizationSuggestions.push('Zona di esclusione: non applicare prodotti in questa geometria.')
    else if (!Number.isFinite(zone.prescription.applicationRate) || zone.prescription.applicationRate < 0 || !zone.prescription.unit) {
      optimizationSuggestions.push('Dose o unità non valida: correggere la prescrizione prima dell’export.')
    } else optimizationSuggestions.push(`Dose registrata: ${zone.prescription.applicationRate} ${zone.prescription.unit}. Verificare prodotto e condizioni prima dell’applicazione.`)
    return {
      zoneId,
      statistics: { area: zone.areaSqm, fieldCount: null, rowCount: null, avgFieldSize: null },
      recommendations: {
        optimizationSuggestions,
        irrigationRecommendations: zone.sourceData.irrigationHistory !== undefined
          ? ['È presente uno storico irriguo nella mappa; verificare periodo e misure prima di modificare il piano.']
          : ['La zona non contiene uno storico irriguo: non è possibile dedurne un fabbisogno.'],
        plantingRecommendations: ['Campi e filari non sono associati automaticamente alle geometrie prescrittive. Consultare la struttura del terreno prima di pianificare impianti.'],
      },
    }
  }
}

export const createZoneManagementService = (storage: Pick<IStorageProvider, 'getPrescriptionMap'>) => new ZoneManagementService(storage)
export default ZoneManagementService
