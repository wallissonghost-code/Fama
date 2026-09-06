export function commandAction(data = {}) {
  return String(data.action || data.command || '');
}

export function commandUser(data = {}) {
  return data.event?.user || data.payload?.event?.user || data.user || '';
}

export function commandAvatar(data = {}) {
  return data.event?.avatar || data.payload?.event?.avatar || data.avatar || '';
}

export function commandPoints(data = {}) {
  const params = data.params || data.action?.params || {};
  const event = data.event || data.payload?.event || {};

  return Math.max(
    0,
    Number(params.amount) ||
    Number(event.totalDiamonds) ||
    Number(event.diamondValue) ||
    0
  );
}
