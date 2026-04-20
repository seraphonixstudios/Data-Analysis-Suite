import { ipcMain } from 'electron';

interface DataSet {
  id: string;
  name: string;
  columns: string[];
  data: any[][];
  createdAt: Date;
  source: string;
}

class DataManager {
  private datasets: Map<string, DataSet> = new Map();
  private currentDataset: string | null = null;

  constructor() {
    this.setupHandlers();
  }

  private setupHandlers(): void {
    ipcMain.handle('data:load', async (_, filePath: string) => {
      try {
        return await this.loadData(filePath);
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('data:getCurrent', () => {
      return this.currentDataset ? this.datasets.get(this.currentDataset) : null;
    });

    ipcMain.handle('data:getAllDatasets', () => {
      return Array.from(this.datasets.values()).map(ds => ({
        id: ds.id,
        name: ds.name,
        columns: ds.columns,
        rowCount: ds.data.length,
        createdAt: ds.createdAt,
        source: ds.source
      }));
    });

    ipcMain.handle('data:applyTransformation', (_, datasetId: string, transformation: any) => {
      return this.applyTransformation(datasetId, transformation);
    });

    ipcMain.handle('data:filter', (_, datasetId: string, filters: any[]) => {
      return this.filterData(datasetId, filters);
    });

    ipcMain.handle('data:getStatistics', (_, datasetId: string) => {
      return this.getStatistics(datasetId);
    });
  }

  private async loadData(filePath: string): Promise<any> {
    const ext = filePath.split('.').pop()?.toLowerCase();
    
    try {
      let data;
      switch (ext) {
        case 'csv':
          data = await this.loadCSV(filePath);
          break;
        case 'xlsx':
        case 'xls':
          data = await this.loadExcel(filePath);
          break;
        case 'json':
          data = await this.loadJSON(filePath);
          break;
        default:
          throw new Error(`Unsupported file format: ${ext}`);
      }

      const processedData = this.preprocessData(data);
      const dataset: DataSet = {
        id: this.generateId(),
        name: path.basename(filePath),
        columns: processedData.columns,
        data: processedData.rows,
        createdAt: new Date(),
        source: filePath
      };

      this.datasets.set(dataset.id, dataset);
      this.currentDataset = dataset.id;

      return {
        success: true,
        dataset: {
          id: dataset.id,
          name: dataset.name,
          columns: dataset.columns,
          rowCount: dataset.data.length,
          preview: dataset.data.slice(0, 5)
        }
      };
    } catch (error) {
      throw new Error(`Failed to load data: ${error.message}`);
    }
  }

  private async loadCSV(filePath: string): Promise<any> {
    const Papa = require('papaparse');
    const fs = require('fs');
    
    return new Promise((resolve, reject) => {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      Papa.parse(fileContent, {
        header: true,
        dynamicTyping: true,
        complete: (results) => resolve(results.data),
        error: reject
      });
    });
  }

  private async loadExcel(filePath: string): Promise<any> {
    const XLSX = require('xlsx');
    const workbook = XLSX.readFile(filePath);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(firstSheet);
  }

  private async loadJSON(filePath: string): Promise<any> {
    const fs = require('fs');
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  }

  private preprocessData(data: any[]): { columns: string[], rows: any[][] } {
    if (!data || data.length === 0) {
      return { columns: [], rows: [] };
    }

    const columns = Object.keys(data[0]);
    const rows = data.map(row => columns.map(col => row[col]));

    return { columns, rows };
  }

  private applyTransformation(datasetId: string, transformation: any): any {
    const dataset = this.datasets.get(datasetId);
    if (!dataset) throw new Error('Dataset not found');

    // Implementation for data transformations
    return { success: true, message: 'Transformation applied' };
  }

  private filterData(datasetId: string, filters: any[]): any {
    const dataset = this.datasets.get(datasetId);
    if (!dataset) throw new Error('Dataset not found');

    // Implementation for data filtering
    return { success: true, message: 'Filters applied' };
  }

  private getStatistics(datasetId: string): any {
    const dataset = this.datasets.get(datasetId);
    if (!dataset) throw new Error('Dataset not found');

    const stats = {};
    dataset.columns.forEach((col, idx) => {
      const columnData = dataset.data.map(row => row[idx]);
      stats[col] = this.calculateColumnStats(columnData);
    });

    return stats;
  }

  private calculateColumnStats(data: any[]): any {
    const numericData = data.filter(v => typeof v === 'number' && !isNaN(v));
    
    if (numericData.length === 0) {
      return {
        type: 'categorical',
        uniqueValues: new Set(data).size,
        mode: this.getMode(data)
      };
    }

    return {
      type: 'numeric',
      count: numericData.length,
      mean: this.mean(numericData),
      median: this.median(numericData),
      stdDev: this.stdDev(numericData),
      min: Math.min(...numericData),
      max: Math.max(...numericData),
      quartiles: this.quartiles(numericData)
    };
  }

  private mean(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  private median(arr: number[]): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  private stdDev(arr: number[]): number {
    const avg = this.mean(arr);
    const variance = arr.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / arr.length;
    return Math.sqrt(variance);
  }

  private quartiles(arr: number[]): { q1: number; q2: number; q3: number } {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const lower = sorted.slice(0, mid);
    const upper = sorted.slice(sorted.length % 2 ? mid + 1 : mid);
    
    return {
      q1: this.median(lower),
      q2: this.median(sorted),
      q3: this.median(upper)
    };
  }

  private getMode(arr: any[]): any {
    const frequency = {};
    arr.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });
    
    return Object.keys(frequency).reduce((a, b) => 
      frequency[a] > frequency[b] ? a : b
    );
  }

  private generateId(): string {
    return `dataset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

const path = require('path');

export function setupDataHandlers(): void {
  new DataManager();
}