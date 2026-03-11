const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { execFile, exec } = require('child_process');

// Determine if we are running in development or production
const isDev = process.env.NODE_ENV !== 'production';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#09090b', // zinc-950
    title: 'Central App Hub',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    // In development, load from Vite dev server
    mainWindow.loadURL('http://localhost:3000');
    // mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built index.html
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// --- IPC Handlers for Native OS Tasks ---

const getAppPath = (repoName) => {
  const appsDir = path.join(app.getPath('userData'), 'DownloadedApps');
  if (!fs.existsSync(appsDir)) {
    fs.mkdirSync(appsDir, { recursive: true });
  }
  return path.join(appsDir, `${repoName}.exe`);
};

// Check if an app is currently running (Windows specific)
ipcMain.handle('check-app-running', async (event, repoName) => {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') {
      resolve(false); // Only implemented for Windows in this example
      return;
    }
    
    const exeName = `${repoName}.exe`;
    exec(`tasklist /FI "IMAGENAME eq ${exeName}" /NH`, (err, stdout) => {
      if (err) {
        resolve(false);
        return;
      }
      // If the output contains the exe name, it's running
      resolve(stdout.toLowerCase().includes(exeName.toLowerCase()));
    });
  });
});

// Check if an app is already downloaded
ipcMain.handle('check-app-downloaded', async (event, repoName) => {
  const exePath = getAppPath(repoName);
  return fs.existsSync(exePath);
});

// Download an app
ipcMain.handle('download-app', async (event, repoName, url) => {
  const exePath = getAppPath(repoName);
  
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
    });

    const totalLength = response.headers['content-length'];
    let downloadedLength = 0;

    const writer = fs.createWriteStream(exePath);

    response.data.on('data', (chunk) => {
      downloadedLength += chunk.length;
      if (totalLength) {
        const progress = Math.round((downloadedLength / totalLength) * 100);
        // Send progress back to the renderer
        event.sender.send(`download-progress-${repoName}`, progress);
      }
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(true));
      writer.on('error', (err) => {
        fs.unlink(exePath, () => {}); // Clean up partial file
        reject(err.message);
      });
    });
  } catch (error) {
    throw new Error(`Download failed: ${error.message}`);
  }
});

// Run an app
ipcMain.handle('run-app', async (event, repoName) => {
  const exePath = getAppPath(repoName);
  if (!fs.existsSync(exePath)) {
    throw new Error('Executable not found.');
  }

  // Execute the downloaded .exe
  execFile(exePath, (error) => {
    if (error) {
      console.error(`Error executing ${repoName}:`, error);
    }
  });
  return true;
});
