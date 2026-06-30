/**
 * Priority weights for notification types.
 * Placement > Result > Event
 */
export const PRIORITY_WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

/**
 * Returns the numeric priority weight for a notification type.
 * Unrecognised types default to 0.
 *
 * @param {string} type - Notification type
 * @returns {number}
 */
function getWeight(notification) {
  return PRIORITY_WEIGHTS[notification.Type] ?? 0;
}

/**
 * Sorts notifications by:
 *   1. Higher weight first  (Placement > Result > Event)
 *   2. Newer timestamp first (within the same weight tier)
 *
 * @param {Array<Object>} notifications - Raw notification array from the API
 * @returns {Array<Object>} Sorted array (does not mutate the original)
 */
export function sortByPriority(notifications) {
  return [...notifications].sort((a, b) => {
    const weightDiff = getWeight(b) - getWeight(a);
    if (weightDiff !== 0) return weightDiff;

    // Same weight — newer Timestamp wins
    const timeA = new Date(a.Timestamp ?? 0).getTime();
    const timeB = new Date(b.Timestamp ?? 0).getTime();
    return timeB - timeA;
  });
}

/**
 * Returns the top N notifications after priority-sorting.
 *
 * @param {Array<Object>} notifications - Raw notification array from the API
 * @param {number} [n=10]              - Number of top notifications to return
 * @returns {Array<Object>}
 */
export function getTopN(notifications, n = 10) {
  return sortByPriority(notifications).slice(0, n);
}
