import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cms from '../assets/cms.svg'
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Paper,
  Divider,
  Fade,
  CircularProgress,
  alpha,
  useTheme,
  Tooltip
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Login as LoginIcon,
  Gavel,
  Security,
  PersonAdd,
  DarkMode,
  LightMode
} from '@mui/icons-material';
import { authMe, loginUser } from '../api/Api';
import useMyContext from '../usercontext/useMyContext';

const Login = () => {
  const { updateState, theme, updatetheme } = useMyContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const theme2 = useTheme();
  const { authme, updateAuthMe } = useMyContext();

  // Theme-based colors
  const isDark = theme === 'dark';
  const backgroundColor = isDark ? '#0d0c0f' : '#ffffff';
  const paperBackground = isDark ? '#0d0c0f' : '#ffffff';
  const textPrimary = isDark ? '#ffffff' : '#000000';
  const textSecondary = isDark ? '#b0b0b0' : '#666666';
  const borderColor = isDark ? '#4a5fa5' : '#e0e0e0';
  const primaryColor = '#4a5fa5';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const response = await loginUser(username, password);

      if(response.user.is_client){
        updateState('client')
      }else if(response.user.is_staff){
        updateState('staff')
      }else{
        updateState('admin')
      }

      sessionStorage.setItem('access_token', response.accessToken);
      sessionStorage.setItem('refresh_token', response.refreshToken);
      sessionStorage.setItem('username', username);
      sessionStorage.setItem('user_id', response.user_id || 'unknown');
      
      // Add a small delay for better UX
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err) {
      setError(err.error || 'Invalid credentials. Please try again.');
      setLoading(false);
    }
    const userclient = await authMe()
    updateAuthMe(userclient)
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignUpClick = () => {
    navigate('/registerclient'); // Navigate to signup page
  };

  const handleThemeToggle = () => {
    updatetheme(isDark ? 'light' : 'dark');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3,
        position: 'relative'
      }}
    >
      {/* Theme Toggle Button - Top Right Corner */}
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 1000
        }}
      >
        <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          <IconButton
            onClick={handleThemeToggle}
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: isDark ? alpha('#ffffff', 0.1) : alpha('#000000', 0.05),
              border: `2px solid ${alpha(primaryColor, 0.3)}`,
              color: primaryColor,
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              boxShadow: isDark 
                ? `0 4px 20px ${alpha('#000000', 0.3)}` 
                : `0 4px 20px ${alpha('#000000', 0.1)}`,
              '&:hover': {
                bgcolor: alpha(primaryColor, 0.1),
                borderColor: primaryColor,
                transform: 'scale(1.1)',
                boxShadow: isDark 
                  ? `0 6px 25px ${alpha('#000000', 0.4)}` 
                  : `0 6px 25px ${alpha(primaryColor, 0.2)}`
              }
            }}
          >
            {isDark ? (
              <LightMode sx={{ fontSize: 28 }} />
            ) : (
              <DarkMode sx={{ fontSize: 28 }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Paper
            elevation={isDark ? 8 : 12}
            sx={{
              p: 4,
              borderRadius: 3,
              bgcolor: paperBackground,
              border: `1px solid ${borderColor}`,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: isDark 
                ? `0 8px 32px ${alpha('#000000', 0.6)}` 
                : `0 8px 32px ${alpha('#000000', 0.1)}`,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: primaryColor
              }
            }}
          >
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  mb: 2,
                  bgcolor: isDark ? alpha(primaryColor, 0.1) : alpha(primaryColor, 0.05),
                  border: `2px solid ${alpha(primaryColor, 0.2)}`,
                }}
              >
                <img 
                  src={cms}
                  alt="CMS Logo" 
                  style={{ 
                    width: '80%', 
                    height: '80%', 
                    objectFit: 'contain',
                    filter: isDark ? 'brightness(1.2)' : 'none'
                  }}
                />
              </Box>
              
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: primaryColor,
                  mb: 1,
                  textShadow: `0 2px 4px ${alpha(primaryColor, 0.3)}`
                }}
              >
                Advocate CMS
              </Typography>
              
              <Typography
                variant="subtitle1"
                sx={{
                  color: textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}
              >
                <Security fontSize="small" sx={{ color: primaryColor }} />
                Admin Portal
              </Typography>
            </Box>

            <Divider 
              sx={{ 
                mb: 3, 
                opacity: 0.5,
                borderColor: isDark ? alpha('#ffffff', 0.1) : alpha('#000000', 0.1)
              }} 
            />

            {/* Error Alert */}
            {error && (
              <Fade in>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: isDark ? alpha('#f44336', 0.1) : alpha('#f44336', 0.05),
                    color: isDark ? '#ff6b6b' : '#d32f2f',
                    border: `1px solid ${alpha('#f44336', 0.2)}`,
                    '& .MuiAlert-icon': {
                      alignItems: 'center',
                      color: isDark ? '#ff6b6b' : '#d32f2f'
                    }
                  }}
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  required
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: primaryColor }} />
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{
                    sx: { color: textSecondary }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      bgcolor: isDark ? '#0d0c0f' : '#ffffff',
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
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: textPrimary
                    }
                  }}
                />

                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  required
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: primaryColor }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePasswordVisibility}
                          disabled={loading}
                          edge="end"
                          sx={{
                            color: primaryColor,
                            '&:hover': {
                              backgroundColor: alpha(primaryColor, 0.1)
                            }
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{
                    sx: { color: textSecondary }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      bgcolor: isDark ? '#0d0c0f' : '#ffffff',
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
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: textPrimary
                    }
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading || !username || !password}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: primaryColor,
                    color: '#ffffff',
                    boxShadow: `0 8px 32px ${alpha(primaryColor, 0.3)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 40px ${alpha(primaryColor, 0.4)}`,
                      background: primaryColor
                    },
                    '&:disabled': {
                      background: isDark ? alpha('#ffffff', 0.1) : alpha('#000000', 0.12),
                      color: isDark ? alpha('#ffffff', 0.3) : alpha('#000000', 0.26),
                      transform: 'none',
                      boxShadow: 'none'
                    }
                  }}
                >
                  {loading ? 'Signing In...' : 'Sign In to Admin Panel'}
                </Button>

                {/* Sign Up Button */}
                <Button
                  variant="outlined"
                  fullWidth
                  disabled={loading}
                  startIcon={<PersonAdd />}
                  onClick={handleSignUpClick}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderColor: primaryColor,
                    color: primaryColor,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: primaryColor,
                      backgroundColor: alpha(primaryColor, 0.1),
                      transform: 'translateY(-1px)',
                      boxShadow: `0 6px 20px ${alpha(primaryColor, 0.2)}`
                    },
                    '&:disabled': {
                      borderColor: isDark ? alpha('#ffffff', 0.2) : alpha('#000000', 0.2),
                      color: isDark ? alpha('#ffffff', 0.3) : alpha('#000000', 0.26),
                      transform: 'none',
                      boxShadow: 'none'
                    }
                  }}
                >
                  Create New Account
                </Button>
              </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography
                variant="caption"
                sx={{
                  color: textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}
              >
                <Security fontSize="small" sx={{ color: primaryColor }} />
                Secure Admin Access
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;