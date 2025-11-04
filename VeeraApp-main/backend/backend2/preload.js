const { contextBridge, ipcRenderer } = require('electron');
const { classPages, experimentPages } = require("./pageMap");

console.log('[preload] preload.js loaded');

contextBridge.exposeInMainWorld('veeraAPI', {
    // high level commands
  sendClass: (c) => ipcRenderer.invoke('send-class', c),
  sendExperiment: (e) => ipcRenderer.invoke('send-experiment', e),
  sendThresholdsFor: (key) => ipcRenderer.invoke('send-thresholds-for', key),

  // threshold APIs:
  getActiveThresholds: (key) => ipcRenderer.invoke('get-active-thresholds', key),
  setActiveThresholds: (key, list) => ipcRenderer.invoke('set-active-thresholds', key, list),
  resetThresholdsFor: (key) => ipcRenderer.invoke('reset-thresholds-for', key),
  resetAllThresholds: () => ipcRenderer.invoke('reset-all-thresholds'),
  
   // event listeners
  onKitClassChanged: (cb) => ipcRenderer.on('kit-class-changed', (e, d) => cb(d)),
  onKitExperimentChanged: (cb) => ipcRenderer.on('kit-experiment-changed', (e, d) => cb(d)),
  onSensorUpdate: (cb) => ipcRenderer.on('kit-sensor-update', (e, d) => cb(d)),
  onKitAck: (cb) => ipcRenderer.on('kit-ack', (e, d) => cb(d)),
  onKitError: (callback) => ipcRenderer.on('kit-error', (_, data) => callback(data)),

  // serial status events
  onSerialConnected: (cb) => ipcRenderer.on('serial-connected', cb),
  onSerialDisconnected: (cb) => ipcRenderer.on('serial-disconnected', cb),
  onStatus: (callback) => ipcRenderer.on('serial-status', (event, data) => callback(data)),

  // low-level raw send if needed
  sendRaw: (raw) => ipcRenderer.send('send-raw', raw),
  sendToKit: (message) => ipcRenderer.send('send-to-kit', message),
  onClassChange: (callback) => ipcRenderer.on('change-class', (event, classNum) => callback(classNum)),
  onExperimentChange: (callback) => ipcRenderer.on('change-experiment', (event, expName) => callback(expName)),
  onKitMessage: (callback) => ipcRenderer.on('kit-Message', (_, data) => callback(data))
});
