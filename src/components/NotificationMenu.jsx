import React, { memo } from "react";
import { Menu, MenuItem, Box, Typography, Avatar, alpha } from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";

const NotificationsMenu = memo(({ anchorEl, open, onClose, notifications = [], onNotificationClick, state }) => (
  <Menu
    anchorEl={anchorEl}
    open={open}
    onClose={onClose}
    PaperProps={{
      elevation: 8,
      sx: {
        overflow: "visible",
        filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
        mt: 1.5,
        minWidth: 320,
        maxWidth: 400,
        maxHeight: 400,
        borderRadius: 2,
        "&:before": {
          content: '""',
          display: "block",
          position: "absolute",
          top: 0,
          right: 24,
          width: 10,
          height: 10,
          bgcolor: "#4a5fa5",
          transform: "translateY(-50%) rotate(45deg)",
          zIndex: 0,
        },
      },
    }}
    transformOrigin={{ horizontal: "right", vertical: "top" }}
    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
  >
    <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #e2e8f0" }}>
      <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
        Notifications
      </Typography>
    </Box>
    <Box sx={{ maxHeight: 280, overflowY: "auto" }}>
      {notifications.length === 0 ? (
        <MenuItem sx={{ px: 2, py: 3, textAlign: "center" }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <NotificationsIcon sx={{ fontSize: 32, color: "#94a3b8" }} />
            <Typography variant="body2" color="#64748b">
              No new notifications
            </Typography>
          </Box>
        </MenuItem>
      ) : (
        notifications.map((notification, index) => (
          <MenuItem
            key={index}
            onClick={() => onNotificationClick(notification)}
            sx={{ px: 2, py: 1.5, alignItems: "flex-start" }}
          >
            <Box sx={{ display: "flex", gap: 1.5, width: "100%" }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor:
                    notification.type === "error"
                      ? "#ef4444"
                      : notification.type === "warning"
                      ? "#f59e0b"
                      : "#3b82f6",
                  fontSize: "0.875rem",
                }}
              >
                {notification.type === "error" ? "!" : notification.type === "warning" ? "⚠" : "i"}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                  {notification.title}
                </Typography>
                {/* <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.875rem" }}>
                  {notification.message}
                </Typography> */}
                <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                  {notification.time}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))
      )}
    </Box>
  </Menu>
));

export default NotificationsMenu;