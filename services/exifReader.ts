/**
 * EXIF Reader Service
 * Legge metadati EXIF dalle foto per estrarre orientamento e direzione GPS
 */

export interface EXIFData {
  gpsImgDirection?: number; // Direzione GPS in gradi (0-360)
  orientation?: number; // Rotazione foto (1-8)
  gpsLatitude?: number;
  gpsLongitude?: number;
  dateTime?: string;
}

/**
 * Legge metadati EXIF da un file immagine
 * Usa EXIF.js se disponibile, altrimenti fallback
 */
export async function readEXIF(file: File): Promise<EXIFData | null> {
  try {
    // Prova a caricare EXIF.js dinamicamente
    let EXIF: any;
    try {
      // Tentativo di import dinamico (se EXIF.js è installato)
      EXIF = await import('exif-js');
      // Se è un default export, estrai il default
      if (EXIF.default) {
        EXIF = EXIF.default;
      }
    } catch {
      // EXIF.js non disponibile, usa metodo alternativo
      return await readEXIFAlternative(file);
    }

    return new Promise((resolve) => {
      EXIF.getData(file as any, function (this: any) {
        const gpsImgDirection = EXIF.getTag(this, 'GPSImgDirection') as number | undefined;
        const orientation = EXIF.getTag(this, 'Orientation') as number | undefined;
        const gpsLatitude = EXIF.getTag(this, 'GPSLatitude') as number | undefined;
        const gpsLongitude = EXIF.getTag(this, 'GPSLongitude') as number | undefined;
        const dateTime = EXIF.getTag(this, 'DateTime') as string | undefined;

        resolve({
          gpsImgDirection: gpsImgDirection !== undefined ? Number(gpsImgDirection) : undefined,
          orientation: orientation !== undefined ? Number(orientation) : undefined,
          gpsLatitude: gpsLatitude !== undefined ? Number(gpsLatitude) : undefined,
          gpsLongitude: gpsLongitude !== undefined ? Number(gpsLongitude) : undefined,
          dateTime,
        });
      });
    });
  } catch (error) {
    console.warn('Error reading EXIF data:', error);
    return null;
  }
}

/**
 * Metodo alternativo per leggere EXIF senza libreria esterna
 * Usa FileReader e parsing manuale (limitato)
 */
async function readEXIFAlternative(file: File): Promise<EXIFData | null> {
  // Questo è un fallback base - per implementazione completa servirebbe
  // parsing completo del formato JPEG/EXIF
  // Per ora restituiamo null e ci affidiamo alla bussola o calibrazione manuale
  return null;
}

/**
 * Converte orientamento EXIF (1-8) in rotazione in gradi
 */
export function orientationToDegrees(orientation: number): number {
  switch (orientation) {
    case 1: return 0; // Normal
    case 3: return 180; // Rotated 180
    case 6: return 90; // Rotated 90 CW
    case 8: return 270; // Rotated 90 CCW
    default: return 0;
  }
}

/**
 * Calcola offset Nord da dati EXIF
 * Se abbiamo GPSImgDirection, quello è il Nord nella foto
 * Altrimenti usa orientation per correggere rotazione
 */
export function calculateNorthOffsetFromEXIF(exifData: EXIFData): number | null {
  // Se abbiamo direzione GPS, quella è il Nord nella foto
  // Offset = 0 - gpsImgDirection (perché vogliamo sapere quanto ruotare la foto)
  if (exifData.gpsImgDirection !== undefined) {
    // gpsImgDirection è la direzione in cui punta la fotocamera
    // Se punta a Nord (0°), offset è 0
    // Se punta a Est (90°), offset è -90 (ruota foto di 90° per allineare Nord)
    return (360 - exifData.gpsImgDirection) % 360;
  }

  // Altrimenti usa orientation per correggere rotazione base
  if (exifData.orientation !== undefined) {
    return orientationToDegrees(exifData.orientation);
  }

  return null;
}








