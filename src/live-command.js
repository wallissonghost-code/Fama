export function commandAction(data = {}) {
  return String(data.action || data.command || '');
}

export function commandUser(data = {}) {
  return data.event?.user || data.payload?.event?.user || data.user || '';
}

export function commandAvatar(data = {}) {
  return data.event?.avatar || data.payload?.event?.avatar || data.avatar || '';
}

export function commandEvent(data = {}) {
  return data.event || data.payload?.event || {};
}

export function commandCount(data = {}) {
  const event = commandEvent(data);
  return Math.max(0, Number(event.count) || Number(event.likeCount) || Number(data.count) || 1);
}

export function commandDiamonds(data = {}) {
  const event = commandEvent(data);
  return Math.max(
    0,
    Number(event.totalDiamonds) ||
    ((Number(event.diamondValue) || 0) * (Number(event.count) || 1)) ||
    Number(event.diamondValue) ||
    0
  );
}

export function commandPoints(data = {}) {
  const params = data.params || data.action?.params || {};
  return Math.max(0, Number(params.amount) || commandDiamonds(data) || 0);
}
