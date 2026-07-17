import { Buffer } from 'node:buffer'
import { NextRequest, NextResponse } from 'next/server'
import { accessErrorResponse, requireGardenAccess } from '@/lib/auth.server'
import { requireSupabase } from '@/lib/supabase-server'
import { NDVI_ALGORITHM_VERSION, hashNDVIRequest, parseLatestSentinelNDVI, validateNDVIBounds } from '@/services/ndviProvenanceService'

const evalscript = `//VERSION=3
function setup() {
  return { input: [{ bands: ["B04", "B08", "SCL", "dataMask"] }], output: [{ id: "ndvi", bands: 1, sampleType: "FLOAT32" }, { id: "dataMask", bands: 1 }] };
}
function evaluatePixel(sample) {
  const cloud = sample.SCL === 3 || sample.SCL === 8 || sample.SCL === 9 || sample.SCL === 10 || sample.SCL === 11;
  const denominator = sample.B08 + sample.B04;
  const valid = sample.dataMask === 1 && !cloud && sample.SCL !== 6 && denominator !== 0;
  return { ndvi: [valid ? (sample.B08 - sample.B04) / denominator : 0], dataMask: [valid ? 1 : 0] };
}`

const isoBoundary = (value: unknown, fallback: Date, end = false) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(value)) return fallback.toISOString()
  const date = new Date(`${value.slice(0, 10)}T${end ? '23:59:59' : '00:00:00'}Z`)
  return Number.isFinite(date.getTime()) ? date.toISOString() : fallback.toISOString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const gardenId = typeof body?.gardenId === 'string' ? body.gardenId : ''
    if (!gardenId) return NextResponse.json({ error: 'garden_id_required' }, { status: 400 })
    const { user } = await requireGardenAccess(request, gardenId)
    const bbox = validateNDVIBounds(body?.bbox)
    if (!bbox) return NextResponse.json({ error: 'invalid_bbox' }, { status: 400 })
    const clientId = process.env.SH_CLIENT_ID
    const clientSecret = process.env.SH_CLIENT_SECRET
    if (!clientId || !clientSecret) {
      return NextResponse.json({ status: 'unavailable', sourceKind: 'fallback', error: 'sentinel_credentials_unavailable' }, { status: 503 })
    }

    const now = new Date()
    const fromFallback = new Date(now.getTime() - 30 * 86_400_000)
    const from = isoBoundary(body?.dateFrom, fromFallback)
    const to = isoBoundary(body?.dateTo, now, true)
    if (new Date(from) >= new Date(to)) return NextResponse.json({ error: 'invalid_time_range' }, { status: 400 })
    const cloudCoverage = Math.max(0, Math.min(100, Number(body?.cloudCoverage ?? 20)))
    const tokenResponse = await fetch('https://sh.dataspace.copernicus.eu/oauth/token', {
      method: 'POST',
      headers: { Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    })
    if (!tokenResponse.ok) return NextResponse.json({ status: 'unavailable', sourceKind: 'fallback', error: 'sentinel_auth_failed' }, { status: 502 })
    const token = await tokenResponse.json()
    const providerRequest = {
      input: {
        bounds: { bbox: [bbox.west, bbox.south, bbox.east, bbox.north], properties: { crs: 'http://www.opengis.net/def/crs/EPSG/0/4326' } },
        data: [{ type: 'sentinel-2-l2a', dataFilter: { maxCloudCoverage: cloudCoverage, mosaickingOrder: 'leastCC' } }],
      },
      aggregation: { timeRange: { from, to }, aggregationInterval: { of: 'P5D' }, evalscript, resx: 10, resy: 10 },
      calculations: { ndvi: {} },
    }
    const statsResponse = await fetch('https://sh.dataspace.copernicus.eu/api/v1/statistics', {
      method: 'POST', headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(providerRequest),
    })
    if (!statsResponse.ok) return NextResponse.json({ status: 'unavailable', sourceKind: 'fallback', error: 'sentinel_statistics_failed', providerStatus: statsResponse.status }, { status: 502 })
    const providerPayload = await statsResponse.json()
    const latest = parseLatestSentinelNDVI(providerPayload)
    if (!latest) return NextResponse.json({ status: 'insufficient_data', sourceKind: 'real', error: 'no_valid_satellite_pixels' }, { status: 422 })

    const requestHash = hashNDVIRequest({ gardenId, bbox, from, to, cloudCoverage, algorithmVersion: NDVI_ALGORITHM_VERSION })
    const center = { latitude: (bbox.north + bbox.south) / 2, longitude: (bbox.east + bbox.west) / 2 }
    const qualityStatus = latest.validPixelPercent >= 70 ? 'accepted' : latest.validPixelPercent >= 30 ? 'warning' : 'rejected'
    const supabase = requireSupabase()
    const persistence = {
      garden_id: gardenId, latitude: center.latitude, longitude: center.longitude,
      ndvi_value: latest.stats.mean, data_date: latest.to.slice(0, 10), data_quality: Math.round(latest.validPixelPercent),
      data_source: 'sentinel_hub_statistics', resolution_meters: 10, provider: 'sentinel-hub',
      acquisition_from: latest.from, acquisition_to: latest.to, bbox, algorithm_version: NDVI_ALGORITHM_VERSION,
      quality_status: qualityStatus, source_kind: 'real', statistics: latest.stats, input_hash: requestHash,
      cloud_cover_pct: null, masked_pixel_pct: Number((100 - latest.validPixelPercent).toFixed(2)),
      cloud_cover_filter_max: cloudCoverage, user_id: user.id,
    }
    const { error: persistenceError } = await supabase.from('ndvi_data_cache').upsert(persistence, { onConflict: 'garden_id,latitude,longitude,data_date' })
    if (persistenceError) throw new Error(`ndvi_persistence_failed:${persistenceError.message}`)
    return NextResponse.json({
      success: qualityStatus !== 'rejected', status: qualityStatus === 'rejected' ? 'insufficient_data' : 'available',
      sourceKind: 'real', provider: 'sentinel-hub', algorithmVersion: NDVI_ALGORITHM_VERSION,
      ndvi: latest.stats.mean, minNdvi: latest.stats.min, maxNdvi: latest.stats.max,
      date: latest.to, cloudCoverage: null, maskedPixelPercent: persistence.masked_pixel_pct, validPixelPercent: latest.validPixelPercent,
      qualityStatus, stats: latest.stats, bbox, resolutionMeters: 10, inputHash: requestHash,
    }, { status: qualityStatus === 'rejected' ? 422 : 200 })
  } catch (error) {
    const access = accessErrorResponse(error)
    if (access) return access
    console.error('NDVI statistics failed:', error)
    return NextResponse.json({ status: 'unavailable', sourceKind: 'fallback', error: error instanceof Error ? error.message : 'ndvi_failed' }, { status: 500 })
  }
}
