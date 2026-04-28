import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  Button, 
  IconButton,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { getNews } from '../api/Api';
import Sidebar from './Sidebar';
import useMyContext from '../usercontext/useMyContext';

const NewsShow = ({ onAddClick, onEditClick, onDeleteClick }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { theme } = useMyContext();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.between('sm', 'md'));

  // Define fallback functions to prevent "not a function" errors
  const handleAddClick = onAddClick || ((nav) => nav('/news/add'));
  const handleEditClick = onEditClick || ((id, nav) => nav(`/news/edit/${id}`));
  const handleDeleteClick = onDeleteClick || ((id, nav) => nav(`/news/delete/${id}`));

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const data = await getNews();
        setNews(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch news. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const truncateText = (text, maxLength = 100) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Mobile Card Component
  const NewsCard = ({ item }) => (
    <Card 
      sx={{ 
        mb: 2,
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9ff',
        border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
        '&:hover': {
          backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f0f2ff',
          transform: 'translateY(-2px)',
          boxShadow: theme === 'dark' ? '0 4px 8px rgba(255,255,255,0.1)' : '0 4px 8px rgba(0,0,0,0.1)',
        },
        transition: 'all 0.2s ease'
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#4a5fa5',
              fontWeight: 'bold',
              backgroundColor: theme === 'dark' ? '#333' : '#e3f2fd',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem'
            }}
          >
            ID: {item.id}
          </Typography>
        </Box>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold',
            color: theme === 'dark' ? 'white' : '#012345',
            mb: 1,
            fontSize: '1.1rem',
            lineHeight: 1.3
          }}
        >
          {truncateText(item.title, isMobile ? 60 : 80)}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: theme === 'dark' ? '#ccc' : '#666',
            lineHeight: 1.4,
            fontSize: '0.9rem'
          }}
        >
          {truncateText(item.description, isMobile ? 120 : 150)}
        </Typography>
      </CardContent>
      <CardActions sx={{ pt: 0, justifyContent: 'flex-end', px: 2, pb: 2 }}>
        <IconButton
          onClick={() => handleEditClick(item.id, navigate)}
          sx={{ 
            color: '#4a5fa5',
            '&:hover': {
              backgroundColor: theme === 'dark' ? '#333' : '#f0f2ff',
              color: '#3a4f95'
            },
            mr: 1
          }}
          title="Edit news"
        >
          <EditIcon />
        </IconButton>
        <IconButton
          onClick={() => handleDeleteClick(item.id, navigate)}
          sx={{ 
            color: '#d32f2f',
            '&:hover': {
              backgroundColor: theme === 'dark' ? '#333' : '#ffebee',
              color: '#c62828'
            }
          }}
          title="Delete news"
        >
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );

  return (
    <Container 
      sx={{ 
        mt: { xs: 2, sm: 3, md: 4 }, 
        flexGrow: 1, 
        p: { xs: 1, sm: 2, md: 3 }, 
        maxWidth: { xs: '100%', sm: '100%', md: '1200px !important' }
      }}
    >
      {/* Header Section */}
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' }, 
          mb: 2,
          gap: { xs: 2, sm: 0 }
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
              color: theme === 'dark' ? 'white' : '#012345',
              fontWeight: 'bold',
              paddingBottom: 1,
              display: 'inline-block',
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            News Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleAddClick(navigate)}
            sx={{ 
              fontSize: { xs: '0.9rem', sm: '1rem' }, 
              px: { xs: 3, sm: 3 },
              py: { xs: 1.5, sm: 1 },
              bgcolor: '#4a5fa5',
              '&:hover': {
                bgcolor: '#3a4f95'
              },
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              minHeight: { xs: '48px', sm: '40px' },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Add News
          </Button>
        </Box>
        <Typography 
          variant="body1" 
          sx={{ 
            color: theme === 'dark' ? '#ccc' : '#666', 
            mt: 1,
            textAlign: { xs: 'center', sm: 'left' },
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}
        >
          Create, edit, and manage your news articles
        </Typography>
      </Box>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: { xs: 4, sm: 6, md: 8 } }}>
          <CircularProgress sx={{ color: '#4a5fa5' }} />
        </Box>
      ) : (
        <>
          {/* Mobile/Tablet Card View */}
          {isMobile && (
            <Box>
              {news.length === 0 ? (
                <Paper 
                  sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9ff',
                    border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`
                  }}
                >
                  <Typography variant="body1" sx={{ color: theme === 'dark' ? '#ccc' : '#666' }}>
                    No news articles found
                  </Typography>
                </Paper>
              ) : (
                news.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))
              )}
            </Box>
          )}

          {/* Desktop Table View */}
          {!isMobile && (
            <Paper 
              elevation={3}
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
                backgroundColor: theme === 'dark' ? '#1a1a1a' : 'white'
              }}
            >
              <Table sx={{ minWidth: { sm: 650, md: 800 } }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme === 'dark' ? '#0D0C0F' : '#6281e9' }}>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      fontSize: { sm: '0.9rem', md: '1rem' },
                      color: 'white',
                      width: { sm: '10%', md: '8%' }
                    }}>
                      ID
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      fontSize: { sm: '0.9rem', md: '1rem' },
                      color: 'white',
                      width: { sm: '30%', md: '35%' }
                    }}>
                      Title
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      fontSize: { sm: '0.9rem', md: '1rem' },
                      color: 'white',
                      width: { sm: '45%', md: '42%' }
                    }}>
                      Description
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      fontSize: { sm: '0.9rem', md: '1rem' },
                      color: 'white',
                      textAlign: 'center',
                      width: { sm: '15%', md: '15%' }
                    }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {news.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: 'center', py: 6 }}>
                        <Typography variant="body1" sx={{ color: theme === 'dark' ? '#ccc' : '#666' }}>
                          No news articles found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    news.map((item) => (
                      <TableRow 
                        key={item.id} 
                        sx={{
                          '&:nth-of-type(odd)': {
                            backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f8f9ff',
                          },
                          '&:nth-of-type(even)': {
                            backgroundColor: theme === 'dark' ? '#1a1a1a' : 'white',
                          },
                          '&:hover': {
                            backgroundColor: theme === 'dark' ? '#333' : '#f0f2ff',
                            cursor: 'pointer',
                          },
                          transition: 'background-color 0.2s ease',
                        }}
                      >
                        <TableCell sx={{ 
                          fontSize: { sm: '0.8rem', md: '0.9rem' },
                          fontWeight: 500,
                          color: theme === 'dark' ? 'white' : 'black'
                        }}>
                          {item.id}
                        </TableCell>
                        <TableCell sx={{ 
                          fontSize: { sm: '0.8rem', md: '0.9rem' },
                          fontWeight: 500,
                          color: theme === 'dark' ? 'white' : 'black',
                          wordBreak: 'break-word'
                        }}>
                          {truncateText(item.title, isTablet ? 40 : 50)}
                        </TableCell>
                        <TableCell sx={{ 
                          fontSize: { sm: '0.8rem', md: '0.9rem' },
                          color: theme === 'dark' ? '#ccc' : '#666',
                          wordBreak: 'break-word'
                        }}>
                          {truncateText(item.description, isTablet ? 60 : 80)}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <IconButton
                              onClick={() => handleEditClick(item.id, navigate)}
                              sx={{ 
                                p: { sm: 0.5, md: 1 },
                                color: '#4a5fa5',
                                '&:hover': {
                                  backgroundColor: theme === 'dark' ? '#444' : '#f0f2ff',
                                  color: '#3a4f95'
                                }
                              }}
                              title="Edit news"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDeleteClick(item.id, navigate)}
                              sx={{ 
                                p: { sm: 0.5, md: 1 },
                                color: '#d32f2f',
                                '&:hover': {
                                  backgroundColor: theme === 'dark' ? '#444' : '#ffebee',
                                  color: '#c62828'
                                }
                              }}
                              title="Delete news"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Paper>
          )}
        </>
      )}

      {/* Summary */}
      {news.length > 0 && (
        <Box sx={{ 
          mt: { xs: 2, sm: 3 }, 
          textAlign: 'center',
          py: { xs: 1, sm: 0 }
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme === 'dark' ? '#ccc' : '#666',
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}
          >
            Showing {news.length} news article{news.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default NewsShow;