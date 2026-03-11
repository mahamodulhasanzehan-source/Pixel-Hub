const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  checkAppRunning: (repoName) => ipcRenderer.invoke('check-app-running', repoName),
  checkAppDownloaded: (repoName) => ipcRenderer.invoke('check-app-downloaded', repoName),
  downloadApp: (repoName, url) => ipcRenderer.invoke('download-app', repoName, url),
  runApp: (repoName) => ipcRenderer.invoke('run-app', repoName),
  onDownloadProgress: (repoName, callback) => {
    const channel = `download-progress-${repoName}`;
    ipcRenderer.on(channel, (event, progress) => callback(progress));
    // Return a function to remove the listener
    return () => ipcRenderer.removeAllListeners(channel);
  }
});
