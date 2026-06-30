import { Log } from "../middleware/logger";
import { getToken } from "../config/auth";

const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Fetches all notifications from the protected assessment API.
 *
 * @returns {Promise<Array<Object>>} Array of notification objects
 */
export async function fetchNotifications() {
  await Log("frontend", "info", "api", "fetchNotifications: API request started");

  try {
    const token = await getToken();
    const response = await fetch(`${BASE_URL}/notifications`, {
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
        `fetchNotifications: API request failed with status ${response.status} - ${errorText}`
      );
      throw new Error(`Failed to fetch notifications: ${response.status}`);
    }

    const data = await response.json();
    await Log(
      "frontend",
      "info",
      "api",
      `fetchNotifications: API request successful, received ${(data.notifications ?? []).length} notifications`
    );

    return data;
  } catch (error) {
    await Log(
      "frontend",
      "error",
      "api",
      `fetchNotifications: API request failed - ${error.message}`
    );
    throw error;
  }
}

