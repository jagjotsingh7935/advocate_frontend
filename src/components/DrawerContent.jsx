import React from "react";
import { Box, List, Typography, Avatar, IconButton, Tooltip, alpha, Collapse } from "@mui/material";
import { ChevronLeft as ChevronLeftIcon, MenuOpen as MenuOpenIcon, ArrowRight as ArrowRightIcon, ArrowDropDown as ArrowDropDownIcon } from "@mui/icons-material";
import NavItem from "./NavItem";
import useMyContext from "../usercontext/useMyContext";

const DrawerContent = ({
  drawerOpen,
  isMobile,
  menuItems,
  isActive,
  handleItemClick,
  handleDrawerToggle,
  drawerWidth,
  documentCount,
  authme,
  state,
  openSubmenu,
  handleSubmenuToggle,
}) => {
  const { theme } = useMyContext();

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: theme === "dark" ? "#0D0C0F" : "#fff",
        width: isMobile ? 280 : drawerWidth,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: drawerOpen ? "space-between" : "center",
          px: drawerOpen ? { xs: 1, sm: 1.5 } : 1,
          py: 1,
          background: theme === "dark" ? "#0D0C0F" : "#fff",
          position: "relative",
        }}
      >
        {drawerOpen ? (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, p: 1 }}>
              <Box
                sx={{
                  flex: 1,
                  borderRadius: 3,
                  padding: 3,
                  display: "flex",
                  mt: 1,
                  alignItems: "center",
                  gap: 2,
                  maxHeight: 50,
                  maxWidth: 300,
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: "#abbefdff",
                  }}
                >
                  {authme?.username?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    noWrap
                    sx={{
                      fontWeight: "bold",
                      color: theme === "dark" ? "white" : "black",
                      fontSize: "1.5rem",
                      lineHeight: 1.2,
                    }}
                  >
                    {state}
                  </Typography>
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{
                      fontWeight: 500,
                      color: "#666",
                      fontSize: "0.6rem",
                      lineHeight: 1.2,
                      mb: 0.5,
                    }}
                  >
                    {authme?.username}
                  </Typography>
                </Box>
              </Box>
            </Box>
            {!isMobile && (
              <Tooltip title="Collapse menu" arrow placement="right">
                <IconButton
                  onClick={handleDrawerToggle}
                  size="small"
                  sx={{
                    color: "white",
                    backgroundColor: alpha("#0c1e3eff", 0.15),
                    "&:hover": { backgroundColor: alpha("#0c1e3eff", 0.25) },
                    transition: "all 0.2s ease",
                    width: 32,
                    height: 32,
                  }}
                >
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            {!isMobile && (
              <Tooltip title="Expand menu" arrow placement="right">
                <IconButton
                  onClick={handleDrawerToggle}
                  size="small"
                  sx={{
                    color: "white",
                    backgroundColor: alpha("#0c1e3eff", 0.15),
                    "&:hover": { backgroundColor: alpha("#0c1e3eff", 0.25) },
                    transition: "all 0.2s ease",
                    width: 30,
                    height: 30,
                    mt: 0.5,
                  }}
                >
                  <MenuOpenIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>
      <List
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 1,
          py: 2,
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: alpha("#fff", 0.2),
            borderRadius: 3,
          },
          "&::-webkit-scrollbar-track": { backgroundColor: alpha("#fff", 0.05) },
        }}
      >
        {menuItems.map((item) => (
          <Box key={item.text}>
            {item.submenu ? (
              <>
                <NavItem
                  item={{ ...item, rightIcon: openSubmenu[item.text] ? <ArrowDropDownIcon /> : <ArrowRightIcon /> }}
                  open={drawerOpen || isMobile}
                  isActive={item.submenu.some((subItem) => isActive(subItem.path))}
                  handleItemClick={() => handleSubmenuToggle(item.text)}
                  badgeCount={0}
                />
                <Collapse in={openSubmenu[item.text]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.submenu.map((subItem) => (
                      <NavItem
                        key={subItem.text}
                        item={subItem}
                        open={drawerOpen || isMobile}
                        isActive={isActive(subItem.path)}
                        handleItemClick={handleItemClick(subItem.path)}
                        badgeCount={0}
                        sx={{ pl: 4 }}
                      />
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <NavItem
                item={item}
                open={drawerOpen || isMobile}
                isActive={isActive(item.path)}
                handleItemClick={handleItemClick(item.path)}
                badgeCount={item.text === "User Fetch Documents" ? documentCount : 0}
              />
            )}
          </Box>
        ))}
      </List>
    </Box>
  );
};

export default DrawerContent;