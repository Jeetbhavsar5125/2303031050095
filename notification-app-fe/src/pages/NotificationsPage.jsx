import { useState, useEffect } from "react";
import {
  Alert,
  Badge,
  Box,
  CircularProgress,
  Divider,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";
import { getViewedIds, markAsViewed } from "../state/viewedNotifications";
import { Log } from "../middleware/logger";

const LIMIT = 10;

export function NotificationsPage() {
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);

  // Snapshot of viewed IDs at mount time — determines the "New" indicator
  const [viewedIds] = useState(() => getViewedIds());

  const { notifications, loading, error, totalPages } = useNotifications({
    page,
    limit: LIMIT,
    notification_type: filter === "All" ? undefined : filter,
  });

  // Mark all displayed notifications as viewed for future sessions
  useEffect(() => {
    if (notifications.length > 0) {
      notifications.forEach((n) => markAsViewed(n.ID));
      Log(
        "frontend",
        "info",
        "page",
        `NotificationsPage: marked ${notifications.length} notifications as viewed`
      ).catch(() => {});
    }
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !viewedIds.has(n.ID)).length;

  const handleFilterChange = (_, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
      setPage(1); // Reset to page 1 on filter change
      Log(
        "frontend",
        "info",
        "page",
        `NotificationsPage: filter changed to "${newFilter}"`
      ).catch(() => {});
    }
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
    Log(
      "frontend",
      "info",
      "page",
      `NotificationsPage: navigated to page ${newPage}`
    ).catch(() => {});
  };

  return (
    <Box>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsIcon sx={{ fontSize: 28, color: "text.secondary" }} />
        </Badge>
        <Box>
          <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
            All Notifications
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {unreadCount > 0 ? `${unreadCount} new` : "All caught up"}
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ mb: 2.5 }} />

      {/* ── Filter ─────────────────────────────────────────────────── */}
      <Box mb={2.5}>
        <NotificationFilter value={filter} onChange={handleFilterChange} />
      </Box>

      {/* ── Content ────────────────────────────────────────────────── */}
      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          Failed to load notifications: {error}
        </Alert>
      )}

      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info" sx={{ mt: 1 }}>
          No{filter !== "All" ? ` ${filter}` : ""} notifications found.
        </Alert>
      )}

      {!loading && !error && notifications.length > 0 && (
        <Stack spacing={1.5}>
          {notifications.map((n) => (
            <NotificationCard
              key={n.ID}
              notification={n}
              isRead={viewedIds.has(n.ID)}
            />
          ))}
        </Stack>
      )}

      {/* ── Pagination ─────────────────────────────────────────────── */}
      {!loading && !error && totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
}
