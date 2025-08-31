import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

export interface ExportOptions {
  filename?: string;
  quality?: number;
  backgroundColor?: string;
}

export interface CSVData {
  headers: string[];
  rows: (string | number)[][];
}

export class ExportUtils {
  /**
   * Export a chart element as PNG image
   */
  static async exportChartAsPNG(
    elementId: string,
    options: ExportOptions = {}
  ): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: options.backgroundColor || '#ffffff',
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true
      });

      const link = document.createElement('a');
      link.download = options.filename || `chart-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to export chart as PNG:', error);
      throw error;
    }
  }

  /**
   * Export data as CSV file
   */
  static exportAsCSV(data: CSVData, filename?: string): void {
    try {
      const csvContent = [
        data.headers.join(','),
        ...data.rows.map(row => 
          row.map(cell => {
            // Escape commas and quotes in CSV
            const cellStr = String(cell);
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename || `data-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Failed to export CSV:', error);
      throw error;
    }
  }

  /**
   * Export analytics dashboard as PDF report
   */
  static async exportDashboardAsPDF(
    options: ExportOptions & {
      title?: string;
      subtitle?: string;
      sections?: string[];
    } = {}
  ): Promise<void> {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let currentY = 20;

      // Add title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(options.title || 'Analytics Dashboard Report', 20, currentY);
      currentY += 15;

      // Add subtitle with date
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const reportDate = format(new Date(), 'MMMM d, yyyy');
      pdf.text(options.subtitle || `Generated on ${reportDate}`, 20, currentY);
      currentY += 20;

      // Process each section
      const sections = options.sections || [
        'habits-chart',
        'streaks-chart', 
        'mental-training-chart',
        'manifestations-chart',
        'power-statements-chart',
        'task-velocity-chart'
      ];

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (!element) continue;

        // Add section title
        const sectionTitle = element.getAttribute('data-title') || sectionId;
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(sectionTitle, 20, currentY);
        currentY += 10;

        try {
          // Capture chart as image
          const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 1.5,
            useCORS: true,
            allowTaint: true
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 40; // 20mm margins
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Check if image fits on current page
          if (currentY + imgHeight > pageHeight - 20) {
            pdf.addPage();
            currentY = 20;
          }

          pdf.addImage(imgData, 'PNG', 20, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 15;

          // Add page break if needed
          if (currentY > pageHeight - 40) {
            pdf.addPage();
            currentY = 20;
          }
        } catch (error) {
          console.warn(`Failed to capture section ${sectionId}:`, error);
          
          // Add error note
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'italic');
          pdf.text('Chart could not be captured', 20, currentY);
          currentY += 15;
        }
      }

      // Add footer with generation info
      const totalPages = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `Page ${i} of ${totalPages} - Generated by Analytics Dashboard`,
          20,
          pageHeight - 10
        );
      }

      // Save the PDF
      const filename = options.filename || `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      throw error;
    }
  }

  /**
   * Export all chart data as comprehensive CSV
   */
  static async exportAllDataAsCSV(): Promise<void> {
    try {
      // This would integrate with your analytics service to get all data
      // For now, we'll create a placeholder structure
      const allData: CSVData = {
        headers: [
          'Date',
          'Habits Completed',
          'Mental Training Sessions', 
          'Manifestations Active',
          'Tasks Completed',
          'Power Statements Used'
        ],
        rows: []
      };

      // In a real implementation, you'd fetch this data from your analytics service
      // For demonstration, adding some sample rows
      const sampleRows = [
        ['2024-01-01', 5, 2, 3, 12, 8],
        ['2024-01-02', 6, 1, 3, 15, 10],
        ['2024-01-03', 4, 3, 2, 9, 6]
      ];

      allData.rows = sampleRows;

      this.exportAsCSV(allData, `analytics-data-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    } catch (error) {
      console.error('Failed to export all data as CSV:', error);
      throw error;
    }
  }

  /**
   * Export specific chart data as JSON
   */
  static exportChartDataAsJSON(data: any, filename?: string): void {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const link = document.createElement('a');
      
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename || `chart-data-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export JSON:', error);
      throw error;
    }
  }

  /**
   * Generate and download a comprehensive analytics summary
   */
  static async generateAnalyticsSummary(dateRange: { startDate: Date; endDate: Date }): Promise<void> {
    try {
      const summary = {
        reportInfo: {
          generatedAt: new Date().toISOString(),
          dateRange: {
            from: dateRange.startDate.toISOString(),
            to: dateRange.endDate.toISOString()
          }
        },
        summary: {
          totalDays: Math.ceil((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24)),
          // Add more summary statistics here
        },
        charts: [
          'Habit Trends',
          'Streak Tracking', 
          'Mental Training Stats',
          'Manifestation Tracker',
          'Power Statement Analytics',
          'Task Velocity'
        ]
      };

      this.exportChartDataAsJSON(
        summary, 
        `analytics-summary-${format(new Date(), 'yyyy-MM-dd')}.json`
      );
    } catch (error) {
      console.error('Failed to generate analytics summary:', error);
      throw error;
    }
  }
}

export default ExportUtils;