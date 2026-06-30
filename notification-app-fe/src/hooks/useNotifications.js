import { useState, useEffect } from "react";
import { fetchNotifications } from "../api/notifications";
import { Log } from "../middleware/logger";

/**
 * Hook for the All Notifications page.
 * Supports server-side pagination and type filtering via API query params.
 *
 * @param {object} [params]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=10]
 * @param {string} [params.notification_type]  - "All" | "Event" | "Result" | "Placement"
 */
export function useNotifications({ page = 1, limit = 10, notification_type } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const load = async () => {
      await Log(
        "frontend",
        "info",
        "hook",
        `useNotifications: loading page=${page}, limit=${limit}, type=${notification_type ?? "all"}`
      );

      setLoading(true);
      setError(null);

      try {
        const data = await fetchNotifications({ page, limit, notification_type });
        const notifs = data.notifications ?? [];

        setNotifications(notifs);

        // Use API-provided total if available; otherwise estimate from response size
        if (data.total != null) {
          setTotalPages(Math.max(1, Math.ceil(data.total / limit)));
        } else {
          // If we received a full page, assume there might be more
          setTotalPages(notifs.length >= limit ? page + 1 : page);
        }

        await Log(
          "frontend",
          "info",
          "hook",
          `useNotifications: loaded ${notifs.length} notifications`
        );
      } catch (err) {
        await Log(
          "frontend",
          "error",
          "hook",
          `useNotifications: error - ${err.message}`
        ).catch(() => {});
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page, limit, notification_type]);

  return { notifications, loading, error, totalPages };
}
