import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Typography,
  Avatar,
  Badge,
  Tooltip,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Menu as MenuIcon, Notifications as NotificationsIcon, PersonAdd as PersonAddIcon } from "@mui/icons-material";
import useMyContext from "../usercontext/useMyContext";
import { getNews } from "../api/Api";
import AddMemberDialog from "./AddMemberDialog";
import NotificationsMenu from "./NotificationMenu";
import UserProfileMenu from "./UserProfileMenu";
import NotificationDialog from "./NotificationDialog";

const MainAppBar = ({ drawerOpen, drawerWidth, username, onLogout, state, handleDrawerToggle }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [newsNotifications, setNewsNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const theme2=useTheme()
  const { authme,theme } = useMyContext();
  const menuOpen = Boolean(anchorEl);
  const notificationMenuOpen = Boolean(notificationAnchorEl);
  const isMobile = useMediaQuery(theme2.breakpoints.down("md"), { noSsr: true });

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getNews();
        const formattedNotifications = data.map((newsItem) => ({
          title: newsItem.title,
          message: newsItem.description,
          time: new Date(newsItem.created_at).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: "info",
          images: newsItem.image,
        }));
        setNewsNotifications(formattedNotifications);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNews();
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleAddMemberDialogOpen = () => {
    setAddMemberDialogOpen(true);
  };

  const handleAddMemberDialogClose = () => {
    setAddMemberDialogOpen(false);
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setDialogOpen(true);
    handleNotificationMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedNotification(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    onLogout();
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={2}
        sx={{
          display: { xs: "block", md: "none" },
          background:theme ==="dark" ? "#0D0C0F": "white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: 1.5 }}>
         
         {!isMobile && (
 <IconButton
            color="inherit"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{
              marginRight: 1.5,
              color: "#abbefd",
              transition: "transform 0.2s ease",
            }}
          >
            <MenuIcon />
          </IconButton>
         )}
          {/* <IconButton
            color="inherit"
            edge="start"
            sx={{
              marginRight: 1.5,
              color: "#abbefd",
              transition: "transform 0.2s ease",
            }}
          >
            <MenuIcon />
          </IconButton> */}
          <Typography
            variant="h6"
            noWrap
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              letterSpacing: "0.02em",
              color: "#7897fbff",
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
            }}
          >
            Admin Panel
          </Typography>
          <Tooltip title="Notifications" arrow>
                  <IconButton
                    onClick={handleNotificationMenuOpen}
                    size="small"
                    sx={{
                      color: "#64748b",
                      mr:1,
                      "&:hover": {
                        backgroundColor: alpha("#3B82F6", 0.1),
                        color: "#3B82F6",
                      
                      },
                    }}
                  >
                    <Badge badgeContent={newsNotifications.length} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
          <Tooltip title="User Menu" arrow>
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{
                  padding: 0.5,
                  backgroundColor: alpha("#3B82F6", 0.1),
                  "&:hover": {
                    backgroundColor: alpha("#3B82F6", 0.2),
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: "#3B82F6",
                    fontSize: "1rem",
                    fontWeight: 600,
                  }}
                >
                  {authme?.username?.charAt(0)?.toUpperCase() || "A"}
                </Avatar>
              </IconButton>
            </Tooltip>
        </Toolbar>
      </AppBar>
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          display: { xs: "none", md: "block" },
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          backgroundColor:theme ==="dark" ? "#0D0C0F": "white",
          color: "#1e293b",
          borderBottom:1,
          borderColor:theme ==="dark" ? "#6281e9": "white",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: (theme) =>
            theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: 3 }}>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {state === "client" && (
              <>
                <Tooltip title="Add Members" arrow>
                  <IconButton
                    onClick={handleAddMemberDialogOpen}
                    size="small"
                    sx={{
                      color: "#64748b",
                      "&:hover": {
                        backgroundColor: alpha("#3B82F6", 0.1),
                        color: "#3B82F6",
                      },
                    }}
                  >
                    <PersonAddIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Notifications" arrow>
                  <IconButton
                    onClick={handleNotificationMenuOpen}
                    size="small"
                    sx={{
                      color: "#64748b",
                      "&:hover": {
                        backgroundColor: alpha("#3B82F6", 0.1),
                        color: "#3B82F6",
                      },
                    }}
                  >
                    <Badge badgeContent={newsNotifications.length} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </>
            )}
            <Tooltip title="User Menu" arrow>
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{
                  padding: 0.5,
                  backgroundColor: alpha("#3B82F6", 0.1),
                  "&:hover": {
                    backgroundColor: alpha("#3B82F6", 0.2),
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: "#3B82F6",
                    fontSize: "1rem",
                    fontWeight: 600,
                  }}
                >
                  {authme?.username?.charAt(0)?.toUpperCase() || "A"}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      <AddMemberDialog open={addMemberDialogOpen} onClose={handleAddMemberDialogClose} />
      <NotificationsMenu
        anchorEl={notificationAnchorEl}
        open={notificationMenuOpen}
        onClose={handleNotificationMenuClose}
        notifications={newsNotifications}
        onNotificationClick={handleNotificationClick}
        state={state}
      />
      <UserProfileMenu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        username={authme?.username}
        onLogout={handleLogout}
        state={state}
      />
      <NotificationDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        notification={selectedNotification}
      />
    </>
  );
};

export default MainAppBar;