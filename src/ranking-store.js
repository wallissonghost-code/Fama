export class RankingStore {
  constructor(storageKey) {
    this.storageKey = storageKey;
    this.donors = this.load();
  }

  load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(this.storageKey));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.donors));
      return true;
    } catch {
      return false;
    }
  }

  getTop(limit = 10) {
    return [...this.donors]
      .filter(donor => Number(donor.total) > 0)
      .sort((a, b) => Number(b.total) - Number(a.total))
      .slice(0, limit);
  }

  registerGift({ id, handle, name, avatar, amount }) {
    const now = Date.now();
    const normalizedHandle = this.normalizeHandle(handle);
    const numericAmount = Number(amount) || 0;

    let donor = this.donors.find(item =>
      (id && item.id === id) ||
      (normalizedHandle && item.handle === normalizedHandle)
    );

    if (!donor) {
      donor = {
        id: id || normalizedHandle,
        handle: normalizedHandle || '@user',
        name: name || normalizedHandle || '',
        avatar: avatar || '',
        total: 0,
        lastSeen: now
      };
      this.donors.push(donor);
    }

    donor.handle = normalizedHandle || donor.handle;
    donor.name = name || donor.name;
    donor.avatar = avatar || donor.avatar;
    donor.lastSeen = now;
    donor.total = Number(donor.total || 0) + numericAmount;

    this.save();
    return donor;
  }

  markViewer({ id, handle }) {
    const normalizedHandle = this.normalizeHandle(handle);
    const donor = this.donors.find(item =>
      (id && item.id === id) ||
      (normalizedHandle && item.handle === normalizedHandle)
    );

    if (!donor) return null;

    donor.lastSeen = Date.now();
    this.save();
    return donor;
  }

  reset() {
    this.donors = [];
    this.save();
  }

  normalizeHandle(handle = '') {
    const value = String(handle).trim();
    if (!value) return '';
    return value.startsWith('@') ? value : `@${value}`;
  }
}
