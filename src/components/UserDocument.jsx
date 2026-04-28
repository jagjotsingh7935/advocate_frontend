import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CardActionArea,
  Tabs,
  Tab,
  Badge,
  InputBase,
  Fade,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Download,
  Visibility,
  Description,
  Image,
  Close,
  CloudDownload,
  DateRange,
  Person,
  FolderOpen,
  Folder,
  Search,
  PlayArrow,
  Pause
} from '@mui/icons-material';
import library from '../assets/library.svg';
import useMyContext from '../usercontext/useMyContext';
import { getClientMemberTab, getMemberDocumentsbyid } from '../api/Api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  const { theme } = useMyContext();
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`document-tabpanel-${index}`}
      aria-labelledby={`document-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Fade in={true} timeout={300}>
          <Box sx={{ 
            p: { xs: 1.5, sm: 2, md: 3 }, 
            bgcolor: theme === 'dark' ? '#0D0C0F' : 'white' 
          }}>
            {children}
          </Box>
        </Fade>
      )}
    </div>
  );
}

export default function UserDocument() {
  const [documents, setDocuments] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState(null);
  const { theme } = useMyContext();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down('md'));

  const fetchDocumenttabs = async () => {
    try {
      const res = await getClientMemberTab();
      setTabs(res.data || []);
    } catch (error) {
      console.error('Error fetching tabs:', error);
    }
  };

  const fetchTabDocumentsById = async (id) => {
    try {
      const res = await getMemberDocumentsbyid(id);
      return res;
    } catch (error) {
      console.error('Error fetching documents for tab:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await fetchDocumenttabs();
      setLoading(false);
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (tabValue > 0 && tabs[tabValue - 1]) {
        setLoading(true);
        const tabId = tabs[tabValue - 1].id;
        const res = await fetchTabDocumentsById(tabId);
        if (res && res.file_urls) {
          const formattedDocs = res.file_urls.map((url, index) => {
            const extension = url.split('.').pop().toLowerCase();
            let fileType = 'application/octet-stream';
            if (extension === 'pdf') fileType = 'application/pdf';
            else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) fileType = `image/${extension}`;
            else if (['opus', 'webm'].includes(extension)) fileType = `audio/${extension}`;
            return {
              id: `${res.id}-${index}`,
              name: url.split('/').pop(),
              type: extension,
              category: res.name,
              fileType,
              size: 0,
              uploadDate: res.created_at,
              uploadedBy: 'Admin',
              description: res.text || `Document from ${res.name}`,
              downloadUrl: url,
              previewUrl: url
            };
          });
          setDocuments(formattedDocs);
        } else {
          setDocuments([]);
        }
        setLoading(false);
      } else {
        setDocuments([]);
      }
    };
    fetchDocuments();
  }, [tabValue, tabs]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return 'Unknown Size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType === 'application/pdf') {
      return <Description color="error" fontSize={isMobile ? "medium" : "large"} />;
    } else if (fileType.startsWith('audio/')) {
      return <PlayArrow sx={{ color: '#4a5fa5' }} fontSize={isMobile ? "medium" : "large"} />;
    }
    return <Image sx={{ color: '#4a5fa5' }} fontSize={isMobile ? "medium" : "large"} />;
  };

  const getCategoryIcon = (category) => {
    const iconStyle = { color: '#4a5fa5' };
    const icons = {
      'aa': <Description sx={iconStyle} />,
      'kk': <Person sx={iconStyle} />,
    };
    return icons[category] || <Folder sx={iconStyle} />;
  };

  const handleDownload = (doc) => {
    setDownloading(doc.id);
    
    const link = document.createElement('a');
    link.href = doc.downloadUrl;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setDownloading(null);
  };

  const handlePreview = (document) => {
    setSelectedDocument(document);
    setPreviewOpen(true);
    setIsPlaying(false);
  };

  const handleClosePreview = () => {
    if (audioRef) {
      audioRef.pause();
      setIsPlaying(false);
    }
    setPreviewOpen(false);
    setSelectedDocument(null);
  };

  const handleToggleAudio = () => {
    if (audioRef) {
      if (isPlaying) {
        audioRef.pause();
      } else {
        audioRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {});

  const categories = Object.keys(groupedDocuments);
  const allDocuments = documents;

  const filterAndSortDocuments = (docs) => {
    let filtered = docs;
    if (searchQuery) {
      filtered = docs.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };

  const renderDocumentGrid = (docs) => (
    <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
      {docs.map((document) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={document.id} sx={{ bgcolor: theme === 'dark' ? '#0D0C0F' : 'white',width:{xs:'100%',md:'40%'} }}>
          <Card sx={{
            height: '100%',
            cursor: 'pointer',
            bgcolor: theme === 'dark' ? '#0D0C0F' : 'white',
            color: theme === 'dark' ? 'white' : '#012345',
            border: 1,
            borderColor: 'white',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-4px)',
            }
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Avatar
                  sx={{
                    width: { xs: 40, sm: 44, md: 48 },
                    height: { xs: 40, sm: 44, md: 48 },
                    bgcolor: 'transparent',
                    mr: { xs: 1.5, sm: 2 },
                    flexShrink: 0
                  }}
                >
                  {getFileIcon(document.fileType)}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography 
                    variant={isMobile ? "body1" : "subtitle1"} 
                    fontWeight="600" 
                    sx={{ mb: 1 }} 
                    noWrap
                  >
                    {document.name}
                  </Typography>
                  <Chip
                    label={document.category}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(74, 95, 165, 0.1)',
                      color: '#4a5fa5',
                      fontWeight: 500,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                    }}
                  />
                </Box>
              </Box>

              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 2, 
                  height: { xs: 'auto', sm: 40 },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  color: theme === 'dark' ? 'white' : '#012345' 
                }}
              >
                {document.description}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box display="flex" alignItems="center" mb={0.5}>
                  <Person fontSize="small" sx={{ mr: 1, color: '#4a5fa5' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ color: theme === 'dark' ? 'white' : '#012345' }}>
                    {document.uploadedBy}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={0.5}>
                  <DateRange fontSize="small" sx={{ mr: 1, color: '#4a5fa5' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ color: theme === 'dark' ? 'white' : '#012345' }}>
                    {new Date(document.uploadDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={1} mt={2}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={!isMobile && <Visibility />}
                  onClick={() => handlePreview(document)}
                  fullWidth={isMobile}
                  sx={{
                    flex: 1,
                    borderColor: '#4a5fa5',
                    color: '#4a5fa5',
                    '&:hover': {
                      borderColor: '#4a5fa5',
                      backgroundColor: 'rgba(74, 95, 165, 0.1)'
                    }
                  }}
                >
                  {isMobile ? <Visibility sx={{ mr: 1 }} /> : null}
                  Preview
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={downloading === document.id ?
                    <CircularProgress size={16} sx={{ color: 'white' }} /> :
                    !isMobile && <Download />
                  }
                  onClick={() => handleDownload(document)}
                  disabled={downloading === document.id}
                  fullWidth={isMobile}
                  sx={{
                    flex: 1,
                    bgcolor: '#4a5fa5',
                    '&:hover': {
                      bgcolor: '#3d5194'
                    },
                    '&:disabled': {
                      bgcolor: 'rgba(74, 95, 165, 0.5)'
                    }
                  }}
                >
                  {downloading === document.id ? 'Loading...' : (
                    <>
                      {isMobile && !downloading && <Download sx={{ mr: 1 }} />}
                      Download
                    </>
                  )}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderCategoryOverview = () => (
    <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
      {tabs.map((tab) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={tab.id} sx={{ bgcolor: theme === 'dark' ? '#0D0C0F' : 'white' ,width:{xs:'100%',md:'40%'}}}>
          <Card sx={{
            height: '100%',
            cursor: 'pointer',
            transition: 'all 0.3s ease-in-out',
            bgcolor: theme === 'dark' ? '#0D0C0F' : 'white',
            color: theme === 'dark' ? 'white' : '#012345',
            border: 1,
            borderColor: 'white',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-4px)',
            }
          }}>
            <CardActionArea onClick={() => setTabValue(tabs.indexOf(tab) + 1)}>
              <CardContent sx={{ textAlign: 'center', p: { xs: 3, sm: 3.5, md: 4 } }}>
                <Avatar
                  sx={{
                    width: { xs: 56, sm: 64, md: 72 },
                    height: { xs: 56, sm: 64, md: 72 },
                    bgcolor: 'rgba(74, 95, 165, 0.1)',
                    mx: 'auto',
                    mb: { xs: 2, sm: 2.5, md: 3 }
                  }}
                >
                  {getCategoryIcon(tab.name)}
                </Avatar>
                
                <Typography 
                  variant={isMobile ? "body1" : "h6"}
                  component="h2" 
                  gutterBottom 
                  fontWeight="600"
                >
                  {tab.name}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mt: 2, 
                    color: theme === 'dark' ? 'white' : '#012345',
                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                  }}
                >
                  Click to explore documents
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress sx={{ color: '#4a5fa5' }} size={isMobile ? 40 : 60} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: 1400, 
      mx: 'auto', 
      p: { xs: 1.5, sm: 2, md: 3 } ,
      mt:{xs:5,md:0},
      mb:{xs:10,md:0}
    }}>
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 }, textAlign: 'center' }}>
        <img
          src={library}
          alt="Document Library"
          style={{ 
            width: isMobile ? '20%' : isTablet ? '15%' : '10%', 
            height: 'auto', 
            objectFit: 'contain' 
          }}
        />
        <Typography 
          variant={isMobile ? "h5" : isTablet ? "h4" : "h4"}
          component="h1" 
          sx={{ 
            color: theme === 'dark' ? 'white' : '#012345', 
            fontWeight: 700,
            mt: 1
          }} 
          gutterBottom
        >
          Document Library
        </Typography>
      </Box>

      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        border: '1px solid #e0e0e0',
        mb: 2,
        borderRadius: 1,
        px: { xs: 1.5, sm: 2 },
        py: { xs: 0.75, sm: 1 }
      }}>
        <Search sx={{ color: theme === 'dark' ? 'white' : 'black', mr: 1 }} />
        <InputBase
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ 
            flexGrow: 1, 
            color: theme === 'dark' ? 'white' : '#012345', 
            bgcolor: theme === 'dark' ? '#0D0C0F' : 'white',
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}
        />
      </Box>

      <Paper sx={{ mb: 3, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            bgcolor: theme === 'dark' ? '#0D0C0F' : 'white',
            color: theme === 'dark' ? 'white' : '#012345',
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' },
              minHeight: { xs: 48, sm: 56 },
              px: { xs: 1.5, sm: 2, md: 3 }
            },
            '& .Mui-selected': {
              color: '#4a5fa5 !important'
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#4a5fa5'
            }
          }}
        >
          <Tab
            label={
              <Box display="flex" alignItems="center">
                <FolderOpen sx={{ mr: 1, color: '#4a5fa5', fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                <Typography sx={{ ml: 1, mr: 1, color: theme === 'dark' ? 'white' : '#012345' }}>
                  Overview
                </Typography>
              </Box>
            }
          />
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              label={
                <Box display="flex" alignItems="center">
                  {getCategoryIcon(tab.name)}
                  <Typography sx={{ ml: 1, mr: 1, color: theme === 'dark' ? 'white' : '#012345' }}>
                    {tab.name}
                  </Typography>
                </Box>
              }
            />
          ))}
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {renderCategoryOverview()}
        </TabPanel>

        {tabs.map((tab, index) => (
          <TabPanel key={tab.id} value={tabValue} index={index + 1}>
            {renderDocumentGrid(filterAndSortDocuments(groupedDocuments[tab.name] || []))}
          </TabPanel>
        ))}
      </Paper>

      {documents.length === 0 && !loading && tabValue > 0 && (
        <Paper sx={{ p: { xs: 4, sm: 5, md: 6 }, textAlign: 'center', bgcolor: 'grey.50' }}>
          <FolderOpen sx={{ fontSize: { xs: 60, sm: 70, md: 80 }, color: 'text.secondary', mb: 3 }} />
          <Typography variant={isMobile ? "h6" : "h5"} color="text.secondary" gutterBottom>
            No Documents Available
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No documents have been uploaded for this category.
          </Typography>
        </Paper>
      )}

      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            height: isMobile ? '100vh' : '90vh',
            maxHeight: isMobile ? '100vh' : '90vh',
            m: isMobile ? 0 : 2
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
            p: { xs: 2, sm: 2.5, md: 3 }
          }}
        >
          <Typography variant={isMobile ? "body1" : "h6"} noWrap sx={{ pr: 2 }}>
            {selectedDocument?.name}
          </Typography>
          <IconButton onClick={handleClosePreview} size={isMobile ? "small" : "medium"}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2, sm: 2.5, md: 3 }, flex: 1, overflow: 'auto' }}>
          {selectedDocument && (
            <Box sx={{ textAlign: 'center', minHeight: { xs: 300, sm: 350, md: 400 } }}>
              {selectedDocument.fileType === 'application/pdf' ? (
                <Box
                  sx={{
                    border: '2px dashed #ddd',
                    borderRadius: 2,
                    p: { xs: 3, sm: 4, md: 6 },
                    bgcolor: 'grey.50'
                  }}
                >
                  <Description sx={{ fontSize: { xs: 60, sm: 70, md: 80 }, color: '#4a5fa5', mb: 3 }} />
                  <Typography variant={isMobile ? "h6" : "h5"} color="text.primary" gutterBottom>
                    PDF Document
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    {selectedDocument.description}
                  </Typography>
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      wordBreak: 'break-word'
                    }}>
                      <strong>Size:</strong> {formatFileSize(selectedDocument.size)} •
                      <strong> Uploaded:</strong> {new Date(selectedDocument.uploadDate).toLocaleDateString()} •
                      <strong> By:</strong> {selectedDocument.uploadedBy}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<CloudDownload />}
                    onClick={() => handleDownload(selectedDocument)}
                    fullWidth={isMobile}
                    sx={{
                      mt: 3,
                      bgcolor: '#4a5fa5',
                      '&:hover': {
                        bgcolor: '#3d5194'
                      }
                    }}
                  >
                    Download PDF
                  </Button>
                </Box>
              ) : selectedDocument.fileType.startsWith('audio/') ? (
                <Box
                  sx={{
                    border: '2px dashed #ddd',
                    borderRadius: 2,
                    p: { xs: 3, sm: 4, md: 6 },
                    bgcolor: 'grey.50'
                  }}
                >
                  <PlayArrow sx={{ fontSize: { xs: 60, sm: 70, md: 80 }, color: '#4a5fa5', mb: 3 }} />
                  <Typography variant={isMobile ? "h6" : "h5"} color="text.primary" gutterBottom>
                    Audio File
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    {selectedDocument.description}
                  </Typography>
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      wordBreak: 'break-word'
                    }}>
                      <strong>Size:</strong> {formatFileSize(selectedDocument.size)} •
                      <strong> Uploaded:</strong> {new Date(selectedDocument.uploadDate).toLocaleDateString()} •
                      <strong> By:</strong> {selectedDocument.uploadedBy}
                    </Typography>
                  </Box>
                  <audio
                    ref={(ref) => setAudioRef(ref)}
                    src={selectedDocument.previewUrl}
                    onEnded={() => setIsPlaying(false)}
                  />
                  <Box sx={{ 
                    mt: 3, 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    justifyContent: 'center'
                  }}>
                    <Button
                      variant="contained"
                      startIcon={isPlaying ? <Pause /> : <PlayArrow />}
                      onClick={handleToggleAudio}
                      fullWidth={isMobile}
                      sx={{
                        bgcolor: '#4a5fa5',
                        '&:hover': {
                          bgcolor: '#3d5194'
                        }
                      }}
                    >
                      {isPlaying ? 'Pause' : 'Play'}
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<CloudDownload />}
                      onClick={() => handleDownload(selectedDocument)}
                      fullWidth={isMobile}
                      sx={{
                        bgcolor: '#4a5fa5',
                        '&:hover': {
                          bgcolor: '#3d5194'
                        }
                      }}
                    >
                      Download Audio
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <img
                    src={selectedDocument.previewUrl}
                    alt={selectedDocument.name}
                    style={{
                      maxWidth: '100%',
                      maxHeight: isMobile ? '300px' : '500px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Typography variant="body1" color="text.secondary" paragraph sx={{ mt: 3, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    {selectedDocument.description}
                  </Typography>
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      wordBreak: 'break-word'
                    }}>
                      <strong>Size:</strong> {formatFileSize(selectedDocument.size)} •
                      <strong> Uploaded:</strong> {new Date(selectedDocument.uploadDate).toLocaleDateString()} •
                      <strong> By:</strong> {selectedDocument.uploadedBy}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<CloudDownload />}
                    onClick={() => handleDownload(selectedDocument)}
                    fullWidth={isMobile}
                    sx={{
                      mt: 3,
                      bgcolor: '#4a5fa5',
                      '&:hover': {
                        bgcolor: '#3d5194'
                      }
                    }}
                  >
                    Download Image
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: { xs: 2, sm: 2.5, md: 3 }, 
          borderTop: 1, 
          borderColor: 'divider',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Button
            onClick={handleClosePreview}
            variant="outlined"
            fullWidth={isMobile}
            sx={{
              borderColor: '#4a5fa5',
              color: '#4a5fa5',
              '&:hover': {
                borderColor: '#4a5fa5',
                backgroundColor: 'rgba(74, 95, 165, 0.1)'
              }
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<CloudDownload />}
            onClick={() => selectedDocument && handleDownload(selectedDocument)}
            fullWidth={isMobile}
            sx={{
              bgcolor: '#4a5fa5',
              '&:hover': {
                bgcolor: '#3d5194'
              }
            }}
          >
            Download Document
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}