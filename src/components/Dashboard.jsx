import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Card,
  CardHeader, 
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  TrendingUp,
  People,
  Assignment,
  AttachMoney,
  Notifications,
  Settings,
  MoreVert,
  CheckCircle,
  Schedule,
  Warning,
  Star,
  Timeline,
  Assessment,
  Edit,
  Delete,
  Visibility
} from '@mui/icons-material';
import Sidebar from './Sidebar';
import dashboard from '../assets/dashboard.svg';
import { ShowMemberApi, ShowUnverifiedMemberApi } from '../api/Api';
import useMyContext from '../usercontext/useMyContext';
import AddMemberDialog from './AddMemberDialog';

const Dashboard = () => {
  const username = sessionStorage.getItem('username') || 'Unknown';
  const userId = sessionStorage.getItem('user_id') || 'Unknown';
  const [verifiedMembers, setVerifiedMembers] = useState([]);
  const [unverifiedMembers, setUnverifiedMembers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0); // 0 for Verified, 1 for Unverified
  const { state, theme } = useMyContext();
  
  // Responsive breakpoints
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.between('md', 'lg'));
  const isSmallMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const handleAddMemberDialogOpen = () => {
    setAddMemberDialogOpen(true);
  };

  const handleAddMemberDialogClose = () => {
    setAddMemberDialogOpen(false);
  };

  // Sample data for cards
  const stats = [
    { title: 'Total Revenue', value: '$45,231', change: '+12%', icon: AttachMoney, color: '#4caf50' },
    { title: 'Active Users', value: '1,234', change: '+5%', icon: People, color: '#2196f3' },
    { title: 'Completed Tasks', value: '89', change: '+23%', icon: Assignment, color: '#ff9800' },
    { title: 'Growth Rate', value: '8.5%', change: '+2.1%', icon: TrendingUp, color: '#9c27b0' }
  ];

  const ShowMembers = async () => {
    try {
      const response = await ShowMemberApi();
      console.log('verified response', response?.members);
      if (response?.members) {
        setVerifiedMembers(response.members);
      }
    } catch (error) {
      console.error('Error fetching verified members:', error);
    }
  };

  const ShowUnverifiedMembers = async () => {
    try {
      const response = await ShowUnverifiedMemberApi();
      console.log('unverified response', response?.client_member);
      if (response?.client_member) {
        setUnverifiedMembers(response.client_member);
      }
    } catch (error) {
      console.error('Error fetching unverified members:', error);
    }
  };

  useEffect(() => {
    ShowMembers();
    ShowUnverifiedMembers();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0); // Reset page when switching tabs
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getNumberTypes = (numberTypes) => {
    return numberTypes.map(nt => `${nt.type}: ${nt.number}`).join(', ');
  };

  const renderMemberTable = (members, memberKey) => (
    <TableContainer sx={{ 
      overflowX: 'auto',
      '& .MuiTable-root': {
        minWidth: isMobile ? '800px' : 'auto'
      }
    }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ 
              fontWeight: 'bold', 
              color: theme === 'dark' ? 'white' : '#012345',
              fontSize: isSmallMobile ? '0.75rem' : '0.875rem',
              padding: isSmallMobile ? '8px 4px' : '16px'
            }}>
              Avatar
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 'bold', 
              color: theme === 'dark' ? 'white' : '#012345',
              fontSize: isSmallMobile ? '0.75rem' : '0.875rem',
              padding: isSmallMobile ? '8px 4px' : '16px'
            }}>
              Full Name
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 'bold', 
              color: theme === 'dark' ? 'white' : '#012345',
              fontSize: isSmallMobile ? '0.75rem' : '0.875rem',
              padding: isSmallMobile ? '8px 4px' : '16px'
            }}>
              Relation
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 'bold', 
              color: theme === 'dark' ? 'white' : '#012345',
              fontSize: isSmallMobile ? '0.75rem' : '0.875rem',
              padding: isSmallMobile ? '8px 4px' : '16px',
              display: isSmallMobile ? 'none' : 'table-cell'
            }}>
              Email
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 'bold', 
              color: theme === 'dark' ? 'white' : '#012345',
              fontSize: isSmallMobile ? '0.75rem' : '0.875rem',
              padding: isSmallMobile ? '8px 4px' : '16px'
            }}>
              Phone
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 'bold', 
              color: theme === 'dark' ? 'white' : '#012345',
              fontSize: isSmallMobile ? '0.75rem' : '0.875rem',
              padding: isSmallMobile ? '8px 4px' : '16px',
              display: isMobile ? 'none' : 'table-cell'
            }}>
              PAN
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 'bold', 
              color: theme === 'dark' ? 'white' : '#012345',
              fontSize: isSmallMobile ? '0.75rem' : '0.875rem',
              padding: isSmallMobile ? '8px 4px' : '16px',
              display: isMobile ? 'none' : 'table-cell'
            }}>
              DOB
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 'bold', 
              color: theme === 'dark' ? 'white' : '#012345',
              fontSize: isSmallMobile ? '0.75rem' : '0.875rem',
              padding: isSmallMobile ? '8px 4px' : '16px',
              display: isMobile ? 'none' : 'table-cell'
            }}>
              Number Types
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 'bold', 
              color: theme === 'dark' ? 'white' : '#012345',
              fontSize: isSmallMobile ? '0.75rem' : '0.875rem',
              padding: isSmallMobile ? '8px 4px' : '16px'
            }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((member) => (
              <TableRow 
                key={member[memberKey]} 
                sx={{ '&:hover': { bgcolor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5' } }}
              >
                <TableCell sx={{ padding: isSmallMobile ? '8px 4px' : '16px' }}>
                  <Avatar 
                    src={member.avatar_image} 
                    sx={{ 
                      width: isSmallMobile ? 32 : 40, 
                      height: isSmallMobile ? 32 : 40 
                    }}
                  >
                    {member.member_name ? member.member_name.charAt(0).toUpperCase() : member.full_name.charAt(0).toUpperCase()}
                  </Avatar>
                </TableCell>
                <TableCell sx={{ padding: isSmallMobile ? '8px 4px' : '16px' }}>
                  <Typography variant="body2" sx={{ 
                    fontWeight: '500',
                    color: theme === 'dark' ? 'white' : '#012345',
                    fontSize: isSmallMobile ? '0.75rem' : '0.875rem'
                  }}>
                    {member.member_name || member.full_name}
                  </Typography>
                </TableCell>
                <TableCell sx={{ padding: isSmallMobile ? '8px 4px' : '16px' }}>
                  <Chip 
                    label={member.relation_with_client || member.relation} 
                    size="small" 
                    sx={{ 
                      bgcolor: '#e3f2fd', 
                      color: 'black',
                      fontSize: isSmallMobile ? '0.65rem' : '0.75rem',
                      height: isSmallMobile ? '20px' : '24px'
                    }}
                  />
                </TableCell>
                <TableCell sx={{ 
                  padding: isSmallMobile ? '8px 4px' : '16px',
                  display: isSmallMobile ? 'none' : 'table-cell'
                }}>
                  <Typography variant="body2" sx={{ 
                    color: theme === 'dark' ? 'white' : '#012345',
                    fontSize: isSmallMobile ? '0.75rem' : '0.875rem'
                  }}>
                    {member.member_email || member.email}
                  </Typography>
                </TableCell>
                <TableCell sx={{ padding: isSmallMobile ? '8px 4px' : '16px' }}>
                  <Typography variant="body2" sx={{
                    color: theme === 'dark' ? 'white' : '#012345',
                    fontSize: isSmallMobile ? '0.75rem' : '0.875rem'
                  }}>
                    {member.phone_number}
                  </Typography>
                </TableCell>
                <TableCell sx={{ 
                  padding: isSmallMobile ? '8px 4px' : '16px',
                  display: isMobile ? 'none' : 'table-cell'
                }}>
                  <Typography variant="body2" sx={{ 
                    // fontFamily: 'monospace',
                    color: theme === 'dark' ? 'white' : '#012345',
                    fontSize: isSmallMobile ? '0.75rem' : '0.875rem'
                  }}>
                    {member.member_pan || member.pan}
                  </Typography>
                </TableCell>
                <TableCell sx={{ 
                  padding: isSmallMobile ? '8px 4px' : '16px',
                  display: isMobile ? 'none' : 'table-cell'
                }}>
                  <Typography variant="body2" sx={{
                    color: theme === 'dark' ? 'white' : '#012345',
                    fontSize: isSmallMobile ? '0.75rem' : '0.875rem'
                  }}>
                    {formatDate(member.dob)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ 
                  padding: isSmallMobile ? '8px 4px' : '16px',
                  display: isMobile ? 'none' : 'table-cell'
                }}>
                  <Typography variant="body2" sx={{ 
                    fontSize: '0.75rem',
                    color: theme === 'dark' ? 'white' : '#012345' 
                  }}>
                    {getNumberTypes(member.number_type)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ padding: isSmallMobile ? '8px 4px' : '16px' }}>
                  <Box display="flex" gap={isSmallMobile ? 0.5 : 1}>
                    <IconButton 
                      size={isSmallMobile ? "small" : "medium"} 
                      sx={{ color: '#1976d2' }}
                      title="View Details"
                    >
                      <Visibility fontSize={isSmallMobile ? "small" : "medium"} />
                    </IconButton>
                    <IconButton 
                      size={isSmallMobile ? "small" : "medium"} 
                      sx={{ color: '#ff9800' }}
                      title="Edit Member"
                    >
                      <Edit fontSize={isSmallMobile ? "small" : "medium"} />
                    </IconButton>
                    <IconButton 
                      size={isSmallMobile ? "small" : "medium"} 
                      sx={{ color: '#f44336' }}
                      title="Delete Member"
                    >
                      <Delete fontSize={isSmallMobile ? "small" : "medium"} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          {members.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No members found
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <>
      <Container sx={{ 
        mt: 3,
        mb:{xs:10,md:0}, 
        bgcolor: '#c7d4ffff', 
        p: { xs: 2, sm: 3 }, 
        borderRadius: 2, 
        flexGrow: 1, 
        width: { xs: '100%', sm: '98%', md: '93%' },
        maxWidth: 'none'
      }}>
        <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ flexGrow: 1 }}>
          <Grid item xs={12} md={6}>
            <Typography 
              variant={isSmallMobile ? "h5" : "h4"} 
              sx={{ 
                color: '#012345', 
                fontWeight: 'bold',
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
              }} 
              gutterBottom
            >
              Dashboard
            </Typography>
            <Paper sx={{ 
              p: { xs: 2, sm: 3 }, 
              mb: { xs: 2, sm: 3 }, 
              bgcolor: '#ffff', 
              borderRadius: 2, 
              boxShadow: 'none' 
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#012345',
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                Welcome, {username}!
              </Typography>
            </Paper>
            <Paper sx={{ 
              p: { xs: 2, sm: 3 }, 
              bgcolor: '#ffff', 
              borderRadius: 2, 
              boxShadow: 'none' 
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#012345',
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                Quick Overview
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#012345',
                  fontSize: { xs: '0.875rem', sm: '0.9rem' }
                }}
              >
                Monitor your key metrics and manage your projects efficiently from this central hub.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            width: {xs:'100%',md:'30%'},
            p: { xs: 2, sm: 3, md: 5 }
          }}>
            <Box
              component="img"
              src={dashboard}
              alt="Dashboard Illustration"
              sx={{
                width: '100%',
                maxWidth: { xs: '250px', sm: '300px', md: '100%' },
                height: 'auto',
                objectFit: 'contain'
              }}
            />
          </Grid>
        </Grid>
      </Container>

      {state === 'client' && (
        <Container sx={{ 
          mt: 3, 
          width: '100%',
          maxWidth: 'none',
          px: { xs: 1, sm: 2, md: 3 },
        mb:{xs:10,md:0}, 

        }}>
          <Paper sx={{ 
            p: { xs: 2, sm: 3 }, 
            bgcolor: theme === "dark" ? "black" : "white", 
            borderRadius: 2, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
          }}>
            <Box 
              display="flex" 
              flexDirection={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between" 
              alignItems={{ xs: 'flex-start', sm: 'center' }} 
              mb={2}
              gap={{ xs: 2, sm: 0 }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  color: theme === 'dark' ? 'white' : '#012345', 
                  fontWeight: 'bold',
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                Members {tabValue === 0 ? `(Verified: ${verifiedMembers.length})` : `(Unverified: ${unverifiedMembers.length})`}
              </Typography>
              <Button 
                variant="contained" 
                size={isSmallMobile ? "small" : "medium"}
                sx={{ 
                  bgcolor: '#768bd0ff', 
                  '&:hover': { bgcolor: '#42538aff' },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  width: { xs: '100%', sm: 'auto' }
                }}
                startIcon={<People />}
                onClick={handleAddMemberDialogOpen}
              >
                Add Member
              </Button>
            </Box>

            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              sx={{ 
                mb: 2,
                '& .MuiTab-root': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  minWidth: { xs: '120px', sm: '160px' },
                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'inherit'
                },
                '& .MuiTab-root.Mui-selected': {
                  color: theme === 'dark' ? 'white' : '#1976d2'
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: theme === 'dark' ? 'white' : '#1976d2'
                }
              }}
              variant={isSmallMobile ? "fullWidth" : "standard"}
            >
              <Tab label="Verified Members" />
              <Tab label="Unverified Members" />
            </Tabs>

            {tabValue === 0 && renderMemberTable(verifiedMembers, 'client_member_id')}
            {tabValue === 1 && renderMemberTable(unverifiedMembers, 'member_id')}

            {(tabValue === 0 ? verifiedMembers.length : unverifiedMembers.length) > 0 && (
              <TablePagination
                component="div"
                count={tabValue === 0 ? verifiedMembers.length : unverifiedMembers.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                sx={{ 
                  borderTop: '1px solid #e0e0e0', 
                  mt: 2,
                  '& .MuiTablePagination-toolbar': {
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 0 }
                  },
                  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }
                }}
              />
            )}
          </Paper>
        </Container>
      )}

      <AddMemberDialog open={addMemberDialogOpen} onClose={handleAddMemberDialogClose} />
    </>
  );
};

export default Dashboard;