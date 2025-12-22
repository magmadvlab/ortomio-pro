/**
 * Supabase Edge Function: Send Notification
 * Invia email tramite SendGrid API
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
const SENDGRID_URL = 'https://api.sendgrid.com/v3/mail/send';
const FROM_EMAIL = 'noreply@ortomio.it';
const FROM_NAME = 'OrtoMio';

interface EmailRequest {
  to: string;
  subject: string;
  type: string;
  templateData: Record<string, any>;
}

/**
 * Valida email address
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Genera HTML email dal template type
 */
function generateEmailHTML(type: string, templateData: Record<string, any>): string {
  const baseHTML = `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OrtoMio - Notifica</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #22c55e;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #22c55e;
      margin: 0;
      font-size: 28px;
    }
    .content {
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #22c55e;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .footer a {
      color: #22c55e;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌱 OrtoMio</h1>
    </div>
    <div class="content">
      {{CONTENT}}
    </div>
    <div class="footer">
      <p>OrtoMio - Il tuo assistente per l'orto intelligente</p>
      <p>
        <a href="{{UNSUBSCRIBE_URL}}">Disattiva notifiche</a> | 
        <a href="{{SETTINGS_URL}}">Gestisci preferenze</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  let content = '';

  switch (type) {
    case 'task_completed':
      content = `
        <h2>✅ Task Completato!</h2>
        <p>Hai completato con successo il task per <strong>${templateData.plantName || 'la pianta'}</strong>.</p>
        <p><strong>Tipo:</strong> ${templateData.taskType || 'Task'}</p>
        <p><strong>Data completamento:</strong> ${templateData.completedDate || 'Oggi'}</p>
        <p>Continua così! Il tuo orto ti ringrazia 🌿</p>
      `;
      break;

    case 'task_reminder':
      const daysText = templateData.daysUntilDue === 0 ? 'oggi' : `tra ${templateData.daysUntilDue} giorno${templateData.daysUntilDue > 1 ? 'i' : ''}`;
      content = `
        <h2>⏰ Promemoria Task</h2>
        <p>Hai un task in scadenza ${daysText}!</p>
        <p><strong>Pianta:</strong> ${templateData.plantName || 'N/A'}</p>
        <p><strong>Tipo:</strong> ${templateData.taskType || 'Task'}</p>
        <p><strong>Data scadenza:</strong> ${templateData.dueDate || 'Prossimamente'}</p>
        <p>Apri l'app per vedere i dettagli e completare il task.</p>
        <a href="#" class="button">Vai all'app</a>
      `;
      break;

    case 'challenge_available':
      content = `
        <h2>🎯 Nuova Challenge Disponibile!</h2>
        <p><strong>${templateData.titolo || 'Challenge del giorno'}</strong></p>
        <p>Completa questa challenge e guadagna <strong>${templateData.punti || 0} punti</strong>!</p>
        <p>Apri l'app per vedere i dettagli e iniziare la challenge.</p>
        <a href="#" class="button">Vai alla Challenge</a>
      `;
      break;

    case 'streak_reminder':
      content = `
        <h2>🔥 Mantieni la tua Streak!</h2>
        <p>Non dimenticare di completare le attività di oggi per mantenere la tua streak attiva.</p>
        <p>Apri l'app e completa almeno un task per continuare la serie!</p>
        <a href="#" class="button">Vai all'app</a>
      `;
      break;

    case 'harvest_logged':
      content = `
        <h2>🌾 Raccolto Registrato!</h2>
        <p>Hai registrato un nuovo raccolto per <strong>${templateData.plantName || 'la pianta'}</strong>.</p>
        <p><strong>Quantità:</strong> ${templateData.quantity || 'N/A'} ${templateData.unit || 'kg'}</p>
        <p><strong>Data:</strong> ${templateData.harvestDate || 'Oggi'}</p>
        <p>Ottimo lavoro! Continua a tracciare i tuoi raccolti.</p>
      `;
      break;

    case 'weather_alert':
      const severityEmoji = templateData.severity === 'high' ? '🔴' : templateData.severity === 'medium' ? '🟡' : '🟢';
      content = `
        <h2>${severityEmoji} Allarme Meteo</h2>
        <p><strong>Tipo:</strong> ${templateData.alertType || 'Allarme'}</p>
        <p><strong>Gravità:</strong> ${templateData.severity || 'Media'}</p>
        <p>${templateData.message || 'Si prevede una condizione meteorologica critica.'}</p>
        <p><strong>Data:</strong> ${templateData.date || 'Prossimamente'}</p>
        <p>Apri l'app per vedere i dettagli e le raccomandazioni.</p>
        <a href="#" class="button">Vedi Dettagli</a>
      `;
      break;

    case 'seed_expiring':
      content = `
        <h2>⚠️ Semi in Scadenza</h2>
        <p>I semi di <strong>${templateData.varietyName || 'varietà'}</strong> stanno per scadere!</p>
        <p><strong>Data scadenza:</strong> ${templateData.expiryDate || 'Prossimamente'}</p>
        <p><strong>Giorni rimanenti:</strong> ${templateData.daysRemaining || 'Pochi'}</p>
        <p>Considera di usarli presto o di sostituirli.</p>
      `;
      break;

    case 'seed_low_quantity':
      content = `
        <h2>📦 Scorte Basse</h2>
        <p>Le scorte di semi per <strong>${templateData.varietyName || 'varietà'}</strong> sono basse.</p>
        <p><strong>Quantità rimanente:</strong> ${templateData.quantityRemaining || 'Bassa'}</p>
        <p>Considera di acquistare nuovi semi per la prossima stagione.</p>
      `;
      break;

    default:
      content = `
        <h2>Notifica OrtoMio</h2>
        <p>Hai ricevuto una nuova notifica da OrtoMio.</p>
        <p>Apri l'app per vedere i dettagli.</p>
      `;
  }

  // Sostituisci placeholder con URL reali (da configurare)
  const unsubscribeUrl = `${Deno.env.get('SITE_URL') || 'https://ortomio.it'}/settings?tab=notifications`;
  const settingsUrl = `${Deno.env.get('SITE_URL') || 'https://ortomio.it'}/settings`;

  return baseHTML
    .replace('{{CONTENT}}', content)
    .replace('{{UNSUBSCRIBE_URL}}', unsubscribeUrl)
    .replace('{{SETTINGS_URL}}', settingsUrl);
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Verifica autenticazione
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verifica SendGrid API key
    if (!SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: EmailRequest = await req.json();

    // Validazione
    if (!body.to || !isValidEmail(body.to)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!body.subject || body.subject.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Subject is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Genera HTML email
    const htmlContent = generateEmailHTML(body.type || 'default', body.templateData || {});

    // Invia email via SendGrid
    const sendGridResponse = await fetch(SENDGRID_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: body.to }],
            subject: body.subject,
          },
        ],
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME,
        },
        content: [
          {
            type: 'text/html',
            value: htmlContent,
          },
        ],
      }),
    });

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text();
      console.error('SendGrid error:', errorText);
      return new Response(
        JSON.stringify({
          error: 'Failed to send email',
          details: errorText,
        }),
        {
          status: sendGridResponse.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in send-notification function:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});


