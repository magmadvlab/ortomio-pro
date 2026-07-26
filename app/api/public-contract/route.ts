import { NextRequest, NextResponse } from 'next/server'
import { verifyTier } from '@/lib/auth.server'

export async function GET(request: NextRequest) {
  const result = await verifyTier(request, ['PLUS', 'PRO'])
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json({
    version: 'v1',
    contracts: [
      {
        name: 'agronomist-consultations',
        status: 'implemented',
        endpoints: [
          '/api/agronomist-consultations',
          '/api/agronomist-advice',
        ],
      },
      {
        name: 'ai-suggestions',
        status: 'implemented',
        endpoints: [
          '/api/ai/suggestions',
          '/api/ai/chat',
        ],
      },
      {
        name: 'projection-ledger',
        status: 'implemented',
        endpoints: [
          '/api/ledger/operational',
        ],
      },
      {
        name: 'external-api',
        status: 'not-in-release-scope',
        note: 'The commercial 1.0 scope does not expose a public SDK or webhook gateway.',
      },
    ],
  })
}
