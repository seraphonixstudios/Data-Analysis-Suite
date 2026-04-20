import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import os from 'os';

interface AIConfig {
  openai?: {
    apiKey: string;
    model: string;
    maxTokens: number;
  };
  anthropic?: {
    apiKey: string;
    model: string;
    maxTokens: number;
  };
  custom?: {
    endpoint: string;
    apiKey: string;
    model: string;
  };
}

interface VisualizationConfig {
  theme: 'light' | 'dark' | 'auto';
  colorScheme: 'default' | 'ocean' | 'forest' | 'sunset' | 'monochrome';
  animationEnabled: boolean;
  defaultChartType: 'bar' | 'line' | 'scatter' | 'pie' | 'heatmap';
}

interface ExportConfig {
  defaultFormat: 'csv' | 'xlsx' | 'json' | 'pdf';
  includeCharts: boolean;
  includeInsights: boolean;
  pageSize: 'A4' | 'Letter' | 'Legal';
}

interface PrivacyConfig {
  dataRetentionDays: number;
  encryptData: boolean;
  anonymizeSensitive: boolean;
  telemetryEnabled: boolean;
}

interface AppConfig {
  ai: AIConfig;
  visualization: VisualizationConfig;
  export: ExportConfig;
  privacy: PrivacyConfig;
  lastUsedDirectory: string;
  autoSaveInterval: number;
  maxFileSizeMB: number;
}

export class ConfigManager {
  private static instance: ConfigManager;
  private configPath: string;
  private config: AppConfig;

  private constructor() {
    const configDir = path.join(os.homedir(), '.data-analysis-suite');
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }
    this.configPath = path.join(configDir, 'config.json');
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): AppConfig {
    if (existsSync(this.configPath)) {
      try {
        const data = readFileSync(this.configPath, 'utf-8');
        return { ...this.getDefaultConfig(), ...JSON.parse(data) };
      } catch (error) {
        console.warn('Error loading config, using defaults:', error);
        return this.getDefaultConfig();
      }
    }
    return this.getDefaultConfig();
  }

  private getDefaultConfig(): AppConfig {
    return {
      ai: {
        openai: {
          apiKey: '',
          model: 'gpt-3.5-turbo',
          maxTokens: 2000
        }
      },
      visualization: {
        theme: 'dark',
        colorScheme: 'default',
        animationEnabled: true,
        defaultChartType: 'bar'
      },
      export: {
        defaultFormat: 'pdf',
        includeCharts: true,
        includeInsights: true,
        pageSize: 'A4'
      },
      privacy: {
        dataRetentionDays: 30,
        encryptData: false,
        anonymizeSensitive: true,
        telemetryEnabled: false
      },
      lastUsedDirectory: os.homedir(),
      autoSaveInterval: 300000,
      maxFileSizeMB: 100
    };
  }

  public saveConfig(): void {
    try {
      writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Error saving config:', error);
      throw new Error('Failed to save configuration');
    }
  }

  public getConfig(): AppConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  public updateAIConfig(provider: keyof AIConfig, config: any): void {
    this.config.ai[provider] = { ...this.config.ai[provider], ...config };
    this.saveConfig();
  }

  public updateVisualizationConfig(config: Partial<VisualizationConfig>): void {
    this.config.visualization = { ...this.config.visualization, ...config };
    this.saveConfig();
  }

  public updateExportConfig(config: Partial<ExportConfig>): void {
    this.config.export = { ...this.config.export, ...config };
    this.saveConfig();
  }

  public updatePrivacyConfig(config: Partial<PrivacyConfig>): void {
    this.config.privacy = { ...this.config.privacy, ...config };
    this.saveConfig();
  }

  public isAIConfigured(): boolean {
    const ai = this.config.ai;
    return !!(ai.openai?.apiKey || ai.anthropic?.apiKey || ai.custom?.apiKey);
  }

  public getActiveAIProvider(): string {
    const ai = this.config.ai;
    if (ai.openai?.apiKey) return 'openai';
    if (ai.anthropic?.apiKey) return 'anthropic';
    if (ai.custom?.apiKey) return 'custom';
    return 'none';
  }
}