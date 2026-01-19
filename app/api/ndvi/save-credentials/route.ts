import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, clientSecret, instanceId } = body;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Client ID and Client Secret are required' },
        { status: 400 }
      );
    }

    // Validate Client ID format (should start with 'sh-' for Sentinel Hub)
    if (!clientId.startsWith('sh-') && !clientId.includes('-')) {
      return NextResponse.json(
        { error: 'Invalid Client ID format. Should be in format: sh-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
        { status: 400 }
      );
    }

    // Path to .env.local file
    const envPath = join(process.cwd(), '.env.local');
    
    // Read existing .env.local content
    let envContent = '';
    if (existsSync(envPath)) {
      envContent = readFileSync(envPath, 'utf8');
    }

    // Update or add Sentinel Hub credentials
    const credentials = [
      `SH_CLIENT_ID=${clientId}`,
      `SH_CLIENT_SECRET=${clientSecret}`,
      `SH_INSTANCE_ID=${instanceId || 'a9646191-f172-4e6e-a965-670c4a222898'}`
    ];

    // Remove existing SH_ credentials
    const lines = envContent.split('\n').filter(line => 
      !line.startsWith('SH_CLIENT_ID=') && 
      !line.startsWith('SH_CLIENT_SECRET=') && 
      !line.startsWith('SH_INSTANCE_ID=')
    );

    // Add new credentials
    const newEnvContent = [...lines, ...credentials, ''].join('\n');

    // Write back to .env.local
    writeFileSync(envPath, newEnvContent, 'utf8');

    // Also update process.env for immediate use (requires restart for full effect)
    process.env.SH_CLIENT_ID = clientId;
    process.env.SH_CLIENT_SECRET = clientSecret;
    process.env.SH_INSTANCE_ID = instanceId || 'a9646191-f172-4e6e-a965-670c4a222898';

    return NextResponse.json({ 
      success: true, 
      message: 'Credentials saved successfully. Please restart the application for changes to take full effect.' 
    });

  } catch (error: any) {
    console.error('Error saving NDVI credentials:', error);
    return NextResponse.json(
      { error: 'Failed to save credentials: ' + error.message },
      { status: 500 }
    );
  }
}