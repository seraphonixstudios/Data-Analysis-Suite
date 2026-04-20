import { ipcMain, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

class ExportService {
  async exportCSV(dataset: any, filePath: string): Promise<void> {
    const headers = dataset.columns.join(',');
    const rows = dataset.data.map((row: any[]) => 
      row.map(cell => `"${cell}"`).join(',')
    );
    
    const content = [headers, ...rows].join('\n');
    fs.writeFileSync(filePath, content);
  }

  async exportExcel(dataset: any, filePath: string): Promise<void> {
    const XLSX = require('xlsx');
    const worksheet = XLSX.utils.aoa_to_sheet([
      dataset.columns,
      ...dataset.data
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, filePath);
  }

  async exportJSON(dataset: any, filePath: string): Promise<void> {
    const data = dataset.data.map((row: any[]) => {
      const obj: any = {};
      dataset.columns.forEach((col: string, idx: number) => {
        obj[col] = row[idx];
      });
      return obj;
    });
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  async exportPDF(dataset: any, insights: any, filePath: string): Promise<void> {
    // This would typically use a PDF library like pdfkit
    // For now, we'll create a simple text file as placeholder
    let content = `Data Analysis Report\n\n`;
    content += `Dataset: ${dataset.name}\n`;
    content += `Columns: ${dataset.columns.join(', ')}\n`;
    content += `Rows: ${dataset.rowCount}\n\n`;
    
    if (insights) {
      content += `AI Insights:\n`;
      insights.insights.forEach((insight: string, idx: number) => {
        content += `${idx + 1}. ${insight}\n`;
      });
    }
    
    const textPath = filePath.replace('.pdf', '.txt');
    fs.writeFileSync(textPath, content);
  }
}

export function setupExportHandlers(): void {
  const exportService = new ExportService();

  ipcMain.handle('export:data', async (_, dataset, format, insights) => {
    try {
      const result = await dialog.showSaveDialog({
        filters: [{
          name: format.toUpperCase(),
          extensions: [format]
        }]
      });

      if (!result.canceled && result.filePath) {
        switch (format) {
          case 'csv':
            await exportService.exportCSV(dataset, result.filePath);
            break;
          case 'xlsx':
            await exportService.exportExcel(dataset, result.filePath);
            break;
          case 'json':
            await exportService.exportJSON(dataset, result.filePath);
            break;
          case 'pdf':
            await exportService.exportPDF(dataset, insights, result.filePath);
            break;
          default:
            throw new Error(`Unsupported format: ${format}`);
        }
        return { success: true, filePath: result.filePath };
      }
      return { success: false, canceled: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}