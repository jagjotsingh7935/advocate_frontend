import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, TextField, Button, Alert } from '@mui/material';
import { updateAdmin } from '../api/Api';
import Sidebar from './Sidebar';

const AdminUpdate = () => {
  const { id } = useParams();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const data = { username, email };
    if (password) data.password = password;
    try {
      await updateAdmin(id, data);
      setMessage('Admin updated successfully');
    } catch (err) {
      setError(err.error || 'Failed to update admin');
    }
  };

  return (
  
      <Container sx={{ mt: 4, ml: 32, flexGrow: 1 }}>
        <Typography variant="h4" gutterBottom>Update Admin</Typography>
        {message && <Alert severity="success">{message}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <TextField label="Password (optional)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" variant="contained" color="primary">Update</Button>
        </Box>
      </Container>
   
  );
};

export default AdminUpdate;