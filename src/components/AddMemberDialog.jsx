import React, { memo, useState } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box, 
  TextField,
  MenuItem,
  Grid,
  Typography,
  Snackbar,
  Alert
} from "@mui/material";
import { AddMemberApi } from "../api/Api";
import useMyContext from "../usercontext/useMyContext";

const AddMemberDialog = memo(({ open, onClose }) => {
  const { authme } = useMyContext();
//   console.log('auhtmersf', authme.profile_id);

  const [formData, setFormData] = useState({
    client_id: "",
    relation: "",
    full_name: "",
    pan: "",
    email: "",
    avatar_image: null,
    address: "",
    dob: "",
    phone_number: "",
    file_code: "",
    type: "",
    number: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const relationOptions = [
    "Self",
    "Spouse",
    "Father",
    "Mother",
    "Son",
    "Daughter",
    "Brother",
    "Sister",
    "Other"
  ];

  const typeOptions = [
    "Individual",
    "Business",
    "Trust",
    "Company",
    "Partnership"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, avatar_image: file }));
  };

  const handleSave = async () => {
    console.log("Saving member data:", formData);
    
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== "") {
        if (key === 'avatar_image' && formData[key]) {
          submitData.append(key, formData[key]);
        } else if (key !== 'avatar_image') {
          submitData.append(key, formData[key]);
        }
      }
    });
    submitData.append('client_id', authme?.profile_id);

    try {
      const response = await AddMemberApi(submitData);
      setSnackbar({
        open: true,
        message: "Member added successfully!",
        severity: "success",
      });
      onClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to add member. Please try again.",
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const resetForm = () => {
    setFormData({
      client_id: "",
      relation: "",
      full_name: "",
      pan: "",
      email: "",
      avatar_image: null,
      address: "",
      dob: "",
      phone_number: "",
      file_code: "",
      type: "",
      number: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 2,
            backgroundColor: "#fff",
            p: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: "#1e293b" }}>
          Add New Member
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {/* Relation */}
              <Grid item xs={12} sm={6} sx={{width:{xs:'100%',md:'45%'}}}>
                <TextField
                  label="Relation"
                  name="relation"
                  value={formData.relation}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  required
                />
              </Grid>

              {/* Full Name */}
              <Grid item xs={12} sm={6} sx={{width:{xs:'100%',md:'45%'}}}>
                <TextField
                  label="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  required
                />
              </Grid>

              {/* PAN */}
              <Grid item xs={12} sm={6} sx={{width:{xs:'100%',md:'45%'}}}>
                <TextField
                  label="PAN"
                  name="pan"
                  value={formData.pan}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} sm={6} sx={{width:{xs:'100%',md:'45%'}}}>
                <TextField
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  type="email"
                />
              </Grid>

              {/* Phone Number */}
              <Grid item xs={12} sm={6} sx={{width:{xs:'100%',md:'45%'}}}>
                <TextField
                  label="Phone Number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  type="tel"
                />
              </Grid>

              {/* Date of Birth */}
              <Grid item xs={12} sm={6} sx={{width:{xs:'100%',md:'45%'}}}>
                <TextField
                  label="Date of Birth"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  type="date"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              {/* Type */}
              <Grid item xs={12} sm={6} sx={{width:{xs:'100%',md:'45%'}}}>
                <TextField
                  placeholder="ITR,GST...."
                  label="Type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              </Grid>

              {/* Number */}
              <Grid item xs={12} sm={6} sx={{width:{xs:'100%',md:'45%'}}}>
                <TextField
                  label="Number"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              </Grid>

              {/* File Code */}
              <Grid item xs={12} sm={6} sx={{width:{xs:'100%',md:'45%'}}}>
                <TextField
                  label="File Code"
                  name="file_code"
                  value={formData.file_code}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              </Grid>

              {/* Avatar Image Upload */}
              <Grid item xs={12}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Avatar Image
                  </Typography>
                </Box>
                <TextField
                  type="file"
                  name="avatar_image"
                  onChange={handleFileChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{
                    accept: "image/*"
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                {formData.avatar_image && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Selected: {formData.avatar_image.name}
                  </Typography>
                )}
              </Grid>

              {/* Address */}
              <Grid item xs={12} sx={{width:{xs:'100%',md:'100%'}}}>
                <TextField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: "#64748b" }}>
            Cancel
          </Button>
          <Button onClick={handleSave} sx={{ bgcolor: "#617dd9ff" }} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
});

export default AddMemberDialog;