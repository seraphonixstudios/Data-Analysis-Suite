import { app, ipcMain } from 'electron';
import path from 'path';
import { setupDataHandlers } from './data-processing/dataHandlers';
import { setupAIHandlers } from './ai-insights/aiHandlers';
import { setupExportHandlers } from './services/exportService';

let mainWindow: Electron.BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new (require('electron').BrowserWindow)({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    show: false
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  setupDataHandlers();
  setupAIHandlers();
  setupExportHandlers();

  app.on('activate', () => {
    if ((require('electron').BrowserWindow).getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});