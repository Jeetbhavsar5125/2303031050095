import { Log } from "../middleware/logger";
import { getToken } from "../config/auth";

const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Fetches notifications from the protected assessment API.
 *
 * @param {object} [params]
 * @param {number} [params.page=1]               - Page number (1-indexed)
 * @param {number} [params.limit=10]             - Number of notifications per page
 * @param {string} [params.notification_type]    - Filter: "Event" | "Result" | "Placement"
 * @returns {Promise<object>} Raw API response object
 */
export async function fetchNotifications({ page = 1, limit = 10, notification_type } = {}) {
  const queryParams = new URLSearchParams();
  queryParams.set("page", String(page));
  queryParams.set("limit", String(limit));
  if (notification_type && notification_type !== "All") {
    queryParams.set("notification_type", notification_type);
  }

  const url = `${BASE_URL}/notifications?${queryParams.toString()}`;

  await Log(
    "frontend",
    "info",
    "api",
    `fetchNotifications: request started — ${url}`
  );

  try {
    const token = await getToken();
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      await Log(
        "frontend",
        "error",
        "api",
        `fetchNotifications: API error ${response.status} - ${errorText}`
      );
      throw new Error(`Failed to fetch notifications: ${response.status}`);
    }

    const data = await response.json();
    await Log(
      "frontend",
      "info",
      "api",
      `fetchNotifications: success, received ${(data.notifications ?? []).length} notifications`
    );

    return data;
  } catch (error) {
    await Log(
      "frontend",
      "error",
      "api",
      `fetchNotifications: failed - ${error.message}`
    ).catch(() => {});
    throw error;
  }
}


