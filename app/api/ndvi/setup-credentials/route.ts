import { NextRequest, NextResponse } from 'next/server'
import { isAccessError, requireAdmin } from '@/lib/auth.server'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    return NextResponse.json(
      {
        error: 'runtime_setup_disabled',
        message: 'Il setup delle credenziali deve avvenire nel secret manager della piattaforma.',
      },
      { status: 410 },
    )

  } catch (error: any) {
    if (isAccessError(error)) {
      return NextResponse.json({ error: error.code }, { status: error.status })
    }
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
