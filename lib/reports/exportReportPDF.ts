/**
 * Export PDF - Report Piante
 * Sistema export PDF per report dettagliati piante con grafici e analisi
 * Usa jsPDF + jspdf-autotable per generare PDF professionali
 */

export interface PlantReportData {
  plantName: string;
  variety: string;
  plantingDate: string;
  harvestDate?: string;
  location: string;
  
  // KPI
  totalCost: number;
  totalYield: number;
  qualityScore: number;
  cycleLength: number;
  
  // Timeline operazioni
  operations: Array<{
    date: string;
    type: string;
    description: string;
    cost: number;
  }>;
  
  // Analisi costi
  costBreakdown: {
    seeds: number;
    fertilizers: number;
    treatments: number;
    labor: number;
    water: number;
    other: number;
  };
  
  // Riepilogo economico
  economicSummary: {
    totalRevenue: number;
    totalCosts: number;
    netProfit: number;
    roi: number;
  };
}

/**
 * Genera PDF del report pianta
 */
export async function generatePlantReportPDF(
  data: PlantReportData
): Promise<Blob> {
  try {
    // Dynamic import per ottimizzare bundle
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    let yPos = 20;
    
    // ========== HEADER ==========
    doc.setFontSize(22);
    doc.setTextColor(22, 163, 74); // green-600
    doc.text('🌱 Report Pianta', 105, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`${data.plantName} - ${data.variety}`, 105, yPos, { align: 'center' });
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generato il ${new Date().toLocaleDateString('it-IT')}`, 105, yPos, { align: 'center' });
    
    yPos += 15;
    
    // ========== INFORMAZIONI GENERALI ==========
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Informazioni Generali', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Semina: ${data.plantingDate}`, 20, yPos);
    yPos += 6;
    if (data.harvestDate) {
      doc.text(`Raccolta: ${data.harvestDate}`, 20, yPos);
      yPos += 6;
    }
    doc.text(`Posizione: ${data.location}`, 20, yPos);
    yPos += 6;
    doc.text(`Durata ciclo: ${data.cycleLength} giorni`, 20, yPos);
    yPos += 12;
    
    // ========== KPI CARDS ==========
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Indicatori Chiave (KPI)', 20, yPos);
    yPos += 10;
    
    // KPI in formato tabella compatta
    const kpiData = [
      ['Costo Totale', `€${data.totalCost.toFixed(2)}`],
      ['Resa Totale', `${data.totalYield.toFixed(1)} kg`],
      ['Qualità Media', `${data.qualityScore}/10`],
      ['Durata Ciclo', `${data.cycleLength} giorni`]
    ];
    
    (autoTable as any)(doc, {
      startY: yPos,
      head: [['Indicatore', 'Valore']],
      body: kpiData,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74], textColor: 255 },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 10 }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 12;
    
    // ========== TIMELINE OPERAZIONI ==========
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Timeline Operazioni', 20, yPos);
    yPos += 8;
    
    const operationsData = data.operations.slice(0, 10).map(op => [
      op.date,
      op.type,
      op.description,
      `€${op.cost.toFixed(2)}`
    ]);
    
    (autoTable as any)(doc, {
      startY: yPos,
      head: [['Data', 'Tipo', 'Descrizione', 'Costo']],
      body: operationsData,
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74], textColor: 255 },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 30 },
        2: { cellWidth: 80 },
        3: { cellWidth: 25 }
      }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 12;
    
    // Check se serve nuova pagina
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    // ========== ANALISI COSTI ==========
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Analisi Costi per Categoria', 20, yPos);
    yPos += 8;
    
    const costData = [
      ['Semi e Piantine', `€${data.costBreakdown.seeds.toFixed(2)}`],
      ['Fertilizzanti', `€${data.costBreakdown.fertilizers.toFixed(2)}`],
      ['Trattamenti', `€${data.costBreakdown.treatments.toFixed(2)}`],
      ['Manodopera', `€${data.costBreakdown.labor.toFixed(2)}`],
      ['Irrigazione', `€${data.costBreakdown.water.toFixed(2)}`],
      ['Altro', `€${data.costBreakdown.other.toFixed(2)}`]
    ];
    
    (autoTable as any)(doc, {
      startY: yPos,
      head: [['Categoria', 'Importo']],
      body: costData,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74], textColor: 255 },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 10 }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 12;
    
    // ========== RIEPILOGO ECONOMICO ==========
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Riepilogo Economico', 20, yPos);
    yPos += 8;
    
    const economicData = [
      ['Ricavi Totali', `€${data.economicSummary.totalRevenue.toFixed(2)}`],
      ['Costi Totali', `€${data.economicSummary.totalCosts.toFixed(2)}`],
      ['Profitto Netto', `€${data.economicSummary.netProfit.toFixed(2)}`],
      ['ROI', `${data.economicSummary.roi.toFixed(1)}%`]
    ];
    
    (autoTable as any)(doc, {
      startY: yPos,
      head: [['Voce', 'Valore']],
      body: economicData,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74], textColor: 255 },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 10, fontStyle: 'bold' }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // ========== FOOTER ==========
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `OrtoMio - Report Pianta - Pagina ${i} di ${pageCount}`,
        105,
        287,
        { align: 'center' }
      );
    }
    
    return doc.output('blob');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Errore durante la generazione del PDF. Verifica che jsPDF sia installato correttamente.');
  }
}

/**
 * Download PDF report pianta
 */
export async function downloadPlantReportPDF(data: PlantReportData): Promise<void> {
  const blob = await generatePlantReportPDF(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const filename = `report-${data.plantName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
