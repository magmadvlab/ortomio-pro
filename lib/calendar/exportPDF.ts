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

export interface CalendarExportCell {
  day: number;
  row: number;
  column: number;
  tasks: CalendarExportData['tasks'];
  weather?: NonNullable<CalendarExportData['weather']>[number];
  lunarPhase?: NonNullable<CalendarExportData['lunarPhases']>[number];
  almanacco?: NonNullable<CalendarExportData['almanacco']>[number];
}

const localDateKey = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

export function buildCalendarCells(data: CalendarExportData): CalendarExportCell[] {
  if (!Number.isInteger(data.month) || data.month < 1 || data.month > 12) {
    throw new Error('Calendar month must be between 1 and 12');
  }
  const daysInMonth = new Date(data.year, data.month, 0).getDate();
  const firstColumn = (new Date(data.year, data.month - 1, 1).getDay() + 6) % 7;
  const tasksByDate = Map.groupBy(data.tasks, task => localDateKey(task.date));
  const weatherByDate = new Map((data.weather || []).map(item => [localDateKey(item.date), item]));
  const lunarByDate = new Map((data.lunarPhases || []).map(item => [localDateKey(item.date), item]));
  const almanaccoByDate = new Map((data.almanacco || []).map(item => [localDateKey(item.date), item]));

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const position = firstColumn + index;
    const key = localDateKey(new Date(data.year, data.month - 1, day));
    return {
      day,
      row: Math.floor(position / 7),
      column: position % 7,
      tasks: tasksByDate.get(key) || [],
      weather: weatherByDate.get(key),
      lunarPhase: lunarByDate.get(key),
      almanacco: almanaccoByDate.get(key),
    };
  });
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
    
    // Griglia calendario
    const startX = 20;
    const headerY = 32;
    const startY = 36;
    const cellWidth = 257 / 7;
    const cellHeight = 25;
    
    // Intestazioni giorni
    const days = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
    doc.setFontSize(10);
    days.forEach((day, idx) => {
      doc.text(day, startX + idx * cellWidth + cellWidth / 2, headerY, {
        align: 'center'
      });
    });
    
    buildCalendarCells(data).forEach(cell => {
      const x = startX + cell.column * cellWidth;
      const y = startY + cell.row * cellHeight;
      doc.rect(x, y, cellWidth, cellHeight);
      doc.setFontSize(9);
      doc.text(String(cell.day), x + 2, y + 4);

      const weatherAndMoon = [
        cell.weather ? `${cell.weather.icon} ${cell.weather.temp_max}°` : '',
        cell.lunarPhase ? `${cell.lunarPhase.emoji} ${cell.lunarPhase.phase}` : '',
      ].filter(Boolean).join('  ');
      if (weatherAndMoon) {
        doc.setFontSize(6.5);
        doc.text(weatherAndMoon.slice(0, 34), x + 2, y + 8);
      }

      cell.tasks.slice(0, 3).forEach((task, taskIndex) => {
        doc.setFontSize(6.5);
        const status = task.completed ? '✓' : '•';
        doc.text(`${status} ${task.title}`.slice(0, 36), x + 2, y + 12 + taskIndex * 3.5);
      });
      if (cell.tasks.length > 3) {
        doc.setFontSize(6);
        doc.text(`+${cell.tasks.length - 3} attività`, x + 2, y + 22.5);
      } else if (cell.almanacco) {
        doc.setFontSize(5.5);
        const note = cell.almanacco.evento || cell.almanacco.proverbio;
        doc.text(`Almanacco: ${note}`.slice(0, 42), x + 2, y + 22.5);
      }
    });
    
    // Footer
    doc.setFontSize(8);
    doc.text(
      `Generato da OrtoMio - ${new Date().toLocaleDateString('it-IT')}`,
      148.5,
      202,
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
