import { useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { markAsViewed } from "../state/viewedNotifications";
import { Log } from "../middleware/logger";

const TYPE_COLOR = {
  Placement: "success",
  Result: "info",
  Event: "warning",
};

const UNREAD_BORDER = {
  Placement: "#16a34a",
  Result: "#2563eb",
  Event: "#d97706",
};

export function NotificationCard({ notification, isRead }) {
  const { ID, Type, Message, Timestamp } = notification;

  useEffect(() => {
    markAsViewed(ID);
    Log("frontend", "info", "component", `Card viewed: ${ID}`).catch(() => {});
  }, [ID]);

  return (
    <Card
      variant="outlined"
      sx={{
        borderLeft: isRead
          ? "3px solid transparent"
          : `3px solid ${UNREAD_BORDER[Type] ?? "#6366f1"}`,
        backgroundColor: isRead ? "background.paper" : "action.hover",
        transition: "box-shadow 0.2s ease, transform 0.15s ease",
        "&:hover": {
          boxShadow: 3,
          transform: "translateY(-1px)",
        },
        cursor: "default",
      }}
    >
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
          {!isRead && (
            <FiberManualRecordIcon
              sx={{
                fontSize: 10,
                color: UNREAD_BORDER[Type] ?? "primary.main",
                mt: 0.7,
                flexShrink: 0,
              }}
            />
          )}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.75}>
              <Chip
                label={Type}
                color={TYPE_COLOR[Type] ?? "default"}
                size="small"
                sx={{ fontWeight: 600, fontSize: "0.7rem", height: 20 }}
              />
              {!isRead && (
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{ color: UNREAD_BORDER[Type] ?? "primary.main" }}
                >
                  NEW
                </Typography>
              )}
            </Stack>

            <Typography
              variant="body2"
              fontWeight={isRead ? 400 : 600}
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: "text.primary",
              }}
              title={Message}
            >
              {Message}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mt={0.5}
            >
              {Timestamp}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
