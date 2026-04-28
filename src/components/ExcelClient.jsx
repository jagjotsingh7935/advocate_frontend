import React, { useState } from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
  Button,
  Input
} from '@mui/material';
import { Save } from '@mui/icons-material';

export default function ExcelClient() {
  const [type, setType] = useState('');
  const [file, setFile] = useState(null);

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSave = () => {
    if (file) {
      console.log('File to be saved:', { type, file });
      // Here you would typically handle the file upload to your backend
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, color: '#25D366', fontWeight: 'bold' }}>
          Excel File Upload
        </Typography>
        
        {/* Type Input */}
        <TextField
          fullWidth
          label="File Type"
          value={type}
          onChange={handleTypeChange}
          sx={{ mb: 3 }}
          variant="outlined"
        />

        {/* File Upload */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Upload Excel File
          </Typography>
          <Input
            type="file"
            inputProps={{ accept: '.xlsx, .xls' }}
            onChange={handleFileChange}
            sx={{ mb: 2 }}
          />
        </Box>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={!type || !file}
            sx={{
              backgroundColor: '#25D366',
              '&:hover': {
                backgroundColor: '#128C7E'
              }
            }}
          >
            Save File
          </Button>
        </Box>

        
      </Paper>
    </Box>
  );
}