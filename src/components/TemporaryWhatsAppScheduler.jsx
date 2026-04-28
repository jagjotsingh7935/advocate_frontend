import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Autocomplete,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  Alert,
  Divider,
  Pagination,
  Popper,
  Card,
  CardContent,
  Grid,
  useMediaQuery,
  useTheme,
  Stack
} from '@mui/material';
import { Send, Visibility } from '@mui/icons-material';
import { TempwhatsappSchedulerTemplate, TempwhatsappSchedulerTemplateById, whatsappGetTemplateById, WhatsappTemplateType } from '../api/Api';
import useMyContext from '../usercontext/useMyContext';

export default function TemporaryWhatsAppScheduler() {
  const { theme } = useMyContext();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  const [whatsAppType, setWhatsAppType] = useState(null);
  const [templatePreview, setTemplatePreview] = useState('');
  const [excelType, setExcelType] = useState(null);
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [whatsAppTypes, setWhatsAppTypes] = useState([]);
  const [excelTypes, setExcelTypes] = useState([]);
  const [clientsByExcelType, setClientsByExcelType] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Define theme-based colors
  const themeColors = {
    textPrimary: theme === 'dark' ? 'white' : '#1e293b',
    textSecondary: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
    background: theme === 'dark' ? '#0D0C0F' : 'white',
    border: theme === 'dark' ? '#abbefd' : '#e0e0e0',
    chipBg: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.02)',
    hoverBg: theme === 'dark' ? 'rgba(171, 190, 253, 0.2)' : 'rgba(171, 190, 253, 0.08)',
    primary: '#6884e3',
    primaryHover: theme === 'dark' ? '#7e98f5' : '#5067c1',
    accent: '#abbefd',
    summaryBg: theme === 'dark' ? '#2a4a2a' : '#e8f5e8',
    summaryBorder: theme === 'dark' ? '#4a7a4a' : '#c8e6c9',
    summaryText: theme === 'dark' ? '#a0cfa0' : '#2e7d32',
    error: '#ef4444',
    errorBg: theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.08)',
    success: '#10b981',
    warning: '#f59e0b',
    info: '#3b82f6',
    disabled: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
    paperBg: theme === 'dark' ? '#1a1a1a' : 'white',
    tableHeaderBg: theme === 'dark' ? '#3b5a9a' : '#abbefd',
    previewBg: theme === 'dark' ? '#2a2a4a' : '#f8f9ff'
  };

  // Custom Popper component for Autocomplete dropdown
  const CustomPopper = (props) => {
    return (
      <Popper
        {...props}
        sx={{
          '& .MuiPaper-root': {
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
            color: themeColors.textPrimary,
            maxWidth: { xs: '90vw', sm: 'auto' }
          }
        }}
      />
    );
  };

  // Fetch WhatsApp message types
  useEffect(() => {
    const fetchWhatsAppTypes = async () => {
      try {
        const response = await WhatsappTemplateType();
        const data = response;
        setWhatsAppTypes(data.map(item => ({
          id: item.id,
          label: item.type,
        })));
      } catch (error) {
        console.error('Error fetching WhatsApp types:', error);
      }
    };
    fetchWhatsAppTypes();
  }, []);

  // Fetch Excel types
  useEffect(() => {
    const fetchExcelType = async () => {
      try {
        const response = await TempwhatsappSchedulerTemplate();
        setExcelTypes(response.map(item => ({
          id: item.id,
          label: item.type,
          count: 0 // Placeholder, updated when clients are fetched
        })));
      } catch (error) {
        console.error('Error fetching Excel types:', error);
      }
    };
    fetchExcelType();
  }, []);

  // Fetch clients when Excel type or page changes
  useEffect(() => {
    const fetchClients = async () => {
      if (!excelType) {
        setClientsByExcelType({});
        setTotalPages(1);
        return;
      }
      try {
        const response = await TempwhatsappSchedulerTemplateById(excelType.label, { page: currentPage });
        const { results, count, num_pages } = response;
        setClientsByExcelType({
          [excelType.id]: results.map(client => ({
            id: client.id,
            name: client.name,
            phone: `+${client.phone}`,
            email: client.email,
            filecode: client.file_code,
            pan: client.pan,
            status: client.number_type[0]?.type === 'ITR' ? 'Active' : 'Inactive'
          }))
        });
        setExcelTypes(prev => prev.map(type =>
          type.id === excelType.id ? { ...type, count } : type
        ));
        setTotalPages(num_pages);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setClientsByExcelType({});
        setTotalPages(1);
      }
    };
    fetchClients();
  }, [excelType, currentPage]);

  // Fetch template preview when WhatsApp type changes
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!whatsAppType) {
        setTemplatePreview('');
        return;
      }
      try {
        const response = await whatsappGetTemplateById(whatsAppType.id);
        const data = response;
        const template = data[0];
        setTemplatePreview(template ? template.template || 'No preview available' : '');
      } catch (error) {
        console.error('Error fetching template:', error);
        setTemplatePreview('');
      }
    };
    fetchTemplates();
  }, [whatsAppType]);

  // Filter clients based on search term
  const filteredClients = useMemo(() => {
    const clients = excelType ? clientsByExcelType[excelType.id] || [] : [];
    if (!searchTerm) return clients;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return clients.filter(client =>
      client.name.toLowerCase().includes(lowerSearchTerm) ||
      client.phone.toLowerCase().includes(lowerSearchTerm) ||
      client.email.toLowerCase().includes(lowerSearchTerm) ||
      client.pan.toLowerCase().includes(lowerSearchTerm) ||
      client.filecode.toLowerCase().includes(lowerSearchTerm)
    );
  }, [excelType, clientsByExcelType, searchTerm]);

  const handleWhatsAppTypeChange = (event, newValue) => {
    setWhatsAppType(newValue);
  };

  const handleExcelTypeChange = (event, newValue) => {
    setExcelType(newValue);
    setSelectedClients([]);
    setSelectAll(false);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const handleSelectAllChange = (event) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    if (checked) {
      setSelectedClients(filteredClients.map(client => client.id));
    } else {
      setSelectedClients([]);
    }
  };

  const handleClientSelect = (clientId) => {
    setSelectedClients(prev => {
      if (prev.includes(clientId)) {
        const updated = prev.filter(id => id !== clientId);
        setSelectAll(updated.length === filteredClients.length);
        return updated;
      } else {
        const updated = [...prev, clientId];
        setSelectAll(updated.length === filteredClients.length);
        return updated;
      }
    });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    setSelectedClients([]);
    setSelectAll(false);
  };

  const handleSchedule = () => {
    const scheduleData = {
      whatsAppType: whatsAppType?.label,
      template: templatePreview ? 'Selected Template' : 'Selected Template',
      excelType: excelType?.label,
      selectedClients: selectedClients,
      clientCount: selectedClients.length,
      timestamp: new Date().toISOString()
    };
    
    console.log('Scheduling WhatsApp messages:', scheduleData);
    alert(`Scheduling ${selectedClients.length} messages using selected template`);
  };

  const isFormValid = whatsAppType && templatePreview && excelType && selectedClients.length > 0;

  // Mobile Card Component for clients
  const ClientCard = ({ client }) => (
    <Card 
      sx={{ 
        mb: 2, 
        bgcolor: themeColors.paperBg, 
        borderColor: themeColors.border,
        border: selectedClients.includes(client.id) ? `2px solid ${themeColors.primary}` : `1px solid ${themeColors.border}`
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ color: themeColors.textPrimary, fontWeight: 'bold', mb: 1 }}>
              {client.name}
            </Typography>
            <Typography variant="body2" sx={{ color: themeColors.textSecondary, mb: 0.5 }}>
              📞 {client.phone}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: themeColors.textSecondary, 
                mb: 0.5,
                wordBreak: 'break-all'
              }}
            >
              ✉️ {client.email}
            </Typography>
            <Typography variant="body2" sx={{ color: themeColors.textSecondary, mb: 0.5 }}>
              🆔 PAN: {client.pan}
            </Typography>
            <Typography variant="body2" sx={{ color: themeColors.textSecondary, mb: 1 }}>
              📄 File: {client.filecode}
            </Typography>
          </Box>
          <Checkbox
            checked={selectedClients.includes(client.id)}
            onChange={() => handleClientSelect(client.id)}
            sx={{
              color: themeColors.textPrimary,
              '&.Mui-checked': { color: themeColors.primary },
              ml: 1,
              mt: -1
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      mx: 'auto', 
      p: { xs: 2, sm: 3 }, 
      mb:{xs:10,md:0},
      mt:{xs:10,md:0},
      bgcolor: themeColors.background,
      minHeight: '100vh'
    }}>
      <Paper elevation={3} sx={{ 
        p: { xs: 2, sm: 3, md: 4 }, 
        bgcolor: themeColors.paperBg, 
        border: 1, 
        borderColor: themeColors.border,
        mb: { xs: 2, md: 0 },
        mt: { xs: 2, md: 0 }
      }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          gutterBottom 
          sx={{ 
            mb: { xs: 3, md: 4 }, 
            color: themeColors.textPrimary, 
            fontWeight: 'bold',
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          📱 Temporary WhatsApp Scheduler
        </Typography>
        
        {/* WhatsApp Type Autocomplete */}
        <Autocomplete
          options={whatsAppTypes}
          getOptionLabel={(option) => option.label}
          value={whatsAppType}
          onChange={handleWhatsAppTypeChange}
          PopperComponent={CustomPopper}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="WhatsApp Message Type" 
              placeholder="Search message types..."
              fullWidth
              size={isMobile ? "small" : "medium"}
              sx={{
                '& .MuiInputLabel-root': { color: themeColors.textSecondary },
                '& .MuiOutlinedInput-root': {
                  color: themeColors.textPrimary,
                  '& fieldset': { borderColor: themeColors.border },
                  '&:hover fieldset': { borderColor: themeColors.primary },
                  '&.Mui-focused fieldset': { borderColor: themeColors.primary }
                }
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Box>
                <Typography variant="body1" sx={{ color: themeColors.textPrimary }}>{option.label}</Typography>
              </Box>
            </Box>
          )}
          sx={{ mb: 3 }}
        />

        {/* Template Preview Section */}
        {templatePreview && (
          <Paper 
            variant="outlined" 
            sx={{ 
              mb: 4, 
              p: { xs: 2, sm: 3 }, 
              bgcolor: themeColors.previewBg,
              borderLeft: `4px solid ${themeColors.accent}`,
              borderColor: themeColors.border
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Visibility sx={{ color: themeColors.accent, mr: 1 }} />
              <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ color: themeColors.textPrimary, fontWeight: 'bold' }}>
                Template Preview
              </Typography>
            </Box>
            <Divider sx={{ mb: 2, bgcolor: themeColors.border }} />
            <Box 
              sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                bgcolor: themeColors.paperBg, 
                borderRadius: 2,
                border: `1px solid ${themeColors.border}`,
                position: 'relative',
                maxHeight: { xs: '250px', sm: '300px' },
                minHeight: { xs: '150px', sm: '200px' },
                overflow: 'auto',
                '&::before': {
                  content: '"📱"',
                  position: 'absolute',
                  top: '-8px',
                  left: '16px',
                  backgroundColor: themeColors.paperBg,
                  padding: '0 8px',
                  fontSize: '16px',
                  color: themeColors.textPrimary,
                  zIndex: 1
                },
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: themeColors.primary,
                  borderRadius: '3px',
                  '&:hover': {
                    backgroundColor: themeColors.primaryHover,
                  },
                },
                // Firefox scrollbar styling
                scrollbarWidth: 'thin',
                scrollbarColor: `${themeColors.primary} ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
              }}
            >
              <Typography
                variant={isMobile ? "body2" : "body1"}
                sx={{
                  // fontFamily: 'monospace',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  color: themeColors.textPrimary,
                  wordBreak: 'break-word'
                }}
                dangerouslySetInnerHTML={{ __html: templatePreview }}
              />
            </Box>
            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: themeColors.textSecondary }}>
              This is how your message will appear to recipients
            </Typography>
          </Paper>
        )}

        {/* Excel Type Autocomplete */}
        <Autocomplete
          options={excelTypes}
          getOptionLabel={(option) => `${option.label}`}
          value={excelType}
          onChange={handleExcelTypeChange}
          PopperComponent={CustomPopper}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Client Database" 
              placeholder="Select client group..."
              fullWidth
              size={isMobile ? "small" : "medium"}
              sx={{
                '& .MuiInputLabel-root': { color: themeColors.textSecondary },
                '& .MuiOutlinedInput-root': {
                  color: themeColors.textPrimary,
                  '& fieldset': { borderColor: themeColors.border },
                  '&:hover fieldset': { borderColor: themeColors.primary },
                  '&.Mui-focused fieldset': { borderColor: themeColors.primary }
                }
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props} sx={{ bgcolor: themeColors.background, '&:hover': { bgcolor: themeColors.hoverBg } }}>
              <Box>
                <Typography variant="body1" sx={{ color: themeColors.textPrimary }}>{option.label}</Typography>
                {option.count > 0 && (
                  <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                    {option.count} clients available
                  </Typography>
                )}
              </Box>
            </Box>
          )}
          sx={{ mb: 3 }}
        />

        {/* Client Selection Section */}
        {excelType && (
          <Box sx={{ mt: 3 }}>
            <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom sx={{ color: themeColors.textPrimary }}>
              Select Clients from {excelType.label}
            </Typography>

            {/* Search Bar */}
            <TextField
              label="Search Clients"
              placeholder="Search by name, phone, email, PAN, or file code..."
              value={searchTerm}
              onChange={handleSearchChange}
              fullWidth
              size={isMobile ? "small" : "medium"}
              sx={{
                mb: 2,
                '& .MuiInputLabel-root': { color: themeColors.textSecondary },
                '& .MuiOutlinedInput-root': {
                  color: themeColors.textPrimary,
                  '& fieldset': { borderColor: themeColors.border },
                  '&:hover fieldset': { borderColor: themeColors.primary },
                  '&.Mui-focused fieldset': { borderColor: themeColors.primary }
                }
              }}
            />

            {filteredClients.length > 0 ? (
              <>
                {/* Select All Checkbox for Mobile/Tablet */}
                {(isMobile || isTablet) && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: themeColors.tableHeaderBg, borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Checkbox
                        color="primary"
                        checked={selectAll}
                        onChange={handleSelectAllChange}
                        indeterminate={selectedClients.length > 0 && selectedClients.length < filteredClients.length}
                        sx={{
                          color: themeColors.textPrimary,
                          '&.Mui-checked': { color: themeColors.primary },
                          '&.Mui-indeterminate': { color: themeColors.primary }
                        }}
                      />
                      <Typography variant="body2" sx={{ color: themeColors.textPrimary, fontWeight: 'bold' }}>
                        Select All ({filteredClients.length} clients)
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Desktop Table View */}
                {!isMobile && !isTablet && (
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, bgcolor: themeColors.paperBg, borderColor: themeColors.border }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: themeColors.tableHeaderBg }}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              checked={selectAll}
                              onChange={handleSelectAllChange}
                              indeterminate={selectedClients.length > 0 && selectedClients.length < filteredClients.length}
                              sx={{
                                color: themeColors.textPrimary,
                                '&.Mui-checked': { color: themeColors.primary },
                                '&.Mui-indeterminate': { color: themeColors.primary }
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: themeColors.textPrimary }}><strong>Name</strong></TableCell>
                          <TableCell sx={{ color: themeColors.textPrimary }}><strong>Phone</strong></TableCell>
                          <TableCell sx={{ color: themeColors.textPrimary }}><strong>Email</strong></TableCell>
                          <TableCell sx={{ color: themeColors.textPrimary }}><strong>PAN</strong></TableCell>
                          <TableCell sx={{ color: themeColors.textPrimary }}><strong>File-Code</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredClients.map((client) => (
                          <TableRow 
                            key={client.id}
                            hover
                            selected={selectedClients.includes(client.id)}
                            sx={{
                              bgcolor: themeColors.background,
                              '&:hover': { bgcolor: themeColors.hoverBg },
                              '&.Mui-selected': { bgcolor: themeColors.hoverBg }
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedClients.includes(client.id)}
                                onChange={() => handleClientSelect(client.id)}
                                sx={{
                                  color: themeColors.textPrimary,
                                  '&.Mui-checked': { color: themeColors.primary }
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: themeColors.textPrimary }}>{client.name}</TableCell>
                            <TableCell sx={{ color: themeColors.textPrimary }}>{client.phone}</TableCell>
                            <TableCell sx={{ color: themeColors.textPrimary, wordBreak: 'break-all' }}>{client.email}</TableCell>
                            <TableCell sx={{ color: themeColors.textPrimary }}>{client.pan}</TableCell>
                            <TableCell sx={{ color: themeColors.textPrimary }}>{client.filecode}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* Mobile/Tablet Card View */}
                {(isMobile || isTablet) && (
                  <Box sx={{ mb: 3 }}>
                    {filteredClients.map((client) => (
                      <ClientCard key={client.id} client={client} />
                    ))}
                  </Box>
                )}

                {/* Pagination */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: themeColors.textPrimary,
                        '&.Mui-selected': {
                          bgcolor: themeColors.primary,
                          color: 'white',
                          '&:hover': { bgcolor: themeColors.primaryHover }
                        }
                      }
                    }}
                  />
                </Box>

                {selectedClients.length > 0 && (
                  <Alert 
                    severity="info" 
                    sx={{ 
                      mb: 3, 
                      bgcolor: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.08)',
                      color: themeColors.textPrimary 
                    }}
                  >
                    <strong>{selectedClients.length}</strong> client(s) selected for messaging
                  </Alert>
                )}
              </>
            ) : (
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3, 
                  bgcolor: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.08)',
                  color: themeColors.textPrimary 
                }}
              >
                No clients found matching your search.
              </Alert>
            )}
          </Box>
        )}

        {/* Schedule Button */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="flex-end" 
          spacing={2} 
          sx={{ mt: 4 }}
        >
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={handleSchedule}
            disabled={!isFormValid}
            fullWidth={isMobile}
            size={isMobile ? "medium" : "large"}
            sx={{
              bgcolor: themeColors.primary,
              color: 'white',
              px: { xs: 2, sm: 4 },
              py: { xs: 1.5, sm: 1.5 },
              '&:hover': { bgcolor: themeColors.primaryHover },
              '&:disabled': { bgcolor: themeColors.disabled, color: themeColors.textPrimary }
            }}
          >
            Schedule Messages ({selectedClients.length})
          </Button>
        </Stack>

        {/* Schedule Summary */}
        {isFormValid && (
          <Box sx={{ 
            mt: 4, 
            p: { xs: 2, sm: 3 }, 
            bgcolor: themeColors.summaryBg,
            borderRadius: 2,
            border: `1px solid ${themeColors.summaryBorder}`
          }}>
            <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom sx={{ color: themeColors.summaryText }}>
              📋 Schedule Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: themeColors.textPrimary, mb: 1 }}>
                  <strong>Message Type:</strong> {whatsAppType?.label}
                </Typography>
                <Typography variant="body2" sx={{ color: themeColors.textPrimary }}>
                  <strong>Template:</strong> Selected Template
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: themeColors.textPrimary, mb: 1 }}>
                  <strong>Client Database:</strong> {excelType?.label}
                </Typography>
                <Typography variant="body2" sx={{ color: themeColors.textPrimary }}>
                  <strong>Recipients:</strong> {selectedClients.length} clients
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
}