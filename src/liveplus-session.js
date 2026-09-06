export class LivePlusSession extends EventTarget {
  constructor({ storageKey, manifest }) {
    super();
    this.storageKey = storageKey;
    this.manifest = manifest;
    this.peer = null;
    this.connection = null;
    this.code = '';
    this.token = '';
    this.retry = 0;
    this.retryTimer = null;
    this.manualDisconnect = false;
  }

  cleanCode(raw = '') {
    return String(raw).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  }

  targetPeerId(code) {
    return `liveplus-session-${this.cleanCode(code).toLowerCase()}`;
  }

  emit(type, detail = {}) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }

  loadToken() {
    try {
      return sessionStorage.getItem(`${this.storageKey}:${this.cleanCode(this.code)}`) || '';
    } catch {
      return '';
    }
  }

  saveToken(token) {
    this.token = String(token || '');
    try {
      sessionStorage.setItem(`${this.storageKey}:${this.cleanCode(this.code)}`, this.token);
    } catch {}
  }

  cleanup() {
    clearTimeout(this.retryTimer);
    this.retryTimer = null;
    try { this.connection?.close(); } catch {}
    try { this.peer?.destroy(); } catch {}
    this.connection = null;
    this.peer = null;
  }

  sendManifest() {
    if (!this.connection?.open || !this.manifest) return false;
    try {
      this.connection.send({
        type: 'game_manifest',
        protocol: 'liveplus-game-manifest-v1',
        manifest: this.manifest
      });
      return true;
    } catch {
      return false;
    }
  }

  async connect(rawCode) {
    const code = this.cleanCode(rawCode);
    if (code.length !== 8) throw new Error('Código da partida inválido.');
    if (!window.Peer) throw new Error('PeerJS não carregou.');

    this.manualDisconnect = false;
    this.code = code;
    this.token = this.loadToken();
    this.retry = 0;
    this.cleanup();
    return this.open();
  }

  open() {
    return new Promise((resolve, reject) => {
      this.peer = new window.Peer(undefined, { debug: 0 });
      let settled = false;

      const fail = error => {
        const normalized = error instanceof Error ? error : new Error(String(error));
        if (!settled) {
          settled = true;
          reject(normalized);
        }
        this.scheduleReconnect();
      };

      this.peer.on('open', () => {
        this.connection = this.peer.connect(this.targetPeerId(this.code), {
          reliable: true,
          serialization: 'json'
        });

        this.connection.on('open', () => {
          try {
            this.connection.send({
              type: 'session_hello',
              token: this.token || '',
              protocol: 'liveplus-match-v1'
            });
          } catch {}
          this.emit('transport', { status: 'connected' });
        });

        this.connection.on('data', data => {
          if (!data || typeof data !== 'object') return;

          if (data.type === 'session_accept') {
            if (data.token) this.saveToken(data.token);
            this.retry = 0;
            this.sendManifest();
            this.emit('connected', { code: this.code });
            if (!settled) {
              settled = true;
              resolve(data);
            }
            return;
          }

          if (data.type === 'session_reject') {
            const error = new Error(data.reason || 'Sessão recusada');
            this.emit('rejected', { reason: error.message });
            this.manualDisconnect = true;
            this.cleanup();
            if (!settled) {
              settled = true;
              reject(error);
            }
            return;
          }

          if (data.type === 'command') this.emit('command', data);
          else this.emit('message', data);
        });

        this.connection.on('close', () => {
          this.emit('transport', { status: 'disconnected' });
          this.scheduleReconnect();
        });
        this.connection.on('error', fail);
      });

      this.peer.on('error', fail);
      this.peer.on('disconnected', () => {
        try { this.peer.reconnect(); }
        catch { this.scheduleReconnect(); }
      });
    });
  }

  scheduleReconnect() {
    if (this.manualDisconnect || this.retryTimer || !this.code) return;
    this.retry += 1;

    if (this.retry > 6) {
      this.emit('lost', { reason: 'reconexão esgotada' });
      return;
    }

    const delay = Math.min(5000, 500 * Math.pow(1.6, this.retry));
    this.emit('reconnecting', { attempt: this.retry, delay });

    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      if (this.manualDisconnect) return;
      this.cleanup();
      this.open().catch(() => {});
    }, delay);
  }

  sendState(state = {}) {
    if (!this.connection?.open) return false;
    try {
      this.connection.send({ type: 'state', ...state, at: Date.now() });
      return true;
    } catch {
      return false;
    }
  }

  disconnect() {
    this.manualDisconnect = true;
    this.code = '';
    this.cleanup();
    this.emit('transport', { status: 'offline' });
  }
}
