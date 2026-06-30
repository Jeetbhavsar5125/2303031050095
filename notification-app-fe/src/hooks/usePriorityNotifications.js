import { useState, useEffect } from "react";
import { fetchNotifications } from "../api/notifications";
import { getTopN } from "../utils/notificationPriority";
import { Log } from "../middleware/logger";

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
        `Loading priority topN=${topN}`
      );

      setLoading(true);
      setError(null);

      try {
        const page1Data = await fetchNotifications({
          page: 1,
          limit: 10,
          notification_type: notification_type === "All" ? undefined : notification_type,
        });
        let raw = page1Data.notifications ?? [];

        if (raw.length === 10 && topN > 10) {
          try {
            const page2Data = await fetchNotifications({
              page: 2,
              limit: 10,
              notification_type: notification_type === "All" ? undefined : notification_type,
            });
            raw = [...raw, ...(page2Data.notifications ?? [])];
          } catch (err) {
            await Log(
              "frontend",
              "warn",
              "hook",
              `Page 2 fetch failed: ${err.message}`
            ).catch(() => {});
          }
        }

        await Log(
          "frontend",
          "info",
          "hook",
          `Sorting ${raw.length} items`
        );

        const prioritized = getTopN(raw, topN);

        await Log(
          "frontend",
          "info",
          "hook",
          `Sorted top ${prioritized.length} items`
        );

        setNotifications(prioritized);
      } catch (err) {
        await Log(
          "frontend",
          "error",
          "hook",
          `Priority fetch error: ${err.message}`
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
