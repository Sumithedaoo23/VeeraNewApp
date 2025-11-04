// SerialManager.js
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { EventEmitter } = require('events');
const fs = require('fs');

class SerialManager extends EventEmitter {
  constructor(opts = {}) {
    super();
    this.portPath = opts.portPath || 'COM3';
    this.baudRate = opts.baudRate || 9600;
    this.ackTimeout = opts.ackTimeout || 1000; // ms
    this.retryLimit = opts.retryLimit || 1;
    this._open = false;
    this._pending = null;
    this._queue = [];
    this._initPort();
  }

  _initPort() {
    this.port = new SerialPort({ path: this.portPath, baudRate: this.baudRate, autoOpen: false });
    this.parser = this.port.pipe(new ReadlineParser({ delimiter: '$' }));

    this.port.on('open', () => {
      this._open = true;
      console.log('[SerialManager] port open', this.portPath, this.baudRate);
      this.emit('connected');
      this._processQueue();
    });

    this.port.on('close', () => {
      this._open = false;
      console.log('[SerialManager] port closed');
      this.emit('disconnected');
      setTimeout(() => this._reopen(), 1000);
    });

    this.port.on('error', (err) => {
      console.error('[SerialManager] port error', err);
      this.emit('error', err);
    });

    this.parser.on('data', (raw) => {
      const trimmed = raw.trim();
      if (!trimmed) return;
      const normalized = trimmed.startsWith('#') ? trimmed : '#' + trimmed;
      this._handleIncoming(normalized);
    });

    this._reopen();
  }

  _reopen() {
    if (this.port.isOpen) return;
    this.port.open((err) => {
      if (err) {
        console.warn('[SerialManager] open failed, will retry', err.message || err);
        setTimeout(() => this._reopen(), 1000);
      } else {
        // success handled in 'open' listener
      }
    });
  }

  // low-level write: expects cmd WITHOUT trailing '$'
  _writeRawNoDollar(cmdNoDollar) {
    const out = cmdNoDollar + '$';
    if (!this._open) {
      console.warn('[SerialManager] port closed, write queued/attempted:', out);
    }
    this.port.write(out, (err) => {
      if (err) console.error('[SerialManager] write err', err);
      else console.log('[SerialManager] ->', out);
    });
  }

  // Queue-based send expecting ACK format
  sendCommand(cmdNoDollar, expectedAck) {
    return new Promise((resolve, reject) => {
      const work = { cmdNoDollar, expectedAck, resolve, reject, retries: 0 };
      this._queue.push(work);
      this._processQueue();
    });
  }

  _processQueue() {
    if (!this._open) return;
    if (this._pending) return;
    const next = this._queue.shift();
    if (!next) return;
    this._pending = next;
    this._sendPending(next);
  }

  _sendPending(pending) {
    this._writeRawNoDollar(pending.cmdNoDollar);
    pending.timer = setTimeout(() => this._onPendingTimeout(pending), this.ackTimeout);
  }

  _onPendingTimeout(pending) {
    pending.retries += 1;
    if (pending.retries <= this.retryLimit) {
      console.warn('[SerialManager] retry', pending.cmdNoDollar);
      this._writeRawNoDollar(pending.cmdNoDollar);
      pending.timer = setTimeout(() => this._onPendingTimeout(pending), this.ackTimeout);
    } else {
      clearTimeout(pending.timer);
      const rej = pending.reject;
      this._pending = null;
      rej(new Error('ACK timeout: ' + pending.cmdNoDollar));
      setImmediate(() => this._processQueue());
    }
  }

  _handleIncoming(raw) {
    // raw is like '#C:5'
    console.log('[SerialManager] <-', raw + '$');

    // if pending expectedAck matches, resolve pending
    if (this._pending && this._pending.expectedAck && raw === this._pending.expectedAck) {
      clearTimeout(this._pending.timer);
      this._pending.resolve(raw);
      this._pending = null;
      this.emit('ack', raw);
      setImmediate(() => this._processQueue());
      // continue parsing events below
    }

    if (!raw.startsWith('#')) return;
    const payload = raw.slice(1);
    const [head, ...rest] = payload.split(':');
    const key = head.trim();
    const val = rest.join(':');

    if (key === 'C') this.emit('class-changed', { classNum: val });
    else if (key === 'E') this.emit('experiment-changed', { expNum: val });
    else {
      const num = Number(val);
      this.emit('sensor-update', { sensor: key, value: isNaN(num) ? val : num });
    }
  }

  _expectedAckFor(cmdNoDollar) {
    // cmdNoDollar like '#c:5' -> expected ack '#C:5'
    if (!cmdNoDollar.startsWith('#')) return null;
    const body = cmdNoDollar.slice(1);
    const idx = body.indexOf(':');
    if (idx === -1) return null;
    const letter = body.slice(0, idx);
    const rest = body.slice(idx + 1);
    return '#' + letter.toUpperCase() + ':' + rest;
  }

  // convenience
  async sendClass(classNum) {
    const cmd = `#c:${classNum}`;
    const ack = this._expectedAckFor(cmd);
    return this.sendCommand(cmd, ack);
  }

  async sendExperiment(expNum) {
    const cmd = `#e:${expNum}`;
    const ack = this._expectedAckFor(cmd);
    return this.sendCommand(cmd, ack);
  }

  async sendThreshold(code, value) {
    const valP = String(value).padStart(3, '0');
    const cmd = `#${code.toLowerCase()}:${valP}`;
    const ack = this._expectedAckFor(cmd);
    return this.sendCommand(cmd, ack);
  }

  // Helper: wait until port is open (useful for threshold sends)
  async waitForOpen(timeout = 5000) {
    if (this._open) return true;
    return new Promise((resolve, reject) => {
      let timer = setTimeout(() => {
        this.removeListener('connected', onConn);
        reject(new Error('timeout waiting for serial open'));
      }, timeout);
      const onConn = () => {
        clearTimeout(timer);
        resolve(true);
      };
      this.once('connected', onConn);
    });
  }

  // send array of {code, value} sequentially (no per-message ACK required)
  async sendThresholds(list) {
    // Wait for open (fail clearly if not open)
    try {
      await this.waitForOpen(4000);
    } catch (err) {
      console.warn('[SerialManager] Cannot send thresholds: port not open', err.message);
      throw err;
    }

    for (const item of list) {
      const cmd = `#${String(item.code).toLowerCase()}:${String(item.value).padStart(3, '0')}`;
      // Use _writeRawNoDollar to send; it appends '$'
      this._writeRawNoDollar(cmd);
      await new Promise(r => setTimeout(r, 80)); // small gap
    }
    return true;
  }
}

module.exports = SerialManager;