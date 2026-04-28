import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  TextField,
  Pagination,
  InputAdornment,
  Tabs,
  Tab,
  Checkbox,
  Button,
  Snackbar,
  useMediaQuery,
  useTheme,
  Stack,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { 
  Person as PersonIcon, 
  AdminPanelSettings as AdminIcon, 
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { ConvertToPermanentAPI, TempallgetClient, TempgetClient, TempgetClientTab } from '../api/Api';
import Sidebar from './Sidebar';
import debounce from 'lodash/debounce';
import useMyContext from '../usercontext/useMyContext';

const TempClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState('all');
  const [tabTypes, setTabTypes] = useState(['all']);
  const [selectedClients, setSelectedClients] = useState(new Set());
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [convertLoading, setConvertLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const { theme } = useMyContext();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down('lg'));
  const isSmallScreen = useMediaQuery(muiTheme.breakpoints.down('sm'));

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      setSearchQuery(query);
    }, 500),
    []
  );

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const data = await TempgetClientTab();
        if (data) {
          setError(null);
          const types = ['all', ...new Set(data?.map(item => item.type))];
          setTabTypes(types);
          setClients(data);
          setTotalPages(data.num_pages || 1);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch client list. Please try again.');
        showSnackbar('Failed to fetch client list. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const fetchClientsByType = async () => {
    try {
      setLoading(true);
      let data;
      if (tabValue === 'all') {
        data = await TempallgetClient(page, searchQuery);
      } else {
        data = await TempgetClient(tabValue, page, searchQuery);
      }
      setClients(data.results || []);
      setTotalPages(data.num_pages || 1);
      setError(null);
    } catch (err) {
      console.error(err);
      const errorMessage = 'Failed to fetch clients. Please try again.';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientsByType();
  }, [tabValue, page, searchQuery]);

  useEffect(() => {
    if (clients && clients.length > 0) {
      const allSelected = clients.every(client => selectedClients.has(client.id));
      setIsSelectAll(allSelected);
    }
  }, [selectedClients, clients]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1);
    setSelectedClients(new Set());
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    setSelectedClients(new Set());
  };

  const handleSearchChange = (event) => {
    debouncedSearch(event.target.value);
    setPage(1);
  };

  const handleClientSelect = (clientId) => {
    const newSelected = new Set(selectedClients);
    if (newSelected.has(clientId)) {
      newSelected.delete(clientId);
    } else {
      newSelected.add(clientId);
    }
    setSelectedClients(newSelected);
  };

  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedClients(new Set());
    } else {
      const allClientIds = new Set(clients.map(client => client.id));
      setSelectedClients(allClientIds);
    }
    setIsSelectAll(!isSelectAll);
  };

  const handleConvertToPermanent = async () => {
    if (selectedClients.size === 0) {
      showSnackbar('Please select at least one client to convert.', 'warning');
      return;
    }

    try {
      setConvertLoading(true);
      setError(null);
      const selectedIds = Array.from(selectedClients);
      const payload = { temp_client_ids: selectedIds };
      const response = await ConvertToPermanentAPI(payload);
      
      if (response) {
        showSnackbar(`Successfully converted ${selectedIds.length} client(s) to permanent.`, 'success');
        setSelectedClients(new Set());
        fetchClientsByType();
      }
    } catch (err) {
      console.error('Error converting clients:', err);
      const errorMessage = 'Failed to convert clients to permanent. Please try again.';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setConvertLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    const names = name.split(' ');
    return names.slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  const formatEmail = (email) => {
    return email || 'N/A';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Mobile Card Component
  const ClientCard = ({ client }) => (
    <Card 
      sx={{ 
        mb: 2, 
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9ff',
        border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
        '&:hover': {
          backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f0f2ff',
        },
        transition: 'background-color 0.2s ease',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Checkbox
            checked={selectedClients.has(client.id)}
            onChange={() => handleClientSelect(client.id)}
            sx={{
              color: '#4a5fa5',
              '&.Mui-checked': {
                color: '#4a5fa5',
              },
              mt: -0.5,
              mr: 1
            }}
          />
          <Avatar 
            sx={{ 
              bgcolor: '#4a5fa5', 
              width: 50, 
              height: 50,
              fontSize: '1.1rem',
              mr: 2
            }}
            src={client.avatar_image}
          >
            {getInitials(client.name)}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme === 'dark' ? 'white' : 'black',
                fontSize: '1.1rem',
                fontWeight: 600,
                wordBreak: 'break-word'
              }}
            >
              {client.name || 'N/A'}
            </Typography>
            <Chip 
              label={client.number_type} 
              size="small"
              sx={{ 
                bgcolor: '#4a5fa5', 
                color: 'white',
                fontSize: '0.75rem',
                height: 24,
                mt: 0.5
              }} 
            />
          </Box>
        </Box>
        
        <Divider sx={{ mb: 2, bgcolor: theme === 'dark' ? '#333' : '#e0e0e0' }} />
        
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon sx={{ color: '#4a5fa5', fontSize: 20 }} />
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme === 'dark' ? '#ccc' : '#666',
                wordBreak: 'break-all',
                fontSize: '0.9rem'
              }}
            >
              {formatEmail(client.email)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneIcon sx={{ color: '#4a5fa5', fontSize: 20 }} />
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme === 'dark' ? '#ccc' : '#666',
                fontSize: '0.9rem'
              }}
            >
              {client.phone || 'N/A'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon sx={{ color: '#4a5fa5', fontSize: 20 }} />
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme === 'dark' ? '#ccc' : '#666',
                fontSize: '0.9rem'
              }}
            >
              {formatDate(client.created_at)}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Container 
      sx={{ 
        mt: { xs: 10, sm: 3, md: 4 }, 
        mb:{xs:10,md:0},

        flexGrow: 1, 
        maxWidth: { xs: '100%', sm: '100%', md: '1200px !important' },
        px: { xs: 1, sm: 2, md: 3 }
      }}
    >
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          mb: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Typography 
            variant={isSmallScreen ? "h5" : "h4"}
            sx={{
              color: theme === 'dark' ? 'white' : 'black',
              fontWeight: 'bold',
              paddingBottom: 1,
              display: 'inline-block',
              textAlign: { xs: 'center', sm: 'left' }
            }} 
            gutterBottom
          >
            Temporary Client List
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          sx={{
            backgroundColor: 'transparent',
            '& .MuiTabs-indicator': {
              backgroundColor: '#4a5fa5'
            },
            '& .MuiTabs-scrollButtons': {
              color: theme === 'dark' ? 'white' : 'black',
            }
          }}
        >
          {tabTypes.map((type) => (
            <Tab 
              key={type} 
              label={type === 'all' ? 'All' : type} 
              value={type}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.85rem', sm: '0.95rem' },
                minWidth: { xs: 'auto', sm: 160 },
                color: theme === 'dark' ? 'white' : 'black',
                '&.Mui-selected': {
                  color: '#6281e9',
                },
                backgroundColor: 'transparent'
              }}
            />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 2 }
      }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name or email..."
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ color: theme === 'dark' ? 'white' : 'black' }}>
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            color: theme === 'dark' ? 'white' : 'black',
            maxWidth: { xs: '100%', sm: '500px' },
            '& .MuiOutlinedInput-root': {
              color: theme === 'dark' ? 'white' : 'black',
              borderRadius: '8px',
            }
          }}
        />
        {selectedClients.size > 0 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<CheckCircleIcon />}
            onClick={handleConvertToPermanent}
            disabled={convertLoading}
            fullWidth={isSmallScreen}
            sx={{
              backgroundColor: '#4a5fa5',
              '&:hover': {
                backgroundColor: '#3d4f8a'
              },
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              minWidth: { xs: '100%', sm: 'auto' },
              whiteSpace: 'nowrap',
              fontSize: { xs: '0.85rem', sm: '0.95rem' }
            }}
          >
            {convertLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              `Convert ${selectedClients.size} to Permanent`
            )}
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#4a5fa5' }} />
        </Box>
      ) : (
        <>
          {/* Mobile/Tablet Card View */}
          {isMobile ? (
            <Box>
              {selectedClients.size > 0 && (
                <Box sx={{ 
                  mb: 2, 
                  p: 2, 
                  bgcolor: theme === 'dark' ? '#2a2a2a' : '#f0f2ff',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Checkbox
                      checked={isSelectAll}
                      onChange={handleSelectAll}
                      sx={{
                        color: '#4a5fa5',
                        '&.Mui-checked': {
                          color: '#4a5fa5',
                        },
                      }}
                    />
                    <Typography sx={{ color: theme === 'dark' ? 'white' : 'black', fontSize: '0.9rem' }}>
                      Select All
                    </Typography>
                  </Box>
                  <Typography sx={{ color: theme === 'dark' ? '#ccc' : '#666', fontSize: '0.85rem' }}>
                    {selectedClients.size} selected
                  </Typography>
                </Box>
              )}
              
              {clients.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="body1" sx={{ color: '#666' }}>
                    {searchQuery ? 'No clients match your search' : 'No clients found'}
                  </Typography>
                </Box>
              ) : (
                clients.map((client) => (
                  <ClientCard key={client.id} client={client} />
                ))
              )}
            </Box>
          ) : (
            /* Desktop Table View */
            <Paper 
              elevation={3} 
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid #e0e0e0`
              }}
            >
              <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme === 'dark' ? '#0D0C0F' : '#6281e9' }}>
                      <TableCell sx={{ 
                        color: 'white', 
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        padding: '12px 8px',
                        minWidth: 60
                      }}>
                        <Checkbox
                          checked={isSelectAll}
                          onChange={handleSelectAll}
                          sx={{
                            color: 'white',
                            '&.Mui-checked': {
                              color: 'white',
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ 
                        color: 'white', 
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        minWidth: 80
                      }}>
                        Avatar
                      </TableCell>
                      <TableCell sx={{ 
                        color: 'white', 
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        minWidth: 150
                      }}>
                        Full Name
                      </TableCell>
                      <TableCell sx={{ 
                        color: 'white', 
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        minWidth: 200
                      }}>
                        Email
                      </TableCell>
                      <TableCell sx={{ 
                        color: 'white', 
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        minWidth: 120
                      }}>
                        Phone
                      </TableCell>
                      <TableCell sx={{ 
                        color: 'white', 
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        minWidth: 100
                      }}>
                        Type
                      </TableCell>
                      <TableCell sx={{ 
                        color: 'white', 
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        minWidth: 120
                      }}>
                        Created At
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                          <Typography variant="body1" sx={{ color: '#666' }}>
                            {searchQuery ? 'No clients match your search' : 'No clients found'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      clients.map((client) => (
                        <TableRow 
                          key={client.id}
                          sx={{
                            '&:nth-of-type(odd)': {
                              backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9ff',
                              color: theme === 'dark' ? 'white' : 'black',
                            },
                            '&:nth-of-type(even)': {
                              backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9ff',
                              color: theme === 'dark' ? 'white' : 'black',
                            },
                            '&:hover': {
                              backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f0f2ff',
                              cursor: 'pointer',
                            },
                            transition: 'background-color 0.2s ease',
                          }}
                        >
                          <TableCell sx={{ padding: '12px 8px' }}>
                            <Checkbox
                              checked={selectedClients.has(client.id)}
                              onChange={() => handleClientSelect(client.id)}
                              sx={{
                                color: '#4a5fa5',
                                '&.Mui-checked': {
                                  color: '#4a5fa5',
                                },
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: '#4a5fa5', 
                                  width: 36, 
                                  height: 36,
                                  fontSize: '0.9rem'
                                }}
                                src={client.avatar_image}
                              >
                                {getInitials(client.name)}
                              </Avatar>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ 
                            fontSize: '0.9rem',
                            // fontFamily: 'monospace',
                            color: theme === 'dark' ? 'white' : 'black'
                          }}>
                            {client.name || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ 
                            fontSize: '0.9rem',
                            color: theme === 'dark' ? 'white' : 'black',
                            wordBreak: 'break-all'
                          }}>
                            {formatEmail(client.email)}
                          </TableCell>
                          <TableCell sx={{ 
                            fontSize: '0.9rem',
                            color: theme === 'dark' ? 'white' : 'black'
                          }}>
                            {client.phone || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ 
                            fontSize: '0.9rem',
                            color: theme === 'dark' ? 'white' : 'black'
                          }}>
                            {client.number_type}
                          </TableCell>
                          <TableCell sx={{ 
                            fontSize: '0.9rem',
                            color: theme === 'dark' ? 'white' : 'black'
                          }}>
                            {formatDate(client.created_at)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Paper>
          )}

          {totalPages > 1 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: 3,
              '& .MuiPagination-root': {
                '& .MuiPaginationItem-root': {
                  fontSize: { xs: '0.8rem', sm: '0.9rem' }
                }
              }
            }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size={isSmallScreen ? "small" : "medium"}
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: '#4a5fa5',
                  },
                }}
              />
            </Box>
          )}
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ 
          vertical: 'bottom', 
          horizontal: isMobile ? 'center' : 'right' 
        }}
      >
        <Alert 
          onClose={closeSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ 
            width: '100%',
            '& .MuiAlert-message': {
              fontSize: { xs: '0.8rem', sm: '0.9rem' }
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TempClientList;