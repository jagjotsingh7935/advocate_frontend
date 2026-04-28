import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  LinearProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
  alpha,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Chip,
  Grid,
  Pagination,
  Stack
} from '@mui/material';
import {
  CloudUpload,
  Description,
  Image,
  CheckCircle,
  CreditCard,
  Receipt,
  Business,
  AccountBalance,
  Warning,
  Add,
  FileUpload,
  Security,
  Speed,
  CalendarToday,
  Assignment
} from '@mui/icons-material';
import { getClientDocuments, uploadDocuments } from '../api/Api';
import useMyContext from '../usercontext/useMyContext';

export default function UserUploadDocument() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [pendingUpload, setPendingUpload] = useState(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [pagination, setPagination] = useState({
    count: 0,
    num_pages: 1,
    page_size: 5,
    current_page: 1
  });
  const { authme, theme } = useMyContext();
  const theme2 = useTheme();
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme2.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme2.breakpoints.down('md'));
  const isLarge = useMediaQuery(theme2.breakpoints.up('lg'));

  console.log('authme in UserUploadDocument', authme);

  const documentTypes = [
    { value: 'itr', label: 'ITR', icon: <CreditCard />, color: '#1976d2' },
    { value: 'gst', label: 'GST Certificate', icon: <Business />, color: '#f57c00' },
    { value: 'tds', label: 'TDS', icon: <AccountBalance />, color: '#7b1fa2' },
    { value: 'anyother', label: 'Any Other', icon: <Description />, color: '#d81b60' },
  ];

  const pageSizeOptions = [5, 10, 25, 50];

  const acceptedFileTypes = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'application/pdf': ['.pdf']
  };

  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const validateFile = (file) => {
    if (file.size > maxFileSize) {
      return 'File size should not exceed 5MB';
    }
    
    const fileType = file.type;
    if (!acceptedFileTypes[fileType]) {
      return 'Only JPG, PNG, and PDF files are allowed';
    }
    
    return null;
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setError('');

    if (files.length === 0) return;

    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSnackbarOpen(true);
        event.target.value = '';
        return;
      }
    }

    setSelectedFiles(files);
    event.target.value = '';
  };

  const handleUploadClick = () => {
    if (!selectedDocumentType) {
      setError('Please select a document type');
      setSnackbarOpen(true);
      return;
    }

    if (selectedFiles.length === 0) {
      setError('Please select files to upload');
      setSnackbarOpen(true);
      return;
    }

    const docTypeLabel = documentTypes.find(doc => doc.value === selectedDocumentType)?.label || selectedDocumentType;
    setPendingUpload({
      files: selectedFiles,
      documentType: selectedDocumentType,
      docTypeLabel
    });
    setConfirmationOpen(true);
  };

  const fetchDocuments = async (page = 1, pageSize = pagination.page_size) => {
    try {
      const res = await getClientDocuments({ page, page_size: pageSize });
      setDocuments(res.results || []);
      setPagination({
        count: res.count || 0,
        num_pages: res.num_pages || 1,
        page_size: pageSize,
        current_page: page
      });
    } catch (err) {
      setError('Failed to fetch documents. Please try again.');
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    fetchDocuments(1, pagination.page_size);
  }, []);

  const handlePageChange = (event, value) => {
    fetchDocuments(value, pagination.page_size);
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = event.target.value;
    setPagination(prev => ({ ...prev, page_size: newPageSize, current_page: 1 }));
    fetchDocuments(1, newPageSize);
  };

  const handleConfirmUpload = async () => {
    if (!pendingUpload) return;

    const { files, documentType } = pendingUpload;
    setConfirmationOpen(false);
    setUploadDialogOpen(false);
    setUploading(true);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('title', documentType);
        formData.append('document', file);
        formData.append('client_id', authme.profile_id);

        const response = await uploadDocuments(formData);

        if (!response) {
          throw new Error('Upload failed');
        }
      }

      setSuccessMessage(`Document uploaded successfully! We'll send you an email shortly`);
      setSnackbarOpen(true);
      
      // Reset form
      setSelectedDocumentType('');
      setSelectedFiles([]);
      // Refresh documents - go back to first page to show newly uploaded document
      await fetchDocuments(1, pagination.page_size);
    } catch (err) {
      setError('Failed to upload document. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setUploading(false);
      setPendingUpload(null);
    }
  };

  const handleCancelUpload = () => {
    setConfirmationOpen(false);
    setPendingUpload(null);
  };

  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
    setSelectedDocumentType('');
    setSelectedFiles([]);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
    setError('');
    setSuccessMessage('');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType === 'application/pdf') {
      return <Description color="error" />;
    }
    return <Image color="primary" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getThemedStyles = () => ({
    mainContainer: {
      bgcolor: theme === 'dark' ? '#121212' : '#f5f5f5',
      minHeight: '100vh'
    },
    headerCard: {
      bgcolor: theme === 'dark' ? '#0D0C0F' : '#4a5fa5',
      color: 'white',
      border: theme === 'dark' ? '1px solid #6281e9' : 'none'
    },
    mainCard: {
      bgcolor: theme === 'dark' ? '#1e1e1e' : 'white',
      border: theme === 'dark' ? '1px solid #333' : 'none',
      borderRadius: 3,
      boxShadow: theme === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)'
    },
    uploadCard: {
      bgcolor: theme === 'dark' ? '#262626' : '#fafafa',
      border: theme === 'dark' ? '1px solid #404040' : '1px solid #e0e0e0',
      borderRadius: 2,
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: theme === 'dark' ? '0 8px 25px rgba(98,129,233,0.2)' : '0 8px 25px rgba(74,95,165,0.15)',
        transform: 'translateY(-2px)'
      }
    },
    featureCard: {
      bgcolor: theme === 'dark' ? '#1e1e1e' : 'white',
      border: theme === 'dark' ? '1px solid #333' : '1px solid #e0e0e0',
      borderRadius: 2,
      height: '100%',
      transition: 'all 0.2s ease',
      '&:hover': {
        boxShadow: theme === 'dark' ? '0 4px 15px rgba(0,0,0,0.4)' : '0 4px 15px rgba(0,0,0,0.1)',
      }
    },
    dialogPaper: {
      bgcolor: theme === 'dark' ? '#1e1e1e' : 'white',
      border: theme === 'dark' ? '1px solid #333' : 'none'
    },
    uploadArea: {
      borderColor: theme === 'dark' ? '#333' : '#ddd',
      bgcolor: theme === 'dark' ? '#1e1e1e' : 'grey.50',
      '&:hover': {
        borderColor: theme === 'dark' ? '#6281e9' : '#4a5fa5',
        bgcolor: theme === 'dark' ? alpha('#6281e9', 0.1) : '#4a5fa520'
      }
    },
    button: {
      bgcolor: '#4a5fa5',
      color: 'white',
      '&:hover': {
        bgcolor: theme === 'dark' ? '#3a4f95' : '#39508c'
      }
    },
    outlinedButton: {
      borderColor: '#4a5fa5',
      color: '#4a5fa5',
      '&:hover': {
        borderColor: theme === 'dark' ? '#3a4f95' : '#39508c',
        bgcolor: theme === 'dark' ? alpha('#4a5fa5', 0.1) : alpha(theme2.palette.primary.main, 0.1)
      }
    },
    fileCard: {
      bgcolor: theme === 'dark' ? '#1e1e1e' : 'grey.50',
      border: theme === 'dark' ? '1px solid #333' : 'none'
    },
    snackbarAlert: {
      bgcolor: theme === 'dark' ? (error ? alpha('#f44336', 0.1) : alpha('#388e3c', 0.1)) : undefined,
      color: theme === 'dark' ? (error ? '#f44336' : '#388e3c') : undefined,
      border: theme === 'dark' ? (error ? '1px solid #f44336' : '1px solid #388e3c') : 'none'
    },
    documentCard: {
      bgcolor: theme === 'dark' ? '#1e1e1e' : 'white',
      border: theme === 'dark' ? '1px solid #333' : '1px solid #e0e0e0',
      borderRadius: 2,
      mb: 2,
      p: 2,
      '&:hover': {
        boxShadow: theme === 'dark' ? '0 4px 15px rgba(0,0,0,0.3)' : '0 4px 15px rgba(0,0,0,0.1)',
        borderColor: theme === 'dark' ? '#6281e9' : '#4a5fa5',
      },
      transition: 'all 0.2s ease'
    },
    pagination: {
      mt: 3,
      '& .MuiPaginationItem-root': {
        color: theme === 'dark' ? '#b0b0b0' : 'text.primary',
        borderColor: theme === 'dark' ? '#333' : '#e0e0e0',
        '&.Mui-selected': {
          backgroundColor: '#4a5fa5',
          color: 'white',
          '&:hover': {
            backgroundColor: theme === 'dark' ? '#3a4f95' : '#39508c'
          }
        },
        '&:hover': {
          backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0'
        }
      }
    }
  });

  const themedStyles = getThemedStyles();

  const features = [
    {
      icon: <Security sx={{ fontSize: 40, color: '#4a5fa5' }} />,
      title: 'Secure Upload',
      description: 'Your documents are encrypted and stored securely with bank-level security protocols.'
    },
    {
      icon: <Speed sx={{ fontSize: 40, color: '#4a5fa5' }} />,
      title: 'Fast Processing',
      description: 'Documents are processed quickly and you will receive email confirmation within minutes.'
    },
    {
      icon: <CheckCircle sx={{ fontSize: 40, color: '#4a5fa5' }} />,
      title: 'Auto Verification',
      description: 'Our system automatically verifies document authenticity and compliance requirements.'
    }
  ];

  // Mobile-friendly document card component
  const DocumentCard = ({ doc }) => (
    <Card sx={themedStyles.documentCard}>
      <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <Assignment sx={{ 
              color: '#4a5fa5', 
              fontSize: { xs: '1.5rem', sm: '1.75rem' }, 
              mr: 1.5 
            }} />
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: theme === 'dark' ? 'white' : '#012345',
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  fontWeight: 600,
                  lineHeight: 1.2
                }}
              >
                {doc.title}
              </Typography>
              <Chip 
                label={`ID: ${doc.uploaded_document_id}`}
                size="small"
                sx={{ 
                  mt: 0.5,
                  bgcolor: theme === 'dark' ? '#333' : '#f5f5f5',
                  color: theme === 'dark' ? '#b0b0b0' : '#666',
                  fontSize: '0.75rem'
                }}
              />
            </Box>
          </Box>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" mb={1}>
              <CalendarToday sx={{ 
                fontSize: '1rem', 
                color: theme === 'dark' ? '#6281e9' : '#4a5fa5', 
                mr: 1 
              }} />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme === 'dark' ? '#b0b0b0' : 'text.secondary',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                Created
              </Typography>
            </Box>
            <Typography 
              variant="body1" 
              sx={{ 
                color: theme === 'dark' ? 'white' : 'black',
                fontSize: { xs: '0.875rem', sm: '0.95rem' },
                fontWeight: 500,
                ml: 3
              }}
            >
              {formatDate(doc.created_at)}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" mb={1}>
              <CalendarToday sx={{ 
                fontSize: '1rem', 
                color: theme === 'dark' ? '#6281e9' : '#4a5fa5', 
                mr: 1 
              }} />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme === 'dark' ? '#b0b0b0' : 'text.secondary',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                Updated
              </Typography>
            </Box>
            <Typography 
              variant="body1" 
              sx={{ 
                color: theme === 'dark' ? 'white' : 'black',
                fontSize: { xs: '0.875rem', sm: '0.95rem' },
                fontWeight: 500,
                ml: 3
              }}
            >
              {formatDate(doc.updated_at)}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      mx: 'auto', 
      p: { xs: 2, sm: 3 }, 
      mb:{xs:10,md:0},
      mt:{xs:5,md:0},


      ...themedStyles.mainContainer 
    }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography 
          variant={isMobile ? "h4" : "h3"} 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold', 
            color: theme === 'dark' ? 'white' : '#012345',
            fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
            mb: 2
          }}
        >
          Document Management
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: theme === 'dark' ? '#b0b0b0' : 'text.secondary',
            fontSize: { xs: '1rem', sm: '1.25rem' },
            maxWidth: 600,
            mx: 'auto'
          }}
        >
          Upload and view your identity documents with our secure and fast processing system
        </Typography>
      </Box>

      {uploading && (
        <Box sx={{ mb: 4 }}>
          <LinearProgress sx={{ 
            bgcolor: theme === 'dark' ? '#333' : undefined, 
            '& .MuiLinearProgress-bar': { bgcolor: '#4a5fa5' },
            borderRadius: 1,
            height: 8
          }} />
          <Typography 
            variant="body1" 
            align="center" 
            sx={{ 
              mt: 2, 
              color: theme === 'dark' ? '#b0b0b0' : 'text.secondary',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Uploading document...
          </Typography>
        </Box>
      )}

      {/* Main Content Card */}
      <Card sx={{ ...themedStyles.mainCard, mb: 4 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4, md: 6 } }}>
          {/* Central Upload Card */}
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            sx={{ mb: 6 }}
          >
            <Card sx={{ 
              ...themedStyles.uploadCard,
              maxWidth: 500,
              width: '100%',
              p: { xs: 3, sm: 4 },
              textAlign: 'center'
            }}>
              <CardContent>
                <FileUpload sx={{ 
                  fontSize: { xs: 60, sm: 80 }, 
                  color: '#4a5fa5',
                  mb: 2
                }} />
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold',
                    color: theme === 'dark' ? 'white' : '#012345',
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}
                >
                  Upload Your Documents
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: theme === 'dark' ? '#b0b0b0' : 'text.secondary',
                    mb: 3,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  Securely upload ITR, GST certificates, TDS documents, and other important files
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Add />}
                  onClick={() => setUploadDialogOpen(true)}
                  sx={{ 
                    px: { xs: 3, sm: 4 }, 
                    py: { xs: 1.5, sm: 2 }, 
                    ...themedStyles.button,
                    fontSize: { xs: '1rem', sm: '1.125rem' },
                    borderRadius: 2,
                    boxShadow: '0 4px 15px rgba(74,95,165,0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(74,95,165,0.4)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                  fullWidth={isMobile}
                >
                  Start Upload
                </Button>
              </CardContent>
            </Card>
          </Box>

          {/* Documents Section */}
          <Box sx={{ mt: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold',
                  color: theme === 'dark' ? 'white' : '#012345',
                  fontSize: { xs: '1.25rem', sm: '1.5rem' }
                }}
              >
                Uploaded Documents ({pagination.count})
              </Typography>
              
              {pagination.num_pages > 1 && (
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: theme === 'dark' ? '#b0b0b0' : 'text.secondary',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    Page {pagination.current_page} of {pagination.num_pages}
                  </Typography>
                  <FormControl size="small">
                    <InputLabel 
                      id="page-size-label"
                      sx={{
                        color: theme === 'dark' ? '#b0b0b0' : 'text.secondary',
                        '&.Mui-focused': {
                          color: theme === 'dark' ? '#6281e9' : '#4a5fa5',
                        }
                      }}
                    >
                      Items per page
                    </InputLabel>
                    <Select
                      labelId="page-size-label"
                      value={pagination.page_size}
                      label="Items per page"
                      onChange={handlePageSizeChange}
                      sx={{
                        bgcolor: theme === 'dark' ? '#1e1e1e' : 'white',
                        color: theme === 'dark' ? '#b0b0b0' : 'black',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme === 'dark' ? '#333' : 'default',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme === 'dark' ? '#6281e9' : '#4a5fa5',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme === 'dark' ? '#6281e9' : '#4a5fa5',
                        },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      {pageSizeOptions.map((size) => (
                        <MenuItem key={size} value={size}>
                          {size}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
            </Box>

            {documents.length === 0 ? (
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: { xs: 4, sm: 6 },
                  bgcolor: theme === 'dark' ? '#1a1a1a' : '#f8f9ff',
                  borderRadius: 2,
                  border: theme === 'dark' ? '1px solid #333' : '1px solid #e0e0e0'
                }}
              >
                <Assignment sx={{ 
                  fontSize: { xs: 48, sm: 60 }, 
                  color: theme === 'dark' ? '#666' : '#ccc',
                  mb: 2 
                }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: theme === 'dark' ? '#888' : '#666',
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    mb: 1
                  }}
                >
                  No documents found
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme === 'dark' ? '#666' : '#999',
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  Upload your first document to get started
                </Typography>
              </Box>
            ) : (
              <>
                {/* Mobile/Tablet View - Cards */}
                {(isMobile || isTablet) && (
                  <Box>
                    {documents.map((doc) => (
                      <DocumentCard key={doc.uploaded_document_id} doc={doc} />
                    ))}
                  </Box>
                )}

                {/* Desktop View - Table */}
                {!isMobile && !isTablet && (
                  <TableContainer 
                    component={Paper} 
                    sx={{ 
                      borderRadius: 2,
                      border: theme === 'dark' ? '1px solid #333' : 'none',
                      bgcolor: theme === 'dark' ? '#1e1e1e' : 'white',
                      boxShadow: theme === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Table sx={{ minWidth: 800 }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: theme === 'dark' ? '#0D0C0F' : '#4a5fa5' }}>
                          <TableCell sx={{ 
                            color: 'white', 
                            fontWeight: 600,
                            fontSize: '1rem',
                            py: 2
                          }}>
                            Document ID
                          </TableCell>
                          <TableCell sx={{ 
                            color: 'white', 
                            fontWeight: 600,
                            fontSize: '1rem',
                            py: 2
                          }}>
                            Title
                          </TableCell>
                          <TableCell sx={{ 
                            color: 'white', 
                            fontWeight: 600,
                            fontSize: '1rem',
                            py: 2
                          }}>
                            Created At
                          </TableCell>
                          <TableCell sx={{ 
                            color: 'white', 
                            fontWeight: 600,
                            fontSize: '1rem',
                            py: 2
                          }}>
                            Updated At
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {documents.map((doc, index) => (
                          <TableRow 
                            key={doc.uploaded_document_id}
                            sx={{
                              bgcolor: index % 2 === 0 
                                ? (theme === 'dark' ? '#1a1a1a' : '#f8f9ff')
                                : (theme === 'dark' ? '#1e1e1e' : 'white'),
                              '&:hover': {
                                bgcolor: theme === 'dark' ? '#2a2a2a' : '#f0f2ff',
                                cursor: 'pointer',
                              },
                              transition: 'background-color 0.2s ease',
                            }}
                          >
                            <TableCell sx={{ 
                              fontSize: '0.9rem',
                              color: theme === 'dark' ? 'white' : 'black',
                              py: 2
                            }}>
                              <Chip 
                                label={doc.uploaded_document_id}
                                size="small"
                                sx={{ 
                                  bgcolor: theme === 'dark' ? '#333' : '#e3f2fd',
                                  color: theme === 'dark' ? '#b0b0b0' : '#1565c0',
                                  fontSize: '0.75rem',
                                  fontWeight: 500
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ 
                              fontSize: '0.95rem',
                              color: theme === 'dark' ? 'white' : 'black',
                              fontWeight: 500,
                              py: 2
                            }}>
                              <Box display="flex" alignItems="center">
                                <Assignment sx={{ 
                                  fontSize: '1.2rem', 
                                  color: '#4a5fa5', 
                                  mr: 1 
                                }} />
                                {doc.title}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ 
                              fontSize: '0.9rem',
                              color: theme === 'dark' ? '#b0b0b0' : '#666',
                              py: 2
                            }}>
                              <Box display="flex" alignItems="center">
                                <CalendarToday sx={{ 
                                  fontSize: '1rem', 
                                  color: theme === 'dark' ? '#6281e9' : '#4a5fa5', 
                                  mr: 1 
                                }} />
                                {formatDate(doc.created_at)}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ 
                              fontSize: '0.9rem',
                              color: theme === 'dark' ? '#b0b0b0' : '#666',
                              py: 2
                            }}>
                              <Box display="flex" alignItems="center">
                                <CalendarToday sx={{ 
                                  fontSize: '1rem', 
                                  color: theme === 'dark' ? '#6281e9' : '#4a5fa5', 
                                  mr: 1 
                                }} />
                                {formatDate(doc.updated_at)}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                
                {/* Pagination Controls */}
                {pagination.num_pages > 1 && (
                  <Stack spacing={2} alignItems="center" sx={themedStyles.pagination}>
                    <Pagination
                      count={pagination.num_pages}
                      page={pagination.current_page}
                      onChange={handlePageChange}
                      color="primary"
                      size={isMobile ? "small" : "medium"}
                      showFirstButton
                      showLastButton
                    />
                  </Stack>
                )}
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={handleCloseUploadDialog}
        maxWidth={isMobile ? "sm" : "md"}
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ 
          sx: { 
            borderRadius: isMobile ? 0 : 2, 
            ...themedStyles.dialogPaper,
            m: isMobile ? 0 : 2
          } 
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: theme === 'dark' ? '#0D0C0F' : '#4a5fa5', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center',
          fontSize: { xs: '1.1rem', sm: '1.25rem' },
          p: { xs: 2, sm: 3 }
        }}>
          <CloudUpload sx={{ mr: 1, fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
          Upload Document
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3, 
              color: theme === 'dark' ? '#b0b0b0' : 'text.secondary',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Select the document type and choose files to upload
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel 
              id="document-type-label"
              sx={{
                color: theme === 'dark' ? '#b0b0b0' : 'text.secondary',
                '&.Mui-focused': {
                  color: theme === 'dark' ? '#6281e9' : '#4a5fa5',
                },
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Document Type
            </InputLabel>
            <Select
              labelId="document-type-label"
              value={selectedDocumentType}
              label="Document Type"
              onChange={(e) => setSelectedDocumentType(e.target.value)}
              sx={{
                bgcolor: theme === 'dark' ? '#1e1e1e' : 'white',
                color: theme === 'dark' ? '#b0b0b0' : 'black',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme === 'dark' ? '#333' : 'default',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme === 'dark' ? '#6281e9' : '#4a5fa5',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme === 'dark' ? '#6281e9' : '#4a5fa5',
                },
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              {documentTypes.map((doc) => (
                <MenuItem key={doc.value} value={doc.value}>
                  <Box display="flex" alignItems="center">
                    {React.cloneElement(doc.icon, { 
                      sx: { fontSize: { xs: '1.2rem', sm: '1.5rem' } } 
                    })}
                    <Typography sx={{ 
                      ml: 1, 
                      fontSize: { xs: '0.875rem', sm: '1rem' } 
                    }}>
                      {doc.label}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ 
            border: '2px dashed', 
            borderRadius: 2, 
            p: { xs: 2, sm: 4 }, 
            textAlign: 'center', 
            ...themedStyles.uploadArea 
          }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              size={isMobile ? "medium" : "large"}
              sx={{ 
                mb: 2, 
                ...themedStyles.outlinedButton,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                px: { xs: 2, sm: 3 }
              }}
              fullWidth={isMobile}
            >
              Choose Files
              <input
                type="file"
                hidden
                accept=".jpg,.jpeg,.png,.pdf"
                multiple
                onChange={handleFileSelect}
              />
            </Button>
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme === 'dark' ? '#b0b0b0' : 'text.secondary',
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              Accepted formats: JPG, PNG, PDF (Max 5MB each)
            </Typography>
          </Box>

          {selectedFiles.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography 
                variant="subtitle2" 
                gutterBottom 
                sx={{ 
                  color: theme === 'dark' ? 'white' : 'inherit',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                Selected Files ({selectedFiles.length}):
              </Typography>
              {selectedFiles.map((file, index) => (
                <Paper key={index} sx={{ 
                  p: { xs: 1.5, sm: 2 }, 
                  mb: 1, 
                  ...themedStyles.fileCard 
                }}>
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="space-between"
                    flexDirection={{ xs: 'column', sm: 'row' }}
                    gap={{ xs: 1, sm: 0 }}
                  >
                    <Box display="flex" alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                      {getFileIcon(file.type)}
                      <Box sx={{ ml: 1 }}>
                        <Typography 
                          variant="body2" 
                          fontWeight="medium" 
                          sx={{ 
                            color: theme === 'dark' ? 'white' : 'inherit',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            wordBreak: 'break-word'
                          }}
                        >
                          {file.name}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: theme === 'dark' ? '#b0b0b0' : 'text.secondary',
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                          }}
                        >
                          {formatFileSize(file.size)}
                        </Typography>
                      </Box>
                    </Box>
                    <CheckCircle 
                      color="success" 
                      fontSize={isMobile ? "small" : "small"} 
                    />
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: { xs: 2, sm: 3 }, 
          bgcolor: theme === 'dark' ? '#1e1e1e' : 'grey.50',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Button 
            onClick={handleCloseUploadDialog} 
            sx={{ 
              color: theme === 'dark' ? '#b0b0b0' : 'inherit',
              order: { xs: 2, sm: 1 },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUploadClick}
            variant="contained"
            sx={{
              ...themedStyles.button,
              order: { xs: 1, sm: 2 },
              width: { xs: '100%', sm: 'auto' }
            }}
            disabled={!selectedDocumentType || selectedFiles.length === 0}
            fullWidth={isMobile}
          >
            Upload Documents
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationOpen}
        onClose={handleCancelUpload}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ 
          sx: {
            ...themedStyles.dialogPaper,
            borderRadius: isMobile ? 0 : 2,
            m: isMobile ? 0 : 2
          } 
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          color: theme === 'dark' ? '#6281e9' : '#4a5fa5',
          p: { xs: 2, sm: 3 },
          fontSize: { xs: '1.1rem', sm: '1.25rem' }
        }}>
          <Warning sx={{ 
            mr: 1, 
            color: theme === 'dark' ? '#ffca28' : 'orange',
            fontSize: { xs: '1.2rem', sm: '1.5rem' }
          }} />
          Confirm Upload
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <DialogContentText sx={{ 
            mb: 2, 
            color: theme === 'dark' ? '#b0b0b0' : 'text.secondary',
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}>
            Please confirm the upload of the following documents:
          </DialogContentText>
          
          {pendingUpload && (
            <Box>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 2, 
                  color: theme === 'dark' ? '#6281e9' : '#4a5fa5',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                Document Type: {pendingUpload.docTypeLabel}
              </Typography>
              
              <Divider sx={{ mb: 2, bgcolor: theme === 'dark' ? '#333' : undefined }} />
              
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 1, 
                  color: theme === 'dark' ? 'white' : 'inherit',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                Files to Upload:
              </Typography>
              
              {pendingUpload.files.map((file, index) => (
                <Paper key={index} sx={{ 
                  p: { xs: 1.5, sm: 2 }, 
                  mb: 1, 
                  ...themedStyles.fileCard 
                }}>
                  <Box display="flex" alignItems="center">
                    {getFileIcon(file.type)}
                    <Box sx={{ ml: 1 }}>
                      <Typography 
                        variant="body2" 
                        fontWeight="medium" 
                        sx={{ 
                          color: theme === 'dark' ? 'white' : 'inherit',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          wordBreak: 'break-word'
                        }}
                      >
                        {file.name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: theme === 'dark' ? '#b0b0b0' : 'text.secondary',
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }
                        }}
                      >
                        {formatFileSize(file.size)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: { xs: 2, sm: 3 }, 
          bgcolor: theme === 'dark' ? '#1e1e1e' : 'white',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Button 
            onClick={handleCancelUpload} 
            sx={{ 
              color: theme === 'dark' ? '#b0b0b0' : 'inherit',
              order: { xs: 2, sm: 1 },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmUpload}
            variant="contained"
            sx={{
              ...themedStyles.button,
              order: { xs: 1, sm: 2 },
              width: { xs: '100%', sm: 'auto' }
            }}
            autoFocus
          >
            Confirm Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ 
          vertical: 'bottom', 
          horizontal: isMobile ? 'center' : 'center' 
        }}
        sx={{
          '& .MuiSnackbarContent-root': {
            minWidth: { xs: '90%', sm: 'auto' }
          }
        }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={error ? 'error' : 'success'}
          sx={{
            ...themedStyles.snackbarAlert,
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          {error || successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}