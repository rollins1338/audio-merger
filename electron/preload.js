
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  selectSaveLocation: (defaultName, extension) => 
    ipcRenderer.invoke('select-save-location', { defaultName, extension }),
  
  getFfmpegVersion: () => 
    ipcRenderer.invoke('get-ffmpeg-version'),

  selectCustomFfmpegPath: () =>
    ipcRenderer.invoke('select-ffmpeg-custom-path'),
    
  setFfmpegPath: (path) =>
    ipcRenderer.invoke('set-ffmpeg-path', path),

  getSystemSpecs: () => 
    ipcRenderer.invoke('get-system-specs'),
  
  startMerge: (files, outputPath, options) => 
    ipcRenderer.send('start-merge', { files, outputPath, options }),
  
  cancelMerge: () => 
    ipcRenderer.send('cancel-merge'),

  // New method for background scanning
  scanFiles: (files) =>
    ipcRenderer.invoke('scan-files', files),

  openExternal: (url) => 
    ipcRenderer.invoke('open-external', url),

  showItemInFolder: (path) =>
    ipcRenderer.invoke('show-item-in-folder', path),

  // Window Controls
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),

  onProgress: (callback) => 
    ipcRenderer.on('merge-progress', (event, data) => callback(data)),

  onComplete: (callback) => 
    ipcRenderer.on('merge-complete', (event, path) => callback(path)),

  onCompleteWithWarning: (callback) => 
    ipcRenderer.on('merge-complete-warning', (event, data) => callback(data)),

  onConflictsDetected: (callback) => 
    ipcRenderer.on('merge-conflicts-detected', (event, data) => callback(data)),

  onError: (callback) => 
    ipcRenderer.on('merge-error', (event, error) => callback(error)),

  // Clean up listeners
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('merge-progress');
    ipcRenderer.removeAllListeners('merge-complete');
    ipcRenderer.removeAllListeners('merge-complete-warning');
    ipcRenderer.removeAllListeners('merge-error');
    ipcRenderer.removeAllListeners('merge-conflicts-detected');
  }
});
