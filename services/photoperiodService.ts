/**
 * Calcola il fotoperiodo (ore di luce solare al giorno) per una data latitudine e data.
 * Usa l'approssimazione Spencer/Forsythe.
 */
export function calculatePhotoperiodHours(latitudeDegrees: number, date: Date): number {
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const dayOfYear = Math.ceil((date.getTime() - startOfYear.getTime()) / 86400000) + 1

  const declinationDeg = 23.45 * Math.sin(((2 * Math.PI) / 365) * (284 + dayOfYear))
  const declinationRad = (declinationDeg * Math.PI) / 180
  const latRad = (latitudeDegrees * Math.PI) / 180

  const cosHourAngle = -Math.tan(latRad) * Math.tan(declinationRad)
  const cosHourAngleClamped = Math.max(-1, Math.min(1, cosHourAngle))

  return (2 / 15) * (Math.acos(cosHourAngleClamped) * (180 / Math.PI))
}
