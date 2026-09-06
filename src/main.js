import { STORAGE_KEYS } from './config.js';
import { RankingStore } from './ranking-store.js';
import { renderRanking } from './ranking-view.js';
import { LiveBridge } from './live-bridge.js';
import { setupConnectionPanel } from './connection-panel.js';

const store = new RankingStore(STORAGE_KEYS.ranking);
const refresh = () => renderRanking(store.getTop());

let bridge;
const panel = setupConnectionPanel({
  onConnect: async (code, setStatus) => {
    if (!bridge) {
      bridge = new LiveBridge({
        store,
        onRankingChange: refresh,
        onStatusChange: setStatus
      });
    } else {
      bridge.onStatusChange = setStatus;
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
  resetDemo
};

for (const eventName of ['gesturestart', 'gesturechange', 'gestureend']) {
  document.addEventListener(eventName, event => event.preventDefault(), { passive: false });
}

refresh();
