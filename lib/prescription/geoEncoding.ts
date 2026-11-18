import proj4 from 'proj4'
import { write } from '@mapbox/shp-write'
import type { ExportConfiguration, PrescriptionZone } from '@/types/prescriptionMaps'

export function parseUtmZone(value?: string) {
  const match = /^(\d{1,2})([NS])$/.exec(value ?? '')
  if (!match || Number(match[1]) < 1 || Number(match[1]) > 60) throw new Error('Zona UTM non valida (1–60, N/S).')
  return { number: Number(match[1]), south: match[2] === 'S' }
}

export function transformPrescriptionZones(zones: PrescriptionZone[], config: ExportConfiguration): PrescriptionZone[] {
  if (!zones.length) throw new Error('Nessuna zona da esportare.')
  if (config.coordinateSystem === 'local') throw new Error('Sistema locale non definito: usare WGS84 o UTM.')
  if (config.coordinateSystem === 'UTM' && config.format !== 'shapefile') throw new Error('La proiezione UTM è disponibile per Shapefile. Gli altri formati usano WGS84.')
  const utm = config.coordinateSystem === 'UTM' ? parseUtmZone(config.utmZone) : undefined
  const target = utm ? `+proj=utm +zone=${utm.number} ${utm.south ? '+south' : ''} +datum=WGS84 +units=m +no_defs` : undefined
  return zones.map(zone => {
    if (zone.geometry?.type !== 'Polygon' || !zone.geometry.coordinates.length) throw new Error('Geometria poligonale mancante.')
    const coordinates = zone.geometry.coordinates.map(ring => {
      if (ring.length < 4 || ring[0][0] !== ring.at(-1)![0] || ring[0][1] !== ring.at(-1)![1]) throw new Error('Anello poligonale non chiuso.')
      return ring.map(point => {
        const [lon, lat] = point
        if (!Number.isFinite(lon) || !Number.isFinite(lat) || Math.abs(lon) > 180 || Math.abs(lat) > 90) throw new Error('Coordinate WGS84 non valide.')
        if (utm && (lat < -80 || lat > 84 || (lat < 0 && !utm.south) || (lat > 0 && utm.south))) throw new Error('Latitudine o emisfero incompatibile con la zona UTM.')
        const xy = target ? proj4('EPSG:4326', target, [lon, lat]) : [lon, lat]
        if (!xy.every(Number.isFinite)) throw new Error('Trasformazione geografica non valida.')
        return xy
      })
    })
    return { ...zone, geometry: { type: 'Polygon', coordinates } }
  })
}

export function projectionWkt(config: ExportConfiguration) {
  const geographic = 'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]]'
  if (config.coordinateSystem === 'WGS84') return geographic
  const zone = parseUtmZone(config.utmZone)
  return `PROJCS["WGS 84 / UTM zone ${config.utmZone}",${geographic},PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",${zone.number * 6 - 183}],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",${zone.south ? 10000000 : 0}],UNIT["metre",1]]`
}

export async function encodePrescriptionShapefile(zones: PrescriptionZone[], config: ExportConfiguration) {
  if (!zones.length) throw new Error('Nessuna zona da esportare.')
  const encoding = config.shapefileOptions?.encoding ?? 'UTF-8'
  const string = (value: string) => {
    if (encoding === 'ASCII' && /[^\x20-\x7e]/.test(value)) throw new Error('Il testo contiene caratteri non ASCII. Selezionare UTF-8.')
    // shp-write/dbf writes char codes as bytes; explicitly encode UTF-8 before it.
    const bytes = new TextEncoder().encode(value)
    if (bytes.length > 254) throw new Error('Attributo testuale oltre il limite DBF di 254 byte.')
    return Array.from(bytes, byte => String.fromCharCode(byte)).join('')
  }
  const number = (value: number) => {
    if (!Number.isFinite(value) || value.toFixed(3).length > 18) throw new Error('Attributo numerico non rappresentabile nel DBF.')
    return Number(value.toFixed(3))
  }
  // DBF names must be <=10 characters and unique after truncation.
  const rows = zones.map(zone => ({
    zone_id: string(zone.id), zone_name: string(zone.zoneName), zone_no: number(zone.zoneNumber),
    rate: number(zone.prescription.applicationRate), unit: string(zone.prescription.unit),
    product: string(zone.prescription.productName ?? ''), area_m2: number(zone.areaSqm),
    quality: number(zone.dataQuality), confidence: number(zone.confidence),
  }))
  const geometries = zones.map(zone => zone.geometry.coordinates.map((ring, index) => {
    const area = ring.slice(0, -1).reduce((sum, point, i) => sum + point[0] * ring[i + 1][1] - ring[i + 1][0] * point[1], 0)
    if (!Number.isFinite(area) || area === 0) throw new Error('Poligono degenere.')
    // Shapefile exterior clockwise, holes counter-clockwise.
    return (index === 0 ? area > 0 : area < 0) ? [...ring].reverse() : ring
  }))
  return new Promise<{ shp: ArrayBuffer; shx: ArrayBuffer; dbf: ArrayBuffer; prj: string; cpg: string }>((resolve, reject) => {
    write(rows, 'POLYGON', geometries, (error, result) => {
      if (error) { reject(error); return }
      const buffer = (view: DataView) => new Uint8Array(view.buffer, view.byteOffset, view.byteLength).slice().buffer
      resolve({ shp: buffer(result.shp), shx: buffer(result.shx), dbf: buffer(result.dbf), prj: projectionWkt(config), cpg: encoding })
    })
  })
}
