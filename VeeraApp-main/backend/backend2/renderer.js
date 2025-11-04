// renderer.js
document.addEventListener('DOMContentLoaded', () => {
  const api = window.veeraAPI;

  // Track current class & experiment selected
  let currentClass = null;
  let currentExperiment = null;

  // Log helper (optional)
  function log(...args) {
    console.log('[App]', ...args);
  }

  // ============ Kit → App Events ============

  // When kit sends #C:x$
  api.onKitClassChanged((d) => {
    const cls = Number(d.classNum ?? d);
    if (!cls) return log('Invalid class from kit:', d);
    log('Kit requested class', cls);
    currentClass = cls;
    // If mapping exists, open the class list page
    const page = (window.pageMap && window.pageMap.classPages && window.pageMap.classPages[cls]) ?
      window.pageMap.classPages[cls] : `class${cls}list.html`;
    log('Loading page:', page);
    window.location.href = page;
  });

  // When kit sends #E:x$
  api.onKitExperimentChanged((d) => {
    const exp = Number(d.expNum ?? d);
    if (!exp) return log('Invalid experiment from kit:', d);
    log('Kit requested experiment', exp, 'for currentClass', currentClass);
    currentExperiment = exp;
    if (!currentClass) {
      log('No current class — ignoring experiment');
      return;
    }
    // Use pageMap if present, otherwise use default naming
    const page = (window.pageMap && window.pageMap.experimentPages && window.pageMap.experimentPages[currentClass] && window.pageMap.experimentPages[currentClass][exp]) ?
      window.pageMap.experimentPages[currentClass][exp] : `C${currentClass}E${exp}.html`;
    log('Loading experiment page:', page);
    window.location.href = page;
  });

  // ============ App → Kit Events ============

  // Expose selectClass
  window.selectClass = async function (cls) {
    currentClass = cls;
    log('User selected class', cls, '— sending to kit');
    try {
      const res = await api.sendClass(cls); // will call main -> serialManager
      console.log('sendClass result:', res);
    } catch (e) {
      console.log('sendClass error', e);
    }
    const page = (window.pageMap && window.pageMap.classPages && window.pageMap.classPages[cls]) ?
      window.pageMap.classPages[cls] : `class${cls}list.html`;
    // small delay so send occurs before navigation
    setTimeout(() => { window.location.href = page; }, 120);
  };

  // FIXED selectExperiment: send experiment and thresholds BEFORE navigation
  window.selectExperiment = async function (exp) {
    if (!currentClass) {
      console.log('No current class when selecting experiment; defaulting to 5');
      currentClass = 5;
    }
    currentExperiment = exp;
    log('User selected experiment', exp, 'for class', currentClass);

    // 1) Send experiment to kit and await acknowledgement result from main
    try {
      const res = await api.sendExperiment(exp);
      console.log('sendExperiment result:', res);
    } catch (e) {
      console.log('sendExperiment error', e);
      // Even if sending experiment failed, we may still attempt to navigate locally.
    }

    // 2) Build page file name
    const page = (window.pageMap && window.pageMap.experimentPages && window.pageMap.experimentPages[currentClass] && window.pageMap.experimentPages[currentClass][exp]) ?
      window.pageMap.experimentPages[currentClass][exp] : `C${currentClass}E${exp}.html`;

    // 3) Send thresholds for this experiment BEFORE navigation so the send runs in this renderer
    // Use keys consistent with thresholds.js ("C5_E6" format). Try the underscore form.
    const key = `C${currentClass}_E${exp}`;
    try {
      const thrRes = await api.sendThresholdsFor(key);
      log(`Thresholds send result for ${key}:`, thrRes);
    } catch (err) {
      // If underscore-key doesn't exist or send fails, try compact "C5E6" key
      log(`First thresholds send failed for ${key}:`, err);
      const altKey = `C${currentClass}E${exp}`;
      try {
        const altRes = await api.sendThresholdsFor(altKey);
        log(`Thresholds send result for ${altKey}:`, altRes);
      } catch (err2) {
        log(`Thresholds send failed for both keys (${key}, ${altKey}):`, err2);
      }
    }

    // 4) Now navigate
    // Small delay is optional, but we've already awaited the threshold send so navigation is safe
    window.location.href = page;
  };

  // ---------- When a specific experiment HTML loads: auto-send thresholds ----------
  window.addEventListener('load', () => {
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1);
    const match = filename.match(/^C(\d+)[_]?E(\d+)\.html$/i);
    if (!match) return;

    const [_, cls, exp] = match;
    const key = `C${cls}_E${exp}`;
    log(`[AutoThreshold] Page detected: ${key}`);

    // Only send thresholds if app knows same active class & experiment
    if (String(currentClass) === cls && String(currentExperiment) === exp) {
      setTimeout(async () => {
        try {
          const res = await api.sendThresholdsFor(key);
          log(`[AutoThreshold] Thresholds sent for ${key}`, res);
        } catch (err) {
          console.error(`[AutoThreshold] Failed to send thresholds for ${key}`, err);
        }
      }, 1000);
    } else {
      log(`[AutoThreshold] Skipped (page=${key}, active=${currentClass}_${currentExperiment})`);
    }
  });

  // Expose pageMap on window for easier usage (pageMap.js must be included in HTML before this script)
  if (window.pageMap === undefined && typeof require === 'function') {
    try {
      window.pageMap = require('./pageMap'); // for dev when using nodeIntegration false this may fail; optional
    } catch (e) {
      // ignore
    }
  }
});