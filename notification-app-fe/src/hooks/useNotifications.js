import { useState, useEffect } from "react";
import { fetchNotifications } from "../api/notifications";
import { Log } from "../middleware/logger";

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
        `Loading notifications page ${page}`
      );

      setLoading(true);
      setError(null);

      try {
        const data = await fetchNotifications({ page, limit, notification_type });
        const notifs = data.notifications ?? [];

        setNotifications(notifs);

        if (data.total != null) {
          setTotalPages(Math.max(1, Math.ceil(data.total / limit)));
        } else {
          setTotalPages(notifs.length >= limit ? page + 1 : page);
        }

        await Log(
          "frontend",
          "info",
          "hook",
          `Loaded ${notifs.length} notifications`
        );
      } catch (err) {
        await Log(
          "frontend",
          "error",
          "hook",
          `Fetch error: ${err.message}`
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
