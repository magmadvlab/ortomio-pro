import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { clientId, clientSecret, instanceId } = await request.json();

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Client ID e Client Secret sono richiesti' },
        { status: 400 }
      );
    }

    // In un'app reale, salveresti nel database utente
    // Per ora, aggiorniamo le variabili d'ambiente locali
    
    // Leggi il file .env.local esistente
    const envPath = join(process.cwd(), '.env.local');
    let envContent = '';
    
    try {
      const fs = require('fs');
      envContent = fs.readFileSync(envPath, 'utf8');
    } catch (error) {
      // File non esiste, crealo
      envContent = '# OrtoMio Environment Variables\n';
    }

    // Aggiorna o aggiungi le credenziali Sentinel Hub
    const lines = envContent.split('\n');
    const updatedLines = [];
    let foundClientId = false;
    let foundClientSecret = false;
    let foundInstanceId = false;

    for (const line of lines) {
      if (line.startsWith('SH_CLIENT_ID=')) {
        updatedLines.push(`SH_CLIENT_ID=${clientId}`);
        foundClientId = true;
      } else if (line.startsWith('SH_CLIENT_SECRET=')) {
        updatedLines.push(`SH_CLIENT_SECRET=${clientSecret}`);
        foundClientSecret = true;
      } else if (line.startsWith('ORTOMIO_WMS_CONFIG_ID=')) {
        updatedLines.push(`ORTOMIO_WMS_CONFIG_ID=${instanceId || 'a9646191-f172-4e6e-a965-670c4a222898'}`);
        foundInstanceId = true;
      } else {
        updatedLines.push(line);
      }
    }

    // Aggiungi le variabili se non esistevano
    if (!foundClientId) {
      updatedLines.push(`SH_CLIENT_ID=${clientId}`);
    }
    if (!foundClientSecret) {
      updatedLines.push(`SH_CLIENT_SECRET=${clientSecret}`);
    }
    if (!foundInstanceId) {
      updatedLines.push(`ORTOMIO_WMS_CONFIG_ID=${instanceId || 'a9646191-f172-4e6e-a965-670c4a222898'}`);
    }

    // Scrivi il file aggiornato
    const updatedContent = updatedLines.join('\n');
    writeFileSync(envPath, updatedContent, 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Credenziali salvate con successo'
    });

  } catch (error: any) {
    console.error('Errore salvataggio credenziali:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}