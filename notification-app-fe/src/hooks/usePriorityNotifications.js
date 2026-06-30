import { useState, useEffect } from "react";
import { fetchNotifications } from "../api/notifications";
import { getTopN } from "../utils/notificationPriority";
import { Log } from "../middleware/logger";

/**
 * Hook for the Priority Inbox page.
 * Fetches notifications (with optional type filter), sorts by priority,
 * and returns the top N most important notifications.
 *
 * @param {object} [params]
 * @param {number} [params.topN=10]              - Number of top notifications to return
 * @param {string} [params.notification_type]    - "All" | "Event" | "Result" | "Placement"
 */
export function usePriorityNotifications({ topN = 10, notification_type } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      await Log(
        "frontend",
        "info",
        "hook",
        `usePriorityNotifications: loading topN=${topN}, type=${notification_type ?? "all"}`
      );

      setLoading(true);
      setError(null);

      try {
        // Fetch a large batch so priority sort operates on the full dataset
        const data = await fetchNotifications({
          page: 1,
          limit: 100,
          notification_type: notification_type === "All" ? undefined : notification_type,
        });
        const raw = data.notifications ?? [];

        await Log(
          "frontend",
          "info",
          "hook",
          `usePriorityNotifications: sorting ${raw.length} notifications, selecting top ${topN}`
        );

        const prioritized = getTopN(raw, topN);

        await Log(
          "frontend",
          "info",
          "hook",
          `usePriorityNotifications: top ${prioritized.length} notifications generated`
        );

        setNotifications(prioritized);
      } catch (err) {
        await Log(
          "frontend",
          "error",
          "hook",
          `usePriorityNotifications: error - ${err.message}`
        ).catch(() => {});
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [topN, notification_type]);

  return { notifications, loading, error };
}
