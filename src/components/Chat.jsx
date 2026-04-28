import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Tabs, 
  Tab, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  Fade,
  useTheme,
  alpha,
  Dialog,
  DialogContent,
  DialogActions,
  Autocomplete,
  TextField,
  useMediaQuery,
  Stack,
  Grid,
  Collapse
} from '@mui/material';
import { 
  Visibility, 
  Download, 
  Description, 
  Person, 
  Refresh,
  ExpandMore,
  ExpandLess,
  Close,
  Menu as MenuIcon
} from '@mui/icons-material';
import { chatGet, chatGetMembers, chatGetMembersdata } from '../api/Api';
import useMyContext from '../usercontext/useMyContext';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`document-tabpanel-${index}`}
      aria-labelledby={`document-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Fade in={value === index} timeout={300}>
          <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            {children}
          </Box>
        </Fade>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `document-tab-${index}`,
    'aria-controls': `document-tabpanel-${index}`,
  };
}

export default function Chat() {
  const [showButtons, setShowButtons] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  const [membersData, setMembersData] = useState([]);
  const [memberDocumentData, setMemberDocumentData] = useState(null);
  const [isMemberView, setIsMemberView] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [loadingSelf, setLoadingSelf] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { theme } = useMyContext();
  const theme2 = useTheme();
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme2.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme2.breakpoints.down('md'));
  const isLargeScreen = useMediaQuery(theme2.breakpoints.up('lg'));

  const handleMainButtonClick = () => {
    setShowButtons(!showButtons);
  };

  const handlegetdata = async () => {
    setLoadingSelf(true);
    setError(null);
    setIsMemberView(false);
    setMemberDocumentData(null);
    try {
      const res = await chatGet();
      console.log('Self Documents:', res);
      setDocumentData(res);
    } catch (err) {
      setError('Failed to load document data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoadingSelf(false);
    }
  };

  const getMemberData = async () => {
    setLoadingMembers(true);
    setError(null);
    setDocumentData(null);
    setMemberDocumentData(null);
    setIsMemberView(false);
    try {
      const res = await chatGetMembers();
      console.log('Members Data:', res);
      setMembersData(res.members || []);
    } catch (err) {
      setError('Failed to load member data. Please try again.');
      console.error('Error fetching member data:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleMemberSelect = async (event, value) => {
    if (value) {
      setLoadingSelf(true);
      setError(null);
      setDocumentData(null);
      setIsMemberView(true);
      try {
        const res = await chatGetMembersdata(value.client_member_id);
        console.log('Member Documents:', res);
        setMemberDocumentData(res);
      } catch (err) {
        setError('Failed to load member document data. Please try again.');
        console.error('Error fetching member document data:', err);
      } finally {
        setLoadingSelf(false);
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getDocumentCategories = () => {
    if (isMemberView && memberDocumentData && memberDocumentData.Documents && memberDocumentData.Documents[0]) {
      const documents = memberDocumentData.Documents[0];
      return Object.entries(documents).map(([category, docs]) => ({
        category: category.toUpperCase(),
        documents: docs
      }));
    } else if (documentData && documentData.Documents && documentData.Documents[0]) {
      const documents = documentData.Documents[0];
      return Object.entries(documents).map(([category, docs]) => ({
        category: category.toUpperCase(),
        documents: docs
      }));
    }
    return [];
  };

  const documentCategories = getDocumentCategories();

  const formatDate = (dateString) => {
    try {
      const cleanDate = dateString.replace(' IST', '');
      const date = new Date(cleanDate);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getFileIcon = (fileName) => {
    if (fileName.toLowerCase().includes('.pdf')) {
      return <Description color="error" fontSize="small" />;
    }
    return <Description color="primary" fontSize="small" />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'PAN': 'success',
      'ITR': 'info',
      'TAX': 'warning',
      'AADHAAR': 'secondary',
      'ADHAR': 'secondary',
      'ANOTHER CHECK': 'warning',
      'CHECK': 'info'
    };
    return colors[category] || 'primary';
  };

  const convertBase64ToBlobUrl = (base64String) => {
    try {
      const byteCharacters = atob(base64String);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error converting base64 to Blob:', error);
      return null;
    }
  };

  const handleViewDocument = (base64Content) => {
    const pdfUrl = convertBase64ToBlobUrl(base64Content);
    if (pdfUrl) {
      setSelectedPdfUrl(pdfUrl);
      setOpenDialog(true);
    } else {
      setError('Failed to load PDF document. Invalid format.');
    }
  };

  const handleDownloadDocument = (base64Content, fileName) => {
    const pdfUrl = convertBase64ToBlobUrl(base64Content);
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pdfUrl);
    } else {
      setError('Failed to download PDF document. Invalid format.');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    if (selectedPdfUrl) {
      URL.revokeObjectURL(selectedPdfUrl);
      setSelectedPdfUrl(null);
    }
  };

  const getThemedStyles = () => ({
    mainContainer: {
      bgcolor: theme === 'dark' ? '#121212' : '#f5f5f5', 
      minHeight: '100vh'
    },
    headerCard: {
      background: theme === 'dark' ? '#0D0C0F' : 'transparent',
      color:theme === 'dark' ? 'white' : 'dark',
      border: 1,
      borderColor: theme === 'dark' ? '#6281e9' : 'transparent'
    },
    controlCard: {
      bgcolor: 'transparent',
      border: theme === 'dark' ? '1px solid #333' : 'none'
    },
    primaryButton: {
      bgcolor: '#6281e9',
      color: 'white',
      '&:hover': {
        bgcolor: theme === 'dark' ? '#5270d8' : '#516bd6'
      }
    },
    outlinedButton: {
      borderColor: '#6281e9',
      color: '#6281e9',
      '&:hover': {
        borderColor: theme === 'dark' ? '#5270d8' : 'primary.dark',
        bgcolor: theme === 'dark' ? alpha('#6281e9', 0.1) : alpha(theme2.palette.primary.main, 0.1)
      }
    },
    loadingCard: {
      bgcolor: theme === 'dark' ? '#1e1e1e' : 'white',
      border: theme === 'dark' ? '1px solid #333' : 'none'
    },
    clientCard: {
      bgcolor: theme === 'dark' ? '#1e1e1e' : 'white',
      border: theme === 'dark' ? '1px solid #333' : 'none'
    },
    documentPaper: {
      bgcolor: theme === 'dark' ? '#1e1e1e' : 'white',
      border: theme === 'dark' ? '1px solid #333' : 'none'
    },
    tabsContainer: {
      bgcolor: theme === 'dark' 
        ? alpha('#6281e9', 0.1) 
        : alpha(theme2.palette.primary.main, 0.05),
      borderBottom: 1,
      borderColor: theme === 'dark' ? '#333' : 'divider'
    },
    tableHead: {
      bgcolor: theme === 'dark' 
        ? alpha('#6281e9', 0.2) 
        : alpha(theme2.palette.primary.main, 0.08)
    },
    tableRow: {
      '&:hover': {
        bgcolor: theme === 'dark' 
          ? alpha('#6281e9', 0.1) 
          : alpha(theme2.palette.primary.main, 0.04)
      },
      borderBottom: theme === 'dark' ? '1px solid #333' : 'default'
    },
    emptyStateCard: {
      bgcolor: theme === 'dark' ? '#1e1e1e' : 'white',
      border: theme === 'dark' ? '1px solid #333' : 'none'
    },
    iconButton: (color) => ({
      bgcolor: theme === 'dark' 
        ? alpha(theme2.palette[color].main, 0.2) 
        : alpha(theme2.palette[color].main, 0.1),
      '&:hover': {
        bgcolor: theme === 'dark' 
          ? alpha(theme2.palette[color].main, 0.3) 
          : alpha(theme2.palette[color].main, 0.2)
      }
    })
  });

  const themedStyles = getThemedStyles();

  // Mobile document card component for better mobile experience
  const MobileDocumentCard = ({ doc, category }) => (
    <Card 
      elevation={1} 
      sx={{ 
        mb: 2,
        bgcolor: theme === 'dark' ? '#1e1e1e' : 'white',
        border: theme === 'dark' ? '1px solid #333' : 'none'
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="center" gap={1} flex={1}>
            {getFileIcon(doc.document_name)}
            <Box flex={1}>
              <Typography 
                variant="body2" 
                fontWeight="500"
                sx={{ 
                  color: theme === 'dark' ? 'white' : 'inherit',
                  wordBreak: 'break-word'
                }}
                noWrap={!isMobile}
              >
                {doc.document_name}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: theme === 'dark' ? '#b0b0b0' : 'text.secondary',
                  display: 'block'
                }}
              >
                {formatDate(doc.Uploaded_at)}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box display="flex" gap={1} justifyContent="flex-end">
          <Tooltip title="View Document">
            <IconButton 
              color="primary"
              size="small"
              onClick={() => handleViewDocument(doc.file_content)}
              sx={themedStyles.iconButton('primary')}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download Document">
            <IconButton 
              color="success"
              size="small"
              onClick={() => handleDownloadDocument(doc.file_content, doc.document_name)}
              sx={themedStyles.iconButton('success')}
            >
              <Download fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      gap={3}
      sx={{ 
        mt: 2,
        mb:{xs:15,md:0},
        p: { xs: 1, sm: 2 },
        ...themedStyles.mainContainer
      }}
    >
      {/* Header Section */}
      <Card 
        elevation={3} 
        sx={{ 
          width: '100%', 
          textAlign:'center',
          boxShadow:'none',
          ...themedStyles.headerCard
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            fontWeight="bold" 
            gutterBottom
          >
            Advocate Uploaded Documents
          </Typography>
          <Typography 
            variant={isMobile ? "body2" : "body1"} 
            sx={{ opacity: 0.9 }}
          >
            Manage and view your documents organized by categories
          </Typography>
        </CardContent>
      </Card>

      {/* Control Buttons */}
      <Card 
        elevation={theme === 'dark' ? 0 : 2} 
        sx={{ 
          width: '100%',
          ...themedStyles.controlCard                                  
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            <Button
              variant="contained"
              onClick={handleMainButtonClick}
              endIcon={showButtons ? <ExpandLess /> : <ExpandMore />}
              sx={{ 
                minWidth: { xs: '100%', sm: 150 },
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                ...themedStyles.primaryButton
              }}
              fullWidth={isMobile}
            >
              {showButtons ? 'Hide Options' : 'Show Options'}
            </Button>
            
            <Collapse in={showButtons}>
              <Stack 
                direction={isMobile ? "column" : "row"} 
                spacing={2}
                sx={{ mt: 2 }}
              >
                <Button
                  variant="outlined"
                  onClick={handlegetdata}
                  disabled={loadingSelf}
                  startIcon={loadingSelf ? <CircularProgress size={16} color='#6281e9' /> : <Refresh />}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                    ...themedStyles.outlinedButton
                  }}
                  fullWidth={isMobile}
                >
                  {loadingSelf ? 'Loading...' : 'Self Documents'}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={getMemberData}
                  disabled={loadingMembers}
                  startIcon={loadingMembers ? <CircularProgress size={16} color="secondary" /> : null}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                    borderColor: theme === 'dark' ? 'secondary.main' : 'secondary.main',
                    color: theme === 'dark' ? 'secondary.main' : 'secondary.main',
                    '&:hover': {
                      borderColor: theme === 'dark' ? 'secondary.dark' : 'secondary.dark',
                      bgcolor: theme === 'dark' ? alpha(theme2.palette.secondary.main, 0.1) : alpha(theme2.palette.secondary.main, 0.1)
                    }
                  }}
                  fullWidth={isMobile}
                >
                  {loadingMembers ? 'Loading...' : 'Member Documents'}
                </Button>
              </Stack>
            </Collapse>
          </Stack>
        </CardContent>
      </Card>

      {/* Member Autocomplete */}
      {membersData.length > 0 && (
        <Card 
          elevation={theme === 'dark' ? 0 : 2} 
          sx={{ 
            width: '100%',
            ...themedStyles.clientCard
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Autocomplete
              options={membersData}
              getOptionLabel={(option) => option.full_name}
              onChange={handleMemberSelect}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Member"
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    '& .MuiInputLabel-root': {
                      color: theme === 'dark' ? '#aaa' : '#555',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: theme === 'dark' ? '#6281e9' : 'primary.main',
                    },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      color: theme === 'dark' ? 'white' : 'black',
                      bgcolor: theme === 'dark' ? '#1e1e1e' : 'white',
                      '& fieldset': {
                        borderColor: theme === 'dark' ? '#333' : 'default',
                      },
                      '&:hover fieldset': {
                        borderColor: theme === 'dark' ? '#6281e9' : 'primary.main',
                      },
                    },
                  }}
                />
              )}
              sx={{
                width: '100%',
                maxWidth: { xs: '100%', sm: 400 },
                mb: 2,
                '& .MuiAutocomplete-paper': {
                  bgcolor: theme === 'dark' ? '#1e1e1e' : 'white',
                  color: theme === 'dark' ? 'white' : 'black',
                },
                '& .MuiAutocomplete-option': {
                  bgcolor: theme === 'dark' ? '#1e1e1e' : 'white',
                  '&[aria-selected="true"]': {
                    bgcolor: theme === 'dark' ? '#333' : '#e3f2fd',
                  },
                  '&:hover': {
                    bgcolor: theme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                  },
                },
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            width: '100%',
            bgcolor: theme === 'dark' ? alpha('#f44336', 0.1) : undefined,
            color: theme === 'dark' ? '#f44336' : undefined,
            border: theme === 'dark' ? '1px solid #f44336' : 'none'
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {(loadingSelf || loadingMembers) && (
        <Card 
          elevation={theme === 'dark' ? 0 : 2} 
          sx={{ 
            width: '100%',
            ...themedStyles.loadingCard
          }}
        >
          <CardContent>
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
              <Box textAlign="center">
                <CircularProgress 
                  size={isMobile ? 40 : 60} 
                  thickness={4} 
                  sx={{ color: '#6281e9' }}
                />
                <Typography 
                  variant={isMobile ? "body1" : "h6"} 
                  sx={{ 
                    mt: 2,
                    color: theme === 'dark' ? 'white' : 'inherit'
                  }}
                >
                  Loading Documents...
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme === 'dark' ? '#b0b0b0' : 'text.secondary'
                  }}
                >
                  Please wait while we fetch your data
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* PDF Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth={isMobile ? "sm" : "lg"}
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          style: {
            backgroundColor: theme === 'dark' ? '#1e1e1e' : 'white',
            border: theme === 'dark' ? '1px solid #333' : 'none'
          }
        }}
      >
        <DialogContent sx={{ p: 0, height: isMobile ? '100vh' : '80vh' }}>
          {selectedPdfUrl && (
            <iframe
              src={selectedPdfUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="PDF Document"
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: theme === 'dark' ? '#1e1e1e' : 'white' }}>
          <Button
            onClick={handleCloseDialog}
            startIcon={<Close />}
            sx={{ ...themedStyles.outlinedButton, textTransform: 'none' }}
            fullWidth={isMobile}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Display */}
      {(documentData || memberDocumentData) && !(loadingSelf || loadingMembers) && (
        <Fade in={!!(documentData || memberDocumentData)}>
          <Box sx={{ width: '100%' }}>
            {/* Client Information */}
            <Card 
              elevation={theme === 'dark' ? 0 : 3} 
              sx={{ 
                mb: 3,
                ...themedStyles.clientCard
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Person 
                    color="primary" 
                    fontSize={isMobile ? "medium" : "large"} 
                    sx={{ color: '#6281e9' }}
                  />
                  <Box>
                    <Typography 
                      variant={isMobile ? "h6" : "h5"} 
                      fontWeight="bold"
                      sx={{ 
                        color: theme === 'dark' ? 'white' : 'inherit',
                        wordBreak: 'break-word'
                      }}
                    >
                      {isMemberView ? memberDocumentData?.client_member : documentData?.client_name}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            
            {/* Document Tabs */}
            {documentCategories.length > 0 && (
              <Paper 
                elevation={theme === 'dark' ? 0 : 4} 
                sx={{ 
                  borderRadius: 3, 
                  overflow: 'hidden',
                  ...themedStyles.documentPaper
                }}
              >
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="document categories"
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  sx={{ 
                    ...themedStyles.tabsContainer,
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: isMobile ? '0.85rem' : '0.95rem',
                      minHeight: isMobile ? 48 : 56,
                      color: theme === 'dark' ? '#b0b0b0' : 'inherit',
                      '&.Mui-selected': {
                        color: theme === 'dark' ? '#6281e9' : '#6281e9'
                      }                                                                           
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#6281e9'
                    }
                  }}
                >
                  {documentCategories.map((category, index) => (
                    <Tab
                      key={category.category}
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Description fontSize="small" />
                          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                            {category.category}
                          </Box>
                          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                            {category.category.length > 8 ? `${category.category.substring(0, 8)}...` : category.category}
                          </Box>
                          <Chip 
                            label={category.documents.length} 
                            size="small" 
                            color={getCategoryColor(category.category)}
                            sx={{ 
                              fontWeight: 'bold',
                              bgcolor: '#6281e9',
                              color: 'white',
                              minWidth: 'auto'
                            }}
                          />
                        </Box>
                      }
                      {...a11yProps(index)}
                    />
                  ))}
                </Tabs>

                {documentCategories.map((category, index) => (
                  <TabPanel key={category.category} value={tabValue} index={index}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                      <Typography 
                        variant={isMobile ? "body1" : "h6"} 
                        fontWeight="bold"
                        sx={{ 
                          color: theme === 'dark' ? 'white' : 'inherit',
                          wordBreak: 'break-word'
                        }}
                      >
                        {category.category} Documents
                      </Typography>
                      <Chip 
                        label={`${category.documents.length} files`}
                        color={getCategoryColor(category.category)}
                        variant="outlined"
                        size="small"
                        sx={{
                          borderColor: theme === 'dark' 
                            ? theme2.palette[getCategoryColor(category.category)].main
                            : undefined,
                          color: theme === 'dark' 
                            ? theme2.palette[getCategoryColor(category.category)].main
                            : undefined
                        }}
                      />
                    </Box>
                    
                    {/* Desktop/Tablet Table View */}
                    {!isMobile ? (
                      <TableContainer 
                        sx={{ 
                          borderRadius: 2,
                          border: theme === 'dark' ? '1px solid #333' : 'none',
                          overflowX: 'auto'
                        }}
                      >
                        <Table stickyHeader={isTablet}>
                          <TableHead sx={themedStyles.tableHead}>
                            <TableRow>
                              <TableCell 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  fontSize: '0.95rem',
                                  color: theme === 'dark' ? 'white' : 'inherit',
                                  minWidth: 200
                                }}
                              >
                                Document
                              </TableCell>
                              <TableCell 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  fontSize: '0.95rem',
                                  color: theme === 'dark' ? 'white' : 'inherit',
                                  minWidth: 150
                                }}
                              >
                                Upload Date
                              </TableCell>
                              <TableCell 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  fontSize: '0.95rem',
                                  color: theme === 'dark' ? 'white' : 'inherit',
                                  minWidth: 120
                                }} 
                                align="center"
                              >
                                Actions
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {category.documents.map((doc, docIndex) => (
                              <TableRow 
                                key={docIndex} 
                                hover 
                                sx={{ 
                                  '&:last-child td': { border: 0 },
                                  ...themedStyles.tableRow
                                }}
                              >
                                <TableCell>
                                  <Box display="flex" alignItems="center" gap={2}>
                                    {getFileIcon(doc.document_name)}
                                    <Box>
                                      <Typography 
                                        variant="body1" 
                                        fontWeight="500"
                                        sx={{ 
                                          color: theme === 'dark' ? 'white' : 'inherit',
                                          wordBreak: 'break-word'
                                        }}
                                      >
                                        {doc.document_name}
                                      </Typography>
                                      <Typography 
                                        variant="caption" 
                                        sx={{ 
                                          color: theme === 'dark' ? '#b0b0b0' : 'text.secondary'
                                        }}
                                      >
                                        PDF Document
                                      </Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: theme === 'dark' ? '#b0b0b0' : 'text.secondary'
                                    }}
                                  >
                                    {formatDate(doc.Uploaded_at)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Box display="flex" gap={1} justifyContent="center">
                                    <Tooltip title="View Document">
                                      <IconButton 
                                        color="primary"
                                        onClick={() => handleViewDocument(doc.file_content)}
                                        sx={themedStyles.iconButton('primary')}
                                      >
                                        <Visibility fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Download Document">
                                      <IconButton 
                                        color="success"
                                        onClick={() => handleDownloadDocument(doc.file_content, doc.document_name)}
                                        sx={themedStyles.iconButton('success')}
                                      >
                                        <Download fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      /* Mobile Card View */
                      <Stack spacing={1}>
                        {category.documents.map((doc, docIndex) => (
                          <MobileDocumentCard 
                            key={docIndex}
                            doc={doc}
                            category={category.category}
                          />
                        ))}
                      </Stack>
                    )}
                  </TabPanel>
                ))}
              </Paper>
            )}
          </Box>
        </Fade>
      )}

      {/* Empty State */}
      {!documentData && !memberDocumentData && !(loadingSelf || loadingMembers) && membersData.length === 0 && (
        <Card 
          elevation={theme === 'dark' ? 0 : 2} 
          sx={{ 
            width: '100%',
            ...themedStyles.emptyStateCard
          }}
        >
          <CardContent>
            <Box textAlign="center" py={isMobile ? 4 : 6}>
              <Description 
                sx={{ 
                  fontSize: isMobile ? 60 : 80, 
                  color: theme === 'dark' ? '#555' : 'text.disabled', 
                  mb: 2 
                }} 
              />
              <Typography 
                variant={isMobile ? "body1" : "h6"} 
                gutterBottom
                sx={{ 
                  color: theme === 'dark' ? '#b0b0b0' : 'text.secondary'
                }}
              >
                No Documents Loaded
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme === 'dark' ? '#888' : 'text.secondary',
                  px: { xs: 2, sm: 0 }
                }}
              >
                Click "Show Options" and select "Self Documents" or choose a member to fetch document data
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}