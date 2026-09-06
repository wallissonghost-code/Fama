import { STORAGE_KEYS } from './config.js';
import { RankingStore } from './ranking-store.js';
import { renderRanking } from './ranking-view.js';
import { LiveBridge } from './live-bridge.js';
import { setupConnectionPanel } from './connection-panel.js';
import { setupScoreHud } from './score-hud.js';

const store = new RankingStore(STORAGE_KEYS.ranking);
const refresh = () => renderRanking(store.getTop());
const scoreHud = setupScoreHud();

let bridge;
const panel = setupConnectionPanel({
  onConnect: async (code, setStatus) => {
    if (!bridge) {
      bridge = new LiveBridge({
        store,
        onRankingChange: refresh,
        onStatusChange: setStatus,
        onRulesChange: rules => scoreHud.syncRules(rules)
      });
    } else {
      bridge.onStatusChange = setStatus;
      bridge.onRulesChange = rules => scoreHud.syncRules(rules);
    }

    return bridge.connect(code);
  }
});

function registerGift(payload) {
  const donor = store.registerGift(payload);
  refresh();
  return donor;
}

function markViewer(payload) {
  const donor = store.markViewer(payload);
  if (donor) refresh();
  return donor;
}

function resetDemo() {
  store.reset();
  refresh();
}

window.Fama = {
  registerGift,
  markViewer,
  getTop: () => store.getTop(),
  connect: panel.connect,
  setScoreHudVisible: scoreHud.setVisible,
  syncScoreRules: scoreHud.syncRules,
  resetDemo
};

for (const eventName of ['gesturestart', 'gesturechange', 'gestureend']) {
  document.addEventListener(eventName, event => event.preventDefault(), { passive: false });
}

refresh();
