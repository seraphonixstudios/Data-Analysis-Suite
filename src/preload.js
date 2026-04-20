import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  loadData: (filePath: string) => ipcRenderer.invoke('data:load', filePath),
  getCurrentDataset: () => ipcRenderer.invoke('data:getCurrent'),
  getAllDatasets: () => ipcRenderer.invoke('data:getAllDatasets'),
  applyTransformation: (datasetId: string, transformation: any) => 
    ipcRenderer.invoke('data:applyTransformation', datasetId, transformation),
  filterData: (datasetId: string, filters: any[]) => 
    ipcRenderer.invoke('data:filter', datasetId, filters),
  getStatistics: (datasetId: string) => ipcRenderer.invoke('data:getStatistics', datasetId),

  generateInsights: (dataset: any, context: string) => 
    ipcRenderer.invoke('ai:generateInsights', dataset, context),
  explainVisualization: (data: any, chartType: string) => 
    ipcRenderer.invoke('ai:explainVisualization', data, chartType),
  suggestChart: (dataset: any) => ipcRenderer.invoke('ai:suggestChart', dataset),

  exportData: (dataset: any, format: string, insights: any) => 
    ipcRenderer.invoke('export:data', dataset, format, insights),

  getConfig: () => ipcRenderer.invoke('config:get'),
  updateConfig: (config: any) => ipcRenderer.invoke('config:update', config),
  updateAIConfig: (provider: string, config: any) => 
    ipcRenderer.invoke('config:updateAI', provider, config),
  updateVisualizationConfig: (config: any) => 
    ipcRenderer.invoke('config:updateVisualization', config),
  updateExportConfig: (config: any) => 
    ipcRenderer.invoke('config:updateExport', config),
  updatePrivacyConfig: (config: any) => 
    ipcRenderer.invoke('config:updatePrivacy', config),

  isAIConfigured: () => ipcRenderer.invoke('config:isAIConfigured'),
  getActiveAIProvider: () => ipcRenderer.invoke('config:getActiveAIProvider')
});

declare global {
  interface Window {
    electronAPI: {
      loadData: (filePath: string) => Promise<any>;
      getCurrentDataset: () => Promise<any>;
      getAllDatasets: () => Promise<any[]>;
      applyTransformation: (datasetId: string, transformation: any) => Promise<any>;
      filterData: (datasetId: string, filters: any[]) => Promise<any>;
      getStatistics: (datasetId: string) => Promise<any>;

      generateInsights: (dataset: any, context: string) => Promise<any>;
      explainVisualization: (data: any, chartType: string) => Promise<string>;
      suggestChart: (dataset: any) => Promise<any>;

      exportData: (dataset: any, format: string, insights: any) => Promise<any>;

      getConfig: () => Promise<any>;
      updateConfig: (config: any) => Promise<void>;
      updateAIConfig: (provider: string, config: any) => Promise<void>;
      updateVisualizationConfig: (config: any) => Promise<void>;
      updateExportConfig: (config: any) => Promise<void>;
      updatePrivacyConfig: (config: any) => Promise<void>;

      isAIConfigured: () => Promise<boolean>;
      getActiveAIProvider: () => Promise<string>;
    };
  }
}