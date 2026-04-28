import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Alert,
  Paper,
  useMediaQuery,
  useTheme,
  Stack
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Add as AddIcon } from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { addNews } from '../api/Api';
import Sidebar from './Sidebar';
import useMyContext from '../usercontext/useMyContext';

const NewsAdd = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const { theme } = useMyContext();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.between('sm', 'md'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    images.forEach((image, index) => {
      formData.append(`images[${index}]`, new Blob([image], { type: image.type }));
    });

    try {
      await addNews(formData);
      setMessage('News added successfully');
      setTitle('');
      setDescription('');
      setImages([]);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.error || 'Failed to add news');
    }
  };

  // React Quill modules and formats
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link', 'image'
  ];

  // Custom styles for ReactQuill based on theme
  const quillStyles = {
    backgroundColor: theme === 'dark' ? '#2a2a2a' : 'white',
    borderRadius: '4px',
    minHeight: isMobile ? '150px' : '200px',
    color: theme === 'dark' ? 'white' : 'black',
    border: `1px solid ${theme === 'dark' ? '#555' : '#ccc'}`,
    '& .ql-editor': {
      color: theme === 'dark' ? 'white' : 'black',
      fontSize: isMobile ? '14px' : '16px',
      minHeight: isMobile ? '120px' : '170px',
    },
    '& .ql-toolbar': {
      borderBottom: `1px solid ${theme === 'dark' ? '#555' : '#ccc'}`,
      backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      flexDirection: { xs: 'column', md: 'row' },
      // backgroundColor: theme === 'dark' ? '#121212' : '#f5f5f5'
    }}>
      {/* Sidebar Component - Hidden on mobile */}
      {/* {!isMobile && <Sidebar />} */}
      
      <Container sx={{ 
        mt: { xs: 2, sm: 3, md: 4 }, 
        mb: { xs: 2, sm: 3, md: 4 },
        flexGrow: 1, 
        display: 'flex',
        justifyContent: 'center',
        alignItems: { xs: 'flex-start', md: 'center' },
        px: { xs: 2, sm: 3 },
        width: { xs: '100%', sm: '90%', md: '55%' },
        maxWidth: { xs: '100%', sm: '800px', md: '1000px !important' }
      }}>
        <Paper
          elevation={isMobile ? 1 : 3}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            width: '100%',
            maxWidth: { xs: '100%', sm: '600px', md: '700px' },
            backgroundColor: theme === 'dark' ? '#1a1a1a' : 'white',
            border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
            borderRadius: 2
          }}
        >
          {/* Header */}
          <Typography 
            variant="h4" 
            sx={{ 
              fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' }, 
              mb: { xs: 2, sm: 3 },
              fontWeight: 'bold',
              color: theme === 'dark' ? 'white' : '#012345',
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            Add News
          </Typography>

          {/* Alerts */}
          {message && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 2,
                fontSize: { xs: '0.8rem', sm: '0.875rem' }
              }}
            >
              {message}
            </Alert>
          )}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                fontSize: { xs: '0.8rem', sm: '0.875rem' }
              }}
            >
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: { xs: 2, sm: 2.5, md: 3 }
            }}
          >
            {/* Title Field */}
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme === 'dark' ? '#2a2a2a' : 'white',
                  color: theme === 'dark' ? 'white' : 'black',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  '& fieldset': {
                    borderColor: theme === 'dark' ? '#555' : '#ccc',
                  },
                  '&:hover fieldset': {
                    borderColor: theme === 'dark' ? '#777' : '#999',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#012345',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme === 'dark' ? '#ccc' : '#666',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  '&.Mui-focused': {
                    color: '#012345',
                  },
                },
              }}
            />

            {/* Description Field with ReactQuill */}
            <Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 1,
                  color: theme === 'dark' ? '#ccc' : '#666',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}
              >
                Description *
              </Typography>
              <Box sx={{ 
                '& .ql-container': {
                  fontSize: { xs: '14px', sm: '16px' }
                },
                '& .ql-editor': {
                  minHeight: { xs: '120px', sm: '150px', md: '170px' },
                  color: theme === 'dark' ? 'white' : 'black',
                },
                '& .ql-toolbar': {
                  borderBottom: `1px solid ${theme === 'dark' ? '#555' : '#ccc'}`,
                  backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
                  borderTopLeftRadius: '4px',
                  borderTopRightRadius: '4px',
                },
                '& .ql-container.ql-snow': {
                  border: `1px solid ${theme === 'dark' ? '#555' : '#ccc'}`,
                  borderTop: 'none',
                  backgroundColor: theme === 'dark' ? '#2a2a2a' : 'white',
                  borderBottomLeftRadius: '4px',
                  borderBottomRightRadius: '4px',
                }
              }}>
                <ReactQuill
                  theme="snow"
                  value={description}
                  onChange={setDescription}
                  modules={modules}
                  formats={formats}
                  placeholder="Enter news description..."
                />
              </Box>
            </Box>

            {/* File Upload */}
            <Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 1,
                  color: theme === 'dark' ? '#ccc' : '#666',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}
              >
                Upload Images
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImages([...e.target.files])}
                  style={{ 
                    position: 'absolute',
                    opacity: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer'
                  }}
                  id="file-upload"
                />
                <Button
                  component="label"
                  htmlFor="file-upload"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    width: '100%',
                    p: { xs: 1.5, sm: 2 },
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    borderColor: theme === 'dark' ? '#555' : '#ccc',
                    color: theme === 'dark' ? '#ccc' : '#666',
                    backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f9f9f9',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: theme === 'dark' ? '#777' : '#999',
                      backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0',
                    }
                  }}
                >
                  {images.length > 0 
                    ? `${images.length} image${images.length > 1 ? 's' : ''} selected`
                    : 'Click to upload images or drag and drop'
                  }
                </Button>
              </Box>
            </Box>

            {/* Submit Button */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2}
              sx={{ mt: { xs: 1, sm: 2 } }}
            >
              <Button
                type="submit"
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ 
                  px: { xs: 3, sm: 4 },
                  py: { xs: 1.5, sm: 1.2 },
                  bgcolor: '#627bccff',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontWeight: 500,
                  textTransform: 'none',
                  borderRadius: 2,
                  alignSelf: { xs: 'stretch', sm: 'flex-start' },
                  minHeight: { xs: '48px', sm: '40px' },
                  '&:hover': {
                    bgcolor: '#2c4492ff',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 8px rgba(1, 35, 69, 0.3)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Add News Article
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default NewsAdd;