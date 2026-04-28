import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Alert } from '@mui/material';
import { deleteNews } from '../api/Api';
import Sidebar from './Sidebar';

const NewsDelete = ({ onSuccess }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setError(null);
    setMessage(null);
    try {
      await deleteNews(id);
      setMessage('News deleted successfully');
      if (onSuccess) onSuccess();
      setTimeout(() => navigate('/news/show'), 2000);
    } catch (err) {
      setError(err.error || 'Failed to delete news');
    }
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      <Sidebar />
      <Container sx={{ mt: 4, ml: { xs: 2, sm: 32 }, flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, mb: 3 }}>Delete News</Typography>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Typography sx={{ mb: 2, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
          Are you sure you want to delete news item {id}?
        </Typography>
        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          sx={{ mt: 2, px: { xs: 2, sm: 3 } }}
        >
          Delete
        </Button>
      </Container>
    </Box>
  );
};

export default NewsDelete;