import { GAME_MANIFEST, POINT_RULES, STORAGE_KEYS } from './config.js';
import { LivePlusSession } from './liveplus-session.js';
import { commandAction, commandAvatar, commandCount, commandDiamonds, commandPoints, commandUser } from './live-command.js';

const PROGRESS_KEY = 'fama-score-progress-v1';

export class LiveBridge {
  constructor({ store, onRankingChange, onStatusChange, onRulesChange }) {
    this.store = store;
    this.onRankingChange = onRankingChange;
    this.onStatusChange = onStatusChange;
    this.onRulesChange = onRulesChange;
    this.session = null;
    this.rules = [];
    this.progress = this.loadProgress();
  }

  loadProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
      return {
        likes: parsed.likes && typeof parsed.likes === 'object' ? parsed.likes : {},
        comments: parsed.comments && typeof parsed.comments === 'object' ? parsed.comments : {},
        followed: parsed.followed && typeof parsed.followed === 'object' ? parsed.followed : {}
      };
    } catch {
      return { likes: {}, comments: {}, followed: {} };
    }
  }

  saveProgress() {
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(this.progress)); } catch {}
  }

  resetProgress() {
    this.progress = { likes: {}, comments: {}, followed: {} };
    try { localStorage.removeItem(PROGRESS_KEY); } catch {}
  }

  setStatus(text, kind = '') {
    this.onStatusChange?.(text, kind);
  }

  async connect(code) {
    this.disconnect();
    this.setStatus('Conectando…', 'warn');
    this.session = new LivePlusSession({ storageKey: STORAGE_KEYS.liveSession, manifest: GAME_MANIFEST });
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
      this.session.sendState({ scope: 'initial', gameId: GAME_MANIFEST.gameId, ranking: this.store.getTop(), rules: this.rules.length });
    });

    this.session.addEventListener('command', event => this.handleCommand(event.detail || {}));

    this.session.addEventListener('message', event => {
      const data = event.detail || {};
      if (data.type === 'rules_sync' && Array.isArray(data.rules)) {
        this.rules = data.rules;
        this.onRulesChange?.(this.rules.slice());
        this.session?.sendState({ scope: 'rules', gameId: GAME_MANIFEST.gameId, rules: this.rules.length });
      }
    });

    this.session.addEventListener('reconnecting', () => this.setStatus('Reconectando…', 'warn'));
    this.session.addEventListener('lost', () => this.setStatus('Conexão perdida', 'err'));
    this.session.addEventListener('rejected', event => this.setStatus(event.detail?.reason || 'Sessão recusada', 'err'));
  }

  addPoints(user, avatar, amount) {
    const points = Math.floor(Number(amount) || 0);
    if (!user || points <= 0) return 0;
    this.store.registerGift({ id: user, handle: user, avatar, amount: points });
    this.onRankingChange?.();
    return points;
  }

  accumulate(user, bucket, incoming, threshold) {
    if (!user || incoming <= 0 || threshold <= 0) return 0;
    const current = Number(this.progress[bucket][user]) || 0;
    const total = current + incoming;
    const points = Math.floor(total / threshold);
    this.progress[bucket][user] = total % threshold;
    this.saveProgress();
    return points;
  }

  handleCommand(data) {
    const action = commandAction(data);
    const user = commandUser(data);
    const avatar = commandAvatar(data);
    let awarded = 0;
    let executed = false;

    if (action === 'fama_reset_points') {
      this.store.reset();
      this.resetProgress();
      this.onRankingChange?.();
      executed = true;
    } else if (action === 'fama_like') {
      const points = this.accumulate(user, 'likes', commandCount(data), POINT_RULES.likesPerPoint);
      awarded = this.addPoints(user, avatar, points);
      executed = Boolean(user);
    } else if (action === 'fama_comment') {
      const points = this.accumulate(user, 'comments', commandCount(data), POINT_RULES.commentsPerPoint);
      awarded = this.addPoints(user, avatar, points);
      executed = Boolean(user);
    } else if (action === 'fama_follow') {
      if (user && !this.progress.followed[user]) {
        this.progress.followed[user] = true;
        this.saveProgress();
        awarded = this.addPoints(user, avatar, POINT_RULES.followPoints);
      }
      executed = Boolean(user);
    } else if (action === 'fama_gift') {
      awarded = this.addPoints(user, avatar, commandDiamonds(data) * POINT_RULES.diamondPoints);
      executed = Boolean(user);
    } else if (action === 'fama_points') {
      awarded = this.addPoints(user, avatar, commandPoints(data));
      executed = Boolean(user && awarded);
    } else {
      return;
    }

    this.session?.sendState({
      scope: 'command',
      gameId: GAME_MANIFEST.gameId,
      commandStatus: executed ? 'executed' : 'ignored',
      action,
      awardedPoints: awarded,
      ranking: this.store.getTop()
    });
  }

  disconnect() {
    try { this.session?.disconnect(); } catch {}
    this.session = null;
  }
}
