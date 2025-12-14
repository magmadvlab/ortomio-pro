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

    // If Supabase is available, save to database
    if (isSupabaseAvailable()) {
      try {
        const { getSupabaseClient } = await import('@/lib/auth');
        const supabase = getSupabaseClient();

        // Parse system info if provided
        let systemInfoJson = null;
        if (systemInfo) {
          try {
            systemInfoJson = JSON.parse(systemInfo);
          } catch (e) {
            console.error('Error parsing system info:', e);
          }
        }

        // Handle screenshot upload if provided
        let screenshotUrl = null;
        if (screenshot) {
          try {
            const screenshotBuffer = await screenshot.arrayBuffer();
            const screenshotBase64 = Buffer.from(screenshotBuffer).toString('base64');
            const fileName = `support-${Date.now()}-${screenshot.name}`;
            
            // Upload to Supabase Storage
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

        // Save to database
        const { error: dbError } = await supabase
          .from('support_requests')
          .insert({
            name,
            email,
            type,
            message,
            screenshot_url: screenshotUrl,
            system_info: systemInfoJson,
            status: 'open',
          });

        if (dbError) {
          console.error('Database error:', dbError);
          // Fall through to email/logging
        } else {
          return NextResponse.json(
            { success: true, message: 'Richiesta inviata con successo' },
            { status: 200 }
          );
        }
      } catch (supabaseError) {
        console.error('Supabase error:', supabaseError);
        // Fall through to local storage/logging
      }
    }

    // Fallback: Save to localStorage for local development or if Supabase fails
    if (typeof window !== 'undefined') {
      const supportRequests = JSON.parse(
        localStorage.getItem('support_requests') || '[]'
      );
      supportRequests.push({
        id: Date.now().toString(),
        name,
        email,
        type,
        message,
        includeSystemInfo,
        systemInfo: systemInfo ? JSON.parse(systemInfo) : null,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('support_requests', JSON.stringify(supportRequests));
    } else {
      // Server-side: Log the request
      console.log('Support Request:', {
        name,
        email,
        type,
        message,
        includeSystemInfo,
        systemInfo: systemInfo ? JSON.parse(systemInfo) : null,
        timestamp: new Date().toISOString(),
      });
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






