import { ipcMain } from 'electron';
import { ConfigManager } from '../config/configManager';

class AIInsightGenerator {
  private configManager: ConfigManager;

  constructor() {
    this.configManager = ConfigManager.getInstance();
  }

  async generateInsights(dataset: any, context: string = ''): Promise<any> {
    const config = this.configManager.getConfig();
    const provider = this.configManager.getActiveAIProvider();
    
    if (!this.configManager.isAIConfigured()) {
      throw new Error('AI provider not configured');
    }

    const prompt = this.buildInsightPrompt(dataset, context);
    
    try {
      let response;
      switch (provider) {
        case 'openai':
          response = await this.callOpenAI(prompt, config.ai.openai!);
          break;
        case 'anthropic':
          response = await this.callAnthropic(prompt, config.ai.anthropic!);
          break;
        case 'custom':
          response = await this.callCustomEndpoint(prompt, config.ai.custom!);
          break;
        default:
          throw new Error('No AI provider configured');
      }

      return this.parseAIResponse(response);
    } catch (error) {
      throw new Error(`AI Insight Generation Failed: ${error.message}`);
    }
  }

  async explainVisualization(data: any, chartType: string): Promise<string> {
    const config = this.configManager.getConfig();
    if (!this.configManager.isAIConfigured()) {
      return 'AI explanations require configuration.';
    }

    const prompt = this.buildVisualizationPrompt(data, chartType);
    
    try {
      const provider = this.configManager.getActiveAIProvider();
      let response;
      
      switch (provider) {
        case 'openai':
          response = await this.callOpenAI(prompt, config.ai.openai!);
          break;
        case 'anthropic':
          response = await this.callAnthropic(prompt, config.ai.anthropic!);
          break;
        default:
          return 'Please configure an AI provider for explanations.';
      }

      return response;
    } catch (error) {
      console.error('Visualization explanation error:', error);
      return 'Unable to generate explanation at this time.';
    }
  }

  private buildInsightPrompt(dataset: any, context: string): string {
    return `
You are a data analysis expert. Analyze the following dataset and provide actionable insights.

Dataset Context: ${context}

Dataset Summary:
- Columns: ${dataset.columns?.join(', ') || 'N/A'}
- Rows: ${dataset.rowCount || dataset.data?.length || 0}
- Preview: ${JSON.stringify(dataset.preview || dataset.data?.slice(0, 3), null, 2)}

Please provide:
1. Key insights and patterns (3-5 bullet points)
2. Potential anomalies or outliers
3. Recommendations for further analysis
4. Business implications if applicable
5. Statistical significance of findings

Format your response as JSON with the following structure:
{
  "insights": ["insight1", "insight2", ...],
  "anomalies": ["anomaly1", "anomaly2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "businessImpact": ["impact1", "impact2", ...],
  "confidence": number (0-100)
}
`;
  }

  private buildVisualizationPrompt(data: any, chartType: string): string {
    return `
Explain this ${chartType} chart in simple terms for a business audience.
Focus on:
1. What the chart shows
2. Key patterns or trends visible
3. Potential implications for decision-making
4. Keep it under 150 words

Data: ${JSON.stringify(data, null, 2)}
`;
  }

  private async callOpenAI(prompt: string, config: any): Promise<string> {
    const axios = require('axios');
    
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: config.maxTokens,
      temperature: 0.3
    }, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  }

  private async callAnthropic(prompt: string, config: any): Promise<string> {
    const axios = require('axios');
    
    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: config.model,
      max_tokens: config.maxTokens,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    }, {
      headers: {
        'x-api-key': config.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      }
    });

    return response.data.content[0].text;
  }

  private async callCustomEndpoint(prompt: string, config: any): Promise<string> {
    const axios = require('axios');
    
    const response = await axios.post(config.endpoint, {
      prompt,
      model: config.model,
      api_key: config.apiKey
    });

    return response.data.response || response.data.choices[0].text;
  }

  private parseAIResponse(response: string): any {
    try {
      return JSON.parse(response);
    } catch (error) {
      // Fallback parsing if JSON is malformed
      return {
        insights: [response],
        anomalies: [],
        recommendations: [],
        businessImpact: [],
        confidence: 70,
        rawResponse: response
      };
    }
  }

  async generateChartSuggestion(dataset: any): Promise<any> {
    const prompt = `
Based on this dataset, suggest the most appropriate visualization types:
Columns: ${dataset.columns?.join(', ')}
Row count: ${dataset.rowCount}

Provide a JSON response with:
{
  "primaryChart": "best chart type",
  "alternativeCharts": ["chart1", "chart2"],
  "reasoning": "explanation"
}
`;
    
    const config = this.configManager.getConfig();
    const provider = this.configManager.getActiveAIProvider();
    
    if (provider === 'none') {
      return {
        primaryChart: 'bar',
        alternativeCharts: ['line', 'scatter'],
        reasoning: 'Default suggestion (configure AI for better recommendations)'
      };
    }

    try {
      const aiConfig = config.ai[provider as keyof typeof config.ai];
      let response;
      
      if (provider === 'openai') {
        response = await this.callOpenAI(prompt, aiConfig);
      } else if (provider === 'anthropic') {
        response = await this.callAnthropic(prompt, aiConfig);
      }

      return this.parseAIResponse(response);
    } catch (error) {
      console.error('Chart suggestion error:', error);
      return {
        primaryChart: 'bar',
        alternativeCharts: ['line', 'scatter'],
        reasoning: 'Error generating suggestion, using defaults'
      };
    }
  }
}

let aiGenerator: AIInsightGenerator;

export function setupAIHandlers(): void {
  aiGenerator = new AIInsightGenerator();

  ipcMain.handle('ai:generateInsights', async (_, dataset, context) => {
    try {
      return await aiGenerator.generateInsights(dataset, context);
    } catch (error) {
      return { error: error.message, insights: [], confidence: 0 };
    }
  });

  ipcMain.handle('ai:explainVisualization', async (_, data, chartType) => {
    return await aiGenerator.explainVisualization(data, chartType);
  });

  ipcMain.handle('ai:suggestChart', async (_, dataset) => {
    return await aiGenerator.generateChartSuggestion(dataset);
  });
}