import type { NextRequest } from 'next/server'
import { testSatelliteConnection } from '@/services/satelliteConnectionTest.server'

export async function POST(request: NextRequest) {
  return testSatelliteConnection(request)
}
