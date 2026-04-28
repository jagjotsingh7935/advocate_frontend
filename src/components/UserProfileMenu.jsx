import React, { memo, useEffect } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  Avatar,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Translate as TranslateIcon, // Import Translate icon for Google Translate
} from "@mui/icons-material";
import useMyContext from "../usercontext/useMyContext";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import { useNavigate } from "react-router-dom";

const UserProfileMenu = memo(({ anchorEl, open, onClose, username, onLogout, state }) => {
  const { theme, updatetheme } = useMyContext();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  // Google Translate initialization
  useEffect(() => {
    if (document.getElementById("google-translate-script")) return;

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(script);

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi,pa,bn,gu,ta,te,mr,ml",
          layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
        },
        "google_translate_element_menu"
      );
    };

    return () => {
      // Optional cleanup to remove global callback
      delete window.googleTranslateElementInit;
    };
  }, []);

  const handleRoute = () => {
    if (state === "client") {
      navigate("/client/profile");
      onClose();
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      onClick={(e) => e.stopPropagation()}
      disableScrollLock={true}
      PaperProps={{
        elevation: 8,
        sx: {
          overflow: "visible",
          filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
          mt: isMobile ? 1 : 1.5,
          width: isMobile ? "90vw" : 240,
          maxWidth: "100%",
          borderRadius: 2,
          backgroundColor: theme === "dark" ? "#1F1F1F" : "white",
          "& .MuiAvatar-root": {
            width: { xs: 28, sm: 32 },
            height: { xs: 28, sm: 32 },
            ml: -0.5,
            mr: 1,
          },
          "&:before": {
            content: '""',
            display: isMobile ? "none" : "block",
            position: "absolute",
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: theme === "dark" ? "#1F1F1F" : "#4a5fa5",
            transform: "translateY(-50%) rotate(45deg)",
            zIndex: 0,
          },
        },
      }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      <MenuItem sx={{ px: { xs: 1.5, sm: 2 }, py: { xs: 1, sm: 1.5 } }}>
        <Avatar sx={{ bgcolor: "#3B82F6", mr: { xs: 1, sm: 2 } }}>
          <AccountCircleIcon fontSize={isMobile ? "small" : "medium"} />
        </Avatar>
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: theme === "dark" ? "white" : "#1e293b",
              fontSize: { xs: "0.85rem", sm: "0.9rem" },
            }}
          >
            {username || "User"}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: theme === "dark" ? "#94a3b8" : "#64748b",
              fontSize: { xs: "0.7rem", sm: "0.75rem" },
            }}
          >
            {state}
          </Typography>
        </Box>
      </MenuItem>
      {state === "client" && (
        <MenuItem onClick={handleRoute} sx={{ px: { xs: 1.5, sm: 2 }, py: { xs: 1, sm: 1 } }}>
          <ListItemIcon>
            <AccountBoxIcon
              sx={{ color: theme === "dark" ? "white" : "black" }}
              fontSize={isMobile ? "small" : "medium"}
            />
          </ListItemIcon>
          <Typography sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" }, color: theme === "dark" ? "white" : "black" }}>
            Client Profile
          </Typography>
        </MenuItem>
      )}
      <MenuItem
        onClick={(e) => {
          e.stopPropagation();
          updatetheme(theme === "dark" ? "light" : "dark");
        }}
        sx={{ px: { xs: 1.5, sm: 2 }, py: { xs: 1, sm: 1 } }}
      >
        <ListItemIcon>
          {theme === "dark" ? (
            <LightModeIcon sx={{ color: "white" }} fontSize={isMobile ? "small" : "medium"} />
          ) : (
            <DarkModeIcon fontSize={isMobile ? "small" : "medium"} />
          )}
        </ListItemIcon>
        <FormControlLabel
          control={
            <Switch
              checked={theme === "dark"}
              onChange={(e) => {
                e.stopPropagation();
                updatetheme(theme === "dark" ? "light" : "dark");
              }}
              size="small"
              sx={{ ml: "auto" }}
            />
          }
          label={theme === "dark" ? "Dark Mode" : "Light Mode"}
          sx={{
            color: theme === "dark" ? "white" : "black",
            margin: 0,
            width: "100%",
            justifyContent: "space-between",
            "& .MuiFormControlLabel-label": {
              flex: 1,
              fontSize: { xs: "0.85rem", sm: "0.9rem" },
            },
          }}
        />
      </MenuItem>
      <MenuItem onClick={onClose} sx={{ px: { xs: 1.5, sm: 2 }, py: { xs: 1, sm: 1 } }}>
        <ListItemIcon>
          <SettingsIcon
            sx={{ color: theme === "dark" ? "white" : "black" }}
            fontSize={isMobile ? "small" : "medium"}
          />
        </ListItemIcon>
        <Typography sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" }, color: theme === "dark" ? "white" : "black" }}>
          Settings
        </Typography>
      </MenuItem>
      <MenuItem
        onClick={() => {
          onLogout();
          onClose();
        }}
        sx={{
          px: { xs: 1.5, sm: 2 },
          py: { xs: 1, sm: 1 },
          color: "#ef4444",
        }}
      >
        <ListItemIcon>
          <LogoutIcon fontSize={isMobile ? "small" : "medium"} sx={{ color: "#ef4444" }} />
        </ListItemIcon>
        <Typography sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" } }}>Logout</Typography>
      </MenuItem>
    </Menu>
  );
});

export default UserProfileMenu;