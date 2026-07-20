import { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import { useColorMode } from '../context/ColorModeContext';
import { usePoints } from '../context/PointsContext';
import api from '../services/api';

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  notes: string | null;
  created_at: string;
}

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
  const { balance } = usePoints();
  const navigate = useNavigate();
  const { toggleColorMode } = useColorMode();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [open, setOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api.get('/api/points_transactions/me?limit=20')
      .then(res => setTransactions(res.data))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, [open]);

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
          <Box
            onClick={() => setOpen(true)}
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.75,
              px: 1.5, py: 0.6, borderRadius: 99, cursor: 'pointer',
              backgroundColor: isDark ? 'rgba(168,85,247,0.12)' : 'rgba(168,85,247,0.10)',
              border: '1px solid rgba(168,85,247,0.30)',
              color: '#A855F7', fontWeight: 700, fontSize: 13,
              '&:hover': { backgroundColor: isDark ? 'rgba(168,85,247,0.20)' : 'rgba(168,85,247,0.18)' },
            }}
          >
            ⭐ {balance.toLocaleString()} pts
          </Box>

          {/* Points history modal */}
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                bgcolor: isDark ? '#13131F' : '#fff',
                backgroundImage: 'none',
                borderRadius: 3,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)'}`,
              },
            }}
          >
            <DialogTitle sx={{ pb: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Points History</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                Last 20 transactions
              </Typography>
            </DialogTitle>
            <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
            <DialogContent sx={{
              px: 3, py: 2,
              scrollbarWidth: 'thin',
              scrollbarColor: `rgba(168,85,247,0.5) ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}`,
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-track': { background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)', borderRadius: 99 },
              '&::-webkit-scrollbar-thumb': { background: 'rgba(168,85,247,0.5)', borderRadius: 99 },
              '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(168,85,247,0.8)' },
            }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={28} sx={{ color: '#A855F7' }} />
                </Box>
              ) : transactions.length === 0 ? (
                <Typography sx={{ color: 'text.secondary', fontSize: 13, py: 3, textAlign: 'center' }}>
                  No transactions yet.
                </Typography>
              ) : (
                transactions.map((tx, i) => {
                  const isCredit = tx.amount > 0;
                  return (
                    <Box key={tx.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', py: 1.5, gap: 2 }}>
                        <Box sx={{
                          width: 36, height: 36, borderRadius: 99, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          bgcolor: isCredit ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                          fontSize: 16,
                        }}>
                          {isCredit ? '⬆' : '⬇'}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography noWrap sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>
                            {tx.notes || tx.transaction_type}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                            {new Date(tx.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </Typography>
                        </Box>
                        <Typography sx={{
                          fontSize: 14, fontWeight: 700, flexShrink: 0,
                          color: isCredit ? '#22C55E' : '#EF4444',
                        }}>
                          {isCredit ? '+' : ''}{tx.amount.toLocaleString()} pts
                        </Typography>
                      </Box>
                      {i < transactions.length - 1 && (
                        <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' }} />
                      )}
                    </Box>
                  );
                })
              )}
            </DialogContent>
          </Dialog>

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
