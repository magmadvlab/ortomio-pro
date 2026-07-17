import { NextRequest, NextResponse } from 'next/server';
import { isAccessError, requireAdmin } from '@/lib/auth.server';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    // Check environment variables for Sentinel Hub credentials
    const clientId = process.env.SH_CLIENT_ID;
    const clientSecret = process.env.SH_CLIENT_SECRET;
    const instanceId = process.env.SH_INSTANCE_ID;

    const config = {
      configured: !!(clientId && clientSecret),
      clientIdPresent: !!clientId,
      clientSecretPresent: !!clientSecret,
      instanceIdPresent: !!instanceId,
      isTestCredentials: false // We'll determine this based on the actual credentials
    };

    // Check if using test credentials
    if (clientId && clientId.includes('test') || clientId === 'a9646191-f172-4e6e-a965-670c4a222898') {
      config.isTestCredentials = true;
    }

    return NextResponse.json(config);
  } catch (error: any) {
    if (isAccessError(error)) {
      return NextResponse.json({ error: error.code }, { status: error.status });
    }
    console.error('Error checking NDVI config status:', error);
    return NextResponse.json(
      { error: 'Failed to check configuration status' },
      { status: 500 }
    );
  }
}
