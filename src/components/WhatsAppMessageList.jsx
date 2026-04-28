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
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { getWhatsAppMessages } from '../api/Api';
import Sidebar from './Sidebar';

const WhatsAppMessageList = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = await getWhatsAppMessages();
        setMessages(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch messages. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'sent':
        return '#6281e9';
      case 'delivered':
        return '#2e7d32';
      case 'pending':
        return '#ed6c02';
      case 'failed':
        return '#d32f2f';
      default:
        return '#6281e9';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <Container sx={{ mt: 4, flexGrow: 1, maxWidth: '1200px !important' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{
           color: 'black',
            fontWeight: 'bold',
            
            paddingBottom: 1,
            display: 'inline-block'
          }} 
          gutterBottom
        >
          WhatsApp Messages
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', mt: 1 }}>
          Manage and monitor your WhatsApp message campaigns
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
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#4a5fa5' }} />
        </Box>
      ) : (
        /* Messages Table */
        <Paper 
          elevation={3} 
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            border: `1px solid #e0e0e0`
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#6281e9' }}>
                <TableCell sx={{ 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}>
                  ID
                </TableCell>
                <TableCell sx={{ 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}>
                  Phone Number
                </TableCell>
                <TableCell sx={{ 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}>
                  Status
                </TableCell>
                <TableCell sx={{ 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}>
                  Scheduled Time
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="body1" sx={{ color: '#666' }}>
                      No messages found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((msg, index) => (
                  <TableRow 
                    key={msg.id}
                    sx={{
                      '&:nth-of-type(odd)': {
                        backgroundColor: '#f8f9ff',
                      },
                      '&:hover': {
                        backgroundColor: '#f0f2ff',
                        cursor: 'pointer'
                      },
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <TableCell sx={{ 
                      fontWeight: 500,
                      color: '#4a5fa5'
                    }}>
                      {msg.id}
                    </TableCell>
                    <TableCell sx={{ 
                      // fontFamily: 'monospace',
                      fontSize: '0.9rem'
                    }}>
                      {msg.phone_number}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={msg.status}
                        size="small"
                        variant='outlined'
                        color={msg.status === 'Error' ? 'error' : 'primary'}
                        sx={{
                         
                          // color: 'white',
                          fontWeight: 500,
                          textTransform: 'capitalize',
                          minWidth: 70
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#666',
                      fontSize: '0.9rem'
                    }}>
                      {formatDateTime(msg.scheduled_time)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Summary */}
      {messages.length > 0 && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Showing {messages.length} message{messages.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default WhatsAppMessageList;