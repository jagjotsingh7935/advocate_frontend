import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Paper,
  LinearProgress,
  CircularProgress,
  AlertTitle,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
  StepButton
} from '@mui/material';
import {
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  TrendingUp as TrendingUpIcon,
  Close as CloseIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon
} from '@mui/icons-material';
import useMyContext from '../usercontext/useMyContext';

export default function EnhancedClientProfile() {
  const { theme } = useMyContext();
  const [editMode, setEditMode] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showCompletionAlert, setShowCompletionAlert] = useState(true);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [currentSection, setCurrentSection] = useState('personal');

  const [clientData, setClientData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Solutions Inc.',
    position: 'Senior Developer',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
    website: '',
    linkedin: '',
    documentId: '',
    documentType: '',
    notes: 'Long-term client, prefers email communication.',
    status: 'Active'
  });

  const [editData, setEditData] = useState({ ...clientData });

  const fieldConfig = {
    personal: [
      { key: 'firstName', label: 'First Name', weight: 20 },
      { key: 'lastName', label: 'Last Name', weight: 20 }
    ],
    contact: [
      { key: 'email', label: 'Email', weight: 20 },
      { key: 'phone', label: 'Phone', weight: 15 },
      { key: 'website', label: 'Website', weight: 10 },
      { key: 'linkedin', label: 'LinkedIn', weight: 10 }
    ],
    document: [
      { key: 'documentId', label: 'Document ID', weight: 15 },
      { key: 'documentType', label: 'Document Type', weight: 15 }
    ]
  };

  const completionMetrics = useMemo(() => {
    const allFields = [
      ...fieldConfig.personal,
      ...fieldConfig.contact,
      ...fieldConfig.document
    ];

    const categoryMetrics = {};
    let totalWeight = 0;
    let completedWeight = 0;
    let totalFields = 0;
    let completedFields = 0;

    Object.entries(fieldConfig).forEach(([category, fields]) => {
      let categoryWeight = 0;
      let categoryCompletedWeight = 0;
      let categoryFields = 0;
      let categoryCompletedFields = 0;

      fields.forEach(field => {
        const isEmpty = !clientData[field.key] || clientData[field.key].trim() === '';
        categoryWeight += field.weight;
        categoryFields += 1;
        totalWeight += field.weight;
        totalFields += 1;

        if (!isEmpty) {
          categoryCompletedWeight += field.weight;
          categoryCompletedFields += 1;
          completedWeight += field.weight;
          completedFields += 1;
        }
      });

      categoryMetrics[category] = {
        percentage: categoryFields > 0 ? (categoryCompletedFields / categoryFields) * 100 : 0,
        completedFields: categoryCompletedFields,
        totalFields: categoryFields,
        isComplete: categoryCompletedFields === categoryFields,
        fields: fields.map(field => ({
          ...field,
          completed: !(!clientData[field.key] || clientData[field.key].trim() === '')
        }))
      };
    });

    const overallPercentage = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
    const missingEssentialFields = [
      ...fieldConfig.personal,
      ...fieldConfig.contact
    ].filter(field => 
      !clientData[field.key] || clientData[field.key].trim() === ''
    );

    return {
      overall: {
        percentage: overallPercentage,
        completedFields,
        totalFields
      },
      categories: categoryMetrics,
      missingEssentialFields,
      isProfileComplete: overallPercentage >= 90,
      needsAttention: missingEssentialFields.length > 0 || overallPercentage < 70
    };
  }, [clientData]);

  useEffect(() => {
    if (completionMetrics.needsAttention && !editMode) {
      const timer = setTimeout(() => {
        setShowSnackbar(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [completionMetrics.needsAttention, editMode]);

  const handleEdit = () => {
    setEditData({ ...clientData });
    setEditMode(true);
  };

  const handleSave = () => {
    const previousCompletion = completionMetrics.overall.percentage;
    setClientData({ ...editData });
    setEditMode(false);
    setShowAlert(true);
    
    setTimeout(() => {
      const newCompletion = calculateCompletionForData(editData);
      if (newCompletion > previousCompletion) {
        setShowSnackbar(true);
      }
    }, 100);
    
    setTimeout(() => setShowAlert(false), 3000);
  };

  const calculateCompletionForData = (data) => {
    const allFields = [
      ...fieldConfig.personal,
      ...fieldConfig.contact,
      ...fieldConfig.document
    ];
    
    let totalWeight = 0;
    let completedWeight = 0;
    
    allFields.forEach(field => {
      totalWeight += field.weight;
      if (data[field.key] && data[field.key].trim() !== '') {
        completedWeight += field.weight;
      }
    });
    
    return totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
  };

  const handleCancel = () => {
    setEditData({ ...clientData });
    setEditMode(false);
  };

  const handleInputChange = (field) => (event) => {
    setEditData({
      ...editData,
      [field]: event.target.value
    });
  };

  const handleSectionChange = (section) => () => {
    setCurrentSection(section);
  };

  const handlePreviousSection = () => {
    const sections = ['personal', 'contact', 'document'];
    const currentIndex = sections.indexOf(currentSection);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : 0;
    setCurrentSection(sections[prevIndex]);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const isEmpty = (value) => {
    return !value || value.trim() === '';
  };

  const getCompletionColor = (percentage) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'warning';
    return 'error';
  };

  const CategoryProgress = ({ title, category, data }) => (
    <Card sx={{ mb: 2, boxShadow:'none',bgcolor: theme === 'dark' ? 'black' : 'white' }}>
      <CardContent sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div" sx={{ color: theme === 'dark' ? 'white' : '#012345' }}>
            {title}
          </Typography>
          <Chip 
            label={data.isComplete ? 'Complete' : `${data.completedFields}/${data.totalFields}`}
            color={data.isComplete ? 'success' : data.percentage >= 50 ? 'warning' : 'error'}
            size="small"
            icon={data.isComplete ? <CheckCircleIcon /> : null}
            sx={{ color: theme === 'dark' ? 'white' : '#012345' }}
          />
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={data.percentage} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            mb: 2,
            '& .MuiLinearProgress-bar': {
              borderRadius: 4
            }
          }}
          color={getCompletionColor(data.percentage)}
        />
        <Typography variant="body2" sx={{ mb: 1, color: theme === 'dark' ? 'white' : '#012345' }}>
          {data.percentage.toFixed(1)}% Complete
        </Typography>
        <List dense>
          {data.fields.map((field) => (
            <ListItem key={field.key} sx={{ py: 0.25 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                {field.completed ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <RadioButtonUncheckedIcon color="error" fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText 
                primary={field.label}
                primaryTypographyProps={{ 
                  variant: 'body2',
                  color: theme === 'dark' ? 'white' : '#012345'
                }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const DisplayField = ({ label, value, icon: Icon, isEmpty: empty }) => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Icon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
        <Typography variant="subtitle2" sx={{ color: theme === 'dark' ? 'white' : '#012345' }}>
          {label}
        </Typography>
        {empty && (
          <Chip 
            label="Missing" 
            size="small" 
            color="error" 
            sx={{ ml: 1, height: 20 }}
          />
        )}
      </Box>
      <Typography variant="body1" sx={{ ml: 3, color: theme === 'dark' ? 'white' : 'text.disabled' }}>
        {empty ? 'Not provided' : value}
      </Typography>
    </Box>
  );

  const sections = [
    { key: 'personal', label: 'Personal Info' },
    { key: 'contact', label: 'Contact Info' },
    { key: 'document', label: 'Document Info' }
  ];

  const renderSection = (section) => {
    let title, fields, icon;
    switch (section) {
      case 'personal':
        title = 'Personal Information';
        fields = [
          { key: 'firstName', label: 'First Name', icon: PersonIcon },
          { key: 'lastName', label: 'Last Name', icon: PersonIcon }
        ];
        break;
      case 'contact':
        title = 'Contact Information';
        fields = [
          { key: 'email', label: 'Email', icon: EmailIcon },
          { key: 'phone', label: 'Phone', icon: PhoneIcon },
          { key: 'website', label: 'Website', icon: BusinessIcon },
          { key: 'linkedin', label: 'LinkedIn', icon: PersonIcon }
        ];
        break;
      case 'document':
        title = 'Document Information';
        fields = [
          { key: 'documentId', label: 'Document ID', icon: BusinessIcon },
          { key: 'documentType', label: 'Document Type', icon: BusinessIcon }
        ];
        break;
      default:
        return null;
    }

    const missingFields = completionMetrics.categories[section].fields.filter(field => !field.completed);

    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: theme === 'dark' ? 'black' : 'white', boxShadow: 'none',border:theme === 'dark' ? '1px solid #abbefd' : '1px solid white' }}>
        <CategoryProgress 
          title={title} 
          category={section} 
          data={completionMetrics.categories[section]} 
        />
        
        {missingFields.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>Missing Information</AlertTitle>
            Please complete: {missingFields.map(field => field.label).join(', ')}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          {fields.map(field => (
            <DisplayField 
              key={field.key}
              label={field.label}
              value={clientData[field.key]}
              icon={field.icon}
              isEmpty={isEmpty(clientData[field.key])}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            disabled={editMode}
            sx={{ bgcolor: '#768bd0ff', '&:hover': { bgcolor: '#42538aff' } }}
          >
            Update {title}
          </Button>
          <Box>
            {section !== 'personal' && (
              <Button
                variant="outlined"
                startIcon={<NavigateBeforeIcon />}
                onClick={handlePreviousSection}
                sx={{ mr: 1, color: theme === 'dark' ? 'white' : '#012345', borderColor: theme === 'dark' ? 'white' : '#012345' }}
              >
                Previous
              </Button>
            )}
            {section !== 'document' && (
              <Button
                variant="outlined"
                endIcon={<NavigateNextIcon />}
                onClick={() => {
                  const currentIndex = sections.findIndex(s => s.key === section);
                  const nextIndex = (currentIndex + 1) % sections.length;
                  setCurrentSection(sections[nextIndex].key);
                }}
                sx={{ color: theme === 'dark' ? 'white' : '#012345', borderColor: theme === 'dark' ? 'white' : '#012345' }}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3, bgcolor: theme === 'dark' ? '#0d0c0f' : '#c7d4ffff', borderRadius: 2 }}>
      {showAlert && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Client profile updated successfully!
        </Alert>
      )}

      <Collapse in={showCompletionAlert && completionMetrics.needsAttention}>
        <Alert 
          severity={completionMetrics.missingEssentialFields.length > 0 ? "error" : "warning"}
          sx={{ mb: 2 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setShowCompletionAlert(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          <AlertTitle>
            {completionMetrics.missingEssentialFields.length > 0 
              ? "Essential Information Missing" 
              : "Profile Incomplete"
            }
          </AlertTitle>
          {completionMetrics.missingEssentialFields.length > 0 ? (
            <>
              Please complete these essential fields: {' '}
              {completionMetrics.missingEssentialFields.map(field => field.label).join(', ')}
            </>
          ) : (
            <>
              Your profile is {completionMetrics.overall.percentage.toFixed(1)}% complete. 
              Consider adding more information to improve client relationships.
            </>
          )}
        </Alert>
      </Collapse>

      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Avatar
          sx={{ width: 60, height: 60, mr: 2, bgcolor: 'primary.main' }}
        >
          {getInitials(clientData.firstName, clientData.lastName)}
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ color: theme === 'dark' ? 'white' : '#012345',fontWeight:'bold' }}>
            {clientData.firstName} {clientData.lastName}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={clientData.status}
              color={clientData.status === 'Active' ? 'success' : 'default'}
              size="small"
              sx={{ color:'white' }}
            />
            <Chip 
              label={`${Math.round(completionMetrics.overall.percentage)}% Complete`}
              color={getCompletionColor(completionMetrics.overall.percentage)}
              size="small"
              variant="outlined"
              sx={{ color: theme === 'dark' ? 'white' : '#012345', borderColor: theme === 'dark' ? 'white' : '#012345' }}
            />
          </Box>
        </Box>
      </Box>

      <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: theme === 'dark' ? 'black' : 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',border:theme === 'dark' ? '1px solid #abbefd' : '1px solid white' }}>
        <Stepper activeStep={sections.findIndex(s => s.key === currentSection)} alternativeLabel>
          {sections.map(section => (
            <Step key={section.key} completed={completionMetrics.categories[section.key].isComplete}>
              <StepButton 
                onClick={handleSectionChange(section.key)}
                sx={{ '& .MuiStepLabel-label': { color: theme === 'dark' ? 'white' : '#012345' } }}
              >
                {section.label}
              </StepButton>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {renderSection(currentSection)}

      <Dialog open={editMode} onClose={handleCancel} maxWidth="md" fullWidth>
        <DialogTitle sx={{ color: theme === 'dark' ? 'white' : '#012345', bgcolor: theme === 'dark' ? 'black' : 'white' }}>
          Update {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)} Information
        </DialogTitle>
        <DialogContent sx={{ bgcolor: theme === 'dark' ? 'black' : 'white' }}>
          <Box sx={{ mt: 1 }}>
            {fieldConfig[currentSection].map(field => (
              <TextField
                key={field.key}
                fullWidth
                label={field.label}
                value={editData[field.key]}
                onChange={handleInputChange(field.key)}
                required={currentSection !== 'document'}
                sx={{ 
                  mb: 2,
                  '& .MuiInputBase-input': { color: theme === 'dark' ? 'white' : '#012345' },
                  '& .MuiInputLabel-root': { color: theme === 'dark' ? 'white' : '#012345' }
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ bgcolor: theme === 'dark' ? 'black' : 'white' }}>
          <Button 
            onClick={handleCancel} 
            startIcon={<CancelIcon />}
            sx={{ color: theme === 'dark' ? 'white' : '#012345' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            startIcon={<SaveIcon />}
            sx={{ bgcolor: '#768bd0ff', '&:hover': { bgcolor: '#42538aff' } }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setShowSnackbar(false)} 
          severity={completionMetrics.overall.percentage >= 90 ? "success" : "info"}
          sx={{ width: '100%', bgcolor: theme === 'dark' ? 'black' : 'white', color: theme === 'dark' ? 'white' : '#012345' }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleEdit}
              sx={{ color: theme === 'dark' ? 'white' : '#012345' }}
            >
              COMPLETE
            </Button>
          }
        >
          <AlertTitle sx={{ color: theme === 'dark' ? 'white' : '#012345' }}>
            Profile Update
          </AlertTitle>
          {completionMetrics.overall.percentage >= 90 
            ? "Great job! Your profile is now complete."
            : `Profile ${Math.round(completionMetrics.overall.percentage)}% complete. Add more details to improve client relationships.`
          }
        </Alert>
      </Snackbar>
    </Box>
  );
}