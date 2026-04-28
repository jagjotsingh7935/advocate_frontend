import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, Paper } from '@mui/material';
import { getWhatsAppMessageDetail } from '../api/Api';
import Sidebar from './Sidebar';

const WhatsAppMessageDetail = () => {
  const { id } = useParams();
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const data = await getWhatsAppMessageDetail(id);
        setMessage(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessage();
  }, [id]);

  if (!message) return <div>Loading...</div>;

  return (
   
      <Container sx={{ mt: 4, ml: 32, flexGrow: 1 }}>
        <Typography variant="h4" gutterBottom>Message Details</Typography>
        <Paper sx={{ p: 3 }}>
          <Typography><strong>ID:</strong> {message.id}</Typography>
          <Typography><strong>Phone:</strong> {message.phone_number}</Typography>
          <Typography><strong>Message:</strong> {message.message}</Typography>
          <Typography><strong>Status:</strong> {message.status}</Typography>
          <Typography><strong>Scheduled Time:</strong> {message.scheduled_time}</Typography>
          <Typography><strong>Sent Time:</strong> {message.sent_time || 'N/A'}</Typography>
          <Typography><strong>Error:</strong> {message.error_message || 'None'}</Typography>
        </Paper>
      </Container>
  
  );
};

export default WhatsAppMessageDetail;