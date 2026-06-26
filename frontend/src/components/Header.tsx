import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function Header() {
  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)', bgcolor: '#090A14' }}>
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 72 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.04em' }}>
            Motiveminds Hub
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
            Your internal intelligence workspace
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.72)' }}>Jane Smith</Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
