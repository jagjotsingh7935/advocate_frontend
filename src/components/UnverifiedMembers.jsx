import React, { useEffect, useState } from 'react';
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Snackbar,
  useMediaQuery,
  useTheme,
  Stack,
} from '@mui/material';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from '@mui/lab';
import { getUnverifydocuments, ShowUnverifiedMemberApi, Unverifymember, Verifymember } from '../api/Api';
import useMyContext from '../usercontext/useMyContext';
import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function UnverifiedMembers() {
  const [members, setMembers] = useState([]);
  const [unapprovedHistory, setUnapprovedHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [verifyingMemberId, setVerifyingMemberId] = useState(null);
  const [rejectingMemberId, setRejectingMemberId] = useState(null);
  const { theme } = useMyContext();
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Responsive breakpoints
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.between('md', 'lg'));
  const isSmallScreen = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const fetchunapporovedHistory = async () => {
    try {
      const res = await getUnverifydocuments();
      console.log('unverified', res);
      setUnapprovedHistory(res.data.map(item => ({
        id: item.id,
        member_name: item.full_name,
        member_email: item.email,
        phone_number: item.phone_number,
        client_name: item.client_full_name,
        rejection_date: new Date(item.last_updated).toISOString().split('T')[0],
        rejection_reason: 'Unverified document',
        member_pan: item.pan,
        relation_with_client: item.relation,
      })));
    } catch (err) {
      console.error('Failed to fetch unapproved history:', err);
      setError('Failed to fetch unapproved history. Please try again.');
      setSnackbar({
        open: true,
        message: 'Failed to load unapproved history. Please try again.',
        severity: 'error',
      });
    }
  };

  const fetchUnverifiedMembers = async () => {
    try {
      const res = await ShowUnverifiedMemberApi();
      setMembers(res.client_member || []);
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Member data loaded successfully!',
        severity: 'success',
      });
    } catch (err) {
      setError('Failed to fetch members. Please try again.');
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Failed to load member data. Please try again.',
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    Promise.all([fetchUnverifiedMembers(), fetchunapporovedHistory()])
      .catch(err => console.error('Initial fetch failed:', err));
  }, []);

  const handleVerify = async (clientId, memberName, memberId) => {
    try {
      setVerifyingMemberId(memberId);
      const payload = {
        client_member_id: clientId,
      };
      const res = await Verifymember(payload);
      if (res) {
        await fetchUnverifiedMembers();
        await fetchunapporovedHistory(); // Refresh history after verification
        setSnackbar({
          open: true,
          message: `${memberName || 'Member'} verified successfully!`,
          severity: 'success',
        });
      }
    } catch (err) {
      console.error('Verification failed:', err);
      setError('Verification failed. Please try again.');
      setSnackbar({
        open: true,
        message: 'Verification failed. Please try again.',
        severity: 'error',
      });
    } finally {
      setVerifyingMemberId(null);
    }
  };

  const handleReject = async (memberId) => {
    try {
      setRejectingMemberId(memberId);
      const payload = {
        client_member_id: memberId
      };
      const res = await Unverifymember(payload);
      await fetchUnverifiedMembers();
      await fetchunapporovedHistory();
      setSnackbar({
        open: true,
        message: `Member rejected successfully!`,
        severity: 'warning',
      });
    } catch (err) {
      console.error('Rejection failed:', err);
      setError('Rejection failed. Please try again.');
      setSnackbar({
        open: true,
        message: 'Rejection failed. Please try again.',
        severity: 'error',
      });
    } finally {
      setRejectingMemberId(null);
    }
  };

  const handleToggleView = () => {
    setTabValue((prev) => (prev === 0 ? 1 : 0));
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getInitials = (name) => {
    return name
      ? name
          .split(' ')
          .map((word) => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : '';
  };

  const getRejectionReasonColor = (reason) => {
    switch (reason?.toLowerCase()) {
      case 'incomplete documentation':
        return '#ff9800';
      case 'invalid pan details':
        return '#f44336';
      case 'duplicate entry found':
        return '#9c27b0';
      case 'unverified document':
        return '#6c88e6ff';
      default:
        return '#757575';
    }
  };

  // Mobile card component for better mobile experience
  const MemberCard = ({ member }) => (
    <Card
      elevation={2}
      sx={{
        mb: 2,
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9ff',
        border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              backgroundColor: '#4a5fa5',
              width: 40,
              height: 40,
              fontSize: '0.9rem',
              mr: 2,
            }}
          >
            {getInitials(member.member_name)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: theme === 'dark' ? 'white' : 'black',
                fontSize: isSmallScreen ? '0.9rem' : '1rem',
              }}
            >
              {member.member_name}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme === 'dark' ? '#ccc' : '#666',
                fontSize: isSmallScreen ? '0.8rem' : '0.85rem',
              }}
            >
              {member.client_details[0]?.client_name || 'N/A'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5, backgroundColor: theme === 'dark' ? '#444' : '#e0e0e0' }} />

        <Stack spacing={1}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BusinessIcon sx={{ fontSize: 16, mr: 1, color: theme === 'dark' ? '#ccc' : '#666' }} />
            <Typography
              variant="body2"
              sx={{
                color: theme === 'dark' ? '#ccc' : '#666',
                fontSize: isSmallScreen ? '0.8rem' : '0.85rem',
              }}
            >
              PAN: {member.member_pan}
            </Typography>
          </Box>

          {member.member_email && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EmailIcon sx={{ fontSize: 16, mr: 1, color: theme === 'dark' ? '#ccc' : '#666' }} />
              <Typography
                variant="body2"
                sx={{
                  color: theme === 'dark' ? '#ccc' : '#666',
                  fontSize: isSmallScreen ? '0.8rem' : '0.85rem',
                  wordBreak: 'break-all',
                }}
              >
                {member.member_email}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PhoneIcon sx={{ fontSize: 16, mr: 1, color: theme === 'dark' ? '#ccc' : '#666' }} />
            <Typography
              variant="body2"
              sx={{
                color: theme === 'dark' ? '#ccc' : '#666',
                fontSize: isSmallScreen ? '0.8rem' : '0.85rem',
              }}
            >
              {member.phone_number}
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: theme === 'dark' ? '#ccc' : '#666',
              fontSize: isSmallScreen ? '0.8rem' : '0.85rem',
            }}
          >
            <strong>Relation:</strong> {member.relation_with_client}
          </Typography>

          {member.number_type?.length > 0 && (
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: theme === 'dark' ? '#ccc' : '#666',
                  fontSize: isSmallScreen ? '0.8rem' : '0.85rem',
                  mb: 0.5,
                }}
              >
                <strong>Number Types:</strong>
              </Typography>
              {member.number_type.map((nt, index) => (
                <Typography
                  key={typeof nt === 'object' ? nt.id || index : index}
                  variant="body2"
                  sx={{
                    color: theme === 'dark' ? '#ccc' : '#666',
                    fontSize: isSmallScreen ? '0.75rem' : '0.8rem',
                    ml: 2,
                  }}
                >
                  {typeof nt === 'object' ? `${nt.type}: ${nt.number}` : nt}
                </Typography>
              ))}
            </Box>
          )}
        </Stack>

        <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size={isSmallScreen ? 'small' : 'medium'}
            sx={{
              backgroundColor: '#4aa555ff',
              color: 'white',
              textTransform: 'none',
              px: isSmallScreen ? 1.5 : 2,
              borderRadius: '8px',
              minWidth: isSmallScreen ? 'auto' : '80px',
              '&:hover': { backgroundColor: '#3b4c8c' },
            }}
            onClick={() => handleVerify(member.member_id, member.member_name, member.member_id)}
            disabled={verifyingMemberId === member.member_id}
            startIcon={
              verifyingMemberId === member.member_id ? (
                <CircularProgress size={16} sx={{ color: 'white' }} />
              ) : (
                <DoneIcon />
              )
            }
          >
            {isSmallScreen ? '' : 'Verify'}
          </Button>
          <Button
            variant="contained"
            size={isSmallScreen ? 'small' : 'medium'}
            sx={{
              backgroundColor: '#e34b34ff',
              color: 'white',
              textTransform: 'none',
              px: isSmallScreen ? 1.5 : 2,
              borderRadius: '8px',
              minWidth: isSmallScreen ? 'auto' : '80px',
              '&:hover': { backgroundColor: '#c13626' },
            }}
            onClick={() => handleReject(member.member_id)}
            disabled={rejectingMemberId === member.member_id}
            startIcon={
              rejectingMemberId === member.member_id ? (
                <CircularProgress size={16} sx={{ color: 'white' }} />
              ) : (
                <CancelIcon />
              )
            }
          >
            {isSmallScreen ? '' : 'Reject'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container sx={{ 
      mt: { xs: 10, sm: 3, md: 4 }, 
        mb:{xs:10,md:0},

      flexGrow: 1, 
      maxWidth: '1200px !important',
      px: { xs: 1, sm: 2, md: 3 }
    }}>
      {/* Header */}
      <Box sx={{ 
        mb: { xs: 2, sm: 3, md: 4 }, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Box>
          <Typography
            variant={isSmallScreen ? "h5" : "h4"}
            sx={{
              color: theme === 'dark' ? 'white' : '#012345',
              fontWeight: 'bold',
              display: 'inline-block',
            }}
            gutterBottom
          >
            Member Management
          </Typography>
          <Typography
            variant={isSmallScreen ? "body2" : "subtitle1"}
            sx={{
              color: theme === 'dark' ? '#ccc' : '#666',
              mt: 1,
            }}
          >
            Manage unverified members and view approval history
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={tabValue === 0 ? <HistoryIcon /> : <PersonIcon />}
          onClick={handleToggleView}
          size={isSmallScreen ? 'small' : 'medium'}
          sx={{
            color: theme === 'dark' ? '#ccc' : '#666',
            borderColor: theme === 'dark' ? '#ccc' : '#666',
            textTransform: 'none',
            fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
            fontWeight: 500,
            width: { xs: '100%', sm: 'auto' },
            '&:hover': {
              borderColor: '#4a5fa5',
              color: '#4a5fa5',
            },
          }}
        >
          {tabValue === 0 
            ? `${isSmallScreen ? 'History' : `Unapproved History`} (${unapprovedHistory.length})` 
            : `${isSmallScreen ? 'Members' : `Unverified Members`} (${members.length})`
          }
        </Button>
      </Box>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#4a5fa5' }} />
        </Box>
      ) : (
        <>
          {/* Unverified Members Tab */}
          <TabPanel value={tabValue} index={0}>
            {isMobile ? (
              // Mobile Card View
              <Box>
                {members.length === 0 ? (
                  <Paper
                    elevation={2}
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9ff',
                      borderRadius: 2,
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 48, color: theme === 'dark' ? '#ccc' : '#666', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: theme === 'dark' ? '#ccc' : '#666', mb: 1 }}>
                      No Unverified Members
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme === 'dark' ? '#999' : '#888' }}>
                      All members have been verified successfully.
                    </Typography>
                  </Paper>
                ) : (
                  members.map((member) => (
                    <MemberCard key={member.member_id} member={member} />
                  ))
                )}
              </Box>
            ) : (
              // Desktop Table View
              <Paper
                elevation={3}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: `1px solid ${theme === 'dark' ? 'white' : '#e0e0e0'}`,
                }}
              >
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme === 'dark' ? '#0D0C0F' : '#6281e9' }}>
                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { md: '0.85rem', lg: '0.95rem' } }}>
                          Member Name
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { md: '0.85rem', lg: '0.95rem' } }}>
                          PAN
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { md: '0.85rem', lg: '0.95rem' } }}>
                          Email
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { md: '0.85rem', lg: '0.95rem' } }}>
                          Phone
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { md: '0.85rem', lg: '0.95rem' } }}>
                          Relation
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { md: '0.85rem', lg: '0.95rem' } }}>
                          Client Name
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { md: '0.85rem', lg: '0.95rem' } }}>
                          Number Type
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { md: '0.85rem', lg: '0.95rem' } }}>
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {members.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6 }}>
                            <Typography variant="body1" sx={{ color: '#666' }}>
                              No unverified members found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        members.map((member) => (
                          <TableRow
                            key={member.member_id}
                            sx={{
                              '&:nth-of-type(odd)': {
                                backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9ff',
                                color: theme === 'dark' ? 'white' : 'black',
                              },
                              '&:nth-of-type(even)': {
                                backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9ff',
                                color: theme === 'dark' ? 'white' : 'black',
                              },
                              '&:hover': {
                                backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f0f2ff',
                                cursor: 'pointer',
                              },
                              transition: 'background-color 0.2s ease',
                            }}
                          >
                            <TableCell sx={{ 
                              fontSize: { md: '0.8rem', lg: '0.9rem' }, 
                              // fontFamily: 'monospace', 
                              color: theme === 'dark' ? 'white' : 'black',
                              maxWidth: '150px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {member.member_name}
                            </TableCell>
                            <TableCell sx={{ 
                              fontSize: { md: '0.8rem', lg: '0.9rem' }, 
                              color: theme === 'dark' ? 'white' : 'black',
                              maxWidth: '120px',
                            }}>
                              {member.member_pan}
                            </TableCell>
                            <TableCell sx={{ 
                              fontSize: { md: '0.8rem', lg: '0.9rem' }, 
                              color: theme === 'dark' ? 'white' : 'black',
                              maxWidth: '180px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {member.member_email || 'N/A'}
                            </TableCell>
                            <TableCell sx={{ 
                              fontSize: { md: '0.8rem', lg: '0.9rem' }, 
                              color: theme === 'dark' ? 'white' : 'black',
                              maxWidth: '120px',
                            }}>
                              {member.phone_number}
                            </TableCell>
                            <TableCell sx={{ 
                              fontSize: { md: '0.8rem', lg: '0.9rem' }, 
                              color: theme === 'dark' ? 'white' : 'black',
                              maxWidth: '120px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {member.relation_with_client}
                            </TableCell>
                            <TableCell sx={{ 
                              fontSize: { md: '0.8rem', lg: '0.9rem' }, 
                              color: theme === 'dark' ? 'white' : 'black',
                              maxWidth: '150px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {member.client_details[0]?.client_name || 'N/A'}
                            </TableCell>
                            <TableCell sx={{ 
                              fontSize: { md: '0.8rem', lg: '0.9rem' }, 
                              color: theme === 'dark' ? 'white' : 'black',
                              maxWidth: '150px',
                            }}>
                              {member.number_type?.map((nt, index) => (
                                <div key={typeof nt === 'object' ? nt.id || index : index} style={{ fontSize: '0.8rem' }}>
                                  {typeof nt === 'object' ? `${nt.type}: ${nt.number}` : nt}
                                </div>
                              ))}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1, flexDirection: isTablet ? 'column' : 'row' }}>
                                <Button
                                  variant="contained"
                                  sx={{
                                    backgroundColor: '#4aa555ff',
                                    color: 'white',
                                    textTransform: 'none',
                                    px: isTablet ? 1 : 2,
                                    minWidth: isTablet ? 'auto' : '60px',
                                    borderRadius: '8px',
                                    '&:hover': { backgroundColor: '#3b4c8c' },
                                  }}
                                  size="small"
                                  onClick={() => handleVerify(member.member_id, member.member_name, member.member_id)}
                                  disabled={verifyingMemberId === member.member_id}
                                  startIcon={
                                    verifyingMemberId === member.member_id ? (
                                      <CircularProgress size={16} sx={{ color: 'white' }} />
                                    ) : (
                                      <DoneIcon sx={{ fontSize: isTablet ? '16px' : '20px' }} />
                                    )
                                  }
                                />
                                <Button
                                  variant="contained"
                                  sx={{
                                    backgroundColor: '#e34b34ff',
                                    color: 'white',
                                    textTransform: 'none',
                                    px: isTablet ? 1 : 2,
                                    minWidth: isTablet ? 'auto' : '60px',
                                    borderRadius: '8px',
                                    '&:hover': { backgroundColor: '#c13626' },
                                  }}
                                  size="small"
                                  onClick={() => handleReject(member.member_id)}
                                  disabled={rejectingMemberId === member.member_id}
                                  startIcon={
                                    rejectingMemberId === member.member_id ? (
                                      <CircularProgress size={16} sx={{ color: 'white' }} />
                                    ) : (
                                      <CancelIcon sx={{ fontSize: isTablet ? '16px' : '20px' }} />
                                    )
                                  }
                                />
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </TabPanel>

          {/* Unapproved Members History Tab */}
          <TabPanel value={tabValue} index={1}>
            {unapprovedHistory.length === 0 ? (
              <Paper
                elevation={2}
                sx={{
                  p: { xs: 4, sm: 6 },
                  textAlign: 'center',
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9ff',
                  borderRadius: 2,
                }}
              >
                <HistoryIcon sx={{ 
                  fontSize: { xs: 48, sm: 64 }, 
                  color: theme === 'dark' ? '#ccc' : '#666', 
                  mb: 2 
                }} />
                <Typography 
                  variant={isSmallScreen ? "subtitle1" : "h6"} 
                  sx={{ color: theme === 'dark' ? '#ccc' : '#666', mb: 1 }}
                >
                  No Unapproved History Found
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ color: theme === 'dark' ? '#999' : '#888' }}
                >
                  All member applications have been processed successfully.
                </Typography>
              </Paper>
            ) : (
              <Box>
                {/* Timeline View - Hide on small screens */}
                {!isSmallScreen && (
                  <Paper
                    elevation={3}
                    sx={{
                      p: { xs: 2, sm: 3 },
                      backgroundColor: 'transparent',
                      borderRadius: 2,
                      border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
                      mb: 3,
                    }}
                  >
                    <Typography
                      variant={isSmallScreen ? "subtitle1" : "h6"}
                      sx={{
                        color: theme === 'dark' ? 'white' : '#333',
                        mb: 3,
                        fontWeight: 600,
                      }}
                    >
                      Recent Rejections Timeline
                    </Typography>
                    <Box
                      sx={{
                        maxHeight: { xs: '400px', md: '500px' },
                        overflowY: 'auto',
                        pr: 2,
                        '&::-webkit-scrollbar': {
                          width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: theme === 'dark' ? '#333' : '#f1f1f1',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: theme === 'dark' ? '#666' : '#888',
                          borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                          background: theme === 'dark' ? '#888' : '#555',
                        },
                      }}
                    >
                      <Timeline
                        position={isMobile ? "right" : "alternate"}
                        sx={{
                          '& .MuiTimelineItem-root': {
                            '&:before': {
                              display: theme === 'dark' || isMobile ? 'none' : 'flex',
                            },
                          },
                          '& .MuiTimelineConnector-root': {
                            backgroundColor: theme === 'dark' ? '#555' : '#e0e0e0',
                          },
                        }}
                      >
                        {unapprovedHistory.map((member, index) => (
                          <TimelineItem key={member.id}>
                            {!isMobile && (
                              <TimelineOppositeContent
                                sx={{
                                  m: 'auto 0',
                                  color: theme === 'dark' ? '#ccc' : '#666',
                                }}
                                align={index % 2 === 0 ? 'right' : 'left'}
                                variant="body2"
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: index % 2 === 0 ? 'flex-end' : 'flex-start',
                                  }}
                                >
                                  <AccessTimeIcon sx={{ fontSize: 16, mr: 1, color: theme === 'dark' ? '#ccc' : '#666' }} />
                                  <Typography sx={{ color: theme === 'dark' ? '#ccc' : '#666' }}>
                                    {member.rejection_date}
                                  </Typography>
                                </Box>
                              </TimelineOppositeContent>
                            )}
                            <TimelineSeparator>
                              <TimelineDot
                                sx={{
                                  backgroundColor: getRejectionReasonColor(member.rejection_reason),
                                  border: 'none',
                                }}
                              >
                                <CancelIcon sx={{ color: 'white', fontSize: 16 }} />
                              </TimelineDot>
                              {index < unapprovedHistory.length - 1 && (
                                <TimelineConnector
                                  sx={{
                                    backgroundColor: theme === 'dark' ? '#555' : '#e0e0e0',
                                  }}
                                />
                              )}
                            </TimelineSeparator>
                            <TimelineContent sx={{ py: '12px', px: 2 }}>
                              <Card
                                elevation={2}
                                sx={{
                                  backgroundColor: theme === 'dark' ? 'transparent' : '#f8f9ff',
                                  border: `1px solid ${getRejectionReasonColor(member.rejection_reason)}`,
                                  borderRadius: 2,
                                }}
                              >
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar
                                      sx={{
                                        backgroundColor: getRejectionReasonColor(member.rejection_reason),
                                        width: { xs: 32, sm: 40 },
                                        height: { xs: 32, sm: 40 },
                                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                        mr: 2,
                                        color: 'white',
                                      }}
                                    >
                                      {getInitials(member.member_name)}
                                    </Avatar>
                                    <Box>
                                      <Typography
                                        variant="subtitle1"
                                        sx={{
                                          fontWeight: 600,
                                          color: theme === 'dark' ? 'white' : 'black',
                                          fontSize: { xs: '0.9rem', sm: '1rem' },
                                        }}
                                      >
                                        {member.member_name}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: theme === 'dark' ? '#ccc' : 'black',
                                          fontSize: { xs: '0.8rem', sm: '0.85rem' },
                                        }}
                                      >
                                        {member.relation_with_client} at {member.client_name}
                                      </Typography>
                                      {isMobile && (
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: theme === 'dark' ? '#ccc' : '#666',
                                            fontSize: '0.75rem',
                                            mt: 0.5,
                                          }}
                                        >
                                          {member.rejection_date}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Box>

                                  <Divider sx={{ my: 1.5, backgroundColor: theme === 'dark' ? '#444' : '#e0e0e0' }} />

                                  <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <EmailIcon sx={{ 
                                          fontSize: { xs: 14, sm: 16 }, 
                                          mr: 1, 
                                          color: theme === 'dark' ? '#ccc' : 'black' 
                                        }} />
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: theme === 'dark' ? '#ccc' : 'black',
                                            fontSize: { xs: '0.75rem', sm: '0.85rem' },
                                            wordBreak: 'break-all',
                                          }}
                                        >
                                          {member.member_email}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <PhoneIcon sx={{ 
                                          fontSize: { xs: 14, sm: 16 }, 
                                          mr: 1, 
                                          color: theme === 'dark' ? '#ccc' : 'black' 
                                        }} />
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: theme === 'dark' ? '#ccc' : 'black',
                                            fontSize: { xs: '0.75rem', sm: '0.85rem' },
                                          }}
                                        >
                                          {member.phone_number}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <BusinessIcon sx={{ 
                                          fontSize: { xs: 14, sm: 16 }, 
                                          mr: 1, 
                                          color: theme === 'dark' ? '#ccc' : 'black' 
                                        }} />
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: theme === 'dark' ? '#ccc' : 'black',
                                            fontSize: { xs: '0.75rem', sm: '0.85rem' },
                                          }}
                                        >
                                          PAN: {member.member_pan}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                  </Grid>

                                  <Chip
                                    label={member.rejection_reason}
                                    size="small"
                                    sx={{
                                      backgroundColor: getRejectionReasonColor(member.rejection_reason),
                                      color: 'white',
                                      mt: 2,
                                      fontWeight: 500,
                                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                    }}
                                  />
                                </CardContent>
                              </Card>
                            </TimelineContent>
                          </TimelineItem>
                        ))}
                      </Timeline>
                    </Box>
                  </Paper>
                )}

                {/* Detailed Accordion View */}
                <Paper
                  sx={{
                    mt: isSmallScreen ? 0 : 4,
                    backgroundColor: theme === 'dark' ? 'transparent' : 'white',
                    border: 'none',
                    boxShadow: 'none',
                  }}
                >
                  <Box sx={{ p: { xs: 2, sm: 3 }, pb: 2 }}>
                    <Typography
                      variant={isSmallScreen ? "subtitle1" : "h6"}
                      sx={{
                        color: theme === 'dark' ? 'white' : '#333',
                        fontWeight: 600,
                      }}
                    >
                      {isSmallScreen ? "Rejection History" : "Detailed History"}
                    </Typography>
                  </Box>

                  {unapprovedHistory.map((member) => (
                    <Accordion
                      key={member.id}
                      sx={{
                        backgroundColor: theme === 'dark' ? 'transparent' : '#f8f9ff',
                        '&:before': { display: 'none' },
                        border: `1px solid ${theme === 'dark' ? '#444' : '#e0e0e0'}`,
                        mb: 1,
                        borderRadius: '8px !important',
                        overflow: 'hidden',
                      }}
                      elevation={0}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: theme === 'dark' ? 'white' : '#333' }} />}
                        sx={{
                          backgroundColor: theme === 'dark' ? 'transparent' : '#f0f2ff',
                          '& .MuiAccordionSummary-content': { 
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: { xs: 1, sm: 0 }
                          },
                          py: { xs: 1, sm: 1.5 },
                          px: { xs: 2, sm: 3 },
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          width: { xs: '100%', sm: 'auto' },
                          mb: { xs: 1, sm: 0 }
                        }}>
                          <Avatar
                            sx={{
                              backgroundColor: getRejectionReasonColor(member.rejection_reason),
                              width: { xs: 28, sm: 32 },
                              height: { xs: 28, sm: 32 },
                              fontSize: { xs: '0.7rem', sm: '0.8rem' },
                              mr: 2,
                              color: 'white',
                            }}
                          >
                            {getInitials(member.member_name)}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 600,
                                color: theme === 'dark' ? 'white' : '#333',
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                              }}
                            >
                              {member.member_name}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: theme === 'dark' ? '#ccc' : '#666',
                                fontSize: { xs: '0.75rem', sm: '0.85rem' },
                              }}
                            >
                              Rejected on {member.rejection_date}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={member.rejection_reason}
                          size="small"
                          sx={{
                            backgroundColor: getRejectionReasonColor(member.rejection_reason),
                            color: 'white',
                            fontWeight: 500,
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            alignSelf: { xs: 'flex-start', sm: 'center' },
                          }}
                        />
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                                mb: 2,
                                color: theme === 'dark' ? 'white' : '#333',
                                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                              }}
                            >
                              Personal Information
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: theme === 'dark' ? '#ccc' : '#666',
                                  fontSize: { xs: '0.8rem', sm: '0.85rem' },
                                  wordBreak: 'break-word',
                                }}
                              >
                                <strong>Email:</strong> {member.member_email}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: theme === 'dark' ? '#ccc' : '#666',
                                  fontSize: { xs: '0.8rem', sm: '0.85rem' },
                                }}
                              >
                                <strong>Phone:</strong> {member.phone_number}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: theme === 'dark' ? '#ccc' : '#666',
                                  fontSize: { xs: '0.8rem', sm: '0.85rem' },
                                }}
                              >
                                <strong>PAN:</strong> {member.member_pan}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: theme === 'dark' ? '#ccc' : '#666',
                                  fontSize: { xs: '0.8rem', sm: '0.85rem' },
                                }}
                              >
                                <strong>Relation:</strong> {member.relation_with_client}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                                mb: 2,
                                color: theme === 'dark' ? 'white' : '#333',
                                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                              }}
                            >
                              Rejection Details
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: theme === 'dark' ? '#ccc' : '#666',
                                  fontSize: { xs: '0.8rem', sm: '0.85rem' },
                                }}
                              >
                                <strong>Client:</strong> {member.client_name}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: theme === 'dark' ? '#ccc' : '#666',
                                  fontSize: { xs: '0.8rem', sm: '0.85rem' },
                                }}
                              >
                                <strong>Date:</strong> {member.rejection_date}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: theme === 'dark' ? '#ccc' : '#666',
                                  fontSize: { xs: '0.8rem', sm: '0.85rem' },
                                }}
                              >
                                <strong>Reason:</strong> {member.rejection_reason}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Paper>
              </Box>
            )}
          </TabPanel>
        </>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ 
          vertical: 'bottom', 
          horizontal: isSmallScreen ? 'center' : 'left' 
        }}
        sx={{
          '& .MuiSnackbarContent-root': {
            minWidth: { xs: '280px', sm: '344px' },
          }
        }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            '& .MuiAlert-icon': {
              fontSize: { xs: '1.2rem', sm: '1.5rem' }
            },
            '& .MuiAlert-message': {
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }
          }}
          icon={
            snackbar.severity === 'success' ? <CheckCircleIcon fontSize="inherit" /> :
            snackbar.severity === 'error' ? <ErrorIcon fontSize="inherit" /> :
            undefined
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}