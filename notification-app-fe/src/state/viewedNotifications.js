/**
 * src/state/viewedNotifications.js
 *
 * Tracks which notification IDs the user has already seen.
 * Persisted in localStorage so the read/unread state survives page refreshes.
 */

const STORAGE_KEY = "viewed_notification_ids";

/**
 * Returns the Set of all viewed notification IDs from localStorage.
 * @returns {Set<string>}
 */
export function getViewedIds() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
}

/**
 * Marks a single notification ID as viewed.
 * @param {string} id
 */
export function markAsViewed(id) {
  try {
    const ids = getViewedIds();
    if (!ids.has(id)) {
      ids.add(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
    }
  } catch {
    // Ignore storage errors — non-critical
  }
}

/**
 * Returns true if the notification ID has been viewed before.
 * @param {string} id
 * @returns {boolean}
 */
export function isViewed(id) {
  return getViewedIds().has(id);
}
