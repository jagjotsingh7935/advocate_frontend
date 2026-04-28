import React, { useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Button,
  Typography,
  Divider,
  Chip,
  Alert,
  Collapse,
  IconButton,
  Tooltip,
  Switch,
  Paper,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  Tabs,
  Tab,
  Grid,
  ButtonGroup,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  Share as ShareIcon,
  FileDownload as ExportIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  People as StaffIcon,
  Business as ClientIcon,
  SupervisorAccount as SuperAdminIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import useMyContext from '../usercontext/useMyContext';

export default function RoleBasedPermissions() {
  const muiTheme = useTheme();
  const isXs = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isSm = useMediaQuery(muiTheme.breakpoints.down('md'));
  const isMd = useMediaQuery(muiTheme.breakpoints.down('lg'));
  
  const {theme}=useMyContext()
  const [activeRole, setActiveRole] = useState('client');
  const [permissions, setPermissions] = useState({
    client: {
      can_view_client: true,
      create_client: true,
      update_client: true,
      can_delete_client: true,
      can_view_whatsappmessage: true,
      can_view_newsmodel: true,
      can_view_uploadeddocuments: true,
      create_uploadeddocuments: true,
      update_uploadeddocuments: true,
      can_delete_uploadeddocuments: true
    },
    staff: {
      can_view_client: false,
      create_client: false,
      update_client: false,
      can_delete_client: false,
      can_view_whatsappmessage: false,
      can_view_newsmodel: false,
      can_view_uploadeddocuments: false,
      create_uploadeddocuments: false,
      update_uploadeddocuments: false,
      can_delete_uploadeddocuments: false
    },
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [userInfo] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Team Member'
  });

  // Define theme-based colors
  const themeColors = {
    textPrimary: theme === 'dark' ? 'white' : '#1e293b',
    textSecondary: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
    background: theme === 'dark' ? '#0D0C0F' : 'white',
    border: theme === 'dark' ? '#3b82f6' : '#e0e0e0',
    chipBg: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.02)',
    hoverBg: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.08)',
    primary: '#3b82f6',
    primaryHover: theme === 'dark' ? '#60a5fa' : '#2563eb',
    secondary: theme === 'dark' ? '#a855f7' : '#9333ea',
    secondaryHover: theme === 'dark' ? '#c084fc' : '#7e22ce',
    error: '#ef4444',
    errorBg: theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.08)',
    warning: '#f59e0b',
    success: '#10b981',
    info: '#3b82f6',
    disabled: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
    paperBg: theme === 'dark' ? '#1a1a1a' : 'grey.50',
  };

  const roleConfig = {
    staff: {
      label: 'Staff Members',
      is_client: false,
      icon: <StaffIcon sx={{ color: themeColors.textPrimary }} />,
      color: 'primary',
      description: 'Internal team members and employees',
      defaultPermissions: ['can_view_client', 'create_client', 'update_client'],
      restrictedPermissions: ['can_delete_client', 'can_delete_uploadeddocuments']
    },
    client: {
      label: 'Client Manager',
      is_client: true,
      icon: <ClientIcon sx={{ color: themeColors.textPrimary }} />,
      color: 'secondary',
      description: 'External clients and customers',
      defaultPermissions: [
        'can_view_client',
        'create_client',
        'update_client',
        'can_delete_client',
        'can_view_whatsappmessage',
        'can_view_newsmodel',
        'can_view_uploadeddocuments',
        'create_uploadeddocuments',
        'update_uploadeddocuments',
        'can_delete_uploadeddocuments'
      ],
      restrictedPermissions: []
    },
  };

  const handleRoleChange = (event, newRole) => {
    setActiveRole(newRole);
  };

  const handlePermissionChange = (permission) => (event) => {
    const isChecked = event.target.checked;
    const currentPermissions = permissions[activeRole];

    if (permission === 'create_client' && isChecked) {
      setPermissions(prev => ({
        ...prev,
        [activeRole]: { ...prev[activeRole], can_view_client: true, create_client: true }
      }));
    } else if (permission === 'update_client' && isChecked) {
      setPermissions(prev => ({
        ...prev,
        [activeRole]: { ...prev[activeRole], can_view_client: true, update_client: true }
      }));
    } else if (permission === 'can_delete_client' && isChecked) {
      setPermissions(prev => ({
        ...prev,
        [activeRole]: { ...prev[activeRole], can_view_client: true, can_delete_client: true }
      }));
    } else if (permission === 'create_uploadeddocuments' && isChecked) {
      setPermissions(prev => ({
        ...prev,
        [activeRole]: { ...prev[activeRole], can_view_uploadeddocuments: true, create_uploadeddocuments: true }
      }));
    } else if (permission === 'update_uploadeddocuments' && isChecked) {
      setPermissions(prev => ({
        ...prev,
        [activeRole]: { ...prev[activeRole], can_view_uploadeddocuments: true, update_uploadeddocuments: true }
      }));
    } else if (permission === 'can_delete_uploadeddocuments' && isChecked) {
      setPermissions(prev => ({
        ...prev,
        [activeRole]: { ...prev[activeRole], can_view_uploadeddocuments: true, can_delete_uploadeddocuments: true }
      }));
    } else if (permission === 'can_view_client' && !isChecked) {
      setPermissions(prev => ({
        ...prev,
        [activeRole]: {
          ...prev[activeRole],
          can_view_client: false,
          create_client: false,
          update_client: false,
          can_delete_client: false
        }
      }));
    } else if (permission === 'can_view_uploadeddocuments' && !isChecked) {
      setPermissions(prev => ({
        ...prev,
        [activeRole]: {
          ...prev[activeRole],
          can_view_uploadeddocuments: false,
          create_uploadeddocuments: false,
          update_uploadeddocuments: false,
          can_delete_uploadeddocuments: false
        }
      }));
    } else {
      setPermissions(prev => ({
        ...prev,
        [activeRole]: {
          ...prev[activeRole],
          [permission]: isChecked
        }
      }));
    }
  };

  const applyDefaultPermissions = (role) => {
    const defaults = roleConfig[role].defaultPermissions;
    const newPermissions = {
      can_view_client: false,
      create_client: false,
      update_client: false,
      can_delete_client: false,
      can_view_whatsappmessage: false,
      can_view_newsmodel: false,
      can_view_uploadeddocuments: false,
      create_uploadeddocuments: false,
      update_uploadeddocuments: false,
      can_delete_uploadeddocuments: false
    };

    defaults.forEach(perm => {
      newPermissions[perm] = true;
    });

    setPermissions(prev => ({
      ...prev,
      [role]: newPermissions
    }));

    setSnackbar({
      open: true,
      message: `Default permissions applied for ${roleConfig[role].label}`,
      severity: 'info'
    });
  };

  const copyPermissionsFrom = (sourceRole) => {
    setPermissions(prev => ({
      ...prev,
      [activeRole]: { ...prev[sourceRole] }
    }));

    setSnackbar({
      open: true,
      message: `Permissions copied from ${roleConfig[sourceRole].label} to ${roleConfig[activeRole].label}`,
      severity: 'info'
    });
  };

  const handleGivePermissions = () => {
    const selectedPermissions = Object.entries(permissions[activeRole])
      .filter(([_, value]) => value)
      .map(([key, _]) => key);

    if (selectedPermissions.includes('can_delete_client') || selectedPermissions.includes('can_delete_uploadeddocuments')) {
      setConfirmDialog(true);
    } else {
      applyPermissions();
    }
  };

  const applyPermissions = async () => {
    const selectedPermissions = Object.entries(permissions[activeRole])
      .filter(([_, value]) => value)
      .map(([key, _]) => key);

    const payload = {
      name: roleConfig[activeRole].label,
      is_client: roleConfig[activeRole].is_client,
      permissions: selectedPermissions
    };

    try {
      // Simulated API call
      console.log(`Permissions granted for ${activeRole}:`, payload);
      setSnackbar({
        open: true,
        message: `${roleConfig[activeRole].label} permissions successfully granted: ${selectedPermissions.join(', ') || 'None'}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error submitting permissions:', error);
      setSnackbar({
        open: true,
        message: `Failed to grant permissions for ${roleConfig[activeRole].label}: ${error.message}`,
        severity: 'error'
      });
    }

    setConfirmDialog(false);
  };

  const resetPermissions = (role = activeRole) => {
    setPermissions(prev => ({
      ...prev,
      [role]: {
        can_view_client: false,
        create_client: false,
        update_client: false,
        can_delete_client: false,
        can_view_whatsappmessage: false,
        can_view_newsmodel: false,
        can_view_uploadeddocuments: false,
        create_uploadeddocuments: false,
        update_uploadeddocuments: false,
        can_delete_uploadeddocuments: false
      }
    }));
    setSnackbar({
      open: true,
      message: `All ${roleConfig[role].label.toLowerCase()} permissions have been reset`,
      severity: 'info'
    });
  };

  const resetAllRoles = () => {
    setPermissions({
      staff: {
        can_view_client: false,
        create_client: false,
        update_client: false,
        can_delete_client: false,
        can_view_whatsappmessage: false,
        can_view_newsmodel: false,
        can_view_uploadeddocuments: false,
        create_uploadeddocuments: false,
        update_uploadeddocuments: false,
        can_delete_uploadeddocuments: false
      },
      client: {
        can_view_client: false,
        create_client: false,
        update_client: false,
        can_delete_client: false,
        can_view_whatsappmessage: false,
        can_view_newsmodel: false,
        can_view_uploadeddocuments: false,
        create_uploadeddocuments: false,
        update_uploadeddocuments: false,
        can_delete_uploadeddocuments: false
      }
    });
    setSnackbar({
      open: true,
      message: 'All permissions for all roles have been reset',
      severity: 'warning'
    });
  };

  const permissionConfig = {
    can_view_client: {
      label: 'View Clients',
      description: 'View client information',
      icon: <VisibilityIcon sx={{ color: themeColors.textPrimary }} />,
      color: 'primary',
      risk: 'low'
    },
    create_client: {
      label: 'Create Clients',
      description: 'Create new client records',
      icon: <EditIcon sx={{ color: themeColors.textPrimary }} />,
      color: 'info',
      risk: 'medium'
    },
    update_client: {
      label: 'Update Clients',
      description: 'Modify existing client records',
      icon: <EditIcon sx={{ color: themeColors.textPrimary }} />,
      color: 'info',
      risk: 'medium'
    },
    can_delete_client: {
      label: 'Delete Clients',
      description: 'Remove client records',
      icon: <DeleteIcon sx={{ color: themeColors.textPrimary }} />,
      color: 'warning',
      risk: 'high'
    },
    can_view_whatsappmessage: {
      label: 'View WhatsApp Messages',
      description: 'View WhatsApp communications',
      icon: <VisibilityIcon sx={{ color: themeColors.textPrimary }} />,
      color: 'primary',
      risk: 'low'
    },
    can_view_newsmodel: {
      label: 'View News',
      description: 'View news content',
      icon: <VisibilityIcon sx={{ color: themeColors.textPrimary }} />,
      color: 'primary',
      risk: 'low'
    },
    can_view_uploadeddocuments: {
      label: 'View Documents',
      description: 'View uploaded documents',
      icon: <VisibilityIcon sx={{ color: themeColors.textPrimary }} />,
      color: 'primary',
      risk: 'low'
    },
    create_uploadeddocuments: {
      label: 'Create Documents',
      description: 'Upload new documents',
      icon: <EditIcon sx={{ color: themeColors.textPrimary }} />,
      color: 'info',
      risk: 'medium'
    },
    update_uploadeddocuments: {
      label: 'Update Documents',
      description: 'Modify existing documents',
      icon: <EditIcon sx={{ color: themeColors.textPrimary }} />,
      color: 'info',
      risk: 'medium'
    },
    can_delete_uploadeddocuments: {
      label: 'Delete Documents',
      description: 'Remove uploaded documents',
      icon: <DeleteIcon sx={{ color: themeColors.textPrimary }} />,
      color: 'warning',
      risk: 'high'
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const isPermissionRestricted = (permission) => {
    return roleConfig[activeRole].restrictedPermissions.includes(permission);
  };

  const selectedCount = Object.values(permissions[activeRole]).filter(Boolean).length;
  const hasHighRiskPermissions = permissions[activeRole].can_delete_client || permissions[activeRole].can_delete_uploadeddocuments;
  const totalPermissionsAcrossRoles = Object.values(permissions).reduce((total, rolePerms) => 
    total + Object.values(rolePerms).filter(Boolean).length, 0
  );

  return (
    <Box sx={{ 
      maxWidth: 900, 
      margin: 'auto', 
      padding: { xs: 1, sm: 2 }, 
      mb:{xs:10,md:0},
      bgcolor: themeColors.background 
    }}>
      <Card elevation={4} sx={{ 
        borderRadius: 2, 
        bgcolor: themeColors.background, 
        border: 1, 
        borderColor: themeColors.border 
      }}>
        <CardHeader
          avatar={
            <Avatar sx={{ 
              bgcolor: themeColors.primary, 
              color: themeColors.textPrimary,
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 }
            }}>
              <SecurityIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </Avatar>
          }
          title={
            <Typography 
              variant={isXs ? "h6" : "h5"} 
              component="div" 
              fontWeight="bold" 
              sx={{ color: themeColors.textPrimary }}
            >
              Role-Based Permissions {!isXs && "Management"}
            </Typography>
          }
          subheader={
            <Typography 
              variant={isXs ? "caption" : "subtitle1"}
              sx={{ color: themeColors.textSecondary }}
            >
              Configure access levels for different user roles
            </Typography>
          }
          action={
            <Stack 
              direction={isXs ? "column" : "row"} 
              spacing={1}
              alignItems={isXs ? "flex-end" : "center"}
            >
              <Chip 
                label={`${totalPermissionsAcrossRoles} total`}
                color="info"
                variant="outlined"
                size="small"
                sx={{
                  fontSize: isXs ? '0.6rem' : '0.75rem',
                  color: themeColors.info,
                  borderColor: themeColors.info,
                  bgcolor: themeColors.chipBg,
                  '&:hover': { bgcolor: themeColors.hoverBg }
                }}
              />
              <Chip 
                label={`${selectedCount} selected`}
                color={selectedCount > 0 ? 'primary' : 'default'}
                variant="outlined"
                size="small"
                sx={{
                  fontSize: isXs ? '0.6rem' : '0.75rem',
                  color: selectedCount > 0 ? themeColors.primary : themeColors.disabled,
                  borderColor: selectedCount > 0 ? themeColors.primary : themeColors.disabled,
                  bgcolor: themeColors.chipBg,
                  '&:hover': { bgcolor: themeColors.hoverBg }
                }}
              />
            </Stack>
          }
          sx={{ pb: { xs: 1, sm: 2 } }}
        />
        
        <Divider sx={{ bgcolor: themeColors.border }} />
        
        <CardContent sx={{ px: { xs: 1, sm: 2 } }}>
          {/* Role Tabs */}
          <Paper sx={{ 
            mb: 3, 
            boxShadow: 'none', 
            bgcolor: themeColors.background, 
            border: 1, 
            borderColor: themeColors.border 
          }}>
            <Tabs 
              value={activeRole} 
              onChange={handleRoleChange}
              variant={isXs ? "fullWidth" : "fullWidth"}
              sx={{ borderBottom: 1, borderColor: themeColors.border }}
              orientation={isXs ? "horizontal" : "horizontal"}
            >
              {Object.entries(roleConfig).map(([key, config]) => (
                <Tab 
                  key={key}
                  value={key}
                  icon={React.cloneElement(config.icon, { 
                    sx: { fontSize: { xs: 16, sm: 20 } }
                  })}
                  label={
                    <Typography 
                      variant={isXs ? "caption" : "body2"}
                      sx={{ fontWeight: 'medium' }}
                    >
                      {isXs ? config.label.split(' ')[0] : config.label}
                    </Typography>
                  }
                  iconPosition="top"
                  sx={{ 
                    minHeight: { xs: 50, sm: 60 },
                    color: themeColors.textPrimary,
                    py: { xs: 0.5, sm: 1 },
                    '&.Mui-selected': {
                      color: `${config.color}.main`
                    },
                    '&:hover': {
                      bgcolor: themeColors.hoverBg
                    }
                  }}
                />
              ))}
            </Tabs>
          </Paper>

          {/* Role Description and Quick Actions */}
          <Paper elevation={1} sx={{ 
            p: { xs: 1.5, sm: 2 }, 
            mb: 3, 
            bgcolor: themeColors.paperBg, 
            border: 1, 
            borderColor: themeColors.border 
          }}>
            <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography 
                  variant={isXs ? "body2" : "body1"}
                  sx={{ color: themeColors.textSecondary }}
                >
                  {roleConfig[activeRole].description}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack 
                  direction={isXs ? "column" : "row"} 
                  spacing={1} 
                  justifyContent="flex-end" 
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Button
                    size={isXs ? "small" : "small"}
                    variant="outlined"
                    startIcon={<CheckIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                    onClick={() => applyDefaultPermissions(activeRole)}
                    fullWidth={isXs}
                    sx={{
                      fontSize: isXs ? '0.75rem' : '0.875rem',
                      color: themeColors.primary,
                      borderColor: themeColors.primary,
                      '&:hover': {
                        bgcolor: themeColors.hoverBg,
                        borderColor: themeColors.primaryHover
                      }
                    }}
                  >
                    Apply Defaults
                  </Button>
                  {!isXs && (
                    <ButtonGroup size="small" variant="outlined">
                      {Object.keys(roleConfig).filter(role => role !== activeRole).map(role => (
                        <Button
                          key={role}
                          startIcon={<CopyIcon sx={{ fontSize: 16 }} />}
                          onClick={() => copyPermissionsFrom(role)}
                          sx={{
                            fontSize: '0.75rem',
                            color: themeColors.secondary,
                            borderColor: themeColors.secondary,
                            '&:hover': {
                              bgcolor: themeColors.hoverBg,
                              borderColor: themeColors.secondaryHover
                            }
                          }}
                        >
                          Copy from {roleConfig[role].label.split(' ')[0]}
                        </Button>
                      ))}
                    </ButtonGroup>
                  )}
                  {/* Mobile copy buttons */}
                  {isXs && Object.keys(roleConfig).filter(role => role !== activeRole).map(role => (
                    <Button
                      key={role}
                      size="small"
                      variant="outlined"
                      startIcon={<CopyIcon sx={{ fontSize: 16 }} />}
                      onClick={() => copyPermissionsFrom(role)}
                      fullWidth
                      sx={{
                        fontSize: '0.75rem',
                        color: themeColors.secondary,
                        borderColor: themeColors.secondary,
                        '&:hover': {
                          bgcolor: themeColors.hoverBg,
                          borderColor: themeColors.secondaryHover
                        }
                      }}
                    >
                      Copy from {roleConfig[role].label}
                    </Button>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Risk Alert */}
          <Collapse in={hasHighRiskPermissions}>
            <Alert 
              severity="warning" 
              icon={<WarningIcon sx={{ color: themeColors.warning }} />}
              sx={{ 
                mb: 2, 
                bgcolor: theme === 'dark' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.08)',
                color: themeColors.textPrimary,
                fontSize: isXs ? '0.75rem' : '0.875rem'
              }}
            >
              <Typography 
                variant={isXs ? "caption" : "body2"} 
                sx={{ color: themeColors.textPrimary }}
              >
                You are granting high-risk permissions to {roleConfig[activeRole].label.toLowerCase()}. 
                Please review carefully before confirming.
              </Typography>
            </Alert>
          </Collapse>

          {/* Permissions List */}
          <List sx={{ px: 0 }}>
            {Object.entries(permissionConfig).map(([key, config]) => {
              const isRestricted = isPermissionRestricted(key);
              return (
                <ListItem 
                  key={key} 
                  divider 
                  sx={{ 
                    '&:hover': { bgcolor: themeColors.hoverBg },
                    bgcolor: themeColors.background,
                    px: { xs: 1, sm: 2 },
                    py: { xs: 1, sm: 1.5 }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: { xs: 32, sm: 56 } }}>
                    {React.cloneElement(config.icon, { 
                      color: permissions[activeRole][key] ? config.color : 'disabled',
                      sx: { 
                        color: permissions[activeRole][key] ? themeColors[config.color] : themeColors.disabled,
                        fontSize: { xs: 18, sm: 24 }
                      }
                    })}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                        <Typography 
                          variant={isXs ? "body2" : "body1"}
                          fontWeight="medium"
                          sx={{ 
                            opacity: isRestricted ? 0.5 : 1,
                            textDecoration: isRestricted ? 'line-through' : 'none',
                            color: themeColors.textPrimary
                          }}
                        >
                          {config.label}
                        </Typography>
                        <Chip 
                          label={config.risk}
                          size="small"
                          color={getRiskColor(config.risk)}
                          variant="outlined"
                          sx={{
                            fontSize: isXs ? '0.6rem' : '0.75rem',
                            height: isXs ? 16 : 20,
                            color: themeColors[getRiskColor(config.risk)],
                            borderColor: themeColors[getRiskColor(config.risk)],
                            bgcolor: themeColors.chipBg,
                            '&:hover': { bgcolor: themeColors.hoverBg }
                          }}
                        />
                        {isRestricted && (
                          <Tooltip title={`This permission is restricted for ${roleConfig[activeRole].label}`}>
                            <Chip 
                              label="Restricted"
                              size="small"
                              color="error"
                              variant="filled"
                              sx={{
                                fontSize: isXs ? '0.6rem' : '0.75rem',
                                height: isXs ? 16 : 20,
                                bgcolor: themeColors.error,
                                color: themeColors.textPrimary
                              }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography 
                        variant={isXs ? "caption" : "body2"}
                        sx={{ 
                          opacity: isRestricted ? 0.5 : 1,
                          color: themeColors.textSecondary 
                        }}
                      >
                        {config.description}
                        {isRestricted && ' (Not available for this role)'}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={permissions[activeRole][key]}
                      onChange={handlePermissionChange(key)}
                      color={config.color}
                      disabled={isRestricted}
                      size={isXs ? "small" : "medium"}
                      sx={{
                        '& .MuiSwitch-switchBase': {
                          color: themeColors.disabled,
                          '&.Mui-checked': {
                            color: themeColors[config.color]
                          },
                          '&.Mui-checked + .MuiSwitch-track': {
                            bgcolor: themeColors[config.color]
                          }
                        },
                        '& .MuiSwitch-track': {
                          bgcolor: themeColors.border
                        }
                      }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>

          {/* Selected Permissions Summary */}
          {selectedCount > 0 && (
            <Paper 
              elevation={1} 
              sx={{ 
                mt: 3, 
                p: { xs: 1.5, sm: 2 }, 
                bgcolor: theme === 'dark' ? '#0D0C0F' : `${roleConfig[activeRole].color}.50`,
                border: '1px solid',
                borderColor: theme === 'dark' ? `${roleConfig[activeRole].color}.700` : `${roleConfig[activeRole].color}.200`
              }}
            >
              <Typography 
                variant={isXs ? "caption" : "subtitle2"}
                gutterBottom 
                display="flex" 
                alignItems="center" 
                gap={1}
                sx={{ color: themeColors.textPrimary }}
              >
                <CheckIcon 
                  fontSize="small" 
                  sx={{ 
                    color: themeColors[roleConfig[activeRole].color],
                    fontSize: { xs: 16, sm: 20 }
                  }} 
                />
                Selected Permissions for {roleConfig[activeRole].label}
              </Typography>
              <Stack 
                direction="row" 
                spacing={1} 
                flexWrap="wrap" 
                useFlexGap
                sx={{ gap: { xs: 0.5, sm: 1 } }}
              >
                {Object.entries(permissions[activeRole])
                  .filter(([_, value]) => value)
                  .map(([key, _]) => (
                    <Chip
                      key={key}
                      label={isXs ? permissionConfig[key].label.split(' ')[0] : permissionConfig[key].label}
                      size="small"
                      color={theme==='dark'?'default':'primary' }
                      variant="filled"
                      icon={React.cloneElement(permissionConfig[key].icon, { 
                        fontSize: 'small',
                        sx: { fontSize: { xs: 12, sm: 16 } }
                      })}
                      sx={{
                        fontSize: isXs ? '0.6rem' : '0.75rem',
                        height: isXs ? 20 : 24,
                        bgcolor: themeColors[permissionConfig[key].color],
                        color: theme==='dark'?'black':'white',
                        '&:hover': { bgcolor: themeColors.hoverBg }
                      }}
                    />
                  ))}
              </Stack>
            </Paper>
          )}

          {/* Action Buttons */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            sx={{ mt: 4 }}
            justifyContent="center"
          >
            <Button
              variant="outlined"
              color="error"
              onClick={resetAllRoles}
              startIcon={<WarningIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
              size={isXs ? "small" : "medium"}
              fullWidth={isXs}
              sx={{
                fontSize: isXs ? '0.75rem' : '0.875rem',
                color: themeColors.error,
                borderColor: themeColors.error,
                '&:hover': {
                  bgcolor: themeColors.errorBg,
                  borderColor: themeColors.error
                }
              }}
            >
              Reset All Roles
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => resetPermissions()}
              disabled={selectedCount === 0}
              startIcon={<InfoIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
              size={isXs ? "small" : "medium"}
              fullWidth={isXs}
              sx={{
                fontSize: isXs ? '0.75rem' : '0.875rem',
                color: themeColors.secondary,
                borderColor: themeColors.secondary,
                '&:hover': {
                  bgcolor: themeColors.hoverBg,
                  borderColor: themeColors.secondaryHover
                },
                '&:disabled': {
                  color: themeColors.disabled,
                  borderColor: themeColors.disabled
                }
              }}
            >
              Reset {isXs ? 'Current' : roleConfig[activeRole].label}
            </Button>
            <Button
              variant="contained"
              color="primary"
              size={isXs ? "medium" : "large"}
              onClick={handleGivePermissions}
              disabled={selectedCount === 0}
              startIcon={<CheckIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
              fullWidth={isXs}
              sx={{
                minWidth: { xs: 'auto', sm: 250 },
                fontSize: isXs ? '0.875rem' : '1rem',
                py: { xs: 1, sm: 1.5 },
                bgcolor: themeColors.primary,
                color: theme==='dark'?'black':'white',
                '&:hover': {
                  bgcolor: themeColors.primaryHover
                },
                '&:disabled': {
                  bgcolor: themeColors.disabled,
                  color: themeColors.textPrimary
                }
              }}
            >
              Apply {isXs ? 'Permissions' : `${roleConfig[activeRole].label} Permissions`}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isXs}
        PaperProps={{
          sx: {
            bgcolor: themeColors.background,
            border: 1,
            borderColor: themeColors.border,
            borderRadius: isXs ? 0 : 2,
            m: isXs ? 0 : 2
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: themeColors.background, 
          color: themeColors.textPrimary,
          pb: isXs ? 1 : 2
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningIcon sx={{ 
              color: themeColors.warning,
              fontSize: { xs: 20, sm: 24 }
            }} />
            <Typography 
              variant={isXs ? "h6" : "h6"}
              component="span"
            >
              Confirm High-Risk Permissions
            </Typography>
          </Box>
          {isXs && (
            <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
              for {roleConfig[activeRole].label}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: themeColors.background, px: { xs: 2, sm: 3 } }}>
          <DialogContentText sx={{ 
            color: themeColors.textPrimary,
            fontSize: isXs ? '0.875rem' : '1rem'
          }}>
            You are about to grant high-risk permissions to {roleConfig[activeRole].label.toLowerCase()} 
            that could allow significant system access. Please confirm that you want to proceed.
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <Typography 
              variant={isXs ? "caption" : "subtitle2"}
              gutterBottom 
              sx={{ color: themeColors.textPrimary }}
            >
              Permissions to be granted to {roleConfig[activeRole].label}:
            </Typography>
            <Stack 
              direction="row" 
              spacing={1} 
              flexWrap="wrap" 
              useFlexGap
              sx={{ gap: { xs: 0.5, sm: 1 } }}
            >
              {Object.entries(permissions[activeRole])
                .filter(([_, value]) => value)
                .map(([key, _]) => (
                  <Chip
                    key={key}
                    label={isXs ? permissionConfig[key].label.split(' ')[0] : permissionConfig[key].label}
                    size="small"
                    color={permissionConfig[key].color}
                    variant="outlined"
                    sx={{
                      fontSize: isXs ? '0.6rem' : '0.75rem',
                      height: isXs ? 18 : 20,
                      color: themeColors[permissionConfig[key].color],
                      borderColor: themeColors[permissionConfig[key].color],
                      bgcolor: themeColors.chipBg,
                      '&:hover': { bgcolor: themeColors.hoverBg }
                    }}
                  />
                ))}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          bgcolor: themeColors.background, 
          borderTop: 1, 
          borderColor: themeColors.border,
          px: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 2 },
          flexDirection: isXs ? 'column' : 'row',
          gap: isXs ? 1 : 0
        }}>
          <Button 
            onClick={() => setConfirmDialog(false)} 
            sx={{ 
              color: themeColors.textSecondary,
              fontSize: isXs ? '0.875rem' : '1rem',
              order: isXs ? 2 : 1,
              width: isXs ? '100%' : 'auto'
            }}
            size={isXs ? "medium" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            onClick={applyPermissions} 
            variant="contained"
            size={isXs ? "medium" : "medium"}
            sx={{
              bgcolor: themeColors.warning,
              color: themeColors.textPrimary,
              fontSize: isXs ? '0.875rem' : '1rem',
              order: isXs ? 1 : 2,
              width: isXs ? '100%' : 'auto',
              '&:hover': { bgcolor: theme === 'dark' ? '#fbbf24' : '#d97706' }
            }}
          >
            Confirm & Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Info Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ 
          vertical: 'bottom', 
          horizontal: isXs ? 'center' : 'left' 
        }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          sx={{
            bgcolor: themeColors[snackbar.severity],
            color: themeColors.textPrimary,
            fontSize: isXs ? '0.875rem' : '1rem',
            maxWidth: isXs ? '90vw' : 'auto'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}