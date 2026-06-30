import { useState } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

import { NotificationsPage } from "./pages/NotificationsPage";
import { PriorityNotificationsPage } from "./pages/PriorityNotificationsPage";

export default function App() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      <CssBaseline />

      {/* ── App Bar ──────────────────────────────────────────── */}
      <AppBar position="sticky" elevation={1}>
        <Toolbar sx={{ minHeight: { xs: 56 } }}>
          <NotificationsActiveIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
            Campus Notifications
          </Typography>
        </Toolbar>

        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{ px: 2, "& .MuiTab-root": { textTransform: "none", fontWeight: 500 } }}
        >
          <Tab id="tab-all-notifications" label="All Notifications" />
          <Tab id="tab-priority-inbox" label="Priority Inbox" />
        </Tabs>
      </AppBar>

      {/* ── Page Content ─────────────────────────────────────── */}
      <Box
        component="main"
        sx={{
          maxWidth: 760,
          mx: "auto",
          px: { xs: 2, md: 3 },
          py: { xs: 2.5, md: 4 },
        }}
      >
        {activeTab === 0 && <NotificationsPage />}
        {activeTab === 1 && <PriorityNotificationsPage />}
      </Box>
    </>
  );
}