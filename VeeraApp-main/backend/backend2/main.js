// backend/main.js  (corrected)
const { app, BrowserWindow, ipcMain } = require('electron');
const { classPages, experimentPages } = require("./pageMap");
const path = require('path');
const fs = require('fs');                     // <-- added
const SerialManager = require('./SerialManager');
const thresholdsModule = require('./thresholds');

let mainWindow;
let serial;
let currentClass = 5; // default starting class (can be updated when kit sends #C)
let currentExperiment = 1;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200, height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js') // <-- fixed (preload is in same folder)
    }
  });
  // load index from pages folder (relative to backend)
  mainWindow.loadFile(path.join(__dirname, '../pages/index.html'));
}

// Create and wire serial+ipc on ready
app.whenReady().then(() => {
  createWindow();
  serial = new SerialManager({ portPath: 'COM3', baudRate: 9600 });

  // forward serial events to renderer
  serial.on('connected', () => {
    mainWindow.webContents.send('serial-status', { connected: true });
    mainWindow.webContents.send('serial-connected');
  });
  serial.on('disconnected', () => {
    mainWindow.webContents.send('serial-status', { connected: false });
    mainWindow.webContents.send('serial-disconnected');
  });
  serial.on('class-changed', (d) => mainWindow.webContents.send('kit-class-changed', d));
  serial.on('experiment-changed', (d) => mainWindow.webContents.send('kit-experiment-changed', d));
  serial.on('sensor-update', (d) => mainWindow.webContents.send('kit-sensor-update', d));
  serial.on('ack', (d) => mainWindow.webContents.send('kit-ack', d));
  serial.on('error', (err) => mainWindow.webContents.send('kit-error', String(err)));

  // 🔀 Auto navigation when kit changes class or experiment
  let lastClass = null;
  let lastExperiment = null;
  
  serial.on('class-changed', (d) => {
    const classNum = parseInt(d.classNum, 10);
    if (!classNum || isNaN(classNum)) {
      console.warn('⚠️ Invalid class number from kit:', d);
      return;
    }
    if (classNum === lastClass) return; // avoid duplicate reloads

    lastClass = classNum;
    currentClass = classNum;

    const file = path.join(__dirname, `../pages/class${currentClass}/class${classNum}list.html`);
    console.log(`➡ Switching to Class ${classNum} page:`, file);
    mainWindow.loadFile(file).catch(err => {
      console.error('Failed loading class page:', err);
    });
  });

  serial.on('experiment-changed', async (d) => {
    const expNum = parseInt(d.expNum, 10);
    if (!expNum) {
      console.warn('⚠️ Invalid experiment number from kit:', d);
      return;
    }
    if (expNum === lastExperiment) return; // avoid duplicate reloads
    lastExperiment = expNum;
    currentExperiment = expNum;

    // Build expected file path
    const file = path.join(__dirname, `../pages/class${currentClass}/C${currentClass}E${expNum}.html`);
    console.log(`➡ Opening Experiment ${expNum} of Class ${currentClass}:`, file);

    // Check file exists before loading -- avoid blank screen or silent failure
    try {
      if (!fs.existsSync(file)) {
        console.error('❌ Experiment file not found:', file);
        const fallback = (experimentPages && experimentPages[currentClass] && experimentPages[currentClass][expNum]) ?
          path.join(__dirname, '../pages', experimentPages[currentClass][expNum]) : null;
        if (fallback && fs.existsSync(fallback)) {
          console.log('➡ Using fallback experiment page:', fallback);
          await mainWindow.loadFile(fallback);
        } else {
          console.warn('⚠️ No fallback page available — skipping load.');
        }
        return;
      }
      await mainWindow.loadFile(file);
    } catch (err) {
      console.error('❌ Error loading experiment file:', err);
    }

    // After opening, send thresholds
    setTimeout(async () => {
      try {
        const key = `C${currentClass}_E${currentExperiment}`;
        const tset = thresholdsModule.getActive(key);
        if (tset && serial) {
          console.log(`📤 Sending default thresholds for ${key}:`, tset);
          await serial.sendThresholds(tset);
          console.log(`✅ Thresholds sent successfully for ${key}`);
        } else {
          console.warn(`⚠️ No thresholds found for ${key}`);
        }
      } catch (err) {
        console.warn(`❌ Error sending thresholds:`, err && err.message ? err.message : err);
      }
    }, 1200);
  });

  // Send default thresholds when app starts for the initial page
  /*const key = `C${currentClass}_E${currentExperiment}`;
  const tset = thresholdsModule.getActive(key);
  if (tset && serial) {
    console.log(`📤 Sending default thresholds for ${key}:`, tset);
    serial.sendThresholds(tset).catch(err =>
      console.warn(`⚠️ Threshold send failed for ${key}:`, err.message)
    );
  }*/

  // IPC handlers from renderer (unchanged)
  ipcMain.on('send-to-kit', (_, message) => {
    console.log('[IPC] send-to-kit:', message);
    if (serial) serial.sendMessage(message);
  });

  ipcMain.handle('send-class', async (evt, classNum) => {
    console.log('[main] IPC send-class received:', classNum);
    if (!serial) return { ok: false, error: 'serial-not-initialized' };
    try { await serial.sendClass(classNum); return { ok: true }; }
    catch (err) { return { ok: false, error: err.message }; }
  });

  ipcMain.handle('send-experiment', async (evt, expNum) => {
    if (!serial) return { ok: false, error: 'serial-not-initialized' };
    try { await serial.sendExperiment(expNum); return { ok: true }; }
    catch (err) { 
    console.error('[main] serial.sendClass failed:', err && err.message ? err.message : err);
    return { ok: false, error: err.message }; }
  });

  ipcMain.handle('get-active-thresholds', async (evt, key) => thresholdsModule.getActive(key) || []);
  ipcMain.handle('set-active-thresholds', async (evt, key, list) => {
    const ok = thresholdsModule.setActive(key, list);
    if (!ok) return { ok: false, error: 'Unknown key' };
    try { await serial.sendThresholds(list); return { ok: true }; }
    catch (err) { return { ok: false, error: err.message }; }
  });
  ipcMain.handle('reset-thresholds-for', async (evt, key) => {
    const ok = thresholdsModule.resetKeyToDefault(key);
    if (!ok) return { ok: false, error: 'Unknown key' };
    const list = thresholdsModule.getActive(key);
    try { await serial.sendThresholds(list); return { ok: true }; }
    catch (err) { return { ok: false, error: err.message }; }
  });
  ipcMain.handle('reset-all-thresholds', async () => {
    thresholdsModule.resetAll();
    const keys = Object.keys(thresholdsModule.defaultThresholds);
    try {
      for (const key of keys) {
        const list = thresholdsModule.getActive(key);
        if (list && list.length) {
          await serial.sendThresholds(list);
          await new Promise(r => setTimeout(r, 150));
        }
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle('send-thresholds-for', async (evt, key) => {
    if (!serial) return { ok: false, error: 'serial-not-initialized' };
    try {
      const list = thresholdsModule.getActive(key) || [];
      if (!list || !list.length) return { ok: false, error: `No thresholds found for ${key}` };
      await serial.sendThresholds(list);
      return { ok: true, sent: list.length };
    } catch (err) {
      console.warn(`⚠️ Failed to send thresholds for ${key}:`, err.message);
      return { ok: false, error: err.message };
    }
  });
});

app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', async () => {
  try {
    thresholdsModule.resetAll();
    if (serial) {
      const keys = Object.keys(thresholdsModule.defaultThresholds);
      for (const key of keys) {
        const list = thresholdsModule.getActive(key);
        if (list && list.length) {
          await serial.sendThresholds(list);
          await new Promise(r => setTimeout(r, 100));
        }
      }
    }
  } catch (e) {
    console.warn('Error while resetting thresholds at quit:', e.message);
  }
});
