import React, { useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  TextField, 
  Button, 
  Chip,
  Dialog,
  Slide,
  useMediaQuery,
  useTheme,
  Paper
} from '@mui/material';
import AssistantIcon from '@mui/icons-material/Assistant';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { styled, keyframes } from '@mui/material/styles';
import Draggable from 'react-draggable';

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
`;

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AssistantContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  [theme.breakpoints.down('sm')]: {
    bottom: '40%',
  },
}));

const FloatingButton = styled(IconButton)(({ theme, isopen }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  width: 56,
  height: 56,
  boxShadow: theme.shadows[6],
  transition: 'all 0.3s ease',
  animation: isopen === 'false' ? `${pulse} 2s infinite` : 'none',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.1)',
  },
}));

const DesktopContent = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  marginBottom: theme.spacing(2),
  boxShadow: theme.shadows[8],
  width: 380,
  maxHeight: '70vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  '& .drag-handle': {
    cursor: 'move',
  },
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
  color: theme.palette.common.white,
}));

const Content = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  overflowY: 'auto',
  flexGrow: 1,
  backgroundColor: theme.palette.grey[50],
  minHeight: 300,
  maxHeight: 400,
}));

const Footer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  gap: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
}));

const MessageBubble = styled(Box)(({ theme, isuser }) => ({
  backgroundColor: isuser === 'true' ? theme.palette.primary.main : theme.palette.background.paper,
  color: isuser === 'true' ? theme.palette.common.white : theme.palette.text.primary,
  padding: theme.spacing(1.5, 2),
  borderRadius: 16,
  marginBottom: theme.spacing(1),
  maxWidth: '80%',
  alignSelf: isuser === 'true' ? 'flex-end' : 'flex-start',
  wordWrap: 'break-word',
  boxShadow: isuser === 'true' ? 'none' : theme.shadows[1],
  borderBottomRightRadius: isuser === 'true' ? 4 : 16,
  borderBottomLeftRadius: isuser === 'true' ? 16 : 4,
}));

const AIAssistant = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your AI Assistant. How can I help you today?", isUser: false }
  ]);

  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('chatPosition');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Invalid saved chat position, using default');
      }
    }
    // Default position near bottom-right
    return {
      x: typeof window !== 'undefined' ? window.innerWidth - 420 : 0,
      y: typeof window !== 'undefined' ? window.innerHeight - 500 : 0,
    };
  });

  const nodeRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const quickActions = [
    "View Dashboard",
    "Check Messages",
    "Get Help",
    "Settings"
  ];

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { text: message, isUser: true }]);
      setMessage('');
      
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: "I understand your request. Let me help you with that!", 
          isUser: false 
        }]);
      }, 1000);
    }
  };

  const handleQuickAction = (action) => {
    setMessages([...messages, 
      { text: action, isUser: true },
      { text: `Processing your request for: ${action}`, isUser: false }
    ]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderChatContent = () => (
    <>
      <Header className="drag-handle">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssistantIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            AI Assistant
          </Typography>
        </Box>
        <IconButton 
          size="small" 
          onClick={handleToggle}
          sx={{ color: 'inherit' }}
        >
          <CloseIcon />
        </IconButton>
      </Header>
      
      <Content>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {messages.map((msg, index) => (
            <MessageBubble key={index} isuser={msg.isUser.toString()}>
              <Typography variant="body2">{msg.text}</Typography>
            </MessageBubble>
          ))}
        </Box>
        
        {messages.length === 1 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Quick Actions:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {quickActions.map((action) => (
                <Chip
                  key={action}
                  label={action}
                  onClick={() => handleQuickAction(action)}
                  size="small"
                  clickable
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}
      </Content>
      
      <Footer>
        <TextField
          fullWidth
          size="small"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 28,
            }
          }}
        />
        <Button 
          variant="contained" 
          onClick={handleSendMessage}
          disabled={!message.trim()}
          sx={{ 
            minWidth: 'auto', 
            px: 2,
            borderRadius: 28
          }}
        >
          <SendIcon fontSize="small" />
        </Button>
      </Footer>
    </>
  );

  return (
    <AssistantContainer>
      {/* Mobile: Full Screen Dialog */}
      {isMobile ? (
        <Dialog
          fullScreen
          open={open}
          onClose={handleToggle}
          TransitionComponent={Transition}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
              backgroundColor: 'background.default',
            }}
          >
            {renderChatContent()}
          </Box>
        </Dialog>
      ) : (
        /* Desktop: Draggable chat window */
        <Draggable
          nodeRef={nodeRef}
          handle=".drag-handle"
          position={position}
          onStop={(e, data) => {
            const newPos = { x: data.x, y: data.y };
            setPosition(newPos);
            localStorage.setItem('chatPosition', JSON.stringify(newPos));
          }}
          bounds="body"
        >
          <DesktopContent ref={nodeRef}>
            {renderChatContent()}
          </DesktopContent>
        </Draggable>
      )}

      {/* Floating Button */}
      <FloatingButton 
        onClick={handleToggle} 
        isopen={open.toString()}
      >
        {open ? <CloseIcon /> : <AssistantIcon />}
      </FloatingButton>
    </AssistantContainer>
  );
};

export default AIAssistant;