import React, { memo } from "react";
import { ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip, Badge, alpha, Zoom } from "@mui/material";

const commonStyles = {
  listItemButton: {
    minHeight: 48,
    borderRadius: "8px",
    px: 2.5,
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: alpha("#6aaecdff", 0.2),
      transform: "translateX(2px)",
    },
  },
  listItemIcon: (isActive, open) => ({
    minWidth: 0,
    mr: open ? 2 : "auto",
    justifyContent: "center",
    color: isActive ? "#6281e9ff" : alpha("#a9c0cb", 0.9),
    transition: "transform 0.2s",
    transform: isActive ? "scale(1.1)" : "scale(1)",
    fontSize: "1.2rem",
  }),
  listItemText: (isActive) => ({
    fontWeight: isActive ? 700 : 500,
    variant: "body2",
    color: isActive ? "#6281e9ff" : alpha("#7c8d95ff", 0.95),
    fontSize: "0.8rem",
    letterSpacing: "0.015em",
    noWrap: true,
  }),
  rightIcon: (isActive) => ({
    minWidth: 0,
    justifyContent: "flex-end",
    color: isActive ? "#6281e9ff" : alpha("#a9c0cb", 0.9),
    fontSize: "1.2rem",
  }),
};

const NavItem = memo(({ item, open, isActive, handleItemClick, badgeCount, sx }) => (
  <ListItem disablePadding sx={{ display: "block", mb: { xs: 0.5, sm: 1 }, ...sx }}>
    <Tooltip title={!open ? item.text : ""} placement="right" arrow TransitionComponent={Zoom} enterDelay={500}>
      <ListItemButton
        onClick={handleItemClick}
        selected={isActive}
        sx={{
          ...commonStyles.listItemButton,
          backgroundColor: isActive ? "#3B82F6" : "transparent",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <ListItemIcon sx={commonStyles.listItemIcon(isActive, open)}>
          {item.text === "User Fetch Documents" ? (
            <Badge badgeContent={badgeCount} color="error">
              {item.icon}
            </Badge>
          ) : (
            item.icon
          )}
        </ListItemIcon>
        {open && (
          <ListItemText
            primary={item.text}
            primaryTypographyProps={commonStyles.listItemText(isActive)}
          />
        )}
        {open && item.rightIcon && (
          <ListItemIcon sx={commonStyles.rightIcon(isActive)}>
            {item.rightIcon}
          </ListItemIcon>
        )}
      </ListItemButton>
    </Tooltip>
  </ListItem>
));

export default NavItem;