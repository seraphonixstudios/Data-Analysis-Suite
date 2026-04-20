# Data Analysis Suite - AI-Powered Analytics

AI-Powered Data Analysis Suite with advanced visualization and intelligent insights generation. Transform your data into actionable business intelligence with cutting-edge AI assistance.

## Features

### 🚀 Core Capabilities
- **Multiple Data Format Support**: Import CSV, Excel (.xlsx/.xls), and JSON files
- **Interactive Visualizations**: Bar charts, line graphs, scatter plots, and pie charts with D3.js
- **AI-Powered Insights**: Generate intelligent analysis and recommendations using OpenAI or Anthropic
- **Real-time Processing**: Lightning-fast data processing and transformation
- **Export Functionality**: Export data and reports in CSV, Excel, JSON, and PDF formats

### 🤖 AI Features
- **Automated Insight Generation**: Detects patterns, anomalies, and trends
- **Chart Recommendations**: AI suggests optimal visualization types for your data
- **Natural Language Explanations**: Get plain-English explanations of your visualizations
- **Business Impact Analysis**: Understand the real-world implications of your data
- **Configurable AI Providers**: Support for OpenAI GPT, Anthropic Claude, or custom endpoints

### 🎨 Visualization Engine
- **D3.js Powered**: Professional-grade interactive charts
- **Theme Support**: Light and dark themes with customizable color schemes
- **Responsive Design**: Charts adapt to any screen size
- **Animations**: Smooth transitions and interactive elements
- **Multiple Chart Types**: 
  - Bar Charts
  - Line Charts with time series support
  - Scatter Plots
  - Pie Charts with labels

### ⚙️ Configuration System
- **Flexible Settings**: Persistent configuration storage
- **Privacy Controls**: Data retention, encryption, and anonymization options
- **Customizable Themes**: Choose from multiple color schemes
- **Provider Management**: Easy API key management for AI services

## Project Structure

```
data-analysis-suite/
├── src/
│   ├── main.ts                      # Electron main process
│   ├── preload.js                   # Preload script for IPC
│   ├── renderer.tsx                 # React main application
│   ├── config/
│   │   └── configManager.ts         # Configuration management system
│   ├── data-processing/
│   │   └── dataHandlers.ts          # Data import, processing, and management
│   ├── ai-insights/
│   │   └── aiHandlers.ts            # AI integration and insight generation
│   ├── visualization/
│   │   └── visualizationEngine.ts   # D3.js chart rendering engine
│   ├── services/
│   │   └── exportService.ts         # Data and report export functionality
│   └── components/                  # Additional React components
├── assets/                          # Static assets and icons
├── docs/                            # Documentation
├── index.html                       # Main HTML file
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
└── webpack.config.js               # Build configuration
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure AI Providers (Optional)**
   - Get API keys from [OpenAI](https://platform.openai.com) or [Anthropic](https://console.anthropic.com)
   - Add keys in Settings tab after launching the application

3. **Build the Application**
   ```bash
   npm run build
   ```

4. **Launch Development Mode**
   ```bash
   npm run dev
   ```

## Usage Guide

### 1. Loading Data
1. Click on the **Data** tab
2. Click "Choose File" or drag and drop your data file
3. Supported formats: CSV, Excel (.xlsx/.xls), JSON
4. View data preview and basic statistics

### 2. Creating Visualizations
1. Navigate to the **Visualize** tab
2. Select chart type (Bar, Line, Scatter, Pie)
3. Choose X and Y axis columns
4. Click "Update Chart" to render
5. Interactive features:
   - Hover for tooltips
   - Animated transitions
   - Responsive resizing

### 3. Generating AI Insights
1. Load your dataset
2. Click "Generate AI Insights" button
3. Review the analysis including:
   - Key insights and patterns
   - Anomaly detection
   - Recommendations
   - Business impact assessment
4. Confidence score indicates analysis reliability

### 4. Exporting Results
1. Use the export functionality in the **Data** tab
2. Choose format: CSV, Excel, JSON, or PDF
3. Include charts and/or AI insights in your export
4. Configure export settings in **Settings** tab

### 5. Configuration Options
In the **Settings** tab, configure:
- **AI Providers**: Add API keys for OpenAI, Anthropic, or custom endpoints
- **Visualization**: Choose theme (Light/Dark) and color schemes
- **Privacy**: Data retention policies and encryption settings

## API Reference

### Electron IPC API

The application exposes the following API through the `window.electronAPI` object:

#### Data Management
- `loadData(filePath: string)` - Load and process data file
- `getCurrentDataset()` - Get currently loaded dataset
- `getAllDatasets()` - List all loaded datasets
- `getStatistics(datasetId: string)` - Get column statistics

#### AI & Insights
- `generateInsights(dataset: any, context: string)` - Generate AI insights
- `explainVisualization(data: any, chartType: string)` - Explain chart in plain English
- `suggestChart(dataset: any)` - Get AI-recommended chart types

#### Export
- `exportData(dataset: any, format: string, insights: any)` - Export data and reports

#### Configuration
- `getConfig()` - Get application configuration
- `updateConfig(config: any)` - Update configuration settings
- `isAIConfigured()` - Check if AI is configured
- `getActiveAIProvider()` - Get currently active AI provider

## Development

### Available Scripts

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Run the built application
npm start

# Type checking
npm run typecheck

# Linting
npm run lint

# Run tests
npm test
```

### Architecture Overview

**Frontend (React + TypeScript)**
- Main renderer process built with React components
- Responsive UI with tab-based navigation
- Real-time chart updates using D3.js

**Backend (Electron + Node.js)**
- Electron main process handles file operations
- IPC communication between processes
- Data processing pipeline for multiple formats

**AI Integration**
- Modular AI provider system
- Support for multiple LLM providers
- Caching and error handling for API calls

**Configuration System**
- Persistent storage in user's home directory
- Runtime configuration updates
- Validation and security for sensitive data

### Adding New Features

1. **New Chart Type**: Extend `VisualizationEngine` class
2. **New AI Provider**: Implement in `aiHandlers.ts`
3. **New Export Format**: Add to `exportService.ts`
4. **UI Components**: Create React components in `components/`

## Security Features

- **Context Isolation**: Electron renderer runs with security best practices
- **Configuration Encryption**: API keys stored securely
- **Data Privacy**: Local processing, no cloud data storage
- **Input Validation**: All data inputs sanitized and validated

## License

MIT License - See LICENSE file for details

## Support

For issues, feature requests, or contributions:
- GitHub Issues: Create an issue in the repository
- Documentation: Check the `docs/` folder for detailed guides

## Roadmap

- [ ] Advanced statistical analysis
- [ ] Real-time collaboration features
- [ ] Cloud data source integration (Google Sheets, APIs)
- [ ] Custom chart builder
- [ ] Machine learning model integration
- [ ] Mobile app companion
- [ ] Plugin system for extensions

---

**Data Analysis Suite** - Transform your data into intelligent insights with the power of AI.