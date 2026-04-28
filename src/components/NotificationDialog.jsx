import React, { memo } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from "@mui/material";

const NotificationDialog = memo(({ open, onClose, notification }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
    sx={{
      "& .MuiDialog-paper": {
        borderRadius: 2,
        backgroundColor: "#fff",
        p: 2,
      },
    }}
  >
    <DialogTitle sx={{ fontWeight: 600, color: "#1e293b" }}>
      {notification?.title || "Notification"}
    </DialogTitle>
    <DialogContent>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography
  variant="body1"
  sx={{ color: "#64748b" }}
  dangerouslySetInnerHTML={{
    __html: notification?.message || "No message available",
  }}
/>

        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
          {notification?.time || "No time available"}
        </Typography>
        {notification?.images && notification.images.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
            {notification.images.map((image, index) => (
              <img
                key={index}
                src={image.image}
                alt={`Notification image ${index + 1}`}
                style={{
                  maxWidth: "150px",
                  maxHeight: "150px",
                  borderRadius: "8px",
                  objectFit: "cover",
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} sx={{ color: "#3B82F6" }}>
        Close
      </Button>
    </DialogActions>
  </Dialog>
));

export default NotificationDialog;