import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Chip,
  Pagination,
  CircularProgress,
  Tabs,
  Tab,
  Button,
  Avatar,
  Tooltip,
  Stack,
  Select,
  MenuItem
} from '@mui/material';
import {
  Description,
  Image,
  FileUpload,
  Person,
  AccessTime,
  Email
} from '@mui/icons-material';
import { UserFetchDocumentGet, UserFetchDocumentGet2, UserFetchDocumentPost } from '../api/Api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

// Enhanced Visitor Status Component
const VisitorStatusCell = ({ visitedBy }) => {
  if (!visitedBy || visitedBy.length === 0) {
    return (
      <Box sx={{ p: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No visitors yet
        </Typography>
      </Box>
    );
  }

  const visitor = visitedBy[0]; // Assuming we show the first/latest visitor

  // Function to get avatar color based on user type
  const getAvatarColor = (userType) => {
    switch (userType?.toLowerCase()) {
      case 'admin':
        return '#f44336'; // Red
      case 'manager':
        return '#ff9800'; // Orange
      case 'user':
        return '#4caf50'; // Green
      default:
        return '#2196f3'; // Blue
    }
  };

  // Function to get user type chip color
  const getUserTypeChipColor = (userType) => {
    switch (userType?.toLowerCase()) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      case 'user':
        return 'success';
      default:
        return 'primary';
    }
  };

  return (
    <Box sx={{ p: 1, minWidth: 200 }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        
        
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack spacing={0.5}>
            {/* Visitor Name */}
            <Typography 
              variant="body2" 
              fontWeight="medium"
              sx={{ 
                fontSize: '0.875rem',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {visitor.visited_by_name}
            </Typography>
            
            {/* Email with icon */}
            {visitor.visited_by_email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Email sx={{ fontSize: 12, color: 'text.secondary' }} />
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  fontSize: '0.75rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1
                }}
              >
                {visitor.visited_by_email}
              </Typography>
            </Box>
            )}
            
            {/* User Type Chip */}
            {visitor.user_type && (
                <Box sx={{ mt: 0.5 }}>
              <Chip
                label={visitor.user_type}
                size="small"
                color={getUserTypeChipColor(visitor.user_type)}
                variant="outlined"
                sx={{ 
                  height: 20,
                  fontSize: '0.675rem',
                  fontWeight: 'medium'
                }}
              />
            </Box>
            )}

            {/* Visit timestamp if available */}
            {visitor.visited_at && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <AccessTime sx={{ fontSize: 12, color: 'text.secondary' }} />
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ fontSize: '0.7rem' }}
                >
                  {new Date(visitor.visited_at).toLocaleString()}
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      </Stack>
      
      {/* Show count if multiple visitors */}
      {visitedBy.length > 1 && (
        <Box sx={{ mt: 1 }}>
          <Chip
            label={`+${visitedBy.length - 1} more`}
            size="small"
            variant="filled"
            color="default"
            sx={{ 
              height: 18,
              fontSize: '0.65rem',
              bgcolor: 'grey.100',
              color: 'text.secondary'
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default function UserFetchDocument() {
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [notOpenedDocuments, setNotOpenedDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [pageSize, setPageSize] = useState(3); // Default page size
const [manualPageInput, setManualPageInput] = useState('');
  // Fetch all documents
  const fetchDocuments = async (page = 1, search = '', size = pageSize) => {
    setLoading(true);
    try {
      const response = await UserFetchDocumentGet({ page, search,page_size: size });
      if (response && response.results) {
        const formattedDocuments = response.results.map(doc => ({
          id: doc.id,
          name: doc.document.split('/').pop(),
          type: doc.title,
          fileType: 'application/pdf',
          uploadDate: new Date(doc.created_at).toLocaleDateString(),
          documentUrl: doc.document,
          clientName: doc.client_name,
          clientEmail: doc.client_email,
          isOpened: doc.is_opened,
          visitedBy: doc.visited_by
        }));
        setUploadedDocuments(formattedDocuments);
        setTotalPages(response.num_pages || 1);
      }
    } catch (error) {
      setError('Failed to fetch documents');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch not opened documents
  const fetchNotOpenedDocuments = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await UserFetchDocumentGet2({page,search});
      if (response && response.results) {
        const formattedDocuments = response.results.map(doc => ({
          id: doc.id,
          name: doc.document.split('/').pop(),
          type: doc.title,
          fileType: 'application/pdf',
          uploadDate: new Date(doc.created_at).toLocaleDateString(),
          documentUrl: doc.document,
          clientName: doc.client_name,
          clientEmail: doc.client_email,
          isOpened: doc.is_opened,
          visitedBy: doc.visited_by
        }));
        setNotOpenedDocuments(formattedDocuments);
        setTotalPages(response.num_pages || 1);
      }
    } catch (error) {
      setError('Failed to fetch not opened documents');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle show document button click
  const handleShowDocument = async (documentId, documentUrl) => {
    const formdata = new FormData();
    formdata.append('uploaded_document_id', documentId);

    try {
      const response = await UserFetchDocumentPost(formdata);
      if (response) {
        window.open(documentUrl, '_blank');
      }
      // Refresh documents after marking as visited
      if (activeTab === 0) {
        fetchNotOpenedDocuments(currentPage, searchQuery);
      } else {
        fetchDocuments(currentPage, searchQuery);
      }
    } catch (error) {
      setError('Failed to mark document as visited');
      setSnackbarOpen(true);
    }
  };
useEffect(() => {
  setManualPageInput(currentPage.toString());
}, [currentPage]);
  useEffect(() => {
    if (activeTab === 0) {
      fetchNotOpenedDocuments(currentPage, searchQuery);
      fetchDocuments(currentPage, searchQuery);
    } else {
      fetchDocuments(currentPage, searchQuery,pageSize);
    }
  }, [currentPage, searchQuery, activeTab,pageSize]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setCurrentPage(1);
    setSearchQuery('');
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
    setError('');
  };

  const renderDocumentsTable = (documents) => {
    if (documents.length === 0) {
      return (
        <Box sx={{ p: 6, textAlign: 'center' }}>
          <FileUpload sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No documents found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery ? 'Try adjusting your search criteria' : 
             activeTab === 0 ? 'No unopened documents found' : 'No documents have been uploaded yet'}
          </Typography>
        </Box>
      );
    }

    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#5e77c7ff' }}>
              <TableCell sx={{color:'white',fontWeight:'bold'}}>Client</TableCell>
              <TableCell sx={{color:'white',fontWeight:'bold'}}>Type</TableCell>
              <TableCell sx={{color:'white',fontWeight:'bold'}}>Upload Date</TableCell>
              <TableCell sx={{color:'white',fontWeight:'bold'}}>Document</TableCell>
              {activeTab === 1 && <TableCell sx={{color:'white',fontWeight:'bold'}}>Status</TableCell>}
              {activeTab === 1 && <TableCell sx={{color:'white',fontWeight:'bold', minWidth: 220}}>Visitor Details</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {doc.clientName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {doc.clientEmail}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={doc.type} color='error' variant='outlined' size="small" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {doc.uploadDate}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Box sx={{ ml: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleShowDocument(doc.id, doc.documentUrl)}
                        sx={{ mt: 1, bgcolor:'#5b74c3ff', borderRadius: 2 }}
                      >
                        Show Document
                      </Button>
                    </Box>
                  </Box>
                </TableCell>
                {activeTab === 1 && (
                  <TableCell>
                    <Chip 
                      label={doc.isOpened ? 'Opened' : 'Not Opened'} 
                      size="small" 
                      color={doc.isOpened ? 'success' : 'warning'}
                      variant={doc.isOpened ? 'outlined' : 'outlined'}
                    />
                  </TableCell>
                )}
                {activeTab === 1 && (
                  <TableCell>
                    <VisitorStatusCell visitedBy={doc.visitedBy} />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#012345', fontWeight: 'bold' }}>
          User Documents
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your uploaded documents
        </Typography>
      </Box>

      <Paper sx={{ width: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="document tabs"
          sx={{ 
            '& .MuiTab-root': {
              color: 'black',
              '&.Mui-selected': {
                color: '#5e77c7ff',
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#5e77c7ff',
            }
          }}
        >
          <Tab label={`Not Opened (${notOpenedDocuments.length})`} />
          <Tab label={`All Documents (${uploadedDocuments.length})`} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TextField
            fullWidth
            label="Search Documents"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by document name, type, or client"
            sx={{ mb: 3 }}
          />

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <CircularProgress />
            </Box>
          )}

          <TabPanel value={activeTab} index={0}>
            {renderDocumentsTable(notOpenedDocuments)}
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            {renderDocumentsTable(uploadedDocuments)}
          </TabPanel>

   
  <Box sx={{ pt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2">Items per page:</Typography>
      <Select
        size="small"
        value={pageSize}
        onChange={(e) => {
          setPageSize(e.target.value);
          setCurrentPage(1); // Reset to first page when changing page size
        }}
        sx={{ 
          width: 80,
          height: 36,
          '& .MuiSelect-select': {
            py: 1
          }
        }}
      >
        <MenuItem value={5}>5</MenuItem>
        <MenuItem value={10}>10</MenuItem>
        <MenuItem value={20}>20</MenuItem>
        <MenuItem value={50}>50</MenuItem>
      </Select>
    </Box>

    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={handlePageChange}
        color="primary"
        showFirstButton
        showLastButton
      />
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2">Go to page:</Typography>
        <TextField
          size="small"
          type="number"
          value={manualPageInput}
          onChange={(e) => setManualPageInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const page = parseInt(manualPageInput);
              if (page >= 1 && page <= totalPages) {
                setCurrentPage(page);
                setManualPageInput('');
              }
            }
          }}
          inputProps={{
            min: 1,
            max: totalPages,
            style: { 
              width: 60,
              textAlign: 'center',
              padding: '8.5px 8px'
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: 36
            }
          }}
        />
      </Box>
    </Box>
  </Box>

        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}