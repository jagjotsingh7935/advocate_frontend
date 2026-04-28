import React, { useState, useEffect } from 'react';
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
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { Person as PersonIcon, AdminPanelSettings as AdminIcon, Search as SearchIcon } from '@mui/icons-material';
import { getAdmins } from '../api/Api';
import Sidebar from './Sidebar';
import useMyContext from '../usercontext/useMyContext';

const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useMyContext();
  
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.between('md', 'lg'));

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        const data = await getAdmins({ page, search: searchQuery });
        setAdmins(data.results);
        setTotalPages(data.num_pages);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch admin list. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, [page, searchQuery]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset to first page when searching
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
  const AdminCard = ({ admin }) => (
    <Card 
      sx={{ 
        mb: 2,
        borderRadius: 2,
        border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        '&:hover': {
          backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f0f2ff',
          cursor: 'pointer',
        },
        transition: 'background-color 0.2s ease',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: '#4a5fa5', 
              width: 48, 
              height: 48,
              fontSize: '1.1rem'
            }}
            src={admin.avatar_image}
          >
            {getInitials(admin.full_name)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme === 'dark' ? 'white' : 'black',
                fontWeight: 600,
                fontSize: '1.1rem'
              }}
            >
              {admin.full_name}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme === 'dark' ? '#ccc' : '#666',
                mt: 0.5
              }}
            >
              {formatEmail(admin.email)}
            </Typography>
          </Box>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: theme === 'dark' ? '#999' : '#666',
                display: 'block',
                fontWeight: 500,
                mb: 0.5
              }}
            >
              Phone
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ color: theme === 'dark' ? 'white' : 'black' }}
            >
              {admin.phone_number || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: theme === 'dark' ? '#999' : '#666',
                display: 'block',
                fontWeight: 500,
                mb: 0.5
              }}
            >
              Created At
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ color: theme === 'dark' ? 'white' : 'black' }}
            >
              {formatDate(admin.created_at)}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Container 
      sx={{ 
        mt: { xs: 2, sm: 3, md: 4 }, 
        flexGrow: 1, 
        maxWidth: '1200px !important',
        px: { xs: 2, sm: 3, md: 4 }
      }}
    >
      {/* Header */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"}
            sx={{
              color: theme === 'dark' ? 'white' : '#012345',
              fontWeight: 'bold',
              display: 'inline-block'
            }} 
            gutterBottom
          >
            Staff List
          </Typography>
        </Box>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#666', 
            mt: 1,
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}
        >
          View and manage system administrators
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: theme === 'dark' ? 'white' : '#012345' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: { xs: '100%', md: '500px' },
            border: 1,
            color: theme === 'dark' ? 'white' : '#012345',
            borderColor: theme === 'dark' ? 'white' : '#012345',
            borderRadius: '8px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              color: theme === 'dark' ? 'white' : '#012345',
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }
          }}
        />
      </Box>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#4a5fa5' }} />
        </Box>
      ) : (
        <>
          {/* Desktop/Tablet Table View */}
          {!isMobile ? (
            <Paper 
              elevation={3} 
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid #e0e0e0`
              }}
            >
              <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: isTablet ? 600 : 800 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme === 'dark' ? '#0D0C0F' : '#6281e9' }}>
                      <TableCell sx={{ 
                        color: 'white', 
                        fontWeight: 600,
                        fontSize: { sm: '0.85rem', md: '0.95rem' },
                        minWidth: 80
                      }}>
                        Avatar
                      </TableCell>
                      <TableCell sx={{ 
                        color: 'white', 
                        fontWeight: 600,
                        fontSize: { sm: '0.85rem', md: '0.95rem' },
                        minWidth: 150
                      }}>
                        Full Name
                      </TableCell>
                      <TableCell sx={{ 
                        color: 'white', 
                        fontWeight: 600,
                        fontSize: { sm: '0.85rem', md: '0.95rem' },
                        minWidth: 200
                      }}>
                        Email
                      </TableCell>
                      <TableCell sx={{ 
                        color: 'white', 
                        fontWeight: 600,
                        fontSize: { sm: '0.85rem', md: '0.95rem' },
                        minWidth: 120
                      }}>
                        Phone
                      </TableCell>
                      <TableCell sx={{ 
                        color: 'white', 
                        fontWeight: 600,
                        fontSize: { sm: '0.85rem', md: '0.95rem' },
                        minWidth: 120
                      }}>
                        Created At
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {admins.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6 }}>
                          <Typography variant="body1" sx={{ color: '#666' }}>
                            No administrators found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      admins.map((admin) => (
                        <TableRow 
                          key={admin.staff_id}
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
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: '#4a5fa5', 
                                  width: isTablet ? 32 : 36, 
                                  height: isTablet ? 32 : 36,
                                  fontSize: isTablet ? '0.8rem' : '0.9rem'
                                }}
                                src={admin.avatar_image}
                              >
                                {getInitials(admin.full_name)}
                              </Avatar>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ 
                            fontSize: { sm: '0.8rem', md: '0.9rem' },
                            // fontFamily: 'monospace',
                            color: theme === 'dark' ? 'white' : 'black'
                          }}>
                            {admin.full_name}
                          </TableCell>
                          <TableCell sx={{ 
                            fontSize: { sm: '0.8rem', md: '0.9rem' },
                            color: theme === 'dark' ? 'white' : 'black',
                            wordBreak: 'break-word'
                          }}>
                            {formatEmail(admin.email)}
                          </TableCell>
                          <TableCell sx={{ 
                            fontSize: { sm: '0.8rem', md: '0.9rem' },
                            color: theme === 'dark' ? 'white' : 'black'
                          }}>
                            {admin.phone_number || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ 
                            fontSize: { sm: '0.8rem', md: '0.9rem' },
                            color: theme === 'dark' ? 'white' : 'black'
                          }}>
                            {formatDate(admin.created_at)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Paper>
          ) : (
            /* Mobile Card View */
            <Box>
              {admins.length === 0 ? (
                <Paper 
                  sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                    border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`
                  }}
                >
                  <Typography variant="body1" sx={{ color: '#666' }}>
                    No administrators found
                  </Typography>
                </Paper>
              ) : (
                admins.map((admin) => (
                  <AdminCard key={admin.staff_id} admin={admin} />
                ))
              )}
            </Box>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: 3,
              '& .MuiPagination-root': {
                '& .MuiPaginationItem-root': {
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  minWidth: { xs: '28px', sm: '32px' },
                  height: { xs: '28px', sm: '32px' }
                }
              }
            }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size={isMobile ? "small" : "medium"}
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

      {/* Summary */}
      {admins.length > 0 && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#666',
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}
          >
            Total: {admins.length} administrator{admins.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default AdminList;