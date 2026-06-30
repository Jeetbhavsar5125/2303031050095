import { useState, useEffect } from "react";
import {
  Alert,
  Badge,
  Box,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { usePriorityNotifications } from "../hooks/usePriorityNotifications";
import { getViewedIds, markAsViewed } from "../state/viewedNotifications";
import { Log } from "../middleware/logger";

const TOP_N_OPTIONS = [5, 10, 15, 20];

export function PriorityNotificationsPage() {
  const [filter, setFilter] = useState("All");
  const [topN, setTopN] = useState(10);
  const [viewedIds] = useState(() => getViewedIds());

  const { notifications, loading, error } = usePriorityNotifications({
    topN,
    notification_type: filter === "All" ? undefined : filter,
  });

  useEffect(() => {
    if (notifications.length > 0) {
      notifications.forEach((n) => markAsViewed(n.ID));
      Log(
        "frontend",
        "info",
        "page",
        `Viewed priority: ${notifications.length}`
      ).catch(() => {});
    }
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !viewedIds.has(n.ID)).length;

  const handleFilterChange = (_, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
      Log(
        "frontend",
        "info",
        "page",
        `Priority Filter: ${newFilter}`
      ).catch(() => {});
    }
  };

  const handleTopNChange = (e) => {
    const val = Number(e.target.value);
    setTopN(val);
    Log(
      "frontend",
      "info",
      "page",
      `Priority limit: ${val}`
    ).catch(() => {});
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <StarIcon sx={{ fontSize: 28, color: "warning.main" }} />
        </Badge>
        <Box>
          <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
            Priority Inbox
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Top {topN} notifications by importance
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ mb: 2.5 }} />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        mb={2.5}
      >
        <NotificationFilter value={filter} onChange={handleFilterChange} />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="top-n-label">Show top</InputLabel>
          <Select
            labelId="top-n-label"
            id="top-n-select"
            value={topN}
            label="Show top"
            onChange={handleTopNChange}
          >
            {TOP_N_OPTIONS.map((n) => (
              <MenuItem key={n} value={n}>
                Top {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          Failed to load priority notifications: {error}
        </Alert>
      )}

      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info" sx={{ mt: 1 }}>
          No {filter !== "All" ? filter : ""} notifications found.
        </Alert>
      )}

      {!loading && !error && notifications.length > 0 && (
        <>
          <Typography variant="caption" color="text.secondary" mb={1} display="block">
            Sorted by: Placement (3) &gt; Result (2) &gt; Event (1), then by recency
          </Typography>
          <Stack spacing={1.5}>
            {notifications.map((n, index) => (
              <Stack key={n.ID} direction="row" alignItems="flex-start" spacing={1.5}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.disabled"
                  sx={{ pt: 1.8, minWidth: 24, textAlign: "right" }}
                >
                  #{index + 1}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <NotificationCard
                    notification={n}
                    isRead={viewedIds.has(n.ID)}
                  />
                </Box>
              </Stack>
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
}
