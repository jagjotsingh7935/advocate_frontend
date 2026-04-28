import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Divider,
  Alert,
  LinearProgress,
  Tooltip,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Fade,
  Zoom,
  Drawer,
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  Avatar,
  CardMedia,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
  useTheme,
  SwipeableDrawer,
  Fab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import ImageIcon from '@mui/icons-material/Image';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';
import { getAllDocuments, guidelinesDocument, getAllDocumentsbyid } from '../api/Api';
import useMyContext from '../usercontext/useMyContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function GuidelinesCreate() {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState({});
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const audioRefs = useRef({});
  const open = Boolean(anchorEl);
  const { theme } = useMyContext();
  
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down('lg'));

  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }]
    ]
  };

  const quillFormats = ['bold', 'italic', 'underline', 'list', 'bullet'];

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getFileIcon = (fileType, fileName) => {
    if (fileType.startsWith('audio/')) return <AudiotrackIcon color="primary" />;
    if (fileType.startsWith('image/')) return <ImageIcon color="success" />;
    if (fileName.toLowerCase().includes('.pdf')) return <PictureAsPdfIcon color="error" />;
    return <DescriptionIcon color="info" />;
  };

  const getFileTypeFromUrl = (url) => {
    const extension = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    if (['mp3', 'wav', 'ogg', 'webm'].includes(extension)) return 'audio';
    if (extension === 'pdf') return 'pdf';
    return 'document';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validFiles = selectedFiles.filter(file => {
      const fileType = file.type;
      const extension = file.name.split('.').pop().toLowerCase();
      return (
        fileType.startsWith('audio/') ||
        fileType.startsWith('image/') ||
        fileType === 'application/pdf' ||
        ['doc', 'docx', 'txt'].includes(extension)
      );
    });
    if (validFiles.length < selectedFiles.length) {
      setSubmitStatus({ type: 'error', message: 'Some files were invalid and not added' });
    }
    setFiles((prevFiles) => [...prevFiles, ...validFiles]);
    handleMenuClose();
    setSubmitStatus(null);
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
    setSubmitStatus(null);
  };

  const handleContentChange = (value) => {
    setContent(value);
    setSubmitStatus(null);
  };

  const removeFile = (indexToRemove) => {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
    if (files[indexToRemove] === audioFile) {
      setAudioFile(null);
    }
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];
      setRecordingDuration(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `recording_${Date.now()}.webm`, { type: 'audio/webm' });
        setAudioFile(file);
        setFiles((prevFiles) => [...prevFiles, file]);
        stream.getTracks().forEach(track => track.stop());
        clearInterval(recordingIntervalRef.current);
      };

      recorder.start();
      setIsRecording(true);
      handleMenuClose();
    } catch (error) {
      console.error('Error starting recording:', error);
      setSubmitStatus({ type: 'error', message: 'Failed to start recording' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingDuration(0);
    }
  };

  const toggleAudio = (url) => {
    const audio = audioRefs.current[url];
    if (!audio) {
      audioRefs.current[url] = new Audio(url);
      audioRefs.current[url].addEventListener('ended', () => {
        setAudioPlaying(prev => ({ ...prev, [url]: false }));
      });
    }

    if (audioPlaying[url]) {
      audioRefs.current[url].pause();
      setAudioPlaying(prev => ({ ...prev, [url]: false }));
    } else {
      audioRefs.current[url].play();
      setAudioPlaying(prev => ({ ...prev, [url]: true }));
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await getAllDocuments();
      setDocuments(res.data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setSubmitStatus({ type: 'error', message: 'Failed to fetch documents' });
    }
  };

  const handleDocumentClick = async (id) => {
    try {
      const res = await getAllDocumentsbyid(id);
      setSelectedDocument(res);
      setDialogOpen(true);
      if (isMobile) {
        setMobileDrawerOpen(false);
      }
    } catch (error) {
      console.error('Error fetching document by ID:', error);
      setSubmitStatus({ type: 'error', message: 'Failed to fetch document details' });
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedDocument(null);
    // Stop all playing audio
    Object.values(audioRefs.current).forEach(audio => audio.pause());
    setAudioPlaying({});
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('text', content);
      files.forEach((file) => {
        formData.append('files', file, file.name);
      });

      const res = await guidelinesDocument(formData);
      setSubmitStatus({ type: 'success', message: 'Guidelines uploaded successfully!' });

      setTimeout(() => {
        setName('');
        setContent('');
        setFiles([]);
        setAudioFile(null);
        setSubmitStatus(null);
        fetchDocuments();
      }, 2000);
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Failed to upload guidelines. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const placeholderColor = theme === 'dark' ? '#abbefd' : '#6b7280';

  // Document sidebar component
  const DocumentsSidebar = () => (
    <Box sx={{ width: isMobile ? '100%' : '100%', height: '100%', display: 'flex', flexDirection: 'column',mt:{xs:8,md:5} }}>
      <Typography variant="h6" sx={{ p: 2, color: theme === 'dark' ? 'white' : 'grey.900', fontWeight: 700 }}>
        📄 Documents ({documents.length})
      </Typography>
      <Divider sx={{ bgcolor: theme === 'dark' ? 'grey.600' : 'grey.300', mb: 2 }} />
      
      <Box sx={{ overflowY: 'auto', flexGrow: 1, px: 2 }}>
        {documents.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: theme === 'dark' ? 'grey.400' : 'text.secondary' }}>
            <DescriptionIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
            <Typography variant="body1" fontWeight={500}>No documents found</Typography>
          </Box>
        ) : (
          <Stack spacing={1}>
            {documents.map((doc) => (
              <Card key={doc.id} elevation={0} sx={{ border: 1, bgcolor: 'transparent', borderColor: theme === 'dark' ? 'grey.600' : 'grey.300', borderRadius: 2 }}>
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: theme === 'dark' ? 'white' : 'grey.900', fontWeight: 600, flexGrow: 1, pr: 1 }}>
                      {doc.name}
                    </Typography>
                    <IconButton onClick={() => handleDocumentClick(doc.id)} size="small" sx={{ color: '#627fddff' }}>
                      <VisibilityIcon />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      maxWidth: 1400, 
      mx: 'auto', 
      p: isMobile ? 2 : 3, 
      bgcolor: 'transparent',
      minHeight: '100vh'
      
    }}>
      {/* Main Content */}
      <Box sx={{ 
        flexGrow: 1, 
        pr: { xs: 0, md: isMobile ? 0 : 2 },
        mb: isMobile ? 12 : 0
        

      }}>
        <Card elevation={0} sx={{ mb: 3, bgcolor: 'transparent' }}>
          <CardContent sx={{ px: isMobile ? 1 : 3 }}>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                color: theme === 'dark' ? 'white' : 'grey.900', 
                mb: 1,
                textAlign: isMobile ? 'center' : 'left'
              }}
            >
              📋 Upload Guidelines
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3, 
                color: theme === 'dark' ? 'grey.300' : 'text.secondary', 
                fontSize: isMobile ? '1rem' : '1.1rem',
                textAlign: isMobile ? 'center' : 'left'
              }}
            >
              Create comprehensive guidelines by uploading documents, audio files, images, or recording audio directly.
            </Typography>

            <TextField
              fullWidth
              label="Guidelines Name"
              value={name}
              onChange={handleNameChange}
              margin="normal"
              required
              variant="outlined"
              size={isMobile ? "medium" : "medium"}
              sx={{
                mb: 3,
                '& .MuiInputBase-root': { 
                  color: theme === 'dark' ? 'white' : 'grey.900',
                  bgcolor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  borderRadius: 2
                },
                '& .MuiInputLabel-root': { color: theme === 'dark' ? 'grey.400' : 'grey.600' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme === 'dark' ? '#abbefd' : 'grey.400', borderWidth: 2 }
              }}
            />

            <Box sx={{ 
              mb: 3, 
              border: 2, 
              borderColor: theme === 'dark' ? '#abbefd' : 'grey.400', 
              borderRadius: 2, 
              overflow: 'hidden',
              '& .ql-editor': {
                minHeight: isMobile ? '120px' : '150px',
                fontSize: isMobile ? '14px' : '16px'
              }
            }}>
              <ReactQuill
                theme="snow"
                value={content}
                onChange={handleContentChange}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Enter guideline content..."
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
                  color: theme === 'dark' ? 'white' : 'grey.900',
                }}
              />
            </Box>

            {submitStatus && (
              <Fade in={Boolean(submitStatus)}>
                <Alert
                  severity={submitStatus.type}
                  sx={{ mb: 3, borderRadius: 2, fontSize: isMobile ? '0.9rem' : '1rem' }}
                  icon={submitStatus.type === 'success' ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />}
                >
                  {submitStatus.message}
                </Alert>
              </Fade>
            )}
          </CardContent>
        </Card>

        <Grid container spacing={isMobile ? 2 : 3}>
          <Grid item xs={12} md={6} sx={{width:{xs:'100%',md:'30%'}}}>
            <Card elevation={0} sx={{ 
              bgcolor: 'transparent', 
              // border: 2, 
              // borderColor: theme === 'dark' ? '#abbefd' : 'grey.900', 
              borderRadius: 3,
              minHeight: isMobile ? 'auto' : '340px'
            }}>
              <CardContent sx={{ px: isMobile ? 2 : 3 }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: theme === 'dark' ? 'white' : 'grey.900', 
                  fontWeight: 600,
                  fontSize: isMobile ? '1.1rem' : '1.25rem'
                }}>
                  ➕ Add Content
                </Typography>

                <Stack 
                  direction={isMobile ? "column" : "row"} 
                  spacing={2} 
                  sx={{ mb: 2 }}
                >
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleMenuOpen}
                    disabled={isRecording || isSubmitting}
                    fullWidth={isMobile}
                    sx={{
                      bgcolor: '#627fddff',
                      borderRadius: 3,
                      px: 3,
                      py: isMobile ? 1.5 : 1,
                      fontWeight: 600,
                      fontSize: isMobile ? '0.9rem' : '1rem',
                      '&:hover': { bgcolor: '#4a6bd1' }
                    }}
                  >
                    Add Files
                  </Button>

                  {isRecording && (
                    <Zoom in={isRecording}>
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent={isMobile ? "center" : "flex-start"}>
                        <IconButton
                          color="error"
                          onClick={stopRecording}
                          sx={{ bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}
                        >
                          <StopIcon />
                        </IconButton>
                        <Chip
                          icon={<FiberManualRecordIcon sx={{ animation: 'blink 1s infinite' }} />}
                          label={`Recording ${formatRecordingTime(recordingDuration)}`}
                          color="error"
                          sx={{ fontWeight: 600 }}
                        />
                      </Stack>
                    </Zoom>
                  )}
                </Stack>

                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                  PaperProps={{
                    elevation: 12,
                    sx: {
                      minWidth: isMobile ? 250 : 220,
                      bgcolor: theme === 'dark' ? 'grey.800' : 'white',
                      borderRadius: 2,
                      border: 1,
                      borderColor: theme === 'dark' ? 'grey.600' : 'grey.300'
                    }
                  }}
                >
                  <MenuItem sx={{ py: 2, borderRadius: 1, mx: 1 }}>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', width: '100%' }}>
                      <DescriptionIcon sx={{ mr: 2, color: 'info.main' }} />
                      <Typography fontWeight={500}>Upload Document</Typography>
                      <input type="file" multiple accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }} onChange={handleFileChange} />
                    </label>
                  </MenuItem>
                  <MenuItem sx={{ py: 2, borderRadius: 1, mx: 1 }}>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', width: '100%' }}>
                      <AudiotrackIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography fontWeight={500}>Upload Audio</Typography>
                      <input type="file" multiple accept="audio/*" style={{ display: 'none' }} onChange={handleFileChange} />
                    </label>
                  </MenuItem>
                  <MenuItem onClick={startRecording} sx={{ py: 2, borderRadius: 1, mx: 1 }}>
                    <MicIcon sx={{ mr: 2, color: 'warning.main' }} />
                    <Typography fontWeight={500}>Record Audio</Typography>
                  </MenuItem>
                  <MenuItem sx={{ py: 2, borderRadius: 1, mx: 1 }}>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', width: '100%' }}>
                      <ImageIcon sx={{ mr: 2, color: 'success.main' }} />
                      <Typography fontWeight={500}>Upload Image</Typography>
                      <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                    </label>
                  </MenuItem>
                </Menu>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} sx={{width:{xs:'100%',md:'64%'}}}>
            <Card elevation={0} sx={{ 
              bgcolor: 'transparent', 
              border: 2, 
              borderColor: theme === 'dark' ? '#abbefd' : 'grey.900', 
              borderRadius: 3, 
              height: isMobile ? 'auto' : 340, 
              display: 'flex', 
              flexDirection: 'column',
              minHeight: isMobile ? '300px' : '340px'
            }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', px: isMobile ? 2 : 3 }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: theme === 'dark' ? 'white' : 'grey.900', 
                  fontWeight: 600,
                  fontSize: isMobile ? '1.1rem' : '1.25rem'
                }}>
                  📁 Files ({files.length})
                </Typography>

                <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
                  {files.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4, color: theme === 'dark' ? 'grey.400' : 'text.secondary' }}>
                      <CloudUploadIcon sx={{ fontSize: isMobile ? 48 : 64, mb: 2, opacity: 0.3 }} />
                      <Typography variant="body1" fontWeight={500} fontSize={isMobile ? '0.9rem' : '1rem'}>
                        No files uploaded yet
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={1}>
                      {files.map((file, index) => (
                        <Fade in key={index} timeout={300}>
                          <Card elevation={0} sx={{ border: 1, borderColor: theme === 'dark' ? 'grey.600' : 'grey.300', borderRadius: 2 }}>
                            <CardContent sx={{ py: isMobile ? 1.5 : 2, '&:last-child': { pb: isMobile ? 1.5 : 2 } }}>
                              <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1, minWidth: 0 }}>
                                  <Avatar sx={{ 
                                    bgcolor: 'transparent', 
                                    border: 1, 
                                    borderColor: 'grey.400',
                                    width: isMobile ? 32 : 40,
                                    height: isMobile ? 32 : 40
                                  }}>
                                    {getFileIcon(file.type, file.name)}
                                  </Avatar>
                                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                    <Typography variant="body2" noWrap fontWeight={600} sx={{ 
                                      color: theme === 'dark' ? 'white' : 'grey.900',
                                      fontSize: isMobile ? '0.8rem' : '0.875rem'
                                    }}>
                                      {file.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ 
                                      color: theme === 'dark' ? 'grey.400' : 'text.secondary',
                                      fontSize: isMobile ? '0.7rem' : '0.75rem'
                                    }}>
                                      {formatFileSize(file.size)}
                                    </Typography>
                                  </Box>
                                </Stack>
                                <IconButton 
                                  onClick={() => removeFile(index)} 
                                  size="small" 
                                  sx={{ color: 'error.main' }}
                                >
                                  <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                                </IconButton>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Fade>
                      ))}
                    </Stack>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card elevation={0} sx={{ mt: 3, bgcolor: 'transparent' }}>
          <CardContent sx={{ px: isMobile ? 1 : 3 }}>
            <Divider sx={{ mb: 3, bgcolor: theme === 'dark' ? 'grey.600' : 'grey.300' }} />

            {isSubmitting && (
              <Box sx={{ mb: 3 }}>
                <LinearProgress sx={{ height: 8, borderRadius: 4, bgcolor: theme === 'dark' ? 'grey.700' : 'grey.200' }} />
                <Typography variant="body2" sx={{ 
                  mt: 1, 
                  color: theme === 'dark' ? 'grey.400' : 'text.secondary', 
                  textAlign: 'center', 
                  fontWeight: 500,
                  fontSize: isMobile ? '0.8rem' : '0.875rem'
                }}>
                  Uploading guidelines...
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              size="large"
              startIcon={<CloudUploadIcon />}
              onClick={handleSubmit}
              disabled={!name.trim() || (!content.trim() && files.length === 0) || isRecording || isSubmitting}
              sx={{
                minWidth: isMobile ? '100%' : 250,
                py: isMobile ? 2.5 : 2,
                fontSize: isMobile ? '1rem' : '1.2rem',
                fontWeight: 700,
                bgcolor: '#627fddff',
                borderRadius: 3,
                '&:hover': { bgcolor: '#4a6bd1', transform: 'translateY(-2px)' },
                '&:disabled': { bgcolor: theme === 'dark' ? 'grey.700' : 'grey.300' },
                transition: 'all 0.2s ease'
              }}
              fullWidth
            >
              {isSubmitting ? 'Uploading...' : 'Submit Guidelines'}
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          anchor="right"
          sx={{
            width: 320,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 320,
              boxSizing: 'border-box',
              bgcolor: theme === 'dark' ? '#0d0c0f' : 'white',
              borderLeft: `2px solid ${theme === 'dark' ? '#abbefd' : 'grey.400'}`,
              p: 2,
            },
          }}
        >
          <DocumentsSidebar />
        </Drawer>
      )}

      {/* Mobile Floating Action Button */}
      {isMobile && (
        <Fab
          onClick={toggleMobileDrawer}
          sx={{
            position: 'fixed',
            bottom: 90,
            right: 16,
            bgcolor: '#627fddff',
            color: 'white',
            '&:hover': { bgcolor: '#4a6bd1' },
            zIndex: 1000
          }}
        >
          <MenuIcon />
        </Fab>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <SwipeableDrawer
          anchor="right"
          open={mobileDrawerOpen}
          onClose={toggleMobileDrawer}
          onOpen={toggleMobileDrawer}
          PaperProps={{
            sx: {
              width: '90vw',
              maxWidth: 400,
              bgcolor: theme === 'dark' ? '#0d0c0f' : 'white',
              borderLeft: `2px solid ${theme === 'dark' ? '#abbefd' : 'grey.400'}`,
              
            },
          }}
        >
          <DocumentsSidebar />
        </SwipeableDrawer>
      )}

      {/* Document Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            bgcolor: theme === 'dark' ? 'grey.800' : 'white',
            borderRadius: isMobile ? 0 : 3,
            maxHeight: isMobile ? '100vh' : '80vh',
            m: isMobile ? 0 : 2
          },
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${theme === 'dark' ? 'grey.600' : 'grey.200'}`,
          bgcolor: theme === 'dark' ? '#0d0c0f':'white', 
          pb: 2,
          px: isMobile ? 2 : 3
        }}>
          <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700} sx={{ 
            color: theme === 'dark' ? 'white' : 'grey.900',
            fontSize: isMobile ? '1.25rem' : '1.5rem'
          }}>
            📋 Document Details
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ py: isMobile ? 2 : 3, px: isMobile ? 2 : 3,bgcolor:theme==='dark'?'#060607':'white' }}>
          {selectedDocument && (
            <Stack spacing={isMobile ? 2 : 3} sx={{bgcolor:theme==='dark'?'#060607':'white'}}>
              <Box>
                <Typography variant={isMobile ? "body1" : "h6"} fontWeight={600} sx={{ 
                  color: theme === 'dark' ? 'white' : 'grey.900', 
                  mb: 1,
                  fontSize: isMobile ? '1.1rem' : '1.25rem'
                }}>
                  {selectedDocument.name}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: theme === 'dark' ? 'grey.400' : 'text.secondary',
                  fontSize: isMobile ? '0.8rem' : '0.875rem'
                }}>
                  ID: {selectedDocument.id} • Created: {new Date(selectedDocument.created_at).toLocaleDateString()}
                </Typography>
              </Box>

              {selectedDocument.text && (
                <Accordion elevation={0} sx={{ 
                  border: 1, 
                  borderColor: theme === 'dark' ? 'grey.600' : 'grey.300', 
                  borderRadius: 2,
                  bgcolor: 'transparent'
                }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight={600} fontSize={isMobile ? '0.9rem' : '1rem'}>📝 Text Content</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ 
                      whiteSpace: 'pre-wrap', 
                      maxHeight: isMobile ? 150 : 200, 
                      overflowY: 'auto',
                      fontSize: isMobile ? '0.8rem' : '0.875rem',
                    }}>
                      {selectedDocument.text}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              )}

              {selectedDocument.file_urls && selectedDocument.file_urls.length > 0 && (
                <Accordion elevation={0} sx={{ 
                  border: 1, 
                  borderColor: theme === 'dark' ? 'grey.600' : 'grey.300', 
                  borderRadius: 2,
                  bgcolor: 'transparent'
                }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight={600} fontSize={isMobile ? '0.9rem' : '1rem'} sx={{color:theme==='dark'?'white':'black'}}>
                      📎 Files ({selectedDocument.file_urls.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={isMobile ? 1 : 2}>
                      {selectedDocument.file_urls.map((url, index) => {
                        const fileName = url.split('/').pop();
                        const fileType = getFileTypeFromUrl(url);
                        
                        return (
                          <Card key={index} elevation={0} sx={{ 
                            border: 1, 
                            borderColor: theme === 'dark' ? 'grey.600' : 'grey.300', 
                            borderRadius: 2,
                            bgcolor: 'transparent'
                          }}>
                            <CardContent sx={{ py: isMobile ? 1.5 : 2, '&:last-child': { pb: isMobile ? 1.5 : 2 } }}>
                              <Stack direction="row" alignItems="center" spacing={isMobile ? 1 : 2}>
                                <Avatar sx={{ 
                                  bgcolor: 'transparent', 
                                  border: 1, 
                                  borderColor: 'grey.400',
                                  width: isMobile ? 32 : 40,
                                  height: isMobile ? 32 : 40
                                }}>
                                  {fileType === 'image' && <ImageIcon color="success" />}
                                  {fileType === 'audio' && <AudiotrackIcon color="primary" />}
                                  {fileType === 'pdf' && <PictureAsPdfIcon color="error" />}
                                  {fileType === 'document' && <DescriptionIcon color="info" />}
                                </Avatar>
                                
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                  <Typography variant="body2" fontWeight={600} noWrap sx={{ 
                                    color: theme === 'dark' ? 'white' : 'grey.900',
                                    fontSize: isMobile ? '0.8rem' : '0.875rem'
                                  }}>
                                    {fileName}
                                  </Typography>
                                  <Typography variant="caption" sx={{ 
                                    color: theme === 'dark' ? 'grey.400' : 'text.secondary',
                                    fontSize: isMobile ? '0.7rem' : '0.75rem'
                                  }}>
                                    {fileType.charAt(0).toUpperCase() + fileType.slice(1)} File
                                  </Typography>
                                </Box>

                                <Stack direction="row" spacing={0.5}>
                                  {fileType === 'audio' && (
                                    <IconButton
                                      onClick={() => toggleAudio(url)}
                                      size="small"
                                      sx={{ color: 'primary.main' }}
                                    >
                                      {audioPlaying[url] ? <PauseIcon fontSize={isMobile ? "small" : "medium"} /> : <PlayArrowIcon fontSize={isMobile ? "small" : "medium"} />}
                                    </IconButton>
                                  )}
                                  
                                  <IconButton
                                    onClick={() => window.open(url, '_blank')}
                                    size="small"
                                    sx={{ color: '#627fddff' }}
                                  >
                                    <VisibilityIcon fontSize={isMobile ? "small" : "medium"} />
                                  </IconButton>
                                </Stack>
                              </Stack>

                              {fileType === 'image' && (
                                <Box sx={{ mt: 2 }}>
                                  <CardMedia
                                    component="img"
                                    height={isMobile ? "150" : "200"}
                                    image={url}
                                    alt={fileName}
                                    sx={{ 
                                      borderRadius: 2, 
                                      objectFit: 'contain',
                                      bgcolor: theme === 'dark' ? 'grey.700' : 'grey.100'
                                    }}
                                  />
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              )}
            </Stack>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          p: isMobile ? 2 : 3, 
          borderTop: `1px solid ${theme === 'dark' ? 'grey.600' : 'grey.200'}`,
          bgcolor: theme === 'dark' ? '#0d0c0f' : 'white'
        }}>
          <Button
            onClick={handleDialogClose}
            variant="contained"
            fullWidth={isMobile}
            sx={{
              bgcolor: '#627fddff',
              color: 'white',
              borderRadius: 2,
              px: isMobile ? 3 : 4,
              py: isMobile ? 1.5 : 1,
              fontWeight: 600,
              fontSize: isMobile ? '0.9rem' : '1rem',
              '&:hover': { bgcolor: '#4a6bd1' },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* CSS for blinking animation */}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
      `}</style>
    </Box>
  );
}