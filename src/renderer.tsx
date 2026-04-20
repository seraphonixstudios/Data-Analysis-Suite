import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';

interface Dataset {
  id: string;
  name: string;
  columns: string[];
  rowCount: number;
  preview: any[][];
}

interface AIInsight {
  insights: string[];
  anomalies: string[];
  recommendations: string[];
  businessImpact: string[];
  confidence: number;
}

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentDataset, setCurrentDataset] = useState<Dataset | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeTab, setActiveTab] = useState<'data' | 'visualize' | 'insights' | 'settings'>('data');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'scatter' | 'pie'>('bar');
  const [xColumn, setXColumn] = useState('');
  const [yColumn, setYColumn] = useState('');
  const [aiInsights, setAiInsights] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      const result = await window.electronAPI.getAllDatasets();
      setDatasets(result);
    } catch (err) {
      console.error('Failed to load datasets:', err);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const result = await window.electronAPI.loadData(file.path);
      
      if (result.success) {
        setCurrentDataset(result.dataset);
        setSelectedFile(file);
        setXColumn(result.dataset.columns[0] || '');
        setYColumn(result.dataset.columns[1] || '');
        setDatasets(prev => [...prev, result.dataset]);
        setActiveTab('visualize');
      } else {
        setError(result.error || 'Failed to load dataset');
      }
    } catch (err) {
      setError(err.message || 'Failed to load dataset');
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    if (!currentDataset) {
      setError('Please load a dataset first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const insights = await window.electronAPI.generateInsights(currentDataset, 'Analyzing data for patterns and trends');
      setAiInsights(insights);
      setActiveTab('insights');
    } catch (err) {
      setError(err.message || 'Failed to generate AI insights');
      setAiInsights({
        insights: ['AI features require configuration. Go to Settings to set up an AI provider.'],
        anomalies: [],
        recommendations: ['Configure an AI provider like OpenAI or Anthropic for advanced insights.'],
        businessImpact: [],
        confidence: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const renderVisualization = () => {
    if (!currentDataset || !xColumn || !yColumn) {
      return <div className="placeholder">Select columns to visualize</div>;
    }

    return (
      <div className="chart-container">
        <div id="chart-container"></div>
      </div>
    );
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Data Analysis Suite</h1>
        <div className="nav-tabs">
          <button 
            className={activeTab === 'data' ? 'active' : ''}
            onClick={() => setActiveTab('data')}
          >
            Data
          </button>
          <button 
            className={activeTab === 'visualize' ? 'active' : ''}
            onClick={() => setActiveTab('visualize')}
          >
            Visualize
          </button>
          <button 
            className={activeTab === 'insights' ? 'active' : ''}
            onClick={() => setActiveTab('insights')}
          >
            AI Insights
          </button>
          <button 
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>
      </header>

      <main className="main-content">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Processing...</p>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="tab-content">
            <div className="upload-section">
              <h2>Import Data</h2>
              <input 
                type="file" 
                accept=".csv,.xlsx,.xls,.json" 
                onChange={handleFileChange}
                className="file-input"
              />
              <p className="supported-formats">
                Supports: CSV, Excel (.xlsx, .xls), JSON
              </p>
            </div>

            {currentDataset && (
              <div className="dataset-info">
                <h3>Current Dataset: {currentDataset.name}</h3>
                <p>Columns: {currentDataset.columns.join(', ')}</p>
                <p>Rows: {currentDataset.rowCount}</p>
                
                <div className="data-preview">
                  <h4>Preview</h4>
                  <table className="preview-table">
                    <thead>
                      <tr>
                        {currentDataset.columns.map((col, idx) => (
                          <th key={idx}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentDataset.preview.map((row, idx) => (
                        <tr key={idx}>
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'visualize' && (
          <div className="tab-content">
            <div className="controls">
              <div className="control-group">
                <label>Chart Type:</label>
                <select 
                  value={chartType} 
                  onChange={(e) => setChartType(e.target.value)}
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="scatter">Scatter Plot</option>
                  <option value="pie">Pie Chart</option>
                </select>
              </div>

              {currentDataset && (
                <>
                  <div className="control-group">
                    <label>X-Axis:</label>
                    <select 
                      value={xColumn} 
                      onChange={(e) => setXColumn(e.target.value)}
                    >
                      {currentDataset.columns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>

                  <div className="control-group">
                    <label>Y-Axis:</label>
                    <select 
                      value={yColumn} 
                      onChange={(e) => setYColumn(e.target.value)}
                    >
                      {currentDataset.columns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {currentDataset && xColumn && yColumn && (
                <div className="chart-controls">
                  <button 
                    onClick={renderVisualization}
                    className="btn-primary"
                  >
                    Update Chart
                  </button>
                  <button 
                    onClick={generateInsights}
                    className="btn-secondary"
                  >
                    Generate AI Insights
                  </button>
                </div>
              )}
            </div>

            <div className="visualization-container">
              {!currentDataset && (
                <div className="placeholder">
                  <p>No dataset loaded</p>
                  <p>Go to the Data tab to import your data</p>
                </div>
              )}
              {currentDataset && renderVisualization()}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="tab-content">
            <div className="insights-container">
              <h2>AI-Generated Insights</h2>
              
              {!aiInsights ? (
                <div className="placeholder">
                  <p>No insights generated yet</p>
                  <button 
                    onClick={generateInsights}
                    className="btn-primary"
                  >
                    Generate Insights
                  </button>
                </div>
              ) : (
                <div className="insights-grid">
                  <div className="insight-card">
                    <h3>Key Insights</h3>
                    <ul>
                      {aiInsights.insights.map((insight, idx) => (
                        <li key={idx}>{insight}</li>
                      ))}
                    </ul>
                  </div>

                  {aiInsights.anomalies.length > 0 && (
                    <div className="insight-card">
                      <h3>Anomalies Detected</h3>
                      <ul>
                        {aiInsights.anomalies.map((anomaly, idx) => (
                          <li key={idx} className="anomaly">{anomaly}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="insight-card">
                    <h3>Recommendations</h3>
                    <ul>
                      {aiInsights.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>

                  {aiInsights.businessImpact.length > 0 && (
                    <div className="insight-card">
                      <h3>Business Impact</h3>
                      <ul>
                        {aiInsights.businessImpact.map((impact, idx) => (
                          <li key={idx}>{impact}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="confidence-indicator">
                    <h3>Confidence Score</h3>
                    <div className="confidence-bar">
                      <div 
                        className="confidence-fill"
                        style={{ width: `${aiInsights.confidence}%` }}
                      ></div>
                    </div>
                    <span>{aiInsights.confidence}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="tab-content">
            <SettingsPanel />
          </div>
        )}
      </main>
    </div>
  );
}

function SettingsPanel() {
  const [config, setConfig] = useState(null);
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [theme, setTheme] = useState('dark');
  const [colorScheme, setColorScheme] = useState('default');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const cfg = await window.electronAPI.getConfig();
      setConfig(cfg);
      setOpenaiKey(cfg.ai.openai?.apiKey || '');
      setAnthropicKey(cfg.ai.anthropic?.apiKey || '');
      setTheme(cfg.visualization.theme);
      setColorScheme(cfg.visualization.colorScheme);
    } catch (err) {
      console.error('Failed to load config:', err);
    }
  };

  const saveSettings = async () => {
    try {
      await window.electronAPI.updateConfig({
        ai: {
          openai: { apiKey: openaiKey, model: 'gpt-3.5-turbo', maxTokens: 2000 },
          anthropic: { apiKey: anthropicKey, model: 'claude-3-sonnet', maxTokens: 2000 }
        },
        visualization: {
          theme,
          colorScheme,
          animationEnabled: true,
          defaultChartType: 'bar'
        }
      });
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save settings');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="settings-panel">
      <h2>Configuration Settings</h2>
      
      {message && (
        <div className="message">
          {message}
        </div>
      )}

      <div className="settings-section">
        <h3>AI Provider Configuration</h3>
        
        <div className="setting-group">
          <label>OpenAI API Key:</label>
          <input 
            type="password"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            placeholder="sk-..."
          />
        </div>

        <div className="setting-group">
          <label>Anthropic API Key:</label>
          <input 
            type="password"
            value={anthropicKey}
            onChange={(e) => setAnthropicKey(e.target.value)}
            placeholder="sk-ant-..."
          />
        </div>
      </div>

      <div className="settings-section">
        <h3>Visualization Settings</h3>
        
        <div className="setting-group">
          <label>Theme:</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div className="setting-group">
          <label>Color Scheme:</label>
          <select value={colorScheme} onChange={(e) => setColorScheme(e.target.value)}>
            <option value="default">Default</option>
            <option value="ocean">Ocean</option>
            <option value="forest">Forest</option>
            <option value="sunset">Sunset</option>
            <option value="monochrome">Monochrome</option>
          </select>
        </div>
      </div>

      <div className="settings-actions">
        <button onClick={saveSettings} className="btn-primary">
          Save Settings
        </button>
      </div>

      <div className="info-section">
        <h3>About</h3>
        <p>Data Analysis Suite v1.0.0</p>
        <p>AI-powered analytics with visualization capabilities</p>
        <p>Configure AI providers to enable advanced insights and explanations.</p>
      </div>
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);