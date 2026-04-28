import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
  Chip,
  IconButton,
  Button,
  Divider,
  Card,
  CardContent,
  Grid,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Input,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  Save,
  Preview,
  Delete,
  Add,
  WhatsApp,
  Send,
  Person,
  Business,
  Notifications,
  ContentCopy,
  Check,
  AudioFile,
  Mic,
  Stop
} from '@mui/icons-material';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import SendIcon from '@mui/icons-material/Send';
import { createwhatsappTemplate, whatsappGetTemplate, whatsappGetTemplateById, whatsappSchedulerTemplate } from '../api/Api';
import useMyContext from '../usercontext/useMyContext';
import TiptapEditor from './TiptapEditor';

export default function WhatsappMessageTemplate() {
  const { theme } = useMyContext();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.between('md', 'lg'));
  const isSmallMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  
  const [type, setType] = useState('');
  const [template, setTemplate] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, settemplateDescription] = useState('');
  const [category, setCategory] = useState('');
  const [variables, setVariables] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [audioFile, setAudioFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  
  const audioRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Define theme-based colors
  const themeColors = {
    textPrimary: theme === 'dark' ? 'white' : '#1e293b',
    textSecondary: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
    background: theme === 'dark' ? '#0D0C0F' : 'white',
    border: theme === 'dark' ? '#5a6fb8' : '#e0e0e0',
    chipBg: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.02)',
    hoverBg: theme === 'dark' ? 'rgba(37, 211, 102, 0.2)' : 'rgba(37, 211, 102, 0.08)',
    primary: '#748cd8',
    primaryHover: theme === 'dark' ? '#8a9fe3' : '#5a6fb8',
    whatsappGreen: '#25D366',
    whatsappLight: theme === 'dark' ? '#A5F2C0' : '#DCF8C6',
    error: '#ef4444',
    errorBg: theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.08)',
    info: '#3b82f6',
    disabled: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
    paperBg: theme === 'dark' ? '#1a1a1a' : 'white',
    quillBg: theme === 'dark' ? '#2a2a2a' : 'white',
    quillText: theme === 'dark' ? 'white' : '#1e293b',
    quillToolbar: theme === 'dark' ? '#1a1a1a' : '#f5f5f5'
  };

  const fetchTemplates = async () => {
    try {
      const response = await whatsappGetTemplate();
      setSavedTemplates(response);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to fetch templates',
        severity: 'error'
      });
    }
  };

  const handleAudioChange = (event) => {
    const file = event.target.files[0];
    console.log('Selected file:', file);
    if (file && ['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav'].includes(file.type)) {
      setAudioFile(file);
      setSnackbar({
        open: true,
        message: `Selected file: ${file.name}`,
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: 'Please select a valid audio file (MP3, OGG, or WAV)',
        severity: 'error',
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      setMediaRecorder(recorder);
      recordedChunksRef.current = []; // Reset chunks

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `recording_${Date.now()}.webm`, { 
          type: 'audio/webm' 
        });
        setAudioFile(file);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setSnackbar({
        open: true,
        message: 'Failed to start recording',
        severity: 'error'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleSave = async () => {
    if (!templateName || !templateDescription) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    const formdata = new FormData();
    formdata.append('type', templateName);
    formdata.append('description', templateDescription);
    formdata.append('template', template);
    if (audioFile) {
      formdata.append('audio_file', audioFile, audioFile.name);
    }

    try {
      const res = await createwhatsappTemplate(formdata);
      if (res) {
        setSnackbar({
          open: true,
          message: 'Template saved successfully!',
          severity: 'success'
        });
        fetchTemplates();
      }

      const newTemplate = {
        id: Date.now(),
        name: templateName,
        type,
        category,
        template,
        variables,
        audio: audioFile ? audioFile.name : null
      };

      setSavedTemplates([...savedTemplates, newTemplate]);
      setTemplateName('');
      settemplateDescription('');
      setType('');
      setCategory('');
      setTemplate('');
      setVariables([]);
      setAudioFile(null);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save template',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleShowTemplate = async (template) => {
    try {
      const response = await whatsappGetTemplateById(template.id);
      if (response) {
        setSelectedTemplate(response);
        setShowTemplateDialog(true);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to fetch template details ${error}`,
        severity: 'error'
      });
    }
  };

  const getPreviewMessage = () => {
    let preview = template;
    variables.forEach((variable, index) => {
      const placeholder = `{{${index + 1}}}`;
      preview = preview.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), `[${variable}]`);
    });
    return preview;
  };

  const isTemplateValid = () => {
    return templateName && templateDescription;
  };

  return (
    <Box sx={{ 
      maxWidth: isMobile ? '100%' : 1200, 
      mx: 'auto', 
      p: isSmallMobile ? 1 : isMobile ? 2 : 3, 
      bgcolor: themeColors.background 
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: isSmallMobile ? 2 : isMobile ? 3 : 4, 
          mb: isSmallMobile ? 10 : 3, 
          boxShadow: 'none', 
          mt:{xs:10,md:0},
          bgcolor: themeColors.paperBg, 
          border: 1, 
          borderColor: themeColors.border 
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: isSmallMobile ? 2 : 4,
          flexDirection: isSmallMobile ? 'column' : 'row',
          textAlign: isSmallMobile ? 'center' : 'left'
        }}>
          <WhatsApp sx={{ 
            color: themeColors.whatsappGreen, 
            fontSize: isSmallMobile ? 32 : 40, 
            mr: isSmallMobile ? 0 : 2,
            mb: isSmallMobile ? 1 : 0
          }} />
          <Typography 
            variant={isSmallMobile ? "h5" : isMobile ? "h5" : "h4"} 
            sx={{ 
              color: themeColors.textPrimary, 
              fontWeight: 'bold',
              fontSize: isSmallMobile ? '1.25rem' : undefined
            }}
          >
            WhatsApp Business Template Builder
          </Typography>
        </Box>

        <Grid container spacing={isMobile ? 2 : 3}>
          <Grid item xs={12} lg={8} sx={{width: {xs:'100%',md:'60%'}}}>
            <Card sx={{ 
              mb: isSmallMobile ? 2 : 3, 
              bgcolor: themeColors.background, 
              border: 1, 
              borderColor: themeColors.border 
            }}>
              <CardContent sx={{ p: isSmallMobile ? 2 : 3 }}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    color: themeColors.textPrimary,
                    fontSize: isSmallMobile ? '1.1rem' : undefined
                  }}
                >
                  Template Information
                </Typography>
                
                <Grid container spacing={isSmallMobile ? 1.5 : 2} sx={{ mb: isSmallMobile ? 2 : 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Template Name"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      variant="outlined"
                      size={isSmallMobile ? "small" : "small"}
                      sx={{
                        '& .MuiInputLabel-root': { 
                          color: themeColors.textSecondary,
                          fontSize: isSmallMobile ? '0.875rem' : undefined
                        },
                        '& .MuiOutlinedInput-root': {
                          color: themeColors.textPrimary,
                          fontSize: isSmallMobile ? '0.875rem' : undefined,
                          '& fieldset': { borderColor: themeColors.border },
                          '&:hover fieldset': { borderColor: themeColors.primary },
                          '&.Mui-focused fieldset': { borderColor: themeColors.primary }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Template Description"
                      value={templateDescription}
                      onChange={(e) => settemplateDescription(e.target.value)}
                      variant="outlined"
                      size={isSmallMobile ? "small" : "small"}
                      sx={{
                        '& .MuiInputLabel-root': { 
                          color: themeColors.textSecondary,
                          fontSize: isSmallMobile ? '0.875rem' : undefined
                        },
                        '& .MuiOutlinedInput-root': {
                          color: themeColors.textPrimary,
                          fontSize: isSmallMobile ? '0.875rem' : undefined,
                          '& fieldset': { borderColor: themeColors.border },
                          '&:hover fieldset': { borderColor: themeColors.primary },
                          '&.Mui-focused fieldset': { borderColor: themeColors.primary }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: isSmallMobile ? 1 : 2,
                      flexDirection: isSmallMobile ? 'column' : 'row',
                      alignItems: isSmallMobile ? 'stretch' : 'center'
                    }}>
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<AudioFile />}
                        size={isSmallMobile ? "small" : "medium"}
                        fullWidth={isSmallMobile}
                        sx={{
                          color: themeColors.textPrimary,
                          borderColor: themeColors.border,
                          fontSize: isSmallMobile ? '0.8rem' : undefined,
                          '&:hover': { borderColor: themeColors.primary }
                        }}
                      >
                        Upload Audio
                        <Input
                          type="file"
                          accept="audio/mpeg,audio/ogg,audio/wav"
                          onChange={handleAudioChange}
                          sx={{ display: 'none' }}
                        />
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={isRecording ? <Stop /> : <Mic />}
                        onClick={isRecording ? stopRecording : startRecording}
                        size={isSmallMobile ? "small" : "medium"}
                        fullWidth={isSmallMobile}
                        sx={{
                          color: themeColors.textPrimary,
                          borderColor: themeColors.border,
                          fontSize: isSmallMobile ? '0.8rem' : undefined,
                          '&:hover': { borderColor: themeColors.primary }
                        }}
                      >
                        {isRecording ? 'Stop Recording' : 'Record Audio'}
                      </Button>
                      {audioFile && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: themeColors.textPrimary,
                            fontSize: isSmallMobile ? '0.75rem' : undefined,
                            textAlign: isSmallMobile ? 'center' : 'left',
                            wordBreak: 'break-word'
                          }}
                        >
                          {audioFile.name}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2, bgcolor: themeColors.border }} />
                
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    color: themeColors.textPrimary,
                    fontSize: isSmallMobile ? '1.1rem' : undefined
                  }}
                >
                  Message Content
                </Typography>
                
                {/* Tiptap Editor - Replaced ReactQuill */}
                <Box sx={{ mb: isSmallMobile ? 3 : 5 }}>
                  <TiptapEditor
                    value={template}
                    onChange={setTemplate}
                    placeholder="Type your WhatsApp message template here..."
                    theme={theme}
                    themeColors={themeColors}
                    isSmallMobile={isSmallMobile}
                  />
                </Box>
              </CardContent>
            </Card>
            
            <Box sx={{ 
              display: 'flex', 
              gap: isSmallMobile ? 1 : 2, 
              justifyContent: isMobile ? 'center' : 'flex-end' 
            }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={!isTemplateValid()}
                size={isSmallMobile ? "small" : "medium"}
                sx={{
                  bgcolor: themeColors.primary,
                  color: themeColors.textPrimary,
                  fontSize: isSmallMobile ? '0.8rem' : undefined,
                  px: isSmallMobile ? 2 : 3,
                  '&:hover': { bgcolor: themeColors.primaryHover },
                  '&:disabled': {
                    bgcolor: themeColors.disabled,
                    color: themeColors.textPrimary
                  }
                }}
              >
                Save Template
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} lg={4} sx={{width: {xs:'100%',md:'30%'}}}>
            <Card sx={{ 
              bgcolor: themeColors.background, 
              border: 1, 
              borderColor: themeColors.border,
              mt: isMobile && !isTablet ? 2 : 0
            }}>
              <CardContent sx={{ p: isSmallMobile ? 2 : 3 }}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    color: themeColors.textPrimary,
                    fontSize: isSmallMobile ? '1.1rem' : undefined
                  }}
                >
                  Saved Templates ({savedTemplates.length})
                </Typography>
                <List sx={{ 
                  maxHeight: isMobile ? '300px' : '500px', 
                  overflow: 'auto' 
                }}>
                  {savedTemplates.map((savedTemplate) => (
                    <ListItem
                      key={savedTemplate.id}
                      sx={{
                        border: `1px solid ${themeColors.border}`,
                        borderRadius: 5,
                        mb: 1,
                        cursor: 'pointer',
                        bgcolor: themeColors.background,
                        p: isSmallMobile ? 1 : 1.5,
                        '&:hover': { bgcolor: themeColors.hoverBg }
                      }}
                      onClick={() => handleShowTemplate(savedTemplate)}
                    >
                      <ListItemIcon sx={{ minWidth: isSmallMobile ? 32 : 40 }}>
                        <ChatBubbleIcon sx={{ 
                          color: themeColors.whatsappGreen,
                          fontSize: isSmallMobile ? '1.2rem' : undefined
                        }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography sx={{ 
                            color: themeColors.textPrimary,
                            fontSize: isSmallMobile ? '0.875rem' : undefined,
                            fontWeight: 'medium'
                          }}>
                            {savedTemplate.type}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: themeColors.textSecondary,
                                fontSize: isSmallMobile ? '0.75rem' : undefined
                              }}
                            >
                              Created: {new Date(savedTemplate.created_at).toLocaleDateString()}
                            </Typography>
                            {savedTemplate.audio && (
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: themeColors.textSecondary, 
                                  display: 'block',
                                  fontSize: isSmallMobile ? '0.75rem' : undefined
                                }}
                              >
                                Audio: {savedTemplate.audio}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                
                {savedTemplates.length === 0 && (
                  <Alert 
                    severity="info" 
                    sx={{ 
                      mt: 2, 
                      bgcolor: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.08)',
                      color: themeColors.textPrimary,
                      fontSize: isSmallMobile ? '0.8rem' : undefined
                    }}
                  >
                    No saved templates yet. Create your first template!
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      <Dialog 
        open={showPreview} 
        onClose={() => setShowPreview(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isSmallMobile}
        PaperProps={{
          sx: {
            bgcolor: themeColors.background,
            border: 1,
            borderColor: themeColors.border,
            m: isSmallMobile ? 0 : 2
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: themeColors.whatsappGreen, 
          color: themeColors.textPrimary,
          p: isSmallMobile ? 2 : 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WhatsApp sx={{ color: themeColors.textPrimary }} />
            <Typography sx={{ fontSize: isSmallMobile ? '1.1rem' : undefined }}>
              Template Preview
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: isSmallMobile ? 2 : 3, bgcolor: themeColors.background }}>
          <Box sx={{ 
            bgcolor: themeColors.whatsappLight, 
            p: isSmallMobile ? 1.5 : 2, 
            borderRadius: 2, 
            mb: 2 
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                whiteSpace: 'pre-wrap', 
                color: themeColors.textPrimary,
                fontSize: isSmallMobile ? '0.875rem' : undefined
              }}
              dangerouslySetInnerHTML={{ __html: getPreviewMessage() }}
            />
            {audioFile && (
              <Box sx={{ mt: 2 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: themeColors.textPrimary,
                    fontSize: isSmallMobile ? '0.875rem' : undefined
                  }}
                >
                  Audio: {audioFile.name}
                </Typography>
                <audio 
                  ref={audioRef} 
                  controls 
                  src={URL.createObjectURL(audioFile)} 
                  style={{ 
                    width: '100%', 
                    marginTop: '8px',
                    height: isSmallMobile ? '32px' : '40px'
                  }} 
                />
              </Box>
            )}
          </Box>
          
          {variables.length > 0 && (
            <Alert 
              severity="info"
              sx={{
                bgcolor: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.08)',
                color: themeColors.textPrimary,
                fontSize: isSmallMobile ? '0.8rem' : undefined
              }}
            >
              Variables will be replaced with actual values when sending the message.
              Current placeholders: {variables.join(', ')}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          bgcolor: themeColors.background,
          p: isSmallMobile ? 2 : 3
        }}>
          <Button 
            onClick={() => setShowPreview(false)}
            sx={{ 
              color: themeColors.textSecondary,
              fontSize: isSmallMobile ? '0.875rem' : undefined
            }}
            size={isSmallMobile ? "small" : "medium"}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog 
        open={showTemplateDialog} 
        onClose={() => setShowTemplateDialog(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isSmallMobile}
        PaperProps={{
          sx: {
            bgcolor: themeColors.background,
            border: 1,
            borderColor: themeColors.border,
            m: isSmallMobile ? 0 : 2
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: themeColors.whatsappGreen, 
          color: themeColors.textPrimary,
          p: isSmallMobile ? 2 : 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WhatsApp sx={{ color: themeColors.textPrimary }} />
            <Typography sx={{ fontSize: isSmallMobile ? '1.1rem' : undefined }}>
              Template Details
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: isSmallMobile ? 2 : 3, bgcolor: themeColors.background }}>
          {selectedTemplate ? (
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: themeColors.textPrimary,
                  fontSize: isSmallMobile ? '1.1rem' : undefined,
                  mb: 1
                }}
              >
                Type: {selectedTemplate[0].type}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: themeColors.textPrimary,
                  fontSize: isSmallMobile ? '0.9rem' : undefined,
                  mb: 1
                }}
              >
                Description: {selectedTemplate[0].description}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 1, 
                  color: themeColors.textSecondary,
                  fontSize: isSmallMobile ? '0.8rem' : undefined
                }}
              >
                Status: {selectedTemplate[0].is_active ? 'Active' : 'Inactive'}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 1, 
                  color: themeColors.textSecondary,
                  fontSize: isSmallMobile ? '0.8rem' : undefined
                }}
              >
                Created: {new Date(selectedTemplate[0].created_at).toLocaleString()}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 1, 
                  color: themeColors.textSecondary,
                  fontSize: isSmallMobile ? '0.8rem' : undefined
                }}
              >
                Last Updated: {new Date(selectedTemplate[0].updated_at).toLocaleString()}
              </Typography>
              {selectedTemplate[0].audio_file && (
                <Box sx={{ mt: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: themeColors.textSecondary,
                      fontSize: isSmallMobile ? '0.8rem' : undefined
                    }}
                  >
                    Audio: {selectedTemplate[0].audio_file.split('/').pop()}
                  </Typography>
                  <audio 
                    controls 
                    src={selectedTemplate[0].audio_file} 
                    style={{ 
                      width: '100%', 
                      marginTop: '8px',
                      height: isSmallMobile ? '32px' : '40px'
                    }} 
                  />
                </Box>
              )}
              {selectedTemplate[0].template && (
                <Box sx={{ 
                  bgcolor: themeColors.whatsappLight, 
                  p: isSmallMobile ? 1.5 : 2, 
                  mt: 2, 
                  borderRadius: 2 
                }}>
                  <div 
                    dangerouslySetInnerHTML={{ __html: selectedTemplate[0].template }} 
                    style={{ 
                      color: 'black',
                      fontSize: isSmallMobile ? '0.875rem' : undefined
                    }}
                  />
                </Box>
              )}
            </Box>
          ) : (
            <Typography sx={{ 
              color: themeColors.textPrimary,
              fontSize: isSmallMobile ? '0.875rem' : undefined
            }}>
              Loading template details...
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          bgcolor: themeColors.background,
          p: isSmallMobile ? 2 : 3
        }}>
          <Button 
            onClick={() => setShowTemplateDialog(false)}
            sx={{ 
              color: themeColors.textSecondary,
              fontSize: isSmallMobile ? '0.875rem' : undefined
            }}
            size={isSmallMobile ? "small" : "medium"}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ 
          vertical: 'bottom', 
          horizontal: isSmallMobile ? 'center' : 'right' 
        }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{
            bgcolor: themeColors[snackbar.severity],
            color: themeColors.textPrimary,
            fontSize: isSmallMobile ? '0.875rem' : undefined,
            width: isSmallMobile ? '90vw' : 'auto',
            maxWidth: isSmallMobile ? '90vw' : '600px'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}






// import React, { useState, useRef, useEffect } from 'react';
// import {
//   Box,
//   TextField,
//   Paper,
//   Typography,
//   Chip,
//   IconButton,
//   Button,
//   Divider,
//   Card,
//   CardContent,
//   Grid,
//   Alert,
//   Snackbar,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Stack,
//   Avatar,
//   List,
//   ListItem,
//   ListItemText,
//   ListItemIcon,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Tooltip,
//   Input,
//   useMediaQuery,
//   useTheme
// } from '@mui/material';
// import {
//   FormatBold,
//   FormatItalic,
//   Save,
//   Preview,
//   Delete,
//   Add,
//   WhatsApp,
//   Send,
//   Person,
//   Business,
//   Notifications,
//   ContentCopy,
//   Check,
//   AudioFile,
//   Mic,
//   Stop
// } from '@mui/icons-material';
// import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';
// import SendIcon from '@mui/icons-material/Send';
// import { createwhatsappTemplate, whatsappGetTemplate, whatsappGetTemplateById, whatsappSchedulerTemplate } from '../api/Api';
// import useMyContext from '../usercontext/useMyContext';

// export default function WhatsappMessageTemplate() {
//   const { theme } = useMyContext();
//   const muiTheme = useTheme();
//   const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
//   const isTablet = useMediaQuery(muiTheme.breakpoints.between('md', 'lg'));
//   const isSmallMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  
//   const [type, setType] = useState('');
//   const [template, setTemplate] = useState('');
//   const [templateName, setTemplateName] = useState('');
//   const [templateDescription, settemplateDescription] = useState('');
//   const [category, setCategory] = useState('');
//   const [variables, setVariables] = useState([]);
//   const [showPreview, setShowPreview] = useState(false);
//   const [selectedTemplate, setSelectedTemplate] = useState(null);
//   const [showTemplateDialog, setShowTemplateDialog] = useState(false);
//   const [savedTemplates, setSavedTemplates] = useState([]);
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
//   const [audioFile, setAudioFile] = useState(null);
//   const [isRecording, setIsRecording] = useState(false);
//   const [mediaRecorder, setMediaRecorder] = useState(null);
  
//   const quillRef = useRef(null);
//   const audioRef = useRef(null);
//   const recordedChunksRef = useRef([]);

//   // Define theme-based colors
//   const themeColors = {
//     textPrimary: theme === 'dark' ? 'white' : '#1e293b',
//     textSecondary: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
//     background: theme === 'dark' ? '#0D0C0F' : 'white',
//     border: theme === 'dark' ? '#5a6fb8' : '#e0e0e0',
//     chipBg: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.02)',
//     hoverBg: theme === 'dark' ? 'rgba(37, 211, 102, 0.2)' : 'rgba(37, 211, 102, 0.08)',
//     primary: '#748cd8',
//     primaryHover: theme === 'dark' ? '#8a9fe3' : '#5a6fb8',
//     whatsappGreen: '#25D366',
//     whatsappLight: theme === 'dark' ? '#A5F2C0' : '#DCF8C6',
//     error: '#ef4444',
//     errorBg: theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.08)',
//     info: '#3b82f6',
//     disabled: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
//     paperBg: theme === 'dark' ? '#1a1a1a' : 'white',
//     quillBg: theme === 'dark' ? '#2a2a2a' : 'white',
//     quillText: theme === 'dark' ? 'white' : '#1e293b',
//     quillToolbar: theme === 'dark' ? '#1a1a1a' : '#f5f5f5'
//   };

//   const modules = {
//     toolbar: [
//       [{ 'header': [1, 2, false] }],
//       ['bold', 'italic'],
//       [{ 'list': 'ordered' }, { 'list': 'bullet' }],
//     ]
//   };

//   const formats = [
//     'header',
//     'bold',
//     'italic',
//     'list',
//     'bullet'
//   ];

//   const fetchTemplates = async () => {
//     try {
//       const response = await whatsappGetTemplate();
//       setSavedTemplates(response);
//     } catch (error) {
//       setSnackbar({
//         open: true,
//         message: 'Failed to fetch templates',
//         severity: 'error'
//       });
//     }
//   };

//   const handleAudioChange = (event) => {
//     const file = event.target.files[0];
//     console.log('Selected file:', file);
//     if (file && ['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav'].includes(file.type)) {
//       setAudioFile(file);
//       setSnackbar({
//         open: true,
//         message: `Selected file: ${file.name}`,
//         severity: 'success',
//       });
//     } else {
//       setSnackbar({
//         open: true,
//         message: 'Please select a valid audio file (MP3, OGG, or WAV)',
//         severity: 'error',
//       });
//     }
//   };

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
//       setMediaRecorder(recorder);
//       recordedChunksRef.current = []; // Reset chunks

//       recorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           recordedChunksRef.current.push(event.data);
//         }
//       };

//       recorder.onstop = () => {
//         const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
//         const file = new File([blob], `recording_${Date.now()}.webm`, { 
//           type: 'audio/webm' 
//         });
//         setAudioFile(file);
//         stream.getTracks().forEach(track => track.stop());
//       };

//       recorder.start();
//       setIsRecording(true);
//     } catch (error) {
//       console.error('Error starting recording:', error);
//       setSnackbar({
//         open: true,
//         message: 'Failed to start recording',
//         severity: 'error'
//       });
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorder && isRecording) {
//       mediaRecorder.stop();
//       setIsRecording(false);
//     }
//   };

//   const handleSave = async () => {
//     if (!templateName || !templateDescription) {
//       setSnackbar({
//         open: true,
//         message: 'Please fill in all required fields',
//         severity: 'error'
//       });
//       return;
//     }

//     const formdata = new FormData();
//     formdata.append('type', templateName);
//     formdata.append('description', templateDescription);
//     formdata.append('template', template);
//     if (audioFile) {
//       formdata.append('audio_file', audioFile, audioFile.name); // Ensure filename is included
//     }

//     try {
//       const res = await createwhatsappTemplate(formdata);
//       if (res) {
//         setSnackbar({
//           open: true,
//           message: 'Template saved successfully!',
//           severity: 'success'
//         });
//         fetchTemplates();
//       }

//       const newTemplate = {
//         id: Date.now(),
//         name: templateName,
//         type,
//         category,
//         template,
//         variables,
//         audio: audioFile ? audioFile.name : null
//       };

//       setSavedTemplates([...savedTemplates, newTemplate]);
//       setTemplateName('');
//       settemplateDescription('');
//       setType('');
//       setCategory('');
//       setTemplate('');
//       setVariables([]);
//       setAudioFile(null);
//     } catch (error) {
//       setSnackbar({
//         open: true,
//         message: 'Failed to save template',
//         severity: 'error'
//       });
//     }
//   };

//   useEffect(() => {
//     fetchTemplates();
//   }, []);

//   const handleShowTemplate = async (template) => {
//     try {
//       const response = await whatsappGetTemplateById(template.id);
//       if (response) {
//         setSelectedTemplate(response);
//         setShowTemplateDialog(true);
//       }
//     } catch (error) {
//       setSnackbar({
//         open: true,
//         message: `Failed to fetch template details ${error}`,
//         severity: 'error'
//       });
//     }
//   };

//   const getPreviewMessage = () => {
//     let preview = template;
//     variables.forEach((variable, index) => {
//       const placeholder = `{{${index + 1}}}`;
//       preview = preview.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), `[${variable}]`);
//     });
//     return preview;
//   };

//   const isTemplateValid = () => {
//     return templateName && templateDescription;
//   };

//   return (
//     <Box sx={{ 
//       maxWidth: isMobile ? '100%' : 1200, 
//       mx: 'auto', 
//       p: isSmallMobile ? 1 : isMobile ? 2 : 3, 
//       bgcolor: themeColors.background 
//     }}>
//       <Paper 
//         elevation={3} 
//         sx={{ 
//           p: isSmallMobile ? 2 : isMobile ? 3 : 4, 
//           mb: isSmallMobile ? 10 : 3, 
//           boxShadow: 'none', 
//           mt:{xs:10,md:0},
       

//           bgcolor: themeColors.paperBg, 
//           border: 1, 
//           borderColor: themeColors.border 
//         }}
//       >
//         <Box sx={{ 
//           display: 'flex', 
//           alignItems: 'center', 
//           mb: isSmallMobile ? 2 : 4,
//           flexDirection: isSmallMobile ? 'column' : 'row',
//           textAlign: isSmallMobile ? 'center' : 'left'
//         }}>
//           <WhatsApp sx={{ 
//             color: themeColors.whatsappGreen, 
//             fontSize: isSmallMobile ? 32 : 40, 
//             mr: isSmallMobile ? 0 : 2,
//             mb: isSmallMobile ? 1 : 0
//           }} />
//           <Typography 
//             variant={isSmallMobile ? "h5" : isMobile ? "h5" : "h4"} 
//             sx={{ 
//               color: themeColors.textPrimary, 
//               fontWeight: 'bold',
//               fontSize: isSmallMobile ? '1.25rem' : undefined
//             }}
//           >
//             WhatsApp Business Template Builder
//           </Typography>
//         </Box>

//         <Grid container spacing={isMobile ? 2 : 3}>
//           <Grid item xs={12} lg={8} sx={{width: {xs:'100%',md:'60%'}}}>
//             <Card sx={{ 
//               mb: isSmallMobile ? 2 : 3, 
//               bgcolor: themeColors.background, 
//               border: 1, 
//               borderColor: themeColors.border 
//             }}>
//               <CardContent sx={{ p: isSmallMobile ? 2 : 3 }}>
//                 <Typography 
//                   variant="h6" 
//                   gutterBottom 
//                   sx={{ 
//                     color: themeColors.textPrimary,
//                     fontSize: isSmallMobile ? '1.1rem' : undefined
//                   }}
//                 >
//                   Template Information
//                 </Typography>
                
//                 <Grid container spacing={isSmallMobile ? 1.5 : 2} sx={{ mb: isSmallMobile ? 2 : 3 }}>
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       fullWidth
//                       label="Template Name"
//                       value={templateName}
//                       onChange={(e) => setTemplateName(e.target.value)}
//                       variant="outlined"
//                       size={isSmallMobile ? "small" : "small"}
//                       sx={{
//                         '& .MuiInputLabel-root': { 
//                           color: themeColors.textSecondary,
//                           fontSize: isSmallMobile ? '0.875rem' : undefined
//                         },
//                         '& .MuiOutlinedInput-root': {
//                           color: themeColors.textPrimary,
//                           fontSize: isSmallMobile ? '0.875rem' : undefined,
//                           '& fieldset': { borderColor: themeColors.border },
//                           '&:hover fieldset': { borderColor: themeColors.primary },
//                           '&.Mui-focused fieldset': { borderColor: themeColors.primary }
//                         }
//                       }}
//                     />
//                   </Grid>
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       fullWidth
//                       label="Template Description"
//                       value={templateDescription}
//                       onChange={(e) => settemplateDescription(e.target.value)}
//                       variant="outlined"
//                       size={isSmallMobile ? "small" : "small"}
//                       sx={{
//                         '& .MuiInputLabel-root': { 
//                           color: themeColors.textSecondary,
//                           fontSize: isSmallMobile ? '0.875rem' : undefined
//                         },
//                         '& .MuiOutlinedInput-root': {
//                           color: themeColors.textPrimary,
//                           fontSize: isSmallMobile ? '0.875rem' : undefined,
//                           '& fieldset': { borderColor: themeColors.border },
//                           '&:hover fieldset': { borderColor: themeColors.primary },
//                           '&.Mui-focused fieldset': { borderColor: themeColors.primary }
//                         }
//                       }}
//                     />
//                   </Grid>
//                   <Grid item xs={12}>
//                     <Box sx={{ 
//                       display: 'flex', 
//                       // alignItems: 'center', 
//                       gap: isSmallMobile ? 1 : 2,
//                       flexDirection: isSmallMobile ? 'column' : 'row',
//                       alignItems: isSmallMobile ? 'stretch' : 'center'
//                     }}>
//                       <Button
//                         component="label"
//                         variant="outlined"
//                         startIcon={<AudioFile />}
//                         size={isSmallMobile ? "small" : "medium"}
//                         fullWidth={isSmallMobile}
//                         sx={{
//                           color: themeColors.textPrimary,
//                           borderColor: themeColors.border,
//                           fontSize: isSmallMobile ? '0.8rem' : undefined,
//                           '&:hover': { borderColor: themeColors.primary }
//                         }}
//                       >
//                         Upload Audio
//                         <Input
//                           type="file"
//                           accept="audio/mpeg,audio/ogg,audio/wav"
//                           onChange={handleAudioChange}
//                           sx={{ display: 'none' }}
//                         />
//                       </Button>
//                       <Button
//                         variant="outlined"
//                         startIcon={isRecording ? <Stop /> : <Mic />}
//                         onClick={isRecording ? stopRecording : startRecording}
//                         size={isSmallMobile ? "small" : "medium"}
//                         fullWidth={isSmallMobile}
//                         sx={{
//                           color: themeColors.textPrimary,
//                           borderColor: themeColors.border,
//                           fontSize: isSmallMobile ? '0.8rem' : undefined,
//                           '&:hover': { borderColor: themeColors.primary }
//                         }}
//                       >
//                         {isRecording ? 'Stop Recording' : 'Record Audio'}
//                       </Button>
//                       {audioFile && (
//                         <Typography 
//                           variant="body2" 
//                           sx={{ 
//                             color: themeColors.textPrimary,
//                             fontSize: isSmallMobile ? '0.75rem' : undefined,
//                             textAlign: isSmallMobile ? 'center' : 'left',
//                             wordBreak: 'break-word'
//                           }}
//                         >
//                           {audioFile.name}
//                         </Typography>
//                       )}
//                     </Box>
//                   </Grid>
//                 </Grid>
                
//                 <Divider sx={{ my: 2, bgcolor: themeColors.border }} />
                
//                 <Typography 
//                   variant="h6" 
//                   gutterBottom 
//                   sx={{ 
//                     color: themeColors.textPrimary,
//                     fontSize: isSmallMobile ? '1.1rem' : undefined
//                   }}
//                 >
//                   Message Content
//                 </Typography>
                
//                 <Box sx={{ 
//                   height: isSmallMobile ? '120px' : '150px', 
//                   mb: isSmallMobile ? 3 : 5 
//                 }}>
//                   <ReactQuill
//                     theme="snow"
//                     value={template}
//                     onChange={setTemplate}
//                     modules={modules}
//                     formats={formats}
//                     ref={quillRef}
//                     placeholder="Type your WhatsApp message template here..."
//                     style={{ 
//                       height: isSmallMobile ? '80px' : '110px', 
//                       marginBottom: '40px' 
//                     }}
//                     className={theme === 'dark' ? 'quill-dark' : 'quill-light'}
//                   />
//                 </Box>
//               </CardContent>
//             </Card>
            
//             <Box sx={{ 
//               display: 'flex', 
//               gap: isSmallMobile ? 1 : 2, 
//               justifyContent: isMobile ? 'center' : 'flex-end' 
//             }}>
//               <Button
//                 variant="contained"
//                 startIcon={<Save />}
//                 onClick={handleSave}
//                 disabled={!isTemplateValid()}
//                 size={isSmallMobile ? "small" : "medium"}
//                 sx={{
//                   bgcolor: themeColors.primary,
//                   color: themeColors.textPrimary,
//                   fontSize: isSmallMobile ? '0.8rem' : undefined,
//                   px: isSmallMobile ? 2 : 3,
//                   '&:hover': { bgcolor: themeColors.primaryHover },
//                   '&:disabled': {
//                     bgcolor: themeColors.disabled,
//                     color: themeColors.textPrimary
//                   }
//                 }}
//               >
//                 Save Template
//               </Button>
//             </Box>
//           </Grid>
          
//           <Grid item xs={12} lg={4}  sx={{width: {xs:'100%',md:'30%'}}}>
//             <Card sx={{ 
//               bgcolor: themeColors.background, 
//               border: 1, 
//               borderColor: themeColors.border,
//               mt: isMobile && !isTablet ? 2 : 0
//             }}>
//               <CardContent sx={{ p: isSmallMobile ? 2 : 3 }}>
//                 <Typography 
//                   variant="h6" 
//                   gutterBottom 
//                   sx={{ 
//                     color: themeColors.textPrimary,
//                     fontSize: isSmallMobile ? '1.1rem' : undefined
//                   }}
//                 >
//                   Saved Templates ({savedTemplates.length})
//                 </Typography>
//                 <List sx={{ 
//                   maxHeight: isMobile ? '300px' : '500px', 
//                   overflow: 'auto' 
//                 }}>
//                   {savedTemplates.map((savedTemplate) => (
//                     <ListItem
//                       key={savedTemplate.id}
//                       sx={{
//                         border: `1px solid ${themeColors.border}`,
//                         borderRadius: 5,
//                         mb: 1,
//                         cursor: 'pointer',
//                         bgcolor: themeColors.background,
//                         p: isSmallMobile ? 1 : 1.5,
//                         '&:hover': { bgcolor: themeColors.hoverBg }
//                       }}
//                       onClick={() => handleShowTemplate(savedTemplate)}
//                     >
//                       <ListItemIcon sx={{ minWidth: isSmallMobile ? 32 : 40 }}>
//                         <ChatBubbleIcon sx={{ 
//                           color: themeColors.whatsappGreen,
//                           fontSize: isSmallMobile ? '1.2rem' : undefined
//                         }} />
//                       </ListItemIcon>
//                       <ListItemText
//                         primary={
//                           <Typography sx={{ 
//                             color: themeColors.textPrimary,
//                             fontSize: isSmallMobile ? '0.875rem' : undefined,
//                             fontWeight: 'medium'
//                           }}>
//                             {savedTemplate.type}
//                           </Typography>
//                         }
//                         secondary={
//                           <Box>
//                             <Typography 
//                               variant="caption" 
//                               sx={{ 
//                                 color: themeColors.textSecondary,
//                                 fontSize: isSmallMobile ? '0.75rem' : undefined
//                               }}
//                             >
//                               Created: {new Date(savedTemplate.created_at).toLocaleDateString()}
//                             </Typography>
//                             {savedTemplate.audio && (
//                               <Typography 
//                                 variant="caption" 
//                                 sx={{ 
//                                   color: themeColors.textSecondary, 
//                                   display: 'block',
//                                   fontSize: isSmallMobile ? '0.75rem' : undefined
//                                 }}
//                               >
//                                 Audio: {savedTemplate.audio}
//                               </Typography>
//                             )}
//                           </Box>
//                         }
//                       />
//                     </ListItem>
//                   ))}
//                 </List>
                
//                 {savedTemplates.length === 0 && (
//                   <Alert 
//                     severity="info" 
//                     sx={{ 
//                       mt: 2, 
//                       bgcolor: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.08)',
//                       color: themeColors.textPrimary,
//                       fontSize: isSmallMobile ? '0.8rem' : undefined
//                     }}
//                   >
//                     No saved templates yet. Create your first template!
//                   </Alert>
//                 )}
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>
//       </Paper>
      
//       <Dialog 
//         open={showPreview} 
//         onClose={() => setShowPreview(false)} 
//         maxWidth="sm" 
//         fullWidth
//         fullScreen={isSmallMobile}
//         PaperProps={{
//           sx: {
//             bgcolor: themeColors.background,
//             border: 1,
//             borderColor: themeColors.border,
//             m: isSmallMobile ? 0 : 2
//           }
//         }}
//       >
//         <DialogTitle sx={{ 
//           bgcolor: themeColors.whatsappGreen, 
//           color: themeColors.textPrimary,
//           p: isSmallMobile ? 2 : 3
//         }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             <WhatsApp sx={{ color: themeColors.textPrimary }} />
//             <Typography sx={{ fontSize: isSmallMobile ? '1.1rem' : undefined }}>
//               Template Preview
//             </Typography>
//           </Box>
//         </DialogTitle>
//         <DialogContent sx={{ p: isSmallMobile ? 2 : 3, bgcolor: themeColors.background }}>
//           <Box sx={{ 
//             bgcolor: themeColors.whatsappLight, 
//             p: isSmallMobile ? 1.5 : 2, 
//             borderRadius: 2, 
//             mb: 2 
//           }}>
//             <Typography 
//               variant="body2" 
//               sx={{ 
//                 whiteSpace: 'pre-wrap', 
//                 color: themeColors.textPrimary,
//                 fontSize: isSmallMobile ? '0.875rem' : undefined
//               }}
//             >
//               {getPreviewMessage()}
//             </Typography>
//             {audioFile && (
//               <Box sx={{ mt: 2 }}>
//                 <Typography 
//                   variant="body2" 
//                   sx={{ 
//                     color: themeColors.textPrimary,
//                     fontSize: isSmallMobile ? '0.875rem' : undefined
//                   }}
//                 >
//                   Audio: {audioFile.name}
//                 </Typography>
//                 <audio 
//                   ref={audioRef} 
//                   controls 
//                   src={URL.createObjectURL(audioFile)} 
//                   style={{ 
//                     width: '100%', 
//                     marginTop: '8px',
//                     height: isSmallMobile ? '32px' : '40px'
//                   }} 
//                 />
//               </Box>
//             )}
//           </Box>
          
//           {variables.length > 0 && (
//             <Alert 
//               severity="info"
//               sx={{
//                 bgcolor: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.08)',
//                 color: themeColors.textPrimary,
//                 fontSize: isSmallMobile ? '0.8rem' : undefined
//               }}
//             >
//               Variables will be replaced with actual values when sending the message.
//               Current placeholders: {variables.join(', ')}
//             </Alert>
//           )}
//         </DialogContent>
//         <DialogActions sx={{ 
//           bgcolor: themeColors.background,
//           p: isSmallMobile ? 2 : 3
//         }}>
//           <Button 
//             onClick={() => setShowPreview(false)}
//             sx={{ 
//               color: themeColors.textSecondary,
//               fontSize: isSmallMobile ? '0.875rem' : undefined
//             }}
//             size={isSmallMobile ? "small" : "medium"}
//           >
//             Close
//           </Button>
//         </DialogActions>
//       </Dialog>
      
//       <Dialog 
//         open={showTemplateDialog} 
//         onClose={() => setShowTemplateDialog(false)} 
//         maxWidth="sm" 
//         fullWidth
//         fullScreen={isSmallMobile}
//         PaperProps={{
//           sx: {
//             bgcolor: themeColors.background,
//             border: 1,
//             borderColor: themeColors.border,
//             m: isSmallMobile ? 0 : 2
//           }
//         }}
//       >
//         <DialogTitle sx={{ 
//           bgcolor: themeColors.whatsappGreen, 
//           color: themeColors.textPrimary,
//           p: isSmallMobile ? 2 : 3
//         }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             <WhatsApp sx={{ color: themeColors.textPrimary }} />
//             <Typography sx={{ fontSize: isSmallMobile ? '1.1rem' : undefined }}>
//               Template Details
//             </Typography>
//           </Box>
//         </DialogTitle>
//         <DialogContent sx={{ p: isSmallMobile ? 2 : 3, bgcolor: themeColors.background }}>
//           {selectedTemplate ? (
//             <Box>
//               <Typography 
//                 variant="h6" 
//                 sx={{ 
//                   color: themeColors.textPrimary,
//                   fontSize: isSmallMobile ? '1.1rem' : undefined,
//                   mb: 1
//                 }}
//               >
//                 Type: {selectedTemplate[0].type}
//               </Typography>
//               <Typography 
//                 variant="body1" 
//                 sx={{ 
//                   color: themeColors.textPrimary,
//                   fontSize: isSmallMobile ? '0.9rem' : undefined,
//                   mb: 1
//                 }}
//               >
//                 Description: {selectedTemplate[0].description}
//               </Typography>
//               <Typography 
//                 variant="body2" 
//                 sx={{ 
//                   mt: 1, 
//                   color: themeColors.textSecondary,
//                   fontSize: isSmallMobile ? '0.8rem' : undefined
//                 }}
//               >
//                 Status: {selectedTemplate[0].is_active ? 'Active' : 'Inactive'}
//               </Typography>
//               <Typography 
//                 variant="body2" 
//                 sx={{ 
//                   mt: 1, 
//                   color: themeColors.textSecondary,
//                   fontSize: isSmallMobile ? '0.8rem' : undefined
//                 }}
//               >
//                 Created: {new Date(selectedTemplate[0].created_at).toLocaleString()}
//               </Typography>
//               <Typography 
//                 variant="body2" 
//                 sx={{ 
//                   mt: 1, 
//                   color: themeColors.textSecondary,
//                   fontSize: isSmallMobile ? '0.8rem' : undefined
//                 }}
//               >
//                 Last Updated: {new Date(selectedTemplate[0].updated_at).toLocaleString()}
//               </Typography>
//               {selectedTemplate[0].audio_file && (
//                 <Box sx={{ mt: 2 }}>
//                   <Typography 
//                     variant="body2" 
//                     sx={{ 
//                       color: themeColors.textSecondary,
//                       fontSize: isSmallMobile ? '0.8rem' : undefined
//                     }}
//                   >
//                     Audio: {selectedTemplate[0].audio_file.split('/').pop()}
//                   </Typography>
//                   <audio 
//                     controls 
//                     src={selectedTemplate[0].audio_file} 
//                     style={{ 
//                       width: '100%', 
//                       marginTop: '8px',
//                       height: isSmallMobile ? '32px' : '40px'
//                     }} 
//                   />
//                 </Box>
//               )}
//               {selectedTemplate[0].template && (
//                 <Box sx={{ 
//                   bgcolor: themeColors.whatsappLight, 
//                   p: isSmallMobile ? 1.5 : 2, 
//                   mt: 2, 
//                   borderRadius: 2 
//                 }}>
//                   <div 
//                     dangerouslySetInnerHTML={{ __html: selectedTemplate[0].template }} 
//                     style={{ 
//                       color: 'black',
//                       fontSize: isSmallMobile ? '0.875rem' : undefined
//                     }}
//                   />
//                 </Box>
//               )}
//             </Box>
//           ) : (
//             <Typography sx={{ 
//               color: themeColors.textPrimary,
//               fontSize: isSmallMobile ? '0.875rem' : undefined
//             }}>
//               Loading template details...
//             </Typography>
//           )}
//         </DialogContent>
//         <DialogActions sx={{ 
//           bgcolor: themeColors.background,
//           p: isSmallMobile ? 2 : 3
//         }}>
//           <Button 
//             onClick={() => setShowTemplateDialog(false)}
//             sx={{ 
//               color: themeColors.textSecondary,
//               fontSize: isSmallMobile ? '0.875rem' : undefined
//             }}
//             size={isSmallMobile ? "small" : "medium"}
//           >
//             Close
//           </Button>
//         </DialogActions>
//       </Dialog>
      
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//         anchorOrigin={{ 
//           vertical: 'bottom', 
//           horizontal: isSmallMobile ? 'center' : 'right' 
//         }}
//       >
//         <Alert
//           severity={snackbar.severity}
//           onClose={() => setSnackbar({ ...snackbar, open: false })}
//           sx={{
//             bgcolor: themeColors[snackbar.severity],
//             color: themeColors.textPrimary,
//             fontSize: isSmallMobile ? '0.875rem' : undefined,
//             width: isSmallMobile ? '90vw' : 'auto',
//             maxWidth: isSmallMobile ? '90vw' : '600px'
//           }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>

//     </Box>
//   );
// }