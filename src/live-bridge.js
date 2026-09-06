import { GAME_MANIFEST, STORAGE_KEYS } from './config.js';
import { LivePlusSession } from './liveplus-session.js';
import { commandAction, commandAvatar, commandPoints, commandUser } from './live-command.js';

export class LiveBridge {
  constructor({ store, onRankingChange, onStatusChange, onRulesChange }) {
    this.store = store;
    this.onRankingChange = onRankingChange;
    this.onStatusChange = onStatusChange;
    this.onRulesChange = onRulesChange;
    this.session = null;
    this.rules = [];
  }

  setStatus(text, kind = '') {
    this.onStatusChange?.(text, kind);
  }

  async connect(code) {
    this.disconnect();
    this.setStatus('Conectando…', 'warn');

    this.session = new LivePlusSession({
      storageKey: STORAGE_KEYS.liveSession,
      manifest: GAME_MANIFEST
    });

    this.bindSessionEvents();

    try {
      await this.session.connect(code);
      return true;
    } catch (error) {
      this.setStatus(error?.message || 'Falha ao conectar', 'err');
      return false;
    }
  }

  bindSessionEvents() {
    this.session.addEventListener('connected', () => {
      this.setStatus('Conectado', 'ok');
      this.session.sendState({
        scope: 'initial',
        gameId: GAME_MANIFEST.gameId,
        ranking: this.store.getTop(),
        rules: this.rules.length
      });
    });

    this.session.addEventListener('command', event => {
      this.handleCommand(event.detail || {});
    });

    this.session.addEventListener('message', event => {
      const data = event.detail || {};
      if (data.type === 'rules_sync' && Array.isArray(data.rules)) {
        this.rules = data.rules;
        this.onRulesChange?.(this.rules.slice());
        this.session?.sendState({
          scope: 'rules',
          gameId: GAME_MANIFEST.gameId,
          rules: this.rules.length
        });
      }
    });

    this.session.addEventListener('reconnecting', () => {
      this.setStatus('Reconectando…', 'warn');
    });

    this.session.addEventListener('lost', () => {
      this.setStatus('Conexão perdida', 'err');
    });

    this.session.addEventListener('rejected', event => {
      this.setStatus(event.detail?.reason || 'Sessão recusada', 'err');
    });
  }

  handleCommand(data) {
    const action = commandAction(data);
    if (action !== 'fama_points') return;

    const user = commandUser(data);
    const avatar = commandAvatar(data);
    const amount = commandPoints(data);
    const executed = Boolean(user && amount);

    if (executed) {
      this.store.registerGift({ id: user, handle: user, avatar, amount });
      this.onRankingChange?.();
    }

    this.session?.sendState({
      scope: 'command',
      gameId: GAME_MANIFEST.gameId,
      commandStatus: executed ? 'executed' : 'ignored',
      action
    });
  }

  disconnect() {
    try { this.session?.disconnect(); } catch {}
    this.session = null;
  }
}
