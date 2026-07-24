/**
 * Export PDF - Calendario Mensile
 * PRO feature: Export calendario con task, meteo, fasi lunari, almanacco
 * Usa jsPDF per generare PDF client-side
 */

// Nota: jsPDF deve essere installato: npm install jspdf
// Per ora, creiamo la struttura base

export interface CalendarExportData {
  month: number;
  year: number;
  tasks: Array<{
    date: Date;
    title: string;
    type: string;
    completed: boolean;
  }>;
  weather?: Array<{
    date: Date;
    temp_max: number;
    icon: string;
  }>;
  lunarPhases?: Array<{
    date: Date;
    phase: string;
    emoji: string;
  }>;
  almanacco?: Array<{
    date: Date;
    proverbio: string;
    evento?: string;
  }>;
}

/**
 * Genera PDF del calendario mensile
 * @param data Dati calendario da esportare
 * @returns Blob del PDF (per download)
 */
export async function generateCalendarPDF(
  data: CalendarExportData
): Promise<Blob> {
  // Dynamic import per evitare bundle size issues se jsPDF non installato
  try {
    const { default: jsPDF } = await import('jspdf');
    
    const doc = new (jsPDF as any)({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Header
    doc.setFontSize(20);
    doc.text(
      `Calendario ${getMonthName(data.month)} ${data.year}`,
      105,
      20,
      { align: 'center' }
    );
    
    // Griglia calendario (semplificata)
    const startX = 20;
    const startY = 35;
    const cellWidth = 25;
    const cellHeight = 20;
    
    // Intestazioni giorni
    const days = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
    doc.setFontSize(10);
    days.forEach((day, idx) => {
      doc.text(day, startX + idx * cellWidth + cellWidth / 2, startY, {
        align: 'center'
      });
    });
    
    // TODO: Aggiungere celle giorni con task, meteo, luna
    // Per ora, struttura base
    
    // Footer
    doc.setFontSize(8);
    doc.text(
      `Generato da OrtoMio - ${new Date().toLocaleDateString('it-IT')}`,
      105,
      280,
      { align: 'center' }
    );
    
    return doc.output('blob');
  } catch (error) {
    console.error('Error generating PDF (jsPDF not installed?):', error);
    throw new Error('PDF export requires jsPDF. Install with: npm install jspdf');
  }
}

/**
 * Helper: Nome mese italiano
 */
function getMonthName(month: number): string {
  const months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];
  return months[month - 1] || '';
}

/**
 * Download PDF (helper)
 */
export async function downloadCalendarPDF(data: CalendarExportData): Promise<void> {
  const blob = await generateCalendarPDF(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `calendario-${data.month}-${data.year}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
