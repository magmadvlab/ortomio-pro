import { NextRequest, NextResponse } from 'next/server';
import { isAccessError, requireAdmin } from '@/lib/auth.server';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    return NextResponse.json(
      {
        error: 'runtime_secret_writes_disabled',
        message: 'Configura le credenziali Sentinel Hub nel secret manager della piattaforma e ridistribuisci l\'applicazione.',
      },
      { status: 410 },
    );

  } catch (error: any) {
    if (isAccessError(error)) {
      return NextResponse.json({ error: error.code }, { status: error.status });
    }
    console.error('Error saving NDVI credentials:', error);
    return NextResponse.json(
      { error: 'internal_error' },
      { status: 500 }
    );
  }
}
