import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseAvailable } from '@/lib/auth.server';

/**
 * Support Request API Route
 * Handles submission of support requests
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const type = formData.get('type') as string;
    const message = formData.get('message') as string;
    const includeSystemInfo = formData.get('includeSystemInfo') === 'true';
    const systemInfo = formData.get('systemInfo') as string | null;
    const screenshot = formData.get('screenshot') as File | null;

    // Validation
    if (!name || !email || !type || !message) {
      return NextResponse.json(
        { error: 'Tutti i campi obbligatori devono essere compilati' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email non valida' },
        { status: 400 }
      );
    }

    if (!isSupabaseAvailable()) {
      return NextResponse.json(
        { error: 'cloud_storage_unavailable' },
        { status: 503 }
      );
    }

    const { getSupabaseClient } = await import('@/lib/auth');
    const supabase = getSupabaseClient();

    let systemInfoJson = null;
    if (systemInfo) {
      try {
        systemInfoJson = JSON.parse(systemInfo);
      } catch (e) {
        console.error('Error parsing system info:', e);
      }
    }

    let screenshotUrl = null;
    if (screenshot) {
      try {
        const screenshotBuffer = await screenshot.arrayBuffer();
        const fileName = `support-${Date.now()}-${screenshot.name}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('support-screenshots')
          .upload(fileName, screenshotBuffer, {
            contentType: screenshot.type,
            upsert: false,
          });

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from('support-screenshots')
            .getPublicUrl(fileName);
          screenshotUrl = urlData?.publicUrl || null;
        }
      } catch (e) {
        console.error('Error uploading screenshot:', e);
      }
    }

    const { error: dbError } = await supabase
      .from('support_requests')
      .insert({
        name,
        email,
        type,
        message,
        screenshot_url: screenshotUrl,
        system_info: includeSystemInfo ? systemInfoJson : null,
        status: 'open',
      });

    if (dbError) {
      throw dbError;
    }

    return NextResponse.json(
      { success: true, message: 'Richiesta inviata con successo' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing support request:', error);
    return NextResponse.json(
      { error: 'Errore nel processamento della richiesta' },
      { status: 500 }
    );
  }
}


















