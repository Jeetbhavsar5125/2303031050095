export const PRIORITY_WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function getWeight(notification) {
  return PRIORITY_WEIGHTS[notification.Type] ?? 0;
}

export function sortByPriority(notifications) {
  return [...notifications].sort((a, b) => {
    const weightDiff = getWeight(b) - getWeight(a);
    if (weightDiff !== 0) return weightDiff;

    const timeA = new Date(a.Timestamp ?? 0).getTime();
    const timeB = new Date(b.Timestamp ?? 0).getTime();
    return timeB - timeA;
  });
}

export function getTopN(notifications, n = 10) {
  return sortByPriority(notifications).slice(0, n);
}
