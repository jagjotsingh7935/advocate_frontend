import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Alert } from '@mui/material';
import { deleteAdmin } from '../api/Api';
import Sidebar from './Sidebar';

const AdminDelete = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setError(null);
    setMessage(null);
    try {
      await deleteAdmin(id);
      setMessage('Admin deleted successfully');
      setTimeout(() => navigate('/admin/list'), 2000);
    } catch (err) {
      setError(err.error || 'Failed to delete admin');
    }
  };

  return (
   
      <Container sx={{ mt: 4, ml: 32, flexGrow: 1 }}>
        <Typography variant="h4" gutterBottom>Delete Admin</Typography>
        {message && <Alert severity="success">{message}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <Typography>Are you sure you want to delete admin {id}?</Typography>
        <Button variant="contained" color="error" onClick={handleDelete} sx={{ mt: 2 }}>
          Delete
        </Button>
      </Container>
  
  );
};

export default AdminDelete;