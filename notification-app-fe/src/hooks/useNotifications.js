import { useState, useEffect } from "react";
import { fetchNotifications } from "../api/notifications";
import { getTopN } from "../utils/notificationPriority";
import { Log } from "../middleware/logger";

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      await Log("frontend", "info", "hook", "useNotifications: starting notification load");
      setLoading(true);
      setError(null);

      try {
        const data = await fetchNotifications();
        const raw = data.notifications ?? [];

        await Log("frontend", "info", "hook", "useNotifications: sorting started");
        const top10 = getTopN(raw, 10);
        await Log(
          "frontend",
          "info",
          "hook",
          `useNotifications: sorting completed, top 10 generated from ${raw.length} notifications`
        );

        setNotifications(top10);
      } catch (err) {
        await Log(
          "frontend",
          "error",
          "hook",
          `useNotifications: failed to load notifications - ${err.message}`
        );
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { notifications, loading, error };
}
