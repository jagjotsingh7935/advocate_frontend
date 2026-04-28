import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Avatar,
  IconButton,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Snackbar,
  Alert,
  useTheme,
  alpha,
  Fade,
  Slide,
  CircularProgress,
  Tooltip,
  InputAdornment,
  LinearProgress,
  useMediaQuery
} from '@mui/material';
import { 
  PhotoCamera, 
  Person, 
  Email, 
  Phone, 
  LocationOn,
  Assignment,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error,
  Info
} from '@mui/icons-material';
import { clientRegister } from '../api/Api';
import useMyContext from '../usercontext/useMyContext';

export default function RegisterClientAdmin() {
  const muiTheme = useTheme();
  const { theme } = useMyContext();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: 'client',
    email: '',
    first_name: '',
    last_name: '',
    full_name: '',
    avatar_image: null,
    address: '',
    city: '',
    state: '',
    zip_code: '',
    dob: '',
    father_name: '',
    mother_name: '',
    phone_number: '',
    gender: '',
    category: '',
    aadhaar: '',
    pan: ''
  });
  const [errors, setErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Theme-based colors (keeping original scheme)
  const isDark = theme === 'dark';
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const backgroundColor = isDark ? '#0d0c0f' : '#f8f9fa';
  const paperBackground = isDark ? '#1a1a1a' : '#ffffff';
  const textPrimary = isDark ? '#ffffff' : '#000000';
  const textSecondary = isDark ? '#b0b0b0' : '#666666';
  const borderColor = isDark ? '#4a5fa5' : '#e0e0e0';
  const primaryColor = '#4a5fa5';
  const inputBackground = isDark ? alpha('#ffffff', 0.02) : '#ffffff';

  const steps = [
    { label: 'Personal Information', icon: <Person /> },
    { label: 'Address', icon: <LocationOn /> },
    { label: 'Identity Documents', icon: <Assignment /> }
  ];

  const roles = [
    { value: 'client', label: 'Client' },
    { value: 'admin', label: 'Admin' }
  ];

  const genders = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'obc', label: 'OBC' },
    { value: 'sc', label: 'SC' },
    { value: 'st', label: 'ST' }
  ];

  // Enhanced validation with real-time feedback
  const validationRules = useMemo(() => ({
    email: (value) => {
      if (!value) return 'Email is required';
      if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email address';
      return '';
    },
    first_name: (value) => !value ? 'First name is required' : '',
    last_name: (value) => !value ? 'Last name is required' : '',
    phone_number: (value) => {
      if (!value) return 'Phone number is required';
      if (!/^\d{10,15}$/.test(value)) return 'Phone number must be 10-15 digits';
      return '';
    },
    address: (value) => !value ? 'Address is required' : '',
    city: (value) => !value ? 'City is required' : '',
    state: (value) => !value ? 'State is required' : '',
    zip_code: (value) => {
      if (!value) return 'ZIP code is required';
      if (!/^\d{5,6}$/.test(value)) return 'ZIP code must be 5-6 digits';
      return '';
    },
    aadhaar: (value) => {
      if (value && !/^\d{12}$/.test(value)) return 'Aadhaar must be 12 digits';
      return '';
    },
    pan: (value) => {
      if (value && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) return 'PAN format should be AAAAA9999A';
      return '';
    },
    dob: (value) => {
      if (value) {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18) return 'Must be at least 18 years old';
        if (age > 100) return 'Please enter a valid date of birth';
      }
      return '';
    }
  }), []);

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    
    // Format PAN to uppercase
    const formattedValue = name === 'pan' ? value.toUpperCase() : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Auto-generate full name
    if (name === 'first_name' || name === 'last_name') {
      const firstName = name === 'first_name' ? formattedValue : formData.first_name;
      const lastName = name === 'last_name' ? formattedValue : formData.last_name;
      setFormData(prev => ({
        ...prev,
        full_name: `${firstName} ${lastName}`.trim()
      }));
    }

    // Real-time validation
    if (validationRules[name]) {
      const error = validationRules[name](formattedValue);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [formData.first_name, formData.last_name, validationRules]);

  const handleImageChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'Image size should be less than 5MB',
          severity: 'error'
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSnackbar({
          open: true,
          message: 'Please select a valid image file',
          severity: 'error'
        });
        return;
      }

      setFormData(prev => ({
        ...prev,
        avatar_image: file
      }));

      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const validateStep = useCallback(() => {
    const newErrors = {};
    const stepFields = {
      0: ['email', 'first_name', 'last_name', 'phone_number', 'dob'],
      1: ['address', 'city', 'state', 'zip_code'],
      2: ['aadhaar', 'pan']
    };

    stepFields[activeStep]?.forEach(field => {
      if (validationRules[field]) {
        const error = validationRules[field](formData[field]);
        if (error) newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      setSnackbar({
        open: true,
        message: 'Please fix the errors in the form before proceeding.',
        severity: 'error'
      });
    }
    
    return Object.keys(newErrors).length === 0;
  }, [activeStep, formData, validationRules]);

  const handleNext = useCallback((event) => {
    event.preventDefault();
    if (validateStep()) {
      setActiveStep(prev => prev + 1);
    }
  }, [validateStep]);

  const handleBack = useCallback(() => {
    setActiveStep(prev => prev - 1);
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    if (validateStep()) {
      setIsLoading(true);
      try {
        console.log('Form submitted:', formData);
        const response = await clientRegister(formData);
        console.log(response);
        setSnackbar({
          open: true,
          message: 'Registration successful! Welcome aboard!',
          severity: 'success'
        });
        
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            role: '', email: '', first_name: '', last_name: '', full_name: '',
            avatar_image: null, address: '', city: '', state: '', zip_code: '',
            dob: '', father_name: '', mother_name: '', phone_number: '',
            gender: '', category: '', aadhaar: '', pan: ''
          });
          setAvatarPreview(null);
          setActiveStep(0);
        }, 2000);
        
      } catch (error) {
        setSnackbar({
          open: true,
          message: `Registration failed: ${error.email || 'Please try again.'}`,
          severity: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [validateStep, formData]);

  // Enhanced styling with original color scheme
  const textFieldStyles = useMemo(() => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      transition: 'all 0.3s ease',
      bgcolor: inputBackground,
      '& fieldset': {
        borderColor: borderColor,
      },
      '&:hover fieldset': {
        borderColor: primaryColor,
        boxShadow: `0 4px 12px ${alpha(primaryColor, 0.15)}`
      },
      '&.Mui-focused fieldset': {
        borderColor: primaryColor,
        boxShadow: `0 6px 20px ${alpha(primaryColor, 0.25)}`
      },
      '&.Mui-error fieldset': {
        borderColor: '#f44336',
      }
    },
    '& .MuiInputBase-input': {
      color: textPrimary
    },
    '& .MuiInputLabel-root': {
      color: textSecondary,
      '&.Mui-focused': {
        color: primaryColor
      }
    },
    '& .MuiFormHelperText-root': {
      color: textSecondary,
      '&.Mui-error': {
        color: '#f44336'
      }
    }
  }), [inputBackground, borderColor, primaryColor, textPrimary, textSecondary]);

  const selectStyles = useMemo(() => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      transition: 'all 0.3s ease',
      bgcolor: inputBackground,
      '& fieldset': {
        borderColor: borderColor,
      },
      '&:hover fieldset': {
        borderColor: primaryColor,
      },
      '&.Mui-focused fieldset': {
        borderColor: primaryColor,
      }
    },
    '& .MuiSelect-select': {
      color: textPrimary
    },
    '& .MuiInputLabel-root': {
      color: textSecondary,
      '&.Mui-focused': {
        color: primaryColor
      }
    }
  }), [inputBackground, borderColor, primaryColor, textPrimary, textSecondary]);

  const getFieldIcon = (fieldName) => {
    const icons = {
      email: <Email />,
      phone_number: <Phone />,
      address: <LocationOn />,
      aadhaar: <Assignment />,
      pan: <Assignment />
    };
    return icons[fieldName];
  };

  const getStepContent = (step) => {
    const slideProps = {
      direction: 'left',
      in: true,
      mountOnEnter: true,
      unmountOnExit: true
    };

    switch (step) {
      case 0:
        return (
          <Slide {...slideProps}>
            <Box>
              <Grid item xs={12} sx={{ textAlign: 'center', mb: 3, width: { xs: '100%', md: '100%' } }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    src={avatarPreview}
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      mx: 'auto', 
                      mb: 2,
                      bgcolor: isDark ? alpha(primaryColor, 0.1) : alpha(primaryColor, 0.05),
                      border: `3px solid ${alpha(primaryColor, 0.2)}`,
                      boxShadow: `0 8px 24px ${alpha(primaryColor, 0.2)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: `0 12px 32px ${alpha(primaryColor, 0.3)}`
                      },
                      '& .MuiSvgIcon-root': {
                        color: primaryColor,
                        fontSize: 60
                      }
                    }}
                  >
                    <Person sx={{ fontSize: 60 }} />
                  </Avatar>
                  
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress}
                      sx={{
                        position: 'absolute',
                        bottom: 15,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '80%',
                        borderRadius: 2,
                        bgcolor: alpha('#ffffff', 0.2),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: primaryColor
                        }
                      }}
                    />
                  )}
                  
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="avatar-upload"
                    type="file"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="avatar-upload">
                    <Tooltip title="Upload Profile Picture" placement="top">
                      <IconButton
                        color="primary"
                        component="span"
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                          color: primaryColor,
                          border: `2px solid ${primaryColor}`,
                          boxShadow: `0 4px 12px ${alpha(primaryColor, 0.3)}`,
                          '&:hover': { 
                            backgroundColor: alpha(primaryColor, 0.1),
                            transform: 'scale(1.1)',
                            boxShadow: `0 6px 20px ${alpha(primaryColor, 0.4)}`
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <PhotoCamera />
                      </IconButton>
                    </Tooltip>
                  </label>
                </Box>
                <Typography 
                  variant="caption" 
                  display="block" 
                  sx={{ color: textSecondary, mt: 1, fontSize: '0.9rem' }}
                >
                  Upload Profile Picture (Max 5MB)
                </Typography>
              </Grid>

              {/* <Grid item xs={12} sm={6} sx={{ width: { xs: '100%', md: '30%' }, mb: 2 }}>
                <FormControl fullWidth sx={selectStyles}>
                  <InputLabel>Role *</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    label="Role *"
                    required
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: isDark ? '#1a1a1a' : '#ffffff',
                          border: `1px solid ${borderColor}`,
                          '& .MuiMenuItem-root': {
                            color: textPrimary,
                            '&:hover': {
                              bgcolor: alpha(primaryColor, 0.1)
                            },
                            '&.Mui-selected': {
                              bgcolor: alpha(primaryColor, 0.2)
                            }
                          }
                        }
                      }
                    }}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid> */}


              {/* <Grid item xs={12} sx={{ width: { xs: '100%', md: '100%' }, my: 2 }}>
                <Divider sx={{ borderColor: alpha(textSecondary, 0.2) }}>
                  <Typography variant="body2" sx={{ color: textSecondary, px: 2, fontWeight: 500 }}>
                    Personal Information
                  </Typography>
                </Divider>
              </Grid> */}

              <Grid container spacing={2} sx={{ width: '100%' }}>
                
              <Grid item xs={12} sm={6} sx={{ width: { xs: '100%', md: '50%' }, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={!!errors.email}
                  helperText={errors.email || 'We\'ll use this to contact you'}
                  required
                  sx={textFieldStyles}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: errors.email ? '#f44336' : textSecondary }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
                <Grid item xs={12} sm={6} sx={{ width: { xs: '100%', md: '48%' }}}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    error={!!errors.first_name}
                    helperText={errors.first_name}
                    required
                    sx={textFieldStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6} sx={{ width: { xs: '100%', md: '50%' }}}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    error={!!errors.last_name}
                    helperText={errors.last_name}
                    required
                    sx={textFieldStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6} sx={{ width: { xs: '100%', md: '48%' }}}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="full_name"
                    value={formData.full_name}
                    InputProps={{
                      readOnly: true,
                      endAdornment: formData.full_name && (
                        <InputAdornment position="end">
                          <CheckCircle sx={{ color: primaryColor, fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }}
                    helperText="Auto-generated from first and last name"
                    sx={textFieldStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6} sx={{ width: { xs: '100%', md: '36%' }}}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    error={!!errors.phone_number}
                    helperText={errors.phone_number}
                    required
                    sx={textFieldStyles}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: errors.phone_number ? '#f44336' : textSecondary }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} sx={{ width: { xs: '100%', md: '30%' }}}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleInputChange}
                    error={!!errors.dob}
                    helperText={errors.dob}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={textFieldStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6} sx={{ width: { xs: '100%', md: '30%' }}}>
                  <FormControl fullWidth sx={selectStyles}>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      label="Gender"
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            bgcolor: isDark ? '#1a1a1a' : '#ffffff',
                            border: `1px solid ${borderColor}`,
                            '& .MuiMenuItem-root': {
                              color: textPrimary,
                              '&:hover': {
                                bgcolor: alpha(primaryColor, 0.1)
                              }
                            }
                          }
                        }
                      }}
                    >
                      {genders.map((gender) => (
                        <MenuItem key={gender.value} value={gender.value}>
                          {gender.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} sx={{ width: { xs: '100%', md: '36%' }}}>
                  <TextField
                    fullWidth
                    label="Father's Name"
                    name="father_name"
                    value={formData.father_name}
                    onChange={handleInputChange}
                    sx={textFieldStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6} sx={{ width: { xs: '100%', md: '30%' }}}>
                  <TextField
                    fullWidth
                    label="Mother's Name"
                    name="mother_name"
                    value={formData.mother_name}
                    onChange={handleInputChange}
                    sx={textFieldStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6} sx={{ width: { xs: '100%', md: '30%' }}}>
                  <FormControl fullWidth sx={selectStyles}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      label="Category"
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            bgcolor: isDark ? '#1a1a1a' : '#ffffff',
                            border: `1px solid ${borderColor}`,
                            '& .MuiMenuItem-root': {
                              color: textPrimary,
                              '&:hover': {
                                bgcolor: alpha(primaryColor, 0.1)
                              }
                            }
                          }
                        }
                      }}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.value} value={category.value}>
                          {category.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Slide>
        );

      case 1:
        return (
          <Slide {...slideProps}>
            <Box>
              <Grid item xs={12} sx={{ width: { xs: '100%', md: '100%' }, mb: 3 }}>
                <Divider sx={{ borderColor: alpha(textSecondary, 0.2) }}>
                  <Typography variant="body2" sx={{ color: textSecondary, px: 2, fontWeight: 500 }}>
                    Address Information
                  </Typography>
                </Divider>
              </Grid>

              <Grid container spacing={2} >
                <Grid item xs={12} sx={{ width: { xs: '100%', md: '100%' }}}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    multiline
                    rows={3}
                    value={formData.address}
                    onChange={handleInputChange}
                    error={!!errors.address}
                    helperText={errors.address || 'Enter your complete address'}
                    required
                    sx={textFieldStyles}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                          <LocationOn sx={{ color: errors.address ? '#f44336' : textSecondary }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} sx={{ width: { xs: '100%', md: '32%' }}}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    error={!!errors.city}
                    helperText={errors.city}
                    required
                    sx={textFieldStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6} sx={{ width: { xs: '100%', md: '32%' }}}>
                  <TextField
                    fullWidth
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    error={!!errors.state}
                    helperText={errors.state}
                    required
                    sx={textFieldStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6} sx={{ width: { xs: '100%', md: '32%' }}}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    error={!!errors.zip_code}
                    helperText={errors.zip_code}
                    required
                    sx={textFieldStyles}
                  />
                </Grid>
              </Grid>
            </Box>
          </Slide>
        );

      case 2:
        return (
          <Slide {...slideProps}>
            <Box>
              <Grid item xs={12} sx={{ width: { xs: '100%', md: '100%' }, mb: 3 }}>
                <Divider sx={{ borderColor: alpha(textSecondary, 0.2) }}>
                  <Typography variant="body2" sx={{ color: textSecondary, px: 2, fontWeight: 500 }}>
                    Identity Documents
                  </Typography>
                </Divider>
              </Grid>

              <Grid container spacing={2} sx={{ width: '100%' }}>
                <Grid item xs={12} sm={6} sx={{ width: { xs: '100%', md: '49%' }}}>
                  <TextField
                    fullWidth
                    label="Aadhaar Number"
                    name="aadhaar"
                    value={formData.aadhaar}
                    onChange={handleInputChange}
                    error={!!errors.aadhaar}
                    helperText={errors.aadhaar || "12-digit Aadhaar number (optional)"}
                    inputProps={{ maxLength: 12 }}
                    sx={textFieldStyles}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Assignment sx={{ color: errors.aadhaar ? '#f44336' : textSecondary }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} sx={{ width: { xs: '100%', md: '49%' }}}>
                  <TextField
                    fullWidth
                    label="PAN Number"
                    name="pan"
                    value={formData.pan}
                    onChange={handleInputChange}
                    error={!!errors.pan}
                    helperText={errors.pan || "Format: AAAAA9999A (optional)"}
                    inputProps={{ maxLength: 10, style: { textTransform: 'uppercase' } }}
                    sx={textFieldStyles}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Assignment sx={{ color: errors.pan ? '#f44336' : textSecondary }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, p: 3, bgcolor: alpha(primaryColor, 0.05), borderRadius: 2, border: `1px solid ${alpha(primaryColor, 0.2)}` }}>
                <Typography variant="h6" sx={{ color: primaryColor, mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Info sx={{ mr: 1 }} />
                  Review Your Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: textSecondary }}>
                      <strong>Name:</strong> {formData.full_name || 'Not provided'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: textSecondary, mt: 1 }}>
                      <strong>Email:</strong> {formData.email || 'Not provided'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: textSecondary, mt: 1 }}>
                      <strong>Phone:</strong> {formData.phone_number || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: textSecondary }}>
                      <strong>City:</strong> {formData.city || 'Not provided'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: textSecondary, mt: 1 }}>
                      <strong>State:</strong> {formData.state || 'Not provided'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: textSecondary, mt: 1 }}>
                      <strong>Role:</strong> {formData.role || 'Not selected'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Slide>
        );

      default:
        return 'Unknown step';
    }
  };

  const getStepProgress = () => {
    return ((activeStep + 1) / steps.length) * 100;
  };

  return (
    <Box sx={{
      maxWidth: '100%',
      p: 1,
      minHeight: '100vh',
      bgcolor: backgroundColor,
      position: 'relative',
      mt:{xs:10,md:0},
        mb:{xs:10,md:0},

      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        // background: `linear-gradient(90deg, ${primaryColor} 0%, ${alpha(primaryColor, 0.7)} 100%)`
      }
    }}>
      {/* Progress bar for overall completion */}
      <LinearProgress
        variant="determinate"
        value={getStepProgress()}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1300,
          height: 3,
          bgcolor: alpha('#000000', 0.1),
          '& .MuiLinearProgress-bar': {
            bgcolor: primaryColor,
            transition: 'transform 0.4s ease'
          }
        }}
      />

      <Fade in={true} timeout={800}>
        <Paper 
          elevation={isDark ? 12 : 6} 
          sx={{ 
            p: { xs: 3, md: 5 },
            maxWidth: '900px',
            mx: 'auto',
            bgcolor: paperBackground,
            borderRadius: 4,
            border: `1px solid ${borderColor}`,
            boxShadow: isDark 
              ? `0 16px 48px ${alpha('#000000', 0.7)}, 0 0 0 1px ${alpha(primaryColor, 0.1)}` 
              : `0 16px 48px ${alpha('#000000', 0.12)}, 0 0 0 1px ${alpha(primaryColor, 0.05)}`,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: `linear-gradient(90deg, transparent 0%, ${primaryColor} 50%, transparent 100%)`,
              opacity: 0.6
            }
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              sx={{ 
                color: theme === 'dark' ? '#ffff' : '#4a5fa5',
                fontWeight: 'bold',
                textShadow: `0 2px 8px ${alpha(primaryColor, 0.3)}`,
                mb: 1,
                fontSize:{xs:'1.5rem',md:'2rem'},
                background: isDark 
                  ? `linear-gradient(135deg, #ffffff 0%, ${alpha('#ffffff', 0.8)} 100%)`
                  : `linear-gradient(135deg, ${primaryColor} 0%, ${alpha(primaryColor, 0.8)} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: theme === 'dark' ? '#ffffff' : 'transparent',
              }}
            >
              Client Registration
            </Typography>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: textSecondary,
                mb: 3,
                fontWeight: 400
              }}
            >
              Please fill in your details to create your account
            </Typography>
          </Box>

          <Stepper 
            activeStep={activeStep} 
            sx={{ 
              mb: 5,
              '& .MuiStepLabel-root': {
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              },
              '& .MuiStepLabel-label': {
                color: textSecondary,
                fontWeight: 500,
                fontSize: '0.95rem',
                '&.Mui-active': {
                  color: primaryColor,
                  fontWeight: 600
                },
                '&.Mui-completed': {
                  color: primaryColor,
                  fontWeight: 500
                }
              },
              '& .MuiStepIcon-root': {
                color: isDark ? alpha('#ffffff', 0.3) : alpha('#000000', 0.3),
                fontSize: '2rem',
                transition: 'all 0.3s ease',
                '&.Mui-active': {
                  color: primaryColor,
                  transform: 'scale(1.1)',
                  filter: `drop-shadow(0 4px 8px ${alpha(primaryColor, 0.3)})`
                },
                '&.Mui-completed': {
                  color: primaryColor,
                  transform: 'scale(1.05)'
                }
              },
              '& .MuiStepConnector-line': {
                borderColor: isDark ? alpha('#ffffff', 0.2) : alpha('#000000', 0.2),
                borderTopWidth: 2,
                transition: 'all 0.3s ease'
              },
              '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
                borderColor: primaryColor,
                borderTopWidth: 3
              },
              '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
                borderColor: alpha(primaryColor, 0.6)
              }
            }}
          >
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel 
                  icon={
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: index <= activeStep 
                        ? primaryColor 
                        : isDark ? alpha('#ffffff', 0.1) : alpha('#000000', 0.1),
                      color: index <= activeStep 
                        ? '#ffffff' 
                        : textSecondary,
                      transition: 'all 0.3s ease',
                      border: index === activeStep 
                        ? `2px solid ${primaryColor}` 
                        : 'none',
                      boxShadow: index === activeStep 
                        ? `0 4px 12px ${alpha(primaryColor, 0.4)}` 
                        : 'none'
                    }}>
                      {index < activeStep ? (
                        <CheckCircle sx={{ fontSize: 24 }} />
                      ) : (
                        React.cloneElement(step.icon, { sx: { fontSize: 20 } })
                      )}
                    </Box>
                  }
                >
                  {!isMobile && (

                  <Typography sx={{fontSize:{xs:'0.7rem',md:'0.9rem'}}}>{step.label}</Typography>
                  )}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <form onSubmit={handleSubmit}>
            <Box sx={{ minHeight: '400px', position: 'relative' }}>
              {getStepContent(activeStep)}
            </Box>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mt: 4,
              pt: 3,
              borderTop: `1px solid ${alpha(textSecondary, 0.1)}`
            }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
                size="large"
                sx={{  
                  fontSize: '1rem',
                  px: 4,
                  py: 1.5,
                  borderColor: primaryColor,
                  color: primaryColor,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  minWidth: 120,
                  '&:hover': {
                    borderColor: primaryColor,
                    backgroundColor: alpha(primaryColor, 0.08),
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${alpha(primaryColor, 0.2)}`
                  },
                  '&:disabled': {
                    borderColor: isDark ? alpha('#ffffff', 0.2) : alpha('#000000', 0.2),
                    color: isDark ? alpha('#ffffff', 0.3) : alpha('#000000', 0.26)
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Back
              </Button>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
           
                
                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    sx={{ 
                      fontSize: '1rem',
                      px: 4,
                      py: 0,
                      ml:1,
                      bgcolor: primaryColor,
                      color: '#ffffff',
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 600,
                      minWidth: 120,
                      boxShadow: `0 4px 16px ${alpha(primaryColor, 0.4)}`,
                      '&:hover': {
                        bgcolor: primaryColor,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 28px ${alpha(primaryColor, 0.5)}`
                      },
                      '&:disabled': {
                        bgcolor: alpha(primaryColor, 0.5),
                        color: alpha('#ffffff', 0.7)
                      },
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {isLoading ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1, color: '#ffffff' }} />
                        Registering...
                      </>
                    ) : (
                      'Complete Registration'
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    variant="contained"
                    size="large"
                    sx={{  
                      fontSize: '1rem',
                      px: 4,
                      py: 1.5,
                      bgcolor: primaryColor,
                      color: '#ffffff',
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 600,
                      minWidth: 120,
                      boxShadow: `0 4px 16px ${alpha(primaryColor, 0.4)}`,
                      '&:hover': {
                        bgcolor: primaryColor,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 28px ${alpha(primaryColor, 0.5)}`
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </form>
        </Paper>
      </Fade>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ zIndex: 2000 }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: `0 8px 32px ${alpha('#000000', 0.2)}`,
            bgcolor: isDark 
              ? (snackbar.severity === 'error' ? alpha('#f44336', 0.1) : alpha('#4caf50', 0.1))
              : undefined,
            color: isDark 
              ? (snackbar.severity === 'error' ? '#ff6b6b' : '#69f0ae')
              : undefined,
            border: isDark 
              ? `1px solid ${alpha(snackbar.severity === 'error' ? '#f44336' : '#4caf50', 0.2)}`
              : undefined,
            '& .MuiAlert-icon': {
              color: isDark 
                ? (snackbar.severity === 'error' ? '#ff6b6b' : '#69f0ae')
                : undefined
            },
            '& .MuiAlert-action': {
              color: isDark 
                ? (snackbar.severity === 'error' ? '#ff6b6b' : '#69f0ae')
                : undefined
            }
          }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}