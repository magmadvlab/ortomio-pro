import type { PrescriptionZone } from '@/types/prescriptionMaps'

/** Project stored WGS84 rings for a local field preview; preserve interior holes. */
export function prescriptionPreview(zones: PrescriptionZone[]) {
  const valid = zones.filter(zone => zone.geometry?.type === 'Polygon' && Array.isArray(zone.geometry.coordinates) && zone.geometry.coordinates.length > 0 &&
    zone.geometry.coordinates.every(ring => Array.isArray(ring) && ring.length >= 4 && ring.every(point =>
      Array.isArray(point) && point.length >= 2 && Number.isFinite(point[0]) && Number.isFinite(point[1]) && Math.abs(point[0]) <= 180 && Math.abs(point[1]) <= 90)))
  const points = valid.flatMap(zone => zone.geometry.coordinates.flat())
  if (!points.length) return { paths: [], invalidCount: zones.length }
  const minLon = Math.min(...points.map(point => point[0]))
  const maxLon = Math.max(...points.map(point => point[0]))
  const minLat = Math.min(...points.map(point => point[1]))
  const maxLat = Math.max(...points.map(point => point[1]))
  const longitudeScale = Math.max(0.01, Math.cos(((minLat + maxLat) / 2) * Math.PI / 180))
  const width = (maxLon - minLon) * longitudeScale
  const height = maxLat - minLat
  const scale = 360 / Math.max(width, height, 0.000001)
  const offsetX = (400 - width * scale) / 2
  const offsetY = (400 - height * scale) / 2
  return {
    invalidCount: zones.length - valid.length,
    paths: valid.map(zone => ({ id: zone.id, path: zone.geometry.coordinates.map(ring =>
      ring.map((point, index) => `${index === 0 ? 'M' : 'L'}${((point[0] - minLon) * longitudeScale * scale + offsetX).toFixed(3)},${((maxLat - point[1]) * scale + offsetY).toFixed(3)}`).join(' ') + ' Z').join(' ') })),
  }
}
