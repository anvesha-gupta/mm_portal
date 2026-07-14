import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import { useColorMode } from '../context/ColorModeContext';

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7zm0-5a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm0 17a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0v-1a1 1 0 0 1 1-1zM4.22 5.64a1 1 0 0 1 1.42-1.42l.7.71a1 1 0 0 1-1.41 1.41l-.71-.7zm13.02 12.73a1 1 0 0 1 1.42-1.42l.7.71a1 1 0 0 1-1.41 1.41l-.71-.7zM3 12a1 1 0 0 1 1-1h1a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1zm16 0a1 1 0 0 1 1-1h1a1 1 0 0 1 0 2h-1a1 1 0 0 1-1-1zM4.22 18.36l.71-.7a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1-1.41-1.42zm13.02-12.73l.71-.7a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1-1.41-1.42z"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
    </svg>
  );
}

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { mode, toggleColorMode } = useColorMode();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)'}`,
        bgcolor: isDark ? '#090A14' : '#FFFFFF',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 72 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.04em', color: 'text.primary' }}>
            Motiveminds Hub
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Your internal intelligence workspace
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            {user?.name ?? ''}
          </Typography>
          <IconButton
            onClick={toggleColorMode}
            size="small"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            sx={{
              color: 'text.secondary',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
              borderRadius: 1.5,
              p: 0.75,
              '&:hover': {
                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              },
            }}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </IconButton>
          <Button
            onClick={handleLogout}
            size="small"
            variant="outlined"
            sx={{
              fontSize: 11,
              textTransform: 'none',
              color: 'text.secondary',
              borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
              '&:hover': {
                borderColor: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)',
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
