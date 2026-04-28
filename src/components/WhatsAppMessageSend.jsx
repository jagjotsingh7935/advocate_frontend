import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Alert } from '@mui/material';
import { sendWhatsAppMessage } from '../api/Api';
import Sidebar from './Sidebar';
import send from '../assets/message.svg'
const WhatsAppMessageSend = () => {
  const [file, setFile] = useState(null);
  const [logic, setLogic] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const formData = new FormData();
    formData.append('excel_file', file);
    formData.append('logic', logic);
    formData.append('date', date);
    formData.append('time', time);
    try {
      const response = await sendWhatsAppMessage(formData);
      console.log(response);
      setMessage('Messages scheduled successfully');
    } catch (err) {
      setError(err.error || 'Failed to send messages');
    }
  };

  return (
   
      <Container sx={{ mt: 4,  flexGrow: 1,bgcolor:'#e2e8ffff',margin:'auto',width:'55%',p:5,borderRadius:2 }}>
        <Box
                        sx={{
                          display: 'flex',
                          margin: 'auto',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 120,
                          height: 120,
                          borderRadius: '50%',
                          mb: 2,
                        }}
                      >
                         <img 
                                  src={send}
                                  alt="Message Icon" 
                                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                        
                      </Box>
        <Typography variant="h4" sx={{textAlign:'center',color:'black',fontWeight:'bold'}} gutterBottom>Send WhatsApp Message</Typography>
        {message && <Alert severity="success">{message}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2,width:{xs:'100%',md:'50%'},margin:'auto',mt:5 }}>
          <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files[0])} required />
          <TextField label="Logic" value={logic} onChange={(e) => setLogic(e.target.value)} required />
          <TextField label="Date (YYYY-MM-DD)" value={date} onChange={(e) => setDate(e.target.value)} required />
          <TextField label="Time (HH:MM)" value={time} onChange={(e) => setTime(e.target.value)} required />
          <Button type="submit" variant="contained" sx={{bgcolor:'#4a5fa5'}}>Send</Button>
        </Box>
      </Container>
  
  );
};

export default WhatsAppMessageSend;