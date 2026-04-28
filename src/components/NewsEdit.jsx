import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, TextField, Button, Alert } from '@mui/material';
import { getNews, editNews } from '../api/Api';
import Sidebar from './Sidebar';

const NewsEdit = ({ onSuccess }) => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getNews(id);
        setTitle(data.title);
        setDescription(data.description);
      } catch (err) {
        setError(err.error || 'Failed to fetch news');
      }
    };
    fetchNews();
  }, [id]);

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
      await editNews(id, formData);
      setMessage('News updated successfully');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.error || 'Failed to update news');
    }
  };

  return (
  
      <Container sx={{ mt: 4, ml: { xs: 2, sm: 32 }, flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, mb: 3 }}>Edit News</Typography>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            sx={{ bgcolor: 'white', borderRadius: 1 }}
          />
          <TextField
            label="Description"
            value={description}
            multiline
            rows={4}
            onChange={(e) => setDescription(e.target.value)}
            required
            fullWidth
            sx={{ bgcolor: 'white', borderRadius: 1 }}
          />
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages([...e.target.files])}
            style={{ padding: '10px 0' }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2, alignSelf: 'flex-start', px: { xs: 2, sm: 3 } }}
          >
            Update News
          </Button>
        </Box>
      </Container>
  
  );
};

export default NewsEdit;