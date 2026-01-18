import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check if credentials are present in environment
    const clientId = process.env.SH_CLIENT_ID;
    const clientSecret = process.env.SH_CLIENT_SECRET;
    const instanceId = process.env.ORTOMIO_WMS_CONFIG_ID;

    const status = {
      configured: !!(clientId && clientSecret),
      clientIdPresent: !!clientId,
      clientSecretPresent: !!clientSecret,
      instanceIdPresent: !!instanceId,
      isTestCredentials: clientId === 'sh-ea7b7e16-0f29-4dca-a2ec-2ea8d9845042' // Check if using test credentials
    };

    return NextResponse.json(status);
  } catch (error: any) {
    console.error('Error checking satellite config:', error);
    return NextResponse.json(
      { error: 'Failed to check configuration' },
      { status: 500 }
    );
  }
}