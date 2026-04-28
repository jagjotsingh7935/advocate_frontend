import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  useTheme, 
  useMediaQuery, 
  Drawer, 
  SwipeableDrawer, 
  Box, 
  CssBaseline,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Paper,
  Fade,
  Typography
} from "@mui/material";
import { SidebarCountForDocs } from "../api/Api";
import useMyContext from "../usercontext/useMyContext";
import MainAppBar from "./MainAppBar";
import DrawerContent from "./DrawerContent";
import DescriptionIcon from '@mui/icons-material/Description';
import {
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Message as MessageIcon,
  ListAlt as ListAltIcon,
  Info as InfoIcon,
  People as PeopleIcon,
  GetApp as GetAppIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  PersonAdd as PersonAddIcon,
  ExpandMore as ExpandMoreIcon,
  MoreHoriz as MoreHorizIcon,
  ArrowBack as ArrowBackIcon
} from "@mui/icons-material";
import HowToRegIcon from '@mui/icons-material/HowToReg';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ChatIcon from '@mui/icons-material/Chat';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import KeyIcon from '@mui/icons-material/Key';
import AccessAlarmsIcon from '@mui/icons-material/AccessAlarms';
import SendIcon from '@mui/icons-material/Send';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ContactsIcon from '@mui/icons-material/Contacts';
import AddAlarmIcon from '@mui/icons-material/AddAlarm';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

// Constants
const DRAWER_WIDTH = 280;
const DRAWER_COLLAPSED_WIDTH = 70;
const BOTTOM_TAB_HEIGHT = 76;
const TOP_SUBMENU_HEIGHT = 56;

// Top Submenu Component - Scrollable horizontal tabs
const TopSubmenuTabs = ({ 
  submenuItems, 
  isActive, 
  handleItemClick, 
  theme,
  onBack,
  parentTitle 
}) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    const item = submenuItems[newValue];
    handleItemClick(item.path)();
  };

  // Find active tab index based on current path
  useEffect(() => {
    const currentPath = window.location.pathname;
    let activeIndex = 0;
    
    submenuItems.forEach((item, index) => {
      if (item.path && isActive(item.path)) {
        activeIndex = index;
      }
    });
    
    setSelectedTab(activeIndex);
  }, [submenuItems, isActive]);

  return (
    <Fade in={true} timeout={300}>
      <Paper
        elevation={2}
        sx={{
          position: 'fixed',
          top: { xs: 56, sm: 64, md: 64 }, // Below main app bar
          left: 0,
          right: 0,
          zIndex: 999,
          backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
          borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
          borderRadius: 0,
        }}
      >
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile={false}
          sx={{
            height: TOP_SUBMENU_HEIGHT,
            minHeight: TOP_SUBMENU_HEIGHT,
            '& .MuiTabs-flexContainer': {
              height: '100%',
              alignItems: 'center',
              gap: 0.5,
            },
            '& .MuiTab-root': {
              minWidth: 120,
              maxWidth: 180,
              minHeight: TOP_SUBMENU_HEIGHT - 8,
              height: TOP_SUBMENU_HEIGHT - 8,
              fontSize: '0.85rem',
              fontWeight: 500,
              color: theme === 'dark' ? '#ccc' : '#666',
              textTransform: 'none',
              padding: '8px 16px',
              margin: '0 4px',
              borderRadius: '8px',
              transition: 'all 0.2s ease-in-out',
              '&.Mui-selected': {
                color: theme === 'dark' ? '#fff' : '#1976d2',
                backgroundColor: theme === 'dark' ? '#333' : '#e3f2fd',
                fontWeight: 600,
              },
              '&:hover': {
                backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f5f5f5',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: theme === 'dark' ? '#fff' : '#1976d2',
              height: 3,
              borderRadius: '1.5px',
            },
            '& .MuiTabs-scroller': {
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            },
          }}
        >
          {submenuItems.map((item, index) => (
            <Tab
              key={index}
              icon={
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                }}>
                  {React.cloneElement(item.icon, { 
                    sx: { 
                      fontSize: 18,
                      color: selectedTab === index ? item.color : 'inherit',
                    } 
                  })}
                </Box>
              }
              label={item.text}
              iconPosition="start"
              sx={{
                '& .MuiTab-iconWrapper': {
                  marginRight: '6px',
                  marginBottom: 0,
                },
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
            />
          ))}
        </Tabs>
      </Paper>
    </Fade>
  );
};

// Mobile Tab Component
// Mobile Tab Component - Updated with boxed icons and text below (Scrollable)
const MobileTabNavigation = ({ 
  menuItems, 
  isActive, 
  handleItemClick, 
  theme,
  documentCount,
  onSubmenuSelect 
}) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabClick = (index) => {
    setSelectedTab(index);
    const item = menuItems[index];
    
    if (item.submenu && item.submenu.length > 0) {
      // Show submenu in top tabs
      onSubmenuSelect(item);
      // Automatically navigate to first submenu item
      const firstSubmenuItem = item.submenu[0];
      if (firstSubmenuItem.path) {
        handleItemClick(firstSubmenuItem.path)();
      }
    } else {
      handleItemClick(item.path)();
    }
  };

  // Find active tab index based on current path
  useEffect(() => {
    const currentPath = window.location.pathname;
    let activeIndex = 0;
    
    menuItems.forEach((item, index) => {
      if (item.path && isActive(item.path)) {
        activeIndex = index;
      } else if (item.submenu) {
        item.submenu.forEach(subItem => {
          if (subItem.path && isActive(subItem.path)) {
            activeIndex = index;
          }
        });
      }
    });
    
    setSelectedTab(activeIndex);
  }, [menuItems, isActive]);

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: theme === 'dark' ? '#000000' : '#fff',
        borderTop: `1px solid ${theme === 'dark' ? '#cdd3e8ff' : '#e0e0e0'}`,
        borderRadius: '16px 16px 0 0',
        height: BOTTOM_TAB_HEIGHT + 20, // Slightly increased height for better spacing
        padding: '8px 0',
      }}
    >
      {/* Scrollable Tab Content */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          px: 2,
          gap: 2,
          // Hide scrollbar while keeping functionality
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          // Smooth scrolling
          scrollBehavior: 'smooth',
        }}
      >
        {menuItems.map((item, index) => {
          const isSelected = selectedTab === index;
          
          return (
            <Box
              key={index}
              onClick={() => handleTabClick(index)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                minWidth: '80px', // Minimum width to ensure consistency
                height: '100%',
                transition: 'all 0.2s ease-in-out',
                transform: isSelected ? 'translateY(-2px)' : 'none',
                '&:hover': {
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {/* Icon Box */}
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  backgroundColor: isSelected ? 
                    item.color || (theme === 'dark' ? '#333' : '#e3f2fd') : 
                    (theme === 'dark' ? '#2a2a2a' : '#f5f5f5'),
                  boxShadow: isSelected ? 
                    '0 4px 12px rgba(0,0,0,0.15)' : 
                    '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease-in-out',
                  mb: 1,
                }}
              >
                {React.cloneElement(item.icon, { 
                  sx: { 
                    fontSize: 24, 
                    color: isSelected ? '#fff' : (theme === 'dark' ? '#ccc' : '#666'),
                  } 
                })}
                
                {/* Submenu Indicator */}
                {item.submenu && (
                  <ExpandMoreIcon 
                    sx={{ 
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      fontSize: 16,
                      backgroundColor: theme === 'dark' ? '#444' : '#fff',
                      borderRadius: '50%',
                      color: theme === 'dark' ? '#ccc' : '#666',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} 
                  />
                )}
                
                {/* Document Count Badge */}
                {item.text === "Documents By Admin" && documentCount > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      minWidth: 20,
                      height: 20,
                      borderRadius: '10px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      boxShadow: '0 2px 4px rgba(244, 67, 54, 0.3)',
                    }}
                  >
                    {documentCount}
                  </Box>
                )}
              </Box>

              {/* Text Label */}
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: isSelected ? 600 : 500,
                  color: isSelected ? 
                    (item.color || (theme === 'dark' ? '#fff' : '#1976d2')) : 
                    (theme === 'dark' ? '#ccc' : '#666'),
                  textAlign: 'center',
                  maxWidth: '80px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease-in-out',
                  textTransform: 'none',
                }}
              >
                {item.text}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};
// Also update the main Sidebar component's handleSubmenuSelect function
const Sidebar = ({ children, onLogout }) => {
  const theme2 = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme2.breakpoints.down("md"), { noSsr: true });
  const [drawerOpen, setDrawerOpen] = useState(isMobile ? false : true);
  const [selectedTab, setSelectedTab] = useState("");
  const { state, updateAuthMe, authme, theme } = useMyContext();
  const [documentCount, setDocumentCount] = useState(0);
  const [openSubmenu, setOpenSubmenu] = useState({});
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  const fetchCount = async () => {
    try {
      const res = await SidebarCountForDocs();
      setDocumentCount(res.count || 0);
    } catch (error) {
      console.error("Error fetching document count:", error);
      setDocumentCount(0);
    }
  };

  useEffect(() => {
    fetchCount();
  }, []);

  const menuItems = useMemo(() => {
    const allItems = [
      { icon: <DashboardIcon />, text: "Dashboard", path: "/dashboard", color: "#4a6ad1ff" },
      { icon: <InfoIcon />, text: "News", path: "/news/show", color: "#4a6ad1ff" },
      { icon: <ManageAccountsIcon />, text: "Staff List", path: "/admin/list", color: "#4a6ad1ff" },
      {
        icon: <PeopleIcon />,
        text: "Clients",
        color: "#4a6ad1ff",
        submenu: [
          { icon: <PeopleIcon />, text: "Client List", path: "/clientlist", color: "#4a6ad1ff" },
          { icon: <ContactsIcon />, text: "Temp Client List", path: "/tempclientlist", color: "#4a6ad1ff" },
          { icon: <HowToRegIcon />, text: "Client Registration", path: "/client/registration/admin", color: "#4a6ad1ff" },
          { icon: <RemoveCircleOutlineIcon />, text: "Unverified Clients", path: "/unverified", color: "#4a6ad1ff" },
        ],
      },
      {
        icon: <SendIcon />,
        text: "Messages",
        color: "#4a6ad1ff",
        submenu: [
          { icon: <SendIcon />, text: "Whatsapp Message", path: "/whatsapptemplate", color: "#4a6ad1ff" },
          { icon: <DateRangeIcon />, text: "Scheduler", path: "/scheduler", color: "#4a6ad1ff" },
          { icon: <AddAlarmIcon />, text: "Temp Scheduler", path: "/tempscheduler", color: "#4a6ad1ff" },
        ],
      },
      { icon: <DescriptionIcon />, text: "Excel", path: "/generate-template", color: "#4a6ad1ff" },
      { icon: <GetAppIcon />, text: "Guides", path: "/guide", color: "#4a6ad1ff" },
      { icon: <ChatIcon />, text: "Documents", path: "/admin/documents", color: "#4a6ad1ff" },
      { icon: <DocumentScannerIcon />, text: "Upload", path: "/user-upload-document", color: "#4a6ad1ff" },
      { icon: <HistoryEduIcon />, text: "User Docs", path: "/user-document", color: "#4a6ad1ff" },
      { icon: <AccessAlarmsIcon />, text: "Tax Alert", path: "/tax/reminder/message", color: "#4a6ad1ff" },
      { icon: <KeyIcon />, text: "Permissions", path: "/permissions", color: "#4a6ad1ff" },
    ];

    if (state === "client") {
      return allItems.filter((item) =>
        ["Dashboard", "Upload", "Documents","User Docs"].includes(item.text)
      );
    } else if (state === "staff") {
      return allItems.filter((item) =>
        [
          "Dashboard",
          "News",
          "Staff List",
          "Clients",
          "Guides",
          "Messages",
          "Tax Alert",
          "Permissions",
        ].includes(item.text)
      );
    }
    return allItems;
  }, [state]);

  const isActive = useCallback(
    (path) => selectedTab === path || window.location.pathname.startsWith(path),
    [selectedTab]
  );

  const handleItemClick = useCallback(
    (path) => () => {
      if (path) {
        setSelectedTab(path);
        navigate(path);
        if (isMobile) setDrawerOpen(false);
      }
    },
    [navigate, isMobile]
  );

  const handleSubmenuToggle = useCallback((text) => {
    setOpenSubmenu((prev) => ({
      ...prev,
      [text]: !prev[text],
    }));
  }, []);

  const handleDrawerToggle = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  const handleSubmenuSelect = useCallback((item) => {
    setActiveSubmenu(item);
  }, []);

  const handleBackToMain = useCallback(() => {
    setActiveSubmenu(null);
  }, []);

  const handleLogout = useCallback(() => {
    console.log("Logout clicked");
    if (onLogout) {
      onLogout();
    } else {
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("refresh_token");
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("user_id");
      updateAuthMe(null);
      navigate("/login");
    }
  }, [onLogout, navigate, updateAuthMe]);

  useEffect(() => {
    setDrawerOpen(isMobile ? false : true);
  }, [isMobile]);

  useEffect(() => {
    setSelectedTab(window.location.pathname);
  }, []);

  // Check if current path belongs to any submenu
  useEffect(() => {
    const currentPath = window.location.pathname;
    let foundSubmenu = null;
    
    menuItems.forEach(item => {
      if (item.submenu) {
        item.submenu.forEach(subItem => {
          if (subItem.path && currentPath.startsWith(subItem.path)) {
            foundSubmenu = item;
          }
        });
      }
    });
    
    setActiveSubmenu(foundSubmenu);
  }, [menuItems, selectedTab]);

  const drawerWidth = drawerOpen ? DRAWER_WIDTH : DRAWER_COLLAPSED_WIDTH;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: theme === 'dark' ? '#0D0C0F' : 'white' }}>
      <CssBaseline />
      <MainAppBar
        drawerOpen={drawerOpen}
        drawerWidth={isMobile ? 0 : drawerWidth} // No drawer width in mobile
        username={authme?.username}
        onLogout={handleLogout}
        state={state}
        handleDrawerToggle={handleDrawerToggle}
      />
      
      {/* Mobile Top Submenu Tabs */}
      {isMobile && activeSubmenu && (
        <TopSubmenuTabs
          submenuItems={activeSubmenu.submenu}
          isActive={isActive}
          handleItemClick={handleItemClick}
          theme={theme}
          onBack={handleBackToMain}
          parentTitle={activeSubmenu.text}
        />
      )}
      
      {/* Mobile Bottom Tab Navigation */}
      {isMobile && (
        <MobileTabNavigation
          menuItems={menuItems}
          isActive={isActive}
          handleItemClick={handleItemClick}
          theme={theme}
          documentCount={documentCount}
          onSubmenuSelect={handleSubmenuSelect}
        />
      )}

      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              overflow: "auto",
              borderRight: "none",
              background: theme === "dark" ? "#0D0C0F" : "white",
              transition: theme2.transitions.create("width", {
                easing: theme2.transitions.easing.sharp,
                duration: theme2.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          <DrawerContent
            drawerOpen={drawerOpen}
            isMobile={isMobile}
            menuItems={menuItems}
            isActive={isActive}
            handleItemClick={handleItemClick}
            handleDrawerToggle={handleDrawerToggle}
            drawerWidth={drawerWidth}
            documentCount={documentCount}
            authme={authme}
            state={state}
            openSubmenu={openSubmenu}
            handleSubmenuToggle={handleSubmenuToggle}
          />
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          backgroundColor: theme === "dark" ? "#0D0C0F" : "white",
          flexGrow: 1,
          transition: theme2.transitions.create(["margin", "width"], {
            easing: theme2.transitions.easing.easeOut,
            duration: theme2.transitions.duration.enteringScreen,
          }),
          width: {
            xs: "100%",
            md: `calc(100% - ${drawerWidth}px)`,
          },
          mt: 5,
          marginLeft: {
            xs: 0,
          },
          paddingTop: {
            xs: activeSubmenu ? `${64 + TOP_SUBMENU_HEIGHT + 24}px` : 16, // Extra padding when submenu is active
            sm: activeSubmenu ? `${64 + TOP_SUBMENU_HEIGHT + 24}px` : 18,
            md: 10,
          },
          paddingBottom: {
            xs: `${BOTTOM_TAB_HEIGHT + 16}px`, // Add padding bottom for mobile bottom tabs
            sm: `${BOTTOM_TAB_HEIGHT + 16}px`,
            md: 4,
          },
          padding: {
            xs: 2,
            sm: 3,
            md: 4,
          },
          boxSizing: "border-box",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
export default Sidebar;