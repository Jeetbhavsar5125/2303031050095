const STORAGE_KEY = "viewed_notification_ids";

export function getViewedIds() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
}

export function markAsViewed(id) {
  try {
    const ids = getViewedIds();
    if (!ids.has(id)) {
      ids.add(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
    }
  } catch {
    // Ignore storage errors
  }
}

export function isViewed(id) {
  return getViewedIds().has(id);
}
