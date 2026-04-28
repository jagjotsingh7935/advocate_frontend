import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import excel from '../assets/excel.svg';
import {
  GetApp as GetAppIcon,
  FileDownload as FileDownloadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  CloudDownload as CloudDownloadIcon
} from '@mui/icons-material';
import { generateExcelTemplate, uploadExcel } from '../api/Api';
import useMyContext from '../usercontext/useMyContext';

const GenerateExcelTemplate = () => {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState('initial'); // 'initial', 'generated', 'uploaded'
  const [templateType, setTemplateType] = useState('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const theme2 = useTheme();
  const isMobile = useMediaQuery(theme2.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme2.breakpoints.between('md', 'lg'));
  const { theme } = useMyContext();

  const handleGenerate = async () => {
    if (!templateType.trim()) {
      setError('Please enter a template type');
      return;
    }

    setError(null);
    setUrl(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('type', templateType);

    try {
      const data = await generateExcelTemplate(formData);
      setUrl(data.excel_url);
      setPhase('generated');
    } catch (err) {
      setError(err.error || 'Failed to generate template');
      setPhase('initial');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setOpenConfirmDialog(true);
    }
  };

  const handleConfirmUpload = async (saveToDatabase) => {
    setOpenConfirmDialog(false);
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('confirm_upload', saveToDatabase);

      await uploadExcel(formData);
      setPhase('uploaded');
      setSelectedFile(null);
    } catch (err) {
      setError(err.error || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getMainContentMargin = () => {
    if (isMobile) return 0;
    if (isTablet) return '240px';
    return '280px';
  };

  const isSuccess = phase === 'generated' || phase === 'uploaded';

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: { xs: 2, sm: 3, md: 4 },
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        mb: 10,
        backgroundColor: theme === 'dark' ? '#121212' : 'inherit',
        color: theme === 'dark' ? 'white' : 'inherit'
      }}
    >
      <Container maxWidth="lg" sx={{ mt: { xs: 6, md: 2 } }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  fontWeight: 'bold',
                  background: theme === 'dark' ? 'white' : '#012345',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px',
                  lineHeight: 1.2,
                  color: theme === 'dark' ? 'white' : 'inherit'
                }}
              >
                Excel Template Generator
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  color: theme === 'dark' ? 'white' : 'rgba(30, 41, 59, 0.7)',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontWeight: 400,
                  mt: 0.5
                }}
              >
                Generate and download Excel templates instantly
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Main Content Card */}
        <Card
          sx={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 8px 32px rgba(0, 0, 0, 0.04)',
            borderRadius: 4,
            border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(6, 182, 212, 0.1)',
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: theme === 'dark' ? '#1e1e1e' : 'white',
            color: theme === 'dark' ? 'white' : 'inherit',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: theme === 'dark' ? '#ffffff' : 'inherit'
            }
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            {/* Template Type Input */}
            {phase === 'initial' && (
              <TextField
                fullWidth
                label="Template Type"
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value)}
                sx={{
                  mb: 3,
                  '& .MuiInputLabel-root': {
                    color: theme === 'dark' ? 'white' : 'inherit'
                  },
                  '& .MuiOutlinedInput-root': {
                    color: theme === 'dark' ? 'white' : 'inherit',
                    '& fieldset': {
                      borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'inherit'
                    },
                    '&:hover fieldset': {
                      borderColor: theme === 'dark' ? 'white' : 'inherit'
                    }
                  }
                }}
                variant="outlined"
              />
            )}

            {/* Status Section */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: loading 
                    ? 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)'
                    : isSuccess
                      ? '#4a5fa5'
                      : error
                        ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                        : theme === 'dark' ? '#1e1e1e' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  boxShadow: loading 
                    ? '0 0 40px rgba(6, 182, 212, 0.4)'
                    : isSuccess
                      ? '0 0 40px rgba(16, 185, 129, 0.4)'
                      : error
                        ? '0 0 40px rgba(239, 68, 68, 0.4)'
                        : 'none'
                }}
              >
                {loading ? (
                  <CircularProgress size={40} sx={{ color: theme === 'dark' ? 'white' : 'white' }} />
                ) : isSuccess ? (
                  <CheckCircleIcon sx={{ fontSize: 48, color: theme === 'dark' ? 'white' : 'white' }} />
                ) : error ? (
                  <ErrorIcon sx={{ fontSize: 48, color: theme === 'dark' ? 'white' : 'white' }} />
                ) : (
                  <img 
                    src={excel}
                    alt="Excel Icon" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain', filter: theme === 'dark' ? 'invert(1)' : 'none' }}
                  />
                )}
              </Box>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: theme === 'dark' ? 'white' : '#1e293b',
                  mb: 1,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  textAlign: 'center'
                }}
              >
                {loading 
                  ? 'Processing...'
                  : phase === 'uploaded'
                    ? 'Template Submitted!'
                    : error
                      ? 'Operation Failed'
                      : phase === 'generated'
                        ? 'Template Ready!'
                        : 'Ready to Generate'
                }
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(30, 41, 59, 0.6)',
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                  maxWidth: 400,
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                {loading 
                  ? 'Please wait while we process your request...'
                  : phase === 'uploaded'
                    ? 'Your template is submitted successfully.'
                    : phase === 'generated'
                      ? 'Your Excel template has been generated successfully and is ready for download.'
                      : error
                        ? 'There was an issue processing your request. Please try again.'
                        : 'Enter a template type and click the button below to generate a new Excel template.'
                }
              </Typography>
            </Box>

            {error && (
              <Alert
                severity="error"
                icon={<ErrorIcon />}
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  background: theme === 'dark' ? 'rgba(254, 242, 242, 0.1)' : 'linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)',
                  border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                  '& .MuiAlert-icon': {
                    color: theme === 'dark' ? 'white' : '#DC2626'
                  }
                }}
              >
                <Typography variant="body2" sx={{ color: theme === 'dark' ? 'white' : '#991B1B', fontWeight: 500 }}>
                  {error}
                </Typography>
              </Alert>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {phase === 'initial' && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={loading ? <RefreshIcon /> : <GetAppIcon />}
                  onClick={handleGenerate}
                  disabled={loading}
                  sx={{
                    background: theme === 'dark' ? '#ffffff' : '#4a5fa5',
                    color: theme === 'dark' ? '#000000' : 'white',
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 3, sm: 4 },
                    borderRadius: 3,
                    textTransform: 'none',
                    boxShadow: '0 8px 32px rgba(6, 182, 212, 0.3)',
                    border: 'none',
                    minWidth: { xs: 160, sm: 180 },
                    '&:hover': {
                      background: theme === 'dark' ? '#e0e0e0' : '#4a5fa5',
                      boxShadow: 'none'
                    },
                    '&:disabled': {
                      background: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)',
                      boxShadow: 'none'
                    }
                  }}
                >
                  {loading ? 'Generating...' : 'Generate Template'}
                </Button>
              )}

              {phase === 'generated' && url && (
                <>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<CloudDownloadIcon />}
                    onClick={handleDownload}
                    sx={{
                      color: theme === 'dark' ? 'white' : '#012345',
                      borderColor: theme === 'dark' ? 'white' : '#012345',
                      fontWeight: 600,
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      py: { xs: 1.5, sm: 2 },
                      px: { xs: 3, sm: 4 },
                      borderRadius: 3,
                      textTransform: 'none',
                      borderWidth: 2,
                      minWidth: { xs: 160, sm: 180 },
                      '&:hover': {
                        backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#4a5fa5',
                        color: theme === 'dark' ? 'white' : 'white',
                        borderColor: theme === 'dark' ? 'white' : '#4a5fa5',
                        boxShadow: theme === 'dark' ? '0 8px 32px rgba(255, 255, 255, 0.2)' : '0 8px 32px #4a5fa5'
                      }
                    }}
                  >
                    Download Now
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<FileDownloadIcon />}
                    component="label"
                    sx={{
                      color: theme === 'dark' ? 'white' : '#012345',
                      borderColor: theme === 'dark' ? 'white' : '#012345',
                      fontWeight: 600,
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      py: { xs: 1.5, sm: 2 },
                      px: { xs: 3, sm: 4 },
                      borderRadius: 3,
                      textTransform: 'none',
                      borderWidth: 2,
                      minWidth: { xs: 160, sm: 180 },
                      '&:hover': {
                        backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#4a5fa5',
                        color: theme === 'dark' ? 'white' : 'white',
                        borderColor: theme === 'dark' ? 'white' : '#4a5fa5',
                        boxShadow: theme === 'dark' ? '0 8px 32px rgba(255, 255, 255, 0.2)' : '0 8px 32px #4a5fa5'
                      }
                    }}
                  >
                    Upload Excel
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      hidden
                      onChange={handleFileChange}
                    />
                  </Button>
                </>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <Dialog
          open={openConfirmDialog}
          onClose={() => setOpenConfirmDialog(false)}
          sx={{
            '& .MuiDialog-paper': {
              backgroundColor: theme === 'dark' ? '#1e1e1e' : 'white',
              color: theme === 'dark' ? 'white' : 'inherit'
            }
          }}
        >
          <DialogTitle sx={{ color: theme === 'dark' ? 'white' : 'inherit' }}>
            Save to Database
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: theme === 'dark' ? 'white' : 'inherit' }}>
              Would you like to save the uploaded Excel file to the database?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => handleConfirmUpload('yes')}
              sx={{ color: theme === 'dark' ? 'white' : 'inherit' }}
            >
              Yes
            </Button>
            <Button 
              onClick={() => handleConfirmUpload('no')}
              sx={{ color: theme === 'dark' ? 'white' : 'inherit' }}
            >
              No
            </Button>
          </DialogActions>
        </Dialog>

        {/* Info Card */}
        <Card
          sx={{
            mt: 4,
            background: theme === 'dark' ? '#333333' : '#4a5fa5',
            color: theme === 'dark' ? 'white' : 'white',
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CloudDownloadIcon sx={{ mr: 1.5, color: theme === 'dark' ? 'white' : '#d9dce2ff' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme === 'dark' ? 'white' : 'inherit' }}>
                Template Information
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6 }}>
              The generated Excel template includes pre-formatted columns and sample data to help you get started quickly.
              Download the template and customize it according to your specific requirements.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default GenerateExcelTemplate;